import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
if (environment.production) {
    enableProdMode();
}
platformBrowserDynamic().bootstrapModule(AppModule)
    .catch(function (err) { return console.log(err); });
window.handleOpenURL = function (url) {
    console.log('App launched with url:', url);
    sessionStorage.setItem('launchUrl', url);
};
//# sourceMappingURL=main.js.map