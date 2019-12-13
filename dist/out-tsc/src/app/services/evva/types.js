export var SecurityFlags;
(function (SecurityFlags) {
    SecurityFlags[SecurityFlags["REQ"] = 32] = "REQ";
    SecurityFlags[SecurityFlags["RES"] = 0] = "RES";
    SecurityFlags[SecurityFlags["REQ_REP"] = 40] = "REQ_REP";
    SecurityFlags[SecurityFlags["RES_REP"] = 8] = "RES_REP";
    SecurityFlags[SecurityFlags["S_REQ_EVEN"] = 34] = "S_REQ_EVEN";
    SecurityFlags[SecurityFlags["S_RES_EVEN"] = 2] = "S_RES_EVEN";
    SecurityFlags[SecurityFlags["S_REQ_ODD"] = 98] = "S_REQ_ODD";
    SecurityFlags[SecurityFlags["S_RES_ODD"] = 66] = "S_RES_ODD";
    SecurityFlags[SecurityFlags["S_REQ_REP_EVEN"] = 42] = "S_REQ_REP_EVEN";
    SecurityFlags[SecurityFlags["S_RES_REP_EVEN"] = 10] = "S_RES_REP_EVEN";
    SecurityFlags[SecurityFlags["S_REQ_REP_ODD"] = 106] = "S_REQ_REP_ODD";
    SecurityFlags[SecurityFlags["S_RES_REP_ODD"] = 74] = "S_RES_REP_ODD";
})(SecurityFlags || (SecurityFlags = {}));
export var UserStatus;
(function (UserStatus) {
    UserStatus[UserStatus["NOT_APPLICABLE"] = 0] = "NOT_APPLICABLE";
    UserStatus[UserStatus["SUCCESSFUL"] = 1] = "SUCCESSFUL";
    UserStatus[UserStatus["RETRY"] = 2] = "RETRY";
    UserStatus[UserStatus["FORCE"] = 3] = "FORCE";
    UserStatus[UserStatus["FATAL"] = 4] = "FATAL";
    UserStatus[UserStatus["GO_BACK"] = 5] = "GO_BACK";
})(UserStatus || (UserStatus = {}));
export var BusAddress;
(function (BusAddress) {
    BusAddress[BusAddress["LOCAL"] = 255] = "LOCAL";
    BusAddress[BusAddress["BCU"] = 128] = "BCU";
    BusAddress[BusAddress["PG"] = 254] = "PG";
    BusAddress[BusAddress["CWL"] = 127] = "CWL";
    BusAddress[BusAddress["OEC"] = 2] = "OEC";
    BusAddress[BusAddress["OCH"] = 1] = "OCH";
})(BusAddress || (BusAddress = {}));
export var Component;
(function (Component) {
    Component[Component["COMP_CORE"] = 0] = "COMP_CORE";
    Component[Component["COMP_BCU"] = 1] = "COMP_BCU";
    Component[Component["COMP_OPENER"] = 2] = "COMP_OPENER";
    Component[Component["COMP_RELAIS"] = 3] = "COMP_RELAIS";
    Component[Component["COMP_RFID"] = 4] = "COMP_RFID";
    Component[Component["COMP_PG"] = 5] = "COMP_PG";
    Component[Component["COMP_OCH"] = 6] = "COMP_OCH";
    Component[Component["COMP_SESSION"] = 255] = "COMP_SESSION";
})(Component || (Component = {}));
export var Command;
(function (Command) {
    Command[Command["GET_BATTERY_REQ"] = 28280] = "GET_BATTERY_REQ";
    Command[Command["GET_BATTERY_RES"] = 28281] = "GET_BATTERY_RES";
    Command[Command["GET_VERSION_REQ"] = 28272] = "GET_VERSION_REQ";
    Command[Command["GET_VERSION_RES"] = 28273] = "GET_VERSION_RES";
    Command[Command["SYNC_START_REQ"] = 10] = "SYNC_START_REQ";
    Command[Command["SYNC_START_RES"] = 11] = "SYNC_START_RES";
    Command[Command["SYNC_END_REQ"] = 12] = "SYNC_END_REQ";
    Command[Command["SYNC_END_RES"] = 13] = "SYNC_END_RES";
    Command[Command["DISENGAGE_REQ"] = 43788] = "DISENGAGE_REQ";
    Command[Command["DISENGAGE_RES"] = 43789] = "DISENGAGE_RES";
})(Command || (Command = {}));
export var DisengageMode;
(function (DisengageMode) {
    DisengageMode[DisengageMode["TEMPORARY"] = 0] = "TEMPORARY";
    DisengageMode[DisengageMode["TEMPORARY_PROLONGED"] = 1] = "TEMPORARY_PROLONGED";
    DisengageMode[DisengageMode["PERMANENT_START"] = 16] = "PERMANENT_START";
    DisengageMode[DisengageMode["PERMANENT_STOP"] = 17] = "PERMANENT_STOP";
})(DisengageMode || (DisengageMode = {}));
var NWPPayload = /** @class */ (function () {
    function NWPPayload() {
        this.targetInstance = 0;
        this.originatorInstance = 0;
        this.parameters = new Uint8Array(0);
    }
    return NWPPayload;
}());
export { NWPPayload };
var NWPMessage = /** @class */ (function () {
    function NWPMessage() {
        this.length = 0;
        this.securityFlags = 0;
        this.userStatus = 0;
        this.nonceCounter = 0;
        this.targetAddress = 0;
        this.originatorAddress = 0;
        this.payload = null;
        this.mac = 0;
        this.checksum = 0;
    }
    NWPMessage.prototype.setTarget = function (busAddress, component, instance) {
        if (instance === void 0) { instance = 0; }
        if (!this.payload) {
            this.payload = new NWPPayload();
        }
        this.targetAddress = busAddress;
        this.payload.targetComponent = component;
        this.payload.targetInstance = instance;
    };
    NWPMessage.prototype.setOriginator = function (busAddress, component, instance) {
        if (instance === void 0) { instance = 0; }
        if (!this.payload) {
            this.payload = new NWPPayload();
        }
        this.originatorAddress = busAddress;
        this.payload.originatorComponent = component;
        this.payload.originatorInstance = instance;
    };
    return NWPMessage;
}());
export { NWPMessage };
//# sourceMappingURL=types.js.map