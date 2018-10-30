
import {catchError} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { SafeResourceUrl } from '@angular/platform-browser/src/security/dom_sanitization_service';
import { App } from '../interfaces';
import { handleHTTPError } from '../utility_functions';

@Injectable()
export class AppsService {

  private endpoint = `${environment.apiEndPoint}/admin/apps`;

  constructor(private http: HttpClient) { }

  getApps(): Observable<App[]> {
    return this.http
      .get<App[]>(this.endpoint).pipe(
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
      .post<ClientApp[]>(this.endpoint, sendApps).pipe(
      catchError(handleHTTPError));
  }

}

export interface ClientApp extends App {
  completeUrl?: SafeResourceUrl;
}
