
import { catchError, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { User } from '../interfaces';
import { handleHTTPError } from '../utility_functions';

@Injectable()
export class UsersService {

  private endpoint = `${environment.apiEndPoint}/admin/users`;

  constructor(private http: HttpClient) { }

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

  getRoles(): Observable<string[]> {
    return this.http
      .get<User[]>(this.endpoint).pipe(
        catchError(handleHTTPError)).pipe(
          map(
            res => {
              const rolesArray: string[] = [];
              res.map(user => {
                if (!rolesArray.includes(user.role)) {
                  rolesArray.push(user.role);
                }
              });
              return rolesArray;
            }));
  }

}
