# LOF TITAN Verification & Acceptance Test Suite

This document defines the test procedures to validate all functional criteria specified in the LOF TITAN master specification.

---

## 1. Automated Python Test Suite
Run local unit and regression tests:
```bash
python -m unittest discover -s tests -p "test_*.py"
```

---

## 2. Hardware Test Procedures

### Test 1: Dynamic MAC-Derived Device Naming (Section 35)
1. Flash `dist/LOF_TITAN_firmware.bin` to Board A (e.g. BT MAC `A0:FE:12:34:56:78`).
2. Verify board advertises as `LOF_TITAN_A0FE`.
3. Reflash the board and verify name remains `LOF_TITAN_A0FE`.
4. Flash the identical `LOF_TITAN_firmware.bin` to Board B (e.g. BT MAC `7C:DF:55:66:77:88`).
5. Verify Board B advertises as `LOF_TITAN_7CDF` without rebuilding firmware.

### Test 2: Status LED Transitions (Section 34)
* **Disconnected / Advertising**: Red LED (`GPIO47`) = ON, Green LED (`GPIO48`) = OFF.
* **Connected**: Red LED = OFF, Green LED = ON.
* **Programming**: Green LED blinks during chunk transfer.
* **Disconnect Event**: Green LED immediately turns OFF, Red LED turns ON, advertising resumes.

### Test 3: GPIO20 Buzzer Coexistence (Section 36)
1. Connect via Web App and upload a user program that plays frequencies using `machine.PWM(machine.Pin(20))`.
2. Press **RUN**.
3. Confirm tones are generated without system buzzer conflicts or pin lockouts.

### Test 4: Autonomous 10-Second Countdown & Startup (Section 37)
1. Upload a persistent script to `/program/user.py`.
2. Disconnect BLE and power cycle board.
3. Observe serial console countdown 10..1.
4. When countdown reaches 0 without BLE connection, stored program starts automatically while BLE continues advertising.

### Test 5: Connection While Running (Section 38)
1. While autonomous script is running, open Web App and connect to `LOF_TITAN_XXXX`.
2. Verify:
   - Green LED turns ON, Red LED turns OFF.
   - User program does **not** stop.
   - Status reports `RUNNING`.

### Test 6: Safe VM Interruption via STOP (Section 39)
1. Run a continuous loop (`while True: pass`).
2. Press **STOP** in Web App.
3. Verify:
   - VM halts without resetting ESP32.
   - All motor pins set to 0.
   - BLE remains connected and responsive.

### Test 7: No-Program Condition (Section 40)
1. Delete `/program/user.py` and reboot without BLE connection.
2. After 10s countdown expires, verify error beep plays, Red LED remains ON, and system stays discoverable over BLE.

### Test 8: Failed Upload Recovery & Atomic Preservation (Section 41)
1. Upload known-good code.
2. Start new upload and terminate connection midway.
3. Reconnect and press **RUN**. Verify original program is still intact and executes properly.

### Test 9: Syntax Error Rejection (Section 42)
1. Attempt to upload Python script with invalid syntax (e.g. `while True\n print("err")`).
2. Verify Web App displays syntax error and previous valid program is retained.
