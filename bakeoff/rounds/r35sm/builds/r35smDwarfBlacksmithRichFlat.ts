import * as THREE from "three";
import { createBuilder, rng, limb, catmull, bezier, grain } from "../../../../src/index";
import { metal } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dwarf Blacksmith",
  description:
    "Stocky Warcraft-style dwarf smith with a horned steel helm, braided orange beard, spiked pauldrons and a leather apron, hammer in hand, working a glowing iron bar on an anvil.",
};

// palette
const SKIN = "#e0a57e", SKIN_D = "#c98862", CHEEK = "#e58f6c";
const TUNIC = "#2c4e96", TUNIC_D = "#1e3770", GOLD = "#e3b23c", BRASS = "#c8903a";
const BEARD_D = "#b4501a", BEARD = "#e6772a", BEARD_L = "#f6b04a";
const LEATHER = "#6b4423", LEATHER_D = "#4a2f18", PANTS = "#4b3a2e", BOOT = "#3a2618";
const BONE = "#efe3c4", DARK = "#1b1410", WHITE = "#ffffff", RUBY = "#ff3a3a";
const STEEL = metal("steel", { tarnish: 0.25 });
const IRON = metal("iron");
const WOOD = grain("#8a5a30", "#6a4222", { size: 0.025, axis: "y" });

export default function build() {
  const b = createBuilder({ name: "dwarf_blacksmith" });
  const R = rng(11);
  const V = (a: number[]) => new THREE.Vector3(a[0], a[1], a[2]);
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const sph = (r = 1, w = 10, h = 8) => new THREE.SphereGeometry(r, w, h);
  const cyl = (rt: number, rb: number, h: number, s = 10) => new THREE.CylinderGeometry(rt, rb, h, s);
  const put = (geo: THREE.BufferGeometry, color: any, o: any) => b.part(geo, color, { flat: true, ...o });
  const ell = (color: any, at: any, r: number[], bone: any, o: any = {}) =>
    put(sph(1), color, { at, scale: r, bone, ...o });
  const torus = (at: any, rad: number, tube: number, color: any, dir: number[], bone: any) =>
    b.part(new THREE.TorusGeometry(rad, tube, 6, 16), color, { at, dir, axis: "z", bone, flat: true });

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.6, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([[0, 0.6, 0], [0, 0.78, 0.02], [0, 0.95, 0.04]]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.tip!;
  const neck = b.joint("neck", { parent: chest, at: [0, 1.0, 0.04], dir: [0, 0.6, 0.4], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.05, 0.08], dir: [0, 0, 1], role: "head" });
  const H = (f: number, u: number, l = 0) => head.local({ forward: f, up: u, left: l });
  const jaw = b.joint("jaw", { parent: head, at: H(0.0, -0.01), aim: H(0.15, -0.04), role: "jaw" });

  // ---------- torso ----------
  b.part(sph(1), PANTS, { at: [0, 0.56, 0.0], scale: [0.2, 0.15, 0.16], bone: hips, flat: true });
  b.loft(
    [
      { at: [0, 0.56, 0.02], w: 0.36, h: 0.28 },
      { at: [0, 0.76, 0.04], w: 0.42, h: 0.3 },
      { at: [0, 0.96, 0.02], w: 0.54, h: 0.3 },
    ],
    { bone: spine, color: TUNIC, section: "box" },
  );
  ell(TUNIC, [0, 0.7, 0.07], [0.2, 0.21, 0.2], chest);
  b.part(cyl(0.085, 0.1, 0.1, 8), SKIN_D, { at: [0, 1.0, 0.05], bone: neck, flat: true });
  torus([0, 0.99, 0.05], 0.1, 0.028, TUNIC_D, [0, 1, 0], neck);
  torus([0, 0.975, 0.05], 0.105, 0.012, GOLD, [0, 1, 0], neck);

  // belt
  b.lathe([[0.18, -0.035], [0.21, -0.035], [0.21, 0.035], [0.18, 0.035]], {
    at: [0, 0.58, 0.08], color: LEATHER_D, bone: hips, segments: 14,
  });
  put(box(0.075, 0.065, 0.02), BRASS, { at: [0, 0.58, 0.295], bone: hips });
  put(box(0.04, 0.035, 0.024), DARK, { at: [0, 0.58, 0.297], bone: hips });
  for (const s of [1, -1])
    for (let i = 0; i < 3; i++) {
      const a = (0.5 + i * 0.32) * s;
      put(sph(0.011, 6, 4), BRASS, { at: [Math.sin(a) * 0.2, 0.58, 0.08 + Math.cos(a) * 0.205], bone: hips });
    }

  // apron
  const apronOutline: any = [
    [-0.17, 0], [0.17, 0], [0.18, 0.22], [0.12, 0.36], [0.11, 0.54], [-0.11, 0.54], [-0.12, 0.36], [-0.18, 0.22],
  ];
  b.extrude(apronOutline, { at: [0, 0.37, 0.26], x: [1, 0, 0], thickness: 0.03, bevel: 0.006, color: LEATHER, bone: hips });
  b.extrude(
    [[-0.05, 0], [0.05, 0], [0.04, 0.025], [0.03, 0.04], [0.07, 0.05], [0.06, 0.08], [-0.06, 0.08], [-0.09, 0.06], [-0.06, 0.05], [-0.03, 0.04], [-0.04, 0.025]] as any,
    { at: [0, 0.68, 0.27], x: [1, 0, 0], thickness: 0.016, color: GOLD, bone: hips },
  );
  for (const s of [1, -1]) {
    b.rod([s * 0.1, 0.9, 0.26], [s * 0.14, 1.0, 0.1], 0.012, LEATHER_D, { bone: chest });
    put(box(0.07, 0.07, 0.02), LEATHER_D, { at: [s * 0.075, 0.5, 0.282], bone: hips });
    for (let i = 0; i < 4; i++)
      put(box(0.012, 0.004, 0.004), BONE, { at: [s * 0.075 + (i - 1.5) * 0.015, 0.535, 0.294], bone: hips });
    put(sph(0.011, 6, 4), BRASS, { at: [s * 0.075, 0.5, 0.295], bone: hips });
  }
  // hanging tools & pouch
  put(box(0.1, 0.12, 0.07), LEATHER, { at: [0.22, 0.5, 0.06], bone: hips });
  put(box(0.1, 0.035, 0.075), LEATHER_D, { at: [0.22, 0.565, 0.06], bone: hips });
  put(sph(0.014, 6, 4), BRASS, { at: [0.22, 0.56, 0.1], bone: hips });
  b.rod([-0.2, 0.55, 0.1], [-0.2, 0.38, 0.1], 0.012, WOOD, { bone: hips });
  put(box(0.07, 0.035, 0.03), STEEL, { at: [-0.2, 0.37, 0.1], bone: hips });

  // ---------- head ----------
  ell(SKIN, H(0.02, 0.075), [0.135, 0.14, 0.14], head);
  ell(SKIN, H(0.07, -0.04), [0.1, 0.05, 0.1], jaw);
  for (const s of [1, -1]) {
    ell(CHEEK, H(0.1, 0.02, s * 0.075), [0.06, 0.055, 0.055], head);
    ell(SKIN_D, H(0.0, 0.07, s * 0.14), [0.02, 0.045, 0.04], head); // ear
    // eyes
    ell(WHITE, H(0.125, 0.085, s * 0.05), [0.024, 0.02, 0.022], head);
    ell(DARK, H(0.143, 0.085, s * 0.05), [0.012, 0.012, 0.01], head);
    ell(WHITE, H(0.15, 0.092, s * 0.047), [0.004, 0.004, 0.004], head);
    // heavy brows
    put(box(0.075, 0.026, 0.035), BEARD_D, {
      at: H(0.138, 0.118, s * 0.05), rotation: [0, 0, s * -14], bone: head,
    });
    // mustache
    b.sweep(
      catmull([H(0.165, 0.0, s * 0.012), H(0.15, -0.025, s * 0.07), H(0.115, -0.005, s * 0.135), H(0.09, 0.03, s * 0.155)]),
      [0.04, 0.012], { bone: head, color: BEARD },
    );
    // sideburn blades
    for (let i = 0; i < 3; i++)
      b.spike(H(0.01, 0.06 - i * 0.04, s * 0.14), [s * 0.3, -1, 0.1], 0.1 - i * 0.015, 0.03, { bone: head, color: i ? BEARD : BEARD_D });
  }
  ell(CHEEK, H(0.168, 0.045), [0.04, 0.036, 0.04], head); // big nose
  ell("#c9694a", H(0.18, 0.04), [0.02, 0.018, 0.016], head);
  put(box(0.07, 0.014, 0.02), DARK, { at: H(0.15, -0.045), bone: jaw }); // mouth line under mustache

  // beard (on the jaw)
  ell(BEARD, H(0.075, -0.11), [0.15, 0.17, 0.12], jaw);
  ell(BEARD_D, H(0.07, -0.1, 0), [0.14, 0.15, 0.11], jaw, { dir: [0, 1, 0] });
  ell(BEARD, H(0.12, -0.2), [0.11, 0.12, 0.09], jaw);
  const rows = [
    { u: -0.16, n: 5, len: 0.12, r: 0.045, c: BEARD, spread: 0.11, f: 0.15 },
    { u: -0.24, n: 4, len: 0.14, r: 0.04, c: BEARD_L, spread: 0.08, f: 0.15 },
    { u: -0.3, n: 3, len: 0.12, r: 0.032, c: BEARD_L, spread: 0.045, f: 0.13 },
  ];
  for (const row of rows)
    for (let i = 0; i < row.n; i++) {
      const l = (i / (row.n - 1) - 0.5) * 2 * row.spread;
      b.spike(H(row.f - Math.abs(l) * 0.6, row.u + 0.04, l), [l * 1.2, -1, 0.25], row.len, row.r, { bone: jaw, color: row.c });
    }
  // braids
  for (const s of [1, -1]) {
    const path = catmull([H(0.1, -0.08, s * 0.11), H(0.17, -0.16, s * 0.12), H(0.19, -0.25, s * 0.115), H(0.2, -0.33, s * 0.11)]);
    b.sweep(path, [0.032, 0.022], { bone: jaw, color: BEARD_D, caps: "round" });
    for (let i = 0; i < 4; i++) {
      const t = 0.15 + i * 0.23;
      torus(path.at(t), 0.03 - i * 0.003, 0.008, i % 2 ? BEARD_L : BEARD, path.tangentAt(t) as any, jaw);
    }
    torus(path.at(0.97), 0.026, 0.012, GOLD, path.tangentAt(0.97) as any, jaw);
    b.spike(path.at(1), [0, -1, 0.1], 0.07, 0.025, { bone: jaw, color: BEARD_L });
  }

  // helmet
  b.lathe(
    [[0, 0], [0.15, 0], [0.155, 0.02], [0.14, 0.07], [0.1, 0.12], [0.045, 0.15], [0, 0.155]] as any,
    { at: H(0, 0.14), color: STEEL, bone: head, segments: 14 },
  );
  torus(H(0, 0.145), 0.152, 0.013, GOLD, [0, 1, 0], head);
  torus(H(0, 0.25), 0.075, 0.01, BRASS, [0, 1, 0], head);
  put(box(0.032, 0.035, 0.29), IRON, { at: H(0, 0.285), bone: head });
  put(box(0.03, 0.09, 0.016), BRASS, { at: H(0.152, 0.17), bone: head }); // nasal bar
  glow(put(sph(0.022, 6, 4), RUBY, { at: H(0.145, 0.225), bone: head }), 1.5);
  for (let i = 0; i < 6; i++) {
    const a = i * 0.9 + 0.3;
    put(sph(0.009, 5, 4), BRASS, { at: H(Math.cos(a) * 0.14, 0.17, Math.sin(a) * 0.14), bone: head });
  }
  for (const s of [1, -1]) {
    const hp = bezier(H(0, 0.2, s * 0.14), H(0, 0.2, s * 0.28), H(0.03, 0.36, s * 0.3));
    b.sweep(hp, [0.04, 0.0], { bone: head, color: BONE, caps: { start: "flat", end: "point" } });
    put(sph(0.05, 8, 6), BRASS, { at: H(0, 0.2, s * 0.15), bone: head });
    torus(hp.at(0.22), 0.04, 0.009, GOLD, hp.tangentAt(0.22) as any, head);
  }

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const pts = limb([s * 0.11, 0.6, 0], [s * 0.13, 0.12, 0.03], [0.3, 0.28], [[0, 0, 1]]);
    const leg = b.chain(`leg${sd}`, pts, {
      parent: hips, names: [`hip${sd}`, `knee${sd}`, `ankle${sd}`], role: "leg", contact: [s * 0.13, 0, 0.07],
    });
    b.sweep(leg, (t: number) => 0.095 - 0.03 * t, { bands: [[0.72, PANTS], [1, BOOT]] });
    const ankle = leg.tip!;
    put(box(0.15, 0.1, 0.27), BOOT, { at: [s * 0.13, 0.05, 0.07], bone: ankle });
    put(sph(1), BOOT, { at: [s * 0.13, 0.05, 0.2], scale: [0.075, 0.05, 0.05], bone: ankle });
    put(box(0.165, 0.025, 0.31), DARK, { at: [s * 0.13, 0.0125, 0.08], bone: ankle });
    put(cyl(0.085, 0.09, 0.05, 8), LEATHER_D, { at: [s * 0.13, 0.17, 0.02], bone: ankle });
    put(box(0.13, 0.012, 0.02), BRASS, { at: [s * 0.13, 0.07, 0.17], bone: ankle });
    const knee = leg.joints[1];
    put(sph(0.065, 8, 6), STEEL, { at: knee.local({ forward: 0.06 }), scale: [1, 1, 0.65], bone: knee });
    put(sph(0.016, 6, 4), GOLD, { at: knee.local({ forward: 0.105 }), bone: knee });
  }

  // ---------- arms ----------
  const arms: Record<string, any> = {
    L: { s: 1, sh: [0.3, 0.95, 0], el: [0.5, 0.76, 0.12], wr: [0.46, 0.68, 0.36] },
    R: { s: -1, sh: [-0.3, 0.95, 0], el: [-0.54, 0.78, 0.1], wr: [-0.5, 0.72, 0.34] },
  };
  const hands: Record<string, any> = {};
  for (const sd of ["L", "R"]) {
    const a = arms[sd];
    const arm = b.chain(`arm${sd}`, catmull([a.sh, a.el, a.wr]), {
      parent: chest, names: [`shoulder${sd}`, `elbow${sd}`, `hand${sd}`], role: "arm",
    });
    const r = (t: number) => 0.082 - 0.024 * t;
    b.sweep(arm, r, { bands: [[0.52, TUNIC], [1, SKIN]] });
    b.sweep(arm, (t: number) => r(t) + 0.016, { from: 0.6, to: 0.97, color: STEEL, caps: "flat" });
    b.sweep(arm, (t: number) => r(t) + 0.024, { from: 0.6, to: 0.65, color: GOLD, caps: "flat" });
    b.sweep(arm, (t: number) => r(t) + 0.024, { from: 0.92, to: 0.97, color: GOLD, caps: "flat" });
    b.sweep(arm, (t: number) => r(t) + 0.018, { from: 0.44, to: 0.54, color: TUNIC_D, caps: "flat" });
    const hand = arm.tip!;
    hands[sd] = hand;
    const d = V(a.wr).sub(V(a.el)).normalize();
    const fist = V(a.wr).addScaledVector(d, 0.04);
    ell(SKIN, fist, [0.05, 0.05, 0.05], hand);
    for (let i = 0; i < 4; i++) {
      const x = (i - 1.5) * 0.02;
      const k = fist.clone().add(new THREE.Vector3(x, 0.02, 0)).addScaledVector(d, 0.025);
      const t = k.clone().addScaledVector(d, 0.025).add(new THREE.Vector3(0, -0.035, 0));
      b.capsule(k, t, 0.0165, SKIN, { bone: hand });
    }
    b.capsule(fist.clone().add(new THREE.Vector3(-a.s * 0.04, 0.0, 0)), fist.clone().add(new THREE.Vector3(-a.s * 0.02, 0.0, 0.05)), 0.018, SKIN_D, { bone: hand });
    // pauldron
    const pc = V(a.sh).add(new THREE.Vector3(a.s * 0.02, 0.07, 0.0));
    put(new THREE.SphereGeometry(1, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), STEEL, {
      at: pc, scale: [0.15, 0.1, 0.14], bone: chest,
    });
    put(new THREE.SphereGeometry(1, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), IRON, {
      at: pc.clone().add(new THREE.Vector3(0, 0.05, 0)), scale: [0.1, 0.07, 0.09], bone: chest,
    });
    torus(pc, 0.145, 0.014, GOLD, [0, 1, 0], chest);
    b.spike(pc.clone().add(new THREE.Vector3(0, 0.1, 0)), [a.s * 0.25, 1, 0], 0.13, 0.035, { bone: chest, color: STEEL });
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2;
      put(sph(0.011, 5, 4), BRASS, {
        at: pc.clone().add(new THREE.Vector3(Math.cos(ang) * 0.125, 0.04, Math.sin(ang) * 0.115)), bone: chest,
      });
    }
  }

  // ---------- hammer (right hand) ----------
  const wR = V(arms.R.wr);
  const B = wR.clone().add(new THREE.Vector3(0, -0.1, -0.03));
  const T = wR.clone().add(new THREE.Vector3(0, 0.3, 0.12));
  const dirH = T.clone().sub(B).normalize();
  const hR = hands.R;
  b.rod(B, T, 0.022, WOOD, { bone: hR });
  b.rod(B, B.clone().addScaledVector(dirH, 0.14), 0.027, LEATHER_D, { bone: hR });
  for (let i = 0; i < 3; i++)
    torus(B.clone().addScaledVector(dirH, 0.03 + i * 0.04), 0.028, 0.005, BRASS, dirH.toArray(), hR);
  put(sph(0.032, 8, 6), BRASS, { at: B, bone: hR });
  const hh = put(box(0.26, 0.11, 0.1), IRON, { at: T.clone().addScaledVector(dirH, 0.02), dir: dirH.toArray(), bone: hR });
  for (const s of [1, -1]) {
    put(box(0.035, 0.125, 0.115), STEEL, { at: hh.local([s * 0.14, 0, 0]), dir: dirH.toArray(), bone: hR });
    glow(put(box(0.07, 0.035, 0.008), "#ffb347", { at: hh.local([0, 0, s * 0.052]), dir: dirH.toArray(), bone: hR }), 1.3);
  }
  b.spike(T.clone().addScaledVector(dirH, 0.07), dirH.toArray(), 0.08, 0.022, { bone: hR, color: STEEL });
  put(box(0.06, 0.03, 0.06), LEATHER_D, { at: T.clone().addScaledVector(dirH, -0.05), dir: dirH.toArray(), bone: hR });

  // ---------- tongs & hot bar (left hand) ----------
  const hL = hands.L;
  const fistL = V(arms.L.wr).addScaledVector(V(arms.L.wr).sub(V(arms.L.el)).normalize(), 0.04);
  const P = V([0.2, 0.625, 0.62]);
  for (const k of [1, -1]) {
    const start = fistL.clone().add(new THREE.Vector3(0, k * 0.013, 0));
    const end = P.clone().add(new THREE.Vector3(0, k * 0.019, 0));
    b.rod(start, end, 0.009, IRON, { bone: hL });
    b.rod(start, start.clone().add(new THREE.Vector3(0.06, k * 0.03, -0.12)), 0.01, IRON, { bone: hL });
    put(sph(0.014, 5, 4), STEEL, { at: end.clone().add(new THREE.Vector3(0, k * 0.004, 0)), bone: hL });
  }
  put(sph(0.014, 6, 4), BRASS, { at: fistL.clone().lerp(P, 0.45), bone: hL });
  const barSeg = (x0: number, x1: number, color: string, g: number) =>
    glow(put(box(x1 - x0, 0.03, 0.03), color, { at: [(x0 + x1) / 2, 0.625, 0.62], bone: hips }), g);
  barSeg(-0.12, 0.0, "#ffd27a", 1.8);
  barSeg(0.0, 0.14, "#ff7a1a", 1.4);
  barSeg(0.14, 0.3, "#c4461a", 0.8);
  for (let i = 0; i < 14; i++) {
    const p = [-0.1 + R() * 0.45 - 0.1, 0.68 + R() * 0.35, 0.58 + R() * 0.15];
    glow(put(box(0.012, 0.012, 0.012), i % 3 ? "#ffb347" : "#ffe9a8", {
      at: p, rotation: [R() * 90, R() * 90, 0], bone: hips,
    }), 1.5);
  }

  // ---------- anvil on a stump ----------
  const AZ = 0.62;
  put(cyl(0.22, 0.24, 0.36, 12), WOOD, { at: [0, 0.18, AZ], bone: hips });
  put(cyl(0.2, 0.2, 0.012, 12), "#a37444", { at: [0, 0.366, AZ], bone: hips });
  for (const y of [0.08, 0.28]) torus([0, y, AZ], 0.232, 0.012, IRON, [0, 1, 0], hips);
  put(box(0.3, 0.05, 0.2), IRON, { at: [0, 0.385, AZ], bone: hips });
  put(box(0.14, 0.1, 0.12), IRON, { at: [0, 0.46, AZ], bone: hips });
  put(box(0.5, 0.09, 0.18), IRON, { at: [0, 0.555, AZ], bone: hips });
  put(box(0.52, 0.016, 0.19), STEEL, { at: [0, 0.6, AZ], bone: hips });
  put(box(0.025, 0.02, 0.025), DARK, { at: [-0.15, 0.605, AZ], bone: hips });
  put(new THREE.ConeGeometry(0.05, 0.22, 8), IRON, { at: [0.36, 0.565, AZ], dir: [1, 0, 0], bone: hips });
  put(box(0.1, 0.07, 0.17), IRON, { at: [-0.3, 0.57, AZ], bone: hips });
  glow(put(box(0.1, 0.004, 0.14), "#ff8a2a", { at: [0.02, 0.613, AZ - 0.01], bone: hips }), 0.0 + 0.6);

  return b.root;
}
