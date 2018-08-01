
import {catchError} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { SafeResourceUrl } from '@angular/platform-browser/src/security/dom_sanitization_service';
import { Proxy } from '../interfaces';
import { handleHTTPError } from '../utility_functions';

@Injectable()
export class ProxysService {

  private endpoint = `${environment.apiEndPoint}/admin/proxys`;

  constructor(private http: HttpClient) { }

  getProxys(): Observable<Proxy[]> {
    return this.http
      .get<Proxy[]>(this.endpoint).pipe(
      catchError(handleHTTPError));
  }

  setProxys(proxys: ClientProxy[]): Observable<ClientProxy[]> {
    const sendProxys: ClientProxy[] = [];
    proxys.forEach(proxy => {
      const sendProxy: ClientProxy = { ...proxy };
      delete sendProxy.completeUrl;
      sendProxys.push(sendProxy);
    }
    );
    return this.http
      .post<ClientProxy[]>(this.endpoint, sendProxys).pipe(
      catchError(handleHTTPError));
  }

}

export interface ClientProxy extends Proxy {
  completeUrl?: SafeResourceUrl;
}
