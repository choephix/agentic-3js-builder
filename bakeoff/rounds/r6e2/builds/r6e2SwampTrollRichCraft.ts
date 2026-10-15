import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  mix,
  smoothstep,
  noise,
  paint,
  mottle,
  grain,
  bezier,
  catmull,
  polyline,
  limb,
  svg,
} from "../../../../src/index";
import type { Joint, Paint } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { metal } from "../../../../kits/clockwork";

export const meta = {
  name: "Swamp Troll",
  description:
    "A hunched Darkspear-style swamp troll with long tusks, a flaming mohawk, bone fetishes, a skull staff, and a mossy bog stage with a bubbling cauldron.",
};

type Pt = [number, number] | [number, number, "sharp"];
type C = string | Paint;

export default function build() {
  const b = createBuilder({ name: "swampTroll" });
  const R = rng(11);
  const G = 0.14; // top of the mud base
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const v = (x: number, y: number, z: number) => V(x, y + G, z);
  const L = (j: Joint, f: number, u: number, l = 0) => j.local({ forward: f, up: u, left: l });

  // ------------------------------------------------------------------ palette
  const BONE = "#eadfc0";
  const BONE_D = "#bfae88";
  const IVORY = "#f3e8c4";
  const CORD = "#2c1b10";
  const RED = "#c4281f";
  const GOLD = "#e2b23c";
  const DARK = "#1a1210";
  const GLOWG = "#86ff5c";
  const AMBER = "#ffcf2e";
  const LEATHER = mottle("#6a4223", "#4a2d18", { size: 0.06, seed: 2 });
  const LEATHER_D = "#3f2614";
  const WOOD = grain("#4f331c", "#8a6035", { size: 0.03, axis: "y", seed: 4 });
  const IRON = metal("iron", { verdigris: 0.25, tarnish: 0.5 });
  const STONE = mottle("#6b7568", "#3c463d", { size: 0.1, seed: 6 });

  const SK_LO = "#2b6a68";
  const SK_HI = "#63b99c";
  const MUD = "#3d3220";
  const skin = paint((p, n) => {
    const t = smoothstep(0.25, 0.75, noise(p, 0.22, 3));
    let c = mix(SK_LO, SK_HI, t * 0.8);
    c = mix(c, "#9be8b6", 0.28 * smoothstep(0.3, 1, n.y));
    c = mix(c, "#1c3a4a", 0.45 * smoothstep(0.2, -0.9, n.y));
    c = mix(c, "#225457", 0.5 * smoothstep(0.62, 0.7, noise(p, 0.05, 8)));
    c = mix(c, "#6c8f2a", 0.45 * smoothstep(0.8, 1, n.y) * smoothstep(1.7, 2.0, p.y) * smoothstep(0.4, 0.6, noise(p, 0.07, 9)));
    c = mix(c, MUD, 0.85 * smoothstep(G + 0.5, G + 0.15, p.y) * smoothstep(0.25, 0.55, noise(p, 0.08, 5) + 0.25));
    return c;
  });
  const HAIR = paint((_p, _n, s) =>
    mix(mix("#5a0f26", "#d4281d", smoothstep(0.0, 0.14, s[1])), "#ffb43a", smoothstep(0.17, 0.3, s[1])),
  );
  const CLOTH = paint((_p, _n, s) => {
    const zig = Math.abs((((s[0] / 0.08) % 2) + 2) % 2 - 1);
    if (s[1] < -0.1 && s[1] > -0.14) return GOLD;
    if (s[1] <= -0.14 && s[1] > -0.14 - 0.08 * (1 - zig)) return "#1e1410";
    return mix("#a8321e", "#7e2316", smoothstep(-0.05, -0.4, s[1]));
  });
  const MUDP = paint((p, n) => {
    let c = mix("#3d3220", "#5a4a2c", noise(p, 0.25, 11));
    c = mix(c, "#6b8f2e", 0.85 * smoothstep(0.9, 1, n.y) * smoothstep(0.4, 0.65, noise(p, 0.3, 12)));
    c = mix(c, "#241c10", 0.5 * smoothstep(0.3, 0.6, noise(p, 0.07, 13)));
    return c;
  });

  // ------------------------------------------------------------------ textures
  const FACE = svg(
    `<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 22 L50 27 L48 37 L6 31Z" fill="#c4281f" stroke="#1b0d0a" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M116 22 L70 27 L72 37 L114 31Z" fill="#c4281f" stroke="#1b0d0a" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M56 3 L64 3 L62 38 L58 38Z" fill="#efe6cc" stroke="#1b0d0a" stroke-width="2"/>
    <path d="M28 14 L28 25 M92 14 L92 25" stroke="#efe6cc" stroke-width="4" stroke-linecap="round"/>
    <circle cx="12" cy="14" r="3.5" fill="#efe6cc"/><circle cx="108" cy="14" r="3.5" fill="#efe6cc"/>
  </svg>`,
    { size: 256 },
  );
  let rays = "";
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const x1 = 50 + Math.cos(a) * 31;
    const y1 = 50 + Math.sin(a) * 31;
    const x2 = 50 + Math.cos(a) * 46;
    const y2 = 50 + Math.sin(a) * 46;
    rays += `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="#a5261b" stroke-width="5" stroke-linecap="round"/>`;
  }
  const CHEST = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    ${rays}
    <circle cx="50" cy="50" r="26" fill="none" stroke="#a5261b" stroke-width="6"/>
    <circle cx="50" cy="50" r="10" fill="#a5261b"/>
    <path d="M38 50 L50 38 L62 50 L50 62Z" fill="none" stroke="#efe6cc" stroke-width="3"/>
  </svg>`,
    { size: 256 },
  );
  const FEATHER = svg(
    `<svg viewBox="0 0 40 120" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="f" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#1e8c8c"/><stop offset="0.3" stop-color="#e8e0c8"/><stop offset="0.5" stop-color="#d4281d"/><stop offset="1" stop-color="#ff9a2e"/></linearGradient></defs>
    <path d="M20 118 L20 98" stroke="#e8e0c8" stroke-width="3.5"/>
    <path d="M20 4 C36 26 42 66 20 106 C0 66 4 26 20 4Z" fill="url(#f)" stroke="#24120c" stroke-width="2.6" stroke-linejoin="round"/>
    <path d="M20 8 L20 104" stroke="#24120c" stroke-width="2"/>
    <path d="M20 40 L9 30 M20 58 L7 46 M20 76 L10 66 M20 40 L31 30 M20 58 L33 46 M20 76 L30 66" stroke="#24120c" stroke-width="2" opacity="0.55"/>
  </svg>`,
    { size: 192 },
  );
  const GRASS = svg(
    `<svg viewBox="0 0 32 96" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 96 Q6 50 1 6 Q13 40 13 96Z" fill="#4f8a2c"/>
    <path d="M12 96 Q14 40 18 2 Q24 44 22 96Z" fill="#6aa83a"/>
    <path d="M20 96 Q24 56 31 18 Q31 60 29 96Z" fill="#3e7424"/>
  </svg>`,
    { size: 128 },
  );
  const FLAME = svg(
    `<svg viewBox="0 0 48 96" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 94 C2 80 4 52 18 38 C16 54 24 56 24 44 C26 28 22 14 28 2 C34 20 48 44 44 68 C42 84 34 92 24 94Z" fill="#ff7a1c"/>
    <path d="M24 92 C10 82 12 62 22 52 C22 64 28 66 30 56 C36 66 38 80 24 92Z" fill="#ffc531"/>
    <path d="M24 90 C18 84 20 74 24 68 C28 74 30 84 24 90Z" fill="#fff3b0"/>
  </svg>`,
    { size: 128 },
  );
  const MOSS = svg(
    `<svg viewBox="0 0 40 80" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 80 Q2 50 8 26 Q10 10 7 2 Q16 20 12 48 Q12 66 14 80Z" fill="#5b7a2a"/>
    <path d="M16 80 Q14 52 20 30 Q22 14 20 0 Q28 22 24 50 Q24 66 26 80Z" fill="#6f9033"/>
    <path d="M27 80 Q25 54 31 34 Q34 18 33 6 Q38 26 35 52 Q34 66 36 80Z" fill="#4c6a24"/>
  </svg>`,
    { size: 128 },
  );
  let glyphs = "";
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const cx = 100 + Math.cos(a) * 86;
    const cy = 100 + Math.sin(a) * 86;
    const rot = (a * 180) / Math.PI + 90;
    const kind = i % 4;
    const g =
      kind === 0
        ? "M0 -6 L0 6"
        : kind === 1
          ? "M-5 -6 L0 0 L5 -6 M0 0 L0 6"
          : kind === 2
            ? "M-5 -5 L5 5 M5 -5 L-5 5"
            : "M0 -6 L5 0 L0 6 L-5 0Z";
    glyphs += `<path transform="translate(${cx.toFixed(1)} ${cy.toFixed(1)}) rotate(${rot.toFixed(0)})" d="${g}" stroke="#8dff5a" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
  }
  const RUNE = svg(
    `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="96" fill="none" stroke="#8dff5a" stroke-width="2.4"/>
    <circle cx="100" cy="100" r="76" fill="none" stroke="#8dff5a" stroke-width="2.4"/>
    ${glyphs}
  </svg>`,
    { size: 512 },
  );

  // ------------------------------------------------------------------ builders
  const geoS = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
  const geoB = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);
  const geoC = (rt: number, rb: number, h: number, seg = 8) => new THREE.CylinderGeometry(rt, rb, h, seg);
  const put = (
    geo: THREE.BufferGeometry,
    color: C,
    bone: Joint,
    at: THREE.Vector3,
    opt: Record<string, unknown> = {},
  ) => b.part(geo, color, { bone, at, flat: true, ...opt } as never);
  const torus = (pos: THREE.Vector3, dir: number[], R0: number, r: number, color: C, bone: Joint) =>
    b.part(new THREE.TorusGeometry(R0, r, 5, 10), color, { at: pos, dir, axis: "z", bone, flat: true } as never);
  const boneRod = (a: THREE.Vector3, c: THREE.Vector3, r: number, bone: Joint) => {
    b.rod(a, c, r, BONE, { bone });
    for (const e of [a, c]) put(geoS(r * 1.7, 6, 4), BONE, bone, e);
  };
  const skull = (
    bone: Joint,
    pos: THREE.Vector3,
    k: number,
    o: { face?: number; eye?: string; horns?: boolean } = {},
  ) => {
    const f = o.face ?? 1;
    const at = (x: number, y: number, z: number) => pos.clone().add(V(x * k, y * k, z * k * f));
    put(geoS(1, 8, 6), BONE, bone, at(0, 0, 0), { scale: [0.05 * k, 0.048 * k, 0.055 * k] });
    put(geoB(0.05 * k, 0.03 * k, 0.045 * k), BONE_D, bone, at(0, -0.045, 0.012));
    put(geoB(0.036 * k, 0.008 * k, 0.006 * k), IVORY, bone, at(0, -0.034, 0.036));
    put(geoB(0.012 * k, 0.016 * k, 0.01 * k), DARK, bone, at(0, -0.014, 0.052));
    for (const s of [1, -1]) {
      const e = put(geoS(0.017 * k, 6, 4), o.eye ?? DARK, bone, at(s * 0.022, 0.006, 0.043));
      if (o.eye) glow(e, 1.5);
      if (o.horns)
        b.sweep(bezier(at(s * 0.04, 0.03, 0), at(s * 0.12, 0.05, 0), at(s * 0.15, 0.15, 0)), [0.016 * k, 0], {
          color: BONE,
          bone,
          sides: 6,
          caps: { start: "flat", end: "point" },
        });
    }
  };
  const feather = (
    pos: THREE.Vector3,
    dir: number[],
    size: [number, number],
    bone: Joint,
    lean = 0,
    flow?: number[],
  ) => b.cards([frame(pos, dir)], FEATHER, { size, lean, bone, bend: 15, ...(flow ? { flow } : {}) } as never);
  const hang = (pos: THREE.Vector3, len: number, w: number, bone: Joint) =>
    feather(pos, [0, 1, 0], [w, len], bone, 180, [0, 0, 1]);

  // ------------------------------------------------------------------ skeleton
  const hips = b.joint("hips", { at: v(0, 1.0, -0.05), role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([v(0, 1.0, -0.05), v(0, 1.25, 0.0), v(0, 1.52, 0.1), v(0, 1.8, 0.22), v(0, 1.96, 0.32)]),
    { parent: hips, names: ["spine1", "spine2", "spine3", "spine4"], role: "spine" },
  );
  const neck = b.chain("neck", catmull([v(0, 1.96, 0.32), v(0, 2.1, 0.54), v(0, 2.17, 0.72)]), {
    parent: spine,
    names: ["neck1", "neck2"],
    role: "neck",
  });
  const head = b.joint("head", { parent: neck, at: v(0, 2.17, 0.72), dir: [0, -0.05, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: L(head, 0.0, -0.07),
    aim: L(head, 0.3, -0.1),
    role: "jaw",
  });
  const chestJ = spine.joints[2];
  const shoulderJ = spine.joints[3];

  // ------------------------------------------------------------------ torso
  const torso = b.loft(
    [
      { at: v(0, 1.0, -0.05), w: 0.6, h: 0.42 },
      { at: v(0, 1.22, 0.02), w: 0.68, h: 0.5 },
      { at: v(0, 1.5, 0.12), w: 0.94, h: 0.6 },
      { at: v(0, 1.78, 0.24), w: 1.14, h: 0.62 },
      { at: v(0, 1.96, 0.32), w: 0.62, h: 0.42 },
    ],
    { bone: spine, color: skin },
  );
  put(geoS(1, 8, 6), skin, hips, v(0, 1.0, -0.04), { scale: [0.34, 0.24, 0.26] });
  put(geoS(1, 8, 6), skin, spine.joints[1], v(0, 1.2, 0.12), { scale: [0.3, 0.26, 0.24] }); // belly
  put(geoS(1, 8, 6), skin, chestJ, v(0, 1.9, 0.12), { scale: [0.36, 0.26, 0.3] }); // hunch
  for (const s of [1, -1]) put(geoS(1, 8, 6), skin, chestJ, v(s * 0.22, 1.68, 0.4), { scale: [0.2, 0.17, 0.15] });

  const torsoSurf = b.surface(torso);
  const chestHit = torsoSurf.ray([0, 1.62 + G, 2], [0, 0, -1]);
  if (chestHit) b.decal(torso, CHEST, { at: chestHit.at, dir: [0, 0, 1], size: [0.34, 0.34] });

  // ------------------------------------------------------------------ neck + head
  b.sweep(neck, [0.16, 0.145, 0.13], { color: skin });
  put(geoS(1, 10, 8), skin, head, L(head, 0.07, 0.06), { scale: [0.15, 0.14, 0.18] });
  const cranium = b.part.length >= 0 ? null : null; // (placeholder keeps types calm)
  void cranium;
  const skullSurf = b.surface(b.root);
  void skullSurf;
  put(geoS(1, 8, 6), skin, head, L(head, 0.27, -0.01), { scale: [0.115, 0.075, 0.12] }); // muzzle
  b.sweep(bezier(L(head, 0.21, 0.11), L(head, 0.35, 0.12), L(head, 0.355, -0.005)), [0.05, 0.036], {
    bone: head,
    color: skin,
    sides: 6,
  });
  for (const s of [1, -1]) {
    put(geoS(1, 6, 5), skin, head, L(head, 0.16, 0.0, s * 0.11), { scale: [0.05, 0.06, 0.07] });
    // brow
    put(geoB(0.14, 0.05, 0.1), skin, head, L(head, 0.19, 0.115, s * 0.075), { rotation: [0, 0, 15 * s] });
    // eye in a dark socket
    put(geoS(0.05, 6, 5), "#16302f", head, L(head, 0.2, 0.07, s * 0.07));
    glow(put(geoS(0.047, 7, 5), AMBER, head, L(head, 0.222, 0.07, s * 0.07)), 1.4);
    put(geoB(0.012, 0.07, 0.006), "#2a1400", head, L(head, 0.267, 0.07, s * 0.07));
    // nostrils
    put(geoS(0.011, 5, 4), DARK, head, L(head, 0.36, -0.03, s * 0.022));
    // tusks from the lower jaw
    const tuskPath = bezier(
      L(jaw, 0.2, -0.01, s * 0.1),
      L(jaw, 0.36, 0.08, s * 0.23),
      L(jaw, 0.4, 0.38, s * 0.19),
    );
    b.sweep(tuskPath, [0.072, 0], { bone: jaw, color: IVORY, sides: 7, caps: { start: "flat", end: "point" } });
    {
      const tg = tuskPath.tangentAt(0.25);
      torus(tuskPath.at(0.25), [tg.x, tg.y, tg.z], 0.072 * 0.75 + 0.01, 0.012, GOLD, jaw);
    }
    // ears: long, swept back, gold ring
    const ear = (sc: number, color: C, thick: number) =>
      b.extrude(
        ([[0, -0.05], [0.12, -0.02], [0.34, 0.18, "sharp"], [0.14, 0.1], [0.02, 0.08]] as Pt[]).map(
          (p) => [p[0] * sc, p[1] * sc] as Pt,
        ),
        { at: L(head, -0.05, 0.07, s * 0.13), x: [s * 0.85, 0, -0.5], y: [0, 1, 0], thickness: thick, color, bone: head },
      );
    ear(1.15, skin, 0.025);
    ear(0.6, "#8a3f4a", 0.03);
    torus(L(head, -0.075, 0.03, s * 0.15), [s, 0, 0], 0.034, 0.008, GOLD, head);
    // braids with beads
    const bp = catmull([
      L(head, -0.1, -0.02, s * 0.12),
      v(s * 0.3, 2.03, 0.64),
      v(s * 0.37, 1.82, 0.58),
      v(s * 0.35, 1.55, 0.5),
    ]);
    b.sweep(bp, [0.024, 0.021, 0.017], { bone: head, color: "#a0211b", sides: 6 });
    let bi = 0;
    b.along(bp, 4, (at) => {
      put(geoS(0.04, 6, 4), bi++ % 2 ? GOLD : BONE, head, at.at);
    });
    b.spike(bp.at(1), [0, -1, 0.1], 0.09, 0.03, { color: BONE, bone: head });
    feather(bp.at(1).clone().add(V(s * 0.02, 0, 0)), [0, 1, 0], [0.05, 0.2], head, 180, [0, 0, 1]);
  }
  // mouth + upper teeth
  put(geoB(0.18, 0.02, 0.2), "#2a0f0f", head, L(head, 0.2, -0.078));
  for (const x of [-0.045, -0.015, 0.015, 0.045]) put(geoB(0.022, 0.03, 0.015), IVORY, head, L(head, 0.365, -0.08, x));
  // lower jaw
  put(geoB(0.21, 0.07, 0.25), skin, jaw, L(jaw, 0.14, -0.015));
  put(geoS(1, 7, 5), skin, jaw, L(jaw, 0.27, -0.02), { scale: [0.1, 0.06, 0.085] });
  put(geoC(0.02, 0.01, 0.07, 5), IVORY, jaw, L(jaw, 0.32, -0.06), { rotation: [0, 0, 0] });

  // war paint on the face
  const faceHit = b.surface(b.root).ray([0, 2.13 + G, 3], [0, 0, -1]);
  void faceHit;
  const crown = put(geoS(1, 10, 8), skin, head, L(head, 0.07, 0.06), { scale: [0.152, 0.142, 0.182] });
  const crownHit = b.surface(crown).ray(L(head, 1, 0.03), [0, 0, -1]);
  if (crownHit) b.decal(crown, FACE, { at: crownHit.at, dir: [0, 0, 1], size: [0.25, 0.085] });

  // ------------------------------------------------------------------ mohawk
  const mp = catmull([
    L(head, 0.22, 0.15),
    L(head, 0.12, 0.205),
    L(head, -0.02, 0.2),
    L(head, -0.14, 0.1),
    v(0, 2.12, 0.38),
    v(0, 2.21, 0.13),
    v(0, 2.0, -0.12),
  ]);
  const NB = 13;
  for (let i = 0; i < NB; i++) {
    const t = (i + 0.5) / NB;
    const p = mp.at(t);
    const tg = mp.tangentAt(t);
    let ny = -tg.z;
    let nz = tg.y;
    if (ny < 0) {
      ny = -ny;
      nz = -nz;
    }
    nz -= 0.25;
    const len = Math.hypot(ny, nz);
    ny /= len;
    nz /= len;
    const k = (0.95 + 0.6 * Math.sin(Math.PI * Math.min(t * 1.15, 1))) * (0.92 + 0.16 * R());
    const bone = t < 0.42 ? head : t < 0.62 ? neck.joints[1] : shoulderJ;
    const root = p.clone().add(V(0, -ny * 0.025, -nz * 0.025));
    b.extrude(
      [[0.05, 0], [-0.06, 0], [-0.1 * k, 0.14 * k], [-0.22 * k, 0.3 * k, "sharp"], [0.0, 0.17 * k]] as Pt[],
      { at: root, x: [0, -nz, ny], y: [0, ny, nz], thickness: [0.13, 0.05], bevel: 0.008, color: HAIR, bone },
    );
  }

  // ------------------------------------------------------------------ arms and hands
  const fingerSet = (
    name: string,
    parent: Joint,
    pts: THREE.Vector3[],
    r: number,
    claw: number,
  ) => {
    const ch = b.chain(name, catmull(pts), { parent, role: "digit" });
    b.sweep(ch, [r, r * 0.78, r * 0.56], { color: skin });
    const d = pts[2].clone().sub(pts[1]).normalize();
    b.spike(pts[2], d, claw, r * 0.55, { color: BONE_D, bone: ch.joints[ch.joints.length - 1] });
    return ch;
  };
  let staffC = V(0, 0, 0);
  let wristRJ: Joint = hips;
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const sh = v(s * 0.58, 1.8, 0.2);
    const arm = b.chain(`arm${sd}`, catmull([sh, v(s * 0.86, 1.3, 0.2), v(s * 1.0, 0.85, 0.3)]), {
      parent: shoulderJ,
      names: [`shoulder${sd}`, `elbow${sd}`, `wrist${sd}`],
      role: "arm",
    });
    const armTube = b.sweep(arm, [0.15, 0.13, 0.105, 0.115, 0.085], { color: skin });
    const shJ = arm.joints[0];
    const wrist = arm.tip as Joint;
    put(geoS(1, 8, 6), skin, shJ, sh, { scale: [0.2, 0.2, 0.2] });
    put(geoS(1, 7, 5), skin, arm.joints[1], v(s * 0.86, 1.3, 0.2), { scale: [0.12, 0.12, 0.12] });
    // pauldron dome with bone spikes
    const domeAt = sh.clone().add(V(s * 0.12, 0.1, 0));
    const axisDir = [s * 0.5, 1, 0];
    b.lathe([[0, 0], [0.2, 0], [0.24, 0.03], [0.2, 0.12], [0.1, 0.18], [0, 0.2]], {
      at: domeAt,
      axis: axisDir,
      bone: shJ,
      color: LEATHER,
      segments: 8,
    });
    b.ring(frame(domeAt, axisDir), { count: 7, radius: 0.22, tilt: 40 }, (it) =>
      b.spike(it, it, 0.13, 0.028, { color: BONE, bone: shJ }),
    );
    if (s > 0) skull(shJ, domeAt.clone().add(V(0.2, 0.1, 0.1)), 1.2, { horns: true });
    else {
      feather(domeAt.clone().add(V(-0.04, 0.16, 0)), [-0.5, 1, 0.3], [0.1, 0.4], shJ);
      feather(domeAt.clone().add(V(-0.1, 0.12, 0)), [-0.9, 0.6, 0], [0.1, 0.36], shJ);
      feather(domeAt.clone().add(V(0, 0.14, -0.06)), [-0.3, 1, -0.5], [0.1, 0.34], shJ);
    }
    // bracer and armband
    const aSurf = b.surface(armTube);
    const cuff = aSurf.loop(arm.at(0.78), { lift: 0.012 });
    b.sweep(cuff, 0.03, { color: LEATHER_D });
    b.along(cuff, 6, (at) => {
      put(geoS(0.036, 6, 4), BONE, arm.joints[1], at.at);
    });
    b.sweep(aSurf.loop(arm.at(0.3), { lift: 0.01 }), 0.022, { color: GOLD });

    // hand
    const w = wrist.at.clone();
    put(geoB(0.09, 0.16, 0.17), skin, wrist, w.clone().add(V(0, -0.09, 0.02)));
    put(geoS(1, 6, 5), skin, wrist, w.clone().add(V(0, -0.02, 0.0)), { scale: [0.07, 0.07, 0.08] });
    if (s < 0) {
      // right hand grips the staff
      const Cc = w.clone().add(V(0, 0, 0.15));
      staffC = Cc;
      wristRJ = wrist;
      const Rg = 0.06;
      for (let i = 0; i < 4; i++) {
        const y = w.y - 0.07 - i * 0.045;
        const pts = [3.14, 1.75, 0.55].map((phi) => V(Cc.x + s * Rg * Math.sin(phi), y, Cc.z + Rg * Math.cos(phi)));
        fingerSet(`finger${sd}${i}`, wrist, pts, 0.026, 0.03);
      }
      const tp = [2.9, 1.8, 0.8].map((phi) => V(Cc.x - s * Rg * Math.sin(phi), w.y - 0.03, Cc.z + Rg * Math.cos(phi)));
      fingerSet(`thumb${sd}`, wrist, tp, 0.032, 0.03);
    } else {
      [0.075, 0.025, -0.025, -0.07].forEach((z, i) => {
        const pts = [
          w.clone().add(V(0, -0.15, z)),
          w.clone().add(V(s * 0.01, -0.26, z * 1.15 + 0.01)),
          w.clone().add(V(s * 0.015, -0.34, z * 1.25 + 0.03)),
        ];
        fingerSet(`finger${sd}${i}`, wrist, pts, 0.028, 0.05);
      });
      fingerSet(
        `thumb${sd}`,
        wrist,
        [w.clone().add(V(-s * 0.03, -0.08, 0.085)), w.clone().add(V(-s * 0.03, -0.14, 0.16)), w.clone().add(V(-s * 0.02, -0.2, 0.2))],
        0.034,
        0.05,
      );
    }
  }

  // ------------------------------------------------------------------ legs
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const hip = v(s * 0.27, 1.0, -0.02);
    const ankle = v(s * 0.36, 0.2, 0.06);
    const pts = limb(hip, ankle, [0.52, 0.52], [0, 0, 1]);
    const leg = b.chain(`leg${sd}`, catmull(pts), {
      parent: hips,
      names: [`hip${sd}`, `knee${sd}`, `ankle${sd}`],
      role: "leg",
      contact: [ankle.x, G, ankle.z + 0.1],
    });
    b.sweep(leg, [0.17, 0.15, 0.12, 0.115, 0.075], { color: skin });
    put(geoS(1, 8, 6), skin, leg.joints[0], hip, { scale: [0.2, 0.22, 0.2] });
    put(geoS(1, 7, 5), skin, leg.joints[1], pts[1], { scale: [0.13, 0.13, 0.13] });
    b.spike(pts[1].clone().add(V(0, 0.02, 0.1)), [0, 0.25, 1], 0.1, 0.04, { color: BONE, bone: leg.joints[1] });
    const ankleJ = leg.tip as Joint;
    put(geoB(0.21, 0.12, 0.3), skin, ankleJ, ankle.clone().add(V(0, -0.14, 0.07)));
    put(geoS(1, 6, 5), skin, ankleJ, ankle.clone().add(V(0, -0.1, -0.08)), { scale: [0.09, 0.07, 0.08] });
    for (let i = 0; i < 3; i++) {
      const dx = (i - 1) * 0.075;
      const x0 = ankle.x + dx;
      const tp = [
        V(x0, G + 0.055, ankle.z + 0.15),
        V(x0 + dx * 0.3, G + 0.05, ankle.z + 0.26),
        V(x0 + dx * 0.5, G + 0.04, ankle.z + 0.35),
      ];
      const ch = b.chain(`toe${i}${sd}`, catmull(tp), { parent: ankleJ, role: "digit" });
      b.sweep(ch, [0.052, 0.045, 0.036], { color: skin });
      b.spike(tp[2], [0, -0.12, 1], 0.08, 0.03, { color: BONE_D, bone: ch.joints[1] });
    }
  }

  // ------------------------------------------------------------------ belt, loincloth, necklace
  const belt = torsoSurf.loop(frame(v(0, 1.12, 0.0), [0, 1, 0]), { lift: 0.015 });
  b.sweep(belt, 0.04, { color: LEATHER });
  b.along(belt, 12, (at) => {
    if (at.at.z > 0.02) b.spike(at.at, [0, -1, 0.1], 0.08, 0.016, { color: BONE, bone: spine.joints[0] });
  });
  const bHit = torsoSurf.ray([0, 1.12 + G, 1], [0, 0, -1]);
  if (bHit) {
    skull(spine.joints[0], bHit.at.clone().add(V(0, -0.01, 0.05)), 1.1);
    b.extrude(
      [[-0.17, 0], [0.17, 0], [0.15, -0.38], [0.06, -0.46, "sharp"], [0, -0.38], [-0.06, -0.46, "sharp"], [-0.15, -0.38]] as Pt[],
      {
        at: bHit.at.clone().add(V(0, -0.03, 0.05)),
        x: [1, 0, 0],
        y: [0, 1, -0.25],
        thickness: 0.02,
        color: CLOTH,
        bone: spine.joints[0],
      },
    );
  }
  const backHit = torsoSurf.ray([0, 1.1 + G, -1], [0, 0, 1]);
  if (backHit)
    b.extrude(
      [[-0.2, 0], [0.2, 0], [0.17, -0.42], [0.08, -0.5, "sharp"], [0, -0.42], [-0.08, -0.5, "sharp"], [-0.17, -0.42]] as Pt[],
      {
        at: backHit.at.clone().add(V(0, 0, -0.04)),
        x: [-1, 0, 0],
        y: [0, 1, 0.25],
        thickness: 0.02,
        color: CLOTH,
        bone: spine.joints[0],
      },
    );
  // hip pouch
  put(geoS(1, 7, 5), LEATHER, spine.joints[0], v(0.36, 1.0, 0.1), { scale: [0.07, 0.09, 0.07] });
  put(geoC(0.01, 0.01, 0.2, 5), CORD, spine.joints[0], v(0.36, 1.1, 0.1));

  const neckLoop = torsoSurf.drape(
    catmull(
      [
        v(0, 1.48, 0.55),
        v(0.28, 1.62, 0.5),
        v(0.38, 1.92, 0.25),
        v(0.2, 2.02, -0.1),
        v(-0.2, 2.02, -0.1),
        v(-0.38, 1.92, 0.25),
        v(-0.28, 1.62, 0.5),
      ],
      { closed: true },
    ),
    { lift: 0.02 },
  );
  b.sweep(neckLoop, 0.016, { color: CORD });
  let ni = 0;
  b.along(neckLoop, 11, (at) => {
    const p = at.at;
    if (p.z < 0.2) return;
    const kind = ni++ % 3;
    const pos = p.clone().add(V(0, -0.05, 0.03));
    if (kind === 0) skull(chestJ, pos, 1.0);
    else if (kind === 1) b.spike(p.clone().add(V(0, -0.01, 0.03)), [0, -1, 0.1], 0.1, 0.02, { color: IVORY, bone: chestJ });
    else hang(p.clone().add(V(0, -0.01, 0.03)), 0.16, 0.05, chestJ);
  });

  // back fetish rack
  const bc = v(0, 1.66, -0.22);
  boneRod(bc.clone().add(V(-0.26, 0.26, 0)), bc.clone().add(V(0.26, -0.26, 0)), 0.02, chestJ);
  boneRod(bc.clone().add(V(0.26, 0.26, 0)), bc.clone().add(V(-0.26, -0.26, 0)), 0.02, chestJ);
  skull(chestJ, bc.clone().add(V(0, 0, -0.03)), 1.0, { face: -1 });
  hang(bc.clone().add(V(0.2, -0.24, -0.02)), 0.3, 0.07, chestJ);
  hang(bc.clone().add(V(-0.2, -0.24, -0.02)), 0.3, 0.07, chestJ);

  // moss hanging from the hump
  const hump = put(geoS(1, 8, 6), skin, chestJ, v(0, 1.9, 0.12), { scale: [0.37, 0.27, 0.31] });
  const mossHits = b.surface(hump).scatter(8, { rng: rng(31), minDist: 0.12, filter: (h) => h.n.y > 0.3 });
  b.cards(
    mossHits.map((h) => frame(h.at, [0, 1, 0])),
    MOSS,
    { size: [0.07, 0.2], lean: 180, flow: [0, 0, 1], bone: chestJ, vary: 0.3, rng: rng(32) },
  );

  // ------------------------------------------------------------------ fetish staff
  const topY = G + 2.5;
  const C0 = staffC;
  b.sweep(
    catmull([V(C0.x, G - 0.03, C0.z), V(C0.x + 0.01, G + 1.2, C0.z + 0.012), V(C0.x, topY, C0.z)]),
    [0.036, 0.031, 0.026],
    { color: WOOD, bone: wristRJ, sides: 7 },
  );
  const sTop = V(C0.x, topY + 0.1, C0.z);
  skull(wristRJ, sTop, 2.4, { horns: true, eye: GLOWG });
  const bar = V(C0.x, topY - 0.12, C0.z);
  boneRod(bar.clone().add(V(-0.22, 0, 0)), bar.clone().add(V(0.22, 0, 0)), 0.02, wristRJ);
  for (const sx of [-1, 1]) {
    hang(bar.clone().add(V(sx * 0.22, -0.02, 0)), 0.3, 0.08, wristRJ);
    b.spike(bar.clone().add(V(sx * 0.12, -0.02, 0)), [0, -1, 0], 0.12, 0.02, { color: IVORY, bone: wristRJ });
  }
  for (const [yy, col] of [[topY - 0.25, RED], [G + 1.5, RED], [G + 1.0, GOLD], [topY - 0.4, GOLD]] as [number, string][])
    torus(V(C0.x, yy, C0.z), [0, 1, 0], 0.04, 0.014, col, wristRJ);
  glow(put(new THREE.OctahedronGeometry(0.05), GLOWG, wristRJ, V(C0.x, topY - 0.3, C0.z + 0.045)), 1.4);

  // ------------------------------------------------------------------ stage: mud base
  const base = b.lathe([[0, 0], [1.5, 0], [1.62, 0.05], [1.58, 0.11], [1.4, G], [0, G]], {
    at: V(0, 0, 0),
    bone: hips,
    color: MUDP,
    segments: 18,
  });
  glow(
    b.part(new THREE.PlaneGeometry(1.7, 1.7), "#ffffff", {
      at: V(0, G + 0.004, 0.0),
      dir: [0, 1, 0],
      axis: "z",
      up: [0, 0, 1],
      bone: hips,
      texture: RUNE,
    } as never),
    0.9,
  );
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2 + R() * 0.3;
    const rr = 1.5 + R() * 0.08;
    const sz = 0.1 + R() * 0.08;
    put(geoS(1, 6, 4), STONE, hips, V(Math.cos(a) * rr, G + 0.01, Math.sin(a) * rr), {
      scale: [sz * 1.2, sz * 0.7, sz],
      rotation: [0, R() * 180, 0],
    });
  }
  // grass
  const bs = b.surface(base);
  const gh = bs.scatter(60, {
    rng: rng(21),
    minDist: 0.14,
    filter: (h) =>
      h.n.y > 0.85 &&
      !(Math.abs(h.at.x) < 1.15 && Math.abs(h.at.z) < 0.6) &&
      Math.hypot(h.at.x - 0.95, h.at.z + 0.78) > 0.5 &&
      Math.hypot(h.at.x - 0.6, h.at.z - 0.95) > 0.45,
  });
  b.cards(gh, GRASS, { size: [0.07, 0.26], lean: 12, bend: 25, vary: 0.4, spin: 180, rng: rng(22), cross: true, bone: hips });

  // cauldron over a fire
  const CP = V(0.95, G, -0.78);
  for (let i = 0; i < 3; i++) {
    const a = i * 2.1;
    b.rod(CP.clone().add(V(Math.cos(a) * 0.22, 0.04, Math.sin(a) * 0.22)), CP.clone().add(V(-Math.cos(a) * 0.22, 0.07, -Math.sin(a) * 0.22)), 0.035, WOOD, { bone: hips });
    const fa = a + 0.6;
    b.rod(CP.clone().add(V(Math.cos(fa) * 0.2, 0.2, Math.sin(fa) * 0.2)), CP.clone().add(V(Math.cos(fa) * 0.25, 0.0, Math.sin(fa) * 0.25)), 0.03, IRON, { bone: hips });
  }
  b.lathe(
    [[0, 0], [0.14, 0], [0.25, 0.08], [0.28, 0.2], [0.25, 0.3], [0.29, 0.31], [0.29, 0.35], [0.2, 0.35], [0, 0.35]],
    { at: CP.clone().add(V(0, 0.14, 0)), bone: hips, color: IRON, segments: 10 },
  );
  glow(
    b.part(new THREE.CircleGeometry(0.225, 10), GLOWG, {
      at: CP.clone().add(V(0, 0.14 + 0.352, 0)),
      dir: [0, 1, 0],
      axis: "z",
      bone: hips,
    } as never),
    1.3,
  );
  for (let i = 0; i < 5; i++) {
    const a = i * 1.3;
    glow(put(geoS(0.025 + 0.012 * (i % 3), 6, 4), "#b6ff8a", hips, CP.clone().add(V(Math.cos(a) * 0.12, 0.56 + i * 0.07, Math.sin(a) * 0.12))), 1.4);
  }
  const fireFrames = [0, 1, 2, 3, 4, 5].map((i) =>
    frame(CP.clone().add(V(Math.cos(i * 1.05) * 0.1, 0.05, Math.sin(i * 1.05) * 0.1)), [0, 1, 0]),
  );
  glow(b.cards(fireFrames, FLAME, { size: [0.16, 0.3], cross: true, vary: 0.3, spin: 180, rng: rng(41), bone: hips }), 1.3);
  for (let i = 0; i < 5; i++) glow(put(geoS(0.014, 5, 4), "#ff8a2a", hips, CP.clone().add(V(Math.cos(i * 1.7) * 0.2, 0.03, Math.sin(i * 1.7) * 0.2))), 1.5);
  b.rod(CP.clone().add(V(0.05, 0.9, 0.0)), CP.clone().add(V(0.35, 0.3, 0.05)), 0.014, WOOD, { bone: hips });

  // bone pile with skulls
  const SP = V(1.2, G, 0.78);
  skull(hips, SP.clone().add(V(0, 0.05, 0)), 1.3);
  skull(hips, SP.clone().add(V(0.18, 0.04, -0.1)), 1.0, { horns: true });
  boneRod(SP.clone().add(V(-0.2, 0.03, 0.15)), SP.clone().add(V(0.25, 0.03, 0.2)), 0.02, hips);
  boneRod(SP.clone().add(V(-0.1, 0.07, 0.25)), SP.clone().add(V(0.2, 0.05, -0.05)), 0.02, hips);

  // pond with lily pads
  const PP = V(0.6, G, 0.95);
  put(geoC(0.34, 0.36, 0.02, 10), "#2d6a5e", hips, PP.clone().add(V(0, 0.005, 0)));
  for (const [dx, dz, r] of [[-0.1, 0.05, 0.12], [0.14, -0.1, 0.1], [0.12, 0.14, 0.08]] as number[][]) {
    put(geoC(r, r, 0.012, 8), "#4f9a3a", hips, PP.clone().add(V(dx, 0.02, dz)));
  }
  put(geoS(0.035, 6, 4), "#ff7ab0", hips, PP.clone().add(V(-0.1, 0.05, 0.05)));
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    b.spike(PP.clone().add(V(-0.1 + Math.cos(a) * 0.025, 0.03, 0.05 + Math.sin(a) * 0.025)), [Math.cos(a) * 0.5, 1, Math.sin(a) * 0.5], 0.06, 0.018, { color: "#ffb0d0", bone: hips, sides: 4 });
  }

  // cattails
  for (let i = 0; i < 4; i++) {
    const bx = -1.2 + i * 0.1;
    const bz = -0.55 - (i % 2) * 0.12;
    const h = 0.7 + i * 0.1;
    const sp = catmull([V(bx, G, bz), V(bx - 0.02, G + h * 0.5, bz + 0.02), V(bx - 0.05, G + h, bz + 0.03)]);
    b.sweep(sp, [0.012, 0.008], { color: "#5c7a2e", bone: hips, sides: 5 });
    b.capsule(V(bx - 0.04, G + h - 0.12, bz + 0.03), V(bx - 0.05, G + h + 0.04, bz + 0.03), 0.026, "#5a3a1e", { bone: hips });
  }
  b.cards([frame(V(-1.15, G, -0.5), [0, 1, 0]), frame(V(-1.05, G, -0.62), [0, 1, 0])], GRASS, {
    size: [0.1, 0.7],
    bend: 30,
    cross: true,
    bone: hips,
  });

  // glowing mushrooms
  const MC = V(-0.7, G, -0.8);
  [[0, 0, 0.1], [0.16, 0.1, 0.07], [-0.1, 0.14, 0.05]].forEach(([dx, dz, h], i) => {
    put(geoC(0.018, 0.026, h, 6), "#e8dcc0", hips, MC.clone().add(V(dx, h / 2, dz)));
    glow(
      put(new THREE.SphereGeometry(1, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), i === 1 ? "#6bf0ff" : "#c07bff", hips, MC.clone().add(V(dx, h, dz)), {
        scale: [0.07 + 0.02 * (i % 2), 0.045, 0.07 + 0.02 * (i % 2)],
      }),
      0.8,
    );
  });

  // ------------------------------------------------------------------ rest pose
  b.pose(jaw, { axis: [1, 0, 0], deg: 10 });

  return b.root;
}
