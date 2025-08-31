/***************** Настройки *****************/
const JSON_PATH = "./Cards.json";      // файл рядом с этим HTML
const REPEAT = 8;                      // сколько случайных карт перед финальной
const BASE_DURATION = 1200;            // длительность анимации для 1-го барабана (мс)
const STEP_DURATION = 900;             // дополнительная длительность для каждого следующего (мс)
const BUFFER_AFTER = 120;              // буфер перед проверкой (мс)
/*********************************************/

const reels = [document.getElementById("r0"), document.getElementById("r1"), document.getElementById("r2")];
const spinBtn = document.getElementById("spin");
const resultEl = document.getElementById("result");
let images = []; // массив строк-URL

async function loadCards() {
  try {
    if (location.protocol === "file:") {
      resultEl.textContent = "⚠️ Запустите через локальный сервер, а не file://";
    }
    const res = await fetch(JSON_PATH);
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
    } else {
      reels.forEach(r => {
        r.innerHTML = `<img src="${images[Math.floor(Math.random()*images.length)]}" alt="">`;
      });
    }
  } catch (err) {
    console.error("Ошибка загрузки Cards.json:", err);
    resultEl.textContent = "⚠️ Не удалось загрузить Cards.json";
    spinBtn.disabled = true;
  }
}

function randUrl() {
  return images[Math.floor(Math.random()*images.length)];
}

function buildTrack(reelEl, finalUrl) {
  return new Promise((resolve) => {
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

    const imgs = Array.from(track.querySelectorAll("img"));
    let loaded = 0;
    function checkDone() {
      loaded++;
      if (loaded >= imgs.length) {
        const trackHeight = track.scrollHeight;
        const viewH = reelEl.clientHeight;
        const totalShift = Math.max(0, trackHeight - viewH);
        resolve({ track, totalShift });
      }
    }
    if (imgs.length === 0) {
      resolve({ track, totalShift: 0 });
    } else {
      imgs.forEach(img => {
        if (img.complete) checkDone();
        else {
          img.addEventListener("load", checkDone);
          img.addEventListener("error", checkDone);
        }
      });
    }
  });
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

  built.forEach(({ track, totalShift }, i) => {
    const duration = BASE_DURATION + i * STEP_DURATION;
    track.style.transition = "none";
    track.style.transform = `translateY(0px)`;
    setTimeout(() => {
      track.style.transition = `transform ${duration}ms cubic-bezier(0.22,1,0.36,1)`;
      track.style.transform = `translateY(-${totalShift}px)`;
    }, 30);
  });

  const lastDuration = BASE_DURATION + (reels.length - 1) * STEP_DURATION;
  await new Promise(res => setTimeout(res, lastDuration + BUFFER_AFTER));

  const win = finals[0] && finals[0] === finals[1] && finals[1] === finals[2];
  resultEl.textContent = win ? "🎉 Выиграли!" : "Проебали?";
  spinBtn.disabled = false;
}

spinBtn.addEventListener("click", spin);
loadCards();
