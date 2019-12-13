import { Injectable } from '@angular/core';
import { BLE } from '@ionic-native/ble/ngx';
import { from, Observable, Subject, throwError } from 'rxjs';
import { catchError, concatMap, take, timeout } from 'rxjs/operators';
import { bufferToString } from './buffer';
import {
  batteryRequest, BatteryResponse, disengageRequest, DisengageResponse, SessionIdentifier, syncEndRequest,
  SyncEndResponse, syncStartRequest, SyncStartResponse, versionRequest, VersionResponse
} from './messages';
import { bufferToMessage, decodeBuffer, encodeBuffer, messageToBuffer, tokenize } from './serialization';
import { DisengageMode, NWPMessage } from './types';

/**
 * Service for communicating with EVVA lock over Bluetooth
 */
@Injectable({
  providedIn: 'root'
})
export class EvvaService {

  static serviceUuid = '6E400001-B5A3-F393-E0A9-E50E24DCCA9E'.toLowerCase();
  static activeUuid = '6E400008-B5A3-F393-E0A9-E50E24DCCA9E'.toLowerCase();
  static txUuid = '6E400002-B5A3-F393-E0A9-E50E24DCCA9E'.toLowerCase();
  static rxUuid = '6E400003-B5A3-F393-E0A9-E50E24DCCA9E'.toLowerCase();

  private rx: Subject<NWPMessage> = new Subject();
  private _debug = localStorage.getItem('EvvaServiceLogs') === 'true';

  constructor(private ble: BLE) { }

  write(deviceId: string, message: NWPMessage, sessionKey: Uint8Array): Observable<void> {
    const buffer = encodeBuffer(messageToBuffer(message, sessionKey));
    this.debug(() => ([new Date().toJSON(), 'buffer to be send', bufferToString(buffer)]));
    const sendData = tokenize(buffer);

    return from(sendData).pipe(
      concatMap(packet => this.__write(deviceId, packet.buffer as ArrayBuffer))
    );
  }

  private __write(deviceId: string, data: ArrayBuffer): Observable<void> {
    return from(this.ble.write(deviceId, EvvaService.serviceUuid, EvvaService.txUuid, data)).pipe(
      catchError(() => throwError(`writing ${data} to ${deviceId} error`))
    );
  }

  private debug(what: () => any[]) {
    if (this._debug) {
      console.log(...what());
    }
  }

  startNotification(deviceId: string): void {
    this.debug(() => ([new Date().toJSON(), 'starting notifications from', deviceId]));
    let buffer: number[] = [];
    this.ble.startNotification(deviceId, EvvaService.serviceUuid, EvvaService.rxUuid).subscribe(data => {
      const arrayData = new Uint8Array(data);
      this.debug(() => ([new Date().toJSON(), 'received', bufferToString(arrayData), 'from', deviceId]));
      buffer = buffer.concat(Array.from(arrayData));
      if (buffer.length >= 2) {
        if (buffer[buffer.length - 1] === 0xAD) {
          try {
            const decoded = decodeBuffer(buffer);
            const message = bufferToMessage(decoded);
            buffer = [];
            this.rx.next(message);
          } catch (error) {
            this.debug(() => ([new Date().toJSON(), 'error when decoding', buffer]));
            this.rx.error('Decode error');
          }
        }
      }
    }, () => {
      this.debug(() => ([new Date().toJSON(), 'error when receiving from', deviceId]));
      this.rx.error('ble.startNotification() error');
    });
  }

  stopNotification(deviceId: string): Observable<void> {
    return from(this.ble.stopNotification(deviceId, EvvaService.serviceUuid, EvvaService.rxUuid)).pipe(
      catchError(() => throwError(`error when stopping notifications from ${deviceId}`))
    );
  }

  private rpc<TResponse>(
    deviceId: string,
    createRequest: () => NWPMessage,
    parseResponse: (response: NWPMessage) => TResponse,
    sessionKey: Uint8Array
  ): Observable<TResponse> {
    return new Observable<TResponse>(observer => {
      const request = createRequest();
      this.debug(() => ([new Date().toJSON(), 'write request', request]));

      this.rx.pipe(take(1), timeout(10000)).subscribe(message => {
        try {
          this.debug(() => ([new Date().toJSON(), 'received response', message]));
          const response = parseResponse(message);
          this.debug(() => ([new Date().toJSON(), 'parsed response', response]));
          observer.next(response);
        } catch (error) {
          this.debug(() => ([new Date().toJSON(), 'wrong message format', { message, error }]));
          observer.error(error);
        }
      }, error => {
        this.debug(() => ([new Date().toJSON(), 'read error', error]));
        observer.error(error);
      }, () => {
        this.debug(() => ([new Date().toJSON(), 'read complete for request', request]));
        observer.complete();
      });

      this.write(deviceId, request, sessionKey).subscribe(
        next => {
          this.debug(() => ([new Date().toJSON(), 'Write of chunk finished', next]));
        },
        error => {
          this.debug(() => ([new Date().toJSON(), 'Write error', error]));
          observer.error(error);
        }, () => {
          this.debug(() => ([new Date().toJSON(), 'Write complete']));
        }
      );
    });
  }

  getVersion(deviceId: string) {
    this.debug(() => ([new Date().toJSON(), '=== Get Version ===']));
    return this.rpc(deviceId, () => versionRequest(), response => VersionResponse.parse(response), null);
  }

  getBattery(deviceId: string) {
    this.debug(() => ([new Date().toJSON(), '=== Get Battery ===']));
    return this.rpc(deviceId, () => batteryRequest(), response => BatteryResponse.parse(response), null);
  }

  syncStart(deviceId: string) {
    this.debug(() => ([new Date().toJSON(), '=== Sync start ===']));
    return this.rpc(deviceId, () => syncStartRequest(), response => SyncStartResponse.parse(response), null);
  }

  syncEnd(deviceId: string, syncStartResponse: SyncStartResponse, session: SessionIdentifier) {
    this.debug(() => ([new Date().toJSON(), '=== Sync end ===']));
    return this.rpc(deviceId, () => syncEndRequest(syncStartResponse, session), response => SyncEndResponse.parse(response), null);
  }

  disengage(deviceId: string, mode: DisengageMode, sessionKey: Uint8Array) {
    this.debug(() => ([new Date().toJSON(), '=== Disengage ===']));
    return this.rpc(deviceId, () => disengageRequest(mode), response => DisengageResponse.parse(response), sessionKey);
  }
}
