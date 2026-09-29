// Web Audio API synthesizer for IMD / NDMA Severe Weather Warning Siren and Thunder Rumble
class SoundEffects {
  private ctx: AudioContext | null = null;
  private isSirenPlaying = false;
  private sirenOsc1: OscillatorNode | null = null;
  private sirenOsc2: OscillatorNode | null = null;
  private sirenGain: GainNode | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play realistic dual-tone NDMA / IMD emergency disaster warning siren
  playSiren(durationSeconds = 3) {
    try {
      this.initCtx();
      if (!this.ctx) return;

      if (this.isSirenPlaying) {
        this.stopSiren();
      }

      this.isSirenPlaying = true;
      const now = this.ctx.currentTime;

      // Master gain
      this.sirenGain = this.ctx.createGain();
      this.sirenGain.gain.setValueAtTime(0.01, now);
      this.sirenGain.gain.exponentialRampToValueAtTime(0.18, now + 0.2);
      this.sirenGain.gain.exponentialRampToValueAtTime(0.001, now + durationSeconds);
      this.sirenGain.connect(this.ctx.destination);

      // Low oscillator (440Hz ~ 880Hz warble)
      this.sirenOsc1 = this.ctx.createOscillator();
      this.sirenOsc1.type = 'sawtooth';
      
      // High oscillator (455Hz for chorusing dissonance)
      this.sirenOsc2 = this.ctx.createOscillator();
      this.sirenOsc2.type = 'sine';

      // Modulate frequency
      for (let t = 0; t < durationSeconds; t += 0.5) {
        this.sirenOsc1.frequency.setValueAtTime(550, now + t);
        this.sirenOsc1.frequency.exponentialRampToValueAtTime(880, now + t + 0.25);
        this.sirenOsc1.frequency.exponentialRampToValueAtTime(550, now + t + 0.5);

        this.sirenOsc2.frequency.setValueAtTime(560, now + t);
        this.sirenOsc2.frequency.exponentialRampToValueAtTime(895, now + t + 0.25);
        this.sirenOsc2.frequency.exponentialRampToValueAtTime(560, now + t + 0.5);
      }

      this.sirenOsc1.connect(this.sirenGain);
      this.sirenOsc2.connect(this.sirenGain);

      this.sirenOsc1.start(now);
      this.sirenOsc2.start(now);

      this.sirenOsc1.stop(now + durationSeconds);
      this.sirenOsc2.stop(now + durationSeconds);

      setTimeout(() => {
        this.isSirenPlaying = false;
      }, durationSeconds * 1000);
    } catch (e) {
      console.warn('Audio siren playback not allowed or not supported:', e);
    }
  }

  // Play realistic deep acoustic thunder rumble
  playThunder() {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 2.5; // 2.5 seconds
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Generate brownian/pink noise
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5; // gain
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      // Lowpass filter for deep thunder bass
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, now);
      filter.frequency.exponentialRampToValueAtTime(60, now + 2.5);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.exponentialRampToValueAtTime(0.28, now + 0.08); // sharp lightning strike peak
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.4);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + 2.5);
    } catch (e) {
      console.warn('Audio thunder playback error:', e);
    }
  }

  stopSiren() {
    try {
      if (this.sirenGain && this.ctx) {
        this.sirenGain.gain.setValueAtTime(0, this.ctx.currentTime);
      }
      this.isSirenPlaying = false;
    } catch {
      // ignore
    }
  }
}

export const soundEffects = new SoundEffects();
