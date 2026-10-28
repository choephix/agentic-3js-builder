import * as THREE from "three";
import { createBuilder, catmull, frame, limb, rng, svg } from "../../../../src/index";
import { cel, furEdge, INK, animeEye } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";
import { paint } from "../../../../src/index";

export const meta = {
  name: "kitsune",
  description: "Nine-tailed kitsune fox on four legs, cream bellies, indigo tips, spirit flames on every tail and drifting around her.",
};

// Palette
const ORANGE = "#ff7a2e";
const CREAM = "#fff1dc";
const INDIGO = "#2b2f6e";
const GOLD = "#ffd45a";
const FLAME_BLUE = "#7fe9ff";

// Paints: a toon coat with a zig-zag cream belly, tails with cream bands and indigo tips, socks, ears with indigo tips.
const COAT = cel(furEdge(ORANGE, CREAM, { axis: [0, 1, 0], level: -0.2, teeth: 0.2, period: 0.03 }));
const TAIL = paint((_p, _n, s) => (s[0] > 0.8 ? INDIGO : s[0] > 0.7 ? CREAM : COAT));
const LEG = paint((p) => (p.y < 0.2 ? CREAM : COAT));
const EAR = paint((_p, _n, s) => (s[1] > 0.13 ? INDIGO : ORANGE));

// Flame drawing: a blue outer flame with a white core, used on cards.
const FLAME = svg(
  `<svg viewBox="0 0 64 96" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 2 C40 30 60 40 58 66 C56 86 44 94 32 94 C20 94 6 86 6 66 C4 40 24 30 32 2Z" fill="${FLAME_BLUE}"/>
    <path d="M32 30 C36 50 46 58 45 72 C44 84 38 90 32 90 C26 90 20 84 19 72 C18 58 28 50 32 30Z" fill="#ffffff"/>
  </svg>`,
  { size: 128 },
);

const EYE = animeEye({ iris: "#ffc83a" });

export default function build() {
  const b = createBuilder({ name: "kitsune" });
  const r = rng(9);

  // Skeleton: hips root, spine to the chest, neck and head, four legs, nine tails from the hips.
  const hips = b.joint("hips", { at: [0, 0.84, -0.08] });
  const spinePath = catmull([
    [0, 0.84, -0.08],
    [0, 0.86, 0.25],
    [0, 0.92, 0.6],
  ]);
  const spine = b.chain("spine", spinePath, { parent: hips, names: ["spine1", "spine2"], role: "spine" });
  const head = b.joint("head", {
    parent: spine.joints[1],
    at: [0, 1.07, 0.84],
    aim: [0, 1.1, 1.12],
    group: "head",
    role: "head",
  });

  // Body and neck: one smooth tube each, bent by the spine and head joints.
  b.sweep(spinePath, (t) => [0.15 + 0.03 * Math.sin(t * Math.PI), 0.17], { bone: spine, color: COAT });
  b.sweep(
    catmull([
      [0, 0.9, 0.56],
      [0, 1.0, 0.72],
      [0, 1.07, 0.84],
    ]),
    (t) => 0.12 - 0.02 * t,
    { bone: [spine, head], color: COAT },
  );

  // Legs: IK from the shoulder or hip to the floor, sock-coloured paws.
  const leg = (name: string, parent: typeof hips, root: number[], target: number[], bend: number[]) => {
    const pts = limb(root, target, [0.44, 0.42], [bend]);
    const c = b.chain(name, pts, { parent, names: [`${name}_hip`, `${name}_knee`, `${name}_paw`], role: "leg" });
    b.sweep(c, (t) => 0.062 - 0.02 * t, { color: LEG });
    b.part(new THREE.SphereGeometry(0.058, 10, 8), CREAM, {
      bone: c.tip ?? undefined,
      at: [target[0], 0.04, target[2] + 0.03],
      scale: [1, 0.55, 1.35],
    });
    return c;
  };
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    leg(`legF${side}`, spine.joints[1], [s * 0.13, 0.86, 0.5], [s * 0.13, 0.04, 0.52], [0, 0, -1]);
    leg(`legH${side}`, hips, [s * 0.14, 0.84, -0.14], [s * 0.14, 0.04, -0.18], [0, 0, 1]);
  }

  // Head: the skull, a muzzle, cheek ruffs, a nose, a forehead gem and eyes drawn on the skull.
  const skull = b.part(new THREE.SphereGeometry(0.13, 16, 12), COAT, {
    bone: head,
    at: [0, 1.08, 0.84],
    scale: [1, 0.92, 1.08],
  });
  b.part(new THREE.SphereGeometry(0.075, 12, 8), CREAM, {
    bone: head,
    at: [0, 1.04, 0.97],
    scale: [1, 0.85, 1.3],
  });
  b.part(new THREE.SphereGeometry(0.025, 8, 6), INK, { bone: head, at: [0, 1.055, 1.05] });
  b.part(new THREE.SphereGeometry(0.02, 8, 6), GOLD, { bone: head, at: [0, 1.15, 0.92] });
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.06, 10, 8), CREAM, {
      bone: head,
      at: [s * 0.09, 1.0, 0.9],
      scale: [1, 0.9, 0.7],
    });

  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skin.around([0, 1.07, 0.84]).at(s * 40, 12);
    if (hit) b.decal(skull, EYE, { at: hit, size: [0.07, 0.095], mirror: s > 0 });
  }

  // Ears: flat triangles with indigo tips, standing up from the crown.
  for (const s of [1, -1])
    b.extrude(
      [
        [-0.06, 0],
        [0.06, 0],
        [0, 0.2, "sharp"],
      ],
      {
        at: [s * 0.07, 1.15, 0.78],
        x: [0, 0, 1],
        y: [s * 0.3, 1, 0],
        thickness: 0.025,
        bevel: 0.005,
        color: EAR,
        bone: head,
      },
    );

  // Nine tails fanning out from the hips, each ending in a spirit flame.
  const tips: THREE.Vector3[] = [];
  for (let i = 0; i < 9; i++) {
    const a = ((i - 4) / 4) * 0.95;
    const base = [0, 0.86, -0.1];
    const mid = [Math.sin(a) * 0.42, 0.95 + 0.12 * Math.cos(a), -0.5];
    const tip = [Math.sin(a) * 0.8, 0.92 + 0.3 * Math.cos(a) + 0.05 * (1 - Math.abs(a)), -0.85];
    const tail = b.chain(
      `tail${i}`,
      catmull([base, mid, tip]),
      {
        parent: hips,
        names: [1, 2, 3, 4].map((k) => `tail${i}_${k}`),
        role: "tail",
      },
    );
    b.sweep(tail, (t) => 0.075 * (1 - t) + 0.018, { color: TAIL });
    tips.push(tail.at(1).at.clone());
  }

  // Spirit flames: a crossed pair of cards on every tail tip, lit from within.
  const tipFrames = tips.map((p) => frame(p.clone().add(new THREE.Vector3(0, 0.03, 0)), [0, 1, 0]));
  glow(b.cards(tipFrames, FLAME, { size: [0.15, 0.22], lean: 0, cross: true, flow: [0, 0, 1] }), 1.3);

  // Drifting spirit flames around the body, slightly varied in size.
  const orbs = [
    [0.42, 1.25, 0.25],
    [-0.44, 1.32, 0.05],
    [0.3, 1.45, 0.7],
    [-0.28, 1.4, 0.8],
    [0.55, 0.95, -0.35],
    [-0.5, 1.02, -0.4],
  ].map((p) => frame(p, [0, 1, 0]));
  glow(
    b.cards(orbs, FLAME, { size: 0.11, lean: 0, cross: true, flow: [0, 0, 1], vary: 0.25, rng: r }),
    1.5,
  );

  // Gold glint on the gem so it reads in the dark.
  glow(b.part(new THREE.SphereGeometry(0.018, 8, 6), GOLD, { bone: head, at: [0, 1.15, 0.92] }), 1.2);

  return b.root;
}
