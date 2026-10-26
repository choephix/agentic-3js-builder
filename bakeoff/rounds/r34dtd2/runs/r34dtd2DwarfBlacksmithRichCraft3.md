```ts
import * as THREE from "three";
import { createBuilder, catmull, lerp, rng, svg, mottle, grain, stripes } from "agentic-3js-builder";
import { metal } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Dwarf Blacksmith",
  description: "Warcraft-style dwarf smith with braided beard, spiked pauldrons and raised hammer, working a glowing billet on an anvil.",
};

export default function build() {
  const b = createBuilder({ name: "dwarfSmith" });

  // ---------- palette ----------
  const SKIN = "#e2a47c";
  const SKIN_D = "#c97f5c";
  const GINGER = mottle("#b8481a", "#e48a30", { size: 0.05, seed: 3 });
  const BEARD = stripes("#c9591e", "#f0a040", { size: 0.035, axis: "y", width: 0.4, wobble: 0.6, seed: 5 });
  const CLOTH = mottle("#2c4688", "#3a5aa8", { size: 0.08, seed: 9 });
  const PANTS = "#4a3426";
  const LEATHER = grain("#5e3720", "#85552e", { size: 0.02, axis: "y", seed: 2 });
  const DARK_LEATHER = "#3b2316";
  const IRON = metal("iron");
  const STEEL = metal("steel");
  const GILT = metal("gilt");
  const BRONZE = metal("bronze");
  const WOOD = grain("#6d4526", "#946034", { size: 0.025, axis: "y", seed: 4 });
  const GOLD = "#e8b84a";

  // ---------- helpers ----------
  const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
  const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);
  const cyl = (rt: number, rb: number, h: number, s = 8) => new THREE.CylinderGeometry(rt, rb, h, s);
  const put = (geo: THREE.BufferGeometry, color: any, bone: any, at: number[], o: any = {}) =>
    b.part(geo, color, { bone, at, ...o });

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.62, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    [[0, 0.62, 0], [0, 0.82, 0.0], [0, 1.02, 0.02], [0, 1.16, 0.05], [0, 1.4, 0.08]],
    { parent: hips, names: ["spine", "chest", "neck", "head", "headTip"], role: "spine" },
  );
  const chest = spine.joints[1];
  const head = spine.joints[3];
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.2, 0.1], aim: [0, 1.2, 0.25], role: "jaw" });

  // legs
  const feet: any[] = [];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hip: [number, number, number] = [s * 0.12, 0.62, 0];
    const leg = b.chain(
      `leg${side}`,
      [hip, [s * 0.13, 0.36, 0.08], [s * 0.14, 0.1, 0.02]],
      { parent: hips, names: [`hip${side}`, `knee${side}`, `ankle${side}`], role: "leg" },
    );
    b.sweep(leg, [0.088, 0.066], { color: PANTS });
    const ankle = leg.joints[2];
    feet.push(ankle);
    put(sph(0.075, 8, 6), IRON, leg.joints[1], [s * 0.13, 0.36, 0.13], { scale: [1, 1, 0.7] }); // knee pad
    put(cyl(0.085, 0.092, 0.15, 8), LEATHER, ankle, [s * 0.14, 0.17, 0.02]); // boot shaft
    put(cyl(0.095, 0.095, 0.03, 8), IRON, ankle, [s * 0.14, 0.25, 0.02]); // cuff
    put(box(0.17, 0.1, 0.3), DARK_LEATHER, ankle, [s * 0.14, 0.05, 0.07]); // boot
    put(sph(0.085, 8, 5), LEATHER, ankle, [s * 0.14, 0.055, 0.17], { scale: [1, 0.8, 1] }); // toe
    put(box(0.18, 0.025, 0.32), "#1d130c", ankle, [s * 0.14, 0.012, 0.07]); // sole
  }

  // ---------- torso ----------
  put(cyl(0.2, 0.19, 0.22, 10), PANTS, hips, [0, 0.69, 0], { scale: [1, 1, 0.95] });
  put(sph(0.27, 10, 8), CLOTH, chest, [0, 0.86, 0.02], { scale: [1, 1.1, 0.8] }); // barrel chest
  put(cyl(0.215, 0.215, 0.06, 12), DARK_LEATHER, hips, [0, 0.7, 0.02], { scale: [1.0, 1, 0.95] }); // belt
  put(box(0.075, 0.07, 0.02), GILT, hips, [0, 0.7, 0.225]); // buckle
  put(box(0.04, 0.04, 0.025), IRON, hips, [0, 0.7, 0.232]);
  // chest straps
  for (const s of [1, -1]) {
    b.rod([s * 0.2, 1.08, 0.1], [s * -0.12, 0.74, 0.21], 0.018, { color: DARK_LEATHER, bone: chest });
  }
  // apron
  const apronTex = svg(
    `<svg viewBox="0 0 60 76" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 2 H52 L58 74 H2 Z" fill="#6b4226" stroke="#2a170b" stroke-width="3" stroke-linejoin="round"/>
      <path d="M12 8 H48 L53 69 H7 Z" fill="none" stroke="#c9a06a" stroke-width="1.2" stroke-dasharray="3 2.5"/>
      <path d="M17 38 H43 L40 43 H34 V50 H44 V55 H16 V50 H26 V43 H20 Z" fill="#e8b84a" stroke="#2a170b" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M43 38 L51 37 L43 41 Z" fill="#e8b84a" stroke="#2a170b" stroke-width="1.2"/>
      <circle cx="12" cy="10" r="2.2" fill="#d8d8e0" stroke="#2a170b"/><circle cx="48" cy="10" r="2.2" fill="#d8d8e0" stroke="#2a170b"/>
      <circle cx="30" cy="24" r="4" fill="#e8b84a" stroke="#2a170b" stroke-width="1.4"/>
      <path d="M28 24 h4 M30 22 v4" stroke="#2a170b" stroke-width="1"/>
      <path d="M10 66 q4 -4 8 0 M24 66 q4 -4 8 0 M38 66 q4 -4 8 0" stroke="#2a170b" stroke-width="1.2" fill="none"/>
    </svg>`,
    { size: 256 },
  );
  put(box(0.3, 0.4, 0.02), "#ffffff", chest, [0, 0.74, 0.218], { texture: apronTex });

  // ---------- head ----------
  const eyeTex = svg(
    `<svg viewBox="0 0 40 28" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="20" cy="14" rx="18" ry="11" fill="#2a170b"/>
      <ellipse cx="20" cy="14" rx="15" ry="8.5" fill="#f4efe2"/>
      <circle cx="20" cy="14" r="7.5" fill="#3a8fd8"/><circle cx="20" cy="14" r="3.6" fill="#0a0a14"/>
      <circle cx="17" cy="11" r="2" fill="#ffffff"/>
      <path d="M2 10 Q20 -2 38 10" stroke="#2a170b" stroke-width="3" fill="none"/>
    </svg>`,
    { size: 128 },
  );
  put(sph(0.14, 10, 8), SKIN, head, [0, 1.29, 0.06], { scale: [1.05, 1, 1] });
  put(sph(0.047, 8, 6), SKIN_D, head, [0, 1.265, 0.205], { scale: [1, 0.9, 1] }); // big nose
  put(sph(0.03, 6, 4), SKIN_D, head, [0, 1.25, 0.235]);
  put(sph(0.09, 6, 5), SKIN, jaw, [0, 1.17, 0.1], { scale: [1.2, 0.7, 1] });
  for (const s of [1, -1]) {
    put(new THREE.PlaneGeometry(0.052, 0.036), "#ffffff", head, [s * 0.056, 1.305, 0.191], {
      dir: [0, 0, 1], axis: "z", texture: eyeTex,
    });
    put(box(0.075, 0.022, 0.04), GINGER, head, [s * 0.058, 1.345, 0.185], { rotation: [0, 0, s * 16] }); // brow
    put(sph(0.036, 6, 5), SKIN, head, [s * 0.148, 1.285, 0.04], { scale: [0.5, 1.2, 1] }); // ear
    put(sph(0.035, 6, 5), "#e8907c", head, [s * 0.1, 1.255, 0.16]); // ruddy cheek
    // mustache
    b.sweep(
      catmull([[0, 1.215, 0.205], [s * 0.05, 1.2, 0.222], [s * 0.1, 1.17, 0.2], [s * 0.125, 1.11, 0.17]]),
      [0.032, 0.012],
      { color: BEARD, bone: head, sides: 6 } as any,
    );
    // sideburn
    put(sph(0.06, 7, 5), BEARD, jaw, [s * 0.11, 1.22, 0.07], { scale: [0.8, 1.4, 1.2] });
  }

  // hair
  put(sph(0.155, 9, 7), GINGER, head, [0, 1.37, 0.0], { scale: [1.05, 0.95, 1.0] });
  put(sph(0.12, 8, 6), GINGER, head, [0, 1.3, -0.08], { scale: [1.2, 1.2, 1] });
  for (let i = 0; i < 5; i++) {
    const a = (i - 2) * 0.35;
    b.spike([Math.sin(a) * 0.1, 1.44, -0.05], [Math.sin(a) * 0.5, 0.8, -0.6], 0.14, 0.035, { color: GINGER, bone: head });
  }
  // headband + goggles
  put(cyl(0.113, 0.113, 0.035, 10), DARK_LEATHER, head, [0, 1.385, 0.06]);
  for (const s of [1, -1]) {
    put(cyl(0.042, 0.042, 0.03, 8), BRONZE, head, [s * 0.052, 1.4, 0.158], { rotation: [75, 0, 0] });
    glow(put(cyl(0.032, 0.032, 0.034, 8), "#6fd0ff", head, [s * 0.052, 1.404, 0.162], { rotation: [75, 0, 0] }), 0.8);
  }
  put(box(0.03, 0.02, 0.02), BRONZE, head, [0, 1.4, 0.165]);

  // ---------- beard ----------
  put(sph(0.12, 9, 7), BEARD, jaw, [0, 1.13, 0.14], { scale: [1.2, 1.1, 1] });
  put(sph(0.115, 9, 7), BEARD, jaw, [0, 1.02, 0.17], { scale: [1.1, 1.4, 0.85] });
  for (const [x, h] of [[-0.07, 0.2], [0, 0.26], [0.07, 0.2]] as number[][]) {
    put(new THREE.ConeGeometry(0.06, h, 6), BEARD, jaw, [x, 0.86 + (0.26 - h) * 0.4, 0.2], { rotation: [180, 0, 0] });
  }
  // braids with gold rings
  for (const s of [1, -1]) {
    const path = catmull([[s * 0.075, 1.07, 0.23], [s * 0.085, 0.95, 0.27], [s * 0.08, 0.84, 0.27], [s * 0.085, 0.74, 0.26]]);
    b.sweep(path, [0.034, 0.02], {
      color: stripes(GOLD, "#a8480f", { size: 0.025, axis: "y", width: 0.55, wobble: 0.1, seed: 6 }),
      bone: jaw, sides: 6, caps: "round",
    } as any);
    for (const t of [0.25, 0.55, 0.85]) {
      const p = path.at(t);
      put(new THREE.TorusGeometry(0.034, 0.009, 4, 8), GILT, jaw, [p.x, p.y, p.z], { rotation: [90, 0, 0] });
    }
    const tip = path.at(1);
    put(sph(0.022, 6, 4), GILT, jaw, [tip.x, tip.y - 0.015, tip.z]);
  }
  // central beard ring
  put(new THREE.TorusGeometry(0.05, 0.012, 5, 10), GILT, jaw, [0, 0.93, 0.205], { rotation: [90, 0, 0] });

  // ---------- anvil & stump ----------
  const AZ = 0.62;
  put(cyl(0.22, 0.25, 0.34, 10), WOOD, hips, [0, 0.17, AZ]);
  for (const y of [0.05, 0.29]) put(cyl(0.255, 0.255, 0.03, 10), IRON, hips, [0, y, AZ], { scale: [1, 1, 1] });
  const anvil = b.extrude(
    [
      [-0.12, 0], [0.12, 0], [0.1, 0.07], [0.07, 0.12], [0.08, 0.19],
      [0.5, 0.23, "sharp"], [0.2, 0.28], [-0.3, 0.28], [-0.3, 0.2], [-0.1, 0.19], [-0.08, 0.12], [-0.1, 0.07],
    ],
    { at: [0, 0.34, AZ], x: [1, 0, 0], thickness: 0.17, bevel: 0.006, color: metal("steel", { tarnish: 0.4, polish: 0.6 }), bone: hips },
  );
  put(box(0.5, 0.01, 0.13), STEEL, hips, [-0.05, 0.623, AZ]); // polished face
  put(cyl(0.012, 0.012, 0.02, 6), IRON, hips, [-0.2, 0.628, AZ + 0.03]); // hardy hole
  void anvil;

  // glowing billet
  glow(put(box(0.24, 0.025, 0.04), "#ff8a2a", hips, [0.0, 0.64, AZ], { rotation: [0, 20, 0] }), 1.6);
  glow(put(box(0.1, 0.022, 0.034), "#ffd070", hips, [0.0, 0.642, AZ], { rotation: [0, 20, 0] }), 2);

  // sparks
  const R = rng(11);
  for (let i = 0; i < 12; i++) {
    const a = R() * Math.PI * 2;
    const r = 0.08 + R() * 0.28;
    glow(
      put(box(0.012, 0.012, 0.012), i % 3 ? "#ffb347" : "#fff0a0", hips,
        [Math.cos(a) * r - 0.05, 0.72 + R() * 0.35, AZ + Math.sin(a) * r * 0.6], { rotation: [R() * 90, R() * 90, 0] }),
      2,
    );
  }

  // ---------- arms ----------
  function arm(s: number, sh: number[], el: number[], wr: number[]) {
    const side = s > 0 ? "L" : "R";
    const ch = b.chain(`arm${side}`, [sh, el, wr], {
      parent: chest, names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`], role: "arm",
    });
    b.sweep(ch, [0.088, 0.062], { color: CLOTH });
    const elbow = ch.joints[1];
    const wrist = ch.joints[2];
    b.capsule(lerp(new THREE.Vector3(...el), new THREE.Vector3(...wr), 0.35), lerp(new THREE.Vector3(...el), new THREE.Vector3(...wr), 0.98), 0.07, {
      color: IRON, bone: elbow,
    });
    put(sph(0.062, 7, 5), SKIN, wrist, wr, { scale: [1, 1, 1] }); // fist
    put(new THREE.TorusGeometry(0.07, 0.012, 4, 10), GILT, elbow, lerp(new THREE.Vector3(...el), new THREE.Vector3(...wr), 0.4).toArray());
    // pauldron
    const px = s * 0.31;
    put(sph(0.125, 9, 7), IRON, ch.joints[0], [px, 1.05, 0.0], { scale: [1.1, 0.8, 1.1] });
    put(new THREE.TorusGeometry(0.115, 0.014, 4, 12), GILT, ch.joints[0], [px, 1.03, 0.0], { rotation: [90, 0, 0], scale: [1.1, 1.1, 1] });
    for (let i = 0; i < 3; i++) {
      const a = (i - 1) * 0.9 + (s > 0 ? 0 : 0);
      b.spike([px + Math.sin(a) * 0.05, 1.1, Math.cos(a) * 0.05 - 0.01], [s * 0.5 + Math.sin(a) * 0.4, 1, Math.cos(a) * 0.4], 0.12, 0.03, { color: STEEL, bone: ch.joints[0] });
    }
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      put(sph(0.01, 4, 3), GILT, ch.joints[0], [px + Math.cos(a) * 0.12, 1.02, Math.sin(a) * 0.12]);
    }
    return ch;
  }
  // right arm raises the hammer
  const armR = arm(-1, [-0.3, 1.0, 0.0], [-0.46, 0.95, 0.14], [-0.38, 1.2, 0.32]);
  const wrR = armR.joints[2];
  b.rod([-0.38, 1.1, 0.32], [-0.38, 1.56, 0.32], 0.022, { color: WOOD, bone: wrR });
  put(sph(0.026, 6, 4), IRON, wrR, [-0.38, 1.09, 0.32]);
  put(box(0.11, 0.11, 0.24), STEEL, wrR, [-0.38, 1.6, 0.32]);
  for (const z of [-0.1, 0.1]) put(box(0.12, 0.12, 0.03), IRON, wrR, [-0.38, 1.6, 0.32 + z]);
  put(box(0.116, 0.02, 0.12), GILT, wrR, [-0.38, 1.6, 0.32]);

  // left arm holds tongs on billet
  const armL = arm(1, [0.3, 1.0, 0.0], [0.4, 0.86, 0.2], [0.3, 0.9, 0.46]);
  const wrL = armL.joints[2];
  for (const d of [-0.014, 0.014]) {
    b.rod([0.3, 0.9 + d, 0.46], [0.05, 0.665, AZ + d * 0.8], 0.011, { color: IRON, bone: wrL });
  }
  put(sph(0.016, 5, 4), IRON, wrL, [0.3, 0.9, 0.46]);

  return b.root;
}
```