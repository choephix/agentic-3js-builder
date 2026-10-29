import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng } from "../../../../src/index";

export const meta = {
  "name": "Bauhaus Songbird on a Branch",
  "description": "A small perched songbird built as a Bauhaus composition of circles, triangles and squares in flat red, yellow and blue, gripping a black branch that rests on a white plinth with two posts."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  red: "#d9261c",
  redDark: "#9c1a14",
  blue: "#1c3fa8",
  blueDark: "#122a74",
  blueLight: "#3f6fd8",
  yellow: "#f5c400",
  yellowDark: "#c79a00",
  black: "#15151a",
  white: "#f3eee1",
  cream: "#e4dcc4",
  grey: "#8d8d8a",
  branch: "#2a2420",
  branchLight: "#4d4038",
};
const M = {
  branchTop: [0, 0.102, 0] as [number, number, number],
  branchAxis: [0, 0.09, 0] as [number, number, number],
  bodyCenter: [0, 0.17, 0] as [number, number, number],
  neckBase: [0, 0.2, 0.05] as [number, number, number],
  headCenter: [0, 0.228, 0.052] as [number, number, number],
  beakBase: [0, 0.222, 0.084] as [number, number, number],
  jawHinge: [0, 0.218, 0.07] as [number, number, number],
  tailRoot: [0, 0.158, -0.06] as [number, number, number],
  shoulderL: [0.048, 0.19, 0.03] as [number, number, number],
  shoulderR: [-0.048, 0.19, 0.03] as [number, number, number],
  hipSocketL: [0.028, 0.135, 0] as [number, number, number],
  hipSocketR: [-0.028, 0.135, 0] as [number, number, number],
  footL: [0.028, 0.106, 0.004] as [number, number, number],
  footR: [-0.028, 0.106, 0.004] as [number, number, number],
  postL: [0.12, 0.016, 0] as [number, number, number],
  postR: [-0.12, 0.016, 0] as [number, number, number],
  twigRoot: [0.1, 0.09, 0] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // head
  (() => {
function buildHead({ b, J, P, M }: Ctx) {
  const HC = M.headCenter;
  const R = 0.034;
  const head = J.head;
  const jaw = J.jaw;
  const neck = J.neck;

  // helper: disc facing a direction, placed in model space
  const disc = (r: number, h: number, color: string, at: number[], dir: number[], bone: any, seg = 12) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { bone, at, dir });

  // head sphere (flattened in y)
  const skull = b.part(new THREE.SphereGeometry(R, 12, 8), P.yellow, {
    bone: head,
    at: HC,
    scale: [1, 0.94, 1],
  });
  const skin = b.surface(skull);

  // seat a flat disc on the skull at azimuth/elevation
  const seat = (r: number, h: number, color: string, az: number, el: number, lift = 0) => {
    const hit = skin.around(HC).at(az, el);
    if (!hit) return null;
    return b.stick(new THREE.CylinderGeometry(r, r, h, 12), color, hit, { embed: 0.3 + lift });
  };

  // cheeks: black outline then red disc, mirrored
  for (const s of [1, -1]) {
    seat(0.0135, 0.002, P.black, s * 80, -8);
    seat(0.012, 0.003, P.red, s * 80, -8, 0.05);
  }

  // eyes: stacked discs on front-sides
  for (const s of [1, -1]) {
    const hit = skin.around(HC).at(s * 48, 14);
    if (!hit) continue;
    const layers: [number, string, number][] = [
      [0.0125, P.black, 0.3],
      [0.0105, P.white, -0.2],
      [0.006, P.black, -0.7],
      [0.0025, P.white, -1.2],
    ];
    let lift = 0;
    for (const [r, c] of layers) {
      lift += 0.0012;
      const h = hit.moved([0, lift, 0]);
      b.stick(new THREE.CylinderGeometry(r, r, 0.0012, 12), c, h, { embed: 0.2 });
    }
    // brow bar
    const brow = hit.moved([0, 0.002, 0]);
    b.stick(new THREE.BoxGeometry(0.02, 0.0016, 0.004), P.black, brow.moved([0, 0, 0.0145]), {
      embed: 0.2,
      spin: s * -18,
    });
  }

  // crest: blue half-disc on crown with black outline and red dot
  const crownY = HC[1] + R * 0.94;
  const semi = (r: number, n = 8): [number, number, string?][] => {
    const pts: any[] = [];
    for (let i = 0; i <= n; i++) {
      const a = (Math.PI * i) / n;
      pts.push([Math.cos(a) * r, Math.sin(a) * r * 1.0]);
    }
    return pts;
  };
  const crestAt = (z: number) => [0, crownY - 0.004, z];
  b.extrude(semi(0.0155), {
    at: crestAt(HC[2] - 0.004),
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.0015,
    color: P.black,
    bone: head,
  });
  // outline sits behind (more -x); use shifted extrudes along x thickness
  for (const [r, c, dx] of [
    [0.0165, P.black, -0.0035],
    [0.0145, P.blue, 0.0],
    [0.0165, P.black, 0.0035],
  ] as [number, string, number][]) {
    b.extrude(semi(r), {
      at: [dx, crownY - 0.005, HC[2] - 0.004],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.0025,
      color: c,
      bone: head,
    });
  }
  for (const s of [1, -1])
    disc(0.0055, 0.0014, P.red, [s * 0.00555, crownY + 0.006, HC[2] - 0.004], [1, 0, 0], head, 10);

  // beak: blue 4-sided pyramid
  const bb = M.beakBase;
  b.part(new THREE.ConeGeometry(0.014, 0.032, 4), P.blue, {
    bone: head,
    at: [bb[0], bb[1] + 0.001, bb[2] + 0.016],
    dir: [0, 0, 1],
  });
  // nostrils
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.0025, 6, 4), P.black, {
      bone: head,
      at: [s * 0.0055, bb[1] + 0.005, bb[2] + 0.009],
    });

  // lower beak wedge on jaw
  const jh = M.jawHinge;
  b.part(new THREE.ConeGeometry(0.011, 0.026, 4), P.blueDark, {
    bone: jaw,
    at: [jh[0], jh[1] - 0.0045, jh[2] + 0.025],
    dir: [0, 0, 1],
    scale: [1, 1, 0.55],
  });
  // mouth line
  b.part(new THREE.BoxGeometry(0.003, 0.0014, 0.028), P.black, {
    bone: head,
    at: [0, bb[1] - 0.002, bb[2] + 0.002],
  });

  // nape feather points
  const r2 = rng(5);
  for (let i = 0; i < 5; i++) {
    const az = 180 + (i - 2) * 22;
    const el = 20 + (i % 2) * 22 + r2() * 4;
    const hit = skin.around(HC).at(az, el);
    if (hit) b.stick(new THREE.ConeGeometry(0.0065, 0.016, 3), P.yellowDark, hit, { embed: 0.25 });
  }

  // neck collar
  const nb = M.neckBase;
  const cy = nb[1] + 0.003;
  const cz = nb[2] - 0.004;
  b.part(new THREE.CylinderGeometry(0.03, 0.033, 0.008, 12), P.white, { bone: neck, at: [0, cy, cz] });
  for (const dy of [0.0055, -0.0055])
    b.part(new THREE.CylinderGeometry(0.0315, 0.0315, 0.0016, 12), P.black, {
      bone: neck,
      at: [0, cy + dy, cz],
    });

  // red bib triangle on throat
  b.extrude(
    [
      [-0.011, 0],
      [0.011, 0],
      [0, -0.02, "sharp"],
    ],
    { at: [0, cy + 0.001, cz + 0.0345], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.002, color: P.red, bone: neck },
  );
  b.extrude(
    [
      [-0.0125, 0.0015],
      [0.0125, 0.0015],
      [0, -0.0225, "sharp"],
    ],
    { at: [0, cy + 0.001, cz + 0.0335], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.0015, color: P.black, bone: neck },
  );
}
    return buildHead;
  })(),
  // torso
  (() => {
function buildTorso({ b, J, P, M }: Ctx) {
  const C = M.bodyCenter;
  const R = [0.052, 0.05, 0.068];
  const hips = J.hips;
  const chest = J.chest;
  const r = rng(11);

  // Ellipsoid of the body: point on its surface for a direction.
  const surf = (dx: number, dy: number, dz: number, lift = 0): [number, number, number] => {
    const l = Math.hypot(dx / R[0], dy / R[1], dz / R[2]);
    const k = 1 / l;
    return [C[0] + dx * k, C[1] + dy * k, C[2] + dz * k].map((v, i) => v) as [number, number, number];
  };
  // Outward normal at a surface point.
  const nrm = (p: number[]) => {
    const n = new THREE.Vector3((p[0] - C[0]) / (R[0] * R[0]), (p[1] - C[1]) / (R[1] * R[1]), (p[2] - C[2]) / (R[2] * R[2]));
    return n.normalize();
  };
  // Place a geometry (axis +Y) on the surface along direction, lifted outward by 'lift'.
  const place = (geo: THREE.BufferGeometry, color: string, d: number[], lift: number, bone: any, extra: any = {}) => {
    const p = surf(d[0], d[1], d[2]);
    const n = nrm(p);
    const at = [p[0] + n.x * lift, p[1] + n.y * lift, p[2] + n.z * lift];
    return b.part(geo, color, { at, dir: [n.x, n.y, n.z], bone, ...extra });
  };
  // Flat shape facing out of surface (axis z)
  const flat = (geo: THREE.BufferGeometry, color: string, d: number[], lift: number, bone: any, up: number[] = [0, 1, 0]) => {
    const p = surf(d[0], d[1], d[2]);
    const n = nrm(p);
    return b.part(geo, color, {
      at: [p[0] + n.x * lift, p[1] + n.y * lift, p[2] + n.z * lift],
      dir: [n.x, n.y, n.z],
      axis: "z",
      up,
      bone,
    });
  };

  // Body: scaled low-poly sphere
  b.part(new THREE.SphereGeometry(1, 12, 8), P.red, { at: C, scale: R, bone: chest, flat: true });

  // Belly: off-white lower half-ellipsoid, slightly larger, front/underside
  b.part(new THREE.SphereGeometry(1, 12, 6, 0, Math.PI * 2, Math.PI * 0.58, Math.PI * 0.42), P.white, {
    at: [C[0], C[1] - 0.004, C[2] + 0.004],
    scale: [R[0] * 1.012, R[1] * 1.02, R[2] * 1.012],
    bone: hips,
    flat: true,
  });
  b.part(new THREE.CylinderGeometry(R[0] * 1.012, R[0] * 1.012, 0.0012, 12), P.black, {
    at: [C[0], C[1] - 0.0045 + 0.012, C[2] + 0.004],
    scale: [1, 1, R[2] / R[0]],
    bone: hips,
  });

  // Chest bib: black outline triangle then yellow triangle pointing down
  const tri = (w: number, h: number) =>
    new THREE.ExtrudeGeometry(new THREE.Shape([new THREE.Vector2(-w / 2, h / 2), new THREE.Vector2(w / 2, h / 2), new THREE.Vector2(0, -h / 2)]), {
      depth: 0.002,
      bevelEnabled: false,
    });
  flat(tri(0.044, 0.05), P.black, [0, 0.01, 1], 0.001, chest);
  flat(tri(0.04, 0.046), P.yellow, [0, 0.01, 1], 0.0028, chest);

  // Breast ring bands (black) below the bib
  for (let i = 0; i < 3; i++) {
    const y = -0.014 - i * 0.011;
    const rr = Math.sqrt(Math.max(0, 1 - (y / R[1]) ** 2));
    const zc = C[2] + 0.012;
    b.part(new THREE.TorusGeometry(1, 0.0012, 4, 12, Math.PI * 0.9), P.black, {
      at: [C[0], C[1] + y, C[2] + 0.006 + 0.0],
      rotation: [90, 0, 0],
      scale: [R[0] * rr * 1.02, R[2] * rr * 1.02, 1],
      bone: chest,
    });
    void zc;
  }
  // Fix: torus above rotated lies horizontal, arc facing +? keep as thin ring; add small black bars as markers
  for (const s of [1, -1])
    place(new THREE.BoxGeometry(0.003, 0.004, 0.003), P.black, [s * 0.05, -0.016, 0.06], 0.001, chest);

  // Back saddle: overlapping blueDark rectangles along top
  for (let i = 0; i < 4; i++) {
    const z = -0.04 + i * 0.022;
    const g = new THREE.BoxGeometry(0.05 - i * 0.004, 0.003, 0.02);
    const p = surf(0, 1, z / R[2] * 0.9 > 0 ? 0 : 0);
    void p;
    const y = C[1] + R[1] * Math.sqrt(Math.max(0.01, 1 - (z / R[2]) ** 2));
    const slope = (z / R[2]) * (R[1] / R[2]);
    b.part(g, i % 2 ? P.blueDark : P.blue, {
      at: [0, y + 0.0012 + (i % 2) * 0.0008, z + C[2]],
      rotation: [(Math.atan(slope) * 180) / Math.PI, 0, 0],
      bone: chest,
    });
  }
  // black dividers between saddle and rump
  b.part(new THREE.BoxGeometry(0.056, 0.0025, 0.0025), P.black, { at: [0, 0.2185, -0.044], rotation: [-30, 0, 0], bone: hips });

  // Yellow rump patch above tail root
  const rp = surf(0, 0.55, -1);
  const rn = nrm(rp);
  b.part(new THREE.BoxGeometry(0.03, 0.002, 0.03), P.black, {
    at: [rp[0] + rn.x * 0.001, rp[1] + rn.y * 0.001, rp[2] + rn.z * 0.001],
    dir: [rn.x, rn.y, rn.z],
    bone: hips,
  });
  b.part(new THREE.BoxGeometry(0.027, 0.002, 0.027), P.yellow, {
    at: [rp[0] + rn.x * 0.0022, rp[1] + rn.y * 0.0022, rp[2] + rn.z * 0.0022],
    dir: [rn.x, rn.y, rn.z],
    bone: hips,
  });
  b.part(new THREE.BoxGeometry(0.056, 0.0025, 0.0025), P.black, {
    at: [rp[0] + rn.x * 0.001, rp[1] + rn.y * 0.001 + 0.0, rp[2] + 0.02],
    dir: [rn.x, rn.y, rn.z],
    bone: hips,
  });

  // Shoulder discs and thigh bumps, mirrored
  for (const s of [1, -1]) {
    const sh = M[s > 0 ? "shoulderL" : "shoulderR"];
    const d = [sh[0] - C[0], sh[1] - C[1], sh[2] - C[2]];
    flat(new THREE.CylinderGeometry(0.0155, 0.0155, 0.0015, 10).rotateX(Math.PI / 2), P.black, d, 0.0005, chest);
    flat(new THREE.CylinderGeometry(0.014, 0.014, 0.0015, 10).rotateX(Math.PI / 2), P.blue, d, 0.0015, chest);

    const hp = M[s > 0 ? "hipSocketL" : "hipSocketR"];
    b.part(new THREE.SphereGeometry(0.014, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), P.red, {
      at: [hp[0], hp[1] + 0.004, hp[2]],
      rotation: [180, 0, 0],
      scale: [1, 0.8, 1.2],
      bone: hips,
      flat: true,
    });
    b.part(new THREE.SphereGeometry(0.0145, 8, 3, 0, Math.PI * 2, Math.PI / 2 - 0.12, 0.12), P.black, {
      at: [hp[0], hp[1] + 0.004, hp[2]],
      scale: [1, 0.8, 1.2],
      bone: hips,
    });
  }
}
    return buildTorso;
  })(),
  // wingsTail
  (() => {
function buildWingsTail({ b, J, P, M }: any) {
  const r = rng(5);
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const disc = (rad: number, t = 0.002, seg = 12) => new THREE.CylinderGeometry(rad, rad, t, seg);
  const tri = (w: number, l: number, t: number) => {
    const s = new THREE.Shape();
    s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, l); s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: t, bevelEnabled: false });
    g.translate(0, 0, -t / 2);
    return g;
  };

  // ---------- Wings ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const w1 = J["wing" + side + "1"];
    const w2 = J["wing" + side + "2"];
    const w3 = J["wing" + side + "3"];
    const x0 = s * 0.056;
    // covert panel over the shoulder
    b.extrude(
      [[-0.022, 0], [0.022, 0], [0.026, -0.03], [0, -0.05], [-0.026, -0.03]].map(
        (p) => [p[0], p[1]] as [number, number],
      ),
      { at: [x0 + s * 0.004, 0.2, 0.05], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.006, color: P.blue, bone: w1 },
    );
    // outline + red circle on covert
    const cAt: [number, number, number] = [s * 0.063, 0.182, 0.032];
    b.part(disc(0.0115), P.black, { at: cAt, dir: [s, 0, 0], bone: w1 });
    b.part(disc(0.01, 0.0024), P.red, { at: [s * 0.0635, 0.182, 0.032], dir: [s, 0, 0], bone: w1 });
    b.part(disc(0.004, 0.0028), P.yellow, { at: [s * 0.064, 0.182, 0.032], dir: [s, 0, 0], bone: w1 });
    // leading edge black line
    b.part(box(0.003, 0.003, 0.1), P.black, { at: [s * 0.0645, 0.2, -0.01], rotation: [4, 0, 0], bone: w1 });

    // primaries
    for (let i = 0; i < 5; i++) {
      const len = 0.06 + i * 0.012;
      const bone = i < 2 ? w1 : i < 4 ? w2 : w3;
      const col = i % 2 ? P.blueDark : P.blue;
      const y = 0.19 - i * 0.0075;
      const x = s * (0.053 + i * 0.0026);
      const z0 = 0.02 - i * 0.012;
      const zc = z0 - len / 2;
      b.part(box(0.004, 0.0085, len), col, { at: [x, y, zc], rotation: [-5, 0, 0], bone });
      // pointed end
      b.part(tri(0.0085, 0.012, 0.004), col, {
        at: [x, y - 0.0005, z0 - len],
        rotation: [0, 0, 90],
        dir: [0, 0, -1],
        bone,
      });
      // yellow stripe
      b.part(box(0.0046, 0.0088, 0.008), P.yellow, { at: [x + s * 0.0004, y, zc + 0.002], rotation: [-5, 0, 0], bone });
      // white tip square
      b.part(box(0.0048, 0.005, 0.005), P.white, { at: [x + s * 0.0004, y - 0.001, z0 - len + 0.004], bone });
    }
  }

  // ---------- Tail ----------
  const root = M.tailRoot;
  const tb = [J.tail1, J.tail1, J.tail2, J.tail3, J.tail3];
  const order = [-2, -1, 0, 1, 2];
  order.forEach((k, i) => {
    const len = 0.12 - Math.abs(k) * 0.005;
    const ang = k * 8 * (Math.PI / 180);
    const col = k === 0 || Math.abs(k) === 2 ? P.yellow : P.blue;
    const pitch = -0.08;
    const dirv = new THREE.Vector3(Math.sin(ang), pitch, -Math.cos(ang)).normalize();
    const mid = new THREE.Vector3(root[0], root[1] - 0.002, root[2]).addScaledVector(dirv, len / 2);
    const tip = new THREE.Vector3(root[0], root[1] - 0.002, root[2]).addScaledVector(dirv, len);
    const bone = tb[i];
    b.part(box(0.02, 0.004, len), col, { at: mid, dir: dirv, axis: "z", bone });
    // black band
    const bandAt = new THREE.Vector3(root[0], root[1] - 0.002, root[2]).addScaledVector(dirv, len - 0.022);
    b.part(box(0.0205, 0.0045, 0.006), P.black, { at: bandAt, dir: dirv, axis: "z", bone });
    // white tip square
    const tipAt = new THREE.Vector3(root[0], root[1] - 0.002, root[2]).addScaledVector(dirv, len - 0.006);
    b.part(box(0.0205, 0.0046, 0.008), P.white, { at: tipAt, dir: dirv, axis: "z", bone });
  });
  // red circle with outline at the tail base
  b.part(disc(0.0135, 0.002, 12), P.black, { at: [0, 0.1625, -0.07], dir: [0, 1, 0], bone: J.tail1 });
  b.part(disc(0.012, 0.0026, 12), P.red, { at: [0, 0.1632, -0.07], dir: [0, 1, 0], bone: J.tail1 });
  b.part(disc(0.0045, 0.003, 8), P.yellow, { at: [0, 0.1638, -0.07], dir: [0, 1, 0], bone: J.tail1 });
  void r; void frame;
}
    return buildWingsTail;
  })(),
  // legsFeet
  (() => {
function buildLegsFeet({ b, J, P, M }: Ctx) {
  const R = rng(5);
  void R;
  const BRANCH_TOP = 0.102;

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hip = J["hip" + side];
    const knee = J["knee" + side];
    const ankle = J["ankle" + side];
    const x = s * 0.028;

    // feather trouser: box block with a triangular cap
    b.part(new THREE.BoxGeometry(0.02, 0.016, 0.026), P.blueDark, {
      bone: hip,
      at: [x, 0.134, -0.001],
    });
    b.part(new THREE.CylinderGeometry(0.011, 0.011, 0.02, 3), P.blueDark, {
      bone: hip,
      at: [x, 0.125, -0.003],
      rotation: [0, 0, 90],
    });
    // tarsus: thigh to knee, knee to ankle
    b.rod([x, 0.128, -0.002], [x, 0.122, -0.003], 0.0035, P.yellowDark, { bone: hip, sides: 6 });
    b.rod([x, 0.122, -0.003], [x, 0.108, 0.0], 0.0035, P.yellowDark, { bone: knee, sides: 6 });
    // knee black ring
    b.part(new THREE.CylinderGeometry(0.0052, 0.0052, 0.003, 8), P.black, {
      bone: knee,
      at: [x, 0.122, -0.003],
    });
    // ankle red disc, facing outward
    b.part(new THREE.CylinderGeometry(0.0062, 0.0062, 0.0016, 8), P.black, {
      bone: ankle,
      at: [x + s * 0.0035, 0.109, 0],
      rotation: [0, 0, 90],
    });
    b.part(new THREE.CylinderGeometry(0.005, 0.005, 0.0016, 8), P.red, {
      bone: ankle,
      at: [x + s * 0.0045, 0.109, 0],
      rotation: [0, 0, 90],
    });
    // ankle ball joint
    b.part(new THREE.SphereGeometry(0.0045, 6, 5), P.yellowDark, { bone: ankle, at: [x, 0.107, 0.002] });

    // toes: three forward, one back, arching over the branch (radius 0.012, axis y 0.09)
    const toeDefs: { n: number; dx: number; len: number }[] = [
      { n: 1, dx: s * 0.25, len: 1 },
      { n: 2, dx: 0, len: 1.15 },
      { n: 3, dx: -s * 0.25, len: 1 },
      { n: 4, dx: 0, len: -0.8 },
    ];
    for (const t of toeDefs) {
      const bone = J["toe" + side + t.n];
      const dir = t.len > 0 ? 1 : -1;
      const L = Math.abs(t.len);
      const z0 = 0.004 * dir;
      const p0: [number, number, number] = [x, 0.106, z0];
      const p1: [number, number, number] = [x + t.dx * 0.012 * L, 0.1035, z0 + dir * 0.012 * L];
      const p2: [number, number, number] = [x + t.dx * 0.02 * L, 0.0985, z0 + dir * 0.0215 * L];
      const p3: [number, number, number] = [x + t.dx * 0.023 * L, 0.0915, z0 + dir * 0.0245 * L];
      b.rod(p0, p1, 0.003, P.yellowDark, { bone, sides: 6 });
      b.rod(p1, p2, 0.003, P.yellowDark, { bone, sides: 6 });
      b.rod(p2, p3, 0.0028, P.yellowDark, { bone, sides: 6 });
      // knuckle
      b.part(new THREE.SphereGeometry(0.0033, 6, 4), P.yellowDark, { bone, at: p1 });
      // pad cube
      b.part(new THREE.BoxGeometry(0.004, 0.0025, 0.004), P.black, {
        bone,
        at: [p1[0], p1[1] + 0.0025, p1[2]],
      });
      // claw cone
      const cdir: [number, number, number] = [t.dx * 0.1, -0.9, dir * 0.4];
      b.part(new THREE.ConeGeometry(0.0022, 0.0075, 5), P.black, {
        bone,
        at: [p3[0], p3[1] - 0.003, p3[2] + dir * 0.0005],
        dir: cdir,
      });
    }
  }
}
    return buildLegsFeet;
  })(),
  // perch
  (() => {
function buildPerch({ b, J, P, M }: Ctx) {
  const bone = J.perch;
  const R = rng(5);
  const BR = 0.012;
  const BY = 0.09;

  const box = (w: number, h: number, d: number, color: string, at: [number, number, number], rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, rotation: rot });
  const disc = (r: number, t: number, color: string, at: [number, number, number], dir: [number, number, number], seg = 16) =>
    b.part(new THREE.CylinderGeometry(r, r, t, seg), color, { bone, at, dir });
  const tri = (s: number, t: number, color: string, at: [number, number, number]) =>
    b.part(new THREE.CylinderGeometry(s, s, t, 3), color, { bone, at, dir: [0, 0, 1] });

  // plinth
  box(0.34, 0.016, 0.09, P.white, [0, 0.008, 0]);
  // black edge lines on top
  const top = 0.0165;
  box(0.34, 0.0008, 0.002, P.black, [0, top, 0.044]);
  box(0.34, 0.0008, 0.002, P.black, [0, top, -0.044]);
  box(0.002, 0.0008, 0.09, P.black, [0.169, top, 0]);
  box(0.002, 0.0008, 0.09, P.black, [-0.169, top, 0]);
  // colour squares with outline
  const sq: [number, string][] = [[-0.05, P.red], [0, P.yellow], [0.05, P.blue]];
  for (const [x, c] of sq) {
    box(0.036, 0.0008, 0.036, P.black, [x, top, 0]);
    box(0.033, 0.0012, 0.033, c, [x, top + 0.0003, 0]);
  }

  // posts
  for (const s of [1, -1]) {
    box(0.012, 0.074, 0.012, P.black, [s * 0.12, 0.053, 0]);
    box(0.02, 0.004, 0.02, P.black, [s * 0.12, 0.018, 0]);
    box(0.02, 0.004, 0.02, P.black, [s * 0.12, 0.088, 0]);
  }

  // branch: tapered faceted rod
  b.rod([-0.17, BY, 0], [0.17, BY, 0], [BR * 0.85, BR * 0.85], P.branch, { bone, sides: 8, caps: "flat" });
  b.rod([-0.14, BY, 0], [0.14, BY, 0], BR * 1.02, P.branch, { bone, sides: 8, caps: "flat" });
  // end discs
  disc(0.0125, 0.003, P.black, [-0.1715, BY, 0], [1, 0, 0], 12);
  disc(0.011, 0.003, P.red, [-0.173, BY, 0], [1, 0, 0], 12);
  disc(0.0125, 0.003, P.black, [0.1715, BY, 0], [1, 0, 0], 12);
  disc(0.011, 0.003, P.blue, [0.173, BY, 0], [1, 0, 0], 12);

  // yellow ring bands
  for (const x of [-0.15, -0.06, 0.06, 0.15]) {
    const r = x < -0.1 || x > 0.1 ? BR * 0.93 : BR * 1.06;
    b.part(new THREE.CylinderGeometry(r * 1.06, r * 1.06, 0.004, 8), P.yellow, { bone, at: [x, BY, 0], dir: [1, 0, 0] });
  }

  // knots (outside x within 0.07 above branch top)
  for (const [x, z, y] of [[-0.11, 0.008, BY + 0.008], [0.04, -0.011, BY - 0.002], [-0.085, -0.009, BY + 0.003], [0.13, 0.01, BY + 0.005]] as number[][]) {
    box(0.012, 0.01, 0.01, P.branchLight, [x, y, z], [R() * 30, R() * 40, R() * 30]);
  }

  // twig on the right
  const root: [number, number, number] = [M.twigRoot[0], M.twigRoot[1], M.twigRoot[2]];
  const tip: [number, number, number] = [0.15, 0.19, 0.03];
  b.rod(root, tip, [0.0065, 0.0035], P.branch, { bone, sides: 6 });
  // fork
  const forkAt: [number, number, number] = [0.128, 0.148, 0.018];
  const forkTip: [number, number, number] = [0.095, 0.178, 0.04];
  b.rod(forkAt, forkTip, [0.0045, 0.002], P.branch, { bone, sides: 6 });
  b.part(new THREE.SphereGeometry(0.005, 6, 4), P.branchLight, { bone, at: forkAt });

  // leaves
  const lz = 0.036;
  // red circle at tip
  disc(0.0165, 0.002, P.black, [0.15, 0.2, lz], [0, 0, 1], 16);
  disc(0.015, 0.002, P.red, [0.15, 0.2, lz + 0.0015], [0, 0, 1], 16);
  b.rod([0.15, 0.19, 0.03], [0.15, 0.2, lz], 0.0015, P.branch, { bone, sides: 6 });
  // yellow triangle
  tri(0.0185, 0.002, P.black, [0.172, 0.168, 0.03]);
  tri(0.0165, 0.002, P.yellow, [0.172, 0.168, 0.0315]);
  b.rod([0.14, 0.17, 0.024], [0.168, 0.168, 0.03], 0.0015, P.branch, { bone, sides: 6 });
  // blue square on fork
  box(0.03, 0.03, 0.002, P.black, [0.095, 0.2, 0.046], [0, 0, 15]);
  box(0.027, 0.027, 0.002, P.blue, [0.095, 0.2, 0.0475], [0, 0, 15]);
  b.rod(forkTip, [0.095, 0.195, 0.045], 0.0015, P.branch, { bone, sides: 6 });

  // left twig stub with yellow disc
  const stubRoot: [number, number, number] = [-0.12, BY + 0.008, 0];
  const stubTip: [number, number, number] = [-0.145, 0.135, 0.02];
  b.rod(stubRoot, stubTip, [0.005, 0.003], P.branch, { bone, sides: 6 });
  disc(0.0165, 0.002, P.black, [-0.148, 0.15, 0.028], [0, 0, 1], 16);
  disc(0.015, 0.002, P.yellow, [-0.148, 0.15, 0.0295], [0, 0, 1], 16);
  b.rod(stubTip, [-0.148, 0.145, 0.027], 0.0015, P.branch, { bone, sides: 6 });
}
    return buildPerch;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "bauhausSongbird" });
  const J: Record<string, Joint> = {};
  J["perch"] = b.joint("perch", { at: [0,0,0], dir: [0,1,0] });
  J["hips"] = b.joint("hips", { parent: J["perch"], at: [0,0.165,-0.03], dir: [0,0,1], role: "spine" });
  J["chest"] = b.joint("chest", { parent: J["hips"], at: [0,0.17,0.03], dir: [0,0.2,1], role: "spine" });
  J["neck"] = b.joint("neck", { parent: J["chest"], at: [0,0.2,0.05], dir: [0,1,0.3], role: "neck" });
  J["head"] = b.joint("head", { parent: J["neck"], at: [0,0.222,0.054], dir: [0,0,1], role: "head" });
  J["jaw"] = b.joint("jaw", { parent: J["head"], at: [0,0.218,0.07], dir: [0,0,1], role: "jaw" });
  J["tail1"] = b.joint("tail1", { parent: J["hips"], at: [0,0.158,-0.06], dir: [0,-0.1,-1], role: "tail", group: "tail" });
  J["tail2"] = b.joint("tail2", { parent: J["tail1"], at: [0,0.15,-0.1], dir: [0,-0.12,-1], role: "tail", group: "tail" });
  J["tail3"] = b.joint("tail3", { parent: J["tail2"], at: [0,0.14,-0.145], dir: [0,-0.12,-1], role: "tail", group: "tail" });
  J["wingL1"] = b.joint("wingL1", { parent: J["chest"], at: [0.048,0.19,0.03], dir: [0.2,-0.3,-1], role: "wing", group: "wings" });
  J["wingL2"] = b.joint("wingL2", { parent: J["wingL1"], at: [0.056,0.178,-0.02], dir: [0.1,-0.2,-1], role: "wing", group: "wings" });
  J["wingL3"] = b.joint("wingL3", { parent: J["wingL2"], at: [0.058,0.165,-0.07], dir: [0,-0.2,-1], role: "wing", group: "wings" });
  J["wingR1"] = b.joint("wingR1", { parent: J["chest"], at: [-0.048,0.19,0.03], dir: [-0.2,-0.3,-1], role: "wing", group: "wings" });
  J["wingR2"] = b.joint("wingR2", { parent: J["wingR1"], at: [-0.056,0.178,-0.02], dir: [-0.1,-0.2,-1], role: "wing", group: "wings" });
  J["wingR3"] = b.joint("wingR3", { parent: J["wingR2"], at: [-0.058,0.165,-0.07], dir: [0,-0.2,-1], role: "wing", group: "wings" });
  J["hipL"] = b.joint("hipL", { parent: J["hips"], at: [0.028,0.135,0], dir: [0,-1,0], role: "leg", group: "legs" });
  J["kneeL"] = b.joint("kneeL", { parent: J["hipL"], at: [0.028,0.122,-0.003], dir: [0,-1,0.3], role: "leg", group: "legs" });
  J["ankleL"] = b.joint("ankleL", { parent: J["kneeL"], at: [0.028,0.108,0], dir: [0,-1,0], role: "leg", group: "legs" });
  J["toeL1"] = b.joint("toeL1", { parent: J["ankleL"], at: [0.028,0.106,0.006], dir: [0.25,0,1], role: "digit", group: "legs" });
  J["toeL2"] = b.joint("toeL2", { parent: J["ankleL"], at: [0.028,0.106,0.006], dir: [0,0,1], role: "digit", group: "legs" });
  J["toeL3"] = b.joint("toeL3", { parent: J["ankleL"], at: [0.028,0.106,0.006], dir: [-0.25,0,1], role: "digit", group: "legs" });
  J["toeL4"] = b.joint("toeL4", { parent: J["ankleL"], at: [0.028,0.106,0.002], dir: [0,0,-1], role: "digit", group: "legs" });
  J["hipR"] = b.joint("hipR", { parent: J["hips"], at: [-0.028,0.135,0], dir: [0,-1,0], role: "leg", group: "legs" });
  J["kneeR"] = b.joint("kneeR", { parent: J["hipR"], at: [-0.028,0.122,-0.003], dir: [0,-1,0.3], role: "leg", group: "legs" });
  J["ankleR"] = b.joint("ankleR", { parent: J["kneeR"], at: [-0.028,0.108,0], dir: [0,-1,0], role: "leg", group: "legs" });
  J["toeR1"] = b.joint("toeR1", { parent: J["ankleR"], at: [-0.028,0.106,0.006], dir: [-0.25,0,1], role: "digit", group: "legs" });
  J["toeR2"] = b.joint("toeR2", { parent: J["ankleR"], at: [-0.028,0.106,0.006], dir: [0,0,1], role: "digit", group: "legs" });
  J["toeR3"] = b.joint("toeR3", { parent: J["ankleR"], at: [-0.028,0.106,0.006], dir: [0.25,0,1], role: "digit", group: "legs" });
  J["toeR4"] = b.joint("toeR4", { parent: J["ankleR"], at: [-0.028,0.106,0.002], dir: [0,0,-1], role: "digit", group: "legs" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
