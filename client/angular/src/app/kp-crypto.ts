
import { OAuthService } from 'angular2-oauth2/oauth-service';

import b64 = require('base64-js');
import txt = require('text-encoding');

const textEncoder = new TextEncoder('utf-8');
const textDecoder = new TextDecoder('utf-8');

export class KpCrypto {

    static encryptMessage(msg: EphemeralMessage) {
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
                let dat = textEncoder.encode(msg.message);
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
                  /*
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
                  */
                });
              })
        });
    }).catch((error: any) => {
      alert('Error: ' + error)
    });

    }  
 
}

export class EphemeralMessage {
    message: string;
    password: string;
    
    key: Uint8Array;
    keyB64: string;
    
    iv: Uint8Array;
    ivB64: string;
    
    messageEnc: Uint8Array;
    messageEncB64: string;
}