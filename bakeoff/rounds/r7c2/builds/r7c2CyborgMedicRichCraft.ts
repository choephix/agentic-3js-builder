import * as THREE from "three";
import {
  createBuilder,
  catmull,
  polyline,
  lerp,
  offset,
  paint,
  mix,
  noise,
  smoothstep,
  grain,
  svg,
  frame,
  rng,
} from "../../../../src/index";
import type { ColorInput, Joint } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { metal, coil, panelled } from "../../../../kits/clockwork";

export const meta = {
  name: "Solace - Cyborg Field Medic",
  description:
    "Overwatch-style support hero: white-and-teal armoured medic with a cybernetic arm and eye, a glowing healing staff, backpack wings, a hover drone and a holo-pad base.",
};

// Everything is authored with feet at y = 0 and lifted by the thickness of the staging base.
const G = 0.06;
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y + G, z);
const D2R = Math.PI / 180;
type Opts = Record<string, unknown>;

export default function build() {
  const b = createBuilder({ name: "cyborg_medic" });
  const rand = rng(21);

  // ------------------------------------------------------------------ palette
  const TEAL = "#19d9e6";
  const TEAL_L = "#8ffcff";
  const TEAL_D = "#0e7c93";
  const NAVY = "#17283d";
  const GLOVE = "#232c3a";
  const SOLE = "#0e141c";
  const ORANGE = "#ff9b2f";
  const LIPS = "#b4565a";
  const WHITE = "#ffffff";

  // ------------------------------------------------------------------ paints
  const ARMOR = paint((p, n) => {
    const up = smoothstep(-0.7, 0.9, n.y);
    let c = mix("#b9ccea", "#ffffff", up);
    c = mix(c, "#e4f1fb", smoothstep(0.6, 0.85, noise(p, 0.2, 4)) * 0.12);
    return mix(c, "#c3d3e6", smoothstep(0.1, 0.0, p.y - G) * 0.1);
  });
  const WINGP = paint((_p, _n, s) => mix("#ffffff", "#8ff6fb", smoothstep(0.08, 0.42, s[0])));
  const SUIT = paint((p, n) => {
    const t = smoothstep(-0.8, 0.9, n.y);
    const c = mix("#13233a", "#2d4d72", t);
    const f = (p.y * 14) % 1;
    return Math.abs(f - 0.5) < 0.035 ? mix(c, "#09111c", 0.7) : c;
  });
  const SKIN = paint((p, n) => {
    const c = mix("#b5724f", "#e4a97e", smoothstep(-0.6, 0.9, n.y));
    return mix(c, "#e68a7c", smoothstep(0.45, 0.72, noise(p, 0.05, 2)) * 0.28);
  });
  const HAIR = paint((p, n) => {
    const c = mix("#24122c", "#5c2f5c", smoothstep(-0.2, 0.95, n.y));
    return mix(c, "#e0703a", smoothstep(0.7, 0.92, noise(p, 0.035, 7)) * 0.55);
  });
  const GOLD = metal("gilt", { polish: 0.5 });
  const STEEL = metal("steel", { polish: 0.55, tarnish: 0 });
  const GUN = metal("iron", { polish: 0.4 });
  const STAFFP = grain("#1d3145", "#35607f", { size: 0.01, axis: "y" });
  const BASEP = panelled(metal("iron", { tarnish: 0.3 }), { size: 0.22, rivets: 0.05 });
  const TILE = paint((p, n) => {
    if (n.y < 0.5) return "#27313f";
    const u = p.x / 0.2;
    const w = p.z / 0.2;
    const fu = u - Math.floor(u);
    const fw = w - Math.floor(w);
    if (fu < 0.04 || fu > 0.96 || fw < 0.04 || fw > 0.96) return "#4d6b82";
    return mix("#cfe0ea", "#eef7fb", noise(p, 0.12, 5));
  });

  // ------------------------------------------------------------------ textures
  const EYE = svg(
    `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="a"><path d="M4 26 C14 8 34 4 46 8 C54 11 57 18 58 24 C44 36 18 38 4 26Z"/></clipPath>
        <radialGradient id="i" cx="0.5" cy="0.4" r="0.7"><stop offset="0" stop-color="#8ef0e0"/><stop offset="0.6" stop-color="#2a9aa8"/><stop offset="1" stop-color="#1a4a64"/></radialGradient>
      </defs>
      <path d="M4 26 C14 8 34 4 46 8 C54 11 57 18 58 24 C44 36 18 38 4 26Z" fill="#f4f6f8"/>
      <g clip-path="url(#a)">
        <circle cx="34" cy="21" r="14" fill="url(#i)"/>
        <circle cx="34" cy="21" r="6.5" fill="#0c1a26"/>
        <ellipse cx="29" cy="15" rx="4" ry="3.2" fill="#ffffff"/>
        <circle cx="39" cy="27" r="1.8" fill="#ffffff"/>
        <path d="M0 0H60V13C40 9 20 9 0 14Z" fill="#000000" opacity="0.18"/>
      </g>
      <path d="M4 26 C14 8 34 4 46 8 C54 11 57 18 58 24" stroke="#1d1218" stroke-width="3.6" fill="none" stroke-linecap="round"/>
      <path d="M5 25 Q1 22 1.6 15" stroke="#1d1218" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M10 30 C22 37 40 36 54 27" stroke="#8a5a4a" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );
  const CYBER = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="30" fill="#0b1620"/>
      <circle cx="32" cy="32" r="25" fill="none" stroke="#22e6ff" stroke-width="3"/>
      <circle cx="32" cy="32" r="18" fill="#0a3a52"/>
      <circle cx="32" cy="32" r="12" fill="#31f2ff"/>
      <circle cx="32" cy="32" r="5.5" fill="#021018"/>
      <path d="M32 3V12M32 52V61M3 32H12M52 32H61" stroke="#22e6ff" stroke-width="3"/>
      <path d="M12 12L18 18M52 12L46 18M12 52L18 46M52 52L46 46" stroke="#0f8aa0" stroke-width="2.6"/>
      <ellipse cx="27" cy="26" rx="4" ry="3" fill="#ffffff"/>
    </svg>`,
    { size: 256 },
  );
  const EMBLEM = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 4L90 27V73L50 96L10 73V27Z" fill="#0f2a40" stroke="#d9a93a" stroke-width="6" stroke-linejoin="round"/>
      <path d="M50 14L81 32V68L50 86L19 68V32Z" fill="none" stroke="#2fe6f0" stroke-width="2.6"/>
      <path d="M42 24H58V42H76V58H58V76H42V58H24V42H42Z" fill="#f2fbff" stroke="#19d9e6" stroke-width="2.4" stroke-linejoin="round"/>
    </svg>`,
    { size: 256 },
  );
  const ECG = svg(
    `<svg viewBox="0 0 80 50" xmlns="http://www.w3.org/2000/svg">
      <rect x="1.5" y="1.5" width="77" height="47" rx="6" fill="#06222c" stroke="#27e6f2" stroke-width="2.4"/>
      <path d="M8 14H72M8 25H72M8 36H72M20 6V44M40 6V44M60 6V44" stroke="#0f6d7a" stroke-width="1.1"/>
      <path d="M6 28H22L27 28L31 12L37 42L42 20L46 28H74" stroke="#7ffcff" stroke-width="3" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );
  const holoTicks = Array.from({ length: 36 }, (_, i) => {
    const a = i * 10 * D2R;
    const r0 = i % 3 === 0 ? 72 : 78;
    const r1 = 86;
    return `<path d="M${(100 + Math.sin(a) * r0).toFixed(1)} ${(100 - Math.cos(a) * r0).toFixed(1)}L${(100 + Math.sin(a) * r1).toFixed(1)} ${(100 - Math.cos(a) * r1).toFixed(1)}" stroke="#19d9e6" stroke-width="${i % 3 === 0 ? 3.4 : 2.4}"/>`;
  }).join("");
  const holoPlus = [0, 90, 180, 270]
    .map((d) => {
      const x = 100 + Math.sin(d * D2R) * 56;
      const y = 100 - Math.cos(d * D2R) * 56;
      return `<path d="M${x - 2.5} ${y - 7.5}H${x + 2.5}V${y - 2.5}H${x + 7.5}V${y + 2.5}H${x + 2.5}V${y + 7.5}H${x - 2.5}V${y + 2.5}H${x - 7.5}V${y - 2.5}H${x - 2.5}Z" fill="#8ffcff"/>`;
    })
    .join("");
  const HOLO = svg(
    `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="96" fill="none" stroke="#19d9e6" stroke-width="3.4"/>
      <circle cx="100" cy="100" r="90" fill="none" stroke="#8ffcff" stroke-width="2.4" stroke-dasharray="10 6"/>
      <circle cx="100" cy="100" r="68" fill="none" stroke="#19d9e6" stroke-width="2.6"/>
      <path d="M100 56L138 78V122L100 144L62 122V78Z" fill="none" stroke="#0e9db0" stroke-width="2.6"/>
      ${holoTicks}${holoPlus}
    </svg>`,
    { size: 512 },
  );
  const TABARD = svg(
    `<svg viewBox="0 0 40 90" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(0 90) scale(1 -1)">
        <path d="M2 2H38V66L20 88L2 66Z" fill="#f3ead2" stroke="#d9a93a" stroke-width="3" stroke-linejoin="round"/>
        <path d="M8 8H32V62L20 80L8 62Z" fill="#12394f"/>
        <path d="M17 24H23V33H32V39H23V48H17V39H8V33H17Z" fill="#19d9e6"/>
        <path d="M10 56L20 66L30 56" stroke="#d9a93a" stroke-width="3" fill="none" stroke-linejoin="round"/>
        <path d="M10 14H30" stroke="#d9a93a" stroke-width="2.4"/>
      </g>
    </svg>`,
    { size: 256 },
  );
  const PLUS = svg(
    `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2H20V12H30V20H20V30H12V20H2V12H12Z" fill="#bffcff" stroke="#19d9e6" stroke-width="2.4" stroke-linejoin="round"/>
    </svg>`,
    { size: 128 },
  );
  const KITCROSS = svg(
    `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 5H25V15H35V25H25V35H15V25H5V15H15Z" fill="#e5454d" stroke="#ffffff" stroke-width="2.4" stroke-linejoin="round"/>
    </svg>`,
    { size: 128 },
  );

  // ------------------------------------------------------------------ helpers
  const P = (geo: THREE.BufferGeometry, color: ColorInput, bone: Joint, at: THREE.Vector3, o: Opts = {}) =>
    b.part(geo, color, { bone, at, ...o } as never);
  const R = (
    a: THREE.Vector3,
    c: THREE.Vector3,
    r0: number,
    r1: number,
    color: ColorInput,
    bone: Joint,
    o: Opts = {},
  ) => b.rod(a, c, [r0, r1], { color, bone, ...o } as never);
  const ball = (c: THREE.Vector3, r: number, color: ColorInput, bone: Joint, o: Opts = {}) =>
    P(new THREE.SphereGeometry(r, 8, 6), color, bone, c, { flat: true, ...o });
  const torus = (
    at: THREE.Vector3,
    r: number,
    tube: number,
    dir: THREE.Vector3 | number[],
    color: ColorInput,
    bone: Joint,
    seg = 12,
  ) => P(new THREE.TorusGeometry(r, tube, 5, seg), color, bone, at, { dir, axis: "z" });
  const prof = (keys: readonly (readonly [number, number])[]) => (t: number) => {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      if (t <= keys[i][0]) {
        const [t0, r0] = keys[i - 1];
        const [t1, r1] = keys[i];
        return r0 + (r1 - r0) * ((t - t0) / (t1 - t0));
      }
    }
    return keys[keys.length - 1][1];
  };
  const yaw = (c: THREE.Vector3, off: [number, number, number], deg: number) =>
    c.clone().add(new THREE.Vector3(...off).applyAxisAngle(new THREE.Vector3(0, 1, 0), deg * D2R));

  // ------------------------------------------------------------------ skeleton
  const root = b.joint("root", { at: V(0, 0, 0) });
  const hips = b.joint("hips", { parent: root, at: V(0, 0.95, 0), role: "spine" });
  const spine = b.chain("spine", polyline([V(0, 0.98, 0), V(0, 1.13, 0), V(0, 1.31, 0), V(0, 1.49, 0)]), {
    parent: hips,
    names: ["spine1", "spine2", "spine3"],
    role: "spine",
  });
  const chest = spine.joints[2];
  const neck = b.chain("neck", catmull([V(0, 1.47, 0), V(0, 1.555, 0.015), V(0, 1.64, 0.035)]), {
    parent: chest,
    names: ["neck1", "neck2"],
    role: "neck",
  });
  const head = b.joint("head", { parent: neck.joints[1], at: V(0, 1.64, 0.035), dir: [0, 1, 0.08], role: "head" });
  const jawJ = b.joint("jaw", { parent: head, at: V(0, 1.735, 0.0), aim: V(0, 1.655, 0.12), role: "jaw" });

  // ------------------------------------------------------------------ torso
  const suit = b.loft(
    [
      { at: V(0, 0.93, 0), w: 0.33, h: 0.2 },
      { at: V(0, 1.07, 0), w: 0.27, h: 0.185 },
      { at: V(0, 1.22, 0), w: 0.3, h: 0.2 },
      { at: V(0, 1.38, 0.005), w: 0.35, h: 0.225 },
      { at: V(0, 1.465, 0), w: 0.24, h: 0.17 },
    ],
    { bone: [hips, spine], color: SUIT } as never,
  );
  const cuirass = b.loft(
    [
      { at: V(0, 1.2, 0.015), w: 0.31, h: 0.215 },
      { at: V(0, 1.3, 0.03), w: 0.38, h: 0.255 },
      { at: V(0, 1.4, 0.035), w: 0.41, h: 0.27 },
      { at: V(0, 1.45, 0.012), w: 0.29, h: 0.2 },
    ],
    { bone: spine, color: ARMOR } as never,
  );
  const cs = b.surface(cuirass);
  const emblemHit = cs.ray(V(0, 1.35, 0.8), [0, 0, -1]);
  if (emblemHit)
    glow(b.decal(cs, EMBLEM, { at: emblemHit.at, dir: [0, 0, 1], size: [0.105, 0.105], bone: chest } as never), 0.9);
  b.sweep(cs.loop(V(0, 1.44, 0), { lift: 0.006 }), 0.008, { color: GOLD, bone: chest } as never);
  glow(b.sweep(cs.loop(V(0, 1.255, 0), { lift: 0.006 }), 0.007, { color: TEAL, bone: chest } as never), 1);

  // belt and waist
  const ss = b.surface(suit);
  b.sweep(ss.loop(V(0, 1.0, 0), { lift: 0.012 }), 0.03, { color: GLOVE, bone: hips } as never);
  P(new THREE.CylinderGeometry(0.04, 0.04, 0.022, 6), GOLD, hips, V(0, 1.0, 0.115), { dir: [0, 0, 1], flat: true });
  glow(ball(V(0, 1.0, 0.128), 0.016, TEAL_L, hips), 1.2);
  [1.17, 1.115, 1.06].forEach((y, i) => {
    P(new THREE.CylinderGeometry(0.142, 0.142, 0.042, 12), i === 1 ? GUN : ARMOR, spine.joints[0], V(0, y, 0), {
      scale: [1, 1, 0.76],
    });
  });
  for (const s of [1, -1]) {
    // hip plates & pouches
    ball(V(s * 0.165, 0.97, 0.005), 1, ARMOR, hips, { scale: [0.045, 0.1, 0.105] });
    torus(V(s * 0.205, 0.97, 0.005), 0.05, 0.006, [1, 0, 0], TEAL, hips, 8);
    // trapezius
    ball(V(s * 0.1, 1.49, 0.0), 1, SUIT, chest, { scale: [0.09, 0.045, 0.09] });
  }
  // right hip medical pouch, left hip canister
  P(new THREE.BoxGeometry(0.075, 0.1, 0.12), ARMOR, hips, V(-0.215, 0.9, 0.01));
  P(new THREE.BoxGeometry(0.004, 0.05, 0.05), WHITE, hips, V(-0.2535, 0.9, 0.01), {
    texture: KITCROSS,
    dir: [-1, 0, 0],
    axis: "z",
  });
  R(V(0.215, 0.85, 0.01), V(0.215, 0.96, 0.01), 0.032, 0.032, GOLD, hips, { section: { ngon: 8 } });
  R(V(0.215, 0.955, 0.01), V(0.215, 0.985, 0.01), 0.022, 0.022, TEAL_D, hips);

  // tabard hanging from the belt
  b.cards([frame(V(0, 0.975, 0.128), [0, 1, 0])], TABARD, {
    size: [0.17, 0.4],
    lean: 180,
    flow: [0, 0, 1],
    bend: 12,
    bone: hips,
  } as never);
  b.cards([frame(V(0, 0.975, -0.118), [0, 1, 0])], TABARD, {
    size: [0.15, 0.3],
    lean: 180,
    flow: [0, 0, -1],
    bend: 10,
    bone: hips,
    mirror: true,
  } as never);

  // collar
  P(new THREE.CylinderGeometry(0.072, 0.1, 0.075, 10), GUN, chest, V(0, 1.505, 0.005), { scale: [1, 1, 0.92] });
  torus(V(0, 1.545, 0.005), 0.074, 0.009, [0, 1, 0], GOLD, chest, 10);
  b.sweep(neck, [0.052, 0.046], { color: SKIN } as never);

  // ------------------------------------------------------------------ backpack
  const packC = V(0, 1.33, -0.175);
  P(new THREE.BoxGeometry(0.27, 0.32, 0.13), ARMOR, chest, packC);
  P(new THREE.BoxGeometry(0.28, 0.04, 0.14), GUN, chest, V(0, 1.185, -0.175));
  P(new THREE.BoxGeometry(0.28, 0.03, 0.14), GUN, chest, V(0, 1.485, -0.175));
  glow(
    P(new THREE.PlaneGeometry(0.17, 0.17), WHITE, chest, V(0, 1.34, -0.2415), {
      texture: EMBLEM,
      dir: [0, 0, -1],
      axis: "z",
    }),
    0.9,
  );
  for (const s of [1, -1]) {
    R(V(s * 0.1, 1.2, -0.2), V(s * 0.1, 1.12, -0.26), 0.032, 0.026, GUN, chest, { section: { ngon: 8 } });
    glow(ball(V(s * 0.1, 1.115, -0.263), 0.022, TEAL_L, chest), 1.2);
    // winged healing plates
    const wing = (scale: number, rot: number) => {
      const c = Math.cos(rot * D2R);
      const sn = Math.sin(rot * D2R);
      return [
        [0, 0],
        [0.14, 0.02],
        [0.28, 0.1],
        [0.4, 0.24],
        [0.45, 0.36],
        [0.3, 0.3],
        [0.14, 0.2],
        [0, 0.12],
      ].map(([u, v]) => [(u * c - v * sn) * scale, (u * sn + v * c) * scale] as [number, number]);
    };
    const base = V(s * 0.11, 1.4, -0.22);
    b.extrude(wing(1, 0), {
      at: base,
      x: [s * 0.8, 0, -0.6],
      y: [0, 1, 0],
      thickness: 0.012,
      color: WINGP,
      bone: chest,
    } as never);
    b.extrude(wing(1.14, -12), {
      at: base.clone().add(new THREE.Vector3(0, 0.0, 0.012)),
      x: [s * 0.8, 0, -0.6],
      y: [0, 1, 0],
      thickness: 0.006,
      color: "#d9f7fb",
      bone: chest,
    } as never);
    b.extrude(wing(0.82, 14), {
      at: base.clone().add(new THREE.Vector3(0, 0.0, -0.004)),
      x: [s * 0.8, 0, -0.6],
      y: [0, 1, 0],
      thickness: 0.018,
      color: TEAL_D,
      bone: chest,
    } as never);
    glow(
      b.extrude(wing(0.62, 28), {
        at: base.clone().add(new THREE.Vector3(0, 0.0, -0.008)),
        x: [s * 0.8, 0, -0.6],
        y: [0, 1, 0],
        thickness: 0.024,
        color: TEAL,
        bone: chest,
      } as never),
      1,
    );
    b.extrude(wing(0.4, 44), {
      at: base.clone().add(new THREE.Vector3(0, 0.0, -0.012)),
      x: [s * 0.8, 0, -0.6],
      y: [0, 1, 0],
      thickness: 0.03,
      color: GOLD,
      bone: chest,
    } as never);
  }

  // ------------------------------------------------------------------ head
  const HC = V(0, 1.765, 0.05);
  const skull = P(new THREE.SphereGeometry(1, 12, 9, 0, Math.PI * 2, 0, 2.043), SKIN, head, HC, {
    scale: [0.105, 0.12, 0.115],
  });
  const jawP = P(new THREE.CylinderGeometry(0.092, 0.046, 0.066, 10), SKIN, jawJ, V(0, 1.678, 0.062), {
    dir: [0, 1, -0.22],
    scale: [1, 1, 1.12],
  });
  const faceSurf = b.surface([skull, jawP]);
  const faceHit = (x: number, y: number) => faceSurf.ray(V(x, y, 0.9), [0, 0, -1])!;

  for (const s of [1, -1]) {
    const eh = faceHit(s * 0.048, 1.775);
    if (s > 0) {
      b.decal(faceSurf, EYE, { at: eh.at, dir: [0, 0, 1], size: [0.054, 0.036], mirror: true, bone: head } as never);
    } else {
      glow(b.decal(faceSurf, CYBER, { at: eh.at, dir: [0, 0, 1], size: [0.048, 0.048], bone: head } as never), 1.2);
      b.stick(new THREE.TorusGeometry(0.031, 0.0055, 5, 10).rotateX(Math.PI / 2), GOLD, eh, {
        embed: 0.35,
        bone: head,
      });
    }
    const bh = faceHit(s * 0.05, 1.808);
    b.stick(new THREE.BoxGeometry(0.052, 0.012, 0.01).rotateY(s * 6 * D2R), HAIR, bh, { embed: 0.3, bone: head });
    // ears
    if (s > 0) ball(V(0.103, 1.762, 0.04), 1, SKIN, head, { scale: [0.012, 0.028, 0.02] });
  }
  b.stick(new THREE.ConeGeometry(0.0145, 0.036, 5), SKIN, faceHit(0, 1.747), { embed: 0.25, bone: head });
  b.stick(new THREE.SphereGeometry(0.02, 8, 5), LIPS, faceHit(0, 1.722), {
    embed: 0.3,
    scale: [1.5, 0.5, 0.7],
    bone: head,
  } as never);
  b.stick(new THREE.SphereGeometry(0.02, 8, 5), LIPS, faceHit(0, 1.7), {
    embed: 0.3,
    scale: [1.4, 0.55, 0.75],
    bone: jawJ,
  } as never);
  ball(V(0, 1.662, 0.118), 1, SKIN, jawJ, { scale: [0.03, 0.022, 0.03] });

  // cybernetic cheek plate, ear and light line
  b.stick(new THREE.CylinderGeometry(0.03, 0.038, 0.012, 6), ARMOR, faceHit(-0.082, 1.74), {
    embed: 0.25,
    bone: head,
    scale: [1, 1, 1.15],
  } as never);
  P(new THREE.CylinderGeometry(0.03, 0.03, 0.022, 8), ARMOR, head, V(-0.108, 1.762, 0.04), { dir: [-1, 0, 0] });
  glow(torus(V(-0.12, 1.762, 0.04), 0.021, 0.0045, [-1, 0, 0], TEAL, head, 10), 1.2);
  R(V(-0.11, 1.79, 0.03), V(-0.125, 1.89, -0.02), 0.004, 0.003, STEEL, head);
  glow(ball(V(-0.126, 1.895, -0.022), 0.009, TEAL_L, head), 1.4);
  glow(
    b.sweep(
      faceSurf.drape(catmull([V(-0.085, 1.772, 0.115), V(-0.101, 1.77, 0.075), V(-0.104, 1.766, 0.045)]), {
        lift: 0.004,
      }),
      0.0032,
      { color: TEAL, bone: head } as never,
    ),
    1.2,
  );

  // hair
  const hairC = V(0, 1.769, 0.044);
  P(new THREE.SphereGeometry(0.126, 14, 9, 0, Math.PI * 2, 0, 78 * D2R), HAIR, head, hairC, {
    dir: [0, 0.84, -0.54],
  });
  const lockA: [number, number][] = [
    [-0.01, 0.03],
    [0.04, 0.045],
    [0.09, 0.03],
    [0.125, -0.01],
    [0.14, -0.065],
    [0.105, -0.04],
    [0.06, -0.03],
    [0.01, -0.015],
  ];
  const lockB: [number, number][] = [
    [0, 0.03],
    [0.05, 0.04],
    [0.1, 0.02],
    [0.118, -0.03],
    [0.085, -0.015],
    [0.04, -0.01],
  ];
  b.extrude(lockA, { at: V(-0.02, 1.85, 0.127), x: [1, 0, 0], y: [0, 1, 0], thickness: 0.02, color: HAIR, bone: head } as never);
  b.extrude(lockB, { at: V(-0.01, 1.862, 0.121), x: [1, 0, 0], y: [0, 1, 0], thickness: 0.016, color: HAIR, bone: head } as never);
  b.extrude(lockB, { at: V(0.0, 1.855, 0.124), x: [-1, 0, 0], y: [0, 1, 0], thickness: 0.016, color: HAIR, bone: head } as never);
  R(V(0.104, 1.82, 0.06), V(0.112, 1.74, 0.095), 0.016, 0.008, HAIR, head);
  P(new THREE.CylinderGeometry(0.012, 0.012, 0.016, 6), GOLD, head, V(0.115, 1.805, 0.075), { dir: [1, 0, 0] });

  // ponytail on its own chain
  const pony = b.chain(
    "pony",
    catmull([V(0, 1.82, -0.045), V(0, 1.835, -0.16), V(0, 1.78, -0.255), V(0, 1.68, -0.29), V(0, 1.585, -0.265)]),
    { parent: head, names: ["pony1", "pony2", "pony3", "pony4"], role: "tail" },
  );
  const ponyR = prof([
    [0, 0.03],
    [0.25, 0.046],
    [0.55, 0.04],
    [0.85, 0.024],
    [1, 0.004],
  ]);
  b.sweep(pony, ponyR, { color: HAIR } as never);
  for (const s of [1, -1])
    b.sweep(pony, (t: number) => ponyR(t) * 0.6, { color: HAIR, shift: [s * 0.024, 0], from: 0.2 } as never);
  const tie = pony.at(0.1);
  P(new THREE.TorusGeometry(0.036, 0.011, 6, 10), GOLD, pony.joints[0], tie.at, { dir: tie.tangent, axis: "z" });
  glow(ball(offset(tie.at, [0, 1, 0], 0.036), 0.011, TEAL_L, pony.joints[0]), 1.2);

  // ------------------------------------------------------------------ legs
  const buildLeg = (s: number) => {
    const k = s > 0 ? "L" : "R";
    const hip = V(s * 0.095, 0.93, 0);
    const knee = V(s * 0.1, 0.52, 0.035);
    const ankle = V(s * 0.095, 0.115, -0.005);
    const leg = b.chain(`leg${k}`, polyline([hip, knee, ankle]), {
      parent: hips,
      names: [`hip${k}`, `knee${k}`, `ankle${k}`],
      role: "leg",
      contact: V(s * 0.095, 0, 0.06),
    });
    const hipJ = leg.joints[0];
    const kneeJ = leg.joints[1];
    const ankleJ = leg.tip!;
    const toeJ = b.joint(`toe${k}`, {
      parent: ankleJ,
      at: V(s * 0.095, 0.045, 0.105),
      aim: V(s * 0.095, 0.03, 0.2),
      role: "digit",
    });
    const legR = prof([
      [0, 0.092],
      [0.2, 0.088],
      [0.45, 0.072],
      [0.52, 0.068],
      [0.65, 0.066],
      [0.85, 0.062],
      [1, 0.056],
    ]);
    b.sweep(leg, legR, { from: 0, to: 0.54, color: SUIT } as never);
    if (s > 0) b.sweep(leg, legR, { from: 0.46, to: 1, color: SUIT } as never);
    else b.sweep(leg, (t: number) => legR(t) * 0.86, { from: 0.46, to: 1, color: STEEL } as never);

    // thigh armour
    const tp = (u: number) => lerp(hip, knee, u).add(new THREE.Vector3(0, 0, 0.076));
    b.frustumBox(tp(0.08), tp(0.6), [0.115, 0.034], [0.096, 0.034], { color: ARMOR, bone: hipJ } as never);
    b.frustumBox(tp(0.62), tp(0.7), [0.1, 0.04], [0.1, 0.04], { color: TEAL_D, bone: hipJ } as never);
    // knee
    const kp = knee.clone().add(new THREE.Vector3(0, 0, 0.074));
    P(new THREE.CylinderGeometry(0.056, 0.062, 0.04, 6), ARMOR, kneeJ, kp, { dir: [0, 0.1, 1] });
    torus(kp.clone().add(new THREE.Vector3(0, 0, 0.018)), 0.048, 0.008, [0, 0.1, 1], GOLD, kneeJ, 6);
    glow(ball(kp.clone().add(new THREE.Vector3(0, 0, 0.026)), 0.014, TEAL_L, kneeJ), 1.2);
    // shin
    const sa = (u: number, d: number) => lerp(knee, ankle, u).add(new THREE.Vector3(0, 0, d));
    if (s > 0) {
      b.frustumBox(sa(0.14, 0.064), sa(0.8, 0.045), [0.088, 0.032], [0.064, 0.03], { color: ARMOR, bone: kneeJ } as never);
      R(sa(0.2, 0.0), sa(0.85, 0.0), 0.012, 0.012, TEAL_D, kneeJ, { shift: [0.062, 0] });
    } else {
      b.frustumBox(sa(0.14, 0.058), sa(0.38, 0.05), [0.08, 0.03], [0.066, 0.03], { color: ARMOR, bone: kneeJ } as never);
      b.sweep(coil(sa(0.42, -0.02), sa(0.82, -0.032), 0.036, 7), 0.0042, { color: GOLD, bone: kneeJ } as never);
      R(sa(0.36, -0.052), sa(0.86, -0.062), 0.01, 0.01, GUN, kneeJ);
      glow(R(sa(0.2, 0.0), sa(0.8, 0.0), 0.006, 0.006, TEAL, kneeJ, { shift: [-0.052, 0] }), 1.1);
    }
    // ankle cuff and boot
    R(lerp(knee, ankle, 0.84), V(s * 0.095, 0.085, -0.005), 0.058, 0.062, ARMOR, ankleJ, { section: { ngon: 8 } });
    P(new THREE.BoxGeometry(0.1, 0.075, 0.19), ARMOR, ankleJ, V(s * 0.095, 0.082, 0.03));
    P(new THREE.BoxGeometry(0.104, 0.012, 0.17), TEAL_D, ankleJ, V(s * 0.095, 0.05, 0.03));
    P(new THREE.BoxGeometry(0.108, 0.035, 0.18), SOLE, ankleJ, V(s * 0.095, 0.0175, 0.005));
    P(new THREE.BoxGeometry(0.108, 0.03, 0.1), SOLE, toeJ, V(s * 0.095, 0.015, 0.145));
    ball(V(s * 0.095, 0.06, 0.145), 1, GOLD, toeJ, { scale: [0.05, 0.038, 0.065] });
    if (s < 0) glow(torus(V(s * 0.095, 0.1, -0.005), 0.058, 0.006, [0, 1, 0], TEAL, ankleJ, 10), 1.1);
  };
  buildLeg(1);
  buildLeg(-1);

  // ------------------------------------------------------------------ arms
  const finger = (name: string, parent: Joint, pts: THREE.Vector3[], r0: number, r1: number, color: ColorInput) => {
    const ch = b.chain(name, catmull(pts), {
      parent,
      names: pts.map((_, i) => `${name}_${i + 1}`),
      role: "digit",
    });
    b.sweep(ch, [r0, r1], { color } as never);
    return ch;
  };
  const FINGERS = ["pinky", "ring", "middle", "index"];
  let wristL: Joint | null = null;

  const buildArm = (s: number) => {
    const k = s > 0 ? "L" : "R";
    const sh = V(s * 0.205, 1.43, 0);
    const el = V(s * 0.31, 1.16, -0.01);
    const wr = V(s * 0.385, 0.925, 0.075);
    const clav = b.joint(`clavicle${k}`, { parent: chest, at: V(s * 0.06, 1.46, 0.0), aim: sh });
    const arm = b.chain(`arm${k}`, polyline([sh, el, wr]), {
      parent: clav,
      names: [`shoulder${k}`, `elbow${k}`, `wrist${k}`],
      role: "arm",
    });
    const uJ = arm.joints[0];
    const fJ = arm.joints[1];
    const wJ = arm.tip!;
    const tilt = new THREE.Vector3(s * 0.45, 0.9, 0.05).normalize();
    const pc = V(s * 0.225, 1.475, 0);

    if (s > 0) {
      // ---- organic left arm in a suit sleeve
      b.sweep(
        arm,
        prof([
          [0, 0.058],
          [0.3, 0.05],
          [0.53, 0.043],
          [0.6, 0.04],
          [1, 0.032],
        ]),
        { color: SUIT } as never,
      );
      // pauldron
      ball(sh.clone().add(new THREE.Vector3(0, 0.0, 0)), 0.062, SUIT, uJ);
      P(new THREE.SphereGeometry(1, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), ARMOR, uJ, pc, {
        dir: tilt,
        scale: [0.108, 0.078, 0.102],
      });
      torus(pc, 0.104, 0.011, tilt, GOLD, uJ, 12);
      torus(pc.clone().add(tilt.clone().multiplyScalar(0.03)), 0.082, 0.007, tilt, TEAL, uJ, 12);
      glow(ball(pc.clone().add(tilt.clone().multiplyScalar(0.07)), 0.014, TEAL_L, uJ), 1.3);
      // upper-arm band, elbow pad, bracer
      R(lerp(sh, el, 0.56), lerp(sh, el, 0.74), 0.052, 0.05, ARMOR, uJ, { section: { ngon: 8 } });
      R(lerp(sh, el, 0.74), lerp(sh, el, 0.78), 0.054, 0.054, TEAL_D, uJ, { section: { ngon: 8 } });
      ball(el.clone().add(new THREE.Vector3(0.0, 0, -0.03)), 0.05, ARMOR, fJ);
      R(lerp(el, wr, 0.26), lerp(el, wr, 0.98), 0.052, 0.042, ARMOR, fJ, { section: { ngon: 8 } });
      R(lerp(el, wr, 0.26), lerp(el, wr, 0.32), 0.056, 0.056, GOLD, fJ, { section: { ngon: 8 } });
      glow(R(lerp(el, wr, 0.5), lerp(el, wr, 0.9), 0.005, 0.005, TEAL, fJ, { shift: [-0.04, 0] }), 1.1);
      // glove, palm and staff grip
      const cx = 0.42;
      const cz = 0.14;
      const fr = 0.029;
      P(new THREE.BoxGeometry(0.046, 0.088, 0.06), GLOVE, wJ, V(0.4, 0.865, 0.103));
      P(new THREE.BoxGeometry(0.05, 0.02, 0.064), ARMOR, wJ, V(0.395, 0.935, 0.085));
      torus(V(0.39, 0.93, 0.078), 0.036, 0.007, [0.18, -1, 0.3], TEAL, wJ, 8);
      FINGERS.forEach((nm, i) => {
        const y = 0.832 + i * 0.0225;
        const end = 70 + i * 10;
        const pts = [0, 1, 2, 3].map((j) => {
          const d = -105 + ((end + 105) * j) / 3;
          return V(cx + Math.sin(d * D2R) * fr, y, cz + Math.cos(d * D2R) * fr);
        });
        finger(`${nm}${k}`, wJ, pts, 0.0105, 0.009, GLOVE);
      });
      finger(`thumb${k}`, wJ, [V(0.392, 0.895, 0.105), V(0.4, 0.918, 0.135), V(0.425, 0.926, 0.172)], 0.012, 0.01, GLOVE);
      wristL = wJ;
    } else {
      // ---- cybernetic right arm
      b.sweep(
        arm,
        prof([
          [0, 0.046],
          [0.5, 0.038],
          [0.56, 0.034],
          [1, 0.028],
        ]),
        { color: GUN } as never,
      );
      ball(sh, 0.056, GUN, uJ);
      // smaller segmented pauldron with an orange stripe
      P(new THREE.SphereGeometry(1, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), ARMOR, uJ, pc, {
        dir: tilt,
        scale: [0.09, 0.062, 0.088],
        flat: true,
      });
      torus(pc, 0.088, 0.01, tilt, STEEL, uJ, 8);
      torus(pc.clone().add(tilt.clone().multiplyScalar(0.022)), 0.07, 0.006, tilt, ORANGE, uJ, 8);
      glow(ball(pc.clone().add(tilt.clone().multiplyScalar(0.06)), 0.013, TEAL_L, uJ), 1.3);
      // upper arm: spring, pistons, rings
      b.sweep(coil(lerp(sh, el, 0.16), lerp(sh, el, 0.82), 0.047, 7), 0.0045, { color: GOLD, bone: uJ } as never);
      R(lerp(sh, el, 0.1).add(new THREE.Vector3(0, 0, -0.05)), lerp(sh, el, 0.9).add(new THREE.Vector3(0, 0, -0.05)), 0.009, 0.009, STEEL, uJ);
      R(lerp(sh, el, 0.2), lerp(sh, el, 0.26), 0.054, 0.054, ARMOR, uJ, { section: { ngon: 6 } });
      R(lerp(sh, el, 0.78), lerp(sh, el, 0.86), 0.054, 0.054, ARMOR, uJ, { section: { ngon: 6 } });
      // elbow joint
      ball(el, 0.048, GUN, fJ);
      glow(torus(el.clone().add(new THREE.Vector3(s * 0.04, 0, 0)), 0.03, 0.006, [1, 0, 0], TEAL, fJ, 10), 1.2);
      // forearm gauntlet
      R(lerp(el, wr, 0.12), lerp(el, wr, 0.7), 0.06, 0.052, ARMOR, fJ, { section: { ngon: 6 } });
      R(lerp(el, wr, 0.12), lerp(el, wr, 0.17), 0.064, 0.064, ORANGE, fJ, { section: { ngon: 6 } });
      R(lerp(el, wr, 0.7), lerp(el, wr, 0.96), 0.038, 0.034, STEEL, fJ, { section: { ngon: 8 } });
      glow(R(lerp(el, wr, 0.2), lerp(el, wr, 0.64), 0.005, 0.005, TEAL, fJ, { shift: [s * 0.06, 0] }), 1.2);
      glow(torus(lerp(el, wr, 0.74), 0.042, 0.006, arm.at(0.8).tangent, TEAL, fJ, 10), 1.2);
      // forearm health monitor
      const sd = new THREE.Vector3(s * 0.5, 0.05, 0.85).normalize();
      glow(
        P(new THREE.PlaneGeometry(0.075, 0.047), WHITE, fJ, lerp(el, wr, 0.42).add(sd.clone().multiplyScalar(0.059)), {
          dir: sd,
          axis: "z",
          texture: ECG,
        }),
        1.1,
      );
      // hand
      P(new THREE.BoxGeometry(0.04, 0.085, 0.075), GUN, wJ, V(-0.405, 0.865, 0.085));
      P(new THREE.BoxGeometry(0.014, 0.07, 0.064), ARMOR, wJ, V(-0.428, 0.868, 0.085));
      FINGERS.forEach((nm, i) => {
        const fl = [0.8, 0.95, 1.0, 0.9][i];
        const z = 0.058 + i * 0.018;
        const pts = [0, 1, 2, 3].map((j) =>
          V(-0.405, 0.822 - j * 0.033 * fl, z + [0, 0.003, 0.014, 0.03][j]),
        );
        const ch = finger(`${nm}${k}`, wJ, pts, 0.0095, 0.0075, STEEL);
        glow(ball(pts[3], 0.0085, TEAL, ch.tip!), 1.2);
      });
      const th = finger(`thumb${k}`, wJ, [V(-0.388, 0.85, 0.12), V(-0.38, 0.82, 0.147), V(-0.378, 0.79, 0.165)], 0.011, 0.009, STEEL);
      glow(ball(V(-0.378, 0.787, 0.168), 0.009, TEAL, th.tip!), 1.2);
    }
  };
  buildArm(1);
  buildArm(-1);

  // ------------------------------------------------------------------ healing staff
  const cx = 0.42;
  const cz = 0.14;
  const S = (y: number) => V(cx, y, cz);
  const staffJ = b.joint("staff", { parent: wristL!, at: S(0.9), dir: [0, 1, 0] });
  R(S(0.07), S(1.7), 0.0165, 0.0165, STAFFP, staffJ, { section: "circle", sides: 8 });
  P(new THREE.ConeGeometry(0.022, 0.075, 6), GOLD, staffJ, S(0.0375), { dir: [0, -1, 0], flat: true });
  [0.085, 0.5, 1.3].forEach((y) => R(S(y - 0.012), S(y + 0.012), 0.0215, 0.0215, GOLD, staffJ, { section: { ngon: 8 } }));
  R(S(0.78), S(0.99), 0.0185, 0.0185, GLOVE, staffJ, { section: { ngon: 8 } });
  glow(R(S(1.0), S(1.28), 0.004, 0.004, TEAL, staffJ, { shift: [0.017, 0] }), 1);
  R(S(1.66), S(1.76), 0.022, 0.036, GOLD, staffJ, { section: { ngon: 8 } });
  R(S(1.76), S(1.795), 0.036, 0.026, GOLD, staffJ, { section: { ngon: 8 } });
  for (const s of [1, -1]) {
    const pts = [
      V(cx + s * 0.028, 1.79, cz),
      V(cx + s * 0.085, 1.83, cz),
      V(cx + s * 0.093, 1.9, cz),
      V(cx + s * 0.05, 1.96, cz),
      V(cx, 1.985, cz),
    ];
    b.sweep(catmull(pts), [0.013, 0.006], { color: GOLD, bone: staffJ, caps: { start: "flat", end: "round" } } as never);
    b.extrude(
      [
        [0, 0],
        [0.05, 0.01],
        [0.1, 0.035],
        [0.14, 0.07],
        [0.155, 0.11],
        [0.11, 0.09],
        [0.06, 0.06],
        [0, 0.04],
      ],
      { at: S(1.69), x: [s, 0, 0], y: [0, 1, 0], thickness: 0.012, color: GOLD, bone: staffJ } as never,
    );
  }
  glow(
    P(new THREE.IcosahedronGeometry(0.057, 1), TEAL_L, staffJ, S(1.875), { flat: true }),
    1.5,
  );
  glow(torus(S(1.875), 0.092, 0.005, [0.25, 1, 0.3], TEAL, staffJ, 16), 1.3);
  glow(torus(S(1.875), 0.075, 0.004, [-0.3, 0.9, -0.4], TEAL_L, staffJ, 14), 1.2);
  P(new THREE.ConeGeometry(0.014, 0.055, 6), GOLD, staffJ, S(2.012), { flat: true });
  // floating healing crosses spiralling round the orb
  const sparks = Array.from({ length: 9 }, (_, i) => {
    const a = i * 2.4;
    const r = 0.1 + 0.035 * (i % 3);
    const y = 1.72 + i * 0.045;
    return frame(V(cx + Math.cos(a) * r, y, cz + Math.sin(a) * r), [0, 1, 0]);
  });
  glow(
    b.cards(sparks, PLUS, { size: 0.055, flow: [0, 0, 1], cross: true, vary: 0.35, rng: rand, bone: staffJ } as never),
    1.4,
  );

  // ------------------------------------------------------------------ staging base
  b.part(new THREE.CylinderGeometry(0.8, 0.86, G, 6), BASEP, { bone: root, at: new THREE.Vector3(0, G / 2, 0), flat: true } as never);
  b.part(new THREE.CylinderGeometry(0.72, 0.72, 0.012, 6), TILE, {
    bone: root,
    at: new THREE.Vector3(0, G + 0.006, 0),
    flat: true,
  } as never);
  glow(
    b.part(new THREE.TorusGeometry(0.765, 0.008, 4, 6), TEAL, {
      bone: root,
      at: new THREE.Vector3(0, G + 0.014, 0),
      dir: [0, 1, 0],
      axis: "z",
    } as never),
    1.2,
  );
  glow(
    b.part(new THREE.PlaneGeometry(1.36, 1.36), WHITE, {
      bone: root,
      at: new THREE.Vector3(0, G + 0.02, 0),
      dir: [0, 1, 0],
      axis: "z",
      texture: HOLO,
    } as never),
    1,
  );
  for (let i = 0; i < 6; i++) {
    const a = i * 60 * D2R;
    const px = Math.sin(a) * 0.75;
    const pz = Math.cos(a) * 0.75;
    P(new THREE.CylinderGeometry(0.022, 0.028, 0.045, 6), GOLD, root, new THREE.Vector3(px, G + 0.03, pz), { flat: true });
    glow(P(new THREE.OctahedronGeometry(0.02), TEAL_L, root, new THREE.Vector3(px, G + 0.07, pz), { flat: true }), 1.4);
  }

  // medkit
  const kitC = new THREE.Vector3(-0.5, G + 0.075, 0.3);
  P(new THREE.BoxGeometry(0.27, 0.15, 0.11), ARMOR, root, kitC, { rotation: [0, 25, 0] });
  P(new THREE.BoxGeometry(0.28, 0.02, 0.12), GUN, root, kitC.clone().add(new THREE.Vector3(0, 0.005, 0)), { rotation: [0, 25, 0] });
  P(new THREE.TorusGeometry(0.04, 0.008, 5, 8, Math.PI), GOLD, root, kitC.clone().add(new THREE.Vector3(0, 0.08, 0)), {
    rotation: [0, 25, 0],
  });
  P(new THREE.PlaneGeometry(0.09, 0.09), WHITE, root, yaw(kitC, [0, 0.0, 0.0565], 25), {
    dir: yaw(new THREE.Vector3(0, 0, 0), [0, 0, 1], 25),
    axis: "z",
    texture: KITCROSS,
  });
  for (const sx of [-1, 1]) P(new THREE.BoxGeometry(0.03, 0.03, 0.012), GOLD, root, yaw(kitC, [sx * 0.085, 0.03, 0.057], 25), { rotation: [0, 25, 0] });

  // hover drone
  const D = V(-0.72, 1.55, 0.2);
  P(new THREE.SphereGeometry(0.075, 10, 7), ARMOR, root, D, { scale: [1, 0.85, 1] });
  glow(torus(D, 0.098, 0.009, [0, 1, 0], TEAL, root, 14), 1.2);
  glow(
    P(new THREE.PlaneGeometry(0.06, 0.06), WHITE, root, D.clone().add(new THREE.Vector3(0.0, 0.0, 0.0735)), {
      dir: [0, 0, 1],
      axis: "z",
      texture: CYBER,
    }),
    1.1,
  );
  for (const s of [1, -1]) {
    P(new THREE.BoxGeometry(0.02, 0.05, 0.07), GOLD, root, D.clone().add(new THREE.Vector3(s * 0.085, 0.02, -0.01)));
    glow(ball(D.clone().add(new THREE.Vector3(s * 0.085, 0.052, -0.01)), 0.01, TEAL_L, root), 1.3);
  }
  P(new THREE.ConeGeometry(0.03, 0.05, 6), TEAL_D, root, D.clone().add(new THREE.Vector3(0, -0.085, 0)), { dir: [0, -1, 0], flat: true });
  glow(ball(D.clone().add(new THREE.Vector3(0, -0.112, 0)), 0.012, TEAL_L, root), 1.4);
  R(D.clone().add(new THREE.Vector3(0, 0.06, -0.02)), D.clone().add(new THREE.Vector3(0, 0.13, -0.04)), 0.004, 0.003, STEEL, root);
  glow(ball(D.clone().add(new THREE.Vector3(0, 0.135, -0.04)), 0.01, ORANGE, root), 1.3);

  // rising healing motes around the pad
  const motes = Array.from({ length: 12 }, (_, i) => {
    const a = i * 2.1 + 0.4;
    const r = 0.5 + 0.18 * ((i * 5) % 3);
    return frame(V(Math.sin(a) * r, 0.1 + ((i * 7) % 12) * 0.075, Math.cos(a) * r), [0, 1, 0]);
  });
  glow(
    b.cards(motes, PLUS, { size: 0.05, flow: [0, 0, 1], cross: true, vary: 0.4, rng: rand, bone: root } as never),
    1.4,
  );

  return b.root;
}
