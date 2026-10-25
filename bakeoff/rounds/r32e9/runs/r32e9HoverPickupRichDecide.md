```ts
import * as THREE from "three";
import { createBuilder, paint, patches, mix } from "agentic-3js-builder";
import { svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";

export const meta = {
  name: "Aegis HVR-07 Hover Technical",
  description:
    "A militarized pickup converted to four hover thrusters: camo-plated hull, neon trim, rocket pod and pintle gun in the bed, glowing turbine pods.",
};

// ---------- palette ----------
const CYAN = "#38f2ff";
const MAGENTA = "#ff2bd6";
const AMBER = "#ffb02e";
const RED = "#ff2b3a";
const DARK = "#12171d";
const STEEL = "#2a323c";
const GLASS = "#0c3447";
const WHITE = "#ffffff";

// ---------- textures ----------
const FAN = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="48" fill="#06222b" stroke="#38f2ff" stroke-width="4"/>
  ${[0, 1, 2, 3, 4, 5, 6, 7]
    .map(
      (k) =>
        `<g transform="rotate(${k * 45} 50 50)"><path d="M50 50 Q64 30 53 8 Q40 28 50 50Z" fill="#7ff8ff"/><path d="M50 50 Q56 34 53 8" stroke="#ffffff" stroke-width="1.5" fill="none"/></g>`,
    )
    .join("")}
  <circle cx="50" cy="50" r="30" fill="none" stroke="#38f2ff" stroke-width="2" opacity="0.8"/>
  <circle cx="50" cy="50" r="9" fill="#ffffff" stroke="#38f2ff" stroke-width="3"/>
  </svg>`,
  { size: 192 },
);

const DOOR = svg(
  `<svg viewBox="0 0 180 90" xmlns="http://www.w3.org/2000/svg">
  <defs><pattern id="h" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
    <rect width="7" height="14" fill="#ffb02e"/><rect x="7" width="7" height="14" fill="#14181d"/></pattern></defs>
  <rect x="2" y="2" width="176" height="86" rx="6" fill="#0d1218" stroke="#38f2ff" stroke-width="3"/>
  <rect x="8" y="8" width="164" height="12" fill="url(#h)"/>
  <text x="12" y="62" font-family="monospace" font-weight="bold" font-size="38" fill="#ffffff">HVR-07</text>
  <text x="14" y="80" font-family="monospace" font-size="11" fill="#ff2bd6">AEGIS HOVER CORPS</text>
  <circle cx="148" cy="55" r="22" fill="none" stroke="#38f2ff" stroke-width="3"/>
  <path d="M148 36 L153 52 L170 52 L156 62 L161 78 L148 68 L135 78 L140 62 L126 52 L143 52Z" fill="#ff2bd6" stroke="#ffffff" stroke-width="1.5"/>
  </svg>`,
  { size: 384 },
);

const EMBLEM = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <path d="M50 4 L92 28 L92 72 L50 96 L8 72 L8 28Z" fill="#0d1218" stroke="#ff2bd6" stroke-width="5"/>
  <path d="M50 20 L78 36 L78 64 L50 80 L22 64 L22 36Z" fill="none" stroke="#38f2ff" stroke-width="3"/>
  <path d="M26 50 Q50 28 74 50 Q50 72 26 50Z" fill="#ff2bd6" stroke="#ffffff" stroke-width="2"/>
  <circle cx="50" cy="50" r="9" fill="#38f2ff"/><circle cx="50" cy="50" r="4" fill="#0d1218"/>
  <path d="M50 4 L50 14 M50 86 L50 96" stroke="#38f2ff" stroke-width="4"/>
  </svg>`,
  { size: 192 },
);

const PLATE = svg(
  `<svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
  <rect x="1" y="1" width="98" height="48" rx="5" fill="#e8e6d0" stroke="#111" stroke-width="2"/>
  <rect x="1" y="1" width="98" height="11" fill="#1c3f9a"/>
  <text x="50" y="10" text-anchor="middle" font-family="monospace" font-size="8" fill="#38f2ff">NEO-CITY</text>
  <text x="50" y="40" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="25" fill="#111">K9-4417</text>
  </svg>`,
  { size: 192 },
);

const CRATE = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs><pattern id="h" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
    <rect width="5" height="10" fill="#ffb02e"/><rect x="5" width="5" height="10" fill="#14181d"/></pattern></defs>
  <rect width="64" height="64" fill="#3b4a3a"/>
  <rect x="2" y="2" width="60" height="60" fill="none" stroke="url(#h)" stroke-width="6"/>
  <text x="32" y="38" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="14" fill="#f2f2e0">AMMO</text>
  <rect x="14" y="44" width="36" height="3" fill="#ff2bd6"/>
  </svg>`,
  { size: 128 },
);

const VENT = svg(
  `<svg viewBox="0 0 64 32" xmlns="http://www.w3.org/2000/svg">
  <rect width="64" height="32" fill="#0b0f14"/>
  ${[4, 11, 18, 25].map((y) => `<rect x="4" y="${y}" width="56" height="3.5" fill="#ff2bd6"/>`).join("")}
  </svg>`,
  { size: 128 },
);

// ---------- paints ----------
const CAMO = patches("#26333d", ["#1d2830", "#34453f", "#262a45", "#2d3b47"], { size: 0.5, gap: 0.04, seed: 4 });
const ARMOR = panelled(CAMO, { size: 0.5, aspect: 0.6, rivets: 0.07 });
const HULL = paint((p, n) => {
  if (p.y < 0.86) return mix("#14181d", "#2b2f33", n.y * 0.5 + 0.5);
  return ARMOR;
});
const POD = panelled(metal("blued", { tarnish: 0.5 }), { size: 0.3, rivets: 0.06 });
const IRON = metal("iron", { tarnish: 0.6 });
const STEELP = metal("steel", { tarnish: 0.5, polish: 0.2 });
const PLATING = panelled(metal("iron"), { size: 0.3, rivets: 0.05 });

export default function build() {
  const b = createBuilder({ name: "hoverTechnical" });

  const box = (w: number, h: number, d: number, c: any, at: number[], o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at, ...o });
  const cyl = (r: number, len: number, c: any, at: number[], dir: number[], seg = 8) =>
    b.part(new THREE.CylinderGeometry(r, r, len, seg), c, { at, dir });

  // ---------- chassis & hull ----------
  box(1.3, 0.14, 4.2, DARK, [0, 0.64, 0]);
  glow(box(1.0, 0.03, 3.4, MAGENTA, [0, 0.675, 0]), 1.2);

  // lower hull (side profile in z,y)
  b.extrude(
    [
      [-2.5, 0.7],
      [2.45, 0.7],
      [2.56, 0.95],
      [2.4, 1.22],
      [1.0, 1.34],
      [-0.55, 1.34],
      [-0.55, 1.0],
      [-2.5, 1.0],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 1.9, bevel: 0.03, color: HULL },
  );
  // cab
  b.extrude(
    [
      [-0.6, 1.3],
      [1.1, 1.3],
      [0.7, 1.95],
      [-0.35, 1.95],
      [-0.6, 1.65],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 1.76, bevel: 0.025, color: HULL },
  );

  // windows
  box(1.5, 0.02, 0.62, GLASS, [0, 1.631, 0.91], { rotation: [58, 0, 0] });
  box(1.3, 0.02, 0.3, GLASS, [0, 1.809, -0.483], { rotation: [-50, 0, 0] });
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0.05, 1.45],
        [0.05, 1.84],
        [0.72, 1.84],
        [0.98, 1.45],
      ],
      { at: [s * 0.89, 0, 0], x: [0, 0, 1], thickness: 0.02, color: GLASS },
    );
    b.extrude(
      [
        [-0.52, 1.45],
        [-0.52, 1.68],
        [-0.34, 1.84],
        [-0.1, 1.84],
        [-0.1, 1.45],
      ],
      { at: [s * 0.89, 0, 0], x: [0, 0, 1], thickness: 0.02, color: GLASS },
    );
    // skirts + neon
    box(0.08, 0.2, 2.6, PLATING, [s * 0.99, 0.8, -0.1]);
    glow(box(0.02, 0.03, 2.4, CYAN, [s * 1.04, 0.8, -0.1]), 1.3);
    // door decal
    glow(
      b.part(new THREE.PlaneGeometry(0.9, 0.45), WHITE, {
        at: [s * 0.956, 1.06, 0.55],
        dir: [s, 0, 0],
        axis: "z",
        texture: DOOR,
      }),
      0.6,
    );
    // door handle, mirror
    box(0.03, 0.04, 0.16, STEEL, [s * 0.905, 1.55, 0.3]);
    b.rod([s * 0.9, 1.5, 0.95], [s * 1.08, 1.58, 0.9], 0.015, STEEL);
    box(0.06, 0.14, 0.2, DARK, [s * 1.12, 1.58, 0.9]);
    glow(box(0.01, 0.1, 0.15, CYAN, [s * 1.152, 1.58, 0.9]), 0.8);
    // hood edge neon
    glow(b.rod([s * 0.93, 1.335, 1.0], [s * 0.93, 1.225, 2.4], 0.014, CYAN), 1.4);
    // antennas
    b.rod([s * 0.75, 1.9, -0.35], [s * 0.8, 2.6, -0.45], 0.01, STEEL);
    glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), RED, { at: [s * 0.8, 2.62, -0.45] }), 1.6);
    // headlights
    glow(box(0.5, 0.09, 0.04, WHITE, [s * 0.62, 1.1, 2.49], { rotation: [-8, 0, 0] }), 1.6);
    glow(box(0.5, 0.025, 0.045, CYAN, [s * 0.62, 1.03, 2.5], { rotation: [-8, 0, 0] }), 1.5);
    // tail lights
    glow(box(0.45, 0.1, 0.03, RED, [s * 0.68, 1.28, -2.51]), 1.5);
    glow(box(0.2, 0.07, 0.03, AMBER, [s * 0.25, 1.28, -2.51]), 1.2);
    // searchlights
    cyl(0.08, 0.16, DARK, [s * 0.5, 2.05, 0.6], [0, 0.1, 1]);
    glow(
      b.part(new THREE.CircleGeometry(0.065, 8), WHITE, { at: [s * 0.5, 2.062, 0.69], dir: [0, 0.1, 1], axis: "z" }),
      1.8,
    );
    // armour hood plates
    box(0.5, 0.05, 1.0, PLATING, [s * 0.62, 1.29, 1.7], { rotation: [4.9, 0, s * 3] });
    // bull bar uprights
    box(0.07, 0.4, 0.07, STEEL, [s * 0.5, 0.95, 2.6]);
    // bed side wall + magenta rail
    box(0.08, 0.38, 1.95, HULL, [s * 0.91, 1.19, -1.525]);
    glow(box(0.03, 0.02, 1.95, MAGENTA, [s * 0.91, 1.385, -1.525]), 1.3);
    // roll bar post
    b.rod([s * 0.85, 1.0, -2.35], [s * 0.85, 1.9, -2.35], 0.035, STEELP);
    // rear boosters
    cyl(0.15, 0.3, IRON, [s * 0.5, 0.82, -2.72], [0, 0, 1]);
    glow(
      b.part(new THREE.CircleGeometry(0.12, 8), AMBER, { at: [s * 0.5, 0.82, -2.875], dir: [0, 0, -1], axis: "z" }),
      2,
    );
    // fuel cans on skirts
    cyl(0.07, 0.3, "#5c6b3a", [s * 1.02, 0.97, -1.6], [0, 0, 1]);
  }

  // bumper, bull bar, grille
  box(1.96, 0.2, 0.12, STEEL, [0, 0.82, -2.55]);
  box(1.9, 0.22, 0.18, PLATING, [0, 0.78, 2.6]);
  box(1.9, 0.07, 0.07, STEELP, [0, 1.15, 2.58]);
  box(0.7, 0.3, 0.05, DARK, [0, 0.9, 2.55]);
  for (const y of [0.82, 0.9, 0.98]) glow(box(0.62, 0.025, 0.02, MAGENTA, [0, y, 2.585]), 1.4);
  box(1.4, 0.04, 0.3, DARK, [0, 0.69, 2.6]); // splitter
  b.part(new THREE.TorusGeometry(0.05, 0.012, 5, 8), STEELP, { at: [0, 0.62, 2.7], rotation: [0, 0, 0] }); // tow ring

  // hood scoop + emblem
  b.extrude(
    [
      [1.3, 1.29],
      [2.0, 1.24],
      [1.95, 1.34],
      [1.45, 1.42],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 0.5, bevel: 0.01, color: PLATING },
  );
  glow(
    b.part(new THREE.PlaneGeometry(0.28, 0.14), WHITE, {
      at: [0, 1.36, 2.0],
      dir: [0, 1, -0.45],
      axis: "z",
      up: [0, 0, 1],
      texture: VENT,
    }),
    0.8,
  );
  b.part(new THREE.PlaneGeometry(0.4, 0.4), WHITE, {
    at: [0, 1.31, 1.0 + 0.0],
    dir: [0, 1, 0.0857],
    axis: "z",
    up: [0, 0, 1],
    texture: EMBLEM,
  });

  // roof: light bar, dish
  box(1.3, 0.06, 0.22, DARK, [0, 1.995, 0.15]);
  for (const [x, c] of [[-0.42, MAGENTA], [-0.14, CYAN], [0.14, MAGENTA], [0.42, CYAN]] as const)
    glow(box(0.24, 0.07, 0.2, c, [x, 2.04, 0.15]), 1.5);
  b.rod([0.5, 1.95, -0.1], [0.5, 2.1, -0.1], 0.02, STEEL);
  b.lathe(
    [
      [0, 0.0],
      [0.17, 0.05],
      [0.17, 0.075],
      [0, 0.03],
    ],
    { at: [0.5, 2.12, -0.1], axis: [0, 1, 0.5], segments: 8, color: STEELP },
  );

  // ---------- tailgate, plate, bed ----------
  box(1.9, 0.38, 0.06, HULL, [0, 1.19, -2.47]);
  b.part(new THREE.PlaneGeometry(0.5, 0.25), WHITE, { at: [0, 1.12, -2.503], dir: [0, 0, -1], axis: "z", texture: PLATE });
  box(1.8, 0.012, 1.9, "#0c1014", [0, 1.006, -1.5]);
  // roll bar top
  b.rod([-0.85, 1.9, -2.35], [0.85, 1.9, -2.35], 0.035, STEELP);
  for (const x of [-0.5, 0, 0.5]) glow(box(0.2, 0.08, 0.06, WHITE, [x, 1.82, -2.35]), 1.6);

  // rocket pod
  const tilt = new THREE.Euler((-20 * Math.PI) / 180, 0, 0);
  const C = new THREE.Vector3(-0.45, 1.5, -1.25);
  const rot = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z).applyEuler(tilt);
  box(0.5, 0.25, 0.5, PLATING, [-0.45, 1.13, -1.35]);
  b.part(new THREE.BoxGeometry(0.7, 0.45, 1.0), POD, { at: C.toArray(), rotation: [-20, 0, 0] });
  glow(b.part(new THREE.BoxGeometry(0.72, 0.03, 0.6), MAGENTA, { at: C.clone().add(rot(0, 0.235, -0.1)).toArray(), rotation: [-20, 0, 0] }), 1.2);
  for (const ix of [-1, 0, 1])
    for (const iy of [-0.5, 0.5]) {
      const tipC = C.clone().add(rot(ix * 0.21, iy * 0.2, 0.52));
      const d = rot(0, 0, 1).toArray();
      b.part(new THREE.CylinderGeometry(0.08, 0.08, 0.06, 8), DARK, { at: tipC.toArray(), dir: d });
      glow(
        b.part(new THREE.ConeGeometry(0.055, 0.14, 6), "#ff4a1a", {
          at: C.clone().add(rot(ix * 0.21, iy * 0.2, 0.58)).toArray(),
          dir: d,
        }),
        1.3,
      );
    }

  // pintle gun
  cyl(0.06, 0.4, STEELP, [0.45, 1.2, -2.0], [0, 1, 0]);
  box(0.16, 0.2, 0.5, IRON, [0.45, 1.5, -1.95]);
  box(0.22, 0.16, 0.18, "#4b5a30", [0.65, 1.45, -1.95]); // ammo can
  b.rod([0.45, 1.52, -1.7], [0.45, 1.55, -0.95], 0.03, STEEL);
  b.rod([0.45, 1.52, -1.2], [0.45, 1.52, -1.2], 0.06, DARK);
  box(0.5, 0.36, 0.04, PLATING, [0.45, 1.5, -1.62]);
  glow(box(0.3, 0.02, 0.01, RED, [0.45, 1.6, -1.595]), 1.5);

  // crates and cans
  b.part(new THREE.BoxGeometry(0.55, 0.4, 0.5), WHITE, { at: [0.5, 1.2, -1.0], texture: CRATE });
  b.part(new THREE.BoxGeometry(0.4, 0.3, 0.4), WHITE, { at: [0.5, 1.55, -1.0], texture: CRATE, rotation: [0, 20, 0] });
  cyl(0.1, 0.34, "#6b7a3a", [-0.1, 1.17, -2.15], [0, 1, 0]);
  cyl(0.1, 0.34, "#6b7a3a", [-0.1, 1.17, -1.9], [0, 1, 0]);

  // ---------- hover pods ----------
  const podAt: [number, number][] = [
    [1.15, 1.55],
    [-1.15, 1.55],
    [1.15, -1.5],
    [-1.15, -1.5],
  ];
  for (const [px, pz] of podAt) {
    const s = Math.sign(px);
    // strut
    box(0.55, 0.14, 0.9, PLATING, [px * 0.85, 0.62, pz]);
    // pod housing
    b.lathe(
      [
        [0, 0.04],
        [0.42, 0.04],
        [0.48, 0.12],
        [0.48, 0.42],
        [0.3, 0.56],
        [0, 0.56],
      ],
      { at: [px, 0, pz], segments: 8, color: POD },
    );
    // rim neon ring (bottom) and mid band
    glow(
      b.part(new THREE.TorusGeometry(0.42, 0.03, 5, 12), CYAN, { at: [px, 0.035, pz], rotation: [90, 0, 0] }),
      1.6,
    );
    glow(
      b.part(new THREE.TorusGeometry(0.485, 0.022, 5, 12), MAGENTA, { at: [px, 0.3, pz], rotation: [90, 0, 0] }),
      1.4,
    );
    // fan disc
    glow(
      b.part(new THREE.CircleGeometry(0.38, 12), WHITE, { at: [px, 0.035, pz], dir: [0, -1, 0], axis: "z", texture: FAN }),
      1.4,
    );
    // top cap vents
    box(0.3, 0.05, 0.22, DARK, [px, 0.585, pz]);
    glow(box(0.22, 0.012, 0.03, AMBER, [px, 0.614, pz]), 1.2);
    // outer fin
    b.extrude(
      [
        [-0.2, 0.15],
        [0.2, 0.15],
        [0.1, 0.65],
        [-0.25, 0.58],
      ],
      { at: [px + s * 0.46, 0, pz], x: [0, 0, 1], thickness: 0.04, color: PLATING },
    );
    // intake pipe linking pod to cab-side
    b.rod([px, 0.52, pz], [s * 0.95, 0.82, pz * 0.9], 0.05, STEEL);
  }

  return b.root;
}
```