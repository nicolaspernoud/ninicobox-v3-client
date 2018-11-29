import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { UpdateService } from './services/update.service';
import { Router } from '@angular/router';
import { appAnimations } from './animations';
import { Infos } from './interfaces';
import * as packageJson from '../../package.json';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [appAnimations]
})
export class AppComponent implements OnInit {
  title = 'NinicoBox';
  isDarkTheme: boolean;
  infos: Infos = {
    server_version: '...',
    client_version: '...',
    bookmarks: []
  };
  loaded_client_version = (<any>packageJson).version;
  updateAvailable: boolean;
  cumulativeVersion: string;

  constructor(private authService: AuthService, private update: UpdateService, private router: Router) {
    authService.autoLogin();
    document.addEventListener('visibilitychange', () => {
      // On focus, check if user is still logged in
      if (!document.hidden) {
        authService.autoLogout();
        // Check for updates on focus
        update.checkForUpdate(); // Check for updates on focus
        // On standalone mode, switch to explorer on leaving the app, in case some apps use the battery too much
      } else if (window.matchMedia('(display-mode: standalone)').matches) {
        router.navigate(['/explorer']);
      }
    }
    );
  }

  ngOnInit() {
    this.authService.getInfos().subscribe(data => {
      this.infos = data;
      this.updateAvailable = this.loaded_client_version != this.infos.client_version;
      const server_ver = this.infos.server_version.split(".").map(value => Number(value));
      const loaded_client_ver = this.loaded_client_version.split(".").map(value => Number(value));
      this.cumulativeVersion = `${String(server_ver[0])}.${String(server_ver[1] + loaded_client_ver[1])}.${String(server_ver[2] + loaded_client_ver[2])}`
    });
    this.update.UpdateAvailable.subscribe(value => this.updateAvailable = value);
  }

  logout() {
    this.authService.logout();
  }

  forceUpdate() {
    this.update.forceUpdate();
  }
}
