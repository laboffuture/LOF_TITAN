"""
LOF TITAN Program Storage, Atomic Transfer, and Safe Execution Runner
Manages /program/user.py, validates incoming uploads atomically, and provides safe VM interruption.
"""

import os
import sys
import gc
import json
import time

from .pins import ALL_MOTOR_PINS, PIN_BUZZER
from .led_buzzer import hw

try:
    import _thread
except ImportError:
    _thread = None

try:
    import micropython
except ImportError:
    micropython = None

try:
    from machine import Pin, PWM, WDT
except ImportError:
    Pin = None
    PWM = None
    WDT = None

_wdt = None

def get_or_enable_wdt(timeout=8000):
    """Arms hardware WDT only when user program actually runs."""
    global _wdt
    if _wdt is None and WDT is not None:
        try:
            _wdt = WDT(timeout=timeout)
            print(f"[WDT] Hardware Watchdog armed for user program ({timeout}ms).")
        except Exception as e:
            print(f"[WDT] Warning: could not arm WDT: {e}")
    return _wdt

def feed_wdt():
    """Feeds active WDT to prevent resets during normal operation."""
    global _wdt
    if _wdt is not None:
        try:
            _wdt.feed()
        except Exception:
            pass

PROGRAM_DIR = "/program"
USER_PROGRAM_PATH = "/program/user.py"
TEMP_PROGRAM_PATH = "/program/user.tmp"
BACKUP_PROGRAM_PATH = "/program/user.bak"
METADATA_PATH = "/program/program.json"

class InterruptibleTime:
    """Wrapper around time module that checks for STOP requests in 20ms slices."""
    def __init__(self, runner, real_time):
        self._runner = runner
        self._rt = real_time

    def sleep(self, seconds):
        # FIX 4: Guard against seconds <= 0 to avoid busy-loop.
        # Chunk into 1-second slices to prevent 32-bit millisecond overflow.
        feed_wdt()
        if seconds <= 0:
            self._rt.sleep_ms(1)   # always yield at least 1 ms
            return
        while seconds > 0:
            if self._runner.stop_requested:
                raise KeyboardInterrupt("STOP command received from supervisor")
            chunk = min(seconds, 1.0)
            self._rt.sleep(chunk)
            feed_wdt()
            seconds -= chunk
        # Final check after last chunk
        if self._runner.stop_requested:
            raise KeyboardInterrupt("STOP command received from supervisor")

    def sleep_ms(self, ms):
        feed_wdt()
        if self._runner.stop_requested:
            raise KeyboardInterrupt("STOP command received from supervisor")
        end_time = self._rt.ticks_add(self._rt.ticks_ms(), int(ms))
        while self._rt.ticks_diff(end_time, self._rt.ticks_ms()) > 0:
            if self._runner.stop_requested:
                raise KeyboardInterrupt("STOP command received from supervisor")
            rem = self._rt.ticks_diff(end_time, self._rt.ticks_ms())
            self._rt.sleep_ms(min(20, max(1, rem)))
            feed_wdt()
        if self._runner.stop_requested:
            raise KeyboardInterrupt("STOP command received from supervisor")

    def sleep_us(self, us):
        feed_wdt()
        if self._runner.stop_requested:
            raise KeyboardInterrupt("STOP command received from supervisor")
        self._rt.sleep_us(us)

    def ticks_ms(self):
        return self._rt.ticks_ms()

    def ticks_us(self):
        return self._rt.ticks_us()

    def ticks_cpu(self):
        return getattr(self._rt, "ticks_cpu", self._rt.ticks_ms)()

    def ticks_add(self, ticks, delta):
        return self._rt.ticks_add(ticks, delta)

    def ticks_diff(self, ticks1, ticks2):
        return self._rt.ticks_diff(ticks1, ticks2)

    def time(self):
        return self._rt.time()

    def time_ns(self):
        return getattr(self._rt, "time_ns", self._rt.time)()

    def localtime(self, *args):
        return self._rt.localtime(*args)

    def gmtime(self, *args):
        return getattr(self._rt, "gmtime", self._rt.localtime)(*args)

    def mktime(self, *args):
        return self._rt.mktime(*args)


class ProgramRunner:
    def __init__(self, console_callback=None, state_callback=None):
        self.console_callback = console_callback
        self.state_callback = state_callback
        self.is_running = False
        self.stop_requested = False
        self.upload_in_progress = False
        self.upload_file = None
        self.upload_meta = {}
        # FIX 3: Mutex to protect all shared flags from UART-thread/main-thread races
        self._lock = _thread.allocate_lock() if _thread is not None else None
        self._ensure_directories()

    def _ensure_directories(self):
        """Ensures /program directory exists."""
        try:
            os.mkdir(PROGRAM_DIR)
        except OSError:
            pass

    def log(self, message):
        """Sends log message to serial and BLE console."""
        print(f"[RUNNER] {message}")
        if self.console_callback:
            try:
                self.console_callback(f"{message}\n")
            except Exception:
                pass

    def has_valid_program(self):
        """Checks if /program/user.py exists and has size > 0."""
        try:
            stat = os.stat(USER_PROGRAM_PATH)
            return stat[6] > 0
        except OSError:
            return False

    def get_program_metadata(self):
        """Returns metadata dictionary for current stored program."""
        if not self.has_valid_program():
            return None
        try:
            with open(METADATA_PATH, "r") as f:
                return json.load(f)
        except Exception:
            try:
                stat = os.stat(USER_PROGRAM_PATH)
                return {"filename": "user.py", "size": stat[6]}
            except Exception:
                return None

    # --- Atomic Upload Lifecycle ---

    def start_upload(self, filename="user.py", expected_size=0, expected_checksum=""):
        """Initiates an atomic upload session into /program/user.tmp and clears old code."""
        if self.is_running:
            self.log("Stopping active program before starting upload...")
            self.stop_program()

        self._cleanup_temp_file()

        # FIX 3: Protect shared upload flags with mutex
        if self._lock:
            self._lock.acquire()
        try:
            # Immediately delete old programs so stale code isn't executed during upload
            for path in (USER_PROGRAM_PATH, BACKUP_PROGRAM_PATH, METADATA_PATH):
                try:
                    os.remove(path)
                except OSError:
                    pass

            try:
                self.upload_file = open(TEMP_PROGRAM_PATH, "wb")
                self.upload_in_progress = True
                self.upload_meta = {
                    "filename": filename,
                    "expected_size": int(expected_size),
                    "expected_checksum": str(expected_checksum),
                    "received_bytes": 0,
                    "expected_seq": 0,
                    "crc32": 0
                }
                self.log(f"Upload initiated for {filename} ({expected_size} bytes)")
                return True, "READY"
            except Exception as e:
                self.upload_in_progress = False
                self.log(f"Failed to open temp file: {e}")
                return False, str(e)
        finally:
            if self._lock:
                self._lock.release()

    def write_chunk(self, seq, data):
        """Writes a chunk into user.tmp with sequence checking."""
        # FIX 3: Lock around shared upload state
        if self._lock:
            self._lock.acquire()
        try:
            if not self.upload_in_progress or not self.upload_file:
                return False, "NO_ACTIVE_UPLOAD"

            expected_seq = self.upload_meta["expected_seq"]
            if seq != expected_seq:
                self.log(f"Sequence mismatch: expected {expected_seq}, got {seq}")
                return False, f"SEQ_MISMATCH_{expected_seq}"

            try:
                if isinstance(data, str):
                    data = data.encode("utf-8")
                self.upload_file.write(data)
                self.upload_meta["received_bytes"] += len(data)
                self.upload_meta["expected_seq"] += 1
                return True, "CHUNK_OK"
            except Exception as e:
                self.log(f"Chunk write error: {e}")
                return False, str(e)
        finally:
            if self._lock:
                self._lock.release()

    def finish_upload(self):
        """Validates syntax and checksum, backs up old program, and atomically promotes user.tmp."""
        # FIX 3: Lock around upload flag mutations
        if self._lock:
            self._lock.acquire()
        try:
            if not self.upload_in_progress or not self.upload_file:
                return False, "NO_ACTIVE_UPLOAD"
            try:
                self.upload_file.flush()
                self.upload_file.close()
            except Exception:
                pass
            self.upload_file = None
            self.upload_in_progress = False
        finally:
            if self._lock:
                self._lock.release()

        # 1. Verify byte count
        expected_size = self.upload_meta.get("expected_size", 0)
        received_bytes = self.upload_meta.get("received_bytes", 0)
        if expected_size > 0 and received_bytes != expected_size:
            self._cleanup_temp_file()
            err = f"Size mismatch: expected {expected_size}, received {received_bytes}"
            self.log(err)
            return False, err

        # 2. Syntax validation
        try:
            with open(TEMP_PROGRAM_PATH, "r", encoding="utf-8") as f:
                code_str = f.read()
            compile(code_str, USER_PROGRAM_PATH, "exec")
        except SyntaxError as syn_err:
            self._cleanup_temp_file()
            err = f"SyntaxError: {syn_err}"
            self.log(f"Validation failed: {err}")
            return False, err
        except Exception as ex:
            self._cleanup_temp_file()
            err = f"CompileError: {ex}"
            self.log(f"Validation failed: {err}")
            return False, err

        # 3. Safe Backup & Promotion
        try:
            if self.has_valid_program():
                try:
                    # Remove previous backup if present
                    try:
                        os.remove(BACKUP_PROGRAM_PATH)
                    except OSError:
                        pass
                    os.rename(USER_PROGRAM_PATH, BACKUP_PROGRAM_PATH)
                except Exception as e:
                    self.log(f"Warning during backup: {e}")

            os.rename(TEMP_PROGRAM_PATH, USER_PROGRAM_PATH)

            # Write program metadata
            meta = {
                "filename": self.upload_meta.get("filename", "user.py"),
                "size": received_bytes,
                "checksum": self.upload_meta.get("expected_checksum", ""),
                "updated_at": time.time()
            }
            with open(METADATA_PATH, "w") as f:
                json.dump(meta, f)

            hw.play_confirmation_tone()
            self.log("Program successfully validated and saved to /program/user.py")
            return True, "PROGRAM_SAVED"
        except Exception as e:
            self.log(f"Atomic promotion failed: {e}")
            # Try to restore backup if user.py is missing
            if not self.has_valid_program() and self._file_exists(BACKUP_PROGRAM_PATH):
                try:
                    os.rename(BACKUP_PROGRAM_PATH, USER_PROGRAM_PATH)
                except Exception:
                    pass
            return False, str(e)

    def cancel_upload(self):
        """Cancels active transfer and deletes temp file."""
        # FIX 3: Lock around shared upload state
        if self._lock:
            self._lock.acquire()
        try:
            if self.upload_file:
                try:
                    self.upload_file.close()
                except Exception:
                    pass
                self.upload_file = None
            self.upload_in_progress = False
        finally:
            if self._lock:
                self._lock.release()
        self._cleanup_temp_file()
        self.log("Upload cancelled and temp file cleaned.")

    def _cleanup_temp_file(self):
        try:
            os.remove(TEMP_PROGRAM_PATH)
        except OSError:
            pass

    def _file_exists(self, path):
        try:
            os.stat(path)
            return True
        except OSError:
            return False

    # --- Program Execution & Safe Interruption ---

    def run_program(self):
        """Executes /program/user.py on the main thread with interruptible exception handling."""
        if not self.has_valid_program():
            self.log("Cannot run: /program/user.py not found.")
            hw.play_error_tone()
            if self.state_callback:
                self.state_callback("NO_PROGRAM")
            return False, "NO_PROGRAM"

        # FIX 3: Lock around is_running / stop_requested flag mutations
        if self._lock:
            self._lock.acquire()
        try:
            self.is_running = True
            self.stop_requested = False
        finally:
            if self._lock:
                self._lock.release()

        if self.state_callback:
            self.state_callback("RUNNING")

        self.log("Executing /program/user.py...")

        try:
            # Prepare execution environment
            original_print = print
            def custom_print(*args, **kwargs):
                feed_wdt()
                if self.stop_requested:
                    raise KeyboardInterrupt("STOP command received from supervisor")
                # FIX 2: Only print to real UART/dupterm stream.
                # The dupterm BLEConsoleStream already mirrors stdout to BLE;
                # calling console_callback here would cause double BLE traffic.
                original_print(*args, **kwargs)
                if self.stop_requested:
                    raise KeyboardInterrupt("STOP command received from supervisor")
                        
            interruptible_time = InterruptibleTime(self, time)

            builtins_import = __import__
            def custom_import(name, globals=None, locals=None, fromlist=(), level=0):
                if name == "time":
                    return interruptible_time
                return builtins_import(name, globals, locals, fromlist, level)

            try:
                import builtins
                orig_builtin_import = builtins.__import__
                builtins.__import__ = custom_import
            except Exception:
                builtins = None
                orig_builtin_import = None

            orig_sys_time = sys.modules.get('time')
            try:
                sys.modules['time'] = interruptible_time
            except Exception:
                pass

            user_globals = {
                "__name__": "__main__",
                "__file__": USER_PROGRAM_PATH,
                "__import__": custom_import,
                "time": interruptible_time,
                "print": custom_print
            }
            with open(USER_PROGRAM_PATH, "r", encoding="utf-8") as f:
                code = f.read()

            compiled_code = compile(code, USER_PROGRAM_PATH, "exec")
            get_or_enable_wdt(8000)
            feed_wdt()
            exec(compiled_code, user_globals)

            self.log("Program finished execution normally.")
            if self.state_callback:
                self.state_callback("FINISHED")
        except KeyboardInterrupt:
            self.log("Program interrupted (STOP).")
            if self.state_callback:
                self.state_callback("STOPPED")
        except Exception as e:
            import io
            sio = io.StringIO()
            sys.print_exception(e, sio)
            err_msg = f"User program exception:\n{sio.getvalue()}"
            self.log(err_msg)
            hw.play_error_tone()
            if self.state_callback:
                self.state_callback("ERROR", message=err_msg)
        finally:
            if builtins and orig_builtin_import:
                try:
                    builtins.__import__ = orig_builtin_import
                except Exception:
                    pass
            if orig_sys_time is not None:
                try:
                    sys.modules['time'] = orig_sys_time
                except Exception:
                    pass
            # FIX 3: Lock around cleanup of shared flags
            if self._lock:
                self._lock.acquire()
            try:
                self.is_running = False
                self.stop_requested = False
            finally:
                if self._lock:
                    self._lock.release()
            self.safe_hardware_reset()
            gc.collect()

        return True, "COMPLETED"

    def stop_program(self):
        """Requests immediate safe VM interruption and hardware safe reset."""
        # FIX 3: Lock around is_running check and stop_requested mutation
        if self._lock:
            self._lock.acquire()
        try:
            if not self.is_running:
                self.safe_hardware_reset()
                if self.state_callback:
                    self.state_callback("STOPPED")
                return True, "ALREADY_STOPPED"
            self.stop_requested = True
        finally:
            if self._lock:
                self._lock.release()

        self.log("Stopping user program...")
        # Wait outside the lock so other operations can proceed
        for _ in range(10):
            if not self.is_running:
                break
            time.sleep_ms(10)

        self.safe_hardware_reset()
        if self.state_callback:
            self.state_callback("STOPPED")
        return True, "STOPPED"

    def safe_hardware_reset(self):
        """Resets all motor pins to safe defaults without rebooting board.
        NOTE: GPIO20 (buzzer) is intentionally NOT touched here — the tone
        worker thread owns it persistently via a PWM instance and must not
        have the pin reconfigured under it.
        """
        if Pin is None:
            return

        # FIX 6: Set each motor pin to output-low directly.
        # Avoid creating new PWM objects which can raise RuntimeError
        # (out of PWM timers) or fail on already-deinitialised pins.
        for pin_num in ALL_MOTOR_PINS:
            try:
                p = Pin(pin_num, Pin.OUT)
                p.value(0)
            except Exception:
                pass

        try:
            import gc
            gc.collect()
        except Exception:
            pass


# Global singleton runner
runner = ProgramRunner()
