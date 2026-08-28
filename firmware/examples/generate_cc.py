import re

with open('Aqua_nova.ino', 'r') as f:
    ino_content = f.read()

# Extract the HTML page
html_match = re.search(r'const char MAIN_PAGE\[\] PROGMEM = R"rawliteral\(\s*(.*?)\s*\)rawliteral";', ino_content, re.DOTALL)
html_str = html_match.group(1) if html_match else ""

# Prepare the MicroPython code
mpy_code = f'''"""
AquaNova - Environmental Water & Motion Alert Rover
Exact MicroPython Carbon-Copy of Aqua_nova.ino for LOF TITAN Firmware
"""
import time
import socket
import select
import network
import gc
from machine import Pin, PWM, I2C
from supervisor.led_buzzer import hw

# Motor Pins
L_IN1 = 11
L_IN2 = 12
R_IN1 = 9
R_IN2 = 10

# Sensor Pins
PIR_PIN = 2     # GPIO 2
WATER_PIN = 4   # GPIO 4

# OLED Pins
OLED_SDA = 7
OLED_SCL = 8

PWM_FREQ = 5000
MOTOR_SPEED = 100

HTML_PAGE = """{html_str}"""

class AquaNovaRover:
    def __init__(self):
        self.motion_detected = False
        self.water_detected = False
        self.prev_motion = False
        self.prev_water = False

        # Deinit existing PWM
        for p in (L_IN1, L_IN2, R_IN1, R_IN2):
            try:
                PWM(Pin(p)).deinit()
            except Exception:
                pass

        # Motor PWMs
        self.pwm_l1 = PWM(Pin(L_IN1), freq=PWM_FREQ, duty_u16=0)
        self.pwm_l2 = PWM(Pin(L_IN2), freq=PWM_FREQ, duty_u16=0)
        self.pwm_r1 = PWM(Pin(R_IN1), freq=PWM_FREQ, duty_u16=0)
        self.pwm_r2 = PWM(Pin(R_IN2), freq=PWM_FREQ, duty_u16=0)

        self.pir = Pin(PIR_PIN, Pin.IN)
        self.water = Pin(WATER_PIN, Pin.IN)

        self.oled = None
        try:
            from ssd1306 import SSD1306_I2C
            i2c = I2C(0, scl=Pin(OLED_SCL), sda=Pin(OLED_SDA), freq=400000)
            self.oled = SSD1306_I2C(128, 64, i2c)
        except Exception:
            self.oled = None

        self.stop_motors()
        self.update_oled()

        # WiFi SoftAP Setup
        self.ap = network.WLAN(network.AP_IF)
        self.ap.active(True)
        self.ap.config(essid="LOF_TITAN_ROVER", password="12345678")
        self.ap.ifconfig(('192.168.4.1', '255.255.255.0', '192.168.4.1', '8.8.8.8'))
        time.sleep_ms(200)

        # Web Server Socket
        self.server_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.server_sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.server_sock.bind(('0.0.0.0', 80))
        self.server_sock.listen(5)
        self.server_sock.setblocking(False)

        self.poller = select.poll()
        self.poller.register(self.server_sock, select.POLLIN)

    def _pwm_write(self, pwm_pin, val):
        val = max(0, min(255, val))
        pwm_pin.duty_u16(int((val / 255.0) * 65535))

    def leftMotorForward(self):
        self._pwm_write(self.pwm_l1, MOTOR_SPEED)
        self._pwm_write(self.pwm_l2, 0)

    def leftMotorBackward(self):
        self._pwm_write(self.pwm_l1, 0)
        self._pwm_write(self.pwm_l2, MOTOR_SPEED)

    def rightMotorForward(self):
        self._pwm_write(self.pwm_r1, MOTOR_SPEED)
        self._pwm_write(self.pwm_r2, 0)

    def rightMotorBackward(self):
        self._pwm_write(self.pwm_r1, 0)
        self._pwm_write(self.pwm_r2, MOTOR_SPEED)

    def stop_motors(self):
        self._pwm_write(self.pwm_l1, 0)
        self._pwm_write(self.pwm_l2, 0)
        self._pwm_write(self.pwm_r1, 0)
        self._pwm_write(self.pwm_r2, 0)

    def forward(self):
        self.leftMotorForward()
        self.rightMotorForward()
        print("ROVER -> FORWARD")

    def backward(self):
        self.leftMotorBackward()
        self.rightMotorBackward()
        print("ROVER -> BACKWARD")

    def left(self):
        self.leftMotorBackward()
        self.rightMotorForward()
        print("ROVER -> LEFT")

    def right(self):
        self.leftMotorForward()
        self.rightMotorBackward()
        print("ROVER -> RIGHT")

    def update_oled(self):
        if not self.oled: return
        try:
            self.oled.fill(0)
            if self.motion_detected and self.water_detected:
                self.oled.text("Motion Detected!", 0, 20)
                self.oled.text("Water Detected!", 0, 45)
            elif self.motion_detected:
                self.oled.text("ALERT!", 35, 18)
                self.oled.text("Motion Detected!", 0, 43)
            elif self.water_detected:
                self.oled.text("ALERT!", 35, 18)
                self.oled.text("Water Detected!", 0, 43)
            else:
                self.oled.text("SYSTEM SAFE", 20, 25)
                self.oled.text("No Alert", 25, 48)
            self.oled.show()
        except Exception:
            pass

    def check_sensors(self):
        self.motion_detected = (self.pir.value() == 1)
        self.water_detected = (self.water.value() == 1)

        if self.motion_detected != self.prev_motion:
            if self.motion_detected:
                print("ALERT: MOTION DETECTED")
            else:
                print("MOTION: CLEAR")
            self.prev_motion = self.motion_detected

        if self.water_detected != self.prev_water:
            if self.water_detected:
                print("ALERT: WATER DETECTED")
            else:
                print("WATER: CLEAR")
            self.prev_water = self.water_detected

        self.update_oled()

    def handle_client(self):
        events = self.poller.poll(0)
        if not events: return

        for sock, evt in events:
            if evt & select.POLLIN:
                try:
                    client, _ = self.server_sock.accept()
                    client.settimeout(1.0)
                    request = client.recv(1024).decode('utf-8')
                    if not request:
                        client.close()
                        continue

                    req_line = request.split('\\r\\n')[0]
                    parts = req_line.split(' ')
                    if len(parts) < 2:
                        client.close()
                        continue

                    path = parts[1]

                    if path == '/' or path == '/index.html':
                        resp = "HTTP/1.1 200 OK\\r\\nContent-Type: text/html; charset=utf-8\\r\\nConnection: close\\r\\n\\r\\n" + HTML_PAGE
                        client.sendall(resp.encode('utf-8'))

                    elif path == '/status':
                        motion_str = "true" if self.motion_detected else "false"
                        water_str = "true" if self.water_detected else "false"
                        json_data = f'{{"motion":{{motion_str}},"water":{{water_str}}}}'
                        resp = "HTTP/1.1 200 OK\\r\\nContent-Type: application/json\\r\\nConnection: close\\r\\n\\r\\n" + json_data
                        client.sendall(resp.encode('utf-8'))

                    elif path == '/forward':
                        self.forward()
                        resp = "HTTP/1.1 200 OK\\r\\nContent-Type: text/plain\\r\\nConnection: close\\r\\n\\r\\nFORWARD"
                        client.sendall(resp.encode('utf-8'))

                    elif path == '/backward':
                        self.backward()
                        resp = "HTTP/1.1 200 OK\\r\\nContent-Type: text/plain\\r\\nConnection: close\\r\\n\\r\\nBACKWARD"
                        client.sendall(resp.encode('utf-8'))

                    elif path == '/left':
                        self.left()
                        resp = "HTTP/1.1 200 OK\\r\\nContent-Type: text/plain\\r\\nConnection: close\\r\\n\\r\\nLEFT"
                        client.sendall(resp.encode('utf-8'))

                    elif path == '/right':
                        self.right()
                        resp = "HTTP/1.1 200 OK\\r\\nContent-Type: text/plain\\r\\nConnection: close\\r\\n\\r\\nRIGHT"
                        client.sendall(resp.encode('utf-8'))

                    elif path == '/stop':
                        self.stop_motors()
                        resp = "HTTP/1.1 200 OK\\r\\nContent-Type: text/plain\\r\\nConnection: close\\r\\n\\r\\nSTOP"
                        client.sendall(resp.encode('utf-8'))

                    else:
                        resp = "HTTP/1.1 404 Not Found\\r\\nConnection: close\\r\\n\\r\\nNot Found"
                        client.sendall(resp.encode('utf-8'))

                    client.close()
                except Exception:
                    try:
                        client.close()
                    except Exception:
                        pass

    def cleanup(self):
        self.stop_motors()
        try:
            self.server_sock.close()
        except Exception:
            pass

def main():
    print("==================================")
    print("      LOF TITAN ALERT ROVER")
    print("      DIRECT ESP32 WI-FI MODE")
    print("==================================")

    hw.play_startup_tone()
    hw.set_leds_connected()

    rover = AquaNovaRover()

    print("==================================")
    print("SYSTEM READY")
    print("CONNECT TO WIFI : LOF_TITAN_ROVER")
    print("PASSWORD        : 12345678")
    print("OPEN BROWSER    : http://192.168.4.1")
    print("==================================")

    last_sensor_check = time.ticks_ms()

    try:
        while True:
            rover.handle_client()

            now = time.ticks_ms()
            if time.ticks_diff(now, last_sensor_check) >= 300:
                last_sensor_check = now
                rover.check_sensors()

            time.sleep_ms(10)
            gc.collect()

    except KeyboardInterrupt:
        print("\\nStopping AquaNova Alert Rover...")
    finally:
        rover.cleanup()
        hw.set_leds_disconnected()
        print("Rover stopped safely.")

if __name__ == "__main__":
    main()
'''

# Fix f-string templating issue by replacing {motion_str} manually
mpy_code = mpy_code.replace("{{motion_str}}", "{motion_str}").replace("{{water_str}}", "{water_str}")

with open('aqua_nova.py', 'w', encoding='utf-8') as f:
    f.write(mpy_code)

print("aqua_nova.py created successfully!")
