import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { limb } from "../src/ik";
import { offset } from "../src/math";
import { catmull } from "../src/path";
import { paint, smoothstep, noise } from "../src/paint";

export const meta = {
  name: "Tyrannosaurus Rex",
  description:
    "An adult Tyrannosaurus rex at real scale (12.2 m long, 3.3 m hip height) in a modern palaeontological reading: horizontal spine counterbalanced by a muscular tail, massive reinforced skull with deep hinged jaw, lethal serrated teeth, tiny two-fingered forelimbs, and powerful bird-like hindlimbs on splayed walking pads.",
  builtBy: "Gemini 3.8 Flash",
};

// Cretaceous theropod palette
const HIDE_BASE = "#565c44";    // olive-grey dorsal hide
const HIDE_DARK = "#333826";    // dark charcoal-moss tiger striping
const BELLY_CREAM = "#d0c6a0";  // countershaded pale underbelly and jaw throat
const TEETH_BONE = "#ede4cb";   // serrated teeth
const CLAW_DARK = "#1a1614";    // keratinous unguals / claws
const EYE_AMBER = "#d68b1a";    // predatory amber eye
const EYE_PUPIL = "#0d0a08";    // slit pupil
const BOSS_KERATIN = "#353026"; // rugose nasal / postorbital boss
const SCUTE_DARK = "#282a1e";   // dorsal scutes and ridge scales
const NOSTRIL_DARK = "#282520"; // naris interior

export default function build() {
  const b = createBuilder({ name: "tyrannosaurus" });

  // ---------------------------------------------------------------------------
  // 1. PROCEDURAL HIDE PAINT
  // Countershading (belly pale, back dark) + vertical tiger-like camouflage stripes
  // ---------------------------------------------------------------------------
  const HIDE_PAINT = paint((p, n) => {
    // Entire upper snout, cranium, and maxilla stay dark
    if (p.z > 3.8 && p.y > 2.85) {
      return HIDE_BASE;
    }

    // Natural countershading: ventral pale underbelly, chin, throat
    const bellyBlend = smoothstep(-0.6, 0.15, n.y);
    if (bellyBlend < 0.25) return BELLY_CREAM;
    // Vertical tiger camouflage bands on flanks and tail
    const stripeCoord = p.z * 1.5 + p.y * 0.35 + Math.sin(p.x * 2.2) * 0.25;
    const stripeWave = Math.sin(stripeCoord * Math.PI);
    const fineNoise = (noise(p, 0.45, 3) - 0.5) * 0.5;

    if (stripeWave + fineNoise > 0.48 && bellyBlend > 0.38) {
      return HIDE_DARK;
    }
    return bellyBlend < 0.48 ? BELLY_CREAM : HIDE_BASE;
  });

  // ---------------------------------------------------------------------------
  // 2. SKELETON: AXIAL SPINE, NECK, TAIL
  // Total length ~12.2m. Hips at y = 3.3m, z = 0.
  // Tail: z from 0 down to -6.6m. Spine & neck: z from 0 to +3.8m.
  // ---------------------------------------------------------------------------
  const axialStations = [
    { at: [0, 3.28, -6.60] as const, w: 0.16, h: 0.18 }, // tail tip
    { at: [0, 3.32, -5.50] as const, w: 0.38, h: 0.45 }, // distal tail
    { at: [0, 3.34, -4.20] as const, w: 0.68, h: 0.82 }, // mid tail
    { at: [0, 3.36, -2.70] as const, w: 1.10, h: 1.30 }, // caudal base (massive caudofemoralis)
    { at: [0, 3.38, -1.20] as const, w: 1.48, h: 1.68 }, // sacrum posterior
    { at: [0, 3.34,  0.00] as const, w: 1.58, h: 1.82 }, // hips (root)
    { at: [0, 3.26,  1.20] as const, w: 1.62, h: 1.95 }, // deep ribcage & gastralia
    { at: [0, 3.22,  2.40] as const, w: 1.34, h: 1.70 }, // pectoral girdle
    { at: [0, 3.30,  3.20] as const, w: 0.95, h: 1.18 }, // lower neck (S-curve ascent)
    { at: [0, 3.48,  3.80] as const, w: 0.74, h: 0.95 }, // mid-upper neck
  ];

  const spineCurve = catmull(axialStations.map((s) => s.at));
  const hipsAt = axialStations[5].at;
  const hipsT = spineCurve.closestT(hipsAt);

  const hips = b.joint("hips", { at: hipsAt, role: "spine", group: "body" });

  const spine = b.chain("spine", spineCurve.slice(hipsT, 1), {
    parent: hips,
    count: 5,
    names: ["spine1", "spine2", "chest", "neck1", "neck2"],
    role: "spine",
    group: "body",
  });

  const tail = b.chain("tail", spineCurve.slice(hipsT, 0), {
    parent: hips,
    count: 8,
    names: (i) => `tail${i + 1}`,
    role: "tail",
    group: "tail",
  });

  // Body Loft
  const bodyLoft = b.loft(axialStations, {
    bone: [tail, hips, spine],
    color: HIDE_PAINT,
    group: "body",
  });

  // ---------------------------------------------------------------------------
  // 3. HEAD & LOWER JAW
  // Massive theropod skull with stereoscopic binocular vision, nasal rugosities,
  // and deep coronoid process on the lower jaw.
  // ---------------------------------------------------------------------------
  const skullBase = spineCurve.at(1);
  const head = b.joint("head", {
    parent: spine.joints[spine.joints.length - 1],
    at: skullBase,
    dir: [0, -0.06, 1], // slightly downward aggressive gaze
    role: "head",
    group: "head",
  });

  // Head loft / stations in head local coordinates
  // +Z is forward along head direction, +Y is dorsal, +X is right lateral
  // Head loft / stations in head local coordinates:
  // Bone +Y is forward, +Z is dorsal (up), +X is lateral (right)
  const skullStations = [
    { at: head.local([0, 0.05, -0.05]), w: 1.10, h: 0.95 }, // occiput / back of cranium
    { at: head.local([0, 0.45,  0.02]), w: 1.25, h: 1.05 }, // wide temporal fenestra (stereoscopic flare)
    { at: head.local([0, 0.95, -0.02]), w: 0.72, h: 0.96 }, // antorbital region / pinched snout
    { at: head.local([0, 1.45, -0.06]), w: 0.54, h: 0.86 }, // maxilla / nasal bridge
    { at: head.local([0, 1.85, -0.12]), w: 0.46, h: 0.70 }, // U-shaped premaxilla
  ];

  b.loft(skullStations, {
    bone: head,
    color: HIDE_PAINT,
    group: "head",
  });

  // Nasal crest / boss: prominent rugose keratinous ridge along snout
  b.frustumBox(
    head.local([0, 0.70, 0.38]),
    head.local([0, 1.72, 0.22]),
    [0.22, 0.16],
    [0.15, 0.12],
    { bone: head, color: BOSS_KERATIN, group: "head" }
  );

  // Brow horns / postorbital bosses above and behind each eye
  for (const s of [1, -1]) {
    // Rugose postorbital brow horn
    b.spike(
      head.local([s * 0.44, 0.58, 0.40]),
      head.local([s * 0.52, 0.50, 0.54]),
      null,
      0.13,
      { bone: head, color: BOSS_KERATIN, group: "head" }
    );
    // Lacrimal hornlet in front of eye
    b.spike(
      head.local([s * 0.36, 0.85, 0.38]),
      head.local([s * 0.38, 0.82, 0.48]),
      null,
      0.08,
      { bone: head, color: BOSS_KERATIN, group: "head" }
    );
  }

  // Eyes: set into forward-facing orbits with stereoscopic binocular vision
  for (const s of [1, -1]) {
    const eyeSocket = head.local([s * 0.44, 0.65, 0.22]);
    const eyeDir = head.dir([s * 0.40, 0.88, 0.08]); // forward and slightly outward
    const eyeMesh = new THREE.SphereGeometry(0.09, 8, 8);
    b.part(eyeMesh, EYE_AMBER, {
      bone: head,
      at: eyeSocket,
      dir: eyeDir,
      group: "head",
    });

    // Vertical predatory slit pupil
    const pupilMesh = new THREE.CylinderGeometry(0.018, 0.018, 0.12, 6);
    b.part(pupilMesh, EYE_PUPIL, {
      bone: head,
      at: offset(eyeSocket, eyeDir, 0.08),
      dir: eyeDir,
      group: "head",
    });
  }
  // Nostrils (external nares)
  for (const s of [1, -1]) {
    b.capsule(
      head.local([s * 0.15, 1.62, 0.08]),
      head.local([s * 0.17, 1.54, 0.02]),
      0.045,
      { bone: head, color: NOSTRIL_DARK, group: "head" }
    );
  }

  // LOWER JAW
  // Jaw hinge at back of skull, underneath
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local([0, 0.35, -0.32]),
    aim: head.local([0, 1.78, -0.56]), // open ~15 degrees for clear rest pose
    role: "jaw",
    group: "jaw",
  });
  const jawStations = [
    { at: jaw.local([0, 0.05,  0.08]), w: 0.82, h: 0.54 }, // surangular / articular joint
    { at: jaw.local([0, 0.48,  0.02]), w: 0.70, h: 0.52 }, // coronoid swell
    { at: jaw.local([0, 0.95, -0.02]), w: 0.56, h: 0.44 }, // dentary mid
    { at: jaw.local([0, 1.45, -0.06]), w: 0.42, h: 0.36 }, // dentary anterior
    { at: jaw.local([0, 1.70, -0.08]), w: 0.30, h: 0.28 }, // symphysis (chin)
  ];

  b.loft(jawStations, {
    bone: jaw,
    color: HIDE_PAINT,
    group: "jaw",
  });

  // Oral flesh palate inside upper jaw
  b.loft([
    { at: head.local([0, 0.50, -0.22]), w: 0.55, h: 0.12 },
    { at: head.local([0, 1.10, -0.24]), w: 0.42, h: 0.10 },
    { at: head.local([0, 1.65, -0.22]), w: 0.28, h: 0.08 },
  ], {
    bone: head,
    color: "#6b2c2c",
    group: "head",
  });

  // Tongue in lower jaw
  b.capsule(
    jaw.local([0, 0.45, 0.08]),
    jaw.local([0, 1.25, 0.06]),
    [0.16, 0.11],
    { bone: jaw, color: "#6b2c2c", group: "jaw" }
  );

  // TEETH: UPPER & LOWER ROWS
  // Upper maxillary and premaxillary banana-teeth (prominently exposed serrated daggers)
  for (const s of [1, -1]) {
    // Upper teeth along palate (pointing -Z, recurved -Y)
    const upperToothPositions = [
      { y: 0.55, len: 0.24, r: 0.045, x: 0.38, z: -0.32 },
      { y: 0.75, len: 0.30, r: 0.054, x: 0.33, z: -0.34 },
      { y: 0.95, len: 0.32, r: 0.056, x: 0.28, z: -0.34 },
      { y: 1.15, len: 0.28, r: 0.052, x: 0.25, z: -0.34 },
      { y: 1.35, len: 0.24, r: 0.046, x: 0.22, z: -0.33 },
      { y: 1.55, len: 0.20, r: 0.038, x: 0.18, z: -0.30 },
      { y: 1.72, len: 0.16, r: 0.032, x: 0.13, z: -0.28 },
    ];
    for (const t of upperToothPositions) {
      const base = head.local([s * t.x, t.y, t.z]);
      const tip = head.local([s * (t.x - 0.02), t.y - 0.04, t.z - t.len]); // recurved backward
      b.spike(base, tip, null, t.r, {
        bone: head,
        color: TEETH_BONE,
        group: "head",
      });
    }

    // Lower dentary teeth (pointing +Z, recurved -Y)
    const lowerToothPositions = [
      { y: 0.58, len: 0.18, r: 0.038, x: 0.30, z: 0.14 },
      { y: 0.78, len: 0.22, r: 0.044, x: 0.26, z: 0.14 },
      { y: 0.98, len: 0.24, r: 0.048, x: 0.22, z: 0.13 },
      { y: 1.18, len: 0.22, r: 0.044, x: 0.19, z: 0.12 },
      { y: 1.38, len: 0.18, r: 0.038, x: 0.16, z: 0.10 },
      { y: 1.58, len: 0.14, r: 0.032, x: 0.12, z: 0.08 },
    ];
    for (const t of lowerToothPositions) {
      const base = jaw.local([s * t.x, t.y, t.z]);
      const tip = jaw.local([s * (t.x - 0.01), t.y - 0.03, t.z + t.len]); // pointing up (+Z), recurved
      b.spike(base, tip, null, t.r, {
        bone: jaw,
        color: TEETH_BONE,
        group: "jaw",
      });
    }
  }
  // ---------------------------------------------------------------------------
  // 4. POWERFUL BIRD-LIKE HINDLIMBS & TOES
  // Hip height = 3.3m, standing digits touch floor at y = 0.
  // ---------------------------------------------------------------------------
  const thighLen = 1.48;
  const shinLen = 1.35;

  for (const [s, side] of [[1, "L"], [-1, "R"]] as const) {
    const hipPos = [s * 0.76, 3.16, 0.05] as const;
    const anklePos = [s * 0.88, 0.66, 0.32] as const;
    const footPadPos = [s * 0.90, 0.22, 0.42] as const;

    const legPts = limb(
      hipPos,
      anklePos,
      [thighLen, shinLen],
      [
        [0, 0, 1],  // knee forward
      ],
    );

    // 3 segments: hip -> knee, knee -> ankle, ankle -> footPad
    const fullLegPts = [...legPts, footPadPos];

    // Chain: Hip -> Knee -> Ankle
    const legChain = b.chain(`leg${side}`, fullLegPts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
      group: `leg${side}`,
    });

    // Muscular thigh (femur) and calf (tibia/fibula) over hip and knee segments only
    b.sweep(legChain, (t) => {
      if (t < 0.5) return [0.44, 0.56]; // massive thigh
      return [0.26, 0.34];              // calf
    }, {
      to: legChain.ts[2], // stop at ankle joint!
      color: HIDE_PAINT,
      caps: { start: "round", end: "round" },
      group: `leg${side}`,
    });
    // Metatarsus (cannon bone) from ankle to ground foot pad
    b.capsule(
      anklePos,
      footPadPos,
      [0.17, 0.14],
      { bone: legChain.joints[2], color: HIDE_PAINT, group: `leg${side}` }
    );

    // Foot pad bulb (rests on floor: lowest point touches y = 0.000)
    b.capsule(
      [footPadPos[0], 0.1215, footPadPos[2] - 0.12],
      [footPadPos[0], 0.1215, footPadPos[2] + 0.18],
      0.12,
      { bone: legChain.joints[2], color: HIDE_PAINT, group: `leg${side}` }
    );

    // Three large bird-like weight-bearing digits (II, III, IV) + 1 small vestigial hallux (I)
    const toes = [
      { name: "Toe2", yaw: -18, len1: 0.32, len2: 0.30, claw: 0.22, r: 0.095 }, // inner
      { name: "Toe3", yaw:   0, len1: 0.40, len2: 0.36, claw: 0.26, r: 0.105 }, // middle (largest)
      { name: "Toe4", yaw:  20, len1: 0.34, len2: 0.30, claw: 0.22, r: 0.095 }, // outer
    ];

    for (const t of toes) {
      const angle = (t.yaw * Math.PI) / 180;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle) * s;

      // Base of digit at foot pad
      const d0 = [footPadPos[0] + sinA * 0.14, 0.1115, footPadPos[2] + cosA * 0.14] as const;
      const d1 = [d0[0] + sinA * t.len1, 0.1015, d0[2] + cosA * t.len1] as const;
      const d2 = [d1[0] + sinA * t.len2, 0.0815, d1[2] + cosA * t.len2] as const;
      const dTip = [d2[0] + sinA * t.claw, 0.0215, d2[2] + cosA * t.claw] as const; // claw tip right above ground
      const digitChain = b.chain(`toe${t.name}${side}`, [d0, d1, d2], {
        parent: legChain.joints[2],
        names: [`toe${t.name}A${side}`, `toe${t.name}B${side}`],
        role: "digit",
        group: `leg${side}`,
      });

      // Digit phalanges sweep
      b.sweep(digitChain, [t.r, t.r * 0.72], {
        color: HIDE_PAINT,
        caps: { start: "round", end: "round" },
        group: `leg${side}`,
      });

      // Lethal keratinous ungual (talon/claw)
      b.spike(d2, dTip, null, t.r * 0.65, {
        bone: digitChain.joints[1],
        color: CLAW_DARK,
        group: `leg${side}`,
      });
    }

    // Vestigial dewclaw / hallux (digit I) raised on medial-posterior side of ankle
    const halluxBase = [s * (footPadPos[0] - s * 0.12), 0.26, footPadPos[2] - 0.16] as const;
    const halluxTip = [halluxBase[0] - s * 0.08, 0.15, halluxBase[2] - 0.10] as const;
    b.spike(halluxBase, halluxTip, null, 0.05, {
      bone: legChain.joints[2],
      color: CLAW_DARK,
      group: `leg${side}`,
    });
  }

  // ---------------------------------------------------------------------------
  // 5. REDUCED TWO-FINGERED FORELIMBS (ARMS)
  // Characteristic diminutive T. rex arms: muscular humerus, radius/ulna,
  // two functional digits with sharp curved claws.
  // ---------------------------------------------------------------------------
  for (const [s, side] of [[1, "L"], [-1, "R"]] as const) {
    const shoulderPos = [s * 0.58, 2.50, 2.45] as const;
    const elbowPos = [s * 0.68, 2.05, 2.30] as const;
    const wristPos = [s * 0.72, 1.75, 2.55] as const;
    const handPos = [s * 0.74, 1.62, 2.65] as const;

    const armChain = b.chain(`arm${side}`, [shoulderPos, elbowPos, wristPos, handPos], {
      parent: spine.joints[2], // chest joint
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
      group: `arm${side}`,
    });

    b.sweep(armChain, [0.16, 0.12, 0.08], {
      color: HIDE_PAINT,
      caps: { start: "round", end: "round" },
      group: `arm${side}`,
    });

    // Two functional digits (I and II)
    const fingers = [
      { name: "1", dx: -0.06, dy: -0.14, dz: 0.10, len: 0.14, r: 0.035 }, // medial digit
      { name: "2", dx:  0.02, dy: -0.16, dz: 0.12, len: 0.16, r: 0.038 }, // lateral digit
    ];

    for (const f of fingers) {
      const fBase = [wristPos[0] + s * f.dx, wristPos[1] + f.dy, wristPos[2] + f.dz] as const;
      const fMid = [fBase[0] + s * f.dx * 0.6, fBase[1] + f.dy * 0.6, fBase[2] + f.dz * 0.6] as const;
      const fTip = [fMid[0] + s * f.dx * 0.5, fMid[1] - 0.08, fMid[2] + f.dz * 0.5] as const;

      const fingerChain = b.chain(`finger${f.name}${side}`, [fBase, fMid], {
        parent: armChain.joints[2],
        names: [`finger${f.name}A${side}`],
        role: "digit",
        group: `arm${side}`,
      });

      b.sweep(fingerChain, [f.r, f.r * 0.75], {
        bone: armChain.joints[2],
        color: HIDE_PAINT,
        group: `arm${side}`,
      });

      // Sharp raptorial claw
      b.spike(fMid, fTip, null, f.r * 0.7, {
        bone: armChain.joints[2],
        color: CLAW_DARK,
        group: `arm${side}`,
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 6. DORSAL SCUTES & SURFACE ACCENTS
  // Ridge of low scutes/spines along dorsal midline from neck to mid-tail
  // ---------------------------------------------------------------------------
  // Place scutes along dorsal midline using surface raycast so they bend with the body tube
  const bodySurface = b.surface(bodyLoft);
  const scuteT = [0.18, 0.28, 0.38, 0.48, 0.58, 0.68, 0.78, 0.88];
  for (const t of scuteT) {
    const pt = spineCurve.at(t);
    // Cast downward ray from above the spine point to hit the exact dorsal skin
    const hit = bodySurface.ray([pt.x, pt.y + 1.80, pt.z], [0, -1, 0]);
    if (hit) {
      const h = 0.08 + Math.sin(t * Math.PI) * 0.08;
      const r = 0.05 + Math.sin(t * Math.PI) * 0.03;
      b.spike(hit, hit, h, r, {
        color: SCUTE_DARK,
        group: "body",
      });
    }
  }

  return b.root;
}
