export class ScoreManager {
  constructor() {
    this.score = 0;
    this.comboMultiplier = 1;
    this.highScore = this.loadHighScore();
  }
  
  addScore(points) {
    this.score += points;
    
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.saveHighScore();
    }
  }
  
  setComboMultiplier(multiplier) {
    this.comboMultiplier = multiplier;
  }
  
  reset() {
    this.score = 0;
    this.comboMultiplier = 1;
  }
  
  loadHighScore() {
    const saved = localStorage.getItem('match3-high-score');
    return saved ? parseInt(saved, 10) : 0;
  }
  
  saveHighScore() {
    localStorage.setItem('match3-high-score', this.highScore.toString());
  }
  
  getHighScore() {
    return this.highScore;
  }
}