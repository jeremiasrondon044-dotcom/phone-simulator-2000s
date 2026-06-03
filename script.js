// Variables globales
let phoneDisplay = '';
let inCall = false;
let callTimer = 0;
let callTimerInterval = null;
let gameActive = false;

// Elementos del DOM
const keypadButtons = document.querySelectorAll('.key');
const clearBtn = document.getElementById('clearBtn');
const callBtn = document.getElementById('callBtn');
const endBtn = document.getElementById('endBtn');
const callModal = document.getElementById('callModal');
const closeCallBtn = document.getElementById('closeCallBtn');
const gameModal = document.getElementById('gameModal');
const callNumberDisplay = document.getElementById('callNumber');
const callStatusDisplay = document.getElementById('callStatus');
const callTimerDisplay = document.getElementById('callTimer');
const snakeBtn = document.getElementById('snakeBtn');
const backGameBtn = document.getElementById('backGameBtn');
const snakeBackBtn = document.getElementById('snakeBackBtn');
const snakeCanvas = document.getElementById('snakeCanvas');
const snakeGameContainer = document.getElementById('snakeGameContainer');
const gameMenu = document.getElementById('gameMenu');
const softKey1 = document.getElementById('softKey1');
const softKey2 = document.getElementById('softKey2');
const mainDisplay = document.getElementById('mainDisplay');
const timeDisplay = document.getElementById('timeDisplay');

// Actualizar reloj
function updateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    timeDisplay.textContent = `${hours}:${minutes}`;
}

// Actualizar cada minuto
setInterval(updateTime, 60000);
updateTime();

// Event listeners para botones numéricos
keypadButtons.forEach(button => {
    button.addEventListener('click', () => {
        const value = button.dataset.value;
        if (phoneDisplay.length < 15) {
            phoneDisplay += value;
            updateDisplay();
        }
        playKeySound();
    });
});

// Teclas del teclado físico
document.addEventListener('keydown', (e) => {
    if (inCall) return;
    
    if (/[0-9]/.test(e.key)) {
        if (phoneDisplay.length < 15) {
            phoneDisplay += e.key;
            updateDisplay();
        }
        playKeySound();
    } else if (e.key === '*') {
        if (phoneDisplay.length < 15) {
            phoneDisplay += '*';
            updateDisplay();
        }
    } else if (e.key === '#') {
        if (phoneDisplay.length < 15) {
            phoneDisplay += '#';
            updateDisplay();
        }
    } else if (e.key === 'Backspace') {
        phoneDisplay = phoneDisplay.slice(0, -1);
        updateDisplay();
    } else if (e.key === 'Enter') {
        initiateCall();
    }
});

// Actualizar pantalla
function updateDisplay() {
    mainDisplay.innerHTML = `
        <div class="time-display" style="font-size: 24px; color: #000;">
            ${phoneDisplay || ''}
        </div>
    `;
}

// Botón borrar
clearBtn.addEventListener('click', () => {
    phoneDisplay = '';
    updateDisplay();
    playKeySound();
});

// Botón llamar
callBtn.addEventListener('click', initiateCall);

// Función para iniciar llamada
function initiateCall() {
    if (!phoneDisplay || inCall) return;
    
    inCall = true;
    callTimer = 0;
    callNumberDisplay.textContent = phoneDisplay;
    callModal.classList.remove('hidden');
    callStatusDisplay.textContent = 'Marcando...';
    playDialSound();
    
    // Simular proceso de marcado
    setTimeout(() => {
        if (inCall) {
            callStatusDisplay.textContent = 'Conectando...';
        }
    }, 1500);
    
    setTimeout(() => {
        if (inCall) {
            callStatusDisplay.textContent = 'Llamada conectada';
            startCallTimer();
        }
    }, 3000);
}

// Iniciar contador de llamada
function startCallTimer() {
    callTimerInterval = setInterval(() => {
        callTimer++;
        const minutes = Math.floor(callTimer / 60);
        const seconds = callTimer % 60;
        callTimerDisplay.textContent = 
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 1000);
}

// Botón colgar
closeCallBtn.addEventListener('click', endCall);
endBtn.addEventListener('click', endCall);

function endCall() {
    inCall = false;
    clearInterval(callTimerInterval);
    callTimer = 0;
    phoneDisplay = '';
    callModal.classList.add('hidden');
    updateDisplay();
    playHangupSound();
}

// Soft keys (botones de función)
softKey1.addEventListener('click', openGameMenu);
softKey2.addEventListener('click', () => {
    gameModal.classList.add('hidden');
    endGame();
});

function openGameMenu() {
    if (inCall) return;
    gameModal.classList.remove('hidden');
    gameMenu.style.display = 'flex';
}

// Botones del menú de juegos
snakeBtn.addEventListener('click', startSnakeGame);
backGameBtn.addEventListener('click', () => {
    gameModal.classList.add('hidden');
});

snakeBackBtn.addEventListener('click', () => {
    endSnakeGame();
    gameMenu.style.display = 'flex';
    snakeGameContainer.classList.add('hidden');
    snakeCanvas.classList.add('hidden');
});

// ============ JUEGO SNAKE ============

let snake = [{x: 10, y: 10}];
let food = {x: 15, y: 15};
let direction = {x: 1, y: 0};
let nextDirection = {x: 1, y: 0};
let score = 0;
let gameRunning = false;
let gameLoop = null;

const gridSize = 20;
const tileCount = 10;
const tileSize = 200 / tileCount;

function startSnakeGame() {
    gameMenu.style.display = 'none';
    snakeCanvas.classList.remove('hidden');
    snakeGameContainer.classList.remove('hidden');
    
    // Reiniciar juego
    snake = [{x: 5, y: 5}];
    food = generateFood();
    direction = {x: 1, y: 0};
    nextDirection = {x: 1, y: 0};
    score = 0;
    gameRunning = true;
    
    updateSnakeScore();
    startSnakeLoop();
    setupSnakeControls();
}

function generateFood() {
    return {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
}

function startSnakeLoop() {
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(updateSnakeGame, 150);
}

function updateSnakeGame() {
    if (!gameRunning) return;
    
    // Actualizar dirección
    direction = nextDirection;
    
    // Calcular nueva cabeza
    const head = {x: snake[0].x + direction.x, y: snake[0].y + direction.y};
    
    // Verificar colisiones con paredes
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        endSnakeGame();
        return;
    }
    
    // Verificar colisiones con el cuerpo
    for (let segment of snake) {
        if (head.x === segment.x && head.y === segment.y) {
            endSnakeGame();
            return;
        }
    }
    
    // Agregar cabeza
    snake.unshift(head);
    
    // Verificar comida
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        food = generateFood();
        updateSnakeScore();
    } else {
        snake.pop();
    }
    
    drawSnakeGame();
}

function drawSnakeGame() {
    const ctx = snakeCanvas.getContext('2d');
    
    // Limpiar canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, snakeCanvas.width, snakeCanvas.height);
    
    // Dibujar serpiente
    ctx.fillStyle = '#51cf66';
    for (let i = 0; i < snake.length; i++) {
        const segment = snake[i];
        ctx.fillRect(
            segment.x * tileSize,
            segment.y * tileSize,
            tileSize - 1,
            tileSize - 1
        );
    }
    
    // Dibujar cabeza con color diferente
    ctx.fillStyle = '#7cff66';
    ctx.fillRect(
        snake[0].x * tileSize,
        snake[0].y * tileSize,
        tileSize - 1,
        tileSize - 1
    );
    
    // Dibujar comida
    ctx.fillStyle = '#ff6b6b';
    ctx.fillRect(
        food.x * tileSize,
        food.y * tileSize,
        tileSize - 1,
        tileSize - 1
    );
}

function setupSnakeControls() {
    document.addEventListener('keydown', snakeKeyHandler);
}

function snakeKeyHandler(e) {
    if (!gameRunning) return;
    
    let newDir = null;
    
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        newDir = {x: 0, y: -1};
    } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        newDir = {x: 0, y: 1};
    } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        newDir = {x: -1, y: 0};
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        newDir = {x: 1, y: 0};
    }
    
    // Prevenir que la serpiente se devuelva sobre sí misma
    if (newDir && !(newDir.x === -direction.x && newDir.y === -direction.y)) {
        nextDirection = newDir;
    }
}

function updateSnakeScore() {
    document.getElementById('snakeScore').textContent = `Score: ${score}`;
}

function endSnakeGame() {
    gameRunning = false;
    clearInterval(gameLoop);
    document.removeEventListener('keydown', snakeKeyHandler);
    
    const ctx = snakeCanvas.getContext('2d');
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, snakeCanvas.width, snakeCanvas.height);
    
    ctx.fillStyle = '#ff6b6b';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', snakeCanvas.width / 2, snakeCanvas.height / 2 - 10);
    ctx.font = '12px Arial';
    ctx.fillText(`Score: ${score}`, snakeCanvas.width / 2, snakeCanvas.height / 2 + 10);
}

function endGame() {
    gameRunning = false;
    clearInterval(gameLoop);
    document.removeEventListener('keydown', snakeKeyHandler);
}

// ============ EFECTOS DE SONIDO (Simulados con console feedback) ============

function playKeySound() {
    // Simulación de sonido (comentado para evitar ruido)
    // console.log('🔊 Beep!');
}

function playDialSound() {
    // Simulación de sonido de marcado
    // console.log('📞 Dialing...');
}

function playHangupSound() {
    // Simulación de sonido de colgar
    // console.log('📴 Hung up!');
}

// Cerrar modales con ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (!callModal.classList.contains('hidden')) {
            endCall();
        }
        if (!gameModal.classList.contains('hidden')) {
            gameModal.classList.add('hidden');
            endGame();
        }
    }
});

// Inicialización
updateDisplay();
console.log('%c📱 Simulador de Teléfono 2000s Activado', 'color: #51cf66; font-size: 16px; font-weight: bold;');
