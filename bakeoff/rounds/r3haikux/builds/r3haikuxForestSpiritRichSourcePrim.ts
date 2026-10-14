import * as THREE from "three";
import { createBuilder, grain, mix, mottle, noise, paint, rng, smoothstep } from "../../../../src/index";

export const meta = {
  name: "Mossy Stone Forest Spirit",
  description:
    "A small forest spirit, part deer and part mossy river stone: a grey stone body under soft moss, slender wooden legs ending in little hooves, branching antlers sprouting white flowers and leaves, a pale wooden mask face with two glowing green eyes, and fireflies circling its head.",
};

type Pt = [number, number, number];

const vec = (p: Pt) => new THREE.Vector3(p[0], p[1], p[2]);
/** A point mirrored to the creature's left (s = 1) or right (s = -1). */
const mirror = (s: number, x: number, y: number, z: number): Pt => [s * x, y, z];

// ---- paints -------------------------------------------------------------------------------

const stoneGrey = mottle("#8f9288", "#60665c", { size: 0.2, seed: 3, contrast: 1.2 });
const moss = mottle("#3b7828", "#8cc24f", { size: 0.06, seed: 21, contrast: 1.3 });

/** River stone under soft moss: moss on the upward faces and in patches down the sides. */
const mossyStone = paint((p, n) => {
  const up = smoothstep(0.25, 0.55, n.y + 0.45 * (noise(p, 0.14, 7) - 0.5));
  const patch = 0.8 * smoothstep(0.64, 0.72, noise(p, 0.09, 13));
  return mix(stoneGrey.at(p, n), moss.at(p, n), Math.max(up, patch));
});

const legWood = grain("#9d7b53", "#5a4229", { size: 0.035, seed: 2 });
const antlerWood = grain("#d4b98e", "#7c5c3b", { size: 0.03, seed: 8 });
const paleWood = grain("#f1e5c9", "#cdb88d", { size: 0.025, seed: 4 });

/** The mask: pale wood, a mossy top edge and a dark socket round each eye. Surface coordinates are its [x, y] in metres. */
const maskPaint = paint((p, n, s) => {
  const wood = paleWood.at(p, n);
  const face = mix(wood, moss.at(p, n), 0.85 * smoothstep(0.07, 0.1, s[1]));
  let socket = 0;
  for (const ex of [-0.042, 0.042]) {
    socket = Math.max(socket, 1 - smoothstep(0.026, 0.036, Math.hypot(s[0] - ex, s[1] - 0.035)));
  }
  return mix(face, "#1f1812", socket);
});

const glow = (color: string, emissive: string, intensity: number) =>
  new THREE.MeshStandardMaterial({ color, emissive, emissiveIntensity: intensity, roughness: 0.4 });
const eyeGlow = glow("#b6ff8a", "#34ff5a", 2.4);
const fireflyGlow = glow("#f6ffb0", "#e6ff3a", 2.8);
const trailGlow = glow("#dcffb0", "#b4ff7a", 1.4);

// ---- the spirit ---------------------------------------------------------------------------

export default function forestSpirit() {
  const b = createBuilder({ name: "forest spirit", detail: 1, paintSize: 1024 });

  /** A small leaf: a diamond from `from` to `to`, sitting in the plane of its stalk and the vertical. */
  const leaf = (from: Pt, to: Pt, width: number, color: string, bone: string) => {
    const a = vec(from);
    const c = vec(to);
    const sideways = new THREE.Vector3().crossVectors(c.clone().sub(a), new THREE.Vector3(0, 1, 0));
    if (sideways.lengthSq() < 1e-10) sideways.set(1, 0, 0);
    sideways.normalize().multiplyScalar(width);
    const mid = a.clone().lerp(c, 0.45);
    b.slab([a, mid.clone().add(sideways), c, mid.clone().sub(sideways)], {
      color,
      thickness: 0.004,
      bone,
      name: "leaf",
    });
  };

  /** Five white petals and a yellow centre, lying flat, on a bone. */
  const flower = (c: Pt, bone: string) => {
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      b.part(new THREE.SphereGeometry(0.0075, 5, 4), "#fbfaf2", {
        at: [c[0] + Math.cos(a) * 0.0135, c[1] + 0.001, c[2] + Math.sin(a) * 0.0135],
        bone,
        name: "petal",
      });
    }
    b.part(new THREE.SphereGeometry(0.0065, 5, 4), "#f2c64a", { at: c, bone, name: "flowerCentre" });
  };

  // Skeleton: pelvis → spine → neck → head → jaw. Legs, tail and fireflies hang off it.
  b.joint("pelvis", { at: [0, 0.82, -0.36], role: "spine" });
  b.chain(
    "spine",
    [
      [0, 0.84, -0.18],
      [0, 0.88, 0.06],
      [0, 0.93, 0.3],
    ],
    { parent: "pelvis", names: ["spine1", "spine2"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    [
      [0, 0.93, 0.3],
      [0, 1.07, 0.46],
      [0, 1.19, 0.58],
    ],
    { parent: "spine2", names: ["neck1", "neck2"], role: "neck" },
  );
  b.joint("head", { parent: "neck2", at: [0, 1.21, 0.64], dir: [0, -0.15, 1], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 1.14, 0.7], dir: [0, 0, 1], role: "jaw" });

  // Slender wooden legs with moss rings at the knee and hock, and little dark hooves.
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const x = (k: number) => s * k;

    const fore = b.chain(
      `foreLeg${S}`,
      [
        [x(0.17), 0.8, 0.24],
        [x(0.18), 0.44, 0.27],
        [x(0.19), 0.13, 0.3],
        [x(0.19), 0.035, 0.33],
      ],
      {
        parent: "spine2",
        names: [`shoulderF${S}`, `kneeF${S}`, `ankleF${S}`, `hoofF${S}`],
        role: "leg",
      },
    );
    b.sweep(fore, [0.04, 0.028, 0.02], { color: legWood, name: `foreLeg${S}` });
    b.part(new THREE.TorusGeometry(0.04, 0.011, 5, 8), "#5c9a3a", {
      at: [x(0.18), 0.44, 0.27],
      rotation: [90, 0, 0],
      bone: `kneeF${S}`,
      name: "mossBand",
    });
    b.part(new THREE.CylinderGeometry(0.029, 0.034, 0.04, 7), "#2b221b", {
      at: [x(0.19), 0.02, 0.33],
      bone: `hoofF${S}`,
      name: "hoof",
    });

    const hind = b.chain(
      `hindLeg${S}`,
      [
        [x(0.17), 0.8, -0.4],
        [x(0.18), 0.46, -0.34],
        [x(0.16), 0.2, -0.46],
        [x(0.16), 0.035, -0.4],
      ],
      {
        parent: "pelvis",
        names: [`hipH${S}`, `stifleH${S}`, `hockH${S}`, `hoofH${S}`],
        role: "leg",
      },
    );
    b.sweep(hind, [0.044, 0.03, 0.022, 0.02], { color: legWood, name: `hindLeg${S}` });
    b.part(new THREE.TorusGeometry(0.034, 0.01, 5, 8), "#5c9a3a", {
      at: [x(0.16), 0.2, -0.46],
      rotation: [90, 0, 0],
      bone: `hockH${S}`,
      name: "mossBand",
    });
    b.part(new THREE.CylinderGeometry(0.029, 0.034, 0.04, 7), "#2b221b", {
      at: [x(0.16), 0.02, -0.4],
      bone: `hoofH${S}`,
      name: "hoof",
    });
  }

  // The body: river stones, faceted, under moss.
  b.part(new THREE.DodecahedronGeometry(0.27, 0), mossyStone, {
    at: [0, 0.8, -0.42],
    scale: [0.92, 0.8, 0.95],
    bone: "pelvis",
    name: "stoneRump",
  });
  b.part(new THREE.DodecahedronGeometry(0.29, 0), mossyStone, {
    at: [0, 0.84, 0.14],
    scale: [0.96, 0.82, 1.12],
    bone: "spine2",
    name: "stoneChest",
  });
  b.part(new THREE.DodecahedronGeometry(0.24, 0), mossyStone, {
    at: [0, 0.72, -0.12],
    scale: [1, 0.76, 1.05],
    bone: "spine1",
    name: "stoneBelly",
  });
  for (const s of [1, -1]) {
    b.part(new THREE.DodecahedronGeometry(0.14, 0), mossyStone, {
      at: [s * 0.19, 0.88, 0.16],
      scale: [0.9, 0.9, 0.95],
      bone: "spine2",
      name: "stoneShoulder",
    });
    b.part(new THREE.DodecahedronGeometry(0.13, 0), mossyStone, {
      at: [s * 0.18, 0.86, -0.4],
      scale: [0.9, 0.9, 0.95],
      bone: "pelvis",
      name: "stoneHip",
    });
  }
  b.part(new THREE.DodecahedronGeometry(0.13, 0), mossyStone, {
    at: [0, 1.0, 0.02],
    scale: [0.85, 0.7, 1.25],
    bone: "spine2",
    name: "stoneBack",
  });
  b.part(new THREE.DodecahedronGeometry(0.12, 0), mossyStone, {
    at: [0, 1.02, -0.24],
    scale: [0.82, 0.72, 1],
    bone: "spine1",
    name: "stoneBack",
  });
  b.part(new THREE.DodecahedronGeometry(0.105, 0), mossyStone, {
    at: [0, 0.98, 0.26],
    scale: [0.85, 0.7, 1],
    bone: "neck1",
    name: "stoneNape",
  });

  // Solid moss clumps sitting on the stone.
  const clumps: Array<[Pt, number, string]> = [
    [[0.04, 1.1, 0.0], 0.08, "spine2"],
    [[-0.07, 1.09, -0.22], 0.07, "spine1"],
    [[0.08, 1.06, 0.24], 0.06, "spine2"],
    [[-0.16, 1.02, 0.14], 0.06, "spine2"],
    [[0.17, 1.03, -0.16], 0.06, "spine1"],
  ];
  clumps.forEach(([at, r, bone], i) =>
    b.part(new THREE.IcosahedronGeometry(r, 0), i % 2 ? "#5b9d3b" : "#48892f", {
      at,
      scale: [1.3, 0.55, 1.1],
      bone,
      name: "mossTuft",
    }),
  );

  // Neck of stone, and a short tail of moss.
  b.sweep(neck, [0.1, 0.07], { color: mossyStone, name: "neck" });
  const tail = b.chain(
    "tail",
    [
      [0, 0.84, -0.6],
      [0, 0.92, -0.74],
      [0, 0.97, -0.86],
    ],
    { parent: "pelvis", names: ["tail1", "tail2", "tailTip"], role: "tail" },
  );
  b.sweep(tail, [0.075, 0.035, 0.014], { color: moss, name: "tail" });

  // The head: a stone skull with a moss tuft, a pale wooden mask, a muzzle and a dark nose.
  b.part(new THREE.BoxGeometry(0.19, 0.19, 0.19), mossyStone, {
    at: [0, 1.22, 0.64],
    bone: "head",
    name: "skull",
  });
  b.part(new THREE.IcosahedronGeometry(0.05, 0), "#4a8a2f", {
    at: [0.02, 1.33, 0.6],
    scale: [1.3, 0.5, 1.1],
    bone: "head",
    name: "mossTuft",
  });

  const maskOutline: Array<[number, number]> = [
    [0, 0.115],
    [0.05, 0.108],
    [0.082, 0.08],
    [0.09, 0.02],
    [0.08, -0.03],
    [0.055, -0.085],
    [0.02, -0.11],
    [0, -0.115],
    [-0.02, -0.11],
    [-0.055, -0.085],
    [-0.08, -0.03],
    [-0.09, 0.02],
    [-0.082, 0.08],
    [-0.05, 0.108],
  ];
  b.extrude(maskOutline, {
    color: maskPaint,
    at: [0, 1.215, 0.746],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.02,
    bevel: 0.008,
    smoothing: 1,
    bone: "head",
    name: "mask",
  });

  b.frustumBox([0, 1.175, 0.66], [0, 1.15, 0.93], [0.1, 0.085], [0.07, 0.06], {
    color: paleWood,
    bone: "head",
    name: "snout",
  });
  b.part(new THREE.SphereGeometry(0.026, 7, 5), "#2a2320", { at: [0, 1.152, 0.935], bone: "head", name: "nose" });
  b.part(new THREE.BoxGeometry(0.07, 0.03, 0.17), paleWood, { at: [0, 1.108, 0.8], bone: "jaw", name: "lowerJaw" });

  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.02, 8, 6), "#b6ff8a", {
      at: [s * 0.042, 1.25, 0.758],
      bone: "head",
      name: "eye",
    }).mesh.material = eyeGlow;
  }

  // Leaf-shaped mossy ears, flat out to each side.
  for (const s of [1, -1]) leaf(mirror(s, 0.09, 1.27, 0.66), mirror(s, 0.3, 1.34, 0.6), 0.02, "#6aa548", "head");

  // Branching antlers, each with tiny white flowers at the tips and small leaves along the tines.
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const p = (x: number, y: number, z: number) => mirror(s, x, y, z);

    b.sweep(
      [p(0.05, 1.31, 0.6), p(0.1, 1.42, 0.55), p(0.14, 1.52, 0.46), p(0.15, 1.59, 0.37)],
      [0.022, 0.012, 0.007],
      { color: antlerWood, bone: "head", name: `antler${S}` },
    );
    b.sweep([p(0.1, 1.42, 0.55), p(0.19, 1.45, 0.58), p(0.23, 1.5, 0.66)], [0.011, 0.005], {
      color: antlerWood,
      bone: "head",
      name: `tine${S}A`,
    });
    b.sweep([p(0.14, 1.52, 0.46), p(0.22, 1.56, 0.45), p(0.27, 1.6, 0.47)], [0.011, 0.004], {
      color: antlerWood,
      bone: "head",
      name: `tine${S}B`,
    });
    b.sweep([p(0.15, 1.59, 0.37), p(0.2, 1.66, 0.3), p(0.19, 1.71, 0.23)], [0.01, 0.004], {
      color: antlerWood,
      bone: "head",
      name: `tine${S}C`,
    });

    for (const tip of [p(0.23, 1.5, 0.66), p(0.27, 1.6, 0.47), p(0.19, 1.71, 0.23)]) flower(tip, "head");

    const leaves: Array<[Pt, Pt]> = [
      [p(0.1, 1.42, 0.55), p(0.13, 1.46, 0.64)],
      [p(0.19, 1.45, 0.58), p(0.21, 1.5, 0.5)],
      [p(0.17, 1.56, 0.45), p(0.1, 1.61, 0.42)],
      [p(0.15, 1.62, 0.33), p(0.12, 1.66, 0.25)],
    ];
    for (const [from, to] of leaves) leaf(from, to, 0.011, "#5f9f3f", "head");
  }

  // Fireflies: small glowing bodies on their own joint under the head, each with a faint orbit trail.
  b.joint("fireflies", { parent: "head", at: [0, 1.26, 0.64] });
  const rand = rng(11);
  const orbit = (a: number, r: number, y: number, d: number): Pt => [
    Math.cos(a + d) * r * 1.1,
    y,
    0.64 + Math.sin(a + d) * r * 0.9,
  ];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.5 * rand();
    const r = 0.3 + 0.08 * rand();
    const y = 1.3 + (rand() - 0.5) * 0.35;
    const trail: Pt[] = Array.from({ length: 7 }, (_, k) => orbit(a, r, y, -1.1 * (1 - k / 6)));
    b.sweep(trail, [0.0015, 0.0035], { color: "#dcffb0", bone: "fireflies", name: "trail" }).meshes.forEach(
      (m) => (m.material = trailGlow),
    );
    b.part(new THREE.SphereGeometry(0.012, 6, 4), "#f6ffb0", {
      at: orbit(a, r, y, 0),
      bone: "fireflies",
      name: "firefly",
    }).mesh.material = fireflyGlow;
  }

  return b.root;
}
