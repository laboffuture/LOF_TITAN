# LOF TITAN _boot.py
# Mounts VFS filesystem and launches the immutable supervisor service.

import gc
import vfs
from flashbdev import bdev

try:
    if bdev:
        vfs.mount(bdev, "/")
except OSError:
    import inisetup
    inisetup.setup()

gc.collect()

# Start the immutable LOF TITAN system supervisor
try:
    import supervisor
    supervisor.start_supervisor()
except Exception as e:
    print("[BOOT] Supervisor startup failed:", e)
