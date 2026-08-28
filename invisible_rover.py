# ==============================================================================
# LOF TITAN - 3-UV SENSOR INVISIBLE LINE PATROL ROVER WITH WEB CONTROLLER
# Exact MicroPython Carbon Copy of invisible_linepatrol.ino
# ------------------------------------------------------------------------------
# Wi-Fi AP:    SSID: "ESP32S3_3UV_ROVER" | Password: "12345678"
# Web UI:      http://192.168.4.1
# Motor M1:    Left Motor (GPIO 15, 16)
# Motor M2:    Right Motor (GPIO 13, 14)
# UV Sensors:  Front: S2 (GPIO 1) | Left: S1 (GPIO 2) | Right: S3 (GPIO 3)
# ==============================================================================

import time
import network
import socket
import select
from machine import Pin, PWM, ADC
from supervisor.led_buzzer import hw

# ================= WIFI ACCESS POINT CONFIG =================
WIFI_SSID = "ESP32S3_3UV_ROVER"
WIFI_PASS = "12345678"

# ================= MOTOR PINOUT (LOF TITAN) =================
# Left Motor (M1)
PIN_L_IN1 = 15
PIN_L_IN2 = 16

# Right Motor (M2)
PIN_R_IN1 = 13
PIN_R_IN2 = 14

# ================= UV SENSOR PINS =================
PIN_UV_FRONT = 1  # S2 (GPIO 1)
PIN_UV_LEFT  = 2  # S1 (GPIO 2)
PIN_UV_RIGHT = 3  # S3 (GPIO 3)

# ================= ANALOG SENSOR SETUP =================
adc_front = ADC(Pin(PIN_UV_FRONT), atten=ADC.ATTN_11DB)
adc_left  = ADC(Pin(PIN_UV_LEFT), atten=ADC.ATTN_11DB)
adc_right = ADC(Pin(PIN_UV_RIGHT), atten=ADC.ATTN_11DB)

# ================= PWM POOL MANAGER =================
_pwm_pool = {}
def _get_pwm(pin, freq=5000):
    if pin not in _pwm_pool:
        _pwm_pool[pin] = PWM(Pin(pin), freq=freq)
    else:
        try: _pwm_pool[pin].freq(freq)
        except Exception: pass
    return _pwm_pool[pin]

def pwm_write_pin(pin, duty_255):
    duty_255 = max(0, min(255, int(duty_255)))
    # Convert 8-bit (0-255) to MicroPython 10-bit (0-1023)
    duty_1023 = int((duty_255 / 255.0) * 1023)
    _get_pwm(pin).duty(duty_1023)

# ================= GLOBAL STATE =================
motor_speed = 170
uv_threshold = 300
uv_margin = 80
auto_uv_mode = True
current_action = "STOP"

front_uv = 0
left_uv = 0
right_uv = 0

# ================= MOTOR PRIMITIVES =================
def left_motor_forward(spd):
    pwm_write_pin(PIN_L_IN1, spd)
    pwm_write_pin(PIN_L_IN2, 0)

def left_motor_backward(spd):
    pwm_write_pin(PIN_L_IN1, 0)
    pwm_write_pin(PIN_L_IN2, spd)

def right_motor_forward(spd):
    pwm_write_pin(PIN_R_IN1, spd)
    pwm_write_pin(PIN_R_IN2, 0)

def right_motor_backward(spd):
    pwm_write_pin(PIN_R_IN1, 0)
    pwm_write_pin(PIN_R_IN2, spd)

def stop_motors():
    global current_action
    pwm_write_pin(PIN_L_IN1, 0)
    pwm_write_pin(PIN_L_IN2, 0)
    pwm_write_pin(PIN_R_IN1, 0)
    pwm_write_pin(PIN_R_IN2, 0)
    current_action = "STOP"

def forward():
    global current_action
    left_motor_forward(motor_speed)
    right_motor_forward(motor_speed)
    current_action = "FORWARD"

def backward():
    global current_action
    left_motor_backward(motor_speed)
    right_motor_backward(motor_speed)
    current_action = "BACKWARD"

def left_turn():
    global current_action
    left_motor_backward(motor_speed)
    right_motor_forward(motor_speed)
    current_action = "LEFT"

def right_turn():
    global current_action
    left_motor_forward(motor_speed)
    right_motor_backward(motor_speed)
    current_action = "RIGHT"

# ================= 10-SAMPLE SENSOR AVERAGE =================
def read_average_uv(adc_sensor):
    total = 0
    for _ in range(10):
        total += adc_sensor.read()
        time.sleep_ms(2)
    return total // 10

# ================= AUTONOMOUS UV CONTROL =================
def auto_uv_control():
    global front_uv, left_uv, right_uv

    front_uv = read_average_uv(adc_front)
    left_uv  = read_average_uv(adc_left)
    right_uv = read_average_uv(adc_right)

    print(f"F={front_uv} | L={left_uv} | R={right_uv} | TH={uv_threshold} | ACT=", end="")

    front_detected = front_uv > uv_threshold
    left_detected  = left_uv > uv_threshold
    right_detected = right_uv > uv_threshold

    # No UV detected -> STOP
    if not front_detected and not left_detected and not right_detected:
        stop_motors()
        print("NO UV -> STOP")
        return

    # Move toward strongest UV direction
    if front_uv >= (left_uv + uv_margin) and front_uv >= (right_uv + uv_margin):
        forward()
        print("FRONT UV -> FORWARD")
    elif left_uv > (right_uv + uv_margin):
        left_turn()
        print("LEFT UV -> LEFT")
    elif right_uv > (left_uv + uv_margin):
        right_turn()
        print("RIGHT UV -> RIGHT")
    else:
        forward()
        print("BALANCED UV -> FORWARD")

# ================= EMBEDDED HTML DASHBOARD =================
HTML_PAGE = """<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>ESP32-S3 3 UV Rover</title>
  <style>
    body {
      background: #0d1b2a;
      color: white;
      text-align: center;
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 10px;
    }
    h1 { margin-top: 10px; font-size: 24px; color: #48cae4; }
    .box {
      background: #1b263b;
      width: 88%;
      max-width: 430px;
      margin: 15px auto;
      padding: 15px;
      border-radius: 18px;
      font-size: 18px;
    }
    .value { font-size: 22px; color: #ffd166; font-weight: bold; }
    .action { font-size: 24px; color: #90ee90; font-weight: bold; margin-top: 10px; }
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
    .auto { background: #2a9d8f; }
    .manual { background: #6c63ff; }
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
    .btn:active { transform: translateY(5px); box-shadow: 0 2px 0 #023e8a; }
    .stop { background: linear-gradient(145deg, #ff4d4d, #c9184a); box-shadow: 0 7px 0 #800f2f; font-size: 20px; }
    .sliderBox {
      background: #1b263b;
      width: 85%;
      max-width: 400px;
      margin: 18px auto;
      padding: 15px;
      border-radius: 18px;
    }
    input[type=range] { width: 90%; }
    .footer { margin-top: 22px; font-size: 14px; color: #aaa; line-height: 1.5; }
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
    <button class="btn" onpointerdown="sendCmd('forward')" onpointerup="sendCmd('stop')" onpointerleave="sendCmd('stop')">&#9650;</button>
    <div></div>
    <button class="btn" onpointerdown="sendCmd('left')" onpointerup="sendCmd('stop')" onpointerleave="sendCmd('stop')">&#9664;</button>
    <button class="btn stop" onclick="sendCmd('stop')">STOP</button>
    <button class="btn" onpointerdown="sendCmd('right')" onpointerup="sendCmd('stop')" onpointerleave="sendCmd('stop')">&#9654;</button>
    <div></div>
    <button class="btn" onpointerdown="sendCmd('backward')" onpointerup="sendCmd('stop')" onpointerleave="sendCmd('stop')">&#9660;</button>
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
  function sendCmd(cmd) { fetch('/cmd?move=' + cmd); }
  function setMode(mode) { fetch('/mode?value=' + mode); }
  function updateSpeed(val) { document.getElementById('speedValue').innerText = val; fetch('/speed?value=' + val); }
  function updateThreshold(val) { document.getElementById('thresholdValue').innerText = val; fetch('/threshold?value=' + val); }
  function updateStatus() {
    fetch('/status')
      .then(res => res.json())
      .then(data => {
        document.getElementById('frontUV').innerText = data.front;
        document.getElementById('leftUV').innerText = data.left;
        document.getElementById('rightUV').innerText = data.right;
        document.getElementById('actionText').innerText = data.action;
        document.getElementById('modeText').innerText = data.mode;
      }).catch(e => {});
  }
  setInterval(updateStatus, 500);
  updateStatus();
</script>
</body>
</html>"""

# ================= HTTP SERVER HANDLERS =================
def parse_query_params(path):
    params = {}
    if "?" in path:
        query = path.split("?", 1)[1]
        for pair in query.split("&"):
            if "=" in pair:
                k, v = pair.split("=", 1)
                params[k] = v
    return params

def handle_http_request(conn, request_str):
    global auto_uv_mode, motor_speed, uv_threshold

    try:
        first_line = request_str.split("\r\n")[0]
        parts = first_line.split(" ")
        if len(parts) < 2:
            return
        method, path = parts[0], parts[1]
        raw_path = path.split("?")[0]
        params = parse_query_params(path)

        if raw_path == "/" or raw_path == "/index.html":
            response = "HTTP/1.1 200 OK\r\nContent-Type: text/html\r\nContent-Length: " + str(len(HTML_PAGE)) + "\r\nConnection: close\r\n\r\n" + HTML_PAGE
            conn.sendall(response.encode("utf-8"))

        elif raw_path == "/cmd":
            move_cmd = params.get("move", "")
            auto_uv_mode = False

            if move_cmd == "forward":
                forward()
            elif move_cmd == "backward":
                backward()
            elif move_cmd == "left":
                left_turn()
            elif move_cmd == "right":
                right_turn()
            elif move_cmd == "stop":
                stop_motors()

            print(f"Manual Command: {move_cmd}")
            body = "OK"
            response = f"HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: {len(body)}\r\nConnection: close\r\n\r\n{body}"
            conn.sendall(response.encode("utf-8"))

        elif raw_path == "/mode":
            mode_val = params.get("value", "")
            if mode_val == "auto":
                auto_uv_mode = True
                print("Mode: AUTO UV")
            elif mode_val == "manual":
                auto_uv_mode = False
                stop_motors()
                print("Mode: MANUAL")

            body = "Mode OK"
            response = f"HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: {len(body)}\r\nConnection: close\r\n\r\n{body}"
            conn.sendall(response.encode("utf-8"))

        elif raw_path == "/speed":
            if "value" in params:
                motor_speed = max(0, min(255, int(params["value"])))
                print(f"Motor Speed: {motor_speed}")

            body = "Speed OK"
            response = f"HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: {len(body)}\r\nConnection: close\r\n\r\n{body}"
            conn.sendall(response.encode("utf-8"))

        elif raw_path == "/threshold":
            if "value" in params:
                uv_threshold = max(0, min(4095, int(params["value"])))
                print(f"UV Threshold: {uv_threshold}")

            body = "Threshold OK"
            response = f"HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: {len(body)}\r\nConnection: close\r\n\r\n{body}"
            conn.sendall(response.encode("utf-8"))

        elif raw_path == "/status":
            f = read_average_uv(adc_front)
            l = read_average_uv(adc_left)
            r = read_average_uv(adc_right)
            mode_name = "AUTO UV" if auto_uv_mode else "MANUAL"

            json_data = f'{{"front":{f},"left":{l},"right":{r},"action":"{current_action}","mode":"{mode_name}"}}'
            response = f"HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nAccess-Control-Allow-Origin: *\r\nContent-Length: {len(json_data)}\r\nConnection: close\r\n\r\n{json_data}"
            conn.sendall(response.encode("utf-8"))

        else:
            response = "HTTP/1.1 404 Not Found\r\nContent-Length: 0\r\nConnection: close\r\n\r\n"
            conn.sendall(response.encode("utf-8"))

    except Exception as e:
        print(f"[HTTP] Error: {e}")
    finally:
        try: conn.close()
        except Exception: pass

# ================= MAIN ENTRY =================
def main():
    stop_motors()

    # 1. Start Wi-Fi Access Point
    ap = network.WLAN(network.AP_IF)
    ap.active(True)
    ap.config(essid=WIFI_SSID, password=WIFI_PASS, authmode=network.AUTH_WPA_WPA2_PSK)

    print("\n==============================================")
    print(" ESP32-S3 3 UV Invisible Line Rover Started")
    print(f" WiFi Name:  {WIFI_SSID}")
    print(f" Password:   {WIFI_PASS}")
    print(f" Open IP:    http://{ap.ifconfig()[0]}")
    print("==============================================\n")

    # 2. Setup Non-blocking HTTP Web Server Socket
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server_socket.bind(("0.0.0.0", 80))
    server_socket.listen(5)
    server_socket.setblocking(False)

    poller = select.poll()
    poller.register(server_socket, select.POLLIN)

    hw.play_startup_tone()
    print("Web Server Started on port 80")
    print("AUTO UV MODE STARTED")

    last_uv_check = time.ticks_ms()

    # 3. Main Loop
    while True:
        # A. Poll for incoming HTTP client requests
        events = poller.poll(5)
        if events:
            try:
                conn, addr = server_socket.accept()
                conn.settimeout(2.0)
                req_data = conn.recv(1024).decode("utf-8", "ignore")
                if req_data:
                    handle_http_request(conn, req_data)
                else:
                    conn.close()
            except Exception:
                pass

        # B. Periodic Autonomous UV Control (Every 120ms)
        if auto_uv_mode:
            now = time.ticks_ms()
            if time.ticks_diff(now, last_uv_check) >= 120:
                last_uv_check = now
                auto_uv_control()

        time.sleep_ms(5)

if __name__ == '__main__':
    main()
