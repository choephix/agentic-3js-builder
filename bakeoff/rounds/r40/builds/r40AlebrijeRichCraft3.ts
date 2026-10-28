import * as THREE from "three";
import {
  createBuilder,
  catmull,
  polyline,
  bezier,
  limb,
  paint,
  mix,
  noise,
  cells,
  smoothstep,
  scales,
  svg,
  rng,
  vec,
} from "../../../../src/index";
import type { ColorInput, Rgb } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Alebrije Jaguar-Eagle",
  description:
    "Oaxacan alebrije painted-wood fantasy: a rosette-spotted jaguar body with an eagle head, hooked beak, feathered crest, spread painted wings and a fan tail, covered in dots, flowers and suns.",
};

// ---------------------------------------------------------------- palette
const INK = "#1c1420";
const MAG = "#d6247a";
const TURQ = "#12b5b0";
const YEL = "#ffc61a";
const ORG = "#ff7a1a";
const RED = "#e0262f";
const GRN = "#3aa83a";
const BLU = "#2a5fd0";
const PUR = "#7a2fb0";
const CRM = "#fff0cf";
const PNK = "#ff7fb0";

const zig = (x: number) => Math.abs((x - Math.floor(x)) * 2 - 1);

const prof =
  (keys: number[][]) =>
  (t: number): [number, number] => {
    if (t <= keys[0][0]) return [keys[0][1], keys[0][2]];
    for (let i = 1; i < keys.length; i++) {
      if (t <= keys[i][0]) {
        const a = keys[i - 1];
        const c = keys[i];
        const u = (t - a[0]) / (c[0] - a[0]);
        return [a[1] + (c[1] - a[1]) * u, a[2] + (c[2] - a[2]) * u];
      }
    }
    const l = keys[keys.length - 1];
    return [l[1], l[2]];
  };

// ---------------------------------------------------------------- paints
const RING = [MAG, PUR, RED, BLU];
const CORE = [TURQ, YEL, PNK, GRN];

const jag = paint((p, n) => {
  const c = cells(p, 0.11, 5);
  const k = Math.floor(c.id * 4) % 4;
  let col: string | Rgb = mix(ORG, YEL, smoothstep(0.35, 0.8, noise(p, 0.28, 2)));
  if (c.d1 < 0.1) col = CORE[k];
  else if (c.d1 > 0.19 && c.d1 < 0.3) col = RING[k];
  const belly = smoothstep(-0.2, -0.55, n.y);
  if (belly > 0) {
    let bc: string | Rgb = CRM;
    const d = cells(p, 0.05, 11);
    if (d.d1 < 0.17) bc = BLU;
    col = mix(col, bc, belly);
  }
  if (n.y > 0.7 && p.y > 0.62 && Math.abs(p.x) < 0.02 + 0.014 * zig(p.z / 0.06)) {
    col = Math.floor(p.z / 0.06) % 2 ? RED : TURQ;
  }
  return mix(col, "#2a1030", 0.28 * smoothstep(0.1, -0.9, n.y));
});

const dotted = (base: ColorInput, dot: ColorInput, size: number, r = 0.2, seed = 1) =>
  paint((p) => {
    const c = cells(p, size, seed);
    return c.d1 < r ? dot : base;
  });

const neckPaint = scales([CRM, "#ffe2a8", "#ffd0e4"], PUR, { size: 0.05, width: 0.16, seed: 4 });
const headPaint = paint((p, n) => {
  const c = cells(p, 0.045, 9);
  if (c.d1 < 0.16) return n.y > 0.3 ? TURQ : MAG;
  return CRM;
});
const wingArm = dotted(TURQ, YEL, 0.05, 0.22, 3);
const pawPaint = dotted(BLU, YEL, 0.04, 0.2, 6);

const beakPaint = paint((_p, _n, s) => {
  const t = s[0];
  if (t > 0.86) return INK;
  if (t < 0.15) return ORG;
  return (t * 8) % 1 < 0.18 ? MAG : YEL;
});

const TAILC = [MAG, YEL, TURQ, ORG];
const tailPaint = paint((_p, _n, s) => {
  const u = s[0] * 14;
  const k = Math.floor(u);
  const f = u - k;
  if (f < 0.1 || f > 0.9) return INK;
  if (f > 0.4 && f < 0.6 && Math.abs(s[1]) < 25) return CRM;
  return TAILC[k % 4];
});

// ---------------------------------------------------------------- feathers
const featherProf = (t: number) => (t < 0.5 ? 0.72 + 0.28 * (t / 0.5) : Math.sqrt(Math.max(0, 1 - ((t - 0.5) / 0.5) ** 2)));

function featherOutline(L: number, w: number) {
  const ts = [0, 0.2, 0.4, 0.6, 0.75, 0.88, 0.96];
  const low: any[] = ts.map((t) => [L * t, (-w / 2) * featherProf(t)]);
  const up: any[] = ts
    .slice()
    .reverse()
    .map((t) => [L * t, (w / 2) * featherProf(t)]);
  return [...low, [L, 0, "sharp"], ...up];
}

const fpCache = new Map<string, any>();
function featherPaint(cols: string[], L: number, w: number) {
  const key = `${cols.join("")}|${L.toFixed(2)}|${w.toFixed(3)}`;
  let p = fpCache.get(key);
  if (!p) {
    p = paint((_p, _n, s) => {
      const t = s[0] / L;
      const y = Math.abs(s[1]);
      const hw = (w / 2) * featherProf(Math.min(Math.max(t, 0), 1));
      if (t > 0.02 && hw - y < 0.005) return INK;
      if (y < 0.0035 && t > 0.05) return INK;
      const dx = (((s[0] / 0.034) % 1) + 1) % 1 - 0.5;
      if (t > 0.2 && t < 0.88 && Math.hypot(dx * 0.034, y - w * 0.22) < 0.0065) return CRM;
      const z = zig(s[1] / 0.03) * 0.04;
      if (t < 0.32 + z) return cols[0];
      if (t < 0.72 + z) return cols[1];
      return cols[2];
    });
    fpCache.set(key, p);
  }
  return p;
}

// ---------------------------------------------------------------- textures
const EYE = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <path d="M3 42 Q28 8 60 18 Q92 28 98 62 Q70 90 38 84 Q10 76 3 42Z" fill="${INK}"/>
  <path d="M10 44 Q30 18 58 26 Q84 34 90 58 Q68 80 40 76 Q18 70 10 44Z" fill="${CRM}"/>
  <circle cx="52" cy="52" r="25" fill="${ORG}" stroke="${INK}" stroke-width="3"/>
  <circle cx="52" cy="52" r="17" fill="${YEL}"/>
  <circle cx="52" cy="52" r="10" fill="${INK}"/>
  <circle cx="45" cy="44" r="5" fill="#ffffff"/>
  <circle cx="58" cy="60" r="2.5" fill="#ffffff"/>
  <path d="M8 40 Q30 6 64 14 Q40 14 12 46Z" fill="${MAG}" stroke="${INK}" stroke-width="2.5"/>
  <path d="M3 42 Q-1 36 0 28" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/>
</svg>`,
  { size: 256 },
);

const FLOWER = (() => {
  const petals = Array.from(
    { length: 8 },
    (_, i) =>
      `<ellipse cx="0" cy="-31" rx="10.5" ry="18" fill="${i % 2 ? MAG : PNK}" stroke="${INK}" stroke-width="3" transform="rotate(${i * 45})"/>`,
  ).join("");
  const dots = Array.from(
    { length: 10 },
    (_, i) =>
      `<circle cx="${(Math.sin((i * Math.PI) / 5) * 13).toFixed(1)}" cy="${(-Math.cos((i * Math.PI) / 5) * 13).toFixed(1)}" r="2.4" fill="${MAG}"/>`,
  ).join("");
  return svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g transform="translate(50 50)">${petals}<circle r="21" fill="${YEL}" stroke="${INK}" stroke-width="3"/>${dots}<circle r="8" fill="${TURQ}" stroke="${INK}" stroke-width="2.5"/></g></svg>`,
    { size: 192 },
  );
})();

const SUN = (() => {
  const rays = Array.from(
    { length: 14 },
    (_, i) =>
      `<path d="M-9 -27 L0 -48 L9 -27Z" fill="${i % 2 ? RED : ORG}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round" transform="rotate(${(i * 360) / 14})"/>`,
  ).join("");
  const dots = Array.from(
    { length: 12 },
    (_, i) =>
      `<circle cx="${(Math.sin((i * Math.PI) / 6) * 20).toFixed(1)}" cy="${(-Math.cos((i * Math.PI) / 6) * 20).toFixed(1)}" r="2.6" fill="${MAG}"/>`,
  ).join("");
  return svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g transform="translate(50 50)">${rays}<circle r="28" fill="${YEL}" stroke="${INK}" stroke-width="3"/>${dots}<circle r="12" fill="${TURQ}" stroke="${INK}" stroke-width="3"/><circle r="5" fill="${MAG}"/></g></svg>`,
    { size: 192 },
  );
})();

const featherCard = (c1: string, c2: string, c3: string) =>
  svg(
    `<svg viewBox="0 0 40 80" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${c1}"/><stop offset="0.5" stop-color="${c2}"/><stop offset="1" stop-color="${c3}"/></linearGradient></defs>
  <path d="M20 78 C3 62 2 30 20 2 C38 30 37 62 20 78Z" fill="url(#g)" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M20 74 L20 12" stroke="${INK}" stroke-width="2.5"/>
  <circle cx="12" cy="52" r="2.6" fill="${CRM}"/><circle cx="28" cy="52" r="2.6" fill="${CRM}"/>
  <circle cx="13" cy="36" r="2.4" fill="${CRM}"/><circle cx="27" cy="36" r="2.4" fill="${CRM}"/>
  <circle cx="20" cy="24" r="2.4" fill="${CRM}"/>
</svg>`,
    { size: 128 },
  );
const CARD1 = featherCard(MAG, PNK, YEL);
const CARD2 = featherCard(TURQ, YEL, ORG);
const CARD3 = featherCard(PUR, BLU, TURQ);

// ---------------------------------------------------------------- build
export default function build() {
  const b = createBuilder({ name: "alebrije-jaguar-eagle" });
  const sph = (w = 8, h = 6) => new THREE.SphereGeometry(1, w, h);

  function feather(o: {
    at: THREE.Vector3;
    d: THREE.Vector3;
    N: THREE.Vector3;
    L: number;
    w: number;
    cols: string[];
    bone?: any;
    thick?: number;
  }) {
    const d = o.d.clone().normalize();
    const N = o.N.clone().sub(d.clone().multiplyScalar(o.N.dot(d))).normalize();
    const y = new THREE.Vector3().crossVectors(N, d).normalize();
    return b.extrude(featherOutline(o.L, o.w) as any, {
      at: o.at,
      x: d,
      y,
      thickness: o.thick ?? 0.012,
      bevel: 0.0025,
      color: featherPaint(o.cols, o.L, o.w),
      bone: o.bone,
    });
  }

  // ------------------------------------------------ skeleton: spine, body
  const hips = b.joint("hips", { at: [0, 0.68, -0.45] });
  const spinePts = [
    [0, 0.68, -0.45],
    [0, 0.7, -0.2],
    [0, 0.73, 0.08],
    [0, 0.77, 0.34],
    [0, 0.82, 0.55],
  ];
  const spine = b.chain("spine", catmull(spinePts), { parent: hips, role: "spine" });
  const body = b.sweep(
    spine,
    prof([
      [0, 0.13, 0.15],
      [0.25, 0.135, 0.155],
      [0.5, 0.125, 0.15],
      [0.75, 0.165, 0.2],
      [1, 0.15, 0.17],
    ]),
    { color: jag, sides: 10 },
  );
  const bodySkin = b.surface(body);

  // painted bands round the waist and chest, studded with beads
  const bands: [any, string][] = [
    [spine.joints[1], TURQ],
    [spine.joints[3], MAG],
  ];
  for (const [jt, col] of bands) {
    const loop = bodySkin.loop(jt, { lift: 0.006 });
    b.sweep(loop, 0.014, { color: col });
    let k = 0;
    b.along(loop, 18, (at: any) => {
      b.part(sph(6, 4), k++ % 2 ? YEL : CRM, { at, scale: [0.018, 0.018, 0.018] });
    });
  }

  // flank flowers
  for (const s of [1, -1]) {
    const hit = bodySkin.around([0, 0.72, 0.0]).at(s * 90, 4);
    if (hit) b.decal(body, FLOWER, { at: hit, dir: [s, 0, 0], size: [0.2, 0.2] });
  }

  // ------------------------------------------------ neck & head
  const neckPts = [
    [0, 0.82, 0.55],
    [0, 0.95, 0.62],
    [0, 1.1, 0.7],
    [0, 1.25, 0.8],
  ];
  const neck = b.chain("neck", catmull(neckPts), { parent: spine.joints[3], role: "neck" });
  b.sweep(neck, [0.14, 0.09], { color: neckPaint, sides: 10 });

  const head = b.joint("head", {
    parent: neck.joints[neck.joints.length - 1],
    at: neckPts[3],
    dir: [0, -0.06, 1],
    role: "head",
  });
  const H = (f: number, u: number, l = 0) => head.local({ forward: f, up: u, left: l });

  const skull = b.part(sph(12, 9), headPaint, { bone: head, at: H(0.05, 0.03), scale: [0.1, 0.105, 0.12] });
  b.part(sph(8, 6), neckPaint, { bone: head, at: H(0.0, -0.05), scale: [0.085, 0.07, 0.09] });

  // eyes
  const skin = b.surface(skull);
  const cEye = H(0.06, 0.03);
  for (const s of [1, -1]) {
    const hit = skin.around(cEye).at(s * 52, 8);
    if (hit) b.decal(skull, EYE, { at: hit, size: [0.1, 0.1], mirror: s > 0 });
    b.capsule(H(0.04, 0.105, s * 0.08), H(0.14, 0.095, s * 0.05), 0.014, { color: TURQ, bone: head });
    // jaguar ears
    b.part(sph(8, 6), jag, { bone: head, at: H(-0.01, 0.085, s * 0.092), scale: [0.035, 0.047, 0.03] });
    b.part(sph(8, 6), PNK, { bone: head, at: H(0.006, 0.085, s * 0.092), scale: [0.022, 0.032, 0.02] });
  }

  // upper beak
  const beakPath = bezier(H(0.09, 0.015), H(0.2, 0.03), H(0.29, 0.02), H(0.335, -0.09));
  const beak = b.sweep(beakPath, (t: number) => [0.052 * (1 - t) + 0.006, 0.07 * (1 - t * 0.85) + 0.008], {
    bone: head,
    color: beakPaint,
    caps: { start: "round", end: "point" },
    sides: 8,
  });
  for (const s of [1, -1]) {
    b.stick(sph(6, 4), INK, beak.at(0.22, s * 80), { embed: 0.5, scale: [0.011, 0.011, 0.011] });
  }

  // lower beak on its own jaw joint
  const jaw = b.joint("jaw", { parent: head, at: H(0.05, -0.045), aim: H(0.3, -0.06), role: "jaw" });
  b.sweep(polyline([H(0.06, -0.045), H(0.17, -0.06), H(0.26, -0.058), H(0.3, -0.05)]), (t: number) => [0.04 * (1 - t) + 0.01, 0.028 * (1 - t * 0.7) + 0.008], {
    bone: jaw,
    color: beakPaint,
    caps: { end: "point" },
    sides: 8,
  });
  b.part(sph(6, 4), RED, { bone: jaw, at: H(0.14, -0.045), scale: [0.025, 0.012, 0.06] });

  // forehead gem and crest
  glow(b.part(new THREE.OctahedronGeometry(0.026), YEL, { bone: head, at: H(0.045, 0.135) }), 1.4);
  const crestPal: string[][] = [
    [MAG, ORG, YEL],
    [TURQ, GRN, YEL],
    [PUR, MAG, PNK],
    [BLU, TURQ, CRM],
  ];
  const crestRoot = vec(H(-0.03, 0.11));
  [-48, -32, -16, 0, 16, 32, 48].forEach((a, i) => {
    const r = (a * Math.PI) / 180;
    feather({
      at: crestRoot,
      d: new THREE.Vector3(Math.sin(r), Math.cos(r), -0.35),
      N: new THREE.Vector3(0, 0.3, 1),
      L: 0.34 - (0.12 * Math.abs(a)) / 48,
      w: 0.075,
      cols: crestPal[i % 4],
      bone: head,
      thick: 0.014,
    });
  });

  // neck ruff of painted feather cards
  const rr = rng(7);
  const ruff: [number, number, number, [number, number]][] = [
    [0.1, 12, 0.12, [0.09, 0.16]],
    [0.3, 10, 0.1, [0.075, 0.13]],
    [0.6, 9, 0.08, [0.06, 0.1]],
  ];
  for (const [t, count, radius, size] of ruff) {
    b.cards(b.ring(neck.at(t), { count, radius }).items, [CARD1, CARD2, CARD3], {
      size,
      lean: 58,
      bend: 20,
      vary: 0.2,
      cross: true,
      rng: rr,
    });
  }

  b.pose(jaw, { axis: [1, 0, 0], deg: 6 });

  // ------------------------------------------------ tail
  const tailPts = [
    [0, 0.7, -0.5],
    [0, 0.62, -0.85],
    [0, 0.56, -1.2],
    [0, 0.64, -1.5],
    [0, 0.82, -1.68],
  ];
  const tail = b.chain("tail", catmull(tailPts), { parent: hips, role: "tail" });
  b.sweep(tail, [0.075, 0.035], { color: tailPaint, sides: 10 });
  const tailTip = vec(tailPts[4]);
  const tailBone = tail.joints[tail.joints.length - 1];
  const tailPal: string[][] = [
    [TURQ, BLU, CRM],
    [MAG, PUR, PNK],
    [YEL, ORG, RED],
  ];
  [-54, -36, -18, 0, 18, 36, 54].forEach((a, i) => {
    const r = (a * Math.PI) / 180;
    feather({
      at: tailTip,
      d: new THREE.Vector3(Math.sin(r), 0.38, -Math.cos(r)),
      N: new THREE.Vector3(0, 1, 0),
      L: 0.46 - (0.07 * Math.abs(a)) / 54,
      w: 0.1,
      cols: Math.abs(a) < 10 ? tailPal[2] : tailPal[i % 2],
      bone: tailBone,
      thick: 0.014,
    });
  });

  // ------------------------------------------------ paws
  const paw = (tip: any, x: number, z: number) => {
    b.part(sph(8, 6), pawPaint, { bone: tip, at: [x, 0.05, z + 0.04], scale: [0.075, 0.052, 0.1] });
    for (const o of [-0.04, 0, 0.04]) {
      b.part(sph(6, 4), YEL, { bone: tip, at: [x + o, 0.032, z + 0.12], scale: [0.03, 0.028, 0.034] });
      b.spike([x + o, 0.03, z + 0.145], [0, -0.35, 1], 0.055, 0.012, { color: CRM, bone: tip });
    }
  };

  // ------------------------------------------------ legs and wings (mirrored)
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";

    // front leg
    const fp = limb([s * 0.17, 0.64, 0.42], [s * 0.17, 0.06, 0.47], [0.3, 0.29], [[0, 0, -1]]);
    const legF = b.chain(`legF${sd}`, fp, {
      parent: spine.joints[2],
      names: [`shoulder${sd}`, `elbow${sd}`, `wrist${sd}`],
      role: "leg",
    });
    b.sweep(legF, [0.085, 0.05], { color: jag, sides: 8 });
    const shoulder = b.part(sph(10, 7), jag, {
      bone: legF.joints[0],
      at: [s * 0.2, 0.66, 0.42],
      scale: [0.1, 0.13, 0.14],
    });
    const sh = b.surface(shoulder).around([s * 0.2, 0.66, 0.42]).at(s * 90, 0);
    if (sh) b.decal(shoulder, FLOWER, { at: sh, dir: [s, 0, 0], size: [0.15, 0.15] });
    paw(legF.tip!, s * 0.17, 0.47);

    // hind leg
    const hp = limb(
      [s * 0.18, 0.68, -0.42],
      [s * 0.17, 0.06, -0.36],
      [0.3, 0.3, 0.2],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const legH = b.chain(`legH${sd}`, hp, {
      parent: hips,
      names: [`hip${sd}`, `knee${sd}`, `hock${sd}`, `ankle${sd}`],
      role: "leg",
    });
    b.sweep(legH, [0.085, 0.045], { color: jag, sides: 8 });
    const thigh = b.part(sph(10, 7), jag, {
      bone: legH.joints[0],
      at: [s * 0.2, 0.62, -0.4],
      scale: [0.1, 0.15, 0.17],
    });
    const th = b.surface(thigh).around([s * 0.2, 0.62, -0.4]).at(s * 90, 0);
    if (th) b.decal(thigh, SUN, { at: th, dir: [s, 0, 0], size: [0.2, 0.2] });
    paw(legH.tip!, s * 0.17, -0.36);

    // wing
    const wp = [
      [s * 0.15, 0.9, 0.36],
      [s * 0.58, 1.1, 0.26],
      [s * 1.05, 1.22, 0.2],
      [s * 1.42, 1.22, 0.1],
    ];
    const wing = b.chain(`wing${sd}`, catmull(wp), {
      parent: spine.joints[3],
      names: [`wingShoulder${sd}`, `wingElbow${sd}`, `wingWrist${sd}`, `wingTip${sd}`],
      role: "wing",
    });
    b.sweep(wing, (t: number) => 0.07 * (1 - t) + 0.03, { color: wingArm, sides: 8 });

    const at = (t: number, lift: number) => {
      const cp: any = wing.at(t);
      const p = vec(cp.at);
      p.y += lift;
      return { p, bone: cp.bone ?? undefined };
    };
    const dir = (phiDeg: number, up: number) => {
      const r = (phiDeg * Math.PI) / 180;
      return new THREE.Vector3(s * Math.sin(r), up, -Math.cos(r));
    };
    const up = new THREE.Vector3(0, 1, 0);

    const primL = [0.42, 0.5, 0.55, 0.55, 0.52, 0.46, 0.38];
    const primC: string[][] = [
      [BLU, TURQ, CRM],
      [PUR, MAG, PNK],
    ];
    for (let i = 0; i < 7; i++) {
      const r = at(0.68 + i * 0.05, 0);
      feather({ at: r.p, d: dir(26 + i * 9, 0.04 + i * 0.015), N: up, L: primL[i], w: 0.09, cols: primC[i % 2], bone: r.bone });
    }
    const secL = [0.36, 0.38, 0.4, 0.42, 0.42, 0.41, 0.4, 0.38];
    const secC: string[][] = [
      [MAG, ORG, YEL],
      [TURQ, GRN, YEL],
    ];
    for (let j = 0; j < 8; j++) {
      const r = at(0.1 + j * 0.075, 0.009);
      feather({ at: r.p, d: dir(-2 + j * 3, 0.05), N: up, L: secL[j], w: 0.12, cols: secC[j % 2], bone: r.bone });
    }
    const covC: string[][] = [
      [YEL, ORG, RED],
      [PNK, MAG, PUR],
    ];
    for (let k = 0; k < 9; k++) {
      const t = 0.1 + k * 0.1;
      const r = at(t, 0.019);
      feather({ at: r.p, d: dir(5 + 70 * t, 0.05), N: up, L: 0.22, w: 0.13, cols: covC[k % 2], bone: r.bone, thick: 0.01 });
    }
  }

  return b.root;
}
