import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Garden Snail with Ladybird",
  description:
    "A garden snail with a striped caramel, chocolate and cream spiral shell, a pebbly grey-green body, two eye stalks and two feelers. A ladybird rides on top of the shell.",
};

export default function build() {
  const b = createBuilder({ name: "snail" });

  // ---------- palette ----------
  const SKIN = "#8f9f82";
  const SKIN_LIGHT = "#a9b898";
  const SKIN_DARK = "#76866b";
  const STALK = "#7f8f72";
  const SOLE = "#b9c3a4";
  const CARAMEL = "#c98a3e";
  const CHOC = "#5a3320";
  const CREAM = "#f1e0b5";
  const BLACK = "#16130f";
  const WHITE = "#fbfaf2";
  const RED = "#d8281e";
  const MOUTH = "#566049";

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.008, -0.01] });
  const tail1 = b.joint("tail1", { at: [0, 0.006, -0.035], parent: hips });
  const tail2 = b.joint("tail2", { at: [0, 0.004, -0.055], parent: tail1 });
  const chest = b.joint("chest", { at: [0, 0.009, 0.02], parent: hips });
  const head = b.joint("head", { at: [0, 0.024, 0.05], parent: chest });
  const jaw = b.joint("jaw", { at: [0, 0.018, 0.052], parent: head });
  const shell = b.joint("shell", { at: [0, 0.03, -0.01], parent: hips });
  const ladybird = b.joint("ladybird", { at: [0, 0.06, -0.01], parent: shell });

  const stalks: Record<string, any> = {};
  for (const [side, sx] of [["L", 1], ["R", -1]] as const) {
    const s0 = b.joint("stalk" + side + "0", { at: [sx * 0.0035, 0.029, 0.05], parent: head });
    const s1 = b.joint("stalk" + side + "1", { at: [sx * 0.0075, 0.04, 0.0545], parent: s0 });
    const s2 = b.joint("stalk" + side + "2", { at: [sx * 0.0105, 0.0515, 0.0605], parent: s1 });
    stalks[side] = [s0, s1, s2];
    const f0 = b.joint("feeler" + side + "0", { at: [sx * 0.004, 0.0215, 0.0585], parent: head });
    const f1 = b.joint("feeler" + side + "1", { at: [sx * 0.0075, 0.0195, 0.0665], parent: f0 });
    stalks["f" + side] = [f0, f1];
  }

  // ---------- helpers ----------
  const ell = (rx: number, ry: number, rz: number, ws = 8, hs = 6) => {
    const g = new THREE.SphereGeometry(1, ws, hs);
    g.scale(rx, ry, rz);
    return g;
  };
  const seg = (a: number[], c: number[], r0: number, r1: number, color: string, bone: any, rs = 6) => {
    const d = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    const len = Math.hypot(d[0], d[1], d[2]);
    const g = new THREE.CylinderGeometry(r1, r0, len, rs);
    b.part(g, color, {
      at: [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2],
      dir: d,
      bone,
    });
  };

  // ---------- body ----------
  const wAt = (z: number) => {
    const t = Math.min(1, Math.max(0, (z + 0.055) / 0.105));
    const tail = 0.002 + 0.0075 * Math.min(1, t * 2.0);
    return t > 0.8 ? tail - (t - 0.8) * 0.012 : tail;
  };
  const ycAt = (z: number) => {
    const ry = wAt(z) * 0.85;
    return ry - 0.0002 + Math.max(0, z - 0.02) * 0.6;
  };
  const boneAt = (z: number) =>
    z < -0.045 ? tail2 : z < -0.025 ? tail1 : z < 0.012 ? hips : chest;

  for (let z = -0.058; z <= 0.0505; z += 0.005) {
    const w = wAt(z);
    b.part(ell(w, w * 0.85, 0.0068), SKIN, { at: [0, ycAt(z), z], bone: boneAt(z) });
  }
  // lighter foot sole fringe
  for (let z = -0.05; z <= 0.03; z += 0.007) {
    const w = wAt(z);
    b.part(ell(w * 1.05, 0.0018, 0.0058), SOLE, { at: [0, 0.0012, z], bone: boneAt(z) });
  }
  // raised back ridge
  for (let z = -0.04; z <= 0.03; z += 0.008) {
    b.part(ell(0.002, 0.0015, 0.005), SKIN_LIGHT, {
      at: [0, ycAt(z) + wAt(z) * 0.82, z], bone: boneAt(z),
    });
  }

  // head
  b.part(ell(0.0072, 0.0072, 0.0082), SKIN, { at: [0, 0.024, 0.052], bone: head });
  b.part(ell(0.005, 0.004, 0.004), SKIN_LIGHT, { at: [0, 0.0235, 0.058], bone: head });
  // mouth: separate upper and lower jaws
  b.part(new THREE.BoxGeometry(0.0085, 0.003, 0.004), SKIN_DARK, { at: [0, 0.0205, 0.0585], bone: head });
  b.part(new THREE.BoxGeometry(0.0065, 0.0025, 0.0035), MOUTH, { at: [0, 0.0172, 0.0575], bone: jaw });

  // pebbly texture: little bumps over the body
  const r = (function () {
    let s = 12345;
    return () => {
      s = (s * 1664525 + 1013904223) % 4294967296;
      return s / 4294967296;
    };
  })();
  for (let i = 0; i < 110; i++) {
    const z = -0.05 + r() * 0.1;
    const ang = (r() * 0.85 + 0.075) * Math.PI;
    const w = wAt(z);
    const x = Math.cos(ang) * w * 1.0;
    const y = ycAt(z) + Math.sin(ang) * w * 0.85;
    const col = r() < 0.5 ? SKIN_LIGHT : SKIN_DARK;
    b.part(ell(0.001, 0.0008, 0.001, 5, 4), col, {
      at: [(r() < 0.5 ? 1 : -1) * Math.abs(x), y, z], bone: boneAt(z),
    });
  }

  // ---------- eye stalks & feelers ----------
  for (const [side, sx] of [["L", 1], ["R", -1]] as const) {
    const [s0, s1, s2] = stalks[side];
    const p0 = [sx * 0.0035, 0.029, 0.05];
    const p1 = [sx * 0.0075, 0.04, 0.0545];
    const p2 = [sx * 0.0105, 0.0515, 0.0605];
    seg(p0, p1, 0.0025, 0.0019, STALK, s0, 6);
    seg(p1, p2, 0.0019, 0.0016, STALK, s1, 6);
    b.part(ell(0.0032, 0.0032, 0.0032, 8, 6), STALK, { at: [p2[0], p2[1] + 0.0008, p2[2]], bone: s2 });
    b.part(ell(0.0022, 0.0022, 0.0022, 8, 6), BLACK, { at: [p2[0] + sx * 0.0004, p2[1] + 0.0016, p2[2] + 0.0014], bone: s2 });
    b.part(ell(0.0006, 0.0006, 0.0006, 4, 3), WHITE, { at: [p2[0] + sx * 0.0004, p2[1] + 0.0027, p2[2] + 0.0028], bone: s2 });

    const [f0, f1] = stalks["f" + side];
    const q0 = [sx * 0.004, 0.0215, 0.0585];
    const q1 = [sx * 0.0075, 0.0195, 0.0665];
    const q2 = [sx * 0.0095, 0.0175, 0.0715];
    seg(q0, q1, 0.0012, 0.0009, STALK, f0, 5);
    seg(q1, q2, 0.0009, 0.0007, STALK, f1, 5);
    b.part(ell(0.0011, 0.0011, 0.0011, 6, 4), SKIN_DARK, { at: q2, bone: f1 });
  }

  // ---------- shell ----------
  const cy = 0.03;
  const cz = -0.01;
  const N = 44;
  const thetaMax = 5 * Math.PI;
  let top = 0;
  for (let i = 0; i <= N; i++) {
    const th = (i / N) * thetaMax;
    const R = 0.0022 * Math.exp(0.12 * th);
    const tr = 0.0018 + 0.6 * R;
    const y = cy + R * Math.sin(th);
    const z = cz - R * Math.cos(th);
    b.part(ell(tr * 0.55, tr * 0.55, tr * 0.55, 8, 6), CREAM, { at: [0, y, z], bone: shell });
    top = Math.max(top, y + tr * 0.55);
    for (const sx of [1, -1]) {
      b.part(ell(tr * 0.6, tr * 0.6, tr * 0.6, 8, 6), CHOC, { at: [sx * tr * 0.5, y, z], bone: shell });
      b.part(ell(tr * 0.42, tr * 0.42, tr * 0.42, 7, 5), CARAMEL, { at: [sx * tr * 0.78, y, z], bone: shell });
      if (i === N) top = Math.max(top, y + tr * 0.5);
    }
    // apex bump and spiral rim ridge
    if (i === 0) b.part(ell(0.0022, 0.0022, 0.0022, 6, 4), CARAMEL, { at: [0, y, z], bone: shell });
  }
  // cream shell lip at the opening
  {
    const th = thetaMax;
    const R = 0.0022 * Math.exp(0.12 * th);
    const tr = 0.0018 + 0.6 * R;
    b.part(ell(tr * 1.1, tr * 1.0, tr * 0.35, 8, 6), CREAM, {
      at: [0, cy + R * Math.sin(th), cz - R * Math.cos(th) + tr * 0.5], bone: shell,
    });
  }

  // ---------- ladybird ----------
  const ly = top - 0.0006;
  const lz = cz + 0.0;
  const rx = 0.0042, ry = 0.0031, rz = 0.0048;
  b.part(ell(rx, ry, rz, 10, 6), RED, { at: [0, ly + ry * 0.55, lz], bone: ladybird });
  b.part(ell(0.0034, 0.0022, 0.0034, 8, 5), BLACK, { at: [0, ly + 0.0014, lz + rz + 0.0004], bone: ladybird });
  b.part(ell(0.0007, 0.0006, 0.0006, 4, 3), WHITE, { at: [0.0016, ly + 0.0022, lz + rz + 0.0028], bone: ladybird });
  b.part(ell(0.0007, 0.0006, 0.0006, 4, 3), WHITE, { at: [-0.0016, ly + 0.0022, lz + rz + 0.0028], bone: ladybird });
  b.part(new THREE.BoxGeometry(0.0004, 0.0004, 0.0085), BLACK, {
    at: [0, ly + ry * 0.55 + ry + 0.00005, lz - 0.0002], bone: ladybird,
  });
  const spots: number[][] = [
    [0.0021, 0.0012], [-0.0021, 0.0012], [0.0023, -0.0018], [-0.0023, -0.0018], [0.0012, 0.0035], [-0.0012, 0.0035],
  ];
  for (const [sx, sz] of spots) {
    const k = 1 - (sx / rx) ** 2 - (sz / rz) ** 2;
    const sy = ry * Math.sqrt(Math.max(0.05, k));
    b.part(ell(0.0009, 0.0004, 0.0009, 6, 3), BLACK, { at: [sx, ly + ry * 0.55 + sy - 0.0001, lz + sz], bone: ladybird });
  }
  for (const sx of [1, -1]) {
    for (const dz of [-0.002, 0, 0.002]) {
      seg([sx * 0.003, ly + 0.0004, lz + dz], [sx * 0.0052, ly - 0.0008, lz + dz + 0.0004], 0.00022, 0.00022, BLACK, ladybird, 4);
    }
    seg([sx * 0.0008, ly + 0.0018, lz + rz + 0.0034], [sx * 0.0022, ly + 0.0034, lz + rz + 0.0058], 0.00018, 0.00018, BLACK, ladybird, 4);
  }

  return b.root;
}
