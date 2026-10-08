// ==UserScript==
// @name         auchan-prices.user.js
// @version      0.12
// @description  Сортирует по выгоде и показывает цену за кг/л/шт! Нужно авторизоваться и нажать ссылку слева снизу.
// @author       You
// @match        https://www.auchan.ru/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=auchan.ru
// @grant        GM_addStyle
// @homepage     https://github.com/shtrih/userscripts
// @supportURL   https://github.com/shtrih/userscripts/issues
// @updateURL    https://github.com/shtrih/userscripts/raw/refs/heads/main/auchan-prices-sort.user.js
// ==/UserScript==

// чтобы не обрезались названия товаров, т.к вес в конце
GM_addStyle('p.styles_productCardContentPanel_name__gtZfG { display: block; }');

(function () {
    'use strict';

    const linkHTML = '<a id="fix-prices" href="#" style="display: block; position: fixed; bottom: 16px; left: 4px; z-index: 1000;">🔄️Обновить цены</a>';
    document.body.insertAdjacentHTML('beforeend', linkHTML);

    const link = document.querySelector('#fix-prices');

    link.addEventListener('click', (e) => {
        e.preventDefault()

        // Удалить карусель, чтобы карточки из нее не мешали
        const carousel = document.querySelector('.styles_shelf__8O8sy');
        if (carousel !== null) {
            carousel.remove();
        }

        const productCards = document.querySelectorAll('.styles_productCard__xH9l_'),
            productTitleSelector = '.styles_productCardContentPanel_name__gtZfG',
            productPriceSelector = '.styles_productCardContentPanel_price__CCJjV',
            extractPriceValue = text => text.match(/^((\d+\s?)+[,]\d+)/)[0].replaceAll(' ', '').replaceAll(',', '.'),
            perWeightSel = '.styles_productCardContentPanel_type__lon8x'
        ;
        const productList = []; // 0 - price, 1 - node
        let productContainer = null;

        productCards.forEach(card => {
            // Удаляем скрытые товары
            if (card.classList.contains("hidden")) {
                card.remove();
                return;
            }

            const title = card.querySelector(productTitleSelector).textContent,
                weightMatches = title.match(/(\d+)\s*(гр?|мл)\s?$/),
                weightMatchesKilo = title.match(/(\d*[,.]?\d+)\s*(кг|л)$/),
                byWeight = title.match(/\sвес$/),
                byQuantity = title.match(/(\d+)\s*шт$/),
                price = card.querySelector(productPriceSelector),
                isPer100g = card.querySelector(perWeightSel).textContent === 'Цена за 100 г',
                isPer1kg = card.querySelector(perWeightSel).textContent === 'Цена за 1 кг'
            ;
            if (price) {
                if (byQuantity != null) {
                    const quantity = byQuantity[1],
                        pricePerItem = parseFloat(extractPriceValue(price.textContent) / quantity),
                        newPriceHTML = `<div>${pricePerItem.toFixed(2)} ₽ / шт</div>`
                    ;
                    //console.log(quantity, pricePerItem);
                    price.insertAdjacentHTML('beforeend', newPriceHTML);
                    productList.push([pricePerItem, card]);
                } else if (byWeight != null || isPer1kg) {
                    let pricePerKG = parseFloat(extractPriceValue(price.textContent));
                    if (isPer100g) {
                        pricePerKG = pricePerKG * 10;
                    }
                    let total = `<div>${pricePerKG.toFixed(2)} ₽ / кг</div>`
                    if (isPer1kg) {
                        if (weightMatches != null || weightMatchesKilo != null) {
                            let weight = weightMatches != null ? weightMatches[1] : weightMatchesKilo[1].replace(',', '.');
                            // Больше 1000 гр → переводим в кг
                            if (weight >= 1000) {
                                weight = weight / 1000
                            }
                            const totalPrice = pricePerKG * weight
                            total = `<div>${totalPrice.toFixed(2)} ₽ / всего</div>`
                        }
                    }
                    price.insertAdjacentHTML('beforeend', total);
                    productList.push([pricePerKG, card]);
                } else if (weightMatches != null || weightMatchesKilo != null) {
                    const weight = weightMatches != null ? weightMatches[1] : weightMatchesKilo[1].replace(',', '.') * 1000,
                        priceValue = extractPriceValue(price.textContent),
                        pricePerKG = (isPer100g ? 10 : 1) * (priceValue / weight * 1000),
                        newPriceHTML = `<div>${pricePerKG.toFixed(2)} ₽ / ${weightMatches != null ? weightMatches[2].replace('мл', 'л').replace('г', 'кг').replace('гр', 'кг') : weightMatchesKilo[2]}</div>`
                    ;
                    //console.log(weight, priceValue);
                    price.insertAdjacentHTML('beforeend', newPriceHTML);
                    productList.push([pricePerKG, card]);

                }

                if (!productContainer) {
                    productContainer = card.parentNode
                }
            }
        });

        productList.sort(function (a, b) {
            return a[0] == b[0]
                ? 0
                : (a[0] > b[0] ? 1 : -1);
        });

        for (let i = 0; i < productList.length; ++i) {
            productContainer.appendChild(productList[i][1]);
        }
    })
})();