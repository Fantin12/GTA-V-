// Gera um episódio inteiro com um comando:  node gerar.js ep01
// 1) calcula a sincronia labial  2) desenha os quadros  3) junta com vozes e sons
const { execSync } = require('child_process'), fs = require('fs'), path = require('path');
const ep = process.argv[2] || 'ep01';
const py = process.platform === 'win32' ? 'python' : 'python3';
const run = (cmd, env = {}) => { console.log('\n> ' + cmd); execSync(cmd, { stdio: 'inherit', cwd: __dirname, env: { ...process.env, ...env } }); };
const pasta = path.join(__dirname, '..', 'videos', `${ep}_2d`);
if (!fs.existsSync(pasta)) { console.error(`Pasta ${pasta} não existe (precisa das falas .mp3 e do timeline.py).`); process.exit(1); }
fs.rmSync(path.join(__dirname, 'frames'), { recursive: true, force: true });
run(`${py} "${path.join(pasta, 'timeline.py')}"`);
run('node render2d.js 30', { CENA: ep });
run(`${py} compor.py ${ep}`);
console.log(`\nPronto! Vídeo em videos/${ep}_2d/${ep.toUpperCase()}_2D.mp4`);
