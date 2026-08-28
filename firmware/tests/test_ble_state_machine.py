"""
Unit Tests for Supervisor State Machine and 10-Second Startup Sequence
Verifies sections 8, 9, 10, 16, 17, 18, 22.
"""

import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "firmware")))

from supervisor.state_machine import (
    SupervisorStateMachine,
    STATE_BOOTING,
    STATE_WAITING_FOR_CONNECTION,
    STATE_CONNECTED_IDLE,
    STATE_RUNNING,
    STATE_STOPPED,
    STATE_NO_PROGRAM
)


class MockBLEManager:
    def __init__(self):
        self.is_connected = False
        self.advertising = False
        self.last_status = None

    def start_advertising(self):
        self.advertising = True

    def update_device_info(self):
        pass

    def send_status_response(self, resp):
        self.last_status = resp


class MockRunner:
    def __init__(self, has_prog=True):
        self._has_prog = has_prog
        self.ran_program = False
        self.stopped = False

    def has_valid_program(self):
        return self._has_prog

    def run_program(self):
        self.ran_program = True

    def stop_program(self):
        self.stopped = True


class TestBLEStateMachine(unittest.TestCase):
    def setUp(self):
        self.sm = SupervisorStateMachine()
        self.ble = MockBLEManager()
        self.runner = MockRunner()
        self.sm.set_dependencies(self.ble, self.runner)

    def test_initial_state(self):
        self.assertEqual(self.sm.current_state, STATE_BOOTING)

    def test_connection_during_startup(self):
        """Web app connects before 10-second timeout -> enters CONNECTED_IDLE and cancels auto-run."""
        self.sm.startup_countdown_active = True
        self.sm.on_ble_connected()
        self.assertTrue(self.sm.auto_run_cancelled)
        self.assertEqual(self.sm.current_state, STATE_CONNECTED_IDLE)

    def test_connect_disconnect_while_running(self):
        """Connection and disconnection while RUNNING do NOT stop running program."""
        self.sm.current_state = STATE_RUNNING

        # Connect
        self.sm.on_ble_connected()
        self.assertEqual(self.sm.current_state, STATE_RUNNING)

        # Disconnect
        self.sm.on_ble_disconnected()
        self.assertEqual(self.sm.current_state, STATE_RUNNING)

    def test_run_command_with_no_program(self):
        """RUN command when no program exists yields NO_PROGRAM state."""
        self.runner._has_prog = False
        self.sm.handle_run_command()
        self.assertEqual(self.sm.current_state, STATE_NO_PROGRAM)
        self.assertEqual(self.ble.last_status, {"status": "NO_PROGRAM"})


if __name__ == "__main__":
    unittest.main()
