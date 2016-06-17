declare module 'scryptsy' {
    /**
     * Derives a key using the [SCrypt](https://en.wikipedia.org/wiki/Scrypt)
     * key-derivation function.
     * 
     * @param key	    The key, either Buffer or string.
     * @param salt      The salt, either Buffer or string.
     * @param n         The number of iterations, integer.
     * @param r         The memory factor, integer.
     * @param p         The parallelization factor, integer.
     * @param keyLenBytes The number of bytes to return, integer.
     * @param progress  Callback to invoke on every 1000 ops.
     * @returns Returns a Buffer.
     */
    function scrypt(
        key: String | ArrayBuffer,
        salt : String | ArrayBuffer,
        n: Number,
        r: Number,
        p: Number,
        keyLenBytes: Number,
        progress?: (current: Number, total: Number, percent: Number) => void): ArrayBuffer;
    
    export = scrypt;
}
