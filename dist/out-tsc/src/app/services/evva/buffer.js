// tslint:disable: no-bitwise
export function int32ToBuffer(int32, array, index) {
    if (index === void 0) { index = 0; }
    array[index] = (int32 >> 24) & 0xFF;
    array[index + 1] = (int32 >> 16) & 0xFF;
    array[index + 2] = (int32 >> 8) & 0xFF;
    array[index + 3] = int32 & 0xFF;
}
export function bufferToInt32(buffer, index) {
    if (index === void 0) { index = 0; }
    return (buffer[index] << 24 | buffer[index + 1] << 16 | buffer[index + 2] << 8 | buffer[index + 3]);
}
export function int16ToBuffer(int16, array, index) {
    if (index === void 0) { index = 0; }
    array[index] = (int16 >> 8) & 0xFF;
    array[index + 1] = int16 & 0xFF;
}
export function bufferToInt16(buffer, index) {
    if (index === void 0) { index = 0; }
    return (buffer[index] << 8 | buffer[index + 1]);
}
export function bufferToString(buffer) {
    var array = Array.from(buffer);
    return array.map(function (v) {
        var s = v.toString(16);
        return s.length === 2 ? s : '0' + s;
    }).join('').toUpperCase();
}
export function stringToBuffer(string) {
    var result = [];
    for (var i = 0; i < string.length; i += 2) {
        var byteStr = string.slice(i, i + 2);
        var num = Number.parseInt(byteStr, 16);
        result.push(num);
    }
    return new Uint8Array(result);
}
//# sourceMappingURL=buffer.js.map