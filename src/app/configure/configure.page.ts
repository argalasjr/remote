import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BLE } from '@ionic-native/ble/ngx';
import { ModalController, NavController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { ErrorDialogService } from '../services/error-dialog/error-dialog.service';
import { PeripheralData, PeripheralDataExtended } from '../interfaces/ble';
import { BluetoothNetworkClientService } from '../services/bluetooth-network-client/bluetooth-network-client.service';
import { LoadingService } from '../services/loading/loading.service';
import { RemoteDeviceService } from '../services/remote-screen/remote-device.service';
import { ConfigureModalPage } from './configure-modal.page';

/**
 * Component shows nearby devices with turned on Bluetooth beacon.
 * User can connect to these devices and configure their network.
 */
@Component({
  selector: 'app-configure',
  templateUrl: './configure.page.html',
  styleUrls: ['./configure.page.scss'],
})
export class ConfigurePage implements OnInit {

  scanning = false;
  devices: PeripheralData[] = [];

  constructor(
    private navCtrl: NavController, private cd: ChangeDetectorRef, private bleService: BluetoothNetworkClientService, private ble: BLE,
    private modalCtrl: ModalController, private platform: Platform, private loadingService: LoadingService,
    private remoteDevice: RemoteDeviceService, private tr: TranslateService, private helpers: ErrorDialogService
  ) { }

  async ngOnInit() {
    console.log('ionViewDidLoad ConfigurePage');
    await this.platform.ready();
    this.startScan();
  }

  async startScan() {
    console.log('startScan');
    await this.loadingService.show({ message: this.tr.instant('configure.detected-devices.scanning') });

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
      }
    }, 5000);
  }

  stopScan() {
    this.scanning = false;
    this.ble.stopScan();
  }

  async connect(device: PeripheralData) {
    await this.loadingService.show({ message: this.tr.instant('configure.detected-devices.connecting', { deviceName: device.name }) });
    let modal: HTMLIonModalElement = null;
    this.ble.connect(device.id).subscribe(
      async (connectedDevice) => {
        this.loadingService.hide();
        this.cd.detectChanges();
        modal = await this.openModal(connectedDevice);
      }, error => {
        if (modal) {
          modal.dismiss();
        }
        this.loadingService.hide();
        this.helpers.showError(error);
      }
    );
  }

  async openModal(connectedDevice: PeripheralDataExtended) {
    const modal = await this.modalCtrl.create({ component: ConfigureModalPage, componentProps: { connectedDevice } });
    modal.present();
    modal.onDidDismiss().then(overlayEventDetail => {
      if (!overlayEventDetail.data) {
        return;
      }

      this.remoteDevice.setIp(overlayEventDetail.data).then(() => {
        this.navCtrl.navigateForward(['remote', { subscribe: true }]);
      });
    });

    return modal;
  }
}
