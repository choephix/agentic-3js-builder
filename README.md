# agentic-3js-builder

A TypeScript SDK for writing primitive-built, skeleton-rigged three.js models in code, designed to be driven by language models. You describe the model in model space; the SDK builds joints, tubes, membranes, outlines, paints, textures and cards, and returns a plain `THREE.Object3D` tree that meets the Nilo Creature Lab contract. It grew out of Nilo Creature Lab (`~/workspace/nilo-creature-lab`), whose harness renders and checks every sample.

## Layout

| Path        | What it is                                                                                                                                  |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/`      | The generic SDK: skeleton, shapes, surfaces, paint, textures, cards, decals, rig answer key. Style-neutral.                                 |
| `kits/`     | Opinionated style kits built on top of `src/` (`pixel`, `toon`, `clockwork`). `src/` never imports a kit; a model imports the one it wants. |
| `samples/`  | The sample library: one script per model, each with a build record (`<slug>.build.json`).                                                   |
| `showcase/` | The local and published viewer for the samples.                                                                                             |
| `harness/`  | The render harness: bakes a model into one mesh and atlas, checks it, renders the review shots and exports the GLBs.                        |
| `scripts/`  | `snap` (harness render), `preview` (quick inspection), `provenance` (build records), `typecheck`, `sheet`.                                  |
| `docs/`     | Agent guidance (`api.md`, `conventions.md`), design notes (`DESIGN.md`) and project status (`STATUS.md`).                                   |

## Documentation

Agents get the guidance docs, not this README:

- [`GUIDE.md`](GUIDE.md): the brief for a builder agent with one subject: the sample contract, the model conventions and the build loop.
- [`docs/api.md`](docs/api.md): the full API reference.
- [`docs/conventions.md`](docs/conventions.md): coordinates, sections, paint coordinates, cards and bounds, the behaviours to know before building.
- [`kits/pixel.md`](kits/pixel.md), [`kits/toon.md`](kits/toon.md), [`kits/clockwork.md`](kits/clockwork.md): one per style kit. [`kits/glow.md`](kits/glow.md): self-lit parts in any style.

For people: [`docs/DESIGN.md`](docs/DESIGN.md) explains why each helper exists, with the evidence from the builds that shaped it; [`docs/STATUS.md`](docs/STATUS.md) is the project history and to-do list.

A production app with its own agent setup hands its agents `docs/api.md`, `docs/conventions.md` and any kit docs it uses, plus its own brief in place of `GUIDE.md`.

## Development

```
npm install
npm run typecheck        # src, kits, samples and showcase
npm run typecheck -- <slug | path.ts> ...   # only those files and their imports
npm run showcase         # dev server with hot reload
npm run showcase:build   # static build in showcase/dist
npm run snap -- <slug | path.ts> v01   # render through harness/: contact sheet, report, GLBs
npm run preview -- <slug | path.ts> [--shot]   # about a second: textures, parts with bounds, floor check, quick shots
npm run preview -- <slug | path.ts> [--gap <A> <B>]...   # surface distance between two parts, groups or bones
npm run preview -- <slug | path.ts> [--bones <A>]...      # which bones move a part, group or bone, by share
npm run preview -- <slug | path.ts> [--box <A>]...        # world bounds, size and centre of a part, group or bone
npm run sheet -- <slug | slug@tag> ... [--view three-quarter]   # collage of rendered shots (samples or versions)
npm run provenance       # rewrite samples/*.build.json from the session logs
```

`snap` renders on the shared NVIDIA Chromium (port 9333) and writes the contact sheet, shots, report and GLBs to `~/tmp/public/nilo/agentic-3js-builder/snaps/<slug>/` (arm B with joints, A for plain objects). It needs `~/workspace/nilo-creature-lab` checked out; its `harness/snap.ts` reads `CREATURE_LAB_DIR` for the output folder.

`preview` builds the model in the same Chromium and writes every texture (each drawing and the paint sheet) as PNG, a parts table with world bounds, the parts sunk into the floor deeper than 2% of the model's height and, with `--shot`, a three-quarter and a front image to `~/tmp/public/nilo/agentic-3js-builder/preview/<slug>/`. It never counts as a render. Both commands take a file path as well as a slug, so a throwaway file under `scratch/` (gitignored) renders without joining `samples/`.

## Samples and showcase

`samples/` is the sample library: small scripts, not exported models. The showcase runs a script and shows what it returns.

The sample contract:

- One ES module per sample, `samples/<slug>.ts` (lowerCamel slug). It imports `three` and, if it wants, the SDK by relative path (`../src/builder`).
- It default-exports a function that takes no arguments and returns a `THREE.Object3D`.
- It may export `meta = { name, description?, builtBy? }`. The showcase lists it by `meta.name`, falling back to the slug. The header's "by" line comes from the build record (below); `builtBy` shows only for a sample without one.
- Anything goes: creatures, people, props, environments. The SDK and a skeleton are optional; `samples/lantern.ts` is plain three.js.
- Samples are part of the codebase: `tsc` checks them, and an SDK change that breaks a sample updates the sample in the same change.
- `samples/<slug>.build.json` records how the sample was built. `npm run provenance` writes it from the omp session log of the agent that first wrote the file and the harness reports of its tags. It holds the builder, model, effort, provider, cost, wall and active time, tokens, calls, edits, typechecks, snapshot tags, report issues, dropped connections and later editors. Values the logs can't give are null, with the reason in `caveats`. Builders don't write it. The fields are documented in `showcase/builds.ts`.
- Its `versions` list every rendered tag on disk with the session, model and effort that rendered it: the logged shell call that was running the harness when the tag's contact sheet was written, so loops and computed tags count too. The Versions panel shows it per tag.

```ts
import { createBuilder } from "../src/builder";

export const meta = { name: "Wyvern", description: "Bat-winged wyvern with bird legs.", builtBy: "SDK author" };

export default function build() {
  const b = createBuilder({ name: "wyvern" });
  // ...
  return b.root;
}
```

The showcase (`showcase/`, Vite with plain TypeScript, `npm run showcase`) discovers every `samples/*.ts`, including guide-test builds, and shows one at a time, framed like the harness renders. It is also published at [agentic-3d-builder-sdk-showcase.netlify.app](https://agentic-3d-builder-sdk-showcase.netlify.app/). Everything about the view lives in the URL (`#redFox?mode=bones&skeleton&bend=40&panel=tree`); press `?` for the keys.

- **Sample list**: two columns of thumbnails, newest sample first (by the creation time in its build record, else its file's birth time); hover one for its name. The list shows from file names before any sample is imported, loads its images as they scroll into view, and takes each sample's `meta.name` once the open sample is in. Opening a sample shows its thumbnail on the stage while it builds, then fades to the live view. The page draws each thumbnail in the Shaded view, cropped to the sample, and the dev server keeps it in `showcase/public/thumbs/` (committed) under a hash of the sample, the SDK and the showcase's drawing code; a thumbnail whose hash no longer matches stays up until its redraw lands, which waits for a pause in input. `npm run showcase:build` ships the kept thumbnails; on the published site a missing one is drawn for the visit.
- **View**: Shaded, Bones (false colour by owning bone; smooth-skinned parts blend by weight) or Groups; a skeleton x-ray; wireframe. Outside Shaded, hover a part for its bone, group and skin weights. Click a part, or a row in any list, to single out that part, bone (weight paint) or group.
- **Bend test**: bends every bone but the root by a seeded random angle, up to ±28° per axis like the harness flex shots, as a wiggle or at a chosen amount. Skinned parts deform through their `skinIndex` / `skinWeight`; rigid parts ride their joint.
- **Panels**, closed by default: Info (meta, live stats, colours, latest render vs live, and a collapsed Build section from the build record), Tree (joint tree, part groups, every part with its bone and group), Rig (`root.userData.rig`: chains, hinges, rings, with contacts and hinge axes drawn in the view), Code (the source, or a diff between any rendered version and live), Versions (every `npm run snap` tag with its report numbers, sheet, shots and the latest GLBs to download) and Textures.
- **Textures** (`X`): every texture the live sample uses (the paint sheet, each SVG drawing), shown upright over a checkerboard with the UV wireframes of the parts that use it; hover a part to single out its UVs and the part itself, click the picture to enlarge it. Below, the atlas of the latest render, the one texture the exported GLBs carry, with its colour block and every tile outlined as you hover its row. `npm run snap` saves that atlas as `<tag>-atlas.png` beside the shots, and the report's `atlas.layout` says where each tile sits.
- **Builds** (`P`, or the table icon beside the sample list header): every sample's builder, model, effort, cost, time, tokens, calls, edits, tags and report issues in one sortable table. Hovering a sample in the list shows its model, cost and time.
- An error thrown while loading or building a sample shows in the page, with its stack mapped to source lines, without affecting other samples. Editing a sample, or any SDK file it imports, re-runs it in place and keeps the camera; a sample file added to or removed from `samples/` joins or leaves the list without a restart; new renders appear as they land.
