"""
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

HTML_PAGE = """<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<meta
name="viewport"
content="width=device-width, initial-scale=1.0"
>

<title>
LoF Titan Alert Rover
</title>


<style>

* {
  box-sizing: border-box;
}

body {

  margin: 0;

  font-family:
  Arial,
  Helvetica,
  sans-serif;

  background:
  linear-gradient(
    135deg,
    #061526,
    #0d3152
  );

  color: white;

  text-align: center;
}


/* =========================================
   HEADER
   ========================================= */

.header {

  background: #06101d;

  padding: 22px;

  font-size: 27px;

  font-weight: bold;

  letter-spacing: 1px;

  box-shadow:
  0px 4px 15px rgba(0,0,0,0.5);
}


/* =========================================
   MAIN CONTAINER
   ========================================= */

.container {

  max-width: 700px;

  margin: auto;

  padding: 20px;
}


/* =========================================
   SECTION TITLE
   ========================================= */

.section-title {

  font-size: 21px;

  font-weight: bold;

  margin-top: 15px;

  margin-bottom: 20px;
}


/* =========================================
   SENSOR CARDS
   ========================================= */

.sensor-container {

  display: flex;

  justify-content: center;

  align-items: center;

  gap: 20px;

  flex-wrap: wrap;
}


.sensor-card {

  width: 270px;

  padding: 22px;

  background: #112d48;

  border-radius: 18px;

  box-shadow:
  0px 6px 20px rgba(0,0,0,0.4);
}


.sensor-name {

  font-size: 20px;

  font-weight: bold;

  margin-bottom: 15px;
}


.status {

  padding: 18px;

  border-radius: 12px;

  font-size: 18px;

  font-weight: bold;

  transition: 0.3s;
}


/* =========================================
   SAFE STATUS
   ========================================= */

.safe {

  background: #16834a;

  box-shadow:
  0px 0px 12px rgba(22,131,74,0.7);
}


/* =========================================
   ALERT STATUS
   ========================================= */

.alert {

  background: #d52d35;

  box-shadow:
  0px 0px 18px rgba(255,0,0,0.8);

  animation:
  alertPulse 0.7s infinite alternate;
}


@keyframes alertPulse {

  from {

    transform: scale(1);
  }

  to {

    transform: scale(1.05);
  }
}


/* =========================================
   MOTOR CONTROL PANEL
   ========================================= */

.control-panel {

  margin-top: 30px;

  padding: 25px;

  background: #112d48;

  border-radius: 18px;

  box-shadow:
  0px 6px 20px rgba(0,0,0,0.4);
}


/* =========================================
   CONTROL GRID
   ========================================= */

.control-grid {

  display: grid;

  grid-template-columns:
  100px
  100px
  100px;

  gap: 15px;

  justify-content: center;

  margin-top: 20px;
}


/* =========================================
   CONTROL BUTTONS
   ========================================= */

button {

  width: 100px;

  height: 65px;

  border: none;

  border-radius: 14px;

  background: #178ce5;

  color: white;

  font-size: 15px;

  font-weight: bold;

  cursor: pointer;

  box-shadow:
  0px 5px 12px rgba(0,0,0,0.5);

  touch-action: none;

  user-select: none;
}


button:hover {

  background: #0d75c4;
}


button:active {

  transform: scale(0.92);
}


/* =========================================
   STOP BUTTON
   ========================================= */

.stop-button {

  background: #e02e38;
}


.stop-button:hover {

  background: #bb2029;
}


/* =========================================
   EMPTY GRID
   ========================================= */

.blank {

  visibility: hidden;
}


/* =========================================
   CONNECTION
   ========================================= */

.connection {

  margin-top: 25px;

  padding: 10px;

  font-size: 14px;

  color: #a6cce8;
}


.online-dot {

  display: inline-block;

  width: 10px;

  height: 10px;

  background: #24d264;

  border-radius: 50%;

  margin-right: 6px;
}


/* =========================================
   MOBILE
   ========================================= */

@media(max-width: 420px) {

  .header {

    font-size: 21px;
  }


  .control-grid {

    grid-template-columns:
    85px
    85px
    85px;
  }


  button {

    width: 85px;

    font-size: 13px;
  }
}

</style>

</head>


<body>


<!-- =====================================
     HEADER
     ===================================== -->

<div class="header">

LOF TITAN ALERT ROVER

</div>


<div class="container">


<!-- =====================================
     SENSOR STATUS
     ===================================== -->

<div class="section-title">

LIVE SENSOR STATUS

</div>


<div class="sensor-container">


<!-- =====================================
     MOTION SENSOR
     ===================================== -->

<div class="sensor-card">

<div class="sensor-name">

MOTION SENSOR

</div>


<div
id="motion"
class="status safe"
>

NO MOTION

</div>

</div>


<!-- =====================================
     WATER SENSOR
     ===================================== -->

<div class="sensor-card">

<div class="sensor-name">

WATER SENSOR

</div>


<div
id="water"
class="status safe"
>

NO WATER

</div>

</div>


</div>


<!-- =====================================
     ROVER CONTROL
     ===================================== -->

<div class="control-panel">


<div class="section-title">

ROVER CONTROL

</div>


<div class="control-grid">


<!-- ROW 1 -->

<div class="blank"></div>


<button

onpointerdown="
startMove('/forward')
"

onpointerup="
stopMove()
"

onpointerleave="
stopMove()
"

onpointercancel="
stopMove()
"

>

FORWARD

</button>


<div class="blank"></div>


<!-- ROW 2 -->

<button

onpointerdown="
startMove('/left')
"

onpointerup="
stopMove()
"

onpointerleave="
stopMove()
"

onpointercancel="
stopMove()
"

>

LEFT

</button>


<button

class="stop-button"

onclick="
sendCommand('/stop')
"

>

STOP

</button>


<button

onpointerdown="
startMove('/right')
"

onpointerup="
stopMove()
"

onpointerleave="
stopMove()
"

onpointercancel="
stopMove()
"

>

RIGHT

</button>


<!-- ROW 3 -->

<div class="blank"></div>


<button

onpointerdown="
startMove('/backward')
"

onpointerup="
stopMove()
"

onpointerleave="
stopMove()
"

onpointercancel="
stopMove()
"

>

BACKWARD

</button>


<div class="blank"></div>


</div>

</div>


<!-- =====================================
     CONNECTION
     ===================================== -->

<div class="connection">

<span class="online-dot"></span>

ESP32-S3 Direct Wi-Fi Dashboard

<br><br>

Connect to: LOF_TITAN_ROVER<br><br>Open: 192.168.4.1

</div>


</div>


<script>

// ==========================================
// MOTOR CONTROL
// ==========================================

let moving = false;


function sendCommand(command) {

  fetch(
    command,
    {
      cache: "no-store"
    }
  )

  .catch(error => {

    console.log(
      "Command Error",
      error
    );

  });
}


// ==========================================
// START MOVEMENT
// ==========================================

function startMove(command) {

  moving = true;

  sendCommand(command);
}


// ==========================================
// STOP MOVEMENT
// ==========================================

function stopMove() {

  if(moving) {

    moving = false;

    sendCommand('/stop');
  }
}


// ==========================================
// SENSOR UPDATE
// ==========================================

function updateSensors() {

  fetch(
    '/status',
    {
      cache: 'no-store'
    }
  )

  .then(response => response.json())

  .then(data => {


    // ======================================
    // MOTION
    // ======================================

    let motion =
    document.getElementById(
      "motion"
    );


    if(data.motion === true) {

      motion.innerHTML =
      "MOTION DETECTED";

      motion.className =
      "status alert";
    }

    else {

      motion.innerHTML =
      "NO MOTION";

      motion.className =
      "status safe";
    }


    // ======================================
    // WATER
    // ======================================

    let water =
    document.getElementById(
      "water"
    );


    if(data.water === true) {

      water.innerHTML =
      "WATER DETECTED";

      water.className =
      "status alert";
    }

    else {

      water.innerHTML =
      "NO WATER";

      water.className =
      "status safe";
    }

  })

  .catch(error => {

    console.log(
      "Dashboard connection error"
    );

  });
}


// Update every 500 ms

setInterval(
  updateSensors,
  500
);


// First update immediately

updateSensors();


// Stop rover if browser loses focus

window.addEventListener(
  "blur",
  function() {

    sendCommand('/stop');

    moving = false;
  }
);


// Stop rover before page closes

window.addEventListener(
  "beforeunload",
  function() {

    sendCommand('/stop');
  }
);

</script>


</body>

</html>"""

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

                    req_line = request.split('\r\n')[0]
                    parts = req_line.split(' ')
                    if len(parts) < 2:
                        client.close()
                        continue

                    path = parts[1]

                    if path == '/' or path == '/index.html':
                        resp = "HTTP/1.1 200 OK\r\nContent-Type: text/html; charset=utf-8\r\nConnection: close\r\n\r\n" + HTML_PAGE
                        client.sendall(resp.encode('utf-8'))

                    elif path == '/status':
                        motion_str = "true" if self.motion_detected else "false"
                        water_str = "true" if self.water_detected else "false"
                        json_data = f'{"motion":{motion_str},"water":{water_str}}'
                        resp = "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nConnection: close\r\n\r\n" + json_data
                        client.sendall(resp.encode('utf-8'))

                    elif path == '/forward':
                        self.forward()
                        resp = "HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nConnection: close\r\n\r\nFORWARD"
                        client.sendall(resp.encode('utf-8'))

                    elif path == '/backward':
                        self.backward()
                        resp = "HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nConnection: close\r\n\r\nBACKWARD"
                        client.sendall(resp.encode('utf-8'))

                    elif path == '/left':
                        self.left()
                        resp = "HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nConnection: close\r\n\r\nLEFT"
                        client.sendall(resp.encode('utf-8'))

                    elif path == '/right':
                        self.right()
                        resp = "HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nConnection: close\r\n\r\nRIGHT"
                        client.sendall(resp.encode('utf-8'))

                    elif path == '/stop':
                        self.stop_motors()
                        resp = "HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nConnection: close\r\n\r\nSTOP"
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
        print("\nStopping AquaNova Alert Rover...")
    finally:
        rover.cleanup()
        hw.set_leds_disconnected()
        print("Rover stopped safely.")

if __name__ == "__main__":
    main()
