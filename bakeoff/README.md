# Prompt bake-off

How well does a model build from one system prompt and one pitch, with no tools and no second turn, the way an app would run it? A bake-off sends the same pitches through several system prompts (arms) and shows the results side by side on the showcase's `/bakeoff` page.

The showcase's `/lab` page tells the whole story of every round so far: what was tried in which order and why, with a scoreboard, a filterable gallery, a compare grid with presets, charts of time, tokens and cost, failures by message, the pitches and the method. It reads every round from `lab.json` (`showcase/lab-data.mjs`); its thumbnails come from `npm run lab-thumbs`, a cache outside git that `showcase:build` fills. `npm run lab-export` writes a static copy to webshare, http://axalon:8080/nilo/agentic-3js-builder/lab/, that needs no dev server; only its live 3D links do.

## Pieces

- `arms.json`: each arm is a contract, an optional taste paragraph and a reference.
  - **Contracts:** `prompts/contract.md` for SDK arms, `prompts/contract-plain.md` for three.js only.
  - **Taste:** `prompts/taste-sdk.md` builds with the SDK throughout; `prompts/taste-primitives.md` puts simple primitives first and uses the SDK only where primitives fall short.
  - **Reference:**
    - `source`: every `src/*.ts` file, about 69k tokens.
    - `docs`: `docs/api.md` and `docs/conventions.md`, about 23k tokens.
    - `brief`: the top of `docs/api.md` up to "Frames" (helper map, cheat sheet, target, module), about 4k tokens.
    - `none`.
- `pitches.json` (round 1) and `pitches-r2.json` (round 2): subjects (creatures, a humanoid, a prop, a diorama), each with a `terse` and a `rich` pitch of the same subject.
- `rounds/<round>/`: one run of arms × subjects × levels:
  - `round.json`: model, effort, arms and pitches as run.
  - `prompts/`: the exact system prompts.
  - `runs/`: request record and reply per build.
  - `builds/`: the modules.
  - `checks/`: type errors and the render report.
  - `results.json`: all of the above in one file.

The model's reply is one fenced TypeScript block. Its module imports `three` and `"agentic-3js-builder"`, which the runner points at `src/index.ts`. The module default-exports a no-argument function that returns the model.

## Commands

```
npm run bakeoff -- prompt <arm>            # write an arm's system prompt to scratch/bakeoff/ and print its size
npm run bakeoff -- run <round> [--model anthropic/claude-sonnet-5-5] [--effort medium] [--arms a,b] [--subjects x,y] [--levels terse,rich] [--concurrency 8] [--arm-set arms.json] [--pitches pitches.json]
npm run bakeoff -- check <round>           # typecheck and render (snap tag v01) every build without a check yet
npm run bakeoff -- results <round>         # rebuild results.json
npm run lab-thumbs                         # thumbnails for the /lab page (missing or outdated ones only)
npm run lab-export                         # static /lab copy on webshare (rerun after new rounds)
```

- `run` only asks for builds that have no run record yet, so an interrupted round resumes where it stopped. To retry a build, delete its `runs/<slug>.json`.
- Round ids are letters and digits. Slugs are camel case, e.g. `r1FennecTerseDocsSdk`.
- Calls go through `omp auth-gateway stdio`, which uses the stored omp logins and adds about 50 tokens to the prompt. Any model `omp models` lists works.
- `costUsd` is estimated from `omp models --json` prices: uncached input, cached input and output. Cache writes aren't reported, so they're priced as plain input.
- `check` renders with `SNAP_RENDER_ON_ERROR=1`: a build the creature lab would reject (say, meshes on no bone) still renders, as a static mesh when its skeleton fails, the way an app would show it. Its report keeps the errors.
