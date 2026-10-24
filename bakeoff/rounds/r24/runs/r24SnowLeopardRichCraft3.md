```ts
import * as THREE from "three";
import { createBuilder, rng, svg, paint, noise, spots, patches, catmull, polyline } from "agentic-3js-builder";
import { cel, furEdge, animeEye, INK } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Snow Leopard on a Cryo Ledge",
  description:
    "A cel-shaded snow leopard crouched on a snowy rocky ledge with its thick ringed tail curled around its flank. Anime eyes, rosette coat, fluffy ruffs, glowing cryo crystals and a faint frost rune on the stone.",
};

type Builder = ReturnType<typeof createBuilder>;
type J = ReturnType<Builder["joint"]>;

// ---------------------------------------------------------------------------------------------------------------
// Constants and small helpers

const LT = 0.3; // top of the ledge
const Y0 = LT; // the cat's floor
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const HEAD = V(0, Y0 + 0.22, 0.66);
const hp = (x: number, y: number, z: number) => V(HEAD.x + x, HEAD.y + y, HEAD.z + z);

const keys = (arr: number[]) => (t: number) => {
  const x = Math.min(Math.max(t, 0), 1) * (arr.length - 1);
  const i = Math.min(Math.floor(x), arr.length - 2);
  return arr[i] + (arr[i + 1] - arr[i]) * (x - i);
};

// Palette: cool snowy greys with warm cream, ink-blue shadows
const FUR = "#dfe2ec";
const FUR_S = "#9ba7c9";
const SPOT = "#3a4058";
const SPOT_S = "#232842";
const BELLY = "#fbf6ec";
const BELLY_S = "#c6c2d9";
const TUFT_COL = "#cfd4e4";
const CLAW = "#f1ece2";
const ICE = "#cdeeff";
const CRYSTAL_A = "#8fe9ff";
const CRYSTAL_B = "#d3fbff";

// ---------------------------------------------------------------------------------------------------------------
// Paints

const pat = (
  fur: string,
  spot: string,
  belly: string,
  size: number,
  amount: number,
  rosette: boolean,
  seed: number,
  level: number,
) => furEdge(spots(fur, spot, { size, amount, rosette, seed }), belly, { level, teeth: 0.2, period: 0.032 });

const BODY_LIT = pat(FUR, SPOT, BELLY, 0.075, 0.55, true, 3, -0.25);
const BODY_SHD = pat(FUR_S, SPOT_S, BELLY_S, 0.075, 0.55, true, 3, -0.25);
const BODY = cel(BODY_LIT, BODY_SHD);
const HEADCOAT = cel(
  pat("#e8eaf2", SPOT, BELLY, 0.042, 0.38, false, 5, -0.8),
  pat("#a7b2d0", SPOT_S, BELLY_S, 0.042, 0.38, false, 5, -0.8),
);

const ringed = (base: ReturnType<typeof pat>, dark: string) =>
  paint((_p, _n, s) => {
    const t = s[0];
    if (t > 0.93) return dark;
    if (t > 0.3 && ((t - 0.3) * 8) % 1 < 0.36) return dark;
    return base;
  });
const TAIL = cel(ringed(BODY_LIT, SPOT), ringed(BODY_SHD, SPOT_S));

const PAW = cel("#efebe6", "#b9b6cc");
const MUZZLE = cel("#f6f1e9", "#c9c4d8");
const JAW = cel("#f3eee6", "#c3bed2");
const NOSE = cel("#d98a9a", "#a8657b");
const EAR_DARK = cel("#2e3348", "#1b1f33");
const EAR_IN = cel("#f0e6df", "#c4b8c8");
const CHEEK = cel("#f1eee9", "#bfc0d6");

function rockPaint(lit: boolean) {
  const stone = patches(
    lit ? "#59607a" : "#3d4360",
    lit ? ["#8890a8", "#9aa3ba", "#7c849c"] : ["#5e6580", "#6a728e", "#545b75"],
    { size: 0.24, gap: 0.07, seed: 2 },
  );
  const snow = lit ? "#f6f9ff" : "#b9c6e3";
  return paint((p, n) => {
    const snowy = n.y > 0.6 && noise(p, 0.4, 9) > 0.46 - (n.y - 0.6) * 0.2;
    return snowy ? snow : stone;
  });
}
const ROCK = cel(rockPaint(true), rockPaint(false));

// ---------------------------------------------------------------------------------------------------------------
// Textures

const tuftSvg = (lit: string, shade: string, ink: string) =>
  svg(
    `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 63 C3 52 5 26 16 1 C27 26 29 52 16 63Z" fill="${lit}"/>
      <path d="M16 63 C3 52 5 40 8 34 C12 44 18 48 24 44 C27 52 24 58 16 63Z" fill="${shade}"/>
      <path d="M16 14 L16 42" stroke="${shade}" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M16 63 C3 52 5 26 16 1 C27 26 29 52 16 63Z" fill="none" stroke="${ink}" stroke-width="1.7" stroke-linejoin="round"/>
    </svg>`,
    { size: 128 },
  );
const TUFT_CREAM = tuftSvg("#f8f4ee", "#c9c6da", "#59607a");
const TUFT_GREY = tuftSvg("#dde1ec", "#a7b0cb", "#4a5068");

const MOUTH_INK = "#4a3447";
const MOUTH = svg(
  `<svg viewBox="0 0 100 70" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" stroke="${MOUTH_INK}" stroke-width="3" stroke-linecap="round">
      <path d="M50 4 L50 24"/>
      <path d="M50 24 Q36 40 14 30"/>
      <path d="M50 24 Q64 40 86 30"/>
    </g>
    <g fill="${MOUTH_INK}">
      <circle cx="30" cy="12" r="2.3"/><circle cx="23" cy="18" r="2.3"/><circle cx="35" cy="19" r="2.3"/>
      <circle cx="70" cy="12" r="2.3"/><circle cx="77" cy="18" r="2.3"/><circle cx="65" cy="19" r="2.3"/>
    </g>
  </svg>`,
  { size: 256 },
);

const EYE = animeEye({ iris: "#7fdde6", irisLight: "#d8fbff", irisDark: "#2f7f9b", blush: false });

function runeSvg() {
  const pt = (r: number, deg: number) =>
    `${(100 + r * Math.sin((deg * Math.PI) / 180)).toFixed(1)} ${(100 - r * Math.cos((deg * Math.PI) / 180)).toFixed(1)}`;
  let s = `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="#c4f6ff" stroke-linecap="round" stroke-linejoin="round">`;
  s += `<circle cx="100" cy="100" r="94" stroke-width="2.6"/><circle cx="100" cy="100" r="86" stroke-width="1.5"/>`;
  s += `<circle cx="100" cy="100" r="62" stroke-width="1.7" stroke-dasharray="3 6"/>`;
  for (let k = 0; k < 24; k++) s += `<path d="M${pt(86, k * 15)} L${pt(94, k * 15)}" stroke-width="1.5"/>`;
  for (let k = 0; k < 6; k++) {
    const a = k * 60;
    s += `<path d="M100 100 L${pt(52, a)}" stroke-width="2.4"/>`;
    s += `<path d="M${pt(30, a)} L${pt(42, a - 26)} M${pt(30, a)} L${pt(42, a + 26)}" stroke-width="2"/>`;
    s += `<path d="M${pt(42, a)} L${pt(52, a - 18)} M${pt(42, a)} L${pt(52, a + 18)}" stroke-width="1.8"/>`;
    s += `<path d="M${pt(70, a + 30)} L${pt(75, a + 33)} L${pt(80, a + 30)} L${pt(75, a + 27)}Z" stroke-width="1.8"/>`;
  }
  return svg(s + `</g></svg>`, { size: 768 });
}
const RUNE = runeSvg();

// ---------------------------------------------------------------------------------------------------------------
// Module

export default function build() {
  const b = createBuilder({ name: "snow_leopard", paintSize: 2048 });
  const sph = (w = 10, h = 8) => new THREE.SphereGeometry(1, w, h);

  // ---- skeleton -------------------------------------------------------------------------------------------
  const SP: number[][] = [
    [0, Y0 + 0.21, -0.36],
    [0, Y0 + 0.18, -0.16],
    [0, Y0 + 0.16, 0.06],
    [0, Y0 + 0.17, 0.26],
    [0, Y0 + 0.19, 0.4],
  ];
  const hips = b.joint("hips", { at: SP[0] });
  const spine = b.chain("spine", catmull(SP), { parent: hips, role: "spine" });
  const spineEnd = spine.joints[spine.joints.length - 1];
  const neck = b.chain("neck", catmull([SP[4], [0, Y0 + 0.22, 0.53], [HEAD.x, HEAD.y, HEAD.z]]), {
    parent: spineEnd,
    role: "neck",
  });
  const head = b.joint("head", {
    parent: neck.joints[neck.joints.length - 1],
    at: HEAD,
    dir: [0, -0.08, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", { parent: head, at: hp(0, -0.06, 0.05), aim: hp(0, -0.085, 0.2), role: "jaw" });

  const TT: number[][] = [
    SP[0],
    [0, Y0 + 0.15, -0.58],
    [0.03, Y0 + 0.075, -0.8],
    [0.22, Y0 + 0.068, -0.93],
    [0.42, Y0 + 0.068, -0.8],
    [0.5, Y0 + 0.068, -0.55],
    [0.46, Y0 + 0.072, -0.3],
    [0.4, Y0 + 0.09, -0.08],
    [0.4, Y0 + 0.15, 0.08],
  ];
  const tail = b.chain("tail", catmull(TT), { parent: hips, role: "tail" });

  // ---- body -----------------------------------------------------------------------------------------------
  const rx = keys([0.12, 0.14, 0.145, 0.15, 0.12]);
  const ry = keys([0.12, 0.14, 0.145, 0.155, 0.125]);
  const bodySweep = b.sweep(spine, (t) => [rx(t), ry(t)], { color: BODY });
  b.sweep(neck, (t) => [0.115 - 0.01 * t, 0.108 - 0.005 * t], { color: BODY });
  const tailSweep = b.sweep(tail, [0.062, 0.067, 0.06, 0.056], { color: TAIL });

  // fur crest along the back and the tail
  b.along(
    bodySweep,
    8,
    (at) => {
      const d = at.n.clone().addScaledVector(V(0, 0, -1), 0.9).normalize();
      b.spike(at, d, 0.07, 0.022, { color: TUFT_COL, sides: 5 });
    },
    { from: 0.1, to: 0.95 },
  );
  b.along(
    tailSweep,
    11,
    (at) => {
      const d = at.n.clone().addScaledVector(at.tangent, 1.4).normalize();
      b.spike(at, d, 0.08, 0.03, { color: TUFT_COL, sides: 5 });
    },
    { from: 0.08, to: 0.9 },
  );

  // ---- paws -----------------------------------------------------------------------------------------------
  function paw(center: THREE.Vector3, bone: J, big = 1) {
    b.part(sph(10, 8), PAW, { bone, at: center, scale: [0.05 * big, 0.032 * big, 0.062 * big] });
    for (let i = 0; i < 4; i++) {
      const x = (i - 1.5) * 0.026 * big;
      const z = 0.047 * big - Math.abs(i - 1.5) * 0.009;
      const tp = center.clone().add(V(x, -0.004, z));
      b.part(sph(7, 5), PAW, { bone, at: tp, scale: [0.016 * big, 0.014 * big, 0.019 * big] });
      b.part(new THREE.ConeGeometry(0.007, 0.022, 5), CLAW, {
        bone,
        at: tp.clone().add(V(x * 0.15, -0.004, 0.022)),
        dir: [0, -0.35, 1],
      });
    }
  }

  // ---- legs -----------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // front leg: elbow tucked back, forearm flat, paw forward
    const S = V(s * 0.15, Y0 + 0.21, 0.33);
    const E = V(s * 0.2, Y0 + 0.12, 0.22);
    const W = V(s * 0.18, Y0 + 0.045, 0.5);
    const P = V(s * 0.17, Y0 + 0.042, 0.64);
    const arm = b.chain(`arm${side}`, polyline([S, E, W, P]), {
      parent: spine.nearestJoint(S),
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `paw${side}`],
      role: "arm",
    });
    b.sweep(arm, [0.072, 0.056, 0.043, 0.042], { color: BODY });
    const armTip = arm.joints[arm.joints.length - 1];
    paw(V(s * 0.17, Y0 + 0.035, 0.675), armTip);
    // shoulder blade
    b.part(sph(10, 8), BODY, {
      bone: arm.joints[0],
      at: V(s * 0.115, Y0 + 0.295, 0.3),
      scale: [0.075, 0.09, 0.125],
    });
    // elbow nub
    b.part(sph(8, 6), BODY, { bone: arm.joints[1], at: E.clone().add(V(s * 0.01, 0, -0.02)), scale: [0.05, 0.05, 0.055] });

    // hind leg: thigh forward, shin back, long foot flat on the ledge
    const H = V(s * 0.16, Y0 + 0.22, -0.3);
    const K = V(s * 0.21, Y0 + 0.1, -0.1);
    const C = V(s * 0.18, Y0 + 0.05, -0.43);
    const leg = b.chain(`legH${side}`, polyline([H, K, C]), {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `hock${side}`],
      role: "leg",
    });
    b.sweep(leg, [0.088, 0.06, 0.046], { color: BODY });
    const legTip = leg.joints[leg.joints.length - 1];
    const T = V(s * 0.17, Y0 + 0.042, -0.17);
    const foot = b.chain(`foot${side}`, polyline([C, T]), {
      parent: legTip,
      names: [`ankle${side}`, `toe${side}`],
      role: "leg",
    });
    b.sweep(foot, [0.042, 0.04], { color: BODY });
    paw(V(s * 0.17, Y0 + 0.035, -0.135), foot.joints[foot.joints.length - 1], 1.1);
    // haunch muscle
    b.part(sph(10, 8), BODY, {
      bone: leg.joints[0],
      at: V(s * 0.17, Y0 + 0.2, -0.26),
      scale: [0.1, 0.12, 0.145],
    });
  }

  // ---- head -----------------------------------------------------------------------------------------------
  const SKC = hp(0, 0, 0.06);
  const skull = b.part(sph(14, 10), HEADCOAT, { bone: head, at: SKC, scale: [0.125, 0.105, 0.115] });
  b.part(sph(10, 8), HEADCOAT, { bone: head, at: hp(0, 0, 0.14), scale: [0.06, 0.05, 0.07] }); // nose bridge
  const muzzle = b.part(sph(12, 8), MUZZLE, { bone: head, at: hp(0, -0.035, 0.17), scale: [0.062, 0.048, 0.075] });
  b.part(sph(8, 6), NOSE, { bone: head, at: hp(0, -0.012, 0.243), scale: [0.026, 0.019, 0.017] });
  b.part(sph(10, 8), JAW, { bone: jaw, at: hp(0, -0.085, 0.135), scale: [0.048, 0.026, 0.07] });
  b.decal(muzzle, MOUTH, { at: hp(0, -0.045, 0.236), dir: [0, 0, 1], size: [0.1, 0.07] });

  // eyes
  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skin.around(SKC).at(s * 50, 6);
    if (hit) b.decal(skull, EYE, { at: hit.at, dir: [s * 0.45, 0, 1], size: [0.052, 0.071], mirror: s > 0 });
  }

  const cheeks: ReturnType<typeof b.part>[] = [];
  for (const s of [1, -1]) {
    // cheeks
    cheeks.push(
      b.part(sph(9, 7), CHEEK, { bone: head, at: hp(s * 0.088, -0.065, 0.06), scale: [0.05, 0.04, 0.055] }),
    );
    // ears
    const earPos = hp(s * 0.085, 0.1, 0.01);
    const edir: [number, number, number] = [s * 0.35, 1, -0.15];
    b.part(sph(8, 6), EAR_DARK, { bone: head, at: earPos, dir: edir, scale: [0.05, 0.058, 0.022] });
    b.part(sph(8, 6), EAR_IN, {
      bone: head,
      at: earPos.clone().add(V(0, -0.004, 0.014)),
      dir: edir,
      scale: [0.033, 0.04, 0.012],
    });
    b.spike(earPos.clone().add(V(s * 0.02, 0.048, 0)), [s * 0.3, 1, 0], 0.035, 0.012, {
      color: "#2e3348",
      bone: head,
      sides: 5,
    });
    // whiskers
    for (let k = 0; k < 3; k++) {
      const a = hp(s * 0.05, -0.04 + (k - 1) * 0.012, 0.2);
      const e = a.clone().add(V(s * 0.14, -0.03 + (k - 1) * 0.025, 0.02 - 0.03 * k));
      b.rod(a, e, 0.0025, "#f4f6ff", { bone: head, sides: 4 });
    }
    // brow whiskers
    b.rod(hp(s * 0.07, 0.05, 0.16), hp(s * 0.1, 0.075, 0.12), 0.0022, "#f4f6ff", { bone: head, sides: 4 });
  }

  // ---- fur ruffs (cards) ----------------------------------------------------------------------------------
  const neckRing = b.ring(neck.at(0.35), { count: 12, radius: 0.11 }).items;
  b.cards(neckRing, [TUFT_CREAM, TUFT_GREY], {
    size: [0.05, 0.1],
    lean: 65,
    flow: [0, -0.25, -1],
    bend: 20,
    vary: 0.25,
    rng: rng(11),
  });
  const chestRing = b.ring(spine.at(0.97), { count: 14, radius: 0.145 }).items;
  b.cards(chestRing, [TUFT_CREAM, TUFT_CREAM, TUFT_GREY], {
    size: [0.06, 0.12],
    lean: 70,
    flow: [0, -0.3, -1],
    bend: 25,
    vary: 0.25,
    rng: rng(12),
  });
  for (const s of [1, -1]) {
    const cheek = cheeks[s > 0 ? 0 : 1];
    const hits = b.surface(cheek).scatter(8, { rng: rng(20 + s), minDist: 0.025, filter: (h) => h.n.z < 0.5 });
    b.cards(hits, TUFT_CREAM, {
      size: [0.04, 0.07],
      lean: 70,
      flow: [s * 0.7, -0.3, -1],
      bend: 15,
      vary: 0.25,
      rng: rng(30 + s),
    });
  }

  // ---- ledge ----------------------------------------------------------------------------------------------
  const L = { bone: hips };
  function blob(rxx: number, rzz: number, cz: number, n: number, seed: number, lo: number, hi: number) {
    const r = rng(seed);
    const pts: Array<[number, number, "sharp"]> = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const k = lo + (hi - lo) * r();
      pts.push([Math.sin(a) * rxx * k, cz + Math.cos(a) * rzz * k, "sharp"]);
    }
    return pts;
  }
  const outA = blob(1.02, 1.28, -0.05, 13, 4, 0.93, 1.12);
  const outB = blob(0.9, 1.15, -0.05, 12, 9, 0.93, 1.1);
  b.extrude(outA, { at: V(0, 0.065, 0), x: [1, 0, 0], y: [0, 0, 1], thickness: 0.15, color: ROCK, ...L });
  b.extrude(outB, { at: V(0, 0.22, 0), x: [1, 0, 0], y: [0, 0, 1], thickness: 0.16, color: ROCK, ...L });

  // icicles under the lip
  const ir = rng(41);
  outB.forEach((p, i) => {
    if (p[1] > 0.1 && i % 2 === 0)
      b.spike(V(p[0] * 0.97, 0.17, p[1] * 0.97), [0, -1, 0], 0.06 + 0.06 * ir(), 0.014, {
        color: ICE,
        sides: 5,
        ...L,
      });
  });

  // boulders and pebbles
  const rr = rng(77);
  const boulders: number[][] = [
    [-0.62, -0.7, 0.2, 0.16, 0.18],
    [-0.8, -0.1, 0.14, 0.11, 0.15],
    [0.74, 0.1, 0.13, 0.11, 0.13],
    [-0.45, 0.85, 0.11, 0.09, 0.1],
    [-0.3, -1.0, 0.17, 0.14, 0.14],
    [0.6, 0.78, 0.1, 0.08, 0.09],
  ];
  for (const [x, z, sx, sy, sz] of boulders)
    b.part(new THREE.DodecahedronGeometry(1, 0), ROCK, {
      at: V(x, LT + sy * 0.45, z),
      scale: [sx, sy, sz],
      rotation: [rr() * 40, rr() * 360, rr() * 40],
      flat: true,
      ...L,
    });
  for (let i = 0; i < 7; i++) {
    const a = rr() * Math.PI * 2;
    const x = Math.sin(a) * (0.55 + 0.2 * rr());
    const z = -0.05 + Math.cos(a) * (0.75 + 0.2 * rr());
    if (Math.abs(x) < 0.3 && z > -0.5 && z < 0.9) continue;
    const q = 0.025 + 0.03 * rr();
    b.part(new THREE.DodecahedronGeometry(1, 0), ROCK, {
      at: V(x, LT + q * 0.3, z),
      scale: [q, q * 0.7, q * 0.9],
      rotation: [rr() * 90, rr() * 360, 0],
      flat: true,
      ...L,
    });
  }

  // cryo crystals
  function crystal(x: number, z: number, h: number, r: number, tx: number, tz: number, col: string) {
    glow(
      b.part(new THREE.OctahedronGeometry(1, 0), col, {
        at: V(x, LT + h * 0.45, z),
        scale: [r, h, r],
        rotation: [tx, 0, tz],
        flat: true,
        ...L,
      }),
      1.3,
    );
  }
  crystal(-0.55, -0.78, 0.2, 0.05, 8, 12, CRYSTAL_A);
  crystal(-0.62, -0.7, 0.13, 0.035, -14, -18, CRYSTAL_B);
  crystal(-0.48, -0.88, 0.1, 0.03, 18, 6, CRYSTAL_B);
  crystal(0.62, 0.62, 0.15, 0.04, -10, 14, CRYSTAL_A);
  crystal(0.7, 0.55, 0.09, 0.028, 12, -16, CRYSTAL_B);
  crystal(-0.7, 0.42, 0.12, 0.034, 6, -10, CRYSTAL_A);
  crystal(-0.76, 0.5, 0.07, 0.024, -12, 12, CRYSTAL_B);

  // frost rune etched on the stone
  glow(
    b.part(new THREE.PlaneGeometry(1.3, 1.3), "#ffffff", {
      at: V(0, LT + 0.002, -0.1),
      dir: [0, 1, 0],
      axis: "z",
      texture: RUNE,
      ...L,
    }),
    0.8,
  );

  return b.root;
}
```