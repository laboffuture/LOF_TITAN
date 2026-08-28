# LOF TITAN System Boot Hook - MicroPython v1.28
# Mounts filesystem and starts the protected supervisor service

import gc

# MicroPython v1.28 uses 'vfs' module (not 'os.mount')
try:
    import vfs
    from flashbdev import bdev
    try:
        if bdev:
            vfs.mount(bdev, "/")
    except OSError:
        import inisetup
        inisetup.setup()
except Exception as e:
    print("[BOOT] VFS mount failed:", e)
    try:
        import inisetup
        inisetup.setup()
    except Exception as e2:
        print("[BOOT] inisetup failed:", e2)

gc.collect()

print("[BOOT] Filesystem mounted. Starting LOF TITAN supervisor...")

# Start the immutable LOF TITAN system supervisor
try:
    from supervisor.main_supervisor import start_supervisor
    start_supervisor()
except Exception as e:
    import sys
    print("[BOOT] Supervisor startup failed:", e)
    sys.print_exception(e)
