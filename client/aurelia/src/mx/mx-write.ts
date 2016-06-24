//import {computedFrom} from 'aurelia-framework';
import {autoinject} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import b64 = require('base64-js');
import scrypt = require('scryptsy');
import Firebase = require('firebase');

import {KpApp} from '../kpapp';
import {KpCrypto} from '../kpcrypto';

const textEncoder = new TextEncoder('utf-8');
const textDecoder = new TextDecoder('utf-8');

const fb = new Firebase('https://keypearmx.firebaseio.com');


@autoinject
export class KeypearMxWrite {
  heading: string = 'Write an Ephemeral Message';
  message: string;
  password: string;
  tosAgree: boolean;
  readUrl = '';
  thisUrl = '';

  constructor(
      private kpApp: KpApp,
      private kpCrypto: KpCrypto,
      private router: Router) {}

  //@computedFrom('tosAgree', 'message')
  get canSubmit() : boolean {
    return this.tosAgree
        && this.message != null
        && this.message.trim().length > 0;
  }

  submit() {
    // Generate a random, secure 256-bit master encryption key and salt
    let mek = new Uint8Array(256/8);
    let salt = new Uint8Array(256/8);
    crypto.getRandomValues(mek);
    crypto.getRandomValues(salt);

    // Encode the encryption key, this will be used for looking up the message later
    let mekB64 = b64.fromByteArray(mek);
    let saltB64 = b64.fromByteArray(salt);

    // Compute the SHA256 digest which will be used as a lookup key in storage
    crypto.subtle.digest("SHA-256", mek).then((dig: ArrayBuffer) => {
      let digArr = new Uint8Array(dig);
      let digB64 = b64.fromByteArray(digArr);

      let deriveKeyAlgor = {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100,
        hash: 'SHA-256'
      };
      let deriveKeyType = {
        name: 'AES-CBC',
        length: 256
      };

      crypto.subtle.importKey('raw', mek, {name:'PBKDF2'}, false,
          ['deriveBits','deriveKey']).then((mekKey: CryptoKey) => {

          crypto.subtle.deriveKey(deriveKeyAlgor, mekKey, deriveKeyType,
              false, ['encrypt','decrypt']).then((dekKey: CryptoKey) => {

                // Encode the message string as a byte array
                let dat = textEncoder.encode(this.message);
                // Generate a random IV for seeding AES-CBC
                let iv = new Uint8Array(16);
                crypto.getRandomValues(iv);

                // Encode the IV later to be persisted
                let ivB64 = b64.fromByteArray(iv);

                let encryptAlgor = { name:'AES-CBC', iv: iv }
                crypto.subtle.encrypt(encryptAlgor, dekKey, dat).then((crypt: ArrayBuffer) => {
                  let cryptB64 = b64.fromByteArray(new Uint8Array(crypt));

                  // Save to FB:
                  //    digEnc: { iv: ivEnc, crypt: cryptEnc }

                  let now = new Date();
                  let exp = new Date(now.getMilliseconds() + (7 * 24 * 60 * 60 * 1000));
                  fb.auth("AIzaSyDEWtu3SrAPTKAWRXIaByNrcW5J5fE2t9A", (err, res) => {
                    fb.child('messages/(' + digB64.replace(/\//g, '_') + ")").set({
                      salt: saltB64.replace(/\//g, '_'),
                      iv: ivB64.replace(/\//g, '_'),
                      crypt: cryptB64.replace(/\//g, '_'),
                      createdTS: now.toISOString(),
                      createdMS: now.getTime(),
                      expiresTS: exp.toISOString(),
                      expiresMS: exp.getTime()
                    }).then(() => {
                      this.computeReadUrl(mekB64);
                      this.message = '';
                      this.password = '';
                    });
                  })
                });
              })
        });
    }).catch((error: any) => {
      alert('Error: ' + error)
    });
  }

  computeReadUrl(mekB64: string) {
    this.readUrl = this.router.generate('mx-msg',
        {msgkey: mekB64.replace(/\//g, '_')},
        // TODO: This does not appear to be working???
        {absolute: true});

    // Kludge because Router support for absolute URLs isn't working:
    if (!this.readUrl.match(/^http/i)) {
      this.readUrl = `${document.location.origin}/${this.readUrl}`;
    }
  }

  copyReadUrl(readUrlTextbox: any) {
    readUrlTextbox.select();
    document.execCommand('copy');
  }

  gotoReadUrl() {
    alert("Should navigate to: " + this.readUrl);
  }

  canDeactivate(): boolean {
    if (this.message != null && this.message != '' && this.readUrl == '') {
      return confirm('You\'ve entered a message without securing it.\r\n'
          + 'Are you sure you want to leave?');
    }
  }
}

export class UpperValueConverter {
  toView(value: string): string {
    return value && value.toUpperCase();
  }
}
