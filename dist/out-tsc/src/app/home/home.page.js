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
import { Component } from '@angular/core';
import { NavController, PopoverController, AlertController, Events } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import * as URLParse from 'url-parse';
import { MenuPopover } from '../menu';
import { TranslateService } from '@ngx-translate/core';
import { RemoteDeviceService } from '../services/remote-screen/remote-device.service';
var HomePage = /** @class */ (function () {
    function HomePage(navCtrl, storage, popoverCtrl, tr, alertCtrl, events, remoteDeviceService) {
        var _this = this;
        this.navCtrl = navCtrl;
        this.storage = storage;
        this.popoverCtrl = popoverCtrl;
        this.tr = tr;
        this.alertCtrl = alertCtrl;
        this.events = events;
        this.remoteDeviceService = remoteDeviceService;
        this.myDevicesList = [];
        this.remoteDeviceService.getAllDevicesFromStorage(this.myDevicesList);
        // remoteDeviceService.addDeviceToStorage("1DT","192.168.137.233");
        // remoteDeviceService.addDeviceToStorage("2DM","192.168.137.234");
        this.events.subscribe('home:remote_connect', function (ip) {
            console.log("publish remote:conncet " + ip);
            _this.remote(ip);
            //this.events.publish('remote:connect',ip);    
        });
        // this.events.subscribe('device:add', (p_name,p_ip) => {
        //   this.my_devices_list.push({name: p_name, ip: p_ip});
        // });
    }
    HomePage.prototype.ionViewWillEnter = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, url, parsed;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, this.storage.get('showEvva')];
                    case 1:
                        _a.showEvva = _b.sent();
                        url = sessionStorage.getItem('launchUrl');
                        if (url) {
                            sessionStorage.removeItem('launchUrl');
                            parsed = new URLParse(url, true);
                            console.log(parsed, { name: parsed.query['name'], value: parsed.query['value'] });
                            if (parsed.protocol === 'comtbsremote:' && parsed.host === 'addkey' && parsed.query['name'] && parsed.query['value']) {
                                this.navCtrl.navigateForward(['keys', { name: parsed.query['name'], value: parsed.query['value'] }]);
                            }
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    HomePage.prototype.locks = function () {
        this.navCtrl.navigateForward('locks');
    };
    HomePage.prototype.remote = function (ip) {
        this.navCtrl.navigateForward(['remote', { ip: ip, subscribe: true }]);
    };
    HomePage.prototype.configure = function () {
        this.navCtrl.navigateForward('configure');
    };
    HomePage.prototype.showMenu = function (event) {
        return __awaiter(this, void 0, void 0, function () {
            var menu;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, MenuPopover.create(this.popoverCtrl, {
                            menuItems: [{
                                    icon: 'information-circle-outline',
                                    text: this.tr.instant('home.about'),
                                    callback: function () { return __awaiter(_this, void 0, void 0, function () {
                                        var about;
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0:
                                                    menu.dismiss();
                                                    return [4 /*yield*/, this.alertCtrl.create({
                                                            header: 'TBS Remote',
                                                            message: this.tr.instant('home.version') + ': ' + require('../../../package.json').version,
                                                            buttons: [this.tr.instant('common.ok')]
                                                        })];
                                                case 1:
                                                    about = _a.sent();
                                                    return [4 /*yield*/, about.present()];
                                                case 2:
                                                    _a.sent();
                                                    return [2 /*return*/];
                                            }
                                        });
                                    }); }
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
    HomePage = __decorate([
        Component({
            selector: 'app-home',
            templateUrl: 'home.page.html',
            styleUrls: ['home.page.scss'],
        }),
        __metadata("design:paramtypes", [NavController, Storage,
            PopoverController, TranslateService,
            AlertController, Events,
            RemoteDeviceService])
    ], HomePage);
    return HomePage;
}());
export { HomePage };
//# sourceMappingURL=home.page.js.map