```ts
import * as THREE from "three";
import { createBuilder, bezier, catmull, limb, paint, rng, svg } from "agentic-3js-builder";
import { animeEye, cel, INK, zigzag } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Kitsune of Nine Flames",
  description:
    "A white nine-tailed fox spirit with red kumadori markings, gold collar and bell, glowing sigils, and blue hitodama spirit flames burning on every tail tip and drifting around her.",
};

const D = Math.PI / 180;

export default function build() {
  const b = createBuilder({ name: "kitsune" });

  // ---------- palette ----------
  const WHITE = cel("#fff7ee", "#d6c6ea");
  const RED = cel("#e8452c", "#a82a4c");
  const GOLD = cel("#ffcf4a", "#d9892b");
  const DARK = cel("#3b2a52", "#241838");
  const NOSE = cel("#2b1a3c", INK);
  const FLAME = { core: "#f4feff", mid: "#6fe3ff", tip: "#8f7bff" };

  const bodyCoat = paint((p, n) =>
    n.y > 0.45 && p.z < 0.34 && Math.abs(p.x) < 0.012 + 0.014 * zigzag(p.z / 0.06) ? RED : WHITE,
  );
  const legCoat = paint((p) => (p.y < 0.24 + 0.05 * zigzag((p.x + p.z) / 0.04) ? DARK : WHITE));
  const tailCoat = paint((_p, _n, s) => (s[0] + 0.06 * zigzag(s[1] / 36) > 0.74 ? RED : WHITE));

  // ---------- textures ----------
  const EYE = animeEye({ iris: "#ffb52e" });
  const SIGIL = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g fill="#7ff0ff" stroke="#7ff0ff">
      <circle cx="50" cy="50" r="44" fill="none" stroke-width="4"/>
      <circle cx="42" cy="56" r="17" stroke="none"/>
      <path d="M52 40 C74 24 90 44 78 70 C84 50 72 44 58 52Z" stroke="none"/></g></svg>`,
    { size: 256 },
  );
  const BROW = svg(
    `<svg viewBox="0 0 40 60" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 2 C34 20 38 34 30 48 C26 56 14 56 10 48 C2 34 6 20 20 2Z" fill="#e8452c"/>
      <path d="M20 20 C28 32 28 42 20 48 C12 42 12 32 20 20Z" fill="#ffcf4a"/></svg>`,
    { size: 192 },
  );
  const CHEEK = svg(
    `<svg viewBox="0 0 80 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 8 C30 4 60 14 78 34 C56 24 30 22 2 8Z" fill="#e8452c"/></svg>`,
    { size: 192 },
  );

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.58, -0.3], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.58, -0.3],
      [0, 0.6, -0.1],
      [0, 0.62, 0.12],
      [0, 0.64, 0.3],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.64, 0.3],
      [0, 0.73, 0.4],
      [0, 0.8, 0.46],
    ]),
    { parent: spine.joints[2], names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 0.8, 0.46], dir: [0, -0.1, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.05, down: 0.04 }),
    aim: head.local({ forward: 0.25, down: 0.058 }),
    role: "jaw",
  });

  // ---------- body ----------
  const body = b.sweep(
    catmull([
      [0, 0.58, -0.46],
      [0, 0.58, -0.3],
      [0, 0.6, -0.1],
      [0, 0.62, 0.12],
      [0, 0.64, 0.3],
      [0, 0.73, 0.4],
      [0, 0.8, 0.46],
    ]),
    [0.075, 0.125, 0.127, 0.133, 0.15, 0.105, 0.085],
    { bone: [hips, spine, neck], color: bodyCoat },
  );
  const skin = b.surface(body);

  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 10, 8), WHITE, {
      bone: hips,
      at: [s * 0.1, 0.53, -0.3],
      scale: [0.075, 0.12, 0.13],
    });
  }

  // flank sigils
  for (const s of [1, -1]) {
    const hit = skin.ray([s * 0.6, 0.6, 0.0], [-s, 0, 0]);
    if (hit) glow(b.decal(skin, SIGIL, { at: hit, size: [0.13, 0.13], mirror: s < 0 }), 1.2);
  }

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const fx = s * 0.09;
    const fPts = limb([fx, 0.54, 0.26], [fx, 0.045, 0.3], [0.27, 0.27], [0, 0, -1]);
    const fl = b.chain(`legF${side}`, fPts, {
      parent: spine.joints[2],
      names: [`shoulder${side}`, `elbow${side}`, `pawF${side}`],
      role: "leg",
      contact: [fx, 0, 0.3],
    });
    b.sweep(fl, [0.048, 0.04, 0.028, 0.026], { color: legCoat });
    b.part(new THREE.SphereGeometry(0.045, 8, 6), DARK, {
      bone: fl.joints[fl.joints.length - 1],
      at: [fx, 0.0315, 0.33],
      scale: [0.85, 0.7, 1.45],
    });

    const hx = s * 0.1;
    const hPts = limb(
      [hx, 0.54, -0.3],
      [hx, 0.045, -0.42],
      [0.25, 0.25, 0.15],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const hl = b.chain(`legH${side}`, hPts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `pawH${side}`],
      role: "leg",
      contact: [hx, 0, -0.42],
    });
    b.sweep(hl, [0.07, 0.058, 0.035, 0.026, 0.026], { color: legCoat });
    b.part(new THREE.SphereGeometry(0.045, 8, 6), DARK, {
      bone: hl.joints[hl.joints.length - 1],
      at: [hx, 0.0315, -0.39],
      scale: [0.85, 0.7, 1.45],
    });
  }

  // ---------- head ----------
  const hc = head.local({ forward: 0.07, up: 0.015 });
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), WHITE, {
    bone: head,
    at: hc,
    scale: [0.105, 0.088, 0.108],
  });
  const face = b.surface(skull);

  // upper snout
  b.sweep([head.local({ forward: 0.1, down: 0.0 }), head.local({ forward: 0.275, down: 0.015 })], (t) => [
    0.058 - 0.036 * t,
    0.048 - 0.026 * t,
  ], { bone: head, color: WHITE });
  // lower jaw
  b.sweep(
    [head.local({ forward: 0.05, down: 0.04 }), head.local({ forward: 0.24, down: 0.055 })],
    (t) => [0.05 - 0.033 * t, 0.022 - 0.008 * t],
    { bone: jaw, color: WHITE },
  );
  b.part(new THREE.SphereGeometry(1, 8, 6), NOSE, {
    bone: head,
    at: head.local({ forward: 0.29, down: 0.008 }),
    scale: [0.026, 0.02, 0.022],
  });

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // fangs
    b.part(new THREE.ConeGeometry(0.008, 0.026, 5), "#ffffff", {
      bone: head,
      at: head.local({ forward: 0.18, down: 0.03, left: s * 0.032 }),
      dir: [0, -1, 0],
    });

    // eyes
    const eyeHit = face.around(hc).at(s * 42, 6);
    if (eyeHit) b.decal(face, EYE, { at: eyeHit, size: [0.052, 0.07], mirror: s > 0 });

    // kumadori cheek swoosh
    const ch = face.around(hc).at(s * 72, -14);
    if (ch) b.decal(face, CHEEK, { at: ch, size: [0.075, 0.04], roll: -s * 15, mirror: s < 0 });

    // brow dots
    const dot = face.around(hc).at(s * 34, 42);
    if (dot) b.stick(new THREE.SphereGeometry(0.012, 6, 4), "#e8452c", dot, { embed: 0.4 });

    // ears
    const earBase = head.local({ up: 0.075, left: s * 0.055, forward: 0.02 });
    const earJ = b.joint(`ear${side}`, { parent: head, at: earBase, dir: [s * 0.25, 1, -0.2], role: "hinge" });
    b.extrude(
      [
        [-0.05, 0],
        [0.055, 0],
        [0.07, 0.09],
        [0.1, 0.22, "sharp"],
        [0.0, 0.12],
        [-0.045, 0.05],
      ],
      { at: earBase, x: [s, 0, 0], y: [0, 1, -0.2], thickness: 0.018, bevel: 0.004, color: WHITE, bone: earJ },
    );
    b.extrude(
      [
        [-0.03, 0.02],
        [0.04, 0.02],
        [0.05, 0.09],
        [0.083, 0.18, "sharp"],
        [0.0, 0.105],
        [-0.026, 0.06],
      ],
      {
        at: earBase.clone().add(new THREE.Vector3(0, 0.004, 0.012)),
        x: [s, 0, 0],
        y: [0, 1, -0.2],
        thickness: 0.01,
        color: RED,
        bone: earJ,
      },
    );

    // cheek ruff
    for (let i = 0; i < 3; i++) {
      const base = head.local({ left: s * 0.08, forward: 0.05, down: 0.01 + 0.028 * i });
      b.spike(base, [s * 0.8, -0.15 - 0.2 * i, -0.55], 0.11 - 0.015 * i, 0.032, { color: WHITE, bone: head });
    }

    // whiskers
    for (let i = 0; i < 3; i++) {
      const a = head.local({ left: s * 0.035, forward: 0.2, down: 0.002 + 0.01 * i });
      const e = new THREE.Vector3(a.x + s * 0.15, a.y - 0.02 - 0.025 * i, a.z - 0.02 + 0.02 * i);
      b.rod(a, e, [0.004, 0.0015], "#ffffff", { bone: head, sides: 4 });
    }
  }

  // forehead emblem
  const fh = face.around(hc).at(0, 62);
  if (fh) b.decal(face, BROW, { at: fh, size: [0.04, 0.06] });

  // ---------- fur ruffs ----------
  b.ring(neck.at(0.75), { count: 11, radius: 0.085, tilt: -50 }, (it) =>
    b.spike(it, it, 0.12, 0.034, { color: WHITE }),
  );
  b.ring(spine.at(1), { count: 7, radius: 0.12, fromDeg: 100, toDeg: 260, tilt: -55 }, (it) =>
    b.spike(it, it, 0.13, 0.035, { color: WHITE }),
  );

  // ---------- collar, beads, bell ----------
  const collarPt = neck.at(0.3);
  const collarPath = skin.loop(collarPt, { lift: 0.006 });
  b.sweep(collarPath, 0.014, { color: GOLD });
  let bead = 0;
  b.along(collarPath, 12, (at) => {
    b.stick(new THREE.SphereGeometry(0.02, 6, 4), bead++ % 2 ? "#e8452c" : "#fff7ee", at, { embed: 0.3 });
  });
  const bellHit = skin.around(collarPt.at).at(0, -45);
  if (bellHit) {
    b.spike(bellHit, [0, -1, 0.2], 0.12, 0.02, { color: RED });
    b.stick(new THREE.SphereGeometry(0.032, 8, 6), GOLD, bellHit, { embed: 0.3 });
  }

  // ---------- flames ----------
  const flame = (
    base: THREE.Vector3,
    h: number,
    r: number,
    bone: typeof hips,
    lean: [number, number, number],
  ) => {
    const p0 = base.clone();
    const p1 = p0.clone().add(new THREE.Vector3(0, h * 0.35, 0));
    const p2 = p0.clone().add(new THREE.Vector3(lean[0] * h * 0.2, h * 0.7, lean[2] * h * 0.2));
    const p3 = p0.clone().add(new THREE.Vector3(lean[0] * h, h, lean[2] * h));
    const sw = b.sweep(bezier(p0, p1, p2, p3), [r * 0.9, r, r * 0.8, r * 0.4, 0], {
      bone,
      sides: 6,
      smooth: false,
      bands: [
        [0.4, FLAME.core],
        [0.75, FLAME.mid],
        [1, FLAME.tip],
      ],
    });
    glow(sw, 1.3);
    return sw;
  };

  // ---------- nine tails ----------
  const tailBase = new THREE.Vector3(0, 0.63, -0.4);
  for (let i = 0; i < 9; i++) {
    const u = (i - 4) / 4;
    const yaw = u * 78 * D;
    const e0 = (15 + 20 * (1 - Math.abs(u)) + (i % 2 ? 7 : -3)) * D;
    const bend = 32 * D;
    const L = 0.8 + 0.17 * (1 - Math.abs(u));
    const pts: THREE.Vector3[] = [tailBase.clone().add(new THREE.Vector3(u * 0.035, 0, 0))];
    for (let j = 0; j < 4; j++) {
      const e = e0 + bend * ((j + 0.5) / 4);
      const d = new THREE.Vector3(Math.cos(e) * Math.sin(yaw), Math.sin(e), -Math.cos(e) * Math.cos(yaw));
      pts.push(pts[j].clone().addScaledVector(d, L / 4));
    }
    const chain = b.chain(`tail${i + 1}`, catmull(pts), {
      parent: hips,
      names: (k: number) => `tail${i + 1}_${k + 1}`,
      role: "tail",
    });
    const sw = b.sweep(chain, [0.03, 0.065, 0.08, 0.075, 0.05], { color: tailCoat, caps: "point" });

    // golden cuff
    const cp = chain.at(0.2);
    const sp = sw.at(0.2);
    b.part(new THREE.TorusGeometry(sp.radius + 0.004, 0.009, 5, 10), GOLD, {
      frame: cp,
      dir: cp.tangent,
      axis: "z",
    });

    // spirit flames on the tip
    const tipPt = chain.at(1);
    const fb = tipPt.at.clone().addScaledVector(tipPt.tangent, 0.06);
    const last = chain.joints[chain.joints.length - 1];
    const out = Math.sin(yaw);
    flame(fb, 0.26 + 0.05 * (1 - Math.abs(u)), 0.05, last, [out * 0.25, 0, 0]);
    flame(fb.clone().add(new THREE.Vector3(out * 0.035, 0.01, 0)), 0.15, 0.028, last, [out * 0.7 + 0.1, 0, 0]);
  }

  // ---------- floating hitodama ----------
  const spots: [number, number][] = [
    [40, 0.45],
    [-40, 0.9],
    [80, 0.7],
    [-85, 0.4],
    [105, 1.0],
    [-105, 0.75],
    [0, 1.3],
  ];
  spots.forEach(([deg, y], k) => {
    const a = deg * D;
    const base = new THREE.Vector3(0.72 * Math.sin(a), y, 0.1 + 0.72 * Math.cos(a));
    flame(base, 0.17 + 0.03 * (k % 3), 0.04 + 0.006 * (k % 2), hips, [0.15 * (k % 2 ? 1 : -1), 0, 0.05]);
  });

  // embers
  const rand = rng(11);
  let made = 0;
  let tries = 0;
  while (made < 16 && tries++ < 200) {
    const x = (rand() - 0.5) * 1.9;
    const y = 0.2 + rand() * 1.7;
    const z = (rand() - 0.5) * 1.9;
    if (Math.abs(x) < 0.3 && z > -0.6 && z < 0.85) continue;
    glow(b.part(new THREE.OctahedronGeometry(0.014), made % 3 ? FLAME.mid : FLAME.core, { bone: hips, at: [x, y, z] }), 1.5);
    made++;
  }

  return b.root;
}
```