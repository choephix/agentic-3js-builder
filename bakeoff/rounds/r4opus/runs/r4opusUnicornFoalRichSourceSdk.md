```ts
import * as THREE from "three";
import { createBuilder, rng, paint, mix, noise, smoothstep, polyline, catmull, bezier, DEG } from "agentic-3js-builder";
import type { PointInput } from "agentic-3js-builder";

export const meta = {
  name: "Unicorn Foal",
  description:
    "A newborn unicorn foal on long, knobbly, slightly splayed legs: a pearly coat with a lilac shimmer, a fluffy pastel mane and tail, a small gold spiral horn, big dark lashed eyes, silver hooves and a daisy chain around its neck.",
};

export default function build() {
  const b = createBuilder({ name: "unicornFoal", paintSize: 1024 });
  const R = rng(11);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---------------------------------------------------------------- palette
  const PEARL = "#fbf8ff";
  const LILAC = "#e2d2fb";
  const BLUSH = "#f8def0";
  const STOCK = "#d6c3f5";
  const MUZZLE = "#efcfe0";
  const CHEEK = "#ffbdd9";
  const EYE = "#22162e";
  const LASH = "#2a1b33";
  const WHITE = "#ffffff";
  const GOLD = "#eebd45";
  const GOLD_LIGHT = "#ffe28c";
  const SILVER = "#cdd2df";
  const INNER_EAR = "#f6b3cd";
  const NOSTRIL = "#b07a97";
  const STEM = "#78bf73";
  const LEAF = "#5faa62";
  const PETAL = "#fffdf4";
  const PETAL_PINK = "#ffe3ef";
  const DAISY_HEART = "#ffc93a";
  const MANE_HUES = [
    ["#ffaecf", "#ffcfe3"],
    ["#a2e8cd", "#c8f5e3"],
    ["#c5adf5", "#ddd0fb"],
  ];
  let maneIndex = 0;
  const maneColor = () => {
    const hue = MANE_HUES[maneIndex++ % 3];
    return hue[R() < 0.6 ? 0 : 1];
  };

  // Pearly coat: lilac shimmer in soft clouds and on the undersides, pink iridescence, lilac stockings,
  // a pink muzzle and blushing cheeks.
  const coat = paint((p, n) => {
    const sh = noise(p, 0.16, 4);
    const t = 0.08 + 0.4 * smoothstep(0.42, 0.78, sh) + 0.32 * smoothstep(0.15, -0.7, n.y);
    let c = mix(PEARL, LILAC, t);
    c = mix(c, BLUSH, 0.45 * smoothstep(0.58, 0.82, noise(p, 0.11, 9)));
    c = mix(c, STOCK, 0.75 * smoothstep(0.3, 0.09, p.y));
    if (p.z > 0.5 && p.y > 0.9) c = mix(c, MUZZLE, smoothstep(0.55, 0.62, p.z));
    const d = Math.hypot(Math.abs(p.x) - 0.057, p.y - 1.11, p.z - 0.505);
    c = mix(c, CHEEK, 0.7 * smoothstep(0.032, 0.008, d));
    return c;
  });

  // ---------------------------------------------------------------- skeleton: torso
  b.joint("hips", { at: [0, 0.75, -0.24], dir: [0, 0, 1] });
  const bodyPath = catmull([
    [0, 0.75, -0.24],
    [0, 0.765, -0.02],
    [0, 0.78, 0.2],
  ]);
  const spine = b.chain("spine", bodyPath, { parent: "hips", names: ["spine1", "spine2"], role: "spine" });
  const body = b.sweep(bodyPath, (t: number) => [0.11 + 0.014 * Math.sin(Math.PI * t), 0.13 + 0.02 * t] as const, {
    color: coat,
    bone: [spine],
    sides: 16,
    name: "body",
  });

  // ---------------------------------------------------------------- neck & head
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.8, 0.13],
      [0, 0.97, 0.27],
      [0, 1.1, 0.36],
    ]),
    { parent: "spine2", names: ["neck1", "neck2"], role: "neck" },
  );
  const neckSweep = b.sweep(neck, (t: number) => [0.056 - 0.014 * t, 0.085 - 0.028 * t] as const, {
    color: coat,
    sides: 12,
    name: "neck",
  });

  b.joint("head", { parent: "neck2", at: [0, 1.11, 0.37], dir: [0, -0.3, 1], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 1.075, 0.47], aim: [0, 1.025, 0.6], role: "jaw" });

  const head = b.loft(
    [
      { at: [0, 1.165, 0.35], w: 0.125, h: 0.12 },
      { at: [0, 1.155, 0.42], w: 0.15, h: 0.15 },
      { at: [0, 1.115, 0.5], w: 0.115, h: 0.115 },
      { at: [0, 1.075, 0.565], w: 0.095, h: 0.09 },
      { at: [0, 1.05, 0.61], w: 0.09, h: 0.075 },
    ],
    { color: coat, bone: "head", sides: 14, name: "head" },
  );
  b.capsule([0, 1.07, 0.48], [0, 1.028, 0.59], [0.036, 0.03], { color: coat, bone: "jaw", sides: 10, name: "lowerJaw" });

  const headSurf = b.surface(head);
  const hitOn = (origin: THREE.Vector3, dir: THREE.Vector3, fallback: THREE.Vector3) =>
    headSurf.ray(origin, dir) ?? headSurf.nearest(fallback);

  // Nostrils
  for (const s of [1, -1]) {
    const h = hitOn(V(s * 0.024, 1.07, 0.95), V(0, -0.12, -1), V(s * 0.024, 1.065, 0.65));
    b.stick(new THREE.SphereGeometry(0.009, 8, 6), NOSTRIL, h, {
      scale: [0.75, 0.4, 1.3],
      embed: 0.5,
      bone: "head",
      name: s > 0 ? "nostrilL" : "nostrilR",
    });
  }

  // Eyes: big glossy ovals, two highlights, a lid line and sweeping lashes.
  for (const side of [1, -1]) {
    const target = V(side * 0.05, 1.17, 0.455);
    const out = V(side * 0.92, 0.12, 0.37).normalize();
    const hit = hitOn(target.clone().addScaledVector(out, 0.5), out.clone().negate(), target);
    const n = hit.n.clone().normalize();
    const tag = side > 0 ? "L" : "R";
    b.stick(new THREE.SphereGeometry(0.03, 16, 12), EYE, hit, {
      scale: [1, 0.62, 1.12],
      embed: 0.35,
      bone: "head",
      name: "eye" + tag,
    });
    const eyeC = hit.at.clone().addScaledVector(n, 0.0056);
    const up = V(0, 1, 0).addScaledVector(n, -n.y).normalize();
    const fwd = V(0, 0, 1);
    fwd.addScaledVector(n, -fwd.dot(n)).addScaledVector(up, -fwd.dot(up)).normalize();

    const glint = (o: THREE.Vector3, r: number) =>
      b.part(new THREE.SphereGeometry(r, 10, 8), WHITE, { at: o, dir: n, scale: [1, 0.5, 1], bone: "head" });
    glint(eyeC.clone().addScaledVector(n, 0.0165).addScaledVector(up, 0.01).addScaledVector(fwd, 0.008), 0.0072);
    glint(eyeC.clone().addScaledVector(n, 0.017).addScaledVector(up, -0.009).addScaledVector(fwd, -0.008), 0.0038);

    const lidAt = (deg: number) =>
      eyeC
        .clone()
        .addScaledVector(n, 0.007)
        .addScaledVector(fwd, Math.cos(deg * DEG) * 0.031)
        .addScaledVector(up, Math.sin(deg * DEG) * 0.035);
    const lid: THREE.Vector3[] = [];
    for (let k = 0; k <= 8; k++) lid.push(lidAt(12 + (k * (172 - 12)) / 8));
    b.sweep(catmull(lid), 0.0042, { color: LASH, bone: "head", sides: 6, name: "lid" + tag });

    const lashes: Array<[number, number]> = [
      [62, 0.018],
      [85, 0.022],
      [108, 0.026],
      [128, 0.03],
      [148, 0.033],
      [166, 0.031],
    ];
    for (const [deg, len] of lashes) {
      const base = lidAt(deg);
      const radial = fwd
        .clone()
        .multiplyScalar(Math.cos(deg * DEG))
        .addScaledVector(up, Math.sin(deg * DEG));
      const dir = radial.multiplyScalar(0.55).addScaledVector(n, 0.55).addScaledVector(up, 0.25).normalize();
      const p1 = base.clone().addScaledVector(dir, len * 0.55);
      const p2 = base
        .clone()
        .addScaledVector(dir, len * 0.8)
        .addScaledVector(up, len * 0.35)
        .addScaledVector(fwd, -len * 0.15);
      b.sweep(bezier(base, p1, p2), [0.0032, 0.0007], {
        color: LASH,
        bone: "head",
        sides: 5,
        caps: { start: "round", end: "point" },
      });
    }
  }

  // Ears: leaf-shaped, pink inside.
  for (const side of [1, -1]) {
    const tag = side > 0 ? "L" : "R";
    const base = V(side * 0.038, 1.215, 0.365);
    const tip = V(side * 0.074, 1.335, 0.335);
    const ear = b.chain("ear" + tag, polyline([base, tip]), { parent: "head", names: ["ear" + tag], up: [0, 0, 1] });
    b.sweep(
      ear,
      (t: number) => [0.027 * Math.pow(Math.sin(Math.PI * (0.3 + 0.7 * t)), 0.7), 0.011 * (1 - 0.75 * t)] as const,
      { color: coat, sides: 10, caps: { start: "round", end: "point" }, name: "ear" + tag },
    );
    const along = tip.clone().sub(base).normalize();
    const face = V(0, 0, 1).addScaledVector(along, -along.z).normalize().multiplyScalar(0.0075);
    const a = base.clone().addScaledVector(along, 0.025).add(face);
    const c = tip.clone().addScaledVector(along, -0.018).add(face);
    b.sweep(
      polyline([a, c]),
      (t: number) => [0.016 * Math.pow(Math.sin(Math.PI * (0.25 + 0.75 * t)), 0.8), 0.005] as const,
      { color: INNER_EAR, bone: "ear" + tag, up: [0, 0, 1], sides: 8, caps: { start: "round", end: "point" } },
    );
  }

  // Horn: a small gold cone with a pale-gold spiral ridge.
  const hornHit = hitOn(V(0, 1.6, 0.45), V(0, -1, 0), V(0, 1.22, 0.45));
  const hornDir = V(0, 0.85, 0.45).normalize();
  const hornLen = 0.14;
  const hornBase = hornHit.at.clone().addScaledVector(hornDir, -0.012);
  b.spike(hornBase, hornDir, hornLen, 0.024, { color: GOLD, bone: "head", sides: 10, name: "horn" });
  const hu = V(1, 0, 0);
  const hv = hornDir.clone().cross(hu).normalize();
  const ridge: THREE.Vector3[] = [];
  const turns = 3.25;
  for (let i = 0; i <= 52; i++) {
    const f = 0.07 + (0.85 * i) / 52;
    const ang = 2 * Math.PI * turns * f;
    const r = 0.024 * (1 - f) + 0.0008;
    ridge.push(
      hornBase
        .clone()
        .addScaledVector(hornDir, hornLen * f)
        .addScaledVector(hu, Math.cos(ang) * r)
        .addScaledVector(hv, Math.sin(ang) * r),
    );
  }
  b.sweep(catmull(ridge), (t: number) => 0.0052 * (1 - 0.7 * t), {
    color: GOLD_LIGHT,
    bone: "head",
    sides: 6,
    name: "hornRidge",
  });

  // ---------------------------------------------------------------- fluff
  const puffGeo = new THREE.IcosahedronGeometry(1, 1);
  const puff = (at: PointInput, r: number, color: string, bone?: string) =>
    b.part(puffGeo, color, {
      at,
      scale: r * (0.9 + 0.25 * R()),
      rotation: [R() * 360, R() * 360, R() * 360],
      flat: true,
      ...(bone ? { bone } : {}),
    });

  // Short upright mane along the crest of the neck.
  for (let i = 0; i < 10; i++) {
    const t = 0.22 + (0.78 * i) / 9;
    const r = 0.042 - (0.01 * i) / 9;
    puff(neckSweep.at(t, 0).moved([0, r * 0.35, 0]), r, maneColor());
    for (const s of [-1, 1]) {
      const tt = Math.min(1, t + 0.04);
      puff(neckSweep.at(tt, s * 32).moved([0, r * 0.15, 0]), r * 0.78, maneColor());
    }
  }

  // Forelock tufts between the ears and around the horn base.
  const tufts: Array<[number, number, number]> = [
    [0, 0.37, 0.032],
    [0.022, 0.395, 0.028],
    [-0.022, 0.395, 0.028],
    [0, 0.418, 0.026],
    [0.026, 0.44, 0.02],
    [-0.026, 0.44, 0.02],
  ];
  for (const [x, z, r] of tufts) {
    const h = hitOn(V(x, 1.6, z), V(0, -1, 0), V(x, 1.22, z));
    puff(h.moved([0, r * 0.3, 0]), r, maneColor(), "head");
  }

  // Tail: a short dock with a pom of pastel puffs.
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.83, -0.31],
      [0, 0.815, -0.4],
      [0, 0.765, -0.465],
      [0, 0.7, -0.5],
    ]),
    { parent: "hips", names: ["tail1", "tail2", "tail3"], role: "tail" },
  );
  b.sweep(tail, (t: number) => 0.028 * (1 - 0.45 * t), { color: coat, sides: 8, name: "tailDock" });
  const tailRings: Array<[number, number, number]> = [
    [0.22, 4, 0.03],
    [0.42, 5, 0.035],
    [0.62, 6, 0.04],
    [0.8, 6, 0.042],
    [0.95, 5, 0.038],
  ];
  for (const [t, count, r] of tailRings) {
    b.ring(tail.at(t), { count, radius: 0.016, tilt: 20, fromDeg: R() * 60 }, (item) =>
      puff(item.moved([0, r * 0.25, 0]), r, maneColor()),
    );
  }
  puff(tail.at(1).moved([0, 0.02, 0]), 0.04, maneColor());

  // ---------------------------------------------------------------- legs
  const legRadius = (ts: readonly number[], keys: Array<[number, number]>, bumps: Array<[number, number]>) => {
    const tOf = (k: number) => {
      const i = Math.min(Math.floor(k), ts.length - 2);
      return ts[i] + (ts[i + 1] - ts[i]) * (k - i);
    };
    const kt = keys.map(([k]) => tOf(k));
    const kr = keys.map(([, r]) => r);
    const bt = bumps.map(([k, a]) => [tOf(k), a] as const);
    return (t: number) => {
      let r = kr[kr.length - 1];
      for (let i = 0; i < kt.length - 1; i++)
        if (t <= kt[i + 1]) {
          const f = Math.min(Math.max((t - kt[i]) / Math.max(kt[i + 1] - kt[i], 1e-6), 0), 1);
          r = kr[i] + (kr[i + 1] - kr[i]) * f * f * (3 - 2 * f);
          break;
        }
      for (const [t0, a] of bt) r += a * Math.exp(-(((t - t0) / 0.035) ** 2));
      return r;
    };
  };

  const FRONT_KEYS: Array<[number, number]> = [
    [0, 0.058],
    [0.6, 0.05],
    [1, 0.04],
    [1.5, 0.031],
    [2, 0.029],
    [2.5, 0.021],
    [3, 0.023],
    [3.5, 0.021],
    [4, 0.022],
  ];
  const HIND_KEYS: Array<[number, number]> = [
    [0, 0.075],
    [0.5, 0.068],
    [1, 0.05],
    [1.5, 0.035],
    [2, 0.031],
    [2.5, 0.021],
    [3, 0.023],
    [3.5, 0.021],
    [4, 0.022],
  ];
  const BUMPS: Array<[number, number]> = [
    [2, 0.011],
    [3, 0.009],
  ];

  const leg = (id: string, names: string[], pts: number[][], parent: string, keys: Array<[number, number]>) => {
    const end = pts[pts.length - 1];
    const chain = b.chain("leg" + id, polyline(pts), {
      parent,
      names,
      role: "leg",
      contact: [end[0], 0, end[2]],
    });
    b.sweep(chain, legRadius(chain.ts, keys, BUMPS), { color: coat, sides: 10, detail: 2, name: "leg" + id });
    b.lathe(
      [
        [0, 0],
        [0.033, 0],
        [0.035, 0.012],
        [0.027, 0.055],
        [0, 0.055],
      ],
      { color: SILVER, at: [end[0], 0, end[2]], bone: names[names.length - 1], segments: 12, name: "hoof" + id },
    );
  };

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    leg(
      "F" + S,
      ["shoulder", "elbow", "knee", "fetlock", "hoof"].map((n) => n + "F" + S),
      [
        [s * 0.085, 0.74, 0.19],
        [s * 0.09, 0.57, 0.165],
        [s * 0.082, 0.36, 0.185],
        [s * 0.104, 0.105, 0.19],
        [s * 0.11, 0.05, 0.205],
      ],
      "spine2",
      FRONT_KEYS,
    );
    leg(
      "H" + S,
      ["hip", "stifle", "hock", "fetlock", "hoof"].map((n) => n + "H" + S),
      [
        [s * 0.075, 0.78, -0.25],
        [s * 0.1, 0.57, -0.15],
        [s * 0.085, 0.37, -0.29],
        [s * 0.1, 0.105, -0.265],
        [s * 0.105, 0.05, -0.25],
      ],
      "hips",
      HIND_KEYS,
    );
  }

  // ---------------------------------------------------------------- daisy chain
  const collarSurf = b.surface([neckSweep, body]);
  const c0 = V(0, 0.935, 0.29);
  const sideAxis = V(0.105, 0, 0);
  const backAxis = V(0, 0.085, -0.085);
  const rough: THREE.Vector3[] = [];
  for (let k = 0; k < 12; k++) {
    const th = (2 * Math.PI * k) / 12;
    rough.push(c0.clone().addScaledVector(sideAxis, Math.cos(th)).addScaledVector(backAxis, Math.sin(th)));
  }
  const stem = collarSurf.drape(catmull(rough, { closed: true }), { lift: 0.008 });
  b.sweep(stem, 0.0035, { color: STEM, sides: 6, name: "daisyStem" });

  const daisyOutline: Array<[number, number]> = [];
  const petals = 9;
  for (let k = 0; k < petals * 2; k++) {
    const a = (k * Math.PI) / petals;
    const r = k % 2 === 0 ? 0.021 : 0.0075;
    daisyOutline.push([r * Math.cos(a), r * Math.sin(a)]);
  }
  const heartGeo = new THREE.SphereGeometry(0.0075, 10, 6);
  const leafGeo = new THREE.SphereGeometry(0.009, 8, 5);

  b.along(stem, 10, (pt) => {
    const hit = collarSurf.nearest(pt.at);
    const n = hit.n.clone().normalize();
    const bone = hit.bone ?? "neck1";
    const u = pt.tangent.clone().addScaledVector(n, -pt.tangent.dot(n)).normalize();
    const y = n.clone().cross(u);
    const pos = pt.at.clone().addScaledVector(n, 0.004);
    b.extrude(daisyOutline, {
      color: Math.round(pt.t * 10 - 0.5) % 3 === 1 ? PETAL_PINK : PETAL,
      at: pos,
      x: u.clone().applyAxisAngle(n, R() * 40 * DEG),
      y,
      thickness: 0.003,
      smoothing: 1,
      bone,
    });
    b.part(heartGeo, DAISY_HEART, {
      at: pos.clone().addScaledVector(n, 0.002),
      dir: n,
      scale: [1, 0.6, 1],
      bone,
    });
  });
  for (let i = 0; i < 10; i++) {
    const t = i / 10;
    const p = stem.at(t);
    const tangent = stem.tangentAt(t);
    const hit = collarSurf.nearest(p);
    const n = hit.n.clone().normalize();
    for (const s of [-1, 1]) {
      const up = tangent
        .clone()
        .addScaledVector(n, -tangent.dot(n))
        .normalize()
        .applyAxisAngle(n, s * 40 * DEG);
      b.part(leafGeo, LEAF, {
        at: p.clone().addScaledVector(n, 0.002).addScaledVector(up, 0.009),
        dir: n,
        up,
        scale: [0.5, 0.22, 1.3],
        bone: hit.bone ?? "neck1",
      });
    }
  }

  // ---------------------------------------------------------------- materials
  const tune = (c: string, roughness: number, metalness = 0.04) => {
    const m = b.material(c);
    m.roughness = roughness;
    m.metalness = metalness;
  };
  tune(GOLD, 0.32, 0.35);
  tune(GOLD_LIGHT, 0.3, 0.3);
  tune(SILVER, 0.3, 0.35);
  tune(EYE, 0.12);
  tune(WHITE, 0.2);
  for (const hue of MANE_HUES) for (const c of hue) tune(c, 0.95);
  const pearl = b.ctx.paintMaterial();
  pearl.roughness = 0.5;

  return b.root;
}
```