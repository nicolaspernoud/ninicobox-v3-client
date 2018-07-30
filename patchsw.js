const fs = require('fs');

fs.readFile('./dist/ngsw-worker.js', 'utf-8', (err, data) => {
    if (err) throw err;
    fs.writeFile('./client/dist/ngsw-worker.js', data.replace('onFetch(event) {', `
    onFetch(event) {
        if (event.request.url.indexOf('/upload') !== -1) { return; }
        if (event.request.url.indexOf('/share') !== -1) { return; }
        `), 'utf-8', (err) => {
            if (err) throw err;
            console.log('Service Worker patched !');
        })
});