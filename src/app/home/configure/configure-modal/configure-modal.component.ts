import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { AlertController, ModalController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, Subscription } from 'rxjs';
import { concatMap, debounceTime, map, tap } from 'rxjs/operators';
import { ErrorDialogService } from '../../../services/error-dialog/error-dialog.service';
import { PeripheralDataExtended } from '../../../interfaces/ble';
import { BluetoothNetworkClientService } from '../../../services/bluetooth-network-client/bluetooth-network-client.service';
import { LoadingService } from '../../../services/loading/loading.service';
/**
 * Modal dialog for device network configuration
 */
@Component({
  selector: 'app-configure-modal-component',
  templateUrl: './configure-modal.component.html',
  styleUrls: ['./configure-modal.component.scss'],
})
export class ConfigureModalComponent implements OnInit {
  @Input() connectedDevice: PeripheralDataExtended = null;
  @Input() changeIp: boolean = null;


  connectionStatus = {
    ip: null,
    network: ''
  };

  wifiCredentials = {
    ssid: '',
    passphrase: ''
  };

  private textEncoder = new TextEncoder();
  private textDecoder = new TextDecoder();
  private subscriptions: Subscription[] = [];
  private aboutToConnect = false;
  private connecting = false;
  private connectionRequestCount = 0;
  private responseCount = 0;
  private timeoutNetwork = null;

  constructor(
    public modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private tr: TranslateService,
    private bleService: BluetoothNetworkClientService,
    private platform: Platform,
    private cd: ChangeDetectorRef,
    private helpers: ErrorDialogService,
    private loadingService: LoadingService,
  ) {
  }

  async ngOnInit() {
    console.log('ConfigureModalPage::ngOnInit', this.connectedDevice, this.changeIp);
    await this.platform.ready();
    if (window['WifiWizard2']) {
      try {
        this.wifiCredentials.ssid = await window['WifiWizard2'].getConnectedSSID();
      } catch (error) {
       // this.helpers.showError(error);
        console.log('getConnectedSSID failed:', error);
      }
    }
    this.getDeviceNetworkConfig();
  }

  ionViewWillLeave() {
    console.log('ionViewWillLeave ConfigureModalPage');
    this.loadingService.hide();
    if ( this.timeoutNetwork != null ) {
      this.connectionRequestCount = 0;
      this.responseCount = 0;
      this.timeoutNetwork.unref();
    }
  }
  connectToWifi() {
  if (!this.aboutToConnect) {
    this.aboutToConnect = true;
    this.alertCtrl.create({
      backdropDismiss: false,
      header: this.tr.instant('configure-modal.connect.wi-fi-credentials'),
      message: this.tr.instant('configure-modal.connect.wi-fi-credentials-help-text'),
      inputs: [{
        type: 'text',
        value: this.wifiCredentials.ssid,
        placeholder: this.tr.instant('configure-modal.connect.ssid'),
        name: 'ssid'
      }, {
        type: 'password',
        value: this.wifiCredentials.passphrase,
        placeholder: this.tr.instant('configure-modal.connect.password'),
        name: 'passphrase'
      }],
      buttons: [
        {
          text: this.tr.instant('common.cancel'),
          handler: () => {
            this.modalCtrl.dismiss();
          }
        },
        {
          text: this.tr.instant('common.ok'),
          handler: value => {
            const ssid = value.ssid ? value.ssid.trim() as string : '';
            const passphrase = value.passphrase as string | '';
            if (!ssid) {
              this.showMessageBox(this.tr.instant('configure-modal.connect.missing-ssid'));
              return false;
            } else if (passphrase.length < 8) {
              this.showMessageBox(this.tr.instant('configure-modal.connect.missing-password'));
              return false;
            } else {
            this.setNetwork(ssid, passphrase);
            }
          }
        }
      ]
    }).then(alrt => alrt.present());
  }
  }
  private async getDeviceNetworkConfig() {
    const ip$ = this.bleService.readAndObserve(
      this.connectedDevice.id,
      this.bleService.networkServiceUuid,
      this.bleService.ipCharacteristicsUuid
    ).pipe(
      map(buffer => {
        const array = new Uint8Array(buffer);
        if (array.length === 4 && array[0] !== 0) {
          return array.join('.');
        }
        return null;
      })
    );

    const network$ = this.bleService.readAndObserve(
      this.connectedDevice.id,
      this.bleService.networkServiceUuid,
      this.bleService.connectedWifiNetworkCharacteristicsUuid
    ).pipe(
      map(buffer => this.textDecoder.decode(new Uint8Array(buffer)))
    );

    const subscription = combineLatest([ip$, network$]).pipe(
      map(([ip, network]) => ({ ip, network })),
      tap(console.log),
      debounceTime(200),
    ).subscribe(status => {
      console.log('received', status);
      if (status.ip) {
        this.connecting = false;
        this.connectionStatus = status;
        this.cd.detectChanges();
      }
      if (!this.connecting) {
      if (this.connectionStatus.ip && !this.changeIp ) {
        this.loadingService.hide();
        this.modalCtrl.dismiss(this.connectedDevice, this.connectionStatus.ip);
      } else {
        this.connectToWifi();
      }
      } else { // connecting
          this.connectionRequestCount += 1;
          if (this.connectionRequestCount > 1) {
          this.connecting = false;
          this.loadingService.hide();
          this.modalCtrl.dismiss(null, null);
        }
      }
    }, error => {
      this.helpers.showError(error);
    });
    this.subscriptions.push(subscription);
  }
  private showMessageBox(message: string) {
    this.alertCtrl.create({ backdropDismiss: false, message, buttons: [this.tr.instant('common.ok')] }).then(alrt => alrt.present());
  }

  private encode(toEncode: string): ArrayBuffer {
    return this.textEncoder.encode(toEncode).buffer as ArrayBuffer;
  }

  private setNetwork(ssid: string, passphrase: string) {
    this.connecting = true;
    this.loadingService.show({
      message: this.tr.instant('configure.set-network')
    });
    const writeSsid = this.bleService.write(
      this.connectedDevice.id, this.bleService.networkServiceUuid, this.bleService.ssidCharacteristicsUuid, this.encode(ssid)
    );
    const writePassphrase = this.bleService.write(
      this.connectedDevice.id, this.bleService.networkServiceUuid, this.bleService.passCharacteristicsUuid, this.encode(passphrase)
    );

    writeSsid.pipe(concatMap(() => writePassphrase),
    tap(console.log),
    debounceTime(200)).subscribe((status) => {
      this.responseCount += 1;
      if (this.responseCount < 1) {
        console.log(status);
        this.timeoutNetwork = setTimeout(() => {
                this.loadingService.hide();
                this.modalCtrl.dismiss(null, null);
            }, 15000);
        }
    }
    , error => {
      console.log('write error:', error);
    });
  }
}
