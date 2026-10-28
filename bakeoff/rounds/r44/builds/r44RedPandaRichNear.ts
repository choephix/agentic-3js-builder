import * as THREE from "three";
import { createBuilder, rng, catmull, polyline, limb, paint, mix, noise, smoothstep, countershade, mottle } from "../../../../src/index";
import { cel, animeEye, INK } from "../../../../kits/toon";

export const meta = {
  name: "Red Panda on Mossy Stone",
  description: "Cel-shaded, anime-styled red panda standing on a moss-covered stone, with a ringed tail, cream-rimmed ears and cheek ruffs.",
};

const ORANGE = cel("#e2682a");
const RUST = cel("#a8381a");
const CREAM = cel("#fff1d6", "#e9cfae");
const DARK = cel("#3a2024", "#241218");
const BELLY = cel("#5a2a22", "#3a1a1a");
const MOSS = cel("#6fbf4a", "#3f8a4a");
const MOSS_L = cel("#a8e060", "#5fae5a");

export default function build() {
  const b = createBuilder({ name: "redPanda", paintSize: 1024 });
  const r = rng(5);
  const HC: [number, number, number] = [0, 0.62, 0.36];
  const h = (x: number, y: number, z: number): [number, number, number] => [HC[0] + x, HC[1] + y, HC[2] + z];

  // skeleton
  const hips = b.joint("hips", { at: [0, 0.5, -0.28], dir: [0, 0, 1], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.5, -0.28], [0, 0.5, 0.0], [0, 0.55, 0.24]]), {
    parent: hips, names: ["spine1", "chest"], role: "spine",
  });
  const chest = spine.joints[1];
  const neck = b.chain("neck", polyline([[0, 0.57, 0.22], [0, 0.6, 0.31]]), {
    parent: chest, names: ["neck1", "neck2"], role: "neck",
  });
  const head = b.joint("head", { parent: neck.tip!, at: h(0, 0, -0.04), dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: h(0, -0.04, 0.03), aim: h(0, -0.045, 0.12), role: "jaw" });

  // stone
  const stonePaint = paint((p, n) => {
    let c = mix("#6d6a74", "#8e8a94", noise(p, 0.12, 3));
    c = mix(c, "#4a4852", smoothstep(0.1, -0.6, n.y) * 0.6);
    const moss = smoothstep(0.1, 0.5, n.y + (noise(p, 0.09, 8) - 0.5) * 0.8);
    c = mix(c, mix("#4f9e3e", "#8fd05a", noise(p, 0.05, 2)), moss);
    return c;
  });
  const stone = b.lathe(
    [[0, 0], [0.34, 0], [0.4, 0.09], [0.35, 0.2], [0.24, 0.26], [0, 0.265]],
    { at: [0, 0, 0], bone: hips, segments: 9, color: stonePaint, name: "stone" },
  );
  const sk = b.surface(stone);
  for (const hit of sk.scatter(14, { rng: r, minDist: 0.1, filter: (q) => q.n.y > 0.3 && q.at.y > 0.12 })) {
    b.stick(new THREE.IcosahedronGeometry(0.03 + r() * 0.025, 0), r() > 0.5 ? MOSS : MOSS_L, hit, { embed: 0.4, bone: hips, flat: true });
  }

  // body
  const coat = cel(countershade(mottle("#e2682a", "#d8571e", { size: 0.15 }), BELLY, { level: -0.3 }));
  b.loft(
    [
      { at: [0, 0.5, -0.32], w: 0.2, h: 0.2 },
      { at: [0, 0.5, -0.1], w: 0.27, h: 0.25 },
      { at: [0, 0.52, 0.1], w: 0.28, h: 0.26 },
      { at: [0, 0.56, 0.26], w: 0.23, h: 0.22 },
    ],
    { bone: [hips, spine], color: coat, sides: 10, name: "body" },
  );
  b.sweep(neck, 0.075, { color: coat, sides: 8, name: "neck" });

  // head
  const headPaint = paint((p, n) => {
    const dz = p.z - HC[2];
    const dy = p.y - HC[1];
    if (dz > 0.095 && dy < -0.005) return CREAM;
    if (Math.abs(p.x) > 0.045 && dy < 0.0 && dz > -0.02) return CREAM;
    if (dy > 0.045 && Math.abs(p.x) < 0.02) return RUST;
    return coat.at(p, n) && ORANGE;
  });
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), headPaint, { bone: head, at: HC, scale: [0.088, 0.073, 0.08], name: "skull" });
  b.part(new THREE.SphereGeometry(1, 10, 8), CREAM, { bone: head, at: h(0, -0.025, 0.075), scale: [0.04, 0.03, 0.04], name: "muzzle" });
  b.part(new THREE.SphereGeometry(0.014, 6, 5), DARK, { bone: head, at: h(0, -0.007, 0.112), scale: [1.2, 0.8, 0.9], name: "nose" });
  b.part(new THREE.SphereGeometry(1, 8, 6), CREAM, { bone: jaw, at: h(0, -0.05, 0.075), scale: [0.03, 0.017, 0.04], name: "lowerJaw" });

  // eyes
  const EYE = animeEye({ iris: "#ffb02e", size: 256 });
  const hs = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = hs.around(HC).at(s * 36, 2);
    if (hit) b.decal(hs, EYE, { at: hit, size: [0.046, 0.063], mirror: s > 0, bone: head });
    const brow = hs.around(HC).at(s * 30, 32);
    if (brow) b.stick(new THREE.SphereGeometry(0.012, 6, 4), CREAM, brow, { embed: 0.3, bone: head });
    // ears with cream rims
    const eo: [number, number][] = [[-0.036, 0], [0.036, 0], [0.042, 0.042], [0, 0.072], [-0.042, 0.042]];
    b.extrude(eo, { at: h(s * 0.058, 0.055, -0.012), x: [1, 0, 0], y: [s * 0.35, 1, 0], thickness: 0.022, bevel: 0.005, smoothing: 1, color: ORANGE, bone: head, name: "ear" });
    b.extrude(eo.map(([x, y]) => [x * 0.62, y * 0.62 + 0.004] as [number, number]), {
      at: h(s * 0.058, 0.055, 0.001), x: [1, 0, 0], y: [s * 0.35, 1, 0], thickness: 0.008, smoothing: 1, color: CREAM, bone: head, name: "earInner",
    });
    // cheek ruffs
    for (const [dy, len, ry] of [[-0.02, 0.05, 0.3], [-0.04, 0.045, -0.1], [0.0, 0.045, 0.6]] as const) {
      b.spike(h(s * 0.07, dy, 0.0), [s, ry - 0.2, 0.25], len, 0.018, { bone: head, color: CREAM, sides: 5, name: "ruff" });
    }
    // tear marks
    b.rod(h(s * 0.04, -0.015, 0.073), h(s * 0.05, -0.042, 0.062), 0.005, { bone: head, color: RUST, sides: 4 });
  }

  // legs
  const legPaint = cel(paint((p) => (p.y < 0.4 ? "#2c181c" : "#a8381a")));
  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";
    for (const front of [true, false]) {
      const root: [number, number, number] = [s * 0.1, 0.45, front ? 0.15 : -0.2];
      const foot: [number, number, number] = [s * 0.1, 0.292, front ? 0.2 : -0.14];
      const pts = limb(root, foot, [0.11, 0.11], [0, 0, front ? -1 : 1]);
      const names = front ? [`shoulder${k}`, `elbow${k}`, `pawF${k}`] : [`hip${k}`, `knee${k}`, `pawH${k}`];
      const chain = b.chain(`leg${front ? "F" : "H"}${k}`, pts, {
        parent: front ? chest : hips, names, role: "leg", contact: [foot[0], 0.26, foot[2]],
      });
      b.sweep(chain, [0.052, 0.036], { color: legPaint, sides: 8, name: `leg${front ? "F" : "H"}${k}` });
      b.part(new THREE.SphereGeometry(1, 8, 6), DARK, { bone: chain.tip!, at: [foot[0], 0.285, foot[2] + 0.025], scale: [0.04, 0.03, 0.055], name: "paw" });
      for (const dx of [-0.018, 0, 0.018])
        b.spike([foot[0] + dx, 0.282, foot[2] + 0.07], [0, -0.2, 1], 0.02, 0.006, { bone: chain.tip!, color: CREAM, sides: 4 });
    }
  }

  // ringed tail
  const tail = b.chain("tail", catmull([[0, 0.5, -0.38], [0, 0.5, -0.6], [0, 0.58, -0.8], [0, 0.75, -0.88], [0, 0.93, -0.8]]), {
    parent: hips, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail",
  });
  const rings = paint((_p, _n, s) => {
    const k = Math.floor(s[0] * 10);
    if (s[0] > 0.96) return DARK;
    return k % 2 ? RUST : ORANGE;
  });
  b.sweep(tail, (t) => 0.06 - 0.022 * t * t + 0.012 * Math.sin(t * 9), { color: rings, sides: 8, name: "tail" });

  return b.root;
}
