
import { catchError } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { App } from '../interfaces';
import { handleHTTPError } from '../utility_functions';
import { FilesService, WantedToken } from './files.service';

@Injectable()
export class AppsService {

  constructor(private http: HttpClient, private fileService: FilesService, private sanitizer: DomSanitizer) { }

  getApps(): Observable<App[]> {
    return this.http
      .get<App[]>(`${environment.apiEndPoint}/common/apps`).pipe(
        catchError(handleHTTPError));
  }

  setApps(apps: ClientApp[]): Observable<ClientApp[]> {
    const sendApps: ClientApp[] = [];
    apps.forEach(app => {
      const sendApp: ClientApp = { ...app };
      delete sendApp.completeUrl;
      sendApps.push(sendApp);
    }
    );
    return this.http
      .post<ClientApp[]>(`${environment.apiEndPoint}/admin/apps`, sendApps).pipe(
        catchError(handleHTTPError));
  }

  setIFrameUrl(app: ClientApp) {
    let url = `https://${app.host}${environment.port ? ':' + environment.port : ''}/${app.iframepath}`;
    if (app.secured) {
      const wantedToken: WantedToken = {
        sharedfor: app.name,
        url: app.host,
        lifespan: 1
      }
      this.fileService.getShareToken(wantedToken).subscribe(data => {
        url += `?token=${data}`;
        app.completeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      })
    } else {
      app.completeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
  }

}

export interface ClientApp extends App {
  completeUrl?: SafeResourceUrl;
}
