import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { AlertController, Platform} from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { RemoteDeviceService } from '../../services/remote-screen/remote-device.service';
import { HomePage } from '../home.page';
import { AlertInput } from '@ionic/core';
export interface MyDevice {
  id: string;
  key: string;
  ip: string;
  clientName: string;
}


@Component({
  selector: 'app-my-device',
  templateUrl: './my-device.component.html',
  styleUrls: ['./my-device.component.scss']
})
export class MyDeviceComponent implements OnInit {

  @Input() data: any;
  changeIpAlertInput = {
    id: 'changeIpAlertInput',
    name: 'ip',
    placeholder: this.tr.instant('remote.ip'),
    type:  'text'
  } as AlertInput;

  constructor(
    private tr: TranslateService,
    private alertCtrl: AlertController,
    private remoteDeviceService: RemoteDeviceService,
    private cd: ChangeDetectorRef,
    private platform: Platform,
    private home: HomePage) {
  }

  async ngOnInit() {
    await this.platform.ready().then(() => {
      if (this.platform.is('android')) {
        this.changeIpAlertInput.type = 'tel';
      }
    });
  }

  remote_connect(data: any) {
    data = this.data;
    this.home.remote(data.ip);
  }

  async setRemoteIp() {
    const device = await this.remoteDeviceService.getDeviceFromStorage(this.data.id);
    this.changeIpAlertInput.value = device.ip;
    this.alertCtrl.create({
      backdropDismiss: false,
      message: this.tr.instant('remote.enter-device-ip'),
      inputs: [
        this.changeIpAlertInput
      ],
      buttons: [
        this.tr.instant('common.cancel'),
        {
          text: this.tr.instant('common.ok'),
          handler: newData => {
            const newIp: string = newData.ip;
            if (!newIp || !newIp.trim()) {
              return false;
            }
            this.data.ip = newIp.trim();
            this.remoteDeviceService.setDeviceIp(this.data.id, this.data.ip).then(() => {
            this.remote_connect(this.data);
            });
          }
        }
      ]
    }).then(alert => alert.present()).then(() => {
      document.getElementById('changeIpAlertInput').focus();
    });
  }

  async delete() {
    this.alertCtrl.create({
      backdropDismiss: false,
      header: this.tr.instant('my-device.delete-header'),
      message: this.tr.instant('my-device.delete-text'),
      buttons: [
        this.tr.instant('common.cancel'),
        {
          text: this.tr.instant('common.ok'),
          handler: () => {
            this.remoteDeviceService.removeDeviceFromStorage(this.data.id).then(
              () => {
                this.remoteDeviceService.updateDeviceList();
              }
            );

          }
        }
      ]
    }).then(alrt => alrt.present());

  }

  async changeName() {
    const device = await this.remoteDeviceService.getDeviceFromStorage(this.data.id);
    this.alertCtrl.create({
      backdropDismiss: false,
      header: this.tr.instant('my-device.client-name-header'),
      message: this.tr.instant('my-device.client-name-text-change'),
      inputs: [
        {
          id: 'clientNameInputId',
          name: 'clientName',
          placeholder: this.tr.instant('my-device.client-name-placeholder'),
          value: device.clientName,
          type: 'text'
        }
      ],
      buttons: [
        this.tr.instant('common.cancel'),
        {
          text: this.tr.instant('common.ok'),
          handler: newData => {
            const newClientName: string = newData.clientName;
            if (!newClientName || newClientName.length > 16) {
              return false;
            }
            if (!/^([a-zA-Z0-9 _-]+)$/.test(newClientName)) {
              return false;
            }

            this.data.clientName = newClientName;
            this.remoteDeviceService.setDeviceClientName(this.data.id, this.data.clientName).then(() => {
            this.remoteDeviceService.updateDeviceList();
            this.cd.detectChanges();
            });
          }
        }
      ]
    }).then(alert => alert.present()).then(() => {
      document.getElementById('clientNameInputId').focus();
    });
  }

  async settings() {
    const selection = await this.alertCtrl.create({
      backdropDismiss: false,
      header: this.tr.instant('my-device.settings-header'),
      message: this.tr.instant('my-device.settings-text1')
       + '<br><br><strong>' + this.data.clientName + '</strong><br><br>'
        + this.tr.instant('my-device.settings-text2')
        + '<br><br><strong>' + this.data.ip + '</strong>',
      buttons: [this.tr.instant('common.cancel'), {
        text: this.tr.instant('common.ok'),
        handler: option => {
          console.log('selected', option);
          if (option === 1) {
            this.changeName();
          }
          if (option === 2) {
            this.setRemoteIp();
          }
        }
      }],
      inputs: [
          {
            type: 'radio',
            label: this.tr.instant('my-device.label-name'),
            value: 1
          },
          {
            type: 'radio',
            label: this.tr.instant('my-device.label-ip'),
            value: 2
          }
      ],
  });
    selection.present();
}
}
