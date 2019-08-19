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
    roles: string[];
}

export class FilesACL {
    name: string;
    path: string;
    roles: string[];
    permissions: string;
    currentPath?: string;
    basicauth?: boolean;
    totalgb: number;
    usedgb: number;

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

    PercentFull(): number {
        return this.usedgb * 100 / this.totalgb;
    }

    Color(acl: FilesACL): string {
        const percentFull = this.PercentFull();
        if (percentFull > 85) return "warn";
        if (percentFull > 65) return "accent";
        return "primary";
    }
}

export interface User {
    id: number;
    login: string;
    name?: string;
    surname?: string;
    role: string;
    longLivedToken: boolean;
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
    office_server?: string;
    bookmarks?: Bookmark[];
}

export interface Bookmark {
    name: string;
    url: string;
    icon: string;
}
