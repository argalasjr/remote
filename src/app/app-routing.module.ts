import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'tabs', pathMatch: 'full' },
  { path: 'tabs', loadChildren: './tabs/tabs.module#TabsPageModule'},
  { path: 'home', loadChildren: './home/home.module#HomePageModule' },
  { path: 'locks', loadChildren: './locks/locks.module#LocksPageModule' },
  { path: 'keys', loadChildren: './keys/keys.module#KeysPageModule' },
  { path: 'remote', loadChildren: './remote/remote.module#RemotePageModule' },
  { path: 'settings', loadChildren: './settings/settings.module#SettingsPageModule' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
