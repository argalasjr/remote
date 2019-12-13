var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@angular/core';
import { BLE } from '@ionic-native/ble/ngx';
import { from, Observable, Subject, throwError } from 'rxjs';
import { catchError, concatMap, take, timeout } from 'rxjs/operators';
import { bufferToString } from './buffer';
import { batteryRequest, BatteryResponse, disengageRequest, DisengageResponse, syncEndRequest, SyncEndResponse, syncStartRequest, SyncStartResponse, versionRequest, VersionResponse } from './messages';
import { bufferToMessage, decodeBuffer, encodeBuffer, messageToBuffer, tokenize } from './serialization';
/**
 * Service for communicating with EVVA lock over Bluetooth
 */
var EvvaService = /** @class */ (function () {
    function EvvaService(ble) {
        this.ble = ble;
        this.rx = new Subject();
        this._debug = localStorage.getItem('EvvaServiceLogs') === 'true';
    }
    EvvaService_1 = EvvaService;
    EvvaService.prototype.write = function (deviceId, message, sessionKey) {
        var _this = this;
        var buffer = encodeBuffer(messageToBuffer(message, sessionKey));
        this.debug(function () { return ([new Date().toJSON(), 'buffer to be send', bufferToString(buffer)]); });
        var sendData = tokenize(buffer);
        return from(sendData).pipe(concatMap(function (packet) { return _this.__write(deviceId, packet.buffer); }));
    };
    EvvaService.prototype.__write = function (deviceId, data) {
        return from(this.ble.write(deviceId, EvvaService_1.serviceUuid, EvvaService_1.txUuid, data)).pipe(catchError(function () { return throwError("writing " + data + " to " + deviceId + " error"); }));
    };
    EvvaService.prototype.debug = function (what) {
        if (this._debug) {
            console.log.apply(console, what());
        }
    };
    EvvaService.prototype.startNotification = function (deviceId) {
        var _this = this;
        this.debug(function () { return ([new Date().toJSON(), 'starting notifications from', deviceId]); });
        var buffer = [];
        this.ble.startNotification(deviceId, EvvaService_1.serviceUuid, EvvaService_1.rxUuid).subscribe(function (data) {
            var arrayData = new Uint8Array(data);
            _this.debug(function () { return ([new Date().toJSON(), 'received', bufferToString(arrayData), 'from', deviceId]); });
            buffer = buffer.concat(Array.from(arrayData));
            if (buffer.length >= 2) {
                if (buffer[buffer.length - 1] === 0xAD) {
                    try {
                        var decoded = decodeBuffer(buffer);
                        var message = bufferToMessage(decoded);
                        buffer = [];
                        _this.rx.next(message);
                    }
                    catch (error) {
                        _this.debug(function () { return ([new Date().toJSON(), 'error when decoding', buffer]); });
                        _this.rx.error('Decode error');
                    }
                }
            }
        }, function () {
            _this.debug(function () { return ([new Date().toJSON(), 'error when receiving from', deviceId]); });
            _this.rx.error('ble.startNotification() error');
        });
    };
    EvvaService.prototype.stopNotification = function (deviceId) {
        return from(this.ble.stopNotification(deviceId, EvvaService_1.serviceUuid, EvvaService_1.rxUuid)).pipe(catchError(function () { return throwError("error when stopping notifications from " + deviceId); }));
    };
    EvvaService.prototype.rpc = function (deviceId, createRequest, parseResponse, sessionKey) {
        var _this = this;
        return new Observable(function (observer) {
            var request = createRequest();
            _this.debug(function () { return ([new Date().toJSON(), 'write request', request]); });
            _this.rx.pipe(take(1), timeout(10000)).subscribe(function (message) {
                try {
                    _this.debug(function () { return ([new Date().toJSON(), 'received response', message]); });
                    var response_1 = parseResponse(message);
                    _this.debug(function () { return ([new Date().toJSON(), 'parsed response', response_1]); });
                    observer.next(response_1);
                }
                catch (error) {
                    _this.debug(function () { return ([new Date().toJSON(), 'wrong message format', { message: message, error: error }]); });
                    observer.error(error);
                }
            }, function (error) {
                _this.debug(function () { return ([new Date().toJSON(), 'read error', error]); });
                observer.error(error);
            }, function () {
                _this.debug(function () { return ([new Date().toJSON(), 'read complete for request', request]); });
                observer.complete();
            });
            _this.write(deviceId, request, sessionKey).subscribe(function (next) {
                _this.debug(function () { return ([new Date().toJSON(), 'Write of chunk finished', next]); });
            }, function (error) {
                _this.debug(function () { return ([new Date().toJSON(), 'Write error', error]); });
                observer.error(error);
            }, function () {
                _this.debug(function () { return ([new Date().toJSON(), 'Write complete']); });
            });
        });
    };
    EvvaService.prototype.getVersion = function (deviceId) {
        this.debug(function () { return ([new Date().toJSON(), '=== Get Version ===']); });
        return this.rpc(deviceId, function () { return versionRequest(); }, function (response) { return VersionResponse.parse(response); }, null);
    };
    EvvaService.prototype.getBattery = function (deviceId) {
        this.debug(function () { return ([new Date().toJSON(), '=== Get Battery ===']); });
        return this.rpc(deviceId, function () { return batteryRequest(); }, function (response) { return BatteryResponse.parse(response); }, null);
    };
    EvvaService.prototype.syncStart = function (deviceId) {
        this.debug(function () { return ([new Date().toJSON(), '=== Sync start ===']); });
        return this.rpc(deviceId, function () { return syncStartRequest(); }, function (response) { return SyncStartResponse.parse(response); }, null);
    };
    EvvaService.prototype.syncEnd = function (deviceId, syncStartResponse, session) {
        this.debug(function () { return ([new Date().toJSON(), '=== Sync end ===']); });
        return this.rpc(deviceId, function () { return syncEndRequest(syncStartResponse, session); }, function (response) { return SyncEndResponse.parse(response); }, null);
    };
    EvvaService.prototype.disengage = function (deviceId, mode, sessionKey) {
        this.debug(function () { return ([new Date().toJSON(), '=== Disengage ===']); });
        return this.rpc(deviceId, function () { return disengageRequest(mode); }, function (response) { return DisengageResponse.parse(response); }, sessionKey);
    };
    var EvvaService_1;
    EvvaService.serviceUuid = '6E400001-B5A3-F393-E0A9-E50E24DCCA9E'.toLowerCase();
    EvvaService.activeUuid = '6E400008-B5A3-F393-E0A9-E50E24DCCA9E'.toLowerCase();
    EvvaService.txUuid = '6E400002-B5A3-F393-E0A9-E50E24DCCA9E'.toLowerCase();
    EvvaService.rxUuid = '6E400003-B5A3-F393-E0A9-E50E24DCCA9E'.toLowerCase();
    EvvaService = EvvaService_1 = __decorate([
        Injectable({
            providedIn: 'root'
        }),
        __metadata("design:paramtypes", [BLE])
    ], EvvaService);
    return EvvaService;
}());
export { EvvaService };
//# sourceMappingURL=evva.service.js.map