import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { vec } from "../src/math";
import type { OutlinePoint } from "../src/outline";
import { catmull } from "../src/path";
import { paint } from "../src/paint";

export const meta = {
  name: "Red Lionfish · Gemini",
  description:
    "A 0.4 m red lionfish swimming 0.25 m above the floor: bold red-brown and white vertical stripes, fan-shaped pectoral fins with long separated spiny rays and delicate webbed membranes, tall venomous dorsal spines with frayed membranes, feathery tentacles above the eyes, hinged lower jaw, and rounded caudal fin.",
  builtBy: "Gemini 3.8 Flash",
};

// Rich tropical lionfish color palette
const RED_BROWN = "#882218";
const DEEP_BURGUNDY = "#52100b";
const DARK_STRIPE = "#3a0906";
const WHITE_CREAM = "#f7eee1";
const TENTACLE_RED = "#ab261c";
const TENTACLE_WHITE = "#fff8ee";
const EYE_GOLD = "#d49b28";
const EYE_PUPIL = "#0d0706";
const FIN_MEMBRANE = "#ebd5c1";
const FIN_SPINE = "#6e1710";
const FIN_SPOT = "#380a06";
const JAW_PALE = "#eed8c8";

export default function build() {
  const b = createBuilder({ name: "redLionfishGemini", detail: 0.8 });

  // ---------------------------------------------------------------------------
  // SKELETON
  // Fish is ~0.40 m total length (snout at z ~ +0.14, caudal fin reaches z ~ -0.26).
  // Lowest point about 0.25 m above floor (lowest pectoral ray tip reaches y ~ 0.25).
  // Mid-body axis runs around y = 0.38 - 0.40.
  // ---------------------------------------------------------------------------

  const hips = b.joint("hips", { at: [0, 0.38, 0], role: "spine", group: "body" });

  const spinePath = catmull([
    hips.at,
    [0, 0.385, 0.035],
    [0, 0.39, 0.070],
  ]);
  const spine = b.chain("spine", spinePath, {
    parent: hips,
    count: 2,
    role: "spine",
    group: "body",
  });

  const lastSpineJoint = spine.joints[spine.joints.length - 1];

  const head = b.joint("head", {
    parent: lastSpineJoint,
    at: [0, 0.39, 0.088],
    dir: [0, -0.05, 1],
    role: "head",
    group: "head",
  });
  const H = b.region({ at: head.at, bone: head });

  const jaw = b.joint("jaw", {
    parent: head,
    at: H.p([0, -0.025, 0.06]),
    dir: [0, 0.05, 1],
    role: "jaw",
    group: "head",
  });

  const tailPath = catmull([
    hips.at,
    [0, 0.38, -0.05],
    [0, 0.38, -0.10],
    [0, 0.38, -0.14],
  ]);
  const tail = b.chain("tail", tailPath, {
    parent: hips,
    count: 3,
    role: "tail",
    group: "tail",
  });

  // ---------------------------------------------------------------------------
  // BODY & HEAD LOFT / SWEEP
  // ---------------------------------------------------------------------------

  const fullBodyCurve = tailPath.slice(1, 0).concat(spinePath);
  const tailLen = tailPath.length;
  const totalLen = fullBodyCurve.length;
  const splitT = tailLen / totalLen;

  // Zebra pattern: alternating rich red-brown, deep burgundy, and white/cream bands
  const bodyPaint = paint((p, _n, _s) => {
    // Slanted slightly on the body
    const zOffset = (p.z + p.y * 0.25) * 58;
    const wave = Math.sin(zOffset + Math.sin(p.y * 32) * 0.45);
    if (wave > 0.35) return DEEP_BURGUNDY;
    if (wave > -0.05) return RED_BROWN;
    if (wave > -0.35) return DARK_STRIPE;
    return WHITE_CREAM;
  });

  // Deep, laterally compressed body profile
  b.sweep(
    fullBodyCurve,
    (t) => {
      if (t < splitT) {
        // Tail peduncle section
        const nt = t / splitT; // 0 at caudal base, 1 at hips
        const rx = 0.010 + 0.024 * nt;
        const ry = 0.018 + 0.052 * nt;
        return [rx, ry];
      } else {
        // Spine & chest section
        const nt = (t - splitT) / (1 - splitT); // 0 at hips, 1 at snout base
        const rx = 0.034 * Math.sin(nt * Math.PI * 0.75 + 0.5) + 0.016;
        const ry = 0.070 * Math.sin(nt * Math.PI * 0.8 + 0.3) + 0.025;
        return [rx, ry];
      }
    },
    {
      bone: [tail, hips, spine],
      color: bodyPaint,
      sides: 10,
      smooth: true,
      caps: "round",
      name: "body",
      group: "body",
    },
  );

  // Angular spiny head & snout

  b.loft(
    [
      { at: H.p([0, 0.005, -0.015]), w: 0.062, h: 0.082 },
      { at: H.p([0, 0.01, 0.030]), w: 0.052, h: 0.076 },
      { at: H.p([0, -0.005, 0.070]), w: 0.034, h: 0.052 },
      { at: H.p([0, -0.018, 0.105]), w: 0.022, h: 0.028 },
    ],
    {
      bone: head,
      color: bodyPaint,
      sides: 8,
      smooth: false,
      caps: "round",
      name: "headSnout",
      group: "head",
    },
  );

  // Lower jaw (articulated)
  // Starts beneath the snout and points forward-upward to form upturned lionfish mouth
  const jawTip = H.p([0, -0.015, 0.105]);
  b.sweep(
    [jaw.at, jawTip],
    [0.016, 0.010],
    {
      bone: jaw,
      color: JAW_PALE,
      sides: 6,
      smooth: false,
      caps: "round",
      name: "lowerJaw",
      group: "head",
    },
  );

  // Suborbital bony spines / ridges on the cheek
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const cheekSpine1 = H.p([s * 0.026, -0.015, 0.04]);
    const cheekSpineTip1 = H.p([s * 0.052, -0.025, 0.025]);
    b.spike(cheekSpine1, cheekSpineTip1, null, 0.004, {
      bone: head,
      color: RED_BROWN,
      name: `cheekSpine1_${side}`,
      group: "head",
    });

    const cheekSpine2 = H.p([s * 0.020, -0.020, 0.065]);
    const cheekSpineTip2 = H.p([s * 0.045, -0.030, 0.055]);
    b.spike(cheekSpine2, cheekSpineTip2, null, 0.0035, {
      bone: head,
      color: RED_BROWN,
      name: `cheekSpine2_${side}`,
      group: "head",
    });

    // -------------------------------------------------------------------------
    // EYES
    // -------------------------------------------------------------------------
    const eyeCenter = H.p([s * 0.026, 0.022, 0.045]);

    // Bony orbit / brow ridge
    b.part(new THREE.TorusGeometry(0.012, 0.003, 6, 8), RED_BROWN, {
      bone: head,
      at: eyeCenter,
      dir: [s * 0.95, 0.1, 0.2],
      name: `eyeOrbit_${side}`,
      group: "head",
    });

    // Eyeball
    b.part(new THREE.SphereGeometry(0.011, 8, 6), EYE_GOLD, {
      bone: head,
      at: eyeCenter,
      name: `eyeball_${side}`,
      group: "head",
    });

    // Pupil
    b.part(new THREE.SphereGeometry(0.006, 6, 4), EYE_PUPIL, {
      bone: head,
      at: vec(eyeCenter).add(new THREE.Vector3(s * 0.007, 0.001, 0.004)),
      name: `eyePupil_${side}`,
      group: "head",
    });

    // -------------------------------------------------------------------------
    // FEATHERY SUPRAOCULAR TENTACLES (Above eyes)
    // -------------------------------------------------------------------------
    // Distinctive lionfish fleshy branched horn/tentacle above each eye
    const tentacleBase = H.p([s * 0.020, 0.030, 0.038]);
    const tentacleMid = H.p([s * 0.035, 0.080, 0.035]);
    const tentacleTip = H.p([s * 0.045, 0.115, 0.020]);

    const tentaclePath = catmull([tentacleBase, tentacleMid, tentacleTip]);
    b.sweep(tentaclePath, [0.0045, 0.0015], {
      bone: head,
      color: TENTACLE_RED,
      sides: 5,
      caps: "point",
      name: `supraocularTentacle_${side}`,
      group: "head",
    });

    // Side frills / feathering along the tentacle
    for (let f = 1; f <= 5; f++) {
      const ft = f / 6;
      const frillBase = tentaclePath.at(ft);
      const frillDir = new THREE.Vector3(s * (0.4 + 0.3 * (f % 2)), 0.3, -0.2).normalize();
      const frillTip = vec(frillBase).addScaledVector(frillDir, 0.016 + 0.006 * Math.sin(f));
      b.spike(frillBase, frillTip, null, 0.0018, {
        bone: head,
        color: f % 2 === 0 ? TENTACLE_WHITE : TENTACLE_RED,
        name: `tentacleFrill_${side}_${f}`,
        group: "head",
      });
    }

    // Nasal barbel / small snout tentacle (embedded in snout skin)
    const snoutBarbelBase = H.p([s * 0.010, -0.002, 0.092]);
    const snoutBarbelTip = H.p([s * 0.020, 0.015, 0.102]);
    b.spike(snoutBarbelBase, snoutBarbelTip, null, 0.0025, {
      bone: head,
      color: TENTACLE_RED,
      name: `snoutBarbel_${side}`,
      group: "head",
    });
  }

  // ---------------------------------------------------------------------------
  // TALL VENOMOUS DORSAL SPINES (13 prominent separated spines)
  // ---------------------------------------------------------------------------
  // Red lionfish (Pterois volitans) typically has 13 extremely long dorsal spines
  // followed by a soft-rayed second dorsal fin. The spines have ragged/frayed membranes.
  const spineCount = 13;
  // Starting near head (z = 0.10) to mid-tail (z = -0.09)
  for (let i = 0; i < spineCount; i++) {
    const frac = i / (spineCount - 1);
    const zPos = 0.068 - frac * 0.135;
    // Spines curve backwards, taller in the middle (up to ~0.14 m tall)
    const spineHeight = 0.07 + 0.08 * Math.sin(frac * Math.PI * 0.85 + 0.25);
    const spineBaseY = 0.44 + 0.025 * Math.sin(frac * Math.PI);

    // Bone along spine/hips/tail matched to position
    const spineBone = zPos > 0.045 ? spine.joints[1] : zPos > 0.015 ? spine.joints[0] : zPos > -0.035 ? hips : tail.joints[0];

    // Spine curve arching backward slightly
    const sBase = [0, spineBaseY, zPos];
    const sMid = [0, spineBaseY + spineHeight * 0.55, zPos - 0.015];
    const sTip = [0, spineBaseY + spineHeight, zPos - 0.035 - frac * 0.02];
    const sPath = catmull([sBase, sMid, sTip]);

    // Needle-sharp venomous spine ray
    b.sweep(sPath, [0.0035, 0.0008], {
      bone: spineBone,
      color: FIN_SPINE,
      sides: 5,
      caps: "point",
      name: `dorsalSpineRay_${i + 1}`,
      group: "dorsalSpines",
    });

    // Alternating dark/light banding on the spine ray
    for (let bIdx = 1; bIdx <= 3; bIdx++) {
      const bt = bIdx * 0.24;
      const ringPt = sPath.at(bt);
      b.part(new THREE.CylinderGeometry(0.0036, 0.0036, 0.005, 5), WHITE_CREAM, {
        bone: spineBone,
        at: ringPt,
        dir: sPath.tangentAt(bt),
        name: `dorsalSpineBand_${i + 1}_${bIdx}`,
        group: "dorsalSpines",
      });
    }

    // Frayed membrane trailing behind lower half of each spine
    const memHeight = spineHeight * 0.55;
    const memEdgeA = sPath.slice(0, 0.6);
    const memEdgeB = catmull([
      sBase,
      [0, spineBaseY + memHeight * 0.45, zPos - 0.025],
      [0, spineBaseY + memHeight, zPos - 0.030],
    ]);

    b.membrane(memEdgeA, memEdgeB, {
      bone: spineBone,
      color: FIN_MEMBRANE,
      thickness: 0.0015,
      name: `dorsalSpineMembrane_${i + 1}`,
      group: "dorsalSpines",
    });
  }

  // ---------------------------------------------------------------------------
  // SOFT SECOND DORSAL FIN (Behind spiny dorsal)
  // ---------------------------------------------------------------------------
  // Rounded fan-like soft fin with spotted translucent-look membrane
  const softDorsalBaseZ = -0.075;
  const softDorsalOutline: OutlinePoint[] = [
    [0, 0],
    [-0.012, 0.038],
    [-0.028, 0.052, "sharp"],
    [-0.048, 0.048],
    [-0.060, 0.032],
    [-0.055, 0],
  ];
  b.extrude(softDorsalOutline, {
    at: [0, 0.405, softDorsalBaseZ],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.002,
    bevel: 0.0008,
    color: FIN_MEMBRANE,
    bone: tail.joints[1],
    name: "softDorsalFin",
    group: "fins",
  });

  // Spotted pattern dots on soft dorsal
  for (let d = 0; d < 6; d++) {
    const dz = softDorsalBaseZ - 0.012 - (d % 3) * 0.016;
    const dy = 0.420 + Math.floor(d / 3) * 0.016;
    b.part(new THREE.SphereGeometry(0.003, 5, 4), FIN_SPOT, {
      bone: tail.joints[1],
      at: [0, dy, dz],
      name: `softDorsalSpot_${d}`,
      group: "fins",
    });
  }

  // ---------------------------------------------------------------------------
  // ANAL FIN (Ventral, spiny leading rays + soft fin)
  // ---------------------------------------------------------------------------
  const analOutline: OutlinePoint[] = [
    [0, 0],
    [-0.016, -0.040],
    [-0.032, -0.052, "sharp"],
    [-0.052, -0.044],
    [-0.060, -0.024],
    [-0.055, 0],
  ];
  b.extrude(analOutline, {
    at: [0, 0.355, -0.068],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.002,
    bevel: 0.0008,
    color: FIN_MEMBRANE,
    bone: tail.joints[0],
    name: "analFin",
    group: "fins",
  });

  // 3 sharp anal spines along leading edge
  for (let a = 0; a < 3; a++) {
    const aBase = [0, 0.355, -0.068 - a * 0.006];
    const aTip = [0, 0.355 - 0.036 - a * 0.010, -0.084 - a * 0.007];
    b.spike(aBase, aTip, null, 0.003, {
      bone: tail.joints[0],
      color: FIN_SPINE,
      name: `analSpine_${a + 1}`,
      group: "fins",
    });
  }

  // ---------------------------------------------------------------------------
  // CAUDAL FIN (Rounded tail fin)
  // ---------------------------------------------------------------------------
  // Red lionfish caudal fin is broadly rounded, with dark spots on clear/cream membrane
  const caudalBaseZ = -0.145;
  const caudalY = 0.38;
  const caudalOutline: OutlinePoint[] = [
    [0, -0.012],
    [-0.024, -0.036],
    [-0.052, -0.044],
    [-0.076, -0.028],
    [-0.084, 0, "sharp"],
    [-0.076, 0.028],
    [-0.052, 0.044],
    [-0.024, 0.036],
    [0, 0.012],
  ];
  b.extrude(caudalOutline, {
    at: [0, caudalY, caudalBaseZ],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.0022,
    bevel: 0.0008,
    color: FIN_MEMBRANE,
    bone: tail.joints[2],
    name: "caudalFin",
    group: "fins",
  });

  // Radiating caudal fin rays
  const caudalRayCount = 7;
  for (let r = 0; r < caudalRayCount; r++) {
    const angle = (r / (caudalRayCount - 1) - 0.5) * 1.1; // -0.55 to +0.55 rad
    const crBase = [0, caudalY, caudalBaseZ];
    const crLen = 0.076 * Math.cos(angle * 0.8);
    const crTip = [0, caudalY + Math.sin(angle) * crLen, caudalBaseZ - Math.cos(angle) * crLen];
    b.sweep([crBase, crTip], [0.0025, 0.001], {
      bone: tail.joints[2],
      color: FIN_SPINE,
      sides: 4,
      caps: "point",
      name: `caudalRay_${r + 1}`,
      group: "fins",
    });

    // Spots on caudal rays
    for (let sIdx = 1; sIdx <= 3; sIdx++) {
      const st = sIdx * 0.28;
      const spt = vec(crBase).lerp(vec(crTip), st);
      b.part(new THREE.SphereGeometry(0.0028, 5, 4), FIN_SPOT, {
        bone: tail.joints[2],
        at: spt,
        name: `caudalSpot_${r + 1}_${sIdx}`,
        group: "fins",
      });
    }
  }

  // ---------------------------------------------------------------------------
  // PELVIC FINS (Ventral pair, dipping down)
  // ---------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pelvBase = [s * 0.022, 0.32, 0.02];
    const pelvTip = [s * 0.035, 0.252, -0.04];
    const pelvicJoint = b.joint(`pelvic_${side}`, {
      parent: hips,
      at: pelvBase,
      aim: pelvTip,
      role: "hinge",
      group: `pelvic_${side}`,
    });

    const pelvOutline: OutlinePoint[] = [
      [0, 0],
      [s * 0.015, -0.050],
      [s * 0.025, -0.068, "sharp"],
      [s * 0.005, -0.068],
      [-s * 0.005, -0.02],
    ];
    b.extrude(pelvOutline, {
      at: pelvicJoint.at,
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.002,
      color: DEEP_BURGUNDY,
      bone: pelvicJoint,
      name: `pelvicFin_${side}`,
      group: `pelvic_${side}`,
    });

    // Leading sharp spine on pelvic fin
    b.spike(pelvBase, pelvTip, null, 0.003, {
      bone: pelvicJoint,
      color: FIN_SPINE,
      name: `pelvicSpine_${side}`,
      group: `pelvic_${side}`,
    });
  }

  // ---------------------------------------------------------------------------
  // LARGE FAN-SHAPED PECTORAL FINS (Wing-like, long separated spiny rays)
  // ---------------------------------------------------------------------------
  // Red lionfish pectoral fins are its most striking feature: huge wing-like fans
  // of 14 long, separated rays with membranes between their lower/middle portions,
  // and free, elongated filamentous tips.
  // Rigged with fan role chains.
  const pectRayCount = 10;

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pectBase = [s * 0.038, 0.35, 0.045];

    const pectJoint = b.joint(`pectoralBase_${side}`, {
      parent: spine.joints[0],
      at: pectBase,
      dir: [s * 0.8, -0.2, -0.4],
      role: "fan",
      group: `pectoral_${side}`,
    });

    // Fin rays fan out from dorsal-backward to ventral-downward
    // Lowest ray tip should reach y ~ 0.25 (satisfying brief requirement)
    const rayTips: THREE.Vector3[] = [];
    const rayMids: THREE.Vector3[] = [];

    for (let r = 0; r < pectRayCount; r++) {
      const frac = r / (pectRayCount - 1); // 0 = upper/rear, 1 = lower/front
      // Angles: upper rays point back & out; lower rays point down & slightly out
      const yaw = s * (0.65 + 0.55 * Math.sin(frac * Math.PI * 0.8));
      const pitch = -0.15 - 0.48 * frac; // drops down as frac increases
      const roll = (1 - frac) * 0.35;

      const rayLength = 0.145 + 0.030 * Math.sin(frac * Math.PI * 0.7 + 0.3); // up to ~0.17 m

      const dir = new THREE.Vector3(
        s * Math.cos(pitch) * Math.abs(Math.sin(yaw)),
        Math.sin(pitch),
        -Math.cos(pitch) * Math.abs(Math.cos(yaw)) - roll * 0.2,
      ).normalize();

      const tipPt = vec(pectBase).addScaledVector(dir, rayLength);
      if (tipPt.y < 0.250) {
        tipPt.y = 0.250;
      }
      const midPt = vec(pectBase).addScaledVector(dir, rayLength * 0.52);
      if (midPt.y < 0.265) {
        midPt.y = 0.265;
      }

      rayTips.push(tipPt);
      rayMids.push(midPt);

      // Create articulated digit/fan ray joint for rigging
      const rayJoint = b.joint(`pectRay_${side}_${r + 1}`, {
        parent: pectJoint,
        at: pectBase,
        aim: tipPt,
        role: "fan",
        group: `pectoral_${side}`,
      });

      const rayPath = catmull([pectBase, midPt, tipPt]);

      // Long separated spine ray: thick at base, needle-thin at tip
      b.sweep(rayPath, [0.0035, 0.0008], {
        bone: rayJoint,
        color: FIN_SPINE,
        sides: 5,
        caps: "point",
        name: `pectoralRay_${side}_${r + 1}`,
        group: `pectoral_${side}`,
      });

      // Bands along pectoral ray
      for (let bIdx = 1; bIdx <= 3; bIdx++) {
        const bt = bIdx * 0.25;
        const bpt = rayPath.at(bt);
        b.part(new THREE.CylinderGeometry(0.0036, 0.0036, 0.004, 5), WHITE_CREAM, {
          bone: rayJoint,
          at: bpt,
          dir: rayPath.tangentAt(bt),
          name: `pectoralRayBand_${side}_${r + 1}_${bIdx}`,
          group: `pectoral_${side}`,
        });
      }
    }

    // Webbed membranes between adjacent rays (covers about 65% of ray length, leaving tips free)
    for (let r = 0; r < pectRayCount - 1; r++) {
      const edgeA = catmull([pectBase, rayMids[r], vec(rayMids[r]).lerp(rayTips[r], 0.35)]);
      const edgeB = catmull([pectBase, rayMids[r + 1], vec(rayMids[r + 1]).lerp(rayTips[r + 1], 0.35)]);

      b.membrane(edgeA, edgeB, {
        bone: pectJoint,
        color: FIN_MEMBRANE,
        thickness: 0.0012,
        scallop: 0.12, // Scalloped edge between rays
        name: `pectoralMembrane_${side}_${r + 1}`,
        group: `pectoral_${side}`,
      });

      // Spots on the pectoral membrane
      const spotPos = vec(rayMids[r]).lerp(rayMids[r + 1], 0.5);
      b.part(new THREE.SphereGeometry(0.0032, 5, 4), FIN_SPOT, {
        bone: pectJoint,
        at: spotPos,
        name: `pectoralSpot_${side}_${r + 1}`,
        group: `pectoral_${side}`,
      });
    }
  }

  // Operculum / Gill cover flap
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const opercleOutline: OutlinePoint[] = [
      [0, 0],
      [0.015, -0.025],
      [0.025, -0.05, "sharp"],
      [0.005, -0.065],
      [-0.012, -0.04],
      [-0.010, -0.01],
    ];
    b.extrude(opercleOutline, {
      at: H.p([s * 0.028, 0.005, 0.025]),
      x: [0, 0, -1],
      y: [s * 0.15, 1, 0],
      thickness: 0.002,
      bevel: 0.0006,
      color: DEEP_BURGUNDY,
      bone: head,
      name: `opercle_${side}`,
      group: "head",
    });
  }

  return b.root;
}
