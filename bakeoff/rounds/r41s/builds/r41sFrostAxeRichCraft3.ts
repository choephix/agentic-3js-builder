import * as THREE from "three";
import { createBuilder, rng, paint, mix, smoothstep, noise, grain, stripes, countershade } from "../../../../src/index";
import { svg } from "../../../../src/index";
import { metal } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Frost-forged Battle Axe",
  description: "A heavy two-sided battle axe of blued steel, gilt trim and glowing frost crystals, in a League of Legends style.",
};

const ICE = "#9defff";
const ICE_DEEP = "#3fb8ff";
const GILT = "#e8bd5a";
const CLOTH = "#2b5fc4";

export default function build() {
  const b = createBuilder({ name: "frost_axe" });
  const rand = rng(11);

  const STEEL = metal("steel", { polish: 0.5 });
  const GILTP = metal("gilt");
  const BLUED = metal("blued");
  const HAFT = grain("#223356", "#4a6a9c", { size: 0.012, axis: "y" });
  const LEATHER = stripes("#1c2438", "#34476e", { size: 0.035, axis: "y", width: 0.5, wobble: 0.15 });

  // blade paint: dark steel in the middle, icy white-blue toward the edge, frost speckle
  const BLADE = paint((p, n, s) => {
    const e = smoothstep(0.2, 0.44, s[0]);
    const base = mix(mix("#566a8c", "#8fa6c8", noise(p, 0.05, 3)), "#e6fbff", e);
    const frost = smoothstep(0.62, 0.8, noise(p, 0.03, 8));
    const lit = mix(base, "#ffffff", frost * 0.4 * e);
    return mix(lit, "#2a3a60", 0.25 * smoothstep(0.2, -0.8, n.y));
  });
  const BACK = paint((p, _n, s) => mix(mix("#46597e", "#7e96ba", noise(p, 0.04, 5)), "#d6f4ff", smoothstep(0.15, 0.34, -s[0])));

  const crystal = (base: number[], dir: number[], len: number, r: number, color = ICE, str = 1.4) => {
    const d = new THREE.Vector3(...dir).normalize();
    const bv = new THREE.Vector3(...base);
    const mid = bv.clone().addScaledVector(d, len * 0.45);
    const tip = bv.clone().addScaledVector(d, len * 0.45);
    glow(b.rod(bv, mid, r, color, { section: { ngon: 6 }, caps: "none" }), str);
    glow(b.spike(tip, d.toArray(), len * 0.55, r, { color, section: { ngon: 6 } }), str);
  };
  const ring = (y: number, r: number, c: any = GILTP, t = 0.007) =>
    b.part(new THREE.TorusGeometry(r, t, 5, 12), c, { at: [0, y, 0], dir: [0, 1, 0], axis: "z" });

  // haft
  b.rod([0, 0.2, 0], [0, 1.62, 0], 0.022, HAFT, { sides: 8 });
  b.rod([0, 0.34, 0], [0, 0.88, 0], 0.029, LEATHER, { sides: 8 });
  for (const y of [0.34, 0.88, 1.0, 1.12]) ring(y, y < 1 ? 0.03 : 0.025);
  // langets (steel strips under the head)
  for (const s of [1, -1]) {
    b.rod([s * 0.026, 1.02, 0], [s * 0.026, 1.34, 0], 0.007, STEEL, { sides: 4 });
  }
  // pommel
  b.lathe(
    [[0, 0], [0.012, 0.02], [0.035, 0.12], [0.046, 0.2], [0.04, 0.27], [0.026, 0.3], [0, 0.3]],
    { at: [0, 0, 0], color: BLUED, segments: 8 },
  );
  ring(0.2, 0.048, GILTP, 0.008);
  crystal([0, 0.3, 0.0], [0, 1, 0], 0.07, 0.014, ICE, 1.2);

  // collar / socket
  b.lathe(
    [[0, 1.28], [0.05, 1.28], [0.062, 1.34], [0.044, 1.39], [0.05, 1.53], [0.066, 1.58], [0.05, 1.63], [0, 1.63]],
    { at: [0, 0, 0], color: STEEL, segments: 8 },
  );
  ring(1.285, 0.052, GILTP, 0.009);
  ring(1.585, 0.064, GILTP, 0.009);
  for (const s of [1, -1])
    for (const y of [1.35, 1.47, 1.55])
      b.part(new THREE.SphereGeometry(0.01, 5, 4), GILT, { at: [0, y, s * 0.052] });

  // main blade
  const bladeOutline: any = [
    [0.03, 0.16], [0.18, 0.25], [0.34, 0.33], [0.47, 0.36, "sharp"], [0.41, 0.2], [0.37, 0.05],
    [0.39, -0.12], [0.47, -0.31, "sharp"], [0.3, -0.28], [0.14, -0.2], [0.03, -0.14],
  ];
  const blade = b.extrude(bladeOutline, {
    at: [0, 1.46, 0], x: [1, 0, 0], thickness: 0.032, bevel: 0.009, smoothing: 1, color: BLADE,
  });
  // gilt edge frame at root
  b.extrude([[0.03, 0.2], [0.12, 0.26], [0.12, -0.22], [0.03, -0.18]] as any, {
    at: [0, 1.46, 0], x: [1, 0, 0], thickness: 0.042, bevel: 0.006, color: GILTP,
  });
  // back fluke
  b.extrude(
    [[-0.03, 0.12], [-0.15, 0.17], [-0.34, 0.05, "sharp"], [-0.17, -0.05], [-0.03, -0.09]] as any,
    { at: [0, 1.46, 0], x: [1, 0, 0], thickness: 0.028, bevel: 0.007, color: BACK },
  );
  // top and bottom horn ice shards
  crystal([0.0, 1.62, 0], [0, 1, 0], 0.3, 0.032, ICE, 1.5);
  crystal([0.0, 1.6, 0], [0.55, 1, 0], 0.17, 0.02, ICE_DEEP, 1.3);
  crystal([0.0, 1.6, 0], [-0.55, 1, 0], 0.17, 0.02, ICE_DEEP, 1.3);
  crystal([-0.3, 1.5, 0.0], [-1, 0.5, 0], 0.13, 0.015, ICE, 1.3);

  // frost shards along the blade face (both sides)
  const spots: [number, number][] = [[0.14, 0.17], [0.15, -0.12], [0.28, 0.2], [0.27, -0.17]];
  for (const s of [1, -1])
    for (const [x, y] of spots) {
      const l = 0.07 + rand() * 0.05;
      crystal([x, 1.46 + y, s * 0.012], [s * 0.3, y * 1.5, s * 1], l, 0.011, rand() > 0.5 ? ICE : ICE_DEEP, 1.2);
    }

  // snowflake rune on both faces
  let arms = "";
  for (let i = 0; i < 6; i++) {
    const a = (i * 60 * Math.PI) / 180;
    arms += `<g transform="rotate(${i * 60} 50 50)"><path d="M50 50 L50 8 M50 26 L38 16 M50 26 L62 16 M50 38 L42 32 M50 38 L58 32" stroke="#bff6ff" stroke-width="4.5" stroke-linecap="round" fill="none"/></g>`;
    void a;
  }
  const FLAKE = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#1d4f9a"/><circle cx="50" cy="50" r="48" fill="none" stroke="#bff6ff" stroke-width="4"/>${arms}<circle cx="50" cy="50" r="6" fill="#ffffff"/></svg>`,
    { size: 256 },
  );
  for (const s of [1, -1])
    glow(
      b.part(new THREE.CircleGeometry(0.075, 12), "#ffffff", {
        at: [0.23, 1.46, s * 0.0185], dir: [0, 0, s], axis: "z", texture: FLAKE,
      }),
      1.1,
    );
  // gilt ring around the rune
  for (const s of [1, -1])
    b.part(new THREE.TorusGeometry(0.078, 0.005, 4, 14), GILTP, { at: [0.23, 1.46, s * 0.019], dir: [0, 0, s], axis: "z" });

  // cloth pennant hanging below the head
  const CLOTHP = stripes(CLOTH, "#d8f4ff", { size: 0.04, axis: "y", width: 0.12, wobble: 0.1 });
  b.extrude(
    [[-0.035, 0], [0.035, 0], [0.032, -0.2], [0, -0.26, "sharp"], [-0.032, -0.2]] as any,
    { at: [0, 1.27, 0.036], x: [1, 0, 0], thickness: 0.006, color: CLOTHP },
  );
  b.extrude(
    [[-0.035, 0], [0.035, 0], [0.032, -0.2], [0, -0.26, "sharp"], [-0.032, -0.2]] as any,
    { at: [0, 1.27, -0.036], x: [1, 0, 0], thickness: 0.006, color: CLOTHP },
  );
  // strap tassels
  for (const s of [1, -1]) b.rod([s * 0.03, 1.27, 0.03], [s * 0.03, 1.12, 0.04], 0.005, GILT);
  b.part(new THREE.SphereGeometry(0.014, 6, 4), GILT, { at: [0, 1.015, 0.0] , scale: [1.2, 1.2, 1.2] });

  return b.root;
}
