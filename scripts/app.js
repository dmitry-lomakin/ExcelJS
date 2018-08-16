'use strict';

import Sheet from './sheet.js';

new Sheet({
    element: document.querySelector('[data-sheet-container]'),
    rowsCount: 1000,
    columnsCount: 100,
});