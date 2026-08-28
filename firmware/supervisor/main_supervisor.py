import sys
import io
import os
import select
import time
import micropython

# FIX 1: Hardware Watchdog Timer — resets board if main loop stalls
try:
    from machine import WDT
except ImportError:
    WDT = None

# Completely disable KeyboardInterrupt (Ctrl-C) from the serial port 
# so the supervisor NEVER drops to the REPL.
micropython.kbd_intr(-1)

try:
    import _thread
except ImportError:
    _thread = None

from .pins import *
from .device_id import get_device_name, get_device_info_dict, print_startup_banner
from .led_buzzer import hw
from .program_runner import runner, feed_wdt
from .state_machine import sm
from .ble_manager import BLEManager





class BLEConsoleStream(io.IOBase):
    """C-level MicroPython stdout mirror stream for BLE console notifications."""
    def __init__(self, send_func):
        self.send_func = send_func

    def write(self, buf):
        # FIX 2: Wrapped in try/except so a blocking/failing BLE TX never
        # stalls the main thread. Returns immediately on any error.
        if self.send_func and buf:
            try:
                text = buf.decode("utf-8") if isinstance(buf, (bytes, bytearray)) else str(buf)
                self.send_func(text)
            except Exception:
                pass
        return len(buf) if buf else 0

    def readinto(self, buf):
        return None


def start_uart_listener(ble):
    """Listens for JSON commands on UART0/USB serial stdin."""
    if _thread is None:
        return

    def _uart_worker():
        buffer = ""
        try:
            poller = select.poll()
            poller.register(sys.stdin, select.POLLIN)
        except Exception as e:
            print(f"[UART] Poller init error: {e}")
            return

        while True:
            try:
                res = poller.poll(100)
                if res:
                    ch = sys.stdin.read(1)
                    if ch in ('\n', '\r'):
                        line = buffer.strip()
                        buffer = ""
                        if line.startswith("{") and line.endswith("}"):
                            ble._handle_control_write(line.encode("utf-8"))
                    else:
                        buffer += ch
                        if len(buffer) > 4096:
                            buffer = ""
                else:
                    time.sleep_ms(50)
            except KeyboardInterrupt:
                pass
            except Exception as e:
                print(f"[UART] Worker note: {e}")

    try:
        try:
            _thread.stack_size(16384)
        except Exception:
            pass
        _thread.start_new_thread(_uart_worker, ())
    except Exception as e:
        print(f"[UART] Thread start note: {e}")


def start_supervisor():
    """Initializes and runs the LOF TITAN system supervisor."""
    # Wire callbacks
    ble = BLEManager(state_machine=sm, runner=runner)
    sm.set_dependencies(ble_manager=ble, runner=runner)
    hw.set_dependencies(runner=runner)

    runner.console_callback = ble.send_console_output
    runner.state_callback = sm.runner_state_callback

    # Attach MicroPython dupterm stream to duplicate ALL stdout prints to BLE console
    try:
        dupterm_fn = getattr(os, "dupterm", None) or getattr(sys, "dupterm", None)
        if dupterm_fn:
            stream = BLEConsoleStream(ble.send_console_output)
            success = False
            for i in range(3):
                try:
                    dupterm_fn(stream, i)
                    print(f"[SUPERVISOR] Console stdout mirrored to BLE via dupterm (index {i}).")
                    success = True
                    break
                except Exception:
                    pass
            if not success:
                # Try without index
                dupterm_fn(stream)
                print("[SUPERVISOR] Console stdout mirrored to BLE via dupterm (default index).")
    except Exception as e:
        print(f"[SUPERVISOR] dupterm setup note: {e}")



    # Start background UART command listener for COM Port connections
    start_uart_listener(ble)

    # Launch boot sequence
    try:
        sm.run_boot_sequence()
    except Exception as e:
        print(f"[SUPERVISOR] Boot exception: {e}")
        hw.set_leds_error()

    # Main thread execution loop
    # Executes user programs and guarantees safe interruption via micropython.schedule
    while True:
        try:
            if sm.run_pending:
                sm.run_pending = False
                runner.run_program()
            time.sleep_ms(20)
        except KeyboardInterrupt:
            # Ignore stray Ctrl-C so supervisor NEVER drops to REPL
            pass
        except Exception as e:
            print(f"[SUPERVISOR] Main loop exception: {e}")
        # Feed active WDT during supervisor idle state
        feed_wdt()

if __name__ == "__main__":
    start_supervisor()
