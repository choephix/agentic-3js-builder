```ts
// STYLE: "Khokhloma lacquer toy". The beekeeper, smoker and hive are all built as turned,
// hand-painted Russian folk-lacquer ware: black lacquer ground, cinnabar red, gold-leaf scrollwork,
// berries and curling sprigs, with glossy varnish glints. Every surface carries that red/gold/black
// folk-painting vocabulary. The veil is a lattice net, the hive is a painted panel cabinet, and the
// smoker and honey glow like gold leaf.

import * as THREE from "three";
import { createBuilder, rng, catmull, bezier, svg, paint, mix, noise, smoothstep, spots, grain, gradient, mottle } from "agentic-3js-builder";

export const meta = {
  name: "Khokhloma Beekeeper",
  description:
    "A folk-lacquer toy beekeeper in veil hat and gold-trimmed coat, holding a bail-handled smoker beside a painted gabled hive with a honey window and a swarm of little gold bees.",
};

type V3 = [number, number, number];

// ---------------------------------------------------------------- palette
const INK = "#15100d";
const RED = "#c0261b";
const GOLD = "#e3a92b";
const GOLD_L = "#f7d36a";
const CREAM = "#f1e5c6";
const SKIN = "#f2cfa6";
const BLUSH = "#e98a74";
const GLOVE = "#ecd9a4";
const STEEL = "#aeb4bf";
const HONEY = "#f2b01e";
const WING = "#e9f3ff";
const BEE_Y = "#f4b81c";
const FUZZ = "#6b4a1a";
const EMBER = "#ff7a1a";

const BX = -0.28; // beekeeper's x offset (hive stands to his left)
const HX = 0.68; // hive centre x
const v = (x: number, y: number, z: number): V3 => [x + BX, y, z];

const KEY = new THREE.Vector3(0.35, 0.8, 0.5).normalize();

export default function build() {
  const b = createBuilder({ name: "beekeeper_khokhloma", paintSize: 2048 });
  const rand = rng(11);
  type J = ReturnType<typeof b.joint>;

  // ------------------------------------------------------------- helpers
  const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
  const ell = (rx: number, ry: number, rz: number, w = 10, h = 8) => new THREE.SphereGeometry(1, w, h).scale(rx, ry, rz);
  const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);
  const circ = (c: V3, r: number, n = 10) =>
    catmull(
      Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2;
        return [c[0] + Math.sin(a) * r, c[1], c[2] + Math.cos(a) * r] as V3;
      }),
      { closed: true },
    );
  const prof = (tbl: number[][]) => (y: number): [number, number] => {
    if (y <= tbl[0][0]) return [tbl[0][1], tbl[0][2]];
    for (let i = 1; i < tbl.length; i++) {
      if (y <= tbl[i][0]) {
        const a = tbl[i - 1];
        const c = tbl[i];
        const t = (y - a[0]) / (c[0] - a[0]);
        return [a[1] + (c[1] - a[1]) * t, a[2] + (c[2] - a[2]) * t];
      }
    }
    const l = tbl[tbl.length - 1];
    return [l[1], l[2]];
  };
  // self-lit surfaces (same trick as the glow kit: emissive copy of the material)
  const glow = <T extends { mesh?: THREE.Mesh; meshes?: THREE.Mesh[] }>(target: T, k = 1): T => {
    const list = target.meshes ?? (target.mesh ? [target.mesh] : []);
    for (const mesh of list) {
      const m = mesh.material as THREE.MeshStandardMaterial;
      const c = m.clone();
      c.emissive.copy(m.color);
      c.emissiveMap = m.map;
      c.emissiveIntensity = k;
      mesh.material = c;
    }
    return target;
  };

  // ------------------------------------------------------------- paints
  const lac = (base: string, hi: string, gloss: number) =>
    paint((_p, n) => {
      let c = mix(base, "#1a1030", 0.28 * smoothstep(0.2, -0.8, n.y));
      c = mix(c, hi, gloss * smoothstep(0.8, 0.97, n.dot(KEY)));
      return c;
    });
  const LB = lac("#1b1410", "#ffd9a0", 0.55);
  const LR = lac(RED, "#ffa07a", 0.4);
  const LG = lac(GOLD, "#fff3b8", 0.4);
  const CLOTH = paint((p, n) => {
    const warm = smoothstep(-0.3, 1, n.y);
    let c = mix("#c9b58f", CREAM, 0.35 + 0.65 * warm);
    c = mix(c, "#fff8e4", 0.14 * smoothstep(0.5, 0.8, noise(p, 0.03, 3)));
    return c;
  });
  const COAT = paint((p) => (p.y < 0.775 ? LR : p.y < 0.795 ? LG : CLOTH));
  const SLEEVE = spots(CLOTH, LR, { size: 0.065, amount: 0.32, seed: 4 });
  const SK = paint((_p, n) => mix("#d9a47f", SKIN, smoothstep(-0.5, 0.8, n.y)));
  const WOODP = grain("#c9954a", "#9d6a2a", { size: 0.02, axis: "x" });
  const LEATHER = mottle("#6a3f22", "#4e2d17", { size: 0.03 });
  const BEARD = gradient(CREAM, GOLD_L, v(0, 1.44, 0.1), v(0, 1.28, 0.15));
  const BEEBODY = paint((_p, _n, s) => (Math.floor(s[1] * 8) % 2 === 0 ? BEE_Y : INK));
  const BRIM = paint((p, n) => {
    const dx = p.x - BX;
    const dz = p.z - 0.03;
    const r = Math.hypot(dx, dz);
    if (n.y < -0.2) return LB;
    if (r > 0.335) return LG;
    if (r < 0.2) return LB;
    if (r < 0.212) return LG;
    const cell = (Math.atan2(dz, dx) / (Math.PI * 2)) * 28;
    const f = cell - Math.round(cell);
    const d = Math.hypot(f * 0.0606, r - 0.27);
    if (d < 0.011) return LB;
    if (d < 0.019) return LG;
    if (Math.abs(r - 0.315) < 0.004) return LG;
    return LR;
  });
  const ROOF = paint((p, n) => {
    if (n.y < 0.15) return LB;
    const f = (p.z / 0.07) % 1;
    return Math.abs(f - Math.round(f)) < 0.07 ? LG : LR;
  });

  // ------------------------------------------------------------- textures
  const STEM = "M50 146 C52 112 46 92 50 56";
  const C1 = "M50 118 C28 116 12 102 20 84 C25 74 36 80 31 88";
  const C2 = "M50 104 C74 102 90 88 80 70 C75 62 65 68 70 76";
  const petals = (cx: number, cy: number, rx: number, ry: number, n: number, fill: string, w: number) =>
    Array.from(
      { length: n },
      (_, i) =>
        `<ellipse cx="${cx}" cy="${cy - ry}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${INK}" stroke-width="${w}" transform="rotate(${(360 / n) * i} ${cx} ${cy})"/>`,
    ).join("");
  const SPRIG = svg(
    `<svg viewBox="0 0 100 150" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <g stroke="${INK}" stroke-width="10"><path d="${STEM}"/><path d="${C1}"/><path d="${C2}"/></g>
      <g stroke="${GOLD}" stroke-width="5"><path d="${STEM}"/><path d="${C1}"/><path d="${C2}"/></g>
    </g>
    <path d="M49 134 C34 138 20 130 14 118 C30 114 44 120 49 134Z" fill="${GOLD}" stroke="${INK}" stroke-width="3.5"/>
    <path d="M51 128 C66 132 80 124 86 112 C70 108 56 114 51 128Z" fill="${GOLD}" stroke="${INK}" stroke-width="3.5"/>
    <circle cx="31" cy="88" r="9" fill="${RED}" stroke="${INK}" stroke-width="3.5"/>
    <circle cx="70" cy="76" r="9" fill="${RED}" stroke="${INK}" stroke-width="3.5"/>
    <circle cx="28" cy="85" r="2.6" fill="#ffb59a"/><circle cx="67" cy="73" r="2.6" fill="#ffb59a"/>
    ${petals(50, 40, 9, 16, 6, RED, 3.5)}
    <circle cx="50" cy="40" r="10" fill="${GOLD}" stroke="${INK}" stroke-width="3.5"/>
    <circle cx="50" cy="40" r="4" fill="${RED}"/>
  </svg>`,
    { size: 320 },
  );

  const panelSVG = (bg: string, a: string, g: string, ink: string) => {
    const half = `
      <path d="M80 90 C100 86 118 82 126 66 C131 54 118 47 113 58" fill="none" stroke="${g}" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M100 84 C102 72 114 68 123 73 C119 84 108 89 100 84Z" fill="${g}" stroke="${ink}" stroke-width="1.4"/>
      <path d="M96 82 C90 64 98 52 112 40" fill="none" stroke="${g}" stroke-width="3" stroke-linecap="round"/>
      <path d="M104 52 C114 40 128 40 136 46 C128 58 114 58 104 52Z" fill="${g}" stroke="${ink}" stroke-width="1.4"/>
      <circle cx="113" cy="58" r="6.5" fill="${a}" stroke="${ink}" stroke-width="1.6"/>
      <circle cx="112" cy="40" r="5" fill="${a}" stroke="${ink}" stroke-width="1.6"/>
      <circle cx="140" cy="30" r="4" fill="${g}"/><circle cx="148" cy="62" r="3" fill="${g}"/>`;
    return svg(
      `<svg viewBox="0 0 160 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="160" height="100" fill="${bg}"/>
      <rect x="4" y="4" width="152" height="92" rx="7" fill="none" stroke="${g}" stroke-width="3"/>
      <rect x="9" y="9" width="142" height="82" rx="4" fill="none" stroke="${a}" stroke-width="2"/>
      ${half}
      <g transform="translate(160 0) scale(-1 1)">${half}</g>
      ${petals(80, 46, 6, 13, 8, a, 1.6)}
      <circle cx="80" cy="46" r="8" fill="${g}" stroke="${ink}" stroke-width="1.8"/>
      <circle cx="80" cy="46" r="3" fill="${a}"/>
    </svg>`,
      { size: 640 },
    );
  };
  const PANEL_A = panelSVG("#1b1410", RED, GOLD, INK);
  const PANEL_B = panelSVG(RED, "#1b1410", GOLD_L, INK);

  let borderUnits = "";
  for (let i = 0; i < 16; i++) {
    const x0 = i * 25;
    borderUnits += `<circle cx="${x0 + 12.5}" cy="12" r="4.6" fill="${RED}" stroke="${INK}" stroke-width="1.2"/>
      <ellipse cx="${x0 + 4}" cy="12" rx="4.2" ry="2" fill="${GOLD}" transform="rotate(-25 ${x0 + 4} 12)"/>
      <ellipse cx="${x0 + 21}" cy="12" rx="4.2" ry="2" fill="${GOLD}" transform="rotate(25 ${x0 + 21} 12)"/>`;
  }
  const BORDER = svg(
    `<svg viewBox="0 0 400 24" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="24" fill="#1b1410"/>
    <rect y="1" width="400" height="1.6" fill="${GOLD}"/><rect y="21.4" width="400" height="1.6" fill="${GOLD}"/>${borderUnits}</svg>`,
    { size: 1000 },
  );

  const EMBLEM = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs><clipPath id="ab"><ellipse cx="50" cy="63" rx="14" ry="19"/></clipPath></defs>
    <circle cx="50" cy="50" r="48" fill="${INK}"/><circle cx="50" cy="50" r="43" fill="${RED}"/>
    <circle cx="50" cy="50" r="38" fill="none" stroke="${GOLD}" stroke-width="3"/>
    <ellipse cx="34" cy="38" rx="8" ry="16" fill="${CREAM}" stroke="${INK}" stroke-width="2.4" transform="rotate(35 34 38)"/>
    <ellipse cx="66" cy="38" rx="8" ry="16" fill="${CREAM}" stroke="${INK}" stroke-width="2.4" transform="rotate(-35 66 38)"/>
    <ellipse cx="50" cy="63" rx="14" ry="19" fill="${BEE_Y}" stroke="${INK}" stroke-width="2.6"/>
    <g clip-path="url(#ab)"><rect x="30" y="56" width="40" height="6" fill="${INK}"/><rect x="30" y="68" width="40" height="6" fill="${INK}"/><rect x="30" y="79" width="40" height="6" fill="${INK}"/></g>
    <circle cx="50" cy="42" r="10" fill="${FUZZ}" stroke="${INK}" stroke-width="2.4"/>
    <circle cx="50" cy="30" r="7.5" fill="${INK}"/>
    <path d="M46 25 Q42 16 36 15 M54 25 Q58 16 64 15" stroke="${INK}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    <circle cx="47" cy="29" r="1.8" fill="#fff"/><circle cx="53" cy="29" r="1.8" fill="#fff"/>
  </svg>`,
    { size: 256 },
  );

  const FACE = svg(
    `<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M36 32 Q58 14 82 27" stroke="#3a1f14" stroke-width="7" fill="none" stroke-linecap="round"/>
    <path d="M118 27 Q142 14 164 32" stroke="#3a1f14" stroke-width="7" fill="none" stroke-linecap="round"/>
    <ellipse cx="60" cy="54" rx="11" ry="13.5" fill="${INK}"/><circle cx="64.5" cy="48" r="4.6" fill="#fff"/><circle cx="55.5" cy="60" r="2.2" fill="#fff"/>
    <ellipse cx="140" cy="54" rx="11" ry="13.5" fill="${INK}"/><circle cx="144.5" cy="48" r="4.6" fill="#fff"/><circle cx="135.5" cy="60" r="2.2" fill="#fff"/>
    <path d="M46 40 Q38 38 33 32 M154 40 Q162 38 167 32" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/>
    <circle cx="28" cy="82" r="15" fill="#e56b5a"/><circle cx="28" cy="82" r="8.5" fill="#f4907c"/>
    <circle cx="172" cy="82" r="15" fill="#e56b5a"/><circle cx="172" cy="82" r="8.5" fill="#f4907c"/>
  </svg>`,
    { size: 800 },
  );
  const MOUTH = svg(
    `<svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 12 Q50 54 90 12 Q50 24 10 12Z" fill="#8a1710" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    <ellipse cx="50" cy="30" rx="12" ry="5" fill="${BLUSH}"/></svg>`,
    { size: 256 },
  );

  let netLines = "";
  for (let x = -120; x <= 480; x += 12) {
    netLines += `<path d="M${x} 0 L${x + 120} 120"/><path d="M${x} 120 L${x + 120} 0"/>`;
  }
  const VEIL = svg(
    `<svg viewBox="0 0 480 120" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2a1c" stroke-width="1.7" fill="none">${netLines}</g></svg>`,
    { size: 1440 },
  );

  let cells = "";
  const hexR = 10;
  for (let row = 0; row < 6; row++)
    for (let col = 0; col < 9; col++) {
      const cx = 10 + col * hexR * 1.732 + (row % 2 ? hexR * 0.866 : 0);
      const cy = 6 + row * hexR * 1.5;
      const pts = Array.from({ length: 6 }, (_, k) => {
        const a = (Math.PI / 3) * k + Math.PI / 6;
        return `${(cx + Math.cos(a) * (hexR - 0.5)).toFixed(1)},${(cy + Math.sin(a) * (hexR - 0.5)).toFixed(1)}`;
      }).join(" ");
      const fill = ["#f2b01e", "#ffd25a", "#e59a10"][(row + col) % 3];
      cells += `<polygon points="${pts}" fill="${fill}" stroke="#8a4e08" stroke-width="1.8" stroke-linejoin="round"/>`;
      if ((row * 3 + col) % 4 === 0) cells += `<circle cx="${cx}" cy="${cy}" r="4.2" fill="#fff0c0" stroke="#8a4e08" stroke-width="1"/>`;
    }
  const COMB = svg(`<svg viewBox="0 0 160 76" xmlns="http://www.w3.org/2000/svg"><rect width="160" height="76" fill="#c77d12"/>${cells}</svg>`, { size: 640 });

  // ------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: v(0, 0.9, 0) });
  const spine = b.chain("spine", catmull([v(0, 0.96, 0), v(0, 1.12, 0.01), v(0, 1.3, 0)]), {
    parent: hips,
    role: "spine",
    names: ["spine1", "spine2", "chest"],
  });
  const chest = spine.joints[2];
  const neck = b.chain("neck", catmull([v(0, 1.3, 0), v(0, 1.37, 0.01), v(0, 1.44, 0.02)]), {
    parent: chest,
    role: "neck",
    names: ["neck1", "neck2"],
  });
  const head = b.joint("head", { parent: neck.joints[1], at: v(0, 1.44, 0.02), dir: [0, 1, 0], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: v(0, 1.5, -0.02), aim: v(0, 1.43, 0.1), role: "jaw" });

  const wrists: Record<string, J> = {};
  const legs: Record<string, J[]> = {};
  const armData: Record<string, { W: V3; E: V3 }> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const shoulder = v(s * 0.25, 1.22, 0);
    const elbow = v(s * 0.4, 0.98, 0.03);
    const wrist = v(s * 0.48, 0.76, 0.07);
    const arm = b.chain(`arm${side}`, catmull([shoulder, elbow, wrist]), {
      parent: chest,
      role: "arm",
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
    });
    wrists[side] = arm.joints[2];
    armData[side] = { W: wrist, E: elbow };
    b.sweep(arm, [0.082, 0.072, 0.064, 0.056], { color: SLEEVE, sides: 10 });
    b.part(ell(0.088, 0.088, 0.088, 10, 8), SLEEVE, { bone: arm.joints[0], at: shoulder });

    const leg = b.chain(`leg${side}`, catmull([v(s * 0.11, 0.9, 0), v(s * 0.115, 0.5, 0.02), v(s * 0.12, 0.1, 0)]), {
      parent: hips,
      role: "leg",
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
    });
    legs[side] = leg.joints;
    b.sweep(leg, [0.092, 0.084, 0.074, 0.07], { color: CLOTH, sides: 10 });
    b.part(ell(0.05, 0.055, 0.025, 8, 6), LR, { bone: leg.joints[1], at: v(s * 0.115, 0.5, 0.095) });
  }

  // ------------------------------------------------------------- torso
  const torsoProf = prof([
    [0.7, 0.235, 0.19],
    [0.8, 0.215, 0.17],
    [0.92, 0.19, 0.15],
    [1.05, 0.2, 0.16],
    [1.2, 0.225, 0.165],
    [1.28, 0.2, 0.15],
    [1.33, 0.12, 0.1],
    [1.37, 0.07, 0.07],
  ]);
  const torso = b.sweep(catmull([v(0, 0.7, 0), v(0, 0.95, 0), v(0, 1.2, 0), v(0, 1.37, 0)]), (t) => torsoProf(0.7 + t * 0.67), {
    bone: [spine, hips],
    color: COAT,
    caps: { start: "flat", end: "round" },
    sides: 12,
  });
  const torsoSkin = b.surface(torso);
  b.sweep(neck, 0.055, { color: SK, sides: 8 });

  b.decal(torso, SPRIG, { at: v(0, 1.17, 0.2), dir: [0, 0, 1], size: [0.15, 0.225] });
  b.decal(torso, SPRIG, { at: v(0, 1.15, -0.2), dir: [0, 0, -1], size: [0.17, 0.255] });
  for (const sx of [1, -1]) b.decal(torso, SPRIG, { at: v(sx * 0.1, 0.86, 0.17), dir: [sx * 0.2, 0, 1], size: [0.08, 0.12] });

  // sash, hem beads, tassel
  const sash = torsoSkin.loop(v(0, 1.0, 0), { dir: [0, 1, 0], lift: 0.006 });
  b.sweep(sash, 0.021, { color: LR, sides: 8 });
  b.along(sash, 18, (pt) => b.part(sph(0.012, 6, 4), GOLD, { at: pt }));
  const hem = torsoSkin.loop(v(0, 0.76, 0), { dir: [0, 1, 0], lift: 0.004 });
  b.along(hem, 24, (pt) => b.part(sph(0.011, 6, 4), GOLD_L, { at: pt }));
  const knot = torsoSkin.nearest(v(0.12, 1.0, 0.4));
  b.stick(sph(0.03, 8, 6), LR, knot, { embed: 0.3, bone: hips });
  const kp = knot.at.toArray() as V3;
  b.rod([kp[0], kp[1] - 0.01, kp[2] + 0.025], [kp[0], kp[1] - 0.15, kp[2] + 0.04], [0.012, 0.042], { color: LR, bone: hips });
  b.rod([kp[0], kp[1] - 0.15, kp[2] + 0.04], [kp[0], kp[1] - 0.17, kp[2] + 0.042], 0.044, { color: GOLD, bone: hips });
  for (let i = 0; i < 4; i++)
    b.capsule([kp[0] + (i - 1.5) * 0.02, kp[1] - 0.17, kp[2] + 0.042], [kp[0] + (i - 1.5) * 0.024, kp[1] - 0.23, kp[2] + 0.045], 0.007, { color: GOLD_L, bone: hips });
  // hive tool tucked in the sash
  b.extrude(
    [[-0.012, 0], [0.012, 0], [0.012, 0.19], [0.034, 0.2], [0.034, 0.228], [-0.012, 0.222]],
    { at: v(-0.14, 0.9, 0.15), x: [1, 0, 0], y: [0.15, 1, 0.12], thickness: 0.006, color: STEEL, bone: hips },
  );

  // collar
  b.lathe([[0.09, 0.0], [0.17, -0.04], [0.175, -0.02], [0.105, 0.045], [0.085, 0.045]], {
    at: v(0, 1.3, 0.01),
    color: paint((_p, _n, s) => (s[0] < -0.03 ? LG : LR)),
    bone: chest,
    segments: 12,
  });

  // ------------------------------------------------------------- legs / boots
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const ankle = legs[side][2];
    const x = s * 0.12 + BX;
    b.lathe([[0, 0], [0.08, 0], [0.085, 0.04], [0.08, 0.2], [0.09, 0.26], [0, 0.26]], {
      at: [x, 0.04, 0],
      bone: ankle,
      segments: 10,
      color: paint((_p, _n, sc) => (sc[0] > 0.2 && sc[0] < 0.212 ? LG : sc[0] > 0.212 ? LR : LB)),
    });
    b.part(ell(0.078, 0.064, 0.15, 10, 8), LB, { bone: ankle, at: [x, 0.062, 0.04] });
    b.part(ell(0.082, 0.024, 0.158, 10, 6), LR, { bone: ankle, at: [x, 0.018, 0.04] });
    b.part(ell(0.04, 0.036, 0.04, 8, 6), LG, { bone: ankle, at: [x, 0.07, 0.17] });
  }

  // ------------------------------------------------------------- head
  const skull = b.part(ell(0.145, 0.152, 0.14, 14, 10), SK, { bone: head, at: v(0, 1.56, 0.03) });
  b.part(ell(0.115, 0.085, 0.115, 12, 8), SK, { bone: jaw, at: v(0, 1.47, 0.045) });
  const jawPart = b.surface(b.root).nearest(v(0, 1.455, 0.2)); // jaw front for the mouth decal
  b.decal(skull, FACE, { at: v(0, 1.575, 0.17), dir: [0, 0, 1], size: [0.2, 0.1], segments: 12 });
  b.decal(jawPart.mesh, MOUTH, { at: v(0, 1.455, 0.16), dir: [0, 0, 1], size: [0.06, 0.03], bone: jaw });
  b.part(sph(0.034, 8, 6), BLUSH, { bone: head, at: v(0, 1.535, 0.172) });
  for (const s of [1, -1]) b.part(ell(0.02, 0.035, 0.026, 6, 5), SK, { bone: head, at: v(s * 0.148, 1.56, 0.02) });

  // moustache + beard
  for (const s of [1, -1])
    b.sweep(catmull([v(s * 0.008, 1.505, 0.166), v(s * 0.05, 1.492, 0.162), v(s * 0.09, 1.5, 0.142), v(s * 0.118, 1.525, 0.116)]), (t) => [0.012 + 0.014 * Math.sin(Math.PI * t) + 0.004, 0.012 + 0.008 * Math.sin(Math.PI * t)], {
      color: CREAM,
      bone: head,
      sides: 6,
      caps: { start: "flat", end: "point" },
    });
  for (let layer = 0; layer < 2; layer++) {
    const angs = layer === 0 ? [-72, -48, -24, 0, 24, 48, 72] : [-60, -36, -12, 12, 36, 60];
    for (const a of angs) {
      const r = (a * Math.PI) / 180;
      const lenY = (layer === 0 ? 0.17 : 0.12) - 0.0012 * Math.abs(a);
      const st: V3 = v(0.1 * Math.sin(r), 1.43, 0.045 + 0.105 * Math.cos(r));
      const en: V3 = [st[0] * 1.0 + Math.sin(r) * 0.03, st[1] - lenY, st[2] + 0.045 + (layer ? 0.02 : 0)];
      b.sweep(
        bezier(st, [st[0], st[1] - 0.05, st[2] + 0.045], [en[0], en[1] + 0.05, en[2] - 0.01], en),
        (t) => [0.03 * (1 - t) + 0.004, 0.018 * (1 - t) + 0.003],
        { color: layer === 0 ? BEARD : GOLD_L, bone: jaw, sides: 6, caps: { start: "flat", end: "point" } },
      );
    }
  }

  // veil hat
  const hatAt = v(0, 1.65, 0.03);
  b.lathe([[0.15, 0.0], [0.29, -0.012], [0.35, -0.05], [0.358, -0.04], [0.298, 0.006], [0.15, 0.014]], {
    at: hatAt,
    bone: head,
    color: BRIM,
    segments: 20,
  });
  const crown = b.lathe([[0, 0], [0.172, 0], [0.176, 0.05], [0.15, 0.115], [0.085, 0.15], [0, 0.16]], {
    at: hatAt,
    bone: head,
    segments: 16,
    color: paint((_p, _n, s) => (s[0] < 0.035 ? LR : s[0] < 0.046 ? LG : LB)),
  });
  b.decal(crown, EMBLEM, { at: v(0, 1.72, 0.2), dir: [0, 0.1, 1], size: [0.09, 0.09] });
  b.part(sph(0.024, 8, 6), LG, { bone: head, at: v(0, 1.815, 0.03) });
  b.part(new THREE.CylinderGeometry(0.3, 0.27, 0.34, 28, 1, true), "#ffffff", {
    bone: head,
    at: v(0, 1.47, 0.03),
    texture: VEIL,
  });
  b.sweep(circ(v(0, 1.64, 0.03), 0.3, 12), 0.012, { color: GOLD, bone: head, sides: 6 });
  b.sweep(circ(v(0, 1.31, 0.03), 0.272, 12), 0.017, { color: LR, bone: head, sides: 6 });
  b.along(circ(v(0, 1.31, 0.03), 0.275, 12), 14, (pt) => b.part(sph(0.014, 6, 4), GOLD, { at: pt, bone: head }));

  // ------------------------------------------------------------- hands
  const smokerCx = BX - 0.48;
  const smokerCz = armData.R.W[2] + 0.015 + 0.032;
  const smoker = b.joint("smoker", { parent: wrists.R, at: [smokerCx, 0.45, smokerCz] });
  const names = ["index", "middle", "ring", "pinky"];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const wj = wrists[side];
    const { W, E } = armData[side];
    const grip = s < 0;
    const x0 = W[0];
    const y0 = W[1] - 0.085;
    const z0 = W[2] + 0.015;
    b.part(ell(0.052, 0.054, 0.03, 8, 6), GLOVE, { bone: wj, at: [W[0], W[1] - 0.05, z0] });
    const d = new THREE.Vector3(W[0] - E[0], W[1] - E[1], W[2] - E[2]).normalize();
    b.lathe([[0.056, 0], [0.078, 0], [0.092, 0.06], [0.07, 0.062]], {
      at: [W[0] + d.x * 0.02, W[1] + d.y * 0.02, W[2] + d.z * 0.02],
      axis: [-d.x, -d.y, -d.z],
      bone: wj,
      segments: 10,
      color: paint((_p, _n, sc) => (sc[0] > 0.045 ? LG : LR)),
    });
    names.forEach((nm, i) => {
      const ox = (i - 1.5) * 0.022 * (grip ? 1 : 1);
      const fx = x0 + ox;
      let pts: V3[];
      if (grip) {
        const zc = z0 + 0.032;
        const yc = y0 - 0.032;
        const r = 0.022;
        pts = [
          [fx, yc + 0.03, zc - r],
          [fx, yc, zc - r],
          [fx, yc - r * 0.71, zc - r * 0.71],
          [fx, yc - r, zc],
          [fx, yc - r * 0.71, zc + r * 0.71],
          [fx, yc, zc + r],
          [fx, yc + r * 0.71, zc + r * 0.71],
        ];
      } else {
        const L = [0.9, 1.0, 1.05, 0.85][i];
        pts = [
          [fx, y0 + 0.01, z0],
          [fx, y0 - 0.025 * L, z0 + 0.004],
          [fx, y0 - 0.052 * L, z0 + 0.014],
          [fx, y0 - 0.07 * L, z0 + 0.03],
        ];
      }
      const fc = b.chain(`${nm}${side}`, catmull(pts), { parent: wj, role: "digit", count: 3 });
      b.sweep(fc, [i === 3 ? 0.0105 : 0.0118, 0.0088], { color: GLOVE, sides: 6 });
    });
    const xm = x0 - s * 0.04;
    const th = b.chain(`thumb${side}`, catmull([[xm, y0 + 0.03, z0 + 0.015], [xm - s * 0.008, y0 + 0.005, z0 + 0.04], [xm - s * 0.006, y0 - 0.012, z0 + 0.06]]), {
      parent: wj,
      role: "digit",
    });
    b.sweep(th, [0.014, 0.0105], { color: GLOVE, sides: 6 });
  }

  // ------------------------------------------------------------- smoker
  const canY = 0.34;
  const canPaint = paint((_p, _n, s) =>
    s[0] < 0.025 ? LR : s[0] < 0.035 ? LG : s[0] > 0.19 ? LR : s[0] > 0.175 ? LG : LB,
  );
  const can = b.lathe([[0, 0], [0.075, 0], [0.085, 0.025], [0.08, 0.19], [0.07, 0.205], [0.05, 0.22], [0, 0.225]], {
    at: [smokerCx, canY, smokerCz],
    bone: smoker,
    segments: 12,
    color: canPaint,
  });
  b.decal(can, SPRIG, { at: [smokerCx, canY + 0.1, smokerCz + 0.082], dir: [0, 0, 1], size: [0.08, 0.12] });
  b.decal(can, SPRIG, { at: [smokerCx, canY + 0.1, smokerCz - 0.082], dir: [0, 0, -1], size: [0.08, 0.12] });
  const tipP: V3 = [smokerCx, 0.63, smokerCz + 0.13];
  b.rod([smokerCx, 0.56, smokerCz + 0.03], tipP, [0.045, 0.022], { color: LR, bone: smoker });
  b.rod([tipP[0], tipP[1] - 0.012, tipP[2] - 0.014], tipP, 0.027, { color: GOLD, bone: smoker });
  glow(b.part(sph(0.018, 6, 4), EMBER, { bone: smoker, at: [tipP[0], tipP[1] + 0.004, tipP[2] + 0.004] }), 1.6);
  // bail handle + grip bar
  const bailZ = smokerCz;
  const bail: V3[] = [];
  for (const sx of [1, -1]) {
    const pts: V3[] = [
      [smokerCx + sx * 0.088, 0.5, bailZ],
      [smokerCx + sx * 0.092, 0.575, bailZ],
      [smokerCx + sx * 0.058, 0.628, bailZ],
      [smokerCx + sx * 0.02, 0.643, bailZ],
    ];
    if (sx > 0) bail.push(...pts);
    else bail.push(...pts.reverse());
  }
  b.sweep(catmull(bail), 0.006, { color: STEEL, bone: smoker, sides: 6 });
  b.rod([smokerCx - 0.055, 0.643, bailZ], [smokerCx + 0.055, 0.643, bailZ], 0.011, { color: GOLD, bone: smoker });
  for (const sx of [1, -1]) b.part(sph(0.012, 6, 4), GOLD, { bone: smoker, at: [smokerCx + sx * 0.088, 0.5, bailZ] });
  // bellows on the outer side
  const bx0 = smokerCx - 0.085;
  b.part(box(0.21, 0.014, 0.13), LR, { bone: smoker, at: [bx0 - 0.105, 0.47, smokerCz] });
  b.part(box(0.21, 0.014, 0.13), LR, { bone: smoker, at: [bx0 - 0.105, 0.36, smokerCz] });
  for (let i = 0; i < 5; i++) {
    const wide = i % 2 === 0;
    b.part(box(wide ? 0.19 : 0.17, 0.026, wide ? 0.125 : 0.11), LEATHER, { bone: smoker, at: [bx0 - 0.095, 0.372 + i * 0.022, smokerCz] });
  }
  b.part(sph(0.016, 6, 4), GOLD, { bone: smoker, at: [bx0 - 0.215, 0.47, smokerCz] });
  // smoke
  const puffs: [V3, number, string][] = [
    [[smokerCx, 0.7, smokerCz + 0.18], 0.04, "#d9d4cb"],
    [[smokerCx + 0.01, 0.78, smokerCz + 0.21], 0.055, "#cdc7be"],
    [[smokerCx - 0.01, 0.88, smokerCz + 0.2], 0.07, "#c0baB1"],
    [[smokerCx + 0.02, 1.0, smokerCz + 0.17], 0.085, "#b3ada5"],
    [[smokerCx, 1.14, smokerCz + 0.12], 0.1, "#a8a29a"],
  ];
  puffs.forEach(([p, r, c]) => b.part(new THREE.IcosahedronGeometry(r, 1), c, { bone: smoker, at: p, flat: true }));

  // ------------------------------------------------------------- hive
  const hive = b.joint("hive", { parent: hips, at: [HX, 0, 0] });
  const lid = b.joint("lid", { parent: hive, at: [HX, 1.07, -0.21], dir: [0, 0, 1], role: "hinge" });
  const HW = 0.5;
  const HD = 0.42;
  const legProfile: [number, number][] = [[0, 0], [0.035, 0], [0.03, 0.04], [0.022, 0.12], [0.03, 0.2], [0.04, 0.26], [0.045, 0.3], [0, 0.3]];
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      b.lathe(legProfile, {
        at: [HX + sx * 0.2, 0, sz * 0.17],
        bone: hive,
        segments: 8,
        color: paint((_p, _n, s) => (s[0] > 0.12 && s[0] < 0.14 ? LG : s[0] > 0.26 ? LG : LR)),
      });
    }
  for (const sz of [1, -1]) b.rod([HX - 0.2, 0.13, sz * 0.17], [HX + 0.2, 0.13, sz * 0.17], 0.01, { color: GOLD, bone: hive });
  for (const sx of [1, -1]) b.rod([HX + sx * 0.2, 0.13, -0.17], [HX + sx * 0.2, 0.13, 0.17], 0.01, { color: GOLD, bone: hive });
  b.part(box(0.56, 0.04, 0.5), LB, { bone: hive, at: [HX, 0.32, 0] });
  b.part(box(0.3, 0.018, 0.12), WOODP, { bone: hive, at: [HX, 0.322, 0.31] });
  b.part(box(0.3, 0.02, 0.012), LR, { bone: hive, at: [HX, 0.322, 0.372] });
  b.part(box(0.22, 0.03, 0.012), INK, { bone: hive, at: [HX, 0.365, HD / 2 + 0.002] }); // entrance slot

  const boxes = [
    { y0: 0.34, h: 0.27, body: LB, tex: PANEL_A, sup: false },
    { y0: 0.61, h: 0.27, body: LR, tex: PANEL_B, sup: false },
    { y0: 0.88, h: 0.19, body: LB, tex: PANEL_A, sup: true },
  ];
  const faces: { dir: V3; off: V3; w: number }[] = [
    { dir: [0, 0, 1], off: [0, 0, HD / 2 + 0.003], w: HW - 0.1 },
    { dir: [0, 0, -1], off: [0, 0, -(HD / 2 + 0.003)], w: HW - 0.1 },
    { dir: [1, 0, 0], off: [HW / 2 + 0.003, 0, 0], w: HD - 0.1 },
    { dir: [-1, 0, 0], off: [-(HW / 2 + 0.003), 0, 0], w: HD - 0.1 },
  ];
  for (const bx of boxes) {
    const cy = bx.y0 + bx.h / 2;
    b.part(box(HW, bx.h, HD), bx.body, { bone: hive, at: [HX, cy, 0] });
    for (const yy of [bx.y0 + 0.008, bx.y0 + bx.h - 0.01]) b.part(box(HW + 0.016, 0.02, HD + 0.016), LG, { bone: hive, at: [HX, yy, 0] });
    for (const sx of [1, -1])
      for (const sz of [1, -1]) b.part(box(0.02, bx.h, 0.02), LG, { bone: hive, at: [HX + (sx * HW) / 2, cy, (sz * HD) / 2] });
    const ph = bx.sup ? 0.12 : 0.17;
    faces.forEach((f, fi) => {
      const front = fi === 0;
      const at = (dy: number): V3 => [HX + f.off[0], cy + dy, f.off[2]];
      if (!(bx.sup && front))
        b.part(new THREE.PlaneGeometry(f.w, ph), "#ffffff", { bone: hive, at: at(-0.01), dir: f.dir, axis: "z", texture: bx.tex });
      b.part(new THREE.PlaneGeometry(f.w + 0.04, 0.02), "#ffffff", { bone: hive, at: at(bx.h / 2 - 0.032), dir: f.dir, axis: "z", texture: BORDER });
    });
  }
  // honey window on the super
  const winY = 0.88 + 0.085;
  glow(
    b.part(new THREE.PlaneGeometry(0.26, 0.1), "#ffffff", { bone: hive, at: [HX, winY - 0.01, HD / 2 + 0.003], dir: [0, 0, 1], axis: "z", texture: COMB }),
    0.8,
  );
  for (const [w, h, x, y] of [[0.29, 0.012, 0, 0.056], [0.29, 0.012, 0, -0.056], [0.012, 0.12, 0.139, 0], [0.012, 0.12, -0.139, 0]] as number[][])
    b.part(box(w, h, 0.012), LG, { bone: hive, at: [HX + x, winY - 0.01 + y, HD / 2 + 0.005] });
  // honey drips
  const drips: [number, number][] = [[-0.21, 0.09], [-0.16, 0.05], [0.0, 0.035], [0.16, 0.06], [0.21, 0.1]];
  for (const [dx, len] of drips) {
    glow(b.capsule([HX + dx, 1.06, HD / 2 + 0.008], [HX + dx, 1.06 - len, HD / 2 + 0.008], 0.014, { color: HONEY, bone: hive }), 0.6);
    glow(b.part(sph(0.021, 6, 4), HONEY, { bone: hive, at: [HX + dx, 1.06 - len, HD / 2 + 0.012] }), 0.6);
  }
  // roof
  b.extrude([[-0.3, 0], [0.3, 0], [0.3, 0.03], [0.04, 0.2], [-0.04, 0.2], [-0.3, 0.03]], {
    at: [HX, 1.07, 0],
    x: [1, 0, 0],
    thickness: 0.48,
    color: ROOF,
    bone: lid,
  });
  for (const sz of [1, -1]) {
    for (const sx of [1, -1]) b.rod([HX + sx * 0.31, 1.095, sz * 0.245], [HX + sx * 0.04, 1.275, sz * 0.245], 0.012, { color: GOLD, bone: lid });
    b.part(new THREE.CircleGeometry(0.07, 16), "#ffffff", { bone: lid, at: [HX, 1.13, sz * 0.2425], dir: [0, 0, sz], axis: "z", texture: EMBLEM });
    b.part(sph(0.03, 8, 6), LG, { bone: lid, at: [HX, 1.275, sz * 0.245] });
  }
  b.rod([HX, 1.272, -0.245], [HX, 1.272, 0.245], 0.018, { color: LG, bone: lid });
  b.lathe([[0, 0], [0.02, 0], [0.012, 0.03], [0.026, 0.05], [0, 0.07]], { at: [HX, 1.27, 0], bone: lid, segments: 8, color: LG });

  // ------------------------------------------------------------- bees
  function bee(p: V3, h: V3, bone: J, k = 1) {
    const hv = new THREE.Vector3(...h).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const side = new THREE.Vector3().crossVectors(hv, up);
    if (side.lengthSq() < 1e-4) side.set(1, 0, 0);
    side.normalize();
    const top = new THREE.Vector3().crossVectors(side, hv).normalize();
    const pt = (a: number, bb: number, c: number): V3 =>
      new THREE.Vector3(...p).addScaledVector(hv, a * k).addScaledVector(side, bb * k).addScaledVector(top, c * k).toArray() as V3;
    const hd = hv.toArray() as V3;
    const abd = new THREE.SphereGeometry(1, 8, 6).rotateX(Math.PI / 2).scale(0.0165 * k, 0.0165 * k, 0.027 * k);
    b.part(abd, BEEBODY, { bone, at: pt(-0.022, 0, 0), dir: hd, axis: "z" });
    b.part(sph(0.0145 * k, 6, 5), FUZZ, { bone, at: pt(0.012, 0, 0.002) });
    b.part(sph(0.0115 * k, 6, 5), INK, { bone, at: pt(0.033, 0, 0) });
    b.spike(pt(-0.045, 0, 0), hv.clone().multiplyScalar(-1), 0.012 * k, 0.004 * k, { color: INK, bone });
    for (const sg of [1, -1]) {
      const w = side.clone().multiplyScalar(sg * 0.8).addScaledVector(top, 0.6).normalize();
      b.extrude(
        [[0, 0.004 * k], [0.02 * k, 0.014 * k], [0.04 * k, 0.007 * k], [0.046 * k, -0.002 * k], [0.032 * k, -0.013 * k], [0.01 * k, -0.008 * k], [0, -0.004 * k]],
        { at: pt(0.012, sg * 0.008, 0.012), x: w.toArray() as V3, y: hd, thickness: 0.0025 * k, color: WING, bone, smoothing: 1 },
      );
    }
  }
  const swarm: [V3, V3, J, number][] = [
    [[HX - 0.15, 1.38, 0.4], [0.8, 0.2, -0.5], hive, 1],
    [[HX + 0.1, 1.5, 0.3], [-0.6, 0.1, 0.7], hive, 1],
    [[HX + 0.28, 1.28, 0.42], [0.3, 0.3, 0.9], hive, 1],
    [[HX - 0.32, 1.12, 0.5], [-0.9, 0.1, 0.3], hive, 1],
    [[HX + 0.05, 0.74, 0.55], [0.2, 0, 1], hive, 1],
    [[HX - 0.1, 0.35, 0.4], [0.1, 0, 1], hive, 1],
    [[HX + 0.08, 0.35, 0.26], [-0.3, 0, 1], hive, 1],
    [[HX - 0.48, 1.3, 0.1], [0.6, 0.3, 0.4], hive, 1],
    [[HX + 0.4, 1.02, 0.3], [0.5, -0.1, 0.8], hive, 1],
    [[BX + 0.32, 1.56, 0.42], [-1, 0, 0.3], head, 1],
    [[BX + 0.2, 1.676, 0.18], [0.4, 0, 1], head, 1],
  ];
  for (const [p, h, bone, k] of swarm) bee(p, h, bone, k * (0.95 + rand() * 0.15) * 1.6);

  return b.root;
}
```