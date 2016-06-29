
import * as b64 from 'base64-js';
import * as txt from 'text-encoding';

const textEncoder = new txt.TextEncoder('utf-8');
const textDecoder = new txt.TextDecoder('utf-8');


export class EphemeralMessage {
    message: string;
    password: string;

    salt: Uint8Array;
    saltB64: string;

    mek: Uint8Array;
    mekB64: string;

    sig: Uint8Array;
    sigB64: string;

    iv: Uint8Array;
    ivB64: string;

    messageEnc: Uint8Array;
    messageEncB64: string;
}

export class KpCrypto {

    static encryptMessage(em: EphemeralMessage, fn?:()=>any) {
        // Generate a random, secure 256-bit master encryption key and salt
        em.mek = new Uint8Array(256 / 8);
        em.salt = new Uint8Array(256 / 8);
        crypto.getRandomValues(em.mek);
        crypto.getRandomValues(em.salt);

        // This will be the "lookup key" to identify
        // and unlock the message later on
        em.mekB64 = b64.fromByteArray(em.mek);
        em.saltB64 = b64.fromByteArray(em.salt);

        return this.applyKey(em, true, fn);
    }

    static decryptMessage(em: EphemeralMessage, fn?:()=>any) {
        em.mek = b64.toByteArray(em.mekB64);
        em.salt = b64.toByteArray(em.saltB64);

        return this.applyKey(em, false, fn);
    }

    private static applyKey(em: EphemeralMessage, encrypt: boolean, fn?:()=>any) {
        let p = crypto.subtle.digest("SHA-256", em.mek).then((dig: ArrayBuffer) => {
            // Compute a digest of the encryption key, this
            // will be used for looking up the message later
            em.sig = new Uint8Array(dig);
            em.sigB64 = b64.fromByteArray(em.sig);

            crypto.subtle.importKey('raw', em.mek, {name:'PBKDF2'}, false,
                    ['deriveBits','deriveKey']).then((mekKey: CryptoKey) => {
                let deriveKeyAlgor = {
                    name: 'PBKDF2',
                    salt: em.salt,
                    iterations: 100,
                    hash: 'SHA-256'
                };
                let deriveKeyType = {
                    name: 'AES-CBC',
                    length: 256
                };
                crypto.subtle.deriveKey(deriveKeyAlgor, mekKey, deriveKeyType,
                        false, ['encrypt','decrypt']).then((dekKey: CryptoKey) => {

                    let dat: Uint8Array;

                    if (encrypt) {
                        // Encode the message string as a byte array
                        dat = textEncoder.encode(em.message);
                        // Generate a random IV for seeding AES-CBC
                        em.iv = new Uint8Array(16);
                        crypto.getRandomValues(em.iv);
                        // Encode the IV to be persisted later
                        em.ivB64 = b64.fromByteArray(em.iv);
                    }
                    else {
                        // Decode the IV
                        em.iv = b64.toByteArray(em.ivB64);
                        // Decode the encrypted message
                        em.messageEnc = b64.toByteArray(em.messageEncB64);
                        dat = em.messageEnc;
                    }

                    // Setup the encryptiong/decryption parameters
                    let encryptAlgor = {
                        name: 'AES-CBC',
                        iv: em.iv,
                    };

                    // Either encrypt or decrypt
                    if (encrypt) {
                        crypto.subtle.encrypt(encryptAlgor, dekKey, dat).then((crypt: ArrayBuffer) => {
                            em.messageEnc = new Uint8Array(crypt);
                            em.messageEncB64 = b64.fromByteArray(em.messageEnc);

                            if (fn != null) {
                                fn();
                            }
                        })
                    }
                    else {
                        crypto.subtle.decrypt(encryptAlgor, dekKey, dat).then((clear: ArrayBuffer) => {
                            em.message = textDecoder.decode(new Uint8Array(clear));
                            
                            if (fn != null) {
                                fn();
                            }
                        })
                    }
                });
            });
        });

        return p;
    }


    foo() {

        // // Compute the SHA256 digest which will be used as a lookup key in storage
        // crypto.subtle.digest("SHA-256", mek).then((dig: ArrayBuffer) => {
        //   let digArr = new Uint8Array(dig);
        //   let digB64 = b64.fromByteArray(digArr);

        //   let deriveKeyAlgor = {
        //     name: 'PBKDF2',
        //     salt: salt,
        //     iterations: 100,
        //     hash: 'SHA-256'
        //   };
        //   let deriveKeyType = {
        //     name: 'AES-CBC',
        //     length: 256
        //   };

        //   crypto.subtle.importKey('raw', mek, {name:'PBKDF2'}, false,
        //       ['deriveBits','deriveKey']).then((mekKey: CryptoKey) => {

        //       crypto.subtle.deriveKey(deriveKeyAlgor, mekKey, deriveKeyType,

        //           false, ['encrypt','decrypt']).then((dekKey: CryptoKey) => {

        //             // Encode the message string as a byte array
        //             let dat = textEncoder.encode(msg.message);
        //             // Generate a random IV for seeding AES-CBC
        //             let iv = new Uint8Array(16);
        //             crypto.getRandomValues(iv);

        //             // Encode the IV later to be persisted
        //             let ivB64 = b64.fromByteArray(iv);

        //             let encryptAlgor = { name:'AES-CBC', iv: iv }
        //             crypto.subtle.encrypt(encryptAlgor, dekKey, dat).then((crypt: ArrayBuffer) => {
        //               let cryptB64 = b64.fromByteArray(new Uint8Array(crypt));

        //               // Save to FB:
        //               //    digEnc: { iv: ivEnc, crypt: cryptEnc }

        //               let now = new Date();
        //               let exp = new Date(now.getMilliseconds() + (7 * 24 * 60 * 60 * 1000));
        //               /*
        //               fb.auth("AIzaSyDEWtu3SrAPTKAWRXIaByNrcW5J5fE2t9A", (err, res) => {
        //                 fb.child('messages/(' + digB64.replace(/\//g, '_') + ")").set({
        //                   salt: saltB64.replace(/\//g, '_'),
        //                   iv: ivB64.replace(/\//g, '_'),
        //                   crypt: cryptB64.replace(/\//g, '_'),
        //                   createdTS: now.toISOString(),
        //                   createdMS: now.getTime(),
        //                   expiresTS: exp.toISOString(),
        //                   expiresMS: exp.getTime()
        //                 }).then(() => {
        //                   this.computeReadUrl(mekB64);
        //                   this.message = '';
        //                   this.password = '';
        //                 });
        //               })
        //               */
        //             });
        //           })
        //     });
        // })

        // catch((error: any) => {
        //   alert('Error: ' + error)
        // });

    }

}

export class KpEncoder {
    static base64UrlEncode(dat: string|Uint8Array) : string {
        if (typeof(dat) == 'Uint8Array') {
            dat = b64.fromByteArray(dat);
        }
        return dat.replace(/\+/g, '-').replace(/\\/g, '_').replace(/=/g, '');
    }

    static base64UrlDecode(dat: string) : Uint8Array {
        dat = dat.replace(/_/g, '/').replace(/\-/g, '+');
        return b64.toByteArray(dat);
    }
}
