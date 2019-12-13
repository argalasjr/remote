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
import { ActivatedRoute } from '@angular/router';
import { FileChooser } from '@ionic-native/file-chooser/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import { File } from '@ionic-native/file/ngx';
import { AlertController, NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { ErrorDialogService } from '../services/error-dialog/error-dialog.service';
import { KeysService } from '../services/keys/keys.service';
/**
 * Page for managing EVVA keys
 */
var KeysPage = /** @class */ (function () {
    function KeysPage(navCtrl, keysProvider, alertCtrl, activatedRoute, fileChooser, filePath, file, tr, helpers) {
        this.navCtrl = navCtrl;
        this.keysProvider = keysProvider;
        this.alertCtrl = alertCtrl;
        this.activatedRoute = activatedRoute;
        this.fileChooser = fileChooser;
        this.filePath = filePath;
        this.file = file;
        this.tr = tr;
        this.helpers = helpers;
        this.keys = [];
    }
    KeysPage.prototype.ionViewDidEnter = function () {
        return __awaiter(this, void 0, void 0, function () {
            var addKeyIfNone, newKeyName, newKeyValue, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        addKeyIfNone = this.activatedRoute.snapshot.paramMap.get('addKeyIfNone') === 'true';
                        newKeyName = this.activatedRoute.snapshot.paramMap.get('name');
                        newKeyValue = this.activatedRoute.snapshot.paramMap.get('value');
                        console.log('KeysPage ionViewDidEnter', { addKeyIfNone: addKeyIfNone, newKeyName: newKeyName, newKeyValue: newKeyValue });
                        _a = this;
                        return [4 /*yield*/, this.keysProvider.getKeys()];
                    case 1:
                        _a.keys = _b.sent();
                        if (this.keys.length === 0 && addKeyIfNone) {
                            this.addKey();
                        }
                        else if (newKeyName && newKeyValue) {
                            this.addKey(newKeyName, newKeyValue);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    KeysPage.prototype.import = function () {
        return __awaiter(this, void 0, void 0, function () {
            var name, content, url, e_1, nativeUrl, separatorIndex, path, file, suffixIndex, suffix, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.fileChooser.open()];
                    case 1:
                        url = _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_1 = _a.sent();
                        console.log(e_1);
                        return [2 /*return*/];
                    case 3:
                        _a.trys.push([3, 6, , 7]);
                        return [4 /*yield*/, this.filePath.resolveNativePath(url)];
                    case 4:
                        nativeUrl = _a.sent();
                        separatorIndex = nativeUrl.lastIndexOf('/');
                        path = nativeUrl.substring(0, separatorIndex);
                        file = nativeUrl.substring(separatorIndex + 1);
                        suffixIndex = file.lastIndexOf('.');
                        suffix = file.substring(suffixIndex);
                        if (suffix !== '.txt') {
                            throw new Error('This is probably not a stored key');
                        }
                        return [4 /*yield*/, this.file.readAsText(path, file)];
                    case 5:
                        content = _a.sent();
                        name = suffixIndex > 0 ? file.substring(0, suffixIndex) : file;
                        return [3 /*break*/, 7];
                    case 6:
                        error_1 = _a.sent();
                        this.helpers.showError(error_1);
                        return [2 /*return*/];
                    case 7:
                        this.addKey(name, content);
                        return [2 /*return*/];
                }
            });
        });
    };
    KeysPage.prototype.addKey = function (name, value) {
        if (name === void 0) { name = ''; }
        if (value === void 0) { value = ''; }
        return __awaiter(this, void 0, void 0, function () {
            var newKeyAlert;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.alertCtrl.create({
                            header: this.tr.instant('keys.add-new-key'),
                            inputs: [{
                                    value: name,
                                    name: 'name',
                                    placeholder: this.tr.instant('keys.key-name')
                                }, {
                                    value: value,
                                    name: 'value',
                                    placeholder: this.tr.instant('keys.key-content')
                                }],
                            buttons: [{
                                    text: this.tr.instant('common.cancel')
                                }, {
                                    text: this.tr.instant('common.add'),
                                    handler: function (key) {
                                        key.name = key.name.trim();
                                        key.value = key.value.trim();
                                        if (!key.name || !key.value) {
                                            _this.alertCtrl.create({
                                                message: _this.tr.instant('keys.enter-key-and-content'),
                                                buttons: [_this.tr.instant('common.ok')]
                                            }).then(function (alert) { return alert.present(); });
                                            return false;
                                        }
                                        _this.keys.push(key);
                                        _this.keysProvider.setKeys(_this.keys);
                                    }
                                }]
                        })];
                    case 1:
                        newKeyAlert = _a.sent();
                        newKeyAlert.present();
                        return [2 /*return*/];
                }
            });
        });
    };
    KeysPage.prototype.deleteKey = function (key) {
        var _this = this;
        this.alertCtrl.create({
            message: this.tr.instant('keys.delete-key-question'),
            buttons: [{
                    text: this.tr.instant('common.no')
                }, {
                    text: this.tr.instant('common.yes'),
                    handler: function () {
                        var index = _this.keys.indexOf(key);
                        if (index >= 0) {
                            _this.keys.splice(index, 1);
                            _this.keysProvider.setKeys(_this.keys);
                        }
                    }
                }]
        }).then(function (alert) { return alert.present(); });
    };
    KeysPage = __decorate([
        Component({
            selector: 'app-keys',
            templateUrl: './keys.page.html',
            styleUrls: ['./keys.page.scss'],
        }),
        __metadata("design:paramtypes", [NavController,
            KeysService,
            AlertController,
            ActivatedRoute,
            FileChooser,
            FilePath,
            File,
            TranslateService,
            ErrorDialogService])
    ], KeysPage);
    return KeysPage;
}());
export { KeysPage };
//# sourceMappingURL=keys.page.js.map