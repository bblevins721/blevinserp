import { createReadStream, existsSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('.', import.meta.url)));
const port = Number(process.env.PORT || 4173);

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8'
};

const publicFiles = new Map([
  ['/', 'index.html'],
  ['/index.html', 'index.html'],
  ['/styles.css', 'styles.css'],
  ['/app.js', 'app.js']
]);

function send(res, status, body, headers = {}) {
  res.writeHead(status, {
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...headers
  });
  res.end(body);
}

const server = createServer((req, res) => {
  if (!req.url || !['GET', 'HEAD'].includes(req.method)) {
    send(res, 405, 'Method Not Allowed', { Allow: 'GET, HEAD' });
    return;
  }

  const url = new URL(req.url, 'http://localhost');
  const assetName = publicFiles.get(url.pathname);

  if (!assetName) {
    send(res, 404, 'Not Found');
    return;
  }

  const finalPath = resolve(join(root, assetName));

  if (!existsSync(finalPath)) {
    send(res, 404, 'Not Found');
    return;
  }

  const contentType = mimeTypes[extname(finalPath)] || 'application/octet-stream';
  res.writeHead(200, {
    'Cache-Control': 'no-store',
    'Content-Type': contentType,
    'X-Content-Type-Options': 'nosniff'
  });
  if (req.method === 'HEAD') {
    res.end();
    return;
  }

  createReadStream(finalPath).on('error', () => {
    if (!res.headersSent) send(res, 500, 'Internal Server Error');
    else res.destroy();
  }).pipe(res);
});

server.listen(port, '127.0.0.1', () => {
  console.log(`BlevinsERP is running at http://127.0.0.1:${port}`);
});

