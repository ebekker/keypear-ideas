import { computedFrom } from 'aurelia-framework';

import { KpCrypto, EphemeralMessage } from '../util/kp-crypto';
import { ToastMaker } from '../util/toast';

export class MxWriteCustomElement {
  message: string;
  password: string;
  tosAgree = false;
  readUrl: string;

  toastMaker = new ToastMaker();

  emStore: EphemeralMessage;
  
  computeReadUrl() {
    this.readUrl = `[${new Date().toString()}]`;
    this.toastMaker.addMessage(`Toasting @ ${this.readUrl}`);
  }

  //@computedFrom('tosAgree', 'message')
  get canSecureMessage() : boolean {
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
      this.readUrl = em.mekB64;
      this.emStore = em;
    });
  }

  clearMessage() {
    let em = new EphemeralMessage()
    em.saltB64 = this.emStore.saltB64;
    em.ivB64 = this.emStore.ivB64;
    em.messageEncB64 = this.emStore.messageEncB64;

    em.mekB64 = this.readUrl;

    KpCrypto.decryptMessage(em, () => {
      this.message = em.message;
      this.readUrl = null;
    });
  }

  copyReadUrl() {
    this.toastMaker.addMessage('URL copied to clipboard');
  }

  openReadUrl() {

  }

  sendReadUrl() {
    alert('Email sending is not yet enabled');
  }
}
