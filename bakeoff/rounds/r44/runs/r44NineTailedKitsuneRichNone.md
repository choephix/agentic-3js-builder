```ts
import * as THREE from "three";
import { createBuilder, frame, catmull, limb, countershade, gradient, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Nine-Tailed Kitsune",
  description: "High-fantasy anime kitsune: white fox with red kumadori markings, shimenawa collar and nine fanned tails tipped with spirit flames.",
};

const WHITE = "#fff4e6";
const BELLY = "#e9dccf";
const RED = "#d83048";
const GOLD = "#f2c14e";
const DARK = "#3a2640";
const INK = "#2a1630";

const flameSvg = (a: string, b: string, c: string) =>
  svg(
    `<svg viewBox="0 0 64 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><path d="M32 98 C6 90 6 60 22 42 C24 54 30 54 28 36 C27 20 36 12 40 2 C42 22 58 40 58 66 C58 86 46 98 32 98Z" fill="url(#g)"/><path d="M32 96 C18 90 18 72 28 60 C30 68 36 66 36 56 C46 68 48 86 32 96Z" fill="${c}"/></svg>`,
    { size: 128 },
  );
const FLAME_BLUE = flameSvg("#5fe0ff", "#6a5cff", "#eaffff");
const FLAME_VIOLET = flameSvg("#c07bff", "#ff5fa8", "#fff0fb");

const EYE = svg(
  `<svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg"><path d="M2 46 Q34 38 70 14 Q40 32 2 46Z" fill="${RED}"/><path d="M12 42 Q48 2 92 30 Q50 58 12 42Z" fill="${GOLD}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><ellipse cx="54" cy="31" rx="6" ry="15" fill="${INK}"/><circle cx="48" cy="24" r="4" fill="#ffffff"/></svg>`,
  { size: 192 },
);
const MARK = svg(
  `<svg viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg"><path d="M30 4 C14 28 6 40 18 58 C24 66 30 76 30 76 C30 76 36 66 42 58 C54 40 46 28 30 4Z" fill="${RED}" stroke="${GOLD}" stroke-width="4"/><circle cx="30" cy="46" r="6" fill="${GOLD}"/></svg>`,
  { size: 128 },
);
const SWIRL = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round"><path d="M50 50 C50 38 66 38 66 52 C66 70 40 74 30 56 C20 36 40 16 62 20" stroke="${RED}" stroke-width="7"/><path d="M62 20 C78 24 88 36 86 52" stroke="${RED}" stroke-width="5"/><circle cx="50" cy="50" r="4" fill="${GOLD}" stroke="none"/></svg>`,
  { size: 192 },
);

export default function build() {
  const b = createBuilder({ name: "kitsune" });
  const COAT = countershade(WHITE, BELLY, { level: -0.1 });
  const hips = b.joint("hips", { at: [0, 0.62, -0.35], role: "spine" });

  // Spine and body
  const spine = b.chain(
    "spine",
    catmull([[0, 0.62, -0.35], [0, 0.64, -0.1], [0, 0.68, 0.2], [0, 0.78, 0.38]]),
    { parent: hips, role: "spine" },
  );
  const body = b.sweep(spine, [0.13, 0.15, 0.16, 0.12], { color: COAT });

  // Neck and head
  const neck = b.chain("neck", catmull([[0, 0.78, 0.38], [0, 0.9, 0.48], [0, 1.0, 0.56]]), {
    parent: spine.joints[spine.joints.length - 1],
    role: "neck",
  });
  const neckTube = b.sweep(neck, [0.115, 0.08], { color: COAT });
  const head = b.joint("head", { parent: neck.joints[neck.joints.length - 1], at: [0, 1.0, 0.56], dir: [0, 0.1, 1], role: "head" });
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), COAT, {
    bone: head,
    at: head.local({ forward: 0.02 }),
    scale: [0.105, 0.09, 0.105],
  });
  b.capsule(head.local({ forward: 0.06, down: 0.015 }), head.local({ forward: 0.24, down: 0.03 }), [0.065, 0.025], WHITE, { bone: head });
  b.part(new THREE.SphereGeometry(0.022, 8, 6), INK, { bone: head, at: head.local({ forward: 0.27, down: 0.025 }) });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.04, down: 0.05 }),
    aim: head.local({ forward: 0.24, down: 0.06 }),
    role: "jaw",
  });
  b.capsule(jaw.at, head.local({ forward: 0.23, down: 0.06 }), [0.045, 0.018], BELLY, { bone: jaw });
  for (const s of [1, -1]) {
    b.spike(head.local({ forward: 0.2, left: s * 0.025, down: 0.045 }), [0, 1, 0], 0.025, 0.007, { color: "#ffffff", bone: head });
  }

  // Face details, ears, cheek ruffs
  for (const s of [1, -1]) {
    b.decal(skull, EYE, {
      at: head.local({ left: s * 0.055, up: 0.03, forward: 0.09 }),
      dir: [s * 0.35, 0, 1],
      size: [0.07, 0.042],
      mirror: s > 0,
    });
    const base = head.local({ left: s * 0.065, up: 0.085, back: 0.02 });
    const ear = [[-0.055, 0], [-0.03, 0.1], [0, 0.21, "sharp"], [0.03, 0.1], [0.055, 0]] as any;
    b.extrude(ear, { at: base, x: [s, 0, 0], y: [s * 0.25, 1, 0], thickness: 0.02, color: WHITE, bone: head });
    const inner = [[-0.03, 0.01], [-0.015, 0.09], [0, 0.17, "sharp"], [0.015, 0.09], [0.03, 0.01]] as any;
    b.extrude(inner, { at: base, x: [s, 0, 0], y: [s * 0.25, 1, 0], thickness: 0.026, color: RED, bone: head });
    const ruff = [[0.07, 0.03], [0.02, 0.07], [-0.04, 0.06], [-0.1, 0.02, "sharp"], [-0.05, -0.01], [-0.09, -0.07, "sharp"], [-0.02, -0.05], [0, -0.1, "sharp"], [0.05, -0.04]] as any;
    b.extrude(ruff, { at: head.local({ left: s * 0.085, back: 0.03, down: 0.02 }), x: [0, 0, 1], thickness: 0.03, color: WHITE, bone: head });
    b.extrude(ruff.map(([x, y, k]: any) => [x * 0.6, y * 0.6 - 0.01, k]) as any, {
      at: head.local({ left: s * 0.1, back: 0.03, down: 0.02 }),
      x: [0, 0, 1],
      thickness: 0.03,
      color: RED,
      bone: head,
    });
  }
  glow(b.decal(skull, MARK, { at: head.local({ up: 0.08, forward: 0.06 }), dir: [0, 0.6, 0.8], size: [0.045, 0.06] }), 1.2);

  // Collar: shimenawa rope and bell
  const ring = b.surface(neckTube).loop(neck.joints[1], { lift: 0.012 });
  b.sweep(ring, 0.02, { color: RED });
  b.sweep(b.surface(neckTube).loop(neck.joints[1], { lift: 0.03 }), 0.008, { color: GOLD });
  const bellAt = b.surface(neckTube).around(neck.joints[1].at).at(0, -10);
  if (bellAt) b.stick(new THREE.SphereGeometry(0.035, 8, 6), GOLD, bellAt, { embed: 0.2 });

  // Back ridge and flank swirls
  b.sweep(body.line(0, 0.004), 0.014, { color: RED });
  for (const s of [1, -1])
    b.decal(body, SWIRL, { at: [s * 0.14, 0.7, 0.0], dir: [s, 0, 0], size: [0.24, 0.24], mirror: s < 0 });

  // Legs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const leg = gradient(COAT, DARK, [0, 0.28, 0], [0, 0.1, 0]);
    const fr = limb([s * 0.11, 0.62, 0.28], [s * 0.11, 0.04, 0.3], [0.31, 0.31], [[0, 0, -1]]);
    const front = b.chain(`legF${side}`, fr, {
      parent: spine.joints[2],
      names: [`shoulder${side}`, `elbow${side}`, `hand${side}`],
      role: "leg",
    });
    b.sweep(front, [0.065, 0.035], { color: leg });
    b.part(new THREE.SphereGeometry(1, 8, 6), DARK, { bone: front.tip!, at: [s * 0.11, 0.035, 0.32], scale: [0.05, 0.04, 0.075] });

    const hd = limb([s * 0.12, 0.6, -0.36], [s * 0.12, 0.04, -0.42], [0.26, 0.26, 0.14], [[0, 0, 1], [0, 0, -1]]);
    const hind = b.chain(`legH${side}`, hd, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `foot${side}`],
      role: "leg",
    });
    b.sweep(hind, [0.085, 0.03], { color: leg });
    b.part(new THREE.SphereGeometry(1, 8, 6), COAT, { bone: hips, at: [s * 0.14, 0.58, -0.38], scale: [0.1, 0.16, 0.15] });
    b.part(new THREE.SphereGeometry(1, 8, 6), DARK, { bone: hind.tip!, at: [s * 0.12, 0.035, -0.4], scale: [0.05, 0.04, 0.075] });
    b.ring(front.tip!, { count: 0 });
  }

  // Nine tails with spirit flames
  const blueFrames: any[] = [];
  const violetFrames: any[] = [];
  const B = [0, 0.66, -0.45];
  for (let i = 0; i < 9; i++) {
    const phi = ((i - 4) * 17 * Math.PI) / 180;
    const k = 1 - Math.abs(i - 4) / 4;
    const sx = Math.sin(phi);
    const cz = Math.cos(phi);
    const pts = [
      B,
      [B[0] + sx * 0.2, B[1] + 0.1, B[2] - cz * 0.28],
      [B[0] + sx * 0.6, B[1] + 0.28 + 0.1 * k, B[2] - cz * 0.6],
      [B[0] + sx * 0.85, B[1] + 0.35 + 0.4 * k, B[2] - cz * 0.8],
    ];
    const path = catmull(pts);
    const tipColor = i % 2 ? "#a58bff" : "#8fe6ff";
    const tail = b.chain(`tail${i}`, path, { parent: hips, count: 3, role: "tail" });
    b.sweep(tail, (t: number) => 0.035 + 0.1 * Math.sin(Math.PI * (0.15 + 0.8 * t)), {
      color: gradient(WHITE, tipColor, path.at(0.5), path.at(1)),
    });
    const tip = pts[3];
    const f = frame([tip[0], tip[1] + 0.05, tip[2]], [0, 1, 0]);
    (i % 2 ? violetFrames : blueFrames).push(f);
  }
  glow(b.cards(blueFrames, FLAME_BLUE, { size: [0.2, 0.34], cross: true }), 1.3);
  glow(b.cards(violetFrames, FLAME_VIOLET, { size: [0.2, 0.34], cross: true }), 1.3);

  // Floating foxfire orbs
  const orbs = [[0.7, 0.45, 0.5], [-0.75, 0.8, 0.35], [0.9, 1.1, -0.2], [-0.8, 0.3, -0.5], [0.3, 1.3, 0.8], [-0.35, 0.2, 0.9]];
  const orbFrames: any[] = [];
  for (const o of orbs) {
    glow(b.part(new THREE.SphereGeometry(0.045, 8, 6), "#bff4ff", { at: o as any, bone: hips }), 1.5);
    orbFrames.push(frame([o[0], o[1] + 0.03, o[2]], [0, 1, 0]));
  }
  glow(b.cards(orbFrames, FLAME_BLUE, { size: [0.12, 0.2], cross: true }), 1.3);

  return b.root;
}
```