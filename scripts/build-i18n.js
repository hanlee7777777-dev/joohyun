/*
 * 제이주현 외국어 페이지 자동 생성 (Vercel 배포 때 자동 실행)
 * - 저장소 전체를 dist/ 로 복사한 뒤, 한국어 html + i18n 번역 파일로
 *   /en /ja /zh /zh-tw /vi /th 페이지를 새로 만들어 덮어씁니다.
 * - 페이지별 외국어 제목·설명: scripts/i18n-pages.json
 * - 외국어 페이지에서 빼고 싶은 부분: class 에 jhKoOnly 를 붙이면 됩니다.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'dist');
const CFG = JSON.parse(fs.readFileSync(path.join(__dirname, 'i18n-pages.json'), 'utf8'));
const BASE = 'https://www.joo92.com';
const PAGES = CFG.pages;
const SLUGS = PAGES.filter(p => p !== 'index');
const KO_ONLY = ['jhKoOnly'];
const VOID = new Set(['img', 'input', 'br', 'meta', 'link', 'hr', 'source']);
const SKIP = new Set(['.git', 'dist', 'node_modules', 'scripts', '.vercel', '.github']);

function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const name of fs.readdirSync(src)) {
    if (SKIP.has(name)) continue;
    const s = path.join(src, name), d = path.join(dst, name);
    const st = fs.statSync(s);
    if (st.isDirectory()) copyDir(s, d); else fs.copyFileSync(s, d);
  }
}

function loadDict(file) {
  const s = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const i = s.indexOf('=');
  return JSON.parse(s.slice(i + 1).trim().replace(/;\s*$/, ''));
}
const escText = v => v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escAttr = v => escText(v).replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
const reEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function matchClose(s, from, tag) {
  const re = new RegExp('<(/?)' + tag + '\\b[^>]*?(/?)>', 'gi');
  re.lastIndex = from;
  let depth = 1, m;
  while ((m = re.exec(s))) {
    if (m[1]) depth--; else if (!m[2]) depth++;
    if (depth === 0) return [m.index, re.lastIndex];
  }
  return null;
}

function bake(s, attr, dic, asHtml) {
  const re = new RegExp('<([a-zA-Z0-9]+)\\b[^>]*\\s' + attr + '="([^"]+)"[^>]*>', 'g');
  const starts = [];
  let m;
  while ((m = re.exec(s))) starts.push({ start: m.index, end: re.lastIndex, tag: m[1].toLowerCase(), key: m[2] });
  for (let k = starts.length - 1; k >= 0; k--) {
    const { end, tag, key } = starts[k];
    if (VOID.has(tag)) continue;
    const v = dic[key];
    if (!v) continue;
    const c = matchClose(s, end, tag);
    if (!c) continue;
    s = s.slice(0, end) + (asHtml ? v : escText(v)) + s.slice(c[0]);
  }
  return s;
}

function bakePh(s, dic) {
  return s.replace(/<[a-zA-Z]+\b[^>]*data-i18n-ph="[^"]+"[^>]*>/g, tagtxt => {
    const key = /data-i18n-ph="([^"]+)"/.exec(tagtxt)[1];
    const v = dic[key];
    if (!v) return tagtxt;
    if (/\splaceholder="/.test(tagtxt)) return tagtxt.replace(/(\splaceholder=")[^"]*"/, (_, a) => a + escAttr(v) + '"');
    return tagtxt.replace(' data-i18n-ph=', ' placeholder="' + escAttr(v) + '" data-i18n-ph=');
  });
}

function removeKoOnly(s) {
  const re = new RegExp('<([a-zA-Z0-9]+)\\b[^>]*\\sclass="[^"]*\\b(?:' + KO_ONLY.join('|') + ')\\b[^"]*"[^>]*>', 'g');
  const starts = [];
  let m;
  while ((m = re.exec(s))) starts.push({ start: m.index, end: re.lastIndex, tag: m[1].toLowerCase() });
  for (let k = starts.length - 1; k >= 0; k--) {
    const { start, end, tag } = starts[k];
    if (VOID.has(tag)) { s = s.slice(0, start) + s.slice(end); continue; }
    const c = matchClose(s, end, tag);
    if (c) s = s.slice(0, start) + s.slice(c[1]);
  }
  return s;
}

const koUrl = p => BASE + (p === 'index' ? '/' : '/' + p);
const lUrl = (f, p) => BASE + (p === 'index' ? '/' + f : '/' + f + '/' + p);
const altLinks = p => [['ko', koUrl(p)]].concat(CFG.langs.map(L => [L.hreflang, lUrl(L.folder, p)])).concat([['x-default', koUrl(p)]])
  .map(([h, u]) => '<link rel="alternate" hreflang="' + h + '" href="' + u + '">\n').join('');

function build() {
  if (fs.existsSync(OUT)) fs.rmSync(OUT, { recursive: true, force: true });
  copyDir(ROOT, OUT);
  let count = 0;
  for (const p of PAGES) {
    let src = fs.readFileSync(path.join(ROOT, p + '.html'), 'utf8');
    src = src.replace(/<link rel="alternate" hreflang="[^"]*" href="[^"]*">\n?/g, '');
    const fm = /__jhI18nFiles = \[([^\]]*)\]/.exec(src);
    const files = fm ? (fm[1].match(/"\/(i18n\/[a-z-]+\.js)/g) || []).map(x => x.slice(2)) : ['i18n/common.js'];
    const dicts = files.map(loadDict);
    const alt = altLinks(p);
    for (const L of CFG.langs) {
      const dic = Object.assign({}, ...dicts.map(d => d[L.code] || {}));
      let s = src;
      const keep = [];
      s = s.replace(/<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>/g, m => { keep.push(m); return '\u0000' + (keep.length - 1) + '\u0000'; });
      s = removeKoOnly(s);
      s = bake(s, 'data-i18n-html', dic, true);
      s = bake(s, 'data-i18n', dic, false);
      s = bakePh(s, dic);
      s = s.replace(new RegExp('href="/(' + SLUGS.map(reEsc).join('|') + ')"', 'g'), 'href="/' + L.folder + '/$1"');
      s = s.split('href="/"').join('href="/' + L.folder + '"');
      s = s.replace(/\u0000(\d+)\u0000/g, (_, i) => keep[+i]);
      const home = BASE + '/' + L.folder;
      s = s.split("window.location.href='" + BASE + "/'").join("window.location.href='" + home + "'");
      s = s.split("location.href = '" + BASE + "/'").join("location.href = '" + home + "'");
      s = s.split("location.href='" + BASE + "/'").join("location.href='" + home + "'");
      s = s.replace(new RegExp("'(/(?:" + SLUGS.map(reEsc).join('|') + "))'", 'g'), "'/" + L.folder + "$1'");
      const [t, d] = CFG.meta[L.code][p];
      s = s.replace('<html lang="ko">', '<html lang="' + L.htmlLang + '" data-jhlang="' + L.code + '">');
      s = s.replace(/<title>[^<]*<\/title>/, '<title>' + escText(t) + '</title>');
      for (const [a, v] of [['name="description"', d], ['property="og:title"', t], ['property="og:description"', d], ['name="twitter:title"', t], ['name="twitter:description"', d], ['name="keywords"', CFG.keywords[L.code]]]) {
        s = s.replace(new RegExp('(<meta ' + reEsc(a) + ' content=")[^"]*"'), (_, x) => x + escAttr(v) + '"');
      }
      s = s.split('content="ko_KR"').join('content="' + L.locale + '"');
      s = s.replace(/<link rel="canonical" href="[^"]*">/, '<link rel="canonical" href="' + lUrl(L.folder, p) + '">');
      s = s.replace(/(<meta property="og:url" content=")[^"]*"/, (_, x) => x + lUrl(L.folder, p) + '"');
      s = s.replace('<link rel="canonical"', alt + '<link rel="canonical"');
      const force = '<script id="jhEnForce">try{localStorage.setItem(\'jhLang\',\'' + L.code + '\');}catch(e){}' +
        'document.addEventListener(\'click\',function(e){var o=e.target.closest&&e.target.closest(\'.langOpt[data-lang="ko"]\');' +
        'if(o){e.preventDefault();e.stopImmediatePropagation();try{localStorage.setItem(\'jhLang\',\'ko\');}catch(x){}location.href=\'' + koUrl(p) + '\';}},true);</script>\n';
      s = s.replace('</title>', '</title>\n' + force);
      fs.mkdirSync(path.join(OUT, L.folder), { recursive: true });
      fs.writeFileSync(path.join(OUT, L.folder, p + '.html'), s);
      count++;
    }
  }
  console.log('[build-i18n] 외국어 페이지 ' + count + '개 생성 완료 → dist/');
}
build();
