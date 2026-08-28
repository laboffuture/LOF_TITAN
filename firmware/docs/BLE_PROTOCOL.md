# LOF TITAN BLE GATT Protocol Specification

## 1. GATT Service Overview
* **Primary Service UUID**: `4c4f4600-7469-7461-6e00-000000000001`
* **Device Name Format**: `LOF_TITAN_XXXX` (e.g. `LOF_TITAN_A0FE`)

---

## 2. Characteristics

| Characteristic | UUID | Properties | Purpose |
| :--- | :--- | :--- | :--- |
| **CONTROL** | `4c4f4601-7469-7461-6e00-000000000001` | Write, Notify | JSON Command and Response channel |
| **PROGRAM_DATA** | `4c4f4602-7469-7461-6e00-000000000001` | Write, WriteNoResp | Binary / Chunked file upload data |
| **STATUS** | `4c4f4603-7469-7461-6e00-000000000001` | Read, Notify | Board state notifications |
| **CONSOLE** | `4c4f4604-7469-7461-6e00-000000000001` | Notify | Stdout/Stderr stream to Web App |
| **DEVICE_INFO** | `4c4f4605-7469-7461-6e00-000000000001` | Read | Hardware identity and capabilities |

---

## 3. JSON Control Commands

### 3.1 Status Query
**Request**:
```json
{"cmd": "STATUS"}
```
**Response**:
```json
{"status": "CONNECTED_IDLE"}
```

### 3.2 Program Initiation
**Request**:
```json
{
  "cmd": "PROGRAM",
  "filename": "user.py",
  "size": 1248,
  "checksum": "A1B2C3D4"
}
```
**Response**:
```json
{"status": "PROGRAMMING"}
```

### 3.3 Run Program
**Request**:
```json
{"cmd": "RUN"}
```
**Response**:
```json
{"status": "RUNNING"}
```

### 3.4 Stop Execution
**Request**:
```json
{"cmd": "STOP"}
```
**Response**:
```json
{"status": "STOPPED"}
```

### 3.5 Reset Hardware
**Request**:
```json
{"cmd": "RESET"}
```
**Response**:
```json
{"status": "RESETTING"}
```

---

## 4. Program Data Chunk Format (`PROGRAM_DATA`)
Each chunk written to the `PROGRAM_DATA` characteristic follows the format:
```
[Byte 0..1]: 16-bit Big-Endian Chunk Sequence Number (0, 1, 2, ...)
[Byte 2..N]: Payload Bytes (up to 120 bytes per BLE packet)
```
Upon receiving all bytes, the supervisor verifies total size, performs a Python syntax compile validation, and atomically replaces `/program/user.py`.
