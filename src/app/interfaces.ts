import { environment } from '../environments/environment';

export interface App {
    name: string;
    isProxy: boolean;
    host: string;
    forwardTo: string;
    serve: string;
    icon?: string;
    rank?: number;
    secured?: boolean;
    iframed?: boolean;
    iframepath?: string;
    login?: string;
    password?: string;
}

export class FilesACL {
    name: string;
    path: string;
    roles: string[];
    permissions: string;
    currentPath?: string;
    basicauth?: boolean;

    constructor(data: any) {
        Object.assign(this, data);
        this.currentPath = this.basePath();
    }

    basePath(): string {
        return `${environment.apiRoute}/files/${this.path}`;
    }

    displayedPath() {
        return decodeURI(this.currentPath.slice(this.basePath().length)).replace(/\//g, '&nbsp;<span>▶</span>&nbsp;');
    }
}

export interface User {
    id: number;
    login: string;
    name?: string;
    surname?: string;
    role: string;
    passwordHash?: string;
    password?: string;
}

export interface File {
    name: string;
    path: string;
    isDir: boolean;
    size: number;
    mtime: Date;
}

export interface Infos {
    server_version: string;
    client_version: string;
    bookmarks?: Bookmark[];
}

export interface Bookmark {
    name: string;
    url: string;
    icon: string;
}
