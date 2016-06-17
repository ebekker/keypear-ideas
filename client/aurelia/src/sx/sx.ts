//import {computedFrom} from 'aurelia-framework';
import b64 = require('base64-js');
import scrypt = require('scryptsy');

const textEncoder = new TextEncoder('utf-8');
const textDecoder = new TextDecoder('utf-8');

export class KeypearSx {
  heading: string = 'Welcome to Keypear SX';

  digInput: string = "Enter value to be digested";
  digOutput: string;
  digOutput2: string;

  mkeySalt = 'e85c53e7f119d41fd7895cdc9d7bb9dd';
  mkeyPass = 'foobar'; // 'I hëart årt and £$¢!';

  buf: string = '';
  msg: string = '';

  //Getters can't be directly observed, so they must be dirty checked.
  //However, if you tell Aurelia the dependencies, it no longer needs to dirty check the property.
  //To optimize by declaring the properties that this getter is computed from, uncomment the line below
  //as well as the corresponding import above.
  //@computedFrom('firstName', 'lastName')
  get fullName(): string {
    return ""; //`${this.firstName} ${this.lastName}`;
  }

  submit() {
  }

  doHash() {
    var digPromise: Promise<Uint8Array> = crypto.subtle.digest("SHA-256", textEncoder.encode(this.digInput));
    digPromise.then((v: ArrayBuffer) => {
      this.digOutput = b64.fromByteArray(new Uint8Array(v));
      this.digOutput2 = b64.fromByteArray(textEncoder.encode(this.digInput));
    }).catch((error: any) => {
      this.digOutput = "CAUGHT: " + error
    });
  }

  doDeriveMasterKeyByPbkdf2() {
    let salt = textEncoder.encode(this.mkeySalt);
    let pass = textEncoder.encode(this.mkeyPass);

    let deriveAlgor = {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100,
      hash: 'SHA-256'
    };
    let deriveKeyType = {
      name: 'AES-CBC',
      length: 256
    };

    this.msg += "--PBKDF2----------------------------\n";
    crypto.subtle.importKey('raw', pass, {name:'PBKDF2'}, false, ['deriveBits','deriveKey']
        ).then((passKey: CryptoKey) => {
          this.msg += "Got passKey\n";
          crypto.subtle.deriveKey(deriveAlgor, passKey, deriveKeyType,
              true, ['encrypt','decrypt']).then((masterKey: CryptoKey) => {
                this.msg += "Got MasterKey\n";
                crypto.subtle.exportKey("raw", masterKey).then((buffer) => {
                  this.msg += `Got Buffer [${buffer},${buffer.byteLength}]\n`;
                  this.buf = b64.fromByteArray(new Uint8Array(buffer));
                });
              })
        });

  }

  doDeriveMasterKeyByScrypt() {
    let salt = textEncoder.encode(this.mkeySalt);
    let pass = textEncoder.encode(this.mkeyPass);

    this.msg += "--SCRYPT----------------------------\n";

    var p = new Promise<ArrayBuffer>((resolve) => {
      setTimeout((resolve: (value:ArrayBuffer)=>void) => {
        resolve(scrypt(pass, salt, 16384, 8, 1, 32, (cur, tot, pct) => {
          setImmediate(() => { this.msg += '*'; })
        }));
      }, 100, resolve);
    });

    p.then((val) => {
      let mkey = val;
      this.msg += `Got MasterKey in promise [${mkey.byteLength}]\n`;
      this.buf = b64.fromByteArray(new Uint16Array(mkey));
    });
  }


  canDeactivate(): boolean {
    if (this.fullName !== "") { //this.previousValue) {
      return confirm('Are you sure you want to leave?');
    }
  }
}

export class UpperValueConverter {
  toView(value: string): string {
    return value && value.toUpperCase();
  }
}
