import * as b64 from 'base64-js';

export class KpEncoder {
    static base64UrlEscape(dat: string) : string {
        return dat.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    }

    static base64UrlUnescape(dat: string) : string {
        console.log(`dat.length before = ${dat.length}`)
        dat = dat.replace(/_/g, '/').replace(/\-/g, '+') + "=".repeat(4 - dat.length % 4);
        console.log(`dat.length after = ${dat.length} : ${dat}`)
        return dat;
    }

    static base64UrlEncode(dat: string|Uint8Array) : string {
        if (typeof(dat) == 'Uint8Array') {
            dat = b64.fromByteArray(dat);
        }
        return this.base64UrlEscape(dat);
    }

    static base64UrlDecode(dat: string) : Uint8Array {
        dat = this.base64UrlUnescape(dat);
        return b64.toByteArray(dat);
    }
}
