```ts
import * as THREE from "three";
import { createBuilder, paint, spots, grain, svg } from "agentic-3js-builder";

export const meta = {
  name: "Brass Refractor Telescope",
  description:
    "A stylized star-gazing refractor: a navy tube sprinkled with gold stars, a brass fork mount and dew shield, a cream finder scope, and a splayed wooden tripod with an eyepiece tray.",
};

export default function build() {
  const b = createBuilder({ name: "telescope" });

  // Palette
  const NAVY = "#1d2b5c";
  const GOLD = "#f2c75c";
  const BRASS = "#d4a442";
  const BRASS_DK = "#9c7428";
  const WOOD = "#b0703e";
  const WOOD_DK = "#7a4524";
  const GLASS = "#6fd6ff";
  const BLACK = "#1b1b22";
  const SILVER = "#c9ccd4";
  const CREAM = "#efe6d2";
  const INNER = "#0b0e1c";
  const RED = "#d8423a";

  const starPaint = spots(NAVY, GOLD, { size: 0.06, amount: 0.07, seed: 11 });
  const woodPaint = grain(WOOD, WOOD_DK, { size: 0.02, axis: "y", seed: 4 });

  // Skeleton
  const root = b.joint("root", { at: [0, 0, 0] });
  const mount = b.joint("mount", { parent: root, at: [0, 1.0, 0] });
  const tilt = 30 * (Math.PI / 180);
  const P = new THREE.Vector3(0, 1.25, 0);
  const d = new THREE.Vector3(0, Math.sin(tilt), Math.cos(tilt));
  const u = new THREE.Vector3(0, Math.cos(tilt), -Math.sin(tilt));
  const tubeJ = b.joint("tubeTilt", { parent: mount, at: P, dir: d, role: "hinge" });

  // point along the tube: a along axis, c along tube-up, x sideways
  const T = (a: number, c = 0, x = 0) =>
    new THREE.Vector3(x, 0, 0).add(P).addScaledVector(d, a).addScaledVector(u, c);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---------------- Tube ----------------
  const mainTube = b.sweep([T(-0.45), T(0.43)], 0.07, {
    color: starPaint,
    caps: "flat",
    sides: 16,
    bone: tubeJ,
  });

  // brass bands
  for (const a of [-0.44, -0.16, 0.16, 0.415]) {
    b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.024, 16), BRASS, {
      at: T(a),
      dir: d,
      bone: tubeJ,
    });
  }
  // rear cap
  b.part(new THREE.CylinderGeometry(0.068, 0.072, 0.03, 16), BRASS_DK, {
    at: T(-0.46),
    dir: d,
    bone: tubeJ,
  });

  // dew shield: a lathed cup with dark interior
  const shieldBase = T(0.43);
  const shieldPaint = paint((p, n) => {
    const rel = p.clone().sub(shieldBase);
    const along = rel.dot(d);
    const radial = rel.clone().addScaledVector(d, -along);
    if (radial.dot(n) < -0.0005) return INNER;
    if (n.dot(d) > 0.9 && radial.length() < 0.076) return INNER;
    return NAVY;
  });
  b.lathe(
    [
      [0, 0],
      [0.084, 0],
      [0.084, 0.22],
      [0.077, 0.22],
      [0.077, 0.03],
      [0, 0.03],
    ],
    { at: shieldBase, axis: d, segments: 16, color: shieldPaint, bone: tubeJ },
  );
  // gold rim
  b.part(new THREE.TorusGeometry(0.0805, 0.0065, 6, 24), GOLD, {
    at: T(0.65),
    dir: d,
    axis: "z",
    bone: tubeJ,
  });
  b.part(new THREE.TorusGeometry(0.085, 0.006, 6, 24), BRASS, {
    at: T(0.435),
    dir: d,
    axis: "z",
    bone: tubeJ,
  });
  // objective lens + glint
  b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.006, 20), GLASS, {
    at: T(0.464),
    dir: d,
    bone: tubeJ,
  });
  b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.004, 10), "#ffffff", {
    at: T(0.468, 0.03, -0.02),
    dir: d,
    bone: tubeJ,
  });
  b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.004, 8), "#ffffff", {
    at: T(0.468, 0.008, -0.04),
    dir: d,
    bone: tubeJ,
  });

  // name plaques on both flanks
  const label = svg(
    `<svg viewBox="0 0 160 50" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="154" height="44" rx="10" fill="#f2e3b3" stroke="#b8862b" stroke-width="5"/>
      <circle cx="20" cy="25" r="6" fill="#d4a442"/>
      <circle cx="140" cy="25" r="6" fill="#d4a442"/>
      <text x="80" y="33" font-family="Georgia, serif" font-size="22" font-weight="bold" text-anchor="middle" fill="#1d2b5c">STELLA 80</text>
    </svg>`,
    { size: 256 },
  );
  for (const s of [1, -1]) {
    b.decal(mainTube, label, {
      at: T(0.27, 0, s * 0.07),
      dir: [s, 0, 0],
      up: [u.x, u.y, u.z],
      size: [0.17, 0.053],
      bone: tubeJ,
    });
  }

  // ---------------- Focuser & eyepiece ----------------
  b.rod(T(-0.46), T(-0.56), 0.04, { color: BRASS, bone: tubeJ, sides: 12 });
  b.rod(T(-0.56), T(-0.63), 0.03, { color: SILVER, bone: tubeJ, sides: 12 });
  b.rod(T(-0.51, -0.05, -0.075), T(-0.51, -0.05, 0.075), 0.006, { color: SILVER, bone: tubeJ });
  b.part(new THREE.BoxGeometry(0.05, 0.03, 0.04), BRASS_DK, { at: T(-0.51, -0.04), dir: d, bone: tubeJ });
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.018, 10), BLACK, {
      at: T(-0.51, -0.05, s * 0.08),
      dir: [1, 0, 0],
      bone: tubeJ,
      flat: true,
    });
    b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.006, 8), BRASS, {
      at: T(-0.51, -0.05, s * 0.091),
      dir: [1, 0, 0],
      bone: tubeJ,
    });
  }
  const E = T(-0.665);
  b.part(new THREE.BoxGeometry(0.06, 0.06, 0.06), BRASS, { at: E, dir: d, bone: tubeJ, flat: true });
  const up = V(0, 1, 0);
  b.rod(E.clone().addScaledVector(up, 0.02), E.clone().addScaledVector(up, 0.085), 0.022, {
    color: SILVER,
    bone: tubeJ,
  });
  b.part(new THREE.CylinderGeometry(0.026, 0.026, 0.012, 12), GOLD, {
    at: E.clone().addScaledVector(up, 0.085),
    bone: tubeJ,
  });
  b.capsule(E.clone().addScaledVector(up, 0.095), E.clone().addScaledVector(up, 0.13), 0.026, {
    color: BLACK,
    bone: tubeJ,
  });

  // ---------------- Finder scope ----------------
  for (const a of [0.0, 0.22]) {
    b.rod(T(a, 0.066), T(a, 0.108), 0.008, { color: BLACK, bone: tubeJ });
    b.part(new THREE.TorusGeometry(0.023, 0.005, 6, 16), BRASS, {
      at: T(a, 0.125),
      dir: d,
      axis: "z",
      bone: tubeJ,
    });
  }
  b.sweep([T(-0.05, 0.125), T(0.3, 0.125)], 0.02, { color: CREAM, caps: "flat", bone: tubeJ, sides: 12 });
  b.part(new THREE.CylinderGeometry(0.023, 0.023, 0.03, 12), BRASS, { at: T(0.29, 0.125), dir: d, bone: tubeJ });
  b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.004, 12), GLASS, { at: T(0.306, 0.125), dir: d, bone: tubeJ });
  b.rod(T(-0.05, 0.125), T(-0.09, 0.125), 0.012, { color: BLACK, bone: tubeJ });
  b.part(new THREE.SphereGeometry(0.006, 6, 4), RED, { at: T(0.1, 0.147), bone: tubeJ });

  // trunnions (rotate with tube)
  for (const s of [1, -1]) {
    b.rod(V(s * 0.06, P.y, 0), V(s * 0.105, P.y, 0), 0.022, { color: BRASS, bone: tubeJ });
  }

  // ---------------- Fork mount ----------------
  b.part(new THREE.CylinderGeometry(0.075, 0.085, 0.04, 12), BRASS_DK, { at: [0, 1.0, 0], bone: mount, flat: true });
  b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.01, 12), GOLD, { at: [0, 1.023, 0], bone: mount });
  b.part(new THREE.BoxGeometry(0.26, 0.03, 0.08), NAVY, { at: [0, 1.04, 0], bone: mount, flat: true });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.026, 0.26, 0.075), NAVY, {
      at: [s * 0.117, 1.16, 0],
      bone: mount,
      flat: true,
    });
    b.part(new THREE.BoxGeometry(0.03, 0.02, 0.08), BRASS, { at: [s * 0.117, 1.28, 0], bone: mount });
    // clamp knob with handle
    b.part(new THREE.CylinderGeometry(0.034, 0.034, 0.022, 8), BRASS, {
      at: [s * 0.141, P.y, 0],
      dir: [1, 0, 0],
      bone: mount,
      flat: true,
    });
    b.capsule(V(s * 0.155, P.y, 0), V(s * 0.155, P.y + 0.06, 0.02), 0.007, { color: BLACK, bone: mount });
  }

  // ---------------- Tripod ----------------
  b.part(new THREE.CylinderGeometry(0.11, 0.1, 0.05, 6), WOOD_DK, { at: [0, 0.955, 0], bone: root, flat: true });
  b.part(new THREE.CylinderGeometry(0.112, 0.112, 0.012, 6), BRASS, { at: [0, 0.98, 0], bone: root, flat: true });

  const legAngles = [180, 60, 300].map((a) => (a * Math.PI) / 180);
  const legMids: THREE.Vector3[] = [];
  legAngles.forEach((A, i) => {
    const sx = Math.sin(A);
    const sz = Math.cos(A);
    const top = V(0.09 * sx, 0.93, 0.09 * sz);
    const foot = V(0.5 * sx, 0.035, 0.5 * sz);
    const dir = foot.clone().sub(top).normalize();
    b.rod(top, foot, [0.028, 0.02], { color: woodPaint, bone: root, sides: 8, name: `leg${i}` });
    // hinge tab + bolt
    b.part(new THREE.BoxGeometry(0.05, 0.06, 0.04), BRASS_DK, { at: top, dir, bone: root, flat: true });
    const tang = V(sz, 0, -sx);
    b.rod(top.clone().addScaledVector(tang, -0.035), top.clone().addScaledVector(tang, 0.035), 0.008, {
      color: GOLD,
      bone: root,
    });
    // clamp collar
    const col = top.clone().lerp(foot, 0.68);
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.035, 8), BRASS, { at: col, dir, bone: root, flat: true });
    b.part(new THREE.SphereGeometry(0.011, 6, 4), BLACK, {
      at: col.clone().add(V(sx * 0.03, 0, sz * 0.03)),
      bone: root,
    });
    // ferrule + spike foot
    b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.04, 8), BRASS, {
      at: foot.clone().addScaledVector(dir, -0.015),
      dir,
      bone: root,
    });
    const tip = foot.clone().addScaledVector(dir, foot.y / Math.abs(dir.y));
    b.spike(foot, tip, null, 0.02, { color: BRASS_DK, bone: root });
    legMids.push(top.clone().lerp(foot, 0.5));
    // spreader arm
    b.rod(V(0.13 * sx, 0.46, 0.13 * sz), top.clone().lerp(foot, 0.5), 0.009, { color: BRASS, bone: root });
  });

  // accessory tray (hexagonal)
  b.lathe(
    [
      [0, 0],
      [0.15, 0],
      [0.15, 0.035],
      [0.136, 0.035],
      [0.136, 0.012],
      [0, 0.012],
    ],
    { at: [0, 0.44, 0], segments: 6, spin: 30, color: woodPaint, bone: root },
  );
  // spare eyepieces in the tray
  const spare = [
    { a: 20, c: SILVER, h: 0.06 },
    { a: 140, c: BLACK, h: 0.05 },
    { a: 260, c: SILVER, h: 0.045 },
  ];
  for (const e of spare) {
    const A = (e.a * Math.PI) / 180;
    const base = V(0.075 * Math.sin(A), 0.452, 0.075 * Math.cos(A));
    b.part(new THREE.CylinderGeometry(0.018, 0.018, e.h, 10), e.c, {
      at: base.clone().add(V(0, e.h / 2, 0)),
      bone: root,
    });
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.008, 10), GOLD, {
      at: base.clone().add(V(0, e.h - 0.004, 0)),
      bone: root,
    });
  }
  // small star-chart booklet in the tray
  b.part(new THREE.BoxGeometry(0.07, 0.008, 0.05), "#3a5fb0", {
    at: [-0.02, 0.457, -0.03],
    rotation: [0, 25, 0],
    bone: root,
  });

  return b.root;
}
```