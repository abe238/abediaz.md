// Build abediaz.md: present the raw index.md as a styled monospace "file viewer"
// (line numbers, file tab, light/dark) — the markdown source IS the page.
// The real raw file is also shipped at /index.md.
//
//   node build.js   ->   ./_site/{index.html, index.md, images/, ...}

import {
  readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync, existsSync,
} from 'node:fs';

const OUT = '_site';
mkdirSync(`${OUT}/images`, { recursive: true });

const md = readFileSync('index.md', 'utf8');

// Show the markdown SOURCE verbatim — escape HTML so `#`, `**`, `![]()`, `<`, `>`
// all render as literal text.
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const lines = md.replace(/\n+$/, '').split('\n');
const rows = lines.map((l) => `<span class="row">${esc(l)}</span>`).join('\n');

const css = `
:root {
  --bg: #ffffff; --text: #1f2328; --muted: #59636e;
  --gutter: #aeb6bf; --border: #d1d9e0; --accent: #1a9e90;
  --hover: rgba(26,158,144,0.07); --lh: 1.7em;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0d1117; --text: #e6edf3; --muted: #9198a1;
    --gutter: #484f58; --border: #30363d; --accent: #36BCAB;
    --hover: rgba(54,188,171,0.10);
  }
}
* { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body {
  margin: 0; background: var(--bg); color: var(--text);
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 14px; line-height: var(--lh); -webkit-font-smoothing: antialiased;
}
.topbar {
  position: sticky; top: 0; z-index: 10;
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 10px 16px; background: var(--bg);
  border-bottom: 1px solid var(--border); font-size: 13px;
}
.filename { display: inline-flex; align-items: center; gap: 8px; color: var(--muted); }
.filename b { color: var(--text); font-weight: 700; }
.dot {
  width: 10px; height: 10px; border-radius: 50%; background: var(--accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 25%, transparent);
}
.raw-link {
  color: var(--accent); text-decoration: none; border: 1px solid var(--border);
  padding: 3px 10px; border-radius: 6px; white-space: nowrap;
}
.raw-link:hover { background: var(--hover); border-color: var(--accent); }

.code { max-width: 940px; margin: 0 auto; padding: 14px 0 8px; counter-reset: ln; }
.row {
  counter-increment: ln; display: block; position: relative;
  padding: 0 18px 0 66px; min-height: var(--lh);
  white-space: pre-wrap; word-break: break-word;
}
.row::before {
  content: counter(ln); position: absolute; left: 0; width: 48px;
  text-align: right; color: var(--gutter);
  user-select: none; -webkit-user-select: none;
}
.row:hover { background: var(--hover); }

.foot {
  max-width: 940px; margin: 0 auto; padding: 20px 18px 44px;
  color: var(--muted); font-size: 12px; text-align: center;
}
.foot a { color: var(--accent); text-decoration: none; }
.foot a:hover { text-decoration: underline; }

@media (max-width: 480px) {
  body { font-size: 13px; }
  .row { padding-left: 52px; }
  .row::before { width: 38px; }
}
`;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>abediaz.md — the Markdown edition of abediaz.ai</title>
<meta name="description" content="Abe Diaz, in raw Markdown. The Markdown edition of abediaz.ai, served on a .md domain.">
<meta property="og:title" content="abediaz.md">
<meta property="og:description" content="Abe Diaz, in raw Markdown — the Markdown edition of abediaz.ai.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://abediaz.md/">
<meta property="og:image" content="https://abediaz.md/images/profile.jpg">
<meta name="twitter:card" content="summary">
<meta name="twitter:site" content="@abe238">
<link rel="icon" href="./images/favicon.ico">
<link rel="icon" type="image/png" sizes="32x32" href="./images/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="./images/favicon-16x16.png">
<link rel="apple-touch-icon" href="./images/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>${css}</style>
</head>
<body>
  <header class="topbar">
    <span class="filename"><span class="dot"></span>abediaz.<b>md</b></span>
    <a class="raw-link" href="./index.md">view raw &darr;</a>
  </header>
  <main class="code">
${rows}
  </main>
  <footer class="foot">
    you're reading <a href="./index.md">index.md</a> &middot; the Markdown edition of <a href="https://abediaz.ai">abediaz.ai</a>
  </footer>
</body>
</html>
`;

writeFileSync(`${OUT}/index.html`, html);
copyFileSync('index.md', `${OUT}/index.md`); // the true raw file, served at /index.md
for (const f of readdirSync('images')) copyFileSync(`images/${f}`, `${OUT}/images/${f}`);
for (const f of ['CNAME', '.nojekyll']) if (existsSync(f)) copyFileSync(f, `${OUT}/${f}`);

console.log('Built _site/ ->', readdirSync(OUT).join(', '), `(${lines.length} source lines)`);
