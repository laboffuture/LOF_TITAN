"""
LOF TITAN Supervisor State Machine
Manages deterministic system states, startup 10-second countdown, BLE lifecycle events, and autonomous execution.
"""

import time
from .device_id import get_device_name, print_startup_banner
from .led_buzzer import hw

try:
    import machine
except ImportError:
    machine = None

# States
STATE_BOOTING = "BOOTING"
STATE_WAITING_FOR_CONNECTION = "WAITING_FOR_CONNECTION"
STATE_CONNECTED_IDLE = "CONNECTED_IDLE"
STATE_PROGRAMMING = "PROGRAMMING"
STATE_PROGRAM_READY = "PROGRAM_READY"
STATE_RUNNING = "RUNNING"
STATE_STOPPING = "STOPPING"
STATE_STOPPED = "STOPPED"
STATE_NO_PROGRAM = "NO_PROGRAM"
STATE_ERROR = "ERROR"


class SupervisorStateMachine:
    def __init__(self):
        self.current_state = STATE_BOOTING
        self.ble_manager = None
        self.runner = None
        self.auto_run_cancelled = False
        self.startup_countdown_active = False
        self.run_pending = False

    def log_state(self, new_state):
        print(f"[STATE] {self.current_state} -> {new_state}")
        self.current_state = new_state
        if self.ble_manager:
            self.ble_manager.update_device_info()

    def set_dependencies(self, ble_manager, runner):
        self.ble_manager = ble_manager
        self.runner = runner

    def run_boot_sequence(self):
        """Executes the official 10-second startup sequence."""
        self.log_state(STATE_BOOTING)

        # 1. Print diagnostic banner
        print_startup_banner()

        # 2. Play melodic startup tone (and deinit GPIO20)
        hw.play_startup_tone()

        # 3. Start advertising
        if self.ble_manager:
            self.ble_manager.start_advertising()

        # 4. Enter WAITING_FOR_CONNECTION and start 10s countdown
        self.log_state(STATE_WAITING_FOR_CONNECTION)
        self.startup_countdown_active = True
        self.auto_run_cancelled = False

        print("[AUTORUN] 10-second startup countdown started...")
        for remaining in range(10, 0, -1):
            # FIX 5: React immediately if a RUN command arrived during countdown.
            if self.run_pending:
                print("[AUTORUN] RUN command received during countdown, exiting early.")
                self.startup_countdown_active = False
                return
            print(f"[AUTORUN] Starting in {remaining}s... (BLE: WAITING)")
            for _ in range(50):
                if self.auto_run_cancelled or (self.ble_manager and self.ble_manager.is_connected):
                    print(f"[AUTORUN] Cancelled - BLE client connected.")
                    self.startup_countdown_active = False
                    self.log_state(STATE_CONNECTED_IDLE)
                    return
                time.sleep_ms(20)

        self.startup_countdown_active = False

        # 10s Window Expired without connection
        if not (self.ble_manager and self.ble_manager.is_connected):
            if self.runner and self.runner.has_valid_program():
                print("[AUTORUN] Timeout expired. Executing stored /program/user.py autonomously...")
                self.execute_user_program()
            else:
                # No stored program — play tone and stay in WAITING_FOR_CONNECTION.
                # BLE advertising continues; a client can still connect at any time.
                print("[AUTORUN] Timeout expired. No stored program found. Waiting for BLE connection...")
                hw.play_error_tone()
                hw.set_leds_disconnected()
                self.log_state(STATE_WAITING_FOR_CONNECTION)

    def on_ble_connected(self):
        """Called when BLE client connects."""
        if self.startup_countdown_active:
            self.auto_run_cancelled = True
            print("[BLE] Connection established during startup countdown.")

        if self.current_state != STATE_RUNNING:
            self.log_state(STATE_CONNECTED_IDLE)
        else:
            print("[BLE] Connected while user program is RUNNING (program continuing).")

    def on_ble_disconnected(self):
        """Called when BLE client disconnects."""
        if self.current_state == STATE_RUNNING:
            print("[BLE] Disconnected while RUNNING - autonomous execution continues.")
        elif self.current_state == STATE_PROGRAMMING:
            print("[BLE] Disconnected during upload - upload aborted.")
            self.log_state(STATE_CONNECTED_IDLE)
        else:
            self.log_state(STATE_WAITING_FOR_CONNECTION)

    def runner_state_callback(self, state, message=None):
        """Callback from ProgramRunner on state transitions."""
        if state == "RUNNING":
            self.log_state(STATE_RUNNING)
            if self.ble_manager:
                self.ble_manager.send_status_response({"status": "RUNNING"})
        elif state == "FINISHED":
            if self.ble_manager and self.ble_manager.is_connected:
                self.log_state(STATE_CONNECTED_IDLE)
                self.ble_manager.send_status_response({"status": "CONNECTED_IDLE"})
            else:
                self.log_state(STATE_WAITING_FOR_CONNECTION)
        elif state == "STOPPED":
            self.log_state(STATE_STOPPED)
            if self.ble_manager:
                self.ble_manager.send_status_response({"status": "STOPPED"})
        elif state == "ERROR":
            self.log_state(STATE_ERROR)
            if self.ble_manager:
                self.ble_manager.send_status_response({"status": "ERROR", "message": message})

    def handle_run_command(self):
        """Triggered by RUN command."""
        if not self.runner or not self.runner.has_valid_program():
            print("[CMD] RUN rejected: no valid program found.")
            hw.play_error_tone()
            self.log_state(STATE_NO_PROGRAM)
            if self.ble_manager:
                self.ble_manager.send_status_response({"status": "NO_PROGRAM"})
            return

        self.execute_user_program()

    def execute_user_program(self):
        """Signals main loop to execute user program."""
        hw.play_run_tone()
        self.run_pending = True

    def handle_stop_command(self):
        """Triggered by STOP command."""
        self.run_pending = False
        self.log_state(STATE_STOPPING)
        hw.play_stop_tone()
        if self.runner:
            self.runner.stop_program()
        self.log_state(STATE_STOPPED)
        if self.ble_manager:
            self.ble_manager.send_status_response({"status": "STOPPED"})

    def handle_program_command(self, filename, size, checksum):
        """Triggered by PROGRAM command."""
        if self.current_state == STATE_RUNNING:
            print("[CMD] Program requested while running. Requesting stop first...")
            self.handle_stop_command()

        self.log_state(STATE_PROGRAMMING)
        if self.runner:
            ok, msg = self.runner.start_upload(filename, size, checksum)
            if ok:
                if self.ble_manager:
                    self.ble_manager.send_status_response({"status": "PROGRAMMING"})
            else:
                self.log_state(STATE_ERROR)
                if self.ble_manager:
                    self.ble_manager.send_status_response({"status": "ERROR", "message": msg})

    def on_program_saved(self):
        """Called when upload successfully finishes."""
        self.log_state(STATE_PROGRAM_READY)
        print("[SUPERVISOR] Program successfully stored and verified.")

    def on_program_error(self, err_msg):
        """Called when upload fails or syntax error occurs."""
        self.log_state(STATE_ERROR)
        print(f"[SUPERVISOR] Program upload error: {err_msg}")

    def handle_reset_command(self):
        """Triggered by RESET command."""
        print("[CMD] Controlled device reset requested...")
        time.sleep(0.2)
        if machine and hasattr(machine, "reset"):
            machine.reset()
        else:
            print("[SYSTEM] Simulation reset - restarting boot sequence.")
            self.run_boot_sequence()


# Global singleton state machine
sm = SupervisorStateMachine()
