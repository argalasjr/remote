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
import { ChangeDetectorRef, Component } from '@angular/core';
import { BLE } from '@ionic-native/ble/ngx';
import { ModalController, NavController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { ErrorDialogService } from '../../services/error-dialog/error-dialog.service';
import { BluetoothNetworkClientService } from '../../services/bluetooth-network-client/bluetooth-network-client.service';
import { LoadingService } from '../../services/loading/loading.service';
import { RemoteDeviceService } from '../../services/remote-screen/remote-device.service';
import { ConfigureModalComponent } from './configure-modal/configure-modal.component';
/**
 * Component shows nearby devices with turned on Bluetooth beacon.
 * User can connect to these devices and configure their network.
 */
var ConfigureComponent = /** @class */ (function () {
    function ConfigureComponent(navCtrl, cd, bleService, ble, modalCtrl, platform, loadingService, remoteDevice, tr, helpers) {
        this.navCtrl = navCtrl;
        this.cd = cd;
        this.bleService = bleService;
        this.ble = ble;
        this.modalCtrl = modalCtrl;
        this.platform = platform;
        this.loadingService = loadingService;
        this.remoteDevice = remoteDevice;
        this.tr = tr;
        this.helpers = helpers;
        this.scanning = false;
        this.devices = [];
    }
    ConfigureComponent.prototype.ngOnInit = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('ionViewDidLoad ConfigurePage');
                        return [4 /*yield*/, this.platform.ready()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ConfigureComponent.prototype.startScan = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('startScan');
                        return [4 /*yield*/, this.loadingService.show({ message: this.tr.instant('configure.detected-devices.scanning') })];
                    case 1:
                        _a.sent();
                        this.devices.splice(0, this.devices.length);
                        this.scanning = true;
                        this.ble.startScan([this.bleService.networkServiceUuid]).subscribe(function (device) {
                            console.log('detected', device);
                            if (!_this.devices.find(function (storedDevice) { return storedDevice.id === device.id; })) {
                                _this.devices.push(device);
                                _this.cd.detectChanges();
                            }
                        }, function (error) {
                            console.log('start scan error', error);
                            _this.helpers.showError(error);
                            _this.scanning = false;
                            _this.loadingService.hide();
                            _this.devices.push(error);
                        });
                        setTimeout(function () {
                            if (_this.scanning) {
                                _this.loadingService.hide();
                                _this.stopScan();
                            }
                        }, 5000);
                        return [2 /*return*/];
                }
            });
        });
    };
    ConfigureComponent.prototype.stopScan = function () {
        this.scanning = false;
        this.ble.stopScan();
    };
    ConfigureComponent.prototype.connect = function (device) {
        return __awaiter(this, void 0, void 0, function () {
            var modal;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.loadingService.show({ message: this.tr.instant('configure.detected-devices.connecting', { deviceName: device.name }) })];
                    case 1:
                        _a.sent();
                        modal = null;
                        this.ble.connect(device.id).subscribe(function (connectedDevice) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        this.loadingService.hide();
                                        this.cd.detectChanges();
                                        return [4 /*yield*/, this.openModal(connectedDevice)];
                                    case 1:
                                        modal = _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); }, function (error) {
                            if (modal) {
                                modal.dismiss();
                            }
                            _this.loadingService.hide();
                            _this.helpers.showError(error);
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    ConfigureComponent.prototype.openModal = function (connectedDevice) {
        return __awaiter(this, void 0, void 0, function () {
            var modal;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.modalCtrl.create({ component: ConfigureModalComponent, componentProps: { connectedDevice: connectedDevice } })];
                    case 1:
                        modal = _a.sent();
                        modal.present();
                        modal.onDidDismiss().then(function (overlayEventDetail) {
                            if (!overlayEventDetail.data) {
                                return;
                            }
                            _this.remoteDevice.setIp(overlayEventDetail.data).then(function () {
                                _this.navCtrl.navigateForward(['remote', { subscribe: true }]);
                            });
                        });
                        return [2 /*return*/, modal];
                }
            });
        });
    };
    ConfigureComponent = __decorate([
        Component({
            selector: 'app-configure-component',
            templateUrl: './configure.component.html',
            styleUrls: ['./configure.component.scss'],
        }),
        __metadata("design:paramtypes", [NavController, ChangeDetectorRef, BluetoothNetworkClientService, BLE,
            ModalController, Platform, LoadingService,
            RemoteDeviceService, TranslateService, ErrorDialogService])
    ], ConfigureComponent);
    return ConfigureComponent;
}());
export { ConfigureComponent };
//# sourceMappingURL=configure.component.js.map