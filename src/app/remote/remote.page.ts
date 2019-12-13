import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeUrl, EventManager } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { NavController, AlertController, PopoverController } from '@ionic/angular';
import { AlertInput, TextFieldTypes } from '@ionic/core';
import { TranslateService } from '@ngx-translate/core';
import { interval, Subject, Subscription, fromEvent, Observable } from 'rxjs';
import { exhaustMap, sample, filter, map, startWith, mapTo } from 'rxjs/operators';
import { ErrorDialogService } from '../services/error-dialog/error-dialog.service';
import { MenuPopover } from '../menu';
import { DeviceScannerService } from '../services/device-scanner/device-scanner.service';
import { LoadingService } from '../services/loading/loading.service';
import { RemoteDeviceService } from '../services/remote-screen/remote-device.service';
import { ScreenService } from '../services/remote-screen/screen.service';

interface Coord {
  x: number;
  y: number;
}

/**
 * Page for remote screen control
 */
@Component({
  selector: 'app-remote',
  templateUrl: './remote.page.html',
  styleUrls: ['./remote.page.scss'],
})
export class RemotePage implements OnInit {

  private move = new Subject<Coord>();
  private lastCoord: Coord = null;
  private subscription: Subscription;
  private moveSubscription: Subscription;
  private deviceIp: string = null;

  idle = false;
  connecting = false;
  connectionError = false;
  imageSrc: string | SafeUrl = 'assets/imgs/connecting.png';
  input: HTMLIonAlertElement = null;
  landscape$: Observable<boolean>;
  @ViewChild('image') image: ElementRef<HTMLImageElement>;

  constructor(
    private screen: ScreenService, private remoteDevice: RemoteDeviceService, private sanitization: DomSanitizer,
    private alertCtrl: AlertController, private popoverCtrl: PopoverController, private loadingService: LoadingService,
    private deviceScanner: DeviceScannerService, private activatedRoute: ActivatedRoute, private tr: TranslateService,
    private helpers: ErrorDialogService, private navCtrl : NavController
  ) { }

  async ngOnInit() {
    console.log('RemotePage::ngOnInit');

    this.setState({ idle: true, connecting: false, connectionError: false });

    this.deviceIp = this.activatedRoute.snapshot.paramMap.get('ip');
    const subscribe = this.activatedRoute.snapshot.paramMap.get('subscribe') === 'true';
    console.log('remote device ip', this.deviceIp, { subscribe });

    if (subscribe && this.deviceIp) {
      this.subscribe();
    }

    this.landscape$ = fromEvent(window, 'resize').pipe(
      startWith(true),
      mapTo(window),
      map(win => win.innerWidth > win.innerHeight)
    );
  }

  private setState(state: { idle: boolean; connecting: boolean; connectionError: boolean }) {
    this.idle = state.idle;
    this.connecting = state.connecting;
    this.connectionError = state.connectionError;
  }

  ionViewDidLeave() {
    console.log('ionViewDidLeave RemotePage');
    this.unsubscribe();
  }

  subscribe() {
    this.unsubscribe();
    this.setState({ idle: false, connecting: true, connectionError: false });
    this.subscription = interval(250).pipe(
      exhaustMap(i => this.screen.GetFrame(this.deviceIp, i === 0 ? 1 : 0))
    ).subscribe(async (data) => {
      this.setState({ idle: false, connecting: false, connectionError: false });

      if (data.keyboard && !this.input) {
        console.log(data.keyboard);
        this.input = await this.alertCtrl.create({
          buttons: [{
            text: this.tr.instant('common.ok'),
            handler: (inputData) => {
              console.log('ok clicked', inputData.input);
              this.screen.SetInput(this.deviceIp, {
                mouse: null,
                keyboard: {
                  currentValue: inputData.input, inputName: data.keyboard.inputName, type: data.keyboard.type
                }
              });
              return false;
            }
          }, {
            text: this.tr.instant('common.cancel'),
            handler: () => {
              console.log('cancel clicked');
              this.screen.SetInput(this.deviceIp, {
                mouse: null,
                keyboard: {
                  currentValue: data.keyboard.currentValue, inputName: data.keyboard.inputName, type: data.keyboard.type
                }
              });
              return false;
            }
          }],
          inputs: [{
            name: 'input',
            placeholder: data.keyboard.inputName,
            value: data.keyboard.currentValue,
            type: data.keyboard.type as TextFieldTypes
          }],
          message: this.tr.instant('remote.please-enter', { inputName: data.keyboard.inputName }),
          backdropDismiss: false
        });
        this.input.present();
        return;

      } else if (!data.keyboard && this.input) {
        this.input.dismiss();
        this.input = null;
      }

      if (data.image) {
        this.imageSrc = this.sanitization.bypassSecurityTrustResourceUrl('data:image/jpeg;charset=utf-8;base64,' + data.image);
      }
    }, error => {
      this.setState({ idle: false, connecting: false, connectionError: true });
      this.helpers.showError(error);
    });

    this.moveSubscription = this.move.pipe(sample(interval(200))).subscribe(c => {
      console.log({ type: 'positionChanged', x: c.x, y: c.y });
      this.screen.SetInput(this.deviceIp, {
        mouse: { type: 'positionChanged', x: c.x, y: c.y },
        keyboard: null
      });
    });
  }

  unsubscribe() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.NavigateToRootPage()      
    }

    if (this.moveSubscription) {
      this.moveSubscription.unsubscribe();
    }

    this.setState({ idle: true, connecting: false, connectionError: false });
  }

  private coords($event: TouchEvent): Coord {
    const touch = $event.touches[0];
    if (!touch) {
      return;
    }

    const target = touch.target as HTMLImageElement;
    const rect = target.getBoundingClientRect();

    console.log('touch.clientX/Y', touch.clientX, touch.clientY);
    console.log('bounding rect', rect);

    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    return {
      x: Math.round(x * target.naturalWidth / target.width),
      y: Math.round(y * target.naturalHeight / target.height)
    };    
  }

  async setRemoteIp() {
    const oldIp = await this.remoteDevice.getIp();
    this.alertCtrl.create({
      message: this.tr.instant('remote.enter-device-ip'),
      inputs: [
        { name: 'ip', placeholder: this.tr.instant('remote.ip'), value: oldIp, type: 'text' }
      ],
      buttons: [
        this.tr.instant('common.cancel'),
        {
          text: this.tr.instant('common.ok'),
          handler: data => {
            const newIp: string = data.ip;
            if (!newIp || !newIp.trim()) {
              return false;
            }

            this.remoteDevice.setIp(newIp.trim()).then(() => {
              this.deviceIp = newIp;
              this.subscribe();
            });
          }
        }
      ]
    }).then(alert => alert.present());
  }

  async showMenu(event: Event) {
    const menu = await MenuPopover.create(this.popoverCtrl, {
      menuItems: [{
        icon: 'settings',
        text: this.tr.instant('remote.set-ip'),
        callback: () => { menu.dismiss(); this.setRemoteIp(); }
      }, {
        icon: 'search',
        text: this.tr.instant('remote.search-for-devices'),
        callback: () => { menu.dismiss(); this.scan(); }
      }]
    }, event);
    menu.present();
  }


  touchStart($event: TouchEvent) {
    const c = this.coords($event);
    console.log('touchStart', c);
    this.lastCoord = c;

    this.screen.SetInput(this.deviceIp, {
      mouse: { type: 'pressed', x: c.x, y: c.y },
      keyboard: null
    });
  }

  touchEnd($event: TouchEvent) {
    const c = this.coords($event) || this.lastCoord;
    console.log('touchEnd', c);

    if (c) {
      this.screen.SetInput(this.deviceIp, {
        mouse: { type: 'released', x: c.x, y: c.y },
        keyboard: null
      });
    }
  }

  touchMove($event: TouchEvent) {
    const c = this.coords($event);
    this.move.next(c);
  }

   NavigateToRootPage() {
    this.navCtrl.navigateRoot("tabs")
  }

  async getDeviceIpAndConnect(deviceId: string) {
    await this.loadingService.show({ message: this.tr.instant('remote.obtaining-device-info') });

    let ip = null;
    try {
      ip = await this.deviceScanner.getDeviceIp(deviceId);
      this.loadingService.hide();
    } catch (error) {
      this.loadingService.hide();
      this.helpers.showError(error);
      return;
    }

    if (ip) {
      await this.remoteDevice.setIp(ip);
      this.subscribe();
    }
  }

  async scan() {
    await this.loadingService.show({ message: this.tr.instant('remote.searching-for-devices') });

    const devices = await this.deviceScanner.getTbsDevices();
    console.log(devices);

    this.loadingService.hide();

    if (devices.length === 0) {
      const alert = await this.alertCtrl.create({ message: 'No device found', buttons: [this.tr.instant('common.ok')] });
      await alert.present();
      return;
    }

    const selection = await this.alertCtrl.create({
      header: this.tr.instant('remote.detected-devices'),
      message: this.tr.instant('remote.select-device'),
      buttons: [this.tr.instant('common.cancel'), {
        text: this.tr.instant('common.ok'),
        handler: deviceId => {
          console.log('selected', deviceId);
          this.getDeviceIpAndConnect(deviceId);
        }
      }],
      inputs: devices.map((device, index) => {
        const input: AlertInput = {
          type: 'radio',
          label: device.name || device.id,
          value: device.id,
          checked: index === 0
        };
        return input;
      })
    });
    selection.present();
  }
}
