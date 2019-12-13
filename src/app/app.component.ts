import { Component, OnInit } from '@angular/core';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Platform } from '@ionic/angular';
import { TranslateService, TranslateStore } from '@ngx-translate/core';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private storage: Storage,
    private translate: TranslateService
  ) {
    this.initializeApp();
    translate.setDefaultLang('en');

    translate.onLangChange.subscribe(change => console.log('lang change', change));
  }

  async ngOnInit() {
    let language = await this.storage.get('language');
    if (!language) {
      language = navigator.language.split('-')[0];
    }

    this.translate.use(language);
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleLightContent();
      this.splashScreen.hide();
    });
  }
}
