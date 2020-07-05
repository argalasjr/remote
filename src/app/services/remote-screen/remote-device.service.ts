import { Injectable, NgZone, EventEmitter, Output } from '@angular/core';
import { Storage } from '@ionic/storage';
import { MyDevice} from 'src/app/home/my-device/my-device.component';
/**
 * Service store last IP address of device with remote screen
 */
@Injectable({
    providedIn: 'root'
})
export class RemoteDeviceService  {
    @Output() updateDeviceListEvent: EventEmitter<any> = new EventEmitter();
    constructor(
        private storage: Storage,
        private ngZone: NgZone
        ) {
     }

    async updateDeviceList() {
        this.ngZone.run(() => {
        this.updateDeviceListEvent.emit();
        });
    }
    async addDeviceToStorage(id: string, device: MyDevice)  {
       return  await this.storage.set(id, device);
    }

    async clearStorage() {
        await this.storage.clear();
    }

    async getDeviceFromStorage(id: string) {
        const result: MyDevice = await this.storage.get(id);
        return result;
    }

    async setDeviceIp(id: string , ip: string) {
        const result: MyDevice = await this.storage.get(id);
        result.ip = ip;
        await this.storage.set(id, result);
    }

    async setDeviceClientName(id: string , clientName: string) {
        const result: MyDevice = await this.storage.get(id);
        // this.storage.remove(id);
        result.clientName = clientName;
        await this.storage.set(id, result);
    }

    async removeDeviceFromStorage(key: string) {
        return await this.storage.remove(key);
    }

    async getAllDevicesFromStorage(deviceList: any): Promise<any> {
        deviceList.splice(0, deviceList.length);

        return await new Promise(resolve => {
        this.storage.forEach((v, k) => {
            if ( v == null) {
                console.log('removed ' + k );
                this.storage.remove(k);
            }
            if (typeof v === 'object') {
                console.log(k, v);
                const items = v.ip.split('.');
                // value is ipv4 format
                if (items.length === 4 ) {
                    deviceList.push(v);
                }
            }
        }).then(async () => {
        resolve(deviceList);
        });
        });
    }

}
