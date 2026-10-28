import * as THREE from "three";
import { createBuilder, rng, catmull, mix, noise, paint, smoothstep, svg } from "../../../../src/index";
import type { OutlinePoint } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Frost-Forged Battle Axe",
  description:
    "A tall two-sided battle axe: crescent frost-steel blade with glowing rune, spiked back fluke, gold-trimmed collar, ice crystals, hanging icicles, wrapped haft and pennant. League of Legends hand-painted look.",
};

const GOLD = "#e8b84a";
const GOLD_D = "#a9741e";
const NAVY = "#1c2a54";
const ICE = "#7fe6ff";
const ICE_P = "#d8fbff";

const steel = paint((p, n) => {
  const lit = smoothstep(-0.3, 0.9, n.x * 0.4 + n.y * 0.5 + n.z * 0.6);
  let c = mix("#2c4a86", "#bfe4ff", lit);
  c = mix(c, "#ffffff", smoothstep(0.7, 0.9, noise(p, 0.05, 3)) * 0.25);
  const edge = Math.abs(p.x) > 0.36 ? smoothstep(0.36, 0.46, Math.abs(p.x)) : 0;
  return mix(c, "#f2fdff", edge * 0.6);
});
const wood = paint((p, n) => {
  const g = noise(new THREE.Vector3(p.x * 8, p.y * 0.5, p.z * 8), 0.05, 5);
  return mix("#2a1a2e", "#5a3a56", g * (0.6 + 0.4 * smoothstep(-0.5, 0.8, n.y + n.z)));
});
const wrap = paint((p) => {
  const v = (p.y / 0.03) % 1;
  return v < 0.2 ? GOLD_D : v < 0.6 ? "#25407a" : "#16254d";
});

const RUNE = svg(
  `<svg viewBox="0 0 40 60"><g fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path d="M20 4 L20 56 M20 14 L32 24 M20 14 L8 24 M20 30 L32 40 M20 30 L8 40" stroke="#1aa6e0" stroke-width="7"/>
  <path d="M20 4 L20 56 M20 14 L32 24 M20 14 L8 24 M20 30 L32 40 M20 30 L8 40" stroke="#e6ffff" stroke-width="3"/></g></svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "frostAxe", paintSize: 1024 });
  const root = b.joint("axe", { at: [0, 0, 0], dir: [0, 1, 0] });
  const R = rng(9);
  type O = Record<string, unknown>;
  const put = (g: THREE.BufferGeometry, c: any, at: [number, number, number], o: O = {}) =>
    b.part(g, c, { bone: root, at, ...o });
  const lathe = (o: OutlinePoint[], y: number, c: any, seg = 10) =>
    b.lathe(o, { at: [0, y, 0], segments: seg, color: c, bone: root });
  const HY = 1.5;

  // haft
  b.rod([0, 0.06, 0], [0, 1.42, 0], 0.03, { bone: root, color: wood, sides: 8, name: "haft" });
  put(new THREE.ConeGeometry(0.04, 0.12, 8), steel, [0, 0.06, 0], { rotation: [180, 0, 0] });
  lathe([[0.03, 0.06], [0.05, 0.08], [0.05, 0.12], [0.03, 0.14]], 0, GOLD, 8);
  b.lathe([[0.03, 0], [0.036, 0], [0.036, 0.4], [0.03, 0.4]], { at: [0, 0.3, 0], segments: 8, color: wrap, bone: root });
  for (const y of [0.28, 0.72, 1.1]) lathe([[0.03, y], [0.048, y], [0.048, y + 0.025], [0.03, y + 0.025]], 0, GOLD, 8);
  lathe([[0.03, 0.88], [0.05, 0.9], [0.05, 1.0], [0.03, 1.02]], 0, NAVY, 8);

  // collar
  lathe([[0, 1.36], [0.07, 1.36], [0.085, 1.4], [0.085, 1.6], [0.07, 1.64], [0, 1.64]], 0, NAVY, 8);
  for (const y of [1.4, 1.6]) lathe([[0.083, y - 0.012], [0.095, y - 0.012], [0.095, y + 0.012], [0.083, y + 0.012]], 0, GOLD, 8);
  glow(put(new THREE.OctahedronGeometry(0.03, 0), ICE, [0, HY, 0.085], { scale: [0.9, 1.5, 0.6] }), 1.6);

  // main blade (left, +X)
  const blade: OutlinePoint[] = [
    [0.06, 0.13], [0.2, 0.2], [0.36, 0.34, "sharp"], [0.45, 0.14], [0.41, 0.0],
    [0.45, -0.16], [0.38, -0.36, "sharp"], [0.2, -0.22], [0.06, -0.13],
  ];
  b.extrude(blade, { at: [0, HY, 0], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.04, bevel: 0.01, color: steel, bone: root, name: "blade" });
  const trim: OutlinePoint[] = [[0.06, 0.15], [0.2, 0.225], [0.2, 0.2], [0.06, 0.13]];
  b.extrude(trim, { at: [0, HY, 0], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.05, color: GOLD, bone: root, name: "bladeTrimTop" });
  b.extrude([[0.06, -0.15], [0.2, -0.245], [0.2, -0.22], [0.06, -0.13]], { at: [0, HY, 0], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.05, color: GOLD, bone: root, name: "bladeTrimBot" });
  for (const s of [1, -1])
    glow(
      b.part(new THREE.PlaneGeometry(0.17, 0.26), "#ffffff", {
        bone: root, at: [0.23, HY, s * 0.0215], dir: [0, 0, s], axis: "z", texture: RUNE, name: "rune",
      }),
      1.4,
    );

  // back fluke (-X)
  const fluke: OutlinePoint[] = [[-0.06, 0.09], [-0.2, 0.12], [-0.36, 0.03, "sharp"], [-0.5, -0.06, "sharp"], [-0.3, -0.1], [-0.06, -0.09]];
  b.extrude(fluke, { at: [0, HY, 0], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.035, bevel: 0.008, color: steel, bone: root, name: "fluke" });

  // top spike
  put(new THREE.ConeGeometry(0.04, 0.3, 6), steel, [0, 1.79, 0]);
  lathe([[0.04, 1.64], [0.06, 1.66], [0.06, 1.68], [0.04, 1.7]], 0, GOLD, 6);

  // ice crystals clustered behind the blade and on the back
  const crystals: [number, number, number, number, number][] = [
    [-0.12, 1.66, 0, 0.2, -15], [-0.2, 1.62, 0.02, 0.14, -40], [-0.15, 1.38, 0, 0.18, 150],
    [-0.28, 1.4, 0.03, 0.12, 120], [0.12, 1.68, -0.03, 0.13, 20],
  ];
  for (const [x, y, z, h, rz] of crystals)
    glow(put(new THREE.ConeGeometry(0.03, h, 5), R() > 0.5 ? ICE : ICE_P, [x, y + h / 2, z], { rotation: [0, 0, rz] }), 1.3);

  // icicles under blade
  const ic: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 6; i++) {
    const x = 0.14 + i * 0.05;
    const y = HY - 0.2 - (i > 2 ? 0.1 : 0) - i * 0.015;
    const h = 0.05 + R() * 0.07;
    const g = new THREE.ConeGeometry(0.012, h, 5);
    g.rotateX(Math.PI);
    g.translate(x, y - h / 2, 0);
    ic.push(g);
  }
  glow(b.part(mergeIc(ic), ICE_P, { bone: root, at: [0, 0, 0], name: "icicles" }), 1.1);

  // pennant
  const path = catmull([[0.09, 1.38, 0], [0.12, 1.28, 0.03], [0.1, 1.16, -0.03], [0.14, 1.04, 0.03], [0.12, 0.94, 0]]);
  b.sweep(path, (t: number) => [0.035 - 0.02 * t, 0.003], {
    section: "box", color: paint((_p, _n, s) => (s[0] > 0.9 ? GOLD : mix("#2b57c4", "#7fd0ff", s[0]))), caps: "flat", bone: root, name: "pennant",
  });
  return b.root;
}

function mergeIc(gs: THREE.BufferGeometry[]) {
  const pos: number[] = [];
  for (const g of gs) {
    const ng = g.index ? g.toNonIndexed() : g;
    pos.push(...Array.from(ng.getAttribute("position").array));
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  out.computeVertexNormals();
  return out;
}
