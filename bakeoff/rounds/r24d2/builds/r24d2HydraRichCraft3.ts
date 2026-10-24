import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  vec,
  offset,
  catmull,
  bezier,
  limb,
  countershade,
  paint,
  noise,
  cells,
  scales,
  mottle,
  grain,
  mix,
  resolve,
  smoothstep,
  svg,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { metal } from "../../../../kits/clockwork";

export const meta = {
  name: "Hydra of the Broken Chain",
  description:
    "A scarred, five-headed war-hydra in a gritty God of War look: ash-grey scaled hide split by ember cracks, bone armour, spears and a sword stuck in its flank, an iron-shackled neck dragging a chain, glowing eyes and a lava-lit mouth.",
};

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const sph = (sx = 8, sy = 6) => new THREE.SphereGeometry(1, sx, sy);
const keyed = (a: number[]) => (t: number) => {
  const x = Math.min(Math.max(t, 0), 1) * (a.length - 1);
  const i = Math.min(Math.floor(x), a.length - 2);
  return a[i] + (a[i + 1] - a[i]) * (x - i);
};

export default function build() {
  const b = createBuilder({ name: "hydra" });
  const R = rng(11);

  // ------------------------------------------------------------------ palette
  const INK = "#14100e";
  const BONE = "#c8b894";
  const BONE_D = "#5b503c";
  const TOOTH = "#ddd3b2";
  const EMBER = "#ff5a1c";
  const TONGUE = "#7d2420";
  const ROPE = "#7b6642";
  const SCAR_C = "#a89c88";
  const WOOD = grain("#5a3e26", "#3b281a", { size: 0.03, axis: "y", seed: 2 });
  const WOOD_D = "#33231a";
  const IRON = metal("iron", { tarnish: 0.6, seed: 3 });
  const BRONZE = metal("bronze", { verdigris: 0.5, tarnish: 0.6, seed: 4 });
  const STEEL = metal("steel", { tarnish: 0.7, seed: 5 });
  const BONE_P = mottle(BONE, "#8b7f62", { size: 0.1, seed: 4 });

  const BACK = scales(["#2c312d", "#353a30", "#292d2e", "#30342f"], "#121411", { size: 0.1, width: 0.18, seed: 3 });
  const BELLY = scales(["#8a7656", "#7a6a4c", "#6f6048"], "#2b2418", { size: 0.13, width: 0.16, seed: 8 });
  const COAT = countershade(BACK, BELLY, { level: -0.25, soft: 0.3 });
  const HIDE = paint((p, n) => {
    if (Math.abs(noise(p, 0.55, 11) - 0.5) < 0.009) return SCAR_C;
    const c = cells(p, 0.7, 5);
    if (c.d2 - c.d1 < 0.028 && noise(p, 0.9, 9) > 0.66) return "#ff6a22";
    let col = resolve(COAT, p, n);
    const ash = smoothstep(0.55, 0.95, n.y) * smoothstep(0.45, 0.7, noise(p, 0.35, 21));
    col = mix(col, "#8d8a80", ash * 0.4);
    col = mix(col, "#0e0d0c", smoothstep(0.5, 0.0, p.y) * 0.5);
    return col;
  });
  const THROAT = paint((_p, _n, s) => (Math.floor(s[0] * 70) % 2 === 0 ? "#8c7a58" : "#6a5a40"));

  // ------------------------------------------------------------------ textures
  const EYE = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="g" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#fff3a0"/><stop offset="0.55" stop-color="#ff9a1c"/><stop offset="1" stop-color="#c2300f"/></radialGradient></defs><circle cx="32" cy="32" r="31" fill="url(#g)"/><ellipse cx="32" cy="32" rx="5" ry="22" fill="#120806"/><circle cx="32" cy="32" r="30" fill="none" stroke="#2a0c06" stroke-width="3"/></svg>`,
    { size: 96 },
  );
  const EYE_BLIND = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="g" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#e4e2d4"/><stop offset="1" stop-color="#8c8b80"/></radialGradient></defs><circle cx="32" cy="32" r="31" fill="url(#g)"/><circle cx="32" cy="32" r="7" fill="#5a5a52"/><path d="M8 8 L56 58" stroke="#5a1410" stroke-width="5" stroke-linecap="round"/><circle cx="32" cy="32" r="30" fill="none" stroke="#2a2420" stroke-width="3"/></svg>`,
    { size: 96 },
  );
  const SIGIL_A = svg(
    `<svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g stroke="#ff6a1c" stroke-width="5"><circle cx="48" cy="48" r="40" stroke-dasharray="40 14"/><path d="M48 14 V82 M48 32 L68 18 M48 32 L28 18 M48 58 L66 74 M48 58 L30 74 M30 46 H66"/></g><g stroke="#ffd070" stroke-width="1.8"><circle cx="48" cy="48" r="40" stroke-dasharray="40 14"/><path d="M48 14 V82 M48 32 L68 18 M48 32 L28 18 M48 58 L66 74 M48 58 L30 74 M30 46 H66"/></g></g></svg>`,
    { size: 192 },
  );
  const SIGIL_B = svg(
    `<svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g stroke="#ff6a1c" stroke-width="5"><path d="M48 10 L84 70 L12 70 Z"/><path d="M48 86 L12 26 L84 26 Z"/><circle cx="48" cy="48" r="6"/></g><g stroke="#ffd070" stroke-width="1.8"><path d="M48 10 L84 70 L12 70 Z"/><path d="M48 86 L12 26 L84 26 Z"/></g></g></svg>`,
    { size: 192 },
  );
  const FLAME = svg(
    `<svg viewBox="0 0 64 96" xmlns="http://www.w3.org/2000/svg"><path d="M32 94 C6 80 6 52 24 36 C22 52 30 56 32 44 C34 30 30 16 38 2 C46 20 62 40 58 66 C56 82 46 90 32 94Z" fill="#e8420f"/><path d="M32 92 C16 82 16 62 28 50 C28 62 34 64 34 54 C36 46 36 40 40 34 C48 50 52 62 48 74 C45 84 40 90 32 92Z" fill="#ff9a22"/><path d="M32 90 C24 84 24 72 32 64 C34 70 40 74 40 78 C40 86 36 89 32 90Z" fill="#ffe27a"/></svg>`,
    { size: 128 },
  );
  const BRISTLE = svg(
    `<svg viewBox="0 0 24 64" xmlns="http://www.w3.org/2000/svg"><path d="M2 64 C6 40 10 20 21 2 C18 24 17 44 22 64Z" fill="#1f1b18"/><path d="M10 64 C12 44 15 28 21 2 C18 28 17 44 17 64Z" fill="#7a6a50"/></svg>`,
    { size: 96 },
  );

  // ------------------------------------------------------------------ skeleton: body
  const hips = b.joint("hips", { at: [0, 1.72, -1.4], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.72, -1.4],
      [0, 1.78, -0.45],
      [0, 1.9, 0.5],
      [0, 1.98, 1.2],
    ]),
    { parent: hips, role: "spine" },
  );
  const chest = spine.joints[2];

  const tailPath = catmull([
    [0, 1.72, -1.4],
    [0, 1.45, -2.5],
    [0, 0.95, -3.7],
    [0.15, 0.55, -4.9],
    [0.55, 0.38, -5.9],
  ]);
  const tail = b.chain("tail", tailPath, {
    parent: hips,
    names: ["tail1", "tail2", "tail3", "tail4", "tailTip"],
    role: "tail",
  });

  const torsoRx = keyed([0.5, 0.66, 0.74, 0.7]);
  const torsoRy = keyed([0.6, 0.74, 0.82, 0.78]);
  const torso = b.sweep(spine, (t: number) => [torsoRx(t), torsoRy(t)] as [number, number], { color: HIDE });
  const tailTube = b.sweep(tail, [0.5, 0.1], { color: HIDE, bands: undefined });
  const torsoSurf = b.surface(torso);
  const onTorso = (az: number, el: number, cz = 0, cy = 1.85) => torsoSurf.around([0, cy, cz]).at(az, el)!;

  // dorsal plates
  const plateH = [0.35, 0.5, 0.62, 0.7, 0.66, 0.55, 0.4];
  let pi = 0;
  b.along(torso, 7, (at: any) => {
    const h = plateH[pi++ % plateH.length];
    const g = new THREE.ConeGeometry(0.18, h, 4);
    g.scale(0.45, 1, 1.3);
    b.stick(g, BONE_P, at, { embed: 0.3, flow: [0, 0, 1] });
  });
  let ti = 0;
  b.along(tailTube, 7, (at: any) => {
    const f = 1 - (ti++ / 7) * 0.6;
    b.spike(at, at, 0.34 * f, 0.07 * f, { color: BONE_P, sides: 5 });
  });
  // knobs across the back
  for (const h of torsoSurf.scatter(34, { rng: rng(5), minDist: 0.3, filter: (q: any) => q.n.y > 0.3 })) {
    b.stick(new THREE.ConeGeometry(0.07, 0.15, 5), BONE_P, h, { embed: 0.3 });
  }

  // tail blade
  {
    const T = tailPath.tangentAt(1).clone().normalize();
    const tipP = tailPath.at(1).clone();
    const X = V(0, 1, 0).cross(T).normalize();
    b.extrude(
      [
        [0, 0],
        [0.17, 0.12],
        [0.23, 0.4],
        [0, 0.8, "sharp"],
        [-0.23, 0.4],
        [-0.17, 0.12],
      ] as any,
      { at: tipP.clone().addScaledVector(T, -0.05), x: X, y: T, thickness: [0.045, 0.012], bevel: 0.01, color: BONE_P },
    );
  }

  // ------------------------------------------------------------------ generic helpers
  const band = (chain: any, t: number, r: number, w: number, color: any, studs = false) => {
    const items = b.ring(chain.at(t), { count: 8, radius: r }).items;
    b.sweep(catmull(items, { closed: true }), w, { color, sides: 6 });
    if (studs) for (const it of items) b.part(sph(6, 4), color, { frame: it, scale: [w * 1.3, w * 1.3, w * 1.3] });
  };

  const dome = (h: any, R0: number, nSpikes: number) => {
    const n = h.n.clone().normalize();
    const u = V(0, 1, 0).cross(n).normalize();
    const w = n.clone().cross(u).normalize();
    b.lathe(
      [
        [0, -0.06],
        [R0, -0.06],
        [R0 * 0.94, 0.05],
        [R0 * 0.65, 0.17],
        [R0 * 0.3, 0.24],
        [0, 0.27],
      ],
      { at: h, axis: n, segments: 7, color: BONE_P },
    );
    for (let j = 0; j < nSpikes; j++) {
      const a = (j * Math.PI * 2) / nSpikes;
      const out = u.clone().multiplyScalar(Math.cos(a)).addScaledVector(w, Math.sin(a));
      const base = h.at.clone().addScaledVector(out, R0 * 0.78).addScaledVector(n, 0.06);
      const dir = out.clone().multiplyScalar(0.75).addScaledVector(n, 0.6).normalize();
      b.spike(h.moved(base), dir, 0.32, 0.06, { color: BONE_P, sides: 5 });
    }
    b.spike(h.moved(h.at.clone().addScaledVector(n, 0.2)), n, 0.3, 0.07, { color: BONE_P, sides: 5 });
  };

  const spear = (h: any, tilt: THREE.Vector3, len: number) => {
    const dir = h.n.clone().normalize().add(tilt).normalize();
    const start = h.moved(h.at.clone().addScaledVector(dir, -0.25));
    const tip = h.moved(h.at.clone().addScaledVector(dir, len));
    b.rod(start, tip, 0.03, WOOD, { sides: 5 });
    b.spike(tip, dir, 0.2, 0.03, { color: WOOD_D, sides: 4 });
    for (const f of [0.35, 0.5]) {
      b.part(new THREE.TorusGeometry(0.037, 0.01, 4, 6), ROPE, {
        frame: h.moved(h.at.clone().addScaledVector(dir, len * f)),
        dir,
        axis: "z",
      });
    }
  };

  // ------------------------------------------------------------------ legs
  const legR = (t: number) => 0.17 + 0.19 * Math.pow(1 - t, 1.6);
  const makeLeg = (s: number, hind: boolean) => {
    const sd = s > 0 ? "L" : "R";
    const ty = hind ? "H" : "F";
    const root: [number, number, number] = hind ? [s * 0.5, 1.5, -1.3] : [s * 0.55, 1.55, 0.9];
    const foot: [number, number, number] = hind ? [s * 0.82, 0.17, -1.15] : [s * 0.88, 0.17, 1.3];
    const bends = hind
      ? [
          [0, 0, 1],
          [0, 0, -1],
        ]
      : [
          [0, 0, -1],
          [0, 0, 1],
        ];
    const pts = limb(root, foot, [0.78, 0.74, 0.45], bends);
    const names = hind
      ? [`hipH${sd}`, `kneeH${sd}`, `ankleH${sd}`, `footH${sd}`]
      : [`shoulderF${sd}`, `elbowF${sd}`, `wristF${sd}`, `handF${sd}`];
    const leg = b.chain(`leg${ty}${sd}`, pts, {
      parent: hind ? hips : chest,
      names,
      role: "leg",
      contact: [foot[0], 0, foot[2]],
    });
    b.sweep(leg, legR, { color: HIDE });
    b.part(sph(), HIDE, {
      bone: hind ? hips : chest,
      at: [s * 0.6, 1.55, root[2]],
      scale: hind ? [0.42, 0.66, 0.62] : [0.4, 0.6, 0.58],
      flat: true,
    });
    // knee / elbow spur
    const sdir = (hind ? V(s * 0.4, 0.25, 0.9) : V(s * 0.4, 0.2, -0.9)).normalize();
    b.spike(offset(pts[1], sdir, 0.12), sdir, 0.4, 0.09, { color: BONE_P, bone: leg.joints[1], sides: 5 });
    band(leg, 0.58, legR(0.58) + 0.03, 0.035, hind ? IRON : BRONZE, !hind);
    band(leg, 0.86, legR(0.86) + 0.03, 0.03, IRON);
    // paw
    const tip = leg.tip;
    b.part(sph(), HIDE, { bone: tip, at: [foot[0], 0.14, foot[2] + 0.13], scale: [0.25, 0.14, 0.34], flat: true });
    for (const dx of [-0.16, 0, 0.16]) {
      const cx = foot[0] + dx;
      b.part(sph(6, 4), BONE_D, { bone: tip, at: [cx, 0.13, foot[2] + 0.36], scale: [0.07, 0.07, 0.08], flat: true });
      b.spike([cx, 0.15, foot[2] + 0.4], [dx * 0.4, -0.24, 0.97], 0.34, 0.055, {
        color: BONE_P,
        bone: tip,
        sides: 5,
      });
    }
    b.spike([foot[0] + s * 0.12, 0.2, foot[2] - 0.12], [s * 0.7, 0.2, -0.7], 0.22, 0.045, {
      color: BONE_P,
      bone: tip,
      sides: 5,
    });
  };
  makeLeg(1, true);
  makeLeg(-1, true);
  makeLeg(1, false);
  makeLeg(-1, false);

  // shoulder pauldrons and haunch plates
  for (const s of [1, -1]) {
    dome(onTorso(s * 75, 40, 0.9, 1.95), 0.34, 5);
    dome(onTorso(s * 80, 35, -1.2, 1.75), 0.28, 4);
  }

  // glowing sigils & seams
  for (const s of [1, -1]) {
    const h = onTorso(s * 90, 5, 0.1, 1.85);
    glow(
      b.decal(torso, s > 0 ? SIGIL_A : SIGIL_B, { at: h, size: [0.62, 0.62], dir: [s, 0, 0], mirror: s < 0 }),
      1.3,
    );
    const rough = catmull([
      [s * 0.7, 2.45, -0.9],
      [s * 0.78, 2.1, -0.75],
      [s * 0.8, 1.8, -0.95],
      [s * 0.82, 1.5, -0.6],
      [s * 0.74, 1.15, -0.7],
    ]);
    glow(b.sweep(torsoSurf.drape(rough, { lift: 0.012 }), 0.022, { color: EMBER, sides: 5 }), 1.4);
  }

  // weapons stuck in the hide
  spear(onTorso(-50, 60, 0.1), V(0.1, 0.35, -0.55), 1.0);
  spear(onTorso(35, 65, -0.5), V(-0.1, 0.3, -0.5), 0.75);
  {
    const h = onTorso(-85, 40, -0.5);
    const ydir = h.n.clone().normalize().add(V(0, 0.5, -0.4)).normalize();
    const xdir = ydir.clone().cross(V(0, 0, 1)).normalize();
    const at0 = h.moved(h.at.clone().addScaledVector(ydir, -0.15));
    b.extrude(
      [
        [-0.06, 0],
        [0.06, 0],
        [0.055, 0.55],
        [0.02, 0.62, "sharp"],
        [0.0, 0.5, "sharp"],
        [-0.03, 0.66, "sharp"],
        [-0.055, 0.5],
      ] as any,
      { at: at0, x: xdir, y: ydir, thickness: 0.025, color: STEEL },
    );
  }

  // ------------------------------------------------------------------ necks and heads
  const NECKS = [
    { ex: -2.3, rise: 0.1, reach: 0.9, k: 0.95 },
    { ex: -1.15, rise: 0.6, reach: 1.1, k: 1.0 },
    { ex: 0.1, rise: 1.1, reach: 1.4, k: 1.25 },
    { ex: 1.2, rise: 0.5, reach: 1.0, k: 1.0 },
    { ex: 2.25, rise: -0.2, reach: 1.2, k: 0.9 },
  ];
  const nr = (t: number) => 0.16 + 0.18 * Math.pow(1 - t, 1.2);
  const COLLAR: any[] = [IRON, BONE_P, BRONZE, IRON, BRONZE];
  const jaws: any[] = [];

  const makeHead = (
    i: number,
    chain: any,
    tan: THREE.Vector3,
    o: { k: number; blind?: number; tongue?: boolean; flame?: boolean; broken?: number; muzzle?: boolean; scar?: boolean },
  ) => {
    const k = o.k;
    const head = b.joint(`head${i}`, {
      parent: chain.tip,
      at: chain.at(1),
      dir: [tan.x, tan.y - 0.14, tan.z],
      role: "head",
    });
    const L = (x: number, y: number, z: number) => head.local([x * k, y * k, z * k]);
    const E = (color: any, pos: number[], sc: number[], extra: any = {}) =>
      b.part(sph(), color, {
        bone: head,
        frame: head.moved(L(pos[0], pos[1], pos[2])),
        scale: [sc[0] * k, sc[1] * k, sc[2] * k],
        flat: true,
        ...extra,
      });

    const skull = E(HIDE, [0, 0.12, 0.06], [0.19, 0.28, 0.15]);
    for (const s of [1, -1]) E(HIDE, [s * 0.1, 0.12, -0.03], [0.1, 0.2, 0.09]);
    b.frustumBox(L(0, 0.2, 0.01), L(0, 0.82, 0.01), [0.34 * k, 0.2 * k], [0.2 * k, 0.1 * k], { bone: head, color: HIDE });
    b.rod(L(0, 0.2, 0.1), L(0, 0.8, 0.06), [0.025 * k, 0.012 * k], BONE_D, { bone: head, sides: 5 });
    E(BONE_D, [0, 0.84, 0.0], [0.1, 0.06, 0.055]);
    for (const s of [1, -1]) E(INK, [s * 0.05, 0.86, 0.03], [0.022, 0.02, 0.02], {});

    // palate glow (lava mouth)
    glow(
      b.frustumBox(L(0, 0.2, -0.094), L(0, 0.82, -0.044), [0.26 * k, 0.012 * k], [0.14 * k, 0.012 * k], {
        bone: head,
        color: "#b8310f",
      }),
      0.9,
    );
    glow(E("#e0481a", [0, 0.2, -0.07], [0.1, 0.1, 0.03]), 1.2);

    // jaw
    const jaw = b.joint(`jaw${i}`, { parent: head, at: L(0, 0.1, -0.095), aim: L(0, 0.8, -0.09), role: "jaw" });
    const Lj = (x: number, y: number, z: number) => jaw.local([x * k, y * k, z * k]);
    b.frustumBox(Lj(0, 0.02, 0), Lj(0, 0.7, 0), [0.3 * k, 0.09 * k], [0.15 * k, 0.05 * k], { bone: jaw, color: HIDE });
    for (const s of [1, -1]) {
      b.spike(Lj(s * 0.05, 0.62, -0.03), jaw.dir([s * 0.1, 0.35, -1]), 0.14 * k, 0.035 * k, {
        color: BONE_P,
        bone: jaw,
        sides: 5,
      });
    }
    // teeth
    const hw = (y: number) => 0.15 - 0.07 * ((y - 0.2) / 0.62);
    const zb = (y: number) => -0.09 + 0.05 * ((y - 0.2) / 0.62);
    for (const s of [1, -1]) {
      for (const [y, len] of [
        [0.3, 0.07],
        [0.45, 0.16],
        [0.62, 0.08],
      ]) {
        b.spike(L(s * hw(y) * 0.9, y, zb(y) + 0.012), head.dir([0, 0, -1]), len * k, 0.022 * k, {
          color: TOOTH,
          bone: head,
          sides: 4,
        });
      }
      for (const [y, len] of [
        [0.25, 0.05],
        [0.45, 0.07],
        [0.62, 0.09],
      ]) {
        b.spike(Lj(s * (0.15 - 0.075 * (y / 0.7)) * 0.9, y, 0.04), jaw.dir([0, 0, 1]), len * k, 0.02 * k, {
          color: TOOTH,
          bone: jaw,
          sides: 4,
        });
      }
    }
    if (o.tongue) {
      b.sweep(catmull([Lj(0, 0.12, 0.02), Lj(0, 0.45, 0.025), Lj(0, 0.82, 0.0), Lj(0, 1.05, -0.1)]), [0.03 * k, 0.012 * k], {
        bone: jaw,
        color: TONGUE,
        sides: 6,
        caps: { start: "flat", end: "point" },
      });
      for (const s of [1, -1]) {
        b.spike(Lj(0, 1.03, -0.09), jaw.dir([s * 0.35, 0.8, -0.2]), 0.16 * k, 0.014 * k, {
          color: TONGUE,
          bone: jaw,
          sides: 4,
        });
      }
    }

    // eyes and brow
    for (const s of [1, -1]) {
      const c = L(s * 0.14, 0.26, 0.07);
      E("#1d1f1c", [s * 0.14, 0.26, 0.07], [0.07, 0.07, 0.065]);
      const out = vec(head.dir([s * 0.75, 0.55, 0.45])).normalize();
      const blind = o.blind === s;
      const eye = b.part(new THREE.CircleGeometry(0.046 * k, 10), "#ffffff", {
        bone: head,
        at: vec(c).addScaledVector(out, 0.068 * k),
        dir: out,
        axis: "z",
        up: head.dir([0, 0, 1]),
        texture: blind ? EYE_BLIND : EYE,
      });
      if (!blind) glow(eye, 1.6);
      b.rod(L(s * 0.07, 0.2, 0.16), L(s * 0.2, 0.34, 0.115), [0.04 * k, 0.025 * k], BONE_D, { bone: head, sides: 5 });
    }

    // horns, crests, cheek spikes
    const horn = (s: number, sc: number, broken: boolean) =>
      b.sweep(
        bezier(L(s * 0.1, 0.05, 0.14), L(s * 0.27, -0.15 * sc, 0.28 * sc), L(s * 0.2, -0.5 * sc, 0.4 * sc)),
        broken ? [0.055 * k, 0.03 * k] : [0.055 * k, 0],
        {
          bone: head,
          bands: [
            [0.45, BONE_D],
            [1, BONE],
          ],
          caps: { start: "flat", end: broken ? "flat" : "point" },
          sides: 6,
        },
      );
    for (const s of [1, -1]) {
      const broken = o.broken === s;
      horn(s, broken ? 0.55 : 1, broken);
      b.spike(L(s * 0.17, 0.18, 0.1), head.dir([s * 1, 0.1, 0.35]), 0.3 * k, 0.05 * k, {
        color: BONE_P,
        bone: head,
        sides: 5,
      });
      for (let j = 0; j < 3; j++) {
        b.spike(L(s * 0.16, 0.12 - j * 0.07, -0.02 - j * 0.02), head.dir([s * 0.8, -0.75, 0.1 - j * 0.1]), (0.3 - j * 0.06) * k, 0.04 * k, {
          color: BONE_P,
          bone: head,
          sides: 5,
        });
      }
    }
    for (const [y, len] of [
      [0.02, 0.22],
      [0.14, 0.16],
      [0.25, 0.12],
    ]) {
      b.spike(L(0, y, 0.19), head.dir([0, -0.5, 1]), len * k, 0.04 * k, { color: BONE_P, bone: head, sides: 5 });
    }
    b.spike(L(0, 0.72, 0.07), head.dir([0, 0.5, 1]), 0.2 * k, 0.045 * k, { color: BONE_P, bone: head, sides: 5 });

    if (o.scar) {
      const sk = b.surface(skull);
      const a = sk.nearest(L(0.04, 0.34, 0.3));
      const m = sk.nearest(L(0.13, 0.24, 0.25));
      const c2 = sk.nearest(L(0.22, 0.18, 0.09));
      b.rod(a.moved([0, 0.006, 0]), m.moved([0, 0.006, 0]), 0.013 * k, SCAR_C, { sides: 4 });
      b.rod(m.moved([0, 0.006, 0]), c2.moved([0, 0.006, 0]), 0.013 * k, SCAR_C, { sides: 4 });
    }
    if (o.muzzle) {
      for (const y of [0.42, 0.68]) {
        const u = (y - 0.2) / 0.62;
        const hwY = 0.17 - 0.07 * u + 0.015;
        const hhY = 0.1 - 0.05 * u + 0.015;
        const ring: THREE.Vector3[] = [];
        for (let j = 0; j < 8; j++) {
          const a = (j / 8) * Math.PI * 2;
          ring.push(vec(L(Math.cos(a) * hwY, y, 0.01 + Math.sin(a) * hhY)));
        }
        b.sweep(catmull(ring, { closed: true }), 0.016 * k, { bone: head, color: IRON, sides: 5 });
      }
      b.part(sph(6, 4), BRONZE, { bone: head, at: L(0.19, 0.55, 0.01), scale: [0.04 * k, 0.04 * k, 0.04 * k], flat: true });
    }
    if (o.flame) {
      const frames = [-0.3, 0, 0.3].map((sx) => frame(L(sx * 0.1, 0.78, -0.05), head.dir([sx, 1, 0.5 + (sx === 0 ? 0.3 : 0)])));
      glow(
        b.cards(frames, FLAME, {
          size: [0.3 * k, 0.6 * k],
          bend: 25,
          flow: [0, 0, 1],
          cross: true,
          sink: 0,
          bone: head,
          rng: R,
          vary: 0.2,
        }),
        1.8,
      );
    }
    jaws.push([jaw, 10 + (i % 3) * 4]);
    return head;
  };

  const necks: any[] = [];
  NECKS.forEach((nk, i) => {
    const bx = nk.ex * 0.23;
    const pts: [number, number, number][] = [
      [bx, 2.3, 0.85],
      [bx * 1.5, 3.0, 0.75],
      [nk.ex * 0.55, 3.75 + nk.rise * 0.5, 0.85],
      [nk.ex * 0.9, 4.35 + nk.rise, 1.3 + nk.reach * 0.35],
      [nk.ex, 4.2 + nk.rise, 1.3 + nk.reach],
    ];
    const np = catmull(pts);
    const names = [1, 2, 3, 4, 5].map((n) => `neck${i}_${n}`);
    const chain = b.chain(`neck${i}`, np, { parent: chest, names, role: "neck" });
    const tube = b.sweep(chain, nr, { color: HIDE, sectors: [[135, 225, THROAT]] });
    necks.push({ chain, tube });

    // dorsal spikes
    const big = i === 2 ? 1.3 : 1;
    b.along(
      tube,
      6,
      (at: any) => {
        b.spike(at, at, (0.26 - 0.1 * at.t) * big, (0.06 - 0.02 * at.t) * big, { color: BONE_P, sides: 5 });
      },
      { from: 0.3, to: 0.95 },
    );
    // bristles
    const fr: any[] = [];
    for (let j = 0; j < 8; j++) for (const a of [-38, 38]) fr.push(tube.at(0.1 + j * 0.1, a));
    b.cards(fr, BRISTLE, { size: [0.07, 0.2], lean: 55, vary: 0.3, rng: R });

    // collar
    const tc = 0.16;
    const rr = nr(tc) + 0.04;
    const mat = COLLAR[i];
    const items = b.ring(chain.at(tc), { count: 8, radius: rr }).items;
    b.sweep(catmull(items, { closed: true }), 0.05, { color: mat, sides: 6 });
    if (i === 1) {
      b.ring(chain.at(tc), { count: 8, radius: rr }, (it: any) => {
        b.spike(it, it, 0.24, 0.055, { color: BONE_P, sides: 5 });
      });
    } else {
      for (const it of items) b.part(sph(6, 4), mat === IRON ? BRONZE : IRON, { frame: it, scale: [0.06, 0.06, 0.06], flat: true });
    }

    if (i === 0) {
      const sh = chain.at(tc).at.clone().add(V(-(rr + 0.14), 0, 0));
      const jb = chain.jointAt(tc);
      b.part(new THREE.TorusGeometry(0.1, 0.028, 5, 8), IRON, { bone: jb, at: sh, dir: [1, 0, 0], axis: "z" });
      const cp = catmull([
        sh,
        V(sh.x - 0.4, sh.y - 0.1, sh.z + 0.2),
        V(-1.6, 1.8, 1.35),
        V(-1.8, 0.9, 1.7),
        V(-1.85, 0.06, 2.2),
        V(-1.5, 0.045, 3.0),
        V(-1.0, 0.045, 3.4),
      ]);
      let li = 0;
      b.along(cp, 44, (at: any) => {
        const g = new THREE.TorusGeometry(0.05, 0.014, 5, 8);
        g.scale(0.9, 1.45, 1);
        if (li++ % 2 === 1) g.rotateY(Math.PI / 2);
        b.part(g, IRON, { frame: at, bone: jb });
      });
      const man = new THREE.TorusGeometry(0.17, 0.045, 5, 8);
      man.rotateX(Math.PI / 2);
      b.part(man, IRON, { bone: jb, at: [-1.0, 0.05, 3.4] });
    }
    if (i === 2) {
      const f = chain.at(0.32).at.clone().add(V(0, 0, 0.3));
      glow(b.decal(tube, SIGIL_B, { at: f, dir: [0, 0.1, 1], size: [0.3, 0.3] }), 1.4);
    }

    const tan = np.tangentAt(1).clone();
    makeHead(i, chain, tan, {
      k: nk.k,
      blind: i === 4 ? 1 : undefined,
      tongue: i === 1 || i === 3,
      flame: i === 2,
      broken: i === 0 ? -1 : undefined,
      muzzle: i === 3,
      scar: i === 4,
    });
  });

  // rest pose: jaws slightly parted
  for (const [jaw, deg] of jaws) b.pose(jaw, { axis: [1, 0, 0], deg });

  return b.root;
}
