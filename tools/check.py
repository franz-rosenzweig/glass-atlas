#!/usr/bin/env python3
"""Check Glass Atlas before shipping: imports resolve, and every screen loads in light and dark.

    python3 tools/check.py              both checks; screenshots go to /tmp/glass-atlas-check/
    python3 tools/check.py --static     only the import check (no browser needed)
    CHECK_EXTRA=shots.json python3 tools/check.py    also shoot extra screens (see extra_steps)

The browser walk serves app/ on a free local port, drives headless Chrome over DevTools through
window.__atlas (open, openMed, openSources, startDive, dive.api.go), and fails on any page error.
It needs Chrome (set CHROME=/path, default: Chrome for Testing in ~/.local/opt) and the Python
package websocket-client. Look at the screenshots too: a screen can load and still look wrong.
"""
import functools, http.server, json, os, re, shutil, socket, subprocess, sys, tempfile, threading, time, urllib.request
from base64 import b64decode
from pathlib import Path

APP = Path(__file__).resolve().parent.parent / "app"
OUT = Path(os.environ.get("CHECK_OUT", "/tmp/glass-atlas-check"))
CHROME = os.environ.get("CHROME", str(Path.home() / ".local/opt/google/chrome-linux64/chrome"))


def static_check():
    bad = []
    imap = re.search(r'<script type="importmap">(.*?)</script>', (APP / "index.html").read_text(), re.S)
    bare = json.loads(imap.group(1))["imports"] if imap else {}
    for f in [APP / "index.html", *APP.glob("*.js")]:
        for spec in re.findall(r"""(?:import|from)\s*\(?\s*['"]([^'"]+)['"]""", f.read_text()):
            if spec.startswith("."):
                target = (f.parent / spec).resolve()
            elif spec in bare or any(spec.startswith(k) for k in bare if k.endswith("/")):
                key = spec if spec in bare else next(k for k in bare if k.endswith("/") and spec.startswith(k))
                target = (APP / (bare[key] + spec[len(key):])).resolve()
            else:
                continue
            if not target.is_file():
                bad.append(f"{f.name}: import '{spec}' -> missing {target}")
    return bad


A = "window.__atlas"
CONDS = ['pots', 'heds', 'mcas', 'hashi', 'enceph', 'iron', 'gastro', 'carth', 'c67', 'lspurs', 'lsil', 'ra', 'endo']
DIVES = {'ra': ['joint', 'lining', 'molecule'], 'hashi': ['slide', 'follicle'], 'mcas': ['skin', 'mast'],
         'pots': ['circuit', 'rhythm'], 'iron': ['villi', 'cell']}


def steps():
    yield "home", "void 0", .5
    for c in CONDS:
        yield f"cond-{c}", f"{A}.open('{c}')", 2.5
    yield "meds", f"{A}.openMed(null)", 2
    yield "sources", f"{A}.openSources()", 1.5
    yield "web", "document.getElementById('webBtn').click()", 2.5
    yield "day", f"{A}.closeAll();setTimeout(()=>document.getElementById('toDay').click(),200)", 2.5
    yield "notes", "document.getElementById('notesBtn').click()", 2
    yield "alert", "document.getElementById('alertBtn').click()", 1.5
    # the left panel's medicines list (its own mode), then back to the chart so later steps find their buttons
    yield "meds-list", f"{A}.closeAll();setTimeout(()=>document.getElementById('toMeds').click(),200)", 1.5
    yield None, "document.getElementById('toChart').click()", .5
    for d, levels in DIVES.items():
        yield f"dive-{d}-{levels[0]}", f"{A}.closeAll();{A}.startDive('{d}')", 4
        for lv in levels[1:]:
            yield f"dive-{d}-{lv}", f"{A}.dive.api.go('{lv}')", 2.5
        yield f"dive-{d}-guide", f"{A}.dive.root.querySelector('.dv-guide').click()", 1
        yield None, f"{A}.dive.root.querySelector('.dv-pop').hidden=true;{A}.dive.close()", 1.2
    yield "tour", f"{A}.closeAll();{A}.tour.start()", 3
    yield from extra_steps()


def extra_steps():
    """Screens the standard walk doesn't reach, asked for by whoever changed them (the automatic
    worker writes them to .request/shots.json): a JSON list of {"name", "js", "wait"}. They run after
    a fresh reload, in order, and are saved as <theme>-extra-<name>.png."""
    path = os.environ.get("CHECK_EXTRA")
    if not path or not Path(path).is_file():
        return
    try:
        items = json.loads(Path(path).read_text())
    except ValueError as e:
        print(f"! CHECK_EXTRA: not valid JSON ({e})")
        return
    yield None, "location.reload()", 11
    for i, it in enumerate(items[:12] if isinstance(items, list) else []):
        if not isinstance(it, dict) or not isinstance(it.get("js", ""), str):
            continue
        name = re.sub(r"[^a-z0-9-]+", "-", str(it.get("name") or f"step{i}").lower()).strip("-")[:40] or f"step{i}"
        try:
            wait = min(max(float(it.get("wait", 2)), 0), 10)
        except (TypeError, ValueError):
            wait = 2
        yield f"extra-{name}", str(it.get("js") or "void 0")[:2000], wait


def walk(url, mode):
    import websocket
    prof = tempfile.mkdtemp(prefix="atlas-check-")
    chrome = subprocess.Popen([CHROME, "--headless=new", "--no-sandbox", "--hide-scrollbars", "--mute-audio",
                               "--enable-unsafe-swiftshader", "--use-angle=swiftshader", "--remote-allow-origins=*",
                               "--remote-debugging-port=0", f"--user-data-dir={prof}", "about:blank"],
                              stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    errors = []
    try:
        pf = Path(prof) / "DevToolsActivePort"
        for _ in range(100):
            if pf.exists() and pf.read_text().strip():
                break
            time.sleep(.1)
        port = pf.read_text().split()[0]
        page = next(p for p in json.load(urllib.request.urlopen(f"http://127.0.0.1:{port}/json/list")) if p["type"] == "page")
        ws = websocket.create_connection(page["webSocketDebuggerUrl"])
        ids = iter(range(1, 10**6))
        where = ["load"]

        def note(m):
            p = m.get("params", {})
            if m.get("method") == "Runtime.exceptionThrown":
                d = p["exceptionDetails"]
                errors.append(f"[{mode} {where[0]}] {d.get('exception', {}).get('description') or d.get('text')}")
            elif m.get("method") == "Runtime.consoleAPICalled" and p.get("type") == "error":
                errors.append(f"[{mode} {where[0]}] console: " + " ".join(str(a.get("value", a.get("description", ""))) for a in p["args"]))

        def call(method, **params):
            i = next(ids)
            ws.send(json.dumps({"id": i, "method": method, "params": params}))
            while True:
                m = json.loads(ws.recv())
                note(m)
                if m.get("id") == i:
                    return m.get("result", {})

        def pump(sec):
            ws.settimeout(.25)
            end = time.time() + sec
            while time.time() < end:
                try:
                    note(json.loads(ws.recv()))
                except websocket.WebSocketTimeoutException:
                    pass
            ws.settimeout(60)

        call("Page.enable"); call("Runtime.enable")
        call("Emulation.setDeviceMetricsOverride", width=1440, height=900, deviceScaleFactor=1, mobile=False)
        call("Emulation.setEmulatedMedia", features=[{"name": "prefers-color-scheme", "value": mode}])
        call("Page.navigate", url=url)
        pump(10)
        if not call("Runtime.evaluate", expression="!!window.__ready")["result"].get("value"):
            errors.append(f"[{mode}] the app never finished loading")
            return errors
        for name, js, wait in steps():
            where[0] = name or where[0]
            r = call("Runtime.evaluate", expression=js, awaitPromise=True)
            if "exceptionDetails" in r:
                errors.append(f"[{mode} {where[0]}] step failed: {r['exceptionDetails'].get('exception', {}).get('description', js)}")
            pump(wait)
            if name:
                (OUT / f"{mode}-{name}.png").write_bytes(b64decode(call("Page.captureScreenshot", format="png")["data"]))
    finally:
        chrome.kill(); chrome.wait(); shutil.rmtree(prof, ignore_errors=True)
    return errors


def main():
    problems = static_check()
    for p in problems:
        print("!", p)
    print(f"imports: {'ok' if not problems else len(problems)} problem(s)" if problems else "imports: ok")
    if "--static" in sys.argv:
        sys.exit(1 if problems else 0)
    if not Path(CHROME).exists():
        sys.exit(f"no Chrome at {CHROME}; set CHROME= or run with --static")
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0)); port = s.getsockname()[1]
    handler = functools.partial(type("Quiet", (http.server.SimpleHTTPRequestHandler,), {"log_message": lambda *a: None}), directory=str(APP))
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), handler)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    OUT.mkdir(parents=True, exist_ok=True)
    for mode in ("light", "dark"):
        errs = walk(f"http://127.0.0.1:{port}/", mode)
        errs = [e for e in errs if "favicon" not in e]
        problems += errs
        for e in errs:
            print("!", e)
        print(f"{mode}: {'ok' if not errs else str(len(errs)) + ' problem(s)'}")
    srv.shutdown()
    print(f"screenshots: {OUT}")
    sys.exit(1 if problems else 0)


if __name__ == "__main__":
    main()
