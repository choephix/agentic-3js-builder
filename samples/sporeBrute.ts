import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { catmull, polyline } from "../src/path";
import { countershade, mottle, spots } from "../src/paint";
import { rng } from "../src/math";

const CAP = "#D96A45";
const CAP_LIGHT = "#F29A55";
const CAP_DARK = "#8E3E39";
const STEM = "#B8C36B";
const STEM_DARK = "#667348";
const BODY = "#526A45";
const BELLY = "#8E9B5C";
const LIMB = "#41533C";
const LIMB_LIGHT = "#718457";
const CLAW = "#D7C58A";
const EYE = "#EACB4C";
const PUPIL = "#24251D";
const BELT = "#372E2D";
const RIVET = "#C59A55";
const GILL = "#E2BC77";

export const meta = {
  name: "Spore Brute",
  description: "A hulking low-poly mushroom brute with a spotted cap, plated shoulders, heavy fists, and fungal growths.",
  style: "low-poly",
  commit: "07503e3",
};

export default function build() {
  const b = createBuilder({ name: "sporeBrute", detail: 1 });

  // Skeleton first: a squat but fully articulated mushroom humanoid.
  const hips = b.joint("hips", { at: [0, 0.95, 0], dir: [0, 1, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.95, 0],
      [0, 1.18, 0.01],
      [0, 1.42, 0.02],
      [0, 1.57, 0.04],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3", "chest"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.57, 0.04],
      [0, 1.68, 0.05],
      [0, 1.79, 0.07],
    ]),
    { parent: spine.tip!, names: ["neck1", "neck2", "neckTip"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.tip!, at: [0, 1.79, 0.1], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.69, 0.3], dir: [0, 0.15, 1], role: "jaw" });

  const arms = [1, -1].map((s) => {
    const side = s > 0 ? "L" : "R";
    return b.chain(
      `arm${side}`,
      catmull([
        [s * 0.44, 1.43, 0.02],
        [s * 0.67, 1.18, 0.0],
        [s * 0.78, 0.9, 0.13],
        [s * 0.82, 0.76, 0.27],
      ]),
      { parent: spine.tip!, names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hand${side}`], role: "arm" },
    );
  });
  const legs = [1, -1].map((s) => {
    const side = s > 0 ? "L" : "R";
    return b.chain(
      `leg${side}`,
      catmull([
        [s * 0.26, 0.89, 0.0],
        [s * 0.34, 0.57, 0.03],
        [s * 0.39, 0.25, 0.1],
        [s * 0.4, 0.14, 0.28],
      ]),
      { parent: hips, names: [`thigh${side}`, `shin${side}`, `ankle${side}`, `foot${side}`], role: "leg" },
    );
  });

  const capPaint = spots(CAP, CAP_LIGHT, { size: 0.23, amount: 0.32, rosette: true, seed: 17 });
  const bodyPaint = countershade(mottle(BODY, LIMB_LIGHT, { size: 0.22, contrast: 0.45, seed: 8 }), BELLY, {
    level: -0.2,
  });

  // Core masses: faceted, broad and deliberately top-heavy.
  const torso = b.sweep(spine, (t) => 0.32 + t * 0.16, {
    section: { ngon: 7 },
    color: bodyPaint,
    smooth: false,
    caps: "round",
    shift: [0, -0.015],
    sectors: [[-55, 55, BODY], [125, 235, BELLY]],
    name: "facetedTorso",
  });
  b.sweep(neck, [0.22, 0.17], {
    section: { ngon: 7 },
    color: STEM,
    smooth: false,
    caps: "round",
    name: "stalkNeck",
  });

  for (const [i, arm] of arms.entries()) {
    const s = i === 0 ? 1 : -1;
    b.sweep(arm, (t) => 0.16 - t * 0.045, {
      section: { ngon: 6 },
      color: i === 0 ? LIMB_LIGHT : LIMB,
      smooth: false,
      caps: "round",
      name: `armTube${s > 0 ? "L" : "R"}`,
    });
    b.part(new THREE.IcosahedronGeometry(0.24, 0), LIMB_LIGHT, {
      bone: arm.joints[0],
      at: arm.joints[0].at,
      scale: [1.08, 0.8, 1.15],
      flat: true,
      name: `shoulderPlate${s > 0 ? "L" : "R"}`,
    });
    const hand = arm.tip!;
    b.part(new THREE.DodecahedronGeometry(0.19, 0), LIMB, {
      bone: hand,
      at: hand.at,
      scale: [1.1, 0.95, 1.25],
      flat: true,
      name: `fist${s > 0 ? "L" : "R"}`,
    });
    for (let k = -1; k <= 1; k += 1) {
      b.part(new THREE.SphereGeometry(0.052, 6, 4), RIVET, {
        bone: hand,
        at: hand.local([k * 0.075, 0.12, 0.04]),
        flat: true,
        name: `knuckle${s > 0 ? "L" : "R"}${k + 2}`,
      });
    }
    for (let k = -1; k <= 1; k += 1) {
      const clawBase = hand.local([k * 0.07, 0.11, -0.06]);
      b.spike(clawBase, hand.dir([0, 1, 0.22]), 0.13, 0.035, {
        color: CLAW,
        section: { ngon: 5 },
        name: `claw${s > 0 ? "L" : "R"}${k + 2}`,
      });
    }
  }

  for (const [i, leg] of legs.entries()) {
    const s = i === 0 ? 1 : -1;
    b.sweep(leg, (t) => 0.15 - t * 0.045, {
      section: { ngon: 6 },
      color: i === 0 ? LIMB_LIGHT : LIMB,
      smooth: false,
      caps: "round",
      name: `legTube${s > 0 ? "L" : "R"}`,
    });
    const foot = leg.tip!;
    b.part(new THREE.BoxGeometry(0.29, 0.18, 0.46), LIMB, {
      bone: foot,
      at: foot.local([0, 0.08, -0.02]),
      scale: [1, 1, 1],
      flat: true,
      name: `boot${s > 0 ? "L" : "R"}`,
    });
    for (let k = -1; k <= 1; k += 1) {
      b.spike(
        foot.local([k * 0.075, 0.18, 0.03]),
        foot.dir([0, 0.35, 1]),
        0.12,
        0.026,
        { color: CLAW, section: { ngon: 5 }, name: `toe${s > 0 ? "L" : "R"}${k + 2}` },
      );
    }
  }

  // Mushroom cap and its shadowed underside.
  b.part(new THREE.SphereGeometry(1, 8, 4), capPaint, {
    bone: head,
    at: head.local([0, 0.02, 0.34]),
    scale: [0.69, 0.39, 0.82],
    flat: true,
    name: "spottedCap",
  });
  b.part(new THREE.CylinderGeometry(0.5, 0.44, 0.075, 8), CAP_DARK, {
    bone: head,
    at: head.local([0, 0.02, 0.15]),
    flat: true,
    name: "capUnderside",
  });
  for (let i = 0; i < 12; i += 1) {
    const a = (i / 12) * Math.PI * 2;
    const p = head.local([Math.cos(a) * 0.42, Math.sin(a) * 0.49, 0.135]);
    b.part(new THREE.ConeGeometry(0.026, 0.11, 5), GILL, {
      bone: head,
      at: p,
      flat: true,
      name: `gill${i + 1}`,
    });
  }
  // A crown of angular cap spots gives the silhouette a readable fungal identity.
  for (let i = 0; i < 10; i += 1) {
    const a = (i / 10) * Math.PI * 2 + 0.22;
    const rad = i % 2 === 0 ? 0.37 : 0.2;
    b.part(new THREE.SphereGeometry(i % 3 === 0 ? 0.085 : 0.06, 6, 3), CAP_LIGHT, {
      bone: head,
      at: head.local([Math.cos(a) * rad, Math.sin(a) * rad * 1.15, 0.47 + (i % 3) * 0.025]),
      scale: [1.25, 0.3, 0.8],
      flat: true,
      name: `capSpot${i + 1}`,
    });
  }

  // Face, with separate upper/lower jaws and chunky teeth.
  b.part(new THREE.SphereGeometry(0.26, 7, 5), STEM, {
    bone: head,
    at: head.local([0, 0.18, -0.08]),
    scale: [0.9, 0.9, 1.05],
    flat: true,
    name: "faceStalk",
  });
  b.part(new THREE.BoxGeometry(0.26, 0.09, 0.16), CAP_DARK, {
    bone: head,
    at: head.local([0, 0.4, -0.15]),
    flat: true,
    name: "upperMouth",
  });
  b.part(new THREE.BoxGeometry(0.34, 0.13, 0.2), STEM_DARK, {
    bone: jaw,
    at: jaw.local([0, 0.1, 0]),
    flat: true,
    name: "lowerJaw",
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.075, 6, 4), EYE, {
      bone: head,
      at: head.local([s * 0.14, 0.42, 0.03]),
      flat: true,
      name: `eye${s > 0 ? "L" : "R"}`,
    });
    b.part(new THREE.SphereGeometry(0.03, 5, 4), PUPIL, {
      bone: head,
      at: head.local([s * 0.14, 0.47, 0.03]),
      flat: true,
      name: `pupil${s > 0 ? "L" : "R"}`,
    });
    b.spike(head.local([s * 0.09, 0.46, -0.11]), head.dir([0, 0.15, 1]), 0.13, 0.032, {
      color: CLAW,
      section: { ngon: 5 },
      name: `fang${s > 0 ? "L" : "R"}`,
    });
  }

  // Collar, belt, and repeated studs make the simple primitive body feel dressed.
  const torsoSurface = b.surface(torso);
  const collar = torsoSurface.loop(neck.joints[0], { lift: 0.018 });
  b.sweep(collar, 0.025, { color: BELT, section: { ngon: 6 }, name: "collarBand" });
  const belt = torsoSurface.loop(hips, { lift: 0.018 });
  b.sweep(belt, 0.032, { color: BELT, section: { ngon: 6 }, name: "waistBand" });
  b.along(belt, 12, (at) =>
    b.part(new THREE.SphereGeometry(0.028, 6, 4), RIVET, { at, flat: true, name: "beltRivet" }),
  );

  // Fungal freckles on the torso, constrained to the upper-facing facets.
  for (const hit of torsoSurface.scatter(24, {
    rng: rng(44),
    minDist: 0.1,
    filter: (candidate) => candidate.n.y > -0.1,
  })) {
    b.stick(new THREE.CylinderGeometry(0.035, 0.04, 0.014, 6), CAP_LIGHT, hit, {
      embed: 0.45,
      flat: true,
      name: "sporeFreckle",
    });
  }

  // Back ridge and shoulder growths: angular fungus instead of smooth armor.
  for (let i = 0; i < 5; i += 1) {
    const t = 0.14 + i * 0.19;
    const at = torso.at(t, 180, 0.015);
    b.spike(at, at, 0.12 + i * 0.015, 0.045, {
      color: CAP_DARK,
      section: { ngon: 5 },
      name: `backSpore${i + 1}`,
    });
  }
  for (const s of [1, -1]) {
    const shoulder = arms[s > 0 ? 0 : 1].joints[0];
    b.part(new THREE.ConeGeometry(0.11, 0.22, 6), CAP_DARK, {
      bone: shoulder,
      at: shoulder.local([0, 0, 0.18]),
      flat: true,
      name: `shoulderSpore${s > 0 ? "L" : "R"}`,
    });
    b.part(new THREE.SphereGeometry(0.075, 6, 4), CAP_LIGHT, {
      bone: shoulder,
      at: shoulder.local([s * 0.16, -0.02, 0.17]),
      flat: true,
      name: `shoulderKnob${s > 0 ? "L" : "R"}`,
    });
  }

  // A few small hanging spore pods at the back of the belt.
  const podPath = polyline([
    [0.23, 0.88, -0.27],
    [0.3, 0.72, -0.3],
    [0.23, 0.57, -0.26],
  ]);
  const pod = b.sprout("podL", hips, podPath, [0.045, 0.025], {
    count: 1,
    names: ["podLBase", "podLTip"],
    color: CAP_DARK,
    section: { ngon: 6 },
    caps: "round",
    role: "tentacle",
  });
  b.part(new THREE.SphereGeometry(0.08, 6, 4), CAP_LIGHT, {
    bone: pod.chain?.tip ?? hips,
    at: [0.23, 0.57, -0.26],
    flat: true,
    name: "podLobe",
  });

  return b.root;
}
