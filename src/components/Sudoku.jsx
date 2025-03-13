import React, { useState, useEffect } from 'react';
import './Sudoku.css';

const Sudoku = () => {
  const [board, setBoard] = useState([]);
  const [solution, setSolution] = useState([]);
  const [originalBoard, setOriginalBoard] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [hintsRemaining, setHintsRemaining] = useState(5);

  useEffect(() => {
    generateNewGame();
  }, []);

  useEffect(() => {
    let interval = null;
    if (timerRunning && !isComplete) {
      interval = setInterval(() => {
        setTimer(timer => timer + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerRunning, isComplete]);

  useEffect(() => {
    if (board.length === 0) return;
    
    let complete = true;
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (board[i][j] === 0) {
          complete = false;
          break;
        }
      }
      if (!complete) break;
    }
    
    if (complete) {
      setIsComplete(true);
      setTimerRunning(false);

      let correct = true;
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          if (board[i][j] !== solution[i][j]) {
            correct = false;
            break;
          }
        }
        if (!correct) break;
      }
      setIsCorrect(correct);
    }
  }, [board, solution]);

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const isValid = (board, row, col, num) => {
    for (let x = 0; x < 9; x++) {
      if (board[row][x] === num) {
        return false;
      }
    }

    for (let x = 0; x < 9; x++) {
      if (board[x][col] === num) {
        return false;
      }
    }

    let boxRow = Math.floor(row / 3) * 3;
    let boxCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[boxRow + i][boxCol + j] === num) {
          return false;
        }
      }
    }

    return true;
  };

  const solveSudoku = (board) => {
    const newBoard = board.map(row => [...row]);
    
    const solve = () => {
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (newBoard[row][col] === 0) {
            for (let num = 1; num <= 9; num++) {
              if (isValid(newBoard, row, col, num)) {
                newBoard[row][col] = num;
                
                if (solve()) {
                  return true;
                }
                
                newBoard[row][col] = 0;
              }
            }
            return false;
          }
        }
      }
      return true;
    };
    
    solve();
    return newBoard;
  };

  const generateNewGame = () => {
    const emptyBoard = Array(9).fill().map(() => Array(9).fill(0));

    for (let i = 0; i < 9; i += 3) {
      const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          emptyBoard[i + r][i + c] = nums[r * 3 + c];
        }
      }
    }
    
    const fullSolution = solveSudoku(emptyBoard);
    setSolution(fullSolution.map(row => [...row]));
    
    const playableBoard = fullSolution.map(row => [...row]);
    
    const removedCells = 45;
    let count = 0;
    
    while (count < removedCells) {
      const row = Math.floor(Math.random() * 9);
      const col = Math.floor(Math.random() * 9);
      
      if (playableBoard[row][col] !== 0) {
        playableBoard[row][col] = 0;
        count++;
      }
    }
    
    setBoard(playableBoard);
    setOriginalBoard(playableBoard.map(row => [...row]));
    setSelectedCell(null);
    setIsComplete(false);
    setIsCorrect(false);
    setTimer(0);
    setTimerRunning(true);
    setHintsRemaining(5);
  };

  const continueGame = () => {
    setIsComplete(false);
    setTimerRunning(true);
  };

  const handleCellClick = (row, col) => {
    if (originalBoard[row][col] === 0 && !isComplete) {
      setSelectedCell([row, col]);
    }
  };

  const handleNumberInput = (num) => {
    if (selectedCell && !isComplete) {
      const [row, col] = selectedCell;
      if (originalBoard[row][col] === 0) {
        const newBoard = [...board];
        newBoard[row][col] = num;
        setBoard(newBoard);
      }
    }
  };

  const handleBackspace = () => {
    if (selectedCell && !isComplete) {
      const [row, col] = selectedCell;
      if (originalBoard[row][col] === 0) {
        const newBoard = [...board];
        newBoard[row][col] = 0;
        setBoard(newBoard);
      }
    }
  };

  const giveHint = () => {
    if (isComplete || hintsRemaining <= 0) return;
    
    let emptyCells = [];
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (board[i][j] === 0 || board[i][j] !== solution[i][j]) {
          emptyCells.push([i, j]);
        }
      }
    }
    
    if (emptyCells.length > 0) {
      const randomIndex = Math.floor(Math.random() * emptyCells.length);
      const [row, col] = emptyCells[randomIndex];
      
      const newBoard = [...board];
      newBoard[row][col] = solution[row][col];
      setBoard(newBoard);
      setHintsRemaining(hintsRemaining - 1);
    }
  };

  const getCellClass = (row, col) => {
    const classes = ['cell'];
    
    if (selectedCell && selectedCell[0] === row && selectedCell[1] === col) {
      classes.push('selected');
    }
    
    if (selectedCell) {
      const [selRow, selCol] = selectedCell;
      if (selRow === row || selCol === col) {
        classes.push('highlighted');
      }
      
      const selBlockRow = Math.floor(selRow / 3);
      const selBlockCol = Math.floor(selCol / 3);
      const blockRow = Math.floor(row / 3);
      const blockCol = Math.floor(col / 3);
      
      if (selBlockRow === blockRow && selBlockCol === blockCol) {
        classes.push('highlighted');
      }
    }
    
    if (row % 3 === 0) classes.push('border-top');
    if (row % 3 === 2) classes.push('border-bottom');
    if (col % 3 === 0) classes.push('border-left');
    if (col % 3 === 2) classes.push('border-right');
    
    if (originalBoard[row][col] !== 0) {
      classes.push('original');
    } else if (board[row][col] !== 0) {
      classes.push('user-input');
    }
    
    return classes.join(' ');
  };

  return (
    <div className={`app ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <div className="header">
        <h1 className="title">
          <span className="sudoku-text">Sudoku</span> 
          <span className="by-text">
            by <a 
              href="https://github.com/CimanesDev" 
              target="_blank" 
              rel="noopener noreferrer"
              className="author-link"
            >
              CimanesDev
            </a>
          </span>
        </h1>
        
        <div className="toggle-container">
        </div>
      </div>
      
      <div className="game-info">
        <div className="timer">Time: {formatTime(timer)}</div>
        <button className="new-game-btn" onClick={generateNewGame}>New Game</button>
        <div className="hints-container">
          <button 
            className={`hint-btn ${hintsRemaining <= 0 ? 'disabled' : ''}`} 
            onClick={giveHint} 
            disabled={isComplete || hintsRemaining <= 0}
          >
            Give Hint ({hintsRemaining})
          </button>
        </div>
      </div>
      
      {isComplete && (
        <div className={`result-message ${isCorrect ? 'win' : 'lose'}`}>
          {isCorrect ? 'YOU WIN!' : 'YOU LOSE!'}
          {!isCorrect && (
            <div className="result-buttons">
              <button className="continue-btn" onClick={continueGame}>Continue</button>
              <button className="new-game-result-btn" onClick={generateNewGame}>New Game</button>
            </div>
          )}
        </div>
      )}
      
      <div className="sudoku-board">
        {board.map((row, rowIndex) => (
          <div key={`row-${rowIndex}`} className="row">
            {row.map((cell, colIndex) => (
              <div
                key={`cell-${rowIndex}-${colIndex}`}
                className={getCellClass(rowIndex, colIndex)}
                onClick={() => handleCellClick(rowIndex, colIndex)}
              >
                {cell !== 0 ? cell : ''}
              </div>
            ))}
          </div>
        ))}
      </div>
      
      <div className="number-pad">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button
            key={`num-${num}`}
            className="number-btn"
            onClick={() => handleNumberInput(num)}
            disabled={isComplete && isCorrect}
          >
            {num}
          </button>
        ))}
        <button
          className="number-btn backspace-btn"
          onClick={handleBackspace}
          disabled={isComplete && isCorrect}
        >
          Del
        </button>
      </div>
    </div>
  );
};

export default Sudoku;