```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  aim,
  catmull,
  polyline,
  bezier,
  limb,
  paint,
  mix,
  noise,
  smoothstep,
  grain,
  mottle,
  svg,
} from "agentic-3js-builder";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Dwarf Blacksmith",
  description:
    "Warcraft-style Ironforge dwarf smith: braided fire-red beard, goggles and mohawk, bronze pauldrons, leather apron, raised runed hammer, tongs with a glowing billet, anvil on a stump. Fully rigged rest pose with jaw and fingers.",
};

// ---------------------------------------------------------------------------------------------------------
// Palette and paints

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const sf = (s: number) => (s > 0 ? "L" : "R");
type Tri = [number, number, number];
const shade = (c: readonly [number, number, number], k: number): Tri => [c[0] * k, c[1] * k, c[2] * k];

const GOLD = "#e2b04a";
const DARK_LEATHER = "#3c2414";
const LEATHER = "#74482a";
const SOLE = "#22160e";
const BEARD_MID = "#d2561c";
const BEARD_DARK = "#8a2c12";
const BROW = "#c8501a";
const IRON_FLAT = "#43454f";
const CHEEK = "#dd8a6a";
const NOSE_C = "#d9795a";
const LIP = "#b3584a";
const MOUTH = "#2a0f10";
const LENS = "#88d8ea";
const BILLET = "#ff6a1a";
const BILLET_HOT = "#ffd27a";
const RAG = "#b9a57a";

const SKIN = paint((p, n) => {
  const c = mix("#cf8a62", "#e3a37a", noise(p, 0.06, 3));
  return shade(c, 0.85 + 0.15 * smoothstep(-0.6, 0.8, n.y));
});
const BEARD = paint((p, n) => {
  const strands = 0.5 + 0.5 * Math.sin(p.x * 130 + noise(p, 0.15, 4) * 6 + p.y * 14);
  const t = smoothstep(1.2, 0.85, p.y);
  let c = mix(mix(BEARD_DARK, BEARD_MID, t), "#ffa23a", t * 0.55 * strands);
  c = mix(c, "#e9d9bd", smoothstep(0.74, 0.86, noise(p, 0.05, 9)) * 0.7 * t);
  return shade(c, 0.88 + 0.12 * smoothstep(-0.7, 0.6, n.y));
});
const HAIR = paint((_p, _n, s) => mix("#7a2410", "#ff9a3a", smoothstep(0, 0.13, s[1])));
const SHIRT = mottle("#2e4a88", "#4163a8", { size: 0.06, seed: 4 });
const TROUSER = mottle("#5b4030", "#6e4d38", { size: 0.05, seed: 2 });
const BOOT = grain("#3a2416", "#5a3a22", { size: 0.02, axis: "y" });
const BRACER = grain("#7a4c26", "#9a653a", { size: 0.015, axis: "y" });
const WOODH = grain("#6b4426", "#94663a", { size: 0.012, axis: "y" });
const APRON = paint((p, n, s) => {
  const base = mix("#6e4526", "#87582e", noise(p, 0.05, 7));
  const c = mix(base, "#2c1c12", smoothstep(-0.2, -0.5, s[1]) * 0.55);
  if (n.z > 0.5 && Math.abs(Math.abs(s[0]) - 0.18) < 0.004 && (((s[1] / 0.02) % 1) + 1) % 1 < 0.55) return "#d9c38a";
  return c;
});
const BRONZE = metal("bronze", { polish: 0.4, tarnish: 0.2 });
const PLATE = panelled(metal("bronze", { polish: 0.45, tarnish: 0.15 }), { size: 0.07, rivets: 0.03 });
const GILT = metal("gilt");
const STEEL = metal("steel");
const IRON = metal("iron");
const BLUED = metal("blued");
const STEEL_POL = metal("steel", { polish: 0.8 });

// ---------------------------------------------------------------------------------------------------------
// Textures

const EYE = svg(
  `<svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
<defs><clipPath id="e"><path d="M5 36 Q50 -4 95 36 Q50 60 5 36Z"/></clipPath></defs>
<path d="M5 36 Q50 -4 95 36 Q50 60 5 36Z" fill="#f2e6d2"/>
<g clip-path="url(#e)">
<circle cx="52" cy="33" r="24" fill="#2f78c4"/>
<circle cx="52" cy="44" r="22" fill="#5eb4e6" opacity="0.7"/>
<circle cx="52" cy="33" r="12" fill="#0d1018"/>
<circle cx="44" cy="25" r="6" fill="#ffffff"/>
<circle cx="60" cy="40" r="2.6" fill="#ffffff"/>
</g>
<path d="M5 36 Q50 -4 95 36" fill="none" stroke="#2a140c" stroke-width="8" stroke-linecap="round"/>
<path d="M8 38 Q50 62 92 38" fill="none" stroke="#6b3a24" stroke-width="3"/>
</svg>`,
  { size: 192 },
);
const TUFT = svg(
  `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#8c2c10"/><stop offset="0.5" stop-color="#d2561c"/><stop offset="1" stop-color="#ffb04a"/></linearGradient></defs>
<path d="M16 64 C3 50 5 24 17 0 C27 22 29 48 16 64Z" fill="url(#g)"/>
<path d="M16 60 C12 44 14 24 17 6" stroke="#7a2410" stroke-width="2" fill="none" opacity="0.6"/>
<path d="M21 58 C22 44 22 30 19 14" stroke="#ffd080" stroke-width="1.6" fill="none" opacity="0.7"/>
</svg>`,
  { size: 128 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<circle cx="50" cy="50" r="46" fill="#4a2e18" stroke="#e2b04a" stroke-width="6"/>
<circle cx="50" cy="50" r="38" fill="none" stroke="#b8862e" stroke-width="2.5"/>
<path d="M22 50 H68 Q78 50 86 56 Q74 58 66 60 L60 62 V70 H70 V78 H30 V70 H40 V62 L34 60 Q26 58 22 50Z" fill="#e2b04a" stroke="#2a1608" stroke-width="2.5" stroke-linejoin="round"/>
<rect x="33" y="14" width="34" height="15" rx="2" fill="#c8d0dc" stroke="#2a1608" stroke-width="2.5"/>
<rect x="47" y="29" width="6" height="18" fill="#7a4a24" stroke="#2a1608" stroke-width="2"/>
</svg>`,
  { size: 192 },
);
const RUNE = svg(
  `<svg viewBox="0 0 96 48" xmlns="http://www.w3.org/2000/svg">
<g stroke="#ffb347" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none">
<path d="M16 6 V42 M16 14 L28 22 M16 26 L28 34"/>
<path d="M54 6 L40 24 L54 42 M40 24 H64"/>
<path d="M76 6 L88 24 L76 42 M88 6 V42"/>
</g></svg>`,
  { size: 192 },
);
const ANVILMARK = svg(
  `<svg viewBox="0 0 120 30" xmlns="http://www.w3.org/2000/svg">
<text x="60" y="23" text-anchor="middle" font-family="serif" font-weight="bold" font-size="22" letter-spacing="3" fill="#e2b04a" stroke="#4a3010" stroke-width="1">IRONFORGE</text>
</svg>`,
  { size: 256 },
);

// ---------------------------------------------------------------------------------------------------------

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "dwarf_blacksmith" });
  type J = ReturnType<typeof b.joint>;
  type C = ReturnType<typeof b.chain>;
  type Col = string | ReturnType<typeof paint>;
  const AZ = 0.62; // anvil z

  const ell = (c: number[] | THREE.Vector3, r: [number, number, number], color: Col, bone: J) =>
    b.part(new THREE.SphereGeometry(1, 10, 8), color, { at: c, scale: r, bone });
  const box = (c: number[] | THREE.Vector3, size: [number, number, number], color: Col, bone: J) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at: c, bone });
  const arr = (a: number[]) => (t: number) => {
    const x = Math.min(Math.max(t, 0), 1) * (a.length - 1);
    const i = Math.min(Math.floor(x), a.length - 2);
    return a[i] + (a[i + 1] - a[i]) * (x - i);
  };

  // ------------------------------------------------------------------ skeleton
  const hips = b.joint("hips", { at: [0, 0.56, 0.03], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.56, 0.03],
      [0, 0.71, 0.05],
      [0, 0.88, 0.05],
      [0, 1.04, 0.03],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.chain(
    "neckChain",
    polyline([
      [0, 1.04, 0.03],
      [0, 1.15, 0.06],
    ]),
    { parent: chest, names: ["neck"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[0], at: [0, 1.15, 0.06], dir: [0, 0.45, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.2, 0.07], aim: [0, 1.17, 0.2], role: "jaw" });

  // ------------------------------------------------------------------ torso
  b.part(new THREE.SphereGeometry(1, 10, 8), TROUSER, { at: [0, 0.52, 0.03], scale: [0.2, 0.14, 0.15], bone: hips });
  const torso = b.loft(
    [
      { at: [0, 0.55, 0.04], w: 0.36, h: 0.26 },
      { at: [0, 0.68, 0.05], w: 0.44, h: 0.3 },
      { at: [0, 0.86, 0.05], w: 0.5, h: 0.3 },
      { at: [0, 1.0, 0.04], w: 0.54, h: 0.27 },
      { at: [0, 1.07, 0.04], w: 0.32, h: 0.2 },
    ],
    { bone: spine, color: SHIRT },
  );
  for (const s of [1, -1]) ell([s * 0.2, 1.0, 0.03], [0.12, 0.09, 0.12], SHIRT, chest);
  b.sweep(neck, [0.105, 0.09], { color: SKIN });

  const tskin = b.surface(torso);
  const belt = b.sweep(tskin.loop([0, 0.63, 0.05], { dir: [0, 1, 0], lift: 0.012 }), 0.03, {
    color: DARK_LEATHER,
    bone: spine.joints[0],
  });
  b.along(tskin.loop([0, 0.63, 0.05], { dir: [0, 1, 0], lift: 0.04 }), 20, (at) =>
    b.part(new THREE.SphereGeometry(0.011, 5, 4), GOLD, { at, bone: spine.joints[0] }),
  );
  const bskin = b.surface(belt);
  const buckle = bskin.ray([0, 0.63, 1], [0, 0, -1]);
  if (buckle) {
    b.stick(new THREE.BoxGeometry(0.1, 0.022, 0.075), GILT, buckle, { embed: 0.1, bone: spine.joints[0] });
    b.stick(new THREE.BoxGeometry(0.06, 0.02, 0.04), "#3a2a18", buckle.moved([0, 0.012, 0]), {
      embed: 0.1,
      bone: spine.joints[0],
    });
  }
  for (const s of [1, -1]) {
    const h = bskin.ray([s * 1, 0.63, 0.1], [-s, 0, 0]);
    if (h) {
      b.stick(new THREE.BoxGeometry(0.08, 0.06, 0.1), LEATHER, h, { embed: 0.15, bone: spine.joints[0] });
      b.stick(new THREE.BoxGeometry(0.085, 0.066, 0.04), DARK_LEATHER, h.moved([0, 0.012, 0.03]), {
        embed: 0.1,
        bone: spine.joints[0],
      });
    }
  }
  // rag hanging from the belt
  b.extrude(
    [
      [-0.04, 0],
      [0.04, 0],
      [0.04, -0.14],
      [0.02, -0.12],
      [0, -0.15],
      [-0.02, -0.12],
      [-0.04, -0.14],
    ],
    { at: [-0.16, 0.61, 0.262], x: [1, 0, 0], thickness: 0.01, color: RAG, bone: spine.joints[0] },
  );

  // apron
  b.extrude(
    [
      [-0.13, 0],
      [-0.135, -0.12],
      [-0.2, -0.2],
      [-0.2, -0.5],
      [-0.1, -0.54],
      [0.1, -0.54],
      [0.2, -0.5],
      [0.2, -0.2],
      [0.135, -0.12],
      [0.13, 0],
    ],
    { at: [0, 1.0, 0.215], x: [1, 0, 0], thickness: 0.03, bevel: 0.006, color: APRON, bone: spine.joints[1] },
  );
  b.part(new THREE.PlaneGeometry(0.15, 0.15), "#ffffff", {
    at: [0, 0.72, 0.2305],
    dir: [0, 0, 1],
    axis: "z",
    texture: EMBLEM,
    bone: spine.joints[1],
  });
  box([0, 0.5, 0.236], [0.14, 0.06, 0.012], DARK_LEATHER, spine.joints[1]);
  for (const s of [1, -1]) {
    b.sweep(
      tskin.drape(
        polyline([
          [s * 0.11, 0.99, 0.19],
          [s * 0.13, 1.05, 0.12],
          [s * 0.14, 1.075, 0.02],
          [s * 0.13, 1.04, -0.1],
          [s * 0.1, 0.95, -0.15],
        ]),
        { lift: 0.014 },
      ),
      0.016,
      { color: DARK_LEATHER, bone: chest },
    );
    b.part(new THREE.SphereGeometry(0.018, 6, 5), GOLD, { at: [s * 0.11, 0.985, 0.235], bone: spine.joints[1] });
  }

  // ------------------------------------------------------------------ head
  const HC = V(0, 1.275, 0.05);
  const hp = (x: number, y: number, z: number): Tri => [HC.x + x, HC.y + y, HC.z + z];
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), SKIN, {
    at: hp(0, 0, 0),
    scale: [0.158, 0.15, 0.152],
    bone: head,
  });
  const hskin = b.surface(skull);
  for (const s of [1, -1]) {
    ell(hp(s * 0.1, -0.05, 0.09), [0.055, 0.05, 0.05], CHEEK, head);
    // eyes
    const hit = hskin.ray([s * 0.07, 1.255, 1], [0, 0, -1]);
    if (hit) b.decal(skull, EYE, { at: hit, size: [0.058, 0.036] });
    // bushy brows
    b.capsule(hp(s * 0.015, 0.03, 0.14), hp(s * 0.105, 0.025, 0.095), 0.028, { color: BROW, bone: head });
    b.spike(hp(s * 0.1, 0.025, 0.095), [s * 0.7, 0.3, -0.4], 0.075, 0.026, { color: BROW, bone: head, sides: 6 });
    // pointed ears
    b.spike(hp(s * 0.145, -0.005, -0.01), [s * 0.8, 0.4, -0.3], 0.11, 0.032, { color: SKIN, bone: head, sides: 6 });
    // sideburns
    ell(hp(s * 0.145, -0.04, 0.03), [0.03, 0.075, 0.06], BEARD, head);
  }
  ell(hp(0, -0.04, 0.155), [0.05, 0.048, 0.055], NOSE_C, head);
  b.capsule(hp(0, 0.01, 0.14), hp(0, -0.03, 0.16), 0.03, { color: SKIN, bone: head });
  ell(hp(0, -0.075, 0.12), [0.085, 0.045, 0.07], SKIN, head);
  ell(hp(0, -0.085, 0.1), [0.07, 0.02, 0.07], MOUTH, head);
  // lower jaw
  ell(hp(0, -0.105, 0.065), [0.1, 0.05, 0.09], SKIN, jaw);
  ell(hp(0, -0.09, 0.135), [0.05, 0.016, 0.02], LIP, jaw);

  // beard
  const beard = b.loft(
    [
      { at: [0, 1.215, 0.06], w: 0.34, h: 0.2 },
      { at: [0, 1.145, 0.115], w: 0.37, h: 0.2 },
      { at: [0, 1.05, 0.17], w: 0.32, h: 0.17 },
      { at: [0, 0.97, 0.215], w: 0.25, h: 0.14 },
      { at: [0, 0.9, 0.23], w: 0.14, h: 0.1 },
      { at: [0, 0.85, 0.235], w: 0.04, h: 0.05 },
    ],
    { bone: head, color: BEARD },
  );
  const bsk = b.surface(beard);
  b.sweep(bsk.loop([0, 0.99, 0.2], { dir: [0, 1, 0], lift: 0.012 }), 0.014, { color: GILT, bone: head });
  const tufts = bsk.scatter(70, { rng: rng(11), minDist: 0.035, filter: (h) => h.n.z > -0.2 && h.n.y < 0.8 });
  b.cards(tufts, TUFT, {
    size: [0.05, 0.1],
    lean: 70,
    flow: [0, -1, 0.2],
    bend: 25,
    vary: 0.3,
    rng: rng(12),
    bone: head,
  });
  // moustache
  for (const s of [1, -1])
    b.sweep(
      catmull([
        [s * 0.012, 1.222, 0.185],
        [s * 0.07, 1.205, 0.2],
        [s * 0.14, 1.17, 0.18],
        [s * 0.19, 1.12, 0.13],
        [s * 0.2, 1.075, 0.12],
        [s * 0.18, 1.05, 0.14],
      ]),
      [0.042, 0.01],
      { color: BEARD, bone: head, sides: 7 },
    );

  // braids
  const braid = (path: ReturnType<typeof bezier>, n: number, r: number, bone: J) => {
    let k = 0;
    b.along(path, n, (at) => {
      b.part(new THREE.SphereGeometry(1, 6, 5), k % 2 ? BEARD_DARK : BEARD_MID, {
        frame: at,
        scale: [r * (k % 2 ? 1.05 : 0.9), r * 1.35, r],
        bone,
      });
      k++;
    });
    const end = path.at(1);
    b.part(new THREE.CylinderGeometry(r * 0.95, r * 0.95, 0.025, 8), GOLD, { at: end, bone });
    b.spike(end, [0, -1, 0.1], 0.07, r * 0.8, { color: BEARD_MID, bone: head, sides: 6 });
  };
  for (const s of [1, -1])
    braid(bezier(V(s * 0.15, 1.15, 0.16), V(s * 0.2, 1.0, 0.28), V(s * 0.14, 0.86, 0.31)), 7, 0.028, head);
  braid(bezier(V(0, 1.36, -0.1), V(0, 1.3, -0.26), V(0, 1.1, -0.26)), 8, 0.034, head);

  // mohawk
  const topY = (z: number) => HC.y + 0.15 * Math.sqrt(Math.max(0.01, 1 - ((z - HC.z) / 0.152) ** 2));
  const blade = (h: number): Array<[number, number] | [number, number, "sharp"]> => [
    [-0.04, 0],
    [0.04, 0],
    [0.03, 0.05],
    [0.04, h * 0.55],
    [0.03, h, "sharp"],
    [-0.01, h * 0.7],
    [-0.035, 0.05],
  ];
  for (let k = -3; k <= 2; k++) {
    const z = HC.z + k * 0.045;
    b.extrude(blade(0.14 - Math.abs(k + 0.5) * 0.015), {
      at: [0, topY(z) - 0.015, z],
      x: [0, 0, -1],
      thickness: [0.05, 0.012],
      color: HAIR,
      bone: head,
    });
  }

  // goggles
  b.sweep(hskin.loop([0, 1.345, 0.05], { dir: [0, 1, 0], lift: 0.012 }), 0.012, { color: DARK_LEATHER, bone: head });
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 10), BRONZE, {
      at: [s * 0.058, 1.355, 0.18],
      dir: [0, 0.45, 1],
      bone: head,
    });
    b.part(new THREE.CylinderGeometry(0.036, 0.036, 0.034, 10), LENS, {
      at: [s * 0.058, 1.358, 0.19],
      dir: [0, 0.45, 1],
      bone: head,
    });
  }
  box([0, 1.358, 0.185], [0.04, 0.015, 0.015], BRONZE, head);

  // ------------------------------------------------------------------ pauldrons
  for (const s of [1, -1]) {
    const Cc = V(s * 0.37, 1.04, 0.02);
    const a = V(s * 0.7, 1, 0).normalize();
    const tiers = [
      { r: 0.2, o: -0.06 },
      { r: 0.175, o: 0 },
      { r: 0.145, o: 0.06 },
    ];
    for (const t of tiers) {
      const R = t.r;
      b.lathe(
        [
          [0, 0, "sharp"],
          [R, 0],
          [R * 0.97, 0.03],
          [R * 0.8, 0.07],
          [R * 0.45, 0.105],
          [0, 0.12, "sharp"],
        ],
        { at: Cc.clone().addScaledVector(a, t.o), axis: a, segments: 10, color: PLATE, bone: chest },
      );
      b.part(new THREE.TorusGeometry(R, 0.012, 4, 16), GILT, {
        at: Cc.clone().addScaledVector(a, t.o + 0.012),
        dir: a,
        axis: "z",
        bone: chest,
      });
    }
    b.ring(frame(Cc.clone().addScaledVector(a, 0.1), a), { count: 5, radius: 0.085, tilt: 40 }, (it) =>
      b.spike(it, it, 0.1, 0.025, { color: STEEL, bone: chest, sides: 5 }),
    );
    b.spike(Cc.clone().addScaledVector(a, 0.17), a, 0.12, 0.035, { color: STEEL, bone: chest, sides: 6 });
  }

  // ------------------------------------------------------------------ hands
  const grip = (arm: C, c: THREE.Vector3, g: THREE.Vector3, e1: THREE.Vector3, e2: THREE.Vector3, tag: string) => {
    const tip = arm.tip as J;
    ell(c.clone().addScaledVector(e2, -0.02), [0.064, 0.058, 0.062], SKIN, tip);
    for (let i = 0; i < 4; i++) {
      const o = (i - 1.5) * 0.028;
      const pts = [10, 95, 185].map((d) => {
        const an = (d * Math.PI) / 180;
        return c
          .clone()
          .addScaledVector(g, o)
          .addScaledVector(e1, Math.cos(an) * 0.038)
          .addScaledVector(e2, Math.sin(an) * 0.038);
      });
      const ch = b.chain(`fingerChain${i + 1}${tag}`, polyline(pts), {
        parent: tip,
        names: [`finger${i + 1}${tag}a`, `finger${i + 1}${tag}b`],
        role: "digit",
      });
      b.sweep(ch, [0.0155, 0.012], { color: SKIN, sides: 6 });
    }
    const t0 = c.clone().addScaledVector(g, 0.05).addScaledVector(e1, 0.035);
    const t1 = c.clone().addScaledVector(g, 0.055).addScaledVector(e1, 0.01).addScaledVector(e2, 0.034);
    const th = b.chain(`thumbChain${tag}`, polyline([t0, t1]), { parent: tip, names: [`thumb${tag}`], role: "digit" });
    b.sweep(th, [0.019, 0.014], { color: SKIN, sides: 6 });
  };

  const buildArm = (s: number, c: THREE.Vector3, g: THREE.Vector3) => {
    const S = sf(s);
    const e1 = V(-s, 0, 0);
    e1.addScaledVector(g, -e1.dot(g)).normalize();
    const e2 = V(0, 0, 1);
    e2.addScaledVector(g, -e2.dot(g)).normalize();
    const shoulder = V(s * 0.31, 0.97, 0.02);
    const T = c.clone().addScaledVector(e2, -0.04);
    const pts = limb(shoulder, T, [0.26, 0.25], [[s * 0.6, -0.7, -0.5]]);
    const arm = b.chain(`arm${S}`, pts, {
      parent: chest,
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "arm",
    });
    const R = [0.086, 0.078, 0.068, 0.072, 0.056];
    const rf = arr(R);
    b.sweep(arm, R, {
      bands: [
        [0.46, SHIRT],
        [1, SKIN],
      ],
    });
    b.sweep(arm, (t) => rf(t) * 1.17 + 0.003, { from: 0.62, to: 0.97, color: BRACER, caps: "flat" });
    for (const [f0, f1] of [
      [0.6, 0.64],
      [0.95, 0.99],
    ])
      b.sweep(arm, (t) => rf(t) * 1.2 + 0.006, { from: f0, to: f1, color: GILT, caps: "flat" });
    // elbow guard
    const ep = pts[1].clone().add(V(s * 0.03, 0, -0.045));
    ell(ep, [0.06, 0.06, 0.06], PLATE, arm.joints[1]);
    b.spike(ep, [s * 0.4, -0.1, -1], 0.09, 0.03, { color: STEEL, bone: arm.joints[1], sides: 5 });
    grip(arm, c, g, e1, e2, S);
    return arm;
  };

  // right hand: hammer
  const cR = V(-0.27, 0.88, 0.4);
  const gR = V(0.356, 0.815, 0.458).normalize();
  const armR = buildArm(-1, cR, gR);
  const tipR = armR.tip as J;
  const H0 = cR.clone().addScaledVector(gR, 0.36);
  const qh = aim(gR);
  const loc = (x: number, y: number, z: number) => H0.clone().add(V(x, y, z).applyQuaternion(qh));
  const hbox = (size: [number, number, number], color: Col, l: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at: loc(l[0], l[1], l[2]), quat: qh.clone(), bone: tipR });
  b.rod(cR.clone().addScaledVector(gR, -0.16), H0, 0.021, { color: WOODH, bone: tipR, sides: 8 });
  b.rod(cR.clone().addScaledVector(gR, -0.1), cR.clone().addScaledVector(gR, 0.1), 0.027, {
    color: DARK_LEATHER,
    bone: tipR,
    sides: 8,
  });
  b.part(new THREE.SphereGeometry(0.03, 7, 5), GILT, { at: cR.clone().addScaledVector(gR, -0.17), bone: tipR });
  hbox([0.1, 0.1, 0.22], STEEL, [0, 0, 0]);
  for (const z of [1, -1]) {
    hbox([0.112, 0.112, 0.05], IRON, [0, 0, z * 0.135]);
    hbox([0.118, 0.118, 0.018], GILT, [0, 0, z * 0.105]);
  }
  hbox([0.06, 0.05, 0.06], BRONZE, [0, -0.07, 0]);
  b.spike(loc(0, 0.05, 0), gR, 0.07, 0.026, { color: STEEL, bone: tipR, sides: 4 });
  for (const sx of [1, -1]) {
    const d = V(sx, 0, 0).applyQuaternion(qh);
    glow(
      b.part(new THREE.PlaneGeometry(0.17, 0.085), "#ffffff", {
        at: loc(sx * 0.0515, 0, 0),
        dir: d,
        up: gR,
        axis: "z",
        texture: RUNE,
        bone: tipR,
      }),
      1.3,
    );
  }

  // left hand: tongs and billet
  const J = V(0.04, 0.745, AZ);
  const cL = V(0.25, 0.9, 0.38);
  const gL = J.clone().sub(cL).normalize();
  const armL = buildArm(1, cL, gL);
  const tipL = armL.tip as J;
  const pU = V(0, 1, 0);
  pU.addScaledVector(gL, -pU.dot(gL)).normalize();
  for (const k of [1, -1])
    b.rod(
      cL.clone().addScaledVector(gL, -0.2).addScaledVector(pU, k * 0.03),
      J.clone().addScaledVector(pU, k * 0.008).addScaledVector(gL, 0.02),
      0.012,
      { color: IRON_FLAT, bone: tipL, sides: 6 },
    );
  b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.08, 8), GILT, {
    at: cL.clone().addScaledVector(gL, 0.12),
    dir: pU,
    bone: tipL,
  });
  glow(b.part(new THREE.BoxGeometry(0.22, 0.03, 0.04), BILLET, { at: [0.14, 0.735, AZ], bone: tipL }), 1.4);
  glow(b.part(new THREE.BoxGeometry(0.12, 0.032, 0.024), BILLET_HOT, { at: [0.16, 0.735, AZ], bone: tipL }), 1.8);

  // sparks
  const R = rng(5);
  for (let i = 0; i < 12; i++) {
    const hot = R() > 0.5;
    glow(
      b.part(new THREE.OctahedronGeometry(0.007 + R() * 0.006, 0), hot ? BILLET_HOT : BILLET, {
        at: [0.06 + (R() - 0.5) * 0.28, 0.78 + R() * 0.26, AZ + (R() - 0.5) * 0.24],
        bone: hips,
      }),
      2,
    );
  }

  // ------------------------------------------------------------------ legs
  for (const s of [1, -1]) {
    const S = sf(s);
    const hipP = V(s * 0.12, 0.56, 0.02);
    const ankleT = V(s * 0.135, 0.12, 0.0);
    const pts = limb(hipP, ankleT, [0.27, 0.27], [[0, 0, 1]]);
    const leg = b.chain(`leg${S}`, pts, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
      role: "leg",
      contact: [s * 0.135, 0, 0.06],
    });
    const RL = [0.1, 0.088, 0.078, 0.072, 0.07];
    const rl = arr(RL);
    b.sweep(leg, RL, {
      bands: [
        [0.55, TROUSER],
        [1, BOOT],
      ],
    });
    b.sweep(leg, (t) => rl(t) * 1.16 + 0.004, { from: 0.52, to: 0.6, color: DARK_LEATHER, caps: "flat" });
    b.sweep(leg, (t) => rl(t) * 1.2 + 0.006, { from: 0.6, to: 0.63, color: GILT, caps: "flat" });
    ell(pts[1].clone().add(V(0, 0.0, 0.075)), [0.062, 0.062, 0.05], PLATE, leg.joints[1]);
    const ankle = leg.tip as J;
    const toe = b.joint(`toe${S}`, { parent: ankle, at: [s * 0.135, 0.05, 0.13], aim: [s * 0.135, 0.045, 0.25] });
    ell([s * 0.135, 0.065, 0.05], [0.082, 0.062, 0.14], BOOT, ankle);
    ell([s * 0.135, 0.055, 0.15], [0.078, 0.05, 0.07], DARK_LEATHER, toe);
    box([s * 0.135, 0.011, 0.06], [0.17, 0.022, 0.32], SOLE, ankle);
    box([s * 0.135, 0.04, -0.06], [0.12, 0.03, 0.08], SOLE, ankle);
    box([s * 0.135, 0.135, 0.11], [0.06, 0.018, 0.03], GOLD, ankle);
  }

  // ------------------------------------------------------------------ stump and anvil (props on the root)
  b.part(new THREE.CylinderGeometry(0.2, 0.24, 0.36, 12), paint((p, n) => {
    if (n.y > 0.8) {
      const d = Math.hypot(p.x, p.z - AZ);
      return mix("#b88652", "#8a5a30", 0.5 + 0.5 * Math.sin(d * 95 + noise(p, 0.1, 3) * 3));
    }
    return mix("#5e3c22", "#7c5230", noise(p, 0.03, 5));
  }), { at: [0, 0.18, AZ], bone: hips });
  for (const [y, r] of [
    [0.045, 0.252],
    [0.335, 0.222],
  ] as const)
    b.part(new THREE.CylinderGeometry(r, r, 0.025, 12), IRON, { at: [0, y, AZ], bone: hips });

  box([0, 0.39, AZ], [0.4, 0.06, 0.28], IRON, hips);
  box([0, 0.51, AZ], [0.22, 0.18, 0.15], IRON, hips);
  box([0, 0.42, AZ], [0.23, 0.014, 0.16], GILT, hips);
  box([0, 0.6, AZ], [0.23, 0.014, 0.16], GILT, hips);
  box([0, 0.645, AZ], [0.5, 0.09, 0.2], IRON, hips);
  box([0, 0.7025, AZ], [0.5, 0.025, 0.21], STEEL_POL, hips);
  box([-0.3, 0.655, AZ], [0.12, 0.07, 0.17], STEEL, hips);
  box([-0.15, 0.714, AZ], [0.03, 0.01, 0.03], "#111114", hips);
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.01, 8), "#111114", { at: [-0.04, 0.714, AZ], bone: hips });
  b.sweep(
    bezier(V(0.24, 0.645, AZ), V(0.36, 0.645, AZ), V(0.52, 0.69, AZ)),
    [0.068, 0.01],
    { color: BLUED, bone: hips, caps: { end: "point" }, sides: 8 },
  );
  for (const zs of [1, -1])
    b.part(new THREE.PlaneGeometry(0.17, 0.06), "#ffffff", {
      at: [0, 0.51, AZ + zs * 0.0765],
      dir: [0, 0, zs],
      axis: "z",
      texture: ANVILMARK,
      bone: hips,
    });

  return b.root;
}
```