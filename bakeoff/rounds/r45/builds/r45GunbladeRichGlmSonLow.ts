import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng, catmull } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Lionheart Gunblade",
  "description": "A Final Fantasy style gunblade standing upright on its pommel: a chrome revolve-chamber below, a long blued blade above, trimmed in gold with a crimson lion emblem and glowing runes."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  steel: "#8d9aa8",
  steelDark: "#4a5361",
  steelInk: "#20242c",
  gold: "#d8a833",
  goldDark: "#8a6414",
  crimson: "#a3202a",
  gripLeather: "#3a2620",
  gripWrap: "#6b4a32",
  bone: "#e8dcc4",
  runeGlow: "#ffb347",
  silver: "#c9d2dc",
};
const M = {
  pommelBase: [0, 0.02, 0] as [number, number, number],
  gripTop: [0, 0.55, 0] as [number, number, number],
  cylinderAxis: [0, 0.65, 0] as [number, number, number],
  barrelRoot: [0, 0.78, 0] as [number, number, number],
  bladeRoot: [0, 0.95, 0] as [number, number, number],
  guardTop: [0, 1.05, 0] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // grip
  (() => {
function buildGrip({ b, J, P, M }: any) {
  const hilt = J.hilt;
  const trig = J.trigger;
  const INK = P.steelInk;
  const r = rng(5);

  // Pommel: gold ring under, steel frustum cap
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.02, 8), P.gold, { bone: hilt, at: [0, 0.01, 0] });
  b.part(new THREE.CylinderGeometry(0.115, 0.07, 0.1, 8), P.steel, { bone: hilt, at: [0, 0.07, 0], flat: true });
  b.part(new THREE.CylinderGeometry(0.075, 0.115, 0.03, 8), P.steelDark, { bone: hilt, at: [0, 0.135, 0], flat: true });
  b.part(new THREE.TorusGeometry(0.08, 0.008, 4, 8), P.gold, { bone: hilt, at: [0, 0.15, 0], rotation: [90, 0, 0] });

  // Lion-face studs on each flank
  for (const s of [1, -1]) {
    const x = s * 0.1;
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.012, 8), P.gold, { bone: hilt, at: [x, 0.075, 0], dir: [s, 0, 0] });
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.006, 6), P.goldDark, { bone: hilt, at: [s * 0.107, 0.075, 0], dir: [s, 0, 0] });
    for (const e of [1, -1])
      b.part(new THREE.SphereGeometry(0.005, 4, 3), INK, { bone: hilt, at: [s * 0.111, 0.082, e * 0.009] });
    b.part(new THREE.BoxGeometry(0.004, 0.008, 0.012), INK, { bone: hilt, at: [s * 0.111, 0.063, 0] });
  }

  // Grip column
  b.frustumBox([0, 0.16, 0], [0, 0.55, 0], [0.13, 0.12], [0.11, 0.1], { bone: hilt, color: P.gripLeather });
  for (let i = 0; i < 4; i++) {
    const y = 0.2 + i * 0.075;
    const w = 0.136 - i * 0.004;
    b.part(new THREE.BoxGeometry(w + 0.012, 0.022, w - 0.008), P.gripWrap, { bone: hilt, at: [0, y, 0], flat: true });
    b.part(new THREE.BoxGeometry(w + 0.014, 0.004, w - 0.006), INK, { bone: hilt, at: [0, y - 0.013, 0] });
  }
  // gold wire band near top
  b.part(new THREE.BoxGeometry(0.128, 0.016, 0.108), P.gold, { bone: hilt, at: [0, 0.5, 0], flat: true });
  b.part(new THREE.BoxGeometry(0.132, 0.014, 0.112), P.goldDark, { bone: hilt, at: [0, 0.52, 0], flat: true });

  // Crimson cord knot with tails
  b.part(new THREE.SphereGeometry(0.03, 6, 5), P.crimson, { bone: hilt, at: [0.04, 0.45, -0.065], scale: [1, 0.9, 0.8] });
  b.part(new THREE.TorusGeometry(0.03, 0.007, 4, 8), P.crimson, { bone: hilt, at: [0, 0.455, -0.06], rotation: [0, 0, 0] });
  for (const s of [1, -1]) {
    b.rod([s * 0.04, 0.44, -0.07], [s * 0.065, 0.33, -0.085], 0.007, P.crimson, { bone: hilt });
    b.part(new THREE.SphereGeometry(0.011, 5, 4), P.gold, { bone: hilt, at: [s * 0.067, 0.322, -0.086] });
  }

  // Trigger guard: arc from grip front down and forward to front post
  const path = catmull([
    [0, 0.5, 0.06],
    [0, 0.4, 0.1],
    [0, 0.25, 0.145],
    [0, 0.15, 0.13],
    [0, 0.11, 0.1],
    [0, 0.1, 0.07],
  ].map((p) => p));
  // keep guard lowest curve near floor: shape in YZ plane (flat in side view), swept faceted
  b.sweep(path, 0.014, { bone: hilt, color: P.gold, section: { ngon: 6 }, caps: "round" });
  // front post
  b.part(new THREE.CylinderGeometry(0.02, 0.022, 0.1, 8), P.gold, { bone: hilt, at: [0, 0.3, 0.14], flat: true });
  b.part(new THREE.SphereGeometry(0.024, 6, 4), P.gold, { bone: hilt, at: [0, 0.35, 0.14] });
  // Rear top ring where guard meets gripTop
  b.part(new THREE.TorusGeometry(0.028, 0.01, 5, 8), P.gold, { bone: hilt, at: [0, 0.52, 0.065], rotation: [0, 90, 0] });
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.012, 8), P.goldDark, { bone: hilt, at: [0, 0.54, 0.06] });

  // Trigger: crimson-steel hook
  const hook = catmull([
    [0, 0.4, 0.09],
    [0, 0.35, 0.098],
    [0, 0.3, 0.1],
    [0, 0.27, 0.085],
  ]);
  b.sweep(hook, [0.014, 0.008], { bone: trig, color: P.crimson, section: { ngon: 5 }, caps: "point" });
  b.part(new THREE.BoxGeometry(0.004, 0.1, 0.012), INK, { bone: trig, at: [0, 0.35, 0.087] });
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.034, 6), P.silver, { bone: trig, at: [0, 0.4, 0.09], rotation: [0, 0, 90] });
  // rivets on guard
  for (const y of [0.45, 0.2])
    for (const s of [1, -1])
      b.part(new THREE.SphereGeometry(0.006, 4, 3), P.goldDark, { bone: hilt, at: [s * 0.012, y, y > 0.3 ? 0.085 : 0.145] });
  void r; void frame; void M;
}
    return buildGrip;
  })(),
  // mechanism
  (() => {
function buildMechanism({ b, J, P, M }: any) {
  const hilt = J.hilt, hammer = J.hammer, cyl = J.cylinder;
  const R = rng(5);
  const GOLD = P.gold, STEEL = P.steel, DARK = P.steelDark, INK = P.steelInk;
  const CRIM = P.crimson, SILVER = P.silver;
  const cy = M.cylinderAxis[1];

  // ---- Revolver drum (spins on cylinder joint) ----
  const drum = (r0: number, r1: number, h: number, y: number, col: string, seg = 6) =>
    b.part(new THREE.CylinderGeometry(r0, r1, h, seg), col, { bone: cyl, at: [0, y, 0], flat: true });
  drum(0.13, 0.13, 0.2, cy, DARK);
  drum(0.125, 0.135, 0.02, cy + 0.11, STEEL);
  drum(0.135, 0.125, 0.02, cy - 0.11, STEEL);
  drum(0.07, 0.09, 0.012, cy + 0.126, SILVER, 6);
  for (const dy of [0.075, -0.075]) drum(0.138, 0.138, 0.018, cy + dy, GOLD, 6);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
    const dir = [Math.sin(a), 0, Math.cos(a)];
    const rr = 0.135;
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 8), i === 0 ? INK : DARK, {
      bone: cyl, at: [dir[0] * rr, cy + 0.01, dir[2] * rr], dir: [dir[0], 0, dir[2]],
    });
    b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.034, 8), INK, {
      bone: cyl, at: [dir[0] * (rr + 0.004), cy + 0.01, dir[2] * (rr + 0.004)], dir: [dir[0], 0, dir[2]],
    });
    if (i === 1)
      b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.012, 10), GOLD, {
        bone: cyl, at: [dir[0] * (rr + 0.016), cy + 0.01, dir[2] * (rr + 0.016)], dir: [dir[0], 0, dir[2]],
      });
  }

  // ---- Body block under drum / on grip top ----
  b.part(new THREE.BoxGeometry(0.2, 0.06, 0.2), DARK, { bone: hilt, at: [0, 0.56, 0], flat: true });
  b.part(new THREE.BoxGeometry(0.22, 0.02, 0.22), GOLD, { bone: hilt, at: [0, 0.59, 0] });

  // ---- Barrel housing ----
  b.part(new THREE.BoxGeometry(0.15, 0.22, 0.16), STEEL, { bone: hilt, at: [0, 0.86, 0.02], flat: true });
  b.part(new THREE.BoxGeometry(0.1, 0.1, 0.1), STEEL, { bone: hilt, at: [0, 0.97, 0.02], flat: true });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.014, 0.2, 0.15), INK, { bone: hilt, at: [s * 0.082, 0.86, 0.02] });
    for (let k = 0; k < 3; k++) {
      b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.012, 6), SILVER, {
        bone: hilt, at: [s * 0.091, 0.8 + k * 0.06, 0.02 + (k % 2 ? 0.04 : -0.04)], dir: [s, 0, 0],
      });
    }
  }
  b.part(new THREE.BoxGeometry(0.01, 0.06, 0.06), GOLD, { bone: hilt, at: [-0.092, 0.86, 0.02] });

  // ---- Muzzle ring & bore ----
  b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 10), GOLD, { bone: hilt, at: [0, 0.93, 0.105], dir: [0, 0, 1] });
  b.part(new THREE.CylinderGeometry(0.026, 0.026, 0.036, 8), INK, { bone: hilt, at: [0, 0.93, 0.108], dir: [0, 0, 1] });
  b.part(new THREE.SphereGeometry(0.012, 6, 4), P.bone, { bone: hilt, at: [0, 1.0, 0.095] });

  // ---- Hammer ----
  const hp = [0, 0.62, -0.12];
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.16, 8), GOLD, { bone: hilt, at: [0, 0.66, -0.1], dir: [1, 0, 0] });
  b.part(new THREE.BoxGeometry(0.05, 0.09, 0.08), DARK, { bone: hilt, at: [0, 0.65, -0.1] });
  b.part(new THREE.BoxGeometry(0.045, 0.07, 0.05), STEEL, { bone: hammer, at: [0, 0.66, -0.15], flat: true });
  b.part(new THREE.ConeGeometry(0.03, 0.2, 5), STEEL, { bone: hammer, at: [0, 0.73, -0.2], dir: [0, 0.6, -0.8], flat: true });
  b.part(new THREE.BoxGeometry(0.052, 0.012, 0.12), CRIM, { bone: hammer, at: [0, 0.725, -0.185], dir: [0, 0.6, -0.8] });
  b.part(new THREE.SphereGeometry(0.025, 6, 4), GOLD, { bone: hammer, at: hp });

  // ---- Lion emblem on front-right (viewer-left, -X ... right flank = -X) ----
  const ex = -0.095, ey = 0.84;
  const out = [-1, 0, 0];
  const shield: any = [[-0.08, 0.1], [0.08, 0.1], [0.08, -0.02], [0, -0.1, "sharp"], [-0.08, -0.02]];
  const ex2 = { x: [0, 0, 1], y: [0, 1, 0] };
  const plate = (o: any, t: number, x: number, y: number, c: string, dz = 0) =>
    b.extrude(o, { at: [ex - dz, ey + y, 0.02 + x], x: [0, 0, 1], y: [0, 1, 0], thickness: t, color: c, bone: hilt });
  // outline then plate (extruded along x*y => -X? x=z,y=up => z cross y = -x)
  const rect = (w: number, h: number): any => [[-w, h], [w, h], [w, -h], [-w, -h]];
  const ring = (n: number, r: number): any => Array.from({ length: n }, (_, i) => [Math.cos((i / n) * 6.283) * r, Math.sin((i / n) * 6.283) * r]);
  b.extrude(shield.map((p: any) => [p[0] * 1.1, p[1] * 1.1 + (p[1] > 0 ? 0.004 : -0.004), ...(p[2] ? [p[2]] : [])]), { at: [ex + 0.006, ey, 0.02], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.01, color: INK, bone: hilt });
  plate(shield, 0.014, 0, 0, CRIM, 0.004);
  const L = 0.016;
  plate(ring(10, 0.06), 0.01, 0, 0.015, GOLD, 0.004 + L * 0.5);
  plate(ring(8, 0.045), 0.01, 0, 0.015, CRIM, 0.004 + L * 0.9);
  plate(ring(8, 0.032), 0.012, 0, 0.012, GOLD, 0.004 + L * 1.3);
  plate([[-0.025, 0.012], [0.025, 0.012], [0.015, -0.03], [-0.015, -0.03]], 0.012, 0, 0, CRIM, 0.004 + L * 1.7);
  plate([[-0.01, -0.02], [0.01, -0.02], [0.012, -0.03], [-0.012, -0.03]], 0.012, 0, 0, INK, 0.004 + L * 2.1);
  for (const s of [1, -1]) {
    plate([[0, 0], [0.03, 0], [0.015, 0.035]], 0.012, s * 0.045, 0.045, GOLD, 0.004 + L * 1.1);
    b.part(new THREE.SphereGeometry(0.008, 6, 4), GOLD, { bone: hilt, at: [ex - 0.03, ey + 0.03, 0.02 + s * 0.017] });
  }
  void R; void out; void ex2; void rect;
}
    return buildMechanism;
  })(),
  // guard
  (() => {
function buildGuard({ b, J, P, M }: Ctx) {
  const bone = J.hilt;
  const GOLD = P.gold, DARK = P.goldDark, INK = P.steelInk, STEEL = P.steel, CR = P.crimson;
  const cx = M.guardTop[0], gy = M.guardTop[1];

  // Collar: faceted lathe gripping the blade root
  b.lathe(
    [[0, -0.05], [0.085, -0.05], [0.095, -0.03], [0.095, 0.03], [0.08, 0.05], [0, 0.05]],
    { at: [cx, gy, 0], axis: [0, 1, 0], segments: 8, bone, color: GOLD, name: "guardCollar" },
  );
  // Dark seam rings above and below
  for (const dy of [-0.052, 0.052]) {
    b.lathe([[0.0, 0], [0.078, 0], [0.078, 0.008], [0, 0.008]], {
      at: [cx, gy + dy - 0.004, 0], segments: 8, bone, color: DARK, name: "guardSeam",
    });
  }

  // Eight ink studs around the collar
  const ringLine = frame([cx, gy, 0], [0, 1, 0]);
  b.ring(ringLine, { count: 8, radius: 0.095, fromDeg: 0, toDeg: 315 }, (it) => {
    b.stick(new THREE.CylinderGeometry(0.009, 0.009, 0.012, 6), INK, it, { embed: 0.3, bone });
  });

  // Crimson gem with gold bezel at front centre
  const gemAt: [number, number, number] = [cx, gy, 0.1];
  b.part(new THREE.CylinderGeometry(0.03, 0.034, 0.018, 8), GOLD, { at: gemAt, dir: [0, 0, 1], bone, name: "gemBezel" });
  b.part(new THREE.OctahedronGeometry(0.026), CR, { at: [cx, gy, 0.115], bone, scale: [1, 1.3, 0.8], name: "gem" });

  // Swept wings, mirrored
  const wing: [number, number, string?][] = [
    [0, 0.0], [0.07, 0.02], [0.15, -0.03], [0.22, -0.11, "sharp"],
    [0.15, -0.1], [0.1, -0.075], [0.05, -0.06], [0, -0.05],
  ] as any;
  for (const s of [1, -1]) {
    b.extrude(wing as any, {
      at: [s * 0.08, gy - 0.02, -0.01], x: [s, 0, 0], y: [0, 1, -0.35],
      thickness: [0.05, 0.015], bevel: 0.006, smoothing: 2, color: GOLD, bone, name: "guardWing",
    });
    // dark inlay line along wing
    b.rod([s * 0.1, gy - 0.035, -0.02], [s * 0.2, gy - 0.1, -0.06], 0.006, DARK, { bone, sides: 6 });
    // shoulder bolt
    b.part(new THREE.SphereGeometry(0.014, 6, 4), STEEL, { at: [s * 0.1, gy - 0.03, 0.02], bone });
  }

  // Front bar above the muzzle ring
  b.frustumBox([-0.17, gy - 0.075, 0.12], [0.17, gy - 0.075, 0.12], [0.03, 0.03], [0.03, 0.03], { bone, color: GOLD });
  for (const s of [1, -1]) {
    b.spike([s * 0.17, gy - 0.075, 0.12], [s, 0, 0], 0.05, 0.016, { bone, color: GOLD });
  }
  b.part(new THREE.BoxGeometry(0.1, 0.008, 0.008), DARK, { at: [0, gy - 0.075, 0.138], bone });

  // Cooling fins stepping down the housing
  for (let i = 0; i < 3; i++) {
    const w = 0.15 - i * 0.025;
    b.extrude(
      [[-w, 0], [w, 0], [w - 0.02, -0.03], [-w + 0.02, -0.03]],
      { at: [0, gy - 0.07 - i * 0.045, 0.0], x: [1, 0, 0], thickness: 0.2 - i * 0.02, bone, color: i % 2 ? STEEL : P.silver, name: "coolFin" },
    );
  }
}
    return buildGuard;
  })(),
  // blade
  (() => {
function buildBlade({ b, J, P, M }: Ctx) {
  const bone = J.bladeJ;
  const Y0 = 1.05, Y1 = 2.2, L = Y1 - Y0;
  const T = 0.035;
  // half width profile along height (v from 0 at root to L)
  const hw = (v: number) => {
    const t = v / L;
    if (t < 0.4) return 0.055 + (0.07 - 0.055) * (t / 0.4);
    const k = (t - 0.4) / 0.6;
    return 0.07 * (1 - k * k * 0.15) * (1 - k) + 0.004;
  };
  // S recurve on the +X edge
  const curve = (v: number) => 0.008 * Math.sin((v / L) * Math.PI * 2);
  const N = 14;
  const pts: [number, number, ("sharp")?][] = [];
  const right: [number, number][] = [];
  const left: [number, number][] = [];
  for (let i = 0; i <= N; i++) {
    const v = Math.min(L * 0.93, (i / N) * L * 0.93);
    right.push([hw(v) + curve(v), v]);
    left.push([-hw(v), v]);
  }
  const tipV = L;
  const outline: any[] = [];
  for (const p of left) outline.push([p[0], p[1]]);
  outline.push([0.0, tipV, "sharp"]);
  for (let i = right.length - 1; i >= 0; i--) outline.push(right[i]);
  // leftmost-first order goes up the left, tip, down the right: valid loop
  const at: [number, number, number] = [0, Y0, 0];
  const X = [1, 0, 0] as [number, number, number];
  b.extrude(outline, { at, x: X, y: [0, 1, 0], thickness: T, bevel: 0.006, color: P.steel, bone });

  // fuller rail
  const fl = L * 0.72;
  b.extrude(
    [[-0.014, 0.04], [0.014, 0.04], [0.01, fl], [0, fl + 0.05, "sharp"], [-0.01, fl]],
    { at: [0, Y0, T / 2 - 0.002], x: X, thickness: 0.012, color: P.steelDark, bone },
  );
  b.extrude(
    [[-0.004, 0.06], [0.004, 0.06], [0.003, fl - 0.04], [-0.003, fl - 0.04]],
    { at: [0, Y0, T / 2 + 0.008], x: X, thickness: 0.006, color: P.silver, bone },
  );

  // silver edge inlay along +X edge
  for (let i = 0; i < N; i++) {
    const a = right[i], c = right[i + 1];
    b.rod([a[0] - 0.004, Y0 + a[1], 0], [c[0] - 0.004, Y0 + c[1], 0], 0.0045, P.silver, { bone });
  }
  // tip silver cap
  const capV = L - 0.2;
  const cap: any[] = [];
  const capPts = [];
  for (let i = 0; i <= 6; i++) {
    const v = capV + (i / 6) * 0.2 * 0.93;
    capPts.push(v);
  }
  b.extrude(
    [[-hw(capV) - 0.001, capV], [hw(capV) + curve(capV) + 0.001, capV], [0.0, tipV + 0.002, "sharp"]],
    { at: [0, Y0, 0], x: X, thickness: T + 0.006, color: P.silver, bone },
  );
  b.spike([0, Y0 + tipV - 0.04, 0], [0, 1, 0], 0.05, 0.012, { color: P.silver, bone });

  // gold serration wedges on back edge
  for (let i = 0; i < 3; i++) {
    const v = 0.42 + i * 0.1;
    const x = -hw(v);
    b.extrude([[0, 0], [-0.03, -0.012], [0, -0.04, "sharp"]].map((p) => [p[0], p[1]] as [number, number]), {
      at: [x, Y0 + v + 0.02, 0], x: X, thickness: T + 0.008, color: P.gold, bone,
    });
  }

  // ricasso band
  b.part(new THREE.BoxGeometry(0.125, 0.026, T + 0.014), P.gold, { at: [0, Y0 + 0.09, 0], bone });
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(0.012, 0.03, T + 0.02), P.goldDark, { at: [s * 0.055, Y0 + 0.09, 0], bone });

  // balance hole frame
  const hy = Y0 + 0.62;
  const fz = T / 2 + 0.004;
  const fw = 0.04, fh = 0.09, ft = 0.01;
  b.part(new THREE.BoxGeometry(fw, ft, 0.008), P.steelDark, { at: [0, hy + fh / 2, fz], bone });
  b.part(new THREE.BoxGeometry(fw, ft, 0.008), P.steelDark, { at: [0, hy - fh / 2, fz], bone });
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(ft, fh, 0.008), P.steelDark, { at: [s * fw / 2, hy, fz], bone });
  b.part(new THREE.BoxGeometry(fw - ft, fh - ft, 0.004), P.steelInk, { at: [0, hy, fz - 0.002], bone });
  b.part(new THREE.BoxGeometry(fw - ft, fh - ft, 0.004), P.steelInk, { at: [0, hy, -fz + 0.002], bone });
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(fw, fh + 0.02, 0.006), P.steelInk, { at: [0, hy, -fz], bone });
}
    return buildBlade;
  })(),
  // runes
  (() => {
function buildRunes({ b, J, P, M }: Ctx) {
  const R = rng(5);
  const FACE = 0.0225; // blade half thickness (front face z)

  // ---- rune glyph outlines (drawn in x,y meters, centred) ----
  const S = 0.05;
  const glyphs: [number, number][][] = [
    // chevron
    [[-S, -S * 0.6], [0, S * 0.6], [S, -S * 0.6], [S, -S * 0.1], [0, S * 1.1], [-S, -S * 0.1]].map(
      ([x, y]) => [x, y] as [number, number]),
    // triangle
    [[-S, -S * 0.8], [S, -S * 0.8], [0, S]],
    // cross
    [[-0.012, -S], [0.012, -S], [0.012, -0.012], [S, -0.012], [S, 0.012], [0.012, 0.012], [0.012, S], [-0.012, S],
      [-0.012, 0.012], [-S, 0.012], [-S, -0.012], [-0.012, -0.012]],
    // bar pair (as a connected H-like shape)
    [[-S, -S], [-0.02, -S], [-0.02, -0.01], [0.02, -0.01], [0.02, -S], [S, -S], [S, S], [0.02, S], [0.02, 0.01],
      [-0.02, 0.01], [-0.02, S], [-S, S]],
    // diamond
    [[0, -S * 1.1], [S * 0.8, 0], [0, S * 1.1], [-S * 0.8, 0]],
  ];

  const ys = [1.27, 1.48, 1.68, 1.86, 2.0];
  glyphs.forEach((g, i) => {
    const cy = ys[i];
    const cx = 0.0;
    // outline plate: scaled-up copy behind
    const scaled = g.map(([x, y]) => [x * 1.35, y * 1.35] as [number, number]);
    b.extrude(scaled, {
      at: [cx, cy, FACE + 0.0005],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.004,
      color: P.steelInk,
      bone: J.bladeJ,
    });
    glow(
      b.extrude(g, {
        at: [cx, cy, FACE + 0.003],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.006,
        bevel: 0.0015,
        color: P.runeGlow,
        bone: J.bladeJ,
      }),
      1.6,
    );
  });

  // ---- glow seam around the collar ----
  const seamY = 1.04;
  glow(
    b.part(new THREE.CylinderGeometry(0.058, 0.062, 0.012, 8), P.runeGlow, {
      at: [0, seamY, 0],
      bone: J.bladeJ,
    }),
    1.4,
  );
  // front glowing strip beneath rune march
  glow(
    b.part(new THREE.BoxGeometry(0.05, 0.01, 0.006), P.runeGlow, {
      at: [0, 1.1, FACE + 0.003],
      bone: J.bladeJ,
    }),
    1.2,
  );

  // ---- battle scar: silver diagonal on fuller rail ----
  b.extrude(
    [[-0.03, -0.004], [0.03, 0.05], [0.032, 0.058], [-0.028, 0.004]],
    {
      at: [0, 1.55, FACE + 0.0045],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.003,
      color: P.silver,
      bone: J.bladeJ,
    },
  );

  // ---- tassel hanging from pommel ring ----
  const cordX = [-0.05, 0, 0.05];
  const cordLen = [0.14, 0.19, 0.14];
  cordX.forEach((x, i) => {
    const top: [number, number, number] = [x, 0.03, 0.0 + (i === 1 ? 0.14 : 0.13) * 0 + 0.1];
    const len = cordLen[i];
    const bot: [number, number, number] = [x * 1.2, 0.03, top[2] + 0.0];
    // cords hang from a ring at the front of the pommel, drooping down to near floor
    const topP: [number, number, number] = [x, 0.05, 0.12];
    const midP: [number, number, number] = [x * 1.1, 0.05 - len * 0.5, 0.125];
    const endP: [number, number, number] = [x * 1.2, 0.05 - len * 0.9, 0.125];
    void top; void bot;
    b.rod(topP, midP, 0.0045, P.bone, { bone: J.hilt });
    b.rod(midP, endP, 0.0045, P.bone, { bone: J.hilt });
    // gold cap bead at top
    b.part(new THREE.SphereGeometry(0.01, 6, 4), P.gold, { at: topP, bone: J.hilt });
    // crimson tip
    const tipEnd: [number, number, number] = [endP[0] * 1.02, Math.max(endP[1] - 0.04, 0.005), endP[2]];
    b.spike(endP, tipEnd, null, 0.008, { color: P.crimson, bone: J.hilt });
    b.part(new THREE.SphereGeometry(0.007, 6, 4), P.gold, { at: endP, bone: J.hilt });
  });
  // small gold knot bar joining cords
  b.rod([-0.06, 0.05, 0.12], [0.06, 0.05, 0.12], 0.006, P.goldDark, { bone: J.hilt });
}
    return buildRunes;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "gunblade" });
  const J: Record<string, Joint> = {};
  J["hilt"] = b.joint("hilt", { at: [0,0.3,0], dir: [0,1,0], role: "spine" });
  J["hammer"] = b.joint("hammer", { parent: J["hilt"], at: [0,0.62,-0.12], dir: [0,0.6,-0.8], role: "hinge" });
  J["trigger"] = b.joint("trigger", { parent: J["hilt"], at: [0,0.34,0.09], dir: [0,1,0.2], role: "hinge" });
  J["cylinder"] = b.joint("cylinder", { parent: J["hilt"], at: [0,0.65,0], dir: [0,1,0], role: "hinge" });
  J["bladeJ"] = b.joint("bladeJ", { parent: J["hilt"], at: [0,1,0], dir: [0,1,0], role: "spine" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
