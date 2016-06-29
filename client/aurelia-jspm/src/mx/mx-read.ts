import { computedFrom, autoinject } from 'aurelia-framework';

import { KpApp } from '../kp-app';
import { KpEncoder } from '../util/kp-encoder';
import { KpCrypto, EphemeralMessage } from '../util/kp-crypto';
import { ToastMaker } from '../util/toast';
import Clipboard = require('clipboard');

@autoinject
export class MxReadCustomElement {
  msgkey: string;
  password: string;
  tosAgree = false;
  message: string;

  toastMaker = new ToastMaker();

  constructor(
    private kpApp: KpApp
  ) { }

  attached() {
    // Clipboard handles copy events by attaching it to buttons
    // which are decorated them with appropriate parameters
    new Clipboard('#copyMessageButton')
  }

  activate(params, routeConfig, navigationInstruction) {
    if (params.msgkey != undefined) {
      this.msgkey = params.msgkey
    }
  }

  //@computedFrom('msgkey','tosAgree')
  get canRetrieveMessage() : boolean {
    return this.tosAgree
        && this.msgkey != null
        && this.msgkey.trim().length > 0;
  }

  //@computedFrom('message')
  get isMessageRetrieved() : boolean {
    return this.message != null;
  }

  retrieveMessage() {
    if (!this.tosAgree) {
      this.toastMaker.addWarning('You have to agree to the Terms of Service before you can continue');
      return;
    }

    let em = new EphemeralMessage();
    em.mekB64 = KpEncoder.base64UrlUnescape(this.msgkey);
    em.password = this.password;

    em.saltB64 = this.kpApp.emStore.saltB64;
    em.ivB64 = this.kpApp.emStore.ivB64;
    em.messageEncB64 = this.kpApp.emStore.messageEncB64;

    KpCrypto.decryptMessage(em, () => {
      this.message = em.message;
      this.toastMaker.addMessage("Message has been retrieved and decoded");
    });
  }

  copyMessage() {
    // The actual copying is handled automatically with the use
    // of the Clipboard constructor above which automagically
    // attaches a handler -- we just invoke this method to
    // give the user some visual feedback with a toast
    this.toastMaker.addMessage('Message copied to clipboard');
  }
}
