const fs = require('fs');
const axios = require('axios');

const filePath = './slot/Cards.json';
let data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

async function checkLink(url) {
  try {
    const response = await axios.get(url, { validateStatus: false });
    return response.status !== 404;
  } catch (e) {
    return false; // если ошибка запроса, считаем ссылку недоступной
  }
}

(async () => {
  const newData = [];
  for (const item of data) {
    const url = item.link; // если поле с ссылкой называется иначе, замени
    const ok = await checkLink(url);
    if (ok) {
      newData.push(item);
    } else {
      console.log(`Удаляем: ${url}`);
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(newData, null, 2));
})();
