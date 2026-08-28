"""
LOF TITAN Hardware Identity & Runtime Device Naming
Derives a deterministic, unique device name (LOF_TITAN_XXXX) from the ESP32-S3 Bluetooth MAC address.
"""

import sys
import gc

try:
    import machine
    import ubinascii
except ImportError:
    import binascii as ubinascii
    machine = None

FIRMWARE_VERSION = "1.0.0"
MICROPYTHON_VERSION = ".".join(str(x) for x in sys.implementation.version[:3]) if hasattr(sys, "implementation") else "1.24.1"
CHIP_NAME = "ESP32-S3"
FLASH_SIZE_MB = 16
PSRAM_SIZE_MB = 8
PRODUCT_NAME = "LOF TITAN"

_cached_mac_bytes = None
_cached_mac_str = None
_cached_device_id = None
_cached_device_name = None


def get_mac_bytes():
    """Reads the 6-byte hardware MAC address."""
    global _cached_mac_bytes
    if _cached_mac_bytes is not None:
        return _cached_mac_bytes

    if machine is not None and hasattr(machine, "unique_id"):
        raw = machine.unique_id()
        if len(raw) >= 6:
            _cached_mac_bytes = raw[:6]
        else:
            # Pad if needed
            _cached_mac_bytes = raw + bytes(6 - len(raw))
    else:
        # Fallback for host testing / simulation
        _cached_mac_bytes = bytes([0xA0, 0xFE, 0x12, 0x34, 0x56, 0x78])

    return _cached_mac_bytes


def get_mac_string():
    """Returns formatted MAC string, e.g. 'A0:FE:12:34:56:78'."""
    global _cached_mac_str
    if _cached_mac_str is None:
        mac = get_mac_bytes()
        _cached_mac_str = ":".join(f"{b:02X}" for b in mac)
    return _cached_mac_str


def get_device_id():
    """Returns the 4 uppercase hex character suffix derived from last 2 MAC bytes, e.g. '5678'."""
    global _cached_device_id
    if _cached_device_id is None:
        mac = get_mac_bytes()
        _cached_device_id = f"{mac[-2]:02X}{mac[-1]:02X}".upper()
    return _cached_device_id


def get_device_name():
    """Returns the full GAP device name, e.g. 'LOF_TITAN_A0FE'."""
    global _cached_device_name
    if _cached_device_name is None:
        _cached_device_name = f"LOF_TITAN_{get_device_id()}"
    return _cached_device_name


def print_startup_banner():
    """Prints the official diagnostic boot banner to serial console."""
    mac_str = get_mac_string()
    dev_id = get_device_id()
    dev_name = get_device_name()

    print("================================")
    print("LOF TITAN")
    print(f"Firmware {FIRMWARE_VERSION}")
    print("================================")
    print(f"Chip        : {CHIP_NAME}")
    print(f"Flash       : {FLASH_SIZE_MB} MB")
    print(f"PSRAM       : {PSRAM_SIZE_MB} MB")
    print(f"BLE MAC     : {mac_str}")
    print(f"Device ID   : {dev_id}")
    print(f"Device Name : {dev_name}")
    print(f"BLE         : READY")
    print("================================")


def get_device_info_dict(current_state="CONNECTED_IDLE", program_exists=False):
    """Generates the dictionary returned by the DEVICE_INFO BLE endpoint."""
    return {
        "product": PRODUCT_NAME,
        "device_name": get_device_name(),
        "device_id": get_device_id(),
        "ble_mac": get_mac_string(),
        "chip": CHIP_NAME,
        "flash_mb": FLASH_SIZE_MB,
        "psram_mb": PSRAM_SIZE_MB,
        "firmware": FIRMWARE_VERSION,
        "micropython": MICROPYTHON_VERSION,
        "state": current_state,
        "program_exists": bool(program_exists),
        "free_ram_bytes": gc.mem_free() if hasattr(gc, "mem_free") else 0
    }
