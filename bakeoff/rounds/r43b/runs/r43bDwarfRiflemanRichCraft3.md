```ts
import * as THREE from "three";
import { createBuilder, frame, lerp, bezier, catmull, polyline, mottle, grain, countershade, paint, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Dwarf Rifleman",
  description: "Stocky Warcraft-style dwarf with braided copper beard, iron helm, bandolier and a brass-flared blunderbuss.",
};

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// palette
const STEEL = "#7f8aa0", DARKSTEEL = "#454c5e", GOLD = "#e3b23c", BRASS = "#b98a34";
const LEATHER = "#5b3a20", DARKLEATHER = "#3a2414", BLUE = "#2f4f9a", RED = "#a8322a";
const HORN = "#e8dcb8", INK = "#1a1420", BEARD1 = "#e2792c", BEARD2 = "#a8461a";
const SKINC = mottle("#e5a67c", "#d68a68", { size: 0.05, seed: 3 });
const COAT = countershade(mottle("#31509c", "#27428a", { size: 0.12, seed: 5 }), "#1d2f66", { level: -0.2 });
const PANTS = mottle("#5a4128", "#493320", { size: 0.08, seed: 8 });
const WOOD = grain("#7a4a22", "#4e2c12", { size: 0.012, axis: "z", seed: 4 });
const BEARD = grain(BEARD1, BEARD2, { size: 0.02, axis: "y", seed: 2 });
const IRON = paint((p, n) => {
  const t = 0.5 + 0.5 * n.y;
  const c = new THREE.Color(DARKSTEEL).lerp(new THREE.Color("#a9b4cc"), t * 0.8);
  return [c.r, c.g, c.b];
});

// textures
const EYE = svg(
  `<svg viewBox="0 0 40 24"><path d="M2 14 Q20 -2 38 14 Q20 26 2 14Z" fill="#f4efe4" stroke="#1a1420" stroke-width="3"/>
  <circle cx="21" cy="13" r="8" fill="#3a74c4"/><circle cx="21" cy="13" r="4" fill="#1a1420"/><circle cx="24" cy="10" r="2.2" fill="#fff"/>
  <path d="M2 10 Q20 -4 38 10" stroke="#1a1420" stroke-width="4" fill="none"/></svg>`,
  { size: 128 },
);
const TABARD = svg(
  `<svg viewBox="0 0 60 90"><path d="M3 0 H57 V68 L30 88 L3 68Z" fill="#2c4a96" stroke="#e3b23c" stroke-width="4"/>
  <path d="M8 6 H52" stroke="#e3b23c" stroke-width="3"/>
  <path d="M16 56 L44 22 M44 56 L16 22" stroke="#e3b23c" stroke-width="3.5"/>
  <rect x="13" y="18" width="14" height="6" fill="#c9ced8" stroke="#1a1420" stroke-width="1.5" transform="rotate(-45 20 21)"/>
  <path d="M20 58 H40 L38 50 H22Z" fill="#e3b23c" stroke="#1a1420" stroke-width="1.5"/>
  <circle cx="30" cy="36" r="6" fill="#a8322a" stroke="#e3b23c" stroke-width="2"/></svg>`,
  { size: 192 },
);

export default function build() {
  const b = createBuilder({ name: "dwarf_rifleman" });

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.62, 0], role: "spine" });
  const spine = b.chain("spine", polyline([[0, 0.62, 0], [0, 0.82, 0], [0, 1.04, 0.02]]), {
    parent: hips, names: ["spine1", "spine2", "chest"], role: "spine",
  });
  const chest = spine.tip!;
  const neck = b.chain("neck", polyline([[0, 1.04, 0.02], [0, 1.12, 0.04]]), {
    parent: chest, names: ["neck1", "neck2"], role: "neck",
  });
  const head = b.joint("head", { parent: neck.tip!, at: [0, 1.12, 0.04], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.15, 0.07], aim: [0, 1.11, 0.2], role: "jaw" });

  const arms: Record<number, any> = {};
  const legs: Record<number, any> = {};
  const P: Record<number, Record<string, number[]>> = {};
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const pts = {
      sh: [s * 0.33, 1.06, 0.0], el: [s * 0.45, 0.85, 0.03], wr: [s * 0.51, 0.67, 0.1], hd: [s * 0.54, 0.59, 0.12],
    };
    P[s] = pts;
    arms[s] = b.chain(`arm${S}`, polyline([pts.sh, pts.el, pts.wr, pts.hd]), {
      parent: chest, names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `hand${S}`], role: "arm",
    });
    legs[s] = b.chain(`leg${S}`, polyline([[s * 0.14, 0.62, 0], [s * 0.145, 0.34, 0.02], [s * 0.15, 0.1, 0]]), {
      parent: hips, names: [`hip${S}`, `knee${S}`, `ankle${S}`], role: "leg",
    });
  }

  // ---------- torso ----------
  const torso = b.loft(
    [
      { at: [0, 0.6, 0], w: 0.38, h: 0.26 },
      { at: [0, 0.74, 0], w: 0.42, h: 0.28 },
      { at: [0, 0.92, 0.01], w: 0.52, h: 0.33 },
      { at: [0, 1.06, 0.0], w: 0.56, h: 0.33 },
      { at: [0, 1.12, 0.0], w: 0.4, h: 0.26 },
    ],
    { bone: [hips, spine], color: COAT },
  );
  b.sweep(neck, 0.075, { color: SKINC });
  const skin = b.surface(torso);
  // belt
  const beltPath = skin.loop([0, 0.72, 0], { lift: 0.012 });
  b.sweep(beltPath, 0.025, { color: DARKLEATHER, bone: hips });
  b.part(new THREE.BoxGeometry(0.075, 0.065, 0.02), GOLD, { bone: hips, at: [0, 0.72, 0.162] });
  b.part(new THREE.BoxGeometry(0.04, 0.035, 0.024), DARKLEATHER, { bone: hips, at: [0, 0.72, 0.164] });
  // bandolier
  const drape = skin.drape(
    catmull([[-0.2, 1.17, -0.02], [-0.28, 1.0, 0.1], [0, 0.92, 0.2], [0.28, 0.8, 0.1], [0.24, 0.7, -0.05]]),
    { lift: 0.012 },
  );
  b.sweep(drape, { radius: [0.024, 0.024], color: LEATHER, section: "box" });
  b.along(drape, 5, (at) => {
    b.stick(new THREE.CylinderGeometry(0.018, 0.018, 0.06, 6), BRASS, at, { embed: 0.1 });
    b.stick(new THREE.ConeGeometry(0.018, 0.02, 6), DARKLEATHER, at.moved([0, 0.04, 0]) as any, { embed: 0 });
  });
  // tabard
  for (const [z, d] of [[0.158, 1], [0.152, -1]] as [number, number][])
    b.part(new THREE.PlaneGeometry(0.21, 0.31), "#ffffff", {
      bone: hips, at: [0, 0.575, z], dir: [0, 0, d], axis: "z", texture: TABARD,
    });

  // ---------- legs & boots ----------
  for (const s of [1, -1]) {
    const leg = legs[s];
    b.sweep(leg, [0.09, 0.07], { color: PANTS });
    const x = s * 0.15;
    b.rod([x, 0.04, 0.0], [x, 0.27, 0.0], 0.088, { color: DARKLEATHER, bone: leg.tip, sides: 8 } as any);
    b.rod([x, 0.25, 0.0], [x, 0.31, 0.0], 0.1, { color: LEATHER, bone: leg.tip, sides: 8 } as any);
    b.part(new THREE.BoxGeometry(0.15, 0.1, 0.2), DARKLEATHER, { bone: leg.tip, at: [x, 0.05, 0.1] });
    b.part(new THREE.SphereGeometry(0.075, 8, 6), DARKLEATHER, { bone: leg.tip, at: [x, 0.05, 0.2], scale: [1, 0.65, 1.1] });
    b.part(new THREE.BoxGeometry(0.16, 0.03, 0.34), INK, { bone: leg.tip, at: [x, 0.015, 0.1] });
    b.part(new THREE.BoxGeometry(0.1, 0.03, 0.02), GOLD, { bone: leg.tip, at: [x, 0.27, 0.09] });
    b.part(new THREE.TorusGeometry(0.1, 0.012, 4, 10), BRASS, { bone: leg.tip, at: [x, 0.17, 0], dir: [0, 1, 0], axis: "z" });
  }

  // ---------- arms ----------
  for (const s of [1, -1]) {
    const arm = arms[s], pt = P[s];
    b.sweep(arm, [0.075, 0.05], { color: COAT });
    b.part(new THREE.SphereGeometry(0.068, 8, 6), STEEL, { bone: arm.joints[1], at: pt.el });
    b.rod(lerp(pt.el, pt.wr, 0.55), pt.wr, [0.07, 0.066], { color: STEEL, bone: arm.joints[2], sides: 8 } as any);
    b.part(new THREE.TorusGeometry(0.068, 0.01, 4, 8), GOLD, { bone: arm.joints[2], at: lerp(pt.el, pt.wr, 0.58), dir: [s * 0.2, 1, 0.1], axis: "z" });
    b.part(new THREE.SphereGeometry(0.052, 8, 6), SKINC, { bone: arm.tip, at: lerp(pt.wr, pt.hd, 0.8), scale: [1, 1.1, 1] });
    // pauldron
    const sh = [s * 0.36, 1.12, 0.0];
    b.part(new THREE.SphereGeometry(0.135, 10, 7), IRON, { bone: arm.joints[0], at: sh, scale: [1.1, 0.66, 1.1] });
    b.part(new THREE.TorusGeometry(0.14, 0.014, 4, 12), GOLD, { bone: arm.joints[0], at: [s * 0.36, 1.085, 0], dir: [0, 1, 0], axis: "z" });
    b.ring(frame([s * 0.36, 1.1, 0], [0, 1, 0]), { count: 6, radius: 0.12 }, (it) =>
      b.part(new THREE.SphereGeometry(0.016, 5, 4), GOLD, { at: it }),
    );
    b.spike([s * 0.37, 1.19, 0], [s * 0.3, 1, 0], 0.07, 0.025, { color: GOLD, bone: arm.joints[0] });
  }

  // ---------- head ----------
  const C = [0, 1.22, 0.04];
  const skull = b.part(new THREE.SphereGeometry(0.125, 12, 9), SKINC, { bone: head, at: C, scale: [1, 0.95, 1] });
  b.part(new THREE.SphereGeometry(0.045, 8, 6), "#e08a66", { bone: head, at: [0, 1.195, 0.165] });
  b.part(new THREE.SphereGeometry(0.075, 8, 6), SKINC, { bone: jaw, at: [0, 1.115, 0.09], scale: [1.25, 0.7, 1] });
  b.part(new THREE.BoxGeometry(0.05, 0.012, 0.01), INK, { bone: jaw, at: [0, 1.14, 0.16] });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.03, 6, 5), SKINC, { bone: head, at: [s * 0.126, 1.22, 0.02], scale: [0.5, 1.2, 0.8] });
    b.part(new THREE.SphereGeometry(0.05, 7, 5), "#e39b78", { bone: head, at: [s * 0.075, 1.17, 0.12] });
    b.decal(skull, EYE, { at: [s * 0.05, 1.235, 0.165], dir: [s * 0.25, 0, 1], size: [0.06, 0.036] });
    b.rod([s * 0.015, 1.262, 0.16], [s * 0.095, 1.268, 0.12], [0.02, 0.016], { color: BEARD2, bone: head, sides: 5 } as any);
    // moustache
    b.sweep(bezier([s * 0.01, 1.158, 0.17], [s * 0.07, 1.14, 0.19], [s * 0.1, 1.13, 0.15], [s * 0.115, 1.17, 0.1]), [0.032, 0.008], {
      color: BEARD, bone: head, sides: 6,
    });
    // horns on helm
    b.sweep(bezier([s * 0.14, 1.3, 0.03], [s * 0.25, 1.32, 0.0], [s * 0.27, 1.44, -0.06]), [0.032, 0.004], {
      color: HORN, bone: head, sides: 6, caps: { start: "flat", end: "point" },
    });
    b.part(new THREE.TorusGeometry(0.03, 0.01, 4, 8), GOLD, { bone: head, at: [s * 0.15, 1.3, 0.03], dir: [s, 0, 0], axis: "z" });
  }
  // helm
  b.lathe([[0, 0], [0.14, 0], [0.145, 0.015], [0.135, 0.05], [0.1, 0.09], [0.05, 0.112], [0, 0.118]], {
    at: [0, 1.265, 0.035], bone: head, color: IRON, segments: 10,
  });
  b.lathe([[0.138, 0], [0.152, 0], [0.152, 0.035], [0.138, 0.035]], { at: [0, 1.262, 0.035], bone: head, color: GOLD, segments: 10 });
  b.extrude([[-0.14, 0], [-0.1, 0.07], [0, 0.1], [0.1, 0.07], [0.14, 0]], {
    at: [0, 1.365, 0.035], x: [0, 0, 1], thickness: 0.022, bevel: 0.004, color: RED, bone: head,
  });
  b.part(new THREE.BoxGeometry(0.024, 0.08, 0.02), STEEL, { bone: head, at: [0, 1.24, 0.172] });
  b.ring(frame([0, 1.28, 0.035], [0, 1, 0]), { count: 6, radius: 0.148, fromDeg: 60, toDeg: 300 }, (it) =>
    b.part(new THREE.SphereGeometry(0.01, 5, 4), GOLD, { at: it }),
  );

  // ---------- beard ----------
  b.loft(
    [
      { at: [0, 1.14, 0.1], w: 0.21, h: 0.09 },
      { at: [0, 1.05, 0.15], w: 0.21, h: 0.12 },
      { at: [0, 0.92, 0.2], w: 0.15, h: 0.1 },
      { at: [0, 0.8, 0.22], w: 0.05, h: 0.05 },
    ],
    { bone: jaw, color: BEARD },
  );
  for (const s of [1, -1]) {
    for (let i = 0; i < 8; i++) {
      const at = [s * (0.075 - i * 0.002), 1.07 - i * 0.047, 0.225 + i * 0.002];
      b.part(new THREE.SphereGeometry(0.03 - i * 0.0013, 6, 5), i % 2 ? BEARD2 : BEARD1, { bone: jaw, at, scale: [1, 0.9, 1] });
    }
    b.part(new THREE.TorusGeometry(0.026, 0.008, 4, 8), GOLD, { bone: jaw, at: [s * 0.075, 0.95, 0.228], dir: [0, 1, 0], axis: "z" });
    b.spike([s * 0.065, 0.72, 0.24], [0, -1, 0], 0.07, 0.022, { color: BEARD2, bone: jaw });
    b.part(new THREE.SphereGeometry(0.02, 6, 4), GOLD, { bone: jaw, at: [s * 0.067, 0.73, 0.24] });
  }

  // ---------- blunderbuss (right hand) ----------
  const hand = arms[-1].tip;
  const G0 = V(-0.53, 0.66, 0.08), G1 = V(-0.53, 0.7, 0.52);
  const D = G1.clone().sub(G0).normalize();
  const G2 = G1.clone().addScaledVector(D, 0.26);
  b.frustumBox([-0.53, 0.53, -0.3], [-0.53, 0.63, 0.1], [0.05, 0.09], [0.04, 0.07], { color: WOOD, bone: hand });
  b.part(new THREE.BoxGeometry(0.052, 0.1, 0.02), BRASS, { bone: hand, at: [-0.53, 0.52, -0.31] });
  b.rod(G0, G1, [0.034, 0.03], { color: IRON, bone: hand, sides: 8 } as any);
  b.rod([-0.53, 0.63, 0.0], [-0.53, 0.66, 0.1], 0.036, { color: WOOD, bone: hand, sides: 6 } as any);
  b.lathe([[0, 0], [0.032, 0], [0.04, 0.06], [0.08, 0.26], [0, 0.26]], {
    at: G1, axis: [D.x, D.y, D.z], bone: hand, color: BRASS, segments: 10,
  });
  b.part(new THREE.CircleGeometry(0.07, 10), INK, { bone: hand, at: G2.clone().addScaledVector(D, 0.002), dir: [D.x, D.y, D.z], axis: "z" });
  b.part(new THREE.TorusGeometry(0.081, 0.01, 4, 10), GOLD, { bone: hand, at: G2.clone().addScaledVector(D, -0.01), dir: [D.x, D.y, D.z], axis: "z" });
  for (const t of [0.35, 0.65, 0.9]) {
    const q = G0.clone().lerp(G1, t);
    b.part(new THREE.TorusGeometry(0.036, 0.009, 4, 8), BRASS, { bone: hand, at: q, dir: [D.x, D.y, D.z], axis: "z" });
  }
  b.part(new THREE.BoxGeometry(0.018, 0.055, 0.1), BRASS, { bone: hand, at: [-0.565, 0.66, 0.03] });
  b.part(new THREE.BoxGeometry(0.014, 0.05, 0.016), DARKSTEEL, { bone: hand, at: [-0.57, 0.71, 0.0], rotation: [-30, 0, 0] });
  b.part(new THREE.TorusGeometry(0.03, 0.006, 4, 8), BRASS, { bone: hand, at: [-0.53, 0.6, 0.0], dir: [1, 0, 0], axis: "z", scale: [1, 1.2, 1] });
  b.part(new THREE.SphereGeometry(0.014, 5, 4), GOLD, { bone: hand, at: [-0.53, 0.55, -0.31] });

  // ---------- gear ----------
  b.sweep(bezier([-0.18, 0.74, 0.12], [-0.27, 0.62, 0.14], [-0.2, 0.5, 0.1]), [0.035, 0.008], {
    color: HORN, bone: hips, sides: 6,
  });
  b.part(new THREE.CylinderGeometry(0.036, 0.036, 0.025, 6), GOLD, { bone: hips, at: [-0.185, 0.745, 0.12], rotation: [0, 0, 25] });
  // lantern
  b.part(new THREE.CylinderGeometry(0.036, 0.036, 0.012, 6), BRASS, { bone: hips, at: [0.21, 0.665, 0.06] });
  b.part(new THREE.CylinderGeometry(0.036, 0.036, 0.012, 6), BRASS, { bone: hips, at: [0.21, 0.575, 0.06] });
  glow(b.part(new THREE.CylinderGeometry(0.028, 0.028, 0.08, 6), "#ffb347", { bone: hips, at: [0.21, 0.62, 0.06] }), 1.6);
  b.rod([0.21, 0.67, 0.06], [0.21, 0.72, 0.06], 0.005, { color: BRASS, bone: hips });
  // backpack
  b.part(new THREE.BoxGeometry(0.3, 0.3, 0.14), LEATHER, { bone: chest, at: [0, 0.88, -0.2] });
  b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.5, 8), "#6d7a4a", { bone: chest, at: [0, 1.08, -0.22], dir: [1, 0, 0] });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.03, 0.17, 0.016), DARKLEATHER, { bone: chest, at: [s * 0.1, 1.08, -0.22] });
    b.part(new THREE.BoxGeometry(0.03, 0.04, 0.012), BRASS, { bone: chest, at: [s * 0.1, 0.84, -0.272] });
    b.part(new THREE.CylinderGeometry(0.078, 0.078, 0.02, 8), BRASS, { bone: chest, at: [s * 0.25, 1.08, -0.22], dir: [1, 0, 0] });
  }

  return b.root;
}
```