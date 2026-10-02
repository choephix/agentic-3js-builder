import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { glow } from "../kits/glow";
import { catmull, bezier } from "../src/path";
import { mottle, scales } from "../src/paint";
import { rng } from "../src/math";

const SHELL = "#241447";
const SHELL_DARK = "#100827";
const SHELL_EDGE = "#5a2b87";
const VOID = "#080516";
const BELLY = "#321654";
const MAGENTA = "#bb2c9a";
const CYAN = "#42e8dc";
const CYAN_DARK = "#126d78";
const EYE_WHITE = "#d6d4ff";
const IRIS = "#8bffff";
const PUPIL = "#090319";
const TOOTH = "#f3d7b5";
const SCARLET = "#e74a72";

export const meta = {
  name: "Void Horror",
  description: "A carapaced void-touched tentacle beast with a single luminous great eye and a crown of hooked feelers.",
  style: "League of Legends",
  commit: "07503e3",
};

export default function build() {
  const b = createBuilder({ name: "voidHorror", detail: 1 });
  const random = rng(7319);

  // Skeleton first: a central spine, articulated eye-crown and eight neutral, spread tentacles.
  const core = b.joint("core", { at: [0, 1.02, -0.08], dir: [0, 0.05, 1], role: "spine" });
  const spinePath = catmull([
    [0, 0.98, -0.44],
    [0, 1.08, -0.12],
    [0, 1.18, 0.18],
    [0, 1.25, 0.43],
  ]);
  const spine = b.chain("spine", spinePath, {
    parent: core,
    count: 4,
    names: ["spineBack", "spineMid", "spineFront", "spineCrown"],
    role: "spine",
  });

  const head = b.joint("head", { parent: spine.joints[spine.joints.length - 1], at: [0, 1.38, 0.52], dir: [0, -0.04, 1], role: "head" });
  const jawUpper = b.joint("jawUpper", { parent: head, at: [0, 1.30, 0.58], dir: [0, -0.02, 1], role: "jaw" });
  const jawLower = b.joint("jawLower", { parent: head, at: [0, 1.12, 0.58], dir: [0, 0.12, 1], role: "jaw" });

  const tentacleData: Array<[string, number[][]]> = [
    ["feelLeftBack", [[0.22, 1.02, -0.26], [0.56, 0.70, -0.54], [0.91, 0.32, -0.80], [1.06, 0.032, -0.94]]],
    ["feelRightBack", [[-0.22, 1.02, -0.26], [-0.56, 0.70, -0.54], [-0.91, 0.32, -0.80], [-1.06, 0.032, -0.94]]],
    ["feelLeftSide", [[0.36, 1.03, -0.02], [0.80, 0.68, -0.05], [1.12, 0.30, 0.12], [1.22, 0.032, 0.29]]],
    ["feelRightSide", [[-0.36, 1.03, -0.02], [-0.80, 0.68, -0.05], [-1.12, 0.30, 0.12], [-1.22, 0.032, 0.29]]],
    ["feelLeftFront", [[0.28, 1.10, 0.24], [0.62, 0.72, 0.50], [0.82, 0.32, 0.78], [0.76, 0.032, 1.02]]],
    ["feelRightFront", [[-0.28, 1.10, 0.24], [-0.62, 0.72, 0.50], [-0.82, 0.32, 0.78], [-0.76, 0.032, 1.02]]],
    ["feelLeftReach", [[0.16, 1.10, 0.36], [0.28, 0.72, 0.77], [0.34, 0.32, 1.10], [0.16, 0.032, 1.30]]],
    ["feelRightReach", [[-0.16, 1.10, 0.36], [-0.28, 0.72, 0.77], [-0.34, 0.32, 1.10], [-0.16, 0.032, 1.30]]],
  ];
  const tentacles = tentacleData.map(([name, points]) => {
    const chain = b.chain(name, catmull(points), {
      parent: core,
      count: 4,
      names: [`${name}Base`, `${name}MidA`, `${name}MidB`, `${name}Tip`],
      role: "tentacle",
      up: [0, 1, 0],
    });
    const sweep = b.sweep(chain, (t) => [0.155 * (1 - t) + 0.032, 0.135 * (1 - t) + 0.025], {
      section: "circle",
      color: (t) => (t > 0.82 ? MAGENTA : SHELL),
      bands: [[0.26, SHELL_EDGE], [0.42, SHELL], [0.68, SHELL_EDGE], [0.82, SHELL]],
      caps: "round",
      name: `${name}Tube`,
    });
    return { name, chain, sweep };
  });

  const shellPaint = scales(mottle(SHELL, SHELL_EDGE, { size: 0.34, contrast: 0.7, seed: 13 }), SHELL_DARK, {
    size: 0.16,
    width: 0.14,
    seed: 23,
  });
  const shell = b.sweep(spine, (t) => [0.48 - t * 0.06, 0.34 - t * 0.015], {
    section: "circle",
    sides: 8,
    color: shellPaint,
    sectors: [[112, 248, BELLY]],
    caps: "round",
    name: "armoredMantle",
  });

  // Thick low-poly head shell and the separate, opening mouth bones.
  b.part(new THREE.IcosahedronGeometry(0.38, 1), shellPaint, {
    bone: head,
    at: head.local([0, 0.03, 0.03]),
    scale: [1.08, 0.88, 0.94],
    flat: true,
    name: "crownShell",
  });
  const upperMouth = bezier([0, 1.30, 0.52], [0, 1.31, 0.70], [0, 1.27, 0.87], [0, 1.27, 1.02]);
  const lowerMouth = bezier([0, 1.12, 0.54], [0, 1.08, 0.72], [0, 1.08, 0.89], [0, 1.13, 1.00]);
  b.sweep(upperMouth, [0.14, 0.07], { bone: jawUpper, color: VOID, section: { ngon: 6 }, caps: "round", name: "upperMouth" });
  b.sweep(lowerMouth, [0.12, 0.06], { bone: jawLower, color: VOID, section: { ngon: 6 }, caps: "round", name: "lowerMouth" });

  // The single great eye: layered, readable, and self-lit like a League spell effect.
  const eyeCenter: [number, number, number] = [0, 1.43, 0.77];
  b.part(new THREE.SphereGeometry(0.265, 16, 10), EYE_WHITE, {
    bone: head,
    at: eyeCenter,
    scale: [1.1, 0.98, 0.60],
    flat: true,
    name: "greatEyeOrb",
  });
  for (let i = 0; i < 14; i += 1) {
    const angle = (i / 14) * Math.PI * 2;
    const bead = b.part(new THREE.SphereGeometry(0.034, 6, 4), MAGENTA, {
      bone: head,
      at: [Math.cos(angle) * 0.23, 1.43 + Math.sin(angle) * 0.23, 0.94],
      flat: true,
      name: `eyeRim${i}`,
    });
    glow(bead, 0.8);
  }
  const iris = b.part(new THREE.CircleGeometry(0.18, 16), IRIS, {
    bone: head,
    at: [0, 1.43, 0.925],
    dir: [0, 0, 1],
    axis: "z",
    name: "luminousIris",
  });
  glow(iris, 2.2);
  const pupil = b.part(new THREE.CircleGeometry(0.057, 10), PUPIL, {
    bone: head,
    at: [0, 1.43, 0.934],
    dir: [0, 0, 1],
    axis: "z",
    scale: [1, 2.4, 1],
    name: "verticalPupil",
  });
  glow(pupil, 0.3);
  const eyeGlint = b.part(new THREE.SphereGeometry(0.022, 8, 6), "#ffffff", {
    bone: head,
    at: [0.07, 1.52, 0.946],
    name: "eyeGlint",
  });
  glow(eyeGlint, 2.6);

  // Dorsal carapace ridges, side plates and random hard facets break up the broad mantle.
  for (let i = 0; i < 7; i += 1) {
    const t = 0.08 + i * 0.13;
    const ridge = shell.at(t, 0, 0.045);
    b.spike(ridge, ridge, 0.13 - i * 0.008, 0.06 - i * 0.003, {
      color: SHELL_EDGE,
      caps: "point",
      name: `dorsalHook${i}`,
    });
  }
  const mantleSurface = b.surface(shell);
  const plates = mantleSurface.scatter(20, {
    rng: random,
    minDist: 0.12,
    filter: (hit) => hit.n.y > -0.05,
  });
  plates.forEach((hit, i) => {
    b.stick(new THREE.ConeGeometry(0.075 + (i % 3) * 0.012, 0.055, 6), i % 3 === 0 ? MAGENTA : SHELL_EDGE, hit, {
      embed: 0.5,
      flat: true,
      name: `carapacePlate${i}`,
    });
  });

  // Crown hooks frame the eye and make the silhouette legible at a distance.
  for (const side of [1, -1]) {
    for (let i = 0; i < 4; i += 1) {
      const x = side * (0.22 + i * 0.105);
      const y = 1.64 - i * 0.035;
      const z = 0.63 + i * 0.025;
      b.spike([x, y, z], [side * 0.34, 0.16, 0.82], 0.16 - i * 0.012, 0.035, {
        bone: head,
        color: MAGENTA,
        name: `crownHook${side > 0 ? "L" : "R"}${i}`,
      });
    }
  }

  // A ring of small teeth sits between the two jaw bones; the mouth remains visibly separate.
  for (let i = 0; i < 5; i += 1) {
    const x = (i - 2) * 0.07;
    b.spike([x, 1.245, 0.92], [0, -0.25, 1], 0.13, 0.022, {
      bone: jawUpper,
      color: TOOTH,
      name: `upperTooth${i}`,
    });
    b.spike([x, 1.16, 0.91], [0, 0.18, 1], 0.1, 0.018, {
      bone: jawLower,
      color: TOOTH,
      name: `lowerTooth${i}`,
    });
  }

  // Hooked barbs and bioluminescent suction cups on every tentacle.
  tentacles.forEach(({ name, sweep }, tentacleIndex) => {
    for (const t of [0.22, 0.46, 0.70]) {
      const underside = sweep.at(t, 180, 0.008);
      const cup = b.stick(new THREE.SphereGeometry(0.042, 8, 5), tentacleIndex % 2 ? CYAN_DARK : CYAN, underside, {
        embed: 0.48,
        scale: [1.25, 0.34, 1.25],
        name: `${name}Sucker${Math.round(t * 100)}`,
      });
      if (tentacleIndex % 2 === 0) glow(cup, 0.75);
    }
    for (const t of [0.30, 0.58, 0.82]) {
      const barb = sweep.at(t, tentacleIndex % 2 ? 90 : -90, 0.015);
      b.spike(barb, barb, 0.10, 0.027, {
        color: MAGENTA,
        caps: "point",
        name: `${name}Barb${Math.round(t * 100)}`,
      });
    }
    const tip = sweep.at(0.98, 0, 0.01);
    b.spike(tip, tip, 0.12, 0.035, { color: SCARLET, caps: "point", name: `${name}TipHook` });
  });

  // Three thin void scars on the shell add an authored focal pattern without a logo.
  for (const side of [1, -1]) {
    for (let i = 0; i < 3; i += 1) {
      const scar = b.part(new THREE.BoxGeometry(0.012, 0.19, 0.018), i === 1 ? CYAN : MAGENTA, {
        bone: core,
        at: [side * (0.29 + i * 0.08), 1.34 - i * 0.055, 0.39],
        rotation: [0, side * (18 + i * 9), side * 20],
        name: `voidScar${side > 0 ? "L" : "R"}${i}`,
      });
      if (i === 1) glow(scar, 1.15);
    }
  }

  return b.root;
}
