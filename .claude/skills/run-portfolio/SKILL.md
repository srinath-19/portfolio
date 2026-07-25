---
name: run-portfolio
description: Build, run, and screenshot the portfolio Next.js app. Use when asked to start the portfolio site, run it, take a screenshot, check a UI change, or drive it in a browser.
---

Single-page Next.js 16 (App Router, Turbopack) app at the repo root. It's
driven with the `mcp__chrome-devtools__*` tools already wired up in
`.mcp.json` (they talk to a real Chrome over CDP on port 9222) — there is
no CLI driver to write. The one non-obvious setup step is getting a
debug-enabled Chrome running, since those tools can only *connect* to a
browser, not launch one. This file documents that step plus the exact
dev-server + interaction sequence.

## Prerequisites

Windows host, not a container — no `apt-get`. Needs:
- Node.js + npm (`node_modules` already installed; `npm install` if not)
- A local Chrome install resolvable as `chrome.exe`

## Run (agent path)

**1. Start the dev server**, backgrounded and detached so it outlives the
launching shell:

```bash
npm run dev > /tmp/portfolio-dev.log 2>&1 &
disown
timeout 30 bash -c 'until curl -sf http://localhost:3000 >/dev/null; do sleep 1; done' && echo "SERVER UP"
```

Stop it later (no `lsof` on Windows — use `netstat`):

```bash
netstat -ano | grep ":3000" | grep LISTENING   # last column is the PID
taskkill //PID <pid> //F
```

**2. Launch a debug-enabled Chrome** — required once per session; the
chrome-devtools tools cannot start Chrome themselves:

```powershell
powershell -File .claude/skills/run-portfolio/launch-chrome-debug.ps1
```

Confirm it's up:

```bash
curl -s http://127.0.0.1:9222/json/version
```

**3. Drive it with the `mcp__chrome-devtools__*` tools** (native tools,
not bash — schemas are deferred, load them first):

```
ToolSearch: "select:mcp__chrome-devtools__new_page,mcp__chrome-devtools__navigate_page,mcp__chrome-devtools__resize_page,mcp__chrome-devtools__evaluate_script,mcp__chrome-devtools__take_screenshot,mcp__chrome-devtools__list_console_messages"
```

Then the loop that proves the page actually renders:

```
new_page(url="http://localhost:3000")
resize_page(width=1440, height=900)                        # desktop; 390x844 for mobile
evaluate_script(function="() => window.scrollTo(0,0)")     # see Gotchas — scroll position persists
take_screenshot(filePath="<scratchpad>/shot.png")
list_console_messages(types=["error","warn"])               # expect none
```

Then use the `Read` tool on the saved PNG and actually look at it — a
screenshot file you haven't viewed proves nothing.

## Run (human path)

`npm run dev`, open `http://localhost:3000` in any browser, Ctrl-C to stop.

## Test

No test suite is configured (`package.json` has no `test` script).
`npm run build` is the closest thing to a correctness gate — full
production build plus the TypeScript check. `npx tsc --noEmit` alone is
faster when a type check is all you need.

## Gotchas

- **Chrome needs its own `--user-data-dir`.** If Chrome is already
  running under the normal profile, `chrome.exe --remote-debugging-port=9222`
  with no separate profile dir just opens a tab in the existing process
  and silently ignores the flag — the debug port never comes up.
  `launch-chrome-debug.ps1` always passes an isolated profile dir.
- **`resize_page` can throw `Protocol error (Browser.setContentsSize):
  Restore window to normal state before setting content size`** when
  called again after an earlier resize in the same session. Fix:
  `navigate_page(type="reload")` once, then retry `resize_page`.
- **Scroll position survives `navigate_page(type="reload")`** and
  browser reconnects. Always `evaluate_script(() => window.scrollTo(0,0))`
  before a "top of page" screenshot, or you'll capture wherever the page
  was last left.
- **`take_screenshot(fullPage=true)` can catch client-side animations
  mid-frame.** The hero has a framer-motion typewriter effect; full-page
  captures have shown it mid-type (e.g. "DESIGNS W" or "BUILDS THE" with
  the rest of the word not yet typed). Not a bug — re-shoot, or use a
  plain viewport screenshot instead of `fullPage`.
- **After Chrome is closed and relaunched, old page ids are invalid.**
  The tool reports "the browser was restarted or reconnected... Page ids
  have changed" — just call `new_page` (or `list_pages`) again rather
  than reusing a stale id.
- **The black "N" circle bottom-left in every screenshot is the Next.js
  dev tools indicator**, not app UI. It's dev-only and absent from a
  production build.
- Dev server startup logs a Turbopack warning about multiple lockfiles
  (a stray `package-lock.json` up the directory tree outside the repo).
  Cosmetic — doesn't block anything.

## Troubleshooting

- **`Could not connect to Chrome. Check if Chrome is running.`** from any
  `mcp__chrome-devtools__*` call: the debug Chrome isn't up, or was
  closed since the last call. Re-run `launch-chrome-debug.ps1`, re-verify
  with `curl http://127.0.0.1:9222/json/version`.
- **Dev server won't bind to port 3000**: something's still listening
  from a previous run — `netstat -ano | grep ":3000" | grep LISTENING`,
  then `taskkill //PID <pid> //F`.
