// tslint:disable: no-bitwise

import { NWPMessage, NWPPayload } from './types';
import { crc32 } from './crc';
import { aesCcmEncrypt } from './crypto';
import { int16ToBuffer, bufferToInt16, int32ToBuffer, bufferToInt32 } from './buffer';

function payloadToBuffer(payload: NWPPayload): Uint8Array {
    if (!payload) {
        return new Uint8Array(0);
    }

    const len = 6 + payload.parameters.length;
    const result = new Uint8Array(len);
    result[0] = payload.targetComponent;
    result[1] = payload.targetInstance;
    result[2] = payload.originatorComponent;
    result[3] = payload.originatorInstance;
    int16ToBuffer(payload.commandID, result, 4);
    result.set(payload.parameters, 6);

    return result;
}

export function bufferToPayload(buffer: Uint8Array): NWPPayload {
    const payload = new NWPPayload();

    payload.targetComponent = buffer[0];
    payload.targetInstance = buffer[1];
    payload.originatorComponent = buffer[2];
    payload.originatorInstance = buffer[3];

    payload.commandID = bufferToInt16(buffer, 4);
    payload.parameters = buffer.slice(6, buffer.length);

    return payload;
}

export function messageToBuffer(message: NWPMessage, key: Uint8Array): Uint8Array {
    const header = new Uint8Array(9);
    header[0] = message.length;
    header[1] = message.securityFlags;
    header[2] = message.userStatus;
    int32ToBuffer(message.nonceCounter, header, 3);
    header[7] = message.targetAddress;
    header[8] = message.originatorAddress;

    let payload = payloadToBuffer(message.payload);
    let mac = new Uint8Array(4);

    if ((message.securityFlags & 0x02) === 0x02) {
        const adata = header.slice();

        const iv = new Uint8Array(13);
        iv.set(adata);

        // console.log('key  ', bufferToString(key));
        // console.log('adata', bufferToString(adata));
        // console.log('iv   ', bufferToString(iv));
        // console.log('plain', bufferToString(payload));

        const encrypted = aesCcmEncrypt(payload, key, iv, adata);
        // console.log('enc  ', bufferToString(encrypted));
        payload = encrypted.slice(0, encrypted.length - 4);
        mac = encrypted.slice(encrypted.length - 4);
    }

    const crcInput = new Uint8Array(header.length + payload.length + mac.length);
    crcInput.set(header, 0);
    crcInput.set(payload, header.length);
    crcInput.set(mac, header.length + payload.length)
    const crcValue = crc32(crcInput);
    const crc = new Uint8Array(4);
    int32ToBuffer(crcValue, crc);

    const result = new Uint8Array(crcInput.length + crc.length);
    result.set(crcInput, 0)
    result.set(crc, crcInput.length);
    return result;
}

export function bufferToMessage(buffer: Uint8Array): NWPMessage {
    if (buffer.length < 23) {
        throw new Error('Length must be at least 23 bytes');
    }

    const length = buffer[0];
    if (buffer.length !== length + 1) {
        throw new Error('Length does not match');
    }

    const msg = new NWPMessage();
    msg.length = length;
    msg.securityFlags = buffer[1];
    msg.userStatus = buffer[2];
    msg.nonceCounter = bufferToInt32(buffer, 3);
    msg.targetAddress = buffer[7];
    msg.originatorAddress = buffer[8];

    const from = 9;
    const to = msg.length + 1 - 8;
    const payloadBuffer: Uint8Array = buffer.slice(from, to);

    msg.payload = bufferToPayload(payloadBuffer);
    msg.mac = bufferToInt32(buffer, msg.length + 1 - 8);
    msg.checksum = bufferToInt32(buffer, msg.length + 1 - 4);

    return msg;
}

export function encodeBuffer(buffer: Uint8Array): Uint8Array {
    const result = [];
    result.push(0xAA);
    for (let i = 0; i < buffer.length; i++) {
        const byte = buffer[i];
        if (byte === 0xAA) {
            // console.log('escaping 0xAA');
            result.push(0xA0);
            result.push(0xAB);
        } else if (byte === 0xAD) {
            // console.log('escaping 0xAD');
            result.push(0xA0);
            result.push(0xAE);
        } else if (byte === 0xA0) {
            // console.log('escaping 0xA0');
            result.push(0xA0);
            result.push(0xA1);
        } else {
            result.push(byte);
        }
    }
    result.push(0xAD);

    return new Uint8Array(result);
}

export function decodeBuffer(buffer: number[]): Uint8Array {
    const result = [];
    for (let i = 0; i < buffer.length; ++i) {
        const current = buffer[i];
        if (current === 0xAD || current === 0xAA) {
            // do nothing
        } else if (current === 0xA0 && (i + 1) < buffer.length)  {
            const next = buffer[i + 1];
            if (next === 0xAB) {
                // console.log('unescaping 0xA0 0xAB to 0xAA');
                result.push(0xAA);
            } else if (next === 0xAE) {
                // console.log('unescaping 0xA0 0xAE to 0xAD');
                result.push(0xAD);
            } else if (next === 0xA1) {
                // console.log('unescaping 0xA0 0xA1 to 0xA0');
                result.push(0xA0);
            }
            i++;
        } else {
            result.push(current);
        }
    }

    return Uint8Array.from(result);
}

export function tokenize(encodedBuffer: Uint8Array): Uint8Array[] {
    const tokensCount = Math.ceil(encodedBuffer.length / 20);
    const result: Uint8Array[] = [];

    for (let i = 0; i < tokensCount; i++) {
        result.push(encodedBuffer.slice(i * 20, i * 20 + 20));
    }
    return result;
}
