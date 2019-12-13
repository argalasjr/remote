import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

export interface IKey {
  name: string;
  value: string;
}

/**
 * Service for managing saved EVVA keys in Ionic Storage
 */
@Injectable({
  providedIn: 'root'
})
export class KeysService {

  constructor(private storage: Storage) { }

  private static storageKey = 'evvaKeys';

  async getKeys(): Promise<IKey[]> {
    let value: any;
    try {
      value = await this.storage.get(KeysService.storageKey);
    } catch (exception) {
      console.warn(exception);
      return [];
    }
    if (!value) {
      return [];
    }
    if (Array.isArray(value)) {
      return value;
    }
    return [];
  }

  async setKeys(keys: IKey[]): Promise<void> {
    await this.storage.set(KeysService.storageKey, keys);
  }
}
