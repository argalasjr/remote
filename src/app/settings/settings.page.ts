import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';

/**
 * Page for application settings (language and other options)
 */
@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  language: string;
  showEvva: boolean;

  constructor(private storage: Storage, private translate: TranslateService) {
    console.log('SettingsPage');
  }

  async ngOnInit() {
    this.showEvva = await this.storage.get('showEvva');
    this.language = await this.storage.get('language');
    console.log('OnInit', this.language);

    console.log(this.translate.getLangs());
  }

  async languageChanged(event: CustomEvent<{ value: string }>) {
    let language = event.detail.value;
    console.log(language);
    this.storage.set('language', language);

    if (!language) {
      language = navigator.language.split('-')[0];
    }

    this.translate.use(language).subscribe();
  }

  evvaCheckedChange(event: CustomEvent<{ checked: true, value: string }>) {
    this.storage.set('showEvva', event.detail.checked);
  }
}
