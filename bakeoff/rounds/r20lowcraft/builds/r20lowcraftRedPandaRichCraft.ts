import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { rng } from "../../../../src/math";
import { mottle, noise, paint } from "../../../../src/paint";
import { catmull } from "../../../../src/path";
import { svg } from "../../../../src/texture";
import { animeEye, cel, furEdge } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Red Panda on a Mossy Stone",
  description:
    "A cel-shaded anime red panda balancing on a moss-covered boulder, big shiny eyes, ringed tail raised for balance, a flower-and-tassel hair charm and glowing teal mushrooms.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

const TOP = 0.24; // height of the stone's flat top
const HC: [number, number, number] = [0, TOP + 0.3, 0.31]; // head centre

// ---------- palette (cel-shaded, hue-shifted shadows) ----------
const RUST = cel("#f27a2e");
const RUST_D = cel("#c9501c");
const DARK = cel("#52261c");
const CREAM = cel("#fff1d6", "#f2cfa6");
const TEAR = cel("#8a2e14");
const NOSE = "#2a1a22";
const CLAW = "#fbeed6";
const GOLD = "#f0bd4f";
const PINK = "#ffb3cc";
const TEAL = "#58f0d4";
const RING_A = cel("#f5792b");
const RING_B = cel("#b8431a");
const RING_TIP = cel("#5a2a1c");

const segDist = (p: THREE.Vector3, a: number[], b: number[]) => {
  const ab = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
  const ap = new THREE.Vector3(p.x - a[0], p.y - a[1], p.z - a[2]);
  const t = Math.min(1, Math.max(0, ap.dot(ab) / ab.lengthSq()));
  return ap.addScaledVector(ab, -t).length();
};

// ---------- stone paint: moss on upward faces, cool mottled rock below ----------
const STONE = cel(mottle("#8d93a6", "#6b7188", { size: 0.07, seed: 3 }));
const MOSS = cel(mottle("#86d04e", "#4e9a3c", { size: 0.06, seed: 5 }));
const stonePaint = paint((p, n) => {
  const m = n.y * 0.9 + (noise(p, 0.12, 2) - 0.5) * 0.9 + (p.y > 0.08 ? 0 : -0.25);
  return m > 0.38 ? MOSS : STONE;
});

// ---------- face paint ----------
const headPaint = paint((p) => {
  const x = Math.abs(p.x);
  const y = p.y - HC[1];
  const z = p.z - HC[2];
  const q = new THREE.Vector3(x, y, z);
  if (segDist(q, [0.035, -0.015, 0.066], [0.027, -0.037, 0.072]) < 0.0055) return TEAR;
  if (q.distanceTo(new THREE.Vector3(0.037, 0.043, 0.052)) < 0.014) return CREAM;
  if (q.distanceTo(new THREE.Vector3(0.064, -0.012, 0.03)) < 0.042) return CREAM;
  if (y < -0.05) return CREAM;
  if (x < 0.011 && y > 0.025 && z > -0.02) return RUST_D;
  return RUST;
});

const bodyPaint = cel(furEdge("#f27a2e", "#4f2219", { level: -0.2, teeth: 0.3, period: 0.035 }));
const legPaint = paint((p) => (p.y > TOP + 0.095 ? RUST_D : DARK));
const tailPaint = paint((_p, _n, s) => {
  if (s[0] > 0.94) return RING_TIP;
  return Math.floor(s[0] * 9) % 2 === 0 ? RING_A : RING_B;
});

export default function build() {
  const b = createBuilder({ name: "redPanda" });
  const random = rng(11);

  // ---------- skeleton ----------
  const root = b.joint("root", { at: [0, 0.12, 0] });
  const hips = b.joint("hips", { parent: root, at: [0, TOP + 0.19, -0.2], dir: [0, 0, 1] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, TOP + 0.19, -0.2],
      [0, TOP + 0.205, -0.07],
      [0, TOP + 0.21, 0.04],
      [0, TOP + 0.2, 0.16],
    ]),
    { parent: hips, role: "spine" },
  );
  const neck = b.chain(
    "neck",
    [
      [0, TOP + 0.2, 0.15],
      [0, TOP + 0.29, 0.26],
    ],
    { parent: spine.joints[spine.joints.length - 1], names: ["neck"], role: "neck" },
  );
  const head = b.joint("head", {
    parent: neck.joints[0],
    at: [0, TOP + 0.29, 0.26],
    dir: [0, 0.04, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, HC[1] - 0.03, HC[2] + 0.02],
    aim: [0, HC[1] - 0.045, HC[2] + 0.11],
    role: "jaw",
  });

  // ---------- the mossy stone ----------
  const stone = b.lathe(
    [
      [0, 0],
      [0.3, 0],
      [0.39, 0.04],
      [0.42, 0.12],
      [0.36, 0.2],
      [0.31, TOP],
      [0, TOP],
    ],
    { at: [0, 0, 0.02], segments: 9, color: stonePaint, bone: root, name: "stone" },
  );
  const pebbles: Array<[number, number, number, number]> = [
    [0.44, 0.0, 0.12, 0.07],
    [-0.42, 0.0, 0.18, 0.06],
    [0.3, 0.0, -0.36, 0.08],
    [-0.28, 0.0, -0.34, 0.05],
  ];
  for (const [x, , z, r] of pebbles)
    b.part(new THREE.IcosahedronGeometry(r, 0), stonePaint, {
      bone: root,
      at: [x, r * 0.35, z],
      scale: [1, 0.6, 0.9],
      flat: true,
      name: "pebble",
    });

  const MOSS_TUFT = svg(
    `<svg viewBox="0 0 32 32"><path d="M16 32 C14 20 8 12 4 4 C12 10 16 18 16 32Z" fill="#7fd04a"/><path d="M16 32 C16 18 18 8 20 0 C22 10 20 22 16 32Z" fill="#a6e65e"/><path d="M16 32 C20 22 26 14 30 8 C27 20 22 28 16 32Z" fill="#5ab03c"/></svg>`,
    { size: 128 },
  );
  const mossHits = b.surface(stone).scatter(60, {
    rng: rng(21),
    minDist: 0.04,
    filter: (h) => h.n.y > 0.55,
  });
  b.cards(mossHits, MOSS_TUFT, { size: [0.05, 0.045], lean: 15, vary: 0.4, spin: 180, cross: true, rng: rng(22) });

  const mushroom = (x: number, z: number, h: number, r: number) => {
    b.lathe(
      [
        [0, 0],
        [r * 0.22, 0],
        [r * 0.17, h * 0.5],
        [r * 0.22, h],
        [0, h],
      ],
      { at: [x, TOP - 0.004, z], segments: 6, color: CREAM, bone: root, name: "stalk" },
    );
    glow(
      b.lathe(
        [
          [0, 0],
          [r, 0],
          [r * 1.05, h * 0.15],
          [r * 0.7, h * 0.5],
          [0, h * 0.62],
        ],
        { at: [x, TOP + h * 0.88, z], segments: 8, color: TEAL, bone: root, name: "cap" },
      ),
      1.2,
    );
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI * 2 + x * 9;
      b.part(new THREE.SphereGeometry(r * 0.13, 5, 4), "#ffffff", {
        bone: root,
        at: [x + Math.cos(a) * r * 0.55, TOP + h * 0.88 + h * 0.5, z + Math.sin(a) * r * 0.55],
        name: "mushSpot",
      });
    }
  };
  mushroom(0.24, 0.13, 0.05, 0.034);
  mushroom(0.28, 0.06, 0.035, 0.024);
  mushroom(-0.25, 0.1, 0.055, 0.036);
  mushroom(-0.22, -0.14, 0.04, 0.028);

  // ---------- body ----------
  const body = b.sweep(spine, (t) => {
    const r = 0.07 + 0.032 * Math.sin(Math.PI * (0.15 + 0.75 * t));
    return [r, r - 0.003];
  }, { color: bodyPaint, name: "body" });
  b.sweep(neck, [0.075, 0.07], { color: bodyPaint, name: "neckTube" });

  const TUFT = svg(
    `<svg viewBox="0 0 24 48"><path d="M12 0 C20 14 24 34 12 48 C0 34 4 14 12 0Z" fill="#ffffff"/><path d="M12 6 C14 20 14 34 12 44" stroke="#d6d6d6" stroke-width="2" fill="none"/></svg>`,
    { size: 96 },
  );
  const furHits = b.surface(body).scatter(150, {
    rng: rng(31),
    minDist: 0.03,
    filter: (h) => h.n.y > 0.2,
  });
  b.cards(furHits, TUFT, {
    size: [0.035, 0.06],
    lean: 75,
    bend: 20,
    vary: 0.3,
    spin: 25,
    flow: [0, -0.1, -1],
    color: "#ee6f27",
    rng: rng(32),
  });

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // front legs: elbow back
    const fp = limb([s * 0.075, TOP + 0.15, 0.135], [s * 0.075, TOP + 0.03, 0.165], [0.07, 0.07], [0, 0, -1]);
    const fl = b.chain("legF" + side, fp, {
      parent: spine.joints[spine.joints.length - 1],
      names: [`shoulderF${side}`, `elbowF${side}`, `wristF${side}`],
      role: "leg",
    });
    b.sweep(fl, [0.044, 0.032], { color: legPaint, name: "legF" });
    // hind legs: knee forward
    const hp = limb([s * 0.08, TOP + 0.15, -0.15], [s * 0.08, TOP + 0.03, -0.12], [0.075, 0.075], [0, 0, 1]);
    const hl = b.chain("legH" + side, hp, {
      parent: spine.joints[0],
      names: [`hipH${side}`, `kneeH${side}`, `ankleH${side}`],
      role: "leg",
    });
    b.sweep(hl, [0.056, 0.032], { color: legPaint, name: "legH" });

    const paws: Array<[typeof fl, number, number]> = [
      [fl, s * 0.075, 0.165],
      [hl, s * 0.08, -0.12],
    ];
    for (const [chain, x, z] of paws) {
      const tip = chain.joints[chain.joints.length - 1];
      b.part(new THREE.SphereGeometry(1, 8, 6), DARK, {
        bone: tip,
        at: [x, TOP + 0.021, z + 0.012],
        scale: [0.036, 0.022, 0.05],
        name: "paw",
      });
      for (const k of [-1, 0, 1])
        b.spike([x + k * 0.014, TOP + 0.014, z + 0.05], [k * 0.15, -0.25, 1], 0.022, 0.0055, {
          color: CLAW,
          bone: tip,
          sides: 5,
          name: "claw",
        });
    }
  }

  // ---------- tail ----------
  const tail = b.chain(
    "tail",
    catmull([
      [0, TOP + 0.2, -0.2],
      [0, TOP + 0.21, -0.4],
      [0, TOP + 0.28, -0.58],
      [0, TOP + 0.4, -0.64],
      [0, TOP + 0.5, -0.57],
    ]),
    { parent: hips, role: "tail" },
  );
  const tailTube = b.sweep(tail, [0.05, 0.075, 0.08, 0.07, 0.045], { color: tailPaint, name: "tailTube" });
  const tailHits = b.surface(tailTube).scatter(90, { rng: rng(41), minDist: 0.035, filter: (h) => h.n.y > -0.1 });
  b.cards(tailHits, TUFT, {
    size: [0.035, 0.06],
    lean: 65,
    bend: 20,
    vary: 0.3,
    flow: [0, -0.1, -1],
    color: "#e0652a",
    rng: rng(42),
  });

  // ---------- head ----------
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), headPaint, {
    bone: head,
    at: HC,
    scale: [0.088, 0.072, 0.08],
    name: "skull",
  });
  b.part(new THREE.SphereGeometry(1, 10, 8), CREAM, {
    bone: head,
    at: [0, HC[1] - 0.02, HC[2] + 0.07],
    scale: [0.035, 0.03, 0.042],
    name: "muzzle",
  });
  b.part(new THREE.SphereGeometry(1, 8, 6), NOSE, {
    bone: head,
    at: [0, HC[1] - 0.012, HC[2] + 0.108],
    scale: [0.015, 0.011, 0.011],
    name: "nose",
  });
  b.part(new THREE.SphereGeometry(1, 10, 8), CREAM, {
    bone: jaw,
    at: [0, HC[1] - 0.062, HC[2] + 0.068],
    scale: [0.028, 0.014, 0.036],
    name: "lowerJaw",
  });

  // ears: dark rim, cream inner fluff
  const earOuter: Array<[number, number]> = [
    [-0.042, 0],
    [0.042, 0],
    [0.048, 0.03],
    [0.02, 0.07],
    [-0.02, 0.07],
    [-0.048, 0.03],
  ];
  const earInner: Array<[number, number]> = [
    [-0.028, 0.004],
    [0.028, 0.004],
    [0.032, 0.028],
    [0.014, 0.056],
    [-0.014, 0.056],
    [-0.032, 0.028],
  ];
  for (const s of [1, -1]) {
    const at = [s * 0.06, HC[1] + 0.05, HC[2] - 0.015];
    const x = [1, -0.4 * s, 0];
    const y = [0.4 * s, 1, 0];
    b.extrude(earOuter, { at, x, y, thickness: 0.018, bevel: 0.005, smoothing: 1, color: RUST_D, bone: head, name: "earOuter" });
    b.extrude(earInner, {
      at: [at[0], at[1], at[2] + 0.007],
      x,
      y,
      thickness: 0.014,
      smoothing: 1,
      color: CREAM,
      bone: head,
      name: "earInner",
    });
  }

  // anime eyes
  const EYE = animeEye({ iris: "#d98a1e", blush: false, brow: false, size: 256 });
  const skullSkin = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skullSkin.around(HC).at(s * 32, 8);
    if (hit) b.decal(skullSkin, EYE, { at: hit, size: [0.048, 0.064], mirror: s > 0, name: "eye" });
  }

  // whiskers
  for (const s of [1, -1])
    for (const k of [0, 1])
      b.rod(
        [s * 0.03, HC[1] - 0.025 - k * 0.008, HC[2] + 0.08],
        [s * 0.1, HC[1] - 0.03 - k * 0.022, HC[2] + 0.085],
        0.0015,
        { color: "#ffffff", bone: head, sides: 4, name: "whisker" },
      );

  // cheek ruff and forehead tufts
  const cheek = skullSkin.scatter(45, {
    rng: rng(51),
    minDist: 0.014,
    filter: (h) => Math.abs(h.at.x) > 0.05 && h.at.y < HC[1] && h.at.z > HC[2] - 0.04 && h.n.z > -0.2,
  });
  b.cards(cheek, TUFT, {
    size: [0.03, 0.04],
    lean: 70,
    bend: 30,
    vary: 0.3,
    flow: (f) => new THREE.Vector3(Math.sign(f.at.x), -0.2, -0.6),
    color: "#fff4de",
    rng: rng(52),
  });
  const crown = skullSkin.scatter(10, { rng: rng(53), minDist: 0.02, filter: (h) => h.n.y > 0.7 });
  b.cards(crown, TUFT, {
    size: [0.025, 0.04],
    lean: 40,
    flow: [0, 0, -1],
    color: "#e86d28",
    rng: rng(54),
    cross: true,
  });

  // ---------- hair charm: flower with gold centre and teal tassels ----------
  const charm = skullSkin.around(HC).at(130, 50);
  if (charm) {
    const petal = new THREE.SphereGeometry(0.013, 6, 4);
    b.ring(charm, { count: 5, radius: 0.02 }, (it) =>
      b.stick(petal, PINK, it, { embed: 0.3, scale: [0.9, 1.5, 0.5], name: "petal" }),
    );
    b.stick(new THREE.SphereGeometry(0.012, 6, 4), GOLD, charm, { embed: 0.2, name: "charmCentre" });
    const TASSEL = svg(
      `<svg viewBox="0 0 20 64"><g transform="translate(0,64) scale(1,-1)"><rect x="9" y="0" width="2" height="14" fill="#e8b84a"/><circle cx="10" cy="16" r="5" fill="#e8b84a"/><circle cx="10" cy="16" r="2" fill="#4fe0cf"/><path d="M5 20 L15 20 L18 62 L2 62Z" fill="#3fc9bb"/><path d="M7 22 L6 60 M10 22 L10 62 M13 22 L14 60" stroke="#2a9f96" stroke-width="1.4"/><rect x="4" y="20" width="12" height="3" fill="#e8b84a"/></g></svg>`,
      { size: 128 },
    );
    const roots = [0, 1].map((k) => frame(charm.moved([k * 0.014 - 0.007, 0.012, 0]), [0, 1, 0]));
    b.cards(roots, TASSEL, { size: [0.03, 0.09], lean: 180, flow: [0, 0, 1], rng: random });
  }

  return b.root;
}
