// ==UserScript==
// @name         twitch_points_clicker.user.js
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.twitch.tv/*
// @grant        none
// @homepage     https://github.com/shtrih/userscripts
// @supportURL   https://github.com/shtrih/userscripts/issues
// ==/UserScript==

(function() {
    'use strict';
    const checkIntervalSec = 2 * 60;

    function clickBonus() {
        console.log(Date(), 'Checking claimable points…');

        let bonus = document.querySelector('.claimable-bonus__icon');
        if (bonus) {
            bonus.click();
            console.log('Success.');
        }
    }

    setInterval(clickBonus, checkIntervalSec * 1000);
})();