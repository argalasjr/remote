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
import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { AlertController, ModalController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest } from 'rxjs';
import { concatMap, debounceTime, map, tap } from 'rxjs/operators';
import { ErrorDialogService } from '../../../services/error-dialog/error-dialog.service';
import { BluetoothNetworkClientService } from '../../../services/bluetooth-network-client/bluetooth-network-client.service';
/**
 * Modal dialog for device network configuration
 */
var ConfigureModalComponent = /** @class */ (function () {
    function ConfigureModalComponent(modalCtrl, alertCtrl, tr, bleService, platform, cd, helpers) {
        this.modalCtrl = modalCtrl;
        this.alertCtrl = alertCtrl;
        this.tr = tr;
        this.bleService = bleService;
        this.platform = platform;
        this.cd = cd;
        this.helpers = helpers;
        this.connectedDevice = null;
        this.connectionStatus = {
            ip: null,
            network: ''
        };
        this.wifiCredentials = {
            ssid: '',
            passphrase: ''
        };
        this.textEncoder = new TextEncoder();
        this.textDecoder = new TextDecoder();
        this.subscriptions = [];
    }
    ConfigureModalComponent.prototype.ngOnInit = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, error_1, ip$, network$, subscription;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.log('ConfigureModalPage::ngOnInit', this.connectedDevice);
                        return [4 /*yield*/, this.platform.ready()];
                    case 1:
                        _b.sent();
                        if (!window['WifiWizard2']) return [3 /*break*/, 5];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        _a = this.wifiCredentials;
                        return [4 /*yield*/, window['WifiWizard2'].getConnectedSSID()];
                    case 3:
                        _a.ssid = _b.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _b.sent();
                        this.helpers.showError(error_1);
                        console.log('getConnectedSSID failed:', error_1);
                        return [3 /*break*/, 5];
                    case 5:
                        ip$ = this.bleService.readAndObserve(this.connectedDevice.id, this.bleService.networkServiceUuid, this.bleService.ipCharacteristicsUuid).pipe(map(function (buffer) {
                            var array = new Uint8Array(buffer);
                            if (array.length === 4 && array[0] !== 0) {
                                return array.join('.');
                            }
                            return null;
                        }));
                        network$ = this.bleService.readAndObserve(this.connectedDevice.id, this.bleService.networkServiceUuid, this.bleService.connectedWifiNetworkCharacteristicsUuid).pipe(map(function (buffer) { return _this.textDecoder.decode(new Uint8Array(buffer)); }));
                        subscription = combineLatest([ip$, network$]).pipe(map(function (_a) {
                            var ip = _a[0], network = _a[1];
                            return ({ ip: ip, network: network });
                        }), tap(console.log), debounceTime(200)).subscribe(function (status) {
                            console.log('received', status);
                            _this.connectionStatus = status;
                            _this.cd.detectChanges();
                        }, function (error) {
                            _this.helpers.showError(error);
                        });
                        this.subscriptions.push(subscription);
                        this.connectToWifi();
                        return [2 /*return*/];
                }
            });
        });
    };
    ConfigureModalComponent.prototype.ionViewWillLeave = function () {
        console.log('ionViewWillLeave ConfigureModalPage');
        this.subscriptions.forEach(function (s) { return s.unsubscribe(); });
        this.disconnect();
    };
    ConfigureModalComponent.prototype.connectToWifi = function () {
        var _this = this;
        this.alertCtrl.create({
            header: this.tr.instant('configure-modal.connect.wi-fi-credentials'),
            message: this.tr.instant('configure-modal.connect.wi-fi-credentials-help-text'),
            inputs: [{
                    type: 'text',
                    value: this.wifiCredentials.ssid,
                    placeholder: this.tr.instant('configure-modal.connect.ssid'),
                    name: 'ssid'
                }, {
                    type: 'text',
                    value: this.wifiCredentials.passphrase,
                    placeholder: this.tr.instant('configure-modal.connect.password'),
                    name: 'passphrase'
                }],
            buttons: [
                this.tr.instant('common.cancel'),
                {
                    text: this.tr.instant('common.ok'),
                    handler: function (value) {
                        var ssid = value.ssid ? value.ssid.trim() : '';
                        var passphrase = value.passphrase;
                        if (!ssid) {
                            _this.showMessageBox(_this.tr.instant('configure-modal.connect.missing-ssid'));
                            return false;
                        }
                        if (passphrase.length < 8) {
                            _this.showMessageBox(_this.tr.instant('configure-modal.connect.missing-password'));
                            return false;
                        }
                        _this.setNetwork(ssid, passphrase);
                    }
                }
            ]
        }).then(function (alrt) { return alrt.present(); });
    };
    ConfigureModalComponent.prototype.showMessageBox = function (message) {
        this.alertCtrl.create({ message: message, buttons: [this.tr.instant('common.ok')] }).then(function (alrt) { return alrt.present(); });
    };
    ConfigureModalComponent.prototype.disconnect = function () {
        this.bleService.disconnect(this.connectedDevice.id).subscribe(function () { }, function (error) { return console.log(error); });
    };
    ConfigureModalComponent.prototype.encode = function (string) {
        return this.textEncoder.encode(string).buffer;
    };
    ConfigureModalComponent.prototype.setNetwork = function (ssid, passphrase) {
        var _this = this;
        var writeSsid = this.bleService.write(this.connectedDevice.id, this.bleService.networkServiceUuid, this.bleService.ssidCharacteristicsUuid, this.encode(ssid));
        var writePassphrase = this.bleService.write(this.connectedDevice.id, this.bleService.networkServiceUuid, this.bleService.passCharacteristicsUuid, this.encode(passphrase));
        writeSsid.pipe(concatMap(function () { return writePassphrase; })).subscribe(function () {
            console.log('write success');
        }, function (error) {
            console.log('write error:', error);
            _this.helpers.showError(error);
        });
    };
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], ConfigureModalComponent.prototype, "connectedDevice", void 0);
    ConfigureModalComponent = __decorate([
        Component({
            selector: 'app-configure-modal-component',
            templateUrl: './configure-modal.component.html',
            styleUrls: ['./configure-modal.component.scss'],
        }),
        __metadata("design:paramtypes", [ModalController, AlertController, TranslateService,
            BluetoothNetworkClientService, Platform, ChangeDetectorRef,
            ErrorDialogService])
    ], ConfigureModalComponent);
    return ConfigureModalComponent;
}());
export { ConfigureModalComponent };
//# sourceMappingURL=configure-modal.component.js.map