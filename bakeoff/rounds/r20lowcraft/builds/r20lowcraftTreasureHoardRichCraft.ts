// Dragon's Hoard: an open chest spilling gold, crown, goblets, glowing gems and hextech-style crystal clusters.
// League of Legends look: chunky exaggerated shapes, cel-shaded golds against deep violet stone, saturated glowing gems.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import { rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { grain, mottle, noise, paint, scales } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { cel, INK } from "../../../../kits/toon";

export const meta = {
  name: "Dragon's Hoard",
  description:
    "A treasure hoard: open iron-banded chest with glowing runes, mounds of coins, a jewelled crown, goblets, a gem-stuffed sack, pearls, a key and glowing crystal clusters on a magic-circle floor.",
  style: "League of Legends",
  commit: "88fc1f0",
};

type V = [number, number, number];
type Fill = string | Paint;
const D = Math.PI / 180;
const Y_UP = new THREE.Vector3(0, 1, 0);
const Z_AX = new THREE.Vector3(0, 0, 1);
const F = 0.04; // floor top

// ---------------------------------------------------------------- palette
const GOLD = cel(mottle("#ffc931", "#ffe27a", { size: 0.06, contrast: 0.8 }), "#d9791c");
const GOLD_B = cel("#ffd95a", "#e59a24");
const GOLD_D = cel("#c98a1e", "#8d4f14");
const MOUND = cel(mottle("#cf8a1c", "#f2b53a", { size: 0.08 }), "#8e4d14");
const SILVER = cel("#e6eeff", "#9fb0d8");
const STEEL = cel(mottle("#5b6ca3", "#6f82bd", { size: 0.05 }), "#38436e");
const STEEL_D = cel("#3c4670", "#232948");
const VELVET = cel("#c0244a", "#7a1233");
const PEARL = cel("#fff6ee", "#d3bfe4");
const STONE = cel(scales(["#3d3768", "#463f77", "#352f5c"], "#1f1a3a", { size: 0.2, width: 0.14 }), "#241f45");
const SACK = cel(grain("#c9a46a", "#a98349", { size: 0.01, axis: "y" }), "#7d5a35");
const ROPE = cel("#ead6a4", "#b8975a");
const PATCH = cel("#8c6a3f", "#5a4126");
const plank = (a: string, c: string, line: string) =>
  cel(
    paint((p, n) => {
      const k = Math.abs(n.y) > 0.6 ? p.z : p.y;
      const f = (((k / 0.075) % 1) + 1) % 1;
      if (f < 0.06) return line;
      return noise(p, 0.07, 4) > 0.5 ? a : c;
    }),
  );
const WOOD = plank("#8a4a30", "#9c5a38", "#3a1c2a");
const WOOD_D = cel("#5a2c2e", "#34162a");

const RUBY = "#ff2f5a";
const SAPPHIRE = "#2fb7ff";
const EMERALD = "#2fe39a";
const AMETHYST = "#b65cff";
const TOPAZ = "#ffb82f";
const GEMS = [RUBY, SAPPHIRE, EMERALD, AMETHYST, TOPAZ];

// ---------------------------------------------------------------- drawings
const COIN_TEX = svg(
  `<svg viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="47" fill="#ffd95a" stroke="#a85a0f" stroke-width="5"/>
    <circle cx="50" cy="50" r="36" fill="#f5b52e" stroke="#b8650f" stroke-width="3"/>
    <polygon points="50,20 58,42 80,42 62,56 69,78 50,64 31,78 38,56 20,42 42,42" fill="#fff0a0" stroke="#a85a0f" stroke-width="3" stroke-linejoin="round"/>
    <circle cx="50" cy="50" r="6" fill="#c0244a" stroke="${INK}" stroke-width="2"/>
  </svg>`,
  { size: 256 },
);

const KEYHOLE_TEX = svg(
  `<svg viewBox="0 0 40 60">
    <circle cx="20" cy="20" r="11" fill="${INK}"/>
    <polygon points="14,26 26,26 31,54 9,54" fill="${INK}"/>
  </svg>`,
  { size: 128 },
);

const runePaths = (() => {
  let d = "";
  for (let i = 0; i < 9; i++) {
    const x = 14 + i * 21;
    d += `M${x} 4 L${x} 20 M${x - 5} ${6 + (i % 3) * 3} L${x + 5} ${12 + (i % 2) * 4} `;
  }
  return d;
})();
const RUNE_TEX = svg(
  `<svg viewBox="0 0 200 24"><path d="${runePaths}" stroke="#5ff3ff" stroke-width="3" stroke-linecap="round" fill="none"/></svg>`,
  { size: 1024 },
);

const circleTicks = (() => {
  let d = "";
  for (let i = 0; i < 24; i++) {
    const a = (i * 15 * Math.PI) / 180;
    d += `M${100 + 80 * Math.cos(a)} ${100 + 80 * Math.sin(a)} L${100 + 95 * Math.cos(a)} ${100 + 95 * Math.sin(a)} `;
  }
  return d;
})();
const star = (() => {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (i * 60 * Math.PI) / 180;
    pts.push(`${100 + 62 * Math.cos(a)},${100 + 62 * Math.sin(a)}`);
  }
  return pts.join(" ");
})();
const CIRCLE_TEX = svg(
  `<svg viewBox="0 0 200 200" fill="none" stroke="#4fe6ff" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="100" cy="100" r="96" stroke-width="2.4"/>
    <circle cx="100" cy="100" r="78" stroke-width="1.6"/>
    <circle cx="100" cy="100" r="40" stroke-width="1.6"/>
    <path d="${circleTicks}" stroke-width="1.8"/>
    <polygon points="${star}" stroke-width="1.8"/>
    <polygon points="${star}" stroke-width="1.8" transform="rotate(30 100 100)"/>
  </svg>`,
  { size: 1024 },
);

const ni = (g: THREE.BufferGeometry) => (g.index ? g.toNonIndexed() : g);

export default function build() {
  const b = createBuilder({ name: "treasureHoard" });
  const R = rng(11);
  const root = b.joint("root", { at: [0, 0, 0] });
  const lid = b.joint("lid", { parent: root, at: [0, 0.38, -0.53], dir: [0, 0, 1], role: "hinge" });

  // ------------------------------------------------------------ batches (merged per colour)
  const gemBatch = new Map<string, THREE.BufferGeometry[]>();
  const coinBatch: THREE.BufferGeometry[][] = [[], [], []];
  const COIN_COL: Fill[] = [GOLD, GOLD_B, SILVER];
  const pearlBatch: THREE.BufferGeometry[] = [];
  const rivetBatch: THREE.BufferGeometry[] = [];
  const lidRivetBatch: THREE.BufferGeometry[] = [];
  const addTo = (m: Map<string, THREE.BufferGeometry[]>, key: string, g: THREE.BufferGeometry) => {
    const list = m.get(key) ?? [];
    list.push(g);
    m.set(key, list);
  };
  const compose = (at: THREE.Vector3, q: THREE.Quaternion, s: THREE.Vector3) =>
    new THREE.Matrix4().compose(at, q, s);
  const eul = (r: V) => new THREE.Quaternion().setFromEuler(new THREE.Euler(r[0] * D, r[1] * D, r[2] * D));

  function gem(color: string, kind: number, at: THREE.Vector3, size: number, q: THREE.Quaternion, stretch = 1) {
    const g =
      kind === 0
        ? new THREE.OctahedronGeometry(1)
        : kind === 1
          ? new THREE.IcosahedronGeometry(1)
          : kind === 2
            ? new THREE.DodecahedronGeometry(1)
            : new THREE.TetrahedronGeometry(1);
    g.applyMatrix4(compose(at, q, new THREE.Vector3(size, size * stretch, size)));
    addTo(gemBatch, color, g);
  }

  function crystal(color: string, base: V, h: number, r: number, tilt: V) {
    const q = eul(tilt);
    const pos = new THREE.Vector3(base[0], base[1], base[2]);
    const shaft = ni(new THREE.CylinderGeometry(r * 0.85, r, h * 0.7, 6));
    shaft.translate(0, h * 0.35, 0);
    const tip = ni(new THREE.ConeGeometry(r * 0.85, h * 0.3, 6));
    tip.translate(0, h * 0.7 + h * 0.15, 0);
    for (const g of [shaft, tip]) {
      g.applyMatrix4(compose(pos, q, new THREE.Vector3(1, 1, 1)));
      addTo(gemBatch, color, g);
    }
  }

  function coin(at: THREE.Vector3, q: THREE.Quaternion, s: number, ci: number) {
    const g = new THREE.CylinderGeometry(0.05, 0.05, 0.012, 9);
    g.applyMatrix4(compose(at, q, new THREE.Vector3(s, s, s)));
    coinBatch[ci].push(g);
  }

  const rivet = (p: V, onLid = false) => {
    const g = new THREE.SphereGeometry(0.011, 5, 4).translate(p[0], p[1], p[2]);
    (onLid ? lidRivetBatch : rivetBatch).push(g);
  };

  // A local frame: place things relative to a group position / tilt / scale.
  function makeFrame(pos: V, rot: V = [0, 0, 0], scale = 1) {
    const gq = eul(rot);
    const gp = new THREE.Vector3(pos[0], pos[1], pos[2]);
    const lp = (p: V) => new THREE.Vector3(p[0] * scale, p[1] * scale, p[2] * scale).applyQuaternion(gq).add(gp);
    const lq = (r: V) => gq.clone().multiply(eul(r));
    return {
      lp,
      lq,
      put(geo: THREE.BufferGeometry, color: Fill, p: V, r: V = [0, 0, 0], sc: V = [1, 1, 1], flat = true) {
        return b.part(geo, color, {
          bone: root,
          at: lp(p),
          quat: lq(r),
          scale: [sc[0] * scale, sc[1] * scale, sc[2] * scale],
          flat,
        });
      },
      lathe(outline: Array<[number, number]>, p: V, r: V, color: Fill, seg = 12) {
        const axis = Y_UP.clone().applyQuaternion(lq(r));
        return b.lathe(
          outline.map(([x, y]) => [x * scale, y * scale] as [number, number]),
          { at: lp(p), axis: [axis.x, axis.y, axis.z], segments: seg, color, bone: root },
        );
      },
    };
  }
  const W = makeFrame([0, 0, 0]);

  // ------------------------------------------------------------ floor
  W.put(new THREE.CylinderGeometry(1.2, 1.25, F, 14), STONE, [0, F / 2, 0]);
  W.put(new THREE.TorusGeometry(1.2, 0.02, 4, 28), GOLD_D, [0, F, 0], [90, 0, 0]);
  glow(
    b.part(new THREE.PlaneGeometry(2.2, 2.2), "#ffffff", {
      bone: root,
      at: [0, F + 0.006, 0],
      dir: [0, 1, 0],
      axis: "z",
      texture: CIRCLE_TEX,
    }),
    0.8,
  );

  // ------------------------------------------------------------ chest
  const CZ = -0.3;
  W.put(new THREE.BoxGeometry(0.8, 0.35, 0.46), WOOD, [0, 0.205, CZ], [0, 0, 0], [1, 1, 1], false);
  W.put(new THREE.BoxGeometry(0.84, 0.05, 0.5), STEEL_D, [0, 0.055, CZ]);
  for (const s of [1, -1]) {
    W.put(new THREE.BoxGeometry(0.07, 0.352, 0.48), STEEL, [s * 0.26, 0.205, CZ]);
    for (const z of [-0.07, -0.53]) W.put(new THREE.BoxGeometry(0.05, 0.37, 0.05), STEEL_D, [s * 0.4, 0.205, z]);
    for (const y of [0.09, 0.18, 0.27, 0.34]) {
      rivet([s * 0.26 - 0.02, y, -0.059]);
      rivet([s * 0.26 + 0.02, y, -0.059]);
    }
    for (const y of [0.1, 0.3]) rivet([s * 0.4, y, -0.043]);
  }
  // rims and lining
  for (const z of [-0.09, -0.51]) W.put(new THREE.BoxGeometry(0.82, 0.03, 0.04), WOOD_D, [0, 0.395, z]);
  for (const s of [1, -1]) W.put(new THREE.BoxGeometry(0.04, 0.03, 0.38), WOOD_D, [s * 0.39, 0.395, CZ]);
  W.put(new THREE.BoxGeometry(0.74, 0.01, 0.42), VELVET, [0, 0.384, CZ]);
  const chestGold = W.put(
    new THREE.SphereGeometry(1, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2),
    MOUND,
    [0, 0.385, CZ],
    [0, 0, 0],
    [0.34, 0.17, 0.17],
  );
  // lock plate, keyhole, runes
  W.put(new THREE.BoxGeometry(0.14, 0.17, 0.03), GOLD, [0, 0.26, -0.058]);
  for (const [x, y] of [
    [-0.05, 0.19],
    [0.05, 0.19],
    [-0.05, 0.33],
    [0.05, 0.33],
  ])
    rivet([x, y, -0.042]);
  b.part(new THREE.PlaneGeometry(0.06, 0.09), "#ffffff", {
    bone: root,
    at: [0, 0.24, -0.0425],
    dir: [0, 0, 1],
    axis: "z",
    texture: KEYHOLE_TEX,
  });
  glow(
    b.part(new THREE.PlaneGeometry(0.44, 0.05), "#ffffff", {
      bone: root,
      at: [0, 0.1, -0.0685],
      dir: [0, 0, 1],
      axis: "z",
      texture: RUNE_TEX,
    }),
    1,
  );
  gem(RUBY, 0, new THREE.Vector3(0, 0.345, -0.04), 0.024, new THREE.Quaternion(), 1.3);

  // lid (built closed, hinged open at the end)
  b.part(new THREE.CylinderGeometry(0.235, 0.235, 0.82, 10, 1, false, 0, Math.PI), WOOD, {
    bone: lid,
    at: [0, 0.38, CZ],
    rotation: [0, 0, 90],
    flat: true,
  });
  b.part(new THREE.BoxGeometry(0.8, 0.012, 0.46), VELVET, { bone: lid, at: [0, 0.384, CZ] });
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.242, 0.242, 0.075, 10, 1, false, 0, Math.PI), STEEL, {
      bone: lid,
      at: [s * 0.26, 0.38, CZ],
      rotation: [0, 0, 90],
      flat: true,
    });
    for (const a of [-60, -30, 0, 30, 60]) {
      const ar = a * D;
      for (const dx of [-0.02, 0.02])
        rivet([s * 0.26 + dx, 0.38 + 0.247 * Math.cos(ar), CZ + 0.247 * Math.sin(ar)], true);
    }
  }
  for (const z of [-0.065, -0.535])
    b.part(new THREE.BoxGeometry(0.84, 0.04, 0.03), STEEL_D, { bone: lid, at: [0, 0.385, z], flat: true });
  // lid gems in gold settings
  for (const [x, col, size] of [
    [0, RUBY, 0.045],
    [-0.14, SAPPHIRE, 0.032],
    [0.14, EMERALD, 0.032],
  ] as Array<[number, string, number]>) {
    const phi = 30 * D;
    const n = new THREE.Vector3(0, Math.cos(phi), Math.sin(phi));
    const at = new THREE.Vector3(x, 0.38 + 0.245 * Math.cos(phi), CZ + 0.245 * Math.sin(phi));
    glow(
      b.part(new THREE.OctahedronGeometry(size), col, {
        bone: lid,
        at: at.clone().addScaledVector(n, 0.012),
        quat: new THREE.Quaternion().setFromUnitVectors(Y_UP, n),
        scale: [1, 1.3, 1],
        flat: true,
      }),
      0.5,
    );
    b.part(new THREE.TorusGeometry(size * 1.1, 0.011, 5, 8), GOLD, {
      bone: lid,
      at,
      quat: new THREE.Quaternion().setFromUnitVectors(Z_AX, n),
      flat: true,
    });
  }

  // ------------------------------------------------------------ mounds
  type PartT = ReturnType<typeof b.part>;
  function mound(x: number, z: number, rx: number, h: number, rz: number): PartT {
    return b.part(new THREE.SphereGeometry(1, 14, 7, 0, Math.PI * 2, 0, Math.PI / 2), MOUND, {
      bone: root,
      at: [x, F, z],
      scale: [rx, h, rz],
      flat: true,
    });
  }
  const mainM = mound(0, 0.34, 0.62, 0.26, 0.38);
  const leftM = mound(-0.62, 0.02, 0.3, 0.2, 0.26);
  const rightM = mound(0.62, 0.0, 0.28, 0.22, 0.26);

  function pile(target: PartT, count: number, minDist: number, tiltMax: number) {
    const hits = b.surface(target).scatter(count, { rng: R, minDist, filter: (h) => h.n.y > 0.2 });
    for (const h of hits) {
      const n = h.n.clone().normalize();
      const q = new THREE.Quaternion().setFromUnitVectors(Y_UP, n);
      q.multiply(
        new THREE.Quaternion().setFromEuler(
          new THREE.Euler((R() - 0.5) * tiltMax, R() * 6.28, (R() - 0.5) * tiltMax),
        ),
      );
      const r = R();
      coin(h.at.clone().addScaledVector(n, 0.002), q, 0.85 + R() * 0.35, r < 0.55 ? 0 : r < 0.85 ? 1 : 2);
    }
  }
  let gi = 0;
  function gemsOn(target: PartT, count: number, minDist: number, sMin: number, sMax: number) {
    const hits = b.surface(target).scatter(count, { rng: R, minDist, filter: (h) => h.n.y > 0.35 });
    for (const h of hits) {
      const n = h.n.clone().normalize();
      const size = sMin + R() * (sMax - sMin);
      const q = eul([R() * 360, R() * 360, R() * 360]);
      gem(GEMS[gi++ % GEMS.length], Math.floor(R() * 4), h.at.clone().addScaledVector(n, size * 0.4), size, q, 1.2);
    }
  }
  pile(mainM, 150, 0.05, 1.6);
  pile(leftM, 55, 0.05, 1.5);
  pile(rightM, 60, 0.05, 1.5);
  pile(chestGold, 55, 0.05, 1.2);
  gemsOn(mainM, 10, 0.12, 0.026, 0.05);
  gemsOn(leftM, 5, 0.12, 0.024, 0.04);
  gemsOn(rightM, 5, 0.12, 0.024, 0.04);
  gemsOn(chestGold, 6, 0.1, 0.024, 0.04);

  // floor coins: spill trail from the tipped goblet and scattered strays
  const floorCoin = (x: number, z: number) => {
    const q = new THREE.Quaternion().setFromEuler(
      new THREE.Euler((R() - 0.5) * 0.3, R() * 6.28, (R() - 0.5) * 0.3),
    );
    const r = R();
    coin(new THREE.Vector3(x, F + 0.007, z), q, 0.9 + R() * 0.3, r < 0.55 ? 0 : r < 0.85 ? 1 : 2);
  };
  for (let i = 0; i < 12; i++) {
    const t = i / 11;
    floorCoin(-0.5 + t * 0.4 + (R() - 0.5) * 0.1, 0.64 + t * 0.14 + (R() - 0.5) * 0.14);
  }
  for (let i = 0; i < 18; i++) {
    const a = R() * Math.PI * 2;
    const r = 0.88 + R() * 0.22;
    floorCoin(Math.sin(a) * r, Math.cos(a) * r);
  }
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.4;
    const r = 0.95 + R() * 0.1;
    gem(GEMS[i % 5], i % 4, new THREE.Vector3(Math.sin(a) * r, F + 0.02, Math.cos(a) * r), 0.026, eul([R() * 360, R() * 360, 0]), 1.2);
  }

  // hero coins leaning on the mounds
  for (const [x, z, yaw] of [
    [-0.2, 0.84, 8],
    [0.3, 0.82, -10],
    [0.57, 0.3, -14],
  ]) {
    const f = makeFrame([x, F + 0.07, z], [75, 0, yaw]);
    f.put(new THREE.CylinderGeometry(0.075, 0.075, 0.02, 14), GOLD_D, [0, 0, 0]);
    f.put(new THREE.CircleGeometry(0.066, 14), "#ffffff", [0, 0.0105, 0], [-90, 0, 0], [1, 1, 1], false).mesh.userData.hero = 1;
    f.put(new THREE.CircleGeometry(0.066, 14), "#ffffff", [0, -0.0105, 0], [90, 0, 0], [1, 1, 1], false);
  }

  // ------------------------------------------------------------ crown
  {
    const cf = makeFrame([0.02, F + 0.26, 0.38], [-16, 15, 5], 1.3);
    cf.lathe([[0.108, 0], [0.126, 0], [0.126, 0.075], [0.108, 0.075]], [0, 0, 0], [0, 0, 0], GOLD, 14);
    cf.lathe([[0, 0.045], [0.104, 0.045], [0.104, 0.085], [0.07, 0.125], [0, 0.14]], [0, 0, 0], [0, 0, 0], VELVET, 10);
    cf.put(new THREE.TorusGeometry(0.126, 0.007, 4, 16), GOLD_D, [0, 0.005, 0], [90, 0, 0]);
    cf.put(new THREE.TorusGeometry(0.126, 0.007, 4, 16), GOLD_D, [0, 0.074, 0], [90, 0, 0]);
    for (let i = 0; i < 8; i++) {
      const a = i * 45;
      const ar = a * D;
      const x = 0.117 * Math.sin(ar);
      const z = 0.117 * Math.cos(ar);
      const tall = i % 2 === 0;
      if (tall) {
        cf.put(new THREE.ConeGeometry(0.036, 0.14, 4), GOLD, [x, 0.14, z], [0, a + 45, 0]);
        gem(i % 4 === 0 ? RUBY : SAPPHIRE, 0, cf.lp([x, 0.222, z]), 0.026, cf.lq([0, a, 0]), 1.4);
      } else {
        cf.put(new THREE.ConeGeometry(0.03, 0.085, 4), GOLD, [x, 0.112, z], [0, a + 45, 0]);
        pearlBatch.push(new THREE.SphereGeometry(0.0155, 6, 5).translate(...cf.lp([x, 0.162, z]).toArray()));
      }
      const gx = 0.128 * Math.sin(ar + 0.39);
      const gz = 0.128 * Math.cos(ar + 0.39);
      gem(GEMS[(i + 1) % 3 === 0 ? 2 : i % 2 ? 1 : 0], 0, cf.lp([gx, 0.04, gz]), 0.022, cf.lq([0, a, 0]), 1.3);
    }
  }

  // ------------------------------------------------------------ goblets
  function goblet(pos: V, rot: V, k: number, col: string, fill: boolean) {
    const f = makeFrame(pos, rot, k);
    f.lathe(
      [[0, 0], [0.06, 0], [0.062, 0.012], [0.022, 0.035], [0.02, 0.1], [0.036, 0.118], [0.036, 0.128], [0.068, 0.17], [0.075, 0.24], [0.072, 0.262], [0.064, 0.262], [0.06, 0.18], [0, 0.15]],
      [0, 0, 0],
      [0, 0, 0],
      GOLD,
      14,
    );
    f.put(new THREE.TorusGeometry(0.07, 0.007, 4, 14), GOLD_D, [0, 0.262, 0], [90, 0, 0]);
    f.put(new THREE.TorusGeometry(0.06, 0.008, 4, 14), GOLD_D, [0, 0.009, 0], [90, 0, 0]);
    f.put(new THREE.TorusGeometry(0.03, 0.013, 5, 10), GOLD_D, [0, 0.062, 0], [90, 0, 0]);
    for (let i = 0; i < 6; i++) {
      const a = i * 60;
      const ar = a * D;
      gem(col, 0, f.lp([0.0745 * Math.sin(ar), 0.205, 0.0745 * Math.cos(ar)]), 0.014 * k, f.lq([0, a, 0]), 1.5);
    }
    if (fill)
      f.put(new THREE.SphereGeometry(0.058, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), GOLD_B, [0, 0.24, 0], [0, 0, 0], [1, 0.8, 1]);
  }
  goblet([0.55, F, 0.7], [0, 0, 0], 1.3, RUBY, true);
  goblet([-0.62, F + 0.19, 0.02], [0, 0, 6], 0.8, SAPPHIRE, true);
  goblet([-0.85, F + 0.155, 0.62], [0, 0, -100], 1.3, EMERALD, false);

  // ------------------------------------------------------------ sack
  {
    const f = makeFrame([0.9, F, 0.42], [0, 20, 0]);
    f.lathe([[0, 0], [0.13, 0], [0.18, 0.07], [0.17, 0.16], [0.1, 0.25], [0.065, 0.29], [0, 0.29]], [0, 0, 0], [0, 0, 0], SACK, 10);
    f.put(new THREE.TorusGeometry(0.07, 0.012, 4, 10), ROPE, [0, 0.275, 0], [90, 0, 0]);
    f.put(new THREE.ConeGeometry(0.115, 0.09, 10), SACK, [0, 0.33, 0], [180, 0, 0]);
    f.put(new THREE.SphereGeometry(0.09, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), GOLD_B, [0, 0.36, 0], [0, 0, 0], [1, 0.7, 1]);
    f.put(new THREE.BoxGeometry(0.1, 0.1, 0.012), PATCH, [0, 0.11, 0.172], [-8, 0, 0]);
    f.put(new THREE.TorusGeometry(0.05, 0.005, 4, 8), ROPE, [0, 0.11, 0.18], [-8, 0, 0]);
    for (const [x, z, h] of [
      [0.03, 0.02, 0.4],
      [-0.04, -0.02, 0.4],
    ] as Array<[number, number, number]>)
      gem(h > 0.3 ? RUBY : TOPAZ, 0, f.lp([x, 0.43, z]), 0.032, eul([20, 40, 10]), 1.3);
    gem(EMERALD, 1, f.lp([0.07, 0.4, 0.03]), 0.026, eul([40, 10, 30]), 1.1);
  }

  // ------------------------------------------------------------ key
  {
    const f = makeFrame([0.15, F + 0.011, 0.98], [0, 35, 0]);
    f.put(new THREE.TorusGeometry(0.04, 0.011, 5, 10), GOLD, [0, 0, -0.07], [90, 0, 0]);
    f.put(new THREE.CylinderGeometry(0.008, 0.008, 0.16, 6), GOLD, [0, 0, 0.05], [90, 0, 0]);
    f.put(new THREE.BoxGeometry(0.03, 0.012, 0.014), GOLD, [0.018, 0, 0.12]);
    f.put(new THREE.BoxGeometry(0.03, 0.012, 0.014), GOLD, [0.018, 0, 0.095]);
    f.put(new THREE.SphereGeometry(0.012, 6, 4), GOLD_D, [0, 0, -0.07]);
  }

  // ------------------------------------------------------------ pearls
  {
    const sk = b.surface(mainM);
    const pts = (
      [
        [-0.45, 0.1, 0.5],
        [-0.28, 0.15, 0.62],
        [-0.08, 0.15, 0.7],
        [0.12, 0.15, 0.7],
        [0.3, 0.15, 0.62],
        [0.46, 0.1, 0.5],
      ] as V[]
    ).map((p) => {
      const h = sk.nearest(new THREE.Vector3(p[0], p[1], p[2]));
      return h.at.clone().addScaledVector(h.n.clone().normalize(), 0.016);
    });
    const path = catmull(pts);
    b.sweep(path, 0.004, GOLD_D, { bone: root, sides: 4 });
    for (let i = 0; i <= 14; i++) {
      const p = path.at(i / 14);
      pearlBatch.push(new THREE.SphereGeometry(0.017, 6, 5).translate(p.x, p.y, p.z));
    }
    const mid = path.at(0.5);
    gem(RUBY, 0, new THREE.Vector3(mid.x, mid.y - 0.03, mid.z + 0.012), 0.03, eul([0, 0, 0]), 1.5);
  }

  // ------------------------------------------------------------ crystal clusters
  for (const [bx, bz, col, flip] of [
    [-0.8, -0.5, SAPPHIRE, 1],
    [0.78, -0.5, AMETHYST, -1],
  ] as Array<[number, number, string, number]>) {
    const list: Array<[number, number, number, number, V]> = [
      [0, 0, 0.42, 0.05, [-8, 0, 6 * flip]],
      [0.09 * flip, 0.06, 0.3, 0.04, [10, 0, -14 * flip]],
      [-0.08 * flip, 0.07, 0.25, 0.035, [12, 0, 12 * flip]],
      [0.03, -0.08, 0.33, 0.04, [-14, 0, -4]],
      [-0.13 * flip, -0.02, 0.18, 0.03, [0, 0, 24 * flip]],
      [0.14 * flip, -0.05, 0.16, 0.028, [-10, 0, -26 * flip]],
    ];
    for (const [dx, dz, h, r, tilt] of list) crystal(col, [bx + dx, F - 0.01, bz + dz], h, r, tilt);
    W.put(new THREE.DodecahedronGeometry(0.1), STEEL_D, [bx, F + 0.03, bz], [10, 30, 0], [1.3, 0.6, 1.1]);
  }

  // magic sparkles
  for (const [x, y, z] of [
    [-0.3, 0.62, -0.1],
    [0.35, 0.7, -0.2],
    [0.05, 0.9, -0.25],
    [-0.55, 0.5, 0.2],
    [0.6, 0.55, 0.15],
    [0.2, 0.55, 0.55],
    [-0.1, 0.7, 0.3],
  ])
    gem("#fff2b0", 0, new THREE.Vector3(x, y, z), 0.016, eul([0, 45, 0]), 1.8);

  // ------------------------------------------------------------ flush batches
  coinBatch.forEach((list, i) => {
    const m = list.length ? mergeGeometries(list) : null;
    if (m) b.part(m, COIN_COL[i], { bone: root, at: [0, 0, 0] });
  });
  const pm = mergeGeometries(pearlBatch);
  if (pm) b.part(pm, PEARL, { bone: root, at: [0, 0, 0] });
  const rm = mergeGeometries(rivetBatch);
  if (rm) b.part(rm, GOLD_B, { bone: root, at: [0, 0, 0] });
  const lrm = mergeGeometries(lidRivetBatch);
  if (lrm) b.part(lrm, GOLD_B, { bone: lid, at: [0, 0, 0] });
  for (const [color, list] of gemBatch) {
    const m = mergeGeometries(list);
    if (m) glow(b.part(m, color, { bone: root, at: [0, 0, 0], flat: true }), 0.5);
  }

  // open the lid
  b.pose(lid, { axis: [1, 0, 0], deg: -105 });
  return b.root;
}
