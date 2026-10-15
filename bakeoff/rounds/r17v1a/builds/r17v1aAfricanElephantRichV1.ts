import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { catmull, bezier } from "../../../../src/path";
import { rng } from "../../../../src/math";
import { cells, mix, noise, paint, smoothstep } from "../../../../src/paint";
import { svg } from "../../../../src/texture";

export const meta = {
  name: "African Bush Elephant",
  description:
    "A faceted low-poly African bush elephant: sloped dome head, huge Africa-shaped ears, ringed trunk, curved ivory tusks, pillar legs with dusty lower hide, toenails and a bristle-tipped tail. Fully rigged.",
  style: "low-poly",
  commit: "88fc1f0",
};

// Flat colours -------------------------------------------------------------------------------------------------
const GREY_A = "#807b76";
const GREY_B = "#6d6965";
const GREY_D = "#4d4a48";
const GREY_L = "#9b958e";
const DUST_A = "#b38d66";
const DUST_B = "#9c7a57";
const IVORY = "#ece1c6";
const IVORY_D = "#c9b48a";
const STAIN = "#8d6d46";
const GUM = "#9a6a66";
const NAIL = "#d2c6ad";
const NAIL_D = "#a89a82";
const BRISTLE = "#2a2421";
const EYE = "#17110e";
const AMBER = "#c7882c";
const NOSTRIL = "#35282a";
const EAR_PINK = "#a58b84";
const EAR_VEIN = "#6c5c5e";

export default function build() {
  const b = createBuilder({ name: "africanElephant", paintSize: 2048 });
  const rand = rng(11);

  // Skin paints: warm grey hide, horizontal crease cells, dust on the lower body, lighter belly ---------------------
  const skin = paint((p, n) => {
    const m = noise(p, 0.8, 3);
    let base = mix(GREY_B, GREY_A, smoothstep(0.3, 0.7, m));
    base = mix(base, GREY_L, 0.45 * smoothstep(0.1, -0.8, n.y));
    const c = cells(new THREE.Vector3(p.x, p.y * 2.4, p.z), 0.2, 5);
    const crease = 1 - smoothstep(0.0, 0.1, c.d2 - c.d1);
    base = mix(base, GREY_D, crease * 0.75);
    const dustAmt = smoothstep(1.5, 0.35, p.y) * (0.55 + 0.45 * noise(p, 0.35, 9));
    const dust = mix(DUST_B, DUST_A, noise(p, 0.5, 4));
    return mix(base, dust, Math.min(1, dustAmt * 0.95));
  });

  // Trunk: crease rings keyed to t on top of the hide paint.
  const RINGS = 26;
  const ringPhase = (t: number) => (t * RINGS) % 1;
  const trunkSkin = paint((_p, n, s) => {
    const ph = ringPhase(s[0]);
    const groove = ph < 0.22 || ph > 0.9;
    if (groove) return GREY_D;
    const under = smoothstep(-0.2, -0.9, n.y);
    return mix(GREY_A, GREY_L, under * 0.7);
  });

  // Skeleton ----------------------------------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 2.2, -1.0], dir: [0, 0, 1], role: "spine" });
  const spinePath = catmull([
    [0, 2.2, -1.0],
    [0, 2.12, -0.2],
    [0, 2.2, 0.6],
    [0, 2.34, 1.2],
  ]);
  const spine = b.chain("spine", spinePath, { parent: hips, role: "spine", count: 3 });
  const neck = b.chain(
    "neck",
    catmull([
      [0, 2.34, 1.2],
      [0, 2.55, 1.4],
      [0, 2.7, 1.55],
    ]),
    { parent: spine.joints[2], role: "neck", count: 2 },
  );
  const head = b.joint("head", { at: neck.at(1), dir: [0, -0.05, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 2.3, 1.75], aim: [0, 2.2, 2.3], role: "jaw" });

  // Body --------------------------------------------------------------------------------------------------------
  const body = b.loft(
    [
      { at: [0, 2.45, -1.62], w: 0.8, h: 1.1 },
      { at: [0, 2.3, -1.3], w: 1.35, h: 1.6 },
      { at: [0, 2.2, -1.0], w: 1.62, h: 1.85 },
      { at: [0, 2.12, -0.2], w: 1.66, h: 1.95 },
      { at: [0, 2.2, 0.6], w: 1.6, h: 2.0 },
      { at: [0, 2.3, 1.15], w: 1.34, h: 1.78 },
      { at: [0, 2.38, 1.5], w: 0.9, h: 1.2 },
    ],
    { bone: [hips, spine], color: skin, sides: 8, smooth: false, name: "body" },
  );
  b.sweep(neck, [0.5, 0.52], {
    color: skin,
    sides: 8,
    smooth: false,
    name: "neck",
  });

  // Head (sloped dome forehead) ----------------------------------------------------------------------------------
  const skull = b.loft(
    [
      { at: [0, 2.65, 1.05], w: 0.95, h: 1.3 },
      { at: [0, 2.72, 1.5], w: 1.08, h: 1.38 },
      { at: [0, 2.62, 1.95], w: 0.86, h: 1.05 },
      { at: [0, 2.5, 2.3], w: 0.52, h: 0.62 },
    ],
    { bone: head, color: skin, sides: 8, smooth: false, name: "skull" },
  );
  // twin forehead bumps and brow ridges
  const skullSkin = b.surface(skull);
  for (const s of [1, -1]) {
    const bump = skullSkin.around([0, 2.7, 1.6]).at(s * 28, 55);
    if (bump) b.stick(new THREE.SphereGeometry(0.2, 6, 4), skin, bump, { embed: 0.45, flat: true });
    const cheek = skullSkin.around([0, 2.6, 1.9]).at(s * 78, -15);
    if (cheek) b.stick(new THREE.SphereGeometry(0.17, 6, 4), skin, cheek, { embed: 0.5, flat: true });
  }

  // lower jaw (separate part on its own bone)
  b.frustumBox([0, 2.17, 1.7], [0, 2.1, 2.36], [0.4, 0.2], [0.3, 0.16], {
    bone: jaw,
    color: skin,
    name: "lowerJaw",
  });
  b.frustumBox([0, 2.3, 2.0], [0, 2.26, 2.32], [0.32, 0.06], [0.26, 0.06], { bone: jaw, color: GUM, name: "lowerLip" });

  // Trunk -------------------------------------------------------------------------------------------------------
  const trunkPath = catmull([
    [0, 2.52, 2.28],
    [0, 2.08, 2.62],
    [0, 1.5, 2.78],
    [0, 0.98, 2.84],
    [0, 0.62, 2.98],
    [0, 0.45, 3.28],
  ]);
  const trunk = b.chain("trunk", trunkPath, {
    parent: head,
    role: "tentacle",
    names: ["trunk1", "trunk2", "trunk3", "trunk4", "trunk5", "trunkTip"],
  });
  const tri = (x: number) => Math.abs(((x % 1) + 1) % 1 - 0.5) * 2; // 0..1..0
  const trunkTube = b.sweep(
    trunk,
    (t) => {
      const base = 0.3 * (1 - t) + 0.085 * t + 0.03 * Math.sin(Math.PI * Math.min(1, t * 2.2));
      const ridge = 1 + 0.06 * (1 - tri(t * RINGS + 0.12) * 0) * (ringPhase(t) < 0.22 ? -1 : 1);
      return base * ridge;
    },
    { color: trunkSkin, sides: 8, smooth: false, caps: "flat", name: "trunk" },
  );
  const tipHit = trunk.at(1);
  const tipDir = tipHit.tangent;
  // nostrils and finger at the tip
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.03, 6, 4).scale(1, 1, 0.5), NOSTRIL, {
      at: [tipHit.at.x + s * 0.034, tipHit.at.y - 0.005, tipHit.at.z + 0.012],
      dir: [tipDir.x, tipDir.y, tipDir.z],
      axis: "z",
      bone: trunk.tip!,
      name: "nostril",
    });
  }
  b.spike([0, tipHit.at.y + 0.075, tipHit.at.z - 0.04], [0, 0.35, 1], 0.17, 0.045, {
    bone: trunk.tip!,
    color: skin,
    sides: 6,
    name: "trunkFinger",
  });
  b.spike([0, tipHit.at.y - 0.07, tipHit.at.z - 0.03], [0, -0.2, 1], 0.1, 0.04, {
    bone: trunk.tip!,
    color: GREY_L,
    sides: 6,
    name: "trunkLip",
  });
  void trunkTube;

  // Tusks --------------------------------------------------------------------------------------------------------
  const tuskPaint = paint((p, _n, s) => {
    const t = s[0];
    if (t < 0.1) return GUM;
    const wear = mix(STAIN, IVORY, smoothstep(0.1, 0.4, t));
    const streak = noise(new THREE.Vector3(p.x * 6, p.y * 6, p.z * 1.2), 0.1, 17);
    return mix(wear, IVORY_D, streak > 0.62 ? 0.7 : 0.0);
  });
  for (const s of [1, -1]) {
    b.sweep(
      bezier([s * 0.3, 2.3, 2.12], [s * 0.62, 1.35, 2.45], [s * 0.7, 1.35, 3.4], [s * 0.5, 1.75, 3.95]),
      (t) => 0.1 * (1 - t) + 0.012,
      { bone: head, color: tuskPaint, sides: 7, caps: "point", name: "tusk" },
    );
  }

  // Ears (big Africa-shaped flaps on hinge joints) -------------------------------------------------------------
  const earOutline: [number, number, string?][] = [
    [0, 0.08],
    [0.3, 0.2],
    [0.75, 0.18],
    [1.1, 0.0],
    [1.3, -0.35],
    [1.3, -0.75],
    [1.18, -0.92, "sharp"],
    [1.24, -1.02],
    [1.04, -1.25],
    [0.76, -1.5],
    [0.5, -1.68, "sharp"],
    [0.36, -1.34],
    [0.18, -0.9],
    [0, -0.55],
  ].map((c) => (c.length === 3 ? c : [c[0], c[1]])) as [number, number, string?][];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const ear = b.joint(`ear${side}`, {
      parent: head,
      at: [s * 0.46, 3.08, 1.45],
      aim: [s * 0.85, 2.0, 0.4],
      role: "hinge",
    });
    const xdir: [number, number, number] = [s * 0.42, 0, -0.9];
    const thick = new THREE.Vector3(...xdir).cross(new THREE.Vector3(0, 1, 0)).normalize();
    const earPaint = paint((_p, n, c) => {
      if (Math.abs(n.dot(thick)) < 0.5) return GREY_D;
      const dx = c[0] + 0.05;
      const dy = c[1] + 0.35;
      const ang = Math.atan2(dy, dx);
      const wob = noise(new THREE.Vector3(c[0], c[1], 0.3), 0.3, 21) * 1.2;
      const vein = Math.abs(Math.sin(ang * 9 + wob * 3 + Math.hypot(dx, dy) * 0.8));
      const edge = smoothstep(0.1, 0.0, c[1] + 0.0) * 0.0;
      let col = mix(EAR_PINK, GREY_A, 0.55 + 0.45 * noise(new THREE.Vector3(c[0], c[1], 0.0), 0.35, 8));
      col = mix(col, EAR_VEIN, smoothstep(0.93, 1.0, vein) * 0.55 + edge);
      return mix(col, GREY_B, smoothstep(0.25, 0.0, c[1] + 0.2 - 0.2) * 0.0);
    });
    b.extrude(earOutline as never, {
      at: ear.at,
      x: xdir,
      y: [0, 1, 0],
      thickness: 0.04,
      bevel: 0.012,
      color: earPaint,
      bone: ear,
      name: "ear",
    });
  }

  // Legs ---------------------------------------------------------------------------------------------------------
  const nailGeo = (w: number) => new THREE.CylinderGeometry(w * 0.7, w, 0.12, 4).rotateY(Math.PI / 4);
  const legs: { chain: ReturnType<typeof b.chain>; fore: boolean; s: number }[] = [];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    for (const fore of [true, false]) {
      const tag = fore ? "F" : "H";
      const rootP: [number, number, number] = [s * 0.54, 1.95, fore ? 0.78 : -0.92];
      const foot: [number, number, number] = [s * 0.54, 0.3, fore ? 0.84 : -0.98];
      const pts = limb(
        rootP,
        foot,
        [0.75, 0.75, 0.3],
        fore
          ? [
              [0, 0, -1],
              [0, 0, 1],
            ]
          : [
              [0, 0, 1],
              [0, 0, -1],
            ],
      );
      const chain = b.chain(`leg${tag}${side}`, pts, {
        parent: fore ? spine.joints[2] : hips,
        names: [`hip${tag}${side}`, `knee${tag}${side}`, `ankle${tag}${side}`, `foot${tag}${side}`],
        role: "leg",
        contact: [foot[0], 0, foot[2]],
      });
      const tube = b.sweep(chain, (t) => (fore ? 0.4 - 0.15 * t - 0.02 * Math.sin(t * 3.14) : 0.42 - 0.17 * t), {
        color: skin,
        sides: 8,
        smooth: false,
        caps: "round",
        name: `leg${tag}${side}`,
      });
      // skin folds at knee and ankle
      const lg = b.surface(tube);
      for (const t of [0.42, 0.52, 0.86, 0.92]) {
        try {
          b.sweep(lg.loop(chain.at(t), { lift: 0.012 }), 0.02, { color: skin, sides: 5, smooth: false, name: "fold" });
        } catch {
          /* plane missed */
        }
      }
      const footJ = chain.tip!;
      b.part(new THREE.CylinderGeometry(0.28, 0.32, 0.26, 8), skin, {
        at: [foot[0], 0.12, foot[2]],
        bone: footJ,
        flat: true,
        name: "foot",
      });
      b.part(new THREE.CylinderGeometry(0.31, 0.31, 0.02, 8), GREY_D, {
        at: [foot[0], -0.01, foot[2]],
        bone: footJ,
        name: "sole",
      });
      // ankle skin collar
      b.part(new THREE.CylinderGeometry(0.27, 0.33, 0.14, 8), skin, {
        at: [foot[0], 0.3, foot[2]],
        bone: footJ,
        flat: true,
        name: "collar",
      });
      const nails = fore ? [-52, -18, 18, 52] : [-34, 0, 34];
      for (const a of nails) {
        const r = (a * Math.PI) / 180;
        b.part(nailGeo(0.062), (a + 400) % 2 === 0 ? NAIL : NAIL_D, {
          at: [foot[0] + 0.325 * Math.sin(r), 0.1, foot[2] + 0.325 * Math.cos(r)],
          rotation: [0, a, 0],
          bone: footJ,
          flat: true,
          name: "nail",
        });
      }
      legs.push({ chain, fore, s });
    }
  }

  // Shoulder and hip bones, spine ridge
  const bodySkin = b.surface(body);
  for (const s of [1, -1]) {
    const hip = bodySkin.around([0, 2.2, -1.0]).at(s * 60, 50);
    if (hip) b.stick(new THREE.SphereGeometry(0.2, 6, 4), skin, hip, { embed: 0.5, flat: true });
    const sh = bodySkin.around([0, 2.3, 0.7]).at(s * 70, 45);
    if (sh) b.stick(new THREE.SphereGeometry(0.22, 6, 4), skin, sh, { embed: 0.55, flat: true });
  }

  // Tail ---------------------------------------------------------------------------------------------------------
  const rump = bodySkin.around([0, 2.4, -1.2]).at(180, 10);
  const tailPath = catmull([
    [0, 2.5, -1.72],
    [0, 2.05, -1.98],
    [0, 1.5, -2.02],
    [0, 0.98, -1.98],
    [0, 0.72, -1.94],
  ]);
  const tail = rump
    ? b.sprout("tail", rump, tailPath, [0.075, 0.04], {
        count: 4,
        names: ["tail1", "tail2", "tail3", "tail4"],
        role: "tail",
        color: skin,
        sides: 6,
        smooth: false,
        caps: "round",
      })
    : null;
  const tailEnd = tailPath.at(1);
  const brushBone = tail ? tail.chain!.joints[tail.chain!.joints.length - 1] : hips;
  const brush = b.ring(frame(tailEnd, [0, 1, 0], [0, 0, 1]), { count: 10, radius: 0.025, tilt: 25 });
  for (const item of brush.items) {
    b.spike(item, item, 0.3, 0.012, { color: BRISTLE, sides: 4, bone: brushBone, name: "bristle" });
  }
  const strand = svg(
    `<svg viewBox="0 0 16 64"><path d="M8 64 C 6 44, 10 24, 7 2" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M5 64 C 3 48, 5 30, 2 14" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M11 64 C 13 46, 11 30, 14 12" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`,
    { size: 128 },
  );
  b.cards(
    b.ring(frame(tailEnd, [0, 1, 0], [0, 0, 1]), { count: 6, radius: 0.03, tilt: 12 }).items,
    strand,
    { size: [0.1, 0.3], lean: 10, vary: 0.25, rng: rand, color: BRISTLE, bone: brushBone, cross: true },
  );

  // Eyes ---------------------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const hit = skullSkin.around([0, 2.7, 1.8]).at(s * 66, 6);
    if (!hit) continue;
    b.stick(new THREE.SphereGeometry(0.085, 6, 4).scale(1, 0.55, 1.1), GREY_D, hit, { embed: 0.5, flat: true, name: "socket" });
    const eye = b.stick(new THREE.SphereGeometry(0.036, 6, 4), AMBER, hit, { embed: 0.2, flat: true, name: "eye" });
    b.stick(new THREE.SphereGeometry(0.02, 5, 4), EYE, hit.moved([0, 0.03, 0]), { embed: 0.2, flat: true, name: "pupil" });
    b.ring(eye, { count: 5, radius: 0.045, fromDeg: -70, toDeg: 70 }, (lash) =>
      b.spike(lash, lash, 0.05, 0.007, { color: BRISTLE, sides: 4, name: "lash" }),
    );
    // temporal gland streak
    const gl = skullSkin.around([0, 2.7, 1.8]).at(s * 70, -8);
    if (gl) b.stick(new THREE.SphereGeometry(0.05, 5, 4).scale(0.5, 1.6, 1), GREY_D, gl, { embed: 0.5, flat: true, name: "gland" });
  }

  // Crown and back bristles
  const tuft = svg(
    `<svg viewBox="0 0 24 48"><path d="M12 48 C 11 34, 13 18, 11 2" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M6 48 C 5 38, 6 28, 3 18" stroke="#fff" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M18 48 C 19 38, 18 28, 21 16" stroke="#fff" stroke-width="3.5" fill="none" stroke-linecap="round"/></svg>`,
    { size: 128 },
  );
  const crown = skullSkin.scatter(28, { rng: rng(5), minDist: 0.13, filter: (h) => h.n.y > 0.6 });
  b.cards(crown, tuft, { size: [0.06, 0.12], lean: 35, bend: 20, vary: 0.3, rng: rng(6), color: BRISTLE, bone: head });
  const backHits = bodySkin.scatter(36, { rng: rng(8), minDist: 0.22, filter: (h) => h.n.y > 0.8 });
  b.cards(backHits, tuft, { size: [0.05, 0.1], lean: 40, vary: 0.3, rng: rng(9), color: BRISTLE });

  return b.root;
}
