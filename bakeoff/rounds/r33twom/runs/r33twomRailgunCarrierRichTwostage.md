<!-- call: stage1 -->

```ts
import * as THREE from "three";
import { createBuilder, type Builder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Railgun Carrier",
  description: "Six-wheeled railgun carrier braced on four stabiliser legs, low-poly sci-fi military.",
};

export const REQUESTS = [
  {
    id: "roofLightBar",
    kind: "add",
    part: "cabRoof",
    what: "Slim amber/cyan light bar across the cab roof: dark housing, six lamps alternating CYAN and HAZARD, end brackets.",
    at: [0, 2.78, 4.2],
    normal: [0, 1, 0],
    bone: null,
    room: [1.8, 0.25, 0.4],
  },
  {
    id: "railCoils",
    kind: "add",
    part: "railL",
    what: "Glowing CYAN accelerator coil bands wrapped around both rails along the forward half, with copper ring fittings and small insulator blocks.",
    at: [0, 3.5, 3.5],
    normal: [0, 1, 0],
    bone: null,
    room: [1.6, 0.8, 5],
  },
  {
    id: "muzzleBrake",
    kind: "add",
    part: "railL",
    what: "Muzzle assembly at the rail tips: a spacer frame, flared blast shield plates, and a glowing CYAN arc gap between the rails.",
    at: [0, 3.5, 6.5],
    normal: [0, 0, 1],
    bone: null,
    room: [1.4, 0.8, 0.8],
  },
  {
    id: "capacitorBanks",
    kind: "add",
    part: "capL",
    what: "Capacitor bank details on both side tanks: warning bands, terminal posts, status lamps in CYAN and MAGENTA, and cable loops running to the breech.",
    at: [1.1, 2.9, -2.5],
    normal: [1, 0, 0],
    bone: null,
    room: [0.8, 0.8, 3.2],
  },
  {
    id: "rearVents",
    kind: "add",
    part: "hullRear",
    what: "Heat-exchange grille on the rear hull face: louvred vents in DARK, a radiator frame, two exhaust stacks above.",
    at: [0, 1.8, -5.55],
    normal: [0, 0, -1],
    bone: null,
    room: [2.4, 0.9, 0.4],
  },
  {
    id: "frontSensors",
    kind: "add",
    part: "cabFront",
    what: "Sensor suite on the cab front: armoured headlamp pods, a radar dish and a camera turret on a mast, a tow hook and bumper plates.",
    at: [0, 1.9, 5.45],
    normal: [0, 0, 1],
    bone: null,
    room: [2.5, 1.0, 0.5],
  },
  {
    id: "antennaArray",
    kind: "add",
    part: "hullTop",
    what: "Communications antenna array behind the cab: three whip antennas of different heights, a flat dish and a small box transceiver.",
    at: [-1.1, 2.3, 1.8],
    normal: [0, 1, 0],
    bone: null,
    room: [0.8, 1.6, 0.8],
  },
  {
    id: "stabiliserPads",
    kind: "add",
    part: "padFL",
    what: "Detail on each stabiliser leg: hydraulic hoses, hazard-striped sleeves in HAZARD and DARK, bolts around the pad and a ground spike.",
    at: [2.9, 0.3, 2.0],
    normal: [0, 1, 0],
    bone: null,
    room: [1.4, 1.4, 1.4],
  },
  {
    id: "hullCamo",
    kind: "texture",
    part: "hullSideL",
    what: "Angular digital camo in HULL, HULL_DARK and PLATE on both hull sides (hullSideL and hullSideR), a faded unit number and a small chevron emblem near the front.",
  },
  {
    id: "wheelTread",
    kind: "texture",
    part: "tire",
    what: "Worn rubber tread pattern on all six tires, with dirt in DARK on the lower half.",
  },
  {
    id: "cabGlass",
    kind: "texture",
    part: "windshield",
    what: "Tinted glass with a cyan HUD glow reflection and thin cracked-edge frame lines.",
  },
];

export const STAGE2: ((b: Builder) => void)[] = [];

export const HULL = "#5b6b4a";
export const HULL_DARK = "#3f4a34";
export const PLATE = "#7a8668";
export const STEEL = "#8a919a";
export const DARK = "#23272d";
export const TIRE = "#1a1b1d";
export const HAZARD = "#e0b020";
export const CYAN = "#40e8ff";
export const MAGENTA = "#ff3cb4";
export const RAIL = "#4a5260";
export const COPPER = "#b8683a";
export const GLASS = "#2a4a60";

export default function build() {
  const b = createBuilder({ name: "railgunCarrier" });
  type V = [number, number, number];
  const box = (color: string, size: V, at: V, o: any = {}) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at, flat: true, ...o });
  const cyl = (color: string, r: number, len: number, at: V, dir: V, sides = 10, o: any = {}) =>
    b.part(new THREE.CylinderGeometry(r, r, len, sides), color, { at, dir, flat: true, ...o });
  const X: V = [1, 0, 0];
  const Z: V = [0, 0, 1];

  // chassis
  box(DARK, [2.6, 0.5, 10.4], [0, 1.0, -0.3], { name: "chassis" });
  box(STEEL, [1.2, 0.3, 10.0], [0, 0.75, -0.3], { name: "underFrame" });
  for (const z of [3.4, 0.6, -2.2]) cyl(STEEL, 0.12, 3.6, [0, 0.7, z], X, 8, { name: "axle" });

  // hull
  box(HULL, [3.0, 1.0, 6.6], [0, 1.75, -2.2], { name: "hullBody" });
  box(HULL_DARK, [2.4, 0.3, 6.4], [0, 2.4, -2.2], { name: "hullTop" });
  box(HULL, [3.0, 1.0, 0.2], [0, 1.75, -5.55], { name: "hullRear" });
  for (const s of [1, -1]) {
    box(HULL, [0.15, 0.9, 6.4], [s * 1.55, 1.75, -2.2], { name: s > 0 ? "hullSideL" : "hullSideR" });
    box(PLATE, [0.2, 0.15, 6.6], [s * 1.55, 2.28, -2.2], { name: "sideTrim" });
    // sloped armour on the rear corners
    box(PLATE, [0.25, 0.8, 1.0], [s * 1.5, 1.7, -5.2], { rotation: [0, s * 20, 0], name: "cornerPlate" });
    // fender over each wheel
    for (const z of [3.4, 0.6, -2.2]) {
      box(HULL_DARK, [0.8, 0.15, 1.9], [s * 1.7, 1.55, z], { name: "fender" });
      box(HULL, [0.1, 0.3, 1.9], [s * 2.1, 1.45, z], { name: "fenderLip" });
    }
    // capacitor tanks
    cyl(STEEL, 0.5, 4.6, [s * 1.0, 3.0, -2.6], Z, 10, { name: s > 0 ? "capL" : "capR" });
    cyl(HAZARD, 0.52, 0.25, [s * 1.0, 3.0, -0.6], Z, 10, { name: "capBand" });
    cyl(HAZARD, 0.52, 0.25, [s * 1.0, 3.0, -4.6], Z, 10, { name: "capBand" });
    box(DARK, [0.5, 0.4, 3.0], [s * 1.0, 2.55, -2.6], { name: "capMount" });
  }

  // wheels
  const wheel = (s: number, zc: number) => {
    const cx = s * 1.65;
    cyl(TIRE, 0.7, 0.55, [cx, 0.7, zc], X, 14, { name: "tire" });
    cyl(STEEL, 0.4, 0.6, [cx, 0.7, zc], X, 10, { name: "hub" });
    cyl(DARK, 0.15, 0.7, [cx, 0.7, zc], X, 8, { name: "hubCap" });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      cyl(DARK, 0.04, 0.08, [cx + s * 0.31, 0.7 + Math.sin(a) * 0.27, zc + Math.cos(a) * 0.27], X, 6, { name: "bolt" });
    }
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      box(TIRE, [0.58, 0.12, 0.22], [cx, 0.7 + Math.cos(a) * 0.68, zc + Math.sin(a) * 0.68], {
        rotation: [(a * 180) / Math.PI, 0, 0],
        name: "tread",
      });
    }
  };
  for (const s of [1, -1]) for (const z of [3.4, 0.6, -2.2]) wheel(s, z);

  // cab
  box(HULL, [2.7, 1.2, 2.3], [0, 1.9, 4.25], { name: "cabBody" });
  box(HULL_DARK, [2.5, 0.15, 1.5], [0, 2.55, 4.0], { name: "cabRoof" });
  box(HULL, [2.7, 0.9, 0.3], [0, 1.65, 5.5], { name: "cabFront" });
  box(GLASS, [2.2, 0.7, 0.1], [0, 2.2, 5.15], { rotation: [-25, 0, 0], name: "windshield" });
  box(DARK, [2.4, 0.1, 0.12], [0, 2.52, 5.0], { rotation: [-25, 0, 0], name: "windshieldFrame" });
  for (const s of [1, -1]) {
    box(GLASS, [0.1, 0.55, 1.0], [s * 1.38, 2.2, 4.5], { name: "sideWindow" });
    box(DARK, [0.1, 0.1, 0.4], [s * 1.4, 1.95, 5.1], { name: "mirrorArm" });
    box(DARK, [0.1, 0.4, 0.25], [s * 1.55, 2.15, 5.1], { name: "mirror" });
    glow(box(CYAN, [0.5, 0.2, 0.08], [s * 0.85, 1.55, 5.67], { name: "headlamp" }), 1.5);
  }
  box(PLATE, [2.9, 0.4, 0.4], [0, 1.0, 5.55], { name: "bumper" });
  box(PLATE, [2.9, 0.4, 0.4], [0, 1.0, -5.7], { name: "rearBumper" });
  box(DARK, [2.6, 0.25, 0.2], [0, 1.3, 5.7], { name: "bumperStrip" });

  // railgun
  box(DARK, [1.3, 1.1, 1.8], [0, 3.15, -3.6], { name: "breech" });
  box(HULL_DARK, [1.4, 0.2, 2.0], [0, 3.8, -3.6], { name: "breechCap" });
  box(STEEL, [1.6, 0.35, 2.8], [0, 2.65, -3.0], { name: "cradleBase" });
  for (const z of [-0.2, 2.2]) {
    for (const s of [1, -1]) box(STEEL, [0.25, 1.0, 0.5], [s * 0.55, 3.0, z], { name: "pylon" });
    box(STEEL, [1.6, 0.3, 0.6], [0, 2.55, z], { name: "pylonBase" });
  }
  for (const s of [1, -1]) {
    box(RAIL, [0.32, 0.36, 11.2], [s * 0.38, 3.5, 1.0], { name: s > 0 ? "railL" : "railR" });
    box(STEEL, [0.1, 0.1, 11.0], [s * 0.38, 3.72, 1.0], { name: "railTop" });
  }
  for (const z of [-1.5, 1.2, 3.9, 6.3]) box(DARK, [1.3, 0.3, 0.3], [0, 3.5, z], { name: "railSpacer" });
  for (const z of [-0.8, 2.0, 4.8]) box(COPPER, [1.3, 0.12, 0.2], [0, 3.28, z], { name: "railBrace" });

  // stabilisers
  for (const s of [1, -1])
    for (const z of [2.0, -3.6]) {
      const px = s * 3.0;
      const tag = (s > 0 ? "L" : "R") + (z > 0 ? "F" : "R");
      box(STEEL, [0.7, 0.6, 0.7], [s * 1.75, 1.4, z], { name: "legMount" });
      cyl(DARK, 0.22, 0.4, [s * 1.9, 1.4, z], Z, 8, { name: "legPivot" });
      b.rod([s * 1.85, 1.45, z], [px - s * 0.15, 0.55, z], 0.17, STEEL, { name: "legUpper" });
      b.rod([s * 1.9, 1.15, z + 0.3], [px - s * 0.3, 0.45, z + 0.1], 0.08, DARK, { name: "legPiston" });
      b.rod([px - s * 0.15, 0.6, z], [px, 0.25, z], 0.2, HAZARD, { name: "legLower" });
      cyl(PLATE, 0.65, 0.2, [px, 0.1, z], [0, 1, 0], 8, { name: "pad" + tag });
      cyl(DARK, 0.5, 0.06, [px, 0.22, z], [0, 1, 0], 8, { name: "padRim" });
      cyl(STEEL, 0.15, 0.2, [px, 0.35, z], [0, 1, 0], 8, { name: "padKnuckle" });
    }

  // misc
  for (const s of [1, -1]) box(DARK, [0.25, 0.25, 0.5], [s * 1.2, 2.55, 3.1], { name: "stowBox" });
  box(PLATE, [2.4, 0.2, 0.5], [0, 2.5, 3.0], { name: "bulkhead" });

  for (const add of STAGE2) add(b);
  return b.root;
}
```

<!-- call: texture -->

hullCamo: a custom paint on both hull sides: angular digital-camo blocks in HULL, HULL_DARK and PLATE, with a faded unit number and a chevron emblem near the front, drawn as SVG decals on the outer faces.
wheelTread: the tires get a paint with worn rubber streaks, a tread block pattern and DARK dirt on the lower half.
cabGlass: the windshield gets a tinted glass SVG with a cyan HUD reflection, diagonal glare and thin cracked-edge frame lines.

<<<<<<< SEARCH
export default function build() {
  const b = createBuilder({ name: "railgunCarrier" });
=======
const camoPaint = paint((p, _n, _s) => {
  const q = 0.45;
  const gx = Math.floor(p.z / q);
  const gy = Math.floor(p.y / (q * 0.6));
  let h = Math.imul(gx, 374761393) ^ Math.imul(gy, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  const v = ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  const n2 = noise(p, 1.2, 3);
  const t = v * 0.6 + n2 * 0.4;
  return t < 0.4 ? HULL_DARK : t < 0.62 ? HULL : PLATE;
});

const treadPaint = paint((p, _n, s) => {
  const ang = Math.atan2(p.y - 0.7, p.z - 0);
  const lug = Math.floor((ang / (Math.PI * 2)) * 24);
  const edge = Math.abs(((ang / (Math.PI * 2)) * 24) % 1);
  let c: string = TIRE;
  if (edge < 0.18) c = "#2c2d30";
  const wear = noise(p, 0.15, 5);
  if (wear > 0.68) c = "#34353a";
  if (lug % 3 === 0 && edge > 0.5 && edge < 0.62) c = "#101113";
  const dirt = smoothstep(0.75, 0.15, p.y) * (0.5 + 0.5 * noise(p, 0.12, 8));
  void s;
  return mix(c, "#4a3f30", dirt * 0.7);
});

const glassTex = svg(
  `<svg viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#3a6a88"/><stop offset="1" stop-color="#16293a"/>
      </linearGradient>
    </defs>
    <rect width="100" height="40" fill="url(#g)"/>
    <path d="M10 40 L30 0 L42 0 L22 40Z" fill="#9fdcff" opacity="0.18"/>
    <path d="M48 40 L62 0 L66 0 L52 40Z" fill="#9fdcff" opacity="0.14"/>
    <g stroke="#40e8ff" stroke-width="0.8" fill="none" opacity="0.8">
      <path d="M70 8 H92 V14"/><path d="M70 32 H92 V26"/>
      <circle cx="81" cy="20" r="4"/><path d="M75 20 H78 M84 20 H87 M81 14 V16 M81 24 V26"/>
    </g>
    <text x="72" y="26" font-size="3" fill="#40e8ff" font-family="monospace" opacity="0.8">RNG 4.2</text>
    <g stroke="#0c1218" stroke-width="0.7" fill="none">
      <path d="M0 3 H100 M0 37 H100 M2 0 V40 M98 0 V40"/>
      <path d="M0 0 L9 6 L6 12 M100 40 L90 33 L93 28 M100 0 L92 5 L95 9 M0 40 L8 34 L5 30"/>
    </g>
  </svg>`,
  { size: 512 },
);

const hullMark = svg(
  `<svg viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg">
    <text x="4" y="30" font-size="26" font-weight="bold" font-family="monospace" fill="#d8dcc8" opacity="0.55">R-07</text>
    <path d="M80 6 L90 14 L100 6 V14 L90 22 L80 14Z" fill="#e0b020" opacity="0.7"/>
    <path d="M80 20 L90 28 L100 20 V28 L90 36 L80 28Z" fill="#e0b020" opacity="0.7"/>
  </svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "railgunCarrier" });
>>>>>>> REPLACE

<<<<<<< SEARCH
import { createBuilder, type Builder } from "agentic-3js-builder";
=======
import { createBuilder, paint, noise, mix, smoothstep, svg, type Builder } from "agentic-3js-builder";
>>>>>>> REPLACE

<<<<<<< SEARCH
    box(HULL, [0.15, 0.9, 6.4], [s * 1.55, 1.75, -2.2], { name: s > 0 ? "hullSideL" : "hullSideR" });
=======
    box(camoPaint as unknown as string, [0.15, 0.9, 6.4], [s * 1.55, 1.75, -2.2], { name: s > 0 ? "hullSideL" : "hullSideR" });
    b.part(new THREE.PlaneGeometry(1.6, 0.64), "#ffffff", {
      at: [s * 1.64, 1.75, -0.6],
      dir: [s, 0, 0],
      up: [0, 1, 0],
      axis: "z",
      texture: hullMark,
      name: "hullMark",
    });
>>>>>>> REPLACE

<<<<<<< SEARCH
    cyl(TIRE, 0.7, 0.55, [cx, 0.7, zc], X, 14, { name: "tire" });
=======
    cyl(treadPaint as unknown as string, 0.7, 0.55, [cx, 0.7, zc], X, 14, { name: "tire" });
>>>>>>> REPLACE

<<<<<<< SEARCH
  box(GLASS, [2.2, 0.7, 0.1], [0, 2.2, 5.15], { rotation: [-25, 0, 0], name: "windshield" });
=======
  b.part(new THREE.BoxGeometry(2.2, 0.7, 0.1), "#ffffff", {
    at: [0, 2.2, 5.15],
    rotation: [-25, 0, 0],
    texture: glassTex,
    name: "windshield",
  });
>>>>>>> REPLACE

<!-- call: add1 -->

```ts
import * as THREE from "three";
import { type Builder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addRoofLightBar(b: Builder) {
  const Y = 2.78; // roof top surface (cabRoof centre 2.55 + half height 0.075 = 2.625; bar sits on bracket stack)
  const baseY = 2.625;
  const cz = 4.2;
  const AMBER_DARK = "#7a5a10";

  const box = (color: string, size: [number, number, number], at: [number, number, number], o: any = {}) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at, flat: true, ...o });

  // dark housing: main bar plus a stepped top cap
  box(DARK, [1.7, 0.1, 0.34], [0, baseY + 0.13, cz], { name: "lbHousing" });
  box(HULL_DARK, [1.74, 0.04, 0.38], [0, baseY + 0.2, cz], { name: "lbCap" });
  box(DARK, [1.74, 0.04, 0.38], [0, baseY + 0.07, cz], { name: "lbBase" });

  // end brackets and mid mounts
  for (const s of [1, -1]) {
    box(STEEL, [0.08, 0.22, 0.3], [s * 0.88, baseY + 0.12, cz], { name: "lbEndBracket" });
    box(DARK, [0.1, 0.06, 0.34], [s * 0.88, baseY + 0.24, cz], { name: "lbEndCap" });
    for (const x of [0.45, 0.0]) {
      if (s < 0 && x === 0) continue;
      box(STEEL, [0.12, 0.08, 0.22], [s * x, baseY + 0.04, cz], { name: "lbMount" });
      b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.03, 6), DARK, {
        at: [s * x, baseY + 0.025, cz + 0.08],
        flat: true,
        name: "lbBolt",
      });
    }
  }

  // six lamps alternating CYAN and HAZARD, each with a dark bezel and lens
  const n = 6;
  for (let i = 0; i < n; i++) {
    const x = -0.65 + (i * 1.3) / (n - 1);
    const col = i % 2 === 0 ? CYAN : HAZARD;
    // bezel frame
    box(DARK, [0.2, 0.15, 0.3], [x, baseY + 0.17, cz], { name: "lbBezel" });
    // glowing lens (box front)
    glow(box(col, [0.16, 0.11, 0.1], [x, baseY + 0.17, cz + 0.17], { name: "lbLamp" }), 1.6);
    // domed top lens
    glow(
      b.part(new THREE.SphereGeometry(0.075, 6, 4, 0, Math.PI * 2, 0, Math.PI / 2), col, {
        at: [x, baseY + 0.23, cz],
        flat: true,
        name: "lbDome",
      }),
      1.4,
    );
    // rear lens, dimmer
    glow(box(col === CYAN ? HAZARD : CYAN, [0.12, 0.06, 0.04], [x, baseY + 0.17, cz - 0.17], { name: "lbRear" }), 0.8);
  }

  // dividing fins between lamps
  for (let i = 0; i <= n; i++) {
    const x = -0.65 - 0.13 + (i * 1.3) / (n - 1) * (n / (n - 1)) * 0.0 + ((i * 1.56) / n - 0.0) - 0.0;
    const px = -0.78 + (i * 1.56) / n;
    box(STEEL, [0.02, 0.16, 0.32], [px, baseY + 0.17, cz], { name: "lbFin" });
    void x;
  }

  // small hazard stripes on the roof ahead of the bar
  for (let i = -3; i <= 3; i++) {
    if (i % 2 !== 0) continue;
    box(AMBER_DARK, [0.16, 0.012, 0.1], [i * 0.3, baseY + 0.008, cz + 0.32], { name: "roofStripe" });
  }
  // cable conduit running back from bar
  box(DARK, [0.08, 0.05, 0.5], [0, baseY + 0.03, cz - 0.32], { name: "lbConduit" });
  b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.1, 6), STEEL, {
    at: [0, baseY + 0.05, cz - 0.6],
    flat: true,
    name: "lbGland",
  });
}
```

<!-- call: add2 -->

```ts
import * as THREE from "three";
import { type Builder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addRailCoils(b: Builder) {
  type V = [number, number, number];
  const BRASS = "#d9a24a";
  const INSUL = "#d8d2c0";
  const BOLT = "#3a3f48";

  const box = (color: string, size: V, at: V, name: string, o: any = {}) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at, flat: true, name, ...o });

  // rails: centres x = ±0.38, y = 3.5, size 0.32 x 0.36, z from -4.6 to 6.6
  const coilZ = [0.9, 1.6, 2.3, 3.0, 3.7, 4.4, 5.1, 5.8];

  for (const s of [1, -1]) {
    const x = s * 0.38;
    for (const z of coilZ) {
      // glowing coil band wrapped around the rail
      glow(box(CYAN, [0.4, 0.44, 0.22], [x, 3.5, z], "railCoil"), 1.4);
      // copper rings either side of the coil
      for (const dz of [-0.14, 0.14]) {
        box(COPPER, [0.45, 0.49, 0.06], [x, 3.5, z + dz], "coilRing");
      }
    }
    // insulator blocks hanging on the outer flank of the rail, between coils
    for (let i = 0; i < coilZ.length - 1; i += 2) {
      const z = (coilZ[i] + coilZ[i + 1]) / 2;
      box(INSUL, [0.14, 0.24, 0.3], [x + s * 0.25, 3.5, z], "insulator");
      box(BOLT, [0.06, 0.1, 0.1], [x + s * 0.34, 3.5, z], "insulatorBolt");
      box(BRASS, [0.16, 0.06, 0.34], [x + s * 0.25, 3.64, z], "insulatorCap");
    }
    // lead-in cable on top of rail
    box(DARK, [0.08, 0.08, 4.9], [x, 3.76, 3.35], "coilCable");
  }

  // cross-feed busbars between rails at coil clusters
  for (const z of [1.25, 3.35, 5.45]) {
    box(BRASS, [0.7, 0.07, 0.12], [0, 3.8, z], "busbar");
    box(BOLT, [0.12, 0.12, 0.16], [0, 3.84, z], "busbarNode");
  }
  // glowing mid-gap strip hinting at the plasma channel
  glow(box(CYAN, [0.1, 0.1, 4.8], [0, 3.5, 3.35], "gapGlow"), 1.0);
}
```

<!-- call: add3 -->

```ts
import * as THREE from "three";
import { type Builder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addMuzzleBrake(b: Builder) {
  type V = [number, number, number];
  const box = (color: string, size: V, at: V, o: any = {}) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at, flat: true, ...o });
  const cyl = (color: string, r: number, len: number, at: V, dir: V, sides = 8, o: any = {}) =>
    b.part(new THREE.CylinderGeometry(r, r, len, sides), color, { at, dir, flat: true, ...o });

  const X: V = [1, 0, 0];
  const Z: V = [0, 0, 1];

  // ---- Muzzle assembly (rails end near z = 6.6, centred y = 3.5, x = +-0.38) ----
  const zf = 6.25;
  // spacer frame
  box(DARK, [1.3, 0.12, 0.3], [0, 3.76, zf], { name: "muzzleFrameTop" });
  box(DARK, [1.3, 0.12, 0.3], [0, 3.24, zf], { name: "muzzleFrameBot" });
  for (const s of [1, -1]) {
    box(DARK, [0.14, 0.64, 0.3], [s * 0.64, 3.5, zf], { name: "muzzleFrameSide" });
    // flared blast shield plates
    box(PLATE, [0.08, 0.7, 0.55], [s * 0.78, 3.5, zf + 0.35], { rotation: [0, s * 22, 0], name: "blastPlate" });
    box(HULL_DARK, [0.5, 0.06, 0.5], [s * 0.4, 3.9, zf + 0.35], { rotation: [0, 0, -s * 12], name: "blastFlapTop" });
    box(HULL_DARK, [0.5, 0.06, 0.5], [s * 0.4, 3.1, zf + 0.35], { rotation: [0, 0, s * 12], name: "blastFlapBot" });
    // copper end rings
    box(COPPER, [0.4, 0.46, 0.1], [s * 0.38, 3.5, 6.62], { name: "railTipCollar" });
    // bolts on frame
    for (const y of [3.76, 3.24]) cyl(STEEL, 0.035, 0.08, [s * 0.5, y + 0.07 * (y > 3.5 ? 1 : -1), zf], [0, 1, 0], 6, { name: "frameBolt" });
  }
  // glowing arc gap
  glow(box(CYAN, [0.24, 0.12, 0.5], [0, 3.5, 6.35], { name: "arcGap" }), 2);
  glow(box(CYAN, [0.05, 0.4, 0.3], [0, 3.5, 6.7], { name: "arcSpark" }), 2.5);
  // hazard marking on frame front
  box(HAZARD, [1.0, 0.05, 0.05], [0, 3.82, zf + 0.15], { name: "muzzleHazard" });

  // ---- Capacitor banks (tanks at x = +-1.0, y = 3.0, z -4.9..-0.3, r 0.5) ----
  for (const s of [1, -1]) {
    const ox = s * 1.0;
    // extra warning bands
    for (const z of [-2.0, -3.2]) cyl(HAZARD, 0.515, 0.12, [ox, 3.0, z], Z, 10, { name: "capWarn" });
    for (const z of [-2.0, -3.2]) cyl(DARK, 0.52, 0.04, [ox, 3.0, z + 0.08], Z, 10, { name: "capWarnEdge" });
    // end caps
    cyl(PLATE, 0.45, 0.1, [ox, 3.0, -0.25], Z, 10, { name: "capEndFront" });
    cyl(PLATE, 0.45, 0.1, [ox, 3.0, -4.95], Z, 10, { name: "capEndRear" });
    // terminal posts on top
    for (const z of [-1.6, -2.6, -3.6]) {
      cyl(STEEL, 0.06, 0.2, [ox, 3.58, z], [0, 1, 0], 6, { name: "terminalPost" });
      cyl(COPPER, 0.09, 0.05, [ox, 3.7, z], [0, 1, 0], 6, { name: "terminalCap" });
    }
    // status lamps on outer face
    const lampX = ox + s * 0.5;
    const cols = [CYAN, MAGENTA, CYAN, MAGENTA];
    cols.forEach((c, i) => {
      glow(box(c, [0.06, 0.1, 0.1], [lampX, 3.15, -1.2 - i * 0.55], { name: "capLamp" }), 1.6);
    });
    box(DARK, [0.05, 0.2, 2.0], [lampX - s * 0.01, 3.15, -2.0], { name: "lampPanel" });
    // cable loops to breech (breech at z -3.6, x 0, y 3.15)
    const pts: V[] = [
      [ox, 3.7, -1.6],
      [ox * 0.8, 4.05, -2.1],
      [ox * 0.4, 4.1, -2.9],
      [ox * 0.3, 3.8, -3.3],
    ];
    b.sweep(pts, 0.04, { color: DARK, name: "capCable", sides: 6 });
    // second cable from rear terminal
    const pts2: V[] = [
      [ox, 3.7, -3.6],
      [ox * 0.7, 3.95, -3.6],
      [ox * 0.25, 3.75, -3.6],
    ];
    b.sweep(pts2, 0.035, { color: COPPER, name: "capCable2", sides: 6 });
    // cable clamps
    box(STEEL, [0.1, 0.1, 0.1], [ox * 0.8, 4.05, -2.1], { name: "cableClamp" });
    // mounting straps
    for (const z of [-1.0, -4.2]) box(STEEL, [1.04, 0.06, 0.12], [ox, 3.0, z], { name: "capStrap" });
  }
}
```

<!-- call: add4 -->

```ts
import * as THREE from "three";
import { type Builder } from "agentic-3js-builder";

export function addRearVents(b: Builder) {
  const Z0 = -5.65; // outside rear hull face (hullRear spans z -5.65..-5.45)
  const box = (color: string, size: [number, number, number], at: [number, number, number], o: any = {}) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at, flat: true, ...o });
  const cyl = (color: string, r: number, len: number, at: [number, number, number], dir: [number, number, number], sides = 8, o: any = {}) =>
    b.part(new THREE.CylinderGeometry(r, r, len, sides), color, { at, dir, flat: true, ...o });

  // radiator frame (four bars) on the rear face
  const cy = 1.7;
  const W = 2.3, H = 0.95;
  const zf = Z0 - 0.03;
  box(STEEL, [W, 0.08, 0.1], [0, cy + H / 2, zf], { name: "radFrameTop" });
  box(STEEL, [W, 0.08, 0.1], [0, cy - H / 2, zf], { name: "radFrameBottom" });
  for (const s of [1, -1]) box(STEEL, [0.08, H, 0.1], [s * W / 2, cy, zf], { name: "radFrameSide" });
  // dark recess behind louvres
  box(DARK, [W - 0.1, H - 0.1, 0.05], [0, cy, Z0 - 0.015], { name: "radBack" });

  // louvres: slanted slats
  const n = 7;
  for (let i = 0; i < n; i++) {
    const y = cy - H / 2 + 0.12 + (i * (H - 0.24)) / (n - 1);
    box(DARK, [W - 0.2, 0.07, 0.14], [0, y, Z0 - 0.09], { rotation: [-30, 0, 0], name: "louvre" });
    box(HULL_DARK, [W - 0.2, 0.02, 0.05], [0, y + 0.045, Z0 - 0.04], { name: "louvreLip" });
  }
  // centre divider and bolts
  box(STEEL, [0.07, H - 0.1, 0.12], [0, cy, Z0 - 0.1], { name: "radDivider" });
  for (const sx of [1, -1])
    for (const sy of [1, -1])
      cyl(DARK, 0.04, 0.05, [sx * (W / 2 - 0.0), cy + sy * (H / 2), zf - 0.06], [0, 0, 1], 6, { name: "radBolt" });
  // hazard strip under grille
  box(HAZARD, [W, 0.1, 0.06], [0, cy - H / 2 - 0.12, Z0 - 0.02], { name: "radWarn" });
  for (let i = -4; i <= 4; i++)
    box(DARK, [0.1, 0.11, 0.07], [i * 0.26, cy - H / 2 - 0.12, Z0 - 0.025], { rotation: [0, 0, 35], name: "radWarnStripe" });

  // exhaust stacks above
  for (const s of [1, -1]) {
    const x = s * 0.8;
    box(STEEL, [0.5, 0.15, 0.4], [x, 2.58, -5.3], { name: "stackBase" });
    cyl(DARK, 0.18, 0.9, [x, 3.05, -5.3], [0, 1, 0], 8, { name: "stack" });
    cyl(STEEL, 0.21, 0.1, [x, 2.65, -5.3], [0, 1, 0], 8, { name: "stackCollar" });
    cyl(STEEL, 0.21, 0.1, [x, 3.5, -5.3], [0, 1, 0], 8, { name: "stackRim" });
    cyl(HULL_DARK, 0.13, 0.04, [x, 3.52, -5.3], [0, 1, 0], 8, { name: "stackMouth" });
    cyl(COPPER, 0.2, 0.06, [x, 3.2, -5.3], [0, 1, 0], 8, { name: "stackBand" });
    b.rod([x, 2.6, -5.5], [x, 3.0, -5.45], 0.04, STEEL, { name: "stackBrace" });
  }
}
```

<!-- call: add5 -->

```ts
import * as THREE from "three";
import { type Builder, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addFrontSensors(b: Builder) {
  type V = [number, number, number];
  const AMBER = "#ffb23c";
  const LENS = "#10222c";
  const box = (color: string, size: V, at: V, o: any = {}) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at, flat: true, ...o });
  const cyl = (color: string, r: number, len: number, at: V, dir: V, sides = 10, o: any = {}) =>
    b.part(new THREE.CylinderGeometry(r, r, len, sides), color, { at, dir, flat: true, ...o });
  const Z: V = [0, 0, 1];

  const dish = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#aab2ba" stroke="#23272d" stroke-width="3"/>
    <circle cx="32" cy="32" r="21" fill="none" stroke="#5b6570" stroke-width="2"/>
    <circle cx="32" cy="32" r="11" fill="none" stroke="#5b6570" stroke-width="2"/>
    <circle cx="32" cy="32" r="4" fill="#40e8ff"/></svg>`,
    { size: 128 },
  );
  const stripe = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e0b020"/>
    <path d="M0 16 L8 0 L16 0 L8 16Z M16 16 L24 0 L32 0 L24 16Z M32 16 L40 0 L48 0 L40 16Z M48 16 L56 0 L64 0 L56 16Z" fill="#23272d"/></svg>`,
    { size: 128 },
  );

  // headlamp pods (armoured housings around stage 1 lamps)
  for (const s of [1, -1]) {
    const x = s * 0.85;
    box(DARK, [0.7, 0.34, 0.2], [x, 1.55, 5.62], { name: "lampPod" });
    box(HULL_DARK, [0.78, 0.08, 0.3], [x, 1.76, 5.66], { name: "lampVisor" });
    box(HULL_DARK, [0.78, 0.06, 0.26], [x, 1.35, 5.64], { name: "lampSill" });
    for (const e of [-1, 1]) box(PLATE, [0.06, 0.34, 0.26], [x + e * 0.38, 1.55, 5.64], { name: "lampGuard" });
    glow(box(AMBER, [0.14, 0.1, 0.06], [x + s * 0.62, 1.55, 5.62], { name: "indicator" }), 1.4);
    glow(cyl(CYAN, 0.05, 0.06, [x - s * 0.18, 1.55, 5.74], Z, 8, { name: "lampLens" }), 1.5);
    for (const dz of [-1, 1]) cyl(STEEL, 0.025, 0.04, [x + dz * 0.3, 1.55 + dz * 0.12, 5.74], Z, 6, { name: "lampBolt" });
  }

  // bumper plates
  box(PLATE, [2.6, 0.18, 0.12], [0, 1.22, 5.78], { name: "bumperPlate" });
  b.part(new THREE.PlaneGeometry(2.2, 0.14), "#ffffff", {
    at: [0, 1.0, 5.76],
    dir: Z,
    axis: "z",
    texture: stripe,
    name: "bumperStripe",
  });
  for (const s of [1, -1]) {
    box(STEEL, [0.14, 0.4, 0.1], [s * 1.35, 1.0, 5.78], { name: "bumperBracket" });
    cyl(DARK, 0.04, 0.06, [s * 1.35, 1.1, 5.84], Z, 6, { name: "bumperBolt" });
  }

  // tow hook
  box(DARK, [0.34, 0.3, 0.16], [0, 0.88, 5.7], { name: "towMount" });
  b.rod([0, 0.88, 5.78], [0, 0.88, 6.0], 0.06, STEEL, { name: "towShank" });
  b.sweep(
    [
      [0, 0.88, 6.0],
      [0, 0.6, 6.08],
      [0, 0.45, 5.98],
      [0, 0.55, 5.85],
    ],
    0.045,
    { color: STEEL, name: "towHook", sides: 6 },
  );

  // mast on the cab roof front
  box(DARK, [0.4, 0.1, 0.4], [-0.8, 2.66, 4.9], { name: "mastBase" });
  b.rod([-0.8, 2.66, 4.9], [-0.8, 3.1, 4.9], 0.04, STEEL, { name: "mast", sides: 6 });
  // camera turret
  cyl(DARK, 0.13, 0.1, [-0.8, 3.15, 4.9], [0, 1, 0], 8, { name: "turretRing" });
  b.part(new THREE.SphereGeometry(0.15, 8, 6), HULL_DARK, { at: [-0.8, 3.3, 4.9], flat: true, name: "turretDome" });
  box(DARK, [0.16, 0.14, 0.2], [-0.8, 3.3, 5.03], { name: "camBody" });
  glow(cyl(CYAN, 0.045, 0.04, [-0.8, 3.3, 5.14], Z, 8, { name: "camLens" }), 1.3);
  box(STEEL, [0.04, 0.2, 0.04], [-0.65, 3.45, 4.9], { name: "camWhip" });

  // radar dish
  box(DARK, [0.4, 0.1, 0.4], [0.8, 2.66, 4.9], { name: "radarBase" });
  cyl(STEEL, 0.1, 0.3, [0.8, 2.82, 4.9], [0, 1, 0], 8, { name: "radarPost" });
  box(DARK, [0.18, 0.12, 0.18], [0.8, 3.0, 4.9], { name: "radarYoke" });
  b.part(new THREE.CylinderGeometry(0.42, 0.1, 0.12, 12), STEEL, {
    at: [0.8, 3.2, 5.0],
    dir: [0, 0.3, 1],
    flat: true,
    name: "radarBowl",
  });
  b.part(new THREE.PlaneGeometry(0.8, 0.8), "#ffffff", {
    at: [0.8, 3.2 + 0.07 * 0.3, 5.0 + 0.07],
    dir: [0, 0.3, 1],
    axis: "z",
    texture: dish,
    name: "radarFace",
  });
  b.rod([0.8, 3.2, 5.06], [0.8, 3.38, 5.34], 0.015, DARK, { name: "radarFeed", sides: 6 });
  glow(b.part(new THREE.SphereGeometry(0.035, 6, 4), CYAN, { at: [0.8, 3.38, 5.34], name: "radarTip" }), 1.5);

  // roof lamp strip over windscreen
  for (const s of [1, -1]) {
    glow(box(AMBER, [0.16, 0.06, 0.08], [s * 0.45, 2.6, 5.1], { name: "roofMarker" }), 1.2);
  }
}
```

<!-- call: add6 -->

```ts
import * as THREE from "three";
import { type Builder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addAntennaArray(b: Builder) {
  type V = [number, number, number];
  const box = (color: string, size: V, at: V, o: any = {}) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at, flat: true, ...o });
  const cyl = (color: string, r: number, len: number, at: V, dir: V, sides = 8, o: any = {}) =>
    b.part(new THREE.CylinderGeometry(r, r, len, sides), color, { at, dir, flat: true, ...o });
  const UP: V = [0, 1, 0];
  const X: V = [1, 0, 0];

  // ---- Antenna array (hullTop at y~2.55 top surface, around x=-1.1, z=1.8)
  const ax = -1.1, az = 1.8, top = 2.55;
  // transceiver box with mount plate, vents and lamp
  box(DARK, [0.7, 0.06, 0.6], [ax, top + 0.03, az], { name: "antPlate" });
  box(HULL_DARK, [0.5, 0.26, 0.4], [ax + 0.05, top + 0.19, az - 0.05], { name: "transceiver" });
  for (let i = 0; i < 3; i++) box(DARK, [0.34, 0.025, 0.02], [ax + 0.05, top + 0.12 + i * 0.07, az + 0.16], { name: "xcvrVent" });
  glow(box(CYAN, [0.05, 0.05, 0.03], [ax + 0.2, top + 0.27, az + 0.16], { name: "xcvrLamp" }), 1.5);
  for (const [dx, dz] of [[-0.3, -0.25], [0.3, -0.25], [-0.3, 0.25], [0.3, 0.25]])
    cyl(STEEL, 0.025, 0.04, [ax + dx, top + 0.08, az + dz], UP, 6, { name: "antBolt" });

  // three whips of different heights with bases and tips
  const whips: [number, number, number][] = [[-0.25, 0.2, 1.5], [0.05, 0.25, 1.1], [0.28, 0.0, 0.75]];
  whips.forEach(([dx, dz, h], i) => {
    const x = ax + dx, z = az + dz + 0.1;
    cyl(STEEL, 0.06, 0.1, [x, top + 0.1, z], UP, 8, { name: "whipBase" });
    cyl(DARK, 0.045, 0.14, [x, top + 0.2, z], UP, 8, { name: "whipSpring" });
    b.rod([x, top + 0.27, z], [x, top + h, z], [0.022, 0.008], STEEL, { name: "whip", sides: 6 });
    glow(b.part(new THREE.SphereGeometry(0.025, 6, 4), i % 2 ? MAGENTA : CYAN, { at: [x, top + h + 0.02, z], name: "whipTip" }), 1.4);
    box(HAZARD, [0.05, 0.04, 0.05], [x, top + h * 0.55, z], { name: "whipFlag", scale: [1, 1, 1] });
  });

  // flat dish on a short mast
  const dx0 = ax - 0.15, dz0 = az - 0.2;
  cyl(STEEL, 0.04, 0.5, [dx0, top + 0.3, dz0], UP, 6, { name: "dishMast" });
  const dish = b.lathe(
    [[0, 0], [0.22, 0.03], [0.24, 0.05], [0.2, 0.05], [0.0, 0.015]],
    { at: [dx0, top + 0.58, dz0], axis: [0, 0.6, 0.8], segments: 10, color: PLATE, name: "dish" },
  );
  cyl(DARK, 0.03, 0.18, [dx0, top + 0.67, dz0 + 0.12], [0, 0.6, 0.8], 6, { name: "dishFeed" });
  void dish;

  // ---- Stabiliser details: all four legs
  for (const s of [1, -1])
    for (const z of [2.0, -3.6]) {
      const px = s * 3.0;
      // hazard striped sleeve on lower leg
      for (let i = 0; i < 4; i++) {
        const t = i / 3;
        cyl(i % 2 ? DARK : HAZARD, 0.235, 0.07, [px - s * 0.15 + s * 0.15 * t, 0.58 - 0.31 * t, z], [s * 0.35, -0.9, 0], 8, { name: "legStripe" });
      }
      // hydraulic hose: arc from upper leg to pad knuckle
      const hose = b.sweep(
        [[s * 2.1, 1.25, z + 0.28], [s * 2.5, 1.0, z + 0.45], [px - s * 0.2, 0.75, z + 0.4], [px - s * 0.05, 0.42, z + 0.12]],
        0.035,
        { color: DARK, sides: 6, name: "hose" },
      );
      void hose;
      cyl(STEEL, 0.06, 0.1, [px - s * 0.05, 0.4, z + 0.12], UP, 6, { name: "hoseFitting" });
      // pad bolts ring
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        cyl(STEEL, 0.045, 0.06, [px + Math.cos(a) * 0.5, 0.22, z + Math.sin(a) * 0.5], UP, 6, { name: "padBolt" });
      }
      // ground spike below the pad
      b.spike([px, 0.02, z], [0, -1, 0], 0.0, 0.0, { color: STEEL });
      b.part(new THREE.ConeGeometry(0.14, 0.3, 6), STEEL, { at: [px, 0.0, z], dir: [0, -1, 0], flat: true, name: "groundSpike" });
      // hazard chevrons on pad top
      for (const k of [-1, 1]) box(HAZARD, [0.2, 0.025, 0.07], [px + k * 0.38, 0.22, z], { rotation: [0, 0, 0], name: "padMark" });
    }
  void X;
}
```