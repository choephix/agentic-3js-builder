import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  paint,
  noise,
  mix,
  smoothstep,
  rgb,
  svg,
  offset,
  bezier,
  polyline,
} from "../../../../src/index";
import type { Rgb } from "../../../../src/index";
import { metal } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Aurora",
  description:
    "An art deco passenger zeppelin: champagne hull with navy belly, gold ribs and rings, sunburst nose, stepped fins with sunburst rays, and a navy gondola with glowing windows.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette
const CREAM = "#f1e4c2";
const CREAM2 = "#d6c394";
const NAVY = "#1d2b4f";
const NAVY2 = "#121a33";
const TEAL = "#1f6b70";
const GOLD = "#d9a441";
const WOOD = "#6b4322";
const WOOD2 = "#a3703c";
const LIGHT = "#ffe7a8";

const GILT = metal("gilt", { tarnish: 0.08, polish: 0.5, size: 0.6 });
const BRASS = metal("brass", { tarnish: 0.25, size: 0.5 });

/** Simple form lighting: warm on top, darker underneath. */
function lit(c: string | Rgb, n: THREE.Vector3): Rgb {
  const k = 0.82 + 0.18 * smoothstep(-1, 1, n.y);
  const [r, g, b] = rgb(c);
  return [r * k, g * k, b * k];
}

// ---------------------------------------------------------------------------------------------------------------
// Dimensions (meters)
const L = 90; // hull length (tail to start of nose dome)
const R = 9; // max hull radius
const YC = 13; // hull axis height
const Z0 = -L / 2;
const FIN_Z = -42;

/** Hull radius at sweep t (0 = tail, 1 = nose). */
function hullR(t: number) {
  const u = (t - 0.55) / 0.55;
  return 1 + (R - 1) * Math.sqrt(Math.max(0, 1 - u * u));
}
const zOf = (t: number) => Z0 + t * L;

// ---------------------------------------------------------------------------------------------------------------
// Paints
const hullPaint = paint((p, n, s) => {
  const [t, deg] = s;
  if (t > 0.998) return lit(GOLD, n); // nose dome
  if (t < 0.002) return lit(NAVY, n); // tail cap
  const belly = Math.abs((((deg % 360) + 360) % 360) - 180); // 0 at the belly, 180 on top
  if (belly < 40) {
    const seam = (((p.z + 200) % 6) + 6) % 6 < 0.2;
    return lit(seam ? GOLD : NAVY, n);
  }
  if (belly < 44) return lit(GOLD, n);
  if (belly < 50) return lit(TEAL, n);
  if (belly < 52) return lit(GOLD, n);
  if (belly > 160 && belly < 161.5) return lit(GOLD, n);
  const cloth = mix(CREAM, CREAM2, 0.45 * noise(p, 4, 3));
  const panel = (((p.z + 200) % 7.5) + 7.5) % 7.5 < 0.18;
  return lit(panel ? mix(cloth, CREAM2, 0.7) : cloth, n);
});

const finPaint = paint((_p, n, s) => {
  const [u, v] = s;
  const r = Math.hypot(u, v - 2);
  const ang = Math.atan2(v - 2, u);
  const ray = Math.floor((ang / (Math.PI / 2)) * 9) % 2 === 0;
  let c: string = ray && r > 7 ? NAVY : CREAM;
  if (Math.abs(r - 7) < 0.3 || Math.abs(r - 12) < 0.25) c = GOLD;
  return lit(c, n);
});

const rudderPaint = paint((_p, n, s) => lit(Math.abs(s[0] + 2.2) < 0.25 ? GOLD : NAVY, n));
const gondPaint = paint((p, n) => lit(p.y > 3.75 ? CREAM : p.y < 1.45 ? NAVY2 : NAVY, n));
const carPaint = paint((_p, n) => lit(n.y > -0.25 ? CREAM : NAVY, n));
const bladePaint = paint((p, n) => lit(mix(WOOD, WOOD2, noise(p, 0.3, 5)), n));

// ---------------------------------------------------------------------------------------------------------------
// Textures
function windowStrip(count: number, w: number, h: number) {
  let wins = "";
  const pitch = w / count;
  for (let i = 0; i < count; i++) {
    const x = i * pitch + pitch * 0.18;
    const ww = pitch * 0.64;
    wins += `<rect x="${x.toFixed(1)}" y="${(h * 0.2).toFixed(1)}" width="${ww.toFixed(1)}" height="${(h * 0.6).toFixed(1)}" fill="${LIGHT}" stroke="${GOLD}" stroke-width="2"/>`;
    wins += `<rect x="${(x + ww * 0.25).toFixed(1)}" y="${(h * 0.12).toFixed(1)}" width="${(ww * 0.5).toFixed(1)}" height="${(h * 0.1).toFixed(1)}" fill="${GOLD}"/>`;
  }
  return svg(
    `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="${w}" height="${h}" fill="#101a35"/>
      <rect x="0" y="0" width="${w}" height="3" fill="${GOLD}"/>
      <rect x="0" y="${h - 3}" width="${w}" height="3" fill="${GOLD}"/>
      ${wins}
    </svg>`,
    { size: 1024 },
  );
}
const GONDOLA_WINDOWS = windowStrip(10, 400, 52);
const FRONT_WINDOWS = windowStrip(3, 120, 52);
const PROMENADE = windowStrip(18, 720, 40);

const SUNBURST = (() => {
  let rays = "";
  for (let i = 0; i < 16; i++) {
    const a0 = ((i * 22.5 - 4) * Math.PI) / 180;
    const a1 = ((i * 22.5 + 4) * Math.PI) / 180;
    rays += `<polygon points="50,50 ${(50 + 46 * Math.cos(a0)).toFixed(1)},${(50 + 46 * Math.sin(a0)).toFixed(1)} ${(50 + 46 * Math.cos(a1)).toFixed(1)},${(50 + 46 * Math.sin(a1)).toFixed(1)}" fill="${GOLD}"/>`;
  }
  return svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="${NAVY}" stroke="${GOLD}" stroke-width="3"/>
      ${rays}
      <circle cx="50" cy="50" r="19" fill="${CREAM}" stroke="${GOLD}" stroke-width="2"/>
      <circle cx="50" cy="50" r="12" fill="${TEAL}"/>
      <circle cx="50" cy="50" r="4.5" fill="${GOLD}"/>
    </svg>`,
    { size: 512 },
  );
})();

const NAMEPLATE = svg(
  `<svg viewBox="0 0 480 90" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="8" width="460" height="4" fill="${GOLD}"/>
    <rect x="40" y="78" width="400" height="4" fill="${GOLD}"/>
    <rect x="10" y="78" width="20" height="4" fill="${TEAL}"/>
    <rect x="450" y="78" width="20" height="4" fill="${TEAL}"/>
    <text x="240" y="64" text-anchor="middle" font-family="'Futura','Century Gothic','Trebuchet MS',sans-serif" font-weight="700" font-size="54" letter-spacing="14" fill="${GOLD}" stroke="${NAVY2}" stroke-width="2">AURORA</text>
  </svg>`,
  { size: 1024 },
);

const CREST = (() => {
  let rays = "";
  for (let i = 0; i < 9; i++) {
    const a0 = ((180 + i * 20 + 3) * Math.PI) / 180;
    const a1 = ((180 + i * 20 + 13) * Math.PI) / 180;
    rays += `<polygon points="50,60 ${(50 + 44 * Math.cos(a0)).toFixed(1)},${(60 + 44 * Math.sin(a0)).toFixed(1)} ${(50 + 44 * Math.cos(a1)).toFixed(1)},${(60 + 44 * Math.sin(a1)).toFixed(1)}" fill="${GOLD}"/>`;
  }
  return svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 60 A46 46 0 0 1 96 60 Z" fill="${NAVY}" stroke="${GOLD}" stroke-width="2.5"/>
      ${rays}
      <circle cx="50" cy="60" r="12" fill="${CREAM}" stroke="${GOLD}" stroke-width="2"/>
      <rect x="6" y="66" width="88" height="5" fill="${GOLD}"/>
      <rect x="16" y="76" width="68" height="5" fill="${TEAL}"/>
      <rect x="28" y="86" width="44" height="5" fill="${GOLD}"/>
    </svg>`,
    { size: 512 },
  );
})();

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "zeppelin", paintSize: 2048 });
  const rand = rng(11);

  // Root joint: the hull.
  const hull = b.joint("hull", { at: [0, YC, 0], dir: [0, 0, 1], role: "spine" });
  const P = (geo: THREE.BufferGeometry, color: any, opts: any) => b.part(geo, color, { bone: hull, ...opts });

  // ---------------------------------------------------------------- hull
  const hullTube = b.sweep(polyline([[0, YC, Z0], [0, YC, Z0 + L]]), (t) => hullR(t), {
    bone: hull,
    color: hullPaint,
    sides: 20,
    caps: "round",
    name: "hull",
  });

  // Longitudinal gold ribs on face centres.
  for (let i = 0; i < 10; i++)
    b.sweep(hullTube.line(i * 36, 0.1).slice(0.08, 0.96), 0.14, { bone: hull, color: GILT, sides: 6, name: `rib${i}` });

  // Frame rings.
  for (const t of [0.12, 0.22, 0.34, 0.47, 0.6, 0.72, 0.84, 0.93]) {
    const r = hullR(t) + 0.18;
    P(new THREE.TorusGeometry(r, 0.14 + 0.02 * rand(), 6, 28), GILT, { at: [0, YC, zOf(t)], dir: [0, 0, 1], axis: "z" });
  }

  // Deco medallions along the teal waist band.
  for (const deg of [133, 227])
    for (let i = 0; i < 13; i++) {
      const t = 0.17 + (i / 12) * 0.7;
      b.stick(new THREE.CylinderGeometry(0.34, 0.34, 0.12, 8), GILT, hullTube.at(t, deg), { embed: 0.35, bone: hull });
    }

  // ---------------------------------------------------------------- nose
  const noseR = hullR(1);
  const domeC = new THREE.Vector3(0, YC, Z0 + L);
  const tip = [0, YC, Z0 + L + noseR * 0.98] as [number, number, number];
  P(new THREE.TorusGeometry(noseR + 0.2, 0.18, 6, 28), GILT, { at: [0, YC, Z0 + L], dir: [0, 0, 1], axis: "z" });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const e = (28 * Math.PI) / 180;
    const end = domeC.clone().add(new THREE.Vector3(Math.cos(e) * Math.cos(a), Math.cos(e) * Math.sin(a), Math.sin(e)).multiplyScalar(noseR + 0.1));
    const em = (60 * Math.PI) / 180;
    const m = domeC.clone().add(new THREE.Vector3(Math.cos(em) * Math.cos(a), Math.cos(em) * Math.sin(a), Math.sin(em)).multiplyScalar(noseR + 0.14));
    const ctrl = m.clone().multiplyScalar(2).sub(new THREE.Vector3(...tip).add(end).multiplyScalar(0.5));
    b.sweep(bezier(tip, ctrl, end), [0.16, 0.1], { bone: hull, color: GILT, sides: 6, name: `noseRay${i}` });
  }
  b.spike([0, YC, Z0 + L + noseR * 0.9], [0, 0, 1], 3.2, 0.55, { bone: hull, color: GILT, sides: 8 });
  P(new THREE.SphereGeometry(0.5, 8, 6), GILT, { at: [0, YC, Z0 + L + noseR * 0.9] });

  // ---------------------------------------------------------------- tail
  glow(P(new THREE.SphereGeometry(0.35, 8, 6), "#ffffff", { at: [0, YC, Z0 - 1.15] }), 1.5);
  P(new THREE.TorusGeometry(hullR(0.02) + 0.3, 0.12, 6, 16), GILT, { at: [0, YC, zOf(0.02)], dir: [0, 0, 1], axis: "z" });

  // ---------------------------------------------------------------- fins
  const FIN_OUTLINE: [number, number][] = [
    [0, 0],
    [25, 0],
    [25, 8],
    [22, 11],
    [18, 13],
    [7, 13],
    [0, 12],
  ];
  const RUDDER_OUTLINE: [number, number][] = [
    [0, 5.5],
    [0, 11.5],
    [-3.5, 11.5],
    [-4.5, 6],
  ];
  const FINS: { name: string; out: [number, number, number] }[] = [
    { name: "Top", out: [0, 1, 0] },
    { name: "Bottom", out: [0, -1, 0] },
    { name: "L", out: [1, 0, 0] },
    { name: "R", out: [-1, 0, 0] },
  ];
  const finTips: THREE.Vector3[] = [];
  for (const f of FINS) {
    const fin = b.extrude(FIN_OUTLINE, {
      at: [0, YC, FIN_Z],
      x: [0, 0, 1],
      y: f.out,
      thickness: [0.5, 0.15],
      color: finPaint,
      bone: hull,
      name: `fin${f.name}`,
    });
    for (let i = 1; i < 6; i++)
      b.rod(
        fin.local([FIN_OUTLINE[i][0], FIN_OUTLINE[i][1], 0]),
        fin.local([FIN_OUTLINE[i + 1][0], FIN_OUTLINE[i + 1][1], 0]),
        0.16,
        GILT,
        { bone: hull, sides: 6 },
      );
    finTips.push(fin.local([12, 13, 0]));
    const hinge = b.joint(`rudder${f.name}`, {
      parent: hull,
      at: offset([0, YC, FIN_Z], f.out, 5.5),
      dir: f.out,
      role: "hinge",
    });
    b.extrude(RUDDER_OUTLINE, {
      at: [0, YC, FIN_Z],
      x: [0, 0, 1],
      y: f.out,
      thickness: [0.4, 0.12],
      color: rudderPaint,
      bone: hinge,
      name: `rudderBlade${f.name}`,
    });
    b.rod(offset([0, YC, FIN_Z], f.out, 5.5), offset([0, YC, FIN_Z], f.out, 11.5), 0.14, GILT, { bone: hinge, sides: 6 });
    if (f.name === "Top")
      for (const s of [1, -1])
        b.decal(fin, CREST, { at: [s * 0.3, YC + 9.5, FIN_Z + 12], dir: [s, 0, 0], size: [4.5, 4.5], bone: hull });
  }
  // Bracing wires between the fin tips.
  const [tipTop, tipBot, tipL, tipR] = finTips;
  for (const [a, c] of [
    [tipTop, tipL],
    [tipTop, tipR],
    [tipBot, tipL],
    [tipBot, tipR],
  ])
    b.rod(a, c, 0.04, NAVY2, { bone: hull, sides: 4 });

  // ---------------------------------------------------------------- mast and antenna wires
  const mastZ = 18;
  const mastBase = [0, YC + hullR((mastZ - Z0) / L) - 0.1, mastZ] as [number, number, number];
  const mastTop = [0, mastBase[1] + 2.6, mastZ] as [number, number, number];
  b.rod(mastBase, mastTop, 0.1, GILT, { bone: hull, sides: 6 });
  glow(P(new THREE.SphereGeometry(0.28, 8, 6), "#ffffff", { at: [0, mastTop[1] + 0.2, mastZ] }), 1.5);
  b.rod(mastTop, tipTop, 0.04, NAVY2, { bone: hull, sides: 4 });
  b.rod(mastTop, [0, YC + noseR * 0.75, Z0 + L + noseR * 0.6], 0.04, NAVY2, { bone: hull, sides: 4 });

  // ---------------------------------------------------------------- decals on the hull
  for (const deg of [90, 270]) {
    const sun = hullTube.at(0.8, deg);
    b.decal(hullTube, SUNBURST, { at: sun.at, dir: sun.n, size: [5, 5], bone: hull });
    const name = hullTube.at(0.52, deg);
    b.decal(hullTube, NAMEPLATE, { at: name.at, dir: name.n, size: [17, 3.2], bone: hull });
  }
  for (const deg of [126, 234]) {
    const w = hullTube.at(0.6, deg);
    glow(b.decal(hullTube, PROMENADE, { at: w.at, dir: w.n, size: [27, 1.5], bone: hull }), 1.2);
  }

  // ---------------------------------------------------------------- gondola
  const GY = 2.6;
  P(new THREE.BoxGeometry(3.6, 3.2, 10), gondPaint, { at: [0, GY, 16] });
  b.frustumBox([0, GY, 21], [0, GY + 0.1, 25.5], [3.6, 3.2], [2.2, 2.4], { bone: hull, color: gondPaint });
  b.frustumBox([0, GY, 11], [0, GY + 0.2, 8], [3.6, 3.2], [2.0, 2.2], { bone: hull, color: gondPaint });
  // Gold edge trim.
  for (const s of [1, -1]) {
    b.rod([s * 1.82, 1.0, 11], [s * 1.82, 1.0, 21], 0.1, GILT, { bone: hull, sides: 6 });
    b.rod([s * 1.82, 4.2, 11], [s * 1.82, 4.2, 21], 0.1, GILT, { bone: hull, sides: 6 });
    b.rod([s * 1.82, 1.0, 11], [s * 1.82, 4.2, 11], 0.1, GILT, { bone: hull, sides: 6 });
    b.rod([s * 1.82, 1.0, 21], [s * 1.82, 4.2, 21], 0.1, GILT, { bone: hull, sides: 6 });
    // Windows.
    glow(
      P(new THREE.PlaneGeometry(9, 1.2), "#ffffff", {
        at: [s * 1.84, 2.95, 16],
        dir: [s, 0, 0],
        axis: "z",
        texture: GONDOLA_WINDOWS,
      }),
      1.4,
    );
    // Speed lines: three stepped gold fins at the rear.
    for (let i = 0; i < 3; i++)
      P(new THREE.BoxGeometry(0.1, 0.22, 3.2 - i * 0.6), GILT, { at: [s * 1.88, 1.6 + i * 0.5, 10.5 + i * 0.3] });
    // Running lights: red left, green right.
    glow(P(new THREE.SphereGeometry(0.22, 8, 6), s > 0 ? "#ff3b30" : "#2ee06a", { at: [s * 1.95, 1.5, 22.6] }), 2);
    // Small crest medallion on each side.
    P(new THREE.CircleGeometry(0.55, 16), "#ffffff", { at: [s * 1.84, 3.95 - 0.1, 23.2], dir: [s, 0, 0], axis: "z", texture: SUNBURST });
  }
  glow(
    P(new THREE.PlaneGeometry(2.0, 1.0), "#ffffff", { at: [0, 2.95, 25.53], dir: [0, 0, 1], axis: "z", texture: FRONT_WINDOWS }),
    1.4,
  );
  // Keel rail and bumper wheel.
  b.rod([0, 0.95, 8.5], [0, 0.95, 25], 0.12, GILT, { bone: hull, sides: 6 });
  P(new THREE.BoxGeometry(0.3, 0.6, 0.8), NAVY2, { at: [0, 0.7, 17] });
  P(new THREE.CylinderGeometry(0.45, 0.45, 0.3, 10), NAVY2, { at: [0, 0.45, 17], dir: [1, 0, 0] });
  P(new THREE.CylinderGeometry(0.2, 0.2, 0.32, 8), GILT, { at: [0, 0.45, 17], dir: [1, 0, 0] });
  // Searchlight under the bow.
  P(new THREE.CylinderGeometry(0.42, 0.34, 0.8, 10), GILT, { at: [0, 0.75, 23.8], dir: [0, -0.35, 1] });
  glow(P(new THREE.CircleGeometry(0.4, 12), "#fff2c4", { at: offset([0, 0.75, 23.8], [0, -0.35, 1], 0.42), dir: [0, -0.35, 1], axis: "z" }), 2);

  // ---------------------------------------------------------------- engine cars with propellers
  const CARS: { name: string; x: number; z: number }[] = [
    { name: "FL", x: 1, z: 5 },
    { name: "FR", x: -1, z: 5 },
    { name: "AL", x: 1, z: -10 },
    { name: "AR", x: -1, z: -10 },
  ];
  for (const c of CARS) {
    const r = hullR((c.z - Z0) / L);
    const cx = c.x * (r + 3.4);
    const cy = YC - 3;
    const center = new THREE.Vector3(cx, cy, c.z);
    b.capsule([cx, cy, c.z + 2.2], [cx, cy, c.z - 2.2], [0.9, 0.7], { bone: hull, color: carPaint, sides: 10, name: `car${c.name}` });
    P(new THREE.TorusGeometry(0.95, 0.12, 6, 14), GILT, { at: [cx, cy, c.z + 1.6], dir: [0, 0, 1], axis: "z" });
    P(new THREE.TorusGeometry(0.75, 0.1, 6, 14), GILT, { at: [cx, cy, c.z - 2.0], dir: [0, 0, 1], axis: "z" });
    // Struts to the hull.
    const toHull = new THREE.Vector3(0, YC, c.z).sub(center).normalize();
    for (const dz of [-1.4, 1.4]) {
      const end = new THREE.Vector3(0, YC, c.z + dz).sub(toHull.clone().multiplyScalar(r - 0.4));
      b.rod([cx, cy + 0.5, c.z + dz * 0.5], end, 0.13, GILT, { bone: hull, sides: 6 });
    }
    b.rod([cx, cy + 0.5, c.z - 1], [cx * 0.5, cy + 2.5 + c.x * 0, c.z + 1], 0.0, NAVY2, { bone: hull, sides: 4 });
    // Propeller on its own joint.
    const hub = [cx, cy, c.z - 3.3] as [number, number, number];
    const prop = b.joint(`prop${c.name}`, { parent: hull, at: hub, dir: [0, 0, -1], role: "fan" });
    b.part(new THREE.ConeGeometry(0.45, 0.9, 8), GILT, { bone: prop, at: [cx, cy, c.z - 3.6], dir: [0, 0, -1] });
    b.part(new THREE.BoxGeometry(0.34, 5.2, 0.1), bladePaint, { bone: prop, at: hub, dir: [0, 1, 0], up: [0, 0, 1] });
    b.part(new THREE.BoxGeometry(0.34, 5.2, 0.1), bladePaint, { bone: prop, at: hub, dir: [1, 0, 0], up: [0, 0, 1] });
    for (const d of [[0, 1, 0], [0, -1, 0], [1, 0, 0], [-1, 0, 0]] as [number, number, number][])
      b.part(new THREE.BoxGeometry(0.36, 0.5, 0.12), BRASS, { bone: prop, at: offset(hub, d, 2.4), dir: d, up: [0, 0, 1] });
  }

  // A rest pose with the propellers turned a little, each a different amount.
  CARS.forEach((c, i) => b.pose(`prop${c.name}`, { axis: [0, 0, 1], deg: 15 + i * 20 }));

  // Helper frame kept for riggers: nothing else to pose.
  void frame;
  return b.root;
}
