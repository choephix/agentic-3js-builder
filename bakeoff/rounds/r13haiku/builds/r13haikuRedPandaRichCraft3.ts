import * as THREE from "three";
import { catmull, cells, createBuilder, mix, noise, paint, rgb, rng, smoothstep, svg } from "../../../../src/index";
import type { Builder, ColorInput, Joint, Part, Rgb } from "../../../../src/index";
import { animeEye, cel, furEdge, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Red panda on a mossy stone",
  description: "A stylised red panda balancing on a moss-covered stone, arms out, tail counterweighting.",
};

type Vec = [number, number, number];

// Head scale: every head size and offset below is written in these units.
const H = 1.15;
const HC: Vec = [0, 0.99, 0.11]; // head centre
const HR: Vec = [0.12 * H, 0.107 * H, 0.113 * H]; // head radii
const STONE_H = 0.3; // stone top, where the hind feet stand
const FOOT_X = 0.095; // hind feet sit this far either side of the centre line

const RUST = "#ea6a2f";
const DEEP = "#8c2c1a";
const DARK = "#3d2521";
const CREAM = "#fff1d6";
const JADE = "#2fc4a0";
const GILT = "#ffd25a";
const CLAW = "#f6ead6";
const PAD_PINK = "#f08aa0";
const STONE_HI = "#aab3d2";
const STONE_LO = "#6b7396";
const MOSS_LO = "#3f9a3a";
const MOSS_HI = "#8fdc4f";

// ---------------------------------------------------------------------------------------------------------------
// Helpers

function segDist(px: number, py: number, ax: number, ay: number, bx: number, by: number) {
  const dx = bx - ax;
  const dy = by - ay;
  const t = Math.min(Math.max(((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy), 0), 1);
  return Math.hypot(px - (ax + dx * t), py - (ay + dy * t));
}

/** An ellipsoid built in model space and riding `bone` rigidly. */
function blob(b: Builder, bone: Joint, c: Vec, r: Vec, color: ColorInput, seg = 14): Part {
  const geo = new THREE.SphereGeometry(1, seg, Math.max(3, Math.round(seg * 0.75)))
    .scale(r[0], r[1], r[2])
    .translate(c[0], c[1], c[2]);
  return b.part(geo, color, { bone, at: [0, 0, 0] });
}

/** An ellipse outline, tilted by `tilt` radians, for ears. */
function ellipse(rx: number, ry: number, tilt = 0): [number, number][] {
  const c = Math.cos(tilt);
  const s = Math.sin(tilt);
  return Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2;
    const u = Math.cos(a) * rx;
    const v = Math.sin(a) * ry;
    return [u * c + v * s, -u * s + v * c] as [number, number];
  });
}

/** A fur tuft drawing for cards. */
function furTuft(fill: string, edge: string) {
  return svg(
    `<svg viewBox="0 0 24 40" xmlns="http://www.w3.org/2000/svg"><path d="M3 40 C4 24 2 14 9 2 C9 14 10 22 13 30 C14 20 16 12 22 6 C19 18 18 28 20 40 Z" fill="${fill}" stroke="${edge}" stroke-width="1.6" stroke-linejoin="round"/></svg>`,
    { size: 128 },
  );
}

/** A low, flat-topped boulder: the top is level so the feet stand on it. */
function stoneGeometry(): THREE.BufferGeometry {
  const geo = new THREE.CylinderGeometry(0.27, 0.36, STONE_H, 10, 3);
  const pos = geo.getAttribute("position") as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const k = 0.9 + 0.2 * noise(v, 0.2, 5);
    pos.setXYZ(i, v.x * k, v.y, v.z * k);
  }
  return geo.translate(0, STONE_H / 2, 0);
}

const nearFeet = (p: THREE.Vector3) => Math.hypot(Math.abs(p.x) - FOOT_X, p.z - 0.03) < 0.13;

// ---------------------------------------------------------------------------------------------------------------
// Paints (cel-shaded, Genshin-style)

const furRust = cel(RUST);
const furDeep = cel(DEEP);
const furDark = cel(DARK);
const furCream = cel(CREAM, "#f0c9a2");
const mossCel = cel(MOSS_HI, MOSS_LO);

const headFur = cel(
  paint((p, n) => {
    let c: Rgb = rgb(RUST);
    const front = smoothstep(0.25, 0.6, n.z);
    const cheek = 0.975 + 0.012 * (noise(p, 0.06, 4) - 0.5);
    c = mix(c, CREAM, front * smoothstep(cheek + 0.01, cheek - 0.01, p.y));
    c = mix(c, DEEP, 0.6 * smoothstep(0.55, 0.8, n.y));
    const tear = segDist(Math.abs(p.x), p.y, 0.072, 0.97, 0.106, 0.912);
    return front > 0.3 && tear < 0.0095 ? DEEP : c;
  }),
);

const belly = furEdge(RUST, DARK, { level: -0.2, teeth: 0.22, period: 0.03, ink: INK, inkWidth: 0.12 });
const bodyFur = cel(paint((p, n) => (n.z > 0.55 && p.y > 0.6 && p.y < 0.74 ? CREAM : belly)));

const tailFur = cel(paint((_p, _n, s) => (s[0] > 0.9 ? CREAM : Math.floor(s[0] * 6.5) % 2 === 0 ? RUST : DEEP)));

const rock = cel(
  paint((p, n) => {
    const tone = mix(STONE_HI, STONE_LO, smoothstep(0.35, 0.8, noise(p, 0.22, 21)));
    const c = cells(p, 0.13, 8);
    const seam = c.d2 - c.d1 < 0.05 ? mix(tone, INK, 0.7) : tone;
    const top = smoothstep(0.55, 0.85, n.y + 0.3 * (noise(p, 0.09, 7) - 0.5));
    const drip =
      smoothstep(0.62, 0.7, noise(p, 0.045, 11)) * smoothstep(0.18, 0.27, p.y) * smoothstep(0.35, 0.1, n.y);
    return mix(seam, mix(MOSS_LO, MOSS_HI, noise(p, 0.05, 3)), Math.max(top, drip));
  }),
);

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "red-panda-stone" });

  // Textures
  const EYE = animeEye({ iris: "#41d9c2", irisLight: "#c4fff4", irisDark: "#1d6f7e" });
  const MOUTH = svg(
    `<svg viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg"><path d="M26 13 Q30 27 34 13 Z" fill="#ff8aa8"/><path d="M3 6 Q16 26 30 10 Q44 26 57 6" fill="none" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/></svg>`,
    { size: 256 },
  );
  const PAD_TEX = svg(
    `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><ellipse cx="20" cy="27" rx="9.5" ry="8" fill="${PAD_PINK}"/><ellipse cx="7" cy="16" rx="3.8" ry="4.8" fill="${PAD_PINK}"/><ellipse cx="14.5" cy="9" rx="3.6" ry="4.6" fill="${PAD_PINK}"/><ellipse cx="25.5" cy="9" rx="3.6" ry="4.6" fill="${PAD_PINK}"/><ellipse cx="33" cy="16" rx="3.8" ry="4.8" fill="${PAD_PINK}"/></svg>`,
    { size: 128 },
  );
  const TUFT = svg(
    `<svg viewBox="0 0 40 48" xmlns="http://www.w3.org/2000/svg"><path d="M3 48 Q4 26 9 12 Q11 26 14 34 Q16 16 20 4 Q22 22 24 32 Q27 18 34 10 Q31 28 37 48 Z" fill="${MOSS_HI}" stroke="#2c6b30" stroke-width="2.2" stroke-linejoin="round"/><path d="M20 4 Q22 22 24 32" fill="none" stroke="#c9f58a" stroke-width="1.6"/></svg>`,
    { size: 128 },
  );
  const LEAF = svg(
    `<svg viewBox="0 0 40 56" xmlns="http://www.w3.org/2000/svg"><path d="M20 3 Q39 26 20 53 Q1 26 20 3 Z" fill="#48d6a6" stroke="#15483c" stroke-width="2.6"/><path d="M20 9 L20 47" stroke="#15483c" stroke-width="2"/><path d="M20 22 L13 16 M20 30 L27 24 M20 37 L13 32" stroke="#15483c" stroke-width="1.6"/></svg>`,
    { size: 192 },
  );
  const FUR_RUST = furTuft(RUST, DEEP);
  const FUR_CREAM = furTuft(CREAM, "#e2b98e");

  // Skeleton: a stone root, the hips, a spine up the body, the head, and chains for legs, arms and tail.
  const stoneRoot = b.joint("stone", { at: [0, 0, 0] });
  const hips = b.joint("hips", { parent: stoneRoot, at: [0, 0.5, -0.02], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.5, -0.02],
      [0, 0.6, 0],
      [0, 0.7, 0.03],
      [0, 0.8, 0.07],
      [0, 0.9, 0.1],
    ]),
    { parent: hips, names: ["belly", "chest", "neck", "nape"], role: "spine" },
  );
  const head = b.joint("head", { parent: spine, at: [0, 0.92, 0.1], aim: [0, 1.1, 0.13], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.9, 0.2], aim: [0, 0.86, 0.25], role: "jaw" });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.5, -0.08],
      [0, 0.45, -0.22],
      [0.03, 0.44, -0.36],
      [0.16, 0.52, -0.42],
      [0.26, 0.66, -0.4],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" },
  );

  // The stone the panda balances on.
  const stone = b.part(stoneGeometry(), rock, { bone: stoneRoot, at: [0, 0, 0], flat: true });
  const stoneSurf = b.surface(stone);
  const clumpRng = rng(51);
  for (const hit of stoneSurf.scatter(16, {
    rng: clumpRng,
    minDist: 0.07,
    filter: (h) => h.n.y > 0.6 && !nearFeet(h.at),
  })) {
    b.stick(new THREE.IcosahedronGeometry(0.026 + 0.018 * clumpRng(), 0), mossCel, hit, { embed: 0.4 });
  }
  b.cards(
    stoneSurf.scatter(44, { rng: rng(12), minDist: 0.045, filter: (h) => h.n.y > 0.6 && !nearFeet(h.at) }),
    TUFT,
    { size: [0.05, 0.066], lean: 0, bend: 14, vary: 0.35, rng: rng(13), cross: true },
  );

  // Body: a loft through the spine, a chest bib, heavy shoulders and haunches.
  const body = b.loft(
    [
      { at: [0, 0.5, -0.02], w: 0.25, h: 0.27 },
      { at: [0, 0.6, 0], w: 0.3, h: 0.3 },
      { at: [0, 0.7, 0.03], w: 0.28, h: 0.28 },
      { at: [0, 0.8, 0.07], w: 0.19, h: 0.19 },
    ],
    { bone: [spine, hips], color: bodyFur },
  );
  for (const s of [1, -1]) {
    blob(b, spine.joints[2], [s * 0.125, 0.74, 0.06], [0.07, 0.085, 0.075], furRust);
    blob(b, hips, [s * 0.1, 0.43, 0], [0.072, 0.082, 0.082], furRust);
  }
  b.cards(
    b.surface(body).scatter(18, {
      rng: rng(71),
      minDist: 0.03,
      filter: (h) => h.n.z > 0.5 && h.at.y > 0.6 && h.at.y < 0.74,
    }),
    FUR_CREAM,
    { size: [0.03, 0.04], lean: 60, bend: 20, vary: 0.25, rng: rng(72) },
  );

  // Head: a round skull with a cream muzzle, a dark nose, a jaw and whiskers.
  const headMesh = blob(b, head, HC, HR, headFur, 20);
  const muzzle = blob(b, head, [0, 0.925, 0.225], [0.072, 0.05, 0.058], furCream, 16);
  blob(b, jaw, [0, 0.882, 0.235], [0.04, 0.024, 0.044], furCream, 12);
  blob(b, head, [0, 0.958, 0.272], [0.03, 0.021, 0.02], INK, 10);
  b.decal(muzzle, MOUTH, { at: [0, 0.93, 0.28], dir: [0, 0, 1], size: [0.07, 0.035], lift: 0.002 });

  const EYES: Vec = [0.058, HC[1] + 0.025, 0.215];
  for (const s of [1, -1])
    b.decal(headMesh, EYE, {
      at: [s * EYES[0], EYES[1], EYES[2]],
      dir: [0, 0, 1],
      size: [0.075, 0.1],
      mirror: s > 0,
    });

  // Round ears: rust shell, cream inner, tilted outward.
  for (const s of [1, -1]) {
    const at: Vec = [s * 0.08, HC[1] + 0.095, HC[2] - 0.02];
    b.extrude(ellipse(0.05, 0.058, s * 0.3), {
      at,
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.02,
      bevel: 0.005,
      color: furRust,
      bone: head,
    });
    b.extrude(ellipse(0.028, 0.034, s * 0.3), {
      at: [at[0], at[1] + 0.002, at[2] + 0.011],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.008,
      bevel: 0.003,
      color: furCream,
      bone: head,
    });
  }

  // Whiskers.
  for (const s of [1, -1])
    for (const k of [0, 1, 2]) {
      const y = 0.93 + k * 0.012;
      b.rod([s * 0.035, y, 0.27], [s * 0.18, y + 0.012 - k * 0.012, 0.2], 0.0022, INK, { bone: head });
    }

  // Fur: cheek ruffs, a crest on top of the head, and fluff on the tail.
  b.cards(
    b.surface(headMesh).scatter(36, {
      rng: rng(41),
      minDist: 0.028,
      filter: (h) => Math.abs(h.at.x) > 0.085 && h.at.y < 0.985 && h.n.z > -0.3,
    }),
    FUR_CREAM,
    { size: [0.032, 0.045], lean: 65, bend: 25, vary: 0.25, rng: rng(42) },
  );
  b.cards(
    b.surface(headMesh).scatter(12, {
      rng: rng(61),
      minDist: 0.04,
      filter: (h) => h.n.y > 0.7 && h.at.z < HC[2],
    }),
    FUR_RUST,
    { size: [0.05, 0.065], lean: 40, bend: 20, vary: 0.3, rng: rng(62) },
  );

  // Legs: a rust-dark thigh chain, dark feet with pink pads and claws.
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const leg = b.chain(
      `leg${L}`,
      catmull([
        [s * 0.085, 0.5, -0.02],
        [s * 0.1, 0.4, 0.03],
        [s * 0.095, 0.315, -0.01],
      ]),
      { parent: hips, names: [`hip${L}`, `knee${L}`, `foot${L}`], role: "leg" },
    );
    b.sweep(leg, (t) => 0.06 - 0.02 * t, { color: furDark });
    const footJ = leg.joints[2];
    const foot = blob(b, footJ, [s * FOOT_X, 0.315, 0.03], [0.054, 0.03, 0.082], furDark, 16);
    b.decal(foot, PAD_TEX, { at: [s * FOOT_X, 0.318, 0.11], dir: [0, 0, 1], size: [0.042, 0.042] });
    for (const k of [-1, 0, 1]) {
      blob(b, footJ, [s * FOOT_X + k * 0.028, 0.3, 0.095], [0.019, 0.014, 0.02], furDark, 8);
      b.spike([s * FOOT_X + k * 0.024, 0.302, 0.108], [0, -0.287, 0.958], 0.016, 0.0045, {
        color: CLAW,
        bone: footJ,
      });
    }

    // Arms, raised and spread for balance.
    const arm = b.chain(
      `arm${L}`,
      catmull([
        [s * 0.11, 0.78, 0.06],
        [s * 0.22, 0.74, 0.1],
        [s * 0.3, 0.84, 0.08],
      ]),
      { parent: spine.joints[2], names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`], role: "arm" },
    );
    b.sweep(arm, (t) => 0.047 - 0.014 * t, { color: furRust });
    const wrist = arm.joints[2];
    const paw = blob(b, wrist, [s * 0.315, 0.87, 0.1], [0.052, 0.046, 0.054], furDark, 16);
    b.decal(paw, PAD_TEX, { at: [s * 0.315, 0.872, 0.152], dir: [0, 0, 1], size: [0.04, 0.04] });
    for (const k of [-1, 0, 1]) {
      blob(b, wrist, [s * 0.315 + k * 0.024, 0.86, 0.142], [0.016, 0.013, 0.018], furDark, 8);
      b.spike([s * 0.315 + k * 0.02, 0.868, 0.15], [0, -0.2, 0.98], 0.015, 0.0042, {
        color: CLAW,
        bone: wrist,
      });
    }
  }

  // Tail: a long bushy ring-tail, cream at the tip, swept up for counterweight.
  const tailSweep = b.sweep(tail, (t) => 0.08 - 0.03 * t, { color: tailFur });
  b.cards(b.surface(tailSweep).scatter(60, { rng: rng(31), minDist: 0.03 }), FUR_RUST, {
    size: [0.04, 0.055],
    lean: 55,
    bend: 25,
    vary: 0.3,
    rng: rng(32),
  });

  // Jade collar with a gilt bell and a leaf tag.
  const collar: Vec[] = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    return [0.106 * Math.sin(a), 0.79, 0.07 + 0.106 * Math.cos(a)];
  });
  b.sweep(catmull(collar, { closed: true }), 0.013, { bone: spine.joints[3], color: jade });
  const bell = blob(b, spine.joints[3], [0, 0.765, 0.196], [0.024, 0.026, 0.024], GILT, 12);
  glow(bell, 0.6);
  b.part(new THREE.PlaneGeometry(0.05, 0.07), "#ffffff", {
    bone: spine.joints[3],
    at: [0, 0.735, 0.2],
    dir: [0, 0, 1],
    axis: "z",
    texture: LEAF,
  });

  return b.root;
}
