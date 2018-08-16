'use strict';

import Component from './component.js';

export default class Sheet extends Component {
    constructor({ element, rowsCount, columnsCount }) {
        super({ element });

        this._rowCount = rowsCount;
        this._columnsCount = columnsCount;

        this._render();

        this.on('click', '.cell', (event) => {
            const cell = event.delegateTarget;

            // The cell is being edited already
            if (cell.querySelector('input.cell-editor')) {
                return;
            }

            Component._makeNodeEmpty(cell);

            const [ colIndex, rowIndex ] = cell.dataset.index.split(':');

            const input = document.createElement('input');
            input.setAttribute('type', 'text');
            input.classList.add('cell-editor');
            input.addEventListener('blur', (blurEvent) => {
                this._setCellValue(colIndex, rowIndex, blurEvent.target.value);
            });

            cell.appendChild(input);
            input.focus();
        });

        this._element.addEventListener('cellValueChanged', (cellValueChangedEvent) => {
            const [ colIndex, rowIndex ] = cellValueChangedEvent.detail.cellIndex.split(':');

            this._updateCellValue(colIndex, rowIndex);
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
                    data-index="${ column }:${ rowIndex }" 
                    data-value=""></td>`;
    }

    static _convertNumberToColumnCode(num) {
        const previousChars = (num >= 26 ? Sheet._convertNumberToColumnCode(Math.floor(num / 26) - 1) : '');
        const lastChar = String.fromCharCode(65 + (num % 26));

        return previousChars + lastChar;
    }

    _setCellValue(colIndex, rowIndex, newValue) {
        const cell = this._element.querySelector(`[data-index="${ colIndex }:${ rowIndex }"].cell`);

        if (! cell) {
            return;
        }

        const actualCellValue = cell.dataset.value;

        if (newValue !== actualCellValue) {
            cell.dataset.value = newValue;

            this._trigger('cellValueChanged', { 'cellIndex': `${ colIndex }:${ rowIndex }` });
        }
    }

    _updateCellValue(colIndex, rowIndex) {
        const cell = this._element.querySelector(`[data-index="${ colIndex }:${ rowIndex }"].cell`);

        if (! cell) {
            return;
        }

        if ('=' !== cell.dataset.value) {
            cell.innerHTML = cell.dataset.value;
        } else {
            console.log('Calculating ... ');
        }
    }
}