// ============================================================
//  Marvel Snap Slot Machine — script.js v2
//  + Фильтрация битых картинок в браузере
//  + Шансы победы из Google Sheets Settings
//  + Режимы: all / series / rarity / custom
// ============================================================

const CARDS_API = 'https://script.google.com/macros/s/AKfycbx3jwUPotluP3qIHNvM6HiizPdLU-QJQdcTKMJiOXpaWnR606yj9gWe1fj32sEGrve78Q/exec';

const reelIds = ['reel1', 'reel2', 'reel3'];

// ── Состояние ────────────────────────────────
let spinning     = false;
let animationIds = [null, null, null];
let positions    = [0, 0, 0];
let isSpinning   = [false, false, false];
let finalSymbols = [null, null, null];
let stopIndices  = [0, 0, 0];

// ── Данные ───────────────────────────────────
let characters   = [];   // полный список с сервера
let slotSymbols  = [];   // [{characterId, name, url, series, rarity}, ...]
let settings     = { jackpot_chance: 0.0001, win_chance: 0.05, near_chance: 0.15, slot_title: 'Слот-Машина у Баки 🦾' };

let symbolHeight = 200;
let reelHeight   = 0;

// ─────────────────────────────────────────────
//  ЗАГРУЗКА ДАННЫХ
// ─────────────────────────────────────────────
async function loadCards() {
  const btn = document.getElementById('spinBtn');
  setStatus('⏳ Загрузка карт...');
  btn.disabled = true;
  btn.textContent = 'Загрузка...';

  try {
    const res = await fetch(CARDS_API);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();

    if (data.error) throw new Error(data.error);

    // Применяем настройки из таблицы
    if (data.settings) {
      settings = { ...settings, ...data.settings };
    }

    // Заголовок из таблицы
    if (settings.slot_title) {
      document.querySelector('h1').textContent = settings.slot_title;
    }

    characters = (data.characters || []).filter(c => c.variants?.length > 0);
    if (characters.length === 0) throw new Error('Нет персонажей');

    console.log(`✅ Персонажей: ${characters.length}, режим: ${settings.slot_mode || 'all'}`);

    // Строим символы и проверяем картинки
    buildSlotSymbols();
    setStatus(`🔍 Проверка ${slotSymbols.length} картинок...`);
    await filterBrokenImages();

    if (slotSymbols.length === 0) throw new Error('Все картинки битые!');

    console.log(`✅ Валидных картинок: ${slotSymbols.length}`);

    initReels();
    btn.disabled = false;
    btn.textContent = 'Крутить!';
    setStatus('');

  } catch (err) {
    console.error('Ошибка:', err);
    setStatus('⚠️ Ошибка загрузки, используем запасной набор');
    useFallback();
  }
}

// ─────────────────────────────────────────────
//  СТРОИМ СПИСОК СИМВОЛОВ ДЛЯ БАРАБАНОВ
// ─────────────────────────────────────────────
function buildSlotSymbols() {
  // По одному рандомному варианту на персонажа
  slotSymbols = characters.map(char => {
    const url = char.variants[Math.floor(Math.random() * char.variants.length)];
    return {
      characterId: char.id,
      name:        char.name,
      series:      char.series || '',
      rarity:      char.rarity || '',
      cost:        char.cost   || 0,
      url
    };
  });

  // Перемешиваем
  slotSymbols = slotSymbols.sort(() => Math.random() - 0.5);
}

// ─────────────────────────────────────────────
//  ФИЛЬТРАЦИЯ БИТЫХ КАРТИНОК
//  Параллельная проверка через Image() с таймаутом 5с
// ─────────────────────────────────────────────
async function filterBrokenImages() {
  const TIMEOUT_MS = 5000;
  const BATCH_SIZE = 20; // проверяем по 20 за раз чтобы не перегружать

  const valid = [];

  for (let i = 0; i < slotSymbols.length; i += BATCH_SIZE) {
    const batch = slotSymbols.slice(i, i + BATCH_SIZE);

    const results = await Promise.all(batch.map(sym => checkImage(sym.url, TIMEOUT_MS)));

    batch.forEach((sym, idx) => {
      if (results[idx]) valid.push(sym);
    });

    // Обновляем прогресс
    const checked = Math.min(i + BATCH_SIZE, slotSymbols.length);
    setStatus(`🔍 Проверено ${checked}/${slotSymbols.length} картинок... (валидных: ${valid.length})`);
  }

  slotSymbols = valid;
}

// Проверка одного URL — возвращает true если картинка загрузилась
function checkImage(url, timeoutMs) {
  return new Promise(resolve => {
    if (!url || !url.startsWith('http')) { resolve(false); return; }

    const img     = new Image();
    const timer   = setTimeout(() => { img.src = ''; resolve(false); }, timeoutMs);

    img.onload  = () => { clearTimeout(timer); resolve(img.naturalWidth > 0); };
    img.onerror = () => { clearTimeout(timer); resolve(false); };
    img.src = url;
  });
}

// ─────────────────────────────────────────────
//  ИНИЦИАЛИЗАЦИЯ БАРАБАНОВ
// ─────────────────────────────────────────────
function initReels() {
  symbolHeight = window.innerWidth < 480 ? 120 : window.innerWidth < 768 ? 160 : 200;

  const repeatCount = window.innerWidth < 480 ? 3 : 5;
  const pool = [];
  for (let r = 0; r < repeatCount; r++) slotSymbols.forEach(s => pool.push(s));

  reelHeight = pool.length * symbolHeight;

  reelIds.forEach((reelId, index) => {
    const reel = document.getElementById(reelId);
    reel.innerHTML = '';

    pool.forEach(sym => {
      const div = document.createElement('div');
      div.className = 'symbol';
      const img = document.createElement('img');
      img.src = sym.url;
      img.alt = sym.name || '';
      img.title = `${sym.name} | ${sym.series} | ${sym.rarity}`;
      img.style.cssText = 'width:100%;height:100%;object-fit:contain;';
      // Скрываем если вдруг сломалась после проверки
      img.onerror = () => { div.style.opacity = '0'; };
      div.appendChild(img);
      reel.appendChild(div);
    });

    const startIndex = Math.floor(Math.random() * slotSymbols.length);
    positions[index] = -(startIndex * symbolHeight);
    reel.style.transform = `translateY(${positions[index]}px)`;
  });
}

// ─────────────────────────────────────────────
//  АНИМАЦИЯ
// ─────────────────────────────────────────────
function startReelAnimation(index) {
  const reel     = document.getElementById(reelIds[index]);
  const isMobile = window.innerWidth < 480;
  const accel    = isMobile ? 4 : 6;
  const maxSpeed = isMobile ? 18 : 28;

  let speed    = 0;
  let lastTime = performance.now();
  let stopped  = false;

  function animate(now) {
    const delta = now - lastTime;
    lastTime = now;

    if (!isSpinning[index]) {
      if (!stopped) {
        stopped = true;
        const stopIdx = stopIndices[index] % slotSymbols.length;
        // Находим ближайшую позицию этого символа в pool
        const poolIdx = stopIndices[index]; // уже нормализован в spin()
        positions[index] = -(poolIdx * symbolHeight);
        reel.style.transform = `translateY(${positions[index]}px)`;
        finalSymbols[index] = slotSymbols[stopIdx];
        animationIds[index] = null;

        if (finalSymbols.every(s => s !== null)) {
          setTimeout(finishSpin, 300);
        }
      }
      return;
    }

    speed = Math.min(maxSpeed, speed + accel * (delta / 16.67));
    positions[index] -= speed;
    positions[index] %= -reelHeight;
    if (positions[index] > 0) positions[index] -= reelHeight;

    reel.style.transform = `translateY(${Math.round(positions[index])}px)`;
    animationIds[index] = requestAnimationFrame(animate);
  }

  animationIds[index] = requestAnimationFrame(animate);
}

// ─────────────────────────────────────────────
//  СПИН — шансы берём из settings (из таблицы)
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

  const roll = Math.random();

  // Шансы из Google Sheets Settings
  const JACKPOT = settings.jackpot_chance || 0.0001;
  const WIN     = settings.win_chance     || 0.05;

  if (roll < JACKPOT) {
    // 🎰 Джекпот — три одинаковых арта
    const jackpotSymIdx = Math.floor(Math.random() * slotSymbols.length);
    stopIndices = [jackpotSymIdx, jackpotSymIdx, jackpotSymIdx];

  } else if (roll < JACKPOT + WIN) {
    // 🏆 Победа — три разных варианта одного персонажа
    const winners = characters.filter(c => c.variants.length >= 3);
    const winner  = winners.length > 0
      ? winners[Math.floor(Math.random() * winners.length)]
      : characters[Math.floor(Math.random() * characters.length)];

    const shuffledVariants = [...winner.variants].sort(() => Math.random() - 0.5).slice(0, 3);

    stopIndices = shuffledVariants.map(url => {
      let idx = slotSymbols.findIndex(s => s.url === url);
      if (idx === -1) {
        // Добавляем временно
        slotSymbols.push({ characterId: winner.id, name: winner.name, url, series: winner.series, rarity: winner.rarity });
        idx = slotSymbols.length - 1;
      }
      return idx;
    });

  } else {
    // 💸 Обычный случайный результат
    stopIndices = [0, 1, 2].map(() => Math.floor(Math.random() * slotSymbols.length));
  }

  setTimeout(() => {
    reelIds.forEach((_, index) => {
      isSpinning[index] = true;
      if (animationIds[index]) cancelAnimationFrame(animationIds[index]);
      startReelAnimation(index);
    });

    const isMobile = window.innerWidth < 480;
    const delays   = isMobile ? [1200, 1800, 2400] : [1600, 2400, 3200];
    delays.forEach((delay, i) => setTimeout(() => { isSpinning[i] = false; }, delay));

    // Страховка
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
    if (animationIds[i]) { cancelAnimationFrame(animationIds[i]); animationIds[i] = null; }
  });

  const btn    = document.getElementById('spinBtn');
  const result = document.getElementById('result');
  btn.disabled    = false;
  btn.textContent = 'Крутить!';

  const s = finalSymbols;
  if (!s[0] || !s[1] || !s[2]) { result.textContent = 'Ошибка — попробуй ещё раз'; return; }

  const ids = s.map(sym => sym.characterId);

  if (s[0].url === s[1].url && s[1].url === s[2].url) {
    result.innerHTML = `🎰 <b>ДЖЕКПОТ!</b> Три одинаковых! 🎉🎉🎉`;
    result.className = 'result win jackpot';
    launchConfetti(80);

  } else if (ids[0] === ids[1] && ids[1] === ids[2]) {
    result.innerHTML = `🏆 <b>ПОБЕДА!</b> Три ${s[0].name}! Красавчик! 🎊`;
    result.className = 'result win';
    launchConfetti(50);

  } else if (ids[0] === ids[1] || ids[1] === ids[2] || ids[0] === ids[2]) {
    const pairName = (ids[0] === ids[1] || ids[0] === ids[2]) ? s[0].name : s[1].name;
    result.textContent = `😬 Почти! Два ${pairName} совпали — ещё разок!`;
    result.className = 'result near';

  } else {
    const phrases = [
      'Мимо! 😅 Бака-машина не жалеет никого',
      'Не повезло! 💸 Попробуй ещё',
      'Слот смеётся над тобой 😈',
      'Облом! Карты не в твою пользу 🃏',
    ];
    result.textContent = phrases[Math.floor(Math.random() * phrases.length)];
    result.className = 'result lose';
  }
}

// ─────────────────────────────────────────────
//  КОНФЕТТИ
// ─────────────────────────────────────────────
function launchConfetti(count = 50) {
  const colors = ['#FFD700', '#FF4500', '#00BFFF', '#FF69B4', '#7FFF00', '#FF1493'];
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.style.cssText = `
      position:fixed; top:-10px; pointer-events:none; z-index:9999;
      left:${Math.random() * 100}vw;
      width:${6 + Math.random() * 8}px; height:${6 + Math.random() * 8}px;
      background:${colors[Math.floor(Math.random() * colors.length)]};
      border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
      animation: confettiFall ${1.5 + Math.random() * 2}s ease-in forwards;
      animation-delay:${Math.random() * 0.6}s;
    `;
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }
}

// ─────────────────────────────────────────────
//  СТАТУС
// ─────────────────────────────────────────────
function setStatus(msg) {
  const el = document.getElementById('result');
  if (el) el.textContent = msg;
}

// ─────────────────────────────────────────────
//  ФОЛЛБЭК — эмодзи если API упал
// ─────────────────────────────────────────────
function useFallback() {
  const emojis = ['🍋','🍒','🍊','🍇','🔔','⭐','💎','🃏','🎯','🏆'];
  characters = emojis.map((e, i) => ({ id: String(i), name: e, variants: [e], series: '', rarity: '' }));
  slotSymbols = characters.map(c => ({ characterId: c.id, name: c.name, url: c.variants[0], series: '', rarity: '' }));

  symbolHeight = window.innerWidth < 480 ? 120 : window.innerWidth < 768 ? 160 : 200;
  const pool = [];
  for (let r = 0; r < 4; r++) slotSymbols.forEach(s => pool.push(s));
  reelHeight = pool.length * symbolHeight;

  reelIds.forEach((reelId, index) => {
    const reel = document.getElementById(reelId);
    reel.innerHTML = '';
    pool.forEach(sym => {
      const div = document.createElement('div');
      div.className = 'symbol';
      div.style.fontSize = symbolHeight * 0.55 + 'px';
      div.style.lineHeight = symbolHeight + 'px';
      div.textContent = sym.url;
      reel.appendChild(div);
    });
    positions[index] = 0;
    reel.style.transform = 'translateY(0px)';
  });

  document.getElementById('spinBtn').disabled = false;
  document.getElementById('spinBtn').textContent = 'Крутить!';
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
  reelIds.forEach((_, i) => { if (animationIds[i]) cancelAnimationFrame(animationIds[i]); });
});
