import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, aim, catmull, grain, mottle, paint, svg } from "../../../../src/index";

export const meta = {
  name: "Pirate treasure chest",
  description:
    "Weathered plank chest with an open hinged lid, rusty iron straps, studs and a loose padlock, spilling coins, pearls, a jewelled goblet and gems, with a skull and crossbones on the front.",
};

export default function build() {
  const b = createBuilder({ name: "treasureChest" });

  // deterministic local random
  let seed = 20240607;
  const rnd = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  // ---------- skeleton ----------
  const base = b.joint("chest", { at: [0, 0, 0], dir: [0, 1, 0] });
  const lid = b.joint("lid", { parent: base, at: [0, 0.45, -0.275], dir: [0, 0, 1], role: "hinge" });
  b.joint("lidFront", { parent: lid, at: [0, 0.45, 0.275], dir: [0, 0, 1] });

  const P = (g: THREE.BufferGeometry, c: any, o: any = {}) => b.part(g, c, { bone: base, ...o });
  const Ls = (g: THREE.BufferGeometry, c: any, o: any = {}) => b.part(g, c, { bone: lid, ...o });

  // ---------- palette ----------
  const WOODC = ["#4a3220", "#3b281a", "#55392a", "#43301f"];
  const WOODS = WOODC.map((c, i) => grain(c, "#2a1b11", { size: 0.02, axis: "x", seed: i + 1 }));
  const SIDEWOODS = WOODC.map((c, i) => grain(c, "#2a1b11", { size: 0.02, axis: "z", seed: i + 9 }));
  const LIDWOODS = WOODC.map((c, i) => grain(c, "#2a1b11", { size: 0.02, axis: "x", seed: i + 20 }));
  const IRON = "#37312d";
  const RUST = "#7a4326";
  const IRONP = mottle(IRON, RUST, { size: 0.05, contrast: 0.9, seed: 3 });
  const STUD = "#5e4232";
  const GOLD = "#e0a823";
  const GOLD2 = "#f2c84b";
  const GOLD3 = "#b8841a";
  const GOLDP = mottle(GOLD3, GOLD, { size: 0.03, seed: 5 });
  const PEARL = "#f1ebe0";
  const RUBY = "#d01535";
  const EMERALD = "#12a05a";

  // ---------- body planks ----------
  const ph = 0.1125;
  for (const sz of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      P(new THREE.BoxGeometry(0.9, ph, 0.04), WOODS[(i + (sz > 0 ? 0 : 2)) % 4], {
        at: [0, ph / 2 + i * ph, sz * 0.255],
      });
    }
  }
  for (const sx of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      P(new THREE.BoxGeometry(0.04, ph, 0.47), SIDEWOODS[(i + (sx > 0 ? 1 : 3)) % 4], {
        at: [sx * 0.43, ph / 2 + i * ph, 0],
      });
    }
  }
  P(new THREE.BoxGeometry(0.82, 0.03, 0.47), "#2a1b11", { at: [0, 0.015, 0] });
  // gold filling the chest
  P(new THREE.BoxGeometry(0.82, 0.33, 0.47), GOLD3, { at: [0, 0.195, 0] });
  const dome = new THREE.SphereGeometry(1, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2);
  P(dome, GOLDP, { at: [0, 0.36, 0], scale: [0.41, 0.1, 0.235], flat: true });

  // ---------- iron work on body ----------
  for (const sz of [1, -1]) {
    // top and bottom bands
    P(new THREE.BoxGeometry(0.924, 0.04, 0.012), IRONP, { at: [0, 0.43, sz * 0.281] });
    P(new THREE.BoxGeometry(0.924, 0.05, 0.012), IRONP, { at: [0, 0.025, sz * 0.281] });
    for (const sx of [1, -1]) {
      // vertical straps
      P(new THREE.BoxGeometry(0.07, 0.4, 0.012), IRONP, { at: [sx * 0.28, 0.24, sz * 0.2855] });
      for (const y of [0.1, 0.2, 0.3, 0.4]) {
        P(new THREE.SphereGeometry(0.013, 6, 4), STUD, {
          at: [sx * 0.28, y, sz * 0.292],
          scale: [1, 1, 0.6],
          flat: true,
        });
      }
      // corner brackets
      P(new THREE.BoxGeometry(0.06, 0.45, 0.01), IRONP, { at: [sx * 0.42, 0.225, sz * 0.28] });
      P(new THREE.BoxGeometry(0.01, 0.45, 0.06), IRONP, { at: [sx * 0.455, 0.225, sz * 0.245] });
    }
  }
  for (const sx of [1, -1]) {
    P(new THREE.BoxGeometry(0.012, 0.04, 0.574), IRONP, { at: [sx * 0.456, 0.43, 0] });
    P(new THREE.BoxGeometry(0.012, 0.05, 0.574), IRONP, { at: [sx * 0.456, 0.025, 0] });
    // side handles
    P(new THREE.BoxGeometry(0.012, 0.07, 0.09), IRONP, { at: [sx * 0.462, 0.27, 0] });
    P(new THREE.TorusGeometry(0.03, 0.007, 5, 10), IRON, {
      at: [sx * 0.47, 0.245, 0],
      rotation: [0, 90, 0],
    });
  }

  // hinges at the back
  for (const sx of [1, -1]) {
    P(new THREE.CylinderGeometry(0.014, 0.014, 0.12, 8), IRON, {
      at: [sx * 0.2, 0.45, -0.283],
      rotation: [0, 0, 90],
    });
    P(new THREE.BoxGeometry(0.12, 0.1, 0.01), IRONP, { at: [sx * 0.2, 0.395, -0.284] });
    Ls(new THREE.BoxGeometry(0.12, 0.1, 0.01), IRONP, { at: [sx * 0.2, 0.505, -0.284] });
  }

  // lock plate & staple on body, hasp on lid
  P(new THREE.BoxGeometry(0.09, 0.085, 0.016), IRONP, { at: [0, 0.385, 0.281] });
  Ls(new THREE.BoxGeometry(0.09, 0.1, 0.012), IRONP, { at: [0, 0.51, 0.281] });
  const PIV = [0, 0.35, 0.292];
  P(new THREE.TorusGeometry(0.018, 0.004, 5, 10), IRON, { at: PIV, rotation: [0, 90, 0] });

  // padlock hanging loose, swung a little
  const a = (16 * Math.PI) / 180;
  const rot = (x: number, y: number): [number, number] => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
  const lw = (x: number, y: number, z = 0) => {
    const [rx, ry] = rot(x, y);
    return [PIV[0] + rx, PIV[1] + ry, PIV[2] + z];
  };
  P(new THREE.TorusGeometry(0.022, 0.005, 5, 10, Math.PI), "#8a8580", {
    at: lw(0, -0.027),
    rotation: [0, 0, 16],
  });
  P(new THREE.BoxGeometry(0.065, 0.07, 0.03), "#4a4540", { at: lw(0, -0.062), rotation: [0, 0, 16] });
  P(new THREE.BoxGeometry(0.05, 0.012, 0.032), "#6b5a32", { at: lw(0, -0.085), rotation: [0, 0, 16] });
  P(new THREE.CylinderGeometry(0.007, 0.007, 0.004, 8), "#b08a34", {
    at: lw(0, -0.06, 0.016),
    dir: [0, 0, 1],
    axis: "y",
  });

  // ---------- carved skull and crossbones ----------
  const skullTex = svg(
    `<svg viewBox="0 0 100 100"><g stroke="#2b1a0e" stroke-width="3" fill="#d8c8a0" stroke-linejoin="round">
    <g transform="rotate(35 50 56)"><rect x="8" y="51" width="84" height="9" rx="4"/><circle cx="10" cy="50" r="7"/><circle cx="10" cy="62" r="7"/><circle cx="90" cy="50" r="7"/><circle cx="90" cy="62" r="7"/></g>
    <g transform="rotate(-35 50 56)"><rect x="8" y="51" width="84" height="9" rx="4"/><circle cx="10" cy="50" r="7"/><circle cx="10" cy="62" r="7"/><circle cx="90" cy="50" r="7"/><circle cx="90" cy="62" r="7"/></g>
    <path d="M50 10 C73 10 81 27 79 43 C78 52 73 54 71 58 L71 70 L29 70 L29 58 C27 54 22 52 21 43 C19 27 27 10 50 10Z"/>
    <ellipse cx="37" cy="41" rx="9" ry="10" fill="#1a0f08"/><ellipse cx="63" cy="41" rx="9" ry="10" fill="#1a0f08"/>
    <path d="M50 51 L44 62 L56 62Z" fill="#1a0f08"/>
    <path d="M38 70 V62 M46 70 V64 M54 70 V64 M62 70 V62" fill="none"/></g></svg>`,
    { size: 256 },
  );
  P(new THREE.PlaneGeometry(0.17, 0.17), "#ffffff", {
    at: [0, 0.15, 0.279],
    dir: [0, 0, 1],
    axis: "z",
    texture: skullTex,
  });

  // ---------- lid ----------
  const prof: [number, number][] = [];
  for (let d = 0; d <= 180; d += 15) {
    const r = (d * Math.PI) / 180;
    prof.push([Math.round(0.275 * Math.cos(r) * 1e6) / 1e6, d === 180 ? 0 : Math.round(0.2 * Math.sin(r) * 1e6) / 1e6]);
  }
  const lidPaint = paint((p) => {
    const ang = Math.atan2(p.y - 0.45, p.z);
    const k = ang / (Math.PI / 6);
    const i = Math.floor(k);
    const f = k - i;
    if (f < 0.05) return "#1e140c";
    return LIDWOODS[((i % 4) + 4) % 4];
  });
  b.extrude(prof, {
    at: [0, 0.45, 0],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.9,
    bevel: 0.004,
    color: lidPaint,
    bone: lid,
  });
  Ls(new THREE.BoxGeometry(0.82, 0.008, 0.5), "#6e1f26", { at: [0, 0.446, 0] });

  // lid straps over the arch
  for (const s of [1, -1]) {
    const pts: number[][] = [];
    for (let d = 180; d >= 0; d -= 15) {
      const r = (d * Math.PI) / 180;
      pts.push([s * 0.28, 0.45 + 0.206 * Math.sin(r), 0.281 * Math.cos(r)]);
    }
    b.sweep(catmull(pts), () => [0.035, 0.006], {
      section: "box",
      caps: "flat",
      bone: lid,
      color: IRONP,
    });
    for (const d of [20, 45, 70, 90, 110, 135, 160]) {
      const r = (d * Math.PI) / 180;
      Ls(new THREE.SphereGeometry(0.013, 6, 4), STUD, {
        at: [s * 0.28, 0.45 + 0.2125 * Math.sin(r), 0.2875 * Math.cos(r)],
        flat: true,
      });
    }
    // end bands
    const ep: number[][] = [];
    for (let d = 180; d >= 0; d -= 15) {
      const r = (d * Math.PI) / 180;
      ep.push([s * 0.456, 0.45 + 0.18 * Math.sin(r), 0.247 * Math.cos(r)]);
    }
    b.sweep(catmull(ep), () => [0.006, 0.028], {
      section: "box",
      caps: "flat",
      bone: lid,
      color: IRONP,
    });
  }

  // ---------- coins ----------
  const coinBuckets: Record<string, THREE.BufferGeometry[]> = {};
  const coinCols = [GOLD, GOLD2, GOLD3, GOLD, GOLD2];
  const addCoin = (pos: THREE.Vector3, n: THREE.Vector3, size = 1) => {
    const col = coinCols[Math.floor(rnd() * coinCols.length)];
    const g = new THREE.CylinderGeometry(0.032 * size, 0.032 * size, 0.006, 10);
    const m = new THREE.Matrix4().compose(pos, aim([n.x, n.y, n.z]), new THREE.Vector3(1, 1, 1));
    g.applyMatrix4(m);
    (coinBuckets[col] ||= []).push(g);
  };
  const ellipsoidCoins = (
    c: number[],
    r: number[],
    count: number,
    accept: (d: THREE.Vector3) => boolean,
  ) => {
    let placed = 0;
    let tries = 0;
    while (placed < count && tries < count * 40) {
      tries++;
      const u = rnd() * 2 - 1;
      const ang = rnd() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      const d = new THREE.Vector3(s * Math.cos(ang), u, s * Math.sin(ang));
      if (!accept(d)) continue;
      const n = new THREE.Vector3(d.x / r[0], d.y / r[1], d.z / r[2]).normalize();
      n.x += (rnd() - 0.5) * 0.5;
      n.y += (rnd() - 0.5) * 0.3;
      n.z += (rnd() - 0.5) * 0.5;
      n.normalize();
      const pos = new THREE.Vector3(c[0] + d.x * r[0], c[1] + d.y * r[1], c[2] + d.z * r[2]).addScaledVector(n, 0.003);
      addCoin(pos, n, 0.9 + rnd() * 0.25);
      placed++;
    }
  };
  ellipsoidCoins([0, 0.36, 0], [0.4, 0.1, 0.225], 160, (d) => d.y > 0.35);
  // ramp over the front rim and floor pile
  const blobC = [0.27, 0.22, 0.33];
  const blobR = [0.15, 0.22, 0.13];
  P(new THREE.SphereGeometry(1, 8, 6), GOLDP, { at: blobC, scale: blobR, flat: true });
  ellipsoidCoins(blobC, blobR, 60, (d) => d.y > 0.05 && d.z > -0.2);
  const pileC = [0.17, 0.01, 0.5];
  const pileR = [0.33, 0.075, 0.2];
  P(new THREE.SphereGeometry(1, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), GOLDP, {
    at: pileC,
    scale: pileR,
    flat: true,
  });
  ellipsoidCoins(pileC, pileR, 90, (d) => d.y > 0.3);
  // loose coins on the floor
  for (let i = 0; i < 40; i++) {
    const pos = new THREE.Vector3(0.1 + rnd() * 0.65, 0.004, 0.32 + rnd() * 0.55);
    const n = new THREE.Vector3((rnd() - 0.5) * 0.15, 1, (rnd() - 0.5) * 0.15).normalize();
    addCoin(pos, n, 0.9 + rnd() * 0.2);
  }
  for (const col of Object.keys(coinBuckets)) {
    const merged = mergeGeometries(coinBuckets[col]);
    if (merged) b.part(merged, col, { bone: base, at: [0, 0, 0] });
  }

  // ---------- pearl necklace ----------
  const pearlPath = catmull([
    [-0.19, 0.455, 0.15],
    [-0.19, 0.468, 0.265],
    [-0.19, 0.44, 0.3],
    [-0.19, 0.3, 0.305],
    [-0.19, 0.15, 0.31],
    [-0.19, 0.06, 0.33],
    [-0.16, 0.0125, 0.4],
    [-0.28, 0.0125, 0.5],
    [-0.38, 0.0125, 0.6],
    [-0.3, 0.0125, 0.68],
    [-0.18, 0.0125, 0.62],
  ]);
  b.along(pearlPath, 58, (at) => {
    P(new THREE.SphereGeometry(0.0125, 8, 6), PEARL, { at: at.at });
  });

  // ---------- jewelled goblet ----------
  const gob = [-0.12, 0.435, -0.05];
  b.lathe(
    [
      [0, 0],
      [0.045, 0],
      [0.045, 0.008],
      [0.012, 0.022],
      [0.01, 0.07],
      [0.022, 0.085],
      [0.045, 0.11],
      [0.052, 0.165],
      [0.044, 0.165],
      [0, 0.118],
    ],
    { at: gob, segments: 10, color: GOLD2, bone: base },
  );
  for (let i = 0; i < 5; i++) {
    const ang = (i / 5) * Math.PI * 2;
    P(new THREE.IcosahedronGeometry(0.009, 0), i % 2 ? EMERALD : RUBY, {
      at: [gob[0] + Math.cos(ang) * 0.0485, gob[1] + 0.132, gob[2] + Math.sin(ang) * 0.0485],
      flat: true,
    });
  }
  P(new THREE.TorusGeometry(0.0115, 0.004, 5, 8), GOLD3, {
    at: [gob[0], gob[1] + 0.045, gob[2]],
    rotation: [90, 0, 0],
  });

  // ---------- loose gems ----------
  const moundTop = (x: number, z: number) =>
    0.36 + 0.1 * Math.sqrt(Math.max(0, 1 - (x / 0.41) ** 2 - (z / 0.235) ** 2));
  const pileTop = (x: number, z: number) =>
    0.01 + 0.075 * Math.sqrt(Math.max(0, 1 - ((x - pileC[0]) / 0.33) ** 2 - ((z - pileC[2]) / 0.2) ** 2));
  const gem = (x: number, y: number, z: number, col: string, size = 1) => {
    P(new THREE.OctahedronGeometry(0.02 * size), col, {
      at: [x, y, z],
      scale: [1, 1.25, 1],
      rotation: [rnd() * 40, rnd() * 360, rnd() * 40],
      flat: true,
    });
  };
  gem(0.18, moundTop(0.18, 0.05) + 0.012, 0.05, RUBY);
  gem(-0.27, moundTop(-0.27, 0.02) + 0.012, 0.02, EMERALD);
  gem(0.06, moundTop(0.06, -0.13) + 0.012, -0.13, RUBY, 1.2);
  gem(0.29, moundTop(0.29, -0.08) + 0.012, -0.08, EMERALD);
  gem(0.1, pileTop(0.1, 0.5) + 0.018, 0.5, RUBY, 1.1);
  gem(0.3, pileTop(0.3, 0.42) + 0.018, 0.42, EMERALD, 1.2);
  gem(0.24, pileTop(0.24, 0.58) + 0.018, 0.58, RUBY);
  gem(0.55, 0.02, 0.45, EMERALD);
  gem(0.0, 0.02, 0.74, RUBY, 0.9);

  // open the lid, thrown wide
  b.pose(lid, { axis: [1, 0, 0], deg: -112 });

  return b.root;
}
