```ts
import * as THREE from "three";
import { createBuilder, paint, mix, smoothstep, noise, svg, rng, catmull, frame } from "agentic-3js-builder";
import type { Rgb } from "agentic-3js-builder";

export const meta = {
  name: "Fennec Kit at Dusk",
  description:
    "A fennec fox kit standing alert on a little wind-rippled sand dune at dusk: enormous satin ears lined in peach, cream fur warming to sandy gold, a fluffy black-smudged tail, big sparkling eyes, oversized paws and a woven leather collar with a brass bell.",
};

export default function build() {
  const V = THREE.Vector3;
  const b = createBuilder({ name: "fennecKit", paintSize: 2048 });

  const G = 0.074; // dune top, where the paws stand
  const H = G + 0.157; // head centre height

  const CREAM = "#f7ecda";
  const PALE = "#fff8ec";
  const GOLD = "#dca660";
  const DEEP = "#bf8443";

  const seg2 = (px: number, py: number, ax: number, ay: number, bx: number, by: number) => {
    const dx = bx - ax;
    const dy = by - ay;
    const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
    return Math.hypot(px - ax - t * dx, py - ay - t * dy);
  };

  // ---------------------------------------------------------------- paints
  const fur = paint((p, n) => {
    const shade = mix(GOLD, DEEP, noise(p, 0.035, 2) * 0.7);
    let k = smoothstep(-0.1, 0.65, n.y);
    k *= smoothstep(G + 0.03, G + 0.075, p.y);
    const c = mix(CREAM, shade, k);
    return mix(c, PALE, smoothstep(-0.3, -0.8, n.y) * 0.7);
  });

  const eyes: THREE.Vector3[] = [];
  const headPaint = paint((p, n) => {
    const crown = smoothstep(-0.05, 0.55, n.y) * (1 - smoothstep(0.108, 0.13, p.z));
    const bridge = smoothstep(0.4, 0.9, n.y) * 0.6;
    const back = smoothstep(0.08, 0.06, p.z) * smoothstep(-0.5, 0.2, n.y);
    let c: Rgb = mix(CREAM, mix(GOLD, DEEP, noise(p, 0.03, 2) * 0.5), Math.max(crown, bridge, back));
    for (const e of eyes) {
      const d = p.distanceTo(e);
      c = mix(c, PALE, smoothstep(0.022, 0.017, d));
      c = mix(c, "#4a2c1c", smoothstep(0.0165, 0.0145, d));
    }
    if (n.z > 0.05 && p.z > 0.1) {
      const sx = Math.sign(p.x) || 1;
      const d = seg2(p.x, p.y, sx * 0.017, H - 0.006, sx * 0.012, H - 0.023);
      c = mix(c, "#5b3522", smoothstep(0.0026, 0.0014, d));
    }
    return c;
  });

  const earBack = paint((p) =>
    mix(mix(GOLD, DEEP, noise(p, 0.03, 4) * 0.6), "#9c6436", smoothstep(H + 0.07, H + 0.135, p.y)),
  );
  const earInner = paint((p) => {
    const t = smoothstep(H + 0.02, H + 0.12, p.y);
    const c = mix("#f9d6bd", "#f2ad92", t * 0.8);
    return mix(c, "#fff0e4", smoothstep(0.55, 0.85, noise(p, 0.02, 8)) * 0.5);
  });

  const tailPaint = paint((p, n) => {
    let c: Rgb = mix(CREAM, mix(GOLD, DEEP, noise(p, 0.03, 6) * 0.6), smoothstep(-0.35, 0.5, n.y));
    const gland = p.distanceTo(new V(0, G + 0.104, -0.11));
    c = mix(c, "#3b2618", smoothstep(0.009, 0.004, gland) * 0.85);
    const t = Math.min(1, Math.max(0, (-p.z - 0.08) / 0.16));
    const tip = smoothstep(0.78, 0.92, t + 0.12 * (noise(p, 0.015, 3) - 0.5));
    return mix(c, "#1c1410", tip);
  });

  const collarPaint = paint((p, n, s) => {
    const t = s[0];
    const d = s[1];
    const across = Math.abs(((d + 90) % 360) - 180) / 180;
    const v = t * 60 + across * 2.5;
    const strand = Math.floor(v);
    return mix(strand % 2 ? "#7b4423" : "#5c3018", "#a0623a", smoothstep(0.55, 1, v % 1) * 0.55);
  });

  // neck / collar geometry, needed by the bell paint
  const n0 = new V(0, G + 0.108, 0.062);
  const n1 = new V(0, G + 0.152, 0.09);
  const axis = n1.clone().sub(n0).normalize();
  const collarC = n0.clone().lerp(n1, 0.45);
  const front = new V(0, 0, 1).addScaledVector(axis, -axis.z).normalize();
  const sideV = axis.clone().cross(front).normalize();
  const collarR = 0.022 - 0.003 * 0.45 + 0.0022;
  const ringPt = (deg: number, r: number) =>
    collarC
      .clone()
      .addScaledVector(front, Math.cos((deg * Math.PI) / 180) * r)
      .addScaledVector(sideV, Math.sin((deg * Math.PI) / 180) * r);
  const hang = ringPt(0, collarR + 0.0022);
  const bellC = hang.clone().add(new V(0, -0.008, 0.003));

  const LIGHT = new V(0.35, 0.8, 0.5).normalize();
  const bellPaint = paint((p, n) => {
    const l = n.dot(LIGHT);
    let c: Rgb = mix("#7a4e12", "#e8b84a", smoothstep(-0.5, 0.7, l));
    c = mix(c, "#fff4cf", smoothstep(0.88, 0.97, l));
    const rel = p.clone().sub(bellC);
    if (rel.y < -0.0015 && Math.abs(rel.x) < 0.0009) c = mix(c, "#2a1a0a", 0.9);
    if (Math.abs(rel.y) < 0.0005) c = mix(c, "#8a5a18", 0.7);
    return c;
  });

  const prints: Array<[number, number]> = [];
  for (let i = 0; i < 10; i++) {
    const z = -0.09 - i * 0.026;
    const xc = 0.03 * Math.sin(i * 0.5);
    prints.push([xc + (i % 2 ? 0.012 : -0.012), z]);
  }
  const SUN = new V(0.5, 0.45, 0.75).normalize();
  const sand = paint((p, n) => {
    const base = mix("#e9b98a", "#d79c6a", noise(p, 0.08, 4));
    const r = Math.sin((p.x * 0.8 + p.z * 0.6) * 260 + noise(p, 0.05, 7) * 6);
    let c: Rgb = mix(base, "#c4865a", smoothstep(0.75, 0.98, r) * 0.55 * smoothstep(0.3, 0.9, n.y));
    const lit = n.dot(SUN);
    c = mix(c, "#9a6f9e", smoothstep(0.35, -0.1, lit) * 0.45);
    c = mix(c, "#ffcf96", smoothstep(0.6, 0.95, lit) * 0.35);
    if (n.y > 0.5 && p.z < -0.07)
      for (const [fx, fz] of prints) {
        const e = ((p.x - fx) / 0.0065) ** 2 + ((p.z - fz) / 0.0085) ** 2;
        if (e < 1.6) c = mix(c, "#b98060", smoothstep(1.3, 0.5, e) * 0.75);
      }
    return c;
  });

  // ---------------------------------------------------------------- textures
  const furTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64"><path d="M16 64 C8 50 5 30 9 4 C12 22 14 34 16 44 C17 30 19 16 24 2 C27 26 25 48 16 64 Z" fill="#ffffff"/><path d="M16 60 C12 48 12 36 15 22 C17 36 19 48 16 60 Z" fill="#e4e4e4"/></svg>`,
    { size: 128 },
  );
  const grassTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M30 64 C28 40 22 20 10 4 C26 18 32 40 34 64 Z" fill="#c8a058"/><path d="M32 64 C34 36 40 18 54 2 C42 22 38 42 36 64 Z" fill="#b48a46"/><path d="M31 64 C31 40 32 22 33 0 C35 24 35 44 35 64 Z" fill="#d9b673"/></svg>`,
    { size: 128 },
  );

  // ---------------------------------------------------------------- skeleton
  b.joint("root", { at: [0, 0, 0] });
  const spine = b.chain(
    "spine",
    [
      [0, G + 0.09, -0.055],
      [0, G + 0.093, 0],
      [0, G + 0.098, 0.05],
    ],
    { parent: "root", names: ["hips", "spine1", "chest"], role: "spine" },
  );
  const neckChain = b.chain("neckChain", [n0, n1], { parent: "chest", names: ["neck"], role: "neck" });
  b.joint("head", { parent: "neck", at: n1, dir: [0, 0.2, 1], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, H - 0.02, 0.1], dir: [0, -0.25, 1], role: "jaw" });

  // ---------------------------------------------------------------- dune
  const dune = b.lathe(
    [
      [0, 0],
      [0.36, 0],
      [0.33, 0.012],
      [0.26, 0.036],
      [0.18, 0.058],
      [0.12, 0.0738],
      [0, 0.075],
    ],
    { color: sand, at: [0, 0, 0], segments: 11, bone: "root", name: "dune" },
  );
  const mound = b.lathe(
    [
      [0, 0],
      [0.15, 0],
      [0.1, 0.018],
      [0.04, 0.034],
      [0, 0.036],
    ],
    { color: sand, at: [-0.28, 0, -0.2], segments: 9, spin: 15, bone: "root", name: "mound" },
  );
  const duneSurf = b.surface([dune, mound]);
  const down = (x: number, z: number) => duneSurf.ray([x, 1, z], [0, -1, 0]);

  const grassHits = [];
  const gr = rng(11);
  for (const [x, z] of [
    [0.24, 0.06],
    [0.21, 0.13],
    [-0.2, 0.16],
    [0.06, -0.28],
    [-0.36, -0.12],
    [0.27, -0.14],
  ])
    for (let k = 0; k < 3; k++) {
      const h = down(x + (gr() - 0.5) * 0.02, z + (gr() - 0.5) * 0.02);
      if (h) grassHits.push(h);
    }
  b.cards(grassHits, grassTex, {
    size: [0.045, 0.06],
    cross: true,
    lean: 10,
    vary: 0.35,
    spin: 180,
    rng: rng(12),
    bone: "root",
    sink: 0.05,
    name: "grass",
  });

  const pr = rng(31);
  [
    [0.15, 0.2],
    [0.17, 0.225],
    [-0.12, 0.24],
    [0.3, -0.02],
    [-0.26, -0.02],
    [-0.1, -0.3],
  ].forEach(([x, z], i) => {
    const h = down(x, z);
    if (!h) return;
    b.stick(new THREE.IcosahedronGeometry(0.007 + pr() * 0.005, 0), i % 2 ? "#a07658" : "#8d6a58", h, {
      embed: 0.35,
      scale: [1.2, 0.6, 1],
      spin: pr() * 360,
      flat: true,
      bone: "root",
      name: `pebble${i}`,
    });
  });

  // ---------------------------------------------------------------- body
  const body = b.loft(
    [
      { at: [0, G + 0.088, -0.08], w: 0.046, h: 0.046 },
      { at: [0, G + 0.09, -0.045], w: 0.066, h: 0.062 },
      { at: [0, G + 0.092, -0.005], w: 0.06, h: 0.058 },
      { at: [0, G + 0.096, 0.035], w: 0.066, h: 0.066 },
      { at: [0, G + 0.101, 0.062], w: 0.05, h: 0.052 },
    ],
    { color: fur, bone: spine, name: "body" },
  );
  const neck = b.sweep(neckChain, [0.022, 0.019], { color: fur, name: "neckFur" });

  // ---------------------------------------------------------------- head
  const headLoft = b.loft(
    [
      { at: [0, H + 0.002, 0.064], w: 0.052, h: 0.05 },
      { at: [0, H, 0.09], w: 0.078, h: 0.07 },
      { at: [0, H - 0.006, 0.118], w: 0.06, h: 0.05 },
      { at: [0, H - 0.012, 0.14], w: 0.028, h: 0.026 },
      { at: [0, H - 0.014, 0.156], w: 0.013, h: 0.014 },
    ],
    { color: headPaint, bone: "head", name: "skull" },
  );
  b.loft(
    [
      { at: [0, H - 0.021, 0.1], w: 0.032, h: 0.018 },
      { at: [0, H - 0.025, 0.128], w: 0.022, h: 0.012 },
      { at: [0, H - 0.027, 0.145], w: 0.01, h: 0.007 },
    ],
    { color: "#f8efe2", bone: "jaw", name: "lowerJaw" },
  );
  b.part(new THREE.SphereGeometry(0.0075, 10, 7), "#2a1a14", {
    at: [0, H - 0.011, 0.158],
    scale: [1.2, 0.8, 0.9],
    bone: "head",
    name: "nose",
  });
  b.part(new THREE.SphereGeometry(0.0017, 6, 4), "#ffffff", {
    at: [0.003, H - 0.007, 0.163],
    bone: "head",
    name: "noseGlint",
  });

  const headSurf = b.surface(headLoft);
  for (const sx of [1, -1]) {
    const target = new V(0.024 * sx, H + 0.005, 0.11);
    const dir = new V(0.55 * sx, 0.12, 1).normalize();
    const hit = headSurf.ray(target.clone().addScaledVector(dir, 0.15), dir.clone().negate()) ?? headSurf.nearest(target);
    eyes.push(hit.at);
    const tag = sx > 0 ? "L" : "R";
    b.stick(new THREE.SphereGeometry(0.0125, 14, 10), "#1d110c", hit, {
      embed: 0.4,
      flow: [0, 1, 0],
      scale: [1.05, 0.55, 1.15],
      bone: "head",
      name: `eye${tag}`,
    });
    const n = hit.n;
    const up = new V(0, 1, 0).addScaledVector(n, -n.y).normalize();
    b.part(new THREE.SphereGeometry(0.0026, 8, 6), "#ffffff", {
      at: hit.at.addScaledVector(n, 0.0072).addScaledVector(up, 0.0045).add(new V(0.0015 * sx, 0, 0)),
      bone: "head",
      name: `glint${tag}`,
    });
    b.part(new THREE.SphereGeometry(0.0012, 6, 4), "#ffffff", {
      at: hit.at.addScaledVector(n, 0.0074).addScaledVector(up, -0.003).add(new V(-0.002 * sx, 0, 0)),
      bone: "head",
      name: `glintSmall${tag}`,
    });
    // whiskers
    for (let k = 0; k < 3; k++) {
      const dy = (k - 1) * 0.003;
      b.rod(
        [sx * 0.009, H - 0.013 + dy, 0.143],
        [sx * 0.052, H - 0.012 + dy * 3, 0.15 - k * 0.006],
        0.0005,
        { color: "#3b2b22", bone: "head", sides: 3, name: `whisker${tag}${k}` },
      );
    }
  }

  // ---------------------------------------------------------------- ears
  const earW = (t: number) => 0.029 * Math.sin(Math.PI * (0.22 + 0.78 * t)) + 0.0008;
  for (const sx of [1, -1]) {
    const tag = sx > 0 ? "L" : "R";
    const ear = b.chain(
      `ear${tag}`,
      catmull([
        [0.02 * sx, H + 0.022, 0.082],
        [0.048 * sx, H + 0.075, 0.076],
        [0.07 * sx, H + 0.125, 0.068],
      ]),
      { parent: "head", names: [`ear${tag}1`, `ear${tag}2`], up: [0.35 * sx, 0, 1], role: "hinge" },
    );
    b.sweep(ear, (t) => [earW(t), 0.005] as const, { color: earBack, extend: [0.008, 0], name: `ear${tag}` });
    b.sweep(ear, (t) => [earW(t) * 0.7, 0.0022] as const, {
      color: earInner,
      from: 0.05,
      to: 0.9,
      shift: [0, 0.0035],
      name: `earLining${tag}`,
    });
    const frames = [];
    const flows: THREE.Vector3[] = [];
    for (const t of [0.06, 0.14, 0.22, 0.3])
      for (const o of [-0.6, 0, 0.6]) {
        const cp = ear.at(t);
        const at = cp.at.addScaledVector(cp.normal, 0.0055).addScaledVector(cp.binormal, o * earW(t) * 0.6);
        frames.push(frame(at, cp.normal));
        flows.push(cp.tangent);
      }
    b.cards(frames, furTex, {
      size: [0.011, 0.024],
      lean: 60,
      flow: (_f, i) => flows[i],
      color: PALE,
      vary: 0.3,
      spin: 12,
      rng: rng(sx > 0 ? 3 : 4),
      name: `earTufts${tag}`,
    });
  }

  // ---------------------------------------------------------------- tail
  const tail = b.chain(
    "tail",
    catmull([
      [0, G + 0.092, -0.08],
      [0, G + 0.082, -0.12],
      [0, G + 0.078, -0.165],
      [0, G + 0.088, -0.205],
      [0, G + 0.108, -0.228],
    ]),
    { parent: "hips", role: "tail" },
  );
  const tailTube = b.sweep(tail, [0.01, 0.02, 0.026, 0.024, 0.013], { color: tailPaint, name: "tailFur" });
  b.cards(b.surface(tailTube).scatter(48, { rng: rng(5), minDist: 0.007 }), furTex, {
    size: [0.016, 0.028],
    lean: 65,
    flow: [0, 0.15, -1],
    color: tailPaint,
    vary: 0.35,
    spin: 20,
    rng: rng(6),
    name: "tailFluff",
  });

  // ---------------------------------------------------------------- legs and oversized paws
  const leg = (sx: number, isFront: boolean) => {
    const tag = sx > 0 ? "L" : "R";
    const pts = isFront
      ? [
          [0.027, G + 0.08, 0.045],
          [0.03, G + 0.047, 0.05],
          [0.03, G + 0.017, 0.047],
          [0.03, G + 0.005, 0.06],
        ]
      : [
          [0.03, G + 0.082, -0.05],
          [0.036, G + 0.05, -0.026],
          [0.034, G + 0.024, -0.062],
          [0.033, G + 0.005, -0.05],
        ];
    const names = (isFront ? ["shoulder", "elbow", "wrist", "hand"] : ["hip", "knee", "hock", "foot"]).map(
      (n) => n + tag,
    );
    const ch = b.chain(`leg${isFront ? "F" : "H"}${tag}`, pts.map(([x, y, z]) => [x * sx, y, z]), {
      parent: isFront ? "chest" : "hips",
      names,
      role: "leg",
    });
    b.sweep(ch, isFront ? [0.014, 0.0095, 0.0085, 0.008] : [0.02, 0.013, 0.0085, 0.008], {
      color: fur,
      name: `legFur${isFront ? "F" : "H"}${tag}`,
    });
    const pc = isFront ? new V(0.03 * sx, G + 0.008, 0.058) : new V(0.033 * sx, G + 0.008, -0.047);
    b.part(new THREE.SphereGeometry(0.0135, 10, 7), "#f3e6d1", {
      at: pc,
      scale: [1.05, 0.62, 1.3],
      bone: names[3],
      flat: true,
      name: `paw${isFront ? "F" : "H"}${tag}`,
    });
    for (const dx of [-0.0075, 0, 0.0075])
      b.part(new THREE.SphereGeometry(0.0048, 8, 6), "#efdfc6", {
        at: [pc.x + dx, G + 0.0055, pc.z + 0.0145 - Math.abs(dx) * 0.3],
        bone: names[3],
        flat: true,
      });
  };
  for (const sx of [1, -1]) {
    leg(sx, true);
    leg(sx, false);
  }

  // ---------------------------------------------------------------- fur tufts
  b.cards(
    b.surface([body, neck]).scatter(26, {
      rng: rng(21),
      minDist: 0.006,
      filter: (h) => h.n.z > 0.35 && h.at.y < G + 0.13 && h.at.y > G + 0.075,
    }),
    furTex,
    { size: [0.013, 0.026], lean: 55, flow: [0, -1, 0.15], color: PALE, vary: 0.3, spin: 15, rng: rng(22), name: "chestRuff" },
  );
  b.cards(
    headSurf.scatter(14, {
      rng: rng(41),
      minDist: 0.005,
      filter: (h) =>
        Math.abs(h.n.x) > 0.6 &&
        h.at.y < H + 0.004 &&
        h.at.z > 0.07 &&
        h.at.z < 0.112 &&
        eyes.every((e) => e.distanceTo(h.at) > 0.02),
    }),
    furTex,
    { size: [0.012, 0.024], lean: 65, flow: [0, -0.5, -1], color: CREAM, vary: 0.3, spin: 15, rng: rng(42), name: "cheekTufts" },
  );

  // ---------------------------------------------------------------- collar and bell
  const collarPts = Array.from({ length: 12 }, (_, i) => ringPt(i * 30, collarR));
  b.sweep(catmull(collarPts, { closed: true }), () => [0.0022, 0.0055] as const, {
    section: "box",
    color: collarPaint,
    bone: "neck",
    up: axis,
    name: "collar",
  });
  for (const deg of [-90, -45, 45, 90])
    b.part(new THREE.SphereGeometry(0.0016, 6, 4), "#d9a640", {
      at: ringPt(deg, collarR + 0.0022),
      bone: "neck",
      flat: true,
    });
  const radial = ringPt(135, 1).sub(collarC).normalize();
  b.part(new THREE.BoxGeometry(0.007, 0.009, 0.002), "#d9a640", {
    at: ringPt(135, collarR + 0.0024),
    dir: radial,
    axis: "z",
    up: axis,
    bone: "neck",
    name: "buckle",
  });
  b.part(new THREE.TorusGeometry(0.0022, 0.0007, 6, 10), "#c9962e", {
    at: hang.clone().add(new V(0, -0.0016, 0.001)),
    rotation: [0, 90, 0],
    bone: "neck",
    name: "bellLoop",
  });
  b.part(new THREE.SphereGeometry(0.0065, 12, 9), bellPaint, { at: bellC, bone: "neck", name: "bell" });

  return b.root;
}
```