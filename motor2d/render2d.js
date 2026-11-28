// Renderiza uma cena 2D (SVG) quadro a quadro por screenshot: CENA=nome node render2d.js [fps] [inicio] [fim]
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const ROOT = __dirname, OUT = path.join(ROOT, 'frames'), FPS = +(process.argv[2] || 30);
const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.ttf': 'font/ttf' };
const srv = http.createServer((q, r) => {
  let u = decodeURIComponent(q.url.split('?')[0]); if (u === '/') u = '/index.html';
  const f = path.join(ROOT, u);
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); r.end(d); });
}).listen(0, async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.log('[ERRO]', e.message));
  await page.goto(`http://localhost:${srv.address().port}/?cena=${process.env.CENA || 'teste'}`);
  await page.waitForFunction('window.ready === true', null, { timeout: 60000 });
  const dur = await page.evaluate('window.DUR');
  const cortes = await page.evaluate('window.CORTES || []'); fs.writeFileSync(path.join(OUT, 'cortes.json'), JSON.stringify(cortes));
  const t0 = +(process.argv[3] || 0), t1 = +(process.argv[4] || dur);
  const lista = process.env.TEMPOS ? process.env.TEMPOS.split(',').map(Number) : null;
  const n = lista ? lista.length : Math.round((t1 - t0) * FPS), start = Date.now();
  for (let i = 0; i < n; i++) {
    const t = lista ? lista[i] : t0 + i / FPS;
    await page.evaluate((t) => window.renderAt(t), t);
    const idx = process.env.ABSIDX ? Math.round(t0 * FPS) + i : i;
    await page.screenshot({ path: path.join(OUT, `f${String(idx).padStart(4, '0')}.png`) });
    if (i % 60 === 0) console.log(`quadro ${i}/${n} ${((Date.now() - start) / 1000).toFixed(0)}s`);
  }
  await browser.close(); srv.close(); console.log('fim', n, 'quadros');
});
