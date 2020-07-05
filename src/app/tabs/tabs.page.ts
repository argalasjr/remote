import { Component, OnInit, ChangeDetectorRef, NgZone, EventEmitter, Output } from '@angular/core';
import { Platform} from '@ionic/angular';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
})
export class TabsPage implements OnInit {
  @Output() showEvvaEvent: EventEmitter<any> = new EventEmitter();
  showEvva: boolean;
  constructor(
              private cd: ChangeDetectorRef,
              private ngZone: NgZone,
              private platform: Platform,
              private storage: Storage,
              ) {
   }

  async ngOnInit() {
  await  this.platform.ready().then(() => {
    this.ngZone.run(() => {
      this.showEvvaEvent.subscribe((showEvva) => {
        this.showEvva = showEvva;
        this.cd.detectChanges();
      });
    });
  });
  }

  async ionViewWillEnter() {
    this.showEvva = await this.storage.get('showEvva');
  }

}
