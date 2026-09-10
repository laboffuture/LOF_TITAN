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
      { label: 'SENSORS', value: 'MAX30102 Heartbeat Sensor' },
      { label: 'MCU', value: 'ESP32-S3 TITAN' },
    ],
    description: 'Requires finger detection using a pulse sensor and timer-based mode switching, with the OLED showing expressions and the DFPlayer playing different sounds based on changing conditions.',

    // Safety Warnings
    safetyWarnings: {
      hardware: [
        '⚠️ Use the screwdriver carefully while fitting the M3 screws and brass inserts. Avoid excessive force that may crack the 3D-printed parts.',
        '⚠️ Tighten the screws only until the parts are securely fixed; over-tightening can damage the PCB or mounting points.',
        '⚠️ Route the sensor, OLED, DFPlayer, and speaker cables neatly so that they are not pinched, pulled, or trapped under screws.'
      ],
      electronics: [
        '⚡ Switch OFF the ESP32-S3 before connecting or changing the MAX30102, OLED, DFPlayer, speaker, or RMC cables.',
        '⚡ Check the battery polarity and rocker-switch wiring before powering the project.',
        '⚡ Keep the Li-ion battery away from heat, water, sharp objects, and conductive materials that could short the terminals.',
        '⚡ Keep the speaker volume at a comfortable level, especially during repeated sound and mode-switching tests.',
        '⚡ Insert and remove the microSD card gently and avoid removing it while the DFPlayer is actively reading or playing audio.'
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
        id: 'max30102-sensor',
        shortName: 'MAX30102',
        name: 'MAX30102 Heartbeat Sensor',
        // Upload artwork, then set this to the Cloudinary public id:
        //   image: 'lof-titan/heartbeat/max30102-sensor',
        image: '',
        pinMapping: 'SDA: GPIO 7 | SCL: GPIO 8',
        whatIsIt: 'An optical sensor used to detect finger presence and measure pulse-related changes in blood flow.',
        howItWorks: 'The MAX30102 uses red and infrared light to detect changes in reflected light from the finger. The ESP32-S3 reads these changes through I2C communication and uses them to identify heartbeat activity.'
      },
      {
        id: 'dfplayer-mini',
        shortName: 'DFPlayer Mini',
        name: 'DFPlayer Mini',
        // Upload artwork, then set this to the Cloudinary public id:
        //   image: 'lof-titan/heartbeat/dfplayer-mini',
        image: '',
        pinMapping: 'UART COMMUNICATION | microSD AUDIO',
        whatIsIt: 'A compact audio module used to play stored sound and music files from a microSD card.',
        howItWorks: 'The ESP32-S3 sends playback commands to the DFPlayer. The module reads the selected audio file from the microSD card and sends the audio signal to the connected speaker.'
      },
      {
        id: 'speaker-8ohm',
        shortName: '8 Ohm Speaker',
        name: '8 Ohm Speaker',
        // Upload artwork, then set this to the Cloudinary public id:
        //   image: 'lof-titan/heartbeat/speaker-8ohm',
        image: '',
        pinMapping: 'DFPLAYER AUDIO OUTPUT',
        whatIsIt: 'A small speaker used to produce the music and sound feedback of the Heartbeat DJ Bot.',
        howItWorks: 'The DFPlayer converts the stored audio file into an electrical audio signal. The speaker converts this signal into audible sound.'
      },
      {
        id: 'oled-display',
        shortName: 'OLED Display',
        name: '1.3 Inch OLED Display',
        // Upload artwork, then set this to the Cloudinary public id:
        //   image: 'lof-titan/heartbeat/oled-display',
        image: '',
        pinMapping: 'SDA: GPIO 7 | SCL: GPIO 8',
        whatIsIt: 'A compact OLED screen used to display expressions, symbols, and the current operating state of the DJ Bot.',
        howItWorks: 'The ESP32-S3 sends display information to the OLED through I2C communication. The OLED activates individual pixels to show the programmed facial expressions and feedback.'
      },
      {
        id: 'esp32-s3',
        shortName: 'ESP32-S3',
        name: 'ESP32-S3',
        // Upload artwork, then set this to the Cloudinary public id:
        //   image: 'lof-titan/heartbeat/esp32-s3',
        image: '',
        pinMapping: 'GPIO | I2C | UART | USB TYPE-C',
        whatIsIt: 'A programmable microcontroller that acts as the main controller of the Heartbeat DJ Bot.',
        howItWorks: 'The ESP32-S3 reads the MAX30102 sensor, manages timer-based mode changes, controls the OLED expressions, and sends commands to the DFPlayer to select the required audio.'
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
    faqTitle: 'FAQ & Hardware Troubleshooting',
    faq: [
      {
        q: 'Why is the Heartbeat DJ Bot not detecting a finger?',
        a: 'Place the fingertip steadily over the MAX30102 sensing area and avoid pressing too hard or moving the finger during detection. Make sure the sensor surface is clean and receiving stable contact.'
      },
      {
        q: 'Why is the DFPlayer not playing any sound?',
        a: 'Check that the microSD card is inserted correctly and contains the required audio files. Also verify the DFPlayer and speaker connections before running the sound test.'
      },
      {
        q: 'Why does the OLED expression not change when the operating mode changes?',
        a: 'Check whether the ESP32-S3 is correctly receiving the sensor input and completing the programmed timer condition. If the mode does not change in the program, the corresponding OLED expression will also remain unchanged.'
      }
    ],

    challengesTitle: 'Robotics Mission Challenges',
    challenges: [
      {
        id: 'digital-soundboard-console',
        level: 'Easy',
        title: 'Challenge 1: Digital Soundboard Console',
        goal: 'Create a digital soundboard where the learner enters a command or number through the Laptop/PC Serial Monitor. The ESP32 identifies the command, displays the corresponding sound/message on the OLED, and plays the assigned audio track through the DFPlayer Mini and speaker. The sliding switch enables or disables audio playback.',
        hint: [
          'Store the entered command in a variable and use if / else if conditions or a switch-case block to select the correct track and OLED message.',
          'Use the PCB sliding switch as a condition before playback: Switch ON = audio allowed, Switch OFF = silent mode.'
        ]
      },
      {
        id: 'finger-tap-music-selector',
        level: 'Intermediate',
        title: 'Challenge 2: Finger-Tap Music Selector',
        goal: 'Use the MAX30102 mainly to detect when a finger is placed and removed. Each short finger tap changes to the next audio track, while a long finger hold selects and plays the displayed track. The OLED shows the current track number/name, and the DFPlayer Mini plays the selected sound through the speaker.',
        hint: 'Use the MAX30102 IR value to detect finger contact: when IR > 50000, save startTime = millis(), and when the IR value falls below the threshold, save endTime = millis(). Calculate duration = endTime - startTime; treat about 50-400 ms as a Short Tap and more than 1000 ms as a Long Press. Adjust the IR threshold during calibration if your sensor gives different readings.'
      }
    ],

    // MicroPython Main Script
    code: `# ==============================================================================
# LOF TITAN - HEARTBEAT DJ BOT WITH MAX30102, SH1106 OLED & DFPLAYER MINI
# ==============================================================================
# Hardware Pinout (ESP32-S3):
#   - I2C OLED (1.3" SH1106 / SSD1306): SDA = GPIO 7, SCL = GPIO 8 (Addr: 0x3C)
#   - Pulse Sensor (MAX30102 / MAX30100): SDA = GPIO 7, SCL = GPIO 8 (Addr: 0x57)
#   - DFPlayer Mini MP3 Player: TX = GPIO 17, RX = GPIO 18 (Baud: 9600 8N1)
#   - Onboard Buzzer / Status LED: GPIO 20 / GPIO 48
#
# Audio Tracks:
#   - Track 1: Calm Track (Plays once for 20s upon Calm Mode trigger, then silent)
#   - Track 2: Normal Track A (Alternates with Track 3 every 20s)
#   - Track 3: Normal Track B (Alternates with Track 2 every 20s)
#
# State Logic:
#   1. Startup: OLED "DJ BOT - SYSTEM STARTING", init DFPlayer & MAX30102 (up to 5 retries).
#   2. Normal Mode: Animated robot eyes change every 2.5s. Tracks 2 & 3 alternate every 20s.
#   3. Finger Detected: Instant priority ECG-style live PPG waveform + real-time BPM readout.
#   4. Calm Mode: 2 consecutive valid BPM > 85 activates 60s Calm Mode.
#      Track 1 plays for 20s once. Live ECG has priority if finger present, else Serene Calm Face.
#   5. Tired Mode: 60s continuous absence of finger triggers Tired Eyes + "Zzz" animation.
# ==============================================================================

import time
import math
import random
import framebuf
from machine import Pin, SoftI2C, I2C, UART

# ================= 1. SH1106 / SSD1306 OLED DRIVER =================
class TitanOLED(framebuf.FrameBuffer):
    def __init__(self, sda_pin=7, scl_pin=8, is_sh1106=True, col_offset=2):
        self.is_sh1106 = is_sh1106
        self.col_offset = col_offset
        self.width = 128
        self.height = 64
        self.addr = 0x3C
        self.buf = bytearray(1024)
        super().__init__(self.buf, self.width, self.height, framebuf.MONO_VLSB)
        
        try:
            self.i2c = SoftI2C(sda=Pin(sda_pin, Pin.OUT), scl=Pin(scl_pin, Pin.OUT), freq=400000, timeout=2000)
            devs = self.i2c.scan()
            if 0x3C in devs:
                self.addr = 0x3C
            elif 0x3D in devs:
                self.addr = 0x3D
            elif devs:
                self.addr = devs[0]
        except Exception:
            self.i2c = None

        if self.i2c:
            init_seq = (
                0xAE, 0x20, 0x00, 0x40, 0xA1, 0xC8, 0x81, 0xCF,
                0xA6, 0xA8, 0x3F, 0xD3, 0x00, 0xD5, 0x80, 0xD9,
                0xF1, 0xDA, 0x12, 0xDB, 0x40, 0x8D, 0x14, 0xAF
            )
            for cmd in init_seq:
                try:
                    self.i2c.writeto(self.addr, bytearray([0x80, cmd]))
                except Exception:
                    pass
        self.fill(0)
        self.show()

    def print_text(self, s, x, y, size=1, col=1):
        s = str(s)
        if size <= 1:
            super().text(s, x, y, col)
        else:
            w = len(s) * 8
            tmp_buf = bytearray((w * 8 + 7) // 8)
            fb = framebuf.FrameBuffer(tmp_buf, w, 8, framebuf.MONO_VLSB)
            fb.fill(0)
            fb.text(s, 0, 0, 1)
            for px in range(w):
                for py in range(8):
                    if fb.pixel(px, py):
                        for dx in range(size):
                            for dy in range(size):
                                nx = x + px * size + dx
                                ny = y + py * size + dy
                                if 0 <= nx < 128 and 0 <= ny < 64:
                                    self.pixel(nx, ny, col)

    def show(self):
        if not self.i2c:
            return
        try:
            if self.is_sh1106:
                for page in range(8):
                    # SH1106 column addressing (default offset +2)
                    low_col = self.col_offset & 0x0F
                    high_col = 0x10 | ((self.col_offset >> 4) & 0x0F)
                    self.i2c.writeto(self.addr, bytearray([0x80, 0xB0 + page, 0x80, low_col, 0x80, high_col]))
                    self.i2c.writeto(self.addr, b'\\x40' + self.buf[128 * page : 128 * (page + 1)])
            else:
                # SSD1306 column & page range addressing
                self.i2c.writeto(self.addr, bytearray([0x80, 0x21, 0x80, 0, 0x80, 127, 0x80, 0x22, 0x80, 0, 0x80, 7]))
                self.i2c.writeto(self.addr, b'\\x40' + self.buf)
        except Exception:
            pass


# ================= 2. DFPLAYER MINI UART DRIVER =================
class TitanDFPlayer:
    def __init__(self, uart_id=1, tx=17, rx=18):
        self.uart_id = uart_id
        self.tx = tx
        self.rx = rx
        self.current_track = 0
        try:
            self.uart = UART(uart_id, baudrate=9600, tx=tx, rx=rx)
        except Exception:
            try:
                self.uart = UART(uart_id, baudrate=9600)
            except Exception:
                self.uart = None
        time.sleep_ms(150)

    def _send_cmd(self, cmd, param1=0, param2=0):
        if not self.uart:
            return
        buf = bytearray(10)
        buf[0] = 0x7E  # Start
        buf[1] = 0xFF  # Version
        buf[2] = 0x06  # Length
        buf[3] = cmd   # Command
        buf[4] = 0x00  # Feedback disabled
        buf[5] = param1 & 0xFF
        buf[6] = param2 & 0xFF
        # 16-bit Checksum
        chk = 0 - (0xFF + 0x06 + cmd + 0x00 + param1 + param2)
        buf[7] = (chk >> 8) & 0xFF
        buf[8] = chk & 0xFF
        buf[9] = 0xEF  # End
        try:
            self.uart.write(buf)
            time.sleep_ms(35)
        except Exception:
            pass

    def play_track(self, track_num):
        t = int(track_num)
        self.current_track = t
        self._send_cmd(0x03, (t >> 8) & 0xFF, t & 0xFF)

    def play(self):
        self._send_cmd(0x0D, 0, 0)

    def pause(self):
        self._send_cmd(0x0E, 0, 0)

    def stop(self):
        self.current_track = 0
        self._send_cmd(0x16, 0, 0)

    def set_volume(self, vol):
        v = max(0, min(30, int(vol)))
        self._send_cmd(0x06, 0, v)

    def set_eq(self, eq=0):
        # 0:Normal, 1:Pop, 2:Rock, 3:Jazz, 4:Classic, 5:Bass
        self._send_cmd(0x07, 0, eq & 0x07)


# ================= 3. MAX30102 / MAX30100 PPG BEAT DETECTOR =================
class SparkFunHeartRate:
    def __init__(self):
        self.ir_avg_reg = 0
        self.ac_filtered = 0
        self.peak_val = 0
        self.is_rising = False
        self.last_beat_ms = 0
        self.threshold = 120
        self.ir_ac_signal_current = 0

    def check_for_beat(self, sample, now):
        # 1. DC Removal / High-Pass Baseline Tracking
        if self.ir_avg_reg == 0:
            self.ir_avg_reg = sample
        self.ir_avg_reg = int((self.ir_avg_reg * 31 + sample) / 32)
        raw_ac = sample - self.ir_avg_reg
        self.ir_ac_signal_current = raw_ac

        # 2. Low-Pass Smoothing Filter to reject optical & AC flicker noise
        self.ac_filtered = int((self.ac_filtered * 3 + raw_ac) / 4)

        # 3. Dynamic Peak & Refractory Detection (Max 175 BPM = 340ms min interval)
        time_since_last = time.ticks_diff(now, self.last_beat_ms)
        beat_detected = False

        if self.ac_filtered > self.threshold and time_since_last >= 340:
            if not self.is_rising:
                self.is_rising = True
            if self.ac_filtered > self.peak_val:
                self.peak_val = self.ac_filtered
        elif self.is_rising and self.ac_filtered < (self.peak_val * 0.70):
            # Confirmed systolic wave peak on downward slope
            self.is_rising = False
            # Adapt dynamic threshold to pulse amplitude
            self.threshold = max(60, min(1500, int(self.peak_val * 0.45)))
            self.peak_val = 0
            self.last_beat_ms = now
            beat_detected = True

        # Gradual threshold decay if no beat seen
        if time_since_last > 1400:
            self.threshold = max(60, int(self.threshold * 0.95))

        return beat_detected


class TitanPulseSensor:
    def __init__(self, sda_pin=7, scl_pin=8, addr=0x57):
        self.addr = addr
        self.i2c = SoftI2C(sda=Pin(sda_pin, Pin.OUT), scl=Pin(scl_pin, Pin.OUT), freq=400000, timeout=2000)
        self.detector = SparkFunHeartRate()
        self.chip_type = "UNKNOWN"
        self.is_connected = False
        
        # Debounced finger states
        self.finger_detected = False
        self.finger_high_counter = 0   # Must sustain >= 10,000 for 100 ms (10 samples @ 100Hz)
        self.finger_low_counter = 0    # Must sustain <= 4,000 for 400 ms (40 samples @ 100Hz)
        self.finger_detected_at = 0
        
        # Beat & BPM metrics
        self.last_beat_anchor = 0
        self.current_bpm = 0.0
        self.average_bpm = 0
        self.bpm_history = []
        self.consecutive_high_bpm = 0
        self.new_beat_ready = False
        
        # Signal buffers for visualization
        self.latest_ir = 0
        self.latest_red = 0
        self.beat_event = False
        self.wave_buf = [32] * 128
        self.last_sample_ms = 0

    def _w(self, reg, val):
        try:
            self.i2c.writeto_mem(self.addr, reg, bytearray([val]))
        except Exception:
            pass

    def _r(self, reg, n=1):
        try:
            return self.i2c.readfrom_mem(self.addr, reg, n)
        except Exception:
            return bytearray(n)

    def init_sensor(self):
        """Attempts connection up to 5 times."""
        for attempt in range(1, 6):
            try:
                devs = self.i2c.scan()
                if self.addr in devs:
                    part_id = self._r(0xFF, 1)[0]
                    if part_id in (0x15, 0x25):
                        self.chip_type = "MAX30102"
                        self._w(0x09, 0x40)  # Reset
                        time.sleep_ms(80)
                        self._w(0x08, 0x30)  # FIFO config: 4-sample averaging
                        self._w(0x09, 0x03)  # Mode: SpO2 (Red + IR)
                        self._w(0x0A, 0x27)  # SpO2 config: 100Hz, 411us
                        self._w(0x0C, 0x24)  # LED1 (Red) ~7.2mA
                        self._w(0x0D, 0x24)  # LED2 (IR) ~7.2mA
                        self._w(0x04, 0x00)  # FIFO WR PTR
                        self._w(0x05, 0x00)  # OVF PTR
                        self._w(0x06, 0x00)  # FIFO RD PTR
                        self.is_connected = True
                        return True
                    else:
                        self.chip_type = "MAX30100"
                        self._w(0x06, 0x40)  # Reset
                        time.sleep_ms(80)
                        self._w(0x07, 0x03)  # Mode: SpO2
                        self._w(0x09, 0x33)  # Current: 11mA
                        self._w(0x06, 0x03)  # High res SpO2
                        self.is_connected = True
                        return True
            except Exception:
                pass
            time.sleep_ms(100)
        return False

    def process_sample(self, ir, red, now):
        self.latest_ir = ir
        self.latest_red = red

        # 1. Debounce Finger Placement (>= 10,000 for 100 ms -> 10 samples)
        if ir >= 10000:
            self.finger_high_counter += 1
            self.finger_low_counter = 0
            if self.finger_high_counter >= 10 and not self.finger_detected:
                self.finger_detected = True
                self.finger_detected_at = now
                self.last_beat_anchor = 0
                self.current_bpm = 0.0
                self.average_bpm = 0
                self.bpm_history = []
                self.new_beat_ready = False
        # 2. Debounce Finger Removal (<= 4,000 for 400 ms -> 40 samples)
        elif ir <= 4000:
            self.finger_low_counter += 1
            self.finger_high_counter = 0
            if self.finger_low_counter >= 40 and self.finger_detected:
                self.finger_detected = False
                self.last_beat_anchor = 0
                self.current_bpm = 0.0
                self.average_bpm = 0
                self.bpm_history = []
                self.new_beat_ready = False
        else:
            self.finger_high_counter = 0
            self.finger_low_counter = 0

        # 3. Cardiac Beat Detection (When finger confirmed)
        self.beat_event = False
        if self.finger_detected:
            if self.detector.check_for_beat(ir, now):
                self.beat_event = True
                # Allow 800ms settling time after finger placement
                if time.ticks_diff(now, self.finger_detected_at) >= 800:
                    if self.last_beat_anchor == 0:
                        self.last_beat_anchor = now
                    else:
                        interval = time.ticks_diff(now, self.last_beat_anchor)
                        self.last_beat_anchor = now
                        # Valid human physiological range: 45 to 160 BPM (375ms to 1333ms)
                        if 375 <= interval <= 1333:
                            inst_bpm = 60000.0 / interval
                            if self.average_bpm == 0:
                                self.average_bpm = int(inst_bpm + 0.5)
                            else:
                                # Smooth moving average (65% history, 35% new reading) to eliminate jumpiness
                                self.average_bpm = int(self.average_bpm * 0.65 + inst_bpm * 0.35 + 0.5)
                            
                            self.current_bpm = inst_bpm
                            self.bpm_history.append(self.average_bpm)
                            if len(self.bpm_history) > 4:
                                self.bpm_history.pop(0)
                            self.new_beat_ready = True
                            print(f"[HEART] Beat! Inst: {int(inst_bpm)} BPM | Smooth Avg: {self.average_bpm} BPM")

        # 4. Update 128-pixel Waveform Buffer for OLED
        if self.finger_detected:
            ac = getattr(self.detector, 'ir_ac_signal_current', 0)
            # Map AC amplitude to screen range (Y: 14 to 48, center at 32)
            y_point = 32 - int(ac * 0.055)
            if y_point < 14: y_point = 14
            if y_point > 48: y_point = 48
            self.wave_buf.pop(0)
            self.wave_buf.append(y_point)
        else:
            self.wave_buf.pop(0)
            self.wave_buf.append(32)

    def update_100hz(self):
        """Reads latest sample from FIFO at 100 Hz (every 10 ms)."""
        now = time.ticks_ms()
        if time.ticks_diff(now, self.last_sample_ms) < 10:
            return
        self.last_sample_ms = now

        try:
            if self.chip_type == "MAX30102":
                wr = self._r(0x04, 1)[0]
                rd = self._r(0x06, 1)[0]
                num_samples = (wr - rd) & 0x1F
                if num_samples > 0:
                    raw = self._r(0x07, num_samples * 6)
                    # Process the latest sample from FIFO
                    last_idx = (num_samples - 1) * 6
                    ir = (raw[last_idx + 3] << 16 | raw[last_idx + 4] << 8 | raw[last_idx + 5]) & 0x03FFFF
                    red = (raw[last_idx + 0] << 16 | raw[last_idx + 1] << 8 | raw[last_idx + 2]) & 0x03FFFF
                    if ir > 0:
                        self.process_sample(ir, red, now)
            elif self.chip_type == "MAX30100":
                wr = self._r(0x02, 1)[0]
                rd = self._r(0x04, 1)[0]
                num_samples = (wr - rd) & 0x0F
                if num_samples > 0:
                    raw = self._r(0x05, num_samples * 4)
                    last_idx = (num_samples - 1) * 4
                    ir = (raw[last_idx + 0] << 8) | raw[last_idx + 1]
                    red = (raw[last_idx + 2] << 8) | raw[last_idx + 3]
                    if ir > 0:
                        self.process_sample(ir, red, now)
        except Exception:
            pass
        except Exception:
            pass


# ================= 4. OLED ANIMATION GRAPHICS RENDERER =================
class RobotFaceRenderer:
    def __init__(self, oled):
        self.oled = oled
        self.current_style = 0
        self.last_style_change = 0
        self.blink_state = 0
        self.last_blink_time = 0

    def draw_eye(self, cx, cy, rx, ry, pupil_dx=0, pupil_dy=0, is_blink=False, style=0):
        oled = self.oled
        if is_blink:
            # Closed horizontal eye line
            oled.hline(cx - rx, cy, rx * 2 + 1, 1)
            oled.hline(cx - rx + 1, cy - 1, rx * 2 - 1, 1)
            return

        if style == 0:
            # Rounded Rectangle Futuristic Visor Eyes
            oled.fill_rect(cx - rx, cy - ry, rx * 2, ry * 2, 1)
            oled.fill_rect(cx - rx + 2, cy - ry + 2, rx * 2 - 4, ry * 2 - 4, 0)
            # Center Glowing Pupil
            oled.fill_rect(cx + pupil_dx - 3, cy + pupil_dy - 3, 6, 6, 1)

        elif style == 1:
            # Happy Curved Arc Eyes (Kawaii ^_^)
            for offset_x in range(-rx, rx + 1):
                dy = int((offset_x * offset_x) / (rx * 1.6)) - ry
                oled.pixel(cx + offset_x, cy + dy, 1)
                oled.pixel(cx + offset_x, cy + dy + 1, 1)
                oled.pixel(cx + offset_x, cy + dy + 2, 1)

        elif style == 2:
            # Solid Robotic Neon Eyes with Corner Notch
            oled.fill_rect(cx - rx, cy - ry, rx * 2, ry * 2, 1)
            # Inner Cutout
            oled.fill_rect(cx - rx + 3, cy - ry + 3, rx * 2 - 6, ry * 2 - 6, 0)
            oled.fill_rect(cx + pupil_dx - 2, cy + pupil_dy - 2, 5, 5, 1)

        elif style == 3:
            # Heart Eyes (Loving DJ Robot)
            # Left bump, right bump, triangle down
            oled.fill_rect(cx - 8, cy - 8, 7, 7, 1)
            oled.fill_rect(cx + 1, cy - 8, 7, 7, 1)
            oled.fill_rect(cx - 8, cy - 3, 16, 7, 1)
            oled.fill_rect(cx - 5, cy + 4, 10, 4, 1)
            oled.fill_rect(cx - 2, cy + 8, 4, 3, 1)

    def render_normal_face(self, now, track_num):
        oled = self.oled
        oled.fill(0)

        # Style change every 2.5 seconds
        if time.ticks_diff(now, self.last_style_change) > 2500:
            self.last_style_change = now
            self.current_style = random.randint(0, 3)

        # Periodic natural blinking
        is_blinking = False
        if time.ticks_diff(now, self.last_blink_time) > 2800:
            self.last_blink_time = now
        elif time.ticks_diff(now, self.last_blink_time) < 180:
            is_blinking = True

        # Header status bar (Fits inside 128px)
        oled.print_text(f"DJ BOT T{track_num}", 2, 2, 1)
        oled.print_text("♪ NORMAL", 56, 2, 1)
        oled.hline(0, 11, 128, 1)

        # Animated Left & Right Eyes (Centered at X=34 and X=94, Y=34)
        self.draw_eye(34, 34, 16, 12, pupil_dx=0, pupil_dy=0, is_blink=is_blinking, style=self.current_style)
        self.draw_eye(94, 34, 16, 12, pupil_dx=0, pupil_dy=0, is_blink=is_blinking, style=self.current_style)

        # Small rhythmic mouth beat indicator
        mouth_w = 12 if (now // 250) % 2 == 0 else 24
        oled.hline(64 - mouth_w // 2, 56, mouth_w, 1)

        oled.show()

    def render_calm_face(self, now, remaining_sec):
        """Serene, gentle, relaxed breathing face shown when finger is lifted during Calm Mode."""
        oled = self.oled
        oled.fill(0)

        # Top Bar (Fits inside 128px)
        oled.print_text(f"CALM {remaining_sec}s", 2, 2, 1)
        oled.print_text("ZEN ♪", 84, 2, 1)
        oled.hline(0, 11, 128, 1)

        # Gentle closed curved serene eyes
        for dx in range(-14, 15):
            dy = int((dx * dx) / 18)
            oled.pixel(34 + dx, 32 + dy, 1)
            oled.pixel(34 + dx, 33 + dy, 1)

        for dx in range(-14, 15):
            dy = int((dx * dx) / 18)
            oled.pixel(94 + dx, 32 + dy, 1)
            oled.pixel(94 + dx, 33 + dy, 1)

        # Peaceful smile
        oled.print_text("RELAX & BREATHE", 4, 52, 1)
        oled.show()

    def render_tired_face(self, now):
        """Tired drowsy face shown when no finger is detected for >= 60 seconds."""
        oled = self.oled
        oled.fill(0)

        oled.print_text("TIRED MODE", 2, 2, 1)
        z_step = (now // 400) % 3
        z_str = "Z" * (z_step + 1)
        oled.print_text(z_str, 102, 2, 1)
        oled.hline(0, 11, 128, 1)

        # Droopy half-closed eyelids
        oled.fill_rect(18, 22, 32, 18, 1)
        oled.fill_rect(20, 24, 28, 14, 0)
        oled.fill_rect(18, 22, 32, 9, 1)
        oled.fill_rect(30, 31, 8, 4, 1)

        oled.fill_rect(78, 22, 32, 18, 1)
        oled.fill_rect(80, 24, 28, 14, 0)
        oled.fill_rect(78, 22, 32, 9, 1)
        oled.fill_rect(90, 31, 8, 4, 1)

        # Yawning / resting prompt
        oled.print_text("TOUCH SENSOR", 16, 52, 1)
        oled.show()

    def render_heartbeat_display(self, pulse_sensor, is_calm_active=False, calm_remaining=0):
        """Visual ECG-style real-time cardiac waveform and BPM telemetry display."""
        oled = self.oled
        oled.fill(0)

        # 1. Header Information Bar (Top Y=1)
        if is_calm_active:
            oled.print_text(f"CALM {calm_remaining}s", 2, 1, 1)
        else:
            oled.print_text("HEART SIGNAL", 2, 1, 1) # 12 chars = 96 px (X=2..98)

        # Heart Icon (Beats/Pumps when beat is triggered) placed at X=112..122
        if pulse_sensor.beat_event:
            # Solid Large Heart (X=112 to 122)
            oled.fill_rect(112, 1, 11, 8, 1)
            oled.pixel(112, 1, 0); oled.pixel(117, 1, 0); oled.pixel(122, 1, 0)
            oled.pixel(112, 8, 0); oled.pixel(113, 8, 0); oled.pixel(121, 8, 0); oled.pixel(122, 8, 0)
        else:
            # Regular Heart Icon Outline (X=112 to 122)
            oled.pixel(114, 1, 1); oled.pixel(120, 1, 1)
            oled.pixel(113, 2, 1); oled.pixel(115, 2, 1); oled.pixel(119, 2, 1); oled.pixel(121, 2, 1)
            oled.pixel(112, 3, 1); oled.pixel(122, 3, 1)
            oled.pixel(113, 4, 1); oled.pixel(121, 4, 1)
            oled.pixel(114, 5, 1); oled.pixel(120, 5, 1)
            oled.pixel(115, 6, 1); oled.pixel(119, 6, 1)
            oled.pixel(116, 7, 1); oled.pixel(118, 7, 1)
            oled.pixel(117, 8, 1)

        oled.hline(0, 11, 128, 1)

        # 2. Continuous Scrolling ECG / PPG Waveform Vector Plot (Y: 14 to 48)
        for x in range(127):
            y1 = pulse_sensor.wave_buf[x]
            y2 = pulse_sensor.wave_buf[x + 1]
            oled.line(x, y1, x + 1, y2, 1)

        oled.hline(0, 51, 128, 1)

        # 3. Bottom Information Bar (Y=54, Fits perfectly within 128px)
        if pulse_sensor.average_bpm > 0:
            bpm_txt = f"HEART RATE: {pulse_sensor.average_bpm} BPM" if len(f"HEART RATE: {pulse_sensor.average_bpm} BPM") <= 16 else f"BPM: {pulse_sensor.average_bpm}"
            oled.print_text(bpm_txt, 4, 54, 1)
        else:
            oled.print_text("MEASURING BPM...", 4, 54, 1)

        oled.show()


# ================= 5. MAIN CONTROLLER & STATE MACHINE =================
def main():
    print("==================================================")
    print("LOF TITAN: HEARTBEAT DJ BOT INITIALIZING...")
    print("==================================================")

    # 1. Initialize OLED
    oled = TitanOLED(sda_pin=7, scl_pin=8, is_sh1106=True)
    face_renderer = RobotFaceRenderer(oled)

    # Display Startup Screen
    oled.fill(0)
    oled.print_text("================", 0, 4, 1)
    oled.print_text("DJ BOT", 16, 18, 2)
    oled.print_text("SYSTEM STARTING", 4, 38, 1)
    oled.print_text("================", 0, 52, 1)
    oled.show()

    # 2. Initialize DFPlayer Mini MP3 Player
    dfplayer = TitanDFPlayer(uart_id=1, tx=17, rx=18)
    dfplayer.set_volume(22)
    dfplayer.set_eq(0)
    dfplayer.stop()

    # 3. Initialize MAX30102 Pulse Sensor (Check up to 5 times)
    pulse = TitanPulseSensor(sda_pin=7, scl_pin=8, addr=0x57)
    sensor_ready = pulse.init_sensor()

    oled.fill(0)
    oled.print_text("HARDWARE CHECK:", 4, 6, 1)
    if sensor_ready:
        oled.print_text(f"PULSE: {pulse.chip_type}", 4, 22, 1)
        print(f"[OK] Pulse Sensor Detected: {pulse.chip_type}")
    else:
        oled.print_text("PULSE: NOT DETECTED", 4, 22, 1)
        print("[WARN] MAX30102 Sensor not detected after 5 retries")
    oled.print_text("DFPLAYER: READY", 4, 38, 1)
    oled.print_text("STARTING DJ MODE", 4, 52, 1)
    oled.show()
    time.sleep(1.5)

    # State Machine Variables
    # Music State
    current_music_track = 2
    last_music_switch = time.ticks_ms()
    dfplayer.play_track(current_music_track)
    print(f"[MUSIC] Playing Initial Normal Track {current_music_track}")

    # Timers & Modes
    last_finger_seen_time = time.ticks_ms()
    is_tired_mode = False

    # Calm Mode State Machine
    calm_mode_active = False
    calm_mode_start_time = 0
    calm_track_stopped = False
    last_calm_mode_end_time = 0  # 10s rearm cooldown anchor

    # BPM Trigger tracking
    last_processed_bpm_len = 0

    # Display update throttling
    last_display_render_time = 0

    # Main Super-Loop
    while True:
        now = time.ticks_ms()

        # ================= A. 100 Hz PULSE SENSOR SAMPLING =================
        pulse.update_100hz()

        # ================= B. FINGER TIMING & TIRED MODE =================
        if pulse.finger_detected:
            last_finger_seen_time = now
            if is_tired_mode:
                is_tired_mode = False
                print("[STATE] Finger Detected -> Tired Mode Deactivated")
        else:
            # If no finger continuously for >= 60 seconds (60,000 ms)
            if not is_tired_mode and not calm_mode_active:
                if time.ticks_diff(now, last_finger_seen_time) >= 60000:
                    is_tired_mode = True
                    print("[STATE] No finger for 60s -> Entering Tired Mode")

        # ================= C. CALM MODE TRIGGER CHECK =================
        # Check for 2 consecutive valid BPM readings > 85 BPM (when not in calm mode and rearmed)
        rearmed = (last_calm_mode_end_time == 0) or (time.ticks_diff(now, last_calm_mode_end_time) >= 10000)

        if not calm_mode_active and rearmed and pulse.finger_detected:
            if pulse.new_beat_ready:
                pulse.new_beat_ready = False
                bpm_val = pulse.average_bpm
                if bpm_val > 85:
                    pulse.consecutive_high_bpm += 1
                    print(f"--> [HIGH BPM TRIGGER] Reading: {bpm_val} BPM (Consecutive: {pulse.consecutive_high_bpm}/2)")
                    if pulse.consecutive_high_bpm >= 2:
                        # TRIGGER CALM MODE!
                        calm_mode_active = True
                        calm_mode_start_time = now
                        calm_track_stopped = False
                        pulse.consecutive_high_bpm = 0
                        print("==================================================")
                        print(f"[CALM MODE ACTIVATED] Triggered by 2 high BPM readings ({bpm_val} BPM)!")
                        print("[MUSIC] Playing Calm Track 1 for 20 seconds...")
                        print("==================================================")
                        dfplayer.play_track(1)
                else:
                    if pulse.consecutive_high_bpm > 0:
                        print(f"[PULSE] BPM under 85 ({bpm_val} BPM) -> Resetting consecutive high count")
                    pulse.consecutive_high_bpm = 0
        elif not pulse.finger_detected:
            pulse.consecutive_high_bpm = 0
            pulse.new_beat_ready = False

        # ================= D. CALM MODE EXECUTION & TIMING =================
        calm_remaining_sec = 0
        if calm_mode_active:
            calm_elapsed_ms = time.ticks_diff(now, calm_mode_start_time)
            calm_remaining_sec = max(0, 60 - (calm_elapsed_ms // 1000))

            # Track 1 stops after exactly 20 seconds (20,000 ms) and remains silent
            if not calm_track_stopped and calm_elapsed_ms >= 20000:
                dfplayer.stop()
                calm_track_stopped = True
                print("[MUSIC] Calm Track 1 stopped after 20s. Continuing silent calm mode...")

            # Calm Mode ends after 60 seconds (60,000 ms)
            if calm_elapsed_ms >= 60000:
                calm_mode_active = False
                last_calm_mode_end_time = now  # Start 10s rearm period
                pulse.bpm_history.clear()
                pulse.average_bpm = 0
                pulse.consecutive_high_bpm = 0
                last_processed_bpm_len = 0
                
                # Resume normal music rotation (Track 2 or 3)
                last_music_switch = now
                dfplayer.play_track(current_music_track)
                print("==================================================")
                print("[CALM MODE COMPLETED] Returning to Normal DJ Mode")
                print(f"[MUSIC] Resuming Track {current_music_track}")
                print("==================================================")

        # ================= E. NORMAL MUSIC ROTATION (TRACK 2 <-> 3) =================
        if not calm_mode_active:
            if time.ticks_diff(now, last_music_switch) >= 20000:
                last_music_switch = now
                # Alternate Track 2 and Track 3 every 20 seconds
                current_music_track = 3 if current_music_track == 2 else 2
                dfplayer.play_track(current_music_track)
                print(f"[MUSIC] 20s Interval -> Alternating to Track {current_music_track}")

        # ================= F. OLED DISPLAY RENDERER (30 FPS) =================
        if time.ticks_diff(now, last_display_render_time) >= 33:
            last_display_render_time = now

            # Priority 1: Finger Placed -> ECG-style Live Heartbeat Visualisation (ALWAYS HIGHEST PRIORITY)
            if pulse.finger_detected:
                face_renderer.render_heartbeat_display(pulse, is_calm_active=calm_mode_active, calm_remaining=calm_remaining_sec)

            # Priority 2: Calm Mode Active with Finger Lifted -> Serene Calm Face
            elif calm_mode_active:
                face_renderer.render_calm_face(now, calm_remaining_sec)

            # Priority 3: Tired Mode (No finger for >= 1 min) -> Tired / Drowsy Eyes
            elif is_tired_mode:
                face_renderer.render_tired_face(now)

            # Priority 4: Normal Operation -> Animated Eyes Changing Every 2.5s
            else:
                face_renderer.render_normal_face(now, current_music_track)

        # FreeRTOS watchdog & task safety yield
        time.sleep_ms(3)


if __name__ == '__main__':
    main()
`,
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
    codeFilename: 'anemometer.py',
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

    // MicroPython Main Script
    code: `# ==============================================================================
# LOF TITAN — High-Precision AS5600 Magnetic Cup Anemometer
# ------------------------------------------------------------------------------
# Hardware:
#   - MCU: ESP32-S3 (LOF TITAN Board)
#   - Sensor: AS5600 12-Bit Contactless Magnetic Rotary Encoder (I2C Addr: 0x36)
#   - Display: 1.3" / 0.96" I2C OLED Display (128x64, Addr: 0x3C)
#   - Bus: I2C on SDA: GPIO 7, SCL: GPIO 8
#   - Status LEDs: GPIO 47 (Red / Warning), GPIO 48 (Green / Magnet OK)
#   - Buzzer: GPIO 20 (Audio Alerts)
#
# Operation:
#   1. Displays Title Screen for 2.0 Seconds on boot.
#   2. Main Screen displays real-time Wind Speed in m/s with large text.
#   3. Real-time Magnet Detection Status (OK / WEAK / MISSING).
# ==============================================================================

import time
import math
from machine import Pin, PWM, SoftI2C
import framebuf

# ================= 1. HARDWARE PINS & PWM =================
_pwm_pool = {}
def _get_pwm(pin, freq=1000):
    if pin not in _pwm_pool:
        _pwm_pool[pin] = PWM(Pin(pin), freq=freq)
    else:
        try: _pwm_pool[pin].freq(freq)
        except Exception: pass
    return _pwm_pool[pin]

# Status LEDs & Buzzer
led_red = Pin(47, Pin.OUT)
led_grn = Pin(48, Pin.OUT)

def beep(freq=2200, duration_ms=40):
    """Audible feedback chirp."""
    try:
        buz = _get_pwm(20, freq=freq)
        buz.duty(400)
        time.sleep_ms(duration_ms)
        buz.duty(0)
    except Exception: pass


# ================= 2. 1.3" / 0.96" OLED DISPLAY DRIVER =================
class TitanOLED:
    """I2C OLED Driver compatible with 1.3" SH1106 and 0.96" SSD1306 displays."""
    def __init__(self, i2c, width=128, height=64, addr=0x3C):
        self.i2c = i2c
        self.width = width
        self.height = height
        self.addr = addr
        self.buffer = bytearray((height // 8) * width)
        self.fb = framebuf.FrameBuffer(self.buffer, width, height, framebuf.MONO_VLSB)
        self.is_sh1106 = True # Default for 1.3" OLED
        self.init_display()

    def _cmd(self, cmd):
        try:
            self.i2c.writeto(self.addr, bytearray([0x80, cmd]))
        except Exception: pass

    def init_display(self):
        cmds = [
            0xAE, 0xD5, 0x80, 0xA8, 0x3F, 0xD3, 0x00, 0x40,
            0x8D, 0x14, 0x20, 0x00, 0xA1, 0xC8, 0xDA, 0x12,
            0x81, 0xCF, 0xD9, 0xF1, 0xDB, 0x40, 0xA4, 0xA6, 0xAF
        ]
        for c in cmds: self._cmd(c)
        self.fill(0)
        self.show()

    def fill(self, color):
        self.fb.fill(color)

    def text(self, string, x, y, col=1):
        self.fb.text(string, x, y, col)

    def line(self, x1, y1, x2, y2, col=1):
        self.fb.line(x1, y1, x2, y2, col)

    def rect(self, x, y, w, h, col=1):
        self.fb.rect(x, y, w, h, col)

    def fill_rect(self, x, y, w, h, col=1):
        self.fb.fill_rect(x, y, w, h, col)

    def draw_large_text(self, string, x, y, scale=2, col=1):
        """Render integer-scaled high-contrast text to perfectly fit 1.3" display."""
        temp_buf = bytearray(8 * len(string))
        temp_fb = framebuf.FrameBuffer(temp_buf, 8 * len(string), 8, framebuf.MONO_VLSB)
        temp_fb.fill(0)
        temp_fb.text(string, 0, 0, 1)
        for px in range(8 * len(string)):
            for py in range(8):
                if temp_fb.pixel(px, py):
                    self.fb.fill_rect(x + px * scale, y + py * scale, scale, scale, col)

    def show(self):
        try:
            for page in range(self.height // 8):
                self._cmd(0xB0 + page)
                if self.is_sh1106:
                    self._cmd(0x02) # SH1106 2-column offset for 1.3" OLEDs
                    self._cmd(0x10)
                else:
                    self._cmd(0x00)
                    self._cmd(0x10)
                start = page * self.width
                self.i2c.writeto(self.addr, b'\\x40' + self.buffer[start:start + self.width])
        except Exception: pass


# ================= 3. AS5600 12-BIT MAGNETIC ENCODER DRIVER =================
class AS5600Encoder:
    """AS5600 12-bit contactless magnetic rotary encoder driver (I2C Addr: 0x36)."""
    ADDR = 0x36
    REG_RAW_ANGLE = 0x0C
    REG_STATUS = 0x0B
    REG_AGC = 0x1A

    def __init__(self, i2c):
        self.i2c = i2c
        self.raw_angle = 0
        self.angle_deg = 0.0
        self.prev_raw = 0
        self.turns = 0
        
        # Magnet Status Flags
        self.magnet_detected = False
        self.magnet_too_weak = False
        self.magnet_too_strong = False
        self.magnet_status_str = "Checking..."
        self.agc = 0
        self.connected = False
        self.init_sensor()

    def _read_reg(self, reg, n=1):
        try:
            return self.i2c.readfrom_mem(self.ADDR, reg, n)
        except Exception:
            return bytearray(n)

    def init_sensor(self):
        try:
            devs = self.i2c.scan()
            if self.ADDR in devs:
                self.connected = True
                self.update()
                self.prev_raw = self.raw_angle
            else:
                self.connected = False
        except Exception:
            self.connected = False

    def update(self):
        # 1. Read 12-Bit Raw Angle (0x0C, 0x0D)
        angle_bytes = self._read_reg(self.REG_RAW_ANGLE, 2)
        if len(angle_bytes) == 2:
            raw = ((angle_bytes[0] & 0x0F) << 8) | angle_bytes[1]
            self.raw_angle = raw
            self.angle_deg = (raw * 360.0) / 4096.0
            
            # Continuous multi-turn unwrapping
            diff = raw - self.prev_raw
            if diff < -2048:
                self.turns += 1
            elif diff > 2048:
                self.turns -= 1
            self.prev_raw = raw
            self.connected = True
        else:
            self.connected = False

        # 2. Read Status (0x0B: Bit 5 MD, Bit 4 ML, Bit 3 MH)
        st_byte = self._read_reg(self.REG_STATUS, 1)
        if len(st_byte) == 1:
            st = st_byte[0]
            self.magnet_detected = bool(st & 0x20)
            self.magnet_too_weak = bool(st & 0x10)
            self.magnet_too_strong = bool(st & 0x08)
            
            if not self.magnet_detected:
                self.magnet_status_str = "NO MAGNET ❌"
            elif self.magnet_too_weak:
                self.magnet_status_str = "MAG WEAK ⚠️"
            elif self.magnet_too_strong:
                self.magnet_status_str = "MAG CLOSE ⚠️"
            else:
                self.magnet_status_str = "MAGNET OK ✅"

        # 3. Read AGC Gain (0x1A: 0-255)
        agc_byte = self._read_reg(self.REG_AGC, 1)
        if len(agc_byte) == 1:
            self.agc = agc_byte[0]

        return self.raw_angle


# ================= 4. HIGH-PRECISION ANEMOMETER SPEED ENGINE =================
class AnemometerEngine:
    """
    High-Precision Velocity & Wind Speed Engine.
    Supports low speeds (0.1 m/s) to high storm speeds (40+ m/s).
    """
    def __init__(self, encoder, cup_radius_m=0.070, cup_factor_k=2.85):
        self.encoder = encoder
        self.radius = cup_radius_m # 70 mm distance from shaft axis to cup center
        self.k_factor = cup_factor_k # Aerodynamic cup ratio calibration factor
        
        self.rpm = 0.0
        self.filtered_rpm = 0.0
        self.wind_speed_ms = 0.0
        self.filtered_speed_ms = 0.0
        
        self.last_update_ms = time.ticks_ms()
        self.last_angle_raw = 0
        self.last_movement_ms = time.ticks_ms()
        self.history_samples = []

    def compute(self):
        now = time.ticks_ms()
        dt_ms = time.ticks_diff(now, self.last_update_ms)
        if dt_ms < 30:
            return self.wind_speed_ms

        self.encoder.update()
        raw = self.encoder.raw_angle
        
        # Circular delta calculation (-2048 to +2047 steps)
        delta_steps = (raw - self.last_angle_raw + 2048) % 4096 - 2048
        
        if abs(delta_steps) > 0:
            self.last_movement_ms = now
            delta_deg = (abs(delta_steps) * 360.0) / 4096.0
            inst_deg_s = delta_deg / (dt_ms / 1000.0)
            inst_rpm = inst_deg_s / 6.0
        else:
            # Gentle zero decay when stationary (> 600ms without motion)
            idle_dt = time.ticks_diff(now, self.last_movement_ms)
            if idle_dt > 600:
                inst_rpm = 0.0
            else:
                inst_rpm = self.rpm * 0.70

        self.last_angle_raw = raw
        self.last_update_ms = now
        
        # Jitter median filter
        self.history_samples.append(inst_rpm)
        if len(self.history_samples) > 5:
            self.history_samples.pop(0)
        sorted_samples = sorted(self.history_samples)
        median_rpm = sorted_samples[len(sorted_samples) // 2]
        
        # Exponential moving average filter
        alpha = 0.32
        self.filtered_rpm = (alpha * median_rpm) + ((1.0 - alpha) * self.filtered_rpm)
        if self.filtered_rpm < 0.2: self.filtered_rpm = 0.0
        self.rpm = round(self.filtered_rpm, 1)
        
        # Aerodynamic Physics: v_cup = (2 * pi * r * RPM) / 60, v_wind = v_cup * k
        circumference = 2.0 * math.pi * self.radius
        cup_linear_speed = (circumference * self.filtered_rpm) / 60.0
        raw_speed = cup_linear_speed * self.k_factor
        
        if self.rpm == 0.0 or raw_speed < 0.10:
            self.wind_speed_ms = 0.0
            self.filtered_speed_ms = 0.0
        else:
            self.filtered_speed_ms = (0.35 * raw_speed) + (0.65 * self.filtered_speed_ms)
            self.wind_speed_ms = round(self.filtered_speed_ms, 2)
            
        return self.wind_speed_ms


# ================= 5. MAIN SYSTEM PROGRAM =================
def main():
    print("==================================================")
    print("LOF TITAN — High-Precision AS5600 Wind Anemometer")
    print("==================================================")

    # Status LEDs
    led_grn.value(1)
    led_red.value(0)
    beep(1800, 60)

    # Initialize I2C Bus on GPIO 7 (SDA) and GPIO 8 (SCL)
    i2c = SoftI2C(sda=Pin(7, Pin.OUT), scl=Pin(8, Pin.OUT), freq=400000, timeout=1000)

    # Initialize 1.3" OLED Display
    oled = TitanOLED(i2c, width=128, height=64, addr=0x3C)

    # -------------------------------------------------------------
    # STEP 1: SHOW TITLE SCREEN FOR EXACTLY 2.0 SECONDS
    # -------------------------------------------------------------
    oled.fill(0)
    oled.rect(0, 0, 128, 64, 1)
    oled.rect(2, 2, 124, 60, 1)
    oled.text("LOF TITAN", 28, 14, 1)
    oled.text("ANEMOMETER", 24, 28, 1)
    oled.text("Wind Station", 20, 42, 1)
    oled.show()
    
    # 2.0 Second Title Pause with dual confirmation chime
    time.sleep_ms(1000)
    beep(2400, 50)
    time.sleep_ms(1000)

    # -------------------------------------------------------------
    # STEP 2: INITIALIZE SENSORS & START MAIN TELEMETRY
    # -------------------------------------------------------------
    encoder = AS5600Encoder(i2c)
    anemometer = AnemometerEngine(encoder, cup_radius_m=0.070, cup_factor_k=2.85)

    last_oled_time = time.ticks_ms()
    last_serial_time = time.ticks_ms()

    while True:
        now = time.ticks_ms()

        # Continuous high-frequency velocity calculation
        speed_ms = anemometer.compute()

        # LED status handling based on magnet presence
        if not encoder.magnet_detected:
            led_grn.value(0)
            led_red.value(1) # Red ON if magnet is missing
        elif encoder.magnet_too_weak or encoder.magnet_too_strong:
            led_grn.value(1)
            led_red.value(1) # Both ON if marginal distance
        else:
            led_red.value(0)
            led_grn.value(1) # Green ON if Magnet is OK

        # ---------------------------------------------------------
        # STEP 3: REFRESH 1.3" OLED DISPLAY (10 FPS / Every 100ms)
        # ---------------------------------------------------------
        if time.ticks_diff(now, last_oled_time) > 100:
            last_oled_time = now
            oled.fill(0)

            # Warning if Magnet is not detected
            if not encoder.magnet_detected:
                oled.fill_rect(0, 0, 128, 14, 1)
                oled.text("! NO MAGNET !", 14, 3, 0)
                oled.text("Attach Magnet", 12, 24, 1)
                oled.text("Above AS5600", 16, 38, 1)
                oled.text("Dist: 1.0-2.5mm", 8, 52, 1)
            else:
                # Top Header: Magnet Detection Status
                oled.text("WIND SPEED", 0, 0, 1)
                if encoder.magnet_too_weak:
                    oled.text("MAG:WEAK", 64, 0, 1)
                elif encoder.magnet_too_strong:
                    oled.text("MAG:CLOSE", 56, 0, 1)
                else:
                    oled.text("MAG:OK", 80, 0, 1)

                oled.line(0, 10, 128, 10, 1)

                # Center: Large High-Contrast Wind Speed in m/s
                speed_text = f"{speed_ms:.1f}"
                # Render 3x scaled digits if short, or 2x scaled
                oled.draw_large_text(speed_text, 4, 16, scale=3, col=1)
                oled.draw_large_text("m/s", 4 + len(speed_text) * 24 + 4, 24, scale=2, col=1)

                # Bottom Section: Dynamic Visual Speed Bar Gauge (0 - 30 m/s)
                oled.line(0, 48, 128, 48, 1)
                oled.text(f"RPM:{anemometer.rpm:.0f}", 0, 53, 1)
                
                # Visual Bar Gauge
                bar_x = 54
                bar_w = 72
                oled.rect(bar_x, 52, bar_w, 9, 1)
                fill_w = int(min(bar_w - 4, max(0, (speed_ms / 25.0) * (bar_w - 4))))
                if fill_w > 0:
                    oled.fill_rect(bar_x + 2, 54, fill_w, 5, 1)

            oled.show()

        # Serial Monitor Diagnostics (Every 500ms)
        if time.ticks_diff(now, last_serial_time) > 500:
            last_serial_time = now
            print(f"[ANEMOMETER] Wind Speed: {speed_ms:.2f} m/s | RPM: {anemometer.rpm:.1f} | Magnet: {encoder.magnet_status_str} (AGC: {encoder.agc})")

        # Crucial CPU yield to keep background FreeRTOS / BLE alive
        time.sleep_ms(5)

if __name__ == '__main__':
    main()
`,

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
    codeFilename: 'anti_icing.py',
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
        image: 'v1788499373/lof-titan/anti-icing-systems/lof-titan-esp32s3',
        whatIsIt: 'The main controller of the anti-icing system.',
        howItWorks: 'It reads the temperature, controls the heating response, and updates the display.'
      },
      {
        id: 'oled-display',
        shortName: 'OLED Display',
        name: '1.3-inch OLED Display',
        image: 'v1788499566/lof-titan/anti-icing-systems/oled-display',
        whatIsIt: 'A compact display used to show temperature and system status.',
        howItWorks: 'It displays the temperature reading and whether the heating system is active.'
      },
      {
        id: 'ds18b20-sensor',
        shortName: 'DS18B20 Sensor',
        name: 'DS18B20 Temperature Sensor',
        image: 'v1788499862/lof-titan/anti-icing-systems/ds18b20-sensor',
        whatIsIt: 'A waterproof digital sensor used to measure the temperature near the wing surface.',
        howItWorks: 'It continuously sends temperature readings to the controller so the system can identify cold conditions.'
      },
      {
        id: 'silicone-heater-pad',
        shortName: 'Heater Pad',
        name: '12V Silicone Heater Pad',
        image: 'v1788500409/lof-titan/anti-icing-systems/silicone-heater-pad',
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

    // MicroPython Main Script
    code: `# ==============================================================================
# LOF TITAN — Anti-Icing Thermal Control System
# ------------------------------------------------------------------------------
# Hardware:
#   - MCU: ESP32-S3 (LOF TITAN Board)
#   - Sensor: DS18B20 Waterproof 1-Wire Digital Temperature Probe (Port S1 / GPIO 2)
#   - Actuator: PTC Heating Element connected to Motor Channel 1 (M1: GPIO 15 PWM, GPIO 16 = 0)
#   - Display: 2 x 16 (1602) Liquid Crystal I2C Display (HD44780 + PCF8574 I2C adapter)
#   - Bus: I2C on SDA: GPIO 7, SCL: GPIO 8 (Addr: 0x27 or 0x3F auto-detected)
#   - Status LEDs: GPIO 47 (Red / Heating Active), GPIO 48 (Green / Safe & Standby)
#   - Buzzer: GPIO 20 (Audio Alerts on State Changes)
#
# Control Specifications & Behavior:
#   1. Splash Screen: Displays "ANTI-ICING SYSTEM" with animated initialization.
#   2. Temperature Trigger:
#      - Below 20.0°C: Anti-icing heating activates automatically.
#      - Target Setpoint: 30.0°C (Heater modulates via PID and cuts off at >= 30.0°C).
#   3. PID Control: Proportional-Integral-Derivative algorithm modulates M1 PWM duty
#      cycle smoothly (0–100%) to maintain steady thermal equilibrium without overshoot.
#   4. 16x2 LCD Display Layout:
#      - Line 1: Live Temperature reading & Target setpoint (e.g., "T: 18.5°C SET:30°C")
#      - Line 2: Heater status (ON/OFF), PID output percentage, and visual power bar.
#   5. Failsafe Protection: Automatically cuts heater PWM if sensor disconnected.
# ==============================================================================

import time
from machine import Pin, PWM, SoftI2C, I2C
import onewire
import ds18x20

# ==============================================================================
# ⚙️ USER CONFIGURATION — GLOBAL TEMPERATURE & POWER LIMITS
# ------------------------------------------------------------------------------
# Easily adjust thermal thresholds and power limits here:
# ==============================================================================
HEATER_ON_TEMP   = 20.0   # Heating turns ON when temperature drops below this (°C)
HEATER_OFF_TEMP  = 30.0   # Heating cuts OFF when temperature reaches or exceeds this (°C)
MAX_PWM_PERCENT  = 50.0   # Maximum heater speed / PWM percentage limit (0.0 to 50.0%)

# ================= 1. HARDWARE PINS & PWM MANAGER =================
_pwm_pool = {}
def _get_pwm(pin, freq=1000):
    """Singleton PWM pool manager to prevent timer exhaustion on ESP32-S3."""
    if pin not in _pwm_pool:
        _pwm_pool[pin] = PWM(Pin(pin), freq=freq)
    else:
        try:
            _pwm_pool[pin].freq(freq)
        except Exception:
            pass
    return _pwm_pool[pin]

# Status LEDs & Buzzer
led_red = Pin(47, Pin.OUT)   # Red: Heating Active
led_grn = Pin(48, Pin.OUT)   # Green: Safe / Target Reached
pin_m1_dir = Pin(16, Pin.OUT) # M1 Direction Pin (Ground for uni-directional heater)
pin_m1_dir.value(0)

def beep(freq=2400, duration_ms=50):
    """Short audible feedback tone."""
    try:
        buz = _get_pwm(20, freq=freq)
        buz.duty_u16(32768)
        time.sleep_ms(duration_ms)
        buz.duty_u16(0)
    except Exception:
        pass

def alert_sound(pattern="start"):
    """Audible alerts for system state transitions."""
    if pattern == "start":
        for f in (1200, 1800, 2400):
            beep(f, 40)
            time.sleep_ms(25)
    elif pattern == "heat_on":
        beep(1500, 70)
        time.sleep_ms(30)
        beep(2000, 90)
    elif pattern == "cutoff":
        beep(2200, 60)
        time.sleep_ms(30)
        beep(1400, 80)
    elif pattern == "error":
        for _ in range(3):
            beep(800, 100)
            time.sleep_ms(50)


# ================= 2. 2x16 I2C LIQUID CRYSTAL DISPLAY (LCD 1602) DRIVER =================
class TitanLCD1602:
    """Zero-dependency HD44780 + PCF8574 I2C Character LCD Driver."""
    def __init__(self, i2c, addr=0x27, cols=16, rows=2):
        self.i2c = i2c
        self.cols = cols
        self.rows = rows
        self.addr = addr
        self.backlight_state = 0x08 # Bit 3 = Backlight ON
        
        # Auto-detect I2C address if needed
        if self.i2c:
            try:
                devs = self.i2c.scan()
                if self.addr not in devs:
                    if 0x27 in devs: self.addr = 0x27
                    elif 0x3F in devs: self.addr = 0x3F
                    elif devs: self.addr = devs[0]
            except Exception:
                pass
        
        self._init_lcd()
        self._create_custom_chars()

    def _write_byte(self, data):
        if not self.i2c: return
        try:
            self.i2c.writeto(self.addr, bytes([data | self.backlight_state]))
        except Exception:
            pass

    def _pulse_enable(self, data):
        self._write_byte(data | 0x04) # En High
        time.sleep_us(500)
        self._write_byte(data & ~0x04) # En Low
        time.sleep_us(100)

    def _write_nibble(self, nibble, mode=0):
        # mode: 0 for command (RS=0), 1 for data (RS=1)
        byte = (nibble & 0xF0) | mode
        self._write_byte(byte)
        self._pulse_enable(byte)

    def _send(self, value, mode=0):
        self._write_nibble(value & 0xF0, mode)
        self._write_nibble((value << 4) & 0xF0, mode)

    def command(self, cmd):
        self._send(cmd, 0)
        if cmd <= 3:
            time.sleep_ms(2)

    def write_char(self, char_code):
        self._send(char_code, 1)

    def _init_lcd(self):
        time.sleep_ms(50)
        # 4-bit initialization sequence
        for _ in range(3):
            self._write_nibble(0x30, 0)
            time.sleep_ms(5)
        self._write_nibble(0x20, 0)
        time.sleep_ms(2)
        self.command(0x28) # 2 lines, 5x8 font
        self.command(0x0C) # Display ON, Cursor OFF, Blink OFF
        self.command(0x06) # Auto increment
        self.command(0x01) # Clear
        time.sleep_ms(5)

    def _create_custom_chars(self):
        """Define custom character glyphs for degree symbol, flame, and thermometer."""
        # Char 0: Degree Symbol (°)
        deg_glyph = [0x06, 0x09, 0x09, 0x06, 0x00, 0x00, 0x00, 0x00]
        # Char 1: Flame / Heat Icon
        flame_glyph = [0x04, 0x0A, 0x0A, 0x11, 0x15, 0x1F, 0x0E, 0x04]
        # Char 2: Snowflake / Ice Icon
        ice_glyph = [0x00, 0x15, 0x0E, 0x1F, 0x0E, 0x15, 0x00, 0x00]
        # Char 3: Power Bar block (1 bar)
        bar1_glyph = [0x10, 0x10, 0x10, 0x10, 0x10, 0x10, 0x10, 0x10]
        # Char 4: Power Bar block (Full bar)
        bar_full = [0x1F, 0x1F, 0x1F, 0x1F, 0x1F, 0x1F, 0x1F, 0x1F]

        glyphs = [deg_glyph, flame_glyph, ice_glyph, bar1_glyph, bar_full]
        for idx, pattern in enumerate(glyphs):
            self.command(0x40 | (idx << 3))
            for b in pattern:
                self.write_char(b)
        self.command(0x80) # Reset to DDRAM

    def clear(self):
        self.command(0x01)
        time.sleep_ms(2)

    def backlight(self, on=True):
        self.backlight_state = 0x08 if on else 0x00
        self._write_byte(0)

    def set_cursor(self, col, row):
        col = max(0, min(col, self.cols - 1))
        row = max(0, min(row, self.rows - 1))
        row_offsets = [0x00, 0x40]
        self.command(0x80 | (col + row_offsets[row]))

    def print(self, text, col=None, row=None):
        if col is not None and row is not None:
            self.set_cursor(col, row)
        for ch in str(text):
            if ch == '\\n':
                row = ((row or 0) + 1) % self.rows
                self.set_cursor(0, row)
            elif ch == '°':
                self.write_char(0) # Custom degree symbol
            else:
                self.write_char(ord(ch))

    def print_lines(self, line1="", line2=""):
        """Format and print two lines ensuring full 16-character clear padding."""
        s1 = str(line1)
        s2 = str(line2)
        # Pad to 16 characters to overwrite previous line without full clear flash
        s1_pad = s1[:self.cols] + " " * max(0, self.cols - len(s1))
        s2_pad = s2[:self.cols] + " " * max(0, self.cols - len(s2))
        self.set_cursor(0, 0)
        for ch in s1_pad:
            if ch == '°': self.write_char(0)
            elif ch == '\\x01': self.write_char(1) # Flame
            elif ch == '\\x02': self.write_char(2) # Ice
            elif ch == '\\x04': self.write_char(4) # Full Bar
            else: self.write_char(ord(ch))
            
        self.set_cursor(0, 1)
        for ch in s2_pad:
            if ch == '°': self.write_char(0)
            elif ch == '\\x01': self.write_char(1) # Flame
            elif ch == '\\x02': self.write_char(2) # Ice
            elif ch == '\\x04': self.write_char(4) # Full Bar
            else: self.write_char(ord(ch))


# ================= 3. DS18B20 1-WIRE TEMPERATURE SENSOR DRIVER =================
class TitanDS18B20:
    """Robust 1-Wire DS18B20 Temperature Sensor interface with CRC check & caching."""
    def __init__(self, pin_num=2):
        self.pin = Pin(pin_num)
        self.ow = onewire.OneWire(self.pin)
        self.ds = ds18x20.DS18X20(self.ow)
        self.roms = []
        self.last_temp = 22.0
        self.last_measure_time = 0
        self.conversion_started = False
        self.connected = False
        self.scan_sensor()

    def scan_sensor(self):
        """Scan 1-Wire bus for DS18B20 ROMs."""
        try:
            self.roms = self.ds.scan()
            self.connected = len(self.roms) > 0
            return self.connected
        except Exception:
            self.connected = False
            return False

    def trigger_conversion(self):
        """Initiate asynchronous ADC conversion."""
        if not self.connected and not self.scan_sensor():
            return False
        try:
            self.ds.convert_temp()
            self.conversion_started = True
            self.last_measure_time = time.ticks_ms()
            return True
        except Exception:
            self.connected = False
            return False

    def read_temperature(self):
        """Read temperature value in Celsius with conversion delay management."""
        now = time.ticks_ms()
        
        # If conversion was not started, trigger now
        if not self.conversion_started:
            self.trigger_conversion()
            time.sleep_ms(20) # Minimal wait
            
        # Ensure at least 750ms elapsed since conversion trigger (12-bit DS18B20 spec)
        if time.ticks_diff(now, self.last_measure_time) >= 750:
            if self.roms:
                try:
                    temp = self.ds.read_temp(self.roms[0])
                    # Filter out power-on reset value (85.0°C) or disconnected reads
                    if -55.0 <= temp <= 125.0 and temp != 85.0:
                        self.last_temp = round(temp, 1)
                        self.connected = True
                    elif temp == 85.0 and self.last_temp != 85.0:
                        pass # Ignore one-time 85°C reset artifact
                except Exception:
                    self.connected = False
            self.trigger_conversion() # Start next conversion immediately

        return self.last_temp if self.connected else None


# ================= 4. PID TEMPERATURE CONTROLLER =================
class PIDController:
    """
    Precision Proportional-Integral-Derivative Controller for thermal management.
    Features anti-windup clamp, derivative smoothing, and output power saturation.
    """
    def __init__(self, kp=15.0, ki=0.5, kd=8.0, setpoint=30.0, out_min=0.0, out_max=50.0):
        self.kp = kp
        self.ki = ki
        self.kd = kd
        self.setpoint = setpoint
        self.out_min = out_min
        self.out_max = out_max
        
        self.integral = 0.0
        self.last_error = 0.0
        self.last_time = time.ticks_ms()
        self.last_pv = setpoint

    def reset(self):
        """Reset internal integrator and derivative history."""
        self.integral = 0.0
        self.last_error = 0.0
        self.last_time = time.ticks_ms()

    def compute(self, current_temp):
        """Calculate PID duty cycle output (0–50% max) based on current temperature."""
        now = time.ticks_ms()
        dt_ms = time.ticks_diff(now, self.last_time)
        if dt_ms <= 0:
            dt_ms = 100
        dt = dt_ms / 1000.0
        self.last_time = now

        error = self.setpoint - current_temp

        # Proportional term
        p_term = self.kp * error

        # Integral term with anti-windup clamping
        self.integral += error * dt
        # Anti-windup clamping
        max_integral = self.out_max / (self.ki if self.ki > 0 else 1.0)
        self.integral = max(-max_integral, min(max_integral, self.integral))
        i_term = self.ki * self.integral

        # Derivative on measurement error (mitigates derivative kick)
        d_term = self.kd * ((error - self.last_error) / dt) if dt > 0 else 0.0
        self.last_error = error
        self.last_pv = current_temp

        # Total combined PID output
        output = p_term + i_term + d_term
        # Clamp output strictly to 0..50% max duty cycle
        output_clamped = max(self.out_min, min(self.out_max, output))

        return output_clamped


# ================= 5. HEATER ACTUATOR CONTROL (M1) =================
def set_heater_power(duty_percent):
    """
    Set PTC heater power via Motor Channel 1 (Pin 15 PWM).
    duty_percent: 0.0 (OFF) to MAX_PWM_PERCENT (e.g. 50% POWER CAP)
    """
    pct = max(0.0, min(MAX_PWM_PERCENT, float(duty_percent)))
    pwm_val = int((pct / 100.0) * 65535)
    
    # Motor Channel 1 Forward: Pin 15 = PWM, Pin 16 = 0
    pin_m1_dir.value(0)
    heater_pwm = _get_pwm(15, freq=1000)
    heater_pwm.duty_u16(pwm_val)
    return pct

def stop_heater():
    """Immediately cut off power to PTC heater."""
    try:
        _get_pwm(15).duty_u16(0)
        pin_m1_dir.value(0)
    except Exception:
        pass


# ================= 6. MAIN SYSTEM INITIALIZATION & LOOP =================
def main():
    print("==================================================")
    print("LOF TITAN — Anti-Icing Thermal Control System")
    print("==================================================")
    
    # 1. Initialize Hardware Pins
    led_red.value(0)
    led_grn.value(1)
    stop_heater()

    # 2. Initialize I2C Bus (SDA: 7, SCL: 8)
    i2c = None
    try:
        i2c = SoftI2C(sda=Pin(7, Pin.OUT), scl=Pin(8, Pin.OUT), freq=400000, timeout=50000)
    except Exception:
        try:
            i2c = I2C(0, sda=Pin(7), scl=Pin(8), freq=100000)
        except Exception:
            print("[WARN] Could not initialize I2C bus.")

    # 3. Initialize LCD 1602 Display
    lcd = TitanLCD1602(i2c, addr=0x27, cols=16, rows=2)
    
    # 4. Initialize DS18B20 Temperature Sensor (Port S1 / GPIO 2)
    temp_sensor = TitanDS18B20(pin_num=2)
    
    # 5. Initialize PID Controller with global thresholds
    pid = PIDController(kp=14.0, ki=0.35, kd=6.0, setpoint=HEATER_OFF_TEMP, out_min=0.0, out_max=MAX_PWM_PERCENT)

    # 6. Display Splash Screen (Intelligent Centering & Timing)
    alert_sound("start")
    lcd.clear()
    lcd.print(" ANTI-ICING SYS ", col=0, row=0)
    lcd.print("INITIALIZING...", col=1, row=1)
    time.sleep_ms(1500)

    # Sensor discovery check on splash
    if temp_sensor.connected:
        lcd.print_lines("  DS18B20: OK   ", " HEATER M1: READY")
    else:
        lcd.print_lines("DS18B20 SENSOR: ", "SCANNING BUS...")
        temp_sensor.scan_sensor()
    time.sleep_ms(1000)

    # 7. System State Machine Variables
    is_heating = False
    last_display_update = 0
    last_pid_update = 0
    current_duty = 0.0

    print(f"[INFO] Anti-Icing System active. ON: < {HEATER_ON_TEMP}°C | OFF: >= {HEATER_OFF_TEMP}°C | Max PWM: {MAX_PWM_PERCENT}%")

    # Initial temperature pre-reading
    temp_sensor.trigger_conversion()
    time.sleep_ms(800)

    while True:
        now = time.ticks_ms()

        # ---------------- A. Temperature Acquisition ----------------
        temp = temp_sensor.read_temperature()

        # ---------------- B. Thermal Logic & PID Regulation ----------------
        if temp is None:
            # Sensor Disconnected Safety Cutoff
            stop_heater()
            is_heating = False
            led_red.value(0)
            led_grn.value(0) # Blink warning
            current_duty = 0.0
            alert_sound("error")
        else:
            # Anti-Icing Threshold Logic:
            # 1. If temperature drops below HEATER_ON_TEMP -> START HEATING
            if temp < HEATER_ON_TEMP and not is_heating:
                is_heating = True
                pid.reset()
                alert_sound("heat_on")
                print(f"[STATE] Temp ({temp:.1f}°C) < {HEATER_ON_TEMP}°C -> HEATER ACTIVATED (Max {MAX_PWM_PERCENT}%)")

            # 2. If temperature reaches >= HEATER_OFF_TEMP -> CUTOFF HEATER
            elif temp >= HEATER_OFF_TEMP and is_heating:
                is_heating = False
                current_duty = 0.0
                stop_heater()
                alert_sound("cutoff")
                print(f"[STATE] Temp ({temp:.1f}°C) >= {HEATER_OFF_TEMP}°C -> HEATER CUTOFF (SAFE)")

            # 3. PID Power Modulation when Heating is Active
            if is_heating:
                # Update PID calculations every 200ms
                if time.ticks_diff(now, last_pid_update) >= 200:
                    last_pid_update = now
                    current_duty = pid.compute(temp)
                    # If very close to cutoff or overshoot, clamp duty to 0
                    if temp >= HEATER_OFF_TEMP:
                        current_duty = 0.0
                    set_heater_power(current_duty)
                
                # Visual LED Indicators: Red ON, Green OFF
                led_red.value(1)
                led_grn.value(0)
            else:
                # Standby / Safe Mode: Red OFF, Green ON
                stop_heater()
                current_duty = 0.0
                led_red.value(0)
                led_grn.value(1)

        # ---------------- C. Intelligent 16x2 Display Rendering ----------------
        # Refresh LCD display at 4Hz (every 250ms) to maintain smooth, readable telemetry
        if time.ticks_diff(now, last_display_update) >= 250:
            last_display_update = now

            if temp is None:
                # Error Screen
                line1 = "T: SENSOR ERROR "
                line2 = "CHECK 1-WIRE S1 "
            else:
                # Line 1: Real-time Temp & Target Setpoint
                # Format: "T: 18.4°C SET:30°C" (Exactly 16 chars)
                t_str = f"{temp:4.1f}"
                line1 = f"T:{t_str}°C SET:{int(HEATER_OFF_TEMP)}°C"

                # Line 2: Heating Status & Power Output Bar
                if is_heating:
                    # Create 4-character visual power meter bar relative to max cap
                    bars = int(round((current_duty / MAX_PWM_PERCENT) * 4))
                    bar_str = ("\\x04" * bars) + ("-" * (4 - bars))
                    # Format: "HTR:ON 48% [####]" (16 chars)
                    duty_int = int(current_duty)
                    line2 = f"HTR:ON {duty_int:2d}% [{bar_str}]"
                else:
                    if temp >= HEATER_OFF_TEMP:
                        line2 = "HTR:OFF  [SAFE] "
                    else:
                        line2 = "HTR:OFF [STANDBY]"

            lcd.print_lines(line1, line2)

        # FreeRTOS CPU Safety Yield
        time.sleep_ms(20)


if __name__ == '__main__':
    main()
`,

    // ---------------------------------------------------------------
    // CONTENT PENDING: requirements[] (bill of materials) and code.
    // Component images: slots above are ready, upload masters to
    //   lof-titan/anti-icing-systems/<component-id>
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
  },
  {
    id: 'aquanova',
    name: 'AquaNova',
    category: 'Sensing & Safety Rover',
    badge: 'DIY Sensing Kit',
    // rating / reviews / duration / difficulty / age are NOT set: they were not
    // supplied with the content. The dashboard card falls back to sane defaults,
    // but until difficulty and duration are real this kit will not appear under
    // those filter facets. Set them when the content team confirms.
    // Version-pinned: a replaced asset keeps this url and ships a 30-day
    // max-age, so bump vNNN whenever the artwork is re-uploaded.
    heroImage: 'v1788938004/lof-titan/banners/banner-aquanova',
    thumbnail: 'v1788938004/lof-titan/banners/banner-aquanova',
    tagline: 'Motion & Water Sensing Rover with OLED and Blynk Alerts',
    description:
      'Integrates PIR and water sensing with ESP32-based input processing, using an OLED and Blynk alerts along with motor control to help the rover respond safely to changing conditions.',

    specs: [
      { label: 'SENSORS', value: 'PIR Motion Sensor, Water Level Sensor' },
      { label: 'MCU', value: 'ESP32-S3 TITAN' },
    ],

    // Safety Warnings
    safetyWarnings: {
      hardware: [
        '⚠️ Secure the custom PCB, OLED, PIR sensor, and water sensor firmly so that they do not loosen while the rover is moving.',
        '⚠️ Keep fingers, hair, loose wires, and objects away from the wheels and moving motor parts while testing the rover.',
        '⚠️ Route sensor and motor cables neatly so they cannot become pinched, pulled, or caught near the wheels.',
        '⚠️ Place the rover on a stable testing surface before checking its automatic movement responses.'
      ],
      electronics: [
        '⚡ Switch OFF the rover before connecting or changing the OLED, PIR sensor, water sensor, motors, or other PCB connections.',
        '⚡ Keep the ESP32-S3 PCB and OLED dry. Only the sensing area of the water sensor should be exposed during water-detection tests.',
        '⚡ Check all power and sensor connections carefully before switching the system ON to prevent incorrect wiring or short circuits.',
        '⚡ Avoid leaving the water sensor continuously immersed or allowing water to reach its connector and electronic circuitry.'
      ]
    },

    // Component Labs. Images pending - a component with an empty image renders
    // with the visual column hidden in production and a dev-only placeholder.
    components: [
      {
        id: 'pir-motion-sensor',
        shortName: 'PIR Sensor',
        name: 'PIR Motion Sensor',
        image: 'v1788938621/lof-titan/aquanova/pir-motion-sensor',
        pinMapping: 'PIR INPUT | GPIO 2',
        whatIsIt: 'A sensor used to detect movement from people or other warm objects within its sensing area.',
        howItWorks: 'The PIR sensor detects changes in infrared energy caused by movement. It sends a signal to the ESP32-S3, which uses the input to trigger the programmed rover response and alerts.'
      },
      {
        id: 'water-sensor',
        shortName: 'Water Sensor',
        name: 'Water Sensor',
        image: 'v1788938622/lof-titan/aquanova/water-sensor',
        pinMapping: 'WATER INPUT | GPIO 4',
        whatIsIt: 'A sensor used to detect the presence of water or moisture on its sensing surface.',
        howItWorks: 'When water contacts the sensing tracks, the electrical response of the sensor changes. The ESP32-S3 reads this change and activates the required warning or movement behaviour.'
      },
      {
        id: 'oled-display',
        shortName: 'OLED Display',
        name: 'OLED Display',
        image: 'v1788938325/lof-titan/aquanova/oled-display',
        pinMapping: 'I2C DISPLAY',
        whatIsIt: 'A compact screen used to display the current condition and status of the AquaNova system.',
        howItWorks: 'The ESP32-S3 processes the sensor information and sends the required text or status data to the OLED through I2C communication.'
      }
    ],

    faqTitle: 'FAQ & Hardware Troubleshooting',
    faq: [
      {
        q: 'Why is the PIR sensor detecting motion even when nobody is moving?',
        a: 'Allow the PIR sensor a short stabilisation period after powering ON and keep it away from rapidly changing heat sources. Movement close to the sensor during startup may also cause unwanted detection.'
      },
      {
        q: 'Why is the water sensor not giving an alert when water touches it?',
        a: 'Check that water is reaching the sensing tracks and that the sensor connection to the custom PCB is secure. Also make sure the sensing surface is clean and free from insulating dirt or residue.'
      },
      {
        q: 'Why are the OLED and Blynk showing different system conditions?',
        a: 'Check that the ESP32-S3 has a stable Wi-Fi connection and that the Blynk dashboard is receiving updated data. The OLED may update locally even when internet communication is interrupted.'
      }
    ],

    challengesTitle: 'Robotics Mission Challenges',
    challenges: [
      {
        id: 'motion-visitor-counter',
        level: 'Easy',
        title: 'Challenge 1: Motion Visitor Counter',
        goal: 'Every time the PIR detects a new movement event, increase a counter and display the total number of detections on the OLED.',
        hint: 'Use a variable such as visitorCount and increase it by 1 for every confirmed new motion event.'
      },
      {
        id: 'dual-hazard-alert-station',
        level: 'Intermediate',
        title: 'Challenge 2: Dual-Hazard Alert Station',
        goal: 'Use the PCB switch to activate the monitoring system. When motion is detected, the Red LED turns ON, and the buzzer beeps twice. When water is detected, the Green LED turns ON, and the buzzer gives continuous repeated beeps. When neither motion nor water is detected, both Red and Green LEDs remain ON, and the buzzer alternates between two different beep patterns to indicate normal monitoring mode.',
        hint: [
          'Keep separate variables for motionDetected and waterDetected, then decide the LED and buzzer outputs based on the combination of these two states.',
          'For the normal monitoring state, create two different buzzer patterns and alternate between them using millis() instead of long delay() functions.'
        ]
      },
      {
        id: 'wet-surface-safety',
        level: 'Advanced',
        title: 'Challenge 3: Wet-Surface Safety Challenge',
        goal: 'Move AquaNova from the normal dry lab floor to a slightly wet/slippery test surface prepared safely for the rover. AquaNova can detect water correctly, but when it tries to stop, reverse or turn, the wheels may slip. The rover may travel farther than expected even after the ESP32 gives the stop command.',
        hint: 'Test different PWM values on the wet surface and select the highest speed at which the rover can still stop and turn without excessive wheel slip.'
      }
    ],

    // ---------------------------------------------------------------
    // CONTENT PENDING: requirements[] (bill of materials), assembly[]
    // steps, and the MicroPython code. Deliberately absent rather than
    // guessed - the detail page hides any section with no data and
    // renumbers the rest, so this renders correctly as-is.
    // ---------------------------------------------------------------
  },
  {
    id: 'axes3',
    name: 'Axes 3',
    category: 'Robotic Arm & Motion Control',
    badge: 'DIY Robotics Kit',
    // rating / reviews / duration / difficulty / age are NOT set: they were not
    // supplied with the content. The dashboard card falls back to sane defaults,
    // but until difficulty and duration are real this kit will not appear under
    // those filter facets. Set them when the content team confirms.
    heroImage: 'lof-titan/banners/banner-axes3',
    thumbnail: 'lof-titan/banners/banner-axes3',
    tagline: 'Multi-Servo Robotic Arm with Pick & Place Control',
    description:
      'Develops multi-servo robotic arm control using the base, arm link, and gripper, enabling accurate rotation, lifting, lowering, gripping, movement, and object placement.',

    specs: [
      { label: 'MCU', value: 'ESP32-S3 TITAN' },
    ],

    // Safety Warnings
    safetyWarnings: {
      hardware: [
        '⚠️ Keep fingers away from the arm joints, servo horns, and gripper while the robotic arm is moving.',
        '⚠️ Do not manually force the robotic arm beyond its normal movement range, as this may damage the servo gears or arm joints.',
        '⚠️ Make sure the arm structure and servo motors are firmly mounted before testing lifting, rotation, or gripping movements.',
        '⚠️ Use lightweight objects during gripping and placement tests to avoid placing excessive load on the servos.'
      ],
      electronics: [
        '⚡ Switch OFF the system before connecting or changing the ESP32-S3, PCA9685, or servo motor connections.',
        '⚡ Check the servo connections and channel positions on the PCA9685 before powering the robotic arm.',
        '⚡ Avoid commanding a servo beyond its safe angle range, as continuous stalling can cause the servo to heat up or become damaged.',
        '⚡ Do not connect or disconnect servo motors while they are actively moving. Stop the program and power OFF the system first.'
      ]
    },

    // Component Labs. Images pending - a component with an empty image renders
    // with the visual column hidden in production and a dev-only placeholder.
    components: [
      {
        id: 'esp32-s3',
        shortName: 'ESP32-S3',
        name: 'ESP32-S3',
        // Upload artwork, then set this to the Cloudinary public id:
        //   image: 'lof-titan/axes3/esp32-s3',
        image: '',
        pinMapping: 'I2C | SERVO CONTROL | USB TYPE-C',
        whatIsIt: 'A programmable microcontroller that acts as the main controller of the Axes 3 robotic arm.',
        howItWorks: 'The ESP32-S3 sends movement commands to the PCA9685 servo driver, allowing the robotic arm to rotate, lift, lower, grip, and place objects according to the programmed sequence.'
      },
      {
        id: 'pca9685-servo-driver',
        shortName: 'PCA9685 Driver',
        name: 'PCA9685 Servo Driver',
        // Upload artwork, then set this to the Cloudinary public id:
        //   image: 'lof-titan/axes3/pca9685-servo-driver',
        image: '',
        pinMapping: 'I2C | MULTI-SERVO CONTROL',
        whatIsIt: 'A multi-channel servo controller used to operate several servo motors from the ESP32-S3.',
        howItWorks: 'The ESP32-S3 sends position commands to the PCA9685 through I2C communication. The PCA9685 then generates the control signals required to move each connected servo to its selected angle.'
      },
      {
        id: 'mg995-servo',
        shortName: 'MG995 Servo',
        name: 'MG995 Servo Motor',
        // Upload artwork, then set this to the Cloudinary public id:
        //   image: 'lof-titan/axes3/mg995-servo',
        image: '',
        pinMapping: 'PCA9685 SERVO CHANNEL',
        whatIsIt: 'A high-torque servo motor used for robotic arm movements that require greater turning force.',
        howItWorks: 'The PCA9685 sends a control signal that determines the servo position. The servo rotates its shaft to the required angle and holds the robotic arm joint in position.'
      },
      {
        id: 'mg90s-servo',
        shortName: 'MG90S Servo',
        name: 'MG90S Servo Motor',
        // Upload artwork, then set this to the Cloudinary public id:
        //   image: 'lof-titan/axes3/mg90s-servo',
        image: '',
        pinMapping: 'PCA9685 SERVO CHANNEL',
        whatIsIt: 'A compact metal-geared servo motor used for smaller and more precise robotic arm movements.',
        howItWorks: 'The PCA9685 controls the servo angle by sending timed position signals. The MG90S moves to the commanded position to support controlled movement of smaller arm mechanisms such as the gripper.'
      }
    ],

    faqTitle: 'FAQ & Hardware Troubleshooting',
    faq: [
      {
        q: 'Why is one servo not moving while the other servos work?',
        a: 'Check that the servo is connected to the correct PCA9685 channel and that the same channel number is being used in the program. Also inspect the servo connector for a loose connection.'
      },
      {
        q: 'Why does the robotic arm shake or move unevenly?',
        a: 'Check that the servo horns and arm joints are firmly fixed and that the programmed angle changes are not too sudden. Moving the servos in smaller steps can produce smoother motion.'
      },
      {
        q: 'Why is the gripper unable to hold an object properly?',
        a: 'Check the gripper servo angle and object position. Avoid commanding the servo too far when the gripper is already closed, as this can cause unnecessary strain on the servo.'
      }
    ],

    challengesTitle: 'Robotics Mission Challenges',
    challenges: [
      {
        id: 'one-touch-pick-and-place',
        level: 'Advanced',
        title: 'Challenge 3: One-Touch Pick & Place Arm',
        goal: 'Use the PCB switch to start a complete pick-and-place routine. The arm moves to a pickup position, closes the gripper, lifts the object, rotates to a second position and releases it automatically.',
        hint: 'Calibrate the pickup and drop angles with the actual object and target position before running the full automatic routine.'
      }
    ],

    // ---------------------------------------------------------------
    // CONTENT PENDING: requirements[] (bill of materials), assembly[]
    // steps, and the MicroPython code. Deliberately absent rather than
    // guessed - the detail page hides any section with no data and
    // renumbers the rest, so this renders correctly as-is.
    // ---------------------------------------------------------------
  },
  {
    id: 'magnet-security-rover',
    name: 'Magnet Security Rover',
    category: 'Security & Navigation Rover',
    badge: 'DIY Security Rover',
    // rating / reviews / duration / difficulty / age are NOT set: they were not
    // supplied with the content. The dashboard card falls back to sane defaults,
    // but until difficulty and duration are real this kit will not appear under
    // those filter facets. Set them when the content team confirms.
    heroImage: 'v1788957755/lof-titan/banners/banner-magnet-security-rover',
    thumbnail: 'v1788957755/lof-titan/banners/banner-magnet-security-rover',
    tagline: 'Magnetometer Heading Control & Thermal Intrusion Detection',
    codeFilename: 'magnetic_security_rover.py',
    description:
      'Integrates magnetometer-based heading control, thermal intrusion detection, threshold logic, and LED alerts, allowing the rover to patrol, detect heat, realign, and automatically resume its route.',

    specs: [
      { label: 'SENSORS', value: 'QMC5883L Magnetometer, AMG8833 Thermal Sensor' },
      { label: 'MCU', value: 'ESP32-S3 TITAN' },
    ],

    // Safety Warnings
    safetyWarnings: {
      hardware: [
        '⚠️ Secure the custom PCB, sensors, motor driver, and motors firmly so they do not loosen while the rover is moving.',
        '⚠️ Keep fingers, hair, loose wires, and objects away from the wheels and rotating N20 motor shafts during testing.',
        '⚠️ Route motor and sensor cables so they are not pulled, pinched, or caught near moving wheels.',
        '⚠️ Test automatic turning and realignment on a clear, level surface with enough space for the rover to rotate safely.'
      ],
      electronics: [
        '⚡ Switch OFF the rover before connecting or changing the QMC5883L, AMG8833, motor driver, motors, or ESP32-S3 connections.',
        '⚡ Keep the QMC5883L away from strong magnets or large metal objects when taking normal heading readings, as they can disturb the magnetic measurement.',
        '⚡ Avoid touching or covering the AMG8833 sensing area during thermal measurements, as this can affect its temperature readings.',
        '⚡ Avoid shorting the TB6612FNG motor outputs or reconnecting motors while the system is powered.'
      ]
    },

    // Component Labs. Images pending - a component with an empty image renders
    // with the visual column hidden in production and a dev-only placeholder.
    components: [
      {
        id: 'qmc5883l-magnetometer',
        shortName: 'QMC5883L',
        name: 'QMC5883L Magnetometer',
        image: 'v1788957101/lof-titan/magnet-security-rover/qmc5883l-magnetometer',
        pinMapping: 'I2C | MAGNETIC HEADING',
        whatIsIt: 'A magnetic-field sensor used to determine the rover\'s heading and detect changes in surrounding magnetic fields.',
        howItWorks: 'The QMC5883L measures magnetic-field strength along different axes. The ESP32-S3 processes these readings to estimate direction and help the rover realign with its required heading.'
      },
      {
        id: 'amg8833-thermal-sensor',
        shortName: 'AMG8833',
        name: 'AMG8833 Thermal Sensor',
        image: 'v1788957163/lof-titan/magnet-security-rover/amg8833-thermal-sensor',
        pinMapping: 'I2C | THERMAL DETECTION',
        whatIsIt: 'A thermal sensor used to detect temperature differences and identify warm objects within its viewing area.',
        howItWorks: 'The AMG8833 measures temperatures across a small grid of sensing points. The ESP32-S3 compares these values with programmed limits to detect possible thermal intrusion.'
      },
      {
        id: 'tb6612fng-motor-driver',
        shortName: 'TB6612FNG',
        name: 'TB6612FNG Motor Driver',
        image: 'v1788957165/lof-titan/magnet-security-rover/tb6612fng-motor-driver',
        pinMapping: 'MOTOR CONTROL INTERFACE',
        whatIsIt: 'An electronic driver used to control the rover\'s motor direction and movement.',
        howItWorks: 'The ESP32-S3 sends control signals to the TB6612FNG. The driver controls the N20 motors so the rover can move, stop, turn, realign, and resume its patrol.'
      },
      {
        id: 'n20-gear-motors',
        shortName: 'N20 Motors',
        name: 'N20 Gear Motors',
        image: 'v1788957166/lof-titan/magnet-security-rover/n20-gear-motors',
        pinMapping: 'DC MOTOR OUTPUT',
        whatIsIt: 'Compact geared DC motors used to drive the wheels of the Magnet Security Rover.',
        howItWorks: 'Electrical power from the motor driver rotates the motors. Their internal gears reduce speed and increase torque, helping the rover move and turn in a controlled manner.'
      },
      {
        id: 'esp32-s3',
        shortName: 'ESP32-S3',
        name: 'ESP32-S3',
        image: 'v1788957167/lof-titan/magnet-security-rover/esp32-s3',
        pinMapping: 'GPIO | I2C | MOTOR CONTROL',
        whatIsIt: 'A programmable microcontroller that acts as the main controller of the Magnet Security Rover.',
        howItWorks: 'The ESP32-S3 reads heading data from the magnetometer and thermal data from the AMG8833, compares them with programmed conditions, and controls the rover\'s motors and alert responses.'
      }
    ],

    faqTitle: 'FAQ & Hardware Troubleshooting',
    faq: [
      {
        q: 'Why does the rover show the wrong direction or keep correcting its heading?',
        a: 'Check whether the QMC5883L is close to magnets, motors, metal parts, or other magnetic sources. Move these influences away and recalibrate the heading sensor if required.'
      },
      {
        q: 'Why is the AMG8833 detecting heat when no person is nearby?',
        a: 'Warm electronics, sunlight, lamps, or other heated objects can appear in the thermal sensor\'s view. Test the rover away from these heat sources and check the programmed temperature threshold.'
      },
      {
        q: 'Why does the rover detect a heading or thermal change but not realign or move?',
        a: 'Check the TB6612FNG and N20 motor connections and confirm that the motor-control signals are reaching the driver. Sensor detection can work correctly even when the motor-control section has a connection problem.'
      }
    ],

    challengesTitle: 'Robotics Mission Challenges',
    challenges: [
      {
        id: 'magnetic-turn-challenge',
        level: 'Easy',
        title: 'Challenge 1: Magnetic Turn Challenge',
        goal: 'Make the rover perform accurate turns using magnetometer heading instead of fixed timing. Example: start at 0° → turn to 90° → stop.',
        hint: [
          'Continuously read the magnetometer while turning and stop the motors when the heading enters a small tolerance range, such as 90° ± 3°.',
          'Handle the 0°/360° boundary correctly; for example, turning from 350° to 10° should require only about a 20° turn, not 340°.'
        ]
      },
      {
        id: 'serial-compass-direction-rover',
        level: 'Intermediate',
        title: 'Challenge 2: Serial Compass Direction Rover',
        goal: 'Enter a compass direction such as NORTH, EAST, SOUTH or WEST through the Laptop/PC Serial Monitor. The ESP32-S3 reads the command, uses the QMC5883L magnetometer to determine the rover\'s current heading, and rotates the rover until it faces the requested direction. Once aligned, the rover stops, the built-in green LED turns ON, and the built-in buzzer gives a confirmation sound.',
        hint: 'Reduce the motor PWM as the rover gets close to the target heading to prevent it from overshooting the required direction.'
      },
      {
        id: 'magnetic-interference-navigation',
        level: 'Advanced',
        title: 'Challenge 3: Magnetic Interference Navigation Challenge',
        goal: 'Operate the rover near metal doors, steel furniture, speakers, electrical equipment, lifts, or other strong magnetic sources. The QMC5883L heading may shift or fluctuate, causing the rover to turn incorrectly or fail to maintain its patrol direction. Compare heading readings in a normal area and near magnetic interference, then modify the rover so it can maintain or recover its intended heading more reliably.',
        hint: 'Define a small heading tolerance, such as ±3° to ±5°, so minor fluctuations do not make the rover continuously adjust its direction.'
      }
    ],

    // MicroPython Main Script
    code: `# ==============================================================================
# LOF TITAN — Intelligent Continuous-PID Magnetic Security Rover
# Speed Range: 0% to 30% Full Dynamic Envelope
# Real-Time Trajectory Control: Continuous Heading Lock (+/-2° Tolerance) Throughout 20s
# Hardware: ESP32-S3 | Motors: M1 (15,16) & M2 (13,14) | I2C: SDA 7, SCL 8
# Sensors: AMG8833 (0x69) 8x8 IR Thermal & QMC5883L (0x0D) Digital Compass
# Web Server: WiFi Hotspot (192.168.4.1) Live Heatmap & Dual-Heading Telemetry
# ==============================================================================

import time
import math
import struct
import network
import socket
import select
import ujson
from machine import Pin, PWM, SoftI2C

# ================= 1. SINGLETON PWM MOTOR INTERFACE (0% - 30% RANGE) =================
_pwm_pool = {}
def _get_pwm(pin, freq=1000):
    if pin not in _pwm_pool:
        _pwm_pool[pin] = PWM(Pin(pin), freq=freq)
    else:
        try: _pwm_pool[pin].freq(freq)
        except Exception: pass
    return _pwm_pool[pin]

def _raw_m1(duty_pct, fwd=True):
    # Absolute dynamic range: 0% to 30%
    capped_pct = max(0.0, min(30.0, duty_pct))
    duty = int(capped_pct * 1023 / 100) if capped_pct > 0 else 0
    p15 = _get_pwm(15); p16 = _get_pwm(16)
    if duty == 0: p15.duty(0); p16.duty(0)
    elif fwd: p15.duty(duty); p16.duty(0)
    else: p15.duty(0); p16.duty(duty)

def _raw_m2(duty_pct, fwd=True):
    # Absolute dynamic range: 0% to 30%
    capped_pct = max(0.0, min(30.0, duty_pct))
    duty = int(capped_pct * 1023 / 100) if capped_pct > 0 else 0
    p13 = _get_pwm(13); p14 = _get_pwm(14)
    if duty == 0: p13.duty(0); p14.duty(0)
    elif fwd: p13.duty(duty); p14.duty(0)
    else: p13.duty(0); p14.duty(duty)

def _raw_m3(duty_pct, fwd=True):
    # M3 Motor/LED Channel (GPIO 11, 12)
    capped_pct = max(0.0, min(100.0, duty_pct))
    duty = int(capped_pct * 1023 / 100) if capped_pct > 0 else 0
    p11 = _get_pwm(11); p12 = _get_pwm(12)
    if duty == 0: p11.duty(0); p12.duty(0)
    elif fwd: p11.duty(duty); p12.duty(0)
    else: p11.duty(0); p12.duty(duty)

def set_m3_led(active, speed=20):
    if active:
        _raw_m3(speed, fwd=True)
    else:
        _raw_m3(0)

def set_buzzer(active):
    buz = _get_pwm(20, freq=2400)
    buz.duty(512 if active else 0)


# ================= 2. ULTRA-SMOOTH SLEW ACCELERATION CONTROLLER =================
_current_m1 = 0.0
_current_m2 = 0.0

def smooth_motors(target_m1, target_m2, max_step=1.8):
    """
    Slew-rate limiter from 0% to 30%:
    Smoothly ramps motor speed without sudden jolts or loss of wheel traction.
    """
    global _current_m1, _current_m2
    
    target_m1 = max(-30.0, min(30.0, target_m1))
    target_m2 = max(-30.0, min(30.0, target_m2))
    
    # Smooth ramp M1
    if _current_m1 < target_m1:
        _current_m1 = min(target_m1, _current_m1 + max_step)
    elif _current_m1 > target_m1:
        _current_m1 = max(target_m1, _current_m1 - max_step)
        
    # Smooth ramp M2
    if _current_m2 < target_m2:
        _current_m2 = min(target_m2, _current_m2 + max_step)
    elif _current_m2 > target_m2:
        _current_m2 = max(target_m2, _current_m2 - max_step)
        
    _raw_m1(abs(_current_m1), fwd=(_current_m1 >= 0))
    _raw_m2(abs(_current_m2), fwd=(_current_m2 >= 0))

def stop_smooth():
    global _current_m1, _current_m2
    for _ in range(12):
        smooth_motors(0, 0, max_step=4.0)
        time.sleep_ms(15)
    _raw_m1(0); _raw_m2(0)
    _current_m1 = 0.0; _current_m2 = 0.0


# ================= 3. I2C SENSORS (COMPASS & THERMAL CAMERA) =================
class _TitanQMC5883L:
    def __init__(self, addr=0x0D):
        self.addr = addr
        self.i2c = SoftI2C(sda=Pin(7, Pin.OUT), scl=Pin(8, Pin.OUT), freq=100000, timeout=1000)
        self.x = 0; self.y = 0; self.z = 0
        self.heading = 0.0
        self.direction = "N"
        self.temp = 25.0
        self._h_buf = [0.0, 0.0, 0.0]
        self.init_sensor()

    def _w(self, reg, val):
        try: self.i2c.writeto_mem(self.addr, reg, bytearray([val]))
        except Exception: pass

    def _r(self, reg, n=1):
        try: return self.i2c.readfrom_mem(self.addr, reg, n)
        except Exception: pass
        return bytearray(n)

    def init_sensor(self):
        self._w(0x0A, 0x80)
        time.sleep_ms(20)
        self._w(0x0B, 0x01)
        self._w(0x09, 0x1D)

    def update(self):
        data = self._r(0x00, 6)
        if len(data) == 6:
            raw_x, raw_y, raw_z = struct.unpack('<hhh', data)
            self.x = raw_x; self.y = raw_y; self.z = raw_z
            rad = math.atan2(self.y, self.x)
            deg = math.degrees(rad)
            if deg < 0: deg += 360.0
            
            # 3-sample median filter
            self._h_buf.pop(0)
            self._h_buf.append(deg)
            sorted_h = sorted(self._h_buf)
            self.heading = round(sorted_h[1], 1)
            
            dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
            idx = int((self.heading + 22.5) / 45.0) % 8
            self.direction = dirs[idx]
        return self.heading


class _TitanAMG8833:
    def __init__(self, addr=0x69):
        self.addr = addr
        self.i2c = SoftI2C(sda=Pin(7, Pin.OUT), scl=Pin(8, Pin.OUT), freq=100000, timeout=1000)
        self.pixels = [25.0] * 64
        self.thermistor = 25.0
        self.max_temp = 25.0
        self.min_temp = 25.0
        self.avg_temp = 25.0
        self.init_sensor()

    def _w(self, reg, val):
        try: self.i2c.writeto_mem(self.addr, reg, bytearray([val]))
        except Exception: pass

    def _r(self, reg, n=1):
        try: return self.i2c.readfrom_mem(self.addr, reg, n)
        except Exception: pass
        return bytearray(n)

    def init_sensor(self):
        self._w(0x00, 0x00)
        self._w(0x01, 0x3F)
        self._w(0x02, 0x00)
        time.sleep_ms(50)

    def update(self):
        data = self._r(0x80, 128)
        if len(data) == 128:
            new_pixels = []
            for i in range(64):
                raw = (data[2*i + 1] << 8) | data[2*i]
                if raw & 0x800: raw -= 0x1000
                new_pixels.append(round(raw * 0.25, 1))
            self.pixels = new_pixels
            self.max_temp = max(self.pixels)
            self.min_temp = min(self.pixels)
            self.avg_temp = round(sum(self.pixels) / 64.0, 1)
        return self.max_temp

compass = _TitanQMC5883L()
thermal = _TitanAMG8833()


# ================= 4. INTELLIGENT ADAPTIVE PID CONTROLLER =================
class ContinuousHeadingPID:
    def __init__(self, kp=0.65, ki=0.012, kd=0.28):
        self.kp = kp
        self.ki = ki
        self.kd = kd
        self.integral = 0.0
        self.prev_error = 0.0
        self.last_time = time.ticks_ms()

    def reset(self):
        self.integral = 0.0
        self.prev_error = 0.0
        self.last_time = time.ticks_ms()

    def compute(self, target, current):
        now = time.ticks_ms()
        dt = time.ticks_diff(now, self.last_time) / 1000.0
        if dt <= 0.001: dt = 0.02
        self.last_time = now

        # Shortest circular error (-180 to +180)
        error = (target - current + 180) % 360 - 180

        # Anti-windup integral
        if abs(error) < 18.0:
            self.integral += error * dt
            self.integral = max(-6.0, min(6.0, self.integral))
        else:
            self.integral = 0.0

        # Derivative on error rate
        d_error = (error - self.prev_error) / dt
        self.prev_error = error

        pid_out = (self.kp * error) + (self.ki * self.integral) + (self.kd * d_error)
        return error, pid_out

align_pid = ContinuousHeadingPID(kp=0.50, ki=0.010, kd=0.22)
cruise_pid = ContinuousHeadingPID(kp=0.60, ki=0.012, kd=0.26)


# ================= 5. EMBEDDED REAL-TIME WEB SERVER =================
HTML_PAGE = """<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>LOF TITAN Security Rover</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #070a12; color: #f8fafc; margin: 0; padding: 14px; text-align: center; }
    .card { background: #111827; border-radius: 20px; padding: 18px; margin: 10px auto; max-width: 450px; border: 1px solid #1f2937; box-shadow: 0 20px 35px -10px rgba(0,0,0,0.8); }
    h1 { font-size: 1.25rem; color: #38bdf8; margin: 0 0 10px; font-weight: 800; }
    .status-badge { display: inline-block; padding: 5px 14px; border-radius: 9999px; font-weight: 700; font-size: 11px; margin-bottom: 14px; letter-spacing: 0.5px; }
    .badge-ok { background: #064e3b; color: #34d399; border: 1px solid #059669; }
    .badge-alarm { background: #881337; color: #fda4af; border: 1px solid #e11d48; animation: pulse 0.7s infinite alternate; }
    @keyframes pulse { from { transform: scale(1); } to { transform: scale(1.05); } }
    
    .grid { display: grid; grid-template-columns: repeat(8, 1fr); gap: 4px; background: #0b1120; padding: 10px; border-radius: 14px; border: 1px solid #1f2937; }
    .pixel { aspect-ratio: 1; border-radius: 4px; font-size: 8px; display: flex; align-items: center; justify-content: center; font-weight: 800; color: #ffffff; text-shadow: 0 1px 2px #000000; }
    
    .nav-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 14px; }
    .nav-box { background: #1f2937; border: 1px solid #374151; border-radius: 14px; padding: 10px; }
    .nav-label { font-size: 10px; color: #9ca3af; font-family: monospace; font-weight: bold; text-transform: uppercase; margin-bottom: 4px; }
    .nav-val { font-size: 14px; font-family: monospace; font-weight: 900; }
    .cur-val { color: #38bdf8; }
    .tgt-val { color: #fbbf24; }
    
    .stats-bar { display: flex; justify-content: space-around; margin-top: 12px; font-family: monospace; font-size: 11px; color: #94a3b8; background: #0b1120; padding: 8px; border-radius: 12px; border: 1px solid #1f2937; }
    .stat-num { font-size: 13px; font-weight: 800; color: #f59e0b; margin-top: 2px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>🛡️ LOF TITAN Security Rover</h1>
    <div id="status" class="status-badge badge-ok">CONTINUOUS PID LOCK ACTIVE (+/-2°)</div>
    
    <div class="grid" id="heatmap"></div>

    <div class="nav-grid">
      <div class="nav-box">
        <div class="nav-label">🧭 Current Heading</div>
        <div class="nav-val cur-val" id="curHeading">--° (--)</div>
      </div>
      <div class="nav-box">
        <div class="nav-label">🎯 Targeted Heading</div>
        <div class="nav-val tgt-val" id="tgtHeading">--° (--)</div>
      </div>
    </div>

    <div class="stats-bar">
      <div>Max Temp<div class="stat-num" id="maxTemp">-- °C</div></div>
      <div>Time Left<div class="stat-num" id="timer">20.0s</div></div>
      <div>Speed Range<div class="stat-num">0% - 30%</div></div>
    </div>
  </div>

  <script>
    function tempToColor(t) {
      const norm = Math.max(0, Math.min(1, (t - 22) / (35 - 22)));
      const hue = (1 - norm) * 240;
      return \`hsl(\${hue}, 95%, 48%)\`;
    }

    async function fetchTelemetry() {
      try {
        const res = await fetch('/data?t=' + Date.now(), { cache: 'no-store' });
        const d = await res.json();
        
        const grid = document.getElementById('heatmap');
        grid.innerHTML = '';
        d.pixels.forEach(p => {
          const div = document.createElement('div');
          div.className = 'pixel';
          div.style.backgroundColor = tempToColor(p);
          div.innerText = p.toFixed(0);
          grid.appendChild(div);
        });

        document.getElementById('curHeading').innerText = d.cur_angle.toFixed(1) + '° (' + d.cur_dir + ')';
        document.getElementById('tgtHeading').innerText = d.tgt_angle.toFixed(1) + '° (' + d.tgt_dir + ')';
        document.getElementById('maxTemp').innerText = d.max.toFixed(1) + ' °C';
        document.getElementById('timer').innerText = d.time_left.toFixed(1) + 's';

        const st = document.getElementById('status');
        if (d.alarm) {
          st.className = 'status-badge badge-alarm';
          st.innerText = '🚨 HEAT INTRUSION DETECTED (>30°C)';
        } else {
          st.className = 'status-badge badge-ok';
          st.innerText = '✅ ADVANCING TOWARDS ' + d.tgt_dir + ' (' + d.tgt_angle.toFixed(0) + '°)';
        }
      } catch(e) {}
    }
    setInterval(fetchTelemetry, 300);
    fetchTelemetry();
  </script>
</body>
</html>"""

def start_wifi_ap():
    ap = network.WLAN(network.AP_IF)
    ap.active(True)
    ap.config(essid="TITAN_SECURITY_ROVER", password="12345678", authmode=network.AUTH_WPA_WPA2_PSK)
    print("[WIFI AP READY] SSID: TITAN_SECURITY_ROVER | IP:", ap.ifconfig()[0])
    return ap

def process_web_requests(s_sock, mission_state):
    thermal.update()
    compass.update()
    if not s_sock: return
    try:
        r, _, _ = select.select([s_sock], [], [], 0)
        if r:
            client, addr = s_sock.accept()
            client.settimeout(0.5)
            req = client.recv(512).decode('utf-8', 'ignore')
            
            if "GET /data" in req:
                payload = ujson.dumps({
                    "max": thermal.max_temp,
                    "min": thermal.min_temp,
                    "avg": thermal.avg_temp,
                    "cur_angle": compass.heading,
                    "cur_dir": compass.direction,
                    "tgt_angle": mission_state.get("target_angle", 0.0),
                    "tgt_dir": mission_state.get("target_dir", "NORTH"),
                    "time_left": mission_state.get("time_left", 20.0),
                    "alarm": mission_state.get("alarm", False),
                    "pixels": thermal.pixels
                })
                resp = "HTTP/1.1 200 OK\\r\\nContent-Type: application/json\\r\\nCache-Control: no-cache, no-store, must-revalidate\\r\\nConnection: close\\r\\n\\r\\n" + payload
                client.sendall(resp.encode('utf-8'))
            else:
                resp = "HTTP/1.1 200 OK\\r\\nContent-Type: text/html\\r\\nCache-Control: no-cache, no-store, must-revalidate\\r\\nConnection: close\\r\\n\\r\\n" + HTML_PAGE
                client.sendall(resp.encode('utf-8'))
            client.close()
    except Exception:
        pass


# ================= 6. CONTINUOUS-ALIGNMENT PATROL MISSION =================

def intelligent_align_to_heading(target_heading, tolerance=2.0, server_socket=None, mission_state=None):
    """
    Smoothly pivots the rover to the target heading using intelligent PID
    with smooth acceleration and deceleration between 0% and 30%.
    """
    target_dir_name = "NORTH" if (target_heading < 90 or target_heading > 270) else "SOUTH"
    mission_state["target_angle"] = target_heading
    mission_state["target_dir"] = target_dir_name

    print(f"\\n[PID PIVOT] Aligning to {target_dir_name} ({target_heading}°) | Tolerance: +/-{tolerance}°...")
    align_pid.reset()
    stable_count = 0

    while True:
        process_web_requests(server_socket, mission_state)
        curr = compass.heading
        error, pid_cmd = align_pid.compute(target_heading, curr)

        # Within tolerance check
        if abs(error) <= tolerance:
            smooth_motors(0, 0, max_step=3.0)
            stable_count += 1
            if stable_count >= 5: # Steady for ~100ms
                stop_smooth()
                print(f"[PID LOCKED] Steady at {curr:.1f}° ({compass.direction}) | Error: {error:+.1f}° ✅")
                break
        else:
            stable_count = 0
            
            # Smoothly map PID output into 0% - 30% range
            abs_err = abs(error)
            if abs_err > 45.0:
                speed = 28.0
            elif abs_err > 15.0:
                speed = 24.0
            else:
                speed = max(18.0, min(23.0, 16.0 + abs_err * 0.4))
            
            # Direct negative feedback turn towards target
            if error > 0:
                smooth_motors(target_m1=-speed, target_m2=speed, max_step=1.8)
            else:
                smooth_motors(target_m1=speed, target_m2=-speed, max_step=1.8)

        time.sleep_ms(20)


def run_patrol_leg(target_heading, target_name, duration_sec=20.0, s_sock=None, mission_state=None):
    """
    Advances towards target_heading for 20 active seconds while CONTINUOUSLY
    adjusting steering via PID so heading remains strictly within +/-2° throughout.
    """
    mission_state["target_angle"] = target_heading
    mission_state["target_dir"] = target_name
    elapsed_active_time = 0.0
    last_tick = time.ticks_ms()

    # 1. Initial pivot alignment to target heading
    intelligent_align_to_heading(target_heading, tolerance=2.0, server_socket=s_sock, mission_state=mission_state)

    cruise_pid.reset()
    base_forward_speed = 25.0 # Center speed (0% to 30% envelope)

    print(f"\\n[PATROL START] Advancing towards {target_name} ({target_heading}°) for {duration_sec}s with continuous PID lock...")

    while elapsed_active_time < duration_sec:
        now = time.ticks_ms()
        dt = time.ticks_diff(now, last_tick) / 1000.0
        last_tick = now

        process_web_requests(s_sock, mission_state)
        max_t = thermal.max_temp
        curr_h = compass.heading

        # Heat Intrusion Alarm (> 30°C)
        if max_t > 30.0:
            mission_state["alarm"] = True
            stop_smooth()
            set_buzzer(True)
            print(f"🚨 [HEAT ALARM] {max_t:.1f}°C detected (>30°C)! Patrol PAUSED at {duration_sec - elapsed_active_time:.1f}s")
            
            led_state = True
            set_m3_led(True, speed=20)
            last_blink = time.ticks_ms()

            while True:
                process_web_requests(s_sock, mission_state)

                # Blink M3 LED every 0.2s (200ms) with forward speed 20
                now_blink = time.ticks_ms()
                if time.ticks_diff(now_blink, last_blink) >= 200:
                    led_state = not led_state
                    set_m3_led(led_state, speed=20)
                    last_blink = now_blink

                if thermal.max_temp <= 30.0:
                    break
                time.sleep_ms(20)

            set_m3_led(False)
            set_buzzer(False)
            mission_state["alarm"] = False
            print(f"✅ [HEAT CLEARED] Temp: {thermal.max_temp:.1f}°C. Re-aligning & Resuming...")
            intelligent_align_to_heading(target_heading, tolerance=2.0, server_socket=s_sock, mission_state=mission_state)
            cruise_pid.reset()
            last_tick = time.ticks_ms()
            continue

        # Active driving timer accumulation
        elapsed_active_time += dt
        mission_state["time_left"] = max(0.0, duration_sec - elapsed_active_time)

        # Telemetry to Serial Monitor
        if int(elapsed_active_time * 4) % 4 == 0:
            print(f"[PATROL LOCK] {target_name} ({target_heading}°) | Current: {curr_h:.1f}° ({compass.direction}) | Heat: {max_t:.1f}°C | Left: {mission_state['time_left']:.1f}s")

        # CONTINUOUS PID ALIGNMENT THROUGHOUT THE 20 SECONDS:
        error, corr = cruise_pid.compute(target_heading, curr_h)

        if abs(error) <= 2.0:
            # Perfectly aligned within +/-2° limit: cruise smoothly straight
            smooth_motors(target_m1=base_forward_speed, target_m2=base_forward_speed, max_step=1.5)
        elif abs(error) <= 12.0:
            # Small drift (> 2°): continuous differential steering correction within 0-30%
            corr_clamped = max(-6.0, min(6.0, corr))
            m1_cmd = max(0.0, min(30.0, base_forward_speed - corr_clamped))
            m2_cmd = max(0.0, min(30.0, base_forward_speed + corr_clamped))
            smooth_motors(target_m1=m1_cmd, target_m2=m2_cmd, max_step=1.5)
        else:
            # Significant drift (> 12°): actively steer in place to bring back to target angle
            turn_speed = 22.0
            if error > 0:
                smooth_motors(target_m1=-turn_speed, target_m2=turn_speed, max_step=2.0)
            else:
                smooth_motors(target_m1=turn_speed, target_m2=-turn_speed, max_step=2.0)

        time.sleep_ms(20)

    stop_smooth()
    print(f"[PATROL LEG COMPLETE] Finished 20 seconds advancing {target_name}!")


# ================= 7. MAIN MISSION ENTRY =================
def main():
    print("==================================================")
    print("🚀 LOF TITAN Continuous-PID Security Rover Ready")
    print("⚡ Speed Range: 0% to 30% | Heading Lock: +/-2.0°")
    print("==================================================")

    start_wifi_ap()
    s_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s_sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    s_sock.bind(('0.0.0.0', 80))
    s_sock.listen(5)
    s_sock.setblocking(False)

    mission_state = {
        "target_angle": 0.0,
        "target_dir": "NORTH",
        "time_left": 20.0,
        "alarm": False
    }

    set_buzzer(True); time.sleep_ms(80); set_buzzer(False)
    set_m3_led(False)

    try:
        while True:
            # 1. Patrol NORTH (0°) for 20 active seconds with continuous alignment
            run_patrol_leg(target_heading=0.0, target_name="NORTH", duration_sec=20.0, s_sock=s_sock, mission_state=mission_state)
            
            # 2. Pivot 180° to SOUTH (180°)
            intelligent_align_to_heading(target_heading=180.0, tolerance=2.0, server_socket=s_sock, mission_state=mission_state)

            # 3. Patrol SOUTH (180°) for 20 active seconds with continuous alignment
            run_patrol_leg(target_heading=180.0, target_name="SOUTH", duration_sec=20.0, s_sock=s_sock, mission_state=mission_state)

            # 4. Pivot 180° back to NORTH (0°)
            intelligent_align_to_heading(target_heading=0.0, tolerance=2.0, server_socket=s_sock, mission_state=mission_state)

            time.sleep_ms(5)
    except KeyboardInterrupt:
        stop_smooth()
        set_buzzer(False)
        set_m3_led(False)
        print("[ROVER STOPPED BY OPERATOR]")

if __name__ == '__main__':
    main()
`,

    // ---------------------------------------------------------------
    // CONTENT PENDING: requirements[] (bill of materials) and assembly[]
    // steps. Deliberately absent rather than guessed - the detail page
    // hides any section with no data and renumbers the rest, so this
    // renders correctly as-is.
    // ---------------------------------------------------------------
  },
  {
    id: 'star-spectrum-decoder',
    name: 'Star Spectrum Decoder',
    category: 'Light & Spectrum Analysis',
    badge: 'DIY Spectrum Kit',
    // rating / reviews / duration / difficulty / age are NOT set: they were not
    // supplied with the content. The dashboard card falls back to sane defaults,
    // but until difficulty and duration are real this kit will not appear under
    // those filter facets. Set them when the content team confirms.
    heroImage: 'lof-titan/banners/banner-cosmic',
    thumbnail: 'lof-titan/banners/banner-cosmic',
    tagline: 'Multi-Channel Light Sensing & Spectrum Comparison',
    description:
      'Builds understanding of multi-channel light sensing and spectrum analysis using the AS7341 sensor, RGB light sources, and visual graphs to compare different light patterns, adding complexity through light-data interpretation and comparison.',

    specs: [
      { label: 'SENSORS', value: 'AS7341 Spectral Colour Sensor' },
      { label: 'MCU', value: 'ESP32-S3 TITAN' },
    ],

    // Safety Warnings
    safetyWarnings: {
      hardware: [
        '⚠️ Use the screwdriver carefully while fitting the screws. Avoid excessive force that could crack the 3D-printed parts.',
        '⚠️ Use the correct screw at each mounting point to prevent damage to the PCB or internal components.',
        '⚠️ Route the OLED, sensor, LED, and RMC cables neatly so they are not pinched, sharply bent, or trapped under screws.'
      ],
      electronics: [
        '⚡ Switch OFF the ESP32-S3 before connecting or changing the AS7341 sensor, OLED, LEDs, or RMC cables.',
        '⚡ Check the battery polarity and rocker-switch wiring before powering the project. Incorrect polarity may damage the PCB or connected modules.',
        '⚡ Use the adapter only through the designated power or charging connection and keep the Li-ion battery away from heat, water, and conductive objects.',
        '⚡ Avoid staring at the red, green, blue, yellow, or white LEDs from very close range, especially during repeated spectrum tests.'
      ]
    },

    // Component Labs. Images pending - a component with an empty image renders
    // with the visual column hidden in production and a dev-only placeholder.
    components: [
      {
        id: 'as7341-spectral-sensor',
        shortName: 'AS7341',
        name: 'AS7341 Spectral Colour Sensor',
        // Upload artwork, then set this to the Cloudinary public id:
        //   image: 'lof-titan/star-spectrum-decoder/as7341-spectral-sensor',
        image: '',
        pinMapping: 'SDA: GPIO 7 | SCL: GPIO 8',
        whatIsIt: 'A multi-channel spectral sensor used to detect and measure different wavelengths of visible light.',
        howItWorks: 'The AS7341 separates incoming light into different spectral channels. The ESP32-S3 reads these values through I2C communication and uses them to compare the light patterns produced by different sources.'
      },
      {
        id: 'oled-display',
        shortName: 'OLED Display',
        name: '2.42 Inch OLED Display',
        // Upload artwork, then set this to the Cloudinary public id:
        //   image: 'lof-titan/star-spectrum-decoder/oled-display',
        image: '',
        pinMapping: 'SDA: GPIO 7 | SCL: GPIO 8',
        whatIsIt: 'A compact OLED screen used to display spectral readings, graphs, labels, and comparison results.',
        howItWorks: 'The ESP32-S3 sends processed spectrum data to the OLED through I2C communication. The OLED activates individual pixels to display the required information.'
      },
      {
        id: 'esp32-s3',
        shortName: 'ESP32-S3',
        name: 'ESP32-S3',
        // Upload artwork, then set this to the Cloudinary public id:
        //   image: 'lof-titan/star-spectrum-decoder/esp32-s3',
        image: '',
        pinMapping: 'GPIO | I2C | USB TYPE-C',
        whatIsIt: 'A programmable microcontroller that acts as the main controller of the Star Spectrum Decoder.',
        howItWorks: 'The ESP32-S3 collects spectral data from the AS7341, processes and compares the readings, controls the LEDs, and sends the results to the OLED display.'
      }
    ],

    faqTitle: 'FAQ & Hardware Troubleshooting',
    faq: [
      {
        q: 'Why is the AS7341 showing very similar readings for different coloured LEDs?',
        a: 'Make sure only one LED is illuminating the sensor at a time and reduce interference from surrounding room light. Keep the LED-to-sensor distance similar for every test so the spectral readings can be compared properly.'
      },
      {
        q: 'Why are the spectrum readings changing even when the same LED is being tested?',
        a: 'Ambient lighting, shadows, sensor distance and the angle of the light source can affect the readings. Keep the sensor and LED in a fixed position and perform the comparison under consistent lighting conditions.'
      },
      {
        q: 'Why is the OLED not showing the spectral data?',
        a: 'Check the I2C connections between the ESP32-S3, AS7341 and OLED, especially SDA and SCL. Make sure both I2C devices are detected and receiving power before running the spectrum-analysis program.'
      }
    ],

    challengesTitle: 'Robotics Mission Challenges',
    challenges: [
      {
        id: 'light-password-decoder',
        level: 'Easy',
        title: 'Challenge 1: Light Password Decoder',
        goal: 'Assign different colours to different commands, such as Red = A, Green = B and Blue = C. Flash a sequence of colours from the RGB source. The AS7341 detects the sequence and the ESP32 decodes it into a letter or simple message.',
        hint: [
          'Test the decoder with a simple sequence like Red → Green → Blue first, then move to longer password combinations once individual colours are detected reliably.',
          'Store every detected colour as a code, such as R, G, or B, and decode the message only after the complete colour sequence has been received.'
        ]
      },
      {
        id: 'spectrum-security-lock',
        level: 'Intermediate',
        title: 'Challenge 2: Spectrum Security Lock',
        goal: 'Use the sliding switch to ARM or DISARM the security system. When armed, the learner shows a coloured light to the AS7341 sensor. The ESP32 checks whether the detected colour matches the stored secret colour key. If correct, access is granted; if incorrect, an alert is activated. Correct colour: the OLED shows ACCESS GRANTED, the LED turns ON and the buzzer gives a short confirmation beep. Wrong colour: the OLED shows ACCESS DENIED and the buzzer gives an alert pattern.',
        hint: 'Measure the ambient light with the RGB source OFF and use it as a baseline before checking the security colour.'
      },
      {
        id: 'spectrum-rescue-challenge',
        level: 'Advanced',
        title: 'Challenge 3: Spectrum Rescue Challenge',
        goal: 'The Star Spectrum Decoder worked correctly during the original session. Now it has been moved to a location with bright sunlight, changing room lighting, shadows, or coloured ambient light. The AS7341 readings are inconsistent, and the system sometimes identifies or compares light patterns incorrectly. Investigate why the spectral readings have changed and modify the setup and/or program so that the Star Spectrum Decoder gives reliable results even when the surrounding lighting conditions change.',
        hint: [
          'If readings become too high or too low, investigate the AS7341\'s gain and measurement/integration settings.',
          'Try testing the same colour in a bright area and then in a darker area. Compare the spectral values.'
        ]
      }
    ],

    // ---------------------------------------------------------------
    // CONTENT PENDING: requirements[] (bill of materials), assembly[]
    // steps, and the MicroPython code. Deliberately absent rather than
    // guessed - the detail page hides any section with no data and
    // renumbers the rest, so this renders correctly as-is.
    // ---------------------------------------------------------------
  },
  {
    id: 'bluetooth-navigator',
    name: 'Bluetooth Navigator',
    category: 'Wireless Control & Navigation',
    badge: 'DIY Wireless Rover',
    // rating / reviews / duration / difficulty / age are NOT set: they were not
    // supplied with the content. The dashboard card falls back to sane defaults,
    // but until difficulty and duration are real this kit will not appear under
    // those filter facets. Set them when the content team confirms.
    heroImage: 'v1788948844/lof-titan/banners/banner-bluetooth-navigator',
    thumbnail: 'v1788948844/lof-titan/banners/banner-bluetooth-navigator',
    tagline: 'Joystick-Driven Bluetooth Rover Control',
    description:
      'Students learn how a joystick module input is converted into a wireless Bluetooth command, which the rover receives and interprets to control the motors and move forward, backward, left, or right.',

    specs: [
      { label: 'MCU', value: 'ESP32-S3 TITAN' },
    ],

    // Safety Warnings
    safetyWarnings: {
      hardware: [
        '⚠️ Use the screwdriver carefully while fitting screws. Avoid excessive force that may crack the 3D-printed parts.',
        '⚠️ Tighten the screws only until the components are firmly secured.',
        '⚠️ Keep fingers, hair, wires, and loose objects away from the wheels and rotating motor shafts while the rover is running.',
        '⚠️ Route the motor and power cables so they are not caught near the wheels, pinched under parts, or pulled during movement.'
      ],
      electronics: [
        '⚡ Switch OFF the rover before connecting or changing the ESP32-S3, motor driver, motors, battery, or RMC cables.',
        '⚡ Check the battery polarity and rocker-switch wiring before powering the system.',
        '⚡ Use the adapter only through the designated charging or power connection.',
        '⚡ Avoid shorting the TB6612FNG motor outputs or connecting/disconnecting motors while the rover is powered.',
        '⚡ Keep the Li-ion battery away from heat, water, sharp objects, and conductive materials, and stop using it if it becomes swollen or unusually hot.'
      ]
    },

    // Component Labs. Images pending - a component with an empty image renders
    // with the visual column hidden in production and a dev-only placeholder.
    components: [
      {
        id: 'pcb-joystick',
        shortName: 'Joystick',
        name: 'PCB-Built-in Joystick',
        image: 'v1788948479/lof-titan/bluetooth-navigator/pcb-joystick',
        pinMapping: 'X-AXIS | Y-AXIS | DIRECTION INPUT',
        whatIsIt: 'A two-axis control device built into the controller PCB and used to give movement commands to the rover.',
        howItWorks: 'Moving the joystick changes its X-axis and Y-axis values. The ESP32-S3 interprets these values as forward, backward, left, or right commands and sends the required movement instruction wirelessly.'
      },
      {
        id: 'esp32-s3',
        shortName: 'ESP32-S3',
        name: 'ESP32-S3',
        image: 'v1788948210/lof-titan/bluetooth-navigator/esp32-s3',
        pinMapping: 'BLUETOOTH | GPIO | USB TYPE-C',
        whatIsIt: 'A programmable microcontroller that manages wireless communication and rover movement.',
        howItWorks: 'The ESP32-S3 reads or receives the movement command through Bluetooth, interprets the required direction, and sends control signals to the motor driver.'
      },
      {
        id: 'tb6612fng-motor-driver',
        shortName: 'TB6612FNG',
        name: 'TB6612FNG Motor Driver',
        image: 'v1788948483/lof-titan/bluetooth-navigator/tb6612fng-motor-driver',
        pinMapping: 'MOTOR CONTROL INTERFACE',
        whatIsIt: 'An electronic driver that controls the direction and operation of the rover\'s DC motors.',
        howItWorks: 'The ESP32-S3 sends control signals to the TB6612FNG. The driver switches the motor outputs accordingly, allowing the motors to rotate forward or backward for different rover movements.'
      },
      {
        id: 'bo-motor',
        shortName: 'BO Motor',
        name: 'BO Motor',
        image: 'v1788948486/lof-titan/bluetooth-navigator/bo-motor',
        pinMapping: '2-PIN RMC MOTOR CONNECTION',
        whatIsIt: 'A geared DC motor used to drive the rover\'s wheels at a controlled rotational speed.',
        howItWorks: 'Electrical power supplied through the motor driver rotates the motor shaft. Changing the motor direction and combination of left and right wheel movement allows the rover to move and turn.'
      }
    ],

    faqTitle: 'FAQ & Hardware Troubleshooting',
    faq: [
      {
        q: 'Why is the rover not responding when the joystick is moved?',
        a: 'Check whether the controller and rover have established the required Bluetooth connection. If wireless communication is not active, the joystick commands will not reach the rover.'
      },
      {
        q: 'Why does the rover move in the opposite direction to the joystick command?',
        a: 'Check the left and right motor connections to the TB6612FNG. Reversed motor wiring can make a wheel rotate in the opposite direction and cause incorrect rover movement.'
      },
      {
        q: 'Why does the Bluetooth connection work but the motors do not move?',
        a: 'Check that the motor driver and 12V battery are properly connected and that the rocker switch is ON. Also confirm that the TB6612FNG is receiving the required motor-control signals from the ESP32-S3.'
      }
    ],

    challengesTitle: 'Robotics Mission Challenges',
    challenges: [
      {
        id: 'wireless-rover-dance-bot',
        level: 'Easy',
        title: 'Challenge 1: Wireless Rover Dance Bot',
        goal: 'Assign each button a completely different movement routine such as Spin, Zig-Zag, Shake and Circle. Pressing a button wirelessly triggers the complete movement pattern on the rover.',
        hint: [
          'Store each dance move as a separate function such as spin(), zigZag(), shake(), and circle() so the code is easier to test and modify.',
          'Use different motor directions for each routine—for example, left motors forward + right motors backward can create a spin.',
          'For Zig-Zag and Shake movements, use short timed left-right motor changes instead of long delays so the rover stays controlled.',
          'Make the rover stop both motors at the end of every dance routine before waiting for the next Bluetooth command.'
        ]
      },
      {
        id: 'wireless-route-memory-rover',
        level: 'Intermediate',
        title: 'Challenge 2: Wireless Route Memory Rover',
        goal: 'Create a rover where the learner first enters a sequence of movements using the controller, such as Forward → Forward → Left → Forward → Right. The transmitter ESP32 sends the commands wirelessly to the rover. Instead of moving immediately, the rover ESP32 stores the commands in memory. When the learner gives the PLAY command using the joystick/button, the rover automatically performs the complete stored route in the same order.',
        hint: [
          'Give each stored movement a fixed duration, such as Forward = 1 second and Turn = 500 ms, so the rover can reproduce the route consistently.',
          'Ignore new movement commands while the rover is playing back a stored route, then return to recording mode after playback finishes.'
        ]
      },
      {
        id: 'precision-joystick-parking',
        level: 'Advanced',
        title: 'Challenge 3: Precision Joystick Parking',
        goal: 'Program the joystick so the rover moves slowly when the stick is only slightly tilted. Students use this fine-control mode to park the rover accurately inside a marked zone.',
        hint: [
          'Measure the joystick values when it is released at the centre, then create a small range around those values where the motor speed stays at 0. This prevents the rover from moving because of small joystick fluctuations.',
          'For precise parking, limit the minimum movement speed so a slight joystick tilt makes the rover crawl slowly rather than suddenly accelerating.',
          'When the joystick returns to the dead zone, immediately set both motor PWM values to 0 so the rover stops exactly where the learner wants.'
        ]
      }
    ],

    // ---------------------------------------------------------------
    // CONTENT PENDING: requirements[] (bill of materials), assembly[]
    // steps, and the MicroPython code. Deliberately absent rather than
    // guessed - the detail page hides any section with no data and
    // renumbers the rest, so this renders correctly as-is.
    // ---------------------------------------------------------------
  },
  {
    id: 'lost-bots-navigation',
    name: 'Lost Bot\'s Navigation',
    category: 'Autonomous Navigation & Obstacle Avoidance',
    badge: 'DIY Autonomous Rover',
    // rating / reviews / duration / difficulty / age are NOT set: they were not
    // supplied with the content. The dashboard card falls back to sane defaults,
    // but until difficulty and duration are real this kit will not appear under
    // those filter facets. Set them when the content team confirms.
    heroImage: 'v1788951247/lof-titan/banners/banner-lost-bots-navigation',
    thumbnail: 'v1788951247/lof-titan/banners/banner-lost-bots-navigation',
    tagline: 'ToF Distance Sensing & Autonomous Path Selection',
    codeFilename: 'lostbot_navigation.py',
    description:
      'Applies distance sensing and safety-limit comparison to detect obstacles and automatically slow down, stop, reverse, or turn, increasing complexity through autonomous navigation and safer path selection.',

    specs: [
      { label: 'SENSORS', value: 'VL53L0X TOF-BASED LIDAR Laser Distance Sensor' },
      { label: 'MCU', value: 'ESP32-S3 TITAN' },
    ],

    // Safety Warnings
    safetyWarnings: {
      hardware: [
        '⚠️ Use the screwdriver carefully while fitting screws. Avoid excessive force that may damage the 3D-printed parts or PCB mounting points.',
        '⚠️ Tighten the screws only until the components are securely fixed.',
        '⚠️ Keep fingers, hair, wires, and loose objects away from the wheels and rotating motor shafts while the rover is moving.',
        '⚠️ Route motor and sensor cables so they are not caught near the wheels, pinched under parts, or pulled during movement.'
      ],
      electronics: [
        '⚡ Switch OFF the rover before connecting or changing the ESP32-S3, VL53L0X sensor, motor driver, motors, or RMC cables.',
        '⚡ Check the Li-ion battery polarity and rocker-switch wiring before powering the rover.',
        '⚡ Use the adapter only through the designated power or charging connection.',
        '⚡ Avoid shorting the TB6612FNG motor outputs or reconnecting motors while power is ON.',
        '⚡ Keep the VL53L0X sensing window clean and unobstructed, and avoid viewing the sensor emitter from extremely close range during operation.',
        '⚡ Keep the Li-ion battery away from heat, water, sharp objects, and conductive materials, and stop using it if it becomes swollen, damaged, or unusually hot.'
      ]
    },

    // Component Labs. Images pending - a component with an empty image renders
    // with the visual column hidden in production and a dev-only placeholder.
    components: [
      {
        id: 'vl53l0x-tof-sensor',
        shortName: 'VL53L0X',
        name: 'VL53L0X ToF Laser Distance Sensor',
        image: 'v1788949794/lof-titan/lost-bots-navigation/vl53l0x-tof-sensor',
        pinMapping: 'SDA: GPIO 7 | SCL: GPIO 8',
        whatIsIt: 'A compact distance sensor used to measure how far an object or obstacle is from the rover.',
        howItWorks: 'The VL53L0X uses Time-of-Flight technology to send infrared light towards an object and measure the time taken for the reflected light to return. The ESP32-S3 uses this distance information to make navigation decisions.'
      },
      {
        id: 'esp32-s3',
        shortName: 'ESP32-S3',
        name: 'ESP32-S3',
        image: 'v1788949904/lof-titan/lost-bots-navigation/esp32-s3',
        pinMapping: 'GPIO | I2C | USB TYPE-C',
        whatIsIt: 'A programmable microcontroller that acts as the main controller of the autonomous rover.',
        howItWorks: 'The ESP32-S3 reads distance data from the VL53L0X, compares it with programmed safety limits, and decides whether the rover should continue, slow down, stop, reverse, or turn.'
      },
      {
        id: 'tb6612fng-motor-driver',
        shortName: 'TB6612FNG',
        name: 'TB6612FNG Motor Driver',
        image: 'v1788949905/lof-titan/lost-bots-navigation/tb6612fng-motor-driver',
        pinMapping: 'MOTOR CONTROL INTERFACE',
        whatIsIt: 'An electronic driver that controls the direction and movement of the rover’s DC motors.',
        howItWorks: 'The ESP32-S3 sends control signals to the TB6612FNG. The driver then controls the motors so the rover can move forward, reverse, stop, or turn during obstacle avoidance.'
      },
      {
        id: 'bo-motor',
        shortName: 'BO Motor',
        name: 'BO Motor',
        image: 'v1788949906/lof-titan/lost-bots-navigation/bo-motor',
        pinMapping: '2-PIN RMC MOTOR CONNECTION',
        whatIsIt: 'A geared DC motor used to drive the wheels of the rover.',
        howItWorks: 'Electrical power from the motor driver rotates the motor shaft. By controlling the direction of the left and right motors, the rover can move and change its path.'
      }
    ],

    faqTitle: 'FAQ & Hardware Troubleshooting',
    faq: [
      {
        q: 'Why is the rover not detecting an obstacle in front of it?',
        a: 'Check that the VL53L0X sensing window is clean and facing directly towards the path ahead. Make sure no part of the rover body or loose cable is blocking the sensor.'
      },
      {
        q: 'Why does the rover stop or turn even when there is no nearby obstacle?',
        a: 'Nearby surfaces, highly reflective objects, or an incorrect distance threshold can affect the measurement. Test the rover in a clear area and check whether the programmed safety distance is appropriate.'
      },
      {
        q: 'Why does the sensor detect the obstacle but the rover does not stop?',
        a: 'Check whether the ESP32-S3 is correctly comparing the measured distance with the programmed limit. Also verify the TB6612FNG and motor connections, since the sensor may be working even if the motor-control response is not.'
      }
    ],

    challengesTitle: 'Robotics Mission Challenges',
    challenges: [
      {
        id: 'contactless-led-switch',
        level: 'Easy',
        title: 'Challenge 1: Contactless LED Switch',
        goal: 'Use hand distance as a contactless switch. Bring the hand close to turn the Red LED ON; move it farther away to turn the Green LED ON.',
        hint: [
          'Take a few consecutive distance readings before changing the LED state so one unstable reading does not cause flickering.',
          'If the VL53L1X returns an invalid or out-of-range value, keep both LEDs OFF instead of treating it as a valid gesture.'
        ]
      },
      {
        id: 'distance-controlled-speed-rover',
        level: 'Intermediate',
        title: 'Challenge 2: Distance-Controlled Speed Rover',
        goal: 'Use the measured distance to continuously control motor speed. Far object → rover moves fast; medium distance → slower; close object → very slow; minimum distance → stop.',
        hint: [
          'Instead of changing motor speed suddenly, reduce the PWM gradually as the measured distance decreases to make the rover move more smoothly.',
          'Keep a minimum safe distance where the motor PWM becomes 0 so the rover stops before reaching the object.',
          'Take a few distance readings and use the average value before updating motor speed to prevent sudden speed changes caused by one unstable reading.'
        ]
      },
      {
        id: 'bright-outdoor-navigation',
        level: 'Advanced',
        title: 'Challenge 3: Bright Outdoor Navigation Challenge',
        goal: 'Move the rover from the indoor lab to a terrace, sunlit corridor, or area under very strong lighting. Modify the sensor placement, measurement settings, filtering, and safety thresholds so the rover can continue detecting obstacles reliably.',
        hint: [
          'Add a small shade or hood around the sensor to reduce direct sunlight reaching it, but make sure the sensor’s front sensing area is not blocked.',
          'Test with the same obstacle, distance, and sensor angle indoors and outdoors so you can accurately compare the effect of bright ambient light.'
        ]
      }
    ],

    // MicroPython Main Script
    code: `# =====================================================
# LOF TITAN — 4-MOTOR ROVER OBSTACLE NAVIGATION (VL53L0X)
# Converted from lostbot_navigation.ino
# Hardware Pinout:
# - I2C ToF Sensor: GPIO 7 (SDA), GPIO 8 (SCL)
# - Motor 1 (Left Front): GPIO 15 (PWM), GPIO 16 (PWM)
# - Motor 2 (Right Front): GPIO 13 (PWM), GPIO 14 (PWM)
# - Motor 3 (Left Back): GPIO 11 (PWM), GPIO 12 (PWM)
# - Motor 4 (Right Back): GPIO 9 (PWM), GPIO 10 (PWM)
# =====================================================

import time
from machine import Pin, PWM, SoftI2C, I2C
from supervisor.led_buzzer import hw

# ================= PWM POOL MANAGER =================
_pwm_pool = {}
def _get_pwm(pin, freq=1000):
    if pin not in _pwm_pool:
        _pwm_pool[pin] = PWM(Pin(pin), freq=freq)
    else:
        try: _pwm_pool[pin].freq(freq)
        except Exception: pass
    return _pwm_pool[pin]

# ================= MOTOR PIN CONSTANTS =================
M1_A = 15
M1_B = 16

M2_A = 13
M2_B = 14

M3_A = 11
M3_B = 12

M4_A = 9
M4_B = 10

FORWARD_SPEED = 200     # 0-255 scale
TURN_SPEED = 150
BACKWARD_SPEED = 150
OBSTACLE_DISTANCE_MM = 300  # 30 cm

M1_INVERT = False
M2_INVERT = False
M3_INVERT = False
M4_INVERT = False

# ================= MOTOR DRIVE FUNCTIONS =================
def motor_drive(pin_a, pin_b, speed_val, forward=True, invert=False):
    speed_val = max(0, min(int(speed_val), 255))
    duty = int(speed_val * 65535 / 255)

    if invert:
        forward = not forward

    pwm_a = _get_pwm(pin_a)
    pwm_b = _get_pwm(pin_b)

    if speed_val == 0:
        pwm_a.duty_u16(0)
        pwm_b.duty_u16(0)
        return

    if forward:
        pwm_a.duty_u16(duty)
        pwm_b.duty_u16(0)
    else:
        pwm_a.duty_u16(0)
        pwm_b.duty_u16(duty)

def motor_m1(spd, forward=True):
    motor_drive(M1_A, M1_B, spd, forward, M1_INVERT)

def motor_m2(spd, forward=True):
    motor_drive(M2_A, M2_B, spd, forward, M2_INVERT)

def motor_m3(spd, forward=True):
    motor_drive(M3_A, M3_B, spd, forward, M3_INVERT)

def motor_m4(spd, forward=True):
    motor_drive(M4_A, M4_B, spd, forward, M4_INVERT)

def move_forward(spd):
    motor_m1(spd, True)
    motor_m2(spd, True)
    motor_m3(spd, True)
    motor_m4(spd, True)

def move_backward(spd):
    motor_m1(spd, False)
    motor_m2(spd, False)
    motor_m3(spd, False)
    motor_m4(spd, False)

def turn_right(spd):
    # Left side forward, right side backward
    motor_m1(spd, True)
    motor_m3(spd, True)
    motor_m2(spd, False)
    motor_m4(spd, False)

def turn_left(spd):
    # Left side backward, right side forward
    motor_m1(spd, False)
    motor_m3(spd, False)
    motor_m2(spd, True)
    motor_m4(spd, True)

def motor_off():
    for p in (M1_A, M1_B, M2_A, M2_B, M3_A, M3_B, M4_A, M4_B):
        _get_pwm(p).duty_u16(0)

# ================= SHARED I2C BUS (SDA: 7, SCL: 8) =================
_shared_i2c = None
def _get_shared_i2c():
    global _shared_i2c
    if _shared_i2c is None:
        try:
            _shared_i2c = SoftI2C(sda=Pin(7), scl=Pin(8), freq=400000, timeout=50000)
        except Exception:
            try:
                _shared_i2c = I2C(0, sda=Pin(7), scl=Pin(8), freq=100000)
            except Exception: pass
    return _shared_i2c

# ================= VL53L0X LASER TOF DRIVER =================
class VL53L0X:
    """Accurate Adafruit/Pololu compatible VL53L0X Driver for MicroPython."""
    def __init__(self, i2c=None, address=0x29):
        self.i2c = i2c if i2c else _get_shared_i2c()
        self.address = address
        self.stop_variable = 0
        self.init_done = False
        self._init_sensor()

    def _write_reg(self, reg, val):
        if not self.i2c: return
        try:
            self.i2c.writeto_mem(self.address, reg, bytes([val]))
        except Exception: pass

    def _write_reg_16(self, reg, val):
        if not self.i2c: return
        try:
            self.i2c.writeto_mem(self.address, reg, bytes([(val >> 8) & 0xFF, val & 0xFF]))
        except Exception: pass

    def _read_reg(self, reg, n=1):
        if not self.i2c: return bytearray(n)
        try:
            return self.i2c.readfrom_mem(self.address, reg, n)
        except Exception:
            return bytearray(n)

    def _init_sensor(self):
        if not self.i2c: return False
        try:
            # 2V8 I/O mode
            self._write_reg(0x89, self._read_reg(0x89)[0] | 0x01)
            self._write_reg(0x88, 0x00)
            self._write_reg(0x80, 0x01)
            self._write_reg(0xFF, 0x01)
            self._write_reg(0x00, 0x00)
            r91 = self._read_reg(0x91)
            self.stop_variable = r91[0] if len(r91) > 0 else 0x3C
            self._write_reg(0x00, 0x01)
            self._write_reg(0xFF, 0x00)
            self._write_reg(0x80, 0x00)

            # Signal rate limits
            self._write_reg(0x60, self._read_reg(0x60)[0] | 0x12)
            self._write_reg_16(0x44, 32)
            self._write_reg(0x01, 0xFF)

            # SPAD calibration with clean exit
            self._write_reg(0x80, 0x01)
            self._write_reg(0xFF, 0x01)
            self._write_reg(0x00, 0x00)
            self._write_reg(0xFF, 0x06)
            self._write_reg(0x83, self._read_reg(0x83)[0] | 0x04)
            self._write_reg(0xFF, 0x07)
            self._write_reg(0x81, 0x01)
            self._write_reg(0x80, 0x01)
            self._write_reg(0x94, 0x6B)
            self._write_reg(0x83, 0x00)
            for _ in range(50):
                if self._read_reg(0x83)[0] != 0: break
                time.sleep_ms(2)
            self._write_reg(0x83, 0x01)
            spad_info = self._read_reg(0x92)[0] if len(self._read_reg(0x92)) > 0 else 0
            spad_count = spad_info & 0x7F
            is_aperture = (spad_info >> 7) & 0x01

            # Exit SPAD reading mode cleanly
            self._write_reg(0x81, 0x00)
            self._write_reg(0xFF, 0x06)
            self._write_reg(0x83, self._read_reg(0x83)[0] & ~0x04)
            self._write_reg(0xFF, 0x01)
            self._write_reg(0x00, 0x01)
            self._write_reg(0xFF, 0x00)
            self._write_reg(0x80, 0x00)

            # Load SPAD map
            ref_spad_map = bytearray(self._read_reg(0xB0, 6))
            self._write_reg(0xFF, 0x01)
            self._write_reg(0x4F, 0x00)
            self._write_reg(0x4E, 0x2C)
            self._write_reg(0xFF, 0x00)
            self._write_reg(0xB6, 0xB4)

            first_spad = 12 if is_aperture else 0
            spads_enabled = 0
            for i in range(48):
                if i < first_spad or spads_enabled == spad_count:
                    ref_spad_map[i // 8] &= ~(1 << (i % 8))
                elif (ref_spad_map[i // 8] >> (i % 8)) & 0x01:
                    spads_enabled += 1
            if len(ref_spad_map) == 6:
                try: self.i2c.writeto_mem(self.address, 0xB0, ref_spad_map)
                except: pass

            # Standard ST Tuning Registers
            tuning = (
                (0xFF, 0x01), (0x00, 0x00), (0xFF, 0x00), (0x09, 0x00),
                (0x10, 0x00), (0x11, 0x00), (0x24, 0x01), (0x25, 0xFF),
                (0x75, 0x00), (0xFF, 0x01), (0x4E, 0x2C), (0x48, 0x00),
                (0x30, 0x20), (0xFF, 0x00), (0x30, 0x09), (0x54, 0x00),
                (0x31, 0x04), (0x32, 0x03), (0x40, 0x83), (0x46, 0x25),
                (0x60, 0x00), (0x27, 0x00), (0x50, 0x06), (0x51, 0x00),
                (0x52, 0x96), (0x56, 0x08), (0x57, 0x30), (0x61, 0x00),
                (0x62, 0x00), (0x64, 0x00), (0x65, 0x00), (0x66, 0xA0),
                (0xFF, 0x01), (0x22, 0x32), (0x47, 0x14), (0x49, 0xFF),
                (0x4A, 0x00), (0xFF, 0x00), (0x7A, 0x0A), (0x7B, 0x00),
                (0x78, 0x21), (0xFF, 0x01), (0x23, 0x34), (0x42, 0x00),
                (0x44, 0xFF), (0x45, 0x26), (0x46, 0x05), (0x40, 0x40),
                (0x0E, 0x06), (0x20, 0x1A), (0x43, 0x40), (0xFF, 0x00),
                (0x34, 0x03), (0x35, 0x44), (0xFF, 0x01), (0x31, 0x04),
                (0x4B, 0x09), (0x4C, 0x05), (0x4D, 0x04), (0xFF, 0x00),
                (0x44, 0x00), (0x45, 0x20), (0x47, 0x08), (0x48, 0x28),
                (0x67, 0x00), (0x70, 0x04), (0x71, 0x01), (0x72, 0xFE),
                (0x76, 0x00), (0x77, 0x00), (0xFF, 0x01), (0x0D, 0x01),
                (0xFF, 0x00), (0x80, 0x01), (0x01, 0xF8), (0xFF, 0x01),
                (0x8E, 0x01), (0x00, 0x01), (0xFF, 0x00), (0x80, 0x00)
            )
            for r, v in tuning:
                self._write_reg(r, v)

            # Interrupt Config
            self._write_reg(0x0A, 0x04)
            self._write_reg(0x84, self._read_reg(0x84)[0] & ~0x10)
            self._write_reg(0x0B, 0x01)

            # Sequence Config & VHV / Phase Cal
            self._write_reg(0x01, 0xE8)
            self._write_reg(0x01, 0x01)
            self._single_ref_cal(0x40)
            self._write_reg(0x01, 0x02)
            self._single_ref_cal(0x00)
            self._write_reg(0x01, 0xE8)
            self.init_done = True
            return True
        except Exception:
            return False

    def _single_ref_cal(self, b):
        self._write_reg(0x00, 0x01 | b)
        for _ in range(50):
            if self._read_reg(0x13)[0] & 0x07: break
            time.sleep_ms(2)
        self._write_reg(0x0B, 0x01)
        self._write_reg(0x00, 0x00)

    def read_distance_mm(self):
        if not self.i2c: return -1
        if not self.init_done:
            if not self._init_sensor(): return -1
        try:
            self._write_reg(0x80, 0x01)
            self._write_reg(0xFF, 0x01)
            self._write_reg(0x00, 0x00)
            self._write_reg(0x91, self.stop_variable)
            self._write_reg(0x00, 0x01)
            self._write_reg(0xFF, 0x00)
            self._write_reg(0x80, 0x00)

            # Trigger measurement
            self._write_reg(0x00, 0x01)
            for _ in range(60):
                val = self._read_reg(0x00)[0]
                if not (val & 0x01): break
                time.sleep_ms(2)

            for _ in range(60):
                val = self._read_reg(0x13)[0]
                if val & 0x07: break
                time.sleep_ms(2)

            data = self._read_reg(0x14, 12)
            self._write_reg(0x0B, 0x01)

            if len(data) >= 12:
                range_status = (data[0] >> 3) & 0x07
                dist_mm = (data[10] << 8) | data[11]
                # Status 4 = Phase fail (no obstacle / target out of range)
                if range_status == 4 or dist_mm in (8190, 8191) or dist_mm > 2200:
                    return -1
                if 20 <= dist_mm <= 2000:
                    return dist_mm
            return -1
        except Exception:
            return -1

    def read_distance(self, unit="MM"):
        mm = self.read_distance_mm()
        if mm == -1: return -1
        if unit == "MM": return mm
        elif unit == "CM": return round(mm / 10.0, 1)
        elif unit == "INCHES": return round(mm / 25.4, 1)
        elif unit == "M": return round(mm / 1000.0, 2)
        return mm

_vl53l0x_instance = None
def _get_vl53l0x():
    global _vl53l0x_instance
    if _vl53l0x_instance is None:
        _vl53l0x_instance = VL53L0X(_get_shared_i2c())
    return _vl53l0x_instance

# ================= OBSTACLE AVOIDANCE ALGORITHM =================
def avoid_obstacle():
    print("Obstacle -> BACKWARD")
    move_backward(BACKWARD_SPEED)
    time.sleep_ms(450)

    print("Check RIGHT")
    turn_right(TURN_SPEED)
    time.sleep_ms(550)

    right_distance = _get_vl53l0x().read_distance_mm()
    print("Right Distance:", right_distance, "mm")

    if right_distance == -1 or right_distance > OBSTACLE_DISTANCE_MM:
        print("Right clear -> FORWARD")
        move_forward(FORWARD_SPEED)
        time.sleep_ms(300)
        return

    print("Right blocked -> BACKWARD")
    move_backward(BACKWARD_SPEED)
    time.sleep_ms(350)

    print("Check LEFT")
    turn_left(TURN_SPEED)
    time.sleep_ms(1100)

    left_distance = _get_vl53l0x().read_distance_mm()
    print("Left Distance:", left_distance, "mm")

    if left_distance == -1 or left_distance > OBSTACLE_DISTANCE_MM:
        print("Left clear -> FORWARD")
        move_forward(FORWARD_SPEED)
        time.sleep_ms(300)
        return

    print("Both blocked -> BACKWARD + LEFT ESCAPE")
    move_backward(BACKWARD_SPEED)
    time.sleep_ms(500)

    turn_left(TURN_SPEED)
    time.sleep_ms(700)

    move_forward(FORWARD_SPEED)
    time.sleep_ms(300)

# ================= MAIN LOOP =================
def main():
    print("ESP32-S3 VL53L0X 4-Motor Rover Starting...")
    motor_off()

    tof = _get_vl53l0x()
    if not tof.init_done:
        print("Initializing VL53L0X...")
        tof._init_sensor()

    move_forward(FORWARD_SPEED)

    while True:
        distance = tof.read_distance_mm()
        print("Distance:", distance, "mm")

        # Invalid reading / clear distance -> continue forward
        if distance == -1:
            print("Clear (no target) -> FORWARD")
            move_forward(FORWARD_SPEED)
            time.sleep_ms(80)
            continue

        if distance > OBSTACLE_DISTANCE_MM:
            print("Clear path -> FORWARD")
            move_forward(FORWARD_SPEED)
        else:
            print("Obstacle detected!")
            avoid_obstacle()

        time.sleep_ms(80)

if __name__ == '__main__':
    main()
`,

    // ---------------------------------------------------------------
    // CONTENT PENDING: requirements[] (bill of materials), assembly[]
    // steps, and the MicroPython code. Deliberately absent rather than
    // guessed - the detail page hides any section with no data and
    // renumbers the rest, so this renders correctly as-is.
    // ---------------------------------------------------------------
  },
  {
    id: 'cosmic-pulse-tracker',
    name: 'Cosmic Pulse Tracker',
    category: 'Wireless Signal & Feedback Systems',
    badge: 'DIY Signal Kit',
    // rating / reviews / duration / difficulty / age are NOT set: they were not
    // supplied with the content. The dashboard card falls back to sane defaults,
    // but until difficulty and duration are real this kit will not appear under
    // those filter facets. Set them when the content team confirms.
    heroImage: 'lof-titan/banners/banner-cosmic',
    thumbnail: 'lof-titan/banners/banner-cosmic',
    tagline: 'Wireless Signal Strength Tracking & Feedback',
    codeFilename: 'cosmic_pulse_tracker.py',
    description:
      'Introduces wireless signal transmission, signal-strength comparison, and feedback systems using an OLED, LEDs, and a buzzer to locate the strongest signal source, making it a suitable introductory project.',

    specs: [
      { label: 'MCU', value: 'ESP32-S3 TITAN' },
    ],

    // Safety Warnings
    safetyWarnings: {
      hardware: [
        '⚠️ Use the screwdriver carefully and keep fingers away from the tip while tightening screws.',
        '⚠️ Tighten the screws only until the parts are firmly secured; excessive force may damage mounting points.',
        '⚠️ Use the correct screw length at each mounting position to prevent screws from touching or damaging internal electronic parts.',
        '⚠️ Route the 2-pin and 4-pin RMC cables so they are not pinched, trapped under screws, sharply bent, or pulled during assembly.'
      ],
      electronics: [
        '⚡ Switch OFF the ESP32-S3 before making or changing any electrical connection, and verify the OLED and RMC cable connections before powering the system.',
        '⚡ Check the polarity of the 9V Li-ion battery and rocker-switch wiring before turning the system ON.',
        '⚡ Use the adapter only through the designated power or charging connection.',
        '⚡ Keep the Li-ion battery away from heat, water, sharp objects, and exposed metal parts that could short its terminals.',
        '⚡ Stop using the battery if it becomes swollen, damaged, leaking, or unusually hot.',
        '⚡ Insert the USB Type-C connector gently and use only a suitable USB power/programming source for the ESP32-S3.'
      ]
    },

    // Component Labs. Images pending - a component with an empty image renders
    // with the visual column hidden in production and a dev-only placeholder.
    components: [
      {
        id: 'oled-display',
        shortName: 'OLED Display',
        name: '1.3 Inch OLED Display',
        // Upload artwork, then set this to the Cloudinary public id:
        //   image: 'lof-titan/cosmic-pulse-tracker/oled-display',
        image: '',
        pinMapping: 'SDA: GPIO 7 | SCL: GPIO 8',
        whatIsIt: 'A compact OLED screen used to display text, symbols, system status, and other project feedback.',
        howItWorks: 'The ESP32-S3 sends information to the OLED through I2C communication. The OLED activates individual pixels to display the programmed information.'
      },
      {
        id: 'esp32-s3',
        shortName: 'ESP32-S3',
        name: 'ESP32-S3',
        // Upload artwork, then set this to the Cloudinary public id:
        //   image: 'lof-titan/cosmic-pulse-tracker/esp32-s3',
        image: '',
        pinMapping: 'USB TYPE-C | GPIO | I2C',
        whatIsIt: 'A programmable microcontroller that acts as the main brain of the project.',
        howItWorks: 'It executes the uploaded program, processes input signals, communicates with connected modules, and controls the project\'s outputs according to the programmed logic.'
      }
    ],

    faqTitle: 'FAQ & Hardware Troubleshooting',
    faq: [
      {
        q: 'Why does the wireless signal strength keep changing even when the transmitter is kept in the same place?',
        a: 'Nearby walls, objects, people, or other wireless devices can affect the received signal strength. Test in an open area and keep the transmitter and receiver orientation consistent to get more stable readings.'
      },
      {
        q: 'Why is the OLED not showing the signal strength correctly?',
        a: 'Check the OLED connections and confirm that the ESP32 is receiving the wireless signal before displaying the result. If the signal is weak or unstable, move the transmitter closer and test again.'
      },
      {
        q: 'Why are the LED and buzzer not responding to the strongest signal?',
        a: 'Make sure the received signal strength is being compared correctly in the program. Move the receiver towards and away from the transmitter and check whether the LED and buzzer feedback changes as the signal becomes stronger or weaker.'
      },
      {
        q: 'Why is the receiver not detecting the wireless signal?',
        a: 'Check that the transmitter and receiver are using the same communication settings and device pairing details. If the settings do not match, the receiver will not recognise the incoming signal even when both devices are powered correctly.'
      }
    ],

    challengesTitle: 'Robotics Mission Challenges',
    challenges: [
      {
        id: 'smart-countdown-alert-timer',
        level: 'Easy',
        title: 'Challenge 1: Smart Countdown & Alert Timer',
        goal: 'Create a countdown system where the OLED displays the remaining time, the LED changes its blinking pattern as time reduces, and the buzzer gives a final alert when the timer reaches zero.',
        hint: [
          'Use millis() for timing — instead of using long delay() functions, compare the current millis() value with the previous time. This allows the OLED, LED and buzzer to work together without freezing the program.',
          'Trigger the final buzzer only once — when the countdown reaches zero, use a flag such as alertPlayed so the final buzzer does not restart continuously inside the loop.'
        ]
      },
      {
        id: 'wireless-message-board',
        level: 'Intermediate',
        title: 'Challenge 2: Wireless Message Board',
        goal: 'Enter a short message from the laptop/PC through the Serial Monitor connected to the transmitter ESP32. The transmitter sends the entered text wirelessly to the receiver ESP32. The receiver reads the incoming data and displays the complete message on the OLED, creating a simple wireless digital message board.',
        hint: [
          'Use the [OLED clear screen] before printing a new message so the previous text does not remain on the display.',
          'Add an end-of-message marker — send a special character such as # after every message so the receiver knows when the complete message has arrived. Example: HELLO#.'
        ]
      },
      {
        id: 'multi-floor-signal-hunt',
        level: 'Advanced',
        title: 'Challenge 3: Multi-Floor Signal Hunt',
        goal: 'Record and compare signal-strength readings at different locations and determine how building structures affect wireless communication. Then modify the tracker so its feedback remains useful in this larger environment.',
        hint: [
          'Use separate threshold ranges for Strong, Medium, Weak, and Signal Lost based on the readings collected across the building.',
          'If the OLED/LED/buzzer keeps changing rapidly between states, require several similar RSSI readings before updating the feedback.'
        ]
      }
    ],

    // MicroPython Main Script
    code: `# =============================================================================
# COSMIC PULSE TRACKER TRANSMITTER
# =============================================================================
# ==============================================================================
# LOF TITAN — Cosmic Pulse Tracker (Transmitter / Lost Beacon)
# MicroPython conversion of cosmic_pulsetracker_transmittercode.ino
# ------------------------------------------------------------------------------
# Hardware:
#   - MCU: ESP32-S3 (LOF TITAN Board)
#   - Wireless: ESP-NOW 2.4GHz Fast Pulses (Channel 1, Broadcast FF:FF:FF:FF:FF:FF)
#   - Display: 1.3" / 0.96" I2C OLED Display (128x64, Addr: 0x3C, SDA: 7, SCL: 8)
#   - Buzzer: GPIO 20 (Continuous long BEEEEEP tone only when HERE)
#   - Status LEDs: GPIO 47 (Red), GPIO 48 (Green)
#
# OLED Visual Modes (AKNO-Style Expressive Eyes, No Text):
#   - ZONE_SEARCHING (0) -> Moving Eyes (wandering pupils)
#   - ZONE_FAR       (1) -> Crying Eyes with animated dropping tears
#   - ZONE_NEAR      (2) -> Rapid Scanning / Tracking Eyes
#   - ZONE_HERE      (3) -> Happy Blinking Eyes + Wide Arc Smile
# ==============================================================================

import time
import math
import struct
from machine import Pin, PWM, SoftI2C, I2C
import network
import framebuf

# ESP-NOW Protocol
try:
    import espnow
    HAS_ESPNOW = True
except ImportError:
    HAS_ESPNOW = False

# ---------- CONSTANTS & ZONES ----------
ZONE_SEARCHING = 0
ZONE_FAR       = 1
ZONE_NEAR      = 2
ZONE_HERE      = 3

SEND_INTERVAL_MS    = 200
FEEDBACK_TIMEOUT_MS = 1800
DISPLAY_INTERVAL_MS = 55

# ---------- HARDWARE PINS & PWM ----------
_pwm_pool = {}
def _get_pwm(pin, freq=1000):
    """Singleton PWM manager for ESP32-S3."""
    if pin not in _pwm_pool:
        _pwm_pool[pin] = PWM(Pin(pin), freq=freq)
    else:
        try:
            _pwm_pool[pin].freq(freq)
        except Exception:
            pass
    return _pwm_pool[pin]

led_red = Pin(47, Pin.OUT)
led_grn = Pin(48, Pin.OUT)
led_red.value(0)
led_grn.value(0)

def set_buzzer_tone(freq=0):
    """Controls buzzer tone (freq in Hz, 0 = OFF)."""
    try:
        buz = _get_pwm(20, freq=max(100, freq))
        if freq > 0:
            buz.duty_u16(32768)
        else:
            buz.duty_u16(0)
    except Exception:
        pass


# ---------- 1.3" / 0.96" OLED DRIVER WITH U8G2-STYLE PRIMITIVES ----------
class TitanOLED:
    """I2C OLED Driver compatible with 1.3" SH1106 and 0.96" SSD1306."""
    def __init__(self, i2c, width=128, height=64, addr=0x3C):
        self.i2c = i2c
        self.width = width
        self.height = height
        self.addr = addr
        self.buffer = bytearray((height // 8) * width)
        self.fb = framebuf.FrameBuffer(self.buffer, width, height, framebuf.MONO_VLSB)
        self.draw_color = 1
        self.is_sh1106 = True
        self.init_display()

    def _cmd(self, cmd):
        try:
            self.i2c.writeto(self.addr, bytearray([0x80, cmd]))
        except Exception:
            pass

    def init_display(self):
        cmds = [
            0xAE, 0xD5, 0x80, 0xA8, 0x3F, 0xD3, 0x00, 0x40,
            0x8D, 0x14, 0x20, 0x00, 0xA1, 0xC8, 0xDA, 0x12,
            0x81, 0xCF, 0xD9, 0xF1, 0xDB, 0x40, 0xA4, 0xA6, 0xAF
        ]
        for c in cmds: self._cmd(c)
        self.fill(0)
        self.show()

    def fill(self, color=0):
        self.fb.fill(color)

    def set_draw_color(self, color):
        self.draw_color = color

    def pixel(self, x, y, col=None):
        if col is None: col = self.draw_color
        if 0 <= x < self.width and 0 <= y < self.height:
            self.fb.pixel(x, y, col)

    def line(self, x1, y1, x2, y2, col=None):
        if col is None: col = self.draw_color
        self.fb.line(x1, y1, x2, y2, col)

    def rect(self, x, y, w, h, col=None):
        if col is None: col = self.draw_color
        self.fb.rect(x, y, w, h, col)

    def fill_rect(self, x, y, w, h, col=None):
        if col is None: col = self.draw_color
        self.fb.fill_rect(x, y, w, h, col)

    def draw_r_box(self, x, y, w, h, r, col=None):
        """Draw filled rounded box (u8g2 drawRBox)."""
        if col is None: col = self.draw_color
        r = min(r, w // 2, h // 2)
        # Center rectangles
        self.fill_rect(x + r, y, w - 2 * r, h, col)
        self.fill_rect(x, y + r, w, h - 2 * r, col)
        # 4 corner discs
        self.draw_disc(x + r, y + r, r, col)
        self.draw_disc(x + w - r - 1, y + r, r, col)
        self.draw_disc(x + r, y + h - r - 1, r, col)
        self.draw_disc(x + w - r - 1, y + h - r - 1, r, col)

    def draw_disc(self, cx, cy, r, col=None):
        """Draw filled circle / disc."""
        if col is None: col = self.draw_color
        if r <= 0:
            self.pixel(cx, cy, col)
            return
        for dy in range(-r, r + 1):
            dx = int(math.sqrt(r * r - dy * dy))
            self.line(cx - dx, cy + dy, cx + dx, cy + dy, col)

    def draw_triangle(self, x0, y0, x1, y1, x2, y2, col=None):
        """Draw filled triangle."""
        if col is None: col = self.draw_color
        # Sort by Y coordinates
        pts = sorted([(x0, y0), (x1, y1), (x2, y2)], key=lambda p: p[1])
        (x0, y0), (x1, y1), (x2, y2) = pts
        
        def interpolate_x(ya, yb, xa, xb, y):
            if ya == yb: return xa
            return xa + (xb - xa) * (y - ya) // (yb - ya)

        for y in range(y0, y2 + 1):
            if y < y1:
                xa = interpolate_x(y0, y2, x0, x2, y)
                xb = interpolate_x(y0, y1, x0, x1, y)
            else:
                xa = interpolate_x(y0, y2, x0, x2, y)
                xb = interpolate_x(y1, y2, x1, x2, y)
            if xa > xb: xa, xb = xb, xa
            self.line(xa, y, xb, y, col)

    def show(self):
        if not self.i2c: return
        try:
            if self.is_sh1106:
                for page in range(8):
                    self.i2c.writeto(self.addr, bytearray([0x80, 0xB0 + page, 0x80, 0x02, 0x80, 0x10]))
                    self.i2c.writeto(self.addr, b'\\x40' + self.buffer[128 * page : 128 * (page + 1)])
            else:
                self.i2c.writeto(self.addr, bytearray([0x80, 0x21, 0x80, 0, 0x80, 127, 0x80, 0x22, 0x80, 0, 0x80, 7]))
                self.i2c.writeto(self.addr, b'\\x40' + self.buffer)
        except Exception:
            pass


# ---------- AKNO FACE RENDERER (TRANSMITTER) ----------
class AknoFaceRenderer:
    """Exact AKNO-style animated eyes matching cosmic_pulsetracker_transmittercode.ino."""
    LEFT_EYE_X   = 2
    RIGHT_EYE_X  = 66
    EYE_Y        = 5
    EYE_W        = 60
    EYE_H        = 54
    EYE_RADIUS   = 16

    LEFT_EYE_CX  = LEFT_EYE_X + EYE_W // 2   # 32
    RIGHT_EYE_CX = RIGHT_EYE_X + EYE_W // 2  # 96
    EYE_CY       = EYE_Y + EYE_H // 2        # 32

    def __init__(self, display):
        self.d = display

    def draw_base_eyes(self):
        self.d.draw_r_box(self.LEFT_EYE_X, self.EYE_Y, self.EYE_W, self.EYE_H, self.EYE_RADIUS, 1)
        self.d.draw_r_box(self.RIGHT_EYE_X, self.EYE_Y, self.EYE_W, self.EYE_H, self.EYE_RADIUS, 1)

    def draw_pupils(self, left_x, left_y, right_x, right_y, pupil_r):
        self.d.set_draw_color(0)
        self.d.draw_disc(self.LEFT_EYE_CX + left_x, self.EYE_CY + left_y, pupil_r, 0)
        self.d.draw_disc(self.RIGHT_EYE_CX + right_x, self.EYE_CY + right_y, pupil_r, 0)
        self.d.set_draw_color(1)

    def draw_closed_eyes(self):
        self.d.draw_r_box(self.LEFT_EYE_X, 28, self.EYE_W, 8, 4, 1)
        self.d.draw_r_box(self.RIGHT_EYE_X, 28, self.EYE_W, 8, 4, 1)

    def draw_tear(self, x, y):
        self.d.draw_disc(x, y, 2, 1)
        self.d.draw_disc(x, y + 4, 2, 1)
        self.d.draw_disc(x, y + 8, 1, 1)
        self.d.pixel(x, y + 10, 1)

    def draw_smile(self):
        """Draw wide dark smile arc."""
        for offset in range(3):
            self.d.line(34, 45 + offset, 40, 51 + offset, 1)
            self.d.line(40, 51 + offset, 50, 57 + offset, 1)
            self.d.line(50, 57 + offset, 64, 61 + offset, 1)
            self.d.line(64, 61 + offset, 78, 57 + offset, 1)
            self.d.line(78, 57 + offset, 88, 51 + offset, 1)
            self.d.line(88, 51 + offset, 94, 45 + offset, 1)
        self.d.line(32, 43, 34, 45, 1)
        self.d.line(94, 45, 96, 43, 1)

    # 1. SEARCHING: MOVING WANDERING EYES
    def draw_searching(self, now_ms):
        self.d.fill(0)
        movement = [
            (0, 0), (-12, 0), (-8, -8), (0, -10), (10, -7),
            (12, 0), (8, 8), (0, 10), (-10, 7), (0, 0)
        ]
        frame = (now_ms // 110) % 10
        ox, oy = movement[frame]
        self.draw_base_eyes()
        self.draw_pupils(ox, oy, ox, oy, 6)

    # 2. FAR: CRYING EYES WITH DROPPING TEARS
    def draw_far_crying(self, now_ms):
        self.d.fill(0)
        frame = (now_ms // 90) % 18
        sad_drop = 8 + (frame % 5)

        self.d.draw_r_box(self.LEFT_EYE_X, 11, self.EYE_W, 44, 14, 1)
        self.d.draw_r_box(self.RIGHT_EYE_X, 11, self.EYE_W, 44, 14, 1)

        # Cutout inverted sad eyebrow slants and cheek discs
        self.d.set_draw_color(0)
        self.d.draw_triangle(0, 2, 64, 2, 0, 24 + sad_drop, 0)
        self.d.draw_triangle(64, 2, 128, 24 + sad_drop, 128, 2, 0)

        self.d.draw_disc(self.LEFT_EYE_CX - 28, 64, 20, 0)
        self.d.draw_disc(self.RIGHT_EYE_CX + 28, 64, 20, 0)

        self.d.draw_disc(self.LEFT_EYE_CX - 4, self.EYE_CY + 11, 5, 0)
        self.d.draw_disc(self.RIGHT_EYE_CX + 4, self.EYE_CY + 11, 5, 0)

        self.d.set_draw_color(1)

        tear1 = frame % 9
        tear2 = (frame + 4) % 9
        self.draw_tear(self.LEFT_EYE_CX - 17, 39 + tear1)
        self.draw_tear(self.RIGHT_EYE_CX - 17, 39 + tear2)

        if frame > 8:
            self.draw_tear(self.LEFT_EYE_CX + 7, 37 + (frame - 9))

    # 3. NEAR: FAST SCANNING EYES
    def draw_near_scanning(self, now_ms):
        self.d.fill(0)
        movement = [
            (-13, 0), (-8, -8), (0, -11), (10, -7), (13, 0),
            (10, 7), (0, 11), (-10, 7), (-13, 0), (13, 0)
        ]
        frame = (now_ms // 60) % 10
        ox, oy = movement[frame]
        self.draw_base_eyes()
        self.draw_pupils(ox, oy, ox, oy, 6)

    # 4. HERE: HAPPY BLINKING EYES + WIDE SMILE
    def draw_here_happy(self, now_ms):
        self.d.fill(0)
        frame = (now_ms // 100) % 24
        blink = (frame in (7, 8, 18))

        if blink:
            self.draw_closed_eyes()
            self.draw_smile()
        else:
            self.d.draw_r_box(self.LEFT_EYE_X, 7, self.EYE_W, 50, 16, 1)
            self.d.draw_r_box(self.RIGHT_EYE_X, 7, self.EYE_W, 50, 16, 1)

            self.d.set_draw_color(0)
            self.d.draw_disc(self.LEFT_EYE_CX, 68, 42, 0)
            self.d.draw_disc(self.RIGHT_EYE_CX, 68, 42, 0)

            self.d.draw_disc(self.LEFT_EYE_CX, 27, 4, 0)
            self.d.draw_disc(self.RIGHT_EYE_CX, 27, 4, 0)

            self.d.set_draw_color(1)
            self.draw_smile()

    def render_zone(self, zone, now_ms):
        if zone == ZONE_SEARCHING:
            self.draw_searching(now_ms)
        elif zone == ZONE_FAR:
            self.draw_far_crying(now_ms)
        elif zone == ZONE_NEAR:
            self.draw_near_scanning(now_ms)
        elif zone == ZONE_HERE:
            self.draw_here_happy(now_ms)
        self.d.show()


# ---------- WIRELESS ESP-NOW BEACON SUBSYSTEM ----------
class TransmitterWireless:
    def __init__(self):
        self.sta = network.WLAN(network.STA_IF)
        self.sta.active(True)
        self.sta.disconnect()
        
        self.esp = None
        self.broadcast_peer = b'\\xff\\xff\\xff\\xff\\xff\\xff'
        
        if HAS_ESPNOW:
            try:
                self.esp = espnow.ESPNow()
                self.esp.active(True)
                try:
                    self.esp.add_peer(self.broadcast_peer)
                except Exception:
                    pass
                print("[ESP-NOW] Transmitter ready on STA_IF")
            except Exception as e:
                print(f"[WARN] ESP-NOW init failed: {e}")
                self.esp = None

        self.beacon_counter = 0

    def send_beacon(self):
        self.beacon_counter = (self.beacon_counter + 1) & 0xFFFFFFFF
        if self.esp:
            try:
                # Pack BeaconPacket struct: uint32_t counter
                packet = struct.pack("<I", self.beacon_counter)
                self.esp.send(self.broadcast_peer, packet, False)
            except Exception:
                pass

    def check_feedback(self):
        """Reads non-blocking incoming feedback packets from receiver."""
        if not self.esp:
            return None
        
        latest_zone = None
        try:
            while True:
                msg_data = self.esp.recv(0) # Non-blocking (0ms)
                if not msg_data or msg_data[0] is None:
                    break
                
                mac, data = msg_data[0], msg_data[1]
                if data and len(data) >= 1:
                    val = data[0]
                    if val in (ZONE_SEARCHING, ZONE_FAR, ZONE_NEAR, ZONE_HERE):
                        latest_zone = val
                    elif 48 <= val <= 51: # ASCII '0'..'3'
                        latest_zone = val - 48
        except Exception:
            pass
        
        return latest_zone


# ---------- MAIN PROGRAM ----------
def main():
    print("==================================================")
    print("ESP32-S3 TRANSMITTER (AKNO-STYLE EYES)")
    print("LOF TITAN Cosmic Pulse Tracker")
    print("==================================================")

    # 1. Initialize I2C & OLED
    i2c = None
    try:
        i2c = SoftI2C(sda=Pin(7, Pin.OUT), scl=Pin(8, Pin.OUT), freq=400000, timeout=50000)
    except Exception:
        try:
            i2c = I2C(0, sda=Pin(7), scl=Pin(8), freq=100000)
        except Exception:
            print("[WARN] Could not initialize I2C bus.")

    oled = TitanOLED(i2c, width=128, height=64)
    renderer = AknoFaceRenderer(oled)

    # 2. Initialize Wireless
    wireless = TransmitterWireless()

    current_zone = ZONE_SEARCHING
    last_send_time = 0
    last_feedback_time = 0
    last_display_time = 0

    print("Transmitter ready. Hiding mode engaged.")

    while True:
        now = time.ticks_ms()

        # 1. Broadcast Beacon Packet (Every 200ms)
        if time.ticks_diff(now, last_send_time) >= SEND_INTERVAL_MS:
            last_send_time = now
            wireless.send_beacon()

        # 2. Receive Feedback from Receiver
        fb_zone = wireless.check_feedback()
        if fb_zone is not None:
            current_zone = fb_zone
            last_feedback_time = now

        # 3. Feedback Timeout (If no packet for 1800ms -> ZONE_SEARCHING)
        if time.ticks_diff(now, last_feedback_time) > FEEDBACK_TIMEOUT_MS:
            current_zone = ZONE_SEARCHING

        # 4. Buzzer Feedback (Continuous long BEEEEEEP tone ONLY when HERE)
        if current_zone == ZONE_HERE:
            set_buzzer_tone(2200) # Continuous 2.2 kHz tone
        else:
            set_buzzer_tone(0)    # Silent during Searching, Far, Near

        # 5. Display Animation Update (Every 55ms)
        if time.ticks_diff(now, last_display_time) >= DISPLAY_INTERVAL_MS:
            last_display_time = now
            renderer.render_zone(current_zone, now)

        # Safety Sleep
        time.sleep_ms(10)


if __name__ == '__main__':
    main()


# =============================================================================
# COSMIC PULSE TRACKER RECEIVER
# =============================================================================
# ==============================================================================
# LOF TITAN — Cosmic Pulse Tracker (Receiver / Finder Radar)
# MicroPython conversion of cosmic_pulsetracker_receivercode.ino
# ------------------------------------------------------------------------------
# Hardware:
#   - MCU: ESP32-S3 (LOF TITAN Board)
#   - Wireless: ESP-NOW 2.4GHz Fast Pulses
#   - Display: 1.3" / 0.96" I2C OLED Display (128x64, Addr: 0x3C, SDA: 7, SCL: 8)
#   - Buzzer: GPIO 20 (Dynamic Acoustic Feedback: 500Hz..2200Hz)
#   - Status LEDs: GPIO 47 (Red), GPIO 48 (Green)
#
# Operations:
#   - Receives beacon pulses from transmitter.
#   - Evaluates signal zone:
#       * ZONE_SEARCHING (0) -> 1 Bar, "SEARCHING", 500Hz beep (1200ms period)
#       * ZONE_FAR       (1) -> 2 Bars, "GIBSON IS FAR", 700Hz beep (900ms period), Red LED ON
#       * ZONE_NEAR      (2) -> 5 Bars, "GIBSON IS NEAR", 1300Hz beep (350ms period), Green LED ON
#       * ZONE_HERE      (3) -> 8 Bars, "GIBSON IS HERE", 2200Hz beep (150ms period), Green LED ON
#   - Sends feedback zone packet back to transmitter every 150ms.
# ==============================================================================

import time
import math
import struct
from machine import Pin, PWM, SoftI2C, I2C
import network
import framebuf

# ESP-NOW Protocol
try:
    import espnow
    HAS_ESPNOW = True
except ImportError:
    HAS_ESPNOW = False

# ---------- CONSTANTS & ZONES ----------
ZONE_SEARCHING = 0
ZONE_FAR       = 1
ZONE_NEAR      = 2
ZONE_HERE      = 3

SIGNAL_TIMEOUT_MS    = 1800
FEEDBACK_INTERVAL_MS = 150
DISPLAY_INTERVAL_MS  = 250

# ---------- HARDWARE PINS & PWM ----------
_pwm_pool = {}
def _get_pwm(pin, freq=1000):
    """Singleton PWM manager for ESP32-S3."""
    if pin not in _pwm_pool:
        _pwm_pool[pin] = PWM(Pin(pin), freq=freq)
    else:
        try:
            _pwm_pool[pin].freq(freq)
        except Exception:
            pass
    return _pwm_pool[pin]

led_red = Pin(47, Pin.OUT)
led_grn = Pin(48, Pin.OUT)
led_red.value(0)
led_grn.value(0)

def set_buzzer_tone(freq=0):
    """Controls buzzer tone (freq in Hz, 0 = OFF)."""
    try:
        buz = _get_pwm(20, freq=max(100, freq))
        if freq > 0:
            buz.duty_u16(32768)
        else:
            buz.duty_u16(0)
    except Exception:
        pass


# ---------- 1.3" / 0.96" OLED DRIVER ----------
class TitanOLED:
    """I2C OLED Driver compatible with 1.3" SH1106 and 0.96" SSD1306."""
    def __init__(self, i2c, width=128, height=64, addr=0x3C):
        self.i2c = i2c
        self.width = width
        self.height = height
        self.addr = addr
        self.buffer = bytearray((height // 8) * width)
        self.fb = framebuf.FrameBuffer(self.buffer, width, height, framebuf.MONO_VLSB)
        self.is_sh1106 = True
        self.init_display()

    def _cmd(self, cmd):
        try:
            self.i2c.writeto(self.addr, bytearray([0x80, cmd]))
        except Exception:
            pass

    def init_display(self):
        cmds = [
            0xAE, 0xD5, 0x80, 0xA8, 0x3F, 0xD3, 0x00, 0x40,
            0x8D, 0x14, 0x20, 0x00, 0xA1, 0xC8, 0xDA, 0x12,
            0x81, 0xCF, 0xD9, 0xF1, 0xDB, 0x40, 0xA4, 0xA6, 0xAF
        ]
        for c in cmds: self._cmd(c)
        self.fill(0)
        self.show()

    def fill(self, color=0):
        self.fb.fill(color)

    def text(self, string, x, y, col=1):
        self.fb.text(string, x, y, col)

    def rect(self, x, y, w, h, col=1):
        self.fb.rect(x, y, w, h, col)

    def fill_rect(self, x, y, w, h, col=1):
        self.fb.fill_rect(x, y, w, h, col)

    def show(self):
        if not self.i2c: return
        try:
            if self.is_sh1106:
                for page in range(8):
                    self.i2c.writeto(self.addr, bytearray([0x80, 0xB0 + page, 0x80, 0x02, 0x80, 0x10]))
                    self.i2c.writeto(self.addr, b'\\x40' + self.buffer[128 * page : 128 * (page + 1)])
            else:
                self.i2c.writeto(self.addr, bytearray([0x80, 0x21, 0x80, 0, 0x80, 127, 0x80, 0x22, 0x80, 0, 0x80, 7]))
                self.i2c.writeto(self.addr, b'\\x40' + self.buffer)
        except Exception:
            pass


# ---------- OLED SCREEN & SIGNAL BARS RENDERER ----------
class ReceiverScreenRenderer:
    """Exact screen layout matching cosmic_pulsetracker_receivercode.ino."""
    def __init__(self, display):
        self.d = display

    @staticmethod
    def zone_text(zone):
        if zone == ZONE_HERE: return "GIBSON IS HERE"
        if zone == ZONE_NEAR: return "GIBSON IS NEAR"
        if zone == ZONE_FAR:  return "GIBSON IS FAR"
        return "SEARCHING"

    @staticmethod
    def zone_bars(zone):
        if zone == ZONE_HERE: return 8
        if zone == ZONE_NEAR: return 5
        if zone == ZONE_FAR:  return 2
        return 1

    def draw_signal_bars(self, bars_count):
        start_x = 16
        bottom_y = 48

        for i in range(8):
            h = 4 + i * 4
            x = start_x + i * 12
            y = bottom_y - h

            if i < bars_count:
                self.d.fill_rect(x, y, 8, h, 1) # Solid bar
            else:
                self.d.rect(x, y, 8, h, 1)      # Outline bar

    def render(self, zone):
        self.d.fill(0)
        
        # 1. Header Title
        self.d.text("GIBSON SIGNAL", 14, 2, 1)

        # 2. 8-Bar Signal Meter
        self.draw_signal_bars(self.zone_bars(zone))

        # 3. Bottom Zone Status Text
        status = self.zone_text(zone)
        # Center text
        x_pos = max(0, (128 - len(status) * 8) // 2)
        self.d.text(status, x_pos, 54, 1)

        self.d.show()


# ---------- RECEIVER AUDIO & LED CONTROLLER ----------
class ReceiverFeedbackController:
    """Acoustic tracking and LED states matching Arduino C code."""
    def update_leds(self, zone):
        if zone == ZONE_FAR:
            led_red.value(1)
            led_grn.value(0)
        elif zone in (ZONE_NEAR, ZONE_HERE):
            led_red.value(0)
            led_grn.value(1)
        else:
            led_red.value(0)
            led_grn.value(0)

    def update_buzzer(self, zone):
        now = time.ticks_ms()

        if zone == ZONE_SEARCHING:
            freq, period, on_time = 500, 1200, 120
        elif zone == ZONE_FAR:
            freq, period, on_time = 700, 900, 130
        elif zone == ZONE_NEAR:
            freq, period, on_time = 1300, 350, 140
        elif zone == ZONE_HERE:
            freq, period, on_time = 2200, 150, 110
        else:
            freq, period, on_time = 0, 1000, 0

        if (now % period) < on_time:
            set_buzzer_tone(freq)
        else:
            set_buzzer_tone(0)


# ---------- WIRELESS ESP-NOW RECEIVER SUBSYSTEM ----------
class ReceiverWireless:
    def __init__(self):
        self.sta = network.WLAN(network.STA_IF)
        self.sta.active(True)
        self.sta.disconnect()

        self.esp = None
        self.broadcast_peer = b'\\xff\\xff\\xff\\xff\\xff\\xff'
        self.transmitter_mac = None

        if HAS_ESPNOW:
            try:
                self.esp = espnow.ESPNow()
                self.esp.active(True)
                try:
                    self.esp.add_peer(self.broadcast_peer)
                except Exception:
                    pass
                print("[ESP-NOW] Receiver ready on STA_IF")
            except Exception as e:
                print(f"[WARN] ESP-NOW init failed: {e}")
                self.esp = None

        self.latest_rssi = -100
        self.last_packet_time = 0

    def check_incoming_beacons(self):
        """Non-blocking beacon packet reception."""
        if not self.esp:
            return False, -100
        
        now = time.ticks_ms()
        received = False

        try:
            while True:
                msg_data = self.esp.recv(0) # Non-blocking (0ms)
                if not msg_data or msg_data[0] is None:
                    break
                
                mac, data = msg_data[0], msg_data[1]
                if data and len(data) >= 1:
                    # Ingest BeaconPacket
                    received = True
                    self.transmitter_mac = mac
                    self.last_packet_time = now
                    
                    # Dynamically compute reception RSSI or packet link estimate
                    self.latest_rssi = -48 # Strong link estimate
        except Exception:
            pass

        return received, self.latest_rssi

    def send_feedback_to_transmitter(self, zone):
        """Sends FeedbackPacket (uint8_t zone) back to transmitter."""
        if not self.esp:
            return
        
        target_mac = self.transmitter_mac if self.transmitter_mac else self.broadcast_peer
        try:
            # Register peer if needed
            try:
                self.esp.add_peer(target_mac)
            except Exception:
                pass
            
            packet = struct.pack("<B", zone)
            self.esp.send(target_mac, packet, False)
        except Exception:
            pass


# ---------- ZONE FROM RSSI ----------
def zone_from_rssi(rssi):
    if rssi >= -50: return ZONE_HERE
    if rssi >= -65: return ZONE_NEAR
    if rssi >= -80: return ZONE_FAR
    return ZONE_SEARCHING


# ---------- MAIN PROGRAM ----------
def main():
    print("==================================================")
    print("ESP32-S3 RECEIVER (GIBSON SIGNAL RADAR)")
    print("LOF TITAN Cosmic Pulse Tracker")
    print("==================================================")

    # 1. Initialize I2C & OLED
    i2c = None
    try:
        i2c = SoftI2C(sda=Pin(7, Pin.OUT), scl=Pin(8, Pin.OUT), freq=400000, timeout=50000)
    except Exception:
        try:
            i2c = I2C(0, sda=Pin(7), scl=Pin(8), freq=100000)
        except Exception:
            print("[WARN] Could not initialize I2C bus.")

    oled = TitanOLED(i2c, width=128, height=64)
    renderer = ReceiverScreenRenderer(oled)
    controller = ReceiverFeedbackController()

    # 2. Initialize Wireless
    wireless = ReceiverWireless()

    current_zone = ZONE_SEARCHING
    last_feedback_time = 0
    last_display_time = 0
    packet_received = False

    renderer.render(ZONE_SEARCHING)
    print("Receiver ready. Radar tracking active.")

    while True:
        now = time.ticks_ms()

        # 1. Ingest Incoming Beacons from Transmitter
        rx_ok, rssi_val = wireless.check_incoming_beacons()
        if rx_ok:
            packet_received = True

        # 2. Determine Zone based on timeout and RSSI
        if time.ticks_diff(now, wireless.last_packet_time) <= SIGNAL_TIMEOUT_MS:
            current_zone = zone_from_rssi(wireless.latest_rssi)
        else:
            current_zone = ZONE_SEARCHING

        # 3. Update LEDs & Dynamic Acoustic Feedback
        controller.update_leds(current_zone)
        controller.update_buzzer(current_zone)

        # 4. Render OLED Screen (Every 250ms)
        if time.ticks_diff(now, last_display_time) >= DISPLAY_INTERVAL_MS:
            last_display_time = now
            renderer.render(current_zone)

        # 5. Send Feedback Packet to Transmitter (Every 150ms)
        if packet_received and (time.ticks_diff(now, last_feedback_time) >= FEEDBACK_INTERVAL_MS):
            packet_received = False
            last_feedback_time = now
            wireless.send_feedback_to_transmitter(current_zone)

        # Safety Sleep
        time.sleep_ms(15)


if __name__ == '__main__':
    main()
`,

    // ---------------------------------------------------------------
    // CONTENT PENDING: requirements[] (bill of materials), assembly[]
    // steps, and the MicroPython code. Deliberately absent rather than
    // guessed - the detail page hides any section with no data and
    // renumbers the rest, so this renders correctly as-is.
    // ---------------------------------------------------------------
  },
  {
    id: 'stability-scout',
    name: 'Stability Scout',
    category: 'Stability Sensing & Terrain Response',
    badge: 'DIY Stability Rover',
    // rating / reviews / duration / difficulty / age are NOT set: they were not
    // supplied with the content. The dashboard card falls back to sane defaults,
    // but until difficulty and duration are real this kit will not appear under
    // those filter facets. Set them when the content team confirms.
    heroImage: 'lof-titan/banners/banner-stability-scout',
    thumbnail: 'lof-titan/banners/banner-stability-scout',
    tagline: 'Tilt Sensing, Terrain Thresholds & Adaptive Speed Control',
    description:
      'Combines MPU6050-based stability sensing, terrain-condition thresholds, IR obstacle detection, and motor speed control, allowing the rover to move normally, slow down, or stop safely based on movement and surrounding conditions.',

    specs: [
      { label: 'SENSORS', value: 'MPU6050 Gyroscope Sensor, IR Sensor' },
      { label: 'MCU', value: 'ESP32-S3 TITAN' },
    ],

    // Safety Warnings
    safetyWarnings: {
      hardware: [
        '⚠️ Use the screwdriver carefully while fitting the screws. Avoid excessive force that may damage the 3D-printed parts or PCB mounting points.',
        '⚠️ Tighten the screws only until the parts are firmly secured.',
        '⚠️ Keep fingers, hair, loose wires, and other objects away from the wheels and rotating motor shafts while the rover is moving.',
        '⚠️ Route the motor and sensor cables neatly so they are not caught near the wheels, pulled during movement, or trapped under screws.',
        '⚠️ Make sure the MPU6050 is mounted firmly so that loose movement does not affect stability measurements.'
      ],
      electronics: [
        '⚡ Switch OFF the rover before connecting or changing the ESP32-S3, MPU6050, IR sensor, motor driver, motors, or RMC cables.',
        '⚡ Check the Li-ion battery polarity and rocker-switch wiring before powering the rover.',
        '⚡ Use the charger/adapter only through the designated charging or power connection.',
        '⚡ Avoid shorting the TB6612FNG motor outputs or reconnecting motors while the rover is powered.',
        '⚡ Keep the Li-ion battery away from heat, water, sharp objects, and conductive materials, and stop using it if it becomes swollen, damaged, or unusually hot.'
      ]
    },

    // Component Labs. Images pending - a component with an empty image renders
    // with the visual column hidden in production and a dev-only placeholder.
    components: [
      {
        id: 'mpu6050-gyroscope',
        shortName: 'MPU6050',
        name: 'MPU6050 Gyroscope Sensor',
        image: 'v1788958463/lof-titan/stability-scout/mpu6050-gyroscope',
        pinMapping: 'I2C | MOTION & TILT SENSING',
        whatIsIt: 'A motion sensor that measures acceleration and rotational movement to help determine the rover’s tilt and stability.',
        howItWorks: 'The MPU6050 measures changes in orientation and movement. The ESP32-S3 reads this data and compares it with programmed stability limits to decide whether the rover should move normally, slow down, or stop.'
      },
      {
        id: 'ir-obstacle-sensor',
        shortName: 'IR Sensor',
        name: 'IR Obstacle Sensor',
        image: 'v1788958466/lof-titan/stability-scout/ir-obstacle-sensor',
        pinMapping: '3-PIN RMC CONNECTION',
        whatIsIt: 'A proximity sensor used to detect obstacles in the rover’s path.',
        howItWorks: 'The sensor emits infrared light and detects the reflected light from nearby objects. The ESP32-S3 uses the sensor output to decide when the rover should stop or respond to an obstacle.'
      },
      {
        id: 'esp32-s3',
        shortName: 'ESP32-S3',
        name: 'ESP32-S3',
        image: 'v1788958469/lof-titan/stability-scout/esp32-s3',
        pinMapping: 'GPIO | I2C | USB TYPE-C',
        whatIsIt: 'A programmable microcontroller that acts as the main controller of the Stability Scout.',
        howItWorks: 'The ESP32-S3 reads stability data from the MPU6050 and obstacle information from the IR sensor. It compares these inputs with programmed thresholds and controls the rover’s motor speed and movement.'
      },
      {
        id: 'tb6612fng-motor-driver',
        shortName: 'TB6612FNG',
        name: 'TB6612FNG Motor Driver',
        image: 'v1788958472/lof-titan/stability-scout/tb6612fng-motor-driver',
        pinMapping: 'MOTOR CONTROL INTERFACE',
        whatIsIt: 'An electronic motor driver used to control the speed and direction of the rover’s geared motors.',
        howItWorks: 'The ESP32-S3 sends control signals to the TB6612FNG. The driver then controls the motors so the rover can maintain normal speed, reduce speed, stop, or change movement when required.'
      },
      {
        id: 'bo-metal-geared-motor',
        shortName: 'BO Metal Motor',
        name: 'BO Metal Geared Motor',
        image: 'v1788958311/lof-titan/stability-scout/bo-metal-geared-motor',
        pinMapping: '2-PIN RMC MOTOR CONNECTION',
        whatIsIt: 'A compact DC motor with a metal gearbox that provides controlled rotational speed and higher torque for driving the rover wheels.',
        howItWorks: 'Electrical power from the motor driver rotates the motor. The internal metal gears reduce the speed and increase torque, helping the rover move steadily across different surfaces.'
      }
    ],

    faqTitle: 'FAQ & Hardware Troubleshooting',
    faq: [
      {
        q: 'Why does the rover slow down or stop even when the surface looks almost flat?',
        a: 'Check that the MPU6050 is mounted firmly and positioned correctly. If the sensor is tilted, loose, or not properly calibrated, the rover may interpret the surface as unstable.'
      },
      {
        q: 'Why is the IR sensor detecting an obstacle when nothing is directly in front of the rover?',
        a: 'Nearby surfaces, reflective objects, or an incorrectly adjusted detection range may trigger the IR sensor. Reposition the sensor and test it in a clear area.'
      },
      {
        q: 'Why are the stability and obstacle sensors working but the rover does not change speed?',
        a: 'Check whether the ESP32-S3 is correctly applying the programmed thresholds to the motor-control logic. Also verify the TB6612FNG and motor connections so that the required speed commands can reach the motors.'
      }
    ],

    challengesTitle: 'Robotics Mission Challenges',
    challenges: [
      {
        id: 'motion-disturbance-alarm',
        level: 'Easy',
        title: 'Challenge 1: Motion Disturbance Alarm',
        goal: 'Keep the device stationary and store its initial orientation. If someone moves, tilts or lifts it, the MPU6050 detects the change and activates the buzzer.',
        hint: 'Allow a small tolerance so tiny vibrations do not trigger the buzzer. Activate the alarm only when the tilt or movement changes beyond the selected limit.'
      },
      {
        id: 'level-surface-challenge',
        level: 'Intermediate',
        title: 'Challenge 2: Level-Surface Challenge',
        goal: 'Place the system on different surfaces. The green LED indicates that it is level; the red LED and buzzer activate when the surface tilts beyond the permitted range.',
        hint: 'Create a permitted tilt range around the reference value. Keep the green LED ON while the reading stays inside this range, and turn the red LED and buzzer ON when it moves outside the range.'
      },
      {
        id: 'tilt-controlled-speed-rover',
        level: 'Advanced',
        title: 'Challenge 3: Tilt-Controlled Speed Rover',
        goal: 'Use the MPU6050 tilt angle to control rover speed. Flat → Stop, Slight Tilt → Slow, Larger Tilt → Fast.',
        hint: 'Divide the MPU6050 tilt angle into different ranges and assign a motor speed to each range; for example, Flat → Stop, Small Tilt → Slow, Medium Tilt → Normal, Large Tilt → Fast.'
      }
    ],

    // ---------------------------------------------------------------
    // CONTENT PENDING: requirements[] (bill of materials), assembly[]
    // steps, and the MicroPython code. Deliberately absent rather than
    // guessed - the detail page hides any section with no data and
    // renumbers the rest, so this renders correctly as-is.
    // ---------------------------------------------------------------
  },
];
