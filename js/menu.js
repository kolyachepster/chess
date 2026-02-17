function showMainMenu() {
    document.getElementById('mainMenu').classList.remove('hidden');
    document.getElementById('aiMenu').classList.add('hidden');
    document.getElementById('gameContainer').classList.add('hidden');
    document.getElementById('gameOverModal').classList.add('hidden');
}

function showAIMenu() {
    document.getElementById('mainMenu').classList.add('hidden');
    document.getElementById('aiMenu').classList.remove('hidden');
}

function backToMainMenu() {
    document.getElementById('mainMenu').classList.remove('hidden');
    document.getElementById('aiMenu').classList.add('hidden');
}

function backToMainMenuFromModal() {
    document.getElementById('gameOverModal').classList.add('hidden');
    showMainMenu();
}

function startGame(mode, difficulty = null) {
    document.getElementById('mainMenu').classList.add('hidden');
    document.getElementById('aiMenu').classList.add('hidden');
    document.getElementById('gameContainer').classList.remove('hidden');
    document.getElementById('gameOverModal').classList.add('hidden');

    if (!game) {
        game = new ChessGame();
    }
    
    game.init(mode, difficulty);
}

function playAgain() {
    document.getElementById('gameOverModal').classList.add('hidden');
    if (game) {
        game.reset();
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    showMainMenu();
});