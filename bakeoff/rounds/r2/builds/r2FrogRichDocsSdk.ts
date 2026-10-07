import * as THREE from "three";
import { createBuilder, limb, countershade, paint, svg, catmull } from "../../../../src/index";

export const meta = {
  name: "Red-eyed tree frog on a leaf",
  description:
    "A startled red-eyed tree frog clinging to a broad leaf: lime skin, blue and cream flanks, orange toes with round pads, cream belly and huge ruby eyes with slit pupils. Rigged with spine, head, jaw, limbs and toes.",
};

const LIME = "#7ddc2a";
const CREAM = "#f6efd0";
const BLUE = "#2f6fd6";
const ORANGE = "#ff7a1a";
const PAD = "#ffb02e";
const RED = "#d3101f";
const BLACK = "#0c0c10";
const LEAF = "#1f7a35";
const VEIN = "#5fbf55";

export default function build() {
  const b = createBuilder({ name: "treefrog" });

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.028, -0.03] });
  const spinePath = catmull([
    [0, 0.028, -0.03],
    [0, 0.03, -0.005],
    [0, 0.033, 0.022],
  ]);
  const spine = b.chain("spine", spinePath, { parent: hips, role: "spine", count: 2 });
  const spineEnd = spine.joints[spine.joints.length - 1];
  const head = b.joint("head", { parent: spineEnd, at: [0, 0.036, 0.022], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.0295, 0.02], aim: [0, 0.0295, 0.05], role: "jaw" });

  // ---------- body ----------
  const coat = countershade(LIME, CREAM, { level: -0.25, soft: 0.1 });
  const bodyPaint = paint((p, n) => {
    if (n.y > -0.2 && n.y < 0.4 && Math.abs(n.x) > 0.55 && p.z < 0.024) {
      const m = (((p.z + 1) / 0.0065) % 1 + 1) % 1;
      return m < 0.3 ? CREAM : BLUE;
    }
    return coat;
  });
  b.sweep(
    spine,
    (t) => {
      const k = Math.sin(Math.PI * (0.12 + 0.72 * t));
      return [0.011 + 0.01 * k, 0.012 + 0.006 * k];
    },
    { color: bodyPaint, sides: 10 },
  );

  // ---------- head ----------
  b.part(new THREE.SphereGeometry(1, 10, 8), LIME, {
    bone: head,
    at: [0, 0.0375, 0.03],
    scale: [0.02, 0.0085, 0.02],
  });
  b.part(new THREE.SphereGeometry(1, 10, 6), CREAM, {
    bone: jaw,
    at: [0, 0.0298, 0.032],
    scale: [0.0165, 0.0045, 0.0185],
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.0012, 5, 4), BLACK, { bone: head, at: [s * 0.005, 0.0388, 0.0495] });
  }

  // eyes
  const slit = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#ff5a1f"/><circle cx="32" cy="32" r="22" fill="#ff8a1f" opacity="0"/><ellipse cx="32" cy="32" rx="5" ry="25" fill="#0a0a0e"/></svg>`,
    { size: 128 },
  );
  for (const s of [1, -1]) {
    const eye = b.part(new THREE.SphereGeometry(0.0086, 10, 8), RED, {
      bone: head,
      at: [s * 0.0135, 0.0455, 0.033],
    });
    const hit = b.surface(eye).around(eye.at).at(s * 40, 6);
    if (hit) {
      b.decal(eye, slit, { at: hit.at, dir: hit.n, size: [0.0115, 0.0115], bone: head });
    }
    // upper lid rim
    b.part(new THREE.SphereGeometry(0.0089, 8, 4, 0, Math.PI * 2, 0, Math.PI * 0.32), LIME, {
      bone: head,
      at: [s * 0.0135, 0.0455, 0.033],
    });
  }

  // ---------- toes ----------
  function toes(base: { x: number; y: number; z: number }, s: number, n: number, len: number, parent: any, tag: string) {
    for (let k = 0; k < n; k++) {
      const a = (k - (n - 1) / 2) * 0.5 + s * 0.25;
      const bs: [number, number, number] = [base.x, 0.0098, base.z];
      const tip: [number, number, number] = [base.x + Math.sin(a) * len, 0.0097, base.z + Math.cos(a) * len];
      const name = `toe${k}${tag}`;
      const ch = b.chain(name, [bs, tip], { parent, role: "digit", names: [name] });
      const j = ch.joints[0];
      b.rod(bs, tip, [0.0017, 0.0013], { color: ORANGE, bone: j, sides: 6 });
      b.part(new THREE.SphereGeometry(0.0034, 7, 5), PAD, { at: tip, bone: j, scale: [1, 0.55, 1] });
    }
  }

  // ---------- limbs ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";

    // arms
    const arm = limb([s * 0.017, 0.026, 0.012], [s * 0.03, 0.0105, 0.03], [0.016, 0.016], [s * 0.7, 0.3, -0.7]);
    const armChain = b.chain("arm" + S, arm, {
      parent: spine.joints[1],
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "arm",
    });
    b.sweep(armChain, [0.0045, 0.003], { color: LIME, sides: 6 });
    toes(arm[arm.length - 1], s, 4, 0.012, armChain, "F" + S);

    // hind legs
    const hind = limb(
      [s * 0.017, 0.029, -0.022],
      [s * 0.034, 0.0095, 0.011],
      [0.022, 0.022, 0.016],
      [s, 0.6, 0.2],
      { sole: [0, 0, 1] },
    );
    const leg = b.chain("leg" + S, hind, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`, `foot${S}`],
      role: "leg",
    });
    b.sweep(leg, [0.0078, 0.0058, 0.0036, 0.003], {
      color: LIME,
      sides: 8,
      sectors: [[90, 270, BLUE, 0, 0.5]],
    });
    toes(hind[hind.length - 1], s, 4, 0.015, leg, "H" + S);
  }

  // ---------- leaf ----------
  const leafPaint = paint((_p, _n, s) => {
    const ax = Math.abs(s[0]);
    if (ax < 0.003) return VEIN;
    const m = ((((s[1] - ax * 0.8) / 0.03) % 1) + 1) % 1;
    if (m < 0.06 && ax < 0.08) return VEIN;
    return LEAF;
  });
  b.extrude(
    [
      [0, -0.12, "sharp"],
      [0.05, -0.08],
      [0.085, 0.0],
      [0.075, 0.07],
      [0, 0.15, "sharp"],
      [-0.075, 0.07],
      [-0.085, 0.0],
      [-0.05, -0.08],
    ],
    {
      at: [0, 0.004, 0],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.008,
      smoothing: 2,
      color: leafPaint,
      bone: hips,
    },
  );
  b.rod([0, 0.004, -0.115], [0, 0.004, -0.2], 0.004, { color: LEAF, bone: hips, sides: 6 });

  return b.root;
}
