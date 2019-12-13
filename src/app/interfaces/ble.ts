export interface PeripheralCharacteristic {
    service: string;
    characteristic: string;
    properties: string[];
    descriptors?: any[];
}

export interface PeripheralData {
    name: string;
    id: string;
    rssi: number;
    advertising: ArrayBuffer | any;
}

export interface PeripheralDataExtended extends PeripheralData {
    services: string[];
    characteristics: PeripheralCharacteristic[];
}
