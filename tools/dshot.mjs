import { chromium } from 'playwright-core';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'});
const p=await b.newPage({viewport:{width:1000,height:360}});await p.goto('file:///tmp/claude-0/derm.html');await p.screenshot({path:'/tmp/claude-0/derm.png'});await b.close();
