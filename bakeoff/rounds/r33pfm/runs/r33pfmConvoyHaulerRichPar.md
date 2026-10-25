<!-- call: plan -->

```json
{
  "name": "Convoy Hauler MK-IV 'Lockjaw'",
  "description": "A low-poly cyberpunk six-wheeled armoured convoy hauler with a hunched cab, roof gun turret and a sealed glowing cargo pod strapped to its flatbed.",
  "builderName": "convoyHauler",
  "size": [3.0, 3.2, 8.4],
  "layout": "Faces +Z. Front to back: a sloped armoured bull-bar and ram plate with twin headlamps at z 4.2, a chunky wedge cab (z 1.6 to 3.7) with a narrow neon-cyan visor slit window strip and roof turret ring, then a long low chassis flatbed (z -4.0 to 1.6) carrying a huge rounded-box sealed cargo pod (z -3.8 to 1.2) held by yellow-black hazard straps and clamps, with a glowing magenta seam and cyan status panel. Three axles (front z 2.9, mid z -0.6, rear z -2.9) with six chunky low-poly octagonal wheels resting on the floor, wheel radius 0.62. Fender arches over wheels, side skirts, exhaust stacks behind the cab. Style: faceted blocky hulls in dark gunmetal with yellow hazard trim, magenta and cyan neon glow strips, decals and SVG textures (warning chevrons, serial stencils, circuit lines, a skull-eye emblem), grime paints low on the body and light edge wear on top. All parts are flat-shaded chunky primitives.",
  "palette": {
    "hull": "#3a404e",
    "hullDark": "#20242e",
    "hullLight": "#5b6578",
    "trim": "#f0b90f",
    "trimBlack": "#14161c",
    "neonCyan": "#2ff3ff",
    "neonMagenta": "#ff2fa8",
    "glass": "#0e2a3a",
    "rubber": "#16171b",
    "rim": "#8a93a6",
    "podShell": "#d8dde6",
    "podDark": "#4a5262",
    "warnRed": "#e0302c",
    "steel": "#9aa3b2",
    "rust": "#6b4a36",
    "headlamp": "#fff4c2"
  },
  "mounts": {
    "chassisTop": [0, 1.3, 0],
    "cabFloor": [0, 1.3, 2.65],
    "cabRoof": [0, 2.55, 2.5],
    "turretRing": [0, 2.6, 2.1],
    "bullBarFront": [0, 0.9, 4.2],
    "podBase": [0, 1.3, -1.3],
    "axleFront": [0, 0.62, 2.9],
    "axleMid": [0, 0.62, -0.6],
    "axleRear": [0, 0.62, -2.9],
    "wheelTrackX": [1.35, 0.62, 0]
  },
  "joints": [
    { "name": "body", "at": [0, 1.0, 0], "dir": [0, 0, 1], "role": "spine" },
    { "name": "cab", "parent": "body", "at": [0, 1.3, 2.65], "dir": [0, 0, 1], "role": "spine" },
    { "name": "turretYaw", "parent": "cab", "at": [0, 2.6, 2.1], "dir": [0, 1, 0], "role": "hinge", "group": "turret" },
    { "name": "gunPitch", "parent": "turretYaw", "at": [0, 2.95, 2.3], "dir": [0, 0, 1], "role": "hinge", "group": "turret" },
    { "name": "pod", "parent": "body", "at": [0, 1.3, -1.3], "dir": [0, 0, 1], "role": "spine", "group": "cargo" },
    { "name": "podHatch", "parent": "pod", "at": [0, 2.75, -1.3], "dir": [0, 0, -1], "role": "hinge", "group": "cargo" },
    { "name": "wheelFL", "parent": "body", "at": [1.35, 0.62, 2.9], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelFR", "parent": "body", "at": [-1.35, 0.62, 2.9], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelML", "parent": "body", "at": [1.35, 0.62, -0.6], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelMR", "parent": "body", "at": [-1.35, 0.62, -0.6], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelRL", "parent": "body", "at": [1.35, 0.62, -2.9], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelRR", "parent": "body", "at": [-1.35, 0.62, -2.9], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" }
  ],
  "parts": [
    {
      "id": "chassis",
      "builds": "Ladder-frame chassis and flatbed: a long low faceted deck slab with side skirts, paneled hull plating (panelled paint on hull colour with hazard trim edges), underbody beams, fuel tanks and battery boxes slung between axles, axle housings and suspension arms (leaf springs, shock rods) at the three axle mounts, rear bumper with tow hooks and red tail-lights, side toolboxes, exhaust stacks behind the cab with glowing heat vents, neon magenta underglow strips, stencilled serial-number SVG decals and grime paint (darker towards the bottom, rust at the lower edges). Wheel fender arches over each wheel and mud flaps.",
      "box": [[-1.5, 0.4, -4.2], [1.5, 1.6, 1.6]],
      "attaches": "Top deck at chassisTop carries the pod (podBase) and meets the cab at cabFloor. Axle housings end at axleFront/axleMid/axleRear where wheels mount. Rides joint body.",
      "joints": ["body"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "cab",
      "builds": "Armoured wedge cab with sloped windshield, narrow neon-cyan visor-slit windows drawn as SVG glass with scan-line reflections, angular roof armour plates, side door panels with hazard chevron stripes and a skull-eye emblem decal, roof antennae and a sensor array, light bar with glowing amber/cyan lamps, mirrors, grille and ram bull-bar with plate steel and spikes at bullBarFront, twin headlamps (glow), front bumper hazard stripes, step rails and handles. Includes interior hint (seat headrests visible through glass).",
      "box": [[-1.5, 1.3, 1.6], [1.5, 2.6, 4.3]],
      "attaches": "Sits on chassis at cabFloor; roof meets the turret at turretRing and cabRoof. Rides joints cab (and body for the bull-bar).",
      "joints": ["cab", "body"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "turret",
      "builds": "Roof-mounted remote weapon station at turretRing: lathe ring base with bolts, rotating faceted armour housing on turretYaw, twin barrel autocannon with shrouds, muzzle brakes and ammo box with feed belt on gunPitch, a sensor eye dome with a glowing red lens, a small cyan status LED strip, hazard-striped armour plates, antenna whip. Paint with worn edges and scorch marks on the barrels.",
      "box": [[-0.8, 2.55, 1.2], [0.8, 3.2, 3.5]],
      "attaches": "Base ring sits on the cab roof at turretRing (0, 2.6, 2.1). Rides turretYaw and gunPitch.",
      "joints": ["turretYaw", "gunPitch"],
      "floor": false,
      "budget": 140
    },
    {
      "id": "cargoPod",
      "builds": "The sealed cargo pod: a big chunky rounded-faceted capsule or chamfered box (podShell with podDark ribs) on podBase, with ribbed panel lines, a glowing magenta seam and a cyan lock-status panel with SVG text (SEALED / BIO-HAZARD / serial), hazard-striped hatch on top (podHatch) with heavy bolts, four yellow-black cargo straps with ratchet buckles and clamps down to the deck, corner guard brackets, pressure valves, a glowing vent, warning labels (red triangle SVG) and chevron decals, slight dirt and scuff paint. Frame cradle rails under the pod rest on the chassis deck.",
      "box": [[-1.3, 1.3, -4.0], [1.3, 3.0, 1.3]],
      "attaches": "Cradle sits on the chassis deck at podBase / chassisTop; front stops just behind the cab at z 1.3. Rides joints pod and podHatch.",
      "joints": ["pod", "podHatch"],
      "floor": false,
      "budget": 170
    },
    {
      "id": "wheels",
      "builds": "Six chunky low-poly wheels (radius 0.62, width 0.55) at the axle mounts, x = ±1.35: octagonal rubber tyres with tread block ridges, steel rims with lug bolts, hub caps with a neon-cyan ring glow, brake discs and calipers behind the rims, mud and dust paint at the lower tyre, and an orange hazard-stripe on the inner rim. The left wheels face +X, the right wheels face -X. Each wheel rides its own hinge joint so it can spin.",
      "box": [[-1.65, 0, -3.55], [1.65, 1.25, 3.55]],
      "attaches": "Hubs centred on axleFront (z 2.9), axleMid (z -0.6) and axleRear (z -2.9) at wheelTrackX; the axle stubs from the chassis end at the hubs. Lowest points rest on y=0.",
      "joints": ["wheelFL", "wheelFR", "wheelML", "wheelMR", "wheelRL", "wheelRR"],
      "floor": true,
      "budget": 190
    }
  ]
}
```

<!-- call: wheels -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep, rgb } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

type Ctx = { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, number[]> };

export function buildWheels({ b, J, P, M }: Ctx) {
  const R = 0.62;
  const W = 0.55;
  const HUBY = M.axleFront[1];
  const TRACK = M.wheelTrackX[0];
  const ORANGE = "#ff7a1a";
  const CALIPER = "#c8322c";

  // Tyre paint: mud and dust low, grime dark, light wear
  const tyrePaint = paint((p, n) => {
    const base = rgb(P.rubber);
    const mud = rgb(P.rust);
    const dust = rgb("#6d6a60");
    const low = smoothstep(0.55, 0.0, p.y);
    const blot = noise(p, 0.18, 3);
    let c = mix(base, dust, 0.35 * low * smoothstep(0.3, 0.8, blot));
    c = mix(c, mud, 0.55 * smoothstep(0.35, 0.0, p.y) * smoothstep(0.25, 0.7, noise(p, 0.1, 9)));
    const wear = smoothstep(0.6, 1, n.y) * 0.12;
    return mix(c, rgb("#3a3b42"), wear);
  });

  const rimPaint = paint((p, n) => {
    const c = mix(rgb(P.rim), rgb(P.steel), noise(p, 0.12, 4));
    return mix(c, rgb("#4a4034"), 0.4 * smoothstep(0.4, 0, p.y) * noise(p, 0.08, 7));
  });

  // Hazard stripe texture for inner rim
  const hazard = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="31" fill="${ORANGE}"/>
    <g fill="#14161c">
      <path d="M0 10 L10 0 L24 0 L0 24Z"/><path d="M0 38 L38 0 L52 0 L0 52Z"/>
      <path d="M0 64 L64 0 L64 14 L14 64Z"/><path d="M28 64 L64 28 L64 42 L42 64Z"/>
      <path d="M56 64 L64 56 L64 64Z"/>
    </g>
    <circle cx="32" cy="32" r="12" fill="#8a93a6"/>
  </svg>`,
    { size: 128 },
  );

  const hubRing = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="28" fill="none" stroke="#2ff3ff" stroke-width="7"/>
    <circle cx="32" cy="32" r="14" fill="#0e2a3a" stroke="#2ff3ff" stroke-width="3"/>
    <path d="M32 22 L32 42 M22 32 L42 32" stroke="#2ff3ff" stroke-width="3"/>
  </svg>`,
    { size: 128 },
  );

  const wheels: [string, number, number][] = [
    ["wheelFL", 1, M.axleFront[2]],
    ["wheelFR", -1, M.axleFront[2]],
    ["wheelML", 1, M.axleMid[2]],
    ["wheelMR", -1, M.axleMid[2]],
    ["wheelRL", 1, M.axleRear[2]],
    ["wheelRR", -1, M.axleRear[2]],
  ];

  // Geometry builders (local axis along Y; rotated by dir)
  const cyl = (rt: number, rb: number, h: number, seg: number) => new THREE.CylinderGeometry(rt, rb, h, seg, 1);

  for (const [name, s, z] of wheels) {
    const bone = J[name];
    const hub = new THREE.Vector3(s * TRACK, HUBY, z);
    const dir: [number, number, number] = [s, 0, 0];
    const place = (off: number): [number, number, number] => [hub.x + s * off, hub.y, hub.z];
    const at = (geo: THREE.BufferGeometry, color: any, off: number, extra: any = {}) =>
      b.part(geo, color, { bone, at: place(off), dir, flat: true, ...extra });

    // Tyre: octagonal body (octagon circumscribed so flat sits on floor: rotate by 22.5deg)
    const rr = R / Math.cos(Math.PI / 8) * 0.99;
    at(cyl(rr, rr, W, 8), tyrePaint, 0, { name: `tyre.${name}`, rotation: undefined, quat: undefined });
    // Shoulders (chamfered rings) for chunkier look
    at(cyl(rr * 0.9, rr, 0.07, 8), tyrePaint, W / 2 - 0.035);
    at(cyl(rr, rr * 0.9, 0.07, 8), tyrePaint, -W / 2 + 0.035);

    // Tread blocks: 8 around, 2 rows
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
      const rad = R + 0.02;
      for (const row of [-0.14, 0.14]) {
        const geo = new THREE.BoxGeometry(0.2, 0.09, 0.2);
        const px = hub.x + s * row;
        const py = hub.y + Math.cos(a) * rad;
        const pz = hub.z + Math.sin(a) * rad;
        // box: local Y radial, X across width (axial = world X)
        const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -(Math.PI / 2 - a) + Math.PI / 2 - Math.PI / 2 + 0);
        // radial direction (0,cos,sin) = rotation about X by angle a from +Y
        const q2 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), a);
        b.part(geo, P.trimBlack, { bone, at: [px, py, pz], quat: q2, flat: true });
        void q;
      }
    }

    // Steel rim on outer face
    const outer = W / 2;
    at(cyl(R * 0.68, R * 0.68, 0.1, 8), rimPaint, outer - 0.02);
    at(cyl(R * 0.5, R * 0.62, 0.06, 8), P.hullDark, outer + 0.04);
    // Inner hazard stripe disc (faces inward)
    b.part(new THREE.CircleGeometry(R * 0.6, 8), "#ffffff", {
      bone,
      at: place(-outer - 0.005),
      dir: [-s, 0, 0],
      axis: "z",
      texture: hazard,
    });
    at(cyl(R * 0.62, R * 0.62, 0.06, 8), P.hullLight, -outer + 0.03);

    // Hub cap
    at(cyl(0.2, 0.26, 0.12, 8), P.rim, outer + 0.07);
    // Neon ring glow
    glow(
      b.part(new THREE.CircleGeometry(0.19, 8), "#ffffff", {
        bone,
        at: place(outer + 0.135),
        dir,
        axis: "z",
        texture: hubRing,
      }),
      1.6,
    );
    glow(at(cyl(0.05, 0.05, 0.05, 6), P.neonCyan, outer + 0.15), 1.5);

    // Lug bolts: 6 around hub
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const rad = 0.32;
      b.part(cyl(0.032, 0.032, 0.07, 6), P.steel, {
        bone,
        at: [hub.x + s * (outer + 0.06), hub.y + Math.cos(a) * rad, hub.z + Math.sin(a) * rad],
        dir,
        flat: true,
      });
    }
    // Spokes: 4 chunky ribs across rim face
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI;
      const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), a);
      b.part(new THREE.BoxGeometry(0.08, 0.72 * R * 1.5 * 0.5 * 2 * 0.7, 0.07), P.hullLight, {
        bone,
        at: place(outer + 0.03),
        quat: q,
        flat: true,
      });
    }

    // Brake disc behind rim (inboard of tyre inner face is chassis side)
    at(cyl(0.32, 0.32, 0.04, 10), P.steel, -outer + 0.1);
    // Caliper
    b.part(new THREE.BoxGeometry(0.1, 0.22, 0.16), CALIPER, {
      bone,
      at: [hub.x + s * (-outer + 0.1), hub.y + 0.1, hub.z + 0.3],
      flat: true,
    });
    b.part(new THREE.BoxGeometry(0.14, 0.08, 0.1), P.trimBlack, {
      bone,
      at: [hub.x + s * (-outer + 0.1), hub.y + 0.2, hub.z + 0.3],
      flat: true,
    });

    // Axle stub toward chassis
    const inner = -outer;
    b.part(cyl(0.13, 0.13, 0.5, 8), P.hullDark, {
      bone,
      at: [hub.x + s * (inner - 0.2), hub.y, hub.z],
      dir,
      flat: true,
    });
    b.part(cyl(0.17, 0.17, 0.08, 8), P.steel, {
      bone,
      at: [hub.x + s * (inner - 0.02), hub.y, hub.z],
      dir,
      flat: true,
    });
  }
}
```

<!-- call: turret -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep, rng, countershade } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

type Ctx = { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, number[]> };

export function buildTurret({ b, J, P, M }: Ctx) {
  const yaw = J.turretYaw;
  const pitch = J.gunPitch;
  const R = rng(11);

  // ---- paints ----
  const armour = paint((p, n) => {
    const top = smoothstep(0.3, 0.9, n.y);
    const base = mix(P.hullDark, P.hullLight, 0.35 + 0.4 * noise(p, 0.18, 3));
    const wear = smoothstep(0.62, 0.8, noise(p, 0.06, 9)) * (0.4 + top * 0.6);
    return mix(mix(base, P.hull, top * 0.4), P.steel, wear * 0.55);
  });
  const barrelPaint = paint((p, n) => {
    const scorch = smoothstep(0.35, 0.95, (p.z - 3.0) / 0.6);
    const streak = smoothstep(0.55, 0.8, noise(p, 0.05, 4));
    let c = mix(P.hullDark, P.steel, 0.25 + 0.2 * noise(p, 0.1, 2) + 0.2 * smoothstep(0.5, 1, n.y));
    c = mix(c, "#0a0a0c", Math.max(scorch * 0.8, streak * 0.35));
    return c;
  });
  const ringPaint = paint((p, n) => mix(P.hullDark, P.hull, 0.5 + 0.5 * noise(p, 0.05, 6) * smoothstep(0, 1, n.y)));

  const hazardTex = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="${P.trim}"/>` +
      Array.from({ length: 9 }, (_, i) => `<path d="M${i * 8 - 4} 16 L${i * 8 + 4} 0 L${i * 8 + 8} 0 L${i * 8} 16Z" fill="${P.trimBlack}"/>`).join("") +
      `</svg>`,
    { size: 128 },
  );
  const eyeTex = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#1a0505"/><circle cx="32" cy="32" r="22" fill="#e0302c"/><circle cx="32" cy="32" r="12" fill="#ff8a70"/><circle cx="32" cy="32" r="5" fill="#fff"/><circle cx="24" cy="24" r="3" fill="#fff" opacity=".8"/></svg>`,
    { size: 64 },
  );
  const ledTex = svg(
    `<svg viewBox="0 0 64 8"><rect width="64" height="8" fill="#062a30"/>` +
      Array.from({ length: 8 }, (_, i) => `<rect x="${i * 8 + 1}" y="1" width="6" height="6" fill="${i % 3 === 2 ? "#ffffff" : P.neonCyan}"/>`).join("") +
      `</svg>`,
    { size: 128 },
  );
  const skull = svg(
    `<svg viewBox="0 0 32 32"><path d="M16 3C8 3 5 9 5 14c0 4 2 6 4 7v5h14v-5c2-1 4-3 4-7C27 9 24 3 16 3Z" fill="#14161c"/><circle cx="11" cy="14" r="3.5" fill="${P.neonMagenta}"/><circle cx="21" cy="14" r="3.5" fill="${P.neonMagenta}"/><path d="M14 20h4l-2 3Z" fill="${P.neonMagenta}"/></svg>`,
    { size: 64 },
  );

  const [cx, cy, cz] = M.turretRing;

  // ---- ring base (fixed to cab roof, rides yaw joint's parent side via yaw) ----
  b.lathe(
    [[0, 0], [0.62, 0], [0.62, 0.05], [0.56, 0.1], [0.56, 0.16], [0.5, 0.16], [0.5, 0.05], [0, 0.05]],
    { at: [cx, cy - 0.02, cz], bone: J.cab, segments: 12, color: ringPaint },
  );
  b.lathe(
    [[0.46, 0], [0.58, 0], [0.58, 0.06], [0.52, 0.1], [0.46, 0.08]],
    { at: [cx, cy + 0.12, cz], bone: yaw, segments: 16, color: P.trimBlack },
  );
  // bolts
  const boltG = new THREE.CylinderGeometry(0.03, 0.03, 0.04, 6);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    b.part(boltG, P.steel, { bone: yaw, at: [cx + Math.sin(a) * 0.54, cy + 0.19, cz + Math.cos(a) * 0.54] });
  }

  // ---- armoured housing (faceted) ----
  const hy = cy + 0.38;
  b.part(new THREE.CylinderGeometry(0.5, 0.58, 0.3, 8), armour, { bone: yaw, at: [cx, hy, cz], flat: true });
  b.part(new THREE.BoxGeometry(0.9, 0.3, 0.7), armour, { bone: yaw, at: [cx, hy + 0.2, cz + 0.05], flat: true });
  // sloped front plate
  b.extrude([[-0.38, 0], [0.38, 0], [0.3, 0.26], [-0.3, 0.26]], {
    at: [cx, hy + 0.05, cz + 0.38], x: [1, 0, 0], y: [0, 0.5, 1], thickness: 0.07, bevel: 0.015, color: armour, bone: yaw,
  });
  // side cheek plates with hazard stripes
  for (const s of [1, -1]) {
    b.extrude([[-0.32, 0], [0.32, 0], [0.24, 0.3], [-0.24, 0.3]], {
      at: [cx + s * 0.5, hy - 0.08, cz], x: [0, 0, 1], y: [s * 0.15, 1, 0], thickness: 0.06, color: armour, bone: yaw,
    });
    b.part(new THREE.PlaneGeometry(0.5, 0.12), "#ffffff", {
      bone: yaw, at: [cx + s * 0.545, hy + 0.1, cz - 0.02], dir: [s, 0.1, 0], axis: "z", texture: hazardTex,
    });
    b.part(new THREE.PlaneGeometry(0.2, 0.2), "#ffffff", {
      bone: yaw, at: [cx + s * 0.55, hy + 0.0, cz - 0.15], dir: [s, 0, 0], axis: "z", texture: skull,
    });
    // side bolts
    for (const dz of [-0.2, 0.2]) b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.03, 6), P.steel, { bone: yaw, at: [cx + s * 0.54, hy - 0.1, cz + dz], dir: [s, 0, 0] });
  }
  // roof hazard plate
  b.part(new THREE.PlaneGeometry(0.5, 0.14), "#ffffff", {
    bone: yaw, at: [cx, hy + 0.355, cz - 0.1], dir: [0, 1, 0], axis: "z", texture: hazardTex, rotation: [0, 0, 0],
  });
  // rear bustle
  b.part(new THREE.BoxGeometry(0.8, 0.34, 0.25), P.hullDark, { bone: yaw, at: [cx, hy + 0.12, cz - 0.42], flat: true });
  for (let i = -2; i <= 2; i++) b.part(new THREE.BoxGeometry(0.06, 0.04, 0.05), P.trimBlack, { bone: yaw, at: [cx + i * 0.14, hy + 0.3, cz - 0.42] });
  // cyan LED strip on rear
  glow(b.part(new THREE.PlaneGeometry(0.5, 0.06), "#ffffff", { bone: yaw, at: [cx, hy + 0.14, cz - 0.551], dir: [0, 0, -1], axis: "z", texture: ledTex }), 1.4);

  // ---- sensor eye dome on left shoulder ----
  const ex = cx + 0.4, ey = hy + 0.48, ez = cz - 0.05;
  b.part(new THREE.CylinderGeometry(0.1, 0.12, 0.06, 8), P.trimBlack, { bone: yaw, at: [ex, ey - 0.02, ez] });
  b.part(new THREE.SphereGeometry(0.1, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), P.podDark, { bone: yaw, at: [ex, ey + 0.01, ez], flat: true });
  glow(b.part(new THREE.CircleGeometry(0.06, 10), "#ffffff", { bone: yaw, at: [ex, ey + 0.06, ez + 0.075], dir: [0, 0.35, 1], axis: "z", texture: eyeTex }), 1.8);
  // antenna whip
  const ax = cx - 0.38, az = cz - 0.35;
  b.part(new THREE.CylinderGeometry(0.03, 0.04, 0.08, 6), P.trimBlack, { bone: yaw, at: [ax, hy + 0.37, az] });
  b.rod([ax, hy + 0.4, az], [ax - 0.05, hy + 0.4 + 0.42, az - 0.1], [0.012, 0.004], { bone: yaw, color: P.steel, sides: 5 });
  b.part(new THREE.SphereGeometry(0.02, 5, 4), P.warnRed, { bone: yaw, at: [ax - 0.05, hy + 0.83, az - 0.1] });

  // ---- gun cradle on pitch joint ----
  const py = pitch.at.y, pz = pitch.at.z;
  // trunnion blocks
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.1, 0.34, 0.3), armour, { bone: yaw, at: [cx + s * 0.34, py - 0.02, pz - 0.08], flat: true });
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.14, 8), P.steel, { bone: pitch, at: [cx + s * 0.34, py, pz], dir: [s, 0, 0] });
  }
  // gun body mantlet
  b.part(new THREE.BoxGeometry(0.5, 0.26, 0.4), armour, { bone: pitch, at: [cx, py, pz + 0.12], flat: true });
  b.part(new THREE.BoxGeometry(0.4, 0.04, 0.36), P.trim, { bone: pitch, at: [cx, py + 0.15, pz + 0.12] });
  // barrels
  for (const s of [1, -1]) {
    const bx = cx + s * 0.13;
    b.rod([bx, py, pz + 0.2], [bx, py, 3.38], 0.045, { bone: pitch, color: barrelPaint, sides: 8 });
    // shroud
    b.rod([bx, py, pz + 0.25], [bx, py, pz + 0.75], 0.085, { bone: pitch, color: armour, section: { ngon: 8 } });
    b.part(new THREE.CylinderGeometry(0.095, 0.095, 0.03, 8), P.trim, { bone: pitch, at: [bx, py, pz + 0.55], dir: [0, 0, 1] });
    // cooling rings
    for (let k = 0; k < 3; k++) b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.025, 8), P.hullDark, { bone: pitch, at: [bx, py, pz + 0.9 + k * 0.18], dir: [0, 0, 1] });
    // muzzle brake
    b.rod([bx, py, 3.3], [bx, py, 3.5], [0.085, 0.07], { bone: pitch, color: P.trimBlack, section: { ngon: 6 } });
    for (const dz of [3.36, 3.44]) b.part(new THREE.BoxGeometry(0.15, 0.03, 0.03), P.hullDark, { bone: pitch, at: [bx, py, dz] });
    glow(b.part(new THREE.SphereGeometry(0.022, 5, 4), P.neonMagenta, { bone: pitch, at: [bx, py - 0.0, 3.5] }), 1.2);
  }
  b.part(new THREE.BoxGeometry(0.08, 0.2, 0.3), P.trimBlack, { bone: pitch, at: [cx, py, pz + 0.3] });

  // ---- ammo box + feed belt on the right side ----
  const ax2 = cx - 0.42;
  b.part(new THREE.BoxGeometry(0.2, 0.22, 0.36), P.rust, { bone: pitch, at: [ax2, py - 0.02, pz + 0.0], flat: true });
  b.part(new THREE.BoxGeometry(0.21, 0.04, 0.38), P.trim, { bone: pitch, at: [ax2, py + 0.1, pz] });
  b.part(new THREE.BoxGeometry(0.06, 0.1, 0.1), P.steel, { bone: pitch, at: [ax2, py + 0.18, pz] });
  const belt = [[ax2 + 0.05, py + 0.07, pz + 0.18], [ax2 + 0.12, py + 0.12, pz + 0.26], [cx - 0.2, py + 0.1, pz + 0.3]];
  b.sweep(belt, 0.025, { bone: pitch, color: P.steel, section: "box" });
  b.along(belt, 6, (at: any) => b.part(new THREE.BoxGeometry(0.02, 0.05, 0.035), P.trim, { frame: at, bone: pitch }));

  // top sight with glow lens
  b.part(new THREE.BoxGeometry(0.16, 0.12, 0.2), P.trimBlack, { bone: pitch, at: [cx, py + 0.2, pz + 0.12], flat: true });
  glow(b.part(new THREE.BoxGeometry(0.1, 0.05, 0.02), P.neonCyan, { bone: pitch, at: [cx, py + 0.21, pz + 0.23] }), 1.5);

  // status lights on front of housing
  for (let i = 0; i < 3; i++) glow(b.part(new THREE.BoxGeometry(0.04, 0.03, 0.02), i === 0 ? P.warnRed : P.neonCyan, { bone: yaw, at: [cx - 0.12 + i * 0.12, hy + 0.3, cz + 0.4] }), 1.5);

  // smoke-launcher tubes
  for (const s of [1, -1]) for (let i = 0; i < 2; i++) {
    b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.18, 6), P.hullDark, { bone: yaw, at: [cx + s * (0.58 + i * 0.0), hy + 0.12 + i * 0.09, cz + 0.2], rotation: [90 - 0, 0, 0] });
  }
  void R;
}
```

<!-- call: cargoPod -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep, rng } from "agentic-3js-builder";
import { panelled, metal } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildCargoPod({ b, J, P, M }: any) {
  const R = rng(11);
  const pod = J.pod;
  const hatchJ = J.podHatch;
  const CX = 0, CZ = -1.4; // pod centre in z
  const W = 2.3, L = 5.0, H = 1.45, BY = 1.6; // width, length, height, base y
  const midY = BY + H / 2;

  // ---------- paints ----------
  const shell = paint((p, n) => {
    const base: [number, number, number] = [0.85, 0.87, 0.9];
    const dirt = smoothstep(2.2, 1.6, p.y) * (0.35 + 0.4 * noise(p, 0.3, 4));
    const scuff = smoothstep(0.62, 0.8, noise(p, 0.12, 9)) * 0.25;
    const top = smoothstep(0.3, 0.9, n.y) * 0.08;
    let c = mix(base, "#4a3a2c", dirt * 0.7);
    c = mix(c, "#4a5262", scuff);
    return [Math.min(c[0] + top, 1), Math.min(c[1] + top, 1), Math.min(c[2] + top, 1)];
  });
  const cradlePaint = panelled(metal("iron"), { size: 0.4, rivets: 0.08 });

  // ---------- textures ----------
  const hazard = svg(
    `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#f0b90f"/>
    ${[-64, -32, 0, 32, 64].map((x) => `<polygon points="${x},64 ${x + 16},64 ${x + 80},0 ${x + 64},0" fill="#14161c"/>`).join("")}</svg>`,
    { size: 128 },
  );
  const panelTex = svg(
    `<svg viewBox="0 0 120 80"><rect width="120" height="80" rx="6" fill="#06151c" stroke="#2ff3ff" stroke-width="3"/>
    <text x="60" y="30" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="20" fill="#2ff3ff">SEALED</text>
    <path d="M10 42H50V52H90V42H110" stroke="#2ff3ff" stroke-width="2" fill="none"/>
    <circle cx="50" cy="52" r="3" fill="#ff2fa8"/><circle cx="90" cy="52" r="3" fill="#2ff3ff"/>
    <text x="60" y="72" text-anchor="middle" font-family="monospace" font-size="11" fill="#2ff3ff">LK-77-0413-X</text></svg>`,
    { size: 256 },
  );
  const warn = svg(
    `<svg viewBox="0 0 100 100"><polygon points="50,6 96,90 4,90" fill="#e0302c" stroke="#14161c" stroke-width="6" stroke-linejoin="round"/>
    <circle cx="50" cy="52" r="9" fill="#fff"/><path d="M50 38a14 14 0 0 1 12 22M50 38a14 14 0 0 0-12 22M42 60h16" stroke="#14161c" stroke-width="4" fill="none"/>
    <circle cx="50" cy="52" r="4" fill="#14161c"/></svg>`,
    { size: 192 },
  );
  const bioText = svg(
    `<svg viewBox="0 0 200 50"><text x="100" y="22" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="22" fill="#14161c">BIO-HAZARD</text>
    <text x="100" y="44" text-anchor="middle" font-family="monospace" font-size="14" fill="#e0302c">CLASS 4 // NO OPEN</text></svg>`,
    { size: 256 },
  );
  const chevron = svg(
    `<svg viewBox="0 0 80 40"><path d="M5 5L30 20L5 35M30 5L55 20L30 35M55 5L80 20L55 35" stroke="#f0b90f" stroke-width="7" fill="none" stroke-linejoin="miter"/></svg>`,
    { size: 192 },
  );

  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const tex = (g: THREE.BufferGeometry, t: THREE.Texture, at: number[], dir: number[], bone = pod, up?: number[]) =>
    b.part(g, "#ffffff", { bone, at, dir, axis: "z", up, texture: t });

  // ---------- pod shell: chamfered body from lathe-less extrude (octagonal profile in XY, along Z) ----------
  const hw = W / 2, ch = 0.4;
  const profile: [number, number][] = [
    [-hw + ch, BY], [hw - ch, BY], [hw, BY + ch], [hw, BY + H - ch],
    [hw - ch, BY + H], [-hw + ch, BY + H], [-hw, BY + H - ch], [-hw, BY + ch],
  ];
  b.extrude(profile, { at: [0, 0, CZ - L / 2], x: [1, 0, 0], y: [0, 1, 0], thickness: L, color: shell, bone: pod, smoothing: 0 });
  // The extrude thickness runs along x*y = +Z, centred; fix by it being centred at CZ
  // chamfered end caps (nose and tail blocks)
  for (const z of [1, -1]) {
    b.part(box(W - 0.9, H - 0.3, 0.3), P.podDark, { bone: pod, at: [0, midY, CZ + z * (L / 2 + 0.08)] });
    b.part(box(W - 1.3, H - 0.7, 0.2), P.hullLight, { bone: pod, at: [0, midY, CZ + z * (L / 2 + 0.28)] });
  }

  // ---------- cradle rails ----------
  for (const s of [1, -1]) {
    b.part(box(0.22, 0.2, L + 0.2), cradlePaint, { bone: pod, at: [s * 0.8, 1.42, CZ] });
    b.part(box(0.18, 0.12, L + 0.2), P.trim, { bone: pod, at: [s * 1.06, 1.38, CZ] });
  }
  for (let i = 0; i < 5; i++) {
    const z = CZ - L / 2 + 0.3 + (i * (L - 0.6)) / 4;
    b.part(box(W - 0.2, 0.14, 0.2), cradlePaint, { bone: pod, at: [0, 1.5, z] });
  }

  // ---------- ribs (podDark) around body ----------
  const ribZ: number[] = [];
  for (let i = 0; i < 7; i++) ribZ.push(CZ - L / 2 + 0.45 + (i * (L - 0.9)) / 6);
  for (const z of ribZ) {
    b.part(box(W + 0.08, 0.1, 0.12), P.podDark, { bone: pod, at: [0, BY + H + 0.0, z] });
    for (const s of [1, -1]) b.part(box(0.1, H - 0.5, 0.12), P.podDark, { bone: pod, at: [s * (hw + 0.03), midY, z] });
  }

  // ---------- magenta seam ----------
  for (const s of [1, -1]) {
    glow(b.part(box(0.06, 0.07, L - 0.5), P.neonMagenta, { bone: pod, at: [s * (hw + 0.04), midY + 0.05, CZ] }), 1.6);
  }
  glow(b.part(box(W - 0.6, 0.06, 0.06), P.neonMagenta, { bone: pod, at: [0, midY + 0.05, CZ + L / 2 + 0.22] }), 1.6);

  // ---------- hazard straps ----------
  const strapZ = [CZ + 1.7, CZ + 0.55, CZ - 0.6, CZ - 1.75];
  for (const z of strapZ) {
    // top
    b.part(new THREE.BoxGeometry(W + 0.12, 0.05, 0.3), P.trim, { bone: pod, at: [0, BY + H + 0.06, z], texture: hazard });
    for (const s of [1, -1]) {
      b.part(new THREE.BoxGeometry(0.05, H + 0.1, 0.3), P.trim, { bone: pod, at: [s * (hw + 0.07), midY, z], texture: hazard });
      // clamp to deck
      b.part(box(0.28, 0.16, 0.4), P.trimBlack, { bone: pod, at: [s * (hw + 0.1), 1.5, z] });
      b.part(box(0.1, 0.1, 0.3), P.steel, { bone: pod, at: [s * (hw + 0.2), 1.45, z] });
      // ratchet buckle
      b.part(box(0.14, 0.26, 0.34), P.steel, { bone: pod, at: [s * (hw + 0.13), midY - 0.15, z] });
      b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.38, 6), P.hullDark, { bone: pod, at: [s * (hw + 0.2), midY - 0.15, z], dir: [0, 0, 1] });
      b.part(box(0.04, 0.2, 0.05), P.trimBlack, { bone: pod, at: [s * (hw + 0.24), midY - 0.02, z + 0.1] });
    }
  }

  // ---------- corner guard brackets ----------
  for (const sx of [1, -1])
    for (const sz of [1, -1])
      for (const sy of [0, 1]) {
        const y = sy ? BY + H : BY;
        const x = sx * hw, z = CZ + sz * (L / 2);
        b.part(box(0.3, 0.1, 0.3), P.hullDark, { bone: pod, at: [x - sx * 0.08, y + (sy ? 0.03 : -0.03), z - sz * 0.08] });
        b.part(box(0.1, 0.3, 0.3), P.steel, { bone: pod, at: [x + sx * 0.01, y + (sy ? -0.12 : 0.12), z - sz * 0.08] });
        b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.05, 6), P.rim, { bone: pod, at: [x + sx * 0.07, y + (sy ? -0.12 : 0.12), z - sz * 0.08], dir: [sx, 0, 0] });
      }

  // ---------- hatch on top (rides podHatch) ----------
  const hz = CZ - 1.0, hy = BY + H;
  b.part(new THREE.BoxGeometry(1.2, 0.1, 1.3), P.trim, { bone: hatchJ, at: [0, hy + 0.1, hz], texture: hazard });
  b.part(box(0.9, 0.08, 1.0), P.podDark, { bone: hatchJ, at: [0, hy + 0.17, hz] });
  b.part(box(0.5, 0.06, 0.5), P.hullLight, { bone: hatchJ, at: [0, hy + 0.23, hz] });
  b.part(box(0.1, 0.14, 0.5), P.steel, { bone: hatchJ, at: [0, hy + 0.3, hz] });
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.08, 6), P.steel, { bone: hatchJ, at: [sx * 0.52, hy + 0.17, hz + sz * 0.57] });
      b.part(box(0.1, 0.1, 0.16), P.hullDark, { bone: hatchJ, at: [sx * 0.64, hy + 0.08, hz + sz * 0.3] });
    }

  // ---------- status panel + labels (left side, +X) ----------
  const sideX = hw + 0.015;
  glow(tex(new THREE.PlaneGeometry(0.95, 0.63), panelTex, [sideX + 0.02, midY + 0.18, CZ + 0.55 - 0.0], [1, 0, 0]), 1.2);
  b.part(box(0.04, 0.72, 1.04), P.trimBlack, { bone: pod, at: [sideX - 0.01, midY + 0.18, CZ + 0.55] });
  tex(new THREE.PlaneGeometry(0.5, 0.5), warn, [sideX + 0.01, midY - 0.02, CZ - 0.8], [1, 0, 0]);
  tex(new THREE.PlaneGeometry(1.0, 0.25), bioText, [sideX + 0.01, midY - 0.32, CZ - 0.8], [1, 0, 0]);
  tex(new THREE.PlaneGeometry(0.8, 0.4), chevron, [sideX + 0.01, midY - 0.4, CZ + 0.55], [1, 0, 0]);
  tex(new THREE.PlaneGeometry(0.8, 0.4), chevron, [sideX + 0.01, midY - 0.4, CZ - 1.9], [1, 0, 0]);
  // right side
  tex(new THREE.PlaneGeometry(0.5, 0.5), warn, [-sideX - 0.01, midY, CZ + 0.4], [-1, 0, 0]);
  tex(new THREE.PlaneGeometry(1.0, 0.25), bioText, [-sideX - 0.01, midY - 0.35, CZ + 0.4], [-1, 0, 0]);
  tex(new THREE.PlaneGeometry(0.8, 0.4), chevron, [-sideX - 0.01, midY + 0.3, CZ - 1.0], [-1, 0, 0]);
  // front face warning
  tex(new THREE.PlaneGeometry(0.6, 0.6), warn, [0, midY, CZ + L / 2 + 0.4], [0, 0, 1]);

  // ---------- pressure valves and vent ----------
  for (const sx of [1, -1]) {
    const x = sx * 0.55, z = CZ - 2.05, y = BY + H;
    b.part(new THREE.CylinderGeometry(0.1, 0.12, 0.2, 8), P.steel, { bone: pod, at: [x, y + 0.08, z] });
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.18, 6), P.hullDark, { bone: pod, at: [x, y + 0.26, z] });
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.04, 8), P.warnRed, { bone: pod, at: [x, y + 0.37, z] });
  }
  b.part(box(0.6, 0.3, 0.1), P.hullDark, { bone: pod, at: [0, midY + 0.1, CZ - L / 2 - 0.34] });
  for (let i = 0; i < 4; i++)
    glow(b.part(box(0.5, 0.035, 0.04), P.neonMagenta, { bone: pod, at: [0, midY - 0.01 + i * 0.07, CZ - L / 2 - 0.4] }), 1.8);
  // pipes
  for (const sx of [1, -1]) {
    b.rod([sx * 0.9, midY - 0.4, CZ - L / 2 - 0.2], [sx * 0.9, midY + 0.4, CZ - L / 2 - 0.2], 0.04, P.steel, { bone: pod });
  }
  // lock status leds
  for (let i = 0; i < 3; i++)
    glow(b.part(box(0.06, 0.06, 0.06), [P.neonCyan, P.neonMagenta, P.warnRed][i], { bone: pod, at: [sideX + 0.04, midY - 0.25 + 0, CZ + 0.3 + i * 0.15] }), 1.5);

  // scuff patches
  for (let i = 0; i < 8; i++) {
    const s = R() > 0.5 ? 1 : -1;
    b.part(box(0.02, 0.1 + R() * 0.15, 0.2 + R() * 0.3), P.rust, { bone: pod, at: [s * (hw + 0.005), BY + 0.2 + R() * 0.3, CZ - 2.2 + R() * 4.4] });
  }
}
```

<!-- call: chassis -->

```ts
import * as THREE from "three";
import { paint, svg, mix, noise, smoothstep, stripes, countershade, rng } from "agentic-3js-builder";
import { panelled } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export function buildChassis({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const R = rng(11);
  const RUST = "#6b4a36";

  // ---- helpers ----
  const box = (sx: number, sy: number, sz: number, at: [number, number, number], color: any, o: any = {}) =>
    b.part(new THREE.BoxGeometry(sx, sy, sz), color, { bone, at, flat: true, ...o });
  const cylZ = (r: number, len: number, at: [number, number, number], color: any, seg = 8, o: any = {}) =>
    b.part(new THREE.CylinderGeometry(r, r, len, seg), color, { bone, at, rotation: [90, 0, 0], flat: true, ...o });
  const cylX = (r: number, len: number, at: [number, number, number], color: any, seg = 8, o: any = {}) =>
    b.part(new THREE.CylinderGeometry(r, r, len, seg), color, { bone, at, rotation: [0, 0, 90], flat: true, ...o });
  const decal = (w: number, h: number, at: [number, number, number], dir: [number, number, number], tex: any) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone, at, dir, axis: "z", texture: tex });

  // ---- paints ----
  const HULL = panelled(P.hull, { size: 0.5, aspect: 0.6, rivets: 0.1 });
  const GRIME = paint((p, n) => {
    const base = mix(P.hull, P.hullLight, smoothstep(0.7, 1.4, p.y) * 0.5);
    const dirt = smoothstep(1.15, 0.65, p.y + (noise(p, 0.25, 4) - 0.5) * 0.3);
    let c = mix(base, P.hullDark, dirt * 0.8);
    const rustAmt = smoothstep(0.58, 0.82, noise(p, 0.18, 8)) * smoothstep(1.0, 0.6, p.y);
    c = mix(c, RUST, rustAmt * 0.75);
    return mix(c, "#5b6578", smoothstep(0.7, 1, n.y) * 0.25);
  });
  const HAZARD = stripes(P.trim, P.trimBlack, { size: 0.16, axis: "z", width: 0.5, wobble: 0, seed: 2 });
  const HAZARDX = stripes(P.trim, P.trimBlack, { size: 0.16, axis: "x", width: 0.5, wobble: 0, seed: 3 });
  const METAL = countershade(P.steel, P.hullDark, { level: -0.2 });
  const TANK = paint((p, n) => mix(mix(P.podDark, P.hullDark, smoothstep(0.9, 0.5, p.y)), RUST, smoothstep(0.6, 0.8, noise(p, 0.15, 3)) * 0.5));

  // ---- textures ----
  const SERIAL = svg(
    `<svg viewBox="0 0 200 32" xmlns="http://www.w3.org/2000/svg">
    <text x="4" y="22" font-family="monospace" font-weight="bold" font-size="20" fill="#e8e2c8" opacity="0.85">LJ-MK4 // 0447-C</text>
    <rect x="150" y="6" width="44" height="3" fill="#f0b90f"/><rect x="150" y="13" width="30" height="3" fill="#f0b90f"/>
    <rect x="1" y="1" width="198" height="30" fill="none" stroke="#e8e2c8" stroke-width="1.5" opacity="0.5"/></svg>`,
    { size: 512 },
  );
  const CHEV = svg(
    `<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="40" fill="#14161c"/>
    ${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M${i * 22} 0 L${i * 22 + 12} 0 L${i * 22 + 32} 20 L${i * 22 + 12} 40 L${i * 22} 40 L${i * 22 + 20} 20Z" fill="#f0b90f"/>`).join("")}</svg>`,
    { size: 256 },
  );
  const CIRCUIT = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" fill="#0b1a22"/>
    <path d="M4 10 H24 V30 H44 V10 H60 M4 50 H20 V38 M30 60 V44 H56 M44 30 V50" stroke="#2ff3ff" stroke-width="2.5" fill="none"/>
    <circle cx="24" cy="30" r="3.5" fill="#2ff3ff"/><circle cx="44" cy="10" r="3.5" fill="#ff2fa8"/><circle cx="20" cy="38" r="3.5" fill="#2ff3ff"/></svg>`,
    { size: 256 },
  );
  const WARN = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" rx="6" fill="#14161c"/>
    <path d="M32 8 L58 54 H6Z" fill="#f0b90f" stroke="#14161c" stroke-width="3"/><rect x="29" y="22" width="6" height="18" fill="#14161c"/><rect x="29" y="44" width="6" height="6" fill="#14161c"/></svg>`,
    { size: 128 },
  );

  // ---- deck & frame ----
  box(2.1, 0.22, 5.8, [0, 1.19, -1.3], HULL);
  // deck edge trim
  for (const s of [1, -1]) {
    box(0.12, 0.06, 5.8, [s * 1.0, 1.33, -1.3], HAZARD);
    box(0.1, 0.06, 5.7, [s * 1.0, 1.0, -1.3], P.trimBlack, { name: "deckLip" });
  }
  // front crossmember / hitch
  box(2.2, 0.35, 0.18, [0, 1.1, 1.52], GRIME);
  box(0.5, 0.2, 0.2, [0, 0.9, 1.5], P.steel);
  // skirts
  for (const s of [1, -1]) {
    box(0.1, 0.5, 5.6, [s * 1.1, 0.95, -1.3], GRIME);
    box(0.14, 0.05, 5.6, [s * 1.1, 1.2, -1.3], HAZARD);
    glow(box(0.06, 0.05, 5.4, [s * 1.06, 0.66, -1.3], P.neonMagenta), 1.6);
    decal(1.6, 0.25, [s * 1.162, 0.97, -1.7], [s, 0, 0], SERIAL);
    decal(0.28, 0.28, [s * 1.162, 1.0, 0.7], [s, 0, 0], WARN);
  }
  // underbody beams
  for (const s of [1, -1]) box(0.16, 0.22, 5.8, [s * 0.55, 0.8, -1.3], P.hullDark);
  for (const z of [1.2, 0.3, -1.75, -3.7]) box(1.4, 0.14, 0.16, [0, 0.74, z], P.hullDark);
  for (const z of [-0.2, -1.4, -2.3, -3.4]) box(1.1, 0.1, 0.1, [0, 0.9, z], P.hullLight);

  // ---- fuel tanks, batteries, toolboxes ----
  for (const s of [1, -1]) {
    cylZ(0.3, 1.05, [s * 0.78, 0.74, -1.75], TANK, 8, { name: "fuelTank" });
    for (const dz of [-0.3, 0.3]) cylZ(0.315, 0.06, [s * 0.78, 0.74, -1.75 + dz], P.steel, 8, { name: "tankStrap" });
    for (const dz of [-0.5, 0.5]) cylZ(0.28, 0.06, [s * 0.78, 0.74, -1.75 + dz], P.trimBlack, 6);
    box(0.7, 0.34, 0.85, [s * 0.75, 0.82, 1.0], P.hullDark, { name: "battery" });
    box(0.66, 0.02, 0.8, [s * 0.75, 1.0, 1.0], "#ffffff", { texture: CIRCUIT, name: "batteryTop" });
    for (const dx of [-0.2, 0.2]) cylZ(0.04, 0.06, [s * (0.75 + dx), 1.04, 1.3], P.warnRed, 6, { rotation: [0, 0, 0] });
    // toolbox
    box(0.24, 0.42, 0.75, [s * 1.2, 0.98, -1.85], P.hullLight, { name: "toolbox" });
    box(0.26, 0.05, 0.77, [s * 1.2, 1.2, -1.85], HAZARD);
    box(0.04, 0.1, 0.16, [s * 1.33, 1.0, -1.85], P.steel, { name: "latch" });
  }

  // ---- axles, suspension ----
  for (const z of [M.axleFront[2], M.axleMid[2], M.axleRear[2]]) {
    cylX(0.1, 2.5, [0, 0.62, z], METAL, 8, { name: "axle" });
    b.part(new THREE.SphereGeometry(0.28, 8, 6), P.hullDark, { bone, at: [0, 0.62, z], flat: true, name: "diff" });
    box(0.3, 0.18, 0.3, [0, 0.62, z + 0.28], P.steel, { name: "diffCover" });
    for (const s of [1, -1]) {
      // leaf springs
      for (let i = 0; i < 3; i++) box(0.1, 0.035, 1.1 - i * 0.22, [s * 0.88, 0.76 + i * 0.04, z], P.rust ?? RUST, { name: "leaf" });
      box(0.16, 0.12, 0.2, [s * 0.88, 0.7, z], P.steel);
      // shock rods
      b.rod([s * 0.9, 0.64, z + 0.32], [s * 0.82, 1.08, z + 0.2], 0.03, P.steel, { bone });
      b.rod([s * 0.9, 0.62, z + 0.32], [s * 0.9, 0.7, z + 0.32], 0.045, P.warnRed, { bone });
      // axle stub housing toward wheel hub
      cylX(0.14, 0.3, [s * 1.2, 0.62, z], P.hullDark, 8, { name: "hubHousing" });
    }
  }

  // ---- fender arches & mud flaps ----
  for (const s of [1, -1]) {
    for (const z of [M.axleFront[2], M.axleMid[2], M.axleRear[2]]) {
      const fx = s * 1.34;
      box(0.66, 0.08, 1.0, [fx, 1.34, z], HULL, { name: "fender" });
      box(0.66, 0.08, 0.55, [fx, 1.2, z + 0.7], HULL, { rotation: [-38, 0, 0], name: "fenderFront" });
      box(0.66, 0.08, 0.55, [fx, 1.2, z - 0.7], HULL, { rotation: [38, 0, 0], name: "fenderRear" });
      box(0.7, 0.04, 1.0, [fx, 1.39, z], HAZARD, { name: "fenderTrim" });
      box(0.05, 0.22, 1.0, [s * 1.66, 1.25, z], P.hullDark, { name: "fenderLip" });
      // mud flap
      box(0.6, 0.5, 0.04, [fx, 0.78, z - 0.78], P.rubber, { name: "mudflap" });
      box(0.6, 0.07, 0.05, [fx, 0.53, z - 0.78], P.trim, { name: "flapEdge" });
    }
  }

  // ---- rear bumper ----
  box(2.7, 0.42, 0.28, [0, 0.82, -4.05], METAL, { name: "bumper" });
  decal(2.0, 0.3, [0, 0.82, -4.2], [0, 0, -1], CHEV);
  box(2.6, 0.06, 0.3, [0, 1.06, -4.05], P.trimBlack);
  for (const s of [1, -1]) {
    glow(box(0.32, 0.2, 0.06, [s * 1.1, 1.18, -4.14], P.warnRed), 1.8);
    glow(box(0.14, 0.12, 0.06, [s * 0.75, 1.18, -4.14], P.neonMagenta), 1.2);
    // tow hooks
    b.part(new THREE.TorusGeometry(0.1, 0.03, 5, 8), P.steel, { bone, at: [s * 0.5, 0.7, -4.25], flat: true, name: "towHook" });
    box(0.12, 0.12, 0.14, [s * 0.5, 0.78, -4.17], P.steel);
  }
  box(0.5, 0.25, 0.1, [0, 1.3, -4.1], "#ffffff", { texture: WARN, name: "rearWarn" });

  // ---- exhaust stacks behind cab ----
  for (const s of [1, -1]) {
    const x = s * 1.2;
    cylZ(0.09, 1.2, [x, 1.9, 1.42], P.steel, 8, { rotation: [0, 0, 0], name: "exhaust" });
    for (const y of [1.45, 2.2]) b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 8), P.trimBlack, { bone, at: [x, y, 1.42], flat: true, name: "stackBand" });
    glow(b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.18, 8), P.neonMagenta, { bone, at: [x, 1.8, 1.42], flat: true, name: "heatVent" }), 1.5);
    b.part(new THREE.ConeGeometry(0.13, 0.16, 8), P.hullDark, { bone, at: [x, 2.58, 1.42], flat: true, name: "stackCap" });
    box(0.12, 0.45, 0.08, [x, 1.55, 1.34], P.hullLight, { name: "stackBracket" });
  }

  // ---- bolts along deck edge (merged) ----
  const bolts: THREE.BufferGeometry[] = [];
  for (const s of [1, -1])
    for (let i = 0; i < 12; i++) {
      const g = new THREE.CylinderGeometry(0.035, 0.035, 0.03, 6);
      g.translate(s * 0.88, 1.31, -3.9 + i * 0.45 + (R() - 0.5) * 0.02);
      bolts.push(g);
    }
  const merged = mergeGeometries(bolts);
  if (merged) b.part(merged, P.steel, { bone, at: [0, 0, 0], flat: true, name: "deckBolts" });

  // ---- tie-down anchors ----
  for (const s of [1, -1])
    for (const z of [-3.4, -2.0, -0.6, 0.8]) {
      box(0.16, 0.05, 0.16, [s * 0.95, 1.33, z], P.trimBlack, { name: "anchor" });
      b.part(new THREE.TorusGeometry(0.05, 0.015, 4, 8), P.steel, { bone, at: [s * 0.95, 1.38, z], rotation: [0, 90, 0], flat: true, name: "anchorRing" });
    }
}
```

<!-- call: cab -->

```ts
import * as THREE from "three";
import { paint, svg, mix } from "agentic-3js-builder";
import { panelled } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildCab({ b, J, P }: Ctx) {
  const AMBER = "#ffb02e";
  const DARKRED = "#7a0f14";
  const cab = J.cab;
  const body = J.body;

  // ---------- helpers ----------
  const box = (sz: number[], col: any, at: number[], bone: any = cab, extra: any = {}) =>
    b.part(new THREE.BoxGeometry(sz[0], sz[1], sz[2]), col, { bone, at, flat: true, ...extra });
  const decal = (tex: any, w: number, h: number, at: number[], dir: number[], bone: any = cab) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone, at, dir, axis: "z", texture: tex });

  // ---------- textures ----------
  const glassTex = svg(
    `<svg viewBox="0 0 220 40" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14465c"/><stop offset="1" stop-color="#071a26"/></linearGradient></defs>
      <rect width="220" height="40" fill="url(#g)"/>
      <rect x="52" y="16" width="30" height="24" rx="8" fill="#1f5f7c"/>
      <rect x="138" y="16" width="30" height="24" rx="8" fill="#1f5f7c"/>
      <rect x="60" y="30" width="14" height="10" fill="#0c2e40"/><rect x="146" y="30" width="14" height="10" fill="#0c2e40"/>
      ${Array.from({ length: 8 }, (_, i) => `<line x1="0" y1="${4 + i * 5}" x2="220" y2="${4 + i * 5}" stroke="#2ff3ff" stroke-opacity="0.35" stroke-width="1.5"/>`).join("")}
      <polygon points="30,0 62,0 38,40 6,40" fill="#ffffff" fill-opacity="0.22"/>
      <polygon points="150,0 164,0 140,40 126,40" fill="#ffffff" fill-opacity="0.15"/>
      <rect x="0" y="0" width="220" height="2.5" fill="#2ff3ff"/><rect x="0" y="37.5" width="220" height="2.5" fill="#2ff3ff" fill-opacity="0.6"/>
    </svg>`,
    { size: 512 },
  );
  const sideTex = svg(
    `<svg viewBox="0 0 90 30" xmlns="http://www.w3.org/2000/svg">
      <rect width="90" height="30" fill="#0a2230"/>
      <rect x="30" y="10" width="24" height="20" rx="7" fill="#1f5f7c"/>
      ${Array.from({ length: 5 }, (_, i) => `<line x1="0" y1="${3 + i * 6}" x2="90" y2="${3 + i * 6}" stroke="#2ff3ff" stroke-opacity="0.35" stroke-width="1.2"/>`).join("")}
      <polygon points="8,0 24,0 10,30 0,30" fill="#ffffff" fill-opacity="0.2"/>
      <rect width="90" height="2" fill="#2ff3ff"/>
    </svg>`,
    { size: 256 },
  );
  const chevTex = svg(
    `<svg viewBox="0 0 160 16" xmlns="http://www.w3.org/2000/svg">
      <rect width="160" height="16" fill="#f0b90f"/>
      ${Array.from({ length: 10 }, (_, i) => `<polygon points="${i * 16 + 2},0 ${i * 16 + 9},0 ${i * 16 + 17},8 ${i * 16 + 9},16 ${i * 16 + 2},16 ${i * 16 + 10},8" fill="#14161c"/>`).join("")}
      <rect width="160" height="1.2" fill="#14161c"/><rect y="14.8" width="160" height="1.2" fill="#14161c"/>
    </svg>`,
    { size: 512 },
  );
  const skullTex = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="47" fill="#14161c" stroke="#f0b90f" stroke-width="5"/>
      <path d="M50 14 C28 14 20 30 22 46 C23 56 30 58 32 64 L32 74 L68 74 L68 64 C70 58 77 56 78 46 C80 30 72 14 50 14Z" fill="#d8dde6"/>
      <ellipse cx="37" cy="46" rx="9" ry="10" fill="#14161c"/><ellipse cx="63" cy="46" rx="9" ry="10" fill="#14161c"/>
      <circle cx="37" cy="46" r="4.5" fill="#ff2fa8"/><circle cx="63" cy="46" r="4.5" fill="#2ff3ff"/>
      <polygon points="50,55 45,66 55,66" fill="#14161c"/>
      <path d="M38 74 V66 M44 74 V68 M50 74 V68 M56 74 V68 M62 74 V66" stroke="#14161c" stroke-width="2.5"/>
      <path d="M20 84 L80 84" stroke="#e0302c" stroke-width="3"/>
    </svg>`,
    { size: 256 },
  );
  const serialTex = svg(
    `<svg viewBox="0 0 120 24" xmlns="http://www.w3.org/2000/svg">
      <text x="2" y="14" font-family="monospace" font-weight="bold" font-size="13" fill="#d8dde6" fill-opacity="0.85">LOCKJAW-04</text>
      <text x="2" y="23" font-family="monospace" font-size="8" fill="#f0b90f">CONVOY ESC // MK-IV</text>
    </svg>`,
    { size: 384 },
  );

  // ---------- hull paint ----------
  const base = panelled(P.hull, { size: 0.45, aspect: 0.6, rivets: 0.06 });
  const grime = mix(P.hullDark, P.rust, 0.3);
  const hullPaint = paint((p, n) => {
    if (p.y < 1.48) return grime;
    if (n.y > 0.7) return mix(P.hullLight, P.hull, 0.4);
    return base;
  });

  // ---------- main wedge hull (side profile z,y extruded across x) ----------
  b.extrude(
    [
      [1.6, 1.3],
      [3.75, 1.3],
      [3.75, 1.85],
      [3.1, 1.95],
      [2.6, 2.5],
      [1.7, 2.5],
      [1.6, 2.35],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.5, bevel: 0.03, color: hullPaint, bone: cab, name: "cabHull" },
  );

  // ---------- glass ----------
  glow(decal(glassTex, 2.2, 0.36, [0, 2.233, 2.859], [0, 0.67, 0.74]), 0.8);
  for (const s of [1, -1]) {
    glow(decal(sideTex, 0.95, 0.31, [s * 1.262, 2.2, 2.15], [s, 0, 0]), 0.8);
    // window pillars (slanted A pillars)
    b.rod([s * 1.2, 1.95, 3.1], [s * 1.2, 2.5, 2.6], 0.045, { color: P.trimBlack, bone: cab, sides: 4 });
  }

  // brow and roof plates
  box([2.5, 0.07, 0.32], P.hullDark, [0, 2.53, 2.62]);
  box([2.1, 0.07, 0.85], P.hullLight, [0, 2.52, 2.05]);
  box([1.9, 0.05, 0.4], P.hullDark, [0, 2.56, 1.78]);
  for (const s of [1, -1]) {
    box([0.12, 0.05, 0.8], P.trim, [s * 1.0, 2.57, 2.05]);
    box([0.2, 0.12, 0.7], P.hullDark, [s * 1.22, 2.45, 2.1]);
  }

  // ---------- doors / decals ----------
  for (const s of [1, -1]) {
    const x = s * 1.262;
    decal(chevTex, 1.6, 0.16, [x, 1.42, 2.8], [s, 0, 0]);
    decal(skullTex, 0.5, 0.5, [x, 1.68, 3.2], [s, 0, 0]);
    decal(serialTex, 0.8, 0.16, [x, 1.78, 2.15], [s, 0, 0]);
    // door seams
    box([0.02, 0.8, 0.03], P.trimBlack, [s * 1.255, 1.88, 1.95]);
    box([0.02, 0.5, 0.03], P.trimBlack, [s * 1.255, 1.7, 3.45]);
    box([0.02, 0.03, 1.5], P.trimBlack, [s * 1.255, 1.55, 2.7]);
    // handles
    b.rod([s * 1.29, 1.65, 2.2], [s * 1.29, 1.95, 2.2], 0.02, { color: P.steel, bone: cab, sides: 6 });
    // step rails
    box([0.1, 0.06, 1.2], P.steel, [s * 1.32, 1.36, 2.7]);
    box([0.1, 0.1, 0.06], P.trimBlack, [s * 1.3, 1.31, 2.2]);
    box([0.1, 0.1, 0.06], P.trimBlack, [s * 1.3, 1.31, 3.2]);
    // mirrors
    b.rod([s * 1.25, 2.15, 2.8], [s * 1.46, 2.3, 2.85], 0.02, { color: P.trimBlack, bone: cab, sides: 6 });
    box([0.07, 0.3, 0.2], P.hullDark, [s * 1.47, 2.3, 2.85]);
  }

  // ---------- roof: light bar, antennae, sensors ----------
  box([1.9, 0.1, 0.14], P.trimBlack, [0, 2.6, 2.7]);
  for (let i = 0; i < 7; i++) {
    glow(box([0.2, 0.08, 0.1], i % 2 ? P.neonCyan : AMBER, [-0.7 + i * 0.233, 2.64, 2.72]), 1.5);
  }
  for (const s of [1, -1]) {
    b.rod([s * 1.1, 2.55, 1.8], [s * 1.1 + s * 0.05, 3.5, 1.7], 0.012, { color: P.steel, bone: cab, sides: 6 });
    glow(b.part(new THREE.SphereGeometry(0.035, 6, 4), P.warnRed, { bone: cab, at: [s * 1.15, 3.5, 1.7] }), 1.4);
  }
  // sensor array
  box([0.34, 0.1, 0.3], P.hullDark, [1.0, 2.6, 1.85]);
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.2, 6), P.steel, { bone: cab, at: [1.0, 2.75, 1.85] });
  b.part(new THREE.ConeGeometry(0.16, 0.08, 8), P.steel, { bone: cab, at: [1.0, 2.88, 1.85], rotation: [180, 0, 0], flat: true });
  glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), P.neonCyan, { bone: cab, at: [1.0, 2.84, 1.85] }), 1.5);
  box([0.3, 0.14, 0.3], P.hullLight, [-1.0, 2.62, 1.85]);
  glow(box([0.2, 0.04, 0.02], P.neonMagenta, [-1.0, 2.64, 2.01]), 1.4);

  // ---------- hood ----------
  for (let i = 0; i < 4; i++) box([0.9, 0.03, 0.07], P.trimBlack, [0, 1.92 + (i % 1) * 0, 3.2 + i * 0.12]);
  for (const s of [1, -1]) box([0.5, 0.02, 0.5], P.hullDark, [s * 0.9, 1.92, 3.4]);

  // ---------- front fascia ----------
  box([1.7, 0.45, 0.06], P.hullDark, [0, 1.58, 3.78]);
  for (let i = 0; i < 5; i++) box([1.6, 0.04, 0.05], P.steel, [0, 1.42 + i * 0.09, 3.82]);
  for (const s of [1, -1]) {
    box([0.5, 0.28, 0.08], P.trimBlack, [s * 1.0, 1.65, 3.78]);
    glow(box([0.38, 0.17, 0.05], P.headlamp, [s * 1.0, 1.65, 3.83]), 1.6);
    box([0.14, 0.14, 0.05], P.neonCyan, [s * 0.7, 1.4, 3.8]);
    glow(box([0.14, 0.05, 0.05], P.neonCyan, [s * 0.7, 1.4, 3.82]), 1.4);
  }
  // emblem on grille
  glow(decal(skullTex, 0.32, 0.32, [0, 1.6, 3.815], [0, 0, 1]), 0.5);

  // ---------- bull-bar on body joint ----------
  const hazard = paint((p) => (Math.floor((p.x + 5) / 0.16) % 2 ? P.trim : P.trimBlack));
  b.part(new THREE.BoxGeometry(2.7, 0.28, 0.3), hazard, { bone: body, at: [0, 1.02, 3.85], flat: true });
  for (const s of [1, -1]) {
    box([0.16, 0.22, 0.4], P.hullDark, [s * 0.7, 1.2, 3.95], body);
    box([0.16, 0.5, 0.12], P.steel, [s * 1.35, 1.1, 3.9], body);
  }
  b.extrude(
    [
      [-1.3, 0.85],
      [1.3, 0.85],
      [1.45, 1.2],
      [1.2, 1.55],
      [-1.2, 1.55],
      [-1.45, 1.2],
    ],
    { at: [0, 0, 4.1], x: [1, 0, 0], thickness: 0.14, bevel: 0.03, color: P.steel, bone: body, name: "cabRam" },
  );
  decal(chevTex, 2.2, 0.2, [0, 1.15, 4.185], [0, 0, 1], body);
  for (const x of [-1.0, -0.5, 0, 0.5, 1.0]) b.spike([x, 1.5, 4.12], [0, 1, 0.5], 0.28, 0.06, { color: P.rim, bone: body, sides: 4 });
  for (const s of [1, -1]) {
    box([0.3, 0.08, 0.08], P.hullDark, [s * 0.3, 0.85, 4.1], body);
    glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), P.warnRed, { bone: body, at: [s * 1.25, 1.38, 4.19] }), 1.2);
  }
  // tow bar and steel under-plate
  box([1.6, 0.06, 0.3], P.hullLight, [0, 0.82, 4.0], body);

  // rear cab armour shoulder / back plate
  box([2.4, 0.5, 0.1], P.hullDark, [0, 2.0, 1.62]);
  for (const s of [1, -1]) glow(box([0.3, 0.06, 0.03], P.neonMagenta, [s * 0.7, 2.25, 1.565]), 1.3);
}
```