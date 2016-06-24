import {computedFrom} from 'aurelia-framework';

import { ToastMaker } from '../util/toast';

export class MxReadCustomElement {
  toastMaker = new ToastMaker();

  toast() {
    this.toastMaker.addMessage('foo');
  }
}
