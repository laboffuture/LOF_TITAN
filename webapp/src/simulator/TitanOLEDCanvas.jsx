import React, { useEffect, useRef } from 'react';

/**
 * Ultra-Crisp High-DPI 128x64 OLED Display Emulator for LOF TITAN (I2C SDA: 7, SCL: 8)
 * Guarantees instantaneous repaints on every buffer update with razor-sharp typography.
 */
export function TitanOLEDCanvas({ displayState }) {
  const canvasRef = useRef(null);

  const oledW = 128;
  const oledH = 64;
  const pixelScale = 2; // High-DPI 2x supersampling (256x128)
  const canvasWidth = oledW * pixelScale;
  const canvasHeight = oledH * pixelScale;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Crisp pixel rendering without anti-aliased blur
    ctx.imageSmoothingEnabled = false;

    // Solid dark OLED background
    ctx.fillStyle = '#050a14';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Subtle OLED pixel matrix lines
    ctx.fillStyle = '#081224';
    for (let y = 0; y < canvasHeight; y += pixelScale) {
      ctx.fillRect(0, y, canvasWidth, 0.5);
    }
    for (let x = 0; x < canvasWidth; x += pixelScale) {
      ctx.fillRect(x, 0, 0.5, canvasHeight);
    }

    if (!displayState || !displayState.initialized) {
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('LOF TITAN OLED', 28, 55);
      ctx.fillStyle = '#334155';
      ctx.font = '10px monospace';
      ctx.fillText('I2C 0x3C STANDBY', 32, 80);
      return;
    }

    // 1. Draw custom pixel buffer
    if (displayState.pixels && displayState.pixels.length > 0) {
      ctx.fillStyle = '#38bdf8';
      for (const p of displayState.pixels) {
        if (p.col) {
          ctx.fillRect(p.x * pixelScale, p.y * pixelScale, pixelScale, pixelScale);
        }
      }
    }

    // 2. Draw stored text lines with crystal-sharp typography
    if (displayState.textLines && displayState.textLines.length > 0) {
      displayState.textLines.forEach((item) => {
        const size = item.size || 1;
        const fontPx = size === 1 ? 16 : size === 2 ? 28 : 42;
        
        ctx.font = `bold ${fontPx}px "Consolas", "Courier New", monospace`;
        ctx.fillStyle = item.color || '#38bdf8';
        
        const drawX = Math.round((item.x || 0) * pixelScale);
        const drawY = Math.round(((item.y || 0) * pixelScale) + fontPx - 2);
        
        ctx.fillText(String(item.text), drawX, drawY);
      });
    }

  }, [displayState, displayState?.textLines, displayState?.version]);

  return (
    <div className="w-full max-w-[240px] flex flex-col items-center bg-[#070b14] p-1.5 sm:p-2 rounded-xl border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
      {/* OLED Header Header */}
      <div className="flex items-center justify-between w-full mb-1 px-1 text-[9px] font-mono">
        <span className="font-bold text-cyan-400 flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${displayState?.initialized ? 'bg-cyan-400 shadow-[0_0_6px_#22d3ee]' : 'bg-gray-600'}`} />
          OLED 128x64
        </span>
        <span className="text-gray-400 text-[8px]">I2C 0x3C</span>
      </div>

      {/* Screen Frame */}
      <div className="relative w-full aspect-[2/1] bg-black rounded-lg border border-cyan-950/80 shadow-inner overflow-hidden flex items-center justify-center p-0.5">
        <canvas 
          ref={canvasRef} 
          width={canvasWidth} 
          height={canvasHeight}
          className="w-full h-full object-contain rounded block"
          style={{ imageRendering: 'pixelated' }}
        />
        {/* Subtle glass scanline gloss */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-transparent pointer-events-none rounded" />
      </div>
    </div>
  );
}
