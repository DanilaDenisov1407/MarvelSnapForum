import fs from "fs/promises";

const API_URL = "https://marvelsnapzone.com/getinfo/?searchtype=cards&searchcardstype=true";

// убирает служебные теги вида <color=#ff2c2c>...</color> и лишние ! в начале
function clean(str) {
  return (str || "")
    .replace(/<[^>]+>/g, "")
    .trim();
}

async function main() {
  const res = await fetch(API_URL, {
    headers: { "User-Agent": "Mozilla/5.0" }
  });
  if (!res.ok) throw new Error(`Ошибка загрузки: ${res.status}`);

  const raw = await res.json();
  const rawCards = raw.success.cards;

  const cards = rawCards
    .filter(c => c.status === "released")   // только вышедшие карты, без тестовых/скилл-карт
    .filter(c => c.type !== "Ability")       // на всякий случай убираем не-персонажей, если такие есть
    .map(c => ({
      id: c.carddefid,
      name: clean(c.name),
      power: c.power,
      cost: c.cost,
      description: clean(c.ability),
      image: clean(c.art)
    }))
    .filter(c => c.name.length > 0);

  const output = {
    updated: new Date().toISOString().slice(0, 10),
    cards
  };

  await fs.mkdir("data", { recursive: true });
  await fs.writeFile("data/cards.json", JSON.stringify(output, null, 2));
  console.log(`Сохранено карт: ${cards.length}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
