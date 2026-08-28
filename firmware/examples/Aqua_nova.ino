

#include <WiFi.h>
#include <WebServer.h>
#include <Wire.h>
#include <U8g2lib.h>

// =====================================================
// ESP32 DIRECT WI-FI ACCESS POINT
// =====================================================
// Connect your phone/laptop directly to this ESP32 Wi-Fi.

const char* AP_SSID = "LOF_TITAN_ROVER";
const char* AP_PASSWORD = "12345678";

// Fixed dashboard IP address
IPAddress local_IP(192, 168, 4, 1);
IPAddress gateway(192, 168, 4, 1);
IPAddress subnet(255, 255, 255, 0);

// =====================================================
// WEB SERVER
// =====================================================

WebServer server(80);

// =====================================================
// OLED
// =====================================================

#define OLED_SDA 7
#define OLED_SCL 8

U8G2_SH1106_128X64_NONAME_F_HW_I2C u8g2(
  U8G2_R0,
  U8X8_PIN_NONE
);

// =====================================================
// SENSOR PINS
// =====================================================

// PIR connected to S1
#define PIR_PIN 2

// Water sensor connected to S4
#define WATER_PIN 4

// -----------------------------------------------------
// WATER SENSOR LOGIC
// -----------------------------------------------------
// If water sensor gives HIGH when wet:
// keep HIGH
//
// If your sensor gives LOW when wet:
// change HIGH to LOW
// -----------------------------------------------------

#define WATER_ACTIVE_STATE HIGH

// =====================================================
// MOTOR PINS
// =====================================================

// -----------------------------------------------------
// M3 - LEFT MOTOR
// -----------------------------------------------------

#define LEFT_MOTOR_1 11
#define LEFT_MOTOR_2 12

// -----------------------------------------------------
// M4 - RIGHT MOTOR
// -----------------------------------------------------

#define RIGHT_MOTOR_1 9
#define RIGHT_MOTOR_2 10

// =====================================================
// SENSOR STATUS
// =====================================================

bool motionDetected = false;
bool waterDetected = false;

bool previousMotionState = false;
bool previousWaterState = false;

// =====================================================
// TIMING
// =====================================================

unsigned long previousSensorMillis = 0;

const unsigned long sensorInterval = 300;

// =====================================================
// MOTOR SPEED
// =====================================================
// PWM range: 0 = stopped, 255 = full speed
// Increase this value if the rover is too slow.
const int MOTOR_SPEED = 100;

// =====================================================
// LEFT MOTOR
// =====================================================

void leftMotorForward() {

  analogWrite(LEFT_MOTOR_1, MOTOR_SPEED);
  analogWrite(LEFT_MOTOR_2, 0);
}

void leftMotorBackward() {

  analogWrite(LEFT_MOTOR_1, 0);
  analogWrite(LEFT_MOTOR_2, MOTOR_SPEED);
}

void leftMotorStop() {

  analogWrite(LEFT_MOTOR_1, 0);
  analogWrite(LEFT_MOTOR_2, 0);
}

// =====================================================
// RIGHT MOTOR
// =====================================================

void rightMotorForward() {

  analogWrite(RIGHT_MOTOR_1, MOTOR_SPEED);
  analogWrite(RIGHT_MOTOR_2, 0);
}

void rightMotorBackward() {

  analogWrite(RIGHT_MOTOR_1, 0);
  analogWrite(RIGHT_MOTOR_2, MOTOR_SPEED);
}

void rightMotorStop() {

  analogWrite(RIGHT_MOTOR_1, 0);
  analogWrite(RIGHT_MOTOR_2, 0);
}

// =====================================================
// ROVER FORWARD
// =====================================================

void motorsForward() {

  leftMotorForward();
  rightMotorForward();

  Serial.println("ROVER -> FORWARD");
}

// =====================================================
// ROVER BACKWARD
// =====================================================

void motorsBackward() {

  leftMotorBackward();
  rightMotorBackward();

  Serial.println("ROVER -> BACKWARD");
}

// =====================================================
// ROVER LEFT
// =====================================================

void motorsLeft() {

  leftMotorBackward();
  rightMotorForward();

  Serial.println("ROVER -> LEFT");
}

// =====================================================
// ROVER RIGHT
// =====================================================

void motorsRight() {

  leftMotorForward();
  rightMotorBackward();

  Serial.println("ROVER -> RIGHT");
}

// =====================================================
// ROVER STOP
// =====================================================

void motorsStop() {

  leftMotorStop();
  rightMotorStop();

  Serial.println("ROVER -> STOP");
}

// =====================================================
// WEB DASHBOARD
// =====================================================

const char MAIN_PAGE[] PROGMEM = R"rawliteral(

<!DOCTYPE html>

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

</html>

)rawliteral";

// =====================================================
// MAIN PAGE
// =====================================================

void handleRoot() {

  server.send_P(
    200,
    "text/html",
    MAIN_PAGE
  );
}

// =====================================================
// SENSOR STATUS
// =====================================================

void handleStatus() {

  String json = "{";

  json += "\"motion\":";

  if (motionDetected) {

    json += "true";
  }

  else {

    json += "false";
  }


  json += ",";


  json += "\"water\":";

  if (waterDetected) {

    json += "true";
  }

  else {

    json += "false";
  }


  json += "}";


  server.send(
    200,
    "application/json",
    json
  );
}

// =====================================================
// WEB MOTOR COMMANDS
// =====================================================

void handleForward() {

  motorsForward();

  server.send(
    200,
    "text/plain",
    "FORWARD"
  );
}


void handleBackward() {

  motorsBackward();

  server.send(
    200,
    "text/plain",
    "BACKWARD"
  );
}


void handleLeft() {

  motorsLeft();

  server.send(
    200,
    "text/plain",
    "LEFT"
  );
}


void handleRight() {

  motorsRight();

  server.send(
    200,
    "text/plain",
    "RIGHT"
  );
}


void handleStop() {

  motorsStop();

  server.send(
    200,
    "text/plain",
    "STOP"
  );
}

// =====================================================
// OLED UPDATE
// =====================================================

void updateOLED() {

  u8g2.clearBuffer();

  u8g2.setFont(
    u8g2_font_ncenB08_tr
  );


  // =================================================
  // BOTH DETECTED
  // =================================================

  if (
    motionDetected &&
    waterDetected
  ) {

    u8g2.drawStr(
      0,
      20,
      "Motion Detected!"
    );

    u8g2.drawStr(
      0,
      45,
      "Water Detected!"
    );
  }


  // =================================================
  // MOTION ONLY
  // =================================================

  else if (
    motionDetected
  ) {

    u8g2.drawStr(
      35,
      18,
      "ALERT!"
    );

    u8g2.drawStr(
      0,
      43,
      "Motion Detected!"
    );
  }


  // =================================================
  // WATER ONLY
  // =================================================

  else if (
    waterDetected
  ) {

    u8g2.drawStr(
      35,
      18,
      "ALERT!"
    );

    u8g2.drawStr(
      0,
      43,
      "Water Detected!"
    );
  }


  // =================================================
  // SAFE
  // =================================================

  else {

    u8g2.drawStr(
      20,
      25,
      "SYSTEM SAFE"
    );

    u8g2.drawStr(
      25,
      48,
      "No Alert"
    );
  }


  u8g2.sendBuffer();
}

// =====================================================
// SENSOR CHECK
// =====================================================

void checkSensors() {

  // ---------------------------------------------------
  // PIR
  // ---------------------------------------------------

  motionDetected =
  (
    digitalRead(PIR_PIN)
    ==
    HIGH
  );


  // ---------------------------------------------------
  // WATER
  // ---------------------------------------------------

  waterDetected =
  (
    digitalRead(WATER_PIN)
    ==
    WATER_ACTIVE_STATE
  );


  // ---------------------------------------------------
  // MOTION SERIAL MESSAGE
  // ---------------------------------------------------

  if (
    motionDetected
    !=
    previousMotionState
  ) {

    if (
      motionDetected
    ) {

      Serial.println(
        "ALERT: MOTION DETECTED"
      );
    }

    else {

      Serial.println(
        "MOTION: CLEAR"
      );
    }


    previousMotionState =
    motionDetected;
  }


  // ---------------------------------------------------
  // WATER SERIAL MESSAGE
  // ---------------------------------------------------

  if (
    waterDetected
    !=
    previousWaterState
  ) {

    if (
      waterDetected
    ) {

      Serial.println(
        "ALERT: WATER DETECTED"
      );
    }

    else {

      Serial.println(
        "WATER: CLEAR"
      );
    }


    previousWaterState =
    waterDetected;
  }


  // ---------------------------------------------------
  // OLED
  // ---------------------------------------------------

  updateOLED();
}

// =====================================================
// ESP32 DIRECT WI-FI ACCESS POINT
// =====================================================

void startAccessPoint() {

  Serial.println();
  Serial.println("Starting ESP32 Wi-Fi Access Point...");

  // Access Point mode only. No external router is required.
  WiFi.mode(WIFI_AP);

  // Use a fixed IP so the dashboard address is always the same.
  if (!WiFi.softAPConfig(local_IP, gateway, subnet)) {
    Serial.println("WARNING: AP IP configuration failed");
  }

  // Start the ESP32's own Wi-Fi network.
  if (!WiFi.softAP(AP_SSID, AP_PASSWORD)) {
    Serial.println("ERROR: ESP32 Access Point failed!");

    u8g2.clearBuffer();
    u8g2.setFont(u8g2_font_6x12_tr);
    u8g2.drawStr(0, 25, "WiFi AP FAILED!");
    u8g2.sendBuffer();

    while (true) {
      delay(1000);
    }
  }

  IPAddress apIP = WiFi.softAPIP();

  Serial.println();
  Serial.println("ESP32 ACCESS POINT READY");
  Serial.print("Wi-Fi Name : ");
  Serial.println(AP_SSID);
  Serial.print("Password   : ");
  Serial.println(AP_PASSWORD);
  Serial.print("Dashboard  : http://");
  Serial.println(apIP);

  // Show direct Wi-Fi details on OLED.
  u8g2.clearBuffer();
  u8g2.setFont(u8g2_font_6x12_tr);
  u8g2.drawStr(25, 12, "ESP32 WiFi");
  u8g2.drawStr(0, 29, "LOF_TITAN_ROVER");
  u8g2.drawStr(0, 45, "Open browser:");

  String ip = apIP.toString();
  u8g2.drawStr(0, 61, ip.c_str());
  u8g2.sendBuffer();

  delay(4000);
}

// =====================================================
// START WEB SERVER
// =====================================================

void startWebServer() {

  // Main dashboard

  server.on(
    "/",
    HTTP_GET,
    handleRoot
  );


  // Sensor data

  server.on(
    "/status",
    HTTP_GET,
    handleStatus
  );


  // Forward

  server.on(
    "/forward",
    HTTP_GET,
    handleForward
  );


  // Backward

  server.on(
    "/backward",
    HTTP_GET,
    handleBackward
  );


  // Left

  server.on(
    "/left",
    HTTP_GET,
    handleLeft
  );


  // Right

  server.on(
    "/right",
    HTTP_GET,
    handleRight
  );


  // Stop

  server.on(
    "/stop",
    HTTP_GET,
    handleStop
  );


  server.begin();


  Serial.println(
    "Web Server Started!"
  );
}

// =====================================================
// SETUP
// =====================================================

void setup() {

  // =================================================
  // SERIAL
  // =================================================

  Serial.begin(
    115200
  );


  delay(500);


  Serial.println();

  Serial.println(
    "=================================="
  );

  Serial.println(
    "      LOF TITAN ALERT ROVER"
  );

  Serial.println(
    "      DIRECT ESP32 WI-FI MODE"
  );

  Serial.println(
    "=================================="
  );


  // =================================================
  // SENSOR SETUP
  // =================================================

  pinMode(
    PIR_PIN,
    INPUT
  );


  pinMode(
    WATER_PIN,
    INPUT
  );


  // =================================================
  // MOTOR SETUP
  // =================================================

  pinMode(
    LEFT_MOTOR_1,
    OUTPUT
  );


  pinMode(
    LEFT_MOTOR_2,
    OUTPUT
  );


  pinMode(
    RIGHT_MOTOR_1,
    OUTPUT
  );


  pinMode(
    RIGHT_MOTOR_2,
    OUTPUT
  );


  // Safety stop

  motorsStop();


  // =================================================
  // OLED SETUP
  // =================================================

  Wire.begin(
    OLED_SDA,
    OLED_SCL
  );


  u8g2.begin();


  u8g2.clearBuffer();


  u8g2.setFont(
    u8g2_font_ncenB08_tr
  );


  u8g2.drawStr(
    15,
    20,
    "LOF TITAN"
  );


  u8g2.drawStr(
    10,
    43,
    "ALERT SYSTEM"
  );


  u8g2.drawStr(
    23,
    62,
    "Starting..."
  );


  u8g2.sendBuffer();


  delay(1500);


  // =================================================
  // WIFI
  // =================================================

  startAccessPoint();


  // =================================================
  // WEB SERVER
  // =================================================

  startWebServer();


  // =================================================
  // INITIAL SENSOR CHECK
  // =================================================

  checkSensors();


  // =================================================
  // READY
  // =================================================

  Serial.println();

  Serial.println(
    "=================================="
  );

  Serial.println(
    "SYSTEM READY"
  );


  Serial.print(
    "CONNECT TO WIFI : "
  );

  Serial.println(
    AP_SSID
  );

  Serial.print(
    "PASSWORD        : "
  );

  Serial.println(
    AP_PASSWORD
  );

  Serial.print(
    "OPEN BROWSER    : http://"
  );

  Serial.println(
    WiFi.softAPIP()
  );


  Serial.println(
    "M3 LEFT MOTOR  : GPIO 11 / GPIO 12"
  );


  Serial.println(
    "M4 RIGHT MOTOR : GPIO 9 / GPIO 10"
  );


  Serial.println(
    "PIR            : GPIO 2"
  );


  Serial.println(
    "WATER SENSOR   : GPIO 4"
  );


  Serial.println(
    "OLED SDA/SCL   : GPIO 7 / GPIO 8"
  );


  Serial.println(
    "=================================="
  );
}

// =====================================================
// LOOP
// =====================================================

void loop() {

  // =================================================
  // WEB SERVER
  // =================================================

  server.handleClient();


  // =================================================
  // SENSOR UPDATE
  // =================================================

  if (
    millis() - previousSensorMillis
    >=
    sensorInterval
  ) {

    previousSensorMillis =
    millis();


    checkSensors();
  }
}