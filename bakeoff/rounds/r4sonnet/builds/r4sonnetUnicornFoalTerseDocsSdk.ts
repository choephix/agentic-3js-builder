import * as THREE from "three";
import {
  createBuilder,
  catmull,
  bezier,
  limb,
  countershade,
  gradient,
  mottle,
  paint,
  svg,
} from "../../../../src/index";

export const meta = {
  name: "Unicorn Foal",
  description:
    "A leggy, big-eyed unicorn foal in a neutral rest pose. Pearl-cream coat with pink socks and golden hooves, a pastel rainbow mane and tail, a gold-ridged spiral horn, a star cutie mark and a star-pendant collar. Rigged with spine, neck, head, jaw, ears, tail and four leg chains.",
};

type V3 = [number, number, number];

// ---------- palette (flat colours) ----------
const CREAM = "#fffaf2";
const CREAM_S = "#f7edf2";
const BELLY = "#efdde9";
const SOCK = "#ffd3e7";
const NOSE = "#ffb0c8";
const BLUSH = "#ff93b8";
const INNER = "#ffb4d0";
const PINK = "#ff86bf";
const PINK_L = "#ffc0dc";
const LILAC = "#b79bff";
const LILAC_D = "#8f74ee";
const AQUA = "#74dde6";
const GOLD = "#f6c445";
const GOLD_D = "#d9962b";
const HOOF = "#f2c96e";
const HOOF_RIM = "#ffb0cf";
const HORN_A = "#fff6dc";
const HORN_B = "#ffcfeb";

const MANE = [PINK, LILAC, AQUA, PINK_L, LILAC_D];

// ---------- helpers ----------
const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const P = (p: any): THREE.Vector3 =>
  Array.isArray(p) ? v3(p[0], p[1], p[2]) : v3(p.x, p.y, p.z);

/** piecewise-linear table lookup: keys = [[u, value], ...] */
function keyed(keys: number[][], u: number): number {
  if (u <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (u <= keys[i][0]) {
      const a = keys[i - 1];
      const c = keys[i];
      return a[1] + (c[1] - a[1]) * ((u - a[0]) / (c[0] - a[0] || 1));
    }
  }
  return keys[keys.length - 1][1];
}

/** cumulative arc-length fraction at each point of a polyline */
function knotFractions(pts: THREE.Vector3[]): number[] {
  const d = [0];
  for (let i = 1; i < pts.length; i++) d.push(d[i - 1] + pts[i].distanceTo(pts[i - 1]));
  const L = d[d.length - 1] || 1;
  return d.map((x) => x / L);
}

/** t along a polyline -> "knot index space" (0 at first point, 1 at second ...) */
function toU(ts: number[], t: number): number {
  for (let i = 1; i < ts.length; i++) {
    if (t <= ts[i]) return i - 1 + (t - ts[i - 1]) / (ts[i] - ts[i - 1] || 1);
  }
  return ts.length - 1;
}

// radius tables
const BODY_RX = [[0, 0.145], [0.25, 0.168], [0.6, 0.178], [1, 0.158]];
const BODY_RY = [[0, 0.165], [0.25, 0.19], [0.6, 0.205], [1, 0.19]];
const HEAD_RX = [[0, 0.08], [0.3, 0.092], [0.7, 0.062], [1, 0.05]];
const HEAD_RY = [[0, 0.084], [0.3, 0.088], [0.7, 0.06], [1, 0.048]];
const EAR_RX = [[0, 0.03], [0.35, 0.04], [0.75, 0.024], [1, 0.004]];
const EAR_RY = [[0, 0.016], [0.5, 0.015], [1, 0.004]];
const EARI_RX = [[0, 0.017], [0.4, 0.024], [0.8, 0.014], [1, 0.004]];
const TAIL_R = [[0, 0.02], [0.3, 0.034], [0.75, 0.036], [1, 0.01]];
const LEG_F = [[0, 0.064], [0.6, 0.051], [1, 0.04], [1.1, 0.034], [1.9, 0.026], [2, 0.033], [2.35, 0.028], [3, 0.027]];
const LEG_H = [[0, 0.078], [0.5, 0.072], [1, 0.057], [1.5, 0.047], [2, 0.04], [2.2, 0.032], [2.9, 0.025], [3, 0.031], [3.6, 0.026], [4, 0.025]];

// ---------- textures ----------
const EYE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
<defs><radialGradient id="ir" cx="50%" cy="38%" r="68%">
<stop offset="0" stop-color="#f0dcff"/><stop offset="0.55" stop-color="#a77bff"/><stop offset="1" stop-color="#6a3fd0"/>
</radialGradient></defs>
<ellipse cx="50" cy="56" rx="40" ry="41" fill="#2a1750"/>
<ellipse cx="50" cy="58" rx="33" ry="35" fill="url(#ir)"/>
<ellipse cx="50" cy="62" rx="15" ry="19" fill="#1a0d38"/>
<path d="M10 42 Q48 2 90 36" fill="none" stroke="#1a0d38" stroke-width="9" stroke-linecap="round"/>
<path d="M82 26 Q91 19 95 13" fill="none" stroke="#1a0d38" stroke-width="6" stroke-linecap="round"/>
<path d="M89 38 Q95 35 96 30" fill="none" stroke="#1a0d38" stroke-width="6" stroke-linecap="round"/>
<circle cx="37" cy="44" r="11" fill="#ffffff"/>
<circle cx="63" cy="74" r="5.5" fill="#ffffff"/>
<circle cx="56" cy="47" r="3" fill="#ffffff"/>
</svg>`;

const STAR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#e2c2ff"/><stop offset="1" stop-color="#a66bff"/></linearGradient></defs>
<polygon points="32,10 37.9,25.9 54.8,26.6 41.5,37.1 46.1,53.4 32,44 17.9,53.4 22.5,37.1 9.2,26.6 26.1,25.9" fill="url(#g)" stroke="#6b3fc4" stroke-width="3" stroke-linejoin="round"/>
<path d="M52 4 L54 10 L60 12 L54 14 L52 20 L50 14 L44 12 L50 10 Z" fill="#ffd45a"/>
<path d="M11 8 L12.4 12 L16.5 13.4 L12.4 14.8 L11 19 L9.6 14.8 L5.5 13.4 L9.6 12 Z" fill="#ff8ec4"/>
</svg>`;

const NOSTRIL_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 24">
<ellipse cx="20" cy="12" rx="17" ry="9" fill="#b85a80"/></svg>`;

export default function build() {
  const b = createBuilder({ name: "unicorn_foal" });

  // ---------- paints ----------
  const COAT = countershade(
    mottle(CREAM, CREAM_S, { size: 0.2, contrast: 0.5, seed: 4 }),
    BELLY,
    { level: -0.3 },
  );
  const LEG_PAINT = gradient(COAT, SOCK, [0, 0.27, 0], [0, 0.17, 0]);
  const MUZZLE = gradient(COAT, NOSE, [0, 1.0, 0.765], [0, 0.955, 0.865]);
  const HEAD_PAINT = paint((p) => {
    const dx = Math.abs(p.x) - 0.1005;
    const dy = p.y - 1.0355;
    const dz = p.z - 0.6827;
    return dx * dx + dy * dy + dz * dz < 0.028 * 0.028 ? BLUSH : MUZZLE;
  });

  const eyeTex = svg(EYE_SVG, { size: 256 });
  const starTex = svg(STAR_SVG, { size: 192 });
  const nostrilTex = svg(NOSTRIL_SVG, { size: 64 });

  // ---------- spine & body ----------
  const hips = b.joint("hips", { at: [0, 0.8, -0.36], dir: [0, 0, 1] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.8, -0.36],
      [0, 0.81, -0.12],
      [0, 0.83, 0.1],
      [0, 0.86, 0.3],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3", "spine4"], role: "spine" },
  );
  const spineTip = spine.joints[spine.joints.length - 1];

  const body = b.sweep(
    spine,
    (t: number) => [keyed(BODY_RX, t), keyed(BODY_RY, t)],
    { color: COAT, shift: [0, -0.02], sides: 10 },
  );

  // ---------- neck ----------
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.92, 0.3],
      [0, 1.04, 0.4],
      [0, 1.17, 0.52],
    ]),
    { parent: spineTip, names: ["neck1", "neck2", "neck3"], role: "neck" },
  );
  const neckTip = neck.joints[neck.joints.length - 1];
  const neckTube = b.sweep(neck, (t: number) => 0.125 - 0.04 * t, { color: COAT, sides: 10 });

  // ---------- head ----------
  const head = b.joint("head", {
    parent: neckTip,
    at: [0, 1.17, 0.52],
    dir: [0, -0.5, 0.87],
    role: "head",
  });
  const headPts: V3[] = [
    [0, 1.175, 0.54],
    [0, 1.125, 0.63],
    [0, 1.045, 0.74],
    [0, 0.985, 0.82],
  ];
  const headTube = b.sweep(
    catmull(headPts),
    (t: number) => [keyed(HEAD_RX, t), keyed(HEAD_RY, t)],
    { bone: head, color: HEAD_PAINT, sides: 10 },
  );

  // chubby cheeks (with blush painted on)
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.045, 10, 8), HEAD_PAINT, {
      bone: head,
      at: [s * 0.062, 1.04, 0.66],
    });
  }

  // lower jaw (separate bone)
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.065, 0.63],
    aim: [0, 0.925, 0.79],
    role: "jaw",
  });
  b.sweep(
    [
      [0, 1.065, 0.63],
      [0, 0.93, 0.79],
    ],
    [0.048, 0.034],
    { bone: jaw, color: MUZZLE, sides: 8 },
  );

  // eyes (drawn decals) and nostrils
  for (const s of [1, -1]) {
    b.decal(headTube, eyeTex, {
      at: [s * 0.09, 1.13, 0.645],
      dir: [s * 0.85, 0.0, 0.5],
      size: [0.085, 0.085],
      segments: 12,
      mirror: s < 0,
    });
    b.decal(headTube, nostrilTex, {
      at: [s * 0.028, 0.972, 0.862],
      dir: [s * 0.35, 0.15, 1],
      size: [0.024, 0.015],
      segments: 6,
    });
  }

  // ears (hinged joints)
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const base: V3 = [s * 0.055, 1.215, 0.515];
    const mid: V3 = [s * 0.074, 1.285, 0.495];
    const tip: V3 = [s * 0.092, 1.34, 0.468];
    const ear = b.joint(`ear${side}`, { parent: head, at: base, aim: tip, role: "hinge" });
    b.sweep(
      catmull([base, mid, tip]),
      (t: number) => [keyed(EAR_RX, t), keyed(EAR_RY, t)],
      { bone: ear, color: COAT, sides: 6 },
    );
    b.sweep(
      catmull([
        [s * 0.056, 1.232, 0.528],
        [s * 0.074, 1.287, 0.508],
        [s * 0.091, 1.332, 0.482],
      ]),
      (t: number) => [keyed(EARI_RX, t), 0.008 * (1 - t) + 0.003],
      { bone: ear, color: INNER, sides: 6 },
    );
  }

  // ---------- the horn ----------
  const H0: V3 = [0, 1.2, 0.645];
  const H1: V3 = [0, 1.315, 0.678];
  const H2: V3 = [0, 1.45, 0.74];
  const hornPath = catmull([H0, H1, H2]);
  b.sweep(hornPath, [0.036, 0], {
    bone: head,
    color: gradient(HORN_A, HORN_B, H0, H2),
    sides: 8,
    caps: { start: "flat", end: "point" },
  });
  // twin golden spiral ridges
  for (const phase of [0, Math.PI]) {
    const pts: THREE.Vector3[] = [];
    const N = 36;
    for (let k = 0; k <= N; k++) {
      const t = 0.04 + (0.9 * k) / N;
      const c = P(hornPath.at(t));
      const T = P(hornPath.tangentAt(t)).normalize();
      const U = v3(1, 0, 0);
      const V = new THREE.Vector3().crossVectors(T, U).normalize();
      const ang = phase + t * Math.PI * 2 * 3.2;
      const rad = 0.036 * (1 - t) * 1.02;
      pts.push(c.clone().addScaledVector(U, Math.cos(ang) * rad).addScaledVector(V, Math.sin(ang) * rad));
    }
    b.sweep(catmull(pts), (t: number) => 0.0075 * (1 - 0.6 * t), {
      bone: head,
      color: GOLD,
      sides: 5,
    });
  }
  // gold collars at the horn base
  const hT = P(hornPath.tangentAt(0)).normalize();
  const hBase = P(H0);
  b.part(new THREE.CylinderGeometry(0.04, 0.047, 0.024, 8), GOLD, {
    bone: head,
    at: hBase.clone().addScaledVector(hT, 0.012),
    dir: [hT.x, hT.y, hT.z],
    flat: true,
  });
  b.part(new THREE.CylinderGeometry(0.036, 0.039, 0.012, 8), GOLD_D, {
    bone: head,
    at: hBase.clone().addScaledVector(hT, 0.05),
    dir: [hT.x, hT.y, hT.z],
    flat: true,
  });

  // ---------- forelock ----------
  const lock = (base: V3, ctrl: V3, tip: V3, col: string) =>
    b.sweep(bezier(base, ctrl, tip), (t: number) => [0.026 * (1 - t) + 0.006, 0.018 * (1 - t) + 0.005], {
      bone: head,
      color: col,
      sides: 6,
      smooth: false,
    });
  for (const s of [1, -1]) {
    lock([s * 0.03, 1.24, 0.55], [s * 0.04, 1.295, 0.615], [s * 0.075, 1.205, 0.7], PINK);
    lock([s * 0.065, 1.222, 0.535], [s * 0.095, 1.275, 0.585], [s * 0.108, 1.19, 0.655], LILAC);
  }
  lock([0, 1.245, 0.535], [0, 1.3, 0.55], [0, 1.285, 0.495], AQUA);

  // ---------- mane along neck and withers ----------
  const maneTuft = (at: any, i: number, k: number) => {
    const base = P(at.at);
    const n = P(at.axis).normalize();
    const sd = (i % 2 === 0 ? 1 : -1) * (0.018 + 0.01 * (i % 3));
    const ctrl = base.clone().addScaledVector(n, 0.07 * k).add(v3(sd * 0.5, 0, -0.025 * k));
    const tip = base.clone().addScaledVector(n, 0.09 * k).add(v3(sd * 1.4, -0.035 * k, -0.075 * k));
    b.sweep(bezier(at, ctrl, tip), (t: number) => [0.03 * (1 - t) + 0.006, 0.02 * (1 - t) + 0.005], {
      bone: at.bone ?? undefined,
      color: MANE[i % MANE.length],
      sides: 6,
      smooth: false,
    });
  };
  let mi = 0;
  b.along(neckTube, 8, (at: any) => { maneTuft(at, mi, 1.0 - 0.03 * mi); mi++; }, { from: 0.12, to: 0.98 });
  b.along(body, 3, (at: any) => { maneTuft(at, mi, 0.8); mi++; }, { from: 0.72, to: 0.9 });

  // ---------- collar with a star pendant ----------
  const collar = b.ring(neck.at(0.5), { count: 10, radius: 0.108 });
  b.sweep(catmull(collar.items, { closed: true }), 0.014, { color: PINK, sides: 6, smooth: false });
  const th = P(collar.items[5].at);
  const starOutline: [number, number][] = [];
  for (let i = 0; i < 10; i++) {
    const a = Math.PI / 2 + (i * Math.PI) / 5;
    const r = i % 2 === 0 ? 0.036 : 0.016;
    starOutline.push([Math.cos(a) * r, Math.sin(a) * r]);
  }
  b.extrude(starOutline, {
    at: [th.x, th.y - 0.034, th.z + 0.014],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.012,
    bevel: 0.003,
    color: GOLD,
    bone: neck.joints[1],
  });
  b.part(new THREE.SphereGeometry(0.009, 6, 4), PINK, {
    bone: neck.joints[1],
    at: [th.x, th.y - 0.034, th.z + 0.022],
  });

  // ---------- tail ----------
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.84, -0.47],
      [0, 0.83, -0.6],
      [0, 0.74, -0.7],
      [0, 0.6, -0.72],
      [0, 0.47, -0.76],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4", "tail5"], role: "tail" },
  );
  const strands: [number, number, string][] = [
    [0.026, 0, PINK],
    [-0.026, 0, LILAC],
    [0, 0.022, AQUA],
    [0, -0.022, PINK_L],
  ];
  for (const [ox, oy, col] of strands) {
    b.sweep(tail, (t: number) => keyed(TAIL_R, t), {
      shift: (t: number) => [ox * (0.2 + 0.8 * t), oy * (0.2 + 0.8 * t)],
      color: col,
      sides: 6,
      smooth: false,
    });
  }
  const tailTip = tail.joints[tail.joints.length - 1];
  b.ring(tailTip, { count: 6, radius: 0.012, tilt: 60 }, (it: any) =>
    b.spike(it, it, 0.11, 0.016, { color: MANE[it.i % MANE.length], sides: 5, smooth: false }),
  );

  // ---------- legs ----------
  const makeLeg = (
    tag: string,
    names: string[],
    pts: THREE.Vector3[],
    parent: any,
    keys: number[][],
    fetIdx: number,
    fluff: string[],
  ) => {
    const cor = pts[pts.length - 1];
    const chain = b.chain(`leg${tag}`, pts, {
      parent,
      names,
      role: "leg",
      contact: [cor.x, 0, cor.z],
    });
    const ts = knotFractions(pts);
    b.sweep(
      chain,
      (t: number) => {
        const r = keyed(keys, toU(ts, t));
        return [r * 0.92, r * 1.05];
      },
      { color: LEG_PAINT, sides: 8 },
    );
    const tip = chain.joints[chain.joints.length - 1];
    b.part(new THREE.CylinderGeometry(0.033, 0.04, 0.062, 8), HOOF, {
      bone: tip,
      at: [cor.x, 0.031, cor.z + 0.008],
      flat: true,
    });
    b.part(new THREE.CylinderGeometry(0.0365, 0.0365, 0.013, 8), HOOF_RIM, {
      bone: tip,
      at: [cor.x, 0.058, cor.z + 0.004],
      flat: true,
    });
    // fluffy fetlock feathering
    b.ring(chain.joints[fetIdx], { count: 7, radius: 0.028, tilt: 55 }, (it: any) =>
      b.spike(it, it, 0.07, 0.013, { color: fluff[it.i % fluff.length], sides: 5, smooth: false }),
    );
    return chain;
  };

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";

    // forelegs
    const fRoot: V3 = [s * 0.11, 0.7, 0.27];
    const fFet: V3 = [s * 0.11, 0.128, 0.285];
    const fp = limb(fRoot, fFet, [0.36, 0.22], [[0, 0, 1]]).map(P);
    const fCor = fp[fp.length - 1].clone().add(v3(0, -0.066, 0.022));
    makeLeg(
      `F${S}`,
      [`shoulder${S}`, `knee${S}`, `fetlockF${S}`, `hoofF${S}`],
      [...fp, fCor],
      spineTip,
      LEG_F,
      2,
      [PINK_L, LILAC],
    );

    // hind legs
    const hRoot: V3 = [s * 0.11, 0.71, -0.3];
    const hFet: V3 = [s * 0.11, 0.128, -0.37];
    const hp = limb(hRoot, hFet, [0.23, 0.25, 0.2], [[0, 0, 1], [0, 0, -1]]).map(P);
    const hCor = hp[hp.length - 1].clone().add(v3(0, -0.066, 0.022));
    makeLeg(
      `H${S}`,
      [`hip${S}`, `stifle${S}`, `hock${S}`, `fetlockH${S}`, `hoofH${S}`],
      [...hp, hCor],
      hips,
      LEG_H,
      3,
      [LILAC, PINK_L],
    );

    // cutie mark on each flank
    b.decal(body, starTex, {
      at: [s * 0.17, 0.85, -0.19],
      dir: [s, 0, 0],
      size: [0.13, 0.13],
      segments: 12,
    });
  }

  return b.root;
}
