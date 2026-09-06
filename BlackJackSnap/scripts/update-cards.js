import fs from "fs/promises";

const API_URL = "https://marvelsnapzone.com/getinfo/?searchtype=cards&searchcardstype=true";

async function main() {
  const res = await fetch(API_URL, {
    headers: { "User-Agent": "Mozilla/5.0" } // некоторые сайты блокируют запросы без UA
  });
  if (!res.ok) throw new Error(`Ошибка загрузки: ${res.status}`);

  const raw = await res.json();
  console.log(JSON.stringify(raw).slice(0, 500)); // временно — чтобы увидеть реальную структуру

  // TODO: здесь нужно подставить реальные поля из raw
  // (структура ответа marvelsnapzone не была проверена в чате,
  // её нужно один раз посмотреть глазами — см. шаг 2)
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
