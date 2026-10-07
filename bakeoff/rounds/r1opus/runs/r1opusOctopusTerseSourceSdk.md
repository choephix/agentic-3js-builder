```ts
import * as THREE from "three";
import { createBuilder, catmull, paint, spots, mottle, mix, smoothstep, rng } from "agentic-3js-builder";
import type { Chain, Hit } from "agentic-3js-builder";

export const meta = {
  name: "Octopus",
  description:
    "A stylized coral-red octopus in a rigging rest pose: eight arms splayed radially with curled tips, webbing between their roots, rows of suckers, hooded golden eyes with bar pupils, a siphon, mantle warts and a two-part beak.",
};

export default function build() {
  const b = createBuilder({ name: "octopus" });
  const R = rng(11);

  const PALE = "#f7cfae";
  const SUCKER = "#fbe3cf";
  const HOLE = "#b4473c";
  const EYE = "#f2c14e";
  const PUPIL = "#141014";
  const BEAK = "#2b1d1a";
  const WART = "#f3a07a";
  const PAPILLA = "#b83a2c";

  // Paints
  const skin = spots(
    mottle("#e4603f", "#c8442f", { size: 0.09, seed: 3 }),
    ["#8e2723", "#a3302a"],
    { size: 0.05, amount: 0.3, seed: 7 },
  );
  const bodyPaint = paint((p, n) => mix(skin.at(p, n), PALE, smoothstep(-0.15, -0.65, n.y)));
  const armPaint = paint((p, n, s) => {
    const d = 180 - Math.abs((((s[1] % 360) + 360) % 360) - 180); // 0 dorsal .. 180 belly
    let c = skin.at(p, n);
    c = mix(c, "#f08a62", 0.55 * smoothstep(0.72, 1, s[0]));
    return mix(c, PALE, 0.9 * smoothstep(105, 140, d));
  });
  const webPaint = paint((p, n) => mix(skin.at(p, n), "#7a2222", 0.3));

  // Skeleton core
  const root = b.joint("root", { at: [0, 0.06, 0] });
  const head = b.joint("head", { parent: root, at: [0, 0.12, 0.01], dir: [0, 1, 0], role: "head" });
  const mantle = b.chain(
    "mantle",
    [
      [0, 0.22, -0.02],
      [0, 0.33, -0.09],
      [0, 0.46, -0.21],
    ],
    { parent: head, names: ["mantle1", "mantle2", "mantleTip"], role: "spine" },
  );
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.03, 0.0], dir: [0, -0.4, 1], role: "jaw" });

  // Body: head + mantle
  const body = b.loft(
    [
      { at: [0, 0.012, 0.01], w: 0.16, h: 0.15 },
      { at: [0, 0.09, 0.015], w: 0.2, h: 0.18 },
      { at: [0, 0.165, 0.01], w: 0.23, h: 0.19 },
      { at: [0, 0.27, -0.05], w: 0.27, h: 0.26 },
      { at: [0, 0.38, -0.13], w: 0.24, h: 0.22 },
      { at: [0, 0.45, -0.21], w: 0.1, h: 0.09 },
    ],
    { color: bodyPaint, bone: [head, mantle], sides: 14, caps: { start: "flat", end: "round" }, name: "body" },
  );

  // Beak: upper on head, lower on jaw
  b.spike([0, 0.04, 0.015], [0, 0.014, 0.05], null, 0.013, { color: BEAK, bone: head, name: "beakUpper" });
  b.spike([0, 0.03, 0.0], [0, 0.009, 0.035], null, 0.011, { color: BEAK, bone: jaw, name: "beakLower" });

  // Arms
  const cupGeo = new THREE.CylinderGeometry(1, 0.9, 1, 10);
  const holeGeo = new THREE.CylinderGeometry(0.45, 0.45, 1, 8);
  const prof: Array<[number, number]> = [
    [0.05, 0.08],
    [0.15, 0.045],
    [0.28, 0.031],
    [0.41, 0.021],
    [0.53, 0.028],
    [0.61, 0.07],
    [0.6, 0.125],
    [0.565, 0.138],
  ];
  const radius = (t: number) => 0.046 * Math.pow(Math.max(1 - t, 0), 1.15) + 0.005;
  const arms: Array<{ angle: number; chain: Chain }> = [];

  for (let k = 0; k < 8; k++) {
    const left = k < 4;
    const i = k % 4;
    const deg = (22.5 + 45 * i) * (left ? 1 : -1);
    const a = (deg * Math.PI) / 180;
    const dx = Math.sin(a);
    const dz = Math.cos(a);
    const px = dz;
    const pz = -dx;
    const curl = (left ? 1 : -1) * (0.04 + 0.02 * R());
    const reach = 0.93 + 0.1 * R();
    const pts = prof.map(([r, y]) => {
      const o = curl * (r / 0.6) ** 2;
      return new THREE.Vector3(dx * r * reach + px * o, y, dz * r * reach + pz * o);
    });
    const name = `arm${left ? "L" : "R"}${i + 1}`;
    const chain = b.chain(name, catmull(pts), {
      parent: root,
      count: 5,
      names: [1, 2, 3, 4, 5].map((n) => `${name}_${n}`).concat([`${name}_tip`]),
      role: "tentacle",
      up: [0, 1, 0],
    });
    const sw = b.sweep(chain, radius, {
      color: armPaint,
      sides: 10,
      extend: [0.04, 0],
      caps: { start: "flat", end: "round" },
      name,
    });
    // Two staggered rows of suckers along the lower sides
    for (let j = 0; j < 11; j++)
      for (const side of [-1, 1]) {
        const t = 0.13 + ((j + (side > 0 ? 0 : 0.5)) / 11) * 0.82;
        const sp = sw.at(t, 180 + side * 42);
        const sr = radius(t) * 0.38;
        b.stick(cupGeo, SUCKER, sp, { scale: [sr, sr * 0.7, sr], embed: 0.45 });
        b.stick(holeGeo, HOLE, sp, { scale: [sr, sr * 0.7, sr], embed: 0.4 });
      }
    arms.push({ angle: (deg + 360) % 360, chain });
  }

  // Webbing between neighbouring arm roots
  arms.sort((x, y) => x.angle - y.angle);
  for (let k = 0; k < arms.length; k++) {
    const A = arms[k].chain;
    const B = arms[(k + 1) % arms.length].chain;
    b.membrane(A.path.slice(0, 0.27), B.path.slice(0, 0.27), {
      color: webPaint,
      thickness: 0.008,
      scallop: 0.45,
      rows: 3,
      name: `web${k + 1}`,
    });
  }

  // Eyes
  const surf = b.surface(body);
  const aroundHead = surf.around([0, 0.165, 0.01]);
  const UP = new THREE.Vector3(0, 1, 0);
  for (const side of [1, -1]) {
    const hit = aroundHead.at(side * 52, 12);
    if (!hit) continue;
    const n = hit.n;
    const r = 0.034;
    const c = hit.at.addScaledVector(n, r * 0.3);
    const tag = side > 0 ? "L" : "R";
    b.part(new THREE.SphereGeometry(r, 14, 10), EYE, { at: c, bone: head, name: `eye${tag}` });
    b.part(new THREE.BoxGeometry(0.028, 0.011, 0.012), PUPIL, {
      at: c.clone().addScaledVector(n, r * 0.92),
      dir: n,
      up: [0, 1, 0],
      axis: "z",
      bone: head,
      name: `pupil${tag}`,
    });
    const glint = n.clone().multiplyScalar(0.85).addScaledVector(UP, 0.4).normalize();
    b.part(new THREE.SphereGeometry(0.0065, 6, 4), "#ffffff", {
      at: c.clone().addScaledVector(glint, r * 0.98),
      bone: head,
      name: `glint${tag}`,
    });
    // Heavy brow lid
    const lidDir = n.clone().multiplyScalar(0.25).add(UP).normalize();
    b.part(new THREE.SphereGeometry(1, 12, 8), bodyPaint, {
      at: c.clone().addScaledVector(lidDir, r * 0.5),
      dir: lidDir,
      scale: [r * 1.15, r * 0.6, r * 1.15],
      bone: head,
      name: `lid${tag}`,
    });
    // Papilla "horn" above the eye
    const top = aroundHead.at(side * 46, 36);
    if (top)
      b.spike(top, top.n.clone().addScaledVector(UP, 0.6), 0.03, 0.01, {
        color: PAPILLA,
        bone: head,
        sides: 6,
        name: `papilla${tag}`,
      });
  }

  // Siphon on the right side
  const siphonHit = surf.around([0, 0.2, -0.04]).at(-100, -15);
  if (siphonHit) {
    const n = siphonHit.n.clone().addScaledVector(UP, -0.25).normalize();
    const a = siphonHit.at.addScaledVector(n, -0.012);
    const e = siphonHit.at.addScaledVector(n, 0.045);
    b.rod(a, e, [0.021, 0.015], { color: bodyPaint, bone: head, sides: 10, name: "siphon" });
    b.part(new THREE.TorusGeometry(0.015, 0.005, 6, 12), "#c8442f", {
      at: e,
      dir: n,
      axis: "z",
      bone: head,
      name: "siphonRim",
    });
  }

  // Warts on the mantle
  const wartGeo = new THREE.SphereGeometry(1, 6, 4);
  const warts: Hit[] = surf.scatter(40, {
    rng: rng(5),
    minDist: 0.028,
    filter: (h) => h.at.y > 0.22 && h.n.y > -0.2,
  });
  for (const h of warts) {
    const s = 0.006 + 0.008 * R();
    b.stick(wartGeo, WART, h, { scale: [s, s * 0.6, s], embed: 0.5 });
  }

  return b.root;
}
```