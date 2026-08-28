"""
Unit Tests for Atomic Program Upload and Verification
Verifies sections 11, 12, 13, 41, 42.
"""

import unittest
import sys
import os
import shutil
import tempfile

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "firmware")))

import supervisor.program_runner as pr_mod
from supervisor.program_runner import ProgramRunner


class TestAtomicUpload(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.mkdtemp()
        pr_mod.PROGRAM_DIR = self.test_dir
        pr_mod.USER_PROGRAM_PATH = os.path.join(self.test_dir, "user.py")
        pr_mod.TEMP_PROGRAM_PATH = os.path.join(self.test_dir, "user.tmp")
        pr_mod.BACKUP_PROGRAM_PATH = os.path.join(self.test_dir, "user.bak")
        pr_mod.METADATA_PATH = os.path.join(self.test_dir, "program.json")
        self.runner = ProgramRunner()

    def tearDown(self):
        shutil.rmtree(self.test_dir)

    def test_successful_atomic_upload(self):
        """Valid program upload is staged, checked, and promoted."""
        valid_code = "print('Hello from LOF TITAN')\na = 1 + 2\n"
        size = len(valid_code.encode("utf-8"))

        ok, msg = self.runner.start_upload("user.py", size, "TEST_CRC")
        self.assertTrue(ok)
        self.assertTrue(self.runner.upload_in_progress)

        # Write chunk
        ok, res = self.runner.write_chunk(0, valid_code.encode("utf-8"))
        self.assertTrue(ok)

        # Finish upload
        ok, status = self.runner.finish_upload()
        self.assertTrue(ok)
        self.assertEqual(status, "PROGRAM_SAVED")
        self.assertTrue(self.runner.has_valid_program())

        with open(pr_mod.USER_PROGRAM_PATH, "r") as f:
            self.assertEqual(f.read(), valid_code)

    def test_syntax_error_rejection(self):
        """Invalid Python syntax is rejected and old program is preserved."""
        # 1. Establish known good program
        good_code = "print('Known good code')\n"
        with open(pr_mod.USER_PROGRAM_PATH, "w") as f:
            f.write(good_code)

        # 2. Attempt uploading bad syntax
        bad_code = "while True\nprint('bad')\n"
        size = len(bad_code.encode("utf-8"))

        self.runner.start_upload("user.py", size, "BAD_CRC")
        self.runner.write_chunk(0, bad_code.encode("utf-8"))

        ok, err = self.runner.finish_upload()
        self.assertFalse(ok)
        self.assertIn("SyntaxError", err)

        # Temp file must be removed
        self.assertFalse(os.path.exists(pr_mod.TEMP_PROGRAM_PATH))

        # Old valid program must be intact
        with open(pr_mod.USER_PROGRAM_PATH, "r") as f:
            self.assertEqual(f.read(), good_code)

    def test_interrupted_upload_recovery(self):
        """Upload interrupted midway cleans up temp and keeps old program."""
        good_code = "print('Existing application')\n"
        with open(pr_mod.USER_PROGRAM_PATH, "w") as f:
            f.write(good_code)

        self.runner.start_upload("user.py", 1000, "INTERRUPTED")
        self.runner.write_chunk(0, b"partial data...")
        self.runner.cancel_upload()

        # Temp removed
        self.assertFalse(os.path.exists(pr_mod.TEMP_PROGRAM_PATH))
        self.assertFalse(self.runner.upload_in_progress)

        # Old code preserved
        with open(pr_mod.USER_PROGRAM_PATH, "r") as f:
            self.assertEqual(f.read(), good_code)


if __name__ == "__main__":
    unittest.main()
