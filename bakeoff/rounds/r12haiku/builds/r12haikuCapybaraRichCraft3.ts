import * as THREE from "three";
import { catmull, createBuilder, mottle, paint, polyline, rng, stripes, svg } from "../../../../src/index";
import type { JointRef } from "../../../../src/index";
import { animeEye, cel, furEdge } from "../../../../kits/toon";

export const meta = {
  name: "capybara",
  description: "A calm capybara with a small teal-and-yellow songbird perched on its head.",
};

// Palette
const COAT_HI = "#c4905c";
const COAT_LO = "#8e5d35";
const MUZZLE = "#dcb07a";
const BELLY = "#ead0a0";
const EAR = "#7e5230";
const LEG = cel("#6e4526");
const HOOF = "#3a2818";
const NAIL = "#241912";
const NOSE = "#2b1a10";
const MOUTH = "#2a1a12";
const INK = "#1d1420";
const TEAL = "#2f9c9a";
const TEAL_DARK = "#1f6f73";
const YELLOW = "#ffd65a";
const CAP = "#e0453a";
const BEAK = "#ff8a2a";

// Paints: cel-shaded fur with a zig-zag pale belly, a lighter muzzle, a two-tone bird.
const FUR = mottle(COAT_LO, COAT_HI, { size: 0.16, seed: 4 });
const BODY = cel(furEdge(FUR, BELLY, { by: "position", level: 0.36, teeth: 0.04, period: 0.05 }));
const HEAD = cel(paint((p) => (p.z > 0.62 && p.y < 0.6 ? MUZZLE : FUR)));
const BIRD = cel(paint((p) => (p.y < 0.82 ? YELLOW : TEAL)));
const WING = stripes(TEAL_DARK, "#f4e7b0", { size: 0.03, width: 0.25, seed: 2 });

// Fur tufts: small drawn cards scattered over the back.
const tuft = (fill: string, edge: string) =>
  svg(
    `<svg viewBox="0 0 24 48" xmlns="http://www.w3.org/2000/svg"><path d="M12 47 C4 36 2 20 12 2 C14 16 22 28 20 47 Z" fill="${fill}" stroke="${edge}" stroke-width="2" stroke-linejoin="round"/></svg>`,
    { size: 128 },
  );
const TUFTS = [tuft(COAT_HI, COAT_LO), tuft("#a8703f", "#5c3a20")];

export default function build() {
  const b = createBuilder({ name: "capybara" });

  // Skeleton: hips, a spine with back and chest joints, a short neck, the head, and the bird on the head.
  const hips = b.joint("hips", { at: [0, 0.44, -0.2], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.44, -0.2], [0, 0.46, 0.12], [0, 0.5, 0.34]]), {
    parent: hips,
    names: ["back", "chest"],
    role: "spine",
  });
  const neck = b.chain("neck", polyline([[0, 0.5, 0.34], [0, 0.57, 0.46]]), {
    parent: spine,
    names: ["neck"],
    role: "neck",
  });
  const head = b.joint("head", { parent: neck, at: [0, 0.6, 0.5], role: "head" });
  const bird = b.joint("bird", { parent: head, at: [0, 0.8, 0.5] });

  // Legs: a three-joint chain each (hip, knee, ankle tip), with hooves and toenails on the tip joint.
  const leg = (tag: string, parent: JointRef, hip: number[], knee: number[], ankle: number[]) => {
    const chain = b.chain(`leg${tag}`, polyline([hip, knee, ankle]), {
      parent,
      names: [`hip${tag}`, `knee${tag}`, `ankle${tag}`],
      role: "leg",
    });
    b.sweep(chain, [0.08, 0.05], { color: LEG });
    const foot = chain.tip ?? chain.joints[chain.joints.length - 1];
    const x = ankle[0];
    const z = ankle[2];
    b.part(new THREE.SphereGeometry(0.075, 10, 6).scale(1, 0.5, 1.25), HOOF, {
      bone: foot,
      at: [x, 0.03, z + 0.02],
    });
    for (const dx of [-0.03, 0, 0.03])
      b.part(new THREE.SphereGeometry(0.011, 6, 4), NAIL, { bone: foot, at: [x + dx, 0.024, z + 0.1] });
    return chain;
  };
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    leg(`F${side}`, spine, [s * 0.15, 0.33, 0.2], [s * 0.16, 0.17, 0.22], [s * 0.16, 0.05, 0.24]);
    leg(`B${side}`, hips, [s * 0.15, 0.33, -0.32], [s * 0.16, 0.17, -0.33], [s * 0.16, 0.05, -0.31]);
  }

  // Barrel body: a loft through five stations from rump to chest, skinned to the spine.
  b.loft(
    [
      { at: [0, 0.44, -0.52], w: 0.32, h: 0.34 },
      { at: [0, 0.45, -0.28], w: 0.42, h: 0.4 },
      { at: [0, 0.46, -0.02], w: 0.46, h: 0.43 },
      { at: [0, 0.48, 0.2], w: 0.44, h: 0.4 },
      { at: [0, 0.5, 0.36], w: 0.36, h: 0.34 },
    ],
    { bone: [hips, spine], color: BODY },
  );
  b.sweep(neck, [0.17, 0.13], { color: BODY });
  b.part(new THREE.SphereGeometry(0.035, 8, 6), COAT_LO, { bone: hips, at: [0, 0.45, -0.55] });

  // Head: a blocky, blunt loft with a wide muzzle.
  const skull = b.loft(
    [
      { at: [0, 0.6, 0.4], w: 0.2, h: 0.22 },
      { at: [0, 0.6, 0.5], w: 0.25, h: 0.24 },
      { at: [0, 0.6, 0.6], w: 0.25, h: 0.23 },
      { at: [0, 0.59, 0.7], w: 0.2, h: 0.18 },
      { at: [0, 0.575, 0.76], w: 0.14, h: 0.14 },
    ],
    { bone: head, color: HEAD },
  );

  // Small round ears on top, set back.
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.032, 8, 6).scale(1, 0.75, 0.5), EAR, {
      bone: head,
      at: [s * 0.092, 0.7, 0.45],
    });

  // Big, friendly eyes: drawings laid on the front of the face, found by a ray from in front.
  const EYE = animeEye({ iris: "#6b3d1c" });
  const face = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = face.ray([s * 0.09, 0.62, 1], [0, 0, -1]);
    if (hit) b.decal(skull, EYE, { at: hit, dir: [0, 0, 1], size: [0.06, 0.08], mirror: s > 0 });
  }

  // Nostrils on the blunt snout and a short mouth line.
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.013, 6, 4).scale(1, 0.75, 0.6), NOSE, {
      bone: head,
      at: [s * 0.04, 0.578, 0.745],
    });
  b.rod([-0.06, 0.54, 0.71], [0.06, 0.54, 0.71], 0.0045, MOUTH, { bone: head });

  // Fur tufts scattered over the back, drawn as cards.
  const backHits = b.surface(body(b)).scatter(80, {
    rng: rng(3),
    minDist: 0.075,
    filter: (h) => h.n.y > 0.1,
  });
  b.cards(backHits, TUFTS, { size: [0.04, 0.065], lean: 35, bend: 20, vary: 0.3, rng: rng(4) });

  // The bird: a small songbird perched on the head, feet gripping the crown.
  b.sweep(catmull([[0, 0.8, 0.36], [0, 0.815, 0.44], [0, 0.835, 0.5]]), [0.016, 0.04, 0.042], {
    bone: bird,
    color: BIRD,
  });
  b.part(new THREE.SphereGeometry(0.03, 10, 8), CAP, { bone: bird, at: [0, 0.866, 0.525] });
  b.spike([0, 0.862, 0.545], [0, 0, 1], 0.026, 0.011, { color: BEAK, bone: bird });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.0068, 6, 4), INK, { bone: bird, at: [s * 0.013, 0.874, 0.548] });
    b.rod([s * 0.012, 0.8, 0.47], [s * 0.012, 0.712, 0.47], 0.0055, BEAK, { bone: bird });
  }
  // Wings on both sides, a leaf shape in the plane of the body.
  for (const s of [1, -1])
    b.extrude(
      [
        [0.05, 0.02],
        [-0.02, 0.036],
        [-0.09, 0.024],
        [-0.12, 0, "sharp"],
        [-0.06, -0.016],
        [0.02, -0.024],
      ],
      { at: [s * 0.036, 0.815, 0.46], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.012, color: WING, bone: bird },
    );
  // A tail fan at the back and a small crest on the crown.
  b.extrude(
    [
      [0, 0.01],
      [-0.07, 0.022],
      [-0.09, 0, "sharp"],
      [-0.07, -0.014],
      [0, -0.008],
    ],
    { at: [0, 0.81, 0.37], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.006, color: TEAL_DARK, bone: bird },
  );
  b.extrude(
    [
      [-0.024, -0.004],
      [0.004, 0.03, "sharp"],
      [0.024, -0.004],
    ],
    { at: [0, 0.888, 0.52], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.01, color: CAP, bone: bird },
  );

  return b.root;
}

/** The body loft, rebuilt as a surface target: the body is the first sweep under the hips. */
function body(b: ReturnType<typeof createBuilder>) {
  const found = b.root.getObjectByName("loft.hips") ?? b.root;
  return found;
}
