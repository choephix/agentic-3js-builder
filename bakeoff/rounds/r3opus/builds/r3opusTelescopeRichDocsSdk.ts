import * as THREE from "three";
import { createBuilder, frame, offset, paint, mottle, grain, svg } from "../../../../src/index";
import type { OutlinePoint } from "../../../../src/index";

export const meta = {
  name: "Explorer's Brass Telescope",
  description:
    "A polished brass explorer's telescope with leather-wrapped sections, engraved rings, finder scope, rubber eyecup and focusing knobs, on a mahogany tripod with brass fittings, a plumb bob and a tray holding a rolled star chart, pencil and compass.",
};

export default function build() {
  const b = createBuilder({ name: "explorers-telescope", paintSize: 2048 });

  // ---------- palette ----------
  const BRASS = "#c99a3b";
  const BRASS_LIGHT = "#ecc76a";
  const BRASS_DARK = "#8d6424";
  const LEATHER = "#6b3a22";
  const LEATHER_DARK = "#3e2013";
  const STITCH = "#ead3a0";
  const MAHOGANY = "#7a2e1c";
  const MAHOG_DARK = "#4b170e";
  const GLASS = "#1e3a4c";
  const GLINT = "#cfe8f2";
  const RUBBER = "#221d1b";
  const PAPER = "#e6d3a3";
  const RIBBON = "#a3242c";
  const PENCIL = "#d8a420";
  const WOOD_TIP = "#e2c08a";
  const GRAPHITE = "#2e2e2e";
  const CORD = "#3a2a1a";

  // ---------- paints ----------
  const leatherBase = mottle(LEATHER, LEATHER_DARK, { size: 0.025, contrast: 0.6, seed: 3 });
  const leather = (h0: number, h1: number) =>
    paint((_p, _n, s) => {
      const e = Math.min(s[0] - h0, h1 - s[0]);
      const a = ((s[1] % 10) + 10) % 10;
      if (e > 0.004 && e < 0.008 && a < 5) return STITCH;
      const seam = Math.abs(((s[1] - 180 + 540) % 360) - 180);
      if (seam < 1.6) return LEATHER_DARK;
      if (seam < 5 && ((((s[0] + 10) / 0.012) % 1) < 0.35)) return STITCH;
      return leatherBase;
    });
  const engrave = (hc: number) =>
    paint((_p, _n, s) => {
      const d = Math.abs(s[0] - hc);
      const a = ((s[1] % 9) + 9) % 9;
      if (d < 0.0012) return BRASS_DARK;
      if (a < 1.6 && d < 0.0065) return BRASS_DARK;
      return BRASS_LIGHT;
    });
  const trayWood = grain(MAHOGANY, MAHOG_DARK, { size: 0.01, axis: "x" });
  const headWood = grain(MAHOGANY, MAHOG_DARK, { size: 0.012, axis: "x" });

  // ---------- textures ----------
  const chart = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 120">
      <rect width="160" height="120" fill="#e9d8a6"/>
      <rect x="4" y="4" width="152" height="112" fill="none" stroke="#6b4a2a" stroke-width="2"/>
      <circle cx="80" cy="64" r="46" fill="#1f2b4f"/>
      <circle cx="80" cy="64" r="46" fill="none" stroke="#c9a24a" stroke-width="2.2"/>
      <circle cx="80" cy="64" r="31" fill="none" stroke="#5d6f9a" stroke-width="1"/>
      <circle cx="80" cy="64" r="16" fill="none" stroke="#5d6f9a" stroke-width="1"/>
      <path d="M80 18V110M34 64H126M48 32L112 96M112 32L48 96" stroke="#5d6f9a" stroke-width="0.9"/>
      <polyline points="52,46 62,40 74,44 84,36 96,40" fill="none" stroke="#f2e3b0" stroke-width="1.2"/>
      <polyline points="92,70 102,62 110,72 100,84 92,70" fill="none" stroke="#f2e3b0" stroke-width="1.2"/>
      <polyline points="58,78 66,88 76,84 70,96" fill="none" stroke="#f2e3b0" stroke-width="1.2"/>
      <g fill="#fff4c8">
        <circle cx="52" cy="46" r="2.4"/><circle cx="62" cy="40" r="1.6"/><circle cx="74" cy="44" r="2"/>
        <circle cx="84" cy="36" r="2.6"/><circle cx="96" cy="40" r="1.6"/><circle cx="102" cy="62" r="2.4"/>
        <circle cx="110" cy="72" r="1.6"/><circle cx="100" cy="84" r="2"/><circle cx="92" cy="70" r="1.6"/>
        <circle cx="58" cy="78" r="1.8"/><circle cx="66" cy="88" r="2.4"/><circle cx="76" cy="84" r="1.4"/>
        <circle cx="70" cy="96" r="1.8"/><circle cx="80" cy="64" r="3"/><circle cx="44" cy="62" r="1.2"/>
        <circle cx="118" cy="52" r="1.2"/><circle cx="88" cy="100" r="1.2"/><circle cx="66" cy="26" r="1.2"/>
      </g>
      <text x="80" y="13" font-family="Georgia, serif" font-size="7" text-anchor="middle" fill="#3a2a14">CARTA COELESTIS</text>
      <text x="14" y="112" font-family="Georgia, serif" font-size="5" fill="#3a2a14">N</text>
      <text x="140" y="112" font-family="Georgia, serif" font-size="5" fill="#3a2a14">MDCCCXL</text>
    </svg>`,
    { size: 512 },
  );
  const rose = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="31" fill="#efe3c0"/>
      <circle cx="32" cy="32" r="27" fill="none" stroke="#3b2a0e" stroke-width="1.6"/>
      <polygon points="32,6 36,32 32,58 28,32" fill="#2b2b3a"/>
      <polygon points="6,32 32,28 58,32 32,36" fill="#6b5a3a"/>
      <polygon points="32,8 35,30 29,30" fill="#b3262c"/>
      <text x="32" y="17" font-family="Georgia, serif" font-size="7" text-anchor="middle" fill="#3b2a0e">N</text>
      <circle cx="32" cy="32" r="3" fill="#c99a3b"/>
    </svg>`,
    { size: 256 },
  );
  const rollEnd = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="16" fill="#e6d3a3"/>
      <circle cx="16" cy="16" r="12" fill="none" stroke="#9c8455" stroke-width="1.4"/>
      <circle cx="16.5" cy="16" r="8" fill="none" stroke="#9c8455" stroke-width="1.4"/>
      <circle cx="17" cy="16" r="4" fill="none" stroke="#9c8455" stroke-width="1.4"/>
      <circle cx="17" cy="16" r="1.4" fill="#5a4a2a"/>
    </svg>`,
    { size: 128 },
  );
  const maker = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 32">
      <text x="120" y="22" font-family="Georgia, serif" font-size="17" font-style="italic" text-anchor="middle" fill="#3b2a0e">T. Ashgrove &amp; Son - London</text>
    </svg>`,
    { size: 512 },
  );
  let ticks = "";
  for (let a = 0; a <= 180; a += 10) {
    const rad = (a * Math.PI) / 180;
    const r1 = a % 30 === 0 ? 36 : 32;
    ticks += `<line x1="${40 + Math.cos(rad) * 26}" y1="${40 + Math.sin(rad) * 26}" x2="${40 + Math.cos(rad) * r1}" y2="${40 + Math.sin(rad) * r1}"/>`;
  }
  const scale = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <g stroke="#3b2a0e" stroke-width="1.6">${ticks}</g>
    </svg>`,
    { size: 256 },
  );

  // ---------- geometry frame ----------
  const tilt = (25 * Math.PI) / 180;
  const P = new THREE.Vector3(0, 1.27, 0); // altitude pivot
  const D = new THREE.Vector3(0, Math.sin(tilt), Math.cos(tilt)); // along the tube
  const U = new THREE.Vector3(0, Math.cos(tilt), -Math.sin(tilt)); // tube's "up"
  const X = new THREE.Vector3(1, 0, 0);
  const A = (h: number, u = 0, x = 0) =>
    P.clone().addScaledVector(D, h).addScaledVector(U, u).addScaledVector(X, x);

  // ---------- skeleton ----------
  const base = b.joint("base", { at: [0, 0, 0] });
  const head = b.joint("head", { parent: base, at: [0, 1.1, 0], dir: [0, 1, 0] });
  const mount = b.joint("mount", { parent: head, at: [0, 1.17, 0], dir: [0, 1, 0] });
  const tube = b.joint("tube", { parent: mount, at: P, dir: D, role: "hinge" });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lt = (outline: OutlinePoint[], color: any, origin: THREE.Vector3 = P, segments = 16) =>
    b.lathe(outline, { at: origin, axis: D, segments, color, bone: tube });

  // ---------- main tube ----------
  lt([[0, -0.18], [0.05, -0.18], [0.05, 0.56], [0, 0.56]], BRASS);
  lt([[0, -0.215], [0.036, -0.215], [0.053, -0.19], [0.053, -0.17], [0, -0.17]], BRASS_DARK);
  lt([[0, 0.05], [0.0545, 0.05], [0.0545, 0.25], [0, 0.25]], leather(0.05, 0.25));
  lt([[0, 0.325], [0.0545, 0.325], [0.0545, 0.505], [0, 0.505]], leather(0.325, 0.505));
  for (const hc of [0.035, 0.265, 0.305, 0.522]) {
    lt(
      [[0, hc - 0.008], [0.054, hc - 0.008], [0.057, hc - 0.004], [0.057, hc + 0.004], [0.054, hc + 0.008], [0, hc + 0.008]],
      engrave(hc),
    );
  }
  // dew shield, lens and front rim
  const dew = lt([[0.05, 0.545], [0.063, 0.545], [0.063, 0.7], [0.057, 0.7], [0.057, 0.56], [0.05, 0.56]], BRASS);
  lt([[0, 0.56], [0.05, 0.56], [0.05, 0.57], [0.03, 0.577], [0, 0.58]], GLASS);
  lt([[0.044, 0.566], [0.057, 0.566], [0.057, 0.576], [0.044, 0.576]], BRASS_DARK);
  lt([[0.055, 0.688], [0.067, 0.688], [0.067, 0.705], [0.055, 0.705]], engrave(0.6965));
  b.part(new THREE.CircleGeometry(0.011, 8), GLINT, { at: A(0.58, 0.016, -0.012), dir: D, axis: "z", bone: tube });
  for (const s of [1, -1]) {
    b.decal(dew, maker, {
      at: A(0.625, 0, s * 0.063),
      dir: [s, 0, 0],
      up: U,
      size: [0.11, 0.016],
      mirror: s < 0,
    });
  }

  // drawtube with focus scale, eyepiece, rubber cup
  lt(
    [[0, -0.42], [0.031, -0.42], [0.031, -0.17], [0, -0.17]],
    paint((_p, n, s) => (n.dot(U) > 0.85 && ((s[0] + 10) / 0.01) % 1 < 0.25 ? BRASS_DARK : BRASS_LIGHT)),
  );
  lt(
    [[0, -0.48], [0.02, -0.48], [0.02, -0.44], [0.024, -0.437], [0.024, -0.425], [0.032, -0.42], [0.032, -0.41], [0, -0.41]],
    BRASS,
  );
  lt([[0, -0.48], [0.024, -0.48], [0.031, -0.555], [0.027, -0.56], [0.016, -0.5], [0, -0.5]], RUBBER);
  b.part(new THREE.CircleGeometry(0.013, 10), GLASS, {
    at: A(-0.5015),
    dir: D.clone().negate(),
    axis: "z",
    bone: tube,
  });

  // focus rack housing and knobs
  const Hc = A(-0.27, -0.044);
  b.part(new THREE.BoxGeometry(0.05, 0.026, 0.07), BRASS_DARK, { at: Hc, dir: D, axis: "z", up: U, bone: tube });
  b.rod(Hc.clone().addScaledVector(X, -0.056), Hc.clone().addScaledVector(X, 0.056), 0.005, { color: BRASS_DARK, bone: tube });
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.012, 10), BRASS, {
      at: Hc.clone().addScaledVector(X, s * 0.05),
      dir: [s, 0, 0],
      bone: tube,
      flat: true,
    });
    b.part(new THREE.CylinderGeometry(0.009, 0.011, 0.008, 8), BRASS_LIGHT, {
      at: Hc.clone().addScaledVector(X, s * 0.06),
      dir: [s, 0, 0],
      bone: tube,
      flat: true,
    });
  }

  // ---------- finder scope ----------
  const F0 = P.clone().addScaledVector(U, 0.095);
  lt([[0, -0.1], [0.016, -0.1], [0.016, 0.22], [0, 0.22]], BRASS, F0, 12);
  lt([[0, 0.02], [0.018, 0.02], [0.018, 0.15], [0, 0.15]], leather(0.02, 0.15), F0, 12);
  lt([[0, 0.21], [0.021, 0.21], [0.021, 0.27], [0.017, 0.27], [0.017, 0.225], [0, 0.225]], BRASS_LIGHT, F0, 12);
  lt([[0, 0.224], [0.017, 0.224], [0.017, 0.228], [0, 0.232]], GLASS, F0, 12);
  lt([[0, -0.15], [0.011, -0.15], [0.013, -0.12], [0.013, -0.1], [0, -0.1]], BRASS_DARK, F0, 12);
  lt([[0, -0.165], [0.012, -0.165], [0.015, -0.15], [0, -0.15]], RUBBER, F0, 12);
  for (const h of [-0.03, 0.17]) {
    const c = F0.clone().addScaledVector(D, h);
    b.part(new THREE.TorusGeometry(0.0205, 0.0045, 5, 14), BRASS_DARK, { at: c, dir: D, axis: "z", bone: tube });
    b.rod(A(h, 0.047), A(h, 0.075), 0.0055, { color: BRASS_DARK, bone: tube });
    b.part(new THREE.BoxGeometry(0.022, 0.006, 0.03), BRASS_DARK, { at: A(h, 0.05), dir: D, axis: "z", up: U, bone: tube });
    b.ring(frame(c, D), { count: 2, radius: 0.023, fromDeg: -65, toDeg: 65 }, (item) => {
      const tip = offset(item, item, 0.011);
      b.rod(item.at, tip, 0.0028, { color: BRASS_LIGHT, bone: tube });
      b.part(new THREE.SphereGeometry(0.0045, 6, 4), BRASS_LIGHT, { at: tip, bone: tube });
    });
  }

  // ---------- altitude mount ----------
  lt([[0, -0.025], [0.058, -0.025], [0.058, 0.025], [0, 0.025]], engrave(0), P, 16);
  for (const s of [1, -1]) {
    b.rod(A(0, 0, s * 0.055), A(0, 0, s * 0.075), 0.012, { color: BRASS_DARK, bone: tube });
    b.part(new THREE.BoxGeometry(0.012, 0.14, 0.075), BRASS, { at: [s * 0.078, 1.245, 0], bone: mount });
    b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.02, 12), BRASS_LIGHT, {
      at: [s * 0.09, P.y, 0],
      dir: [s, 0, 0],
      bone: mount,
    });
    b.part(new THREE.PlaneGeometry(0.075, 0.075), "#ffffff", {
      at: [s * 0.0845, P.y, 0],
      dir: [s, 0, 0],
      axis: "z",
      texture: scale,
      bone: mount,
    });
    // clamp lever with wooden handle
    const k0 = new THREE.Vector3(s * 0.1, P.y, 0);
    const k1 = new THREE.Vector3(s * 0.118, P.y, 0);
    const k2 = new THREE.Vector3(s * 0.118, P.y - 0.07, -0.035);
    b.rod(k0, k1, 0.008, { color: BRASS, bone: mount });
    b.rod(k1, k2, 0.005, { color: BRASS, bone: mount });
    b.capsule(k2, k2.clone().add(new THREE.Vector3(0, -0.03, -0.015)), 0.008, { color: MAHOGANY, bone: mount });
  }
  b.part(new THREE.BoxGeometry(0.18, 0.02, 0.09), BRASS_DARK, { at: [0, 1.175, 0], bone: mount });
  b.lathe([[0, 1.162], [0.075, 1.162], [0.075, 1.168], [0, 1.168]], { at: [0, 0, 0], segments: 16, color: BRASS_LIGHT, bone: mount });

  // ---------- tripod head ----------
  b.lathe([[0, 1.06], [0.09, 1.06], [0.1, 1.07], [0.1, 1.15], [0.09, 1.162], [0, 1.162]], {
    at: [0, 0, 0],
    segments: 12,
    color: headWood,
    bone: head,
  });
  for (const y of [1.075, 1.135]) {
    b.lathe([[0.097, y], [0.105, y], [0.105, y + 0.01], [0.097, y + 0.01]], {
      at: [0, 0, 0],
      segments: 12,
      color: BRASS,
      bone: head,
    });
  }
  b.lathe([[0, 1.02], [0.025, 1.03], [0.03, 1.06], [0, 1.06]], { at: [0, 0, 0], segments: 10, color: BRASS, bone: head });
  // plumb bob
  b.rod([0, 1.02, 0], [0, 0.77, 0], 0.0018, { color: CORD, sides: 4, bone: head });
  b.lathe([[0, 0.7], [0.012, 0.73], [0.016, 0.75], [0.009, 0.765], [0, 0.772]], {
    at: [0, 0, 0],
    segments: 8,
    color: BRASS_LIGHT,
    bone: head,
  });

  // ---------- legs ----------
  const legs = [
    { name: "legBack", deg: 180 },
    { name: "legR", deg: -60 },
    { name: "legL", deg: 60 },
  ];
  const trayY = 0.4;
  for (const L of legs) {
    const th = (L.deg * Math.PI) / 180;
    const r = new THREE.Vector3(Math.sin(th), 0, Math.cos(th));
    const tan = new THREE.Vector3(Math.cos(th), 0, -Math.sin(th));
    const T = r.clone().multiplyScalar(0.11).setY(1.1);
    const F = r.clone().multiplyScalar(0.58).setY(0);
    const dirL = F.clone().sub(T).normalize();
    const nrm = r.clone().addScaledVector(dirL, -r.dot(dirL)).normalize();
    const at = (t: number) => T.clone().lerp(F, t);
    const leg = b.joint(L.name, { parent: head, at: T, aim: F });
    const wood = grain(MAHOGANY, MAHOG_DARK, { size: 0.012, axis: dirL.toArray() });

    // hinge lug and bolt
    b.part(new THREE.BoxGeometry(0.03, 0.045, 0.055), BRASS, {
      at: r.clone().multiplyScalar(0.1).setY(1.105),
      dir: r,
      axis: "z",
      bone: head,
    });
    const bA = T.clone().addScaledVector(tan, -0.037);
    const bB = T.clone().addScaledVector(tan, 0.037);
    b.rod(bA, bB, 0.0065, { color: BRASS_DARK, bone: leg });
    b.part(new THREE.SphereGeometry(0.011, 8, 6), BRASS_LIGHT, { at: bA, bone: leg });
    b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.006, 6), BRASS_LIGHT, { at: bB, dir: tan, bone: leg, flat: true });

    // twin upper slats
    for (const k of [1, -1]) {
      b.frustumBox(
        at(-0.015).addScaledVector(tan, k * 0.022),
        at(0.56).addScaledVector(tan, k * 0.022),
        [0.016, 0.032],
        [0.016, 0.027],
        { color: wood, up: r, bone: leg },
      );
    }
    // brass band and sliding clamp
    b.part(new THREE.BoxGeometry(0.066, 0.014, 0.04), BRASS, { at: at(0.28), dir: dirL, up: nrm, bone: leg });
    b.part(new THREE.BoxGeometry(0.072, 0.06, 0.042), BRASS, { at: at(0.52), dir: dirL, up: nrm, bone: leg });
    const s0 = at(0.52).addScaledVector(nrm, 0.02);
    const s1 = at(0.52).addScaledVector(nrm, 0.045);
    b.rod(s0, s1, 0.005, { color: BRASS_DARK, bone: leg });
    b.part(new THREE.BoxGeometry(0.05, 0.016, 0.006), BRASS_LIGHT, { at: s1, dir: nrm, axis: "z", up: dirL, bone: leg });

    // lower slat, ferrule and spike foot
    b.frustumBox(at(0.4), at(0.935), [0.026, 0.024], [0.022, 0.02], { color: wood, up: r, bone: leg });
    b.rod(at(0.912), at(0.958), 0.017, { color: BRASS, sides: 8, bone: leg });
    b.spike(at(0.955), F, null, 0.012, { color: BRASS_DARK, bone: leg });

    // tray strut
    const tT = (1.1 - (trayY + 0.015)) / 1.1;
    const legPt = at(tT).addScaledVector(nrm, -0.012);
    const corner = r.clone().multiplyScalar(0.25).setY(trayY + 0.02);
    b.rod(legPt, corner, 0.0055, { color: BRASS, bone: base });
    b.part(new THREE.SphereGeometry(0.009, 8, 6), BRASS_LIGHT, { at: legPt, bone: base });
    b.part(new THREE.SphereGeometry(0.009, 8, 6), BRASS_LIGHT, { at: corner, bone: base });
  }

  // ---------- tray ----------
  b.lathe([[0, 0], [0.26, 0], [0.26, 0.03], [0.245, 0.03], [0.245, 0.008], [0, 0.008]], {
    at: [0, trayY, 0],
    segments: 3,
    color: trayWood,
    bone: base,
  });
  b.lathe([[0.242, 0.026], [0.268, 0.026], [0.268, 0.035], [0.242, 0.035]], {
    at: [0, trayY, 0],
    segments: 3,
    color: BRASS,
    bone: base,
  });
  const floorY = trayY + 0.008;

  // unrolled star chart
  b.part(new THREE.PlaneGeometry(0.16, 0.12), "#ffffff", {
    at: [0, floorY + 0.0015, -0.01],
    dir: [0, 1, 0],
    axis: "z",
    up: [0, 0, -1],
    texture: chart,
    bone: base,
  });
  // the roll it came from
  const roll1 = new THREE.Vector3(0, floorY + 0.02, 0.075);
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.24, 10), PAPER, { at: roll1, dir: [1, 0, 0], bone: base });
  for (const s of [1, -1]) {
    b.part(new THREE.CircleGeometry(0.0195, 10), "#ffffff", {
      at: roll1.clone().add(new THREE.Vector3(s * 0.1205, 0, 0)),
      dir: [s, 0, 0],
      axis: "z",
      texture: rollEnd,
      bone: base,
    });
  }
  b.part(new THREE.TorusGeometry(0.0205, 0.003, 4, 10), RIBBON, {
    at: roll1.clone().add(new THREE.Vector3(0.05, 0, 0)),
    dir: [1, 0, 0],
    axis: "z",
    bone: base,
  });
  b.part(new THREE.SphereGeometry(0.0055, 6, 4), RIBBON, {
    at: roll1.clone().add(new THREE.Vector3(0.05, 0.022, 0)),
    bone: base,
  });
  // a second, tied roll lying across
  const r2dir = new THREE.Vector3(1, 0, -0.35).normalize();
  const roll2 = new THREE.Vector3(-0.05, floorY + 0.014, 0.03);
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.16, 8), "#d9c48f", { at: roll2, dir: r2dir, bone: base });
  for (const s of [1, -1]) {
    b.part(new THREE.CircleGeometry(0.0137, 8), "#ffffff", {
      at: roll2.clone().addScaledVector(r2dir, s * 0.0805),
      dir: r2dir.clone().multiplyScalar(s),
      axis: "z",
      texture: rollEnd,
      bone: base,
    });
  }
  for (const k of [-0.04, 0.04]) {
    b.part(new THREE.TorusGeometry(0.0145, 0.0025, 4, 10), RIBBON, {
      at: roll2.clone().addScaledVector(r2dir, k),
      dir: r2dir,
      axis: "z",
      bone: base,
    });
  }
  // pencil
  const pA = new THREE.Vector3(-0.075, floorY + 0.0055, -0.055);
  const pB = new THREE.Vector3(0.045, floorY + 0.0055, -0.03);
  b.rod(pA, pB, 0.0042, { color: PENCIL, section: { ngon: 6 }, bone: base });
  const pDir = pB.clone().sub(pA).normalize();
  const pTip = pB.clone().addScaledVector(pDir, 0.016);
  b.spike(pB, pTip, null, 0.0042, { color: WOOD_TIP, bone: base });
  b.spike(pB.clone().addScaledVector(pDir, 0.011), pTip, null, 0.0014, { color: GRAPHITE, bone: base });
  b.rod(pA.clone().addScaledVector(pDir, -0.006), pA, 0.0044, { color: BRASS_LIGHT, bone: base });
  // pocket compass
  b.lathe([[0, 0], [0.035, 0], [0.035, 0.012], [0.03, 0.014], [0, 0.014]], {
    at: [0, floorY, -0.15],
    segments: 16,
    color: BRASS,
    bone: base,
  });
  b.part(new THREE.CircleGeometry(0.029, 16), "#ffffff", {
    at: [0, floorY + 0.0145, -0.15],
    dir: [0, 1, 0],
    axis: "z",
    up: [0, 0, -1],
    texture: rose,
    bone: base,
  });
  b.part(new THREE.TorusGeometry(0.006, 0.0018, 4, 8), BRASS_LIGHT, {
    at: [0, floorY + 0.007, -0.188],
    dir: [0, 0, 1],
    axis: "z",
    bone: base,
  });

  return b.root;
}
