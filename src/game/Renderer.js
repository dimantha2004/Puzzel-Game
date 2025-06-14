export class Renderer {
  constructor(ctx, tileSize) {
    this.ctx = ctx;
    this.tileSize = tileSize;
    this.selectedRow = null;
    this.selectedCol = null;
    this.hintTiles = [];
    this.hintStartTime = 0;
    
    // Tile colors - accessibility-friendly palette
    this.tileColors = [
      '#FF6B6B', // Red
      '#4ECDC4', // Teal
      '#45B7D1', // Blue
      '#96CEB4', // Green
      '#FFEAA7', // Yellow
      '#DDA0DD'  // Purple
    ];
    
    // Animation properties
    this.animations = [];
  }
  
  render(grid) {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    
    // Draw grid background
    this.drawGridBackground();
    
    // Draw tiles
    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row].length; col++) {
        if (grid[row][col] !== null) {
          this.drawTile(row, col, grid[row][col]);
        }
      }
    }
    
    // Draw selection highlight
    if (this.selectedRow !== null && this.selectedCol !== null) {
      this.drawSelection(this.selectedRow, this.selectedCol);
    }
    
    // Draw hint highlight
    this.drawHints();
    
    // Update animations
    this.updateAnimations();
  }
  
  drawGridBackground() {
    this.ctx.fillStyle = '#f0f0f0';
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    
    // Draw grid lines
    this.ctx.strokeStyle = '#ddd';
    this.ctx.lineWidth = 1;
    
    const gridSize = this.ctx.canvas.width / this.tileSize;
    
    for (let i = 0; i <= gridSize; i++) {
      const pos = i * this.tileSize;
      
      // Vertical lines
      this.ctx.beginPath();
      this.ctx.moveTo(pos, 0);
      this.ctx.lineTo(pos, this.ctx.canvas.height);
      this.ctx.stroke();
      
      // Horizontal lines
      this.ctx.beginPath();
      this.ctx.moveTo(0, pos);
      this.ctx.lineTo(this.ctx.canvas.width, pos);
      this.ctx.stroke();
    }
  }
  
  drawTile(row, col, tileType) {
    const x = col * this.tileSize;
    const y = row * this.tileSize;
    const padding = 2;
    
    // Draw tile background
    this.ctx.fillStyle = this.tileColors[tileType];
    this.ctx.fillRect(x + padding, y + padding, this.tileSize - padding * 2, this.tileSize - padding * 2);
    
    // Draw tile border for depth
    this.ctx.strokeStyle = this.darkenColor(this.tileColors[tileType], 0.2);
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x + padding, y + padding, this.tileSize - padding * 2, this.tileSize - padding * 2);
    
    // Draw inner highlight for 3D effect
    this.ctx.fillStyle = this.lightenColor(this.tileColors[tileType], 0.3);
    this.ctx.fillRect(x + padding + 2, y + padding + 2, this.tileSize - padding * 2 - 4, 8);
    
    // Draw tile symbol/number
    this.ctx.fillStyle = '#333';
    this.ctx.font = 'bold 24px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(
      (tileType + 1).toString(),
      x + this.tileSize / 2,
      y + this.tileSize / 2
    );
  }
  
  drawSelection(row, col) {
    const x = col * this.tileSize;
    const y = row * this.tileSize;
    
    this.ctx.strokeStyle = '#FFD700';
    this.ctx.lineWidth = 4;
    this.ctx.strokeRect(x + 2, y + 2, this.tileSize - 4, this.tileSize - 4);
    
    // Add pulsing effect
    const time = Date.now() * 0.005;
    const alpha = 0.3 + 0.2 * Math.sin(time);
    this.ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
    this.ctx.fillRect(x + 2, y + 2, this.tileSize - 4, this.tileSize - 4);
  }
  
  drawHints() {
    if (this.hintTiles.length === 0) return;
    
    const elapsed = Date.now() - this.hintStartTime;
    if (elapsed > 3000) {
      this.hintTiles = [];
      return;
    }
    
    const alpha = 0.5 * (1 - elapsed / 3000);
    
    this.hintTiles.forEach(({ row, col }) => {
      const x = col * this.tileSize;
      const y = row * this.tileSize;
      
      this.ctx.strokeStyle = `rgba(0, 255, 0, ${alpha})`;
      this.ctx.lineWidth = 3;
      this.ctx.strokeRect(x + 1, y + 1, this.tileSize - 2, this.tileSize - 2);
    });
  }
  
  setSelectedTile(row, col) {
    this.selectedRow = row;
    this.selectedCol = col;
  }
  
  showHint(row1, col1, row2, col2) {
    this.hintTiles = [
      { row: row1, col: col1 },
      { row: row2, col: col2 }
    ];
    this.hintStartTime = Date.now();
  }
  
  async animateSwap(row1, col1, row2, col2, grid) {
    return new Promise(resolve => {
      const duration = 300;
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = this.easeInOutCubic(progress);
        
        if (progress >= 1) {
          resolve();
          return;
        }
        
        requestAnimationFrame(animate);
      };
      
      animate();
    });
  }
  
  async animateMatches(matches, grid) {
    return new Promise(resolve => {
      const duration = 400;
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Draw all tiles normally first
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.drawGridBackground();
        
        for (let row = 0; row < grid.length; row++) {
          for (let col = 0; col < grid[row].length; col++) {
            if (grid[row][col] !== null) {
              const isMatched = matches.some(m => m.row === row && m.col === col);
              
              if (isMatched) {
                // Animate matched tiles (scale down and fade)
                const scale = 1 - progress;
                const alpha = 1 - progress;
                
                this.ctx.save();
                this.ctx.globalAlpha = alpha;
                
                const x = col * this.tileSize + this.tileSize / 2;
                const y = row * this.tileSize + this.tileSize / 2;
                
                this.ctx.translate(x, y);
                this.ctx.scale(scale, scale);
                this.ctx.translate(-x, -y);
                
                this.drawTile(row, col, grid[row][col]);
                this.ctx.restore();
              } else {
                this.drawTile(row, col, grid[row][col]);
              }
            }
          }
        }
        
        if (progress >= 1) {
          resolve();
          return;
        }
        
        requestAnimationFrame(animate);
      };
      
      animate();
    });
  }
  
  async animateDrops(drops, grid) {
    if (drops.length === 0) return Promise.resolve();
    
    return new Promise(resolve => {
      const duration = 500;
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = this.easeInCubic(progress);
        
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.drawGridBackground();
        
        // Draw static tiles
        for (let row = 0; row < grid.length; row++) {
          for (let col = 0; col < grid[row].length; col++) {
            if (grid[row][col] !== null) {
              const isDropping = drops.some(d => d.col === col && (d.fromRow === row || d.toRow === row));
              if (!isDropping) {
                this.drawTile(row, col, grid[row][col]);
              }
            }
          }
        }
        
        // Draw dropping tiles
        drops.forEach(drop => {
          const startY = drop.fromRow * this.tileSize;
          const endY = drop.toRow * this.tileSize;
          const currentY = startY + (endY - startY) * easeProgress;
          
          const x = drop.col * this.tileSize;
          const padding = 2;
          
          // Draw tile at interpolated position
          this.ctx.fillStyle = this.tileColors[drop.tileType];
          this.ctx.fillRect(x + padding, currentY + padding, this.tileSize - padding * 2, this.tileSize - padding * 2);
          
          this.ctx.strokeStyle = this.darkenColor(this.tileColors[drop.tileType], 0.2);
          this.ctx.lineWidth = 2;
          this.ctx.strokeRect(x + padding, currentY + padding, this.tileSize - padding * 2, this.tileSize - padding * 2);
          
          this.ctx.fillStyle = this.lightenColor(this.tileColors[drop.tileType], 0.3);
          this.ctx.fillRect(x + padding + 2, currentY + padding + 2, this.tileSize - padding * 2 - 4, 8);
          
          this.ctx.fillStyle = '#333';
          this.ctx.font = 'bold 24px Arial';
          this.ctx.textAlign = 'center';
          this.ctx.textBaseline = 'middle';
          this.ctx.fillText(
            (drop.tileType + 1).toString(),
            x + this.tileSize / 2,
            currentY + this.tileSize / 2
          );
        });
        
        if (progress >= 1) {
          resolve();
          return;
        }
        
        requestAnimationFrame(animate);
      };
      
      animate();
    });
  }
  
  showInvalidMove(row1, col1, row2, col2) {
    // Add shake animation to both tiles
    const tiles = [
      { row: row1, col: col1 },
      { row: row2, col: col2 }
    ];
    
    const duration = 500;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      if (progress >= 1) return;
      
      // Simple shake effect
      const shakeAmount = 5 * (1 - progress);
      const shakeX = (Math.random() - 0.5) * shakeAmount;
      const shakeY = (Math.random() - 0.5) * shakeAmount;
      
      this.ctx.save();
      this.ctx.translate(shakeX, shakeY);
      
      // Redraw affected tiles with red tint
      tiles.forEach(({ row, col }) => {
        const x = col * this.tileSize;
        const y = row * this.tileSize;
        
        this.ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        this.ctx.fillRect(x, y, this.tileSize, this.tileSize);
      });
      
      this.ctx.restore();
      
      requestAnimationFrame(animate);
    };
    
    animate();
  }
  
  updateAnimations() {
    this.animations = this.animations.filter(animation => {
      const elapsed = Date.now() - animation.startTime;
      const progress = Math.min(elapsed / animation.duration, 1);
      
      animation.update(progress);
      
      return progress < 1;
    });
  }
  
  // Utility functions
  darkenColor(color, amount) {
    const hex = color.replace('#', '');
    const r = Math.max(0, parseInt(hex.substr(0, 2), 16) * (1 - amount));
    const g = Math.max(0, parseInt(hex.substr(2, 2), 16) * (1 - amount));
    const b = Math.max(0, parseInt(hex.substr(4, 2), 16) * (1 - amount));
    
    return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
  }
  
  lightenColor(color, amount) {
    const hex = color.replace('#', '');
    const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + (255 - parseInt(hex.substr(0, 2), 16)) * amount);
    const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + (255 - parseInt(hex.substr(2, 2), 16)) * amount);
    const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + (255 - parseInt(hex.substr(4, 2), 16)) * amount);
    
    return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
  }
  
  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
  
  easeInCubic(t) {
    return t * t * t;
  }
}