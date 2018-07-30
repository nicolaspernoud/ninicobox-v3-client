import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { FilesACL } from '../interfaces';

@Injectable()
export class FilesACLsService {

  constructor(private http: HttpClient) { }

  getFilesACLs(): Observable<FilesACL[]> {
    return this.http.get<FilesACL[]>(`${environment.apiEndPoint}/common/filesacls`);
  }

}
