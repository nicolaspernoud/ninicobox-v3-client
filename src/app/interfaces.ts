export interface Proxy {
    name: string;
    fromUrl: string;
    toUrl: string;
    icon?: string;
    rank?: number;
    secured?: boolean;
    iframed?: boolean;
    iframepath?: string;
}

export interface FilesACL {
    name: string;
    path: string;
    roles: string[];
    permissions: string;
    currentPath?: string;
    basicauth?: boolean;
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
