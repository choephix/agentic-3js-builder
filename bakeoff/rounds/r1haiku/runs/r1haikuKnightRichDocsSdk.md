```ts
import * as THREE from "three";
import { createBuilder, limb, polyline, catmull, mottle, scales, grain, svg } from "agentic-3js-builder";

export const meta = {
  name: "Battle-worn griffin knight",
  description: "A plate-armoured knight with a great helm and crimson plume, gold-etched pauldrons, a blue surcoat bearing a silver griffin, a kite shield, a broadsword and a torn crimson cape.",
};

// Paints: mottled steel gives dents and wear, the blue and crimson are cloth.
const STEEL = mottle("#9aa3ad", "#5f6873", { size: 0.06, contrast: 0.55, seed: 3 });
const STEEL_DARK = mottle("#6b737e", "#3a4149", { size: 0.04, contrast: 0.6, seed: 8 });
const BLUE = mottle("#1f3d7a", "#132756", { size: 0.14, contrast: 0.3, seed: 5 });
const CRIMSON = mottle("#a3152a", "#5c0a18", { size: 0.12, contrast: 0.6, seed: 9 });
const ETCHED = scales(STEEL, "#d4a64a", { size: 0.045, width: 0.12, seed: 2 });
const BLADE = grain("#cfd6de", "#7d8793", { size: 0.02, axis: "y", seed: 4 });
const GOLD = "#d4a64a";
const DARK = "#17191d";

// The griffin emblem, silver on any ground.
const GRIFFIN = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
<g fill="#dfe4ea" stroke="#2a2f3a" stroke-width="1.6" stroke-linejoin="round">
<path d="M30 34 Q24 16 6 10 Q14 20 14 28 Q20 22 24 26 Q28 22 32 28 Z"/>
<path d="M18 38 Q28 30 40 36 L50 30 L56 28 L50 34 Q46 42 38 46 L36 44 Q28 46 20 42 Z"/>
<path d="M18 38 Q8 40 4 52 Q11 47 15 47 Q13 41 19 41 Z"/>
<path d="M20 42 L13 57 L18 57 L24 46 Z"/>
<path d="M36 44 L33 57 L38 57 L42 46 Z"/>
<path d="M46 30 Q46 20 54 18 L60 22 L55 24 Q53 28 50 31 Z"/>
<path d="M46 24 L40 16 L44 26 Z"/>
</g>
<circle cx="51" cy="23" r="1.1" fill="#17191d"/>
</svg>`;

export default function build() {
  const b = createBuilder({ name: "griffin-knight" });
  const griffin = svg(GRIFFIN, { size: 256 });

  // ---- Skeleton -------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.98, 0], role: "spine" });
  const spine = b.chain("spine", polyline([[0, 0.98, 0], [0, 1.2, 0], [0, 1.44, 0]]), {
    parent: hips,
    names: ["spine1", "spine2", "chest"],
    role: "spine",
  });
  const chest = spine.joints[2];

  const neck = b.chain("neck", polyline([[0, 1.44, 0], [0, 1.56, 0.01], [0, 1.66, 0.02]]), {
    parent: chest,
    names: ["neck1", "neck2"],
    role: "neck",
  });
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.66, 0.02], role: "head" });

  const armL = b.chain("armL", polyline([[0.2, 1.4, 0], [0.3, 1.2, 0.2], [0.14, 1.2, 0.4]]), {
    parent: chest,
    names: ["shoulderL", "elbowL", "handL"],
    role: "arm",
  });
  const armR = b.chain("armR", polyline([[-0.2, 1.4, 0], [-0.3, 1.14, 0.1], [-0.3, 1.0, 0.3]]), {
    parent: chest,
    names: ["shoulderR", "elbowR", "handR"],
    role: "arm",
  });

  const legOf = (s: number, side: "L" | "R") => {
    const pts = limb([s * 0.12, 0.98, 0], [s * 0.12, 0.1, 0.04], [0.46, 0.44], [[0, 0, 1]]);
    return b.chain(`leg${side}`, polyline(pts), {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `foot${side}`],
      role: "leg",
    });
  };
  const legL = legOf(1, "L");
  const legR = legOf(-1, "R");

  // ---- Torso and surcoat ---------------------------------------------
  const torso = b.sweep(spine, (t) => [0.16 + 0.05 * t, 0.115], {
    section: "box",
    caps: "flat",
    color: BLUE,
  });
  const torsoSurf = b.surface(torso);

  // Tabard skirt hangs from the hips.
  b.sweep(polyline([[0, 0.98, 0], [0, 0.72, 0]]), (t) => [0.2 + 0.03 * t, 0.14], {
    section: "box",
    caps: "flat",
    bone: hips,
    color: BLUE,
  });

  // Gold belt round the waist.
  const belt = torsoSurf.loop([0, 1.02, 0], { dir: [0, 1, 0], lift: 0.012 });
  b.sweep(belt, 0.016, { color: GOLD });

  // Silver griffin on the chest.
  b.decal(torso, griffin, {
    at: torsoSurf.nearest([0, 1.26, 0.2]),
    dir: [0, 0, 1],
    size: [0.22, 0.24],
  });

  // Gorget and arms.
  b.sweep(neck, 0.072, { color: STEEL_DARK });
  b.sweep(armL, [0.056, 0.044], { color: STEEL, bands: [[0.5, BLUE], [1, STEEL]] });
  b.sweep(armR, [0.056, 0.044], { color: STEEL, bands: [[0.5, BLUE], [1, STEEL]] });

  // Layered, gold-etched pauldrons on each shoulder.
  for (const sh of [armL.joints[0], armR.joints[0]]) {
    b.lathe(
      [[0, 0], [0.12, -0.02], [0.16, 0.02], [0.15, 0.07], [0.09, 0.11], [0, 0.12]],
      { at: sh.local({ up: -0.02 }), bone: sh, smoothing: 1, color: ETCHED },
    );
    b.lathe(
      [[0, 0], [0.165, 0], [0.172, 0.012], [0.16, 0.02], [0, 0.02]],
      { at: sh.local({ up: 0.02 }), bone: sh, color: GOLD },
    );
    b.lathe(
      [[0, 0], [0.13, 0], [0.135, 0.02], [0, 0.02]],
      { at: sh.local({ up: 0.07 }), bone: sh, color: STEEL_DARK },
    );
  }

  // Gauntlets.
  b.part(new THREE.BoxGeometry(0.1, 0.09, 0.12), STEEL_DARK, {
    bone: armL.joints[2],
    at: [0.14, 1.2, 0.4],
    flat: true,
  });
  b.part(new THREE.BoxGeometry(0.1, 0.09, 0.12), STEEL_DARK, {
    bone: armR.joints[2],
    at: [-0.3, 1.0, 0.3],
    flat: true,
  });

  // Greaves and sabatons.
  for (const [leg, s] of [[legL, 1], [legR, -1]] as const) {
    b.sweep(leg, [0.085, 0.06], { color: STEEL });
    b.part(new THREE.BoxGeometry(0.13, 0.1, 0.26), STEEL_DARK, {
      bone: leg.joints[2],
      at: [s * 0.12, 0.06, 0.1],
      flat: true,
    });
  }

  // ---- Great helm and plume ------------------------------------------
  b.part(new THREE.CylinderGeometry(0.155, 0.165, 0.3, 8), STEEL, {
    bone: head,
    at: head.local({ up: 0.05 }),
    flat: true,
  });
  b.part(new THREE.CylinderGeometry(0.13, 0.155, 0.05, 8), STEEL_DARK, {
    bone: head,
    at: head.local({ up: 0.2 }),
    flat: true,
  });
  b.part(new THREE.CylinderGeometry(0.163, 0.163, 0.018, 8), GOLD, {
    bone: head,
    at: head.local({ up: 0.1 }),
    flat: true,
  });
  b.part(new THREE.BoxGeometry(0.2, 0.22, 0.05), STEEL, {
    bone: head,
    at: head.local({ forward: 0.15, up: 0.03 }),
    flat: true,
  });
  // Narrow eye slit.
  b.part(new THREE.BoxGeometry(0.2, 0.025, 0.03), DARK, {
    bone: head,
    at: head.local({ forward: 0.178, up: 0.07 }),
  });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.03, 0.012, 0.02), DARK, {
      bone: head,
      at: head.local({ forward: 0.18, up: -0.03, left: s * 0.05 }),
    });
  }

  // Tall crimson plume sweeping back from the crown.
  const plume = catmull([
    head.local({ up: 0.22 }),
    head.local({ up: 0.3, back: 0.04 }),
    head.local({ up: 0.36, back: 0.16 }),
    head.local({ up: 0.36, back: 0.36 }),
  ]);
  b.sweep(plume, [0.035, 0.01], {
    bone: head,
    color: CRIMSON,
    caps: { start: "flat", end: "point" },
  });

  // ---- Kite shield with a griffin on its face ------------------------
  const shield = b.extrude(
    [[-0.26, 0.42], [0.26, 0.42], [0.26, 0.02], [0, -0.46, "sharp"], [-0.26, 0.02]],
    {
      at: [0.18, 1.1, 0.44],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.035,
      bevel: 0.008,
      color: BLUE,
      bone: armL.joints[2],
    },
  );
  // Gold rim just proud of the face edges.
  b.extrude(
    [[-0.28, 0.44], [0.28, 0.44], [0.28, 0.02], [0, -0.49, "sharp"], [-0.28, 0.02]],
    {
      at: [0.18, 1.1, 0.44],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.03,
      color: GOLD,
      bone: armL.joints[2],
    },
  );
  b.part(new THREE.PlaneGeometry(0.4, 0.46), "#ffffff", {
    at: shield.local([0, -0.02, 0.024]),
    dir: [0, 0, 1],
    axis: "z",
    texture: griffin,
    bone: armL.joints[2],
  });

  // ---- Broadsword held point-down ------------------------------------
  const hilt = new THREE.Vector3(-0.3, 1.0, 0.3);
  const tip = new THREE.Vector3(-0.31, 0.12, 0.42);
  const u = tip.clone().sub(hilt).normalize();
  const along = (k: number) => hilt.clone().addScaledVector(u, k);
  const swordBone = armR.joints[2];

  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.13, 6), DARK, {
    at: along(0),
    dir: u,
    bone: swordBone,
  });
  b.part(new THREE.BoxGeometry(0.2, 0.03, 0.04), STEEL, {
    at: along(0.075),
    dir: u,
    bone: swordBone,
  });
  b.part(new THREE.BoxGeometry(0.05, 0.71, 0.012), BLADE, {
    at: along(0.445),
    dir: u,
    bone: swordBone,
  });
  b.part(new THREE.ConeGeometry(0.025, 0.08, 4), BLADE, {
    at: along(0.84),
    dir: u,
    bone: swordBone,
  });

  // Plate-tear cape hanging from the shoulders behind the knight.
  b.extrude(
    [
      [-0.22, 1.42], [0.22, 1.42], [0.24, 0.82], [0.19, 0.66], [0.2, 0.52],
      [0.1, 0.58], [0.03, 0.44], [-0.05, 0.57], [-0.13, 0.48], [-0.19, 0.64], [-0.24, 0.8],
    ],
    {
      at: [0, 0, -0.17],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.002,
      color: CRIMSON,
      bone: chest,
    },
  );

  return b.root;
}
```