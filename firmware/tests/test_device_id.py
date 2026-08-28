"""
Unit Tests for Device Identity and Naming
Verifies section 35: Dynamic MAC to LOF_TITAN_XXXX naming.
"""

import unittest
import sys
import os

# Add supervisor to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "firmware")))

from supervisor.device_id import get_mac_string, get_device_id, get_device_name, get_device_info_dict
import supervisor.device_id as dev_id_mod


class TestDeviceIdentity(unittest.TestCase):
    def setUp(self):
        dev_id_mod._cached_mac_bytes = None
        dev_id_mod._cached_mac_str = None
        dev_id_mod._cached_device_id = None
        dev_id_mod._cached_device_name = None

    def test_mac_naming_example_1(self):
        """Test with MAC A0:FE:12:34:56:78 -> LOF_TITAN_A0FE"""
        dev_id_mod._cached_mac_bytes = bytes([0xA0, 0xFE, 0x12, 0x34, 0x56, 0x78])
        self.assertEqual(get_device_id(), "A0FE")
        self.assertEqual(get_device_name(), "LOF_TITAN_A0FE")
        self.assertEqual(get_mac_string(), "A0:FE:12:34:56:78")

    def test_mac_naming_example_2(self):
        """Test with MAC DC:54:75:11:22:33 -> LOF_TITAN_DC54"""
        dev_id_mod._cached_mac_bytes = bytes([0xDC, 0x54, 0x75, 0x11, 0x22, 0x33])
        self.assertEqual(get_device_id(), "DC54")
        self.assertEqual(get_device_name(), "LOF_TITAN_DC54")
        self.assertEqual(get_mac_string(), "DC:54:75:11:22:33")

    def test_mac_naming_example_3(self):
        """Test with MAC 7C:DF:A1:B2:C3:D4 -> LOF_TITAN_7CDF"""
        dev_id_mod._cached_mac_bytes = bytes([0x7C, 0xDF, 0xA1, 0xB2, 0xC3, 0xD4])
        self.assertEqual(get_device_id(), "7CDF")
        self.assertEqual(get_device_name(), "LOF_TITAN_7CDF")

    def test_device_info_dict(self):
        """Test DEVICE_INFO endpoint dictionary structure"""
        dev_id_mod._cached_mac_bytes = bytes([0xA0, 0xFE, 0x12, 0x34, 0x56, 0x78])
        info = get_device_info_dict(current_state="CONNECTED_IDLE", program_exists=True)
        self.assertEqual(info["product"], "LOF TITAN")
        self.assertEqual(info["device_name"], "LOF_TITAN_A0FE")
        self.assertEqual(info["device_id"], "A0FE")
        self.assertEqual(info["chip"], "ESP32-S3")
        self.assertEqual(info["flash_mb"], 16)
        self.assertEqual(info["psram_mb"], 8)
        self.assertTrue(info["program_exists"])


if __name__ == "__main__":
    unittest.main()
