import { levels } from './levels.js';
import { bonus } from './bonus.js'; 

document.addEventListener("DOMContentLoaded", function() {
  let currentLevel = 'level1';
  let currentRow = 13;
  let currentCol = 0;
  let movementsEnabled = true;
  let lastRow = null;
  let lastCol = null;
  let bonusCounter = 0; 
  let goalReached = false;  

  const container = document.getElementById("grid-container");
  const cells = [];

  // Inicializar el juego
  function initializeGame() {
    for (let i = 0; i < 14 * 14; i++) {
      const cell = document.createElement("div");
      cell.classList.add("grid-cell");
      cells.push(cell);
      container.appendChild(cell);
    }

    const goalIndex = 0 * 14 + 13; 
    cells[goalIndex].classList.add("goal");

    cells[currentRow * 14 + currentCol].classList.add("head");

    addObstacles(levels[currentLevel]);
    addBonus(bonus[currentLevel]);  

    const resetButton = document.getElementById("reset-button");
    const prevLevelButton = document.getElementById("prev-button");
    const nextLevelButton = document.getElementById("next-button");

    resetButton.disabled = true;
    prevLevelButton.disabled = true;
    nextLevelButton.disabled = true;

    resetButton.addEventListener("click", resetGrid);
    prevLevelButton.addEventListener("click", previousLevel);
    nextLevelButton.addEventListener("click", nextLevel);

    document.addEventListener("keydown", handleKeyDown);

    updateBonusCounter(); 
  }

  function addBonus(bonusCoordinates) {
    bonusCoordinates.forEach(([row, col]) => {
      if (row >= 0 && row < 14 && col >= 0 && col < 14) {
        const index = row * 14 + col;
        if (!cells[index].classList.contains("goal")) {
          cells[index].classList.add("bonus");
        }
      }
    });
  }

  function addObstacles(obstacleCoordinates) {
    obstacleCoordinates.forEach(([row, col]) => {
      if (row >= 0 && row < 14 && col >= 0 && col < 14) {
        const index = row * 14 + col;
        if (!cells[index].classList.contains("goal")) {
          cells[index].classList.add("obstacle");
        }
      }
    });
  }

  function resetGrid() {
    cells.forEach(cell => {
      cell.classList.remove("head", "obstacle", "bonus");
    });
  
    const goalIndex = 0 * 14 + 13; 
    cells[goalIndex].classList.add("goal");
  
    currentRow = 13;
    currentCol = 0;
    cells[currentRow * 14 + currentCol].classList.add("head");
  
    movementsEnabled = true;
    lastRow = null;
    lastCol = null;
    bonusCounter = 0;
    goalReached = false; 

    addObstacles(levels[currentLevel]);
    addBonus(bonus[currentLevel]);
    checkPossibleMoves();
    
    document.getElementById("reset-button").disabled = false;
    document.getElementById("prev-button").disabled = true;
    document.getElementById("next-button").disabled = true;

    updateBonusCounter(); 
  }

  function enableButtons() {
    document.getElementById("reset-button").disabled = false;
    document.getElementById("prev-button").disabled = false;
    document.getElementById("next-button").disabled = false;
  }

  function checkPossibleMoves() {
    if (goalReached) return;  

    const possibleMoves = [
      [currentRow - 1, currentCol],
      [currentRow + 1, currentCol],
      [currentRow, currentCol - 1],
      [currentRow, currentCol + 1]
    ];

    let noMoves = true;

    for (const move of possibleMoves) {
      const [row, col] = move;
      if (
        row >= 0 && row < 14 && col >= 0 && col < 14 &&
        !cells[row * 14 + col].classList.contains("head") &&
        !cells[row * 14 + col].classList.contains("obstacle") &&
        !cells[row * 14 + col].classList.contains("goal")
      ) {
        noMoves = false;
        break;
      }
    }

    const resetButton = document.getElementById("reset-button");
    if (noMoves) {
      alert("No hay movimientos posibles");
      movementsEnabled = false;
      resetButton.classList.add("enabled");
      document.getElementById("reset-button").disabled = false;
    } else {
      resetButton.classList.remove("enabled");
    }
    
    const goalIndex = 0 * 14 + 13; 
    const goalRow = Math.floor(goalIndex / 14);
    const goalCol = goalIndex % 14;

    const adjacentCells = [
      [goalRow - 0, goalCol],
      [goalRow + 0, goalCol],
      [goalRow, goalCol - 0],
      [goalRow, goalCol + 0]
    ];

    adjacentCells.forEach(([row, col]) => {
      if (row === currentRow && col === currentCol && !goalReached) {
        alert("¡Has llegado cerca del objetivo!");
        goalReached = true;
        movementsEnabled = false;
        const totalBonus = bonus[currentLevel].length;
        let stars = 1;

        if (bonusCounter === totalBonus) {
          stars = 3;
        } else if (bonusCounter === totalBonus - 1) {
          stars = 2;
        }

        alert(`Has obtenido ${stars} estrellas`);

        enableButtons();
        resetButton.classList.add("enabled");
      }
    });
  }

  function handleKeyDown(event) {
    if (!movementsEnabled) return;

    let newRow = currentRow;
    let newCol = currentCol;

    switch (event.key) {
      case "ArrowUp":
        newRow = currentRow > 0 ? currentRow - 1 : currentRow;
        break;
      case "ArrowDown":
        newRow = currentRow < 13 ? currentRow + 1 : currentRow;
        break;
      case "ArrowLeft":
        newCol = currentCol > 0 ? currentCol - 1 : currentCol;
        break;
      case "ArrowRight":
        newCol = currentCol < 13 ? currentCol + 1 : currentCol;
        break;
    }

    if (
      !cells[newRow * 14 + newCol].classList.contains("head") &&
      !cells[newRow * 14 + newCol].classList.contains("obstacle")
    ) {
      if (cells[newRow * 14 + newCol].classList.contains("bonus")) {
        bonusCounter++; 
        updateBonusCounter();  
      }

      cells[newRow * 14 + newCol].classList.remove("bonus"); 
      cells[newRow * 14 + newCol].classList.add("head");
      lastRow = currentRow;
      lastCol = currentCol;
      currentRow = newRow;
      currentCol = newCol;
    } else if (lastRow !== null && lastCol !== null) {
      let oppositeMove = false;
      switch (event.key) {
        case "ArrowUp":
          if (currentRow === lastRow + 1 && currentCol === lastCol) {
            oppositeMove = true;
          }
          break;
        case "ArrowDown":
          if (currentRow === lastRow - 1 && currentCol === lastCol) {
            oppositeMove = true;
          }
          break;
        case "ArrowLeft":
          if (currentCol === lastCol + 1 && currentRow === lastRow) {
            oppositeMove = true;
          }
          break;
        case "ArrowRight":
          if (currentCol === lastCol - 1 && currentRow === lastRow) {
            oppositeMove = true;
          }
          break;
      }

      if (oppositeMove) {
        cells[currentRow * 14 + currentCol].classList.remove("head");
        currentRow = lastRow;
        currentCol = lastCol;
        lastRow = null;
        lastCol = null;
      }
    }

    checkPossibleMoves();
  }

  function updateBonusCounter() {
    const counterElement = document.getElementById("bonus-counter");
  }

  function previousLevel() {
    console.log("Botón de nivel anterior presionado");
    let levelIndex = Object.keys(levels).indexOf(currentLevel);
    if (levelIndex > 0) {
      currentLevel = Object.keys(levels)[levelIndex - 1];
      resetGrid();
    }
  }

  function nextLevel() {
    console.log("Botón de nivel siguiente presionado");
    let levelIndex = Object.keys(levels).indexOf(currentLevel);
    if (levelIndex < Object.keys(levels).length - 1) {
      currentLevel = Object.keys(levels)[levelIndex + 1];
      resetGrid();
    }
  }

  initializeGame();
});
