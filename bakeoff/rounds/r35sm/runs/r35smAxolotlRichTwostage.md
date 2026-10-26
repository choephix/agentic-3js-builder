<!-- call: stage1 -->

```ts
import * as THREE from "three";
import { createBuilder, catmull, rng } from "agentic-3js-builder";
import type { Builder } from "agentic-3js-builder";

export const meta = {
  name: "Chibi Axolotl",
  description: "A chibi axolotl with a big round head, frilly pink gills, stubby limbs and a finned tail.",
};

export const REQUESTS = [
  { id: "eyeL", kind: "add", part: "head", what: "Left eye: big glossy black bead with two white highlights and a thin dark lid ring.", at: [0.17, 0.4, 0.32], normal: [0.5, 0.3, 0.8], bone: "head", room: [0.12, 0.12, 0.1] },
  { id: "eyeR", kind: "add", part: "head", what: "Right eye mirror of left: glossy bead, highlights, lid ring.", at: [-0.17, 0.4, 0.32], normal: [-0.5, 0.3, 0.8], bone: "head", room: [0.12, 0.12, 0.1] },
  { id: "smile", kind: "add", part: "head", what: "Tiny curved smile line in DARK across the front of the face with small dimple dots at the ends.", at: [0, 0.27, 0.5], normal: [0, 0, 1], bone: "head", room: [0.25, 0.08, 0.06] },
  { id: "nostrils", kind: "add", part: "head", what: "Two tiny nostril dots on top of the snout.", at: [0, 0.35, 0.5], normal: [0, 0.4, 1], bone: "head", room: [0.1, 0.04, 0.04] },
  { id: "cheekBlush", kind: "add", part: "head", what: "Two soft pink blush ovals on the cheeks under the eyes in GILL_LIGHT.", at: [0.24, 0.28, 0.3], normal: [1, 0, 0.5], bone: "head", room: [0.1, 0.07, 0.06] },
  { id: "gillTips", kind: "add", part: "gillL", what: "Small round bead tips in GILL_TIP at the end of every gill stalk, both sides.", at: [0.38, 0.45, -0.02], normal: [1, 0.4, 0], bone: "head", room: [0.3, 0.3, 0.3] },
  { id: "toesFront", kind: "add", part: "armL", what: "Four tiny rounded toes on each front hand, pale pink, splayed forward.", at: [0.36, 0.08, 0.22], normal: [0, 0, 1], bone: "armL", room: [0.12, 0.05, 0.08] },
  { id: "toesBack", kind: "add", part: "legL", what: "Five tiny toes on each hind foot.", at: [0.34, 0.06, -0.3], normal: [0, 0, 1], bone: "legL", room: [0.12, 0.05, 0.08] },
  { id: "tailFin", kind: "add", part: "tail", what: "Ruffled translucent-looking dorsal fin ridge along the tail top with small scalloped edge in FIN.", at: [0, 0.34, -0.7], normal: [0, 1, 0], bone: "tail2", room: [0.1, 0.2, 0.7] },
  { id: "bodyFreckles", kind: "texture", part: "body", what: "Scatter of small darker freckle spots in SKIN_DARK over the back of the body and head top, with pale belly in BELLY." },
  { id: "gillFrills", kind: "texture", part: "gillL", what: "Feathery lighter streaks from GILL to GILL_LIGHT along each gill stalk." },
  { id: "tailMark", kind: "texture", part: "tail", what: "Soft gradient from SKIN to FIN toward tail tip with faint spots." },
];

export const STAGE2: ((b: Builder) => void)[] = [];

const SKIN = "#f4b8c0";
const SKIN_DARK = "#d98c9c";
const BELLY = "#ffe3dc";
const GILL = "#ff5f8f";
const GILL_LIGHT = "#ff9ab8";
const GILL_TIP = "#ffd0de";
const FIN = "#ff9fb4";
const EYE = "#1a1220";
const DARK = "#7a3a52";

export default function build() {
  const b = createBuilder({ name: "axolotl" });
  const R = rng(5);

  const hips = b.joint("hips", { at: [0, 0.2, -0.1], dir: [0, 0, 1], role: "spine" });
  const chest = b.joint("chest", { parent: hips, at: [0, 0.22, 0.12], dir: [0, 0, 1], role: "spine" });
  const head = b.joint("head", { parent: chest, at: [0, 0.27, 0.3], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.2, 0.25], dir: [0, 0, 1], role: "jaw" });

  // body
  b.part(new THREE.SphereGeometry(0.3, 12, 9), SKIN, { bone: hips, at: [0, 0.27, -0.02], scale: [1, 0.8, 1.45], name: "body" });
  b.part(new THREE.SphereGeometry(0.28, 12, 8), BELLY, { bone: hips, at: [0, 0.2, 0.0], scale: [0.85, 0.55, 1.35], name: "belly" });

  // head: wide chibi
  b.part(new THREE.SphereGeometry(0.4, 14, 10), SKIN, { bone: head, at: [0, 0.35, 0.3], scale: [1.15, 0.85, 1.0], name: "head" });
  b.part(new THREE.SphereGeometry(0.3, 10, 8), BELLY, { bone: jaw, at: [0, 0.2, 0.32], scale: [1.0, 0.4, 0.9], name: "jaw" });
  b.part(new THREE.SphereGeometry(0.13, 8, 6), SKIN_DARK, { bone: head, at: [0, 0.6, 0.12], scale: [1.6, 0.6, 1.2], name: "crown" });

  // tail
  const tailPath = catmull([[0, 0.24, -0.35], [0, 0.22, -0.75], [0, 0.2, -1.1], [0, 0.24, -1.4]]);
  const tail = b.chain("tail", tailPath, { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" });
  b.sweep(tail, [0.17, 0.04], { color: SKIN, name: "tail", sectors: [[125, 235, BELLY]] });
  b.along(tail, 6, (at) => b.spike(at, [0, 1, 0], 0.12, 0.05, { color: FIN, caps: { end: "point" } }));

  // limbs
  for (const [side, s] of [["L", 1], ["R", -1]] as const) {
    const arm = b.chain(`arm${side}`, catmull([[s * 0.26, 0.16, 0.2], [s * 0.4, 0.09, 0.28], [s * 0.46, 0.05, 0.38]]), { parent: chest, names: [`shoulder${side}`, `elbow${side}`, `hand${side}`], role: "arm" });
    b.sweep(arm, [0.07, 0.05], { color: SKIN, name: `arm${side}` });
    b.part(new THREE.SphereGeometry(0.07, 8, 6), BELLY, { bone: arm.tip ?? arm.joints[1], at: [s * 0.46, 0.04, 0.4], scale: [1.3, 0.5, 1.2] });
    const leg = b.chain(`leg${side}`, catmull([[s * 0.26, 0.17, -0.38], [s * 0.4, 0.09, -0.36], [s * 0.46, 0.05, -0.26]]), { parent: hips, names: [`hip${side}`, `knee${side}`, `foot${side}`], role: "leg" });
    b.sweep(leg, [0.08, 0.055], { color: SKIN, name: `leg${side}` });
    b.part(new THREE.SphereGeometry(0.075, 8, 6), BELLY, { bone: leg.tip ?? leg.joints[1], at: [s * 0.46, 0.04, -0.24], scale: [1.3, 0.5, 1.2] });

    // gills: three frilly stalks per side
    const gillJ = b.joint(`gill${side}`, { parent: head, at: [s * 0.4, 0.42, 0.18], dir: [s, 0.3, 0], role: "fan" });
    const base: [number, number, number][] = [[s * 0.4, 0.42, 0.18], [s * 0.4, 0.42, 0.18], [s * 0.4, 0.42, 0.18]];
    const tips: [number, number, number][] = [[s * 0.78, 0.78, 0.1], [s * 0.86, 0.5, 0.16], [s * 0.74, 0.2, 0.2]];
    base.forEach((p, i) => {
      const t = tips[i];
      const mid: [number, number, number] = [(p[0] + t[0]) / 2, (p[1] + t[1]) / 2 + 0.06, (p[2] + t[2]) / 2 - 0.04];
      b.sweep(catmull([p, mid, t]), [0.035, 0.012], { color: GILL, bone: gillJ, name: `gill${side}` });
      // frills along stalk
      for (let k = 0; k < 4; k++) {
        const f = 0.3 + k * 0.2;
        const cx = p[0] + (t[0] - p[0]) * f, cy = p[1] + (t[1] - p[1]) * f + 0.03, cz = p[2] + (t[2] - p[2]) * f;
        const dir = [t[1] - p[1] > 0 ? 0.3 : -0.3, 0.8 * (i === 2 ? -1 : 1), 0.8 * (k % 2 ? 1 : -1)];
        b.spike([cx, cy, cz], dir, 0.17 - k * 0.02, 0.016, { color: k % 2 ? GILL_LIGHT : GILL, bone: gillJ, caps: { end: "point" } });
      }
      b.part(new THREE.SphereGeometry(0.025, 6, 4), GILL_TIP, { bone: gillJ, at: t });
    });
  }

  // placeholder eyes so stage 1 reads
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.065, 8, 6), EYE, { bone: head, at: [s * 0.2, 0.45, 0.58], name: "eye" });
    b.part(new THREE.SphereGeometry(0.02, 6, 4), "#ffffff", { bone: head, at: [s * 0.185, 0.48, 0.63] });
  }
  b.part(new THREE.BoxGeometry(0.14, 0.012, 0.01), DARK, { bone: head, at: [0, 0.27, 0.68], name: "mouthLine" });
  void R;

  for (const add of STAGE2) add(b);
  return b.root;
}
```

<!-- call: texture -->

bodyFreckles: a custom paint on the body, with a pale belly where the surface faces down and dark freckle spots on the back, so the spots follow the body's top.
gillFrills: a grain paint on the gill stalks, with streaks running from GILL to GILL_LIGHT along each stalk.
tailMark: a gradient on the tail, with SKIN fading to FIN toward the tip, a pale belly and faint spots.

<<<<<<< SEARCH
const DARK = "#7a3a52";
=======
const DARK = "#7a3a52";

const FRECKLE_FIELD = paint((p, n) => {
  const belly = smoothstep(-0.05, -0.45, n.y);
  const c = cells(p, 0.05, 11);
  const spot = c.id > 0.45 && c.d1 < 0.2 + 0.1 * c.id ? 1 : 0;
  const back = smoothstep(-0.1, 0.5, n.y);
  const base = mix(SKIN, mix(SKIN, "#f9ccd0", 0.5), noise(p, 0.15, 3));
  const withSpots = mix(base, SKIN_DARK, spot * back * 0.9);
  return mix(withSpots, BELLY, belly);
});
const GILL_PAINT = grain(GILL, GILL_LIGHT, { size: 0.02, axis: "y", seed: 4 });
const TAIL_PAINT = paint((p, n) => {
  const t = smoothstep(-0.5, -1.4, p.z);
  const base = mix(SKIN, FIN, t);
  const c = cells(p, 0.07, 21);
  const spot = c.id > 0.55 && c.d1 < 0.22 ? 0.5 * (1 - t * 0.5) : 0;
  const withSpots = mix(base, SKIN_DARK, spot);
  return mix(withSpots, BELLY, smoothstep(-0.2, -0.7, n.y) * (1 - t));
});
>>>>>>> REPLACE

<<<<<<< SEARCH
import { createBuilder, catmull, rng } from "agentic-3js-builder";
=======
import { createBuilder, catmull, rng, paint, mix, noise, cells, smoothstep, grain } from "agentic-3js-builder";
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.part(new THREE.SphereGeometry(0.3, 12, 9), SKIN, { bone: hips, at: [0, 0.27, -0.02], scale: [1, 0.8, 1.45], name: "body" });
=======
  b.part(new THREE.SphereGeometry(0.3, 12, 9), FRECKLE_FIELD, { bone: hips, at: [0, 0.27, -0.02], scale: [1, 0.8, 1.45], name: "body" });
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.sweep(tail, [0.17, 0.04], { color: SKIN, name: "tail", sectors: [[125, 235, BELLY]] });
=======
  b.sweep(tail, [0.17, 0.04], { color: TAIL_PAINT, name: "tail" });
>>>>>>> REPLACE

<<<<<<< SEARCH
      b.sweep(catmull([p, mid, t]), [0.035, 0.012], { color: GILL, bone: gillJ, name: `gill${side}` });
=======
      b.sweep(catmull([p, mid, t]), [0.035, 0.012], { color: GILL_PAINT, bone: gillJ, name: `gill${side}` });
>>>>>>> REPLACE

<!-- call: add1 -->

```ts
import * as THREE from "three";
import { type Builder, svg } from "agentic-3js-builder";

export function addEyeL(b: Builder) {
  const head = "head";
  const eyeTex = svg(
    `<svg viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="30" fill="#2a1a2e"/>
      <circle cx="32" cy="32" r="30" fill="none" stroke="#1a1220" stroke-width="4"/>
      <ellipse cx="32" cy="38" rx="22" ry="16" fill="#3a2442"/>
      <ellipse cx="24" cy="22" rx="9" ry="10" fill="#ffffff"/>
      <circle cx="42" cy="42" r="4.5" fill="#ffffff"/>
      <circle cx="38" cy="34" r="2" fill="#ffd0de"/>
      <path d="M6 24 Q32 -2 58 24" fill="none" stroke="#1a1220" stroke-width="3.5" stroke-linecap="round"/>
    </svg>`,
    { size: 128 },
  );

  const s = 1;
  const at: [number, number, number] = [s * 0.2, 0.45, 0.58];
  const n = new THREE.Vector3(0.45, 0.2, 0.87).normalize();
  const nd: [number, number, number] = [n.x, n.y, n.z];

  // eyeball: glossy dark bead
  b.part(new THREE.SphereGeometry(0.075, 10, 8), EYE, {
    bone: head,
    at: [at[0] - 0.005, at[1], at[2] - 0.005],
    name: "eyeLBall",
  });

  // lid ring: thin torus around the bead
  b.part(new THREE.TorusGeometry(0.072, 0.011, 5, 14), DARK, {
    bone: head,
    at: [at[0] - 0.01, at[1], at[2] - 0.015],
    dir: nd,
    axis: "z",
    name: "eyeLLid",
  });

  // painted face disc with highlights, floating just in front of the bead
  b.part(new THREE.CircleGeometry(0.066, 14), "#ffffff", {
    bone: head,
    at: [at[0] + n.x * 0.07, at[1] + n.y * 0.07, at[2] + n.z * 0.07],
    dir: nd,
    axis: "z",
    texture: eyeTex,
    name: "eyeLFace",
  });

  // hard highlight beads for extra gloss
  b.part(new THREE.SphereGeometry(0.017, 6, 4), "#ffffff", {
    bone: head,
    at: [at[0] + 0.03, at[1] + 0.035, at[2] + 0.05],
    name: "eyeLSpark1",
  });
  b.part(new THREE.SphereGeometry(0.009, 6, 4), "#ffffff", {
    bone: head,
    at: [at[0] - 0.015, at[1] - 0.03, at[2] + 0.062],
    name: "eyeLSpark2",
  });

  // little brow bump above the lid
  b.part(new THREE.SphereGeometry(0.04, 8, 6), SKIN_DARK, {
    bone: head,
    at: [at[0] + 0.01, at[1] + 0.085, at[2] - 0.03],
    scale: [1.5, 0.45, 1],
    name: "eyeLBrow",
  });
}
```

<!-- call: add2 -->

```ts
import * as THREE from "three";
import { type Builder, svg } from "agentic-3js-builder";

export function addEyeR(b: Builder) {
  const EYE_TEX = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="30" fill="#7a3a52"/>
      <circle cx="32" cy="32" r="26" fill="#1a1220"/>
      <ellipse cx="32" cy="40" rx="18" ry="10" fill="#33264a" opacity="0.8"/>
      <circle cx="22" cy="21" r="8" fill="#ffffff"/>
      <circle cx="41" cy="42" r="4" fill="#ffffff"/>
      <circle cx="44" cy="30" r="2" fill="#ffffff" opacity="0.8"/>
      <path d="M6 28 Q32 -2 58 28" stroke="#7a3a52" stroke-width="3" fill="none" stroke-linecap="round"/>
    </svg>`,
    { size: 128 },
  );

  // Right eye (model right = -X), glossy bead sitting on the head
  const eyeAt: [number, number, number] = [-0.2, 0.45, 0.56];
  const dir: [number, number, number] = [-0.45, 0.25, 0.85];
  b.part(new THREE.SphereGeometry(0.075, 10, 8), EYE, { bone: "head", at: eyeAt, name: "eyeR.bead" });
  // drawn face with highlights, facing outward
  b.part(new THREE.CircleGeometry(0.07, 16), "#ffffff", {
    bone: "head",
    at: [eyeAt[0] - 0.03, eyeAt[1] + 0.01, eyeAt[2] + 0.062],
    dir,
    axis: "z",
    texture: EYE_TEX,
    name: "eyeR.face",
  });
  // lid ring
  b.part(new THREE.TorusGeometry(0.078, 0.008, 5, 14), DARK, {
    bone: "head",
    at: [eyeAt[0] - 0.015, eyeAt[1] + 0.005, eyeAt[2] + 0.035],
    dir,
    axis: "z",
    name: "eyeR.lid",
  });
  // little brow bump above eye
  b.part(new THREE.SphereGeometry(0.04, 6, 4), SKIN_DARK, {
    bone: "head",
    at: [eyeAt[0] - 0.01, eyeAt[1] + 0.08, eyeAt[2] - 0.02],
    scale: [1.4, 0.5, 1],
    name: "eyeR.brow",
  });

  // Smile: curved line of small segments across the front of the face
  const n = 9;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1) - 0.5;
    const x = t * 0.24;
    const y = 0.27 - 0.03 + 0.12 * t * t * 4 * 0.25 * 4 * 0.5;
    const z = 0.5 + 0.18 - 0.5 * x * x;
    b.part(new THREE.BoxGeometry(0.03, 0.01, 0.01), DARK, {
      bone: "head",
      at: [x, y + 0.01, z],
      rotation: [0, 0, t * -40],
      name: "smile.seg",
    });
  }
  // dimple dots at the ends
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.012, 6, 4), DARK, {
      bone: "head",
      at: [s * 0.14, 0.31, 0.665 - 0.02],
      name: "smile.dimple",
    });
  }
}
```

<!-- call: add3 -->

```ts
import * as THREE from "three";
import { type Builder } from "agentic-3js-builder";

export function addNostrils(b: Builder) {
  const NOSTRIL_RIM = "#e9909f";
  const HIGHLIGHT = "#ffffff";
  const headSurface = b.surface(b.root);
  for (const s of [1, -1]) {
    // seat each nostril on the snout surface by raycasting down onto the head
    const origin: [number, number, number] = [s * 0.045, 0.75, 0.5];
    const hit = headSurface.ray(origin, [0, -1, 0]) ?? headSurface.nearest([s * 0.045, 0.35, 0.5]);
    // raised rim bump around the nostril
    b.stick(new THREE.SphereGeometry(0.019, 8, 6), NOSTRIL_RIM, hit, { embed: 0.45, scale: [1.2, 0.6, 1], bone: "head", name: "nostrilRim" });
    // dark hole
    const hole = hit.moved([0, 0.006, 0]);
    b.stick(new THREE.SphereGeometry(0.011, 8, 6), DARK, hole, { embed: 0.4, scale: [1.1, 0.5, 0.9], bone: "head", name: "nostril" });
    // tiny glint
    b.stick(new THREE.SphereGeometry(0.003, 4, 3), HIGHLIGHT, hole.moved([s * 0.003, 0.004, 0.002]), { embed: 0.2, bone: "head", name: "nostrilGlint" });
  }
}
```

<!-- call: add4 -->

```ts
import * as THREE from "three";
import { type Builder, svg } from "agentic-3js-builder";

export function addCheekBlush(b: Builder) {
  const blush = svg(
    `<svg viewBox="0 0 64 40"><defs><radialGradient id="g"><stop offset="0" stop-color="#ff9ab8" stop-opacity="1"/><stop offset="0.7" stop-color="#ff9ab8" stop-opacity="0.9"/><stop offset="1" stop-color="#ff9ab8" stop-opacity="0.55"/></radialGradient></defs>
    <ellipse cx="32" cy="20" rx="29" ry="17" fill="url(#g)"/>
    <path d="M18 14 l5 -4 M28 11 l5 -4 M38 11 l5 -4" stroke="#ff5f8f" stroke-width="3" stroke-linecap="round" fill="none"/></svg>`,
    { size: 128 },
  );
  const head = b.surface(b.root);
  for (const s of [1, -1]) {
    const hit = head.nearest(new THREE.Vector3(s * 0.34, 0.3, 0.38));
    b.decal(head, blush, {
      at: hit,
      dir: [s * 0.75, 0.05, 0.6],
      size: [0.13, 0.085],
      bone: "head",
      lift: 0.004,
      mirror: s > 0,
      name: "s24blush",
    });
  }

  // gill bead tips with a small glossy highlight
  for (const side of ["L", "R"]) {
    const s = side === "L" ? 1 : -1;
    const tips: [number, number, number][] = [
      [s * 0.78, 0.78, 0.1],
      [s * 0.86, 0.5, 0.16],
      [s * 0.74, 0.2, 0.2],
    ];
    for (const t of tips) {
      b.part(new THREE.SphereGeometry(0.05, 8, 6), GILL_TIP, {
        bone: `gill${side}`,
        at: t,
        name: "s24tip",
      });
      b.part(new THREE.SphereGeometry(0.015, 5, 4), "#ffffff", {
        bone: `gill${side}`,
        at: [t[0] + s * 0.01, t[1] + 0.025, t[2] + 0.03],
        name: "s24tipShine",
      });
    }
  }
}
```

<!-- call: add5 -->

```ts
import * as THREE from "three";
import { type Builder } from "agentic-3js-builder";

export function addToesFront(b: Builder) {
  const TOE = "#ffc9d3";
  const TIP = "#ff9ab8";
  const PAD = "#f2a3b4";
  for (const s of [1, -1]) {
    const side = s === 1 ? "L" : "R";
    const bone = `arm${side}`;
    // hand centre in stage 1: x = s*0.46, y ~0.05, z ~0.38
    const cx = s * 0.46;
    const cz = 0.4;
    // pad under the hand
    b.part(new THREE.SphereGeometry(0.05, 8, 6), PAD, {
      bone: `hand${side}`,
      at: [cx, 0.032, cz + 0.01],
      scale: [1.4, 0.35, 1.1],
      name: `palm${side}`,
    });
    // four splayed toes
    for (let i = 0; i < 4; i++) {
      const f = (i - 1.5) / 1.5; // -1..1
      const ang = f * 0.5;
      const bx = cx + s * 0 + f * 0.04;
      const base: [number, number, number] = [bx, 0.04, cz + 0.03];
      const dir: [number, number, number] = [Math.sin(ang) * 1, -0.05, Math.cos(ang)];
      const len = 0.075 - Math.abs(f) * 0.012;
      b.spike(base, dir, len, 0.017, TOE, { bone: `hand${side}`, caps: { end: "round" }, sides: 6, name: `toe${side}${i}` });
      const tip: [number, number, number] = [
        base[0] + dir[0] * len,
        base[1] + dir[1] * len,
        base[2] + dir[2] * len,
      ];
      b.part(new THREE.SphereGeometry(0.02, 6, 4), TIP, {
        bone: `hand${side}`,
        at: tip,
        scale: [1, 0.8, 1],
        name: `toeTip${side}${i}`,
      });
    }
  }
}
```

<!-- call: add6 -->

```ts
import * as THREE from "three";
import { type Builder, catmull, frame, rng } from "agentic-3js-builder";

export function addToesBack(b: Builder) {
  const R = rng(26);
  const TOE = "#ffd0d8";
  const FIN_EDGE = "#ff7fa0";
  const NAIL = "#f2a0b0";

  // ---- hind toes: five per foot, splayed forward, plus little webbing pads
  for (const s of [1, -1]) {
    const side = s === 1 ? "L" : "R";
    const bone = `leg${side}`;
    const foot = new THREE.Vector3(s * 0.46, 0.04, -0.24);
    for (let i = 0; i < 5; i++) {
      const a = ((i - 2) / 2) * 0.62; // splay angle
      const dir = new THREE.Vector3(Math.sin(a) * s * 0.9 + s * 0.15, -0.06, Math.cos(a)).normalize();
      const len = 0.075 - Math.abs(i - 2) * 0.008;
      const base = foot.clone().add(new THREE.Vector3(((i - 2) * 0.026) * 1.0, 0, 0.05));
      const tip = base.clone().addScaledVector(dir, len);
      b.rod(base, tip, [0.017, 0.012], TOE, { bone, caps: "round", sides: 6, name: `toe${side}${i}` });
      b.part(new THREE.SphereGeometry(0.014, 6, 4), NAIL, {
        bone,
        at: tip.clone().addScaledVector(dir, 0.006),
        scale: [1, 0.7, 1.1],
        name: `toeTip${side}${i}`,
      });
    }
    // palm pad behind the toes
    b.part(new THREE.SphereGeometry(0.05, 8, 6), TOE, {
      bone,
      at: [foot.x, 0.035, foot.z + 0.03],
      scale: [1.5, 0.45, 1],
      name: `pad${side}`,
    });
  }

  // ---- tail dorsal fin: ruffled scalloped ridge
  const tailBone = "tail2";
  const baseY = 0.34;
  const zs: number[] = [];
  for (let z = -0.42; z >= -1.36; z -= 0.055) zs.push(z);
  zs.forEach((z, i) => {
    const t = i / (zs.length - 1);
    // body height under the fin follows the tail taper
    const ridgeY = 0.4 - 0.16 * t + (z < -1.1 ? 0.03 * (-1.1 - z) * 2 : 0);
    const h = (0.17 - 0.07 * t) * (0.85 + 0.3 * R());
    const sway = Math.sin(i * 0.9) * 0.025;
    const base = new THREE.Vector3(0, Math.min(ridgeY, baseY) - 0.02 + (1 - t) * 0.02, z);
    // scallop: a leaning cone-ish fin ray, two crossed for ruffle
    const lean = new THREE.Vector3(sway * 2, 1, -0.25).normalize();
    b.spike(base, lean, h, 0.026 - 0.008 * t, {
      color: i % 2 ? FIN : FIN_EDGE,
      bone: tailBone,
      caps: { end: "point" },
      sides: 5,
      name: "finRay",
    });
  });
  // continuous base ridge under the rays
  const ridge = catmull(
    zs
      .filter((_, i) => i % 3 === 0)
      .map((z, k) => {
        const t = (k * 3) / (zs.length - 1);
        return [0, 0.36 - 0.17 * t, z] as [number, number, number];
      }),
  );
  b.sweep(ridge, [0.03, 0.012], { color: FIN, bone: tailBone, name: "finBase", sides: 6 });

  // tiny scalloped bubbles along the fin edge
  for (let i = 1; i < zs.length; i += 2) {
    const t = i / (zs.length - 1);
    const h = 0.17 - 0.07 * t;
    b.part(new THREE.SphereGeometry(0.02, 6, 4), "#ffc2d2", {
      bone: tailBone,
      at: [0, 0.4 - 0.16 * t + h * 0.9, zs[i] - 0.03],
      name: "finBead",
    });
  }

  // fin along tail tip
  b.part(new THREE.SphereGeometry(0.05, 8, 6), FIN, {
    bone: "tail3",
    at: [0, 0.24, -1.45],
    scale: [0.4, 1.2, 1.2],
    name: "tailTipFin",
  });
  void frame;
}
```