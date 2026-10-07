import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { type Frame, frame } from "../src/frame";
import { rng } from "../src/math";
import { paint } from "../src/paint";
import { catmull, spiral } from "../src/path";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";
import { cel, zigzag } from "../kits/toon";

export const meta = {
  name: "Ornate Catalyst Staff",
  description:
    "A tall gilded catalyst staff: an ivory shaft wrapped in gold wire and collars, a lotus cup of five splayed claws, and a glowing cyan orb floating above it on two gold halo rings, with violet accent shards, silk ribbons and tassels.",
  style: "Genshin Impact",
  commit: "b816db2",
};

// Palette: cel-shaded paints (kits/toon) for the gold, ivory and silk; flat colours for the self-lit elements.
const GOLD = cel("#f8cb5c", "#c4822f");
const GOLD_DEEP = cel("#e2a03f", "#97572a");
const IVORY = cel("#fff5de", "#e5c39a");
const TEAL = cel("#6fe9dc", "#2b9db3");
const BLUE = cel("#5aa6ff", "#3260cc");
const VIOLET = cel("#a48cfa", "#5c4bbd");
const CREAM = cel("#fff0d6", "#dcb88a");
const GLOW = "#8ffcff";
const GLOW_BODY = "#3a9cf0";
const GLOW_CORE = "#f2ffff";
const GLOW_VIOLET = "#c7b2ff";

// Shaft: a gold diamond net over ivory, the lattice of a turned staff.
const SHAFT = paint((_p, _n, s) => {
  const u = (s[1] / 360) * 14 + s[0] * 50;
  const v = (s[1] / 360) * 14 - s[0] * 50;
  return zigzag(u) < 0.14 || zigzag(v) < 0.14 ? GOLD : IVORY;
});

// Grip wrap: diagonal violet braid on cream leather.
const WRAP = paint((_p, _n, s) => (zigzag((s[1] / 360) * 12 + s[0] * 30) > 0.55 ? VIOLET : CREAM));

// Lotus cup: scalloped teal enamel between gold.
const CUP = paint((_p, _n, s) => (zigzag((s[1] / 360) * 10) < 0.35 ? TEAL : GOLD));

// Claws: teal enamel at the tips, gold with a fine central groove below.
const CLAW = paint((_p, _n, s) => (s[1] > 0.11 ? TEAL : Math.abs(s[0]) < 0.003 ? GOLD_DEEP : GOLD));

// Ribbons: banded gold, teal and blue.
const RIBBON = paint((_p, _n, s) => (zigzag(s[0] * 16) < 0.2 ? GOLD : zigzag(s[0] * 4) > 0.5 ? TEAL : BLUE));

// Petals of the lotus skirt under the cup: teal with a gold rib.
const PETAL = paint((_p, _n, s) => (Math.abs(s[0]) < 0.002 ? GOLD : TEAL));

// The orb's energy shell: meridians and latitude lines drawn in cyan on transparency, so the body shows through.
const ORB_SHELL = (() => {
  const dots: string[] = [];
  for (let x = 0; x <= 256; x += 32)
    for (const y of [32, 64, 96]) dots.push(`<circle cx="${x}" cy="${y}" r="4"/>`);
  return svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 128">
<g fill="none" stroke="#9ffcff" stroke-width="3" stroke-linecap="round">
<path d="M0 0V128M32 0V128M64 0V128M96 0V128M128 0V128M160 0V128M192 0V128M224 0V128M256 0V128"/>
<path d="M0 32H256M0 64H256M0 96H256"/>
<path d="M16 16L48 48M80 80L112 112M144 16L176 48M208 80L240 112" stroke-width="2"/>
</g>
<g fill="#ffffff">${dots.join("")}</g>
</svg>`,
    { size: 512 },
  );
})();

// Rune: a glowing sigil for the shaft, drawn in cyan on transparency.
const RUNE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">
<g fill="none" stroke="#9ffcff" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
<circle cx="30" cy="30" r="20"/>
<path d="M30 14L44 40L16 40Z"/>
</g>
<g stroke="#9ffcff" stroke-width="3" stroke-linecap="round">
<path d="M30 2V7M30 53V58M2 30H7M53 30H58"/>
</g>
<circle cx="30" cy="30" r="4" fill="#ffffff"/>
</svg>`,
  { size: 256 },
);

// Sparkle: a four-point star, solid on transparency.
const SPARK = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
<path d="M50 0L58 42L100 50L58 58L50 100L42 58L0 50L42 42Z" fill="#f2ffff"/>
</svg>`,
  { size: 128 },
);

// Filigree scroll: a gold curl on transparency, decaled onto the cup.
const FILIGREE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60">
<g fill="none" stroke="#fffbe0" stroke-width="7" stroke-linecap="round">
<path d="M50 56C30 56 18 42 30 30C40 20 56 30 46 40C40 46 32 40 40 33"/>
<path d="M50 56C70 56 82 42 70 30C60 20 44 30 54 40C60 46 68 40 60 33"/>
<path d="M14 10C8 22 22 32 26 22"/>
<path d="M86 10C92 22 78 32 74 22"/>
</g>
<circle cx="50" cy="56" r="5" fill="#fffbe0"/>
</svg>`,
  { size: 256 },
);

// Tassel fringe: strands converging at the root (the drawing's bottom edge).
const FRINGE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 100">
<g fill="none" stroke-linecap="round" stroke-width="4">
<path d="M6 98Q5 60 3 10" stroke="#fff5de"/>
<path d="M12 98Q12 56 10 6" stroke="#f8cb5c"/>
<path d="M18 98Q19 52 18 4" stroke="#fff5de"/>
<path d="M24 98Q25 56 27 6" stroke="#f8cb5c"/>
<path d="M30 98Q31 60 34 10" stroke="#fff5de"/>
<path d="M9 98Q7 72 2 40" stroke="#a48cfa"/>
<path d="M27 98Q29 72 37 44" stroke="#a48cfa"/>
</g>
</svg>`,
  { size: 128 },
);

// A claw outline in its own plane: x across the claw, y up its splay.
const CLAW_OUTLINE: OutlinePoint[] = [
  [-0.024, 0],
  [0.024, 0],
  [0.027, 0.06],
  [0.018, 0.12],
  [0.006, 0.16],
  [0, 0.18, "sharp"],
  [-0.006, 0.16],
  [-0.018, 0.12],
  [-0.027, 0.06],
];

// A petal of the lotus skirt, splayed down from the cup foot.
const SKIRT_PETAL: OutlinePoint[] = [
  [-0.011, 0],
  [0.011, 0],
  [0.013, 0.02],
  [0.007, 0.042],
  [0, 0.056, "sharp"],
  [-0.007, 0.042],
  [-0.013, 0.02],
];

// A teardrop bead, for tassel and pendant heads.
const BEAD: OutlinePoint[] = [
  [0, 0],
  [0.011, 0],
  [0.015, 0.012],
  [0.011, 0.03],
  [0.005, 0.042],
  [0, 0.046],
];

// The orb's cap, a small gold dome at each pole.
const CAP: OutlinePoint[] = [
  [0, 0],
  [0.034, 0],
  [0.03, 0.012],
  [0.016, 0.02],
  [0.006, 0.032],
  [0, 0.04],
];

const ORB: [number, number, number] = [0, 1.7, 0];

// Halo: concentric cyan rings with alternating long and short rays, cut away where the drawing is transparent.
const HALO = (() => {
  const rays: string[] = [];
  for (let i = 0; i < 24; i++) {
    const a = (i * Math.PI) / 12;
    const r = i % 2 ? 94 : 98;
    rays.push(`<path d="M${100 + 88 * Math.cos(a)} ${100 + 88 * Math.sin(a)}L${100 + r * Math.cos(a)} ${100 + r * Math.sin(a)}"/>`);
  }
  return svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
<g fill="none" stroke="#9ffcff" stroke-width="3">
<circle cx="100" cy="100" r="58"/>
<circle cx="100" cy="100" r="72" stroke-width="2"/>
<circle cx="100" cy="100" r="84"/>
<g stroke-width="4" stroke-linecap="round">${rays.join("")}</g>
</g>
</svg>`,
    { size: 512 },
  );
})();

export default function build() {
  const b = createBuilder({ name: "catalystStaff", paintSize: 2048 });

  // Skeleton: one root for the staff, and two hinge joints for the halo rings around the floating orb.
  const staff = b.joint("staff", { at: [0, 0, 0] });
  const ringA = b.joint("ringA", { parent: staff, at: ORB, role: "hinge" });
  const ringB = b.joint("ringB", { parent: staff, at: ORB, dir: [0, 0.8, 0.6], role: "hinge" });

  // Butt: a gold ferrule that stands the staff on the floor.
  b.lathe(
    [
      [0, 0],
      [0.034, 0],
      [0.038, 0.012],
      [0.028, 0.02],
      [0.026, 0.05],
      [0.028, 0.09],
      [0, 0.09],
    ],
    { at: [0, 0, 0], color: GOLD_DEEP, smoothing: 1, segments: 14, bone: staff },
  );

  // Shaft: a turned ivory staff with a gold lattice.
  const shaft = b.lathe(
    [
      [0, 0.09],
      [0.025, 0.09],
      [0.024, 0.2],
      [0.026, 0.5],
      [0.025, 0.8],
      [0.0275, 1.0],
      [0.024, 1.16],
      [0.0225, 1.27],
      [0.025, 1.33],
      [0, 1.33],
    ],
    { at: [0, 0, 0], color: SHAFT, smoothing: 1, segments: 12, bone: staff },
  );

  // Glowing rune decals on the shaft, front and back, between the collars.
  const shaftSurface = b.surface(shaft);
  for (const y of [0.76, 0.99]) {
    for (const az of [0, 180]) {
      const hit = shaftSurface.around([0, y, 0]).at(az, 0);
      if (hit) glow(b.decal(shaftSurface, RUNE, { at: hit, size: [0.034, 0.034] }));
    }
  }

  // Gold collars round the shaft.
  for (const y of [0.2, 0.42, 0.66, 0.9, 1.1, 1.26]) {
    const r = 0.037;
    b.lathe(
      [
        [0, y - 0.013],
        [r * 0.8, y - 0.013],
        [r, y - 0.005],
        [r * 1.1, y],
        [r, y + 0.005],
        [r * 0.8, y + 0.013],
        [0, y + 0.013],
      ],
      { at: [0, 0, 0], color: GOLD, smoothing: 1, segments: 14, bone: staff },
    );
  }

  // Teal gem studs on two collars, four to a collar.
  for (const y of [0.42, 0.9]) {
    for (let k = 0; k < 4; k++) {
      const a = (k * Math.PI) / 2;
      const dir: [number, number, number] = [Math.sin(a), 0, Math.cos(a)];
      const at: [number, number, number] = [0.039 * dir[0], y, 0.039 * dir[2]];
      glow(b.part(new THREE.OctahedronGeometry(0.0105, 0).scale(0.9, 1.5, 0.6), GLOW, { bone: staff, at, dir }));
    }
  }

  // Gold wire spiralling up the shaft.
  const wire = spiral([0, 0.2, 0], [0.0312, 0.2, 0], [0, 1, 0], { turns: 22, pitch: 0.046 });
  b.sweep(wire, 0.0038, { color: GOLD, sides: 6, bone: staff });

  // Grip wrap of cream leather braided in violet.
  b.lathe(
    [
      [0, 0.5],
      [0.032, 0.5],
      [0.036, 0.52],
      [0.035, 0.6],
      [0.032, 0.62],
      [0, 0.62],
    ],
    { at: [0, 0, 0], color: WRAP, smoothing: 1, segments: 14, bone: staff },
  );

  // Lotus cup: a gold bowl with teal enamel scallops, its collar at the shaft head.
  const cup = b.lathe(
    [
      [0, 1.33],
      [0.04, 1.33],
      [0.05, 1.35],
      [0.044, 1.37],
      [0.062, 1.42],
      [0.078, 1.47],
      [0.084, 1.5],
      [0.07, 1.49],
      [0.055, 1.45],
      [0.036, 1.42],
      [0, 1.42],
    ],
    { at: [0, 0, 0], color: CUP, smoothing: 1, segments: 16, bone: staff },
  );

  // Gold filigree scrolls drawn onto the cup's wall, four round it.
  const cupSurface = b.surface(cup);
  for (const az of [0, 90, 180, 270]) {
    const hit = cupSurface.around([0, 1.41, 0]).at(az, 0);
    if (hit) b.decal(cupSurface, FILIGREE, { at: hit, size: [0.07, 0.042] });
  }

  // A gold bead rim round the cup's lip.
  b.part(new THREE.TorusGeometry(0.086, 0.0045, 8, 40), GOLD, {
    bone: staff,
    at: [0, 1.5, 0],
    dir: [0, 1, 0],
    axis: "z",
  });

  // Lotus skirt: six teal petals splayed down from the cup foot.
  for (let k = 0; k < 6; k++) {
    const th = (k * 60 * Math.PI) / 180;
    const r: [number, number, number] = [Math.sin(th), 0, Math.cos(th)];
    const t: [number, number, number] = [Math.cos(th), 0, -Math.sin(th)];
    const phi = (40 * Math.PI) / 180;
    const splay: [number, number, number] = [Math.sin(phi) * r[0], -Math.cos(phi), Math.sin(phi) * r[2]];
    b.extrude(SKIRT_PETAL, {
      at: [0.04 * r[0], 1.34, 0.04 * r[2]],
      x: t,
      y: splay,
      thickness: 0.008,
      bevel: 0.002,
      smoothing: 1,
      color: PETAL,
      bone: staff,
    });
  }

  // The catalyst core, a teardrop gem resting in the cup.
  glow(
    b.part(new THREE.OctahedronGeometry(0.026, 0).scale(0.95, 1.35, 0.95), GLOW, { bone: staff, at: [0, 1.455, 0] }),
    1.3,
  );

  // Five glowing gems on the cup rim, between the claws.
  for (let k = 0; k < 5; k++) {
    const a = ((k * 72 + 36) * Math.PI) / 180;
    glow(
      b.part(new THREE.OctahedronGeometry(0.011, 0).scale(0.9, 1.3, 0.9), GLOW, {
        bone: staff,
        at: [0.078 * Math.sin(a), 1.525, 0.078 * Math.cos(a)],
        dir: [0, 1, 0],
      }),
    );
  }

  // Five gold claws splayed up from the cup, cradling the orb without touching it.
  const SPLAY = (32 * Math.PI) / 180;
  for (let k = 0; k < 5; k++) {
    const th = (k * 72 * Math.PI) / 180;
    const r: [number, number, number] = [Math.sin(th), 0, Math.cos(th)];
    const t: [number, number, number] = [Math.cos(th), 0, -Math.sin(th)];
    const splay: [number, number, number] = [Math.sin(SPLAY) * r[0], Math.cos(SPLAY), Math.sin(SPLAY) * r[2]];
    b.extrude(CLAW_OUTLINE, {
      at: [0.06 * r[0], 1.45, 0.06 * r[2]],
      x: t,
      y: splay,
      thickness: 0.012,
      bevel: 0.003,
      smoothing: 1,
      color: CLAW,
      bone: staff,
    });
  }

  // The floating orb: a deep blue body, a pale heart, and the cyan energy shell over both.
  glow(b.part(new THREE.SphereGeometry(0.086, 20, 14), GLOW_BODY, { bone: staff, at: ORB }));
  glow(b.part(new THREE.SphereGeometry(0.044, 14, 10), GLOW_CORE, { bone: staff, at: ORB }), 1.6);
  glow(b.part(new THREE.SphereGeometry(0.125, 24, 16), "#ffffff", { bone: staff, at: ORB, texture: ORB_SHELL }));

  // Gold equator bezel and polar caps.
  b.part(new THREE.TorusGeometry(0.132, 0.0075, 8, 48), GOLD, { bone: staff, at: ORB, dir: [0, 1, 0], axis: "z" });
  b.lathe(CAP, { at: [0, 1.825, 0], color: GOLD, smoothing: 1, segments: 12, bone: staff });
  b.lathe(CAP, { at: [0, 1.575, 0], axis: [0, -1, 0], color: GOLD, smoothing: 1, segments: 12, bone: staff });
  // Elemental halo: cyan rings and rays on a plane behind the orb, drawn on both faces.
  for (const facing of [1, -1]) {
    glow(
      b.part(new THREE.PlaneGeometry(0.48, 0.48), "#ffffff", {
        bone: staff,
        at: [0, ORB[1], -0.2],
        dir: [0, 0, facing],
        axis: "z",
        texture: HALO,
      }),
    );
  }

  // Two halo rings on hinge joints, each with glowing gems.
  b.part(new THREE.TorusGeometry(0.175, 0.0055, 8, 56), GOLD, { bone: ringA, at: ORB, dir: ringA, axis: "z" });
  b.part(new THREE.TorusGeometry(0.175, 0.0055, 8, 56), GOLD, { bone: ringB, at: ORB, dir: ringB, axis: "z" });
  for (const j of [ringA, ringB]) {
    b.ring(j, { count: 8, radius: 0.175 }, (item) => {
      glow(b.stick(new THREE.OctahedronGeometry(0.01, 0).scale(0.8, 1.5, 0.8), GLOW, item, { embed: 0.2 }));
    });
  }

  // Four violet shards drifting round the orb.
  for (const [deg, y] of [
    [20, 1.79],
    [110, 1.62],
    [200, 1.8],
    [290, 1.64],
  ] as const) {
    const a = (deg * Math.PI) / 180;
    const at: [number, number, number] = [0.23 * Math.sin(a), y, 0.23 * Math.cos(a)];
    glow(
      b.part(new THREE.OctahedronGeometry(0.024, 0).scale(0.6, 1.5, 0.6), GLOW_VIOLET, {
        bone: staff,
        at,
        dir: [Math.sin(a), 0.3, Math.cos(a)],
      }),
    );
  }

  // Sparkles: upright four-point stars round the orb, glowing.
  const sparkRng = rng(11);
  const sparkles: Frame[] = [];
  for (let i = 0; i < 9; i++) {
    const a = sparkRng() * Math.PI * 2;
    const rad = 0.25 + sparkRng() * 0.06;
    const y = 1.55 + sparkRng() * 0.35;
    sparkles.push(frame([rad * Math.sin(a), y, rad * Math.cos(a)], [0, 1, 0]));
  }
  glow(b.cards(sparkles, SPARK, { size: 0.05, lean: 0, flow: [0, 0, 1], bone: staff }));

  // Pendant gem hanging from the grip wrap.
  b.lathe(BEAD, { at: [0.03, 0.47, 0.03], color: GOLD, smoothing: 1, segments: 10, bone: staff });
  glow(b.part(new THREE.OctahedronGeometry(0.013, 0).scale(0.8, 1.6, 0.8), GLOW, { bone: staff, at: [0.03, 0.44, 0.03] }));

  // Two gold-banded ribbons falling from the shaft head, and their tassels.
  for (const s of [1, -1]) {
    const ribbonPts = [
      [0.036, 1.3, 0],
      [0.07, 1.12, 0.02],
      [0.085, 0.95, 0.035],
      [0.1, 0.78, 0.02],
      [0.105, 0.62, -0.01],
    ].map(([x, y, z]) => [s * x, y, z]);
    b.sweep(catmull(ribbonPts), (t) => [0.02 - 0.006 * t, 0.0025], {
      section: "box",
      color: RIBBON,
      up: [0, 0, 1],
      caps: "flat",
      bone: staff,
    });
    const end = ribbonPts[ribbonPts.length - 1];
    b.part(new THREE.SphereGeometry(0.011, 8, 6), GOLD, { bone: staff, at: end as [number, number, number] });

    // A violet silk cord hanging from the collar to a tassel.
    const cord = catmull([
      [0.036 * s, 0.91, 0],
      [0.05 * s, 0.8, 0.02],
      [0.055 * s, 0.72, 0.02],
      [0.05 * s, 0.61, 0],
    ]);
    b.sweep(cord, 0.0032, { color: VIOLET, sides: 6, bone: staff });
    b.lathe(BEAD, { at: [0.05 * s, 0.565, 0], color: GOLD, smoothing: 1, segments: 10, bone: staff });
    const fringe: Frame[] = [];
    for (let i = 0; i < 9; i++) {
      const a = (i * 2 * Math.PI) / 9;
      fringe.push(frame([0.05 * s + 0.012 * Math.sin(a), 0.562, 0.012 * Math.cos(a)], [0, 1, 0]));
    }
    b.cards(fringe, FRINGE, {
      size: [0.02, 0.075],
      lean: 180,
      flow: [0, 0, 1],
      vary: 0.2,
      rng: rng(7 + s),
      bone: staff,
    });
  }

  return b.root;
}
