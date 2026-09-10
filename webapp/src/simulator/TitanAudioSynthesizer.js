// Web Audio API Sound Synthesizer for LOF TITAN Buzzer (GPIO 20)

class TitanAudioSynthesizer {
  constructor() {
    this.audioCtx = null;
    this.isMuted = false;
    this.currentOsc = null;
    this.currentGain = null;
  }

  _initCtx() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (muted) {
      this.stop();
    }
  }

  playTone(frequency, durationMs = 200, type = 'square', gainValue = 0.12) {
    if (this.isMuted) return;
    try {
      this._initCtx();
      if (!this.audioCtx) return;

      this.stop();

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(gainValue, this.audioCtx.currentTime);
      // Smooth decay to prevent clicking
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + (durationMs / 1000));

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + (durationMs / 1000));

      this.currentOsc = osc;
      this.currentGain = gain;
    } catch (e) {
      console.warn("TitanAudioSynthesizer tone error:", e);
    }
  }

  startContinuousTone(frequency, type = 'square', gainValue = 0.1) {
    if (this.isMuted) return;
    try {
      this._initCtx();
      if (!this.audioCtx) return;

      this.stop();

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(gainValue, this.audioCtx.currentTime);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      this.currentOsc = osc;
      this.currentGain = gain;
    } catch (e) {
      console.warn("TitanAudioSynthesizer continuous tone error:", e);
    }
  }

  playMelody(toneName) {
    if (this.isMuted) return;
    this._initCtx();
    if (!this.audioCtx) return;

    switch (toneName?.toUpperCase()) {
      case 'STARTUP':
        // C5, E5, G5, C6 Fanfare
        this._playNotes([
          { freq: 523.25, dur: 90, pause: 20 },
          { freq: 659.25, dur: 90, pause: 20 },
          { freq: 783.99, dur: 110, pause: 20 },
          { freq: 1046.50, dur: 250, pause: 0 }
        ]);
        break;

      case 'RUN':
        // G5, B5, D6 Ascent
        this._playNotes([
          { freq: 783.99, dur: 80, pause: 15 },
          { freq: 987.77, dur: 80, pause: 15 },
          { freq: 1174.66, dur: 180, pause: 0 }
        ]);
        break;

      case 'CONNECTED':
        // C6, G6 Happy chime
        this._playNotes([
          { freq: 1046.50, dur: 100, pause: 30 },
          { freq: 1567.98, dur: 220, pause: 0 }
        ]);
        break;

      case 'DISCONNECTED':
        // G5, D#5 Downward
        this._playNotes([
          { freq: 783.99, dur: 120, pause: 30 },
          { freq: 622.25, dur: 250, pause: 0 }
        ]);
        break;

      case 'ERROR':
        // Low double buzz
        this._playNotes([
          { freq: 220.00, dur: 140, pause: 40 },
          { freq: 196.00, dur: 220, pause: 0 }
        ]);
        break;

      case 'BEEP':
      default:
        this.playTone(880, 80, 'sine', 0.15);
        break;
    }
  }

  _playNotes(notes) {
    let offset = 0;
    notes.forEach((note) => {
      setTimeout(() => {
        if (!this.isMuted) {
          this.playTone(note.freq, note.dur, 'square', 0.12);
        }
      }, offset);
      offset += note.dur + (note.pause || 0);
    });
  }

  stop() {
    try {
      if (this.currentOsc) {
        this.currentOsc.stop();
        this.currentOsc.disconnect();
        this.currentOsc = null;
      }
      if (this.currentGain) {
        this.currentGain.disconnect();
        this.currentGain = null;
      }
    } catch (e) {}
  }
}

export const titanAudio = new TitanAudioSynthesizer();
