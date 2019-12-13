import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FileChooser } from '@ionic-native/file-chooser/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import { File } from '@ionic-native/file/ngx';
import { AlertController, NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { ErrorDialogService } from '../services/error-dialog/error-dialog.service';
import { IKey, KeysService } from '../services/keys/keys.service';

/**
 * Page for managing EVVA keys
 */
@Component({
  selector: 'app-keys',
  templateUrl: './keys.page.html',
  styleUrls: ['./keys.page.scss'],
})
export class KeysPage {

  keys: IKey[] = [];

  constructor(
    public navCtrl: NavController,
    private keysProvider: KeysService,
    private alertCtrl: AlertController,
    private activatedRoute: ActivatedRoute,
    private fileChooser: FileChooser,
    private filePath: FilePath,
    private file: File,
    private tr: TranslateService,
    private helpers: ErrorDialogService
  ) {

  }

  async ionViewDidEnter() {
    const addKeyIfNone = this.activatedRoute.snapshot.paramMap.get('addKeyIfNone') === 'true';
    const newKeyName = this.activatedRoute.snapshot.paramMap.get('name');
    const newKeyValue = this.activatedRoute.snapshot.paramMap.get('value');
    console.log('KeysPage ionViewDidEnter', { addKeyIfNone, newKeyName, newKeyValue });

    this.keys = await this.keysProvider.getKeys();
    if (this.keys.length === 0 && addKeyIfNone) {
      this.addKey();
    } else if (newKeyName && newKeyValue) {
      this.addKey(newKeyName, newKeyValue);
    }
  }

  async import() {
    let name: string;
    let content: string;
    let url: string;

    try {
      url = await this.fileChooser.open();
    } catch (e) {
      console.log(e);
      return;
    }

    try {
      const nativeUrl = await this.filePath.resolveNativePath(url);
      const separatorIndex = nativeUrl.lastIndexOf('/');
      const path = nativeUrl.substring(0, separatorIndex);
      const file = nativeUrl.substring(separatorIndex + 1);
      const suffixIndex = file.lastIndexOf('.');
      const suffix = file.substring(suffixIndex);
      if (suffix !== '.txt') {
        throw new Error('This is probably not a stored key');
      }
      content = await this.file.readAsText(path, file);
      name = suffixIndex > 0 ? file.substring(0, suffixIndex) : file;
    } catch (error) {
      this.helpers.showError(error);
      return;
    }

    this.addKey(name, content);
  }

  async addKey(name = '', value = '') {
    const newKeyAlert = await this.alertCtrl.create({
      header: this.tr.instant('keys.add-new-key'),
      inputs: [{
        value: name,
        name: 'name',
        placeholder: this.tr.instant('keys.key-name')
      }, {
        value: value,
        name: 'value',
        placeholder: this.tr.instant('keys.key-content')
      }],
      buttons: [{
        text: this.tr.instant('common.cancel')
      }, {
        text: this.tr.instant('common.add'),
        handler: (key: IKey) => {
          key.name = key.name.trim();
          key.value = key.value.trim();
          if (!key.name || !key.value) {
            this.alertCtrl.create({
              message: this.tr.instant('keys.enter-key-and-content'),
              buttons: [this.tr.instant('common.ok')]
            }).then(alert => alert.present());
            return false;
          }
          this.keys.push(key);
          this.keysProvider.setKeys(this.keys);
        }
      }]
    });
    newKeyAlert.present();
  }

  deleteKey(key: IKey) {
    this.alertCtrl.create({
      message: this.tr.instant('keys.delete-key-question'),
      buttons: [{
        text: this.tr.instant('common.no')
      }, {
        text: this.tr.instant('common.yes'),
        handler: () => {
          const index = this.keys.indexOf(key);
          if (index >= 0) {
            this.keys.splice(index, 1);
            this.keysProvider.setKeys(this.keys);
          }
        }
      }]
    }).then(alert => alert.present());
  }

}
