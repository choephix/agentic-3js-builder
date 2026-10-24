```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  polyline,
  limb,
  offset,
  frame,
  rng,
  paint,
  mix,
  noise,
  smoothstep,
  svg,
  DEG,
} from "agentic-3js-builder";
import { metal } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Gilded Sphinx",
  description:
    "A recumbent painted-sandstone sphinx in ancient Egyptian style: gold human face with kohl-lined eyes, lapis-and-gold striped nemes headdress with lappets, uraeus cobra, braided false beard, broad usekh collar with glowing carnelian beads, winged-scarab pectoral, hieroglyph cartouches and a tufted tail.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette
const LAPIS = "#1f4fa8";
const TURQ = "#2fb5aa";
const GOLD = "#e8b53a";
const CARN = "#c4452c";
const KOHL = "#14100e";
const LIP = "#a83c2a";
const CLAW = "#efe2c0";
const DARK = "#0b1233";

type RGB = readonly [number, number, number];
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

/** Piecewise smooth interpolation through [t, value] keys. */
function keys(k: number[][], t: number): number {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) {
    if (t <= k[i][0]) {
      const [t0, v0] = k[i - 1];
      const [t1, v1] = k[i];
      const u = (t - t0) / (t1 - t0);
      const e = u * u * (3 - 2 * u);
      return v0 + (v1 - v0) * e;
    }
  }
  return k[k.length - 1][1];
}

/** Warm light from above, cool shade underneath. */
const lit = (c: string, n: THREE.Vector3): RGB =>
  mix(mix(c, "#0a1030", 0.28 * smoothstep(0.1, -0.9, n.y)), "#fff6d0", 0.16 * smoothstep(0.3, 1, n.y));

/** Alternating painted bands with a thin dark line between them. */
function bands(
  cols: string[],
  period: number,
  coord: (p: THREE.Vector3, s: readonly [number, number]) => number,
  edge = DARK,
) {
  return paint((p, n, s) => {
    const u = coord(p, s) / period;
    const i = Math.floor(u);
    const f = u - i;
    const base = f < 0.07 ? edge : cols[((i % cols.length) + cols.length) % cols.length];
    return lit(base, n);
  });
}

const ellGeo = (rx: number, ry: number, rz: number, w = 8, h = 6) =>
  new THREE.SphereGeometry(1, w, h).scale(rx, ry, rz);

// Painted sandstone: ochre drift, strata, dust at the feet, warm top and cool underside.
const SAND = paint((p, n) => {
  const big = noise(p, 0.5, 11);
  const fine = noise(p, 0.05, 12);
  let c = mix(mix("#c99a55", "#e3be7e", big), "#b8884a", 0.35 * smoothstep(0.55, 0.8, fine));
  const strat = Math.sin(p.y * 70 + noise(p, 0.3, 5) * 6);
  c = mix(c, "#9c6f38", 0.16 * smoothstep(0.7, 1, strat));
  c = mix(c, "#fff0c0", 0.18 * smoothstep(0.3, 1, n.y));
  c = mix(c, "#5a4a62", 0.3 * smoothstep(0.1, -0.9, n.y));
  c = mix(c, "#e8d9b0", 0.5 * smoothstep(0.14, 0.0, p.y));
  return c;
});
const GILT = metal("gilt", { polish: 0.5, tarnish: 0.06 });

// ---------------------------------------------------------------------------------------------------------------
// Drawings
const EYE = svg(
  `<svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
  <path d="M4 17 Q30 3 62 6 Q82 8 96 15 L94 21 Q78 14 62 13 Q32 11 8 24 Z" fill="${LAPIS}" stroke="#0b0b14" stroke-width="1.6"/>
  <path d="M10 34 Q35 17 60 24 Q80 28 90 33 Q70 44 48 42 Q24 42 10 34Z" fill="${KOHL}"/>
  <path d="M12 35 L0 40 L2 45 L24 40Z" fill="${KOHL}"/>
  <path d="M24 34 Q40 24 58 29 Q72 32 80 34 Q64 40 46 39 Q32 39 24 34Z" fill="#f4ecd6"/>
  <circle cx="52" cy="33.5" r="6.5" fill="#4a2a14"/>
  <circle cx="52" cy="33.5" r="3" fill="#000"/>
  <circle cx="50" cy="31.5" r="1.4" fill="#fff"/>
  <circle cx="82" cy="34" r="2.2" fill="#b3261e"/>
</svg>`,
  { size: 256 },
);

const GLYPHS = svg(
  `<svg viewBox="0 0 60 120" xmlns="http://www.w3.org/2000/svg">
  <rect x="5" y="4" width="50" height="112" rx="25" fill="#f0dcaa" fill-opacity="0.9" stroke="#7a2a1c" stroke-width="3"/>
  <circle cx="30" cy="26" r="10" fill="${CARN}" stroke="#7a2a1c" stroke-width="2"/>
  <circle cx="30" cy="26" r="3.5" fill="#f0dcaa"/>
  <circle cx="30" cy="50" r="6" fill="none" stroke="${LAPIS}" stroke-width="3.5"/>
  <path d="M30 56 V78 M21 64 H39" stroke="${LAPIS}" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M15 90 l5 -5 l5 5 l5 -5 l5 5 l5 -5 l5 5" fill="none" stroke="#1b8a8a" stroke-width="3" stroke-linejoin="round"/>
  <path d="M19 106 q11 -13 22 0 z" fill="#7a2a1c"/>
</svg>`,
  { size: 256 },
);

const wing = (flip: boolean) => {
  const inner = `
    <path d="M52 32 L12 24 Q8 30 14 34 L52 40Z" fill="${LAPIS}" stroke="#6b4a10" stroke-width="1.6"/>
    <path d="M52 40 L14 36 Q10 42 16 46 L52 48Z" fill="${TURQ}" stroke="#6b4a10" stroke-width="1.6"/>
    <path d="M52 48 L18 48 Q15 54 21 57 L52 56Z" fill="${CARN}" stroke="#6b4a10" stroke-width="1.6"/>`;
  return flip ? `<g transform="translate(120 0) scale(-1 1)">${inner}</g>` : inner;
};
const PECTORAL = svg(
  `<svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
  <path d="M6 12 Q60 0 114 12 L104 70 Q60 80 16 70Z" fill="${GOLD}" stroke="#6b4a10" stroke-width="3" stroke-linejoin="round"/>
  ${wing(false)}${wing(true)}
  <circle cx="60" cy="20" r="12" fill="${CARN}" stroke="#6b4a10" stroke-width="2.5"/>
  <circle cx="60" cy="20" r="5" fill="#f3ead2"/>
  <path d="M60 36 C46 36 46 62 60 66 C74 62 74 36 60 36Z" fill="${LAPIS}" stroke="#6b4a10" stroke-width="2.5"/>
  <path d="M60 38 V64" stroke="#6b4a10" stroke-width="2"/>
  <circle cx="60" cy="33" r="4.5" fill="${TURQ}" stroke="#6b4a10" stroke-width="2"/>
</svg>`,
  { size: 256 },
);

const LOTUS = svg(
  `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
  <path d="M30 56 V40" stroke="#1b6b3a" stroke-width="3.5"/>
  <path d="M30 52 Q18 52 10 44 Q22 42 30 50Z" fill="#2c8a4a" stroke="#0c3a20" stroke-width="1.5"/>
  <path d="M30 52 Q42 52 50 44 Q38 42 30 50Z" fill="#2c8a4a" stroke="#0c3a20" stroke-width="1.5"/>
  <path d="M10 16 C22 20 28 32 30 44 C16 42 8 30 10 16Z" fill="${LAPIS}" stroke="#0c1a44" stroke-width="2"/>
  <path d="M50 16 C38 20 32 32 30 44 C44 42 52 30 50 16Z" fill="${LAPIS}" stroke="#0c1a44" stroke-width="2"/>
  <path d="M30 6 C41 18 41 32 30 44 C19 32 19 18 30 6Z" fill="${TURQ}" stroke="#0c3a38" stroke-width="2"/>
  <circle cx="30" cy="40" r="3" fill="${CARN}"/>
</svg>`,
  { size: 192 },
);

const sunRays = (() => {
  let s = "";
  const pt = (r: number, a: number) => `${(50 + r * Math.cos(a)).toFixed(1)} ${(50 + r * Math.sin(a)).toFixed(1)}`;
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    s += `<path d="M${pt(24, a - 0.15)} L${pt(46, a)} L${pt(24, a + 0.15)}Z" fill="${i % 2 ? GOLD : TURQ}" stroke="#4a3010" stroke-width="1.5" stroke-linejoin="round"/>`;
  }
  return s;
})();
const SUN = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  ${sunRays}
  <circle cx="50" cy="50" r="22" fill="${CARN}" stroke="#4a3010" stroke-width="3"/>
  <circle cx="50" cy="50" r="13" fill="${GOLD}" stroke="#4a3010" stroke-width="2"/>
  <circle cx="50" cy="50" r="5" fill="${CARN}"/>
</svg>`,
  { size: 256 },
);

const TUFT = svg(
  `<svg viewBox="0 0 40 90" xmlns="http://www.w3.org/2000/svg">
  <path d="M20 88 C3 66 5 26 20 2 C35 26 37 66 20 88Z" fill="${LAPIS}" stroke="#0c1a44" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M20 80 C11 62 12 34 20 12 C28 34 29 62 20 80Z" fill="${GOLD}"/>
  <path d="M20 86 L20 10" stroke="#8a5a10" stroke-width="2"/>
</svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "sphinx", paintSize: 2048 });
  type ChainT = ReturnType<typeof b.chain>;

  // ---------------- skeleton ----------------
  const hips = b.joint("hips", { at: [0, 0.42, -1.0] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.42, -1.0],
      [0, 0.4, -0.45],
      [0, 0.46, 0.05],
      [0, 0.62, 0.4],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine", group: "body" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.62, 0.4],
      [0, 1.0, 0.47],
      [0, 1.27, 0.54],
      [0, 1.5, 0.58],
    ]),
    { parent: spine, names: ["neck1", "neck2", "neck3"], role: "neck", group: "body" },
  );
  const head = b.joint("head", { parent: neck, at: [0, 1.5, 0.58], dir: [0, 0.15, 1], role: "head", group: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.46, 0.64], aim: [0, 1.4, 0.82], role: "jaw", group: "head" });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.38, -1.02],
      [0.18, 0.24, -1.3],
      [0.52, 0.12, -1.38],
      [0.84, 0.07, -1.22],
      [0.95, 0.06, -0.85],
      [0.93, 0.055, -0.5],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4", "tail5"], role: "tail", group: "body" },
  );

  // ---------------- torso & neck ----------------
  const RX = [[0, 0.24], [0.1, 0.38], [0.35, 0.37], [0.58, 0.34], [0.8, 0.4], [1, 0.34]];
  const RY = [[0, 0.26], [0.1, 0.41], [0.35, 0.37], [0.58, 0.35], [0.8, 0.44], [1, 0.36]];
  const body = b.sweep(spine, (t) => [keys(RX, t), keys(RY, t)] as [number, number], {
    color: SAND,
    name: "torso",
    group: "body",
  });
  const NR = [[0, 0.32], [0.4, 0.25], [1, 0.16]];
  b.sweep(neck, (t) => keys(NR, t), { color: GILT, name: "neckTube", group: "body" });

  // ---------------- tail ----------------
  const TR = [[0, 0.085], [0.5, 0.062], [1, 0.05]];
  b.sweep(tail, (t) => keys(TR, t), {
    color: SAND,
    bands: [
      [0.78, SAND],
      [0.84, GOLD],
      [0.89, LAPIS],
      [0.94, GOLD],
      [1, SAND],
    ],
    name: "tailTube",
    group: "body",
  });
  const tailEnd = tail.at(1);
  const tuftRing = b.ring(frame(tailEnd.at, tailEnd.tangent), { count: 9, radius: 0.02, tilt: 55 });
  b.cards(tuftRing.items, TUFT, {
    size: [0.09, 0.26],
    lean: 20,
    bend: 20,
    flow: tailEnd.tangent,
    vary: 0.2,
    rng: rng(5),
    cross: true,
    bone: tail.joints[tail.joints.length - 1],
  });

  // ---------------- toes ----------------
  const makeToes = (
    parent: ChainT,
    sd: string,
    tag: string,
    cx: number,
    baseY: number,
    baseZ: number,
    n: number,
    spacing: number,
    r: number,
    lenMid: number,
  ) => {
    for (let k = 0; k < n; k++) {
      const off = (k - (n - 1) / 2) * spacing;
      const len = lenMid * (k === 0 || k === n - 1 ? 0.8 : 1);
      const x = cx + off;
      const path = catmull([V(x, baseY, baseZ), V(x, baseY - 0.015, baseZ + len * 0.55), V(x, r * 0.9, baseZ + len)]);
      const name = `toe${tag}${k + 1}${sd}`;
      const toe = b.chain(name, path, {
        parent,
        names: [`${name}a`, `${name}b`, `${name}Tip`],
        role: "digit",
        group: "legs",
      });
      b.sweep(toe, [r * 1.2, r], { color: SAND, sides: 8, name: `${name}Mesh`, group: "legs" });
      b.spike(V(x, r * 0.9, baseZ + len + r * 0.4), [0, -0.3, 1], r * 1.7, r * 0.45, {
        color: CLAW,
        bone: toe.tip!,
        name: `${name}Claw`,
      });
    }
  };

  const FRX = [[0, 0.19], [0.31, 0.17], [0.55, 0.13], [0.8, 0.115], [1, 0.15]];
  const FRY = [[0, 0.21], [0.31, 0.155], [0.55, 0.135], [0.8, 0.11], [1, 0.09]];
  const HR = [[0, 0.25], [0.3, 0.17], [0.55, 0.125], [0.75, 0.11], [1, 0.09]];
  const CFS = [GOLD, LAPIS, GOLD];

  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";

    // ---- forelegs ----
    const shoulder = V(s * 0.34, 0.55, 0.3);
    const wrist = V(s * 0.32, 0.14, 1.15);
    const pts = limb(shoulder, wrist, [0.42, 0.68], [[0, -1, 0]]);
    const pawEnd = V(s * 0.32, 0.095, 1.42);
    const leg = b.chain(`foreLeg${sd}`, catmull([pts[0], pts[1], pts[2], pawEnd]), {
      parent: spine,
      names: [`shoulder${sd}`, `elbow${sd}`, `wrist${sd}`, `paw${sd}`],
      role: "leg",
      group: "legs",
    });
    const foreTube = b.sweep(leg, (t) => [keys(FRX, t), keys(FRY, t)] as [number, number], {
      color: SAND,
      caps: { start: "round", end: "flat" },
      name: `foreleg${sd}`,
      group: "legs",
    });
    makeToes(leg, sd, "F", s * 0.32, 0.075, 1.37, 4, 0.072, 0.04, 0.22);

    const fs = b.surface(foreTube);
    [0.6, 0.66, 0.72].forEach((t, i) =>
      b.sweep(fs.loop(leg.at(t), { lift: 0.004 }), i === 1 ? 0.018 : 0.022, {
        color: CFS[i],
        name: `cuff${sd}${i}`,
        group: "legs",
      }),
    );
    b.sweep(fs.loop(leg.at(0.2), { lift: 0.004 }), 0.022, { color: GOLD, name: `armlet${sd}`, group: "legs" });
    b.decal(foreTube, LOTUS, {
      at: offset(leg.at(0.45), [s, 0, 0], 0.14),
      dir: [s, 0, 0],
      size: [0.16, 0.16],
      segments: 8,
    });

    // ---- hind legs ----
    const hipP = V(s * 0.36, 0.42, -0.72);
    const kneeP = V(s * 0.5, 0.17, -0.3);
    const hockP = V(s * 0.5, 0.115, -1.0);
    const footP = V(s * 0.6, 0.085, -0.62);
    const hind = b.chain(`hindLeg${sd}`, polyline([hipP, kneeP, hockP, footP]), {
      parent: hips,
      names: [`hip${sd}`, `knee${sd}`, `hock${sd}`, `foot${sd}`],
      role: "leg",
      group: "legs",
    });
    const hindTube = b.sweep(hind, (t) => keys(HR, t), {
      color: SAND,
      skin: "rigid",
      caps: { start: "round", end: "flat" },
      name: `hindleg${sd}`,
      group: "legs",
    });
    b.part(ellGeo(0.2, 0.3, 0.34, 12, 9), SAND, {
      bone: hind.joints[0],
      at: V(s * 0.42, 0.36, -0.62),
      name: `haunch${sd}`,
    });
    makeToes(hind, sd, "H", s * 0.6, 0.07, -0.62, 4, 0.06, 0.033, 0.18);
    b.sweep(b.surface(hindTube).loop(hind.at(0.88), { lift: 0.004 }), 0.02, {
      color: GOLD,
      name: `anklet${sd}`,
      group: "legs",
    });
    b.decal(hindTube, SUN, {
      at: V(s * 0.66, 0.36, -0.62),
      dir: [s, 0, 0],
      size: [0.32, 0.32],
      segments: 10,
    });

    // ---- flank cartouche ----
    b.decal(body, GLYPHS, { at: V(s * 0.42, 0.52, -0.02), dir: [s, 0, 0], size: [0.2, 0.4], segments: 12 });
  }

  // ---------------- chest pectoral ----------------
  const chestHit = b.surface(body).ray([0, 0.4, 3], [0, 0, -1]);
  if (chestHit) b.decal(body, PECTORAL, { at: chestHit, size: [0.4, 0.27], segments: 12 });

  // ---------------- head: skull, face ----------------
  const skull = b.part(ellGeo(0.175, 0.2375, 0.2, 16, 12), GILT, { bone: head, at: V(0, 1.66, 0.63), name: "skull" });
  const muzzle = b.part(ellGeo(0.145, 0.13, 0.14, 14, 10), GILT, { bone: head, at: V(0, 1.52, 0.67), name: "muzzle" });
  const jawMesh = b.part(ellGeo(0.125, 0.08, 0.135, 14, 10), GILT, { bone: jaw, at: V(0, 1.43, 0.665), name: "jawMesh" });
  b.part(ellGeo(0.05, 0.04, 0.045), GILT, { bone: jaw, at: V(0, 1.385, 0.775), name: "chin" });
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    b.part(ellGeo(0.06, 0.05, 0.05, 10, 8), GILT, { bone: head, at: V(s * 0.105, 1.585, 0.73), name: `cheek${sd}` });
    // ears
    b.extrude(
      [[-0.035, 0.07], [0.02, 0.075], [0.05, 0.03], [0.045, -0.03], [0, -0.075], [-0.03, -0.04], [-0.045, 0.01]],
      {
        at: V(s * 0.19, 1.655, 0.62),
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.06,
        bevel: 0.01,
        smoothing: 1,
        color: GILT,
        bone: head,
        name: `ear${sd}`,
      },
    );
    // eyes
    b.decal([skull, muzzle], EYE, {
      at: V(s * 0.09, 1.675, 0.82),
      dir: [0, 0, 1],
      size: [0.13, 0.065],
      mirror: s > 0,
      segments: 12,
    });
    // nostrils
    b.part(ellGeo(0.018, 0.016, 0.022), GILT, { bone: head, at: V(s * 0.04, 1.52, 0.85), name: `nostrilWing${sd}` });
    b.part(ellGeo(0.012, 0.008, 0.012, 6, 4), KOHL, { bone: head, at: V(s * 0.028, 1.502, 0.865), name: `nostril${sd}` });
  }
  // nose
  b.extrude(
    [[0.79, 1.71], [0.84, 1.66], [0.875, 1.58], [0.9, 1.54], [0.885, 1.51], [0.84, 1.5], [0.79, 1.52], [0.78, 1.62]],
    {
      at: [0, 0, 0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: [0.09, 0.04],
      bevel: 0.01,
      smoothing: 1,
      color: GILT,
      bone: head,
      name: "nose",
    },
  );
  // mouth: dark slit, then upper lip on the head and lower lip on the jaw
  const faceS = b.surface([skull, muzzle, jawMesh]);
  const hitM = faceS.ray([0, 1.4725, 3], [0, 0, -1]);
  const hitU = faceS.ray([0, 1.49, 3], [0, 0, -1]);
  const hitL = faceS.ray([0, 1.455, 3], [0, 0, -1]);
  if (hitM) b.stick(ellGeo(0.075, 0.012, 0.007, 8, 4), KOHL, hitM, { embed: 0.3, bone: head, name: "mouthLine" });
  if (hitU) b.stick(ellGeo(0.065, 0.02, 0.016), LIP, hitU, { embed: 0.35, bone: head, name: "upperLip" });
  if (hitL) b.stick(ellGeo(0.058, 0.02, 0.016), LIP, hitL, { embed: 0.35, bone: jaw, name: "lowerLip" });

  // ---------------- nemes headdress ----------------
  const CC = V(0, 1.68, 0.6);
  const CAPQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(-20 * DEG, 0, 0));
  const CAPINV = CAPQ.clone().invert();
  const CAP_TH = 95 * DEG;
  const NEMES = bands([LAPIS, GOLD], 0.036, (p) => p.clone().sub(CC).applyQuaternion(CAPINV).y);
  const cap = b.part(new THREE.SphereGeometry(1, 14, 8, 0, Math.PI * 2, 0, CAP_TH), NEMES, {
    bone: head,
    at: CC,
    quat: CAPQ,
    scale: [0.19, 0.26, 0.26],
    name: "nemesCap",
  });
  const rimPts: THREE.Vector3[] = [];
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2;
    rimPts.push(
      V(0.19 * Math.sin(CAP_TH) * Math.sin(a), 0.26 * Math.cos(CAP_TH), 0.26 * Math.sin(CAP_TH) * Math.cos(a))
        .applyQuaternion(CAPQ)
        .add(CC),
    );
  }
  b.sweep(catmull(rimPts, { closed: true }), 0.016, { color: GILT, bone: head, name: "nemesRim" });

  // lappets
  const LAPPET = bands([LAPIS, GOLD], 0.04, (p) => p.y);
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const inner = [V(s * 0.17, 1.56, 0.58), V(s * 0.2, 1.3, 0.65), V(s * 0.21, 1.03, 0.7)];
    const outer = [V(s * 0.35, 1.56, 0.58), V(s * 0.4, 1.22, 0.66), V(s * 0.44, 0.88, 0.73)];
    b.membrane(polyline(inner), polyline(outer), {
      thickness: 0.03,
      color: LAPPET,
      bone: head,
      name: `lappet${sd}`,
    });
    b.sweep(polyline([...inner, ...outer.slice().reverse()], { closed: true }), 0.013, {
      color: GOLD,
      bone: head,
      name: `lappetTrim${sd}`,
    });
  }
  // queue (the tail of the headcloth down the back of the neck)
  const QY = V(0, 1, 0.2).normalize();
  const QUEUE_P = bands([LAPIS, GOLD], 0.04, (p) => p.y + p.z * 0.2);
  b.extrude(
    [[-0.065, 0], [-0.075, -0.2], [-0.06, -0.46], [-0.03, -0.56], [0.03, -0.56], [0.06, -0.46], [0.075, -0.2], [0.065, 0]],
    {
      at: V(0, 1.585, 0.385),
      x: [1, 0, 0],
      y: QY,
      thickness: 0.07,
      bevel: 0.012,
      smoothing: 1,
      color: QUEUE_P,
      bone: head,
      name: "nemesQueue",
    },
  );
  b.extrude([[-0.08, -0.17], [0.08, -0.17], [0.08, -0.14], [-0.08, -0.14]], {
    at: V(0, 1.585, 0.385),
    x: [1, 0, 0],
    y: QY,
    thickness: 0.085,
    color: GOLD,
    bone: head,
    name: "queueTie",
  });

  // ---------------- uraeus ----------------
  const capS = b.surface(cap);
  const h0 = capS.ray([0, 1.76, 3], [0, 0, -1]);
  const h1 = capS.ray([0, 1.82, 3], [0, 0, -1]);
  const h2 = capS.ray([0, 1.88, 3], [0, 0, -1]);
  if (h0 && h1 && h2) {
    b.rod(h0.moved([0, 0.012, 0]), h1.moved([0, 0.02, 0]), 0.016, { color: GOLD, bone: head, name: "uraeusBase" });
    b.stick(ellGeo(0.045, 0.022, 0.07, 10, 8), GOLD, h1, { embed: 0.25, flow: [0, 1, 0], bone: head, name: "uraeusHood" });
    b.stick(ellGeo(0.028, 0.015, 0.048, 8, 6), LAPIS, h1.moved([0, 0.012, 0]), {
      embed: 0.2,
      flow: [0, 1, 0],
      bone: head,
      name: "uraeusInlay",
    });
    b.stick(ellGeo(0.024, 0.028, 0.034), GOLD, h2.moved([0, 0.02, 0]), {
      embed: 0.3,
      flow: [0, 1, 0],
      bone: head,
      name: "uraeusHead",
    });
    for (const s of [1, -1])
      glow(
        b.part(new THREE.SphereGeometry(0.008, 6, 4), CARN, {
          bone: head,
          at: h2.local([s * 0.017, 0.045, 0.012]),
          name: `uraeusEye${s > 0 ? "L" : "R"}`,
        }),
        1.6,
      );
  }

  // ---------------- false beard ----------------
  const BEARD = bands([LAPIS, GOLD], 1 / 16, (_p, s) => s[0]);
  b.sweep(
    catmull([V(0, 1.37, 0.77), V(0, 1.25, 0.8), V(0, 1.12, 0.815), V(0, 1.04, 0.865)]),
    (t) => [0.036 - 0.012 * t, 0.024] as [number, number],
    { section: "box", color: BEARD, caps: "flat", bone: jaw, name: "beard" },
  );
  b.part(ellGeo(0.034, 0.026, 0.03), GOLD, { bone: jaw, at: V(0, 1.025, 0.875), name: "beardTip" });

  // ---------------- usekh collar ----------------
  const A = V(0, 1, 0.25).normalize();
  const C0 = V(0, 1.04, 0.44);
  const radial = (p: THREE.Vector3) => {
    const d = p.clone().sub(C0);
    return d.addScaledVector(A, -d.dot(A)).length();
  };
  const COLLAR = bands(
    [LAPIS, GOLD, TURQ, GOLD, CARN, GOLD, TURQ, GOLD, LAPIS, GOLD],
    0.036,
    (p) => radial(p) - 0.2,
  );
  const neck1 = neck.joints[0];
  b.lathe(
    [[0.2, 0.075], [0.32, 0], [0.42, -0.14], [0.5, -0.3], [0.505, -0.33], [0.42, -0.17], [0.32, -0.03], [0.2, 0.04]],
    { at: C0, axis: A, segments: 24, color: COLLAR, bone: neck1, name: "usekh" },
  );
  const topH = (r: number) => {
    const pts = [[0.2, 0.075], [0.32, 0], [0.42, -0.14], [0.5, -0.3]];
    for (let i = 1; i < pts.length; i++)
      if (r <= pts[i][0]) {
        const u = (r - pts[i - 1][0]) / (pts[i][0] - pts[i - 1][0]);
        return pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * u;
      }
    return pts[pts.length - 1][1];
  };
  // bead rows on the collar face (the carnelian ones glow)
  [
    [0.26, CARN, 16],
    [0.37, TURQ, 22],
  ].forEach(([r, col, count], row) => {
    const centre = C0.clone().addScaledVector(A, topH(r as number) + 0.014);
    const ring = b.ring(frame(centre, A), { count: count as number, radius: r as number });
    ring.items.forEach((it, i) => {
      const c = i % 2 ? GOLD : (col as string);
      const part = b.part(new THREE.SphereGeometry(0.02, 6, 4), c, { frame: it, bone: neck1, name: `bead${row}_${i}` });
      if (c === CARN) glow(part, 0.8);
    });
  });
  // hanging drops round the rim
  [
    { r: 0.5, h: -0.3, count: 30, len: 0.1, tilt: -70, cols: [TURQ, LAPIS] },
    { r: 0.42, h: -0.155, count: 26, len: 0.06, tilt: -62, cols: [GOLD, CARN] },
  ].forEach((row, ri) => {
    const centre = C0.clone().addScaledVector(A, row.h);
    const ring = b.ring(frame(centre, A), { count: row.count, radius: row.r, tilt: row.tilt });
    const geo = new THREE.ConeGeometry(0.022, row.len, 5).translate(0, row.len / 2, 0);
    ring.items.forEach((it, i) =>
      b.part(geo, row.cols[i % 2], { frame: it, bone: neck1, name: `drop${ri}_${i}` }),
    );
  });
  b.sweep(
    b.surface(b.root).loop(frame(C0.clone().addScaledVector(A, -0.2), A), { lift: 0.0 }),
    0.001,
    { color: GOLD, name: "collarMark", bone: neck1 },
  );

  return b.root;
}
```