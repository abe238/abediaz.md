// Build abediaz.md: render index.md into a beautiful HTML page, and ship the
// raw Markdown alongside it. Single source of truth = index.md.
//
//   node build.js   ->   writes ./_site/{index.html, index.md, images/, ...}
//
// The same _site/ folder is what the GitHub Actions workflow uploads to Pages.

import { marked } from 'marked';
import {
  readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync, existsSync,
} from 'node:fs';

const OUT = '_site';
mkdirSync(`${OUT}/images`, { recursive: true });

marked.setOptions({ gfm: true });

const md = readFileSync('index.md', 'utf8');
const content = marked.parse(md);

const css = `
:root {
  --bg: #ffffff;
  --bg-soft: #f6f8fa;
  --text: #1f2328;
  --muted: #59636e;
  --border: #d1d9e0;
  --accent: #1a9e90;       /* abediaz teal, darkened for AA contrast on white */
  --accent-soft: #36BCAB;
  --code-bg: #f6f8fa;
  --max: 760px;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0d1117;
    --bg-soft: #161b22;
    --text: #e6edf3;
    --muted: #9198a1;
    --border: #30363d;
    --accent: #36BCAB;
    --accent-soft: #36BCAB;
    --code-bg: #161b22;
  }
}
* { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
}

/* ── editor-style file bar (sells the .md concept) ── */
.topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 16px;
  background: var(--bg-soft);
  border-bottom: 1px solid var(--border);
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 13px;
}
.filename { display: inline-flex; align-items: center; gap: 8px; color: var(--muted); }
.filename b { color: var(--text); font-weight: 700; }
.dot { width: 10px; height: 10px; border-radius: 50%; background: var(--accent-soft);
       box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-soft) 25%, transparent); }
.raw-link {
  color: var(--accent); text-decoration: none; border: 1px solid var(--border);
  padding: 3px 10px; border-radius: 6px; white-space: nowrap;
}
.raw-link:hover { border-color: var(--accent); background: color-mix(in srgb, var(--accent) 10%, transparent); }

/* ── markdown body ── */
.markdown-body { max-width: var(--max); margin: 0 auto; padding: 40px 20px 8px; }
.markdown-body > *:first-child { margin-top: 0; }
.markdown-body h1, .markdown-body h2, .markdown-body h3 {
  line-height: 1.25; margin: 1.6em 0 0.6em; font-weight: 700;
}
.markdown-body h1 { font-size: 2em; letter-spacing: -0.5px; }
.markdown-body h2 { font-size: 1.4em; padding-bottom: 0.3em; border-bottom: 1px solid var(--border); }
.markdown-body h3 { font-size: 1.15em; }
.markdown-body p { margin: 0 0 1em; }
.markdown-body a { color: var(--accent); text-decoration: none; }
.markdown-body a:hover { text-decoration: underline; }
.markdown-body strong { color: var(--text); }
.markdown-body img {
  display: block; max-width: 100%; height: auto; margin: 1.4em 0;
  border-radius: 12px; border: 1px solid var(--border);
}
.markdown-body blockquote {
  margin: 1.2em 0; padding: 0.4em 1.1em; color: var(--muted);
  border-left: 4px solid var(--accent-soft); background: var(--bg-soft); border-radius: 0 8px 8px 0;
}
.markdown-body blockquote p { margin: 0.3em 0; }
.markdown-body hr { border: 0; border-top: 1px solid var(--border); margin: 2em 0; }
.markdown-body table { border-collapse: collapse; width: 100%; margin: 1.2em 0; font-size: 0.95em; }
.markdown-body th, .markdown-body td { border: 1px solid var(--border); padding: 8px 13px; text-align: left; }
.markdown-body th { background: var(--bg-soft); font-weight: 700; }
.markdown-body tr:nth-child(2n) td { background: var(--bg-soft); }
.markdown-body code {
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.88em; background: var(--code-bg); padding: 0.2em 0.4em; border-radius: 6px;
}
.markdown-body sub, .markdown-body small { color: var(--muted); font-size: 0.85em; line-height: 1.5; }

.pagefoot {
  max-width: var(--max); margin: 0 auto; padding: 24px 20px 48px;
  color: var(--muted); font-size: 13px; text-align: center;
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
.pagefoot a { color: var(--accent); text-decoration: none; }
.pagefoot a:hover { text-decoration: underline; }

@media (max-width: 480px) {
  .markdown-body { padding: 28px 16px 8px; }
  .markdown-body h1 { font-size: 1.7em; }
}
`;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Abe Diaz — abediaz.md</title>
<meta name="description" content="The Markdown edition of abediaz.ai — Abe Diaz, Seattle / Tech / Evangelist, Sr. TPM on Disaster Relief by Amazon.">
<meta property="og:title" content="abediaz.md">
<meta property="og:description" content="The Markdown edition of abediaz.ai.">
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
  <main class="markdown-body">
${content}
  </main>
  <footer class="pagefoot">
    rendered from <a href="./index.md">index.md</a> &middot; the Markdown edition of <a href="https://abediaz.ai">abediaz.ai</a>
  </footer>
</body>
</html>
`;

writeFileSync(`${OUT}/index.html`, html);
copyFileSync('index.md', `${OUT}/index.md`); // raw markdown, served at /index.md
for (const f of readdirSync('images')) copyFileSync(`images/${f}`, `${OUT}/images/${f}`);
for (const f of ['CNAME', '.nojekyll']) if (existsSync(f)) copyFileSync(f, `${OUT}/${f}`);

console.log('Built _site/ ->', readdirSync(OUT).join(', '));
