# agentic-3js-builder

TypeScript SDK that lets fast, cheap language models write primitive-built, skeleton-rigged three.js creatures, plus a `samples/` library and a local Vite showcase. It grew out of Nilo Creature Lab (`~/workspace/nilo-creature-lab`), whose harness renders and checks every sample. Stefan's overriding requirement: a simple, understandable API.

## Where to read

- Picking up or continuing work → `docs/STATUS.md` first: history, the guide test run, open to-dos.
- Using or changing the API → `docs/api.md` (the model-facing reference) and `docs/conventions.md` (behaviours builders need up front). A `src/` change updates them, and any sample it breaks, in the same commit. `README.md` is for people: layout, docs map, commands, showcase; agents don't get it.
- Style kits → `kits/<name>.ts` with `kits/<name>.md`. Kits sit on top of `src/`; `src/` stays style-neutral and never imports a kit. A new kit gets its own doc and a mention in `GUIDE.md` and `docs/api.md`.
- Building or briefing a sample → `GUIDE.md`, the brief handed to a builder agent with one subject.
- Adding, removing or reshaping a helper → `docs/DESIGN.md`: why each helper exists, with the evidence from 100 builds.

## Conventions

- Commit locally when a task is done; stage your own paths; the owner pushes.
- Format touched files only: `~/.herdr/worktrees/nilo/better-puppet-examples/node_modules/.bin/prettier --write --print-width 120 <files>`.
- npm, not pnpm.
- Verify with smoke renders (`npm run snap`); add permanent tests and run test suites only when Stefan asks.
- Renders use the shared NVIDIA headless Chromium on 127.0.0.1:9333. The main agent starts it with `~/workspace/nilo-wayfinder/.agents/skills/nilo-live-qa/chrome-nvidia.sh --user-data-dir=/tmp/creature-lab-chrome --remote-debugging-port=9333 --headless=new`, checks the WebGL renderer reports RTX 3060, and when done stops it and removes `/tmp/creature-lab-chrome`. Subagents only connect to it.
- Images for Stefan go under `~/tmp/public/nilo/agentic-3js-builder/`.
- Text written for models (GUIDE, `docs/api.md`, `docs/conventions.md`, kit docs, briefs): the target and hard requirements, positively phrased; capable models choose their own construction.

## Commands

```
npm run typecheck                          # src, kits, samples and showcase; one broken sample fails it
npm run typecheck -- <slug | path.ts> ...  # only those files and their imports, with the project's settings
npm run showcase                           # dev server, hot reload
npm run preview -- <slug | path/to/file.ts> [--shot] [--gap <A> <B>]... [--bones <A>]... [--box <A>]...   # about a second: textures, parts, bounds, floor, quick shots
npm run snap -- <slug | path.ts> <tag> [--report-only]   # render through the creature-lab harness
npm run sheet -- <slug | slug@tag> ... [--view three-quarter] [--cols N] [--out f.jpg]   # collage of rendered shots
```
