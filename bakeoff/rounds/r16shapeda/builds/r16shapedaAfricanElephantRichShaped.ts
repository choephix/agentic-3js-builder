import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { Fill, JointRef } from "../../../../src/context";
import { rng } from "../../../../src/math";
import { cells, mix, noise, paint, smoothstep } from "../../../../src/paint";
import { catmull } from "../../../../src/path";
import type { Chain } from "../../../../src/skeleton";
import { svg } from "../../../../src/texture";

export const meta = {
  name: "African Bush Elephant",
  description:
    "An adult African bush elephant in a neutral rest pose: faceted dust-bathed hide with wrinkle paint, fan ears with veins, curved ivory tusks, ringed trunk, hairy tail tuft, toenailed feet and a separate lower jaw.",
};

type P3 = [number, number, number];

// ---------------------------------------------------------------------------------------------------------------
// Palette

const SK_L = "#948f8a";
const SK_M = "#7c7773";
const SK_D = "#5a5551";
const DUST = "#a98a6a";
const DUST2 = "#8d6e53";
const PINK = "#a9877f";
const IV_L = "#efe4c8";
const IV_D = "#cdb88c";
const IV_STAIN = "#8a6a3a";
const NAIL = "#d9ceb9";
const SOLE = "#4a4541";
const HAIR = "#2a211c";
const MOUTH = "#52302f";
const LIP = "#8d6c66";
const TIPCOL = "#8a7a74";
const NOSTRIL = "#1b1412";

// ---------------------------------------------------------------------------------------------------------------
// Paints

/** Faceted-hide colour: drifting greys, wrinkle cells, horizontal folds, dust on the back and the lower body. */
const skin = paint((p, n) => {
  const drift = noise(p, 0.6, 3);
  let c = mix(SK_M, SK_L, smoothstep(0.3, 0.7, drift));
  const w = cells(p, 0.2, 5);
  c = mix(c, SK_D, 0.5 * smoothstep(0.14, 0.02, w.d2 - w.d1));
  const fold = Math.sin(p.y * 33 + noise(p, 0.35, 9) * 9);
  c = mix(c, SK_D, 0.22 * smoothstep(0.8, 1, fold));
  const low = smoothstep(1.5, 0.25, p.y) * (0.45 + 0.55 * noise(p, 0.3, 11));
  const top = smoothstep(0.35, 0.9, n.y) * (0.25 + 0.5 * noise(p, 0.45, 13));
  c = mix(c, DUST, Math.min(0.75, low * 0.8 + top * 0.55));
  c = mix(c, DUST2, 0.3 * smoothstep(0.6, 0.8, noise(p, 0.15, 17)) * (low + 0.2));
  const k = 0.82 + 0.26 * smoothstep(-0.9, 0.7, n.y);
  return [c[0] * k, c[1] * k, c[2] * k];
});

/** Ear: skin with a pink blushing centre, radiating veins and a darker rim. s = outline (u out, v up) in metres. */
const earSkin = paint((p, n, s) => {
  const base = skin.at(p, n);
  const d = Math.hypot(s[0] - 0.5, (s[1] + 0.35) * 0.85);
  const pink = smoothstep(0.55, 0.25, d) * (0.4 + 0.6 * noise(p, 0.2, 21));
  let c = mix(base, PINK, 0.55 * pink);
  const a = Math.atan2(s[1] + 0.12, s[0] + 0.02);
  const vein = Math.abs(Math.sin(a * 11 + noise(p, 0.25, 23) * 3));
  c = mix(c, "#5c4a47", 0.5 * smoothstep(0.93, 0.99, vein) * smoothstep(0.1, 0.3, Math.hypot(s[0], s[1] + 0.12)));
  c = mix(c, SK_D, 0.6 * smoothstep(0.5, 0.62, d));
  return c;
});

/** Trunk: the hide plus dark ridge bands across its length and a pinker underside near the tip. */
const trunkSkin = paint((p, n, s) => {
  const base = skin.at(p, n);
  const ridge = Math.sin(s[0] * 190);
  let c = mix(base, SK_D, 0.35 * smoothstep(0.5, 1, ridge));
  const belly = smoothstep(70, 20, Math.abs((((s[1] % 360) + 360) % 360) - 180));
  c = mix(c, LIP, 0.45 * smoothstep(0.7, 1, s[0]) * belly);
  return c;
});

/** Ivory: streaks round the tusk, a stained root and a pale polished tip. s = [t, deg]. */
const tuskPaint = paint((p, _n, s) => {
  const streak = 0.5 + 0.5 * Math.sin(s[1] * 0.35 + noise(p, 0.1, 31) * 4);
  let c = mix(IV_D, IV_L, 0.4 + 0.5 * streak);
  c = mix(c, IV_STAIN, 0.7 * smoothstep(0.3, 0.0, s[0]));
  c = mix(c, "#f6efe0", 0.5 * smoothstep(0.8, 1, s[0]));
  return mix(c, "#7a5a36", 0.22 * noise(p, 0.12, 33));
});

// ---------------------------------------------------------------------------------------------------------------
// Textures

function eyeTexture() {
  let lashes = "";
  for (let i = 0; i < 9; i += 1) {
    const x = 10 + i * 5.5;
    const dx = (x - 32) / 30;
    const y = 24 - 14 * Math.sqrt(Math.max(0, 1 - dx * dx));
    const ox = x + dx * 5;
    const oy = y - 6.5 + Math.abs(dx) * 3;
    lashes += `<path d="M${x.toFixed(1)} ${(y + 1).toFixed(1)} L${ox.toFixed(1)} ${oy.toFixed(1)}" stroke="#241c18" stroke-width="2.2" stroke-linecap="round" fill="none"/>`;
  }
  return svg(
    `<svg viewBox="0 0 64 40" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="32" cy="24" rx="30" ry="14" fill="#6a625d"/>
      <ellipse cx="32" cy="24" rx="30" ry="14" fill="none" stroke="#3a332f" stroke-width="2.4"/>
      <path d="M5 22 Q32 7 59 22" fill="none" stroke="#3f3834" stroke-width="2" stroke-linecap="round"/>
      <path d="M8 30 Q32 40 56 30" fill="none" stroke="#4a423e" stroke-width="2" stroke-linecap="round"/>
      <ellipse cx="32" cy="24" rx="17" ry="9.5" fill="#24150d"/>
      <circle cx="32" cy="24" r="8.6" fill="#8f5d1b"/>
      <circle cx="32" cy="24.5" r="6.3" fill="#c99236"/>
      <circle cx="32" cy="24" r="4" fill="#0b0605"/>
      <circle cx="27.8" cy="20.6" r="2.3" fill="#ffffff"/>
      <circle cx="36.4" cy="27.6" r="1.1" fill="#ffffff"/>
      ${lashes}
    </svg>`,
    { size: 256 },
  );
}

const EYE_TEX = eyeTexture();

const CREASE = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 40 Q24 30 40 36 T60 28" fill="none" stroke="#4c4642" stroke-width="3.2" stroke-linecap="round"/>
    <path d="M20 12 Q26 28 22 50" fill="none" stroke="#4c4642" stroke-width="3" stroke-linecap="round"/>
    <path d="M38 36 Q46 46 44 58" fill="none" stroke="#4c4642" stroke-width="3" stroke-linecap="round"/>
    <path d="M10 20 Q18 22 24 18" fill="none" stroke="#5a5450" stroke-width="3" stroke-linecap="round"/>
  </svg>`,
  { size: 128 },
);

const BRISTLE = svg(
  `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 64 Q14 40 6 6" fill="none" stroke="#2e2621" stroke-width="2.8" stroke-linecap="round"/>
    <path d="M16 64 Q16 36 14 2" fill="none" stroke="#2e2621" stroke-width="2.8" stroke-linecap="round"/>
    <path d="M16 64 Q18 36 22 3" fill="none" stroke="#2e2621" stroke-width="2.8" stroke-linecap="round"/>
    <path d="M16 64 Q20 44 28 12" fill="none" stroke="#2e2621" stroke-width="2.8" stroke-linecap="round"/>
    <path d="M16 64 Q12 46 2 24" fill="none" stroke="#2e2621" stroke-width="2.8" stroke-linecap="round"/>
  </svg>`,
  { size: 128 },
);

const MUD = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 40 Q6 22 24 18 Q38 8 50 22 Q60 34 48 48 Q34 58 18 52 Q8 50 8 40Z" fill="#8b6d51"/>
    <path d="M20 36 Q24 26 36 28 Q44 34 38 44 Q28 48 20 36Z" fill="#6f553f"/>
    <circle cx="54" cy="12" r="5" fill="#8b6d51"/>
    <circle cx="10" cy="10" r="3.5" fill="#6f553f"/>
  </svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------------------------------------------------------
// Small helpers

const keyed = (keys: number[]) => (t: number) => {
  const f = Math.min(Math.max(t, 0), 1) * (keys.length - 1);
  const i = Math.min(Math.floor(f), keys.length - 2);
  return keys[i] + (keys[i + 1] - keys[i]) * (f - i);
};

export default function build() {
  const b = createBuilder({ name: "africanElephant", detail: 1, paintSize: 1024 });
  const sides = [1, -1];
  const tag = (s: number) => (s > 0 ? "L" : "R");

  /** A flat-shaded ellipsoid part with radii r, in model space, on a bone. */
  const ell = (name: string, at: P3, r: P3, color: Fill, bone: JointRef, group: string, seg: [number, number] = [10, 7]) =>
    b.part(new THREE.SphereGeometry(1, seg[0], seg[1]), color, { bone, at, scale: r, flat: true, name, group });

  /** Thin ridge rings round a chain's tube at the given t values. */
  const ringsOn = (chain: Chain, ts: number[], radius: (t: number) => number, tube: number, color: Fill, group: string, prefix: string) => {
    ts.forEach((t, i) => {
      const cp = chain.at(t);
      b.part(new THREE.TorusGeometry(radius(t), tube, 3, 10), color, {
        at: cp.at,
        dir: cp.tangent,
        axis: "z",
        bone: cp.bone ?? undefined,
        flat: true,
        group,
        name: `${prefix}${i}`,
      });
    });
  };

  // -------------------------------------------------------------------------------------------------------------
  // Skeleton: root hips, a five-joint spine, neck, head with a separate jaw, ear hinges, trunk, tail and four legs.
  const hips = b.joint("hips", { at: [0, 2.26, -1.0], role: "spine", group: "body" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 2.3, -1.7],
      [0, 2.26, -1.0],
      [0, 2.2, -0.1],
      [0, 2.3, 0.7],
      [0, 2.32, 1.3],
    ]),
    {
      parent: hips,
      names: ["spineRear", "spineHip", "spineMid", "spineShoulder", "spineChest"],
      role: "spine",
      group: "body",
    },
  );
  const spineTip = spine.joints[spine.joints.length - 1];

  const neck = b.chain(
    "neck",
    catmull([
      [0, 2.35, 1.2],
      [0, 2.45, 1.5],
      [0, 2.55, 1.78],
    ]),
    { parent: spineTip, names: ["neckBase", "neckMid", "neckTip"], role: "neck", group: "body" },
  );
  const head = b.joint("head", {
    parent: neck.joints[neck.joints.length - 1],
    at: [0, 2.6, 1.82],
    aim: [0, 2.45, 2.4],
    group: "head",
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 2.15, 1.95],
    aim: [0, 1.95, 2.45],
    group: "head",
    role: "jaw",
  });

  const trunkPts: P3[] = [
    [0, 2.4, 2.32],
    [0, 1.95, 2.62],
    [0, 1.4, 2.8],
    [0, 0.9, 2.84],
    [0, 0.55, 2.86],
    [0, 0.32, 2.9],
  ];
  const trunk = b.chain("trunk", catmull(trunkPts), {
    parent: head,
    names: ["trunk1", "trunk2", "trunk3", "trunk4", "trunk5", "trunkTip"],
    role: "tentacle",
    group: "trunk",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 2.35, -2.2],
      [0, 2.0, -2.42],
      [0, 1.45, -2.5],
      [0, 0.9, -2.48],
      [0, 0.5, -2.45],
    ]),
    {
      parent: spine.joints[0],
      names: ["tail1", "tail2", "tail3", "tail4", "tailTip"],
      role: "tail",
      group: "tail",
    },
  );

  const legR = (t: number) => (t < 0.3 ? 0.44 - 0.3 * t : 0.35 - 0.0857 * (t - 0.3));
  const legs = [] as { chain: Chain; s: number; front: boolean }[];
  for (const s of sides) {
    const S = tag(s);
    const x = s * 0.56;
    const front = b.chain(
      `leg${S}F`,
      catmull([
        [x, 2.05, 0.85],
        [x, 1.35, 0.86],
        [x, 0.7, 0.92],
        [x, 0.28, 0.9],
      ]),
      {
        parent: spine.joints[3],
        names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `footF${S}`],
        role: "leg",
        group: "legs",
        contact: [x, 0, 0.9],
      },
    );
    const hind = b.chain(
      `leg${S}H`,
      catmull([
        [x, 2.0, -1.35],
        [x, 1.3, -1.22],
        [x, 0.7, -1.35],
        [x, 0.28, -1.3],
      ]),
      {
        parent: spine.joints[1],
        names: [`hip${S}`, `knee${S}`, `ankle${S}`, `footH${S}`],
        role: "leg",
        group: "legs",
        contact: [x, 0, -1.3],
      },
    );
    legs.push({ chain: front, s, front: true }, { chain: hind, s, front: false });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Body: one continuous faceted barrel over the spine, a thick neck, and the shoulder / ham masses on the legs.
  const rxK = keyed([0.45, 0.7, 0.8, 0.83, 0.82, 0.74, 0.52]);
  const ryK = keyed([0.62, 0.88, 0.96, 0.98, 0.97, 0.92, 0.72]);
  const bodySweep = b.sweep(spine, (t) => [rxK(t), ryK(t)] as [number, number], {
    color: skin,
    section: { ngon: 10 },
    shift: (t) => [0, -0.1 * Math.sin(Math.PI * t)] as [number, number],
    group: "body",
    name: "torso",
  });
  const neckSweep = b.sweep(neck, [0.64, 0.6, 0.56], {
    color: skin,
    section: { ngon: 10 },
    group: "body",
    name: "neck",
  });

  // -------------------------------------------------------------------------------------------------------------
  // Legs: pillar tubes, joint ridges, round feet with toenails, shoulder and ham masses.
  const legSweeps = [];
  for (const { chain, s, front } of legs) {
    const S = tag(s);
    const label = `${front ? "F" : "H"}${S}`;
    legSweeps.push(
      b.sweep(chain, legR, {
        color: skin,
        section: { ngon: 9 },
        caps: { start: "round", end: "flat" },
        group: "legs",
        name: `leg${label}`,
      }),
    );
    ringsOn(chain, front ? [0.52, 0.58, 0.9] : [0.5, 0.56, 0.9], legR, 0.024, skin, "legs", `legFold${label}`);

    const root = chain.joints[0];
    const foot = chain.joints[chain.joints.length - 1];
    if (front) ell(`shoulder${S}Mass`, [s * 0.5, 2.1, 0.85], [0.38, 0.7, 0.6], skin, root, "legs");
    else ell(`ham${S}Mass`, [s * 0.5, 1.95, -1.35], [0.36, 0.7, 0.62], skin, root, "legs");

    // Foot: padded drum, dark sole, toenails round the front edge.
    const fx = s * 0.56;
    const fz = front ? 0.9 : -1.3;
    b.part(new THREE.CylinderGeometry(0.31, 0.35, 0.28, 10), skin, {
      bone: foot,
      at: [fx, 0.14, fz],
      flat: true,
      group: "feet",
      name: `foot${label}`,
    });
    b.part(new THREE.CylinderGeometry(0.36, 0.37, 0.05, 10), SOLE, {
      bone: foot,
      at: [fx, 0.025, fz],
      flat: true,
      group: "feet",
      name: `sole${label}`,
    });
    const nailAngles = front ? [-48, -16, 16, 48] : [-38, 0, 38];
    nailAngles.forEach((a, i) => {
      const r = 0.34;
      b.part(new THREE.BoxGeometry(0.11, 0.13, 0.07), NAIL, {
        bone: foot,
        at: [fx + Math.sin((a * Math.PI) / 180) * r, 0.12, fz + Math.cos((a * Math.PI) / 180) * r],
        rotation: [0, a, 0],
        flat: true,
        group: "feet",
        name: `nail${label}${i}`,
      });
    });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Head: big domed cranium, face, cheeks, trunk boss, lips and the separate lower jaw.
  const cranium = ell("cranium", [0, 2.8, 1.85], [0.54, 0.62, 0.58], skin, head, "head", [12, 8]);
  ell("face", [0, 2.48, 2.12], [0.44, 0.6, 0.44], skin, head, "head", [12, 8]);
  ell("trunkBoss", [0, 2.3, 2.4], [0.4, 0.42, 0.3], skin, head, "head");
  ell("mouthInside", [0, 2.12, 2.25], [0.26, 0.1, 0.2], MOUTH, head, "head", [8, 5]);
  for (const s of sides) {
    const S = tag(s);
    ell(`cheek${S}`, [s * 0.36, 2.5, 2.05], [0.26, 0.32, 0.34], skin, head, "head");
    ell(`tuskLip${S}`, [s * 0.3, 2.08, 2.3], [0.15, 0.13, 0.15], skin, head, "head", [8, 6]);
  }
  ell("lowerJaw", [0, 1.98, 2.18], [0.3, 0.15, 0.36], skin, jaw, "head");
  ell("lowerLip", [0, 1.97, 2.45], [0.2, 0.08, 0.12], LIP, jaw, "head", [8, 5]);

  // Tusks: long, curved, tapering ivory with a stained root.
  for (const s of sides) {
    const S = tag(s);
    b.sweep(
      catmull([
        [s * 0.3, 2.08, 2.3],
        [s * 0.4, 1.84, 2.72],
        [s * 0.45, 1.64, 3.22],
        [s * 0.42, 1.72, 3.72],
      ]),
      [0.09, 0.06, 0.03, 0.012],
      { bone: head, color: tuskPaint, section: { ngon: 7 }, caps: { start: "flat", end: "point" }, group: "tusks", name: `tusk${S}` },
    );
  }

  // Eyes (drawn decals on the cranium), brow ridges and lower-lid pouches seated on the skull.
  const skull = b.surface(cranium);
  for (const s of sides) {
    const S = tag(s);
    const hit = skull.around([0, 2.8, 1.85]).at(s * 66, 0);
    if (!hit) continue;
    b.decal(skull, EYE_TEX, { at: hit, size: [0.15, 0.094], lift: 0.003, group: "face", name: `eye${S}` });
    const brow = skull.nearest(hit.local({ up: 0.075 }));
    b.stick(new THREE.SphereGeometry(0.11, 8, 5).scale(1.2, 0.5, 0.7), skin, brow, { embed: 0.3, flat: true, group: "face", name: `brow${S}` });
    const pouch = skull.nearest(hit.local({ down: 0.06 }));
    b.stick(new THREE.SphereGeometry(0.085, 8, 5).scale(1.2, 0.45, 0.6), skin, pouch, { embed: 0.3, flat: true, group: "face", name: `pouch${S}` });
  }

  // Ears: big veined fans on hinge joints, flared out and back.
  const EAR: [number, number][] = [
    [0, 0.05],
    [0.18, 0.3],
    [0.5, 0.38],
    [0.82, 0.25],
    [0.98, -0.05],
    [0.95, -0.45],
    [0.78, -0.82],
    [0.5, -1.05],
    [0.28, -0.95],
    [0.14, -0.7],
    [0.05, -0.4],
    [0, -0.1],
  ];
  for (const s of sides) {
    const S = tag(s);
    const ex = new THREE.Vector3(s * 0.9, 0, -0.45).normalize();
    const earJoint = b.joint(`ear${S}`, {
      parent: head,
      at: [s * 0.46, 3.0, 1.62],
      dir: ex,
      group: "ears",
      role: "hinge",
    });
    b.extrude(EAR, {
      at: earJoint.at,
      x: ex,
      y: [0, 1, 0],
      thickness: [0.02, 0.075],
      bevel: 0.012,
      smoothing: 1,
      color: earSkin,
      bone: earJoint,
      group: "ears",
      name: `ear${S}Flap`,
    });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Trunk: tapering ringed tube, ridge rings, tip pad with nostrils and a finger.
  const trunkR = keyed([0.37, 0.31, 0.25, 0.2, 0.16, 0.125]);
  b.sweep(trunk, trunkR, {
    color: trunkSkin,
    section: { ngon: 10 },
    caps: { start: "flat", end: "flat" },
    group: "trunk",
    name: "trunk",
  });
  const ridgeTs: number[] = [];
  for (let t = 0.08; t < 0.97; t += 0.055) ridgeTs.push(t);
  ringsOn(trunk, ridgeTs, (t) => trunkR(t) * 0.99, 0.02, skin, "trunk", "trunkRidge");

  const tipP = trunk.at(1);
  const tipJoint = trunk.joints[trunk.joints.length - 1];
  b.part(new THREE.CylinderGeometry(0.125, 0.115, 0.06, 10), TIPCOL, {
    bone: tipJoint,
    at: tipP.at.clone().addScaledVector(tipP.tangent, 0.02),
    dir: tipP.tangent,
    flat: true,
    group: "trunk",
    name: "trunkTipPad",
  });
  for (const s of sides) {
    b.part(new THREE.CircleGeometry(0.024, 8), NOSTRIL, {
      bone: tipJoint,
      at: tipP.at.clone().addScaledVector(tipP.tangent, 0.052).addScaledVector(tipP.binormal, s * 0.04),
      dir: tipP.tangent,
      axis: "z",
      group: "trunk",
      name: `nostril${tag(s)}`,
    });
  }
  b.spike(tipP.at.clone().add(new THREE.Vector3(0, 0.0, 0.07)), [0, -0.5, 1], 0.14, 0.05, {
    color: TIPCOL,
    bone: tipJoint,
    group: "trunk",
    name: "trunkFinger",
  });

  // -------------------------------------------------------------------------------------------------------------
  // Tail: tapering rope ending in a coarse black tuft.
  b.sweep(tail, [0.1, 0.075, 0.055, 0.04, 0.035], {
    color: skin,
    section: { ngon: 7 },
    group: "tail",
    name: "tail",
  });
  const tailEnd = tail.at(1);
  b.ring(tailEnd, { count: 10, radius: 0.015, tilt: 58 }, (item) =>
    b.spike(item, item, 0.3, 0.02, { color: HAIR, section: { ngon: 5 } }),
  );
  b.ring(tailEnd, { count: 7, radius: 0.01, tilt: 28, fromDeg: 20, toDeg: 340 }, (item) =>
    b.spike(item, item, 0.4, 0.016, { color: HAIR, section: { ngon: 5 } }),
  );

  // -------------------------------------------------------------------------------------------------------------
  // Surface detail: crease cards, mud splashes, bristles.
  const bodySkin = b.surface([bodySweep, neckSweep]);
  b.cards(
    bodySkin.scatter(120, { rng: rng(11), minDist: 0.25, filter: (h) => h.n.y > -0.5 }),
    CREASE,
    { size: [0.36, 0.36], lean: 90, flow: [0, 0, 1], spin: 180, vary: 0.35, rng: rng(12), sink: 0, group: "skin" },
  );
  const legSkin = b.surface(legSweeps);
  b.cards(
    legSkin.scatter(70, { rng: rng(13), minDist: 0.2, filter: (h) => h.at.y > 0.45 }),
    CREASE,
    { size: [0.24, 0.24], lean: 90, flow: [0, 0, 1], spin: 180, vary: 0.35, rng: rng(14), sink: 0, group: "skin" },
  );
  b.cards(
    legSkin.scatter(60, { rng: rng(15), minDist: 0.16, filter: (h) => h.at.y < 1.1 && h.at.y > 0.3 && h.n.y > -0.3 }),
    MUD,
    { size: [0.2, 0.2], lean: 90, flow: [0, 1, 0], spin: 180, vary: 0.4, rng: rng(16), sink: 0, group: "mud" },
  );
  b.cards(
    skull.scatter(22, { rng: rng(17), minDist: 0.1, filter: (h) => h.n.y > 0.5 && h.at.z > 1.6 }),
    BRISTLE,
    { size: [0.06, 0.14], lean: 25, vary: 0.3, spin: 25, rng: rng(18), sink: 0.05, group: "hair" },
  );
  b.cards(
    bodySkin.scatter(26, { rng: rng(19), minDist: 0.3, filter: (h) => h.n.y > 0.75 }),
    BRISTLE,
    { size: [0.05, 0.12], lean: 20, vary: 0.3, spin: 25, rng: rng(20), sink: 0.05, group: "hair" },
  );

  return b.root;
}
