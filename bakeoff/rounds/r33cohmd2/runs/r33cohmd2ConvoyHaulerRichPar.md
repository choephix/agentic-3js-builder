<!-- call: plan -->

```json
{
  "name": "Convoy Hauler Mk-IV 'Lockjaw'",
  "description": "A low-poly cyberpunk six-wheeled armoured convoy hauler with a slab-sided cab, gun turret and roof rack, towing a sealed hazard-striped cargo pod on its flatbed, lit with neon trim.",
  "builderName": "convoyHauler",
  "size": [3.0, 3.1, 8.4],
  "layout": "Long chunky silhouette facing +Z. Front 0 to 4.2: a wedge-nosed armoured cab (sloped hood with a bull-bar ram and angular headlight slits, a raised cockpit with a narrow cyan-lit slit windscreen, side armour skirts, an roof turret behind the cab roof). Behind the cab, a long flatbed chassis from z=-0.6 to z=-4.2 carries a big rounded-box sealed cargo pod with chevron hazard stripes, clamp straps, a glowing magenta seam and a biohazard-style emblem decal. Six fat low-poly wheels on three axles (front z=2.7, middle z=-0.9, rear z=-3.3) with hubcaps and neon rim rings, fender arches over them. Everything is faceted and blocky: sheet-metal panels with rivet seams, dark gunmetal hull, yellow-black hazard trim, cyan and magenta neon strips and emissive glow lights, antenna masts, exhaust stacks behind the cab, tail lights red. Style shows via bold neon edge strips, decals/signage in SVG (kanji-like glyphs, serial numbers) and grime paint.",
  "palette": {
    "hull": "#3a4150",
    "hullDark": "#20242e",
    "armor": "#555d6e",
    "trim": "#e7b814",
    "trimBlack": "#16161a",
    "neonCyan": "#2ff3ff",
    "neonMagenta": "#ff2bd6",
    "neonLime": "#9dff3b",
    "tire": "#15161a",
    "rim": "#8a93a5",
    "glass": "#0f3a4a",
    "podShell": "#c9ced8",
    "podDark": "#5b6272",
    "warnRed": "#e0233a",
    "rust": "#7a4a2c",
    "steel": "#9aa3b2"
  },
  "mounts": {
    "chassisTop": [0, 1.2, -2.4],
    "cabFloor": [0, 1.2, 2.0],
    "cabRoof": [0, 2.35, 1.6],
    "turretRing": [0, 2.35, 0.5],
    "podBed": [0, 1.3, -2.4],
    "axleFront": [0, 0.55, 2.7],
    "axleMid": [0, 0.55, -0.9],
    "axleRear": [0, 0.55, -3.3],
    "rackBack": [0, 1.2, -0.7]
  },
  "joints": [
    { "name": "body", "at": [0, 1.0, 0], "dir": [0, 0, 1], "role": "spine" },
    { "name": "cab", "parent": "body", "at": [0, 1.2, 2.0], "dir": [0, 0, 1], "role": "spine" },
    { "name": "turretYaw", "parent": "cab", "at": [0, 2.35, 0.5], "dir": [0, 1, 0], "role": "hinge", "group": "turret" },
    { "name": "gunPitch", "parent": "turretYaw", "at": [0, 2.75, 0.7], "dir": [0, 0, 1], "role": "hinge", "group": "turret" },
    { "name": "podLid", "parent": "body", "at": [0, 2.55, -2.4], "dir": [0, 0, -1], "role": "hinge", "group": "pod" },
    { "name": "wheelFL", "parent": "body", "at": [1.25, 0.55, 2.7], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelFR", "parent": "body", "at": [-1.25, 0.55, 2.7], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelML", "parent": "body", "at": [1.25, 0.55, -0.9], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelMR", "parent": "body", "at": [-1.25, 0.55, -0.9], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelRL", "parent": "body", "at": [1.25, 0.55, -3.3], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelRR", "parent": "body", "at": [-1.25, 0.55, -3.3], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" }
  ],
  "parts": [
    {
      "id": "chassisRunning",
      "builds": "Frame and running gear: low flatbed ladder chassis with hazard-trimmed side skirts and rivet-panelled paint, three axles with differential housings and leaf-spring blocks, six faceted low-poly tyres (octagonal cylinders with tread notches) on joints wheelFL..wheelRR with steel hubcaps, lug nuts and cyan neon rim rings, fender arches and mudflaps with grime paint, rear bumper with red tail lights and a towing hook, under-glow magenta strips along the underside, exhaust stacks rising behind the cab on the left and right.",
      "box": [[-1.5, 0.0, -4.2], [1.5, 1.3, 4.2]],
      "attaches": "Deck at chassisTop (y=1.2) carries the pod and rack; cab mounts at cabFloor; wheels pivot on axleFront/axleMid/axleRear lines.",
      "joints": ["body", "wheelFL", "wheelFR", "wheelML", "wheelMR", "wheelRL", "wheelRR"],
      "floor": true,
      "budget": 190
    },
    {
      "id": "cab",
      "builds": "Armoured cab: wedge nose with sloped hood plates, front grille with glowing cyan slits and a heavy yellow-black striped ram bar, angular headlight slits (lime/white emissive), a raised cockpit with a narrow glass slit windscreen (emissive cyan tint with SVG HUD-like glyph decal), side armour plates with rivets and door seams, wing mirrors, roof armour with vents, side-door decals (unit number, kanji-like glyphs via SVG), antenna mast with blinking red tip, neon edge strips in cyan along the roofline. Hull painted with panelled gunmetal and grime paint.",
      "box": [[-1.4, 1.2, 0.3], [1.4, 2.4, 4.2]],
      "attaches": "Sits on chassis at cabFloor (y=1.2); roof at cabRoof; turret rides on turretRing.",
      "joints": ["cab"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "turret",
      "builds": "Roof gun turret: round faceted ring base on turretRing, rotating armoured housing on joint turretYaw with angled plates, twin barrels on gunPitch with muzzle brakes and heat-vent slits, an ammo box on the side with a hazard stripe, a small sensor eye (magenta emissive lens) and an SVG-painted warning label; plus the roof rack behind the cab at rackBack with spare jerrycans, antenna cluster and a cyan-lit searchlight bar.",
      "box": [[-1.3, 2.3, -0.9], [1.3, 3.1, 1.6]],
      "attaches": "Base ring at turretRing (y=2.35); rack rests on chassisTop line at rackBack and cab roof.",
      "joints": ["turretYaw", "gunPitch"],
      "floor": false,
      "budget": 150
    },
    {
      "id": "cargoPod",
      "builds": "Sealed cargo pod: large rounded-box capsule built from a lofted body in light podShell paint with panel seams, dark end caps, a hinged-looking lid seam on podLid, four heavy clamp straps (trim yellow/black) with bolt plates bolted to the bed, glowing magenta seam strips and a lit status screen near the front, hazard chevron stripes (SVG texture) along the flanks, a biohazard/quarantine emblem and serial number decals (SVG), rear locking wheel and cable conduits, small corner anchors. Red warning beacon on top that glows.",
      "box": [[-1.4, 1.2, -4.2], [1.4, 3.1, -0.7]],
      "attaches": "Rests on the flatbed at podBed (y=1.3); clamps weld to the chassis deck; lid hinge at podLid.",
      "joints": ["podLid", "body"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "escortDetails",
      "builds": "Armoured side hardware and lighting along the whole hauler: left and right side armour panels between cab and pod with rivet seams, fold-down tool lockers, ladder rungs to the deck, cable runs, fuel tank cylinders under the deck edge, a neon strip loop along each flank (cyan up front, magenta at the back), floodlight pods at the cab corners, license-plate/hologram sign at the rear with an SVG glyph, bundled antenna array at the rear, spare tyre on the side, and grime/scratch paint decals.",
      "box": [[-1.55, 0.5, -4.2], [1.55, 2.0, 2.0]],
      "attaches": "Mounted to chassis sides at chassisTop and to the pod and cab walls; does not intersect wheels at axle lines.",
      "joints": ["body"],
      "floor": false,
      "budget": 150
    }
  ]
}
```

<!-- call: escortDetails -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

type Ctx = { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, number[]> };

export function buildEscortDetails({ b, J, P }: Ctx) {
  const body = J.body;
  const R = rng(11);
  const grime = paint((p, n) => {
    const base: [number, number, number] = [0.23, 0.26, 0.31];
    const g = noise(p, 0.25, 3);
    let c = mix(base, [0.12, 0.12, 0.14], smoothstep(0.5, 0.85, g) * 0.7);
    c = mix(c, [0.48, 0.29, 0.17], smoothstep(0.65, 0.9, noise(p, 0.12, 8)) * smoothstep(0.3, -0.5, n.y) * 0.6);
    const seam = Math.abs(((p.z * 2.5) % 1) - 0.5) > 0.485 ? 0.55 : 1;
    return [c[0] * seam, c[1] * seam, c[2] * seam];
  });
  const hazard = paint((p) => (Math.floor((p.z + p.y) / 0.12) % 2 ? [0.9, 0.72, 0.08] : [0.09, 0.09, 0.1]));

  const box = (w: number, h: number, d: number, col: any, at: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone: body, at, ...extra });
  const cyl = (r: number, len: number, col: any, at: number[], dir: number[], seg = 8) =>
    b.part(new THREE.CylinderGeometry(r, r, len, seg), col, { bone: body, at, dir });

  const glyph = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" rx="3" fill="#0a0c12"/><rect x="2" y="2" width="60" height="28" rx="2" fill="none" stroke="#2ff3ff" stroke-width="1.5"/>
    <path d="M8 8h14M15 8v16M10 16h10M28 8l8 16M44 8v16M36 12h16M36 22h16" stroke="#2ff3ff" stroke-width="2.5" fill="none"/>
    <text x="32" y="29" font-size="6" text-anchor="middle" fill="#ff2bd6" font-family="monospace">LJ-4471-MK</text></svg>`,
    { size: 256 },
  );
  const scratch = svg(
    `<svg viewBox="0 0 64 64"><path d="M5 50L30 20M12 58L40 30M44 12L60 40" stroke="#c9ced8" stroke-width="1.6" opacity="0.7"/><path d="M8 10h20v6H8z" fill="none" stroke="#e7b814" stroke-width="1.5"/></svg>`,
    { size: 128 },
  );

  for (const s of [1, -1]) {
    const x = s * 1.5;
    // side armour panels between cab and pod
    box(0.08, 0.62, 2.2, grime, [x, 0.92, -1.05]);
    box(0.1, 0.06, 2.2, hazard, [x + s * 0.005, 0.58, -1.05]);
    // rivets
    const rivets: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 9; i++)
      for (const yy of [0.7, 1.15]) {
        const g = new THREE.SphereGeometry(0.022, 5, 4);
        g.translate(x + s * 0.05, yy, -2.05 + i * 0.25);
        rivets.push(g);
      }
    b.part(mergeAll(rivets), P.steel, { bone: body, at: [0, 0, 0] });
    // fold-down tool lockers
    for (const z of [-0.45, -1.35]) {
      box(0.16, 0.34, 0.7, P.armor, [x + s * 0.12, 1.0, z]);
      box(0.03, 0.1, 0.4, P.trim, [x + s * 0.21, 1.1, z]);
      b.part(new THREE.PlaneGeometry(0.4, 0.3), "#ffffff", {
        bone: body, at: [x + s * 0.214, 0.98, z], dir: [s, 0, 0], axis: "z", texture: scratch,
      });
    }
    // fuel tanks under deck edge
    for (const z of [-2.0, -1.55]) cyl(0.17, 0.5, P.hullDark, [x - s * 0.22, 0.78, z], [0, 0, 1], 8);
    cyl(0.04, 0.9, P.steel, [x - s * 0.22, 0.98, -1.8], [0, 0, 1], 6);
    // ladder rungs
    for (let i = 0; i < 4; i++) box(0.05, 0.04, 0.34, P.steel, [x + s * 0.06, 0.72 + i * 0.22, 0.45]);
    box(0.04, 0.9, 0.04, P.steel, [x + s * 0.06, 1.1, 0.27]);
    box(0.04, 0.9, 0.04, P.steel, [x + s * 0.06, 1.1, 0.63]);
    // cable runs
    for (let i = 0; i < 2; i++) {
      b.sweep([[x + s * 0.02, 1.38 - i * 0.06, -3.6], [x + s * 0.05, 1.4 - i * 0.06, -2.4], [x + s * 0.02, 1.34 - i * 0.06, -1.6]],
        0.018, { bone: body, color: i ? P.warnRed : P.trimBlack, sides: 5 });
    }
    // neon loop strips
    glow(box(0.04, 0.05, 1.6, P.neonMagenta, [x + s * 0.03, 0.5, -3.4 + 0.0]), 1.6);
    glow(box(0.04, 0.05, 1.4, P.neonMagenta, [x + s * 0.03, 0.5, -1.0]), 1.6);
    glow(box(0.04, 0.05, 2.1, P.neonCyan, [x + s * 0.03, 0.5, 1.0]), 1.6);
    glow(box(0.04, 1.35, 0.05, P.neonCyan, [x + s * 0.03, 1.15, 1.95]), 1.4);
    // floodlight pods at cab corners
    cyl(0.1, 0.16, P.hullDark, [s * 1.3, 1.95, 1.9], [0, 0, 1], 8);
    glow(b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.03, 8), "#fffbe0", {
      bone: body, at: [s * 1.3, 1.95, 1.99], dir: [0, 0, 1],
    }), 2);
    box(0.06, 0.12, 0.06, P.steel, [s * 1.3, 1.85, 1.85]);
  }

  // spare tyre on the left side
  const tyre = b.part(new THREE.CylinderGeometry(0.34, 0.34, 0.2, 10), P.tire, {
    bone: body, at: [1.66, 1.5, -0.55], dir: [1, 0, 0],
  });
  b.part(new THREE.CylinderGeometry(0.18, 0.18, 0.215, 8), P.rim, { bone: body, at: [1.66, 1.5, -0.55], dir: [1, 0, 0] });
  box(0.1, 0.1, 0.5, P.steel, [1.56, 1.2, -0.55]);

  // rear hologram plate
  box(1.0, 0.45, 0.06, P.hullDark, [0, 0.85, -4.18]);
  glow(b.part(new THREE.PlaneGeometry(0.9, 0.36), "#ffffff", {
    bone: body, at: [0, 0.85, -4.222], dir: [0, 0, -1], axis: "z", texture: glyph,
  }), 1.3);
  for (const s of [1, -1]) box(0.05, 0.3, 0.05, P.steel, [s * 0.45, 1.1, -4.12]);

  // antenna array at the rear
  for (let i = 0; i < 5; i++) {
    const x = -0.4 + i * 0.2;
    const h = 0.8 + R() * 0.7;
    b.rod([x, 1.2, -4.0], [x + (R() - 0.5) * 0.1, 1.2 + h, -4.05], 0.012, P.steel, { bone: body, sides: 5 });
  }
  box(0.7, 0.1, 0.12, P.hullDark, [0, 1.25, -4.0]);
  glow(b.part(new THREE.SphereGeometry(0.03, 5, 4), P.warnRed, { bone: body, at: [0.4, 2.0, -4.05] }), 2);

  function mergeAll(gs: THREE.BufferGeometry[]) {
    let pos: number[] = [];
    let idx: number[] = [];
    let off = 0;
    for (const g of gs) {
      const ng = g.index ? g : g;
      const p = ng.getAttribute("position");
      for (let i = 0; i < p.count; i++) pos.push(p.getX(i), p.getY(i), p.getZ(i));
      const ix = ng.index!;
      for (let i = 0; i < ix.count; i++) idx.push(ix.getX(i) + off);
      off += p.count;
    }
    const out = new THREE.BufferGeometry();
    out.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    out.setIndex(idx);
    out.computeVertexNormals();
    return out;
  }
}
```

<!-- call: turret -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

type Ctx = { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, number[]> };

export function buildTurret({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const yaw = J.turretYaw;
  const pitch = J.gunPitch;
  const body = J.body;
  const cab = J.cab;

  // Grime paints
  const hullPaint = paint((p: THREE.Vector3, n: THREE.Vector3) => {
    const g = noise(p, 0.25, 3);
    const base = mix(P.hull, P.armor, 0.3 + 0.5 * Math.max(0, n.y));
    return mix(base, P.hullDark, g * 0.5);
  });
  const darkPaint = paint((p: THREE.Vector3) => mix(P.hullDark, P.trimBlack, noise(p, 0.15, 5)));
  const hazard = paint((p: THREE.Vector3) =>
    Math.floor((p.x + p.y + p.z) / 0.07) % 2 === 0 ? P.trim : P.trimBlack,
  );
  const rustPaint = paint((p: THREE.Vector3) => mix(P.warnRed, P.rust, noise(p, 0.1, 2)));

  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (rt: number, rb: number, h: number, s = 8) => new THREE.CylinderGeometry(rt, rb, h, s);

  // ---- Ring base (fixed on cab) ----
  const ringAt = M.turretRing;
  b.part(cyl(0.62, 0.7, 0.1, 12), darkPaint, { bone: cab, at: [ringAt[0], ringAt[1] + 0.05, ringAt[2]] });
  b.part(cyl(0.56, 0.58, 0.05, 12), P.steel, { bone: cab, at: [ringAt[0], ringAt[1] + 0.12, ringAt[2]] });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    b.part(cyl(0.025, 0.025, 0.04, 6), P.rim, {
      bone: cab,
      at: [Math.sin(a) * 0.66, ringAt[1] + 0.11, ringAt[2] + Math.cos(a) * 0.66],
    });
  }
  // cyan ring light
  glow(
    b.part(new THREE.TorusGeometry(0.6, 0.012, 4, 16), P.neonCyan, {
      bone: cab,
      at: [ringAt[0], ringAt[1] + 0.1, ringAt[2]],
      rotation: [90, 0, 0],
    }),
    1.4,
  );

  // ---- Housing on yaw ----
  const hy = 2.6;
  const hz = 0.5;
  b.part(cyl(0.5, 0.56, 0.3, 8), hullPaint, { bone: yaw, at: [0, 2.55, hz] });
  b.part(box(0.9, 0.3, 0.8), hullPaint, { bone: yaw, at: [0, hy + 0.1, hz + 0.05] });
  // sloped front plate
  b.part(box(0.8, 0.28, 0.1), P.armor, { bone: yaw, at: [0, hy + 0.1, hz + 0.5], rotation: [-30, 0, 0] });
  // roof wedge
  b.part(box(0.7, 0.1, 0.6), P.armor, { bone: yaw, at: [0, hy + 0.28, hz], rotation: [8, 0, 0] });
  // side angled plates
  for (const s of [1, -1]) {
    b.part(box(0.1, 0.34, 0.7), P.armor, { bone: yaw, at: [s * 0.5, hy + 0.08, hz], rotation: [0, 0, -s * 14] });
    // vent slits
    for (let i = 0; i < 4; i++)
      b.part(box(0.02, 0.04, 0.12), P.trimBlack, { bone: yaw, at: [s * 0.55, hy + 0.16, hz - 0.2 + i * 0.14] });
    // rivets
    for (let i = 0; i < 3; i++)
      b.part(new THREE.SphereGeometry(0.02, 5, 3), P.steel, { bone: yaw, at: [s * 0.46, hy - 0.02, hz - 0.22 + i * 0.22] });
  }
  // hazard rear stripe
  b.part(box(0.8, 0.08, 0.04), hazard, { bone: yaw, at: [0, hy + 0.0, hz - 0.42] });

  // ---- Ammo box on side (left) ----
  b.part(box(0.2, 0.26, 0.4), P.podDark, { bone: yaw, at: [0.66, hy + 0.0, hz - 0.05] });
  b.part(box(0.215, 0.05, 0.415), hazard, { bone: yaw, at: [0.66, hy + 0.1, hz - 0.05] });
  b.part(box(0.04, 0.06, 0.1), P.steel, { bone: yaw, at: [0.77, hy + 0.0, hz - 0.05] });

  // warning label (SVG)
  const label = svg(
    `<svg viewBox="0 0 64 40"><rect width="64" height="40" fill="#e7b814"/><rect x="2" y="2" width="60" height="36" fill="none" stroke="#16161a" stroke-width="2"/><path d="M14 30 L24 10 L34 30Z" fill="#16161a"/><rect x="23" y="16" width="2" height="8" fill="#e7b814"/><text x="38" y="19" font-size="9" font-weight="bold" fill="#16161a" font-family="monospace">ARM</text><text x="38" y="30" font-size="8" fill="#16161a" font-family="monospace">T-07</text></svg>`,
    { size: 128 },
  );
  b.part(new THREE.PlaneGeometry(0.3, 0.19), "#ffffff", {
    bone: yaw, at: [-0.555, hy + 0.1, hz + 0.1], dir: [-1, 0, 0], axis: "z", texture: label,
  });

  // ---- Sensor eye ----
  b.part(cyl(0.08, 0.08, 0.1, 8), P.hullDark, { bone: yaw, at: [-0.3, hy + 0.36, hz + 0.3] });
  glow(b.part(new THREE.SphereGeometry(0.055, 8, 6), P.neonMagenta, { bone: yaw, at: [-0.3, hy + 0.4, hz + 0.34] }), 2);
  // front sensor lens on housing
  glow(b.part(box(0.2, 0.04, 0.03), P.neonMagenta, { bone: yaw, at: [0, hy + 0.2, hz + 0.58] }), 1.6);

  // ---- Gun mount & twin barrels on pitch ----
  const gp = [0, 2.75, 0.7];
  b.part(box(0.5, 0.26, 0.2), P.hullDark, { bone: yaw, at: [0, 2.75, 1.0] });
  b.part(cyl(0.08, 0.08, 0.6, 8), P.steel, { bone: pitch, at: gp, rotation: [0, 0, 90] });
  b.part(box(0.4, 0.22, 0.25), P.armor, { bone: pitch, at: [0, gp[1], gp[2] + 0.22] });
  for (const s of [1, -1]) {
    const x = s * 0.15;
    b.part(cyl(0.05, 0.05, 0.9, 8), P.trimBlack, { bone: pitch, at: [x, gp[1], gp[2] + 0.75], rotation: [90, 0, 0] });
    b.part(cyl(0.075, 0.075, 0.3, 8), P.steel, { bone: pitch, at: [x, gp[1], gp[2] + 0.5], rotation: [90, 0, 0] });
    // heat vent slits on shroud
    for (let i = 0; i < 3; i++)
      b.part(box(0.1, 0.02, 0.03), P.trimBlack, { bone: pitch, at: [x, gp[1] + 0.07, gp[2] + 0.42 + i * 0.07] });
    // muzzle brake
    b.part(cyl(0.085, 0.085, 0.12, 8), P.hullDark, { bone: pitch, at: [x, gp[1], gp[2] + 1.22], rotation: [90, 0, 0] });
    b.part(box(0.2, 0.02, 0.06), P.trimBlack, { bone: pitch, at: [x, gp[1], gp[2] + 1.22] });
    glow(b.part(cyl(0.025, 0.025, 0.02, 6), P.neonCyan, { bone: pitch, at: [x, gp[1], gp[2] + 1.29], rotation: [90, 0, 0] }), 1.5);
  }

  // ---- Roof rack at rackBack (on body, behind cab) ----
  const rk = M.rackBack;
  const rx = rk[1] + 0.0;
  b.part(box(2.2, 0.06, 0.7), darkPaint, { bone: body, at: [0, rx + 0.1, rk[2] + 0.1] });
  for (const sx of [-1, 1])
    for (const sz of [-0.2, 0.4])
      b.part(box(0.06, 0.12, 0.06), P.steel, { bone: body, at: [sx * 1.05, rx + 0.04, rk[2] + sz] });
  b.part(box(2.2, 0.05, 0.05), P.trim, { bone: body, at: [0, rx + 0.16, rk[2] + 0.46] });
  // jerrycans
  for (let i = 0; i < 4; i++) {
    const x = -0.9 + i * 0.28;
    const c = i % 2 ? rustPaint : P.warnRed;
    b.part(box(0.22, 0.3, 0.12), c, { bone: body, at: [x, rx + 0.28, rk[2] + 0.1] });
    b.part(box(0.07, 0.05, 0.05), P.trimBlack, { bone: body, at: [x - 0.04, rx + 0.46, rk[2] + 0.1] });
    b.part(box(0.04, 0.2, 0.01), P.trimBlack, { bone: body, at: [x + 0.04, rx + 0.28, rk[2] + 0.165] });
  }
  // searchlight bar (cyan)
  b.part(box(0.9, 0.1, 0.1), P.hullDark, { bone: body, at: [0.4, rx + 0.5 + 0.3, rk[2] + 0.3] });
  b.part(box(0.04, 0.3, 0.04), P.steel, { bone: body, at: [-0.0, rx + 0.35, rk[2] + 0.3] });
  b.part(box(0.04, 0.3, 0.04), P.steel, { bone: body, at: [0.8, rx + 0.35, rk[2] + 0.3] });
  for (let i = 0; i < 5; i++)
    glow(b.part(box(0.12, 0.07, 0.03), P.neonCyan, { bone: body, at: [0.05 + i * 0.17, rx + 0.8, rk[2] + 0.36] }), 2);
  // antenna cluster
  for (let i = 0; i < 4; i++) {
    const h = 0.7 + R() * 0.7;
    const x = -0.95 + i * 0.12;
    b.rod([x, rx + 0.13, rk[2] - 0.1], [x + 0.02 * i, rx + 0.13 + h, rk[2] - 0.1], 0.012, P.steel, { bone: body });
  }
  glow(b.part(new THREE.SphereGeometry(0.03, 5, 4), P.warnRed, { bone: body, at: [-0.95 + 0.06, rx + 1.4, rk[2] - 0.1] }), 2);
  b.part(cyl(0.09, 0.09, 0.05, 8), P.rim, { bone: body, at: [-0.7, rx + 0.16, rk[2] - 0.1] });
  // dish
  b.part(new THREE.SphereGeometry(0.14, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), P.steel, {
    bone: body, at: [-0.55, rx + 0.5, rk[2] - 0.1], rotation: [-60, 0, 0],
  });
  b.rod([-0.55, rx + 0.16, rk[2] - 0.1], [-0.55, rx + 0.5, rk[2] - 0.1], 0.015, P.steel, { bone: body });
}
```

<!-- call: cargoPod -->

```ts
import * as THREE from "three";
import { paint, svg, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildCargoPod({ b, J, P }: { b: any; J: any; P: any; M: any }) {
  const R = rng(11);
  const body = J.body;
  const lid = J.podLid;
  const X0 = 1.3;
  const Z0 = -4.1;
  const Z1 = -0.8;
  const ZC = (Z0 + Z1) / 2;
  const L = Z1 - Z0;

  const box = (s: number[], c: any, at: number[], bone: any, extra: any = {}) =>
    b.part(new THREE.BoxGeometry(s[0], s[1], s[2]), c, { at, bone, ...extra });

  // ---------- paints ----------
  const SHELL = paint((p: THREE.Vector3, n: THREE.Vector3) => {
    const base = new THREE.Color(P.podShell);
    const dark = new THREE.Color(P.podDark);
    let t = Math.max(0, 1 - (p.y - 1.3) / 0.7) * 0.5;
    t += n.y < -0.3 ? 0.3 : 0;
    // panel seams
    const sx = Math.abs(((p.z + 10) % 0.82) - 0.41);
    if (sx > 0.395 && Math.abs(n.y) < 0.9) t = Math.max(t, 0.75);
    if (n.y > 0.5) base.offsetHSL(0, 0, 0.04);
    const c = base.lerp(dark, Math.min(1, t));
    return [c.r, c.g, c.b] as any;
  });
  const CAP = paint((p: THREE.Vector3) => {
    const k = 0.85 + 0.15 * Math.sin(p.y * 30) * Math.sin(p.x * 30);
    const c = new THREE.Color(P.hullDark).multiplyScalar(k);
    return [c.r, c.g, c.b] as any;
  });

  // ---------- textures ----------
  const HAZ = svg(
    `<svg viewBox="0 0 256 32"><rect width="256" height="32" fill="${P.trimBlack}"/>` +
      Array.from({ length: 12 }, (_, i) => `<path d="M${i * 24 - 8} 32 L${i * 24 + 8} 0 L${i * 24 + 20} 0 L${i * 24 + 4} 32Z" fill="${P.trim}"/>`).join("") +
      `<rect width="256" height="32" fill="none" stroke="${P.trimBlack}" stroke-width="3"/></svg>`,
    { size: 256 },
  );
  const BIO = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="${P.trim}" stroke="${P.trimBlack}" stroke-width="5"/>
    ${[0, 120, 240].map((a) => `<g transform="rotate(${a} 50 50)"><circle cx="50" cy="28" r="15" fill="none" stroke="${P.trimBlack}" stroke-width="6"/><path d="M50 50 L50 74" stroke="${P.trimBlack}" stroke-width="6"/></g>`).join("")}
    <circle cx="50" cy="50" r="8" fill="${P.trimBlack}"/><circle cx="50" cy="50" r="3" fill="${P.trim}"/></svg>`,
    { size: 192 },
  );
  const SERIAL = svg(
    `<svg viewBox="0 0 200 60"><rect width="200" height="60" rx="6" fill="${P.hullDark}" opacity="0.85"/>
    <text x="100" y="26" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="22" fill="${P.neonCyan}">QX-7731-B</text>
    <text x="100" y="50" text-anchor="middle" font-family="sans-serif" font-size="16" fill="${P.neonMagenta}">封 鎖 危 険</text></svg>`,
    { size: 256 },
  );
  const SCREEN = svg(
    `<svg viewBox="0 0 120 70"><rect width="120" height="70" fill="#06161c"/>
    <rect x="4" y="4" width="112" height="62" fill="none" stroke="${P.neonCyan}" stroke-width="2"/>
    <text x="10" y="22" font-family="monospace" font-size="12" fill="${P.neonLime}">SEAL: OK</text>
    <text x="10" y="38" font-family="monospace" font-size="12" fill="${P.neonCyan}">TEMP -4C</text>
    <path d="M10 56 L30 46 L50 54 L70 40 L90 50 L110 36" fill="none" stroke="${P.neonMagenta}" stroke-width="2.5"/></svg>`,
    { size: 192 },
  );
  const WARN = svg(
    `<svg viewBox="0 0 80 50"><rect width="80" height="50" fill="${P.warnRed}"/><path d="M40 6 L62 42 H18Z" fill="${P.trim}" stroke="${P.trimBlack}" stroke-width="3"/><rect x="38" y="18" width="4" height="12" fill="${P.trimBlack}"/><rect x="38" y="33" width="4" height="4" fill="${P.trimBlack}"/></svg>`,
    { size: 128 },
  );

  const decal = (tex: any, w: number, h: number, at: number[], dir: number[], bone: any, tint = "#ffffff") =>
    b.part(new THREE.PlaneGeometry(w, h), tint, { at, bone, dir, axis: "z", texture: tex });

  // ---------- main shell ----------
  box([2 * X0, 1.1, L], SHELL, [0, 1.9, ZC], body); // lower body
  box([2 * X0 - 0.25, 0.5, L - 0.1], SHELL, [0, 2.7, ZC], body, {}); // upper shoulder
  // chamfer rails (rounded-box look)
  for (const s of [1, -1]) {
    b.rod([s * 1.18, 2.98 - 0.12, Z0 + 0.05], [s * 1.18, 2.98 - 0.12, Z1 - 0.05], 0.12, P.podDark, { bone: body, sides: 6 });
    b.rod([s * 1.3, 1.45, Z0 + 0.05], [s * 1.3, 1.45, Z1 - 0.05], 0.1, P.podDark, { bone: body, sides: 6 });
    b.rod([s * 1.3, 2.55, Z0 + 0.05], [s * 1.3, 2.55, Z1 - 0.05], 0.08, P.podDark, { bone: body, sides: 6 });
  }
  // end caps (dark)
  for (const [z, d] of [[Z0 - 0.04, -1], [Z1 + 0.04, 1]] as number[][]) {
    box([2 * X0 + 0.04, 1.3, 0.12], CAP, [0, 2.0, z], body);
    box([2 * X0 - 0.2, 0.5, 0.12], CAP, [0, 2.72, z], body);
    box([2.0, 0.08, 0.06], P.podDark, [0, 2.35, z + d * 0.08], body);
  }

  // ---------- lid on podLid ----------
  box([2 * X0 - 0.5, 0.16, L - 0.3], SHELL, [0, 3.0, ZC], lid);
  box([0.5, 0.06, L - 0.5], P.podDark, [0, 3.09, ZC], lid);
  for (const s of [1, -1]) box([0.06, 0.1, L - 0.4], P.podDark, [s * 0.5, 3.08, ZC], lid);
  // hinge knuckles at rear of lid
  for (let i = 0; i < 4; i++)
    b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.3, 8), P.steel, { at: [-0.9 + i * 0.6, 2.95, Z0 + 0.1], bone: lid, dir: [1, 0, 0] });
  // lid seam glow (magenta)
  glow(box([2 * X0 - 0.2, 0.04, 0.04], P.neonMagenta, [0, 2.97, Z1 - 0.06], lid), 1.6);
  glow(box([2 * X0 - 0.2, 0.04, 0.04], P.neonMagenta, [0, 2.97, Z0 + 0.04], lid), 1.6);
  for (const s of [1, -1]) glow(box([0.04, 0.04, L - 0.2], P.neonMagenta, [s * (X0 - 0.27), 2.93, ZC], lid), 1.6);
  // lid latches
  for (const s of [1, -1])
    for (const z of [-1.6, -3.3]) {
      box([0.12, 0.3, 0.22], P.steel, [s * (X0 + 0.02), 2.6, z], lid);
      box([0.06, 0.16, 0.14], P.trimBlack, [s * (X0 + 0.1), 2.6, z], lid);
    }

  // ---------- side seam glow ----------
  for (const s of [1, -1]) {
    glow(box([0.03, 0.04, L - 0.3], P.neonMagenta, [s * (X0 + 0.015), 2.42, ZC], body), 1.6);
    glow(box([0.03, 0.04, L - 0.3], P.neonMagenta, [s * (X0 + 0.015), 1.5, ZC], body), 1.2);
  }

  // ---------- hazard stripes & decals ----------
  for (const s of [1, -1]) {
    decal(HAZ, 3.0, 0.3, [s * (X0 + 0.012), 1.75, ZC - 0.05], [s, 0, 0], body);
    decal(BIO, 0.85, 0.85, [s * (X0 + 0.012), 2.15, ZC + 0.7], [s, 0, 0], body);
    decal(SERIAL, 1.1, 0.33, [s * (X0 + 0.012), 2.15, ZC - 0.8], [s, 0, 0], body);
  }
  decal(BIO, 1.0, 1.0, [0, 2.0, Z0 - 0.105], [0, 0, -1], body);
  decal(HAZ, 2.0, 0.25, [0, 1.55, Z0 - 0.105], [0, 0, -1], body);

  // ---------- clamp straps ----------
  const sz = [-1.3, -2.0, -2.9, -3.6];
  for (const z of sz) {
    box([2 * X0 - 0.45, 0.06, 0.3], P.trim, [0, 3.12, z], lid);
    box([0.3, 0.04, 0.3], P.trimBlack, [0, 3.15, z], lid);
    for (const s of [1, -1]) {
      box([0.07, 1.2, 0.3], P.trim, [s * (X0 + 0.04), 2.05, z], body);
      box([0.075, 0.2, 0.3], P.trimBlack, [s * (X0 + 0.045), 2.4, z], body);
      box([0.1, 0.3, 0.5], P.trimBlack, [s * (X0 + 0.04), 1.4, z], body); // bolt plate
      for (const dz of [-0.17, 0.17])
        b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.06, 6), P.steel, { at: [s * (X0 + 0.11), 1.4, z + dz], bone: body, dir: [s, 0, 0] });
      // deck anchor
      box([0.3, 0.1, 0.55], P.podDark, [s * (X0 - 0.05), 1.33, z], body);
    }
  }

  // ---------- status screen (front face of pod, near cab) ----------
  box([1.0, 0.6, 0.08], P.hullDark, [0, 2.2, Z1 + 0.1], body);
  glow(decal(SCREEN, 0.86, 0.5, [0, 2.2, Z1 + 0.145], [0, 0, 1], body), 1.4);
  glow(box([1.0, 0.03, 0.03], P.neonCyan, [0, 1.85, Z1 + 0.13], body), 1.5);
  glow(box([1.0, 0.03, 0.03], P.neonCyan, [0, 2.55, Z1 + 0.13], body), 1.5);
  // cable conduits on front
  for (const s of [1, -1]) {
    b.rod([s * 0.8, 1.4, Z1 + 0.1], [s * 0.8, 2.6, Z1 + 0.1], 0.04, P.trimBlack, { bone: body, sides: 6 });
    b.rod([s * 0.9, 1.4, Z1 + 0.1], [s * 0.9, 2.6, Z1 + 0.1], 0.035, P.neonLime, { bone: body, sides: 6 });
  }

  // ---------- rear locking wheel ----------
  const rw = [0, 2.05, Z0 - 0.2];
  b.part(new THREE.CylinderGeometry(0.28, 0.28, 0.1, 10), P.steel, { at: rw, bone: body, dir: [0, 0, 1] });
  b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.2, 8), P.podDark, { at: [0, 2.05, Z0 - 0.15], bone: body, dir: [0, 0, 1] });
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI;
    b.rod([Math.cos(a) * 0.3, 2.05 + Math.sin(a) * 0.3, Z0 - 0.26], [-Math.cos(a) * 0.3, 2.05 - Math.sin(a) * 0.3, Z0 - 0.26], 0.025, P.rim, { bone: body, sides: 6 });
  }
  b.part(new THREE.TorusGeometry(0.28, 0.025, 5, 10), P.warnRed, { at: [0, 2.05, Z0 - 0.17], bone: body });
  // rear conduits
  for (const s of [1, -1]) {
    b.sweep(
      [[s * 0.9, 1.45, Z0 - 0.1], [s * 0.95, 1.7, Z0 - 0.3], [s * 0.7, 2.0, Z0 - 0.3], [s * 0.6, 2.4, Z0 - 0.15]],
      0.045,
      { bone: body, color: P.trimBlack, sides: 6 },
    );
    glow(box([0.05, 0.05, 0.05], P.neonLime, [s * 0.6, 2.4, Z0 - 0.12], body), 1.5);
  }

  // ---------- corner anchors ----------
  for (const s of [1, -1])
    for (const z of [Z0 + 0.12, Z1 - 0.12]) {
      box([0.22, 0.22, 0.22], P.podDark, [s * (X0 - 0.08), 1.42, z], body);
      b.part(new THREE.SphereGeometry(0.06, 6, 4), P.steel, { at: [s * (X0 + 0.04), 1.42, z], bone: body });
      b.part(new THREE.CylinderGeometry(0.1, 0.12, 0.1, 6), P.podDark, { at: [s * (X0 - 0.1), 2.97, z], bone: body });
    }

  // ---------- rivets along seams ----------
  for (const s of [1, -1])
    for (let i = 0; i < 10; i++) {
      const z = Z0 + 0.3 + i * (L - 0.6) / 9;
      b.part(new THREE.SphereGeometry(0.03, 5, 3), P.steel, { at: [s * (X0 + 0.01), 1.55 + R() * 0.0, z], bone: body });
    }

  // ---------- warning beacon ----------
  b.part(new THREE.CylinderGeometry(0.2, 0.24, 0.1, 8), P.trimBlack, { at: [0, 3.15, Z1 - 0.45], bone: lid });
  glow(b.part(new THREE.CylinderGeometry(0.14, 0.17, 0.2, 8), P.warnRed, { at: [0, 3.3, Z1 - 0.45], bone: lid }), 2.2);
  glow(b.part(new THREE.SphereGeometry(0.12, 8, 5), "#ff5566", { at: [0, 3.42, Z1 - 0.45], bone: lid }), 2.5);
  decal(WARN, 0.5, 0.31, [0, 3.101, Z1 - 1.0], [0, 1, 0], lid);
}
```

<!-- call: cab -->

```ts
import * as THREE from "three";
import { paint, svg, mix, noise, smoothstep, resolve, rng } from "agentic-3js-builder";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildCab({ b, J, P }: Ctx) {
  const bone = J.cab;
  const R = rng(11);

  // ---------- paints ----------
  const GUN = panelled(metal("iron", { tarnish: 0.2, polish: 0.15 }), { size: 0.45, aspect: 0.7, rivets: 0.07 });
  const grime = (base: any) =>
    paint((p, n) => {
      let c = resolve(base, p, n);
      const low = smoothstep(1.9, 1.2, p.y) * (0.5 + 0.5 * noise(p, 0.3, 4));
      c = mix(c, "#4a3322", Math.min(low * 0.7, 0.7));
      c = mix(c, "#0c0d10", 0.35 * smoothstep(0.62, 0.8, noise(p, 0.12, 9)));
      return c;
    });
  const HULLP = grime(GUN);
  const ARMORP = grime(panelled(P.armor, { size: 0.4, rivets: 0.06 }));

  // ---------- helpers ----------
  const box = (size: number[], at: number[], color: any, extra: any = {}) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { bone, at, ...extra });
  const neon = (size: number[], at: number[], color: string, k = 1.3) => glow(box(size, at, color), k);

  // ---------- textures ----------
  const HUD = svg(
    `<svg viewBox="0 0 200 24" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="24" fill="#0f3a4a"/>
    <rect x="1" y="1" width="198" height="22" fill="none" stroke="#2ff3ff" stroke-width="1.5"/>
    <path d="M12 12 h22 M40 6 v12 M48 12 h14 l6 -6 l6 12 l6 -6 h20" stroke="#2ff3ff" stroke-width="2" fill="none"/>
    <circle cx="130" cy="12" r="6" fill="none" stroke="#9dff3b" stroke-width="1.6"/><path d="M130 3 v18 M121 12 h18" stroke="#9dff3b" stroke-width="1"/>
    <path d="M150 7 h40 M150 12 h30 M150 17 h36" stroke="#2ff3ff" stroke-width="1.6"/>
  </svg>`,
    { size: 512 },
  );
  const DOOR = svg(
    `<svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="96" height="56" rx="3" fill="#16161a" opacity="0.85"/>
    <text x="8" y="36" font-family="monospace" font-weight="bold" font-size="30" fill="#e7b814">07</text>
    <g stroke="#2ff3ff" stroke-width="3" fill="none" stroke-linecap="round">
      <path d="M58 12 h30 M73 12 v10 M60 26 h26 M60 26 v8 M86 26 v8 M62 34 h22"/>
      <path d="M58 44 h30 M73 40 v16 M62 52 l-3 3 M84 52 l3 3"/>
    </g>
    <text x="8" y="53" font-family="monospace" font-size="10" fill="#9aa3b2">LJ-4417</text>
  </svg>`,
    { size: 256 },
  );
  const HAZ = svg(
    `<svg viewBox="0 0 64 16" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="16" fill="#e7b814"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<path d="M${i * 10 - 6} 16 l8 -16 h5 l-8 16z" fill="#16161a"/>`).join("")}</svg>`,
    { size: 256 },
  );

  // ---------- main wedge hull (profile in z,y) ----------
  const prof: [number, number, string?][] = [
    [0.3, 1.2],
    [4.2, 1.2],
    [4.2, 1.62, "sharp"],
    [2.9, 1.95, "sharp"],
    [2.5, 2.35, "sharp"],
    [0.5, 2.4, "sharp"],
    [0.3, 2.2, "sharp"],
  ] as any;
  b.extrude(prof as any, { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.5, color: HULLP, bone });

  // lower armoured skirt belt and side plates
  for (const s of [1, -1]) {
    box([0.1, 0.95, 1.9], [s * 1.3, 1.78, 1.4], ARMORP);
    box([0.1, 0.45, 1.5], [s * 1.3, 1.5, 3.3], ARMORP);
    // door seams
    box([0.02, 0.9, 0.025], [s * 1.356, 1.78, 0.75], P.trimBlack);
    box([0.02, 0.9, 0.025], [s * 1.356, 1.78, 2.2], P.trimBlack);
    box([0.02, 0.025, 1.45], [s * 1.356, 2.22, 1.47], P.trimBlack);
    box([0.02, 0.025, 1.45], [s * 1.356, 1.34, 1.47], P.trimBlack);
    box([0.04, 0.05, 0.22], [s * 1.37, 1.8, 2.05], P.steel); // handle
    // door decal
    b.part(new THREE.PlaneGeometry(0.85, 0.5), "#ffffff", {
      bone, at: [s * 1.362, 1.98, 1.45], dir: [s, 0, 0], axis: "z", texture: DOOR,
    });
    // yellow hazard kick strip
    box([0.04, 0.12, 1.5], [s * 1.34, 1.27, 1.47], "#ffffff", { texture: HAZ });
    // rivets (merged)
    const rv: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 6; i++)
      for (const y of [1.35, 2.2])
        rv.push(new THREE.SphereGeometry(0.022, 5, 4).translate(s * 1.36, y, 0.6 + i * 0.3));
    for (let i = 0; i < 5; i++) rv.push(new THREE.SphereGeometry(0.022, 5, 4).translate(s * 1.36, 1.5, 2.7 + i * 0.3));
    b.part(mergeAll(rv), P.steel, { bone, at: [0, 0, 0] });
    // wing mirror
    b.rod([s * 1.32, 2.0, 2.45], [s * 1.5, 2.1, 2.5], 0.015, P.hullDark, { bone });
    box([0.06, 0.26, 0.2], [s * 1.52, 2.1, 2.5], P.hullDark);
    box([0.01, 0.2, 0.15], [s * 1.552, 2.1, 2.5], P.glass);
    // cheek neon
    neon([0.03, 0.035, 1.0], [s * 1.37, 2.33, 1.5], P.neonCyan);
    // cyan roofline strips
    neon([0.05, 0.04, 1.9], [s * 1.2, 2.41, 1.4], P.neonCyan, 1.5);
    // hood side vents
    for (let i = 0; i < 3; i++) box([0.03, 0.05, 0.35], [s * 1.26, 1.5 + i * 0.1, 3.6], P.trimBlack);
    // headlight slits (angled)
    glow(
      box([0.5, 0.09, 0.07], [s * 1.0, 1.5, 4.215], P.neonLime, { rotation: [0, 0, s * 12] }),
      1.8,
    );
    box([0.62, 0.15, 0.04], [s * 1.0, 1.5, 4.2], P.trimBlack, { rotation: [0, 0, s * 12] });
    // bar support arms
    box([0.16, 0.3, 0.2], [s * 1.0, 1.4, 4.25], P.hullDark);
  }

  // roof armour
  box([2.0, 0.07, 1.8], [0, 2.43, 1.4], ARMORP);
  box([2.2, 0.1, 0.1], [0, 2.4, 2.55], P.hullDark); // brow
  for (let i = 0; i < 4; i++) box([0.5, 0.025, 0.06], [-0.55 + (i % 2) * 1.1, 2.47, 0.9 + Math.floor(i / 2) * 0.35], P.trimBlack);
  box([0.8, 0.05, 0.5], [0.4, 2.47, 1.9], P.hullDark);
  neon([0.6, 0.02, 0.04], [0.4, 2.5, 1.9], P.neonCyan, 1.2);

  // hood plates: central ridge and angled panels
  box([0.5, 0.08, 1.2], [0, 1.88, 3.5], ARMORP, { rotation: [-18, 0, 0] });
  for (const s of [1, -1]) box([0.8, 0.06, 1.2], [s * 0.7, 1.85, 3.45], ARMORP, { rotation: [-18, 0, s * 4] });
  neon([0.04, 0.03, 1.15], [0, 1.935, 3.5], P.neonCyan, 1.2);

  // ---------- windscreen slit ----------
  b.part(new THREE.PlaneGeometry(2.05, 0.26), "#ffffff", {
    bone, at: [0, 2.17, 2.715], dir: [0, 1, 1], axis: "z", texture: HUD,
  });
  glow(b.part(new THREE.PlaneGeometry(2.05, 0.26), "#ffffff", { bone, at: [0, 2.17, 2.716], dir: [0, 1, 1], axis: "z", texture: HUD }), 0.9);
  box([2.2, 0.05, 0.07], [0, 2.32, 2.58], P.trimBlack, { rotation: [45, 0, 0] });
  box([2.2, 0.05, 0.07], [0, 2.02, 2.82], P.trimBlack, { rotation: [45, 0, 0] });

  // ---------- front grille ----------
  box([1.0, 0.5, 0.06], [0, 1.45, 4.19], P.trimBlack);
  for (let i = 0; i < 5; i++) neon([0.8, 0.04, 0.03], [0, 1.28 + i * 0.09, 4.225], P.neonCyan, 1.6);
  box([0.05, 0.5, 0.05], [-0.25, 1.45, 4.23], P.hullDark);
  box([0.05, 0.5, 0.05], [0.25, 1.45, 4.23], P.hullDark);

  // ---------- ram bar ----------
  box([2.7, 0.3, 0.2], [0, 1.4, 4.38], "#ffffff", { texture: HAZ });
  box([2.78, 0.07, 0.26], [0, 1.58, 4.38], P.trimBlack);
  box([2.78, 0.07, 0.26], [0, 1.22, 4.38], P.trimBlack);
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.12, 0.16, 0.26, 6), P.trimBlack, { bone, at: [s * 1.38, 1.4, 4.38], rotation: [90, 0, 0] });
  }
  for (const x of [-0.6, 0, 0.6]) box([0.14, 0.5, 0.1], [x, 1.42, 4.5], P.hullDark, { rotation: [0, 0, 0] });

  // ---------- antenna ----------
  b.rod([-1.1, 2.43, 0.6], [-1.1, 3.35, 0.6], [0.025, 0.012], P.steel, { bone, sides: 6 } as any);
  box([0.1, 0.08, 0.1], [-1.1, 2.47, 0.6], P.hullDark);
  glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), P.warnRed, { bone, at: [-1.1, 3.38, 0.6] }), 2);
  b.rod([-1.0, 2.9, 0.6], [-1.2, 2.9, 0.6], 0.008, P.steel, { bone });

  // ---------- back wall of cab & small details ----------
  box([2.3, 0.9, 0.06], [0, 1.75, 0.33], P.hullDark);
  for (const s of [1, -1]) neon([0.04, 0.8, 0.04], [s * 1.0, 1.75, 0.37], P.neonMagenta, 1.1);
  // step plates
  for (const s of [1, -1]) box([0.2, 0.05, 0.7], [s * 1.38, 1.18, 1.4], P.steel);
}

function mergeAll(gs: THREE.BufferGeometry[]) {
  let pos: number[] = [], idx: number[] = [], nor: number[] = [], uv: number[] = [];
  for (const g of gs) {
    const base = pos.length / 3;
    pos.push(...(g.getAttribute("position").array as any));
    nor.push(...(g.getAttribute("normal").array as any));
    uv.push(...(g.getAttribute("uv").array as any));
    idx.push(...Array.from(g.getIndex()!.array as any).map((i: any) => i + base));
  }
  const m = new THREE.BufferGeometry();
  m.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  m.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  m.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  m.setIndex(idx);
  return m;
}
```

<!-- call: chassisRunning -->

```ts
import * as THREE from "three";
import { paint, svg, mix, noise, smoothstep, resolve } from "agentic-3js-builder";
import { panelled } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

type Ctx = {
  b: any;
  J: Record<string, any>;
  P: Record<string, string>;
  M: Record<string, [number, number, number]>;
};

export function buildChassisRunning({ b, J, P, M }: Ctx) {
  const body = J.body;

  // ---------- paints ----------
  const grime = (base: string) =>
    paint((p, n) => {
      const c = resolve(base, p, n);
      const dirt =
        0.55 * smoothstep(0.5, 0.8, noise(p, 0.35, 11)) +
        0.45 * smoothstep(0.9, 0.1, p.y) +
        0.15 * smoothstep(0.3, -0.6, n.y);
      return mix(c, "#15130f", Math.min(dirt, 0.75));
    });
  const rustGrime = (base: string) =>
    paint((p, n) => {
      const c = resolve(base, p, n);
      return mix(c, P.rust, 0.5 * smoothstep(0.55, 0.8, noise(p, 0.18, 5)) * smoothstep(0.2, -0.3, n.y + 0.2));
    });
  const HULL = panelled(grime(P.hull), { size: 0.4, rivets: 0.07 });
  const HULLD = panelled(grime(P.hullDark), { size: 0.3, rivets: 0.06 });
  const ARMOR = panelled(grime(P.armor), { size: 0.35, rivets: 0.06 });
  const hazard = (ax: "x" | "z") =>
    paint((p) => {
      const t = ax === "x" ? p.x + p.y : p.z + p.y;
      return ((Math.floor(t / 0.13) % 2) + 2) % 2 ? P.trim : P.trimBlack;
    });
  const MUD = paint((p, n) => {
    const c = resolve(P.hullDark, p, n);
    return mix(c, P.rust, 0.45 * smoothstep(0.3, 0.7, noise(p, 0.12, 2)) + 0.2 * smoothstep(0.7, 0.2, p.y));
  });

  // ---------- helpers ----------
  const box = (size: [number, number, number], color: any, at: [number, number, number], opts: any = {}) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { bone: body, at, ...opts });
  const cyl = (
    r: number, h: number, sides: number, color: any, at: [number, number, number],
    dir: [number, number, number] = [0, 1, 0], opts: any = {},
  ) => b.part(new THREE.CylinderGeometry(r, r, h, sides), color, { bone: body, at, dir, flat: true, ...opts });
  const merge = (list: THREE.BufferGeometry[]) => mergeGeometries(list)!;

  // ---------- ladder frame ----------
  for (const s of [1, -1]) {
    box([0.2, 0.36, 8.2], HULL, [s * 0.8, 0.96, 0]);
    // rail flange
    box([0.3, 0.04, 8.0], P.hullDark, [s * 0.8, 0.79, 0]);
    // underglow strips
    glow(box([0.07, 0.03, 7.4], P.neonMagenta, [s * 0.8, 0.745, 0]), 1.6);
  }
  const rungs: THREE.BufferGeometry[] = [];
  for (let z = -3.7; z <= 3.8; z += 0.75) rungs.push(new THREE.BoxGeometry(1.6, 0.12, 0.14).translate(0, 0.93, z));
  b.part(merge(rungs), HULLD, { bone: body, at: [0, 0, 0] });
  glow(box([1.5, 0.03, 0.06], P.neonMagenta, [0, 0.855, -2.1]), 1.4);
  glow(box([1.5, 0.03, 0.06], P.neonMagenta, [0, 0.855, 1.0]), 1.4);

  // deck
  box([2.0, 0.1, 8.1], HULL, [0, M.chassisTop[1] - 0.05, -0.05]);
  for (const s of [1, -1]) box([0.07, 0.06, 8.1], hazard("z"), [s * 0.985, 1.17, -0.05]);
  // deck cleats
  const cleats: THREE.BufferGeometry[] = [];
  for (let z = -3.8; z <= 0; z += 0.6)
    for (const s of [1, -1]) cleats.push(new THREE.BoxGeometry(0.12, 0.04, 0.12).translate(s * 0.88, 1.21, z));
  b.part(merge(cleats), P.steel, { bone: body, at: [0, 0, 0] });

  // ---------- side skirts ----------
  const skirtPlate = svg(
    `<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="118" height="38" rx="3" fill="#16161a" stroke="#e7b814" stroke-width="2"/>
      <path d="M10 12 h14 v4 h-10 v6 h10 v4 h-14z M28 12 h4 v14 h-4z" fill="#2ff3ff"/>
      <text x="42" y="19" font-family="monospace" font-weight="bold" font-size="12" fill="#e7b814">LOCKJAW</text>
      <text x="42" y="33" font-family="monospace" font-size="10" fill="#9dff3b">MK-IV // 0417</text>
    </svg>`,
    { size: 256 },
  );
  const skirts: [number, number][] = [[0.9, 2.3], [-2.1, 1.1]];
  skirts.forEach(([zc, len], i) => {
    for (const s of [1, -1]) {
      box([0.1, 0.55, len], ARMOR, [s * 1.05, 0.875, zc]);
      box([0.13, 0.09, len], hazard("z"), [s * 1.05, 0.64, zc]);
      glow(box([0.03, 0.03, len - 0.1], P.neonCyan, [s * 1.12, 1.1, zc]), 1.6);
      if (i === 0)
        b.part(new THREE.PlaneGeometry(0.72, 0.24), "#ffffff", {
          bone: body, at: [s * 1.112, 0.87, zc], dir: [s, 0, 0], axis: "z", texture: skirtPlate,
        });
    }
  });

  // ---------- axles, differentials, springs ----------
  for (const A of [M.axleFront, M.axleMid, M.axleRear]) {
    const [, ay, az] = A;
    cyl(0.09, 2.4, 8, P.steel, [0, ay, az], [1, 0, 0]);
    b.part(new THREE.SphereGeometry(0.3, 8, 6), rustGrime(P.hullDark), {
      bone: body, at: [0, ay, az], scale: [1, 0.85, 1.05], flat: true,
    });
    box([0.5, 0.2, 0.3], P.armor, [0, ay + 0.2, az]);
    cyl(0.07, 0.4, 6, P.steel, [0, ay + 0.05, az + 0.34], [0, 0, 1]); // driveshaft stub
    for (const s of [1, -1]) {
      box([0.28, 0.08, 0.9], P.hullDark, [s * 0.8, ay + 0.15, az]);
      box([0.26, 0.05, 0.7], P.steel, [s * 0.8, ay + 0.1, az]);
      box([0.1, 0.12, 0.12], P.steel, [s * 0.8, ay + 0.0, az + 0.3]); // U-bolt block
      box([0.1, 0.12, 0.12], P.steel, [s * 0.8, ay + 0.0, az - 0.3]);
    }
  }

  // ---------- wheels ----------
  const wheels: [string, number, number][] = [
    ["wheelFL", 1, M.axleFront[2]], ["wheelFR", -1, M.axleFront[2]],
    ["wheelML", 1, M.axleMid[2]], ["wheelMR", -1, M.axleMid[2]],
    ["wheelRL", 1, M.axleRear[2]], ["wheelRR", -1, M.axleRear[2]],
  ];
  const R = 0.55;
  const tyreGeo = new THREE.CylinderGeometry(R, R, 0.5, 8);
  const treadGeo = (() => {
    const l: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2 + Math.PI / 16;
      l.push(new THREE.BoxGeometry(0.1, 0.5, 0.13).rotateY(a).translate(Math.cos(a) * (R + 0.005), 0, -Math.sin(a) * (R + 0.005)));
    }
    return merge(l);
  })();
  const sideWallGeo = merge([
    new THREE.CylinderGeometry(0.46, 0.46, 0.03, 8).translate(0, 0.25, 0),
    new THREE.CylinderGeometry(0.46, 0.46, 0.03, 8).translate(0, -0.25, 0),
  ]);
  const lugGeo = (() => {
    const l: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      l.push(new THREE.CylinderGeometry(0.026, 0.026, 0.06, 6).translate(Math.cos(a) * 0.17, 0.33, Math.sin(a) * 0.17));
    }
    return merge(l);
  })();
  const ringGeo = new THREE.TorusGeometry(0.33, 0.022, 4, 12).rotateX(Math.PI / 2).translate(0, 0.285, 0);
  const rimDisc = new THREE.CylinderGeometry(0.4, 0.4, 0.08, 8).translate(0, 0.25, 0);
  const hubGeo = merge([
    new THREE.CylinderGeometry(0.24, 0.24, 0.1, 8).translate(0, 0.3, 0),
    new THREE.CylinderGeometry(0.08, 0.1, 0.1, 6).translate(0, 0.36, 0),
  ]);
  for (const [name, s, z] of wheels) {
    const j = J[name];
    const o = { bone: j, at: [s * 1.25, 0.55, z] as [number, number, number], dir: [s, 0, 0] as [number, number, number] };
    b.part(tyreGeo, P.tire, { ...o, flat: true });
    b.part(treadGeo, P.tire, { ...o, flat: true });
    b.part(sideWallGeo, P.hullDark, { ...o, flat: true });
    b.part(rimDisc, P.rim, { ...o, flat: true });
    b.part(hubGeo, P.steel, { ...o, flat: true });
    b.part(lugGeo, P.rim, { ...o, flat: true });
    glow(b.part(ringGeo, P.neonCyan, { ...o, flat: true }), 1.8);
    // inner side hub cap (axle end)
    b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.06, 8).translate(0, -0.27, 0), P.hullDark, { ...o, flat: true });
  }

  // ---------- fenders & mudflaps ----------
  for (const [, s, z] of wheels) {
    const x = s * 1.25;
    box([0.66, 0.07, 1.3], ARMOR, [x, 1.2, z]);
    box([0.66, 0.07, 0.55], ARMOR, [x, 1.08, z + 0.72], { rotation: [38, 0, 0] });
    box([0.66, 0.07, 0.55], ARMOR, [x, 1.08, z - 0.72], { rotation: [-38, 0, 0] });
    box([0.05, 0.08, 1.9], hazard("z"), [x + s * 0.3, 1.17, z]); // outer lip trim
    box([0.05, 0.1, 1.3], P.trimBlack, [x - s * 0.3, 1.17, z]);
  }
  for (const [, s, z] of wheels) {
    if (z > 0) continue;
    box([0.55, 0.42, 0.04], MUD, [s * 1.25, 0.5, z - 0.66]);
    box([0.55, 0.05, 0.06], P.trim, [s * 1.25, 0.72, z - 0.66]);
  }
  // front mudflaps (low)
  for (const s of [1, -1]) box([0.55, 0.3, 0.04], MUD, [s * 1.25, 0.55, M.axleFront[2] - 0.66]);

  // ---------- front crossmember / skid ----------
  box([2.2, 0.3, 0.2], hazard("x"), [0, 0.85, 4.1]);
  box([1.4, 0.08, 0.7], P.hullDark, [0, 0.62, 3.8], { rotation: [-8, 0, 0] });
  for (const s of [1, -1]) {
    cyl(0.06, 0.2, 6, P.steel, [s * 0.7, 0.85, 4.25], [0, 0, 1]);
    glow(box([0.3, 0.04, 0.03], P.neonCyan, [s * 0.5, 0.72, 4.215]), 1.5);
  }

  // ---------- rear bumper, tail lights, hook ----------
  box([2.6, 0.32, 0.2], HULLD, [0, 0.76, -4.1]);
  box([2.6, 0.07, 0.22], hazard("x"), [0, 0.57, -4.1]);
  for (const s of [1, -1]) {
    glow(box([0.42, 0.14, 0.05], P.warnRed, [s * 0.95, 0.8, -4.215]), 2);
    box([0.5, 0.2, 0.03], P.trimBlack, [s * 0.95, 0.8, -4.2]);
    glow(box([0.2, 0.05, 0.04], P.warnRed, [s * 0.5, 0.88, -4.215]), 1.5);
  }
  box([0.28, 0.2, 0.18], P.steel, [0, 0.7, -4.22]);
  b.part(new THREE.TorusGeometry(0.12, 0.035, 5, 8), P.steel, {
    bone: body, at: [0, 0.68, -4.34], flat: true,
  });
  glow(box([2.2, 0.03, 0.04], P.neonMagenta, [0, 0.62, -4.215]), 1.4);

  // ---------- exhaust stacks ----------
  for (const s of [1, -1]) {
    const x = s * 1.15;
    box([0.26, 0.12, 0.4], P.hullDark, [s * 1.1, 1.14, 0.05]);
    cyl(0.1, 1.3, 8, P.hullDark, [x, 1.85, 0.05]);
    for (const y of [1.4, 1.9, 2.4]) cyl(0.125, 0.07, 8, P.steel, [x, y, 0.05]);
    cyl(0.14, 0.08, 8, P.rim, [x, 2.52, 0.05]);
    cyl(0.08, 0.04, 8, P.trimBlack, [x, 2.565, 0.05]);
    box([0.05, 0.8, 0.16], P.rust, [x + s * 0.12, 1.65, 0.05]);
    box([0.04, 0.7, 0.05], P.trim, [x + s * 0.12, 1.65, 0.05]);
  }

  // ---------- fuel/hydraulic details on frame ----------
  for (const s of [1, -1]) {
    cyl(0.14, 1.0, 8, P.steel, [s * 0.55, 0.98, -1.95], [0, 0, 1], { scale: [1, 1, 1] });
    box([0.05, 0.05, 0.05], P.neonLime, [s * 0.55, 1.12, -1.95]);
  }

  return body;
}
```