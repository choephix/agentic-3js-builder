<!-- call: plan -->

```json
{
  "name": "Arasaka-style Riot Interceptor RC-9",
  "description": "A heavy corporate riot-control interceptor truck with a roof water cannon, armored cab, and glowing neon light bars in a Cyberpunk 2077 style.",
  "builderName": "riotInterceptor",
  "size": [2.6, 2.7, 6.4],
  "layout": "Low, wide, aggressive armored truck facing +Z. Front: wedge push-bar bumper with neon strip, sloped hood, angular armored cab with slit windshield (cyan-lit visor) and roof light bar. Middle: cab roof and flanks with corp decals. Rear: boxy armored troop bed with hazard stripes, rear water tank, roof turret ring at the bed front carrying a chunky water cannon pointing +Z. Four chunky wheels with rim neon rings under flared arches rest on the floor. Style: dark gunmetal hull with yellow/black hazard trim, magenta and cyan neon bars, emissive glow on lights, angular facets, panel lines, scuffs, corporate logos and Japanese-style katakana labels drawn as SVG textures.",
  "palette": {
    "hull": "#2b303b",
    "hullDark": "#14171d",
    "hullLight": "#4a5262",
    "trim": "#f2c80f",
    "black": "#0a0a0d",
    "neonCyan": "#2ff3ff",
    "neonMagenta": "#ff2bd6",
    "neonRed": "#ff2a3c",
    "glass": "#0e2a3a",
    "rubber": "#16161a",
    "steel": "#8a93a3",
    "water": "#5fd4ff",
    "white": "#e8ecf2"
  },
  "mounts": {
    "chassisTop": [0, 1.2, 0],
    "cabRoof": [0, 2.0, 1.3],
    "bedFront": [0, 1.2, -0.4],
    "turretRing": [0, 2.35, -0.9],
    "axleFront": [0, 0.55, 1.9],
    "axleRear": [0, 0.55, -1.9],
    "bumperMount": [0, 0.7, 3.2]
  },
  "joints": [
    { "name": "body", "at": [0, 1.0, 0], "dir": [0, 0, 1], "role": "spine" },
    { "name": "turretYaw", "parent": "body", "at": [0, 2.35, -0.9], "dir": [0, 1, 0], "role": "hinge", "group": "turret" },
    { "name": "cannonPitch", "parent": "turretYaw", "at": [0, 2.65, -0.9], "dir": [0, 0, 1], "role": "hinge", "group": "turret" },
    { "name": "wheelFL", "parent": "body", "at": [1.15, 0.55, 1.9], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelFR", "parent": "body", "at": [-1.15, 0.55, 1.9], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelRL", "parent": "body", "at": [1.15, 0.55, -1.9], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelRR", "parent": "body", "at": [-1.15, 0.55, -1.9], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" }
  ],
  "parts": [
    {
      "id": "chassisFront",
      "builds": "Lower hull and front end: ladder-frame underbody, skid plate, sloped hood with vents and panel paint (panelled hull metal), headlight slits with cyan glow, grille with magenta neon strip, heavy wedge push-bar bumper with hazard stripe texture, tow hooks, fender flares over the front wheel arches, front-bumper neon bar. Paint scuffs and corp logo decal on hood.",
      "box": [[-1.3, 0.3, 1.0], [1.3, 1.6, 3.4]],
      "attaches": "Meets cab at z=1.0 along chassisTop; bumper at bumperMount; arches around axleFront.",
      "joints": ["body"],
      "floor": false,
      "budget": 170
    },
    {
      "id": "cab",
      "builds": "Armored cab: angular faceted box body with sloped windshield slit and side windows in dark glass with cyan reflections drawn as SVG gradient, door seams, handles, side mirrors with tiny lights, roof with neon light bar (alternating magenta/cyan emissive segments), roof antennas, vents, wing-mounted spotlights, door decals (corp logo, katakana RIOT CONTROL text), hazard-stripe sill.",
      "box": [[-1.25, 1.2, -0.4], [1.25, 2.2, 1.6]],
      "attaches": "Sits on chassisFront rear edge at chassisTop; rear wall meets bedFront.",
      "joints": ["body"],
      "floor": false,
      "budget": 170
    },
    {
      "id": "bed",
      "builds": "Rear armored troop box and tank section: boxy riveted panelled shell with hazard stripes at the rear, rear doors with handles and light clusters in red neon, side vents, roof water tank dome with pipes and gauges (clockwork-style gauge texture), side storage lockers, glowing blue water level window, rear bumper, license plate with cyberpunk text, side neon underglow strips in magenta.",
      "box": [[-1.3, 0.4, -3.2], [1.3, 2.3, -0.4]],
      "attaches": "Front wall meets cab at bedFront; turret ring at turretRing on roof; wheel arches at axleRear.",
      "joints": ["body"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "turret",
      "builds": "Roof turret ring at turretRing: lathe base ring, armored rotating housing on turretYaw, operator shield plate with slit, chunky water cannon barrel on cannonPitch (thick tube with ribbed bands, flared nozzle with glowing water-blue tip, supply hoses coiled to the tank), side cyan neon strips, ammo/pressure gauge, small camera pod with red lens. Barrel points +Z.",
      "box": [[-0.7, 2.2, -1.9], [0.7, 2.7, 0.7]],
      "attaches": "Base ring sits on bed roof at turretRing; hose runs to the tank dome on bed.",
      "joints": ["turretYaw", "cannonPitch"],
      "floor": false,
      "budget": 160
    },
    {
      "id": "wheels",
      "builds": "Four chunky wheels on wheelFL/FR/RL/RR joints: dark rubber tyres with tread blocks, steel rims with bolts, glowing cyan rim rings, hub caps with corp logo; axles, suspension arms and shock springs (coil) to the chassis, mud flaps, brake discs. Wheels centred on axle lines, radius 0.55, touching floor.",
      "box": [[-1.3, 0.0, -2.5], [1.3, 1.1, 2.5]],
      "attaches": "Hubs at axleFront and axleRear at x=+-1.15; suspension arms meet chassis frame.",
      "joints": ["wheelFL", "wheelFR", "wheelRL", "wheelRR", "body"],
      "floor": true,
      "budget": 150
    }
  ]
}
```

<!-- call: chassisFront -->

```ts
import * as THREE from "three";
import { paint, svg, countershade, stripes, mottle } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";

export function buildChassisFront({ b, J, P, M }: any) {
  const bone = J.body;
  const box = (w: number, h: number, d: number, color: any, at: number[], opts: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, ...opts });

  const HULL = panelled(
    countershade(mottle(P.hull, P.hullLight, { size: 0.25, seed: 3 }), P.hullDark, { level: -0.3 }),
    { size: 0.3, rivets: 0.08 },
  );
  const DARK = metal("iron");

  // ladder frame underbody
  for (const s of [1, -1]) {
    box(0.14, 0.2, 2.4, P.hullDark, [s * 0.7, 0.42, 2.2]);
  }
  for (const z of [1.3, 2.0, 2.7]) box(1.5, 0.12, 0.14, P.black, [0, 0.45, z]);
  // skid plate
  b.part(new THREE.BoxGeometry(1.5, 0.06, 1.2), DARK, { bone, at: [0, 0.34, 2.6], rotation: [-6, 0, 0] });

  // main lower body
  box(2.5, 0.55, 2.3, HULL, [0, 0.82, 2.2]);
  // sloped hood
  const hood = b.frustumBox([0, 1.1, 1.05], [0, 1.1, 3.0], [2.4, 0.5], [2.2, 0.3], { bone, color: HULL });
  b.part(new THREE.BoxGeometry(2.2, 0.08, 1.9), HULL, { bone, at: [0, 1.5, 2.0], rotation: [8, 0, 0] });
  // hood vents
  for (const s of [1, -1])
    for (let i = 0; i < 4; i++) {
      box(0.5, 0.03, 0.06, P.black, [s * 0.6, 1.5 - 0.0 + 0.0, 1.5 + i * 0.12 + 0.0], { rotation: [8, 0, 0] });
      box(0.5, 0.012, 0.03, P.neonCyan, [s * 0.6, 1.54, 1.5 + i * 0.12], { rotation: [8, 0, 0] });
    }
  // center hood stripe + logo decal
  const logo = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="none" stroke="#ff2a3c" stroke-width="7"/><path d="M50 18 L78 78 L62 78 L50 50 L38 78 L22 78Z" fill="#ff2a3c"/><text x="50" y="96" font-size="14" text-anchor="middle" fill="#e8ecf2" font-family="sans-serif">アラサカ</text></svg>`,
    { size: 256 },
  );
  b.part(new THREE.PlaneGeometry(0.7, 0.7), "#ffffff", {
    bone, at: [0, 1.56, 2.0], dir: [0, 1, -0.14], axis: "z", up: [0, 0, 1], texture: logo,
  });

  // grille + magenta neon
  box(1.7, 0.4, 0.08, P.black, [0, 0.95, 3.38]);
  for (let i = 0; i < 5; i++) box(1.6, 0.025, 0.04, P.steel, [0, 0.8 + i * 0.08, 3.42]);
  glow(box(1.7, 0.05, 0.06, P.neonMagenta, [0, 1.2, 3.4]), 2);

  // headlight slits
  for (const s of [1, -1]) {
    glow(box(0.6, 0.07, 0.06, P.neonCyan, [s * 0.85, 1.2, 3.36]), 2);
    box(0.7, 0.14, 0.05, P.black, [s * 0.85, 1.2, 3.33]);
  }

  // wedge push-bar bumper
  const haz = stripes(P.trim, P.black, { size: 0.16, axis: "x", width: 0.5, wobble: 0 });
  b.extrude([[0, 0], [2.5, 0], [2.3, 0.5], [0.2, 0.5]], {
    at: [-1.25, 0.45, 3.4], x: [1, 0, 0], y: [0, 0.3, 1], thickness: 0.3, color: haz, bone, bevel: 0.02,
  });
  glow(box(2.2, 0.06, 0.05, P.neonCyan, [0, 0.74, 3.62]), 2);
  for (const s of [1, -1]) {
    box(0.12, 0.5, 0.12, P.hullDark, [s * 0.9, 0.6, 3.25]);
    // tow hooks
    b.sweep([[s * 0.5, 0.5, 3.5], [s * 0.5, 0.42, 3.7], [s * 0.5, 0.36, 3.6]], 0.03, { bone, color: P.steel });
  }

  // fender flares around front arches (axle z 1.9)
  for (const s of [1, -1]) {
    const arch = b.lathe(
      [[0.64, -0.2], [0.78, -0.2], [0.78, 0.2], [0.64, 0.2]],
      { at: [s * 1.2, M.axleFront[1], 1.9], axis: [1, 0, 0], segments: 10, color: P.hullDark, bone },
    );
    box(0.3, 0.1, 1.6, P.hullDark, [s * 1.3, 1.22, 1.9]);
    box(0.06, 0.4, 0.1, P.trim, [s * 1.32, 0.9, 2.75]);
  }
  // side skirts hazard
  for (const s of [1, -1]) box(0.06, 0.12, 2.0, haz, [s * 1.28, 0.55, 2.0]);
}
```

<!-- call: wheels -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { coil, gearGeometry, metal } from "agentic-3js-builder/kits/clockwork";

export function buildWheels({ b, J, P, M }: Ctx) {
  const R = 0.55;
  const W = 0.4;
  const HUBX = 1.15;
  const AX = [M.axleFront[2], M.axleRear[2]];

  const treadPaint = paint((p, n) => {
    const k = noise(p, 0.05, 3);
    const c = mix("#16161a", "#2a2a31", smoothstep(0.4, 0.8, k));
    const dirt = smoothstep(0.35, -0.5, p.y - 0.2) * 0.35;
    return mix(c, "#4a4033", dirt * noise(p, 0.12, 7));
  });
  const rimPaint = metal("steel", { tarnish: 0.3 });

  const logo = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#14171d" stroke="#f2c80f" stroke-width="4"/>
    <path d="M32 10 L48 50 L40 50 L32 30 L24 50 L16 50Z" fill="#ff2a3c"/>
    <path d="M22 44h20" stroke="#e8ecf2" stroke-width="3"/></svg>`,
    { size: 128 },
  );
  const hazard = svg(
    `<svg viewBox="0 0 32 32"><rect width="32" height="32" fill="#f2c80f"/>
    <path d="M0 8L8 0H16L0 16ZM0 24L24 0H32L0 32ZM16 32L32 16V24L24 32Z" fill="#0a0a0d"/></svg>`,
    { size: 64 },
  );
  const katakana = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#0a0a0d"/>
    <text x="32" y="22" text-anchor="middle" font-size="16" font-weight="bold" fill="#2ff3ff">ARASAKA</text></svg>`,
    { size: 128 },
  );

  const wheels: [string, number, number][] = [];
  for (const z of AX) {
    wheels.push([z > 0 ? "FL" : "RL", 1, z]);
    wheels.push([z > 0 ? "FR" : "RR", -1, z]);
  }

  for (const [tag, s, z] of wheels) {
    const j = J["wheel" + tag];
    const at = new THREE.Vector3(s * HUBX, R, z);
    const out = [s, 0, 0] as [number, number, number];
    // tyre: lathe about x axis
    b.lathe(
      [
        [R - 0.22, -W / 2],
        [R - 0.05, -W / 2],
        [R, -W / 2 + 0.07],
        [R, W / 2 - 0.07],
        [R - 0.05, W / 2],
        [R - 0.22, W / 2],
      ],
      { at, axis: out, segments: 20, color: treadPaint, bone: j, name: "tyre" + tag },
    );
    // tread blocks
    const blocks: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2;
      const g = new THREE.BoxGeometry(W * 0.9, 0.05, 0.1);
      g.rotateX(a);
      g.translate(0, Math.cos(a) * (R + 0.01), Math.sin(a) * (R + 0.01));
      g.translate(at.x, at.y, at.z);
      blocks.push(g);
    }
    // merge manually
    const merged = mergeSimple(blocks);
    b.part(merged, P.black, { bone: j, at: [0, 0, 0], name: "treads" + tag });
    // rim dish
    b.part(new THREE.CylinderGeometry(0.33, 0.33, 0.3, 12), rimPaint, {
      bone: j, at: at.clone().add(new THREE.Vector3(s * 0.02, 0, 0)), dir: out,
    });
    // outer face
    const face = at.clone().add(new THREE.Vector3(s * (W / 2 + 0.005), 0, 0));
    b.part(new THREE.CylinderGeometry(0.34, 0.3, 0.04, 12), P.hullDark, { bone: j, at: face, dir: out });
    // glowing cyan ring
    glow(
      b.part(new THREE.TorusGeometry(0.29, 0.02, 5, 20), P.neonCyan, {
        bone: j, at: face.clone().add(new THREE.Vector3(s * 0.03, 0, 0)), dir: out, axis: "z",
      }),
      1.6,
    );
    // hub cap with logo
    b.part(new THREE.CylinderGeometry(0.13, 0.14, 0.05, 10), P.steel, {
      bone: j, at: face.clone().add(new THREE.Vector3(s * 0.04, 0, 0)), dir: out,
    });
    b.part(new THREE.CircleGeometry(0.11, 16), "#ffffff", {
      bone: j, at: face.clone().add(new THREE.Vector3(s * 0.07, 0, 0)), dir: out, axis: "z", texture: logo,
    });
    // bolts
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.04, 6), P.white, {
        bone: j,
        at: face.clone().add(new THREE.Vector3(s * 0.05, Math.cos(a) * 0.2, Math.sin(a) * 0.2)),
        dir: out,
      });
    }
    // brake disc inside
    b.part(new THREE.CylinderGeometry(0.26, 0.26, 0.025, 16), P.steel, {
      bone: j, at: at.clone().add(new THREE.Vector3(-s * 0.12, 0, 0)), dir: out,
    });
    // caliper
    b.part(new THREE.BoxGeometry(0.08, 0.1, 0.16), P.neonRed, {
      bone: j.parent ? J.body : J.body, at: at.clone().add(new THREE.Vector3(-s * 0.12, 0.2, 0.05 * Math.sign(z))),
    });
    // axle stub
    b.rod([s * 0.55, R, z], [s * HUBX, R, z], 0.07, { color: P.steel, bone: J.body });
    // suspension arms (upper & lower A-arms)
    for (const dz of [-0.25, 0.25]) {
      b.rod([s * 0.5, 0.95, z + dz * 0.6], [s * 0.98, R + 0.12, z + dz * 0.2], 0.04, { color: P.hullLight, bone: J.body });
    }
    b.rod([s * 0.5, 0.45, z], [s * 0.98, R - 0.15, z], 0.045, { color: P.hullLight, bone: J.body });
    // shock spring
    b.rod([s * 0.9, 0.48, z + 0.1], [s * 0.78, 1.05, z + 0.1], 0.035, { color: P.black, bone: J.body });
    b.sweep(coil([s * 0.9, 0.48, z - 0.1], [s * 0.78, 1.05, z - 0.1], 0.05, 6), 0.012, {
      color: P.trim, bone: J.body, sides: 5,
    });
    // mud flap behind wheel
    const fz = z - 0.58;
    b.part(new THREE.BoxGeometry(0.34, 0.3, 0.025), "#ffffff", {
      bone: J.body, at: [s * 1.1, 0.3, fz], dir: [0, 0, 1], axis: "z", texture: hazard,
    });
    b.part(new THREE.BoxGeometry(0.36, 0.07, 0.03), P.black, { bone: J.body, at: [s * 1.1, 0.5, fz] });
    b.part(new THREE.PlaneGeometry(0.3, 0.15), "#ffffff", {
      bone: J.body, at: [s * 1.1, 0.33, fz - 0.016 * 1], dir: [0, 0, -1], axis: "z", texture: katakana,
    });
  }
  // cross axle beams
  for (const z of AX) {
    b.rod([-0.6, 0.62, z], [0.6, 0.62, z], 0.08, { color: P.hullDark, bone: J.body });
    b.part(new THREE.SphereGeometry(0.17, 8, 6), P.hullLight, { bone: J.body, at: [0, 0.62, z] });
  }
}

function mergeSimple(geos: THREE.BufferGeometry[]) {
  let pos: number[] = [];
  let nor: number[] = [];
  let idx: number[] = [];
  let base = 0;
  for (const g of geos) {
    const p = g.getAttribute("position");
    const n = g.getAttribute("normal");
    for (let i = 0; i < p.count; i++) {
      pos.push(p.getX(i), p.getY(i), p.getZ(i));
      nor.push(n.getX(i), n.getY(i), n.getZ(i));
    }
    const ix = g.getIndex()!;
    for (let i = 0; i < ix.count; i++) idx.push(ix.getX(i) + base);
    base += p.count;
  }
  const m = new THREE.BufferGeometry();
  m.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  m.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  m.setIndex(idx);
  return m;
}
```

<!-- call: turret -->

```ts
import * as THREE from "three";
import { paint, svg, mix, smoothstep, noise, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, gaugeTexture } from "agentic-3js-builder/kits/clockwork";

export function buildTurret({ b, J, P, M }: Ctx) {
  const yaw = J.turretYaw;
  const pitch = J.cannonPitch;
  const [cx, cy, cz] = M.turretRing;
  const R = rng(11);

  const hullPaint = paint((p, n) => {
    const base = mix(P.hull, P.hullLight, smoothstep(0.2, 1, n.y) * 0.6);
    const scuff = noise(p, 0.06, 4);
    return mix(base, P.hullDark, smoothstep(0.55, 0.8, scuff) * 0.6);
  });
  const STEEL = metal("steel", { tarnish: 0.3 });

  const hazard = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#f2c80f"/>${[0, 1, 2, 3, 4, 5, 6, 7]
      .map((i) => `<path d="M${i * 16 - 8} 16 L${i * 16} 0 L${i * 16 + 8} 0 L${i * 16} 16Z" fill="#0a0a0d"/>`)
      .join("")}</svg>`,
    { size: 128 },
  );
  const katakana = svg(
    `<svg viewBox="0 0 64 24"><rect width="64" height="24" fill="#14171d"/><text x="32" y="17" text-anchor="middle" font-size="14" font-weight="bold" fill="#2ff3ff">鎮圧 RC9</text></svg>`,
    { size: 128 },
  );
  const lensTex = svg(
    `<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="15" fill="#0a0a0d"/><circle cx="16" cy="16" r="10" fill="#ff2a3c"/><circle cx="12" cy="12" r="3" fill="#fff"/></svg>`,
    { size: 64 },
  );

  // base ring (lathe)
  b.lathe(
    [[0, 0], [0.62, 0], [0.62, 0.05], [0.55, 0.1], [0.5, 0.1], [0, 0.1]],
    { at: [cx, cy - 0.12, cz], bone: J.body, color: hullPaint, segments: 16 },
  );
  b.lathe(
    [[0.5, 0], [0.56, 0], [0.56, 0.04], [0.5, 0.04]],
    { at: [cx, cy - 0.02, cz], bone: J.body, color: P.steel, segments: 16 },
  );
  // yellow ring stripe
  b.part(new THREE.CylinderGeometry(0.585, 0.585, 0.04, 16, 1, true), P.trim, {
    bone: J.body, at: [cx, cy - 0.08, cz], texture: hazard,
  });
  // bolts around ring
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.03, 6), P.steel, {
      bone: J.body, at: [cx + Math.sin(a) * 0.53, cy - 0.01, cz + Math.cos(a) * 0.53],
    });
  }

  // housing
  b.lathe(
    [[0, 0], [0.45, 0], [0.45, 0.14], [0.36, 0.3], [0, 0.3]],
    { at: [cx, cy, cz], bone: yaw, color: hullPaint, segments: 8 },
  );
  b.part(new THREE.BoxGeometry(0.8, 0.12, 0.7), hullPaint, { bone: yaw, at: [cx, cy + 0.06, cz - 0.05] });
  b.part(new THREE.BoxGeometry(0.5, 0.2, 0.5), P.hullDark, { bone: yaw, at: [cx, cy + 0.22, cz - 0.1] });
  // side cyan neon
  for (const s of [1, -1]) {
    glow(b.part(new THREE.BoxGeometry(0.025, 0.04, 0.5), P.neonCyan, { bone: yaw, at: [cx + s * 0.405, cy + 0.12, cz - 0.05] }), 1.6);
    b.part(new THREE.BoxGeometry(0.03, 0.14, 0.12), P.steel, { bone: yaw, at: [cx + s * 0.41, cy + 0.16, cz + 0.3] });
  }

  // operator shield
  const shield = b.extrude(
    [[-0.38, 0], [0.38, 0], [0.32, 0.38], [-0.32, 0.38]],
    { at: [cx, cy + 0.1, cz + 0.28], x: [1, 0, 0], thickness: 0.05, bevel: 0.01, color: hullPaint, bone: yaw },
  );
  glow(b.part(new THREE.BoxGeometry(0.34, 0.035, 0.02), P.neonCyan, { bone: yaw, at: [cx, cy + 0.34, cz + 0.31] }), 1.3);
  b.part(new THREE.BoxGeometry(0.4, 0.08, 0.02), P.trim, { bone: yaw, at: [cx, cy + 0.16, cz + 0.31], texture: hazard });
  b.part(new THREE.PlaneGeometry(0.2, 0.075), "#ffffff", {
    bone: yaw, at: [cx, cy + 0.44, cz + 0.2], dir: [0, 0, 1], axis: "z", texture: katakana,
  });
  void shield;

  // cannon mount cradle and trunnions
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.06, 0.26, 0.34), P.hullLight, { bone: yaw, at: [cx + s * 0.2, cy + 0.38, cz + 0.08] });
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.05, 8), P.steel, { bone: pitch, at: [cx + s * 0.17, cy + 0.3, cz + 0.08], dir: [1, 0, 0] });
  }
  // barrel
  const by = cy + 0.3;
  b.part(new THREE.BoxGeometry(0.28, 0.28, 0.4), P.hullDark, { bone: pitch, at: [cx, by, cz + 0.05] });
  b.rod([cx, by, cz + 0.15], [cx, by, cz + 0.55], 0.1, STEEL, { bone: pitch, sides: 8 });
  b.rod([cx, by, cz + 0.55], [cx, by, cz + 0.85], [0.09, 0.07], P.hull, { bone: pitch, sides: 8 });
  for (let i = 0; i < 4; i++) {
    const z = cz + 0.22 + i * 0.1;
    b.part(new THREE.CylinderGeometry(0.115, 0.115, 0.035, 8), i % 2 ? P.trim : P.hullDark, {
      bone: pitch, at: [cx, by, z], dir: [0, 0, 1],
    });
  }
  // nozzle
  b.lathe(
    [[0.05, 0], [0.09, 0], [0.13, 0.12], [0.1, 0.12], [0.07, 0.02], [0.05, 0.02]],
    { at: [cx, by, cz + 0.85], axis: [0, 0, 1], bone: pitch, color: P.steel, segments: 8 },
  );
  glow(b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.02, 10), P.water, { bone: pitch, at: [cx, by, cz + 0.9], dir: [0, 0, 1] }), 2);
  // barrel neon strips
  for (const s of [1, -1])
    glow(b.part(new THREE.BoxGeometry(0.02, 0.02, 0.4), P.neonCyan, { bone: pitch, at: [cx + s * 0.105, by, cz + 0.4] }), 1.5);

  // gauge
  b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.03, 12), P.steel, { bone: yaw, at: [cx - 0.415, cy + 0.2, cz - 0.15], dir: [1, 0, 0] });
  b.part(new THREE.CircleGeometry(0.05, 16), "#ffffff", {
    bone: yaw, at: [cx - 0.435, cy + 0.2, cz - 0.15], dir: [-1, 0, 0], axis: "z", texture: gaugeTexture({ label: "BAR" }),
  });

  // camera pod
  b.part(new THREE.BoxGeometry(0.1, 0.1, 0.14), P.hullDark, { bone: yaw, at: [cx + 0.28, cy + 0.42, cz - 0.2] });
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.14, 6), P.steel, { bone: yaw, at: [cx + 0.28, cy + 0.34, cz - 0.2] });
  glow(b.part(new THREE.CircleGeometry(0.035, 12), "#ffffff", {
    bone: yaw, at: [cx + 0.28, cy + 0.42, cz - 0.272], dir: [0, 0, 1], axis: "z", texture: lensTex,
  }), 1.5);
  b.part(new THREE.BoxGeometry(0.1, 0.1, 0.14), P.hullDark, { bone: yaw, at: [cx + 0.28, cy + 0.42, cz - 0.2] });

  // supply hose, coiled toward tank (rear)
  const hoseA: [number, number, number] = [cx, cy + 0.2, cz - 0.4];
  const hoseB: [number, number, number] = [cx, cy + 0.2, cz - 1.1];
  b.sweep(
    [hoseA, [cx - 0.1, cy + 0.34, cz - 0.6], [cx + 0.1, cy + 0.3, cz - 0.85], hoseB],
    0.035,
    { bone: yaw, color: P.rubber, sides: 6 },
  );
  for (let i = 0; i < 4; i++) {
    b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 6), P.steel, {
      bone: yaw, at: [cx, cy + 0.2 + 0.1 * R(), cz - 0.5 - i * 0.18], dir: [0, 0, 1],
    });
  }
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.06, 8), P.steel, { bone: yaw, at: [cx, cy + 0.2, cz - 1.12], dir: [0, 0, 1] });
  // rear glow strips
  glow(b.part(new THREE.BoxGeometry(0.5, 0.025, 0.02), P.neonMagenta, { bone: yaw, at: [cx, cy + 0.14, cz - 0.4] }), 1.4);
}
```

<!-- call: cab -->

```ts
import * as THREE from "three";
import { paint, svg, mix, noise, smoothstep, frame } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { panelled, metal } from "agentic-3js-builder/kits/clockwork";

export function buildCab({ b, J, P }: any) {
  const bone = J.body;
  const hullPaint = panelled(
    paint((p: THREE.Vector3, n: THREE.Vector3) => {
      const t = noise(p, 0.3, 3);
      const base = mix(P.hullDark, P.hullLight, 0.25 + 0.4 * smoothstep(-0.5, 1, n.y) * t);
      return base;
    }),
    { size: 0.35, rivets: 0.06 },
  );
  const box = (w: number, h: number, d: number, color: any, at: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, ...extra });

  // main cab body
  box(2.3, 0.7, 2.0, hullPaint, [0, 1.55, 0.6]);
  // upper greenhouse with sloped front
  const roofShape = [
    [-0.8, 0],
    [0.7, 0],
    [0.35, 0.45],
    [-0.8, 0.45],
  ];
  for (const s of [1, -1]) {
    b.extrude(roofShape, {
      at: [s * 1.0, 1.9, 0.6],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.12,
      color: hullPaint,
      bone,
    });
  }
  box(2.0, 0.08, 1.3, P.hullDark, [0, 2.17, 0.15]);
  box(2.1, 0.06, 1.25, hullPaint, [0, 2.2, 0.15]);

  // windshield slit
  const WS = svg(
    `<svg viewBox="0 0 100 24"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0e2a3a"/><stop offset="0.6" stop-color="#16556b"/><stop offset="1" stop-color="#2ff3ff"/></linearGradient></defs><rect width="100" height="24" rx="3" fill="url(#g)"/><path d="M10 24 L30 0 M40 24 L60 0" stroke="#aaffff" stroke-opacity="0.35" stroke-width="3"/></svg>`,
    { size: 256 },
  );
  b.part(new THREE.PlaneGeometry(1.9, 0.3), "#ffffff", {
    bone,
    at: [0, 2.0, 1.47],
    dir: [0, 0.55, 0.85],
    axis: "z",
    texture: WS,
  });
  glow(box(1.9, 0.02, 0.02, P.neonCyan, [0, 1.84, 1.62]), 1.4);

  // side windows
  const SW = svg(
    `<svg viewBox="0 0 80 40"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0e2a3a"/><stop offset="1" stop-color="#1d7f94"/></linearGradient></defs><rect width="80" height="40" rx="4" fill="url(#g)"/><path d="M5 40 L35 0 M25 40 L55 0" stroke="#2ff3ff" stroke-opacity="0.4" stroke-width="4"/></svg>`,
    { size: 192 },
  );
  const LOGO = svg(
    `<svg viewBox="0 0 120 60"><circle cx="22" cy="30" r="16" fill="none" stroke="#ff2a3c" stroke-width="5"/><path d="M22 12 L32 46 L22 38 L12 46Z" fill="#ff2a3c"/><text x="46" y="26" font-size="14" font-weight="bold" fill="#e8ecf2" font-family="sans-serif">RIOT</text><text x="46" y="42" font-size="11" fill="#2ff3ff" font-family="sans-serif">CONTROL</text><text x="46" y="55" font-size="10" fill="#f2c80f" font-family="sans-serif">暴動鎮圧</text></svg>`,
    { size: 256 },
  );
  for (const s of [1, -1]) {
    const nx = s * 1.16;
    b.part(new THREE.PlaneGeometry(1.0, 0.36), "#ffffff", {
      bone,
      at: [nx, 1.95, 0.45],
      dir: [s, 0, 0],
      axis: "z",
      texture: SW,
    });
    b.part(new THREE.PlaneGeometry(0.9, 0.45), "#ffffff", {
      bone,
      at: [nx + s * 0.002, 1.5, 0.55],
      dir: [s, 0, 0],
      axis: "z",
      texture: LOGO,
    });
    // door seam and handle
    box(0.02, 0.7, 0.03, P.black, [nx, 1.55, 0.05]);
    box(0.04, 0.05, 0.22, P.steel, [nx + s * 0.02, 1.68, 0.2]);
    // hazard sill
    box(0.06, 0.1, 1.9, P.trim, [s * 1.17, 1.24, 0.6]);
    for (let i = 0; i < 8; i++)
      box(0.07, 0.11, 0.07, P.black, [s * 1.17, 1.24, -0.28 + i * 0.25], { rotation: [0, 0, 0] });
    // mirror
    b.rod([s * 1.2, 1.9, 1.2], [s * 1.5, 2.0, 1.25], 0.02, P.steel, { bone });
    box(0.08, 0.22, 0.14, P.hullDark, [s * 1.52, 2.0, 1.25]);
    glow(box(0.02, 0.04, 0.06, P.neonRed, [s * 1.57, 1.92, 1.25]), 1.5);
    // wing spotlights
    b.part(new THREE.CylinderGeometry(0.09, 0.11, 0.16, 8), P.hullDark, {
      bone,
      at: [s * 1.1, 2.0, 1.35],
      dir: [0, 0.2, 1],
    });
    glow(
      b.part(new THREE.CircleGeometry(0.085, 8), P.white, {
        bone,
        at: [s * 1.1, 2.0, 1.44],
        dir: [0, 0.2, 1],
        axis: "z",
      }),
      1.5,
    );
    // antennas
    b.rod([s * 0.85, 2.22, -0.2], [s * 0.9, 2.95 > 2.2 ? 2.2 : 2.2, -0.2], 0.01, P.black, { bone });
  }
  // roof light bar: alternating segments
  box(1.7, 0.06, 0.24, P.black, [0, 2.26, 0.9]);
  for (let i = 0; i < 8; i++)
    glow(box(0.2, 0.08, 0.2, i % 2 ? P.neonCyan : P.neonMagenta, [-0.75 + i * 0.215, 2.3, 0.9]), 1.6);
  // vents on roof
  for (let i = 0; i < 3; i++) box(0.4, 0.03, 0.06, P.black, [0, 2.24, 0.0 - i * 0.15 + 0.1]);
  // antennas
  b.rod([-0.7, 2.22, 0.0], [-0.7, 2.2, 0.0], 0.01, P.black, { bone });
  b.rod([0.8, 2.2, -0.15], [0.8, 2.2, -0.15], 0.01, P.black, { bone });
  b.rod([-0.8, 2.2, 0.0], [-0.85, 2.2, 0.0], 0.015, P.steel, { bone });
  b.rod([-0.8, 2.2, 0.0], [-0.88, 2.2, -0.0], 0.012, P.steel, { bone });
  // rear wall
  box(2.3, 0.9, 0.06, P.hullDark, [0, 1.7, -0.38]);
  // front lower armour lip
  box(2.3, 0.1, 0.1, P.trim, [0, 1.25, 1.55]);
}
```

<!-- call: bed -->

```ts
import * as THREE from "three";
import { paint, svg, rng, mix, noise, smoothstep } from "agentic-3js-builder";
import { metal, panelled, gaugeTexture } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildBed({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const R = rng(11);
  const HULL = panelled(
    paint((p, n) => mix(mix(P.hullDark, P.hull, smoothstep(0.2, 0.8, noise(p, 0.25, 3))), P.hullLight, Math.max(0, n.y) * 0.5)),
    { size: 0.3, rivets: 0.06, seam: P.black },
  );
  const STEEL = metal("steel", { tarnish: 0.4 });
  const box = (w: number, h: number, d: number, col: any, at: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone, at, ...extra });

  const hazard = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="${P.black}"/>${[0, 1, 2, 3, 4, 5, 6, 7]
      .map((i) => `<path d="M${i * 10 - 6} 16 L${i * 10} 0 L${i * 10 + 5} 0 L${i * 10 - 1} 16Z" fill="${P.trim}"/>`)
      .join("")}</svg>`,
    { size: 256 },
  );
  const plate = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" rx="3" fill="#e8ecf2"/><rect x="2" y="2" width="60" height="28" rx="2" fill="none" stroke="#14171d" stroke-width="1.5"/><text x="32" y="15" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="11" fill="#14171d">RC-9 NC</text><text x="32" y="26" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#ff2bd6">ライオット</text></svg>`,
    { size: 256 },
  );
  const label = svg(
    `<svg viewBox="0 0 128 48"><rect width="128" height="48" fill="none"/><text x="64" y="22" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="20" fill="#f2c80f">暴動鎮圧</text><text x="64" y="40" text-anchor="middle" font-family="monospace" font-size="12" fill="#e8ecf2">RIOT CONTROL</text></svg>`,
    { size: 512 },
  );
  const level = svg(
    `<svg viewBox="0 0 16 48"><rect width="16" height="48" fill="#0e2a3a"/><rect y="14" width="16" height="34" fill="#5fd4ff"/><path d="M0 14 Q4 10 8 14 T16 14" fill="#bff0ff"/>${[8, 20, 32, 44].map((y) => `<path d="M0 ${y}h5" stroke="#e8ecf2" stroke-width="1.5"/>`).join("")}</svg>`,
    { size: 128 },
  );

  // main shell
  box(2.5, 1.5, 2.7, HULL, [0, 1.35, -1.8]);
  // sloped roof / upper armor
  box(2.3, 0.2, 2.5, HULL, [0, 2.2, -1.8]);
  box(2.4, 0.12, 2.6, P.hullDark, [0, 2.08, -1.8]);
  // front wall armor lip
  box(2.5, 0.3, 0.12, P.hullLight, [0, 2.1, -0.46]);
  // lower skirt
  box(2.55, 0.25, 2.75, P.hullDark, [0, 0.62, -1.8]);

  // wheel arch cutout look (dark discs) at axleRear
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.72, 0.72, 0.06, 14), P.black, { bone, at: [s * 1.27, 0.7, -1.9], dir: [1, 0, 0] });
    b.part(new THREE.BoxGeometry(0.2, 0.08, 1.7), P.hullLight, { bone, at: [s * 1.33, 1.38, -1.9] });
  }

  // hazard stripes at rear
  b.part(new THREE.BoxGeometry(2.5, 0.28, 0.04), "#ffffff", { bone, at: [0, 0.82, -3.17], texture: hazard });
  b.part(new THREE.BoxGeometry(2.5, 0.28, 0.04), "#ffffff", { bone, at: [0, 2.0, -3.17], texture: hazard });
  for (const s of [1, -1]) b.part(new THREE.BoxGeometry(0.04, 0.2, 2.5), "#ffffff", { bone, at: [s * 1.27, 0.95, -1.8], texture: hazard, rotation: [0, 0, 0] });

  // rear doors
  for (const s of [1, -1]) {
    box(1.1, 1.1, 0.06, P.hullLight, [s * 0.58, 1.4, -3.17]);
    box(0.9, 0.9, 0.04, P.hull, [s * 0.58, 1.4, -3.2]);
    b.rod([s * 0.12, 1.1, -3.25], [s * 0.12, 1.7, -3.25], 0.02, STEEL, { bone });
    // red light clusters
    glow(box(0.12, 0.34, 0.05, P.neonRed, [s * 1.12, 1.85, -3.2]), 1.8);
    glow(box(0.12, 0.12, 0.05, P.neonRed, [s * 1.12, 1.55, -3.2]), 1.4);
  }
  box(0.04, 1.1, 0.07, P.black, [0, 1.4, -3.2]);
  // bumper
  box(2.6, 0.22, 0.25, P.hullDark, [0, 0.5, -3.28]);
  box(2.4, 0.06, 0.1, P.trim, [0, 0.62, -3.38]);
  b.part(new THREE.PlaneGeometry(0.5, 0.25), "#ffffff", { bone, at: [0, 0.52, -3.415], dir: [0, 0, -1], axis: "z", texture: plate });
  for (const s of [1, -1]) b.rod([s * 0.9, 0.4, -3.2], [s * 0.9, 0.4, -3.45], 0.04, STEEL, { bone });

  // side lockers, vents, level window, decals, underglow
  for (const s of [1, -1]) {
    const x = s * 1.3;
    box(0.12, 0.5, 0.9, P.hullDark, [x, 1.0, -2.6]);
    box(0.04, 0.44, 0.82, P.hullLight, [x + s * 0.07, 1.0, -2.6]);
    b.rod([x + s * 0.1, 1.0, -2.3], [x + s * 0.1, 1.0, -2.2], 0.025, STEEL, { bone });
    for (let i = 0; i < 5; i++) box(0.04, 0.03, 0.42, P.black, [x + s * 0.02, 1.62 + i * 0.07, -2.7]);
    for (let i = 0; i < 5; i++) box(0.04, 0.03, 0.42, P.black, [x + s * 0.02, 1.62 + i * 0.07, -0.95]);
    // level window
    box(0.1, 0.8, 0.2, P.steel, [x, 1.5, -1.55]);
    glow(
      b.part(new THREE.PlaneGeometry(0.12, 0.62), "#ffffff", { bone, at: [x + s * 0.055, 1.5, -1.55], dir: [s, 0, 0], axis: "z", texture: level }),
      1.2,
    );
    // label
    b.part(new THREE.PlaneGeometry(0.9, 0.34), "#ffffff", { bone, at: [x + s * 0.015, 1.75, -2.1], dir: [s, 0, 0], axis: "z", texture: label });
    // underglow magenta
    glow(b.rod([x - s * 0.05, 0.42, -3.0], [x - s * 0.05, 0.42, -0.7], 0.03, P.neonMagenta, { bone, sides: 6 }), 2);
    glow(box(0.04, 0.05, 2.4, P.neonMagenta, [x + s * 0.01, 0.78, -1.9]), 1.6);
  }

  // roof tank dome
  const dome = b.lathe(
    [[0, 0], [0.7, 0], [0.74, 0.1], [0.6, 0.28], [0.35, 0.4], [0, 0.44]],
    { at: [0, 2.28, -1.9], axis: [0, 0, 1], bone, segments: 10, color: HULL },
  );
  void dome;
  // tank as horizontal cylinder along z
  b.part(new THREE.CylinderGeometry(0.5, 0.5, 1.7, 10), HULL, { bone, at: [0, 2.6, -2.15], dir: [0, 0, 1], flat: true });
  for (const z of [-1.5, -2.0, -2.5, -2.95]) b.part(new THREE.CylinderGeometry(0.53, 0.53, 0.07, 10), P.trim, { bone, at: [0, 2.6, z], dir: [0, 0, 1], flat: true });
  b.part(new THREE.SphereGeometry(0.5, 10, 6), HULL, { bone, at: [0, 2.6, -3.0], scale: [1, 1, 0.45] });
  b.part(new THREE.SphereGeometry(0.5, 10, 6), HULL, { bone, at: [0, 2.6, -1.3], scale: [1, 1, 0.45] });
  glow(box(0.5, 0.05, 0.1, P.water, [0, 3.0, -2.2]), 1.5);
  // gauges
  const gt = gaugeTexture({ label: "BAR" });
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.05, 12), STEEL, { bone, at: [s * 0.48, 2.7, -1.5], dir: [s, 0.2, 0] });
    b.part(new THREE.CircleGeometry(0.1, 14), "#ffffff", { bone, at: [s * 0.52, 2.7, -1.5], dir: [s, 0.2, 0], axis: "z", texture: gt });
  }
  // pipes
  b.sweep(
    [[0.3, 2.2, -1.2], [0.3, 2.4, -1.0], [0.1, 2.5, -0.8], [0, 2.4, -0.7]],
    0.045,
    { bone, color: STEEL, sides: 6 },
  );
  b.sweep([[-0.3, 2.2, -1.2], [-0.3, 2.35, -1.0], [-0.1, 2.4, -0.8]], 0.04, { bone, color: STEEL, sides: 6 });
  // turret ring base at turretRing
  b.lathe([[0, 0], [0.5, 0], [0.55, 0.05], [0.5, 0.1], [0, 0.1]], { at: [0, 2.28, -0.9], bone, segments: 14, color: P.hullDark });
  glow(b.sweep(new Array(16).fill(0).map((_, i) => [Math.sin((i / 16) * 6.283) * 0.53, 2.4, -0.9 + Math.cos((i / 16) * 6.283) * 0.53]), 0.012, { bone, color: P.neonCyan, sides: 4, caps: "none" }), 2);
  // rivet bolts on the roof
  for (let i = 0; i < 10; i++) b.part(new THREE.SphereGeometry(0.025, 5, 4), STEEL, { bone, at: [(R() - 0.5) * 2.0, 2.3, -1.2 - R() * 1.9] });
  // roof rear beacons
  for (const s of [1, -1]) glow(box(0.14, 0.08, 0.1, s > 0 ? P.neonCyan : P.neonMagenta, [s * 1.1, 2.3, -3.0]), 2);
}
```