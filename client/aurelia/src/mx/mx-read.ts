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
export class KeypearMxRead {
  heading: string = 'Read an Ephemeral Message';
  messageKey = '';
  message = '';
  password: string;
  tosAgree: boolean;

  constructor(
      private kpApp: KpApp,
      private kpCrypto: KpCrypto) {}

  activate(params, routeConfig, navigationInstruction) {
    if (params.msgkey != undefined) {
      this.messageKey = params.msgkey
    }
  }
  
  //@computedFrom('tosAgree', 'messageKey')
  get canSubmit() : boolean {
    return this.tosAgree
        && this.messageKey != null
        && this.messageKey.trim().length > 0;
  }
  
  submit() {
    let mekB64 = this.messageKey;
    let mek = b64.toByteArray(mekB64);

    // Compute the SHA256 digest which will be used as a lookup key in storage
    crypto.subtle.digest("SHA-256", mek).then((dig: ArrayBuffer) => {
      let digArr = new Uint8Array(dig);
      let digB64 = b64.fromByteArray(digArr);

      fb.auth("AIzaSyDEWtu3SrAPTKAWRXIaByNrcW5J5fE2t9A", (err, res) => {
        let msgNodeRef = fb.child('messages/(' + digB64.replace(/\//g, '_') + ")");
        msgNodeRef.once('value').then((snap: FirebaseDataSnapshot) => {
          if (!snap.exists()) {
            alert('The specified message key does not exist or has already expired.');
            return;
          }

          let msgNode  = snap.val();
          let saltB64  = msgNode.salt;
          let ivB64    = msgNode.iv;
          let cryptB64 = msgNode.crypt;

          let salt  = b64.toByteArray(saltB64.replace(/_/g, '/'));
          let iv    = b64.toByteArray(ivB64.replace(/_/g, '/'));
          let crypt = b64.toByteArray(cryptB64.replace(/_/g, '/'));

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

                    let encryptAlgor = { name:'AES-CBC', iv: iv }
                    crypto.subtle.decrypt(encryptAlgor, dekKey, crypt).then((clear: ArrayBuffer) => {
                      let txt = textDecoder.decode(new Uint8Array(clear));
                      this.message = txt;
                    });
                  });
              });
        }).catch((err) => {
          alert('Failed to read message: ' + err);
        });
      })
    }).catch((error: any) => {
      // TODO: show error
    });
  }
}
