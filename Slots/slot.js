// Папка с картами
const BASE_PATH = 'downloaded_cards/';

// Список персонажей (папки)
const characters = [
    'IronMan',
    'SpiderMan',
    'CaptainAmerica',
    'Hulk',
    'BlackWidow',
    'Thor',
    'DoctorStrange',
    'Wolverine'
    // добавь сюда свои папки
];

// Кол-во карт в каждой папке (если разное — можно считать автоматически)
const IMAGES_PER_CHARACTER = 5; // например, по 5 карт в каждой папке

// Получить случайный элемент массива
function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function spinReel(reelId) {
    const reel = document.getElementById(reelId);

    // Выбираем случайного персонажа
    const character = getRandomElement(characters);

    // Рандомное изображение в папке персонажа
    const imgNumber = Math.floor(Math.random() * IMAGES_PER_CHARACTER) + 1;
    const imgPath = `${BASE_PATH}${character}/${imgNumber}.png`;

    // Очищаем прошлое
    reel.innerHTML = '';

    // Добавляем новую картинку
    const img = document.createElement('img');
    img.src = imgPath;

    // Начальная позиция (анимация сверху вниз)
    img.style.top = '-100%';

    reel.appendChild(img);

    // Старт анимации
    setTimeout(() => {
        img.style.top = '0';
    }, 100);
}

document.getElementById('spinButton').addEventListener('click', () => {
    spinReel('reel1');
    spinReel('reel2');
    spinReel('reel3');
});
