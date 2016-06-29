import { computedFrom, autoinject } from 'aurelia-framework';
import { Router } from 'aurelia-router';

import { KpApp } from '../kp-app';
import { KpEncoder } from '../util/kp-encoder';
import { KpCrypto, EphemeralMessage } from '../util/kp-crypto';
import { ToastMaker } from '../util/toast';
import Clipboard = require('clipboard');

@autoinject
export class MxWriteCustomElement {
  message: string;
  password: string;
  tosAgree = false;

  msgkey: string;
  readUrl: string;

  toastMaker = new ToastMaker();

  constructor(
    private router: Router,
    private kpApp: KpApp
  ) { }

  attached() {
    // Clipboard handles copy events by attaching it to buttons
    // which are decorated them with appropriate parameters
    new Clipboard('#copyReadUrlButton')
  }

  computeReadUrl() {
    this.readUrl = `[${new Date().toString()}]`;
    this.toastMaker.addMessage(`Toasting @ ${this.readUrl}`);
  }

  //@computedFrom('tosAgree', 'message')
  get canSecureMessage(): boolean {
    return this.tosAgree
      && this.message != null
      && this.message.trim().length > 0;
  }

  secureMessage() {
    if (!this.tosAgree) {
      this.toastMaker.addWarning('You have to agree to the Terms of Service before you can continue');
      return;
    }

    let em = new EphemeralMessage();
    em.message = this.message;
    em.password = this.password;

    this.message = null;
    this.password = null;

    KpCrypto.encryptMessage(em).then(() => {
      this.msgkey = KpEncoder.base64UrlEncode(em.mekB64);
      this.readUrl = this.router.generate('mx-read',
        { msgkey:  this.msgkey },
        { absolute: true })

      this.kpApp.emStore = em;
    });
  }

  copyReadUrl() {
    // The actual copying is handled automatically with the use
    // of the Clipboard constructor above which automagically
    // attaches a handler -- we just invoke this method to
    // give the user some visual feedback with a toast
    this.toastMaker.addMessage('URL copied to clipboard');
  }

  openReadUrl() {
    this.router.navigateToRoute("mx-read",
        { msgkey: this.msgkey });
  }

  sendReadUrl() {
    alert('Email sending is not yet enabled');
  }
}
