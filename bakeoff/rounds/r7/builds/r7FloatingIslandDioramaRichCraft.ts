import * as THREE from "three";
import { createBuilder, frame, rng, catmull, spiral, paint, noise, mottle, svg } from "../../../../src/index";
import { cel, zigzag } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Zephyr Isle",
  description:
    "A Genshin-style floating sky island: cel-shaded grass and rock, glowing teal crystals under the belly, an Anemo ruin with a floating crystal, rune circle and banners, a pond with a stream and waterfall into a cloud sea, a blossoming sakura, pines and small drifting islets.",
};

const DEG = Math.PI / 180;
const TAU = Math.PI * 2;
const T = 1.72; // height of the island's top surface
type V3 = [number, number, number];

// Radial wobble of the island silhouette, shared by the geometry and everything placed on it.
const wob = (a: number, y: number) =>
  1 +
  0.06 * Math.sin(3 * a + 1.3 + 1.2 * y) +
  0.045 * Math.sin(5 * a + 0.4 - 1.7 * y) +
  0.025 * Math.sin(8 * a + 2 + y);
const edgeR = (a: number) => 1.46 * wob(a, T);
const pol = (a: number, f: number): [number, number] => {
  const r = f * edgeR(a);
  return [r * Math.sin(a), r * Math.cos(a)];
};

// A turned rock body with a jittered silhouette (profile is [radius, height], bottom to top).
function rockGeo(profile: [number, number][], seg: number, wobFn: (a: number, y: number) => number) {
  const g = new THREE.LatheGeometry(
    profile.map(([x, y]) => new THREE.Vector2(x, y)),
    seg,
  );
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const k = wobFn(Math.atan2(x, z), y);
    pos.setXYZ(i, x * k, y, z * k);
  }
  g.computeVertexNormals();
  return g;
}

const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const cyl = (rt: number, rb: number, h: number, s = 8) => new THREE.CylinderGeometry(rt, rb, h, s, 1);
const cone = (r: number, h: number, s = 6) => new THREE.ConeGeometry(r, h, s, 1);
const ico = (r: number, d = 0, sx = 1, sy = 1, sz = 1) => {
  const g = new THREE.IcosahedronGeometry(r, d);
  g.scale(sx, sy, sz);
  return g;
};

export default function build() {
  const b = createBuilder({ name: "zephyrIsle", paintSize: 2048 });
  const root = b.joint("root", { at: [0, 0, 0] });
  const R = rng(2024);

  type Col = string | ReturnType<typeof paint>;
  const put = (geo: THREE.BufferGeometry, color: Col, at: V3, o: Record<string, unknown> = {}) =>
    b.part(geo, color, { bone: root, at, flat: true, ...o } as any);

  // ------------------------------------------------------------------ palette (cel shaded)
  const GRASS = cel(mottle("#9fe05c", "#84d257", { size: 0.22, seed: 2 }), "#4fae55");
  const GRASS_SIDE = cel("#6fc04c", "#3e9a52");
  const SOIL = cel("#a98160", "#7a5a5c");
  const ROCK = cel(mottle("#bba998", "#a69588", { size: 0.2, seed: 5 }), "#7f7090");
  const ROCK_DARK = cel("#a08f8c", "#6b6088");
  const VEIN = "#86f2ea";
  const MOSS = cel("#8fd05a", "#4fa855");
  const STONE_BASE = cel(mottle("#f4eddb", "#e4d9bd", { size: 0.15, seed: 7 }), "#a9a5c6");
  const STONE_FLOOR = cel("#ddd2b6", "#9c97ba");
  const STONE = paint((p, n) => {
    if (n.y > 0.6 && noise(p, 0.09, 3) > 0.54) return MOSS;
    if (p.y < T + 0.22 && noise(p, 0.07, 5) > 0.5) return MOSS;
    return STONE_BASE;
  });
  const TEALSTONE = cel("#46c0b8", "#2b8aa8");
  const GOLD = cel("#f4cd5a", "#c98a2e");
  const BARK = cel(mottle("#7a5642", "#68463a", { size: 0.08, seed: 3 }), "#4a3550");
  const PINK_A = cel("#ffb8d0", "#e486ba");
  const PINK_B = cel("#ffd3e2", "#f19ac6");
  const PINK_C = cel("#ff9fc2", "#d874b4");
  const GREEN_A = cel("#7fd25a", "#3f9a58");
  const GREEN_B = cel("#5cbf5a", "#2f8a5c");
  const GREEN_C = cel("#a2e068", "#4faa58");
  const PINE_A = cel("#3f9b6a", "#25705e");
  const PINE_B = cel("#56b377", "#2c7f64");
  const CLOUD = cel("#ffffff", "#b5cdf0");
  const CLOUD2 = cel("#f2f8ff", "#a9c3ee");
  const WATERP = paint((p) => (noise(p, 0.05, 2) > 0.72 ? "#e8fdff" : cel("#58d6ea", "#3aa6d6")));
  const ROCKMOSS = paint((_p, n) => (n.y > 0.5 ? GRASS : ROCK));

  // ------------------------------------------------------------------ textures
  const ring = (r: number, a: number): string =>
    `${(100 + r * Math.sin(a)).toFixed(1)} ${(100 - r * Math.cos(a)).toFixed(1)}`;
  let ticks = "";
  for (let k = 0; k < 48; k++) {
    const a = (k * TAU) / 48;
    const long = k % 4 === 0;
    ticks += `<path d="M${ring(long ? 82 : 88, a)} L${ring(94, a)}" stroke-width="${long ? 2.4 : 1.4}"/>`;
  }
  let marks = "";
  for (let k = 0; k < 8; k++) {
    const a = (k * TAU) / 8 + TAU / 16;
    marks += `<circle cx="${ring(70, a).split(" ")[0]}" cy="${ring(70, a).split(" ")[1]}" r="3.4" stroke-width="1.8"/>`;
    marks += `<path d="M${ring(60, a)} L${ring(65, a)}" stroke-width="1.8"/>`;
  }
  const RUNE = svg(
    `<svg viewBox="0 0 200 200"><g fill="none" stroke="#9ffff2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="100" cy="100" r="96" stroke-width="3"/><circle cx="100" cy="100" r="80" stroke-width="1.8"/>
      <circle cx="100" cy="100" r="50" stroke-width="2.4"/>
      <polygon points="100,46 146.8,127 53.2,127" stroke-width="2.4"/>
      <polygon points="100,154 53.2,73 146.8,73" stroke-width="2.4"/>
      <circle cx="100" cy="100" r="9" stroke-width="2.4"/>${ticks}${marks}</g></svg>`,
    { size: 512 },
  );

  const BANNER = svg(
    `<svg viewBox="0 0 60 120">
      <path d="M3 2 H57 V112 L30 96 L3 112 Z" fill="#2fb7b2" stroke="#f0c24a" stroke-width="3" stroke-linejoin="round"/>
      <path d="M9 8 H51 V98 L30 85 L9 98 Z" fill="none" stroke="#f7dc8a" stroke-width="1.6"/>
      <path d="M30 56 C22 56 19 46 26 41 C34 36 43 44 39 53 C36 60 25 62 20 54" fill="none" stroke="#f7d36a" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M30 13 Q38 23 30 33 Q22 23 30 13Z" fill="#f7d36a" stroke="#c98a2e" stroke-width="1"/>
      <circle cx="30" cy="72" r="2.6" fill="#f7d36a"/><circle cx="22" cy="76" r="2" fill="#f7d36a"/><circle cx="38" cy="76" r="2" fill="#f7d36a"/>
    </svg>`,
    { size: 256 },
  );

  let streaks = "";
  for (let k = 0; k < 16; k++) {
    const x = 2 + R() * 34;
    const w = 1.4 + R() * 2.4;
    const y = R() * 120;
    const h = 40 + R() * 80;
    streaks += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="1" fill="#eafeff" opacity="${(0.55 + R() * 0.4).toFixed(2)}"/>`;
  }
  const WATERTEX = svg(
    `<svg viewBox="0 0 40 200"><defs><linearGradient id="w" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#43c3e8"/><stop offset="0.7" stop-color="#7fe3f5"/><stop offset="1" stop-color="#d6fbff"/></linearGradient></defs>
      <rect width="40" height="200" fill="url(#w)"/>${streaks}
      <rect x="0" y="0" width="40" height="9" fill="#f4feff"/></svg>`,
    { size: 256 },
  );

  let petals = "";
  for (let k = 0; k < 5; k++) {
    const a = (k * TAU) / 5;
    petals += `<circle cx="${(20 + 9 * Math.sin(a)).toFixed(1)}" cy="${(20 - 9 * Math.cos(a)).toFixed(1)}" r="7.5" fill="#ffc4dc" stroke="#e8789f" stroke-width="1.3"/>`;
  }
  const BLOSSOM = svg(
    `<svg viewBox="0 0 40 40">${petals}<circle cx="20" cy="20" r="4.4" fill="#ffdf7a" stroke="#e8a83a" stroke-width="1"/></svg>`,
    { size: 96 },
  );

  const GRASSTEX = svg(
    `<svg viewBox="0 0 40 40"><g stroke="#2f7d3a" stroke-width="1.1" stroke-linejoin="round">
      <path d="M6 40 Q8 20 3 6 Q13 18 14 40Z" fill="#6cc24a"/>
      <path d="M12 40 Q14 18 14 2 Q24 16 22 40Z" fill="#9be25f"/>
      <path d="M20 40 Q24 20 33 8 Q31 24 29 40Z" fill="#6cc24a"/>
      <path d="M27 40 Q32 28 38 20 Q36 32 35 40Z" fill="#9be25f"/></g></svg>`,
    { size: 128 },
  );

  let petalsF = "";
  for (let k = 0; k < 6; k++)
    petalsF += `<ellipse cx="0" cy="-8" rx="4.5" ry="9" fill="#f2fcff" stroke="#68c4ee" stroke-width="1.4" transform="rotate(${k * 60})"/>`;
  const FLOWER = svg(
    `<svg viewBox="0 0 40 56"><path d="M20 56 C20 44 21 36 20 26" stroke="#3e9a52" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <ellipse cx="26" cy="42" rx="7" ry="3.2" transform="rotate(-30 26 42)" fill="#6cc24a" stroke="#2f7d3a" stroke-width="1.2"/>
      <g transform="translate(20 18)">${petalsF}<circle r="4.6" fill="#ffe38a" stroke="#e8a83a" stroke-width="1.2"/></g></svg>`,
    { size: 128 },
  );

  let leaves = "";
  for (let k = 0; k < 5; k++) {
    const y = 60 - k * 12;
    const side = k % 2 ? -1 : 1;
    const cx = 12 + side * 6;
    leaves += `<ellipse cx="${cx}" cy="${y}" rx="6" ry="3.4" transform="rotate(${-side * 35} ${cx} ${y})" fill="#6fc255" stroke="#2f7d3a" stroke-width="1.2"/>`;
  }
  const VINE = svg(
    `<svg viewBox="0 0 24 72"><path d="M12 72 C8 56 16 44 11 30 C8 20 13 10 12 2" stroke="#4a8f45" stroke-width="2.4" fill="none" stroke-linecap="round"/>${leaves}</svg>`,
    { size: 216 },
  );

  const G = rng(77);
  let glyphs = "";
  for (let row = 0; row < 4; row++)
    for (let col = 0; col < 3; col++) {
      const x = 14 + col * 16;
      const y = 32 + row * 14;
      glyphs += `<path d="M${x} ${y - 6} L${x} ${y + 6}"/>`;
      if (G() > 0.3) glyphs += `<path d="M${x} ${y - 2} L${x + 5} ${y - 5}"/>`;
      if (G() > 0.3) glyphs += `<path d="M${x} ${y + 2} L${x - 5} ${y + 5}"/>`;
      if (G() > 0.5) glyphs += `<circle cx="${x + 3}" cy="${y + 4}" r="1.6"/>`;
    }
  const TABLET = svg(
    `<svg viewBox="0 0 60 90"><g fill="none" stroke="#9ffff2" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="30" cy="13" r="8"/><path d="M30 5 V21 M22 13 H38"/><path d="M24 7 Q30 13 36 19" />${glyphs}</g></svg>`,
    { size: 256 },
  );

  // ------------------------------------------------------------------ the island
  const islandPaint = paint((p, n) => {
    const a = Math.atan2(p.x, p.z);
    const drip = T - 0.04 - 0.1 * zigzag((a / TAU) * 30);
    if (n.y > 0.55 && p.y > T - 0.02) return GRASS;
    if (p.y > drip) return GRASS_SIDE;
    if (p.y > drip - 0.12 - 0.06 * noise(p, 0.2, 3)) return SOIL;
    if (n.y < 0.35 && noise(p, 0.28, 4) > 0.8) return VEIN;
    return n.y > 0.7 && noise(p, 0.1, 2) > 0.5 ? GRASS : ROCK;
  });
  const profile: [number, number][] = [
    [0, 0],
    [0.06, 0.08],
    [0.14, 0.26],
    [0.26, 0.48],
    [0.44, 0.7],
    [0.7, 0.95],
    [0.98, 1.16],
    [1.22, 1.34],
    [1.38, 1.48],
    [1.45, 1.6],
    [1.46, T],
    [0, T],
  ];
  const island = b.part(rockGeo(profile, 14, wob), islandPaint, { bone: root, at: [0, 0, 0], flat: true } as any);
  const under = b.surface(island);

  // rock spikes and glowing crystals growing from the belly
  const belly = under.around([0, 1.0, 0]);
  for (let i = 0; i < 14; i++) {
    const h = belly.at(i * (360 / 14) + R() * 14, -18 - R() * 42);
    if (!h) continue;
    b.stick(cone(0.06 + R() * 0.05, 0.22 + R() * 0.3, 5), ROCK_DARK, h, { embed: 0.25, flat: true } as any);
  }
  for (let i = 0; i < 7; i++) {
    const h = belly.at(20 + i * 51 + R() * 20, -12 - R() * 38);
    if (!h) continue;
    glow(b.stick(cone(0.05, 0.24, 6), "#7ff0e8", h, { embed: 0.2, flat: true } as any), 1.2);
    glow(b.stick(cone(0.032, 0.15, 6), "#c4fffa", h.moved([0.05, -0.01, 0.02]), { embed: 0.2, flat: true } as any), 1.2);
  }
  for (const h of under.scatter(9, {
    rng: R,
    minDist: 0.4,
    filter: (q) => q.n.y < 0.35 && q.n.y > -0.6 && q.at.y > 0.45,
  })) {
    b.stick(ico(0.1 + R() * 0.09, 0, 1, 0.8 + R() * 0.3, 1), ROCK, h, { embed: 0.45, flat: true } as any);
  }

  // ------------------------------------------------------------------ cloud sea (the staged base)
  const puff = (x: number, y: number, z: number, r: number, c: Col) => put(ico(r, 1, 1, 0.62, 1), c, [x, y, z]);
  const cloudRings: [number, number, number][] = [
    [0.45, 5, 0.2],
    [0.9, 8, 0.27],
    [1.3, 10, 0.32],
    [1.62, 11, 0.34],
  ];
  cloudRings.forEach(([rr, n, rad], ri) => {
    for (let k = 0; k < n; k++) {
      const a = (k / n) * TAU + R() * 0.4 + ri;
      const rd = rr + (R() - 0.5) * 0.2;
      const r = rad * (0.8 + R() * 0.5);
      puff(rd * Math.sin(a), r * 0.5, rd * Math.cos(a), r, k % 2 ? CLOUD : CLOUD2);
      if (ri > 0 && k % 2 === 0) {
        const r2 = r * 0.62;
        puff((rd - 0.12) * Math.sin(a + 0.1), 0.24 + r2 * 0.4, (rd - 0.12) * Math.cos(a + 0.1), r2, CLOUD);
      }
    }
  });

  // ------------------------------------------------------------------ waterfall, pond, stream
  const aW = (2 * TAU) / 14;
  const eA = edgeR(aW);
  const sA = Math.sin(aW);
  const cA = Math.cos(aW);
  const pr = 0.4 * eA;
  const PX = pr * sA;
  const PZ = pr * cA;
  const rW = eA + 0.045;
  const wx = rW * sA;
  const wz = rW * cA;
  const sheetTop = T + 0.035;
  const sheetBot = 0.3;
  const H = sheetTop - sheetBot;
  glow(
    put(box(0.28, H, 0.05), "#ffffff", [wx, (sheetTop + sheetBot) / 2, wz], {
      rotation: [0, aW / DEG, 0],
      texture: WATERTEX,
      flat: false,
    }),
    0.45,
  );
  for (const s of [1, -1]) {
    glow(
      put(box(0.07, 0.75, 0.04), "#ffffff", [wx + s * 0.19 * cA - 0.01 * sA, sheetTop - 0.375, wz - s * 0.19 * sA - 0.01 * cA], {
        rotation: [0, aW / DEG, 0],
        texture: WATERTEX,
        flat: false,
      }),
      0.45,
    );
    puff(wx + s * 0.1 * cA, sheetTop + 0.01, wz - s * 0.1 * sA, 0.05, CLOUD);
  }
  for (const y of [1.25, 0.9, 0.58])
    put(box(0.3, 0.012, 0.062), "#f2feff", [wx, y, wz], { rotation: [0, aW / DEG, 0] });
  // landing splash and mist
  for (let k = 0; k < 5; k++) {
    const a = aW + (k - 2) * 0.12;
    puff((eA + 0.08) * Math.sin(a), 0.28 + (k % 2) * 0.05, (eA + 0.08) * Math.cos(a), 0.2 + R() * 0.1, k % 2 ? CLOUD : CLOUD2);
  }
  for (let k = 0; k < 6; k++)
    put(ico(0.06 + R() * 0.05, 1), "#ffffff", [wx + (R() - 0.5) * 0.4, 0.38 + R() * 0.25, wz + (R() - 0.5) * 0.4]);

  // pond: water disc ringed with rocks, a gap toward the stream
  put(cyl(0.27, 0.27, 0.03, 10), WATERP, [PX, T + 0.015, PZ]);
  for (let k = 0; k < 10; k++) {
    const th = (k / 10) * TAU;
    let d = Math.abs(th - aW);
    d = Math.min(d, TAU - d);
    if (d < 0.46) continue;
    put(ico(0.055 + R() * 0.02, 0, 1, 0.7, 1), ROCK, [PX + 0.285 * Math.sin(th), T + 0.02, PZ + 0.285 * Math.cos(th)], {
      rotation: [0, R() * 360, 0],
    });
  }
  for (let k = 0; k < 3; k++) {
    const th = 1.5 + k * 2.1;
    put(cyl(0.045, 0.045, 0.006, 7), GREEN_A, [PX + 0.14 * Math.sin(th), T + 0.033, PZ + 0.14 * Math.cos(th)]);
  }
  put(ico(0.022, 0, 1, 0.8, 1), PINK_A, [PX + 0.14 * Math.sin(1.5), T + 0.045, PZ + 0.14 * Math.cos(1.5)]);

  const streamR = [pr + 0.05, pr + 0.3, pr + 0.5, pr + 0.7, eA + 0.03];
  const streamA = [0, 0.05, -0.04, 0.05, 0];
  const streamPts: V3[] = streamR.map((r, i) => [r * Math.sin(aW + streamA[i]), T + 0.012, r * Math.cos(aW + streamA[i])]);
  const stream = catmull(streamPts);
  b.sweep(stream, (t) => [0.065 + 0.02 * t, 0.02], { color: WATERP, bone: root, section: "box", caps: "flat" } as any);

  // little arched stone bridge over the stream
  const bp = stream.at(0.5);
  const bt = stream.tangentAt(0.5);
  const yaw = Math.atan2(bt.x, bt.z);
  const yd = yaw / DEG;
  const BL = (lx: number, ly: number, lz: number): V3 => [
    bp.x + lx * Math.cos(yaw) + lz * Math.sin(yaw),
    T + ly,
    bp.z - lx * Math.sin(yaw) + lz * Math.cos(yaw),
  ];
  put(box(0.34, 0.03, 0.15), STONE, BL(0, 0.06, 0), { rotation: [0, yd, 0] });
  for (const s of [1, -1]) {
    put(box(0.07, 0.07, 0.15), STONE, BL(s * 0.15, 0.035, 0), { rotation: [0, yd, 0] });
    for (const q of [1, -1]) {
      put(box(0.022, 0.075, 0.022), TEALSTONE, BL(s * 0.15, 0.1, q * 0.06), { rotation: [0, yd, 0] });
      put(box(0.03, 0.016, 0.03), GOLD, BL(s * 0.15, 0.145, q * 0.06), { rotation: [0, yd, 0] });
    }
  }
  for (const q of [1, -1]) put(box(0.34, 0.012, 0.012), GOLD, BL(0, 0.125, q * 0.06), { rotation: [0, yd, 0] });

  // ------------------------------------------------------------------ the ruin
  const C0 = -0.05;
  const C2 = -0.4;
  const y1 = T + 0.1; // lower tier top
  const fy = T + 0.19; // inner floor
  put(cyl(0.6, 0.66, 0.1, 6), STONE, [C0, T + 0.05, C2]);
  put(cyl(0.46, 0.5, 0.08, 6), STONE, [C0, T + 0.14, C2]);
  put(cyl(0.475, 0.475, 0.012, 6), GOLD, [C0, T + 0.176, C2]);
  put(cyl(0.43, 0.43, 0.01, 6), STONE_FLOOR, [C0, T + 0.185, C2]);
  glow(
    put(new THREE.PlaneGeometry(0.78, 0.78), "#ffffff", [C0, fy + 0.0015, C2], {
      dir: [0, 1, 0],
      axis: "z",
      up: [0, 0, -1],
      texture: RUNE,
      flat: false,
    }),
    1.2,
  );
  // steps and a stepping-stone path toward the bridge
  put(box(0.34, 0.05, 0.14), STONE, [C0, T + 0.025, C2 + 0.68]);
  put(box(0.28, 0.08, 0.12), STONE, [C0, T + 0.04, C2 + 0.58]);
  const stones: [number, number][] = [
    [0, 0.92],
    [0.2, 0.95],
    [0.4, 0.93],
    [0.6, 0.86],
    [0.74, 0.78],
  ];
  stones.forEach(([x, z], i) => put(cyl(0.07, 0.075, 0.016, 7), STONE, [x, T + 0.008, z], { rotation: [0, i * 40, 0] }));
  put(cyl(0.065, 0.07, 0.016, 7), STONE, [C0 + 0.02, T + 0.008, C2 + 0.86]);

  const vineFrames: ReturnType<typeof frame>[] = [];
  const pillar = (x: number, z: number, y0: number, h: number, broken: boolean, strip: boolean) => {
    const top = y0 + 0.045 + h;
    put(box(0.17, 0.045, 0.17), STONE, [x, y0 + 0.0225, z]);
    put(cyl(0.05, 0.06, h, 8), STONE, [x, y0 + 0.045 + h / 2, z]);
    put(cyl(0.066, 0.066, 0.016, 8), GOLD, [x, y0 + 0.095, z]);
    if (!broken) {
      put(cyl(0.066, 0.066, 0.016, 8), GOLD, [x, top - 0.05, z]);
      put(box(0.15, 0.035, 0.15), STONE, [x, top + 0.0175, z]);
      put(box(0.2, 0.03, 0.2), STONE, [x, top + 0.05, z]);
      vineFrames.push(frame([x + 0.07, top + 0.03, z + 0.08], [0, 1, 0]));
    } else {
      put(box(0.07, 0.06, 0.06), STONE, [x + 0.02, top + 0.02, z - 0.01], { rotation: [0, 25, 12] });
      put(box(0.05, 0.08, 0.05), STONE, [x - 0.025, top + 0.03, z + 0.015], { rotation: [8, -20, -10] });
      put(cyl(0.05, 0.05, 0.09, 8), STONE, [x + 0.13, y0 + 0.05, z + 0.1], { rotation: [0, 0, 84] });
      put(ico(0.04, 0, 1, 0.8, 1), STONE, [x - 0.1, y0 + 0.03, z + 0.1]);
    }
    if (strip) {
      const dx = C0 - x;
      const dz = C2 - z;
      const L = Math.hypot(dx, dz);
      const ux = dx / L;
      const uz = dz / L;
      glow(
        put(box(0.012, h * 0.55, 0.012), "#8ff6ee", [x + ux * 0.054, y0 + 0.045 + h * 0.5, z + uz * 0.054], {
          rotation: [0, Math.atan2(ux, uz) / DEG, 0],
        }),
        1.2,
      );
    }
  };
  const hv = (k: number): [number, number] => [C0 + 0.46 * Math.sin((k * Math.PI) / 3), C2 + 0.46 * Math.cos((k * Math.PI) / 3)];
  pillar(...hv(1), y1, 0.42, false, true);
  pillar(...hv(2), y1, 0.78, false, true);
  pillar(...hv(4), y1, 0.78, false, true);
  pillar(...hv(5), y1, 0.34, true, false);

  // gate lintel (half collapsed), banner, fallen block
  const [g2x, g2z] = hv(2);
  const gateTop = y1 + 0.045 + 0.78 + 0.065;
  put(box(0.5, 0.07, 0.12), STONE, [g2x - 0.15, gateTop + 0.035, g2z]);
  put(box(0.5, 0.014, 0.006), GOLD, [g2x - 0.15, gateTop + 0.035, g2z + 0.062]);
  put(box(0.06, 0.06, 0.1), STONE, [g2x - 0.42, gateTop + 0.03, g2z], { rotation: [0, 15, 20] });
  put(box(0.18, 0.012, 0.02), GOLD, [g2x - 0.2, gateTop - 0.01, g2z + 0.075]);
  put(box(0.15, 0.3, 0.012), "#ffffff", [g2x - 0.2, gateTop - 0.17, g2z + 0.078], { texture: BANNER, flat: false });
  put(box(0.28, 0.07, 0.11), STONE, [C0 - 0.72, T + 0.035, C2 + 0.1], { rotation: [0, 20, 7] });
  put(ico(0.05, 0, 1, 0.7, 1), STONE, [C0 - 0.6, T + 0.02, C2 + 0.22]);

  // standing tablets: tall stele behind the altar and a small one in front
  const tablet = (x: number, y: number, z: number, yawDeg: number, s: number) => {
    const rot = { rotation: [0, yawDeg, 0] };
    put(box(0.26 * s, 0.05 * s, 0.12 * s), STONE, [x, y + 0.025 * s, z], rot);
    put(box(0.2 * s, 0.34 * s, 0.06 * s), STONE, [x, y + 0.22 * s, z], rot);
    put(box(0.22 * s, 0.025 * s, 0.075 * s), GOLD, [x, y + 0.3925 * s, z], rot);
    const yr = yawDeg * DEG;
    const off = 0.034 * s;
    glow(
      put(new THREE.PlaneGeometry(0.15 * s, 0.225 * s), "#ffffff", [x + off * Math.sin(yr), y + 0.22 * s, z + off * Math.cos(yr)], {
        ...rot,
        texture: TABLET,
        flat: false,
      }),
      1,
    );
  };
  const [sx3, sz3] = hv(3);
  tablet(sx3, y1, sz3 - 0.02, 0, 1.45);
  tablet(-0.25, T, 0.55, 15, 0.9);

  // altar, floating crystal, rings, shards and wind spirals
  put(cyl(0.085, 0.11, 0.07, 6), STONE, [C0, fy + 0.035, C2]);
  put(cyl(0.095, 0.095, 0.012, 6), GOLD, [C0, fy + 0.076, C2]);
  put(cyl(0.06, 0.085, 0.04, 6), TEALSTONE, [C0, fy + 0.1, C2]);
  const cy = fy + 0.46;
  const crystal = b.joint("crystal", { parent: root, at: [C0, cy, C2] });
  glow(put(cone(0.09, 0.2, 6), "#c4fffa", [C0, cy + 0.1, C2], { bone: crystal }), 1.3);
  glow(put(cone(0.09, 0.13, 6), "#58d8e0", [C0, cy - 0.065, C2], { bone: crystal, rotation: [180, 0, 0] }), 1.3);
  glow(put(new THREE.TorusGeometry(0.17, 0.007, 4, 18), "#ffd45a", [C0, cy, C2], { bone: crystal, rotation: [75, 0, 0] }), 0.8);
  glow(put(new THREE.TorusGeometry(0.2, 0.006, 4, 18), "#ffd45a", [C0, cy, C2], { bone: crystal, rotation: [20, 0, 50] }), 0.8);
  for (let k = 0; k < 4; k++) {
    const a = k * 1.57 + 0.4;
    glow(
      put(new THREE.OctahedronGeometry(0.025), "#9ffff4", [C0 + 0.25 * Math.sin(a), cy - 0.1 + 0.07 * k, C2 + 0.25 * Math.cos(a)], {
        bone: crystal,
        rotation: [k * 20, k * 35, 0],
      }),
      1.2,
    );
  }
  for (const ph of [0, Math.PI]) {
    const sp = spiral([C0, cy - 0.3, C2], [C0 + 0.3 * Math.cos(ph), cy - 0.3, C2 + 0.3 * Math.sin(ph)], [0, 1, 0], {
      turns: 1.6,
      r1: 0.1,
      pitch: 0.26,
    });
    glow(b.sweep(sp, [0.008, 0.003], { color: "#c6fff8", bone: crystal, sides: 4 } as any), 1);
  }

  // ------------------------------------------------------------------ trees
  const canopy = (
    cx: number,
    cy2: number,
    cz: number,
    s: number,
    lobes: number[][],
    cols: Col[],
    cnt: number,
    out: any[],
  ) => {
    lobes.forEach(([dx, dy, dz, r], i) => {
      const part = put(ico(r * s, 1, 1, 0.85, 1), cols[i % cols.length], [cx + dx * s, cy2 + dy * s, cz + dz * s]);
      if (cnt > 0)
        for (const h of b.surface(part).scatter(cnt, { rng: R, minDist: 0.05 * s, filter: (q) => q.n.y > -0.1 })) out.push(h);
    });
  };

  const sakura = (x: number, gy: number, z: number, s: number) => {
    const tr: V3[] = [
      [x, gy - 0.03, z],
      [x + 0.04 * s, gy + 0.24 * s, z - 0.03 * s],
      [x - 0.07 * s, gy + 0.5 * s, z + 0.04 * s],
      [x - 0.03 * s, gy + 0.74 * s, z],
    ];
    b.sweep(catmull(tr), [0.075 * s, 0.032 * s], { color: BARK, bone: root, sides: 7 } as any);
    for (let k = 0; k < 4; k++) {
      const a2 = (k * TAU) / 4 + 0.5;
      b.spike([x, gy + 0.05 * s, z], [Math.sin(a2), -0.3, Math.cos(a2)], 0.16 * s, 0.045 * s, { color: BARK, bone: root } as any);
    }
    const p2 = tr[2];
    for (const [ex2, ez2] of [
      [0.3, 0.05],
      [-0.28, -0.1],
      [0.04, 0.3],
    ]) {
      const e: V3 = [p2[0] + ex2 * s, gy + 0.82 * s, p2[2] + ez2 * s];
      const m: V3 = [(p2[0] + e[0]) / 2, gy + 0.68 * s, (p2[2] + e[2]) / 2];
      b.sweep(catmull([p2, m, e]), [0.032 * s, 0.012 * s], { color: BARK, bone: root, sides: 5 } as any);
    }
    const lobes = [
      [0, 0.92, 0, 0.34],
      [0.28, 0.84, 0.08, 0.26],
      [-0.28, 0.86, -0.05, 0.27],
      [0.05, 0.84, 0.3, 0.25],
      [-0.08, 0.84, -0.3, 0.26],
      [0.1, 1.14, -0.05, 0.22],
      [-0.42, 0.68, 0.18, 0.18],
      [0.4, 0.68, -0.14, 0.18],
    ];
    const hits: any[] = [];
    canopy(x, gy, z, s, lobes, [PINK_A, PINK_B, PINK_C], 10, hits);
    if (hits.length) b.cards(hits, BLOSSOM, { size: 0.09 * s, lean: 78, vary: 0.25, rng: R, spin: 180 });
  };

  const roundTree = (x: number, gy: number, z: number, s: number) => {
    b.sweep([[x, gy - 0.02, z], [x, gy + 0.35 * s, z]], [0.05 * s, 0.03 * s], { color: BARK, bone: root, sides: 6 } as any);
    const lobes = [
      [0, 0.55, 0, 0.26],
      [0.17, 0.46, 0.05, 0.19],
      [-0.16, 0.48, -0.04, 0.2],
      [0.02, 0.74, 0.02, 0.16],
      [0.02, 0.44, 0.17, 0.16],
    ];
    canopy(x, gy, z, s, lobes, [GREEN_A, GREEN_B, GREEN_C], 0, []);
  };

  const pine = (x: number, z: number, s: number) => {
    put(cyl(0.03 * s, 0.045 * s, 0.25 * s, 6), BARK, [x, T + 0.12 * s, z]);
    for (let i = 0; i < 4; i++) {
      const r = (0.26 - 0.055 * i) * s;
      const h = 0.3 * s;
      put(cone(r, h, 7), i % 2 ? PINE_B : PINE_A, [x, T + (0.2 + 0.19 * i) * s + h / 2, z], { rotation: [0, i * 20, 0] });
    }
  };

  const [skx, skz] = pol(-1.2, 0.58);
  sakura(skx, T, skz, 1.05);
  const [gtx, gtz] = pol(-0.55, 0.66);
  roundTree(gtx, T, gtz, 0.85);
  const [p1x, p1z] = pol(2.05, 0.68);
  pine(p1x, p1z, 1.0);
  const [p2x, p2z] = pol(2.6, 0.6);
  pine(p2x, p2z, 0.75);

  // mossy boulders
  for (const [a, f, r] of [
    [1.6, 0.8, 0.11],
    [-2.2, 0.75, 0.13],
    [0.25, 0.8, 0.09],
    [-1.8, 0.45, 0.08],
  ]) {
    const [bx, bz] = pol(a, f);
    put(ico(r, 0, 1, 0.75, 1.1), ROCKMOSS, [bx, T + 0.03, bz], { rotation: [0, R() * 360, 0] });
    put(ico(r * 0.55, 0, 1, 0.8, 1), ROCKMOSS, [bx + r * 1.1, T + 0.015, bz + r * 0.4], { rotation: [0, R() * 360, 0] });
  }

  // ------------------------------------------------------------------ flora cards
  const ex: [number, number, number][] = [
    [C0, C2, 0.78],
    [PX, PZ, 0.4],
    [-0.25, 0.55, 0.2],
    [skx, skz, 0.2],
    [gtx, gtz, 0.14],
    [p1x, p1z, 0.14],
    [p2x, p2z, 0.12],
    [C0, C2 + 0.86, 0.16],
  ];
  for (const [x, z] of stones) ex.push([x, z, 0.08]);
  const okSpot = (h: { at: THREE.Vector3 }) => {
    const { x, z } = h.at;
    if (ex.some(([ex0, ez0, rr]) => Math.hypot(x - ex0, z - ez0) < rr)) return false;
    const along = x * sA + z * cA;
    const lat = Math.abs(x * cA - z * sA);
    if (along > pr - 0.1 && lat < 0.2) return false;
    return Math.hypot(x, z) < 0.92 * edgeR(Math.atan2(x, z));
  };
  const topHit = (h: any) => h.n.y > 0.9 && h.at.y > T - 0.01 && okSpot(h);
  const grassHits = under.scatter(110, { rng: R, minDist: 0.09, filter: topHit });
  if (grassHits.length) b.cards(grassHits, GRASSTEX, { size: [0.075, 0.09], lean: 0, cross: true, vary: 0.3, rng: R, spin: 180 });
  const flowerHits = under.scatter(22, { rng: R, minDist: 0.16, filter: topHit });
  if (flowerHits.length) glow(b.cards(flowerHits, FLOWER, { size: [0.07, 0.1], lean: 0, cross: true, vary: 0.25, rng: R, spin: 180 }), 0.9);

  // fallen petals near the sakura
  const petalFrames: ReturnType<typeof frame>[] = [];
  for (let k = 0; k < 14; k++) {
    const a = R() * TAU;
    const d = 0.1 + R() * 0.45;
    petalFrames.push(frame([skx + d * Math.sin(a), T + 0.004, skz + d * Math.cos(a)], [0, 1, 0]));
  }
  b.cards(petalFrames, BLOSSOM, {
    size: 0.045,
    lean: 90,
    flow: (_f: unknown, i: number) => [Math.sin(i * 2.3), 0, Math.cos(i * 2.3)],
    mirror: true,
  } as any);

  // vines hanging from the rim and the ruins
  for (let k = 0; k < 18; k++) {
    const a = (k / 18) * TAU + R() * 0.15;
    let d = Math.abs(a - aW);
    d = Math.min(d, TAU - d);
    if (d < 0.35) continue;
    const r = edgeR(a) - 0.01;
    vineFrames.push(frame([r * Math.sin(a), T - 0.06, r * Math.cos(a)], [0, 1, 0]));
  }
  b.cards(vineFrames, VINE, { size: [0.07, 0.3], lean: 180, flow: [0, 0, 1], cross: true, vary: 0.35, rng: R });

  // ------------------------------------------------------------------ drifting islets
  const islet = (x: number, y: number, z: number, s: number, seed: number) => {
    const prof: [number, number][] = [
      [0, 0],
      [0.08, 0.1],
      [0.2, 0.28],
      [0.36, 0.5],
      [0.46, 0.68],
      [0.5, 0.8],
      [0.5, 0.86],
      [0, 0.86],
    ];
    const g = rockGeo(prof, 9, (a, yy) => 1 + 0.1 * Math.sin(4 * a + seed + yy * 2) + 0.06 * Math.sin(7 * a + seed * 2));
    g.scale(s, s, s);
    const top = y + 0.86 * s;
    const ip = paint((p, n) => {
      if (n.y > 0.5 && p.y > top - 0.02) return GRASS;
      if (p.y > top - 0.07) return GRASS_SIDE;
      if (p.y > top - 0.16) return SOIL;
      return n.y < 0.3 && noise(p, 0.2, 9) > 0.82 ? VEIN : ROCK;
    });
    put(g, ip, [x, y, z]);
    return top;
  };
  const crystalAt = (x: number, y: number, z: number, s: number) => {
    glow(put(cone(0.045 * s, 0.16 * s, 6), "#c4fffa", [x, y + 0.08 * s, z]), 1.3);
    glow(put(cone(0.045 * s, 0.1 * s, 6), "#58d8e0", [x, y - 0.05 * s, z], { rotation: [180, 0, 0] }), 1.3);
  };

  const topA = islet(-1.7, 1.95, 0.2, 0.42, 1.0);
  roundTree(-1.7, topA, 0.2, 0.5);
  const topB = islet(1.5, 2.2, -0.45, 0.34, 2.5);
  put(box(0.1, 0.03, 0.1), STONE, [1.5, topB + 0.015, -0.45]);
  put(box(0.04, 0.1, 0.04), STONE, [1.5, topB + 0.08, -0.45]);
  put(box(0.1, 0.03, 0.1), GOLD, [1.5, topB + 0.145, -0.45]);
  glow(put(box(0.05, 0.04, 0.05), "#ffe9a0", [1.5, topB + 0.18, -0.45]), 1.4);
  put(cone(0.08, 0.06, 4), STONE, [1.5, topB + 0.23, -0.45], { rotation: [0, 45, 0] });
  crystalAt(1.35, topB + 0.05, -0.38, 0.8);
  const topC = islet(-0.1, 2.7, -1.0, 0.24, 4.1);
  crystalAt(-0.1, topC + 0.1, -1.0, 1.6);

  // ------------------------------------------------------------------ wisps and floating motes
  const orbs: [number, number, number, number][] = [
    [0.55, 2.0, 0.7, 0.03],
    [-0.35, 2.35, 0.65, 0.025],
    [0.95, 2.1, 0.3, 0.02],
    [-1.0, 1.9, -0.6, 0.03],
    [0.35, 2.55, -0.2, 0.02],
    [-0.7, 2.7, 0.2, 0.025],
    [1.2, 1.85, 0.9, 0.025],
    [-1.35, 2.5, 0.8, 0.02],
    [0.1, 2.3, 0.95, 0.02],
  ];
  for (const [x, y, z, r] of orbs) glow(put(ico(r, 1), "#a8fff4", [x, y, z]), 1.4);

  return b.root;
}
