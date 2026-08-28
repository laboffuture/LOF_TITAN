"""
LOF TITAN Universal OLED Driver (0.96" SSD1306 and 1.3" SH1106)
Zero external dependencies, built purely on MicroPython's core `framebuf` C-module.
"""
import framebuf
from machine import Pin, I2C

class TitanOLED(framebuf.FrameBuffer):
    def __init__(self, width=128, height=64, i2c=None, sda_pin=7, scl_pin=8, addr=0x3c, is_sh1106=True):
        self.width = width
        self.height = height
        self.addr = addr
        self.is_sh1106 = is_sh1106
        if i2c is not None:
            self.i2c = i2c
        else:
            self.i2c = I2C(0, sda=Pin(sda_pin), scl=Pin(scl_pin), freq=400000)
        self.pages = height // 8
        self.buffer = bytearray(self.pages * width)
        super().__init__(self.buffer, width, height, framebuf.MONO_VLSB)
        self.init_display()

    def write_cmd(self, cmd):
        try:
            self.i2c.writeto(self.addr, bytearray([0x80, cmd]))
        except Exception:
            pass

    def init_display(self):
        # Universal initialization sequence compatible with SSD1306 and SH1106
        init_cmds = (
            0xAE,        # Display OFF
            0x20, 0x00,  # Set Memory Addressing Mode (Horizontal)
            0x40,        # Set Start Line 0
            0xA1,        # Set Segment Re-map (column 127 is mapped to SEG0)
            0xC8,        # Set COM Output Scan Direction (remapped)
            0x81, 0xCF,  # Set Contrast Control
            0xA6,        # Set Normal Display (0xA7 for inverted)
            0xA8, 0x3F,  # Set Multiplex Ratio (1 to 64)
            0xD3, 0x00,  # Set Display Offset 0
            0xD5, 0x80,  # Set Display Clock Divide Ratio / Oscillator Frequency
            0xD9, 0xF1,  # Set Pre-charge Period
            0xDA, 0x12,  # Set COM Pins Hardware Configuration
            0xDB, 0x40,  # Set VCOMH Deselect Level
            0x8D, 0x14,  # Enable Charge Pump Regulator
            0xAF         # Display ON
        )
        for cmd in init_cmds:
            self.write_cmd(cmd)
        self.fill(0)
        self.show()

    def show(self):
        try:
            if self.is_sh1106:
                # 1.3 inch SH1106 page-by-page with 2-pixel column offset
                for page in range(self.pages):
                    self.write_cmd(0xB0 + page)
                    self.write_cmd(0x02) # column low nibble (2-pixel offset for SH1106 1.3")
                    self.write_cmd(0x10) # column high nibble
                    start = self.width * page
                    self.i2c.writeto(self.addr, b'\x40' + self.buffer[start:start + self.width])
            else:
                # 0.96 inch SSD1306 horizontal addressing
                self.write_cmd(0x21)
                self.write_cmd(0)
                self.write_cmd(self.width - 1)
                self.write_cmd(0x22)
                self.write_cmd(0)
                self.write_cmd(self.pages - 1)
                self.i2c.writeto(self.addr, b'\x40' + self.buffer)
        except Exception:
            pass

    def print_text(self, s, x, y, size=1, col=1):
        s = str(s)
        if size <= 1:
            super().text(s, x, y, col)
        else:
            _w = len(s) * 8
            _tmp = bytearray((_w * 8 + 7) // 8)
            _tb = framebuf.FrameBuffer(_tmp, _w, 8, framebuf.MONO_VLSB)
            _tb.fill(0)
            _tb.text(s, 0, 0, 1)
            for px in range(_w):
                for py in range(8):
                    if _tb.pixel(px, py):
                        for dx in range(size):
                            for dy in range(size):
                                if 0 <= x + px * size + dx < self.width and 0 <= y + py * size + dy < self.height:
                                    self.pixel(x + px * size + dx, y + py * size + dy, col)

def init_oled(width=128, height=64, sda=7, scl=8, is_sh1106=True):
    return TitanOLED(width=width, height=height, sda_pin=sda, scl_pin=scl, is_sh1106=is_sh1106)
