// ============================================================
//  Marvel Snap Slot Machine — script.js
//  Источник данных: Google Apps Script Web App
// ============================================================

const CARDS_API = 'https://script.google.com/macros/s/AKfycbx3jwUPotluP3qIHNvM6HiizPdLU-QJQdcTKMJiOXpaWnR606yj9gWe1fj32sEGrve78Q/exec';

const reelIds = ['reel1', 'reel2', 'reel3'];

// Состояние
let spinning      = false;
let animationIds  = [null, null, null];
let positions     = [0, 0, 0];
let isSpinning    = [false, false, false];
let finalSymbols  = [null, null, null]; // { characterId, url }
let stopIndices   = [0, 0, 0];

// Данные карт
let characters    = [];   // [{id, name, variants:[url,...]}, ...]
let slotSymbols   = [];   // плоский массив {characterId, url} для барабанов

let symbolHeight  = 200;
let reelHeight    = 0;

// ─────────────────────────────────────────────
//  ЗАГРУЗКА ДАННЫХ
// ─────────────────────────────────────────────
async function loadCards() {
  const btn = document.getElementById('spinBtn');
  btn.textContent = 'Загрузка...';
  btn.disabled = true;

  try {
    const res = await fetch(CARDS_API);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();

    // Формат: { characters: [{id, name, variants:[url,...]}, ...] }
    characters = (data.characters || []).filter(c => c.variants && c.variants.length > 0);

    if (characters.length === 0) throw new Error('Нет персонажей в данных');

    console.log(`✅ Загружено персонажей: ${characters.length}`);

    // Строим плоский массив символов (берём 1 вариант на персонажа для барабана)
    buildSlotSymbols();
    await preloadImages(slotSymbols.map(s => s.url));
    initReels();

    btn.disabled = false;
    btn.textContent = 'Крутить!';

  } catch (err) {
    console.error('Ошибка загрузки:', err);
    useFallback();
  }
}

// Для барабана берём по одному рандомному варианту с каждого персонажа
// Это даёт разнообразие картинок, но победа = совпадение characterId
function buildSlotSymbols() {
  slotSymbols = characters.map(char => {
    const url = char.variants[Math.floor(Math.random() * char.variants.length)];
    return { characterId: char.id, name: char.name, url };
  });

  // Перемешиваем
  slotSymbols = slotSymbols.sort(() => Math.random() - 0.5);
}

// ─────────────────────────────────────────────
//  ИНИЦИАЛИЗАЦИЯ БАРАБАНОВ
// ─────────────────────────────────────────────
function initReels() {
  symbolHeight = window.innerWidth < 480 ? 120 : window.innerWidth < 768 ? 160 : 200;

  // Повторяем символы для бесконечной прокрутки
  const repeatCount = window.innerWidth < 480 ? 2 : 4;
  const poolSymbols = [];
  for (let r = 0; r < repeatCount; r++) {
    slotSymbols.forEach(s => poolSymbols.push(s));
  }

  reelHeight = poolSymbols.length * symbolHeight;

  reelIds.forEach((reelId, index) => {
    const reel = document.getElementById(reelId);
    reel.innerHTML = '';

    poolSymbols.forEach(sym => {
      const div = document.createElement('div');
      div.className = 'symbol';
      const img = document.createElement('img');
      img.src = sym.url;
      img.alt = sym.name || '';
      img.style.cssText = 'width:100%;height:100%;object-fit:contain;';
      div.appendChild(img);
      reel.appendChild(div);
    });

    const startIndex = Math.floor(Math.random() * slotSymbols.length);
    positions[index] = -(startIndex * symbolHeight);
    reel.style.transform = `translateY(${positions[index]}px)`;
  });
}

// ─────────────────────────────────────────────
//  ПРЕЛОАД ИЗОБРАЖЕНИЙ
// ─────────────────────────────────────────────
function preloadImages(urls) {
  return Promise.all(urls.map(url => new Promise(resolve => {
    const img = new Image();
    img.onload = resolve;
    img.onerror = resolve;
    img.src = url;
  })));
}

// ─────────────────────────────────────────────
//  АНИМАЦИЯ БАРАБАНА
// ─────────────────────────────────────────────
function startReelAnimation(index) {
  const reel = document.getElementById(reelIds[index]);
  const isMobile = window.innerWidth < 480;
  const accel   = isMobile ? 4 : 6;
  const maxSpeed = isMobile ? 18 : 25;

  let speed    = 0;
  let lastTime = performance.now();
  let stopped  = false;

  function animate(now) {
    const delta = now - lastTime;
    lastTime = now;

    if (!isSpinning[index]) {
      if (!stopped) {
        stopped = true;
        // Привязываемся к ближайшему символу
        const stopIdx = stopIndices[index];
        positions[index] = -(stopIdx * symbolHeight);
        reel.style.transform = `translateY(${positions[index]}px)`;
        finalSymbols[index] = slotSymbols[stopIdx % slotSymbols.length];
        animationIds[index] = null;

        // Все три остановились?
        if (finalSymbols.every(s => s !== null)) {
          setTimeout(finishSpin, 200);
        }
      }
      return;
    }

    speed = Math.min(maxSpeed, speed + accel);
    positions[index] -= speed * (delta / 16.67);

    // Зацикливание
    positions[index] %= -reelHeight;
    if (positions[index] > 0) positions[index] -= reelHeight;

    reel.style.transform = `translateY(${Math.round(positions[index])}px)`;
    animationIds[index] = requestAnimationFrame(animate);
  }

  animationIds[index] = requestAnimationFrame(animate);
}

// ─────────────────────────────────────────────
//  СПИН
// ─────────────────────────────────────────────
function spin() {
  if (spinning || slotSymbols.length === 0) return;
  spinning = true;
  finalSymbols = [null, null, null];

  const btn    = document.getElementById('spinBtn');
  const result = document.getElementById('result');
  btn.disabled = true;
  btn.textContent = 'Крутит...';
  result.textContent = '';
  result.className = 'result';

  // ── Определяем что выпадет ──────────────────
  const roll = Math.random();

  if (roll < 0.00001) {
    // Джекпот: три одинаковых варианта (0.001%)
    const jackpotIdx = Math.floor(Math.random() * slotSymbols.length);
    stopIndices = [jackpotIdx, jackpotIdx, jackpotIdx];

  } else if (roll < 0.008) {
    // Победа: три разных варианта одного персонажа (0.8%)
    // Ищем персонажа с >=3 вариантами
    const winners = characters.filter(c => c.variants.length >= 3);
    const winner  = winners.length > 0
      ? winners[Math.floor(Math.random() * winners.length)]
      : characters[Math.floor(Math.random() * characters.length)];

    // Берём 3 разных варианта и добавляем их как временные символы
    const shuffled = [...winner.variants].sort(() => Math.random() - 0.5).slice(0, 3);
    stopIndices = shuffled.map((url, i) => {
      // Находим или добавляем в slotSymbols
      let idx = slotSymbols.findIndex(s => s.url === url);
      if (idx === -1) {
        slotSymbols.push({ characterId: winner.id, name: winner.name, url });
        idx = slotSymbols.length - 1;
      }
      return idx;
    });

  } else {
    // Обычный случайный результат
    stopIndices = [0, 1, 2].map(() => Math.floor(Math.random() * slotSymbols.length));
  }

  // ── Запускаем барабаны ──────────────────────
  setTimeout(() => {
    reelIds.forEach((_, index) => {
      isSpinning[index] = true;
      if (animationIds[index]) cancelAnimationFrame(animationIds[index]);
      startReelAnimation(index);
    });

    const isMobile = window.innerWidth < 480;
    const delays = isMobile ? [1200, 1800, 2400] : [1600, 2400, 3200];

    delays.forEach((delay, index) => {
      setTimeout(() => { isSpinning[index] = false; }, delay);
    });

    // Страховка — принудительно финишируем через 4.5с
    setTimeout(() => { if (spinning) finishSpin(); }, 4500);
  }, 150);
}

// ─────────────────────────────────────────────
//  ФИНИШ
// ─────────────────────────────────────────────
function finishSpin() {
  if (!spinning) return;
  spinning = false;

  reelIds.forEach((_, i) => {
    isSpinning[i] = false;
    if (animationIds[i]) {
      cancelAnimationFrame(animationIds[i]);
      animationIds[i] = null;
    }
  });

  const btn    = document.getElementById('spinBtn');
  const result = document.getElementById('result');
  btn.disabled    = false;
  btn.textContent = 'Крутить!';

  // Берём characterId символов (null-safe)
  const s = finalSymbols;
  if (!s[0] || !s[1] || !s[2]) {
    result.textContent = 'Ошибка анимации, попробуй ещё раз';
    return;
  }

  const ids = s.map(sym => sym.characterId);

  if (s[0].url === s[1].url && s[1].url === s[2].url) {
    // Три одинаковых арта
    result.textContent = '🎰 ДЖЕКПОТ! Три одинаковых! 🎉🎉🎉';
    result.className = 'result win jackpot';
    launchConfetti();

  } else if (ids[0] === ids[1] && ids[1] === ids[2]) {
    // Три разных варианта одного персонажа
    result.textContent = `🏆 ПОБЕДА! Три ${s[0].name}! Красавчик! 🎊`;
    result.className = 'result win';
    launchConfetti();

  } else if (ids[0] === ids[1] || ids[1] === ids[2] || ids[0] === ids[2]) {
    // Два совпали
    const pair = ids[0] === ids[1] ? s[0].name : s[2].name;
    result.textContent = `😬 Почти! Два ${pair} — ещё раз!`;
    result.className = 'result near';

  } else {
    // Ничего
    const losePhrases = [
      'Мимо! 😅 Бака-машина не жалеет никого',
      'Не повезло! 💸 Попробуй ещё',
      'Слот смеётся над тобой 😈',
      'Облом! Карты не в твою пользу 🃏',
    ];
    result.textContent = losePhrases[Math.floor(Math.random() * losePhrases.length)];
    result.className = 'result lose';
  }
}

// ─────────────────────────────────────────────
//  КОНФЕТТИ (простое CSS-анимация)
// ─────────────────────────────────────────────
function launchConfetti() {
  const colors = ['#FFD700', '#FF4500', '#00BFFF', '#FF69B4', '#7FFF00'];
  for (let i = 0; i < 60; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.cssText = `
      position:fixed;
      top:-10px;
      left:${Math.random() * 100}vw;
      width:${6 + Math.random() * 8}px;
      height:${6 + Math.random() * 8}px;
      background:${colors[Math.floor(Math.random() * colors.length)]};
      border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
      opacity:1;
      pointer-events:none;
      z-index:9999;
      animation: confettiFall ${1.5 + Math.random() * 2}s ease-in forwards;
      animation-delay: ${Math.random() * 0.5}s;
    `;
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }
}

// ─────────────────────────────────────────────
//  ФОЛЛБЭК — эмодзи если API не работает
// ─────────────────────────────────────────────
function useFallback() {
  console.warn('Используем fallback эмодзи');
  const emojis = ['🍋', '🍒', '🍊', '🍇', '🔔', '⭐', '💎', '🃏'];
  characters = emojis.map((e, i) => ({ id: String(i), name: e, variants: [e] }));
  slotSymbols = characters.map(c => ({ characterId: c.id, name: c.name, url: c.variants[0] }));

  symbolHeight = window.innerWidth < 480 ? 120 : window.innerWidth < 768 ? 160 : 200;
  const repeatCount = 4;
  const pool = [];
  for (let r = 0; r < repeatCount; r++) slotSymbols.forEach(s => pool.push(s));
  reelHeight = pool.length * symbolHeight;

  reelIds.forEach((reelId, index) => {
    const reel = document.getElementById(reelId);
    reel.innerHTML = '';
    pool.forEach(sym => {
      const div = document.createElement('div');
      div.className = 'symbol';
      div.style.fontSize = '80px';
      div.style.lineHeight = symbolHeight + 'px';
      div.textContent = sym.url;
      reel.appendChild(div);
    });
    positions[index] = 0;
    reel.style.transform = `translateY(0px)`;
  });

  const btn = document.getElementById('spinBtn');
  btn.disabled = false;
  btn.textContent = 'Крутить!';
}

// ─────────────────────────────────────────────
//  СОБЫТИЯ
// ─────────────────────────────────────────────
document.getElementById('spinBtn').addEventListener('click', spin);

window.addEventListener('load', () => {
  loadCards();

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (!spinning && slotSymbols.length > 0) initReels();
    }, 300);
  });
});

window.addEventListener('beforeunload', () => {
  reelIds.forEach((_, i) => {
    if (animationIds[i]) cancelAnimationFrame(animationIds[i]);
  });
});
