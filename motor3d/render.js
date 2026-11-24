// Renderiza a cena quadro a quadro: node render.js [fps] [inicio] [fim]
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const ROOT = __dirname, OUT = path.join(ROOT, 'frames');
const FPS = +(process.argv[2] || 30);
const types = { '.html': 'text/html', '.js': 'text/javascript' };
const srv = http.createServer((q, r) => {
  const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0]) === '/' ? 'index.html' : decodeURIComponent(q.url.split('?')[0]));
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); r.end(d); });
}).listen(0, async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  page.on('console', m => console.log('[pag]', m.text())); page.on('pageerror', e => console.log('[ERRO]', e.message));
  await page.goto(`http://localhost:${srv.address().port}/`);
  await page.waitForFunction('window.ready === true', null, { timeout: 60000 });
  const dur = await page.evaluate('window.DUR');
  const t0 = +(process.argv[3] || 0), t1 = +(process.argv[4] || dur);
  const lista = process.env.TEMPOS ? process.env.TEMPOS.split(',').map(Number) : null; // quadros avulsos
  const n = lista ? lista.length : Math.round((t1 - t0) * FPS), start = Date.now();
  for (let i = 0; i < n; i++) {
    const url = await page.evaluate((t) => { window.renderAt(t); return document.querySelector('canvas').toDataURL('image/png'); }, lista ? lista[i] : t0 + i / FPS);
    fs.writeFileSync(path.join(OUT, `f${String(i).padStart(4, '0')}.png`), Buffer.from(url.split(',')[1], 'base64'));
    if (i % 30 === 0) console.log(`quadro ${i}/${n}  ${((Date.now() - start) / 1000).toFixed(0)}s`);
  }
  await browser.close(); srv.close(); console.log('fim', n, 'quadros');
});
