import * as THREE from "three";
import {
  createBuilder,
  rng,
  catmull,
  bezier,
  polyline,
  limb,
  frame,
  offset,
  paint,
  noise,
  mix,
  smoothstep,
  patches,
  svg,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { cel } from "../../../../kits/toon";

export const meta = {
  name: "Basalt Lava Golem",
  description:
    "A hulking Pyro-style lava golem: hex basalt plates, gold trim, molten seams, a glowing Pyro emblem and a rune halo, standing in a lava pool on a rune-carved stage.",
};

export default function build() {
  const b = createBuilder({ name: "basaltLavaGolem" });
  const R = rng(7);
  const Y0 = 0.18; // top of the stage

  // ------------------------------------------------------------------ textures
  const EMBLEM = svg(
    `<svg viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="47" fill="#2b100c" stroke="#ffcf5a" stroke-width="4"/>
    <circle cx="50" cy="50" r="38" fill="none" stroke="#ff7a1c" stroke-width="2.4" stroke-dasharray="6 4"/>
    <path d="M50 14 C58 28 74 36 70 56 C68 70 58 80 50 84 C42 80 32 70 30 56 C28 44 36 38 40 28 C42 34 46 36 48 34 C50 28 50 22 50 14Z" fill="#ff6a1a" stroke="#ffd25a" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M50 40 C56 50 62 56 58 66 C56 72 52 75 50 76 C46 74 42 70 42 62 C42 54 48 50 50 40Z" fill="#ffd25a"/>
    <path d="M50 56 C53 61 55 64 52 69 C51 71 49 71 48 69 C45 65 48 60 50 56Z" fill="#fff6c8"/>
  </svg>`,
    { size: 256 },
  );
  const eyeTex = (flip: boolean) =>
    svg(
      `<svg viewBox="0 0 64 32"><g ${flip ? 'transform="translate(64 0) scale(-1 1)"' : ""}>
      <path d="M1 22 Q22 1 63 5 Q46 30 1 22Z" fill="#c8420f"/>
      <path d="M6 20 Q24 7 56 8 Q42 24 6 20Z" fill="#ff9a2a"/>
      <path d="M14 17 Q30 11 48 11 Q38 19 14 17Z" fill="#fff0a8"/></g></svg>`,
      { size: 128 },
    );
  const EYE_A = eyeTex(false);
  const EYE_B = eyeTex(true);
  const FLAME = svg(
    `<svg viewBox="0 0 48 96"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0">
    <stop offset="0" stop-color="#ff3a0c"/><stop offset=".55" stop-color="#ff8f26"/><stop offset="1" stop-color="#ffe27a"/></linearGradient></defs>
    <path d="M24 94 C6 88 2 66 12 50 C16 42 14 32 20 22 C22 30 28 32 28 24 C30 16 28 8 24 2 C38 14 46 34 44 58 C43 78 36 90 24 94Z" fill="url(#g)"/>
    <path d="M24 90 C14 84 14 68 20 58 C24 50 24 44 26 38 C34 52 38 66 34 78 C32 84 28 88 24 90Z" fill="#ffd25a" opacity=".9"/></svg>`,
    { size: 128 },
  );
  const CRACK = svg(
    `<svg viewBox="0 0 64 64"><g fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="M32 2 L28 14 L36 24 L26 36 L34 46 L30 62 M36 24 L50 28 M26 36 L12 34 M34 46 L46 52" stroke="#d2480f" stroke-width="6"/>
    <path d="M32 2 L28 14 L36 24 L26 36 L34 46 L30 62 M36 24 L50 28 M26 36 L12 34 M34 46 L46 52" stroke="#ffd25a" stroke-width="2.6"/></g></svg>`,
    { size: 128 },
  );
  const glyph = (d: string) =>
    svg(
      `<svg viewBox="0 0 64 64"><g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="${d}" stroke="#7a2208" stroke-width="9"/><path d="${d}" stroke="#ffb340" stroke-width="5"/><path d="${d}" stroke="#fff0a8" stroke-width="1.8"/></g></svg>`,
      { size: 128 },
    );
  const G1 = glyph("M32 6 L32 58 M14 20 L32 34 L50 20 M16 46 L48 46");
  const G2 = glyph("M32 6 L56 32 L32 58 L8 32 Z M32 20 L32 44 M20 32 L44 32");
  const G3 = glyph("M32 8 L52 44 L12 44 Z M32 56 L32 30 M22 56 L42 56");
  const GLYPHS = [G1, G2, G3];
  const POOL = svg(
    `<svg viewBox="0 0 128 128"><defs><radialGradient id="r"><stop offset="0" stop-color="#ffe27a"/><stop offset=".45" stop-color="#ff8a1c"/><stop offset=".85" stop-color="#e03a0e"/><stop offset="1" stop-color="#8a1c0a"/></radialGradient></defs>
    <rect width="128" height="128" fill="url(#r)"/>
    <g fill="#4a1a10" opacity=".8"><path d="M14 40 L30 28 L42 42 L32 56 L16 54Z"/><path d="M92 20 L110 30 L106 48 L90 42Z"/><path d="M100 84 L116 92 L108 108 L92 100Z"/><path d="M20 90 L38 84 L44 100 L26 108Z"/><path d="M60 8 L76 12 L70 24Z"/></g>
    <g stroke="#ffe27a" stroke-width="2.4" fill="none" stroke-linecap="round"><path d="M30 64 Q50 50 70 66 T108 60"/><path d="M40 100 Q60 88 80 100"/><path d="M50 30 Q64 40 84 30"/></g></svg>`,
    { size: 256 },
  );

  // ------------------------------------------------------------------ materials
  const stoneBase = patches("#332e44", ["#6a6486", "#766f95", "#5d5879", "#6e6b90"], { size: 0.17, gap: 0.07, seed: 3 });
  const ASH = [0.62, 0.58, 0.64] as const;
  const EMBER = [1, 0.42, 0.1] as const;
  const BASALT = cel(
    paint((p, n) => {
      let c = stoneBase.at(p, n);
      c = mix(c, ASH, smoothstep(0.55, 0.95, n.y) * (0.3 + 0.5 * noise(p, 0.2, 5)) * 0.6);
      const under = Math.min(smoothstep(0.2, -0.6, n.y) * 0.5 + smoothstep(0.7, 0.18, p.y) * 0.5, 0.8);
      return mix(c, EMBER, under * 0.55);
    }),
  );
  const BASALT2 = cel(
    paint((p, n) => {
      const c = patches("#2a2538", ["#4e4868", "#575175", "#433e5b"], { size: 0.13, gap: 0.08, seed: 9 }).at(p, n);
      return mix(c, EMBER, Math.min(smoothstep(0.5, 0.1, p.y), 0.8) * 0.4);
    }),
  );
  const OBS = cel("#3a3358", "#1e1a38");
  const GOLD = cel(
    paint((p) => mix("#e9b24a", "#ffe08a", noise(p, 0.15, 2))),
    "#a8641f",
  );
  const TEETH = cel("#f5e8c9", "#d2b48a");
  const LAVA = "#ff5a14";
  const HOT = "#ffb52e";

  // ------------------------------------------------------------------ helpers
  const hexPlate = (w: number, h: number, t: number) =>
    new THREE.CylinderGeometry(0.5, 0.5, t, 6).scale(w / 0.866, 1, h);
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const hexOutline = (hw: number, hh: number): [number, number][] => [
    [0, hh],
    [hw, hh * 0.5],
    [hw, -hh * 0.5],
    [0, -hh],
    [-hw, -hh * 0.5],
    [-hw, hh * 0.5],
  ];
  const blk = (bone: any, at: number[], size: number[], rot: number[] = [0, 0, 0], color: any = BASALT) =>
    b.part(box(size[0], size[1], size[2]), color, { bone, at, rotation: rot });
  const keyAt = (k: number[], t: number) => {
    const x = t * (k.length - 1);
    const i = Math.min(Math.floor(x), k.length - 2);
    return k[i] + (k[i + 1] - k[i]) * (x - i);
  };
  const lit = (tex: any, w: number, h: number, bone: any, at: any, dir: any, up: any, str = 1) =>
    glow(
      b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone, at, dir, axis: "z", up, texture: tex }),
      str,
    );
  const goldRing = (cp: any, r: number, tube = 0.03) =>
    b.part(new THREE.TorusGeometry(r, tube, 4, 8), GOLD, { bone: cp.bone, at: cp.at, dir: cp.axis, axis: "z" });
  const band = (ch: any, t: number, rad: number, n: number, w: number, len: number, th: number, color: any, off = 0) => {
    const cp = ch.at(t);
    b.ring(cp, { count: n, radius: rad, fromDeg: off, toDeg: off + (360 * (n - 1)) / n }, (it: any) => {
      b.stick(hexPlate(w * (0.92 + 0.16 * R()), len, th), color, it, {
        flow: cp.tangent,
        embed: 0.3,
        bone: cp.bone,
        flat: true,
      });
    });
  };
  const outward = (cp: any, want: number[]) => {
    const w = new THREE.Vector3(want[0], want[1], want[2]);
    let best = cp.binormal.clone();
    let bd = -9;
    for (const c of [cp.binormal, cp.normal])
      for (const sg of [1, -1]) {
        const v = c.clone().multiplyScalar(sg);
        const d = v.dot(w);
        if (d > bd) {
          bd = d;
          best = v;
        }
      }
    return best.normalize();
  };
  const slabOn = (ch: any, t: number, want: number[], rad: number, size: number[], color: any, tex?: any) => {
    const cp = ch.at(t);
    const d = outward(cp, want);
    const f = frame(offset(cp.at, d, rad), d);
    b.stick(box(size[0], size[1], size[2]), color, f, { flow: cp.tangent, embed: 0.3, bone: cp.bone });
    if (tex)
      lit(
        tex,
        Math.min(size[0], size[2]) * 0.8,
        Math.min(size[0], size[2]) * 0.8,
        cp.bone,
        offset(cp.at, d, rad + size[1] * 0.7 + 0.004),
        d,
        cp.tangent.clone().negate(),
      );
  };
  const flames = (bone: any, pts: number[][], size: number[], flow: number[], lean = 20, bend = 25) =>
    glow(
      b.cards(
        pts.map((p) => frame(p, [0, 1, 0])),
        FLAME,
        { size, lean, bend, flow, cross: true, vary: 0.3, rng: R, spin: 12, bone },
      ),
      1.2,
    );

  // ------------------------------------------------------------------ skeleton
  const hips = b.joint("hips", { at: [0, 1.1, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.1, 0],
      [0, 1.5, 0.02],
      [0, 1.9, 0.08],
      [0, 2.3, 0.05],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const spine3 = spine.joints[2];
  const neck = b.chain(
    "neck",
    polyline([
      [0, 2.3, 0.05],
      [0, 2.52, 0.22],
    ]),
    { parent: spine3, names: ["neck"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[0], at: [0, 2.52, 0.22], dir: [0, 0.15, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 2.54, 0.12], aim: [0, 2.5, 0.5], role: "jaw" });

  // ------------------------------------------------------------------ stage
  b.part(new THREE.CylinderGeometry(1.8, 1.95, 0.12, 12), BASALT2, { bone: hips, at: [0, 0.06, 0], flat: true });
  b.part(new THREE.CylinderGeometry(1.55, 1.7, 0.06, 12), BASALT, { bone: hips, at: [0, 0.15, 0], flat: true });
  b.part(new THREE.TorusGeometry(1.56, 0.03, 4, 12), GOLD, { bone: hips, at: [0, Y0 + 0.005, 0], rotation: [90, 0, 0] });
  glow(
    b.part(new THREE.CircleGeometry(1.12, 24), "#ffffff", {
      bone: hips,
      at: [0, Y0 + 0.004, 0],
      dir: [0, 1, 0],
      axis: "z",
      up: [0, 0, 1],
      texture: POOL,
    }),
    1,
  );
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + 0.26;
    const rx = Math.sin(a);
    const rz = Math.cos(a);
    lit(GLYPHS[i % 3], 0.2, 0.2, hips, [rx * 1.34, Y0 + 0.004, rz * 1.34], [0, 1, 0], [rx, 0, rz], 0.9);
  }
  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * Math.PI * 2 + R() * 0.3;
    const rr = 1.5 + R() * 0.12;
    const sz = 0.1 + R() * 0.16;
    b.part(new THREE.DodecahedronGeometry(sz, 0), i % 3 ? BASALT : BASALT2, {
      bone: hips,
      at: [Math.sin(a) * rr, Y0 + sz * 0.45, Math.cos(a) * rr],
      rotation: [R() * 80, R() * 360, R() * 80],
      scale: [1, 0.8, 1],
      flat: true,
    });
  }
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + 0.5;
    const h = 0.4 + R() * 0.25;
    const d = [Math.sin(a) * 0.3, 1, Math.cos(a) * 0.3];
    glow(
      b.part(new THREE.ConeGeometry(0.075, h, 6), "#ff8a2a", {
        bone: hips,
        at: [Math.sin(a) * 1.38, Y0 + h * 0.4, Math.cos(a) * 1.38],
        dir: d,
        flat: true,
      }),
      1.1,
    );
  }
  [
    [-1.4, -0.55, 0.5],
    [1.45, -0.45, 0.42],
    [0.95, -1.15, 0.38],
  ].forEach(([x, z, h]) => {
    b.part(new THREE.CylinderGeometry(0.22, 0.26, h, 6), BASALT, { bone: hips, at: [x, Y0 + h / 2, z], flat: true });
    glow(b.part(new THREE.CylinderGeometry(0.19, 0.19, 0.03, 6), HOT, { bone: hips, at: [x, Y0 + h + 0.005, z], flat: true }), 1.2);
  });
  for (let i = 0; i < 16; i++) {
    const a = R() * Math.PI * 2;
    const rr = 1.05 + R() * 0.5;
    glow(
      b.part(new THREE.OctahedronGeometry(0.025 + R() * 0.02, 0), i % 2 ? HOT : "#ff7a1c", {
        bone: hips,
        at: [Math.sin(a) * rr, 0.7 + R() * 2.8, Math.cos(a) * rr],
        flat: true,
      }),
      1.3,
    );
  }

  // ------------------------------------------------------------------ torso
  const torso = b.loft(
    [
      { at: [0, 1.1, 0], w: 0.78, h: 0.56 },
      { at: [0, 1.5, 0.02], w: 0.74, h: 0.6 },
      { at: [0, 1.9, 0.08], w: 1.12, h: 0.86 },
      { at: [0, 2.3, 0.05], w: 1.24, h: 0.74 },
    ],
    { bone: spine, color: LAVA, caps: "flat" },
  );
  glow(torso, 1.15);
  const skin = b.surface(torso);

  const row = (y: number, cz: number, n: number, w: number, h: number, th: number, color: any, skipFront: number, phase: number) => {
    for (let i = 0; i < n; i++) {
      const az = (phase + i / n) * 360;
      const a = ((az + 180) % 360) - 180;
      if (Math.abs(a) < skipFront) continue;
      const hit = skin.around([0, y, cz]).at(az, 0);
      if (!hit) continue;
      b.stick(hexPlate(w * (0.9 + 0.2 * R()), h, th), color, hit, {
        flow: [0, 1, 0],
        embed: 0.3,
        bone: spine.nearestJoint(hit.at),
        flat: true,
      });
    }
  };
  row(1.24, 0.01, 10, 0.27, 0.38, 0.12, BASALT2, 0, 0);
  row(1.56, 0.02, 10, 0.28, 0.38, 0.12, BASALT, 55, 0.5 / 10);
  row(1.86, 0.08, 12, 0.29, 0.38, 0.13, BASALT, 30, 0);
  row(2.16, 0.06, 12, 0.31, 0.38, 0.13, BASALT2, 30, 0.5 / 12);

  // molten belly with obsidian ribs
  for (const y of [1.56, 1.7, 1.84]) {
    const hit = skin.around([0, y, 0.04]).at(0, 0);
    if (hit) b.stick(box(0.5, 0.06, 0.07), OBS, hit, { embed: 0.35, flow: [0, 1, 0], bone: spine.joints[1] });
  }

  // belt + buckle
  const belt = skin.loop([0, 1.4, 0.02], { lift: 0.045 });
  b.sweep(belt, 0.055, { color: GOLD, bone: spine.joints[0], sides: 6 });
  b.extrude(hexOutline(0.11, 0.13), {
    at: [0, 1.4, 0.48],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.06,
    bevel: 0.01,
    color: GOLD,
    bone: spine.joints[0],
  });
  lit(EMBLEM, 0.14, 0.14, spine.joints[0], [0, 1.4, 0.514], [0, 0, 1], [0, 1, 0]);

  // tassets
  [-0.27, 0, 0.27].forEach((x, i) => {
    const len = i === 1 ? 0.52 : 0.44;
    const yc = 1.38 - len / 2;
    blk(hips, [x, yc, 0.42], [0.24, len, 0.07], [-10, 0, 0], BASALT);
    blk(hips, [x, yc - len / 2 + 0.01, 0.435], [0.26, 0.04, 0.09], [-10, 0, 0], GOLD);
    lit(CRACK, 0.17, 0.17, hips, [x, yc + 0.03, 0.4575], [0, 0.17, 1], [0, 1, 0]);
  });
  [-0.2, 0.2].forEach((x) => {
    blk(hips, [x, 1.15, -0.34], [0.26, 0.5, 0.07], [10, 0, 0], BASALT);
    blk(hips, [x, 0.91, -0.355], [0.28, 0.04, 0.09], [10, 0, 0], GOLD);
  });

  // breastplate
  b.extrude(hexOutline(0.31, 0.37), {
    at: [0, 2.02, 0.54],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.06,
    bevel: 0.01,
    color: GOLD,
    bone: spine3,
  });
  b.extrude(hexOutline(0.26, 0.31), {
    at: [0, 2.02, 0.6],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.09,
    bevel: 0.02,
    color: BASALT2,
    bone: spine3,
  });
  lit(EMBLEM, 0.36, 0.36, spine3, [0, 2.04, 0.65], [0, 0, 1], [0, 1, 0], 1.3);

  // back slab with glyph, spikes
  b.extrude(hexOutline(0.35, 0.47), {
    at: [0, 2.02, -0.5],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.06,
    bevel: 0.01,
    color: GOLD,
    bone: spine3,
  });
  b.extrude(hexOutline(0.3, 0.42), {
    at: [0, 2.02, -0.52],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.1,
    bevel: 0.02,
    color: BASALT,
    bone: spine3,
  });
  lit(EMBLEM, 0.26, 0.26, spine3, [0, 2.12, -0.575], [0, 0, -1], [0, 1, 0], 1.2);
  [-0.18, 0, 0.18].forEach((x, i) =>
    b.spike([x, 2.42, -0.52], [0, 1, -0.3], i === 1 ? 0.42 : 0.3, 0.065, { bone: spine3, color: OBS, sides: 6 }),
  );
  flames(spine3, [[-0.4, 2.36, -0.28], [-0.2, 2.38, -0.3], [0, 2.4, -0.3], [0.2, 2.38, -0.3], [0.4, 2.36, -0.28]], [0.16, 0.42], [0, 0, -1], 25, 25);

  // halo
  const HC = [0, 2.75, -0.9];
  b.part(new THREE.TorusGeometry(0.62, 0.025, 4, 24), GOLD, { bone: spine3, at: HC });
  glow(b.part(new THREE.TorusGeometry(0.5, 0.012, 4, 24), HOT, { bone: spine3, at: HC }), 1.3);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const rx = Math.sin(a);
    const ry = Math.cos(a);
    lit(GLYPHS[i % 3], 0.13, 0.13, spine3, [HC[0] + rx * 0.56, HC[1] + ry * 0.56, HC[2]], [0, 0, 1], [rx, ry, 0], 1);
    b.part(new THREE.OctahedronGeometry(0.035, 0), GOLD, {
      bone: spine3,
      at: [HC[0] + rx * 0.65, HC[1] + ry * 0.65, HC[2]],
      flat: true,
    });
  }
  b.rod([0, 1.6, -0.56], [0, 1.94, -0.9], 0.04, GOLD, { bone: spine3 });

  // trapezius
  for (const s of [1, -1]) {
    blk(spine3, [s * 0.42, 2.4, -0.02], [0.46, 0.14, 0.52], [0, 0, -s * 22], BASALT);
    blk(spine3, [s * 0.42, 2.32, -0.02], [0.5, 0.03, 0.56], [0, 0, -s * 22], GOLD);
  }
  // neck core
  glow(b.sweep(neck, 0.16, { color: LAVA }), 1.2);

  // ------------------------------------------------------------------ head (one scale constant)
  const HK = 1.4;
  const HP = [0, 2.6, 0.22];
  const hq = (x: number, y: number, z: number) => [x * HK, HP[1] + (y - HP[1]) * HK, HP[2] + (z - HP[2]) * HK];
  const hb = (bone: any, x: number, y: number, z: number, w: number, h: number, d: number, color: any, rot: number[] = [0, 0, 0]) =>
    b.part(box(w * HK, h * HK, d * HK), color, { bone, at: hq(x, y, z), rotation: rot });
  hb(head, 0, 2.76, 0.3, 0.62, 0.38, 0.56, BASALT);
  hb(head, 0, 2.775, 0.585, 0.58, 0.21, 0.04, OBS);
  hb(head, 0, 2.97, 0.28, 0.34, 0.08, 0.42, BASALT2);
  hb(head, 0, 2.935, 0.5, 0.66, 0.035, 0.2, GOLD);
  hb(head, 0, 2.62, 0.08, 0.5, 0.2, 0.12, BASALT2);
  glow(b.part(box(0.42 * HK, 0.06 * HK, 0.42 * HK), HOT, { bone: head, at: hq(0, 2.55, 0.36) }), 1.2);
  for (const s of [1, -1]) {
    hb(head, s * 0.35, 2.72, 0.33, 0.1, 0.3, 0.42, BASALT2);
    hb(head, s * 0.2, 2.9, 0.56, 0.22, 0.07, 0.1, OBS, [0, 0, s * 14]);
    lit(s > 0 ? EYE_A : EYE_B, 0.4, 0.21, head, hq(s * 0.15, 2.775, 0.612), [0, 0, 1], [-s * 0.35, 1, 0], 2.4);
    // horns
    const hp = bezier(hq(s * 0.3, 2.9, 0.3), hq(s * 0.58, 3.0, 0.2), hq(s * 0.6, 3.32, 0.0));
    b.sweep(hp, [0.1, 0], { bone: head, color: OBS, caps: { start: "flat", end: "point" }, sides: 6 });
    b.part(new THREE.TorusGeometry(0.11, 0.028, 4, 6), GOLD, {
      bone: head,
      at: hp.at(0.14),
      dir: hp.tangentAt(0.14),
      axis: "z",
    });
    glow(b.part(new THREE.OctahedronGeometry(0.05, 0), "#ffb52e", { bone: head, at: hp.at(0.93), flat: true }), 1.4);
  }
  flames(
    head,
    [[0, 3.0, 0.12], [0, 3.0, 0.24], [0, 3.0, 0.36], [-0.12, 2.99, 0.2], [0.12, 2.99, 0.2], [-0.1, 2.99, 0.34], [0.1, 2.99, 0.34]].map((p) => hq(p[0], p[1], p[2])),
    [0.2, 0.52],
    [0, 0, -1],
    28,
    25,
  );
  // teeth and jaw
  [-0.18, -0.06, 0.06, 0.18].forEach((x) =>
    b.spike(hq(x, 2.575, 0.56), [0, -1, 0], 0.09 * HK, 0.032 * HK, { bone: head, color: TEETH, sides: 5 }),
  );
  hb(jaw, 0, 2.48, 0.34, 0.5, 0.1, 0.46, BASALT2);
  hb(jaw, 0, 2.45, 0.58, 0.4, 0.14, 0.1, BASALT);
  hb(jaw, 0, 2.4, 0.6, 0.3, 0.05, 0.12, GOLD);
  for (const s of [1, -1]) {
    b.spike(hq(s * 0.2, 2.5, 0.52), [s * 0.1, 1, 0.1], 0.26 * HK, 0.05 * HK, { bone: jaw, color: TEETH, sides: 6 });
    b.spike(hq(s * 0.08, 2.52, 0.58), [0, 1, 0.05], 0.1 * HK, 0.03 * HK, { bone: jaw, color: TEETH, sides: 5 });
    hb(jaw, s * 0.27, 2.47, 0.3, 0.06, 0.14, 0.4, BASALT);
  }
  b.spike(hq(0, 2.4, 0.64), [0, -0.6, 1], 0.18 * HK, 0.055 * HK, { bone: jaw, color: OBS, sides: 6 });

  // ------------------------------------------------------------------ legs
  const LEGR = [0.26, 0.22, 0.21, 0.19, 0.17];
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const lp = limb([s * 0.36, 1.2, 0], [s * 0.42, 0.4, 0.1], [0.52, 0.52], [0, 0, 1]);
    const leg = b.chain(`leg${sd}`, lp, {
      parent: hips,
      names: [`hip${sd}`, `knee${sd}`, `ankle${sd}`],
      role: "leg",
      contact: [s * 0.42, Y0, 0.2],
    });
    glow(b.sweep(leg, LEGR, { color: LAVA, sectors: [[-25, 25, HOT], [155, 205, HOT]] }), 1.15);
    [0.1, 0.24, 0.38, 0.62, 0.76, 0.88].forEach((t, i) =>
      band(leg, t, keyAt(LEGR, t) - 0.01, 6, 0.25, 0.2, 0.1, i % 2 ? BASALT2 : BASALT, (i % 2) * 30),
    );
    [0.06, 0.5, 0.95].forEach((t) => goldRing(leg.at(t), keyAt(LEGR, t) + 0.06));
    slabOn(leg, 0.24, [s * 0.4, 0, 0.6], 0.235, [0.22, 0.1, 0.3], BASALT, G2);
    slabOn(leg, 0.72, [0, 0, 1], 0.185, [0.22, 0.09, 0.34], BASALT, CRACK);
    // knee
    const kn = lp[1];
    b.part(hexPlate(0.42, 0.42, 0.06), GOLD, { bone: leg.joints[1], at: [kn.x, kn.y, kn.z + 0.2], rotation: [90, 0, 0], flat: true });
    b.part(hexPlate(0.34, 0.34, 0.1), BASALT, { bone: leg.joints[1], at: [kn.x, kn.y, kn.z + 0.25], rotation: [90, 0, 0], flat: true });
    b.spike([kn.x, kn.y, kn.z + 0.3], [0, 0.25, 1], 0.2, 0.06, { bone: leg.joints[1], color: OBS, sides: 6 });
    // hip guard
    blk(leg.joints[0], [s * 0.52, 1.36, 0], [0.2, 0.14, 0.5], [0, 0, -s * 15], BASALT);
    blk(leg.joints[0], [s * 0.52, 1.28, 0], [0.22, 0.03, 0.54], [0, 0, -s * 15], GOLD);
    // foot
    const ank = leg.tip;
    blk(ank, [s * 0.42, 0.3, 0.1], [0.4, 0.24, 0.5], [0, 0, 0], BASALT2);
    b.part(hexPlate(0.3, 0.36, 0.08), GOLD, { bone: ank, at: [s * 0.42, 0.425, 0.14], rotation: [10, 0, 0], flat: true });
    b.part(hexPlate(0.24, 0.3, 0.08), BASALT, { bone: ank, at: [s * 0.42, 0.45, 0.14], rotation: [10, 0, 0], flat: true });
    [-0.14, 0, 0.14].forEach((dx) => {
      blk(ank, [s * 0.42 + dx, 0.29, 0.44], [0.13, 0.2, 0.22], [0, 0, 0], BASALT);
      b.spike([s * 0.42 + dx, 0.27, 0.55], [0, -0.15, 1], 0.15, 0.055, { bone: ank, color: TEETH, sides: 5 });
    });
    b.spike([s * 0.42, 0.3, -0.12], [0, 0.1, -1], 0.14, 0.06, { bone: ank, color: OBS, sides: 5 });
  }

  // ------------------------------------------------------------------ arms
  const ARMR = [0.2, 0.19, 0.17, 0.21, 0.25, 0.24];
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const hx = s * 1.2;
    const hy = 0.98;
    const hz = 0.36;
    const ap = limb([s * 0.88, 2.12, 0.04], [hx, hy, hz], [0.72, 0.72], [s * 0.5, 0, -0.6]);
    const arm = b.chain(`arm${sd}`, ap, {
      parent: spine3,
      names: [`shoulder${sd}`, `elbow${sd}`, `wrist${sd}`],
      role: "arm",
    });
    glow(b.sweep(arm, ARMR, { color: LAVA, sectors: [[-25, 25, HOT], [155, 205, HOT]] }), 1.15);
    [0.12, 0.26, 0.38].forEach((t, i) =>
      band(arm, t, keyAt(ARMR, t) - 0.01, 6, 0.23, 0.2, 0.1, i % 2 ? BASALT2 : BASALT, (i % 2) * 30),
    );
    [0.6, 0.72, 0.86].forEach((t, i) =>
      band(arm, t, keyAt(ARMR, t) - 0.01, 7, 0.25, 0.2, 0.11, i % 2 ? BASALT : BASALT2, (i % 2) * 25),
    );
    [0.06, 0.55, 0.97].forEach((t) => goldRing(arm.at(t), keyAt(ARMR, t) + 0.06));
    slabOn(arm, 0.76, [s, 0, 0], keyAt(ARMR, 0.76) + 0.01, [0.22, 0.1, 0.3], BASALT, G1);
    slabOn(arm, 0.2, [s, 0.2, 0], 0.2, [0.2, 0.09, 0.26], BASALT, G3);
    // elbow spike
    const ed = [s * 0.7, 0.15, -0.7];
    const ep = ap[1];
    b.spike(offset(ep, ed, 0.12), ed, 0.34, 0.085, { bone: arm.joints[1], color: OBS, sides: 6 });
    b.part(new THREE.TorusGeometry(0.1, 0.03, 4, 6), GOLD, {
      bone: arm.joints[1],
      at: offset(ep, ed, 0.17),
      dir: ed,
      axis: "z",
    });
    // pauldron
    const sh = arm.joints[0];
    [
      [0.66, 0.16, 0.74, 2.2, 0.9, 14],
      [0.5, 0.13, 0.58, 2.3, 0.94, 20],
      [0.34, 0.12, 0.42, 2.38, 0.97, 26],
    ].forEach(([w, h, d, y, x, deg]) => {
      b.part(box(w + 0.05, 0.035, d + 0.05), GOLD, { bone: sh, at: [s * x, y - h / 2 - 0.012, 0.04], rotation: [0, 0, -s * deg] });
      b.part(box(w, h, d), BASALT, { bone: sh, at: [s * x, y, 0.04], rotation: [0, 0, -s * deg] });
    });
    [-0.14, 0.04, 0.22].forEach((z) =>
      b.spike([s * 0.98, 2.45, z], [s * 0.35, 1, 0], 0.22, 0.055, { bone: sh, color: OBS, sides: 6 }),
    );
    flames(sh, [[s * 0.98, 2.48, -0.05], [s * 0.98, 2.48, 0.13]], [0.12, 0.28], [0, 0, -1], 25, 20);

    // hand
    const wr = arm.tip;
    blk(wr, [hx, hy - 0.17, hz + 0.03], [0.4, 0.34, 0.32], [0, 0, 0], BASALT2);
    blk(wr, [hx, hy - 0.03, hz + 0.03], [0.44, 0.12, 0.36], [0, 0, 0], BASALT);
    blk(wr, [hx, hy - 0.1, hz + 0.2], [0.34, 0.1, 0.04], [0, 0, 0], GOLD);
    [-0.12, 0, 0.12].forEach((dx, i) => {
      const nm = `finger${sd}${i + 1}`;
      const pts = [
        [hx + dx, hy - 0.3, hz + 0.07],
        [hx + dx, hy - 0.5, hz + 0.13],
        [hx + dx, hy - 0.68, hz + 0.08],
      ];
      const fc = b.chain(nm, polyline(pts), { parent: wr, names: [`${nm}a`, `${nm}b`], role: "digit" });
      b.sweep(fc, [0.062, 0.045], { color: OBS, section: { ngon: 6 } });
      b.spike(pts[2], [0, -1, -0.4], 0.1, 0.045, { bone: fc.joints[1], color: TEETH, sides: 5 });
    });
    const tn = `thumb${sd}`;
    const tp = [
      [hx - s * 0.18, hy - 0.2, hz + 0.08],
      [hx - s * 0.3, hy - 0.34, hz + 0.16],
      [hx - s * 0.34, hy - 0.46, hz + 0.2],
    ];
    const tc = b.chain(tn, polyline(tp), { parent: wr, names: [`${tn}a`, `${tn}b`], role: "digit" });
    b.sweep(tc, [0.065, 0.045], { color: OBS, section: { ngon: 6 } });
    b.spike(tp[2], [-s * 0.2, -1, 0.3], 0.1, 0.045, { bone: tc.joints[1], color: TEETH, sides: 5 });
  }

  // open the mouth a little for the rest pose
  b.pose(jaw, { axis: [1, 0, 0], deg: 9 });

  return b.root;
}
