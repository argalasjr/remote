import { Component, OnInit,Input } from '@angular/core';
import { NavController, PopoverController, AlertController, Events} from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { RemoteDeviceService } from '../../services/remote-screen/remote-device.service'

@Component({
  selector: 'app-my-device',
  templateUrl: './my-device.component.html',
  styleUrls: ['./my-device.component.scss'],
})
export class MyDeviceComponent implements OnInit {

  @Input() data: any

  constructor(public events:Events,private popoverCtrl: PopoverController, private tr: TranslateService, 
    private navCtrl:NavController, private alertCtrl:AlertController,private remoteDeviceService:RemoteDeviceService) { 
   
  }

  ngOnInit() {  console.log(this.data.key,this.data.ip)}

  remote_connect(data: any) {
    data = this.data
    console.log( "publish home:remote_connect: " + data.ip);
    this.events.publish('home:remote_connect',data.ip);
  }

  async setRemoteIp() {
    const oldIp = await this.remoteDeviceService.getDeviceIpFromStorage(this.data.key)
    this.alertCtrl.create({
      message: this.tr.instant('remote.enter-device-ip'),
      inputs: [
        { name: 'ip', placeholder: this.tr.instant('remote.ip'), value: oldIp, type: 'text' }
      ],
      buttons: [
        this.tr.instant('common.cancel'),
        {
          text: this.tr.instant('common.ok'),
          handler: newData => {
            const newIp: string = newData.ip;
            if (!newIp || !newIp.trim()) {
              return false;
            }
            this.data.ip = newIp.trim()

            this.remoteDeviceService.setDeviceIp(this.data.key,this.data.ip).then(() => {
              
              this.remote_connect(this.data)

            });
          }
        }
      ]
    }).then(alert => alert.present());
  }

}
