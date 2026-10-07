// Desert oasis diorama: low-poly whimsical mix. A turquoise pond ringed with stones and reeds, four palms, two
// striped tents and a market canopy, a campfire, three camels (one drinking, one resting, one calf) and little
// story props, all on a strata-cut sand island about 3 m across.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { DEG, rng } from "../src/math";
import { catmull } from "../src/path";
import { mix, noise, paint, smoothstep } from "../src/paint";
import type { Paint } from "../src/paint";
import type { Joint } from "../src/skeleton";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Desert Oasis",
  description:
    "A whimsical low-poly oasis diorama: turquoise pond, four palms, striped tents and market canopy, campfire, three camels (drinking, resting, calf), jars, rugs and a fennec fox on a strata-cut sand island.",
  style: "low-poly whimsical mix",
  commit: "88fc1f0",
};

type Fill = string | Paint;
type N3 = readonly [number, number, number];
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// ---------------------------------------------------------------------------------------------------------------
// Palette (flat colours; paints below carry the large surfaces)
// ---------------------------------------------------------------------------------------------------------------
const INK = "#2a1a1e";
const CREAM = "#fff1d2";
const RED = "#e2574c";
const TEAL = "#2fb9b3";
const BLUE = "#3f78d6";
const GOLD = "#f2b632";
const ORANGE = "#f08a32";
const PLUM = "#7a4aa8";
const PINK = "#ff8fb5";
const WOOD = "#9a6a3a";
const WOOD_D = "#6e4727";
const ROPE = "#d6b886";
const STONE = "#b9a58a";
const STONE_D = "#a08c74";
const STONE_L = "#d3c3a6";
const COAT = "#dba762";
const COAT_D = "#b97f3f";
const BELLY = "#f1d49c";
const PAD = "#8a6a4e";
const EYE = "#2b1b14";
const GREEN = "#4fae56";

const GY = 0.15; // ground top
const PC = V(0.05, GY, 0.2); // pond centre
const PRX = 0.68;
const PRZ = 0.46;

// ---------------------------------------------------------------------------------------------------------------
// Local frames: build every object in its own units, then place it in the world
// ---------------------------------------------------------------------------------------------------------------
class Xf {
  readonly q: THREE.Quaternion;
  constructor(
    readonly o: THREE.Vector3,
    readonly yaw = 0,
    readonly s = 1,
    readonly pitch = 0,
  ) {
    this.q = new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch * DEG, yaw * DEG, 0, "YXZ"));
  }
  p(l: readonly number[]) {
    return V(l[0], l[1], l[2]).multiplyScalar(this.s).applyQuaternion(this.q).add(this.o);
  }
  d(l: readonly number[]) {
    return V(l[0], l[1], l[2]).applyQuaternion(this.q);
  }
  rot(e?: readonly number[]) {
    const q = this.q.clone();
    if (e) q.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(e[0] * DEG, e[1] * DEG, e[2] * DEG)));
    return q;
  }
  inv(p: THREE.Vector3) {
    return p.clone().sub(this.o).applyQuaternion(this.q.clone().invert()).divideScalar(this.s);
  }
}

export default function build() {
  const b = createBuilder({ name: "desertOasis", paintSize: 2048 });
  const base = b.joint("base", { at: [0, 0, 0] });
  const random = rng(11);

  // ---- tiny part kit over a local frame ----------------------------------------------------------------------
  type Put = { rot?: readonly number[]; tex?: ReturnType<typeof svg>; flat?: boolean; name?: string; group?: string };
  function kit(xf: Xf, bone: Joint = base) {
    const put = (geo: THREE.BufferGeometry, color: Fill, at: readonly number[], sc: N3, o: Put = {}) =>
      b.part(geo, color, {
        bone,
        at: xf.p(at),
        quat: xf.rot(o.rot),
        scale: [sc[0] * xf.s, sc[1] * xf.s, sc[2] * xf.s],
        flat: o.flat ?? true,
        texture: o.tex,
        name: o.name,
        group: o.group,
      });
    const U: N3 = [1, 1, 1];
    return {
      put,
      box: (color: Fill, size: N3, at: readonly number[], rot?: readonly number[], o: Put = {}) =>
        put(new THREE.BoxGeometry(size[0], size[1], size[2]), color, at, U, { ...o, rot }),
      cyl: (
        color: Fill,
        rt: number,
        rb: number,
        h: number,
        seg: number,
        at: readonly number[],
        rot?: readonly number[],
      ) => put(new THREE.CylinderGeometry(rt, rb, h, seg), color, at, U, { rot }),
      ball: (color: Fill, r: N3, at: readonly number[], rot?: readonly number[], seg = 7) =>
        put(new THREE.SphereGeometry(1, seg, Math.max(3, Math.round(seg * 0.7))), color, at, r, { rot }),
      ico: (color: Fill, r: N3, at: readonly number[], rot?: readonly number[], detail = 0) =>
        put(new THREE.IcosahedronGeometry(1, detail), color, at, r, { rot }),
      cone: (color: Fill, r: number, h: number, seg: number, at: readonly number[], rot?: readonly number[]) =>
        put(new THREE.ConeGeometry(r, h, seg), color, at, U, { rot }),
      torus: (
        color: Fill,
        r: number,
        t: number,
        tseg: number,
        seg: number,
        at: readonly number[],
        rot?: readonly number[],
        sc: N3 = U,
      ) => put(new THREE.TorusGeometry(r, t, tseg, seg), color, at, sc, { rot }),
      rod: (color: Fill, a: readonly number[], c: readonly number[], r: number, sides = 5) =>
        b.sweep([xf.p(a), xf.p(c)], r * xf.s, { bone, sides, smooth: false, caps: "flat", color }),
      cap: (color: Fill, a: readonly number[], c: readonly number[], r: number | [number, number], sides = 6) =>
        b.sweep([xf.p(a), xf.p(c)], typeof r === "number" ? r * xf.s : [r[0] * xf.s, r[1] * xf.s], {
          bone,
          sides,
          smooth: false,
          caps: "round",
          color,
        }),
    };
  }

  // ---- batched flat-colour confetti: many small pieces, one part per colour ----------------------------------
  const batches: { flush: () => void }[] = [];
  function batch(color: string, bone: Joint = base) {
    const list: THREE.BufferGeometry[] = [];
    const api = {
      add(geo: THREE.BufferGeometry, pos: THREE.Vector3, q?: THREE.Quaternion, sc: number | N3 = 1) {
        const g = geo.index ? geo.toNonIndexed() : geo.clone();
        g.applyMatrix4(
          new THREE.Matrix4().compose(
            pos,
            q ?? new THREE.Quaternion(),
            typeof sc === "number" ? V(sc, sc, sc) : V(sc[0], sc[1], sc[2]),
          ),
        );
        g.computeVertexNormals();
        g.deleteAttribute("uv");
        list.push(g);
      },
      flush() {
        if (list.length) b.part(mergeGeometries(list)!, color, { bone, at: [0, 0, 0], name: `batch.${color}` });
      },
    };
    batches.push(api);
    return api;
  }
  const yawQ = (deg: number) => new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), deg * DEG);
  const eulerQ = (x: number, y: number, z: number) =>
    new THREE.Quaternion().setFromEuler(new THREE.Euler(x * DEG, y * DEG, z * DEG, "YXZ"));

  const pennantShape = new THREE.Shape([new THREE.Vector2(-0.5, 0), new THREE.Vector2(0.5, 0), new THREE.Vector2(0, -1)]);
  const pennantGeo = new THREE.ExtrudeGeometry(pennantShape, { depth: 0.008, bevelEnabled: false });

  // ---- textures ------------------------------------------------------------------------------------------------
  const frondTex = (light: string, dark: string, rib: string) => {
    let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 100"><path d="M20 100 L20 3" stroke="${rib}" stroke-width="2.6" fill="none"/>`;
    for (let i = 0; i < 14; i++) {
      const y = 98 - i * 6.6;
      const w = 19 * (1 - 0.72 * Math.pow(i / 14, 1.6));
      const col = i % 2 ? light : dark;
      const col2 = i % 2 ? dark : light;
      s += `<polygon points="20,${y} ${20 - w},${y - 11} ${20 - w * 0.78},${y - 4.5} 20,${y - 2.2}" fill="${col}"/>`;
      s += `<polygon points="20,${y} ${20 + w},${y - 11} ${20 + w * 0.78},${y - 4.5} 20,${y - 2.2}" fill="${col2}"/>`;
    }
    s += `<polygon points="20,3 17,10 23,10" fill="${light}"/></svg>`;
    return svg(s, { size: 256 });
  };
  const FROND_A = frondTex("#62cf5c", "#2f9a47", "#25783a");
  const FROND_B = frondTex("#86dc5c", "#3aa84a", "#2c8a3c");
  const FROND_DRY = frondTex("#c99a52", "#9a6b30", "#7a5226");
  const tuft = (a: string, c: string, d: string) =>
    svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 40"><polygon points="4,40 10,6 15,40" fill="${c}"/><polygon points="12,40 22,0 28,40" fill="${a}"/><polygon points="22,40 36,8 38,40" fill="${d}"/><polygon points="30,40 44,18 44,40" fill="${c}"/><polygon points="16,40 6,18 9,40" fill="${d}"/></svg>`,
      { size: 160 },
    );
  const TUFT_G = tuft("#5cc455", "#3a9c48", "#8bd964");
  const TUFT_DRY = tuft("#d9b25c", "#b98a3c", "#ecd08a");
  const REED = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 80"><polygon points="6,80 8,22 11,80" fill="#3f9a4e"/><polygon points="12,80 16,0 20,80" fill="#63c25a"/><polygon points="20,80 25,12 27,80" fill="#3f9a4e"/><polygon points="9,80 3,30 8,80" fill="#7fd070"/></svg>`,
    { size: 200 },
  );
  const RUG_TEX = (c1: string, c2: string, c3: string, c4: string) => {
    let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 64"><rect width="100" height="64" fill="${c1}"/><rect x="4" y="4" width="92" height="56" fill="none" stroke="${c4}" stroke-width="3"/><rect x="9" y="9" width="82" height="46" fill="${c2}"/>`;
    for (let i = 0; i < 4; i++) {
      const cx = 20 + i * 20;
      s += `<polygon points="${cx},14 ${cx + 9},32 ${cx},50 ${cx - 9},32" fill="${i % 2 ? c3 : c4}"/><polygon points="${cx},22 ${cx + 4},32 ${cx},42 ${cx - 4},32" fill="${c1}"/>`;
    }
    for (let i = 0; i < 20; i++) s += `<rect x="${3 + i * 4.8}" y="0" width="2.4" height="3" fill="${c4}"/><rect x="${3 + i * 4.8}" y="61" width="2.4" height="3" fill="${c4}"/>`;
    return svg(s + "</svg>", { size: 256 });
  };
  const DROP = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#fff1d2"/><path d="M32 8 C32 8 16 30 16 40 a16 16 0 0 0 32 0 C48 30 32 8 32 8Z" fill="#2aa6e0"/><path d="M24 40 a8 8 0 0 0 7 8" stroke="#bff3ff" stroke-width="3.5" fill="none"/></svg>`,
    { size: 192 },
  );
  const PALMICON = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#fff1d2"/><path d="M30 56 L34 56 L33 26 L31 26Z" fill="#9a6a3a"/><path d="M32 26 C18 14 10 22 8 28 C16 20 24 22 32 26Z M32 26 C46 14 54 22 56 28 C48 20 40 22 32 26Z M32 26 C28 10 36 6 40 4 C36 12 34 18 32 26Z M32 26 C20 22 14 30 14 36 C18 28 24 26 32 26Z M32 26 C44 22 50 30 50 36 C46 28 40 26 32 26Z" fill="#3aa84a"/></svg>`,
    { size: 192 },
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Ground: strata-cut sand island with ripples, wet pond shore and grass fringe
  // ---------------------------------------------------------------------------------------------------------------
  const groundPaint = paint((p, n) => {
    if (n.y < 0.55 && p.y <= GY + 0.002) {
      const y = p.y + 0.008 * Math.sin(p.x * 19 + p.z * 13) + 0.006 * Math.sin(p.z * 23 - p.x * 7);
      if (y < 0.05) return "#9c4f31";
      if (y < 0.085) return "#cf7b45";
      if (y < 0.118) return "#e9a95b";
      return "#f4cf8a";
    }
    const dx = (p.x - PC.x) / PRX;
    const dz = (p.z - PC.z) / PRZ;
    const d = Math.hypot(dx, dz);
    const nz = noise(p, 0.16, 3);
    if (d < 1.1) return "#b98a52";
    if (d < 1.2 + 0.35 * nz) {
      return noise(p, 0.06, 9) > 0.5 ? "#8bcf5c" : "#68b552";
    }
    if (d < 1.34 + 0.4 * nz) return "#c9985a";
    const w = Math.sin(Math.hypot(p.x + 0.2, p.z + 2.1) * 33 + nz * 6);
    const base = w > 0.5 ? "#eec27b" : "#f7d994";
    if (noise(p, 0.04, 5) > 0.82) return mix("#f7d994", "#e2b26a", 0.8);
    return base;
  });
  const blob = (R: number, wob: number, seed: number, n = 22) => {
    const pts: [number, number][] = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const r = R * (1 + wob * Math.sin(3 * a + seed) + wob * 0.6 * Math.sin(5 * a + seed * 2.3) + wob * 0.3 * Math.sin(8 * a));
      pts.push([Math.cos(a) * r, -Math.sin(a) * r]);
    }
    return pts;
  };
  b.extrude(blob(1.5, 0.035, 0.6), {
    at: [0, GY / 2, 0],
    x: [1, 0, 0],
    y: [0, 0, -1],
    thickness: GY,
    bevel: 0.014,
    detail: 0.4,
    color: groundPaint,
    bone: base,
    name: "island",
  });

  // dunes and sandy swells
  const duneAt = (x: number, z: number, rx: number, h: number, rz: number, yaw = 0) =>
    kit(new Xf(V(x, GY + h * 0.5, z), yaw)).ico(groundPaint, [rx, h, rz], [0, 0, 0], undefined, 1);
  duneAt(0.0, -1.12, 0.9, 0.15, 0.38, 4);
  duneAt(-0.9, -0.98, 0.5, 0.11, 0.3, 30);
  duneAt(0.95, -1.0, 0.45, 0.1, 0.28, -25);
  // low wind-blown sand waves in the foreground
  for (const [wx, wz, wr, wy] of [
    [-0.55, 1.22, 0.32, 8],
    [0.5, 1.24, 0.28, -6],
    [1.0, 1.0, 0.24, -40],
    [-1.12, 1.0, 0.22, 35],
    [0.1, 1.3, 0.2, 3],
  ] as const)
    kit(new Xf(V(wx, GY + 0.004, wz), wy)).ico(groundPaint, [wr, 0.02, 0.05], [0, 0, 0], undefined, 1);

  // ---------------------------------------------------------------------------------------------------------------
  // Pond
  // ---------------------------------------------------------------------------------------------------------------
  const pondOutline = (k: number) => {
    const pts: [number, number][] = [];
    const n = 22;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const f = k * (1 + 0.09 * Math.sin(2 * a + 0.4) + 0.06 * Math.sin(3 * a + 1.3));
      pts.push([Math.cos(a) * PRX * f, -Math.sin(a) * PRZ * f]);
    }
    return pts;
  };
  const waterPaint = paint((p, n) => {
    if (n.y < 0.5) return "#b98a52";
    const d = Math.hypot((p.x - PC.x) / PRX, (p.z - PC.z) / PRZ);
    const nz = noise(p, 0.1, 4);
    if (d > 0.9 + 0.05 * nz) return "#d8fff0";
    if (d > 0.76 + 0.06 * nz) return "#8de8d6";
    const ripple = Math.sin((p.x * 0.7 - p.z * 1.1) * 38 + nz * 5);
    if (noise(p, 0.05, 7) > 0.8) return "#e6fff8";
    if (d > 0.5) return ripple > 0.8 ? "#6fdcd8" : "#45c4d2";
    return ripple > 0.85 ? "#39b4cf" : "#2399c0";
  });
  b.extrude(pondOutline(1), {
    at: [PC.x, GY - 0.005, PC.z],
    x: [1, 0, 0],
    y: [0, 0, -1],
    thickness: 0.03,
    color: waterPaint,
    bone: base,
    name: "pond",
  });

  // rim stones (opening on the right where the camel drinks)
  {
    const stoneB = [batch(STONE), batch(STONE_D), batch(STONE_L)];
    const ico = new THREE.IcosahedronGeometry(1, 0);
    const n = 20;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + 0.1;
      if (Math.cos(a) > 0.55 && Math.sin(a) > -0.2 && Math.sin(a) < 0.75) continue; // drinking spot
      const f = 1.13 + 0.05 * random();
      const f2 = 1 + 0.09 * Math.sin(2 * a + 0.4) + 0.06 * Math.sin(3 * a + 1.3);
      const r = 0.035 + 0.035 * random();
      stoneB[i % 3].add(
        ico,
        V(PC.x + Math.cos(a) * PRX * f * f2, GY + 0.01, PC.z + Math.sin(a) * PRZ * f * f2),
        eulerQ(random() * 60, random() * 360, random() * 60),
        [r * 1.3, r * 0.8, r],
      );
    }
  }

  // lily pads, lotus, jumping fish
  {
    const pads = [batch(GREEN), batch("#6cc25a")];
    const padGeo = new THREE.CylinderGeometry(1, 1, 0.008, 8);
    const spots: [number, number, number][] = [
      [-0.18, 0.18, 0.065],
      [-0.3, 0.0, 0.05],
      [0.38, -0.05, 0.06],
      [0.28, 0.24, 0.045],
      [-0.02, -0.12, 0.055],
    ];
    spots.forEach(([dx, dz, r], i) => pads[i % 2].add(padGeo, V(PC.x + dx, GY + 0.012, PC.z + dz), yawQ(i * 40), [r, 1, r]));
    const petalsA = batch(PINK);
    const petalsB = batch("#ffd3e4");
    const petalGeo = new THREE.ConeGeometry(0.018, 0.06, 4);
    for (const [dx, dz] of [
      [-0.18, 0.18],
      [0.38, -0.05],
    ] as const) {
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * 360;
        const q = yawQ(a).multiply(eulerQ(35, 0, 0));
        petalsA.add(petalGeo, V(PC.x + dx, GY + 0.04, PC.z + dz).add(V(Math.sin(a * DEG), 0, Math.cos(a * DEG)).multiplyScalar(0.018)), q);
      }
      petalsB.add(petalGeo, V(PC.x + dx, GY + 0.045, PC.z + dz), eulerQ(0, 0, 0), 0.85);
      b.part(new THREE.SphereGeometry(0.012, 5, 3), GOLD, { bone: base, at: [PC.x + dx, GY + 0.062, PC.z + dz], flat: true });
    }
    // fish
    const fx = new Xf(V(PC.x - 0.02, GY + 0.15, PC.z + 0.22), 20, 1, -25);
    const fk = kit(fx);
    fk.ball(ORANGE, [0.05, 0.03, 0.022], [0, 0, 0]);
    b.extrude(
      [
        [0, 0],
        [-0.045, 0.04],
        [-0.03, 0],
        [-0.045, -0.04],
      ],
      { at: fx.p([0, 0, -0.04]), x: fx.d([0, 0, -1]), y: fx.d([0, 1, 0]), thickness: 0.006, color: RED, bone: base, name: "fishTail" },
    );
    fk.ball(CREAM, [0.012, 0.012, 0.008], [0.014, 0.01, 0.03], undefined, 5);
    fk.ball(INK, [0.006, 0.006, 0.005], [0.016, 0.011, 0.035], undefined, 4);
    fk.box(CREAM, [0.006, 0.022, 0.03], [0, 0.03, 0.0]);
    const drops = batch("#eafffb");
    for (const [dx, dy, dz, r] of [
      [0.1, 0.1, 0.0, 0.012],
      [-0.1, 0.08, 0.0, 0.01],
      [0.06, 0.13, 0.03, 0.009],
    ] as const)
      drops.add(new THREE.IcosahedronGeometry(1, 0), V(PC.x - 0.02 + dx * 0.5, GY + dy - 0.04, PC.z + 0.25 + dz), undefined, r);
    const rings = [batch("#eafffb")];
    rings[0].add(new THREE.TorusGeometry(0.075, 0.004, 3, 10), V(PC.x - 0.05, GY + 0.014, PC.z + 0.3), eulerQ(90, 0, 0));
    rings[0].add(new THREE.TorusGeometry(0.115, 0.004, 3, 12), V(PC.x - 0.05, GY + 0.014, PC.z + 0.3), eulerQ(90, 0, 0));
  }

  // reeds and cattails
  {
    const reedFrames: ReturnType<typeof frame>[] = [];
    const place = (cx: number, cz: number, n: number, spread: number) => {
      for (let i = 0; i < n; i++) {
        const a = random() * 6.28;
        const r = spread * Math.sqrt(random());
        reedFrames.push(frame([cx + Math.cos(a) * r, GY, cz + Math.sin(a) * r], [0, 1, 0]));
      }
    };
    place(-0.52, -0.1, 6, 0.1);
    place(-0.35, -0.3, 4, 0.08);
    place(0.62, -0.26, 3, 0.06);
    b.cards(reedFrames, REED, { size: [0.11, 0.3], lean: 8, bend: 14, vary: 0.3, spin: 180, cross: true, rng: rng(5), bone: base, sink: 0.12 });
    const stems = batch("#5a8f44");
    const heads = batch("#7b4a2a");
    const cap = batch("#d9b25c");
    for (const [cx, cz, h] of [
      [-0.5, -0.04, 0.36],
      [-0.57, -0.14, 0.42],
      [-0.44, -0.2, 0.33],
      [-0.62, -0.03, 0.3],
      [0.6, -0.2, 0.34],
    ] as const) {
      stems.add(new THREE.CylinderGeometry(0.004, 0.004, h, 4), V(cx, GY + h / 2, cz));
      heads.add(new THREE.CylinderGeometry(0.013, 0.013, 0.075, 6), V(cx, GY + h + 0.01, cz));
      cap.add(new THREE.ConeGeometry(0.004, 0.035, 4), V(cx, GY + h + 0.065, cz));
    }
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Palms
  // ---------------------------------------------------------------------------------------------------------------
  function palm(x: number, z: number, h: number, lean: [number, number], fronds: number, seed: number, dates: boolean) {
    const r0 = 0.028 + 0.028 * h;
    const pts = [
      V(x, GY - 0.02, z),
      V(x + lean[0] * 0.1, GY + h * 0.33, z + lean[1] * 0.1),
      V(x + lean[0] * 0.5, GY + h * 0.68, z + lean[1] * 0.5),
      V(x + lean[0], GY + h, z + lean[1]),
    ];
    const path = catmull(pts);
    const L = path.length;
    const trunkPaint = paint((_p, _n, s) => {
      const ring = Math.floor((s[0] * L) / 0.065);
      const facet = Math.floor((s[1] + 30) / 60);
      return (((ring + facet) % 2) + 2) % 2 ? "#a97640" : "#876030";
    });
    b.sweep(path, (t) => r0 * (1 - 0.42 * t) + 0.04 * Math.max(0, 1 - t * 7), {
      bone: base,
      sides: 6,
      smooth: false,
      color: trunkPaint,
      caps: "flat",
      name: `trunk${seed}`,
    });
    const top = pts[3];
    const k = kit(new Xf(top, 0, 1));
    const fl = 0.26 * h + 0.14;
    k.ball("#6a4526", [0.075 + 0.02 * h, 0.06 + 0.01 * h, 0.075 + 0.02 * h], [0, 0.02, 0]);
    // fruit
    if (dates) {
      const dt = batch(ORANGE);
      const sk = batch("#6d4a28");
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * Math.PI * 2;
        const rr = 0.05 + 0.03 * (i % 2);
        dt.add(new THREE.IcosahedronGeometry(0.022, 0), top.clone().add(V(Math.cos(a) * rr, -0.07 - 0.03 * (i % 3), Math.sin(a) * rr)), undefined, [1, 1.4, 1]);
        sk.add(new THREE.CylinderGeometry(0.003, 0.003, 0.05, 3), top.clone().add(V(Math.cos(a) * rr * 0.7, -0.035, Math.sin(a) * rr * 0.7)));
      }
    } else {
      const cc = batch("#6d4a28");
      const cl = batch("#6d4a28");
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + seed;
        cc.add(new THREE.IcosahedronGeometry(0.04 + 0.01 * h, 0), top.clone().add(V(Math.cos(a) * 0.07, -0.05, Math.sin(a) * 0.07)));
      }
      cl.add(new THREE.IcosahedronGeometry(0.03, 0), top.clone().add(V(0, -0.08, 0.0)));
    }
    // fronds: rings of cards, upper to drooping
    const mk = (n: number, elev: number, lean2: number, bend: number, tex: ReturnType<typeof svg>[], size: number, off: number) => {
      const fr = [];
      for (let i = 0; i < n; i++) {
        const a = ((i / n) * 360 + off + 14 * (random() - 0.5)) * DEG;
        const e = (elev + 10 * (random() - 0.5)) * DEG;
        fr.push(
          frame(top.clone().add(V(Math.sin(a) * 0.03, 0.03, Math.cos(a) * 0.03)), [
            Math.cos(e) * Math.sin(a),
            Math.sin(e),
            Math.cos(e) * Math.cos(a),
          ]),
        );
      }
      b.cards(fr, tex, {
        size: [size * 0.62, size],
        lean: lean2,
        bend,
        vary: 0.15,
        rng: rng(seed * 7 + 1),
        flow: (f) => {
          const dd = f.axis;
          return [dd.x, 0, dd.z];
        },
        bone: base,
        sink: 0.04,
      });
    };
    mk(Math.ceil(fronds * 0.45), 72, 18, 52, [FROND_A, FROND_B], fl * 0.9, 0);
    mk(Math.ceil(fronds * 0.8), 38, 22, 62, [FROND_A, FROND_B], fl, 20);
    mk(Math.max(3, Math.floor(fronds * 0.35)), 12, 38, 40, [FROND_DRY], fl * 0.75, 50);
    return path;
  }
  const palmAPath = palm(-0.62, -0.16, 1.4, [0.24, 0.06], 14, 1, false);
  palm(0.5, -0.42, 1.2, [-0.2, 0.12], 12, 2, true);
  palm(0.12, -0.68, 0.78, [0.04, 0.1], 9, 3, false);
  palm(-0.3, -0.56, 0.5, [-0.04, 0.08], 7, 4, true);

  // ---------------------------------------------------------------------------------------------------------------
  // Tents
  // ---------------------------------------------------------------------------------------------------------------
  const guy = (k: ReturnType<typeof kit>, from: N3, to: N3) => {
    k.rod(ROPE, from, to, 0.004, 4);
    k.cyl(WOOD_D, 0.008, 0.008, 0.05, 5, [to[0], to[1] + 0.01, to[2]], [0, 0, 0]);
  };

  // --- bell tent ---
  function bellTent(at: [number, number], yaw: number, R: number, wallH: number, peak: number, c1: string, c2: string, trim: string, id: string) {
    const xf = new Xf(V(at[0], GY, at[1]), yaw);
    const k = kit(xf);
    const stripe = paint((p, _n, s) => {
      const dx = p.x - at[0];
      const dz = p.z - at[1];
      const a = (Math.atan2(dx, dz) * 180) / Math.PI;
      const h = s[0];
      if (h < 0.035) return trim;
      if (Math.abs(h - wallH) < 0.018) return trim;
      if (h > peak - 0.1 && h < peak - 0.085) return trim;
      return Math.floor((a + 360.01) / 30) % 2 ? c1 : c2;
    });
    b.lathe(
      [
        [0, 0],
        [R + 0.02, 0],
        [R + 0.02, 0.035],
        [R, 0.035],
        [R, wallH],
        [0.03, peak],
        [0, peak],
      ],
      { at: [at[0], GY, at[1]], segments: 12, color: stripe, bone: base, name: `${id}Canvas` },
    );
    // door (at local +Z, facet centre)
    const wr = R * Math.cos(Math.PI / 12);
    const doorW = 0.075;
    k.box("#4a2e32", [doorW * 2, wallH - 0.05, 0.012], [0, (wallH + 0.035) / 2 - 0.0, wr + 0.006]);
    k.box(trim, [doorW * 2 + 0.03, 0.02, 0.016], [0, wallH - 0.02, wr + 0.008]);
    k.box(trim, [0.016, wallH - 0.05, 0.016], [doorW + 0.008, (wallH + 0.035) / 2, wr + 0.008]);
    k.box(trim, [0.016, wallH - 0.05, 0.016], [-doorW - 0.008, (wallH + 0.035) / 2, wr + 0.008]);
    k.box("#7a4a3a", [doorW * 1.7, 0.012, 0.09], [0, 0.04, wr + 0.05]);
    // hinged flaps
    for (const s of [1, -1]) {
      const hinge = b.joint(`${id}Flap${s > 0 ? "L" : "R"}`, {
        parent: base,
        at: xf.p([s * (doorW + 0.008), 0.035, wr + 0.012]),
        dir: [0, 1, 0],
        role: "hinge",
        group: id,
      });
      const kf = kit(xf, hinge);
      kf.box(paint((p) => (Math.floor((xf.inv(p).x + 1) / 0.03) % 2 ? c1 : c2)), [doorW + 0.01, wallH - 0.045, 0.01], [s * (doorW / 2 + 0.004), (wallH + 0.035) / 2 + 0.01, wr + 0.012]);
      kf.box(trim, [doorW + 0.01, 0.012, 0.014], [s * (doorW / 2 + 0.004), wallH - 0.02, wr + 0.012]);
      b.pose(hinge, { axis: [0, 1, 0], deg: s * 118 });
    }
    // eave pennants
    const pa = batch(GOLD);
    const pb = batch(trim === GOLD ? RED : trim);
    for (let i = 0; i < 12; i++) {
      const a = 15 + i * 30;
      const pos = V(at[0] + Math.sin(a * DEG) * (wr + 0.012), GY + wallH - 0.012, at[1] + Math.cos(a * DEG) * (wr + 0.012));
      (i % 2 ? pa : pb).add(pennantGeo, pos, yawQ(a), [R * 0.4, R * 0.28, 1]);
    }
    // finial + flag
    k.cyl(WOOD_D, 0.008, 0.01, 0.22, 5, [0, peak + 0.1, 0]);
    k.ball(GOLD, [0.026, 0.026, 0.026], [0, peak + 0.005, 0], undefined, 6);
    const flag = b.joint(`${id}Flag`, { parent: base, at: xf.p([0, peak + 0.19, 0]), dir: xf.d([0, 0, -1]), role: "hinge", group: id });
    b.extrude(
      [
        [0, 0.045],
        [-0.17, 0.045],
        [-0.13, 0],
        [-0.17, -0.045],
        [0, -0.045],
      ],
      { at: xf.p([0, peak + 0.19, 0.0]), x: xf.d([0, 0, -1]), y: [0, 1, 0], thickness: 0.006, color: trim, bone: flag, name: `${id}Flag` },
    );
    b.pose(flag, { axis: [0, 1, 0], deg: 14 });
    // guy ropes & stakes
    for (let i = 0; i < 6; i++) {
      const a = (45 + i * 60 + 0) * DEG;
      const from: N3 = [Math.sin(a) * R * 0.97, wallH - 0.02, Math.cos(a) * R * 0.97];
      const to: N3 = [Math.sin(a) * (R + 0.14), 0.0, Math.cos(a) * (R + 0.14)];
      // ropes in local space need yaw-free angles
      guy(k, from, to);
    }
    return { xf, k };
  }
  bellTent([-1.02, -0.5], 75, 0.4, 0.34, 1.0, RED, CREAM, GOLD, "tentA");
  // bunting from tent A's flag pole to the nearest palm trunk
  {
    const a = V(-1.02, GY + 1.13, -0.5);
    const e = palmAPath.at(0.55);
    const m = a.clone().lerp(e, 0.5).add(V(0, -0.1, 0));
    const rope = catmull([a, m, e]);
    b.sweep(rope, 0.004, { bone: base, sides: 4, smooth: false, caps: "flat", color: ROPE, name: "buntingRope" });
    const cols = [batch(RED), batch(GOLD), batch(TEAL), batch(CREAM)];
    for (let i = 0; i < 12; i++) {
      const t = (i + 0.7) / 12.6;
      const p = rope.at(t);
      const tg = rope.tangentAt(t);
      cols[i % 4].add(pennantGeo, V(p.x, p.y - 0.005, p.z), yawQ((Math.atan2(-tg.z, tg.x) * 180) / Math.PI), [0.075, 0.085, 1]);
    }
  }

  // oleander bushes with pink blossoms
  for (const [bx, bz, bs] of [
    [-0.88, 0.08, 1],
    [0.28, -0.42, 0.8],
    [-0.5, -0.4, 0.7],
    [1.1, 0.75, 0.7],
  ] as const) {
    const kb = kit(new Xf(V(bx, GY, bz), bx * 90, bs));
    kb.ico("#3f9a50", [0.12, 0.09, 0.11], [0, 0.06, 0], undefined, 1);
    kb.ico("#5cb85c", [0.09, 0.07, 0.09], [0.07, 0.1, 0.03], [0, 30, 0], 1);
    kb.ico("#2f8446", [0.08, 0.07, 0.08], [-0.07, 0.09, -0.03], [0, 60, 0], 1);
    const fl1 = batch(PINK);
    const fl2 = batch("#ffd3e4");
    for (let i = 0; i < 8; i++) {
      const a = i * 2.4 + bx;
      (i % 2 ? fl1 : fl2).add(new THREE.IcosahedronGeometry(0.02 * bs, 0), V(bx + Math.cos(a) * 0.1 * bs, GY + (0.09 + 0.05 * ((i * 7) % 3) / 2) * bs, bz + Math.sin(a) * 0.09 * bs));
    }
  }

  // --- ridge tent ---
  {
    const xf = new Xf(V(0.88, GY, -0.74), -30);
    const k = kit(xf);
    const W = 0.42;
    const D = 0.3;
    const he = 0.3;
    const hr = 0.68;
    const local = (p: THREE.Vector3) => xf.inv(p);
    const roofPaint = (c1: string, c2: string) =>
      paint((p) => {
        const l = local(p);
        return Math.floor((l.z + 0.5) / 0.085) % 2 ? c1 : c2;
      });
    const slope = Math.atan2(hr - he, W);
    const len = Math.hypot(W, hr - he);
    for (const s of [1, -1]) {
      k.box(roofPaint(BLUE, CREAM), [len + 0.02, 0.022, D * 2 + 0.14], [s * (W / 2), (hr + he) / 2, 0], [0, 0, -s * slope * (180 / Math.PI)]);
    }
    // ridge beam + finials
    k.box(WOOD, [0.03, 0.03, D * 2 + 0.34], [0, hr + 0.012, 0.0]);
    k.ball(GOLD, [0.028, 0.028, 0.028], [0, hr + 0.012, D + 0.19], undefined, 6);
    k.ball(GOLD, [0.028, 0.028, 0.028], [0, hr + 0.012, -D - 0.19], undefined, 6);
    // back gable + side walls
    k.box("#5a3a3e", [W * 2 - 0.08, he - 0.01, 0.014], [0, (he - 0.01) / 2, -D + 0.02]);
    b.extrude(
      [
        [-W + 0.04, 0],
        [W - 0.04, 0],
        [W - 0.04, he - 0.02],
        [0, hr - 0.02],
        [-W + 0.04, he - 0.02],
      ],
      { at: xf.p([0, 0, -D + 0.02]), x: xf.d([1, 0, 0]), y: [0, 1, 0], thickness: 0.014, color: paint((p) => { const l = local(p); return Math.floor((Math.abs(l.x) + l.y) / 0.07) % 2 ? "#6a4650" : "#5a3a3e"; }), bone: base, name: "tentBGable" },
    );
    for (const s of [1, -1]) {
      k.box(roofPaint(CREAM, BLUE), [0.014, he - 0.02, D * 1.0], [s * (W - 0.04), (he - 0.02) / 2, -D * 0.5 + 0.02]);
      // front pole
      k.cyl(WOOD, 0.014, 0.016, he + 0.01, 6, [s * (W - 0.02), (he + 0.01) / 2, D + 0.08]);
      k.ball(GOLD, [0.02, 0.02, 0.02], [s * (W - 0.02), he + 0.015, D + 0.08], undefined, 5);
      // tie-back curtain
      k.box(roofPaint(CREAM, BLUE), [0.012, he - 0.05, 0.12], [s * (W - 0.03), (he - 0.05) / 2, D - 0.02], [0, s * 25, 0]);
    }
    // roof patches with cross-stitches
    for (const s of [1, -1]) {
      const dx = (s * W) / len;
      const dy = (he - hr) / len;
      const nx = s * Math.sin(slope);
      const ny = Math.cos(slope);
      const u = s > 0 ? 0.58 : 0.4;
      const pz = s > 0 ? -0.1 : 0.12;
      const pcx = dx * len * u + nx * 0.016;
      const pcy = hr + dy * len * u + ny * 0.016;
      const rot = [0, 0, -s * slope * (180 / Math.PI)];
      k.box(s > 0 ? ORANGE : TEAL, [len * 0.2, 0.006, 0.13], [pcx, pcy, pz], rot);
      for (const sz of [-1, 1]) k.box(CREAM, [len * 0.2 + 0.012, 0.004, 0.006], [pcx + nx * 0.004, pcy + ny * 0.004, pz + sz * 0.06], rot);
      k.box(CREAM, [0.006, 0.004, 0.13], [pcx + nx * 0.004, pcy + ny * 0.004, pz], rot);
    }
    k.cyl(WOOD, 0.016, 0.018, hr, 6, [0, hr / 2, D + 0.16]);
    // valance pennants on the front edges
    const va = batch(RED);
    const vb = batch(GOLD);
    for (const s of [1, -1]) {
      for (let i = 0; i < 7; i++) {
        const u = (i + 0.5) / 7;
        const x = s * (u * W + 0.0);
        const y = hr - (hr - he) * u + 0.0 - 0.012;
        (i % 2 ? va : vb).add(pennantGeo, xf.p([x, y, D + 0.075]), xf.q.clone(), [0.11, 0.1, 1]);
      }
    }
    // interior: rugs, cushions, lamp
    b.part(new THREE.PlaneGeometry(0.56, 0.36), "#ffffff", {
      bone: base,
      at: xf.p([0, 0.006, 0.02]),
      quat: xf.rot([-90, 0, 0]),
      texture: RUG_TEX("#d9503f", "#f6dca0", "#2f9a9a", "#7a2f6a"),
    });
    b.part(new THREE.PlaneGeometry(0.46, 0.3), "#ffffff", {
      bone: base,
      at: xf.p([0.05, 0.007, D + 0.34]),
      quat: xf.rot([-90, 0, 8]),
      texture: RUG_TEX("#2f6fd0", "#fff1d2", "#f0a030", "#d9503f"),
    });
    const cush = (c1: string, c2: string) => paint((p) => (Math.floor((local(p).x + local(p).z + 1) / 0.03) % 2 ? c1 : c2));
    k.box(cush(PLUM, "#9a6ac8"), [0.17, 0.05, 0.13], [-0.22, 0.035, -0.16], [0, 12, 0]);
    k.box(cush(TEAL, "#7fe0d4"), [0.15, 0.045, 0.12], [-0.06, 0.03, -0.18], [0, -8, 0]);
    k.box(cush(RED, "#ff9a8a"), [0.15, 0.05, 0.12], [0.2, 0.035, -0.17], [0, 20, 0]);
    k.box(cush(GOLD, "#ffe08a"), [0.13, 0.04, 0.11], [0.08, 0.03, -0.0], [0, -25, 0]);
    // low table with tea set
    k.cyl(WOOD_D, 0.1, 0.1, 0.012, 8, [0.06, 0.1, 0.18]);
    for (const a of [0, 90, 180, 270]) k.cyl(WOOD_D, 0.008, 0.008, 0.095, 4, [0.06 + Math.sin(a * DEG) * 0.07, 0.05, 0.18 + Math.cos(a * DEG) * 0.07]);
    k.cyl(GOLD, 0.085, 0.085, 0.006, 8, [0.06, 0.108, 0.18]);
    const pot = (at: [number, number, number], col: string) => {
      b.lathe(
        [
          [0, 0],
          [0.032, 0],
          [0.045, 0.03],
          [0.03, 0.06],
          [0.015, 0.066],
          [0, 0.07],
        ],
        { at: xf.p(at), segments: 8, color: col, bone: base },
      );
      k.cone(col, 0.006, 0.05, 4, [at[0] + 0.052, at[1] + 0.036, at[2]], [0, 0, -50]);
      k.torus(col, 0.018, 0.005, 3, 6, [at[0] - 0.045, at[1] + 0.036, at[2]], [0, 0, 0]);
      k.ball(GOLD, [0.009, 0.009, 0.009], [at[0], at[1] + 0.075, at[2]], undefined, 5);
    };
    pot([0.06, 0.114, 0.19], GOLD);
    for (const [dx, dz] of [
      [-0.04, 0.12],
      [0.14, 0.12],
      [0.1, 0.25],
    ])
      b.lathe(
        [
          [0, 0],
          [0.014, 0],
          [0.02, 0.026],
          [0.0, 0.026],
        ],
        { at: xf.p([dx + 0.0, 0.114, dz + 0.0]), segments: 6, color: CREAM, bone: base },
      );
    // hanging lantern
    const lj = b.joint("lanternA", { parent: base, at: xf.p([0, hr, 0.1]), dir: [0, -1, 0], role: "hinge", group: "tentB" });
    const kl = kit(xf, lj);
    kl.rod(WOOD_D, [0, hr, 0.1], [0, hr - 0.1, 0.1], 0.004, 4);
    kl.ball(GOLD, [0.02, 0.012, 0.02], [0, hr - 0.105, 0.1], undefined, 6);
    glow(
      b.lathe(
        [
          [0, 0],
          [0.03, 0],
          [0.04, 0.045],
          [0.03, 0.09],
          [0, 0.09],
        ],
        { at: xf.p([0, hr - 0.205, 0.1]), segments: 6, color: "#ffbe5a", bone: lj, name: "lanternGlass" },
      ),
      1.3,
    );
    kl.cone(GOLD, 0.045, 0.04, 6, [0, hr - 0.1, 0.1]);
    kl.cyl(GOLD, 0.03, 0.03, 0.012, 6, [0, hr - 0.208, 0.1]);
    b.pose(lj, { axis: [1, 0, 0], deg: 6 });
    // guy ropes
    for (const s of [1, -1]) {
      guy(k, [s * (W + 0.02), he - 0.01, D + 0.12], [s * (W + 0.12), 0, D + 0.26]);
      guy(k, [s * (W + 0.02), he - 0.01, -D + 0.1], [s * (W + 0.12), 0, -D - 0.1]);
    }
  }

  // --- market canopy ---
  {
    const xf = new Xf(V(-1.1, GY, 0.32), 90);
    const k = kit(xf);
    const stripes = (c1: string, c2: string) =>
      paint((p) => {
        const l = xf.inv(p);
        return Math.floor((l.x + 0.5) / 0.07) % 2 ? c1 : c2;
      });
    // roof slants down toward +z front
    const roof = k.box(stripes(GOLD, TEAL), [0.66, 0.02, 0.5], [0, 0.5, 0.0], [-12, 0, 0]);
    void roof;
    for (const sx of [1, -1]) {
      k.cyl(WOOD, 0.014, 0.016, 0.54, 6, [sx * 0.31, 0.27, -0.2]);
      k.cyl(WOOD, 0.014, 0.016, 0.42, 6, [sx * 0.31, 0.21, 0.22]);
      k.ball(RED, [0.02, 0.02, 0.02], [sx * 0.31, 0.54, -0.2], undefined, 5);
    }
    const va = batch(RED);
    const vb = batch(CREAM);
    for (let i = 0; i < 9; i++) {
      const x = -0.3 + (i + 0.5) * (0.62 / 9);
      (i % 2 ? va : vb).add(pennantGeo, xf.p([x, 0.44, 0.25]), xf.q.clone(), [0.07, 0.07, 1]);
    }
    // rug, cushion, goods
    b.part(new THREE.PlaneGeometry(0.62, 0.42), "#ffffff", {
      bone: base,
      at: xf.p([0, 0.006, 0.0]),
      quat: xf.rot([-90, 0, 0]),
      texture: RUG_TEX("#2f9a9a", "#ffe9b8", "#d9503f", "#7a2f6a"),
    });
    const cp = paint((p) => (Math.floor((xf.inv(p).x + 1) / 0.04) % 2 ? RED : "#ffb0a0"));
    k.box(cp, [0.15, 0.05, 0.12], [-0.17, 0.034, -0.06], [0, 15, 0]);
    k.box(stripes(PLUM, "#b48ae0"), [0.14, 0.05, 0.12], [0.17, 0.034, 0.06], [0, -20, 0]);
    // fruit crate with melons and dates
    k.box(WOOD, [0.2, 0.09, 0.14], [0.0, 0.05, -0.15]);
    k.box(WOOD_D, [0.21, 0.015, 0.15], [0.0, 0.098, -0.15]);
    const melons = batch("#4a9a4a");
    const oranges = batch(ORANGE);
    const mg = new THREE.IcosahedronGeometry(0.04, 0);
    melons.add(mg, xf.p([-0.05, 0.14, -0.15]), undefined, [1, 0.9, 1]);
    melons.add(mg, xf.p([0.04, 0.14, -0.18]), undefined, 1);
    oranges.add(mg, xf.p([0.05, 0.135, -0.12]), undefined, 0.8);
    oranges.add(mg, xf.p([-0.03, 0.13, -0.1]), undefined, 0.75);
    // awning lanterns and bunting
    const lj = b.joint("lanternB", { parent: base, at: xf.p([0.0, 0.5, 0.22]), dir: [0, -1, 0], role: "hinge", group: "canopy" });
    const kl = kit(xf, lj);
    kl.rod(WOOD_D, [0, 0.5, 0.22], [0, 0.43, 0.22], 0.004, 4);
    glow(
      b.lathe(
        [
          [0, 0],
          [0.022, 0],
          [0.03, 0.035],
          [0.022, 0.07],
          [0, 0.07],
        ],
        { at: xf.p([0, 0.36, 0.22]), segments: 6, color: "#ffbe5a", bone: lj, name: "lanternGlassB" },
      ),
      1.3,
    );
    kl.cone(GOLD, 0.034, 0.03, 6, [0, 0.435, 0.22]);
    b.pose(lj, { axis: [0, 0, 1], deg: -7 });
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Rock arch at the back
  // ---------------------------------------------------------------------------------------------------------------
  {
    const strata = paint((p) => {
      const y = p.y + 0.012 * Math.sin(p.x * 14 + p.z * 9);
      const i = Math.floor((y - GY) / 0.08);
      return ["#c9703f", "#e59a58", "#a85a38", "#f0b878", "#d6824a"][((i % 5) + 5) % 5];
    });
    const k = kit(new Xf(V(-0.12, GY, -1.16), 6));
    k.ico(strata, [0.2, 0.46, 0.2], [-0.25, 0.31, 0], [0, 20, 6], 0);
    k.ico(strata, [0.22, 0.4, 0.2], [0.27, 0.26, 0.01], [0, -15, -5], 0);
    k.ico(strata, [0.42, 0.12, 0.2], [0.0, 0.56, 0.0], [0, 5, 4], 0);
    k.ico(strata, [0.15, 0.1, 0.14], [0.45, 0.06, 0.15], [0, 40, 0], 0);
    k.ico(strata, [0.12, 0.08, 0.12], [-0.45, 0.05, 0.14], [0, 10, 0], 0);
    k.ico(strata, [0.1, 0.1, 0.1], [0.0, 0.68, 0.0], [0, 20, 0], 0);
    const rk = (ox: number, oz: number, yaw: number, sc: number) => {
      const kr = kit(new Xf(V(ox, GY, oz), yaw, sc));
      kr.ico(strata, [0.22, 0.34, 0.18], [0, 0.2, 0], [0, 20, 5], 0);
      kr.ico(strata, [0.16, 0.26, 0.15], [0.2, 0.13, 0.08], [0, -30, -6], 0);
      kr.ico(strata, [0.12, 0.1, 0.11], [-0.18, 0.04, 0.12], [0, 40, 0], 0);
      kr.ico(strata, [0.1, 0.1, 0.1], [0.02, 0.46, 0.0], [0, 10, 0], 0);
    };
    rk(-0.82, -1.12, 20, 1);
    rk(0.66, -1.16, -25, 0.85);
    // flag on top
    k.cyl(WOOD_D, 0.006, 0.007, 0.2, 5, [0.0, 0.78, 0.0]);
    b.extrude(
      [
        [0, 0.04],
        [0.13, 0.025],
        [0.1, 0.0],
        [0.13, -0.025],
        [0, -0.04],
      ],
      { at: [-0.12, GY + 0.85, -1.16], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.006, color: TEAL, bone: base, name: "rockFlag" },
    );
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Campfire with pot, log seats
  // ---------------------------------------------------------------------------------------------------------------
  {
    const xf = new Xf(V(-0.42, GY, -0.92), 0);
    const k = kit(xf);
    const stones = batch(STONE_D);
    const ig = new THREE.IcosahedronGeometry(1, 0);
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      stones.add(ig, xf.p([Math.cos(a) * 0.12, 0.012, Math.sin(a) * 0.12]), eulerQ(random() * 40, random() * 360, 0), [0.03, 0.022, 0.03]);
    }
    for (const a of [0, 60, 120]) k.cyl(WOOD_D, 0.014, 0.014, 0.17, 5, [0, 0.02, 0], [90, a, 0]);
    glow(k.cone(ORANGE, 0.055, 0.13, 5, [0, 0.1, 0]), 1.2);
    glow(k.cone("#ffd34a", 0.032, 0.1, 5, [0.01, 0.1, 0.008]), 1.6);
    glow(k.cone(RED, 0.03, 0.08, 4, [-0.04, 0.075, -0.02], [0, 0, 12]), 1.1);
    // tripod + pot
    for (const a of [20, 140, 260]) {
      const ax = Math.sin(a * DEG);
      const az = Math.cos(a * DEG);
      k.rod(WOOD, [ax * 0.2, 0.0, az * 0.2], [0, 0.34, 0], 0.009, 5);
    }
    k.rod("#43485a", [0, 0.34, 0], [0, 0.25, 0], 0.004, 4);
    b.lathe(
      [
        [0, 0],
        [0.04, 0],
        [0.07, 0.04],
        [0.075, 0.08],
        [0.06, 0.085],
        [0.06, 0.075],
        [0.0, 0.075],
      ],
      { at: xf.p([0, 0.17, 0]), segments: 8, color: "#43485a", bone: base, name: "pot" },
    );
    k.torus("#43485a", 0.065, 0.006, 3, 8, [0, 0.25, 0], [90, 0, 0]);
    // steam puffs
    const steam = batch("#ffffff");
    for (let i = 0; i < 3; i++) steam.add(new THREE.IcosahedronGeometry(0.03 - i * 0.004, 0), xf.p([0.01 * i, 0.3 + i * 0.07, 0.01 * i]));
    // log seats
    k.cyl(WOOD, 0.045, 0.05, 0.14, 7, [0.26, 0.05, 0.06], [0, 0, 0]);
    k.cyl("#e8d3a8", 0.04, 0.04, 0.004, 7, [0.26, 0.122, 0.06]);
    k.cyl(WOOD, 0.045, 0.05, 0.28, 7, [-0.1, 0.045, 0.28], [0, 0, 90]);
    k.cyl(WOOD_D, 0.04, 0.04, 0.004, 7, [0.04, 0.045, 0.28], [0, 0, 90]);
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Props: jars, baskets, barrels, crates, sacks, rolled rugs
  // ---------------------------------------------------------------------------------------------------------------
  function jar(at: [number, number], s: number, c1: string, c2: string, lid = false) {
    const pj = paint((_p, _n, st) => {
      const h = st[0] / s;
      if (h > 0.255) return c2;
      if (h > 0.17 && h < 0.19) return c2;
      if (h > 0.07 && h < 0.085) return c2;
      return c1;
    });
    b.lathe(
      [
        [0, 0],
        [0.04 * s, 0],
        [0.07 * s, 0.05 * s],
        [0.085 * s, 0.13 * s],
        [0.07 * s, 0.21 * s],
        [0.04 * s, 0.26 * s],
        [0.05 * s, 0.29 * s],
        [0.03 * s, 0.29 * s],
        [0, 0.26 * s],
      ],
      { at: [at[0], GY, at[1]], segments: 8, color: pj, bone: base, name: "jar" },
    );
    const k = kit(new Xf(V(at[0], GY, at[1]), 0, s));
    for (const sx of [1, -1]) k.torus(c1, 0.035, 0.008, 3, 5, [sx * 0.05, 0.24, 0], [0, 0, sx * -20], [0.8, 1, 1]);
    if (lid) k.cone(c2, 0.045, 0.05, 8, [0, 0.31, 0]);
  }
  jar([-0.72, -0.78], 1.2, "#d9663c", CREAM);
  jar([-0.64, -0.7], 0.9, TEAL, GOLD, true);
  jar([-0.78, -0.68], 0.8, "#c8503c", GOLD);
  jar([0.66, -0.3], 1.0, "#e0a040", "#7a2f6a");
  jar([1.3, -0.4], 0.85, "#b8503c", CREAM, true);

  function basket(at: [number, number], s: number, c1: string, c2: string) {
    const bp = paint((_p, _n, st) => (Math.floor((st[0] / s) / 0.022) + Math.floor(st[1] / 30)) % 2 ? c1 : c2);
    b.lathe(
      [
        [0, 0],
        [0.07 * s, 0],
        [0.1 * s, 0.1 * s],
        [0.085 * s, 0.1 * s],
        [0.0, 0.01 * s],
      ],
      { at: [at[0], GY, at[1]], segments: 12, color: bp, bone: base, name: "basket" },
    );
    return kit(new Xf(V(at[0], GY, at[1]), 0, s));
  }
  {
    const kb = basket([0.2, 0.9], 1.1, "#d9a84a", "#b8832e");
    kb.cone(GOLD, 0.026, 0.05, 6, [0, 0.09, 0]);
    const dt = batch(ORANGE);
    for (let i = 0; i < 5; i++) dt.add(new THREE.IcosahedronGeometry(0.024, 0), V(0.2 + Math.cos(i * 1.3) * 0.05, GY + 0.11, 0.9 + Math.sin(i * 1.3) * 0.05));
    const kc = basket([-0.82, 0.5], 0.9, "#c89a3a", "#a67a28");
    void kc;
    const lm = batch("#ffd34a");
    for (let i = 0; i < 4; i++) lm.add(new THREE.IcosahedronGeometry(0.026, 0), V(-0.82 + Math.cos(i * 1.6) * 0.04, GY + 0.1, 0.5 + Math.sin(i * 1.6) * 0.04), undefined, [1.1, 0.8, 1]);
  }

  function barrel(at: [number, number], s: number) {
    const bp = paint((_p, _n, st) => {
      const h = st[0] / s;
      if ((h > 0.02 && h < 0.04) || (h > 0.13 && h < 0.15)) return "#43485a";
      return Math.floor(st[1] / 30) % 2 ? WOOD : "#b07a46";
    });
    b.lathe(
      [
        [0, 0],
        [0.07 * s, 0],
        [0.09 * s, 0.08 * s],
        [0.07 * s, 0.17 * s],
        [0, 0.17 * s],
      ],
      { at: [at[0], GY, at[1]], segments: 12, color: bp, bone: base, name: "barrel" },
    );
  }
  barrel([1.0, -0.1], 1.2);
  barrel([1.12, 0.0], 1.0);
  barrel([-0.86, 0.04], 1.0);

  // crate stack + sacks near the tents
  {
    const k = kit(new Xf(V(-0.42, GY, -0.2), 20));
    void k;
    const kc = kit(new Xf(V(0.42, GY, -0.98), 25));
    kc.box(WOOD, [0.2, 0.15, 0.18], [0, 0.075, 0]);
    kc.box(WOOD_D, [0.21, 0.02, 0.19], [0, 0.01, 0]);
    kc.box(WOOD_D, [0.21, 0.02, 0.19], [0, 0.14, 0]);
    kc.box(WOOD_D, [0.02, 0.15, 0.19], [0.09, 0.075, 0]);
    kc.box(WOOD_D, [0.02, 0.15, 0.19], [-0.09, 0.075, 0]);
    kc.rod(WOOD_D, [-0.09, 0.01, 0.101], [0.09, 0.14, 0.101], 0.008, 4);
    kc.box(WOOD, [0.15, 0.12, 0.13], [0.02, 0.21, 0.0], [0, 18, 0]);
    kc.box(ROPE, [0.152, 0.014, 0.132], [0.02, 0.21, 0.0], [0, 18, 0]);
    const sack = (xf: Xf, col: string, patch: string) => {
      const ks = kit(xf);
      ks.ball(col, [0.1, 0.1, 0.085], [0, 0.085, 0], undefined, 7);
      ks.ball(col, [0.055, 0.06, 0.05], [0, 0.17, 0], undefined, 6);
      ks.torus(ROPE, 0.032, 0.008, 3, 6, [0, 0.155, 0], [90, 0, 0]);
      ks.cone(col, 0.03, 0.05, 5, [0, 0.21, 0]);
      ks.box(patch, [0.045, 0.045, 0.01], [0.0, 0.1, 0.082], [0, 0, 8]);
    };
    sack(new Xf(V(-1.08, GY, -0.12), 40), "#e8d5a8", RED);
    sack(new Xf(V(-1.18, GY, -0.02), -20), "#d4bc88", TEAL);
    sack(new Xf(V(0.98, GY, 0.86), 10, 0.9), "#e8d5a8", BLUE);
    sack(new Xf(V(0.88, GY, 0.96), -30, 0.8), "#d4bc88", GOLD);
  }
  // rolled rugs leaning on tent A
  {
    const rp = paint((_p, _n, st) => {
      const i = Math.floor(st[0] * 14);
      return [RED, CREAM, BLUE, GOLD][((i % 4) + 4) % 4];
    });
    const rg = new THREE.CylinderGeometry(0.04, 0.04, 0.34, 8);
    b.part(rg, rp, { bone: base, at: [-0.7, GY + 0.17, -0.7], rotation: [4, 20, 6], flat: true });
    b.part(rg, paint((_p, _n, st) => (Math.floor(st[0] * 10) % 2 ? TEAL : "#ffe9b8")), { bone: base, at: [-0.64, GY + 0.17, -0.77], rotation: [6, 5, -6], flat: true });
  }

  // signpost with swinging board
  {
    const xf = new Xf(V(0.64, GY, 0.98), -15);
    const k = kit(xf);
    k.cyl(WOOD_D, 0.022, 0.026, 0.62, 6, [0, 0.31, 0]);
    k.ball(GOLD, [0.03, 0.03, 0.03], [0, 0.63, 0], undefined, 5);
    // a hoopoe perched on the post
    const BIRD = "#e8a070";
    k.ball(BIRD, [0.034, 0.03, 0.046], [0, 0.69, 0], [-8, 0, 0]);
    k.ball(BIRD, [0.024, 0.024, 0.024], [0, 0.73, 0.04]);
    k.cone(INK, 0.007, 0.045, 5, [0, 0.725, 0.085], [90, 0, 0]);
    for (const sx of [1, -1]) {
      k.ball(INK, [0.005, 0.005, 0.005], [sx * 0.018, 0.735, 0.056], undefined, 4);
      k.ball(CREAM, [0.008, 0.024, 0.04], [sx * 0.032, 0.69, -0.005], [-10, 0, sx * 12], 5);
      k.cone(ORANGE, 0.007, 0.05, 4, [sx * 0.012, 0.77, -0.01], [-25, 0, sx * -18]);
    }
    k.cone(ORANGE, 0.007, 0.055, 4, [0, 0.775, -0.015], [-30, 0, 0]);
    k.box(INK, [0.03, 0.006, 0.06], [0, 0.69, -0.07], [-12, 0, 0]);
    k.box(CREAM, [0.03, 0.007, 0.012], [0, 0.692, -0.06], [-12, 0, 0]);
    k.box(WOOD, [0.2, 0.016, 0.1], [0, 0.004, 0.0]);
    k.box(WOOD, [0.06, 0.016, 0.02], [0, 0.5, 0.0]);
    const sign = (y: number, flip: number, col: string, tex: ReturnType<typeof svg>, jn: string) => {
      const j = b.joint(jn, { parent: base, at: xf.p([0, y, 0.03]), dir: [0, 1, 0], role: "hinge", group: "sign" });
      const ks = kit(xf, j);
      b.extrude(
        [
          [-0.14 * flip, 0.045],
          [0.1 * flip, 0.045],
          [0.19 * flip, 0],
          [0.1 * flip, -0.045],
          [-0.14 * flip, -0.045],
        ],
        { at: xf.p([0, y, 0.036]), x: xf.d([1, 0, 0]), y: [0, 1, 0], thickness: 0.016, bevel: 0.003, color: col, bone: j, name: jn + "Board" },
      );
      b.part(new THREE.PlaneGeometry(0.075, 0.075), "#ffffff", { bone: j, at: xf.p([-0.07 * flip, y, 0.046]), dir: xf.d([0, 0, 1]), axis: "z", texture: tex });
      ks.box(CREAM, [0.05, 0.008, 0.004], [0.04 * flip, y + 0.012, 0.046]);
      ks.box(CREAM, [0.07, 0.008, 0.004], [0.05 * flip, y - 0.012, 0.046]);
      return j;
    };
    const j1 = sign(0.54, 1, "#c9873f", DROP, "signA");
    const j2 = sign(0.43, -1, "#b8683a", PALMICON, "signB");
    b.pose(j1, { axis: [0, 1, 0], deg: 10 });
    b.pose(j2, { axis: [0, 1, 0], deg: -8 });
  }

  // cactus + boulders on the left
  {
    const xf = new Xf(V(-1.22, GY, -0.58), 0);
    const k = kit(xf);
    const cp = paint((_p, _n, st) => (Math.floor((st[1] + 15) / 30) % 2 ? "#4fa35a" : "#3f8f4e"));
    const trunk = b.sweep([xf.p([0, -0.02, 0]), xf.p([0, 0.34, 0])], 0.05, { bone: base, sides: 6, smooth: false, color: cp, caps: "round", name: "cactus" });
    void trunk;
    for (const s of [1, -1]) {
      const y = s > 0 ? 0.2 : 0.14;
      b.sweep([xf.p([s * 0.04, y, 0]), xf.p([s * 0.12, y, 0]), xf.p([s * 0.15, y + 0.1, 0]), xf.p([s * 0.15, y + 0.17, 0])], 0.028, { bone: base, sides: 6, smooth: false, color: cp, caps: "round", name: "cactusArm" });
    }
    k.ball(PINK, [0.02, 0.014, 0.02], [0, 0.375, 0], undefined, 5);
    k.ball(GOLD, [0.008, 0.008, 0.008], [0, 0.39, 0], undefined, 4);
    k.ball(PINK, [0.015, 0.011, 0.015], [0.15, 0.38, 0], undefined, 5);
    const sp = batch(CREAM);
    for (let i = 0; i < 14; i++) {
      const a = random() * 6.28;
      sp.add(new THREE.ConeGeometry(0.004, 0.018, 3), xf.p([Math.cos(a) * 0.05, 0.03 + random() * 0.28, Math.sin(a) * 0.05]), eulerQ(0, 0, 0), 1);
    }
    // small barrel cactus
    const k2 = kit(new Xf(V(-1.05, GY, -0.8), 0));
    k2.ball(cp, [0.055, 0.05, 0.055], [0, 0.04, 0], undefined, 8);
    k2.ball(PINK, [0.02, 0.012, 0.02], [0, 0.09, 0], undefined, 5);
    const bold = kit(new Xf(V(-1.15, GY, -0.28), 0));
    bold.ico(STONE, [0.1, 0.07, 0.09], [0, 0.02, 0], [0, 30, 0], 0);
    bold.ico(STONE_L, [0.06, 0.05, 0.05], [0.1, 0.0, 0.05], [0, 10, 0], 0);
  }

  // scattered pebbles, tufts and dry bushes
  {
    const peb = batch(STONE_L);
    const pebD = batch(STONE_D);
    const ig = new THREE.IcosahedronGeometry(1, 0);
    for (let i = 0; i < 26; i++) {
      const a = random() * 6.28;
      const r = 0.35 + random() * 1.0;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      if (Math.hypot((x - PC.x) / PRX, (z - PC.z) / PRZ) < 1.3) continue;
      const s = 0.012 + random() * 0.018;
      (i % 2 ? peb : pebD).add(ig, V(x, GY + 0.004, z), eulerQ(random() * 90, random() * 360, 0), [s * 1.3, s * 0.7, s]);
    }
    // grass tufts around the pond and palms
    const g = [] as ReturnType<typeof frame>[];
    for (let i = 0; i < 26; i++) {
      const a = (i / 26) * Math.PI * 2 + random() * 0.2;
      const f = 1.2 + 0.35 * random();
      const x = PC.x + Math.cos(a) * PRX * f;
      const z = PC.z + Math.sin(a) * PRZ * f;
      g.push(frame([x, GY, z], [0, 1, 0]));
    }
    b.cards(g, TUFT_G, { size: [0.1, 0.09], vary: 0.4, spin: 180, cross: true, rng: rng(21), bone: base, sink: 0.1, lean: 6, bend: 10 });
    const dry = [] as ReturnType<typeof frame>[];
    for (const [x, z] of [
      [0.12, -0.95],
      [-0.9, -0.1],
      [1.2, -0.45],
      [-0.9, 0.8],
      [0.95, 0.9],
      [-0.45, 1.0],
      [1.05, 0.55],
      [0.5, -0.6],
      [-0.6, -0.7],
      [-1.2, 0.1],
      [0.7, 1.05],
      [0.25, 0.95],
    ] as const)
      dry.push(frame([x, GY, z], [0, 1, 0]));
    b.cards(dry, TUFT_DRY, { size: [0.12, 0.11], vary: 0.3, spin: 180, cross: true, rng: rng(22), bone: base, sink: 0.1, lean: 6, bend: 10 });
    // camel footprints heading to the pond
    const pr = batch("#dcb072");
    const pg = new THREE.CylinderGeometry(0.03, 0.03, 0.004, 6);
    for (let i = 0; i < 9; i++) {
      const t = i / 8;
      const x = 0.4 + t * 0.3 + (i % 2 ? 0.05 : -0.05);
      const z = 1.05 - t * 0.2;
      pr.add(pg, V(x, GY + 0.002, z), yawQ(-60), [1, 1, 1.3]);
    }
  }

  // fennec fox at the water
  {
    const xf = new Xf(V(0.42, GY, 0.9), 200);
    const k = kit(xf);
    const FOX = "#f2c88a";
    k.ball(FOX, [0.06, 0.07, 0.07], [0, 0.07, 0], [-10, 0, 0]);
    k.ball(CREAM, [0.04, 0.05, 0.03], [0, 0.06, 0.05]);
    k.ball(FOX, [0.05, 0.045, 0.05], [0, 0.145, 0.03], [-10, 0, 0]);
    k.ball(CREAM, [0.03, 0.025, 0.03], [0, 0.135, 0.07]);
    k.ball(INK, [0.012, 0.01, 0.01], [0, 0.138, 0.098], undefined, 5);
    for (const s of [1, -1]) {
      k.cone(FOX, 0.028, 0.11, 4, [s * 0.035, 0.22, 0.0], [-10, 0, -s * 14]);
      k.cone("#f5a6a0", 0.014, 0.08, 4, [s * 0.036, 0.215, 0.012], [-10, 0, -s * 14]);
      k.ball(INK, [0.007, 0.01, 0.006], [s * 0.024, 0.155, 0.07], undefined, 4);
      k.cap(FOX, [s * 0.03, 0.06, 0.04], [s * 0.03, 0.012, 0.075], 0.014, 5);
    }
    b.sweep([xf.p([0, 0.035, -0.06]), xf.p([0, 0.02, -0.15]), xf.p([0.03, 0.03, -0.22])], [0.03, 0.022], { bone: base, sides: 5, smooth: false, color: FOX, caps: "round", name: "foxTail" });
    k.ball(INK, [0.022, 0.02, 0.022], [0.03, 0.03, -0.22], undefined, 5);
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Camels
  // ---------------------------------------------------------------------------------------------------------------
  type CamelCfg = {
    id: string;
    at: [number, number];
    yaw: number;
    s: number;
    pose: "stand" | "drink" | "kneel";
    headScale?: number;
    blanket?: boolean;
    saddle?: boolean;
    panniers?: boolean;
    coat?: string;
  };
  function camel(c: CamelCfg) {
    const { id } = c;
    const coatBase = c.coat ?? COAT;
    const xf = new Xf(V(c.at[0], GY, c.at[1]), c.yaw, c.s);
    const kneel = c.pose === "kneel";
    const drop = kneel ? 0.3 : 0;
    const coat: Fill = paint((p) => {
      const l = xf.inv(p);
      const nz = noise(p, 0.09, 4);
      const sock = kneel ? 0 : 1 - smoothstep(0.05, 0.2, l.y);
      return mix(mix(coatBase, "#c58a47", 0.4 * nz), COAT_D, sock * 0.75);
    });
    const body = b.joint(`${id}Body`, { parent: base, at: xf.p([0, 0.56 - drop, 0]), dir: xf.d([0, 0, 1]), role: "spine", group: id });
    const k = kit(xf, body);

    // body
    const bodyPts = [
      [0, 0.58 - drop, -0.36],
      [0, 0.6 - drop, -0.02],
      [0, 0.56 - drop, 0.32],
    ].map((p) => xf.p(p));
    b.sweep(catmull(bodyPts), (t) => [(0.1 + 0.075 * Math.sin(Math.PI * (0.12 + 0.78 * t))) * c.s, (0.13 + 0.085 * Math.sin(Math.PI * (0.12 + 0.78 * t))) * c.s], {
      bone: body,
      sides: 7,
      smooth: false,
      color: coat,
      sectors: [[130, 230, BELLY]],
      name: `${id}Torso`,
    });
    // hump (wearing a kilim cape), shoulder and haunch masses
    const kilim = paint((p) => {
      const l = xf.inv(p);
      const zig = Math.abs((((l.z * 16) % 2) + 2) % 2 - 1);
      const u = Math.floor((l.y - (0.76 - drop)) * -28 + zig * 1.4 + 20);
      if (l.y > 0.9 - drop) return COAT_D;
      return [RED, CREAM, TEAL, GOLD][((u % 4) + 4) % 4];
    });
    k.ball(c.blanket ? kilim : COAT_D, [0.14, 0.15, 0.16], [0, 0.83 - drop, -0.02], [-6, 0, 0]);
    k.cone(COAT_D, 0.032, 0.07, 5, [0, 0.99 - drop, -0.03], [-14, 0, 0]);
    for (const s of [1, -1]) {
      k.ball(coat, [0.1, 0.14, 0.15], [s * 0.1, 0.5 - drop, -0.25], [0, 0, 0]);
      k.ball(coat, [0.09, 0.13, 0.12], [s * 0.11, 0.52 - drop, 0.2], [0, 0, 0]);
    }
    k.ball(COAT_D, [0.1, 0.07, 0.08], [0, 0.4 - drop, 0.3]); // chest pad

    // legs
    for (const s of [1, -1]) {
      if (!kneel) {
        const f = c.pose === "drink" && s > 0 ? 0.08 : 0; // drinking pose: one foreleg forward
        b.sweep(
          catmull([xf.p([s * 0.12, 0.52, 0.24]), xf.p([s * 0.115, 0.3, 0.255 + f * 0.5]), xf.p([s * 0.11, 0.15, 0.25 + f * 0.8]), xf.p([s * 0.11, 0.04, 0.25 + f])]),
          [0.058 * c.s, 0.028 * c.s],
          { bone: body, sides: 6, smooth: false, color: coat, caps: "flat", name: `${id}LegF` },
        );
        k.ball(COAT_D, [0.04, 0.04, 0.04], [s * 0.115, 0.3, 0.275 + f * 0.5], undefined, 5);
        k.ico(PAD, [0.05, 0.026, 0.065], [s * 0.11, 0.022, 0.26 + f], undefined, 0);
        k.box(CREAM, [0.016, 0.012, 0.012], [s * 0.11 + 0.016, 0.026, 0.328 + f]);
        k.box(CREAM, [0.016, 0.012, 0.012], [s * 0.11 - 0.016, 0.026, 0.328 + f]);
        b.sweep(catmull([xf.p([s * 0.13, 0.55, -0.28]), xf.p([s * 0.14, 0.34, -0.22]), xf.p([s * 0.12, 0.17, -0.31]), xf.p([s * 0.115, 0.04, -0.27])]), [0.065 * c.s, 0.03 * c.s], {
          bone: body,
          sides: 6,
          smooth: false,
          color: coat,
          caps: "flat",
          name: `${id}LegH`,
        });
        k.ball(COAT_D, [0.04, 0.04, 0.04], [s * 0.14, 0.34, -0.2], undefined, 5);
        k.ico(PAD, [0.05, 0.026, 0.065], [s * 0.115, 0.022, -0.255], undefined, 0);
        k.box(CREAM, [0.016, 0.012, 0.012], [s * 0.115 + 0.016, 0.026, -0.19]);
        k.box(CREAM, [0.016, 0.012, 0.012], [s * 0.115 - 0.016, 0.026, -0.19]);
      } else {
        // folded legs
        b.sweep([xf.p([s * 0.12, 0.28, 0.24]), xf.p([s * 0.13, 0.07, 0.42])], [0.055 * c.s, 0.04 * c.s], { bone: body, sides: 6, smooth: false, color: coat, caps: "round", name: `${id}LegF` });
        b.sweep([xf.p([s * 0.135, 0.065, 0.42]), xf.p([s * 0.14, 0.055, 0.1])], [0.042 * c.s, 0.034 * c.s], { bone: body, sides: 6, smooth: false, color: coat, caps: "round", name: `${id}LegF2` });
        k.ball(COAT_D, [0.04, 0.04, 0.04], [s * 0.13, 0.065, 0.43], undefined, 5);
        k.ico(PAD, [0.05, 0.026, 0.06], [s * 0.14, 0.032, 0.085], undefined, 0);
        b.sweep([xf.p([s * 0.15, 0.34, -0.26]), xf.p([s * 0.17, 0.08, -0.39])], [0.08 * c.s, 0.045 * c.s], { bone: body, sides: 6, smooth: false, color: coat, caps: "round", name: `${id}LegH` });
        b.sweep([xf.p([s * 0.17, 0.065, -0.39]), xf.p([s * 0.16, 0.055, -0.1])], [0.04 * c.s, 0.032 * c.s], { bone: body, sides: 6, smooth: false, color: coat, caps: "round", name: `${id}LegH2` });
        k.ball(COAT_D, [0.045, 0.04, 0.045], [s * 0.17, 0.07, -0.395], undefined, 5);
        k.ico(PAD, [0.05, 0.026, 0.06], [s * 0.16, 0.032, -0.075], undefined, 0);
      }
    }

    // neck + head
    let neckPts: number[][];
    let pitch: number;
    if (c.pose === "drink") {
      neckPts = [
        [0, 0.62, 0.24],
        [0, 0.74, 0.44],
        [0, 0.62, 0.6],
        [0, 0.4, 0.68],
      ];
      pitch = 62;
    } else if (kneel) {
      neckPts = [
        [0, 0.34, 0.24],
        [0, 0.56, 0.38],
        [0, 0.78, 0.42],
        [0, 0.92, 0.5],
      ];
      pitch = 14;
    } else {
      neckPts = [
        [0, 0.62, 0.24],
        [0, 0.82, 0.36],
        [0, 1.0, 0.4],
        [0, 1.12, 0.5],
      ];
      pitch = 18;
    }
    const names = neckPts.slice(0, -1).map((_, i) => `${id}Neck${i + 1}`);
    names.push(`${id}Head`);
    const neck = b.chain(`${id}Neck`, catmull(neckPts.map((p) => xf.p(p))), { parent: body, names, role: "neck", group: id });
    const neckTube = b.sweep(neck, (t) => (0.11 - 0.05 * t) * c.s, { sides: 7, smooth: false, color: coat, sectors: [[130, 230, BELLY]], name: `${id}NeckTube` });
    b.along(neckTube, 5, (at) => b.spike(at, at, 0.05 * c.s, 0.016 * c.s, { color: COAT_D, sides: 4, name: `${id}Mane` }), { from: 0.15, to: 0.85 });
    const head = neck.tip!;
    const hs = c.s * (c.headScale ?? 1);
    const hx = new Xf(xf.p(neckPts[neckPts.length - 1]), c.yaw, hs, pitch);
    const kh = kit(hx, head);
    if (c.pose === "drink") {
      const tip = hx.p([0, -0.05, 0.25]);
      const rr = batch("#eafffb");
      rr.add(new THREE.TorusGeometry(0.06, 0.004, 3, 10), V(tip.x, GY + 0.015, tip.z), eulerQ(90, 0, 0));
      rr.add(new THREE.TorusGeometry(0.1, 0.004, 3, 12), V(tip.x, GY + 0.015, tip.z), eulerQ(90, 0, 0));
      const dr = batch("#eafffb");
      dr.add(new THREE.IcosahedronGeometry(0.009, 0), V(tip.x + 0.02, GY + 0.06, tip.z - 0.01));
      dr.add(new THREE.IcosahedronGeometry(0.007, 0), V(tip.x - 0.02, GY + 0.045, tip.z + 0.02));
    }
    kh.ball(coat, [0.075, 0.072, 0.09], [0, 0, 0.02]);
    kh.ball(coat, [0.06, 0.055, 0.11], [0, -0.028, 0.115]);
    kh.ball("#c9985a", [0.056, 0.045, 0.05], [0, -0.043, 0.185]);
    kh.box(INK, [0.004, 0.03, 0.006], [0, -0.045, 0.232]);
    for (const s of [1, -1]) {
      kh.ball(INK, [0.011, 0.008, 0.008], [s * 0.022, -0.025, 0.226], undefined, 4);
      kh.ball(EYE, [0.024, 0.026, 0.02], [s * 0.066, 0.03, 0.055], undefined, 6);
      kh.ball("#ffffff", [0.009, 0.009, 0.007], [s * 0.079, 0.042, 0.07], undefined, 4);
      for (let i = 0; i < 3; i++) {
        const th = (40 + i * 30) * DEG;
        const rim = hx.p([s * (0.066 + 0.02 * Math.cos(th)), 0.03 + 0.022 * Math.sin(th), 0.062]);
        const tip = hx.p([s * (0.066 + 0.036 * Math.cos(th)), 0.03 + 0.04 * Math.sin(th), 0.07]);
        b.sweep([rim, tip], [0.004 * hs, 0.0015 * hs], { bone: head, sides: 3, smooth: false, caps: "flat", color: INK, name: `${id}Lash` });
      }
      kh.ball(PINK, [0.02, 0.013, 0.008], [s * 0.058, -0.012, 0.09], [0, s * 70, 0], 5);
      kh.ball(coat, [0.026, 0.045, 0.014], [s * 0.05, 0.075, -0.02], [0, 0, -s * 30], 5);
      kh.ball("#e8a89a", [0.014, 0.028, 0.008], [s * 0.052, 0.074, -0.012], [0, 0, -s * 30], 4);
      kh.ball(COAT_D, [0.03, 0.025, 0.03], [s * 0.065, -0.01, 0.0]);
    }
    kh.cone(COAT_D, 0.03, 0.06, 5, [0, 0.075, 0.0], [-30, 0, 0]);
    // halter
    kh.torus(RED, 0.062, 0.007, 3, 7, [0, -0.03, 0.1], undefined, [1, 0.9, 1]);
    kh.torus(GOLD, 0.066, 0.005, 3, 7, [0, 0.0, 0.0], undefined, [1, 1, 1]);
    kh.ball(GOLD, [0.012, 0.012, 0.012], [0, -0.075, 0.135], undefined, 5);
    kh.cone(RED, 0.012, 0.045, 4, [0, -0.1, 0.135], [180, 0, 0]);
    // jaw
    const jaw = b.joint(`${id}Jaw`, { parent: head, at: hx.p([0, -0.05, 0.04]), aim: hx.p([0, -0.065, 0.17]), role: "jaw", group: id });
    const kj = kit(hx, jaw);
    kj.ball(coat, [0.04, 0.026, 0.085], [0, -0.062, 0.115]);
    kj.ball("#c9985a", [0.028, 0.02, 0.03], [0, -0.068, 0.19]);
    // neck collar with bell
    const cp = neck.at(0.22);
    b.part(new THREE.TorusGeometry(0.1 * c.s, 0.014 * c.s, 3, 7), RED, { at: cp.at, dir: cp.tangent, axis: "z", bone: cp.bone ?? body, flat: true });
    b.part(new THREE.SphereGeometry(0.026 * c.s, 6, 4), GOLD, { at: cp.at.clone().add(xf.d([0, -0.04 * c.s, 0.1 * c.s])), bone: cp.bone ?? body, flat: true });

    // tail
    const tailPts = kneel
      ? [
          [0, 0.34, -0.38],
          [0, 0.2, -0.48],
          [0, 0.06, -0.5],
        ]
      : [
          [0, 0.64, -0.38],
          [0, 0.5, -0.47],
          [0, 0.3, -0.5],
        ];
    const tail = b.chain(`${id}Tail`, catmull(tailPts.map((p) => xf.p(p))), { parent: body, names: [`${id}Tail1`, `${id}Tail2`, `${id}TailTip`], role: "tail", group: id });
    b.sweep(tail, [0.042 * c.s, 0.022 * c.s], { color: coat, sides: 5, smooth: false, name: `${id}TailTube` });
    kit(xf, tail.tip!).ball(COAT_D, [0.04, 0.06, 0.04], tailPts[2].map((v, i) => (i === 1 ? v - 0.03 : v)));

    // kilim saddle cloth side flaps + tassels
    if (c.blanket) {
      const tb = batch(GOLD);
      const tr = batch(RED);
      for (const s of [1, -1]) {
        k.box(kilim, [0.016, 0.18, 0.33], [s * 0.172, 0.62 - drop, -0.02], [0, 0, s * 9]);
        for (let i = 0; i < 6; i++) {
          (i % 2 ? tb : tr).add(new THREE.ConeGeometry(0.012 * c.s, 0.04 * c.s, 4), xf.p([s * 0.215, 0.49 - drop, -0.15 + i * 0.06]), new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI, 0, 0)));
        }
      }
    }
    if (c.saddle) {
      k.box(paint((p) => (Math.floor((xf.inv(p).x + 1) / 0.03) % 2 ? PLUM : "#a67ad4")), [0.2, 0.05, 0.16], [0, 0.99 - drop, -0.04], [-6, 0, 0]);
      for (const sx of [1, -1]) for (const sz of [1, -1]) k.ball(GOLD, [0.014, 0.014, 0.014], [sx * 0.1, 0.99 - drop, -0.04 + sz * 0.08], undefined, 5);
    }
    if (c.panniers) {
      for (const s of [1, -1]) {
        const bp = paint((p) => (Math.floor(((xf.inv(p).y + xf.inv(p).z) * 1 + 2) / 0.03) % 2 ? "#d9a84a" : "#b8832e"));
        k.box(bp, [0.08, 0.13, 0.14], [s * 0.28, 0.4, -0.02]);
        k.box(WOOD_D, [0.084, 0.012, 0.145], [s * 0.28, 0.465, -0.02]);
        k.rod(ROPE, [s * 0.2, 0.7, -0.02], [s * 0.26, 0.47, -0.05], 0.006, 4);
        k.rod(ROPE, [s * 0.2, 0.7, -0.02], [s * 0.26, 0.47, 0.03], 0.006, 4);
      }
      k.cyl(paint((_p, _n, st) => (Math.floor(st[0] * 12) % 2 ? TEAL : CREAM)), 0.045, 0.045, 0.3, 8, [0, 0.85, -0.26], [0, 0, 90]);
      k.torus(ROPE, 0.046, 0.005, 3, 8, [0.08, 0.85, -0.26], [0, 90, 0]);
      k.torus(ROPE, 0.046, 0.005, 3, 8, [-0.08, 0.85, -0.26], [0, 90, 0]);
    }
    return { body, head, xf };
  }

  camel({ id: "camelA", at: [1.02, 0.42], yaw: -100, s: 0.72, pose: "drink", blanket: true, panniers: true });
  camel({ id: "camelB", at: [-0.78, 0.8], yaw: 68, s: 0.72, pose: "kneel", blanket: true, saddle: true, coat: "#e2b676" });
  camel({ id: "camelC", at: [-0.12, 1.06], yaw: 8, s: 0.42, pose: "stand", headScale: 1.4, coat: "#e8c58a" });

  // ---------------------------------------------------------------------------------------------------------------
  for (const bt of batches) bt.flush();
  void smoothstep;
  return b.root;
}
