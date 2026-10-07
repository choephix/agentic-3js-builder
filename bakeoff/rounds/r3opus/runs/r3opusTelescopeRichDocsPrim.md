```ts
import * as THREE from "three";
import { createBuilder, paint, grain, svg, rng } from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";

export const meta = {
  name: "Explorer's Brass Telescope",
  description:
    "A polished brass refracting telescope with leather-wrapped sections, engraved rings, a finder scope, rack focuser and rubber eyecup, on a mahogany surveyor's tripod with brass fittings and a tray holding a rolled star chart and a compass.",
};

type Col = string | ReturnType<typeof paint>;

export default function build() {
  const b = createBuilder({ name: "brass-telescope", paintSize: 2048 });

  // ---------- palette ----------
  const BRASS = "#c99a3c";
  const BRASS_HI = "#f2d27c";
  const BRASS_LO = "#8a6420";
  const BRASS_DK = "#4f3610";
  const MAHOG = "#7a2c18";
  const MAHOG_DK = "#4a170c";
  const INLAY = "#d0954f";
  const LEATHER = "#4d2715";
  const LEATHER_HI = "#6e3d22";
  const LEATHER_DK = "#28130a";
  const STITCH = "#ead9ab";
  const RUBBER = "#1e1c1b";
  const RIBBON = "#a3242a";
  const WHITE = "#ffffff";

  // ---------- randomness ----------
  const R0 = rng(11) as unknown;
  const R: () => number =
    typeof R0 === "function" ? (R0 as () => number) : () => (R0 as { next: () => number }).next();

  // ---------- paints ----------
  const shade = (n: { y: number }) => (n.y > 0.62 ? BRASS_HI : n.y < -0.4 ? BRASS_LO : BRASS);
  const brassP = paint((_p, n) => shade(n));
  const engraved = paint((_p, n, s) => {
    const k = (((s[1] + s[0] * 5000) % 18) + 18) % 18;
    return k < 4 ? BRASS_DK : shade(n);
  });
  const knurlP = paint((_p, n, s) => ((s[0] * 48) % 1 < 0.4 ? BRASS_LO : shade(n)));
  const rackP = paint((_p, _n, s) => (Math.floor(s[1] * 24) % 2 === 0 ? BRASS_DK : BRASS));
  const shieldP = paint((_p, n, s) =>
    (s[0] > 0.15 && s[0] < 0.154) || (s[0] > 0.158 && s[0] < 0.161) ? BRASS_DK : shade(n),
  );
  const leatherP = (len: number) =>
    paint((_p, n, s) => {
      const h = s[0];
      const d = ((s[1] % 360) + 360) % 360;
      if (h < 0.008 || h > len - 0.008) {
        const edge = h < 0.008 ? h : len - h;
        if (edge > 0.003 && edge < 0.0052 && Math.floor(d / 9) % 2 === 0) return STITCH;
        return LEATHER_DK;
      }
      const w = (((d - h * 2600) % 30) + 30) % 30;
      if (w < 2.2) return LEATHER_DK;
      return n.y > 0.55 ? LEATHER_HI : LEATHER;
    });
  const woodP = grain(MAHOG, MAHOG_DK, { size: 0.012 });
  const trayWood = grain(MAHOG, MAHOG_DK, { size: 0.01, axis: "x" });

  // ---------- textures ----------
  const lensTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><radialGradient id="g" cx="0.4" cy="0.4" r="0.7"><stop offset="0" stop-color="#4f86bd"/><stop offset="0.6" stop-color="#1b2f55"/><stop offset="1" stop-color="#0a1324"/></radialGradient></defs><circle cx="32" cy="32" r="32" fill="url(#g)"/><path d="M14 27 A19 19 0 0 1 29 12" stroke="#eaf5ff" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="41" cy="44" r="3" fill="#9cc4ea"/></svg>`,
    { size: 128 },
  );

  let stars = "";
  for (let i = 0; i < 80; i++) {
    const x = (8 + R() * 224).toFixed(1);
    const y = (8 + R() * 60).toFixed(1);
    const r = (0.6 + R() * 1.3).toFixed(1);
    stars += `<circle cx="${x}" cy="${y}" r="${r}" fill="#f6e7a8"/>`;
  }
  const cons = [
    "28,22 42,30 58,25 70,38 64,52",
    "120,14 132,26 150,22 162,34 150,46 132,40 132,26",
    "190,50 202,40 214,44 222,30",
  ];
  let consSvg = "";
  for (const c of cons) {
    consSvg += `<polyline points="${c}" fill="none" stroke="#d6b45e" stroke-width="0.9"/>`;
    for (const pt of c.split(" ")) {
      const [x, y] = pt.split(",");
      consSvg += `<circle cx="${x}" cy="${y}" r="2" fill="#fff4c4"/>`;
    }
  }
  const starMap = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80"><rect width="240" height="80" fill="#1a2a4c"/><ellipse cx="120" cy="40" rx="100" ry="34" fill="none" stroke="#33507f" stroke-width="0.9"/><ellipse cx="120" cy="40" rx="60" ry="34" fill="none" stroke="#33507f" stroke-width="0.9"/><line x1="0" y1="40" x2="240" y2="40" stroke="#33507f" stroke-width="0.9"/>${stars}${consSvg}<rect x="3" y="3" width="234" height="74" fill="none" stroke="#d6b45e" stroke-width="1.6"/><rect x="6" y="6" width="228" height="68" fill="none" stroke="#d6b45e" stroke-width="0.7"/><text x="120" y="73" font-family="Georgia, serif" font-size="6" fill="#e9c973" text-anchor="middle" letter-spacing="2">MAPPA &#183; COELESTIS</text></svg>`,
    { size: 512 },
  );

  const rollTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 64"><rect width="128" height="64" fill="#e6d2a2"/><circle cx="20" cy="18" r="9" fill="#d9c08a"/><circle cx="70" cy="44" r="12" fill="#dcc48f"/><circle cx="110" cy="12" r="6" fill="#d6bb82"/><line x1="0" y1="6" x2="128" y2="6" stroke="#b89a62" stroke-width="1.5"/><line x1="0" y1="58" x2="128" y2="58" stroke="#b89a62" stroke-width="1.5"/><rect x="40" y="0" width="12" height="64" fill="#1a2a4c"/><line x1="46" y1="0" x2="46" y2="64" stroke="#d6b45e" stroke-width="1.5"/></svg>`,
    { size: 256 },
  );

  let spiral = "M32 32";
  for (let th = 0.3; th <= 6 * Math.PI; th += 0.25) {
    const r = 1.5 + th * 1.55;
    spiral += ` L${(32 + Math.cos(th) * r).toFixed(1)} ${(32 + Math.sin(th) * r).toFixed(1)}`;
  }
  const spiralTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="32" fill="#e6d2a2"/><path d="${spiral}" fill="none" stroke="#7b5a2e" stroke-width="2"/></svg>`,
    { size: 128 },
  );

  let compTicks = "";
  for (let i = 0; i < 36; i++) {
    const a = (i * 10 * Math.PI) / 180;
    const r0 = i % 9 === 0 ? 36 : 40;
    compTicks += `<line x1="${(50 + Math.sin(a) * r0).toFixed(1)}" y1="${(50 - Math.cos(a) * r0).toFixed(1)}" x2="${(50 + Math.sin(a) * 46).toFixed(1)}" y2="${(50 - Math.cos(a) * 46).toFixed(1)}" stroke="#3a2a12" stroke-width="1.3"/>`;
  }
  const compassTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#f2e8cc"/><circle cx="50" cy="50" r="46" fill="none" stroke="#3a2a12" stroke-width="2"/>${compTicks}<polygon points="50,50 26,46 26,54" fill="#3a3a3a"/><polygon points="50,50 74,46 74,54" fill="#3a3a3a"/><polygon points="50,14 56,50 44,50" fill="#b3262a"/><polygon points="50,86 56,50 44,50" fill="#2a2a2a"/><circle cx="50" cy="50" r="4" fill="#c99a3c"/><text x="50" y="31" font-family="Georgia, serif" font-size="9" fill="#3a2a12" text-anchor="middle">N</text></svg>`,
    { size: 256 },
  );

  let scaleTicks = "";
  for (let i = 0; i < 72; i++) {
    const a = (i * 5 * Math.PI) / 180;
    const r0 = i % 6 === 0 ? 40 : 44;
    scaleTicks += `<line x1="${(50 + Math.sin(a) * r0).toFixed(1)}" y1="${(50 - Math.cos(a) * r0).toFixed(1)}" x2="${(50 + Math.sin(a) * 49).toFixed(1)}" y2="${(50 - Math.cos(a) * 49).toFixed(1)}" stroke="#4a3410" stroke-width="1.3"/>`;
  }
  const scaleTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#d8b158"/><circle cx="50" cy="50" r="39" fill="none" stroke="#4a3410" stroke-width="1"/>${scaleTicks}</svg>`,
    { size: 256 },
  );

  const labelTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 44"><line x1="10" y1="4" x2="390" y2="4" stroke="#4a3410" stroke-width="2.5"/><text x="200" y="31" text-anchor="middle" font-family="Georgia, serif" font-size="24" font-style="italic" fill="#4a3410">J. Hargreave &amp; Sons &#183; London</text><line x1="10" y1="40" x2="390" y2="40" stroke="#4a3410" stroke-width="2.5"/></svg>`,
    { size: 1024 },
  );

  // ---------- skeleton ----------
  const tilt = (22 * Math.PI) / 180;
  const PIV = new THREE.Vector3(0, 1.33, 0);
  const D = new THREE.Vector3(0, Math.sin(tilt), Math.cos(tilt));
  const U = new THREE.Vector3(0, Math.cos(tilt), -Math.sin(tilt));
  const X = new THREE.Vector3(1, 0, 0);

  const root = b.joint("root", { at: [0, 0, 0] });
  const az = b.joint("azimuth", { parent: root, at: [0, 1.2, 0], dir: [0, 1, 0] });
  const alt = b.joint("altitude", { parent: az, at: PIV, dir: D, role: "hinge" });

  const A = (s: number, u = 0, x = 0) =>
    PIV.clone().addScaledVector(D, s).addScaledVector(U, u).addScaledVector(X, x);
  const O = (pts: OutlinePoint[]): OutlinePoint[] => pts;
  const turn = (o: OutlinePoint[], s0: number, color: Col, u = 0, segments = 16) =>
    b.lathe(o, { at: A(s0, u), axis: D, segments, color, bone: alt, group: "telescope" });
  const ring = (s0: number, w: number, r: number, r0: number) =>
    turn(
      O([
        [r0, 0],
        [r - 0.002, 0],
        [r, 0.002],
        [r, w - 0.002],
        [r - 0.002, w],
        [r0, w],
      ]),
      s0,
      engraved,
    );
  const leatherSleeve = (s0: number, len: number, r: number, r0: number, u = 0) =>
    turn(
      O([
        [r0, 0],
        [r - 0.0015, 0],
        [r, 0.008],
        [r, len - 0.008],
        [r - 0.0015, len],
        [r0, len],
      ]),
      s0,
      leatherP(len),
      u,
    );

  // ================= TELESCOPE =================
  // rubber eyecup
  turn(
    O([
      [0.011, 0],
      [0.027, 0],
      [0.029, 0.006],
      [0.024, 0.03],
      [0.02, 0.055],
      [0.011, 0.055],
    ]),
    -0.635,
    RUBBER,
  );
  b.part(new THREE.CircleGeometry(0.0115, 12), WHITE, {
    at: A(-0.615),
    dir: D.clone().negate(),
    axis: "z",
    texture: lensTex,
    bone: alt,
  });
  // eyepiece barrel + knurl
  turn(
    O([
      [0, 0],
      [0.017, 0],
      [0.019, 0.004],
      [0.019, 0.07],
      [0.018, 0.11],
      [0, 0.11],
    ]),
    -0.59,
    brassP,
  );
  b.part(new THREE.CylinderGeometry(0.0215, 0.0215, 0.016, 18), knurlP, {
    at: A(-0.545),
    dir: D,
    bone: alt,
    flat: true,
  });
  // draw tubes
  turn(
    O([
      [0, 0],
      [0.029, 0],
      [0.029, 0.014],
      [0.026, 0.016],
      [0.026, 0.135],
      [0, 0.135],
    ]),
    -0.49,
    brassP,
  );
  turn(
    O([
      [0, 0],
      [0.038, 0],
      [0.038, 0.016],
      [0.035, 0.018],
      [0.035, 0.14],
      [0, 0.14],
    ]),
    -0.375,
    brassP,
  );
  // main barrel
  const barrel = turn(
    O([
      [0, 0],
      [0.046, 0],
      [0.046, 0.68],
      [0, 0.68],
    ]),
    -0.25,
    brassP,
  );
  // engraved rings
  for (const [s0, w, r] of [
    [-0.258, 0.022, 0.051],
    [-0.19, 0.012, 0.0505],
    [-0.048, 0.012, 0.0505],
    [0.04, 0.012, 0.0505],
    [0.272, 0.012, 0.0505],
    [0.4, 0.022, 0.051],
  ])
    ring(s0, w, r, 0.04);
  // leather wraps
  leatherSleeve(-0.178, 0.13, 0.049, 0.04);
  leatherSleeve(0.052, 0.22, 0.049, 0.04);
  // cradle band
  turn(
    O([
      [0.04, 0],
      [0.052, 0],
      [0.054, 0.006],
      [0.054, 0.062],
      [0.052, 0.068],
      [0.04, 0.068],
    ]),
    -0.034,
    brassP,
  );
  // dew shield & objective
  turn(
    O([
      [0.044, 0],
      [0.054, 0],
      [0.056, 0.008],
      [0.055, 0.17],
      [0.059, 0.176],
      [0.059, 0.2],
      [0.05, 0.2],
      [0.05, 0.012],
      [0.044, 0.012],
    ]),
    0.42,
    shieldP,
    0,
    18,
  );
  b.part(new THREE.CircleGeometry(0.05, 18), WHITE, { at: A(0.6), dir: D, axis: "z", texture: lensTex, bone: alt });
  b.part(new THREE.TorusGeometry(0.0485, 0.0035, 4, 20), BRASS_LO, { at: A(0.602), dir: D, axis: "z", bone: alt });
  // maker's engraving
  b.decal(barrel, labelTex, { at: A(0.35, 0.046), dir: U, up: [1, 0, 0], size: [0.11, 0.0121], bone: alt });

  // rack & pinion focuser
  b.part(new THREE.BoxGeometry(0.008, 0.12, 0.006), rackP, { at: A(-0.31, -0.037), dir: D, up: U, bone: alt });
  b.part(new THREE.BoxGeometry(0.044, 0.07, 0.024), brassP, { at: A(-0.215, -0.054), dir: D, up: U, bone: alt });
  b.rod(A(-0.215, -0.058, -0.06), A(-0.215, -0.058, 0.06), 0.005, { color: BRASS_LO, bone: alt });
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.019, 0.019, 0.012, 14), knurlP, {
      at: A(-0.215, -0.058, s * 0.056),
      dir: [s, 0, 0],
      bone: alt,
      flat: true,
    });
    b.part(new THREE.CylinderGeometry(0.011, 0.015, 0.007, 14), BRASS_HI, {
      at: A(-0.215, -0.058, s * 0.065),
      dir: [s, 0, 0],
      bone: alt,
    });
  }

  // finder scope
  const FU = 0.098;
  turn(
    O([
      [0, 0],
      [0.006, 0],
      [0.008, 0.004],
      [0.008, 0.03],
      [0.011, 0.036],
      [0.0125, 0.042],
      [0.0125, 0.33],
      [0.016, 0.338],
      [0.017, 0.38],
      [0, 0.38],
    ]),
    -0.09,
    brassP,
    FU,
    12,
  );
  turn(
    O([
      [0.003, 0],
      [0.0095, 0],
      [0.01, 0.014],
      [0.003, 0.014],
    ]),
    -0.1,
    RUBBER,
    FU,
    10,
  );
  b.part(new THREE.CircleGeometry(0.0148, 12), WHITE, {
    at: A(0.2905, FU),
    dir: D,
    axis: "z",
    texture: lensTex,
    bone: alt,
  });
  leatherSleeve(0.03, 0.14, 0.0145, 0.011, FU);
  for (const sb of [-0.042, 0.2]) {
    b.part(new THREE.BoxGeometry(0.022, 0.018, 0.008), BRASS, { at: A(sb, 0.051), dir: D, up: U, bone: alt });
    b.rod(A(sb, 0.05), A(sb, 0.084), 0.0045, { color: BRASS, bone: alt });
    b.part(new THREE.TorusGeometry(0.0155, 0.003, 4, 12), BRASS, { at: A(sb, FU), dir: D, axis: "z", bone: alt });
    for (const deg of [0, 120, 240]) {
      const a = (deg * Math.PI) / 180;
      const v = U.clone().multiplyScalar(Math.cos(a)).addScaledVector(X, Math.sin(a));
      const c = A(sb, FU);
      b.rod(c.clone().addScaledVector(v, 0.017), c.clone().addScaledVector(v, 0.026), 0.0022, {
        color: BRASS_LO,
        bone: alt,
      });
      b.part(new THREE.SphereGeometry(0.0042, 6, 4), BRASS_HI, {
        at: c.clone().addScaledVector(v, 0.027),
        bone: alt,
      });
    }
  }

  // trunnions, setting circle, lock knobs
  for (const s of [1, -1]) {
    b.rod([s * 0.045, 1.33, 0], [s * 0.108, 1.33, 0], 0.012, { color: BRASS_LO, bone: alt });
    const x0 = s > 0 ? 0.115 : -0.11;
    b.part(new THREE.CylinderGeometry(0.023, 0.03, 0.016, 8), BRASS, {
      at: [x0, 1.33, 0],
      dir: [s, 0, 0],
      bone: alt,
      flat: true,
    });
    b.part(new THREE.SphereGeometry(0.014, 8, 6), BRASS_HI, { at: [x0 + s * 0.009, 1.33, 0], bone: alt });
  }
  b.part(new THREE.CylinderGeometry(0.046, 0.046, 0.004, 24), BRASS_LO, {
    at: [0.102, 1.33, 0],
    dir: [1, 0, 0],
    bone: alt,
  });
  b.part(new THREE.CircleGeometry(0.0445, 24), WHITE, {
    at: [0.1045, 1.33, 0],
    dir: [1, 0, 0],
    axis: "z",
    texture: scaleTex,
    bone: alt,
  });

  // ================= MOUNT (azimuth) =================
  b.lathe(
    O([
      [0, 0],
      [0.09, 0],
      [0.092, 0.012],
      [0.08, 0.022],
      [0.06, 0.05],
      [0, 0.05],
    ]),
    { at: [0, 1.15, 0], segments: 18, color: brassP, bone: az, group: "mount" },
  );
  b.extrude(
    [
      [-0.1, 0, "sharp"],
      [0.1, 0, "sharp"],
      [0.1, 0.13],
      [0.088, 0.172],
      [0.075, 0.13],
      [0.075, 0.035, "sharp"],
      [-0.075, 0.035, "sharp"],
      [-0.075, 0.13],
      [-0.088, 0.172],
      [-0.1, 0.13],
    ],
    {
      at: [0, 1.2, 0],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.045,
      bevel: 0.004,
      smoothing: 1,
      color: brassP,
      bone: az,
      group: "mount",
    },
  );
  b.spike([0.106, 1.389, 0], [0.106, 1.374, 0], null, 0.004, { color: BRASS_DK, bone: az });
  b.spike([0, 1.16, 0.086], [0, 1.153, 0.101], null, 0.004, { color: BRASS_DK, bone: az });
  b.rod([0, 1.168, -0.085], [0, 1.168, -0.135], 0.005, { color: BRASS, bone: az });
  b.part(new THREE.SphereGeometry(0.011, 8, 6), BRASS_HI, { at: [0, 1.168, -0.138], bone: az });

  // ================= TRIPOD =================
  b.lathe(
    O([
      [0, 0],
      [0.095, 0],
      [0.112, 0.012],
      [0.115, 0.05],
      [0.105, 0.07],
      [0, 0.07],
    ]),
    { at: [0, 1.08, 0], segments: 18, color: woodP, bone: root, group: "tripod" },
  );
  b.lathe(
    O([
      [0.1, 0],
      [0.118, 0],
      [0.118, 0.02],
      [0.1, 0.02],
    ]),
    { at: [0, 1.11, 0], segments: 18, color: brassP, bone: root, group: "tripod" },
  );
  b.part(new THREE.RingGeometry(0.092, 0.104, 40), WHITE, {
    at: [0, 1.1512, 0],
    dir: [0, 1, 0],
    axis: "z",
    up: [0, 0, -1],
    texture: scaleTex,
    bone: root,
  });
  b.rod([0, 1.082, 0], [0, 1.062, 0], 0.004, { color: BRASS, bone: root });
  b.part(new THREE.TorusGeometry(0.01, 0.0025, 4, 10), BRASS, { at: [0, 1.05, 0], dir: [0, 0, 1], axis: "z", bone: root });

  for (const deg of [0, 120, 240]) {
    const a = (deg * Math.PI) / 180;
    const h = new THREE.Vector3(Math.sin(a), 0, Math.cos(a));
    const tan = new THREE.Vector3(Math.cos(a), 0, -Math.sin(a));
    const T = h.clone().multiplyScalar(0.09).setY(1.1);
    const F = h.clone().multiplyScalar(0.52).setY(0.08);
    const L = F.clone().sub(T).normalize();
    const N = h.clone().addScaledVector(L, -h.dot(L)).normalize();
    const P = (u: number) => T.clone().lerp(F, u);
    const G = F.clone().addScaledVector(L, 0.08 / -L.y);
    const opts = { bone: root, group: "tripod", up: N };

    // hinge lug and bolt
    const lug = h.clone().multiplyScalar(0.092).setY(1.065);
    b.part(new THREE.BoxGeometry(0.062, 0.05, 0.036), brassP, { at: lug, dir: [0, 1, 0], up: h, bone: root });
    b.rod(lug.clone().addScaledVector(tan, -0.04), lug.clone().addScaledVector(tan, 0.04), 0.007, {
      color: BRASS_LO,
      bone: root,
    });
    for (const s of [1, -1])
      b.part(new THREE.CylinderGeometry(0.013, 0.013, 0.008, 6), BRASS_HI, {
        at: lug.clone().addScaledVector(tan, s * 0.042),
        dir: tan.clone().multiplyScalar(s),
        bone: root,
        flat: true,
      });

    // upper leg with satinwood inlay
    b.frustumBox(P(0), P(0.56), [0.05, 0.034], [0.042, 0.03], { ...opts, color: woodP });
    b.frustumBox(
      P(0.04).addScaledVector(N, 0.0168),
      P(0.52).addScaledVector(N, 0.0152),
      [0.008, 0.003],
      [0.007, 0.003],
      { ...opts, color: INLAY },
    );
    // lower leg
    b.frustumBox(P(0.5), P(0.96), [0.034, 0.024], [0.028, 0.02], { ...opts, color: woodP });
    // brass clamp collar with wing screw
    b.frustumBox(P(0.52), P(0.6), [0.056, 0.04], [0.054, 0.038], { ...opts, color: brassP });
    const cs = P(0.56);
    b.rod(cs.clone().addScaledVector(N, 0.018), cs.clone().addScaledVector(N, 0.042), 0.005, {
      color: BRASS,
      bone: root,
    });
    b.part(new THREE.BoxGeometry(0.046, 0.01, 0.012), BRASS_HI, {
      at: cs.clone().addScaledVector(N, 0.046),
      dir: N,
      up: [0, 1, 0],
      bone: root,
    });
    // foot ferrule and spike
    b.frustumBox(P(0.92), F, [0.034, 0.026], [0.028, 0.022], { ...opts, color: brassP });
    b.spike(F, G, null, 0.013, { color: BRASS_DK, bone: root });

    // tray strut and bracket
    const Q = P(0.667);
    b.part(new THREE.BoxGeometry(0.046, 0.024, 0.034), BRASS, { at: Q, dir: L, up: N, bone: root });
    b.rod(h.clone().multiplyScalar(0.176).setY(0.425), Q, 0.005, { color: BRASS, bone: root });
  }

  // ---------- tray ----------
  b.lathe(
    O([
      [0, 0],
      [0.175, 0],
      [0.185, 0.03],
      [0.172, 0.032],
      [0.165, 0.012],
      [0, 0.012],
    ]),
    { at: [0, 0.4, 0], segments: 20, color: trayWood, bone: root, group: "tray" },
  );
  b.part(new THREE.TorusGeometry(0.179, 0.004, 4, 28), BRASS, { at: [0, 0.432, 0], dir: [0, 1, 0], axis: "z", bone: root });
  b.part(new THREE.CylinderGeometry(0.03, 0.018, 0.02, 8), BRASS, { at: [0, 0.392, 0], bone: root, flat: true });

  // rolled star chart
  const rollC = new THREE.Vector3(0, 0.4345, 0.05);
  b.part(new THREE.PlaneGeometry(0.2, 0.075), WHITE, {
    at: [0, 0.4135, 0.0885],
    dir: [0, 1, 0],
    axis: "z",
    up: [0, 0, -1],
    texture: starMap,
    bone: root,
  });
  b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.22, 14, 1, true), WHITE, {
    at: rollC,
    dir: [1, 0, 0],
    texture: rollTex,
    bone: root,
  });
  for (const s of [1, -1])
    b.part(new THREE.CircleGeometry(0.022, 14), WHITE, {
      at: rollC.clone().setX(s * 0.11),
      dir: [s, 0, 0],
      axis: "z",
      texture: spiralTex,
      bone: root,
    });
  b.part(new THREE.TorusGeometry(0.0235, 0.0028, 5, 16), RIBBON, {
    at: rollC.clone().setX(0.045),
    dir: [1, 0, 0],
    axis: "z",
    bone: root,
  });
  for (const s of [1, -1]) {
    b.part(new THREE.TorusGeometry(0.008, 0.0025, 4, 10), RIBBON, {
      at: [0.045, 0.462, 0.05 + s * 0.009],
      dir: [1, 0, 0],
      axis: "z",
      bone: root,
    });
    b.part(new THREE.BoxGeometry(0.004, 0.022, 0.007), RIBBON, {
      at: [0.045 + s * 0.006, 0.452, 0.07 + s * 0.004],
      dir: [s * 0.3, -0.4, 1],
      bone: root,
    });
  }

  // brass pocket compass
  const cc = new THREE.Vector3(-0.075, 0.42, -0.075);
  b.part(new THREE.CylinderGeometry(0.034, 0.036, 0.016, 16), brassP, { at: cc, bone: root });
  b.part(new THREE.CircleGeometry(0.03, 20), WHITE, {
    at: cc.clone().setY(0.4285),
    dir: [0, 1, 0],
    axis: "z",
    up: [0, 0, -1],
    texture: compassTex,
    bone: root,
  });
  b.part(new THREE.TorusGeometry(0.031, 0.003, 4, 20), BRASS_HI, {
    at: cc.clone().setY(0.4285),
    dir: [0, 1, 0],
    axis: "z",
    bone: root,
  });
  b.part(new THREE.BoxGeometry(0.02, 0.008, 0.008), BRASS_LO, { at: [-0.075, 0.428, -0.112], bone: root });
  b.part(new THREE.TorusGeometry(0.006, 0.002, 4, 8), BRASS, {
    at: [-0.075, 0.42, -0.04],
    dir: [1, 0, 0],
    axis: "z",
    bone: root,
  });

  // spare eyepiece
  const ed = new THREE.Vector3(1, 0, 0.45).normalize();
  const ec = new THREE.Vector3(0.08, 0.425, -0.065);
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.06, 10), brassP, { at: ec, dir: ed, bone: root });
  b.part(new THREE.CylinderGeometry(0.0135, 0.0135, 0.01, 12), knurlP, {
    at: ec.clone().addScaledVector(ed, 0.012),
    dir: ed,
    bone: root,
    flat: true,
  });
  b.part(new THREE.CylinderGeometry(0.016, 0.0125, 0.016, 10), RUBBER, {
    at: ec.clone().addScaledVector(ed, -0.036).setY(0.4285),
    dir: ed.clone().negate(),
    bone: root,
  });

  return b.root;
}
```