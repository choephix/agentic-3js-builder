import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { limb } from "../src/ik";
import type { PointInput } from "../src/math";
import { offset, rng } from "../src/math";
import { bezier, catmull } from "../src/path";
import { cells, grain, mottle, noise, paint } from "../src/paint";
import type { Station } from "../src/sugar";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";
import { cel, INK } from "../kits/toon";

export const meta = {
  name: "Wendigo",
  description:
    "A gaunt, starved wendigo: a towering antlered beast with a bone skull face, glowing amber eyes, a hunger ember in its ribs, and tattered cloth hemmed in gold.",
  style: "high-fantasy anime dark fantasy",
  commit: "b816db2",
};

// Palette: two-tone cel paints from kits/toon, gold trims and ember glow. Flat strings are only the glowing and dark
// accents.
const SKIN_LIT = cel("#8b8f74");
const SKIN_DEEP = cel("#5d6150");
const SKIN_VEIN = cel("#343a32");
const SKIN = paint((p) => {
  const c = cells(p, 0.06, 9);
  if (c.d2 - c.d1 < 0.008) return SKIN_VEIN;
  return noise(p, 0.15, 3) > 0.68 ? SKIN_DEEP : SKIN_LIT;
});
const BONE_LIT = cel("#eee4cf");
const BONE_DEEP = cel("#bcab8c");
const BONE_CRACK = cel("#7f6f58");
const SKULL = paint((p) => {
  const c = cells(p, 0.045, 5);
  return c.d2 - c.d1 < 0.0035 ? BONE_CRACK : BONE_LIT;
});
const ANTLER = cel(grain("#4d3f58", "#2a2132", { size: 0.02, axis: "y", seed: 2 }));
const GOLD = cel("#f2c35e", "#b06d2e");
const CLOTH = cel(mottle("#3b3050", "#2a2238", { size: 0.14, seed: 4 }));
const EMBER = "#ff9a3a";
const SOCKET = "#120812";
const HAIR_TINT = "#2b2233";

// Textures. The eye is a dark socket, an amber iris and a slit pupil; it glows in its own colours, so the socket
// stays dark.
const EYE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40">
<ellipse cx="32" cy="20" rx="31" ry="19" fill="${SOCKET}"/>
<ellipse cx="32" cy="20" rx="24" ry="14" fill="#ffb13a"/>
<ellipse cx="32" cy="20" rx="24" ry="14" fill="none" stroke="#ff5a14" stroke-width="3"/>
<ellipse cx="32" cy="20" rx="5" ry="12" fill="${SOCKET}"/>
<circle cx="25" cy="13" r="2.8" fill="#fff6d6"/>
</svg>`,
  { size: 256 },
);
// A gold pendant: gold filigree round a dark field and an ember centre.
const FILIGREE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<circle cx="32" cy="32" r="30" fill="#e0a43e"/>
<circle cx="32" cy="32" r="24" fill="#2b1a2c"/>
<circle cx="32" cy="32" r="19" fill="none" stroke="#f2c35e" stroke-width="2.5" stroke-dasharray="3 3"/>
<path d="M32 13 Q41 24 32 32 Q23 40 32 51 M13 32 Q24 23 32 32 Q40 41 51 32" stroke="#f2c35e" stroke-width="2.5" fill="none"/>
<circle cx="32" cy="32" r="6" fill="#ff8a2a"/>
</svg>`,
  { size: 256 },
);
// Matted strands, drawn in white so the card's colour tints them.
const HAIR = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64">
<g fill="none" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round">
<path d="M16 64 C12 44 20 28 14 2"/>
<path d="M10 64 C6 46 12 34 8 16"/>
<path d="M22 64 C24 46 19 32 25 12"/>
</g>
</svg>`,
  { size: 128 },
);

// The torso: a gaunt, narrow-waisted body with a wide sunken chest. Half-width and half-depth interpolate between
// these rows; the ribs and the sternum are laid from the same numbers.
const TORSO_ROWS = [
  { y: 1.42, z: 0, w: 0.34, h: 0.26 },
  { y: 1.6, z: 0, w: 0.3, h: 0.24 },
  { y: 1.86, z: 0.03, w: 0.38, h: 0.28 },
  { y: 2.1, z: 0.1, w: 0.46, h: 0.3 },
  { y: 2.28, z: 0.2, w: 0.5, h: 0.25 },
  { y: 2.36, z: 0.22, w: 0.2, h: 0.2 },
];
const TORSO: Station[] = TORSO_ROWS.map((r) => ({ at: [0, r.y, r.z], w: r.w, h: r.h }));

function torsoAt(y: number) {
  for (let i = 0; i < TORSO_ROWS.length - 1; i++) {
    const a = TORSO_ROWS[i];
    const c = TORSO_ROWS[i + 1];
    if (y >= a.y && y <= c.y) {
      const k = (y - a.y) / (c.y - a.y);
      return {
        half: (a.w + (c.w - a.w) * k) / 2,
        z: a.z + (c.z - a.z) * k,
        depth: (a.h + (c.h - a.h) * k) / 2,
      };
    }
  }
  throw new Error(`torsoAt(): ${y} is outside the torso`);
}

export default function build() {
  const b = createBuilder({ name: "wendigo" });

  // Skeleton: hips, a hunched spine, a long neck, a skull head with a hinged jaw, long arms and legs.
  const hips = b.joint("hips", { at: [0, 1.42, 0], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 1.6, 0], [0, 1.86, 0.03], [0, 2.1, 0.1], [0, 2.28, 0.2]]), {
    parent: hips,
    names: ["waist", "chest", "shoulders"],
    role: "spine",
  });
  const neck = b.chain("neck", catmull([[0, 2.26, 0.2], [0, 2.42, 0.3], [0, 2.56, 0.42]]), {
    parent: spine.joints[2],
    names: ["neck1", "neck2"],
    role: "neck",
  });
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 2.6, 0.46], dir: [0, 0.3, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 2.62, 0.36], dir: [0, -0.22, 1], role: "jaw" });

  // Torso and neck skin.
  const torso = b.loft(TORSO, { bone: [hips, spine, neck], color: SKIN });
  const torsoSurf = b.surface(torso);
  const neckTube = b.sweep(neck, (t) => 0.075 - 0.025 * t, { color: SKIN });
  const neckSurf = b.surface(neckTube);

  // Gold collar at the base of the neck.
  const collarAt = neck.at(0.2);
  b.part(new THREE.TorusGeometry(0.085, 0.011, 5, 12), GOLD, {
    at: collarAt.at,
    dir: collarAt.tangent,
    axis: "z",
    bone: collarAt.bone,
    name: "collar",
  });

  // Ribs: sunk into the chest, bone-coloured, bowing round to a sternum at the front.
  for (const y of [1.72, 1.82, 1.92, 2.02, 2.12, 2.2]) {
    const T = torsoAt(y);
    const a = T.half + 0.022;
    const d = T.depth + 0.022;
    for (const s of [1, -1]) {
      const pts: number[][] = [];
      for (let i = 0; i <= 8; i++) {
        const th = (Math.PI * i) / 8;
        pts.push([s * a * Math.sin(th), y - 0.05 * (i / 8) ** 2, T.z - d * Math.cos(th)]);
      }
      b.sweep(catmull(pts), (t) => 0.017 - 0.006 * t, { bone: spine, color: BONE_LIT, detail: 0.6 });
    }
  }
  const sternum: number[][] = [];
  for (const y of [1.7, 1.9, 2.1, 2.24]) {
    const T = torsoAt(y);
    sternum.push([0, y, T.z + T.depth + 0.022]);
  }
  b.sweep(catmull(sternum), 0.016, { bone: spine, color: BONE_DEEP, detail: 0.6 });

  // Hunger ember: a glowing core set into the sternum.
  const chest = torsoSurf.nearest([0, 1.93, 0.2]);
  glow(b.stick(new THREE.SphereGeometry(0.055, 10, 8), EMBER, chest, { embed: 0.45, name: "hungerEmber" }), 2);

  // Gold pendant on a bead necklace across the collarbones.
  const neckline = catmull([[-0.17, 2.2, 0.22], [0, 2.14, 0.255], [0.17, 2.2, 0.22]]);
  b.along(neckline, 11, (at) => b.part(new THREE.SphereGeometry(0.011, 6, 4), GOLD, { at }));
  b.part(new THREE.CircleGeometry(0.05, 24), "#ffffff", {
    bone: spine.joints[1],
    at: [0, 2.07, 0.25],
    dir: [0, 0, 1],
    axis: "z",
    texture: FILIGREE,
    name: "pendant",
  });

  // Gold belt round the hips, with a buckle.
  b.sweep(b.surface(torso).loop(hips, { lift: 0.018 }), 0.013, { color: GOLD, name: "belt" });
  b.part(new THREE.BoxGeometry(0.06, 0.05, 0.03), GOLD, { bone: hips, at: [0, 1.42, 0.15], name: "buckle" });

  // Vertebrae: bone spikes standing off the back of the torso and the neck.
  for (const y of [1.72, 1.84, 1.96, 2.08, 2.2]) {
    const hit = torsoSurf.ray([0, y, -1], [0, 0, 1]);
    if (hit) b.spike(hit, [0, 0.35, -1], 0.075, 0.012, { color: BONE_DEEP });
  }
  for (const y of [2.3, 2.38, 2.46, 2.52]) {
    const hit = neckSurf.ray([0, y, -1], [0, 0, 1]);
    if (hit) b.spike(hit, [0, 0.4, -1], 0.06, 0.01, { color: BONE_DEEP });
  }

  // Shoulder spurs of bone.
  for (const s of [1, -1]) {
    b.spike([s * 0.2, 2.3, 0.16], [s * 0.5, 0.9, -0.3], 0.2, 0.04, { bone: spine.joints[2], color: BONE_DEEP });
    b.spike([s * 0.28, 2.2, 0.1], [s * 0.6, 0.5, -0.7], 0.14, 0.03, { bone: spine.joints[2], color: BONE_DEEP });
  }

  // Skull: a cranium, a long gaunt face, brow ridges, cheek hollows, a nasal opening and a dark mouth.
  const cranium = b.part(new THREE.SphereGeometry(1, 16, 12), SKULL, {
    bone: head,
    at: [0, 2.76, 0.4],
    scale: [0.13, 0.15, 0.16],
    name: "cranium",
  });
  const face = b.sweep(
    catmull([
      [0, 2.78, 0.34],
      [0, 2.72, 0.54],
      [0, 2.66, 0.7],
    ]),
    (t) => [0.1 - 0.045 * t, 0.085 - 0.04 * t],
    { bone: head, color: SKULL, name: "face" },
  );
  for (const s of [1, -1]) {
    b.rod([s * 0.02, 2.84, 0.58], [s * 0.11, 2.82, 0.5], 0.013, { bone: head, color: BONE_DEEP });
    b.part(new THREE.SphereGeometry(1, 8, 6), SOCKET, {
      bone: head,
      at: [s * 0.07, 2.64, 0.56],
      scale: [0.025, 0.035, 0.03],
    });
  }
  b.part(new THREE.SphereGeometry(1, 8, 6), INK, {
    bone: head,
    at: [0, 2.7, 0.73],
    scale: [0.022, 0.02, 0.014],
    name: "nose",
  });
  b.sweep(
    catmull([
      [0, 2.6, 0.38],
      [0, 2.6, 0.6],
      [0, 2.6, 0.68],
    ]),
    [0.05, 0.025],
    { bone: head, color: INK, name: "maw" },
  );

  // Eyes: dark sockets with amber slit irises, drawn onto the skull and glowing.
  const skull = b.surface([cranium, face]);
  for (const s of [1, -1]) {
    glow(b.decal(skull, EYE, { at: [s * 0.06, 2.78, 0.52], dir: [0, 0, 1], size: [0.075, 0.047], name: "eye" }), 1.4);
  }

  // Teeth: a row on the upper face, a row on the lower jaw.
  const upperTeeth = catmull([
    [-0.05, 2.64, 0.64],
    [0, 2.62, 0.7],
    [0.05, 2.64, 0.64],
  ]);
  b.along(upperTeeth, 7, (at) => b.spike(at, [0, -1, 0.2], 0.03, 0.007, { bone: head, color: BONE_LIT }));
  const lowerTeeth = catmull([
    [-0.045, 2.57, 0.6],
    [0, 2.55, 0.66],
    [0.045, 2.57, 0.6],
  ]);
  b.along(lowerTeeth, 6, (at) => b.spike(at, [0, 1, 0.2], 0.025, 0.006, { bone: jaw, color: BONE_LIT }));

  // Lower jaw, hung from the jaw joint and held a little open.
  b.sweep(
    catmull([
      [0, 2.62, 0.36],
      [0, 2.55, 0.56],
      [0, 2.5, 0.7],
    ]),
    (t) => [0.065 - 0.02 * t, 0.03 - 0.01 * t],
    { bone: jaw, color: SKULL, name: "jaw" },
  );

  // Antlers: a pair of heavy, branching beams rising from the crown, dark plum with gold tips and gold collars.
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const root = skull.around([0, 2.78, 0.4]).at(s * 100, 55)!;
    const beamPts: PointInput[] = [
      root,
      [s * 0.2, 3.05, 0.1],
      [s * 0.4, 3.22, -0.05],
      [s * 0.5, 3.4, -0.22],
    ];
    const beam = b.sprout(`antler${L}`, root, catmull(beamPts), [0.05, 0.015], {
      count: 3,
      color: ANTLER,
      bands: [
        [0.82, ANTLER],
        [1, GOLD],
      ],
    });
    const tines = [
      { t: 0.3, dir: [s * 0.9, 0.4, 0.2], len: 0.2 },
      { t: 0.58, dir: [s * 0.45, 0.9, 0.25], len: 0.22 },
      { t: 0.84, dir: [s * 0.25, 0.7, -0.6], len: 0.16 },
    ];
    for (const tn of tines) {
      const p0 = beam.sweep.at(tn.t, 0);
      const tip = offset(p0, tn.dir, tn.len);
      const ctrl = offset(p0, tn.dir, tn.len * 0.45);
      b.sweep(bezier(p0, ctrl, tip), [0.017, 0.003], { color: ANTLER, caps: { end: "point" } });
    }
    b.ring(beam.sweep.at(0.02, 0), { count: 8, radius: 0.025 }, (r) =>
      b.part(new THREE.SphereGeometry(0.011, 6, 4), GOLD, { at: r }),
    );
    const bandAt = beam.sweep.at(0.46, 0);
    b.part(new THREE.TorusGeometry(0.045, 0.008, 5, 8), GOLD, {
      at: bandAt.at,
      dir: bandAt.tangent,
      axis: "z",
      name: `antlerBand${L}`,
    });
  }

  // Arms and legs: limbs solved to planted hands and feet, long and spindly, with gold cuffs and claws.
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";

    // Leg: hip to a planted ankle, knee forward. The thigh and calf are lofted so they swell and taper.
    const legPts = limb([s * 0.2, 1.42, 0], [s * 0.2, 0.13, -0.04], [0.8, 0.76], [[0, 0, 1]]);
    const leg = b.chain(`leg${L}`, legPts, {
      parent: hips,
      names: [`hip${L}`, `knee${L}`, `ankle${L}`],
      role: "leg",
      contact: [s * 0.2, 0, -0.04],
    });
    const P = legPts.map((v) => [v.x, v.y, v.z]);
    const calf = P[1].map((v, i) => v + (P[2][i] - v) * 0.35);
    b.loft(
      [
        { at: P[0], w: 0.24, h: 0.22 },
        { at: P[0].map((v, i) => (v + P[1][i]) / 2), w: 0.18, h: 0.18 },
        { at: P[1], w: 0.11, h: 0.11 },
        { at: [calf[0], calf[1], calf[2] - 0.03], w: 0.15, h: 0.14 },
        { at: P[2], w: 0.08, h: 0.08 },
      ],
      { bone: leg, color: SKIN, name: `leg${L}` },
    );
    const ankle = leg.joints[2];
    b.sweep(
      catmull([
        [s * 0.2, 0.13, -0.04],
        [s * 0.2, 0.07, 0.05],
        [s * 0.2, 0.034, 0.15],
      ]),
      (t) => [0.045 - 0.008 * t, 0.034],
      { bone: ankle, color: SKIN_DEEP, name: `foot${L}` },
    );
    for (const k of [-1, 0, 1]) {
      b.spike([s * 0.2 + k * 0.028, 0.04, 0.15], [k * 0.1, -0.2, 1], 0.075, 0.009, { bone: ankle, color: BONE_LIT });
    }

    // Arm: shoulder to a long hand hanging low, elbow back.
    const armPts = limb([s * 0.22, 2.22, 0.14], [s * 0.92, 1.18, 0.26], [0.72, 0.66], [[0, 0, -1]]);
    const arm = b.chain(`arm${L}`, armPts, {
      parent: spine.joints[2],
      names: [`upperArm${L}`, `forearm${L}`, `hand${L}`],
      role: "arm",
    });
    const armSkin = b.sweep(arm, (t) => 0.072 - 0.036 * t, { color: SKIN });
    const hand = arm.joints[2];
    b.capsule([s * 0.92, 1.16, 0.26], [s * 0.93, 1.1, 0.27], [0.036, 0.028], { bone: hand, color: SKIN });
    // Ragged cloth hanging from the upper arm, trailing back and down.
    const rag = arm.at(0.16);
    const rp = rag.at;
    b.sweep(
      catmull([
        [rp.x + s * 0.02, rp.y, rp.z - 0.07],
        [rp.x + s * 0.03, rp.y - 0.2, rp.z - 0.1],
        [rp.x + s * 0.02, rp.y - 0.42, rp.z - 0.12],
      ]),
      [0.035, 0.006],
      { bone: rag.bone, color: CLOTH, caps: { end: "point" }, name: `rag${L}` },
    );

    // Matted hair along the forearms.
    b.cards(
      b.surface(armSkin).scatter(30, { rng: rng(30 + s), minDist: 0.06, filter: (h) => h.n.y < 0.3 }),
      HAIR,
      { size: [0.06, 0.15], lean: 25, flow: [0, -1, 0], vary: 0.3, rng: rng(40 + s), color: HAIR_TINT },
    );

    // Gold rings at the elbow and the wrist.
    const elbow = arm.at(0.5);
    b.part(new THREE.TorusGeometry(0.05, 0.009, 5, 10), GOLD, {
      at: elbow.at,
      dir: elbow.tangent,
      axis: "z",
      bone: elbow.bone,
      name: `elbowRing${L}`,
    });
    const wrist = arm.at(0.93);
    b.part(new THREE.TorusGeometry(0.04, 0.008, 5, 10), GOLD, {
      at: wrist.at,
      dir: wrist.tangent,
      axis: "z",
      bone: wrist.bone,
      name: `wristCuff${L}`,
    });

    // Four long fingers, each two joints, each ending in a bone claw.
    for (let i = 0; i < 4; i++) {
      const z = (i - 1.5) * 0.03;
      const p0 = [s * 0.92, 1.12, 0.26 + z];
      const p1 = [s * 0.94, 1.03, 0.26 + z * 1.2 + 0.01];
      const p2 = [s * 0.97, 0.95, 0.26 + z * 1.4 + 0.03];
      const finger = b.chain(`finger${L}${i}`, catmull([p0, p1, p2]), {
        parent: hand,
        names: [`finger${L}${i}a`, `finger${L}${i}b`],
        role: "digit",
      });
      b.sweep(finger, (t) => 0.014 - 0.005 * t, { color: SKIN, detail: 0.6 });
      b.spike(p2, [s * 0.2, -1, 0.15], 0.07, 0.008, { bone: finger.joints[1], color: BONE_LIT });
      if (i === 2) {
        const mid = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2, (p0[2] + p1[2]) / 2];
        b.part(new THREE.TorusGeometry(0.014, 0.003, 5, 10), GOLD, {
          at: mid,
          dir: [s * 0.1, -1, 0.05],
          axis: "z",
          bone: finger.joints[0],
        });
      }
    }
  }

  // Tattered cloak: four jagged panels hung from the back of the shoulders, hemmed in gold, trailing past the knees.
  const tatter = (x: number, w: number, h: number) => {
    const outline: OutlinePoint[] = [
      [-w / 2, 0],
      [w / 2, 0],
      [w / 2, -h * 0.8],
      [w * 0.38, -h * 0.95, "sharp"],
      [w * 0.2, -h * 0.8],
      [0, -h, "sharp"],
      [-w * 0.2, -h * 0.82],
      [-w * 0.38, -h * 0.97, "sharp"],
      [-w / 2, -h * 0.78],
    ];
    const hem = paint((_p, _n, s) => (s[1] < -h * 0.8 ? GOLD : CLOTH));
    return b.extrude(outline, {
      at: [x, 2.08, -0.07],
      x: [1, 0, 0],
      y: [0, 1, 0.12],
      thickness: 0.014,
      bevel: 0.004,
      color: hem,
      bone: spine.joints[1],
      name: `cloak${x}`,
    });
  };
  tatter(-0.2, 0.2, 1.1);
  tatter(-0.05, 0.24, 1.32);
  tatter(0.1, 0.22, 1.16);
  tatter(0.24, 0.16, 0.92);

  // Matted hair on the back of the skull.
  b.cards(
    b.surface(cranium).scatter(80, { rng: rng(11), minDist: 0.03, filter: (h) => h.n.z < -0.2 }),
    HAIR,
    { size: [0.06, 0.15], lean: 35, flow: [0, -1, -0.3], bend: 25, vary: 0.3, rng: rng(12), color: HAIR_TINT },
  );

  return b.root;
}
