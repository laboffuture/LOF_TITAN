"""
LOF TITAN LED & Buzzer Controller
Handles Red/Green status LEDs and transient buzzer feedback.
Ensures GPIO20 is immediately released and deinitialised so user MicroPython scripts can control it.

IMPORTANT: play_*_tone() methods must be safe to call inside MicroPython BLE IRQ handlers.
They must do ZERO heap allocation. They write a single byte to a pre-allocated bytearray.
"""

import time
from .pins import PIN_LED_RED, PIN_LED_GREEN, PIN_BUZZER

try:
    from machine import Pin, PWM
except ImportError:
    Pin = None
    PWM = None

try:
    import _thread
except ImportError:
    _thread = None

# ── Tone IDs (must fit in one byte, zero = idle) ──────────────────────────────
TONE_STARTUP      = 1
TONE_ERROR        = 2
TONE_CONNECT      = 3
TONE_DISCONNECT   = 4
TONE_RUN          = 5
TONE_STOP         = 6
TONE_CONFIRM      = 7


class HardwareController:
    def __init__(self):
        self._led_red   = None
        self._led_green = None
        self._is_hardware_available = (Pin is not None)

        # ── Pre-allocated tone table (index 0 unused) ──────────────────────
        # Each entry is a tuple of (freq_hz, duration_ms) pairs.
        # ALL tuples are created here at __init__ time so IRQs can reference
        # them without allocating any new objects.
        self._tone_table = [
            None,                                                 # 0 – unused
            ((523, 100), (659, 100), (784, 150)),                # 1 – startup
            ((330, 400), (220, 600), (150, 800)),                 # 2 – error (longer duration)
            ((784, 100), (1046, 150)),                            # 3 – connect
            ((1046, 100), (784, 150)),                            # 4 – disconnect
            ((523, 80), (659, 80), (1046, 120)),                  # 5 – run
            ((440, 100), (349, 150)),                             # 6 – stop
            ((880, 80), (1175, 100)),                             # 7 – confirm
        ]

        # ── Zero-allocation queue: a bytearray of capacity 8 ─────────────
        # IRQ writes a single byte (tone ID); worker reads and clears it.
        # Lockless single-producer/single-consumer ring buffer.
        # IRQ side owns _q_tail (writes it only).
        # Worker thread owns _q_head (writes it only).
        # No lock needed – each side writes only its own index.
        self._queue = bytearray(8)   # pre-allocated, no heap in IRQ
        self._q_head = 0
        self._q_tail = 0

        # Track whether we were connected so disconnect tone only plays after a real connection
        self._was_connected = False
        self.runner = None

        if self._is_hardware_available:
            try:
                self._led_red   = Pin(PIN_LED_RED,   Pin.OUT)
                self._led_green = Pin(PIN_LED_GREEN,  Pin.OUT)
                self.set_leds_disconnected()
            except Exception as e:
                print(f"[HW] LED init warning: {e}")

        if _thread is not None:
            try:
                try:
                    _thread.stack_size(16384)
                except Exception:
                    pass
                _thread.start_new_thread(self._tone_worker, ())
            except Exception as e:
                print(f"[HW] Tone thread init warning: {e}")

    def set_dependencies(self, runner=None):
        self.runner = runner

    # ── Worker thread ─────────────────────────────────────────────────────────
    def _tone_worker(self):
        """
        Dedicated worker thread. Creates ONE PWM instance on GPIO20 at startup
        and reuses it forever – never deinit/recreate to avoid LEDC channel conflicts.
        Entire loop is wrapped in try/except so the thread can NEVER die silently.
        """
        buzzer = None
        while True:
            try:
                if self._q_head != self._q_tail:
                    tone_id = self._queue[self._q_head]
                    self._q_head = (self._q_head + 1) & 7

                    if 1 <= tone_id < len(self._tone_table):
                        # Lazy-init PWM once; keep alive forever
                        if buzzer is None and PWM is not None and Pin is not None:
                            try:
                                bp = Pin(PIN_BUZZER, Pin.OUT)
                                buzzer = PWM(bp)
                                buzzer.duty_u16(0)
                                print("[BUZZER] PWM initialised on GPIO", PIN_BUZZER)
                            except Exception as e:
                                print(f"[BUZZER] PWM init error: {e}")

                        if buzzer is not None:
                            try:
                                for freq, dur in self._tone_table[tone_id]:
                                    if freq > 0:
                                        buzzer.freq(freq)
                                        buzzer.duty_u16(30000)
                                    else:
                                        buzzer.duty_u16(0)
                                    time.sleep_ms(dur)
                                buzzer.duty_u16(0)   # silence between tones
                                time.sleep_ms(50)
                            except Exception as e:
                                print(f"[BUZZER] Play error: {e}")
                                # Reset buzzer on error so it re-inits next time
                                try:
                                    buzzer.deinit()
                                except Exception:
                                    pass
                                buzzer = None
                else:
                    time.sleep_ms(30)
            except Exception as e:
                # Safety net – thread must NEVER die
                print(f"[BUZZER] Worker exception: {e}")
                time.sleep_ms(100)

    # ── Fully lockless IRQ-safe enqueue ──────────────────────────────────────
    def _enqueue_tone(self, tone_id):
        """
        Fully IRQ-safe. NEVER acquires a lock.
        Single-producer (IRQ/main) writes _q_tail only.
        Worker thread writes _q_head only.
        No heap allocation: only a bytearray element write + small-int arithmetic.
        """
        next_tail = (self._q_tail + 1) & 7
        if next_tail != self._q_head:          # queue not full
            self._queue[self._q_tail] = tone_id
            self._q_tail = next_tail            # commit – worker sees new item

    # ── LED helpers ───────────────────────────────────────────────────────────
    def set_leds_disconnected(self):
        """RED = ON, GREEN = OFF. Plays disconnect tone if we were previously connected."""
        if self._is_hardware_available and self._led_red and self._led_green:
            self._led_red.value(1)
            self._led_green.value(0)
            if self._was_connected:
                self._was_connected = False
                self._enqueue_tone(TONE_DISCONNECT)

    def set_leds_connected(self):
        """RED = OFF, GREEN = ON. Always plays connect tone."""
        if self._is_hardware_available and self._led_red and self._led_green:
            self._led_red.value(0)
            self._led_green.value(1)
            self._was_connected = True
            self._enqueue_tone(TONE_CONNECT)

    def set_leds_programming(self, toggle_state=None):
        if self._is_hardware_available and self._led_red and self._led_green:
            self._led_red.value(0)
            if toggle_state is not None:
                self._led_green.value(1 if toggle_state else 0)
            else:
                self._led_green.value(1 - self._led_green.value())

    def set_leds_error(self):
        if self._is_hardware_available and self._led_red and self._led_green:
            self._led_green.value(0)
            for _ in range(9):
                self._led_red.value(1)
                time.sleep_ms(100)
                self._led_red.value(0)
                time.sleep_ms(100)
            self._led_red.value(1)

    # ── Public tone API (IRQ-safe) ────────────────────────────────────────────
    def play_startup_tone(self):
        self._enqueue_tone(TONE_STARTUP)

    def play_error_tone(self):
        self._enqueue_tone(TONE_ERROR)

    def play_connect_tone(self):
        self._enqueue_tone(TONE_CONNECT)

    def play_disconnect_tone(self):
        self._enqueue_tone(TONE_DISCONNECT)

    def play_run_tone(self):
        self._enqueue_tone(TONE_RUN)

    def play_stop_tone(self):
        self._enqueue_tone(TONE_STOP)

    def play_confirmation_tone(self):
        self._enqueue_tone(TONE_CONFIRM)

    def play_buzzer_freq(self, freq=1000, duration_ms=200):
        if not self._is_hardware_available:
            return
        try:
            bz = PWM(Pin(PIN_BUZZER), freq=int(freq), duty=512)
            time.sleep_ms(int(duration_ms))
            bz.duty(0)
            bz.deinit()
        except Exception:
            pass

    def buzzer_beep(self, freq=1000, duration_ms=150):
        self.play_buzzer_freq(freq, duration_ms)

    def stop_buzzer(self):
        if not self._is_hardware_available:
            return
        try:
            bz = PWM(Pin(PIN_BUZZER))
            bz.duty(0)
            bz.deinit()
        except Exception:
            try:
                Pin(PIN_BUZZER, Pin.OUT).value(0)
            except Exception:
                pass

    def read_ultrasonic_distance(self, trig=6, echo=19, unit="cm"):
        """
        Reads ultrasonic distance sensor (HC-SR04 / similar) on Trig and Echo GPIO pins.
        unit: 'cm', 'inch', or 'mm' (case-insensitive).
        Returns distance rounded to 2 decimal places, or -1.0 on timeout/error.
        """
        try:
            from machine import time_pulse_us
            tp = Pin(int(trig), Pin.OUT)
            ep = Pin(int(echo), Pin.IN)

            # Clean 10us trigger pulse
            tp.value(0)
            time.sleep_us(2)
            tp.value(1)
            time.sleep_us(10)
            tp.value(0)

            # Measure echo pulse high duration (timeout 30,000us ~ 5 meters)
            duration_us = time_pulse_us(ep, 1, 30000)
            if duration_us <= 0:
                return -1.0

            # Distance in cm = (duration / 2) / 29.1375 = duration / 58.275
            dist_cm = duration_us / 58.275

            u = str(unit).strip().lower()
            if u in ("inch", "in", "inches"):
                return round(dist_cm / 2.54, 2)
            elif u in ("mm", "millimeter", "millimeters"):
                return round(dist_cm * 10.0, 1)
            else:
                return round(dist_cm, 2)
        except Exception as e:
            return -1.0


# Global singleton instance
hw = HardwareController()
