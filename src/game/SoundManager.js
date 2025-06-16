export class SoundManager {
  constructor() {
    this.audioContext = null;
    this.enabled = true;
    
    
    this.initAudio();
  }
  
  initAudio() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported');
      this.enabled = false;
    }
  }
  
  playMatch(comboMultiplier = 1) {
    if (!this.enabled || !this.audioContext) return;
    
    
    const frequency = 440 + (comboMultiplier - 1) * 110; 
    this.playTone(frequency, 0.2, 'sine');
  }
  
  playInvalidMove() {
    if (!this.enabled || !this.audioContext) return;
    
    
    this.playTone(200, 0.3, 'sawtooth');
  }
  
  playTone(frequency, duration, waveType = 'sine') {
    if (!this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    oscillator.type = waveType;
    
    
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }
  
  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }
}