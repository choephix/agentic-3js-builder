// Treasure hoard on a hextech-style rune dais: open chest, coin piles, jewelled crown, goblets, glowing gems.
// League of Legends look: exaggerated flared shapes, saturated gold against deep violet stone, one strong cyan
// glowing accent (rune ring, crystals, gems) so it reads from a high top-down camera.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import type { Fill } from "../../../../src/context";
import { frame } from "../../../../src/frame";
import { aim, rng } from "../../../../src/math";
import { grain, mottle, paint, patches } from "../../../../src/paint";
import { bezier, catmull } from "../../../../src/path";
import type { PartOptions } from "../../../../src/parts";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { cel } from "../../../../kits/toon";

export const meta = {
  name: "Dragon's Treasure Hoard",
  description:
    "Open iron-bound chest spilling gold coins, jewelled crown, three goblets, gem-studded piles, ingots and a glowing hextech rune dais with crystals.",
  style: "League of Legends",
  commit: "88fc1f0",
};

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// Layout constants (meters). G is the dais top.
const G = 0.06;
const W = 0.95;
const D = 0.58;
const H = 0.44;
const CZ = -0.4;
const RIM = G + H;
const HZ = CZ - D / 2;

const GEMS = ["#ff2d5a", "#2f7bff", "#25e08c", "#b650ff", "#ffc233", "#3ef0ff"];
const CYAN = "#3ef0ff";
const GOLDS = ["#ffe27a", "#ffc83a", "#ffc83a", "#f2a81e", "#f2a81e", "#d98a14", "#cfd8e8"];
const SILVERS = ["#cfd8e8", "#a9b6d0", "#cfd8e8", "#e6edf8", "#ffc83a"];

// Paints (cel shaded, hue-shifted shadows).
const GOLD = cel(mottle("#ffd447", "#f5a920", { size: 0.05, contrast: 1.6 }));
const BRASS = cel(mottle("#e8b23c", "#bf8120", { size: 0.06, contrast: 1.4 }));
const SILVER = cel(mottle("#eef3ff", "#b3c1de", { size: 0.05, contrast: 1.5 }));
const STONE = cel(patches("#241a46", ["#33276a", "#3b2f78", "#2e2360"], { size: 0.2, gap: 0.07, seed: 3 }));
const LEATHER = cel(mottle("#9a5a2e", "#7a431f", { size: 0.04 }));
const VELVET = cel("#b3173f");
const DOME_G = cel(mottle("#c9801a", "#9a5a10", { size: 0.05 }));
const DOME_S = cel(mottle("#8e9cb8", "#6b7a99", { size: 0.05 }));
const grainBody = grain("#a05c2c", "#74401d", { size: 0.012, axis: "x", seed: 2 });
const WOOD = cel(
  paint((p) => {
    const f = (((p.y - G) / 0.108) % 1 + 1) % 1;
    return f < 0.06 ? "#2e160a" : grainBody;
  }),
);
const LIDWOOD = cel(
  paint((p) => {
    const f = (((p.z - HZ) / 0.1) % 1 + 1) % 1;
    return f < 0.06 ? "#2e160a" : grainBody;
  }),
);

type Pile = { cx: number; cz: number; rx: number; rz: number; h: number; y0: number };

function runeSvg() {
  const C = "#3ff2ff";
  let ticks = "";
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2;
    const r1 = i % 5 === 0 ? 178 : 170;
    ticks += `<line x1="${200 + Math.cos(a) * 160}" y1="${200 + Math.sin(a) * 160}" x2="${200 + Math.cos(a) * r1}" y2="${200 + Math.sin(a) * r1}" stroke="${C}" stroke-width="3"/>`;
  }
  const tri = (rot: number, r: number) =>
    [0, 1, 2]
      .map((k) => {
        const a = rot + (k / 3) * Math.PI * 2;
        return `${200 + Math.cos(a) * r},${200 + Math.sin(a) * r}`;
      })
      .join(" ");
  let glyphs = "";
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.26;
    const x = 200 + Math.cos(a) * 126;
    const y = 200 + Math.sin(a) * 126;
    glyphs += `<path d="M${x} ${y - 9} L${x + 6} ${y} L${x} ${y + 9} L${x - 6} ${y} Z" fill="${C}"/>`;
  }
  return `<svg viewBox="0 0 400 400">
    <circle cx="200" cy="200" r="190" fill="none" stroke="${C}" stroke-width="5"/>
    <circle cx="200" cy="200" r="182" fill="none" stroke="${C}" stroke-width="3" stroke-dasharray="14 8"/>
    ${ticks}
    <circle cx="200" cy="200" r="150" fill="none" stroke="${C}" stroke-width="4"/>
    <polygon points="${tri(-Math.PI / 2, 148)}" fill="none" stroke="${C}" stroke-width="4"/>
    <polygon points="${tri(Math.PI / 2, 148)}" fill="none" stroke="${C}" stroke-width="4"/>
    <circle cx="200" cy="200" r="96" fill="none" stroke="${C}" stroke-width="4"/>
    <circle cx="200" cy="200" r="64" fill="none" stroke="${C}" stroke-width="3" stroke-dasharray="6 6"/>
    ${glyphs}
    <circle cx="200" cy="200" r="10" fill="${C}"/>
  </svg>`;
}

export default function build() {
  const b = createBuilder({ name: "treasureHoard" });
  const root = b.joint("hoard", { at: [0, 0, 0] });
  const lid = b.joint("lid", { parent: root, at: [0, RIM, HZ], dir: [0, 0, 1], role: "hinge" });

  const put = (geo: THREE.BufferGeometry, color: Fill, at: number[] | THREE.Vector3, o: PartOptions = {}) =>
    b.part(geo, color, { bone: root, at, ...o });
  const box = (w: number, h: number, d: number, color: Fill, x: number, y: number, z: number, o: PartOptions = {}) =>
    put(new THREE.BoxGeometry(w, h, d), color, [x, y, z], o);

  const basis = (axis: THREE.Vector3) => {
    const a = axis.clone().normalize();
    const ref = Math.abs(a.y) > 0.9 ? V(0, 0, 1) : V(0, 1, 0);
    const u = ref.clone().cross(a).normalize();
    const v = a.clone().cross(u);
    return { a, u, v };
  };
  const radial = (axis: THREE.Vector3, t: number) => {
    const { u, v } = basis(axis);
    return u.multiplyScalar(Math.cos(t)).addScaledVector(v, Math.sin(t));
  };
  const ringOf = (base: THREE.Vector3, axis: THREE.Vector3, y: number, rad: number, n = 14) => {
    const { a } = basis(axis);
    return catmull(
      Array.from({ length: n }, (_, i) =>
        base
          .clone()
          .addScaledVector(a, y)
          .addScaledVector(radial(axis, (i / n) * Math.PI * 2), rad),
      ),
      { closed: true },
    );
  };
  const band = (base: THREE.Vector3, axis: THREE.Vector3, y: number, rad: number, r: number, color: Fill, n = 14) =>
    b.sweep(ringOf(base, axis, y, rad, n), r, color, { sides: 6, bone: root });

  // ---- Gems (glowing, faceted) ----
  const gem = (
    at: number[] | THREE.Vector3,
    axis: number[] | THREE.Vector3,
    r: number,
    color: string,
    kind = 0,
    str = 0.45,
    bone = root,
  ) => {
    const outline: OutlinePoint[] =
      kind === 0
        ? [
            [0, -0.9 * r],
            [r, 0],
            [0.92 * r, 0.18 * r],
            [0.58 * r, 0.58 * r],
            [0, 0.58 * r],
          ]
        : [
            [0, -1.2 * r],
            [0.75 * r, -0.3 * r],
            [0.8 * r, 0.55 * r],
            [0.5 * r, 0.85 * r],
            [0, 0.85 * r],
          ];
    return glow(b.lathe(outline, { at, axis, segments: kind === 0 ? 8 : 6, bone, color }), str);
  };

  // ---- Coins: collected by colour and merged ----
  const coinGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.011, 9, 1);
  const buckets = new Map<string, THREE.BufferGeometry[]>();
  const m4 = new THREE.Matrix4();
  const addCoin = (pos: THREE.Vector3, n: THREE.Vector3, color: string, s = 1) => {
    m4.compose(pos, aim(n), new THREE.Vector3(s, s, s));
    const list = buckets.get(color) ?? [];
    list.push(coinGeo.clone().applyMatrix4(m4));
    buckets.set(color, list);
  };
  const floorCoin = (r: () => number, x: number, z: number, color: string, lift = 0) =>
    addCoin(V(x, G + 0.0056 + lift, z), V((r() - 0.5) * 0.3, 1, (r() - 0.5) * 0.3), color);

  // ---- Piles ----
  const surf = (p: Pile, ang: number, rad: number) => {
    const dx = Math.cos(ang) * rad * p.rx;
    const dz = Math.sin(ang) * rad * p.rz;
    const dy = p.h * Math.sqrt(Math.max(0, 1 - rad * rad));
    const n = V(dx / (p.rx * p.rx), dy / (p.h * p.h), dz / (p.rz * p.rz)).normalize();
    return { pos: V(p.cx + dx, p.y0 + dy, p.cz + dz), n };
  };
  const dome = (p: Pile, mat: Fill) =>
    put(new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat, [p.cx, p.y0 - 0.004, p.cz], {
      scale: [p.rx * 0.965, p.h * 0.93, p.rz * 0.965],
    });
  const fillPile = (p: Pile, count: number, seed: number, palette: string[], s = 1) => {
    const r = rng(seed);
    for (let i = 0; i < count; i++) {
      const sp = surf(p, r() * Math.PI * 2, Math.sqrt(r()) * 0.97);
      const jitter = V(r() - 0.5, r() - 0.5, r() - 0.5).multiplyScalar(0.8);
      const n = sp.n.clone().add(jitter).normalize();
      addCoin(sp.pos.clone().addScaledVector(sp.n, -0.004), n, palette[Math.floor(r() * palette.length)], s * (0.85 + r() * 0.3));
    }
  };
  const gemsOn = (p: Pile, count: number, seed: number, rMin: number, rMax: number) => {
    const r = rng(seed);
    for (let i = 0; i < count; i++) {
      const sp = surf(p, r() * Math.PI * 2, Math.sqrt(r()) * 0.9);
      const axis = sp.n.clone().add(V(r() - 0.5, r() - 0.5, r() - 0.5).multiplyScalar(0.6));
      const size = rMin + r() * (rMax - rMin);
      gem(sp.pos.clone().addScaledVector(sp.n, size * 0.2), axis, size, GEMS[(i + seed) % GEMS.length], i % 3 === 2 ? 1 : 0);
    }
  };

  // ================= DAIS =================
  b.lathe(
    [
      [0, 0],
      [1.36, 0],
      [1.36, 0.035],
      [1.29, G],
      [0, G],
    ],
    { at: [0, 0, 0], segments: 28, bone: root, color: STONE, name: "dais" },
  );
  band(V(0, 0, 0), V(0, 1, 0), G + 0.012, 1.3, 0.016, GOLD, 28);
  band(V(0, 0, 0), V(0, 1, 0), G + 0.01, 1.14, 0.008, BRASS, 28);
  const rune = svg(runeSvg(), { size: 1024 });
  glow(
    b.part(new THREE.CircleGeometry(1.22, 48), "#ffffff", {
      bone: root,
      at: [0, G + 0.004, 0],
      dir: [0, 1, 0],
      axis: "z",
      up: [0, 0, -1],
      texture: rune,
      name: "runes",
    }),
    0.9,
  );

  // Pylons
  const pylon: OutlinePoint[] = [
    [0, 0],
    [0.09, 0],
    [0.075, 0.06],
    [0.065, 0.2],
    [0.085, 0.23],
    [0.085, 0.26],
    [0, 0.26],
  ];
  const crystalOutline = (L: number, r: number): OutlinePoint[] => [
    [0, 0],
    [0.9 * r, 0.03],
    [r, 0.08 * L],
    [0.92 * r, 0.78 * L],
    [0, L],
  ];
  for (const deg of [120, 150, 180, 210]) {
    const a = (deg * Math.PI) / 180;
    const x = Math.sin(a) * 1.2;
    const z = Math.cos(a) * 1.2;
    b.lathe(pylon, { at: [x, G - 0.005, z], segments: 6, bone: root, color: STONE, name: "pylon" });
    band(V(x, G, z), V(0, 1, 0), 0.25, 0.08, 0.01, GOLD, 8);
    glow(
      b.lathe(crystalOutline(0.2, 0.045), { at: [x, G + 0.26, z], segments: 6, bone: root, color: CYAN }),
      0.5,
    );
  }

  // ================= CHEST =================
  // body walls
  box(W, H, 0.04, WOOD, 0, G + H / 2, CZ + D / 2 - 0.02);
  box(W, H, 0.04, WOOD, 0, G + H / 2, CZ - D / 2 + 0.02);
  for (const s of [1, -1]) box(0.04, H, D - 0.08, WOOD, s * (W / 2 - 0.02), G + H / 2, CZ);
  box(W - 0.08, 0.04, D - 0.08, WOOD, 0, G + 0.02, CZ);
  // lining
  const LH = H - 0.05;
  const LY = G + 0.04 + LH / 2;
  box(W - 0.1, LH, 0.008, VELVET, 0, LY, CZ - D / 2 + 0.044);
  box(W - 0.1, LH, 0.008, VELVET, 0, LY, CZ + D / 2 - 0.044);
  for (const s of [1, -1]) box(0.008, LH, D - 0.1, VELVET, s * (W / 2 - 0.044), LY, CZ);
  // filler under the heap
  box(W - 0.1, RIM - 0.07 - (G + 0.04), D - 0.1, "#b0690f", 0, (G + 0.04 + RIM - 0.07) / 2, CZ);
  // corner posts
  for (const sx of [1, -1])
    for (const sz of [1, -1])
      box(0.075, H + 0.012, 0.075, BRASS, sx * (W / 2 - 0.01), G + H / 2 + 0.006, CZ + sz * (D / 2 - 0.01));
  // bands
  for (const [y, h] of [
    [RIM - 0.035, 0.05],
    [G + 0.04, 0.06],
  ]) {
    box(W + 0.03, h, 0.02, BRASS, 0, y, CZ + D / 2 + 0.008);
    box(W + 0.03, h, 0.02, BRASS, 0, y, CZ - D / 2 - 0.008);
    for (const s of [1, -1]) box(0.02, h, D + 0.03, BRASS, s * (W / 2 + 0.008), y, CZ);
  }
  // straps
  for (const s of [1, -1]) box(0.09, H - 0.01, 0.016, BRASS, s * 0.27, G + H / 2, CZ + D / 2 + 0.01);
  // rivets (merged)
  const riv: THREE.BufferGeometry[] = [];
  const rivet = (x: number, y: number, z: number) =>
    riv.push(new THREE.SphereGeometry(0.011, 5, 4).translate(x, y, z));
  for (const sx of [1, -1])
    for (const yy of [0.08, 0.22, 0.36]) rivet(sx * (W / 2 - 0.01), G + yy, CZ + D / 2 + 0.0275);
  for (const sx of [1, -1])
    for (const yy of [0.1, 0.2, 0.3, 0.4])
      for (const dx of [-0.025, 0.025]) rivet(sx * 0.27 + dx, G + yy, CZ + D / 2 + 0.019);
  const rivMerged = mergeGeometries(riv);
  if (rivMerged) put(rivMerged, "#f7d36b", [0, 0, 0], { name: "rivets" });
  // lock plate
  const front = CZ + D / 2;
  box(0.16, 0.2, 0.02, BRASS, 0, RIM - 0.13, front + 0.012);
  put(new THREE.CylinderGeometry(0.016, 0.016, 0.012, 8), "#1c1030", [0, RIM - 0.165, front + 0.024], {
    dir: [0, 0, 1],
  });
  box(0.012, 0.045, 0.012, "#1c1030", 0, RIM - 0.2, front + 0.024);

  // heap in the chest
  const P0: Pile = { cx: 0, cz: CZ, rx: 0.4, rz: 0.22, h: 0.17, y0: RIM - 0.07 };
  dome(P0, DOME_G);
  fillPile(P0, 120, 11, GOLDS);
  gemsOn(P0, 7, 5, 0.026, 0.04);
  gem([0.02, RIM + 0.115, CZ + 0.02], [0.15, 1, 0.25], 0.075, CYAN, 0, 0.5);

  // ---- Lid ----
  const LU = 0.29;
  const lidPts: Array<[number, number]> = [
    [0, 0],
    [0.58, 0],
    [0.58, 0.05],
    [0.54, 0.14],
    [0.46, 0.2],
    [0.29, 0.235],
    [0.12, 0.2],
    [0.04, 0.14],
    [0, 0.05],
  ];
  const lidOutline: OutlinePoint[] = lidPts.map(([u, v]) => [u, v]);
  const ribOutline: OutlinePoint[] = lidPts.map(([u, v]) => [LU + (u - LU) * 1.045, v * 1.1 - 0.004]);
  b.extrude(lidOutline, {
    at: [0, RIM, HZ],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: W,
    bevel: 0.012,
    color: LIDWOOD,
    bone: lid,
    name: "lidShell",
  });
  const lidRiv: THREE.BufferGeometry[] = [];
  for (const xr of [-0.27, 0.27, -(W / 2 - 0.012), W / 2 - 0.012]) {
    const thick = Math.abs(xr) > 0.4 ? 0.05 : 0.07;
    b.extrude(ribOutline, {
      at: [xr, RIM, HZ],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: thick,
      bevel: 0.008,
      color: BRASS,
      bone: lid,
      name: "lidRib",
    });
    for (const [u, v] of lidPts.slice(3, 8)) {
      const uu = LU + (u - LU) * 1.045;
      const vv = v * 1.1 - 0.004;
      const len = Math.hypot(uu - LU, vv + 0.05) || 1;
      lidRiv.push(
        new THREE.SphereGeometry(0.011, 5, 4).translate(
          xr,
          RIM + vv + ((vv + 0.05) / len) * 0.008,
          HZ + uu + ((uu - LU) / len) * 0.008,
        ),
      );
    }
  }
  const lidRivMerged = mergeGeometries(lidRiv);
  if (lidRivMerged) put(lidRivMerged, "#f7d36b", [0, 0, 0], { bone: lid, name: "lidRivets" });
  box(W - 0.1, 0.012, D - 0.1, VELVET, 0, RIM - 0.006, CZ, { bone: lid });
  for (const s of [1, -1])
    put(new THREE.CylinderGeometry(0.028, 0.028, 0.1, 8), BRASS, [s * 0.3, RIM + 0.005, HZ - 0.005], {
      bone: lid,
      dir: [1, 0, 0],
    });
  box(0.12, 0.16, 0.02, BRASS, 0, RIM - 0.02, front + 0.034, { bone: lid });
  gem([0, RIM - 0.045, front + 0.046], [0, 0, 1], 0.035, CYAN, 0, 0.5, lid);
  put(new THREE.CylinderGeometry(0.1, 0.1, 0.02, 8), BRASS, [0, RIM + 0.226, CZ], { bone: lid });
  gem([0, RIM + 0.245, CZ], [0, 1, 0], 0.045, "#b650ff", 0, 0.5, lid);

  // ================= FLOOR PILES =================
  const P1: Pile = { cx: 0, cz: 0.28, rx: 0.6, rz: 0.4, h: 0.26, y0: G };
  const P2: Pile = { cx: -0.85, cz: 0.22, rx: 0.32, rz: 0.27, h: 0.13, y0: G };
  const P3: Pile = { cx: 0.9, cz: 0.35, rx: 0.28, rz: 0.26, h: 0.11, y0: G };
  dome(P1, DOME_G);
  dome(P2, DOME_G);
  dome(P3, DOME_S);
  fillPile(P1, 170, 21, GOLDS);
  fillPile(P2, 55, 22, GOLDS);
  fillPile(P3, 45, 23, SILVERS);
  gemsOn(P1, 12, 31, 0.025, 0.042);
  gemsOn(P2, 5, 32, 0.025, 0.035);
  gemsOn(P3, 4, 33, 0.025, 0.035);

  // Hero coins leaning on the piles
  const emblem = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#f6b52a"/>
    <circle cx="50" cy="50" r="44" fill="none" stroke="#fff1a8" stroke-width="5"/>
    <circle cx="50" cy="50" r="34" fill="none" stroke="#b4660f" stroke-width="4"/>
    <path d="M50 18 L58 42 L82 50 L58 58 L50 82 L42 58 L18 50 L42 42 Z" fill="#c97812"/>
    <path d="M50 26 L55 45 L50 50 Z" fill="#ffe27a"/><circle cx="50" cy="50" r="6" fill="#3ef0ff"/></svg>`,
    { size: 256 },
  );
  const heroCoins: Array<[number, number, number, number, number, number]> = [
    [0.22, 0.66, -0.15, 0.45, 0.88, 0],
    [-0.3, 0.6, 0.3, 0.5, 0.8, 0],
    [0.48, 0.5, 0.45, 0.5, 0.75, 0],
    [-0.5, 0.4, -0.55, 0.5, 0.7, 0],
  ];
  for (const [x, z, nx, ny, nz] of heroCoins) {
    const n = V(nx, ny, nz).normalize();
    const c = V(x, G + 0.07, z);
    put(new THREE.CylinderGeometry(0.07, 0.07, 0.014, 14), "#f2a81e", c, { dir: n });
    for (const sgn of [1, -1])
      put(new THREE.CircleGeometry(0.058, 16), "#ffffff", c.clone().addScaledVector(n, sgn * 0.0075), {
        dir: n.clone().multiplyScalar(sgn),
        axis: "z",
        texture: emblem,
      });
  }

  // Necklace over the front pile
  const neck: THREE.Vector3[] = [];
  for (let i = 0; i < 9; i++) {
    const a = ((15 + (i / 8) * 150) * Math.PI) / 180;
    const s = surf(P1, a, 0.62);
    neck.push(s.pos.clone().addScaledVector(s.n, 0.025));
  }
  const neckPath = catmull(neck);
  b.sweep(neckPath, 0.006, BRASS, { sides: 5, bone: root });
  const pearls: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 15; i++) {
    const p = neckPath.at((i + 0.5) / 15);
    pearls.push(new THREE.SphereGeometry(0.018, 6, 4).translate(p.x, p.y, p.z));
  }
  const pearlMerged = mergeGeometries(pearls);
  if (pearlMerged) put(pearlMerged, "#f6f1ff", [0, 0, 0], { name: "pearls" });
  const pm = neckPath.at(0.5);
  gem(pm.clone().add(V(0, 0.015, 0.01)), [0, 1, 0.5], 0.04, "#2f7bff", 0, 0.5);

  // ================= CROWN (on P2) =================
  const CC = V(P2.cx, G + 0.115, P2.cz);
  const UP = V(0, 1, 0);
  b.lathe(
    [
      [0.138, 0],
      [0.155, 0],
      [0.172, 0.105],
      [0.152, 0.105],
    ],
    { at: CC, segments: 16, bone: root, color: GOLD, name: "crownBand" },
  );
  b.lathe(
    [
      [0, 0.05],
      [0.145, 0.05],
      [0.135, 0.12],
      [0.1, 0.17],
      [0, 0.19],
    ],
    { at: CC, segments: 12, bone: root, color: VELVET, name: "crownCap" },
  );
  band(CC, UP, 0.012, 0.158, 0.009, BRASS, 16);
  band(CC, UP, 0.098, 0.168, 0.009, BRASS, 16);
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    const d = V(Math.sin(a), 0, Math.cos(a));
    const bez = put(new THREE.CylinderGeometry(0.03, 0.03, 0.012, 8), BRASS, CC.clone().addScaledVector(d, 0.166).add(V(0, 0.055, 0)), {
      dir: d,
    });
    void bez;
    gem(CC.clone().addScaledVector(d, 0.168).add(V(0, 0.055, 0)), d, 0.02, GEMS[k % 6], 0);
  }
  for (let k = 0; k < 8; k++) {
    const a = ((k + 0.5) / 8) * Math.PI * 2;
    const d = V(Math.sin(a), 0, Math.cos(a));
    const tall = k % 2 === 0;
    const hgt = tall ? 0.23 : 0.15;
    const p0 = CC.clone().addScaledVector(d, 0.158).add(V(0, 0.085, 0));
    const p1 = CC.clone().addScaledVector(d, 0.168).add(V(0, 0.085 + hgt * 0.55, 0));
    const p2 = CC.clone().addScaledVector(d, tall ? 0.202 : 0.19).add(V(0, 0.085 + hgt, 0));
    b.sweep(bezier(p0, p1, p2), [0.036, 0.011], GOLD, { caps: "flat", sides: 5, bone: root, name: "crownSpike" });
    gem(p2.clone().add(V(0, 0.012, 0)), UP.clone().addScaledVector(d, 0.5), tall ? 0.03 : 0.024, GEMS[(k + 2) % 6], k % 2);
  }
  const y0 = CC.y + 0.09;
  for (const axis of ["x", "z"] as const) {
    const pts = [
      [-0.15, 0],
      [-0.12, 0.08],
      [-0.06, 0.135],
      [0, 0.155],
      [0.06, 0.135],
      [0.12, 0.08],
      [0.15, 0],
    ].map(([t, h]) => (axis === "x" ? V(CC.x + t, y0 + h, CC.z) : V(CC.x, y0 + h, CC.z + t)));
    b.sweep(catmull(pts), 0.012, GOLD, { sides: 6, bone: root, name: "crownArch" });
  }
  put(new THREE.SphereGeometry(0.03, 7, 5), GOLD, [CC.x, y0 + 0.16, CC.z]);
  gem([CC.x, y0 + 0.2, CC.z], [0, 1, 0], 0.034, CYAN, 0, 0.55);

  // ================= GOBLETS =================
  const profileA: OutlinePoint[] = [
    [0, 0],
    [0.06, 0],
    [0.066, 0.012],
    [0.042, 0.03],
    [0.016, 0.05],
    [0.014, 0.11],
    [0.03, 0.125],
    [0.016, 0.14],
    [0.04, 0.158],
    [0.062, 0.2],
    [0.07, 0.26],
    [0.064, 0.3],
    [0.056, 0.3],
    [0.062, 0.26],
    [0.055, 0.2],
    [0.03, 0.165],
    [0, 0.16],
  ];
  const profileB: OutlinePoint[] = [
    [0, 0],
    [0.07, 0],
    [0.075, 0.012],
    [0.04, 0.03],
    [0.02, 0.06],
    [0.02, 0.09],
    [0.04, 0.1],
    [0.045, 0.13],
    [0.075, 0.17],
    [0.08, 0.22],
    [0.075, 0.26],
    [0.067, 0.26],
    [0.071, 0.22],
    [0.066, 0.17],
    [0.032, 0.135],
    [0, 0.13],
  ];
  const cup = (
    profile: OutlinePoint[],
    mat: Fill,
    base: THREE.Vector3,
    axis: THREE.Vector3,
    d: { topY: number; topR: number; footR: number; bandY: number; bandR: number; knobY: number; knobR: number; cols: string[]; gr: number },
  ) => {
    const { a } = basis(axis);
    b.lathe(profile, { at: base, axis, segments: 10, bone: root, color: mat, name: "goblet" });
    band(base, axis, d.topY, d.topR, 0.007, mat, 12);
    band(base, axis, 0.012, d.footR, 0.008, mat, 12);
    for (let i = 0; i < 6; i++) {
      const dir = radial(axis, (i / 6) * Math.PI * 2);
      gem(base.clone().addScaledVector(a, d.bandY).addScaledVector(dir, d.bandR), dir, d.gr, d.cols[i % d.cols.length], 0);
    }
    for (let i = 0; i < 4; i++) {
      const dir = radial(axis, ((i + 0.5) / 4) * Math.PI * 2);
      gem(base.clone().addScaledVector(a, d.knobY).addScaledVector(dir, d.knobR), dir, 0.011, GEMS[(i + 3) % 6], 1);
    }
  };

  // A: gold chalice, filled with a hero gem
  const baseA = V(0.98, G - 0.002, -0.22);
  cup(profileA, GOLD, baseA, UP, {
    topY: 0.3, topR: 0.06, footR: 0.063, bandY: 0.215, bandR: 0.067, knobY: 0.125, knobR: 0.03,
    cols: ["#ff2d5a", "#25e08c"], gr: 0.017,
  });
  put(new THREE.CylinderGeometry(0.054, 0.054, 0.012, 10), "#f2a81e", baseA.clone().add(V(0, 0.272, 0)));
  gem(baseA.clone().add(V(0, 0.29, 0)), UP, 0.032, CYAN, 0, 0.5);
  gem(baseA.clone().add(V(0.03, 0.285, 0.015)), [0.4, 1, 0.2], 0.018, "#ff2d5a", 1);
  gem(baseA.clone().add(V(-0.025, 0.285, -0.02)), [-0.4, 1, -0.2], 0.018, "#25e08c", 1);

  // B: silver cup on the silver pile, heaped with coins
  const baseB = V(P3.cx, G + P3.h - 0.012, P3.cz);
  cup(profileB, SILVER, baseB, UP, {
    topY: 0.26, topR: 0.071, footR: 0.072, bandY: 0.19, bandR: 0.0765, knobY: 0.095, knobR: 0.04,
    cols: ["#2f7bff", "#3ef0ff"], gr: 0.016,
  });
  put(new THREE.SphereGeometry(0.068, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), "#f2a81e", baseB.clone().add(V(0, 0.225, 0)), {
    scale: [1, 0.55, 1],
  });
  const rb = rng(41);
  for (let i = 0; i < 7; i++) {
    const ang = rb() * Math.PI * 2;
    const rr = Math.sqrt(rb()) * 0.055;
    const top = 0.225 + 0.0374 * Math.sqrt(Math.max(0, 1 - (rr / 0.068) ** 2));
    addCoin(
      baseB.clone().add(V(Math.cos(ang) * rr, top, Math.sin(ang) * rr)),
      V(Math.cos(ang) * 0.5, 1, Math.sin(ang) * 0.5),
      i % 2 ? "#ffc83a" : "#f2a81e",
      0.5,
    );
  }
  gem(baseB.clone().add(V(0.01, 0.275, 0)), [0.2, 1, 0.1], 0.026, "#ff2d5a", 0, 0.5);

  // C: jewelled cup tipped over, spilling coins
  const dirC = V(-0.75, 0.015, -0.55).normalize();
  const baseC = V(-0.4, G + 0.066, 0.85);
  cup(profileA, BRASS, baseC, dirC, {
    topY: 0.3, topR: 0.06, footR: 0.063, bandY: 0.215, bandR: 0.067, knobY: 0.125, knobR: 0.03,
    cols: ["#b650ff", "#ffc233"], gr: 0.017,
  });
  const mouth = baseC.clone().addScaledVector(dirC, 0.3);
  const ah = V(dirC.x, 0, dirC.z).normalize();
  const side = V(-ah.z, 0, ah.x);
  const rc = rng(51);
  for (let i = 0; i < 24; i++) {
    const s = 0.04 + rc() * 0.3;
    const p = mouth.clone().addScaledVector(ah, s).addScaledVector(side, (rc() - 0.5) * (0.08 + 0.6 * s));
    floorCoin(rc, p.x, p.z, GOLDS[Math.floor(rc() * GOLDS.length)], rc() < 0.25 ? 0.0115 : 0);
  }

  // ================= EXTRAS =================
  // coin stacks
  const rs = rng(61);
  const stacks: Array<[number, number, number, string[]]> = [
    [-0.18, 0.95, 8, ["#ffc83a", "#f2a81e"]],
    [-0.04, 1.02, 5, ["#cfd8e8", "#a9b6d0"]],
    [0.12, 0.93, 6, ["#ffe27a", "#ffc83a"]],
  ];
  for (const [x, z, n, cols] of stacks)
    for (let i = 0; i < n; i++)
      addCoin(V(x + (rs() - 0.5) * 0.012, G + 0.0058 + i * 0.0116, z + (rs() - 0.5) * 0.012), UP, cols[i % cols.length]);

  // pouch with spill
  const pouch: OutlinePoint[] = [
    [0, 0],
    [0.1, 0],
    [0.13, 0.05],
    [0.12, 0.11],
    [0.07, 0.17],
    [0.035, 0.2],
    [0.05, 0.235],
    [0.075, 0.27],
    [0.065, 0.272],
    [0.03, 0.245],
    [0, 0.2],
  ];
  const PP = V(0.62, G - 0.003, 0.98);
  b.lathe(pouch, { at: PP, segments: 10, bone: root, color: LEATHER, name: "pouch" });
  band(PP, UP, 0.2, 0.04, 0.01, "#d63a4a", 10);
  for (let i = 0; i < 3; i++)
    addCoin(PP.clone().add(V((i - 1) * 0.02, 0.265 + i * 0.006, 0.01 * i)), V((i - 1) * 0.5, 1, 0.3), "#ffc83a", 0.8);
  for (let i = 0; i < 12; i++) {
    const a = Math.PI * (0.85 + 0.65 * rs());
    const rr = 0.13 + rs() * 0.17;
    floorCoin(rs, PP.x + Math.cos(a) * rr, PP.z + Math.sin(a) * rr, GOLDS[Math.floor(rs() * GOLDS.length)], rs() < 0.2 ? 0.0115 : 0);
  }

  // ingots
  const ingot: OutlinePoint[] = [
    [0, 0],
    [0.22, 0],
    [0.19, 0.06],
    [0.03, 0.06],
  ];
  const IX = -0.78;
  const IZ = -0.2;
  for (const [dz, y] of [
    [-0.1, 0],
    [0, 0],
    [0.1, 0],
    [-0.05, 0.06],
    [0.05, 0.06],
    [0, 0.12],
  ]) {
    b.extrude(ingot, {
      at: [IX - 0.11, G + y, IZ + dz],
      x: [1, 0, 0],
      thickness: 0.09,
      bevel: 0.01,
      color: GOLD,
      bone: root,
      name: "ingot",
    });
  }

  // crystal cluster
  put(new THREE.SphereGeometry(0.2, 7, 4), STONE, [-0.95, G - 0.005, -0.5], { scale: [1, 0.4, 1] });
  const crystals: Array<[number, number, number, number, number[], string]> = [
    [-0.95, -0.5, 0.075, 0.62, [0.1, 1, 0.05], "#36e6ff"],
    [-1.05, -0.38, 0.05, 0.38, [-0.35, 1, 0.2], "#8ff6ff"],
    [-0.82, -0.58, 0.055, 0.42, [0.4, 1, -0.2], "#b45cff"],
    [-1.1, -0.3, 0.04, 0.26, [0.1, 1, 0.6], "#36e6ff"],
    [-1.02, -0.58, 0.045, 0.3, [-0.5, 1, -0.3], "#b45cff"],
  ];
  for (const [x, z, r, L, axis, color] of crystals)
    glow(b.lathe(crystalOutline(L, r), { at: [x, G + 0.01, z], axis, segments: 6, bone: root, color }), 0.5);

  // loose gems on the dais
  const loose: Array<[number, number, string, number, number]> = [
    [0.45, 0.82, "#ff2d5a", 0.04, 0],
    [0.3, 0.78, "#25e08c", 0.03, 1],
    [-0.2, 0.8, "#2f7bff", 0.035, 0],
    [0.85, 0.7, "#b650ff", 0.035, 1],
    [0.75, -0.5, "#ffc233", 0.035, 0],
    [0.65, -0.18, "#b650ff", 0.035, 0],
  ];
  const rl = rng(71);
  for (const [x, z, color, r, kind] of loose) {
    const axis = V(rl() - 0.5, 0.15, rl() - 0.5);
    if (kind === 0) gem([x, G + r * 0.9, z], axis, r, color, 0);
    else
      glow(
        put(new THREE.OctahedronGeometry(r), color, [x, G + r * 0.9, z], {
          rotation: [rl() * 90, rl() * 90, rl() * 90],
          flat: true,
        }),
        0.45,
      );
  }

  // floor coins scattered around the front
  const rf = rng(81);
  for (let i = 0; i < 14; i++) {
    const a = rf() * Math.PI * 2;
    const rr = 0.75 + rf() * 0.35;
    const x = Math.cos(a) * rr;
    const z = Math.sin(a) * rr;
    if (Math.hypot(x, z) > 1.15 || z < 0.7) continue;
    floorCoin(rf, x, z, GOLDS[Math.floor(rf() * GOLDS.length)]);
  }

  // sparkles
  const star = svg(
    `<svg viewBox="0 0 64 64"><path d="M32 2 Q35 29 62 32 Q35 35 32 62 Q29 35 2 32 Q29 29 32 2Z" fill="#fff3b0"/></svg>`,
    { size: 128 },
  );
  const spark: Array<[number, number, number, number]> = [
    [0.02, RIM + 0.3, CZ, 0.22],
    [CC.x, CC.y + 0.5, CC.z, 0.2],
    [0.98, G + 0.42, -0.22, 0.18],
    [0.15, G + 0.37, 0.3, 0.18],
    [0.9, G + 0.5, 0.35, 0.2],
    [-0.95, G + 0.78, -0.5, 0.2],
    [0.62, G + 0.38, 0.98, 0.14],
    [IX, G + 0.28, IZ, 0.14],
  ];
  for (const [x, y, z, s] of spark)
    glow(
      b.cards([frame([x, y - s / 2, z], [0, 1, 0])], star, {
        size: s,
        flow: [0, 0, 1],
        cross: true,
        sink: 0,
        bone: root,
        name: "sparkle",
      }),
      1,
    );

  // merge coins by colour
  for (const [color, list] of buckets) {
    const merged = mergeGeometries(list);
    if (merged) put(merged, color, [0, 0, 0], { flat: true, name: "coins" });
  }

  // open the chest
  b.pose(lid, { axis: [1, 0, 0], deg: -105 });
  return b.root;
}
