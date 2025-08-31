/***************** Настройки *****************/
const JSON_PATH = "./Cards.json";      // файл рядом с этим HTML
const REPEAT = 8;                      // сколько случайных карт перед финальной
const BASE_DURATION = 1200;            // длительность анимации для 1-го барабана (мс)
const STEP_DURATION = 900;             // дополнительная длительность для каждого следующего (мс)
const BUFFER_AFTER = 120;              // буфер перед проверкой (мс)
/*********************************************/

const reels = [
  document.getElementById("r0"),
  document.getElementById("r1"),
  document.getElementById("r2")
];
const spinBtn = document.getElementById("spin");
const resultEl = document.getElementById("result");
let images = []; // массив строк-URL

// блокируем кнопку пока не загрузим ссылки
spinBtn.disabled = true;

async function loadCards() {
  try {
    if (location.protocol === "file:") {
      resultEl.textContent = "⚠️ Запустите через локальный сервер (http://...), fetch с file:// не работает.";
      spinBtn.disabled = true;
      return;
    }

    const res = await fetch(JSON_PATH, { cache: "no-cache" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const raw = await res.json();

    if (!Array.isArray(raw)) throw new Error("Cards.json должен быть массивом");

    images = raw.map(item => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object") {
        return item.url || item.image || item.img || item.src || "";
      }
      return "";
    }).filter(Boolean);

    if (images.length === 0) {
      resultEl.textContent = "⚠️ Cards.json пуст или в неправильном формате.";
      spinBtn.disabled = true;
      return;
    }

    // заполнить превью в барабанах одной случайной картинкой
    reels.forEach(r => {
      r.innerHTML = `<div class="track"><img src="${images[Math.floor(Math.random()*images.length)]}" alt=""></div>`;
    });

    // разрешаем крутить
    spinBtn.disabled = false;
    resultEl.textContent = "";

    // префетчим картинки в фоне (ускоряет следущую загрузку)
    images.forEach(u => {
      const img = new Image();
      img.src = u;
    });

  } catch (err) {
    console.error("Ошибка загрузки Cards.json:", err);
    resultEl.textContent = "⚠️ Не удалось загрузить Cards.json (см. консоль)";
    spinBtn.disabled = true;
  }
}

function randUrl() {
  return images[Math.floor(Math.random()*images.length)];
}

function waitForImagesInTrack(track) {
  const imgs = Array.from(track.querySelectorAll("img"));
  if (imgs.length === 0) return Promise.resolve();
  return new Promise(resolve => {
    let loaded = 0;
    function checkDone() {
      loaded++;
      if (loaded >= imgs.length) resolve();
    }
    imgs.forEach(img => {
      if (img.complete) checkDone();
      else {
        img.addEventListener("load", checkDone, { once: true });
        img.addEventListener("error", checkDone, { once: true });
      }
    });
  });
}

async function buildTrack(reelEl, finalUrl) {
  // собираем дорожку: REPEAT случайных + финальная
  reelEl.innerHTML = "";
  const track = document.createElement("div");
  track.className = "track";

  for (let k = 0; k < REPEAT; k++) {
    const img = document.createElement("img");
    img.src = randUrl();
    track.appendChild(img);
  }

  const finalImg = document.createElement("img");
  finalImg.src = finalUrl;
  finalImg.dataset.final = "1";
  track.appendChild(finalImg);

  reelEl.appendChild(track);

  // ждём загрузки всех картинок в дорожке
  await waitForImagesInTrack(track);

  // вычисляем на сколько нужно сдвинуть дорожку вверх,
  // чтобы показать конец (финальную картинку)
  const trackHeight = track.scrollHeight;
  const viewH = reelEl.clientHeight;
  const totalShift = Math.max(0, trackHeight - viewH);

  return { track, totalShift };
}

async function spin() {
  if (!images.length) {
    resultEl.textContent = "⏳ Ссылки ещё не загрузились...";
    return;
  }

  spinBtn.disabled = true;
  resultEl.textContent = "";

  const finals = [randUrl(), randUrl(), randUrl()];
  const buildPromises = reels.map((r, i) => buildTrack(r, finals[i]));
  const built = await Promise.all(buildPromises);

  // запускаем анимации с разной длительностью
  built.forEach(({ track, totalShift }, i) => {
    const duration = BASE_DURATION + i * STEP_DURATION;

    // сброс (без анимации)
    track.style.transition = "none";
    track.style.transform = `translateY(0px)`;

    // форсируем релоад (reflow)
    // eslint-disable-next-line no-unused-expressions
    track.getBoundingClientRect();

    // через RAF задаём transition + transform (чтобы браузер применил начальное состояние)
    requestAnimationFrame(() => {
      track.style.transition = `transform ${duration}ms cubic-bezier(0.22,1,0.36,1)`;
      track.style.transform = `translateY(-${totalShift}px)`;
    });
  });

  // ждём окончания самого долгого барабана + небольшой буфер
  const lastDuration = BASE_DURATION + (reels.length - 1) * STEP_DURATION;
  await new Promise(res => setTimeout(res, lastDuration + BUFFER_AFTER));

  const win = finals[0] && finals[0] === finals[1] && finals[1] === finals[2];
  resultEl.textContent = win ? "🎉 Выиграли!" : "Проебали?";
  spinBtn.disabled = false;
}

spinBtn.addEventListener("click", spin);
loadCards();
