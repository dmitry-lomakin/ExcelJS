'use strict';

import Component from './component.js';
import Cell from './cell.js';

export default class Sheet extends Component {
    constructor({ element, rowsCount, columnsCount }) {
        super({ element });

        this._rowCount = rowsCount;
        this._columnsCount = columnsCount;

        this._render();

        this.on('click', '.cell', (event) => {
            const cell = event.delegateTarget;

            // Check if the cell is being edited already
            // If so, do nothing
            if (cell.querySelector('input.cell-editor')) {
                return;
            }

            const initialCellContent = cell.innerHTML;

            Component._makeNodeEmpty(cell);

            const cellIndex = cell.dataset.index;

            const input = document.createElement('input');
            input.setAttribute('type', 'text');
            input.classList.add('cell-editor');
            input.value = cell.dataset.value;
            input.addEventListener('blur', (blurEvent) => {
                this._setCellValue(cellIndex, blurEvent.target.value, initialCellContent);
            });
            cell.appendChild(input);
            input.focus();
        });

        this._element.addEventListener('cellValueChanged', (cellValueChangedEvent) => {
            this._updateCellValue(cellValueChangedEvent.detail.cellIndex);
        });
    }

    _render() {
        let html = `<table class="exceljs-sheet">`;

        for (let rowIndex = 1; rowIndex <= this._rowCount; rowIndex++) {
            html += `<tr>`;
            for (let columnIndex = 0; columnIndex < this._columnsCount; columnIndex++) {
                html += Sheet._renderCell(rowIndex, columnIndex);
            }
            html += `</tr>`;
        }

        html += `</table>`;

        this._element.innerHTML = html;
    }

    static _renderCell(rowIndex, columnIndex) {
        const column = Sheet._convertNumberToColumnCode(columnIndex);

        return `<td class="cell"
                    data-index="${ column }${ rowIndex }" 
                    data-value=""></td>`;
    }

    static _convertNumberToColumnCode(num) {
        const previousChars = (num >= 26 ? Sheet._convertNumberToColumnCode(Math.floor(num / 26) - 1) : '');
        const lastChar = String.fromCharCode(65 + (num % 26));

        return previousChars + lastChar;
    }

    _setCellValue(cellIndex, newValue, initialCellContent) {
        const cell = Cell.locate(cellIndex, this._element);

        if (! cell) {
            return;
        }

        Component._makeNodeEmpty(cell);

        const actualCellValue = cell.dataset.value;

        if (newValue !== actualCellValue) {
            cell.dataset.value = newValue;

            this._trigger('cellValueChanged', { 'cellIndex': `${ cellIndex }` });
        } else {
            cell.innerHTML = initialCellContent;
        }
    }

    _updateCellValue(cellIndex) {
        const cell = Cell.locate(cellIndex, this._element);

        if (! cell) {
            return;
        }

        try {
            cell.innerHTML = this._getCellValue(cellIndex);
        } catch (e) {
            cell.innerHTML = `<span class="error-message">&#9888; ${ e.message }</span>`;
        }
    }

    _getCellValue(cellIndex, stack = []) {

        // Protection against cyclic references
        if (stack.includes(cellIndex)) {
            throw new ReferenceError('Cyclic reference');
        }

        const cell = Cell.locate(cellIndex, this._element);

        if (! cell) {
            return '';
        }

        const value = cell.dataset.value;

        let result = '';

        if ('=' !== value[0]) {
            result = value;
        } else {
            stack.push(cellIndex);

            let calculatedValue = value.replace(/[A-Z]+\d+/g, (match) => {
                return this._getCellValue(match, stack);
            });

            result = eval(calculatedValue.substr(1));

        }

        return result;
    }
}