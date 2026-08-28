# LOF TITAN Board Manifest
# Does NOT include the base manifest to avoid _boot.py redefinition conflict.
# (The base manifest calls freeze("$(PORT_DIR)/modules") which includes the stock
# _boot.py. Our modules/ directory also has a custom _boot.py, which causes a
# duplicate symbol error at compile time.)
#
# Instead, we manually require the same libraries the base manifest includes.

# asyncio
include("$(MPY_DIR)/extmod/asyncio")

# Networking bundle
require("bundle-networking")

# Commonly used micropython-lib packages (same as base manifest.py)
require("aioespnow")
require("dht")
require("ds18x20")
require("neopixel")
require("onewire")
require("umqtt.robust")
require("umqtt.simple")
require("upysh")

# Freeze stock modules explicitly to avoid missing flashbdev/inisetup, but EXCLUDE _boot.py
freeze("$(PORT_DIR)/modules", ("apa106.py", "espnow.py", "flashbdev.py", "inisetup.py", "machine.py"))

# Freeze the LOF TITAN modules: custom _boot.py + supervisor package
freeze("$(BOARD_DIR)/modules")
