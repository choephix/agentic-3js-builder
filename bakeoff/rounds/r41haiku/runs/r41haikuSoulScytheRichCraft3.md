```ts
import * as THREE from "three";
import { createBuilder, rng, svg, paint, mottle, grain, mix, noise, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "dragonbone-soul-scythe",
  description:
    "A dragonbone soul scythe, about 2.1 m: a tapered bone shaft wrapped in violet leather, a crescent blade with rib ridges and a rune face, a glowing teal soul gem set in the socket and a violet ribbon.",
};

// Palette
const BONE_LIGHT = "#f2e6c8";
const BONE_DARK = "#a88f66";
const BONE_SHADOW = "#6b5336";
const LEATHER = "#2a1a33";
const LEATHER_HI = "#4a2f57";
const GOLD = "#d8ab52";
const SOUL = "#5ff7e0";
const SOUL_DEEP = "#1c8fa8";
const VIOLET = "#9a5cff";
const INK = "#1a0f22";

// Scale constants
const H = 2.1; // total height
const SHAFT_TOP = 1.86;
const BLADE_Y = 1.9;

// Paints (one per look; parts that share a paint continue one pattern)
const BONE = mottle(BONE_LIGHT, BONE_DARK, { size: 0.05, contrast: 0.8, seed: 3 });
const BONE_RIBS = grain(BONE_LIGHT, BONE_SHADOW, { size: 0.012, axis: "y", seed: 8 });
const SHAFT = paint((p, n, s) => {
  // Dragonbone shaft: pale top light, shadowed underside, faint grain running up the length.
  const streak = noise(p, 0.012, 11);
  const base = mix(BONE_DARK, BONE_LIGHT, smoothstep(0.3, 0.8, streak));
  const lit = mix(base, BONE_LIGHT, 0.25 * smoothstep(0.2, 0.9, n.y));
  const dark = mix(lit, BONE_SHADOW, 0.5 * smoothstep(-0.1, -0.8, n.y));
  // Dark bands where the shaft meets the leather wraps (by height along t).
  const wrap = s[0] > 0.44 && s[0] < 0.6 ? LEATHER : dark;
  return wrap;
});
const WRAP = mottle(LEATHER, LEATHER_HI, { size: 0.02, contrast: 0.6, seed: 5 });

// Soul-gem and blade glow colours are flat so the glow kit can light them.

/** Rune card drawn on the blade face: a teal ring, violet glyphs, dark outline. */
function runeTexture() {
  return svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="29" fill="none" stroke="${INK}" stroke-width="5"/>
      <circle cx="32" cy="32" r="27" fill="none" stroke="${SOUL}" stroke-width="2.4"/>
      <circle cx="32" cy="32" r="18" fill="none" stroke="${VIOLET}" stroke-width="2"/>
      <path d="M32 9 L38 24 L32 32 L26 24 Z" fill="none" stroke="${SOUL}" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M32 55 L26 40 L32 32 L38 40 Z" fill="none" stroke="${SOUL}" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M9 32 L24 26 L32 32 L24 38 Z" fill="none" stroke="${VIOLET}" stroke-width="2" stroke-linejoin="round"/>
      <path d="M55 32 L40 26 L32 32 L40 38 Z" fill="none" stroke="${VIOLET}" stroke-width="2" stroke-linejoin="round"/>
      <circle cx="32" cy="32" r="3.2" fill="${SOUL}"/>
    </svg>`,
    { size: 256 },
  );
}

/** Ribbon/tassel card: a violet strip with a gold edge. */
function ribbonPaint() {
  return paint((p, n, s) => {
    const edge = s[1] > 0.4 && s[1] < 0.6 ? GOLD : VIOLET;
    return smoothstep(0.1, 0.9, Math.abs(Math.sin(s[0] * 18))) > 0.6 ? mix(edge, INK, 0.2) : edge;
  });
}

export default function build() {
  const b = createBuilder({ name: "dragonbone-soul-scythe" });

  // --- Shaft: a tapered dragonbone spine from the butt to the socket -------------------------
  const shaftPath = [
    [0, 0.12, 0],
    [0, 0.8, 0],
    [0, 1.5, 0],
    [0, SHAFT_TOP, 0],
  ];
  b.sweep(shaftPath, (t: number) => 0.04 - 0.014 * t, {
    color: SHAFT,
    caps: { start: "flat", end: "round" },
    sides: 10,
  });

  // Vertebra knobs along the shaft (dragon spine), spaced evenly.
  const vert = new THREE.ConeGeometry(0.022, 0.06, 6);
  for (let i = 0; i < 6; i++) {
    const y = 0.3 + i * 0.22;
    b.part(vert, BONE_DARK, { at: [0, y, 0], dir: [0, 0, 1], axis: "y" });
  }

  // Butt cap: a dragon claw pointing at the floor, tip exactly on y = 0.
  b.spike([0, 0.14, 0], [0, -1, 0], 0.14, 0.03, { color: BONE_SHADOW });
  b.part(new THREE.CylinderGeometry(0.05, 0.042, 0.04, 8), GOLD, { at: [0, 0.12, 0] });

  // Violet leather wraps on the grip.
  for (const y of [0.92, 0.98, 1.04, 1.1]) {
    b.part(new THREE.CylinderGeometry(0.047, 0.047, 0.02, 10), WRAP, { at: [0, y, 0] });
  }
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.012, 10), GOLD, { at: [0, 0.89, 0] });
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.012, 10), GOLD, { at: [0, 1.13, 0] });

  // Ribbon of violet cloth hanging from the grip.
  const ribbon = [
    [0.03, 1.13, 0.03],
    [0.05, 0.92, 0.07],
    [0.04, 0.72, 0.09],
    [0.07, 0.56, 0.1],
  ];
  b.sweep(ribbon, [0.012, 0.004], { color: ribbonPaint(), caps: { end: "point" }, sides: 6 });

  // --- Socket: dragon jaw fangs gripping the blade root ------------------------------------
  b.spike([-0.03, SHAFT_TOP - 0.02, 0.05], [-0.34, 1, 0.22], 0.2, 0.026, { color: BONE_LIGHT });
  b.spike([0.03, SHAFT_TOP - 0.02, 0.05], [0.34, 1, 0.22], 0.2, 0.026, { color: BONE_LIGHT });
  b.spike([0, SHAFT_TOP - 0.02, -0.05], [0, 1, -0.5], 0.16, 0.024, { color: BONE_DARK });
  // Gold collar at the socket.
  b.part(new THREE.CylinderGeometry(0.052, 0.046, 0.05, 12), GOLD, { at: [0, SHAFT_TOP - 0.02, 0] });

  // --- Blade: a crescent of dragonbone, sweeping up and out to the left --------------------
  // Spine (back edge, lower-right side) then cutting edge back to the root, tip sharp.
  const blade: Array<[number, number] | [number, number, "sharp"]> = [
    [0.0, BLADE_Y - 0.14],
    [0.2, BLADE_Y - 0.1],
    [0.42, BLADE_Y - 0.02],
    [0.6, BLADE_Y + 0.12],
    [0.72, BLADE_Y + 0.3],
    [0.74, BLADE_Y + 0.46],
    [0.8, BLADE_Y + 0.54, "sharp"],
    [0.7, BLADE_Y + 0.4],
    [0.56, BLADE_Y + 0.26],
    [0.4, BLADE_Y + 0.14],
    [0.2, BLADE_Y + 0.08],
    [0.0, BLADE_Y + 0.1],
  ];
  b.extrude(blade, {
    at: [0, 0, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: [0.03, 0.012],
    bevel: 0.006,
    smoothing: 1,
    color: BONE,
  });

  // Ridge ribs along the blade back: bone fins standing on the face.
  const ribs: Array<[number, number, number, number]> = [
    [0.08, BLADE_Y - 0.06, 0.12, BLADE_Y + 0.02],
    [0.26, BLADE_Y - 0.02, 0.4, BLADE_Y + 0.08],
    [0.46, BLADE_Y + 0.06, 0.58, BLADE_Y + 0.22],
  ];
  for (const [x0, y0, x1, y1] of ribs) {
    b.capsule([x0, y0, 0.028], [x1, y1, 0.028], 0.011, { color: BONE_RIBS });
    b.capsule([x0, y0, -0.028], [x1, y1, -0.028], 0.011, { color: BONE_RIBS });
  }

  // Dragon-tooth serration along the cutting edge: small spikes pointing out of the edge.
  const edgeTeeth: Array<[number, number, number, number]> = [
    [0.62, BLADE_Y + 0.3, 0.8, 0.02],
    [0.5, BLADE_Y + 0.2, 0.7, 0.02],
    [0.36, BLADE_Y + 0.12, 0.6, 0.02],
  ];
  for (const [x, y, dx, dy] of edgeTeeth) {
    b.spike([x, y, 0.0], [x + dx * 0.15, y + dy, 0], 0.05, 0.012, { color: BONE_LIGHT });
  }

  // Rune card on the blade face, glowing.
  const rune = runeTexture();
  glow(
    b.part(new THREE.PlaneGeometry(0.2, 0.2), SOUL, {
      at: [0.36, BLADE_Y + 0.12, 0.034],
      dir: [0, 0, 1],
      axis: "z",
      texture: rune,
    }),
    1.6,
  );

  // --- Soul gem: a glowing teal core in the socket at the blade root ------------------------
  glow(b.part(new THREE.IcosahedronGeometry(0.055, 0), SOUL, { at: [0.1, BLADE_Y - 0.01, 0.04] }), 2.2);
  b.part(new THREE.TorusGeometry(0.07, 0.012, 6, 14), GOLD, {
    at: [0.1, BLADE_Y - 0.01, 0.0],
    dir: [0, 0, 1],
    axis: "z",
  });
  // Teal wisp core inside a violet halo.
  glow(b.part(new THREE.SphereGeometry(0.028, 8, 6), SOUL_DEEP, { at: [0.1, BLADE_Y - 0.01, 0.04] }), 2.6);

  // Soul motes: small glowing shards drifting off the blade's spine.
  const r = rng(21);
  const motes: Array<[number, number, number]> = [];
  for (let i = 0; i < 6; i++) {
    const x = 0.14 + i * 0.09;
    const y = BLADE_Y + 0.22 + r() * 0.15 + i * 0.03;
    motes.push([x, y, 0.06 + r() * 0.05]);
  }
  for (const [x, y, z] of motes) {
    glow(b.part(new THREE.OctahedronGeometry(0.014, 0), SOUL, { at: [x, y, z] }), 1.8);
  }

  return b.root;
}
```