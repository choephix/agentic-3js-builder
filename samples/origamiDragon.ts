import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { lerp, vec } from "../src/math";
import { bezier, catmull } from "../src/path";
import { limb } from "../src/ik";
import { mix, noise, paint, smoothstep } from "../src/paint";

export const meta = {
  name: "Origami Dragon",
  description:
    "Eastern-style serpentine dragon folded from paper: faceted box-section body in an S-curve, coloured face with pale reverse, crease-line paint, horned head with jaw and whiskers, dorsal spikes and tassel tail.",
};

// Paper palette
const RED = "#c8392b"; // coloured face
const RED_DK = "#a52c20";
const REVERSE = "#f2e4c8"; // pale reverse
const CREASE = "#7d4a32";
const DARK = "#2b2320";
const HORN = "#f2e4c8";
const GOLD = "#d9a441";

type V = [number, number, number];
const P = (p: { x: number; y: number; z: number } | V, dx = 0, dy = 0, dz = 0): V => {
  const v = Array.isArray(p) ? p : [p.x, p.y, p.z];
  return [v[0] + dx, v[1] + dy, v[2] + dz];
};

export default function build() {
  const b = createBuilder({ name: "origamiDragon" });

  // ---- paper paint: coloured face on top, pale reverse below,
  // ---- crease lines at folds + faint grain
  const FOLDS = 26;
  const paper = paint((p, _n, s) => {
    const deg = ((s[1] % 360) + 360) % 360;
    // dorsal clock: 0 up, 180 belly
    const up = deg < 180 ? deg : 360 - deg;
    const bellyness = smoothstep(55, 125, up);
    let col = mix(RED, REVERSE, bellyness);
    // subtle shading variety per facet
    const facet = Math.abs(((deg + 45) % 90) - 45) / 45;
    col = mix(col, RED_DK, (1 - facet) * 0.35 * (1 - bellyness));
    // ring creases across the body at each fold
    const ft = (s[0] * FOLDS) % 1;
    const ring = Math.min(ft, 1 - ft);
    // facet edge creases (box section corners near 45,135,225,315)
    const corner = Math.min(Math.abs(deg - 45), Math.abs(deg - 135), Math.abs(deg - 225), Math.abs(deg - 315));
    const g = noise(p, 0.02, 3) - 0.5;
    col = mix(col, "#ffffff", g * 0.12);
    col = mix(col, "#8a6a4a", (0.5 - Math.abs(g)) * 0.1);
    if (ring < 0.035) col = mix(col, CREASE, 0.75 * (1 - ring / 0.035));
    if (corner < 5) col = mix(col, CREASE, 0.55 * (1 - corner / 5));
    return col;
  });

  // ---- body centreline: gentle S-curve, ~2.5 m, head high, tail low
  const bodyPts: V[] = [
    [-0.55, 0.32, -1.35],
    [-0.42, 0.34, -1.05],
    [-0.28, 0.4, -0.72],
    [-0.05, 0.46, -0.4],
    [0.22, 0.5, -0.08],
    [0.3, 0.52, 0.25],
    [0.2, 0.56, 0.58],
    [0.0, 0.62, 0.86],
    [-0.08, 0.7, 1.1],
  ];
  const bodyPath = catmull(bodyPts);
  const rootPt = bodyPts[4];
  const rootT = bodyPath.closestT(vec(rootPt));

  const hips = b.joint("hips", { at: rootPt, role: "spine" });
  const front = b.chain("spine", bodyPath.slice(rootT, 1), {
    parent: hips,
    count: 6,
    role: "spine",
  });
  const back = b.chain("tail", bodyPath.slice(rootT, 0), {
    parent: hips,
    count: 7,
    role: "tail",
  });

  // ---- body tube: square box section twisted to a diamond = folded facets
  const prof = (t: number): [number, number] => {
    const belly = Math.sin(Math.min(Math.max((t - 0.08) / 0.6, 0), 1) * Math.PI);
    const w = 0.018 + 0.1 * belly + (t > 0.75 ? (t - 0.75) * 0.12 : 0);
    const h = 0.018 + 0.115 * belly + (t > 0.75 ? (t - 0.75) * 0.16 : 0);
    return [w, h];
  };
  const bodyTube = b.sweep(bodyPath, prof, {
    bone: [back, hips, front],
    section: "box",
    twist: 45,
    smooth: false,
    color: paper,
    caps: { start: "point", end: "flat" },
  });

  // ---- head cluster
  const headBase = bodyPath.at(1);
  const hb: V = [headBase.x, headBase.y, headBase.z];
  const neckTip = front.joints[front.joints.length - 1];
  const head = b.joint("head", {
    parent: neckTip,
    at: hb,
    dir: [-0.15, 0.35, 1],
    role: "head",
    group: "head",
  });
  const snoutTip: V = P(hb, -0.08, 0.1, 0.36);
  b.frustumBox(hb, snoutTip, [0.13, 0.15], [0.06, 0.07], {
    bone: head,
    color: paper,
    name: "skull",
  });
  // brow ridge (folded plate over eyes)
  const browBase: V = P(hb, -0.02, 0.14, 0.18);
  b.frustumBox(browBase, P(browBase, -0.02, 0.05, 0.16), [0.2, 0.05], [0.14, 0.04], {
    bone: head,
    color: paper,
    name: "brow",
  });
  // snout top fold (pale reverse showing)
  b.frustumBox(P(hb, 0, 0.1, 0.2), P(snoutTip, 0, 0.015, -0.06), [0.1, 0.03], [0.05, 0.025], {
    bone: head,
    color: REVERSE,
    name: "snoutFold",
  });

  // lower jaw: separate joint + thin folded box
  const jawBase: V = P(hb, 0, -0.05, 0.07);
  const jaw = b.joint("jaw", {
    parent: head,
    at: jawBase,
    aim: P(hb, -0.05, -0.1, 0.5),
    role: "jaw",
  });
  const jawTip: V = P(snoutTip, 0, -0.1, -0.02);
  b.frustumBox(jawBase, jawTip, [0.11, 0.05], [0.045, 0.03], {
    bone: jaw,
    color: paper,
    name: "jawBox",
  });
  b.frustumBox(P(jawBase, 0, 0.025, 0.03), P(snoutTip, 0, -0.075, -0.04), [0.07, 0.012], [0.03, 0.01], {
    bone: jaw,
    color: REVERSE,
    name: "jawInner",
  });
  // teeth: tiny white folded spikes along jaw
  for (const s of [1, -1]) {
    const tag = s > 0 ? "L" : "R";
    for (let i = 0; i < 3; i++) {
      const t = 0.35 + i * 0.2;
      const p = lerp(vec(P(jawBase, s * 0.03, 0.03, 0.02)), vec(P(jawTip, s * 0.015, 0.02, 0)), t);
      b.spike(frame([p.x, p.y, p.z], [0, 1, 0]), [s * 0.1, 1, 0.1], 0.03, 0.008, {
        color: "#ffffff",
        bone: jaw,
        sides: 4,
        name: `tooth${tag}${i}`,
      });
    }
  }

  // eyes: dark beads with gold brow studs
  for (const s of [1, -1]) {
    const tag = s > 0 ? "L" : "R";
    b.part(new THREE.SphereGeometry(0.028, 6, 4), DARK, {
      bone: head,
      at: P(hb, s * 0.1, 0.08, 0.2),
      name: `eye${tag}`,
    });
    b.part(new THREE.OctahedronGeometry(0.02), GOLD, {
      bone: head,
      at: P(hb, s * 0.1, 0.13, 0.2),
      name: `browStud${tag}`,
    });
  }

  // horns: folded spikes sweeping back (5-sided)
  for (const s of [1, -1]) {
    const tag = s > 0 ? "L" : "R";
    const hornBase: V = P(hb, s * 0.07, 0.13, -0.02);
    const hornTip: V = P(hornBase, s * 0.16, 0.3, -0.3);
    b.sweep(bezier(hornBase, P(hornBase, s * 0.06, 0.22, -0.12), hornTip), [0.035, 0.002], {
      bone: head,
      color: HORN,
      sides: 5,
      smooth: false,
      caps: { start: "flat", end: "point" },
      name: `horn${tag}`,
    });
    const tb = lerp(vec(hornBase), vec(hornTip), 0.55);
    b.spike(frame([tb.x, tb.y, tb.z], vec([s * 0.3, 0.8, -0.5])), [s * 0.5, 0.6, -0.6], 0.12, 0.018, {
      color: HORN,
      bone: head,
      sides: 4,
      name: `tine${tag}`,
    });
  }

  // whiskers: paper rolls sweeping forward-out from the snout corners
  for (const s of [1, -1]) {
    const tag = s > 0 ? "L" : "R";
    const wb: V = P(snoutTip, s * 0.035, 0.0, -0.02);
    b.sweep(bezier(wb, P(wb, s * 0.25, 0.06, 0.15), P(wb, s * 0.4, 0.05, 0.4)), [0.008, 0.0015], {
      bone: head,
      color: REVERSE,
      sides: 5,
      caps: { start: "flat", end: "point" },
      name: `whisker${tag}`,
    });
  }

  // ---- dorsal ridge: folded spikes along the spine
  const ridgeLine = bodyTube.line(0, 0.005).slice(0.06, 0.97);
  const nSpikes = 13;
  const placed = b.along(ridgeLine, nSpikes, () => {});
  placed.forEach((at, i) => {
    const tall = 0.05 + 0.075 * Math.sin((i / (nSpikes - 1)) * Math.PI);
    b.spike(at, at, tall, tall * 0.45, {
      color: i % 3 === 2 ? REVERSE : RED_DK,
      sides: 4,
      name: `ridge${i}`,
    });
  });

  // ---- four short legs, clawed feet on the floor
  const legDefs = [
    { side: 1, zt: 0.42, name: "FL", fwd: 0.06 },
    { side: -1, zt: 0.42, name: "FR", fwd: 0.06 },
    { side: 1, zt: -0.28, name: "HL", fwd: -0.06 },
    { side: -1, zt: -0.28, name: "HR", fwd: -0.06 },
  ];
  for (const leg of legDefs) {
    const s = leg.side;
    const tBody = bodyPath.closestT(vec([0, 0.5, leg.zt]));
    const hipPt = bodyPath.at(tBody);
    const root: V = [hipPt.x + s * 0.09, hipPt.y - 0.02, hipPt.z];
    const foot: V = [hipPt.x + s * 0.13, 0.05, leg.zt + leg.fwd];
    const pts = limb(
      root,
      foot,
      [0.26, 0.24, 0.1],
      [
        [s * 0.5, 0, 0.3],
        [0, 0, 1],
      ],
    );
    if (pts[pts.length - 1].distanceTo(vec(foot)) > 1e-3) throw new Error(`leg ${leg.name} too short`);
    const chain = b.chain(`leg${leg.name}`, pts, {
      parent: tBody > rootT ? front.joints[0] : back.joints[0],
      names: [`hip${leg.name}`, `knee${leg.name}`, `ankle${leg.name}`],
      role: "leg",
    });
    b.sweep(pts.slice(0, 3), [0.05, 0.032], {
      bone: chain,
      section: "box",
      twist: 45,
      smooth: false,
      color: paper,
      name: `legTube${leg.name}`,
    });
    const ankle = pts[2];
    const ankleV: V = [ankle.x, ankle.y, ankle.z];
    b.frustumBox(ankleV, P(foot, 0, -0.01, 0.05), [0.07, 0.05], [0.085, 0.035], {
      bone: chain.joints[2],
      color: paper,
      name: `foot${leg.name}`,
    });
    for (let c = -1; c <= 1; c++) {
      const cb: V = P(foot, c * 0.03, 0.01, 0.09);
      b.spike(frame(cb, [0, 0, 1]), [c * 0.25, -0.35, 1], 0.055, 0.012, {
        color: REVERSE,
        bone: chain.joints[2],
        sides: 4,
        name: `claw${leg.name}${c + 1}`,
      });
    }
  }

  // ---- tail tassel: fanned folded strips
  const tailTip = bodyPath.at(0);
  const tailTipV: V = [tailTip.x, tailTip.y, tailTip.z];
  b.ring(
    frame(tailTipV, [-0.3, 0.1, -1]),
    {
      count: 5,
      radius: 0.015,
      tilt: 38,
      role: "fan",
      joints: 1,
      name: "tassel",
      parent: back.joints[back.joints.length - 1],
    },
    (item) => {
      const tip: V = P(
        [item.at.x, item.at.y, item.at.z],
        item.outward.x * 0.2,
        item.outward.y * 0.2,
        item.outward.z * 0.2,
      );
      const midP: V = P(
        [item.at.x, item.at.y, item.at.z],
        item.outward.x * 0.08,
        item.outward.y * 0.08,
        item.outward.z * 0.08,
      );
      b.sweep(bezier([item.at.x, item.at.y, item.at.z], midP, tip), [0.016, 0.002], {
        color: item.i % 2 ? REVERSE : RED,
        sides: 4,
        smooth: false,
        caps: { start: "flat", end: "point" },
        name: `tassel${item.i}`,
      });
    },
  );

  return b.root;
}
