import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import { DEG, rng } from "../../../../src/math";
import { catmull, polyline } from "../../../../src/path";
import { paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Kraken",
  description:
    "A colossal kraken rising out of the deep, eight tentacles splayed along the floor and four raised to the sky, glowing cyan eye, glyphs and luminous nodes on a deep violet armored mantle.",
  style: "Overwatch",
  commit: "88fc1f0",
};

const DEEP = "#3d2a8c";
const MID = "#5a3fc4";
const LIGHT = "#7d5df0";
const PALE = "#d8cbff";
const DARK = "#1c1448";
const STEEL = "#2b2d6b";
const BONE = "#efe8ff";
const CYAN = "#18f0dc";
const CUP = "#f3c8ff";

const frac = (x: number) => x - Math.floor(x);

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "kraken" });
  const R = rng(7);

  // ---------- paints ----------
  const MANTLE = cel(
    paint((p, n) => {
      if (n.z > 0.35 && p.y < 3.3 && p.y > 1.3 && Math.abs(p.x) < 0.75) return MID;
      if (frac(p.y * 4.5 + Math.abs(p.x) * 1.7) < 0.12) return LIGHT;
      if (n.y < -0.2) return PALE;
      return DEEP;
    }),
  );
  const TENT = cel(
    paint((_p, n, s) => {
      const belly = Math.cos(s[1] * DEG) < -0.45;
      if (s[0] > 0.9) return CYAN;
      if (belly) return PALE;
      if (frac(s[0] * 20) < 0.1) return DARK;
      if (n.y > 0.55 && frac(s[0] * 10 + 0.5) < 0.3) return LIGHT;
      return DEEP;
    }),
  );
  const FIN = cel(
    paint((_p, _n, s) => {
      if (Math.abs(s[1] - 0.15 - s[0] * 0.25) < 0.035) return CYAN;
      if (s[0] > 0.85) return LIGHT;
      return MID;
    }),
  );
  const SKIRT = cel(
    paint((_p, _n, s) => (frac(s[1] / 30) < 0.08 ? DARK : STEEL)),
  );

  // ---------- mantle ----------
  const MY = 1.2;
  const mantle = b.lathe(
    [
      [0, 0],
      [0.55, 0.05],
      [0.95, 0.4],
      [1.1, 1.0],
      [1.0, 1.7],
      [0.75, 2.3],
      [0.42, 2.75],
      [0, 3.0],
    ],
    { at: [0, MY, 0], smoothing: 1, segments: 14, color: MANTLE },
  );
  const skin = b.surface(mantle);

  // skirt where the arms root
  b.lathe(
    [
      [0, 0],
      [1.15, 0],
      [1.28, 0.15],
      [1.08, 0.42],
      [0.9, 0.5],
      [0, 0.5],
    ],
    { at: [0, 0.95, 0], segments: 12, color: SKIRT },
  );
  // armored collar
  b.lathe(
    [
      [0.95, 0],
      [1.12, 0.04],
      [1.16, 0.22],
      [1.0, 0.32],
    ],
    { at: [0, 1.55, 0], segments: 14, color: STEEL },
  );

  const ring = (r: number, y: number, n = 14) => {
    const pts: number[][] = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      pts.push([Math.sin(a) * r, y, Math.cos(a) * r]);
    }
    return polyline(pts, { closed: true });
  };
  glow(b.sweep(ring(1.17, 1.72), 0.035, CYAN, { sides: 6 }), 1.2);
  glow(b.sweep(ring(1.3, 1.1), 0.03, CYAN, { sides: 6 }), 1.0);
  b.sweep(ring(1.2, 1.58), 0.03, BONE, { sides: 6 });
  // glowing rings round the mantle on its surface
  for (const y of [2.2, 2.65, 3.1]) {
    const loop = skin.loop([0, y, 0], { dir: [0, 1, 0], lift: 0.02 });
    glow(b.sweep(loop, 0.022, CYAN, { sides: 6 }), 1.2);
  }

  // collar rivets
  const rivets: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    rivets.push(new THREE.SphereGeometry(0.035, 5, 4).translate(Math.sin(a) * 1.16, 1.7, Math.cos(a) * 1.16));
  }
  b.part(mergeGeometries(rivets)!, BONE, { at: [0, 0, 0] });

  // dorsal crest of spikes
  for (let i = 0; i < 8; i++) {
    const hit = skin.around([0, 2.4, 0]).at(180, -10 + i * 11);
    if (!hit) continue;
    const k = 1 - i * 0.07;
    b.stick(new THREE.ConeGeometry(0.1 * k, 0.55 * k, 5), i % 2 ? STEEL : LIGHT, hit);
  }

  // side fins
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, -0.2],
        [0.6, -0.45],
        [1.1, -0.2],
        [1.05, 0.5],
        [0.6, 1.0, "sharp"],
        [0.25, 0.7],
        [0, 0.6],
      ],
      { at: [s * 0.82, 2.7, -0.1], x: [s, 0.45, 0], thickness: [0.1, 0.03], bevel: 0.02, smoothing: 1, color: FIN },
    );
  }

  // glowing dots over the mantle
  const dots = skin.scatter(34, { rng: R, minDist: 0.28, filter: (h) => h.n.y > 0.1 });
  for (const h of dots) glow(b.stick(new THREE.SphereGeometry(0.05, 6, 4), CYAN, h), 1.2);

  // glyph decal
  const GLYPH = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 96"><g fill="none" stroke="${CYAN}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M32 8 L32 88"/><path d="M12 30 L32 50 L52 30"/><path d="M12 52 L32 72 L52 52"/><circle cx="32" cy="22" r="8"/></g></svg>`,
    { size: 256 },
  );
  const gHit = skin.around([0, 2.9, 0]).at(0, 8);
  if (gHit) glow(b.decal(skin, GLYPH, { at: gHit, size: [0.4, 0.6], dir: [0, 0, 1] }), 1.2);

  // ---------- eyes ----------
  const C: [number, number, number] = [0, 2.0, 0];
  const EYEBALL = "#c8fff7";
  for (const s of [1, -1]) {
    const hit = skin.around(C).at(s * 34, 0);
    if (hit) {
      b.stick(new THREE.SphereGeometry(0.24, 8, 6), STEEL, hit);
      glow(b.stick(new THREE.SphereGeometry(0.18, 8, 6), EYEBALL, hit.moved([0, 0.06, 0])), 1.4);
      b.stick(new THREE.BoxGeometry(0.05, 0.03, 0.22), INK, hit.moved([0, 0.2, 0]));
    }
    const brow = skin.around(C).at(s * 34, 20);
    if (brow) b.stick(new THREE.BoxGeometry(0.38, 0.07, 0.1), DARK, brow);
  }

  // ---------- beak ----------
  b.spike([0, 1.4, 0.5], [0, -0.55, 0.85], 0.55, 0.17, BONE, { sides: 6 });
  b.spike([0, 1.1, 0.5], [0, 0.35, 0.9], 0.4, 0.12, STEEL, { sides: 6 });

  // oral arms
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.3, 1.15, 0.6],
        [s * 0.55, 0.8, 1.0],
        [s * 0.8, 0.6, 1.4],
        [s * 0.7, 0.8, 1.7],
      ]),
      [0.1, 0.085, 0.06, 0.025],
      TENT,
    );
  }

  // ---------- tentacles ----------
  const floorPts: Array<[number, number]> = [
    [0.75, 1.3],
    [1.5, 1.55],
    [2.3, 1.0],
    [3.0, 0.38],
    [3.6, 0.09],
    [4.2, 0.28],
    [4.6, 0.65],
  ];
  const floorR = [0.3, 0.27, 0.21, 0.15, 0.1, 0.06, 0.02];
  const raisedPts: Array<[number, number]> = [
    [0.7, 1.6],
    [1.3, 2.3],
    [1.7, 3.3],
    [1.4, 4.2],
    [0.8, 4.6],
    [0.4, 4.3],
  ];
  const raisedR = [0.26, 0.22, 0.17, 0.12, 0.07, 0.03];

  const dotGeos: THREE.BufferGeometry[] = [];
  const cupGeos: THREE.BufferGeometry[] = [];
  const cupIn: THREE.BufferGeometry[] = [];

  const rAt = (radii: number[], t: number) => {
    const f = t * (radii.length - 1);
    const i = Math.min(radii.length - 2, Math.floor(f));
    return radii[i] + (radii[i + 1] - radii[i]) * (f - i);
  };

  const tentacle = (
    a: number,
    reach: number,
    swing: number,
    pts: Array<[number, number]>,
    radii: number[],
    tMax: number,
  ) => {
    const n = pts.length;
    const P = pts.map(([r0, y], i) => {
      const f = i / (n - 1);
      const ang = a + swing * f * f;
      const r = r0 * reach;
      return [Math.sin(ang) * r, y, Math.cos(ang) * r];
    });
    const path = catmull(P);
    b.sweep(path, radii, TENT, { sides: 8 });
    for (let t = 0.14; t < tMax; t += 0.06) {
      const pos = path.at(t);
      const r = rAt(radii, t);
      const inward = new THREE.Vector3(-pos.x, 0, -pos.z).normalize().multiplyScalar(0.5);
      const dir = new THREE.Vector3(0, -0.85, 0).add(inward).normalize();
      const c = pos.clone().addScaledVector(dir, r * 0.93);
      cupGeos.push(new THREE.SphereGeometry(r * 0.34, 6, 4).scale(1, 0.55, 1).translate(c.x, c.y, c.z));
      const c2 = pos.clone().addScaledVector(dir, r * 1.0);
      cupIn.push(new THREE.SphereGeometry(r * 0.18, 5, 3).scale(1, 0.5, 1).translate(c2.x, c2.y, c2.z));
    }
    for (let t = 0.18; t < tMax - 0.05; t += 0.1) {
      const pos = path.at(t);
      const r = rAt(radii, t);
      dotGeos.push(new THREE.SphereGeometry(r * 0.2, 6, 4).translate(pos.x, pos.y + r * 0.95, pos.z));
    }
  };

  for (let k = 0; k < 8; k++) {
    const a = k * (Math.PI / 4);
    tentacle(a, 0.88 + R() * 0.22, (k % 2 ? 1 : -1) * (0.3 + R() * 0.3), floorPts, floorR, 0.85);
  }
  for (let k = 0; k < 4; k++) {
    const a = (22.5 + 90 * k) * DEG;
    tentacle(a, 0.9 + R() * 0.2, (k % 2 ? 1 : -1) * 0.5, raisedPts, raisedR, 0.9);
  }

  b.part(mergeGeometries(cupGeos)!, CUP, { at: [0, 0, 0] });
  b.part(mergeGeometries(cupIn)!, DARK, { at: [0, 0, 0] });
  glow(b.part(mergeGeometries(dotGeos)!, CYAN, { at: [0, 0, 0] }), 1.2);

  return b.root;
}
