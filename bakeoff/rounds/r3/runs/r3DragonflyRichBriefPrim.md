```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Emperor Dragonfly",
  description:
    "An emperor dragonfly hovering above a pond: electric-blue abdomen with black dorsal marks, apple-green thorax, turquoise wraparound eyes, four veined glassy wings held flat, and six tucked legs.",
};

type V = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "emperor_dragonfly" });
  const H = 0.22; // hover height (m)

  const sub = (p: V, q: V): V => [p[0] - q[0], p[1] - q[1], p[2] - q[2]];
  const len = (d: V) => Math.hypot(d[0], d[1], d[2]);
  const midp = (p: V, q: V): V => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2, (p[2] + q[2]) / 2];

  // thin cylinder between two points
  const cyl = (p: V, q: V, r: number, color: string, bone: any, seg = 5) => {
    const d = sub(q, p);
    return b.part(new THREE.CylinderGeometry(r, r, len(d), seg), color, {
      at: midp(p, q),
      dir: d,
      bone,
    });
  };

  // ---------- skeleton ----------
  const thorax = b.joint("thorax", { at: [0, H, 0], role: "spine" } as any);
  const head = b.joint("head", { at: [0, H + 0.0012, 0.0095], parent: thorax, role: "head" } as any);
  const jaw = b.joint("jaw", { at: [0, H - 0.0022, 0.0165], parent: head, role: "jaw" } as any);

  // abdomen chain
  const N = 10;
  const seg = 0.0066;
  const z0 = -0.006;
  const abd: any[] = [];
  let prev: any = thorax;
  for (let i = 0; i < N; i++) {
    const j = b.joint("tail" + (i + 1), {
      at: [0, H + 0.0004 - i * 0.00004, z0 - i * seg],
      parent: prev,
      role: "tail",
    } as any);
    abd.push(j);
    prev = j;
  }

  // ---------- thorax ----------
  b.part(new THREE.SphereGeometry(0.0055, 9, 7).scale(0.95, 1, 1.55), "#8fd93a", { at: [0, H, 0], bone: thorax });
  b.part(new THREE.SphereGeometry(0.004, 7, 5).scale(1, 0.8, 1.2), "#7fcb2f", { at: [0, H + 0.0035, 0.0005], bone: thorax });
  for (const s of [1, -1]) {
    cyl([s * 0.0051, H + 0.0025, 0.0035], [s * 0.0056, H - 0.002, 0.0008], 0.00035, "#1b2a14", thorax);
    cyl([s * 0.0053, H + 0.0027, -0.0008], [s * 0.0057, H - 0.0018, -0.0033], 0.00035, "#1b2a14", thorax);
  }
  cyl([0, H + 0.0056, 0.006], [0, H + 0.0056, -0.006], 0.0003, "#1b2a14", thorax);

  // ---------- head ----------
  const hz = 0.0095;
  const hy = H + 0.0012;
  b.part(new THREE.SphereGeometry(0.0036, 7, 6).scale(1.1, 0.9, 0.9), "#d9ec6a", { at: [0, hy - 0.0004, hz + 0.0018], bone: head });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.0049, 9, 7).scale(0.9, 1.0, 1.0), "#22c7c2", { at: [s * 0.0036, hy + 0.0008, hz + 0.0004], bone: head });
    b.part(new THREE.SphereGeometry(0.0028, 6, 5), "#7beee0", { at: [s * 0.0042, hy + 0.0022, hz + 0.0016], bone: head });
    b.part(new THREE.SphereGeometry(0.0012, 5, 4), "#0b2d3a", { at: [s * 0.0044, hy + 0.0004, hz + 0.0042], bone: head });
    cyl([s * 0.0012, hy + 0.0018, hz + 0.0045], [s * 0.0016, hy + 0.0036, hz + 0.0062], 0.00012, "#222222", head, 4);
  }
  b.part(new THREE.SphereGeometry(0.0012, 6, 5), "#111a22", { at: [0, hy + 0.0034, hz + 0.0026], bone: head }); // ocellus
  b.part(new THREE.BoxGeometry(0.0034, 0.0012, 0.0016), "#e9f59a", { at: [0, hy - 0.0016, hz + 0.0046], bone: head }); // clypeus
  b.part(new THREE.BoxGeometry(0.0030, 0.0006, 0.0014), "#e6c64a", { at: [0, hy - 0.0024, hz + 0.0052], bone: head }); // labrum (upper jaw)
  b.part(new THREE.BoxGeometry(0.0026, 0.0006, 0.0016), "#d4a93a", { at: [0, H - 0.0025, 0.0172], bone: jaw }); // lower jaw
  b.part(new THREE.BoxGeometry(0.0006, 0.0006, 0.0014), "#3a2a14", { at: [0.0016, H - 0.0023, 0.0166], bone: jaw });
  b.part(new THREE.BoxGeometry(0.0006, 0.0006, 0.0014), "#3a2a14", { at: [-0.0016, H - 0.0023, 0.0166], bone: jaw });

  // ---------- abdomen ----------
  for (let i = 0; i < N; i++) {
    const j = abd[i];
    const t = i / (N - 1);
    const r = i < 2 ? 0.0044 - i * 0.0004 : 0.0032 - t * 0.0006;
    const zc = z0 - i * seg - seg / 2;
    const yc = H + 0.0004 - i * 0.00004;
    b.part(new THREE.CylinderGeometry(r, r * 0.98, seg * 1.03, 8), "#1e5cff", {
      at: [0, yc, zc], dir: [0, 0, -1], bone: j,
    });
    // dark ring at joint
    b.part(new THREE.CylinderGeometry(r * 1.04, r * 1.04, 0.0005, 8), "#10215e", {
      at: [0, yc, zc + seg / 2], dir: [0, 0, -1], bone: j,
    });
    if (i >= 1) {
      // black dorsal mark and side stripe
      b.part(new THREE.BoxGeometry(r * 0.9, 0.0005, seg * 0.55), "#0a0a14", { at: [0, yc + r + 0.0001, zc], bone: j });
      b.part(new THREE.BoxGeometry(r * 0.35, 0.0005, seg * 0.8), "#0a0a14", { at: [0, yc + r + 0.0002, zc - 0.0003], bone: j });
      for (const s of [1, -1])
        b.part(new THREE.BoxGeometry(0.0004, r * 0.35, seg * 0.7), "#0a0a14", { at: [s * (r * 0.97), yc + r * 0.1, zc], bone: j });
    }
  }
  const last = abd[N - 1];
  const zt = z0 - N * seg;
  for (const s of [1, -1]) {
    cyl([s * 0.0009, H, zt + 0.0002], [s * 0.0014, H + 0.0002, zt - 0.0042], 0.00035, "#14141c", last);
    b.part(new THREE.ConeGeometry(0.0005, 0.0012, 4), "#14141c", {
      at: [s * 0.0014, H + 0.0002, zt - 0.0048], dir: [0, 0, -1], bone: last,
    });
  }

  // ---------- wings ----------
  const foreOutline: [number, number][] = [
    [0, 0], [0.02, -0.0005], [0.045, 0], [0.052, 0.003], [0.05, 0.006], [0.04, 0.0085], [0.025, 0.0095], [0.012, 0.009], [0, 0.007],
  ];
  const hindOutline: [number, number][] = [
    [0, 0], [0.02, 0], [0.045, 0.001], [0.053, 0.004], [0.05, 0.008], [0.04, 0.0115], [0.025, 0.0145], [0.01, 0.0165], [0, 0.015],
  ];

  const makeWing = (name: string, sx: number, zs: number, outline: [number, number][], droop: number) => {
    const base: V = [sx * 0.0045, H + 0.0052, zs];
    const w = b.joint(name, { at: base, parent: thorax, role: "wing" } as any);
    const shape = new THREE.Shape();
    outline.forEach(([s, c], i) => (i === 0 ? shape.moveTo(sx * s, c) : shape.lineTo(sx * s, c)));
    const g = new THREE.ExtrudeGeometry(shape, { depth: 0.0003, bevelEnabled: false });
    g.rotateX(-Math.PI / 2);
    b.part(g, "#d9edf0", { at: base, bone: w });
    // golden sheen at the base and along the front
    const gs = new THREE.Shape();
    const gb: [number, number][] = [[0, 0], [0.016, -0.0004], [0.017, 0.0045], [0.008, 0.007], [0, outline[outline.length - 1][1]]];
    gb.forEach(([s, c], i) => (i === 0 ? gs.moveTo(sx * s, c) : gs.lineTo(sx * s, c)));
    const gg = new THREE.ExtrudeGeometry(gs, { depth: 0.00036, bevelEnabled: false });
    gg.rotateX(-Math.PI / 2);
    b.part(gg, "#f0cf72", { at: [base[0], base[1] + 0.00002, base[2]], bone: w });

    const P = (s: number, c: number, y = 0.0004): V => [base[0] + sx * s, base[1] + y, base[2] - c];
    // costa (leading edge)
    cyl(P(0, -0.0001), P(0.021, -0.0006), 0.00022, "#2b2018", w);
    cyl(P(0.021, -0.0006), P(0.046, -0.0001), 0.00022, "#2b2018", w);
    // radial veins
    const root: [number, number] = [0.002, outline[0][1] + 0.0018];
    for (let i = 3; i < outline.length - 1; i++) {
      const [s, c] = outline[i];
      cyl(P(root[0], root[1]), P(s * 0.98, c * 0.96), 0.00012, "#3a2a1c", w, 4);
    }
    cyl(P(0, 0.0012), P(0.05, 0.0035), 0.00013, "#3a2a1c", w, 4);
    // cross veins (net)
    for (let k = 1; k <= 6; k++) {
      const s = 0.008 * k;
      const cA = 0.0012 + (outline[outline.length - 2][1] * 0.0) + k * 0.0002;
      const trail = outline[outline.length - 1][1] * (1 - s / 0.06) + 0.003;
      cyl(P(s, cA), P(s + 0.0015, Math.max(trail, cA + 0.002)), 0.00008, "#4a3a2a", w, 3);
    }
    // pterostigma
    b.part(new THREE.BoxGeometry(0.003, 0.0005, 0.0008), "#3b2412", {
      at: P(0.0425, 0.0003, 0.0006), bone: w,
    });
    return w;
  };
  makeWing("wingFL", 1, 0.0045, foreOutline, 0);
  makeWing("wingFR", -1, 0.0045, foreOutline, 0);
  makeWing("wingHL", 1, -0.0025, hindOutline, 0);
  makeWing("wingHR", -1, -0.0025, hindOutline, 0);

  // ---------- legs ----------
  const zs = [0.0045, 0.0005, -0.0035];
  for (const [side, sx] of [["L", 1], ["R", -1]] as [string, number][]) {
    zs.forEach((z, i) => {
      const n = i + 1;
      const hip: V = [sx * 0.0030, H - 0.0045, z];
      const knee: V = [sx * 0.0062, H - 0.0078, z + 0.0042];
      const foot: V = [sx * 0.0058, H - 0.0125, z + 0.0004 + i * 0.0006];
      const hj = b.joint(`hip${side}${n}`, { at: hip, parent: thorax, role: "leg" } as any);
      const kj = b.joint(`knee${side}${n}`, { at: knee, parent: hj, role: "leg" } as any);
      const fj = b.joint(`foot${side}${n}`, { at: foot, parent: kj, role: "leg" } as any);
      b.part(new THREE.SphereGeometry(0.0009, 5, 4), "#2a2a1c", { at: hip, bone: hj });
      cyl(hip, knee, 0.00055, "#2a2a1c", hj);
      b.part(new THREE.SphereGeometry(0.0007, 5, 4), "#9a7a2a", { at: knee, bone: kj });
      cyl(knee, foot, 0.0004, "#1c1c14", kj);
      b.part(new THREE.ConeGeometry(0.0004, 0.0016, 4), "#111111", {
        at: [foot[0], foot[1] - 0.0006, foot[2] + 0.0004], dir: [0, -1, 0.5], bone: fj,
      });
    });
  }

  // ---------- pond scenery (static, on root) ----------
  const root = thorax;
  b.part(new THREE.CylinderGeometry(0.13, 0.13, 0.004, 20), "#2c6f7c", { at: [0, 0.002, 0], bone: root });
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.0044, 20), "#3a8795", { at: [0, 0.0022, 0], bone: root });
  for (const r of [0.03, 0.055, 0.08])
    b.part(new THREE.TorusGeometry(r, 0.0008, 3, 24).rotateX(Math.PI / 2), "#9fd8df", { at: [0, 0.0046, 0], bone: root });
  // lily pad
  b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.0012, 10), "#3f9a3a", { at: [0.07, 0.0052, 0.045], bone: root });
  b.part(new THREE.SphereGeometry(0.006, 6, 4).scale(1, 0.6, 1), "#f5a9c8", { at: [0.07, 0.009, 0.045], bone: root });
  // reeds
  for (const [x, z, h] of [[-0.09, -0.03, 0.2], [-0.1, -0.015, 0.15], [-0.085, -0.045, 0.17]] as V[]) {
    cyl([x, 0, z], [x + 0.004, h, z], 0.0012, "#4f7a2c", root, 5);
  }
  b.part(new THREE.CylinderGeometry(0.003, 0.003, 0.03, 6), "#5a3a22", { at: [-0.086, 0.185, -0.03], bone: root });

  return b.root;
}
```