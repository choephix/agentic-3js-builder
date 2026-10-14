```ts
import * as THREE from "three";
import { createBuilder, catmull, svg, mottle, spots, stripes } from "agentic-3js-builder";

export const meta = {
  name: "Battle-worn Knight",
  description:
    "A rigged knight in dented plate armour with a great helm and crimson plume, filigreed layered pauldrons, a blue griffin surcoat, a kite shield, a planted broadsword and a torn crimson cape.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "knight" });

  // ---------- palette & paints ----------
  const GOLD = "#d9a82e";
  const base0 = mottle("#9ea7b1", "#7d8791", { size: 0.12, contrast: 0.7, seed: 1 });
  const rusty = spots(base0, "#6e4a35", { size: 0.07, amount: 0.12, seed: 5 });
  const dented = spots(rusty, "#4f565e", { size: 0.03, amount: 0.1, seed: 2 });
  const steel = stripes(dented, "#e3e7ea", { size: 0.06, width: 0.05, wobble: 1.2, axis: [1, 0.6, 0.2], seed: 3 });
  const darkSteel = mottle("#626a73", "#474e56", { size: 0.08, seed: 4 });
  const goldP = mottle("#e3b53c", "#b88a1f", { size: 0.03, seed: 6 });
  const goldBand = stripes(steel, GOLD, { size: 0.03, width: 0.22, axis: "y", wobble: 0.2, seed: 8 });
  const blue = mottle("#233f88", "#1a2f68", { size: 0.08, seed: 7 });
  const crimson = mottle("#a31d28", "#6f1019", { size: 0.06, seed: 9 });
  const crimsonDark = mottle("#6b0f18", "#4a0a11", { size: 0.06, seed: 10 });
  const plumeP = mottle("#b6212d", "#7a1119", { size: 0.04, seed: 11 });
  const leather = "#4a3322";
  const black = "#14161a";

  // ---------- textures ----------
  const griffin = svg(
    `<svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
    <g fill="#d8dee6" stroke="#f2c94c" stroke-width="2.2" stroke-linejoin="round">
      <path d="M44 62 C30 40 18 28 6 14 C20 16 28 16 36 10 C34 22 44 24 52 20 C50 32 58 36 64 34 C60 46 62 56 58 66 Z"/>
      <path d="M76 72 C90 70 94 58 90 46 C98 56 98 74 80 84 Z"/>
      <path d="M46 56 C58 50 74 56 76 72 C78 86 70 96 62 98 L66 112 L54 112 L52 100 L40 100 L36 112 L24 112 L30 96 C40 90 40 70 46 56 Z"/>
      <path d="M62 78 L80 66 L84 72 L68 90 Z"/>
      <path d="M44 56 C40 44 42 34 52 30 C58 28 66 30 72 36 L86 41 L72 46 C68 54 60 58 50 60 Z"/>
      <path d="M52 30 L48 18 L58 26 Z"/>
    </g>
    <circle cx="62" cy="38" r="2.4" fill="#1a2f68"/>
    </svg>`,
    { size: 256 },
  );
  const filigree = svg(
    `<svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" stroke="#f0c040" stroke-width="3" stroke-linecap="round">
      <path d="M50 70 C50 40 50 30 50 10"/>
      <path d="M50 50 C30 50 18 38 24 26 C30 18 40 24 36 32"/>
      <path d="M50 50 C70 50 82 38 76 26 C70 18 60 24 64 32"/>
      <path d="M50 66 C34 68 14 60 10 46"/>
      <path d="M50 66 C66 68 86 60 90 46"/>
      <path d="M50 30 C42 24 42 14 50 8 C58 14 58 24 50 30"/>
    </g></svg>`,
    { size: 256 },
  );

  // ---------- helpers ----------
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const sph = (r: number) => new THREE.SphereGeometry(r, 10, 8);
  const cyl = (r0: number, r1: number, h: number, s = 10) => new THREE.CylinderGeometry(r0, r1, h, s);
  const P = (g: THREE.BufferGeometry, color: any, at: number[], bone: string, o: any = {}) =>
    b.part(g, color, { at, bone, flat: true, ...o });
  const caps = (a: number[], c: number[], r: number | [number, number], color: any, bone: string) =>
    b.capsule(a, c, r, { color, bone, sides: 8 });

  // ---------- skeleton ----------
  b.joint("hips", { at: [0, 1.0, 0], role: "spine" });
  b.chain("spine", [[0, 1.0, 0], [0, 1.2, 0], [0, 1.42, 0]], {
    parent: "hips", role: "spine", names: ["spine1", "spine2"],
  });
  b.joint("neck", { parent: "spine2", at: [0, 1.48, 0], role: "neck" });
  b.joint("head", { parent: "neck", at: [0, 1.6, 0], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 1.6, -0.02], role: "jaw" });

  const sides: Array<[string, number]> = [["L", 1], ["R", -1]];
  for (const [n, x] of sides) {
    b.chain(`leg${n}`, [[x * 0.1, 0.97, 0], [x * 0.105, 0.52, 0.02], [x * 0.105, 0.09, -0.01], [x * 0.105, 0.045, 0.16]], {
      parent: "hips", role: "leg", names: [`hip${n}`, `knee${n}`, `ankle${n}`, `toe${n}`],
    });
    b.chain(`arm${n}`, [[x * 0.27, 1.45, 0], [x * 0.4, 1.2, 0.07], [x * 0.47, 0.95, 0.12], [x * 0.48, 0.89, 0.14]], {
      parent: "spine2", role: "arm", names: [`shoulder${n}`, `elbow${n}`, `wrist${n}`, `hand${n}`],
    });
    const hx = x * 0.48;
    [0.875, 0.9, 0.925, 0.95].forEach((y, i) => {
      b.joint(`finger${n}${i + 1}`, { parent: `hand${n}`, at: [hx, y, 0.18], role: "digit" });
    });
    b.joint(`thumb${n}`, { parent: `hand${n}`, at: [hx + x * 0.04, 0.92, 0.17], role: "digit" });
  }

  // ---------- torso ----------
  P(sph(1), steel, [0, 1.0, 0], "hips", { scale: [0.19, 0.12, 0.14] });
  P(cyl(0.15, 0.17, 0.22, 10), darkSteel, [0, 1.12, 0], "spine1");
  P(sph(1), steel, [0, 1.29, 0], "spine2", { scale: [0.205, 0.26, 0.16] });
  // belt
  P(cyl(0.195, 0.195, 0.05, 12), leather, [0, 1.03, 0], "hips");
  P(box(0.06, 0.045, 0.02), goldP, [0, 1.03, 0.2], "hips");
  P(box(0.03, 0.02, 0.012), black, [0, 1.03, 0.212], "hips");
  // gorget
  P(cyl(0.11, 0.14, 0.09, 10), darkSteel, [0, 1.5, 0], "neck");
  P(cyl(0.145, 0.145, 0.014, 10), goldP, [0, 1.455, 0], "neck");
  P(cyl(0.112, 0.112, 0.012, 10), goldP, [0, 1.545, 0], "neck");

  // surcoat: front tabard (griffin) and back
  const hemFront: any[] = [
    [-0.14, 0.58], [-0.1, 0.5], [-0.05, 0.57], [0, 0.48], [0.05, 0.57], [0.1, 0.5], [0.14, 0.58],
    [0.17, 1.42], [-0.17, 1.42],
  ];
  const tabard = b.extrude(hemFront, {
    color: blue, at: [0, 0, 0.165], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.03, bone: "spine1", name: "tabardFront",
  });
  b.extrude(hemFront, {
    color: blue, at: [0, 0, -0.165], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.03, bone: "spine1", name: "tabardBack",
  });
  P(box(0.27, 0.022, 0.036), goldP, [0, 0.66, 0.165], "spine1");
  P(box(0.3, 0.022, 0.036), goldP, [0, 1.4, 0.165], "spine1");
  b.decal(tabard, griffin, { at: [0, 1.17, 0.18], dir: [0, 0, 1], size: [0.2, 0.24], name: "tabardGriffin" });

  // ---------- cape ----------
  const capePts: any[] = [
    [-0.3, 0.5], [-0.24, 0.38], [-0.17, 0.5], [-0.1, 0.33], [-0.03, 0.47], [0.04, 0.36], [0.1, 0.5],
    [0.17, 0.34], [0.24, 0.46], [0.31, 0.52], [0.27, 0.8], [0.3, 1.0], [0.25, 1.5], [-0.25, 1.5],
    [-0.29, 1.1], [-0.26, 0.85], [-0.32, 0.7],
  ];
  b.extrude(capePts, { color: crimson, at: [0, 0, -0.2], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.014, bone: "spine2", name: "cape" });
  const under = capePts.map(([x, y]: number[]) => [x * 0.88, 1.5 + (y - 1.5) * 0.82]);
  b.extrude(under, { color: crimsonDark, at: [0, 0, -0.216], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.012, bone: "spine2", name: "capeUnder" });
  // clasps and chain
  for (const [n, x] of sides) P(sph(0.024), goldP, [x * 0.15, 1.5, 0.09], "spine2");
  b.sweep([[-0.15, 1.5, 0.09], [0, 1.44, 0.16], [0.15, 1.5, 0.09]], 0.008, { color: goldP, bone: "spine2", sides: 5 });

  // ---------- head & great helm ----------
  b.lathe(
    [[0, 1.6], [0.125, 1.6], [0.134, 1.64], [0.138, 1.74], [0.13, 1.8], [0.1, 1.85], [0, 1.855]],
    { color: steel, at: [0, 0, 0], segments: 10, spin: 18, bone: "head", name: "helmUpper" },
  );
  b.lathe(
    [[0, 1.5], [0.1, 1.5], [0.118, 1.54], [0.127, 1.6], [0, 1.6]],
    { color: darkSteel, at: [0, 0, 0], segments: 10, spin: 18, bone: "jaw", name: "helmJaw" },
  );
  P(box(0.15, 0.016, 0.02), black, [0, 1.725, 0.128], "head");
  P(box(0.022, 0.15, 0.014), darkSteel, [0, 1.635, 0.14], "head");
  P(box(0.022, 0.09, 0.014), darkSteel, [0, 1.795, 0.14], "head");
  P(box(0.2, 0.02, 0.012), goldP, [0, 1.755, 0.136], "head");
  P(cyl(0.142, 0.142, 0.012, 10), goldP, [0, 1.8, 0], "head", { rotation: [0, 18, 0] });
  P(cyl(0.128, 0.128, 0.012, 10), goldP, [0, 1.612, 0], "head", { rotation: [0, 18, 0] });
  [0, 1].forEach((r) =>
    [-0.03, 0, 0.03].forEach((x) => P(box(0.014, 0.014, 0.01), black, [x, 1.525 + r * 0.03, 0.118], "jaw")),
  );
  // plume
  P(cyl(0.035, 0.045, 0.05, 8), goldP, [0, 1.865, 0.0], "head");
  [-2, -1, 0, 1, 2].forEach((k) => {
    const a = Math.abs(k);
    const path = catmull([
      [k * 0.018, 1.87, 0.03], [k * 0.022, 1.99, 0.0], [k * 0.03, 2.09 - a * 0.01, -0.08],
      [k * 0.036, 2.07 - a * 0.02, -0.2], [k * 0.045, 1.93 - a * 0.04, -0.31],
    ]);
    b.sweep(path, [0.02, 0.04, 0.047 - a * 0.004, 0.036, 0.01], {
      color: plumeP, bone: "head", sides: 6, name: `plume${k + 2}`,
    });
  });

  // ---------- arms & shoulders ----------
  for (const [n, x] of sides) {
    const sh = `shoulder${n}`, el = `elbow${n}`;
    caps([x * 0.27, 1.45, 0], [x * 0.4, 1.2, 0.07], [0.05, 0.045], steel, sh);
    caps([x * 0.4, 1.2, 0.07], [x * 0.47, 0.95, 0.12], [0.047, 0.04], steel, el);
    P(sph(1), steel, [x * 0.4, 1.2, 0.075], el, { scale: [0.06, 0.06, 0.06] });
    b.spike([x * 0.4 + x * 0.05, 1.2, 0.07], [x, 0, 0], 0.05, 0.022, { color: goldP, bone: el });
    P(cyl(0.05, 0.045, 0.04, 8), goldBand, [x * 0.468, 0.96, 0.12], el, { rotation: [0, 0, -x * 14] });
    // layered pauldrons
    const lames: Array<[number[], number[], any]> = [
      [[x * 0.3, 1.48, 0], [0.14, 0.06, 0.13], steel],
      [[x * 0.32, 1.41, 0], [0.125, 0.055, 0.12], goldBand],
      [[x * 0.345, 1.34, 0], [0.11, 0.05, 0.105], steel],
    ];
    lames.forEach(([at, sc, col]) => P(sph(1), col, at, sh, { scale: sc, rotation: [0, 0, -x * 22] }));
    b.decal(
      b.surface([...b.ctx.meshes.get(b.ctx.joints.get(sh)!)!.slice(-3, -2)]),
      filigree,
      { at: [x * 0.335, 1.52, 0], dir: [x * 0.55, 1, 0.1], size: [0.17, 0.13], mirror: x < 0, name: `filigree${n}` },
    );
    // gauntlet fist
    const hx = x * 0.48;
    P(box(0.075, 0.1, 0.06), darkSteel, [hx, 0.9, 0.135], `hand${n}`);
    [0.875, 0.9, 0.925, 0.95].forEach((y, i) =>
      caps([hx - 0.035, y, 0.2], [hx + 0.035, y, 0.2], 0.0165, steel, `finger${n}${i + 1}`),
    );
    caps([hx + x * 0.04, 0.92, 0.16], [hx + x * 0.04, 0.96, 0.19], 0.018, steel, `thumb${n}`);
  }

  // ---------- legs ----------
  for (const [n, x] of sides) {
    const hip = `hip${n}`, kn = `knee${n}`, an = `ankle${n}`;
    caps([x * 0.1, 0.97, 0], [x * 0.105, 0.52, 0.02], [0.075, 0.058], steel, hip);
    P(sph(1), goldBand, [x * 0.105, 0.52, 0.05], kn, { scale: [0.066, 0.072, 0.058] });
    b.spike([x * 0.165, 0.52, 0.03], [x, 0, 0], 0.05, 0.024, { color: goldP, bone: kn });
    caps([x * 0.105, 0.52, 0.02], [x * 0.105, 0.09, -0.01], [0.055, 0.04], steel, kn);
    P(cyl(0.05, 0.05, 0.016, 8), goldP, [x * 0.105, 0.115, -0.008], an);
    P(box(0.025, 0.28, 0.02), darkSteel, [x * 0.105, 0.3, 0.06], kn);
    b.frustumBox([x * 0.105, 0.045, -0.05], [x * 0.105, 0.028, 0.2], [0.1, 0.09], [0.07, 0.05], {
      color: darkSteel, bone: an,
    });
    P(sph(1), steel, [x * 0.105, 0.03, 0.2], an, { scale: [0.04, 0.026, 0.04] });
    // tassets
    P(box(0.02, 0.16, 0.17), steel, [x * 0.19, 0.9, 0.0], hip, { rotation: [0, 0, -x * 8] });
    P(box(0.02, 0.12, 0.16), goldBand, [x * 0.19, 0.79, 0.0], hip, { rotation: [0, 0, -x * 8] });
  }

  // ---------- kite shield (left arm) ----------
  const kite: any[] = [
    [0, 0.32, "sharp"], [0.2, 0.62], [0.28, 1.0], [0.27, 1.3], [0.14, 1.38],
    [-0.14, 1.38], [-0.27, 1.3], [-0.28, 1.0], [-0.2, 0.62],
  ];
  const cy0 = 0.85;
  const scaled = (s: number) => kite.map((p: any[]) => [p[0] * s, cy0 + (p[1] - cy0) * s, ...p.slice(2)]);
  const SX = 0.58, SZ = 0.23;
  b.extrude(kite, { color: steel, at: [SX, 0, SZ], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.04, bevel: 0.01, smoothing: 1, bone: "elbowL", name: "shieldRim" });
  b.extrude(scaled(0.92), { color: goldP, at: [SX, 0, SZ], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.046, bevel: 0.006, smoothing: 1, bone: "elbowL", name: "shieldGold" });
  const face = b.extrude(scaled(0.86), { color: blue, at: [SX, 0, SZ], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.05, bevel: 0.006, smoothing: 1, bone: "elbowL", name: "shieldFace" });
  b.decal(face, griffin, { at: [SX, 0.92, SZ + 0.025], dir: [0, 0, 1], size: [0.34, 0.4], name: "shieldGriffin" });
  [-0.15, 0, 0.15].forEach((dx) => P(sph(0.016), goldP, [SX + dx, 1.33 - Math.abs(dx) * 0.15, SZ + 0.03], "elbowL"));

  // ---------- broadsword (right hand, point planted) ----------
  const WX = -0.48, WZ = 0.17;
  b.extrude(
    [[-0.035, 0.85], [-0.035, 0.2], [0, -0.015], [0.035, 0.2], [0.035, 0.85]],
    { color: "#d9dfe7", at: [WX, 0, WZ], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.012, bone: "handR", name: "blade" },
  );
  P(box(0.012, 0.6, 0.016), "#aab3bd", [WX, 0.5, WZ], "handR");
  P(box(0.3, 0.03, 0.04), goldP, [WX, 0.865, WZ], "handR");
  P(sph(0.022), goldP, [WX - 0.15, 0.865, WZ], "handR");
  P(sph(0.022), goldP, [WX + 0.15, 0.865, WZ], "handR");
  P(cyl(0.018, 0.018, 0.17, 8), leather, [WX, 0.965, WZ], "handR");
  P(sph(0.032), goldP, [WX, 1.065, WZ], "handR");

  return b.root;
}
```