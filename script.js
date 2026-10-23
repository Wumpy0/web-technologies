// Лабораторная работа №4. Основы JavaScript
// Вариант 3. Тема "Спорт и активность" (вес посылок в кг)

// Исходные данные: вес посылок, которые нужно доставить (в кг)
const packages = [1.5, 8, 3, 12, 0.5, 6, 22];

const HEAVY_LIMIT = 5;           // тяжёлая посылка: вес > 5 кг
const LIGHT_LIMIT = 2;           // лёгкая посылка: вес <= 2 кг
const SECOND_COURIER_LIMIT = 50; // общий вес, при котором нужен второй курьер

// Самая тяжёлая посылка
function findHeaviestPackage(weights) {
    let max = weights[0];
    for (let i = 1; i < weights.length; i++) {
        if (weights[i] > max) {
            max = weights[i];
        }
    }
    return max;
}

// Фильтрация: оставить только тяжёлые посылки (> 5 кг)
function filterHeavyPackages(weights) {
    const heavy = [];
    for (const weight of weights) {
        if (weight > HEAVY_LIMIT) {
            heavy.push(weight);
        }
    }
    return heavy;
}

// Общий вес посылок
function calculateTotalWeight(weights) {
    let sum = 0;
    for (const weight of weights) {
        sum += weight;
    }
    return sum;
}

// Ввод имени пользователя
let userName = prompt("Как вас зовут?", "");
if (userName === null || userName.trim() === "") {
    userName = "курьер";
} else {
    userName = userName.trim();
}

// Цикл по исходному массиву: количество лёгких посылок (<= 2 кг) и их доля
let lightCount = 0;
for (let i = 0; i < packages.length; i++) {
    if (packages[i] <= LIGHT_LIMIT) {
        lightCount++;
    }
}
const lightPercent = (lightCount / packages.length) * 100;

const totalWeight = calculateTotalWeight(packages);
const heavyPackages = filterHeavyPackages(packages);
const heavyWeight = calculateTotalWeight(heavyPackages);
const heaviestPackage = findHeaviestPackage(packages);

// Вывод через alert
alert("Здравствуйте, " + userName + "!\n" +
    "Общий вес груза - " + totalWeight + " кг, из них " + heavyWeight + " кг - тяжёлые посылки.");

// Вывод в консоль
console.log("Вес посылок (кг):", packages);
console.log("Самая тяжёлая посылка: " + heaviestPackage + " кг");
console.log("Доля лёгких посылок: " + lightPercent.toFixed(1) + "%");
console.log("Количество лёгких посылок: " + lightCount);

if (totalWeight > SECOND_COURIER_LIMIT) {
    console.warn("Требуется помощь второго курьера");
}
