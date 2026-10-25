<!-- call: plan -->

```json
{
  "name": "Arasaka-style Riot Interceptor RC-9 'Pacifier'",
  "description": "A chunky corporate riot-control armored interceptor truck with a roof water cannon, plated cyberpunk hull and glowing neon light bars.",
  "builderName": "riotInterceptor",
  "size": [2.6, 2.7, 6.0],
  "layout": "A low, wide, wedge-nosed armored van, 6 m long. Front (+Z): angled armored ram bumper with a glowing cyan light strip, slit headlights, hood sloping up to a raked windshield. Cab with dark tinted glass, then a long boxy armored cargo/crowd-control body behind. A rotating water cannon turret sits on the roof near the rear-centre with a thick barrel pointing forward (+Z), pipes and a tank. Four fat wheels with heavy fenders rest on the floor. Roof carries a neon light bar (red/blue alternating) and magenta/cyan neon trim lines along the flanks. Cyberpunk 2077 style: matte graphite hull panels, yellow-black hazard stripes, corporate logo decals, kanji-like glyphs, grime paints, hot neon accents that glow. Slight bone-level jaggedness: chamfered plates, vents, antennas.",
  "palette": {
    "hull": "#2b2f3a",
    "hullDark": "#15171e",
    "plate": "#454c5c",
    "hazard": "#f2c200",
    "black": "#0a0a0e",
    "glass": "#0e2a3a",
    "neonCyan": "#2ff3ff",
    "neonMagenta": "#ff2bd6",
    "neonRed": "#ff2a3a",
    "neonBlue": "#2a5bff",
    "neonYellow": "#fff04a",
    "rubber": "#16161a",
    "rim": "#8a93a6",
    "steel": "#7b8394",
    "water": "#7fe0ff",
    "white": "#e8ecf2"
  },
  "mounts": {
    "chassisTop": [0, 1.3, 0],
    "cabFloor": [0, 1.3, 1.1],
    "bodyRoofRear": [0, 2.1, -1.2],
    "turretRing": [0, 2.1, -1.3],
    "roofBarMount": [0, 2.15, 0.6],
    "axleFront": [0, 0.55, 1.9],
    "axleRear": [0, 0.55, -1.8],
    "bumperFront": [0, 0.7, 3.0]
  },
  "joints": [
    { "name": "body", "at": [0, 1.0, 0], "dir": [0, 0, 1], "role": "spine" },
    { "name": "wheelFL", "parent": "body", "at": [1.15, 0.55, 1.9], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelFR", "parent": "body", "at": [-1.15, 0.55, 1.9], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelBL", "parent": "body", "at": [1.15, 0.55, -1.8], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelBR", "parent": "body", "at": [-1.15, 0.55, -1.8], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "turretYaw", "parent": "body", "at": [0, 2.1, -1.3], "dir": [0, 1, 0], "role": "hinge", "group": "turret" },
    { "name": "cannonPitch", "parent": "turretYaw", "at": [0, 2.55, -1.2], "dir": [0, 0, 1], "role": "hinge", "group": "turret" }
  ],
  "parts": [
    {
      "id": "chassisAndBumper",
      "builds": "Lower armored chassis: floor slab, skirts, sloped ram bumper with hazard stripes and cyan neon strip, front splitter, tow hooks, rear bumper with red tail strip, underbody dark paint with grime, side skirts with magenta underglow neon strips, fender arches (wheel wells) with fender flares, exhaust pipes, step plates. Panelled plating paint (riveted seams), hazard-striped lower edges.",
      "box": [[-1.3, 0.25, -3.0], [1.3, 1.3, 3.0]],
      "attaches": "Top face at chassisTop supports cab and cargo body; fender arches surround wheel joints; bumper at bumperFront.",
      "joints": ["body"],
      "floor": false,
      "budget": 170
    },
    {
      "id": "cabAndFront",
      "builds": "Front cab: raked wedge hood with vents and slit headlights glowing cyan/white, raked windshield and tinted side glass with wipers, A-pillars, door panels with handles and corporate logo decal (SVG: shield with kanji-like glyphs), side mirrors with small neon, mesh grille with LED, roof visor, push-bar lamps, 'RIOT CONTROL' lettering on doors, antenna cluster. Faceted chamfered armor plates.",
      "box": [[-1.3, 1.3, 0.4], [1.3, 2.2, 3.0]],
      "attaches": "Sits on cabFloor/chassisTop; rear wall meets cargo body at z=0.4; roof bar at roofBarMount.",
      "joints": ["body"],
      "floor": false,
      "budget": 170
    },
    {
      "id": "cargoBody",
      "builds": "Long boxy armored crowd-control body behind the cab: layered hull panels with rivets, hazard stripes, side shutters and gun ports, glowing magenta and cyan neon trim lines along the flanks, SVG decals (POLICE-style corp logo, kanji glyphs, barcode, unit number RC-9), rear double doors with handles and red tail lights, roof rails, roof vents, cable conduits, roof light bar (alternating red and blue glowing segments with housing) on roofBarMount, rear turret base plate with ring and bolts at turretRing, floodlights, roof antennas.",
      "box": [[-1.3, 1.3, -3.0], [1.3, 2.3, 0.4]],
      "attaches": "Rests on chassisTop; front wall meets cab at z=0.4; turret ring at turretRing on roof; roof bar at roofBarMount.",
      "joints": ["body"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "wheelsAndRunning",
      "builds": "Four fat armored wheels (two sides, front and rear) each with chunky treaded tire (lathe/cylinder with tread blocks), steel rim with bolt ring and hub cap, brake discs with yellow calipers, heavy axle beams and leaf-spring suspension arms, mud flaps. Each wheel is rigged on its wheel joint with axis along X. Tires touch the floor at y=0 (radius 0.55). Rim glows faint cyan ring light.",
      "box": [[-1.45, 0.0, -2.4], [1.45, 1.1, 2.5]],
      "attaches": "Wheels ride wheelFL, wheelFR, wheelBL, wheelBR at axleFront/axleRear lines; axle beams tie into chassis.",
      "joints": ["wheelFL", "wheelFR", "wheelBL", "wheelBR", "body"],
      "floor": true,
      "budget": 150
    },
    {
      "id": "waterCannonTurret",
      "builds": "Roof-mounted water cannon: rotating turret base drum with ring bearing at turretRing, armored shield housing, pressurised water tank (cylinder with glowing blue-white water level window, gauge texture, hazard bands), thick faceted cannon barrel with reinforcing rings and a flared nozzle pointing +Z, glowing cyan nozzle ring and water-tinted tip, hoses/pipes sweeping from tank to barrel, swivel yoke arms, targeting sensor with magenta lens glow, small camera, status LEDs, hazard stripes and warning decals. Barrel rides cannonPitch, base rides turretYaw. Rest pose: barrel pointing forward, slightly raised.",
      "box": [[-0.6, 2.1, -2.4], [0.6, 2.7, 0.1]],
      "attaches": "Base drum sits on turretRing at roof of cargoBody; yaw joint turretYaw, barrel pivots on cannonPitch.",
      "joints": ["turretYaw", "cannonPitch"],
      "floor": false,
      "budget": 150
    }
  ]
}
```

<!-- call: chassisAndBumper -->

```ts
import * as THREE from "three";
import { paint, svg, mix, noise, smoothstep, rng } from "agentic-3js-builder";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildChassisAndBumper({ b, J, P, M }: any) {
  const bone = J.body;
  const R = rng(11);
  const G = "chassisAndBumper";

  const box = (w: number, h: number, d: number, color: any, at: number[], opts: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, group: G, ...opts });

  // paints
  const grime = paint((p, n) => {
    const base = mix("#15171e", "#2b2f3a", smoothstep(0.2, 0.8, noise(p, 0.3, 4)));
    const dirt = smoothstep(0.55, 0.8, noise(p, 0.12, 9)) * smoothstep(0.9, 0.3, p.y);
    return mix(base, "#3a3326", dirt * 0.6);
  });
  const plated = panelled(paint((p, n) => mix("#2b2f3a", "#454c5c", smoothstep(0.3, 0.7, noise(p, 0.4, 2)) * 0.6 + (n.y > 0.6 ? 0.15 : 0))), { size: 0.4, rivets: 0.08 });
  const hazardPaint = paint((p) => {
    const v = ((p.x + p.y * 1.0 + p.z * 0.0) / 0.12) % 2;
    return (v + 2) % 2 < 1 ? "#f2c200" : "#0a0a0e";
  });
  const hazardSide = paint((p) => {
    const v = ((p.z + p.y) / 0.14) % 2;
    return (v + 2) % 2 < 1 ? "#f2c200" : "#0a0a0e";
  });

  // floor slab and underbody
  box(2.3, 0.18, 5.6, grime, [0, 0.42, 0]);
  box(2.5, 0.5, 5.2, plated, [0, 0.9, 0.0]);
  // top deck (supports cab & body)
  box(2.6, 0.1, 5.9, plated, [0, 1.25, 0]);
  // chamfer plates along upper edges
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.2, 0.2, 5.6), plated, { bone, at: [s * 1.3, 1.15, 0], rotation: [0, 0, s * 45], group: G });
    // side skirts
    box(0.1, 0.3, 2.0, plated, [s * 1.27, 0.5, 0.0]);
    glow(box(0.04, 0.05, 1.9, P.neonMagenta, [s * 1.3, 0.34, 0.0]), 1.8);
    // underglow strip below
    glow(box(0.5, 0.03, 1.6, P.neonMagenta, [s * 1.0, 0.27, 0.0]), 1.2);
    // hazard lower edge
    box(0.06, 0.1, 5.4, hazardSide, [s * 1.3, 0.62, 0.0]);
    // step plates
    box(0.2, 0.05, 0.7, P.plate, [s * 1.38, 0.65, 0.55]);
    box(0.2, 0.02, 0.6, P.black, [s * 1.38, 0.68, 0.55]);
    // exhaust pipes (rear)
    const ex = b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.6, 8), metal("steel"), {
      bone, at: [s * 0.8, 0.55, -2.9], rotation: [90, 0, 0], group: G,
    });
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.05, 8), P.black, { bone, at: [s * 0.8, 0.55, -3.2], rotation: [90, 0, 0], group: G });
    // tow hooks
    box(0.12, 0.1, 0.25, P.steel, [s * 0.7, 0.45, 3.0]);
    b.part(new THREE.TorusGeometry(0.07, 0.025, 6, 10), P.hazard, { bone, at: [s * 0.7, 0.45, 3.15], group: G });

    // fender arches around each wheel
    for (const z of [1.9, -1.8]) {
      b.part(new THREE.TorusGeometry(0.72, 0.09, 5, 12, Math.PI), P.hullDark, {
        bone, at: [s * 1.2, 0.55, z], rotation: [0, 90, 0], group: G,
      });
      // flare plate over wheel
      box(0.28, 0.12, 1.5, plated, [s * 1.3, 1.22, z]);
      box(0.14, 0.4, 0.2, P.plate, [s * 1.34, 1.0, z + 0.78]);
      box(0.14, 0.4, 0.2, P.plate, [s * 1.34, 1.0, z - 0.78]);
      // wheel well dark liner
      box(0.05, 0.6, 1.3, P.black, [s * 1.04, 1.0, z]);
    }
    // front corner light slits
    glow(box(0.3, 0.05, 0.04, P.neonCyan, [s * 0.95, 0.85, 3.02]), 2);
  }
  // mudguard hazard faces
  box(2.5, 0.12, 0.06, hazardPaint, [0, 0.95, 2.6]);

  // sloped ram bumper
  b.extrude(
    [[0, 0], [0.6, 0], [0.9, 0.45], [0.7, 0.75], [0, 0.75]],
    { at: [-1.3, 0.35, 2.4], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.05, color: plated, bone, group: G, name: "bumperSide" },
  );
  for (const s of [1, -1])
    b.extrude(
      [[0, 0], [0.6, 0], [0.9, 0.45], [0.7, 0.75], [0, 0.75]],
      { at: [s * 1.25, 0.35, 2.4], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.1, color: plated, bone, group: G },
    );
  // sloped face
  b.part(new THREE.BoxGeometry(2.5, 0.55, 0.14), plated, { bone, at: [0, 0.85, 3.0], rotation: [-25, 0, 0], group: G });
  box(2.5, 0.2, 0.2, hazardPaint, [0, 0.55, 3.05]);
  // chamfer top
  b.part(new THREE.BoxGeometry(2.5, 0.12, 0.4), P.hullDark, { bone, at: [0, 1.15, 2.8], rotation: [30, 0, 0], group: G });
  // cyan neon strip
  glow(box(2.1, 0.07, 0.05, P.neonCyan, [0, 0.92, 3.1], { rotation: [-25, 0, 0] }), 2.2);
  // ram teeth/guards
  for (let i = -2; i <= 2; i++) {
    b.spike([i * 0.42, 0.7, 3.1], [0, 0, 1], 0.12, 0.07, { color: P.steel, bone, group: G, sides: 4 });
  }
  // front splitter
  b.extrude([[0, 0], [2.4, 0], [2.2, 0.35], [0.2, 0.35]], { at: [1.2, 0.28, 2.9], x: [-1, 0, 0], y: [0, 0, 1], thickness: 0.04, color: P.hullDark, bone, group: G });
  glow(box(1.8, 0.02, 0.03, P.neonCyan, [0, 0.3, 3.25]), 1.5);

  // rear bumper
  box(2.5, 0.35, 0.25, plated, [0, 0.55, -3.0]);
  box(2.5, 0.08, 0.26, hazardPaint, [0, 0.38, -3.0]);
  glow(box(2.0, 0.07, 0.04, P.neonRed, [0, 0.62, -3.14]), 2.2);
  for (const s of [1, -1]) {
    glow(box(0.25, 0.12, 0.04, P.neonRed, [s * 1.1, 0.95, -2.99]), 2);
    box(0.4, 0.1, 0.1, P.hullDark, [s * 0.6, 0.35, -3.0]);
  }
  // rear step plate
  box(1.2, 0.04, 0.3, P.black, [0, 0.76, -3.1]);

  // underbody ribs and driveshaft
  for (let z = -2.4; z <= 2.5; z += 0.6) box(2.0, 0.08, 0.1, P.hullDark, [0, 0.3, z]);
  b.part(new THREE.CylinderGeometry(0.07, 0.07, 4.4, 8), P.steel, { bone, at: [0, 0.38, 0], rotation: [90, 0, 0], group: G });

  // logo decal on skirt-like side panel
  const logo = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#0a0a0e" opacity="0.0"/><path d="M6 4h20l6 8-6 16H6z" fill="none" stroke="#2ff3ff" stroke-width="2.5"/><path d="M12 10h8M12 16h10M12 22h6" stroke="#ff2bd6" stroke-width="2.5"/><text x="36" y="22" font-size="14" font-family="monospace" fill="#f2c200" font-weight="bold">RC-9</text></svg>`,
    { size: 256 },
  );
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(1.2, 0.6), "#ffffff", {
      bone, at: [s * 1.311, 0.95, -0.4], dir: [s, 0, 0], axis: "z", texture: logo, group: G,
    });
}
```

<!-- call: waterCannonTurret -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep, rng, aim } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, gaugeTexture } from "agentic-3js-builder/kits/clockwork";

type Ctx = { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, [number, number, number]> };

export function buildWaterCannonTurret({ b, J, P, M }: Ctx) {
  const yaw = J.turretYaw;
  const pitch = J.cannonPitch;
  const R = rng(11);
  const [tx, ty, tz] = M.turretRing;

  // ---------- paints ----------
  const armor = paint((p, n) => {
    const base = mix(P.hull, P.plate, smoothstep(0.3, 0.8, noise(p, 0.18, 3)) * 0.7);
    const grime = smoothstep(0.55, 0.85, noise(p, 0.07, 9)) * smoothstep(0.3, -0.6, n.y);
    return mix(mix(base, "#ffffff", 0.08 * Math.max(n.y, 0)), P.hullDark, grime * 0.6);
  });
  const hazardPaint = paint((p) => (Math.floor((p.x + p.y + p.z) / 0.045) % 2 === 0 ? P.hazard : P.black));
  const STEEL = metal("steel", { tarnish: 0.35 });
  const DARK = metal("iron");

  // ---------- textures ----------
  const WARN = svg(
    `<svg viewBox="0 0 64 64"><path d="M32 4 L61 56 H3Z" fill="#f2c200" stroke="#0a0a0e" stroke-width="5" stroke-linejoin="round"/><rect x="29" y="22" width="6" height="19" fill="#0a0a0e"/><rect x="29" y="45" width="6" height="6" fill="#0a0a0e"/></svg>`,
    { size: 128 },
  );
  const LOGO = svg(
    `<svg viewBox="0 0 96 48"><rect width="96" height="48" fill="#15171e" stroke="#2ff3ff" stroke-width="3"/><path d="M10 10 H34 L22 38Z" fill="#ff2a3a"/><text x="42" y="22" font-family="sans-serif" font-weight="bold" font-size="14" fill="#e8ecf2">RC-9</text><text x="42" y="40" font-family="sans-serif" font-size="14" fill="#2ff3ff">鎮圧</text></svg>`,
    { size: 192 },
  );
  const LEVEL = svg(
    `<svg viewBox="0 0 24 64"><rect width="24" height="64" fill="#0a0a0e"/><rect x="4" y="22" width="16" height="38" fill="#7fe0ff"/><rect x="4" y="22" width="16" height="4" fill="#ffffff"/><g stroke="#0a0a0e" stroke-width="2"><path d="M4 34H12M4 46H12M4 56H12"/></g></svg>`,
    { size: 128 },
  );
  const LENS = svg(
    `<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="15" fill="#ff2bd6"/><circle cx="16" cy="16" r="8" fill="#2a0a28"/><circle cx="12" cy="12" r="3" fill="#fff"/></svg>`,
    { size: 64 },
  );
  const GAUGE = gaugeTexture({ needle: 40, label: "BAR" });

  const cyl = (rt: number, rb: number, h: number, s = 12) => new THREE.CylinderGeometry(rt, rb, h, s);
  const at = (x: number, y: number, z: number): [number, number, number] => [tx + x, ty + y, tz + z];

  // ---------- base drum on yaw ----------
  b.part(cyl(0.58, 0.6, 0.06, 20), STEEL, { bone: yaw, at: at(0, 0.03, 0) });
  b.part(cyl(0.5, 0.54, 0.16, 16), armor, { bone: yaw, at: at(0, 0.14, 0) });
  b.part(cyl(0.53, 0.53, 0.025, 20), P.neonCyan && "#2ff3ff", { bone: yaw, at: at(0, 0.075, 0) });
  glow(b.part(cyl(0.555, 0.555, 0.02, 20), P.neonCyan, { bone: yaw, at: at(0, 0.075, 0) }), 1.6);
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    b.part(cyl(0.02, 0.02, 0.03, 6), P.rim, { bone: yaw, at: at(Math.sin(a) * 0.46, 0.235, Math.cos(a) * 0.46) });
  }
  b.part(cyl(0.38, 0.44, 0.1, 16), DARK, { bone: yaw, at: at(0, 0.27, 0) });
  // hazard band on drum
  b.part(cyl(0.505, 0.505, 0.04, 20, ), hazardPaint, { bone: yaw, at: at(0, 0.2, 0) });

  // ---------- yoke arms + shield housing ----------
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.1, 0.5, 0.5), armor, { bone: yaw, at: at(s * 0.3, 0.55, 0.05) });
    b.part(new THREE.BoxGeometry(0.04, 0.4, 0.4), P.plate, { bone: yaw, at: at(s * 0.36, 0.55, 0.05) });
    b.part(cyl(0.07, 0.07, 0.08, 10), STEEL, { bone: yaw, at: at(s * 0.37, 0.6, 0.1), rotation: [0, 0, 90] });
    glow(b.part(new THREE.SphereGeometry(0.018, 6, 4), s > 0 ? P.neonRed : P.neonCyan, { bone: yaw, at: at(s * 0.37, 0.45, 0.28) }), 2);
    b.part(new THREE.BoxGeometry(0.1, 0.1, 0.3), P.hullDark, { bone: yaw, at: at(s * 0.3, 0.32, -0.05) });
  }
  // shield: sloped front plate and rear housing
  b.part(new THREE.BoxGeometry(0.76, 0.3, 0.1), armor, { bone: yaw, at: at(0, 0.34, 0.3), rotation: [-25, 0, 0], flat: true });
  b.part(new THREE.BoxGeometry(0.8, 0.28, 0.5), armor, { bone: yaw, at: at(0, 0.45, -0.25), flat: true });
  b.part(new THREE.BoxGeometry(0.66, 0.04, 0.46), P.hullDark, { bone: yaw, at: at(0, 0.6, -0.25) });
  b.part(new THREE.PlaneGeometry(0.3, 0.15), "#ffffff", { bone: yaw, at: at(0, 0.45, 0.0 - 0.51), dir: [0, 0, -1], axis: "z", texture: LOGO });
  b.part(new THREE.PlaneGeometry(0.1, 0.1), "#ffffff", { bone: yaw, at: at(0.405, 0.5, -0.25), dir: [1, 0, 0], axis: "z", texture: WARN });
  b.part(new THREE.PlaneGeometry(0.1, 0.1), "#ffffff", { bone: yaw, at: at(-0.405, 0.5, -0.25), dir: [-1, 0, 0], axis: "z", texture: WARN });

  // ---------- water tank (rear) ----------
  const tank = b.part(cyl(0.22, 0.22, 0.55, 14), armor, { bone: yaw, at: at(0, 0.88, -0.55), rotation: [90, 0, 0] });
  for (const z of [-0.3, 0, 0.3]) {
    b.part(cyl(0.235, 0.235, 0.06, 14), z === 0 ? hazardPaint : STEEL, { bone: yaw, at: at(0, 0.88, -0.55 + z), rotation: [90, 0, 0] });
  }
  for (const z of [-1, 1]) b.part(new THREE.SphereGeometry(0.22, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), STEEL, { bone: yaw, at: at(0, 0.88, -0.55 + z * 0.275), rotation: [z * 90, 0, 0] });
  glow(b.part(new THREE.PlaneGeometry(0.1, 0.3), "#ffffff", { bone: yaw, at: at(0.232, 0.88, -0.55), dir: [1, 0, 0], axis: "z", texture: LEVEL }), 1.4);
  b.part(new THREE.BoxGeometry(0.03, 0.34, 0.14), P.black, { bone: yaw, at: at(0.225, 0.88, -0.55) });
  b.part(new THREE.CircleGeometry(0.06, 16), "#ffffff", { bone: yaw, at: at(-0.236, 0.9, -0.55), dir: [-1, 0, 0], axis: "z", texture: GAUGE });
  b.part(cyl(0.05, 0.05, 0.08, 8), STEEL, { bone: yaw, at: at(0, 1.13, -0.6) });
  b.part(cyl(0.065, 0.065, 0.03, 8), P.hazard, { bone: yaw, at: at(0, 1.18, -0.6) });
  // tank saddle
  for (const z of [-0.8, -0.3]) b.part(new THREE.BoxGeometry(0.5, 0.1, 0.06), P.hullDark, { bone: yaw, at: at(0, 0.7, -0.55 + (z + 0.55)) });

  // ---------- pipes from tank to barrel ----------
  for (const s of [1, -1]) {
    const path = [at(s * 0.1, 0.8, -0.2), at(s * 0.2, 0.95, 0.0), at(s * 0.2, 0.9, 0.2), at(s * 0.12, 0.75, 0.38)];
    b.sweep(path, 0.032, { bone: yaw, color: STEEL, sides: 8 });
    b.part(cyl(0.045, 0.045, 0.05, 8), P.hazard, { bone: yaw, at: at(s * 0.2, 0.95, 0.0), rotation: [0, 0, 90] });
  }
  b.sweep([at(0.0, 0.7, -0.75), at(0.3, 0.7, -0.75), at(0.3, 0.6, -0.5)], 0.025, { bone: yaw, color: P.hullDark, sides: 6 });

  // ---------- sensor + camera on shield top ----------
  b.part(new THREE.BoxGeometry(0.16, 0.12, 0.14), P.hullDark, { bone: yaw, at: at(-0.28, 0.69, -0.2) });
  glow(b.part(new THREE.CircleGeometry(0.04, 12), "#ffffff", { bone: yaw, at: at(-0.28, 0.69, -0.126), dir: [0, 0, 1], axis: "z", texture: LENS }), 2);
  b.part(cyl(0.025, 0.03, 0.12, 6), P.steel, { bone: yaw, at: at(0.28, 0.66, -0.15) });
  b.part(new THREE.BoxGeometry(0.1, 0.07, 0.12), P.black, { bone: yaw, at: at(0.28, 0.75, -0.12) });
  b.part(cyl(0.022, 0.022, 0.03, 8), P.neonRed, { bone: yaw, at: at(0.28, 0.75, -0.04), rotation: [90, 0, 0] });
  for (let i = 0; i < 5; i++)
    glow(b.part(new THREE.BoxGeometry(0.03, 0.015, 0.015), [P.neonRed, P.neonYellow, P.neonCyan, P.neonMagenta, P.neonBlue][i], { bone: yaw, at: at(-0.12 + i * 0.06, 0.6, 0.0 + 0.0), }), 2);
  b.part(cyl(0.008, 0.008, 0.35, 5), P.steel, { bone: yaw, at: at(-0.33, 0.8, -0.45) });

  // ---------- barrel on cannonPitch ----------
  const bz0 = tz + 0.1;
  const by = ty + 0.55;
  const bs = (z: number): [number, number, number] => [tx, by, bz0 + z];
  const rotZ = (g: THREE.BufferGeometry) => g;
  b.part(cyl(0.12, 0.12, 0.16, 12), STEEL, { bone: pitch, at: bs(0.0), rotation: [0, 0, 90] });
  b.part(cyl(0.14, 0.14, 0.45, 8), armor, { bone: pitch, at: bs(0.1), rotation: [90, 0, 0], flat: true });
  b.part(cyl(0.1, 0.12, 0.7, 8), armor, { bone: pitch, at: bs(0.6), rotation: [90, 0, 0], flat: true });
  for (const z of [0.25, 0.55, 0.85]) b.part(cyl(0.15, 0.15, 0.05, 8), z === 0.55 ? hazardPaint : STEEL, { bone: pitch, at: bs(z), rotation: [90, 0, 0] });
  b.part(cyl(0.16, 0.16, 0.03, 8), STEEL, { bone: pitch, at: bs(0.4), rotation: [90, 0, 0] });
  // nozzle flare
  b.part(cyl(0.17, 0.1, 0.22, 8), DARK, { bone: pitch, at: bs(1.04), rotation: [90, 0, 0], flat: true });
  glow(b.part(new THREE.TorusGeometry(0.16, 0.02, 5, 14), P.neonCyan, { bone: pitch, at: bs(1.15) }), 2.2);
  b.part(cyl(0.12, 0.12, 0.03, 12), P.black, { bone: pitch, at: bs(1.16), rotation: [90, 0, 0] });
  glow(b.part(new THREE.CircleGeometry(0.1, 12), P.water, { bone: pitch, at: bs(1.18), dir: [0, 0, 1], axis: "z" }), 1.8);
  // top rail, hazard decals
  b.part(new THREE.BoxGeometry(0.06, 0.04, 0.6), P.hullDark, { bone: pitch, at: [tx, by + 0.14, bz0 + 0.6] });
  b.part(new THREE.PlaneGeometry(0.1, 0.1), "#ffffff", { bone: pitch, at: [tx, by + 0.166, bz0 + 0.3], dir: [0, 1, 0], axis: "z", texture: WARN });
  // pitch pins
  for (const s of [1, -1]) b.part(cyl(0.05, 0.05, 0.1, 8), P.rim, { bone: pitch, at: [tx + s * 0.18, by, bz0], rotation: [0, 0, 90] });
  // barrel pipe connectors
  for (const s of [1, -1]) b.rod([tx + s * 0.12, by - 0.02, bz0 + 0.38], [tx + s * 0.12, by - 0.08, bz0 + 0.5], 0.03, P.steel, { bone: pitch });
  void R; void aim; void rotZ; void tank;
}
```

<!-- call: wheelsAndRunning -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildWheelsAndRunning({ b, J, P, M }: Ctx) {
  const R = 0.55; // tire radius
  const TW = 0.5; // tire width
  const YELLOW = P.hazard;
  const rand = rng(11);

  // Paints
  const tirePaint = paint((p, n) => {
    const g = noise(p, 0.05, 3);
    const dust = smoothstep(0.55, 0.9, noise(p, 0.18, 8)) * 0.35;
    const base = mix("#121216", "#24242b", g);
    return mix(base, "#5a5448", dust * (n.y < 0.2 ? 1 : 0.4));
  });
  const rimPaint = paint((p, n) => {
    const g = noise(p, 0.04, 5);
    const c = mix(P.steel, P.rim, g);
    return mix(c, "#2b2f3a", smoothstep(0.6, 0.9, noise(p, 0.1, 2)) * 0.5 * (n.y < 0 ? 1 : 0.5));
  });
  const metalPaint = paint((p, n) => {
    const g = noise(p, 0.08, 4);
    const grime = smoothstep(0.4, 0.8, noise(p, 0.15, 6));
    return mix(mix(P.hullDark, P.plate, g), "#3a3328", grime * 0.5 * (n.y < 0.3 ? 1 : 0.3));
  });
  const flapPaint = paint((p, _n, s) => {
    const y = p.y;
    const stripe = Math.floor((p.y + p.z) / 0.06) % 2 === 0;
    return y < 0.3 && stripe ? YELLOW : P.black;
  });

  // Textures
  const hazardTex = svg(
    `<svg viewBox="0 0 64 16" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="16" fill="#0a0a0e"/>${[0, 1, 2, 3, 4, 5, 6, 7, 8]
      .map((i) => `<path d="M${i * 16 - 8} 16 L${i * 16} 0 L${i * 16 + 8} 0 L${i * 16} 16Z" fill="#f2c200"/>`)
      .join("")}</svg>`,
    { size: 128 },
  );
  const sidewall = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="49" fill="#1b1b20"/>
      <circle cx="50" cy="50" r="42" fill="none" stroke="#0c0c10" stroke-width="3"/>
      <circle cx="50" cy="50" r="36" fill="none" stroke="#2c2c34" stroke-width="1.5"/>
      <g stroke="#2c2c34" stroke-width="2">${Array.from({ length: 24 }, (_, i) => {
        const a = (i / 24) * Math.PI * 2;
        return `<path d="M${50 + Math.cos(a) * 40} ${50 + Math.sin(a) * 40} L${50 + Math.cos(a) * 47} ${50 + Math.sin(a) * 47}"/>`;
      }).join("")}</g>
      <rect x="30" y="8" width="40" height="7" fill="#f2c200" opacity="0.0"/>
      <text x="50" y="14" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="7" fill="#8a8f9c" transform="rotate(0 50 50)">ARASAKA  RC-9  ARMOR</text>
      <path d="M44 88 h12" stroke="#f2c200" stroke-width="3"/>
    </svg>`,
    { size: 256 },
  );
  const hubTex = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="31" fill="#59606f" stroke="#15171e" stroke-width="2"/>
      <path d="M32 10 L50 22 L50 42 L32 54 L14 42 L14 22Z" fill="none" stroke="#15171e" stroke-width="2.5"/>
      <path d="M22 28 h20 M32 20 v24 M24 38 l16 -10" stroke="#ff2a3a" stroke-width="3" stroke-linecap="round"/>
    </svg>`,
    { size: 128 },
  );

  const wheelSpec: [string, number, number][] = [
    ["wheelFL", 1, 1.9],
    ["wheelFR", -1, 1.9],
    ["wheelBL", 1, -1.8],
    ["wheelBR", -1, -1.8],
  ];

  // Geometry builders (axis along X; local space of the wheel joint: joint +Y is the outward X axis)
  const tireProfile: [number, number][] = [
    [0.33, -TW / 2],
    [0.46, -TW / 2],
    [R - 0.04, -TW / 2 + 0.04],
    [R, -TW / 2 + 0.1],
    [R, TW / 2 - 0.1],
    [R - 0.04, TW / 2 - 0.04],
    [0.46, TW / 2],
    [0.33, TW / 2],
  ];

  for (const [name, s, z] of wheelSpec) {
    const J_w = (J as any)[name];
    const x = 1.15 * s;
    const c: [number, number, number] = [x, R, z];
    const out: [number, number, number] = [s, 0, 0];

    // Tire (lathe about X axis)
    b.lathe(tireProfile, {
      at: c,
      axis: out,
      segments: 20,
      color: tirePaint,
      bone: J_w,
      name: `tire.${name}`,
    });

    // Tread blocks
    const nT = 20;
    for (let i = 0; i < nT; i++) {
      const a = (i / nT) * Math.PI * 2;
      const py = Math.cos(a) * (R + 0.012);
      const pz = Math.sin(a) * (R + 0.012);
      const blk = b.part(new THREE.BoxGeometry(TW * 0.78, 0.045, 0.1), "#0c0c0f", {
        bone: J_w,
        at: [x, R + py, z + pz],
        dir: [0, py, pz],
        axis: "y",
        name: `tread.${name}.${i}`,
      });
      void blk;
    }

    // Outer sidewall decal disc
    const sideX = x + s * (TW / 2 + 0.002);
    b.part(new THREE.CircleGeometry(R - 0.03, 20), "#ffffff", {
      bone: J_w,
      at: [sideX, R, z],
      dir: out,
      axis: "z",
      texture: sidewall,
      name: `sidewall.${name}`,
    });

    // Rim: steel disc dish
    b.lathe(
      [
        [0, 0.0],
        [0.3, 0.0],
        [0.34, 0.06],
        [0.34, 0.0 - 0.1],
        [0.26, -0.13],
        [0, -0.13],
      ],
      {
        at: [x + s * (TW / 2 - 0.1), R, z],
        axis: out,
        segments: 12,
        color: rimPaint,
        bone: J_w,
        name: `rim.${name}`,
      },
    );
    // Inner rim barrel
    b.part(new THREE.CylinderGeometry(0.3, 0.3, TW - 0.06, 12), P.hullDark, {
      bone: J_w,
      at: c,
      dir: out,
      name: `barrel.${name}`,
    });

    // Cyan ring light
    glow(
      b.lathe(
        [
          [0.255, 0],
          [0.285, 0],
          [0.285, 0.014],
          [0.255, 0.014],
        ],
        {
          at: [x + s * (TW / 2 - 0.015), R, z],
          axis: out,
          segments: 20,
          color: P.neonCyan,
          bone: J_w,
          name: `ringlight.${name}`,
        },
      ),
      1.4,
    );

    // Bolt ring
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.03, 6), P.steel, {
        bone: J_w,
        at: [sideX - s * 0.04, R + Math.cos(a) * 0.19, z + Math.sin(a) * 0.19],
        dir: out,
        name: `bolt.${name}.${i}`,
      });
    }

    // Hub cap with logo
    b.part(new THREE.CylinderGeometry(0.11, 0.12, 0.06, 10), P.rim, {
      bone: J_w,
      at: [sideX - s * 0.03, R, z],
      dir: out,
      name: `hub.${name}`,
    });
    b.part(new THREE.CircleGeometry(0.1, 12), "#ffffff", {
      bone: J_w,
      at: [sideX + s * 0.002, R, z],
      dir: out,
      axis: "z",
      texture: hubTex,
      name: `hubdecal.${name}`,
    });

    // Brake disc (inboard) rides wheel
    const inX = x - s * (TW / 2 + 0.05);
    b.part(new THREE.CylinderGeometry(0.24, 0.24, 0.025, 14), "#59606f", {
      bone: J_w,
      at: [inX, R, z],
      dir: out,
      name: `disc.${name}`,
    });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.03, 6), P.black, {
        bone: J_w,
        at: [inX, R + Math.cos(a) * 0.15, z + Math.sin(a) * 0.15],
        dir: out,
        name: `discHole.${name}.${i}`,
      });
    }

    // Caliper (fixed to body, yellow)
    b.part(new THREE.BoxGeometry(0.1, 0.14, 0.2), YELLOW, {
      bone: J.body,
      at: [inX, R + 0.2, z + 0.02],
      name: `caliper.${name}`,
    });
    b.part(new THREE.BoxGeometry(0.14, 0.03, 0.08), P.black, {
      bone: J.body,
      at: [inX, R + 0.28, z + 0.02],
      name: `caliperTop.${name}`,
    });

    // Axle stub tying wheel to axle beam
    b.rod([x - s * 0.3, R, z], [x + s * 0.05, R, z], 0.07, P.steel, { bone: J_w, sides: 8, name: `stub.${name}` });

    // Mud flap behind wheel
    const fz = z - R - 0.06;
    b.part(new THREE.BoxGeometry(0.4, 0.4, 0.035), flapPaint, {
      bone: J.body,
      at: [x, 0.38, fz],
      name: `flap.${name}`,
    });
    b.part(new THREE.BoxGeometry(0.42, 0.04, 0.05), P.steel, {
      bone: J.body,
      at: [x, 0.6, fz],
      name: `flapBar.${name}`,
    });
    // Hazard strip on flap
    b.part(new THREE.PlaneGeometry(0.34, 0.085), "#ffffff", {
      bone: J.body,
      at: [x, 0.5, fz - 0.019],
      dir: [0, 0, -1],
      axis: "z",
      texture: hazardTex,
      name: `flapHaz.${name}`,
    });
  }

  // Axle beams and suspension
  const axles: [number, number][] = [
    [1.9, 0],
    [-1.8, 1],
  ];
  for (const [z] of axles) {
    // Main beam
    b.part(new THREE.BoxGeometry(2.1, 0.16, 0.2), metalPaint, {
      bone: J.body,
      at: [0, R, z],
      name: `axleBeam.${z}`,
    });
    // Differential housing
    b.part(new THREE.SphereGeometry(0.2, 8, 6), metalPaint, {
      bone: J.body,
      at: [0, R, z],
      scale: [1, 0.9, 1.1],
      name: `diff.${z}`,
    });
    b.part(new THREE.CylinderGeometry(0.08, 0.08, 0.22, 8), P.hullDark, {
      bone: J.body,
      at: [0, R + 0.17, z],
      name: `diffNeck.${z}`,
    });
    // Drive shaft stub
    b.part(new THREE.BoxGeometry(0.06, 0.06, 0.5), P.steel, {
      bone: J.body,
      at: [0, R + 0.12, z + (z > 0 ? -0.35 : 0.35)],
      name: `shaft.${z}`,
    });
    for (const s of [1, -1]) {
      const x = 0.8 * s;
      // Leaf springs: stacked curved leaves
      for (let k = 0; k < 4; k++) {
        const len = 0.9 - k * 0.14;
        const pts: [number, number, number][] = [
          [x, R + 0.2 + k * 0.025 - 0.04 * (1 - k / 4), z - len / 2],
          [x, R + 0.15 + k * 0.025, z],
          [x, R + 0.2 + k * 0.025 - 0.04 * (1 - k / 4), z + len / 2],
        ];
        b.sweep(pts, 0.018, {
          bone: J.body,
          color: k % 2 ? P.hullDark : P.steel,
          section: "box",
          caps: "flat",
          name: `leaf.${z}.${s}.${k}`,
        });
      }
      // U-bolt clamp
      b.part(new THREE.BoxGeometry(0.2, 0.06, 0.16), P.steel, {
        bone: J.body,
        at: [x, R + 0.28, z],
        name: `clamp.${z}.${s}`,
      });
      // Shock absorber (yellow spring)
      b.rod([x * 1.15, R + 0.1, z + 0.15], [x * 1.1, 1.05, z + 0.1], 0.03, P.steel, {
        bone: J.body,
        sides: 6,
        name: `shock.${z}.${s}`,
      });
      for (let k = 0; k < 5; k++) {
        const t = 0.15 + k * 0.17;
        b.part(new THREE.TorusGeometry(0.045, 0.012, 4, 8), YELLOW, {
          bone: J.body,
          at: [x * 1.15 - x * 0.05 * t, R + 0.1 + (1.05 - R - 0.1) * t, z + 0.15 - 0.05 * t],
          rotation: [90, 0, 0],
          name: `spring.${z}.${s}.${k}`,
        });
      }
      // Hanger bracket up into chassis
      b.part(new THREE.BoxGeometry(0.12, 0.5, 0.14), P.plate, {
        bone: J.body,
        at: [x, 0.9, z + 0.5],
        name: `hanger.${z}.${s}`,
      });
      b.part(new THREE.BoxGeometry(0.12, 0.4, 0.14), P.plate, {
        bone: J.body,
        at: [x, 0.85, z - 0.5],
        name: `hangerB.${z}.${s}`,
      });
    }
    // Cross-member to chassis
    b.part(new THREE.BoxGeometry(1.7, 0.1, 0.12), P.hullDark, {
      bone: J.body,
      at: [0, 0.8, z],
      name: `cross.${z}`,
    });
  }

  // Longitudinal drive shaft
  b.rod([0, 0.62, -1.8], [0, 0.62, 1.9], 0.04, P.steel, { bone: J.body, sides: 6, name: "propShaft" });
  for (let i = 0; i < 3; i++)
    b.part(new THREE.SphereGeometry(0.06, 6, 4), P.hullDark, {
      bone: J.body,
      at: [0, 0.62, -1.2 + i * 1.2],
      name: `uJoint.${i}`,
    });
}
```

<!-- call: cargoBody -->

```ts
import * as THREE from "three";
import { paint, svg, mix, noise, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export function buildCargoBody({ b, J, P, M }: Ctx) {
  const bone = J.body;
  type V = [number, number, number];

  // ---------- textures ----------
  const HAZ = svg(
    `<svg viewBox="0 0 96 6" xmlns="http://www.w3.org/2000/svg"><rect width="96" height="6" fill="#f2c200"/>` +
      Array.from({ length: 14 }, (_, i) => `<path d="M${i * 8 - 4} 6 L${i * 8 + 2} 0 L${i * 8 + 6} 0 L${i * 8} 6Z" fill="#0a0a0e"/>`).join("") +
      `<rect width="96" height="0.8" fill="#0a0a0e"/><rect y="5.2" width="96" height="0.8" fill="#0a0a0e"/></svg>`,
    { size: 512 },
  );
  const LOGO = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 3 L58 12 V34 Q58 52 32 61 Q6 52 6 34 V12Z" fill="#0a0a0e" stroke="#2ff3ff" stroke-width="3"/>
    <path d="M32 11 L50 17 V33 Q50 45 32 53 Q14 45 14 33 V17Z" fill="none" stroke="#e8ecf2" stroke-width="2"/>
    <path d="M32 16 L44 38 H20Z" fill="#ff2a3a"/><path d="M32 24 L38 36 H26Z" fill="#0a0a0e"/>
    <rect x="22" y="42" width="20" height="3" fill="#f2c200"/></svg>`,
    { size: 256 },
  );
  const KANJI = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" rx="4" fill="#0a0a0e"/>
    <g stroke="#ff2bd6" stroke-width="4" stroke-linecap="round" fill="none">
    <path d="M10 18 H54 M32 8 V56 M32 22 Q20 40 8 48 M32 22 Q44 40 56 48"/><path d="M16 56 H48"/></g>
    <rect x="1.5" y="1.5" width="61" height="61" rx="4" fill="none" stroke="#2ff3ff" stroke-width="2"/></svg>`,
    { size: 256 },
  );
  let bars = "";
  let x = 2;
  for (let i = 0; x < 92; i++) {
    const w = 1 + ((i * 7) % 4);
    if (i % 2 === 0) bars += `<rect x="${x}" y="3" width="${w}" height="22" fill="#0a0a0e"/>`;
    x += w + 1;
  }
  const BARCODE = svg(`<svg viewBox="0 0 96 28" xmlns="http://www.w3.org/2000/svg"><rect width="96" height="28" fill="#e8ecf2"/>${bars}</svg>`, { size: 256 });
  const UNIT = svg(
    `<svg viewBox="0 0 96 30" xmlns="http://www.w3.org/2000/svg"><rect width="96" height="30" fill="#0a0a0e" opacity="0.85"/>
    <text x="48" y="24" text-anchor="middle" font-family="Arial Black, sans-serif" font-weight="bold" font-size="24" fill="#f2c200">RC-9</text></svg>`,
    { size: 256 },
  );
  const WARN = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M32 6 L60 56 H4Z" fill="#f2c200" stroke="#0a0a0e" stroke-width="4" stroke-linejoin="round"/>
    <rect x="29" y="22" width="6" height="18" fill="#0a0a0e"/><rect x="29" y="44" width="6" height="6" fill="#0a0a0e"/></svg>`,
    { size: 128 },
  );

  // ---------- paints ----------
  const grime = (base: string, dark: string) =>
    paint((p, n) => {
      const low = smoothstep(1.9, 1.3, p.y);
      const g = noise(p, 0.25, 4) * 0.5 + low * 0.5;
      const c = mix(base, dark, Math.min(1, g * 0.7));
      return mix(c, "#0a0a0e", 0.15 * smoothstep(0.2, -0.8, n.y));
    });
  const HULL = grime(P.hull, P.hullDark);
  const PLATE = grime(P.plate, P.hull);
  const ROOF = paint((p, n) => mix(mix(P.hull, P.plate, noise(p, 0.3, 9)), "#e8ecf2", 0.08 * smoothstep(0.7, 1, n.y)));

  // ---------- helpers ----------
  const box = (w: number, h: number, d: number, color: any, at: V, o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, ...o });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: any, at: V, o: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { bone, at, ...o });
  const decal = (tex: any, at: V, dir: V, w: number, h: number, o: any = {}) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone, at, dir, axis: "z", texture: tex, ...o });
  const lit = (w: number, h: number, d: number, color: string, at: V, k = 1.6) => glow(box(w, h, d, color, at), k);

  // ---------- main shell ----------
  box(2.54, 0.9, 3.33, HULL, [0, 1.75, -1.285]);
  box(2.3, 0.05, 3.2, ROOF, [0, 2.205, -1.3]); // roof plate
  // chamfered top edges
  for (const s of [1, -1]) {
    box(0.12, 0.12, 3.3, PLATE, [s * 1.2, 2.15, -1.29], { rotation: [0, 0, s * 45] });
    // lower skirt-side armour
    box(0.05, 0.22, 3.3, P.hullDark, [s * 1.29, 1.42, -1.29]);
  }
  // front wall plate (meets cab)
  box(2.5, 0.88, 0.04, P.hullDark, [0, 1.76, 0.38]);
  box(2.0, 0.5, 0.05, PLATE, [0, 1.8, 0.36]);
  for (const x of [-0.7, 0, 0.7]) box(0.5, 0.4, 0.02, P.black, [x, 1.8, 0.385]);

  // ---------- flank panels, stripes, neon, ports ----------
  const panels: [number, number][] = [[0.3, -0.55], [-0.6, -1.55], [-1.6, -2.9]];
  for (const s of [1, -1]) {
    panels.forEach(([z0, z1], i) => {
      box(0.04, 0.5, z0 - z1, i === 1 ? PLATE : HULL, [s * 1.285, 1.85, (z0 + z1) / 2]);
      // raised border frame
      box(0.02, 0.03, z0 - z1, P.steel, [s * 1.305, 2.09, (z0 + z1) / 2]);
      box(0.02, 0.03, z0 - z1, P.steel, [s * 1.305, 1.61, (z0 + z1) / 2]);
    });
    decal(HAZ, [s * 1.302, 1.4, -1.3], [s, 0, 0], 3.2, 0.2);
    // neon trim
    lit(0.03, 0.03, 3.3, P.neonMagenta, [s * 1.31, 1.52, -1.3], 2);
    lit(0.03, 0.03, 3.3, P.neonCyan, [s * 1.31, 2.14, -1.3], 2);
    // shutter on panel 2
    box(0.03, 0.3, 0.85, P.black, [s * 1.31, 1.9, -1.075]);
    for (let k = 0; k < 4; k++) box(0.02, 0.025, 0.8, P.steel, [s * 1.325, 1.8 + k * 0.07, -1.075]);
    // gun ports
    for (const z of [-1.95, -2.3]) {
      cyl(0.07, 0.07, 0.04, 8, P.steel, [s * 1.31, 1.85, z], { rotation: [0, 0, 90] });
      cyl(0.045, 0.045, 0.05, 8, P.black, [s * 1.315, 1.85, z], { rotation: [0, 0, 90] });
    }
    // decals
    decal(LOGO, [s * 1.309, 1.86, -0.12], [s, 0, 0], 0.42, 0.42);
    decal(KANJI, [s * 1.309, 1.86, -2.65], [s, 0, 0], 0.36, 0.36);
    decal(BARCODE, [s * 1.309, 1.7, -0.95], [s, 0, 0], 0.4, 0.12);
    decal(UNIT, [s * 1.309, 1.7, -1.5], [s, 0, 0], 0.4, 0.125);
    decal(WARN, [s * 1.309, 1.7, -2.35], [s, 0, 0], 0.14, 0.14);
    // flank floodlight pod
    box(0.1, 0.12, 0.22, P.hullDark, [s * 1.33, 1.5, 0.2]);
  }

  // ---------- rivets (merged) ----------
  const rivets: THREE.BufferGeometry[] = [];
  for (const s of [1, -1])
    for (const [z0, z1] of panels)
      for (let z = z1 + 0.08; z < z0 - 0.05; z += 0.14)
        for (const y of [1.64, 2.06])
          rivets.push(new THREE.CylinderGeometry(0.014, 0.014, 0.02, 5).rotateZ(Math.PI / 2).translate(s * 1.31, y, z));
  b.part(mergeGeometries(rivets)!, P.steel, { bone, at: [0, 0, 0] });

  // ---------- rear ----------
  const zr = -3.0;
  for (const s of [1, -1]) {
    box(1.18, 0.82, 0.05, PLATE, [s * 0.61, 1.74, zr + 0.015]);
    box(0.06, 0.5, 0.06, P.steel, [s * 0.1, 1.74, zr - 0.03]); // handle
    box(0.04, 0.04, 0.1, P.steel, [s * 0.1, 1.95, zr - 0.02]);
    box(0.04, 0.04, 0.1, P.steel, [s * 0.1, 1.53, zr - 0.02]);
    lit(0.14, 0.4, 0.04, P.neonRed, [s * 1.18, 1.75, zr - 0.02], 2); // tail light
    lit(0.14, 0.05, 0.04, P.neonRed, [s * 1.18, 2.08, zr - 0.02], 1.5);
    box(0.34, 0.2, 0.03, P.black, [s * 0.65, 1.95, zr - 0.03]); // small window
    box(0.3, 0.03, 0.03, P.hazard, [s * 0.65, 1.55, zr - 0.03]);
  }
  box(0.03, 0.85, 0.06, P.black, [0, 1.74, zr - 0.01]);
  decal(HAZ, [0, 1.4, zr - 0.04], [0, 0, -1], 2.4, 0.15);
  decal(UNIT, [0, 2.05, zr - 0.045], [0, 0, -1], 0.5, 0.16);
  decal(LOGO, [0.0, 1.75, zr - 0.045], [0, 0, -1], 0.3, 0.3);

  // ---------- roof: rails, vents, conduits ----------
  for (const s of [1, -1]) {
    b.rod([s * 1.1, 2.3, -2.8], [s * 1.1, 2.3, 0.2], 0.022, P.steel, { bone });
    for (const z of [-2.8, -1.8, -0.8, 0.2]) box(0.04, 0.1, 0.04, P.steel, [s * 1.1, 2.25, z]);
    // cable conduit sweeping along roof
    b.sweep(
      [[s * 0.8, 2.24, 0.25], [s * 0.8, 2.26, -0.6], [s * 0.55, 2.26, -0.9], [s * 0.55, 2.26, -2.0], [s * 0.85, 2.24, -2.6]],
      0.032, { bone, color: P.black, sides: 6 },
    );
    for (const z of [-0.2, -1.4, -2.3]) box(0.08, 0.02, 0.05, P.hazard, [s * 0.7, 2.28, z], { rotation: [0, 0, 0] });
  }
  for (const [x, z] of [[-0.55, -2.55], [0.55, -2.55], [0.0, -0.45]] as [number, number][]) {
    box(0.4, 0.07, 0.3, P.hullDark, [x, 2.265, z]);
    for (let k = 0; k < 4; k++) box(0.34, 0.015, 0.03, P.steel, [x, 2.31, z - 0.1 + k * 0.067]);
  }

  // ---------- roof light bar at roofBarMount ----------
  const [bx, , bz] = M.roofBarMount;
  const barZ = Math.min(bz - 0.4, 0.1);
  box(1.9, 0.04, 0.3, P.hullDark, [bx, 2.24, barZ]);
  for (const s of [1, -1]) {
    box(0.06, 0.1, 0.3, P.hullDark, [s * 0.96, 2.26, barZ]);
    box(0.06, 0.04, 0.26, P.steel, [s * 0.9, 2.3, barZ]);
  }
  for (let i = 0; i < 8; i++) {
    const c = i % 2 ? P.neonBlue : P.neonRed;
    lit(0.21, 0.07, 0.22, c, [bx - 0.78 + i * 0.223, 2.275, barZ], 2.4);
    box(0.012, 0.075, 0.24, P.black, [bx - 0.78 + i * 0.223 + 0.11, 2.275, barZ]);
  }
  box(1.8, 0.012, 0.26, P.black, [bx, 2.31, barZ]);

  // ---------- turret base plate at turretRing ----------
  const [tx, ty, tz] = M.turretRing;
  cyl(0.72, 0.78, 0.05, 16, P.hullDark, [tx, ty + 0.025, tz]);
  cyl(0.6, 0.6, 0.06, 16, P.steel, [tx, ty + 0.06, tz]);
  const ringBolts: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    ringBolts.push(new THREE.CylinderGeometry(0.025, 0.025, 0.04, 6).translate(tx + Math.cos(a) * 0.67, ty + 0.07, tz + Math.sin(a) * 0.67));
  }
  b.part(mergeGeometries(ringBolts)!, P.rim, { bone, at: [0, 0, 0] });
  b.part(new THREE.TorusGeometry(0.62, 0.015, 4, 20), P.neonCyan, { bone, at: [tx, ty + 0.095, tz], rotation: [90, 0, 0] });
  glow(b.part(new THREE.TorusGeometry(0.75, 0.012, 4, 20), P.neonMagenta, { bone, at: [tx, ty + 0.055, tz], rotation: [90, 0, 0] }), 2);
  for (const a of [0, 90, 180, 270]) {
    const r = (a * Math.PI) / 180;
    box(0.1, 0.07, 0.12, P.hullDark, [tx + Math.cos(r) * 0.82, ty + 0.035, tz + Math.sin(r) * 0.82], { rotation: [0, -a, 0] });
  }

  // ---------- floodlights & antennas ----------
  for (const s of [1, -1]) {
    box(0.22, 0.14, 0.18, P.hullDark, [s * 1.12, 2.3, -2.75]);
    box(0.04, 0.12, 0.04, P.steel, [s * 1.12, 2.24, -2.75]);
    glow(box(0.18, 0.1, 0.03, P.white, [s * 1.12, 2.3, -2.85]), 2.2);
    // antennas
    b.rod([s * 1.0, 2.2, -2.95], [s * 1.0 + s * 0.05, 2.3 + 0.0, -2.95], 0.01, P.black, { bone });
    b.rod([s * 0.95, 2.25, -2.9], [s * 0.95, 2.3, -2.9], 0.012, P.black, { bone });
  }
  b.rod([1.0, 2.25, -2.9], [1.02, 2.3, -2.9], 0.012, P.black, { bone });
  glow(b.part(new THREE.SphereGeometry(0.02, 5, 4), P.neonRed, { bone, at: [1.02, 2.3, -2.9] }), 2);
  glow(b.part(new THREE.SphereGeometry(0.02, 5, 4), P.neonCyan, { bone, at: [-1.0, 2.3, -2.95] }), 2);
  box(0.12, 0.05, 0.12, P.steel, [0.0, 2.24, -0.1]);
}
```

<!-- call: cabAndFront -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildCabAndFront({ b, J, P, M }: Ctx) {
  const bone = J.body;
  void M;

  // ---------- helpers ----------
  const bx = (w: number, h: number, d: number, color: any, at: number[], o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, ...o });
  const side = (fn: (s: number) => void) => {
    for (const s of [1, -1]) fn(s);
  };
  // point on the raked windshield plane: u 0 (bottom) .. 1 (top), off = meters out along the normal
  const gp = (x: number, u: number, off = 0): number[] => [
    x,
    1.8 + 0.4 * u + 0.832 * off,
    1.75 - 0.6 * u + 0.555 * off,
  ];
  const WS_ANGLE = 33.7;

  // ---------- paints ----------
  const hullPaint = paint((p, n) => {
    let c = mix(P.hull, P.plate, smoothstep(0.4, 0.8, noise(p, 0.3, 2)) * 0.6 + (n.y > 0.5 ? 0.25 : 0));
    c = mix(c, P.black, smoothstep(1.52, 1.3, p.y) * 0.55);
    return mix(c, "#5a5240", smoothstep(0.62, 0.8, noise(p, 0.08, 7)) * 0.25);
  });
  const plateTone = paint((p, n) => {
    const c = mix(P.plate, P.hull, smoothstep(0.3, 0.7, noise(p, 0.2, 5)) * 0.7);
    return mix(c, P.white, n.y > 0.7 ? 0.1 : 0);
  });
  const hazardPaint = paint((_p, _n, s) => {
    const k = Math.floor((s[0] + s[1]) / 0.08);
    return ((k % 2) + 2) % 2 === 0 ? P.hazard : P.black;
  });

  // ---------- textures ----------
  const LOGO = svg(
    `<svg viewBox="0 0 60 70" xmlns="http://www.w3.org/2000/svg">
      <path d="M30 3 L56 12 V38 Q56 58 30 67 Q4 58 4 38 V12 Z" fill="#0a0a0e" stroke="#f2c200" stroke-width="3.5" stroke-linejoin="round"/>
      <path d="M30 3 L56 12 V20 H4 V12 Z" fill="#ff2a3a"/>
      <g stroke="#e8ecf2" stroke-width="4" stroke-linecap="round" fill="none">
        <path d="M15 30 H45"/><path d="M30 24 V56"/><path d="M18 42 H42"/><path d="M21 54 L30 46 L39 54"/>
      </g>
    </svg>`,
    { size: 256 },
  );
  const TEXT = svg(
    `<svg viewBox="0 0 220 40" xmlns="http://www.w3.org/2000/svg">
      <text x="110" y="29" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="27" letter-spacing="2" fill="#e8ecf2">RIOT CONTROL</text>
    </svg>`,
    { size: 512 },
  );
  const GRILLE = svg(
    `<svg viewBox="0 0 100 20" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="20" fill="#0a0a0e"/>
      <g stroke="#7b8394" stroke-width="1.6">
        ${Array.from({ length: 13 }, (_, i) => `<path d="M${i * 8 + 2} 0 V20"/>`).join("")}
        ${Array.from({ length: 4 }, (_, i) => `<path d="M0 ${i * 5 + 2} H100"/>`).join("")}
      </g>
    </svg>`,
    { size: 256 },
  );
  const STREAK = svg(
    `<svg viewBox="0 0 100 36" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 36 L34 0 H40 L16 36Z" fill="#2c7a96"/>
      <path d="M44 36 L62 8 H65 L47 36Z" fill="#2c7a96"/>
      <path d="M70 36 L88 6 H93 L75 36Z" fill="#256a84"/>
    </svg>`,
    { size: 256 },
  );
  const GRILLE_SIZE = [0.8, 0.16];

  // ---------- main masses ----------
  b.extrude(
    [[1.6, 1.3], [3.0, 1.3], [3.0, 1.55], [2.3, 1.8], [1.6, 1.8]],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.4, bevel: 0.03, color: hullPaint, bone, name: "hood" },
  );
  b.extrude(
    [[0.4, 1.3], [1.75, 1.3], [1.75, 1.8], [1.15, 2.2], [0.4, 2.2]],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.4, bevel: 0.03, color: hullPaint, bone, name: "cabin" },
  );

  // ---------- glass ----------
  bx(2.0, 0.02, 0.76, P.glass, [0, 2.0 + 0.0117, 1.45 + 0.0078], { rotation: [WS_ANGLE, 0, 0], name: "windshield" });
  b.part(new THREE.PlaneGeometry(2.0, 0.72), "#ffffff", {
    bone,
    at: [0, 2.0 + 0.027 * 0.832, 1.45 + 0.027 * 0.555],
    dir: [0, 0.832, 0.555],
    axis: "z",
    texture: STREAK,
    name: "windshieldStreaks",
  });
  side((s) => {
    b.extrude([[0.6, 1.88], [1.6, 1.88], [1.27, 2.12], [0.6, 2.12]], {
      at: [s * 1.205, 0, 0], x: [0, 0, 1], thickness: 0.02, color: P.glass, bone, name: "sideGlass",
    });
    // A-pillars + frame
    b.rod(gp(s * 1.03, 0, 0.02), gp(s * 1.03, 1, 0.02), 0.055, P.hullDark, { bone, sides: 6 });
    // door armor plate (chamfered)
    b.extrude([[0.6, 1.4], [1.62, 1.4], [1.68, 1.46], [1.68, 1.76], [1.62, 1.82], [0.6, 1.82]], {
      at: [s * 1.2, 0, 0], x: [0, 0, 1], thickness: 0.03, color: plateTone, bone, name: "doorPlate",
    });
    // sill hazard
    b.extrude([[0.45, 1.3], [2.95, 1.3], [2.95, 1.38], [0.45, 1.38]], {
      at: [s * 1.2, 0, 0], x: [0, 0, 1], thickness: 0.04, color: hazardPaint, bone, name: "sill",
    });
    // hood side armor plate
    b.extrude([[1.8, 1.4], [2.85, 1.4], [2.92, 1.46], [2.85, 1.52], [1.8, 1.52]], {
      at: [s * 1.2, 0, 0], x: [0, 0, 1], thickness: 0.04, color: plateTone, bone, name: "hoodPlate",
    });
    for (let i = 0; i < 4; i++)
      b.part(new THREE.SphereGeometry(0.018, 6, 4), P.steel, { bone, at: [s * 1.222, 1.46, 1.95 + i * 0.28] });
    // door decals
    const dx = s * 1.2335;
    b.part(new THREE.PlaneGeometry(0.3, 0.35), "#ffffff", { bone, at: [dx, 1.6, 1.5], dir: [s, 0, 0], axis: "z", texture: LOGO, name: "logoDecal" });
    b.part(new THREE.PlaneGeometry(0.72, 0.131), "#ffffff", { bone, at: [dx, 1.52, 1.0], dir: [s, 0, 0], axis: "z", texture: TEXT, name: "riotText" });
    // handle
    bx(0.16, 0.03, 0.045, P.steel, [s * 1.235, 1.7, 0.78], { name: "handle" });
    bx(0.03, 0.05, 0.03, P.hullDark, [s * 1.228, 1.7, 0.7]);
    bx(0.03, 0.05, 0.03, P.hullDark, [s * 1.228, 1.7, 0.86]);
    // flank neon
    glow(bx(2.45, 0.025, 0.02, P.neonCyan, [s * 1.222, 1.345, 1.72], { name: "neonFlank" }), 1.6);
    glow(bx(0.5, 0.02, 0.02, P.neonMagenta, [s * 1.222, 1.78, 2.55]), 1.4);

    // mirrors
    b.rod([s * 1.18, 1.93, 1.52], [s * 1.26, 2.0, 1.62], 0.014, P.steel, { bone, sides: 5 });
    bx(0.05, 0.26, 0.19, P.hullDark, [s * 1.27, 2.02, 1.66], { name: "mirror" });
    glow(bx(0.03, 0.2, 0.012, P.neonMagenta, [s * 1.27, 2.02, 1.762]), 1.4);

    // hood vents
    const n = [0, 0.94, 0.336];
    const f = [0, -0.336, 0.94];
    const c = [s * 0.62, 1.675, 2.65];
    bx(0.5, 0.02, 0.42, P.black, [c[0] + n[0] * 0.012, c[1] + n[1] * 0.012, c[2] + n[2] * 0.012], { rotation: [19.65, 0, 0], name: "ventBase" });
    for (let i = 0; i < 4; i++) {
      const t = -0.15 + 0.1 * i;
      bx(0.46, 0.025, 0.035, P.steel, [
        c[0],
        c[1] + f[1] * t + n[1] * 0.025,
        c[2] + f[2] * t + n[2] * 0.025,
      ], { rotation: [19.65 + 25, 0, 0], name: "ventSlat" });
    }

    // headlight slits
    glow(bx(0.62, 0.05, 0.02, P.neonCyan, [s * 0.9, 1.5, 3.008], { name: "headSlitOuter" }), 2);
    glow(bx(0.3, 0.04, 0.022, P.white, [s * 0.58, 1.5, 3.01], { name: "headSlitInner" }), 2.2);
    // hood-top lamp pods
    b.part(new THREE.CylinderGeometry(0.07, 0.08, 0.1, 8), P.hullDark, { bone, at: [s * 0.55, 1.815, 2.3] });
    glow(b.part(new THREE.CylinderGeometry(0.055, 0.055, 0.03, 8), P.neonYellow, { bone, at: [s * 0.55, 1.87, 2.3] }), 1.8);
    // antenna cluster
    b.rod([s * 1.0, 2.2, 0.55], [s * 1.0, 2.52, 0.55], 0.012, P.steel, { bone, sides: 5 });
    b.rod([s * 0.88, 2.2, 0.72], [s * 0.88, 2.42, 0.72], 0.01, P.steel, { bone, sides: 5 });
    bx(0.1, 0.04, 0.1, P.hullDark, [s * 1.0, 2.215, 0.55]);
    glow(b.part(new THREE.SphereGeometry(0.02, 6, 4), P.neonRed, { bone, at: [s * 1.0, 2.53, 0.55] }), 2.4);
    glow(b.part(new THREE.SphereGeometry(0.016, 6, 4), P.neonBlue, { bone, at: [s * 0.88, 2.43, 0.72] }), 2.4);
    // wiper
    b.rod(gp(s * 0.9, 0.07, 0.03), gp(s * 0.12, 0.2, 0.03), 0.012, P.black, { bone, sides: 5 });
    b.rod(gp(s * 0.9, 0.07, 0.03), gp(s * 0.9, 0.07, 0.01), 0.02, P.steel, { bone, sides: 5 });
  });

  // ---------- front fascia ----------
  bx(2.4, 0.26, 0.03, P.hullDark, [0, 1.42, 2.995], { name: "fascia" });
  b.part(new THREE.PlaneGeometry(GRILLE_SIZE[0], GRILLE_SIZE[1]), "#ffffff", {
    bone, at: [0, 1.4, 3.012], dir: [0, 0, 1], axis: "z", texture: GRILLE, name: "grille",
  });
  glow(bx(0.72, 0.015, 0.012, P.neonCyan, [0, 1.3, 3.016], { name: "grilleLed" }), 2);
  glow(bx(0.72, 0.012, 0.012, P.neonCyan, [0, 1.495, 3.016]), 1.6);
  // hood crest neon + center plate
  glow(bx(2.0, 0.02, 0.03, P.neonCyan, [0, 1.808, 2.3], { name: "crestNeon" }), 1.8);
  bx(0.5, 0.02, 0.6, P.plate, [0, 1.81, 1.95], { name: "hoodPlateCenter" });
  bx(0.25, 0.012, 0.35, P.hazard, [0, 1.826, 1.95], { name: "hoodHazard" });

  // ---------- roof, visor, lamps ----------
  bx(1.8, 0.03, 0.22, P.plate, [0, 2.215, 1.0], { name: "roofPanel" });
  bx(2.3, 0.04, 0.4, P.hullDark, [0, 2.23, 1.3], { rotation: [8, 0, 0], name: "visor" });
  side((s) => bx(0.04, 0.1, 0.3, P.hullDark, [s * 1.14, 2.2, 1.28], { name: "visorBrace" }));
  for (const x of [-0.75, -0.25, 0.25, 0.75]) {
    bx(0.3, 0.08, 0.06, P.black, [x, 2.18, 1.49]);
    glow(bx(0.25, 0.05, 0.015, P.neonYellow, [x, 2.18, 1.525], { name: "visorLamp" }), 2);
  }
  // roof vents
  side((s) => {
    bx(0.3, 0.05, 0.16, P.hullDark, [s * 0.65, 2.235, 0.55]);
    bx(0.26, 0.015, 0.12, P.black, [s * 0.65, 2.265, 0.55]);
  });
  // sat dish
  b.part(new THREE.CylinderGeometry(0.1, 0.02, 0.05, 8), P.steel, { bone, at: [0, 2.26, 0.72], rotation: [20, 0, 0] });
  b.rod([0, 2.215, 0.72], [0, 2.25, 0.72], 0.012, P.steel, { bone, sides: 5 });
}
```