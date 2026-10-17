import { chromium } from 'playwright-core';
import { readFileSync } from 'node:fs';
const [page_, outPrefix, vpArg, stepsArg] = process.argv.slice(2);
const html = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>[hidden]{display:none!important}body{margin:0}</style></head><body>' + readFileSync(page_,'utf8') + '</body></html>';
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',
  args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
const [w,h]=(vpArg||'1440x900').split('x').map(Number);
const page = await b.newPage({viewport:{width:w,height:h}});
const errs=[];page.on('console',m=>{if(m.type()==='error')errs.push(m.text())});page.on('pageerror',e=>errs.push('PAGEERROR '+e.message));
const base='/home/claude/body/node_modules/three/';
await page.route('https://cdn.jsdelivr.net/npm/three@0.160.0/**', r=>{const p=new URL(r.request().url()).pathname.replace('/npm/three@0.160.0/','');r.fulfill({status:200,contentType:'application/javascript',body:readFileSync(base+p)});});
await page.route('https://fonts.googleapis.com/**', r=>r.abort());await page.route('https://fonts.gstatic.com/**', r=>r.abort());
await page.route('http://localhost/anatomy.txt', r=>r.fulfill({status:200,contentType:'text/plain',body:readFileSync('/home/claude/anat/build/anatomy.b64.txt')}));
await page.route('http://localhost/anatomy.bin', r=>r.fulfill({status:200,contentType:'application/octet-stream',body:readFileSync('/home/claude/anat/build/anatomy.bin')}));
await page.route('http://localhost/*.js', r=>{const f=new URL(r.request().url()).pathname.slice(1);r.fulfill({status:200,contentType:'application/javascript',body:readFileSync('/home/claude/anat/app/'+f)});});
await page.route('http://localhost/', r=>r.fulfill({status:200,contentType:'text/html',body:html}));
await page.goto('http://localhost/');
await page.waitForFunction(()=>window.__ready===true,{timeout:120000});
const out=await page.evaluate(process.argv[5]||"1");console.log(JSON.stringify(out,null,0));await b.close();process.exit(0);
for(const s of steps){ if(s.js) await page.evaluate(s.js); await page.waitForTimeout(s.wait??800); await page.screenshot({path:`${outPrefix}-${String(i++).padStart(2,'0')}.png`}); }
console.log('errors:',errs.length?errs.slice(0,8).join('\n'):'none');await b.close();
