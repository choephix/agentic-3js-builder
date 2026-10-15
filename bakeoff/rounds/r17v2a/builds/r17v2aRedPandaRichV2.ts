import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { limb } from "../../../../src/ik";
import { cells, mix, mottle, noise, paint, smoothstep, spots } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { animeEye, cel, furEdge, INK, zigzag } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Red Panda on a Mossy Stone",
  description:
    "A cel-shaded red panda balancing on a moss-capped boulder, tail raised for balance, with a teal ribbon collar, gold leaf pendant and tassels, and drifting dendro seeds.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette: every colour is a cel (lit tone + hue-shifted shadow tone).

const Y = 0.27; // top of the stone plateau

const RUST = cel(mottle("#f4782f", "#e9632b", { size: 0.07, contrast: 1.3, seed: 3 }));
const DARK = cel("#573042", "#2f1a2e");
const CREAM = cel("#fff4e2", "#f0c9b0");
const TEAR = cel("#963d22", "#6a2a22");
const NOSE = cel("#3a2238", INK);
const GOLD = cel("#f8c94a", "#c78a2a");
const TEAL = cel("#2ec9b3", "#1f8fa6");
const LEAF = cel("#93ec6a", "#3fae5c");
const CLAW = "#f6e6c8";
const WHISKER = "#fff7ea";
const GEM = "#8dffa0";
const MOSS1 = "#7ed95a";
const MOSS2 = "#4fae4c";

// ---------------------------------------------------------------------------------------------------------------
// Drawings

const TUFT = svg(
  `<svg viewBox="0 0 32 64"><path d="M16 64 C4 56 2 34 9 18 C11 11 14 5 16 0 C19 7 22 12 24 20 C30 36 28 56 16 64Z" fill="#ffffff"/><path d="M16 60 C12 46 12 26 16 8 C20 26 20 46 16 60Z" fill="#e4dcd6"/></svg>`,
  { size: 128 },
);

const MOSS_TUFT = svg(
  `<svg viewBox="0 0 48 32"><path d="M2 32 C0 20 8 12 14 16 C16 6 30 4 34 14 C42 10 48 22 46 32Z" fill="#4fae4c"/><path d="M8 32 C8 24 14 20 18 24 C20 16 28 14 31 22 C36 20 42 26 40 32Z" fill="#7ed95a"/><circle cx="20" cy="14" r="2.2" fill="#c4f38a"/><circle cx="33" cy="19" r="1.8" fill="#c4f38a"/><circle cx="11" cy="22" r="1.6" fill="#c4f38a"/></svg>`,
  { size: 128 },
);

const GRASS = svg(
  `<svg viewBox="0 0 40 64"><path d="M4 64 C4 42 6 20 10 2 C15 22 16 44 17 64Z" fill="#4faa4a"/><path d="M14 64 C15 44 18 26 24 6 C27 28 27 46 27 64Z" fill="#74d05a"/><path d="M24 64 C26 48 30 34 38 20 C37 40 35 52 34 64Z" fill="#3f9a48"/><path d="M10 64 C10 52 11 40 13 30 C16 42 16 52 16 64Z" fill="#a4ec74"/></svg>`,
  { size: 128 },
);

const FERN = (() => {
  let leaflets = "";
  for (let i = 0; i < 8; i++) {
    const t = i / 8;
    const cy = 52 - i * 6;
    const cx = 24 + 3.2 * Math.sin(t * 2.2) + i * 0.7;
    const len = 14 - i * 1.3;
    leaflets += `<ellipse cx="${cx - len * 0.55}" cy="${cy}" rx="${len * 0.55}" ry="2.4" transform="rotate(-24 ${cx} ${cy})" fill="${i % 2 ? "#4fb55a" : "#6ed36a"}"/>`;
    leaflets += `<ellipse cx="${cx + len * 0.55}" cy="${cy}" rx="${len * 0.55}" ry="2.4" transform="rotate(24 ${cx} ${cy})" fill="${i % 2 ? "#6ed36a" : "#4fb55a"}"/>`;
  }
  return svg(
    `<svg viewBox="0 0 48 64"><path d="M24 64 C24 40 28 22 32 6" stroke="#2f8f4e" stroke-width="3" fill="none"/>${leaflets}</svg>`,
    { size: 192 },
  );
})();

const FLOWER = svg(
  `<svg viewBox="0 0 32 64"><rect x="14.8" y="22" width="2.6" height="42" fill="#4aa04a"/><ellipse cx="22" cy="46" rx="6" ry="2.6" transform="rotate(-30 22 46)" fill="#5fc257"/>${[0, 72, 144, 216, 288]
    .map((a) => `<ellipse cx="16" cy="6.5" rx="3.6" ry="6" transform="rotate(${a} 16 14)" fill="#ffffff"/>`)
    .join("")}<circle cx="16" cy="14" r="3.4" fill="#f6c744"/><circle cx="15" cy="13" r="1.1" fill="#ffe892"/></svg>`,
  { size: 128 },
);

const TASSEL = svg(
  `<svg viewBox="0 0 24 64"><path d="M12 48 C4 40 0 20 3 2 L21 2 C24 20 20 40 12 48Z" fill="#2ec9b3"/><path d="M12 46 C9 34 8 18 8 4 L11 3 C12 18 12 34 12 46Z" fill="#58e3cc"/><path d="M12 46 C14 34 16 18 17 4 L20 4 C19 20 17 36 12 46Z" fill="#1f9aa0"/><rect x="6.5" y="42" width="11" height="5" rx="1.5" fill="#f8c94a"/><rect x="10.5" y="47" width="3" height="8" fill="#f8c94a"/><ellipse cx="12" cy="58" rx="5" ry="6" fill="#f8c94a"/><ellipse cx="10.5" cy="56" rx="1.6" ry="2.4" fill="#ffe892"/></svg>`,
  { size: 192 },
);

const MOUTH = svg(
  `<svg viewBox="0 0 64 40"><path d="M32 3 L32 14" stroke="#22112f" stroke-width="3" stroke-linecap="round" fill="none"/><path d="M32 14 C28 25 20 25 12 17" stroke="#22112f" stroke-width="3" stroke-linecap="round" fill="none"/><path d="M32 14 C36 25 44 25 52 17" stroke="#22112f" stroke-width="3" stroke-linecap="round" fill="none"/></svg>`,
  { size: 256 },
);

const EYE = animeEye({ iris: "#ffa21f", irisLight: "#ffe27a", blush: false, brow: false });

// ---------------------------------------------------------------------------------------------------------------
// Helpers

/** A lumpy ellipsoid in model space, flattened by clamping to [0, top]: stones and ground. */
function lumpy(
  cx: number,
  cy: number,
  cz: number,
  rx: number,
  ry: number,
  rz: number,
  top: number,
  seed: number,
  amp: number,
  ws: number,
  hs: number,
) {
  const g = new THREE.SphereGeometry(1, ws, hs);
  const pos = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const k =
      1 +
      (amp * (Math.sin(x * 5.1 + z * 3.3 + seed) + 0.8 * Math.sin(z * 6.7 - y * 2.9 + seed * 1.7) + 0.5 * Math.sin(x * 9 + y * 7 + seed * 2.3))) /
        2.3;
    pos.setXYZ(i, cx + x * rx * k, Math.min(Math.max(cy + y * ry * k, 0), top), cz + z * rz * k);
  }
  g.computeVertexNormals();
  return g;
}

const STONE = cel("#a4a9ae", "#6d7491");
const CRACK = cel("#5b6078", "#3d4160");

/** Stone with a ragged mossy cap that starts `depth` below its top. */
function stonePaint(top: number, depth: number, seed: number) {
  return paint((p, n) => {
    const nz = noise(p, 0.14, seed);
    const edge = top - depth - (nz - 0.5) * 0.2 + 0.03 * zigzag(p.x / 0.07 + p.z / 0.06);
    if (p.y > edge) {
      const m = smoothstep(0.35, 0.65, noise(p, 0.1, seed + 5));
      return n.y > 0.5 ? cel(mix(MOSS1, "#a6f07a", m)) : cel(mix(MOSS2, MOSS1, m));
    }
    const c = cells(p, 0.18, seed + 9);
    if (c.d2 - c.d1 < 0.045) return CRACK;
    return cel(mix("#a4a9ae", "#8c9097", smoothstep(0.3, 0.7, noise(p, 0.12, seed + 2))));
  });
}

/** Orthonormal drawing axes for an extrude whose face looks along `thick` and whose y runs along `yDir`. */
function plane(yDir: number[], thick: number[]) {
  const t = new THREE.Vector3(...thick).normalize();
  const y = new THREE.Vector3(...yDir);
  y.addScaledVector(t, -y.dot(t)).normalize();
  const x = new THREE.Vector3().crossVectors(y, t).normalize();
  return { x: [x.x, x.y, x.z], y: [y.x, y.y, y.z], t };
}

const LEAF_OUTLINE: OutlinePoint[] = [
  [0, 0],
  [0.014, 0.012],
  [0.011, 0.03],
  [0, 0.047, "sharp"],
  [-0.011, 0.03],
  [-0.014, 0.012],
];

const leafPaint = (scale: number) =>
  paint((_p, _n, s) => (Math.abs(s[0]) < 0.0011 * scale && s[1] > 0.004 * scale ? GOLD : LEAF));

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "redPandaOnMossyStone", paintSize: 2048 });
  const rand = rng(11);

  // ----- skeleton -----------------------------------------------------------------------------------------------
  const base = b.joint("base", { at: [0, 0, 0] });

  const spinePath = catmull([
    [0, Y + 0.185, -0.17],
    [0, Y + 0.2, -0.07],
    [0, Y + 0.207, 0.03],
    [0, Y + 0.2, 0.14],
  ]);
  const spine = b.chain("spine", spinePath, {
    parent: base,
    names: ["hips", "spine1", "spine2", "chest"],
    role: "spine",
  });
  const hips = spine.joints[0];
  const chest = spine.joints[3];

  const neckPath = catmull([
    [0, Y + 0.2, 0.14],
    [0, Y + 0.218, 0.19],
    [0, Y + 0.232, 0.235],
  ]);
  const neck = b.chain("neck", neckPath, { parent: chest, names: ["neck1", "neck2"], role: "neck" });

  const head = b.joint("head", { parent: neck.joints[1], at: neckPath.at(1), dir: [0, -0.08, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.045, down: 0.035 }),
    aim: head.local({ forward: 0.12, down: 0.045 }),
    role: "jaw",
  });
  const HC = head.local({ forward: 0.07 });

  // ----- ground and stones --------------------------------------------------------------------------------------
  const ground = b.part(
    lumpy(0, 0, 0, 0.64, 0.07, 0.6, 0.026, 2.1, 0.035, 18, 6),
    cel(mottle("#6fc752", "#58b44c", { size: 0.14, seed: 8 })),
    { bone: base, at: [0, 0, 0], flat: true, name: "ground" },
  );

  const stone = b.part(lumpy(0, 0.15, 0, 0.34, 0.2, 0.31, Y, 1.3, 0.09, 11, 8), stonePaint(Y, 0.085, 4), {
    bone: base,
    at: [0, 0, 0],
    flat: true,
    name: "stone",
  });

  const rockA = b.part(lumpy(0.46, 0.04, 0.22, 0.1, 0.08, 0.09, 0.075, 5.2, 0.1, 8, 6), stonePaint(0.075, 0.035, 6), {
    bone: base,
    at: [0, 0, 0],
    flat: true,
    name: "rockA",
  });
  const rockB = b.part(lumpy(-0.43, 0.03, 0.32, 0.075, 0.06, 0.07, 0.055, 7.7, 0.1, 8, 6), stonePaint(0.055, 0.03, 8), {
    bone: base,
    at: [0, 0, 0],
    flat: true,
    name: "rockB",
  });
  for (const [x, z, r] of [
    [0.3, 0.42, 0.022],
    [-0.1, 0.5, 0.017],
    [0.52, -0.05, 0.02],
    [-0.5, -0.1, 0.024],
    [0.1, -0.5, 0.018],
  ] as const)
    b.part(new THREE.SphereGeometry(r, 6, 4), STONE, {
      bone: base,
      at: [x, 0.02 + r * 0.3, z],
      scale: [1.2, 0.7, 1],
      flat: true,
    });

  // moss tufts on the stone's cap, hanging moss on its flanks
  const stoneSkin = b.surface(stone);
  const capHits = stoneSkin.scatter(70, {
    rng: rng(21),
    minDist: 0.045,
    filter: (h) => h.n.y > 0.35 && h.at.y > Y - 0.1 && Math.hypot(h.at.x, h.at.z) > 0.15,
  });
  b.cards(capHits, MOSS_TUFT, { size: [0.06, 0.04], lean: 20, vary: 0.35, spin: 180, rng: rng(22), cross: true });
  const dripHits = stoneSkin.scatter(40, {
    rng: rng(23),
    minDist: 0.05,
    filter: (h) => h.n.y < 0.5 && h.n.y > -0.2 && h.at.y > 0.13 && h.at.y < Y - 0.02,
  });
  b.cards(
    dripHits.map((h) => frame(h.at, [0, 1, 0])),
    MOSS_TUFT,
    { size: [0.05, 0.045], lean: 180, flow: [0, 0, 1], vary: 0.3, rng: rng(24), bone: base },
  );
  // little tufts on the rocks
  for (const rock of [rockA, rockB])
    b.cards(
      b.surface(rock).scatter(8, { rng: rng(25), minDist: 0.03, filter: (h) => h.n.y > 0.4 }),
      MOSS_TUFT,
      { size: [0.04, 0.03], lean: 10, vary: 0.3, rng: rng(26), cross: true },
    );

  // ground cover
  const groundSkin = b.surface(ground);
  const open = (h: { at: THREE.Vector3; n: THREE.Vector3 }) => h.n.y > 0.6 && Math.hypot(h.at.x / 0.4, h.at.z / 0.37) > 1;
  b.cards(
    groundSkin.scatter(150, { rng: rng(31), minDist: 0.045, filter: open }),
    GRASS,
    { size: [0.05, 0.075], lean: 5, vary: 0.4, spin: 180, rng: rng(32), cross: true },
  );
  b.cards(groundSkin.scatter(10, { rng: rng(33), minDist: 0.14, filter: open }), FERN, {
    size: [0.14, 0.18],
    lean: 25,
    vary: 0.3,
    spin: 180,
    rng: rng(34),
    cross: true,
  });
  b.cards(groundSkin.scatter(16, { rng: rng(35), minDist: 0.09, filter: open }), FLOWER, {
    size: [0.04, 0.08],
    vary: 0.3,
    spin: 180,
    rng: rng(36),
    cross: true,
  });

  // mushrooms by the stone's foot
  const CAP = cel(spots("#ff8e5c", "#fff4e2", { size: 0.016, amount: 0.4, seed: 4 }));
  const STEM = cel("#fff0dc", "#e8c6b0");
  for (const [x, z, h, r] of [
    [0.27, 0.26, 0.05, 0.034],
    [0.33, 0.2, 0.034, 0.024],
    [0.22, 0.33, 0.028, 0.02],
    [-0.28, 0.16, 0.044, 0.03],
    [-0.33, 0.1, 0.03, 0.021],
  ] as const) {
    const tilt = (rand() - 0.5) * 0.3;
    b.rod([x, 0.02, z], [x + tilt * h, 0.026 + h, z], [r * 0.4, r * 0.3], { color: STEM, bone: base, sides: 6 });
    b.lathe(
      [
        [0, 0.0],
        [r, -0.006],
        [r * 1.08, 0.004],
        [r * 0.7, r * 0.7],
        [0, r * 0.85],
      ],
      { at: [x + tilt * h, 0.026 + h, z], bone: base, color: CAP, segments: 9, smoothing: 1 },
    );
  }

  // ----- body --------------------------------------------------------------------------------------------------
  const COAT = cel(
    furEdge(mottle("#f4782f", "#e9632b", { size: 0.07, contrast: 1.3, seed: 3 }), "#573042", {
      level: -0.12,
      teeth: 0.2,
      period: 0.032,
      ink: INK,
      inkWidth: 0.05,
    }),
    undefined,
  );

  const body = b.sweep(spine, (t) => [0.066 + 0.014 * Math.sin(Math.PI * t), 0.062 + 0.012 * Math.sin(Math.PI * t)], {
    color: COAT,
    shift: [0, -0.008],
    sides: 12,
  });
  const neckSweep = b.sweep(neck, [0.064, 0.07], { color: COAT, sides: 12 });

  // fur tufts along the back and chest
  b.cards(
    b.surface(body).scatter(90, { rng: rng(41), minDist: 0.03, filter: (h) => h.n.y > 0.1 }),
    TUFT,
    { size: [0.024, 0.045], lean: 70, bend: 25, vary: 0.3, rng: rng(42), color: "#f78a3c" },
  );
  b.cards(
    b.surface(body).scatter(30, { rng: rng(43), minDist: 0.035, filter: (h) => h.n.z > 0.5 || h.n.y < -0.2 }),
    TUFT,
    { size: [0.022, 0.04], lean: 70, bend: 25, vary: 0.3, rng: rng(44), color: "#7a4558" },
  );

  // ----- head ---------------------------------------------------------------------------------------------------
  const HEADP = cel(
    paint((p, _n) => {
      const dx = Math.abs(p.x - HC.x);
      const dy = p.y - HC.y;
      const dz = p.z - HC.z;
      const u = (-dy - 0.014) / 0.038;
      if (dz > 0.03 && u > 0 && u < 1 && Math.abs(dx - (0.04 - 0.012 * u)) < 0.0046) return TEAR;
      const cheekEdge = -0.012 + 0.007 * zigzag(dx / 0.014);
      if (dz > -0.04 && dy < cheekEdge) return CREAM;
      if (dz > 0.02 && dy > 0.034 && dy < 0.054 && dx > 0.028 && dx < 0.062) return CREAM;
      if (dz > 0.025 && Math.hypot((dx - 0.046) / 0.028, (dy - 0.006) / 0.03) < 1) return "#b24a26";
      return mottle("#f6803a", "#ea682c", { size: 0.04, contrast: 1.2, seed: 5 });
    }),
  );

  const skull = b.part(new THREE.SphereGeometry(1, 16, 12), HEADP, {
    bone: head,
    at: HC,
    scale: [0.08, 0.068, 0.074],
    name: "skull",
  });
  const muzzle = b.part(new THREE.SphereGeometry(1, 12, 8), CREAM, {
    bone: head,
    at: head.local({ forward: 0.14, down: 0.016 }),
    scale: [0.03, 0.024, 0.032],
    name: "muzzle",
  });
  b.part(new THREE.SphereGeometry(1, 8, 6), NOSE, {
    bone: head,
    at: head.local({ forward: 0.171, down: 0.006 }),
    scale: [0.014, 0.01, 0.01],
    name: "nose",
  });
  b.part(new THREE.SphereGeometry(0.0028, 5, 4), CREAM, {
    bone: head,
    at: head.local({ forward: 0.178, up: 0.0 }),
  });
  b.part(new THREE.SphereGeometry(1, 10, 8), CREAM, {
    bone: jaw,
    at: head.local({ forward: 0.126, down: 0.035 }),
    scale: [0.026, 0.012, 0.034],
    name: "lowerJaw",
  });

  const skullSkin = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skullSkin.around(HC).at(s * 36, 6);
    if (!hit) throw new Error("no eye hit");
    b.decal(skullSkin, EYE, { at: hit, size: [0.037, 0.05], mirror: s > 0 });
  }
  const hitMouth = b.surface(muzzle).around(head.local({ forward: 0.14, down: 0.016 })).at(0, -10);
  if (hitMouth) b.decal(b.surface(muzzle), MOUTH, { at: hitMouth, dir: [0, 0, 1], size: [0.044, 0.028] });

  // cheek ruff
  b.cards(
    skullSkin.scatter(30, {
      rng: rng(51),
      minDist: 0.022,
      filter: (h) => Math.abs(h.n.x) > 0.5 && h.at.y < HC.y + 0.0 && h.at.z > HC.z - 0.03,
    }),
    TUFT,
    { size: [0.028, 0.05], lean: 75, bend: 20, vary: 0.25, rng: rng(52), color: "#fff4e2", flow: [0, -0.4, -1] },
  );
  b.cards(
    skullSkin.scatter(24, { rng: rng(53), minDist: 0.025, filter: (h) => h.n.y > 0.55 && h.at.z < HC.z + 0.03 }),
    TUFT,
    { size: [0.024, 0.04], lean: 75, bend: 20, vary: 0.25, rng: rng(54), color: "#f98f40" },
  );

  // whiskers
  for (const s of [1, -1])
    for (const [dy, dz, spread] of [
      [0.004, 0.0, 0.0],
      [-0.008, -0.004, 0.012],
      [-0.016, -0.01, 0.022],
    ] as const)
      b.sweep(
        catmull([
          head.local({ left: s * 0.026, forward: 0.14, down: 0.016 - dy }),
          head.local({ left: s * 0.07, forward: 0.148 + dz, down: 0.02 - dy + spread * 0.4 }),
          head.local({ left: s * 0.115, forward: 0.14 + dz, down: 0.032 - dy + spread }),
        ]),
        [0.0018, 0.0004],
        { color: WHISKER, bone: head, sides: 3, caps: "point" },
      );

  // ears
  for (const s of [1, -1]) {
    const earJoint = b.joint(`ear${s > 0 ? "L" : "R"}`, {
      parent: head,
      at: head.local({ left: s * 0.05, forward: 0.058, up: 0.052 }),
      aim: head.local({ left: s * 0.085, forward: 0.058, up: 0.1 }),
      role: "hinge",
    });
    const { x, y, t } = plane([0.46 * s, 1, -0.12], [0, 0.12, 1]);
    const EARP = cel(
      paint((_p, n, s2) => {
        if (n.dot(t) > 0.5) {
          const inner = ((s2[0] / 0.025) ** 2 + ((s2[1] - 0.034) / 0.032) ** 2) < 1;
          if (inner) return CREAM;
          return s2[1] > 0.06 ? DARK : "#f0702e";
        }
        return s2[1] > 0.058 ? DARK : "#e35d2a";
      }),
    );
    b.extrude(
      [
        [-0.036, 0],
        [0.036, 0],
        [0.043, 0.034],
        [0.016, 0.068],
        [-0.016, 0.068],
        [-0.043, 0.034],
      ],
      {
        at: earJoint.at,
        x,
        y,
        thickness: [0.016, 0.01],
        bevel: 0.004,
        smoothing: 2,
        color: EARP,
        bone: earJoint,
        name: `ear${s > 0 ? "L" : "R"}`,
      },
    );
  }

  // ----- legs ---------------------------------------------------------------------------------------------------
  const LEGP = cel("#573042", "#2f1a2e");
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // front
    const shoulder: [number, number, number] = [s * 0.062, Y + 0.17, 0.11];
    const frontToe: [number, number, number] = [s * 0.088, Y + 0.021, 0.25];
    const fpts = limb(shoulder, frontToe, [0.085, 0.085, 0.06], [[0, 0, -1]], { sole: [0, 0, 1] });
    const fl = b.chain(`legF${side}`, fpts, {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `paw${side}`],
      role: "leg",
    });
    const flSweep = b.sweep(fl, [0.032, 0.029, 0.025, 0.022, 0.024, 0.021], { color: LEGP, sides: 8 });
    b.part(new THREE.SphereGeometry(1, 10, 8), COAT, {
      bone: chest,
      at: [s * 0.068, Y + 0.165, 0.115],
      scale: [0.04, 0.052, 0.06],
    });

    // hind
    const hipP: [number, number, number] = [s * 0.07, Y + 0.165, -0.145];
    const hindToe: [number, number, number] = [s * 0.08, Y + 0.021, -0.06];
    const hpts = limb(hipP, hindToe, [0.095, 0.095, 0.085], [[0, 0, 1]], { sole: [0, 0, 1] });
    const hl = b.chain(`legH${side}`, hpts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`, `foot${side}`],
      role: "leg",
    });
    b.sweep(hl, [0.034, 0.03, 0.025, 0.022, 0.025, 0.021], { color: LEGP, sides: 8 });
    b.part(new THREE.SphereGeometry(1, 10, 8), COAT, {
      bone: hips,
      at: [s * 0.075, Y + 0.16, -0.13],
      scale: [0.05, 0.063, 0.076],
    });

    // toes and claws
    for (const [leg, toe] of [
      [fl, frontToe],
      [hl, hindToe],
    ] as const) {
      const tip = leg.tip!;
      for (const dx of [-0.012, 0, 0.012]) {
        b.part(new THREE.SphereGeometry(0.0115, 6, 4), LEGP, {
          bone: tip,
          at: [toe[0] + dx, toe[1] - 0.001, toe[2] + 0.004],
        });
        b.spike([toe[0] + dx, toe[1] - 0.002, toe[2] + 0.011], [0, -0.2, 1], 0.017, 0.0042, { color: CLAW, bone: tip, sides: 5 });
      }
    }

    // gold bracelet on each forearm
    const bracelet = b.surface(flSweep).loop(fl.at(0.62), { lift: 0.003 });
    b.sweep(bracelet, 0.005, { color: GOLD, bone: fl.joints[1] });
    const bracelet2 = b.surface(flSweep).loop(fl.at(0.58), { lift: 0.0 });
    b.sweep(bracelet2, [0.0035], { color: TEAL, bone: fl.joints[1] });
  }

  // ----- tail ---------------------------------------------------------------------------------------------------
  const tailPath = catmull([
    [0, Y + 0.2, -0.2],
    [0, Y + 0.2, -0.36],
    [0, Y + 0.25, -0.5],
    [0, Y + 0.37, -0.6],
    [0, Y + 0.5, -0.6],
  ]);
  const tail = b.chain("tail", tailPath, {
    parent: hips,
    count: 6,
    names: ["tail1", "tail2", "tail3", "tail4", "tail5", "tail6"],
    role: "tail",
  });
  const TAILP = cel(
    paint((_p, _n, s) => {
      const t = s[0];
      if (t > 0.9 + 0.02 * zigzag(s[1] / 40)) return "#5a2d38";
      const ring = (t * tailPath.length) / 0.09 + (s[1] / 360) * 0.18;
      return ring - Math.floor(ring) < 0.36 ? "#c9502a" : mottle("#f47c32", "#ea672c", { size: 0.06, seed: 9 });
    }),
  );
  const tailSweep = b.sweep(tail, [0.05, 0.066, 0.078, 0.076, 0.062, 0.04], { color: TAILP, sides: 12 });
  b.cards(
    b.surface(tailSweep).scatter(70, { rng: rng(61), minDist: 0.035 }),
    TUFT,
    { size: [0.028, 0.05], lean: 65, bend: 25, vary: 0.3, rng: rng(62), color: "#f98a3e", flow: [0, 0.1, -1] },
  );

  // gold ring and tassel near the tail's root
  const tailRing = b.surface(tailSweep).loop(tail.at(0.2), { lift: 0.004 });
  b.sweep(tailRing, [0.009, 0.006], { color: GOLD, bone: tail.joints[0], section: "box" });
  const tr = tailRing.at(0.5);
  b.cards([frame([tr.x, tr.y + 0.004, tr.z], [0, 1, 0])], TASSEL, {
    size: [0.03, 0.085],
    lean: 180,
    flow: [0, 0, 1],
    bone: tail.joints[0],
  });

  // ----- collar, pendant -----------------------------------------------------------------------------------------
  const collar = b.surface(neckSweep).loop(neck.at(0.62), { lift: 0.004 });
  b.sweep(collar, [0.012, 0.0065], { color: TEAL, bone: neck.joints[1], section: "box" });
  const cp = collar.at(0.5);
  const pendantAt: [number, number, number] = [cp.x, cp.y - 0.002, cp.z + 0.01];
  b.extrude(
    [
      [0, 0.004],
      [0.019, -0.012],
      [0.015, -0.036],
      [0, -0.054, "sharp"],
      [-0.015, -0.036],
      [-0.019, -0.012],
    ],
    { at: pendantAt, x: [1, 0, 0], y: [0, 1, 0], thickness: 0.008, bevel: 0.0025, smoothing: 2, color: GOLD, bone: neck.joints[1], name: "pendant" },
  );
  b.extrude(
    [
      [0, -0.005],
      [0.012, -0.015],
      [0.009, -0.032],
      [0, -0.045, "sharp"],
      [-0.009, -0.032],
      [-0.012, -0.015],
    ],
    {
      at: [pendantAt[0], pendantAt[1], pendantAt[2] + 0.003],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.007,
      smoothing: 1,
      color: TEAL,
      bone: neck.joints[1],
      name: "pendantInlay",
    },
  );
  glow(
    b.part(new THREE.IcosahedronGeometry(0.0072, 0), GEM, {
      bone: neck.joints[1],
      at: [pendantAt[0], pendantAt[1] - 0.022, pendantAt[2] + 0.009],
      flat: true,
      name: "gem",
    }),
    1.4,
  );
  b.cards([frame([pendantAt[0], pendantAt[1] - 0.052, pendantAt[2] + 0.002], [0, 1, 0])], TASSEL, {
    size: [0.026, 0.075],
    lean: 180,
    flow: [0, 0, 1],
    bone: neck.joints[1],
  });

  // a leaf tucked behind the left ear, with a gold bead
  {
    const o = plane([0.5, 0.8, 0.5], [0.35, 0.3, 1]);
    const at = head.local({ left: 0.07, forward: 0.03, up: 0.06 });
    b.extrude(LEAF_OUTLINE, {
      at,
      x: o.x,
      y: o.y,
      thickness: 0.004,
      smoothing: 1,
      scale: 1.6,
      color: leafPaint(1.6),
      bone: head,
      name: "earLeaf",
    } as never);
    b.part(new THREE.SphereGeometry(0.0085, 8, 6), GOLD, { bone: head, at: head.local({ left: 0.068, forward: 0.034, up: 0.057 }) });
  }

  // ----- drifting dendro seeds and leaves ------------------------------------------------------------------------
  for (const [x, y, z, r] of [
    [0.34, 0.56, 0.1, 0.012],
    [0.42, 0.68, -0.08, 0.009],
    [-0.32, 0.62, 0.22, 0.011],
    [-0.4, 0.5, -0.12, 0.008],
    [0.16, 0.78, 0.32, 0.007],
    [-0.14, 0.76, -0.28, 0.01],
    [0.26, 0.72, -0.34, 0.008],
    [-0.28, 0.76, 0.02, 0.007],
  ] as const)
    glow(
      b.part(new THREE.OctahedronGeometry(r, 0), GEM, {
        bone: base,
        at: [x, y, z],
        scale: [0.7, 1.35, 0.7],
        flat: true,
        name: "seed",
      }),
      1.3,
    );
  for (const [x, y, z, yd] of [
    [0.38, 0.6, 0.2, [0.3, 0.8, 0.5]],
    [-0.36, 0.56, -0.02, [-0.5, 0.7, 0.4]],
    [0.3, 0.8, -0.2, [0.4, -0.2, 0.9]],
    [-0.22, 0.68, 0.3, [-0.2, 0.5, -0.8]],
  ] as const) {
    const o = plane([...yd], [0.2, 1, 0.1]);
    b.extrude(LEAF_OUTLINE, {
      at: [x, y, z],
      x: o.x,
      y: o.y,
      thickness: 0.003,
      smoothing: 1,
      color: leafPaint(1),
      bone: base,
      name: "floatLeaf",
    });
  }

  return b.root;
}
