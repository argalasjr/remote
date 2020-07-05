import { ChangeDetectorRef, Component, NgZone } from '@angular/core';
import { BLE } from '@ionic-native/ble/ngx';
import { AlertController, NavController, Platform } from '@ionic/angular';
import { AlertInput } from '@ionic/core';
import { TranslateService } from '@ngx-translate/core';
import { map, mergeMap, take, tap } from 'rxjs/operators';
import { ErrorDialogService } from '../services/error-dialog/error-dialog.service';
import { PeripheralData } from '../interfaces/ble';
import { EvvaService } from '../services/evva/evva.service';
import { computeSession } from '../services/evva/messages';
import { DisengageMode } from '../services/evva/types';
import { IKey, KeysService } from '../services/keys/keys.service';
import { LoadingService } from '../services/loading/loading.service';

/**
 * Page shows EVVA locks nearby. You can click on the lock and open it.
 */
@Component({
  selector: 'app-locks',
  templateUrl: './locks.page.html',
  styleUrls: ['./locks.page.scss'],
})
export class LocksPage {

  keys: IKey[] = [];
  devices: PeripheralData[] = [];
  scanning = false;

  constructor(
    public navCtrl: NavController,
    private platform: Platform,
    private cd: ChangeDetectorRef,
    private evva: EvvaService,
    private keysProvider: KeysService,
    private alertCtrl: AlertController,
    private loadingService: LoadingService,
    private ble: BLE,
    private tr: TranslateService,
    private helpers: ErrorDialogService,
    private ngZone: NgZone
  ) { }

  async startScan() {
    await this.platform.ready();

    if (this.keys.length === 0) {
      this.alertNoKeys();
      return;
    }

    if (this.scanning) {
      return;
    }
    this.scanning = true;

    await this.loadingService.show({ message: this.tr.instant('locks.scanning') });
    this.devices = [];

    if (window['ble']) {
      this.ble.startScan([EvvaService.serviceUuid]).subscribe(device => {
        this.devices.push(device);
        this.cd.detectChanges();
        console.log(device);
      });
    } else {
      setTimeout(() => {
        this.devices.push({
          id: 'device-id',
          advertising: {},
          name: 'Test device',
          rssi: 42
        });
      }, 1000);
    }

    setTimeout(() => {
      this.stopScan();
    }, 5000);
  }

  async stopScan() {
    console.log('stop scan');
    this.scanning = false;
    this.loadingService.hide();

    await this.platform.ready();
    if (window['ble']) {
      this.ble.stopScan();
    }
  }

  async select(device: PeripheralData) {
    if (this.scanning) {
      console.log('still scanning');
      return;
    }

    if (this.keys.length === 0) {
      this.alertNoKeys();
    } else if (this.keys.length === 1) {
      this.connect(device, this.keys[0].value);
    } else {
      const alert = await this.alertCtrl.create({
        backdropDismiss: false,
        header: this.tr.instant('locks.select-key'),
        inputs: this.keys.map((key, index) => {
          const input: AlertInput = {
            type: 'radio',
            label: key.name,
            value: key.value,
            checked: index === 0
          };
          return input;
        }),
        buttons: [this.tr.instant('common.cancel'), {
          text: this.tr.instant('common.ok'),
          handler: selectedKey => this.connect(device, selectedKey)
        }]
      });

      alert.present();
    }
  }

  async connect(device: PeripheralData, key: string) {
    if (!window['ble']) {
      this.helpers.showError('Bluetooth is not supported in browser. Please run the app on phone');
      return;
    }

    await this.loadingService.show({ message: this.tr.instant('locks.connecting-to', { deviceName: device.name }) });
    console.log('connecting');
    console.log(key);

    let sessionKey: Uint8Array;
    let batteryLevel: number;

    const setActive = (active: boolean) => this.ble.write(
      device.id, EvvaService.serviceUuid, EvvaService.activeUuid, new Uint8Array([active ? 0x01 : 0x00]).buffer as ArrayBuffer
    );

    this.ble.connect(device.id).pipe(
      tap(peripheralData => console.log('connected device', peripheralData)),
      tap(() => this.evva.startNotification(device.id)),
      mergeMap(() => setActive(true)),
      mergeMap(() => this.evva.getBattery(device.id)),
      tap(batteryResponse => batteryLevel = batteryResponse.level),
      mergeMap(() => this.evva.syncStart(device.id)),
      map(syncStartResponse => {
        return {
          syncStartResponse,
          identifier: computeSession(key, syncStartResponse),
        };
      }),
      tap(session => sessionKey = session.identifier.session),
      mergeMap(session => this.evva.syncEnd(device.id, session.syncStartResponse, session.identifier)),
      mergeMap(_ => this.evva.disengage(device.id, DisengageMode.TEMPORARY, sessionKey)),
      mergeMap(() => setActive(false)),
      take(1)
    ).subscribe({
      error: async (error) => {
        this.loadingService.hide();
        this.ble.disconnect(device.id);
        this.helpers.showError(error);
      },
      complete: async () => {
        this.loadingService.hide();
        console.log('complete');
        this.ble.disconnect(device.id);
        this.alertCtrl.create({
          backdropDismiss: false,
          header: this.tr.instant('common.success'),
          message: this.tr.instant('locks.battery-percent', { batteryLevel }),
          buttons: [this.tr.instant('common.ok')]
        }).then(alrt => alrt.present());
      }
    });
  }

  manageKeys() {
    this.ngZone.run(() => {
    this.navCtrl.navigateForward(['tabs/keys']);
    });
  }

  async ionViewWillEnter() {
    this.keys = await this.keysProvider.getKeys();
    console.log('Home ionViewWillEnter; keys =', this.keys);
  }

  async alertNoKeys() {
    this.alertCtrl.create({
      backdropDismiss: false,
      header: this.tr.instant('keys.empty-key-header'),
      message: this.tr.instant('keys.empty-key-text'),
      buttons: [ {
      text: this.tr.instant('common.ok'),
    }]}).then(alrt => alrt.present());
  }
}
