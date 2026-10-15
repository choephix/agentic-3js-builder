import * as THREE from "three";
import {
  createBuilder,
  frame,
  limb,
  catmull,
  polyline,
  bezier,
  spiral,
  stripes,
  spots,
  grain,
  svg,
  rng,
} from "../../../../src/index";

export const meta = {
  name: "Gnome Tinkerer",
  description:
    "A stout, bearded gnome in a polka-dot floppy hat with goggles, a striped tunic and curly-toed boots, hauling a backpack crammed with gears, a telescope, a propeller, a steam horn, a pressure gauge, a lantern and a spring. Rigged in a T-pose with a separate jaw, fingers, hat chain and spinnable gadget joints.",
};

type V3 = [number, number, number];

// ---------- palette ----------
const SKIN = "#f2b48f";
const SKIN_D = "#cf8766";
const NOSE = "#ee8579";
const CHEEK = "#f49a8c";
const BEARD = "#f3efe6";
const BEARD_SH = "#d3ccbb";
const HAT = "#d6392e";
const HAT_DOT = "#fff1d6";
const LEATHER = "#7a4a2b";
const LEATHER_D = "#4f2e1a";
const LEATHER_L = "#a56a3d";
const SHIRT = "#3f8f5a";
const SHIRT_D = "#2c6e45";
const CREAM = "#f6e7bf";
const PANTS = "#4b5fa8";
const PATCH = "#e0b24a";
const BOOT = "#6b4226";
const SOLE = "#2d2018";
const BRASS = "#dba83a";
const BRASS_D = "#a87420";
const COPPER = "#c8683a";
const STEEL = "#a3b0bd";
const STEEL_D = "#6c7a89";
const TEAL = "#4fd1c5";
const BLACK = "#1d1a1f";
const WHITE = "#ffffff";
const RED = "#c62f2f";
const GLOW = "#ffe27a";
const BEDROLL = "#c9a86a";
const MOUTH = "#7a2a2a";

// ---------- helpers ----------
const dirn = (x: number, y: number, z: number): V3 => {
  const v = new THREE.Vector3(x, y, z).normalize();
  return [v.x, v.y, v.z];
};
const pt = (p: V3, d: V3, len: number): V3 => {
  const v = new THREE.Vector3(d[0], d[1], d[2]).normalize().multiplyScalar(len);
  return [p[0] + v.x, p[1] + v.y, p[2] + v.z];
};
const keys = (k: number[], t: number) => {
  const f = Math.min(Math.max(t, 0), 1) * (k.length - 1);
  const i = Math.min(Math.floor(f), k.length - 2);
  return k[i] + (k[i + 1] - k[i]) * (f - i);
};
const ball = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);

function gearOutline(teeth: number, rIn: number, rOut: number): [number, number][] {
  const pts: [number, number][] = [];
  const step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    const add = (r: number, k: number) => pts.push([Math.cos(a + step * k) * r, Math.sin(a + step * k) * r]);
    add(rIn, 0);
    add(rOut, 0.14);
    add(rOut, 0.36);
    add(rIn, 0.5);
  }
  return pts;
}

export default function build() {
  const b = createBuilder({ name: "gnomeTinkerer" });

  const cyl = (p: V3, d: V3, r: number, len: number, color: string, bone: any, seg = 10) =>
    b.part(new THREE.CylinderGeometry(r, r, len, seg), color, { at: p, dir: d, bone });
  const hoop = (p: V3, d: V3, R: number, r: number, color: string, bone: any) =>
    b.part(new THREE.TorusGeometry(R, r, 5, 10), color, { at: p, dir: d, axis: "z", bone });

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.42, 0] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.42, 0],
      [0, 0.58, 0.01],
      [0, 0.74, 0.02],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const spine1 = spine.joints[0];
  const spine2 = spine.joints[1];
  const chest = spine.joints[2];
  const neck = b.chain(
    "neck",
    polyline([
      [0, 0.74, 0.02],
      [0, 0.83, 0.03],
    ]),
    { parent: chest, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 0.83, 0.03], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.875, 0.06], aim: [0, 0.84, 0.17], role: "jaw" });
  const hat = b.chain(
    "hat",
    catmull([
      [0, 0.985, 0.03],
      [0, 1.1, 0.025],
      [0, 1.21, -0.02],
      [0, 1.29, -0.11],
      [0, 1.3, -0.22],
    ]),
    { parent: head, names: ["hat1", "hat2", "hat3", "hat4"] },
  );

  // ---------- torso ----------
  const shirtPaint = stripes(SHIRT, SHIRT_D, { size: 0.075, axis: "y" });
  const torso = b.sweep(spine, (t: number): [number, number] => {
    const k = Math.sin(Math.PI * t * 0.9);
    return [0.14 + 0.045 * k, 0.14 + 0.05 * k];
  }, {
    color: shirtPaint,
    caps: "flat",
    shift: (t: number): [number, number] => [0, -0.03 * Math.sin(Math.PI * t)],
  });
  const skin = b.surface(torso);

  // tunic hem + trim
  b.lathe(
    [
      [0, 0],
      [0.2, 0],
      [0.21, 0.01],
      [0.17, 0.12],
      [0.13, 0.19],
      [0, 0.19],
    ],
    { at: [0, 0.36, 0], bone: hips, color: shirtPaint, segments: 12 },
  );
  b.lathe(
    [
      [0.185, -0.002],
      [0.215, -0.002],
      [0.21, 0.032],
      [0.185, 0.032],
    ],
    { at: [0, 0.36, 0], bone: hips, color: CREAM, segments: 12 },
  );

  // collar ruffle
  b.part(new THREE.TorusGeometry(0.1, 0.028, 5, 10), CREAM, { at: [0, 0.745, 0.02], rotation: [90, 0, 0], bone: chest });

  // neck
  b.sweep(neck, 0.06, { color: SKIN });

  // belt
  b.sweep(skin.loop(frame([0, 0.5, 0], [0, 1, 0]), { lift: 0.012 }), 0.022, { color: LEATHER_D });
  const bh = skin.ray([0, 0.5, 1], [0, 0, -1]);
  if (bh) {
    b.stick(new THREE.BoxGeometry(0.07, 0.02, 0.06), BRASS, bh, { embed: 0.3 });
    b.stick(new THREE.BoxGeometry(0.04, 0.024, 0.032), LEATHER_D, bh, { embed: 0.1 });
  }
  for (const s of [1, -1]) {
    const a = (s * 50 * Math.PI) / 180;
    const sx = Math.sin(a);
    const cz = Math.cos(a);
    const ph = skin.ray([sx, 0.5, cz], [-sx, 0, -cz]);
    if (ph) {
      b.stick(new THREE.BoxGeometry(0.07, 0.05, 0.07), LEATHER_L, ph, { embed: 0.3 });
      b.stick(ball(0.009), BRASS, ph.moved([0, 0.036, 0.0]), { embed: 0.2 });
    }
  }
  // hammer (left hip) and wrench (right hip)
  b.rod([0.2, 0.52, 0.11], [0.215, 0.3, 0.12], 0.012, LEATHER_L, { bone: spine1 });
  b.part(new THREE.BoxGeometry(0.045, 0.045, 0.1), STEEL, { at: [0.205, 0.535, 0.11], bone: spine1 });
  b.rod([-0.2, 0.5, 0.1], [-0.215, 0.3, 0.1], 0.012, STEEL, { bone: spine1 });
  b.part(new THREE.TorusGeometry(0.03, 0.011, 5, 9, Math.PI * 1.6), STEEL_D, {
    at: [-0.215, 0.285, 0.1],
    rotation: [0, 0, -54],
    bone: spine1,
  });

  // shoulder straps draped over the torso
  for (const s of [1, -1]) {
    const strap = catmull([
      [s * 0.11, 0.62, -0.17],
      [s * 0.115, 0.73, -0.1],
      [s * 0.11, 0.76, 0.0],
      [s * 0.1, 0.72, 0.12],
      [s * 0.09, 0.6, 0.19],
    ]);
    b.sweep(skin.drape(strap, { lift: 0.012 }), 0.02, { color: LEATHER_L });
  }

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const hipP: V3 = [s * 0.09, 0.4, 0];
    const footP: V3 = [s * 0.1, 0.075, 0.005];
    const pts = limb(hipP, footP, [0.17, 0.17], [[0, 0, 1]]);
    const leg = b.chain(`leg${S}`, pts, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
      role: "leg",
    });
    const ankle = leg.joints[2];
    const legSw = b.sweep(leg, [0.078, 0.062], { color: PANTS });
    const kh = b.surface(legSw).ray([pts[1].x, pts[1].y, 1], [0, 0, -1]);
    if (kh) {
      b.stick(new THREE.BoxGeometry(0.06, 0.012, 0.06), PATCH, kh, { embed: 0.3 });
      b.stick(new THREE.BoxGeometry(0.036, 0.016, 0.036), PANTS, kh, { embed: 0.1 });
    }
    // boot
    b.rod([s * 0.1, 0.16, 0.005], [s * 0.1, 0.07, 0.005], 0.07, BOOT, { bone: ankle });
    b.part(new THREE.TorusGeometry(0.074, 0.016, 5, 10), LEATHER_L, {
      at: [s * 0.1, 0.16, 0.005],
      rotation: [90, 0, 0],
      bone: ankle,
    });
    b.capsule([s * 0.1, 0.065, -0.02], [s * 0.1, 0.065, 0.04], 0.062, BOOT, { bone: ankle });
    b.part(new THREE.BoxGeometry(0.135, 0.022, 0.3), SOLE, { at: [s * 0.1, 0.011, 0.045], bone: ankle });
    const toe = b.joint(`toe${S}`, {
      parent: ankle,
      at: [s * 0.1, 0.06, 0.07],
      aim: [s * 0.1, 0.06, 0.17],
      role: "digit",
    });
    b.capsule([s * 0.1, 0.064, 0.04], [s * 0.1, 0.064, 0.12], 0.062, BOOT, { bone: toe });
    const curl = bezier(
      [s * 0.1, 0.07, 0.14],
      [s * 0.1, 0.075, 0.26],
      [s * 0.1, 0.13, 0.3],
      [s * 0.1, 0.21, 0.26],
    );
    b.sweep(curl, [0.05, 0.01], { color: BOOT, bone: toe, caps: { start: "round", end: "point" } });
    b.part(ball(0.02), BRASS, { at: [s * 0.1, 0.225, 0.258], bone: toe });
  }

  // ---------- arms & hands ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const shoulderP: V3 = [s * 0.15, 0.68, 0];
    const handP: V3 = [s * 0.495, 0.68, 0.02];
    const ap = limb(shoulderP, handP, [0.18, 0.17], [[0, 0, -1]]);
    const arm = b.chain(`arm${S}`, ap, {
      parent: chest,
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "arm",
    });
    const wrist = arm.joints[2];
    b.sweep(arm, [0.068, 0.048], { color: shirtPaint });
    b.part(new THREE.SphereGeometry(0.076, 8, 6), SHIRT, { at: shoulderP, bone: arm.joints[0], flat: true });
    b.part(new THREE.TorusGeometry(0.05, 0.015, 5, 9), CREAM, {
      at: [ap[2].x - s * 0.02, ap[2].y, ap[2].z],
      dir: [s, 0, 0],
      axis: "z",
      bone: wrist,
    });
    // hand
    const W = ap[2];
    const hx = (d: number) => W.x + s * d;
    b.part(ball(0.05, 8, 6), SKIN, { at: [hx(0.045), W.y, W.z], scale: [1.15, 0.7, 1], bone: wrist, flat: true });
    [0.03, 0, -0.03].forEach((z0, i) => {
      const fp: V3[] = [
        [hx(0.07), W.y, W.z + z0],
        [hx(0.105), W.y, W.z + z0 * 1.4],
        [hx(0.138), W.y, W.z + z0 * 1.9],
      ];
      const f = b.chain(`finger${i}${S}`, polyline(fp), {
        parent: wrist,
        names: [`finger${i}a${S}`, `finger${i}b${S}`],
        role: "digit",
      });
      b.sweep(f, [0.017, 0.011], { color: SKIN });
    });
    const tp: V3[] = [
      [hx(0.04), W.y, W.z + 0.035],
      [hx(0.06), W.y, W.z + 0.075],
      [hx(0.075), W.y, W.z + 0.108],
    ];
    const thumb = b.chain(`thumb${S}`, polyline(tp), {
      parent: wrist,
      names: [`thumb${S}a`, `thumb${S}b`],
      role: "digit",
    });
    b.sweep(thumb, [0.02, 0.013], { color: SKIN });
  }

  // ---------- head ----------
  const C: V3 = [0, 0.92, 0.03];
  const skull = b.part(new THREE.SphereGeometry(0.15, 12, 9), SKIN, {
    at: C,
    bone: head,
    flat: true,
    scale: [1, 0.96, 1.02],
  });
  // freckles
  const frk = b.surface(skull).scatter(30, {
    rng: rng(21),
    minDist: 0.02,
    filter: (h) => h.n.z > 0.5 && Math.abs(h.at.x) > 0.035 && Math.abs(h.at.x) < 0.08 && h.at.y > 0.875 && h.at.y < 0.915,
  });
  for (const h of frk) b.stick(ball(0.006, 5, 4), SKIN_D, h, { embed: 0.4 });

  // nose
  b.part(new THREE.SphereGeometry(0.048, 9, 7), NOSE, { at: [0, 0.908, 0.19], bone: head });

  for (const s of [1, -1]) {
    // ears
    b.spike([s * 0.135, 0.935, 0.02], dirn(s * 1, 0.28, -0.35), 0.14, 0.045, { color: SKIN, bone: head });
    b.spike([s * 0.14, 0.935, 0.045], dirn(s * 1, 0.28, -0.35), 0.1, 0.028, { color: CHEEK, bone: head });
    // eyes
    b.part(ball(0.03, 9, 7), WHITE, { at: [s * 0.058, 0.935, 0.163], bone: head });
    b.part(ball(0.016, 7, 5), BLACK, { at: [s * 0.058, 0.935, 0.186], bone: head });
    b.part(ball(0.005, 5, 4), WHITE, { at: [s * 0.053, 0.942, 0.201], bone: head });
    // brows
    b.capsule([s * 0.02, 0.972, 0.165], [s * 0.095, 0.962, 0.14], 0.017, BEARD, { bone: head });
    // cheeks
    b.part(ball(0.032, 7, 5), CHEEK, { at: [s * 0.1, 0.885, 0.125], scale: [1, 0.8, 0.5], bone: head });
    // mustache
    b.sweep(
      catmull([
        [0, 0.876, 0.185],
        [s * 0.04, 0.866, 0.192],
        [s * 0.085, 0.868, 0.17],
        [s * 0.12, 0.89, 0.135],
      ]),
      [0.03, 0.01],
      { color: BEARD, bone: head, caps: { start: "round", end: "point" }, sides: 7 },
    );
    // hair wisps below hat
    b.spike([s * 0.13, 0.975, -0.01], dirn(s * 1, -0.5, -0.5), 0.07, 0.03, { color: BEARD, bone: head });
    b.spike([s * 0.12, 0.96, -0.06], dirn(s * 0.8, -0.6, -0.8), 0.07, 0.03, { color: BEARD_SH, bone: head });
  }
  // mouth
  b.part(ball(0.03, 7, 5), MOUTH, { at: [0, 0.843, 0.165], scale: [1.3, 0.4, 0.5], bone: head });

  // lower jaw with beard
  b.part(new THREE.SphereGeometry(0.07, 9, 7), SKIN, { at: [0, 0.822, 0.095], scale: [1.1, 0.7, 1], bone: jaw, flat: true });
  const beardPath = catmull([
    [0, 0.83, 0.11],
    [0, 0.76, 0.18],
    [0, 0.68, 0.25],
    [0, 0.61, 0.27],
    [0, 0.55, 0.265],
  ]);
  const beard = b.sweep(
    beardPath,
    (t: number): [number, number] => [
      keys([0.115, 0.135, 0.125, 0.08, 0.015], t),
      keys([0.06, 0.075, 0.07, 0.05, 0.015], t),
    ],
    { color: grain(BEARD, BEARD_SH, { size: 0.02 }), bone: jaw, caps: { start: "flat", end: "point" } },
  );
  for (const t of [0.3, 0.5, 0.7]) {
    for (const a of [-60, -30, 0, 30, 60]) {
      const at = beard.at(t, a);
      const d = dirn(at.n.x, at.n.y - 1.1, at.n.z);
      b.spike(at, d, 0.075 * (1.15 - t), 0.032 * (1.2 - t), { color: (a / 30) % 2 === 0 ? BEARD : BEARD_SH });
    }
  }

  // ---------- hat ----------
  b.sweep(hat, [0.158, 0.135, 0.105, 0.07, 0.035, 0.012], {
    color: spots(HAT, HAT_DOT, { size: 0.07, amount: 0.3 }),
    caps: { start: "flat", end: "point" },
  });
  b.part(new THREE.TorusGeometry(0.157, 0.017, 5, 14), LEATHER_D, { at: [0, 0.995, 0.03], rotation: [90, 0, 0], bone: head });
  b.part(new THREE.BoxGeometry(0.05, 0.045, 0.02), BRASS, { at: [0, 0.995, 0.19], bone: head });
  b.part(ball(0.03), BRASS, { frame: hat.at(1), bone: hat.joints[3] });
  // goggles on the hat
  const gd = dirn(0, 0.25, 1);
  for (const s of [1, -1]) {
    cyl([s * 0.058, 1.045, 0.172], gd, 0.042, 0.04, BRASS_D, head);
    cyl(pt([s * 0.058, 1.045, 0.172], gd, 0.02), gd, 0.032, 0.02, TEAL, head);
  }
  b.rod([-0.03, 1.045, 0.18], [0.03, 1.045, 0.18], 0.01, LEATHER_D, { bone: head });

  // ---------- backpack ----------
  const pack = b.joint("pack", { parent: spine2, at: [0, 0.62, -0.2], dir: [0, 1, 0] });
  b.frustumBox([0, 0.62, -0.15], [0, 0.62, -0.33], [0.34, 0.4], [0.36, 0.42], { color: LEATHER, bone: pack });
  b.part(new THREE.BoxGeometry(0.37, 0.05, 0.21), LEATHER_D, { at: [0, 0.835, -0.24], bone: pack });
  b.part(new THREE.BoxGeometry(0.06, 0.1, 0.02), BRASS, { at: [0, 0.8, -0.347], bone: pack });
  for (const sx of [1, -1])
    for (const y of [0.44, 0.8]) b.part(ball(0.013, 6, 4), BRASS, { at: [sx * 0.16, y, -0.335], bone: pack });
  // bedroll
  cyl([0, 0.37, -0.265], [1, 0, 0], 0.06, 0.38, BEDROLL, pack, 10);
  for (const x of [-0.12, 0.12]) hoop([x, 0.37, -0.265], [1, 0, 0], 0.062, 0.008, LEATHER_D, pack);

  // gears
  const gearBig = b.joint("gearBig", { parent: pack, at: [0.06, 0.52, -0.345], dir: [0, 0, -1] });
  b.extrude(gearOutline(12, 0.072, 0.097), {
    at: [0.06, 0.52, -0.345],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.02,
    bevel: 0.002,
    color: BRASS,
    bone: gearBig,
  });
  cyl([0.06, 0.52, -0.357], [0, 0, 1], 0.02, 0.026, STEEL, gearBig, 8);
  const gearSmall = b.joint("gearSmall", { parent: pack, at: [-0.06, 0.47, -0.345], dir: [0, 0, -1] });
  b.extrude(gearOutline(8, 0.042, 0.058), {
    at: [-0.06, 0.47, -0.345],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.02,
    bevel: 0.002,
    color: COPPER,
    bone: gearSmall,
  });
  cyl([-0.06, 0.47, -0.357], [0, 0, 1], 0.014, 0.026, STEEL, gearSmall, 8);

  // pressure gauge
  const gaugeP: V3 = [-0.06, 0.66, -0.345];
  let ticks = "";
  for (const a of [-120, -60, 0, 60, 120]) {
    const r = (a * Math.PI) / 180;
    ticks += `<line x1="${32 + Math.sin(r) * 25}" y1="${32 - Math.cos(r) * 25}" x2="${32 + Math.sin(r) * 19}" y2="${32 - Math.cos(r) * 19}" stroke="#2d2018" stroke-width="3"/>`;
  }
  const gaugeTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="31" fill="#fff4d6"/>${ticks}<path d="M12 40 A21 21 0 0 1 20 17" fill="none" stroke="#4aa35a" stroke-width="3"/><path d="M44 17 A21 21 0 0 1 52 40" fill="none" stroke="#c62f2f" stroke-width="3"/><line x1="32" y1="32" x2="43" y2="19" stroke="#c62f2f" stroke-width="4"/><circle cx="32" cy="32" r="4" fill="#2d2018"/></svg>`,
    { size: 128 },
  );
  cyl(gaugeP, [0, 0, -1], 0.055, 0.035, BRASS_D, pack, 12);
  b.part(new THREE.CircleGeometry(0.047, 14), WHITE, {
    at: [gaugeP[0], gaugeP[1], gaugeP[2] - 0.0195],
    dir: [0, 0, -1],
    axis: "z",
    texture: gaugeTex,
    bone: pack,
  });
  hoop([gaugeP[0], gaugeP[1], gaugeP[2] - 0.019], [0, 0, 1], 0.052, 0.007, BRASS, pack);

  // steam horn + copper pipe
  const F: V3 = [-0.11, 0.82, -0.22];
  b.lathe(
    [
      [0.025, 0],
      [0.03, 0],
      [0.03, 0.08],
      [0.09, 0.22],
      [0.082, 0.22],
      [0.022, 0.085],
    ],
    { at: F, axis: dirn(-0.35, 1, -0.35), segments: 10, color: BRASS, bone: pack },
  );
  b.sweep(
    catmull([
      F,
      [-0.13, 0.78, -0.31],
      [-0.1, 0.75, -0.36],
      [-0.06, 0.715, -0.35],
    ]),
    0.011,
    { color: COPPER, bone: pack, sides: 6 },
  );

  // telescope
  const TB: V3 = [0.11, 0.8, -0.22];
  const td = dirn(0.45, 1, -0.35);
  const t1 = pt(TB, td, 0.16);
  const t2 = pt(TB, td, 0.32);
  const t3 = pt(TB, td, 0.46);
  b.rod(TB, t1, 0.034, LEATHER_L, { bone: pack });
  b.rod(t1, t2, 0.027, BRASS, { bone: pack });
  b.rod(t2, t3, 0.02, BRASS_D, { bone: pack });
  hoop(t1, td, 0.034, 0.008, BRASS_D, pack);
  hoop(t2, td, 0.027, 0.007, LEATHER_D, pack);
  hoop(pt(TB, td, 0.05), td, 0.036, 0.008, LEATHER_D, pack);
  cyl(pt(t3, td, 0.008), td, 0.026, 0.02, TEAL, pack, 8);

  // propeller
  const prop = b.joint("propeller", { parent: pack, at: [0, 0.84, -0.3], dir: [0, 1, 0] });
  b.rod([0, 0.8, -0.3], [0, 0.97, -0.3], 0.01, STEEL, { bone: pack });
  b.part(ball(0.022), BRASS, { at: [0, 0.98, -0.3], bone: prop });
  b.part(new THREE.BoxGeometry(0.3, 0.006, 0.05), RED, { at: [0, 0.982, -0.3], rotation: [14, 0, 0], bone: prop });
  b.part(new THREE.BoxGeometry(0.05, 0.006, 0.3), PATCH, { at: [0, 0.982, -0.3], rotation: [0, 0, 14], bone: prop });

  // hanging lantern
  b.rod([0.17, 0.62, -0.26], [0.235, 0.62, -0.26], 0.008, BRASS_D, { bone: pack });
  b.rod([0.235, 0.62, -0.26], [0.235, 0.585, -0.26], 0.006, BRASS_D, { bone: pack });
  b.part(new THREE.ConeGeometry(0.044, 0.04, 8), BRASS, { at: [0.235, 0.565, -0.26], bone: pack });
  cyl([0.235, 0.515, -0.26], [0, 1, 0], 0.034, 0.06, GLOW, pack, 8);
  cyl([0.235, 0.478, -0.26], [0, 1, 0], 0.04, 0.014, BRASS, pack, 8);

  // dangling spring
  b.rod([-0.18, 0.6, -0.26], [-0.23, 0.6, -0.26], 0.008, BRASS_D, { bone: pack });
  b.rod([-0.23, 0.6, -0.26], [-0.23, 0.56, -0.26], 0.006, STEEL_D, { bone: pack });
  b.sweep(spiral([-0.23, 0.44, -0.26], [-0.2, 0.44, -0.26], [0, 1, 0], { turns: 5, r1: 0.03, pitch: 0.024 }), 0.006, {
    color: STEEL,
    bone: pack,
    sides: 5,
  });

  return b.root;
}
