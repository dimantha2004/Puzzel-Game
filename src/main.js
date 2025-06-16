import '../style.css';
import { Game } from './game/Game.js';


document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  const game = new Game(canvas);
  
  
  game.start();
  
  
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