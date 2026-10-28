import * as THREE from "three";
import { type Builder, createBuilder, frame } from "../../../../src/index";

type BasePartFn = (b: Builder) => void;
const PARTS: BasePartFn[] = [
  // topShelfContents
  (() => {
function buildTopShelfContents(b: Builder) {
  const Y0 = 1.95;
  const GOLD = "#d9a93a", DGOLD = "#9a6b1e", WOOD = "#4a2f5a";
  const WAX = "#f4ead0", WAXD = "#d8c9a4", FLAME = "#ffb83a", FLAMEIN = "#fff2a0";
  const CRYS = "#8fd8ff", CRYSD = "#5a9be0", ORB2 = "#c58bff", ORB3 = "#7dffc4";
  const glowMat = (p: any) => {
    const m = p.mesh.material as THREE.MeshStandardMaterial;
    const c = m.clone();
    c.emissive.copy(m.color);
    c.emissiveIntensity = 1.2;
    p.mesh.material = c;
    return p;
  };
  const at = (x: number, y: number, z: number) => [x, y, z] as [number, number, number];
  const part = (g: THREE.BufferGeometry, c: string, p: [number, number, number], extra: any = {}) =>
    b.part(g, c, { at: p, ...extra });

  const stand = (x: number, z: number, h: number, orbColor: string, r: number) => {
    part(new THREE.CylinderGeometry(0.07, 0.09, 0.03, 8), DGOLD, at(x, Y0 + 0.015, z));
    part(new THREE.CylinderGeometry(0.02, 0.03, h, 6), GOLD, at(x, Y0 + 0.03 + h / 2, z));
    part(new THREE.TorusGeometry(r * 0.75, 0.012, 5, 10), GOLD, at(x, Y0 + 0.03 + h, z), { rotation: [90, 0, 0] });
    glowMat(part(new THREE.IcosahedronGeometry(r, 1), orbColor, at(x, Y0 + 0.03 + h + r * 0.8, z), { flat: true }));
    part(new THREE.SphereGeometry(r * 0.25, 5, 4), "#ffffff", at(x - r * 0.35, Y0 + 0.03 + h + r * 1.2, z + r * 0.5));
  };
  stand(-0.62, 0.0, 0.07, ORB2, 0.1);
  stand(0.62, 0.02, 0.09, ORB3, 0.085);

  // crystal ball
  part(new THREE.CylinderGeometry(0.11, 0.15, 0.05, 8), DGOLD, at(0, Y0 + 0.025, 0.02));
  part(new THREE.TorusGeometry(0.1, 0.02, 5, 12), GOLD, at(0, Y0 + 0.06, 0.02), { rotation: [90, 0, 0] });
  for (const k of [0, 1, 2]) {
    const a = k * 2.094;
    part(new THREE.ConeGeometry(0.02, 0.06, 5), GOLD, at(Math.sin(a) * 0.12, Y0 + 0.07, 0.02 + Math.cos(a) * 0.12), { rotation: [180, 0, 0] });
  }
  glowMat(part(new THREE.IcosahedronGeometry(0.17, 1), CRYS, at(0, Y0 + 0.23, 0.02), { flat: true }));
  glowMat(part(new THREE.OctahedronGeometry(0.06), CRYSD, at(0, Y0 + 0.23, 0.02), { flat: true }));
  part(new THREE.SphereGeometry(0.03, 5, 4), "#ffffff", at(-0.07, Y0 + 0.31, 0.15));

  // candles
  const candle = (x: number, z: number, h: number, r: number) => {
    part(new THREE.CylinderGeometry(r * 2, r * 2.4, 0.015, 8), GOLD, at(x, Y0 + 0.0075, z));
    part(new THREE.CylinderGeometry(r, r * 1.05, h, 8), WAX, at(x, Y0 + 0.015 + h / 2, z));
    const top = Y0 + 0.015 + h;
    part(new THREE.CylinderGeometry(r * 1.02, r * 1.1, 0.02, 8), WAXD, at(x, top - 0.01, z));
    for (const [a, l] of [[0.5, 0.07], [2.4, 0.1], [4.2, 0.05]]) {
      const dx = Math.sin(a) * r, dz = Math.cos(a) * r;
      part(new THREE.CapsuleGeometry(0.008, l, 3, 5), WAXD, at(x + dx, top - l / 2 - 0.01, z + dz));
      part(new THREE.SphereGeometry(0.012, 5, 4), WAXD, at(x + dx, top - l - 0.02, z + dz));
    }
    part(new THREE.CylinderGeometry(0.003, 0.003, 0.03, 4), "#222", at(x, top + 0.015, z));
    glowMat(part(new THREE.ConeGeometry(0.022, 0.07, 6), FLAME, at(x, top + 0.065, z)));
    glowMat(part(new THREE.ConeGeometry(0.01, 0.04, 5), FLAMEIN, at(x, top + 0.055, z)));
  };
  candle(-0.85, 0.1, 0.16, 0.03);
  candle(-0.35, -0.12, 0.1, 0.025);
  candle(0.3, -0.1, 0.2, 0.03);
  candle(0.88, -0.05, 0.13, 0.028);
  candle(0.4, 0.15, 0.07, 0.022);

  // hanging star charm from upper shelf area
  const sx = -0.25, sz = 0.2;
  part(new THREE.CylinderGeometry(0.004, 0.004, 0.25, 4), DGOLD, at(sx, 2.47, sz));
  part(new THREE.TorusGeometry(0.015, 0.004, 4, 8), GOLD, at(sx, 2.6 - 0.005, sz));
  const star: [number, number][] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? 0.035 : 0.08, a = (i / 10) * Math.PI * 2;
    star.push([Math.sin(a) * r, Math.cos(a) * r]);
  }
  glowMat(b.extrude(star, { at: at(sx, 2.27, sz), x: [1, 0, 0], thickness: 0.025, bevel: 0.004, color: GOLD }));
  part(new THREE.SphereGeometry(0.02, 5, 4), "#fff2a0", at(sx, 2.27, sz + 0.016));
  part(new THREE.SphereGeometry(0.014, 5, 4), CRYS, at(sx, 2.17, sz));
}
    return buildTopShelfContents;
  })(),
  // tomesUpperMiddle
  (() => {
function buildTomesUpperMiddle(b: Builder) {
  const palette = ["#7a1f2b", "#1f3d7a", "#2f6b3a", "#5b2a7a", "#8a4b1e", "#1d5a66", "#a02f3f"];
  const GOLD = "#e8b84a";
  const CREAM = "#f3e7c4";
  const RUNE = "#7fe8ff";
  const boardTops = [1.0, 1.5];
  const zc = -0.02;
  const depthMax = 0.5;
  let seed = 7;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, rz = 0) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], rotation: [0, 0, rz] });

  for (let row = 0; row < 2; row++) {
    const y0 = boardTops[row] + 0.003;
    const maxH = 0.4;
    let x = -0.88;
    const end = row === 0 ? 0.55 : 0.6;
    let i = 0;
    while (x < end) {
      const w = 0.045 + rnd() * 0.05;
      const h = 0.24 + rnd() * (maxH - 0.24);
      const d = 0.28 + rnd() * 0.14;
      const c = palette[Math.floor(rnd() * palette.length)];
      const cx = x + w / 2;
      const cz = zc + (depthMax - d) * 0.15;
      // cover block
      box(w, h, d, c, cx, y0 + h / 2, cz);
      // page block visible from front (cream) slightly recessed
      box(w * 0.8, h * 0.94, 0.012, CREAM, cx, y0 + h / 2, cz + d / 2 + 0.001);
      // spine face front: darker cover
      box(w + 0.004, h, 0.01, c, cx, y0 + h / 2, cz + d / 2 - 0.004);
      // gold bands
      for (const t of [0.2, 0.8]) box(w + 0.008, 0.012, 0.012, GOLD, cx, y0 + h * t, cz + d / 2 + 0.004);
      // emblem
      if (w > 0.06) {
        box(0.02, 0.02, 0.008, GOLD, cx, y0 + h * 0.5, cz + d / 2 + 0.006, 45);
        box(0.01, 0.01, 0.01, RUNE, cx, y0 + h * 0.5, cz + d / 2 + 0.009, 45);
      } else {
        box(0.008, h * 0.3, 0.008, GOLD, cx, y0 + h * 0.55, cz + d / 2 + 0.006);
      }
      x += w + 0.004;
      i++;
    }
    // leaning book at the end of the row
    const lw = 0.07, lh = 0.34, ld = 0.32;
    const lean = 0.28;
    const lx = end + 0.1;
    const lc = palette[(row * 3 + 1) % palette.length];
    const lb = box(lw, lh, ld, lc, lx, y0 + lh / 2 * Math.cos(lean) + 0.02, zc, -lean * 57.3);
    void lb;
    box(lw * 0.8, 0.012, 0.012, GOLD, lx - 0.03, y0 + lh * 0.45, zc + ld / 2 + 0.005, -lean * 57.3);
    // stack of flat tomes
    const sx = 0.8;
    let sy = y0;
    for (let k = 0; k < 3; k++) {
      const sw = 0.22 - k * 0.025;
      const sh = 0.05 + (k % 2) * 0.012;
      const sc = palette[(row * 2 + k + 2) % palette.length];
      box(sw, sh, 0.3, sc, sx - 0.0 + (k % 2) * 0.01, sy + sh / 2, zc);
      box(sw * 0.95, sh * 0.5, 0.012, CREAM, sx, sy + sh / 2, zc + 0.152);
      box(0.02, sh + 0.004, 0.012, GOLD, sx + sw / 2 - 0.03, sy + sh / 2, zc + 0.154);
      sy += sh;
    }
    // clasp on top tome
    box(0.03, 0.012, 0.03, GOLD, sx, sy + 0.006, zc + 0.05);
    box(0.012, 0.014, 0.012, RUNE, sx, sy + 0.012, zc + 0.05);
  }
  void frame;
}
    return buildTomesUpperMiddle;
  })(),
  // scrollsLower
  (() => {
function buildScrollsLower(b: Builder) {
  const Y0 = 0.45;
  const PARCH = "#f2e2b8", PARCH2 = "#e3c98f", WOOD = "#6b4226", RIB_R = "#b3262e", RIB_B = "#2f5fb0";
  const WAX = "#8e1a22", INK = "#1a1226", QUILL = "#f6f1e6", QUILL2 = "#7fd0e8", GOLD = "#d9a93a";

  const cyl = (rt: number, rb: number, h: number, seg = 10) => new THREE.CylinderGeometry(rt, rb, h, seg);

  // Diamond rack on the left: a lattice of slats leaning against the back panel
  const rackX = -0.5, rackZ = -0.2;
  for (const s of [1, -1]) {
    for (let i = -2; i <= 2; i++) {
      b.part(new THREE.BoxGeometry(0.02, 0.62, 0.025), WOOD, {
        at: [rackX + i * 0.15, Y0 + 0.31, rackZ], rotation: [0, 0, s * 45 * 1], scale: [1, 0.78, 1],
      });
    }
  }
  b.part(new THREE.BoxGeometry(0.8, 0.03, 0.04), WOOD, { at: [rackX, Y0 + 0.015, rackZ] });
  // frame verticals
  for (const s of [1, -1]) b.part(new THREE.BoxGeometry(0.03, 0.56, 0.035), WOOD, { at: [rackX + s * 0.4, Y0 + 0.29, rackZ] });
  b.part(new THREE.BoxGeometry(0.83, 0.03, 0.035), WOOD, { at: [rackX, Y0 + 0.57, rackZ] });

  // Scroll bundles tucked in the diamond cells
  const cells: [number, number][] = [[-0.3, 0.2], [0, 0.2], [0.3, 0.2], [-0.15, 0.42], [0.15, 0.42], [-0.15, 0.1]];
  cells.forEach(([dx, dy], k) => {
    const x = rackX + dx * 1.2;
    const y = Y0 + dy;
    const col = k % 2 ? PARCH : PARCH2;
    b.part(cyl(0.032, 0.032, 0.22, 8), col, { at: [x, y, rackZ + 0.04], rotation: [90, 0, 0] });
    b.part(cyl(0.034, 0.034, 0.02, 8), WOOD, { at: [x, y, rackZ + 0.15], rotation: [90, 0, 0] });
    b.part(cyl(0.034, 0.034, 0.02, 8), WOOD, { at: [x, y, rackZ - 0.07], rotation: [90, 0, 0] });
    b.part(cyl(0.036, 0.036, 0.018, 8), k % 3 ? RIB_R : RIB_B, { at: [x, y, rackZ + 0.04], rotation: [90, 0, 0] });
  });

  // Loose rolled scrolls lying on the board, with ribbons and wax seals
  const loose: [number, number, number, number][] = [[0.0, 0.0, 0.04, 8], [0.12, 0.1, 0.035, -14], [0.05, -0.1, 0.04, 20]];
  loose.forEach(([x, z, r, rot], k) => {
    const cx = 0.12 + x;
    b.part(cyl(r, r, 0.5, 10), k % 2 ? PARCH2 : PARCH, { at: [cx, Y0 + r, z], rotation: [0, rot, 90] });
    for (const e of [1, -1]) {
      b.part(cyl(r * 1.15, r * 1.15, 0.03, 10), WOOD, {
        at: [cx + e * 0.255 * Math.cos(rot * Math.PI / 180), Y0 + r, z - e * 0.255 * Math.sin(rot * Math.PI / 180)],
        rotation: [0, rot, 90],
      });
    }
    b.part(cyl(r * 1.1, r * 1.1, 0.04, 10), k % 2 ? RIB_B : RIB_R, { at: [cx, Y0 + r, z], rotation: [0, rot, 90] });
    b.part(new THREE.SphereGeometry(0.022, 8, 6), WAX, { at: [cx, Y0 + r * 2 + 0.005, z], scale: [1, 0.5, 1] });
    b.part(new THREE.SphereGeometry(0.008, 6, 4), GOLD, { at: [cx, Y0 + r * 2 + 0.014, z] });
    // ribbon tails
    b.part(new THREE.BoxGeometry(0.012, 0.004, 0.06), k % 2 ? RIB_B : RIB_R, { at: [cx + 0.01, Y0 + 0.008, z + r + 0.03], rotation: [0, 15, 0] });
  });

  // Ink pots with quills on the right
  const pots: [number, number][] = [[0.65, 0.05], [0.8, -0.08]];
  pots.forEach(([x, z], k) => {
    b.part(cyl(0.06, 0.07, 0.09, 10), k ? "#2a3f7a" : "#3b2a5e", { at: [x, Y0 + 0.045, z] });
    b.part(cyl(0.04, 0.05, 0.02, 10), "#2a3f7a", { at: [x, Y0 + 0.1, z] });
    b.part(cyl(0.032, 0.032, 0.006, 10), INK, { at: [x, Y0 + 0.112, z] });
    b.part(cyl(0.062, 0.062, 0.012, 10), GOLD, { at: [x, Y0 + 0.07, z] });
    // quill
    const q = k ? 1 : -1;
    b.part(cyl(0.004, 0.004, 0.26, 5), QUILL, { at: [x + q * 0.05, Y0 + 0.23, z], rotation: [0, 0, q * -22] });
    b.part(new THREE.BoxGeometry(0.05, 0.14, 0.006), k ? QUILL2 : QUILL, { at: [x + q * 0.09, Y0 + 0.3, z], rotation: [0, 0, q * -22], scale: [1, 1, 1] });
    b.part(cyl(0.001, 0.005, 0.03, 5), INK, { at: [x + q * 0.012, Y0 + 0.112, z], rotation: [0, 0, q * -22] });
  });

  // Small stack of loose parchment sheets
  for (let i = 0; i < 4; i++) {
    b.part(new THREE.BoxGeometry(0.2 - i * 0.005, 0.008, 0.15), i % 2 ? PARCH : PARCH2, {
      at: [0.5, Y0 + 0.004 + i * 0.008, 0.15], rotation: [0, i * 6, 0],
    });
  }
}
    return buildScrollsLower;
  })(),
  // cabinetDoorsAndTrim
  (() => {
function buildCabinetDoorsAndTrim(b: Builder) {
  const WOOD = "#5a3420", WOOD2 = "#6e4228", GOLD = "#e8b83a", BRASS = "#c9922e", DARK = "#1c1020", GEM = "#58d6ff";
  const Z = 0.3;
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z] });
  const cyl = (r: number, d: number, c: string, x: number, y: number, z: number, seg = 12) =>
    b.part(new THREE.CylinderGeometry(r, r, d, seg), c, { at: [x, y, z], rotation: [90, 0, 0] });

  // frame
  box(1.96, 0.04, 0.03, WOOD, 0, 0.02, Z + 0.015);
  box(1.96, 0.04, 0.03, WOOD, 0, 0.38, Z + 0.015);
  box(0.04, 0.4, 0.03, WOOD, -0.98, 0.2, Z + 0.015);
  box(0.04, 0.4, 0.03, WOOD, 0.98, 0.2, Z + 0.015);
  box(0.03, 0.32, 0.03, WOOD, 0, 0.2, Z + 0.015);
  // gold trim
  box(1.9, 0.012, 0.012, GOLD, 0, 0.055, Z + 0.036);
  box(1.9, 0.012, 0.012, GOLD, 0, 0.365, Z + 0.036);
  box(1.96, 0.014, 0.014, GOLD, 0, 0.4 - 0.007, Z + 0.032);

  for (const s of [-1, 1]) {
    const cx = s * 0.49;
    // door
    box(0.9, 0.3, 0.025, WOOD2, cx, 0.2, Z + 0.0125);
    box(0.8, 0.22, 0.012, WOOD, cx, 0.2, Z + 0.031);
    // inset gold border
    box(0.82, 0.008, 0.008, GOLD, cx, 0.318, Z + 0.039);
    box(0.82, 0.008, 0.008, GOLD, cx, 0.082, Z + 0.039);
    box(0.008, 0.236, 0.008, GOLD, cx - 0.41, 0.2, Z + 0.039);
    box(0.008, 0.236, 0.008, GOLD, cx + 0.41, 0.2, Z + 0.039);
    // hinges on outer edge
    for (const y of [0.1, 0.2, 0.3]) {
      box(0.05, 0.035, 0.012, BRASS, s * 0.93, y, Z + 0.032);
      cyl(0.008, 0.04, BRASS, s * 0.955, y, Z + 0.03, 8).mesh.rotation.set(0, 0, 0);
    }
    // handle
    const hx = s * 0.08;
    cyl(0.026, 0.01, BRASS, hx, 0.2, Z + 0.036);
    b.part(new THREE.SphereGeometry(0.02, 8, 6), GOLD, { at: [hx, 0.2, Z + 0.048] });
  }

  // moon emblem (left door)
  cyl(0.07, 0.008, GOLD, -0.5, 0.2, Z + 0.042, 16);
  cyl(0.06, 0.01, WOOD, -0.475, 0.21, Z + 0.045, 16);
  // star emblem (right door)
  const star: [number, number][] = [];
  for (let i = 0; i < 10; i++) {
    const a = Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 0.03 : 0.07;
    star.push([Math.cos(a) * r, Math.sin(a) * r]);
  }
  b.extrude(star, { at: [0.5, 0.2, Z + 0.038], x: [1, 0, 0], thickness: 0.008, color: GOLD });

  // keyhole
  cyl(0.022, 0.006, DARK, 0.12, 0.13, Z + 0.04, 10);
  box(0.012, 0.04, 0.006, DARK, 0.12, 0.105, Z + 0.04);
  cyl(0.032, 0.005, BRASS, 0.12, 0.13, Z + 0.038, 10);

  // corner ornaments
  for (const sx of [-1, 1])
    for (const y of [0.04, 0.36]) {
      box(0.07, 0.07, 0.03, GOLD, sx * 0.96, y, Z + 0.04);
      b.part(new THREE.OctahedronGeometry(0.018), GEM, { at: [sx * 0.96, y, Z + 0.06] });
    }
}
    return buildCabinetDoorsAndTrim;
  })(),
  // sideDecor
  (() => {
function buildSideDecor(b: Builder) {
  const IRON = "#2b2433", GOLD = "#e0b24a", WAX = "#f4ead0", FLAME = "#ffc857", RUNE = "#6ee7ff";
  const CLOTH = "#6a2f8f", CLOTH2 = "#c9a13a", WOOD = "#5a3a22";
  const X = 1.12; // assumed outer face of side panels
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z] });
  const cyl = (rt: number, rb: number, h: number, seg: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at: [x, y, z] });
  const sph = (r: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), c, { at: [x, y, z] });

  for (const s of [1, -1]) {
    const ox = s * X;
    // bracket arm for lantern (left only) / sconce
    // rune sconces
    for (const y of [0.7, 1.5]) {
      box(0.05, 0.16, 0.16, IRON, ox + s * 0.025, y, 0.05);
      box(0.02, 0.1, 0.1, RUNE, ox + s * 0.058, y, 0.05);
      box(0.02, 0.1, 0.02, IRON, ox + s * 0.07, y, 0.05);
      box(0.02, 0.02, 0.07, IRON, ox + s * 0.07, y, 0.05);
      cyl(0.07, 0.04, 0.03, 8, GOLD, ox + s * 0.13, y - 0.06, -0.12);
      cyl(0.022, 0.022, 0.12, 8, WAX, ox + s * 0.13, y + 0.015, -0.12);
      sph(0.02, FLAME, ox + s * 0.13, y + 0.09, -0.12);
      box(0.08, 0.02, 0.04, IRON, ox + s * 0.07, y - 0.06, -0.06);
    }
    // finial on crown corner
    box(0.14, 0.06, 0.14, WOOD, s * 1.08, 2.33, 0.0);
    cyl(0.04, 0.06, 0.14, 6, GOLD, s * 1.08, 2.43 - 0.0, 0);
    sph(0.06, GOLD, s * 1.08, 2.54 - 0.0, 0);
    // carved finial on side panel lower
    box(0.12, 0.1, 0.12, WOOD, ox + s * 0.06, 0.2, 0.0);
    sph(0.05, GOLD, ox + s * 0.06, 0.3, 0.0);
  }

  // hanging lantern on left side
  const lx = X + 0.12, ly = 1.1, lz = 0.12;
  box(0.28, 0.03, 0.03, IRON, X + 0.06, 1.6, lz); // arm
  box(0.03, 0.2, 0.03, IRON, X + 0.2, 1.5, lz);
  cyl(0.005, 0.005, 0.2, 4, IRON, lx + 0.08, 1.4, lz);
  cyl(0.05, 0.1, 0.05, 6, IRON, lx + 0.08, 1.28, lz);
  cyl(0.09, 0.09, 0.2, 6, "#ffe9a8", lx + 0.08, 1.15, lz);
  cyl(0.02, 0.02, 0.1, 6, WAX, lx + 0.08, 1.08, lz);
  sph(0.025, FLAME, lx + 0.08, 1.16, lz);
  cyl(0.1, 0.08, 0.03, 6, GOLD, lx + 0.08, 1.04, lz);
  cyl(0.003, 0.003, 0.12, 4, GOLD, lx + 0.08, 0.94, lz);

  // draped cloth on right side
  const cx = -X - 0.03;
  box(0.03, 0.04, 0.5, WOOD, cx, 1.95, 0.0);
  box(0.03, 0.55, 0.44, CLOTH, cx - 0.01, 1.65, 0.0);
  box(0.032, 0.05, 0.44, CLOTH2, cx - 0.012, 1.4, 0.0);
  box(0.032, 0.3, 0.05, CLOTH2, cx - 0.012, 1.75, 0.0);
  box(0.034, 0.1, 0.1, CLOTH2, cx - 0.014, 1.65, 0.0);
  for (const z of [-0.18, 0, 0.18]) {
    cyl(0.01, 0.01, 0.08, 4, GOLD, cx - 0.01, 1.34, z);
    sph(0.02, GOLD, cx - 0.01, 1.28, z);
  }
}
    return buildSideDecor;
  })(),
];

export const BASE_PARTS = [
  {
    id: "topShelfContents",
    builds: "Orbs on little stands, a crystal ball with glow, candles with dripping wax and flames, and a small hanging star charm on the top shelf and crown surface",
    box: [
      [-0.95, 1.95, -0.3],
      [0.95, 2.6, 0.3],
    ],
    attaches: "Top surface of the crown board (y=1.95) and the upper shelf board",
    joints: [],
    floor: false,
    budget: 180,
  },
  {
    id: "tomesUpperMiddle",
    builds: "Rows of leaning and stacked tomes with spines, bands, clasps, gold emblems and rune decals on the upper and middle shelf boards",
    box: [
      [-0.95, 0.95, -0.28],
      [0.95, 1.9, 0.28],
    ],
    attaches: "Shelf boards at y=1.0 and y=1.5 between the side panels and the back panel",
    joints: [],
    floor: false,
    budget: 220,
  },
  {
    id: "scrollsLower",
    builds: "Scroll bundles in a diamond rack, loose rolled scrolls with ribbons and wax seals, and ink pots with quills on the lower shelf",
    box: [
      [-0.95, 0.35, -0.28],
      [0.95, 0.95, 0.28],
    ],
    attaches: "Lower shelf board at y=0.45 and back panel",
    joints: [],
    floor: false,
    budget: 180,
  },
  {
    id: "cabinetDoorsAndTrim",
    builds: "Lower cabinet doors with brass hinges, handles, a keyhole, carved moon and star emblems, plus gold trim and corner ornaments on the frame",
    box: [
      [-1.0, 0.0, 0.25],
      [1.0, 0.4, 0.45],
    ],
    attaches: "Front face of the plinth cabinet block (z=0.3)",
    joints: [],
    floor: true,
    budget: 180,
  },
  {
    id: "sideDecor",
    builds: "Hanging lantern with candle, side-mounted rune sconces, a draped cloth, and carved finials on the side panels and crown ends",
    box: [
      [-1.25, 0.0, -0.3],
      [1.25, 2.4, 0.4],
    ],
    attaches: "Outer faces of the left and right side panels and crown corners",
    joints: [],
    floor: false,
    budget: 120,
  },
];

export default function build() {
  const b = createBuilder({ name: "model" });
  const WOOD = "#5a3a2a";
  const DARK = "#3b2418";
  const LIGHT = "#7a5238";
  const BACK = "#2f1d2e";
  b.joint("shelf", { at: [0, 0, 0] });

  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], bone: "shelf" });

  // plinth cabinet block
  box(1.9, 0.4, 0.6, DARK, 0, 0.2, 0);
  box(2.0, 0.06, 0.64, WOOD, 0, 0.03, 0.01);
  // side panels
  for (const s of [1, -1]) {
    box(0.1, 1.55, 0.6, WOOD, s * 0.95, 1.175, 0);
    box(0.06, 1.55, 0.04, LIGHT, s * 0.95, 1.175, 0.31);
  }
  // back panel
  box(1.8, 1.55, 0.05, BACK, 0, 1.175, -0.27);
  // shelf boards
  for (const y of [0.45, 1.0, 1.5]) box(1.8, 0.06, 0.55, LIGHT, 0, y, 0.0);
  // crown board and cornice
  box(2.1, 0.1, 0.68, WOOD, 0, 1.98, 0);
  box(1.9, 0.12, 0.6, DARK, 0, 1.89, 0);
  // central crown peak
  b.part(new THREE.ConeGeometry(0.25, 0.3, 4), WOOD, { at: [0, 2.2, 0], bone: "shelf", rotation: [0, 45, 0] });
  // door panel frames on cabinet
  for (const s of [1, -1]) box(0.88, 0.32, 0.03, WOOD, s * 0.45, 0.2, 0.31);

    for (const add of PARTS) add(b);
  return b.root;
}
