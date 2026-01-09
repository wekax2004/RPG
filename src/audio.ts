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

    /**
     * Play a sound with spatial positioning.
     * Volume decreases with distance, pans left/right based on position.
     * @param soundType - Type of sound effect to play
     * @param sourceX - X position of the sound source
     * @param sourceY - Y position of the sound source
     * @param playerX - X position of the player/listener
     * @param playerY - Y position of the player/listener
     */
    playSpatialSound(
        soundType: 'hit' | 'attack' | 'step' | 'coin' | 'death',
        sourceX: number,
        sourceY: number,
        playerX: number,
        playerY: number
    ) {
        if (!this.initialized) return;

        // Calculate distance
        const dx = sourceX - playerX;
        const dy = sourceY - playerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Distance-based volume (0-500px range)
        const maxDistance = 500;
        const volume = Math.max(0, 1 - (distance / maxDistance));
        if (volume <= 0) return; // Too far away

        // Stereo panning based on X difference (-1 left, +1 right)
        const maxPanDistance = 200;
        const pan = Math.max(-1, Math.min(1, dx / maxPanDistance));

        // Play the sound through spatial nodes
        this.playSpatialEffect(soundType, volume, pan);
    }

    /**
     * Internal: Play a sound with specified volume and pan.
     */
    private playSpatialEffect(soundType: 'hit' | 'attack' | 'step' | 'coin' | 'death', volume: number, pan: number) {
        const now = this.ctx.currentTime;

        // Create spatial nodes
        const gainNode = this.ctx.createGain();
        gainNode.gain.value = volume * 0.4; // Scale with master volume

        // Use StereoPannerNode for left/right positioning
        const pannerNode = this.ctx.createStereoPanner();
        pannerNode.pan.value = pan;

        // Connect: sound -> panner -> gain -> master
        gainNode.connect(this.masterGain);
        pannerNode.connect(gainNode);

        // Create the appropriate sound
        switch (soundType) {
            case 'hit':
                this.playSpatialNoiseBurst(pannerNode, 0.1);
                break;
            case 'attack':
                this.playSpatialSweep(pannerNode, 400, 100, 0.1);
                break;
            case 'step':
                this.playSpatialNoiseBurst(pannerNode, 0.05);
                break;
            case 'coin':
                this.playSpatialTone(pannerNode, 1200, 'sine', 0.1);
                break;
            case 'death':
                this.playSpatialSweep(pannerNode, 150, 30, 1.0);
                break;
        }
    }

    /**
     * Internal: Spatial noise burst (hit, step sounds).
     */
    private playSpatialNoiseBurst(destination: AudioNode, duration: number) {
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1000;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(destination);

        noise.start();
    }

    /**
     * Internal: Spatial frequency sweep (attack, death sounds).
     */
    private playSpatialSweep(destination: AudioNode, startFreq: number, endFreq: number, duration: number) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(endFreq, this.ctx.currentTime + duration);

        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    /**
     * Internal: Spatial tone (coin, pickup sounds).
     */
    private playSpatialTone(destination: AudioNode, freq: number, type: OscillatorType, duration: number) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
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

    playDeath() {
        if (!this.initialized) return;
        // Sad/Dark Descending Tone
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 1.5);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0, now + 1.5);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(now + 1.5);

        // Low Noise Thud
        this.playFootstep('stone'); // Re-use thud
    }
    // --- New Immersive Audio Methods ---

    playFootstep(material: 'grass' | 'stone' | 'wood') {
        if (!this.initialized) return;

        const now = this.ctx.currentTime;
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        // Create random noise burst
        const bufferSize = this.ctx.sampleRate * 0.1;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        // Shape based on material
        if (material === 'wood') {
            // Low thud
            filter.type = 'lowpass';
            filter.frequency.value = 200;
            filter.Q.value = 1;
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        } else if (material === 'stone') {
            // High click
            filter.type = 'highpass';
            filter.frequency.value = 1000;
            filter.Q.value = 0.5;
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        } else { // Grass
            // Soft noise
            filter.type = 'bandpass';
            filter.frequency.value = 600;
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.15);
        }

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        noise.start();
    }

    private currentAmbience: 'village' | 'crypt' | null = null;
    private ambienceNodes: AudioNode[] = [];

    setAmbience(type: 'village' | 'crypt') {
        if (this.currentAmbience === type) return;
        this.currentAmbience = type;
        this.stopAmbience();

        if (type === 'crypt') {
            // Scary Drone (Brown Noise-ish)
            this.startDrone();
        } else {
            // Restart standard BGM loop (Village)
            this.startMusic();
        }
    }

    private stopAmbience() {
        this.ambienceNodes.forEach(node => node.disconnect());
        this.ambienceNodes = [];
        this.stopMusic(); // Stop the melody loop if switching to Crypt
    }

    private startDrone() {
        if (!this.initialized) return;
        // Simple low frequency oscillator FM synthesis for "rumble"
        const osc = this.ctx.createOscillator();
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.value = 50; // Low rumble root

        lfo.type = 'sine';
        lfo.frequency.value = 0.2; // Slow modulation
        lfoGain.gain.value = 20; // Modulate pitch by +/- 20Hz

        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);

        filter.type = 'lowpass';
        filter.frequency.value = 120;

        gain.gain.value = 0.2; // Constant low volume

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        lfo.start();
        this.ambienceNodes.push(osc, lfo, lfoGain, gain, filter);
    }


    update(dt: number, listenerX: number, listenerY: number, emitters: { x: number, y: number }[]) {
        if (!this.initialized) return;

        // Emitter Logic (Torch Crackle)
        for (const e of emitters) {
            const dx = e.x - listenerX;
            const dy = e.y - listenerY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // If close, perform random crackle
            if (dist < 100 && Math.random() < 0.05) {
                this.playCrackle(1 - (dist / 100)); // Volume falls off with distance
            }
        }
    }

    private playCrackle(vol: number) {
        // Short high-pass noise burst
        const bufferSize = this.ctx.sampleRate * 0.05;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * vol;

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 2000;

        const gain = this.ctx.createGain();
        gain.gain.value = 0.1 * vol;
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        noise.start();
    }
}
