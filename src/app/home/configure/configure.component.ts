import { ChangeDetectorRef, Component, OnInit, NgZone } from '@angular/core';
import { BLE } from '@ionic-native/ble/ngx';
import { ModalController, NavController, AlertController, Platform} from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { ErrorDialogService } from '../../services/error-dialog/error-dialog.service';
import { PeripheralData, PeripheralDataExtended } from '../../interfaces/ble';
import { BluetoothNetworkClientService } from '../../services/bluetooth-network-client/bluetooth-network-client.service';
import { LoadingService } from '../../services/loading/loading.service';
import { RemoteDeviceService } from '../../services/remote-screen/remote-device.service';
import { ConfigureModalComponent } from './configure-modal/configure-modal.component';
import { MyDevice } from '../my-device/my-device.component';
import { HTTP } from '@ionic-native/http/ngx';



/**
 * Component shows nearby devices with turned on Bluetooth beacon.
 * User can connect to these devices and configure their network.
 */
@Component({
  selector: 'app-configure-component',
  templateUrl: './configure.component.html',
  styleUrls: ['./configure.component.scss'],
})
export class ConfigureComponent implements OnInit {


  scanning = false;
  devices: PeripheralData[] = [];
  myDeviceList: MyDevice[] = [];
  myDevice = {} as MyDevice;
  // FOR TESTING
  testing = false;
  testDevice = {key: '2DT' , id: '4444', clientName: 'detectedDevice', ip: '192.168.137.147'} as MyDevice;
  constructor(
    private navCtrl: NavController,
    private cd: ChangeDetectorRef,
    private bleService: BluetoothNetworkClientService,
    private ble: BLE,
    private modalCtrl: ModalController,
    private loadingService: LoadingService,
    private remoteDevice: RemoteDeviceService,
    private tr: TranslateService,
    private helpers: ErrorDialogService,
    private alertCtrl: AlertController,
    private advHttp: HTTP,
    private ngZone: NgZone,
    private platform: Platform,
  ) { }

  async ngOnInit() {
    await this.platform.ready().then(() => {
      this.advHttp.setServerTrustMode('nocheck').then((res: any) => {

      }, (error) => {
        this.helpers.showError(error);
      });

    });
  }

  async startScan() {
    console.log('startScan');
    await this.ble.isEnabled().then(async () => {

    await this.loadingService.show({ message: this.tr.instant('configure.detected-devices.scanning') });
    this.remoteDevice.getAllDevicesFromStorage(this.myDeviceList);
    console.log(this.myDeviceList);
    this.devices.splice(0, this.devices.length);
    this.scanning = true;
    this.ble.startScan([this.bleService.networkServiceUuid]).subscribe((device: PeripheralData) => {
      console.log('detected', device);
      if (!this.devices.find(storedDevice => storedDevice.id === device.id)) {
        this.devices.push(device);
        this.cd.detectChanges();
      }
    }, error => {
      console.log('start scan error', error);
      this.helpers.showError(error);
      this.scanning = false;
      this.loadingService.hide();
    });

    setTimeout(() => {
      if (this.scanning) {
        this.loadingService.hide();
        this.stopScan();
        if (this.testing) {
        this.devices.push( {name: '2DT' , id: '5555'} as PeripheralData);
      }
      }
      if (this.devices.length > 0) {
        this.displaySelection();
      } else {

      }
    }, 5000);
  }, () => {
    this.helpers.showError(this.tr.instant('configure.disconnected'));
  }
  );
  }

  stopScan() {
    this.scanning = false;
    this.ble.stopScan();
  }

  async displaySelection() {
    const selection = await this.alertCtrl.create({
      backdropDismiss: false,
      header: this.tr.instant('remote.detected-devices'),
      message: this.tr.instant('remote.select-device'),
      buttons: [this.tr.instant('common.cancel'), {
        text: this.tr.instant('common.ok'),
        handler: deviceId => {
          const device = this.devices.find( elem => elem.id === deviceId );
          if (device) {
            console.log('selected', deviceId);
            if ( this.testing ) {
              this.remoteDevice.removeDeviceFromStorage(this.testDevice.id);
              this.remoteDevice.addDeviceToStorage(this.testDevice.id, this.testDevice).then(
                () => {
                 const index: number = this.devices.findIndex(dev => dev.id === deviceId);
                 if (index !== -1) {
                     this.devices.splice(index, 1);
                 }
                 this.remoteDevice.updateDeviceList();
                 this.cd.detectChanges();
                 this.ngZone.run(() => {
                   this.navCtrl.navigateForward(['remote', { ip : this.testDevice.ip, subscribe: true }]);
                 });
                 });
            } else {
              this.connect(device);
            }

          }
        }
      }],
      inputs: this.devices.map((device, index) => {
        const input: any = {
          type: 'radio',
          img: 'assets/imgs/devices/' + device.name + '.png',
          label: device.name || device.id,
          value: device.id,
          checked: index === 0
        };
        return input;
      })
    });
    selection.present();
  }

  async connect(device: PeripheralData, changeIp: boolean = false) {
    await this.loadingService.show({
      message: this.tr.instant('configure.detected-devices.connecting',
      { deviceName: device.name })
    });
    let modal: HTMLIonModalElement = null;
    this.ble.connect(device.id).subscribe(
      async (connectedDevice) => {
        this.loadingService.hide();
        this.cd.detectChanges();
        console.log('device');
        console.log(connectedDevice);
        modal = await this.openModal(connectedDevice, changeIp);
      }, error => {
        if (modal) {
          modal.dismiss();
        } else {
          this.ngZone.run(() => {
            this.navCtrl.navigateRoot('tabs');
          });
        }
        this.loadingService.hide();
        this.helpers.showError(error);
      }
    );
  }

  private disconnect(deviceId) {
    this.bleService.disconnect(deviceId).subscribe(() => { }, error => console.log(error));
  }


  async openModal(connectedDevice: PeripheralDataExtended, changeIp: boolean) {
    const modal = await this.modalCtrl.create({
        component: ConfigureModalComponent,
        componentProps: { connectedDevice, changeIp},
        cssClass: 'modal-transparency'
      });
    modal.present();
    modal.onDidDismiss().then(async overlayEventDetail => {
      console.log(overlayEventDetail);
      if (!overlayEventDetail.data || !overlayEventDetail.role) {
        this.disconnect(connectedDevice.id);
        this.helpers.showError(this.tr.instant('remote.error'));
        return;
      } else {
          this.proceedGetDeviceInfoAlert(overlayEventDetail.data.id, overlayEventDetail.role);
      }
    }
    );

    return modal;
  }
  async GetDeviceInfo(deviceId: string, ip: string ) {
    this.advHttp.setDataSerializer('json');
    const url = `https://${ip}:8221/TBS.TSeries.Services.Info.Static`;
    this.loadingService.show({ message: this.tr.instant('configure.fetch') });
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
        this.loadingService.hide();
        this.myDevice = {} as MyDevice;
        const jsonRes = JSON.parse(res.data);
        this.myDevice.id = jsonRes.result.bioClientID;
        const type = jsonRes.result.type;
        this.myDevice.key = type.split(' ')[1];
        this.myDevice.ip = ip;
        this.setClientName(deviceId);

    }, (error) => {
      this.loadingService.hide();
      console.log(error);
      this.disconnect(deviceId);
      this.changeNetworkAlert(deviceId);
      // this.helpers.showError(this.tr.instant('configure.network-unreachable'));
    });
  }

  setClientName(deviceId: string) {
    this.alertCtrl.create({
      backdropDismiss: false,
      header: this.tr.instant('my-device.client-name-header'),
      message: this.tr.instant('my-device.client-name-text-set'),
      inputs: [
        { name: 'clientName', placeholder: this.tr.instant('my-device.client-name-placeholder'), type: 'text' }
      ],
      buttons: [
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
            this.myDevice.clientName = newClientName;
            this.remoteDevice.removeDeviceFromStorage(this.myDevice.id).then(() => {
            this.remoteDevice.addDeviceToStorage(this.myDevice.id, this.myDevice).then(
             () => {
              const index: number = this.devices.findIndex(device => device.id === deviceId);
              if (index !== -1) {
                  this.devices.splice(index, 1);
                  this.bleService.disconnect(deviceId);
              }
              this.remoteDevice.updateDeviceList();
              this.cd.detectChanges();
              this.ngZone.run(() => {
                this.navCtrl.navigateForward(['remote', { ip : this.myDevice.ip, subscribe: true }])
                .then( () => { delete this.myDevice; });
              });
            });
              }
            );
          }
        }
      ]
    }).then(alert => alert.present());
  }

  async changeNetworkAlert(deviceId) {
    this.alertCtrl.create({
      backdropDismiss: false,
      header: this.tr.instant('configure.network-header'),
      message: this.tr.instant('configure.network-unreachable'),
      buttons: [
        this.tr.instant('common.no'),
        {
          text: this.tr.instant('common.ok'),
          handler: () => {
            const device = this.devices.find( elem => elem.id === deviceId );
            if (device) {
                this.connect(device, true);
            }
          }
        },
      ]
    }).then(alert => alert.present());
  }

  async proceedGetDeviceInfoAlert(deviceId, deviceIp) {
    this.alertCtrl.create({
      backdropDismiss: false,
      header: this.tr.instant('configure.proceed-header'),
      message: this.tr.instant('configure.proceed-text'),
      buttons: [
        {
          text: this.tr.instant('common.proceed'),
          handler: () => {
              this.GetDeviceInfo(deviceId, deviceIp);
          }
        },
      ]
    }).then(alert => alert.present());
  }
}
