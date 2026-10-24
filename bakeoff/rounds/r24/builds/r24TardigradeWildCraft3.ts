// STYLE: "Delftware Water Bear" — the tardigrade as a hand-painted Dutch Delft porcelain figurine.
// Everything is cream-white glaze with cobalt-blue painting: pooled cobalt rosettes in staggered rows on the
// segments, raised cobalt slip ridges between segments, a windmill-landscape medallion on each flank, scroll
// cartouches, a tulip on the crown, pearl studs, and gold-lustre claws, cuffs and teeth as the only accent colour.
// Scale note: a real tardigrade is ~0.5 mm; this one is a ~0.65 m display piece.
import * as THREE from "three";
import {
  createBuilder,
  frame,
  polyline,
  bezier,
  limb,
  lerp,
  paint,
  mix,
  smoothstep,
  noise,
  cells,
  countershade,
  spots,
  stripes,
  svg,
  DEG,
} from "../../../../src/index";

export const meta = {
  name: "Delft Water Bear",
  description:
    "A tardigrade as a Delftware porcelain figurine: cream glaze, cobalt rosettes, windmill medallions, gold-lustre claws.",
};

// ---------- palette ----------
const WHITE = "#f6f7f2";
const SHADE = "#cbd9ea";
const BLUE = "#2147a8";
const DEEP = "#122a74";
const LBLUE = "#7fa2e0";
const PALE = "#dfe8f6";
const GOLD = "#d6a43a";
const LIP = "#fbfbf7";

// ---------- layout constants ----------
const BY = 0.155; // body axis height
const SEG = 0.055; // segment length
const Z0 = -0.205; // first segment boundary
const R = 0.105; // body radius used for arc lengths in the paint
const FY = 0.04; // foot height
const HC: [number, number, number] = [0, BY, 0.235]; // head centre

// ---------- paints ----------
const BODY = paint((p, n) => {
  let c = mix(SHADE, WHITE, smoothstep(-0.9, 0.3, n.y));
  const q = (p.z - Z0) / SEG;
  const k = Math.floor(q);
  const f = q - k;
  const edge = Math.min(f, 1 - f);
  if (edge < 0.12) c = mix(c, SHADE, 0.5 * (1 - edge / 0.12));
  const cr = cells(p, 0.06, 4);
  if (cr.d2 - cr.d1 < 0.025) c = mix(c, "#b7c4d6", 0.35);
  if (n.y < -0.75) return c;
  const zc = Z0 + (k + 0.5) * SEG;
  const off = k & 1 ? 30 * DEG : 0;
  const phi = Math.atan2(p.x, p.y - BY);
  const D = Math.PI / 3;
  const cc = Math.round((phi - off) / D) * D + off;
  const dx = (phi - cc) * R;
  const dz = p.z - zc;
  const r = Math.hypot(dx, dz);
  const a = Math.atan2(dx, dz);
  const pr = 0.021 * (0.62 + 0.38 * Math.cos(5 * a));
  const pooled = mix(BLUE, DEEP, noise(p, 0.03, 3) * 0.7);
  if (r < 0.0035) return DEEP;
  if (r < 0.0075) return WHITE;
  if (r < 0.0095) return DEEP;
  if (r < pr - 0.003) return pooled;
  if (r < pr) return DEEP;
  const dm = Math.abs(Math.abs(phi - cc) - D / 2) * R;
  const dd = Math.hypot(dm, dz);
  if (dd < 0.0028) return DEEP;
  if (dd < 0.0055) return LBLUE;
  return c;
});

const HEAD = countershade(spots(WHITE, BLUE, { size: 0.04, amount: 0.3, seed: 2 }), SHADE, { level: -0.1 });
const LEGP = countershade(stripes(WHITE, BLUE, { size: 0.03, axis: "y", width: 0.4, wobble: 0.15 }), SHADE, {
  level: -0.2,
});

// ---------- textures ----------
const EYE = svg(
  `<svg viewBox="0 0 100 100">
  <circle cx="50" cy="52" r="44" fill="${DEEP}"/>
  <circle cx="50" cy="52" r="38" fill="${WHITE}"/>
  <circle cx="52" cy="55" r="28" fill="${LBLUE}"/>
  <circle cx="52" cy="55" r="28" fill="none" stroke="${BLUE}" stroke-width="4"/>
  <circle cx="52" cy="55" r="16" fill="${DEEP}"/>
  <circle cx="43" cy="44" r="8" fill="#fff"/>
  <circle cx="61" cy="65" r="4" fill="#fff"/>
  <path d="M22 18 L12 4 M36 11 L32 -1 M50 8 L50 0" stroke="${DEEP}" stroke-width="5" stroke-linecap="round" fill="none"/>
</svg>`,
  { size: 256 },
);

const sails = [0, 90, 180, 270]
  .map(
    (a) =>
      `<g transform="rotate(${a + 18} 60 48)"><line x1="60" y1="48" x2="60" y2="8" stroke="${DEEP}" stroke-width="2.6"/><rect x="60" y="9" width="10" height="22" fill="${WHITE}" stroke="${DEEP}" stroke-width="1.6"/><path d="M60 15H70M60 21H70M60 27H70M65 9V31" stroke="${BLUE}" stroke-width="1"/></g>`,
  )
  .join("");
const MEDALLION = svg(
  `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
  <defs><clipPath id="c"><circle cx="60" cy="60" r="48"/></clipPath></defs>
  <circle cx="60" cy="60" r="58" fill="${WHITE}" stroke="${DEEP}" stroke-width="3"/>
  <circle cx="60" cy="60" r="53" fill="none" stroke="${BLUE}" stroke-width="2.4" stroke-dasharray="1 4.6" stroke-linecap="round"/>
  <circle cx="60" cy="60" r="48" fill="#eef3fb"/>
  <g clip-path="url(#c)">
    <path d="M14 30 q6-9 14-3 q8-6 12 3z M78 24 q6-8 14-2 q7-5 12 4z" fill="#cfdcf2" stroke="${LBLUE}" stroke-width="1"/>
    <path d="M0 98 Q30 86 60 96 T120 92 V120H0Z" fill="${BLUE}"/>
    <path d="M0 106 Q30 98 60 106 T120 102" stroke="${LBLUE}" stroke-width="1.5" fill="none"/>
    <path d="M47 98 L52 53 H68 L73 98Z" fill="#9db8ea" stroke="${DEEP}" stroke-width="2"/>
    <path d="M49 53 L60 40 L71 53Z" fill="${BLUE}" stroke="${DEEP}" stroke-width="2"/>
    <path d="M56 98 V84 a4 4 0 0 1 8 0 V98Z" fill="${DEEP}"/>
    ${sails}
    <circle cx="60" cy="48" r="3.2" fill="${DEEP}"/>
    <path d="M22 50 q3-3 6 0 q3-3 6 0 M94 40 q3-3 5 0 q3-3 5 0" stroke="${DEEP}" stroke-width="1.6" fill="none"/>
  </g>
  <circle cx="60" cy="60" r="48" fill="none" stroke="${DEEP}" stroke-width="2.5"/>
</svg>`,
  { size: 384 },
);

const TULIP = svg(
  `<svg viewBox="0 0 60 100" xmlns="http://www.w3.org/2000/svg">
  <path d="M30 98 V52" stroke="${BLUE}" stroke-width="4.5" stroke-linecap="round"/>
  <path d="M30 92 Q6 82 8 56 Q26 64 30 88Z" fill="${LBLUE}" stroke="${DEEP}" stroke-width="2"/>
  <path d="M30 86 Q54 78 52 58 Q34 66 30 84Z" fill="${LBLUE}" stroke="${DEEP}" stroke-width="2"/>
  <path d="M30 6 Q10 14 11 38 Q13 56 30 58 Q47 56 49 38 Q50 14 30 6Z" fill="${BLUE}" stroke="${DEEP}" stroke-width="2.6"/>
  <path d="M11 38 Q13 18 23 12 L22 34Z M49 38 Q47 18 37 12 L38 34Z" fill="${DEEP}" opacity="0.55"/>
  <path d="M30 6 Q21 30 30 58 M30 6 Q39 30 30 58" stroke="${LBLUE}" stroke-width="2" fill="none"/>
  <circle cx="24" cy="30" r="2.6" fill="#fff"/>
</svg>`,
  { size: 192 },
);

const SCROLL = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="47" fill="${WHITE}" stroke="${DEEP}" stroke-width="3.5"/>
  <circle cx="50" cy="50" r="41" fill="none" stroke="${LBLUE}" stroke-width="2.4"/>
  <path d="M22 70 C20 40 50 36 50 52 C50 62 38 62 38 54" stroke="${BLUE}" stroke-width="5.5" fill="none" stroke-linecap="round"/>
  <path d="M78 70 C80 40 50 36 50 52 C50 62 62 62 62 54" stroke="${BLUE}" stroke-width="5.5" fill="none" stroke-linecap="round"/>
  <path d="M50 24 L44 34 L50 30 L56 34Z" fill="${DEEP}"/>
  <circle cx="50" cy="52" r="4" fill="${DEEP}"/>
  <circle cx="30" cy="78" r="2.6" fill="${LBLUE}"/><circle cx="70" cy="78" r="2.6" fill="${LBLUE}"/><circle cx="50" cy="82" r="2.6" fill="${LBLUE}"/>
</svg>`,
  { size: 192 },
);

// ---------- build ----------
export default function build() {
  const b = createBuilder({ name: "delft_tardigrade" });
  const sphere = (w = 10, h = 8) => new THREE.SphereGeometry(1, w, h);

  // ----- skeleton -----
  const hips = b.joint("hips", { at: [0, BY, -0.15], dir: [0, 0, 1] });
  const spine = b.chain("spine", polyline([[0, BY, -0.15], [0, BY, 0.2]]), {
    parent: hips,
    count: 4,
    role: "spine",
  });
  const tail = b.chain("tail", polyline([[0, BY, -0.15], [0, BY - 0.005, -0.27]]), {
    parent: hips,
    count: 2,
    role: "tail",
  });
  const head = b.joint("head", { parent: spine, at: [0, BY, 0.2], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.125, 0.3], aim: [0, 0.125, 0.37], role: "jaw" });

  // ----- body -----
  const stations = (
    [
      [-0.275, 0.07, 0.07],
      [-0.24, 0.17, 0.15],
      [-0.15, 0.23, 0.2],
      [-0.02, 0.26, 0.225],
      [0.1, 0.255, 0.225],
      [0.18, 0.22, 0.2],
      [0.23, 0.16, 0.15],
    ] as [number, number, number][]
  ).map(([z, w, h]) => ({ at: [0, BY, z] as [number, number, number], w, h }));
  const body = b.loft(stations, { bone: [tail, hips, spine], color: BODY, sides: 14 });
  const skin = b.surface(body);

  // cobalt slip ridges between segments (the flank gaps leave room for the medallion)
  for (let k = 0; k < 8; k++) {
    const z = Z0 + k * SEG;
    const lp = skin.loop([0, BY, z], { dir: [0, 0, 1], lift: 0.002 });
    const path = k === 3 ? lp.slice(0.86, 1).concat(lp.slice(0, 0.14)) : lp;
    b.sweep(path, 0.007, { color: BLUE, sides: 6 });
    if (k === 3) b.sweep(lp.slice(0.36, 0.64), 0.007, { color: BLUE, sides: 6 });
  }

  // pearl studs on the back in the odd rows
  for (const k of [-1, 1, 3, 5]) {
    const z = Z0 + (k + 0.5) * SEG;
    const t = (z + 0.275) / 0.505;
    const at = body.at(t, 0);
    b.stick(sphere(8, 6), PALE, at, { embed: 0.4, scale: [0.016, 0.012, 0.016] });
    b.stick(sphere(6, 4), LBLUE, at, { embed: 0.2, scale: [0.006, 0.006, 0.006] });
  }

  // medallions and cartouches
  for (const s of [1, -1]) {
    b.decal(body, MEDALLION, { at: [s * 0.125, 0.165, -0.03], dir: [s, 0, 0], size: [0.085, 0.085], segments: 12 });
    b.decal(body, SCROLL, { at: [s * 0.1, 0.17, -0.1775], dir: [s, 0, 0], size: [0.046, 0.046], segments: 8 });
    b.decal(body, SCROLL, { at: [s * 0.118, 0.17, 0.0975], dir: [s, 0, 0], size: [0.046, 0.046], segments: 8 });
  }

  // ----- head -----
  const skull = b.part(sphere(14, 10), HEAD, { bone: head, at: HC, scale: [0.1, 0.092, 0.1] });
  const hskin = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = hskin.around(HC).at(s * 40, 16)!;
    b.decal(hskin, EYE, { at: hit, size: [0.052, 0.052], mirror: s > 0, segments: 8 });
    // pale cheek blush spot
    const cheek = hskin.around(HC).at(s * 62, -22)!;
    b.stick(sphere(8, 6), LBLUE, cheek, { embed: 0.3, scale: [0.016, 0.008, 0.016] });
  }
  b.decal(hskin, TULIP, { at: [0, 0.246, 0.235], dir: [0, 1, 0], up: [0, 0, 1], size: [0.055, 0.092], segments: 10 });

  // mouth: separate upper and lower jaw, dark slit between, gilt teeth
  b.part(sphere(12, 8), LIP, { bone: head, at: [0, 0.15, 0.328], scale: [0.054, 0.028, 0.05] });
  b.part(sphere(12, 8), LIP, { bone: jaw, at: [0, 0.104, 0.322], scale: [0.05, 0.026, 0.046] });
  b.part(sphere(8, 6), DEEP, { bone: head, at: [0, 0.127, 0.362], scale: [0.034, 0.012, 0.014] });
  b.ring(frame([0, 0.13, 0.352], [0, 0, 1]), { count: 9, radius: 0.034, fromDeg: -110, toDeg: 110 }, (it) =>
    b.spike(it, [0, 0, 1], 0.022, 0.005, { color: GOLD, bone: head, sides: 5 }),
  );
  b.ring(frame([0, 0.13, 0.352], [0, 0, 1]), { count: 6, radius: 0.034, fromDeg: 125, toDeg: 235 }, (it) =>
    b.spike(it, [0, 0, 1], 0.02, 0.005, { color: GOLD, bone: jaw, sides: 5 }),
  );

  // sensory cirri with ball tips
  for (const s of [1, -1]) {
    const specs: [number, number, number, number, number, number][] = [
      // az, el, dirX, dirY, dirZ, len
      [72, 22, s * 0.9, 0.3, -0.15, 0.1],
      [46, 52, s * 0.5, 0.75, 0.3, 0.07],
    ];
    for (const [az, el, dx, dy, dz, len] of specs) {
      const hit = hskin.around(HC).at(s * az, el)!;
      const a = hit.at.clone();
      const d = new THREE.Vector3(dx, dy, dz).normalize();
      const tip = a.clone().addScaledVector(d, len);
      const mid = a.clone().addScaledVector(d, len * 0.5);
      mid.y += 0.02;
      b.sweep(bezier(hit, mid, tip), [0.007, 0.0028], { color: BLUE, sides: 6, bone: head });
      b.part(sphere(8, 6), DEEP, { bone: head, at: tip, scale: [0.011, 0.011, 0.011] });
    }
  }

  // ----- legs: four pairs, telescoping, with cuffs and fan of gilt claws -----
  const legSpecs = [
    { z: 0.13, rx: 0.085, fx: 0.155, fz: 0.15, h0: 0.45 },
    { z: 0.02, rx: 0.088, fx: 0.165, fz: 0.03, h0: 0.15 },
    { z: -0.09, rx: 0.085, fx: 0.16, fz: -0.1, h0: -0.15 },
    { z: -0.2, rx: 0.07, fx: 0.125, fz: -0.26, h0: -0.7 },
  ];
  legSpecs.forEach((L, i) => {
    for (const s of [1, -1]) {
      const S = s > 0 ? "L" : "R";
      const root: [number, number, number] = [s * L.rx, 0.1, L.z];
      const target: [number, number, number] = [s * L.fx, FY, L.fz];
      const pts = limb(root, target, [0.058, 0.052], [[s, 0.7, 0]]).map(
        (p) => new THREE.Vector3(p.x, p.y, p.z),
      );
      const parent = i === 3 ? hips : spine.nearestJoint(pts[0]);
      const chain = b.chain(`leg${S}${i + 1}`, pts, {
        parent,
        names: [`hip${S}${i + 1}`, `knee${S}${i + 1}`, `foot${S}${i + 1}`],
        role: "leg",
        contact: [target[0], 0, target[2]],
      });
      const tipJoint = chain.tip ?? chain.joints[chain.joints.length - 1];
      const leg = b.sweep(chain, (t: number) => (0.04 - 0.012 * t) * (1 + 0.09 * Math.cos(t * Math.PI * 7)), {
        color: LEGP,
        sides: 8,
      });
      const lskin = b.surface(leg);
      const [hip, knee, foot] = pts;
      const shin = foot.clone().sub(knee).normalize();
      const thigh = knee.clone().sub(hip).normalize();
      b.sweep(lskin.loop(lerp(knee, foot, 0.6), { dir: shin, lift: 0.002 }), 0.0055, {
        color: GOLD,
        sides: 6,
      });
      b.sweep(lskin.loop(lerp(hip, knee, 0.6), { dir: thigh, lift: 0.002 }), 0.005, {
        color: BLUE,
        sides: 6,
      });
      // foot pad
      b.part(sphere(10, 7), LEGP, {
        bone: tipJoint,
        at: [foot.x, 0.05, foot.z],
        scale: [0.036, 0.03, 0.036],
      });
      // claws
      for (let k = 0; k < 4; k++) {
        const th = L.h0 + (k - 1.5) * 0.5;
        const h = new THREE.Vector3(s * Math.cos(th), 0, Math.sin(th));
        const base = foot.clone().addScaledVector(h, 0.006);
        base.y = FY + 0.006;
        const ctrl = foot.clone().addScaledVector(h, 0.036);
        ctrl.y = FY + 0.012;
        const tip = foot.clone().addScaledVector(h, 0.04);
        tip.y = 0;
        b.sweep(bezier(base, ctrl, tip), [0.0085, 0], {
          bone: tipJoint,
          color: GOLD,
          caps: { start: "flat", end: "point" },
          sides: 6,
        });
      }
    }
  });

  return b.root;
}
