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
import { AlertController, NavController, Platform, PopoverController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { map, mergeMap, take, tap } from 'rxjs/operators';
import { ErrorDialogService } from '../services/error-dialog/error-dialog.service';
import { MenuPopover } from '../menu';
import { EvvaService } from '../services/evva/evva.service';
import { computeSession } from '../services/evva/messages';
import { DisengageMode } from '../services/evva/types';
import { KeysService } from '../services/keys/keys.service';
import { LoadingService } from '../services/loading/loading.service';
/**
 * Page shows EVVA locks nearby. You can click on the lock and open it.
 */
var LocksPage = /** @class */ (function () {
    function LocksPage(navCtrl, platform, cd, evva, keysProvider, alertCtrl, popoverCtrl, loadingService, ble, tr, helpers) {
        this.navCtrl = navCtrl;
        this.platform = platform;
        this.cd = cd;
        this.evva = evva;
        this.keysProvider = keysProvider;
        this.alertCtrl = alertCtrl;
        this.popoverCtrl = popoverCtrl;
        this.loadingService = loadingService;
        this.ble = ble;
        this.tr = tr;
        this.helpers = helpers;
        this.keys = [];
        this.devices = [];
        this.scanning = false;
    }
    LocksPage.prototype.startScan = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.platform.ready()];
                    case 1:
                        _a.sent();
                        if (this.scanning) {
                            return [2 /*return*/];
                        }
                        this.scanning = true;
                        return [4 /*yield*/, this.loadingService.show({ message: this.tr.instant('locks.scanning') })];
                    case 2:
                        _a.sent();
                        this.devices = [];
                        if (window['ble']) {
                            this.ble.startScan([EvvaService.serviceUuid]).subscribe(function (device) {
                                _this.devices.push(device);
                                _this.cd.detectChanges();
                                console.log(device);
                            });
                        }
                        else {
                            setTimeout(function () {
                                _this.devices.push({
                                    id: 'device-id',
                                    advertising: {},
                                    name: 'Test device',
                                    rssi: 42
                                });
                            }, 1000);
                        }
                        setTimeout(function () {
                            _this.stopScan();
                        }, 5000);
                        return [2 /*return*/];
                }
            });
        });
    };
    LocksPage.prototype.stopScan = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('stop scan');
                        this.scanning = false;
                        this.loadingService.hide();
                        return [4 /*yield*/, this.platform.ready()];
                    case 1:
                        _a.sent();
                        if (window['ble']) {
                            this.ble.stopScan();
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    LocksPage.prototype.select = function (device) {
        return __awaiter(this, void 0, void 0, function () {
            var alert_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.scanning) {
                            console.log('still scanning');
                            return [2 /*return*/];
                        }
                        if (!(this.keys.length === 1)) return [3 /*break*/, 1];
                        this.connect(device, this.keys[0].value);
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, this.alertCtrl.create({
                            header: this.tr.instant('locks.select-key'),
                            inputs: this.keys.map(function (key, index) {
                                var input = {
                                    type: 'radio',
                                    label: key.name,
                                    value: key.value,
                                    checked: index === 0
                                };
                                return input;
                            }),
                            buttons: [this.tr.instant('common.cancel'), {
                                    text: this.tr.instant('common.ok'),
                                    handler: function (selectedKey) { return _this.connect(device, selectedKey); }
                                }]
                        })];
                    case 2:
                        alert_1 = _a.sent();
                        alert_1.present();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    LocksPage.prototype.connect = function (device, key) {
        return __awaiter(this, void 0, void 0, function () {
            var sessionKey, batteryLevel, setActive;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!window['ble']) {
                            this.helpers.showError('Bluetooth is not supported in browser. Please run the app on phone');
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.loadingService.show({ message: this.tr.instant('locks.connecting-to', { deviceName: device.name }) })];
                    case 1:
                        _a.sent();
                        console.log('connecting');
                        console.log(key);
                        setActive = function (active) { return _this.ble.write(device.id, EvvaService.serviceUuid, EvvaService.activeUuid, new Uint8Array([active ? 0x01 : 0x00]).buffer); };
                        this.ble.connect(device.id).pipe(tap(function (peripheralData) { return console.log('connected device', peripheralData); }), tap(function () { return _this.evva.startNotification(device.id); }), mergeMap(function () { return setActive(true); }), mergeMap(function () { return _this.evva.getBattery(device.id); }), tap(function (batteryResponse) { return batteryLevel = batteryResponse.level; }), mergeMap(function () { return _this.evva.syncStart(device.id); }), map(function (syncStartResponse) {
                            return {
                                syncStartResponse: syncStartResponse,
                                identifier: computeSession(key, syncStartResponse),
                            };
                        }), tap(function (session) { return sessionKey = session.identifier.session; }), mergeMap(function (session) { return _this.evva.syncEnd(device.id, session.syncStartResponse, session.identifier); }), mergeMap(function (_) { return _this.evva.disengage(device.id, DisengageMode.TEMPORARY, sessionKey); }), mergeMap(function () { return setActive(false); }), take(1)).subscribe({
                            error: function (error) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    this.loadingService.hide();
                                    this.ble.disconnect(device.id);
                                    this.helpers.showError(error);
                                    return [2 /*return*/];
                                });
                            }); },
                            complete: function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    this.loadingService.hide();
                                    console.log('complete');
                                    this.ble.disconnect(device.id);
                                    this.alertCtrl.create({
                                        header: this.tr.instant('common.success'),
                                        message: this.tr.instant('locks.battery-percent', { batteryLevel: batteryLevel }),
                                        buttons: [this.tr.instant('common.ok')]
                                    }).then(function (alrt) { return alrt.present(); });
                                    return [2 /*return*/];
                                });
                            }); }
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    LocksPage.prototype.manageKeys = function () {
        this.navCtrl.navigateForward(['keys']);
    };
    LocksPage.prototype.showMenu = function (event) {
        return __awaiter(this, void 0, void 0, function () {
            var menu;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, MenuPopover.create(this.popoverCtrl, {
                            menuItems: [{
                                    icon: 'key',
                                    text: this.tr.instant('keys.toolbar-title'),
                                    callback: function () {
                                        menu.dismiss();
                                        _this.navCtrl.navigateForward('keys');
                                    }
                                }],
                        }, event)];
                    case 1:
                        menu = _a.sent();
                        return [4 /*yield*/, menu.present()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    LocksPage.prototype.ionViewWillEnter = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, this.keysProvider.getKeys()];
                    case 1:
                        _a.keys = _b.sent();
                        console.log('Home ionViewWillEnter; keys =', this.keys);
                        return [2 /*return*/];
                }
            });
        });
    };
    LocksPage = __decorate([
        Component({
            selector: 'app-locks',
            templateUrl: './locks.page.html',
            styleUrls: ['./locks.page.scss'],
        }),
        __metadata("design:paramtypes", [NavController, Platform, ChangeDetectorRef,
            EvvaService, KeysService, AlertController,
            PopoverController, LoadingService, BLE,
            TranslateService, ErrorDialogService])
    ], LocksPage);
    return LocksPage;
}());
export { LocksPage };
//# sourceMappingURL=locks.page.js.map