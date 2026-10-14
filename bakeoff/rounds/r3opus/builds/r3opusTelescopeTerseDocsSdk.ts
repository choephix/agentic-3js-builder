import * as THREE from "three";
import { createBuilder, paint, grain, cells, svg } from "../../../../src/index";

export const meta = {
  name: "Celestial Brass Refractor",
  description:
    "A stylized antique refractor telescope: navy enamel tube speckled with painted gold stars and pinstripes, brass fittings, a finder scope, an alt-az fork mount and a wooden tripod with an accessory tray of spare eyepieces.",
};

export default function build() {
  const b = createBuilder({ name: "telescope", paintSize: 2048 });

  // palette
  const NAVY = "#1d2a52";
  const GOLD = "#e0b440";
  const BRASS = "#c8962e";
  const BRASS_DK = "#8f6a1f";
  const STEEL = "#b9bec4";
  const BLACK = "#1a1a1e";
  const RUBBER = "#2b2b30";
  const WOOD = "#8a5a2b";
  const WOOD_DK = "#5e3a1a";
  const GLASS = "#6fc0e0";
  const STAR = "#fff3c4";

  // skeleton
  const base = b.joint("base", { at: [0, 0, 0], dir: [0, 1, 0] });
  const mount = b.joint("mount", { parent: base, at: [0, 1.03, 0], dir: [0, 1, 0] });

  // tube axis
  const D = new THREE.Vector3(0, 0.5, 0.866).normalize();
  const U = new THREE.Vector3(0, 0.866, -0.5).normalize();
  const X = new THREE.Vector3(1, 0, 0);
  const PIVOT = new THREE.Vector3(0, 1.25, 0);
  const PIV_H = 0.45;
  const START = PIVOT.clone().addScaledVector(D, -PIV_H);
  const at = (h: number, up = 0, side = 0): number[] => {
    const v = START.clone().addScaledVector(D, h).addScaledVector(U, up).addScaledVector(X, side);
    return [v.x, v.y, v.z];
  };
  const tubeJ = b.joint("tube", {
    parent: mount,
    at: [PIVOT.x, PIVOT.y, PIVOT.z],
    dir: [D.x, D.y, D.z],
    role: "hinge",
  });

  // ---------- main tube (lathe) ----------
  const tubePaint = paint((p, _n, s) => {
    const h = s[0];
    const rel = p.clone().sub(START);
    const along = rel.dot(D);
    const radial = Math.sqrt(Math.max(0, rel.lengthSq() - along * along));
    if (h > 0.875 && radial < 0.069) return "#121216";
    if (h < 0.1 || h > 0.855) return BRASS;
    if (Math.abs(h - 0.135) < 0.005 || Math.abs(h - 0.815) < 0.005) return GOLD;
    if (Math.abs(h - 0.15) < 0.002 || Math.abs(h - 0.8) < 0.002) return GOLD;
    const c = cells(p, 0.03, 7);
    if (c.d1 < 0.0032) return STAR;
    const c2 = cells(p, 0.011, 13);
    if (c2.d1 < 0.0012) return "#8c96c8";
    return NAVY;
  });
  const tube = b.lathe(
    [
      [0, 0],
      [0.035, 0],
      [0.035, 0.06],
      [0.056, 0.08],
      [0.06, 0.1],
      [0.06, 0.85],
      [0.072, 0.86],
      [0.075, 0.88],
      [0.075, 1.12],
      [0.066, 1.12],
      [0.066, 1.06],
      [0, 1.06],
    ],
    { at: at(0), axis: [D.x, D.y, D.z], segments: 20, color: tubePaint, bone: tubeJ, name: "mainTube" },
  );

  // objective lens + glint
  b.part(new THREE.CylinderGeometry(0.065, 0.065, 0.006, 16), GLASS, { at: at(1.064), dir: [D.x, D.y, D.z], bone: tubeJ });
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.002, 8), "#ffffff", {
    at: at(1.068, 0.03, 0.02),
    dir: [D.x, D.y, D.z],
    bone: tubeJ,
  });
  // brass lip around objective
  b.part(new THREE.TorusGeometry(0.073, 0.006, 6, 20), BRASS_DK, { at: at(1.12), dir: [D.x, D.y, D.z], axis: "z", bone: tubeJ });

  // tube rings
  for (const h of [0.33, 0.57])
    b.part(new THREE.TorusGeometry(0.063, 0.008, 6, 20), BRASS, { at: at(h), dir: [D.x, D.y, D.z], axis: "z", bone: tubeJ });

  // name plaque decal
  const plaque = svg(
    `<svg viewBox="0 0 240 80" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="236" height="76" rx="14" fill="#d9a93a" stroke="#7a5512" stroke-width="5"/>
      <rect x="12" y="12" width="216" height="56" rx="8" fill="none" stroke="#7a5512" stroke-width="3"/>
      <text x="120" y="50" font-family="Georgia, serif" font-size="30" font-weight="bold" text-anchor="middle" fill="#3a2608">ASTRA 1887</text>
      <circle cx="26" cy="40" r="5" fill="#7a5512"/><circle cx="214" cy="40" r="5" fill="#7a5512"/>
    </svg>`,
    { size: 256 },
  );
  b.decal(tube, plaque, {
    at: at(0.46, 0.062),
    dir: [U.x, U.y, U.z],
    up: [1, 0, 0],
    size: [0.13, 0.044],
    bone: tubeJ,
  });

  // ---------- focuser & eyepiece ----------
  b.rod(at(0.01), at(-0.08), 0.026, { color: STEEL, bone: tubeJ, sides: 12 });
  b.part(new THREE.TorusGeometry(0.027, 0.004, 4, 14), BRASS, { at: at(-0.075), dir: [D.x, D.y, D.z], axis: "z", bone: tubeJ });
  b.rod(at(-0.08), at(-0.14), 0.019, { color: BLACK, bone: tubeJ, sides: 10 });
  b.rod(at(-0.14), at(-0.17), [0.02, 0.025], { color: RUBBER, bone: tubeJ, sides: 10 });
  b.part(new THREE.TorusGeometry(0.02, 0.003, 4, 12), GOLD, { at: at(-0.11), dir: [D.x, D.y, D.z], axis: "z", bone: tubeJ });
  // focus knobs
  for (const s of [1, -1]) {
    b.rod(at(0.04, -0.01, s * 0.03), at(0.04, -0.01, s * 0.075), 0.008, { color: STEEL, bone: tubeJ, sides: 6 });
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.014, 10), BRASS, {
      at: at(0.04, -0.01, s * 0.08),
      dir: [s, 0, 0],
      bone: tubeJ,
      flat: true,
    });
  }

  // ---------- finder scope ----------
  b.rod(at(0.55, 0.12), at(0.84, 0.12), 0.017, { color: NAVY, bone: tubeJ, sides: 10 });
  b.rod(at(0.82, 0.12), at(0.87, 0.12), 0.022, { color: BRASS, bone: tubeJ, sides: 10 });
  b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.003, 10), GLASS, { at: at(0.871, 0.12), dir: [D.x, D.y, D.z], bone: tubeJ });
  b.rod(at(0.55, 0.12), at(0.5, 0.12), [0.012, 0.009], { color: BLACK, bone: tubeJ, sides: 8 });
  for (const h of [0.62, 0.77]) {
    b.rod(at(h, 0.055), at(h, 0.103), 0.006, { color: BRASS, bone: tubeJ, sides: 6 });
    b.part(new THREE.TorusGeometry(0.019, 0.004, 4, 12), BRASS, { at: at(h, 0.12), dir: [D.x, D.y, D.z], axis: "z", bone: tubeJ });
  }

  // ---------- fork mount ----------
  b.rod([-0.125, PIVOT.y, 0], [0.125, PIVOT.y, 0], 0.012, { color: BRASS_DK, bone: tubeJ, sides: 8 });
  for (const s of [1, -1]) {
    b.frustumBox([s * 0.1, 1.07, 0], [s * 0.1, 1.28, 0], [0.025, 0.06], [0.022, 0.045], { color: BRASS, bone: mount });
    b.part(new THREE.CylinderGeometry(0.032, 0.032, 0.016, 8), BRASS_DK, {
      at: [s * 0.122, PIVOT.y, 0],
      dir: [1, 0, 0],
      bone: mount,
      flat: true,
    });
    b.part(new THREE.SphereGeometry(0.014, 6, 4), GOLD, { at: [s * 0.133, PIVOT.y, 0], bone: mount });
  }
  b.part(new THREE.BoxGeometry(0.25, 0.03, 0.08), BRASS, { at: [0, 1.075, 0], bone: mount });
  b.part(new THREE.CylinderGeometry(0.06, 0.07, 0.05, 12), BRASS_DK, { at: [0, 1.035, 0], bone: mount, flat: true });

  // ---------- tripod ----------
  b.lathe(
    [
      [0, 0],
      [0.13, 0],
      [0.13, 0.04],
      [0.1, 0.06],
      [0, 0.06],
    ],
    { at: [0, 0.95, 0], segments: 6, color: WOOD_DK, bone: base, name: "tripodHead" },
  );

  const trayPts: number[][] = [];
  for (let i = 0; i < 3; i++) {
    const az = (i * 120 * Math.PI) / 180;
    const dx = Math.sin(az);
    const dz = Math.cos(az);
    const T = new THREE.Vector3(dx * 0.09, 0.98, dz * 0.09);
    const F = new THREE.Vector3(dx * 0.54, 0, dz * 0.54);
    const P = (y: number) => T.clone().lerp(F, (0.98 - y) / 0.98);
    const legDir = F.clone().sub(T).normalize();
    const p2a = (v: THREE.Vector3): number[] => [v.x, v.y, v.z];

    b.frustumBox(p2a(P(0.97)), p2a(P(0.11)), [0.05, 0.036], [0.04, 0.03], {
      color: grain(WOOD, WOOD_DK, { size: 0.02, axis: [legDir.x, legDir.y, legDir.z] }),
      bone: base,
      name: `leg${i}`,
    });
    // hinge bolt
    b.rod(p2a(P(0.93).addScaledVector(new THREE.Vector3(dz, 0, -dx), 0.035)), p2a(P(0.93).addScaledVector(new THREE.Vector3(dz, 0, -dx), -0.035)), 0.01, {
      color: BRASS,
      bone: base,
      sides: 6,
    });
    // clamp
    b.rod(p2a(P(0.58)), p2a(P(0.53)), 0.033, { color: BRASS, bone: base, sides: 6 });
    b.part(new THREE.SphereGeometry(0.012, 6, 4), GOLD, {
      at: p2a(P(0.555).add(new THREE.Vector3(dx, 0, dz).multiplyScalar(0.035))),
      bone: base,
    });
    // ferrule and spike
    b.rod(p2a(P(0.14)), p2a(P(0.04)), 0.025, { color: BRASS, bone: base, sides: 8 });
    b.spike(p2a(P(0.04)), p2a(F), null, 0.016, { color: BRASS_DK, bone: base, sides: 6 });

    trayPts.push(p2a(P(0.38).multiply(new THREE.Vector3(0.88, 1, 0.88))));
  }

  // accessory tray
  b.slab(trayPts, { color: grain(WOOD_DK, WOOD, { size: 0.015, axis: "x" }), thickness: 0.018, bone: base });
  for (let i = 0; i < 3; i++) {
    const az = ((60 + i * 120) * Math.PI) / 180;
    const x = Math.sin(az) * 0.07;
    const z = Math.cos(az) * 0.07;
    b.part(new THREE.CylinderGeometry(0.013, 0.013, 0.05, 8), BLACK, { at: [x, 0.414, z], bone: base });
    b.part(new THREE.CylinderGeometry(0.016, 0.016, 0.012, 8), i === 1 ? STEEL : BRASS, { at: [x, 0.444, z], bone: base, flat: true });
    b.part(new THREE.CylinderGeometry(0.009, 0.009, 0.002, 8), GLASS, { at: [x, 0.451, z], bone: base });
  }

  return b.root;
}
