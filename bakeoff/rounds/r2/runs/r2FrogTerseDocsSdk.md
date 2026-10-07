```ts
import * as THREE from "three";
import { createBuilder, limb, rng, countershade, mottle } from "agentic-3js-builder";

export const meta = {
  name: "Green Frog",
  description: "A stylized green frog in a rest pose, with spread webbed hind feet, splayed front toes, bulging gold eyes and a separate jaw.",
};

const GREEN = "#5fae3a";
const DARK = "#2f6b27";
const BELLY = "#ece6bd";
const LIP = "#9ccf5a";
const GOLD = "#e8b923";
const BLACK = "#111111";
const TOE = "#e8883a";
const WEB = "#7bbf4a";
const TYMP = "#b8a85c";
const FOLD = "#b6dc6a";

export default function build() {
  const b = createBuilder({ name: "frog" });
  const coat = countershade(mottle(GREEN, DARK, { size: 0.025, contrast: 0.6, seed: 4 }), BELLY, { level: -0.25 });

  // skeleton
  const hips = b.joint("hips", { at: [0, 0.04, -0.045] });
  const spine = b.chain(
    "spine",
    [[0, 0.04, -0.045], [0, 0.042, 0.0], [0, 0.048, 0.04]],
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const head = b.joint("head", { parent: spine.joints[2], at: [0, 0.05, 0.04], dir: [0, 0.1, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ down: 0.012, forward: -0.005 }),
    aim: head.local({ down: 0.012, forward: 0.09 }),
    role: "jaw",
  });

  // body
  const body = b.loft(
    [
      { at: [0, 0.036, -0.07], w: 0.05, h: 0.045 },
      { at: [0, 0.039, -0.04], w: 0.085, h: 0.06 },
      { at: [0, 0.041, 0.0], w: 0.09, h: 0.065 },
      { at: [0, 0.046, 0.04], w: 0.07, h: 0.056 },
    ],
    { bone: spine, color: coat },
  );

  // head
  b.part(new THREE.SphereGeometry(1, 12, 8), coat, {
    bone: head, at: head.local({ forward: 0.02, up: 0.004 }), scale: [0.038, 0.02, 0.05],
  });
  b.part(new THREE.SphereGeometry(1, 10, 6), LIP, {
    bone: jaw, at: jaw.local({ forward: 0.025, up: 0.0 }), scale: [0.034, 0.008, 0.04],
  });
  // throat sac
  b.part(new THREE.SphereGeometry(1, 8, 6), BELLY, {
    bone: jaw, at: jaw.local({ forward: 0.02, down: 0.006 }), scale: [0.022, 0.008, 0.026],
  });

  for (const s of [1, -1]) {
    // eyes
    const ec = head.local({ left: s * 0.025, up: 0.026, forward: 0.02 });
    b.part(new THREE.SphereGeometry(0.014, 8, 6), GOLD, { bone: head, at: ec });
    b.part(new THREE.SphereGeometry(0.0065, 6, 4), BLACK, {
      bone: head, at: head.local({ left: s * 0.0335, up: 0.031, forward: 0.0295 }), scale: [0.7, 1, 1.1],
    });
    // eyelid cap
    b.part(new THREE.SphereGeometry(0.0152, 8, 4, 0, Math.PI * 2, 0, Math.PI * 0.4), DARK, {
      bone: head, at: ec, dir: [0, 1, 0],
    });
    // nostrils
    b.part(new THREE.SphereGeometry(0.0035, 5, 4), BLACK, {
      bone: head, at: head.local({ left: s * 0.01, up: 0.019, forward: 0.068 }),
    });
    // eardrum
    b.part(new THREE.CylinderGeometry(0.0095, 0.0095, 0.003, 8), TYMP, {
      bone: head, at: head.local({ left: s * 0.036, up: 0.012, forward: -0.006 }), dir: [s, 0.15, 0],
    });
    // dorsolateral fold
    b.sweep(body.line(-s * 48, 0.001), [0.0025, 0.0035, 0.0025], { color: FOLD, sides: 5 });
  }

  // back spots
  const skin = b.surface(body);
  for (const hit of skin.scatter(30, { rng: rng(3), minDist: 0.014, filter: (h) => h.n.y > 0.4 }))
    b.stick(new THREE.SphereGeometry(0.006, 6, 4), DARK, hit, { embed: 0.5, scale: [1, 0.45, 1.3] });

  // front legs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pts = limb(
      [s * 0.04, 0.036, 0.03],
      [s * 0.058, 0.008, 0.055],
      [0.03, 0.028],
      [[s * 0.5, 0.2, -1]],
    );
    const leg = b.chain(`legF${side}`, pts, {
      parent: spine.joints[1],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "leg",
    });
    b.sweep(leg, [0.012, 0.0095, 0.007], { color: coat, sides: 6 });
    const wrist = pts[2];
    const angs = [-15, 5, 25, 45];
    const lens = [0.022, 0.028, 0.028, 0.022];
    angs.forEach((deg, i) => {
      const a = (deg * Math.PI) / 180;
      const tip: [number, number, number] = [
        wrist.x + s * Math.sin(a) * lens[i] + s * 0.004,
        0.0045,
        wrist.z + Math.cos(a) * lens[i],
      ];
      b.capsule([wrist.x, wrist.y, wrist.z], tip, [0.005, 0.0035], { bone: leg.tip!, color: GREEN, sides: 5 });
      b.part(new THREE.SphereGeometry(0.0055, 6, 4), TOE, { bone: leg.tip!, at: tip, scale: [1, 0.7, 1] });
    });
  }

  // hind legs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pts = limb(
      [s * 0.04, 0.04, -0.05],
      [s * 0.1, 0.012, -0.035],
      [0.055, 0.055, 0.045],
      [[s * 0.5, 0.3, 1], [0, 0.5, -1]],
    );
    const leg = b.chain(`legH${side}`, pts, {
      parent: hips,
      names: [`hipH${side}`, `kneeH${side}`, `ankleH${side}`, `footH${side}`],
      role: "leg",
    });
    b.sweep(leg, [0.022, 0.017, 0.011, 0.007], { color: coat, sides: 6 });
    // thigh muscle
    b.part(new THREE.SphereGeometry(1, 8, 6), coat, {
      bone: leg.joints[0], at: [s * 0.05, 0.036, -0.055], scale: [0.02, 0.028, 0.035],
    });
    const end = pts[3];
    const angs = [5, 23, 41, 59, 77];
    const lens = [0.034, 0.05, 0.06, 0.054, 0.04];
    const bones = leg.tip!;
    const tips: [number, number, number][] = [];
    const bases: [number, number, number][] = [];
    angs.forEach((deg, i) => {
      const a = (deg * Math.PI) / 180;
      const dx = s * Math.sin(a);
      const dz = Math.cos(a);
      const base: [number, number, number] = [end.x + dx * 0.004, end.y, end.z + dz * 0.004];
      const tip: [number, number, number] = [end.x + dx * lens[i], 0.0045, end.z + dz * lens[i]];
      bases.push(base);
      tips.push(tip);
      b.capsule(base, tip, [0.0055, 0.0035], { bone: bones, color: GREEN, sides: 5 });
      b.part(new THREE.SphereGeometry(0.0058, 6, 4), TOE, { bone: bones, at: tip, scale: [1, 0.7, 1] });
    });
    for (let i = 0; i < 4; i++) {
      const lerpP = (p: number[], q: number[], t: number): [number, number, number] => [
        p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, p[2] + (q[2] - p[2]) * t,
      ];
      b.membrane(
        [lerpP(bases[i], tips[i], 0.1), lerpP(bases[i], tips[i], 0.88)],
        [lerpP(bases[i + 1], tips[i + 1], 0.1), lerpP(bases[i + 1], tips[i + 1], 0.88)],
        { thickness: 0.0015, color: WEB, bone: bones, rows: 2, cols: 2 },
      );
    }
  }

  return b.root;
}
```