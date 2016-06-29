import { bindable } from 'aurelia-framework';

/**
 * Custom Element to render toast messages.
 */
export class ToastCustomElement {
    @bindable toastMaker: ToastMaker;
}

/**
 * Message container Model for a Toast element.
 * Attach one of these to a ToastCustomElement
 * (<toast toast-maker.bind='...'></toast>) and
 * manage the messages displayed through it.
 */
export class ToastMaker {
    messages = [];
    warnings = [];

    addMessage(msg: string) {
        this.messages.push(msg);
    }

    addWarning(msg: string) {
        this.warnings.push(msg);
    }
}
