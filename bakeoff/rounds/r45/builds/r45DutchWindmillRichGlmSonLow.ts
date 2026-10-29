import * as THREE from "three";
import { createBuilder, type Builder, type Joint, rng, frame } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Starry Mill",
  "description": "A Dutch smock windmill in Animal Crossing style: a chunky brick tower with a flower-boxed gallery ring, a cream battened smock, a dark red cap and four lattice-and-cloth sails frozen in an X, its windows glowing warm."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  brick: "#a85a3c",
  brickDark: "#8a4630",
  trim: "#f5ead6",
  plaster: "#fdf3dd",
  batten: "#b98a5a",
  wood: "#9a6b42",
  woodDark: "#6e4a2e",
  cap: "#8f3a3f",
  door: "#7a4a30",
  windowFrame: "#5c4632",
  glass: "#a8d8e8",
  glow: "#ffd98a",
  stone: "#9a9a92",
  sailFrame: "#e8dcc2",
  sailCloth: "#f7f1e3",
  axle: "#4a3828",
  leaf: "#6d9b4f",
  flowerPink: "#f08aa8",
  flowerYellow: "#f2c94c",
};
const M = {
  baseTop: [0, 1.55, 0] as [number, number, number],
  deckTop: [0, 1.78, 0] as [number, number, number],
  capSeat: [0, 3.35, 0] as [number, number, number],
  capHub: [0, 3.62, 0.55] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // base
  (() => {
function buildBase({ b, J, P }: any) {
  const bone = J.mill;
  const R = (y: number) => (y <= 0.8 ? 1.35 - (y / 0.8) * 0.1 : 1.25 - ((y - 0.8) / 0.75) * 0.1);
  const SIDES = 16;
  // tower: a lathe with a slightly deeper profile, solid
  b.lathe(
    [[0, 0], [1.35, 0], [1.25, 0.8], [1.15, 1.55], [0, 1.55]],
    { at: [0, 0, 0], segments: SIDES, color: P.brick, bone },
  );
  // trim bands
  for (const [y, h] of [[0.45, 0.06], [0.95, 0.06], [1.45, 0.12]] as number[][]) {
    const r = R(y) + 0.04;
    b.lathe([[r - 0.06, y - h / 2], [r, y - h / 2], [r, y + h / 2], [r - 0.06, y + h / 2]], {
      at: [0, 0, 0], segments: SIDES, color: P.trim, bone,
    });
  }
  // dark brick patches
  const rnd = rng(11);
  for (let i = 0; i < 70; i++) {
    const y = 0.08 + Math.pow(rnd(), 1.5) * 1.35;
    const a = rnd() * Math.PI * 2;
    // keep clear of the door and the windows at the front
    const dx = Math.sin(a);
    const front = Math.cos(a) > 0.5;
    if (front && (Math.abs(dx * R(y)) < 0.45 && y < 1.4)) continue;
    if (front && y > 0.85 && y < 1.4 && Math.abs(Math.abs(dx * R(y)) - 0.75) < 0.22) continue;
    if (Math.abs(y - 0.45) < 0.05 || Math.abs(y - 0.95) < 0.05 || y > 1.38) continue;
    const r = R(y) - 0.005;
    const w = 0.12 + rnd() * 0.1;
    b.part(new THREE.BoxGeometry(w, 0.07 + rnd() * 0.05, 0.04), P.brickDark, {
      at: [Math.sin(a) * r, y, Math.cos(a) * r],
      rotation: [0, (a * 180) / Math.PI, 0],
      bone,
    });
  }
  // door frontage: sits at the tower front surface
  const zf = 1.31;
  b.part(new THREE.BoxGeometry(0.66, 0.9, 0.06), P.door, { at: [0, 0.47, zf], bone });
  b.part(new THREE.CylinderGeometry(0.33, 0.33, 0.06, 12, 1, false, 0, Math.PI), P.door, {
    at: [0, 0.92, zf], rotation: [90, 0, 0], bone,
  });
  // plank seams
  for (const x of [-0.11, 0.11])
    b.part(new THREE.BoxGeometry(0.02, 1.15, 0.02), P.woodDark, { at: [x, 0.58, zf + 0.04], bone });
  // arch stones
  for (let i = 0; i < 9; i++) {
    const t = Math.PI * (i / 8);
    const r = 0.4;
    b.part(new THREE.BoxGeometry(0.1, 0.13, 0.09), P.trim, {
      at: [Math.cos(t) * r, 0.92 + Math.sin(t) * r, zf],
      rotation: [0, 0, (t * 180) / Math.PI - 90],
      bone,
    });
  }
  // jambs
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(0.1, 0.9, 0.09), P.trim, { at: [s * 0.4, 0.47, zf], bone });
  // knob
  b.part(new THREE.SphereGeometry(0.035, 6, 4), P.trim, { at: [0.2, 0.5, zf + 0.06], bone });
  // steps
  b.part(new THREE.BoxGeometry(1.0, 0.1, 0.4), P.stone, { at: [0, 0.05, 1.5], bone });
  b.part(new THREE.BoxGeometry(0.82, 0.1, 0.3), P.stone, { at: [0, 0.15, 1.42], bone });
  b.part(new THREE.BoxGeometry(0.82, 0.1, 0.18), P.stone, { at: [0, 0.15, 1.28], bone });
  // windows
  for (const s of [1, -1]) {
    const x = s * 0.75;
    const z = Math.sqrt(Math.max(R(1.1) ** 2 - x * x, 0)) + 0.01;
    const add = (g: THREE.BufferGeometry, c: string, dz: number, y = 0) =>
      b.part(g, c, { at: [x, 1.1 + y, z + dz], bone });
    add(new THREE.BoxGeometry(0.36, 0.34, 0.06), P.windowFrame, 0, 0);
    add(new THREE.CylinderGeometry(0.18, 0.18, 0.06, 10, 1, false, 0, Math.PI).rotateX(Math.PI / 2), P.windowFrame, 0, 0.17);
    add(new THREE.BoxGeometry(0.26, 0.3, 0.03), P.glass, 0.035, -0.0);
    add(new THREE.CylinderGeometry(0.13, 0.13, 0.03, 10, 1, false, 0, Math.PI).rotateX(Math.PI / 2), P.glass, 0.035, 0.15);
    add(new THREE.BoxGeometry(0.2, 0.26, 0.02), P.glow, 0.045, -0.01);
    add(new THREE.CylinderGeometry(0.1, 0.1, 0.02, 10, 1, false, 0, Math.PI).rotateX(Math.PI / 2), P.glow, 0.045, 0.12);
    add(new THREE.BoxGeometry(0.02, 0.4, 0.02), P.windowFrame, 0.06, 0.04);
    add(new THREE.BoxGeometry(0.26, 0.02, 0.02), P.windowFrame, 0.06, 0.04);
    add(new THREE.BoxGeometry(0.46, 0.05, 0.1), P.trim, 0.0, -0.19);
  }
}
    return buildBase;
  })(),
  // gallery
  (() => {
function buildGallery({ b, J, P, M }: Ctx) {
  const bone = J.mill;
  const R = rng(11);
  const Y0 = 1.55, Y1 = 1.78, T = 0.14;
  const yc = Y1 - T / 2;
  const LIGHT = "#c9a577";
  const place = (g: THREE.BufferGeometry, color: string, at: number[], rotY = 0, extra: any = {}) =>
    b.part(g, color, { bone, at, rotation: [0, rotY, 0], ...extra });
  const pol = (r: number, a: number, y: number) => [Math.sin(a) * r, y, Math.cos(a) * r];

  // deck planks
  const N = 16, step = (Math.PI * 2) / N;
  for (let i = 0; i < N; i++) {
    const a = (i + 0.5) * step;
    const g = new THREE.CylinderGeometry(1.6, 1.16, T, 1, 1, false, a - step / 2 + 0.01, step - 0.02);
    b.part(g, i % 2 ? LIGHT : P.wood, { bone, at: [0, yc, 0] });
  }
  // gaps
  for (let i = 0; i < N; i++) {
    const a = i * step;
    place(new THREE.BoxGeometry(0.012, T + 0.004, 0.44), P.woodDark, pol(1.38, a, yc), a);
  }
  // rim bands
  for (const y of [Y1 - 0.02, Y0 + 0.02]) {
    b.part(new THREE.CylinderGeometry(1.62, 1.62, 0.04, 24, 1, true), P.woodDark, { bone, at: [0, y, 0] });
    b.part(new THREE.TorusGeometry(1.6, 0.025, 4, 24), P.woodDark, { bone, at: [0, y, 0], rotation: [90, 0, 0] });
  }
  // brackets
  for (let i = 0; i < 8; i++) {
    const a = (i + 0.5) * (Math.PI / 4);
    place(new THREE.BoxGeometry(0.08, 0.08, 0.5), P.woodDark, pol(1.3, a, Y0 - 0.1), a);
    b.part(new THREE.BoxGeometry(0.07, 0.07, 0.4), P.woodDark, {
      bone, at: pol(1.4, a, Y0 - 0.15), rotation: [0, a * 180 / Math.PI, 0],
    });
  }
  // posts and rails
  const PN = 24, RR = 1.54;
  for (let i = 0; i < PN; i++) {
    const a = i * (Math.PI * 2) / PN;
    place(new THREE.BoxGeometry(0.06, 0.4, 0.06), P.woodDark, pol(RR, a, Y1 + 0.2), a);
    place(new THREE.BoxGeometry(0.09, 0.04, 0.09), P.trim, pol(RR, a, Y1 + 0.42), a);
  }
  for (const [y, c, th] of [[Y1 + 0.37, P.wood, 0.045], [Y1 + 0.2, P.wood, 0.03]] as [number, string, number][]) {
    b.part(new THREE.TorusGeometry(RR, th, 4, 24), c, { bone, at: [0, y, 0], rotation: [90, 0, 0] });
  }
  // flower boxes
  const angles = [40, 80, 120, 240, 280, 320].map((d) => (d * Math.PI) / 180);
  angles.forEach((a, k) => {
    const r = 1.66, y = Y1 + 0.2;
    place(new THREE.BoxGeometry(0.4, 0.15, 0.14), P.wood, pol(r, a, y), a);
    place(new THREE.BoxGeometry(0.43, 0.03, 0.17), P.woodDark, pol(r, a, y + 0.08), a);
    for (let j = 0; j < 3; j++) {
      const off = (j - 1) * 0.12;
      const c = new THREE.Vector3(...pol(r, a, y + 0.12));
      c.x += Math.cos(a) * off; c.z -= Math.sin(a) * off;
      b.part(new THREE.SphereGeometry(0.08, 6, 4), P.leaf, { bone, at: [c.x, c.y, c.z], scale: [1, 0.7, 1] });
    }
    const n = 5 + (k % 3);
    for (let j = 0; j < n; j++) {
      const off = (j / (n - 1) - 0.5) * 0.34;
      const rr = r + (R() - 0.5) * 0.05;
      const c = new THREE.Vector3(...pol(rr, a, y + 0.2 + R() * 0.03));
      c.x += Math.cos(a) * off; c.z -= Math.sin(a) * off;
      b.part(new THREE.SphereGeometry(0.035, 6, 4), j % 2 ? P.flowerYellow : P.flowerPink, { bone, at: [c.x, c.y, c.z] });
    }
  });
  // lanterns
  for (const s of [1, -1]) {
    const a = s * (Math.PI / 12);
    const p = pol(RR + 0.06, a, Y1 + 0.38);
    b.part(new THREE.CylinderGeometry(0.005, 0.005, 0.1, 4), P.woodDark, { bone, at: [p[0], p[1] + 0.05, p[2]] });
    const lp = [p[0], p[1] - 0.1, p[2]];
    place(new THREE.BoxGeometry(0.1, 0.12, 0.1), P.axle, lp, a);
    glow(place(new THREE.BoxGeometry(0.075, 0.1, 0.075), P.glow, lp, a), 1.4);
    place(new THREE.ConeGeometry(0.075, 0.05, 4), P.axle, [lp[0], lp[1] + 0.085, lp[2]], a + 45);
  }
}
    return buildGallery;
  })(),
  // smock
  (() => {
function buildSmock({ b, J, P, M }: Ctx) {
  const bone = J.mill;
  const R = (y: number) => {
    // smock radius at height y
    if (y <= 2.55) return 1.05 + ((0.85 - 1.05) * (y - 1.78)) / (2.55 - 1.78);
    return 0.85 + ((0.62 - 0.85) * (y - 2.55)) / (3.35 - 2.55);
  };
  const SIDES = 14;
  const lathe = (pts: [number, number][], color: string, segs = SIDES) =>
    b.lathe(pts, { at: [0, 0, 0], bone, color, segments: segs });

  // main smock taper
  lathe([[0, 1.78], [1.05, 1.78], [0.85, 2.55], [0.62, 3.35], [0, 3.35]], P.plaster);

  // trim bands
  lathe([[0, 1.78], [1.1, 1.78], [1.1, 1.92], [0, 1.92]], P.trim);
  lathe([[0.55, 3.2], [0.66, 3.2], [0.66, 3.3], [0.55, 3.3]], P.trim);

  // battens
  const placeBatten = (ang: number, w: number, d: number, color: string) => {
    const y0 = 1.92, y1 = 3.22;
    const p0 = new THREE.Vector3(Math.sin(ang) * (R(y0) + 0.005), y0, Math.cos(ang) * (R(y0) + 0.005));
    const p1 = new THREE.Vector3(Math.sin(ang) * (R(y1) + 0.005), y1, Math.cos(ang) * (R(y1) + 0.005));
    const dir = p1.clone().sub(p0);
    const len = dir.length();
    b.part(new THREE.BoxGeometry(w, len, d), color, {
      bone,
      at: p0.clone().add(p1).multiplyScalar(0.5),
      dir: dir.clone().normalize(),
      rotation: undefined as any,
      quat: (() => {
        const q = new THREE.Quaternion();
        const m = new THREE.Matrix4().lookAt(new THREE.Vector3(), new THREE.Vector3(Math.sin(ang), 0, Math.cos(ang)), new THREE.Vector3(0, 1, 0));
        q.setFromRotationMatrix(m);
        // tilt along taper
        const tilt = Math.atan2(R(y0) - R(y1), len);
        q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -tilt));
        return q;
      })(),
    });
  };
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2 + 0.08;
    const front = Math.abs(Math.sin(a)) < 0.55 && Math.cos(a) > 0.3;
    if (front) continue;
    placeBatten(a, 0.045, 0.03, P.batten);
  }
  for (let i = 0; i < 4; i++) placeBatten((i / 4) * Math.PI * 2 + Math.PI / 4, 0.1, 0.05, P.wood);

  // windows
  const win = (x: number, y: number, kind: "sq" | "round") => {
    const z = R(y) * Math.cos(Math.asin(x / R(y))) ;
    const zz = Math.sqrt(R(y) ** 2 - x * x) - 0.02;
    if (kind === "sq") {
      b.part(new THREE.BoxGeometry(0.34, 0.34, 0.06), P.windowFrame, { bone, at: [x, y, zz + 0.02] });
      b.part(new THREE.BoxGeometry(0.26, 0.26, 0.05), P.glass, { bone, at: [x, y, zz + 0.04] });
      b.part(new THREE.BoxGeometry(0.2, 0.2, 0.05), P.glow, { bone, at: [x, y, zz + 0.055] });
      b.part(new THREE.BoxGeometry(0.2, 0.025, 0.055), P.windowFrame, { bone, at: [x, y, zz + 0.06] });
      b.part(new THREE.BoxGeometry(0.025, 0.2, 0.055), P.windowFrame, { bone, at: [x, y, zz + 0.06] });
    } else {
      const a: [number, number, number] = [x, y, zz + 0.02];
      b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 14), P.trim, { bone, at: a, dir: [0, 0, 1] });
      b.part(new THREE.CylinderGeometry(0.16, 0.16, 0.06, 14), P.windowFrame, { bone, at: [x, y, zz + 0.03], dir: [0, 0, 1] });
      b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.07, 12), P.glass, { bone, at: [x, y, zz + 0.04], dir: [0, 0, 1] });
      b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.075, 12), P.glow, { bone, at: [x, y, zz + 0.05], dir: [0, 0, 1] });
      b.part(new THREE.BoxGeometry(0.2, 0.02, 0.08), P.windowFrame, { bone, at: [x, y, zz + 0.055] });
      b.part(new THREE.BoxGeometry(0.02, 0.2, 0.08), P.windowFrame, { bone, at: [x, y, zz + 0.055] });
    }
  };
  win(0.45, 2.4, "sq");
  win(-0.45, 2.4, "sq");
  win(0, 3.05, "round");

  // cap dome
  const dome: [number, number][] = [[0, 3.35], [0.68, 3.35]];
  for (let i = 1; i <= 6; i++) {
    const t = (i / 6) * (Math.PI / 2);
    dome.push([0.68 * Math.cos(t), 3.35 + 0.55 * Math.sin(t)]);
  }
  lathe(dome, P.cap, 16);
  lathe([[0.62, 3.35], [0.72, 3.35], [0.72, 3.47], [0.62, 3.47]], P.trim, 16);
  b.part(new THREE.CylinderGeometry(0.025, 0.035, 0.1, 6), P.trim, { bone, at: [0, 3.93, 0] });
  b.part(new THREE.SphereGeometry(0.07, 8, 6), P.trim, { bone, at: [0, 4.0 - 0.02, 0] });

  // hub
  const [hx, hy, hz] = M.capHub;
  b.part(new THREE.CylinderGeometry(0.17, 0.2, 0.3, 12), P.axle, { bone, at: [hx, hy, hz - 0.15], dir: [0, 0, 1] });
  b.part(new THREE.CylinderGeometry(0.21, 0.21, 0.05, 12), P.windowFrame, { bone, at: [hx, hy, hz - 0.26], dir: [0, 0, 1] });
  b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.05, 10), P.trim, { bone, at: [hx, hy, hz - 0.03], dir: [0, 0, 1] });

  // tail pole
  const a = new THREE.Vector3(0, 3.65, -0.6);
  const e = new THREE.Vector3(0, 3.0, -1.1);
  const d = e.clone().sub(a);
  b.part(new THREE.CylinderGeometry(0.035, 0.045, d.length(), 6), P.woodDark, {
    bone, at: a.clone().add(e).multiplyScalar(0.5), dir: d.clone().normalize(),
  });
  for (const t of [0.35, 0.62, 0.88]) {
    const p = a.clone().addScaledVector(d, t);
    b.part(new THREE.BoxGeometry(0.4 - t * 0.1, 0.035, 0.035), P.woodDark, { bone, at: p });
  }
  b.part(new THREE.SphereGeometry(0.05, 6, 5), P.wood, { bone, at: e });
}
    return buildSmock;
  })(),
  // sails
  (() => {
function buildSails({ b, J, P, M }: Ctx) {
  const bone = J.sailAxle;
  const hub = M.capHub;
  const Z0 = hub[2];
  const R = rng(5);
  void frame;
  void R;

  // Place a box in the sail plane. (u,v) are blade-local: u along the blade, v across.
  // Blade angle a: direction d=(cos a, sin a), perpendicular p=(-sin a, cos a).
  const box = (a: number, u: number, v: number, dz: number, lu: number, lv: number, th: number, color: string) => {
    const c = Math.cos(a), s = Math.sin(a);
    const x = hub[0] + c * u - s * v;
    const y = hub[1] + s * u + c * v;
    const g = new THREE.BoxGeometry(lu, lv, th);
    b.part(g, color, {
      bone,
      at: [x, y, Z0 + dz],
      rotation: [0, 0, (a * 180) / Math.PI - 90 + 90],
    });
  };

  const dot = (a: number, u: number, v: number, dz: number, r: number, color: string) => {
    const c = Math.cos(a), s = Math.sin(a);
    b.part(new THREE.CylinderGeometry(r, r, 0.03, 8), color, {
      bone,
      at: [hub[0] + c * u - s * v, hub[1] + s * u + c * v, Z0 + dz],
      rotation: [90, 0, 0],
    });
  };

  const r0 = 0.1, r1 = 1.45;
  const wRoot = 0.34, wTip = 0.24;
  const widthAt = (u: number) => wRoot + (wTip - wRoot) * ((u - r0) / (r1 - r0));

  for (const deg of [45, 135, 225, 315]) {
    const a = (deg * Math.PI) / 180;
    // Spar: thin central beam (cream) running full length
    const L = r1 - r0;
    box(a, (r0 + r1) / 2, 0, 0, L, 0.05, 0.1, P.sailFrame);
    // Side rails forming the frame taper
    for (const sd of [1, -1]) {
      const c = Math.cos(a), s = Math.sin(a);
      const mid = (r0 + r1) / 2;
      const vOff = sd * (widthAt(mid) / 2);
      const x = hub[0] + c * mid - s * vOff;
      const y = hub[1] + s * mid + c * vOff;
      const taper = Math.atan2((wRoot - wTip) / 2, L) * sd;
      b.part(new THREE.BoxGeometry(L, 0.035, 0.08), P.sailFrame, {
        bone,
        at: [x, y, Z0],
        rotation: [0, 0, (a * 180) / Math.PI + (taper * 180) / Math.PI],
      });
    }
    // Crossbars: 4 evenly spaced, with stud at ends
    const bars: number[] = [];
    for (let i = 0; i < 4; i++) bars.push(r0 + (L * (i + 0.5)) / 4 + 0.0);
    // Bars positions refined: at 0.1+L*(i+1)/4 approx
    const barU = [0.1 + L * 0.0 + 0.02, 0.1 + L * 0.34, 0.1 + L * 0.67, r1 - 0.03];
    barU.forEach((u) => {
      const w = widthAt(u);
      b.part(new THREE.BoxGeometry(0.05, w, 0.09), P.sailFrame, {
        bone,
        at: [
          hub[0] + Math.cos(a) * u,
          hub[1] + Math.sin(a) * u,
          Z0,
        ],
        rotation: [0, 0, (a * 180) / Math.PI],
      });
      for (const sd of [1, -1]) dot(a, u, sd * w / 2, 0.055, 0.022, P.sailFrame);
    });
    // Cloth panels in alternating slots: 3 patches between the 4 bars
    for (let i = 0; i < 3; i++) {
      const ua = barU[i] + 0.04, ub = barU[i + 1] - 0.04;
      const um = (ua + ub) / 2;
      const w = widthAt(um) - 0.1;
      // Cloth on the front (slightly proud) with a rounded-feel chamfer via a second smaller slab
      box(a, um, 0, -0.01, ub - ua, w, 0.04, P.sailCloth);
      box(a, um, 0, 0.012, ub - ua - 0.05, w - 0.05, 0.03, P.sailCloth);
    }
    // Tip cap
    box(a, r1 + 0.02, 0, 0, 0.07, wTip + 0.04, 0.1, P.trim ?? P.sailFrame);
    dot(a, r1 + 0.06, 0, 0.055, 0.03, P.sailFrame);
  }

  // Small cross-binding at the hub
  b.part(new THREE.CylinderGeometry(0.14, 0.14, 0.1, 12), P.sailFrame, {
    bone,
    at: [hub[0], hub[1], Z0 + 0.0],
    rotation: [90, 0, 0],
  });
  b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 8), P.axle, {
    bone,
    at: [hub[0], hub[1], Z0 + 0.07],
    rotation: [90, 0, 0],
  });
}
    return buildSails;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "starryMill" });
  const J: Record<string, Joint> = {};
  J["mill"] = b.joint("mill", { at: [0,0.05,0], dir: [0,1,0], role: "spine" });
  J["sailAxle"] = b.joint("sailAxle", { parent: J["mill"], at: [0,3.62,0.55], dir: [0,0,1], role: "hinge", group: "sails" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
