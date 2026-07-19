import { journeyPhase, phaseProgress } from "@/lib/scroll/journey-camera";

const STORAGE_KEY = "kaamsetu-cinematic-sound";

type LayerHandle = {
  gain: GainNode;
  stop: () => void;
};

function actBlend(progress: number, phase: number, fade = 0.18) {
  const local = phaseProgress(progress, phase);
  const inFade = Math.min(1, local / fade);
  const outFade = Math.min(1, (1 - local) / fade);
  return Math.min(inFade, outFade);
}

export class JourneySoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private layers: LayerHandle[] = [];
  private enabled = false;
  private lastPhase = -1;
  private lastFixPlayed = false;
  private lastOtpPlayed = false;
  private dripTimer = 1.5;
  private stepTimer = 0.4;

  static readPreference(): boolean {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_KEY) === "1";
  }

  static savePreference(on: boolean) {
    localStorage.setItem(STORAGE_KEY, on ? "1" : "0");
  }

  async init() {
    if (this.ctx) return;
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new Ctx();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(this.ctx.destination);
    this.layers = this.buildLayers(this.ctx, this.master);
  }

  private buildLayers(ctx: AudioContext, dest: AudioNode): LayerHandle[] {
    const layers: LayerHandle[] = [];

    // Warm dusk drone — Act I / II
    {
      const gain = ctx.createGain();
      gain.gain.value = 0;
      gain.connect(dest);

      const osc1 = ctx.createOscillator();
      osc1.type = "sine";
      osc1.frequency.value = 82.41;
      const osc2 = ctx.createOscillator();
      osc2.type = "triangle";
      osc2.frequency.value = 123.47;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 420;

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      osc1.start();
      osc2.start();

      layers.push({
        gain,
        stop: () => {
          osc1.stop();
          osc2.stop();
        },
      });
    }

    // Night crickets — noise bursts Act I
    {
      const gain = ctx.createGain();
      gain.gain.value = 0;
      gain.connect(dest);

      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.35;

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const band = ctx.createBiquadFilter();
      band.type = "bandpass";
      band.frequency.value = 3200;
      band.Q.value = 8;

      noise.connect(band);
      band.connect(gain);
      noise.start();

      layers.push({ gain, stop: () => noise.stop() });
    }

    // Teal discovery pad — Act II
    {
      const gain = ctx.createGain();
      gain.gain.value = 0;
      gain.connect(dest);

      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = 220;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.08;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 6;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      osc.connect(gain);
      osc.start();
      lfo.start();

      layers.push({ gain, stop: () => { osc.stop(); lfo.stop(); } });
    }

    // Auto engine rumble — Act III
    {
      const gain = ctx.createGain();
      gain.gain.value = 0;
      gain.connect(dest);

      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.value = 52;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 180;

      const lfo = ctx.createOscillator();
      lfo.frequency.value = 12;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 18;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      osc.connect(filter);
      filter.connect(gain);
      osc.start();
      lfo.start();

      layers.push({ gain, stop: () => { osc.stop(); lfo.stop(); } });
    }

    // Resolve pad — Act IV / V
    {
      const gain = ctx.createGain();
      gain.gain.value = 0;
      gain.connect(dest);

      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.value = 174.61;
      osc.connect(gain);
      osc.start();

      layers.push({ gain, stop: () => osc.stop() });
    }

    return layers;
  }

  async setEnabled(on: boolean) {
    await this.init();
    if (!this.ctx || !this.master) return;

    this.enabled = on;
    JourneySoundEngine.savePreference(on);

    if (on && this.ctx.state === "suspended") {
      await this.ctx.resume();
    }

    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setTargetAtTime(on ? 0.32 : 0, now, 0.35);
  }

  isEnabled() {
    return this.enabled;
  }

  private playTone(freq: number, duration: number, volume: number, type: OscillatorType = "sine") {
    if (!this.ctx || !this.master || !this.enabled) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(now);
    osc.stop(now + duration + 0.05);
  }

  private playChime(notes: number[], gap = 0.1, volume = 0.08) {
    if (!this.ctx || !this.enabled) return;
    notes.forEach((freq, i) => {
      window.setTimeout(() => this.playTone(freq, 0.35, volume, "sine"), i * gap * 1000);
    });
  }

  private playDrip() {
    if (!this.ctx || !this.master || !this.enabled) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.08);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.06, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  private playBikeBell() {
    this.playTone(659.25, 0.06, 0.045, "sine");
    window.setTimeout(() => this.playTone(880, 0.1, 0.035, "sine"), 70);
  }

  update(progress: number, dt: number) {
    if (!this.ctx || !this.master || !this.enabled || this.layers.length < 5) return;

    const phase = journeyPhase(progress);
    const now = this.ctx.currentTime;

    // Layer volumes
    const drone = actBlend(progress, 0, 0.15) * 0.07 + actBlend(progress, 1, 0.12) * 0.04;
    const crickets = actBlend(progress, 0, 0.12) * 0.025;
    const discovery = actBlend(progress, 1, 0.14) * 0.05;
    const engine = actBlend(progress, 2, 0.12) * 0.035 * (0.6 + phaseProgress(progress, 2) * 0.4);
    const resolve = actBlend(progress, 3, 0.14) * 0.05 + actBlend(progress, 4, 0.16) * 0.06;

    const targets = [drone, crickets, discovery, engine, resolve];
    this.layers.forEach((layer, i) => {
      layer.gain.gain.setTargetAtTime(targets[i], now, 0.25);
    });

    // Random drips in Act I
    if (phase === 0 && actBlend(progress, 0, 0.2) > 0.2) {
      this.dripTimer -= dt;
      if (this.dripTimer <= 0) {
        this.playDrip();
        this.dripTimer = 1.4 + Math.random() * 2.2;
      }
    }

    // Phase transition chimes
    if (phase !== this.lastPhase && this.lastPhase >= 0) {
      const chimes: Record<number, number[]> = {
        1: [261.63, 329.63, 392],
        2: [440, 554.37],
        3: [349.23, 440, 523.25],
        4: [392, 493.88, 587.33, 659.25],
      };
      if (chimes[phase]) this.playChime(chimes[phase], 0.09, 0.07);
      if (phase === 2) this.playBikeBell();
    }
    this.lastPhase = phase;

    // OTP beep once in Act III
    if (phase === 2 && phaseProgress(progress, 2) > 0.25 && !this.lastOtpPlayed) {
      this.playTone(880, 0.06, 0.05);
      window.setTimeout(() => this.playTone(1174.66, 0.08, 0.04), 80);
      this.lastOtpPlayed = true;
    }

    // Fix chime when leak stops (~Act IV start)
    if (progress >= 0.68 && !this.lastFixPlayed) {
      this.playChime([523.25, 659.25, 783.99], 0.07, 0.08);
      this.lastFixPlayed = true;
    }

    // Footstep ticks in Act IV
    if (phase === 3) {
      const local = phaseProgress(progress, 3);
      this.stepTimer -= dt;
      if (this.stepTimer <= 0 && local > 0.05 && local < 0.85) {
        this.playTone(120 + Math.random() * 30, 0.05, 0.025, "triangle");
        this.stepTimer = 0.45;
      }
    }
  }

  dispose() {
    this.layers.forEach((l) => l.stop());
    this.layers = [];
    void this.ctx?.close();
    this.ctx = null;
    this.master = null;
    this.enabled = false;
    this.lastPhase = -1;
  }
}
