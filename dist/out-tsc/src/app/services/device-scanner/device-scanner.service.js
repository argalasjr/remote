var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { Injectable } from '@angular/core';
import { BLE } from '@ionic-native/ble/ngx';
import { Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { throwError, timer } from 'rxjs';
import { catchError, map, mergeMap, take, tap } from 'rxjs/operators';
import { BluetoothNetworkClientService } from '../bluetooth-network-client/bluetooth-network-client.service';
/**
 * Scans TBS devices over Bluetooth
 */
var DeviceScannerService = /** @class */ (function () {
    function DeviceScannerService(platform, bleService, ble, translate) {
        this.platform = platform;
        this.bleService = bleService;
        this.ble = ble;
        this.translate = translate;
    }
    DeviceScannerService.prototype.getTbsDevices = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.platform.ready()];
                    case 1:
                        _a.sent();
                        if (!!window['ble']) return [3 /*break*/, 3];
                        return [4 /*yield*/, timer(500).toPromise()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, [{ id: 'aa:11:bb:22:cc:33', name: 'TestDevice', advertising: null, rssi: 0 }]];
                    case 3:
                        result = [];
                        console.log('starting scan');
                        this.ble.startScan([this.bleService.networkServiceUuid]).subscribe(function (peripheral) {
                            console.log('adding', peripheral);
                            result.push(peripheral);
                        });
                        return [4 /*yield*/, timer(10000).toPromise()];
                    case 4:
                        _a.sent();
                        console.log('stopping scan');
                        this.ble.stopScan();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    DeviceScannerService.prototype.getDeviceIp = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.platform.ready()];
                    case 1:
                        _a.sent();
                        if (!!window['ble']) return [3 /*break*/, 3];
                        return [4 /*yield*/, timer(500).toPromise()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, '192.168.99.121'];
                    case 3: return [2 /*return*/, this.bleService.connect(id).pipe(mergeMap(function (connectedPeripheral) { return _this.bleService.readAndObserve(connectedPeripheral.id, _this.bleService.networkServiceUuid, _this.bleService.ipCharacteristicsUuid); }), take(1), map(function (buffer) {
                            var array = new Uint8Array(buffer);
                            // wrong byte array length or all zeros -> throw error
                            if (array.length !== 4 || array.filter(function (i) { return i === 0; }).length === 4) {
                                throw new Error(_this.translate.instant('remote.device-has-no-ip'));
                            }
                            return array.join('.');
                        }), catchError(function (error) {
                            _this.bleService.disconnect(id);
                            return throwError(error);
                        }), tap(function () { return _this.bleService.disconnect(id); })).toPromise()];
                }
            });
        });
    };
    DeviceScannerService = __decorate([
        Injectable({
            providedIn: 'root'
        }),
        __metadata("design:paramtypes", [Platform, BluetoothNetworkClientService,
            BLE, TranslateService])
    ], DeviceScannerService);
    return DeviceScannerService;
}());
export { DeviceScannerService };
//# sourceMappingURL=device-scanner.service.js.map