import { Injectable } from '@angular/core';
import { BLE } from '@ionic-native/ble/ngx';
import { Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { throwError, timer } from 'rxjs';
import { catchError, map, mergeMap, take, tap } from 'rxjs/operators';
import { BluetoothNetworkClientService } from '../bluetooth-network-client/bluetooth-network-client.service';

interface PeripheralData {
  name: string;
  id: string;
  rssi: number;
  advertising: ArrayBuffer|any;
}

/**
 * Scans TBS devices over Bluetooth
 */
@Injectable({
  providedIn: 'root'
})
export class DeviceScannerService {

  constructor(
    private platform: Platform, private bleService: BluetoothNetworkClientService,
    private ble: BLE, private translate: TranslateService
  ) { }

  async getTbsDevices(): Promise<PeripheralData[]> {
    await this.platform.ready();
    // for testing purposes in browser
    if (!window['ble']) {
      await timer(500).toPromise();
      return [{ id: 'aa:11:bb:22:cc:33', name: 'TestDevice', advertising: null, rssi: 0 }];
    }

    const result: PeripheralData[] = [];

    console.log('starting scan');
    this.ble.startScan([this.bleService.networkServiceUuid]).subscribe(peripheral => {
      console.log('adding', peripheral);
      result.push(peripheral);
    });

    await timer(10000).toPromise();

    console.log('stopping scan');
    this.ble.stopScan();

    return result;
  }

  async getDeviceIp(id: string): Promise<string> {
    await this.platform.ready();
    // for testing purposes in browser
    if (!window['ble']) {
      await timer(500).toPromise();
      return '192.168.99.121';
    }

    return this.bleService.connect(id).pipe(
      mergeMap(connectedPeripheral => this.bleService.readAndObserve(
        connectedPeripheral.id,
        this.bleService.networkServiceUuid,
        this.bleService.ipCharacteristicsUuid
      )),
      take(1),
      map(buffer => {
        const array = new Uint8Array(buffer);
        // wrong byte array length or all zeros -> throw error
        if (array.length !== 4 || array.filter(i => i === 0).length === 4) {
          throw new Error(this.translate.instant('remote.device-has-no-ip'));
        }
        return array.join('.');
      }),
      catchError(error => {
        this.bleService.disconnect(id);
        return throwError(error);
      }),
      tap(() => this.bleService.disconnect(id))
    ).toPromise();
  }
}
