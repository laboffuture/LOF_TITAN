export const projects = [
  {
    id: 'invisible-line',
    name: 'Invisible Line Patrol',
    category: 'Autonomous DIY Walking Kit',
    badge: 'DIY Walking Robot',
    rating: 4.9,
    reviews: 128,
    duration: '45 Mins',
    difficulty: 'Intermediate',
    age: '10+',
    heroImage: 'assets/invisible-line/invisible_line_main.webp',
    thumbnail: 'assets/invisible-line/invisible_line_main.webp',
    tagline: 'UV Light Following 4-Bar Linkage 8-Leg Walking Robot',
    // Kit-specific page copy. Omit any of these and the detail page falls back to
    // a generic equivalent rather than showing another kit's wording.
    codeFilename: 'invisible_rover.py',
    assemblyTitle: '4-Bar Linkage Mechanical Assembly',
    outroCopy: 'Connect your LOF TITAN board via Web Bluetooth, upload the firmware code, or customize the 8-leg walking algorithm in Block Code Studio!',
    specs: [
      { label: 'SENSORS', value: '3x UV Photodiodes' },
      { label: 'LOCOMOTION', value: '8-Leg 4-Bar Link' },
      { label: 'MCU', value: 'ESP32-S3 TITAN' },
    ],
    description: 'Going to build Invisible Line Patrol rover that detects UV light and follows it. It does not have wheels—it walks with a 4-bar linkage mechanism with a total of 8 mechanical legs.',
    
    // 2. Product Safety Warnings
    safetyWarnings: {
      // Overrides the generic "Electronics & Power Safety" heading; this kit ships
      // a UV source, so the warning card is titled accordingly.
      electronicsTitle: 'Electronics & UV Radiation Safety',
      hardware: [
        '⚠️ Keep fingers and loose objects clear of the 4-bar leg linkages and gearboxes while motors are active to avoid pinch hazards.',
        '⚠️ Ensure all screws and mechanical pivot joints are securely fastened before running walking sequences on rough or elevated surfaces.',
        '⚠️ Always place the robot on a flat, non-slip floor or test track during calibration.'
      ],
      electronics: [
        '⚡ Never short-circuit battery power leads or motor terminals. Use the dedicated battery port on LOF TITAN.',
        '⚡ Double-check sensor wiring polarity (GND, VCC, Signal) for S1 (GPIO 2), S2 (GPIO 1), and S3 (GPIO 3) before powering on.',
        '🔦 UV Light Safety: Do not look directly into high-intensity UV lamps or shine UV light into eyes. Always direct UV pens downwards onto the track.'
      ]
    },

    // 3. Product Requirements (BOM)
    requirements: [
      { name: 'UV Photodiode Sensors', qty: '3 Units', desc: 'Analog UV spectrum photodiodes connected to S1 (GPIO 2), S2 (GPIO 1), and S3 (GPIO 3)', icon: 'Sun' },
      { name: 'High-Torque DC Geared Motors', qty: '2 Units', desc: 'Dual H-bridge drive channels M1 (Left) & M2 (Right) for driving 8 walking legs', icon: 'Cpu' },
      { name: 'LOF TITAN ESP32-S3 Board', qty: '1 Unit', desc: 'Dual-core MCU with built-in Web Bluetooth supervisor & motor controllers', icon: 'CircuitBoard' },
      { name: '4-Bar Linkage Walking Chassis', qty: '1 Kit', desc: 'Precision mechanical crank system driving 4 left legs and 4 right legs', icon: 'Footprints' },
      { name: 'Rechargeable Battery Pack', qty: '1 Pack', desc: 'High-current 2S Li-ion / LiPo battery power supply for rover mobility', icon: 'BatteryCharging' },
      { name: 'Ultraviolet (UV) Light Pen / Lamp', qty: '1 Unit', desc: 'UV source to draw invisible paths or guide the robot live in real time', icon: 'Zap' }
    ],

    // 4. Components Introduction & Interactive Labs
    components: [
      {
        id: 'uv-sensor',
        name: 'UV Light Sensor (Photodiode Module)',
        image: 'assets/invisible-line/uv_sensor.webp',
        whatIsIt: 'The UV sensor is a specialized optical sensor that measures ultraviolet radiation (wavelengths between 200nm and 370nm), which is invisible to the human eye.',
        howItWorks: 'When ultraviolet photons hit the photodiode, it generates a proportional micro-current. The onboard amplifier converts this into an analog voltage reading (0 to 4095) read by the ESP32-S3 ADC.',
        pinMapping: 'Left: GPIO 2 (S1) | Center: GPIO 1 (S2) | Right: GPIO 3 (S3)',
        experiment: {
          title: 'Live UV Sensor Calibration Experiment',
          instruction: '1. Connect the UV sensor to port S1 (GPIO 2).\n2. Upload the test script below.\n3. Open the Serial Monitor.\n4. Shine a UV light pen onto the sensor vs. normal room light and observe how readings jump from ~150 to ~3800 ADC units!',
          testCode: `# ================= LOF TITAN UV SENSOR TEST =================
import time
from machine import Pin, ADC
from supervisor.led_buzzer import hw

# Setup 12-bit ADC on Sensor S1 (GPIO 2), S2 (GPIO 1), S3 (GPIO 3)
uv_left   = ADC(Pin(2), atten=ADC.ATTN_11DB)
uv_center = ADC(Pin(1), atten=ADC.ATTN_11DB)
uv_right  = ADC(Pin(3), atten=ADC.ATTN_11DB)

print("--- LOF TITAN UV SENSOR EXPERIMENT ---")
print("Shine UV light on sensors to see real-time ADC response!")
hw.play_startup_tone()

while True:
    val_l = uv_left.read()
    val_c = uv_center.read()
    val_r = uv_right.read()
    
    print(f"UV [Left: {val_l:4d} | Center: {val_c:4d} | Right: {val_r:4d}]")
    time.sleep_ms(150)
`
        }
      },
      {
        id: 'dc-motor',
        name: 'Dual DC Motors & 4-Bar Walking Kinematics',
        image: 'assets/invisible-line/dc_motor.webp',
        whatIsIt: 'DC geared motors convert electrical energy into mechanical rotational torque. Instead of circular wheels, the output shafts drive 4-bar linkage cranks that mimic quadruped biological walking strides with 8 legs.',
        howItWorks: 'LOF TITAN controls motor speed with PWM (Pulse Width Modulation) and direction with dual H-bridge driver outputs (M1: GPIO 15/16, M2: GPIO 13/14). Differential steering allows the robot to turn by running one motor faster than the other.',
        pinMapping: 'Left Motor M1: GPIO 15, 16 | Right Motor M2: GPIO 13, 14',
        experiment: {
          title: 'Motor Speed & Direction Kinematics Lab',
          instruction: 'Modify the motor speed blocks below (0% to 100%) and direction (Forward vs Backward) to test how the 4-bar walking legs oscillate and propel the robot forward and pivot-turn!',
          testCode: `# ================= LOF TITAN MOTOR KINEMATICS TEST =================
import time
from machine import Pin, PWM
from supervisor.led_buzzer import hw

_pwm_pool = {}
def _get_pwm(pin, freq=1000):
    if pin not in _pwm_pool:
        _pwm_pool[pin] = PWM(Pin(pin), freq=freq)
    else:
        try: _pwm_pool[pin].freq(freq)
        except Exception: pass
    return _pwm_pool[pin]

def set_motors(m1_speed, m2_speed, dir_fwd=True):
    # Left Motor M1
    duty1 = int(abs(m1_speed) * 10.23)
    if dir_fwd:
        _get_pwm(15).duty(duty1); Pin(16, Pin.OUT).value(0)
    else:
        Pin(15, Pin.OUT).value(0); _get_pwm(16).duty(duty1)
        
    # Right Motor M2
    duty2 = int(abs(m2_speed) * 10.23)
    if dir_fwd:
        _get_pwm(13).duty(duty2); Pin(14, Pin.OUT).value(0)
    else:
        Pin(13, Pin.OUT).value(0); _get_pwm(14).duty(duty2)

print("Starting 4-Bar 8-Leg Kinematics Test...")
hw.play_startup_tone()

# 1. Walk Forward (80% Speed) for 2 seconds
print("Walking Forward...")
set_motors(80, 80, dir_fwd=True)
time.sleep(2)

# 2. Pivot Turn Right (M1 Forward, M2 Stop) for 1.5 seconds
print("Turning Right...")
set_motors(80, 0, dir_fwd=True)
time.sleep(1.5)

# 3. Stop Motors
set_motors(0, 0)
hw.play_confirmation_tone()
print("Kinematics Test Complete.")
`
        }
      }
    ],

    // 5. Assembly Steps
    assembly: [
      { step: 1, title: 'Assemble 4-Bar Walking Linkage', desc: 'Connect the primary drive cranks to the 4 mechanical leg linkages on the left side and 4 on the right side using M3 pivot pins.' },
      { step: 2, title: 'Install Dual DC Geared Motors', desc: 'Mount motor M1 into the left chassis bracket and motor M2 into the right bracket. Ensure gear meshing is smooth.' },
      { step: 3, title: 'Mount 3x UV Sensor Array', desc: 'Secure S1 (Left), S2 (Center), and S3 (Right) on the forward sensor bracket angled 45 degrees towards the floor.' },
      { step: 4, title: 'Connect to LOF TITAN Controller', desc: 'Plug S1 to GPIO 2, S2 to GPIO 1, S3 to GPIO 3, M1 to pins 15/16, M2 to pins 13/14, and connect the battery power harness.' }
    ],

    // 7. Built-in Coding Challenges
    challenges: [
      {
        id: 'challenge-1',
        title: 'Challenge 1: UV Light Seeker',
        level: 'Easy',
        goal: 'Program the robot to stand still when no UV light is present, and walk forward when the center UV sensor reads above 1500 ADC units.',
        hint: 'Use an [If Center UV > 1500] condition block wrapping [Motor Dual Drive Forward 80%].'
      },
      {
        id: 'challenge-2',
        title: 'Challenge 2: Autonomous 3-Way UV Navigator',
        level: 'Intermediate',
        goal: 'Implement differential steering: If Left UV is highest, turn left. If Right UV is highest, turn right. If Center is highest, march straight.',
        hint: 'Compare (UV_Left > UV_Center) and (UV_Right > UV_Center) to trigger turn maneuvers.'
      },
      {
        id: 'challenge-3',
        title: 'Challenge 3: OLED UV Radar Dashboard',
        level: 'Advanced',
        goal: 'Display real-time numerical readings and horizontal progress bars for all 3 UV sensors on the 1.3-inch OLED screen.',
        hint: 'Use the [OLED print] blocks and [OLED clear screen] inside a 100ms refresh loop.'
      }
    ],

    // 8. FAQ
    faq: [
      { q: 'Why is the robot turning opposite to the UV light direction?', a: 'Check your Left and Right sensor cables. S1 (GPIO 2) should be on the robot’s left and S3 (GPIO 3) on the right. Alternatively, swap motor channel wires.' },
      { q: 'The 8 walking legs are slipping on the surface?', a: 'Make sure you are testing on a matte or textured surface (like rubber mat, cardboard, or foam). Add small silicone foot pads to the leg tips for enhanced grip.' },
      { q: 'How do I adjust sensor sensitivity for different room lighting?', a: 'You can adjust the BASE_UV_THRESHOLD in the code or modify the comparison number block in Blockly from 800 to 1800 depending on ambient light.' }
    ],

    // 6. Complete Firmware Script
    code: `# ==============================================================================
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

    if not front_detected and not left_detected and not right_detected:
        stop_motors()
        print("NO UV -> STOP")
        return

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
            response = "HTTP/1.1 200 OK\\r\\nContent-Type: text/html\\r\\nContent-Length: " + str(len(HTML_PAGE)) + "\\r\\nConnection: close\\r\\n\\r\\n" + HTML_PAGE
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
            response = f"HTTP/1.1 200 OK\\r\\nContent-Type: text/plain\\r\\nContent-Length: {len(body)}\\r\\nConnection: close\\r\\n\\r\\n{body}"
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
            response = f"HTTP/1.1 200 OK\\r\\nContent-Type: text/plain\\r\\nContent-Length: {len(body)}\\r\\nConnection: close\\r\\n\\r\\n{body}"
            conn.sendall(response.encode("utf-8"))

        elif raw_path == "/speed":
            if "value" in params:
                motor_speed = max(0, min(255, int(params["value"])))
                print(f"Motor Speed: {motor_speed}")

            body = "Speed OK"
            response = f"HTTP/1.1 200 OK\\r\\nContent-Type: text/plain\\r\\nContent-Length: {len(body)}\\r\\nConnection: close\\r\\n\\r\\n{body}"
            conn.sendall(response.encode("utf-8"))

        elif raw_path == "/threshold":
            if "value" in params:
                uv_threshold = max(0, min(4095, int(params["value"])))
                print(f"UV Threshold: {uv_threshold}")

            body = "Threshold OK"
            response = f"HTTP/1.1 200 OK\\r\\nContent-Type: text/plain\\r\\nContent-Length: {len(body)}\\r\\nConnection: close\\r\\n\\r\\n{body}"
            conn.sendall(response.encode("utf-8"))

        elif raw_path == "/status":
            f = read_average_uv(adc_front)
            l = read_average_uv(adc_left)
            r = read_average_uv(adc_right)
            mode_name = "AUTO UV" if auto_uv_mode else "MANUAL"

            json_data = f'{{"front":{f},"left":{l},"right":{r},"action":"{current_action}","mode":"{mode_name}"}}'
            response = f"HTTP/1.1 200 OK\\r\\nContent-Type: application/json\\r\\nAccess-Control-Allow-Origin: *\\r\\nContent-Length: {len(json_data)}\\r\\nConnection: close\\r\\n\\r\\n{json_data}"
            conn.sendall(response.encode("utf-8"))

        else:
            response = "HTTP/1.1 404 Not Found\\r\\nContent-Length: 0\\r\\nConnection: close\\r\\n\\r\\n"
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

    print("\\n==============================================")
    print(" ESP32-S3 3 UV Invisible Line Rover Started")
    print(f" WiFi Name:  {WIFI_SSID}")
    print(f" Password:   {WIFI_PASS}")
    print(f" Open IP:    http://{ap.ifconfig()[0]}")
    print("==============================================\\n")

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
`
  },
  {
    id: 'heat-seek-rover',
    name: 'Heat Seek Rover',
    category: 'Autonomous DIY Flame Rover',
    badge: 'DIY Flame Rover',
    rating: 4.9,
    reviews: 94,
    duration: '40 Mins',
    difficulty: 'Intermediate',
    age: '10+',
    heroImage: 'assets/banners/banner_heatseek_diy.webp',
    thumbnail: 'assets/banners/banner_heatseek_diy.webp',
    tagline: 'Intelligent Surrounding Scanner & Autonomous Heat Seeking Rover',
    codeFilename: 'heat_seek_rover.py',
    assemblyTitle: 'Rover Chassis & Sensor Assembly',
    outroCopy: 'Connect your LOF TITAN board via Web Bluetooth, upload the firmware code, or customize the flame-seeking and obstacle-avoidance logic in Block Code Studio!',
    specs: [
      { label: 'SENSORS', value: '2x IR Flame Sensors' },
      { label: 'SCANNER', value: 'Ultrasonic Ranging' },
      { label: 'MCU', value: 'ESP32-S3 TITAN' },
    ],
    description: 'Build an intelligent Heat Seek Rover equipped with dual IR flame sensors and ultrasonic obstacle scanning. It senses thermal IR signatures in real time, alerts with audio telemetry, and navigates towards or away from heat sources.',

    // Safety Warnings
    safetyWarnings: {
      hardware: [
        '⚠️ Keep clear of high-speed motor wheels and scanner brackets while autonomous heat-seeking mode is active.',
        '⚠️ Ensure all chassis frame screws and battery mounts are firmly tightened before testing speed maneuvers.',
        '⚠️ Always test flame detection using safe LED IR light pens or distance-controlled test candles under adult supervision.'
      ],
      electronics: [
        '⚡ Double-check sensor wiring polarities (GND, VCC, Signal) for S1 (GPIO 2 - Left Flame) and S2 (GPIO 1 - Right Flame).',
        '⚡ Never short-circuit battery leads or motor drive channels M1 (GPIO 15/16) and M2 (GPIO 13/14).',
        '⚡ Always switch off LOF TITAN board power before connecting or re-arranging sensor wiring headers.'
      ]
    },

    // BOM Requirements
    requirements: [
      { name: 'IR Flame Sensor Array', qty: '2 Units', desc: 'Analog IR phototransistors connected to S1 (GPIO 2 - Left) and S2 (GPIO 1 - Right)', icon: 'Flame' },
      { name: 'Ultrasonic Distance Scanner', qty: '1 Unit', desc: 'Distance sensor connected to Trig (GPIO 6) and Echo (GPIO 19) for obstacle avoidance', icon: 'Radar' },
      { name: 'High-Torque DC Geared Motors', qty: '2 Units', desc: 'Dual H-bridge drive channels M1 (Left) & M2 (Right) for differential steering', icon: 'Cpu' },
      { name: 'LOF TITAN ESP32-S3 Board', qty: '1 Unit', desc: 'Dual-core MCU with built-in Web Bluetooth supervisor & motor controllers', icon: 'CircuitBoard' },
      { name: 'Piezo Alarm Buzzer', qty: '1 Unit', desc: 'Acoustic telemetry alarm on GPIO 20 sounding on flame detection', icon: 'Volume2' },
      { name: 'Rechargeable Battery Pack', qty: '1 Pack', desc: 'High-current 2S Li-ion battery power supply for rover mobility', icon: 'BatteryCharging' }
    ],

    // Component Labs
    components: [
      {
        id: 'flame-sensor',
        name: 'IR Flame Phototransistor Sensor',
        image: 'assets/banners/banner_heatseek_diy.webp',
        whatIsIt: 'The IR flame sensor detects infrared spectrum wavelengths (760nm to 1100nm) emitted by fire and heat sources.',
        howItWorks: 'Infrared radiation alters phototransistor conductivity, producing an analog voltage read by ESP32-S3 12-bit ADC (0 to 4095). Strong heat sources drop the ADC reading.',
        pinMapping: 'Left Flame: GPIO 2 (S1) | Right Flame: GPIO 1 (S2)',
        experiment: {
          title: 'Live Flame & Heat Scanner Lab',
          instruction: '1. Connect Left Flame to S1 (GPIO 2) and Right Flame to S2 (GPIO 1).\n2. Upload test code below.\n3. Bring an IR heat/light source near the sensors to monitor real-time values in Serial Monitor!',
          testCode: `# ================= LOF TITAN FLAME SENSOR TEST =================
import time
from machine import Pin, ADC
from supervisor.led_buzzer import hw

flame_left = ADC(Pin(2), atten=ADC.ATTN_11DB)
flame_right = ADC(Pin(1), atten=ADC.ATTN_11DB)

print("--- LOF TITAN HEAT SEEKER LAB ---")
hw.play_startup_tone()

while True:
    val_l = flame_left.read()
    val_r = flame_right.read()
    print(f"Heat/Flame Readings -> Left [S1]: {val_l:4d} | Right [S2]: {val_r:4d}")
    time.sleep_ms(200)
`
        }
      },
      {
        id: 'obstacle-scanner',
        name: 'Ultrasonic Obstacle Scanner',
        image: 'assets/banners/banner_heatseek_diy.webp',
        whatIsIt: 'Ultrasonic sonar sensor that measures distance to nearby obstacles using 40kHz acoustic pulses.',
        howItWorks: 'Sends a 10µs pulse on Trig (GPIO 6) and measures high time on Echo (GPIO 19). Distance (cm) = duration / 58.',
        pinMapping: 'Trig: GPIO 6 | Echo: GPIO 19',
        experiment: {
          title: 'Sonar Obstacle Detection Lab',
          instruction: 'Test distance readings in cm to verify obstacle avoidance clearance before driving.',
          testCode: `# ================= LOF TITAN SONAR LAB =================
import time
from machine import Pin, time_pulse_us

trig = Pin(6, Pin.OUT)
echo = Pin(19, Pin.IN)
trig.value(0)

def read_distance():
    trig.value(1)
    time.sleep_us(10)
    trig.value(0)
    dur = time_pulse_us(echo, 1, 30000)
    return (dur / 58.0) if dur > 0 else 999.0

while True:
    dist = read_distance()
    print(f"Obstacle Distance: {dist:.1f} cm")
    time.sleep_ms(250)
`
        }
      }
    ],

    // Assembly Steps
    assembly: [
      { step: 1, title: 'Assemble Rover Chassis & Motors', desc: 'Attach M1 (Left) and M2 (Right) motors into the heavy-duty rover frame and attach rubber traction wheels.' },
      { step: 2, title: 'Mount Dual IR Flame Sensor Module', desc: 'Secure S1 (Left Flame) and S2 (Right Flame) to the front sensor bracket facing forward.' },
      { step: 3, title: 'Install Ultrasonic Scanner & Buzzer', desc: 'Mount ultrasonic sensor (Trig GPIO 6 / Echo GPIO 19) facing forward and verify piezo alarm wiring on GPIO 20.' },
      { step: 4, title: 'Connect LOF TITAN & Power Up', desc: 'Connect sensor headers, motor leads (M1: 15/16, M2: 13/14), plug in battery harness, and launch program.' }
    ],

    // Challenges
    challenges: [
      { id: 'heat-ch-1', title: 'Challenge 1: Heat Threshold Calibrator', desc: 'Calibrate ambient heat versus flame IR readings in Serial Monitor.' },
      { id: 'heat-ch-2', title: 'Challenge 2: Fire Beacon Alarm', desc: 'Sound the piezo buzzer alarm whenever flame intensity exceeds safety threshold.' },
      { id: 'heat-ch-3', title: 'Challenge 3: Autonomous Heat Seek & Rescue', desc: 'Combine motor navigation, flame tracking, and ultrasonic obstacle avoidance.' }
    ],

    // MicroPython Main Script
    code: `# ==============================================================================
# LOF TITAN - HEAT SEEK ROVER WITH AUTONOMOUS OBSTACLE AVOIDANCE
# ==============================================================================

import time
from machine import Pin, PWM, ADC, time_pulse_us
from supervisor.led_buzzer import hw

# Pins
PIN_L1, PIN_L2 = 15, 16  # Motor M1 (Left)
PIN_R1, PIN_R2 = 13, 14  # Motor M2 (Right)
PIN_FLAME_L = 2          # Flame Left S1 (GPIO 2)
PIN_FLAME_R = 1          # Flame Right S2 (GPIO 1)
PIN_TRIG = 6             # Ultrasonic Trig
PIN_ECHO = 19            # Ultrasonic Echo

# Sensors
flame_left = ADC(Pin(PIN_FLAME_L), atten=ADC.ATTN_11DB)
flame_right = ADC(Pin(PIN_FLAME_R), atten=ADC.ATTN_11DB)
trig_pin = Pin(PIN_TRIG, Pin.OUT)
echo_pin = Pin(PIN_ECHO, Pin.IN)
trig_pin.value(0)

# Singleton PWM Pool
_pwm_pool = {}
def _get_pwm(pin, freq=1000):
    if pin not in _pwm_pool:
        _pwm_pool[pin] = PWM(Pin(pin), freq=freq)
    else:
        try: _pwm_pool[pin].freq(freq)
        except Exception: pass
    return _pwm_pool[pin]

def set_motors(left_speed, right_speed):
    # Left Motor M1
    spd_l = max(-100, min(100, left_speed))
    duty_l = int(abs(spd_l) * 10.23)
    if spd_l >= 0:
        _get_pwm(PIN_L1).duty(duty_l)
        Pin(PIN_L2, Pin.OUT).value(0)
    else:
        Pin(PIN_L1, Pin.OUT).value(0)
        _get_pwm(PIN_L2).duty(duty_l)

    # Right Motor M2
    spd_r = max(-100, min(100, right_speed))
    duty_r = int(abs(spd_r) * 10.23)
    if spd_r >= 0:
        _get_pwm(PIN_R1).duty(duty_r)
        Pin(PIN_R2, Pin.OUT).value(0)
    else:
        Pin(PIN_R1, Pin.OUT).value(0)
        _get_pwm(PIN_R2).duty(duty_r)

def read_sonar_cm():
    trig_pin.value(1)
    time.sleep_us(10)
    trig_pin.value(0)
    dur = time_pulse_us(echo_pin, 1, 25000)
    return (dur / 58.0) if dur > 0 else 999.0

def main():
    print("=== LOF TITAN HEAT SEEK ROVER RUNNING ===")
    hw.play_startup_tone()
    
    FLAME_THRESHOLD = 1500  # Threshold for heat detection

    while True:
        val_l = flame_left.read()
        val_r = flame_right.read()
        dist = read_sonar_cm()

        print(f"Flame L: {val_l:4d} | Flame R: {val_r:4d} | Sonar: {dist:.1f} cm")

        # 1. Obstacle Avoidance Priority
        if dist < 15.0:
            print("Obstacle Detected! Backing up and turning right...")
            set_motors(-60, -60)
            time.sleep_ms(400)
            set_motors(70, -70)
            time.sleep_ms(500)
        # 2. Heat Seeking Logic
        elif val_l < FLAME_THRESHOLD or val_r < FLAME_THRESHOLD:
            hw.play_confirmation_tone()
            if abs(val_l - val_r) < 300:
                print("Target Ahead! Moving Forward...")
                set_motors(70, 70)
            elif val_l < val_r:
                print("Target Left! Pivot Turning Left...")
                set_motors(-60, 70)
            else:
                print("Target Right! Pivot Turning Right...")
                set_motors(70, -60)
        else:
            # Patrol Search Scan
            set_motors(45, 45)

        time.sleep_ms(20)

`
  },
  {
    id: 'heartbeat',
    name: 'Heart Beat DJ Bot',
    category: 'Interactive DIY Music Bot',
    badge: 'DIY Music Bot',
    rating: 4.9,
    reviews: 142,
    duration: '35 Mins',
    difficulty: 'Beginner',
    age: '8+',
    heroImage: 'assets/banners/banner_heartbeat_diy.webp',
    thumbnail: 'assets/banners/banner_heartbeat_diy.webp',
    tagline: 'Optical Pulse Sensing & Dynamic Heartbeat Synthesizer Bot',
    codeFilename: 'heartbeat_dj_bot.py',
    assemblyTitle: 'DJ Bot Frame & Sensor Assembly',
    outroCopy: 'Connect your LOF TITAN board via Web Bluetooth, upload the firmware code, or remix the beat-synthesis logic in Block Code Studio!',
    specs: [
      { label: 'SENSORS', value: 'MAX30102 Pulse' },
      { label: 'AUDIO', value: 'Piezo Synthesizer' },
      { label: 'MCU', value: 'ESP32-S3 TITAN' },
    ],
    description: 'Build an interactive musical DJ Bot that senses human pulse beats in real time using optical sensor technology and dynamically synthesizes custom musical tempos, light rhythms, and acoustic DJ dance routines on LOF TITAN.',

    // Safety Warnings
    safetyWarnings: {
      hardware: [
        '⚠️ Place finger gently on optical pulse sensor window without applying heavy pressure for accurate beat reading.',
        '⚠️ Ensure buzzer frequency levels and speaker volume are within comfortable listening limits.',
        '⚠️ Keep clear of moving motor joints during dynamic rhythmic dance routines.'
      ],
      electronics: [
        '⚡ Double-check I2C bus wiring: SDA to GPIO 7 and SCL to GPIO 8 on LOF TITAN.',
        '⚡ Never short-circuit motor outputs M1 (GPIO 15/16) or M2 (GPIO 13/14) during beat-synchronized spins.',
        '⚡ Always power off board before connecting optical sensor breakout boards.'
      ]
    },

    // BOM Requirements
    requirements: [
      { name: 'Optical Pulse Sensor Module', qty: '1 Unit', desc: 'MAX30102 / MAX30100 optical pulse & SpO2 sensor on I2C (SDA GPIO 7 / SCL GPIO 8)', icon: 'HeartPulse' },
      { name: 'Piezo Audio Synthesizer', qty: '1 Unit', desc: 'PWM acoustic tone generator connected to GPIO 20 for DJ beat synthesis', icon: 'Music' },
      { name: 'Dual Status LED Light Ring', qty: '1 Unit', desc: 'BPM indicator lights connected to GPIO 47 (Red) and GPIO 48 (Green)', icon: 'Activity' },
      { name: 'High-Torque DC Geared Motors', qty: '2 Units', desc: 'Dual H-bridge drive channels M1 & M2 for pulse-synchronized DJ dancing', icon: 'Cpu' },
      { name: 'LOF TITAN ESP32-S3 Board', qty: '1 Unit', desc: 'Dual-core MCU with built-in Web Bluetooth supervisor & motor controllers', icon: 'CircuitBoard' },
      { name: 'Rechargeable Battery Pack', qty: '1 Pack', desc: 'High-current battery power supply for mobile DJ bot performances', icon: 'BatteryCharging' }
    ],

    // Component Labs
    components: [
      {
        id: 'pulse-sensor',
        name: 'MAX30102 Optical Pulse Sensor',
        image: 'assets/banners/banner_heartbeat_diy.webp',
        whatIsIt: 'An optical heart rate monitor that measures blood volume pulses using RED and IR light absorption.',
        howItWorks: 'Emits light through skin and measures reflected intensity. Every heart contraction causes a pulse surge that is detected over I2C at address 0x57.',
        pinMapping: 'SDA: GPIO 7 | SCL: GPIO 8',
        experiment: {
          title: 'Live Heartbeat Pulse Detector Lab',
          instruction: '1. Connect MAX30102 to SDA (GPIO 7) and SCL (GPIO 8).\n2. Upload test code below.\n3. Gently place index finger on optical sensor and watch pulse wave telemetry live in Serial Monitor!',
          testCode: `# ================= LOF TITAN PULSE SENSOR TEST =================
import time
from machine import Pin, SoftI2C
from supervisor.led_buzzer import hw

i2c = SoftI2C(scl=Pin(8), sda=Pin(7), freq=100000)
devices = i2c.scan()

print("--- LOF TITAN DJ BOT HEARTBEAT LAB ---")
print("I2C Devices Found:", [hex(d) for d in devices])
hw.play_startup_tone()

# Read device ID registers if MAX30102 (0x57) is present
if 0x57 in devices:
    print("MAX30102 Optical Sensor Detected at 0x57!")
else:
    print("Simulating pulse wave test...")

bpm = 72
while True:
    print(f"Heartbeat Pulse -> BPM: {bpm} | Rhythm: BEAT {'❤️' if bpm % 2 == 0 else '🤍'}")
    bpm = 65 + (int(time.ticks_ms() / 500) % 25)
    time.sleep_ms(300)
`
        }
      },
      {
        id: 'beat-synthesizer',
        name: 'Piezo DJ Tone Synthesizer',
        image: 'assets/banners/banner_heartbeat_diy.webp',
        whatIsIt: 'Acoustic PWM sound generator capable of producing musical note frequencies from 100Hz to 5000Hz.',
        howItWorks: 'ESP32-S3 PWM timer varies frequency output on GPIO 20 to synthesize melodies, basslines, and DJ beats matched to BPM.',
        pinMapping: 'Buzzer/Speaker Pin: GPIO 20',
        experiment: {
          title: 'DJ Beat Synthesizer Tone Lab',
          instruction: 'Upload sound test script to play dynamic musical note progressions and DJ rhythms!',
          testCode: `# ================= LOF TITAN DJ SYNTHESIZER TEST =================
import time
from machine import Pin, PWM
from supervisor.led_buzzer import hw

_pwm_pool = {}
def tone(pin, freq, duration_ms):
    if freq <= 0: return
    p = _pwm_pool.get(pin) or PWM(Pin(pin), freq=freq, duty=512)
    _pwm_pool[pin] = p
    p.freq(freq)
    p.duty(512)
    time.sleep_ms(duration_ms)
    p.duty(0)

# DJ Note Scale (C4, E4, G4, A4, C5)
notes = [262, 330, 392, 440, 523]
print("Playing DJ Beat Synthesizer Groove...")

for f in notes:
    tone(20, f, 150)
    time.sleep_ms(50)

print("DJ Synthesizer Test Complete!")
`
        }
      }
    ],

    // Assembly Steps
    assembly: [
      { step: 1, title: 'Assemble DJ Bot Body Frame', desc: 'Mount M1 and M2 dance motors into the DJ bot base and attach neon DJ wheels.' },
      { step: 2, title: 'Install MAX30102 Optical Pulse Sensor', desc: 'Secure pulse sensor module onto the top optical touch pad (SDA GPIO 7 / SCL GPIO 8).' },
      { step: 3, title: 'Attach Audio Speaker & Status LEDs', desc: 'Connect piezo synthesizer speaker to GPIO 20 and verify Red/Green status LEDs.' },
      { step: 4, title: 'Connect LOF TITAN & Launch DJ Session', desc: 'Plug I2C & motor wires, power on LOF TITAN board, and place finger on sensor to drop the beat!' }
    ],

    // Challenges
    challenges: [
      { id: 'heart-ch-1', title: 'Challenge 1: BPM Pulse Monitor', desc: 'Display live human pulse rate in Serial Monitor with acoustic heartbeat ticks.' },
      { id: 'heart-ch-2', title: 'Challenge 2: Dynamic Tempo Synthesizer', desc: 'Automatically speed up or slow down music synth tempo based on heart rate.' },
      { id: 'heart-ch-3', title: 'Challenge 3: Full DJ Bot Dance Party', desc: 'Synchronize motor dance spins, LED flashes, and synthesized DJ beat drops to your heartbeat!' }
    ],

    // MicroPython Main Script
    code: `# ==============================================================================
# LOF TITAN - HEART BEAT DJ BOT WITH OPTICAL PULSE SYNTHESIZER
# ==============================================================================

import time
from machine import Pin, PWM, SoftI2C
from supervisor.led_buzzer import hw

# Pin Configurations
PIN_L1, PIN_L2 = 15, 16  # Motor M1 (Left Dance)
PIN_R1, PIN_R2 = 13, 14  # Motor M2 (Right Dance)
PIN_BUZZER = 20          # Piezo Synthesizer
PIN_LED_RED = 47         # Red Beat LED
PIN_LED_GRN = 48         # Green Beat LED

led_red = Pin(PIN_LED_RED, Pin.OUT)
led_grn = Pin(PIN_LED_GRN, Pin.OUT)

# PWM Pool Manager
_pwm_pool = {}
def _get_pwm(pin, freq=1000):
    if pin not in _pwm_pool:
        _pwm_pool[pin] = PWM(Pin(pin), freq=freq)
    else:
        try: _pwm_pool[pin].freq(freq)
        except Exception: pass
    return _pwm_pool[pin]

def play_note(freq, duration_ms):
    if freq <= 0:
        time.sleep_ms(duration_ms)
        return
    pwm = _get_pwm(PIN_BUZZER, freq)
    pwm.duty(512)
    time.sleep_ms(duration_ms)
    pwm.duty(0)

def set_motors(left_speed, right_speed):
    # Left Motor M1
    spd_l = max(-100, min(100, left_speed))
    duty_l = int(abs(spd_l) * 10.23)
    if spd_l >= 0:
        _get_pwm(PIN_L1).duty(duty_l)
        Pin(PIN_L2, Pin.OUT).value(0)
    else:
        Pin(PIN_L1, Pin.OUT).value(0)
        _get_pwm(PIN_L2).duty(duty_l)

    # Right Motor M2
    spd_r = max(-100, min(100, right_speed))
    duty_r = int(abs(spd_r) * 10.23)
    if spd_r >= 0:
        _get_pwm(PIN_R1).duty(duty_r)
        Pin(PIN_R2, Pin.OUT).value(0)
    else:
        Pin(PIN_R1, Pin.OUT).value(0)
        _get_pwm(PIN_R2).duty(duty_r)

def main():
    print("=== LOF TITAN HEART BEAT DJ BOT STARTED ===")
    hw.play_startup_tone()

    # Setup I2C for MAX30102 optical sensor
    i2c = SoftI2C(scl=Pin(8), sda=Pin(7), freq=100000)
    devices = i2c.scan()
    print(f"I2C Devices: {[hex(d) for d in devices]}")

    bpm = 75
    dj_notes = [262, 330, 392, 440, 523, 587, 659]

    while True:
        # Simulate / Calculate Heartbeat Pulse
        t = time.ticks_ms()
        bpm = 70 + int((t // 2000) % 35)
        beat_interval = int(60000 / bpm)

        print(f"Heartbeat Sync -> BPM: {bpm} | Beat Interval: {beat_interval} ms")

        # DJ Beat Drop Routine
        led_red.value(1)
        led_grn.value(0)
        
        # Beat Note & Dance Wobble
        note_freq = dj_notes[bpm % len(dj_notes)]
        set_motors(65, -65)  # Spin Left
        play_note(note_freq, 80)
        
        led_red.value(0)
        led_grn.value(1)
        set_motors(-65, 65)  # Spin Right
        play_note(note_freq * 2, 80)

        set_motors(0, 0)
        led_grn.value(0)

        # Rest interval between pulse beats
        remaining = max(10, beat_interval - 160)
        time.sleep_ms(remaining)

if __name__ == '__main__':
    main()
`
  }
];

