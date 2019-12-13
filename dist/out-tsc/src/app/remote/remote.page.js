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
import { Component, ElementRef, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { NavController, AlertController, PopoverController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { interval, Subject, fromEvent } from 'rxjs';
import { exhaustMap, sample, map, startWith, mapTo } from 'rxjs/operators';
import { ErrorDialogService } from '../services/error-dialog/error-dialog.service';
import { MenuPopover } from '../menu';
import { DeviceScannerService } from '../services/device-scanner/device-scanner.service';
import { LoadingService } from '../services/loading/loading.service';
import { RemoteDeviceService } from '../services/remote-screen/remote-device.service';
import { ScreenService } from '../services/remote-screen/screen.service';
/**
 * Page for remote screen control
 */
var RemotePage = /** @class */ (function () {
    function RemotePage(screen, remoteDevice, sanitization, alertCtrl, popoverCtrl, loadingService, deviceScanner, activatedRoute, tr, helpers, navCtrl) {
        this.screen = screen;
        this.remoteDevice = remoteDevice;
        this.sanitization = sanitization;
        this.alertCtrl = alertCtrl;
        this.popoverCtrl = popoverCtrl;
        this.loadingService = loadingService;
        this.deviceScanner = deviceScanner;
        this.activatedRoute = activatedRoute;
        this.tr = tr;
        this.helpers = helpers;
        this.navCtrl = navCtrl;
        this.move = new Subject();
        this.lastCoord = null;
        this.deviceIp = null;
        this.idle = false;
        this.connecting = false;
        this.connectionError = false;
        this.imageSrc = 'assets/imgs/connecting.png';
        this.input = null;
    }
    RemotePage.prototype.ngOnInit = function () {
        return __awaiter(this, void 0, void 0, function () {
            var subscribe;
            return __generator(this, function (_a) {
                console.log('RemotePage::ngOnInit');
                this.setState({ idle: true, connecting: false, connectionError: false });
                this.deviceIp = this.activatedRoute.snapshot.paramMap.get('ip');
                subscribe = this.activatedRoute.snapshot.paramMap.get('subscribe') === 'true';
                console.log('remote device ip', this.deviceIp, { subscribe: subscribe });
                if (subscribe && this.deviceIp) {
                    this.subscribe();
                }
                this.landscape$ = fromEvent(window, 'resize').pipe(startWith(true), mapTo(window), map(function (win) { return win.innerWidth > win.innerHeight; }));
                return [2 /*return*/];
            });
        });
    };
    RemotePage.prototype.setState = function (state) {
        this.idle = state.idle;
        this.connecting = state.connecting;
        this.connectionError = state.connectionError;
    };
    RemotePage.prototype.ionViewDidLeave = function () {
        console.log('ionViewDidLeave RemotePage');
        this.unsubscribe();
    };
    RemotePage.prototype.subscribe = function () {
        var _this = this;
        this.unsubscribe();
        this.setState({ idle: false, connecting: true, connectionError: false });
        this.subscription = interval(250).pipe(exhaustMap(function (i) { return _this.screen.GetFrame(_this.deviceIp, i === 0 ? 1 : 0); })).subscribe(function (data) { return __awaiter(_this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.setState({ idle: false, connecting: false, connectionError: false });
                        if (!(data.keyboard && !this.input)) return [3 /*break*/, 2];
                        console.log(data.keyboard);
                        _a = this;
                        return [4 /*yield*/, this.alertCtrl.create({
                                buttons: [{
                                        text: this.tr.instant('common.ok'),
                                        handler: function (inputData) {
                                            console.log('ok clicked', inputData.input);
                                            _this.screen.SetInput(_this.deviceIp, {
                                                mouse: null,
                                                keyboard: {
                                                    currentValue: inputData.input, inputName: data.keyboard.inputName, type: data.keyboard.type
                                                }
                                            });
                                            return false;
                                        }
                                    }, {
                                        text: this.tr.instant('common.cancel'),
                                        handler: function () {
                                            console.log('cancel clicked');
                                            _this.screen.SetInput(_this.deviceIp, {
                                                mouse: null,
                                                keyboard: {
                                                    currentValue: data.keyboard.currentValue, inputName: data.keyboard.inputName, type: data.keyboard.type
                                                }
                                            });
                                            return false;
                                        }
                                    }],
                                inputs: [{
                                        name: 'input',
                                        placeholder: data.keyboard.inputName,
                                        value: data.keyboard.currentValue,
                                        type: data.keyboard.type
                                    }],
                                message: this.tr.instant('remote.please-enter', { inputName: data.keyboard.inputName }),
                                backdropDismiss: false
                            })];
                    case 1:
                        _a.input = _b.sent();
                        this.input.present();
                        return [2 /*return*/];
                    case 2:
                        if (!data.keyboard && this.input) {
                            this.input.dismiss();
                            this.input = null;
                        }
                        _b.label = 3;
                    case 3:
                        if (data.image) {
                            this.imageSrc = this.sanitization.bypassSecurityTrustResourceUrl('data:image/jpeg;charset=utf-8;base64,' + data.image);
                        }
                        return [2 /*return*/];
                }
            });
        }); }, function (error) {
            _this.setState({ idle: false, connecting: false, connectionError: true });
            _this.helpers.showError(error);
        });
        this.moveSubscription = this.move.pipe(sample(interval(200))).subscribe(function (c) {
            console.log({ type: 'positionChanged', x: c.x, y: c.y });
            _this.screen.SetInput(_this.deviceIp, {
                mouse: { type: 'positionChanged', x: c.x, y: c.y },
                keyboard: null
            });
        });
    };
    RemotePage.prototype.unsubscribe = function () {
        if (this.subscription) {
            this.subscription.unsubscribe();
            this.NavigateToRootPage();
        }
        if (this.moveSubscription) {
            this.moveSubscription.unsubscribe();
        }
        this.setState({ idle: true, connecting: false, connectionError: false });
    };
    RemotePage.prototype.coords = function ($event) {
        var touch = $event.touches[0];
        if (!touch) {
            return;
        }
        var target = touch.target;
        var rect = target.getBoundingClientRect();
        console.log('touch.clientX/Y', touch.clientX, touch.clientY);
        console.log('bounding rect', rect);
        var x = touch.clientX - rect.left;
        var y = touch.clientY - rect.top;
        return {
            x: Math.round(x * target.naturalWidth / target.width),
            y: Math.round(y * target.naturalHeight / target.height)
        };
    };
    RemotePage.prototype.setRemoteIp = function () {
        return __awaiter(this, void 0, void 0, function () {
            var oldIp;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.remoteDevice.getIp()];
                    case 1:
                        oldIp = _a.sent();
                        this.alertCtrl.create({
                            message: this.tr.instant('remote.enter-device-ip'),
                            inputs: [
                                { name: 'ip', placeholder: this.tr.instant('remote.ip'), value: oldIp, type: 'text' }
                            ],
                            buttons: [
                                this.tr.instant('common.cancel'),
                                {
                                    text: this.tr.instant('common.ok'),
                                    handler: function (data) {
                                        var newIp = data.ip;
                                        if (!newIp || !newIp.trim()) {
                                            return false;
                                        }
                                        _this.remoteDevice.setIp(newIp.trim()).then(function () {
                                            _this.deviceIp = newIp;
                                            _this.subscribe();
                                        });
                                    }
                                }
                            ]
                        }).then(function (alert) { return alert.present(); });
                        return [2 /*return*/];
                }
            });
        });
    };
    RemotePage.prototype.showMenu = function (event) {
        return __awaiter(this, void 0, void 0, function () {
            var menu;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, MenuPopover.create(this.popoverCtrl, {
                            menuItems: [{
                                    icon: 'settings',
                                    text: this.tr.instant('remote.set-ip'),
                                    callback: function () { menu.dismiss(); _this.setRemoteIp(); }
                                }, {
                                    icon: 'search',
                                    text: this.tr.instant('remote.search-for-devices'),
                                    callback: function () { menu.dismiss(); _this.scan(); }
                                }]
                        }, event)];
                    case 1:
                        menu = _a.sent();
                        menu.present();
                        return [2 /*return*/];
                }
            });
        });
    };
    RemotePage.prototype.touchStart = function ($event) {
        var c = this.coords($event);
        console.log('touchStart', c);
        this.lastCoord = c;
        this.screen.SetInput(this.deviceIp, {
            mouse: { type: 'pressed', x: c.x, y: c.y },
            keyboard: null
        });
    };
    RemotePage.prototype.touchEnd = function ($event) {
        var c = this.coords($event) || this.lastCoord;
        console.log('touchEnd', c);
        if (c) {
            this.screen.SetInput(this.deviceIp, {
                mouse: { type: 'released', x: c.x, y: c.y },
                keyboard: null
            });
        }
    };
    RemotePage.prototype.touchMove = function ($event) {
        var c = this.coords($event);
        this.move.next(c);
    };
    RemotePage.prototype.NavigateToRootPage = function () {
        this.navCtrl.navigateRoot("tabs");
    };
    RemotePage.prototype.getDeviceIpAndConnect = function (deviceId) {
        return __awaiter(this, void 0, void 0, function () {
            var ip, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.loadingService.show({ message: this.tr.instant('remote.obtaining-device-info') })];
                    case 1:
                        _a.sent();
                        ip = null;
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.deviceScanner.getDeviceIp(deviceId)];
                    case 3:
                        ip = _a.sent();
                        this.loadingService.hide();
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        this.loadingService.hide();
                        this.helpers.showError(error_1);
                        return [2 /*return*/];
                    case 5:
                        if (!ip) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.remoteDevice.setIp(ip)];
                    case 6:
                        _a.sent();
                        this.subscribe();
                        _a.label = 7;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    RemotePage.prototype.scan = function () {
        return __awaiter(this, void 0, void 0, function () {
            var devices, alert_1, selection;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.loadingService.show({ message: this.tr.instant('remote.searching-for-devices') })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.deviceScanner.getTbsDevices()];
                    case 2:
                        devices = _a.sent();
                        console.log(devices);
                        this.loadingService.hide();
                        if (!(devices.length === 0)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.alertCtrl.create({ message: 'No device found', buttons: [this.tr.instant('common.ok')] })];
                    case 3:
                        alert_1 = _a.sent();
                        return [4 /*yield*/, alert_1.present()];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                    case 5: return [4 /*yield*/, this.alertCtrl.create({
                            header: this.tr.instant('remote.detected-devices'),
                            message: this.tr.instant('remote.select-device'),
                            buttons: [this.tr.instant('common.cancel'), {
                                    text: this.tr.instant('common.ok'),
                                    handler: function (deviceId) {
                                        console.log('selected', deviceId);
                                        _this.getDeviceIpAndConnect(deviceId);
                                    }
                                }],
                            inputs: devices.map(function (device, index) {
                                var input = {
                                    type: 'radio',
                                    label: device.name || device.id,
                                    value: device.id,
                                    checked: index === 0
                                };
                                return input;
                            })
                        })];
                    case 6:
                        selection = _a.sent();
                        selection.present();
                        return [2 /*return*/];
                }
            });
        });
    };
    __decorate([
        ViewChild('image'),
        __metadata("design:type", ElementRef)
    ], RemotePage.prototype, "image", void 0);
    RemotePage = __decorate([
        Component({
            selector: 'app-remote',
            templateUrl: './remote.page.html',
            styleUrls: ['./remote.page.scss'],
        }),
        __metadata("design:paramtypes", [ScreenService, RemoteDeviceService, DomSanitizer,
            AlertController, PopoverController, LoadingService,
            DeviceScannerService, ActivatedRoute, TranslateService,
            ErrorDialogService, NavController])
    ], RemotePage);
    return RemotePage;
}());
export { RemotePage };
//# sourceMappingURL=remote.page.js.map