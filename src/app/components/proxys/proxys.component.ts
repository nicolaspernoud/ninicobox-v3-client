import { Component, OnInit } from '@angular/core';
import { ProxysService, ClientProxy } from '../../services/proxys.service';
import { environment } from '../../../environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { MatDialog } from '@angular/material';
import { AddProxyDialogComponent } from './add-proxy-dialog/add-proxy-dialog.component';
import { switchMap } from 'rxjs/operators';
import { appAnimations } from '../../animations';

@Component({
  selector: 'app-proxys',
  templateUrl: './proxys.component.html',
  styleUrls: ['./proxys.component.scss'],
  animations: [appAnimations]
})
export class ProxysComponent implements OnInit {

  public proxys: ClientProxy[];
  private proxyBase = `${environment.apiEndPoint}/secured/proxy`;
  private proxytoken: string;

  constructor(private proxysService: ProxysService, private sanitizer: DomSanitizer, public dialog: MatDialog) { }

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

  refresh(proxy) {
    const iframe = document.getElementById(proxy.name) as HTMLIFrameElement;
    if (iframe) { iframe.contentWindow.location.reload(true); }
  }

  add() {
    const newProxy: ClientProxy = {
      name: '',
      toUrl: '',
      fromUrl: '',
      icon: 'home',
      rank: this.proxys.length
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
      }
    });
  }

  save() {
    this.proxysService.setProxys(this.proxys).subscribe(data => { }, err => {
      console.log(err);
    });
  }

  delete(proxy: ClientProxy) {
    this.proxys.splice(this.proxys.findIndex(value => value.fromUrl === proxy.fromUrl), 1);
  }

  getIFrameUrl(proxy: ClientProxy) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(`http://${proxy.fromUrl}`);
  }
}
