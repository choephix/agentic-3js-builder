# Your build: rainyBusStopDiorama

You build one sample in this sandbox, `/home/cx/tmp-archive/astra-round/rainyBusStopDiorama`, following `GUIDE.md` here. The sandbox holds the SDK (`src/`, `kits/`), its docs (`docs/`, `GUIDE.md`) and the tools (`scripts/`, `harness/`); `samples/` is empty on purpose. This round tests whether a builder can make a strong model from the SDK and its docs alone.

## Subject

Slug `rainyBusStopDiorama`. A diorama of a small-town bus stop on a rainy evening, on a square base about 1.2 m across: a glass-and-steel shelter with a lit advertising panel, a bench, a timetable post, a bin, a section of kerb and road with puddles reflecting the light, a lamppost with a warm glow, and fallen leaves. Plain objects, no skeleton needed. Mood: wet, cosy, lit from within.

## Rules

- Work only inside `/home/cx/tmp-archive/astra-round/rainyBusStopDiorama`: run every command with that directory as the working directory, write only `samples/rainyBusStopDiorama.ts` and throwaway files under `scratch/rainyBusStopDiorama/`. Read nothing outside this sandbox except your own output under `~/tmp/public/nilo/agentic-3js-builder/preview/rainyBusStopDiorama/` and `~/tmp/public/nilo/agentic-3js-builder/snaps/rainyBusStopDiorama/`. Other samples, other checkouts and git history are off limits.
- At most 2 full renders (`npm run snap -- rainyBusStopDiorama v01`, then one fix-up `v02`); `preview` and `snap --report-only` are free and the way to check work between renders.
- The headless browser on 127.0.0.1:9333 is shared and already running; never start, stop or restart it.
- No git commands.

## Final reply

GUIDE.md's final reply, then a section "Friction": every place the SDK, its docs or its tools made the work harder (a wrong or missing doc line, a surprising default, a type that fought you, a helper you wished existed, a tool output you couldn't use), one line each with the file or helper it concerns, most costly first.
