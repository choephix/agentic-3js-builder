```ts
import * as THREE from "three";
import { createBuilder, frame, rng, catmull, mix, noise, cells, smoothstep, paint, svg } from "agentic-3js-builder";

export const meta = {
  name: "Sakura Shinboku",
  description:
    "A gnarled old cherry tree in ukiyo-e woodblock style: lenticel-banded sumi bark, banded flat-pink blossom clouds with keylines, " +
    "drawn five-petal flower cards, hanging blossom strands, bronze young leaves, a straw shimenawa rope with paper shide, and drifting petals.",
};

// ---------------------------------------------------------------------------------------------------------------
// Woodblock palette: a few flat inks
const SUMI = "#231d2b";
const TWIG = "#3b2d34";
const BARK_DARK = "#33262b";
const BARK_MID = "#5a4446";
const BARK_HI = "#8c7d8a";
const LENTICEL = "#c2ae9f";
const MOSS = "#76906a";
const PINK_LIGHT = "#fde8ed";
const PINK = "#f6b4c5";
const PINK_DEEP = "#e482a2";
const PINK_SHADE = "#c9709a";
const LINE = "#9f4270";
const STRAW = "#e6d296";
const STRAW_DARK = "#b99b52";

// ---------------------------------------------------------------------------------------------------------------
// Drawings
const PETAL_D = "M0 0 C-5.5 -3 -7.5 -10 -3.2 -13.2 L0 -11 L3.2 -13.2 C7.5 -10 5.5 -3 0 0Z";
const DEFS = `<defs><linearGradient id="pg" x1="0" y1="1" x2="0" y2="0">
  <stop offset="0" stop-color="#e2799b"/><stop offset="0.45" stop-color="#f8b6c7"/><stop offset="1" stop-color="#fff3f6"/>
</linearGradient></defs>`;

/** One five-petal notched blossom, outlined in a rose ink line of constant width. */
function flower(x: number, y: number, s: number, rot: number) {
  const sw = (1.1 / s).toFixed(2);
  let g = `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">`;
  for (let i = 0; i < 5; i++)
    g += `<path transform="rotate(${i * 72})" d="${PETAL_D}" fill="url(#pg)" stroke="#a8436c" stroke-width="${sw}" stroke-linejoin="round"/>`;
  for (let i = 0; i < 5; i++) {
    const a = ((i * 72 + 36) * Math.PI) / 180;
    const ex = (Math.sin(a) * 5.4).toFixed(2);
    const ey = (-Math.cos(a) * 5.4).toFixed(2);
    g += `<path d="M0 0 L${ex} ${ey}" stroke="#b02e57" stroke-width="${(0.7 / s).toFixed(2)}"/>`;
    g += `<circle cx="${ex}" cy="${ey}" r="${(0.9 / Math.max(s, 0.6)).toFixed(2)}" fill="#c8323c"/>`;
  }
  return g + `<circle r="1.7" fill="#d9506b"/></g>`;
}

function bud(x: number, y: number, rot: number) {
  return `<ellipse cx="${x}" cy="${y}" rx="3" ry="4.6" transform="rotate(${rot} ${x} ${y})" fill="#e2799b" stroke="#a8436c" stroke-width="1.1"/>
  <path d="M${x} ${y - 3.5} L${x} ${y + 3}" stroke="#a8436c" stroke-width="0.7" transform="rotate(${rot} ${x} ${y})"/>`;
}

const clusterTexture = () =>
  svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">${DEFS}
    <path d="M32 62 L30 46 M30 46 L18 24 M30 46 L46 20 M30 46 L52 48" stroke="#4a3338" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    ${bud(6, 38, -30)}${bud(58, 30, 40)}${bud(12, 8, 20)}
    ${flower(18, 22, 0.95, 10)}${flower(46, 18, 0.82, 40)}${flower(30, 43, 1.0, 25)}${flower(52, 47, 0.7, 0)}
  </svg>`,
    { size: 256 },
  );

const petalTexture = () =>
  svg(
    `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">${DEFS}
    <g transform="translate(16 29) scale(2)"><path d="${PETAL_D}" fill="url(#pg)" stroke="#a8436c" stroke-width="0.6" stroke-linejoin="round"/></g>
  </svg>`,
    { size: 128 },
  );

// Root edge of every hanging drawing is its bottom, which hangs from the top in the world.
const strandTexture = () =>
  svg(
    `<svg viewBox="0 0 24 96" xmlns="http://www.w3.org/2000/svg">${DEFS}
    <path d="M12 96 C9 80 15 66 11 50 C8 36 15 22 12 6" stroke="#4a3338" stroke-width="1.2" fill="none" stroke-linecap="round"/>
    ${bud(12, 6, 0)}
    ${flower(12, 88, 0.42, 0)}${flower(8, 74, 0.5, 30)}${flower(16, 62, 0.45, 10)}
    ${flower(10, 48, 0.5, 50)}${flower(15, 34, 0.42, 20)}${flower(11, 20, 0.46, 5)}
  </svg>`,
    { size: 384 },
  );

const leafTexture = () =>
  svg(
    `<svg viewBox="0 0 24 40" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="lg" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#8f6a3a"/><stop offset="0.5" stop-color="#a2563f"/><stop offset="1" stop-color="#c06a48"/></linearGradient></defs>
    <path d="M12 40 C2 28 3 10 12 0 C21 10 22 28 12 40Z" fill="url(#lg)" stroke="#4a2a24" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M12 38 L12 6 M12 26 L6 18 M12 26 L18 18 M12 16 L8 10 M12 16 L16 10" stroke="#4a2a24" stroke-width="1" fill="none"/>
  </svg>`,
    { size: 160 },
  );

// Folded-paper streamer: attached at the bottom of the drawing.
const shideTexture = () =>
  svg(
    `<svg viewBox="0 0 32 96" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 96 L16 80 L24 68 L8 56 L24 44 L8 32 L22 20 L10 6" stroke="#8a7a88" stroke-width="13.5" fill="none" stroke-linejoin="miter" stroke-miterlimit="6"/>
    <path d="M16 96 L16 80 L24 68 L8 56 L24 44 L8 32 L22 20 L10 6" stroke="#fbf6e6" stroke-width="10" fill="none" stroke-linejoin="miter" stroke-miterlimit="6"/>
    <path d="M16 94 L16 82 L22 72 M8 54 L22 44 M8 30 L20 21" stroke="#e5dcc4" stroke-width="2.2" fill="none"/>
  </svg>`,
    { size: 192 },
  );

const knotTexture = () =>
  svg(
    `<svg viewBox="0 0 50 70" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="25" cy="35" rx="22" ry="32" fill="#5b4647" stroke="#1b141a" stroke-width="3"/>
    <ellipse cx="25" cy="36" rx="15" ry="23" fill="#2a1e24" stroke="#1b141a" stroke-width="2"/>
    <ellipse cx="25" cy="38" rx="9" ry="15" fill="#120d12"/>
    <path d="M12 22 Q14 12 25 8" stroke="#a89aa2" stroke-width="2" fill="none" stroke-linecap="round"/>
  </svg>`,
    { size: 192 },
  );

// ---------------------------------------------------------------------------------------------------------------
// Paints
const BLOSSOM = paint((p, n) => {
  const c = cells(p, 0.24, 4);
  const lift = smoothstep(-0.4, 0.9, n.y);
  const v = lift * 0.7 + (c.id - 0.5) * 0.45 + (noise(p, 0.6, 3) - 0.5) * 0.4;
  const col = v > 0.62 ? PINK_LIGHT : v > 0.32 ? PINK : v > 0.05 ? PINK_DEEP : PINK_SHADE;
  if (c.d2 - c.d1 < 0.07 && v < 0.62) return mix(col, LINE, 0.55);
  return col;
});

const q = new THREE.Vector3();
const BARK = paint((p, n) => {
  let c = mix(BARK_DARK, BARK_MID, smoothstep(0.1, 0.9, noise(p, 0.35, 2)));
  c = mix(c, BARK_HI, 0.55 * smoothstep(0.3, 0.95, n.y) * smoothstep(0.4, 0.7, noise(p, 0.15, 5)));
  // horizontal lenticels: the signature of cherry bark
  q.set(p.x * 0.35, p.y * 3.6, p.z * 0.35);
  if (noise(q, 0.09, 8) > 0.67) c = mix(c, LENTICEL, 0.8);
  // vertical sumi cracks
  q.set(p.x * 3, p.y * 0.4, p.z * 3);
  if (noise(q, 0.1, 12) > 0.7) c = mix(c, SUMI, 0.7);
  if (p.y < 1.5 && n.y > 0.35 && noise(p, 0.18, 7) > 0.56) c = mix(c, MOSS, 0.85);
  if (n.y < -0.4) c = mix(c, SUMI, 0.45);
  return c;
});

const ROPE = paint((p, _n, s) => {
  const twist = (((s[1] - 360 * 22 * s[0]) % 120) + 120) % 120 < 50;
  const fleck = noise(p, 0.03, 3) > 0.7;
  return twist || fleck ? STRAW_DARK : STRAW;
});

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "cherry_blossom_tree", paintSize: 2048 });
  const R = rng(2024);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  const CLUSTER = clusterTexture();
  const PETAL = petalTexture();
  const STRAND = strandTexture();
  const LEAF = leafTexture();
  const SHIDE = shideTexture();
  const KNOT = knotTexture();

  // ---- trunk ---------------------------------------------------------------------------------------------------
  const trunkPath = catmull([
    [0, -0.02, 0],
    [-0.08, 0.7, 0.04],
    [0.1, 1.5, 0],
    [0, 2.2, -0.06],
    [0.12, 2.8, 0.02],
  ]);
  const trunk = b.sweep(trunkPath, [0.6, 0.45, 0.36, 0.28, 0.2], {
    color: BARK,
    sides: 8,
    smooth: false,
    caps: { start: "flat", end: "round" },
  });

  // surface roots
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + R() * 0.4;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const len = 1.0 + R() * 0.5;
    b.sweep(
      catmull([
        [c * 0.25, 0.75, s * 0.25],
        [c * 0.62, 0.32, s * 0.62],
        [c * len * 0.8, 0.12, s * len * 0.8],
        [c * len, 0.05, s * len],
      ]),
      [0.2, 0.055],
      { color: BARK, sides: 6, smooth: false, caps: { start: "flat", end: "round" } },
    );
  }

  // ---- branches ------------------------------------------------------------------------------------------------
  const tips: THREE.Vector3[] = [];

  function grow(pts: THREE.Vector3[], r0: number, r1: number, depth: number) {
    const path = catmull(pts);
    b.sweep(path, [r0, r1], {
      color: depth >= 1 ? BARK : TWIG,
      sides: depth >= 1 ? 6 : 5,
      smooth: false,
      caps: { start: "flat", end: "round" },
    });
    tips.push(pts[pts.length - 1].clone());
    if (depth === 0) return;
    const len = path.length;
    const nKids = depth === 2 ? 5 : 3;
    for (let k = 0; k < nKids; k++) {
      const t = 0.3 + (0.62 * (k + R() * 0.6)) / nKids;
      const base = path.at(t).clone();
      const T = path.tangentAt(t).clone().normalize();
      const ref = Math.abs(T.y) > 0.9 ? V(1, 0, 0) : V(0, 1, 0);
      const u = new THREE.Vector3().crossVectors(T, ref).normalize();
      const v = new THREE.Vector3().crossVectors(T, u).normalize();
      const ang = ((35 + R() * 25) * Math.PI) / 180;
      const phi = k * 2.4 + R() * 0.8;
      const d = T.clone()
        .multiplyScalar(Math.cos(ang))
        .addScaledVector(u, Math.cos(phi) * Math.sin(ang))
        .addScaledVector(v, Math.sin(phi) * Math.sin(ang));
      d.y += depth === 2 ? 0.25 : -0.12;
      d.normalize();
      const L = Math.max(0.35, len * (depth === 2 ? 0.34 + R() * 0.14 : 0.45 + R() * 0.2));
      const wob = () => V((R() - 0.5) * 0.08 * L, (R() - 0.5) * 0.06 * L, (R() - 0.5) * 0.08 * L);
      const p1 = base.clone().addScaledVector(d, L * 0.35).add(wob());
      const p2 = base.clone().addScaledVector(d, L * 0.7).add(wob()).add(V(0, 0.05 * L, 0));
      const p3 = base.clone().addScaledVector(d, L).add(V(0, -0.08 * L, 0));
      const rp = r0 + (r1 - r0) * t;
      grow([base, p1, p2, p3], rp * 0.62, Math.max(0.012, rp * 0.2), depth - 1);
    }
  }

  const limb = (t: number, pts: number[][], r0: number, r1: number) =>
    grow([trunkPath.at(t).clone(), ...pts.map((p) => V(p[0], p[1], p[2]))], r0, r1, 2);

  // the great left limb, the rising right limb, the crown, and four lower arms
  limb(0.86, [[0.7, 2.75, 0.1], [1.5, 3.2, 0.2], [2.3, 3.4, 0.15], [2.9, 3.3, 0.3]], 0.19, 0.04);
  limb(0.95, [[-0.5, 3.3, -0.1], [-1.1, 3.9, -0.2], [-1.7, 4.4, -0.15], [-2.1, 4.5, -0.2]], 0.15, 0.035);
  limb(1.0, [[0.15, 3.4, 0.0], [0.1, 4.0, -0.1], [0.25, 4.6, 0.0], [0.2, 5.1, 0.05]], 0.16, 0.035);
  limb(0.55, [[0.5, 1.9, 0.3], [1.2, 2.15, 0.7], [1.9, 2.1, 1.1], [2.4, 1.85, 1.3]], 0.16, 0.035);
  limb(0.45, [[-0.5, 1.8, -0.2], [-1.2, 2.2, -0.6], [-1.9, 2.3, -1.0]], 0.15, 0.035);
  limb(0.72, [[-0.45, 2.4, 0.3], [-1.0, 2.9, 0.7], [-1.7, 3.0, 1.1]], 0.14, 0.035);
  limb(0.78, [[0.4, 2.7, -0.4], [0.9, 3.3, -0.9], [1.3, 3.8, -1.2]], 0.13, 0.035);

  // ---- blossom clouds ------------------------------------------------------------------------------------------
  const puffs: ReturnType<typeof b.part>[] = [];
  const centers: THREE.Vector3[] = [];
  for (const tip of tips) {
    const c = tip.clone().add(V(0, 0.1 + R() * 0.1, 0));
    if (centers.some((o) => o.distanceTo(c) < 0.62)) continue;
    centers.push(c);
    const rad = 0.42 + R() * 0.28;
    puffs.push(
      b.part(new THREE.IcosahedronGeometry(1, 1), BLOSSOM, {
        at: c,
        scale: [rad * 1.15, rad * 0.8, rad * 1.05],
        rotation: [0, R() * 360, 0],
        flat: true,
        name: "puff",
      }),
    );
  }

  const canopy = b.surface(puffs);

  // drawn flower clusters over the clouds
  const flowers = canopy.scatter(520, { rng: rng(11), minDist: 0.11, filter: (h) => h.n.y > -0.55 });
  const fr = rng(13);
  b.cards(flowers, CLUSTER, {
    size: [0.26, 0.26],
    lean: 80,
    flow: () => {
      const a = fr() * Math.PI * 2;
      return [Math.cos(a), (fr() - 0.5) * 0.4, Math.sin(a)] as [number, number, number];
    },
    vary: 0.3,
    spin: 180,
    rng: rng(12),
  });

  // bronze young leaves among the blossom
  const leafHits = canopy.scatter(70, { rng: rng(15), minDist: 0.2, filter: (h) => h.n.y > -0.2 });
  const lr = rng(16);
  b.cards(leafHits, LEAF, {
    size: [0.08, 0.13],
    lean: 45,
    flow: () => {
      const a = lr() * Math.PI * 2;
      return [Math.cos(a), 0, Math.sin(a)] as [number, number, number];
    },
    vary: 0.3,
    spin: 25,
    rng: rng(17),
  });

  // hanging blossom strands under the clouds
  const under = canopy.scatter(36, { rng: rng(19), minDist: 0.28, filter: (h) => h.n.y < -0.4 });
  b.cards(
    under.map((h) => frame(h.at, [0, 1, 0])),
    STRAND,
    { size: [0.14, 0.56], lean: 180, flow: [0, 0, 1], cross: true, vary: 0.3, rng: rng(20), sink: 0.02 },
  );

  // ---- trunk details -------------------------------------------------------------------------------------------
  const burlSkin = b.surface(trunk);
  const burls = burlSkin.scatter(8, {
    rng: rng(21),
    minDist: 0.35,
    filter: (h) => h.at.y > 0.5 && h.at.y < 2.3 && Math.abs(h.at.y - 1.05) > 0.18 && Math.abs(h.at.y - 1.75) > 0.3 && h.n.y > -0.4,
  });
  for (const h of burls)
    b.stick(new THREE.IcosahedronGeometry(0.07 + R() * 0.06, 0), BARK, h, { embed: 0.45, flat: true });

  const knotHit = burlSkin.ray([0.1, 1.75, 3], [0, 0, -1]);
  if (knotHit)
    b.decal(trunk, KNOT, { at: knotHit.at, dir: [0, 0, 1], size: [0.2, 0.28], lift: 0.004 });

  // ---- shimenawa rope and shide ---------------------------------------------------------------------------------
  const ropeCentre = trunkPath.at(0.36).clone();
  const girth = b.surface(trunk).loop(ropeCentre, { dir: [0, 1, 0], lift: 0.035 });
  b.sweep(girth, 0.048, { color: ROPE, sides: 6, smooth: false });
  const shideFrames = [0.0, 0.07, 0.93, 0.16, 0.84, 0.3, 0.7, 0.5].map((t) => {
    const pt = girth.at(t).clone();
    return frame([pt.x, pt.y - 0.03, pt.z], [0, 1, 0]);
  });
  b.cards(shideFrames, SHIDE, {
    size: [0.13, 0.4],
    lean: 180,
    flow: (f) => [f.at.x - ropeCentre.x, 0, f.at.z - ropeCentre.z] as [number, number, number],
    vary: 0.15,
    rng: rng(23),
    sink: 0.02,
  });

  // ---- fallen and drifting petals -----------------------------------------------------------------------------
  const pr = rng(31);
  const ground = [];
  for (let i = 0; i < 110; i++) {
    const a = pr() * Math.PI * 2;
    const r = 0.7 + Math.pow(pr(), 0.8) * 2.4;
    ground.push(frame([Math.cos(a) * r, 0.004, Math.sin(a) * r], [0, 1, 0]));
  }
  b.cards(ground, PETAL, {
    size: [0.075, 0.075],
    lean: 90,
    flow: () => {
      const a = pr() * Math.PI * 2;
      return [Math.cos(a), 0, Math.sin(a)] as [number, number, number];
    },
    vary: 0.3,
    rng: rng(32),
    sink: 0,
  });

  const air = [];
  for (let i = 0; i < 45; i++) {
    const dir = V(pr() - 0.5, pr() - 0.5, pr() - 0.5).normalize();
    air.push(frame([(pr() - 0.5) * 6, 1.0 + pr() * 3.5, -1 + pr() * 4], [dir.x, dir.y, dir.z]));
  }
  b.cards(air, PETAL, {
    size: [0.09, 0.09],
    lean: 15,
    flow: () => {
      const a = pr() * Math.PI * 2;
      return [Math.cos(a), 0.3, Math.sin(a)] as [number, number, number];
    },
    vary: 0.3,
    spin: 180,
    rng: rng(33),
    sink: 0,
  });

  return b.root;
}
```