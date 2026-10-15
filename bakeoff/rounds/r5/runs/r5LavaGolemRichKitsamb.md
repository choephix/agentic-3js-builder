```ts
import * as THREE from "three";
import { bezier, catmull, createBuilder, frame, limb, mottle, patches, polyline, rng, svg } from "agentic-3js-builder";
import { cel } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Basalt Lava Golem",
  description:
    "A towering lava golem built from hexagonal basalt columns and cel-shaded plates, split by glowing molten seams, with a pyro core in its chest, glowing eyes, gold trim, back crystals and flames, standing in a lava pool on a rune-ringed rock base.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette
const LAVA_DEEP = "#d8380e";
const LAVA = "#ff7a1c";
const LAVA_HOT = "#ffb830";
const GOLD = "#e3b765";
const GOLD_DK = "#a8793a";
const HORN = "#2b2640";
const TOOTH = "#f4dcae";
const OBSIDIAN = "#1c1829";

const MOLTEN = mottle(LAVA, LAVA_HOT, { size: 0.12, seed: 2 });
const PLATES = patches(
  MOLTEN,
  [cel("#4b4666", "#2e2a45"), cel("#403b5a", "#292540"), cel("#564f72", "#34304d")],
  { size: 0.34, gap: 0.12, seed: 4 },
);
const PLATES2 = patches(
  MOLTEN,
  [cel("#443f60", "#2a2641"), cel("#3a3555", "#26223c"), cel("#4f496c", "#312d4a")],
  { size: 0.28, gap: 0.1, seed: 9 },
);
const ROCK_LIT = cel(mottle("#5d5784", "#4f4a74", { size: 0.2, seed: 1 }), mottle("#37314f", "#2e2a46", { size: 0.2, seed: 1 }));
const ROCK_MID = cel("#4a4568", "#2c2845");
const ROCK_DARK = cel("#363250", "#201d35");

// ---------------------------------------------------------------------------------------------------------------
// Textures
const EYE = svg(
  `<svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ff8a1c"/><stop offset="0.55" stop-color="#ffe88a"/><stop offset="1" stop-color="#ffffff"/></linearGradient></defs>
  <path d="M2 8 L98 26 L90 46 L8 40 Z" fill="#1b0d1a"/>
  <path d="M10 14 L92 29 L86 40 L14 35 Z" fill="url(#g)"/>
  <path d="M60 26 L74 29 L72 38 L60 36 Z" fill="#c8300c"/>
</svg>`,
  { size: 256 },
);

const CORE = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs><radialGradient id="rg"><stop offset="0" stop-color="#fff6cf"/><stop offset="0.5" stop-color="#ff9a24"/><stop offset="1" stop-color="#e8420f"/></radialGradient></defs>
  <circle cx="50" cy="50" r="48" fill="#2a1424"/>
  <circle cx="50" cy="50" r="42" fill="url(#rg)"/>
  <circle cx="50" cy="50" r="33" fill="none" stroke="#7a1c08" stroke-width="2.6"/>
  <path d="M50 12 L58 42 L88 50 L58 58 L50 88 L42 58 L12 50 L42 42 Z" fill="#fff6cf" stroke="#ffb830" stroke-width="2.2" stroke-linejoin="round"/>
  <circle cx="50" cy="50" r="8" fill="#ff5a14"/>
  <circle cx="50" cy="50" r="3.5" fill="#fff6cf"/>
</svg>`,
  { size: 256 },
);

const FLAME = svg(
  `<svg viewBox="0 0 40 80" xmlns="http://www.w3.org/2000/svg">
  <path d="M20 78 C4 70 2 50 12 36 C14 44 18 46 18 40 C16 28 22 16 24 2 C32 16 38 30 36 50 C35 66 30 74 20 78 Z" fill="#ff6a14"/>
  <path d="M20 74 C10 68 10 54 16 46 C18 52 22 52 22 46 C22 38 26 32 27 24 C32 36 33 50 30 62 C28 70 25 72 20 74 Z" fill="#ffc23a"/>
  <path d="M20 72 C15 66 16 58 20 52 C24 58 25 66 20 72 Z" fill="#fff4b8"/>
</svg>`,
  { size: 192 },
);

const EMBER = svg(
  `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <path d="M16 1 L19 13 L31 16 L19 19 L16 31 L13 19 L1 16 L13 13 Z" fill="#ffc94a"/>
  <circle cx="16" cy="16" r="4" fill="#fff6cf"/>
</svg>`,
  { size: 64 },
);

const glyphTicks = Array.from(
  { length: 24 },
  (_, i) => `<rect x="97" y="8" width="6" height="10" fill="#ffb830" transform="rotate(${i * 15} 100 100)"/>`,
).join("");
const CIRCLE = svg(
  `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="100" r="96" fill="none" stroke="#ff7a1c" stroke-width="4"/>
  <circle cx="100" cy="100" r="78" fill="none" stroke="#ffb830" stroke-width="3"/>
  ${glyphTicks}
  <path d="M100 30 L160 134 L40 134 Z M100 170 L40 66 L160 66 Z" fill="none" stroke="#ff7a1c" stroke-width="3.5" stroke-linejoin="round"/>
  <circle cx="100" cy="100" r="40" fill="none" stroke="#ffe27a" stroke-width="3" stroke-dasharray="10 6"/>
</svg>`,
  { size: 512 },
);

const RUNES = svg(
  `<svg viewBox="0 0 40 100" xmlns="http://www.w3.org/2000/svg">
  <rect x="1" y="1" width="38" height="98" rx="4" fill="#2b2438" stroke="#e3b765" stroke-width="2.4"/>
  <g stroke="#e8c070" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <g transform="translate(0,6)"><path d="M12 4 L20 14 L28 4"/><path d="M20 14 L20 22"/></g>
    <g transform="translate(0,32)"><circle cx="20" cy="10" r="7"/><path d="M20 3 L20 17"/></g>
    <g transform="translate(0,58)"><path d="M12 4 H28 L12 20 H28"/></g>
    <g transform="translate(0,80)"><path d="M14 4 L26 4 M20 4 L20 14 M14 14 L26 14"/></g>
  </g>
</svg>`,
  { size: 256 },
);

const CRACK = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <g fill="none" stroke-linecap="round" stroke-linejoin="round">
    <g stroke="#ff6a14" stroke-width="5">
      <path d="M50 0 L46 18 L58 30 L48 46 L62 58 L52 76 L56 100"/>
      <path d="M58 30 L78 36 L90 52"/>
      <path d="M48 46 L28 52 L14 70"/>
      <path d="M62 58 L80 72"/>
    </g>
    <g stroke="#ffe27a" stroke-width="2">
      <path d="M50 0 L46 18 L58 30 L48 46 L62 58 L52 76 L56 100"/>
      <path d="M58 30 L78 36 L90 52"/>
      <path d="M48 46 L28 52 L14 70"/>
      <path d="M62 58 L80 72"/>
    </g>
  </g>
</svg>`,
  { size: 384 },
);

// ---------------------------------------------------------------------------------------------------------------
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const rock = (r: number) => new THREE.DodecahedronGeometry(r, 0);

export default function build() {
  const b = createBuilder({ name: "lavaGolem" });
  const R = rng(7);
  const FLOOR = 0.18;

  // ------------------------------------------------------------------ skeleton
  const hips = b.joint("hips", { at: [0, 1.5, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.5, 0],
      [0, 1.9, 0],
      [0, 2.35, 0.05],
      [0, 2.75, 0.1],
    ]),
    { parent: hips, role: "spine", names: ["spine1", "spine2", "chest"] },
  );
  const chest = spine.joints[2];
  const neck = b.chain(
    "neck",
    [
      [0, 2.75, 0.1],
      [0, 2.95, 0.2],
    ],
    { parent: chest, role: "neck", names: ["neck"] },
  );
  const head = b.joint("head", { parent: neck, at: [0, 2.95, 0.2], dir: [0, 0.05, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.02, up: -0.12 }),
    aim: head.local({ forward: 0.5, up: -0.12 }),
    role: "jaw",
  });
  const hl = (f: number, u: number, l = 0) => head.local({ forward: f, up: u, left: l });

  // ------------------------------------------------------------------ base
  b.part(new THREE.CylinderGeometry(2.25, 2.5, FLOOR, 9), ROCK_DARK, { bone: hips, at: [0, FLOOR / 2, 0], flat: true });
  glow(b.part(new THREE.CylinderGeometry(1.9, 1.95, 0.03, 9), LAVA_DEEP, { bone: hips, at: [0, FLOOR + 0.012, 0], flat: true }), 0.9);
  glow(
    b.part(new THREE.PlaneGeometry(3.8, 3.8), "#ffffff", {
      bone: hips,
      at: [0, FLOOR + 0.032, 0],
      dir: [0, 1, 0],
      up: [0, 0, 1],
      axis: "z",
      texture: CIRCLE,
    }),
    1.2,
  );
  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * Math.PI * 2 + R() * 0.2;
    const r = 2.05 + R() * 0.15;
    const k = 0.18 + R() * 0.2;
    b.part(rock(k), i % 2 ? ROCK_MID : ROCK_LIT, {
      bone: hips,
      at: [Math.cos(a) * r, FLOOR + k * 0.5, Math.sin(a) * r],
      scale: [1, 0.8 + R() * 0.5, 1],
      rotation: [R() * 60, R() * 360, R() * 60],
      flat: true,
    });
  }
  for (let i = 0; i < 7; i++) {
    const a0 = i * 0.9 + 0.3;
    const pts: number[][] = [];
    for (let k = 0; k < 4; k++) {
      const ang = a0 + (R() - 0.5) * 0.14;
      const r = 1.95 + k * 0.1;
      pts.push([Math.cos(ang) * r, FLOOR + 0.025, Math.sin(ang) * r]);
    }
    glow(b.sweep(polyline(pts), 0.025, { bone: hips, color: LAVA, sides: 4, caps: "flat" }), 1);
  }

  // ------------------------------------------------------------------ torso
  const torso = b.loft(
    [
      { at: [0, 1.45, 0], w: 0.95, h: 0.62 },
      { at: [0, 1.8, 0], w: 0.9, h: 0.6 },
      { at: [0, 2.2, 0.04], w: 1.5, h: 0.95 },
      { at: [0, 2.62, 0.08], w: 1.75, h: 1.0 },
      { at: [0, 2.86, 0.06], w: 1.2, h: 0.7 },
    ],
    { bone: [hips, spine], section: "box", color: PLATES },
  );
  const skin = b.surface(torso);
  const frontAt = (x: number, y: number) => skin.ray([x, y, 3], [0, 0, -1])?.at.clone() ?? V(x, y, 0.4);
  const backAt = (x: number, y: number) => skin.ray([x, y, -3], [0, 0, 1])?.at.clone() ?? V(x, y, -0.35);

  // skirt of hanging plates
  const waist = skin.loop([0, 1.55, 0]);
  let sk = 0;
  b.along(waist, 10, (at) => {
    const h = skin.nearest(at.at);
    const big = sk % 2 === 0;
    b.stick(new THREE.BoxGeometry(big ? 0.38 : 0.3, 0.14, big ? 0.55 : 0.45), big ? ROCK_LIT : ROCK_MID, h, { embed: 0 });
    sk++;
  });
  // molten belt + buckle
  glow(b.sweep(skin.loop([0, 1.8, 0], { lift: 0.03 }), 0.045, { color: LAVA_HOT, sides: 4 }), 1.2);
  const buckle = frontAt(0, 1.8);
  b.part(new THREE.OctahedronGeometry(0.15, 0), GOLD, { bone: hips, at: buckle.clone().add(V(0, 0, 0.05)), scale: [1, 1.3, 0.6] });
  glow(b.part(new THREE.OctahedronGeometry(0.08, 0), LAVA, { bone: hips, at: buckle.clone().add(V(0, 0, 0.1)), scale: [1, 1.3, 0.7] }), 1.4);

  // belly + back cracks
  glow(b.decal(torso, CRACK, { at: frontAt(0, 2.0), dir: [0, 0, 1], size: [0.7, 0.55], lift: 0.012 }), 1.2);
  glow(b.decal(torso, CRACK, { at: backAt(0.1, 2.1), dir: [0, 0, -1], size: [0.9, 0.9], lift: 0.012 }), 1.2);

  // chest core
  const coreAt = frontAt(0, 2.3);
  glow(b.decal(torso, CORE, { at: coreAt, dir: [0, 0, 1], size: [0.52, 0.52], lift: 0.012 }), 1.5);
  let rim = 0;
  b.ring(frame(coreAt, [0, 0, 1]), { count: 8, radius: 0.33 }, (item) => {
    b.stick(new THREE.BoxGeometry(0.17, 0.12, 0.13), rim % 2 ? GOLD : ROCK_DARK, item, { embed: 0.2, bone: chest });
    rim++;
  });

  // pectorals
  for (const s of [1, -1]) {
    const ph = frontAt(s * 0.56, 2.65);
    b.extrude(
      [
        [-0.3, -0.22],
        [0.3, -0.26],
        [0.34, 0.08],
        [0.12, 0.26],
        [-0.28, 0.24],
      ],
      { at: [s * 0.56, 2.65, ph.z + 0.01], x: [s, 0, 0], y: [0, 1, 0], thickness: 0.14, bevel: 0.03, color: ROCK_LIT, bone: chest },
    );
    glow(b.part(new THREE.OctahedronGeometry(0.06, 0), LAVA_HOT, { bone: chest, at: [s * 0.62, 2.68, ph.z + 0.09], scale: [1, 1.3, 0.8] }), 1.3);
  }

  // gold gorget
  b.part(new THREE.TorusGeometry(0.5, 0.05, 5, 10), GOLD, {
    bone: chest,
    at: [0, 2.84, 0.08],
    dir: [0, 1, 0],
    up: [0, 0, 1],
    axis: "z",
    scale: [1, 0.66, 1],
  });

  // dorsal rocks
  const backHits = skin.scatter(14, { rng: rng(5), minDist: 0.3, filter: (h) => h.n.z < -0.5 && h.at.y > 1.8 && h.at.y < 2.6 });
  for (const h of backHits) {
    const k = 0.7 + R() * 0.7;
    b.stick(rock(0.16), ROCK_DARK, h, { embed: 0.2, scale: [k, k * 1.2, k], flat: true });
  }
  // back crystals
  for (const [x, tx] of [
    [-0.5, -0.5],
    [0.05, 0],
    [0.55, 0.5],
  ]) {
    b.part(rock(0.26), ROCK_DARK, { bone: chest, at: [x, 2.7, -0.4], flat: true });
    glow(b.part(new THREE.ConeGeometry(0.13, 0.75, 5), LAVA_HOT, { bone: chest, at: [x, 3.1, -0.45], dir: [tx, 1, -0.4], flat: true }), 1.2);
  }
  // trapezius rocks
  for (const s of [1, -1]) {
    b.part(rock(0.3), ROCK_MID, { bone: chest, at: [s * 0.5, 2.95, -0.02], scale: [1, 0.8, 1], flat: true });
  }

  // ------------------------------------------------------------------ neck
  b.sweep(neck, 0.25, { section: { ngon: 6 }, color: ROCK_DARK });

  // ------------------------------------------------------------------ arms
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const shoulderAt = V(s * 1.08, 2.55, 0);
    const handAt = V(s * 1.62, 1.0, 0.3);
    const pts = limb(shoulderAt, handAt, [0.9, 0.85], [s * 0.25, 0, -1]);
    const arm = b.chain(`arm${side}`, pts, {
      parent: chest,
      role: "arm",
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
    });
    const shoulder = arm.joints[0];
    const elbow = arm.joints[1];
    const wrist = arm.tip!;
    const dU = pts[1].clone().sub(pts[0]).normalize();
    const dF = pts[2].clone().sub(pts[1]).normalize();

    const armTube = b.sweep(arm, [0.3, 0.27, 0.26, 0.32, 0.34, 0.31], { section: { ngon: 6 }, color: PLATES2 });

    // pauldron stack
    b.part(rock(0.52), ROCK_LIT, { bone: shoulder, at: [s * 1.18, 2.8, 0], scale: [1.1, 0.75, 1], rotation: [0, s * 20, 0], flat: true });
    b.part(rock(0.34), ROCK_MID, { bone: shoulder, at: [s * 1.3, 3.15, -0.05], rotation: [20, s * 30, 10], flat: true });
    b.spike([s * 1.38, 3.2, -0.05], [s * 0.6, 1, 0], 0.4, 0.12, { bone: shoulder, color: ROCK_DARK, sides: 6 });
    b.part(rock(0.2), ROCK_DARK, { bone: shoulder, at: [s * 1.55, 2.62, 0.2], flat: true });
    glow(b.part(new THREE.OctahedronGeometry(0.12, 0), LAVA_HOT, { bone: shoulder, at: [s * 1.22, 2.85, 0.47], scale: [1, 1.4, 0.8] }), 1.4);

    // lava ring under the pauldron + gold bands
    glow(
      b.part(new THREE.TorusGeometry(0.36, 0.04, 4, 12), LAVA, { bone: shoulder, at: pts[0].clone().addScaledVector(dU, 0.34), dir: dU, axis: "z" }),
      1.1,
    );
    b.part(new THREE.TorusGeometry(0.37, 0.04, 5, 12), GOLD, { bone: elbow, at: pts[1].clone().addScaledVector(dF, 0.4), dir: dF, axis: "z" });
    b.part(new THREE.TorusGeometry(0.36, 0.045, 5, 12), GOLD, { bone: wrist, at: pts[2].clone().addScaledVector(dF, -0.05), dir: dF, axis: "z" });

    // elbow spike
    b.spike(pts[1], [s * 0.35, 0.15, -1], 0.42, 0.13, { bone: elbow, color: ROCK_DARK, sides: 6 });
    glow(
      b.part(new THREE.TorusGeometry(0.33, 0.035, 4, 12), LAVA, { bone: elbow, at: pts[1].clone().addScaledVector(dF, 0.05), dir: dF, axis: "z" }),
      1,
    );

    // rune bracer
    b.decal(armTube, RUNES, {
      at: arm.at(0.78).at.clone().add(V(s * 0.3, 0, 0)),
      dir: [s, 0, 0],
      size: [0.26, 0.5],
      lift: 0.01,
    });

    // fist
    const fistC = pts[2].clone().addScaledVector(dF, 0.2);
    b.part(new THREE.BoxGeometry(0.58, 0.5, 0.6), ROCK_LIT, { bone: wrist, at: fistC, dir: dF });
    for (const k of [-1, 0, 1]) {
      glow(b.part(rock(0.08), LAVA_HOT, { bone: wrist, at: fistC.clone().add(V(k * 0.18, 0.1, 0.3)), flat: true }), 1.3);
    }
    // fingers
    const fb = pts[2].clone().addScaledVector(dF, 0.42);
    const fd = dF.clone().add(V(0, 0, 0.45)).normalize();
    [-0.19, 0, 0.19].forEach((dx, i) => {
      const p0 = fb.clone().add(V(dx, 0, 0.12));
      const d1 = fd.clone().add(V(dx * 1.2, 0, 0)).normalize();
      const p1 = p0.clone().addScaledVector(d1, 0.2);
      const p2 = p1.clone().addScaledVector(d1.clone().add(V(0, 0, 0.4)).normalize(), 0.2);
      const f = b.chain(`finger${i + 1}${side}`, [p0, p1, p2], {
        parent: wrist,
        role: "digit",
        names: [`finger${i + 1}a${side}`, `finger${i + 1}b${side}`],
      });
      b.sweep(f, [0.085, 0.055], { section: { ngon: 6 }, color: ROCK_DARK, caps: { start: "none", end: "point" } });
    });
    // thumb
    {
      const t0 = pts[2].clone().addScaledVector(dF, 0.2).add(V(-s * 0.28, 0, 0.15));
      const t1 = t0.clone().add(V(-s * 0.1, -0.1, 0.18));
      const t2 = t1.clone().add(V(-s * 0.06, -0.1, 0.16));
      const th = b.chain(`thumb${side}`, [t0, t1, t2], {
        parent: wrist,
        role: "digit",
        names: [`thumb${side}a`, `thumb${side}b`],
      });
      b.sweep(th, [0.09, 0.06], { section: { ngon: 6 }, color: ROCK_DARK, caps: { start: "none", end: "point" } });
    }
  }

  // ------------------------------------------------------------------ legs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hipAt = V(s * 0.56, 1.42, 0);
    const footAt = V(s * 0.64, FLOOR + 0.3, 0.12);
    const lp = limb(hipAt, footAt, [0.64, 0.6], [0, 0, 1]);
    const leg = b.chain(`leg${side}`, lp, {
      parent: hips,
      role: "leg",
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      contact: [footAt.x, FLOOR, 0.3],
    });
    const hip = leg.joints[0];
    const knee = leg.joints[1];
    const ankle = leg.tip!;
    const legTube = b.sweep(leg, [0.31, 0.29, 0.31, 0.27, 0.25], { section: { ngon: 6 }, color: PLATES2 });
    const dS = lp[2].clone().sub(lp[1]).normalize();

    // knee guard, thigh rock, molten ring, gold ankle band
    b.part(rock(0.27), ROCK_LIT, { bone: knee, at: lp[1].clone().add(V(0, 0, 0.26)), scale: [1, 1.1, 0.8], flat: true });
    b.part(rock(0.22), ROCK_DARK, { bone: hip, at: lp[0].clone().lerp(lp[1], 0.45).add(V(s * 0.3, 0.05, 0)), flat: true });
    glow(b.part(new THREE.TorusGeometry(0.34, 0.035, 4, 12), LAVA, { bone: knee, at: lp[1].clone().addScaledVector(dS, 0.22), dir: dS, axis: "z" }), 1);
    b.part(new THREE.TorusGeometry(0.3, 0.045, 5, 12), GOLD, { bone: ankle, at: lp[2].clone().addScaledVector(dS, -0.08), dir: dS, axis: "z" });
    glow(
      b.decal(legTube, CRACK, {
        at: leg.at(0.22).at.clone().add(V(0, 0, 0.27)),
        dir: [0, 0.35, 1],
        size: [0.35, 0.45],
        lift: 0.012,
      }),
      1.1,
    );

    // foot + toes
    b.part(new THREE.BoxGeometry(0.62, 0.24, 0.9), ROCK_MID, { bone: ankle, at: [s * 0.64, FLOOR + 0.11, 0.2] });
    [-0.2, 0, 0.2].forEach((dx, i) => {
      const x = s * 0.64 + dx;
      const t = b.chain(
        `toe${i + 1}${side}`,
        [
          [x, FLOOR + 0.1, 0.55],
          [x, FLOOR + 0.1, 0.82],
        ],
        { parent: ankle, role: "digit", names: [`toe${i + 1}${side}`] },
      );
      b.sweep(t, [0.09, 0.07], { section: { ngon: 6 }, color: ROCK_DARK, caps: { start: "none", end: "point" } });
    });
  }

  // ------------------------------------------------------------------ head
  b.part(new THREE.BoxGeometry(0.66, 0.44, 0.58), ROCK_LIT, { bone: head, at: hl(0.2, 0.2) });
  b.part(new THREE.BoxGeometry(0.2, 0.14, 0.14), ROCK_MID, { bone: head, at: hl(0.52, 0.06) });
  b.part(new THREE.BoxGeometry(0.58, 0.12, 0.4), ROCK_MID, { bone: head, at: hl(0.3, -0.06) });
  // forehead gem
  glow(b.part(new THREE.OctahedronGeometry(0.06, 0), LAVA_HOT, { bone: head, at: hl(0.5, 0.36), scale: [1, 1.4, 0.8] }), 1.4);
  // crest rocks
  [-1, 0, 1].forEach((k) => {
    b.part(rock(0.14), ROCK_DARK, { bone: head, at: hl(0.05 - Math.abs(k) * 0.05, 0.46, k * 0.15), scale: [1, 1.3, 1], flat: true });
  });
  // upper teeth
  [-0.22, -0.11, 0, 0.11, 0.22].forEach((x) => {
    b.part(new THREE.ConeGeometry(0.03, 0.1, 4), TOOTH, { bone: head, at: hl(0.49, -0.15, x), dir: [0, -1, 0] });
  });
  // lower jaw
  b.part(new THREE.BoxGeometry(0.54, 0.14, 0.44), ROCK_DARK, { bone: jaw, at: hl(0.28, -0.23) });
  glow(b.part(new THREE.BoxGeometry(0.46, 0.03, 0.34), LAVA, { bone: jaw, at: hl(0.28, -0.155) }), 1.2);
  [-0.18, -0.06, 0.06, 0.18].forEach((x) => {
    b.part(new THREE.ConeGeometry(0.03, 0.09, 4), TOOTH, { bone: jaw, at: hl(0.47, -0.13, x), dir: [0, 1, 0] });
  });
  b.part(new THREE.ConeGeometry(0.07, 0.2, 5), ROCK_MID, { bone: jaw, at: hl(0.5, -0.32), dir: [0, -1, 0.5] });

  for (const s of [1, -1]) {
    // eyes (left eye texture is mirrored)
    const eyeGeo = new THREE.PlaneGeometry(0.22, 0.11);
    if (s > 0) {
      const uv = eyeGeo.getAttribute("uv");
      for (let i = 0; i < uv.count; i++) uv.setX(i, 1 - uv.getX(i));
    }
    glow(b.part(eyeGeo, "#ffffff", { bone: head, at: hl(0.495, 0.22, s * 0.17), dir: [0, 0, 1], axis: "z", texture: EYE }), 1.6);
    // angry brow wedges
    b.part(new THREE.BoxGeometry(0.34, 0.1, 0.22), ROCK_DARK, { bone: head, at: hl(0.44, 0.33, s * 0.17), rotation: [0, 0, s * 14] });
    // cheek plates
    b.part(new THREE.BoxGeometry(0.1, 0.3, 0.4), ROCK_DARK, { bone: head, at: hl(0.15, 0.12, s * 0.36) });
    // nostril vents
    glow(b.part(new THREE.BoxGeometry(0.03, 0.03, 0.03), LAVA, { bone: head, at: hl(0.6, 0.07, s * 0.05) }), 1.2);

    // horns
    const hp = (l: number, u: number, f: number) => hl(f, u, s * l);
    const p0 = hp(0.24, 0.34, 0.1);
    const p1 = hp(0.5, 0.5, -0.05);
    const p2 = hp(0.58, 0.78, -0.25);
    b.sweep(bezier(p0, p1, p2), [0.1, 0.05], { bone: head, color: HORN, section: { ngon: 6 }, caps: { start: "flat", end: "round" } });
    const td = p2.clone().sub(p1).normalize();
    glow(b.spike(p2, td, 0.2, 0.05, { bone: head, color: LAVA_HOT, sides: 6 }), 1.3);
  }

  // ------------------------------------------------------------------ flames & embers
  const flameFrames = [
    ...[-0.85, -0.28, 0.28, 0.85].map((x) => frame([x, 3.0, -0.35], [0, 1, 0])),
    frame([1.18, 3.3, -0.05], [0, 1, 0]),
    frame([-1.18, 3.3, -0.05], [0, 1, 0]),
    frame(hl(0.0, 0.42), [0, 1, 0]),
    frame(hl(0.15, 0.44, 0.2), [0, 1, 0]),
    frame(hl(0.15, 0.44, -0.2), [0, 1, 0]),
  ];
  glow(b.cards(flameFrames, FLAME, { size: [0.3, 0.62], cross: true, vary: 0.4, spin: 15, rng: rng(21) }), 1.3);

  const emberFrames = Array.from({ length: 34 }, () => {
    const a = R() * Math.PI * 2;
    const r = 0.6 + R() * 1.6;
    return frame([Math.cos(a) * r, 0.5 + R() * 3.6, Math.sin(a) * r], [0, 1, 0]);
  });
  glow(b.cards(emberFrames, EMBER, { size: 0.12, cross: true, vary: 0.5, rng: rng(33), bone: hips }), 1.6);

  // floating rocks orbiting the golem
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + 0.3;
    const r = 1.9 + R() * 0.3;
    const y = 1.0 + R() * 2.4;
    const k = 0.1 + R() * 0.12;
    b.part(rock(k), i % 2 ? ROCK_MID : ROCK_LIT, {
      bone: hips,
      at: [Math.cos(a) * r, y, Math.sin(a) * r],
      rotation: [R() * 90, R() * 90, 0],
      flat: true,
    });
    glow(
      b.part(new THREE.OctahedronGeometry(k * 0.45, 0), LAVA_HOT, {
        bone: hips,
        at: [Math.cos(a) * r, y - k * 1.4, Math.sin(a) * r],
        scale: [1, 1.5, 1],
      }),
      1.4,
    );
  }

  // gold seam accents on the base rim
  for (let i = 0; i < 5; i++) {
    const a = i * 1.25 + 0.6;
    b.part(new THREE.BoxGeometry(0.2, 0.05, 0.08), GOLD_DK, {
      bone: hips,
      at: [Math.cos(a) * 2.38, FLOOR + 0.02, Math.sin(a) * 2.38],
      rotation: [0, -a * 57.3, 0],
    });
  }
  b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.01, 3), OBSIDIAN, { bone: hips, at: [0, FLOOR * 0.5, 0] });

  return b.root;
}
```