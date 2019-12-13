import * as aes from 'aes-js';
import { codec, cipher, mode } from 'sjcl';
import { bufferToString, stringToBuffer } from './buffer';
export function random(length) {
    // console.warn('Temporal solution for debug purpose only!');
    // return stringToBuffer('7A256D633F4D7098DE17A0F5A09BDC04772DFC4ABA3F4F18AF59A346D3DFF452');
    var result = new Uint8Array(length);
    for (var i = 0; i < length; i++) {
        result[i] = Math.floor(Math.random() * 255);
    }
    return result;
}
export function rotateRight(buffer) {
    return new Uint8Array([buffer[buffer.length - 1]].concat(Array.from(buffer.slice(0, buffer.length - 1))));
}
export function aesCbcEncrypt(plaintext, key, iv) {
    var aesCbc = new aes.ModeOfOperation.cbc(key, iv);
    return aesCbc.encrypt(plaintext);
}
export function aesCbcDecrypt(encrypted, key, iv) {
    var aesCbc = new aes.ModeOfOperation.cbc(key, iv);
    return aesCbc.decrypt(encrypted);
}
export function aesCcmEncrypt(plaintext, key, iv, adata) {
    var c = function (bytes) { return codec.hex.toBits(bufferToString(bytes)); };
    var aes = new cipher.aes(c(key));
    var ct = mode.ccm.encrypt(aes, c(plaintext), c(iv), c(adata), 32);
    return stringToBuffer(codec.hex.fromBits(ct));
}
export function aesCcmDecrypt(encrypted, key, iv, adata) {
    var c = function (bytes) { return codec.hex.toBits(bufferToString(bytes)); };
    var aes = new cipher.aes(c(key));
    var pt = mode.ccm.decrypt(aes, c(encrypted), c(iv), c(adata), 32);
    return stringToBuffer(codec.hex.fromBits(pt));
}
export function test() {
    var key = stringToBuffer('7A256D633F4D709802F57526E790CF27AF59A346D3DFF452CF583319B561D39B');
    var pt = stringToBuffer('01000600AB0C0000');
    var iv = stringToBuffer('18220000000000020100000000');
    var adata = stringToBuffer('182200000000000201');
    var ct = aesCcmEncrypt(pt, key, iv, adata);
    console.log(bufferToString(ct));
    var ct2 = stringToBuffer('2173AA085CB94FD2A85FE633');
    var pt2 = aesCcmDecrypt(ct2, key, iv, adata);
    console.log(bufferToString(pt2));
}
export function testCBC() {
    var key = stringToBuffer('2C397DF010ABA4A6F6F78C960B6E20D7D9BC08424D1BFC2B60E0CA07D12D4FE2');
    var iv = new Uint8Array(16);
    var encRndB = stringToBuffer('DD1A83D3568ED8B2B8639B11F9936F97C4A9B072AEE1D81EAE2EA0F9AD160D95');
    var aesCbc = new aes.ModeOfOperation.cbc(key, iv);
    var rndB = aesCbc.decrypt(encRndB);
    console.log('         Random B', bufferToString(rndB));
    var rndA = random(32);
    console.log('         Random A', bufferToString(rndA));
    var rotRndB = rotateRight(rndB);
    console.log('  Rotate Random B', bufferToString(rotRndB));
    var iv2 = encRndB.slice(16, encRndB.length);
    console.log('              IV2', bufferToString(iv2));
    var rndArotRndB = new Uint8Array(rndA.length + rotRndB.length);
    rndArotRndB.set(rndA, 0);
    rndArotRndB.set(rotRndB, rndA.length);
    console.log('RND A + ROT RND B', bufferToString(rndArotRndB));
    var aesCbc2 = new aes.ModeOfOperation.cbc(key, iv2);
    var encBuf = aesCbc2.encrypt(rndArotRndB);
    console.log(' encrypted buffer', bufferToString(encBuf));
}
//# sourceMappingURL=crypto.js.map