import { Component, OnInit } from '@angular/core';
import { AppsService, ClientApp } from '../../services/apps.service';
import { environment } from '../../../environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { MatDialog } from '@angular/material';
import { AddAppDialogComponent } from './add-app-dialog/add-app-dialog.component';
import { appAnimations } from '../../animations';
import { AuthService } from '../../services/auth.service';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-apps',
  templateUrl: './apps.component.html',
  styleUrls: ['./apps.component.scss'],
  animations: [appAnimations]
})
export class AppsComponent implements OnInit {

  public apps: ClientApp[];
  public loading = true;

  // tslint:disable-next-line:max-line-length
  constructor(private appsService: AppsService, private authService: AuthService, private usersService: UsersService, private sanitizer: DomSanitizer, public dialog: MatDialog) { }

  ngOnInit() {
    this.appsService.getApps()
      .subscribe(data => {
        this.apps = data.map(app => (
          { ...app, completeUrl: this.getIFrameUrl(app) }
        ));
        this.loading = false;
      }, err => {
        console.log(err);
      });
  }

  add() {
    const newApp: ClientApp = {
      name: '',
      host: '',
      isProxy: false,
      forwardTo: '',
      serve: '',
      secured: false,
      icon: 'home',
      rank: this.apps.length + 1,
      iframed: false,
      iframepath: '',
      login: '',
      password: '',
      roles: []
    };
    // get existing roles from user service
    this.usersService.getRoles().subscribe(roles => {
      const dialogRef = this.dialog.open(AddAppDialogComponent, { data: { App: newApp, RolesList: roles } });
      dialogRef.afterClosed().subscribe(app => {
        if (app) {
          app.completeUrl = this.getIFrameUrl(app);
          this.apps.push(app);
          this.apps.sort((a, b) => a.rank - b.rank);
          this.save();
        }
      });
    });
  }

  edit(app: ClientApp) {
    this.usersService.getRoles().subscribe(roles => {
      const dialogRef = this.dialog.open(AddAppDialogComponent, { data: { App: app, RolesList: roles } });
      dialogRef.afterClosed().subscribe(data => {
        if (data) {
          const editedApp = this.apps.find(value => value.name === app.name);
          Object.assign(editedApp, data);
          editedApp.completeUrl = this.getIFrameUrl(editedApp);
          this.apps.sort((a, b) => a.rank - b.rank);
          this.save();
        }
      });
    });
  }

  save() {
    this.appsService.setApps(this.apps).subscribe(() => { }, err => {
      console.log(err);
    });
  }

  delete(app: ClientApp) {
    this.apps.splice(this.apps.findIndex(value => value.host === app.host), 1);
    this.save();
  }

  getIFrameUrl(app: ClientApp) {
    // tslint:disable-next-line:max-line-length
    let url = `https://${app.host}${environment.port ? ':' + environment.port : ''}/${app.iframepath}`;
    if (app.secured) {
      url += `?token=${this.authService.getToken()}`;
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
