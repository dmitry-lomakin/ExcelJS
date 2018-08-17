'use strict';

import Component from "./component.js";

export default class CellEditor {
    static edit(tableCell, onChange) {
        const INPUT_CLASS = 'cell-editor';

        // Check if the cell is being edited already
        // If so, do nothing
        if (tableCell.querySelector('input.' + INPUT_CLASS)) {
            return;
        }

        Component._emptyNode(tableCell);

        const input = document.createElement('input');
        input.setAttribute('type', 'text');
        input.classList.add(INPUT_CLASS);
        input.value = tableCell.dataset.value;
        input.addEventListener('keypress', (event) => {
            if (13 === event.which || 13 === event.keyCode) {
                event.target.blur();
            }
        });
        input.addEventListener('blur', onChange);
        tableCell.appendChild(input);
        input.focus();
    }
}
