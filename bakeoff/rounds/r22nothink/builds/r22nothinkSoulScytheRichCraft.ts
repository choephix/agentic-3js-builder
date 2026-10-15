import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { catmull, polyline, arc } from "../../../../src/path";
import { rng } from "../../../../src/math";
import { paint, noise, mix, smoothstep, mottle, gradient, scales } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { cel, INK, inkLines } from "../../../../kits/toon";
import type { OutlinePoint } from "../../../../src/builder";

export const meta = {
  name: "Dragonbone Soul Scythe",
  description:
    "A towering dragonbone scythe with a vertebra shaft, a rib-blade wreathed in cyan soul fire, a caged soul gem, a dragon-skull pommel and a bone-and-rune plinth. League of Legends style: exaggerated sweeping curves, high-contrast cyan and magenta glow on warm bone and dark iron.",
  style: "League of Legends",
  commit: "88fc1f0",
};

// ---------- palette ----------
const BONE_LIT = "#f2e6c8";
const BONE = cel("#eadcb8", "#b59a86");
const BONE_DARK = cel("#c9b48e", "#8b6f6c");
const BONE_AGED = cel(mottle("#e6d6ae", "#cdb58c", { size: 0.05, contrast: 0.6, seed: 4 }), "#a08272");
const IRON = cel("#2b2a3d", "#15142a");
const IRON_LIGHT = cel("#47476a", "#25244a");
const GOLD = cel("#f2c24a", "#b8742a");
const CYAN = "#3df2ff";
const CYAN_DEEP = "#1296d8";
const MAGENTA = "#ff3ea5";
const VIOLET = cel("#6a3bd0", "#35198f");
const STONE = cel(mottle("#5b5a78", "#46455f", { size: 0.08, contrast: 0.7, seed: 9 }), "#2a2944");
const STONE_TOP = cel(mottle("#6d6c8c", "#55547a", { size: 0.06, contrast: 0.7, seed: 11 }), "#33325a");
const LEATHER = cel("#7a2a3f", "#43142b");

// ---------- textures ----------
const RUNE_GLYPHS = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
<g fill="none" stroke="#3df2ff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
<path d="M32 6 L32 58"/><path d="M32 18 L48 30"/><path d="M32 30 L16 42"/><path d="M16 14 L32 26"/>
</g></svg>`;
const RUNE_A = svg(RUNE_GLYPHS, { size: 128 });
const RUNE_B = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="#ff3ea5" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round">
<circle cx="32" cy="32" r="18"/><path d="M32 8 L32 56"/><path d="M12 32 L52 32"/><path d="M18 18 L46 46"/></g></svg>`,
  { size: 128 },
);
const RUNE_C = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="#3df2ff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round">
<path d="M12 52 L32 10 L52 52 Z"/><path d="M22 36 L42 36"/><path d="M32 10 L32 36"/></g></svg>`,
  { size: 128 },
);
const RUNES = [RUNE_A, RUNE_B, RUNE_C];

// bone-crack / engraved ornament on the blade face (greys tinted by part colour is not needed: coloured)
const BLADE_ENGRAVE = svg(
  `<svg viewBox="0 0 256 64" xmlns="http://www.w3.org/2000/svg">
<g fill="none" stroke="#1296d8" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
<path d="M8 32 C60 12 120 12 248 30"/>
<path d="M30 40 C80 28 140 28 220 38"/>
</g>
<g fill="#3df2ff"><circle cx="40" cy="26" r="4"/><circle cx="96" cy="21" r="4"/><circle cx="152" cy="22" r="4"/><circle cx="208" cy="28" r="4"/></g>
</svg>`,
  { size: 512 },
);

const SOUL_WISP = svg(
  `<svg viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#3df2ff"/><stop offset="1" stop-color="#9a5cff"/></linearGradient></defs>
<path d="M32 124 C6 96 14 64 28 44 C22 66 34 74 36 56 C38 40 30 26 32 4 C48 28 60 60 52 90 C48 106 40 116 32 124 Z" fill="url(#g)"/>
</svg>`,
  { size: 128 },
);

const EMBER = svg(
  `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
<path d="M16 62 C2 44 8 30 16 20 C14 32 22 34 20 22 C28 34 30 48 16 62 Z" fill="#3df2ff"/>
<path d="M16 54 C8 44 12 36 16 30 C16 38 22 40 16 54 Z" fill="#e8ffff"/></svg>`,
  { size: 64 },
);

// ---------- helpers ----------
function ring(r: number, n: number, y = 0): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r));
  }
  return pts;
}

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "soulScythe", detail: 1, paintSize: 2048 });
  const R = rng(77);

  // =========================================================
  // PLINTH  (floor y = 0), a stepped bone-and-stone display base
  // =========================================================
  b.lathe(
    [
      [0, 0],
      [0.34, 0],
      [0.36, 0.03],
      [0.36, 0.07],
      [0.3, 0.1],
      [0.3, 0.14],
      [0.26, 0.17],
      [0, 0.17],
    ],
    { at: [0, 0, 0], segments: 8, spin: 22.5, color: STONE },
  );
  // top slab with rune ring
  b.lathe(
    [
      [0, 0.17],
      [0.24, 0.17],
      [0.24, 0.2],
      [0.2, 0.22],
      [0, 0.22],
    ],
    { at: [0, 0, 0], segments: 8, spin: 22.5, color: STONE_TOP },
  );
  // gold inlay rings
  b.sweep(arc([0, 0.225, 0], [0.2, 0.225, 0], [0, 1, 0], 359), 0.008, { color: GOLD, sides: 6, detail: 0.8 });
  b.sweep(arc([0, 0.075, 0], [0.365, 0.075, 0], [0, 1, 0], 359), 0.007, { color: GOLD, sides: 6, detail: 0.8 });
  // rune glyph decals on the plinth top (flat, lit)
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const r = 0.17;
    glow(
      b.part(new THREE.PlaneGeometry(0.06, 0.06), "#ffffff", {
        at: [Math.sin(a) * r, 0.228, Math.cos(a) * r],
        dir: [0, 1, 0],
        axis: "z",
        up: [Math.sin(a), 0, Math.cos(a)],
        texture: RUNES[i % 3],
      }),
      1,
    );
  }
  // corner studs / small bone knuckles at plinth corners
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const x = Math.sin(a) * 0.35;
    const z = Math.cos(a) * 0.35;
    b.spike([x, 0.07, z], [Math.sin(a) * 0.5, 0.9, Math.cos(a) * 0.5], 0.13, 0.03, {
      color: BONE,
      sides: 6,
      caps: "point",
    });
  }
  // rubble bone shards at the foot
  for (let i = 0; i < 9; i++) {
    const a = R() * Math.PI * 2;
    const rr = 0.42 + R() * 0.12;
    b.spike([Math.sin(a) * rr, 0.0, Math.cos(a) * rr], [R() - 0.5, 0.6, R() - 0.5], 0.05 + R() * 0.06, 0.012 + R() * 0.01, {
      color: BONE_DARK,
      sides: 5,
      caps: "none",
    });
  }

  // =========================================================
  // SHAFT: vertebra-segmented bone pole from y 0.22 to ~1.72
  // =========================================================
  const SHAFT_BOT = 0.22;
  const SHAFT_TOP = 1.74;
  // central core (dark iron rod) with slight S-curve
  const shaftPath = catmull(
    [
      [0, SHAFT_BOT, 0],
      [0.012, 0.7, 0.01],
      [-0.01, 1.2, -0.008],
      [0, SHAFT_TOP, 0],
    ],
    {},
  );
  b.sweep(shaftPath, 0.028, { color: IRON, sides: 8, caps: "flat" });
  // vertebrae: stacked bone knuckles along the shaft
  const nVert = 15;
  for (let i = 0; i < nVert; i++) {
    const t = (i + 0.5) / nVert;
    const p = shaftPath.at(t);
    const y = p.y;
    const swell = 0.047 + 0.012 * Math.sin(t * Math.PI);
    // vertebra body
    b.lathe(
      [
        [0, -0.04],
        [swell * 0.8, -0.04],
        [swell, -0.025],
        [swell * 0.82, 0],
        [swell, 0.025],
        [swell * 0.8, 0.04],
        [0, 0.04],
      ],
      { at: [p.x, y, p.z], segments: 7, spin: i * 17, color: i % 3 === 1 ? BONE_DARK : BONE_AGED },
    );
    // transverse small spurs
    if (i % 2 === 0) {
      for (const s of [1, -1]) {
        b.spike([p.x + s * swell * 0.7, y, p.z], [s, 0.25, 0], 0.07, 0.014, { color: BONE, sides: 5, caps: "point" });
      }
    } else {
      for (const s of [1, -1]) {
        b.spike([p.x, y, p.z + s * swell * 0.7], [0, 0.25, s], 0.06, 0.012, { color: BONE, sides: 5, caps: "point" });
      }
    }
  }
  // gold collars at grip areas
  const collars = [0.3, 0.62, 0.96, 1.3, 1.62];
  for (const cy of collars) {
    b.lathe(
      [
        [0.054, -0.014],
        [0.066, -0.01],
        [0.066, 0.01],
        [0.054, 0.014],
        [0.05, 0.0],
      ],
      { at: [0, cy, 0], segments: 8, color: GOLD },
    );
  }
  // leather grip wrap (two zones) with diagonal strap look using stripes sweep
  for (const [y0, y1] of [
    [0.68, 0.9],
    [1.02, 1.22],
  ] as const) {
    b.rod([0, y0, 0], [0, y1, 0], 0.058, {
      color: paint((p, _n, s) => (Math.floor(((p.y + s[1] / 180) * 34) % 2) === 0 ? LEATHER : IRON),),
      sides: 10,
      caps: "flat",
    });
    for (let k = 0; k < 4; k++) {
      const yy = y0 + ((k + 0.5) / 4) * (y1 - y0);
      b.sweep(arc([0, yy, 0], [0.062, yy, 0], [0, 1, 0], 359), 0.006, { color: GOLD, sides: 5, detail: 0.7 });
    }
  }
  // glowing soul-vein running up the shaft: small cyan gems between vertebrae
  for (let i = 0; i < nVert; i += 2) {
    const t = (i + 1.0) / nVert;
    const p = shaftPath.at(Math.min(0.99, t));
    glow(b.part(new THREE.OctahedronGeometry(0.014, 0), CYAN, { at: [p.x, p.y, p.z + 0.052], scale: [1, 1.6, 1] }), 1.2);
  }

  // =========================================================
  // POMMEL: dragon skull at the bottom of the shaft, with a spike
  // (the shaft stands on plinth; skull wraps the butt)
  // =========================================================
  const SK = [0, 0.3, 0] as const; // skull bottom group centre
  b.lathe(
    [
      [0, 0],
      [0.085, 0],
      [0.1, 0.03],
      [0.09, 0.08],
      [0.06, 0.12],
      [0, 0.14],
    ],
    { at: [SK[0], 0.2, SK[2]], segments: 8, color: BONE_AGED },
  );
  // skull cranium protruding forward (z+)
  const skull = b.part(new THREE.SphereGeometry(1, 10, 8), BONE_AGED, { at: [0, 0.34, 0.07], scale: [0.09, 0.075, 0.11] });
  // snout
  b.frustumBox([0, 0.31, 0.15], [0, 0.29, 0.3], [0.09, 0.075], [0.055, 0.045], { color: BONE, caps: "flat" });
  // lower jaw
  b.frustumBox([0, 0.255, 0.14], [0, 0.245, 0.27], [0.075, 0.025], [0.045, 0.02], { color: BONE_DARK, caps: "flat" });
  // nostril ridge
  for (const s of [1, -1]) {
    b.sphereLike?.call;
    b.part(new THREE.SphereGeometry(0.01, 5, 4), INK, { at: [s * 0.018, 0.31, 0.3] });
    // eye sockets
    b.part(new THREE.SphereGeometry(0.026, 6, 5), IRON, { at: [s * 0.062, 0.355, 0.13], scale: [0.7, 1, 1.1] });
    glow(b.part(new THREE.SphereGeometry(0.013, 6, 5), CYAN, { at: [s * 0.066, 0.355, 0.15] }), 1.6);
    // horns sweeping back and up
    b.sweep(
      catmull(
        [
          [s * 0.07, 0.38, 0.03],
          [s * 0.14, 0.42, -0.04],
          [s * 0.2, 0.5, -0.1],
          [s * 0.22, 0.6, -0.12],
        ],
        {},
      ),
      [0.026, 0.004],
      { color: BONE, sides: 6, caps: "point" },
    );
    // cheek spikes
    b.spike([s * 0.085, 0.31, 0.1], [s * 0.8, -0.2, -0.4], 0.11, 0.02, { color: BONE_DARK, sides: 5, caps: "point" });
    // teeth
    for (let k = 0; k < 4; k++) {
      b.spike([s * 0.045, 0.27, 0.17 + k * 0.03], [0, -1, 0], 0.03, 0.007, { color: BONE_LIT, sides: 4, caps: "point" });
      b.spike([s * 0.04, 0.268, 0.16 + k * 0.03], [0, 1, 0], 0.025, 0.006, { color: BONE_LIT, sides: 4, caps: "point" });
    }
    // brow ridge
    b.rod([s * 0.04, 0.385, 0.12], [s * 0.085, 0.37, 0.12], 0.012, { color: BONE_DARK, sides: 5 });
  }
  void skull;
  // jaw tooth row front
  for (let k = -2; k <= 2; k++) {
    b.spike([k * 0.016, 0.275, 0.29], [0, -1, 0], 0.028, 0.006, { color: BONE_LIT, sides: 4, caps: "point" });
  }
  // spike crown on the bottom? small crest on top of skull
  for (let k = 0; k < 4; k++) {
    b.spike([0, 0.41 - k * 0.002, 0.02 - k * 0.04], [0, 1, -0.5], 0.05 - k * 0.006, 0.014, { color: BONE, sides: 5, caps: "point" });
  }

  // =========================================================
  // SOUL CRADLE: finger-bone claws cage + floating soul gem near head
  // =========================================================
  const GEM_C: [number, number, number] = [0.0, 1.5, 0.0];
  // upper clamp ring (gold) around shaft at the head mount
  const HEAD_Y = 1.74;

  // clamp block at the head
  b.lathe(
    [
      [0, -0.07],
      [0.075, -0.07],
      [0.09, -0.04],
      [0.09, 0.05],
      [0.075, 0.08],
      [0, 0.08],
    ],
    { at: [0, HEAD_Y, 0], segments: 8, spin: 22.5, color: IRON },
  );
  b.lathe(
    [
      [0.09, -0.012],
      [0.105, -0.008],
      [0.105, 0.008],
      [0.09, 0.012],
    ],
    { at: [0, HEAD_Y - 0.04, 0], segments: 8, spin: 22.5, color: GOLD },
  );
  b.lathe(
    [
      [0.09, -0.012],
      [0.105, -0.008],
      [0.105, 0.008],
      [0.09, 0.012],
    ],
    { at: [0, HEAD_Y + 0.04, 0], segments: 8, spin: 22.5, color: GOLD },
  );

  // =========================================================
  // BLADE: long sweeping rib-blade curving toward +X, in the XY plane
  // built from an extruded crescent outline + bone spine + glow edge
  // =========================================================
  // Blade runs from clamp (0, HEAD_Y) arching out and down toward +X.
  // Blade drawing: u along +X, v along +Y.
  const bladeOutline: OutlinePoint[] = [
    [0.0, 0.07],
    [0.18, 0.2],
    [0.42, 0.26],
    [0.66, 0.22],
    [0.88, 0.1],
    [1.02, -0.06],
    [1.1, -0.26, "sharp"], // tip point
    [0.98, -0.16],
    [0.86, -0.03],
    [0.68, 0.06],
    [0.46, 0.1],
    [0.22, 0.09],
    [0.0, 0.0],
  ];
  const BX: [number, number, number] = [1, 0, 0];
  const BY: [number, number, number] = [0, 1, 0];
  // main bone blade
  const blade = b.extrude(bladeOutline, {
    at: [0.04, HEAD_Y + 0.02, 0],
    x: BX,
    y: BY,
    thickness: 0.035,
    bevel: 0.008,
    smoothing: 1,
    color: paint((_p, n, s) => {
      const edge = Math.abs(n.z) < 0.5;
      if (edge) return BONE_DARK;
      // cyan glow veins near the edge, bone elsewhere
      const lower = s[1];
      return BONE_AGED;
    }),
  });
  void blade;
  // glowing cutting edge: a thin extruded sliver along the lower edge
  const edgeOutline: OutlinePoint[] = [
    [0.22, 0.09],
    [0.46, 0.1],
    [0.68, 0.06],
    [0.86, -0.03],
    [0.98, -0.16],
    [1.1, -0.26, "sharp"],
    [1.0, -0.19],
    [0.88, -0.07],
    [0.7, 0.02],
    [0.46, 0.06],
    [0.24, 0.05],
  ];
  glow(
    b.extrude(edgeOutline, {
      at: [0.04, HEAD_Y + 0.02, 0],
      x: BX,
      y: BY,
      thickness: 0.022,
      bevel: 0.004,
      color: CYAN,
    }),
    1.6,
  );
  // soft cyan aura card sheet: a larger flat translucent-looking glow plane behind the edge
  glow(
    b.extrude(
      [
        [0.5, 0.04],
        [0.72, 0.0],
        [0.9, -0.1],
        [1.05, -0.26],
        [1.0, -0.12],
        [0.84, 0.02],
        [0.62, 0.08],
      ],
      { at: [0.04, HEAD_Y + 0.02, 0], x: BX, y: BY, thickness: 0.004, color: CYAN_DEEP },
    ),
    1.0,
  );

  // spine of the blade: thick upper rib curve (bone)
  const spinePath = catmull(
    [
      [0.0, HEAD_Y + 0.03, 0],
      [0.2, HEAD_Y + 0.24, 0],
      [0.5, HEAD_Y + 0.3, 0],
      [0.78, HEAD_Y + 0.22, 0],
      [0.98, HEAD_Y + 0.07, 0],
      [1.1, HEAD_Y - 0.18, 0],
      [1.14, HEAD_Y - 0.26, 0],
    ],
    {},
  );
  b.sweep(spinePath, [0.04, 0.012], { color: BONE, sides: 7, caps: "point" });
  // spine ridges (knuckle ridges along the blade spine)
  b.along(spinePath, 11, (at) => {
    const t = at.t ?? 0;
    void t;
    b.stick(new THREE.ConeGeometry(0.02, 0.07, 5), BONE_DARK, { at: at.at.clone().add(new THREE.Vector3(0, 0.035, 0)), axis: [0, 1, 0] } as any);
  });

  // ribs / fins on the blade top: three upswept bone spurs like dragon dorsal spikes
  const spurs: Array<[number, number, number]> = [
    [0.22, 0.17, 0.12],
    [0.45, 0.2, 0.16],
    [0.7, 0.17, 0.14],
  ];
  for (const [sx, sy, len] of spurs) {
    b.spike([sx, HEAD_Y + 0.28 + (sy - 0.17) * 0.2, 0], [0.35, 1, 0], len, 0.028, { color: BONE, sides: 6, caps: "point" });
  }
  // lower-hanging serrations along the cutting edge (small teeth) in iron
  for (let k = 0; k < 8; k++) {
    const u = 0.26 + k * 0.095;
    const v =
      k < 3 ? 0.09 + 0.006 * k : k < 5 ? 0.09 - 0.045 * (k - 2) : 0.02 - 0.075 * (k - 4);
    b.spike([u + 0.04, HEAD_Y + 0.02 + v - 0.03, 0.0], [0.15, -1, 0], 0.045, 0.013, { color: BONE_LIT, sides: 4, caps: "point" });
  }

  // blade engraved ornament decal (both sides) in cyan: plane facing +Z and -Z
  for (const sgn of [1, -1]) {
    glow(
      b.part(new THREE.PlaneGeometry(0.62, 0.155), "#ffffff", {
        at: [0.46, HEAD_Y + 0.2, sgn * 0.0195],
        dir: [0, 0, sgn],
        axis: "z",
        rotation: [0, 0, 0] as any,
        texture: BLADE_ENGRAVE,
      } as any),
      1.3,
    );
  }

  // Gold fittings: tip cap and root plates
  b.spike([1.14, HEAD_Y - 0.26, 0], [0.25, -1, 0], 0.07, 0.018, { color: GOLD, sides: 6, caps: "point" });
  for (const sgn of [1, -1]) {
    b.extrude(
      [
        [0, -0.07],
        [0.2, -0.02],
        [0.28, 0.07],
        [0.2, 0.2],
        [0.04, 0.12],
        [-0.04, 0.0],
      ],
      { at: [0.0, HEAD_Y, sgn * 0.026], x: BX, y: BY, thickness: 0.012, bevel: 0.003, smoothing: 1, color: GOLD },
    );
  }
  // rivets on the gold plate
  for (const sgn of [1, -1]) {
    for (const [u, v] of [
      [0.08, 0.05],
      [0.16, 0.1],
      [0.2, 0.02],
    ] as const) {
      b.part(new THREE.SphereGeometry(0.008, 5, 4), IRON_LIGHT, { at: [u, HEAD_Y + v, sgn * 0.035] });
    }
  }

  // =========================================================
  // Counter-blade: a short downward-pointing bone talon on the opposite side (-X)
  // for a dramatic asymmetric silhouette
  // =========================================================
  const talon = catmull(
    [
      [0, HEAD_Y + 0.02, 0],
      [-0.12, HEAD_Y + 0.1, 0],
      [-0.26, HEAD_Y + 0.08, 0],
      [-0.36, HEAD_Y - 0.06, 0],
      [-0.38, HEAD_Y - 0.18, 0],
    ],
    {},
  );
  b.sweep(talon, [0.036, 0.006], { color: BONE, sides: 6, caps: "point" });
  b.along(talon, 5, (at) => {
    b.stick(new THREE.SphereGeometry(0.018, 5, 4), BONE_DARK, { at: at.at, axis: [0, 1, 0] } as any);
  });
  // glowing slit on talon
  glow(b.sweep(talon.slice(0.35, 0.9), 0.009, { color: CYAN, sides: 4, caps: "round" }), 1.4);

  // top finial: curved bone horn above clamp
  b.sweep(
    catmull(
      [
        [0, HEAD_Y + 0.07, 0],
        [-0.02, HEAD_Y + 0.2, 0.02],
        [0.0, HEAD_Y + 0.34, 0.05],
        [0.05, HEAD_Y + 0.42, 0.09],
      ],
      {},
    ),
    [0.032, 0.004],
    { color: BONE, sides: 6, caps: "point" },
  );

  // =========================================================
  // FLOATING SOUL GEM caged in finger-bone claws, near the clamp, offset in front (+Z)
  // =========================================================
  const GC: [number, number, number] = [0.0, 1.46, 0.0];
  void GEM_C;
  // lower claw mount ring on the shaft
  b.lathe(
    [
      [0.058, -0.02],
      [0.1, -0.012],
      [0.1, 0.012],
      [0.058, 0.02],
    ],
    { at: [0, GC[1] - 0.17, 0], segments: 8, color: GOLD },
  );
  // gem core
  glow(b.part(new THREE.OctahedronGeometry(0.075, 1), CYAN, { at: GC, scale: [0.85, 1.35, 0.85] }), 1.8);
  glow(b.part(new THREE.OctahedronGeometry(0.04, 0), "#e6ffff", { at: GC, scale: [0.8, 1.35, 0.8] }), 2.2);
  // inner wisp cards crossing the gem
  glow(
    b.cards([{ at: [0, GC[1] - 0.06, 0], axis: [0, 1, 0] } as any], SOUL_WISP, {
      size: [0.1, 0.2],
      cross: true,
      lean: 0,
      flow: [0, 0, 1],
    }),
    1.5,
  );
  // finger-bone cage: 4 curved claws rising from the lower mount, closing above the gem
  const nClaw = 4;
  for (let k = 0; k < nClaw; k++) {
    const a = (k / nClaw) * Math.PI * 2 + Math.PI / 4;
    const cx = Math.sin(a);
    const cz = Math.cos(a);
    const claw = catmull(
      [
        [cx * 0.07, GC[1] - 0.17, cz * 0.07],
        [cx * 0.14, GC[1] - 0.09, cz * 0.14],
        [cx * 0.15, GC[1] + 0.02, cz * 0.15],
        [cx * 0.11, GC[1] + 0.12, cz * 0.11],
        [cx * 0.04, GC[1] + 0.19, cz * 0.04],
      ],
      {},
    );
    b.sweep(claw, [0.02, 0.006], { color: BONE, sides: 6, caps: "point" });
    // knuckle joints
    for (const tt of [0.3, 0.62]) {
      const pp = claw.at(tt);
      b.part(new THREE.SphereGeometry(0.02, 6, 5), BONE_DARK, { at: [pp.x, pp.y, pp.z] });
    }
  }
  // orbiting cyan rings round the gem (tilted)
  for (const [tx, tz, rad, col] of [
    [20, 0, 0.13, CYAN],
    [-35, 60, 0.17, MAGENTA],
  ] as const) {
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler((tx * Math.PI) / 180, 0, (tz * Math.PI) / 180));
    const pts: number[][] = [];
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const v = new THREE.Vector3(Math.cos(a) * rad, 0, Math.sin(a) * rad).applyQuaternion(q);
      pts.push([v.x + GC[0], v.y + GC[1], v.z + GC[2]]);
    }
    glow(b.sweep(catmull(pts, { closed: true }), 0.0055, { color: col, sides: 4 }), 1.6);
    // bead on ring
    const bead = new THREE.Vector3(rad, 0, 0).applyQuaternion(q);
    glow(b.part(new THREE.OctahedronGeometry(0.014, 0), col, { at: [bead.x, GC[1] + bead.y, bead.z] }), 1.8);
  }

  // =========================================================
  // Soul-fire wisps rising off the blade: ember cards
  // =========================================================
  const emberFrames = [];
  for (let i = 0; i < 16; i++) {
    const u = 0.1 + R() * 0.95;
    const v = 0.25 - Math.pow(u, 2.2) * 0.45 + 0.04 + R() * 0.04;
    emberFrames.push({
      at: [0.04 + u, HEAD_Y + v, (R() - 0.5) * 0.06],
      axis: [0.1 * (R() - 0.5), 1, 0],
    } as any);
  }
  glow(b.cards(emberFrames, EMBER, { size: [0.035, 0.08], vary: 0.4, rng: R, cross: true, flow: [0, 0, 1], spin: 12 }), 1.5);

  // hanging soul wisps/tassels from the talon and gold collar (magenta ribbons)
  const ribbonA = catmull(
    [
      [0.0, HEAD_Y - 0.05, 0.06],
      [0.04, HEAD_Y - 0.2, 0.12],
      [-0.03, HEAD_Y - 0.38, 0.16],
      [0.05, HEAD_Y - 0.55, 0.14],
      [0.0, HEAD_Y - 0.7, 0.2],
    ],
    {},
  );
  glow(b.sweep(ribbonA, [0.012, 0.002], { color: MAGENTA, sides: 4, caps: "point" }), 1.1);
  b.along(ribbonA, 4, (at) => {
    b.part(new THREE.SphereGeometry(0.012, 5, 4), GOLD, { at: at.at });
  });
  const ribbonB = catmull(
    [
      [0.0, HEAD_Y - 0.05, -0.06],
      [-0.04, HEAD_Y - 0.18, -0.12],
      [0.03, HEAD_Y - 0.36, -0.15],
      [-0.02, HEAD_Y - 0.5, -0.12],
    ],
    {},
  );
  glow(b.sweep(ribbonB, [0.01, 0.002], { color: CYAN_DEEP, sides: 4, caps: "point" }), 1.1);

  // magenta hang-tassel at skull pommel (charm)
  b.sweep(polyline([[0.09, 0.3, 0.05], [0.14, 0.2, 0.06], [0.15, 0.12, 0.07]]), 0.006, { color: GOLD, sides: 4 });
  glow(b.part(new THREE.OctahedronGeometry(0.03, 0), MAGENTA, { at: [0.15, 0.1, 0.07], scale: [0.8, 1.4, 0.8] }), 1.5);

  // rune ring cards floating around the lower shaft, small glowing glyph plates on iron collars
  for (let i = 0; i < 5; i++) {
    const y = 0.42 + i * 0.26;
    const a = i * 1.9;
    const rx = Math.sin(a) * 0.075;
    const rz = Math.cos(a) * 0.075;
    glow(
      b.part(new THREE.PlaneGeometry(0.05, 0.05), "#ffffff", {
        at: [rx, y, rz],
        dir: [Math.sin(a), 0, Math.cos(a)],
        axis: "z",
        texture: RUNES[i % 3],
      }),
      1.2,
    );
    b.part(new THREE.BoxGeometry(0.065, 0.065, 0.012), IRON, {
      at: [Math.sin(a) * 0.066, y, Math.cos(a) * 0.066],
      dir: [Math.sin(a), 0, Math.cos(a)],
      axis: "z",
    });
  }
  void ring;
  void gradient;
  void scales;
  void mix;
  void smoothstep;
  void noise;
  void inkLines;
  void violet();
  function violet() {
    return VIOLET;
  }

  return b.root;
}
