```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  bezier,
  polyline,
  paint,
  mix,
  noise,
  grain,
  svg,
} from "agentic-3js-builder";
import type { Fill } from "agentic-3js-builder";

export const meta = {
  name: "Skylark No. 07",
  description:
    "A whimsical barnstorming biplane: buttercream fabric wings, a cherry-red fuselage, teal radial-engine cowling, wooden propeller, wire bracing and a tiny open cockpit.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "Skylark barnstormer", paintSize: 2048 });
  const root = b.joint("airframe", { at: [0, 0, 0] });

  const C = {
    red: "#b93635",
    scarlet: "#dc5142",
    burgundy: "#702e36",
    cream: "#f5dfa5",
    ivory: "#fff0c6",
    gold: "#dba84c",
    paleGold: "#ffe0
90".replace("\n", ""),
    teal: "#267d80",
    darkTeal: "#18474f",
    ink: "#263039",
    tire: "#303039",
    sidewall: "#46454a",
    steel: "#a2afb1",
    cable: "#536770",
    leather: "#713e31",
    leatherLight: "#a96a46",
    black: "#20272b",
  };
  // Warm, slightly uneven fabric and enamel rather than polished modern metal.
  const fabric = paint((p, n) => {
    const rib = Math.abs(p.x / 0.34 - Math.round(p.x / 0.34));
    let col = mix("#e0c488", "#fff0c3", 0.55 + n.y * 0.15);
    col = mix(col, "#bd985a", rib < 0.035 ? 0.25 : 0);
    return mix(col, "#cfb783", noise(p, 0.09, 23) * 0.09);
  });
  const enamel = paint((p, n) =>
    mix("#9c3038", "#e85a46", 0.36 + 0.34 * Math.max(0, n.y) + 0.15 * noise(p, 0.28, 8)),
  );
  const wood = grain("#77452e", "#dcaa69", {
    size: 0.035,
    axis: "y",
    seed: 14,
  });
  const brass = paint((p, n) =>
    mix("#a97734", "#f7d180", 0.45 + 0.3 * n.y + 0.1 * noise(p, 0.1, 5)),
  );

  function box(
    at: number[],
    size: number[],
    color: Fill,
    rotation: number[] = [0, 0, 0],
    name = "fitting",
  ) {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      rotation,
      bone: root,
      name,
    });
  }
  function ball(at: number[], scale: number[], color: Fill, name = "rounded fitting") {
    return b.part(new THREE.SphereGeometry(1, 10, 6), color, {
      at,
      scale,
      bone: root,
      flat: true,
      name,
    });
  }
  function rod(a: number[], c: number[], r: number, color: Fill, name = "brace") {
    return b.rod(a, c, r, { color, bone: root, sides: 6, name });
  }
  function cyl(
    at: number[],
    r: number,
    length: number,
    color: Fill,
    axis: number[] = [0, 0, 1],
    segments = 12,
    name = "fitting",
  ) {
    return b.part(new THREE.CylinderGeometry(r, r, length, segments), color, {
      at,
      dir: axis,
      bone: root,
      name,
    });
  }
  function drawing(
    texture: THREE.Texture,
    at: number[],
    size: number[],
    dir: number[] = [0, 0, 1],
    up: number[] = [0, 1, 0],
    name = "painted insignia",
  ) {
    return b.part(new THREE.PlaneGeometry(size[0], size[1]), "#ffffff", {
      at,
      dir,
      up,
      axis: "z",
      texture,
      bone: root,
      name,
    });
  }
  function torus(
    at: number[],
    r: number,
    tube: number,
    color: Fill,
    dir: number[] = [0, 0, 1],
    name = "rim",
  ) {
    return b.part(new THREE.TorusGeometry(r, tube, 6, 24), color, {
      at,
      dir,
      axis: "z",
      bone: root,
      name,
    });
  }

  const roundel = svg(`
    <svg viewBox="0 0 200 200">
      <circle cx="100" cy="100" r="97" fill="#763339"/>
      <circle cx="100" cy="100" r="87" fill="#f5dfa5"/>
      <circle cx="100" cy="100" r="73" fill="#267d80"/>
      <path d="M100 30 L117 77 L167 78 L127 108 L141 158
               L100 129 L59 158 L73 108 L33 78 L83 77Z"
            fill="#fff0c6" stroke="#18474f" stroke-width="4"/>
      <circle cx="100" cy="100" r="9" fill="#dba84c"/>
    </svg>`, { size: 384 });

  const race = svg(`
    <svg viewBox="0 0 240 180">
      <path d="M23 23 Q120 0 217 23 L226 133 Q120 178 14 133Z"
            fill="#f5dfa5" stroke="#77303a" stroke-width="8"/>
      <path d="M34 31 Q120 14 206 31" fill="none" stroke="#dba84c" stroke-width="4"/>
      <text x="120" y="128" text-anchor="middle" font-family="Georgia,serif"
            font-size="122" font-weight="bold" fill="#214f58">07</text>
      <path d="M49 145 L191 145" stroke="#dba84c" stroke-width="4"/>
    </svg>`, { size: 384 });

  const nameplate = svg(`
    <svg viewBox="0 0 440 140">
      <path d="M8 73 Q98 121 213 94 Q333 65 430 84"
            stroke="#ffd98a" stroke-width="5" fill="none"/>
      <text x="220" y="84" text-anchor="middle" font-family="Georgia,serif"
            font-style="italic" font-weight="bold" font-size="76"
            fill="#fff0c6" stroke="#702e36" stroke-width="1">Skylark</text>
      <text x="225" y="123" text-anchor="middle" font-family="serif"
            letter-spacing="7" font-size="17" fill="#ffe090">FLYING CIRCUS</text>
    </svg>`, { size: 512 });

  const sunburst = svg(`
    <svg viewBox="0 0 200 220">
      <path d="M100 175 L17 13 L65 4Z M100 175 L89 0 L123 7Z
               M100 175 L154 20 L187 57Z M100 175 L200 92 L198 130Z"
            fill="#f5dfa5"/>
      <circle cx="100" cy="175" r="29" fill="#dba84c"/>
      <circle cx="100" cy="175" r="17" fill="#fff0c6"/>
    </svg>`, { size: 256 });

  const gauge = svg(`
    <svg viewBox="0 0 120 120">
      <circle cx="60" cy="60" r="57" fill="#efdbaa" stroke="#b58643" stroke-width="6"/>
      <circle cx="60" cy="60" r="46" fill="#253c43"/>
      <path d="M28 78 L34 72 M22 60 L31 60 M28 40 L35 44
               M43 25 L47 34 M60 21 L60 31 M78 25 L74 34
               M94 40 L86 45 M99 60 L89 60 M93 78 L86 73"
            stroke="#fff0c6" stroke-width="4"/>
      <path d="M57 64 L80 32 L64 63Z" fill="#e86c4b"/>
      <circle cx="60" cy="60" r="6" fill="#e4ba67"/>
      <text x="60" y="87" text-anchor="middle" font-family="sans-serif"
            font-size="10" fill="#f5dfa5">AIR</text>
    </svg>`, { size: 192 });

  const caution = svg(`
    <svg viewBox="0 0 240 80">
      <rect x="3" y="3" width="234" height="74" rx="9" fill="#efd9a1"
            stroke="#713e31" stroke-width="5"/>
      <text x="120" y="31" text-anchor="middle" font-family="sans-serif"
            font-size="18" font-weight="bold" fill="#713e31">NO STEP</text>
      <path d="M27 51 H213" stroke="#713e31" stroke-width="3"/>
      <path d="M38 61 H202" stroke="#dba84c" stroke-width="3"/>
    </svg>`, { size: 256 });

  // Long, tapered wooden-and-fabric fuselage. The cockpit opening sits above
  // the low central shell, rather than being painted onto a closed canopy.
  const hull = b.loft(
    [
      { at: [0, 1.36, -3.02], w: 0.14, h: 0.19 },
      { at: [0, 1.39, -2.65], w: 0.26, h: 0.32 },
      { at: [0, 1.43, -1.85], w: 0.53, h: 0.48 },
      { at: [0, 1.48, -1.05], w: 0.79, h: 0.63 },
      { at: [0, 1.52, -0.1], w: 1.0, h: 0.78 },
      { at: [0, 1.61, 0.86], w: 1.05, h: 0.92 },
      { at: [0, 1.66, 1.65], w: 0.92, h: 0.87 },
    ],
    { color: enamel, bone: root, sides: 10, name: "tapered scarlet fuselage" },
  );

  b.loft(
    [
      { at: [0, 1.58, -2.75], w: 0.16, h: 0.16 },
      { at: [0, 1.7, -2.04], w: 0.36, h: 0.26 },
      { at: [0, 1.8, -1.45], w: 0.54, h: 0.3 },
    ],
    { color: enamel, bone: root, sides: 8, name: "rear turtledeck" },
  );
  b.loft(
    [
      { at: [0, 1.83, -0.48], w: 0.73, h: 0.26 },
      { at: [0, 1.91, 0.14], w: 0.88, h: 0.38 },
      { at: [0, 1.9, 1.34], w: 0.86, h: 0.37 },
    ],
    { color: enamel, bone: root, sides: 10, name: "forward cockpit deck" },
  );

  // Cream arrow-like coach lines follow the narrowing sides.
  for (const s of [-1, 1]) {
    const line = [
      [s * 0.095, 1.43, -2.85],
      [s * 0.23, 1.5, -2.03],
      [s * 0.38, 1.58, -1.16],
      [s * 0.48, 1.67, -0.2],
      [s * 0.51, 1.73, 0.85],
      [s * 0.46, 1.76, 1.48],
    ];
    b.sweep(catmull(line), 0.018, {
      bone: root, color: C.cream, sides: 5, name: "ivory fuselage pinstripe",
    });
    b.decal(hull, nameplate, {
      at: [s * 0.5, 1.54, 0.5],
      dir: [s, 0, 0],
      size: [0.92, 0.3],
      bone: root,
      name: "Skylark hand lettering",
    });
    b.decal(hull, race, {
      at: [s * 0.29, 1.46, -1.73],
      dir: [s, 0, 0],
      size: [0.52, 0.4],
      bone: root,
      name: "fuselage race number",
    });
  }

  // Oval cockpit, rolled leather coaming, upholstered seat and instrument panel.
  ball([0, 1.805, -0.97], [0.355, 0.065, 0.49], C.black, "cockpit well");
  const cockpitRim: number[][] = [];
  for (let i = 0; i < 24; i++) {
    const a = i * Math.PI / 12;
    cockpitRim.push([0.365 * Math.cos(a), 1.865, -0.97 + 0.49 * Math.sin(a)]);
  }
  b.sweep(polyline(cockpitRim, { closed: true }), 0.043, {
    color: C.leather, bone: root, sides: 8, name: "rolled leather cockpit coaming",
  });
  box([0, 1.85, -1.18], [0.44, 0.09, 0.38], C.leatherLight, [0, 0, 0], "seat cushion");
  box([0, 2.015, -1.34], [0.44, 0.35, 0.09], C.leather, [-12, 0, 0], "seat back");
  for (const x of [-0.12, 0.12]) {
    box([x, 2.035, -1.279], [0.065, 0.29, 0.014], C.cream, [-12, 0, 0], "seat harness");
  }
  box([0, 1.885, -1.05], [0.1, 0.025, 0.07], brass, [0, 0, 0], "harness buckle");
  box([0, 1.915, -0.58], [0.54, 0.24, 0.06], wood, [-9, 0, 0], "instrument dashboard");
  for (const x of [-0.16, 0, 0.16]) {
    drawing(gauge, [x, 1.949, -0.617], [0.115, 0.115], [0, 0, -1], [0, 1, 0], "cockpit dial");
  }
  rod([0, 1.83, -0.92], [0, 2.015, -0.83], 0.018, C.ink, "control stick");
  ball([0, 2.015, -0.83], [0.035, 0.025, 0.03], C.leather, "stick grip");

  // Three small blue-tinted windscreen panes, with a delicate brass frame.
  b.slab(
    [[-0.25, 1.98, -0.47], [0.25, 1.98, -0.47], [0.18, 2.25, -0.52], [-0.18, 2.25, -0.52]],
    { color: "#9bc4c3", thickness: 0.012, bone: root, name: "windscreen" },
  );
  for (const s of [-1, 1]) {
    rod([s * 0.25, 1.98, -0.47], [s * 0.18, 2.25, -0.52], 0.012, brass, "windscreen upright");
    b.slab(
      [[s * 0.25, 1.98, -0.47], [s * 0.18, 2.25, -0.52], [s * 0.32, 2.02, -0.73]],
      { color: "#7facae", thickness: 0.01, bone: root, name: "windscreen side" },
    );
    rod([s * 0.18, 2.25, -0.52], [s * 0.32, 2.02, -0.73], 0.009, brass);
  }
  rod([-0.18, 2.25, -0.52], [0.18, 2.25, -0.52], 0.012, brass, "windscreen top rail");
  rod([-0.16, 2.18, -0.505], [0.02, 2.2, -0.509], 0.009, C.ivory, "glass glint");

  // Cambered airfoil sections with blunt rounded tips, deliberately low-poly.
  function wingGeometry(span: number, chord: number, y: number, z: number) {
    const sections = [-1, -0.965, -0.88, -0.55, 0, 0.55, 0.88, 0.965, 1];
    const profile = [
      [0.5, 0],
      [0.38, 0.062],
      [0.13, 0.095],
      [-0.22, 0.065],
      [-0.5, 0.005],
      [-0.28, -0.025],
      [0.13, -0.035],
      [0.4, -0.025],
    ];
    const positions: number[] = [];
    const uv: number[] = [];
    for (const t of sections) {
      const taper = Math.abs(t) === 1 ? 0.66 : Math.abs(t) > 0.96 ? 0.88 : 1;
      for (const [pz, py] of profile) {
        positions.push(t * span / 2, y + py * taper, z + pz * chord * taper);
        uv.push((t + 1) / 2, pz + 0.5);
      }
    }
    const indices: number[] = [];
    const n = profile.length;
    for (let j = 0; j < sections.length - 1; j++) {
      for (let k = 0; k < n; k++) {
        const a = j * n + k;
        const c = j * n + (k + 1) % n;
        indices.push(a, a + n, c, c, a + n, c + n);
      }
    }
    for (let k = 1; k < n - 1; k++) {
      indices.push(0, k, k + 1);
      const end = (sections.length - 1) * n;
      indices.push(end, end + k + 1, end + k);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
  }

  for (const upper of [false, true]) {
    const y = upper ? 2.78 : 1.21;
    const z = upper ? 0.3 : 0.18;
    const span = upper ? 8.2 : 7.65;
    const chord = upper ? 1.62 : 1.52;
    const wingPaint = paint((p) => Math.abs(p.x) > span / 2 - 0.43 ? enamel : fabric);
    b.part(wingGeometry(span, chord, y, z), wingPaint, {
      at: [0, 0, 0],
      bone: root,
      name: upper ? "upper fabric wing" : "lower fabric wing",
    });

    // Rib tapes are raised only very slightly and stop short of the trailing edge.
    for (let i = -10; i <= 10; i++) {
      const x = i * 0.34;
      if (!upper && Math.abs(x) < 0.55) continue;
      b.sweep(
        polyline([
          [x, y + 0.045, z + chord * 0.43],
          [x, y + 0.098, z + chord * 0.13],
          [x, y + 0.07, z - chord * 0.22],
          [x, y + 0.015, z - chord * 0.46],
        ]),
        0.008,
        { color: "#ead09a", sides: 4, bone: root, name: "stitched wing rib tape" },
      );
    }
    for (const s of [-1, 1]) {
      // Dark seam and teal trailing ailerons.
      box(
        [s * 2.66, y + 0.011, z - chord * 0.43],
        [1.66, 0.035, 0.22],
        C.teal,
        [0, 0, 0],
        "teal aileron",
      );
      rod(
        [s * 1.83, y + 0.036, z - chord * 0.35],
        [s * 3.49, y + 0.036, z - chord * 0.35],
        0.009, C.darkTeal, "aileron hinge line",
      );
      for (const x of [1.98, 2.63, 3.27]) {
        box([s * x, y + 0.04, z - chord * 0.35], [0.075, 0.026, 0.09], brass, [0, 0, 0], "aileron hinge");
      }
      drawing(
        roundel,
        [s * 2.62, y + 0.108, z + 0.12],
        [0.93, 0.93],
        [0, 1, 0],
        [0, 0, 1],
        "wing star roundel",
      );
      if (!upper) {
        drawing(caution, [s * 0.94, y + 0.107, z + 0.2], [0.34, 0.115], [0, 1, 0], [0, 0, 1]);
      }
    }
  }
  drawing(race, [0, 2.893, 0.37], [0.77, 0.56], [0, 1, 0], [0, 0, 1], "upper wing number");

  // Interplane struts, with metal shoes and fine crossed flying wires.
  for (const s of [-1, 1]) {
    const lowX = s * 2.64;
    const highX = s * 2.87;
    for (const z of [-0.39, 0.85]) {
      const bottom = [lowX, 1.275, z - 0.1];
      const top = [highX, 2.78, z];
      rod(bottom, top, 0.048, wood, "varnished interplane strut");
      for (const t of [0.055, 0.945]) {
        const p = bottom.map((v, i) => v + (top[i] - v) * t);
        const q = bottom.map((v, i) => v + (top[i] - v) * (t + 0.045));
        rod(p, q, 0.057, C.teal, "strut metal ferrule");
      }
    }
    rod([lowX, 1.3, -0.49], [highX, 2.75, 0.85], 0.009, C.cable, "interplane crosswire");
    rod([lowX, 1.3, 0.75], [highX, 2.75, -0.39], 0.009, C.cable, "interplane crosswire");

    for (const z of [-0.32, 0.77]) {
      rod([s * 0.43, 1.94, z], [s * 0.77, 2.78, z + 0.08], 0.035, C.teal, "cabane strut");
      rod([s * 0.56, 1.28, z], [highX, 2.76, z + 0.08], 0.011, C.cable, "flying wire");
      rod([s * 0.77, 2.76, z + 0.08], [lowX, 1.3, z - 0.07], 0.009, C.cable, "landing wire");
      rod([s * 0.61, 1.31, z], [s * 0.82, 1.44, z + 0.01], 0.02, brass, "wire turnbuckle");
    }
  }

  // Tailplane: red-edged cream horizontal stabilizer and a proud teal rudder.
  b.extrude(
    [[-1.22, -0.2], [-1.15, 0.23], [-0.69, 0.47], [0, 0.51],
      [0.69, 0.47], [1.15, 0.23], [1.22, -0.2], [0.8, -0.4], [-0.8, -0.4]],
    {
      at: [0, 1.43, -2.64],
      x: [1, 0, 0], y: [0, 0, 1],
      thickness: 0.065, color: C.red, bone: root, name: "elliptical tailplane",
    },
  );
  b.extrude(
    [[-1.09, -0.12], [-1.02, 0.2], [-0.64, 0.36], [0, 0.4],
      [0.64, 0.36], [1.02, 0.2], [1.09, -0.12], [0.72, -0.26], [-0.72, -0.26]],
    {
      at: [0, 1.467, -2.64],
      x: [1, 0, 0], y: [0, 0, 1],
      thickness: 0.01, color: fabric, bone: root, name: "tailplane fabric inset",
    },
  );
  rod([-1.1, 1.48, -2.83], [1.1, 1.48, -2.83], 0.012, C.burgundy, "elevator hinge");
  const fin = b.extrude(
    [[-0.6, 0], [-0.59, 0.62], [-0.4, 1.06], [-0.12, 1.2],
      [0.15, 1.13], [0.35, 0.8], [0.61, 0.08], [0.54, -0.08]],
    {
      at: [0, 1.47, -2.66],
      x: [0, 0, 1], y: [0, 1, 0],
      thickness: 0.095, color: C.teal, bone: root, name: "tall scalloped rudder",
    },
  );
  for (const s of [-1, 1]) {
    b.decal(fin, sunburst, {
      at: [s * 0.055, 2.12, -2.81],
      dir: [s, 0, 0],
      size: [0.67, 0.91],
      bone: root,
      name: "rudder sunburst",
    });
    rod([s * 0.07, 1.5, -3.02], [s * 0.07, 2.47, -3.02], 0.012, C.darkTeal, "rudder hinge");
    for (const y of [1.65, 2.02, 2.34]) {
      cyl([s * 0.064, y, -3.02], 0.025, 0.02, brass, [s, 0, 0], 8, "rudder hinge pin");
    }
    rod([s * 0.12, 1.44, -2.28], [s * 0.98, 1.45, -2.72], 0.012, C.cable, "tailplane brace");
    rod([s * 0.22, 1.38, -1.93], [s * 0.065, 1.71, -3.1], 0.007, C.cable, "rudder control cable");
  }

  // Radial engine: a teal barrel ending in a brass-edged exposed mechanical face.
  cyl([0, 1.68, 1.64], 0.535, 0.14, C.darkTeal, [0, 0, 1], 16, "rear cowling band");
  cyl([0, 1.68, 1.91], 0.565, 0.47, C.teal, [0, 0, 1], 16, "engine cowling");
  torus([0, 1.68, 2.155], 0.535, 0.037, brass, [0, 0, 1], "brass cowling lip");
  cyl([0, 1.68, 2.16], 0.5, 0.025, C.black, [0, 0, 1], 16, "engine recess");
  cyl([0, 1.68, 2.245], 0.2, 0.19, C.steel, [0, 0, 1], 12, "crankcase");

  for (let i = 0; i < 9; i++) {
    const a = i * Math.PI * 2 / 9;
    const dx = Math.sin(a);
    const dy = Math.cos(a);
    const axis = [dx, dy, 0];
    cyl([dx * 0.325, 1.68 + dy * 0.325, 2.255], 0.08, 0.25, C.ink, axis, 8, "radial cylinder");
    for (let j = 0; j < 4; j++) {
      const r = 0.285 + j * 0.045;
      cyl([dx * r, 1.68 + dy * r, 2.255], 0.092, 0.018, C.steel, axis, 8, "engine cooling fin");
    }
    ball([dx * 0.466, 1.68 + dy * 0.466, 2.255], [0.055, 0.055, 0.075], C.ink, "rocker cover");
    rod(
      [dx * 0.16 + dy * 0.037, 1.68 + dy * 0.16 - dx * 0.037, 2.35],
      [dx * 0.43 + dy * 0.037, 1.68 + dy * 0.43 - dx * 0.037, 2.34],
      0.012, brass, "radial pushrod",
    );
  }
  for (let i = 0; i < 16; i++) {
    const a = i * Math.PI / 8;
    ball([0.565 * Math.sin(a), 1.68 + 0.565 * Math.cos(a), 2.075],
      [0.018, 0.018, 0.018], C.paleGold, "cowling rivet");
  }
  for (const s of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      box([s * 0.554, 1.72, 1.76 + i * 0.074], [0.012, 0.19, 0.025], C.darkTeal, [0, 0, 0], "cowling cooling slot");
    }
    b.sweep(
      catmull([[s * 0.44, 1.34, 1.98], [s * 0.56, 1.22, 1.75], [s * 0.58, 1.2, 1.27]]),
      0.047,
      { color: "#9a6a49", bone: root, sides: 8, caps: "flat", name: "swept exhaust pipe" },
    );
    cyl([s * 0.58, 1.2, 1.265], 0.035, 0.008, C.black, [0, 0, 1], 8, "exhaust opening");
  }

  // Laminated wooden two-blade propeller, with painted tips and a bolted hub.
  const propAngle = -22 * Math.PI / 180;
  for (const s of [-1, 1]) {
    const X = [Math.cos(propAngle) * s, Math.sin(propAngle) * s, 0];
    const Y = [-Math.sin(propAngle) * s, Math.cos(propAngle) * s, 0];
    b.extrude(
      [[-0.075, 0.05], [-0.12, 0.37], [-0.19, 0.87], [-0.13, 1.14],
        [0.015, 1.21], [0.1, 1.12], [0.13, 0.78], [0.085, 0.26]],
      {
        at: [0, 1.68, 2.57], x: X, y: Y,
        thickness: 0.065, color: wood, bone: root, name: "laminated wooden propeller blade",
      },
    );
    b.extrude(
      [[-0.163, 1.0], [-0.13, 1.14], [0.015, 1.21], [0.1, 1.12], [0.112, 1.0]],
      {
        at: [0, 1.68, 2.608], x: X, y: Y,
        thickness: 0.008, color: C.cream, bone: root, name: "ivory propeller tip",
      },
    );
    b.extrude(
      [[-0.169, 0.96], [-0.163, 1.0], [0.112, 1.0], [0.115, 0.96]],
      {
        at: [0, 1.68, 2.613], x: X, y: Y,
        thickness: 0.009, color: C.red, bone: root, name: "red propeller tip band",
      },
    );
  }
  cyl([0, 1.68, 2.57], 0.175, 0.15, C.leather, [0, 0, 1], 12, "propeller wooden hub");
  cyl([0, 1.68, 2.66], 0.132, 0.035, brass, [0, 0, 1], 12, "hub plate");
  for (let i = 0; i < 6; i++) {
    const a = i * Math.PI / 3;
    cyl([0.096 * Math.sin(a), 1.68 + 0.096 * Math.cos(a), 2.685],
      0.018, 0.018, C.ink, [0, 0, 1], 6, "propeller hub bolt");
  }
  ball([0, 1.68, 2.71], [0.068, 0.068, 0.075], C.paleGold, "hub cap");

  // Wide, sturdy undercarriage: two spoked balloon tyres and sprung axle.
  rod([-1.12, 0.46, 0.91], [1.12, 0.46, 0.91], 0.055, C.steel, "main axle");
  for (const s of [-1, 1]) {
    rod([s * 0.4, 1.21, 1.25], [s * 0.98, 0.46, 0.91], 0.055, C.teal, "forward landing leg");
    rod([s * 0.39, 1.13, -0.2], [s * 0.98, 0.46, 0.91], 0.049, C.teal, "rear landing leg");
    rod([s * 0.17, 1.16, 0.98], [-s * 0.82, 0.48, 0.91], 0.012, C.cable, "undercarriage cross brace");
    for (let j = 0; j < 6; j++) {
      torus([s * (0.78 + j * 0.025), 0.46, 0.91], 0.073, 0.012, C.cream, [1, 0, 0], "axle bungee wrap");
    }
    const x = s * 1.095;
    cyl([x, 0.43, 0.91], 0.43, 0.23, C.tire, [1, 0, 0], 20, "balloon tyre");
    for (const face of [-1, 1]) {
      const xx = x + face * 0.12;
      cyl([xx, 0.43, 0.91], 0.342, 0.012, C.sidewall, [1, 0, 0], 20, "tyre sidewall");
      torus([xx + face * 0.01, 0.43, 0.91], 0.277, 0.027, C.cream, [1, 0, 0], "ivory wheel rim");
      cyl([xx + face * 0.014, 0.43, 0.91], 0.244, 0.012, C.darkTeal, [1, 0, 0], 16, "wheel spoke recess");
      for (let j = 0; j < 10; j++) {
        const a = j * Math.PI / 5;
        rod(
          [xx + face * 0.027, 0.43, 0.91],
          [xx + face * 0.027, 0.43 + 0.238 * Math.cos(a), 0.91 + 0.238 * Math.sin(a)],
          0.012, C.steel, "wheel spoke",
        );
      }
      cyl([xx + face * 0.04, 0.43, 0.91], 0.089, 0.05, brass, [1, 0, 0], 10, "wheel hub");
      cyl([xx + face * 0.07, 0.43, 0.91], 0.034, 0.015, C.ink, [1, 0, 0], 6, "axle nut");
    }
  }

  // The rear shoe reaches the floor; no display base is added.
  b.sweep(
    catmull([[0, 1.28, -2.58], [0, 0.8, -2.92], [0, 0.24, -3.31], [0, 0.055, -3.57]]),
    [0.052, 0.045, 0.033, 0.028],
    { color: wood, sides: 6, bone: root, name: "curved wooden tailskid" },
  );
  rod([0, 0.055, -3.44], [0, 0.055, -3.7], 0.055, C.ink, "tailskid ground shoe");
  rod([0, 1.13, -2.21], [0, 0.72, -3.0], 0.023, C.teal, "tailskid support");

  // Boarding step, handholds and small inspection fittings complete the puppet.
  for (const s of [-1, 1]) {
    rod([s * 0.34, 1.23, -0.91], [s * 0.62, 0.92, -0.91], 0.023, C.teal, "boarding step bracket");
    rod([s * 0.34, 1.22, -1.2], [s * 0.62, 0.92, -1.2], 0.023, C.teal, "boarding step bracket");
    rod([s * 0.62, 0.92, -0.91], [s * 0.62, 0.92, -1.2], 0.031, brass, "boarding step");
    b.sweep(
      polyline([[s * 0.39, 1.73, -1.24], [s * 0.47, 1.75, -1.24],
        [s * 0.47, 1.75, -1.02], [s * 0.39, 1.73, -1.02]]),
      0.014,
      { color: brass, bone: root, sides: 6, name: "cockpit grab handle" },
    );
  }
  cyl([0, 2.105, 0.92], 0.069, 0.025, brass, [0, 1, 0], 10, "fuel filler cap");
  box([0, 2.125, 0.92], [0.085, 0.018, 0.018], C.ink, [0, 0, 0], "fuel cap grip");
  rod([2.98, 1.27, 0.8], [2.98, 1.3, 1.27], 0.015, C.steel, "pitot tube");
  rod([2.98, 1.3, 1.27], [2.98, 1.3, 1.43], 0.009, C.ink, "pitot tip");

  return b.root;
}
```