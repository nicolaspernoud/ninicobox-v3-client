import { Component, OnInit } from '@angular/core';
import { ProxysService, ClientProxy } from '../../services/proxys.service';
import { environment } from '../../../environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { MatDialog } from '@angular/material';
import { AddProxyDialogComponent } from './add-proxy-dialog/add-proxy-dialog.component';
import { switchMap } from 'rxjs/operators';
import { appAnimations } from '../../animations';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-proxys',
  templateUrl: './proxys.component.html',
  styleUrls: ['./proxys.component.scss'],
  animations: [appAnimations]
})
export class ProxysComponent implements OnInit {

  public proxys: ClientProxy[];

  // tslint:disable-next-line:max-line-length
  constructor(private proxysService: ProxysService, private authService: AuthService, private sanitizer: DomSanitizer, public dialog: MatDialog) { }

  ngOnInit() {
    this.proxysService.getProxys()
      .subscribe(data => {
        this.proxys = data.map(proxy => (
          { ...proxy, completeUrl: this.getIFrameUrl(proxy) }
        ));
      }, err => {
        console.log(err);
      });
  }

  add() {
    const newProxy: ClientProxy = {
      name: '',
      proxyTo: '',
      proxyFrom: '',
      secured: false,
      icon: 'home',
      rank: this.proxys.length,
      iframed: false,
      iframepath: '',
      login: '',
      password: ''
    };
    const dialogRef = this.dialog.open(AddProxyDialogComponent, { data: newProxy });
    dialogRef.afterClosed().subscribe(proxy => {
      if (proxy) {
        proxy.completeUrl = this.getIFrameUrl(proxy);
        this.proxys.push(proxy);
        this.proxys.sort((a, b) => a.rank - b.rank);
        this.save();
      }
    });
  }

  edit(proxy: ClientProxy) {
    const dialogRef = this.dialog.open(AddProxyDialogComponent, { data: proxy });
    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        const editedProxy = this.proxys.find(value => value.name === proxy.name);
        Object.assign(editedProxy, data);
        editedProxy.completeUrl = this.getIFrameUrl(editedProxy);
        this.proxys.sort((a, b) => a.rank - b.rank);
        this.save();
      }
    });
  }

  save() {
    this.proxysService.setProxys(this.proxys).subscribe(data => { }, err => {
      console.log(err);
    });
  }

  delete(proxy: ClientProxy) {
    this.proxys.splice(this.proxys.findIndex(value => value.proxyFrom === proxy.proxyFrom), 1);
    this.save();
  }

  getIFrameUrl(proxy: ClientProxy) {
    // tslint:disable-next-line:max-line-length
    let url = `https://${proxy.proxyFrom}${environment.port ? ':' + environment.port : ''}/${proxy.iframepath}`;
    if (proxy.secured) {
      url += `?token=${this.authService.getToken()}`;
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
