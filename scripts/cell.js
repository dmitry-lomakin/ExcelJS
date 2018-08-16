'use strict';

export default class Cell {
    constructor({ index, rootElement }) {
        this._index = index;
        this._rootElement = rootElement || document;
    }

    static instance({ index, rootElement }) {
        return new Cell({ index, rootElement });
    }

    static locate(index, rootElement = null) {
        if (! rootElement) {
            rootElement = document;
        }

        return rootElement.querySelector(`[data-index="${ index }"].cell`);
    }

    get value() {
        return this._calculateValue(this._index);
    }

    _calculateValue(index, stack = []) {

        // Protection against cyclic references
        if (stack.includes(index)) {
            throw new ReferenceError('Cyclic reference');
        }

        const cell = Cell.locate(index, this._rootElement);

        if (! cell) {
            return '';
        }

        const value = cell.dataset.value;

        let result = '';

        if ('=' !== value[0]) {
            result = value;
        } else {
            stack.push(index);

            let calculatedValue = value.replace(/[A-Z]+\d+/g, (match) => {
                let substitution = this._calculateValue(match, stack);

                return substitution || match;
            });

            result = eval(calculatedValue.substr(1));
        }

        return result;
    }

    set value(newValue) {
        const cell = Cell.locate(this._index, this._rootElement);

        if (! cell) {
            return;
        }

        let depsNeedUpdating = false;
        if (cell.dataset.value !== newValue) {
            depsNeedUpdating = true;
        }

        cell.dataset.value = newValue;

        this._updateContent(cell);

        if (depsNeedUpdating) {
            this._updateDependencies(cell);
        }
    }

    _updateContent(cell) {
        try {
            cell.innerHTML = this.value;

            const cellsToUpdateCascade = cell.dataset.deps.match(/[A-Z]+\d+/g);
            if (null !== cellsToUpdateCascade) {
                cellsToUpdateCascade.map((cellIndex) => {
                    const depCell = Cell.instance({ index: cellIndex, rootElement: this._rootElement });
                    depCell._updateContent(Cell.locate(cellIndex, this._rootElement));
                });
            }
        } catch (e) {
            cell.innerHTML = `<span class="error-message">&#9888; ${ e.message }</span>`;
        }
    }

    _updateDependencies(cell) {
        // Remove existing dependecies
        this._rootElement.querySelectorAll(`[data-deps~="${ this._index }"].cell`).forEach((eachCell) => {
            const deps = eachCell.dataset.deps.split(',');
            eachCell.dataset.deps = deps.filter((index) => index !== this._index).join(',');
        });

        // Add new dependencies
        const referencingCellIndex = cell.dataset.index;
        const influencingCellIndexes = cell.dataset.value.match(/[A-Z]+\d+/g);

        if (null !== influencingCellIndexes) {
            influencingCellIndexes.map((match) => {
                const matchingCell = Cell.locate(match, this._rootElement);
                let deps = matchingCell.dataset.deps.split(',');
                deps.push(referencingCellIndex);
                matchingCell.dataset.deps = deps.filter((idx) => idx).join(',');
            });
        }
    }

}