import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest, HttpEvent, HttpEventType } from '@angular/common/http';
import { File } from '../interfaces';
import { Observable, BehaviorSubject, bindCallback } from 'rxjs';
import { environment } from '../../environments/environment';
import { map, last, catchError } from 'rxjs/operators';
import { handleHTTPError } from '../utility_functions';
import { parseString } from 'xml2js';

@Injectable({
    providedIn: 'root',
})
export class FilesService {
    headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    urlBase = `${environment.apiEndPoint}/files`;

    uploadProgress = new BehaviorSubject<number>(0);

    constructor(private http: HttpClient) { }

    explore(basePath, filePath = '') {
        const self = this;
        const depthheaders = new HttpHeaders({ 'Depth': '1' });
        return this.http.request('PROPFIND',
            `${this.getUrl(basePath, filePath)}`,
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
                                path: decodeURIComponent(self.getRelativePath(basePath, x['D:href'][0])),
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

    createDir(basePath, filePath = '', directoryname) {
        return this.http.request('MKCOL', `${this.getUrl(basePath, filePath)}/${directoryname}`);
    }

    renameOrCopy(basePath, oldpath, newpath, isCopy: boolean) {
        if (!isCopy) {
            const destinationHeader = new HttpHeaders({ 'Destination': `${this.getUrl(basePath, newpath)}` });
            return this.http.request('MOVE', `${this.getUrl(basePath, oldpath)}`, {
                headers: destinationHeader,
                responseType: 'text'
            });
        } else {
            newpath = oldpath !== newpath ? newpath : newpath + ' (copy)';
            const destinationHeader = new HttpHeaders({ 'Destination': `${this.getUrl(basePath, newpath)}` });
            return this.http.request('COPY', `${this.getUrl(basePath, oldpath)}`, {
                headers: destinationHeader,
                responseType: 'text'
            });
        }
    }

    upload(basePath, filePath, file) {
        const req = new HttpRequest('PUT', `${this.getUrl(basePath, filePath + '/' + file.name)}`, file, {
            reportProgress: true,
            responseType: 'text'
        });
        return this.http.request(req).pipe(
            map(event => this.getEventMessage(event, file)),
            last(), // return last (completed) message to caller
            catchError(handleHTTPError)
        );
    }

    getPreview(basePath, filePath) {
        return this.http.get(`${this.getUrl(basePath, filePath)}`, { responseType: 'blob' });
    }

    getContent(basePath, filePath) {
        return this.http.get(`${this.getUrl(basePath, filePath)}`, { responseType: 'text' });
    }

    setContent(basePath, filePath, content) {
        return this.http.put(`${this.getUrl(basePath, filePath)}`, content, { responseType: 'text' });
    }

    getShareToken(basePath, filePath): Observable<string> {
        // tslint:disable-next-line:max-line-length
        return this.http.post(`${environment.apiEndPoint}/common/getsharetoken`, `/api/files${basePath}${filePath}`, { responseType: 'text' });
    }

    delete(basePath, filePath, isDir) {
        return this.executeRequest(`${this.getUrl(basePath, filePath)}`, 'DELETE', { isDir: isDir });
    }

    private getUrl(basePath, filePath) {
        return `${this.urlBase}${basePath}${filePath ? filePath : ''}`;
    }

    private getRelativePath(basePath, absoluteFilePath) {
        return `${new URL(this.urlBase).origin}${absoluteFilePath}`.slice(`${this.urlBase}${basePath}`.length);
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
                this.uploadProgress.next(percentDone);
                return `File "${file.name}" is ${percentDone}% uploaded.`;

            case HttpEventType.Response:
                return `File "${file.name}" was completely uploaded!`;

            default:
                return `File "${file.name}" surprising upload event: ${event.type}.`;
        }
    }
}
