const fs = require('fs');
const axios = require('axios');

const filePath = './slot/Cards.json';
let data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

async function checkLink(url) {
  try {
    const response = await axios.get(url, { validateStatus: false });
    return response.status !== 404;
  } catch (e) {
    return false; // ошибка запроса → считаем ссылку недоступной
  }
}

(async () => {
  const newData = [];
  for (const url of data) {
    const ok = await checkLink(url);
    if (ok) {
      newData.push(url);
    } else {
      console.log(`❌ Удаляем: ${url}`);
    }
  }

  console.log(`✅ Осталось ссылок: ${newData.length} (из ${data.length})`);
  fs.writeFileSync(filePath, JSON.stringify(newData, null, 2));
})();
