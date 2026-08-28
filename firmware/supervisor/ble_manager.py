"""
LOF TITAN BLE Manager & GATT Protocol Handler
Implements the official custom BLE GATT service, advertising, and JSON control channel.
"""

import json
import struct
import time
from .device_id import get_device_name, get_device_info_dict, get_device_id
from .led_buzzer import hw

try:
    import bluetooth
    from micropython import const
except ImportError:
    bluetooth = None
    const = lambda x: x

# GATT Service & Characteristic UUIDs (Stable 128-bit)
LOF_SERVICE_UUID = bluetooth.UUID("4c4f4600-7469-7461-6e00-000000000001") if bluetooth else None
UUID_CHAR_CONTROL = bluetooth.UUID("4c4f4601-7469-7461-6e00-000000000001") if bluetooth else None
UUID_CHAR_PROGRAM_DATA = bluetooth.UUID("4c4f4602-7469-7461-6e00-000000000001") if bluetooth else None
UUID_CHAR_STATUS = bluetooth.UUID("4c4f4603-7469-7461-6e00-000000000001") if bluetooth else None
UUID_CHAR_CONSOLE = bluetooth.UUID("4c4f4604-7469-7461-6e00-000000000001") if bluetooth else None
UUID_CHAR_DEVICE_INFO = bluetooth.UUID("4c4f4605-7469-7461-6e00-000000000001") if bluetooth else None

_IRQ_CENTRAL_CONNECT = const(1)
_IRQ_CENTRAL_DISCONNECT = const(2)
_IRQ_GATTS_WRITE = const(3)

# Flag definitions
_FLAG_READ = const(0x0002)
_FLAG_WRITE_NO_RESP = const(0x0004)
_FLAG_WRITE = const(0x0008)
_FLAG_NOTIFY = const(0x0010)


def create_advertising_payload(name, services=None):
    """Encodes GAP advertising payload and scan response.
    Main payload gets Flags + Name.
    Scan response gets the 128-bit Service UUIDs (to avoid 31-byte limit)."""
    adv_data = bytearray()
    
    # Flags: General Discoverable Mode (0x02) + BR/EDR Not Supported (0x04) = 0x06
    adv_data.extend(b"\x02\x01\x06")

    # Complete Local Name
    name_bytes = name.encode("utf-8")
    adv_data.append(len(name_bytes) + 1)
    adv_data.append(0x09)  # Complete local name type
    adv_data.extend(name_bytes)

    resp_data = bytearray()
    # 128-bit Service UUID
    if services:
        for s in services:
            b = bytes(s)
            resp_data.append(len(b) + 1)
            resp_data.append(0x07)  # Complete 128-bit Service UUIDs
            resp_data.extend(b)

    return adv_data, resp_data


try:
    import micropython
except ImportError:
    micropython = None


def schedule_tone(tone_func):
    """Schedules tone execution outside of BLE IRQ context to prevent memory errors."""
    if micropython and hasattr(micropython, "schedule"):
        try:
            micropython.schedule(lambda _: tone_func(), 0)
            return
        except Exception:
            pass
    try:
        tone_func()
    except Exception:
        pass


class BLEManager:
    def __init__(self, state_machine=None, runner=None):
        self.sm = state_machine
        self.runner = runner
        self.ble = None
        self.conn_handle = None
        self.is_connected = False
        self.is_client_ready = False
        self.handle_ctrl = None
        self.handle_prog_data = None
        self.handle_status = None
        self.handle_console = None
        self.handle_dev_info = None
        self._control_buffer = ""

        # Pre-allocated closures for micropython.schedule (zero heap allocation during BLE IRQs)
        self._sched_connect_tone = lambda _: hw.play_connect_tone()
        self._sched_disconnect_tone = lambda _: hw.play_disconnect_tone()
        self._sched_start_advertising = lambda _: self.start_advertising()
        self._sched_ctrl_write = lambda raw: self._handle_control_write(raw)
        self._sched_prog_data_write = lambda raw: self._handle_prog_data_write(raw)

        if bluetooth is not None:
            try:
                self.ble = bluetooth.BLE()
                self.ble.active(True)
                self.ble.irq(self._irq_handler)
                self._register_services()
                self.start_advertising()
            except Exception as e:
                print(f"[BLE] Init error: {e}")

    def _register_services(self):
        """Registers the LOF TITAN GATT Service and Characteristics."""
        service = (
            LOF_SERVICE_UUID,
            (
                (UUID_CHAR_CONTROL, _FLAG_WRITE | _FLAG_NOTIFY),
                (UUID_CHAR_PROGRAM_DATA, _FLAG_WRITE | _FLAG_WRITE_NO_RESP),
                (UUID_CHAR_STATUS, _FLAG_READ | _FLAG_NOTIFY),
                (UUID_CHAR_CONSOLE, _FLAG_NOTIFY),
                (UUID_CHAR_DEVICE_INFO, _FLAG_READ),
            ),
        )
        services = (service,)
        ((self.handle_ctrl, self.handle_prog_data, self.handle_status, self.handle_console, self.handle_dev_info),) = self.ble.gatts_register_services(services)

        # Increase characteristic buffer sizes to allow Long Writes (>20 bytes)
        try:
            self.ble.gatts_set_buffer(self.handle_ctrl, 512, True)
            self.ble.gatts_set_buffer(self.handle_prog_data, 512, True)
        except Exception as e:
            print(f"[BLE] Buffer resize error: {e}")

        # Set initial Device Info
        self.update_device_info()

    def start_advertising(self):
        """Starts advertising with name LOF_TITAN_XXXX."""
        if not self.ble:
            return

        name = get_device_name()
        adv_data, resp_data = create_advertising_payload(name, services=[LOF_SERVICE_UUID])
        try:
            self.ble.gap_advertise(100_000, adv_data=adv_data, resp_data=resp_data, connectable=True)
            print(f"[BLE] Advertising as {name}")
        except Exception as e:
            print(f"[BLE] Advertise error: {e}")

    def stop_advertising(self):
        if self.ble:
            try:
                self.ble.gap_advertise(None)
            except Exception:
                pass

    def _irq_handler(self, event, data):
        """BLE Event IRQ Dispatcher."""
        if event == _IRQ_CENTRAL_CONNECT:
            conn_handle, addr_type, addr = data
            self.conn_handle = conn_handle
            self.is_connected = True
            self.is_client_ready = False  # Wait for client to finish GATT discovery and send CONNECT
            hw.set_leds_connected()   # LED green ON + connect tone built-in
            print(f"[BLE] Connected (handle: {conn_handle})")
            if self.sm:
                self.sm.on_ble_connected()

        elif event == _IRQ_CENTRAL_DISCONNECT:
            conn_handle, addr_type, addr = data
            self.conn_handle = None
            self.is_connected = False
            self.is_client_ready = False
            hw.set_leds_disconnected()  # LED red ON + disconnect tone built-in
            print(f"[BLE] Disconnected (handle: {conn_handle})")
            if self.runner and self.runner.upload_in_progress:
                self.runner.cancel_upload()
            if micropython and hasattr(micropython, "schedule"):
                try:
                    micropython.schedule(self._sched_start_advertising, 0)
                except Exception:
                    self.start_advertising()
            else:
                self.start_advertising()
            if self.sm:
                self.sm.on_ble_disconnected()

        elif event == _IRQ_GATTS_WRITE:
            conn_handle, value_handle = data
            if value_handle == self.handle_ctrl:
                raw_bytes = self.ble.gatts_read(self.handle_ctrl)
                if micropython and hasattr(micropython, "schedule"):
                    try:
                        micropython.schedule(self._sched_ctrl_write, raw_bytes)
                    except Exception:
                        self._handle_control_write(raw_bytes)
                else:
                    self._handle_control_write(raw_bytes)
            elif value_handle == self.handle_prog_data:
                raw_bytes = self.ble.gatts_read(self.handle_prog_data)
                if micropython and hasattr(micropython, "schedule"):
                    try:
                        micropython.schedule(self._sched_prog_data_write, raw_bytes)
                    except Exception:
                        self._handle_prog_data_write(raw_bytes)
                else:
                    self._handle_prog_data_write(raw_bytes)

    def _handle_control_write(self, raw_bytes):
        """Processes JSON control commands with buffering for MTU fragmentation."""
        try:
            if isinstance(raw_bytes, str):
                chunk_str = raw_bytes
            elif isinstance(raw_bytes, (bytes, bytearray, memoryview)):
                chunk_str = bytes(raw_bytes).decode("utf-8")
            else:
                chunk_str = str(raw_bytes)

            if not chunk_str:
                return

            self._control_buffer += chunk_str

            try:
                msg = json.loads(self._control_buffer)
                self._control_buffer = ""  # Clear buffer on successful parse
            except Exception:
                # Incomplete JSON, wait for more chunks
                if len(self._control_buffer) > 512:
                    self._control_buffer = ""  # Safety clear
                return

            cmd = msg.get("cmd", "").upper()

            if self.sm and self.sm.startup_countdown_active:
                self.sm.auto_run_cancelled = True

            print(f"[CMD] {cmd}")

            if cmd == "STATUS":
                state = self.sm.current_state if self.sm else "CONNECTED_IDLE"
                self.send_status_response({"status": state})

            elif cmd == "CONNECT":
                self.is_client_ready = True
                hw.set_leds_connected()
                hw.play_connect_tone()
                if self.sm:
                    self.sm.on_ble_connected()
                self.send_status_response({"status": "CONNECTED_IDLE"})

            elif cmd == "DISCONNECT":
                self.is_client_ready = False
                hw.set_leds_disconnected()
                hw.play_disconnect_tone()
                if self.sm:
                    self.sm.on_ble_disconnected()
                conn = self.conn_handle
                if self.ble and conn is not None:
                    if micropython and hasattr(micropython, "schedule"):
                        try:
                            micropython.schedule(lambda _: self.ble.gap_disconnect(conn), 0)
                        except Exception:
                            try: self.ble.gap_disconnect(conn)
                            except Exception: pass
                    else:
                        try: self.ble.gap_disconnect(conn)
                        except Exception: pass

            elif cmd == "RUN":
                if self.sm:
                    self.sm.handle_run_command()

            elif cmd == "STOP":
                if self.sm:
                    self.sm.handle_stop_command()

            elif cmd == "RESET":
                self.send_status_response({"status": "RESETTING"})
                if self.sm:
                    self.sm.handle_reset_command()

            elif cmd == "PROGRAM":
                filename = msg.get("filename", "user.py")
                size = msg.get("size", 0)
                checksum = msg.get("checksum", "")
                if self.sm:
                    self.sm.handle_program_command(filename, size, checksum)

            elif cmd == "CHUNK":
                seq = msg.get("seq", 0)
                b64data = msg.get("data", "")
                if b64data and self.runner and self.runner.upload_in_progress:
                    import binascii
                    try:
                        chunk_bytes = binascii.a2b_base64(b64data.encode('utf-8'))
                        hw.set_leds_programming()
                        success, res = self.runner.write_chunk(seq, chunk_bytes)
                        if not success:
                            self.send_status_response({"status": "ERROR", "message": res})
                        else:
                            meta = self.runner.upload_meta
                            if meta["received_bytes"] >= meta["expected_size"]:
                                ok, finish_res = self.runner.finish_upload()
                                if ok:
                                    hw.set_leds_connected()
                                    if self.sm: self.sm.on_program_saved()
                                    self.send_status_response({"status": "PROGRAM_SAVED"})
                                else:
                                    hw.set_leds_error()
                                    if self.sm: self.sm.on_program_error(finish_res)
                                    self.send_status_response({"status": "ERROR", "message": finish_res})
                    except Exception as e:
                        self.send_status_response({"status": "ERROR", "message": f"Chunk error: {e}"})

            else:
                self.send_status_response({"status": "ERROR", "message": f"Unknown command: {cmd}"})

        except Exception as e:
            print(f"[BLE] Control parse error: {e}")
            self.send_status_response({"status": "ERROR", "message": str(e)})

    def _handle_prog_data_write(self, raw_bytes):
        """Processes chunked program upload data."""
        if not self.runner or not self.runner.upload_in_progress:
            return

        if len(raw_bytes) < 2:
            return

        # Big-endian 2-byte chunk sequence prefix: [seq (2B)] + [chunk_bytes]
        seq = (raw_bytes[0] << 8) | raw_bytes[1]
        data = raw_bytes[2:]

        # Toggle LED during transfer
        hw.set_leds_programming()

        success, res = self.runner.write_chunk(seq, data)
        if not success:
            self.send_status_response({"status": "ERROR", "message": res})
        else:
            # Check if all bytes received
            meta = self.runner.upload_meta
            if meta["received_bytes"] >= meta["expected_size"]:
                # Finish upload
                ok, finish_res = self.runner.finish_upload()
                if ok:
                    hw.set_leds_connected()
                    if self.sm:
                        self.sm.on_program_saved()
                    self.send_status_response({"status": "PROGRAM_SAVED"})
                else:
                    hw.set_leds_error()
                    if self.sm:
                        self.sm.on_program_error(finish_res)
                    self.send_status_response({"status": "ERROR", "message": finish_res})

    def send_status_response(self, response_dict):
        """Sends status response via CONTROL notification and STATUS characteristic."""
        if not self.is_client_ready and response_dict.get("status") != "CONNECTED_IDLE":
            return
        payload = json.dumps(response_dict).encode("utf-8")
        if self.ble and self.conn_handle is not None:
            try:
                if self.handle_ctrl:
                    self.ble.gatts_notify(self.conn_handle, self.handle_ctrl, payload)
                if self.handle_status:
                    self.ble.gatts_write(self.handle_status, payload)
                    self.ble.gatts_notify(self.conn_handle, self.handle_status, payload)
            except Exception as e:
                pass

    def send_console_output(self, text):
        """Streams console text to connected webapp via CONSOLE notification."""
        if not self.is_connected or self.conn_handle is None or not self.handle_console:
            return
        if self.ble:
            try:
                payload = text.encode("utf-8") if isinstance(text, str) else text
                # Chunk into max 128 bytes if needed
                for i in range(0, len(payload), 128):
                    chunk = payload[i:i+128]
                    self.ble.gatts_notify(self.conn_handle, self.handle_console, chunk)
            except Exception:
                pass

    def update_device_info(self):
        """Updates the read-only DEVICE_INFO characteristic."""
        if not self.ble or not self.handle_dev_info:
            return
        state = self.sm.current_state if self.sm else "CONNECTED_IDLE"
        has_prog = self.runner.has_valid_program() if self.runner else False
        info = get_device_info_dict(current_state=state, program_exists=has_prog)
        payload = json.dumps(info).encode("utf-8")
        try:
            self.ble.gatts_write(self.handle_dev_info, payload)
        except Exception:
            pass
