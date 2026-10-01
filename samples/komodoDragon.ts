import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { rng, toDirection } from "../src/math";
import { bezier, catmull } from "../src/path";
import { limb } from "../src/ik";
import { svg } from "../src/texture";

export const meta = {
  name: "Komodo Dragon",
  description:
    "A 2.8 m Komodo dragon in a flat low-poly style: heavy faceted body with loose neck folds, beaded scale decals, a flat head with a separate hinged jaw and forked tongue, splayed clawed feet and a long tail resting on the ground.",
};

// ---------------------------------------------------------------- palette: dusty scrubland, warm greys and browns
const FLANK = "#5d5043";
const BACK = "#463b31";
const BELLY = "#a9956d";
const THROAT = "#c4ae7f";
const FOLD = "#6f5f4c";
const LEG = "#54483b";
const LEG_DUST = "#8b7b61";
const CLAW = "#2c2722";
const TOOTH = "#ece4cc";
const GUM = "#8f3d3d";
const TONGUE = "#e3aa3a";
const EYE = "#7a3f17";
const BROW = "#4a3e33";
const DARK = "#1d1915";
const SKULL = "#5a4d40";

// ---------------------------------------------------------------- SVG drawings (flat fills only)
/** Staggered rows of rounded beads in a few tans, a few left out; the tile the whole hide is decalled with. */
function beadTile(seed: number, cols: number, rows: number, colors: string[], specks: string) {
  const r = rng(seed);
  const s = 10;
  let out = "";
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++) {
      if (r() < 0.07) continue;
      const cx = (i + 0.5 + (j % 2) * 0.5 + (r() - 0.5) * 0.18) * s;
      const cy = (j + 0.5) * s;
      const c = colors[Math.floor(r() * colors.length)];
      out += `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${(4.5 + r() * 0.5).toFixed(1)}" ry="${(4.3 + r() * 0.6).toFixed(1)}" fill="${c}"/>`;
      if (r() < 0.22)
        out += `<ellipse cx="${(cx - 0.8).toFixed(1)}" cy="${(cy - 0.9).toFixed(1)}" rx="1.9" ry="1.5" fill="${specks}"/>`;
    }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${cols * s} ${rows * s}">${out}</svg>`;
}

/** Ragged dark saddle across the tile, with pale holes: the dark transverse banding of the dorsal hide. */
function saddleTile(seed: number) {
  const r = rng(seed);
  const W = 200;
  const H = 100;
  const top: string[] = [];
  const bottom: string[] = [];
  for (let x = 0; x <= W; x += 10) {
    top.push(`${x},${(22 + r() * 16).toFixed(1)}`);
    bottom.push(`${W - x},${(62 + r() * 18).toFixed(1)}`);
  }
  let out = `<polygon points="${top.join(" ")} ${bottom.join(" ")}" fill="#2b241e"/>`;
  for (let k = 0; k < 9; k++) {
    const cx = 10 + r() * 180;
    const cy = 35 + r() * 40;
    out += `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${(3 + r() * 4).toFixed(1)}" ry="${(2 + r() * 3).toFixed(1)}" fill="#8a7a5c"/>`;
  }
  for (let k = 0; k < 10; k++) {
    const cx = r() * W;
    const cy = r() < 0.5 ? 6 + r() * 14 : 82 + r() * 14;
    out += `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${(2 + r() * 3).toFixed(1)}" ry="${(1.5 + r() * 2.5).toFixed(1)}" fill="#2b241e"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">${out}</svg>`;
}

const SCARS = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
<path d="M18 14 L46 88" stroke="#cdbb94" stroke-width="3.4" stroke-linecap="round" fill="none"/>
<path d="M32 10 L62 84" stroke="#bfae88" stroke-width="3" stroke-linecap="round" fill="none"/>
<path d="M46 8 L78 78" stroke="#cdbb94" stroke-width="3.2" stroke-linecap="round" fill="none"/>
<path d="M70 40 L90 52" stroke="#a79775" stroke-width="3" stroke-linecap="round" fill="none"/>
</svg>`;

const EYE_ART = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
<circle cx="50" cy="50" r="50" fill="#33231a"/>
<circle cx="50" cy="50" r="41" fill="#b5702a"/>
<circle cx="50" cy="50" r="30" fill="#d9943a"/>
<ellipse cx="50" cy="50" rx="15" ry="19" fill="#120d0a"/>
<circle cx="38" cy="36" r="6" fill="#fff3d2"/>
</svg>`;

/** A recurved, pointed scale: the shingle card that roughens the silhouette of the hide. */
const SCALE_CARD = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 60">
<path d="M4 4 L36 4 L32 36 L20 58 L8 36 Z" fill="#ffffff"/>
<path d="M12 6 L28 6 L26 30 L20 46 L14 30 Z" fill="#d6d6d6"/>
</svg>`;

export default function build() {
  const b = createBuilder({ name: "komodoDragon" });
  const R = rng(11);

  const beads = svg(
    beadTile(3, 26, 13, ["#8b7a5d", "#9a8966", "#77684f", "#6a5c47", "#a39370", "#857557"], "#b9ab83"),
    {
      size: 780,
    },
  );
  const beadsDark = svg(beadTile(8, 26, 13, ["#6f604b", "#7a6a52", "#5f5140", "#857459"], "#9a8b69"), { size: 780 });
  const saddles = svg(saddleTile(5), { size: 600 });
  const scars = svg(SCARS, { size: 256 });
  const eyeArt = svg(EYE_ART, { size: 128 });
  const scaleCard = svg(SCALE_CARD, { size: 128 });

  // ---------------------------------------------------------------- skeleton
  // One curve from the tail tip to the neck's end; keys are [z, x, y, halfWidth, halfHeight].
  type Key = [number, number, number, number, number];
  const keys: Key[] = [
    [-1.72, 0.26, 0.009, 0.009, 0.009],
    [-1.5, 0.22, 0.021, 0.021, 0.021],
    [-1.28, 0.15, 0.036, 0.035, 0.036],
    [-1.06, 0.08, 0.058, 0.058, 0.058],
    [-0.84, 0.025, 0.09, 0.085, 0.09],
    [-0.62, 0.0, 0.15, 0.115, 0.115],
    [-0.3, 0.0, 0.235, 0.168, 0.14],
    [-0.05, 0.0, 0.235, 0.18, 0.145],
    [0.2, 0.0, 0.24, 0.174, 0.145],
    [0.4, 0.0, 0.255, 0.15, 0.13],
    [0.52, 0.0, 0.285, 0.102, 0.092],
    [0.63, 0.0, 0.325, 0.084, 0.078],
    [0.71, 0.0, 0.35, 0.072, 0.068],
  ];
  const body = catmull(keys.map(([z, x, y]) => [x, y, z]));
  const keyT = keys.map(([z, x, y]) => body.closestT([x, y, z]));
  const HIPS = 6;
  const NECK = 9;
  const radius = (t: number): [number, number] => {
    let i = 0;
    while (i < keys.length - 2 && t > keyT[i + 1]) i++;
    const u = Math.min(1, Math.max(0, (t - keyT[i]) / (keyT[i + 1] - keyT[i])));
    const e = u * u * (3 - 2 * u);
    const a = keys[i];
    const c = keys[i + 1];
    return [a[3] + (c[3] - a[3]) * e, a[4] + (c[4] - a[4]) * e];
  };

  const hips = b.joint("hips", { at: [0, 0.235, -0.3], dir: [0, 0, 1], role: "spine" });
  const spine = b.chain("spine", body.slice(keyT[HIPS], keyT[NECK]), { parent: hips, count: 3, role: "spine" });
  const neck = b.chain("neck", body.slice(keyT[NECK], 1), { parent: spine.joints[2], count: 3, role: "neck" });
  const tail = b.chain("tail", body.slice(keyT[HIPS], 0), { parent: hips, count: 9, role: "tail" });

  const headAt: [number, number, number] = [0, 0.352, 0.69];
  const head = b.joint("head", { parent: neck.joints[2], at: headAt, dir: [0, -0.16, 1], role: "head" });
  // Head-local helper: x is the world-left side (s = 1), y forward, z up.
  const hl = (s: number, x: number, y: number, z: number) => head.local([-s * x, y, z]);
  const hd = (s: number, x: number, y: number, z: number) => head.dir([-s * x, y, z]);
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local([0, 0.005, -0.004]),
    aim: head.local([0, 0.32, -0.008]),
    role: "jaw",
  });
  b.pose(jaw, { axis: [1, 0, 0], deg: 7 });

  // ---------------------------------------------------------------- body: one continuous skin, tail tip to neck
  const torso = b.sweep(body, radius, {
    bone: [tail, hips, spine, neck],
    color: FLANK,
    sides: 8,
    smooth: false,
    sectors: [
      [-62, 62, BACK],
      [122, 238, BELLY, 0, keyT[NECK]],
      [122, 238, THROAT, keyT[NECK], 1],
    ],
  });
  const skin = b.surface(torso);

  // Loose skin: heavy creased folds ringed round the neck, plus a sagging throat fold.
  for (const t of [0.08, 0.3, 0.52, 0.74, 0.94])
    b.sweep(skin.loop(neck.at(t), { lift: 0.0 }), 0.011 + 0.005 * (1 - t), {
      color: FOLD,
      sides: 5,
      detail: 0.6,
      smooth: false,
    });
  b.sweep(
    skin.drape(
      catmull([
        [0.09, 0.3, 0.52],
        [0.05, 0.23, 0.54],
        [0, 0.218, 0.55],
        [-0.05, 0.23, 0.54],
        [-0.09, 0.3, 0.52],
      ]),
      { lift: 0.0 },
    ),
    0.012,
    { color: FOLD, sides: 5, smooth: false, detail: 0.6 },
  );
  // Fold behind each shoulder.
  for (const s of [1, -1])
    b.sweep(
      skin.drape(
        catmull([
          [s * 0.05, 0.43, 0.22],
          [s * 0.16, 0.36, 0.26],
          [s * 0.2, 0.25, 0.27],
          [s * 0.17, 0.14, 0.27],
        ]),
        { lift: 0.0 },
      ),
      [0.009, 0.006],
      { color: FOLD, sides: 5, smooth: false, detail: 0.6 },
    );

  // Beaded hide: decals of bead tiles, saddles and scars, each at its own lift so layers never fight.
  const dec = (
    tex: THREE.Texture,
    at: number[],
    dir: number[],
    up: number[],
    size: [number, number],
    lift: number,
    opts: { color?: string; mirror?: boolean; segments?: number | [number, number] } = {},
  ) =>
    b.decal(skin, tex, {
      at,
      dir: toDirection(dir).negate(),
      up,
      size,
      lift,
      segments: opts.segments ?? [14, 7],
      ...opts,
    });

  [-0.52, -0.38, -0.24, -0.1, 0.04, 0.18, 0.32, 0.46].forEach((z, i) =>
    dec(i % 2 ? beads : beadsDark, [0, 0.5, z], [0, -1, 0], [0.0, 0, 1], [0.34, 0.17], 0.0015, { mirror: i % 3 === 0 }),
  );
  for (const s of [1, -1]) {
    [-0.44, -0.3, -0.16, -0.02, 0.12, 0.26, 0.4].forEach((z, i) => {
      dec(i % 2 ? beads : beadsDark, [s * 0.26, 0.19, z], [-s, 0, 0], [0, 1, 0], [0.3, 0.15], 0.0015, {
        mirror: (i + s) % 3 === 0,
        segments: [12, 6],
      });
      dec(i % 2 ? beadsDark : beads, [s * 0.26, 0.3, z + 0.07], [-s, 0, 0], [0, 1, 0], [0.3, 0.15], 0.0022, {
        mirror: i % 2 === 0,
        segments: [12, 6],
      });
    });
    // Neck sides
    [0.47, 0.58].forEach((z, i) =>
      dec(i ? beads : beadsDark, [s * 0.15, 0.31, z], [-s, 0, 0], [0, 1, 0], [0.22, 0.11], 0.0015, {
        segments: [10, 5],
      }),
    );
  }
  [0.5, 0.6, 0.68].forEach((z, i) =>
    dec(i % 2 ? beads : beadsDark, [0, 0.45, z], [0, -1, 0], [0, 0, 1], [0.13, 0.065], 0.0015, { segments: [8, 4] }),
  );
  // Dark saddles across the back and over the hips, pale holes in them.
  [-0.42, -0.14, 0.14].forEach((z, i) =>
    dec(saddles, [0, 0.5, z], [0, -1, 0], [0, 0, 1], [0.34, 0.17], 0.0034, { mirror: i % 2 === 1, segments: [14, 7] }),
  );

  // Tail: bead tiles shrinking with the tube, seen from above and from both sides.
  keys.slice(1, 6).forEach(([z, x, y, rx], i) => {
    const w = Math.max(0.05, rx * 2.6);
    const size: [number, number] = [w, w / 2];
    dec(i % 2 ? beads : beadsDark, [x, y + 0.1, z], [0, -1, 0], [0, 0, 1], size, 0.0015, { segments: [8, 4] });
    for (const s of [1, -1])
      dec(i % 2 ? beadsDark : beads, [x + s * 0.12, y, z], [-s, 0, 0], [0, 1, 0], size, 0.0018, { segments: [8, 4] });
  });
  dec(saddles, [0.02, 0.2, -0.88], [0, -1, 0], [0, 0, 1], [0.18, 0.09], 0.0034, { segments: [8, 4] });
  dec(saddles, [0.12, 0.2, -1.15], [0, -1, 0], [0, 0, 1], [0.12, 0.06], 0.0034, { segments: [8, 4] });
  // Old bite scars on the left shoulder and right flank.
  dec(scars, [0.2, 0.3, 0.3], [-1, 0, 0], [0, 1, 0], [0.11, 0.11], 0.0046, { segments: [8, 8] });
  dec(scars, [-0.2, 0.25, -0.18], [1, 0, 0], [0, 1, 0], [0.09, 0.09], 0.0046, { mirror: true, segments: [8, 8] });

  // Shingle scales along the spine and tail root: a jagged, beaded silhouette.
  const crest = skin.scatter(150, {
    rng: rng(21),
    minDist: 0.06,
    filter: (h) => h.n.y > 0.8 && h.at.z < 0.05 && h.at.z > -1.0,
  });
  b.cards(crest, scaleCard, {
    size: [0.03, 0.036],
    lean: 86,
    flow: [0, 0, -1],
    vary: 0.25,
    spin: 14,
    rng: rng(22),
    color: "#7d6e54",
  });

  // ---------------------------------------------------------------- head
  const K = 1.16;
  const upW = (u: number) =>
    K *
    (u < 0.03
      ? 0.052 + 0.008 * ((u + 0.035) / 0.065)
      : u < 0.1
        ? 0.06 - 0.008 * ((u - 0.03) / 0.07)
        : 0.052 - 0.095 * (u - 0.1));
  const upH = (u: number) => K * (u < 0.03 ? 0.038 + 0.004 * ((u + 0.035) / 0.065) : 0.042 - 0.085 * (u - 0.03));
  const U0 = -0.035;
  const U1 = 0.3;
  const at = (t: number) => U0 + (U1 - U0) * t;
  const skull = b.sweep([head.local([0, U0, 0]), head.local([0, U1, 0])], (t) => [upW(at(t)), upH(at(t))], {
    bone: head,
    up: head.dir([0, 0, 1]),
    shift: (t) => [0, upH(at(t)) * 0.9],
    color: SKULL,
    sides: 8,
    smooth: false,
    sectors: [[125, 235, GUM]],
  });
  const chinW = (u: number) => upW(u) * 0.82;
  const chinH = (u: number) => K * (0.022 - 0.045 * Math.max(0, u - 0.02));
  const J0 = 0.0;
  const J1 = 0.285;
  const jt = (t: number) => J0 + (J1 - J0) * t;
  const chin = b.sweep([jaw.local([0, J0, 0]), jaw.local([0, J1, 0])], (t) => [chinW(jt(t)), chinH(jt(t))], {
    bone: jaw,
    up: jaw.dir([0, 0, 1]),
    shift: (t) => [0, -chinH(jt(t)) * 0.92],
    color: SKULL,
    sides: 8,
    smooth: false,
    sectors: [
      [-60, 60, GUM],
      [130, 230, BELLY],
    ],
  });
  // Beaded scales on the skull and down the sides of both jaws, tiles turned so the beads run along the head.
  const headSkin = b.surface(skull);
  const chinSkin = b.surface(chin);
  b.decal(headSkin, beads, {
    at: hl(1, 0, 0.14, 0.08),
    dir: toDirection(hd(1, 0, 0, -1)).negate(),
    up: hd(1, 1, 0, 0),
    size: [0.27, 0.12],
    lift: 0.0015,
    segments: [12, 5],
    color: "#c9bda0",
  });
  b.decal(headSkin, beadsDark, {
    at: hl(1, 0, 0.12, 0.08),
    dir: toDirection(hd(1, 0, 0, -1)).negate(),
    up: hd(1, 1, 0, 0),
    size: [0.16, 0.075],
    lift: 0.0028,
    segments: [8, 4],
    mirror: true,
  });
  for (const s of [1, -1]) {
    b.decal(headSkin, s > 0 ? beads : beadsDark, {
      at: hl(s, 0.07, 0.12, 0.04),
      dir: toDirection(hd(s, -1, 0, 0)).negate(),
      up: hd(s, 0, 0, 1),
      size: [0.24, 0.12],
      lift: 0.0015,
      segments: [10, 5],
      color: "#b7aa8c",
    });
    b.decal(chinSkin, s > 0 ? beadsDark : beads, {
      at: jaw.local([-s * 0.05, 0.13, -0.014]),
      dir: toDirection(hd(s, -1, 0, 0)).negate(),
      up: hd(s, 0, 0, 1),
      size: [0.22, 0.05],
      lift: 0.0015,
      segments: [10, 3],
      color: "#b7aa8c",
    });
  }

  // Teeth: recurved blades, upper ones hang from the lip, lower ones stand inside the jaw.
  const tooth = [
    [-0.005, 0],
    [0.004, 0],
    [-0.0045, -0.019],
  ] as [number, number][];
  for (const s of [1, -1]) {
    for (let i = 0; i < 8; i++) {
      const u = 0.06 + i * 0.027;
      const x = upW(u) * 0.38;
      b.extrude(tooth, {
        at: hl(s, x, u, -0.002),
        x: hd(s, 0, 1, 0),
        y: hd(s, 0, 0, 1),
        thickness: 0.003,
        color: TOOTH,
        bone: head,
      });
    }
    for (let i = 0; i < 7; i++) {
      const u = 0.07 + i * 0.03;
      const x = chinW(u) * 0.36;
      b.extrude(
        tooth.map(([px, py]) => [px, -py] as [number, number]),
        {
          at: jaw.local([-s * x, u, -0.003]),
          x: jaw.dir([0, 1, 0]),
          y: jaw.dir([0, 0, 1]),
          thickness: 0.003,
          color: TOOTH,
          bone: jaw,
        },
      );
    }
  }

  // Forked tongue, lying along the lower jaw and flicking out past the snout.
  b.extrude(
    [
      [0, -0.014],
      [0.1, -0.01],
      [0.2, -0.008],
      [0.24, -0.008],
      [0.3, -0.026],
      [0.31, -0.021],
      [0.27, 0.0],
      [0.31, 0.021],
      [0.3, 0.026],
      [0.24, 0.008],
      [0.2, 0.008],
      [0.1, 0.01],
      [0, 0.014],
    ],
    {
      at: jaw.local([0, 0.11, 0.0015]),
      x: head.dir([0, 1, -0.1]),
      y: jaw.dir([1, 0, 0]),
      thickness: 0.004,
      color: TONGUE,
      bone: jaw,
    },
  );

  for (const s of [1, -1]) {
    // Eye under a heavy brow ridge, nostril, ear opening.
    const eyeAt = hl(s, 0.057, 0.09, 0.05);
    b.part(new THREE.SphereGeometry(0.0155, 6, 5), EYE, { bone: head, at: eyeAt, flat: true });
    const gaze = hd(s, 0.95, 0.3, 0.25);
    b.part(new THREE.CircleGeometry(0.0115, 10), "#ffffff", {
      bone: head,
      at: eyeAt.clone().addScaledVector(new THREE.Vector3(...gaze).normalize(), 0.0146),
      dir: gaze,
      axis: "z",
      up: head.dir([0, 0, 1]),
      texture: eyeArt,
    });
    b.part(new THREE.SphereGeometry(0.021, 6, 4), BROW, {
      bone: head,
      at: hl(s, 0.056, 0.09, 0.069),
      scale: [1.0, 1.6, 0.45],
      dir: hd(s, 0.3, 1, 0.1),
      flat: true,
    });
    b.part(new THREE.SphereGeometry(0.0072, 6, 4), DARK, {
      bone: head,
      at: hl(s, 0.013, 0.292, 0.033),
      scale: [1, 1.4, 0.7],
      flat: true,
    });
    b.part(new THREE.SphereGeometry(0.0085, 6, 4), DARK, {
      bone: head,
      at: hl(s, 0.061, -0.012, 0.05),
      scale: [0.7, 1.1, 1],
      flat: true,
    });
  }

  // ---------------------------------------------------------------- legs
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    for (const front of [true, false]) {
      const root: [number, number, number] = front ? [s * 0.14, 0.22, 0.36] : [s * 0.15, 0.22, -0.29];
      const foot: [number, number, number] = front ? [s * 0.38, 0.04, 0.5] : [s * 0.4, 0.04, -0.36];
      const lens = front ? [0.23, 0.21] : [0.25, 0.23];
      const pts = limb(root, foot, lens, [s, 0, front ? -0.55 : 0.55]);
      const names = front ? [`shoulder${S}`, `elbow${S}`, `wrist${S}`] : [`hip${S}`, `knee${S}`, `ankle${S}`];
      const leg = b.chain(`leg${front ? "F" : "H"}${S}`, pts, {
        parent: front ? spine.joints[2] : hips,
        names,
        role: "leg",
      });
      const tube = b.sweep(leg, front ? [0.08, 0.05, 0.036] : [0.1, 0.06, 0.038], {
        bands: [
          [0.74, LEG],
          [1, LEG_DUST],
        ],
        sides: 6,
        smooth: false,
      });
      const massAt: [number, number, number] = [s * (front ? 0.19 : 0.2), front ? 0.205 : 0.2, front ? 0.35 : -0.28];
      const mass = b.part(new THREE.SphereGeometry(front ? 0.08 : 0.1, 6, 5), FLANK, {
        bone: leg.joints[0],
        at: massAt,
        scale: [0.8, 1.0, 1.15],
        flat: true,
      });
      // Beaded hide on the shoulder / thigh, upper arm and forearm.
      const limbSkin = b.surface([tube, mass]);
      b.decal(limbSkin, beads, {
        at: [massAt[0] + s * 0.06, massAt[1] + 0.02, massAt[2]],
        dir: [s, 0.25, 0],
        up: [0, 1, 0],
        size: [0.15, 0.075],
        lift: 0.0015,
        segments: [10, 5],
        mirror: s > 0,
      });
      b.decal(limbSkin, beadsDark, {
        at: [massAt[0], massAt[1] + 0.07, massAt[2]],
        dir: [0, 1, 0],
        up: [0, 0, 1],
        size: [0.13, 0.065],
        lift: 0.0028,
        segments: [8, 4],
      });
      b.decal(limbSkin, beadsDark, {
        at: pts[0].clone().lerp(pts[1], 0.75),
        dir: [0, 1, 0],
        up: [0, 0, 1],
        size: [0.14, 0.07],
        lift: 0.0015,
        segments: [9, 5],
      });
      b.decal(limbSkin, beads, {
        at: pts[1].clone().lerp(pts[2], 0.4),
        dir: [s, 0, 0],
        up: [0, 1, 0],
        size: [0.12, 0.06],
        lift: 0.0015,
        segments: [8, 4],
        mirror: s > 0,
      });
      // Foot: pad and five toes fanned over the floor, each with a curved claw.
      const tip = leg.tip!;
      const heading = (front ? 12 : 28) * s;
      const big = front ? 1 : 1.15;
      b.part(new THREE.SphereGeometry(0.038 * big, 6, 4), LEG_DUST, {
        bone: tip,
        at: [foot[0], 0.03, foot[2]],
        scale: [1.1, 0.55, 1.3],
        flat: true,
      });
      for (let i = 0; i < 5; i++) {
        const phi = ((heading + (i - 2) * 24) * Math.PI) / 180;
        const d = [s * Math.sin(phi), 0, Math.cos(phi)];
        const len = [0.055, 0.072, 0.082, 0.075, 0.058][i] * big;
        const at = (k: number, y: number): [number, number, number] => [
          foot[0] + d[0] * (0.018 + len * k),
          y,
          foot[2] + d[2] * (0.018 + len * k),
        ];
        const toe = b.chain(`toe${front ? "F" : "H"}${S}${i + 1}`, [at(0, 0.024), at(0.5, 0.0145), at(1, 0.011)], {
          parent: tip,
          names: [`toe${front ? "F" : "H"}${S}${i + 1}a`, `toe${front ? "F" : "H"}${S}${i + 1}b`],
          role: "digit",
        });
        b.sweep(toe, [0.016 * big, 0.011], {
          color: LEG_DUST,
          sides: 5,
          smooth: false,
          caps: { start: "flat", end: "point" },
        });
        const t0 = at(1, 0.011);
        const claw = bezier(
          t0,
          [t0[0] + d[0] * 0.017, 0.013, t0[2] + d[2] * 0.017],
          [t0[0] + d[0] * 0.03, 0.001, t0[2] + d[2] * 0.03],
        );
        b.sweep(claw, [0.0085 * big, 0], {
          bone: toe.joints[1],
          color: CLAW,
          sides: 5,
          smooth: false,
          caps: { start: "flat", end: "point" },
        });
      }
    }
  }

  void R;
  return b.root;
}
