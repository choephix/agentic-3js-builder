import * as THREE from "three";
import { createBuilder, svg, catmull, polyline, noise, mix, rgb, smoothstep, paint } from "../../../../src/index";
import type { Fill, Joint, Paint } from "../../../../src/index";
import { metal } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export const meta = {
  name: "Hammerfall RG-6 Railgun Carrier",
  description:
    "Six-wheeled low-poly sci-fi military railgun carrier, deployed: four hydraulic stabiliser legs planted on hazard pads, a rear recoil spade, and a camo-painted turret holding a 9 m twin-rail gun with glowing coils, elevated 22 degrees.",
};

type V = [number, number, number];
type Extra = { rotation?: V; dir?: V; quat?: THREE.Quaternion; flat?: boolean; axis?: "x" | "y" | "z"; up?: V };

const fract = (x: number) => x - Math.floor(x);

// ---------------------------------------------------------------- paints
/** Camo hull paint: three-tone blotches, riveted panel seams, warm-top / cool-bottom light, mud near the ground, chipped edges. */
function hullPaint(): Paint {
  const cu = 1.1;
  const cv = 0.75;
  return paint((p, n) => {
    const big = noise(p, 2.2, 5);
    const mid = noise(p, 0.9, 9);
    let c = rgb("#566349");
    c = mix(c, "#364232", smoothstep(0.5, 0.56, big));
    c = mix(c, "#8f8561", smoothstep(0.6, 0.66, mid) * smoothstep(0.52, 0.4, big));
    const ax = Math.abs(n.x);
    const ay = Math.abs(n.y);
    const az = Math.abs(n.z);
    const [u, v] = ax >= ay && ax >= az ? [p.z, p.y] : ay >= az ? [p.x, p.z] : [p.x, p.y];
    const du = fract(u / cu) * cu;
    const dv = fract(v / cv) * cv;
    const rv = (x: number) => (fract(x / 0.14) - 0.5) * 0.14;
    if (du < 0.012 || dv < 0.012) c = mix(c, "#14171a", 0.75);
    else if (du < 0.03 || dv < 0.03) c = mix(c, "#f4f0d8", 0.07);
    else if (Math.hypot(du - 0.045, rv(v)) < 0.014 || Math.hypot(dv - 0.045, rv(u)) < 0.014) c = mix(c, "#cfcfb8", 0.45);
    if (noise(p, 0.08, 7) > 0.8 && ay < 0.6) c = mix(c, "#6b6254", 0.55);
    const lit = 0.82 + 0.22 * smoothstep(-0.8, 0.9, n.y);
    c = [c[0] * lit * (1 + 0.04 * n.y), c[1] * lit, c[2] * lit * (1 - 0.04 * n.y)];
    const dirt = smoothstep(2.0, 0.9, p.y) * smoothstep(0.35, 0.7, noise(p, 0.35, 3));
    return mix(c, "#6e5d46", dirt * 0.7);
  });
}

const TYREP = paint((p) => {
  const mud = smoothstep(1.0, 0.2, p.y) * smoothstep(0.3, 0.65, noise(p, 0.3, 11));
  return mix(mix("#1a1c1f", "#2b2d30", noise(p, 0.14, 3)), "#6b5a43", mud * 0.8);
});
const DECKP = paint((p) => mix("#2a2e33", "#40454b", noise(p, 0.22, 2)));

export default function build() {
  const b = createBuilder({ name: "railgun_carrier", paintSize: 2048 });

  // ---------------------------------------------------------------- palette
  const HULL = hullPaint();
  const IRON = metal("iron", { tarnish: 0.3 });
  const STEEL = metal("steel", { tarnish: 0.1 });
  const BLUED = metal("blued", { polish: 0.5, size: 0.4, seed: 7 });
  const STEELC = "#98a2ad";
  const DARKC = "#23282d";
  const GUNC = "#3d454e";
  const RUBBER = "#16181b";
  const AMBER = "#f0a818";
  const CYAN = "#4fe8ff";
  const REDL = "#ff3b2b";
  const HEAD = "#fff3c4";

  // ---------------------------------------------------------------- textures
  const chevPaths: string[] = [];
  for (let i = 0; i < 12; i++)
    chevPaths.push(`<path d="M${i * 14 - 4} 16 L${i * 14 + 4} 0 L${i * 14 + 12} 0 L${i * 14 + 4} 16Z" fill="#dcdcd0"/>`);
  const CHEV_SVG = `<svg viewBox="0 0 160 16" xmlns="http://www.w3.org/2000/svg"><rect width="160" height="16" fill="#b8281f"/>${chevPaths.join("")}</svg>`;
  const T = {
    hazard: svg(
      `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="h" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="9" height="18" fill="#f2b705"/><rect x="9" width="9" height="18" fill="#1b1d20"/></pattern></defs><rect width="64" height="64" fill="url(#h)"/><rect x="1" y="1" width="62" height="62" fill="none" stroke="#1b1d20" stroke-width="2"/></svg>`,
      { size: 128 },
    ),
    hazStrip: svg(
      `<svg viewBox="0 0 160 10" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="h" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="14" fill="#f2b705"/><rect x="7" width="7" height="14" fill="#1b1d20"/></pattern></defs><rect width="160" height="10" fill="url(#h)"/></svg>`,
      { size: 512 },
    ),
    redChev: svg(CHEV_SVG, { size: 512 }),
    emblem: svg(
      `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="46" fill="#1c2530" stroke="#e9e1bf" stroke-width="4"/><circle cx="50" cy="50" r="38" fill="none" stroke="#e9e1bf" stroke-width="1.5" stroke-dasharray="3 3"/><path d="M20 70 L50 40 L80 70 L70 70 L50 52 L30 70Z" fill="#e8a317"/><path d="M24 82 L50 56 L76 82 L68 82 L50 66 L32 82Z" fill="#e8a317" opacity="0.75"/><path d="M54 14 L38 50 L49 50 L43 78 L64 40 L52 40Z" fill="#46e6ff" stroke="#0c1a22" stroke-width="1.5" stroke-linejoin="round"/><path d="M50 8 l2.6 5.4 5.9 .8 -4.3 4.1 1 5.9 -5.2 -2.8 -5.2 2.8 1 -5.9 -4.3 -4.1 5.9 -.8Z" fill="#e9e1bf" transform="translate(0 -1) scale(1)"/></svg>`,
      { size: 256 },
    ),
    stencil: svg(
      `<svg viewBox="0 0 300 60" xmlns="http://www.w3.org/2000/svg"><text x="4" y="38" font-family="monospace" font-weight="bold" font-size="40" fill="#e9e4d0" opacity="0.92" letter-spacing="3">HAMMERFALL</text><text x="6" y="56" font-family="monospace" font-weight="bold" font-size="14" fill="#e8a317" opacity="0.92" letter-spacing="4">RG-06  /  3RD BTRY</text><rect x="268" y="6" width="26" height="26" fill="none" stroke="#e9e4d0" stroke-width="3" opacity="0.9"/><text x="273" y="27" font-family="monospace" font-weight="bold" font-size="20" fill="#e9e4d0" opacity="0.9">6</text></svg>`,
      { size: 768 },
    ),
    screen: svg(
      `<svg viewBox="0 0 160 100" xmlns="http://www.w3.org/2000/svg"><rect width="160" height="100" fill="#03141a"/><g stroke="#0e5260" stroke-width="0.6">${Array.from({ length: 9 }, (_, i) => `<path d="M${i * 20} 0 V100"/>`).join("")}${Array.from({ length: 6 }, (_, i) => `<path d="M0 ${i * 20} H160"/>`).join("")}</g><circle cx="58" cy="50" r="34" fill="none" stroke="#4fe8ff" stroke-width="1.5"/><circle cx="58" cy="50" r="18" fill="none" stroke="#4fe8ff" stroke-width="1"/><path d="M58 10 V90 M18 50 H98" stroke="#4fe8ff" stroke-width="1"/><path d="M44 36 L52 44 M72 36 L64 44" stroke="#f0a818" stroke-width="2"/><rect x="112" y="12" width="12" height="76" fill="none" stroke="#4fe8ff"/><rect x="114" y="34" width="8" height="52" fill="#4fe8ff"/><text x="130" y="24" font-family="monospace" font-size="9" fill="#4fe8ff">CHG</text><text x="130" y="38" font-family="monospace" font-size="10" font-weight="bold" fill="#f0a818">87%</text><text x="130" y="86" font-family="monospace" font-size="8" fill="#ff6b4a">ARMED</text><rect x="1" y="1" width="158" height="98" fill="none" stroke="#4fe8ff" stroke-width="2"/></svg>`,
      { size: 512 },
    ),
    warn: svg(
      `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M50 6 L96 90 L4 90Z" fill="#f2b705" stroke="#16181b" stroke-width="6" stroke-linejoin="round"/><path d="M56 30 L38 58 L49 58 L43 80 L64 50 L52 50Z" fill="#16181b"/></svg>`,
      { size: 128 },
    ),
    windshield: svg(
      `<svg viewBox="0 0 200 90" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2c5262"/><stop offset="1" stop-color="#0b1a22"/></linearGradient></defs><rect x="2" y="2" width="196" height="86" rx="8" fill="#14181c"/><rect x="8" y="8" width="88" height="74" rx="4" fill="url(#g)"/><rect x="104" y="8" width="88" height="74" rx="4" fill="url(#g)"/><path d="M20 82 L50 8 L64 8 L34 82Z" fill="#9fd8e8" opacity="0.2"/><path d="M116 82 L146 8 L154 8 L124 82Z" fill="#9fd8e8" opacity="0.2"/><path d="M12 80 L80 40 M108 80 L176 40" stroke="#0a0d10" stroke-width="2.5"/></svg>`,
      { size: 512 },
    ),
    sideWin: svg(
      `<svg viewBox="0 0 100 55" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2c5262"/><stop offset="1" stop-color="#0b1a22"/></linearGradient></defs><rect x="1" y="1" width="98" height="53" rx="6" fill="#14181c"/><rect x="5" y="5" width="90" height="45" rx="3" fill="url(#g)"/><path d="M18 50 L42 5 L54 5 L30 50Z" fill="#9fd8e8" opacity="0.2"/></svg>`,
      { size: 256 },
    ),
    kills: svg(
      `<svg viewBox="0 0 160 40" xmlns="http://www.w3.org/2000/svg">${Array.from(
        { length: 9 },
        (_, i) =>
          `<circle cx="${14 + i * 17}" cy="20" r="6.5" fill="none" stroke="#e9e4d0" stroke-width="2.6"/><circle cx="${14 + i * 17}" cy="20" r="2.2" fill="#d23a2a"/>`,
      ).join("")}<path d="M6 36 H154" stroke="#e8a317" stroke-width="2"/></svg>`,
      { size: 512 },
    ),
  };

  // ---------------------------------------------------------------- helpers
  const blk = (bone: Joint, w: number, h: number, d: number, at: V, color: Fill, o: Extra = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, ...o });
  const cy = (bone: Joint, r: number, h: number, sides: number, at: V, color: Fill, o: Extra = {}) =>
    b.part(new THREE.CylinderGeometry(r, r, h, sides), color, { bone, at, flat: true, ...o });
  const rod = (bone: Joint, a: V, c: V, r: number, color: Fill, sides = 6) => b.rod(a, c, r, color, { bone, sides });
  const plane = (bone: Joint, w: number, h: number, tex: THREE.Texture, at: V, dir: V) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone, at, dir, axis: "z", texture: tex });
  const X: V = [1, 0, 0];
  const sideQ = (s: number) => new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), (s * Math.PI) / 2);

  // ---------------------------------------------------------------- skeleton
  const R = 0.62;
  const WW = 0.52;
  const HUB = 0.74;
  const WX = 1.3;
  const AX = [3.0, 1.0, -1.2];
  const chassis = b.joint("chassis", { at: [0, 1.15, 0], role: "spine" });

  const wheelJ: Record<string, Joint> = {};
  const steerJ: Record<string, Joint> = {};
  for (const s of [1, -1] as const)
    for (let i = 0; i < 3; i++) {
      const side = s > 0 ? "L" : "R";
      const hub: V = [s * WX, HUB, AX[i]];
      const steer =
        i < 2 ? b.joint(`steer${side}${i + 1}`, { parent: chassis, at: hub, dir: [0, 1, 0], role: "hinge" }) : chassis;
      if (i < 2) steerJ[`${side}${i}`] = steer;
      wheelJ[`${side}${i}`] = b.joint(`wheel${side}${i + 1}`, {
        parent: steer,
        at: hub,
        dir: [s, 0, 0],
        up: [0, 1, 0],
        role: "hinge",
      });
    });

  // turret + gun joints (gun is built directly in its 22 degree elevated pose)
  const TH = (22 * Math.PI) / 180;
  const D = new THREE.Vector3(0, Math.sin(TH), Math.cos(TH));
  const U = new THREE.Vector3(0, Math.cos(TH), -Math.sin(TH));
  const TRUN: V = [0, 3.85, -1.2];
  const QG = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -TH);
  const G = (dx: number, dy: number, dz: number): V => [
    dx,
    TRUN[1] + dz * D.y + dy * U.y,
    TRUN[2] + dz * D.z + dy * U.z,
  ];
  const DIR: V = [D.x, D.y, D.z];
  const yaw = b.joint("turretYaw", { parent: chassis, at: [0, 2.05, -1.8], dir: [0, 1, 0], role: "hinge" });
  const pitch = b.joint("gunPitch", { parent: yaw, at: TRUN, dir: DIR, role: "hinge" });
  const recoil = b.joint("gunRecoil", { parent: pitch, at: G(0, 0, 2.3), dir: DIR, role: "hinge" });

  const spade = b.joint("spadeArm", { parent: chassis, at: [0, 1.5, -4.75], dir: [0, -1, -0.3], role: "hinge" });
  const doorJ: Record<number, Joint> = {};
  for (const s of [1, -1])
    doorJ[s] = b.joint(`door${s > 0 ? "L" : "R"}`, { parent: chassis, at: [s * 1.27, 1.6, 3.62], dir: [0, 1, 0], role: "hinge" });
  const hatchJ = b.joint("roofHatch", { parent: chassis, at: [-0.55, 3.34, 2.35], dir: [1, 0, 0], role: "hinge" });
  const fanJ: Record<number, Joint> = {};
  for (const s of [1, -1])
    fanJ[s] = b.joint(`coolFan${s > 0 ? "L" : "R"}`, { parent: chassis, at: [s * 1.12, 2.45, 1.15], dir: [s, 0, 0], role: "hinge" });

  // ---------------------------------------------------------------- chassis frame, axles, wheels
  for (const s of [1, -1]) {
    blk(chassis, 0.32, 0.34, 9.3, [s * 0.8, 1.15, -0.2], DARKC);
    blk(chassis, 0.1, 0.5, 9.3, [s * 0.8, 1.3, -0.2], GUNC);
  }
  for (const z of [-4.3, -2.6, 0.2, 2.0, 3.9]) blk(chassis, 1.7, 0.2, 0.3, [0, 1.15, z], DARKC);
  rod(chassis, [0, 0.95, 3.4], [0, 0.95, -1.3], 0.08, STEELC, 8); // drive shaft
  cy(chassis, 0.4, 0.9, 10, [0, 0.95, 2.0], GUNC, { rotation: [90, 0, 0] }); // transfer case

  const lugsGeo = () => {
    const gs: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      gs.push(new THREE.CylinderGeometry(0.028, 0.028, 0.05, 6).translate(0.2 * Math.cos(a), 0, 0.2 * Math.sin(a)));
    }
    return mergeGeometries(gs)!;
  };
  const tyreGeo = () => {
    const gs: THREE.BufferGeometry[] = [new THREE.CylinderGeometry(0.56, 0.56, WW, 14)];
    const n = 14;
    for (let i = 0; i < n; i++)
      for (const k of [-1, 1]) {
        const g = new THREE.BoxGeometry(0.34, 0.25, 0.1);
        g.rotateZ(k * 0.3);
        g.translate(0, k * 0.13, 0.57);
        g.rotateY((i / n) * Math.PI * 2 + (k > 0 ? 0.11 : 0));
        gs.push(g);
      }
    return mergeGeometries(gs)!;
  };

  for (const s of [1, -1] as const)
    for (let i = 0; i < 3; i++) {
      const side = s > 0 ? "L" : "R";
      const spin = wheelJ[`${side}${i}`];
      const z = AX[i];
      const hub: V = [s * WX, HUB, z];
      const at = (dx: number): V => [hub[0] + s * dx, HUB, z];
      b.part(tyreGeo(), TYREP, { bone: spin, at: hub, dir: X, flat: true });
      cy(spin, 0.36, 0.54, 12, hub, "#2a3037", { dir: X });
      cy(spin, 0.3, 0.08, 12, at(0.27), STEELC, { dir: X });
      cy(spin, 0.2, 0.05, 12, at(0.31), "#2a3037", { dir: X });
      b.part(lugsGeo(), "#c3c9cf", { bone: spin, at: at(0.34), dir: X, flat: true });
      cy(spin, 0.1, 0.07, 8, at(0.35), AMBER, { dir: X });
      // knuckle & hub housing
      const kb = i < 2 ? steerJ[`${side}${i}`] : chassis;
      cy(kb, 0.16, 0.2, 8, [s * 1.0, HUB, z], DARKC, { dir: X });
      blk(kb, 0.14, 0.4, 0.2, [s * 1.0, HUB + 0.05, z - 0.03], GUNC);
      // fender, lip and mud flap
      blk(chassis, 0.74, 0.08, 1.4, [s * WX, 1.56, z], HULL);
      blk(chassis, 0.06, 0.2, 1.4, [s * (WX + 0.37), 1.46, z], GUNC);
      blk(chassis, 0.74, 0.1, 0.1, [s * WX, 1.5, z + 0.7], DARKC, { rotation: [-25, 0, 0] });
      if (i === 2 || i === 1) blk(chassis, 0.7, 0.5, 0.05, [s * WX, 1.27, z - 0.74], RUBBER);
      // suspension: leaf pack and shocks
      for (const [k, len] of [[0, 1.4], [1, 1.1], [2, 0.8]] as const)
        blk(chassis, 0.14, 0.04, len, [s * 0.78, HUB + 0.2 + k * 0.045, z], "#58616b");
      rod(chassis, [s * 0.6, HUB + 0.1, z - 0.22], [s * 0.6, 1.25, z + 0.1], 0.045, STEELC, 7);
      rod(chassis, [s * 0.6, 1.0, z - 0.09], [s * 0.6, 1.25, z + 0.1], 0.07, "#4a525b", 7);
    }
  for (let i = 0; i < 3; i++) {
    rod(chassis, [-1.05, HUB, AX[i]], [1.05, HUB, AX[i]], 0.11, DARKC, 8);
    b.part(new THREE.SphereGeometry(0.27, 8, 6), GUNC, { bone: chassis, at: [0, HUB, AX[i]], flat: true });
  }
  for (const s of [1, -1]) rod(steerJ[`${s > 0 ? "L" : "R"}0`], [s * 1.0, HUB - 0.12, 3.0], [s * 0.2, HUB - 0.12, 3.2], 0.04, STEELC); // tie rods

  // ---------------------------------------------------------------- hull deck
  blk(chassis, 2.5, 0.55, 6.7, [0, 1.725, -1.45], HULL);
  blk(chassis, 2.3, 0.04, 6.5, [0, 2.06, -1.45], DECKP);
  for (const s of [1, -1]) {
    blk(chassis, 0.1, 0.12, 6.7, [s * 1.2, 2.1, -1.45], GUNC);
    blk(chassis, 0.4, 0.62, 0.7, [s * 1.45, 1.8, -0.1], HULL); // side locker
    blk(chassis, 0.04, 0.12, 0.22, [s * 1.67, 1.9, -0.1], STEELC);
    for (const dz of [-0.28, 0.08]) cy(chassis, 0.025, 0.05, 6, [s * 1.67, 1.66, -0.1 + dz], "#c3c9cf", { dir: X });
    plane(chassis, 1.9, 0.38, T.stencil, [s * 1.264, 1.8, -3.05], [s, 0, 0]);
    plane(chassis, 1.2, 0.1, T.hazStrip, [s * 1.264, 1.52, -3.4], [s, 0, 0]);
    plane(chassis, 0.9, 0.1, T.hazStrip, [s * 1.264, 1.52, 0.9], [s, 0, 0]);
    // pioneer tools on the flank
    blk(chassis, 0.05, 0.05, 1.3, [s * 1.29, 1.62, -2.6], "#6b5a3c");
    blk(chassis, 0.05, 0.2, 0.3, [s * 1.29, 1.62, -1.98], STEELC);
    blk(chassis, 0.04, 0.12, 0.08, [s * 1.29, 1.62, -3.2], DARKC);
    blk(chassis, 0.3, 0.2, 0.05, [s * 0.95, 1.55, -4.82], DARKC);
    blk(chassis, 0.3, 0.14, 0.05, [s * 1.0, 1.75, -4.83], REDL);
  }
  glow(blk(chassis, 0.34, 0.14, 0.04, [1.0, 1.75, -4.83], REDL), 1.2);
  glow(blk(chassis, 0.34, 0.14, 0.04, [-1.0, 1.75, -4.83], REDL), 1.2);
  plane(chassis, 1.2, 0.2, T.redChev, [0, 1.35, -4.82], [0, 0, -1]);
  plane(chassis, 0.5, 0.5, T.warn, [0, 1.85, -4.82], [0, 0, -1]);
  for (const s of [1, -1]) cy(chassis, 0.1, 0.4, 8, [s * 0.5, 1.5, -4.95], STEELC, { rotation: [90, 0, 0] }); // tow lugs

  // cargo at the rear: slug magazine and camo net
  blk(chassis, 2.3, 0.55, 0.75, [0, 2.36, -4.25], HULL);
  blk(chassis, 2.34, 0.06, 0.8, [0, 2.66, -4.25], GUNC);
  for (const x of [-0.8, 0, 0.8]) {
    blk(chassis, 0.1, 0.12, 0.05, [x, 2.4, -4.64], STEELC);
    cy(chassis, 0.2, 0.04, 8, [x, 2.5, -4.64], AMBER, { rotation: [90, 0, 0] });
  }
  plane(chassis, 0.9, 0.12, T.hazStrip, [0, 2.2, -4.64], [0, 0, -1]);
  cy(chassis, 0.2, 1.9, 8, [0, 2.9, -4.25], "#4c5740", { rotation: [0, 0, 90] });
  for (const x of [-0.7, 0.7]) cy(chassis, 0.205, 0.06, 8, [x, 2.9, -4.25], DARKC, { rotation: [0, 0, 90] });

  // ---------------------------------------------------------------- cab
  b.extrude(
    [
      [1.9, 1.45],
      [1.9, 3.25],
      [2.6, 3.35],
      [3.35, 3.3],
      [4.15, 2.45],
      [4.35, 2.3],
      [4.35, 1.45],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.5, bevel: 0.05, bone: chassis, color: HULL },
  );
  plane(chassis, 2.15, 1.0, T.windshield, [0, 2.885, 3.761], [0, 0.685, 0.729]);
  blk(chassis, 2.4, 0.07, 0.5, [0, 3.36, 3.55], GUNC, { rotation: [25, 0, 0] }); // armoured brow
  for (const s of [1, -1]) {
    blk(chassis, 0.1, 1.0, 0.1, [s * 1.2, 2.85, 3.6], GUNC, { rotation: [-43, 0, 0] });
    // door
    const dj = doorJ[s];
    blk(dj, 0.07, 0.75, 1.2, [s * 1.285, 1.99, 3.0], HULL);
    blk(dj, 0.07, 0.08, 1.2, [s * 1.285, 3.0, 3.0], HULL);
    for (const z of [2.44, 3.56]) blk(dj, 0.07, 0.6, 0.08, [s * 1.285, 2.7, z], HULL);
    plane(dj, 1.0, 0.55, T.sideWin, [s * 1.325, 2.68, 3.0], [s, 0, 0]);
    plane(dj, 0.5, 0.5, T.emblem, [s * 1.325, 1.99, 3.0], [s, 0, 0]);
    blk(dj, 0.05, 0.05, 0.22, [s * 1.34, 2.3, 2.5], STEELC);
    blk(dj, 0.02, 0.02, 1.2, [s * 1.322, 1.62, 3.0], "#14171a");
    // mirrors
    rod(chassis, [s * 1.28, 2.95, 3.5], [s * 1.55, 2.95, 3.66], 0.025, STEELC);
    rod(chassis, [s * 1.28, 2.35, 3.5], [s * 1.55, 2.5, 3.66], 0.025, STEELC);
    blk(chassis, 0.1, 0.45, 0.24, [s * 1.58, 2.72, 3.68], DARKC);
    blk(chassis, 0.02, 0.38, 0.18, [s * 1.51, 2.72, 3.68], "#6f93a3");
    // headlights
    blk(chassis, 0.5, 0.24, 0.1, [s * 0.95, 2.05, 4.38], GUNC);
    glow(blk(chassis, 0.4, 0.14, 0.03, [s * 0.95, 2.05, 4.44], HEAD), 1.3);
    blk(chassis, 0.45, 0.04, 0.12, [s * 0.95, 2.2, 4.4], DARKC);
    // tow hooks
    rod(chassis, [s * 0.7, 1.45, 4.6], [s * 0.7, 1.32, 4.78], 0.05, STEELC);
    b.part(new THREE.TorusGeometry(0.08, 0.025, 5, 8), STEELC, { bone: chassis, at: [s * 0.7, 1.28, 4.8], dir: [1, 0, 0], axis: "z" });
  }
  // front fascia
  blk(chassis, 1.4, 0.5, 0.08, [0, 1.95, 4.39], DARKC);
  for (let i = 0; i < 6; i++) blk(chassis, 1.34, 0.03, 0.05, [0, 1.74 + i * 0.087, 4.44], STEELC);
  blk(chassis, 2.7, 0.36, 0.34, [0, 1.5, 4.52], IRON);
  plane(chassis, 2.5, 0.28, T.hazStrip, [0, 1.5, 4.695], [0, 0, 1]);
  blk(chassis, 1.0, 0.1, 0.5, [0, 1.25, 4.4], DARKC);
  cy(chassis, 0.13, 0.9, 8, [0, 1.45, 4.35], "#5a6068", { rotation: [0, 0, 90] }); // winch drum
  // roof gear
  blk(chassis, 1.3, 0.1, 0.16, [0, 3.4, 3.1], DARKC);
  for (let i = 0; i < 5; i++) glow(blk(chassis, 0.2, 0.06, 0.03, [-0.52 + i * 0.26, 3.4, 3.19], AMBER), 1.2);
  cy(hatchJ, 0.32, 0.06, 10, [-0.55, 3.38, 2.65], GUNC);
  blk(hatchJ, 0.28, 0.04, 0.05, [-0.55, 3.43, 2.6], STEELC);
  cy(chassis, 0.1, 0.12, 8, [0.7, 3.38, 2.55], DARKC);
  b.part(new THREE.SphereGeometry(0.17, 8, 6), GUNC, { bone: chassis, at: [0.7, 3.5, 2.55], flat: true });
  glow(cy(chassis, 0.07, 0.04, 8, [0.7, 3.52, 2.71], CYAN, { rotation: [90, 0, 0] }), 1.4);
  b.spike([0.95, 3.32, 2.1], [0, 1, 0], 2.4, 0.02, "#222", { bone: chassis, sides: 5 });
  b.spike([-1.05, 3.28, 2.05], [0, 1, 0], 1.4, 0.016, "#222", { bone: chassis, sides: 5 });
  // behind the cab: exhaust stack and snorkel
  rod(chassis, [-0.95, 2.05, 1.8], [-0.95, 3.6, 1.8], 0.09, "#4a4f55", 8);
  cy(chassis, 0.13, 0.08, 8, [-0.95, 3.64, 1.8], DARKC);
  blk(chassis, 0.26, 1.7, 0.26, [1.0, 2.9, 1.82], GUNC);
  blk(chassis, 0.3, 0.1, 0.4, [1.0, 3.8, 1.9], DARKC, { rotation: [-20, 0, 0] });

  // ---------------------------------------------------------------- power module
  blk(chassis, 2.2, 0.8, 1.4, [0, 2.44, 1.15], HULL);
  for (let i = 0; i < 6; i++) blk(chassis, 1.8, 0.03, 0.08, [0, 2.85, 0.65 + i * 0.2], DARKC);
  for (const s of [1, -1]) {
    cy(chassis, 0.35, 0.05, 12, [s * 1.115, 2.45, 1.15], DARKC, { dir: X });
    b.part(new THREE.TorusGeometry(0.33, 0.025, 5, 12), STEELC, { bone: chassis, at: [s * 1.14, 2.45, 1.15], dir: X, axis: "z" });
    const fj = fanJ[s];
    cy(fj, 0.06, 0.06, 8, [s * 1.16, 2.45, 1.15], STEELC, { dir: X });
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      rod(fj, [s * 1.16, 2.45, 1.15], [s * 1.16, 2.45 + 0.28 * Math.cos(a), 1.15 + 0.28 * Math.sin(a)], 0.03, "#7a838c", 4);
    }
    cy(chassis, 0.09, 0.6, 8, [s * 0.75, 3.15, 0.62], "#4a4f55");
    cy(chassis, 0.12, 0.04, 8, [s * 0.75, 3.47, 0.62], DARKC);
    plane(chassis, 0.32, 0.32, T.warn, [s * 1.106, 2.7, 0.7], [s, 0, 0]);
    // cables from the module to the slew ring
    b.sweep(catmull([[s * 0.5, 2.5, 0.45], [s * 0.58, 2.12, 0.15], [s * 0.5, 2.1, -0.72]]), 0.07, {
      bone: chassis,
      color: "#15181b",
      sides: 6,
    });
  }
  glow(blk(chassis, 0.4, 0.05, 0.03, [0, 2.7, 0.44], "#6bff8a"), 1.1);
  blk(chassis, 1.6, 0.6, 0.12, [0, 2.45, 1.88], DARKC); // radiator grille
  for (let i = 0; i < 5; i++) blk(chassis, 1.5, 0.03, 0.04, [0, 2.25 + i * 0.1, 1.95], STEELC);

  // ---------------------------------------------------------------- slew ring and turret
  cy(chassis, 1.2, 0.26, 16, [0, 2.17, -1.8], STEEL);
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    cy(chassis, 0.04, 0.05, 6, [1.2 * Math.sin(a), 2.31, -1.8 + 1.2 * Math.cos(a)], "#c3c9cf");
  }
  const PL = 2.7; // platform top
  blk(yaw, 2.5, 0.4, 3.3, [0, 2.5, -1.8], HULL);
  blk(yaw, 2.5, 0.25, 0.3, [0, 2.45, -0.05], GUNC, { rotation: [-20, 0, 0] });
  for (const s of [1, -1]) {
    b.extrude(
      [
        [-3.0, PL],
        [-3.0, 4.1],
        [-2.4, 4.7],
        [-0.5, 4.7],
        [-0.2, 4.2],
        [-0.2, PL],
      ],
      { at: [s * 0.68, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.22, bevel: 0.04, bone: yaw, color: HULL },
    );
    const ox = s * 0.795;
    plane(yaw, 0.7, 0.7, T.emblem, [ox, 3.55, -2.0], [s, 0, 0]);
    plane(yaw, 0.32, 0.32, T.warn, [ox, 3.9, -0.8], [s, 0, 0]);
    cy(pitch, 0.3, 0.1, 12, [s * 0.86, TRUN[1], TRUN[2]], GUNC, { dir: X }); // trunnion caps
    cy(pitch, 0.15, 0.06, 8, [s * 0.92, TRUN[1], TRUN[2]], AMBER, { dir: X });
    // capacitor drums
    cy(yaw, 0.3, 2.1, 12, [s * 1.05, 3.0, -2.0], "#2f3841", { rotation: [90, 0, 0] });
    for (const z of [-2.9, -2.4, -1.9, -1.4, -1.0]) {
      cy(yaw, 0.315, 0.08, 12, [s * 1.05, 3.0, z], CYAN, { rotation: [90, 0, 0] });
      glow(cy(yaw, 0.318, 0.04, 12, [s * 1.05, 3.0, z], CYAN, { rotation: [90, 0, 0] }), 1.5);
    }
    cy(yaw, 0.2, 0.1, 10, [s * 1.05, 3.0, -0.93], STEELC, { rotation: [90, 0, 0] });
    blk(yaw, 0.1, 0.2, 2.2, [s * 1.05, 2.78, -2.0], DARKC);
    // smoke dischargers
    for (let k = 0; k < 3; k++) {
      const x = s * (1.0 + 0.13 * k);
      rod(yaw, [x, 2.7, -0.5], [x + s * 0.06, 3.15, -0.22], 0.05, "#46505a", 7);
      cy(yaw, 0.058, 0.03, 7, [x + s * 0.062, 3.16, -0.21], DARKC, { rotation: [-32, 0, 0] });
    }
    // side rails
    rod(yaw, [s * 1.22, 2.7, -3.2], [s * 1.22, 3.0, -3.2], 0.03, STEELC);
    rod(yaw, [s * 1.22, 2.7, -0.4], [s * 1.22, 3.0, -0.4], 0.03, STEELC);
    // elevation rams
    const base: V = [s * 0.35, 2.75, -0.85];
    const att = G(s * 0.35, -0.6, 0.8);
    const midp: V = [base[0], base[1] + (att[1] - base[1]) * 0.55, base[2] + (att[2] - base[2]) * 0.55];
    rod(yaw, base, midp, 0.1, "#46505a", 8);
    rod(pitch, midp, att, 0.055, STEELC, 8);
  }
  // rear bustle with gunner's display
  blk(yaw, 2.0, 0.9, 0.45, [0, 3.15, -3.68], HULL);
  blk(yaw, 2.04, 0.08, 0.5, [0, 3.64, -3.68], GUNC);
  plane(yaw, 0.9, 0.56, T.screen, [0, 3.2, -3.906], [0, 0, -1]);
  glow(blk(yaw, 0.5, 0.04, 0.02, [0, 3.2 + 0.32, -3.91], "#1a6a78"), 0.5);
  b.part(new THREE.PlaneGeometry(0.9, 0.56), "#ffffff", { bone: yaw, at: [0, 3.2, -3.906], dir: [0, 0, -1], axis: "z", texture: T.screen });
  for (const s of [1, -1]) for (let i = 0; i < 4; i++) blk(yaw, 0.3, 0.03, 0.05, [s * 0.68, 2.95 + i * 0.12, -3.915], STEELC);
  for (const s of [1, -1]) {
    b.sweep(catmull([[s * 0.35, 3.0, -3.46], [s * 0.4, 3.18, -3.05], [s * 0.35, 3.1, -2.55]]), 0.06, {
      bone: yaw,
      color: "#15181b",
      sides: 6,
    });
  }
  // sensor mast and radar dish on the bustle
  rod(yaw, [-0.75, 3.65, -3.6], [-0.75, 4.35, -3.6], 0.04, STEELC);
  b.part(new THREE.SphereGeometry(0.17, 8, 6), GUNC, { bone: yaw, at: [-0.75, 4.45, -3.6], flat: true });
  glow(cy(yaw, 0.07, 0.04, 8, [-0.75, 4.47, -3.46], CYAN, { rotation: [90, 0, 0] }), 1.4);
  rod(yaw, [0.7, 3.65, -3.6], [0.7, 4.0, -3.6], 0.04, STEELC);
  b.lathe(
    [
      [0, 0],
      [0.32, 0.12],
      [0.32, 0.14],
      [0, 0.03],
    ],
    { at: [0.7, 4.05, -3.6], axis: [0, 0.5, -0.85], segments: 10, bone: yaw, color: "#aab3bc" },
  );
  rod(yaw, [0.7, 4.05, -3.62], [0.7, 4.35, -3.9], 0.015, STEELC, 4);
  // floodlight
  blk(yaw, 0.24, 0.2, 0.2, [1.12, 3.45, -0.5], DARKC);
  glow(blk(yaw, 0.18, 0.14, 0.03, [1.12, 3.45, -0.39], HEAD), 1.2);
  // gunner's EO head
  blk(yaw, 0.5, 0.4, 0.5, [-1.1, 3.45, -0.6], GUNC);
  glow(cy(yaw, 0.09, 0.04, 8, [-1.1, 3.45, -0.34], CYAN, { rotation: [90, 0, 0] }), 1.6);

  // ---------------------------------------------------------------- the railgun
  const gbox = (bone: Joint, w: number, h: number, l: number, dx: number, dy: number, dz: number, c: Fill) =>
    blk(bone, w, h, l, G(dx, dy, dz), c, { quat: QG });
  const gcyl = (bone: Joint, r: number, len: number, sides: number, dx: number, dy: number, dz: number, c: Fill) =>
    cy(bone, r, len, sides, G(dx, dy, dz), c, { dir: DIR });
  const grod = (bone: Joint, a: V, c: V, r: number, col: Fill, sides = 6) => rod(bone, G(...a), G(...c), r, col, sides);

  // breech and cradle
  gbox(pitch, 1.1, 0.95, 1.4, 0, 0, -0.8, IRON);
  gbox(pitch, 0.9, 0.75, 0.2, 0, 0, -1.6, GUNC);
  for (const s of [1, -1]) gcyl(pitch, 0.12, 0.3, 8, s * 0.3, 0, -1.8, STEELC);
  gbox(pitch, 0.96, 0.78, 2.4, 0, 0, 1.1, IRON);
  for (const dz of [0.4, 1.1, 1.8]) gbox(pitch, 0.99, 0.82, 0.07, 0, 0, dz, DARKC);
  glow(gbox(pitch, 0.3, 0.04, 0.4, 0, 0.49, -0.7, "#6bff8a"), 1.1);
  rod(pitch, [-0.85, TRUN[1], TRUN[2]], [0.85, TRUN[1], TRUN[2]], 0.14, STEELC, 10);
  for (const s of [1, -1]) {
    const q = QG.clone().multiply(sideQ(s));
    b.part(new THREE.PlaneGeometry(1.8, 0.45), "#ffffff", { bone: pitch, at: G(s * 0.492, 0, 1.2), quat: q, texture: T.kills });
    gcyl(pitch, 0.07, 1.6, 8, s * 0.3, 0.5, 1.55, "#46505a"); // recoil buffers
    gcyl(recoil, 0.04, 1.2, 6, s * 0.3, 0.5, 2.55, STEELC);
  }
  // barrel group on the recoil joint
  gbox(recoil, 1.0, 0.82, 0.8, 0, 0, 2.7, BLUED);
  for (const s of [1, -1]) gbox(recoil, 0.16, 0.4, 6.3, s * 0.19, 0, 5.95, BLUED);
  glow(gbox(recoil, 0.14, 0.34, 6.25, 0, 0, 5.95, CYAN), 1.8);
  gbox(recoil, 0.3, 0.2, 6.2, 0, -0.4, 5.95, GUNC);
  for (let k = 0; k < 8; k++) {
    const dz = 3.0 + k * 0.8;
    const sd = k % 2 ? 1 : -1;
    grod(recoil, [0, -0.4, dz], [sd * 0.2, -0.2, dz + 0.4], 0.035, STEELC);
    grod(recoil, [0, -0.4, dz + 0.4], [sd * 0.2, -0.2, dz], 0.035, STEELC);
  }
  for (let k = 0; k < 6; k++) {
    const dz = 3.5 + k * 1.05;
    gbox(recoil, 0.78, 0.09, 0.34, 0, 0.27, dz, GUNC);
    gbox(recoil, 0.78, 0.09, 0.34, 0, -0.27, dz, GUNC);
    for (const s of [1, -1]) {
      gbox(recoil, 0.09, 0.45, 0.34, s * 0.345, 0, dz, GUNC);
      glow(gbox(recoil, 0.03, 0.3, 0.1, s * 0.395, 0, dz, CYAN), 1.6);
    }
    glow(gbox(recoil, 0.6, 0.03, 0.1, 0, 0.325, dz, CYAN), 1.6);
  }
  for (const s of [1, -1]) {
    grod(recoil, [s * 0.44, -0.05, 2.9], [s * 0.44, -0.05, 8.8], 0.05, STEELC, 6); // coolant lines
    gbox(recoil, 0.14, 0.12, 0.14, s * 0.5, 0.25, 8.6, DARKC);
  }
  // muzzle
  gbox(recoil, 1.0, 0.12, 0.3, 0, 0.4, 9.2, GUNC);
  gbox(recoil, 1.0, 0.12, 0.3, 0, -0.4, 9.2, GUNC);
  for (const s of [1, -1]) gbox(recoil, 0.12, 0.7, 0.3, s * 0.44, 0, 9.2, GUNC);
  glow(gbox(recoil, 0.2, 0.3, 0.04, 0, 0, 9.4, "#c6fbff"), 2.2);
  for (const s of [1, -1]) b.spike(G(s * 0.5, 0.0, 9.3), DIR, 0.35, 0.05, STEELC, { bone: recoil, sides: 5 });
  plane(recoil, 0.34, 0.34, T.warn, G(0.4 + 0.12, 0.0, 8.0), [1, 0, 0]);

  // ---------------------------------------------------------------- stabiliser legs
  const OUT_Z = [-0.15, -3.4];
  for (const s of [1, -1] as const)
    OUT_Z.forEach((z, k) => {
      const tag = `${s > 0 ? "L" : "R"}${k + 1}`;
      const x = s * 2.75;
      const slide = b.joint(`outrigger${tag}`, { parent: chassis, at: [s * 1.0, 1.2, z], dir: [s, 0, 0], role: "hinge" });
      const leg = b.chain(`stab${tag}`, polyline([[x, 1.4, z], [x, 1.0, z], [x, 0.14, z]]), {
        parent: slide,
        names: [`stabiliser${tag}`, `piston${tag}`, `pad${tag}`],
        role: "leg",
        contact: [x, 0, z],
      });
      const [sleeveJ, pistonJ, padJ] = [leg.joints[0], leg.joints[1], leg.tip!];
      blk(chassis, 1.1, 0.5, 0.5, [s * 1.2, 1.2, z], "#323a42"); // housing
      for (const dz of [-0.26, 0.26]) blk(chassis, 1.1, 0.3, 0.03, [s * 1.2, 1.2, z + dz], AMBER);
      blk(slide, 1.8, 0.4, 0.38, [s * 2.05, 1.2, z], "#4a525b"); // sliding beam
      blk(slide, 0.06, 0.42, 0.4, [s * 2.97, 1.2, z], "#ffffff", { texture: T.hazard });
      rod(slide, [s * 1.45, 1.0, z], [s * 2.55, 0.85, z], 0.06, STEELC, 6); // brace
      blk(sleeveJ, 0.46, 0.9, 0.46, [x, 1.2, z], "#3c444d"); // sleeve
      blk(sleeveJ, 0.5, 0.08, 0.5, [x, 1.66, z], DARKC);
      rod(pistonJ, [x, 1.0, z], [x, 0.22, z], 0.13, "#d3d8de", 10);
      for (const y of [0.55, 0.42]) cy(pistonJ, 0.16, 0.05, 10, [x, y, z], DARKC);
      glow(b.part(new THREE.SphereGeometry(0.07, 6, 4), AMBER, { bone: sleeveJ, at: [x, 1.73, z], flat: true }), 1.5);
      b.part(new THREE.SphereGeometry(0.2, 8, 6), STEELC, { bone: padJ, at: [x, 0.3, z], flat: true });
      b.part(new THREE.CylinderGeometry(0.62, 0.62, 0.14, 8), "#ffffff", { bone: padJ, at: [x, 0.07, z], flat: true, texture: T.hazard });
      for (let g = 0; g < 4; g++) {
        const a = (g / 4) * Math.PI * 2 + 0.4;
        blk(padJ, 0.06, 0.26, 0.4, [x + 0.3 * Math.cos(a), 0.25, z + 0.3 * Math.sin(a)], DARKC, { rotation: [0, (-a * 180) / Math.PI + 90, 0] });
      }
    });

  // ---------------------------------------------------------------- recoil spade
  const cen: V = [0, 0.58, -5.0];
  const SU: V = [0, 0.819, 0.574];
  b.part(new THREE.BoxGeometry(2.4, 1.4, 0.14), IRON, { bone: spade, at: cen, dir: SU });
  b.part(new THREE.BoxGeometry(2.4, 0.1, 0.2), "#aeb6bf", { bone: spade, at: [0, 0.07, -5.37], dir: SU });
  for (const x of [-0.8, -0.4, 0, 0.4, 0.8])
    b.part(new THREE.BoxGeometry(0.1, 1.2, 0.1), GUNC, { bone: spade, at: [x, 0.64, -5.07], dir: SU });
  plane(spade, 2.0, 0.14, T.hazStrip, [0, 1.12, -4.63], [0, 0.574, 0.819]);
  blk(spade, 2.3, 0.14, 0.14, [0, 1.17, -4.64], GUNC, { rotation: [-35, 0, 0] });
  for (const s of [1, -1]) {
    rod(spade, [s * 0.9, 1.52, -4.9], [s * 0.9, 1.0, -4.84], 0.09, "#d3d8de", 8);
    rod(chassis, [s * 0.9, 1.56, -4.78], [s * 0.9, 1.4, -4.86], 0.11, "#46505a", 8);
  }

  return b.root;
}
