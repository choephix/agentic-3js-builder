import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { rng } from "../src/math";
import { catmull, polyline } from "../src/path";
import { svg } from "../src/texture";

export const meta = {
  name: "Cloud Sheep",
  description:
    "A round, kawaii sheep whose fleece is a faceted pastel cloud: a small dark face with big sparkly eyes, floppy ears, a separate jaw, stubby legs with candy hooves, a ribbon collar with a rainbow charm and sparkle stickers floating around.",
};

// ---------------------------------------------------------------- palette
const WOOL = ["#ffffff", "#fff0f8", "#eef0ff", "#e8f6ff", "#f6eeff"];
const MID = ["#ffe6f3", "#ebe4ff", "#e0f7ee", "#ffffff"];
const HEM = ["#ffc6e0", "#d6c8ff", "#bfe6ff", "#ffd6ee"];
const CORE = "#f4f7ff";
const FACE = "#64499a";
const MUZZLE = "#8670b8";
const PINK = "#ff8fb8";
const EAR_IN = "#ffb3cf";
const HOOF = "#ff9ec6";
const RIBBON = "#ff6fa3";
const RIBBON_DK = "#e54f88";
const TAIL = "#ffe3f0";

// ---------------------------------------------------------------- drawings (flat fills only)
const EYE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 96">
    <ellipse cx="32" cy="55" rx="29" ry="38" fill="#241a42"/>
    <ellipse cx="32" cy="58" rx="23" ry="31" fill="#56d6f2"/>
    <ellipse cx="32" cy="72" rx="19" ry="14" fill="#a6f0ff"/>
    <ellipse cx="32" cy="55" rx="12" ry="17" fill="#241a42"/>
    <circle cx="21" cy="38" r="9" fill="#ffffff"/>
    <circle cx="41" cy="71" r="4.5" fill="#ffffff"/>
    <circle cx="44" cy="44" r="2.4" fill="#ffffff"/>
    <path d="M6 30 Q10 22 18 20" stroke="#241a42" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M22 9 Q32 3 42 9" stroke="#ffe9a8" stroke-width="5" fill="none" stroke-linecap="round"/>
  </svg>`,
  { size: 384 },
);

const BLUSH = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 28">
    <ellipse cx="24" cy="14" rx="22" ry="12" fill="#ff8fb8"/>
    <path d="M14 8 L10 20 M24 6 L20 22 M34 8 L30 20" stroke="#ff5f98" stroke-width="3" fill="none" stroke-linecap="round"/>
  </svg>`,
  { size: 192 },
);

const SMILE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 24">
    <path d="M5 5 Q13 21 24 10 Q35 21 43 5" stroke="#241a42" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  { size: 192 },
);

const FOREHEAD = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
    <path d="M16 2 L19.5 12.5 L30 16 L19.5 19.5 L16 30 L12.5 19.5 L2 16 L12.5 12.5 Z" fill="#ffe27a"/>
  </svg>`,
  { size: 128 },
);

// the charm is drawn flipped: a hanging card reads root edge on top
const CHARM = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 72"><g transform="translate(0,72) scale(1,-1)">
    <path d="M32 0 L32 32" stroke="#ff6fa3" stroke-width="6" fill="none"/>
    <path d="M6 66 L6 56 A26 26 0 0 1 58 56 L58 66 L48 66 L48 56 A16 16 0 0 0 16 56 L16 66 Z" fill="#ff6b8b"/>
    <path d="M13 66 L13 56 A19 19 0 0 1 51 56 L51 66 L41 66 L41 56 A9 9 0 0 0 23 56 L23 66 Z" fill="#ffd166"/>
    <path d="M20 66 L20 56 A12 12 0 0 1 44 56 L44 66 L38 66 L38 56 A6 6 0 0 0 26 56 L26 66 Z" fill="#7be0ad"/>
    <circle cx="11" cy="64" r="8" fill="#ffffff"/>
    <circle cx="53" cy="64" r="8" fill="#ffffff"/>
    <circle cx="17" cy="60" r="6" fill="#ffffff"/>
    <circle cx="47" cy="60" r="6" fill="#ffffff"/>
  </g></svg>`,
  { size: 256 },
);

const STAR_Y = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
    <path d="M16 1 L19.5 12.5 L31 16 L19.5 19.5 L16 31 L12.5 19.5 L1 16 L12.5 12.5 Z" fill="#ffe36b"/>
    <path d="M16 9 L17.6 14.4 L23 16 L17.6 17.6 L16 23 L14.4 17.6 L9 16 L14.4 14.4 Z" fill="#fff7c2"/>
  </svg>`,
  { size: 128 },
);
const STAR_P = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
    <path d="M16 1 L19.5 12.5 L31 16 L19.5 19.5 L16 31 L12.5 19.5 L1 16 L12.5 12.5 Z" fill="#ff9fd2"/>
    <path d="M16 9 L17.6 14.4 L23 16 L17.6 17.6 L16 23 L14.4 17.6 L9 16 L14.4 14.4 Z" fill="#ffd9ee"/>
  </svg>`,
  { size: 128 },
);
const STAR_M = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
    <path d="M16 1 L19.5 12.5 L31 16 L19.5 19.5 L16 31 L12.5 19.5 L1 16 L12.5 12.5 Z" fill="#8deccb"/>
    <path d="M16 9 L17.6 14.4 L23 16 L17.6 17.6 L16 23 L14.4 17.6 L9 16 L14.4 14.4 Z" fill="#d4fbee"/>
  </svg>`,
  { size: 128 },
);
const DROP = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 40">
    <path d="M16 2 C16 2 4 18 4 26 A12 12 0 0 0 28 26 C28 18 16 2 16 2 Z" fill="#79cbff"/>
    <path d="M10 26 A6 6 0 0 0 16 32" stroke="#ffffff" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  </svg>`,
  { size: 160 },
);
const HEART = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 30">
    <path d="M16 28 C2 18 2 6 10 4 C14 3 16 6 16 8 C16 6 18 3 22 4 C30 6 30 18 16 28 Z" fill="#ff8aa8"/>
    <circle cx="10" cy="10" r="2.6" fill="#ffd0dc"/>
  </svg>`,
  { size: 128 },
);

// a raindrop on a string, drawn flipped for a hanging card
const DROP_HANG = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 48"><g transform="translate(0,48) scale(1,-1)">
    <path d="M16 0 L16 14" stroke="#b9dcff" stroke-width="3" fill="none"/>
    <path d="M16 12 C16 12 5 26 5 33 A11 11 0 0 0 27 33 C27 26 16 12 16 12 Z" fill="#79cbff"/>
    <path d="M10.5 33 A5.5 5.5 0 0 0 16 38.5" stroke="#ffffff" stroke-width="3" fill="none" stroke-linecap="round"/>
  </g></svg>`,
  { size: 192 },
);

// ---------------------------------------------------------------- build
export default function build() {
  const b = createBuilder({ name: "cloudSheep" });
  const R = rng(11);

  // ---- skeleton
  const BY = 0.315; // body centre height
  const HY = 0.335; // head centre height
  const hips = b.joint("hips", { at: [0, BY, -0.12] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, BY, -0.12],
      [0, BY, 0],
      [0, BY, 0.12],
    ]),
    { parent: hips, names: ["spine1", "spine2"], role: "spine" },
  );
  const chest = spine.joints[1];
  const neck = b.chain(
    "neck",
    polyline([
      [0, BY - 0.09, 0.12],
      [0, HY - 0.03, 0.27],
    ]),
    { parent: chest, names: ["neck1"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[0], at: [0, HY - 0.03, 0.27], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, HY - 0.05, 0.3], aim: [0, HY - 0.052, 0.42], role: "jaw" });

  // ---- fleece core
  const bodyR = (t: number): [number, number] => [0.17 + 0.07 * Math.sin(Math.PI * t), 0.15 + 0.05 * Math.sin(Math.PI * t)];
  const core = b.sweep(spine, bodyR, { sides: 8, smooth: false, color: CORE, bone: spine });

  // ---- neck, head
  b.sweep(neck, 0.07, { sides: 6, smooth: false, color: FACE, caps: "flat" });
  const HC: [number, number, number] = [0, HY, 0.32];
  const skull = b.part(new THREE.SphereGeometry(1, 10, 7), FACE, {
    bone: head,
    at: HC,
    scale: [0.125, 0.11, 0.11],
    flat: true,
  });
  const muzzle = b.part(new THREE.SphereGeometry(1, 8, 6), MUZZLE, {
    bone: head,
    at: [0, HY - 0.03, 0.4],
    scale: [0.055, 0.04, 0.05],
    flat: true,
  });
  b.part(new THREE.SphereGeometry(1, 6, 4), PINK, {
    bone: head,
    at: [0, HY - 0.008, 0.447],
    scale: [0.02, 0.014, 0.014],
    flat: true,
  });
  b.part(new THREE.SphereGeometry(1, 8, 6), MUZZLE, {
    bone: jaw,
    at: [0, HY - 0.058, 0.378],
    scale: [0.048, 0.028, 0.048],
    flat: true,
  });

  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    const eye = skin.around(HC).at(s * 27, 24);
    if (eye) b.decal(skin, EYE, { at: eye, size: [0.058, 0.087], lift: 0.003 });
    const cheek = skin.around(HC).at(s * 52, -4);
    if (cheek) b.decal(skin, BLUSH, { at: cheek, size: [0.045, 0.026], lift: 0.003, roll: s * 12 });
  }
  const brow = skin.around(HC).at(0, 52);
  if (brow) b.decal(skin, FOREHEAD, { at: brow, size: [0.03, 0.03], lift: 0.003 });
  b.decal(b.surface(muzzle), SMILE, { at: [0, HY - 0.04, 0.447], dir: [0, 0, -1], size: [0.05, 0.025], lift: 0.002 });

  // ---- floppy ears
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const path = catmull([
      [s * 0.1, HY + 0.03, 0.31],
      [s * 0.16, HY + 0.03, 0.3],
      [s * 0.2, HY - 0.015, 0.29],
      [s * 0.215, HY - 0.075, 0.285],
    ]);
    const ear = b.chain(`ear${side}`, path, { parent: head, names: [`ear${side}1`, `ear${side}2`, `ear${side}3`], role: "hinge" });
    const w = (t: number): [number, number] => [0.011, 0.038 * Math.sin(Math.PI * (0.25 + 0.65 * t)) + 0.012];
    b.sweep(ear, w, { section: "box", color: FACE, caps: "flat" });
    b.sweep(
      ear,
      (t) => {
        const [, ry] = w(t);
        return [0.012, ry * 0.62];
      },
      { section: "box", color: EAR_IN, shift: [-s * 0.004, 0], from: 0.08, to: 0.9, caps: "flat" },
    );
  }

  // ---- ruff of fleece round the face, bangs, cheek tufts
  const ruff = b.ring(frame([0, HY + 0.01, 0.3], [0, 0, 1]), { count: 9, radius: 0.14, fromDeg: -100, toDeg: 100 });
  for (const item of ruff.items) {
    const r = 0.052 + 0.012 * R();
    b.stick(new THREE.IcosahedronGeometry(r, 1), WOOL[Math.floor(R() * WOOL.length)], item, {
      bone: head,
      embed: 0.5,
      spin: R() * 360,
      flat: true,
    });
  }
  for (const s of [1, -1]) {
    b.part(new THREE.IcosahedronGeometry(0.046, 1), WOOL[1], { bone: head, at: [s * 0.122, HY - 0.085, 0.29], flat: true });
  }
  b.part(new THREE.IcosahedronGeometry(0.05, 1), WOOL[0], { bone: head, at: [0.03, HY + 0.115, 0.37], flat: true });
  b.part(new THREE.IcosahedronGeometry(0.042, 1), WOOL[3], { bone: head, at: [-0.035, HY + 0.12, 0.385], flat: true });

  // ---- the cloud fleece: faceted puffs seated on the core
  const fleece = b.surface(core);
  const awayFromHead = (p: THREE.Vector3) => !(p.z > 0.14 && Math.abs(p.x) < 0.16 && p.y < 0.5);
  // white on top, sunset pastels towards the hem
  const wool = (y: number) => {
    const set = y < 0.2 ? HEM : y < 0.29 ? MID : WOOL;
    return set[Math.floor(R() * set.length)];
  };
  const big = [new THREE.IcosahedronGeometry(0.085, 1), new THREE.IcosahedronGeometry(0.1, 1), new THREE.IcosahedronGeometry(0.072, 1)];
  for (const hit of fleece.scatter(34, { rng: R, minDist: 0.11, filter: (h) => awayFromHead(h.at) && h.n.y > -0.75 })) {
    b.stick(big[Math.floor(R() * big.length)], wool(hit.at.y), hit, {
      embed: 0.5,
      flat: true,
      spin: R() * 360,
      scale: [0.9 + 0.3 * R(), 0.85 + 0.25 * R(), 0.9 + 0.3 * R()],
    });
  }
  const small = [new THREE.IcosahedronGeometry(0.05, 0), new THREE.IcosahedronGeometry(0.058, 1)];
  for (const hit of fleece.scatter(40, { rng: R, minDist: 0.07, filter: (h) => awayFromHead(h.at) })) {
    b.stick(small[Math.floor(R() * small.length)], wool(hit.at.y), hit, {
      embed: 0.5,
      flat: true,
      spin: R() * 360,
      scale: [0.9 + 0.3 * R(), 0.85 + 0.25 * R(), 0.9 + 0.3 * R()],
    });
  }
  // raindrops hanging from the hem on thin strings (cards hang from a frame facing up)
  const hem = fleece.scatter(7, { rng: R, minDist: 0.12, filter: (h) => h.n.y < -0.45 && Math.abs(h.at.z) < 0.22 });
  b.cards(
    hem.map((h) => frame([h.at.x, h.at.y - 0.02, h.at.z], [0, 1, 0])),
    DROP_HANG,
    { size: [0.04, 0.06], lean: 180, flow: [0, 0, 1], sink: 0, cross: true },
  );

  // ---- legs
  for (const sz of [1, -1]) {
    for (const sx of [1, -1]) {
      const n = `${sz > 0 ? "F" : "H"}${sx > 0 ? "L" : "R"}`;
      const z = sz * 0.15;
      const leg = b.chain(
        `leg${n}`,
        polyline([
          [sx * 0.12, 0.19, z],
          [sx * 0.125, 0.115, z + 0.01],
          [sx * 0.125, 0.05, z],
        ]),
        { parent: sz > 0 ? chest : hips, names: [`hip${n}`, `knee${n}`, `hoof${n}`], role: "leg" },
      );
      b.sweep(leg, [0.052, 0.042], { sides: 6, smooth: false, color: FACE });
      b.part(new THREE.CylinderGeometry(0.046, 0.05, 0.05, 6), HOOF, { bone: leg.tip ?? leg.joints[leg.joints.length - 1], at: [sx * 0.125, 0.025, z], flat: true });
      b.part(new THREE.IcosahedronGeometry(0.068, 1), WOOL[0], {
        bone: leg.joints[0],
        at: [sx * 0.122, 0.17, z],
        scale: [1.05, 0.85, 1.05],
        flat: true,
      });
    }
  }

  // ---- tail
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.36, -0.29],
      [0, 0.385, -0.35],
      [0, 0.4, -0.41],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tailTip"], role: "tail" },
  );
  b.sweep(tail, [0.04, 0.035], { sides: 6, smooth: false, color: TAIL });
  const tailEnd = tail.joints[tail.joints.length - 1];
  b.part(new THREE.IcosahedronGeometry(0.062, 1), TAIL, { bone: tailEnd, at: [0, 0.405, -0.43], flat: true });
  b.part(new THREE.IcosahedronGeometry(0.04, 0), WOOL[0], { bone: tailEnd, at: [0.035, 0.44, -0.415], flat: true });
  b.part(new THREE.IcosahedronGeometry(0.036, 0), WOOL[3], { bone: tailEnd, at: [-0.035, 0.375, -0.44], flat: true });

  // ---- ribbon collar, bow and rainbow charm
  const nc = neck.at(0.72);
  const band = b.ring(nc, { count: 8, radius: 0.088 });
  b.sweep(catmull(band.items, { closed: true }), [0.024, 0.012], { section: "box", color: RIBBON });
  let front = band.items[0];
  for (const it of band.items) if (it.at.z > front.at.z) front = it;
  const F = front.at;
  for (const s of [1, -1]) {
    b.part(new THREE.IcosahedronGeometry(0.03, 0), RIBBON, {
      bone: neck.joints[0],
      at: [s * 0.04, F.y + 0.004, F.z + 0.01],
      scale: [1.3, 0.85, 0.6],
      rotation: [0, 0, s * 18],
      flat: true,
    });
  }
  b.part(new THREE.IcosahedronGeometry(0.014, 0), RIBBON_DK, { bone: neck.joints[0], at: [0, F.y + 0.004, F.z + 0.014], flat: true });
  b.cards([frame([0, F.y - 0.01, F.z + 0.012], [0, 1, 0])], CHARM, {
    size: [0.105, 0.118],
    lean: 180,
    flow: [0, 0, 1],
    sink: 0,
    bone: neck.joints[0],
  });

  // ---- sparkle cards around the fleece
  const sparkles: Array<[number, number, number, number]> = [
    [0.33, 0.3, 0.2, 0.08],
    [-0.35, 0.4, 0.04, 0.07],
    [0.28, 0.5, -0.12, 0.065],
    [-0.27, 0.5, 0.22, 0.06],
    [0.27, 0.4, 0.4, 0.055],
    [-0.25, 0.2, 0.4, 0.07],
    [-0.32, 0.15, -0.2, 0.06],
    [0.35, 0.12, -0.06, 0.055],
    [0.05, 0.46, -0.33, 0.06],
    [-0.13, 0.44, -0.32, 0.05],
    [0.2, 0.22, 0.46, 0.05],
  ];
  const cardTex = [STAR_Y, STAR_P, DROP, STAR_M, HEART, STAR_Y, STAR_P, DROP, STAR_M, HEART, STAR_Y];
  sparkles.forEach(([x, y, z, sz], i) => {
    b.cards([frame([x, y, z], [0, 1, 0])], cardTex[i], { size: sz, cross: true, sink: 0, bone: hips, flow: [0, 0, 1] });
  });

  return b.root;
}
