

#include <Arduino.h>
#include <WiFi.h>
#include <WebServer.h>

// ================= WIFI DETAILS =================
const char* ssid = "ESP32S3_3UV_ROVER";
const char* password = "12345678";

WebServer server(80);

// ================= MOTOR PINS =================
// Left Motor M1
#define L_IN1 15
#define L_IN2 16

// Right Motor M2
#define R_IN1 13
#define R_IN2 14

// ================= UV SENSOR PINS =================
#define UV_FRONT 1   // S1 / GPIO1
#define UV_LEFT  2   // S2 / GPIO2
#define UV_RIGHT 3   // S3 / GPIO3

// ================= PWM SETTINGS =================
const int PWM_FREQ = 5000;
const int PWM_RES  = 8;      // 0 to 255

// ================= SETTINGS =================
int motorSpeed = 170;
int uvThreshold = 300;
int uvMargin = 80;

bool autoUVMode = true;

String currentAction = "STOP";

int frontUV = 0;
int leftUV = 0;
int rightUV = 0;

// ================= PWM FUNCTIONS =================
void setupPWM() {
  ledcAttach(L_IN1, PWM_FREQ, PWM_RES);
  ledcAttach(L_IN2, PWM_FREQ, PWM_RES);
  ledcAttach(R_IN1, PWM_FREQ, PWM_RES);
  ledcAttach(R_IN2, PWM_FREQ, PWM_RES);
}

void pwmWritePin(int pin, int value) {
  value = constrain(value, 0, 255);
  ledcWrite(pin, value);
}

// ================= MOTOR FUNCTIONS =================
void leftMotorForward(int spd) {
  pwmWritePin(L_IN1, spd);
  pwmWritePin(L_IN2, 0);
}

void leftMotorBackward(int spd) {
  pwmWritePin(L_IN1, 0);
  pwmWritePin(L_IN2, spd);
}

void rightMotorForward(int spd) {
  pwmWritePin(R_IN1, spd);
  pwmWritePin(R_IN2, 0);
}

void rightMotorBackward(int spd) {
  pwmWritePin(R_IN1, 0);
  pwmWritePin(R_IN2, spd);
}

void stopMotors() {
  pwmWritePin(L_IN1, 0);
  pwmWritePin(L_IN2, 0);
  pwmWritePin(R_IN1, 0);
  pwmWritePin(R_IN2, 0);

  currentAction = "STOP";
}

void forward() {
  leftMotorForward(motorSpeed);
  rightMotorForward(motorSpeed);

  currentAction = "FORWARD";
}

void backward() {
  leftMotorBackward(motorSpeed);
  rightMotorBackward(motorSpeed);

  currentAction = "BACKWARD";
}

void leftTurn() {
  leftMotorBackward(motorSpeed);
  rightMotorForward(motorSpeed);

  currentAction = "LEFT";
}

void rightTurn() {
  leftMotorForward(motorSpeed);
  rightMotorBackward(motorSpeed);

  currentAction = "RIGHT";
}

// ================= UV READING =================
int readAverageUV(int pin) {
  long total = 0;

  for (int i = 0; i < 10; i++) {
    total += analogRead(pin);
    delay(2);
  }

  return total / 10;
}

// ================= AUTO UV CONTROL =================
void autoUVControl() {
  frontUV = readAverageUV(UV_FRONT);
  leftUV  = readAverageUV(UV_LEFT);
  rightUV = readAverageUV(UV_RIGHT);

  Serial.print("F=");
  Serial.print(frontUV);

  Serial.print(" | L=");
  Serial.print(leftUV);

  Serial.print(" | R=");
  Serial.print(rightUV);

  Serial.print(" | TH=");
  Serial.print(uvThreshold);

  Serial.print(" | ACT=");

  bool frontDetected = frontUV > uvThreshold;
  bool leftDetected  = leftUV > uvThreshold;
  bool rightDetected = rightUV > uvThreshold;

  // No UV detected -> STOP
  if (!frontDetected && !leftDetected && !rightDetected) {
    stopMotors();
    Serial.println("NO UV -> STOP");
    return;
  }

  // Move toward strongest UV direction
  if (frontUV >= leftUV + uvMargin && frontUV >= rightUV + uvMargin) {
    forward();
    Serial.println("FRONT UV -> FORWARD");
  }
  else if (leftUV > rightUV + uvMargin) {
    leftTurn();
    Serial.println("LEFT UV -> LEFT");
  }
  else if (rightUV > leftUV + uvMargin) {
    rightTurn();
    Serial.println("RIGHT UV -> RIGHT");
  }
  else {
    forward();
    Serial.println("BALANCED UV -> FORWARD");
  }
}

// ================= WEB PAGE =================
String webPage() {
  String page = R"rawliteral(
<!DOCTYPE html>
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
      onpointerleave="sendCmd('stop')">▲</button>

    <div></div>

    <button class="btn"
      onpointerdown="sendCmd('left')"
      onpointerup="sendCmd('stop')"
      onpointerleave="sendCmd('stop')">◀</button>

    <button class="btn stop" onclick="sendCmd('stop')">STOP</button>

    <button class="btn"
      onpointerdown="sendCmd('right')"
      onpointerup="sendCmd('stop')"
      onpointerleave="sendCmd('stop')">▶</button>

    <div></div>

    <button class="btn"
      onpointerdown="sendCmd('backward')"
      onpointerup="sendCmd('stop')"
      onpointerleave="sendCmd('stop')">▼</button>

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
      });
  }

  setInterval(updateStatus, 500);
  updateStatus();
</script>

</body>
</html>
)rawliteral";

  return page;
}

// ================= SERVER HANDLERS =================
void handleRoot() {
  server.send(200, "text/html", webPage());
}

void handleCommand() {
  if (server.hasArg("move")) {
    autoUVMode = false;

    String moveCmd = server.arg("move");

    if (moveCmd == "forward") {
      forward();
    }
    else if (moveCmd == "backward") {
      backward();
    }
    else if (moveCmd == "left") {
      leftTurn();
    }
    else if (moveCmd == "right") {
      rightTurn();
    }
    else if (moveCmd == "stop") {
      stopMotors();
    }

    Serial.print("Manual Command: ");
    Serial.println(moveCmd);
  }

  server.send(200, "text/plain", "OK");
}

void handleMode() {
  if (server.hasArg("value")) {
    String modeValue = server.arg("value");

    if (modeValue == "auto") {
      autoUVMode = true;
      Serial.println("Mode: AUTO UV");
    }
    else if (modeValue == "manual") {
      autoUVMode = false;
      stopMotors();
      Serial.println("Mode: MANUAL");
    }
  }

  server.send(200, "text/plain", "Mode OK");
}

void handleSpeed() {
  if (server.hasArg("value")) {
    motorSpeed = server.arg("value").toInt();
    motorSpeed = constrain(motorSpeed, 0, 255);

    Serial.print("Motor Speed: ");
    Serial.println(motorSpeed);
  }

  server.send(200, "text/plain", "Speed OK");
}

void handleThreshold() {
  if (server.hasArg("value")) {
    uvThreshold = server.arg("value").toInt();
    uvThreshold = constrain(uvThreshold, 0, 4095);

    Serial.print("UV Threshold: ");
    Serial.println(uvThreshold);
  }

  server.send(200, "text/plain", "Threshold OK");
}

void handleStatus() {
  frontUV = readAverageUV(UV_FRONT);
  leftUV  = readAverageUV(UV_LEFT);
  rightUV = readAverageUV(UV_RIGHT);

  String modeName = autoUVMode ? "AUTO UV" : "MANUAL";

  String json = "{";
  json += "\"front\":" + String(frontUV) + ",";
  json += "\"left\":" + String(leftUV) + ",";
  json += "\"right\":" + String(rightUV) + ",";
  json += "\"action\":\"" + currentAction + "\",";
  json += "\"mode\":\"" + modeName + "\"";
  json += "}";

  server.send(200, "application/json", json);
}

// ================= SETUP =================
void setup() {
  Serial.begin(115200);

  pinMode(UV_FRONT, INPUT);
  pinMode(UV_LEFT, INPUT);
  pinMode(UV_RIGHT, INPUT);

  analogReadResolution(12);

  setupPWM();
  stopMotors();

  WiFi.mode(WIFI_AP);
  WiFi.softAP(ssid, password);

  Serial.println();
  Serial.println("ESP32-S3 3 UV Rover Started");
  Serial.print("WiFi Name: ");
  Serial.println(ssid);
  Serial.print("Password: ");
  Serial.println(password);
  Serial.print("Open IP: ");
  Serial.println(WiFi.softAPIP());

  server.on("/", handleRoot);
  server.on("/cmd", handleCommand);
  server.on("/mode", handleMode);
  server.on("/speed", handleSpeed);
  server.on("/threshold", handleThreshold);
  server.on("/status", handleStatus);

  server.begin();

  Serial.println("Web Server Started");
  Serial.println("AUTO UV MODE STARTED");
}

// ================= LOOP =================
unsigned long lastUVCheck = 0;

void loop() {
  server.handleClient();

  if (autoUVMode == true) {
    if (millis() - lastUVCheck >= 120) {
      lastUVCheck = millis();
      autoUVControl();
    }
  }
}