// A red panda balancing on a moss-grown stone, in a Genshin-style look: a toon-shaded rust coat with cream face and
// dark chestnut legs, a gold filigree collar with a glowing gem pendant, a gold-banded tail, and an elemental rune and
// crystal shards on the stone. Real size: about 0.5 m from nose to rump, tail a further 0.45 m.
import type { Texture } from "three";
import * as THREE from "three";
import { glow } from "../kits/glow";
import { animeEye, cel, furEdge, INK, inkLines, zigzag } from "../kits/toon";
import { createBuilder } from "../src/builder";
import { type Frame, frame } from "../src/frame";
import { limb } from "../src/ik";
import { DEG, rng } from "../src/math";
import { catmull } from "../src/path";
import { cells, gradient, mix, noise, paint } from "../src/paint";
import type { Paint } from "../src/paint";
import { svg } from "../src/texture";

export const meta = {
  name: "Red Panda on a Mossy Stone",
  description:
    "A red panda poised on one moss-grown stone, tail raised for balance. Cel-shaded rust coat with a cream face, a gold filigree collar with a glowing gem pendant, a gold-banded tail, and a glowing rune and crystal shards on the stone.",
  style: "Genshin Impact",
  commit: "b816db2",
};

type Pt = [number, number, number];

const RUST = "#f2683a";
const CREAM = "#fff1da";
const BELLY = "#8a3e27";
const DARK = "#3a2220";
const NOSE = "#221314";
const GOLD = "#ffd862";
const GOLD_DEEP = "#c98b2c";
const GEM = "#86faff";
const MOSS = "#93e26c";
const MOSS_DEEP = "#3e9d4d";
const STONE = "#b9c4dc";
const STONE_DEEP = "#7f8dae";

// Head geometry, shared by the skull, the face paint, the ears and the eye placement.
const HC: Pt = [0, 0.6, 0.42];
const HR: Pt = [0.085, 0.078, 0.09];
const PAW_TOP_GAP = 0.02;

/** A point on the skull ellipsoid at azimuth (0 = front, 90 = model left) and elevation, in degrees. */
function onHead(az: number, el: number): Pt {
  const a = az * DEG;
  const e = el * DEG;
  return [HC[0] + HR[0] * Math.sin(a) * Math.cos(e), HC[1] + HR[1] * Math.sin(e), HC[2] + HR[2] * Math.cos(a) * Math.cos(e)];
}

function segDist(p: THREE.Vector3, a: Pt, b: Pt) {
  const A = new THREE.Vector3(...a);
  const ab = new THREE.Vector3(...b).sub(A);
  const t = Math.max(0, Math.min(1, p.clone().sub(A).dot(ab) / ab.lengthSq()));
  return p.distanceTo(A.addScaledVector(ab, t));
}

function unit(v: Pt): Pt {
  const l = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / l, v[1] / l, v[2] / l];
}

/**
 * A low-poly boulder: an icosahedron jittered per vertex (shared corners move together), its top pulled flat so
 * it can carry feet. Faceted normals, and its bottom sits 1 cm into the floor.
 */
function rockGeometry(seed: number, rx: number, ry: number, rz: number, flatTop: boolean) {
  const r = rng(seed);
  const src = new THREE.IcosahedronGeometry(1, 2);
  const pos = src.getAttribute("position");
  const jitter = new Map<string, number>();
  const pts: number[] = [];
  for (let i = 0; i < pos.count; i++) {
    const x0 = pos.getX(i);
    const y0 = pos.getY(i);
    const z0 = pos.getZ(i);
    const key = `${x0.toFixed(3)},${y0.toFixed(3)},${z0.toFixed(3)}`;
    let j = jitter.get(key);
    if (j === undefined) {
      j = 1 + (r() - 0.5) * 0.26;
      jitter.set(key, j);
    }
    const x = x0 * rx * j;
    let y = y0 * ry * j;
    const z = z0 * rz * j;
    if (flatTop && y > ry * 0.42) y = ry * 0.42 + (y - ry * 0.42) * 0.15;
    if (y < -ry * 0.7) y = -ry * 0.7 + (y + ry * 0.7) * 0.2;
    pts.push(x, y, z);
  }
  let minY = Infinity;
  for (let i = 1; i < pts.length; i += 3) minY = Math.min(minY, pts[i]);
  for (let i = 1; i < pts.length; i += 3) pts[i] -= minY + 0.01;
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  geo.computeVertexNormals();
  geo.computeBoundingBox();
  return geo;
}

/** A clump of blades for moss, grass and fur, drawn as one SVG card. */
function tuft(colors: readonly string[], seed: number, blades = 8): Texture {
  const r = rng(seed);
  let body = "";
  for (let i = 0; i < blades; i++) {
    const x = 5 + (i / (blades - 1)) * 22 + (r() - 0.5) * 3;
    const h = 16 + r() * 13;
    const lean = (r() - 0.5) * 11;
    const w = 2.6 + r() * 1.2;
    const bx = x + lean * 0.2;
    body +=
      `<path d="M${(x - w).toFixed(2)} 31 Q${(bx - w * 0.3).toFixed(2)} ${(31 - h * 0.55).toFixed(2)} ` +
      `${(x + lean).toFixed(2)} ${(31 - h).toFixed(2)} Q${(bx + w * 0.3).toFixed(2)} ${(31 - h * 0.55).toFixed(2)} ` +
      `${(x + w).toFixed(2)} 31Z" fill="${colors[i % colors.length]}"/>`;
  }
  return svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">${body}</svg>`, { size: 128 });
}

export default function build() {
  const b = createBuilder({ name: "redPandaHaiku" });

  // ---- paints: every colour is a cel tone, the shadow hue-shifted by the toon kit ----
  const goldFlat = cel(GOLD);
  const goldPat = cel(paint((_p, _n, s) => (((s[1] % 24) + 24) % 24 < 9 ? GOLD_DEEP : GOLD)));
  const rustC = cel(RUST);
  const creamC = cel(CREAM);
  const darkC = cel(DARK);
  const noseC = cel(NOSE);
  const coatC = cel(furEdge(RUST, BELLY, { axis: [0, 1, 0], level: -0.12, teeth: 0.14, period: 0.03, ink: INK, inkWidth: 0.05 }));
  const earC = cel(paint((p, n) => (n.z > 0.5 && p.y < 0.695 + 0.012 * zigzag(p.x / 0.016) ? CREAM : RUST)));
  const headC = cel(
    inkLines(
      paint((p, n) => {
        for (const s of [1, -1]) if (segDist(p, onHead(s * 34, 4), onHead(s * 46, -22)) < 0.0055) return DARK;
        const edge = 0.14 + 0.05 * zigzag(p.y / 0.022);
        return n.z > edge && n.y < 0.12 ? CREAM : RUST;
      }),
      { levels: [0.14], axis: [0, 0, 1], width: 0.035 },
    ),
  );
  const stoneC = cel(
    paint((p, n) => {
      if (n.y > 0.55 + 0.18 * (noise(p, 0.07, 3) - 0.5)) return mix(MOSS, MOSS_DEEP, noise(p, 0.03, 5));
      const c = cells(p, 0.1, 11);
      return c.d2 - c.d1 < 0.012 ? STONE_DEEP : mix(STONE, STONE_DEEP, noise(p, 0.05, 2) * 0.6);
    }),
  );

  // ---- textures ----
  const tuftRust = tuft([RUST, "#ff8a55", BELLY], 3);
  const tuftCream = tuft([CREAM, "#ffe2b8", "#f5c9a0"], 4);
  const tuftDark = tuft([DARK, BELLY, "#5a3328"], 5);
  const tuftMoss = tuft(["#93e26c", MOSS_DEEP, "#b8f08a"], 6, 9);
  const fringe = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 48">${[2, 5, 8, 11, 14]
      .map(
        (x) =>
          `<path d="M${x} 0 Q${x + (x % 4 ? 1 : -1)} 24 ${x} 48" fill="none" stroke="${GOLD}" stroke-width="2.4" stroke-linecap="round"/>`,
      )
      .join("")}</svg>`,
    { size: 128 },
  );
  const filigree = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="none" stroke="${GOLD_DEEP}" stroke-width="3.5"/>${[0, 1, 2, 3, 4, 5, 6, 7]
      .map((k) => {
        const a = k * 45 * DEG;
        const x = 50 + 30 * Math.cos(a);
        const y = 50 + 30 * Math.sin(a);
        const mx = 50 + 20 * Math.cos(a + 0.5);
        const my = 50 + 20 * Math.sin(a + 0.5);
        return `<path d="M50 50 Q${mx.toFixed(2)} ${my.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)}" fill="none" stroke="${GOLD}" stroke-width="3"/><circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="5.5" fill="none" stroke="${GOLD}" stroke-width="2.4"/>`;
      })
      .join("")}<circle cx="50" cy="50" r="9" fill="${GOLD}" stroke="${GOLD_DEEP}" stroke-width="2"/></svg>`,
    { size: 512 },
  );
  const ticks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    .map((k) => {
      const a = k * 30 * DEG;
      return `<path d="M${(50 + 31 * Math.cos(a)).toFixed(2)} ${(50 + 31 * Math.sin(a)).toFixed(2)} L${(50 + 37 * Math.cos(a)).toFixed(2)} ${(50 + 37 * Math.sin(a)).toFixed(2)}" stroke="${GEM}" stroke-width="2.4"/>`;
    })
    .join("");
  const rune = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="none" stroke="${GEM}" stroke-width="3"/><circle cx="50" cy="50" r="38" fill="none" stroke="${GEM}" stroke-width="2"/>${ticks}<path d="M50 20 L72 62 L28 62Z M50 80 L28 38 L72 38Z" fill="none" stroke="${GEM}" stroke-width="2.4"/></svg>`,
    { size: 512 },
  );

  // ---- stone and its root: the root joint is never bent by the flex tests, so the stone stays put ----
  const base = b.joint("base", { at: [0, 0, 0] });
  const stoneGeo = rockGeometry(3, 0.36, 0.17, 0.3, true);
  const TOP = stoneGeo.boundingBox?.max.y ?? 0.25;
  const stone = b.part(stoneGeo, stoneC, { bone: base, at: [0, 0, 0], name: "stone" });
  for (const [x, z, rr, seed] of [
    [0.5, 0.2, 0.07, 41],
    [-0.46, -0.24, 0.06, 42],
    [0.2, -0.44, 0.05, 43],
  ] as const) {
    b.part(rockGeometry(seed, rr, rr * 0.7, rr * 0.85, false), stoneC, { bone: base, at: [x, 0, z] });
  }
  const rockSkin = b.surface(stone);
  // Glowing rune on the stone's top, round the feet.
  glow(
    b.part(new THREE.PlaneGeometry(0.5, 0.5), "#ffffff", {
      bone: base,
      at: [0, TOP + 0.003, 0],
      rotation: [-90, 0, 0],
      texture: rune,
      name: "rune",
    }),
  );
  // Moss clumps over the top and down the upper flanks.
  b.cards(rockSkin.scatter(44, { rng: rng(9), minDist: 0.045, filter: (h) => h.n.y > 0.55 }), [tuftMoss, tuftRust], {
    size: [0.06, 0.06],
    lean: 12,
    bend: 10,
    vary: 0.3,
    rng: rng(10),
  });
  b.cards(rockSkin.scatter(30, { rng: rng(12), minDist: 0.05, filter: (h) => h.n.y > -0.2 && h.n.y < 0.5 }), tuftMoss, {
    size: [0.045, 0.045],
    lean: 35,
    vary: 0.3,
    rng: rng(13),
  });
  // Elemental crystal shards jutting from the stone.
  for (const [az, el] of [
    [40, 30],
    [-115, 25],
    [160, 35],
    [-30, 45],
  ] as const) {
    const hit = rockSkin.around([0, TOP / 2, 0]).at(az, el);
    if (!hit) throw new Error(`no stone surface at ${az}/${el}`);
    glow(b.stick(new THREE.ConeGeometry(0.026, 0.11, 5), GEM, hit, { embed: 0.3 }));
  }
  // Grass tufts on the floor around the stone.
  const floorTufts: Frame[] = [];
  const fr = rng(21);
  for (let i = 0; i < 8; i++) {
    const a = fr() * Math.PI * 2;
    const d = 0.5 + fr() * 0.2;
    floorTufts.push(frame([Math.cos(a) * d, 0, Math.sin(a) * d * 0.8], [0, 1, 0]));
  }
  b.cards(floorTufts, [tuftMoss, tuftRust], { size: [0.08, 0.1], lean: 0, vary: 0.3, rng: rng(22) });

  // ---- skeleton: spine, tail, neck, head, four legs ----
  const PAW = TOP + PAW_TOP_GAP;
  const hips = b.joint("hips", { parent: base, at: [0, 0.4, -0.16], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.41, -0.14],
      [0, 0.42, -0.02],
      [0, 0.45, 0.08],
      [0, 0.47, 0.16],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.4, -0.2],
      [0, 0.38, -0.3],
      [0.04, 0.37, -0.38],
      [0.14, 0.44, -0.46],
      [0.25, 0.53, -0.46],
      [0.31, 0.62, -0.4],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4", "tail5"], role: "tail" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.47, 0.16],
      [0, 0.53, 0.28],
      [0, 0.59, 0.37],
    ]),
    { parent: spine.joints[2], names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: HC, aim: [0, 0.65, 0.48], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.553, 0.45], aim: [0, 0.535, 0.53], role: "jaw" });

  // ---- body, neck and tail tubes ----
  const bodySw = b.sweep(spine, (t): [number, number] => [0.095 + 0.02 * Math.sin(Math.PI * t), 0.1 + 0.016 * Math.sin(Math.PI * t)], {
    color: coatC,
  });
  const neckSw = b.sweep(neck, (t): [number, number] => [0.066 - 0.008 * t, 0.07 - 0.008 * t], { color: coatC });

  const edges: [number, number][] = [
    [0.12, 0],
    [0.24, 1],
    [0.36, 0],
    [0.48, 1],
    [0.6, 0],
    [0.72, 1],
    [0.84, 0],
    [0.92, 1],
  ];
  const tailBands: [number, Paint][] = edges.map(([e, k]) => [e, k ? creamC : rustC]);
  tailBands.push([1, darkC]);
  const tailSw = b.sweep(tail, (t) => 0.075 * (1 - 0.55 * t) + 0.012 * Math.sin(Math.PI * t), {
    bands: tailBands,
    color: rustC,
  });

  // Fur cards: rust on the back, cream at the throat, banded on the tail.
  const backTufts: Frame[] = [];
  for (let t = 0.1; t <= 0.9; t += 0.1) for (let d = -60; d <= 60; d += 30) backTufts.push(bodySw.at(t, d));
  b.cards(backTufts, tuftRust, { size: [0.024, 0.04], lean: 22, bend: 12, vary: 0.25, rng: rng(31), sink: 0.2 });
  const throatTufts: Frame[] = [];
  for (let t = 0.1; t <= 0.9; t += 0.1) for (let d = 120; d <= 240; d += 40) throatTufts.push(neckSw.at(t, d));
  b.cards(throatTufts, tuftCream, { size: [0.026, 0.04], lean: 45, bend: 12, vary: 0.25, rng: rng(32), sink: 0.15 });

  const tailR: Record<"rust" | "cream" | "dark", Frame[]> = { rust: [], cream: [], dark: [] };
  for (let t = 0.03; t <= 0.98; t += 0.06) {
    const group = t > 0.92 ? tailR.dark : edges.find(([e]) => t <= e)?.[1] === 1 ? tailR.cream : tailR.rust;
    for (let d = 0; d < 360; d += 90) group.push(tailSw.at(t, d));
  }
  b.cards(tailR.rust, tuftRust, { size: [0.03, 0.05], lean: 25, bend: 12, vary: 0.25, rng: rng(33), sink: 0.15 });
  b.cards(tailR.cream, tuftCream, { size: [0.03, 0.05], lean: 25, bend: 12, vary: 0.25, rng: rng(34), sink: 0.15 });
  b.cards(tailR.dark, tuftDark, { size: [0.03, 0.05], lean: 25, bend: 12, vary: 0.25, rng: rng(35), sink: 0.15 });

  // Gold band round the tail.
  const tailRing = b.ring(tail.at(0.7), { count: 18, radius: 0.058 });
  b.sweep(catmull(tailRing.items, { closed: true }), 0.0085, { color: goldPat });

  // ---- head: skull, muzzle, jaw, ears, face details ----
  const skull = b.part(new THREE.SphereGeometry(1, 16, 12), headC, { bone: head, at: HC, scale: HR, name: "skull" });
  const skin = b.surface(skull);
  const EYE = animeEye({ iris: "#2fd1c4" });
  for (const s of [1, -1]) {
    const hit = skin.around(HC).at(s * 32, 12);
    if (!hit) throw new Error("no eye hit");
    b.decal(skin, EYE, { at: hit, size: [0.05, 0.068], mirror: s > 0 });
  }
  // Fluffy cream cheeks and a rust crown, carded over the skull.
  b.cards(skin.scatter(30, { rng: rng(70), minDist: 0.026, filter: (h) => h.n.y < 0.15 && h.n.z > -0.2 && Math.abs(h.n.x) > 0.55 }), tuftCream, {
    size: [0.018, 0.026],
    lean: 70,
    bend: 10,
    vary: 0.2,
    rng: rng(71),
    sink: 0.25,
  });
  b.cards(skin.scatter(30, { rng: rng(72), minDist: 0.028, filter: (h) => h.n.y > 0.5 }), tuftRust, {
    size: [0.02, 0.03],
    lean: 60,
    bend: 10,
    vary: 0.2,
    rng: rng(73),
    sink: 0.25,
  });
  b.part(new THREE.SphereGeometry(1, 10, 8), creamC, { bone: head, at: [0, 0.57, 0.5], scale: [0.05, 0.034, 0.04], name: "muzzle" });
  b.part(new THREE.SphereGeometry(1, 8, 6), noseC, { bone: head, at: [0, 0.582, 0.528], scale: [0.02, 0.014, 0.013], name: "nose" });
  b.part(new THREE.SphereGeometry(1, 10, 8), creamC, { bone: jaw, at: [0, 0.542, 0.49], scale: [0.036, 0.016, 0.04], name: "lowerJaw" });
  b.part(new THREE.SphereGeometry(1, 8, 6), noseC, { bone: head, at: [0, 0.56, 0.522], scale: [0.02, 0.006, 0.01], name: "mouth" });
  for (const s of [1, -1]) {
    for (let k = 0; k < 3; k++) {
      const y = 0.565 + k * 0.011;
      b.rod([s * 0.02, y, 0.53], [s * 0.088, y - 0.008 + k * 0.004, 0.515], 0.0013, { bone: head, color: CREAM });
    }
  }

  // Ears: rounded triangles on hinge joints, rust outside with a cream inner, a gold tip bead each.
  const earOutline: [number, number][] = [
    [-0.04, 0],
    [0.04, 0],
    [0.036, 0.065],
    [0, 0.09],
    [-0.036, 0.065],
  ];
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const at = onHead(s * 72, 52);
    const dir = unit([s * 0.25, 1, -0.15]);
    const earJ = b.joint(`ear${L}`, { parent: head, at, dir, role: "hinge" });
    b.extrude(earOutline, {
      at,
      x: [s, 0, 0],
      y: dir,
      thickness: 0.016,
      bevel: 0.004,
      smoothing: 2,
      color: earC,
      bone: earJ,
    });
  }

  // ---- legs: hind limbs fold with the knee forward, fore limbs with the elbow back ----
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const hipP: Pt = [s * 0.07, 0.4, -0.15];
    const hindFoot: Pt = [s * 0.085, PAW, -0.1];
    const hind = b.chain(`hind${L}`, limb(hipP, hindFoot, [0.13, 0.12], [[0, 0, 1]]), {
      parent: hips,
      names: [`hip${L}`, `knee${L}`, `ankle${L}`],
      role: "leg",
    });
    b.sweep(hind, (t) => 0.046 - 0.012 * t, { color: cel(gradient(RUST, DARK, hipP, hindFoot)) });

    const frontP: Pt = [s * 0.07, 0.42, 0.14];
    const frontFoot: Pt = [s * 0.085, PAW, 0.2];
    const fore = b.chain(`fore${L}`, limb(frontP, frontFoot, [0.12, 0.12], [[0, 0, -1]]), {
      parent: spine.joints[2],
      names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`],
      role: "leg",
    });
    b.sweep(fore, (t) => 0.046 - 0.012 * t, { color: cel(gradient(RUST, DARK, frontP, frontFoot)) });

    for (const [chain, foot, toeZ] of [
      [hind, hindFoot, -0.1],
      [fore, frontFoot, 0.2],
    ] as const) {
      const tip = chain.tip;
      if (!tip) throw new Error("leg without a foot");
      b.part(new THREE.SphereGeometry(1, 10, 8), darkC, {
        bone: tip,
        at: [foot[0], PAW - 0.005, toeZ],
        scale: [0.032, 0.02, 0.045],
        name: `paw${L}`,
      });
      for (const k of [-1, 0, 1]) {
        b.part(new THREE.SphereGeometry(1, 6, 4), noseC, {
          bone: tip,
          at: [foot[0] + k * 0.011, PAW - 0.008, toeZ + 0.04],
          scale: [0.0085, 0.0075, 0.0085],
        });
        b.spike([foot[0] + k * 0.011, PAW - 0.02, toeZ + 0.045], [0, -0.4, 1], 0.012, 0.0035, { color: creamC });
      }
    }
  }

  // ---- gold collar, pendant, tassels ----
  const collar = b.surface(neckSw).loop(neck.at(0.45), { lift: 0.008 });
  b.sweep(collar, 0.0105, { color: goldPat });

  const bodySkin = b.surface(bodySw);
  const pendHit = bodySkin.around([0, 0.46, 0.12]).at(0, -12);
  if (!pendHit) throw new Error("no chest hit for the pendant");
  const pendOutline: [number, number][] = [
    [-0.03, 0],
    [0.03, 0],
    [0.034, -0.05],
    [0, -0.09],
    [-0.034, -0.05],
  ];
  const pend = b.extrude(pendOutline, {
    at: pendHit,
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.014,
    bevel: 0.004,
    smoothing: 2,
    color: goldFlat,
    name: "pendant",
  });
  b.part(new THREE.PlaneGeometry(0.05, 0.07), "#ffffff", {
    texture: filigree,
    at: pend.local([0, -0.04, 0.0075]),
    dir: [0, 0, 1],
    axis: "z",
    bone: pend.bone ?? undefined,
    name: "pendantFiligree",
  });
  glow(
    b.stick(new THREE.OctahedronGeometry(0.012, 0), GEM, frame(pend.local([0, -0.045, 0.012]), [0, 0, 1]), {
      embed: 0.25,
      name: "pendantGem",
    }),
  );

  const neckMid = neck.at(0.42).at;
  for (const s of [1, -1]) {
    const top: Pt = [neckMid.x + s * 0.068, neckMid.y - 0.03, neckMid.z];
    const bead: Pt = [top[0] + s * 0.012, top[1] - 0.12, top[2] + 0.03];
    b.sweep(catmull([top, [top[0] + s * 0.008, top[1] - 0.06, top[2] + 0.02], bead]), 0.0034, { color: goldPat });
    b.part(new THREE.SphereGeometry(1, 8, 6), goldFlat, { at: bead, scale: [0.016, 0.02, 0.016], name: `tassel${s > 0 ? "L" : "R"}` });
    const hang: Frame[] = [];
    for (let k = 0; k < 10; k++) {
      const a = (k / 10) * Math.PI * 2;
      hang.push(frame([bead[0] + Math.cos(a) * 0.013, bead[1] - 0.02, bead[2] + Math.sin(a) * 0.013], [0, 1, 0]));
    }
    b.cards(hang, fringe, { size: [0.012, 0.05], lean: 180, flow: [0, 0, 1], vary: 0.15, rng: rng(60 + s) });
  }

  // ---- circlet with a gem on the forehead ----
  const circlet = b.ring(frame([0, HC[1] + 0.035, HC[2]], [0, 1, 0]), { count: 28, radius: 0.079 });
  b.sweep(catmull(circlet.items, { closed: true }), 0.0065, { color: goldPat, bone: head });
  const gemHit = skin.around(HC).at(0, 20);
  if (!gemHit) throw new Error("no forehead hit");
  glow(b.stick(new THREE.OctahedronGeometry(0.014, 0), GEM, gemHit, { embed: 0.3, name: "forehead gem" }));

  return b.root;
}
