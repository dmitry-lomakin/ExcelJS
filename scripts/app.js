'use strict';

import Sheet from './sheet.js';

new Sheet({
    element: document.querySelector('[data-sheet-container]'),
    rowsCount: 30,
    columnsCount: 10,
});