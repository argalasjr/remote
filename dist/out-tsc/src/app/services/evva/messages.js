import { bufferToInt16, stringToBuffer } from './buffer';
import { aesCbcDecrypt, aesCbcEncrypt, random, rotateRight } from './crypto';
import { BusAddress, Command, Component, NWPMessage, SecurityFlags, UserStatus } from './types';
// Battery
var BatteryResponse = /** @class */ (function () {
    function BatteryResponse() {
    }
    BatteryResponse.parse = function (message) {
        var response = new BatteryResponse();
        response.indicator = message.payload.parameters[0];
        response.level = message.payload.parameters[1];
        return response;
    };
    return BatteryResponse;
}());
export { BatteryResponse };
export function batteryRequest() {
    var msg = new NWPMessage();
    msg.length = 22;
    msg.securityFlags = SecurityFlags.REQ;
    msg.userStatus = UserStatus.NOT_APPLICABLE;
    msg.nonceCounter = 0;
    msg.setTarget(BusAddress.OEC, Component.COMP_CORE);
    msg.setOriginator(BusAddress.OCH, Component.COMP_OCH);
    msg.payload.commandID = Command.GET_BATTERY_REQ;
    return msg;
}
// Version
var VersionResponse = /** @class */ (function () {
    function VersionResponse() {
    }
    VersionResponse.parse = function (message) {
        var response = new VersionResponse;
        var params = message.payload.parameters;
        response.componentType = params.slice(0, 16);
        response.bootloaderMajor = bufferToInt16(params, 16);
        response.bootloaderMinor = bufferToInt16(params, 18);
        response.firmwareFormat = bufferToInt16(params, 20);
        response.fwMajor = bufferToInt16(params, 22);
        response.fwMinor = bufferToInt16(params, 24);
        response.fwVariant = params.slice(26, 26 + 16);
        return response;
    };
    return VersionResponse;
}());
export { VersionResponse };
export function versionRequest() {
    var msg = new NWPMessage();
    msg.length = 22;
    msg.securityFlags = SecurityFlags.REQ;
    msg.userStatus = UserStatus.NOT_APPLICABLE;
    msg.nonceCounter = 0;
    msg.setTarget(BusAddress.OEC, Component.COMP_CORE);
    msg.setOriginator(BusAddress.OCH, Component.COMP_OCH);
    msg.payload.commandID = Command.GET_VERSION_REQ;
    return msg;
}
// Sync start
var SyncStartResponse = /** @class */ (function () {
    function SyncStartResponse() {
    }
    SyncStartResponse.parse = function (message) {
        var response = new SyncStartResponse();
        var params = message.payload.parameters;
        response.status = bufferToInt16(params, 0);
        response.encRndB = params.slice(2, 2 + 32);
        response.nonce = message.nonceCounter;
        return response;
    };
    return SyncStartResponse;
}());
export { SyncStartResponse };
export function syncStartRequest() {
    var msg = new NWPMessage();
    msg.length = 25;
    msg.securityFlags = SecurityFlags.REQ;
    msg.userStatus = UserStatus.NOT_APPLICABLE;
    msg.nonceCounter = 0;
    msg.setTarget(BusAddress.OEC, Component.COMP_SESSION);
    msg.setOriginator(BusAddress.OCH, Component.COMP_SESSION);
    msg.payload.commandID = Command.SYNC_START_REQ;
    // using odd key = false
    // authorizationID = 0x0002
    msg.payload.parameters = new Uint8Array([0x00, 0x00, 0x02]);
    return msg;
}
var SyncEndResponse = /** @class */ (function () {
    function SyncEndResponse() {
    }
    SyncEndResponse.parse = function (message) {
        var response = new SyncEndResponse();
        var params = message.payload.parameters;
        response.status = bufferToInt16(params, 0);
        response.encRndARot = params.slice(2, 2 + 32);
        response.nonce = message.nonceCounter;
        return response;
    };
    return SyncEndResponse;
}());
export { SyncEndResponse };
export function syncEndRequest(syncStartResponse, session) {
    var msg = new NWPMessage();
    msg.length = 88;
    msg.securityFlags = SecurityFlags.REQ;
    msg.userStatus = UserStatus.NOT_APPLICABLE;
    msg.nonceCounter = syncStartResponse.nonce + 1;
    msg.setTarget(BusAddress.OEC, Component.COMP_SESSION);
    msg.setOriginator(BusAddress.OCH, Component.COMP_SESSION);
    msg.payload.commandID = Command.SYNC_END_REQ;
    msg.payload.parameters = new Uint8Array([
        0x00,
        0x00
    ].concat(Array.from(session.encRndArndBRotR)));
    return msg;
}
export function computeSession(keyString, syncStartResponse) {
    var key = stringToBuffer(keyString);
    var iv = new Uint8Array(16);
    var encRndB = syncStartResponse.encRndB;
    var rndB = aesCbcDecrypt(encRndB, key, iv);
    // console.log('         Random B', bufferToString(rndB));
    var rndA = random(32);
    // console.log('         Random A', bufferToString(rndA));
    var rotRndB = rotateRight(rndB);
    // console.log('  Rotate Random B', bufferToString(rotRndB));
    var iv2 = encRndB.slice(16, encRndB.length);
    // console.log('              IV2', bufferToString(iv2));
    var rndArotRndB = new Uint8Array(rndA.length + rotRndB.length);
    rndArotRndB.set(rndA, 0);
    rndArotRndB.set(rotRndB, rndA.length);
    // console.log('RND A + ROT RND B', bufferToString(rndArotRndB));
    var encBuf = aesCbcEncrypt(rndArotRndB, key, iv2);
    // console.log(' encrypted buffer', bufferToString(encBuf));
    return {
        encRndArndBRotR: encBuf,
        nonceCounter: 0,
        rndA: rndA,
        rndB: rndB,
        session: new Uint8Array(Array.from(rndA.slice(0, 8)).concat(Array.from(rndB.slice(0, 8)), Array.from(rndA.slice(24, 32)), Array.from(rndB.slice(24, 32))))
    };
}
// Disengage
var DisengageResponse = /** @class */ (function () {
    function DisengageResponse() {
    }
    DisengageResponse.parse = function (message) {
        var response = new DisengageResponse();
        response.switchedRelais = message.payload.parameters[0];
        response.relaisState = message.payload.parameters[1];
        return response;
    };
    return DisengageResponse;
}());
export { DisengageResponse };
export function disengageRequest(mode) {
    var msg = new NWPMessage();
    msg.length = 24;
    msg.securityFlags = SecurityFlags.S_REQ_EVEN;
    msg.userStatus = UserStatus.NOT_APPLICABLE;
    msg.nonceCounter = 0;
    msg.setTarget(BusAddress.OEC, Component.COMP_BCU);
    msg.setOriginator(BusAddress.OCH, Component.COMP_OCH);
    msg.payload.commandID = Command.DISENGAGE_REQ;
    msg.payload.parameters = new Uint8Array([
        0x00,
        mode // mode - given as parameter
    ]);
    return msg;
}
//# sourceMappingURL=messages.js.map