export enum SecurityFlags {
    REQ = 0x20,
    RES = 0x00,
    REQ_REP = 0x28,
    RES_REP = 0x08,
    S_REQ_EVEN = 0x22,
    S_RES_EVEN = 0x02,
    S_REQ_ODD = 0x62,
    S_RES_ODD = 0x42,
    S_REQ_REP_EVEN = 0x2A,
    S_RES_REP_EVEN = 0x0A,
    S_REQ_REP_ODD = 0x6A,
    S_RES_REP_ODD = 0x4A,
}

export enum UserStatus {
    NOT_APPLICABLE = 0,
    SUCCESSFUL = 1,
    RETRY = 2,
    FORCE = 3,
    FATAL = 4,
    GO_BACK = 5
}

export enum BusAddress {
    LOCAL = 0xFF,
    BCU = 0x80,
    PG = 0xFE,
    CWL = 0x7F,
    OEC = 0x02,
    OCH = 0x01
}

export enum Component {
    COMP_CORE = 0,
    COMP_BCU = 1,
    COMP_OPENER = 2,
    COMP_RELAIS = 3,
    COMP_RFID = 4,
    COMP_PG = 5,
    COMP_OCH = 6,
    COMP_SESSION = 0xFF
}

export enum Command {
    GET_BATTERY_REQ = 0x6E78,
    GET_BATTERY_RES = 0x6E79,

    GET_VERSION_REQ = 0x6E70,
    GET_VERSION_RES = 0x6E71,

    SYNC_START_REQ = 0x000A,
    SYNC_START_RES = 0x000B,

    SYNC_END_REQ = 0x000C,
    SYNC_END_RES = 0x000D,

    DISENGAGE_REQ = 0xAB0C,
    DISENGAGE_RES = 0xAB0D,
}

export enum DisengageMode {
    TEMPORARY = 0x00,
    TEMPORARY_PROLONGED = 0x01,
    PERMANENT_START = 0x10,
    PERMANENT_STOP = 0x11
}

export class NWPPayload {
    targetComponent: Component;
    targetInstance = 0;
    originatorComponent: Component;
    originatorInstance = 0;
    commandID: Command;
    parameters: Uint8Array = new Uint8Array(0);
}

export class NWPMessage {
    length = 0;
    securityFlags: SecurityFlags = 0;
    userStatus: UserStatus = 0;
    nonceCounter = 0;
    targetAddress: BusAddress = 0;
    originatorAddress: BusAddress = 0;
    payload: NWPPayload = null;
    mac = 0;
    checksum = 0;

    setTarget(busAddress: BusAddress, component: Component, instance: number = 0) {
        if (!this.payload) {
            this.payload = new NWPPayload();
        }
        this.targetAddress = busAddress;
        this.payload.targetComponent = component;
        this.payload.targetInstance = instance;
    }

    setOriginator(busAddress: BusAddress, component: Component, instance: number = 0) {
        if (!this.payload) {
            this.payload = new NWPPayload();
        }
        this.originatorAddress = busAddress;
        this.payload.originatorComponent = component;
        this.payload.originatorInstance = instance;
    }
}
