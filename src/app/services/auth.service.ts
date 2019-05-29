import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import * as jwt_decode from 'jwt-decode';
import { Observable, BehaviorSubject, timer } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Infos } from '../interfaces';
import { environment } from '../../environments/environment';
import { switchMap, catchError } from 'rxjs/operators';
import { handleHTTPError } from '../utility_functions';

export const NOT_LOGGED = 'not_logged';

class TokenInfos {

  expirationDate: Date;
  role: string;
  XSRFtoken: string;

  constructor() {
    // tslint:disable-next-line: max-line-length
    const expDate = localStorage.getItem('token_expiration_date') !== null ? new Date(localStorage.getItem('token_expiration_date')) : undefined;
    const role = localStorage.getItem('token_role') !== null ? localStorage.getItem('token_role') : 'no_role';
    const xsrf = localStorage.getItem('token_xsrf') !== null ? localStorage.getItem('token_xsrf') : '';
    this.expirationDate = expDate;
    this.role = role;
    this.XSRFtoken = xsrf;
  }

  fromJWT(jwt: string) {
    const decoded = jwt_decode(jwt);
    this.role = decoded.role;
    this.XSRFtoken = decoded.csrftoken;
    if (decoded.exp === undefined) {
      this.expirationDate = undefined;
    } else {
      this.expirationDate = new Date(0);
      this.expirationDate.setUTCSeconds(decoded.exp);
    }
    this.save();
  }

  save() {
    localStorage.setItem('token_expiration_date', this.expirationDate.toUTCString());
    localStorage.setItem('token_role', this.role);
    localStorage.setItem('token_xsrf', this.XSRFtoken);
  }

  reset() {
    localStorage.removeItem('token_expiration_date');
    localStorage.removeItem('token_role');
    localStorage.removeItem('token_xsrf');
    this.expirationDate = undefined;
    this.role = 'no_role';
    this.XSRFtoken = '';
  }

  isExpired(): boolean {
    if (this.expirationDate === undefined ) {return true; }
    return this.expirationDate.valueOf() < new Date().valueOf();
  }

  getRemainingMs(): number {
    if (this.expirationDate === undefined ) {return 0; }
    return this.expirationDate.valueOf() - new Date().valueOf();
  }

}

@Injectable()
export class AuthService {

  private loginInProgressOrLoggedSource = new BehaviorSubject<boolean>(false);
  loginInProgressOrLogged = this.loginInProgressOrLoggedSource.asObservable();

  private userRoleSubject = new BehaviorSubject<string>(NOT_LOGGED);
  public userRole = this.userRoleSubject.asObservable();

  private apiEndPoint = `${environment.apiEndPoint}`;

  tokenInfos = new TokenInfos();

  constructor(private http: HttpClient, private router: Router, private snackBar: MatSnackBar) {

  }

  logout() {
    this.loginInProgressOrLoggedSource.next(false);
    this.tokenInfos.reset();
    this.userRoleSubject.next(NOT_LOGGED);
    this.router.navigate(['/login']);
  }

  autoLogin() {
    if (!this.tokenInfos.isExpired()) {
      this.userRoleSubject.next(this.tokenInfos.role);
      this.startSessionTimeout();
    }
  }

  autoLogout() {
    if (this.tokenInfos.isExpired()) {
      this.logout();
    }
  }

  login(user) {
    this.loginInProgressOrLoggedSource.next(true);
    return this.http.post(`${this.apiEndPoint}/login`, user, { responseType: 'text' }).subscribe(
      data => {
        this.tokenInfos.fromJWT(data);
        this.userRoleSubject.next(this.tokenInfos.role);
        this.snackBar.open('Login success', 'OK', { duration: 2000 });
        this.router.navigate(['/']);
        this.startSessionTimeout();
      });
  }

  private startSessionTimeout() {
    timer(this.tokenInfos.getRemainingMs()).subscribe(() => {
      this.snackBar.open('Session expired, please login.', 'OK', { duration: 2000 });
      this.logout();
    });
  }

  getInfos(): Observable<Infos> {
    return this.http
      .get<Infos>(`${this.apiEndPoint}/infos`).pipe(
        catchError(handleHTTPError));
  }
}
