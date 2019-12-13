import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { HomePage } from './home.page';
import { MyDeviceComponent } from './my-device/my-device.component'
import { ConfigureComponent } from './configure/configure.component'
import { ConfigureModalComponent } from './configure/configure-modal/configure-modal.component'

@NgModule({
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
  exports:[
    MyDeviceComponent,
    ConfigureComponent,
    ConfigureModalComponent
  ],
})
export class HomePageModule {}
