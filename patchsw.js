const fs = require('fs');

fs.readFile('./dist/ngsw-worker.js', 'utf-8', (err, data) => {
    if (err) throw err;
    fs.writeFile('./dist/ngsw-worker.js', data.replace('onFetch(event) {', `
    onFetch(event) {
        if (event.request.url.indexOf('/api/files') !== -1) { return; }
        `), 'utf-8', (err) => {
            if (err) throw err;
            console.log('Service Worker patched !');
        })
});