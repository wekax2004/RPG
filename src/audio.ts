export class AudioController {
    private ctx: AudioContext;
    private masterGain: GainNode;
    private initialized: boolean = false;
    private bgmTimer: any = null;
    private noteIndex: number = 0;

    // A Minor Pentatonic: A3, C4, D4, E4, G4, A4
    private scale = [220, 261.63, 293.66, 329.63, 392.00, 440.00];

    constructor() {
        // Defer creating context until interaction if possible, 
        // but creating it suspended is usually fine.
        const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
        this.ctx = new AudioContextClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.3; // Master Volume
        this.masterGain.connect(this.ctx.destination);
    }

    async init() {
        if (this.initialized) return;
        if (this.ctx.state === 'suspended') {
            await this.ctx.resume();
        }
        this.initialized = true;
        this.startMusic();
    }

    startMusic() {
        if (this.bgmTimer) return;
        // Play a note every 400ms - 800ms
        const playNext = () => {
            if (!this.initialized) return;

            // Random chance to pause
            if (Math.random() > 0.3) {
                const note = this.scale[Math.floor(Math.random() * this.scale.length)];
                // Play softly
                this.playTone(note, 'triangle', 0.5, 0);
            }

            const delay = 400 + Math.random() * 600;
            this.bgmTimer = setTimeout(playNext, delay);
        };
        playNext();
    }

    stopMusic() {
        if (this.bgmTimer) {
            clearTimeout(this.bgmTimer);
            this.bgmTimer = null;
        }
    }

    playTone(freq: number, type: OscillatorType, duration: number, startTime: number = 0) {
        if (!this.initialized) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startTime);

        // Envelope
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime + startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + startTime + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(this.ctx.currentTime + startTime);
        osc.stop(this.ctx.currentTime + startTime + duration);
    }

    playNoise(duration: number) {
        if (!this.initialized) return;

        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.value = 1000;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        noise.connect(noiseFilter);
        noiseFilter.connect(gain);
        gain.connect(this.masterGain);

        noise.start();
    }

    // SFX Presets
    playAttack() {
        // High pitch sweep
        if (!this.initialized) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.frequency.setValueAtTime(400, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }

    playHit() {
        // Noise burst
        this.playNoise(0.1);
    }

    playCoin() {
        // Ding-Ding
        this.playTone(1200, 'sine', 0.1, 0);
        this.playTone(1800, 'square', 0.1, 0.1);
    }

    playLevelUp() {
        // Major Arpeggio
        const now = 0;
        this.playTone(440, 'square', 0.2, now);
        this.playTone(554, 'square', 0.2, now + 0.1);
        this.playTone(659, 'square', 0.4, now + 0.2);
    }
}
