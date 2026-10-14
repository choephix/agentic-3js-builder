```ts
// A nine-banded armadillo at rest. The carapace is one loft painted with rows of staggered scutes across nine
// movable bands, each band edged by a raised ridge. The head has a tiled shield, a pink snout and a hinged lower
// jaw. Four short legs end in claws, and the tail is ringed.
import * as THREE from "three";
import {
  bezier,
  catmull,
  createBuilder,
  mix,
  mottle,
  paint,
  resolve,
  rng,
  scales,
  smoothstep,
} from "agentic-3js-builder";
import type { Builder, Joint } from "agentic-3js-builder";

export const meta = {
  name: "Armadillo",
  description:
    "A nine-banded armadillo at rest: a banded carapace, a long snout with a hinged jaw, clawed legs and a ringed tail.",
};

const SHELL_Y = 0.11; // height of the carapace's centre line
const SHELL_RADIUS = 0.08; // about half the carapace's width, for the scute pattern
const BAND_Z0 = -0.13; // the nine movable bands run from here...
const BAND_Z1 = 0.035; // ...to here
const BANDS = 9;
const BAND_PITCH = (BAND_Z1 - BAND_Z0) / BANDS;
const TILE = 0.026; // scute width around the body
const BAND_TILES = ["#a88662", "#957353", "#b39272", "#876a4d"];
const GROOVE = "#3a2a1f";
const SKIN_BELLY = "#c9a293";
const CLAW = "#e7dcc4";
const PAD = "#62493b";
const RIDGE = "#6e5442";
const EYE = "#15100d";
const GLINT = "#fbf6ec";
const NOSE = "#43302d";
const EAR = "#7e6453";
const JAW = "#c79c8f";

/** A stable 0..1 number for integer cell coordinates. */
function hash(i: number, j: number) {
  let h = Math.imul(i, 374761393) ^ Math.imul(j + 101, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** The colour of the carapace inside the band zone at fraction f: staggered rows of rectangular scutes. */
function bandColor(p: THREE.Vector3, f: number) {
  const k = Math.floor(f);
  const fz = f - k;
  const u = (Math.atan2(p.x, p.y - SHELL_Y) * SHELL_RADIUS) / TILE + 0.5 + (k % 2 ? 0.5 : 0);
  const col = Math.floor(u);
  const fu = u - col;
  const tone = BAND_TILES[Math.floor(hash(k, col) * BAND_TILES.length)];
  const groove = 1 - smoothstep(0.0006, 0.0016, Math.min(fz, 1 - fz) * BAND_PITCH);
  const seam = 1 - smoothstep(0.0006, 0.0015, Math.min(fu, 1 - fu) * TILE);
  return mix(tone, GROOVE, Math.max(groove, seam) * 0.9);
}

/** A curved claw swept through four points (base, two controls, tip), tapering to a point, rigid on `bone`. */
function claw(b: Builder, bone: Joint, group: string, points: number[][], radius: number[]) {
  b.sweep(bezier(points[0], points[1], points[2], points[3]), radius, {
    color: CLAW,
    bone,
    sides: 5,
    caps: { start: "round", end: "point" },
    group,
  });
}

export default function armadillo() {
  const b = createBuilder({ name: "armadillo", paintSize: 1024 });
  const random = rng(7);

  // ---- Surfaces -----------------------------------------------------------------------------------------------
  const plates = scales(["#917258", "#7e614a", "#9b7c5e"], "#3a2a1e", { size: 0.011, width: 0.16, seed: 4 });
  const carapacePaint = paint((p, n) => {
    const f = (p.z - BAND_Z0) / BAND_PITCH;
    const base = f >= 0 && f < BANDS ? bandColor(p, f) : resolve(plates, p, n);
    return mix(base, SKIN_BELLY, smoothstep(-0.2, -0.55, n.y));
  });

  const sc