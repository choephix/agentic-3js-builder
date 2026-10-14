```ts
import * as THREE from "three";
import { createBuilder, frame, paint, cells, noise, mix, grain, svg, DEG } from "agentic-3js-builder";

export const meta = {
  name: "Brass Refractor Telescope",
  description:
    "A stylized 80mm refractor: star-speckled navy enamel tube with brass trim, finder scope and focuser, on a brass-yoked wooden tripod with an accessory tray of spare eyepieces.",
};

export default function build() {
  const b = createBuilder({ name: "telescope", paintSize: 2048 });

  // ---------- palette ----------
  const BRASS = "#d1a849";
  const BRASS_DK = "#9c7628";
  const SILVER = "#c3c8d1";
  const BLACK = "#1b1b21";
  const RUBBER = "#26262b";
  const GLASS = "#2d6585";
  const GLASS_HI = "#d8f3ff";
  const NAVY = "#1c2d5c";

  const starfield = paint((p) => {
    const c = cells(p, 0.03, 4);
    const r = 0.05 + 0.09 * c.id;
    if (c.id > 0.55 && c.d1 < r) return c.id > 0.85 ? "#ffffff" : "#f2d77e";
    return mix("#16244d", "#253a72", noise(p, 0.12, 2));
  });
  const wood = grain("#7a4721", "#a86a35", { size: 0.012, axis: "y", seed: 3 });
  const woodFlat = grain("#7a4721", "#a86a35", { size: 0.012, axis: "x", seed: 5 });

  // ---------- joints ----------
  const root = b.joint("root", { at: [0, 0, 0] });
  const pan = b.joint("pan", { at: [0, 1.14, 0], parent: root });
  const tiltA = 25 * DEG;
  const d = new THREE.Vector3(0, Math.sin(tiltA), Math.cos(tiltA)); // tube axis (toward objective)
  const n = new THREE.Vector3(0, Math.cos(tiltA), -Math.sin(tiltA)); // tube "up"
  const X = new THREE.Vector3(1, 0, 0);
  const P = new THREE.Vector3(0, 1.28, 0);
  const tilt = b.joint("tilt", { at: P, parent: pan, dir: d, up: n, role: "hinge" });
  const E = P.clone().addScaledVector(d, -0.45); // tube reference point (rear)
  const T = (h: number, up = 0, side = 0) =>
    E.clone().addScaledVector(d, h).addScaledVector(n, up).addScaledVector(X, side);

  // a turned ring/disc on the tube axis: r0 = 0 gives a solid
  const band = (h0: number, h1: number, r0: number, r1: number, color: any, seg = 16, at = E) =>
    b.lathe(
      [
        [r0, h0],
        [r1, h0],
        [r1, h1],
        [r0, h1],
      ],
      { color, at, axis: d, segments: seg, bone: tilt },
    );

  // ---------- optical tube ----------
  const tube = band(0.08, 0.83, 0, 0.052, starfield, 18);
  band(0.04, 0.1, 0, 0.058, BRASS, 18); // rear cell
  band(0.1, 0.112, 0.05, 0.056, BRASS_DK, 18);
  b.ring(frame(T(0.07), d), { count: 8, radius: 0.058 }, (item) =>
    b.part(new THREE.SphereGeometry(0.0045, 6, 4), BRASS_DK, { at: item.at, bone: tilt }),
  );
  band(0.24, 0.26, 0.05, 0.056, BRASS, 18);
  band(0.64, 0.66, 0.05, 0.056, BRASS, 18);
  band(0.42, 0.48, 0.05, 0.061, BRASS, 18); // cradle ring
  band(0.43, 0.47, 0.06, 0.063, BRASS_DK, 18);
  // dew shield (hollow, black inside) + brass lip
  band(0.82, 0.985, 0.062, 0.066, starfield, 18);
  band(0.82, 0.985, 0.058, 0.062, BLACK, 18);
  band(0.985, 1.0, 0.058, 0.07, BRASS, 18);
  band(0.88, 0.892, 0.065, 0.068, BRASS, 18);
  // objective
  band(0.935, 0.948, 0, 0.06, GLASS, 18);
  band(0.948, 0.956, 0.046, 0.06, BLACK, 18);
  b.part(new THREE.CircleGeometry(0.011, 10), GLASS_HI, {
    at: T(0.949, 0.022, 0.014),
    dir: d,
    up: n,
    axis: "z",
    scale: [1.6, 0.8, 1],
    bone: tilt,
  });
  b.part(new THREE.CircleGeometry(0.005, 8), GLASS_HI, {
    at: T(0.949, 0.006, 0.026),
    dir: d,
    axis: "z",
    bone: tilt,
  });

  // focuser + eyepiece
  band(-0.035, 0.045, 0, 0.032, BRASS, 16);
  band(-0.04, -0.03, 0.02, 0.034, BRASS_DK, 16);
  band(-0.1, -0.035, 0, 0.022, SILVER, 14);
  band(-0.075, -0.071, 0.02, 0.0228, BLACK, 14);
  band(-0.165, -0.1, 0, 0.02, BLACK, 14);
  band(-0.108, -0.098, 0.018, 0.0218, SILVER, 14);
  band(-0.19, -0.162, 0.012, 0.023, RUBBER, 14);
  band(-0.18, -0.175, 0, 0.0125, GLASS, 12);
  // rack housing & focus knobs
  b.part(new THREE.BoxGeometry(0.03, 0.065, 0.02), BRASS_DK, {
    at: T(0.005, -0.035),
    dir: d,
    up: n,
    bone: tilt,
  });
  const fk = T(0.005, -0.04);
  b.rod(fk.clone().addScaledVector(X, -0.055), fk.clone().addScaledVector(X, 0.055), 0.005, {
    color: SILVER,
    bone: tilt,
  });
  for (const s of [-1, 1]) {
    b.rod(fk.clone().addScaledVector(X, s * 0.05), fk.clone().addScaledVector(X, s * 0.066), 0.017, {
      color: BLACK,
      sides: 10,
      smooth: false,
      bone: tilt,
    });
    b.rod(fk.clone().addScaledVector(X, s * 0.066), fk.clone().addScaledVector(X, s * 0.07), 0.012, {
      color: BRASS,
      sides: 10,
      bone: tilt,
    });
  }

  // finder scope
  const F0 = T(0.5, 0.085);
  band(0, 0.2, 0, 0.014, BLACK, 12, F0);
  band(0.19, 0.24, 0.012, 0.0165, BLACK, 12, F0);
  band(0.235, 0.24, 0.012, 0.0175, BRASS, 12, F0);
  band(0.2, 0.205, 0, 0.0135, GLASS, 12, F0);
  band(-0.045, 0.0, 0, 0.01, BLACK, 10, F0);
  band(-0.05, -0.04, 0.006, 0.012, RUBBER, 10, F0);
  for (const h of [0.05, 0.16]) {
    band(h - 0.008, h + 0.008, 0.013, 0.019, BRASS, 12, F0);
    b.rod(T(0.5 + h, 0.048), T(0.5 + h, 0.068), 0.0045, { color: BRASS_DK, bone: tilt });
    b.part(new THREE.BoxGeometry(0.02, 0.024, 0.006), BRASS_DK, {
      at: T(0.5 + h, 0.054),
      dir: d,
      up: n,
      bone: tilt,
    });
  }

  // name plaques
  const plaque = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 100">
      <rect x="4" y="4" width="472" height="92" rx="16" fill="#132048" stroke="#e8c766" stroke-width="6"/>
      <rect x="16" y="16" width="448" height="68" rx="10" fill="none" stroke="#b8963e" stroke-width="2"/>
      <text x="240" y="66" font-family="Georgia, 'Times New Roman', serif" font-size="44" font-weight="bold" fill="#f2d77e" text-anchor="middle" letter-spacing="7">STELLARIS</text>
      <path transform="translate(48,50)" fill="#f2d77e" d="M0,-16 L4.5,-5 16,-5 7,3 10,15 0,8 -10,15 -7,3 -16,-5 -4.5,-5Z"/>
      <path transform="translate(432,50)" fill="#f2d77e" d="M0,-16 L4.5,-5 16,-5 7,3 10,15 0,8 -10,15 -7,3 -16,-5 -4.5,-5Z"/>
    </svg>`,
    { size: 512 },
  );
  for (const s of [1, -1])
    b.decal(tube, plaque, { at: T(0.56, 0, s * 0.053), dir: [s, 0, 0], up: n, size: [0.24, 0.05] });

  // ---------- yoke mount ----------
  for (const s of [-1, 1]) {
    b.extrude(
      [
        [-0.05, 0, "sharp"],
        [0.05, 0, "sharp"],
        [0.04, 0.1],
        [0.032, 0.14],
        [0, 0.155],
        [-0.032, 0.14],
        [-0.04, 0.1],
      ],
      { color: BRASS, at: [s * 0.072, 1.16, 0], thickness: 0.014, bevel: 0.003, smoothing: 1, bone: pan },
    );
    b.rod([s * 0.058, 1.28, 0], [s * 0.095, 1.28, 0], 0.01, { color: SILVER, bone: tilt });
    b.rod([s * 0.093, 1.28, 0], [s * 0.115, 1.28, 0], 0.022, {
      color: BRASS_DK,
      sides: 10,
      smooth: false,
      bone: tilt,
    });
    b.rod([s * 0.115, 1.28, 0], [s * 0.12, 1.28, 0], 0.012, { color: BRASS, bone: tilt });
  }
  b.part(new THREE.BoxGeometry(0.165, 0.022, 0.1), BRASS_DK, { at: [0, 1.165, 0], bone: pan });
  b.lathe(
    [
      [0, 0],
      [0.05, 0],
      [0.05, 0.03],
      [0.04, 0.045],
      [0, 0.045],
    ],
    { color: BRASS, at: [0, 1.12, 0], segments: 16, bone: pan },
  );
  b.rod([0, 1.14, 0.045], [0, 1.14, 0.085], 0.005, { color: SILVER, bone: pan });
  b.part(new THREE.SphereGeometry(0.013, 8, 6), BLACK, { at: [0, 1.14, 0.09], bone: pan });

  // ---------- tripod ----------
  b.lathe(
    [
      [0, 0],
      [0.11, 0],
      [0.11, 0.06],
      [0, 0.06],
    ],
    { color: woodFlat, at: [0, 1.06, 0], segments: 6, spin: 30, bone: root },
  );
  b.lathe(
    [
      [0, 0],
      [0.07, 0],
      [0.07, 0.006],
      [0, 0.006],
    ],
    { color: BRASS_DK, at: [0, 1.12, 0], segments: 16, bone: root },
  );

  for (const deg of [0, 120, 240]) {
    const a = deg * DEG;
    const rad = new THREE.Vector3(Math.sin(a), 0, Math.cos(a));
    const tan = new THREE.Vector3(Math.cos(a), 0, -Math.sin(a));
    const top = rad.clone().multiplyScalar(0.1).setY(1.05);
    const foot = rad.clone().multiplyScalar(0.52).setY(0.04);
    const L = (f: number) => top.clone().lerp(foot, f);
    const off = (v: THREE.Vector3, s: number) => v.clone().addScaledVector(tan, s);

    for (const s of [-1, 1])
      b.frustumBox(off(L(0), s * 0.022), off(L(0.62), s * 0.022), [0.02, 0.032], [0.018, 0.028], {
        color: wood,
        up: rad,
        bone: root,
      });
    b.frustumBox(L(0.42), L(0.93), [0.022, 0.024], [0.02, 0.022], { color: wood, up: rad, bone: root });
    b.frustumBox(L(0.9), L(0.965), [0.028, 0.03], [0.026, 0.028], { color: BRASS, up: rad, bone: root });
    b.lathe(
      [
        [0, 0],
        [0.02, 0],
        [0.016, 0.07],
        [0, 0.07],
      ],
      { color: RUBBER, at: [foot.x, 0, foot.z], segments: 8, bone: root },
    );
    // leg clamp + wing knob
    b.frustumBox(L(0.56), L(0.62), [0.078, 0.046], [0.078, 0.046], { color: BRASS, up: rad, bone: root });
    const c = L(0.59);
    b.rod(c.clone().addScaledVector(rad, 0.02), c.clone().addScaledVector(rad, 0.05), 0.005, {
      color: SILVER,
      bone: root,
    });
    b.part(new THREE.BoxGeometry(0.044, 0.014, 0.008), BLACK, {
      at: c.clone().addScaledVector(rad, 0.052),
      rotation: [0, deg, 0],
      bone: root,
    });
    // hinge block + bolt
    b.part(new THREE.BoxGeometry(0.075, 0.04, 0.035), BRASS_DK, {
      at: rad.clone().multiplyScalar(0.105).setY(1.07),
      rotation: [0, deg, 0],
      bone: root,
    });
    const hb = rad.clone().multiplyScalar(0.1).setY(1.06);
    b.rod(off(hb, -0.045), off(hb, 0.045), 0.006, { color: SILVER, bone: root });
    for (const s of [-1, 1])
      b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.006, 6), SILVER, {
        at: off(hb, s * 0.046),
        dir: tan,
        bone: root,
      });
    // tray arm
    b.frustumBox(
      rad.clone().multiplyScalar(0.15).setY(0.39),
      rad.clone().multiplyScalar(0.366).setY(0.39),
      [0.022, 0.008],
      [0.018, 0.008],
      { color: BRASS, up: [0, 1, 0], bone: root },
    );
  }

  // accessory tray
  const trayPts: Array<[number, number]> = [];
  for (const deg of [0, 120, 240])
    for (const da of [-14, 14]) {
      const a = (deg + da) * DEG;
      trayPts.push([0.17 * Math.sin(a), -0.17 * Math.cos(a)]);
    }
  b.extrude(trayPts, {
    color: woodFlat,
    at: [0, 0.39, 0],
    x: [1, 0, 0],
    y: [0, 0, -1],
    thickness: 0.016,
    bevel: 0.004,
    smoothing: 2,
    bone: root,
  });
  // spare eyepieces standing on the tray
  [60, 180, 300].forEach((deg, i) => {
    const a = deg * DEG;
    const at: [number, number, number] = [0.075 * Math.sin(a), 0.398, 0.075 * Math.cos(a)];
    const h = 0.04 + i * 0.008;
    b.lathe(
      [
        [0, 0],
        [0.0145, 0],
        [0.0145, h],
        [0.012, h + 0.005],
        [0, h + 0.005],
      ],
      { color: BLACK, at, segments: 12, bone: root },
    );
    b.lathe(
      [
        [0.0, h * 0.55],
        [0.0155, h * 0.55],
        [0.0155, h * 0.7],
        [0.0, h * 0.7],
      ],
      { color: i === 1 ? BRASS : SILVER, at, segments: 12, bone: root },
    );
    b.lathe(
      [
        [0, h + 0.005],
        [0.008, h + 0.005],
        [0.008, h + 0.007],
        [0, h + 0.007],
      ],
      { color: GLASS, at, segments: 10, bone: root },
    );
  });

  return b.root;
}
```