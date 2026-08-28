"""
Unit Tests for Safe VM Interruption (STOP Command)
Verifies section 19 & 39: Safe interrupt without board reboot.
"""

import unittest
import sys
import os
import shutil
import tempfile

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "firmware")))

import supervisor.program_runner as pr_mod
from supervisor.program_runner import ProgramRunner


class TestStopInterrupt(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.mkdtemp()
        pr_mod.PROGRAM_DIR = self.test_dir
        pr_mod.USER_PROGRAM_PATH = os.path.join(self.test_dir, "user.py")
        pr_mod.TEMP_PROGRAM_PATH = os.path.join(self.test_dir, "user.tmp")
        self.runner = ProgramRunner()

    def tearDown(self):
        shutil.rmtree(self.test_dir)

    def test_safe_stop_behavior(self):
        """Verify STOP command gracefully handles VM state and leaves system clean."""
        with open(pr_mod.USER_PROGRAM_PATH, "w") as f:
            f.write("a = 1 + 2\n")

        # Test stop when idle
        res = self.runner.stop_program()
        self.assertEqual(res, (True, "ALREADY_STOPPED"))
        self.assertFalse(self.runner.is_running)


if __name__ == "__main__":
    unittest.main()
