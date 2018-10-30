
import {catchError} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { User } from '../interfaces';
import { handleHTTPError } from '../utility_functions';

@Injectable()
export class UsersService {

  private endpoint = `${environment.apiEndPoint}/admin/users`;
  private tokenEndpoint = `${environment.apiEndPoint}/admin/getapptoken`;

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http
      .get<User[]>(this.endpoint).pipe(
      catchError(handleHTTPError));
  }

  setUsers(users: User[]): Observable<User[]> {
    return this.http
      .post<User[]>(this.endpoint, users).pipe(
      catchError(handleHTTPError));
  }

}
