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

// Анимация одного ролика с RAF (оптимизировано: меньше вычислений)
function startReelAnimation(index) {
    const reel = document.getElementById(reels[index]);
    let lastTime = performance.now();
    let speed = 0;
    const accel = 100; // Ускорение (px per frame approx)
    const maxSpeed = 20; // Макс скорость (px per frame, для плавности)
    const friction = 0.92; // Замедление

    function animate(currentTime) {
        const deltaTime = (currentTime - lastTime) / 16.67; // Нормализация ~60fps
        lastTime = currentTime;

        if (!isSpinning[index]) {
            // Замедление и снап
            speed *= friction;
            if (Math.abs(speed) < 0.5) {
                // Снап к ближайшему символу
                let currentPos = Math.abs(positions[index]) % reelHeight;
                const snapIndex = Math.round(currentPos / symbolHeight) % baseSymbols.length;
                positions[index] = - (snapIndex * symbolHeight);
                reel.style.transform = `translateY(${positions[index]}px)`;
                finalSymbols[index] = baseSymbols[snapIndex];
                animationIds[index] = null;
                return;
            }
        } else {
            // Ускорение
            speed = Math.min(maxSpeed, speed + accel * deltaTime);
        }

        positions[index] -= speed;
        // Петля
        if (Math.abs(positions[index]) > reelHeight) {
            positions[index] += reelHeight * Math.sign(positions[index]);
        }

        reel.style.transform = `translateY(${positions[index]}px)`;

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

    // Запуск анимации (десинхрон: разная начальная speed)
    reels.forEach((_, index) => {
        isSpinning[index] = true;
        positions[index] = 0;
        if (animationIds[index]) cancelAnimationFrame(animationIds[index]);
        startReelAnimation(index);
    });

    // Останавливаем по очереди (короче задержки для динамики)
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
    // Проверка завершения спина
    const checkInterval = setInterval(() => {
        if (spinning) {
            const stoppedCount = finalSymbols.filter(s => s !== undefined).length;
            if (stoppedCount === 3) {
                finishSpin();
                clearInterval(checkInterval);
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

// Cleanup
window.addEventListener('beforeunload', stopAllAnimations);
