import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, paint, noise, mix, smoothstep, patches, svg, catmull } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Six-wheeled railgun carrier",
  description:
    "Low-poly sci-fi military 6x6 carrier with an elevated rail cannon, capacitor bank and four deployed stabiliser legs.",
};

type V = [number, number, number];
const D = Math.PI / 180;
const PI2 = Math.PI / 2;

export default function build() {
  const b = createBuilder({ name: "railgun_carrier" });

  // ---------------------------------------------------------------- colours & paints
  const CAMO = patches("#566a3b", ["#3f4d2c", "#7b7549", "#2c3523"], { size: 1.1, gap: 0 });
  const HULL = paint((p, n) => {
    let c = CAMO.at(p, n);
    const side = Math.abs(n.x) > 0.7;
    const front = Math.abs(n.z) > 0.7;
    const u = side ? p.z : p.x;
    const v = side || front ? p.y : p.z;
    const fu = (((u / 1.15) % 1) + 1) % 1;
    const fv = (((v / 0.6) % 1) + 1) % 1;
    if (fu < 0.02 || fv < 0.02) c = mix(c, "#15180f", 0.7);
    else if (fu < 0.04 || fv < 0.04) c = mix(c, "#b9c08a", 0.12);
    if (n.y > 0.6) c = mix(c, "#a8a47a", 0.14);
    const mud = smoothstep(2.0, 0.95, p.y) * smoothstep(0.35, 0.7, noise(p, 0.35, 5));
    c = mix(c, "#5b4a36", mud * 0.8);
    const soot = smoothstep(0.5, 0.8, noise(p, 0.2, 9)) * smoothstep(-0.2, 0.6, n.y) * 0.25;
    return mix(c, "#1b1b1b", soot * (p.y > 3 ? 1 : 0.3));
  });
  const STEEL = paint((p, n) =>
    mix(mix("#30343b", "#59606b", noise(p, 0.4, 2)), "#9aa3b0", smoothstep(0.6, 1, n.y) * 0.25),
  );
  const GUNM = paint((p, n) => {
    const c = mix("#2a2e35", "#4a515d", noise(p, 0.3, 7));
    const wear = smoothstep(0.62, 0.8, noise(p, 0.09, 4));
    return mix(mix(c, "#8b929e", wear * 0.35), "#6d7684", smoothstep(0.7, 1, n.y) * 0.2);
  });
  const TIRE = "#17181b", TIRE2 = "#26282c", DARK = "#202328", BOLT = "#8a8f98", CHROME = "#bcc3cf";
  const YELLOW = "#e8b923", RED = "#b3261e", CYAN = "#4fe8ff", AMBER = "#ffb02e", CERAMIC = "#d8d2bd";
  const HEAD = "#fff2b0", BRASS = "#b08d3a", GREEN = "#55ff7a", RAIL = "#6d7580";

  // ---------------------------------------------------------------- textures
  const WIND = svg(
    `<svg viewBox="0 0 100 50"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#16394d"/><stop offset="1" stop-color="#07151e"/></linearGradient></defs>
    <rect width="100" height="50" fill="#111"/><rect x="3" y="3" width="94" height="44" fill="url(#g)"/>
    <polygon points="12,3 28,3 14,47 3,47" fill="#9fd8ff" opacity="0.22"/><polygon points="34,3 40,3 26,47 20,47" fill="#9fd8ff" opacity="0.15"/>
    <rect x="48" y="3" width="4" height="44" fill="#111"/><rect x="3" y="40" width="94" height="7" fill="#0a0a0a" opacity="0.6"/></svg>`,
    { size: 256 },
  );
  const HAZARD = svg(
    `<svg viewBox="0 0 64 16"><defs><pattern id="p" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="16" fill="#151515"/></pattern></defs>
    <rect width="64" height="16" fill="#e8b923"/><rect width="64" height="16" fill="url(#p)"/><rect x="0.5" y="0.5" width="63" height="15" fill="none" stroke="#111" stroke-width="1.2"/></svg>`,
    { size: 256 },
  );
  const ROUNDEL = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#151a24" stroke="#e8e3d0" stroke-width="3"/><circle cx="32" cy="32" r="22" fill="none" stroke="#e8e3d0" stroke-width="1.5"/>
    <polygon points="32,10 37,25 53,25 40,35 45,50 32,41 19,50 24,35 11,25 27,25" fill="#e8b923" stroke="#111" stroke-width="1"/></svg>`,
    { size: 192 },
  );
  const STENCIL = svg(
    `<svg viewBox="0 0 120 40"><text x="60" y="31" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="32" fill="none" stroke="#111" stroke-width="5">RG-06</text>
    <text x="60" y="31" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="32" fill="#e9e4cf">RG-06</text></svg>`,
    { size: 256 },
  );
  const GRILLE = svg(
    `<svg viewBox="0 0 80 30"><rect width="80" height="30" fill="#0e0f11"/>${[0, 1, 2, 3, 4, 5]
      .map((i) => `<rect x="4" y="${3 + i * 4.3}" width="72" height="2.6" fill="#3a3f46"/><rect x="4" y="${3 + i * 4.3}" width="72" height="0.8" fill="#6c7380"/>`)
      .join("")}<rect x="1" y="1" width="78" height="28" fill="none" stroke="#555b66" stroke-width="2"/></svg>`,
    { size: 256 },
  );
  const WARN = svg(
    `<svg viewBox="0 0 60 70"><polygon points="30,4 57,52 3,52" fill="#e8b923" stroke="#111" stroke-width="4" stroke-linejoin="round"/>
    <polygon points="33,16 20,34 29,34 25,46 40,26 31,26" fill="#111"/><text x="30" y="66" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="13" fill="#eee">25kV</text></svg>`,
    { size: 192 },
  );
  const GUNLABEL = svg(
    `<svg viewBox="0 0 160 40"><rect width="160" height="40" fill="#1a1d22" opacity="0.85"/><rect x="2" y="2" width="156" height="36" fill="none" stroke="#8b929e" stroke-width="1.5"/>
    <text x="80" y="25" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="14" fill="#d8d8d0">MK-IX RAILGUN 120MJ</text>
    <path d="M6 8 l8 12 l-8 12 M16 8 l8 12 l-8 12 M154 8 l-8 12 l8 12 M144 8 l-8 12 l8 12" stroke="#b3261e" stroke-width="3" fill="none"/></svg>`,
    { size: 256 },
  );
  const SCREEN = svg(
    `<svg viewBox="0 0 64 40"><rect width="64" height="40" fill="#03161c"/><rect x="2" y="2" width="60" height="36" fill="none" stroke="#4fe8ff" stroke-width="1"/>
    ${[0, 1, 2, 3, 4, 5, 6].map((i) => `<rect x="${6 + i * 8}" y="${34 - (6 + ((i * 7) % 5) * 5)}" width="5" height="${6 + ((i * 7) % 5) * 5}" fill="#4fe8ff"/>`).join("")}
    <polyline points="4,12 16,9 28,14 40,7 60,10" stroke="#55ff7a" stroke-width="1.4" fill="none"/></svg>`,
    { size: 192 },
  );

  // ---------------------------------------------------------------- helpers
  const P = (geo: THREE.BufferGeometry, color: any, pos: V, rot: V = [0, 0, 0], opts: any = {}) => {
    if (rot[0]) geo.rotateX(rot[0]);
    if (rot[1]) geo.rotateY(rot[1]);
    if (rot[2]) geo.rotateZ(rot[2]);
    geo.translate(pos[0], pos[1], pos[2]);
    return b.part(geo, color, { at: [0, 0, 0], flat: true, ...opts });
  };
  const box = (w: number, h: number, d: number, c: any, pos: V, rot: V = [0, 0, 0]) =>
    P(new THREE.BoxGeometry(w, h, d), c, pos, rot);
  const cyl = (r: number, h: number, seg: number, c: any, pos: V, axis: "x" | "y" | "z" = "y", r2?: number) =>
    P(new THREE.CylinderGeometry(r2 ?? r, r, h, seg), c, pos, axis === "x" ? [0, 0, PI2] : axis === "z" ? [PI2, 0, 0] : [0, 0, 0]);
  const decal = (tex: THREE.Texture, w: number, h: number, pos: V, nrm: V) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at: pos, dir: nrm, axis: "z", texture: tex });
  const flush = (list: THREE.BufferGeometry[], color: any) => {
    if (list.length) b.part(mergeGeometries(list)!, color, { at: [0, 0, 0], flat: true });
  };

  const bolts: THREE.BufferGeometry[] = [];
  const bolt = (x: number, y: number, z: number, ax: "x" | "y" | "z", sg = 1) => {
    const g = new THREE.CylinderGeometry(0.035, 0.035, 0.03, 6);
    if (ax === "x") g.rotateZ(PI2);
    if (ax === "z") g.rotateX(PI2);
    const o = sg * 0.012;
    g.translate(x + (ax === "x" ? o : 0), y + (ax === "y" ? o : 0), z + (ax === "z" ? o : 0));
    bolts.push(g);
  };

  // ---------------------------------------------------------------- hull
  const SH: any = "sharp";
  void SH;
  b.extrude(
    [[-5.5, 1.0], [5.3, 1.0], [5.75, 1.45], [5.75, 1.95], [5.4, 2.0], [-5.4, 2.0], [-5.5, 1.9]],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.4, bevel: 0.05, color: HULL },
  );
  // cab
  b.extrude(
    [[2.6, 2.0], [4.9, 2.0], [4.9, 2.4], [4.15, 3.25], [2.8, 3.25], [2.6, 3.0]],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.1, bevel: 0.05, color: HULL },
  );
  // chassis frame, driveshaft
  for (const s of [1, -1]) box(0.3, 0.32, 10.4, DARK, [s * 0.8, 0.88, 0]);
  cyl(0.07, 9, 6, STEEL, [0, 0.78, -0.4], "z");
  box(1.4, 0.2, 9.8, DARK, [0, 0.92, 0]);

  // windows
  decal(WIND, 1.85, 0.95, [0, 2.825 + 0.664 * 0.012, 4.525 + 0.752 * 0.012], [0, 0.664, 0.752]);
  for (const s of [1, -1]) {
    decal(WIND, 1.0, 0.5, [s * 1.064, 2.75, 3.5], [s, 0, 0]);
    box(0.04, 0.8, 0.05, DARK, [s * 1.06, 2.6, 2.95]);
    box(0.04, 0.8, 0.05, DARK, [s * 1.06, 2.6, 4.08]);
    box(0.06, 0.06, 0.22, CHROME, [s * 1.08, 2.45, 3.9]); // handle
    // mirror
    box(0.4, 0.05, 0.05, DARK, [s * 1.25, 2.85, 4.25]);
    box(0.06, 0.4, 0.26, DARK, [s * 1.45, 2.85, 4.25]);
    decal(ROUNDEL, 0.8, 0.8, [s * 1.215, 1.5, 1.7], [s, 0, 0]);
    decal(HAZARD, 2.2, 0.16, [s * 1.215, 1.12, 1.7], [s, 0, 0]);
  }
  // visor, roof
  box(2.0, 0.06, 0.4, DARK, [0, 3.3, 4.2]);
  box(1.5, 0.12, 0.2, DARK, [0, 3.31, 4.42]);
  glow(box(1.3, 0.08, 0.1, AMBER, [0, 3.32, 4.55]), 1.3);
  cyl(0.28, 0.08, 8, STEEL, [0.45, 3.29, 3.2]); // hatch
  cyl(0.18, 0.05, 8, DARK, [0.45, 3.35, 3.2]);
  // roof saddle for the gun
  for (const s of [1, -1]) {
    box(0.25, 0.95, 0.45, STEEL, [s * 0.42, 3.72, 3.4]);
    box(0.34, 0.1, 0.55, DARK, [s * 0.42, 4.2, 3.4]);
  }
  box(1.3, 0.15, 0.6, DARK, [0, 3.3, 3.4]);
  // radar mast + dish
  cyl(0.06, 0.7, 6, DARK, [-0.8, 3.6, 3.0]);
  box(0.3, 0.2, 0.3, DARK, [-0.8, 3.98, 3.0]);
  b.lathe([[0, 0], [0.28, 0.06], [0.36, 0.14], [0.33, 0.15], [0.26, 0.08], [0, 0.03]], {
    at: [-0.8, 4.1, 3.12],
    axis: new THREE.Vector3(0, 0.3, 1).normalize().toArray() as V,
    segments: 10,
    color: STEEL,
  });
  cyl(0.02, 0.2, 5, CHROME, [-0.8, 4.12, 3.28], "z");
  // whip antennas
  for (const s of [1, -1]) {
    cyl(0.1, 0.12, 6, DARK, [s * 0.95, 3.31, 2.85]);
    b.rod([s * 0.95, 3.35, 2.85], [s * 1.05, 5.0, 2.7], [0.025, 0.008], DARK);
  }
  // EO ball
  P(new THREE.SphereGeometry(0.2, 8, 6), DARK, [0.9, 3.45, 3.9]);
  glow(P(new THREE.SphereGeometry(0.07, 6, 4), CYAN, [0.9, 3.46, 4.08]), 1.5);

  // nose
  decal(GRILLE, 1.1, 0.42, [0, 1.52, 5.765], [0, 0, 1]);
  for (const s of [1, -1]) {
    box(0.55, 0.32, 0.08, DARK, [s * 0.85, 1.82, 5.775]);
    glow(box(0.42, 0.22, 0.05, HEAD, [s * 0.85, 1.82, 5.82]), 1.4);
    glow(box(0.14, 0.08, 0.05, AMBER, [s * 1.1, 1.45, 5.78]), 1);
    cyl(0.07, 0.22, 6, CHROME, [s * 0.75, 1.1, 6.0], "z"); // tow hook
  }
  box(2.6, 0.3, 0.35, DARK, [0, 1.1, 5.8]);
  decal(HAZARD, 2.5, 0.2, [0, 1.1, 5.98], [0, 0, 1]);
  cyl(0.14, 0.7, 8, STEEL, [0, 1.33, 5.95], "x"); // winch drum
  for (let i = 0; i < 4; i++) box(0.8, 0.02, 0.1, DARK, [0, 2.03, 5.2 - i * 0.18]); // hood vents
  for (let i = 0; i < 4; i++) box(0.8, 0.02, 0.1, DARK, [0, 2.03, 5.2 - i * 0.18 + 0.0]);
  for (const s of [1, -1]) {
    // wipers
    b.rod([s * 0.5, 2.55, 4.75], [s * 0.05, 2.7, 4.7], 0.012, DARK);
  }

  // rear
  for (const s of [1, -1]) {
    glow(box(0.3, 0.2, 0.06, RED, [s * 1.0, 1.7, -5.53]), 1.3);
    b.rod([s * 0.35, 1.0, -5.6], [s * 0.35, 2.3, -5.6], 0.03, STEEL);
  }
  for (let i = 0; i < 5; i++) box(0.7, 0.03, 0.04, STEEL, [0, 1.2 + i * 0.22, -5.6]);
  decal(WARN, 0.5, 0.58, [0, 1.55, -5.515], [0, 0, -1]);
  box(0.4, 0.2, 0.18, DARK, [0, 1.25, -5.6]); // tow eye block
  cyl(0.09, 0.1, 8, CHROME, [0, 1.25, -5.72], "z");

  // deck equipment
  for (const s of [1, -1]) {
    box(1.0, 0.55, 1.5, HULL, [s * 0.65, 2.28, 1.35]);
    decal(HAZARD, 1.0, 0.12, [s * 0.65, 2.1, 2.1], [0, 0, 1]);
    for (const dz of [-0.55, 0, 0.55]) box(0.04, 0.5, 0.04, DARK, [s * 0.65 + 0.3, 2.28, 1.35 + dz]);
    bolt(s * 0.65, 2.555, 1.0, "y"); bolt(s * 0.65, 2.555, 1.7, "y");
  }
  // exhaust stack
  cyl(0.11, 1.5, 8, STEEL, [-1.0, 2.75, 2.35]);
  cyl(0.15, 0.08, 8, DARK, [-1.0, 3.55, 2.35]);
  cyl(0.16, 0.5, 8, DARK, [-1.0, 2.4, 2.35]);
  // deck rails
  for (const s of [1, -1]) {
    for (const z of [0.0, 1.0, 2.1]) b.rod([s * 1.12, 2.0, z], [s * 1.12, 2.5, z], 0.02, STEEL);
    b.rod([s * 1.12, 2.5, -0.1], [s * 1.12, 2.5, 2.1], 0.02, STEEL);
  }

  // ---------------------------------------------------------------- turret
  cyl(1.2, 0.35, 12, DARK, [0, 2.18, -1.5]);
  cyl(1.28, 0.08, 12, STEEL, [0, 2.38, -1.5]);
  b.extrude([[-2.7, 2.35], [-0.5, 2.35], [-0.2, 2.7], [-0.2, 3.35], [-2.4, 3.35], [-2.7, 3.0]], {
    at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.3, bevel: 0.05, color: HULL,
  });
  cyl(0.3, 0.1, 8, STEEL, [-0.6, 3.4, -2.2]); // hatch
  cyl(0.2, 0.06, 8, DARK, [-0.6, 3.46, -2.2]);
  box(0.3, 0.2, 0.2, DARK, [0.6, 3.44, -2.0]); // periscope
  glow(box(0.22, 0.05, 0.04, CYAN, [0.6, 3.46, -1.89]), 1.2);
  for (const s of [1, -1]) {
    decal(STENCIL, 1.3, 0.43, [s * 1.156, 3.0, -1.45], [s, 0, 0]);
    decal(HAZARD, 2.0, 0.14, [s * 1.156, 2.5, -1.5], [s, 0, 0]);
    glow(decal(SCREEN, 0.5, 0.32, [s * 1.158, 2.85, -0.6], [s, 0, 0]) as any, 1);
    for (let i = 0; i < 3; i++) {
      // smoke launchers
      cyl(0.06, 0.4, 6, DARK, [s * 1.2, 3.1 + i * 0.0, -0.4 - i * 0.14], "z");
    }
    for (const z of [-2.3, -0.7]) for (const y of [2.6, 3.2]) bolt(s * 1.15, y, z, "x", s);
    // trunnion cheeks
    box(0.2, 1.3, 1.2, STEEL, [s * 1.0, 4.0, -1.4]);
    box(0.28, 0.2, 1.3, DARK, [s * 1.0, 3.45, -1.4]);
    cyl(0.32, 0.12, 8, DARK, [s * 1.1, 4.05, -1.4], "x");
    bolt(s * 1.1, 4.05, -1.4, "x", s);
  }

  // ---------------------------------------------------------------- railgun (gun-local space, pitched 7°)
  const PIV = new THREE.Vector3(0, 4.05, -1.4);
  const GM = new THREE.Matrix4()
    .makeTranslation(PIV.x, PIV.y, PIV.z)
    .multiply(new THREE.Matrix4().makeRotationX(-7 * D));
  const gp = (geo: THREE.BufferGeometry, color: any, pos: V, rot: V = [0, 0, 0], opts: any = {}) => {
    if (rot[0]) geo.rotateX(rot[0]);
    if (rot[1]) geo.rotateY(rot[1]);
    if (rot[2]) geo.rotateZ(rot[2]);
    geo.translate(pos[0], pos[1], pos[2]);
    geo.applyMatrix4(GM);
    return b.part(geo, color, { at: [0, 0, 0], flat: true, ...opts });
  };
  const gb = (w: number, h: number, d: number, c: any, pos: V, rot: V = [0, 0, 0]) =>
    gp(new THREE.BoxGeometry(w, h, d), c, pos, rot);
  const gcyl = (r: number, h: number, seg: number, c: any, pos: V, axis: "x" | "z") =>
    gp(new THREE.CylinderGeometry(r, r, h, seg), c, pos, axis === "x" ? [0, 0, PI2] : [PI2, 0, 0]);
  const g2m = (x: number, y: number, d: number) => new THREE.Vector3(x, y, d).applyMatrix4(GM).toArray() as V;

  gcyl(0.26, 1.8, 8, STEEL, [0, 0, 0], "x"); // trunnion axle
  gb(1.5, 1.1, 1.5, GUNM, [0, 0, -1.15]); // breech
  gb(1.0, 0.35, 1.0, STEEL, [0, 0.72, -1.15]);
  for (const d of [-1.5, -1.15, -0.8]) {
    gcyl(0.13, 1.0, 8, STEEL, [0, 0.98, d], "x");
    for (const s of [1, -1]) glow(gcyl(0.08, 0.04, 6, CYAN, [s * 0.52, 0.98, d], "x"), 1.2);
  }
  gb(1.3, 0.9, 0.15, DARK, [0, 0, -1.97]); // rear plate
  for (const s of [1, -1]) {
    gcyl(0.12, 0.2, 8, BRASS, [s * 0.4, 0.1, -2.1], "z");
    gcyl(0.06, 0.1, 6, DARK, [s * 0.4, 0.1, -2.22], "z");
  }
  gb(1.3, 0.95, 3.0, GUNM, [0, 0, 1.1]); // shroud
  gb(0.6, 0.12, 2.6, STEEL, [0, 0.52, 1.1]);
  gb(0.4, 0.3, 0.4, DARK, [0.35, 0.65, 2.2]); // sensor
  glow(gb(0.2, 0.1, 0.04, CYAN, [0.35, 0.66, 2.42]), 1.3);
  for (const s of [1, -1]) {
    gp(new THREE.PlaneGeometry(1.8, 0.45).rotateY(s * PI2), "#ffffff", [s * 0.662, 0.0, 1.1], [0, 0, 0], { texture: GUNLABEL, flat: false });
    for (let i = 0; i < 4; i++) gb(0.03, 0.2, 0.3, DARK, [s * 0.655, -0.3 + 0, 1.7 + i * 0.22 - 0.5]);
    // recoil cylinders
    gcyl(0.1, 2.4, 8, STEEL, [s * 0.45, -0.62, 1.2], "z");
    gcyl(0.06, 1.2, 6, CHROME, [s * 0.45, -0.62, 2.9], "z");
    // elevation ram
    const a = [s * 0.8, 3.45, -1.9] as V;
    const c2 = g2m(s * 0.7, -0.5, -0.7);
    b.rod(a, c2, 0.09, STEEL);
    b.rod(a, [a[0], a[1] + (c2[1] - a[1]) * 0.45, a[2] + (c2[2] - a[2]) * 0.45], 0.14, DARK);
    cyl(0.14, 0.2, 8, DARK, a, "x");
  }
  // rails
  const RL = 6.8, RC = 5.5;
  for (const s of [1, -1]) {
    gb(0.3, 0.44, RL, RAIL, [s * 0.3, 0.08, RC]);
    gb(0.32, 0.05, RL, CHROME, [s * 0.3, 0.325, RC]);
    glow(gb(0.04, 0.28, RL - 0.4, CYAN, [s * 0.147, 0.08, RC]), 1.4);
    gb(0.34, 0.04, 0.5, YELLOW, [s * 0.3, 0.35, 8.55]);
  }
  for (let k = 0; k < 7; k++) {
    const d = 2.7 + k * 0.95;
    gb(0.34, 0.32, 0.22, CERAMIC, [0, 0.08, d]);
    gb(0.38, 0.06, 0.1, BRASS, [0, 0.08, d]);
  }
  for (let k = 0; k < 6; k++) {
    const d = 3.1 + k * 1.1;
    gb(1.25, 0.09, 0.24, GUNM, [0, 0.38, d]);
    gb(1.25, 0.09, 0.24, GUNM, [0, -0.22, d]);
    for (const s of [1, -1]) {
      gb(0.09, 0.6, 0.24, GUNM, [s * 0.58, 0.08, d]);
      gb(0.12, 0.12, 0.28, STEEL, [s * 0.58, -0.12, d]);
    }
  }
  // muzzle
  const MD = 9.05;
  gb(1.3, 0.14, 0.5, STEEL, [0, 0.4, MD]);
  gb(1.3, 0.14, 0.5, STEEL, [0, -0.24, MD]);
  for (const s of [1, -1]) {
    gb(0.14, 0.78, 0.5, STEEL, [s * 0.64, 0.08, MD]);
    gb(0.08, 0.9, 0.8, GUNM, [s * 0.84, 0.08, MD - 0.1], [0, s * -0.22, 0]);
    gb(0.16, 0.16, 0.16, RED, [s * 0.64, 0.4, MD + 0.28]);
  }
  glow(gb(0.24, 0.24, 0.3, CYAN, [0, 0.08, MD - 0.1]), 1.6);

  // capacitor bank behind the turret
  box(1.9, 0.15, 1.8, DARK, [0, 2.08, -4.5]);
  for (const x of [-0.6, 0, 0.6])
    for (const z of [-4.9, -4.1]) {
      cyl(0.2, 0.85, 8, STEEL, [x, 2.55, z]);
      cyl(0.22, 0.08, 8, DARK, [x, 2.4, z]);
      glow(cyl(0.12, 0.05, 6, CYAN, [x, 3.0, z]), 1.5);
      bolt(x, 3.03, z - 0.0, "y");
    }
  box(1.9, 0.06, 0.1, YELLOW, [0, 2.2, -3.55]);
  // cables capacitor -> breech
  for (const x of [-0.6, 0, 0.6]) {
    const end = g2m(x * 0.6, -0.1, -2.1);
    b.sweep(catmull([[x, 3.05, -4.9], [x, 3.4, -4.7], [end[0], end[1] - 0.2, end[2] - 0.35], end]), 0.045, { color: DARK, sides: 6 });
  }

  // ---------------------------------------------------------------- suspension, fenders, wheels
  const treads: THREE.BufferGeometry[] = [], lugs: THREE.BufferGeometry[] = [], spokes: THREE.BufferGeometry[] = [];
  const wheel = (x: number, z: number, s: number) => {
    cyl(0.75, 0.5, 14, TIRE, [x, 0.75, z], "x");
    cyl(0.5, 0.56, 12, STEEL, [x, 0.75, z], "x");
    cyl(0.43, 0.6, 12, DARK, [x + s * 0.0, 0.75, z], "x");
    cyl(0.2, 0.7, 8, STEEL, [x, 0.75, z], "x");
    P(new THREE.ConeGeometry(0.17, 0.14, 8), CHROME, [x + s * 0.4, 0.75, z], [0, 0, -s * PI2]);
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      const g = new THREE.BoxGeometry(0.4, 0.11, 0.2);
      g.translate((i % 2 ? 0.08 : -0.08), 0.74, 0);
      g.rotateX(a);
      g.translate(x, 0.75, z);
      treads.push(g);
    }
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const g = new THREE.CylinderGeometry(0.04, 0.04, 0.05, 6);
      g.rotateZ(PI2);
      g.translate(s * 0.31, 0.3, 0);
      g.rotateX(a);
      g.translate(x, 0.75, z);
      lugs.push(g);
    }
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.2;
      const g = new THREE.BoxGeometry(0.03, 0.2, 0.09);
      g.translate(s * 0.29, 0.34, 0);
      g.rotateX(a);
      g.translate(x, 0.75, z);
      spokes.push(g);
    }
    // fender
    box(0.72, 0.1, 1.7, HULL, [x, 1.65, z]);
    for (const e of [1, -1]) box(0.72, 0.1, 0.5, HULL, [x, 1.54, z + e * 0.98], [e * 0.5, 0, 0]);
    box(0.06, 0.2, 1.7, HULL, [x + s * 0.33, 1.58, z]);
    box(0.66, 0.5, 0.05, TIRE2, [x, 1.2, z - 0.95]); // mud flap
    bolt(x, 1.71, z + 0.5, "y"); bolt(x, 1.71, z - 0.5, "y");
  };
  for (const z of [3.6, -2.4, -4.2]) {
    cyl(0.13, 2.8, 8, STEEL, [0, 0.75, z], "x");
    P(new THREE.SphereGeometry(0.32, 8, 6), STEEL, [0, 0.72, z]);
    for (const s of [1, -1]) {
      box(0.2, 0.1, 1.4, DARK, [s * 0.95, 0.98, z]);
      box(0.3, 0.06, 0.1, STEEL, [s * 0.95, 0.88, z - 0.2]);
      box(0.3, 0.06, 0.1, STEEL, [s * 0.95, 0.88, z + 0.2]);
      wheel(s * 1.58, z, s);
    }
  }
  b.rod([-1.0, 0.7, 3.9], [1.0, 0.7, 3.9], 0.03, STEEL); // tie rod
  for (const s of [1, -1]) box(0.2, 0.3, 2.2, DARK, [s * 1.05, 0.85, -3.3]); // walking beams
  flush(treads, TIRE2);
  flush(lugs, BOLT);
  flush(spokes, CHROME);

  // fuel tank & kit on sides
  cyl(0.3, 1.4, 8, DARK, [1.52, 1.2, -0.8], "z");
  for (const dz of [-0.4, 0.4]) cyl(0.32, 0.08, 8, STEEL, [1.52, 1.2, -0.8 + dz], "z");
  box(0.5, 0.35, 1.0, HULL, [-1.5, 1.3, -0.7]);
  for (const dz of [-0.35, 0.35]) {
    box(0.1, 0.4, 0.3, "#6b7a3c", [-1.5, 1.55, -0.7 + dz]);
    box(0.12, 0.05, 0.15, DARK, [-1.5, 1.8, -0.7 + dz]);
  }
  box(0.04, 0.15, 0.4, DARK, [-1.77, 1.3, -0.7]);

  // ---------------------------------------------------------------- stabiliser legs
  const leg = (s: number, z: number) => {
    box(0.4, 0.75, 0.9, DARK, [s * 1.33, 1.45, z]);
    box(1.6, 0.38, 0.5, STEEL, [s * 2.0, 1.45, z]);
    box(1.6, 0.06, 0.4, YELLOW, [s * 2.0, 1.66, z]);
    cyl(0.22, 1.0, 8, STEEL, [s * 2.65, 1.1, z]);
    cyl(0.245, 0.14, 8, YELLOW, [s * 2.65, 1.42, z]);
    cyl(0.245, 0.14, 8, YELLOW, [s * 2.65, 0.82, z]);
    cyl(0.13, 0.56, 8, CHROME, [s * 2.65, 0.42, z]);
    P(new THREE.SphereGeometry(0.2, 8, 6), DARK, [s * 2.65, 0.22, z]);
    cyl(0.55, 0.16, 10, "#33363c", [s * 2.65, 0.08, z]);
    for (let i = 0; i < 4; i++) {
      const a = i * PI2;
      box(0.08, 0.1, 0.45, STEEL, [s * 2.65 + Math.sin(a) * 0.3, 0.2, z + Math.cos(a) * 0.3], [0, a, 0]);
    }
    b.rod([s * 1.25, 1.1, z], [s * 2.55, 0.85, z], 0.07, STEEL);
    b.sweep(catmull([[s * 1.9, 1.3, z + 0.25], [s * 2.2, 0.95, z + 0.4], [s * 2.5, 0.95, z + 0.2], [s * 2.6, 1.15, z + 0.15]]), 0.035, { color: DARK, sides: 6 });
    glow(box(0.1, 0.08, 0.08, GREEN, [s * 2.78, 1.66, z]), 1.3);
    for (const dx of [-0.6, 0.6]) bolt(s * 2.0 + dx, 1.64, z - 0.15, "y");
    bolt(s * 1.33, 1.83, z + 0.3, "y"); bolt(s * 1.33, 1.83, z - 0.3, "y");
    decal(WARN, 0.3, 0.35, [s * 2.0, 1.45, z + 0.252], [0, 0, 1]);
  };
  for (const s of [1, -1]) {
    leg(s, 0.6);
    leg(s, -5.2);
  }

  flush(bolts, BOLT);
  return b.root;
}
