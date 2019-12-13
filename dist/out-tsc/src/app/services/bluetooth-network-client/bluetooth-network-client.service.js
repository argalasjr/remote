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
import { merge, throwError, from } from 'rxjs';
import { BLE } from '@ionic-native/ble/ngx';
import { tap, catchError } from 'rxjs/operators';
var BluetoothNetworkClientService = /** @class */ (function () {
    function BluetoothNetworkClientService(ble) {
        this.ble = ble;
        this.networkServiceUuid = '99c80001-901e-4afc-9f2e-6fa110a2c4f5';
        this.ipCharacteristicsUuid = '99c80002-901e-4afc-9f2e-6fa110a2c4f5';
        this.ssidCharacteristicsUuid = '99c80003-901e-4afc-9f2e-6fa110a2c4f5';
        this.passCharacteristicsUuid = '99c80004-901e-4afc-9f2e-6fa110a2c4f5';
        this.connectedWifiNetworkCharacteristicsUuid = '99c80005-901e-4afc-9f2e-6fa110a2c4f5';
    }
    BluetoothNetworkClientService.prototype.connect = function (deviceId) {
        console.log("connecting to " + deviceId);
        return this.ble.connect(deviceId).pipe(tap(function (data) {
            console.log("connected to " + deviceId);
        }), catchError(function (error) {
            console.log("connection error " + deviceId);
            return throwError("Error when connecting to " + deviceId);
        }));
    };
    BluetoothNetworkClientService.prototype.disconnect = function (deviceId) {
        console.log("disconnecting from " + deviceId);
        return from(this.ble.disconnect(deviceId)).pipe(tap(function (data) {
            console.log("disconnected from " + deviceId);
        }), catchError(function (error) {
            console.log("error when disconnecting from " + deviceId);
            return throwError("Error when disconnecting from " + deviceId);
        }));
    };
    BluetoothNetworkClientService.prototype.write = function (deviceId, serviceId, characteristicId, data) {
        console.log("writing to " + deviceId + "::" + serviceId + "::" + characteristicId);
        return from(this.ble.write(deviceId, serviceId, characteristicId, data)).pipe(tap(function () { return console.log("write to " + deviceId + "::" + serviceId + "::" + characteristicId + " success"); }), catchError(function (error) {
            console.log("error when writing to " + deviceId + "::" + serviceId + "::" + characteristicId);
            return throwError("Error when writing to " + deviceId + "::" + serviceId + "::" + characteristicId);
        }));
    };
    BluetoothNetworkClientService.prototype.read = function (deviceId, serviceId, characteristicId) {
        console.log("reading from " + deviceId + "::" + serviceId + "::" + characteristicId);
        return from(this.ble.read(deviceId, serviceId, characteristicId)).pipe(tap(function () { return console.log("reading from " + deviceId + "::" + serviceId + "::" + characteristicId + " success"); }), catchError(function (error) {
            console.log("error when reading from " + deviceId + "::" + serviceId + "::" + characteristicId);
            return throwError("Error when reading from " + deviceId + "::" + serviceId + "::" + characteristicId);
        }));
    };
    BluetoothNetworkClientService.prototype.observe = function (deviceId, serviceId, characteristicId) {
        console.log("observing " + deviceId + "::" + serviceId + "::" + characteristicId);
        return this.ble.startNotification(deviceId, serviceId, characteristicId).pipe(tap(function () { return console.log("received from " + deviceId + "::" + serviceId + "::" + characteristicId); }), catchError(function (error) {
            console.log("error when observing " + deviceId + "::" + serviceId + "::" + characteristicId);
            return throwError("Error when observing " + deviceId + "::" + serviceId + "::" + characteristicId);
        }));
    };
    BluetoothNetworkClientService.prototype.readAndObserve = function (deviceId, serviceId, characteristicId) {
        return merge(this.read(deviceId, serviceId, characteristicId), this.observe(deviceId, serviceId, characteristicId));
    };
    BluetoothNetworkClientService = __decorate([
        Injectable({
            providedIn: 'root'
        }),
        __metadata("design:paramtypes", [BLE])
    ], BluetoothNetworkClientService);
    return BluetoothNetworkClientService;
}());
export { BluetoothNetworkClientService };
//# sourceMappingURL=bluetooth-network-client.service.js.map