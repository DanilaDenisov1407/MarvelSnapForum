const reels = ['reel1', 'reel2', 'reel3'];
let spinning = false;
let animationIds = []; // Для RAF
let positions = [0, 0, 0]; // Текущие позиции для каждого ролика
let isSpinning = [false, false, false]; // Флаг спина для каждого
let finalSymbols = [];
let baseSymbols = [];
let symbols = [];
let symbolHeight = 200; // Базовая высота (адаптивно)
let reelHeight = 0;
const POOL_SIZE = 20; // Пул карт для ускорения
let checkInterval; // Глобальный для clear

// Прелоад изображений
function preloadImages(urls) {
    return Promise.all(
        urls.map(url => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = resolve;
                img.onerror = () => resolve(); // Игнор ошибок для fallback
                img.src = url;
            });
        })
    );
}

// Инициализация: загрузка JSON, выбор пула 20, прелоад, добавление символов
async function initReels() {
    const btn = document.getElementById('spinBtn');
    try {
        const response = await fetch('Cards.json');
        if (!response.ok) throw new Error('JSON не найден');
        const jsonData = await response.json();
        
        // Выбор пула из 20 (если больше — случайный срез)
        const shuffled = jsonData.sort(() => 0.5 - Math.random());
        baseSymbols = shuffled.slice(0, POOL_SIZE);
        
        // Прелоад базовых изображений
        await preloadImages(baseSymbols);
        
        // Генерация symbols: 2 повторения для петли (меньше DOM-элементов, меньше лагов)
        symbols = [...baseSymbols, ...baseSymbols];
        symbolHeight = window.innerWidth < 480 ? 120 : (window.innerWidth < 768 ? 160 : 200);
        reelHeight = symbols.length * symbolHeight;

        reels.forEach((reelId, index) => {
            const reel = document.getElementById(reelId);
            reel.innerHTML = ''; // Очистка
            symbols.forEach(sym => {
                const symbolDiv = document.createElement('div');
                symbolDiv.className = 'symbol';
                const img = document.createElement('img');
                img.src = sym;
                img.alt = '';
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'contain';
                symbolDiv.appendChild(img);
                reel.appendChild(symbolDiv);
            });
            // Случайный стартовый символ (статичный, десинхронизируем)
            const initIndex = Math.floor(Math.random() * baseSymbols.length);
            positions[index] = - (initIndex * symbolHeight);
            reel.style.transform = `translateY(${positions[index]}px)`;
        });
        
        btn.disabled = false;
        btn.textContent = 'Крутить!';
    } catch (error) {
        console.error('Ошибка загрузки Cards.json:', error);
        // Fallback на эмодзи
        baseSymbols = ['🍋', '🍒', '🍊', '🍇', '🔔', '7️⃣'];
        symbols = [...baseSymbols, ...baseSymbols];
        symbolHeight = window.innerWidth < 480 ? 120 : (window.innerWidth < 768 ? 160 : 200);
        reelHeight = symbols.length * symbolHeight;
        
        reels.forEach((reelId, index) => {
            const reel = document.getElementById(reelId);
            reel.innerHTML = '';
            symbols.forEach(sym => {
                const symbolDiv = document.createElement('div');
                symbolDiv.className = 'symbol';
                symbolDiv.textContent = sym;
                reel.appendChild(symbolDiv);
            });
            const initIndex = Math.floor(Math.random() * baseSymbols.length);
            positions[index] = - (initIndex * symbolHeight);
            reel.style.transform = `translateY(${positions[index]}px)`;
        });
        
        btn.disabled = false;
        btn.textContent = 'Крутить!';
    }
}

// Анимация одного ролика с RAF (оптимизировано: smooth decel + снап с lerp)
function startReelAnimation(index) {
    const reel = document.getElementById(reels[index]);
    let lastTime = performance.now();
    let speed = 0;
    const accel = 100; // Ускорение
    const maxSpeed = 20; // Макс скорость (px per frame)
    const friction = 0.95; // Замедление (медленнее для smoothness)
    let snapped = false; // Флаг снапа
    let targetPos = 0; // Целевая позиция для lerp после decel

    function animate(currentTime) {
        const deltaTime = (currentTime - lastTime) / 16.67; // ~60fps
        lastTime = currentTime;

        if (!isSpinning[index]) {
            if (!snapped) {
                // Начало замедления: calc target
                const currentPosMod = Math.abs(positions[index]) % reelHeight;
                const snapIndex = Math.round(currentPosMod / symbolHeight);
                targetPos = - (snapIndex * symbolHeight);
                snapped = true; // Один раз
            }
            
            // Lerp к target для smooth снапа (вместо instant)
            const diff = targetPos - positions[index];
            if (Math.abs(diff) < 1) {
                positions[index] = targetPos;
                finalSymbols[index] = baseSymbols[snapIndex % baseSymbols.length];
                animationIds[index] = null;
                return;
            }
            positions[index] += diff * 0.1; // Lerp factor (smooth approach)
        } else {
            // Ускорение
            speed = Math.min(maxSpeed, speed + accel * deltaTime);
            snapped = false;
        }

        if (isSpinning[index]) {
            positions[index] -= speed;
        }

        // Петля
        while (positions[index] < -reelHeight) {
            positions[index] += reelHeight;
        }
        while (positions[index] > 0) {
            positions[index] -= reelHeight;
        }

        reel.style.transform = `translateY(${positions[index]}px)`;

        if ((isSpinning[index] || !snapped) && Math.abs(speed) > 0.1) {
            animationIds[index] = requestAnimationFrame(animate);
        }
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
    finalSymbols = []; // Reset всегда

    // Запуск анимации (десинхрон: разная начальная speed)
    reels.forEach((_, index) => {
        isSpinning[index] = true;
        positions[index] = 0;
        if (animationIds[index]) cancelAnimationFrame(animationIds[index]);
        startReelAnimation(index);
    });

    // Останавливаем по очереди
    setTimeout(() => stopReel(0), 800);
    setTimeout(() => stopReel(1), 1200);
    setTimeout(() => stopReel(2), 1600);
}

// Остановка конкретного ролика
function stopReel(index) {
    isSpinning[index] = false;
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
    // Шуточный результат
    const isWin = finalSymbols[0] === finalSymbols[1] && finalSymbols[1] === finalSymbols[2];
    const result = document.getElementById('result');
    result.textContent = isWin ? 'Выиграл! 🎉 (Шучу, попробуй ещё)' : 'Почти выиграл! 😅';
    spinning = false;
    if (checkInterval) {
        clearInterval(checkInterval);
        checkInterval = null;
    }
}

// События
document.getElementById('spinBtn').addEventListener('click', spin);

// Инициализация при загрузке
window.addEventListener('load', async () => {
    await initReels();
    // Проверка завершения спина (с force timeout)
    checkInterval = setInterval(() => {
        if (spinning) {
            const stoppedCount = finalSymbols.filter(s => s !== undefined).length;
            if (stoppedCount === 3) {
                finishSpin();
                return;
            }
            // Force finish если >4s (на всякий)
            if (Date.now() - spinStartTime > 4000) { // Добавь var spinStartTime = Date.now(); в spin()
                finishSpin();
            }
        }
    }, 100);
    
    // Адаптив: перезапуск init при ресайзе (редко)
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (!spinning) initReels();
        }, 250);
    });
});

// В spin() добавить: let spinStartTime = Date.now(); (глобально или внутри)
let spinStartTime; // Добавь в spin: spinStartTime = Date.now();

// Cleanup
window.addEventListener('beforeunload', stopAllAnimations);
