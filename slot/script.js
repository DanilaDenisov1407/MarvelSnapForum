const reels = ['reel1', 'reel2', 'reel3'];
let spinning = false;
let baseSymbols = [];
let symbols = [];
let symbolHeight = 200;
const POOL_SIZE = 20;

// Прелоад изображений
function preloadImages(urls) {
    return Promise.all(
        urls.map(url => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = resolve;
                img.onerror = () => resolve();
                img.src = url;
            });
        })
    );
}

// Инициализация
async function initReels() {
    const btn = document.getElementById('spinBtn');
    try {
        const response = await fetch('Cards.json');
        if (!response.ok) throw new Error('JSON не найден');
        const jsonData = await response.json();
        
        // Выбор пула из 20
        const shuffled = [...jsonData].sort(() => 0.5 - Math.random());
        baseSymbols = shuffled.slice(0, POOL_SIZE);
        
        // Прелоад
        await preloadImages(baseSymbols);
        
        // symbols для петли: 3 повторения для длинной анимации
        symbols = [...baseSymbols, ...baseSymbols, ...baseSymbols];
        symbolHeight = window.innerWidth < 480 ? 120 : (window.innerWidth < 768 ? 160 : 200);

        reels.forEach((reelId, index) => {
            const reel = document.getElementById(reelId);
            reel.innerHTML = '';
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
            // Случайный старт
            const initIndex = Math.floor(Math.random() * baseSymbols.length);
            reel.style.transform = `translateY(${-initIndex * symbolHeight}px)`;
        });
        
        btn.disabled = false;
        btn.textContent = 'Крутить!';
    } catch (error) {
        console.error('Ошибка загрузки Cards.json:', error);
        // Fallback
        baseSymbols = ['🍋', '🍒', '🍊', '🍇', '🔔', '7️⃣'];
        symbols = [...baseSymbols, ...baseSymbols, ...baseSymbols];
        symbolHeight = window.innerWidth < 480 ? 120 : (window.innerWidth < 768 ? 160 : 200);
        
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
            reel.style.transform = `translateY(${-initIndex * symbolHeight}px)`;
        });
        
        btn.disabled = false;
        btn.textContent = 'Крутить!';
    }
}

// Запуск спина (CSS анимация для плавности, без RAF лагов)
function spin() {
    if (spinning) return;
    spinning = true;
    const btn = document.getElementById('spinBtn');
    const result = document.getElementById('result');
    
    btn.disabled = true;
    btn.textContent = 'Крутит...';
    result.textContent = '';

    // Сброс и запуск
    reels.forEach(reelId => {
        const reel = document.getElementById(reelId);
        reel.style.transform = 'translateY(0px)';
        reel.classList.remove('spinning');
        // Force reflow
        reel.offsetHeight;
        reel.classList.add('spinning');
    });

    // Остановка по задержкам с random pos
    setTimeout(() => stopReel(0), 800);
    setTimeout(() => stopReel(1), 1200);
    setTimeout(() => stopReel(2), 1600);

    // Локальный interval для check
    const intervalId = setInterval(() => {
        if (!spinning) {
            clearInterval(intervalId);
            return;
        }
        // Force finish после 3s
        if (Date.now() - spinStartTime > 3000) {
            finishSpin();
            clearInterval(intervalId);
        }
    }, 100);
}

// Остановка ролика (random pos + smooth transition)
function stopReel(index) {
    const reelId = reels[index];
    const reel = document.getElementById(reelId);
    const stopIndex = Math.floor(Math.random() * symbols.length);
    const offset = - (stopIndex * symbolHeight);
    
    reel.classList.remove('spinning');
    reel.style.animation = 'none'; // Kill animation
    reel.style.transform = `translateY(${offset}px)`; // Set pos with transition
}

// Завершение
function finishSpin() {
    spinning = false;
    const btn = document.getElementById('spinBtn');
    btn.disabled = false;
    btn.textContent = 'Крутить!';
    const result = document.getElementById('result');
    result.textContent = 'Почти выиграл! 😅'; // Простой, без win check для скорости
}

// События
document.getElementById('spinBtn').addEventListener('click', spin);

// Load
let spinStartTime = 0;
window.addEventListener('load', async () => {
    await initReels();
    
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (!spinning) initReels();
        }, 250);
    });
});

window.addEventListener('beforeunload', () => {
    reels.forEach(reelId => {
        const reel = document.getElementById(reelId);
        reel.classList.remove('spinning');
    });
});
