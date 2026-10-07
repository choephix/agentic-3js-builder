import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { frame } from "../src/frame";
import { rng } from "../src/math";
import { bezier, catmull, polyline, spiral } from "../src/path";
import { countershade, mix, mottle, noise, paint } from "../src/paint";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Dragonbone Soul Scythe",
  description:
    "A 2 m soul scythe standing on its butt: a dragon-skull crown on a bone snath wrapped in violet leather and gold wire, a crescent blade of spined dragon rib with a cyan soul-fire edge, an orchid soul gem, a hanging soul lantern and spectral wisps.",
  style: "League of Legends",
  commit: "b816db2",
};

// Warm bone and violet-black carry the body; gold trim and cyan/orchid soul light are the high-contrast accents.
const IVORY = "#f5e2b0";
const IVORY_HI = "#fff4d6";
const IVORY_DEEP = "#8e6fb3";
const INK = "#1d0c2c";
const VIOLET_DARK = "#2b1450";
const VIOLET = "#6d32c2";
const GOLD = "#ffc53d";
const CYAN = "#7ff7ff";
const ORCHID = "#e873ff";

const BONE = countershade(mottle(IVORY, IVORY_HI, { size: 0.06, contrast: 0.7, seed: 4 }), IVORY_DEEP, {
  level: -0.2,
  soft: 0.45,
});

// Violet leather wrap with hard diamond-stitch bands along the grip.
const WRAP = paint((p) => {
  const band = p.y / 0.034;
  return Math.abs(2 * (band - Math.floor(band)) - 1) > 0.5 ? VIOLET : VIOLET_DARK;
});

// Blade outline in (u, v) metres: the spine (back, convex hook) and the cutting edge (concave underside).
const SPINE_UV: [number, number][] = [
  [0.0, 0.12],
  [0.16, 0.3],
  [0.36, 0.42],
  [0.56, 0.44],
  [0.7, 0.36],
  [0.78, 0.18],
  [0.8, -0.06],
];
const EDGE_UV: [number, number][] = [
  [0.7, 0.08],
  [0.56, 0.2],
  [0.38, 0.27],
  [0.18, 0.22],
  [0.04, 0.1],
  [0.0, -0.02],
];
// The edge read in increasing u, for height lookups.
const EDGE_ASC: [number, number][] = [
  [0.0, -0.02],
  [0.04, 0.1],
  [0.18, 0.22],
  [0.38, 0.27],
  [0.56, 0.2],
  [0.7, 0.08],
  [0.8, -0.06],
];
const BLADE_OUTLINE: OutlinePoint[] = [
  [0.0, 0.12, "sharp"],
  [0.16, 0.3],
  [0.36, 0.42],
  [0.56, 0.44],
  [0.7, 0.36],
  [0.78, 0.18],
  [0.8, -0.06, "sharp"],
  [0.7, 0.08],
  [0.56, 0.2],
  [0.38, 0.27],
  [0.18, 0.22],
  [0.04, 0.1],
  [0.0, -0.02, "sharp"],
];

/** Height of a piecewise-linear profile through `pts` (ascending in u) at `u`. */
function heightAt(pts: [number, number][], u: number) {
  for (let i = 1; i < pts.length; i++) {
    const [u0, v0] = pts[i - 1];
    const [u1, v1] = pts[i];
    if (u <= u1) return v0 + ((v1 - v0) * (u - u0)) / (u1 - u0);
  }
  return pts[pts.length - 1][1];
}

// Blade paint: dragon-rib striations that follow the crescent, a violet cutting edge, warm bone elsewhere.
const BLADE = paint((p, _n, s) => {
  const [u, v] = s;
  const top = heightAt(SPINE_UV, u);
  const bottom = heightAt(EDGE_ASC, u);
  const f = (v - bottom) / Math.max(top - bottom, 0.02); // 0 at the cutting edge, 1 at the spine
  if (f < 0.12) return VIOLET_DARK;
  const rib = Math.abs(2 * ((f * 6) % 1) - 1);
  if (rib > 0.86) return IVORY_DEEP;
  return mix(IVORY_HI, IVORY, noise(p, 0.05, 3));
});

// Blade plane: the crescent grows along U (out to the model's left and a little forward) and rises along V.
const V_UP = new THREE.Vector3(0, 1, 0);
const U_OUT = new THREE.Vector3(0.97, 0, 0.25).normalize();
const N_FACE = new THREE.Vector3().crossVectors(U_OUT, V_UP).normalize();
const BLADE_ROOT = new THREE.Vector3(0, 1.43, 0.3);
/** A model-space point on the blade plane, u outward from the socket, v up. */
const P = (u: number, v: number) => BLADE_ROOT.clone().addScaledVector(U_OUT, u).addScaledVector(V_UP, v);
/** A model-space direction in the blade plane. */
const D = (du: number, dv: number) => U_OUT.clone().multiplyScalar(du).addScaledVector(V_UP, dv);

const FERRULE: OutlinePoint[] = [
  [0, 0],
  [0.031, 0],
  [0.031, 0.02],
  [0.026, 0.03],
  [0, 0.03],
];
const BEAD: OutlinePoint[] = [
  [0, -0.012],
  [0.032, -0.012],
  [0.038, -0.004],
  [0.034, 0.006],
  [0.03, 0.012],
  [0, 0.012],
];
const COLLAR: OutlinePoint[] = [
  [0, -0.009],
  [0.038, -0.009],
  [0.042, 0],
  [0.038, 0.009],
  [0, 0.009],
];
const CUP: OutlinePoint[] = [
  [0, 0],
  [0.024, 0],
  [0.03, 0.01],
  [0.02, 0.022],
  [0, 0.022],
];
const NECK_COLLAR: OutlinePoint[] = [
  [0, 0],
  [0.05, 0],
  [0.055, 0.012],
  [0.048, 0.022],
  [0, 0.022],
];

const HAFT_TOP = 1.42;

const WISP = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 128">
<defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0">
<stop offset="0" stop-color="#6d32c2"/><stop offset="0.55" stop-color="#7ff7ff"/><stop offset="1" stop-color="#e6feff"/>
</linearGradient></defs>
<path d="M32 4 C44 34 60 52 56 84 C52 112 40 124 32 124 C24 124 12 112 8 84 C4 52 20 34 32 4 Z" fill="url(#g)"/>
<path d="M32 40 C38 64 46 76 44 96 C42 110 36 116 32 116 C28 116 22 110 20 96 C18 76 26 64 32 40 Z" fill="#e6feff" opacity="0.85"/>
</svg>`,
  { size: 128 },
);

const FILIGREE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 240">
<g fill="none" stroke="#ffc53d" stroke-width="9" stroke-linecap="round">
<path d="M20 170 C110 70 210 60 262 130 C296 176 252 206 230 180 C214 160 244 140 262 156"/>
<path d="M300 40 C350 0 440 10 470 60 C492 98 452 120 436 100 C422 82 446 66 460 78"/>
<path d="M330 190 C400 210 480 200 580 120"/>
<path d="M300 130 C330 110 360 150 340 170"/>
</g>
<g fill="#ffc53d"><circle cx="150" cy="120" r="10"/><circle cx="520" cy="150" r="9"/><circle cx="300" cy="100" r="7"/></g>
</svg>`,
  { size: 512 },
);

const TASSEL = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 96">
<path d="M9 2 L5 26 L27 26 L23 2 Z" fill="#7ff7ff"/>
<path d="M6 24 L3 62 L9 58 L11 90 L16 62 L21 90 L23 58 L29 62 L26 24 Z" fill="#6d32c2"/>
<path d="M11 24 L13 80 M21 24 L19 80" stroke="#2b1450" stroke-width="1.5" fill="none"/>
<rect x="12" y="84" width="8" height="10" rx="3" fill="#ffc53d"/>
</svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "dragonboneSoulScythe" });

  // Skeleton: the haft is the root; the skull, its jaw and the blade hang off the crown.
  const haft = b.joint("haft", { at: [0, 0, 0] });
  const crown = b.joint("crown", { parent: haft, at: [0, 1.46, 0], role: "head" });
  const jaw = b.joint("jaw", { parent: crown, at: [0, 1.37, 0.0], aim: [0, 1.36, 0.3], role: "jaw" });
  const blade = b.joint("blade", { parent: crown, at: BLADE_ROOT, role: "hinge" });

  // ---- Snath: bone haft, ferrule and spike, vertebra beads, violet grip with gold wire ----
  const H = polyline([
    [0, 0, 0],
    [0, HAFT_TOP, 0],
  ]);
  b.sweep(H, (t) => 0.02 + 0.005 * t, { bone: haft, color: BONE, caps: { start: "flat", end: "round" } });
  b.spike([0, 0.13, 0], [0, 0, 0], null, 0.03, { bone: haft, color: BONE });
  b.lathe(FERRULE, { at: [0, 0.1, 0], bone: haft, color: GOLD });

  for (const [i, y] of [0.22, 0.28, 0.34, 0.4, 1.0, 1.06, 1.12, 1.18, 1.24, 1.3].entries()) {
    b.lathe(BEAD, { at: [0, y, 0], bone: haft, color: BONE, smoothing: 1, name: `vertebra.${i}` });
    for (const s of [1, -1])
      b.spike([s * 0.03, y, 0], [s, 0.35, 0], 0.035, 0.008, { bone: haft, color: IVORY_HI });
  }

  b.sweep(H.slice(0.338, 0.606), 0.031, { bone: haft, color: WRAP, name: "grip" });
  const wire = spiral([0, 0.49, 0], [0.034, 0.49, 0], [0, 1, 0], { turns: 10, pitch: 0.035 });
  b.sweep(wire, 0.0034, { bone: haft, color: GOLD, name: "grip.wire" });
  for (const y of [0.47, 0.865]) b.lathe(COLLAR, { at: [0, y, 0], bone: haft, color: GOLD });

  // Orchid soul gem set in a gold ring at the grip.
  b.part(new THREE.TorusGeometry(0.034, 0.005, 5, 8), GOLD, {
    bone: haft,
    at: [0, 0.67, 0],
    rotation: [90, 0, 0],
    name: "grip.ring",
  });
  glow(
    b.part(new THREE.OctahedronGeometry(0.02, 0), ORCHID, {
      bone: haft,
      at: [0, 0.67, 0.036],
      scale: [0.9, 1.4, 0.6],
      name: "grip.gem",
    }),
    1.4,
  );

  // Violet tassels hanging from the lower gold collar.
  const tassels = [0, 1, 2, 3, 4, 5].map((k) => {
    const a = (k / 6) * Math.PI * 2;
    return frame([Math.sin(a) * 0.042, 0.456, Math.cos(a) * 0.042], [0, 1, 0]);
  });
  b.cards(tassels, TASSEL, { size: [0.036, 0.15], lean: 180, bone: haft });

  // ---- Crown: dragon skull with eye-glow, jaw, forehead gem and swept bone horns ----
  b.lathe(NECK_COLLAR, { at: [0, 1.36, 0], bone: haft, color: GOLD, name: "neck.collar" });
  b.part(new THREE.SphereGeometry(1, 12, 9), BONE, {
    bone: crown,
    at: [0, 1.47, -0.02],
    scale: [0.1, 0.088, 0.12],
    name: "skull.cranium",
  });
  b.loft(
    [
      { at: [0, 1.49, 0.04], w: 0.15, h: 0.12 },
      { at: [0, 1.465, 0.2], w: 0.11, h: 0.09 },
      { at: [0, 1.44, 0.36], w: 0.07, h: 0.07 },
    ],
    { bone: crown, color: BONE, name: "skull.snout" },
  );
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.012, 6, 4), INK, {
      bone: crown,
      at: [s * 0.03, 1.49, 0.36],
      scale: [1, 0.8, 1.4],
      name: `skull.nostril.${s > 0 ? "L" : "R"}`,
    });
  b.capsule([-0.08, 1.555, 0.075], [0.08, 1.555, 0.075], 0.02, { bone: crown, color: BONE, name: "skull.brow" });
  b.lathe(CUP, { at: [0, 1.545, 0.08], bone: crown, color: GOLD, name: "skull.gemCup" });
  glow(
    b.part(new THREE.OctahedronGeometry(0.026, 0), ORCHID, {
      bone: crown,
      at: [0, 1.585, 0.08],
      scale: [0.9, 1.5, 0.9],
      name: "skull.gem",
    }),
    1.4,
  );
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.part(new THREE.SphereGeometry(1, 8, 6), INK, {
      bone: crown,
      at: [s * 0.056, 1.52, 0.085],
      scale: [0.036, 0.03, 0.026],
      name: `skull.socket.${side}`,
    });
    glow(
      b.part(new THREE.SphereGeometry(0.018, 8, 6), CYAN, {
        bone: crown,
        at: [s * 0.056, 1.52, 0.1],
        name: `skull.eye.${side}`,
      }),
      1.6,
    );
    b.sweep(bezier([s * 0.08, 1.56, -0.02], [s * 0.2, 1.74, -0.04], [s * 0.27, 1.64, -0.26]), [0.034, 0.006], {
      bone: crown,
      color: BONE,
      bands: [
        [0.6, BONE],
        [1, VIOLET],
      ],
      name: `skull.horn.${side}`,
    });
  }
  // Dorsal crest: two violet bone sails fanning back from the crown, with gold trim on their spines.
  for (const [k, z, y] of [
    [1, -0.02, 1.52],
    [0.62, -0.13, 1.5],
  ] as const) {
    const sail = b.extrude(
      [
        [0, -0.02],
        [0.12 * k, 0.02],
        [0.26 * k, 0.14 * k],
        [0.3 * k, 0.24 * k, "sharp"],
        [0.18 * k, 0.12 * k],
        [0.06 * k, 0.06 * k],
        [0, 0],
      ],
      { at: [0, y, z], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.014, bevel: 0.004, smoothing: 1, color: VIOLET, bone: crown, name: `skull.crest.${k}` },
    );
    glow(b.part(new THREE.SphereGeometry(0.008, 6, 4), GOLD, { bone: crown, at: sail.local([0.14 * k, 0.04 * k, 0.008]) }), 1);
  }
  for (const s of [1, -1])
    b.spike([s * 0.09, 1.5, 0.02], [s, 0.2, -0.4], 0.05, 0.012, { bone: crown, color: IVORY_HI, name: `skull.cheek.${s > 0 ? "L" : "R"}` });
  // Lower jaw with teeth; the blade root sits at the mouth between the jaws.
  b.loft(
    [
      { at: [0, 1.37, 0.0], w: 0.12, h: 0.09 },
      { at: [0, 1.36, 0.16], w: 0.09, h: 0.07 },
      { at: [0, 1.35, 0.3], w: 0.06, h: 0.05 },
    ],
    { bone: jaw, color: BONE, name: "jaw.lower" },
  );
  for (const z of [0.1, 0.18, 0.26, 0.33])
    for (const s of [1, -1]) {
      b.spike([s * 0.04, 1.415, z], [0, -1, 0], 0.035, 0.009, { bone: crown, color: IVORY_HI });
      b.spike([s * 0.035, 1.375, z], [0, 1, 0], 0.03, 0.008, { bone: jaw, color: IVORY_HI });
    }

  // ---- Blade: spined dragon-rib crescent, gold spine trim and rivets, soul-fire edge ----
  const blades = { bone: blade };
  b.extrude(BLADE_OUTLINE, {
    at: BLADE_ROOT,
    x: U_OUT.toArray(),
    y: V_UP.toArray(),
    thickness: 0.03,
    bevel: 0.008,
    smoothing: 2,
    color: BLADE,
    bone: blade,
    name: "blade.plate",
  });
  b.sweep(catmull(SPINE_UV.map(([u, v]) => P(u, v))), 0.0055, { ...blades, color: GOLD, name: "blade.spineTrim" });
  glow(
    b.sweep(catmull(EDGE_UV.map(([u, v]) => P(u, v))), 0.011, { ...blades, color: CYAN, name: "blade.soulEdge" }),
    1.6,
  );
  for (const [i, u] of [0.1, 0.25, 0.4, 0.55, 0.68].entries())
    for (const s of [1, -1])
      b.part(new THREE.SphereGeometry(0.008, 6, 4), GOLD, {
        ...blades,
        at: P(u, heightAt(SPINE_UV, u) - 0.022).addScaledVector(N_FACE, s * 0.016),
        name: `blade.rivet.${i}.${s > 0 ? "front" : "back"}`,
      });

  // Spine spikes: a dragon's dorsal row, standing out of the spine along its normal.
  const spineUV = catmull(SPINE_UV.map(([u, v]) => [u, v, 0]));
  for (let i = 1; i <= 8; i++) {
    const t = i / 9;
    const at = spineUV.at(t);
    const tg = spineUV.tangentAt(t);
    const nu = -tg.y;
    const nv = tg.x;
    const len = Math.hypot(nu, nv);
    const dir = D(nu / len, nv / len);
    const base = P(at.x, at.y).addScaledVector(dir, -0.006);
    b.spike(base, dir, 0.05 * (1 - 0.55 * t), 0.01, { ...blades, color: IVORY_HI, name: `blade.spine.${i}` });
  }

  // Gold filigree inlay on both faces of the blade.
  const fil = P(0.42, 0.3);
  b.part(new THREE.PlaneGeometry(0.5, 0.2), "#ffffff", {
    bone: blade,
    at: fil.clone().addScaledVector(N_FACE, 0.0175),
    dir: N_FACE,
    axis: "z",
    up: V_UP,
    texture: FILIGREE,
    name: "blade.filigree.front",
  });
  b.part(new THREE.PlaneGeometry(0.5, 0.2), "#ffffff", {
    bone: blade,
    at: fil.clone().addScaledVector(N_FACE, -0.0175),
    dir: N_FACE.clone().negate(),
    axis: "z",
    up: V_UP,
    texture: FILIGREE,
    name: "blade.filigree.back",
  });

  // Gold pin through the blade root, capped with cyan soul-stones on both faces.
  const pin = P(0.07, 0.06);
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.06, 8), GOLD, { bone: blade, at: pin, dir: N_FACE, name: "blade.pin" });
  for (const s of [1, -1])
    glow(
      b.part(new THREE.SphereGeometry(0.011, 8, 6), CYAN, {
        bone: blade,
        at: pin.clone().addScaledVector(N_FACE, s * 0.032),
        name: `blade.pinStone.${s > 0 ? "front" : "back"}`,
      }),
      1.5,
    );

  // Gold chain hanging from the blade's hook, ending in an orchid soul lantern.
  const tip = P(0.8, -0.06);
  for (let i = 0; i < 5; i++)
    b.part(new THREE.TorusGeometry(0.011, 0.0036, 5, 8), GOLD, {
      bone: blade,
      at: [tip.x, tip.y - 0.03 - i * 0.028, tip.z],
      rotation: [0, i % 2 ? 90 : 0, 0],
      name: `blade.chain.${i}`,
    });
  glow(
    b.part(new THREE.OctahedronGeometry(0.024, 0), ORCHID, {
      bone: blade,
      at: [tip.x, tip.y - 0.2, tip.z],
      scale: [0.8, 1.3, 0.8],
      name: "blade.lantern",
    }),
    1.4,
  );

  // Spectral wisps rising from the spine.
  const wispFrames = [0.12, 0.3, 0.5, 0.68, 0.85].map((t) => {
    const at = spineUV.at(t);
    return frame(P(at.x, at.y).addScaledVector(V_UP, 0.02), [0, 1, 0]);
  });
  glow(b.cards(wispFrames, WISP, { size: [0.09, 0.24], lean: 8, vary: 0.25, rng: rng(7), bone: blade }), 1.2);

  return b.root;
}
