const reels = ['reel1', 'reel2', 'reel3'];
let spinning = false;
let animationIds = []; // Для RAF
let positions = [0, 0, 0]; // Текущие позиции для каждого ролика
let isSpinning = [false, false, false]; // Флаг спина для каждого
let finalSymbols = [];
let baseSymbols = [];
let symbols = [];
let symbolHeight = 100;
let reelHeight = 0;

// Инициализация: загрузка JSON, добавление символов и случайный старт
async function initReels() {
    try {
        const response = await fetch('Cards.json');
        const jsonData = await response.json();
        baseSymbols = jsonData;
        symbols = [...jsonData, ...jsonData, ...jsonData, ...jsonData]; // 24 для петли (предполагая ~6 базовых)
        symbolHeight = window.innerWidth < 480 ? 80 : 100;
        reelHeight = symbols.length * symbolHeight;

        reels.forEach((reelId, index) => {
            const reel = document.getElementById(reelId);
            symbols.forEach(sym => {
                const symbolDiv = document.createElement('div');
                symbolDiv.className = 'symbol';
                symbolDiv.innerHTML = `<img src="${sym}" alt="" style="width:100%; height:100%; object-fit:contain;">`;
                reel.appendChild(symbolDiv);
            });
            // Случайный стартовый символ (статичный, десинхронизируем)
            const initIndex = Math.floor(Math.random() * baseSymbols.length);
            positions[index] = - (initIndex * symbolHeight);
            reel.style.transform = `translateY(${positions[index]}px)`;
        });
    } catch (error) {
        console.error('Ошибка загрузки Cards.json:', error);
        // Fallback на эмодзи, если JSON не загрузился
        baseSymbols = ['🍋', '🍒', '🍊', '🍇', '🔔', '7️⃣'];
        symbols = [...baseSymbols, ...baseSymbols, ...baseSymbols, ...baseSymbols];
        // ... (повторить init с textContent вместо innerHTML)
    }
}

// Анимация одного ролика с RAF (плавная, без дёрганий)
function startReelAnimation(index) {
    const reel = document.getElementById(reels[index]);
    let lastTime = 0;
    let speed = 0; // Начальная скорость 0
    const accel = 50; // Ускорение px/ms (adjusted)
    const maxSpeed = 800; // Макс скорость px/ms

    function animate(currentTime) {
        if (!isSpinning[index]) {
            // Остановка: замедление и снап
            speed *= 0.95; // Фрикшн
            if (Math.abs(speed) < 1) {
                // Снап к ближайшему символу
                const snapIndex = Math.round(Math.abs(positions[index]) / symbolHeight) % baseSymbols.length;
                positions[index] = - (snapIndex * symbolHeight);
                reel.style.transform = `translateY(${positions[index]}px)`;
                finalSymbols[index] = baseSymbols[snapIndex];
                return;
            }
        } else {
            // Ускорение во время спина
            speed = Math.min(maxSpeed, speed + accel * (currentTime - lastTime) / 1000);
        }

        positions[index] -= speed * (currentTime - lastTime) / 16; // ~60fps normalize
        positions[index] = positions[index] % -reelHeight; // Петля (отриц для up)
        if (positions[index] > 0) positions[index] -= reelHeight; // Fix wrap

        reel.style.transform = `translateY(${positions[index]}px)`;

        lastTime = currentTime;
        animationIds[index] = requestAnimationFrame(animate);
    }

    animationIds[index] = requestAnimationFrame(animate);
}

// Запуск спина
function spin() {
    if (spinning) return;
    spinning = true;
    const btn = document.getElementById('spinBtn');
    const result = document.getElementById('result');
    
    btn.disabled = true;
    btn.textContent = 'Крутит...';
    result.textContent = '';
    finalSymbols = [];

    // Запуск анимации для всех (с десинхрон: разная начальная скорость/pos)
    reels.forEach((_, index) => {
        isSpinning[index] = true;
        positions[index] = 0; // Сброс для синхронного старта
        if (animationIds[index]) cancelAnimationFrame(animationIds[index]);
        startReelAnimation(index);
    });

    // Останавливаем по очереди (с задержками)
    setTimeout(() => stopReel(0), 1000);
    setTimeout(() => stopReel(1), 1600);
    setTimeout(() => stopReel(2), 2200);
}

// Остановка конкретного ролика
function stopReel(index) {
    isSpinning[index] = false;
    // Анимация сама замедлится и снапнется в RAF loop
}

// Очистка анимаций
function stopAllAnimations() {
    reels.forEach((_, index) => {
        isSpinning[index] = false;
        if (animationIds[index]) {
            cancelAnimationFrame(animationIds[index]);
        }
    });
}

// Завершение спина
function finishSpin() {
    stopAllAnimations();
    const btn = document.getElementById('spinBtn');
    btn.disabled = false;
    btn.textContent = 'Крутить!';
    // Шуточный результат (сравниваем URL для выигрыша)
    const isWin = finalSymbols[0] === finalSymbols[1] && finalSymbols[1] === finalSymbols[2];
    const result = document.getElementById('result');
    result.textContent = isWin ? 'Выиграл! 🎉 (Шучу, попробуй ещё)' : 'Почти выиграл! 😅';
    spinning = false;
}

// События
document.getElementById('spinBtn').addEventListener('click', spin);

// Инициализация при загрузке
window.addEventListener('load', async () => {
    await initReels();
    // Завершить спин через макс время (на всякий)
    setInterval(() => {
        if (spinning) {
            const stoppedCount = finalSymbols.filter(s => s !== undefined).length;
            if (stoppedCount === 3) {
                finishSpin();
            }
        }
    }, 100);
});

// Cleanup on unload
window.addEventListener('beforeunload', stopAllAnimations);
