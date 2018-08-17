'use strict';

import Component from './component.js';
import Cell from './cell.js';
import CellEditor from "./cell-editor.js";

export default class Sheet extends Component {
    constructor({ element, rowsCount, columnsCount }) {
        super({ element });

        this._rowCount = rowsCount;
        this._columnsCount = columnsCount;

        this._render();

        this.on('click', '.cell', (event) => {
            const cell = event.delegateTarget;
            const cellIndex = cell.dataset.index;
            CellEditor.edit(cell, (blurEvent) => {
                this._cell(cellIndex).value = blurEvent.target.value.toUpperCase();
            });
        });
    }

    _render() {
        let html = `<table class="exceljs-sheet"><thead><tr><th></th>`;
        for (let columnIndex = 0; columnIndex < this._columnsCount; columnIndex++) {
            html += `<th>${ Sheet._convertNumberToColumnCode(columnIndex) }</th>`;
        }
        html += `</tr></thead>`;

        for (let rowIndex = 1; rowIndex <= this._rowCount; rowIndex++) {
            html += `<tr><th>${ rowIndex }</th>`;
            for (let columnIndex = 0; columnIndex < this._columnsCount; columnIndex++) {
                html += `<td class="cell"
                    data-index="${ Sheet._convertNumberToColumnCode(columnIndex) }${ rowIndex }" 
                    data-deps=""
                    data-value=""></td>`;
            }
            html += `</tr>`;
        }

        html += `</table>`;

        this._element.innerHTML = html;
    }

    _cell(index) {
        return Cell.instance({ index, rootElement: this._element });
    }

    static _convertNumberToColumnCode(num) {
        const previousChars = (num >= 26 ? Sheet._convertNumberToColumnCode(Math.floor(num / 26) - 1) : '');
        const lastChar = String.fromCharCode(65 + (num % 26));

        return previousChars + lastChar;
    }
}
