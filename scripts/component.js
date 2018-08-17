'use strict';

export default class Component {
    constructor({ element }) {
        this._element = element;
    }

    on(eventName, selector, callback) {
        this._element.addEventListener(eventName, (event) => {
            let delegateTarget = event.target.closest(selector);

            if (!delegateTarget) {
                return;
            }

            event.delegateTarget = delegateTarget;

            callback(event);
        });
    }

    static _emptyNode(node) {
        while (node.firstChild) {
            node.removeChild(node.firstChild);
        }
    }
}
