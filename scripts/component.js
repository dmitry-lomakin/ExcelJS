'use strict';

export default class Component {
    constructor({ element }) {
        this._element = element;
    }

    _trigger(eventName, data) {
        let customEvent = new CustomEvent(eventName, {
            detail: data
        });

        this._element.dispatchEvent(customEvent);
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

    static _makeNodeEmpty(node) {
        while (node.firstChild) {
            node.removeChild(node.firstChild);
        }
    }

}
