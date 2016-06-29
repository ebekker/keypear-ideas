import { computedFrom, autoinject } from 'aurelia-framework';

import { KpApp } from '../kp-app';
import { KpCrypto, EphemeralMessage, KpEncoder } from '../util/kp-crypto';
import { ToastMaker } from '../util/toast';
import Clipboard = require('clipboard');

@autoinject
export class MxReadCustomElement {
  toastMaker = new ToastMaker();

  constructor(
    private kpApp: KpApp
  ) { }

  toast() {
    this.toastMaker.addMessage(JSON.stringify(this.kpApp.emStore));
    console.log(JSON.stringify(this.kpApp.emStore));
  }
}
