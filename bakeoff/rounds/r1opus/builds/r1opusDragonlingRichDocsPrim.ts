import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  polyline,
  catmull,
  bezier,
  limb,
  paint,
  scales,
  spots,
  noise,
  svg,
} from "../../../../src/index";

export const meta = {
  name: "Hatchling Dragon",
  description:
    "A cat-sized baby dragon sitting proudly beside its broken speckled egg: teal scales fading to a buttery belly, stubby horns, soft orange back spines, oversized amber-skinned wings, big amber eyes, a toothy grin and a curl of smoke from one nostril.",
};

// palette
const TEAL = "#2fb3a3";
const TEAL_2 = "#38c0ae";
const TEAL_DEEP = "#1d7f7a";
const MINT = "#8fdcc0";
const BUTTER = "#ffe08a";
const BUTTER_LINE = "#eebf5c";
const ORANGE = "#ff8a3d";
const ORANGE_LIGHT = "#ffb067";
const HORN = "#fbefd0";
const DARK = "#2a1a14";
const MOUTH = "#4a1f2a";
const TONGUE = "#ff7d8a";
const TOOTH = "#ffffff";
const SMOKE = "#d8dee6";
const SMOKE_2 = "#bcc6d0";
const EGG = "#f6efdc";
const SPECK_1 = "#6f9a86";
const SPECK_2 = "#c48c5a";
const AMBER = "#f5a033";
const AMBER_DEEP = "#e07f22";
const AMBER_LIGHT = "#ffd27a";
const BLUSH = "#ff9fb0";

type P3 = number[] | THREE.Vector3;
const v = (p: P3) => (p instanceof THREE.Vector3 ? p.clone() : new THREE.Vector3(p[0], p[1], p[2]));
const add = (p: P3, d: number[]) => v(p).add(new THREE.Vector3(d[0], d[1], d[2]));

function interp(keys: [number, number][], t: number) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [t0, v0] = keys[i - 1];
      const [t1, v1] = keys[i];
      const u = (t - t0) / Math.max(1e-6, t1 - t0);
      const e = u * u * (3 - 2 * u);
      return v0 + (v1 - v0) * e;
    }
  }
  return keys[keys.length - 1][1];
}

export default function build() {
  const b = createBuilder({ name: "babyDragon" });
  const R = rng(42);

  // ---------- paints ----------
  const coat = scales([TEAL, TEAL_2], TEAL_DEEP, { size: 0.016 });
  const plate = paint((_p, _n, s) => ((s[0] * 46) % 1 < 0.16 ? BUTTER_LINE : BUTTER));
  const skin = paint((p, n) => {
    const k = Math.max(n.z, -n.y * 1.1) - Math.abs(n.x) * 0.8 + (noise(p, 0.025, 5) - 0.5) * 0.3;
    return k > 0.42 ? plate : k > 0.26 ? MINT : coat;
  });
  const headCoat = paint((_p, n) => (n.y < -0.45 ? BUTTER : n.y < -0.25 ? MINT : coat));
  const wingSkin = paint((p, _n, s) =>
    s[0] > 0.86 ? AMBER_LIGHT : noise(p, 0.05, 9) > 0.62 ? AMBER_DEEP : s[1] > 0.45 && s[1] < 0.55 ? AMBER_DEEP : AMBER,
  );
  const eggPaint = spots(EGG, [SPECK_1, SPECK_2], { size: 0.012, amount: 0.28 });

  // ---------- body skeleton ----------
  const P: number[][] = [
    [0.1, 0.018, -0.3],
    [0.06, 0.022, -0.24],
    [0.02, 0.032, -0.16],
    [0, 0.05, -0.085],
    [0, 0.085, -0.02], // hips
    [0, 0.15, 0.0],
    [0, 0.215, 0.025],
    [0, 0.255, 0.04], // neck base
    [0, 0.29, 0.055],
    [0, 0.315, 0.07], // head
  ];
  const body = catmull(P);
  const hips = b.joint("hips", { at: P[4] });
  const tH = body.closestT(P[4]);
  const tN = body.closestT(P[7]);
  const tail = b.chain("tail", body.slice(tH, 0), { parent: hips, count: 5, role: "tail" });
  const spine = b.chain("spine", body.slice(tH, tN), { parent: hips, count: 2, role: "spine" });
  const neck = b.chain("neck", body.slice(tN, 1), { parent: spine.joints[1], count: 2, role: "neck" });

  const ts = P.map((p) => body.closestT(p));
  ts[0] = 0;
  ts[ts.length - 1] = 1;
  const rxV = [0.011, 0.017, 0.026, 0.042, 0.07, 0.07, 0.058, 0.044, 0.037, 0.032];
  const ryV = [0.009, 0.015, 0.023, 0.038, 0.072, 0.08, 0.06, 0.045, 0.038, 0.034];
  const rxK = ts.map((t, i) => [t, rxV[i]] as [number, number]);
  const ryK = ts.map((t, i) => [t, ryV[i]] as [number, number]);

  const bodySweep = b.sweep(body, (t: number) => [interp(rxK, t), interp(ryK, t)], {
    bone: [tail, hips, spine, neck],
    color: skin,
    sides: 10,
    name: "body",
  });

  // dorsal spines, soft and orange
  let si = 0;
  b.along(
    bodySweep,
    15,
    (at) => {
      const u = (at.t - 0.1) / 0.83;
      const len = 0.01 + 0.024 * Math.sin(Math.PI * Math.min(1, Math.max(0, u)));
      const dir = at.n.clone().addScaledVector(at.tangent, -0.55);
      b.spike(at, dir, len, len * 0.4, { color: si++ % 2 ? ORANGE : ORANGE_LIGHT, sides: 6 });
    },
    { from: 0.1, to: 0.93 },
  );

  // tail spade
  const tailTip = tail.joints[tail.joints.length - 1];
  const tin = body.tangentAt(0);
  const out = new THREE.Vector3(-tin.x, 0, -tin.z).normalize();
  const side = new THREE.Vector3(-out.z, 0, out.x);
  b.extrude(
    [
      [-0.005, 0],
      [0.015, -0.03],
      [0.042, -0.026],
      [0.072, 0, "sharp"],
      [0.042, 0.026],
      [0.015, 0.03],
    ],
    {
      at: add(P[0], [-out.x * 0.006, 0, -out.z * 0.006]),
      x: out,
      y: side,
      thickness: 0.007,
      bevel: 0.002,
      smoothing: 1,
      color: ORANGE,
      bone: tailTip,
      name: "tailSpade",
    },
  );

  // ---------- head ----------
  const head = b.joint("head", { parent: neck.joints[1], at: P[9], dir: [0, -0.08, 1], role: "head" });
  const H = (o: { left?: number; up?: number; down?: number; forward?: number; back?: number }) => head.local(o);

  const cranium = b.part(new THREE.SphereGeometry(0.06, 10, 8), headCoat, {
    bone: head,
    at: H({ forward: 0.03, up: 0.028 }),
    scale: [1.08, 0.92, 1],
    flat: true,
    name: "cranium",
  });
  b.frustumBox(H({ forward: 0.05, up: 0.0 }), H({ forward: 0.115, up: 0.0 }), [0.07, 0.035], [0.055, 0.035], {
    bone: head,
    color: headCoat,
    name: "snout",
  });

  // jaw
  const jawEnd = H({ forward: 0.112, down: 0.034 });
  const jaw = b.joint("jaw", { parent: head, at: H({ forward: 0.04, down: 0.03 }), aim: jawEnd, role: "jaw" });
  b.frustumBox(H({ forward: 0.03, down: 0.028 }), jawEnd, [0.06, 0.022], [0.048, 0.016], {
    bone: jaw,
    color: headCoat,
    name: "lowerJaw",
  });
  b.part(new THREE.BoxGeometry(0.034, 0.008, 0.05), TONGUE, { bone: jaw, at: H({ forward: 0.075, down: 0.022 }) });
  for (const x of [-0.012, 0.012]) {
    b.part(new THREE.ConeGeometry(0.004, 0.01, 5), TOOTH, {
      bone: jaw,
      at: H({ left: x, forward: 0.1, down: 0.024 }),
      dir: [0, 1, 0],
      flat: true,
    });
  }
  for (const x of [-0.027, 0.027]) {
    b.part(new THREE.ConeGeometry(0.0035, 0.008, 5), TOOTH, {
      bone: jaw,
      at: H({ left: x * 0.8, forward: 0.075, down: 0.022 }),
      dir: [0, 1, 0],
      flat: true,
    });
  }
  // mouth interior and upper teeth
  b.part(new THREE.BoxGeometry(0.05, 0.012, 0.065), MOUTH, { bone: head, at: H({ forward: 0.07, down: 0.016 }) });
  const upper: [number, number, number][] = [
    [-0.007, 0.108, 0.012],
    [0.007, 0.108, 0.012],
    [-0.02, 0.102, 0.016],
    [0.02, 0.102, 0.016],
    [-0.026, 0.085, 0.01],
    [0.026, 0.085, 0.01],
    [-0.027, 0.068, 0.009],
    [0.027, 0.068, 0.009],
  ];
  for (const [x, f, h] of upper) {
    b.part(new THREE.ConeGeometry(h > 0.014 ? 0.0055 : 0.0045, h, 5), TOOTH, {
      bone: head,
      at: H({ left: x, forward: f, down: 0.0175 + h / 2 - 0.002 }),
      dir: [0, -1, 0],
      flat: true,
    });
  }
  b.pose(jaw, { axis: [1, 0, 0], deg: 16 });

  // nostrils
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.0055, 6, 4), DARK, {
      bone: head,
      at: H({ left: s * 0.014, up: 0.0175, forward: 0.106 }),
      scale: [1.2, 0.6, 1],
    });
  }
  // smoke wisp from the right nostril
  const n0 = H({ left: -0.014, up: 0.02, forward: 0.108 });
  b.sweep(
    catmull([
      n0,
      add(n0, [-0.008, 0.025, 0.012]),
      add(n0, [-0.03, 0.055, 0.01]),
      add(n0, [-0.03, 0.085, -0.015]),
      add(n0, [-0.008, 0.1, -0.02]),
      add(n0, [0.006, 0.09, -0.006]),
    ]),
    [0.003, 0.007, 0.01, 0.009, 0.007, 0.003],
    { bone: head, color: SMOKE, sides: 7, name: "smoke" },
  );
  b.part(new THREE.IcosahedronGeometry(0.011, 0), SMOKE_2, { bone: head, at: add(n0, [-0.036, 0.07, -0.004]), flat: true });
  b.part(new THREE.IcosahedronGeometry(0.007, 0), SMOKE, { bone: head, at: add(n0, [0.004, 0.115, -0.02]), flat: true });

  // eyes
  const eyeTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="31" fill="#3a1d08"/>
      <circle cx="32" cy="32" r="28" fill="#ff9d17"/>
      <circle cx="32" cy="34" r="21" fill="#ffbf3a"/>
      <circle cx="32" cy="38" r="12" fill="#ffd970"/>
      <ellipse cx="32" cy="32" rx="6" ry="21" fill="#1b0f08"/>
      <circle cx="42" cy="20" r="8" fill="#ffffff"/>
      <circle cx="22" cy="44" r="3.5" fill="#ffffff"/>
    </svg>`,
    { size: 128 },
  );
  for (const s of [1, -1]) {
    const c = H({ left: s * 0.035, up: 0.03, forward: 0.06 });
    const eye = b.part(new THREE.SphereGeometry(0.024, 10, 8), DARK, { bone: head, at: c, name: `eye${s > 0 ? "L" : "R"}` });
    const d = new THREE.Vector3(s * 0.55, 0.1, 1).normalize();
    b.decal(eye, eyeTex, { at: v(c).addScaledVector(d, 0.024), dir: d, size: [0.04, 0.04], bone: head });
    // brow ridge
    b.part(new THREE.BoxGeometry(0.032, 0.009, 0.02), TEAL_DEEP, {
      bone: head,
      at: H({ left: s * 0.036, up: 0.056, forward: 0.058 }),
      rotation: [-12, 0, s * 14],
      flat: true,
    });
    // horn
    const hb = H({ left: s * 0.032, up: 0.072, forward: 0.0 });
    b.sweep(bezier(hb, H({ left: s * 0.04, up: 0.1, forward: 0.0 }), H({ left: s * 0.05, up: 0.105, back: 0.035 })), [0.013, 0], {
      bone: head,
      color: HORN,
      sides: 6,
      caps: { start: "flat", end: "point" },
    });
    // snout nub
    b.spike(H({ left: s * 0.013, up: 0.016, forward: 0.082 }), [0, 1, 0.5], 0.012, 0.005, { bone: head, color: HORN, sides: 5 });
    // ear frill
    b.extrude(
      [
        [0, -0.012],
        [0.05, 0.004, "sharp"],
        [0.02, 0.02],
        [0, 0.014],
      ],
      {
        at: H({ left: s * 0.055, up: 0.03, forward: 0.005 }),
        x: [s * 0.55, 0, -1],
        y: [0, 1, 0],
        thickness: 0.005,
        bevel: 0.0015,
        smoothing: 1,
        color: ORANGE,
        bone: head,
      },
    );
    // cheek blush
    const ch = b.surface(cranium).around(cranium).at(s * 62, -12);
    if (ch) b.stick(new THREE.CylinderGeometry(0.011, 0.011, 0.003, 10), BLUSH, ch, { embed: 0.4 });
  }

  // a piece of eggshell stuck on its head
  const capAt = H({ forward: 0.045, up: 0.072 });
  b.lathe(
    [
      [0, 0.024],
      [0.018, 0.019],
      [0.027, 0.007],
      [0.028, 0],
      [0.024, 0],
      [0.023, 0.007],
      [0.015, 0.016],
      [0, 0.02],
    ],
    { at: capAt, axis: [0.2, 1, 0.35], segments: 9, color: eggPaint, bone: head, name: "headShell" },
  );

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    // front legs
    const S = [s * 0.05, 0.215, 0.05];
    const W = [s * 0.05, 0.024, 0.1];
    const arm = limb(S, W, [0.105, 0.105], [[0, 0, -1]]);
    const fT = [s * 0.052, 0.014, 0.14];
    const front = b.chain(`front${L}`, polyline([...arm, fT]), {
      parent: spine.joints[1],
      names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`, `hand${L}`],
      role: "leg",
      contact: [s * 0.052, 0, 0.12],
    });
    b.sweep(front, [0.024, 0.019, 0.015, 0.013], { color: coat, sides: 8 });
    b.part(new THREE.SphereGeometry(0.02, 8, 6), coat, {
      bone: front.joints[2],
      at: [s * 0.05, 0.013, 0.118],
      scale: [1.1, 0.65, 1.35],
    });
    for (const dx of [-0.011, 0, 0.011]) {
      const tp = [s * 0.05 + dx, 0.008, 0.142];
      b.part(new THREE.SphereGeometry(0.008, 6, 4), coat, { bone: front.joints[3], at: tp });
      b.spike(add(tp, [0, 0, 0.006]), [0, -0.4, 1], 0.01, 0.0035, { bone: front.joints[3], color: HORN, sides: 5 });
    }

    // hind legs
    const Hp = [s * 0.06, 0.085, -0.02];
    const K = [s * 0.11, 0.08, 0.075];
    const A = [s * 0.11, 0.022, 0.03];
    const T = [s * 0.125, 0.012, 0.115];
    const hind = b.chain(`hind${L}`, polyline([Hp, K, A, T]), {
      parent: hips,
      names: [`hip${L}`, `knee${L}`, `ankle${L}`, `foot${L}`],
      role: "leg",
      contact: [s * 0.122, 0, 0.1],
    });
    b.sweep(hind, [0.032, 0.024, 0.018, 0.015], { color: coat, sides: 8 });
    b.part(new THREE.SphereGeometry(0.05, 10, 8), coat, {
      bone: hind.joints[0],
      at: [s * 0.085, 0.055, 0.02],
      scale: [0.8, 1, 1.1],
      flat: true,
      name: `haunch${L}`,
    });
    const fd = v(T).sub(v(A)).setY(0).normalize();
    const lat = new THREE.Vector3(-fd.z, 0, fd.x);
    b.part(new THREE.SphereGeometry(0.025, 8, 6), coat, {
      bone: hind.joints[2],
      at: v(A).add(v(T)).multiplyScalar(0.5).setY(0.0135),
      dir: fd,
      axis: "z",
      scale: [1, 0.55, 1.7],
    });
    for (const k of [-1, 0, 1]) {
      const tp = v(T).addScaledVector(fd, 0.008).addScaledVector(lat, k * 0.014).setY(0.0105);
      b.part(new THREE.SphereGeometry(0.0105, 6, 4), coat, { bone: hind.joints[3], at: tp });
      b.spike(v(tp).addScaledVector(fd, 0.008), fd.clone().setY(-0.4), 0.012, 0.004, {
        bone: hind.joints[3],
        color: HORN,
        sides: 5,
      });
    }

    // ---------- wings ----------
    const R0 = [s * 0.035, 0.235, -0.03];
    const E = [s * 0.15, 0.3, -0.09];
    const Wr = [s * 0.25, 0.28, -0.07];
    const wing = b.chain(`wing${L}`, polyline([R0, E, Wr]), {
      parent: spine.joints[1],
      names: [`wingShoulder${L}`, `wingElbow${L}`, `wingWrist${L}`],
      role: "wing",
    });
    b.sweep(wing, [0.017, 0.012, 0.009], { color: coat, sides: 7 });
    const wrist = wing.tip!;
    b.spike(wrist, [s * 0.15, 1, 0.35], 0.022, 0.006, { bone: wrist, color: HORN, sides: 5 });
    const tips = [
      [s * 0.43, 0.37, -0.1],
      [s * 0.42, 0.2, -0.12],
      [s * 0.31, 0.095, -0.13],
    ];
    const mids = [
      [s * 0.34, 0.34, -0.085],
      [s * 0.34, 0.24, -0.1],
      [s * 0.28, 0.18, -0.105],
    ];
    const fingers = tips.map((tp, i) =>
      b.chain(`finger${i + 1}${L}`, polyline([Wr, mids[i], tp]), {
        parent: wrist,
        names: [`finger${i + 1}a${L}`, `finger${i + 1}b${L}`],
        role: "digit",
      }),
    );
    for (const f of fingers) b.sweep(f, [0.008, 0.0035], { color: TEAL_DEEP, sides: 6 });
    b.membrane(fingers[0], fingers[1], { color: wingSkin, thickness: 0.004, scallop: 0.12 });
    b.membrane(fingers[1], fingers[2], { color: wingSkin, thickness: 0.004, scallop: 0.12 });
    b.membrane(
      fingers[2],
      [
        [s * 0.05, 0.215, -0.045],
        [s * 0.05, 0.12, -0.06],
      ],
      { color: wingSkin, thickness: 0.004, scallop: 0.08, bone: spine.joints[0] },
    );
  }

  // ---------- broken egg ----------
  const EX = 0.24;
  const EZ = 0.1;
  b.lathe(
    [
      [0, 0],
      [0.03, 0.003],
      [0.05, 0.02],
      [0.058, 0.05],
      [0.056, 0.075],
      [0.051, 0.075],
      [0.053, 0.05],
      [0.045, 0.022],
      [0.025, 0.008],
      [0, 0.006],
    ],
    { at: [EX, 0, EZ], segments: 10, color: eggPaint, bone: hips, name: "eggCup" },
  );
  const rim = b.ring(frame([EX, 0.075, EZ], [0, 1, 0]), { count: 10, radius: 0.0535 }).items;
  rim.forEach((item, i) => {
    const tang = new THREE.Vector3(0, 1, 0).cross(item.axis).normalize();
    const h = i % 2 ? 0.014 + R() * 0.008 : 0.022 + R() * 0.012;
    const w = 0.012;
    b.extrude(
      [
        [-w, -0.008],
        [w, -0.008],
        [(R() - 0.5) * 0.01, h],
      ],
      { at: item.at, x: tang, y: [0, 1, 0], thickness: 0.004, color: eggPaint, bone: hips },
    );
  });
  // shards on the floor
  const shardSpots: number[][] = [];
  for (let i = 0; i < 4; i++) {
    const a = -1.5 + (3 * i) / 3 + (R() - 0.5) * 0.4;
    const r = 0.09 + R() * 0.04;
    shardSpots.push([EX + r * Math.cos(a), EZ + r * Math.sin(a)]);
  }
  shardSpots.push([-0.2, 0.15], [-0.13, 0.21]);
  for (const [cx, cz] of shardSpots) {
    const n = 4 + Math.floor(R() * 2);
    const outline: [number, number][] = [];
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2 + (R() - 0.5) * 0.6;
      const r = 0.011 + R() * 0.011;
      outline.push([r * Math.cos(a), r * Math.sin(a)]);
    }
    const rot = R() * Math.PI * 2;
    const c = Math.cos(rot);
    const sn = Math.sin(rot);
    b.extrude(outline, {
      at: [cx, 0.002, cz],
      x: [c, 0, sn],
      y: [-sn, 0, c],
      thickness: 0.004,
      color: eggPaint,
      bone: hips,
    });
  }

  return b.root;
}
