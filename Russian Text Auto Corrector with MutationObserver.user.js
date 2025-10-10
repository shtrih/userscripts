// ==UserScript==
// @name         Russian Text Auto Corrector with MutationObserver
// @namespace    https://chat.deepseek.com/a/chat/s/70ace19f-fd54-44bb-829c-45782400d9a7
// @version      1.0
// @description  Автоматически исправляет ошибки в русском тексте на веб-страницах, включая динамический контент.
// @author       DeepSeek
// @match        https://dtf.ru/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_listValues
// @homepage     https://github.com/shtrih/userscripts
// @supportURL   https://github.com/shtrih/userscripts/issues
// @updateURL    https://github.com/shtrih/userscripts/raw/refs/heads/main/Russian%20Text%20Auto%20Corrector%20with%20MutationObserver.user.js
// ==/UserScript==
// Если нужно сбросить статистику:
// Object.keys(replacements).forEach((error) => GM_setValue(error, 0));

(function() {
    'use strict';

    // Список замен (ошибка → исправление)
    const replacements = {
        "настольги": "ностальги",
        "по этому": "поэтому",
        "зделать": "сделать",
        "через чюр": "черезчур",
        "в течении": "в течение",
        "так же": "также",
        "[ ]([.?!,])": "$1",
        "дурачек": "дурачок",
        "девченк":"девчонк",
        "вообщем": "в общем",
        "в ни куда": "вникуда",
        "ни куда": "никуда",
        "ни кто": "никто",
        "еться": "ется",
        "по-": "по",
        "по[ ]([а-яё]+(ай|ть))": "по$1",
        "лудш": "лучш",
        "(по)[ ](больше|меньше|проще)":"$1$2",
        "от туда": "оттуда",
        "что бы":"чтобы",
        "в складчину":"вскладчину",
        "из вне":"извне",
        "в купе":"вкупе",
        "на вскидку":"навскидку",
        // Добавьте свои правила здесь
    };

    // Загрузка статистики
    let stats = {};
    for (const error of Object.keys(replacements)) {
        stats[error] = GM_getValue(error, 0); // Загружаем сохраненное значение или 0
    }

    // Функция проверки, находится ли элемент внутри contenteditable
    function isInsideEditable(node) {
        let parent = node.parentNode;
        while (parent && parent !== document.body) {
            if (parent.contentEditable === 'true') {
                return true;
            }
            parent = parent.parentNode;
        }
        return false;
    }

    // Функция для замены текста в узле
    function replaceText(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            // Пропускаем текст внутри редактируемых элементов
            if (isInsideEditable(node)) {
                return;
            }

            let text = node.nodeValue;
            for (const [error, correction] of Object.entries(replacements)) {
                const regex = new RegExp(error, 'gi');
                const matches = text.match(regex);
                if (matches) {
                    stats[error] += matches.length; // Увеличиваем счетчик
                    GM_setValue(error, stats[error]); // Сохраняем новое значение
                }
                text = text.replace(regex, correction);
            }
            node.nodeValue = text;
        } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE') {
            // Рекурсивно обрабатываем дочерние узлы
            node.childNodes.forEach(replaceText);
        }
    }

    // Функция для вывода статистики
    function showStats() {
        let total = 0;
        console.log("Статистика замен:");
        for (const [error, count] of Object.entries(stats)) {
            if (count === 0) {
                continue
            }
            console.log(`${error}: ${count} замен`);
            total += count;
        }
        console.log(`Общее количество замен: ${total}`);
    }

    // Наблюдатель за изменениями в DOM
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                replaceText(node);
            });
        });
        //showStats(); // Показываем статистику после изменений
    });

    // Запуск наблюдателя
    observer.observe(document.body, {
        childList: true,    // Отслеживать добавление/удаление дочерних элементов
        subtree: true        // Отслеживать изменения во всем поддереве DOM
    });

    // Применяем замены к уже загруженному контенту
    replaceText(document.body);
    showStats(); // Показываем статистику после первоначальной обработки
})();