import { Component, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';

export interface MenuItem {
    icon: string;
    text: string;
    callback: () => void;
}

export interface MenuData {
    menuItems: MenuItem[];
}

@Component({
    template: `
    <ion-list lines="none">
        <ion-item button *ngFor="let item of menuItems" ion-item (click)="click(item.callback)">
            <ion-icon [name]="item.icon" slot="start"></ion-icon>
            {{item.text}}
        </ion-item>
    </ion-list>
    `
})
export class MenuPopover {

    @Input() menuItems: MenuItem[];

    static create(popoverCtrl: PopoverController, data: MenuData, event: Event) {
        return popoverCtrl.create({component: MenuPopover, componentProps: data, event});
    }

    click(callback: () => void) {
        callback();
        // this.viewCtrl.dismiss();
    }
}
