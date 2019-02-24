// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

const scheme = 'https';
const hostname = 'box.127.0.0.1.nip.io';
const port = '2443';
const host = `${scheme}://${hostname}:${port}`;
const apiRoute = '/api';
const apiEndPoint = `${host}${apiRoute}`;

export const environment = {
  production: false,
  scheme: scheme,
  port: port,
  host: host,
  apiRoute: apiRoute,
  apiEndPoint: apiEndPoint
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
