import { Component } from '@angular/core';
import { NavController, PopoverController, AlertController, Events} from '@ionic/angular';
import { Storage } from '@ionic/storage';
import * as URLParse from 'url-parse';
import { MenuPopover } from '../menu';
import { TranslateService } from '@ngx-translate/core';
import { RemoteDeviceService } from '../services/remote-screen/remote-device.service'
/**
 * Home page component
 */
export interface MyDevice {
  key: String;
  ip: String;
}


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})


export class HomePage {

  showEvva: boolean;
  myDevicesList = [] as MyDevice[];

  constructor(
    private navCtrl: NavController, private storage: Storage,
    private popoverCtrl: PopoverController, private tr: TranslateService,
    private alertCtrl: AlertController, public events:Events,
    private remoteDeviceService: RemoteDeviceService
  ) {
    this.remoteDeviceService.getAllDevicesFromStorage(this.myDevicesList);

    // remoteDeviceService.addDeviceToStorage("1DT","192.168.137.233");
    // remoteDeviceService.addDeviceToStorage("2DM","192.168.137.234");
    this.events.subscribe('home:remote_connect', (ip) => {
      console.log( "publish remote:conncet " + ip);
      this.remote(ip)
      //this.events.publish('remote:connect',ip);    
    });
    // this.events.subscribe('device:add', (p_name,p_ip) => {
    //   this.my_devices_list.push({name: p_name, ip: p_ip});
    // });
  }


  async ionViewWillEnter() {


    this.showEvva = await this.storage.get('showEvva');
    const url = sessionStorage.getItem('launchUrl');
    if (url) {
      sessionStorage.removeItem('launchUrl');
      const parsed = new URLParse(url, true);
      console.log(parsed, { name: parsed.query['name'], value: parsed.query['value'] });
      if (parsed.protocol === 'comtbsremote:' && parsed.host === 'addkey' && parsed.query['name'] && parsed.query['value']) {
        this.navCtrl.navigateForward(['keys', { name: parsed.query['name'], value: parsed.query['value'] }]);
      }
    }


  }

  locks() {
    this.navCtrl.navigateForward('locks');
  }

  remote(ip) {
    this.navCtrl.navigateForward(['remote', { ip: ip , subscribe: true}]);
  }

  configure() {
    this.navCtrl.navigateForward('configure');
  }

  async showMenu(event) {
    const menu = await MenuPopover.create(this.popoverCtrl, {
      menuItems: [ {
        icon: 'information-circle-outline',
        text: this.tr.instant('home.about'),
        callback: async () => {
          menu.dismiss();
          const about = await this.alertCtrl.create({
            header: 'TBS Remote',
            message: this.tr.instant('home.version') + ': ' + require('../../../package.json').version,
            buttons: [this.tr.instant('common.ok')]
          });
          await about.present();
        }
      }],
    }, event);
    await menu.present();
  
  }



}
