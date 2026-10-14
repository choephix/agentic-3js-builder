import * as THREE from "three";
import { createBuilder, paint, mix, smoothstep, noise, grain, mottle, svg, rng } from "../../../../src/index";

export const meta = {
  name: "Brass Explorer's Telescope",
  description:
    "A polished brass refracting telescope with tooled leather sleeves, engraved bands, a finder scope, rubber eyecup and focusing knobs, on a mahogany surveyor's tripod with brass fittings and a tray holding a rolled star chart, a spread chart and a pocket compass.",
};

const D = Math.PI / 180;
const BRASS = "#c9a046";
const KNURL = "#9c742a";
const RUBBER = "#1d1b19";
const GLASS = "#0f1a2b";
const RIBBON = "#7d1717";

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

export default function build() {
  const b = createBuilder({ name: "telescope", paintSize: 2048 });

  // Polished brass: a touch metallic and glossier than the default matte.
  const brassMat = b.material(BRASS);
  brassMat.metalness = 0.6;
  brassMat.roughness = 0.3;
  const knurlMat = b.material(KNURL);
  knurlMat.metalness = 0.55;
  knurlMat.roughness = 0.4;
  const rubberMat = b.material(RUBBER);
  rubberMat.roughness = 0.95;

  // ---------------------------------------------------------------- skeleton
  const tiltDeg = 20;
  const d = V(0, Math.sin(tiltDeg * D), Math.cos(tiltDeg * D)); // tube axis (toward objective)
  const u = V(0, Math.cos(tiltDeg * D), -Math.sin(tiltDeg * D)); // "top" of the tube
  const X = V(1, 0, 0);
  const P = V(0, 1.3, 0); // altitude pivot
  b.joint("base", { at: [0, 0, 0] });
  b.joint("pan", { at: [0, 1.09, 0], parent: "base", dir: [0, 1, 0] });
  b.joint("tilt", { at: P, parent: "pan", dir: d, role: "hinge" });

  const B = P.clone().addScaledVector(d, -0.52); // eyepiece end of the main tube
  const at = (h: number) => B.clone().addScaledVector(d, h);
  const finderAt = (h: number) => at(h).addScaledVector(u, 0.085);

  // ---------------------------------------------------------------- paints
  const engraved = paint((p, n, s) => {
    const h = s[0];
    const deg = s[1];
    const w = 0.02;
    const base = mix("#b0832c", "#efd583", smoothstep(-0.3, 0.9, n.y));
    const dark = "#3e2b0e";
    if (Math.abs(h - 0.0042) < 0.0007 || Math.abs(h - (w - 0.0042)) < 0.0007) return mix(base, dark, 0.85);
    const z = Math.abs(((deg / 9) % 2) - 1);
    const target = 0.0068 + z * (w - 0.0136);
    if (Math.abs(h - target) < 0.0007) return mix(base, dark, 0.8);
    const cell = Math.floor(deg / 9);
    const dotH = cell % 2 === 0 ? w - 0.0068 : 0.0068;
    const dotDeg = (cell + 0.5) * 9;
    if (Math.hypot(h - dotH, (deg - dotDeg) * 0.00085) < 0.0011) return mix(base, dark, 0.7);
    return base;
  });

  const leather = (len: number) =>
    paint((p, n, s) => {
      const h = s[0];
      const deg = s[1];
      const base = mix("#3a2012", "#64391e", noise(p, 0.015, 3));
      if (h < 0.008 || h > len - 0.008) {
        const row = Math.abs(h - 0.0045) < 0.0012 || Math.abs(h - (len - 0.0045)) < 0.0012;
        if (row && (deg / 4) % 2 < 1.1) return "#dcc58f";
        return mix(base, "#24130a", 0.35);
      }
      const a = h * 150 + deg / 7;
      const c = h * 150 - deg / 7;
      const fa = a - Math.floor(a);
      const fc = c - Math.floor(c);
      if (fa < 0.07 || fc < 0.07) return mix(base, "#1a0d06", 0.6);
      return mix(base, "#7a4a2a", 0.25 * smoothstep(0.3, 1, n.y));
    });

  const wood = (axis: THREE.Vector3) => grain("#4a180e", "#7d3624", { size: 0.0035, axis: [axis.x, axis.y, axis.z] });
  const parchment = mottle("#ecdcb3", "#d2bb88", { size: 0.02, seed: 4 });

  // ---------------------------------------------------------------- textures
  const lensTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <defs><radialGradient id="g" cx="45%" cy="40%" r="60%">
        <stop offset="0" stop-color="#3a5f8a"/><stop offset="0.6" stop-color="#14243d"/><stop offset="1" stop-color="#05080f"/>
      </radialGradient></defs>
      <circle cx="50" cy="50" r="50" fill="url(#g)"/>
      <circle cx="50" cy="50" r="47" fill="none" stroke="#7a5a1e" stroke-width="3"/>
      <path d="M28 34 A28 28 0 0 1 52 22" stroke="#e8f2ff" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.85"/>
      <circle cx="64" cy="70" r="4" fill="#bcd6f5" opacity="0.6"/>
    </svg>`,
    { size: 128 },
  );

  const inscription = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 70">
      <line x1="10" y1="8" x2="490" y2="8" stroke="#3e2b0e" stroke-width="3"/>
      <line x1="10" y1="62" x2="490" y2="62" stroke="#3e2b0e" stroke-width="3"/>
      <text x="250" y="47" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="34"
        font-style="italic" fill="#3e2b0e" letter-spacing="2">T. Ashworth &amp; Sons · London</text>
    </svg>`,
    { size: 512 },
  );

  const R = rng(7);
  let stars = "";
  for (let i = 0; i < 80; i++) {
    const x = 22 + R() * 276;
    const y = 22 + R() * 236;
    const r = 0.6 + R() * R() * 2.4;
    stars += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="#f6e7b0"/>`;
  }
  const constellation = (pts: number[][]) =>
    `<polyline points="${pts.map((p) => p.join(",")).join(" ")}" fill="none" stroke="#d9b45a" stroke-width="1.2"/>` +
    pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#fff4c8"/>`).join("");
  const chartTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 280">
      <rect width="320" height="280" fill="#e9dcb6"/>
      <rect x="9" y="9" width="302" height="262" fill="#172850" stroke="#c9a046" stroke-width="3"/>
      <circle cx="160" cy="140" r="118" fill="none" stroke="#c9a046" stroke-width="1.6"/>
      <circle cx="160" cy="140" r="80" fill="none" stroke="#c9a046" stroke-width="0.8" stroke-dasharray="4 4"/>
      <circle cx="160" cy="140" r="40" fill="none" stroke="#c9a046" stroke-width="0.8" stroke-dasharray="4 4"/>
      <line x1="42" y1="140" x2="278" y2="140" stroke="#c9a046" stroke-width="0.8"/>
      <line x1="160" y1="22" x2="160" y2="258" stroke="#c9a046" stroke-width="0.8"/>
      <line x1="77" y1="57" x2="243" y2="223" stroke="#c9a046" stroke-width="0.5"/>
      <line x1="243" y1="57" x2="77" y2="223" stroke="#c9a046" stroke-width="0.5"/>
      ${stars}
      ${constellation([[70, 80], [95, 70], [118, 78], [140, 72], [150, 95], [128, 105], [118, 78]])}
      ${constellation([[200, 170], [215, 150], [232, 165], [248, 148], [262, 168]])}
      ${constellation([[110, 190], [125, 205], [150, 200], [165, 222], [140, 235]])}
      ${constellation([[205, 60], [222, 82], [214, 106], [236, 118]])}
      <text x="160" y="270" text-anchor="middle" font-family="Georgia, serif" font-size="9" fill="#5a3e12">CAELUM BOREALE</text>
    </svg>`,
    { size: 512 },
  );

  let spiral = "";
  for (let i = 0; i <= 120; i++) {
    const th = (i / 120) * Math.PI * 7;
    const r = 3 + th * 2;
    spiral += `${i ? "L" : "M"}${(50 + r * Math.cos(th)).toFixed(1)} ${(50 + r * Math.sin(th)).toFixed(1)} `;
  }
  const rollEndTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="50" fill="#e4d2a3"/>
      <path d="${spiral}" fill="none" stroke="#8a6a3a" stroke-width="1.6"/>
      <circle cx="50" cy="50" r="3" fill="#3a2a14"/>
    </svg>`,
    { size: 128 },
  );

  const compassTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="50" fill="#f1e6c8"/>
      <circle cx="50" cy="50" r="44" fill="none" stroke="#3a2a14" stroke-width="1.5"/>
      <circle cx="50" cy="50" r="38" fill="none" stroke="#3a2a14" stroke-width="0.6"/>
      ${Array.from({ length: 36 }, (_, i) => {
        const a = (i * 10 * Math.PI) / 180;
        const r0 = i % 9 === 0 ? 36 : 40;
        return `<line x1="${(50 + r0 * Math.sin(a)).toFixed(1)}" y1="${(50 - r0 * Math.cos(a)).toFixed(1)}" x2="${(50 + 44 * Math.sin(a)).toFixed(1)}" y2="${(50 - 44 * Math.cos(a)).toFixed(1)}" stroke="#3a2a14" stroke-width="0.8"/>`;
      }).join("")}
      <polygon points="50,14 56,50 50,86 44,50" fill="#2a2a2a"/>
      <polygon points="50,14 56,50 44,50" fill="#b02020"/>
      <text x="50" y="30" text-anchor="middle" font-family="Georgia, serif" font-size="10" fill="#3a2a14">N</text>
      <circle cx="50" cy="50" r="3.5" fill="#c9a046" stroke="#3a2a14" stroke-width="0.6"/>
    </svg>`,
    { size: 256 },
  );

  // ---------------------------------------------------------------- helpers
  type Pt = [number, number];
  const lathe = (pts: Pt[], where: THREE.Vector3, axis: THREE.Vector3, color: any, bone: string, segments = 32) =>
    b.lathe(pts, { at: where, axis, color, segments, bone });
  const knob = (where: THREE.Vector3, axis: THREE.Vector3, r: number, bone: string, color = KNURL) =>
    lathe(
      [[0, 0], [r * 0.6, 0], [r, r * 0.25], [r, r * 0.8], [r * 0.75, r * 1.05], [0, r * 1.05]],
      where,
      axis,
      color,
      bone,
      10,
    );
  const band = (h: number, rIn: number, rOut: number) =>
    lathe(
      [[rIn, 0], [rOut - 0.002, 0], [rOut, 0.003], [rOut, 0.017], [rOut - 0.002, 0.02], [rIn, 0.02]],
      at(h),
      d,
      engraved,
      "tilt",
    );

  // ---------------------------------------------------------------- main tube
  const mainTube = lathe(
    [
      [0, 0], [0.021, 0], [0.021, 0.17], [0.03, 0.17], [0.03, 0.2], [0.028, 0.2], [0.028, 0.36],
      [0.04, 0.36], [0.04, 0.39], [0.044, 0.39], [0.044, 0.98], [0.054, 0.98], [0.056, 1.0],
      [0.056, 1.12], [0.05, 1.12], [0.05, 1.09], [0, 1.09],
    ],
    B,
    d,
    BRASS,
    "tilt",
    32,
  );
  // little draw-tube lip rings
  for (const h of [0.165, 0.355]) lathe([[0.02, 0], [0.033, 0], [0.033, 0.006], [0.02, 0.006]].map(([r, y]) => [h < 0.2 ? r : r + 0.008, y] as Pt), at(h), d, BRASS, "tilt", 24);

  // leather sleeves
  const sleeve = (h0: number, len: number) =>
    lathe(
      [[0.043, 0], [0.047, 0], [0.0485, 0.003], [0.0485, len - 0.003], [0.047, len], [0.043, len]],
      at(h0),
      d,
      leather(len),
      "tilt",
    );
  sleeve(0.58, 0.2);
  sleeve(0.84, 0.1);
  // engraved bands
  band(0.56, 0.043, 0.052);
  band(0.78, 0.043, 0.052);
  band(0.82, 0.043, 0.052);
  band(0.94, 0.043, 0.052);
  band(1.03, 0.054, 0.0595);

  // objective glass
  b.part(new THREE.CircleGeometry(0.05, 24), "#ffffff", { at: at(1.0915), dir: d, axis: "z", texture: lensTex, bone: "tilt" });

  // maker's inscription on top of the tube
  b.decal(mainTube, inscription, {
    at: at(0.45).addScaledVector(u, 0.044),
    dir: u,
    up: [1, 0, 0],
    size: [0.1, 0.014],
    bone: "tilt",
  });

  // ---------------------------------------------------------------- eyepiece
  const back = d.clone().negate();
  lathe(
    [[0, 0], [0.017, 0], [0.017, 0.04], [0.02, 0.045], [0.02, 0.055], [0.016, 0.055], [0.016, 0.062], [0, 0.062]],
    B,
    back,
    BRASS,
    "tilt",
    24,
  );
  const cupAt = B.clone().addScaledVector(back, 0.06);
  lathe(
    [[0, 0], [0.018, 0], [0.024, 0.02], [0.03, 0.045], [0.028, 0.05], [0.02, 0.03], [0.012, 0.03], [0, 0.03]],
    cupAt,
    back,
    RUBBER,
    "tilt",
    24,
  );
  b.part(new THREE.CircleGeometry(0.012, 16), "#ffffff", {
    at: B.clone().addScaledVector(back, 0.0905),
    dir: back,
    axis: "z",
    texture: lensTex,
    bone: "tilt",
  });

  // ---------------------------------------------------------------- focuser
  const focusC = at(0.435).addScaledVector(u, -0.052);
  b.part(new THREE.BoxGeometry(0.04, 0.02, 0.07), BRASS, {
    at: focusC,
    dir: d,
    up: u,
    axis: "z",
    bone: "tilt",
  });
  const shaftC = at(0.435).addScaledVector(u, -0.056);
  b.rod(shaftC.clone().addScaledVector(X, -0.056), shaftC.clone().addScaledVector(X, 0.056), 0.005, { color: BRASS, bone: "tilt" });
  knob(shaftC.clone().addScaledVector(X, 0.052), X, 0.019, "tilt");
  knob(shaftC.clone().addScaledVector(X, -0.052), X.clone().negate(), 0.019, "tilt");
  // rack strip
  b.rod(at(0.2).addScaledVector(u, -0.029), at(0.36).addScaledVector(u, -0.029), 0.004, { color: KNURL, bone: "tilt" });

  // ---------------------------------------------------------------- finder scope
  lathe(
    [
      [0, 0], [0.009, 0], [0.009, 0.04], [0.013, 0.04], [0.013, 0.05], [0.012, 0.05], [0.012, 0.26],
      [0.016, 0.27], [0.016, 0.32], [0.014, 0.32], [0.014, 0.31], [0, 0.31],
    ],
    finderAt(0.6),
    d,
    BRASS,
    "tilt",
    20,
  );
  b.part(new THREE.CircleGeometry(0.014, 16), "#ffffff", {
    at: finderAt(0.6 + 0.3115),
    dir: d,
    axis: "z",
    texture: lensTex,
    bone: "tilt",
  });
  lathe([[0, 0], [0.01, 0], [0.014, 0.018], [0.012, 0.02], [0.007, 0.012], [0, 0.012]], finderAt(0.6), back, RUBBER, "tilt", 16);
  for (const h of [0.67, 0.86]) {
    b.part(new THREE.TorusGeometry(0.0172, 0.0032, 6, 18), BRASS, { at: finderAt(h), dir: d, axis: "z", bone: "tilt" });
    b.rod(at(h).addScaledVector(u, 0.045), finderAt(h).addScaledVector(u, -0.016), [0.006, 0.004], { color: BRASS, bone: "tilt" });
    b.rod(at(h).addScaledVector(u, 0.046), at(h).addScaledVector(u, 0.052), 0.011, { color: BRASS, bone: "tilt" });
    // collimation screws
    for (const s of [-1, 1]) {
      const c = finderAt(h).addScaledVector(X, s * 0.019);
      b.rod(c, c.clone().addScaledVector(X, s * 0.008), 0.0025, { color: KNURL, bone: "tilt" });
    }
  }

  // ---------------------------------------------------------------- cradle & fork
  b.part(new THREE.TorusGeometry(0.05, 0.008, 8, 28), BRASS, { at: P, dir: d, axis: "z", bone: "tilt" });
  b.part(new THREE.TorusGeometry(0.05, 0.006, 8, 28), BRASS, { at: at(0.545), dir: d, axis: "z", bone: "tilt" });
  // cradle clamp screw on top
  b.rod(P.clone().addScaledVector(u, 0.056), P.clone().addScaledVector(u, 0.07), 0.004, { color: BRASS, bone: "tilt" });
  knob(P.clone().addScaledVector(u, 0.068), u, 0.011, "tilt");
  for (const s of [-1, 1]) {
    const side = X.clone().multiplyScalar(s);
    b.rod(P.clone().addScaledVector(side, 0.045), P.clone().addScaledVector(side, 0.092), 0.008, { color: BRASS, bone: "tilt" });
    knob(P.clone().addScaledVector(side, 0.09), side, 0.017, "tilt");
    b.frustumBox(V(s * 0.075, 1.16, 0), V(s * 0.075, 1.31, 0), [0.014, 0.042], [0.012, 0.03], { color: BRASS, bone: "pan" });
  }
  b.frustumBox(V(-0.09, 1.155, 0), V(0.09, 1.155, 0), [0.05, 0.016], [0.05, 0.016], { color: BRASS, bone: "pan" });
  lathe(
    [[0, 0], [0.032, 0], [0.032, 0.008], [0.022, 0.016], [0.022, 0.05], [0.03, 0.054], [0.03, 0.058], [0, 0.058]],
    V(0, 1.09, 0),
    V(0, 1, 0),
    BRASS,
    "pan",
    24,
  );
  b.rod(V(0.02, 1.12, 0), V(0.045, 1.12, 0), 0.004, { color: BRASS, bone: "pan" });
  knob(V(0.043, 1.12, 0), X, 0.012, "pan");

  // ---------------------------------------------------------------- tripod head
  lathe([[0, 0], [0.1, 0], [0.102, 0.004], [0.102, 0.036], [0.1, 0.04], [0, 0.04]], V(0, 1.05, 0), V(0, 1, 0), wood(V(1, 0, 0)), "base", 28);
  lathe([[0.09, 0], [0.104, 0], [0.104, 0.008], [0.09, 0.008]], V(0, 1.072, 0), V(0, 1, 0), BRASS, "base", 28);
  lathe([[0, 0], [0.096, 0], [0.096, 0.006], [0, 0.006]], V(0, 1.044, 0), V(0, 1, 0), BRASS, "base", 28);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3;
    b.part(new THREE.CylinderGeometry(0.006, 0.006, 0.006, 8), BRASS, {
      at: [Math.sin(a) * 0.075, 1.092, Math.cos(a) * 0.075],
      bone: "base",
    });
  }

  // ---------------------------------------------------------------- legs
  const legs: Array<[string, number]> = [["legBack", 180], ["legL", 60], ["legR", -60]];
  const legPoint: Array<(f: number) => THREE.Vector3> = [];
  const radials: THREE.Vector3[] = [];
  for (const [name, az] of legs) {
    const a = az * D;
    const r = V(Math.sin(a), 0, Math.cos(a));
    const t = V(Math.cos(a), 0, -Math.sin(a));
    const top = r.clone().multiplyScalar(0.085).setY(1.05);
    const foot = r.clone().multiplyScalar(0.62);
    const L = foot.clone().sub(top).normalize();
    const Lp = (f: number) => top.clone().lerp(foot, f);
    legPoint.push(Lp);
    radials.push(r);
    b.joint(name, { at: top, parent: "base", dir: L, role: "leg" });
    const w = wood(L);

    // hinge knuckle
    b.rod(top.clone().addScaledVector(t, -0.042).setY(1.044), top.clone().addScaledVector(t, 0.042).setY(1.044), 0.012, { color: BRASS, bone: name });
    for (const s of [-1, 1]) b.part(new THREE.SphereGeometry(0.009, 8, 6), KNURL, { at: top.clone().addScaledVector(t, s * 0.046).setY(1.044), bone: name });

    // twin upper slats
    for (const s of [-1, 1])
      b.frustumBox(
        Lp(0.0).addScaledVector(t, s * 0.026),
        Lp(0.5).addScaledVector(t, s * 0.011),
        [0.018, 0.03],
        [0.016, 0.026],
        { color: w, up: r, bone: name },
      );
    // lower leg
    b.frustumBox(Lp(0.47), Lp(0.93), [0.036, 0.028], [0.028, 0.024], { color: w, up: r, bone: name });
    // brass clamp with thumbscrew
    b.frustumBox(Lp(0.47), Lp(0.53), [0.054, 0.038], [0.05, 0.036], { color: BRASS, up: r, bone: name });
    const screw = Lp(0.5).addScaledVector(r, 0.018);
    b.rod(screw, screw.clone().addScaledVector(r, 0.012), 0.004, { color: BRASS, bone: name });
    knob(screw.clone().addScaledVector(r, 0.01), r, 0.012, name);
    // tray collar
    b.frustumBox(Lp(0.6), Lp(0.64), [0.042, 0.032], [0.041, 0.031], { color: BRASS, up: r, bone: name });
    // ferrule and spike
    b.rod(Lp(0.88), Lp(0.95), [0.02, 0.016], { color: BRASS, bone: name });
    b.spike(Lp(0.95), foot, null, 0.011, { color: "#7d5a22", bone: name });
  }

  // ---------------------------------------------------------------- tray
  const trayY = 0.4;
  const trayTop = trayY + 0.009;
  const corners = radials.map((r) => r.clone().multiplyScalar(0.3));
  const outline: Pt[] = [];
  corners.forEach((c, i) => {
    const prev = corners[(i + corners.length - 1) % corners.length];
    const next = corners[(i + 1) % corners.length];
    const p1 = c.clone().addScaledVector(prev.clone().sub(c).normalize(), 0.035);
    const p2 = c.clone().addScaledVector(next.clone().sub(c).normalize(), 0.035);
    outline.push([p1.x, -p1.z], [p2.x, -p2.z]);
  });
  b.extrude(outline, {
    at: [0, trayY, 0],
    x: [1, 0, 0],
    y: [0, 0, -1],
    thickness: 0.018,
    bevel: 0.003,
    smoothing: 2,
    color: wood(V(0, 0, 1)),
    bone: "base",
  });
  // stays to the legs
  radials.forEach((r, i) => {
    const from = r.clone().multiplyScalar(0.25).setY(trayY);
    const to = legPoint[i](0.62).addScaledVector(r, -0.012);
    b.rod(from, to, 0.006, { color: BRASS, bone: "base" });
    b.part(new THREE.SphereGeometry(0.009, 8, 6), BRASS, { at: from, bone: "base" });
  });
  // brass gallery rail
  const railY = trayTop + 0.019;
  const railC = radials.map((r) => r.clone().multiplyScalar(0.24));
  railC.forEach((c, i) => {
    const n = railC[(i + 1) % railC.length];
    const m = c.clone().lerp(n, 0.5);
    for (const q of [c, m]) b.rod(q.clone().setY(trayTop - 0.002), q.clone().setY(railY), 0.003, { color: BRASS, bone: "base" });
    b.rod(c.clone().setY(railY), n.clone().setY(railY), 0.0026, { color: BRASS, bone: "base" });
    b.part(new THREE.SphereGeometry(0.0055, 8, 6), BRASS, { at: c.clone().setY(railY), bone: "base" });
  });

  // spread star chart
  b.part(new THREE.PlaneGeometry(0.13, 0.12), "#ffffff", {
    at: [0, trayTop + 0.0006, -0.05],
    rotation: [-90, 0, 0],
    texture: chartTex,
    bone: "base",
  });
  // rolled chart with ribbon
  const rollY = trayTop + 0.022;
  const rollZ = 0.02;
  b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.24, 18, 1, true), parchment, {
    at: [0, rollY, rollZ],
    rotation: [0, 0, 90],
    bone: "base",
  });
  for (const s of [-1, 1])
    b.part(new THREE.CircleGeometry(0.022, 18), "#ffffff", {
      at: [s * 0.1201, rollY, rollZ],
      rotation: [0, s * 90, 0],
      texture: rollEndTex,
      bone: "base",
    });
  b.part(new THREE.TorusGeometry(0.0228, 0.0034, 6, 20), RIBBON, { at: [0.045, rollY, rollZ], rotation: [0, 90, 0], bone: "base" });
  b.part(new THREE.SphereGeometry(0.0065, 8, 6), RIBBON, { at: [0.045, rollY + 0.024, rollZ], bone: "base" });
  for (const s of [-1, 1])
    b.part(new THREE.BoxGeometry(0.008, 0.002, 0.034), RIBBON, {
      at: [0.045 + s * 0.008, trayTop + 0.001, rollZ + 0.038],
      rotation: [0, s * 18, 0],
      bone: "base",
    });

  // pocket compass
  const comp = V(-0.11, trayTop, 0.075);
  lathe(
    [[0, 0], [0.026, 0], [0.028, 0.003], [0.028, 0.012], [0.025, 0.012], [0.025, 0.008], [0, 0.008]],
    comp,
    V(0, 1, 0),
    BRASS,
    "base",
    24,
  );
  b.part(new THREE.CircleGeometry(0.025, 24), "#ffffff", {
    at: comp.clone().setY(trayTop + 0.0085),
    rotation: [-90, 0, 0],
    texture: compassTex,
    bone: "base",
  });
  b.part(new THREE.TorusGeometry(0.006, 0.0016, 6, 12), BRASS, {
    at: comp.clone().add(V(0, 0.008, -0.032)),
    rotation: [0, 90, 0],
    bone: "base",
  });

  return b.root;
}
