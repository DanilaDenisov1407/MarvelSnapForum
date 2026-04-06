// ============================================================
//  Marvel Snap Slot Machine — script.js v6
//  Фиксы: кнопки всегда работают, анимация быстрая и точная,
//         карты в центре слота, logout работает
// ============================================================

const API_BASE = 'https://script.google.com/macros/s/AKfycbx3jwUPotluP3qIHNvM6HiizPdLU-QJQdcTKMJiOXpaWnR606yj9gWe1fj32sEGrve78Q/exec';
const REEL_IDS = ['reel1', 'reel2', 'reel3'];

// ── Пользователь ─────────────────────────────
let currentUser = null;

// ── Состояние слота ──────────────────────────
let spinning     = false;
let animationIds = [null, null, null];
let positions    = [0, 0, 0];
let isSpinning   = [false, false, false];
let stoppedCount = 0;
let finalSymbols = [null, null, null];
let stopTargets  = [0, 0, 0]; // индексы в slotSymbols

// ── Данные ───────────────────────────────────
let characters  = [];
let slotSymbols = []; // [{characterId, name, rarity, url}]
let reelPool    = []; // slotSymbols × N, одинаковый для всех барабанов
let settings    = { jackpot_chance: 0.0001, win_chance: 0.05, slot_title: 'Слот-Машина у Баки 🦾' };
let SYM_H       = 200; // высота одного символа в px

// ─────────────────────────────────────────────
//  УТИЛИТЫ
// ─────────────────────────────────────────────
function $(id) { return document.getElementById(id); }

async function apiCall(params) {
  const qs  = new URLSearchParams(params).toString();
  const res = await fetch(API_BASE + '?' + qs);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

function showScreen(name) {
  $('screen-auth').style.display = name === 'auth' ? 'flex' : 'none';
  $('screen-slot').style.display = name === 'slot' ? 'flex' : 'none';
}

function setResult(text, cls) {
  const el = $('result');
  el.textContent = text;
  el.className   = 'result' + (cls ? ' ' + cls : '');
}

function updateUserBar() {
  if (!currentUser) return;
  $('user-name').textContent    = currentUser.username;
  $('user-balance').textContent = (currentUser.balance || 0) + ' 🎲';
  $('stats-bar').textContent    =
    'Всего спинов: ' + (currentUser.spins || 0) +
    ' · Побед: '     + (currentUser.wins  || 0);
}

// ─────────────────────────────────────────────
//  АВТОРИЗАЦИЯ
// ─────────────────────────────────────────────
async function handleLogin() {
  const username = $('login-username').value.trim().toLowerCase();
  const password = $('login-password').value.trim();
  const errEl    = $('login-error');
  const btn      = $('login-btn');

  errEl.textContent = '';
  if (!username || !password) { errEl.textContent = 'Заполни все поля'; return; }

  btn.disabled = true; btn.textContent = 'Входим...';
  try {
    const data = await apiCall({ action: 'login', username, password });
    if (!data.ok) throw new Error(data.error || 'Ошибка входа');
    currentUser = { username: data.username, balance: data.balance, spins: data.spins, wins: data.wins || 0 };
    saveSession();
    await enterSlot();
  } catch (e) {
    errEl.textContent = '❌ ' + e.message;
  } finally {
    btn.disabled = false; btn.textContent = 'Войти';
  }
}

async function handleRegister() {
  const username = $('reg-username').value.trim().toLowerCase();
  const password = $('reg-password').value.trim();
  const errEl    = $('reg-error');
  const btn      = $('reg-btn');

  errEl.textContent = '';
  if (!username || !password) { errEl.textContent = 'Заполни все поля'; return; }

  btn.disabled = true; btn.textContent = 'Создаём...';
  try {
    const data = await apiCall({ action: 'register', username, password });
    if (!data.ok) throw new Error(data.error || 'Ошибка регистрации');
    currentUser = { username: data.username, balance: data.balance, spins: 0, wins: 0 };
    saveSession();
    await enterSlot();
  } catch (e) {
    errEl.textContent = '❌ ' + e.message;
  } finally {
    btn.disabled = false; btn.textContent = 'Зарегистрироваться';
  }
}

function handleLogout() {
  currentUser = null;
  clearSession();
  // Сбрасываем поля
  ['login-username','login-password','reg-username','reg-password'].forEach(function(id) {
    $(id).value = '';
  });
  ['login-error','reg-error'].forEach(function(id) { $(id).textContent = ''; });
  showScreen('auth');
}

function saveSession()  { try { localStorage.setItem('mss_user', JSON.stringify(currentUser)); } catch(e){} }
function clearSession() { try { localStorage.removeItem('mss_user'); } catch(e){} }

async function enterSlot() {
  showScreen('slot');
  updateUserBar();
  resizeReels(); // сразу правильный размер
  await loadCards();
}

// ─────────────────────────────────────────────
//  РАЗМЕР БАРАБАНОВ (адаптивный)
// ─────────────────────────────────────────────
function resizeReels() {
  const w = window.innerWidth;
  if      (w <= 560) SYM_H = 110;
  else if (w <= 768) SYM_H = 150;
  else               SYM_H = 200;

  // Синхронизируем CSS
  document.querySelectorAll('.slots-container').forEach(function(el) { el.style.height = SYM_H + 'px'; });
  document.querySelectorAll('.slot').forEach(function(el)            { el.style.height = SYM_H + 'px'; });
  document.querySelectorAll('.symbol').forEach(function(el)          { el.style.height = SYM_H + 'px'; });
}

// ─────────────────────────────────────────────
//  ЗАГРУЗКА КАРТ
// ─────────────────────────────────────────────
async function loadCards() {
  const btn = $('spinBtn');
  btn.disabled = true; btn.textContent = 'Загрузка...';
  setResult('Загружаем карты...');

  try {
    const data = await apiCall({ action: 'cards' });
    if (data.error) throw new Error(data.error);

    if (data.settings) Object.assign(settings, data.settings);
    if (settings.slot_title) $('slot-title').textContent = settings.slot_title;

    characters = (data.characters || []).filter(function(c) {
      return c.variants && c.variants.length > 0;
    });
    if (characters.length === 0) throw new Error('Таблица Cards пустая или нет URL');

    buildSymbols();
    buildReels();
    btn.disabled = false; btn.textContent = 'Крутить!';
    setResult('');
  } catch (err) {
    console.error('loadCards:', err.message);
    setResult('⚠️ ' + err.message);
    useFallback();
  }
}

// ─────────────────────────────────────────────
//  ПОСТРОЕНИЕ СИМВОЛОВ И БАРАБАНОВ
// ─────────────────────────────────────────────
function buildSymbols() {
  slotSymbols = characters.map(function(char) {
    var url = char.variants[Math.floor(Math.random() * char.variants.length)];
    return { characterId: String(char.id), name: char.name || '?', rarity: char.rarity || '', url: url };
  }).filter(function(s) {
    return s.url && s.url.indexOf('http') === 0;
  }).sort(function() { return Math.random() - 0.5; });

  // Пул: 8 повторений — достаточно места для поиска цели
  reelPool = [];
  for (var r = 0; r < 8; r++) {
    slotSymbols.forEach(function(s) { reelPool.push(s); });
  }
}

function buildReels() {
  resizeReels();

  REEL_IDS.forEach(function(rid, index) {
    var reel = $(rid);
    reel.innerHTML = '';
    reel.style.transition = '';

    reelPool.forEach(function(sym) {
      var div = document.createElement('div');
      div.className = 'symbol';
      div.style.height = SYM_H + 'px';

      var img = document.createElement('img');
      img.src   = sym.url;
      img.alt   = sym.name;
      img.title = sym.name + (sym.rarity ? ' · ' + sym.rarity : '');
      img.onerror = function() { div.style.visibility = 'hidden'; };
      div.appendChild(img);
      reel.appendChild(div);
    });

    // Начинаем с середины пула чтобы было куда ехать
    var startIdx = Math.floor(reelPool.length / 2) + Math.floor(Math.random() * slotSymbols.length);
    positions[index] = -(startIdx * SYM_H);
    reel.style.transform = 'translateY(' + positions[index] + 'px)';
  });
}

// ─────────────────────────────────────────────
//  СПИН
// ─────────────────────────────────────────────
function spin() {
  if (spinning || slotSymbols.length === 0) return;

  spinning     = true;
  stoppedCount = 0;
  finalSymbols = [null, null, null];

  $('spinBtn').disabled    = true;
  $('spinBtn').textContent = 'Крутит...';
  setResult('');

  // ── Определяем результат заранее ──
  var roll    = Math.random();
  var JACKPOT = Number(settings.jackpot_chance) || 0.0001;
  var WIN     = Number(settings.win_chance)     || 0.05;

  if (roll < JACKPOT) {
    // Джекпот: три одинаковых символа
    var jIdx = Math.floor(Math.random() * slotSymbols.length);
    stopTargets = [jIdx, jIdx, jIdx];

  } else if (roll < JACKPOT + WIN) {
    // Победа: три варианта одного персонажа
    var winners = characters.filter(function(c) { return c.variants.length >= 3; });
    var pool    = winners.length > 0 ? winners : characters;
    var winner  = pool[Math.floor(Math.random() * pool.length)];
    var picks   = winner.variants.slice().sort(function() { return Math.random() - 0.5; }).slice(0, 3);

    stopTargets = picks.map(function(url) {
      for (var k = 0; k < slotSymbols.length; k++) {
        if (slotSymbols[k].url === url) return k;
      }
      // Добавляем если не нашли
      var ns = { characterId: String(winner.id), name: winner.name, url: url, rarity: winner.rarity || '' };
      slotSymbols.push(ns);
      reelPool.push(ns);
      return slotSymbols.length - 1;
    });

  } else {
    // Случайный
    stopTargets = [0,1,2].map(function() { return Math.floor(Math.random() * slotSymbols.length); });
  }

  // ── Запускаем барабаны ──
  REEL_IDS.forEach(function(_, i) {
    isSpinning[i] = true;
    if (animationIds[i]) { cancelAnimationFrame(animationIds[i]); animationIds[i] = null; }
    spinReel(i);
  });

  // ── Останавливаем по очереди ──
  var isMobile = window.innerWidth <= 560;
  var delays   = isMobile ? [800, 1300, 1800] : [1000, 1600, 2200];
  delays.forEach(function(d, i) {
    setTimeout(function() { isSpinning[i] = false; }, d);
  });

  // Страховка
  setTimeout(function() {
    if (!spinning) return;
    finalSymbols = finalSymbols.map(function(s, i) { return s || slotSymbols[stopTargets[i]] || slotSymbols[0]; });
    finishSpin();
  }, isMobile ? 3000 : 4000);
}

// ─────────────────────────────────────────────
//  АНИМАЦИЯ БАРАБАНА
// ─────────────────────────────────────────────
function spinReel(index) {
  var reel     = $(REEL_IDS[index]);
  var maxSpeed = window.innerWidth <= 560 ? 14 : 20;
  var accel    = window.innerWidth <= 560 ? 3  : 4;
  var speed    = 0;
  var lastTime = performance.now();
  var braking  = false;

  function frame(now) {
    var dt = Math.min(now - lastTime, 50); // cap delta чтобы не прыгало
    lastTime = now;

    // ── Сигнал остановки ──
    if (!isSpinning[index] && !braking) {
      braking = true;
      landReel(index, reel);
      return;
    }
    if (braking) return;

    // ── Разгон ──
    speed = Math.min(maxSpeed, speed + accel * (dt / 16));
    positions[index] -= speed;

    // Зацикливание: прыгаем на начало второй четверти когда уходим слишком далеко
    var totalH = reelPool.length * SYM_H;
    if (-positions[index] > totalH * 0.7) {
      positions[index] += Math.floor(reelPool.length * 0.4) * SYM_H;
    }

    reel.style.transform = 'translateY(' + Math.round(positions[index]) + 'px)';
    animationIds[index]  = requestAnimationFrame(frame);
  }

  animationIds[index] = requestAnimationFrame(frame);
}

// ─────────────────────────────────────────────
//  МЯГКАЯ ПОСАДКА (CSS transition к нужному символу)
// ─────────────────────────────────────────────
function landReel(index, reel) {
  var targetSym  = slotSymbols[stopTargets[index]];
  var currentRow = Math.round(-positions[index] / SYM_H);

  // Ищем ближайшее вхождение targetSym ВПЕРЁД от currentRow (мин +2 строки)
  var targetRow = -1;
  for (var i = currentRow + 2; i < reelPool.length; i++) {
    if (reelPool[i] && reelPool[i].url === targetSym.url) { targetRow = i; break; }
  }
  // Fallback
  if (targetRow === -1) {
    for (var j = 0; j < reelPool.length; j++) {
      if (reelPool[j] && reelPool[j].url === targetSym.url) { targetRow = j; break; }
    }
  }
  if (targetRow === -1) targetRow = Math.floor(reelPool.length / 2) + stopTargets[index];

  var targetPos = -(targetRow * SYM_H);

  // Плавная посадка
  reel.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
  reel.style.transform  = 'translateY(' + targetPos + 'px)';
  positions[index]      = targetPos;

  // Закрываем через замыкание чтобы index не «убежал»
  (function(idx, sym) {
    setTimeout(function() {
      $(REEL_IDS[idx]).style.transition = '';
      finalSymbols[idx] = sym;
      stoppedCount++;
      if (stoppedCount === 3) finishSpin();
    }, 420);
  })(index, targetSym);
}

// ─────────────────────────────────────────────
//  ФИНИШ
// ─────────────────────────────────────────────
function finishSpin() {
  if (!spinning) return;
  spinning = false;

  REEL_IDS.forEach(function(_, i) {
    isSpinning[i] = false;
    if (animationIds[i]) { cancelAnimationFrame(animationIds[i]); animationIds[i] = null; }
  });

  $('spinBtn').disabled    = false;
  $('spinBtn').textContent = 'Крутить!';

  // Гарантируем что finalSymbols заполнены
  finalSymbols = finalSymbols.map(function(s, i) {
    return s || slotSymbols[stopTargets[i]] || slotSymbols[0];
  });

  var s   = finalSymbols;
  var ids = s.map(function(x) { return x ? x.characterId : null; });
  var won = false;

  if (s[0].url === s[1].url && s[1].url === s[2].url) {
    setResult('🎰 ДЖЕКПОТ! Три одинаковых! 🎉🎉🎉', 'win jackpot');
    launchConfetti(80); won = true;

  } else if (ids[0] && ids[0] === ids[1] && ids[1] === ids[2]) {
    setResult('🏆 ПОБЕДА! Три ' + s[0].name + '! Красавчик! 🎊', 'win');
    launchConfetti(50); won = true;

  } else if (ids[0] === ids[1] || ids[1] === ids[2] || ids[0] === ids[2]) {
    var pair = (ids[0] === ids[1] || ids[0] === ids[2]) ? s[0].name : s[1].name;
    setResult('😬 Почти! Два ' + pair + ' — ещё разок!', 'near');

  } else {
    var phrases = [
      'Мимо! 😅 Бака-машина не жалеет никого',
      'Не повезло! 💸 Попробуй ещё',
      'Слот смеётся над тобой 😈',
      'Облом! Карты не в твою пользу 🃏'
    ];
    setResult(phrases[Math.floor(Math.random() * phrases.length)], 'lose');
  }

  // Обновляем статистику пользователя локально
  if (currentUser) {
    currentUser.spins = (currentUser.spins || 0) + 1;
    if (won) currentUser.wins = (currentUser.wins || 0) + 1;
    saveSession();
    updateUserBar();
  }
}

// ─────────────────────────────────────────────
//  КОНФЕТТИ
// ─────────────────────────────────────────────
function launchConfetti(n) {
  var colors = ['#FFD700','#FF4500','#00BFFF','#FF69B4','#7FFF00'];
  for (var i = 0; i < n; i++) {
    var el = document.createElement('div');
    el.style.cssText =
      'position:fixed;top:-10px;pointer-events:none;z-index:9999;' +
      'left:'+(Math.random()*100)+'vw;' +
      'width:'+(6+Math.random()*8)+'px;height:'+(6+Math.random()*8)+'px;' +
      'background:'+colors[Math.floor(Math.random()*colors.length)]+';' +
      'border-radius:'+(Math.random()>.5?'50%':'2px')+';' +
      'animation:confettiFall '+(1.5+Math.random()*2)+'s ease-in forwards;' +
      'animation-delay:'+(Math.random()*0.5)+'s;';
    document.body.appendChild(el);
    el.addEventListener('animationend', function() { this.remove(); });
  }
}

// ─────────────────────────────────────────────
//  ФОЛЛБЭК
// ─────────────────────────────────────────────
function useFallback() {
  var emojis = ['🍋','🍒','🍊','🍇','🔔','⭐','💎','🃏','🎯','🏆'];
  characters  = emojis.map(function(e,i) { return {id:String(i), name:e, variants:[e], rarity:''}; });
  slotSymbols = characters.map(function(c) { return {characterId:c.id, name:c.name, url:c.variants[0], rarity:''}; });
  reelPool = [];
  for (var r = 0; r < 8; r++) slotSymbols.forEach(function(s) { reelPool.push(s); });

  REEL_IDS.forEach(function(rid, index) {
    var reel = $(rid);
    reel.innerHTML = '';
    reelPool.forEach(function(sym) {
      var div = document.createElement('div');
      div.className = 'symbol';
      div.style.cssText = 'height:'+SYM_H+'px;font-size:'+Math.round(SYM_H*.5)+'px;line-height:'+SYM_H+'px;text-align:center;';
      div.textContent = sym.url;
      reel.appendChild(div);
    });
    positions[index] = 0;
    reel.style.transform = 'translateY(0)';
  });

  $('spinBtn').disabled    = false;
  $('spinBtn').textContent = 'Крутить!';
  setResult('');
}

// ─────────────────────────────────────────────
//  ИНИЦИАЛИЗАЦИЯ — ВСЕ СОБЫТИЯ ВЕШАЕМ СРАЗУ
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {

  // ── Вкладки авторизации ──
  $('tab-login').addEventListener('click', function() {
    $('tab-login').classList.add('active');
    $('tab-reg').classList.remove('active');
    $('form-login').style.display = 'block';
    $('form-reg').style.display   = 'none';
  });
  $('tab-reg').addEventListener('click', function() {
    $('tab-reg').classList.add('active');
    $('tab-login').classList.remove('active');
    $('form-reg').style.display   = 'block';
    $('form-login').style.display = 'none';
  });

  // ── Кнопки авторизации ──
  $('login-btn').addEventListener('click', handleLogin);
  $('reg-btn').addEventListener('click', handleRegister);

  // Enter в полях
  ['login-username','login-password'].forEach(function(id) {
    $(id).addEventListener('keydown', function(e) { if (e.key === 'Enter') handleLogin(); });
  });
  ['reg-username','reg-password'].forEach(function(id) {
    $(id).addEventListener('keydown', function(e) { if (e.key === 'Enter') handleRegister(); });
  });

  // ── Кнопки слота ──
  $('logout-btn').addEventListener('click', handleLogout);
  $('spinBtn').addEventListener('click', spin);

  // ── Resize ──
  var resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      if (!spinning && slotSymbols.length > 0) buildReels();
    }, 250);
  });

  // ── Восстановление сессии ──
  try {
    var saved = localStorage.getItem('mss_user');
    if (saved) {
      currentUser = JSON.parse(saved);
      enterSlot();
      return;
    }
  } catch(e) { clearSession(); }

  showScreen('auth');
});

window.addEventListener('beforeunload', function() {
  REEL_IDS.forEach(function(_, i) { if (animationIds[i]) cancelAnimationFrame(animationIds[i]); });
});
