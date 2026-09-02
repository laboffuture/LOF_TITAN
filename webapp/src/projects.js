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
    heroImage: 'lof-titan/invisible-line/invisible-line-main',
    thumbnail: 'lof-titan/invisible-line/invisible-line-main',
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
        image: 'lof-titan/invisible-line/uv-sensor',
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
        image: 'lof-titan/invisible-line/dc-motor',
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
    heroImage: 'lof-titan/banners/banner-heatseek-diy',
    thumbnail: 'lof-titan/banners/banner-heatseek-diy',
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
        image: 'lof-titan/banners/banner-heatseek-diy',
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
        image: 'lof-titan/banners/banner-heatseek-diy',
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
    heroImage: 'lof-titan/banners/banner-heartbeat-diy',
    thumbnail: 'lof-titan/banners/banner-heartbeat-diy',
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
        image: 'lof-titan/banners/banner-heartbeat-diy',
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
        image: 'lof-titan/banners/banner-heartbeat-diy',
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
  },
  {
    id: 'anemometer',
    name: 'Anemometer',
    category: 'Weather & Environment',
    badge: 'DIY Weather Kit',
    rating: 4.9,
    reviews: 0,
    duration: '45 Mins',
    difficulty: 'Builder',
    age: '10+',
    // Version-pinned: Cloudinary serves a replaced asset from the SAME url
    // with Cache-Control max-age=2592000, so a browser that saw the old art
    // keeps it for 30 days. The vNNN segment changes when the bytes do.
    // Get it from the upload response and bump it whenever you re-upload.
    heroImage: 'v1788331984/lof-titan/banners/banner-anemometer',
    thumbnail: 'v1788331984/lof-titan/banners/banner-anemometer',
    tagline: 'Wind Speed Measurement & Live Weather Telemetry',
    assemblyTitle: 'Anemometer Assembly & Integration',
    description:
      'Build an anemometer that measures and displays wind speed. As the wind spins the rotating cups, the system calculates how fast the air is moving. You will learn how wind-driven rotation can be converted into measurable wind-speed data.',
    // Two cards: the Wrench/amber card renders `hardware`, the Zap/rose card
    // renders `electronics`. Titles are overridable per kit.
    safetyWarnings: {
      hardwareTitle: 'Fabrication & Mechanical Safety',
      electronicsTitle: 'Hardware & Electrical Precautions',
      hardware: [
        '⚠️ Make sure the rotating cups and shaft are fixed securely before testing.',
        '⚠️ Keep fingers, hair, and loose clothing away from the rotating parts.',
        '⚠️ Tighten screws and brass inserts carefully without damaging the 3D printed parts.',
        '⚠️ Test the anemometer in a clear area so the rotating assembly does not hit nearby objects.'
      ],
      electronics: [
        '⚠️ Switch off the power before connecting or removing the OLED, encoder, battery, or other electronic parts.',
        '⚠️ Check all connectors and cable orientation before powering the system.',
        '⚠️ Use only the recommended battery and adapter for charging and powering the project.',
        '⚠️ Keep the electronics away from water or excessive moisture during wind-speed testing.'
      ]
    },

    // All three components have artwork. A component missing image/pinMapping/
    // experiment still renders fine - the detail page hides the visual column
    // and the calibration lab for it - so partial data stays safe to ship.
    components: [
      {
        id: 'as5600-encoder',
        image: 'v1788328972/lof-titan/anemometer/as5600-encoder',
        shortName: 'AS5600 Encoder',
        name: 'AS5600 Magnetic Encoder',
        whatIsIt: 'The AS5600 is a magnetic rotary sensor used to detect how much and how fast the anemometer shaft rotates.',
        howItWorks: 'A magnet rotates above the sensor along with the anemometer. The sensor tracks the changing angle, allowing the system to calculate rotational speed.'
      },
      {
        id: 'esp32-s3',
        image: 'v1788330132/lof-titan/anemometer/esp32-s3',
        shortName: 'ESP32-S3',
        name: 'ESP32-S3',
        whatIsIt: 'The ESP32-S3 is the main controller of the anemometer.',
        howItWorks: 'It reads the rotation data, calculates the rotational speed, converts it into a calibrated wind-speed value, and sends the result to the display.'
      },
      {
        id: 'oled-display',
        image: 'v1788330365/lof-titan/anemometer/oled-display',
        shortName: 'OLED Display',
        name: '1.3-inch OLED Display',
        whatIsIt: 'The OLED is a compact screen used to display the measured wind speed.',
        howItWorks: 'It receives the calculated wind-speed data from the controller and displays the value in m/s.'
      }
    ],

    assembly: [
      {
        step: 1,
        title: 'Assemble the Rotor Mechanism',
        desc: 'Connect the three-arm rotor to the central shaft, secure the three removable cups to the arms and check that the rotor spins smoothly.'
      },
      {
        step: 2,
        title: 'Install Magnetic Encoder',
        desc: 'Fit the rotor shaft into the bearing and position the AS5600 encoder below it. Keep the magnet centred above the sensor for accurate rotation sensing.'
      },
      {
        step: 3,
        title: 'Mount LOF TITAN & OLED System',
        desc: 'Secure the LOF TITAN, OLED display, and battery inside the body. Connect the encoder and display, then arrange the wiring neatly.'
      },
      {
        step: 4,
        title: 'Assemble Outer Enclosure',
        desc: 'Fit the enclosure panels around the internal components and secure them with screws. Ensure the rotor remains free to rotate after closing the body.'
      }
    ],

    faq: [
      {
        q: 'The cups are spinning, but the display shows 0 m/s. Why?',
        a: 'Check the magnet position and make sure it is aligned closely above the AS5600 sensor.'
      },
      {
        q: 'The cups are not spinning freely. What should I check?',
        a: 'Check the shaft and bearing alignment and make sure no part is rubbing against the enclosure.'
      },
      {
        q: 'The wind-speed value keeps changing even with steady airflow. Why?',
        a: 'Check for shaft wobble, loose cups, or poor magnet alignment.'
      },
      {
        q: 'The displayed wind speed seems too low. What should I check?',
        a: 'Check that the rotor spins freely and verify the wind-speed calibration in the program.'
      },
      {
        q: 'The OLED is ON, but the value does not change. Why?',
        a: 'Check the AS5600 connection and confirm that the rotor magnet is moving above the sensor.'
      }
    ],

    challengesTitle: 'Aero Mission Challenges',
    challenges: [
      {
        id: 'live-wind-speed',
        level: 'Easy',
        title: 'Challenge 1: Live Wind Speed',
        goal: 'Program the anemometer to measure rotation and display the current wind speed in m/s on the OLED.',
        hint: 'Read the encoder continuously and update the OLED with the calculated wind-speed value.'
      },
      {
        id: 'wind-speed-zones',
        level: 'Intermediate',
        title: 'Challenge 2: Wind Speed Zones',
        goal: 'Classify the measured wind as Low, Medium, or High based on different wind-speed ranges and show the result on the OLED.',
        hint: 'Use conditional blocks to compare the wind-speed value with selected limits.'
      },
      {
        id: 'peak-wind-tracker',
        level: 'Advanced',
        title: 'Challenge 3: Peak Wind Tracker',
        goal: 'Program the system to remember and display the highest wind speed recorded during the test.',
        hint: 'Compare the current reading with the stored maximum value and update it only when a higher speed is detected.'
      }
    ],

    // ---------------------------------------------------------------
    // CONTENT PENDING. Deep sections are deliberately absent rather than
    // filled with guesses about the hardware. The detail page hides any
    // section with no data and renumbers the rest, so this renders
    // correctly as-is. Add these as the content team delivers them:
    //   requirements[]   code
    // Optional page copy: assemblyTitle, codeFilename, outroCopy, specs[]
    // ---------------------------------------------------------------
  },
  {
    id: 'darrieus-turbine',
    name: 'Darrieus Turbine',
    category: 'Wind Energy',
    badge: 'DIY Wind Energy Kit',
    rating: 4.9,
    reviews: 0,
    duration: '45 Mins',
    difficulty: 'Builder',
    age: '10+',
    // Stand-in artwork. Replace once real banner art is uploaded as
    // lof-titan/darrieus-turbine/darrieus-main
    heroImage: 'lof-titan/banners/banner-aquanova',
    thumbnail: 'lof-titan/banners/banner-aquanova',
    tagline: 'Vertical-Axis Wind Turbine & Rotational Energy',
    description:
      'Build a Darrieus vertical-axis wind turbine that converts wind energy into electrical energy. As the wind rotates the turbine, the magnet and coil generate electricity that can be stored using the power module. You will learn how wind-driven rotation can be converted into electrical power.',

    specs: [
      { label: 'ROTOR', value: 'Darrieus VAWT' },
      { label: 'INDUCTION', value: 'Magnet + Copper Coil' },
      { label: 'OUTPUT', value: 'Electrical Energy' },
    ],

    assemblyTitle: 'Darrieus Turbine Assembly & Integration',
    challengesTitle: 'Turbine Mission Challenges',

    safetyWarnings: {
      hardwareTitle: 'Fabrication & Mechanical Safety',
      electronicsTitle: 'Hardware & Electrical Precautions',
      hardware: [
        '⚠️ Keep hands and loose clothing away from rotating blades.',
        '⚠️ Secure the blades, shaft, magnets, and bearings firmly.',
        '⚠️ Keep the blower stable and at a safe distance.',
        '⚠️ Handle neodymium magnets carefully to avoid sudden snapping and pinching.'
      ],
      electronics: [
        '⚠️ Switch off the system before connecting the battery, charging PCB, coil, or other electrical parts.',
        '⚠️ Check wiring and polarity before powering or charging the system.',
        '⚠️ Use only the recommended battery and charging module.',
        '⚠️ Avoid touching exposed coil wires while the system is powered.'
      ]
    },

    components: [
      {
        id: 'smart-charging-pcb',
        shortName: 'Charging PCB',
        name: 'Smart Charging PCB',
        // Upload artwork, then set this to the Cloudinary public id:
        //   image: 'lof-titan/darrieus-turbine/smart-charging-pcb',
        image: '',
        whatIsIt: 'The smart charging PCB manages the electrical power generated by the turbine.',
        howItWorks: 'It converts and regulates the generated electrical output so it can be supplied safely to the rechargeable battery.'
      },
      {
        id: 'copper-coil',
        shortName: 'Copper Coil',
        name: 'Copper Coil',
        //   image: 'lof-titan/darrieus-turbine/copper-coil',
        image: '',
        whatIsIt: 'A copper coil is a wire wound into multiple turns to help generate electrical energy.',
        howItWorks: 'When the magnetic field changes near the coil, a voltage is induced and electrical output is produced.'
      },
      {
        id: 'neodymium-magnet',
        shortName: 'Neodymium Magnet',
        name: 'Neodymium Magnet',
        //   image: 'lof-titan/darrieus-turbine/neodymium-magnet',
        image: '',
        whatIsIt: 'A strong permanent magnet used to provide the magnetic field for electricity generation.',
        howItWorks: 'As the turbine rotates, the magnet moves relative to the copper coil, creating a changing magnetic field that induces voltage.'
      }
    ],

    assembly: [
      {
        step: 1,
        title: 'Assemble the Rotor',
        desc: 'Assemble the turbine blades around the central shaft and secure the rotating structure firmly.'
      },
      {
        step: 2,
        title: 'Install the Neodymium Magnet',
        desc: 'Fix the neodymium magnet securely in the designated rotor section so it rotates with the turbine.'
      },
      {
        step: 3,
        title: 'Install the Copper Coil',
        desc: 'Place the copper coil securely inside the turbine base, then position the blade-and-shaft assembly above it with proper alignment.'
      },
      {
        step: 4,
        title: 'Integrate the Power System',
        desc: 'Connect the coil to the smart charging PCB, install the battery, complete the power connections, and secure the electronics in place.'
      }
    ],

    faq: [
      {
        q: 'The turbine blades are not rotating smoothly. What should I check?',
        a: 'Check the shaft alignment also the bearings and make sure the rotor is not rubbing against the frame.'
      },
      {
        q: 'The turbine is rotating, but no voltage is generated. Why?',
        a: 'Check the neodymium magnet position, copper coil connection, and coil output wire is connected correctly to the PCB.'
      },
      {
        q: 'The multimeter shows a very low voltage. What should I check?',
        a: 'Check the turbine speed and make sure the magnet and copper coil are correctly aligned with a suitable gap.'
      },
      {
        q: 'The turbine shakes while rotating. Why?',
        a: 'Check whether the blade assembly is balanced and securely fixed to the central shaft.'
      },
      {
        q: 'The battery is not charging. What should I check?',
        a: 'Check the coil-to-PCB connection, battery connection, and confirm that the turbine is generating sufficient voltage.'
      }
    ],

    challenges: [
      {
        id: 'blade-configuration',
        level: 'Beginner',
        title: 'Challenge 1: Blade Configuration Challenge',
        goal: 'Change the number of turbine blades and test each setup under the same wind condition. Compare the rotational performance and electrical output to identify the best-performing configuration.',
        hint: 'Keep the blower speed and distance the same for every test.'
      },
      {
        id: 'magnet-coil-gap',
        level: 'Intermediate',
        title: 'Challenge 2: Magnet-Coil Gap Challenge',
        goal: 'Change the distance between the rotating neodymium magnet and copper coil and observe how it affects the generated voltage.',
        hint: 'Adjust the gap in small steps and record the voltage for each test.'
      },
      {
        id: 'custom-vawt-rotor',
        level: 'Advanced',
        title: 'Challenge 3: Create Your Own VAWT Rotor',
        goal: 'Explore different vertical-axis wind turbine rotor shapes, select one, adapt it to the existing turbine dimensions, then CAD-design and 3D-print your own rotor. Test the new rotor under the same wind condition and compare its rotational performance and electrical output with the original rotor.',
        hint: 'Keep the shaft size, generator setup, and blower position unchanged for a fair comparison.'
      }
    ],

    // ---------------------------------------------------------------
    // CONTENT PENDING: requirements[] (bill of materials) and code.
    // Component images: slots above are ready, upload masters to
    //   lof-titan/darrieus-turbine/<component-id>
    // ---------------------------------------------------------------
  },
  {
    id: 'anti-icing-systems',
    name: 'Anti-Icing Systems',
    category: 'Aerospace & Thermal',
    badge: 'DIY Thermal Kit',
    rating: 4.9,
    reviews: 0,
    duration: '45 Mins',
    difficulty: 'Innovator',
    age: '10+',
    // Stand-in artwork. Replace once real banner art is uploaded as
    // lof-titan/anti-icing-systems/anti-icing-main
    heroImage: 'lof-titan/banners/banner-invisible',
    thumbnail: 'lof-titan/banners/banner-invisible',
    tagline: 'Aircraft Wing Ice Detection & Prevention',
    description:
      'Build an aircraft anti-icing system that detects cold conditions and activates heating to help prevent ice from forming on the wing. You will learn how temperature affects aircraft surfaces and how heating systems help keep wings safe in cold weather.',

    specs: [
      { label: 'SENSOR', value: 'DS18B20 Temperature Sensor' },
      { label: 'ACTUATOR', value: '12V Silicone Heater Pad' },
      { label: 'MCU', value: 'ESP32-S3 TITAN' },
    ],

    assemblyTitle: 'Anti-Icing System Assembly & Integration',
    challengesTitle: 'Anti-Icing Mission Challenges',

    safetyWarnings: {
      hardwareTitle: 'Thermal & Material Safety',
      electronicsTitle: 'Hardware & Electrical Precautions',
      hardware: [
        '⚠️ Do not touch the heater pad or heated wing surface during operation.',
        '⚠️ Allow the heater pad and aluminium foil to cool before handling or adjusting them.',
        '⚠️ Fix the heater pad and thermal tape securely so they do not peel or shift during testing.',
        '⚠️ Do not leave the heating system ON continuously without supervision.'
      ],
      electronics: [
        '⚠️ Switch off the power before connecting or removing the heater pad, temperature sensor, OLED, or battery.',
        '⚠️ Check all connectors and polarity before powering the system.',
        '⚠️ Use only the recommended 12V battery and adapter for the project.',
        '⚠️ Do not touch exposed electrical connections while the system is powered.'
      ]
    },

    components: [
      {
        id: 'lof-titan-esp32s3',
        shortName: 'LOF TITAN',
        name: 'LOF TITAN (ESP32-S3)',
        // Upload artwork, then set this to the Cloudinary public id:
        //   image: 'lof-titan/anti-icing-systems/lof-titan-esp32s3',
        image: '',
        whatIsIt: 'The main controller of the anti-icing system.',
        howItWorks: 'It reads the temperature, controls the heating response, and updates the display.'
      },
      {
        id: 'oled-display',
        shortName: 'OLED Display',
        name: '1.3-inch OLED Display',
        //   image: 'lof-titan/anti-icing-systems/oled-display',
        image: '',
        whatIsIt: 'A compact display used to show temperature and system status.',
        howItWorks: 'It displays the temperature reading and whether the heating system is active.'
      },
      {
        id: 'ds18b20-sensor',
        shortName: 'DS18B20 Sensor',
        name: 'DS18B20 Temperature Sensor',
        //   image: 'lof-titan/anti-icing-systems/ds18b20-sensor',
        image: '',
        whatIsIt: 'A waterproof digital sensor used to measure the temperature near the wing surface.',
        howItWorks: 'It continuously sends temperature readings to the controller so the system can identify cold conditions.'
      },
      {
        id: 'silicone-heater-pad',
        shortName: 'Heater Pad',
        name: '12V Silicone Heater Pad',
        //   image: 'lof-titan/anti-icing-systems/silicone-heater-pad',
        image: '',
        whatIsIt: 'A flexible heating element used to warm the wing surface.',
        howItWorks: 'When powered, it converts electrical energy into heat to help prevent or remove ice formation.'
      }
    ],

    assembly: [
      {
        step: 1,
        title: 'Install the Wing Heating System',
        desc: 'Fix the silicone heater pad securely onto the wing section.'
      },
      {
        step: 2,
        title: 'Add the Thermal Distribution Layer',
        desc: 'Apply aluminium foil or thermal transfer tape over the heater area to spread heat across the surface.'
      },
      {
        step: 3,
        title: 'Position the Temperature Sensor',
        desc: 'Mount the DS18B20 close to the heated wing section for accurate temperature monitoring.'
      },
      {
        step: 4,
        title: 'Integrate the Control Electronics',
        desc: 'Connect the temperature sensor, OLED display, heater control system, and power supply to the LOF TITAN.'
      }
    ],

    faq: [
      {
        q: 'The temperature is low, but the heater does not turn ON. What should I check?',
        a: 'Check the heater power connection and confirm that the temperature is below the programmed activation limit.'
      },
      {
        q: 'The heater stays ON even after the wing becomes warm. Why?',
        a: 'Check the temperature sensor reading and the heater ON/OFF conditions in the program.'
      },
      {
        q: 'The displayed temperature is incorrect or does not change. What should I check?',
        a: 'Check the DS18B20 connection and make sure the sensor is in proper contact with the wing surface.'
      },
      {
        q: 'The heater works, but only one part of the wing becomes warm. Why?',
        a: 'Check that the heater pad and thermal transfer layer are flat and making good contact across the surface.'
      },
      {
        q: 'The OLED is powered, but no temperature value appears. What should I check?',
        a: 'Check the DS18B20 and OLED connections and confirm that both are being detected by the controller.'
      }
    ],

    challenges: [
      {
        id: 'smart-sensor-placement',
        level: 'Beginner',
        title: 'Challenge 1: Smart Sensor Placement',
        goal: 'Test the temperature sensor at different positions around the wing heating zone. Compare the readings and identify the position that gives the most useful temperature data.',
        hint: 'Keep the heater setting the same and change only the sensor position.'
      },
      {
        id: 'sensor-housing-design',
        level: 'Intermediate',
        title: 'Challenge 2: Design a Sensor Housing',
        goal: 'CAD-design and fabricate a small mount that holds the temperature sensor firmly against the wing surface.',
        hint: 'Keep the sensor secure while maintaining good contact with the surface.'
      },
      {
        id: 'redesign-anti-icing-wing',
        level: 'Advanced',
        title: 'Challenge 3: Redesign the Anti-Icing Wing',
        goal: 'Study the existing wing CAD model, identify one improvement, modify the design, fabricate the updated part, and integrate the same heater pad and temperature sensor.',
        hint: 'Focus on improving heater placement, sensor mounting, or heat distribution while keeping the existing system components.'
      }
    ],

    // ---------------------------------------------------------------
    // CONTENT PENDING: requirements[] (bill of materials) and code.
    // Component images: slots above are ready, upload masters to
    //   lof-titan/anti-icing-systems/<component-id>
    // ---------------------------------------------------------------
  },
  {
    id: 'hydraulic-landing-gear',
    name: 'Hydraulic Landing Gear',
    category: 'Aerospace & Mechanics',
    badge: 'DIY Hydraulics Kit',
    rating: 4.9,
    reviews: 0,
    duration: '45 Mins',
    difficulty: 'Innovator',
    age: '10+',
    // Stand-in artwork, and the last distinct banner available - it is also the
    // Axes 3 carousel slide, so the two now share an image. Replace once real
    // art is uploaded as lof-titan/hydraulic-landing-gear/landing-gear-main
    heroImage: 'lof-titan/banners/banner-axes3',
    thumbnail: 'lof-titan/banners/banner-axes3',
    tagline: 'Aircraft Landing Gear Deploy & Retract',
    description:
      'Build a hydraulic landing gear system that demonstrates how aircraft wheels deploy and retract during landing operations. You will learn how fluid pressure can be used to move mechanical parts smoothly and control the landing gear mechanism.',

    specs: [
      { label: 'MECHANISM', value: 'Hydraulic System' },
      { label: 'ACTUATOR', value: '12V 30 RPM DC Motor' },
      { label: 'MOTION', value: 'Deploy & Retract' },
    ],

    assemblyTitle: 'Hydraulic Landing Gear Assembly & Integration',
    challengesTitle: 'Landing Gear Challenges',

    safetyWarnings: {
      hardwareTitle: 'Hydraulic & Mechanical Safety',
      electronicsTitle: 'Hardware & Electrical Precautions',
      hardware: [
        '⚠️ Make sure the syringe and silicone tube connections are tight to prevent fluid leakage.',
        '⚠️ Remove air bubbles from the hydraulic line as trapped air can cause weak movement.',
        '⚠️ Do not force the syringe beyond its movement limit.',
        '⚠️ Keep fingers clear of the landing gear mechanism while it deploys or retracts.'
      ],
      electronics: [
        '⚠️ Switch off the power before connecting the motor, adapter, switch, or other electrical parts.',
        '⚠️ Check the motor wiring and connections before powering the system.',
        '⚠️ Use only the recommended 12V adapter for operating the landing gear setup.',
        '⚠️ Keep hands away from moving gears, linkages, and rotating motor parts during operation.'
      ]
    },

    components: [
      {
        id: 'dc-motor-30rpm',
        shortName: 'DC Motor',
        name: '12V 30 RPM DC Motor',
        // Upload artwork, then set this to the Cloudinary public id:
        //   image: 'lof-titan/hydraulic-landing-gear/dc-motor-30rpm',
        image: '',
        whatIsIt: 'A geared motor that provides controlled mechanical movement.',
        howItWorks: 'It drives the mechanism that operates the hydraulic system.'
      },
      {
        id: 'hydraulic-syringe',
        shortName: 'Hydraulic Syringe',
        name: 'Hydraulic Syringe',
        //   image: 'lof-titan/hydraulic-landing-gear/hydraulic-syringe',
        image: '',
        whatIsIt: 'A syringe that acts as the hydraulic cylinder.',
        howItWorks: 'Fluid pressure moves the plunger to operate the landing gear mechanism.'
      },
      {
        id: 'silicone-tube',
        shortName: 'Silicone Tube',
        name: 'Silicone Tube',
        //   image: 'lof-titan/hydraulic-landing-gear/silicone-tube',
        image: '',
        whatIsIt: 'A flexible tube that carries fluid through the hydraulic system.',
        howItWorks: 'It transfers fluid pressure between the hydraulic sections.'
      }
    ],

    assembly: [
      {
        step: 1,
        title: 'Assemble Landing Gear Mechanism',
        desc: 'Connect the landing gear sections and secure the moving joints so the gear can deploy and retract smoothly.'
      },
      {
        step: 2,
        title: 'Install Hydraulic Cylinder',
        desc: 'Position the syringe in the landing gear mechanism and connect the silicone tube firmly to create the hydraulic line.'
      },
      {
        step: 3,
        title: 'Mount Motor Drive',
        desc: 'Secure the 12V DC motor and connect it to the mechanism that drives the hydraulic syringe.'
      },
      {
        step: 4,
        title: 'Connect Hydraulic Controls',
        desc: 'Connect the motor, SPDT switch, and 12V power supply to control the landing gear deployment and retraction.'
      }
    ],

    faq: [
      {
        q: 'The landing gear does not move at all. What should I check?',
        a: 'Check the 12V power supply, motor connection, and switch wiring.'
      },
      {
        q: 'The landing gear moves only in one direction. Why?',
        a: 'Check the SPDT switch connections and motor polarity.'
      },
      {
        q: 'The landing gear does not fully deploy or retract. What should I check?',
        a: 'Check the syringe travel and make sure the mechanism is not blocked.'
      },
      {
        q: 'Fluid is leaking from the hydraulic system. What should I do?',
        a: 'Check the tube and syringe connections and refit any loose joints.'
      },
      {
        q: 'The motor runs, but the landing gear does not move. Why?',
        a: 'Check whether the motor drive is properly connected to the syringe mechanism.'
      }
    ],

    challenges: [
      {
        id: 'fluid-performance',
        level: 'Beginner',
        title: 'Challenge 1: Fluid Performance Activity',
        goal: 'Test different trainer-approved fluids and compare how smoothly and quickly the landing gear deploys and retracts.',
        hint: 'Keep the syringe, tube, and mechanism the same and change only the fluid.'
      },
      {
        id: 'compact-retracting-gear',
        level: 'Intermediate',
        title: 'Challenge 2: Compact Retracting Gear',
        goal: 'Study how much space the current mechanism uses and redesign selected linkage or mounting parts so the wheel folds into a smaller space while keeping the same hydraulic operation.',
        hint: 'Focus on linkage position, folding angle, and available space.'
      },
      {
        id: 'redesign-landing-gear',
        level: 'Advanced',
        title: 'Challenge 3: Redesign the Landing Gear',
        goal: 'Study the existing landing gear system, identify one mechanical improvement, modify it in CAD, fabricate the updated part, and test the deploy-and-retract motion.',
        hint: 'Improve compactness, movement range, or stability without changing the hydraulic system.'
      }
    ],

    // ---------------------------------------------------------------
    // CONTENT PENDING: requirements[] (bill of materials) and code.
    // NOTE: this kit is switch-and-motor driven; if it never runs code on the
    // TITAN board, leave `code` unset and the Firmware section stays hidden.
    // Component images: slots above are ready, upload masters to
    //   lof-titan/hydraulic-landing-gear/<component-id>
    // ---------------------------------------------------------------
  },
  {
    id: 'rc-plane',
    name: 'RC Plane',
    category: 'Aerospace & Flight',
    badge: 'DIY Aircraft Kit',
    rating: 4.9,
    reviews: 0,
    duration: '45 Mins',
    difficulty: 'Engineer',
    age: '10+',
    // Stand-in artwork - every real banner is now claimed, so this one is shared
    // with the Aqua Nova carousel slide. Replace once art is uploaded as
    // lof-titan/rc-plane/rc-plane-main
    heroImage: 'lof-titan/banners/banner-aquanova-diy',
    thumbnail: 'lof-titan/banners/banner-aquanova-diy',
    tagline: '4-Channel Foam Board Aircraft & Flight Control',
    description:
      'Build a 4-channel RC plane using foam board and integrate the systems needed for thrust, pitch, yaw, and roll control. You will learn how aerodynamics, aircraft structure, propulsion, and control surfaces work together to achieve controlled flight.',

    specs: [
      { label: 'PROPULSION', value: 'BLDC Motor + Propeller + ESC' },
      { label: 'ACTUATION', value: 'Servo Motors' },
      { label: 'CONTROLS', value: '4-Channel RC Control' },
    ],

    assemblyTitle: 'RC Plane Assembly & Integration',
    challengesTitle: 'RC Plane Mission Challenges',

    safetyWarnings: {
      hardwareTitle: 'Propeller & Flight Safety',
      electronicsTitle: 'Hardware & Electrical Precautions',
      hardware: [
        '⚠️ Keep hands, hair, and loose clothing away from the propeller at all times.',
        '⚠️ Never power the motor while your hands are near the propeller.',
        '⚠️ Test the RC plane only in a clear open area away from people and obstacles.',
        '⚠️ Check that the control surfaces move correctly before every flight.'
      ],
      electronics: [
        '⚠️ Disconnect the battery before connecting or adjusting the motor, ESC, servos, or receiver.',
        '⚠️ Check all wiring and polarity before powering the RC plane.',
        '⚠️ Use only the recommended battery, ESC, motor, and propeller combination.',
        '⚠️ Keep the electronics dry and secure all connections before flight.'
      ]
    },

    components: [
      {
        id: 'bldc-motor',
        shortName: 'BLDC Motor',
        name: 'BLDC Motor',
        // Upload artwork, then set this to the Cloudinary public id:
        //   image: 'lof-titan/rc-plane/bldc-motor',
        image: '',
        whatIsIt: 'A high-speed motor used to generate thrust for the aircraft.',
        howItWorks: 'It spins the propeller at high speed to push air backward and move the plane forward.'
      },
      {
        id: 'propeller',
        shortName: 'Propeller',
        name: '5" Propeller',
        //   image: 'lof-titan/rc-plane/propeller',
        image: '',
        whatIsIt: 'A rotating blade attached to the motor shaft.',
        howItWorks: 'Its blades push air backward, producing the thrust needed for flight.'
      },
      {
        id: 'esc',
        shortName: 'ESC',
        name: 'Electronic Speed Controller (ESC)',
        //   image: 'lof-titan/rc-plane/esc',
        image: '',
        whatIsIt: 'An electronic controller that manages the BLDC motor speed.',
        howItWorks: 'It regulates power from the battery to the motor based on the throttle command.'
      },
      {
        id: 'servo-motor',
        shortName: 'Servo Motor',
        name: 'Servo Motor',
        //   image: 'lof-titan/rc-plane/servo-motor',
        image: '',
        whatIsIt: 'A small motor used to move the aircraft control surfaces.',
        howItWorks: 'The servos move the elevator, rudder, and ailerons to control pitch, yaw, and roll.'
      },
      {
        id: 'rc-transmitter',
        shortName: 'Transmitter',
        name: 'RC Transmitter',
        //   image: 'lof-titan/rc-plane/rc-transmitter',
        image: '',
        whatIsIt: 'A handheld controller used to control the RC plane wirelessly.',
        howItWorks: 'It sends throttle, elevator, rudder, and aileron commands to the receiver on the aircraft.'
      },
      {
        id: 'rc-receiver',
        shortName: 'Receiver',
        name: 'RC Receiver',
        //   image: 'lof-titan/rc-plane/rc-receiver',
        image: '',
        whatIsIt: 'A device that receives control commands from the transmitter.',
        howItWorks: 'It sends the throttle and control commands to the ESC and servos.'
      },
      {
        id: 'battery',
        shortName: 'Battery',
        name: 'Battery',
        //   image: 'lof-titan/rc-plane/battery',
        image: '',
        whatIsIt: 'The main power source of the RC plane.',
        howItWorks: 'It supplies electrical power to the ESC, motor, servos, and control system.'
      }
    ],

    assembly: [
      {
        step: 1,
        title: 'Install Motor & Propeller',
        desc: 'Mount the BLDC motor securely and attach the 5" propeller in the correct orientation.'
      },
      {
        step: 2,
        title: 'Connect the ESC',
        desc: 'Connect the ESC to the BLDC motor and position it securely for reliable motor control.'
      },
      {
        step: 3,
        title: 'Install the Servo Motors',
        desc: 'Mount the three servos and link them to the aileron, elevator, and rudder for control-surface movement.'
      },
      {
        step: 4,
        title: 'Integrate the RC Control System',
        desc: 'Connect the ESC and servos to the receiver, pair it with the transmitter, secure the battery in position.'
      }
    ],

    faq: [
      {
        q: 'The motor does not spin when throttle is increased. What should I check?',
        a: 'Check the battery, ESC connection, and motor wiring.'
      },
      {
        q: 'The propeller spins, but the plane produces very little thrust. Why?',
        a: 'Check the propeller direction and make sure it is fitted in the correct orientation.'
      },
      {
        q: 'A control surface is moving in the wrong direction. What should I do?',
        a: 'Reverse that control channel in the transmitter settings.'
      },
      {
        q: 'One servo is not responding. What should I check?',
        a: 'Check the servo connection and confirm it is connected to the correct receiver channel.'
      },
      {
        q: 'The plane feels unbalanced before flight. What should I check?',
        a: 'Check the battery and component positions and adjust them until the aircraft balances at the recommended centre of gravity.'
      }
    ],

    challenges: [
      {
        id: 'payload-flight',
        level: 'Beginner',
        title: 'Challenge 1: Payload Flight Challenge',
        goal: 'Design a removable lightweight payload holder near the aircraft centre of gravity. Add small loads gradually and observe how increasing weight affects take-off, stability, and flight performance.',
        hint: 'Keep the payload close to the centre of gravity and increase the weight in small steps.'
      },
      {
        id: 'wingtip-modification',
        level: 'Intermediate',
        title: 'Challenge 2: Wingtip Modification Challenge',
        goal: 'Design and fabricate removable wingtip extensions or winglets for the existing RC plane. Test the original and modified versions and compare their stability and turning behaviour.',
        hint: 'Keep both wingtip modifications symmetrical and lightweight.'
      },
      {
        id: 'build-your-own-aircraft',
        level: 'Advanced',
        title: 'Challenge 3: Build Your Own RC Aircraft',
        goal: 'Choose a real aircraft, study its overall shape and structure, then design and build your own RC plane inspired by it.',
        hint: 'Keep the aircraft lightweight, balanced, and compatible with the existing electronics.'
      }
    ],

    // ---------------------------------------------------------------
    // CONTENT PENDING: requirements[] (bill of materials).
    // No `code` - this kit is flown from an RC transmitter and does not run
    // firmware on the TITAN board, so the Firmware section stays hidden.
    // Component images: slots above are ready, upload masters to
    //   lof-titan/rc-plane/<component-id>
    // ---------------------------------------------------------------
  },
  {
    id: 'terrain-trek',
    name: 'Terrain Trek',
    category: 'Mobility & Terrain',
    badge: 'DIY Terrain Kit',
    rating: 4.9,
    reviews: 0,
    // PLACEHOLDER - confirm with the content team.
    duration: '45 Mins',
    difficulty: 'Builder',
    age: '10+',
    // Stand-in artwork, and the LAST unclaimed banner. It is also the Invisible
    // Line Patrol carousel slide, so the two now share an image. Replace once
    // real art is uploaded as lof-titan/terrain-trek/terrain-trek-main
    heroImage: 'lof-titan/banners/banner-invisible-diy',
    thumbnail: 'lof-titan/banners/banner-invisible-diy',
    tagline: 'All-Terrain Mobility & Chassis Design',
    // PLACEHOLDER description. Deliberately makes no claim about the drive
    // system, sensors or chassis - none of that is known yet.
    description:
      'Build a vehicle that can travel across uneven ground, and explore what lets a chassis stay stable and keep moving over rough terrain.',
    // ---------------------------------------------------------------
    // CONTENT PENDING. Deep sections are deliberately absent rather than
    // filled with guesses about the hardware. The detail page hides any
    // section with no data and renumbers the rest, so this renders
    // correctly as-is. Add these as the content team delivers them:
    //   requirements[]  components[]  assembly[]  code  faq[]  challenges[]
    // Optional copy: assemblyTitle, challengesTitle, faqTitle, codeFilename,
    //   outroCopy, specs[], safetyWarnings{}
    // Also confirm: duration, difficulty, age, badge (placeholders above).
    // ---------------------------------------------------------------
  }
];
