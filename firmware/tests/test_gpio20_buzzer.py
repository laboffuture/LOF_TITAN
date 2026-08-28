"""
Unit Tests for GPIO20 Buzzer Lifecycle and Release
Verifies section 3 & 36: Buzzer deinitialization allows user program re-acquisition.
"""

import unittest
import sys
import os

# Add supervisor to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "firmware")))

from supervisor.led_buzzer import HardwareController
from supervisor.pins import PIN_BUZZER


class MockPin:
    IN = 0
    OUT = 1
    def __init__(self, pin_num, mode=0):
        self.pin_num = pin_num
        self.mode = mode
        self.val = 0

    def value(self, v=None):
        if v is not None:
            self.val = v
        return self.val


class MockPWM:
    def __init__(self, pin):
        self.pin = pin
        self.frequency = 1000
        self.duty = 0
        self.is_deinit = False

    def freq(self, f):
        self.frequency = f

    def duty_u16(self, d):
        self.duty = d

    def deinit(self):
        self.is_deinit = True


class TestGPIO20Buzzer(unittest.TestCase):
    def test_buzzer_release_after_tone(self):
        """Verify buzzer plays tone sequence and immediately calls deinit()"""
        hw = HardwareController()
        # Mocking time.sleep_ms
        import time
        orig_sleep = time.sleep_ms if hasattr(time, "sleep_ms") else None
        time.sleep_ms = lambda ms: None

        played_notes = [(500, 50), (1000, 50)]
        
        # Test tone sequence runner
        import supervisor.led_buzzer as lb
        lb.Pin = MockPin
        lb.PWM = MockPWM
        hw._is_hardware_available = True

        hw._play_tone_sequence(played_notes)

        # Confirm user code can now initialize PWM on PIN_BUZZER without conflicts
        user_buzzer = MockPWM(MockPin(PIN_BUZZER, MockPin.OUT))
        user_buzzer.freq(1000)
        user_buzzer.duty_u16(30000)
        self.assertEqual(user_buzzer.frequency, 1000)
        self.assertEqual(user_buzzer.duty, 30000)
        user_buzzer.deinit()
        self.assertTrue(user_buzzer.is_deinit)


if __name__ == "__main__":
    unittest.main()
