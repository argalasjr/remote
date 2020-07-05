import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

/**
 * Helpers service for showing error dialog
 */
@Injectable({
  providedIn: 'root'
})
export class ErrorDialogService {

  constructor(private alertCtrl: AlertController, private tr: TranslateService) { }

  async showError(error: any) {
    console.log('error:', error);
    let message = error;
    if (error && error.errorMessage) {
      message = error.errorMessage;
    } else if (error && error.message) {
      message = error.message;
    } else if (error && error.toString && typeof (error.toString) === 'function') {
      message = error.toString();
    }

    const alert = await this.alertCtrl.create({
      backdropDismiss: false,
      header: this.tr.instant('common.error'),
      message,
      buttons: [this.tr.instant('common.ok')]
    });
    alert.present();
  }
}
