// Dynamic Web Audio synthesizer for Cookie Clicker sounds
let audioCtx: AudioContext | null = null;
let soundEnabled = true;

export function toggleSound(enabled: boolean) {
  soundEnabled = enabled;
}

export function isSoundEnabled() {
  return soundEnabled;
}

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// 1. Crisp pop/click sound
export function playClickSound() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine';
    // Fast frequency sweep down for a pop sound
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.08);

    gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch (e) {
    console.warn('Audio failed to play', e);
  }
}

// 2. Cookie Crunch sound
export function playCrunchSound() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    // Simulate crunch with short high-passed noise and low frequency thump
    const duration = 0.12;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + duration);

    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);

    // Add noise crunch
    const bufferSize = ctx.sampleRate * 0.06;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, ctx.currentTime);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.1, ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.06);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noise.start();
    noise.stop(ctx.currentTime + 0.06);
  } catch (e) {
    console.warn('Audio failed to play', e);
  }
}

// 3. Ding/Upgrade Sound
export function playUpgradeSound() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc1.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
    osc1.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); // G5
    osc1.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.24); // C6

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(261.63, ctx.currentTime); // C4
    osc2.frequency.exponentialRampToValueAtTime(523.25, ctx.currentTime + 0.4);

    gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start();
    osc2.start();

    osc1.stop(ctx.currentTime + 0.5);
    osc2.stop(ctx.currentTime + 0.5);
  } catch (e) {
    console.warn('Audio failed to play', e);
  }
}

// 4. Magical Golden Cookie spawn/click sound
export function playGoldenCookieSound() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Play a shiny magical arpeggio
    const notes = [587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51, 1567.98]; // D5, E5, G5, A5, C6, D6, E6, G6
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.05);
      
      gain.gain.setValueAtTime(0.0, now);
      gain.gain.linearRampToValueAtTime(0.08, now + index * 0.05 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.05 + 0.25);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + index * 0.05);
      osc.stop(now + index * 0.05 + 0.3);
    });
  } catch (e) {
    console.warn('Audio failed to play', e);
  }
}

// 5. Prestige Ascension Sound
export function playAscensionSound() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Soft, deep swell followed by bright ascending notes
    const oscMain = ctx.createOscillator();
    const gainMain = ctx.createGain();
    
    oscMain.type = 'sine';
    oscMain.frequency.setValueAtTime(130.81, now); // C3
    oscMain.frequency.exponentialRampToValueAtTime(523.25, now + 1.2); // Up to C5
    
    gainMain.gain.setValueAtTime(0.01, now);
    gainMain.gain.linearRampToValueAtTime(0.15, now + 0.6);
    gainMain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);
    
    oscMain.connect(gainMain);
    gainMain.connect(ctx.destination);
    
    oscMain.start(now);
    oscMain.stop(now + 1.2);
    
    // Celestial sparkles
    for (let i = 0; i < 12; i++) {
      const sparklesOsc = ctx.createOscillator();
      const sparklesGain = ctx.createGain();
      
      sparklesOsc.type = 'sine';
      const randomFreq = 800 + Math.random() * 1200;
      sparklesOsc.frequency.setValueAtTime(randomFreq, now + 0.3 + i * 0.08);
      
      sparklesGain.gain.setValueAtTime(0.0, now);
      sparklesGain.gain.linearRampToValueAtTime(0.04, now + 0.3 + i * 0.08 + 0.01);
      sparklesGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3 + i * 0.08 + 0.15);
      
      sparklesOsc.connect(sparklesGain);
      sparklesGain.connect(ctx.destination);
      
      sparklesOsc.start(now + 0.3 + i * 0.08);
      sparklesOsc.stop(now + 0.3 + i * 0.08 + 0.2);
    }
  } catch (e) {
    console.warn('Audio failed to play', e);
  }
}
