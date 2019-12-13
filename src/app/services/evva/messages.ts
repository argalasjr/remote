import { bufferToInt16, stringToBuffer } from './buffer';
import { aesCbcDecrypt, aesCbcEncrypt, random, rotateRight } from './crypto';
import { BusAddress, Command, Component, DisengageMode, NWPMessage, SecurityFlags, UserStatus } from './types';

// Battery
export class BatteryResponse {
    indicator: number;
    level: number;

    static parse(message: NWPMessage): BatteryResponse {
        const response = new BatteryResponse();
        response.indicator = message.payload.parameters[0];
        response.level = message.payload.parameters[1];
        return response;
    }
}

export function batteryRequest(): NWPMessage {
    const msg = new NWPMessage();
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
export class VersionResponse {
    componentType: Uint8Array;
    bootloaderMajor: number;
    bootloaderMinor: number;
    firmwareFormat: number;
    fwMajor: number;
    fwMinor: number;
    fwVariant: Uint8Array;

    static parse(message: NWPMessage): VersionResponse {
        const response = new VersionResponse;
        const params = message.payload.parameters;

        response.componentType = params.slice(0, 16);
        response.bootloaderMajor = bufferToInt16(params, 16);
        response.bootloaderMinor = bufferToInt16(params, 18);
        response.firmwareFormat = bufferToInt16(params, 20);
        response.fwMajor = bufferToInt16(params, 22);
        response.fwMinor = bufferToInt16(params, 24);
        response.fwVariant = params.slice(26, 26 + 16);
        return response;
    }
}

export function versionRequest(): NWPMessage {
    const msg = new NWPMessage();
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
export class SyncStartResponse {
    nonce: number;
    status: number;
    encRndB: Uint8Array;

    static parse(message: NWPMessage): SyncStartResponse {
        const response = new SyncStartResponse();
        const params = message.payload.parameters;

        response.status = bufferToInt16(params, 0);
        response.encRndB = params.slice(2, 2 + 32);
        response.nonce = message.nonceCounter;
        return response;
    }
}

export function syncStartRequest(): NWPMessage {
    const msg = new NWPMessage();
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

// SyncEnd
export interface SessionIdentifier {
    rndA: Uint8Array;
    rndB: Uint8Array;
    encRndArndBRotR: Uint8Array;
    session: Uint8Array;
    nonceCounter: number;
}

export class SyncEndResponse {
    nonce: number;
    status: number;
    encRndARot: Uint8Array;
    static parse(message: NWPMessage): SyncEndResponse {
        const response = new SyncEndResponse();
        const params = message.payload.parameters;
        response.status = bufferToInt16(params, 0);
        response.encRndARot = params.slice(2, 2 + 32)
        response.nonce = message.nonceCounter;
        return response;
    }
}

export function syncEndRequest(syncStartResponse: SyncStartResponse, session: SessionIdentifier): NWPMessage {
    const msg = new NWPMessage();
    msg.length = 88;
    msg.securityFlags = SecurityFlags.REQ;
    msg.userStatus = UserStatus.NOT_APPLICABLE;
    msg.nonceCounter = syncStartResponse.nonce + 1;
    msg.setTarget(BusAddress.OEC, Component.COMP_SESSION);
    msg.setOriginator(BusAddress.OCH, Component.COMP_SESSION);
    msg.payload.commandID = Command.SYNC_END_REQ;

    msg.payload.parameters = new Uint8Array([
        0x00, // using odd key = false
        0x00, // status = 0
        ...Array.from(session.encRndArndBRotR)
    ]);

    return msg;
}

export function computeSession(keyString: string, syncStartResponse: SyncStartResponse): SessionIdentifier {
    const key = stringToBuffer(keyString);
    const iv = new Uint8Array(16);
    const encRndB = syncStartResponse.encRndB;

    const rndB = aesCbcDecrypt(encRndB, key, iv);
    // console.log('         Random B', bufferToString(rndB));

    const rndA = random(32);
    // console.log('         Random A', bufferToString(rndA));

    const rotRndB = rotateRight(rndB);
    // console.log('  Rotate Random B', bufferToString(rotRndB));

    const iv2 = encRndB.slice(16, encRndB.length);
    // console.log('              IV2', bufferToString(iv2));

    const rndArotRndB = new Uint8Array(rndA.length + rotRndB.length);
    rndArotRndB.set(rndA, 0);
    rndArotRndB.set(rotRndB, rndA.length);
    // console.log('RND A + ROT RND B', bufferToString(rndArotRndB));

    const encBuf = aesCbcEncrypt(rndArotRndB, key, iv2);
    // console.log(' encrypted buffer', bufferToString(encBuf));

    return {
        encRndArndBRotR: encBuf,
        nonceCounter: 0, // ???
        rndA: rndA,
        rndB: rndB,
        session: new Uint8Array([
            ...Array.from(rndA.slice(0, 8)),
            ...Array.from(rndB.slice(0, 8)),
            ...Array.from(rndA.slice(24, 32)),
            ...Array.from(rndB.slice(24, 32))
        ])
    }
}

// Disengage
export class DisengageResponse {
    switchedRelais: number;
    relaisState: number;

    static parse(message: NWPMessage): DisengageResponse {
        const response = new DisengageResponse();
        response.switchedRelais = message.payload.parameters[0];
        response.relaisState = message.payload.parameters[1];
        return response;
    }
}

export function disengageRequest(mode: DisengageMode): NWPMessage {
    const msg = new NWPMessage();
    msg.length = 24;
    msg.securityFlags = SecurityFlags.S_REQ_EVEN;
    msg.userStatus = UserStatus.NOT_APPLICABLE;
    msg.nonceCounter = 0;
    msg.setTarget(BusAddress.OEC, Component.COMP_BCU);
    msg.setOriginator(BusAddress.OCH, Component.COMP_OCH);
    msg.payload.commandID = Command.DISENGAGE_REQ;

    msg.payload.parameters = new Uint8Array([
        0x00, // relays = 0
        mode // mode - given as parameter
    ]);

    return msg;
}
