var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { ConfigureModalPage } from './configure-modal.page';
import { ConfigurePage } from './configure.page';
var routes = [
    {
        path: '',
        component: ConfigurePage
    }
];
var ConfigurePageModule = /** @class */ (function () {
    function ConfigurePageModule() {
    }
    ConfigurePageModule = __decorate([
        NgModule({
            imports: [
                CommonModule,
                FormsModule,
                IonicModule,
                RouterModule.forChild(routes),
                TranslateModule.forChild()
            ],
            entryComponents: [ConfigureModalPage],
            declarations: [ConfigurePage, ConfigureModalPage]
        })
    ], ConfigurePageModule);
    return ConfigurePageModule;
}());
export { ConfigurePageModule };
//# sourceMappingURL=configure.module.js.map