const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game configuration
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const GRAVITY = 0.5;
const JUMP_STRENGTH = -15;  // Increased from -10 to -15

canvas.width = GAME_WIDTH;
canvas.height = GAME_HEIGHT;

// Game state
const gameState = {
  score: 0,
  gameOver: false,
  difficulty: 1
};

// Player
const player = {
  x: 100,
  y: GAME_HEIGHT - 150,
  width: 60,
  height: 80,
  velocityY: 0,
  isJumping: false,
  color: '#8B4513'  // Brown color for monkey
};

// Bananas
const bananas = [];
const BANANA_SIZE = 30;

// Rocks
const rocks = [];
const ROCK_WIDTH = 50;
const ROCK_HEIGHT = 50;

// Input handling
const keys = {};
window.addEventListener('keydown', (e) => {
  keys[e.code] = true;
  if (e.code === 'Space' && !player.isJumping) {
    player.velocityY = JUMP_STRENGTH;
    player.isJumping = true;
  }
});
window.addEventListener('keyup', (e) => keys[e.code] = false);

// Spawn bananas
function spawnBanana() {
  bananas.push({
    x: GAME_WIDTH,
    y: Math.random() * (GAME_HEIGHT - 200),
    width: BANANA_SIZE,
    height: BANANA_SIZE
  });
}

// Spawn rocks
function spawnRock() {
  rocks.push({
    x: GAME_WIDTH,
    y: GAME_HEIGHT - ROCK_HEIGHT,
    width: ROCK_WIDTH,
    height: ROCK_HEIGHT
  });
}

// Collision detection
function checkCollision(rect1, rect2) {
  return rect1.x < rect2.x + rect2.width &&
         rect1.x + rect1.width > rect2.x &&
         rect1.y < rect2.y + rect2.height &&
         rect1.y + rect1.height > rect2.y;
}

function renderSmileyFace(x, y) {
  // Head
  ctx.beginPath();
  ctx.fillStyle = 'yellow';
  ctx.arc(x + player.width/2, y + player.height/2, 40, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.beginPath();
  ctx.fillStyle = 'black';
  ctx.arc(x + player.width/2 - 15, y + player.height/2 - 10, 5, 0, Math.PI * 2);
  ctx.arc(x + player.width/2 + 15, y + player.height/2 - 10, 5, 0, Math.PI * 2);
  ctx.fill();

  // Smile
  ctx.beginPath();
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 3;
  ctx.arc(x + player.width/2, y + player.height/2 + 10, 20, 0, Math.PI);
  ctx.stroke();
}

function update(deltaTime) {
  if (gameState.gameOver) return;

  // Player physics
  player.velocityY += GRAVITY;
  player.y += player.velocityY;

  // Ground collision
  if (player.y >= GAME_HEIGHT - player.height - 50) {
    player.y = GAME_HEIGHT - player.height - 50;
    player.velocityY = 0;
    player.isJumping = false;
  }

  // Spawn bananas and rocks
  if (Math.random() < 0.02) spawnBanana();
  if (Math.random() < 0.01) spawnRock();

  // Update banana and rock positions
  bananas.forEach((banana, index) => {
    banana.x -= 5 * gameState.difficulty;
    if (banana.x < -BANANA_SIZE) bananas.splice(index, 1);

    // Banana collection
    if (checkCollision(player, banana)) {
      bananas.splice(index, 1);
      gameState.score += 10;
      gameState.difficulty += 0.05;
    }
  });

  rocks.forEach((rock, index) => {
    rock.x -= 5 * gameState.difficulty;
    if (rock.x < -ROCK_WIDTH) rocks.splice(index, 1);

    // Rock collision
    if (checkCollision(player, rock)) {
      gameState.gameOver = true;
    }
  });
}

function render() {
  // Background
  ctx.fillStyle = '#87CEEB';  // Sky blue
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  // Ground
  ctx.fillStyle = '#228B22';  // Forest green
  ctx.fillRect(0, GAME_HEIGHT - 50, GAME_WIDTH, 50);

  // Player (Monkey)
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);
  renderSmileyFace(player.x, player.y);

  // Bananas
  bananas.forEach(banana => {
    ctx.fillStyle = '#FFD700';  // Gold
    ctx.fillRect(banana.x, banana.y, banana.width, banana.height);
  });

  // Rocks
  rocks.forEach(rock => {
    ctx.fillStyle = '#708090';  // Slate gray
    ctx.fillRect(rock.x, rock.y, rock.width, rock.height);
  });

  // Score and game over
  ctx.fillStyle = '#000';
  ctx.font = '24px Arial';
  ctx.fillText('Score: ' + gameState.score, 10, 30);

  if (gameState.gameOver) {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.fillStyle = '#fff';
    ctx.font = '48px Arial';
    ctx.fillText('Game Over!', GAME_WIDTH/2 - 120, GAME_HEIGHT/2);
    ctx.font = '24px Arial';
    ctx.fillText('Score: ' + gameState.score, GAME_WIDTH/2 - 50, GAME_HEIGHT/2 + 50);
  }
}

// Declare lastTime before gameLoop
let lastTime = 0;

function gameLoop(timestamp) {
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  update(deltaTime);
  render();

  requestAnimationFrame(gameLoop);
}

// Start the game
requestAnimationFrame(gameLoop);