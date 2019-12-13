import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { AlertController, ModalController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, Subscription } from 'rxjs';
import { concatMap, debounceTime, map, tap } from 'rxjs/operators';
import { ErrorDialogService } from '../services/error-dialog/error-dialog.service';
import { PeripheralDataExtended } from '../interfaces/ble';
import { BluetoothNetworkClientService } from '../services/bluetooth-network-client/bluetooth-network-client.service';

/**
 * Modal dialog for device network configuration
 */
@Component({
  selector: 'app-configure-modal',
  templateUrl: './configure-modal.page.html',
  styleUrls: ['./configure-modal.page.scss'],
})
export class ConfigureModalPage implements OnInit {

  @Input() connectedDevice: PeripheralDataExtended = null;

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

  constructor(
    public modalCtrl: ModalController, private alertCtrl: AlertController, private tr: TranslateService,
    private bleService: BluetoothNetworkClientService, private platform: Platform, private cd: ChangeDetectorRef,
    private helpers: ErrorDialogService
  ) { }

  async ngOnInit() {
    console.log('ConfigureModalPage::ngOnInit', this.connectedDevice);
    await this.platform.ready();
    if (window['WifiWizard2']) {
      try {
        this.wifiCredentials.ssid = await window['WifiWizard2'].getConnectedSSID();
      } catch (error) {
        this.helpers.showError(error);
        console.log('getConnectedSSID failed:', error);
      }
    }

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
      this.connectionStatus = status;
      this.cd.detectChanges();
    }, error => {
      this.helpers.showError(error);
    });
    this.subscriptions.push(subscription);
  }

  ionViewWillLeave() {
    console.log('ionViewWillLeave ConfigureModalPage');
    this.subscriptions.forEach(s => s.unsubscribe());
    this.disconnect();
  }

  connectToWifi() {
    this.alertCtrl.create({
      header: this.tr.instant('configure-modal.connect.wi-fi-credentials'),
      message: this.tr.instant('configure-modal.connect.wi-fi-credentials-help-text'),
      inputs: [{
        type: 'text',
        value: this.wifiCredentials.ssid,
        placeholder: this.tr.instant('configure-modal.connect.ssid'),
        name: 'ssid'
      }, {
        type: 'text',
        value: this.wifiCredentials.passphrase,
        placeholder: this.tr.instant('configure-modal.connect.password'),
        name: 'passphrase'
      }],
      buttons: [
        this.tr.instant('common.cancel'),
        {
          text: this.tr.instant('common.ok'),
          handler: value => {
            const ssid = value.ssid ? value.ssid.trim() as string : '';
            const passphrase = value.passphrase as string | '';
            if (!ssid) {
              this.showMessageBox(this.tr.instant('configure-modal.connect.missing-ssid'));
              return false;
            }
            if (passphrase.length < 8) {
              this.showMessageBox(this.tr.instant('configure-modal.connect.missing-password'));
              return false;
            }
            this.setNetwork(ssid, passphrase);
          }
        }
      ]
    }).then(alrt => alrt.present());
  }

  private showMessageBox(message: string) {
    this.alertCtrl.create({ message, buttons: [this.tr.instant('common.ok')] }).then(alrt => alrt.present());
  }

  private disconnect() {
    this.bleService.disconnect(this.connectedDevice.id).subscribe(() => { }, error => console.log(error));
  }

  private encode(string: string): ArrayBuffer {
    return this.textEncoder.encode(string).buffer as ArrayBuffer;
  }

  private setNetwork(ssid: string, passphrase: string) {
    const writeSsid = this.bleService.write(
      this.connectedDevice.id, this.bleService.networkServiceUuid, this.bleService.ssidCharacteristicsUuid, this.encode(ssid)
    );
    const writePassphrase = this.bleService.write(
      this.connectedDevice.id, this.bleService.networkServiceUuid, this.bleService.passCharacteristicsUuid, this.encode(passphrase)
    );
    writeSsid.pipe(concatMap(() => writePassphrase)).subscribe(() => {
      console.log('write success');
    }, error => {
      console.log('write error:', error);
      this.helpers.showError(error);
    });
  }
}
