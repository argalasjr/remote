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
import { HomePage } from './home.page';
import { MyDeviceComponent } from './my-device/my-device.component';
import { ConfigureComponent } from './configure/configure.component';
import { ConfigureModalComponent } from './configure/configure-modal/configure-modal.component';
var HomePageModule = /** @class */ (function () {
    function HomePageModule() {
    }
    HomePageModule = __decorate([
        NgModule({
            imports: [
                CommonModule,
                FormsModule,
                IonicModule,
                RouterModule.forChild([
                    {
                        path: '',
                        component: HomePage
                    }
                ]),
                TranslateModule.forChild()
            ],
            entryComponents: [ConfigureModalComponent],
            declarations: [HomePage,
                MyDeviceComponent,
                ConfigureComponent,
                ConfigureModalComponent
            ],
            exports: [
                MyDeviceComponent,
                ConfigureComponent,
                ConfigureModalComponent
            ],
        })
    ], HomePageModule);
    return HomePageModule;
}());
export { HomePageModule };
//# sourceMappingURL=home.module.js.map