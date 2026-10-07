import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { rng } from "../src/math";
import { catmull } from "../src/path";
import { limb } from "../src/ik";
import { countershade, grain, mottle, paint } from "../src/paint";
import { svg } from "../src/texture";

export const meta = {
  name: "Arctic Fox",
  description:
    "A plump whimsical arctic fox in its fluffy winter coat: big round head, cheek ruffs, rosy cheeks, a huge bushy tail, a stripy knitted scarf and a snowflake on its nose.",
  style: "whimsical",
  commit: "88fc1f0",
};

const SNOW = "#f8fbfe";
const SNOW2 = "#eef4fa";
const FROST = "#e6eff8";
const BELLY = "#e0e9f4";
const NOSE = "#262733";
const EYE = "#1d1822";
const GLINT = "#ffffff";
const PINK = "#f2aab6";
const BLUSH = "#f9cdd3";
const TONGUE = "#ee7f90";
const MOUTH = "#4a2630";
const CLAW = "#4a4a58";
const BROW = "#bdd0e6";
const WHISK = "#cddbea";
const RED = "#e0503f";
const CREAM = "#fff0cc";
const TEAL = "#3f95a3";
const FLAKE = "#9fd5f5";
const GOLD = "#f2bd35";
const BELLSLOT = "#6b4a12";

export default function build() {
  const b = createBuilder({ name: "arcticFox" });

  // ---- surface textures ---------------------------------------------------
  const tuftA = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#e0e5ef"/><stop offset="0.5" stop-color="#f9fbfd"/><stop offset="1" stop-color="#ffffff"/></linearGradient></defs><path d="M16 64 C6 52 7 26 17 0 C25 26 26 52 16 64 Z" fill="url(#g)"/></svg>`,
    { size: 128 },
  );
  const tuftB = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#dce2ed"/><stop offset="0.5" stop-color="#f8fafc"/><stop offset="1" stop-color="#ffffff"/></linearGradient></defs><path d="M16 64 C5 52 3 30 6 4 C10 22 13 28 16 34 C19 28 22 22 26 4 C29 30 27 52 16 64 Z" fill="url(#g)"/></svg>`,
    { size: 128 },
  );
  const tassel = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 32"><path d="M8 32 C1 24 3 10 8 0 C13 10 15 24 8 32 Z" fill="#f2f2f2"/></svg>`,
    { size: 64 },
  );

  const coat = countershade(
    grain(mottle(SNOW, SNOW2, { size: 0.14, seed: 4 }), FROST, { size: 0.025, axis: "z", seed: 2 }),
    BELLY,
    { level: -0.3 },
  );

  // ---- skeleton -------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.215, -0.12], aim: [0, 0.218, -0.04], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.218, -0.04],
      [0, 0.23, 0.05],
      [0, 0.238, 0.14],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.tip!;

  const tailPath = catmull([
    [0, 0.225, -0.15],
    [0, 0.25, -0.24],
    [0, 0.255, -0.33],
    [0, 0.235, -0.41],
  ]);
  const tail = b.chain("tail", tailPath, {
    parent: hips,
    names: ["tail1", "tail2", "tail3", "tailTip"],
    role: "tail",
  });

  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.248, 0.12],
      [0, 0.28, 0.18],
      [0, 0.315, 0.225],
    ]),
    { parent: chest, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, 0.315, 0.225],
    dir: [0, -0.05, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.075, down: 0.05 }),
    aim: head.local({ forward: 0.16, down: 0.05 }),
    role: "jaw",
  });

  // ---- body -----------------------------------------------------------------
  const body = b.loft(
    [
      { at: [0, 0.205, -0.2], w: 0.17, h: 0.16 },
      { at: [0, 0.215, -0.13], w: 0.27, h: 0.25 },
      { at: [0, 0.225, -0.03], w: 0.292, h: 0.275 },
      { at: [0, 0.23, 0.06], w: 0.292, h: 0.28 },
      { at: [0, 0.24, 0.14], w: 0.255, h: 0.265 },
      { at: [0, 0.248, 0.19], w: 0.17, h: 0.2 },
    ],
    { bone: [hips, spine], color: coat, name: "body" },
  );
  const neckTube = b.sweep(neck, [0.085, 0.082], { color: coat, name: "neck" });

  const tailTube = b.sweep(tail, [0.05, 0.09, 0.112, 0.102, 0.07], { color: coat, name: "tailTube" });

  // ---- legs -----------------------------------------------------------------
  const legParts: THREE.Mesh[] = [];
  const pawParts: unknown[] = [];
  const fur = rng(21);
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";

    // front leg
    const fPts = limb([s * 0.105, 0.19, 0.1], [s * 0.105, 0.034, 0.118], [0.1, 0.098], [[0, 0, -1]]);
    const fLeg = b.chain(`legF${sd}`, fPts, {
      parent: spine.joints[1],
      names: [`shoulder${sd}`, `elbow${sd}`, `pawF${sd}`],
      role: "leg",
    });
    const fSweep = b.sweep(fLeg, [0.056, 0.042, 0.034], { color: coat, name: `legF${sd}` });
    legParts.push(...fSweep.meshes);
    const fPaw = fLeg.tip!;
    const fPawMesh = b.part(new THREE.SphereGeometry(1, 8, 6), coat, {
      at: [s * 0.105, 0.034, 0.13],
      scale: [0.042, 0.035, 0.058],
      bone: fPaw,
      name: `pawF${sd}`,
    });
    pawParts.push(fPawMesh);
    [-1, 0, 1].forEach((k, i) => {
      const toe = b.joint(`toeF${sd}${i + 1}`, {
        parent: fPaw,
        at: [s * 0.105 + k * 0.021, 0.03, 0.15],
        dir: [k * 0.12 * s, -0.05, 1],
        role: "digit",
      });
      b.capsule(toe.at, toe.local({ forward: 0.03 }), 0.0165, { color: coat, bone: toe, name: `toeF${sd}${i + 1}` });
      b.spike(toe.local({ forward: 0.04 }), [0, -0.25, 1], 0.016, 0.0065, { color: CLAW, bone: toe });
    });

    // hind leg
    const hPts = limb(
      [s * 0.105, 0.195, -0.095],
      [s * 0.11, 0.036, -0.115],
      [0.105, 0.095, 0.07],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const hLeg = b.chain(`legH${sd}`, hPts, {
      parent: hips,
      names: [`hip${sd}`, `knee${sd}`, `hock${sd}`, `pawH${sd}`],
      role: "leg",
    });
    const hSweep = b.sweep(hLeg, [0.07, 0.054, 0.04, 0.036], { color: coat, name: `legH${sd}` });
    legParts.push(...hSweep.meshes);
    b.part(new THREE.SphereGeometry(1, 8, 6), coat, {
      at: [s * 0.105, 0.19, -0.1],
      scale: [0.075, 0.088, 0.098],
      bone: hLeg.joints[0],
      name: `haunch${sd}`,
    });
    const hPaw = hLeg.tip!;
    const hPawMesh = b.part(new THREE.SphereGeometry(1, 8, 6), coat, {
      at: [s * 0.11, 0.034, -0.1],
      scale: [0.042, 0.035, 0.064],
      bone: hPaw,
      name: `pawH${sd}`,
    });
    pawParts.push(hPawMesh);
    [-1, 0, 1].forEach((k, i) => {
      const toe = b.joint(`toeH${sd}${i + 1}`, {
        parent: hPaw,
        at: [s * 0.11 + k * 0.021, 0.03, -0.068],
        dir: [k * 0.12 * s, -0.05, 1],
        role: "digit",
      });
      b.capsule(toe.at, toe.local({ forward: 0.03 }), 0.0165, { color: coat, bone: toe, name: `toeH${sd}${i + 1}` });
      b.spike(toe.local({ forward: 0.04 }), [0, -0.25, 1], 0.016, 0.0065, { color: CLAW, bone: toe });
    });
  }

  // ---- head -----------------------------------------------------------------
  const cranium = b.part(new THREE.SphereGeometry(1, 12, 9), coat, {
    at: head.local({ forward: 0.05 }),
    scale: [0.102, 0.092, 0.097],
    bone: head,
    name: "cranium",
  });
  const snout = b.sweep([head.local({ forward: 0.07, down: 0.004 }), head.local({ forward: 0.14, down: 0.012 })], [0.048, 0.031], {
    color: coat,
    bone: head,
    sides: 8,
    name: "snout",
  });
  // cheeks: soft puffs either side
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 8, 6), coat, {
      at: head.local({ left: s * 0.066, forward: 0.05, down: 0.05 }),
      scale: [0.045, 0.04, 0.05],
      bone: head,
      name: s > 0 ? "cheekL" : "cheekR",
    });
  }
  // lower jaw, own bone
  b.sweep([head.local({ forward: 0.082, down: 0.062 }), head.local({ forward: 0.142, down: 0.056 })], [0.036, 0.02], {
    color: coat,
    bone: jaw,
    sides: 8,
    name: "lowerJaw",
  });
  // mouth interior and tongue ride the jaw
  b.part(new THREE.SphereGeometry(1, 8, 6), MOUTH, {
    at: head.local({ forward: 0.1, down: 0.04 }),
    scale: [0.032, 0.014, 0.05],
    bone: jaw,
    name: "mouthInside",
  });
  b.part(new THREE.SphereGeometry(1, 8, 6), TONGUE, {
    at: head.local({ forward: 0.115, down: 0.046 }),
    scale: [0.02, 0.01, 0.034],
    bone: jaw,
    name: "tongue",
  });
  for (const s of [1, -1]) {
    b.spike(head.local({ left: s * 0.022, forward: 0.125, down: 0.036 }), [0, 1, 0], 0.014, 0.006, {
      color: GLINT,
      bone: jaw,
      caps: { end: "point" },
    });
    b.spike(head.local({ left: s * 0.02, forward: 0.13, down: 0.032 }), [0, -1, 0], 0.012, 0.0055, {
      color: GLINT,
      bone: head,
      caps: { end: "point" },
    });
  }
  b.pose(jaw, { axis: [1, 0, 0], deg: 9 }); // friendly, slightly open smile
  // nose
  const nose = b.part(new THREE.SphereGeometry(1, 8, 6), NOSE, {
    at: head.local({ forward: 0.162, down: 0.006 }),
    scale: [0.025, 0.019, 0.021],
    bone: head,
    name: "nose",
  });
  b.stick(new THREE.SphereGeometry(0.0055, 5, 4), GLINT, b.surface(nose).around(nose.at).at(18, 55)!, { embed: 0.3, name: "noseShine" });

  // eyes
  const cSurf = b.surface(cranium);
  for (const s of [1, -1]) {
    const hit = cSurf.around(cranium.at).at(s * 36, 14)!;
    const eye = b.stick(new THREE.SphereGeometry(0.023, 10, 8), EYE, hit, { embed: 0.5, bone: head, name: s > 0 ? "eyeL" : "eyeR" });
    const es = b.surface(eye);
    b.stick(new THREE.SphereGeometry(0.0085, 5, 4), GLINT, es.around(eye.at).at(s * 18, 40)!, { embed: 0.35, bone: head });
    b.stick(new THREE.SphereGeometry(0.0042, 5, 4), GLINT, es.around(eye.at).at(s * 58, -25)!, { embed: 0.35, bone: head });
    // blush
    b.stick(new THREE.SphereGeometry(0.022, 8, 5), BLUSH, cSurf.around(cranium.at).at(s * 68, -20)!, {
      embed: 0.7,
      scale: [1, 0.35, 1],
      bone: head,
      name: "blush",
    });
    // raised cheerful brow
    const browPath = catmull([
      head.local({ left: s * 0.04, forward: 0.118, up: 0.06 }),
      head.local({ left: s * 0.062, forward: 0.104, up: 0.07 }),
      head.local({ left: s * 0.085, forward: 0.075, up: 0.058 }),
    ]);
    b.sweep(cSurf.drape(browPath, { lift: 0.003 }), 0.0065, { color: BROW, bone: head, sides: 5, name: "brow" });
    // smile line on the cheek
    const smile = catmull([
      head.local({ left: s * 0.03, forward: 0.125, down: 0.03 }),
      head.local({ left: s * 0.05, forward: 0.092, down: 0.04 }),
      head.local({ left: s * 0.068, forward: 0.062, down: 0.03 }),
    ]);
    b.sweep(b.surface([cranium, snout]).drape(smile, { lift: 0.002 }), 0.0042, { color: MOUTH, bone: head, sides: 5, name: "smile" });

    // whiskers
    for (let i = 0; i < 3; i++) {
      const base = head.local({ left: s * 0.03, forward: 0.1, down: 0.008 + i * 0.012 });
      const wk = catmull([
        base,
        head.local({ left: s * 0.07, forward: 0.115 - i * 0.004, down: 0.004 + i * 0.022 }),
        head.local({ left: s * 0.11, forward: 0.1 - i * 0.008, down: -0.012 + i * 0.045 }),
      ]);
      b.sweep(wk, [0.0018, 0.0007], { color: WHISK, bone: head, sides: 3, caps: { end: "point" }, name: "whisker" });
    }

    // ears
    const ear = b.joint(`ear${s > 0 ? "L" : "R"}`, {
      parent: head,
      at: head.local({ left: s * 0.068, forward: 0.03, up: 0.07 }),
      dir: [s * 0.3, 1, -0.2],
      role: "hinge",
    });
    const earOutline: [number, number][] = [
      [-0.05, 0],
      [-0.046, 0.05],
      [0, 0.105],
      [0.046, 0.05],
      [0.05, 0],
    ];
    const ex: [number, number, number] = [1, -0.3 * s, 0];
    const ey: [number, number, number] = [s * 0.3, 1, -0.25];
    const earMesh = b.extrude(earOutline, {
      at: ear.at,
      x: ex,
      y: ey,
      thickness: 0.024,
      bevel: 0.008,
      smoothing: 2,
      color: coat,
      bone: ear,
      name: "ear",
    });
    const inner: [number, number][] = [
      [-0.03, 0.01],
      [-0.027, 0.05],
      [0, 0.088],
      [0.027, 0.05],
      [0.03, 0.01],
    ];
    b.extrude(inner, {
      at: earMesh.moved([0, 0, 0.0125]),
      x: ex,
      y: ey,
      thickness: 0.008,
      bevel: 0.002,
      smoothing: 1,
      color: PINK,
      bone: ear,
      name: "earInner",
    });
  }

  // snowflakes caught in the fur: forehead, back and tail
  const flakeShape = (r0: number, r1: number) => {
    const pts: [number, number, "sharp"][] = [];
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI) / 6;
      const r = i % 2 === 0 ? r0 : r1;
      pts.push([Math.cos(a) * r, Math.sin(a) * r, "sharp"]);
    }
    return pts;
  };
  const layFlake = (hit: { at: THREE.Vector3; n: THREE.Vector3 }, r0: number, bone: typeof head, lift: number, name: string) => {
    const up = hit.n.clone();
    const x: [number, number, number] = [1, 0, 0];
    const y: [number, number, number] = [0, up.z, -up.y];
    const p = hit.at.clone().addScaledVector(up, lift);
    b.extrude(flakeShape(r0, r0 * 0.36), { at: p, x, y, thickness: 0.004, color: FLAKE, bone, name });
    b.part(new THREE.CylinderGeometry(r0 * 0.3, r0 * 0.3, 0.006, 6), GLINT, {
      at: p.clone().addScaledVector(up, 0.003),
      dir: [up.x, up.y, up.z],
      bone,
      name: `${name}Core`,
    });
  };
  layFlake(cSurf.around(cranium.at).at(0, 62)!, 0.026, head, 0.003, "flakeBrow");

  // ---- scarf ----------------------------------------------------------------
  const ringItems = b.ring(frame([0, 0.25, 0.16], [0, 0.6, 1]), { count: 12, radius: 0.122 }).items;
  const scarfPath = catmull(ringItems, { closed: true });
  const scarfLen = scarfPath.length;
  const scarfClear = 0.05; // fur stays this far (m) from the scarf ring
  const stripe = paint((_p, _n, s) => {
    const k = Math.floor((s[0] * scarfLen) / 0.04) % 4;
    return k === 0 ? RED : k === 2 ? CREAM : k === 1 ? RED : TEAL;
  });
  b.sweep(scarfPath, 0.029, { color: stripe, bone: neck.joints[0], sides: 8, name: "scarf" });
  const knotItem = ringItems.reduce((best, it) =>
    it.at.distanceTo(new THREE.Vector3(0.12, 0.215, 0.2)) < best.at.distanceTo(new THREE.Vector3(0.12, 0.215, 0.2)) ? it : best,
  );
  const ky = knotItem.at.y;
  const kx = knotItem.at.x;
  b.part(new THREE.SphereGeometry(1, 8, 6), RED, {
    at: [kx, ky, knotItem.at.z + 0.01],
    scale: [0.04, 0.036, 0.04],
    bone: chest,
    name: "scarfKnot",
  });
  const skin = b.surface(body);
  const panelPaint = paint((_p, _n, s) => {
    const k = Math.floor((s[1] + 2) / 0.028) % 4;
    return k === 0 ? RED : k === 2 ? CREAM : k === 1 ? RED : TEAL;
  });
  const panels: [number, number, number, number][] = [
    [kx - 0.03, 0.05, 0.13, -0.005],
    [kx + 0.01, 0.05, 0.105, 0.012],
  ];
  for (const [x0, w, len, drift] of panels) {
    const corners = [
      [x0, ky - 0.01, 0],
      [x0 + w, ky - 0.01, 0],
      [x0 + w + drift, ky - len, 0],
      [x0 + drift, ky - len, 0],
    ].map(([x, y]) => {
      const h = skin.ray([x, y, 0.6], [0, 0, -1]);
      return h ? h.moved([0, 0.018, 0]) : frame([x, y, 0.235], [0, 0, 1]);
    });
    b.slab(corners, { color: panelPaint, thickness: 0.016, bone: chest, name: "scarfTail" });
    if (len > 0.12) {
      const bp = corners[3].at.clone().lerp(corners[2].at, 0.5);
      b.part(new THREE.SphereGeometry(0.014, 8, 6), GOLD, { at: [bp.x, bp.y - 0.018, bp.z + 0.004], bone: chest, name: "bell" });
      b.part(new THREE.BoxGeometry(0.02, 0.0035, 0.004), BELLSLOT, {
        at: [bp.x, bp.y - 0.022, bp.z + 0.017],
        bone: chest,
        name: "bellSlot",
      });
    }
    b.cards(
      [0.12, 0.88].map((k) => {
        const p = corners[3].at.clone().lerp(corners[2].at, k);
        return frame([p.x, p.y + 0.004, p.z + 0.004], [0, 1, 0]);
      }),
      tassel,
      { size: [0.018, 0.03], lean: 180, flow: [0, 0, 1], color: CREAM, bone: chest },
    );
  }

  // ---- fur cards -------------------------------------------------------------
  const bodySkin = b.surface(body);
  b.cards(
    bodySkin.scatter(760, {
      rng: fur,
      minDist: 0.019,
      filter: (h) => h.n.y > -0.5 && scarfPath.at(scarfPath.closestT(h.at)).distanceTo(h.at) > scarfClear,
    }),
    [tuftA, tuftA, tuftB],
    { size: [0.032, 0.05], lean: 68, bend: 20, vary: 0.3, rng: rng(5), color: coat },
  );
  b.cards(
    b.surface(tailTube).scatter(420, { rng: fur, minDist: 0.024, filter: (h) => h.n.y > -0.5 }),
    [tuftB, tuftA],
    { size: [0.045, 0.075], lean: 64, bend: 20, vary: 0.3, rng: rng(6), color: coat },
  );
  // long wispy fluff at the tail end
  b.cards(
    b.surface(tailTube).scatter(45, { rng: fur, minDist: 0.03, filter: (h) => h.at.z < -0.36 && h.n.y > -0.6 }),
    tuftB,
    { size: [0.055, 0.1], lean: 72, bend: 25, vary: 0.25, rng: rng(13), color: coat },
  );

  b.cards(
    b.surface(neckTube).scatter(40, {
      rng: fur,
      minDist: 0.03,
      filter: (h) => h.n.y > -0.2 && scarfPath.at(scarfPath.closestT(h.at)).distanceTo(h.at) > scarfClear,
    }),
    tuftA,
    { size: [0.035, 0.05], lean: 66, bend: 20, vary: 0.3, rng: rng(8), color: coat },
  );
  b.cards(
    cSurf.scatter(90, {
      rng: fur,
      minDist: 0.026,
      filter: (h) =>
        h.n.z < 0.3 && h.at.y < head.at.y + 0.07 && !(Math.abs(h.at.x) < 0.095 && h.at.z > head.at.z + 0.08) && h.n.y > -0.3,
    }),
    tuftA,
    { size: [0.03, 0.045], lean: 62, bend: 20, vary: 0.3, rng: rng(9), color: coat },
  );
  // big cheek ruff
  b.cards(
    cSurf.scatter(24, {
      rng: fur,
      minDist: 0.03,
      filter: (h) => Math.abs(h.at.x) > 0.07 && h.at.y < head.at.y - 0.01 && h.at.z < head.at.z + 0.1 && h.n.y > -0.7,
    }),
    tuftB,
    {
      size: [0.05, 0.075],
      lean: 70,
      bend: 20,
      vary: 0.25,
      rng: rng(10),
      flow: (f) => [Math.sign(f.at.x) * 0.7, -0.15, -0.8],
      color: coat,
    },
  );
  // fluff on legs and boots
  for (const m of pawParts) {
    b.cards(b.surface(m as never).scatter(10, { rng: fur, minDist: 0.03, filter: (h) => h.n.y > -0.2 }), tuftA, {
      size: [0.028, 0.04],
      lean: 60,
      vary: 0.25,
      rng: rng(11),
      color: coat,
    });
  }
  b.cards(
    b.surface(legParts).scatter(160, { rng: fur, minDist: 0.022, filter: (h) => h.n.y > -0.3 && h.at.y > 0.07 }),
    tuftA,
    { size: [0.032, 0.048], lean: 66, bend: 20, vary: 0.3, rng: rng(12), color: coat },
  );

  return b.root;
}
