import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  vec,
  aim,
  bezier,
  catmull,
  polyline,
  limb,
  countershade,
  mottle,
  grain,
  scales,
  gradient,
  paint,
  mix,
  noise,
  cells,
  smoothstep,
  svg,
} from "../../../../src/index";
import type { ColorInput, Joint } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Capybara and Songbird",
  description:
    "A serene, sleepy-eyed capybara with a round blue songbird perched on its head, standing on a little grassy pond island with lily pads, a lotus, reeds, yuzu fruit, daisies and glowing sparkles.",
};

type P3 = [number, number, number];
type Extra = { rotation?: P3; scale?: number | P3; flat?: boolean; quat?: THREE.Quaternion };

const D = Math.PI / 180;
const GY = 0.055; // thickness of the island: the capybara stands on it
const Y = (v: number) => v + GY;
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const UPV = V(0, 1, 0);
const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);

export default function build() {
  const b = createBuilder({ name: "capybara" });
  const R = rng(7);

  // ------------------------------------------------------------------ colours
  const DARK = "#1b1009";
  const CREAM = "#fff0c8";
  const TOE = "#4a2e1c";
  const NAIL = "#e9d6b4";
  const NOSE = "#3a2418";
  const FURMID = "#8a5a31";
  const PINK = "#ff9eb5";
  const ORANGE = "#ff9a2e";

  // ------------------------------------------------------------------ paints
  const COAT = countershade(
    mottle(mottle("#7c4e29", "#98643a", { size: 0.1, seed: 2 }), "#a8743f", { size: 0.035, seed: 4, contrast: 0.6 }),
    mottle("#d0a066", "#e2ba80", { size: 0.04, seed: 6, contrast: 0.7 }),
    { level: -0.3, soft: 0.45 },
  );
  const LEGP = gradient(COAT, TOE, [0, GY + 0.17, 0], [0, GY + 0.06, 0]);
  const JAWP = grain("#b98a58", "#d2a572", { size: 0.02, axis: "z", seed: 9 });
  const EARIN = "#c07a5a";
  const DIRT = mottle("#7a5232", "#5e3d24", { size: 0.1, seed: 8 });
  const GRASS = mottle("#6cc04a", "#4fa63e", { size: 0.12, seed: 7 });
  const BASEP = paint((p, n) => (n.y > 0.5 ? GRASS : p.y > GY - 0.02 ? "#4d9b3a" : DIRT));
  const WATERP = paint((p) => mix("#59c6e6", "#9be8f2", smoothstep(0.3, 0.7, noise(p, 0.12, 9))));
  const STONEP = mottle("#9a9a9e", "#c4c2c0", { size: 0.05, seed: 11 });
  const YUZUP = paint((p) => {
    const base = mix("#f4c430", "#e8a91a", noise(p, 0.05, 1));
    return cells(p, 0.016, 3).d1 < 0.14 ? mix(base, "#c98a10", 0.6) : base;
  });
  const BIRD_BACK = scales(["#55b6f2", "#4aa8e8", "#5ec0f6"], "#3a8ed0", { size: 0.016, width: 0.1, seed: 3 });
  const BIRD_BELLY = scales(["#fff3d2", "#ffeab8"], "#f2cf93", { size: 0.016, width: 0.1, seed: 4 });
  const BIRDP = countershade(BIRD_BACK, BIRD_BELLY, { level: -0.1, soft: 0.1 });

  // ------------------------------------------------------------------ textures
  const SMILE = svg(
    `<svg viewBox="0 0 40 20"><path d="M3 6 Q17 17 33 8" stroke="#2a160b" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M33 8 Q37 7 38 3" stroke="#2a160b" stroke-width="2.6" fill="none" stroke-linecap="round"/></svg>`,
    { size: 128 },
  );
  const BLUSH = svg(
    `<svg viewBox="0 0 40 24"><ellipse cx="20" cy="12" rx="17" ry="9" fill="#e59a78"/><path d="M11 10 l3 5 M19 9 l3 6 M27 10 l3 5" stroke="#d27f62" stroke-width="2" stroke-linecap="round"/></svg>`,
    { size: 128 },
  );
  const LILY = svg(
    `<svg viewBox="0 0 64 64"><path d="M32 32 L39 5.93 A27 27 0 1 1 25 5.93 Z" fill="#4fae52" stroke="#2f7d3a" stroke-width="2.5" stroke-linejoin="round"/><path d="M32 32 L50 50 M32 32 L14 50 M32 32 L56 32 M32 32 L8 32 M32 32 L32 60" stroke="#8fdc84" stroke-width="1.8" stroke-linecap="round"/></svg>`,
    { size: 192 },
  );
  const GRASSTEX = svg(
    `<svg viewBox="0 0 48 64"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9be15e"/><stop offset="1" stop-color="#3f9a3a"/></linearGradient></defs><path d="M8 64 Q10 30 3 8 Q18 30 20 64Z" fill="url(#g)"/><path d="M18 64 Q22 24 24 2 Q30 26 32 64Z" fill="url(#g)"/><path d="M30 64 Q34 34 44 12 Q42 40 42 64Z" fill="url(#g)"/></svg>`,
    { size: 160 },
  );
  const FUR = svg(
    `<svg viewBox="0 0 24 48"><defs><linearGradient id="f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e2e2e2"/></linearGradient></defs><path d="M2 48 Q8 24 11 1 Q15 24 22 48Z" fill="url(#f)"/></svg>`,
    { size: 96 },
  );
  const STAR = svg(
    `<svg viewBox="0 0 40 40"><path d="M20 2 Q22 18 38 20 Q22 22 20 38 Q18 22 2 20 Q18 18 20 2Z" fill="#fff6b0" stroke="#ffd85a" stroke-width="1.5" stroke-linejoin="round"/></svg>`,
    { size: 96 },
  );
  const NOTE = svg(
    `<svg viewBox="0 0 30 40"><ellipse cx="9" cy="32" rx="7" ry="5" fill="#ffe27a" transform="rotate(-20 9 32)"/><rect x="14.5" y="6" width="3.6" height="26" fill="#ffe27a"/><path d="M18 6 Q28 10 25 23 Q24 14 18 14Z" fill="#ffe27a"/></svg>`,
    { size: 96 },
  );
  const LEAF = svg(
    `<svg viewBox="0 0 32 48"><defs><linearGradient id="l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fd05a"/><stop offset="1" stop-color="#2f7d3a"/></linearGradient></defs><path d="M16 48 Q1 28 16 2 Q31 28 16 48Z" fill="url(#l)" stroke="#276b30" stroke-width="1.5"/><path d="M16 46 L16 8" stroke="#b6ee9a" stroke-width="1.6"/></svg>`,
    { size: 96 },
  );

  // ------------------------------------------------------------------ skeleton
  const rootJ = b.joint("root", { at: [0, 0, 0] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, Y(0.34), -0.32],
      [0, Y(0.35), -0.08],
      [0, Y(0.36), 0.2],
      [0, Y(0.38), 0.4],
    ]),
    { parent: rootJ, names: ["hips", "spine1", "chest"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    polyline([
      [0, Y(0.38), 0.4],
      [0, Y(0.4), 0.47],
      [0, Y(0.42), 0.55],
    ]),
    { parent: spine, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck, at: [0, Y(0.42), 0.55], dir: [0, -0.05, 1], role: "head" });
  const hp = (f: number, u: number, l = 0) => head.at.clone().add(V(l, u, f));
  const jaw = b.joint("jaw", { parent: head, at: hp(0.05, -0.07), aim: hp(0.3, -0.09), role: "jaw" });
  const hips = spine.joints[0];
  const spine1 = spine.joints[1];
  const chest = spine.joints[2];

  // generic placement helpers
  const part = (geo: THREE.BufferGeometry, color: ColorInput, bone: Joint, at: THREE.Vector3 | P3, o: Extra = {}) =>
    b.part(geo, color, { bone, at, ...o });
  const prop = (geo: THREE.BufferGeometry, color: ColorInput, at: THREE.Vector3 | P3, o: Extra = {}) =>
    b.part(geo, color, { bone: rootJ, at, flat: true, ...o });

  // ------------------------------------------------------------------ body
  const body = b.loft(
    [
      { at: [0, Y(0.33), -0.42], w: 0.3, h: 0.3 },
      { at: [0, Y(0.34), -0.3], w: 0.42, h: 0.4 },
      { at: [0, Y(0.35), -0.08], w: 0.46, h: 0.42 },
      { at: [0, Y(0.35), 0.14], w: 0.45, h: 0.42 },
      { at: [0, Y(0.37), 0.34], w: 0.38, h: 0.38 },
      { at: [0, Y(0.4), 0.48], w: 0.26, h: 0.28 },
    ],
    { bone: [spine, neck], color: COAT },
  );

  // shoulders and haunches
  for (const s of [1, -1]) {
    part(sph(0.15, 10, 8), COAT, hips, [s * 0.17, Y(0.3), -0.33], { scale: [0.72, 0.95, 1.0] });
    part(sph(0.13, 10, 8), COAT, chest, [s * 0.17, Y(0.3), 0.22], { scale: [0.65, 0.9, 0.95] });
  }
  // little rump tuft in place of a tail
  part(sph(0.035, 6, 5), COAT, hips, [0, Y(0.31), -0.55], { scale: [1, 0.9, 0.8] });

  // ------------------------------------------------------------------ legs
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const FOOT_Y = GY + 0.045;
    // front
    const fpts = limb(V(s * 0.16, Y(0.27), 0.24), V(s * 0.18, FOOT_Y, 0.25), [0.15, 0.13], [0, 0, -1]);
    const fleg = b.chain("legF" + S, fpts, {
      parent: chest,
      names: ["shoulder" + S, "elbow" + S, "hand" + S],
      role: "leg",
      contact: [s * 0.18, GY, 0.28],
    });
    b.sweep(fleg, (t) => 0.07 - 0.024 * t, { color: LEGP });
    // hind
    const hpts = limb(V(s * 0.17, Y(0.28), -0.33), V(s * 0.18, FOOT_Y, -0.3), [0.15, 0.14], [0, 0, 1]);
    const hleg = b.chain("legH" + S, hpts, {
      parent: hips,
      names: ["hip" + S, "knee" + S, "foot" + S],
      role: "leg",
      contact: [s * 0.18, GY, -0.27],
    });
    b.sweep(hleg, (t) => 0.072 - 0.026 * t, { color: LEGP });

    for (const [leg, fz, nToes] of [
      [fleg, 0.25, 4],
      [hleg, -0.3, 3],
    ] as const) {
      const tip = leg.joints[leg.joints.length - 1];
      const fx = s * 0.18;
      part(sph(0.045, 8, 6), LEGP, tip, [fx, GY + 0.028, fz + 0.025], { scale: [1, 0.62, 1.45] });
      for (let i = 0; i < nToes; i++) {
        const tx = fx + (i - (nToes - 1) / 2) * (nToes === 4 ? 0.024 : 0.027);
        part(sph(0.017, 6, 4), TOE, tip, [tx, GY + 0.013, fz + 0.077], { scale: [0.9, 0.75, 1.3], flat: true });
        part(sph(0.009, 5, 4), NAIL, tip, [tx, GY + 0.015, fz + 0.099], { scale: [1, 0.6, 0.8], flat: true });
      }
    }
  }

  // ------------------------------------------------------------------ head
  const HEADP = gradient(COAT, "#6e4423", hp(0.14, 0), hp(0.36, 0));
  const skull = b.loft(
    [
      [-0.02, 0, 0.2, 0.21],
      [0.08, 0.03, 0.23, 0.24],
      [0.2, 0.025, 0.22, 0.19],
      [0.3, 0.02, 0.21, 0.17],
      [0.37, 0.015, 0.19, 0.15],
    ].map(([f, u, w, h]) => ({ at: hp(f, u), w, h })),
    { bone: head, color: HEADP, caps: { start: "round", end: "flat" } },
  );
  const skinH = b.surface(skull);

  // lower jaw (separate bone so it can open)
  b.frustumBox(hp(0.07, -0.062), hp(0.34, -0.07), [0.12, 0.045], [0.1, 0.038], { bone: jaw, color: "#b88a5a" });
  part(sph(0.03, 6, 5), "#b88a5a", jaw, hp(0.34, -0.072), { scale: [1.5, 0.65, 1] });

  // nose pad, nostrils, buck teeth
  part(sph(1, 10, 8), HEADP, head, hp(0.32, 0.012), { scale: [0.1, 0.078, 0.056] });
  part(sph(0.05, 8, 6), "#5a3a28", head, hp(0.37, 0.035), { scale: [1.05, 0.7, 0.5] });
  part(sph(0.007, 5, 4), "#ffffff", head, hp(0.392, 0.05, 0.022), { scale: [1, 0.7, 0.6], flat: true });
  for (const s of [1, -1]) {
    part(sph(0.011, 5, 4), "#1c0f08", head, hp(0.392, 0.036, s * 0.03), { scale: [1, 1.3, 0.8], flat: true });
    part(new THREE.BoxGeometry(0.018, 0.036, 0.01), "#ffe9a8", head, hp(0.376, -0.043, s * 0.011), { flat: true });
  }

  // whiskers
  for (const s of [1, -1])
    for (let k = -1; k <= 1; k++)
      b.rod(hp(0.34, 0.0 + k * 0.012, s * 0.075), hp(0.44, 0.015 + k * 0.035, s * 0.2), [0.0025, 0.001], "#f1dcb8", {
        bone: head,
        sides: 4,
      });

  // eyes: sleepy, serene
  for (const s of [1, -1]) {
    const hit = skinH.nearest(hp(0.19, 0.075, s * 0.25));
    const ec = vec(hit.at).addScaledVector(hit.n, 0.002);
    part(sph(0.029, 8, 6), DARK, head, ec);
    part(sph(0.008, 5, 4), "#ffffff", head, ec.clone().addScaledVector(hit.n, 0.02).add(V(0, 0.011, 0.008)), { flat: true });
    part(sph(0.004, 4, 3), "#ffffff", head, ec.clone().addScaledVector(hit.n, 0.022).add(V(0, -0.009, -0.004)), { flat: true });
    part(sph(0.031, 8, 6), FURMID, head, ec.clone().addScaledVector(hit.n, 0.004).add(V(0, 0.014, 0)), {
      scale: [1, 0.55, 1],
    });
    // cheek blush and smile decals
    const cheek = skinH.nearest(hp(0.2, -0.03, s * 0.25));
    b.decal(skinH, BLUSH, { at: cheek, size: [0.05, 0.032] });
    const mouth = skinH.nearest(hp(0.3, -0.05, s * 0.25));
    b.decal(skinH, SMILE, { at: mouth, size: [0.08, 0.04], mirror: s < 0 });
    // freckle dots on the muzzle
    for (let k = 0; k < 3; k++) {
      const dot = skinH.nearest(hp(0.3 + k * 0.012, 0.035 - k * 0.012, s * 0.2));
      b.stick(sph(0.005, 5, 4), "#3a2418", dot, { embed: 0.3 });
    }
  }

  // ears
  for (const s of [1, -1]) {
    const ec = hp(-0.01, 0.105, s * 0.088);
    part(sph(0.05, 8, 6), COAT, head, ec, { scale: [0.4, 1, 0.8], rotation: [0, 0, -s * 22] });
    part(sph(0.04, 8, 6), EARIN, head, ec.clone().add(V(s * 0.012, -0.004, 0.01)), {
      scale: [0.3, 0.85, 0.6],
      rotation: [0, 0, -s * 22],
    });
  }

  // ------------------------------------------------------------------ flowers (helper)
  const flower = (bone: Joint, at: THREE.Vector3, normal: THREE.Vector3, r: number, count: number, pc: string, cc: string) => {
    const n = normal.clone().normalize();
    const base = aim(n);
    for (let i = 0; i < count; i++) {
      const q = base.clone().multiply(new THREE.Quaternion().setFromAxisAngle(UPV, (i / count) * Math.PI * 2));
      const off = V(0, 0, r * 0.5).applyQuaternion(q);
      b.part(sph(1, 6, 4).scale(r * 0.3, r * 0.08, r * 0.55), pc, { bone, at: at.clone().add(off), quat: q, flat: true });
    }
    b.part(sph(r * 0.3, 6, 4), cc, { bone, at: at.clone().addScaledVector(n, r * 0.07), flat: true });
  };
  // daisy behind the left ear
  flower(head, hp(-0.04, 0.13, 0.115), V(0.6, 0.7, 0.25), 0.04, 7, "#ffffff", "#ffc928");

  // ------------------------------------------------------------------ the bird
  const birdBase = vec(hp(0.09, 0.14));
  const yq = new THREE.Quaternion().setFromAxisAngle(UPV, 0.5);
  const bpos = (x: number, y: number, z: number) => V(x, y, z).applyQuaternion(yq).add(birdBase);
  const bird = b.joint("bird", { parent: head, at: bpos(0, 0.058, 0) });
  const birdHead = b.joint("birdHead", { parent: bird, at: bpos(0, 0.125, 0.035) });
  const birdBeak = b.joint("birdBeak", { parent: birdHead, at: bpos(0, 0.112, 0.075) });
  const wingJ = {
    L: b.joint("birdWingL", { parent: bird, at: bpos(0.062, 0.075, 0), role: "wing" }),
    R: b.joint("birdWingR", { parent: bird, at: bpos(-0.062, 0.075, 0), role: "wing" }),
  };
  const birdTail = b.joint("birdTail", { parent: bird, at: bpos(0, 0.05, -0.07) });
  const bpart = (geo: THREE.BufferGeometry, color: ColorInput, bone: Joint, p: P3, rot: P3 = [0, 0, 0], scale?: P3) => {
    const q = yq.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * D, rot[1] * D, rot[2] * D)));
    return b.part(geo, color, { bone, at: bpos(p[0], p[1], p[2]), quat: q, ...(scale ? { scale } : {}) });
  };

  bpart(sph(1, 10, 8), BIRDP, bird, [0, 0.058, -0.005], [0, 0, 0], [0.068, 0.062, 0.078]);
  bpart(sph(0.052, 10, 8), BIRDP, birdHead, [0, 0.125, 0.035]);
  // beak
  bpart(new THREE.ConeGeometry(0.017, 0.045, 6), ORANGE, birdHead, [0, 0.12, 0.095], [90, 0, 0]);
  bpart(new THREE.ConeGeometry(0.012, 0.03, 6), "#f08a1e", birdBeak, [0, 0.108, 0.088], [90, 0, 0]);
  // crest
  bpart(new THREE.ConeGeometry(0.009, 0.05, 5), "#2f78d0", birdHead, [0, 0.176, 0.025], [-25, 0, 0]);
  for (const s of [1, -1]) {
    bpart(new THREE.ConeGeometry(0.008, 0.04, 5), "#3a8ed0", birdHead, [s * 0.013, 0.172, 0.03], [-18, 0, -s * 16]);
    // eyes, highlights, blush
    bpart(sph(0.011, 6, 5), DARK, birdHead, [s * 0.03, 0.137, 0.071]);
    bpart(sph(0.0042, 4, 3), "#ffffff", birdHead, [s * 0.027, 0.1425, 0.0785]);
    bpart(sph(0.013, 6, 4), PINK, birdHead, [s * 0.04, 0.117, 0.062], [0, s * 50, 0], [1, 0.8, 0.4]);
    // wings
    const W = s > 0 ? wingJ.L : wingJ.R;
    bpart(sph(1, 8, 6), "#2c68bd", W, [s * 0.056, 0.058, -0.015], [-12, 0, -s * 8], [0.014, 0.038, 0.06]);
    bpart(sph(1, 6, 5), "#1f4e96", W, [s * 0.056, 0.045, -0.06], [-14, 0, -s * 8], [0.01, 0.024, 0.04]);
    bpart(sph(1, 6, 4), "#8fd0ff", W, [s * 0.063, 0.072, 0.012], [-12, 0, -s * 8], [0.004, 0.016, 0.026]);
    // tail feathers
    bpart(sph(1, 6, 4), "#3a82dc", birdTail, [s * 0.018, 0.052, -0.095], [20, -s * 16, 0], [0.02, 0.008, 0.06]);
    // feet
    b.rod(bpos(s * 0.022, 0.012, 0.01), bpos(s * 0.022, -0.01, 0.016), 0.004, ORANGE, { bone: bird, sides: 4 });
  }
  bpart(sph(1, 6, 4), "#2c68bd", birdTail, [0, 0.055, -0.1], [20, 0, 0], [0.022, 0.008, 0.066]);

  // ------------------------------------------------------------------ fur cards
  const bodyHits = b.surface(body).scatter(110, { rng: R, minDist: 0.055, filter: (h) => h.n.y > 0.1 });
  b.cards(bodyHits, FUR, { size: [0.035, 0.05], lean: 78, bend: 20, vary: 0.3, rng: rng(12), color: "#9a6a3a" });
  const headHits = skinH.scatter(40, {
    rng: rng(13),
    minDist: 0.035,
    filter: (h) => h.n.y > 0.4 && h.at.distanceTo(birdBase) > 0.075 && h.at.z < head.at.z + 0.2,
  });
  b.cards(headHits, FUR, { size: [0.024, 0.036], lean: 75, bend: 20, vary: 0.3, rng: rng(14), color: "#946336" });

  // ------------------------------------------------------------------ yuzu helper
  const yuzu = (bone: Joint, c: THREE.Vector3, r: number) => {
    b.part(sph(r, 10, 8), YUZUP, { bone, at: c, scale: [1, 0.88, 1] });
    const top = c.clone().add(V(0, r * 0.82, 0));
    b.part(new THREE.CylinderGeometry(r * 0.12, r * 0.16, r * 0.28, 6), "#5b7a2a", { bone, at: top, flat: true });
    b.cards([frame(top, [0, 1, 0]), frame(top, [0, 1, 0])], LEAF, {
      size: [r * 0.8, r * 1.1],
      lean: 55,
      flow: (_f, i) => (i === 0 ? [1, 0, 0.3] : [-1, 0, -0.3]),
      bone,
      sink: 0,
    });
  };
  // a yuzu riding on the capybara's back
  const backHit = b.surface(body).ray([0, 2, -0.1], [0, -1, 0]);
  const backY = backHit ? backHit.at.y : Y(0.56);
  yuzu(spine1, V(0, backY + 0.035, -0.1), 0.05);

  // ------------------------------------------------------------------ the island
  const profile = [
    [0, 0],
    [0.92, 0],
    [0.97, 0.015],
    [0.98, 0.035],
    [0.95, 0.05],
    [0.9, GY],
    [0, GY],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  b.part(new THREE.LatheGeometry(profile, 26), BASEP, {
    bone: rootJ,
    at: [0, 0, 0.16],
    scale: [0.8, 1, 1],
    flat: true,
  });
  const inBase = (x: number, z: number, k: number) => (x / (0.8 * k)) ** 2 + ((z - 0.16) / k) ** 2 < 1;
  const inPond = (x: number, z: number, k: number) => ((x - 0.5) / (0.26 * k)) ** 2 + ((z + 0.15) / (0.34 * k)) ** 2 < 1;
  const nearCapy = (x: number, z: number) => Math.abs(x) < 0.34 && z > -0.62 && z < 1.0;

  // pond
  const PCX = 0.5;
  const PCZ = -0.15;
  prop(new THREE.CylinderGeometry(1, 1, 0.012, 22), WATERP, [PCX, GY + 0.003, PCZ], { scale: [0.19, 1, 0.27] });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + 0.2;
    const x = PCX + 0.225 * Math.cos(a);
    const z = PCZ + 0.305 * Math.sin(a);
    const st = new THREE.DodecahedronGeometry(0.04 + R() * 0.022, 0);
    prop(st, STONEP, [x, GY + 0.012, z], {
      scale: [1, 0.55 + R() * 0.25, 1],
      rotation: [R() * 40, R() * 360, R() * 40],
    });
  }
  // ripples
  for (const [r, dx, dz] of [
    [0.05, -0.03, 0.14],
    [0.085, -0.03, 0.14],
  ])
    prop(new THREE.TorusGeometry(r, 0.0025, 4, 20), "#e8fbff", [PCX + dx, GY + 0.0105, PCZ + dz], {
      rotation: [90, 0, 0],
      scale: [1, 1.2, 1],
    });

  // lily pads
  const padSpots: [number, number, number][] = [
    [PCX - 0.06, PCZ + 0.1, 0.4],
    [PCX + 0.07, PCZ - 0.14, 2.3],
    [PCX - 0.07, PCZ - 0.06, 4.0],
  ];
  const padFrames = padSpots.map(([x, z, a]) => frame([x - Math.cos(a) * 0.06, GY + 0.0105, z - Math.sin(a) * 0.06], [0, 1, 0]));
  b.cards(padFrames, LILY, {
    size: 0.12,
    lean: 90,
    mirror: true,
    flow: (_f, i) => [Math.cos(padSpots[i][2]), 0, Math.sin(padSpots[i][2])],
    bone: rootJ,
    sink: 0,
  });

  // lotus
  const LC = V(PCX + 0.06, GY + 0.012, PCZ + 0.02);
  for (const [count, tilt, len, col] of [
    [8, 38, 1, "#ff8fb0"],
    [6, 14, 0.85, "#ffc2d6"],
  ] as const) {
    b.ring(frame(LC, [0, 1, 0]), { count, radius: 0.014, tilt }, (item) =>
      b.stick(sph(1, 6, 4).scale(0.02 * len, 0.045 * len, 0.008), col, item, { bone: rootJ, embed: 0.1 }),
    );
  }
  prop(sph(0.014, 6, 4), "#ffd23a", [LC.x, LC.y + 0.02, LC.z]);

  // yuzu in the pond and on the grass
  yuzu(rootJ, V(PCX + 0.12, GY + 0.032, PCZ + 0.1), 0.04);
  for (const [x, z] of [
    [-0.45, 0.4],
    [-0.36, 0.52],
    [-0.52, 0.56],
  ])
    yuzu(rootJ, V(x, GY + 0.043, z), 0.05);

  // reeds and cattails
  const qb = (p0: P3, p1: P3, p2: P3, t: number) =>
    V(
      (1 - t) * (1 - t) * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0],
      (1 - t) * (1 - t) * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1],
      (1 - t) * (1 - t) * p0[2] + 2 * (1 - t) * t * p1[2] + t * t * p2[2],
    );
  [
    [-0.5, -0.45, 0.66],
    [-0.58, -0.36, 0.52],
    [-0.44, -0.56, 0.74],
    [-0.34, -0.64, 0.6],
    [-0.62, -0.5, 0.46],
  ].forEach(([x, z, h], i) => {
    const lean = (i % 2 ? 1 : -1) * 0.07;
    const p0: P3 = [x, GY, z];
    const p1: P3 = [x + lean * 0.3, GY + h * 0.55, z];
    const p2: P3 = [x + lean, GY + h, z + 0.02];
    b.sweep(bezier(p0, p1, p2), [0.008, 0.003], { bone: rootJ, color: "#5a8f3a", sides: 5, caps: "point" });
    if (i < 3) b.capsule(qb(p0, p1, p2, 0.8), qb(p0, p1, p2, 0.97), 0.017, "#6b3f1f", { bone: rootJ, sides: 6 });
  });

  // grass tufts around the rim
  const tufts: ReturnType<typeof frame>[] = [];
  for (let n = 0; n < 900 && tufts.length < 48; n++) {
    const x = (R() * 2 - 1) * 0.8;
    const z = 0.16 + (R() * 2 - 1);
    if (!inBase(x, z, 0.93) || inBase(x, z, 0.5) || nearCapy(x, z) || inPond(x, z, 1.35)) continue;
    tufts.push(frame([x, GY, z], [0, 1, 0]));
  }
  b.cards(tufts, GRASSTEX, { size: [0.1, 0.11], cross: true, vary: 0.35, spin: 25, rng: rng(21), bone: rootJ });

  // daisies on the grass
  let flowers = 0;
  for (let n = 0; n < 900 && flowers < 8; n++) {
    const x = (R() * 2 - 1) * 0.75;
    const z = 0.16 + (R() * 2 - 1) * 0.95;
    if (!inBase(x, z, 0.85) || nearCapy(x, z) || inPond(x, z, 1.5)) continue;
    const pink = flowers % 3 === 0;
    const p = V(x, GY + 0.035, z);
    b.rod([x, GY, z], p, 0.004, "#4f9a3a", { bone: rootJ, sides: 4 });
    flower(rootJ, p, V(0.15, 1, 0.1), 0.035, 6, pink ? PINK : "#ffffff", pink ? "#fff1a8" : "#ffc928");
    flowers++;
  }

  // ------------------------------------------------------------------ sparkles and notes
  const sparkle: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 12; i++) {
    const a = R() * Math.PI * 2;
    const rad = 0.45 + R() * 0.4;
    const x = Math.cos(a) * rad * 0.8;
    const z = 0.16 + Math.sin(a) * rad;
    const sy = GY + 0.3 + R() * 0.6;
    if (V(x, sy, z).distanceTo(birdBase) < 0.35) continue;
    sparkle.push(frame([x, sy, z], [0, 1, 0]));
  }
  glow(
    b.cards(sparkle, STAR, { size: 0.06, flow: [0, 0, 1], cross: true, vary: 0.4, rng: rng(31), bone: rootJ, sink: 0 }),
    1.4,
  );
  glow(
    b.cards([frame(bpos(0.17, 0.18, 0.05), [0, 1, 0]), frame(bpos(-0.14, 0.24, 0.09), [0, 1, 0])], NOTE, {
      size: [0.05, 0.065],
      cross: true,
      flow: [0, 0, 1],
      bone: head,
      sink: 0,
    }),
    1.3,
  );

  return b.root;
}
