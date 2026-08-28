import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Sparkles, 
  Send, 
  Code, 
  Play, 
  Square, 
  RotateCcw, 
  Upload, 
  Terminal, 
  Trash2, 
  Copy, 
  Check, 
  X, 
  Save, 
  FolderOpen, 
  Settings, 
  Cpu, 
  ChevronRight, 
  CornerDownLeft,
  FileCode,
  Zap,
  Lightbulb,
  Key,
  Flame,
  ArrowRight
} from 'lucide-react';

const DEFAULT_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

// Only Latest 3.5 and 3.6 Models
const GEMINI_MODELS = [
  { id: "gemini-3.6-flash", name: "Gemini 3.6 Flash Live", desc: "Latest real-time low-latency robotics model (Recommended)" },
  { id: "gemini-3.5-flash-lite", name: "Gemini 3.5 Flash Lite", desc: "Ultra lightweight and lightning fast response model" },
  { id: "gemini-3.6-pro", name: "Gemini 3.6 Pro", desc: "Deep reasoning step-by-step autonomous robotics logic" }
];

const TITAN_SYSTEM_PROMPT = `You are the Official AI Robotics Engineer and MicroPython Code Generator for LOF TITAN (ESP32-S3 Rover).

YOUR MISSION:
Generate clean, production-ready, fully commented MicroPython code for LOF TITAN that can be directly compiled, uploaded, and run on the physical rover without modifications.

OFFICIAL HARDWARE PINOUT & SPECIFICATIONS:
- Microcontroller: ESP32-S3 running MicroPython
- 4 Hardware Motor Channels (controls 6 physical motor terminals):
  * Motor M1: Forward (Pin 15 PWM, Pin 16 = 0), Backward (Pin 15 = 0, Pin 16 PWM)
  * Motor M2: Forward (Pin 13 PWM, Pin 14 = 0), Backward (Pin 13 = 0, Pin 14 PWM)
  * Motor M3 & M6 (Parallel Shared): Forward (Pin 11 PWM, Pin 12 = 0), Backward (Pin 11 = 0, Pin 12 PWM)
  * Motor M4 & M5 (Parallel Shared): Forward (Pin 9 PWM, Pin 10 = 0), Backward (Pin 9 = 0, Pin 10 PWM)
- Push Buttons (4 Onboard Buttons):
  * Button 1: GPIO 39 | Button 2: GPIO 40 | Button 3: GPIO 41 | Button 4: GPIO 42
  * Active LOW: Pin(pin, Pin.IN, Pin.PULL_UP).value() == 0 (when pressed)
- Analog Sensor Ports (S1 - S5):
  * S1: GPIO 2 | S2: GPIO 1 | S3: GPIO 3 | S4: GPIO 4 | S5: GPIO 5
  * Read analog 12-bit (0-4095): ADC(Pin(pin), atten=ADC.ATTN_11DB).read()
  * Read digital: Pin(pin, Pin.IN).value()
- Ultrasonic Sensor Port:
  * Trigger: GPIO 6 | Echo: GPIO 19
  * Measure distance: hw.read_ultrasonic_distance(6, 19, "cm")
- Status Indicator LEDs:
  * Red LED: GPIO 47 | Green LED: GPIO 48 (Active HIGH: Pin(47, Pin.OUT).value(1))
- Onboard Buzzer:
  * Pin: GPIO 20 | Tones via supervisor: from supervisor.led_buzzer import hw (hw.play_startup_tone(), hw.play_run_tone(), hw.play_confirmation_tone(), hw.play_stop_tone(), hw.play_error_tone())
  * Custom frequency: _get_pwm(20, freq).duty(512); time.sleep_ms(ms); _get_pwm(20).duty(0)
- I2C Display (1.3" SH1106 / 0.96" SSD1306):
  * SDA: GPIO 7 | SCL: GPIO 8
  * Zero-dependency OLED driver (DO NOT import external ssd1306 library, use built-in framebuf class below):
\`\`\`python
import framebuf
from machine import Pin, SoftI2C, I2C

class _TitanOLED(framebuf.FrameBuffer):
    def __init__(self, is_sh1106=True):
        self.is_sh1106 = is_sh1106
        self.addr = 0x3C
        self.buf = bytearray(1024)
        super().__init__(self.buf, 128, 64, framebuf.MONO_VLSB)
        try:
            self.i2c = SoftI2C(sda=Pin(7, Pin.OUT), scl=Pin(8, Pin.OUT), freq=400000, timeout=50000)
            devs = self.i2c.scan()
            if devs: self.addr = devs[0]
            else:
                self.i2c = I2C(0, sda=Pin(7), scl=Pin(8), freq=100000)
                devs = self.i2c.scan()
                if devs: self.addr = devs[0]
        except Exception:
            try: self.i2c = SoftI2C(sda=Pin(7), scl=Pin(8), freq=100000)
            except Exception: self.i2c = None
        for c in (0xAE,0x20,0x00,0x40,0xA1,0xC8,0x81,0xCF,0xA6,0xA8,0x3F,0xD3,0x00,0xD5,0x80,0xD9,0xF1,0xDA,0x12,0xDB,0x40,0x8D,0x14,0xAF):
            try: self.i2c.writeto(self.addr, bytearray([0x80, c]))
            except Exception: pass
        self.fill(0)
        self.show()
    def print_text(self, s, x, y, size=1, col=1):
        s = str(s)
        if size <= 1:
            super().text(s, x, y, col)
        else:
            _w = len(s) * 8
            _tmp = bytearray((_w * 8 + 7) // 8)
            _tb = framebuf.FrameBuffer(_tmp, _w, 8, framebuf.MONO_VLSB)
            _tb.fill(0)
            _tb.text(s, 0, 0, 1)
            for px in range(_w):
                for py in range(8):
                    if _tb.pixel(px, py):
                        for dx in range(size):
                            for dy in range(size):
                                if 0 <= x + px * size + dx < 128 and 0 <= y + py * size + dy < 64:
                                    self.pixel(x + px * size + dx, y + py * size + dy, col)
    def show(self):
        if not self.i2c: return
        try:
            if self.is_sh1106:
                for p in range(8):
                    self.i2c.writeto(self.addr, bytearray([0x80, 0xB0 + p, 0x80, 0x02, 0x80, 0x10]))
                    self.i2c.writeto(self.addr, b'\\x40' + self.buf[128*p:128*(p+1)])
            else:
                self.i2c.writeto(self.addr, bytearray([0x80, 0x21, 0x80, 0, 0x80, 127, 0x80, 0x22, 0x80, 0, 0x80, 7]))
                self.i2c.writeto(self.addr, b'\\x40' + self.buf)
        except Exception: pass

oled = _TitanOLED()
\`\`\`
- Heart Rate & Pulse Sensor (MAX30100 / MAX30102 / MAX30105):
  * SDA: GPIO 7 | SCL: GPIO 8 | I2C Address: 0x57
  * Dual-generation auto-setup with SparkFun AC beat detection algorithm (DC removal filter, finger debounce hysteresis ON >= 10000 / OFF <= 4000, 4-beat rolling average BPM):
\`\`\`python
class _SparkFunHeartRate:
    def __init__(self):
        self.ir_ac_max = 20; self.ir_ac_min = -20; self.ir_ac_signal_current = 0; self.ir_ac_signal_previous = 0
        self.ir_ac_signal_min = 0; self.ir_ac_signal_max = 0; self.ir_avg_reg = 0; self.positive_edge = 0; self.negative_edge = 0
    def check_for_beat(self, sample):
        beat = False
        self.ir_ac_signal_previous = self.ir_ac_signal_current
        self.ir_avg_reg = int((self.ir_avg_reg * 15 + sample) / 16)
        self.ir_ac_signal_current = sample - self.ir_avg_reg
        if self.ir_ac_signal_previous < 0 and self.ir_ac_signal_current >= 0:
            self.ir_ac_max = self.ir_ac_signal_max; self.ir_ac_min = self.ir_ac_signal_min
            self.positive_edge = 1; self.negative_edge = 0; self.ir_ac_signal_max = 0
            if 20 < (self.ir_ac_max - self.ir_ac_min) < 1000: beat = True
        if self.ir_ac_signal_previous > 0 and self.ir_ac_signal_current <= 0:
            self.positive_edge = 0; self.negative_edge = 1; self.ir_ac_signal_min = 0
        if self.positive_edge and self.ir_ac_signal_current > self.ir_ac_signal_max: self.ir_ac_signal_max = self.ir_ac_signal_current
        if self.negative_edge and self.ir_ac_signal_current < self.ir_ac_signal_min: self.ir_ac_signal_min = self.ir_ac_signal_current
        return beat

class _TitanPulse:
    def __init__(self, addr=0x57):
        self.addr = addr; self.i2c = SoftI2C(sda=Pin(7, Pin.OUT), scl=Pin(8, Pin.OUT), freq=400000, timeout=1000)
        self.chip_type = "MAX30102"; self.detector = _SparkFunHeartRate()
        self.finger_detected = False; self.finger_detected_at = 0; self.last_beat_anchor = 0
        self.current_bpm = 0.0; self.average_bpm = 0; self.bpm_history = [0, 0, 0, 0]; self.bpm_index = 0; self.bpm_count = 0
        self.latest_ir = 0; self.latest_red = 0
        self.init_sensor()
    def _w(self, reg, val): self.i2c.writeto_mem(self.addr, reg, bytearray([val]))
    def _r(self, reg, n=1): return self.i2c.readfrom_mem(self.addr, reg, n)
    def init_sensor(self):
        part_id = 0
        try: part_id = self._r(0xFF, 1)[0]
        except Exception: pass
        if part_id in (0x15, 0x25):
            self.chip_type = "MAX30102"
            try:
                self._w(0x09, 0x40); time.sleep_ms(100); self._w(0x08, 0x30); self._w(0x09, 0x03)
                self._w(0x0A, 0x27); self._w(0x0C, 0x1F); self._w(0x0D, 0x3C)
                self._w(0x04, 0); self._w(0x05, 0); self._w(0x06, 0)
            except Exception: pass
        else:
            self.chip_type = "MAX30100"
            try:
                self._w(0x06, 0x40); time.sleep_ms(100); self._w(0x07, 0x03); self._w(0x09, 0x33); self._w(0x06, 0x03)
            except Exception: pass
    def update(self):
        now = time.ticks_ms()
        ir = 0; red = 0
        try:
            if self.chip_type == "MAX30102":
                raw = self._r(0x07, 6); ir = (raw[3] << 16 | raw[4] << 8 | raw[5]) & 0x03FFFF; red = (raw[0] << 16 | raw[1] << 8 | raw[2]) & 0x03FFFF
                if ir == 0: ir = (raw[2] << 8) | raw[3]
            else:
                raw = self._r(0x05, 4); ir = (raw[0] << 8) | raw[1]; red = (raw[2] << 8) | raw[3]
        except Exception: pass
        self.latest_ir = ir; self.latest_red = red
        if not self.finger_detected:
            if ir >= 10000:
                self.finger_detected = True; self.finger_detected_at = now; self.last_beat_anchor = 0; self.current_bpm = 0.0; self.average_bpm = 0
                self.bpm_history = [0, 0, 0, 0]; self.bpm_count = 0
        else:
            if ir <= 4000:
                self.finger_detected = False; self.last_beat_anchor = 0; self.current_bpm = 0.0; self.average_bpm = 0
        if self.finger_detected and self.detector.check_for_beat(ir):
            if time.ticks_diff(now, self.finger_detected_at) >= 1200:
                if self.last_beat_anchor == 0: self.last_beat_anchor = now
                else:
                    interval = time.ticks_diff(now, self.last_beat_anchor)
                    if 400 <= interval <= 1333:
                        self.last_beat_anchor = now; self.current_bpm = 60000.0 / interval
                        self.bpm_history[self.bpm_index] = int(self.current_bpm + 0.5)
                        self.bpm_index = (self.bpm_index + 1) % 4
                        if self.bpm_count < 4: self.bpm_count += 1
                        self.average_bpm = int(sum(self.bpm_history[:self.bpm_count]) / self.bpm_count)
                    elif interval > 1333: self.last_beat_anchor = now

pulse = _TitanPulse()
\`\`\`
- UART Port:
  * TX: GPIO 17 | RX: GPIO 18 (UART(1, baudrate=115200, tx=17, rx=18))

CRITICAL CODE STRUCTURE REQUIREMENTS:
1. Every script MUST start with standard imports and the PWM timer pool manager to prevent "out of PWM timers" errors:
\`\`\`python
# ================= LOF TITAN MAIN =================
import time
from machine import Pin, PWM, ADC, I2C, SoftI2C, UART
from supervisor.led_buzzer import hw

_pwm_pool = {}
def _get_pwm(pin, freq=1000):
    if pin not in _pwm_pool:
        _pwm_pool[pin] = PWM(Pin(pin), freq=freq)
    else:
        try: _pwm_pool[pin].freq(freq)
        except Exception: pass
    return _pwm_pool[pin]

def main():
    # Setup & Logic
    while True:
        # Loop body
        time.sleep_ms(5)  # Auto CPU safety yield to prevent lockup

if __name__ == '__main__':
    main()
\`\`\`
2. Every loop MUST include time.sleep_ms(5) to prevent FreeRTOS watchdog starvation and keep BLE responsive.
3. Always wrap your code inside a \`\`\`python ... \`\`\` markdown code block so the IDE can parse and load it into the live editor.`;

const PROMPT_SUGGESTIONS = [
  { label: "Heart Rate Monitor (MAX30100)", prompt: "Write a complete heart rate and pulse oximeter monitor program using the MAX30100/MAX30102 sensor on I2C (SDA 7, SCL 8) with live finger detection, raw IR telemetry, and smoothed BPM displayed on the OLED screen." },
  { label: "Obstacle Avoidance (Ultrasonic)", prompt: "Write an autonomous obstacle avoidance program using the Ultrasonic sensor on Trig 6 and Echo 19 with dual motors M1 (left) and M2 (right). Turn when distance < 20cm." },
  { label: "5-Sensor Line Follower", prompt: "Write a high-speed line following robot program using analog sensors S1 (GPIO 2), S2 (GPIO 1), and S3 (GPIO 3) with proportional differential motor steering on M1 and M2." },
  { label: "OLED Live Dashboard", prompt: "Write an OLED display dashboard program that initializes the 1.3 inch display on SDA 7 and SCL 8, showing live readings for S1-S5 and Ultrasonic distance with 2x font size." },
  { label: "Push Button Rover Driver", prompt: "Write a program using Button 1 (GPIO 39) for Forward, Button 2 (GPIO 40) for Backward, Button 3 (GPIO 41) for Left, and Button 4 (GPIO 42) for Stop, driving motors M1 and M2." },
  { label: "Buzzer Musical Show", prompt: "Write a fun sound and light show program using the onboard Buzzer on GPIO 20 playing musical notes and alternating Red LED (GPIO 47) and Green LED (GPIO 48)." }
];

export function AIAssistantIDE({ isOpen, onClose, device, onUploadCode }) {
  const [apiKey, setApiKey] = useState(() => {
    const saved = localStorage.getItem("titan_gemini_api_key");
    // If the saved key is not the new verified key, automatically update to it
    if (!saved || saved !== DEFAULT_API_KEY) {
      localStorage.setItem("titan_gemini_api_key", DEFAULT_API_KEY);
      return DEFAULT_API_KEY;
    }
    return saved;
  });
  const [selectedModel, setSelectedModel] = useState(() => {
    const saved = localStorage.getItem("titan_gemini_model");
    // Always default to gemini-3.6-flash (confirmed working)
    if (!saved || saved.includes("2.") || saved.includes("1.") || saved === "gemini-3.5-flash-lite") {
      localStorage.setItem("titan_gemini_model", "gemini-3.6-flash");
      return "gemini-3.6-flash";
    }
    return saved;
  });

  const [showSettings, setShowSettings] = useState(false);
  const [customKeyInput, setCustomKeyInput] = useState(apiKey);
  const [showPythonDrawer, setShowPythonDrawer] = useState(false);
  const [showSerialMonitor, setShowSerialMonitor] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "👋 **Welcome to LOF TITAN AI Code Studio!**\n\nI have complete knowledge of your LOF TITAN ESP32-S3 pin mappings, 4-channel motor drivers, push buttons (39-42), sensors (S1-S5), ultrasonic, OLED, and buzzer.\n\nTell me what you'd like your TITAN rover to do, or pick a starter template below!"
    }
  ]);

  const [inputPrompt, setInputPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editorCode, setEditorCode] = useState(`# ================= LOF TITAN MAIN =================
import time
from machine import Pin, PWM, ADC, I2C, SoftI2C, UART
from supervisor.led_buzzer import hw

_pwm_pool = {}
def _get_pwm(pin, freq=1000):
    if pin not in _pwm_pool:
        _pwm_pool[pin] = PWM(Pin(pin), freq=freq)
    else:
        try: _pwm_pool[pin].freq(freq)
        except Exception: pass
    return _pwm_pool[pin]

def main():
    hw.play_startup_tone()
    print("LOF TITAN AI Program Ready!")
    while True:
        # Toggle Red and Green status LEDs
        Pin(47, Pin.OUT).value(1); Pin(48, Pin.OUT).value(0)
        time.sleep_ms(500)
        Pin(47, Pin.OUT).value(0); Pin(48, Pin.OUT).value(1)
        time.sleep_ms(500)

if __name__ == '__main__':
    main()
`);

  const [serialInput, setSerialInput] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  const chatBottomRef = useRef(null);
  const consoleBottomRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Auto-scroll serial console
  useEffect(() => {
    if (autoScroll && consoleBottomRef.current) {
      consoleBottomRef.current.scrollTop = consoleBottomRef.current.scrollHeight;
    }
  }, [device?.consoleOutput, autoScroll, showSerialMonitor]);

  // Extract python code from markdown (handles closed, unclosed, and raw code)
  const extractPythonCode = (text) => {
    if (!text) return null;
    // 1. Try matching closed code block ```python ... ```
    const matchClosed = text.match(/```(?:python|py)?\s*([\s\S]*?)\s*```/i);
    if (matchClosed && matchClosed[1]?.trim()) {
      return matchClosed[1].trim();
    }
    // 2. Try matching unclosed code block ```python ...
    const matchUnclosed = text.match(/```(?:python|py)?\s*([\s\S]*)/i);
    if (matchUnclosed && matchUnclosed[1]?.trim()) {
      return matchUnclosed[1].trim();
    }
    // 3. Fallback: If text itself is a raw python script
    if ((text.includes("import ") || text.includes("def main()")) && (text.includes("Pin") || text.includes("machine") || text.includes("hw."))) {
      return text.trim();
    }
    return null;
  };

  // Call Gemini API
  const handleSendMessage = async (promptToSend) => {
    const userQuery = promptToSend || inputPrompt;
    if (!userQuery.trim() || isLoading) return;

    const newMessages = [...messages, { role: "user", text: userQuery }];
    setMessages(newMessages);
    setInputPrompt("");
    setIsLoading(true);

    try {
      // Build conversation history for Gemini
      const contents = [
        {
          role: "user",
          parts: [{ text: TITAN_SYSTEM_PROMPT }]
        },
        {
          role: "model",
          parts: [{ text: "Understood! I am the Official LOF TITAN AI Assistant with complete knowledge of all ESP32-S3 hardware pins, 4-channel motor drivers, OLED, buttons (39-42), sensors (S1-S5), and safe non-blocking PWM loops. I will generate clean, ready-to-run MicroPython code." }]
        }
      ];

      // Append recent messages
      newMessages.forEach((msg) => {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.text }]
        });
      });

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents: contents,
          generationConfig: {
            temperature: 0.2,
            topP: 0.95,
            maxOutputTokens: 8192
          }
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No code generated.";

      setMessages([...newMessages, { role: "assistant", text: replyText }]);

      // Auto-extract code into live editor if valid python block found and open drawer
      const extracted = extractPythonCode(replyText);
      if (extracted) {
        setEditorCode(extracted);
        setShowPythonDrawer(true);
      }
    } catch (err) {
      console.error("Gemini AI error:", err);
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          text: `⚠️ **AI Generation Error:** ${err.message}\n\nPlease verify your Gemini API key in **Settings** (⚙️) or switch model.`
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = () => {
    const key = customKeyInput.trim() || DEFAULT_API_KEY;
    setApiKey(key);
    localStorage.setItem("titan_gemini_api_key", key);
    localStorage.setItem("titan_gemini_model", selectedModel);
    setShowSettings(false);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(editorCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveFile = () => {
    const blob = new Blob([editorCode], { type: "text/x-python" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `titan_ai_code_${Date.now()}.py`;
    link.click();
    URL.revokeObjectURL(url);
    setSaveStatus("Saved .py!");
    setTimeout(() => setSaveStatus(null), 2500);
  };

  const handleLoadFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setEditorCode(event.target.result);
      setShowPythonDrawer(true);
      setSaveStatus("Loaded!");
      setTimeout(() => setSaveStatus(null), 2500);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleUploadToTitan = () => {
    if (onUploadCode) {
      onUploadCode(editorCode);
    }
  };

  const handleSendSerial = (e) => {
    e.preventDefault();
    if (!serialInput.trim() || !device) return;
    device.writeToSerial(serialInput + '\r\n');
    setSerialInput('');
  };

  // Helper to safely render markdown text and nicely contained code blocks
  const renderFormattedMessage = (text) => {
    if (!text) return null;

    const parts = [];
    // Matches ```python ... ``` or unclosed ```python ...
    const blockRegex = /```(?:python|py)?\s*([\s\S]*?)(?:```|$)/gi;
    let lastIndex = 0;
    let match;

    if (text.includes('```')) {
      while ((match = blockRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
          const preText = text.substring(lastIndex, match.index).trim();
          if (preText) parts.push({ type: 'text', content: preText });
        }
        const codeContent = match[1].trim();
        if (codeContent) {
          parts.push({ type: 'code', content: codeContent });
        }
        lastIndex = blockRegex.lastIndex;
        if (match.index + match[0].length >= text.length) break;
      }
      if (lastIndex < text.length) {
        const postText = text.substring(lastIndex).trim();
        if (postText) parts.push({ type: 'text', content: postText });
      }
    } else if (text.includes("import ") && (text.includes("Pin") || text.includes("PWM") || text.includes("time.sleep"))) {
      parts.push({ type: 'code', content: text.trim() });
    } else {
      parts.push({ type: 'text', content: text });
    }

    return (
      <div className="space-y-3 break-words overflow-hidden">
        {parts.map((p, idx) => {
          if (p.type === 'text') {
            return (
              <div key={idx} className="whitespace-pre-wrap break-words leading-relaxed text-slate-800 font-sans">
                {p.content}
              </div>
            );
          } else {
            return (
              <div key={idx} className="my-2.5 rounded-2xl bg-[#0B0F19] border border-slate-700/80 shadow-lg overflow-hidden">
                {/* Code Block Top Header with Quick Action Buttons */}
                <div className="px-3.5 py-2 bg-[#0F172A] border-b border-slate-800 flex items-center justify-between gap-2 flex-wrap text-xs">
                  <span className="font-mono text-cyan-400 font-bold flex items-center gap-1.5">
                    <FileCode size={14} className="text-cyan-400" />
                    <span>MicroPython Code (LOF TITAN)</span>
                  </span>
                  
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => {
                        setEditorCode(p.content);
                        setShowPythonDrawer(true);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 text-[11px] font-semibold transition-all cursor-pointer shadow-xs"
                      title="Open and edit in Python drawer"
                    >
                      <Code size={12} />
                      <span>Edit in Drawer</span>
                    </button>

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(p.content);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition-all cursor-pointer"
                      title="Copy code to clipboard"
                    >
                      <Copy size={12} />
                      <span>Copy</span>
                    </button>

                    <button
                      onClick={() => {
                        setEditorCode(p.content);
                        setShowSerialMonitor(true);
                        if (onUploadCode) onUploadCode(p.content);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-[11px] font-bold shadow-md transition-all active:scale-95 cursor-pointer"
                      title="Upload and run directly on LOF TITAN board"
                    >
                      <Upload size={12} />
                      <span>Run on TITAN</span>
                    </button>
                  </div>
                </div>

                {/* Code Body with High-Contrast Syntax Style */}
                <div className="p-4 overflow-x-auto font-mono text-xs sm:text-sm text-sky-200 leading-relaxed scrollbar-thin scrollbar-thumb-slate-700 max-h-[420px]">
                  <pre className="whitespace-pre">{p.content}</pre>
                </div>
              </div>
            );
          }
        })}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-2 sm:p-4 backdrop-blur-md bg-slate-900/65 transition-all duration-300">
      
      {/* Hidden File Input for Opening Saved Python Files */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleLoadFile} 
        accept=".py,.txt" 
        className="hidden" 
      />

      {/* Main Glassmorphic Container Card - Pure White Lunar Light Theme */}
      <div className="relative w-full max-w-[1520px] h-[94vh] flex flex-col rounded-[28px] bg-white border border-slate-200/80 shadow-[0_25px_60px_rgba(0,0,0,0.25)] overflow-hidden text-slate-800">
        
        {/* Top Header Bar - Intelligent Responsive Layout */}
        <div className="flex flex-col xl:flex-row items-center justify-between border-b border-slate-200/80 bg-white/95 backdrop-blur-md shrink-0 z-20">
          
          {/* Top Row on Mobile (Logo & Close Button), Left Side on Desktop */}
          <div className="flex items-center justify-between w-full xl:w-auto h-14 sm:h-16 px-3 sm:px-5">
            {/* Top Left: Logo & TITAN AI Brand */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden shadow-xs border border-slate-200 flex items-center justify-center bg-gradient-to-br from-amber-400 to-orange-500 text-white">
                <Bot size={20} />
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-heading font-extrabold text-base tracking-wider text-slate-700">
                  LOF TITAN
                </span>
                <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                  <Sparkles size={10} className="text-amber-500" /> AI Studio
                </span>
              </div>
            </div>

            {/* Close Button (Visible only on Mobile/Tablet in top row) */}
            <button 
              onClick={onClose} 
              className="xl:hidden p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-full transition-colors"
              title="Close AI Studio"
            >
              <X size={20} />
            </button>
          </div>

          {/* Action Toolbar (Scrollable horizontally on mobile, flex row on desktop) */}
          <div className="flex items-center gap-2 sm:gap-2.5 w-full xl:w-auto overflow-x-auto scrollbar-hide px-3 sm:px-5 pb-2 xl:pb-0 shrink-0">
            
            {/* Center: Model Selector, API Key & Save/Open Project Tools */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Model Selector Dropdown */}
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-full px-2.5 sm:px-3 py-1 text-xs gap-1.5 sm:gap-2 shadow-xs shrink-0">
                <Zap size={13} className="text-amber-500" />
                <select 
                  value={selectedModel}
                  onChange={(e) => {
                    setSelectedModel(e.target.value);
                    localStorage.setItem("titan_gemini_model", e.target.value);
                  }}
                  className="bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer text-xs"
                >
                  {GEMINI_MODELS.map(m => (
                    <option key={m.id} value={m.id} className="bg-white text-slate-800">
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* API Key Settings Button */}
              <button 
                onClick={() => setShowSettings(true)}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors shadow-xs shrink-0"
                title="Configure Gemini API Key"
              >
                <Key size={13} className="text-amber-500" />
                <span className="hidden sm:inline">API Key</span>
              </button>

              {/* Save / Open File Pill */}
              <div className="frosted-pill px-2.5 sm:px-3 py-1 rounded-full flex items-center gap-2 sm:gap-2.5 text-slate-600 bg-slate-50 border border-slate-200 shrink-0 shadow-xs">
                <button 
                  onClick={handleSaveFile}
                  className="flex items-center gap-1.5 text-xs font-semibold hover:text-blue-600 transition-colors"
                  title="Save Python script to file (.py)"
                >
                  {saveStatus?.includes('.py') ? <Check size={13} className="text-emerald-500" /> : <Save size={13} className="text-blue-500" />}
                  <span>{saveStatus || "Save .py"}</span>
                </button>
                <div className="w-px h-3.5 bg-slate-200" />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 text-xs font-semibold hover:text-purple-600 transition-colors"
                  title="Open Python script file"
                >
                  <FolderOpen size={13} className="text-purple-500" />
                  <span>Open</span>
                </button>
              </div>
            </div>

            <div className="w-px h-5 bg-slate-200 mx-1 shrink-0" />

            {/* Run / Start Button */}
            <button 
              onClick={() => device?.sendCommand ? device.sendCommand('RUN') : null}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border border-emerald-300 transition-all shadow-xs active:scale-95 shrink-0"
              title="Execute active Python code on LOF TITAN"
            >
              <Play size={13} className="fill-current text-emerald-500" />
              <span>Run</span>
            </button>

            {/* Stop Button */}
            <button 
              onClick={() => device?.sendCommand ? device.sendCommand('STOP') : null}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border border-rose-300 transition-all shadow-xs active:scale-95 shrink-0"
              title="Stop Rover / Program"
            >
              <Square size={12} className="fill-current text-rose-500" />
              <span>Stop</span>
            </button>

            {/* Reset Button */}
            <button 
              onClick={() => device?.sendCommand ? device.sendCommand('RESET') : null}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 transition-all active:scale-95 shrink-0"
              title="Soft Reset TITAN"
            >
              <RotateCcw size={12} />
              <span className="hidden xl:inline">Reset</span>
            </button>

            {/* Serial Monitor Toggle Button */}
            <button 
              onClick={() => setShowSerialMonitor(!showSerialMonitor)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border shrink-0 ${
                showSerialMonitor 
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' 
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
              title="Open Live Serial REPL Monitor"
            >
              <Terminal size={14} className={showSerialMonitor ? 'text-white' : 'text-emerald-500'} />
              <span className="hidden xl:inline">Serial</span>
            </button>

            {/* Python Code Drawer Toggle Button */}
            <button 
              onClick={() => setShowPythonDrawer(!showPythonDrawer)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border shrink-0 ${
                showPythonDrawer 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs' 
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
              title="Toggle Python Code Drawer"
            >
              <Code size={14} className={showPythonDrawer ? 'text-white' : 'text-blue-500'} />
              <span className="hidden xl:inline">Python</span>
            </button>

            {/* Run on TITAN (Upload) Button */}
            <button 
              onClick={handleUploadToTitan}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-md hover:shadow-lg transition-all active:scale-95 shrink-0"
              title="Upload and execute active MicroPython code on LOF TITAN"
            >
              <Upload size={13} />
              <span>Run on TITAN</span>
            </button>

            {/* Close Button (Visible only on Desktop in toolbar) */}
            <button 
              onClick={onClose} 
              className="hidden xl:flex p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-full transition-colors shrink-0"
              title="Close AI Studio"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Area: Full Width Lunar Light AI Chat + Toggleable Slide-over Python Code Drawer */}
        <div className="flex-1 flex overflow-hidden relative bg-[#F8FAFC]">
          
          {/* Main AI Chat Area */}
          <div className="flex-1 flex flex-col relative overflow-hidden bg-[#F8FAFC]">
            
            {/* Quick Prompt Templates / Chips Bar */}
            <div className="p-3 border-b border-slate-200 bg-white/95 overflow-x-auto scrollbar-none flex gap-2 shrink-0 shadow-xs z-10">
              {PROMPT_SUGGESTIONS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(item.prompt)}
                  disabled={isLoading}
                  className="whitespace-nowrap px-3.5 py-1.5 rounded-full text-[11px] font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-amber-400 hover:text-amber-700 transition-all shrink-0 flex items-center gap-1.5 active:scale-95 shadow-xs"
                >
                  <Lightbulb size={12} className="text-amber-500" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 font-sans text-xs sm:text-sm leading-relaxed scrollbar-thin scrollbar-thumb-slate-300 z-10 max-w-4xl mx-auto w-full">
              {messages.map((msg, i) => {
                const isUser = msg.role === 'user';
                const codeSnippet = extractPythonCode(msg.text);

                return (
                  <div key={i} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                    
                    {!isUser && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shrink-0 mt-1 shadow-xs">
                        <Bot size={16} />
                      </div>
                    )}

                    <div className={`max-w-[88%] rounded-2xl p-4 overflow-hidden break-words ${
                      isUser 
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-tr-none shadow-md' 
                        : 'bg-white border border-slate-200/80 text-slate-800 rounded-tl-none shadow-xs'
                    }`}>
                      {isUser ? (
                        <div className="whitespace-pre-wrap break-words leading-relaxed">{msg.text}</div>
                      ) : (
                        renderFormattedMessage(msg.text)
                      )}

                      {/* If response contains python code, show quick "Apply to Editor" button */}
                      {codeSnippet && (
                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                            <FileCode size={13} className="text-blue-600" /> MicroPython Ready
                          </span>
                          <button
                            onClick={() => {
                              setEditorCode(codeSnippet);
                              setShowPythonDrawer(true);
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 transition-colors flex items-center gap-1.5 active:scale-95 shadow-xs"
                          >
                            <Code size={12} />
                            <span>View in Python Editor</span>
                            <ArrowRight size={12} />
                          </button>
                        </div>
                      )}
                    </div>

                    {isUser && (
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white shrink-0 mt-1 shadow-xs font-bold text-xs">
                        U
                      </div>
                    )}

                  </div>
                );
              })}

              {isLoading && (
                <div className="flex gap-3 items-center text-slate-500 text-xs italic animate-pulse p-3 bg-white/90 rounded-xl border border-slate-200/80 max-w-md shadow-xs">
                  <div className="w-6 h-6 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center">
                    <Sparkles size={13} className="text-amber-600 animate-spin" />
                  </div>
                  <span>LOF TITAN AI is generating custom MicroPython robotics code...</span>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Chat Input Bar */}
            <div className="p-3 border-t border-slate-200 bg-white z-10">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="max-w-4xl mx-auto flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                  placeholder="Ask AI to write rover code (e.g. 'Line follower on S1, S2 with smooth turns')..."
                  className="flex-1 bg-slate-50 text-slate-800 placeholder-slate-400 text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-sans"
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputPrompt.trim()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                >
                  <Send size={14} />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </form>
            </div>

            {/* Bottom Footer Section: LAB OF FUTURE Logo & Corner Lunar Landscape Artwork */}
            <div className="shrink-0 flex flex-col items-center bg-white border-t border-slate-100 select-none overflow-hidden relative h-16">
              <div className="w-full px-4 pt-1 z-10 flex items-center justify-center">
                <img 
                  src="/assets/lab_of_future_logo.webp" 
                  alt="Lab of Future - Be Curious" 
                  decoding="async"
                  className="w-28 h-auto object-contain drop-shadow-xs"
                />
              </div>
              <img 
                src="/assets/lunar_landscape.webp" 
                alt="Lunar Landscape" 
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover object-bottom pointer-events-none opacity-40"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>

            {/* Integrated Serial Monitor Bottom Panel */}
            {showSerialMonitor && (
              <div className="serial-panel h-56 bg-[#0B0F19] border-t border-slate-700/80 flex flex-col z-30 shadow-[0_-5px_25px_rgba(0,0,0,0.3)] animate-fade-in shrink-0">
                
                {/* Serial Header */}
                <div className="px-4 py-2 bg-[#0F172A] border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Terminal size={15} className="text-emerald-400" />
                    <span className="text-xs font-bold text-slate-200">TITAN Serial REPL Monitor</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      device?.status === 'CONNECTED_IDLE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {device?.deviceName || device?.status || 'Device'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setAutoScroll(!autoScroll)}
                      className={`text-[11px] px-2 py-0.5 rounded flex items-center gap-1.5 transition-colors ${
                        autoScroll ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${autoScroll ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                      <span>Scroll</span>
                    </button>

                    <button
                      onClick={() => device?.clearConsole ? device.clearConsole() : null}
                      className="p-1 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded transition-colors"
                      title="Clear Console"
                    >
                      <Trash2 size={14} />
                    </button>

                    <button
                      onClick={() => setShowSerialMonitor(false)}
                      className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </div>

                {/* Console Output */}
                <div className="flex-1 p-3 overflow-y-auto font-mono text-xs text-emerald-400 selection:bg-emerald-500/30" ref={consoleBottomRef}>
                  {!device?.consoleOutput ? (
                    <div className="text-slate-500 italic">Waiting for REPL serial output from LOF TITAN...</div>
                  ) : (
                    <pre className="whitespace-pre-wrap break-all leading-relaxed">{device.consoleOutput}</pre>
                  )}
                </div>

                {/* Serial Command Form */}
                <form onSubmit={handleSendSerial} className="p-2 bg-[#0F172A] border-t border-slate-800 flex gap-2">
                  <input
                    type="text"
                    value={serialInput}
                    onChange={(e) => setSerialInput(e.target.value)}
                    placeholder="Send command to TITAN REPL..."
                    className="flex-1 bg-[#060911] text-slate-100 text-xs px-3 py-1.5 rounded-lg border border-slate-700/60 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <Send size={12} />
                    <span>Send</span>
                  </button>
                </form>

              </div>
            )}

          </div>

          {/* Right Slide-over Python Code Drawer (Toggleable hide/view like Block Code) */}
          {showPythonDrawer && (
            <div className="w-[460px] bg-[#0F172A] text-slate-200 border-l border-slate-800 flex flex-col z-20 animate-fade-in shadow-2xl shrink-0">
              
              {/* Drawer Header */}
              <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <Code size={15} className="text-sky-400" />
                  <span>MicroPython Code Editor</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                    title="Copy Python Code"
                  >
                    {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={() => setEditorCode("")}
                    className="p-1 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded transition-colors"
                    title="Clear Editor"
                  >
                    <Trash2 size={13} />
                  </button>
                  <button
                    onClick={() => setShowPythonDrawer(false)}
                    className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
                    title="Hide Code Drawer"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              {/* Editable Python Code Area */}
              <div className="flex-1 relative bg-[#0B0F19] overflow-hidden">
                <textarea
                  value={editorCode}
                  onChange={(e) => setEditorCode(e.target.value)}
                  spellCheck="false"
                  className="w-full h-full p-4 bg-transparent text-sky-200 font-mono text-xs leading-relaxed focus:outline-none resize-none overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 selection:bg-sky-500/30"
                />
              </div>

              {/* Drawer Footer: Upload & Run on TITAN */}
              <div className="p-3 border-t border-slate-800 bg-slate-900/95 flex gap-2">
                <button
                  onClick={handleUploadToTitan}
                  className="flex-1 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
                >
                  <Upload size={14} />
                  <span>Run on TITAN</span>
                </button>
              </div>

            </div>
          )}

        </div>

        {/* API Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 z-[150] bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white border border-slate-200 p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4 text-slate-800">
              
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2 text-base font-bold text-slate-800">
                  <Key size={18} className="text-amber-500" />
                  <span>Gemini AI Configuration</span>
                </div>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5">
                    Google Gemini API Key:
                  </label>
                  <input 
                    type="password"
                    value={customKeyInput}
                    onChange={(e) => setCustomKeyInput(e.target.value)}
                    placeholder="Enter your Gemini API key..."
                    className="w-full bg-slate-50 text-slate-800 text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5">
                    Active AI Model:
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full bg-slate-50 text-slate-800 text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 cursor-pointer font-semibold"
                  >
                    {GEMINI_MODELS.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name} - {m.desc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSettings}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white transition-all shadow-md active:scale-95"
                >
                  Save Settings
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
