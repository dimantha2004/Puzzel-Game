import '../style.css';
import { Game } from './game/Game.js';

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  const game = new Game(canvas);
  
  // Start the game
  game.start();
  
  // Set up event listeners for UI buttons
  document.getElementById('newGameBtn').addEventListener('click', () => {
    game.newGame();
  });
  
  document.getElementById('hintBtn').addEventListener('click', () => {
    game.showHint();
  });
  
  document.getElementById('playAgainBtn').addEventListener('click', () => {
    game.newGame();
    document.getElementById('gameOverModal').classList.add('hidden');
  });
});