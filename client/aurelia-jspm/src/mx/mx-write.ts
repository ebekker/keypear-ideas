import {computedFrom} from 'aurelia-framework';

import { ToastMaker } from '../util/toast';

export class MxWriteCustomElement {
  toastMaker = new ToastMaker();
  readUrl: string;
  
  computeReadUrl() {
    this.readUrl = `[${new Date().toString()}]`;
    this.toastMaker.addMessage(`Toasting @ ${this.readUrl}`);
  }

  secureMessage() {
    this.readUrl = 'foo';
  }

  clearMessage() {
    this.readUrl = null;
  }
}
