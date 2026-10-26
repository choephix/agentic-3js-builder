import * as THREE from "three";
import { type Builder, createBuilder, paint, noise, mix, rgb, smoothstep, svg } from "../../../../src/index";

export const meta = {
  name: "Calder Mobile",
  description: "A hanging mobile in the manner of Alexander Calder: black wire arms balancing painted red, blue, yellow and black sheet-metal shapes.",
};

export const REQUESTS = [
  { id: "redDiscRim", kind: "add", part: "redDisc", what: "Thin white painted rim line and a tiny rivet-like pivot dot where the wire joins the big red disc, in WHITE and BLACK.", at: [-1.26, 1.4, -0.06], normal: [0, 0, 1], bone: null, room: [0.5, 0.5, 0.1] },
  { id: "blueLeafVein", kind: "add", part: "blueLeaf", what: "Slim raised midrib and a few short side veins on the blue leaf in a darker BLUE_DARK, as thin strips seated on its face.", at: [-0.5, 1.05, 0.0], normal: [0, 0, 1], bone: null, room: [0.3, 0.55, 0.08] },
  { id: "yellowLeafCut", kind: "add", part: "yellowLeaf", what: "Two small round cut-out-look dots in BLACK and a thin BLACK edge line near the tip of the long yellow leaf.", at: [0.2, 0.4, 0.2], normal: [0, 0, 1], bone: null, room: [0.3, 0.75, 0.08] },
  { id: "blackHalfDots", kind: "add", part: "blackHalf", what: "A row of three small WHITE dots along the flat top edge of the black half-disc.", at: [1.3, 1.1, 0.1], normal: [0, 0, 1], bone: null, room: [0.45, 0.25, 0.08] },
  { id: "smallRedStar", kind: "add", part: "redSmall", what: "A tiny YELLOW disc inset in the small red disc, as a layered bullseye.", at: [0.55, 0.7, 0.3], normal: [0, 0, 1], bone: null, room: [0.35, 0.35, 0.08] },
  { id: "armCounterweights", kind: "add", part: "arm1", what: "Small black counterweight beads and twisted wire loops at the ends of the top arm.", at: [-0.88, 2.3, -0.18], normal: [0, 1, 0], bone: null, room: [0.2, 0.2, 0.2] },
  { id: "ceilingHook", kind: "add", part: "canopy", what: "Brass-like hook and swivel detail under the ceiling canopy, with a small collar ring.", at: [0, 2.85, 0], normal: [0, 1, 0], bone: null, room: [0.2, 0.25, 0.2] },
  { id: "whiteAccent", kind: "add", part: "arm4", what: "A small WHITE ellipse accent hung on a short extra wire from the middle of the second arm.", at: [-0.9, 1.7, -0.18], normal: [0, -1, 0], bone: null, room: [0.25, 0.4, 0.1] },
  { id: "redDiscTex", kind: "texture", part: "redDisc", what: "Subtle brushed matte paint in RED with faint darker brush strokes and a few tiny chips showing grey metal." },
  { id: "blueLeafTex", kind: "texture", part: "blueLeaf", what: "Matte BLUE paint with slight sprayed gradient toward the tip and fine edge wear." },
  { id: "yellowLeafTex", kind: "texture", part: "yellowLeaf", what: "Sunny YELLOW enamel with soft hand-painted streaks along its length." },
];

export const RED = "#d62a1f";
export const BLUE = "#1f4fc4";
export const YELLOW = "#f2c418";
export const BLACK = "#16161a";
export const WHITE = "#f4f1e8";
export const WIRE = "#26262b";

export const STAGE2: ((b: Builder) => void)[] = [];

type V = [number, number, number];
type Shape = { kind: string; r: number; h?: number; color: string; name: string };
type Node =
  | { t: "el"; s: Shape; rot: number }
  | { t: "arm"; drop: number; la: number; lb: number; yaw: number; a: [number, Node]; b: [number, Node]; name: string };

function ellipse(rx: number, ry: number, n = 20): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    out.push([rx * Math.sin(a), -ry + ry * Math.cos(a)]);
  }
  return out;
}
const METAL_GREY: [number, number, number] = [0.55, 0.56, 0.6];
const paintFor = (s: Shape): any => {
  if (s.name === "redDisc") {
    return paint((p, _n, uv) => {
      const base = rgb(RED);
      const brush = noise(new THREE.Vector3(p.x * 0.3, p.y * 9, p.z * 0.3), 0.05, 3);
      let c = mix(base, [0.55, 0.1, 0.08], 0.35 * smoothstep(0.55, 0.8, brush));
      c = mix(c, [1, 0.45, 0.35], 0.12 * smoothstep(0.6, 0.2, brush));
      const chip = noise(p, 0.02, 11);
      return mix(c, METAL_GREY, smoothstep(0.78, 0.82, chip));
    });
  }
  if (s.name === "blueLeaf") {
    return paint((p, _n, uv) => {
      const base = rgb(BLUE);
      const tip = smoothstep(-0.5, 0, (uv as any)[1] ?? 0);
      let c = mix(base, [0.35, 0.55, 0.95], 0.35 * (1 - tip));
      c = mix(c, [0.08, 0.2, 0.55], 0.15 * noise(p, 0.08, 5));
      return mix(c, METAL_GREY, smoothstep(0.8, 0.85, noise(p, 0.015, 17)) * 0.9);
    });
  }
  if (s.name === "yellowLeaf") {
    return paint((p, _n, uv) => {
      const base = rgb(YELLOW);
      const streak = noise(new THREE.Vector3(p.x * 8, p.y * 0.4, p.z * 8), 0.06, 7);
      let c = mix(base, [1, 0.88, 0.45], 0.45 * smoothstep(0.5, 0.8, streak));
      c = mix(c, [0.85, 0.6, 0.05], 0.3 * smoothstep(0.55, 0.15, streak));
      const baseT = smoothstep(-0.25, 0, (uv as any)[1] ?? 0);
      return mix([0.85, 0.62, 0.06], c, baseT * 0.5 + 0.5);
    });
  }
  return s.color;
};
function outlineOf(s: Shape): any[] {
  if (s.kind === "disc") return ellipse(s.r, s.r, 20);
  if (s.kind === "half") {
    const o: [number, number][] = [];
    for (let i = 0; i <= 10; i++) {
      const a = (i / 10) * Math.PI;
      o.push([s.r * Math.cos(a), -s.r * Math.sin(a)]);
    }
    return o;
  }
  const h = s.h ?? 0.5;
  return [
    [0, 0, "sharp"],
    [s.r * 0.7, -h * 0.25],
    [s.r, -h * 0.5],
    [s.r * 0.6, -h * 0.8],
    [0, -h, "sharp"],
    [-s.r * 0.6, -h * 0.8],
    [-s.r, -h * 0.5],
    [-s.r * 0.7, -h * 0.25],
  ];
}

export default function build() {
  const b = createBuilder({ name: "calderMobile" });
  const V3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  const wire = (a: THREE.Vector3, c: THREE.Vector3) => b.rod(a, c, 0.004, WIRE, { name: "wire" });
  const bead = (p: THREE.Vector3, r: number, color = WIRE) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), color, { at: p, name: "bead" });

  function place(n: Node, p: THREE.Vector3) {
    if (n.t === "el") {
      bead(p, 0.011);
      b.extrude(outlineOf(n.s), {
        at: p,
        x: [Math.cos(n.rot), 0, Math.sin(n.rot)],
        thickness: 0.012,
        bevel: 0.002,
        color: paintFor(n.s),
        name: n.s.name,
      });
      return;
    }
    const H = V3(p.x, p.y - n.drop, p.z);
    wire(p, H);
    const dir = V3(Math.cos(n.yaw), 0, Math.sin(n.yaw));
    const A = H.clone().addScaledVector(dir, -n.la);
    const B = H.clone().addScaledVector(dir, n.lb);
    b.rod(A, B, 0.007, BLACK, { name: n.name });
    bead(H, 0.016, BLACK);
    bead(A, 0.014, BLACK);
    bead(B, 0.014, BLACK);
    for (const [end, [w, child]] of [[A, n.a], [B, n.b]] as [THREE.Vector3, [number, Node]][]) {
      const top = V3(end.x, end.y - w, end.z);
      wire(end, top);
      place(child, top);
    }
  }

  const el = (kind: string, r: number, color: string, name: string, rot = 0, h?: number): Node => ({
    t: "el", s: { kind, r, color, name, h }, rot,
  });

  const arm3: Node = {
    t: "arm", drop: 0.3, la: 0.35, lb: 0.3, yaw: 0.5, name: "arm3",
    a: [0.4, el("leaf", 0.13, YELLOW, "yellowLeaf", 0.5, 0.75)],
    b: [0.3, el("disc", 0.16, RED, "redSmall", 1.1)],
  };
  const arm2: Node = {
    t: "arm", drop: 0.3, la: 0.5, lb: 0.4, yaw: -0.6, name: "arm2",
    a: [0.3, arm3],
    b: [0.5, el("half", 0.2, BLACK, "blackHalf", 0.3)],
  };
  const arm4: Node = {
    t: "arm", drop: 0.25, la: 0.4, lb: 0.3, yaw: -0.3, name: "arm4",
    a: [0.35, el("disc", 0.2, RED, "redDisc", 0.4)],
    b: [0.45, el("leaf", 0.12, BLUE, "blueLeaf", -0.5, 0.5)],
  };
  const arm1: Node = {
    t: "arm", drop: 0.45, la: 0.9, lb: 0.6, yaw: 0.2, name: "arm1",
    a: [0.3, arm4],
    b: [0.25, arm2],
  };

  // ceiling canopy and hook
  b.part(new THREE.CylinderGeometry(0.07, 0.09, 0.03, 12), BLACK, { at: [0, 2.96, 0], name: "canopy" });
  b.part(new THREE.TorusGeometry(0.03, 0.006, 6, 14), WIRE, { at: [0, 2.9, 0], dir: [0, 0, 1], axis: "z", name: "hookRing" });
  const root = V3(0, 2.75, 0);
  wire(V3(0, 2.87, 0), root);
  place(arm1, root);

  for (const add of STAGE2) add(b);
  return b.root;
}

// ---------------------------------------------------------------------------------------------------------------
// Stage 2: one function per add call, run on stage 1's builder by the STAGE2 loop in build().

// add1
STAGE2.push(
  (() => {
function addRedDiscRim(b: Builder) {
  // Locate the big red disc in the built model by its mesh name.
  let disc: THREE.Mesh | null = null;
  b.root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh && m.name.indexOf("redDisc") >= 0 && !disc) disc = m;
  });

  const at = new THREE.Vector3(-1.26, 1.4, -0.06);
  if (disc) {
    const box = new THREE.Box3().setFromObject(disc, true);
    if (!box.isEmpty()) box.getCenter(at);
  }
  // Disc radius estimate from bounds (stage 1: r = 0.2).
  let R = 0.2;
  if (disc) {
    const box = new THREE.Box3().setFromObject(disc, true);
    const sz = new THREE.Vector3();
    box.getSize(sz);
    R = Math.max(0.05, Math.min(sz.x, sz.y) / 2);
  }
  const top = new THREE.Vector3(at.x, at.y + R, at.z);

  // The disc is extruded 0.012 thick, centred on its plane; faces at +-0.006 along its normal (roughly Z, rotated by yaw).
  const faces: number[] = [1, -1];
  for (const s of faces) {
    const z = at.z + s * 0.0075;
    // white rim ring
    b.part(new THREE.TorusGeometry(R * 0.9, 0.0035, 4, 28), WHITE, {
      at: [at.x, at.y, z],
      dir: [0, 0, 1],
      axis: "z",
      name: "redDiscRim",
    });
    // inner thin ring
    b.part(new THREE.TorusGeometry(R * 0.62, 0.002, 4, 24), WHITE, {
      at: [at.x, at.y, z],
      dir: [0, 0, 1],
      axis: "z",
      name: "redDiscRim2",
    });
    // central dot
    b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.004, 10), BLACK, {
      at: [at.x, at.y, z],
      dir: [0, 0, s],
      name: "redDiscHub",
    });
    b.part(new THREE.SphereGeometry(0.004, 6, 4), WHITE, {
      at: [at.x, at.y, z + s * 0.003],
      name: "redDiscHubGlint",
    });
  }

  // Pivot rivet at the top where the wire joins.
  b.part(new THREE.CylinderGeometry(0.009, 0.009, 0.02, 10), BLACK, {
    at: [top.x, top.y - 0.005, top.z],
    dir: [0, 0, 1],
    name: "redDiscPivot",
  });
  b.part(new THREE.TorusGeometry(0.014, 0.003, 5, 12), WIRE, {
    at: [top.x, top.y + 0.012, top.z],
    dir: [0, 0, 1],
    axis: "z",
    name: "redDiscEyelet",
  });
}
    return addRedDiscRim;
  })(),
);
// add2
STAGE2.push(
  (() => {
function addBlueLeafVein(b: Builder) {
  const VEIN = "#14308a";
  const TIP = "#0f2468";

  // Locate the blue leaf stage 1 built.
  let leaf: THREE.Mesh | null = null;
  b.root.traverse((o) => {
    if (!leaf && (o as THREE.Mesh).isMesh && o.name.includes("blueLeaf")) leaf = o as THREE.Mesh;
  });
  if (!leaf) return;
  const box = new THREE.Box3().setFromObject(leaf, true);
  const c = box.getCenter(new THREE.Vector3());

  // Leaf frame: outline x runs along u, y up, thickness along n. rot was -0.5.
  const rot = -0.5;
  const u = new THREE.Vector3(Math.cos(rot), 0, Math.sin(rot));
  const v = new THREE.Vector3(0, 1, 0);
  const n = new THREE.Vector3(-Math.sin(rot), 0, Math.cos(rot));
  const top = new THREE.Vector3(c.x, box.max.y, c.z);
  const H = 0.5;
  const R = 0.12;
  const basis = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(u, v, n));

  // Half width of the leaf at depth d below the stem (matches the outline's profile).
  const halfW = (d: number) => {
    const f = d / H;
    const pts = [
      [0, 0],
      [0.25, 0.7 * R],
      [0.5, R],
      [0.8, 0.6 * R],
      [1, 0],
    ];
    for (let i = 0; i < pts.length - 1; i++) {
      if (f <= pts[i + 1][0]) {
        const t = (f - pts[i][0]) / (pts[i + 1][0] - pts[i][0]);
        return pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t;
      }
    }
    return 0;
  };

  const pos = (du: number, dd: number, dn: number) =>
    top.clone().addScaledVector(u, du).addScaledVector(v, -dd).addScaledVector(n, dn);

  for (const side of [1, -1]) {
    const off = side * (0.006 + 0.0015); // half thickness 0.006 plus strip half depth
    const q0 = basis.clone();
    if (side < 0) q0.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI));

    // Midrib: tapered stack of two strips.
    b.part(new THREE.BoxGeometry(0.01, 0.44, 0.003), VEIN, {
      at: pos(0, 0.24, off),
      quat: basis,
      name: "blueMidrib",
    });
    b.part(new THREE.BoxGeometry(0.005, 0.2, 0.003), TIP, {
      at: pos(0, 0.43, off + (side > 0 ? 0.002 : -0.002)),
      quat: basis,
      name: "blueMidribTip",
    });

    // Side veins, angled toward the tip.
    const ds = [0.1, 0.17, 0.24, 0.31, 0.38];
    ds.forEach((d, i) => {
      const w = halfW(d) * 0.78;
      const len = w / Math.sin(1.0) * 0.95;
      const ang = 1.0; // from the midrib
      for (const s of [1, -1]) {
        // vein starts on midrib at depth d and runs outward and down
        const du = s * w * 0.5;
        const dd = d + w * 0.5 / Math.tan(ang) * 0.9;
        const rotZ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), s * ang);
        const q = basis.clone().multiply(rotZ);
        const L = len * (1 - i * 0.06);
        b.part(new THREE.BoxGeometry(0.0045, L, 0.003), VEIN, {
          at: pos(du, dd * 0.85 + d * 0.15, off),
          quat: q,
          name: "blueVein",
        });
      }
    });
  }

  // Stem collar where the wire meets the leaf.
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.03, 8), TIP, {
    at: pos(0, 0.012, 0),
    quat: basis,
    name: "blueCollar",
  });
}
    return addBlueLeafVein;
  })(),
);
// add3
STAGE2.push(
  (() => {
function addYellowLeafCut(b: Builder) {
  const find = (name: string) => {
    let found: THREE.Mesh | null = null;
    b.root.traverse((o) => {
      if (!found && (o as THREE.Mesh).isMesh && o.name.includes(name)) found = o as THREE.Mesh;
    });
    return found as THREE.Mesh | null;
  };

  // Shared helper: dots and lines drawn on both faces of a flat extruded shape.
  function decorate(mesh: THREE.Mesh | null, rot: number, fn: (at: (u: number, v: number, side: number) => THREE.Vector3, nrm: (side: number) => THREE.Vector3, put: (p: THREE.Vector3, n: THREE.Vector3) => void) => void) {
    if (!mesh) return;
    const box = new THREE.Box3().setFromObject(mesh, true);
    const c = box.getCenter(new THREE.Vector3());
    const pivot = new THREE.Vector3(c.x, box.max.y, c.z);
    const dir = new THREE.Vector3(Math.cos(rot), 0, Math.sin(rot));
    const n0 = new THREE.Vector3(-Math.sin(rot), 0, Math.cos(rot));
    const nrm = (s: number) => n0.clone().multiplyScalar(s);
    const at = (u: number, v: number, s: number) =>
      pivot.clone().addScaledVector(dir, u).add(new THREE.Vector3(0, v, 0)).addScaledVector(n0, s * 0.0075);
    fn(at, nrm, () => {});
  }

  const dot = (p: THREE.Vector3, n: THREE.Vector3, r: number, color: string) =>
    b.part(new THREE.CylinderGeometry(r, r, 0.003, 12), color, { at: p, dir: n, name: "s23dot" });

  // Yellow leaf: two black cut-out dots and an edge line near the tip.
  decorate(find("yellowLeaf"), 0.5, (at, nrm) => {
    for (const s of [1, -1]) {
      dot(at(-0.025, -0.48, s), nrm(s), 0.016, BLACK);
      dot(at(0.03, -0.57, s), nrm(s), 0.012, BLACK);
      const pts = [at(-0.06, -0.6, s), at(0, -0.7, s), at(0.06, -0.6, s)];
      b.rod(pts[0], pts[1], 0.003, BLACK, { name: "s23edge" });
      b.rod(pts[1], pts[2], 0.003, BLACK, { name: "s23edge" });
      dot(at(0, -0.7, s), nrm(s), 0.005, BLACK);
    }
  });

  // Black half-disc: three white dots along the flat top edge.
  decorate(find("blackHalf"), 0.3, (at, nrm) => {
    for (const s of [1, -1])
      for (const u of [-0.1, 0, 0.1]) dot(at(u, -0.035, s), nrm(s), 0.015, WHITE);
  });
}
    return addYellowLeafCut;
  })(),
);
// add4
STAGE2.push(
  (() => {
function addSmallRedStar(b: Builder) {
  // The small red disc (redSmall) hangs at the request point. Find its surface and layer a bullseye on the front face.
  const surf = b.surface(b.root);
  const hit = surf.ray([0.55, 0.7, 2], [0, 0, -1]);
  const at = new THREE.Vector3(0.55, 0.7, 0.3);
  let front = at.clone();
  let n: [number, number, number] = [0, 0, 1];
  if (hit) {
    front = hit.at.clone();
    n = [hit.n.x, hit.n.y, hit.n.z];
  }
  const nv = new THREE.Vector3(...n).normalize();

  const CREAM = "#f6e7b4";
  const ORANGE = "#e8731a";

  // Stacked discs: white-cream ring, yellow disc, orange dot, black pivot.
  const layers: [number, number, string][] = [
    [0.105, 0.003, WHITE],
    [0.085, 0.006, YELLOW],
    [0.05, 0.009, ORANGE],
    [0.022, 0.012, BLACK],
  ];
  for (const [r, lift, color] of layers) {
    b.part(new THREE.CylinderGeometry(r, r, 0.004, 20), color, {
      at: front.clone().addScaledVector(nv, lift),
      dir: n,
      name: "bullseye",
    });
  }

  // Tiny rays painted as a texture on a plane: a star burst around the yellow disc.
  let rays = "";
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const x1 = 50 + Math.sin(a) * 30;
    const y1 = 50 - Math.cos(a) * 30;
    const x2 = 50 + Math.sin(a) * 46;
    const y2 = 50 - Math.cos(a) * 46;
    rays += `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="#16161a" stroke-width="4" stroke-linecap="round"/>`;
  }
  const tex = svg(`<svg viewBox="0 0 100 100">${rays}<circle cx="50" cy="50" r="28" fill="none" stroke="#16161a" stroke-width="2.5"/></svg>`, { size: 192 });
  b.part(new THREE.PlaneGeometry(0.26, 0.26), "#ffffff", {
    at: front.clone().addScaledVector(nv, 0.015),
    dir: n,
    axis: "z",
    texture: tex,
    name: "bullseyeRays",
  });

  // Mirrored on the back so the bullseye reads from both sides.
  const back = front.clone().addScaledVector(nv, -0.012);
  const nb: [number, number, number] = [-n[0], -n[1], -n[2]];
  const bnv = new THREE.Vector3(...nb);
  for (const [r, lift, color] of layers.slice(0, 3)) {
    b.part(new THREE.CylinderGeometry(r, r, 0.004, 20), color, {
      at: back.clone().addScaledVector(bnv, lift),
      dir: nb,
      name: "bullseyeBack",
    });
  }
  b.part(new THREE.PlaneGeometry(0.26, 0.26), "#ffffff", {
    at: back.clone().addScaledVector(bnv, 0.015),
    dir: nb,
    axis: "z",
    texture: tex,
    name: "bullseyeRaysBack",
  });

  // Little rivet beads around the rim of the red disc front.
  const hold = new THREE.Vector3(0, 0, 0);
  const side = new THREE.Vector3(1, 0, 0);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    hold.copy(side).multiplyScalar(Math.cos(a) * 0.13);
    hold.y = Math.sin(a) * 0.13;
    b.part(new THREE.SphereGeometry(0.005, 6, 4), BLACK, {
      at: front.clone().add(hold).addScaledVector(nv, 0.004),
      name: "rivet",
    });
  }
}
    return addSmallRedStar;
  })(),
);
// add5
STAGE2.push(
  (() => {
function addArmCounterweights(b: Builder) {
  // Top arm (arm1): drop 0.45 below root (0,2.75,0) => hub at y=2.30, yaw 0.2, la 0.9, lb 0.6.
  const H = new THREE.Vector3(0, 2.3, 0);
  const dir = new THREE.Vector3(Math.cos(0.2), 0, Math.sin(0.2));
  const A = H.clone().addScaledVector(dir, -0.9);
  const B = H.clone().addScaledVector(dir, 0.6);
  const BRASS = "#8a7a5a";

  // Twisted wire loop: a small torus ring plus two crossing wraps
  const loop = (p: THREE.Vector3, sign: number) => {
    // eye loop standing in the vertical plane along the arm
    b.part(new THREE.TorusGeometry(0.03, 0.004, 5, 12), WIRE, {
      at: p.clone().addScaledVector(dir, sign * 0.035).add(new THREE.Vector3(0, 0.0, 0)),
      dir: [-Math.sin(0.2), 0, Math.cos(0.2)],
      axis: "z",
      name: "s25loop",
    });
    // twisted wraps around the arm (a few small collars)
    for (let i = 0; i < 4; i++) {
      const q = p.clone().addScaledVector(dir, sign * (-0.02 - i * 0.012));
      b.part(new THREE.CylinderGeometry(0.0085, 0.0085, 0.006, 6), WIRE, {
        at: q,
        dir: [dir.x, 0, dir.z],
        axis: "y",
        name: "s25wrap",
      });
    }
  };
  loop(A, -1);
  loop(B, 1);

  // Counterweight on the long end: stacked black beads with a brass cap
  const beadAt = (t: number, r: number, sy = 1) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), BLACK, {
      at: A.clone().addScaledVector(dir, t),
      scale: [1, sy, 1],
      name: "s25bead",
    });
  beadAt(0.05, 0.026);
  beadAt(0.11, 0.019, 1.2);
  beadAt(0.16, 0.013);
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.012, 8), BRASS, {
    at: A.clone().addScaledVector(dir, 0.215),
    dir: [dir.x, 0, dir.z],
    name: "s25cap",
  });

  // Short end: a small bead pair and cap
  b.part(new THREE.SphereGeometry(0.02, 8, 6), BLACK, {
    at: B.clone().addScaledVector(dir, -0.07),
    name: "s25bead",
  });
  b.part(new THREE.SphereGeometry(0.012, 8, 6), BLACK, {
    at: B.clone().addScaledVector(dir, -0.115),
    name: "s25bead",
  });
  b.part(new THREE.CylinderGeometry(0.015, 0.015, 0.01, 8), BRASS, {
    at: B.clone().addScaledVector(dir, -0.032),
    dir: [dir.x, 0, dir.z],
    name: "s25cap",
  });

  // Central pivot: brass collar and small knob where the arm is hung
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.018, 8), BRASS, {
    at: H,
    dir: [dir.x, 0, dir.z],
    name: "s25collar",
  });
  b.part(new THREE.TorusGeometry(0.018, 0.004, 5, 10), WIRE, {
    at: H.clone().add(new THREE.Vector3(0, 0.04, 0)),
    dir: [0, 0, 1],
    axis: "z",
    name: "s25hubLoop",
  });
}
    return addArmCounterweights;
  })(),
);
// add6
STAGE2.push(
  (() => {
function addCeilingHook(b: Builder) {
  const BRASS = "#b8893a";
  const BRASS_DARK = "#7a5a22";
  const BRASS_LIGHT = "#e2b95e";

  // ---- ceiling hook, swivel and collar under the canopy (canopy bottom ~2.945, wire starts 2.87) ----
  const cx = 0;
  const cz = 0;
  // collar ring just under the canopy disc
  b.part(new THREE.TorusGeometry(0.04, 0.008, 6, 14), BRASS, {
    at: [cx, 2.935, cz], dir: [0, 1, 0], axis: "z", name: "s26collar",
  });
  b.part(new THREE.CylinderGeometry(0.03, 0.04, 0.016, 10), BRASS_DARK, {
    at: [cx, 2.925, cz], name: "s26collarBase",
  });
  // swivel body: two stacked barrels with a pin between
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.03, 8), BRASS, {
    at: [cx, 2.9, cz], name: "s26swivelTop",
  });
  b.part(new THREE.CylinderGeometry(0.006, 0.006, 0.014, 6), BRASS_LIGHT, {
    at: [cx, 2.88, cz], name: "s26swivelPin",
  });
  b.part(new THREE.SphereGeometry(0.016, 8, 6), BRASS_LIGHT, {
    at: [cx, 2.865, cz], name: "s26swivelBall",
  });
  // small hook loop below the swivel, hugging the wire
  b.part(new THREE.TorusGeometry(0.014, 0.003, 6, 12, Math.PI * 1.6), BRASS_DARK, {
    at: [cx, 2.845, cz], dir: [1, 0, 0], axis: "z", name: "s26hook",
  });
  // rivet studs around collar
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    b.part(new THREE.SphereGeometry(0.005, 6, 4), BRASS_LIGHT, {
      at: [Math.cos(a) * 0.033, 2.918, Math.sin(a) * 0.033], name: "s26stud",
    });
  }

  // ---- white ellipse accent hung from middle of the second arm ----
  const ax = -0.9;
  const ay = 1.7;
  const az = -0.18;
  const WIRE_C = "#26262b";
  b.rod([ax, ay, az], [ax, ay - 0.12, az], 0.003, WIRE_C, { name: "s26accentWire" });
  b.part(new THREE.SphereGeometry(0.008, 6, 4), WIRE_C, { at: [ax, ay, az], name: "s26accentKnot" });
  const outline: [number, number][] = [];
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2;
    outline.push([0.07 * Math.sin(a), -0.1 + 0.1 * Math.cos(a)]);
  }
  b.extrude(outline, {
    at: [ax, ay - 0.12, az], x: [Math.cos(0.5), 0, Math.sin(0.5)],
    thickness: 0.01, bevel: 0.002, color: WHITE, name: "s26whiteEllipse",
  });
  b.part(new THREE.SphereGeometry(0.007, 6, 4), WIRE_C, { at: [ax, ay - 0.12, az], name: "s26accentEye" });
  // tiny black pivot dot drawn on the ellipse
  const dot = svg(
    `<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="10" fill="#16161a"/></svg>`,
    { size: 64 },
  );
  b.part(new THREE.PlaneGeometry(0.03, 0.03), "#ffffff", {
    at: [ax - 0.0 + 0.0, ay - 0.22, az + 0.0 + 0.007], dir: [0, 0, 1], axis: "z", texture: dot, name: "s26accentDot",
  });
}
    return addCeilingHook;
  })(),
);
