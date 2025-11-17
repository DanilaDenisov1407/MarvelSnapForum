const reels = ['reel1', 'reel2', 'reel3'];
let spinning = false;
let animationIds = [];
let positions = [0, 0, 0];
let isSpinning = [false, false, false];
let finalSymbols = [];
let baseSymbols = [];
let symbols = [];
let symbolHeight = 200;
let reelHeight = 0;
const POOL_SIZE = 21;
let checkInterval;
let spinStartTime;
let stopIndices = [];

// Прелоад изображений
function preloadImages(urls) {
    return Promise.all(
        urls.map(url => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = resolve;
                img.onerror = () => resolve(); // Продолжить даже при ошибке
                img.src = url;
            });
        })
    );
}

// Функция для извлечения ID персонажа из URL
function getCharacterId(url) {
    const match = url.match(/cards\/(\d+)/);
    return match ? match[1] : null;
}

// Инициализация
async function initReels() {
    const btn = document.getElementById('spinBtn');
    try {
        const response = await fetch('Cards.json');
        if (!response.ok) throw new Error('JSON не найден');
        const jsonData = await response.json();
       
        // Группировка по персонажам
        const characterMap = {};
        jsonData.forEach(url => {
            const id = getCharacterId(url);
            if (id) {
                if (!characterMap[id]) characterMap[id] = [];
                characterMap[id].push(url);
            }
        });
       
        // Выбор 18 разных персонажей (по одному варианту)
        const allIds = Object.keys(characterMap);
        const shuffledIds = allIds.sort(() => 0.5 - Math.random()).slice(0, 18);
        const differentCharacters = shuffledIds.map(id => characterMap[id][Math.floor(Math.random() * characterMap[id].length)]);
       
        // Выбор одного персонажа с 3 вариантами
        const specialId = allIds[Math.floor(Math.random() * allIds.length)];
        const specialVariants = characterMap[specialId].sort(() => 0.5 - Math.random()).slice(0, 3);
       
        // Сбор baseSymbols: 18 разных + 3 варианта одного
        baseSymbols = [...differentCharacters, ...specialVariants].sort(() => 0.5 - Math.random());
       
        await preloadImages(baseSymbols);
       
        // На мобильных уменьшаем повторения для снижения нагрузки
        const isMobile = window.innerWidth < 480;
        symbols = isMobile ? [...baseSymbols, ...baseSymbols] : [...baseSymbols, ...baseSymbols, ...baseSymbols, ...baseSymbols];
        symbolHeight = window.innerWidth < 480 ? 120 : (window.innerWidth < 768 ? 160 : 200);
        reelHeight = symbols.length * symbolHeight;
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
            const initIndex = Math.floor(Math.random() * baseSymbols.length);
            positions[index] = - (initIndex * symbolHeight);
            reel.style.transform = `translateY(${positions[index]}px)`;
        });
       
        // Дополнительная задержка 1с для полной загрузки после preload
        setTimeout(() => {
            btn.disabled = false;
            btn.textContent = 'Крутить!';
        }, 1000);
    } catch (error) {
        console.error('Ошибка загрузки Cards.json:', error);
        // Fallback на эмодзи
        baseSymbols = ['🍋', '🍒', '🍊', '🍇', '🔔', '7️⃣'];
        symbols = [...baseSymbols, ...baseSymbols, ...baseSymbols, ...baseSymbols];
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
       
        setTimeout(() => {
            btn.disabled = false;
            btn.textContent = 'Крутить!';
        }, 1000);
    }
}
// Анимация с RAF (адаптивные параметры для мобильных)
function startReelAnimation(index) {
    const reel = document.getElementById(reels[index]);
    let lastTime = performance.now();
    let speed = 0;
    const isMobile = window.innerWidth < 480;
    const accel = isMobile ? 4 : 6;
    const maxSpeed = isMobile ? 18 : 25;
    let stopped = false;
    function animate(currentTime) {
        const delta = currentTime - lastTime;
        lastTime = currentTime;
        if (!isSpinning[index]) {
            if (!stopped) {
                stopped = true;
                const stopIndex = stopIndices[index];
                positions[index] = Math.round(- (stopIndex * symbolHeight));
                reel.style.transform = `translateY(${positions[index]}px)`;
                finalSymbols[index] = baseSymbols[stopIndex];
                animationIds[index] = null;
                return;
            }
            return;
        }
        speed = Math.min(maxSpeed, speed + accel);
        positions[index] -= speed * (delta / 16.67);
        positions[index] %= -reelHeight;
        if (positions[index] > 0) positions[index] -= reelHeight;
        positions[index] = Math.round(positions[index]);
        reel.style.transform = `translateY(${positions[index]}px)`;
        animationIds[index] = requestAnimationFrame(animate);
    }
    animationIds[index] = requestAnimationFrame(animate);
}
// Спин
function spin() {
    if (spinning) return;
    spinning = true;
    spinStartTime = Date.now();
    const btn = document.getElementById('spinBtn');
    const result = document.getElementById('result');
   
    btn.disabled = true;
    btn.textContent = 'Крутит...';
    result.textContent = '';
    finalSymbols = [];
    stopIndices = [];
   
    // Rigged шансы
    if (Math.random() < 1 / 10000000) { // Джекпот ~1 к 10M
        const jackpotIndex = Math.floor(Math.random() * baseSymbols.length);
        stopIndices = [jackpotIndex, jackpotIndex, jackpotIndex];
    } else if (Math.random() < 0.05) { // Победа ~5%
        // Найти персонажа с >=3 вариантами (specialVariants)
        const specialUrls = baseSymbols.filter(url => getCharacterId(url) === getCharacterId(baseSymbols[baseSymbols.length - 1])); // Предполагаем special в конце
        if (specialUrls.length >= 3) {
            const shuffledSpecial = specialUrls.sort(() => 0.5 - Math.random()).slice(0, 3);
            stopIndices = shuffledSpecial.map(url => baseSymbols.indexOf(url));
        } else {
            // Fallback на random
            stopIndices = Array.from({length: 3}, () => Math.floor(Math.random() * baseSymbols.length));
        }
    } else {
        // Нормальный random
        stopIndices = Array.from({length: 3}, () => Math.floor(Math.random() * baseSymbols.length));
    }
   
    // Небольшая задержка перед стартом анимации (200ms)
    setTimeout(() => {
        reels.forEach((_, index) => {
            isSpinning[index] = true;
            positions[index] = 0;
            if (animationIds[index]) cancelAnimationFrame(animationIds[index]);
            startReelAnimation(index);
        });
        const isMobile = window.innerWidth < 480;
        const delays = isMobile ? [1000, 1500, 2000] : [1500, 2200, 2900];
        setTimeout(() => stopReel(0), delays[0]);
        setTimeout(() => stopReel(1), delays[1]);
        setTimeout(() => stopReel(2), delays[2]);
    }, 200);
    // Force finish после 4s
    setTimeout(() => {
        if (spinning) finishSpin();
    }, 4000);
}
// Stop
function stopReel(index) {
    isSpinning[index] = false;
}
// Finish
function finishSpin() {
    spinning = false;
    stopAllAnimations();
    const btn = document.getElementById('spinBtn');
    btn.disabled = false;
    btn.textContent = 'Крутить!';
    const char0 = getCharacterId(finalSymbols[0]);
    const char1 = getCharacterId(finalSymbols[1]);
    const char2 = getCharacterId(finalSymbols[2]);
    const result = document.getElementById('result');
    if (finalSymbols[0] === finalSymbols[1] && finalSymbols[1] === finalSymbols[2]) {
        result.textContent = 'Джекпот! 🎉';
    } else if (char0 && char0 === char1 && char1 === char2) {
        result.textContent = 'Победа! 🏆 (Совпали персонажи)';
    } else {
        result.textContent = 'Почти выиграл! 😅';
    }
    if (checkInterval) {
        clearInterval(checkInterval);
        checkInterval = null;
    }
}
function stopAllAnimations() {
    reels.forEach((_, index) => {
        isSpinning[index] = false;
        if (animationIds[index]) {
            cancelAnimationFrame(animationIds[index]);
        }
    });
}
// Events
document.getElementById('spinBtn').addEventListener('click', spin);
// Load
window.addEventListener('load', async () => {
    await initReels();
    checkInterval = setInterval(() => {
        if (spinning) {
            const stoppedCount = finalSymbols.filter(s => s !== undefined).length;
            if (stoppedCount === 3) {
                finishSpin();
            }
        }
    }, 100);
   
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (!spinning) initReels();
        }, 250);
    });
});
window.addEventListener('beforeunload', stopAllAnimations);
