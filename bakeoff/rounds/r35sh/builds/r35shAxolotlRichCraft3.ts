import * as THREE from "three";
import {
  createBuilder,
  rng,
  catmull,
  limb,
  paint,
  spots,
  mottle,
  countershade,
  mix,
  smoothstep,
  resolve,
  svg,
} from "../../../../src/index";

export const meta = {
  name: "Axolotl",
  description:
    "A chibi axolotl: a big round head with bulging glossy eyes, a wide smile and blush cheeks, three huge frilly pink gill stalks per side, stubby fingered legs and a finned tail.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette
const SKIN = "#f4a9c0";
const SKIN_TIP = "#fcc9d9";
const GILL_STALK = "#e0467d";
const COLLAR = "#d9487e";
const NOSE = "#a04066";

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// Body profile keyed by z: [z, halfWidth, halfHeight]
const KEY: [number, number, number][] = [
  [-0.23, 0.004, 0.006],
  [-0.18, 0.008, 0.011],
  [-0.12, 0.013, 0.019],
  [-0.07, 0.027, 0.029],
  [-0.02, 0.043, 0.039],
  [0.03, 0.048, 0.042],
  [0.07, 0.044, 0.04],
];
function prof(z: number): [number, number] {
  if (z <= KEY[0][0]) return [KEY[0][1], KEY[0][2]];
  for (let i = 0; i < KEY.length - 1; i++) {
    const a = KEY[i];
    const c = KEY[i + 1];
    if (z <= c[0]) {
      const t = smoothstep(a[0], c[0], z);
      return [a[1] + (c[1] - a[1]) * t, a[2] + (c[2] - a[2]) * t];
    }
  }
  const l = KEY[KEY.length - 1];
  return [l[1], l[2]];
}
function ramp(keys: [number, number][], z: number) {
  if (z <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const c = keys[i + 1];
    if (z <= c[0]) return a[1] + (c[1] - a[1]) * smoothstep(a[0], c[0], z);
  }
  return keys[keys.length - 1][1];
}

// ---------------------------------------------------------------------------------------------------------------
// Paints
const BELLY = "#fde0e8";
const BASE = mottle("#f4a2bb", "#f9c1d2", { size: 0.05, seed: 3 });
const FRECKLED = spots(BASE, "#dc7ba0", { size: 0.024, amount: 0.35, seed: 5 });
const COUNTER = countershade(FRECKLED, BELLY, { level: -0.25, soft: 0.28 });
// Warm light from above, cool lavender shade below.
const COAT = paint((p, n) => {
  const c = resolve(COUNTER, p, n);
  const up = smoothstep(-0.3, 1, n.y);
  const cool = mix(c, "#c49ad8", 0.2 * (1 - up));
  return mix(cool, "#fff0d8", 0.14 * up);
});
const JAW = paint((_p, n) => mix("#f9bfd0", "#fee6ec", smoothstep(-0.6, 0.8, n.y)));
const FIN = paint((_p, _n, s) => {
  const base = mix("#f8b4c8", "#ee77a0", smoothstep(0.1, 1, s[1]));
  const ray = Math.abs(Math.sin(s[0] * Math.PI * 34));
  return mix(base, "#d95c8c", 0.28 * smoothstep(0.7, 1, ray));
});

// ---------------------------------------------------------------------------------------------------------------
// Drawings
const EYE = svg(
  `<svg viewBox="0 0 64 64">
    <defs><radialGradient id="e" cx="0.5" cy="0.4" r="0.65"><stop offset="0" stop-color="#3b2b63"/><stop offset="1" stop-color="#110a1d"/></radialGradient></defs>
    <circle cx="32" cy="32" r="31" fill="#a8365f"/>
    <circle cx="32" cy="32" r="28" fill="url(#e)"/>
    <path d="M12 42 Q32 62 52 42 Q32 54 12 42Z" fill="#6c58c0"/>
    <ellipse cx="22" cy="21" rx="9" ry="10.5" fill="#ffffff"/>
    <circle cx="43" cy="40" r="4.2" fill="#ffffff"/>
    <circle cx="46" cy="27" r="2.2" fill="#ffffff"/>
  </svg>`,
  { size: 192 },
);
const SMILE = svg(
  `<svg viewBox="0 0 100 30">
    <path d="M7 9 Q50 36 93 9" stroke="#7a2447" stroke-width="4.5" stroke-linecap="round" fill="none"/>
    <path d="M7 9 L2.5 4 M93 9 L97.5 4" stroke="#7a2447" stroke-width="3.6" stroke-linecap="round" fill="none"/>
  </svg>`,
  { size: 256 },
);
const BLUSH = svg(
  `<svg viewBox="0 0 40 24">
    <ellipse cx="20" cy="12" rx="18" ry="10" fill="#ff8fb3"/>
    <path d="M11 7 l5 9 M20 5 l5 12 M29 7 l5 9" stroke="#e5527f" stroke-width="2.4" stroke-linecap="round" fill="none"/>
  </svg>`,
  { size: 128 },
);
const FRILL_A = svg(
  `<svg viewBox="0 0 40 80">
    <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#d63a74"/><stop offset="0.55" stop-color="#ff7aa6"/><stop offset="1" stop-color="#ffc9db"/></linearGradient></defs>
    <path d="M20 79 C7 62 3 34 20 2 C37 34 33 62 20 79Z" fill="url(#g)" stroke="#b02a60" stroke-width="2.6" stroke-linejoin="round"/>
    <path d="M20 76 L20 12" stroke="#c23570" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M20 60 L11 46 M20 60 L29 46 M20 44 L13 31 M20 44 L27 31" stroke="#e0508a" stroke-width="2" stroke-linecap="round"/>
  </svg>`,
  { size: 128 },
);
const FRILL_B = svg(
  `<svg viewBox="0 0 40 80">
    <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff6f9c"/><stop offset="0.6" stop-color="#ffb3cb"/><stop offset="1" stop-color="#fff0f5"/></linearGradient></defs>
    <path d="M20 79 C11 66 9 52 14 40 C8 30 12 14 20 2 C28 14 32 30 26 40 C31 52 29 66 20 79Z" fill="url(#g)" stroke="#d9487e" stroke-width="2.6" stroke-linejoin="round"/>
    <path d="M20 76 L20 10" stroke="#e0508a" stroke-width="2.2" stroke-linecap="round"/>
  </svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "axolotl" });
  const R = rng(11);

  // ---- Skeleton: spine curve (tail tip -> neck) ------------------------------------------------------------
  const zs = [-0.23, -0.17, -0.11, -0.06, -0.01, 0.035, 0.07];
  const spinePts = zs.map((z) => {
    const d = Math.max(0, -0.07 - z);
    return V(0, prof(z)[1] + 0.001 + 0.6 * d * d, z);
  });
  const spinePath = catmull(spinePts);
  const core = b.joint("hips", { at: spinePts[3] });
  const rootT = spinePath.closestT(core.at);
  const front = b.chain("spine", spinePath.slice(rootT, 1), { parent: core, count: 3, role: "spine" });
  const back = b.chain("tail", spinePath.slice(rootT, 0), { parent: core, count: 5, role: "tail" });
  const neckEnd = spinePath.at(1);
  const head = b.joint("head", { parent: front, at: neckEnd, dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.03, 0.085], dir: [0, 0, 1], role: "jaw" });

  // ---- Body -----------------------------------------------------------------------------------------------
  const trunk = b.sweep(spinePath, (t: number) => prof(spinePath.at(t).z), {
    bone: [back, core, front],
    color: COAT,
    sides: 10,
    caps: { start: "round", end: "round" },
  });

  // ---- Dorsal fin (membrane along the back) ---------------------------------------------------------------
  const hTop = (z: number) =>
    ramp(
      [
        [-0.23, 0.006],
        [-0.2, 0.02],
        [-0.15, 0.036],
        [-0.1, 0.04],
        [-0.05, 0.03],
        [0, 0.018],
        [0.035, 0.008],
      ],
      z,
    );
  const finStrip = (t0: number, t1: number, bone: any) => {
    const A = trunk.line(0, -0.004).slice(t0, t1);
    const pts: number[][] = [];
    for (let i = 0; i <= 16; i++) {
      const p = A.at(i / 16);
      pts.push([p.x, p.y + hTop(p.z), p.z]);
    }
    b.membrane(A, catmull(pts), { color: FIN, thickness: 0.003, bone, rows: 3 });
  };
  const tEnd = spinePath.closestT(V(0, 0.04, 0.035));
  finStrip(0, rootT, back);
  finStrip(rootT, tEnd, front);

  // ---- Head ------------------------------------------------------------------------------------------------
  const HC = V(0, 0.046, 0.113);
  const upper = b.part(new THREE.SphereGeometry(1, 16, 12), COAT, {
    bone: head,
    at: HC,
    scale: [0.088, 0.042, 0.068],
  });
  b.part(new THREE.SphereGeometry(1, 14, 10), JAW, { bone: jaw, at: [0, 0.022, 0.123], scale: [0.062, 0.021, 0.043] });
  const skin = b.surface(upper);

  // Cheek bumps for a squishy chibi face
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 10, 8), COAT, {
      bone: head,
      at: [s * 0.06, 0.03, 0.135],
      scale: [0.028, 0.024, 0.03],
    });
  }

  // Eyes: bulging bulbs with a drawn glossy eye
  for (const s of [1, -1]) {
    const hit = skin.around(HC).at(s * 34, 14)!;
    const bulb = b.part(new THREE.SphereGeometry(0.022, 12, 9), COAT, { bone: head, at: hit.at });
    const dirN = V(s * 0.28, 0.15, 1).normalize();
    b.decal(b.surface(bulb), EYE, {
      at: hit.at.clone().addScaledVector(dirN, 0.022),
      dir: dirN,
      size: [0.042, 0.042],
      mirror: s > 0,
      segments: 12,
    });
    // Little lid on top of the eye
    b.part(new THREE.SphereGeometry(1, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), "#e98aa9", {
      bone: head,
      at: hit.at.clone().add(V(0, 0.012, -0.002)),
      scale: [0.024, 0.013, 0.024],
    });
  }

  // Smile and blush
  const lip = skin.around(HC).at(0, -12)!;
  b.decal(skin, SMILE, { at: lip.at, dir: [0, 0, 1], size: [0.115, 0.034], segments: 18 });
  for (const s of [1, -1]) {
    const c = skin.around(HC).at(s * 62, -6)!;
    b.decal(skin, BLUSH, {
      at: c.at,
      dir: [s * 0.7, 0, 1],
      size: [0.034, 0.02],
      mirror: s > 0,
      roll: s * 8,
      segments: 8,
    });
    // nostril
    const nh = skin.around(HC).at(s * 11, 18)!;
    b.stick(new THREE.SphereGeometry(0.0042, 6, 4), NOSE, nh, { embed: 0.4 });
  }

  // ---- Gills: three stalks per side with frilly cards ------------------------------------------------------
  const GILLS = [
    { az: 105, el: 40, d1: [0.03, 0.035, -0.02], d2: [0.025, 0.035, -0.025] },
    { az: 108, el: 10, d1: [0.04, 0.025, -0.025], d2: [0.035, 0.03, -0.03] },
    { az: 112, el: -20, d1: [0.045, 0.005, -0.03], d2: [0.035, 0.025, -0.035] },
  ];
  const LEVELS = [
    { ts: [0.2, 0.32, 0.44], size: [0.026, 0.056], lean: 55 },
    { ts: [0.54, 0.66, 0.78], size: [0.022, 0.05], lean: 50 },
    { ts: [0.88, 0.98], size: [0.018, 0.04], lean: 38 },
  ];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    GILLS.forEach((g, k) => {
      const hit = skin.around(HC).at(s * g.az, g.el)!;
      const base = hit.at.clone();
      const mid = base.clone().add(V(s * g.d1[0], g.d1[1], g.d1[2]));
      const tip = mid.clone().add(V(s * g.d2[0], g.d2[1], g.d2[2]));
      b.stick(new THREE.SphereGeometry(0.014, 7, 5), COLLAR, hit, { embed: 0.35 });
      const gill = b.sprout(`gill${side}${k + 1}`, hit, catmull([base, mid, tip]), [0.0085, 0.0025], {
        count: 2,
        role: "fan",
        color: GILL_STALK,
        sides: 6,
      });
      for (const lv of LEVELS) {
        const frames: any[] = [];
        const flows: any[] = [];
        for (const t of lv.ts)
          for (const deg of [0, 90, 180, 270]) {
            const f: any = gill.sweep.at(t, deg);
            frames.push(f);
            flows.push(f.tangent);
          }
        b.cards(frames, [FRILL_A, FRILL_B, FRILL_A], {
          size: lv.size as [number, number],
          lean: lv.lean,
          bend: 25,
          cross: true,
          vary: 0.25,
          spin: 15,
          rng: R,
          flow: (_f: any, i: number) => flows[i],
        });
      }
    });
  }

  // ---- Limbs -----------------------------------------------------------------------------------------------
  const digits = (
    parent: any,
    baseP: THREE.Vector3,
    center: number,
    n: number,
    spread: number,
    len: number,
    prefix: string,
  ) => {
    for (let k = 0; k < n; k++) {
      const a = ((center + (k - (n - 1) / 2) * (spread / (n - 1))) * Math.PI) / 180;
      const d = V(Math.sin(a), 0, Math.cos(a));
      const p0 = baseP.clone();
      const p1 = baseP.clone().addScaledVector(d, len * 0.5);
      p1.y = 0.009;
      const p2 = baseP.clone().addScaledVector(d, len);
      p2.y = 0.0046;
      const nm = `${prefix}${k + 1}`;
      const ch = b.chain(nm, catmull([p0, p1, p2]), {
        parent,
        role: "digit",
        names: [`${nm}a`, `${nm}b`],
      });
      b.sweep(ch, [0.0066, 0.0042], { color: (t: number) => (t > 0.8 ? SKIN_TIP : SKIN), sides: 6 });
    }
  };

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // Front leg
    const shoulder = V(s * 0.034, 0.038, 0.03);
    const handT = V(s * 0.095, 0.012, 0.07);
    const fpts = limb(shoulder, handT, [0.042, 0.042], [[s * 0.4, 0.3, -0.9]]);
    const fleg = b.chain(`legF${side}`, fpts, {
      parent: front.nearestJoint(shoulder),
      names: [`shoulder${side}`, `elbow${side}`, `hand${side}`],
      role: "leg",
      contact: [handT.x, 0, handT.z],
    });
    b.sweep(fleg, [0.017, 0.0135, 0.0115], { color: COAT, sides: 8 });
    b.part(new THREE.SphereGeometry(1, 9, 7), COAT, {
      bone: front.nearestJoint(shoulder),
      at: shoulder.clone().add(V(s * 0.006, 0, 0)),
      scale: [0.02, 0.02, 0.022],
    });
    const handJ = fleg.tip ?? fleg.joints[fleg.joints.length - 1];
    b.part(new THREE.SphereGeometry(1, 9, 7), COAT, {
      bone: handJ,
      at: fpts[2],
      scale: [0.017, 0.0105, 0.019],
    });
    digits(handJ, fpts[2].clone(), s * 25, 4, 70, 0.027, `finger${side}`);

    // Hind leg
    const hip = V(s * 0.022, 0.035, -0.06);
    const footT = V(s * 0.085, 0.012, -0.09);
    const hpts = limb(hip, footT, [0.045, 0.045], [[s * 0.6, 0.3, 0.7]]);
    const hleg = b.chain(`legH${side}`, hpts, {
      parent: core,
      names: [`hip${side}`, `knee${side}`, `foot${side}`],
      role: "leg",
      contact: [footT.x, 0, footT.z],
    });
    b.sweep(hleg, [0.019, 0.0145, 0.012], { color: COAT, sides: 8 });
    b.part(new THREE.SphereGeometry(1, 9, 7), COAT, {
      bone: core,
      at: hip.clone().add(V(s * 0.008, 0, 0)),
      scale: [0.022, 0.022, 0.025],
    });
    const footJ = hleg.tip ?? hleg.joints[hleg.joints.length - 1];
    b.part(new THREE.SphereGeometry(1, 9, 7), COAT, {
      bone: footJ,
      at: hpts[2],
      scale: [0.018, 0.0105, 0.02],
    });
    digits(footJ, hpts[2].clone(), s * 110, 5, 90, 0.029, `toe${side}`);
  }

  return b.root;
}
