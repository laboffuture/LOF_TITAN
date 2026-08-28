import { useState, useCallback, useRef } from 'react';

const SERVICE_UUID = "4c4f4600-7469-7461-6e00-000000000001";
const CHAR_CONTROL = "4c4f4601-7469-7461-6e00-000000000001";
const CHAR_PROG_DATA = "4c4f4602-7469-7461-6e00-000000000001";
const CHAR_STATUS = "4c4f4603-7469-7461-6e00-000000000001";
const CHAR_CONSOLE = "4c4f4604-7469-7461-6e00-000000000001";
const CHAR_DEV_INFO = "4c4f4605-7469-7461-6e00-000000000001";

export function useBluetooth() {
  const [device, setDevice] = useState(null);
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState("DISCONNECTED");
  const [consoleOutput, setConsoleOutput] = useState("");
  const [deviceInfo, setDeviceInfo] = useState(null);

  const charsRef = useRef({});
  const serverRef = useRef(null);

  const connect = async () => {
    try {
      if (!navigator.bluetooth) {
        throw new Error("Web Bluetooth API not supported in this browser.");
      }

      const btDevice = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: "LOF_TITAN" }],
        optionalServices: [SERVICE_UUID]
      });

      btDevice.addEventListener('gattserverdisconnected', handleDisconnect);

      const server = await btDevice.gatt.connect();
      serverRef.current = server;
      
      const service = await server.getPrimaryService(SERVICE_UUID);
      
      charsRef.current.control = await service.getCharacteristic(CHAR_CONTROL);
      charsRef.current.progData = await service.getCharacteristic(CHAR_PROG_DATA);
      
      const statusChar = await service.getCharacteristic(CHAR_STATUS);
      charsRef.current.status = statusChar;
      await statusChar.startNotifications();
      statusChar.addEventListener('characteristicvaluechanged', handleStatusUpdate);

      const consoleChar = await service.getCharacteristic(CHAR_CONSOLE);
      charsRef.current.console = consoleChar;
      await consoleChar.startNotifications();
      consoleChar.addEventListener('characteristicvaluechanged', handleConsoleOutput);

      const devInfoChar = await service.getCharacteristic(CHAR_DEV_INFO);
      const devInfoRaw = await devInfoChar.readValue();
      const devInfoStr = new TextDecoder().decode(devInfoRaw);
      try {
        setDeviceInfo(JSON.parse(devInfoStr));
      } catch (e) {
        console.error("Failed to parse device info:", e);
      }

      setDevice(btDevice);
      setConnected(true);
      setStatus("CONNECTED_IDLE");

    } catch (error) {
      console.error("Bluetooth connection failed:", error);
      alert("Connection failed: " + error.message);
    }
  };

  const disconnect = () => {
    if (device && device.gatt.connected) {
      device.gatt.disconnect();
    }
  };

  const handleDisconnect = () => {
    setDevice(null);
    setConnected(false);
    setStatus("DISCONNECTED");
    serverRef.current = null;
    charsRef.current = {};
  };

  const handleStatusUpdate = (event) => {
    const raw = new TextDecoder().decode(event.target.value);
    try {
      const data = JSON.parse(raw);
      if (data.status) {
        setStatus(data.status);
      }
    } catch (e) {
      console.error("Failed to parse status:", e);
    }
  };

  const handleConsoleOutput = (event) => {
    const text = new TextDecoder().decode(event.target.value);
    setConsoleOutput(prev => prev + text);
  };

  const sendCommand = async (cmd, extra = {}) => {
    if (!charsRef.current.control) return;
    const payload = JSON.stringify({ cmd, ...extra });
    await charsRef.current.control.writeValue(new TextEncoder().encode(payload));
  };

  const uploadProgram = async (filename, code) => {
    if (!charsRef.current.progData || !charsRef.current.control) return;
    
    setConsoleOutput("");
    const codeBytes = new TextEncoder().encode(code);
    const size = codeBytes.length;
    
    // Simplistic checksum (sum of bytes)
    const checksum = codeBytes.reduce((a, b) => a + b, 0);

    // Send PROGRAM command to prep state machine
    await sendCommand("PROGRAM", { filename, size, checksum });
    
    // Chunk size (max 512 bytes for MTU, but let's use 128 to be safe)
    const CHUNK_SIZE = 128;
    for (let i = 0; i < size; i += CHUNK_SIZE) {
      const chunk = codeBytes.slice(i, i + CHUNK_SIZE);
      const seqNumber = Math.floor(i / CHUNK_SIZE);
      
      // Sequence number is 2 bytes (big endian)
      const buffer = new ArrayBuffer(2 + chunk.length);
      const view = new DataView(buffer);
      view.setUint16(0, seqNumber, false);
      
      const uint8View = new Uint8Array(buffer);
      uint8View.set(chunk, 2);
      
      // Write chunk with no response
      await charsRef.current.progData.writeValueWithoutResponse(buffer);
      
      // Small delay to prevent overwhelming the ESP32 BLE stack
      await new Promise(r => setTimeout(r, 20));
    }
  };

  const clearConsole = () => setConsoleOutput("");

  return {
    connect,
    disconnect,
    connected,
    device,
    status,
    consoleOutput,
    deviceInfo,
    sendCommand,
    uploadProgram,
    clearConsole
  };
}
