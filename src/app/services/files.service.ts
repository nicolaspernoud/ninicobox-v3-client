import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest, HttpEvent, HttpEventType } from '@angular/common/http';
import { File } from '../interfaces';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { map, last, catchError } from 'rxjs/operators';
import { handleHTTPError } from '../utility_functions';
import { parseString } from 'xml2js';

@Injectable({
    providedIn: 'root',
})
export class FilesService {
    headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    // tslint:disable-next-line:max-line-length
    host = !!environment.host ? `${environment.host}` : `${window.location.protocol}//${window.location.host}`;

    uploadProgress = new BehaviorSubject<UploadProgress>({
        filename: '',
        progress: 0
    });

    constructor(private http: HttpClient) { }

    explore(path) {
        const depthheaders = new HttpHeaders({ 'Depth': '1' });
        return this.http.request('PROPFIND',
            `${this.host}${path}`,
            { headers: depthheaders, responseType: 'text' }
        ).pipe(
            map(
                res => {
                    let webdavJSONResponse;
                    parseString(res, function (err, result) {
                        // Remove the first element
                        result['D:multistatus']['D:response'].shift();
                        webdavJSONResponse = result['D:multistatus']['D:response'].map(x => {
                            const isdir = typeof x['D:propstat'][0]['D:prop'][0]['D:resourcetype'][0] === 'object';
                            const file: File = {
                                name: x['D:propstat'][0]['D:prop'][0]['D:displayname'][0],
                                path: x['D:href'][0],
                                isDir: isdir,
                                size: isdir ? 0 : parseInt(x['D:propstat'][0]['D:prop'][0]['D:getcontentlength'][0], 10),
                                mtime: new Date(x['D:propstat'][0]['D:prop'][0]['D:getlastmodified'][0])
                            };
                            return file;
                        });
                    });
                    return webdavJSONResponse;
                }
            ));
    }

    createDir(path, directoryname) {
        return this.http.request('MKCOL', `${this.host}${path}/${directoryname}`, { responseType: 'text' });
    }

    renameOrCopy(oldpath, newpath, isCopy: boolean) {
        if (!isCopy) {
            const destinationHeader = new HttpHeaders({ 'Destination': `${this.host}${newpath}` });
            return this.http.request('MOVE', `${this.host}${oldpath}`, {
                headers: destinationHeader,
                responseType: 'text'
            });
        } else {
            newpath = oldpath !== newpath ? newpath : newpath + ' (copy)';
            const destinationHeader = new HttpHeaders({ 'Destination': `${this.host}${newpath}` });
            return this.http.request('COPY', `${this.host}${oldpath}`, {
                headers: destinationHeader,
                responseType: 'text'
            });
        }
    }

    upload(path, file) {
        const req = new HttpRequest('PUT', `${this.host}${path}/${file.name}`, file, {
            reportProgress: true,
            responseType: 'text'
        });
        return this.http.request(req).pipe(
            map(event => this.getEventMessage(event, file)),
            last(), // return last (completed) message to caller
            catchError(handleHTTPError)
        );
    }

    getPreview(path) {
        return this.http.get(`${this.host}${path}`, { responseType: 'blob' });
    }

    getContent(path) {
        return this.http.get(`${this.host}${path}`, { responseType: 'text' });
    }

    setContent(path, content) {
        return this.http.put(`${this.host}${path}`, content, { responseType: 'text' });
    }

    getShareToken(wantedToken: WantedToken): Observable<string> {
        // tslint:disable-next-line:max-line-length
        return this.http.post(`${environment.apiEndPoint}/common/getsharetoken`, wantedToken, { responseType: 'text', withCredentials: true });
    }

    delete(path, isDir) {
        return this.executeRequest(`${this.host}${path}`, 'DELETE', { isDir: isDir });
    }

    private executeRequest(url, method = 'GET', sentData = null, params = null) {
        return this.http.request<File[]>(method, url, {
            headers: this.headers,
            params: params,
            body: JSON.stringify(sentData)
        });
    }

    /** Return distinct message for sent, upload progress, & response events */
    private getEventMessage(event: HttpEvent<any>, file: File) {
        switch (event.type) {
            case HttpEventType.Sent:
                return `Uploading file "${file.name}" of size ${file.size}.`;

            case HttpEventType.UploadProgress:
                // Compute and show the % done:
                const percentDone = Math.round(100 * event.loaded / event.total);
                this.uploadProgress.next({
                    filename: file.name,
                    progress: percentDone
                });
                return `File "${file.name}" is ${percentDone}% uploaded.`;

            case HttpEventType.Response:
                return `File "${file.name}" was completely uploaded!`;

            default:
                return `File "${file.name}" surprising upload event: ${event.type}.`;
        }
    }
}

export interface UploadProgress {
    filename: string;
    progress: number;
}

export interface WantedToken {
    sharedfor: string;
    url:       string;
    lifespan:  number;
    canwrite?: boolean;
}
