import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  catmull,
  paint,
  mix,
  noise,
  smoothstep,
  scales,
  mottle,
  spots,
  countershade,
  svg,
  DEG,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Cottage Snail",
  description:
    "A storybook snail whose shell is a thatched, half-timbered cottage with a spiral roof, balcony, glowing windows, flower boxes, chimney and mushrooms.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette
const CREAM = "#f6e7c6";
const TEAL = "#4f9d9a";
const TEAL_D = "#2f6f6c";
const WOOD = "#a8703f";
const WOOD_D = "#6b4a32";
const BRASS = "#d9a441";
const LEAF = "#5e9c4a";
const LEAF_D = "#3f7a38";
const LIP = "#f0a08c";
const MOSS = "#7da24b";
const RED = "#d9503f";
const FLOWERS = ["#ef6f8f", "#ffd24a", "#ffffff", "#ff9a4a", "#b48ae0"];

const h2 = (a: number, c: number) => {
  let h = Math.imul(a | 0, 374761393) ^ Math.imul(c | 0, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

// ---------------------------------------------------------------------------------------------------------------
// Paints
const SKIN = countershade(
  spots(mottle("#dfa779", "#ecbc8e", { size: 0.12, seed: 3 }), "#c98a60", { size: 0.055, amount: 0.3, seed: 8 }),
  "#f6e0bd",
  { level: -0.25, soft: 0.3 },
);
const STALK = mottle("#d99d70", "#e5b284", { size: 0.06, seed: 5 });

const STONE = scales(["#a29585", "#8f8374", "#b2a592"], "#4d443b", { size: 0.045, width: 0.2, seed: 2 });
const PLASTER = mottle(CREAM, "#ecd3a4", { size: 0.09, seed: 11 });
const WALLP = paint((p, n, s) => {
  const h = s[0];
  if (h < 0.068) return STONE;
  if (h < 0.082 || h > 0.255) return WOOD_D;
  const m = (((s[1] - 15) % 30) + 30) % 30;
  if (Math.min(m, 30 - m) < 2.2) return h2(Math.floor(h * 40), 1) > 0.5 ? WOOD_D : "#5a3a26";
  const base = mix(PLASTER.at(p, n), "#b9a7c9", 0.22 * smoothstep(0.2, -0.6, n.y));
  return mix(base, MOSS, 0.5 * smoothstep(0.09, 0.07, h) * smoothstep(0.4, 0.7, noise(p, 0.05, 6)));
});

const STRAW = ["#e0aa45", "#d09a38", "#e8bb55", "#c98f33"];
const THATCH = paint((p, n, s) => {
  const c = s[0] / 0.055;
  const row = Math.floor(c);
  const f = c - row;
  const bundle = Math.floor((s[1] + row * 7) / 18);
  const col = STRAW[Math.floor(h2(bundle, row) * 4)];
  let out = mix(col, "#8a5a24", 0.45 * (1 - smoothstep(0, 0.55, f)));
  out = mix(out, "#f3d37a", 0.2 * smoothstep(0.4, 1, n.y) * f);
  const m = smoothstep(0.58, 0.72, noise(p, 0.07, 4)) * smoothstep(0.3, 0.8, n.y);
  return mix(out, MOSS, m * 0.85);
});

const DOORP = paint((_p, _n, s) => {
  const x = (s[0] + 0.05) / 0.018;
  const plank = Math.floor(x);
  const fx = x - plank;
  if (fx < 0.08) return "#7d2f22";
  if (Math.abs(s[1] - 0.03) < 0.007 || Math.abs(s[1] - 0.085) < 0.007) return "#2d2a2a";
  return h2(plank, 3) > 0.5 ? "#c85a40" : "#bd4f38";
});
const BRICK = scales(["#b5654a", "#a2563f", "#c4755a"], "#6a3a2c", { size: 0.032, width: 0.16, seed: 4 });
const SCARF = paint((p, n) => {
  const a = Math.atan2(p.x, p.z - 0.34) / (Math.PI * 2) + 0.5;
  return (a * 14) % 1 < 0.5 ? mix(RED, RED, 0) : mix(CREAM, CREAM, n.y * 0);
});

// ---------------------------------------------------------------------------------------------------------------
// Textures
const EYE = svg(
  `<svg viewBox="0 0 100 100">
  <defs><radialGradient id="i" cx="0.5" cy="0.6" r="0.6"><stop offset="0" stop-color="#e8964a"/><stop offset="1" stop-color="#b45a22"/></radialGradient></defs>
  <circle cx="50" cy="52" r="35" fill="#3b2314"/>
  <circle cx="50" cy="52" r="31" fill="url(#i)"/>
  <circle cx="50" cy="52" r="16" fill="#1b1210"/>
  <circle cx="39" cy="40" r="9" fill="#ffffff"/>
  <circle cx="61" cy="64" r="4.5" fill="#ffffff"/>
  <path d="M12 38 Q50 4 88 38" stroke="#3b2314" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M84 36 L94 28 M80 30 L88 19" stroke="#3b2314" stroke-width="4" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);
const CHEEK = svg(
  `<svg viewBox="0 0 100 60"><ellipse cx="50" cy="30" rx="46" ry="26" fill="#f08a8a"/>
  <path d="M26 20 l8 14 M46 16 l8 16 M66 20 l8 14" stroke="#d9606a" stroke-width="4" stroke-linecap="round"/></svg>`,
  { size: 128 },
);
const SMILE = svg(
  `<svg viewBox="0 0 100 40"><path d="M10 8 Q50 40 90 8" stroke="#5a2a2a" stroke-width="7" fill="none" stroke-linecap="round"/>
  <path d="M6 4 L12 12 M94 4 L88 12" stroke="#5a2a2a" stroke-width="5" stroke-linecap="round"/></svg>`,
  { size: 128 },
);
const WINDOW = svg(
  `<svg viewBox="0 0 100 100">
  <defs><radialGradient id="w" cx="0.5" cy="0.55" r="0.65"><stop offset="0" stop-color="#fff4b8"/><stop offset="1" stop-color="#ffb04a"/></radialGradient></defs>
  <circle cx="50" cy="50" r="49" fill="url(#w)"/>
  <path d="M0 0 Q30 10 28 55 Q16 40 0 44Z" fill="#d9654a" opacity="1"/>
  <path d="M100 0 Q70 10 72 55 Q84 40 100 44Z" fill="#d9654a"/>
  <path d="M50 2 L50 98 M2 50 L98 50" stroke="#7a5236" stroke-width="6"/>
  <circle cx="50" cy="50" r="48" fill="none" stroke="#7a5236" stroke-width="4"/>
  </svg>`,
  { size: 192 },
);
const SHUTTER = svg(
  `<svg viewBox="0 0 40 100"><rect width="40" height="100" fill="#4f9d9a"/>
  ${[30, 42, 54, 66, 78, 90].map((y) => `<path d="M2 ${y} L38 ${y}" stroke="#2f6f6c" stroke-width="3"/>`).join("")}
  <path d="M20 22 C6 10 10 4 20 12 C30 4 34 10 20 22Z" fill="#273b3a"/>
  <rect x="1" y="1" width="38" height="98" fill="none" stroke="#2f6f6c" stroke-width="3"/></svg>`,
  { size: 128 },
);
const SIGN = svg(
  `<svg viewBox="0 0 120 80"><rect x="3" y="3" width="114" height="74" rx="8" fill="#b9814a" stroke="#4a2e1a" stroke-width="5"/>
  <text x="60" y="36" text-anchor="middle" font-family="serif" font-weight="bold" font-size="25" fill="#2f1b0e">Slow</text>
  <text x="60" y="64" text-anchor="middle" font-family="serif" font-weight="bold" font-size="25" fill="#2f1b0e">Lane</text></svg>`,
  { size: 192 },
);
let spiralPath = "M50 50";
for (let i = 1; i <= 70; i++) {
  const a = i * 0.3;
  const r = 1 + i * 0.58;
  spiralPath += ` L${(50 + Math.cos(a) * r).toFixed(1)} ${(50 + Math.sin(a) * r).toFixed(1)}`;
}
const SPIRAL = svg(
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#fff4d8" stroke="#4f9d9a" stroke-width="4"/>
  <path d="${spiralPath}" stroke="#4f9d9a" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="50" cy="50" r="4" fill="#d9503f"/></svg>`,
  { size: 192 },
);
const LEAFT = svg(
  `<svg viewBox="0 0 40 64"><path d="M20 62 C2 44 4 18 20 2 C36 18 38 44 20 62Z" fill="#5e9c4a" stroke="#2e5a2a" stroke-width="2.5"/>
  <path d="M20 2 C36 18 38 44 20 62Z" fill="#79b85a"/><path d="M20 60 L20 8" stroke="#2e5a2a" stroke-width="2.5"/></svg>`,
  { size: 96 },
);
const STRAWT = svg(
  `<svg viewBox="0 0 40 64">
  <path d="M4 64 L9 8 L14 64Z" fill="#d09a38"/><path d="M12 64 L18 2 L24 64Z" fill="#e8bb55"/>
  <path d="M22 64 L28 6 L33 64Z" fill="#c98f33"/><path d="M30 64 L36 14 L39 64Z" fill="#e0aa45"/>
  <path d="M0 64 L5 16 L10 64Z" fill="#e0aa45"/></svg>`,
  { size: 96 },
);
const MUSH = svg(
  `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#d94a3b"/>
  <circle cx="8" cy="14" r="4" fill="#fff4e0"/><circle cx="24" cy="8" r="4.5" fill="#fff4e0"/><circle cx="40" cy="16" r="4" fill="#fff4e0"/>
  <circle cx="56" cy="9" r="4.5" fill="#fff4e0"/><circle cx="16" cy="24" r="3" fill="#fff4e0"/><circle cx="48" cy="26" r="3" fill="#fff4e0"/></svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------------------------------------------------------
interface Placed {
  at: THREE.Vector3;
  n: THREE.Vector3;
  t: THREE.Vector3;
}
const UP = new THREE.Vector3(0, 1, 0);

export default function build() {
  const b = createBuilder({ name: "cottage_snail" });

  // ================================================================ Skeleton and body
  const bodyPath = catmull([
    [0, 0.012, -0.6],
    [0, 0.045, -0.4],
    [0, 0.07, -0.15],
    [0, 0.075, 0.1],
    [0, 0.09, 0.26],
    [0, 0.17, 0.36],
    [0, 0.25, 0.4],
  ]);
  const hips = b.joint("hips", { at: [0, 0.07, -0.15], dir: [0, 0, 1], role: "spine" });
  const rootT = bodyPath.closestT(hips.at);
  const front = b.chain("spine", bodyPath.slice(rootT, 1), {
    parent: hips,
    count: 5,
    names: ["spine1", "spine2", "spine3", "neck1", "neck2"],
    role: "spine",
  });
  const back = b.chain("tail", bodyPath.slice(rootT, 0), {
    parent: hips,
    count: 4,
    names: ["tail1", "tail2", "tail3", "tail4"],
    role: "tail",
  });
  const KEYS = [
    [0, 0.008, 0.008],
    [0.18, 0.05, 0.04],
    [0.41, 0.11, 0.07],
    [0.64, 0.115, 0.072],
    [0.79, 0.09, 0.07],
    [0.91, 0.066, 0.064],
    [1, 0.06, 0.058],
  ];
  const bodyR = (t: number): [number, number] => {
    for (let i = 1; i < KEYS.length; i++) {
      if (t <= KEYS[i][0]) {
        const a = KEYS[i - 1];
        const c = KEYS[i];
        const f = (t - a[0]) / (c[0] - a[0]);
        return [a[1] + (c[1] - a[1]) * f, a[2] + (c[2] - a[2]) * f];
      }
    }
    return [KEYS[6][1], KEYS[6][2]];
  };
  const bodyTube = b.sweep(bodyPath, bodyR, { bone: [back, hips, front], color: SKIN, sides: 12 });

  // ================================================================ Head
  const head = b.joint("head", {
    parent: front.joints[front.joints.length - 1],
    at: bodyPath.at(1),
    dir: [0, 0.2, 1],
    role: "head",
  });
  b.part(new THREE.SphereGeometry(1, 12, 8), SKIN, {
    bone: head,
    at: head.local({ forward: 0.04, up: 0 }),
    scale: [0.08, 0.072, 0.092],
  });
  const lip = b.part(new THREE.SphereGeometry(1, 10, 6), LIP, {
    bone: head,
    at: head.local({ forward: 0.108, down: 0.012 }),
    scale: [0.055, 0.026, 0.04],
  });
  b.part(new THREE.SphereGeometry(1, 8, 5), "#6b2230", {
    bone: head,
    at: head.local({ forward: 0.1, down: 0.034 }),
    scale: [0.04, 0.01, 0.028],
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.07, down: 0.04 }),
    aim: head.local({ forward: 0.15, down: 0.05 }),
    role: "jaw",
  });
  b.part(new THREE.SphereGeometry(1, 10, 6), LIP, {
    bone: jaw,
    at: jaw.local({ forward: 0.04, down: 0.012 }),
    scale: [0.05, 0.018, 0.04],
  });
  b.decal(lip, SMILE, {
    at: head.local({ forward: 0.15, down: 0.018 }),
    dir: [0, -0.05, 1],
    size: [0.062, 0.025],
  });

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // Cheeks
    b.decal(b.surface(b.root), CHEEK, {
      at: head.local({ forward: 0.07, left: s * 0.072, down: 0.015 }),
      dir: [s * 0.8, 0, 0.6],
      size: [0.05, 0.03],
      mirror: s > 0,
    });
    // Eyestalks
    const pts = [
      head.local({ up: 0.05, left: s * 0.035, forward: 0 }),
      head.local({ up: 0.11, left: s * 0.05, forward: 0 }),
      head.local({ up: 0.18, left: s * 0.065, forward: 0.02 }),
      head.local({ up: 0.23, left: s * 0.075, forward: 0.05 }),
    ];
    const stalk = b.chain(`eyestalk${side}`, catmull(pts), {
      parent: head,
      names: [`eyestalk${side}1`, `eyestalk${side}2`, `eyestalk${side}3`, `eye${side}`],
      role: "tentacle",
    });
    b.sweep(stalk, [0.021, 0.014], { color: STALK, sides: 8 });
    const c = head.local({ up: 0.245, left: s * 0.077, forward: 0.06 });
    const bulb = b.part(new THREE.SphereGeometry(0.034, 12, 8), "#fffaf0", { bone: stalk.tip!, at: c });
    b.part(new THREE.SphereGeometry(0.0365, 10, 5, 0, Math.PI * 2, 0, 0.75), "#d99d70", {
      bone: stalk.tip!,
      at: c,
    });
    const d = new THREE.Vector3(s * 0.2, 0.1, 1).normalize();
    b.decal(bulb, EYE, { at: c.clone().addScaledVector(d, 0.034), dir: d, size: [0.052, 0.052] });

    // Lower feelers
    const fp = [
      head.local({ forward: 0.09, left: s * 0.06, down: 0 }),
      head.local({ forward: 0.15, left: s * 0.085, down: 0.02 }),
      head.local({ forward: 0.2, left: s * 0.095, down: 0.012 }),
    ];
    const feeler = b.chain(`feeler${side}`, catmull(fp), {
      parent: head,
      names: [`feeler${side}1`, `feeler${side}2`, `feelerTip${side}`],
      role: "tentacle",
    });
    b.sweep(feeler, [0.014, 0.009], { color: STALK, sides: 6 });
    b.part(new THREE.SphereGeometry(0.014, 8, 6), "#e8a27c", { bone: feeler.tip!, at: fp[2] });
  }

  // Scarf round the neck
  const loop = b.surface(bodyTube).loop(front.joints[4], { lift: 0.012 });
  b.sweep(loop, 0.017, { color: SCARF, sides: 8 });

  // ================================================================ Cottage shell
  const CZ = -0.15;
  const BASE = 0.09;
  const AX: [number, number, number] = [0, BASE, CZ];
  const shell = b.joint("shell", { parent: hips, at: AX, dir: [0, 1, 0] });

  const wallProfile: [number, number][] = [
    [0, 0],
    [0.11, 0],
    [0.17, 0.03],
    [0.2, 0.07],
    [0.215, 0.14],
    [0.21, 0.22],
    [0.2, 0.27],
    [0, 0.27],
  ];
  const wall = b.lathe(wallProfile, { at: AX, bone: shell, segments: 12, color: WALLP });
  const wallS = b.surface(wall);

  // Roof
  const RH = 0.3;
  const Y0 = 0.26;
  const roofR = (h: number) => 0.3 * Math.pow(Math.max(1 - h / RH, 0), 1.3);
  const roofTop = [0, 0.08, 0.2, 0.34, 0.5, 0.66, 0.82, 0.94].map((u): [number, number] => [roofR(u * RH), Y0 + u * RH]);
  const roofProfile: [number, number][] = [
    [0, Y0 - 0.035],
    [0.28, Y0 - 0.035],
    [0.3, Y0 - 0.012],
    ...roofTop,
    [0, Y0 + RH],
  ];
  const roof = b.lathe(roofProfile, { at: AX, bone: shell, segments: 14, color: THATCH });
  const roofS = b.surface(roof);

  // Spiral ridges on the roof: the snail shell hiding in the thatch
  for (const k of [0, 1]) {
    const pts: THREE.Vector3[] = [];
    const N = 44;
    for (let i = 0; i <= N; i++) {
      const u = 0.02 + (0.9 * i) / N;
      const h = u * RH;
      const ang = k * Math.PI + (i / N) * Math.PI * 2 * 2.4;
      const r = roofR(h) + 0.011;
      pts.push(new THREE.Vector3(Math.sin(ang) * r, BASE + Y0 + h, CZ + Math.cos(ang) * r));
    }
    b.sweep(catmull(pts), (t: number) => 0.017 * (1 - t) + 0.007, { color: "#a8672a", bone: shell, sides: 6 });
  }

  // Beam ends under the eaves
  b.ring(frame([0, BASE + 0.212, CZ], [0, 1, 0]), { count: 12, radius: 0.2, fromDeg: 15, toDeg: 345 }, (it) =>
    b.part(new THREE.CylinderGeometry(0.009, 0.011, 0.07, 5), WOOD_D, { frame: it, bone: shell }),
  );
  // Straw fringe
  for (const [cnt, rad, yy] of [
    [30, 0.297, 0.015],
    [24, 0.285, 0.005],
  ] as [number, number, number][]) {
    const ringItems = b.ring(frame([0, BASE + Y0 + 0.005 - yy * 0, CZ], [0, 1, 0]), { count: cnt, radius: rad }).items;
    b.cards(ringItems, STRAWT, {
      size: [0.05, 0.075],
      lean: 55,
      flow: [0, -1, 0],
      vary: 0.25,
      spin: 8,
      rng: rng(5 + cnt),
      bone: shell,
      sink: 0.05,
    });
  }

  // Finial and pennant
  const apex = new THREE.Vector3(0, BASE + Y0 + RH, CZ);
  b.spike(apex, [0, 1, 0], 0.08, 0.013, { color: BRASS, bone: shell });
  b.part(new THREE.SphereGeometry(0.016, 8, 6), BRASS, { bone: shell, at: [0, apex.y + 0.085, CZ], flat: true });
  b.extrude(
    [
      [0, 0],
      [0.07, -0.012],
      [0.05, -0.02],
      [0.075, -0.036],
      [0, -0.032],
    ],
    {
      at: [0, apex.y + 0.07, CZ],
      x: [0, 0, -1],
      thickness: 0.004,
      color: RED,
      bone: shell,
    },
  );

  // Wall helpers
  const onWall = (a: number, h: number): Placed => {
    const hit = wallS.around([0, BASE + h, CZ]).at(a, 0)!;
    const n = hit.n.clone().setY(0).normalize();
    const t = UP.clone().cross(n).normalize();
    return { at: hit.at.clone(), n, t };
  };
  const wp = (w: Placed, u: number, v: number, lift = 0) =>
    w.at.clone().addScaledVector(w.t, u).addScaledVector(UP, v).addScaledVector(w.n, lift);

  const flowerBox = (w: Placed, u: number, v: number, lift: number, width: number) => {
    b.part(new THREE.BoxGeometry(width, 0.03, 0.045), TEAL_D, {
      bone: shell,
      at: wp(w, u, v, lift),
      dir: w.n,
      axis: "z",
    });
    const n = Math.max(3, Math.round(width / 0.017));
    for (let i = 0; i < n; i++) {
      const uu = u - width / 2 + ((i + 0.5) * width) / n;
      b.part(new THREE.SphereGeometry(0.014, 6, 4), i % 2 ? LEAF : LEAF_D, {
        bone: shell,
        at: wp(w, uu, v + 0.02, lift + (i % 2 ? 0.006 : -0.006)),
        flat: true,
      });
      b.part(new THREE.SphereGeometry(0.01, 6, 4), FLOWERS[(i + Math.round(width * 100)) % FLOWERS.length], {
        bone: shell,
        at: wp(w, uu, v + 0.033, lift + 0.002),
        flat: true,
      });
    }
  };

  const windowAt = (a: number, h: number, r: number, box: boolean) => {
    const w = onWall(a, h);
    glow(
      b.part(new THREE.CircleGeometry(r, 14), "#ffffff", {
        bone: shell,
        at: wp(w, 0, 0, 0.006),
        dir: w.n,
        axis: "z",
        texture: WINDOW,
      }),
      0.9,
    );
    b.part(new THREE.TorusGeometry(r + 0.003, 0.009, 5, 14), CREAM, {
      bone: shell,
      at: wp(w, 0, 0, 0.004),
      dir: w.n,
      axis: "z",
    });
    for (const sd of [1, -1])
      b.part(new THREE.BoxGeometry(0.03, 0.088, 0.01), "#ffffff", {
        bone: shell,
        at: wp(w, sd * (r + 0.028), 0, 0.008),
        dir: w.n,
        axis: "z",
        texture: SHUTTER,
      });
    if (box) flowerBox(w, 0, -(r + 0.03), 0.026, 0.1);
  };
  windowAt(30, 0.155, 0.036, true);
  windowAt(-30, 0.155, 0.036, true);
  windowAt(150, 0.155, 0.034, false);
  windowAt(-150, 0.155, 0.034, true);
  windowAt(-90, 0.15, 0.048, true);

  // Door, balcony, ladder, lantern, sign (left side)
  const d = onWall(90, 0.1);
  const doorJ = b.joint("doorL", { parent: shell, at: wp(d, -0.045, -0.015, 0.004), dir: [0, 1, 0], role: "hinge" });
  b.extrude(
    [
      [-0.045, 0, "sharp"],
      [0.045, 0, "sharp"],
      [0.045, 0.085],
      [0.038, 0.105],
      [0.022, 0.122],
      [0, 0.13],
      [-0.022, 0.122],
      [-0.038, 0.105],
      [-0.045, 0.085],
    ],
    { at: wp(d, 0, -0.015, 0.004), x: d.t, thickness: 0.024, bevel: 0.002, color: DOORP, bone: doorJ },
  );
  const framePts = (
    [
      [-0.053, 0],
      [-0.053, 0.085],
      [-0.046, 0.108],
      [-0.03, 0.127],
      [0, 0.138],
      [0.03, 0.127],
      [0.046, 0.108],
      [0.053, 0.085],
      [0.053, 0],
    ] as [number, number][]
  ).map(([u, y]) => wp(d, u, y - 0.015, 0.012));
  b.sweep(catmull(framePts), 0.007, { color: CREAM, bone: shell, sides: 6 });
  b.part(new THREE.SphereGeometry(0.008, 6, 5), BRASS, { bone: shell, at: wp(d, 0.03, 0.045, 0.02), flat: true });

  b.part(new THREE.BoxGeometry(0.17, 0.012, 0.11), WOOD, {
    bone: shell,
    at: wp(d, 0, -0.021, 0.055),
    dir: d.n,
    axis: "z",
  });
  for (const sd of [1, -1]) {
    b.rod(wp(d, sd * 0.07, -0.027, 0.1), wp(d, sd * 0.03, -0.07, -0.04), 0.005, WOOD_D, { bone: shell });
    // railing
    b.rod(wp(d, sd * 0.08, -0.015, 0.105), wp(d, sd * 0.08, 0.03, 0.105), 0.004, WOOD_D, { bone: shell });
    b.rod(wp(d, sd * 0.08, 0.03, 0.0), wp(d, sd * 0.08, 0.03, 0.105), 0.0045, WOOD, { bone: shell });
    b.rod(wp(d, sd * 0.08, 0.03, 0.105), wp(d, sd * 0.03, 0.03, 0.105), 0.0045, WOOD, { bone: shell });
    b.rod(wp(d, sd * 0.055, -0.015, 0.105), wp(d, sd * 0.055, 0.03, 0.105), 0.003, WOOD_D, { bone: shell });
  }
  // ladder
  const tops = [1, -1].map((sd) => wp(d, sd * 0.025, -0.02, 0.108));
  const bots = tops.map((t) => {
    const p = t.clone().addScaledVector(d.n, 0.12);
    p.y = 0;
    return p;
  });
  tops.forEach((t, i) => b.rod(t, bots[i], 0.005, WOOD, { bone: shell }));
  for (let i = 1; i <= 4; i++) {
    const f = i / 5;
    b.rod(tops[0].clone().lerp(bots[0], f), tops[1].clone().lerp(bots[1], f), 0.003, WOOD_D, { bone: shell });
  }
  // lantern
  const lb = wp(d, 0.07, 0.1, 0);
  const lt = wp(d, 0.07, 0.1, 0.06);
  b.rod(lb, lt, 0.003, "#2d2a2a", { bone: shell });
  b.rod(lt, wp(d, 0.07, 0.07, 0.06), 0.0015, "#2d2a2a", { bone: shell });
  glow(
    b.part(new THREE.BoxGeometry(0.022, 0.03, 0.022), "#ffd36a", { bone: shell, at: wp(d, 0.07, 0.052, 0.06) }),
    1.5,
  );
  b.part(new THREE.ConeGeometry(0.02, 0.014, 4), BRASS, { bone: shell, at: wp(d, 0.07, 0.074, 0.06) });
  // hanging sign
  const sa = wp(d, -0.105, 0.1, 0);
  const sb = wp(d, -0.105, 0.1, 0.065);
  b.rod(sa, sb, 0.003, "#2d2a2a", { bone: shell });
  const sc = wp(d, -0.105, 0.052, 0.065);
  for (const sd of [1, -1]) b.rod(wp(d, -0.105 + sd * 0.026, 0.1, 0.065), wp(d, -0.105 + sd * 0.026, 0.072, 0.065), 0.0015, "#2d2a2a", { bone: shell });
  b.part(new THREE.BoxGeometry(0.068, 0.046, 0.008), "#ffffff", {
    bone: shell,
    at: sc,
    dir: d.n,
    axis: "z",
    texture: SIGN,
  });
  // planter on the balcony
  flowerBox(d, -0.05, 0.0, 0.1, 0.07);

  // Spiral mural on the back
  const bw = onWall(180, 0.16);
  b.decal(wall, SPIRAL, { at: bw.at, dir: bw.n, size: [0.1, 0.1] });

  // Vines and leaves
  for (const a of [59, -120]) {
    const rough: THREE.Vector3[] = [];
    for (let i = 0; i <= 5; i++)
      rough.push(new THREE.Vector3(Math.sin(a * DEG) * 0.25, BASE + 0.01 + i * 0.05, CZ + Math.cos(a * DEG) * 0.25));
    b.sweep(wallS.drape(catmull(rough), { lift: 0.004 }), 0.005, { color: LEAF_D, bone: shell, sides: 5 });
  }
  const azOf = (p: THREE.Vector3) => Math.atan2(p.x, p.z - CZ) / DEG;
  const leafHits = wallS.scatter(40, {
    rng: rng(31),
    minDist: 0.035,
    filter: (h) => {
      const az = azOf(h.at);
      return h.at.y > BASE + 0.03 && ((az > 52 && az < 66) || (az > -128 && az < -112));
    },
  });
  b.cards(leafHits, LEAFT, { size: [0.03, 0.045], lean: 80, flow: [0, -1, 0], vary: 0.3, spin: 40, rng: rng(32), bone: shell });

  // Chimney
  const chA = -155;
  const chPos = new THREE.Vector3(Math.sin(chA * DEG) * 0.17, BASE + 0.435, CZ + Math.cos(chA * DEG) * 0.17);
  b.part(new THREE.BoxGeometry(0.075, 0.26, 0.075), BRICK, { bone: shell, at: chPos, rotation: [0, 20, 5] });
  const chTop = chPos.clone().add(new THREE.Vector3(0.011, 0.13, 0));
  b.part(new THREE.BoxGeometry(0.098, 0.02, 0.098), "#6e625a", { bone: shell, at: chTop, rotation: [0, 20, 5] });
  b.part(new THREE.BoxGeometry(0.056, 0.006, 0.056), "#1c1614", { bone: shell, at: chTop.clone().add(new THREE.Vector3(0, 0.011, 0)), rotation: [0, 20, 5] });
  [
    [0.0, 0.05, 0.024, "#f6f2ea"],
    [0.02, 0.1, 0.032, "#efebe4"],
    [0.0, 0.16, 0.04, "#f6f2ea"],
    [-0.03, 0.23, 0.047, "#e8e4de"],
  ].forEach(([ox, oy, r, col]) =>
    b.part(new THREE.IcosahedronGeometry(r as number, 1), col as string, {
      bone: shell,
      at: chTop.clone().add(new THREE.Vector3(ox as number, oy as number, 0)),
      flat: true,
    }),
  );

  // Attic window facing forward
  const attic = roofS.around([0, BASE + Y0 + 0.1, CZ]).at(0, 12);
  if (attic) {
    const n = attic.n.clone();
    glow(
      b.part(new THREE.CircleGeometry(0.034, 12), "#ffffff", {
        bone: shell,
        at: attic.at.clone().addScaledVector(n, 0.012),
        dir: n,
        axis: "z",
        texture: WINDOW,
      }),
      0.9,
    );
    b.part(new THREE.TorusGeometry(0.037, 0.009, 5, 12), CREAM, {
      bone: shell,
      at: attic.at.clone().addScaledVector(n, 0.011),
      dir: n,
      axis: "z",
    });
  }

  // Mushrooms on the roof moss
  const mush = roofS.scatter(5, {
    rng: rng(77),
    minDist: 0.09,
    filter: (h) =>
      h.n.y > 0.45 &&
      h.at.y > BASE + 0.3 &&
      h.at.y < BASE + 0.46 &&
      h.at.distanceTo(chPos) > 0.14 &&
      Math.abs(azOf(h.at)) > 25,
  });
  mush.forEach((hit, i) => {
    const sc = 0.8 + 0.5 * h2(i, 9);
    b.stick(new THREE.CylinderGeometry(0.007 * sc, 0.01 * sc, 0.045 * sc, 6), "#f3e6cf", hit, { bone: shell });
    b.stick(new THREE.SphereGeometry(0.03 * sc, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), "#ffffff", hit.moved([0, 0.04 * sc, 0]), {
      bone: shell,
      texture: MUSH,
      embed: 0.1,
    });
  });

  return b.root;
}
