import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng } from "../../../../src/index";

export const meta = {
  "name": "Madreperla — Italian Mother-of-Pearl Piano Accordion",
  "description": "A fully extended Italian piano accordion standing upright facing the viewer, its treble case with piano keyboard and fretwork grille toward +Z, a fan of crimson-and-pearl bellows in the middle, the bass case with button field behind, all dressed in iridescent mother-of-pearl shell, abalone inlay and gold pinstripe."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  pearl: "#eef4ee",
  pearlDeep: "#d8e6e4",
  abalone: "#79d2c4",
  abaloneRose: "#e5b4c6",
  abaloneDeep: "#3f9c94",
  gold: "#c9a227",
  goldBright: "#e8c95c",
  walnut: "#5a3a24",
  felt: "#2b2434",
  ivory: "#f8f4e6",
  ebony: "#1c1a17",
  bellowsRed: "#8e2432",
  bellowsDark: "#4a0f1c",
  chrome: "#c9cdd3",
  leather: "#7a4a2b",
  leatherDark: "#4c2c1a",
  ink: "#2a2622",
};
const M = {
  bellowsFront: [0, 0.2, 0.3] as [number, number, number],
  bellowsBack: [0, 0.2, -0.3] as [number, number, number],
  strapAnchorTreble: [0.17, 0.4, 0.42] as [number, number, number],
  strapAnchorBass: [-0.17, 0.4, -0.42] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // trebleCase
  (() => {
function buildTrebleCase({ b, J, P, M }: any) {
  const X0 = -0.21, X1 = 0.21, Z0 = 0.3, Z1 = 0.56, H = 0.4;
  const FZ = Z1;
  const box = (w: number, h: number, d: number, color: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z] });

  // main shell
  box(0.42, 0.4, 0.26, P.pearl, 0, 0.2, 0.43);
  // pearlDeep lower third (slightly proud on the sides, front and back)
  box(0.424, 0.13, 0.264, P.pearlDeep, 0, 0.065, 0.43);
  // walnut base rail
  box(0.428, 0.014, 0.268, P.walnut, 0, 0.007, 0.43);

  // gold pinstripes on vertical edges and top
  for (const sx of [1, -1])
    for (const [z, sz] of [[Z1 - 0.012, 1], [Z0 + 0.012, -1]] as [number, number][]) {
      box(0.006, 0.38, 0.006, P.gold, sx * 0.2125, 0.2, z);
    }
  box(0.426, 0.006, 0.006, P.gold, 0, 0.396, Z1 + 0.001);
  box(0.006, 0.006, 0.262, P.gold, 0.212, 0.396, 0.43);
  box(0.006, 0.006, 0.262, P.gold, -0.212, 0.396, 0.43);
  box(0.426, 0.006, 0.006, P.gold, 0, 0.396, Z0 + 0.001);

  // keyboard recess
  const kbY0 = 0.045, kbH = 0.125, kbW = 0.38;
  box(kbW + 0.02, kbH + 0.02, 0.004, P.felt, 0, kbY0 + kbH / 2, FZ + 0.001);
  // keybed plank
  box(kbW, 0.016, 0.03, P.walnut, 0, kbY0 + 0.008, FZ + 0.012);
  // 18 white keys
  const kw = 0.0205, kx0 = -(18 * kw) / 2;
  for (let i = 0; i < 18; i++) {
    const x = kx0 + kw * (i + 0.5);
    box(kw - 0.0016, 0.012, 0.115, P.ivory, x, kbY0 + 0.024, FZ - 0.045 + 0.058 - 0.0 + 0.0 - 0.0 - 0.0 + 0.0 - 0.0 + 0.0 + 0.0 - 0.0);
    box(0.0012, 0.0125, 0.116, P.ink, x + kw / 2, kbY0 + 0.0245, FZ - 0.045 + 0.058);
  }
  // sharps: pattern after keys 0..17 (C D E F G A B pattern), sharp after index in group
  const sharpAfter = [0, 1, 3, 4, 5, 7, 8, 10, 11, 12, 14, 15];
  for (const i of sharpAfter) {
    const x = kx0 + kw * (i + 1);
    box(0.011, 0.012, 0.07, P.ebony, x, kbY0 + 0.035, FZ - 0.045 + 0.058 + 0.0 + 0.02);
  }
  // key front lip
  box(kbW, 0.014, 0.004, P.walnut, 0, kbY0 + 0.007, FZ + 0.0);

  // key cheeks
  for (const s of [1, -1]) {
    const cx = s * 0.2;
    box(0.02, 0.14, 0.05, P.pearl, cx, kbY0 + 0.07, FZ - 0.025 + 0.0);
    box(0.021, 0.006, 0.052, P.goldBright, cx, kbY0 + 0.143, FZ - 0.025);
    for (let k = 0; k < 4; k++) {
      const d = b.part(new THREE.OctahedronGeometry(0.0085, 0), k % 2 ? P.abaloneRose : P.abalone, {
        at: [cx, kbY0 + 0.025 + k * 0.03, FZ + 0.003],
        scale: [0.8, 1.3, 0.35],
      });
    }
  }

  // grille board
  const gy = 0.315, gw = 0.4, gh = 0.17;
  const gz = FZ + 0.002;
  box(gw, gh, 0.006, P.goldBright, 0, gy, gz);
  box(gw - 0.016, gh - 0.016, 0.008, P.abalone, 0, gy, gz);
  box(gw - 0.026, gh - 0.026, 0.01, P.felt, 0, gy, gz);

  // gold fans: 4 fans, each with radiating slats
  const fanXs = [-0.15, -0.05, 0.05, 0.15];
  for (const fx of fanXs) {
    const baseY = gy - 0.07;
    for (let k = 0; k < 5; k++) {
      const a = ((k - 2) * 28 * Math.PI) / 180;
      const len = 0.115;
      const sl = b.part(new THREE.BoxGeometry(0.006, len, 0.004), P.gold, {
        at: [fx - Math.sin(a) * len / 2, baseY + Math.cos(a) * len / 2, gz + 0.007],
        rotation: [0, 0, (a * 180) / Math.PI],
      });
    }
    // arc cap
    box(0.07, 0.004, 0.004, P.goldBright, fx, baseY + 0.108, gz + 0.007);
    b.part(new THREE.OctahedronGeometry(0.01, 0), P.abalone, {
      at: [fx, baseY, gz + 0.009], scale: [1, 1, 0.4],
    });
  }

  // central medallion
  const mc: [number, number, number] = [0, gy + 0.005, gz + 0.012];
  const rings: [number, number, string][] = [
    [0.036, 0.003, P.gold], [0.03, 0.004, P.abaloneDeep], [0.022, 0.005, P.abaloneRose], [0.013, 0.006, P.abalone], [0.005, 0.007, P.goldBright],
  ];
  for (const [r, t, c] of rings)
    b.part(new THREE.CylinderGeometry(r, r, t, 16), c, { at: [mc[0], mc[1], mc[2] + t / 2 - 0.002 + r * 0.0], dir: [0, 0, 1] });

  // nameplate bar
  box(0.2, 0.016, 0.005, P.gold, 0, 0.2, FZ + 0.002);
  box(0.202, 0.003, 0.006, P.goldBright, 0, 0.2085, FZ + 0.002);
  box(0.202, 0.003, 0.006, P.goldBright, 0, 0.1915, FZ + 0.002);
  // lyre emblem
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.003, 0.012, 0.003), P.ink, {
      at: [s * 0.005, 0.2, FZ + 0.006], rotation: [0, 0, -s * 14],
    });
    b.part(new THREE.TorusGeometry(0.004, 0.0013, 4, 8), P.ink, {
      at: [s * 0.008, 0.204, FZ + 0.006],
    });
  }
  box(0.002, 0.012, 0.003, P.ink, 0, 0.2, FZ + 0.006);
  box(0.016, 0.002, 0.003, P.ink, 0, 0.194, FZ + 0.006);
  // side accent rails on pearl
  for (const s of [1, -1]) box(0.003, 0.3, 0.003, P.gold, s * 0.2115, 0.22, Z1 - 0.03);
}
    return buildTrebleCase;
  })(),
  // bellows
  (() => {
function buildBellows({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const X0 = 0.19, Y0 = 0.03, Y1 = 0.37;
  const W = 0.38, H = 0.34, CY = (Y0 + Y1) / 2;
  const Z0 = -0.30, Z1 = 0.30;
  const N = 15;
  const step = (Z1 - Z0) / (N - 1);
  const T = 0.012; // flange thickness
  const box = (w: number, h: number, d: number, color: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z] });

  // Frame builder: four bars around the rectangle, outer face z-front trimmed with gold
  const flange = (z: number, i: number) => {
    const bar = 0.03; // frame bar width
    const edge = P.pearlDeep;
    const hw = W / 2, hh = H / 2;
    // top/bottom bars
    for (const s of [1, -1]) {
      box(W, bar, T, P.pearl, 0, CY + s * (hh - bar / 2), z);
      box(W, 0.006, T + 0.002, edge, 0, CY + s * (hh - 0.003), z);
      // gold tape on the inner edge of bar
      box(W - 0.02, 0.003, T + 0.003, P.gold, 0, CY + s * (hh - bar - 0.0015), z);
      // side bars
      box(bar, H - 2 * bar, T, P.pearl, s * (hw - bar / 2), CY, z);
      box(0.006, H - 2 * bar, T + 0.002, edge, s * (hw - 0.003), CY, z);
      box(0.003, H - 2 * bar, T + 0.003, P.gold, s * (hw - bar - 0.0015), CY, z);
    }
  };

  for (let i = 0; i < N; i++) {
    const z = Z0 + i * step;
    flange(z, i);
  }

  // Flute panels between consecutive flanges: recess direction alternates
  const inW = W - 0.06, inH = H - 0.06;
  for (let i = 0; i < N - 1; i++) {
    const zc = Z0 + (i + 0.5) * step;
    const gap = step - T;
    const dir = i % 2 === 0 ? 1 : -1;
    // two angled plates forming a V (zigzag) per gap: visible pleat on sides
    const depth = 0.026 * 0.5;
    const ang = Math.atan2(depth, gap / 2);
    const len = Math.hypot(depth, gap / 2);
    for (const half of [-1, 1]) {
      // side walls (left/right) as tilted plates
      for (const s of [1, -1]) {
        const m = b.part(new THREE.BoxGeometry(0.004, inH, len), P.bellowsRed, {
          at: [s * (W / 2 - 0.035 - (dir > 0 ? 0 : 0.0) - depth * 0.5 * 0), CY, zc + half * gap / 4],
        });
        m.mesh.rotation.x = half * dir * ang;
      }
    }
    // top & bottom flutes
    for (const half of [-1, 1]) {
      const top = b.part(new THREE.BoxGeometry(inW, 0.004, len), P.bellowsRed, {
        at: [0, CY + inH / 2 - 0.002, zc + half * gap / 4],
      });
      top.mesh.rotation.x = half * dir * ang;
      const bot = b.part(new THREE.BoxGeometry(inW, 0.004, len), P.bellowsDark, {
        at: [0, CY - inH / 2 + 0.002, zc + half * gap / 4],
      });
      bot.mesh.rotation.x = half * dir * ang;
    }
    // inner dark core (valley shadow) behind
    box(inW, inH, gap * 0.9, P.bellowsDark, 0, CY, zc);
    // visible recessed red panel faces on the sides inset slightly
    for (const s of [1, -1]) {
      const p = b.part(new THREE.BoxGeometry(0.003, inH * 0.92, gap * 0.8), R() > 0.5 ? P.bellowsRed : P.bellowsRed, {
        at: [s * (W / 2 - 0.0015), CY, zc],
      });
      // dark pleat crease line on each side
      box(0.004, inH * 0.92, 0.003, P.bellowsDark, s * (W / 2 - 0.001), CY, zc + dir * gap * 0.3);
      void p;
    }
    // top/bottom outer red strips with dark base band
    box(inW, 0.003, gap * 0.8, P.bellowsRed, 0, Y1 - 0.0015, zc);
    box(inW, 0.003, gap * 0.8, P.bellowsRed, 0, Y0 + 0.0015, zc);
    box(inW, 0.006, gap * 0.8, P.bellowsDark, 0, Y0 + 0.01, zc);
    // side dark bottom band
    for (const s of [1, -1]) box(0.004, 0.02, gap * 0.8, P.bellowsDark, s * (W / 2 - 0.001), Y0 + 0.02, zc);
  }

  // Leather gussets at both ends: corner triangles
  const tri = new THREE.Shape();
  tri.moveTo(0, 0); tri.lineTo(0.05, 0); tri.lineTo(0, 0.05); tri.closePath();
  for (const zEnd of [Z1, Z0]) {
    const dz = zEnd > 0 ? 1 : -1;
    for (const sx of [1, -1]) for (const sy of [1, -1]) {
      const g = new THREE.ExtrudeGeometry(tri, { depth: 0.01, bevelEnabled: false });
      g.translate(0, 0, -0.005);
      const p = b.part(g, P.leather, {
        at: [sx * (X0 - 0.003), sy > 0 ? Y1 - 0.003 : Y0 + 0.003, zEnd - dz * 0.012],
      });
      p.mesh.scale.set(-sx, -sy, 1);
      // small gold stud
      b.part(new THREE.SphereGeometry(0.004, 6, 4), P.goldBright, {
        at: [sx * (X0 - 0.015), sy > 0 ? Y1 - 0.015 : Y0 + 0.015, zEnd - dz * 0.019],
      });
    }
  }
}
    return buildBellows;
  })(),
  // bassCase
  (() => {
function buildBassCase({ b, J, P, M }: Ctx) {
  const X0 = -0.21, X1 = 0.21, Z0 = -0.56, Z1 = -0.3, H = 0.4;
  const W = X1 - X0, D = Z1 - Z0;
  const cx = 0, cz = (Z0 + Z1) / 2;

  // Helper: box part by min/max corners
  const box = (x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, color: string) =>
    b.part(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), color, {
      at: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2],
    });
  const cyl = (r: number, h: number, seg: number, color: string, at: number[], dir: number[]) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { at: at as [number, number, number], dir: dir as [number, number, number] });

  // Main body: pearl upper, pearlDeep lower third
  const lowH = H / 3;
  box(X0, 0.012, Z0, X1, lowH, Z1, P.pearlDeep);
  box(X0, lowH, Z0, X1, H, Z1, P.pearl);
  // Walnut base rail
  box(X0 - 0.002, 0, Z0 - 0.002, X1 + 0.002, 0.012, Z1, P.walnut);
  // Walnut thin rail band on lower line
  box(X0 - 0.001, lowH - 0.003, Z0 - 0.001, X1 + 0.001, lowH + 0.003, Z1, P.gold);

  // Gold pinstripes on vertical edges (inset slightly) and top rim
  const ps = 0.004;
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      const ex = sx * (W / 2 - 0.016);
      const ez = cz + sz * (D / 2 - 0.016);
      // Stripes on the two faces adjoining the corner
      box(ex - 0.002, 0.014, cz + sz * (D / 2) - (sz > 0 ? 0.001 : -0.001) - 0.001, ex + 0.002, H - 0.01, cz + sz * (D / 2) + (sz > 0 ? 0.001 : -0.001) + 0.001, P.gold);
      box(sx * (W / 2) - 0.001, 0.014, ez - 0.002, sx * (W / 2) + 0.001, H - 0.01, ez + 0.002, P.gold);
    }
  // Top rim gold trim
  const t = 0.006;
  box(X0, H - 0.001, Z0, X1, H + 0.002, Z0 + t, P.goldBright);
  box(X0, H - 0.001, Z1 - t, X1, H + 0.002, Z1, P.goldBright);
  box(X0, H - 0.001, Z0, X0 + t, H + 0.002, Z1, P.goldBright);
  box(X1 - t, H - 0.001, Z0, X1, H + 0.002, Z1, P.goldBright);

  // Top abalone diamond chain along the ridge (z direction), centered x=0
  const dg = new THREE.OctahedronGeometry(0.0085, 0);
  const nD = 11;
  for (let i = 0; i < nD; i++) {
    const z = Z0 + 0.028 + (i * (D - 0.056)) / (nD - 1);
    const col = i % 2 ? P.abaloneRose : P.abalone;
    b.part(dg, col, { at: [0, H + 0.001, z], scale: [1, 0.25, 1.25] });
  }
  // Gold rails flanking diamond chain
  box(-0.0125, H, Z0 + 0.012, -0.0105, H + 0.003, Z1 - 0.012, P.goldBright);
  box(0.0105, H, Z0 + 0.012, 0.0125, H + 0.003, Z1 - 0.012, P.goldBright);

  // BACK FACE: recessed panel
  const pw = 0.3, ph = 0.24, py = 0.2;
  const fz = Z0; // back face plane
  // frame in goldBright
  const fw = 0.008;
  box(-pw / 2 - fw, py - ph / 2 - fw, fz - 0.004, pw / 2 + fw, py + ph / 2 + fw, fz + 0.001, P.goldBright);
  // walnut panel
  box(-pw / 2, py - ph / 2, fz - 0.0055, pw / 2, py + ph / 2, fz - 0.003, P.walnut);
  // inner dark line
  box(-pw / 2 + 0.004, py + ph / 2 - 0.006, fz - 0.0065, pw / 2 - 0.004, py + ph / 2 - 0.004, fz - 0.0055, P.ink);
  box(-pw / 2 + 0.004, py - ph / 2 + 0.004, fz - 0.0065, pw / 2 - 0.004, py - ph / 2 + 0.006, fz - 0.0055, P.ink);

  // Buttons 5 rows x 8
  const rows = 5, cols = 8;
  const sx = 0.034, sy = 0.04;
  const back: [number, number, number] = [0, 0, -1];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const x = (c - (cols - 1) / 2) * sx;
      const y = py + (r - (rows - 1) / 2) * sy;
      const air = r === 0 && c === cols - 1;
      if (air) {
        cyl(0.011, 0.01, 12, P.gold, [x, y, fz - 0.0085], back);
        cyl(0.0085, 0.006, 12, P.abalone, [x, y, fz - 0.0125], back);
      } else {
        cyl(0.008, 0.008, 10, P.chrome, [x, y, fz - 0.0075], back);
        cyl(0.0056, 0.004, 10, P.ivory, [x, y, fz - 0.0115], back);
      }
    }

  // Side medallions at x=±0.21
  for (const s of [1, -1]) {
    const px = s * X1;
    const out: [number, number, number] = [s, 0, 0];
    const mc: [number, number] = [0.22, cz];
    // recess plate
    cyl(0.056, 0.004, 20, P.pearlDeep, [px + s * 0.0005, mc[0], mc[1]], out);
    cyl(0.049, 0.006, 20, P.gold, [px + s * 0.0015, mc[0], mc[1]], out);
    cyl(0.045, 0.008, 20, P.abaloneDeep, [px + s * 0.002, mc[0], mc[1]], out);
    cyl(0.034, 0.010, 20, P.abalone, [px + s * 0.003, mc[0], mc[1]], out);
    cyl(0.024, 0.012, 20, P.abaloneRose, [px + s * 0.004, mc[0], mc[1]], out);
    cyl(0.013, 0.014, 16, P.gold, [px + s * 0.005, mc[0], mc[1]], out);
    cyl(0.006, 0.016, 8, P.goldBright, [px + s * 0.006, mc[0], mc[1]], out);
    // sunburst rays
    const ray = new THREE.BoxGeometry(0.003, 0.012, 0.0035);
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * Math.PI * 2;
      const rr = 0.0395;
      b.part(ray, k % 2 ? P.abaloneRose : P.goldBright, {
        at: [px + s * 0.0035, mc[0] + Math.cos(a) * rr, mc[1] + Math.sin(a) * rr],
        rotation: [(a * 180) / Math.PI - 90, 0, 90] as any,
        scale: [1, 1, 1],
      });
    }
  }

  // Small gold feet corner accents at base (walnut inlay stripe on sides)
  for (const s of [1, -1]) box(s * X1 - (s > 0 ? 0.002 : -0.0), 0.012, Z0 + 0.02, s * X1 + (s > 0 ? 0.0 : 0.002), 0.016, Z1 - 0.02, P.gold);

  // Front-face (z=-0.30) closing plate in bellowsDark-ish to meet bellows: felt trim
  box(X0 + 0.01, 0.02, Z1 - 0.002, X1 - 0.01, H - 0.02, Z1 + 0.001, P.pearlDeep);
}
    return buildBassCase;
  })(),
  // strapsAndHardware
  (() => {
function buildStrapsAndHardware({ b, J, P, M }: Ctx) {
  const box = (w: number, h: number, d: number, color: string, at: number[], rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: at as any, rotation: rot as any });
  const cyl = (r: number, len: number, seg: number, color: string, at: number[], dir: number[]) =>
    b.part(new THREE.CylinderGeometry(r, r, len, seg), color, { at: at as any, dir: dir as any });

  // ---- Chrome corner guards: 8 corners, each an L bracket of two plates with a tiny gold rivet per face
  const T = 0.003; // plate thickness
  const L = 0.05; // arm length
  for (const sx of [1, -1]) {
    for (const [zc, sz] of [[0.56, 1], [-0.56, -1], [0.30, -1], [-0.30, 1]] as [number, number][]) {
      // only outer corners: treble z=0.56 front, 0.30 back; bass z=-0.30 front, -0.56 back
      const x = sx * 0.21;
      const zo = zc;
      // outward direction in z: front corners at 0.56 and -0.30 point +z; the others point -z
      const outZ = zc === 0.56 || zc === -0.3 ? 1 : -1;
      // only guard the extreme corners (0.56 and -0.56) plus inner ones near the bellows
      const yc = 0.4 - L / 2 - 0.01;
      // side plate (on x face)
      box(T, L, L, P.chrome, [x + sx * T / 2, yc, zo - outZ * L / 2 + outZ * 0.0]);
      // end plate (on z face)
      box(L, L, T, P.chrome, [x - sx * L / 2 + sx * 0.0, yc, zo + outZ * T / 2]);
      // rivets
      cyl(0.004, 0.003, 8, P.gold, [x + sx * (T + 0.001), yc, zo - outZ * L / 2], [sx, 0, 0]);
      cyl(0.004, 0.003, 8, P.gold, [x - sx * L / 2, yc, zo + outZ * (T + 0.001)], [0, 0, outZ]);
      // lower corner foot cap near the floor
      const yl = 0.03;
      box(T, 0.04, 0.04, P.chrome, [x + sx * T / 2, yl, zo - outZ * 0.02]);
      box(0.04, 0.04, T, P.chrome, [x - sx * 0.02, yl, zo + outZ * T / 2]);
      cyl(0.0035, 0.003, 8, P.gold, [x + sx * (T + 0.001), yl, zo - outZ * 0.02], [sx, 0, 0]);
      cyl(0.0035, 0.003, 8, P.gold, [x - sx * 0.02, yl, zo + outZ * (T + 0.001)], [0, 0, outZ]);
    }
  }

  // ---- Straps
  const strap = (anchor: number[], side: number) => {
    const [ax, , az] = anchor;
    const xs = side * (0.21 + 0.004); // flat on the outer side face
    const top = 0.4;
    const bot = 0.1;
    const len = top - bot;
    const cy = (top + bot) / 2;
    const w = 0.035;
    // leather band
    box(0.006, len, w, P.leather, [xs, cy, az]);
    // piping edges
    for (const dz of [-1, 1]) box(0.0075, len, 0.0035, P.goldBright, [xs + side * 0.0005, cy, az + dz * (w / 2 - 0.001)]);
    // stitch line
    for (let i = 0; i < 12; i++) box(0.0072, 0.008, 0.0025, P.ink, [xs + side * 0.0004, bot + 0.02 + i * 0.022, az]);
    // top pad on case top (rounded leather)
    const pad = b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.01, 12), P.leather, { at: [ax, top + 0.005, az] as any });
    box(0.044, 0.006, 0.05, P.leatherDark, [ax, top + 0.012, az]);
    // wrap from top onto side
    box(0.044 - 0.0, 0.006, w, P.leather, [side * 0.19, top + 0.003, az]);
    // anchor plate
    const plate = box(0.012, 0.05, 0.04, P.goldBright, [xs + side * 0.005, top - 0.03, az]);
    for (const dy of [-0.012, 0.012])
      cyl(0.004, 0.003, 8, P.ink, [xs + side * 0.0115, top - 0.03 + dy, az], [side, 0, 0]);
    box(0.014, 0.008, 0.044, P.gold, [xs + side * 0.005, top - 0.057, az]);
    // buckle midway
    const by = 0.25;
    const bx = xs + side * 0.005;
    for (const dy of [-1, 1]) box(0.006, 0.006, 0.05, P.pearl, [bx, by + dy * 0.019, az]);
    for (const dz of [-1, 1]) box(0.006, 0.044, 0.006, P.pearl, [bx, by, az + dz * 0.022]);
    box(0.007, 0.012, 0.034, P.abalone, [bx + side * 0.0005, by, az]);
    box(0.008, 0.034, 0.003, P.gold, [bx + side * 0.001, by, az]);
    cyl(0.003, 0.012, 6, P.gold, [bx + side * 0.002, by + 0.0, az], [0, 0, 1]);
    // bottom loop
    box(0.009, 0.03, w + 0.008, P.leatherDark, [xs + side * 0.003, bot + 0.012, az]);
    box(0.011, 0.004, w + 0.01, P.leatherDark, [xs + side * 0.003, bot + 0.028, az]);
    box(0.011, 0.004, w + 0.01, P.leatherDark, [xs + side * 0.003, bot - 0.004, az]);
    // keeper ring
    const ring = b.part(new THREE.TorusGeometry(0.011, 0.002, 6, 12), P.gold, {
      at: [xs + side * 0.01, bot - 0.012, az] as any,
      dir: [side, 0, 0] as any,
      axis: "z",
    });
    // tail end
    box(0.005, 0.03, w - 0.006, P.leather, [xs, bot - 0.025, az]);
  };
  strap(M.strapAnchorTreble, 1);
  strap(M.strapAnchorBass, -1);
}
    return buildStrapsAndHardware;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "madreperlaAccordion" });
  const J: Record<string, Joint> = {};
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
