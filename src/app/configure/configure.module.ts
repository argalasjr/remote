import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { ConfigureModalPage } from './configure-modal.page';
import { ConfigurePage } from './configure.page';

const routes: Routes = [
  {
    path: '',
    component: ConfigurePage
  }
];

@NgModule({
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
export class ConfigurePageModule {}
