'use strict';

export default class Cell {
    static locate(index, rootElement = null) {
        if (! rootElement) {
            rootElement = document;
        }

        return rootElement.querySelector(`[data-index="${ index }"].cell`);
    }
}