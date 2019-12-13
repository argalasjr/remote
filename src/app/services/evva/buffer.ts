// tslint:disable: no-bitwise

export function int32ToBuffer(int32: number, array: Uint8Array, index: number = 0) {
    array[index] = (int32 >> 24) & 0xFF;
    array[index + 1] = (int32 >> 16) & 0xFF;
    array[index + 2] = (int32 >> 8) & 0xFF;
    array[index + 3] = int32 & 0xFF;
}

export function bufferToInt32(buffer: Uint8Array, index: number = 0): number {
    return (buffer[index] << 24 | buffer[index + 1] << 16 | buffer[index + 2] << 8 | buffer[index + 3]);
}

export function int16ToBuffer(int16: number, array: Uint8Array, index: number = 0) {
    array[index] = (int16 >> 8) & 0xFF;
    array[index + 1] = int16 & 0xFF;
}

export function bufferToInt16(buffer: Uint8Array, index: number = 0): number {
    return (buffer[index] << 8 | buffer[index + 1]);
}

export function bufferToString(buffer: Uint8Array): string {
    const array = Array.from(buffer);
    return array.map(v => {
        const s = v.toString(16);
        return s.length === 2 ? s : '0' + s;
    }).join('').toUpperCase();
}

export function stringToBuffer(string: string): Uint8Array {
    const result: number[] = [];
    for (let i = 0; i < string.length; i += 2) {
        const byteStr = string.slice(i, i + 2);
        const num = Number.parseInt(byteStr, 16);
        result.push(num);
    }
    return new Uint8Array(result);
}
