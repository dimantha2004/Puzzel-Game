export class InputHandler {
  constructor(canvas, tileSize) {
    this.canvas = canvas;
    this.tileSize = tileSize;
    this.onTileClick = null;
    
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    // Mouse events
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const col = Math.floor(x / this.tileSize);
      const row = Math.floor(y / this.tileSize);
      
      if (this.isValidPosition(row, col) && this.onTileClick) {
        this.onTileClick(row, col);
      }
    });
    
    // Touch events for mobile support
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      const col = Math.floor(x / this.tileSize);
      const row = Math.floor(y / this.tileSize);
      
      if (this.isValidPosition(row, col) && this.onTileClick) {
        this.onTileClick(row, col);
      }
    });
    
    // Prevent context menu on right click
    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
  }
  
  isValidPosition(row, col) {
    const gridSize = this.canvas.width / this.tileSize;
    return row >= 0 && row < gridSize && col >= 0 && col < gridSize;
  }
}