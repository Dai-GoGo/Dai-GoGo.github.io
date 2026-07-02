const fs = require('fs');
const path = require('path');

const pages = [
  'index.html',
  'about/index.html',
  'categories/index.html',
  'tags/index.html',
  'archives/index.html',
  'contact/index.html',
  'friends/index.html',
  '404.html',
  'posts/system-boundaries/index.html',
  'posts/github-pages-hardening/index.html',
  'posts/incident-review-template/index.html'
];

const missing = [];
const forbidden = /锟|�|TotheMoon|月球Moon|肖小怡|example\.com/;

for (const page of pages) {
  const html = fs.readFileSync(page, 'utf8');
  if (forbidden.test(html)) {
    missing.push(`${page}: contains legacy/demo text`);
  }

  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const url = match[1];
    if (/^(https?:|mailto:|#)/.test(url)) {
      continue;
    }

    const cleanUrl = url.split(/[?#]/)[0];
    if (!cleanUrl || cleanUrl === '/') {
      continue;
    }

    let localPath = cleanUrl.startsWith('/')
      ? cleanUrl.slice(1)
      : path.join(path.dirname(page), cleanUrl);

    if (localPath.endsWith('/')) {
      localPath += 'index.html';
    }

    if (!path.extname(localPath) && !fs.existsSync(localPath)) {
      localPath = path.join(localPath, 'index.html');
    }

    if (!fs.existsSync(localPath)) {
      missing.push(`${page}: missing ${url}`);
    }
  }
}

if (missing.length) {
  console.error(missing.join('\n'));
  process.exit(1);
}

console.log('Site check passed.');
