// STYLE: "Delftware porcelain figurine". The dumbo octopus is a glazed white ceramic keepsake
// painted in cobalt underglaze (rosette medallion, tulip sprigs, bead necklaces, diamond-banded arms),
// with a coral-pink blush where the animal is pink, gilt lustre on the beak, ear rims, bracelets and
// arm tips, and a tiny maker's mark under the tail. Every surface is glaze, cobalt, coral or gold.

import * as THREE from "three";
import {
  createBuilder,
  rng,
  offset,
  catmull,
  paint,
  mix,
  noise,
  cells,
  smoothstep,
  mottle,
  svg,
  DEG,
} from "../../../../src/index";

export const meta = {
  name: "Delftware Dumbo Octopus",
  description:
    "A dumbo octopus as a blue-and-white Delft porcelain figurine: glazed white mantle with a cobalt rosette medallion, big ear fins with gilt rims and tulip sprigs, webbed arms with diamond bands, gilt bracelets and cobalt-ringed suckers on the curled tips.",
};

// ------------------------------------------------------------------ palette
const GLAZE = "#f3f1e8";
const SHADE = "#c9d4ea"; // cool blue-grey glaze in shadow
const COBALT = "#1f3d9c";
const DEEP = "#142463";
const MID = "#4a6fc7";
const PALE = "#a9bfeb";
const CORAL = "#e9877a";
const CORAL_L = "#f6c9bd";
const GILT_FLAT = "#d9a838";

const GILTP = mottle("#c9962b", "#f4d26e", { size: 0.02, seed: 5 });

// ------------------------------------------------------------------ scale helpers
const S = 0.8; // design units -> meters
const P = (x: number, y: number, z: number): [number, number, number] => [x * S, y * S, z * S];
const R = (r: number) => r * S;

function need<T>(v: T | null | undefined, what: string): T {
  if (!v) throw new Error(`dumbo: missing ${what}`);
  return v;
}
const wrap = (d: number) => ((((d + 180) % 360) + 360) % 360) - 180;

// ------------------------------------------------------------------ paints
const SHELL = paint((p, n) => {
  let c = mix(SHADE, GLAZE, smoothstep(-0.8, 0.7, n.y));
  c = mix(c, CORAL, 0.6 * smoothstep(-0.15, -0.85, n.y));
  const k = cells(p, 0.045, 3);
  if (k.id > 0.72 && k.d1 < 0.16 && n.y > -0.2) c = mix(c, PALE, 0.85);
  if (noise(p, 0.012, 4) > 0.78) c = mix(c, PALE, 0.35);
  return c;
});

const ARMP = paint((_p, n, s) => {
  const t = s[0];
  const a = Math.abs(wrap(s[1]));
  if (t > 0.9) return GILT_FLAT;
  let c = mix(CORAL_L, GLAZE, smoothstep(-0.55, 0.35, n.y));
  if (t > 0.78) c = mix(c, CORAL, (t - 0.78) / 0.12);
  if (t > 0.1 && t < 0.88) {
    const f = (t * 15) % 1;
    const dia = Math.abs(f - 0.5) / 0.38 + a / 48;
    if (dia < 0.3) c = mix(GLAZE, GLAZE, 0);
    else if (dia < 1) c = mix(COBALT, COBALT, 0);
  }
  return c;
});

const WEBP = paint((_p, _n, s) => {
  const a = s[0];
  const c = s[1];
  if (a > 0.92) return COBALT;
  if (a > 0.85 && a < 0.88) return PALE;
  const base = mix(CORAL_L, GLAZE, smoothstep(0.0, 0.65, a));
  if (a > 0.12 && a < 0.8) {
    const f = (a * 7) % 1;
    const dm = Math.hypot(((f - 0.5) / 7) * 0.09, (c - 0.5) * (0.03 + 0.07 * a));
    if (dm < 0.0042) return COBALT;
    if (Math.abs(c - 0.5) * (0.03 + 0.07 * a) < 0.0007) return PALE;
  }
  return base;
});

// ------------------------------------------------------------------ ear-fin outline
const EAR_CX = 0.048;
const EAR_CY = 0.02;
const EAR_A = 0.05;
const EAR_B = 0.06;
const EAR: [number, number][] = [];
for (let k = 0; k < 30; k++) {
  const th = (k / 30) * Math.PI * 2;
  const wob = 1 + 0.05 * Math.cos(10 * th);
  const x = Math.max(0, EAR_CX + EAR_A * wob * Math.cos(th));
  const y = EAR_CY + EAR_B * wob * Math.sin(th) * (1 + 0.12 * Math.cos(th));
  EAR.push([R(x), R(y)]);
}
const FCX = R(EAR_CX);
const FCY = R(EAR_CY);
const FA = R(EAR_A);
const FB = R(EAR_B);

const FINP = paint((_p, _n, s) => {
  const dx = (s[0] - FCX) / FA;
  const dy = (s[1] - FCY) / FB;
  const d = Math.hypot(dx, dy);
  if (d > 0.9) return COBALT;
  if (d > 0.82 && d < 0.86) return PALE;
  let c = mix(CORAL_L, GLAZE, smoothstep(0.05, 0.75, d));
  if (d > 0.62 && d < 0.8) {
    const ang = Math.atan2(dy, dx);
    const f = Math.abs((((ang / (Math.PI / 10)) % 1) + 1) % 1 - 0.5);
    if (f > 0.44) c = mix(MID, MID, 0);
  }
  return c;
});

// ------------------------------------------------------------------ textures
const eyeRays = (() => {
  let out = "";
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    out += `<path d="M${50 + Math.cos(a) * 20} ${52 + Math.sin(a) * 20} L${50 + Math.cos(a) * 37} ${50 + Math.sin(a) * 37}" stroke="${MID}" stroke-width="2.2" stroke-linecap="round"/>`;
  }
  return out;
})();
const EYE = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="${COBALT}"/>
    <circle cx="50" cy="50" r="41" fill="${DEEP}"/>
    ${eyeRays}
    <circle cx="50" cy="50" r="41" fill="none" stroke="${GILT_FLAT}" stroke-width="2.4"/>
    <circle cx="50" cy="53" r="18" fill="#070d30"/>
    <ellipse cx="35" cy="33" rx="11" ry="14" fill="#ffffff" transform="rotate(-25 35 33)"/>
    <circle cx="63" cy="66" r="5.5" fill="#ffffff"/>
    <circle cx="68" cy="38" r="2.6" fill="${PALE}"/>
  </svg>`,
  { size: 256 },
);

const BLUSH = svg(
  `<svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="50" cy="30" rx="46" ry="26" fill="${CORAL}"/>
    <ellipse cx="46" cy="26" rx="30" ry="15" fill="#f3a597"/>
    <path d="M28 40 l6 -12 M46 44 l6 -12 M64 40 l6 -12" stroke="#c85f55" stroke-width="3.2" stroke-linecap="round" fill="none"/>
  </svg>`,
  { size: 128 },
);

const HILITE = svg(
  `<svg viewBox="0 0 40 80" xmlns="http://www.w3.org/2000/svg">
    <path d="M30 3 Q5 17 7 50 Q8 67 21 77 Q13 52 17 31 Q19 15 30 3Z" fill="#ffffff"/>
    <circle cx="31" cy="70" r="4" fill="#ffffff"/>
  </svg>`,
  { size: 128 },
);

const MEDAL = (() => {
  let petals = "";
  let leaves = "";
  let dots = "";
  for (let i = 0; i < 8; i++) {
    petals += `<ellipse cx="50" cy="30" rx="8.5" ry="14" transform="rotate(${i * 45} 50 50)" fill="${i % 2 ? PALE : "#f6f4ec"}" stroke="${COBALT}" stroke-width="1.8"/>`;
    leaves += `<path d="M50 14 L53.5 22 L50 27 L46.5 22Z" transform="rotate(${22.5 + i * 45} 50 50)" fill="${COBALT}"/>`;
  }
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2;
    dots += `<circle cx="${50 + Math.cos(a) * 43.8}" cy="${50 + Math.sin(a) * 43.8}" r="1.7" fill="${COBALT}"/>`;
  }
  return svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#f6f4ec" stroke="${COBALT}" stroke-width="2.8"/>
      <circle cx="50" cy="50" r="40" fill="none" stroke="${COBALT}" stroke-width="1.4"/>
      ${dots}${leaves}${petals}
      <circle cx="50" cy="50" r="9.5" fill="${GILT_FLAT}" stroke="${COBALT}" stroke-width="2"/>
      <circle cx="50" cy="50" r="3.4" fill="${COBALT}"/>
    </svg>`,
    { size: 256 },
  );
})();

const TULIP = svg(
  `<svg viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg">
    <path d="M30 78 L30 40" stroke="${COBALT}" stroke-width="2.8" stroke-linecap="round"/>
    <path d="M30 70 Q9 66 7 44 Q24 48 30 66Z" fill="${PALE}" stroke="${COBALT}" stroke-width="1.8"/>
    <path d="M30 66 Q51 62 53 42 Q36 46 30 62Z" fill="${PALE}" stroke="${COBALT}" stroke-width="1.8"/>
    <path d="M30 11 Q9 14 13 36 Q22 44 29 38 Q20 28 30 11Z" fill="${MID}" stroke="${COBALT}" stroke-width="1.8"/>
    <path d="M30 11 Q51 14 47 36 Q38 44 31 38 Q40 28 30 11Z" fill="${MID}" stroke="${COBALT}" stroke-width="1.8"/>
    <path d="M30 4 Q20 18 22 36 Q30 45 38 36 Q40 18 30 4Z" fill="#f6f4ec" stroke="${COBALT}" stroke-width="2"/>
    <path d="M30 14 L30 36" stroke="${PALE}" stroke-width="1.6"/>
  </svg>`,
  { size: 192 },
);

const MARK = svg(
  `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
    <circle cx="30" cy="30" r="27" fill="none" stroke="${COBALT}" stroke-width="3"/>
    <path d="M30 12 Q24 18 25 25 Q30 29 35 25 Q36 18 30 12Z" fill="${COBALT}"/>
    <path d="M30 28 L30 33" stroke="${COBALT}" stroke-width="2.4"/>
    <text x="30" y="47" text-anchor="middle" font-family="serif" font-weight="bold" font-size="15" fill="${COBALT}">D·O</text>
  </svg>`,
  { size: 128 },
);

// ------------------------------------------------------------------ builder & skeleton
export default function build() {
  const b = createBuilder({ name: "dumbo-delft" });
  const rnd = rng(11);

  const body = b.joint("body", { at: P(0, 0.13, 0), dir: [0, 0, 1], role: "spine" });
  const head = b.joint("head", { parent: body, at: P(0, 0.12, 0.05), dir: [0, 0, 1], role: "head" });

  const mantle = b.chain(
    "mantle",
    catmull([P(0, 0.115, 0.055), P(0, 0.135, 0.02), P(0, 0.16, -0.025), P(0, 0.165, -0.065)]),
    { parent: body, count: 4, role: "spine" },
  );
  const shell = b.sweep(mantle, [0.055, 0.08, 0.088, 0.07, 0.045].map(R), {
    sides: 12,
    color: SHELL,
    name: "mantleShell",
  });
  const skin = b.surface(shell);

  // ---------------------------------------------------------------- eyes
  const EYEBALL = new THREE.SphereGeometry(1, 10, 8).scale(R(0.034), R(0.03), R(0.034));
  const LID = new THREE.TorusGeometry(R(0.036), R(0.005), 5, 12).rotateX(Math.PI / 2);
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hit = need(skin.around(P(0, 0.12, 0.03)).at(s * 60, 4), "eye site");
    const ball = b.stick(EYEBALL, GLAZE, hit, { embed: 0.3, bone: head, name: `eye${side}` });
    b.stick(LID, GILTP, hit, { embed: 0.2, bone: head, name: `lid${side}` });
    const eh = need(b.surface(ball).nearest(offset(hit, hit.n, R(0.1))), "eye face");
    b.decal(ball, EYE, { at: eh, size: [R(0.052), R(0.052)], segments: 8, name: `iris${side}` });
    b.ring(ball, { count: 5, radius: R(0.03), fromDeg: -70, toDeg: 70, tilt: 35 }, (l) =>
      b.spike(l, l, R(0.026), R(0.0035), { color: COBALT }),
    );
    // underglaze blush and glossy highlight
    const bh = need(skin.around(P(0, 0.12, 0.03)).at(s * 48, -28), "cheek");
    b.decal(shell, BLUSH, { at: bh, size: [R(0.06), R(0.036)], roll: s * -15, segments: 8, name: `blush${side}` });
    const hh = need(skin.around(P(0, 0.14, 0.0)).at(s * 32, 48), "highlight");
    b.decal(shell, HILITE, { at: hh, size: [R(0.05), R(0.095)], roll: s * -25, segments: 8, name: `gloss${side}` });
  }

  // ---------------------------------------------------------------- crown medallion, bands, mark
  const top = need(skin.ray(P(0, 0.5, 0.01), [0, -1, 0]), "crown");
  b.decal(shell, MEDAL, { at: top, size: [R(0.095), R(0.095)], up: [0, 0, -1], segments: 14, name: "medallion" });

  const band = (t: number, r: number, color: typeof GILTP | string, lift: number) =>
    b.sweep(skin.loop(mantle.at(t), { lift }), r, { color, sides: 5 });
  band(0.8, R(0.0032), COBALT, R(0.0035));
  band(0.88, R(0.0032), COBALT, R(0.0035));
  const BEAD = new THREE.SphereGeometry(R(0.0038), 5, 4);
  b.along(skin.loop(mantle.at(0.84), { lift: R(0.004) }), 26, (at) => b.part(BEAD, GILTP, { at }));

  const mk = need(skin.ray(P(0, 0.165, -0.5), [0, 0, 1]), "mark");
  b.decal(shell, MARK, { at: mk, size: [R(0.045), R(0.045)], segments: 6, name: "makerMark" });

  // funnel (siphon)
  const fh = need(skin.around(P(0, 0.14, -0.02)).at(180, -35), "funnel");
  b.sprout("funnel", fh, offset(fh, new THREE.Vector3(0, -0.4, -1).normalize(), R(0.05)), [R(0.015), R(0.011)], {
    count: 0,
    color: GILTP,
    caps: { end: "flat" },
  });

  // ---------------------------------------------------------------- ear fins
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const X = new THREE.Vector3(s * 0.9, 0.4, 0).normalize();
    const Y = new THREE.Vector3(-s * 0.4, 0.9, 0).normalize();
    const base = need(skin.around(P(0, 0.15, -0.02)).at(s * 92, 14), "fin root");
    const root = offset(base, base.n, -R(0.016));
    const finChain = b.chain(
      `fin${side}`,
      catmull([
        root,
        root.clone().addScaledVector(X, R(0.05)).addScaledVector(Y, R(0.02)),
        root.clone().addScaledVector(X, R(0.1)).addScaledVector(Y, R(0.04)),
      ]),
      { parent: mantle.nearestJoint(base.at), names: [`fin${side}1`, `fin${side}2`], role: "wing" },
    );
    const fin = b.extrude(EAR, {
      at: root,
      x: [X.x, X.y, X.z],
      y: [Y.x, Y.y, Y.z],
      thickness: R(0.009),
      bevel: R(0.0025),
      color: FINP,
      bone: finChain.joints[0],
      name: `fin${side}`,
    });
    const rim = catmull(
      EAR.map(([u, v]) => fin.local([u, v, 0])),
      { closed: true },
    );
    b.sweep(rim, R(0.0028), { color: GILTP, bone: finChain.joints[0], sides: 5, name: `finRim${side}` });

    // tulip sprig on both faces
    const c = fin.local([R(EAR_CX * 0.95), R(EAR_CY), 0]);
    const finSkin = b.surface(fin);
    const front = need(finSkin.ray(c.clone().add(new THREE.Vector3(0, 0, 0.1)), [0, 0, -1]), "fin front");
    b.decal(fin, TULIP, { at: front, size: [R(0.06), R(0.078)], up: [Y.x, Y.y, Y.z], segments: 6 });
    const back = need(finSkin.ray(c.clone().add(new THREE.Vector3(0, 0, -0.1)), [0, 0, 1]), "fin back");
    b.decal(fin, TULIP, { at: back, size: [R(0.06), R(0.078)], up: [Y.x, Y.y, Y.z], segments: 6 });
  }

  // ---------------------------------------------------------------- arms
  const SPECS = [
    { a: 24, L: 1.0 },
    { a: 62, L: 1.02 },
    { a: 104, L: 0.98 },
    { a: 150, L: 0.9 },
  ];
  const RAD = [0.019, 0.017, 0.0128, 0.0098, 0.0062, 0.0028];
  type ArmT = { chain: ReturnType<typeof b.chain>; sweep: ReturnType<typeof b.sweep> };
  const armsL: ArmT[] = [];
  const armsR: ArmT[] = [];
  const RING = new THREE.TorusGeometry(R(0.0056), R(0.0022), 4, 8).rotateX(Math.PI / 2);

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    SPECS.forEach((spec, i) => {
      const az = spec.a * DEG;
      const dx = s * Math.sin(az);
      const dz = Math.cos(az);
      const lx = Math.cos(az);
      const lz = -s * Math.sin(az);
      const cu = (i % 2 ? -1 : 1) * s * (0.8 + 0.4 * rnd());
      const L = spec.L;
      const pt = (rad: number, y: number, lat: number) =>
        P(dx * rad + lx * lat, y, 0.05 + dz * rad + lz * lat);
      const pts = [
        pt(0.03, 0.075, 0),
        pt(0.075, 0.042, 0),
        pt(0.12 * L, 0.0125, 0.003 * cu),
        pt(0.165 * L, 0.009, 0.008 * cu),
        pt(0.205 * L, 0.015, 0.02 * cu),
        pt(0.23 * L, 0.045, 0.036 * cu),
      ];
      const name = `arm${side}${i + 1}`;
      const chain = b.chain(name, catmull(pts), {
        parent: body,
        role: "tentacle",
        names: (k: number) => `${name}_${k + 1}`,
      });
      const sweep = b.sweep(
        chain,
        RAD.map((v) => R(v * (0.9 + 0.1 * L))),
        { sides: 8, color: ARMP, name },
      );
      (s > 0 ? armsL : armsR).push({ chain, sweep });

      // gilt and cobalt bracelets
      for (const [t, col] of [
        [0.3, GILTP],
        [0.74, COBALT],
      ] as const) {
        const rr = sweep.at(t).radius * 1.08 + R(0.0008);
        const items = b.ring(chain.at(t), { count: 8, radius: rr }).items;
        b.sweep(catmull(items, { closed: true }), R(0.0028), { color: col, sides: 5 });
      }
      // suckers on the curled underside
      for (let k = 0; k < 6; k++) {
        const t = 0.5 + k * 0.075;
        const pnt = sweep.at(t, 180);
        b.stick(RING, COBALT, pnt, { embed: 0.35, scale: Math.min(1.1, pnt.radius / R(0.0105)) });
      }
    });
  }

  // webbing between neighbouring arms
  const order = [...armsR.slice().reverse(), ...armsL];
  const edge = (a: ArmT) => catmull([0.06, 0.2, 0.35, 0.5, 0.62].map((t) => a.chain.at(t)));
  for (let i = 0; i < order.length; i++) {
    b.membrane(edge(order[i]), edge(order[(i + 1) % order.length]), {
      color: WEBP,
      thickness: R(0.006),
      scallop: 0.16,
      rows: 3,
      name: `web${i + 1}`,
    });
  }

  // ---------------------------------------------------------------- beak (separate upper and lower jaw)
  const jaw = b.joint("jaw", { parent: head, at: P(0, 0.07, 0.075), aim: P(0, 0.06, 0.112), role: "jaw" });
  b.spike(P(0, 0.084, 0.07), P(0, 0.074, 0.115), null, R(0.017), { color: GILTP, bone: head, name: "beakUpper" });
  b.spike(P(0, 0.07, 0.078), P(0, 0.058, 0.105), null, R(0.012), { color: GILTP, bone: jaw, name: "beakLower" });

  return b.root;
}
