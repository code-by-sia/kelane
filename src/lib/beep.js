export function playBeep(duration = 200, frequency = 440, type = "sine") {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = type; // 'sine', 'square', 'sawtooth', 'triangle'
  oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();

  setTimeout(() => {
    oscillator.stop();
    audioCtx.close();
  }, duration);
}

export function playDoneMelody() {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const notes = [523.25, 659.25, 783.99];
  const startTime = audioCtx.currentTime;

  notes.forEach((freq, i) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.frequency.setValueAtTime(freq, startTime + i * 0.15);
    gain.gain.setValueAtTime(0.1, startTime + i * 0.15);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + i * 0.15 + 0.4);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(startTime + i * 0.15);
    osc.stop(startTime + i * 0.15 + 0.4);
  });
}
