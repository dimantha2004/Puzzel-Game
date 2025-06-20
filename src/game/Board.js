export class Board {
  constructor(size, tileTypes) {
    this.size = size;
    this.tileTypes = tileTypes;
    this.grid = [];
    this.initializeGrid();
  }
  
  initializeGrid() {
    
    do {
      this.grid = [];
      for (let row = 0; row < this.size; row++) {
        this.grid[row] = [];
        for (let col = 0; col < this.size; col++) {
          this.grid[row][col] = this.getRandomTileType();
        }
      }
    } while (this.findMatches().length > 0);
  }
  
  getRandomTileType() {
    return Math.floor(Math.random() * this.tileTypes);
  }
  
  swapTiles(row1, col1, row2, col2) {
    const temp = this.grid[row1][col1];
    this.grid[row1][col1] = this.grid[row2][col2];
    this.grid[row2][col2] = temp;
  }
  
  findMatches() {
    const matches = new Set();
    
    
    for (let row = 0; row < this.size; row++) {
      let count = 1;
      let currentType = this.grid[row][0];
      
      for (let col = 1; col < this.size; col++) {
        if (this.grid[row][col] === currentType) {
          count++;
        } else {
          if (count >= 3) {
            for (let i = col - count; i < col; i++) {
              matches.add(`${row},${i}`);
            }
          }
          count = 1;
          currentType = this.grid[row][col];
        }
      }
      
      
      if (count >= 3) {
        for (let i = this.size - count; i < this.size; i++) {
          matches.add(`${row},${i}`);
        }
      }
    }
    
    
    for (let col = 0; col < this.size; col++) {
      let count = 1;
      let currentType = this.grid[0][col];
      
      for (let row = 1; row < this.size; row++) {
        if (this.grid[row][col] === currentType) {
          count++;
        } else {
          if (count >= 3) {
            for (let i = row - count; i < row; i++) {
              matches.add(`${i},${col}`);
            }
          }
          count = 1;
          currentType = this.grid[row][col];
        }
      }
      
      
      if (count >= 3) {
        for (let i = this.size - count; i < this.size; i++) {
          matches.add(`${i},${col}`);
        }
      }
    }
    
    
    return Array.from(matches).map(match => {
      const [row, col] = match.split(',').map(Number);
      return { row, col };
    });
  }
  
  clearMatches(matches) {
    matches.forEach(({ row, col }) => {
      this.grid[row][col] = null;
    });
  }
  
  dropTiles() {
    const drops = [];
    
    for (let col = 0; col < this.size; col++) {
      let writeIndex = this.size - 1;
      
      for (let row = this.size - 1; row >= 0; row--) {
        if (this.grid[row][col] !== null) {
          if (row !== writeIndex) {
            drops.push({
              fromRow: row,
              toRow: writeIndex,
              col: col,
              tileType: this.grid[row][col]
            });
            this.grid[writeIndex][col] = this.grid[row][col];
            this.grid[row][col] = null;
          }
          writeIndex--;
        }
      }
    }
    
    return drops;
  }
  
  fillEmptySpaces() {
    for (let col = 0; col < this.size; col++) {
      for (let row = 0; row < this.size; row++) {
        if (this.grid[row][col] === null) {
          this.grid[row][col] = this.getRandomTileType();
        }
      }
    }
  }
  
  hasValidMoves() {
    
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        
        if (col < this.size - 1) {
          this.swapTiles(row, col, row, col + 1);
          if (this.findMatches().length > 0) {
            this.swapTiles(row, col, row, col + 1); 
            return true;
          }
          this.swapTiles(row, col, row, col + 1); 
        }
        
        
        if (row < this.size - 1) {
          this.swapTiles(row, col, row + 1, col);
          if (this.findMatches().length > 0) {
            this.swapTiles(row, col, row + 1, col); 
            return true;
          }
          this.swapTiles(row, col, row + 1, col); 
        }
      }
    }
    
    return false;
  }
  
  findValidMove() {
    
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        
        if (col < this.size - 1) {
          this.swapTiles(row, col, row, col + 1);
          if (this.findMatches().length > 0) {
            this.swapTiles(row, col, row, col + 1); 
            return { row1: row, col1: col, row2: row, col2: col + 1 };
          }
          this.swapTiles(row, col, row, col + 1); 
        }
        
        
        if (row < this.size - 1) {
          this.swapTiles(row, col, row + 1, col);
          if (this.findMatches().length > 0) {
            this.swapTiles(row, col, row + 1, col); 
            return { row1: row, col1: col, row2: row + 1, col2: col };
          }
          this.swapTiles(row, col, row + 1, col); 
        }
      }
    }
    
    return null;
  }
}