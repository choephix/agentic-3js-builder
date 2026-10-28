import * as THREE from "three";
import { createBuilder, gradient, grain, paint, mix, noise, smoothstep, frame } from "../../../../src/index";
import { metal } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";
import { svg } from "../../../../src/index";

export const meta = {
  name: "Frost-forged Battle Axe",
  description:
    "A towering two-horned battle axe in a League of Legends style: riveted steel, gilded trim, a glowing frost-rune blade and crystalline ice clusters.",
};

const ICE = "#9defff";
const ICE_DEEP = "#3fb6f0";
const ICE_WHITE = "#e8fbff";
const FUR = "#eef6ff";
const LEATHER = "#26324e";
const CORD = "#5b3d2a";

function runeTexture() {
  let g = "";
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    const dx = Math.sin(a);
    const dy = -Math.cos(a);
    const px = (r: number) => (50 + dx * r).toFixed(1);
    const py = (r: number) => (75 + dy * r).toFixed(1);
    g += `<path d="M50 75 L${px(40)} ${py(40)}" stroke="#bff6ff" stroke-width="5" stroke-linecap="round"/>`;
    for (const r of [20, 30]) {
      const bx = 50 + dx * r;
      const by = 75 + dy * r;
      for (const k of [-1, 1]) {
        const b = a + k * 0.9;
        g += `<path d="M${bx.toFixed(1)} ${by.toFixed(1)} L${(bx + Math.sin(b) * 9).toFixed(1)} ${(by - Math.cos(b) * 9).toFixed(1)}" stroke="#7fe6ff" stroke-width="4" stroke-linecap="round"/>`;
      }
    }
  }
  return svg(
    `<svg viewBox="0 0 100 150" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 8 L58 28 L42 28Z" fill="#7fe6ff"/>
      <path d="M50 142 L58 122 L42 122Z" fill="#7fe6ff"/>
      <circle cx="50" cy="75" r="46" fill="none" stroke="#4cc8f5" stroke-width="3.5" stroke-dasharray="4 7"/>
      ${g}
      <path d="M50 62 L62 75 L50 88 L38 75Z" fill="#ffffff" stroke="#4cc8f5" stroke-width="3"/>
    </svg>`,
    { size: 256 },
  );
}

export default function build() {
  const b = createBuilder({ name: "frostAxe" });

  const STEEL = metal("steel", { tarnish: 0.1 });
  const DARK_STEEL = metal("blued", { tarnish: 0.1 });
  const GILT = metal("gilt");
  const WOOD = grain("#3b4a6a", "#243049", { size: 0.012, axis: "y" });
  const BLADE = gradient(DARK_STEEL, paint((p) => mix("#7fb6dc", "#e6f8ff", smoothstep(0.1, 0.9, noise(p, 0.12, 4))) as any), [0, 0, 0.12], [0, 0, 0.42]);

  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const HY = 1.38; // blade centre height

  const crystal = (base: THREE.Vector3, dir: THREE.Vector3, len: number, r: number, color = ICE, str = 0.9) => {
    const d = dir.clone().normalize();
    const top = base.clone().addScaledVector(d, len);
    const s = b.sweep([base.toArray(), top.toArray()], r, {
      section: { ngon: 6 },
      caps: { start: "flat", end: "point" },
      color,
    });
    glow(s, str);
    return s;
  };

  const torus = (y: number, R: number, t: number, color: any, tube = 5) =>
    b.part(new THREE.TorusGeometry(R, t, tube, 12), color, { at: [0, y, 0], dir: [0, 1, 0], axis: "z" });

  // ---- haft
  b.rod([0, 0.12, 0], [0, 1.5, 0], 0.026, { color: WOOD, sides: 8 } as any);
  // grip wrap
  for (let y = 0.34; y <= 0.82; y += 0.04) torus(y, 0.029, 0.008, LEATHER);
  torus(0.3, 0.034, 0.011, GILT);
  torus(0.86, 0.034, 0.011, GILT);
  torus(0.9, 0.03, 0.007, GILT);
  // hanging cord & beads
  b.rod([0.03, 0.9, 0.0], [0.045, 0.78, 0.0], 0.005, { color: CORD });
  for (let i = 0; i < 3; i++)
    b.part(new THREE.SphereGeometry(0.014, 6, 4), i % 2 ? ICE_DEEP : GILT, { at: [0.045, 0.76 - i * 0.03, 0.0] });
  crystal(V(0.045, 0.68, 0), V(0, -1, 0), 0.07, 0.014);

  // ---- pommel
  b.lathe(
    [[0, 0], [0.04, 0.02], [0.05, 0.06], [0.035, 0.1], [0, 0.1]],
    { at: [0, 0.12, 0], color: STEEL, segments: 8 },
  );
  torus(0.15, 0.045, 0.01, GILT);
  b.spike([0, 0.13, 0], [0, -1, 0], 0.13, 0.034, { color: ICE_DEEP, section: { ngon: 6 } } as any);

  // ---- socket collar
  b.lathe(
    [[0, 0], [0.05, 0], [0.06, 0.04], [0.05, 0.08], [0.064, 0.14], [0.064, 0.2], [0.05, 0.26], [0.058, 0.3], [0, 0.3]],
    { at: [0, 1.22, 0], color: STEEL, segments: 8 },
  );
  torus(1.225, 0.058, 0.012, GILT);
  torus(1.52, 0.06, 0.012, GILT);
  torus(1.37, 0.067, 0.01, GILT);
  // langets down the haft
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.014, 0.34, 0.034), DARK_STEEL, { at: [s * 0.03, 1.1, 0] });
    for (let i = 0; i < 3; i++) b.part(new THREE.SphereGeometry(0.007, 5, 4), GILT, { at: [s * 0.039, 0.98 + i * 0.1, 0] });
  }
  // fur ruff under collar
  b.ring(frame([0, 1.215, 0], [0, 1, 0]), { count: 10, radius: 0.058, tilt: -60 }, (it) =>
    b.spike(it, it, 0.1, 0.03, { color: FUR }),
  );
  b.ring(frame([0, 1.215, 0], [0, 1, 0]), { count: 8, radius: 0.05, tilt: -35, fromDeg: 20, toDeg: 380 }, (it) =>
    b.spike(it, it, 0.14, 0.025, { color: "#c9e4f7" }),
  );

  // ---- top spike
  b.spike([0, 1.5, 0], [0, 1, 0], 0.3, 0.032, { color: STEEL, section: { ngon: 4 } } as any);
  crystal(V(0, 1.58, 0), V(0, 1, 0), 0.1, 0.02, ICE_WHITE, 1);

  // ---- main blade
  const outline: any = [
    [0.03, 0.1], [0.1, 0.18], [0.3, 0.3], [0.52, 0.44, "sharp"], [0.4, 0.2], [0.36, 0],
    [0.4, -0.2], [0.52, -0.44, "sharp"], [0.3, -0.3], [0.1, -0.18], [0.03, -0.1], [0.0, 0],
  ];
  b.extrude(outline, { at: [0, HY, 0], x: [0, 0, 1], thickness: 0.034, bevel: 0.006, color: BLADE });
  // frosted edge band
  b.extrude(
    [[0.52, 0.44, "sharp"], [0.4, 0.2], [0.36, 0], [0.4, -0.2], [0.52, -0.44, "sharp"], [0.47, -0.34], [0.32, -0.19], [0.29, 0], [0.32, 0.19], [0.47, 0.34]] as any,
    { at: [0, HY, 0], x: [0, 0, 1], thickness: 0.04, bevel: 0.008, color: ICE_WHITE },
  );
  // blade rim studs & rune decals
  const RUNE = runeTexture();
  for (const s of [1, -1]) {
    glow(
      b.part(new THREE.PlaneGeometry(0.3, 0.45), "#ffffff", {
        at: [s * 0.0215, HY, 0.17],
        dir: [s, 0, 0],
        axis: "z",
        texture: RUNE,
      }),
      1.2,
    );
    for (const [z, y] of [[0.12, 0.2], [0.12, -0.2], [0.26, 0.26], [0.26, -0.26]])
      b.part(new THREE.SphereGeometry(0.011, 5, 4), GILT, { at: [s * 0.018, HY + y * 0.9, z] });
    // root crystal clusters
    crystal(V(s * 0.02, HY + 0.09, 0.07), V(s * 0.5, 0.7, 0.6), 0.12, 0.016);
    crystal(V(s * 0.02, HY - 0.08, 0.07), V(s * 0.6, -0.5, 0.6), 0.1, 0.014, ICE_DEEP);
    crystal(V(s * 0.02, HY, 0.06), V(s * 1, 0.1, 0.4), 0.09, 0.015, ICE_WHITE);
  }
  // horn-tip crystals
  crystal(V(0.0, HY + 0.43, 0.5), V(0, 0.6, 1), 0.07, 0.012);
  crystal(V(0.0, HY - 0.43, 0.5), V(0, -0.6, 1), 0.07, 0.012);

  // ---- back fluke
  b.extrude([[-0.03, 0.1], [-0.16, 0.12], [-0.34, 0.02, "sharp"], [-0.16, -0.06], [-0.03, -0.08]] as any, {
    at: [0, HY, 0],
    x: [0, 0, 1],
    thickness: 0.03,
    bevel: 0.005,
    color: STEEL,
  });
  b.extrude([[-0.1, 0.08], [-0.26, 0.02, "sharp"], [-0.1, -0.03]] as any, {
    at: [0, HY, 0],
    x: [0, 0, 1],
    thickness: 0.04,
    color: ICE_WHITE,
  });
  crystal(V(0, HY + 0.02, -0.3), V(0, 0.2, -1), 0.1, 0.014, ICE_DEEP);

  return b.root;
}
