"""
ESP32-S3 3 UV Rover - Invisible Line Patrol
Exact MicroPython Carbon-Copy of invisible_linepatrol.ino for LOF TITAN Firmware

Features:
- WiFi SoftAP: SSID="ESP32S3_3UV_ROVER", Password="12345678", IP=192.168.4.1
- Embedded Non-Blocking Web Server (Port 80) with full interactive web dashboard
- 3 UV Sensor Autonomous Line Tracking (120ms cycle)
- Manual Touch D-Pad Web Control
- Live Speed & UV Threshold adjustment
"""

import time
import socket
import select
import network
import gc
from machine import Pin, PWM, ADC
from supervisor.led_buzzer import hw

# ================= MOTOR PINS =================
# Left Motor M1
L_IN1 = 15
L_IN2 = 16

# Right Motor M2
R_IN1 = 13
R_IN2 = 14

# ================= UV SENSOR PINS =================
UV_FRONT_PIN = 1   # GPIO 1 (S2)
UV_LEFT_PIN  = 2   # GPIO 2 (S1)
UV_RIGHT_PIN = 3   # GPIO 3 (S3)

# ================= PWM SETTINGS =================
PWM_FREQ = 5000

# ================= HTML WEB PAGE (Exact Carbon Copy) =================
HTML_PAGE = """<!DOCTYPE html>
<html>
<head>
  <title>ESP32-S3 3 UV Rover</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
      background: #101820;
      color: white;
      text-align: center;
    }
    h1 {
      margin-top: 20px;
      font-size: 26px;
      color: #00e5ff;
    }
    .box {
      background: #1b263b;
      width: 88%;
      max-width: 430px;
      margin: 15px auto;
      padding: 15px;
      border-radius: 18px;
      font-size: 18px;
    }
    .value {
      font-size: 22px;
      color: #ffd166;
      font-weight: bold;
    }
    .action {
      font-size: 24px;
      color: #90ee90;
      font-weight: bold;
      margin-top: 10px;
    }
    .modeBtn {
      width: 160px;
      height: 55px;
      border: none;
      border-radius: 15px;
      margin: 8px;
      font-size: 17px;
      font-weight: bold;
      color: white;
      cursor: pointer;
    }
    .auto {
      background: #2a9d8f;
    }
    .manual {
      background: #6c63ff;
    }
    .controller {
      display: grid;
      grid-template-columns: 95px 95px 95px;
      grid-template-rows: 95px 95px 95px;
      gap: 14px;
      justify-content: center;
      align-items: center;
      margin-top: 20px;
    }
    .btn {
      width: 95px;
      height: 95px;
      border: none;
      border-radius: 25px;
      background: linear-gradient(145deg, #00b4d8, #0077b6);
      color: white;
      font-size: 34px;
      font-weight: bold;
      box-shadow: 0 7px 0 #023e8a;
      user-select: none;
      touch-action: none;
      cursor: pointer;
    }
    .btn:active {
      transform: translateY(5px);
      box-shadow: 0 2px 0 #023e8a;
    }
    .stop {
      background: linear-gradient(145deg, #ff4d4d, #c9184a);
      box-shadow: 0 7px 0 #800f2f;
      font-size: 20px;
    }
    .sliderBox {
      background: #1b263b;
      width: 85%;
      max-width: 400px;
      margin: 18px auto;
      padding: 15px;
      border-radius: 18px;
    }
    input[type=range] {
      width: 90%;
    }
    .footer {
      margin-top: 22px;
      font-size: 14px;
      color: #aaa;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <h1>ESP32-S3 3 UV Rover</h1>

  <div class="box">
    <div>Front UV: <span class="value" id="frontUV">0</span></div>
    <div>Left UV: <span class="value" id="leftUV">0</span></div>
    <div>Right UV: <span class="value" id="rightUV">0</span></div>
    <div class="action" id="actionText">STOP</div>
    <div>Mode: <span id="modeText">AUTO UV</span></div>
  </div>

  <button class="modeBtn auto" onclick="setMode('auto')">AUTO UV</button>
  <button class="modeBtn manual" onclick="setMode('manual')">MANUAL</button>

  <div class="controller">
    <div></div>
    <button class="btn"
      onpointerdown="sendCmd('forward')"
      onpointerup="sendCmd('stop')"
      onpointerleave="sendCmd('stop')">&#9650;</button>
    <div></div>

    <button class="btn"
      onpointerdown="sendCmd('left')"
      onpointerup="sendCmd('stop')"
      onpointerleave="sendCmd('stop')">&#9664;</button>
    <button class="btn stop" onclick="sendCmd('stop')">STOP</button>
    <button class="btn"
      onpointerdown="sendCmd('right')"
      onpointerup="sendCmd('stop')"
      onpointerleave="sendCmd('stop')">&#9654;</button>

    <div></div>
    <button class="btn"
      onpointerdown="sendCmd('backward')"
      onpointerup="sendCmd('stop')"
      onpointerleave="sendCmd('stop')">&#9660;</button>
    <div></div>
  </div>

  <div class="sliderBox">
    <h2>Motor Speed</h2>
    <input type="range" min="0" max="255" value="170" id="speedSlider" oninput="updateSpeed(this.value)">
    <div>Speed: <span id="speedValue">170</span></div>
  </div>

  <div class="sliderBox">
    <h2>UV Threshold</h2>
    <input type="range" min="0" max="4095" value="300" id="uvSlider" oninput="updateThreshold(this.value)">
    <div>Threshold: <span id="thresholdValue">300</span></div>
  </div>

  <div class="footer">
    WiFi: ESP32S3_3UV_ROVER<br>
    Password: 12345678<br>
    Open: 192.168.4.1
  </div>

<script>
  function sendCmd(cmd) {
    fetch('/cmd?move=' + cmd);
  }
  function setMode(mode) {
    fetch('/mode?value=' + mode);
  }
  function updateSpeed(value) {
    document.getElementById('speedValue').innerHTML = value;
    fetch('/speed?value=' + value);
  }
  function updateThreshold(value) {
    document.getElementById('thresholdValue').innerHTML = value;
    fetch('/threshold?value=' + value);
  }
  function updateStatus() {
    fetch('/status')
      .then(response => response.json())
      .then(data => {
        document.getElementById('frontUV').innerHTML = data.front;
        document.getElementById('leftUV').innerHTML = data.left;
        document.getElementById('rightUV').innerHTML = data.right;
        document.getElementById('actionText').innerHTML = data.action;
        document.getElementById('modeText').innerHTML = data.mode;
      })
      .catch(err => console.log(err));
  }
  setInterval(updateStatus, 500);
  updateStatus();
</script>
</body>
</html>
"""


class InvisibleLinePatrolRover:
    def __init__(self):
        # Settings (identical to Arduino defaults)
        self.motor_speed = 170
        self.uv_threshold = 300
        self.uv_margin = 80
        self.auto_uv_mode = True
        self.current_action = "STOP"

        self.front_uv = 0
        self.left_uv = 0
        self.right_uv = 0

        # Deinit any existing PWM channels
        for p in (L_IN1, L_IN2, R_IN1, R_IN2):
            try:
                PWM(Pin(p)).deinit()
            except Exception:
                pass

        # Motor PWM Initialization
        self.pwm_l1 = PWM(Pin(L_IN1), freq=PWM_FREQ, duty_u16=0)
        self.pwm_l2 = PWM(Pin(L_IN2), freq=PWM_FREQ, duty_u16=0)
        self.pwm_r1 = PWM(Pin(R_IN1), freq=PWM_FREQ, duty_u16=0)
        self.pwm_r2 = PWM(Pin(R_IN2), freq=PWM_FREQ, duty_u16=0)

        # UV Sensor ADC Initialization (12-bit: 0..4095)
        self.adc_front = ADC(Pin(UV_FRONT_PIN))
        self.adc_left  = ADC(Pin(UV_LEFT_PIN))
        self.adc_right = ADC(Pin(UV_RIGHT_PIN))
        self.adc_front.atten(ADC.ATTN_11DB)
        self.adc_left.atten(ADC.ATTN_11DB)
        self.adc_right.atten(ADC.ATTN_11DB)

        self.stop_motors()

        # WiFi SoftAP Setup
        self.ap = network.WLAN(network.AP_IF)
        self.ap.active(True)
        self.ap.config(essid="ESP32S3_3UV_ROVER", password="12345678")
        time.sleep_ms(200)

        # Web Server Socket Setup (Non-blocking)
        self.server_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.server_sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.server_sock.bind(('0.0.0.0', 80))
        self.server_sock.listen(5)
        self.server_sock.setblocking(False)

        # Poller for non-blocking network handling
        self.poller = select.poll()
        self.poller.register(self.server_sock, select.POLLIN)

    # ================= PWM & MOTOR FUNCTIONS =================
    def _pwm_write_pin(self, pwm_pin, value):
        val = max(0, min(255, int(value)))
        duty = int((val / 255.0) * 65535)
        pwm_pin.duty_u16(duty)

    def left_motor_forward(self, spd):
        self._pwm_write_pin(self.pwm_l1, spd)
        self._pwm_write_pin(self.pwm_l2, 0)

    def left_motor_backward(self, spd):
        self._pwm_write_pin(self.pwm_l1, 0)
        self._pwm_write_pin(self.pwm_l2, spd)

    def right_motor_forward(self, spd):
        self._pwm_write_pin(self.pwm_r1, spd)
        self._pwm_write_pin(self.pwm_r2, 0)

    def right_motor_backward(self, spd):
        self._pwm_write_pin(self.pwm_r1, 0)
        self._pwm_write_pin(self.pwm_r2, spd)

    def stop_motors(self):
        self._pwm_write_pin(self.pwm_l1, 0)
        self._pwm_write_pin(self.pwm_l2, 0)
        self._pwm_write_pin(self.pwm_r1, 0)
        self._pwm_write_pin(self.pwm_r2, 0)
        self.current_action = "STOP"

    def forward(self):
        self.left_motor_forward(self.motor_speed)
        self.right_motor_forward(self.motor_speed)
        self.current_action = "FORWARD"

    def backward(self):
        self.left_motor_backward(self.motor_speed)
        self.right_motor_backward(self.motor_speed)
        self.current_action = "BACKWARD"

    def left_turn(self):
        self.left_motor_backward(self.motor_speed)
        self.right_motor_forward(self.motor_speed)
        self.current_action = "LEFT"

    def right_turn(self):
        self.left_motor_forward(self.motor_speed)
        self.right_motor_backward(self.motor_speed)
        self.current_action = "RIGHT"

    # ================= UV SENSOR READING =================
    def read_average_uv(self, adc):
        total = 0
        for _ in range(10):
            # Scale 16-bit MicroPython ADC to 12-bit (0-4095)
            total += (adc.read_u16() >> 4)
            time.sleep_ms(2)
        return total // 10

    # ================= AUTO UV CONTROL =================
    def auto_uv_control(self):
        self.front_uv = self.read_average_uv(self.adc_front)
        self.left_uv  = self.read_average_uv(self.adc_left)
        self.right_uv = self.read_average_uv(self.adc_right)

        front_detected = self.front_uv > self.uv_threshold
        left_detected  = self.left_uv > self.uv_threshold
        right_detected = self.right_uv > self.uv_threshold

        act_log = ""
        # No UV detected -> STOP
        if not front_detected and not left_detected and not right_detected:
            self.stop_motors()
            act_log = "NO UV -> STOP"
        # Move toward strongest UV direction
        elif self.front_uv >= (self.left_uv + self.uv_margin) and self.front_uv >= (self.right_uv + self.uv_margin):
            self.forward()
            act_log = "FRONT UV -> FORWARD"
        elif self.left_uv > (self.right_uv + self.uv_margin):
            self.left_turn()
            act_log = "LEFT UV -> LEFT"
        elif self.right_uv > (self.left_uv + self.uv_margin):
            self.right_turn()
            act_log = "RIGHT UV -> RIGHT"
        else:
            self.forward()
            act_log = "BALANCED UV -> FORWARD"

        print(f"F={self.front_uv} | L={self.left_uv} | R={self.right_uv} | TH={self.uv_threshold} | ACT={act_log}")

    # ================= HTTP REQUEST HANDLER =================
    def handle_client(self):
        events = self.poller.poll(0)
        if not events:
            return

        for sock, evt in events:
            if evt & select.POLLIN:
                try:
                    client, _ = self.server_sock.accept()
                    client.settimeout(1.0)
                    request = client.recv(1024).decode('utf-8')
                    if not request:
                        client.close()
                        continue

                    # Parse request line: "GET /path?query HTTP/1.1"
                    req_line = request.split('\r\n')[0]
                    parts = req_line.split(' ')
                    if len(parts) < 2:
                        client.close()
                        continue

                    path = parts[1]

                    # Route: /
                    if path == '/' or path == '/index.html':
                        resp = (
                            "HTTP/1.1 200 OK\r\n"
                            "Content-Type: text/html; charset=utf-8\r\n"
                            "Connection: close\r\n\r\n" + HTML_PAGE
                        )
                        client.sendall(resp.encode('utf-8'))

                    # Route: /cmd?move=...
                    elif path.startswith('/cmd'):
                        self.auto_uv_mode = False
                        move_cmd = "stop"
                        if 'move=' in path:
                            move_cmd = path.split('move=')[1].split('&')[0].split(' ')[0]

                        if move_cmd == 'forward':
                            self.forward()
                        elif move_cmd == 'backward':
                            self.backward()
                        elif move_cmd == 'left':
                            self.left_turn()
                        elif move_cmd == 'right':
                            self.right_turn()
                        elif move_cmd == 'stop':
                            self.stop_motors()

                        print(f"Manual Command: {move_cmd}")
                        resp = "HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nConnection: close\r\n\r\nOK"
                        client.sendall(resp.encode('utf-8'))

                    # Route: /mode?value=...
                    elif path.startswith('/mode'):
                        if 'value=' in path:
                            mode_val = path.split('value=')[1].split('&')[0].split(' ')[0]
                            if mode_val == 'auto':
                                self.auto_uv_mode = True
                                print("Mode: AUTO UV")
                            elif mode_val == 'manual':
                                self.auto_uv_mode = False
                                self.stop_motors()
                                print("Mode: MANUAL")

                        resp = "HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nConnection: close\r\n\r\nMode OK"
                        client.sendall(resp.encode('utf-8'))

                    # Route: /speed?value=...
                    elif path.startswith('/speed'):
                        if 'value=' in path:
                            val_str = path.split('value=')[1].split('&')[0].split(' ')[0]
                            try:
                                self.motor_speed = max(0, min(255, int(val_str)))
                                print(f"Motor Speed: {self.motor_speed}")
                            except Exception:
                                pass

                        resp = "HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nConnection: close\r\n\r\nSpeed OK"
                        client.sendall(resp.encode('utf-8'))

                    # Route: /threshold?value=...
                    elif path.startswith('/threshold'):
                        if 'value=' in path:
                            val_str = path.split('value=')[1].split('&')[0].split(' ')[0]
                            try:
                                self.uv_threshold = max(0, min(4095, int(val_str)))
                                print(f"UV Threshold: {self.uv_threshold}")
                            except Exception:
                                pass

                        resp = "HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nConnection: close\r\n\r\nThreshold OK"
                        client.sendall(resp.encode('utf-8'))

                    # Route: /status
                    elif path.startswith('/status'):
                        self.front_uv = self.read_average_uv(self.adc_front)
                        self.left_uv  = self.read_average_uv(self.adc_left)
                        self.right_uv = self.read_average_uv(self.adc_right)
                        mode_name = "AUTO UV" if self.auto_uv_mode else "MANUAL"

                        json_data = (
                            f'{{"front":{self.front_uv},'
                            f'"left":{self.left_uv},'
                            f'"right":{self.right_uv},'
                            f'"action":"{self.current_action}",'
                            f'"mode":"{mode_name}"}}'
                        )
                        resp = (
                            "HTTP/1.1 200 OK\r\n"
                            "Content-Type: application/json\r\n"
                            "Connection: close\r\n\r\n" + json_data
                        )
                        client.sendall(resp.encode('utf-8'))

                    else:
                        resp = "HTTP/1.1 404 Not Found\r\nConnection: close\r\n\r\nNot Found"
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
    print()
    print("ESP32-S3 3 UV Rover Started")
    print("WiFi Name: ESP32S3_3UV_ROVER")
    print("Password: 12345678")
    print("Open IP: 192.168.4.1")

    hw.play_startup_tone()
    hw.set_leds_connected()

    rover = InvisibleLinePatrolRover()
    print("Web Server Started")
    print("AUTO UV MODE STARTED")

    last_uv_check = time.ticks_ms()

    try:
        while True:
            # Handle incoming web clients non-blockingly
            rover.handle_client()

            # Run autonomous UV tracking loop every 120ms
            if rover.auto_uv_mode:
                now = time.ticks_ms()
                if time.ticks_diff(now, last_uv_check) >= 120:
                    last_uv_check = now
                    rover.auto_uv_control()

            time.sleep_ms(10)
            gc.collect()

    except KeyboardInterrupt:
        print("\nStopping Invisible Line Patrol Rover...")
    finally:
        rover.cleanup()
        hw.set_leds_disconnected()
        print("Rover stopped safely.")


if __name__ == "__main__":
    main()
