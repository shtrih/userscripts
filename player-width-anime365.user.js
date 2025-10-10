// ==UserScript==
// @name         anime365 Player width
// @namespace    http://tampermonkey.net/
// @version      2025-07-17
// @description  Max player width relates on page width
// @author       You, chatgpt
// @match        https://anime365.ru/*
// @match        https://anime-365.ru/*
// @match        https://hentai365.ru/*
// @match        https://smotret-anime.com/*
// @match        https://smotret-anime.net/*
// @match        https://smotret-anime.org/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=anime-365.ru
// @grant        GM_addStyle
// @homepage     https://github.com/shtrih/userscripts
// @supportURL   https://github.com/shtrih/userscripts/issues
// ==/UserScript==

(function() {
    'use strict';

    const styleId = 'custom-style-by-url';
    const css = `
.container {
  max-width: 100% !important;
  width: 99%;
}
.container > .row > :last-child {
  max-width: 350px;
}
@media only screen and (min-width: 1600px) and (max-width: 2209px) {
  .container > .row > :first-child {
    width: 78% !important;
  }
}
@media only screen and (min-width: 2210px) {
  .container > .row > :first-child {
    width: 84% !important;
  }
}
.m-translation-view__share {
  display: none;
}
`;

    function addStyle() {
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = css;
            document.head.appendChild(style);
        }
    }

    function removeStyle() {
        const style = document.getElementById(styleId);
        if (style) style.remove();
    }

    function handleUrlChange() {
        const path = location.pathname;

        if (path.startsWith('/catalog')) {
            addStyle();
        } else {
            removeStyle();
        }
    }

    // Для начальной загрузки
    handleUrlChange();

    // Для SPA: перехват изменений истории
    const pushState = history.pushState;
    const replaceState = history.replaceState;

    function hookHistory(fn) {
        return function () {
            fn.apply(history, arguments);
            setTimeout(handleUrlChange, 150); // даём странице обновиться
        };
    }

    history.pushState = hookHistory(pushState);
    history.replaceState = hookHistory(replaceState);
    window.addEventListener('popstate', handleUrlChange);
})();