import * as THREE from "three";
import { createBuilder, rng, lerp, catmull, polyline, limb, paint, mix, noise, smoothstep, mottle, grain, stripes, countershade } from "../../../../src/index";
import { svg } from "../../../../src/index";
import { metal } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dwarf Blacksmith",
  description: "A stout Ironforge-style dwarf blacksmith with a braided copper beard, goggles and mohawk, raising a runed war-hammer over a glowing bar on his anvil.",
};

type V = [number, number, number];
const v = (x: number, y: number, z: number): V => [x, y, z];

// ---------- palette ----------
const SKIN_L = "#e0976d";
const SKIN_D = "#b9694b";
const BLUSH = "#d9694f";
const BEARD_A = "#c9621f";
const BEARD_B = "#f0a43c";
const BEARD_D = "#8a3a14";
const BLUE = "#2f5aa8";
const BLUE_D = "#1d3a78";
const LEATHER = "#6a4325";
const LEATHER_D = "#3e2614";
const PANTS = "#4d3a29";
const GOLD = "#e8b94a";
const WOOD = "#7a5230";
const WOOD_D = "#4a3019";
const FUR = "#e9dcc0";

const STEEL = metal("steel", { polish: 0.5 });
const IRON = metal("iron", { polish: 0.4, tarnish: 0.5 });
const GILT = metal("gilt");

const skinPaint = mottle(SKIN_L, SKIN_D, { size: 0.09, seed: 3, contrast: 0.7 });
const beardPaint = paint((p, n, s) => {
  const streak = noise(p, 0.03, 4);
  const base = mix(BEARD_A, BEARD_B, smoothstep(0.3, 0.8, streak));
  return mix(base, BEARD_D, smoothstep(0.2, -0.8, n.y) * 0.45);
});
const braidPaint = stripes(BEARD_A, BEARD_D, { size: 0.028, axis: "y", width: 0.5, wobble: 0.1, seed: 2 });
const shirtPaint = paint((p, n) => {
  const m = mix(BLUE, BLUE_D, smoothstep(0.35, 0.8, noise(p, 0.1, 8)) * 0.6);
  const soot = smoothstep(0.95, 0.6, p.y) * 0.35;
  return mix(m, "#1a1a22", soot);
});
const leatherPaint = paint((p, n) => {
  const m = mix(LEATHER, LEATHER_D, smoothstep(0.3, 0.8, noise(p, 0.06, 11)) * 0.6);
  return mix(m, "#15110e", smoothstep(0.85, 0.5, p.y) * 0.4);
});
const woodPaint = grain(WOOD, WOOD_D, { size: 0.02, axis: "y", seed: 5 });

// ---------- textures ----------
const EYE = svg(
  `<svg viewBox="0 0 60 40">
    <path d="M3 22 Q30 -4 57 22 Q30 40 3 22Z" fill="#f6efe2" stroke="#2a140c" stroke-width="3.5" stroke-linejoin="round"/>
    <circle cx="31" cy="21" r="11" fill="#2f86d6"/>
    <circle cx="31" cy="23" r="6" fill="#7cc8ff" opacity="0.55"/>
    <circle cx="31" cy="21" r="5.2" fill="#0b0d18"/>
    <circle cx="26.5" cy="16.5" r="3" fill="#fff"/>
    <path d="M3 22 Q30 -4 57 22" fill="none" stroke="#2a140c" stroke-width="5" stroke-linecap="round"/>
  </svg>`,
  { size: 128 },
);
const RUNE = svg(
  `<svg viewBox="0 0 64 64">
    <circle cx="32" cy="32" r="28" fill="#0d1f3a" stroke="#6fd4ff" stroke-width="3"/>
    <path d="M32 12 V52 M32 20 L44 30 M32 30 L44 40 M32 20 L20 30 M20 44 L32 36 L44 44" stroke="#9be6ff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </svg>`,
  { size: 128 },
);
const CREST = svg(
  `<svg viewBox="0 0 64 64">
    <circle cx="32" cy="32" r="29" fill="#1d3a78" stroke="#e8b94a" stroke-width="4"/>
    <path d="M14 38 H44 L50 32 H26 L22 26 H14Z" fill="#e8b94a" stroke="#4a3010" stroke-width="2" stroke-linejoin="round"/>
    <path d="M24 38 V46 H38 V38" fill="#e8b94a" stroke="#4a3010" stroke-width="2"/>
    <path d="M30 10 L46 22 M30 22 L40 12" stroke="#f4e4b0" stroke-width="5" stroke-linecap="round"/>
    <rect x="38" y="8" width="14" height="9" rx="2" fill="#c8d0dc" stroke="#222" stroke-width="2" transform="rotate(35 45 12)"/>
  </svg>`,
  { size: 128 },
);
const STRAND = svg(
  `<svg viewBox="0 0 24 64">
    <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#8a3a14"/><stop offset="0.5" stop-color="#d4701f"/><stop offset="1" stop-color="#f6b448"/></linearGradient></defs>
    <path d="M12 62 Q4 40 8 24 Q10 10 12 2 Q16 14 17 26 Q20 44 12 62Z" fill="url(#g)" stroke="#6b2a0c" stroke-width="1.5" stroke-linejoin="round"/>
  </svg>`,
  { size: 96 },
);

export default function build() {
  const b = createBuilder({ name: "dwarfBlacksmith" });
  const rand = rng(42);

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: v(0, 0.62, 0), role: "spine" });
  const spine = b.chain("spine", catmull([v(0, 0.62, 0), v(0, 0.9, 0.03), v(0, 1.13, 0.05)]), {
    parent: hips,
    names: ["spine1", "spine2"],
    role: "spine",
  });
  const chest = spine.joints[1];
  const neck = b.chain("neckc", polyline([v(0, 1.13, 0.05), v(0, 1.24, 0.08)]), {
    parent: chest,
    names: ["neck"],
    role: "neck",
  });
  const head = b.joint("head", { parent: neck.joints[0], at: v(0, 1.24, 0.08), dir: [0, 1, 0.2], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: v(0, 1.31, 0.14), aim: v(0, 1.28, 0.27), role: "jaw" });

  // ---------- torso ----------
  b.loft(
    [
      { at: v(0, 0.6, 0), w: 0.36, h: 0.25 },
      { at: v(0, 0.72, 0), w: 0.38, h: 0.26 },
      { at: v(0, 0.88, 0.03), w: 0.46, h: 0.31 },
      { at: v(0, 1.07, 0.04), w: 0.56, h: 0.32 },
      { at: v(0, 1.17, 0.04), w: 0.56, h: 0.27 },
    ],
    { bone: [hips, spine], color: shirtPaint, sides: 10 } as any,
  );
  b.sweep(neck, [0.1, 0.09], { color: skinPaint });

  // leather apron + straps + crest
  b.extrude(
    [[-0.16, 0.48], [0.16, 0.48], [0.2, 0.8], [0.13, 1.1], [-0.13, 1.1], [-0.2, 0.8]],
    { at: v(0, 0, 0.205), x: [1, 0, 0], thickness: 0.025, bevel: 0.006, color: leatherPaint, bone: chest },
  );
  for (const s of [1, -1]) {
    b.rod(v(s * 0.1, 1.1, 0.205), v(s * 0.15, 1.22, 0.07), 0.02, LEATHER_D, { bone: chest });
    b.rod(v(s * 0.15, 1.22, 0.07), v(s * 0.15, 1.2, -0.08), 0.02, LEATHER_D, { bone: chest });
    // trim stitching along apron edge
    b.rod(v(s * 0.19, 0.78, 0.22), v(s * 0.145, 0.5, 0.22), 0.007, GOLD, { bone: chest });
  }
  b.part(new THREE.PlaneGeometry(0.15, 0.15), "#ffffff", {
    at: v(0, 0.96, 0.22),
    dir: [0, 0, 1],
    axis: "z",
    texture: CREST,
    bone: chest,
  });
  // belt
  const beltPts: V[] = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    beltPts.push(v(Math.sin(a) * 0.205, 0.745, 0.01 + Math.cos(a) * 0.155));
  }
  b.sweep(catmull(beltPts, { closed: true }), 0.03, { color: LEATHER_D, bone: hips });
  b.part(new THREE.BoxGeometry(0.09, 0.07, 0.025), GILT, { at: v(0, 0.745, 0.17), bone: hips });
  b.part(new THREE.BoxGeometry(0.05, 0.04, 0.03), LEATHER_D, { at: v(0, 0.745, 0.175), bone: hips });
  // pouch and small hammer at the belt
  b.part(new THREE.BoxGeometry(0.1, 0.11, 0.06), leatherPaint, { at: v(0.2, 0.68, 0.1), bone: hips });
  b.part(new THREE.BoxGeometry(0.105, 0.03, 0.065), LEATHER_D, { at: v(0.2, 0.735, 0.1), bone: hips });
  b.rod(v(-0.22, 0.7, 0.08), v(-0.22, 0.52, 0.1), 0.012, WOOD, { bone: hips });
  b.part(new THREE.BoxGeometry(0.07, 0.04, 0.04), STEEL, { at: v(-0.22, 0.71, 0.08), bone: hips });

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hip = v(s * 0.13, 0.62, 0);
    const pts = limb(hip, v(s * 0.15, 0.15, 0.0), [0.28, 0.26], [[0, 0, 1]]);
    const leg = b.chain(`leg${side}`, pts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `foot${side}`],
      role: "leg",
    });
    b.sweep(leg, [0.105, 0.075], { color: PANTS, sides: 8 });
    b.part(new THREE.SphereGeometry(0.065, 8, 6), leatherPaint, {
      at: [pts[1].x, pts[1].y, pts[1].z + 0.06],
      bone: leg.joints[1],
      scale: [1, 1, 0.7],
    });
    const foot = leg.tip!;
    // boot
    b.part(new THREE.BoxGeometry(0.17, 0.13, 0.31), leatherPaint, { at: v(s * 0.15, 0.065, 0.06), bone: foot });
    b.part(new THREE.CylinderGeometry(0.088, 0.095, 0.17, 8), leatherPaint, { at: v(s * 0.15, 0.19, 0.0), bone: foot });
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.045, 8), FUR, { at: v(s * 0.15, 0.285, 0.0), bone: foot });
    b.part(new THREE.BoxGeometry(0.175, 0.07, 0.09), STEEL, { at: v(s * 0.15, 0.055, 0.19), bone: foot });
    b.part(new THREE.BoxGeometry(0.18, 0.025, 0.32), LEATHER_D, { at: v(s * 0.15, 0.0125, 0.06), bone: foot });
    b.rod(v(s * 0.15, 0.22, 0.085), v(s * 0.15, 0.1, 0.17), 0.012, GOLD, { bone: foot }); // buckle strap
  }

  // ---------- arms ----------
  const shoulderY = 1.1;
  const armBuild = (s: number, target: V, hint: V, hand?: "hammer" | "tongs") => {
    const side = s > 0 ? "L" : "R";
    const sh = v(s * 0.32, shoulderY, 0.03);
    const pts = limb(sh, target, [0.3, 0.28], [hint]);
    const arm = b.chain(`arm${side}`, pts, {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `hand${side}`],
      role: "arm",
    });
    b.sweep(arm, [0.095, 0.075, 0.062], { color: skinPaint, sides: 8 } as any);
    b.part(new THREE.SphereGeometry(0.1, 8, 6), shirtPaint, { at: sh, bone: arm.joints[0] });
    // bracer
    b.rod(lerp(pts[1], pts[2], 0.3), lerp(pts[1], pts[2], 0.85), 0.074, leatherPaint, { bone: arm.joints[1] });
    b.rod(lerp(pts[1], pts[2], 0.3), lerp(pts[1], pts[2], 0.38), 0.079, GILT, { bone: arm.joints[1] });
    // pauldron
    const pc = v(s * 0.34, 1.17, 0.03);
    b.part(new THREE.SphereGeometry(0.13, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), STEEL, {
      at: pc, bone: arm.joints[0], scale: [1, 0.85, 1.05], flat: true,
    });
    b.part(new THREE.TorusGeometry(0.13, 0.014, 5, 12), GILT, { at: pc, bone: arm.joints[0], rotation: [90, 0, 0] });
    b.part(new THREE.ConeGeometry(0.035, 0.1, 6), STEEL, { at: v(s * 0.34, 1.29, 0.03), bone: arm.joints[0] });
    // fist
    const h = arm.tip!;
    b.part(new THREE.SphereGeometry(0.068, 8, 6), SKIN_L, { at: pts[2], bone: h, scale: [1, 0.9, 1.1] });
    for (let k = -1; k <= 1; k++)
      b.part(new THREE.SphereGeometry(0.022, 5, 4), SKIN_D, {
        at: [pts[2].x + k * 0.03, pts[2].y - 0.02, pts[2].z + 0.06], bone: h,
      });
    return { arm, pts, hand: h };
  };

  // right arm raises the hammer
  const ra = armBuild(-1, v(-0.3, 1.5, 0.3), v(-0.5, -1, 0));
  const d = new THREE.Vector3(0, 0.954, 0.3).normalize();
  const hp = ra.pts[2].clone();
  const bottom = hp.clone().addScaledVector(d, -0.14);
  const top = hp.clone().addScaledVector(d, 0.4);
  b.rod(bottom, top, 0.024, woodPaint, { bone: ra.hand });
  b.rod(hp.clone().addScaledVector(d, -0.1), hp.clone().addScaledVector(d, 0.1), 0.03, LEATHER_D, { bone: ra.hand });
  b.part(new THREE.SphereGeometry(0.035, 6, 5), GILT, { at: bottom, bone: ra.hand });
  const hc = top.clone().addScaledVector(d, 0.02);
  const e = new THREE.Vector3(0, -d.z, d.y).normalize();
  b.part(new THREE.BoxGeometry(0.12, 0.12, 0.26), STEEL, { at: hc, dir: d, bone: ra.hand });
  for (const k of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.15, 0.15, 0.05), IRON, {
      at: hc.clone().addScaledVector(e, k * 0.125), dir: d, bone: ra.hand,
    });
    b.part(new THREE.BoxGeometry(0.135, 0.135, 0.02), GILT, {
      at: hc.clone().addScaledVector(e, k * 0.06), dir: d, bone: ra.hand,
    });
    glow(
      b.part(new THREE.PlaneGeometry(0.08, 0.08), "#ffffff", {
        at: hc.clone().add(new THREE.Vector3(k * 0.062, 0, 0)),
        dir: [k, 0, 0], axis: "z", texture: RUNE, bone: ra.hand,
      }),
      1.2,
    );
  }
  b.part(new THREE.ConeGeometry(0.04, 0.09, 6), STEEL, {
    at: top.clone().addScaledVector(d, 0.1), dir: d, bone: ra.hand,
  });

  // left arm steadies the tongs
  const la = armBuild(1, v(0.15, 0.8, 0.45), v(1, -0.3, -0.3));
  const lh = la.pts[2];
  for (const k of [-1, 1]) {
    b.rod(v(lh.x + k * 0.01, lh.y + 0.08, lh.z - 0.2), v(0.2 + k * 0.012, 0.655, 0.57), 0.011, IRON, { bone: la.hand });
  }
  b.part(new THREE.SphereGeometry(0.02, 5, 4), GILT, { at: v(lh.x, lh.y + 0.02, lh.z - 0.08), bone: la.hand });

  // ---------- head ----------
  const HC = v(0, 1.36, 0.1);
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), skinPaint, {
    at: HC, bone: head, scale: [0.1575, 0.1425, 0.15],
  });
  b.part(new THREE.SphereGeometry(0.085, 8, 6), SKIN_L, { at: v(0, 1.27, 0.19), bone: jaw, scale: [1.2, 0.8, 1] });
  b.part(new THREE.SphereGeometry(0.052, 8, 6), BLUSH, { at: v(0, 1.335, 0.258), bone: head });
  for (const s of [1, -1]) {
    b.decal(skull, EYE, {
      at: v(s * 0.065, 1.385, 0.236), dir: [s * 0.1, 0, 1], size: [0.07, 0.047], mirror: s > 0,
    });
    b.part(new THREE.SphereGeometry(0.05, 7, 5), BLUSH, { at: v(s * 0.1, 1.32, 0.19), bone: head, flat: true });
    b.part(new THREE.SphereGeometry(0.05, 6, 5), SKIN_D, { at: v(s * 0.158, 1.37, 0.09), bone: head, scale: [0.45, 1, 0.8] });

    b.rod(v(s * 0.02, 1.432, 0.232), v(s * 0.095, 1.447, 0.197), 0.02, beardPaint, { bone: head });
    // moustache
    b.sweep(
      catmull([v(s * 0.01, 1.305, 0.268), v(s * 0.07, 1.285, 0.265), v(s * 0.13, 1.23, 0.22), v(s * 0.15, 1.15, 0.2)]),
      [0.04, 0.012],
      { color: beardPaint, bone: head, sides: 6 },
    );
    // goggles
    b.part(new THREE.TorusGeometry(0.042, 0.013, 5, 10), GILT, { at: v(s * 0.068, 1.462, 0.222), dir: [0, 0.35, 1], axis: "z", bone: head });
    glow(
      b.part(new THREE.CircleGeometry(0.036, 10), "#ffc247", { at: v(s * 0.068, 1.462, 0.226), dir: [0, 0.35, 1], axis: "z", bone: head }),
      0.7,
    );
  }
  b.rod(v(-0.03, 1.462, 0.222), v(0.03, 1.462, 0.222), 0.012, GILT, { bone: head });
  // goggle strap
  const strap: V[] = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    strap.push(v(Math.sin(a) * 0.162, 1.452, 0.1 + Math.cos(a) * 0.158));
  }
  b.sweep(catmull(strap, { closed: true }), 0.012, { color: LEATHER_D, bone: head });
  // mohawk
  b.extrude(
    [[-0.15, 0], [0.12, 0], [0.1, 0.06], [0.07, 0.05], [0.06, 0.13], [0.02, 0.09], [-0.01, 0.19], [-0.05, 0.1], [-0.09, 0.17], [-0.12, 0.07]],
    { at: v(0, 1.43, 0.08), x: [0, 0, 1], thickness: 0.04, bevel: 0.008, color: beardPaint, bone: head },
  );

  // beard
  const beard = b.loft(
    [
      { at: v(0, 1.3, 0.16), w: 0.3, h: 0.16 },
      { at: v(0, 1.18, 0.23), w: 0.35, h: 0.14 },
      { at: v(0, 1.04, 0.255), w: 0.31, h: 0.12 },
      { at: v(0, 0.92, 0.255), w: 0.16, h: 0.1 },
    ],
    { bone: head, color: beardPaint },
  );
  const hits = b.surface(beard).scatter(70, { rng: rng(5), minDist: 0.035, filter: (h) => h.n.z > -0.1 });
  b.cards(hits, STRAND, { size: [0.035, 0.09], lean: 55, bend: 20, vary: 0.3, rng: rng(6), flow: [0, -1, 0.2] });
  for (const s of [1, -1]) {
    const bp = catmull([v(s * 0.1, 1.2, 0.29), v(s * 0.115, 1.05, 0.31), v(s * 0.1, 0.92, 0.31), v(s * 0.11, 0.8, 0.3)]);
    b.sweep(bp, [0.034, 0.022], { color: braidPaint, bone: head, sides: 6 });
    b.along(bp, 5, (at) => b.part(new THREE.SphereGeometry(0.026, 6, 4), GILT, { at, bone: head }));
    b.part(new THREE.CylinderGeometry(0.026, 0.026, 0.04, 6), GILT, { at: v(s * 0.11, 0.79, 0.3), bone: head });
    b.spike(v(s * 0.11, 0.78, 0.3), [0, -1, 0], 0.08, 0.03, { color: BEARD_A, bone: head });
  }
  // beard rings
  b.part(new THREE.TorusGeometry(0.045, 0.012, 5, 8), GILT, { at: v(0, 0.97, 0.265), bone: head, rotation: [90, 0, 0], scale: [1.3, 1.3, 1] });

  // ---------- anvil & stump ----------
  const stump = b.part(new THREE.CylinderGeometry(0.2, 0.22, 0.38, 10), woodPaint, { at: v(0, 0.19, 0.58), bone: hips });
  void stump;
  for (const y of [0.06, 0.32])
    b.part(new THREE.TorusGeometry(0.215, 0.015, 5, 12), IRON, { at: v(0, y, 0.58), bone: hips, rotation: [90, 0, 0] });
  b.extrude(
    [
      [-0.15, 0], [0.15, 0], [0.16, 0.04], [0.08, 0.08], [0.07, 0.17], [0.2, 0.2], [0.38, 0.215],
      [0.12, 0.24], [-0.22, 0.24], [-0.22, 0.2], [-0.07, 0.17], [-0.08, 0.08], [-0.16, 0.04],
    ],
    { at: v(0, 0.38, 0.58), x: [1, 0, 0], thickness: 0.2, bevel: 0.008, color: metal("iron", { polish: 0.6 }), bone: hips },
  );
  b.part(new THREE.BoxGeometry(0.34, 0.012, 0.19), STEEL, { at: v(-0.05, 0.626, 0.58), bone: hips });

  // glowing bar
  glow(b.part(new THREE.BoxGeometry(0.2, 0.026, 0.034), "#ff5a1c", { at: v(-0.2, 0.645, 0.58), bone: hips }), 1.4);
  glow(b.part(new THREE.BoxGeometry(0.3, 0.026, 0.034), "#ffb040", { at: v(0.0, 0.645, 0.58), bone: hips }), 1.6);
  b.part(new THREE.BoxGeometry(0.16, 0.026, 0.034), "#5a5a66", { at: v(0.23, 0.645, 0.58), bone: hips });
  // sparks
  for (let i = 0; i < 9; i++) {
    const p = v(-0.28 + rand() * 0.3, 0.7 + rand() * 0.3, 0.5 + rand() * 0.2);
    glow(
      b.part(new THREE.BoxGeometry(0.014, 0.014, 0.014), i % 2 ? "#ffd060" : "#ff8a30", {
        at: p, bone: hips, rotation: [rand() * 90, rand() * 90, 0],
      }),
      2,
    );
  }

  return b.root;
}
