const fs = require('fs');
const http = require('http');
const path = require('path');

const root = process.cwd();
const port = Number(process.env.PORT || 4000);

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject'
};

function candidates(urlPath) {
  const cleanPath = decodeURIComponent(urlPath.split('?')[0]).replace(/^\/+/, '');
  const list = [];

  if (!cleanPath || cleanPath.endsWith('/')) {
    list.push(path.join(root, cleanPath, 'index.html'));
  } else {
    list.push(path.join(root, cleanPath));
    list.push(path.join(root, cleanPath, 'index.html'));
    if (!path.extname(cleanPath)) {
      list.push(path.join(root, `${cleanPath}.html`));
    }
  }

  return list.filter(filePath => filePath.startsWith(root));
}

http.createServer((req, res) => {
  const filePath = candidates(req.url).find(item => fs.existsSync(item) && fs.statSync(item).isFile());

  if (!filePath) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
    return;
  }

  fs.readFile(filePath, (error, body) => {
    if (error) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Read error');
      return;
    }

    res.writeHead(200, {
      'Content-Type': types[path.extname(filePath).toLowerCase()] || 'application/octet-stream'
    });
    res.end(body);
  });
}).listen(port, '127.0.0.1', () => {
  console.log(`Static server listening on http://127.0.0.1:${port}/`);
});
