import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

/**
 * Service store last IP address of device with remote screen
 */
@Injectable({
    providedIn: 'root'
})
export class RemoteDeviceService {

    private static storageKey = '';
    private static storageIp = '';

    constructor(private storage: Storage) { }

    async setIp(newIp: string) {
        await this.storage.set(RemoteDeviceService.storageKey, newIp);
    }

    async getIp(): Promise<string> {
        return await this.storage.get(RemoteDeviceService.storageKey);
    }

    async addDeviceToStorage(newKey: string,newIp: String) {
        await this.storage.set(newKey, newIp);
    }

    async getDeviceIpFromStorage(key: string) {
        return await this.storage.get(key);
    }

    async setDeviceIp(key:string ,newIp: string) {
        await this.storage.set(key, newIp);
    }


    async getAllDevicesFromStorage(deviceList){
       
        return await new Promise(resolve=>{
        this.storage.forEach((v,k)=>{     
            if (typeof v === "string") {
            var items = v.split('.');
            //value is ipv4 format
            if(items.length == 4 ){
                deviceList.push({key: k, ip: v});
            }
        }

        }).then(()=>{
        resolve(deviceList);
        })
        })
        }

    
}
