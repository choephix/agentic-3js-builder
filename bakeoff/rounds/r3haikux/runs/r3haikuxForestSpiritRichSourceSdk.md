```ts
// A forest spirit, part deer and part mossy river stone. The body is nine-sided river stone with moss over its back,
// held on slender wooden legs that end in little hooves. The head carries a pale carved-wood mask with two glowing
// green eyes, and the antlers branch with white blossom and leaves. Fireflies circle the head on short trails.
import * as THREE from "three";
import { catmull, cells, createBuilder, grain, mix, noise, paint, rng, smoothstep } from "agentic-3js-builder";
import type { Rgb } from "agentic-3js-builder";

export const meta = {
  name: "Forest spirit",
  description:
    "A small forest spirit, part deer and part mossy river stone: a moss-covered stone body on slender wooden legs with little hooves, a pale wooden mask face with glowing green eyes, antlers in bloom, and fireflies circling its head.",
};

const MOSS_DEEP = "#3b6f26";
const MOSS = "#5b9a37";
const MOSS_LIGHT = "#9fd05a";
const STONE_DARK = "#45433d";
const STONE = "#7b786e";
const STONE_LIGHT = "#a5a094";
const WOOD_PALE = "#ebdfc4";
const WOOD_PALE_SHADE = "#c6ae85";
const WOOD_RIM = "#6a4f31";
const SOCKET = "#252017";
const EYE = "#b4ff62";
const FIREFLY = "#f8ff9e";
const TRAIL = "#e8f7a6";
const FLOWER = "#fbf8ee";
const CENTRE = "#f4c430";
const HOOF = "#2a241e";
const EAR = "#6d9450";
const LEAVES = ["#5fae3e", "#3f8a2f", "#8fd05c"];
const CLUMPS = [MOSS, MOSS_LIGHT, MOSS_DEEP];
const PEBBLES = [STONE, STONE_LIGHT, STONE_DARK];

/** Body, neck and tail: river stone in cracked greys, with soft moss over whatever faces up. */
function stoneMoss(p: THREE.Vector3, n: THREE.Vector3): Rgb {
  const c = cells(p, 0.11, 4);
  const crack = smoothstep(0.02, 0.1, c.d2 - c.d1);
  const stone = mix(STONE_DARK, mix(STONE, STONE_LIGHT, c.id), crack);
  const cover = smoothstep(0.3, 0.6, 0.85 * n.y + 0.5 * (noise(p, 0.2, 7) - 0.5) + 0.12);
  const moss = mix(MOSS_DEEP, mix(MOSS, MOSS_LIGHT, noise(p, 0.04, 9)), smoothstep(0.35, 0.65, noise(p, 0.07, 12)));
  return mix(stone, moss, cover);
}

/** Head: the same stone and moss, with a pale carved-wood mask on the front of the face. */
function headPaint(p: THREE.Vector3, n: THREE.Vector3): Rgb {
  const base = stoneMoss(p, n);
  const u = p.x;
  const v = p.y - 1.37;
  const d = Math.hypot(u / 0.092, (v + 0.01) / 0.12);
  const front = smoothstep(0.2, 0.5, n.z);
  const inMask = (1 - smoothstep(0.96, 1, d)) * front;
  const grainy = noise(new THREE.Vector3(p.x * 6, p.y * 0.6, p.z * 6), 0.05, 3);
  const wood = mix(WOOD_PALE_SHADE, WOOD_PALE, smoothstep(0.3, 0.7, grainy));
  const rim = 1 - smoothstep(0, 0.05, Math.abs(d - 1));
  const socketD = Math.hypot((Math.abs(u) - 0.045) / 0.036, v / 0.036);
  const socket = 1 - smoothstep(0.8, 1, socketD);
  const nose =
    (1 - smoothstep(0.002, 0.004, Math.abs(u))) * (1 - smoothstep(-0.12, -0.13, v)) * smoothstep(-0.03, -0.04, v);
  const face = mix(mix(mix(wood, WOOD_RIM, 0.85 * rim), SOCKET, socket), WOOD_RIM, 0.6 * nose);
  return mix(base, face, inMask);
}

export default function forestSpirit() {
  const b = createBuilder({ name: "forest-spirit", detail: 1, paintSize: 1024 });
  const random = rng(7);
  const vec = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const pick = <T>(items: readonly T[]): T => items[Math.floor(random() * items.length)];

  /** A unit vector at right angles to `d` (unit), turned by the random source. */
  const perpendicular = (d: THREE.Vector3) =>
    new THREE.Vector3().crossVectors(d, vec(random() - 0.5, random() - 0.5, random() - 0.5)).normalize();

  /** A random unit direction within `spread` radians of `axis` (unit). */
  const around = (axis: THREE.Vector3, spread: number) => {
    const u = perpendicular(axis);
    const v = new THREE.Vector3().crossVectors(axis, u);
    const tilt = random() * spread;
    const phi = random() * Math.PI * 2;
    return axis
      .clone()
      .multiplyScalar(Math.cos(tilt))
      .addScaledVector(u, Math.sin(tilt) * Math.cos(phi))
      .addScaledVector(v, Math.sin(tilt) * Math.sin(phi))
      .normalize();
  };

  /** A pointed leaf from `base` along `dir`. `plane` (optional) sets which way the leaf lies. */
  const leaf = (
    base: THREE.Vector3,
    dir: THREE.Vector3,
    len: number,
    wid: number,
    color: string,
    bone: string,
    plane?: THREE.Vector3,
  ) => {
    const d = dir.clone().normalize();
    const w = (plane ?? perpendicular(d)).clone();
    w.addScaledVector(d, -w.dot(d)).normalize();
    const at = (t: number, k: number) => base.clone().addScaledVector(d, t * len).addScaledVector(w, (k * wid) / 2);
    b.slab([at(0, 0), at(0.35, 1), at(0.75, 0.6), at(1, 0), at(0.75, -0.6), at(0.35, -1)], {
      color,
      thickness: 0.003,
      bone,
      name: "leaf",
    });
  };

  /** A five-petalled white blossom with a gold centre, lying across `normal` at `centre`. */
  const flower = (centre: THREE.Vector3, normal: THREE.Vector3, radius: number, bone: string) => {
    const n = normal.clone().normalize();
    const u = perpendicular(n);
    const v = new THREE.Vector3().crossVectors(n, u);
    const outline: THREE.Vector3[] = [];
    for (let k = 0; k < 20; k++) {
      const th = (k / 20) * Math.PI * 2;
      const r = radius * (0.4 + 0.6 * Math.abs(Math.cos(2.5 * th)) ** 0.7);
      outline.push(centre.clone().addScaledVector(u, r * Math.cos(th)).addScaledVector(v, r * Math.sin(th)));
    }
    b.slab(outline, { color: FLOWER, thickness: 0.002, bone, name: "flower" });
    b.part(new THREE.SphereGeometry(radius * 0.3, 5, 4), CENTRE, { at: centre, bone, name: "flowerCentre" });
  };

  /** Leaves and blossom sprayed around `centre`, facing `axis`. */
  const cluster = (centre: THREE.Vector3, axis: THREE.Vector3, leaves: number, flowers: number) => {
    const a = axis.clone().normalize();
    for (let i = 0; i < leaves; i++) {
      const len = 0.045 + random() * 0.03;
      leaf(centre.clone().addScaledVector(a, -0.004), around(a, 1.1), len, len * 0.55, pick(LEAVES), "head");
    }
    for (let i = 0; i < flowers; i++) {
      flower(centre.clone().addScaledVector(around(a, 1), 0.012), around(a, 1.2), 0.016 + random() * 0.006, "head");
    }
  };

  // Paints
  const bodyPaint = paint(stoneMoss);
  const headSkin = paint(headPaint);
  const legWood = grain("#ad8f68", "#6c5337", { size: 0.02, axis: "y", seed: 3 });
  const bark = grain("#7f5e3c", "#3d2b1b", { size: 0.018, axis: "y", seed: 8 });
  const paleWood = grain(WOOD_PALE, WOOD_PALE_SHADE, { size: 0.03, axis: "y", seed: 4 });

  // Skeleton: hips, spine, neck (its tip is the head), a jaw hinged under the head, and a tail.
  b.joint("hips", { at: [0, 0.86, -0.22] });
  const spine = b.chain("spine", catmull([[0, 0.86, -0.36], [0, 0.88, 0], [0, 0.9, 0.34]]), {
    parent: "hips",
    names: ["spine1", "spine2", "chest"],
    role: "spine",
  });
  const neck = b.chain("neck", catmull([[0, 0.9, 0.34], [0, 1.13, 0.46], [0, 1.36, 0.56]]), {
    parent: "chest",
    names: ["neck1", "neck2", "head"],
    role: "neck",
  });
  const tail = b.chain("tail", catmull([[0, 0.9, -0.5], [0, 0.92, -0.58], [0, 0.94, -0.64]]), {
    parent: "hips",
    names: ["tail1", "tail2", "tailTip"],
    role: "tail",
  });
  b.joint("jaw", { parent: "head", at: [0, 1.27, 0.62], dir: [0, -0.25, 1], role: "jaw" });

  // Body: river stone in nine flat facets; neck and tail in the same stone and moss.
  const body = b.sweep(spine, {
    radius: (t: number): [number, number] => [
      0.2 + 0.07 * Math.sin(Math.PI * t),
      0.2 + 0.05 * Math.sin(Math.PI * t),
    ],
    section: { ngon: 9 },
    color: bodyPaint,
    name: "body",
  });
  const neckBody = b.sweep(neck, { radius: (t: number) => 0.115 - 0.035 * t, color: bodyPaint, name: "neck" });
  b.sweep(tail, { radius: (t: number) => 0.065 - 0.035 * t, color: bodyPaint, name: "tail" });

  // Head: a loft from the back of the skull to the muzzle, carrying the painted mask.
  const skull = b.loft(
    [
      { at: [0, 1.42, 0.5], w: 0.19, h: 0.2 },
      { at: [0, 1.405, 0.6], w: 0.2, h: 0.21 },
      { at: [0, 1.37, 0.72], w: 0.18, h: 0.18 },
      { at: [0, 1.31, 0.83], w: 0.11, h: 0.11 },
    ],
    { color: headSkin, bone: "head", name: "skull" },
  );
  b.sweep(catmull([[0, 1.27, 0.62], [0, 1.24, 0.72], [0, 1.25, 0.8]]), {
    radius: [0.03, 0.026],
    color: paleWood,
    bone: "jaw",
    name: "jaw",
  });

  // Glowing green eyes, seated on the face surface.
  const faceSurface = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = faceSurface.nearest([s * 0.045, 1.37, 0.76]);
    b.stick(new THREE.SphereGeometry(0.021, b.segments(10), b.segments(7)), EYE, hit, {
      embed: 0.25,
      name: "eye",
    });
  }

  // Leaf-shaped ears, lying flat and spread sideways.
  for (const s of [1, -1]) {
    leaf(vec(s * 0.085, 1.43, 0.5), vec(s * 0.95, 0.4, -0.25), 0.14, 0.06, EAR, "head", vec(0, 0, 1));
  }

  // Antlers: a bark beam per side, three tines and a twig off each, with leaves and blossom along them.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const out = (v: number) => (s > 0 ? { left: v } : { right: v });
    const beam = b.sweep(
      catmull([
        [s * 0.05, 1.44, 0.46],
        [s * 0.1, 1.6, 0.41],
        [s * 0.15, 1.74, 0.33],
        [s * 0.17, 1.87, 0.21],
      ]),
      { radius: (t: number) => 0.027 - 0.017 * t, color: bark, bone: "head", name: `antler${side}` },
    );
    const tines = [
      { t: 0.3, mid: { up: 0.05, ...out(0.04) }, tip: { up: 0.12, ...out(0.09) } },
      { t: 0.6, mid: { up: 0.06, forward: 0.03, ...out(0.04) }, tip: { up: 0.13, forward: 0.07, ...out(0.08) } },
      { t: 0.86, mid: { up: 0.06, forward: -0.01, ...out(0.05) }, tip: { up: 0.12, forward: -0.03, ...out(0.1) } },
    ];
    tines.forEach(({ t, mid, tip }, i) => {
      const f = beam.at(t);
      const m = f.local(mid);
      const e = f.local(tip);
      const base = f.at.addScaledVector(f.n, -0.012);
      b.sweep(catmull([base, m, e]), {
        radius: [0.016, 0.007],
        color: bark,
        bone: "head",
        name: `tine${side}${i + 1}`,
      });
      const dir = e.clone().sub(m).normalize();
      const twig = [
        e.clone().addScaledVector(dir, -0.01),
        e.clone().addScaledVector(dir, 0.045).add(vec(s * 0.025, 0.03, 0)),
        e.clone().addScaledVector(dir, 0.085).add(vec(s * 0.05, 0.05, 0.02)),
      ];
      b.sweep(catmull(twig), { radius: [0.009, 0.004], color: bark, bone: "head", name: `twig${side}${i + 1}` });
      cluster(e, dir, 2, 2);
      cluster(twig[2], dir, 1, 1);
    });
    for (const t of [0.2, 0.5, 0.78]) {
      const f = beam.at(t);
      cluster(f.at, f.n, 2, t === 0.5 ? 1 : 0);
    }
  }

  // Legs: slender driftwood legs with little dark hooves. Forelegs hang from the chest, hind legs from the hips.
  const leg = (side: "L" | "R", front: boolean) => {
    const s = side === "L" ? 1 : -1;
    const x = 0.15 * s;
    const pts: number[][] = front
      ? [
          [x, 0.82, 0.28],
          [x + 0.005 * s, 0.5, 0.3],
          [x, 0.2, 0.33],
          [x, 0.07, 0.34],
        ]
      : [
          [x + 0.01 * s, 0.84, -0.3],
          [x + 0.02 * s, 0.5, -0.14],
          [x, 0.2, -0.34],
          [x, 0.07, -0.3],
        ];
    const names = front
      ? [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hoofF${side}`]
      : [`hip${side}`, `knee${side}`, `hock${side}`, `hoofH${side}`];
    const ground: [number, number, number] = [x, 0, pts[3][2]];
    const label = front ? `foreLeg${side}` : `hindLeg${side}`;
    const chain = b.chain(label, catmull(pts), {
      parent: front ? "chest" : "hips",
      names,
      role: "leg",
      contact: ground,
    });
    b.sweep(chain, { radius: (t: number) => 0.036 - 0.016 * t, color: legWood, name: label });
    b.sweep([ground, [x, pts[3][1], pts[3][2]]], {
      radius: [0.026, 0.02],
      section: { ngon: 6 },
      caps: { start: "flat", end: "round" },
      color: HOOF,
      bone: names[3],
      name: `hoof${side}${front ? "F" : "H"}`,
    });
  };
  for (const side of ["L", "R"] as const) {
    leg(side, true);
    leg(side, false);
  }

  // Moss clumps over the back and neck, river pebbles down the flanks.
  const bodySurface = b.surface(body);
  for (const h of bodySurface.scatter(70, { rng: rng(21), minDist: 0.06, filter: (hit) => hit.n.y > 0.5 })) {
    b.stick(new THREE.IcosahedronGeometry(0.03 + random() * 0.025, 0), pick(CLUMPS), h, {
      embed: 0.45,
      scale: [1.3, 0.55, 1.1],
      name: "moss",
    });
  }
  for (const h of bodySurface.scatter(26, { rng: rng(33), minDist: 0.08, filter: (hit) => hit.n.y < 0.2 })) {
    b.stick(new THREE.DodecahedronGeometry(0.028 + random() * 0.02, 0), pick(PEBBLES), h, {
      embed: 0.35,
      scale: [1, 0.7, 1.15],
      name: "pebble",
    });
  }
  for (const h of b.surface(neckBody).scatter(8, { rng: rng(5), minDist: 0.05, filter: (hit) => hit.n.y > 0.5 })) {
    b.stick(new THREE.IcosahedronGeometry(0.028 + random() * 0.012, 0), pick(CLUMPS), h, {
      embed: 0.45,
      scale: [1.2, 0.55, 1.0],
      name: "moss",
    });
  }
  for (const h of faceSurface.scatter(6, { rng: rng(9), minDist: 0.05, filter: (hit) => hit.n.y > 0.6 })) {
    b.stick(new THREE.IcosahedronGeometry(0.022 + random() * 0.01, 0), pick(CLUMPS), h, {
      embed: 0.45,
      scale: [1.2, 0.55, 1.0],
      name: "moss",
    });
  }

  // Fireflies: six lights on loose orbits round the head, each with a short trail behind it.
  const orbit = (theta: number, rx: number, rz: number, tilt: number) =>
    vec(rx * Math.cos(theta), 1.42 + 0.18 * Math.sin(theta + tilt), 0.5 + rz * Math.sin(theta));
  for (let i = 0; i < 6; i++) {
    const rx = 0.28 + random() * 0.1;
    const rz = 0.36 + random() * 0.08;
    const tilt = random() * Math.PI * 2;
    const theta = random() * Math.PI * 2;
    const trail = Array.from({ length: 9 }, (_, k) => orbit(theta - 1.1 + (1.1 * k) / 8, rx, rz, tilt));
    b.sweep(catmull(trail), { radius: 0.0022, color: TRAIL, bone: "head", sides: 4, name: "trail" });
    b.part(new THREE.SphereGeometry(0.011, 6, 4), FIREFLY, {
      at: orbit(theta, rx, rz, tilt),
      bone: "head",
      name: "firefly",
    });
  }

  return b.root;
}
```