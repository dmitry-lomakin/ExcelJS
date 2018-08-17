'use strict';

let expect = chai.expect;
let assert = chai.assert;
let spy = chai.spy;

import Sheet from '../scripts/sheet.js';

describe('Sheet component', () => {

    it('should convert numbers into correct [A-Z]+ sequences', () => {
        assert.equal(Sheet._convertNumberToColumnCode(0), 'A');
        assert.equal(Sheet._convertNumberToColumnCode(26), 'AA');
        assert.equal(Sheet._convertNumberToColumnCode(781), 'ADB');
    });

});

import Cell from '../scripts/cell.js';

describe('Cell component', () => {

    it('should make sure that the value getter executes the _calculateValue() method with appropriate arguments', () => {
        const cell = Cell.instance({ index: 123 });
        const cellSpy = spy.on(cell, '_calculateValue');

        cell.value;

        expect(cellSpy).to.have.been.called.with.exactly(123);
    });

    it('should check how _calculateValue() is protected against cyclic references', () => {
        const cell = Cell.instance({ index: 123 });

        expect(() => cell._calculateValue('C3', [ 'A1', 'C3' ])).to.throw(ReferenceError, 'Cyclic reference');
    });

    it('should make sure that _calculateValue() returns non-processed values for cells that don\'t contain functions', () => {
        const cell = Cell.instance({ index: 123 });
        spy.on(cell, '_cellByIndex', () => {
            return { dataset: { value: 100500 } };
        });

        assert.equal(cell._calculateValue('A1'), 100500);
    });

    it('should make sure that _calculateValue() returns processed values for cells that contain functions', () => {
        const cell = Cell.instance({ index: 123 });
        spy.on(cell, '_cellByIndex', () => {
            return { dataset: { value: '=3*3' } };
        });

        assert.equal(cell._calculateValue('A1'), 9);
    });

    it('should make sure that _calculateValue() uses actual values for cells that contain functions that have references to other cells', () => {
        const cell = Cell.instance({ index: 123 });
        spy.on(cell, '_cellByIndex', (ret) => {
            if ('A1' === ret) {
                return { dataset: { value: '=8*B1' } };
            } else if ('B1' === ret) {
                return { dataset: { value: '8' } };
            }
        });

        assert.equal(cell._calculateValue('A1'), 64);
    });

});
