import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { catmull, bezier } from "../src/path";
import { paint } from "../src/paint";
import { svg } from "../src/texture";
import { cel, animeEye, furEdge, zigzag } from "../kits/toon";
import { glow } from "../kits/glow";

export const meta = {
  name: "Moonveil — Nine-Tailed Kitsune",
  description: "A celestial fox with nine independently articulated brush tails, jade spirit fires, coral markings and a gold-trimmed ceremonial collar.",
  style: "high-fantasy anime",
  commit: "e503085",
};

const IVORY = cel("#fff5df", "#cbbbd2");
const WHITE = cel("#fffdf0", "#ded4e4");
const CORAL = cel("#e56649", "#a04463");
const GOLD = cel("#ffda79", "#af7945");
const NAVY = cel("#243e68", "#252548");
const PINK = cel("#ed99a4", "#b5648d");
const COAT = furEdge(CORAL, IVORY, { level: -0.28, teeth: 0.18, period: 0.09 });
const TAIL = paint((_p, _n, s) => {
  const feather = 0.035 * zigzag(s[1] / 34);
  if (s[0] < 0.24 + feather) return CORAL;
  if (s[0] > 0.66 && s[0] < 0.69) return GOLD;
  const angle = Math.abs(((s[1] + 180) % 360) - 180);
  if (s[0] > 0.35 && s[0] < 0.59 && angle < 12 + 12 * Math.sin(s[0] * 30)) return PINK;
  return WHITE;
});

export default function build() {
  const b = createBuilder({ name: "nineTailedKitsune", paintSize: 2048 });
  const hips = b.joint("hips", { at: [0, 0.71, -0.27], dir: [0, 0, 1], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.71, -0.3], [0, 0.75, 0], [0, 0.81, 0.35], [0, 0.86, 0.48]]), {
    parent: hips, names: ["spineBack", "spineMid", "spineChest", "chest"], role: "spine",
  });
  const neck = b.chain("neck", catmull([[0, 0.86, 0.46], [0, 0.99, 0.54], [0, 1.10, 0.64]]), {
    parent: spine.tip!, names: ["neckBase", "neckMid", "neckTop"], role: "neck",
  });
  const head = b.joint("head", { parent: neck.tip!, at: [0, 1.12, 0.70], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: head.local({ down: 0.065, forward: 0.025 }), dir: [0, 0, 1], role: "jaw" });
  const ears = [1, -1].map((s) => b.joint(`ear${s > 0 ? "L" : "R"}`, {
    parent: head, at: head.local({ left: s * 0.115, up: 0.12, back: 0.02 }), dir: [s * 0.25, 1, -0.1], role: "hinge",
  }));
  const legs = [true, false].flatMap((front) => [1, -1].map((s) => {
    const label = `${front ? "front" : "hind"}${s > 0 ? "L" : "R"}`;
    const x = s * (front ? 0.19 : 0.23);
    const z = front ? 0.35 : -0.3;
    const points = front
      ? [[x, 0.8, z], [x * 1.16, 0.46, z - 0.015], [x * 1.24, 0.13, z + 0.01], [x * 1.24, 0.052, z + 0.10]]
      : [[x, 0.68, z], [x * 1.14, 0.42, z + 0.09], [x * 1.22, 0.18, z - 0.10], [x * 1.22, 0.052, z + 0.045]];
    const chain = b.chain(label, catmull(points), {
      parent: front ? spine.joints[2] : hips,
      names: [`${label}Hip`, `${label}Knee`, `${label}Ankle`, `${label}Paw`], role: "leg",
      contact: [points[3][0], 0, points[3][2]],
    });
    const toes = [-1, 0, 1].map((toe) => b.joint(`${label}Toe${toe + 2}`, {
      parent: chain.tip!, at: chain.tip!.local({ left: toe * 0.041, forward: 0.055, down: 0.018 }), dir: [0, 0, 1], role: "digit",
    }));
    return { chain, toes, front, s, label };
  }));
  // Symmetric nine-brush fan: one central plume and four separately spaced pairs.
  const fanEnds = [[0, 2.17, -1.11], [-0.52, 2.03, -1.20], [0.52, 2.03, -1.20], [-0.96, 1.68, -1.29], [0.96, 1.68, -1.29], [-1.27, 1.22, -1.36], [1.27, 1.22, -1.36], [-1.42, 0.65, -1.27], [1.42, 0.65, -1.27]];
  const tails = fanEnds.map((end, i) => {
    const [x, y, z] = end;
    return b.chain(`tail${i + 1}`, catmull([
      [x * 0.115, 0.73, -0.36],
      [x * 0.41, 0.75 + (y - 0.75) * 0.30, -0.72],
      [x * 0.90, 0.75 + (y - 0.75) * 0.72, z - 0.04],
      end,
    ]), { parent: hips, names: [`tail${i + 1}Base`, `tail${i + 1}Middle`, `tail${i + 1}Outer`, `tail${i + 1}Tip`], role: "tail" });
  });
  const tassels = [1, -1].map((s) => b.chain(`tassel${s > 0 ? "L" : "R"}`, [[s * 0.155, 0.98, 0.63], [s * 0.18, 0.85, 0.65], [s * 0.19, 0.71, 0.68]], {
    parent: neck.joints[1], names: [`charm${s > 0 ? "L" : "R"}`, `tassel${s > 0 ? "L" : "R"}`], role: "hinge",
  }));

  const body = b.sweep(spine, (t) => [0.205 - 0.035 * t, 0.23 - 0.025 * t], { color: COAT, sides: 10, name: "body" });
  b.sweep(neck, [0.195, 0.165, 0.135], { color: IVORY, sides: 10, name: "neckRuff" });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 10, 7), COAT, { bone: hips, at: [s * 0.18, 0.65, -0.23], scale: [0.19, 0.23, 0.22], name: `haunch${s}` });
    for (let k = 0; k < 4; k++) {
      b.sweep(bezier([s * (0.12 + k * 0.022), 0.99 - k * 0.063, 0.56], [s * (0.26 + k * 0.008), 0.90 - k * 0.064, 0.47], [s * (0.23 + k * 0.008), 0.81 - k * 0.06, 0.41]), [0.075, 0.055, 0], { bone: neck.joints[0], color: IVORY, sides: 6, name: `ruffLock${s}_${k}` });
    }
  }
  // Small sculpted dorsal locks, not an untextured cylindrical back.
  for (const t of [0.15, 0.28, 0.41, 0.54]) {
    const p = body.at(t, 0);
    b.spike(p, [0, 0.1, -1], 0.12, 0.043, { color: CORAL, sides: 6, name: `backLock${t}` });
  }

  for (const leg of legs) {
    b.sweep(leg.chain, leg.front ? [0.09, 0.062, 0.042, 0.05] : [0.115, 0.077, 0.041, 0.052], {
      color: paint((_p, _n, s) => s[0] > 0.58 ? NAVY : COAT), sides: 8, name: `${leg.label}Leg`,
    });
    const paw = leg.chain.tip!;
    b.part(new THREE.SphereGeometry(1, 10, 6), IVORY, { bone: paw, at: paw.at, scale: [0.083, 0.052, 0.109], name: `${leg.label}Paw` });
    for (const toe of leg.toes) {
      b.part(new THREE.SphereGeometry(1, 6, 4), WHITE, { bone: toe, at: toe.at, scale: [0.027, 0.032, 0.063], name: `${toe.name}Pad` });
      b.spike(toe.moved({ forward: 0.045, up: 0.006 }), [0, -0.08, 1], 0.032, 0.011, { color: "#f6d991", sides: 5, name: `${toe.name}Claw` });
    }
    b.sweep(leg.chain, [0.067, 0.065], { from: 0.59, to: 0.65, color: GOLD, caps: "flat", sides: 8, name: `${leg.label}Cuff` });
    const seal = leg.chain.at(0.68);
    b.part(new THREE.OctahedronGeometry(0.027), "#63f3e2", { at: seal.moved({ forward: 0.045 }), scale: [0.7, 1.2, 0.4], name: `${leg.label}Gem` });
  }

  const skull = b.part(new THREE.SphereGeometry(1, 16, 10), COAT, { bone: head, at: head.local({ up: 0.048 }), scale: [0.19, 0.175, 0.195], name: "skull" });
  b.sweep([head.local({ down: 0.024, forward: 0.08 }), head.local({ down: 0.047, forward: 0.255 })], (t) => [0.119 - 0.068 * t, 0.073 - 0.043 * t], { bone: head, color: IVORY, sides: 8, caps: "flat", name: "upperMuzzle" });
  b.sweep([jaw.at, jaw.local({ forward: 0.225 })], (t) => [0.089 - 0.049 * t, 0.029 - 0.014 * t], { bone: jaw, color: IVORY, sides: 8, caps: "round", name: "lowerJaw" });
  b.part(new THREE.SphereGeometry(1, 8, 6), "#28233e", { bone: head, at: head.local({ down: 0.04, forward: 0.263 }), scale: [0.04, 0.025, 0.023], name: "nose" });
  b.part(new THREE.SphereGeometry(0.007, 5, 4), "#fff5e9", { bone: head, at: head.local({ left: -0.012, down: 0.026, forward: 0.278 }), name: "noseGlint" });
  for (const s of [1, -1]) {
    b.sweep(bezier(head.local({ left: s * 0.035, down: 0.068, forward: 0.24 }), head.local({ left: s * 0.078, down: 0.07, forward: 0.17 }), head.local({ left: s * 0.099, down: 0.045, forward: 0.11 })), 0.0035, { color: "#62394e", bone: head, sides: 5, name: `mouth${s}` });
    for (let k = 0; k < 3; k++) {
      b.sweep(bezier(head.local({ left: s * 0.145, up: 0.025 - k * 0.034, forward: 0.015 }), head.local({ left: s * (0.245 + k * 0.018), up: 0.04 - k * 0.043, back: 0.01 }), head.local({ left: s * (0.31 - k * 0.018), up: 0.10 - k * 0.071, back: 0.055 })), [0.064, 0.04, 0], { bone: head, color: WHITE, sides: 6, name: `cheekLock${s}_${k}` });
    }
  }
  ears.forEach((ear, i) => {
    const s = i === 0 ? 1 : -1;
    const base = ear.at;
    b.extrude([[-0.08, -0.025], [0.07, -0.045], [0.13, 0.28], [0.035, 0.20]], {
      at: base, x: [s, 0, 0], y: [0, 1, -0.12], thickness: [0.07, 0.012], color: CORAL, bone: ear, name: `earShell${s}`,
    });
    b.extrude([[-0.045, 0.014], [0.048, 0.004], [0.105, 0.223]], {
      at: ear.local({ forward: 0.039 }), x: [s, 0, 0], y: [0, 1, -0.12], thickness: 0.009, color: PINK, bone: ear, name: `earInner${s}`,
    });
    b.spike(ear.moved({ up: 0.025, forward: 0.044 }), [s * 0.2, 1, 0], 0.096, 0.035, { color: IVORY, bone: ear, sides: 6, name: `earFluff${s}` });
  });
  const eyes = animeEye({ iris: "#37cbbb", irisLight: "#bdffdb", irisDark: "#265a89", blush: false, brow: false, size: 512 });
  for (const s of [1, -1]) {
    const hit = b.surface(skull).around(skull.at).at(s * 43, 4)!;
    b.decal(skull, eyes, { at: hit, size: [0.091, 0.103], mirror: s > 0, roll: s * -12, name: `eye${s}` });
    const brow = b.surface(skull).around(skull.at).at(s * 39, 33)!;
    b.stick(new THREE.OctahedronGeometry(0.028), GOLD, brow, { scale: [1.2, 0.16, 0.36], name: `browMark${s}` });
  }
  const sigil = svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 150"><path d="M50 3 Q77 34 50 74 Q23 34 50 3Z" fill="#ffd97b"/><path d="M50 18 Q64 36 50 54 Q36 36 50 18Z" fill="#57cfc4"/><path d="M50 83 Q78 63 83 42 Q100 82 50 113 Q0 82 17 42 Q22 63 50 83Z" fill="#fff2d8"/><path d="M50 123 l9 10 -9 15 -9 -15Z" fill="#ffd97b"/></svg>`, { size: 256 });
  b.decal(skull, sigil, { at: b.surface(skull).around(skull.at).at(0, 37)!, size: [0.075, 0.115], name: "foreheadSigil" });

  // Indigo collar, scalloped gold edge, filigree medallion and articulated tassels.
  const collar = b.ring(neck.at(0.48), { count: 14, radius: 0.17 });
  b.sweep(catmull(collar.items, { closed: true }), 0.026, { color: NAVY, sides: 6, name: "ceremonialCollar" });
  collar.items.forEach((p, i) => b.part(new THREE.OctahedronGeometry(0.018), GOLD, { at: p, name: `collarStud${i}` }));
  b.extrude([[-0.085, 0.055], [0.085, 0.055], [0.071, -0.052], [0, -0.15], [-0.071, -0.052]], { at: [0, 0.9, 0.674], x: [1, 0, 0], thickness: 0.014, color: GOLD, bone: neck.joints[0], name: "medallionBorder" });
  b.extrude([[-0.068, 0.042], [0.068, 0.042], [0.053, -0.044], [0, -0.124], [-0.053, -0.044]], { at: [0, 0.9, 0.686], x: [1, 0, 0], thickness: 0.012, color: NAVY, bone: neck.joints[0], name: "medallionEnamel" });
  const filigree = svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 160"><g fill="none" stroke="#ffdd8a" stroke-width="4"><path d="M60 137 Q12 96 22 47 Q32 14 49 42 Q64 67 31 60 M60 137 Q108 96 98 47 Q88 14 71 42 Q56 67 89 60"/><path d="M60 126 L60 18 M39 104 Q23 91 40 82 M81 104 Q97 91 80 82"/></g><path d="M60 27 L77 58 L60 89 L43 58Z" fill="#57e7d8"/><path d="M60 36 L66 58 L60 69 L54 58Z" fill="#e9fff0"/></svg>`, { size: 256 });
  b.part(new THREE.PlaneGeometry(0.12, 0.16), "#ffffff", { bone: neck.joints[0], at: [0, 0.855, 0.695], texture: filigree, name: "medallionFiligree" });
  tassels.forEach((chain, i) => {
    b.sweep(chain, 0.009, { color: GOLD, sides: 5, name: `tasselCord${i}` });
    const bell = chain.at(0.43);
    b.part(new THREE.SphereGeometry(0.038, 8, 6), GOLD, { at: bell, name: `bell${i}` });
    b.part(new THREE.OctahedronGeometry(0.017), "#55eddf", { at: bell.moved({ forward: 0.032 }), name: `bellStone${i}` });
    for (let k = 0; k < 7; k++) {
      const p = chain.at(0.55);
      b.sweep(bezier(p.moved({ left: (k - 3) * 0.007 }), p.moved({ left: (k - 3) * 0.01, down: 0.065 }), p.moved({ left: (k - 3) * 0.012, down: 0.13 })), [0.006, 0.003], { bone: chain.joints[1], color: k % 2 ? CORAL : PINK, sides: 4, name: `tasselThread${i}_${k}` });
    }
  });

  tails.forEach((tail, i) => {
    const skin = b.sweep(tail, [0.075, 0.125, 0.17, 0.13, 0], { color: TAIL, sides: 10, name: `brushTail${i + 1}` });
    for (const angle of [-70, 70]) {
      for (const t of [0.40, 0.51, 0.62, 0.75]) {
        const p = skin.at(t, angle);
        const direction = p.n.clone().multiplyScalar(0.7).add(p.tangent);
        b.spike(p, direction, 0.105, 0.032, { color: WHITE, sides: 5, name: `tailFur${i}_${angle}_${t}` });
      }
    }
    // Gold split-tip motifs read on both sides of each broad white brush.
    for (const angle of [0, 180]) {
      const path = skin.line(angle, 0.002).slice(0.70, 0.86);
      b.sweep(path, [0.006, 0.002], { bone: tail, color: GOLD, sides: 5, name: `tailGoldInlay${i}_${angle}` });
    }
    const tip = tail.tip!;
    const p = tip.at;
    const fire = catmull([p, p.clone().add(new THREE.Vector3(-0.035, 0.075, 0.025)), p.clone().add(new THREE.Vector3(0.025, 0.16, 0.012)), p.clone().add(new THREE.Vector3(-0.015, 0.26, 0))]);
    glow(b.sweep(fire, [0.022, 0.057, 0.034, 0], { bone: tip, color: "#3bcfc5", sides: 7, name: `spiritFlame${i + 1}` }), 1.2);
    const inner = catmull([p.clone().add(new THREE.Vector3(0, 0.018, 0.027)), p.clone().add(new THREE.Vector3(-0.014, 0.075, 0.055)), p.clone().add(new THREE.Vector3(0.014, 0.178, 0.024))]);
    glow(b.sweep(inner, [0.014, 0.031, 0], { bone: tip, color: "#d8fff0", sides: 6, name: `spiritCore${i + 1}` }), 1.35);
    glow(b.part(new THREE.OctahedronGeometry(0.016), "#83fff0", { bone: tip, at: p.clone().add(new THREE.Vector3(0.055, 0.225, 0)), name: `spiritSpark${i + 1}` }), 1.4);
  });
  return b.root;
}
