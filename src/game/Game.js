import { Board } from './Board.js';
import { Renderer } from './Renderer.js';
import { InputHandler } from './InputHandler.js';
import { ScoreManager } from './ScoreManager.js';
import { SoundManager } from './SoundManager.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    // Game configuration
    this.config = {
      gridSize: 8,
      tileSize: 60,
      tileTypes: 6,
      initialMoves: 30,
      comboTimeWindow: 2000 // 2 seconds
    };
    
    // Initialize game components
    this.board = new Board(this.config.gridSize, this.config.tileTypes);
    this.renderer = new Renderer(this.ctx, this.config.tileSize);
    this.inputHandler = new InputHandler(canvas, this.config.tileSize);
    this.scoreManager = new ScoreManager();
    this.soundManager = new SoundManager();
    
    // Game state
    this.gameState = 'playing'; // 'playing', 'gameOver'
    this.movesLeft = this.config.initialMoves;
    this.selectedTile = null;
    this.animating = false;
    this.lastMatchTime = 0;
    
    // Bind event handlers
    this.setupEventHandlers();
    
    // Start game loop
    this.gameLoop();
  }
  
  setupEventHandlers() {
    this.inputHandler.onTileClick = (row, col) => {
      if (this.animating || this.gameState !== 'playing') return;
      
      this.handleTileClick(row, col);
    };
  }
  
  handleTileClick(row, col) {
    if (!this.selectedTile) {
      // Select first tile
      this.selectedTile = { row, col };
      this.renderer.setSelectedTile(row, col);
    } else {
      const { row: selectedRow, col: selectedCol } = this.selectedTile;
      
      if (row === selectedRow && col === selectedCol) {
        // Deselect if clicking the same tile
        this.selectedTile = null;
        this.renderer.setSelectedTile(null, null);
      } else if (this.isAdjacent(selectedRow, selectedCol, row, col)) {
        // Try to swap adjacent tiles
        this.attemptSwap(selectedRow, selectedCol, row, col);
      } else {
        // Select new tile
        this.selectedTile = { row, col };
        this.renderer.setSelectedTile(row, col);
      }
    }
  }
  
  isAdjacent(row1, col1, row2, col2) {
    const rowDiff = Math.abs(row1 - row2);
    const colDiff = Math.abs(col1 - col2);
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
  }
  
  async attemptSwap(row1, col1, row2, col2) {
    // Temporarily swap tiles to check for matches
    this.board.swapTiles(row1, col1, row2, col2);
    
    const matches = this.board.findMatches();
    
    if (matches.length > 0) {
      // Valid swap - proceed with animation and clearing
      this.animating = true;
      this.selectedTile = null;
      this.renderer.setSelectedTile(null, null);
      
      // Animate swap
      await this.renderer.animateSwap(row1, col1, row2, col2, this.board.grid);
      
      // Decrease moves
      this.movesLeft--;
      this.updateUI();
      
      // Process matches
      await this.processMatches();
      
      this.animating = false;
      
      // Check for game over
      this.checkGameOver();
    } else {
      // Invalid swap - revert and show feedback
      this.board.swapTiles(row1, col1, row2, col2); // Swap back
      this.selectedTile = null;
      this.renderer.setSelectedTile(null, null);
      
      // Show invalid move animation
      this.renderer.showInvalidMove(row1, col1, row2, col2);
      this.soundManager.playInvalidMove();
    }
  }
  
  async processMatches() {
    let totalMatches = 0;
    let comboMultiplier = 1;
    
    while (true) {
      const matches = this.board.findMatches();
      if (matches.length === 0) break;
      
      // Check for combo
      const currentTime = Date.now();
      if (currentTime - this.lastMatchTime < this.config.comboTimeWindow && totalMatches > 0) {
        comboMultiplier++;
      } else {
        comboMultiplier = 1;
      }
      
      this.lastMatchTime = currentTime;
      totalMatches += matches.length;
      
      // Calculate score
      const baseScore = matches.length * 10;
      const comboScore = baseScore * comboMultiplier;
      this.scoreManager.addScore(comboScore);
      this.scoreManager.setComboMultiplier(comboMultiplier);
      
      // Animate clearing matches
      await this.renderer.animateMatches(matches, this.board.grid);
      
      // Clear matches
      this.board.clearMatches(matches);
      
      // Drop tiles and fill empty spaces
      const drops = this.board.dropTiles();
      await this.renderer.animateDrops(drops, this.board.grid);
      
      this.board.fillEmptySpaces();
      
      // Play sound
      this.soundManager.playMatch(comboMultiplier);
      
      // Update UI
      this.updateUI();
    }
  }
  
  checkGameOver() {
    if (this.movesLeft <= 0 || !this.board.hasValidMoves()) {
      this.gameState = 'gameOver';
      this.showGameOver();
    }
  }
  
  showGameOver() {
    document.getElementById('finalScore').textContent = this.scoreManager.score;
    document.getElementById('gameOverModal').classList.remove('hidden');
  }
  
  newGame() {
    this.board = new Board(this.config.gridSize, this.config.tileTypes);
    this.scoreManager.reset();
    this.movesLeft = this.config.initialMoves;
    this.gameState = 'playing';
    this.selectedTile = null;
    this.animating = false;
    this.renderer.setSelectedTile(null, null);
    this.updateUI();
  }
  
  showHint() {
    if (this.animating || this.gameState !== 'playing') return;
    
    const hint = this.board.findValidMove();
    if (hint) {
      this.renderer.showHint(hint.row1, hint.col1, hint.row2, hint.col2);
    }
  }
  
  updateUI() {
    document.getElementById('score').textContent = this.scoreManager.score;
    document.getElementById('combo').textContent = `x${this.scoreManager.comboMultiplier}`;
    document.getElementById('moves').textContent = this.movesLeft;
    
    // Add pulse animation to score when it changes
    const scoreElement = document.getElementById('score');
    scoreElement.classList.add('pulse');
    setTimeout(() => scoreElement.classList.remove('pulse'), 600);
  }
  
  gameLoop() {
    this.renderer.render(this.board.grid);
    requestAnimationFrame(() => this.gameLoop());
  }
  
  start() {
    this.updateUI();
  }
}