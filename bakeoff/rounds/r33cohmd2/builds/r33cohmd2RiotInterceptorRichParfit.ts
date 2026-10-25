import * as THREE from "three";
import { createBuilder, type Builder, type Joint, paint, svg, noise, mix, smoothstep, rng, frame, countershade } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { metal, panelled, gaugeTexture } from "../../../../kits/clockwork";

export const meta = {
  "name": "Riot Interceptor RX-9",
  "description": "A corporate riot-control interceptor: a low armored wedge hover-truck with a roof-mounted water cannon and neon light bars, in Cyberpunk 2077 style."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  hull: "#2a2e38",
  hullDark: "#14161c",
  panelWhite: "#d9dde3",
  hazard: "#f2c200",
  neonCyan: "#2ff3ff",
  neonMagenta: "#ff2bd6",
  warnRed: "#ff2a3c",
  orange: "#ff7a1a",
  glass: "#0b2a3a",
  tire: "#0d0d10",
  steel: "#7b8494",
  brass: "#b98a3c",
  water: "#6fd8ff",
  ink: "#08080c",
};
const M = {
  deckTop: [0, 1.35, 0] as [number, number, number],
  roofFront: [0, 1.75, 0.3] as [number, number, number],
  turretRing: [0, 1.75, -1.3] as [number, number, number],
  muzzle: [0, 2, 1.2] as [number, number, number],
  noseTip: [0, 0.7, 2.9] as [number, number, number],
  axleFront: [0, 0.5, 1.8] as [number, number, number],
  axleRear: [0, 0.5, -1.8] as [number, number, number],
  cabinBase: [0, 1.3, 0.2] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // chassisLower
  (() => {
type Ctx = { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, number[]> };

function buildChassisLower({ b, J, P }: Ctx) {
  const bone = J.body;
  const R = rng(11);

  // Paints: graphite hull, panelled, scuffed and grimy near the bottom
  const hullBase = paint((p, n) => {
    const grime = smoothstep(0.75, 0.3, p.y) * (0.35 + 0.65 * noise(p, 0.18, 4));
    const scuff = smoothstep(0.62, 0.78, noise(p, 0.05, 9)) * 0.35;
    const top = smoothstep(0.2, 1, n.y) * 0.12;
    let c = mix(P.hull, P.hullDark, grime * 0.8);
    c = mix(c, "#6b7380", scuff);
    return mix(c, "#4a5262", top);
  });
  const HULL = panelled(hullBase, { size: 0.45, aspect: 0.6, rivets: 0.09, seam: P.ink });
  const DARK = paint((p) => mix(P.hullDark, "#000000", 0.3 * noise(p, 0.1, 2)));
  const STEEL = metal("steel", { tarnish: 0.4 });

  // Hazard chevron texture
  const CHEV = svg(
    `<svg viewBox="0 0 128 24"><rect width="128" height="24" fill="${P.hazard}"/>` +
      Array.from({ length: 9 }, (_, i) => `<path d="M${i * 16 - 6} 0 L${i * 16 + 6} 12 L${i * 16 - 6} 24 L${i * 16 - 14} 24 L${i * 16 - 2} 12 L${i * 16 - 14} 0Z" fill="${P.ink}"/>`).join("") +
      `</svg>`,
    { size: 256 },
  );
  const WARN = svg(
    `<svg viewBox="0 0 96 32"><rect width="96" height="32" fill="${P.panelWhite}"/><rect x="1" y="1" width="94" height="30" fill="none" stroke="${P.warnRed}" stroke-width="2"/><text x="48" y="14" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="11" fill="${P.warnRed}">CAUTION</text><text x="48" y="26" text-anchor="middle" font-family="monospace" font-size="8" fill="${P.ink}">RX-9 CORP SEC</text></svg>`,
    { size: 256 },
  );
  const VENT = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#08080c"/>` +
      Array.from({ length: 6 }, (_, i) => `<rect x="4" y="${3 + i * 5}" width="56" height="2.5" fill="#3a3f4c"/>`).join("") +
      `</svg>`,
    { size: 128 },
  );

  const box = (w: number, h: number, d: number, col: any, at: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone, at, ...extra });

  // Main lower hull: loft-like stacked boxes (lower belly + upper body)
  b.loft(
    [
      { at: [0, 0.78, -2.85], w: 2.3, h: 0.9 },
      { at: [0, 0.78, -1.5], w: 2.5, h: 1.0 },
      { at: [0, 0.8, 0.5], w: 2.5, h: 1.1 },
      { at: [0, 0.8, 1.6], w: 2.5, h: 1.1 },
      { at: [0, 0.76, 2.15], w: 2.3, h: 0.95 },
    ],
    { bone, color: HULL, section: "box", caps: "flat", name: "hullLoft" },
  );
  // Floor pan and skid plate
  box(2.3, 0.08, 4.9, DARK, [0, 0.24, -0.35]);
  box(1.5, 0.05, 3.2, STEEL, [0, 0.2, -0.1]);
  for (let i = 0; i < 5; i++) box(1.5, 0.04, 0.05, P.ink, [0, 0.17, -1.5 + i * 0.7]);

  // Upper deck plate
  box(2.3, 0.05, 4.9, P.hullDark, [0, 1.33, -0.35]);

  // Side skirts, hazard chevrons, underglow, wheel arches
  const wheelZ = [1.8, -1.8];
  for (const s of [1, -1]) {
    box(0.14, 0.3, 2.7, HULL, [s * 1.3, 0.46, 0]);
    b.part(new THREE.PlaneGeometry(2.6, 0.2), "#ffffff", {
      bone, at: [s * 1.376, 0.46, 0], dir: [s, 0, 0], axis: "z", texture: CHEV,
    });
    // Warning decal
    b.part(new THREE.PlaneGeometry(0.5, 0.17), "#ffffff", {
      bone, at: [s * 1.305, 0.95, 0.5], dir: [s, 0, 0], axis: "z", texture: WARN,
    });
    // underglow magenta
    glow(box(0.06, 0.05, 3.9, P.neonMagenta, [s * 1.12, 0.18, 0]), 2);
    glow(box(0.06, 0.05, 3.9, P.neonMagenta, [s * 1.12, 0.18, 0]), 2);
    // exhaust vent panel on side
    b.part(new THREE.PlaneGeometry(0.5, 0.25), "#ffffff", {
      bone, at: [s * 1.305, 0.75, -0.7], dir: [s, 0, 0], axis: "z", texture: VENT,
    });
    // Fender flares around wheel arches
    for (const z of wheelZ) {
      b.part(new THREE.TorusGeometry(0.58, 0.07, 5, 12, Math.PI), HULL, {
        bone, at: [s * 1.27, 0.5, z * 0.9], dir: [s, 0, 0], axis: "z", rotation: [0, 0, 0], name: "flare", scale: [0.85, 0.85, 1],
      });
      box(0.22, 0.1, 1.0, HULL, [s * 1.2, 1.12, z * 0.9]);
      box(0.2, 0.55, 0.12, DARK, [s * 1.2, 0.88, z * 0.9 - 0.5]);
      box(0.2, 0.55, 0.12, DARK, [s * 1.2, 0.88, z * 0.9 + 0.5 - (z > 0 ? 0.12 : 0)]);
    }
    // tow hooks front and rear
    for (const z of [2.05, -2.75]) {
      const dz = z > 0 ? 1 : -1;
      box(0.1, 0.12, 0.12, STEEL, [s * 0.8, 0.4, z]);
      b.part(new THREE.TorusGeometry(0.06, 0.02, 5, 8), STEEL, { bone, at: [s * 0.8, 0.36, z + dz * 0.1], dir: [1, 0, 0], axis: "z" });
    }
    // rear tail lights
    glow(box(0.7, 0.16, 0.05, P.warnRed, [s * 0.75, 0.98, -2.87]), 2.2);
    box(0.78, 0.22, 0.04, P.ink, [s * 0.75, 0.98, -2.85]);
    // exhaust pipes
    b.part(new THREE.CylinderGeometry(0.07, 0.08, 0.2, 8), STEEL, { bone, at: [s * 0.5, 0.45, -2.78], dir: [0, 0, 1], axis: "y" });
    glow(b.part(new THREE.CircleGeometry(0.055, 8), P.orange, { bone, at: [s * 0.5, 0.45, -2.89], dir: [0, 0, -1], axis: "z" }), 1.2);
    // underglow end caps
    glow(box(0.06, 0.05, 0.4, P.neonMagenta, [s * 0.6, 0.18, 1.9]), 1.5);
    // bolts on skirt
    for (let i = 0; i < 5; i++) b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.03, 6), STEEL, { bone, at: [s * 1.385, 0.52, -1 + i * 0.5], dir: [1, 0, 0] });
  }

  // Rear bumper
  box(2.5, 0.38, 0.1, HULL, [0, 0.55, -2.84]);
  box(2.1, 0.1, 0.06, P.hazard, [0, 0.38, -2.86]);
  b.part(new THREE.PlaneGeometry(0.5, 0.17), "#ffffff", { bone, at: [0, 0.75, -2.895], dir: [0, 0, -1], axis: "z", texture: WARN });
  b.part(new THREE.PlaneGeometry(1.4, 0.08), "#ffffff", { bone, at: [0, 0.3, -2.895], dir: [0, 0, -1], axis: "z", texture: CHEV });
  // rear vent grille
  b.part(new THREE.PlaneGeometry(0.9, 0.3), "#ffffff", { bone, at: [0, 1.15, -2.9], dir: [0, 0, -1], axis: "z", texture: VENT });

  // Mid-skid plates and diagonal braces under front
  box(1.2, 0.05, 0.6, STEEL, [0, 0.19, 1.85]);
  box(1.2, 0.05, 0.6, STEEL, [0, 0.19, -2.4]);
  // Hazard stripe along the top edge of hull front-bottom
  box(2.4, 0.06, 0.04, P.orange, [0, 0.33, 2.17]);

  // grime/scuff dots: small bolts on deck plate
  for (let i = 0; i < 14; i++) {
    const x = (R() - 0.5) * 2.0;
    const z = -2.6 + R() * 4.6;
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 6), STEEL, { bone, at: [x, 1.36, z] });
  }
}
    return buildChassisLower;
  })(),
  // wheels
  (() => {
type Ctx = { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, number[]> };

function buildWheels({ b, J, P, M }: Ctx) {
  const R = 0.5;
  const W = 0.4; // tire width
  const ORANGE = P.orange;

  // Tire paint: scuffed rubber, grimier near the ground
  const tirePaint = paint((p, n) => {
    const g = noise(p, 0.06, 3);
    const base = mix("#0a0a0d", "#25252c", g * 0.8);
    return mix(base, "#3a3328", smoothstep(0.25, 0.0, p.y) * 0.5 * noise(p, 0.1, 9));
  });
  const hubPaint = metal("steel", { tarnish: 0.4, polish: 0.3 });

  // Hubcap drawing: bolts + hazard chevrons, grey so it is tinted by colour
  const hubTex = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#cfd4dc" stroke="#222" stroke-width="3"/>
      <circle cx="50" cy="50" r="36" fill="none" stroke="#555" stroke-width="3"/>
      <g fill="#777" stroke="#222" stroke-width="1.5">
        ${[0, 1, 2, 3, 4, 5]
          .map((i) => {
            const a = (i * Math.PI) / 3;
            return `<circle cx="${50 + 28 * Math.cos(a)}" cy="${50 + 28 * Math.sin(a)}" r="5"/>`;
          })
          .join("")}
      </g>
      <path d="M38 50 L50 38 L62 50 L50 62Z" fill="#444"/>
      <circle cx="50" cy="50" r="6" fill="#999" stroke="#222" stroke-width="2"/>
    </svg>`,
    { size: 192 },
  );

  const wheels: [string, number, number, number][] = [
    ["wheelFL", 1, 1.15, 1.8],
    ["wheelFR", -1, -1.15, 1.8],
    ["wheelRL", 1, 1.15, -1.8],
    ["wheelRR", -1, -1.15, -1.8],
  ];

  for (const [jn, s, x, z] of wheels) {
    const bone = J[jn];
    const cx = x;
    const cy = R;
    const ax: [number, number, number] = [s, 0, 0]; // outward axle direction
    const at = (o: number, y = 0, zz = 0) => [cx + s * o, cy + y, z + zz] as [number, number, number];

    // Tire: lathe profile (x = radius from axle, y = along axle)
    const hw = W / 2;
    b.lathe(
      [
        [0.3, -hw],
        [R - 0.07, -hw],
        [R - 0.01, -hw + 0.06],
        [R, -hw * 0.5],
        [R, hw * 0.5],
        [R - 0.01, hw - 0.06],
        [R - 0.07, hw],
        [0.3, hw],
      ],
      { at: at(0), axis: ax, segments: 20, color: tirePaint, bone, name: `tire.${jn}` },
    );

    // Tread blocks around circumference
    const blocks: THREE.BufferGeometry[] = [];
    const N = 20;
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      const g = new THREE.BoxGeometry(W * 0.92, 0.035, 0.1);
      // box x along axle; rotate about X so it sits radially
      g.translate(0, R + 0.012, 0);
      g.rotateX(a);
      blocks.push(g);
    }
    // merge manually via parts is too many; build merged geometry
    const merged = mergeSimple(blocks);
    b.part(merged, "#17171c", { bone, at: at(0), name: `treads.${jn}` });

    // Sidewall hubcap (outer): steel disc with texture
    const outer = hw + 0.012;
    b.part(new THREE.CircleGeometry(0.3, 20), P.steel, {
      bone,
      at: at(outer),
      dir: ax,
      axis: "z",
      texture: hubTex,
      name: `hubcap.${jn}`,
    });
    // Armored hub dome
    b.lathe(
      [
        [0, 0],
        [0.3, 0],
        [0.3, 0.02],
        [0.2, 0.04],
        [0.1, 0.06],
        [0, 0.07],
      ],
      { at: at(hw), axis: ax, segments: 12, color: hubPaint, bone, name: `dome.${jn}` },
    );
    // Bolts
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.3;
      const y = Math.cos(a) * 0.23;
      const zz = Math.sin(a) * 0.23;
      b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.03, 6), "#a9b1c0", {
        bone,
        at: at(hw + 0.045, y, zz),
        dir: ax,
        name: `bolt.${jn}`,
      });
    }
    // Glowing cyan hub ring
    glow(
      b.lathe(
        [
          [0.33, 0],
          [0.37, 0],
          [0.37, 0.025],
          [0.33, 0.025],
        ],
        { at: at(hw - 0.005), axis: ax, segments: 20, color: P.neonCyan, bone, name: `ring.${jn}` },
      ),
      2,
    );
    // Inner glow ring on inboard side
    glow(
      b.lathe(
        [
          [0.31, 0],
          [0.36, 0],
          [0.36, 0.02],
          [0.31, 0.02],
        ],
        { at: at(-hw - 0.02), axis: ax, segments: 20, color: P.neonCyan, bone, name: `ringIn.${jn}` },
      ),
      1.5,
    );

    // Brake disc inboard
    b.lathe(
      [
        [0.08, 0],
        [0.3, 0],
        [0.3, 0.02],
        [0.08, 0.02],
      ],
      { at: at(-hw + 0.03), axis: ax, segments: 16, color: metal("steel", { polish: 0.1 }), bone, name: `disc.${jn}` },
    );
    // Orange caliper (rides the wheel bone; stays small)
    b.part(new THREE.BoxGeometry(0.07, 0.14, 0.1), ORANGE, {
      bone,
      at: at(-hw + 0.03, 0.2, 0.08),
      name: `caliper.${jn}`,
    });
    // Axle stub
    b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.3, 8), P.steel, {
      bone,
      at: at(-hw - 0.1),
      dir: ax,
      name: `stub.${jn}`,
    });
    // Mud flap / mudguard strip on rear edge of tire, tucked under hull
    b.part(new THREE.BoxGeometry(0.02, 0.2, 0.3), P.hullDark, {
      bone: J.body,
      at: [cx + s * (hw + 0.02), 0.32, z + (z > 0 ? -0.52 : -0.35)],
      name: `flap.${jn}`,
    });
    // Hazard stripe on outer sidewall edge
    b.lathe(
      [
        [R - 0.12, 0],
        [R - 0.07, 0],
        [R - 0.07, 0.012],
        [R - 0.12, 0.012],
      ],
      {
        at: at(hw + 0.003),
        axis: ax,
        segments: 20,
        color: paint((p) => (Math.floor((Math.atan2(p.y - cy, p.z - z) + 3.1416) / 0.3) % 2 ? P.hazard : P.ink)),
        bone,
        name: `hazard.${jn}`,
      },
    );
  }

  // Merge helper: combine non-indexed copies
  function mergeSimple(geos: THREE.BufferGeometry[]) {
    const pos: number[] = [];
    const nor: number[] = [];
    const uv: number[] = [];
    for (const g0 of geos) {
      const g = g0.toNonIndexed();
      pos.push(...(g.getAttribute("position").array as any));
      nor.push(...(g.getAttribute("normal").array as any));
      uv.push(...(g.getAttribute("uv").array as any));
    }
    const out = new THREE.BufferGeometry();
    out.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    out.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
    out.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    return out;
  }
}
    return buildWheels;
  })(),
  // noseRam
  (() => {
function buildNoseRam({ b, J, P, M }: Ctx) {
  const body = J.body;
  const R = rng(11);

  // ---------- paints ----------
  const scuff = (base: string, dark: string) =>
    paint((p, n) => {
      const g = noise(p, 0.12, 3);
      const low = smoothstep(0.7, 0.3, p.y);
      let c = mix(base, dark, 0.5 * low * g + 0.15 * smoothstep(0.6, 0.9, noise(p, 0.03, 8)));
      return mix(c, "#ffffff", 0.08 * smoothstep(0.6, 1, n.y));
    });
  const HULL = panelled(scuff(P.hull, P.hullDark), { size: 0.3, aspect: 0.6, rivets: 0.05 });
  const HULLP = scuff(P.hull, P.hullDark);
  const STEEL = metal("steel", { tarnish: 0.4 });
  const hazardPaint = paint((p, n, s) => {
    const k = Math.floor((p.x + p.y) / 0.07);
    return k % 2 ? P.hazard : P.ink;
  });

  // ---------- textures ----------
  const chev = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#f2c200"/>` +
      Array.from({ length: 8 }, (_, i) => `<path d="M${i * 10 - 6} 0 L${i * 10 + 2} 0 L${i * 10 + 12} 32 L${i * 10 + 4} 32Z" fill="#08080c"/>`).join("") +
      `</svg>`,
    { size: 128 },
  );
  const badge = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#08080c" stroke="#2ff3ff" stroke-width="3"/><path d="M32 8 L54 46 L10 46Z" fill="none" stroke="#d9dde3" stroke-width="4"/><circle cx="32" cy="34" r="6" fill="#ff2a3c"/><path d="M14 54 H50" stroke="#f2c200" stroke-width="3"/></svg>`,
    { size: 128 },
  );
  const plate = svg(
    `<svg viewBox="0 0 120 40"><rect width="120" height="40" rx="4" fill="#d9dde3" stroke="#08080c" stroke-width="3"/><rect x="4" y="4" width="112" height="9" fill="#ff7a1a"/><text x="60" y="12" font-size="8" font-family="monospace" font-weight="bold" text-anchor="middle" fill="#08080c">NCPD-CORP RIOT</text><text x="60" y="34" font-size="20" font-family="monospace" font-weight="bold" text-anchor="middle" fill="#08080c">RX-9 0427</text></svg>`,
    { size: 256 },
  );
  const grille = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#08080c"/>` +
      Array.from({ length: 8 }, (_, i) => `<rect x="3" y="${2 + i * 3.8}" width="58" height="2" fill="#4b5262"/>`).join("") +
      Array.from({ length: 9 }, (_, i) => `<rect x="${3 + i * 7.2}" y="0" width="1" height="32" fill="#14161c"/>`).join("") +
      `<rect x="0" y="28" width="64" height="4" fill="#2ff3ff" opacity="0.6"/></svg>`,
    { size: 128 },
  );
  const warn = svg(
    `<svg viewBox="0 0 100 24"><rect width="100" height="24" fill="#08080c"/><text x="50" y="17" font-size="14" font-family="monospace" font-weight="bold" text-anchor="middle" fill="#f2c200">STAND CLEAR</text></svg>`,
    { size: 192 },
  );

  // ---------- helpers ----------
  const box = (sz: [number, number, number], col: any, at: [number, number, number], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(...sz), col, { bone: body, at, ...extra });

  // ---------- nose wedge (loft) ----------
  b.frustumBox([0, 0.75, 2.1], [0, 0.7, 2.88], [2.56, 1.0], [2.1, 0.5], { bone: body, color: HULL });
  // hood slope on top meeting deckTop
  b.frustumBox([0, 1.2, 2.1], [0, 0.98, 2.75], [2.5, 0.2], [2.0, 0.1], { bone: body, color: HULLP });
  // hood centre ridge
  b.part(new THREE.BoxGeometry(0.5, 0.05, 0.6), P.hullDark, { bone: body, at: [0, 1.17, 2.35], rotation: [-14, 0, 0] });
  // side armour plates
  for (const s of [1, -1]) {
    b.extrude(
      [[0, 0], [0.7, 0.05], [0.7, 0.5], [0.05, 0.6]],
      { at: [s * 1.29, 0.5, 2.1], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.05, color: HULLP, bone: body, bevel: 0.01 },
    );
    // hazard stripe on plate
    b.part(new THREE.PlaneGeometry(0.5, 0.12), "#ffffff", { bone: body, at: [s * 1.325, 0.55, 2.4], dir: [s, 0, 0], axis: "z", texture: chev });
  }

  // ---------- grille ----------
  b.part(new THREE.PlaneGeometry(1.2, 0.34), "#ffffff", { bone: body, at: [0, 0.72, 2.935], dir: [0, 0.15, 1], axis: "z", texture: grille });
  b.part(new THREE.BoxGeometry(1.3, 0.04, 0.05), STEEL, { bone: body, at: [0, 0.9, 2.9] });
  b.part(new THREE.BoxGeometry(1.3, 0.04, 0.05), STEEL, { bone: body, at: [0, 0.54, 2.9] });
  for (const s of [1, -1]) b.part(new THREE.BoxGeometry(0.04, 0.38, 0.05), STEEL, { bone: body, at: [s * 0.65, 0.72, 2.9] });

  // ---------- headlights ----------
  for (const s of [1, -1]) {
    const hx = s * 0.92;
    glow(
      b.extrude([[0, 0], [0.5, 0.04], [0.55, 0.2], [0.05, 0.16]], {
        at: [hx - s * 0.27, 0.8, 2.82], x: [s, 0, 0], thickness: 0.06, color: "#ffffff", bone: body, bevel: 0.01,
      }),
      1.8,
    );
    b.part(new THREE.BoxGeometry(0.62, 0.03, 0.08), P.ink, { bone: body, at: [hx, 0.99, 2.8] });
    b.part(new THREE.BoxGeometry(0.62, 0.03, 0.08), P.ink, { bone: body, at: [hx, 0.78, 2.82] });
    glow(b.part(new THREE.BoxGeometry(0.5, 0.025, 0.04), P.neonCyan, { bone: body, at: [hx, 0.73, 2.85] }), 2);
    glow(b.part(new THREE.BoxGeometry(0.025, 0.2, 0.04), P.neonCyan, { bone: body, at: [s * 0.62, 0.9, 2.85] }), 2);
  }

  // ---------- push bar ram ----------
  const barZ = 2.82;
  b.part(new THREE.BoxGeometry(2.3, 0.2, 0.18), hazardPaint, { bone: body, at: [0, 0.4, barZ - 0.05] });
  b.part(new THREE.BoxGeometry(2.34, 0.04, 0.2), STEEL, { bone: body, at: [0, 0.51, barZ - 0.05] });
  b.part(new THREE.BoxGeometry(2.34, 0.04, 0.2), STEEL, { bone: body, at: [0, 0.29, barZ - 0.05] });
  b.part(new THREE.PlaneGeometry(0.9, 0.1), "#ffffff", { bone: body, at: [0, 0.4, barZ + 0.045], dir: [0, 0, 1], axis: "z", texture: chev });
  for (const s of [1, -1]) {
    for (const x of [0.35, 0.9, 1.1]) b.part(new THREE.BoxGeometry(0.1, 0.1, 0.12), STEEL, { bone: body, at: [s * x, 0.4, barZ + 0.05] });
    // struts into nose
    b.rod([s * 0.9, 0.42, barZ - 0.1], [s * 0.9, 0.48, 2.6], 0.05, STEEL, { bone: body, sides: 6 });
    b.rod([s * 0.35, 0.42, barZ - 0.1], [s * 0.35, 0.48, 2.6], 0.05, STEEL, { bone: body, sides: 6 });
    // vertical guard bars
    b.rod([s * 1.18, 0.3, barZ - 0.05], [s * 1.18, 0.95, barZ - 0.1], 0.045, STEEL, { bone: body, sides: 6 });
    b.rod([s * 1.18, 0.95, barZ - 0.1], [s * 1.2, 1.0, 2.6], 0.04, STEEL, { bone: body, sides: 6 });
    // bolts
    for (let i = 0; i < 4; i++) {
      b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.02, 6), P.brass, { bone: body, at: [s * (0.5 + i * 0.22), 0.4, barZ + 0.115], dir: [0, 0, 1] });
    }
  }

  // ---------- splitter neon ----------
  b.part(new THREE.BoxGeometry(2.1, 0.06, 0.5), P.hullDark, { bone: body, at: [0, 0.27, 2.7] });
  glow(b.part(new THREE.BoxGeometry(2.0, 0.025, 0.04), P.neonCyan, { bone: body, at: [0, 0.3, 2.95] }), 2.5);
  glow(b.part(new THREE.BoxGeometry(0.04, 0.025, 0.35), P.neonCyan, { bone: body, at: [1.0, 0.3, 2.78] }), 2.5);
  glow(b.part(new THREE.BoxGeometry(0.04, 0.025, 0.35), P.neonCyan, { bone: body, at: [-1.0, 0.3, 2.78] }), 2.5);

  // ---------- badge, plate, warning ----------
  b.part(new THREE.CircleGeometry(0.13, 16), "#ffffff", { bone: body, at: [0, 1.03, 2.62], dir: [0, 0.45, 1], axis: "z", texture: badge });
  b.part(new THREE.BoxGeometry(0.58, 0.2, 0.02), P.ink, { bone: body, at: [0, 0.57, 2.945] });
  b.part(new THREE.PlaneGeometry(0.54, 0.18), "#ffffff", { bone: body, at: [0, 0.57, 2.96], dir: [0, 0, 1], axis: "z", texture: plate });
  b.part(new THREE.PlaneGeometry(0.7, 0.17), "#ffffff", { bone: body, at: [0, 1.13, 2.5], dir: [0, 0.45, 1], axis: "z", texture: warn });
  glow(b.part(new THREE.PlaneGeometry(0.7, 0.17), "#ffffff", { bone: body, at: [0, 1.135, 2.502], dir: [0, 0.45, 1], axis: "z", texture: warn }), 0.9);

  // ---------- sirens ----------
  [[1, P.warnRed], [-1, "#2a5bff"]].forEach(([s, col]: any) => {
    b.part(new THREE.CylinderGeometry(0.1, 0.12, 0.05, 8), P.hullDark, { bone: body, at: [s * 1.12, 0.56, 2.9] });
    glow(b.part(new THREE.SphereGeometry(0.1, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), col, { bone: body, at: [s * 1.12, 0.58, 2.9] }), 2.2);
    b.part(new THREE.BoxGeometry(0.2, 0.015, 0.02), P.ink, { bone: body, at: [s * 1.12, 0.64, 2.9] });
  });

  // ---------- tow shackles ----------
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.1, 0.12, 0.06), P.orange, { bone: body, at: [s * 0.5, 0.33, 2.86] });
    b.part(new THREE.TorusGeometry(0.06, 0.016, 5, 10), P.orange, { bone: body, at: [s * 0.5, 0.27, 2.93], rotation: [90, 0, 0] });
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.14, 6), STEEL, { bone: body, at: [s * 0.5, 0.33, 2.87], rotation: [0, 0, 90] });
  }

  // ---------- hood vents and lower accents ----------
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      b.part(new THREE.BoxGeometry(0.3, 0.015, 0.03), P.ink, { bone: body, at: [s * 0.8, 1.14 - i * 0.025, 2.3 + i * 0.1], rotation: [-14, 0, 0] });
    }
    glow(b.part(new THREE.BoxGeometry(0.02, 0.1, 0.5), P.orange, { bone: body, at: [s * 1.3, 0.95, 2.35] }), 1.4);
  }
  // wiper-cowl lip at deck
  b.part(new THREE.BoxGeometry(2.3, 0.05, 0.12), P.hullDark, { bone: body, at: [0, 1.21, 2.12] });
  // antenna stub
  b.rod([0.9, 1.15, 2.2], [0.9, 1.38, 2.18], [0.012, 0.006], P.ink, { bone: body, sides: 5 });
  void R; void frame; void M;
}
    return buildNoseRam;
  })(),
  // cabin
  (() => {
function buildCabin({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const R = rng(11);
  const X0 = 1.2, Y0 = 1.3, Y1 = 1.8, Z0 = -1, Z1 = 1.4;
  const roofY = 1.78;

  // ---------- paints ----------
  const WHITE = paint((p, n) => {
    const base = mix("#d9dde3", "#aeb4bf", smoothstep(0.3, -0.8, n.y));
    const scuff = smoothstep(0.62, 0.8, noise(p, 0.08, 4));
    return mix(base, "#8a8f99", scuff * 0.5);
  });
  const WHITEP = panelled(WHITE, { size: 0.4, aspect: 0.6, rivets: 0.08, seam: "#3a3e48" });
  const HULLP = panelled(
    paint((p, n) => mix("#2a2e38", "#14161c", smoothstep(0.2, -0.8, n.y) * 0.7 + 0.2 * noise(p, 0.1, 2))),
    { size: 0.3, rivets: 0.06, seam: "#08080c" },
  );
  const GLASS = paint((p, n) => mix("#0b2a3a", "#16506a", smoothstep(0.1, 0.9, n.y) * 0.6 + 0.2 * noise(p, 0.3, 7)));

  // ---------- textures ----------
  const streaks = svg(
    `<svg viewBox="0 0 100 60"><rect width="100" height="60" fill="#0b2a3a"/>
    <path d="M10 60 L40 0 L52 0 L22 60Z" fill="#2ff3ff" opacity="0.22"/>
    <path d="M45 60 L75 0 L80 0 L50 60Z" fill="#2ff3ff" opacity="0.16"/>
    <path d="M70 60 L95 5 L99 5 L76 60Z" fill="#ff2bd6" opacity="0.18"/></svg>`,
    { size: 256 },
  );
  const mesh = svg(
    `<svg viewBox="0 0 32 32"><rect width="32" height="32" fill="none"/>
    <path d="M0 0L32 32M32 0L0 32M16 0L32 16M0 16L16 32M16 0L0 16M32 16L16 32" stroke="#08080c" stroke-width="2.4" fill="none"/>
    <rect x="0" y="0" width="32" height="32" fill="none" stroke="#08080c" stroke-width="4"/></svg>`,
    { size: 128 },
  );
  const logo = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#14161c" stroke="#ff2a3c" stroke-width="6"/>
    <path d="M26 66 L50 24 L74 66 L62 66 L50 44 L38 66Z" fill="#f2c200"/>
    <rect x="30" y="72" width="40" height="7" fill="#d9dde3"/></svg>`,
    { size: 192 },
  );
  const livery = svg(
    `<svg viewBox="0 0 200 80"><rect x="0" y="0" width="200" height="80" fill="none"/>
    <path d="M0 62 L40 20 L70 20 L30 62Z M44 62 L84 20 L114 20 L74 62Z" fill="#f2c200"/>
    <text x="104" y="34" font-family="sans-serif" font-weight="bold" font-size="22" fill="#14161c">RIOT CTRL</text>
    <text x="104" y="62" font-family="monospace" font-weight="bold" font-size="26" fill="#ff2a3c">RX-09</text>
    <rect x="100" y="40" width="96" height="3" fill="#14161c"/></svg>`,
    { size: 384 },
  );
  const hud = svg(
    `<svg viewBox="0 0 80 50"><rect width="80" height="50" fill="#031418"/>
    <path d="M4 40 L16 28 L28 34 L42 14 L56 24 L76 8" stroke="#2ff3ff" stroke-width="2.4" fill="none"/>
    <circle cx="60" cy="36" r="9" fill="none" stroke="#ff2bd6" stroke-width="2"/>
    <rect x="6" y="6" width="26" height="5" fill="#2ff3ff"/><rect x="6" y="15" width="16" height="3" fill="#2ff3ff" opacity="0.6"/></svg>`,
    { size: 192 },
  );
  const visor = svg(
    `<svg viewBox="0 0 40 40"><rect width="40" height="40" fill="#1a1c22"/>
    <rect x="4" y="14" width="32" height="11" rx="3" fill="#2ff3ff"/><rect x="4" y="27" width="32" height="3" fill="#08080c"/></svg>`,
    { size: 64 },
  );

  const part = (g: THREE.BufferGeometry, c: any, at: number[], o: any = {}) => b.part(g, c, { bone, at, ...o });
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

  // ---------- roof ----------
  part(box(2.1, 0.07, 2.0), WHITEP, [0, roofY, 0.15]);
  part(box(2.2, 0.05, 2.1), HULLP, [0, roofY - 0.06, 0.15]);
  const tex = (w: number, h: number) => new THREE.PlaneGeometry(w, h);
  b.part(tex(0.5, 0.5), "#ffffff", { bone, at: [0, roofY + 0.045, 0.55], dir: [0, 1, 0], axis: "z", up: [0, 0, 1], texture: logo });

  // ---------- cabin body shell (lower belt) ----------
  part(box(2.4, 0.18, 2.4), HULLP, [0, 1.38, 0.2]);
  // sloped windshield
  const ws = part(tex(2.0, 0.62), "#ffffff", [0, 1.56, 1.32], { dir: [0, 0.6, 0.8], axis: "z", texture: streaks });
  part(box(2.1, 0.06, 0.08), HULLP, [0, 1.76, 1.17], { rotation: [-37, 0, 0] });
  part(box(2.1, 0.06, 0.08), HULLP, [0, 1.36, 1.4], { rotation: [-37, 0, 0] });
  // rear window
  part(tex(1.8, 0.36), "#ffffff", [0, 1.58, -0.99], { dir: [0, 0.1, -1], axis: "z", texture: streaks });

  // side glass, grilles, pillars, doors
  for (const s of [1, -1]) {
    const x = s * 1.205;
    for (const [zc, w] of [[0.85, 0.7], [0.0, 0.7], [-0.62, 0.55]] as number[][]) {
      b.part(tex(w, 0.3), "#ffffff", { bone, at: [x, 1.58, zc], dir: [s, 0, 0], axis: "z", texture: streaks });
      b.part(tex(w, 0.3), "#ffffff", { bone, at: [x + s * 0.012, 1.58, zc], dir: [s, 0, 0], axis: "z", texture: mesh });
    }
    // pillars A/B/C
    part(box(0.08, 0.5, 0.1), HULLP, [s * 1.17, 1.55, 1.27], { rotation: [-37, 0, 0] });
    part(box(0.07, 0.5, 0.12), HULLP, [x, 1.55, 0.43]);
    part(box(0.07, 0.5, 0.12), HULLP, [x, 1.55, -0.32]);
    part(box(0.07, 0.5, 0.14), HULLP, [x, 1.55, -0.95]);
    // beltline & rail
    part(box(0.05, 0.05, 2.35), WHITEP, [s * 1.19, 1.38, 0.15]);
    part(box(0.05, 0.05, 2.35), HULLP, [s * 1.19, 1.74, 0.15]);
    // door seams + handles
    for (const zz of [0.43, -0.32]) part(box(0.02, 0.45, 0.015), P.ink, [s * 1.2, 1.5, zz + 0.07]);
    part(box(0.04, 0.03, 0.2), P.steel, [s * 1.21, 1.42, 0.25]);
    part(box(0.04, 0.03, 0.2), P.steel, [s * 1.21, 1.42, -0.5]);
    // livery decal
    b.part(tex(1.2, 0.3), "#ffffff", { bone, at: [x + s * 0.004, 1.5, -0.05], dir: [s, 0, 0], axis: "z", texture: livery });
    // glowing side neon edge on roof
    glow(part(box(0.04, 0.03, 2.1), P.neonCyan, [s * 1.2, 1.79, 0.15]), 1.6);
    // mirror
    part(box(0.05, 0.05, 0.05), P.steel, [s * 1.17, 1.52, 1.1]);
    part(box(0.08, 0.04, 0.04), P.steel, [s * 1.17, 1.52, 1.1]);
    part(box(0.05, 0.16, 0.14), HULLP, [s * 1.17, 1.5, 1.1]);
    glow(part(box(0.055, 0.03, 0.03), P.orange, [s * 1.17, 1.4, 1.17]), 2);
    part(tex(0.1, 0.1), P.glass, [s * 1.2, 1.5, 1.1], { dir: [s, 0, 0], axis: "z" });
  }

  // ---------- interior ----------
  const seatM = P.hullDark;
  for (const s of [1, -1]) {
    part(box(0.5, 0.1, 0.5), seatM, [s * 0.5, 1.4, 0.35]);
    part(box(0.5, 0.55, 0.1), seatM, [s * 0.5, 1.65, 0.1]);
    part(box(0.3, 0.14, 0.06), P.steel, [s * 0.5, 1.97 - 0.1, 0.07]);
    // officer
    part(box(0.38, 0.4, 0.2), P.hull, [s * 0.5, 1.6, 0.27]);
    const hm = part(new THREE.SphereGeometry(0.12, 8, 6), P.panelWhite, [s * 0.5, 1.66, 0.28], { scale: [1, 1, 1] });
    b.part(tex(0.16, 0.16), "#ffffff", { bone, at: [s * 0.5, 1.66, 0.4], dir: [0, 0, 1], axis: "z", texture: visor });
    part(box(0.12, 0.04, 0.12), P.hazard, [s * 0.5, 1.77, 0.26]);
    part(box(0.1, 0.12, 0.34), P.hull, [s * 0.5 + s * 0.24, 1.58, 0.45]);
    // steering wheel / arms
    part(box(0.12, 0.08, 0.3), P.hull, [s * 0.3, 1.62, 0.5]);
  }
  // rear bench
  part(box(1.6, 0.1, 0.45), seatM, [0, 1.4, -0.55]);
  part(box(1.6, 0.5, 0.08), seatM, [0, 1.62, -0.85]);
  // dash + screens
  part(box(2.0, 0.22, 0.3), HULLP, [0, 1.48, 1.0], { rotation: [-15, 0, 0] });
  for (const [x, w] of [[-0.55, 0.5], [0.0, 0.45], [0.55, 0.5]] as number[][]) {
    glow(
      b.part(tex(w, 0.2), "#ffffff", { bone, at: [x, 1.62, 0.91], dir: [0, 0.4, -0.9], axis: "z", texture: hud }),
      1.4,
    );
  }
  part(new THREE.CylinderGeometry(0.15, 0.15, 0.04, 10), P.hullDark, [-0.5, 1.66, 0.72], { rotation: [70, 0, 0] });
  // overhead console
  part(box(0.5, 0.06, 0.25), P.hullDark, [0, 1.74, 0.9]);
  glow(part(box(0.4, 0.015, 0.05), P.warnRed, [0, 1.705, 0.9]), 1.5);

  // ---------- roof details ----------
  // hazard stripe across roof rear edge
  const haz = svg(
    `<svg viewBox="0 0 80 12"><rect width="80" height="12" fill="#f2c200"/>
    <path d="M0 12 L12 0 L24 0 L12 12Z M24 12 L36 0 L48 0 L36 12Z M48 12 L60 0 L72 0 L60 12Z" fill="#14161c"/></svg>`,
    { size: 256 },
  );
  b.part(tex(1.9, 0.28), "#ffffff", { bone, at: [0, roofY + 0.04, -0.7], dir: [0, 1, 0], axis: "z", up: [0, 0, 1], texture: haz });
  // unit number on roof
  const num = svg(
    `<svg viewBox="0 0 60 30"><text x="30" y="24" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="26" fill="#14161c">RX-9</text></svg>`,
    { size: 128 },
  );
  b.part(tex(0.6, 0.3), "#ffffff", { bone, at: [0, roofY + 0.044, 0.0], dir: [0, 1, 0], axis: "z", up: [0, 0, 1], texture: num });
  // roof bolts
  for (const sx of [-0.95, 0.95]) for (const z of [-0.8, 0.9]) part(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 6), P.steel, [sx, roofY + 0.05, z]);
  // roof ribs
  for (const z of [-0.2, 0.3]) part(box(2.0, 0.025, 0.04), HULLP, [0, roofY + 0.05, z]);
  // visor above windshield
  part(box(2.1, 0.05, 0.2), HULLP, [0, 1.8, 1.2], { rotation: [-15, 0, 0] });
  glow(part(box(1.8, 0.02, 0.03), P.neonMagenta, [0, 1.79, 1.3]), 1.6);

  // ---------- door-edge indicators ----------
  for (const s of [1, -1]) {
    glow(part(box(0.03, 0.03, 0.22), P.warnRed, [s * 1.215, 1.34, -0.82]), 1.8);
    glow(part(box(0.03, 0.03, 0.14), P.orange, [s * 1.215, 1.34, 1.2]), 1.8);
  }
  // rear cabin wall plate
  part(box(2.2, 0.55, 0.06), HULLP, [0, 1.58, -1.0 + 0.02]);
  part(tex(1.6, 0.3), "#ffffff", [0, 1.62, -1.0 - 0.012], { dir: [0, 0, -1], axis: "z", texture: mesh });
  void R; void ws; void X0; void Y0; void Y1; void Z0; void Z1; void M; void countershade; void metal;
}
    return buildCabin;
  })(),
  // roofLights
  (() => {
type Ctx = { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, [number, number, number]> };

function buildRoofLights({ b, J, P, M }: Ctx) {
  const body = J.body;
  const R = rng(91);
  const ROOF = 1.78; // cabin roof height

  const housing = paint((p, n) => {
    const base = mix("#1a1c24", "#2a2e38", noise(p, 0.12, 3));
    return n.y > 0.5 ? mix(base, "#3a3f4c", 0.4) : base;
  });

  const box = (w: number, h: number, d: number, color: any, at: number[], opts: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone: body, at, ...opts });

  // ---- textures
  const lens = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#ffffff"/>
     ${Array.from({ length: 8 }, (_, i) => `<rect x="${i * 8 + 1}" y="0" width="1.5" height="32" fill="#999"/>`).join("")}
     <rect x="0" y="0" width="64" height="4" fill="#fff"/><rect x="0" y="28" width="64" height="4" fill="#bbb"/></svg>`,
    { size: 128 },
  );
  const holo = svg(
    `<svg viewBox="0 0 128 64"><rect x="2" y="2" width="124" height="60" rx="6" fill="#0a3a48" stroke="#2ff3ff" stroke-width="3"/>
     <polygon points="18,48 34,14 50,48 42,48 34,28 26,48" fill="#2ff3ff"/>
     <text x="58" y="34" font-family="sans-serif" font-weight="bold" font-size="20" fill="#ffffff">ARASAKA</text>
     <text x="58" y="52" font-family="sans-serif" font-size="11" fill="#ff2bd6">PEACE ENFORCEMENT</text>
     <path d="M6 8 H122" stroke="#2ff3ff" stroke-width="1" opacity="0.5"/></svg>`,
    { size: 256 },
  );
  const flood = svg(
    `<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="15" fill="#fff"/><circle cx="16" cy="16" r="10" fill="#ddd"/><circle cx="16" cy="16" r="5" fill="#fff"/></svg>`,
    { size: 64 },
  );

  // ---- main double light bar across roof front
  const barZ = 1.05, barY = ROOF + 0.1;
  box(2.0, 0.1, 0.34, housing, [0, barY - 0.05, barZ]); // base
  box(2.1, 0.03, 0.4, P.hullDark, [0, ROOF + 0.015, barZ]);
  for (const row of [0, 1]) {
    const z = barZ + (row ? -0.1 : 0.1);
    for (let i = 0; i < 8; i++) {
      const x = -0.84 + i * 0.24;
      const col = (i + row) % 2 ? P.neonCyan : P.neonMagenta;
      glow(b.part(new THREE.BoxGeometry(0.2, 0.1, 0.1), col, { bone: body, at: [x, barY + 0.05, z] }), 2.2);
      box(0.22, 0.012, 0.12, P.ink, [x, barY + 0.11, z]);
    }
  }
  // lens overlay front face
  glow(
    b.part(new THREE.PlaneGeometry(1.9, 0.12), "#ffffff", {
      bone: body, at: [0, barY + 0.03, barZ + 0.152], dir: [0, 0, 1], axis: "z", texture: lens, color: P.neonCyan,
    }),
    0.8,
  );
  for (const s of [1, -1]) {
    box(0.08, 0.2, 0.4, P.hullDark, [s * 1.0, barY + 0.04, barZ]);
    // mounting feet
    box(0.14, 0.05, 0.2, P.steel, [s * 0.7, ROOF + 0.02, barZ]);
  }

  // ---- side neon bars along roof edges
  for (const s of [1, -1]) {
    const x = s * 1.1;
    box(0.07, 0.07, 1.9, housing, [x, ROOF + 0.04, 0.2]);
    glow(box(0.04, 0.04, 1.8, s > 0 ? P.neonMagenta : P.neonCyan, [x + s * 0.03, ROOF + 0.05, 0.2]), 2);
    // pillar edge lines
    glow(b.rod([s * 1.12, ROOF, 1.12], [s * 1.12, ROOF - 0.07, 1.3], 0.014, P.neonCyan, { bone: body, sides: 4 }), 2);
    glow(b.rod([s * 1.12, ROOF, -0.7], [s * 1.12, ROOF - 0.07, -0.8], 0.014, P.neonMagenta, { bone: body, sides: 4 }), 2);
    // bracket posts
    for (const z of [-0.6, 0.2, 1.0]) box(0.06, 0.06, 0.08, P.steel, [x, ROOF + 0.015, z]);
  }

  // ---- antenna array
  for (const [i, s] of [1, -1].entries()) {
    for (let k = 0; k < 2; k++) {
      const x = s * (0.7 + k * 0.18), z = -0.65 - k * 0.12;
      const h = 0.25 + k * 0.1 + i * 0.03;
      b.part(new THREE.CylinderGeometry(0.035, 0.045, 0.06, 6), P.hullDark, { bone: body, at: [x, ROOF + 0.03, z] });
      b.rod([x, ROOF + 0.05, z], [x + s * 0.03, ROOF + 0.05 + h, z], [0.012, 0.005], P.steel, { bone: body, sides: 5 });
      glow(b.part(new THREE.SphereGeometry(0.025, 6, 4), P.warnRed, { bone: body, at: [x + s * 0.03, ROOF + 0.07 + h, z] }), 3);
    }
  }
  // whip antenna on cross base
  b.rod([0, ROOF + 0.03, -0.75], [0.05, ROOF + 0.48, -0.8], [0.012, 0.004], P.ink, { bone: body, sides: 4 });
  glow(b.part(new THREE.SphereGeometry(0.022, 6, 4), P.warnRed, { bone: body, at: [0.05, ROOF + 0.5, -0.8] }), 3);

  // ---- loudspeaker horns
  for (const s of [1, -1]) {
    const x = s * 0.45, z = 0.35;
    box(0.18, 0.06, 0.2, P.steel, [x, ROOF + 0.03, z]);
    b.lathe([[0, 0], [0.05, 0], [0.06, 0.05], [0.13, 0.2], [0.12, 0.21], [0.045, 0.07], [0, 0.07]], {
      at: [x, ROOF + 0.12, z + 0.02], axis: [0, 0.25, 1], bone: body, color: P.hullDark, segments: 8,
    });
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 8), P.steel, {
      bone: body, at: [x, ROOF + 0.12, z - 0.06], dir: [0, 0.25, 1],
    });
  }

  // ---- camera pods
  for (const s of [1, -1]) {
    const x = s * 0.95, z = -0.3;
    b.part(new THREE.CylinderGeometry(0.05, 0.06, 0.08, 8), P.steel, { bone: body, at: [x, ROOF + 0.04, z] });
    b.part(new THREE.SphereGeometry(0.1, 8, 6), P.hullDark, { bone: body, at: [x, ROOF + 0.15, z] });
    b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.08, 8), P.ink, { bone: body, at: [x, ROOF + 0.15, z + 0.09], dir: [0, 0, 1] });
    glow(b.part(new THREE.CircleGeometry(0.03, 8), P.warnRed, { bone: body, at: [x, ROOF + 0.15, z + 0.131], dir: [0, 0, 1], axis: "z" }), 3);
  }

  // ---- floodlights
  for (const s of [1, -1]) {
    const x = s * 0.75, z = 0.55;
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.14, 6), P.steel, { bone: body, at: [x, ROOF + 0.07, z] });
    box(0.22, 0.14, 0.14, P.hullDark, [x, ROOF + 0.2, z]);
    glow(
      b.part(new THREE.PlaneGeometry(0.19, 0.11), "#ffffff", {
        bone: body, at: [x, ROOF + 0.2, z + 0.072], dir: [0, 0, 1], axis: "z", texture: flood, color: "#ffffff",
      }),
      2.4,
    );
    box(0.24, 0.02, 0.16, P.orange, [x, ROOF + 0.285, z]);
  }

  // ---- hologram sign on bracket (rear-center, clear of turret)
  const hx = 0, hz = -0.6, hy = ROOF + 0.45;
  box(0.5, 0.05, 0.2, P.steel, [hx, ROOF + 0.025, hz]);
  for (const s of [1, -1]) {
    b.rod([s * 0.2, ROOF + 0.04, hz], [s * 0.2, hy - 0.15, hz], 0.015, P.steel, { bone: body, sides: 6 });
    glow(b.rod([s * 0.38, hy - 0.2, hz], [s * 0.38, hy + 0.2, hz], 0.008, P.neonCyan, { bone: body, sides: 4 }), 2);
  }
  box(0.84, 0.02, 0.05, P.hullDark, [hx, hy - 0.22, hz]);
  glow(
    b.part(new THREE.PlaneGeometry(0.76, 0.38), "#ffffff", {
      bone: body, at: [hx, hy, hz + 0.01], dir: [0, 0, 1], axis: "z", texture: holo,
    }),
    1.6,
  );
  // back face so it reads from behind
  b.part(new THREE.PlaneGeometry(0.76, 0.38), "#ffffff", {
    bone: body, at: [hx, hy, hz - 0.01], dir: [0, 0, -1], axis: "z", texture: holo,
  });
  // glow tint rail
  glow(box(0.8, 0.012, 0.03, P.neonMagenta, [hx, hy + 0.2, hz]), 2);

  // ---- hazard warning beacon (orange) mid roof
  b.part(new THREE.CylinderGeometry(0.07, 0.08, 0.05, 8), P.hullDark, { bone: body, at: [0, ROOF + 0.025, 0.2] });
  glow(b.part(new THREE.CylinderGeometry(0.055, 0.06, 0.1, 8), P.orange, { bone: body, at: [0, ROOF + 0.1, 0.2] }), 2.2);
}
    return buildRoofLights;
  })(),
  // turretBase
  (() => {
function buildTurretBase({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const body = J.body;
  const yaw = J.turretYaw;
  const ring = M.turretRing;

  // ---------- paints & textures ----------
  const HULL = panelled(
    paint((p, n) => {
      const g = noise(p, 0.18, 3);
      const base = mix(P.hull, P.hullDark, 0.5 * g);
      return mix(base, "#4a4438", 0.35 * smoothstep(0.55, 0.9, noise(p, 0.05, 8)) * (n.y < 0.5 ? 1 : 0.4));
    }),
    { size: 0.3, rivets: 0.07, seam: P.ink },
  );
  const WHITE = paint((p, n) =>
    mix(mix(P.panelWhite, "#aab0ba", 0.35 * noise(p, 0.2, 5)), "#6d6a60", 0.4 * smoothstep(0.6, 0.85, noise(p, 0.04, 2)) * (n.y < 0 ? 1 : 0.3)),
  );
  const STEEL = metal("steel", { tarnish: 0.3 });
  const BRASS = metal("brass", { tarnish: 0.4 });
  const IRON = metal("iron");
  const HAZ = paint((p, _n, s) => {
    const k = ((((p.x + p.z) * 1 + p.y) / 0.12) % 2 + 2) % 2;
    return k < 1 ? P.hazard : P.ink;
  });

  const GAUGE = svg(
    `<svg viewBox="0 0 24 80" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="22" height="78" rx="6" fill="#0b2a3a" stroke="#08080c" stroke-width="2"/>
    <rect x="4" y="30" width="16" height="46" rx="3" fill="#2ff3ff"/>
    <rect x="4" y="30" width="16" height="6" fill="#bffaff"/>
    ${[10, 20, 30, 40, 50, 60, 70].map((y) => `<path d="M4 ${y} h6" stroke="#08080c" stroke-width="1.5"/>`).join("")}
    </svg>`,
    { size: 128 },
  );
  const WARN = svg(
    `<svg viewBox="0 0 120 70" xmlns="http://www.w3.org/2000/svg">
    <rect width="120" height="70" fill="#f2c200" stroke="#08080c" stroke-width="5"/>
    <path d="M22 14 L38 44 L6 44Z" fill="none" stroke="#08080c" stroke-width="4" stroke-linejoin="round"/>
    <rect x="21" y="23" width="3" height="10" fill="#08080c"/><rect x="21" y="36" width="3" height="3" fill="#08080c"/>
    <text x="46" y="30" font-family="monospace" font-weight="bold" font-size="15" fill="#08080c">HIGH</text>
    <text x="46" y="48" font-family="monospace" font-weight="bold" font-size="15" fill="#08080c">PRESSURE</text>
    <text x="10" y="64" font-family="monospace" font-size="9" fill="#08080c">RX-9 // NO ENTRY</text></svg>`,
    { size: 256 },
  );
  const LOGO = svg(
    `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
    <circle cx="40" cy="40" r="36" fill="#14161c" stroke="#ff2bd6" stroke-width="4"/>
    <path d="M40 14 L62 54 L18 54Z" fill="none" stroke="#2ff3ff" stroke-width="5" stroke-linejoin="round"/>
    <circle cx="40" cy="42" r="6" fill="#ff2bd6"/></svg>`,
    { size: 128 },
  );
  const CHEV = svg(
    `<svg viewBox="0 0 64 32" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="32" fill="#14161c"/>
    ${[0, 16, 32, 48].map((x) => `<path d="M${x} 32 L${x + 8} 0 H${x + 16} L${x + 8} 32Z" fill="#f2c200"/>`).join("")}</svg>`,
    { size: 128 },
  );

  const part = (g: THREE.BufferGeometry, c: any, at: number[], bone: any = body, o: any = {}) =>
    b.part(g, c, { bone, at, ...o });
  const cyl = (rt: number, rb: number, h: number, s = 12) => new THREE.CylinderGeometry(rt, rb, h, s);
  const decal = (tex: THREE.Texture, w: number, h: number, at: number[], dir: number[], bone: any = body) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone, at, dir, axis: "z", texture: tex });

  // ---------- rotating ring base ----------
  part(cyl(0.62, 0.66, 0.08, 20), IRON, [ring[0], 1.39, ring[2]]);
  part(cyl(0.58, 0.58, 0.06, 20), STEEL, [ring[0], 1.45, ring[2]]);
  // bolts on fixed ring
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    part(cyl(0.025, 0.025, 0.05, 6), BRASS, [Math.sin(a) * 0.6, 1.4, ring[2] + Math.cos(a) * 0.6]);
  }
  // rotating part on yaw joint
  const yc = [ring[0], 1.52, ring[2]];
  part(cyl(0.54, 0.56, 0.12, 20), STEEL, yc, yaw);
  // armored swivel housing
  part(cyl(0.46, 0.52, 0.34, 8), HULL, [0, 1.75, ring[2]], yaw);
  part(new THREE.BoxGeometry(0.9, 0.2, 0.5), HULL, [0, 1.95, -1.3], yaw);
  part(new THREE.BoxGeometry(0.5, 0.1, 0.4), WHITE, [0, 2.07, -1.45], yaw);
  // hazard band
  part(cyl(0.535, 0.535, 0.07, 8), HAZ, [0, 1.65, ring[2]], yaw);
  // side yoke cheeks (cannon pivots at z -1.2, y 2.0)
  for (const s of [1, -1]) {
    part(new THREE.BoxGeometry(0.1, 0.34, 0.36), HULL, [s * 0.4, 2.12, -1.2], yaw);
    part(cyl(0.07, 0.07, 0.06, 8), BRASS, [s * 0.47, 2.12, -1.2], yaw, { dir: [1, 0, 0] });
    // hydraulic pistons
    const a = [s * 0.34, 1.88, -1.55];
    const c = [s * 0.34, 2.12, -1.35];
    b.rod(a, c, 0.04, STEEL, { bone: yaw });
    b.rod(a, [s * 0.34, 1.99, -1.45], 0.055, IRON, { bone: yaw });
    part(new THREE.SphereGeometry(0.05, 6, 4), BRASS, c, yaw);
    part(new THREE.SphereGeometry(0.05, 6, 4), BRASS, a, yaw);
  }
  decal(LOGO, 0.2, 0.2, [0, 1.76, -0.775], [0, 0, 1], yaw);
  // glow stripe on housing
  glow(part(new THREE.BoxGeometry(0.92, 0.025, 0.03), P.neonMagenta, [0, 1.9, -1.045], yaw), 1.5);

  // ---------- pump manifold (right-front of tanks) ----------
  part(new THREE.BoxGeometry(0.7, 0.28, 0.32), IRON, [0, 1.52, -1.85]);
  part(new THREE.BoxGeometry(0.62, 0.05, 0.26), HULL, [0, 1.68, -1.85]);
  for (const s of [-1, 1]) {
    part(cyl(0.045, 0.045, 0.14, 8), P.warnRed, [s * 0.2, 1.75, -1.85]);
    part(new THREE.SphereGeometry(0.07, 8, 6), P.warnRed, [s * 0.2, 1.83, -1.85]);
    part(cyl(0.03, 0.03, 0.16, 8), BRASS, [s * 0.1, 1.75, -1.85], body, { dir: [1, 0, 0] });
  }
  // connectors into hose
  part(cyl(0.07, 0.07, 0.1, 8), BRASS, [0, 1.52, -1.66], body, { dir: [0, 0, 1] });
  // hose from manifold forward to the yoke (feed hose stub)
  b.sweep([[0, 1.55, -1.7], [0, 1.62, -1.55], [0, 1.8, -1.4], [0, 1.92, -1.3]], 0.035, { color: P.ink, bone: yaw, sides: 6 });

  // ---------- tank pack ----------
  const tanks = [-0.62, 0, 0.62];
  tanks.forEach((x, i) => {
    const z = -2.35;
    part(cyl(0.27, 0.27, 0.64, 12), WHITE, [x, 1.7, z]);
    part(cyl(0.285, 0.285, 0.06, 12), STEEL, [x, 1.4, z]);
    part(new THREE.SphereGeometry(0.27, 12, 5, 0, Math.PI * 2, 0, Math.PI / 2), WHITE, [x, 2.02, z]);
    part(cyl(0.285, 0.285, 0.05, 12), HAZ, [x, 1.92, z]);
    part(cyl(0.285, 0.285, 0.05, 12), HAZ, [x, 1.55, z]);
    part(cyl(0.05, 0.05, 0.1, 8), BRASS, [x, 2.24, z]);
    // gauge window on the front
    const w = part(new THREE.BoxGeometry(0.14, 0.5, 0.02), "#ffffff", [x, 1.8, z + 0.27], body, { texture: GAUGE });
    glow(w, 1.2);
    // pipes linking tanks to manifold
    b.rod([x, 1.4, z + 0.2], [x * 0.3, 1.5, -1.9], 0.03, i === 1 ? STEEL : BRASS, { bone: body, sides: 6 });
  });
  // tank straps
  for (const y of [1.5, 1.95]) part(new THREE.BoxGeometry(1.75, 0.04, 0.04), IRON, [0, y, -2.62]);
  // top manifold pipe
  b.rod([-0.62, 2.2, -2.35], [0.62, 2.2, -2.35], 0.03, BRASS, { bone: body, sides: 6 });
  for (const x of tanks) part(cyl(0.04, 0.04, 0.1, 8), STEEL, [x, 2.2, -2.35], body, { dir: [1, 0, 0] });
  // back frame plate
  part(new THREE.BoxGeometry(1.9, 0.9, 0.1), HULL, [0, 1.85, -2.78]);
  part(new THREE.BoxGeometry(2.0, 0.08, 0.5), HULL, [0, 1.38, -2.55]);
  // side armour
  for (const s of [1, -1]) {
    part(new THREE.BoxGeometry(0.08, 0.8, 0.9), HULL, [s * 1.0, 1.8, -2.4]);
    part(new THREE.BoxGeometry(0.1, 0.1, 0.9), HAZ, [s * 1.0, 1.45, -2.4]);
    // quick-connect hose couplings
    part(cyl(0.06, 0.06, 0.16, 8), BRASS, [s * 1.1, 1.6, -1.7], body, { dir: [1, 0, 0] });
    part(cyl(0.035, 0.035, 0.1, 6), P.orange, [s * 1.15, 1.6, -1.7], body, { dir: [1, 0, 0] });
    b.sweep([[s * 1.1, 1.6, -1.7], [s * 1.0, 1.55, -1.9], [s * 0.7, 1.5, -2.0]], 0.03, { color: P.ink, bone: body, sides: 6 });
    decal(WARN, 0.4, 0.23, [s * 1.045, 1.95, -2.35], [s, 0, 0]);
    decal(CHEV, 0.5, 0.25, [s * 1.045, 1.62, -2.35], [s, 0, 0]);
  }
  decal(WARN, 0.5, 0.29, [0, 2.0, -2.84], [0, 0, -1]);
  // fill windows glow strips on back
  glow(part(new THREE.BoxGeometry(1.5, 0.03, 0.02), P.neonCyan, [0, 1.5, -2.84]), 1.6);
  // red beacon dots
  for (const s of [1, -1]) glow(part(new THREE.SphereGeometry(0.05, 6, 4), P.warnRed, [s * 0.95, 2.22, -2.8]), 2);
  void R;
}
    return buildTurretBase;
  })(),
  // waterCannon
  (() => {
function buildWaterCannon({ b, J, P, M }: Ctx) {
  const bone = J.cannonPitch;
  const Y = M.muzzle[1]; // barrel axis height
  const L = -1.3; // barrel start z
  const Z = [0, 0, 1] as [number, number, number];
  const X = [1, 0, 0] as [number, number, number];

  const place = (geo: THREE.BufferGeometry, color: any, at: number[], dir?: number[], axis?: "x" | "y" | "z", texture?: any) =>
    b.part(geo, color, { bone, at: at as any, dir: dir as any, axis, texture } as any);
  const cyl = (r0: number, r1: number, len: number, at: number[], dir: number[], color: any, seg = 10) =>
    place(new THREE.CylinderGeometry(r0, r1, len, seg), color, at, dir);
  const box = (w: number, h: number, d: number, at: number[], color: any) =>
    place(new THREE.BoxGeometry(w, h, d), color, at);

  // ---- paints
  const HULLP = panelled(metal("iron"), { size: 0.16, rivets: 0.04 });
  const WHITEP = paint((p, n) => {
    const base = n.y > 0.3 ? P.panelWhite : "#aeb4be";
    const wear = Math.sin(p.z * 37) * Math.sin(p.x * 29 + p.y * 13) > 0.8;
    return wear ? P.steel : base;
  });
  const HAZ = paint((p) => (Math.floor((p.z + p.y * 0.5) / 0.045) % 2 === 0 ? P.hazard : P.ink));
  const STEEL = metal("steel", { tarnish: 0.3 });

  // ---- barrel (lathe) along +Z
  const barrelOutline: [number, number][] = [
    [0, 0], [0.14, 0], [0.2, 0.1], [0.2, 0.45], [0.17, 0.5], [0.17, 1.7], [0.19, 1.75],
    [0.19, 1.85], [0.17, 1.9], [0.17, 2.1], [0.27, 2.5], [0.22, 2.5], [0.13, 2.25], [0, 2.25],
  ];
  b.lathe(barrelOutline, { at: [0, Y, L], axis: Z, segments: 12, bone, color: WHITEP });

  // breech cap and rifling rings
  cyl(0.1, 0.13, 0.08, [0, Y, L - 0.04], Z, HULLP);
  for (const [s, r] of [[2.35, 0.15], [2.43, 0.19]] as [number, number][])
    place(new THREE.TorusGeometry(r, 0.012, 4, 14), STEEL, [0, Y, L + s], Z, "z");

  // glowing water core in nozzle
  glow(place(new THREE.CircleGeometry(0.13, 14), P.water, [0, Y, L + 2.27], Z, "z"), 1.6);
  glow(cyl(0.05, 0.05, 0.02, [0, Y, L + 2.28], Z, P.neonCyan, 8), 2);

  // segmented collars
  for (const s of [0.75, 1.15, 1.55]) {
    cyl(0.205, 0.205, 0.07, [0, Y, L + s], Z, HULLP, 12);
    cyl(0.215, 0.215, 0.015, [0, Y, L + s + 0.04], Z, P.steel, 12);
  }
  // hazard band
  cyl(0.185, 0.185, 0.22, [0, Y, L + 1.8 + 0.0], Z, HAZ, 12);
  // nozzle lip
  cyl(0.285, 0.285, 0.04, [0, Y, L + 2.48], Z, HULLP, 12);
  // orange warning stripes on breech
  for (const s of [0.18, 0.3]) cyl(0.205, 0.205, 0.05, [0, Y, L + s], Z, P.orange, 12);

  // bolts on collars
  const rr = rng(5);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.2;
    place(new THREE.CylinderGeometry(0.012, 0.012, 0.02, 6), P.steel, [Math.sin(a) * 0.22, Y + Math.cos(a) * 0.22, L + 1.15], [Math.sin(a), Math.cos(a), 0]);
  }

  // neon magenta line along barrel
  for (const s of [1, -1]) {
    glow(b.rod([s * 0.172, Y + 0.03, L + 0.6], [s * 0.172, Y + 0.03, L + 1.65], 0.011, P.neonMagenta, { bone, sides: 6 } as any), 1.8);
  }

  // ---- gimbal yoke with trunnions
  const yz = -1.2;
  for (const s of [1, -1]) {
    box(0.05, 0.3, 0.5, [s * 0.3, Y - 0.02, yz], HULLP);
    box(0.06, 0.06, 0.52, [s * 0.3, Y - 0.19, yz], P.hazard);
    cyl(0.065, 0.065, 0.12, [s * 0.25, Y, yz], X, STEEL, 10);
    cyl(0.085, 0.085, 0.03, [s * 0.335, Y, yz], X, P.steel, 10);
    for (const dz of [-0.2, 0.2]) cyl(0.015, 0.015, 0.03, [s * 0.33, Y + 0.1, yz + dz], X, P.brass, 6);
    // yoke feet braces
    box(0.05, 0.05, 0.12, [s * 0.3, Y + 0.15, yz + 0.28], P.orange);
  }
  box(0.62, 0.05, 0.1, [0, Y - 0.17, yz - 0.18], HULLP); // cross brace under barrel

  // ---- pressure gauge on left plate
  cyl(0.065, 0.065, 0.04, [0.345, Y - 0.05, yz + 0.17], X, P.brass, 12);
  place(new THREE.CircleGeometry(0.055, 18), "#ffffff", [0.368, Y - 0.05, yz + 0.17], X, "z", gaugeTexture({ needle: 50, label: "BAR" }));

  // ---- warning decal on right plate
  const warn = svg(
    `<svg viewBox="0 0 60 30"><rect width="60" height="30" fill="${P.hazard}"/><path d="M0 0L10 0L0 10ZM20 0L30 0L0 30L0 20Z" fill="${P.ink}" opacity="0.0"/><rect x="1" y="1" width="58" height="28" fill="none" stroke="${P.ink}" stroke-width="2"/><text x="30" y="13" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="9" fill="${P.ink}">HIGH PRESSURE</text><text x="30" y="24" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="8" fill="${P.warnRed}">KEEP CLEAR</text></svg>`,
    { size: 256 },
  );
  place(new THREE.PlaneGeometry(0.2, 0.1), "#ffffff", [-0.329, Y + 0.0, yz + 0.0], [-1, 0, 0], "z", warn);

  // ---- targeting camera on top
  box(0.12, 0.09, 0.22, [0, Y + 0.215, L + 1.0], HULLP);
  box(0.14, 0.02, 0.1, [0, Y + 0.17, L + 1.0], P.hullDark);
  cyl(0.032, 0.032, 0.05, [0, Y + 0.215, L + 1.14], Z, P.ink, 8);
  glow(cyl(0.022, 0.022, 0.02, [0, Y + 0.215, L + 1.165], Z, P.warnRed, 8), 2.2);
  glow(box(0.02, 0.02, 0.02, [0.045, Y + 0.268, L + 0.93], P.warnRed), 2);

  // ---- feed hose to tank
  const hose = b.sweep(
    [[0.12, Y - 0.1, L + 0.15], [0.26, Y - 0.14, -1.45], [0.22, Y - 0.2, -1.65], [0.12, Y - 0.12, -1.88]] as any,
    0.032,
    { bone, color: P.hullDark, sides: 6, caps: "round" } as any,
  );
  b.along(hose, 4, (at) =>
    b.part(new THREE.CylinderGeometry(0.042, 0.042, 0.03, 6), P.brass, { bone, frame: at, at: at.at } as any),
  );
  cyl(0.05, 0.05, 0.06, [0.12, Y - 0.12, -1.88], [0, 0, 1], P.brass, 8);

  // ---- mist cards at muzzle
  const mist = svg(
    `<svg viewBox="0 0 32 48"><defs><radialGradient id="m"><stop offset="0" stop-color="#ffffff" stop-opacity="0.9"/><stop offset="1" stop-color="#6fd8ff" stop-opacity="0.2"/></radialGradient></defs><path d="M16 46 C4 38 2 20 16 2 C30 20 28 38 16 46Z" fill="url(#m)"/></svg>`,
    { size: 64 },
  );
  const ring = b.ring(frame([0, Y, 1.1], [0, 0, 1]), { count: 6, radius: 0.12 }).items;
  b.cards(ring, mist, { size: [0.08, 0.1], lean: 35, bend: 20, vary: 0.3, rng: rr, color: P.water, bone } as any);
}
    return buildWaterCannon;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "riotInterceptor" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,0.9,0], dir: [0,0,1], role: "spine" });
  J["turretYaw"] = b.joint("turretYaw", { parent: J["body"], at: [0,1.75,-1.3], dir: [0,1,0], role: "hinge", group: "turret" });
  J["cannonPitch"] = b.joint("cannonPitch", { parent: J["turretYaw"], at: [0,2,-1.2], dir: [0,0,1], role: "hinge", group: "turret" });
  J["wheelFL"] = b.joint("wheelFL", { parent: J["body"], at: [1.15,0.5,1.8], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelFR"] = b.joint("wheelFR", { parent: J["body"], at: [-1.15,0.5,1.8], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["wheelRL"] = b.joint("wheelRL", { parent: J["body"], at: [1.15,0.5,-1.8], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelRR"] = b.joint("wheelRR", { parent: J["body"], at: [-1.15,0.5,-1.8], dir: [-1,0,0], role: "hinge", group: "wheels" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
