import { Component, ChangeDetectionStrategy, ChangeDetectorRef, NgZone, OnInit } from '@angular/core';
import { NavController, AlertController, Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import * as URLParse from 'url-parse';
import { TranslateService } from '@ngx-translate/core';
import { RemoteDeviceService } from '../services/remote-screen/remote-device.service';
import { ErrorDialogService } from '../services/error-dialog/error-dialog.service';
import { LoadingService } from '../services/loading/loading.service';
import { MyDevice } from './my-device/my-device.component';
import { HTTP } from '@ionic-native/http/ngx';
import { ConfigureComponent } from './configure/configure.component';
import { AlertInput } from '@ionic/core';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';

/**
 * Home page component
 */

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})


export class HomePage implements OnInit {

  showEvva: boolean;
  myDevicesList = [] as MyDevice[];
  myDevice = {} as MyDevice;
  connecting = false;
  // FOR TESTING
  testing = false;
  testDevice = {key: '2DM' , id: '5555', clientName: 'testDevice', ip: '192.168.137.160'} as MyDevice;
  changeIpAlertInput = {
    id: 'changeIpAlertInput',
    name: 'ip',
    placeholder: this.tr.instant('remote.ip'),
    type:  'text'
  } as AlertInput;
  constructor(
    private navCtrl: NavController,
    private storage: Storage,
    private tr: TranslateService,
    private alertCtrl: AlertController,
    private remoteDeviceService: RemoteDeviceService,
    private loadingService: LoadingService,
    private advHttp: HTTP,
    private platform: Platform,
    private helpers: ErrorDialogService,
    private ngZone: NgZone,
    private cd: ChangeDetectorRef,
    private configure: ConfigureComponent,
    private screenOrientation: ScreenOrientation
  ) {
    this.ngZone.run(() => {
      this.remoteDeviceService.updateDeviceListEvent.subscribe(() => {
        console.log('catch update');
        this.remoteDeviceService.getAllDevicesFromStorage(this.myDevicesList);
        this.cd.detectChanges();
      });
  });
  }

  async ngOnInit() {
    await this.platform.ready().then(() => {

      this.screenOrientation.onChange().subscribe(
        () => {
          console.log("Orientation Changed"+this.screenOrientation.type);
        }
      );
      this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
      if (this.platform.is('android')) {
        this.changeIpAlertInput.type = 'tel';
      }
      this.advHttp.setServerTrustMode('nocheck').then((res: any) => {
        this.advHttp.setRequestTimeout(15);
        if (this.testing) {
          this.remoteDeviceService.removeDeviceFromStorage(this.testDevice.id);
          this.remoteDeviceService.addDeviceToStorage(this.testDevice.id, this.testDevice);
        }
      }, (error) => {
        this.helpers.showError(error);
      });
    });
  }

  async ionViewWillEnter() {
    this.remoteDeviceService.updateDeviceList();
    this.cd.detectChanges();
    this.showEvva = await this.storage.get('showEvva');
    const url = sessionStorage.getItem('launchUrl');
    if (url) {
      sessionStorage.removeItem('launchUrl');
      const parsed = new URLParse(url, true);
      console.log(parsed, { name: parsed.query['name'], value: parsed.query['value'] });
      if (parsed.protocol === 'comtbsremote:' && parsed.host === 'addkey' && parsed.query['name'] && parsed.query['value']) {
        this.ngZone.run(() => {
        this.navCtrl.navigateForward(['tabs/keys', { name: parsed.query['name'], value: parsed.query['value'] }]);
        });
      }
    }
  }

  locks() {
    this.ngZone.run(() => {
      this.navCtrl.navigateForward('locks');
    });
  }

  remote(ip) {
    this.ngZone.run(() => {
      this.navCtrl.navigateForward(['remote', { ip , subscribe: true}]);
    });
  }

  async newConnection() {
    this.alertCtrl.create({
      header: this.tr.instant('home.new-connection-header'),
      message: '<strong>' + this.tr.instant('home.network') + ':</strong><br>'
      + this.tr.instant('home.new-connection-text-network') + '<br><br>'
      + '<strong>' + this.tr.instant('home.bluetooth') + ':</strong><br>'
      + this.tr.instant('home.new-connection-text-ble') + '<br>'
      + this.tr.instant('home.new-connection-text-ble-note') + '<br>',
      cssClass: 'ion-alert',
      buttons: [
        {
          text:  this.tr.instant('home.bluetooth'),
          handler: () => {
            this.configure.startScan();
          }
        },
        {
          text: this.tr.instant('home.network'),
          handler: () => {
            this.addDevice();
          }
        }
      ]
    }).then(alert => alert.present());
  }
  startBluetoothConnection() {
    this.configure.startScan();
  }

  async addDevice() {
    await this.alertCtrl.create({
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
            console.log(newIp);
            if (!newIp || !newIp.trim()) {
              console.log('fail ' + newIp);
              return false;
               // tslint:disable-next-line:max-line-length
            } else if (!/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(newIp.trim())) {
              console.log('regex fail ' + newIp);
              return false;
            } else {
              this.GetInfo(newIp.trim());
            }
          }
        }
      ]
    }).then(alert => alert.present()).then(() => {
      document.getElementById('changeIpAlertInput').focus();
    });
  }

  async GetInfo(ip: string) {
      this.connecting = true;
      this.advHttp.setDataSerializer('json');
      const url = `https://${ip}:8221/TBS.TSeries.Services.Info.Static`;
      this.loadingService.show({ message: this.tr.instant('remote.connecting') });
      this.advHttp.sendRequest(url,
      {
        timeout: 15,
        method: 'post',
        data: {
          id: '1',
          jsonrpc: '2.0',
          method: 'GetInfo',
          params: {}
      },
        headers: { Authorization: 'OAuth2: token' },
      }
    ).then((res: any) => {
        this.connecting = false;
        this.myDevice = {} as MyDevice;
        this.loadingService.hide();
        const jsonRes = JSON.parse(res.data);
        this.myDevice.id = jsonRes.result.bioClientID;
        const type = jsonRes.result.type;
        this.myDevice.key = type.split(' ')[1];
        this.myDevice.ip = ip;
        this.saveDevice();
      }, (error) => {
        console.log(error);
        this.loadingService.hide();
        this.helpers.showError(this.tr.instant('remote.error'));
      });
      setTimeout(() => {
        if (this.connecting) {
          this.loadingService.hide();
          this.connecting = false;
          this.helpers.showError(this.tr.instant('remote.error'));
          return;
        }

      }, 5000);


    }

    async saveDevice() {
      const selection = await this.alertCtrl.create({
        backdropDismiss: false,
        header: this.tr.instant('my-device.save-header'),
        message: this.tr.instant('my-device.save-text'),
        inputs: [
          { name: 'clientName', placeholder: this.tr.instant('my-device.client-name-placeholder'), type: 'text'}
        ],
        buttons: [
        {
          text: this.tr.instant('common.no'),
          handler: () => { this.remote(this.myDevice.ip); }
        },
        {
          text: this.tr.instant('common.yes'),
          handler: (newData) => {
            const newName: string = newData.clientName;
            if (!newName || !newName.trim() || newName.length > 16) {
              return false;
            }
            if (!/^([a-zA-Z0-9 _-]+)$/.test(newName)) {
              return false;
              }

            this.myDevice.clientName = newName;
            this.remoteDeviceService.removeDeviceFromStorage(this.myDevice.id);
            this.remoteDeviceService.addDeviceToStorage(this.myDevice.id, this.myDevice).then(
              () => {
                this.remoteDeviceService.updateDeviceList();
                this.cd.detectChanges();
                this.ngZone.run(() => {
                this.navCtrl.navigateForward(['remote', { ip: this.myDevice.ip , subscribe: true}])
              .then( () => { delete this.myDevice; });
                });
              });
          }
        }],
      });
      selection.present();
    }



}
