var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Input } from '@angular/core';
var MenuPopover = /** @class */ (function () {
    function MenuPopover() {
    }
    MenuPopover_1 = MenuPopover;
    MenuPopover.create = function (popoverCtrl, data, event) {
        return popoverCtrl.create({ component: MenuPopover_1, componentProps: data, event: event });
    };
    MenuPopover.prototype.click = function (callback) {
        callback();
        // this.viewCtrl.dismiss();
    };
    var MenuPopover_1;
    __decorate([
        Input(),
        __metadata("design:type", Array)
    ], MenuPopover.prototype, "menuItems", void 0);
    MenuPopover = MenuPopover_1 = __decorate([
        Component({
            template: "\n    <ion-list lines=\"none\">\n        <ion-item button *ngFor=\"let item of menuItems\" ion-item (click)=\"click(item.callback)\">\n            <ion-icon [name]=\"item.icon\" slot=\"start\"></ion-icon>\n            {{item.text}}\n        </ion-item>\n    </ion-list>\n    "
        })
    ], MenuPopover);
    return MenuPopover;
}());
export { MenuPopover };
//# sourceMappingURL=menu.js.map