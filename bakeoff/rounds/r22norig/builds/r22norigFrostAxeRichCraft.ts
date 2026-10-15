import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { paint, stripes, grain, gradient } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Frost-Forged Battle Axe",
  description:
    "Double-bitted frostforged battle axe on a carved plinth: indigo steel, icy cel-shaded blades, glowing cyan runes, frost crystals and icicles.",
  style: "League of Legends",
  commit: "88fc1f0",
};

const STEEL = cel("#3b4a8c", "#1e2160");
const DARKSTEEL = cel("#262f66", "#14173f");
const SILVER = cel("#d7e6ff", "#7f93d6");
const ICE = cel("#8fe9ff", "#3d9fe0");
const CLOTH = cel("#46b8ff", "#2467d6");
const CYAN = "#7ff6ff";
const STONE = cel("#6a77a8", "#3a4175");
const ICECOL = "#aef2ff";
const GOLD = cel("#ffd36b", "#d0842a");

function flake(): string {
  let g = "";
  for (let k = 0; k < 3; k++) {
    const a = (k * 60 * Math.PI) / 180;
    const dx = Math.cos(a) * 26;
    const dy = Math.sin(a) * 26;
    g += `<line x1="${32 - dx}" y1="${32 - dy}" x2="${32 + dx}" y2="${32 + dy}"/>`;
    for (const sgn of [1, -1]) {
      for (const f of [0.55, 0.85]) {
        const bx = 32 + sgn * dx * f;
        const by = 32 + sgn * dy * f;
        for (const side of [1, -1]) {
          const ba = a + sgn * Math.PI + side * 0.8;
          const bl = f > 0.7 ? 6 : 9;
          g += `<line x1="${bx}" y1="${by}" x2="${bx + Math.cos(ba) * bl}" y2="${by + Math.sin(ba) * bl}"/>`;
        }
      }
    }
  }
  return g;
}
const RUNE = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
<g stroke="#0b2a6c" stroke-width="8" stroke-linecap="round" fill="none">${flake()}</g>
<g stroke="#46d8ff" stroke-width="4.5" stroke-linecap="round" fill="none">${flake()}</g>
<g stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" fill="none">${flake()}</g>
<circle cx="32" cy="32" r="5" fill="#ffffff" stroke="#0b2a6c" stroke-width="2"/>
</svg>`,
  { size: 256 },
);
const GEMTEX = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
<polygon points="32,3 58,32 32,61 6,32" fill="#46d8ff" stroke="#0b2a6c" stroke-width="5"/>
<polygon points="32,3 58,32 32,32" fill="#c9fbff"/>
<polygon points="32,32 58,32 32,61" fill="#1fa0f0"/>
<polygon points="32,12 42,30 32,30" fill="#ffffff"/>
</svg>`,
  { size: 128 },
);

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "frostAxe" });
  const HY = 1.05; // head centre height

  // ---------- Plinth ----------
  b.lathe(
    [
      [0, 0],
      [0.2, 0],
      [0.2, 0.025],
      [0.17, 0.04],
      [0.17, 0.055],
      [0.13, 0.075],
      [0, 0.075],
    ],
    { at: [0, 0, 0], segments: 8, color: STONE },
  );
  b.lathe(
    [
      [0, 0.07],
      [0.1, 0.07],
      [0.08, 0.1],
      [0, 0.1],
    ],
    { at: [0, 0, 0], segments: 8, color: DARKSTEEL },
  );
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const x = Math.sin(a) * 0.19;
    const z = Math.cos(a) * 0.19;
    glow(b.part(new THREE.OctahedronGeometry(0.012, 0), CYAN, { at: [x, 0.03, z] }), 1.2);
  }
  // plinth frost crystals
  for (let i = 0; i < 5; i++) {
    const a = i * 1.26 + 0.4;
    b.spike([Math.sin(a) * 0.14, 0.06, Math.cos(a) * 0.14], [Math.sin(a) * 0.25, 1, Math.cos(a) * 0.25], 0.07 + (i % 3) * 0.02, 0.014, ICECOL, { sides: 5 });
  }

  // ---------- Haft ----------
  const WOOD = cel(grain("#5b3d5e", "#3c2a4f", { size: 0.01, axis: "y" }));
  const WRAP = cel(stripes("#2a4a9a", "#17285e", { size: 0.022, axis: "y", width: 0.5 }));
  const haftPaint = paint((p) => (p.y < 0.62 && p.y > 0.2 ? WRAP : WOOD));
  b.rod([0, 0.08, 0], [0, 0.94, 0], 0.024, haftPaint, { sides: 8 });
  b.rod([0, 0.94, 0], [0, HY - 0.1, 0], 0.022, WOOD, { sides: 8 });
  // grip rings and collars
  for (const y of [0.2, 0.62]) {
    b.rod([0, y, 0], [0, y + 0.025, 0], 0.031, SILVER, { sides: 8 });
    b.rod([0, y + 0.03, 0], [0, y + 0.038, 0], 0.028, GOLD, { sides: 8 });
  }
  // pommel
  b.part(new THREE.SphereGeometry(0.04, 8, 6), DARKSTEEL, { at: [0, 0.14, 0], scale: [1, 0.85, 1] });
  b.rod([0, 0.1, 0], [0, 0.12, 0], 0.045, SILVER, { sides: 8 });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    b.spike([Math.sin(a) * 0.03, 0.15, Math.cos(a) * 0.03], [Math.sin(a) * 0.9, 0.5, Math.cos(a) * 0.9], 0.04, 0.008, ICECOL, { sides: 4 });
  }
  glow(b.part(new THREE.OctahedronGeometry(0.018, 0), CYAN, { at: [0, 0.14, 0.036] }), 1.3);

  // pennant
  b.extrude(
    [
      [0, 0],
      [0.15, -0.03],
      [0.13, -0.17],
      [0.08, -0.13],
      [0.04, -0.24],
      [0, -0.19],
    ],
    { at: [0.02, HY - 0.15, 0.03], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.006, color: CLOTH, smoothing: 0 },
  );
  b.rod([0, HY - 0.15, 0.028], [0.15, HY - 0.15, 0.028], 0.005, GOLD, { sides: 5 });

  // ---------- Head socket ----------
  const socket = paint((p, n) => {
    const e = Math.abs(p.y - HY);
    if (n.z > 0.5 && e < 0.025) return GOLD;
    return STEEL;
  });
  b.part(new THREE.BoxGeometry(0.13, 0.3, 0.085), socket, { at: [0, HY, 0] });
  for (const dy of [-1, 1]) {
    b.part(new THREE.BoxGeometry(0.15, 0.025, 0.1), SILVER, { at: [0, HY + dy * 0.16, 0] });
    b.part(new THREE.BoxGeometry(0.158, 0.008, 0.106), GOLD, { at: [0, HY + dy * 0.176, 0] });
    for (const s of [1, -1]) {
      for (const z of [1, -1]) {
        b.part(new THREE.SphereGeometry(0.008, 5, 4), GOLD, { at: [s * 0.055, HY + dy * 0.16, z * 0.052] });
      }
    }
  }
  // lower collar cone
  b.rod([0, HY - 0.15, 0], [0, HY - 0.2, 0], [0.05, 0.03], DARKSTEEL, { sides: 8 });
  b.rod([0, HY - 0.2, 0], [0, HY - 0.215, 0], 0.036, SILVER, { sides: 8 });
  // central gem front and back
  for (const z of [1, -1]) {
    glow(
      b.part(new THREE.PlaneGeometry(0.075, 0.075), "#ffffff", {
        at: [0, HY, z * 0.046],
        dir: [0, 0, z],
        axis: "z",
        texture: GEMTEX,
      }),
      1.4,
    );
  }
  // top spike and finial crystal
  b.rod([0, HY + 0.18, 0], [0, HY + 0.2, 0], 0.04, SILVER, { sides: 8 });
  b.spike([0, HY + 0.2, 0], [0, 1, 0], 0.2, 0.032, ICE, { sides: 6 });
  b.spike([0, HY + 0.2, 0], [0, 1, 0], 0.16, 0.01, "#ffffff", { sides: 4 });
  for (const s of [1, -1]) {
    b.spike([s * 0.018, HY + 0.21, 0], [s * 0.7, 1, 0], 0.1, 0.014, ICECOL, { sides: 5 });
    b.spike([0, HY + 0.21, s * 0.018], [0, 1, s * 0.7], 0.08, 0.012, ICECOL, { sides: 5 });
  }

  // ---------- Blades ----------
  const bladePaint = cel(
    paint((p, n, s) => {
      const x = s[0];
      const y = s[1];
      if (Math.abs(n.z) < 0.5) return SILVER; // walls: bright cutting edge
      if (x > 0.325 - Math.abs(y) * 0.12) return SILVER;
      if (x > 0.285 - Math.abs(y) * 0.1) return ICE;
      if (Math.abs(y) < 0.014 && x > 0.1 && x < 0.28) return ICE; // fuller midline
      if (x < 0.12) return DARKSTEEL;
      if (p.y < 0) return STEEL;
      return STEEL;
    }),
  );
  const outline: Array<[number, number] | [number, number, "sharp"]> = [
    [0, 0.1],
    [0.1, 0.12],
    [0.22, 0.18],
    [0.34, 0.27, "sharp"],
    [0.37, 0.1],
    [0.375, -0.04],
    [0.34, -0.22, "sharp"],
    [0.22, -0.14],
    [0.1, -0.1],
    [0, -0.1],
  ];
  const ridgeOutline: Array<[number, number]> = [
    [0.04, 0.07],
    [0.1, 0.085],
    [0.2, 0.125],
    [0.29, 0.17],
    [0.27, 0.06],
    [0.27, -0.03],
    [0.28, -0.12],
    [0.2, -0.09],
    [0.1, -0.066],
    [0.04, -0.066],
  ];
  for (const s of [1, -1]) {
    b.extrude(outline, { at: [s * 0.04, HY, 0], x: [s, 0, 0], y: [0, 1, 0], thickness: 0.026, bevel: 0.007, color: bladePaint });
    // raised inner plate
    b.extrude(ridgeOutline, { at: [s * 0.04, HY, 0], x: [s, 0, 0], y: [0, 1, 0], thickness: 0.036, bevel: 0.006, color: DARKSTEEL });
    // glowing rune front and back
    for (const z of [1, -1]) {
      glow(
        b.part(new THREE.PlaneGeometry(0.17, 0.17), "#ffffff", {
          at: [s * 0.17, HY + 0.01, z * 0.0195],
          dir: [0, 0, z],
          axis: "z",
          texture: RUNE,
        }),
        1.2,
      );
    }
    // rivets along the plate
    for (const [x, y] of [
      [0.1, 0.06],
      [0.1, -0.05],
      [0.24, 0.12],
      [0.24, -0.08],
    ]) {
      for (const z of [1, -1]) {
        b.part(new THREE.SphereGeometry(0.0085, 5, 4), GOLD, { at: [s * x, HY + y, z * 0.019], scale: [1, 1, 0.6] });
      }
    }
    // icicles hanging from lower edge
    for (let i = 0; i < 4; i++) {
      const x = 0.1 + i * 0.08;
      const yb = -0.1 - 0.35 * (x - 0.1) * 0.9;
      b.spike([s * x, HY + yb + 0.006, 0], [s * 0.05, -1, 0], 0.05 + (i % 2) * 0.035 + i * 0.012, 0.012, ICE, { sides: 4 });
    }
    // frost crystal clusters at horn tips
    b.spike([s * 0.33, HY + 0.255, 0], [s * 0.35, 1, 0], 0.12, 0.017, ICECOL, { sides: 5 });
    b.spike([s * 0.3, HY + 0.23, 0], [s * 0.1, 1, 0], 0.08, 0.012, "#ffffff", { sides: 4 });
    b.spike([s * 0.335, HY - 0.205, 0], [s * 0.25, -1, 0], 0.1, 0.017, ICECOL, { sides: 5 });
    // edge bevel rod for bright highlight along the cutting edge
    b.capsule([s * 0.378, HY + 0.1, 0], [s * 0.38, HY - 0.04, 0], 0.005, "#ffffff", { sides: 4 });
    // crystal growths on the plate
    for (const z of [1, -1]) {
      b.spike([s * 0.135, HY - 0.075, z * 0.022], [s * 0.2, -0.3, z * 1], 0.05, 0.01, ICE, { sides: 4 });
    }
  }

  // ---------- Handle ice frost pattern: frost cuffs on haft ----------
  const frost = paint((p) => (p.y > 0.74 ? ICECOL : "#cfe6ff"));
  b.sweep([[0, 0.76, 0], [0, 0.98, 0]], 0.03, gradient("#e8fbff", "#7fd8ff", [0, 0.76, 0], [0, 0.98, 0]), { sides: 6, caps: "flat" });
  void frost;
  for (let i = 0; i < 6; i++) {
    const a = i * 1.05;
    b.spike([Math.sin(a) * 0.03, 0.78 + i * 0.03, Math.cos(a) * 0.03], [Math.sin(a), 0.4, Math.cos(a)], 0.035, 0.007, ICECOL, { sides: 4 });
  }
  void INK;

  return b.root;
}
