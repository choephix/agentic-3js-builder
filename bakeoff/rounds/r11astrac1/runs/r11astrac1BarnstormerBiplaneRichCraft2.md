```ts
import * as THREE from "three";
import {
  createBuilder, catmull, bezier, polyline, line,
  paint, mix, noise, rng, svg,
} from "agentic-3js-builder";
import type { Fill, Joint } from "agentic-3js-builder";

export const meta = {
  name: "Daydream No. 07 — Barnstormer",
  description:
    "A whimsical scarlet-and-cream air-circus biplane in a proper tail-down stance, with varnished timber, linen wings, an exposed radial engine and a lovingly dressed grass-strip setting.",
};

/*
  Art-direction changes:
  1. Give the aircraft a proper tail-down stance and a short, sprung tail skid.
     The previous long rear stilt made the aeroplane look propped up.
  2. Remove intersecting aileron overlays and close the cowling/firewall gap.
     Refine the wing tips and open the upper wing's centre trailing edge.
  3. Replace noisy timber and camouflage-like grass with restrained finishes.
     Keep the scarlet, cream and petrol-blue silhouette the visual priority.
  4. Improve the cockpit, engine fittings, control surfaces and propeller.
     Add a draped flying scarf as a small, unmistakably whimsical story detail.
  5. Keep the airfield independent of the aircraft rig, with grounded chocks,
     readable signage and quieter, more deliberately grouped scenery.
*/

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "Daydream barnstormer", paintSize: 2048 });
  const random = rng(107);

  const C = {
    red: "#bf423b",
    redLight: "#dc5c49",
    redDark: "#83382f",
    ivory: "#f6e6bd",
    pale: "#fff3d4",
    linen: "#d4bf94",
    teal: "#254d55",
    dark: "#27353b",
    rubber: "#303338",
    brass: "#d4aa62",
    metal: "#a6b2b2",
    wire: "#75858b",
    leather: "#80543b",
  };

  // The scenery is independent: posing the aircraft never tilts the airfield.
  const setting = b.joint("setting", { at: [0, 0, 0] });
  const airframe = b.joint("airframe", {
    parent: setting, at: [0, 1.6, 0],
  });
  const propeller = b.joint("propeller", {
    parent: airframe, at: [0, 1.64, 2.23],
    dir: [0, 0, 1], role: "hinge",
  });
  const wheelL = b.joint("wheelL", {
    parent: airframe, at: [0.88, 0.52, 0.88],
    dir: [1, 0, 0], role: "hinge",
  });
  const wheelR = b.joint("wheelR", {
    parent: airframe, at: [-0.88, 0.52, 0.88],
    dir: [-1, 0, 0], role: "hinge",
  });
  const rudder = b.joint("rudder", {
    parent: airframe, at: [0, 1.77, -2.54],
    dir: [0, 1, 0], role: "hinge",
  });
  let activeBone: Joint = airframe;

  const enamel = paint((p, n) =>
    mix(C.red, C.redLight, 0.10 + Math.max(0, n.y) * 0.28 + noise(p, 0.55, 5) * 0.06),
  );
  const timber = paint((p, n) => {
    const grain = Math.sin(p.x * 125 + Math.sin(p.y * 2.5) * 2 + p.z * 95);
    return mix("#ae7d49", "#d1a168", 0.35 + 0.14 * n.y + grain * 0.065);
  });
  const propWood = paint((p, n) => {
    const band = Math.sin((p.x * 0.94 - (p.y - 1.64) * 0.342) * 190);
    return mix("#965e32", "#bd8b50", 0.46 + band * 0.18 + n.y * 0.10);
  });
  const fabric = paint((p, n) => {
    const r = ((p.x % 0.28) + 0.28) % 0.28;
    const tape = r < 0.012 || r > 0.268;
    return mix(tape ? "#eddbb1" : C.ivory, "#c5b18a", 0.065 * (1 - n.y));
  });
  const grass = paint((p, n) =>
    mix("#7c8b5f", "#94a574", noise(p, 1.05, 71) * 0.60 + Math.max(n.y, 0) * 0.12),
  );
  const dirt = paint((p) => mix("#bca77f", "#cfbd96", noise(p, 0.8, 17) * 0.65));

  const emblem = svg(`
    <svg viewBox="0 0 160 160">
      <circle cx="80" cy="80" r="75" fill="#254d55"/>
      <circle cx="80" cy="80" r="67" fill="#f6e6bd"/>
      <circle cx="80" cy="80" r="56" fill="#bf423b"/>
      <path d="M80 28 L92 64 L131 65 L100 88 L111 126 L80 103
        L49 126 L60 88 L29 65 L68 64Z"
        fill="#fff3d4" stroke="#254d55" stroke-width="3"/>
      <circle cx="80" cy="80" r="9" fill="#d4aa62"/>
    </svg>`, { size: 384 });

  const number = svg(`
    <svg viewBox="0 0 180 120">
      <path d="M10 15 H170 M10 105 H170" stroke="#bf423b" stroke-width="5"/>
      <text x="90" y="91" text-anchor="middle" font-family="Georgia,serif"
        font-style="italic" font-weight="bold" font-size="102" fill="#254d55">07</text>
    </svg>`, { size: 384 });

  const title = svg(`
    <svg viewBox="0 0 420 150">
      <path d="M18 75 Q48 8 210 12 Q372 8 402 75 Q372 142 210 138
        Q48 142 18 75Z" fill="#f6e6bd" stroke="#254d55" stroke-width="7"/>
      <path d="M36 75 Q65 28 210 28 Q355 28 384 75"
        fill="none" stroke="#d4aa62" stroke-width="4"/>
      <text x="210" y="83" text-anchor="middle" font-family="Georgia,serif"
        font-style="italic" font-weight="bold" font-size="64" fill="#254d55">Daydream</text>
      <text x="210" y="113" text-anchor="middle" font-family="sans-serif"
        font-weight="bold" letter-spacing="7" font-size="20" fill="#a53e35">AIR CIRCUS</text>
      <path d="M45 92 H76 M344 92 H375" stroke="#bf423b" stroke-width="4"/>
    </svg>`, { size: 768 });

  const tireMark = svg(`
    <svg viewBox="0 0 160 160">
      <circle cx="80" cy="80" r="71" fill="none" stroke="#77766e" stroke-width="2"/>
      <circle cx="80" cy="80" r="52" fill="none" stroke="#77766e" stroke-width="2"/>
      <path id="arc" d="M22 83 A58 58 0 0 1 138 83" fill="none"/>
      <text fill="#c5bc9e" font-size="13" font-family="sans-serif"
        font-weight="bold" letter-spacing="4">
        <textPath href="#arc" startOffset="50%" text-anchor="middle">SKY • BALLOON</textPath>
      </text>
      <text x="80" y="137" text-anchor="middle" font-family="sans-serif"
        font-size="10" fill="#b5ad94">24 × 6</text>
    </svg>`, { size: 256 });

  const dashboardTexture = svg(`
    <svg viewBox="0 0 300 140">
      <rect width="300" height="140" rx="30" fill="#65442f"/>
      <path d="M10 28 Q150 -9 290 28" stroke="#bf9260" stroke-width="4" fill="none"/>
      ${[65, 150, 235].map((x, i) => `
        <circle cx="${x}" cy="67" r="${i === 1 ? 39 : 29}" fill="#d4aa62"/>
        <circle cx="${x}" cy="67" r="${i === 1 ? 33 : 24}" fill="#eee4c8"/>
        ${Array.from({ length: 10 }, (_, k) => {
          const a = k * Math.PI * 0.16 + Math.PI * 0.7;
          const r = i === 1 ? 29 : 20;
          return `<path d="M${x + Math.cos(a) * r} ${67 + Math.sin(a) * r}
            l${-Math.cos(a) * 5} ${-Math.sin(a) * 5}"
            stroke="#253c42" stroke-width="2"/>`;
        }).join("")}
        <path d="M${x} 67 l${i === 0 ? -12 : 13} -17"
          stroke="#b53c35" stroke-width="3"/>
        <circle cx="${x}" cy="67" r="3" fill="#253c42"/>
      `).join("")}
      <text x="150" y="127" text-anchor="middle" font-family="sans-serif"
        font-size="12" letter-spacing="3" fill="#ead7ad">KEEP DREAMING</text>
    </svg>`, { size: 512 });

  const fuelLabel = svg(`
    <svg viewBox="0 0 140 150">
      <rect x="3" y="3" width="134" height="144" rx="5" fill="#f4e3b9"
        stroke="#253c42" stroke-width="6"/>
      <path d="M70 20 L99 54 L70 88 L41 54Z" fill="#bf423b"/>
      <path d="M69 34 Q86 56 72 69 Q55 63 63 49 Q63 58 70 54Z" fill="#fff1c8"/>
      <text x="70" y="110" text-anchor="middle" font-family="sans-serif"
        font-weight="bold" font-size="21" fill="#254d55">AVIATION</text>
      <text x="70" y="132" text-anchor="middle" font-family="sans-serif"
        font-weight="bold" font-size="17" fill="#254d55">SPIRIT</text>
    </svg>`, { size: 256 });

  const plaqueTexture = svg(`
    <svg viewBox="0 0 440 100">
      <rect x="3" y="3" width="434" height="94" rx="12" fill="#254d55"
        stroke="#d4aa62" stroke-width="5"/>
      <text x="220" y="46" text-anchor="middle" font-family="Georgia,serif"
        font-style="italic" font-size="35" fill="#fff0c6">The Flying Daydream</text>
      <text x="220" y="76" text-anchor="middle" font-family="sans-serif"
        letter-spacing="6" font-size="16" fill="#d4aa62">BARNSTORMER • No. 07</text>
    </svg>`, { size: 512 });

  const scarfTexture = svg(`
    <svg viewBox="0 0 100 300">
      <rect width="100" height="300" fill="#ce513e"/>
      <path d="M13 0 V300 M87 0 V300" stroke="#f8e6bd" stroke-width="5"/>
      <path d="M22 20 H78 M22 39 H78 M22 250 H78 M22 269 H78"
        stroke="#f8e6bd" stroke-width="8"/>
      <path d="M50 91 L59 116 L85 116 L64 132 L72 158 L50 142
        L28 158 L36 132 L15 116 L41 116Z" fill="#f8e6bd"/>
    </svg>`, { size: 384 });

  function box(
    at: number[], size: number[], color: Fill,
    bone: Joint = activeBone, rotation: number[] = [0, 0, 0], name = "fitting",
  ) {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at, bone, rotation, name,
    });
  }

  function ellipsoid(
    at: number[], scale: number[], color: Fill,
    bone: Joint = activeBone, name = "rounded fitting",
  ) {
    return b.part(new THREE.SphereGeometry(1, 12, 8), color, {
      at, scale, bone, flat: true, name,
    });
  }

  function cylinder(
    at: number[], r: number, length: number, color: Fill,
    direction: number[] = [0, 1, 0], bone: Joint = activeBone,
    segments = 12, name = "turned fitting",
  ) {
    return b.part(new THREE.CylinderGeometry(r, r, length, segments), color, {
      at, dir: direction, bone, name,
    });
  }

  function tube(
    a: number[], c: number[], r: number, color: Fill,
    bone: Joint = activeBone, name = "tube",
  ) {
    return b.rod(a, c, r, { color, bone, sides: 6, name });
  }

  function drawing(
    at: number[], size: number[], texture: THREE.Texture,
    direction: number[] = [0, 0, 1], up: number[] = [0, 1, 0],
    bone: Joint = activeBone, name = "painted marking",
  ) {
    return b.part(new THREE.PlaneGeometry(size[0], size[1]), "#ffffff", {
      at, dir: direction, up, axis: "z", texture, bone, name,
    });
  }

  function bolt(at: number[], dir: number[] = [0, 0, 1], bone = activeBone) {
    return cylinder(at, 0.018, 0.014, C.brass, dir, bone, 6, "hex bolt");
  }

  // Airframe: a generous round nose tapering to a fine, recognisable tail.
  const bodyPath = catmull([
    [0, 1.65, -2.72], [0, 1.60, -1.95], [0, 1.60, -0.95],
    [0, 1.62, 0.08], [0, 1.64, 1.18], [0, 1.64, 1.67],
  ]);
  const profile = [
    [0, 0.065, 0.09], [0.18, 0.18, 0.20], [0.42, 0.32, 0.32],
    [0.65, 0.43, 0.41], [0.89, 0.45, 0.43], [1, 0.44, 0.43],
  ];
  function bodyRadius(t: number): [number, number] {
    let i = 0;
    while (i < profile.length - 2 && t > profile[i + 1][0]) i++;
    const a = profile[i], c = profile[i + 1];
    const u = (t - a[0]) / (c[0] - a[0]);
    return [a[1] + (c[1] - a[1]) * u, a[2] + (c[2] - a[2]) * u];
  }
  const fuselage = b.sweep(bodyPath, bodyRadius, {
    color: enamel, bone: airframe, sides: 12, caps: "flat",
    name: "scarlet fabric fuselage",
  });
  const bodySurface = b.surface(fuselage);

  for (const s of [-1, 1]) {
    const stripe = bodySurface.drape([
      [s * 0.08, 1.69, -2.5], [s * 0.22, 1.72, -1.7],
      [s * 0.35, 1.74, -0.8], [s * 0.44, 1.78, 0.25],
      [s * 0.45, 1.80, 1.4],
    ], { lift: 0.005 });
    b.sweep(stripe, 0.016, {
      color: C.ivory, bone: airframe, sides: 4, name: "cream coachline",
    });
    b.decal(fuselage, title, {
      at: [s * 0.42, 1.61, 0.56], dir: [s, 0, 0],
      size: [1.03, 0.37], up: [0, 1, 0],
      lift: 0.006, segments: 12, name: "Daydream fuselage sign",
    });
    b.decal(fuselage, number, {
      at: [s * 0.23, 1.62, -1.58], dir: [s, 0, 0],
      size: [0.43, 0.30], lift: 0.005, segments: 8,
      name: "tail registration",
    });

    for (let i = 0; i < 8; i++) {
      const hit = bodySurface.nearest([s * 0.36, 1.39, -1.34 + i * 0.105]);
      b.stick(new THREE.BoxGeometry(0.032, 0.007, 0.009), C.ivory, hit, {
        spin: i % 2 ? 28 : -28, name: "fabric lacing",
      });
    }
    for (let i = 0; i < 4; i++) {
      const hit = bodySurface.nearest([s * 0.45, 1.52, 1.05 + i * 0.10]);
      b.stick(new THREE.BoxGeometry(0.025, 0.01, 0.13), C.redDark, hit, {
        name: "engine access louvre",
      });
    }
  }

  // Wing outline includes a centre trailing-edge cockpit cut-out.
  function wing(y: number, span: number, chord: number, z: number, upper: boolean) {
    const h = span / 2, q = chord / 2;
    const outline: number[][] = upper
      ? [
          [-h + 0.25, -q], [-0.62, -q], [-0.40, -q + 0.24],
          [0.40, -q + 0.24], [0.62, -q], [h - 0.25, -q],
          [h - 0.07, -q + 0.10], [h, -q + 0.27],
          [h, q - 0.27], [h - 0.07, q - 0.10], [h - 0.25, q],
          [-h + 0.25, q], [-h + 0.07, q - 0.10], [-h, q - 0.27],
          [-h, -q + 0.27], [-h + 0.07, -q + 0.10],
        ]
      : [
          [-h + 0.25, -q], [h - 0.25, -q],
          [h - 0.07, -q + 0.10], [h, -q + 0.27],
          [h, q - 0.27], [h - 0.07, q - 0.10], [h - 0.25, q],
          [-h + 0.25, q], [-h + 0.07, q - 0.10], [-h, q - 0.27],
          [-h, -q + 0.27], [-h + 0.07, -q + 0.10],
        ];
    b.extrude(outline, {
      at: [0, y, z], x: [1, 0, 0], y: [0, 0, 1],
      thickness: 0.115, bevel: 0.023, color: fabric, bone: airframe,
      name: upper ? "upper linen wing" : "lower linen wing",
    });
    for (const s of [-1, 1]) {
      b.extrude([
        [h - 0.58, -q], [h - 0.25, -q],
        [h - 0.07, -q + 0.10], [h, -q + 0.27],
        [h, q - 0.27], [h - 0.07, q - 0.10], [h - 0.25, q],
        [h - 0.58, q],
      ], {
        at: [0, y, z], x: [s, 0, 0], y: [0, 0, 1],
        thickness: 0.121, bevel: 0.023, color: enamel,
        bone: airframe, name: "scarlet rounded wingtip",
      });
      box([s * (h - 0.61), y + 0.060, z],
        [0.043, 0.007, chord - 0.06], C.teal);
      box([s * (h - 0.68), y + 0.060, z],
        [0.020, 0.007, chord - 0.06], C.red);

      // Thin top applique rather than a box intersecting the wing's edge.
      box([s * 2.08, y + 0.060, z - q + 0.145],
        [1.44, 0.007, 0.205], C.red, airframe, [0, 0, 0], "aileron fabric panel");
      tube([s * 1.36, y + 0.065, z - q + 0.255],
        [s * 2.80, y + 0.065, z - q + 0.255], 0.007, C.redDark);
      for (const x of [1.50, 2.08, 2.67]) {
        box([s * x, y + 0.068, z - q + 0.25],
          [0.060, 0.012, 0.067], C.brass);
      }
      for (let i = 0; i < 10; i++) {
        const x = s * (0.53 + i * 0.28);
        if (Math.abs(x) > h - 0.73) continue;
        const back = upper && Math.abs(x) < 0.63 ? -q + 0.28 : -q + 0.29;
        b.sweep(bezier(
          [x, y + 0.057, z + back],
          [x, y + 0.075, z + 0.04],
          [x, y + 0.051, z + q - 0.07],
        ), 0.007, {
          color: C.linen, bone: airframe, sides: 4,
          name: "linen rib tape",
        });
      }
      tube([s * 0.03, y + 0.003, z + q - 0.015],
        [s * (h - 0.25), y + 0.003, z + q - 0.015],
        0.028, C.ivory, airframe, "rounded leading edge");
    }
    if (upper) {
      drawing([-2.05, y + 0.079, z + 0.02], [0.93, 0.93], emblem,
        [0, 1, 0], [0, 0, -1], airframe, "upper wing roundel");
      drawing([2.05, y + 0.079, z + 0.04], [1.00, 0.69], number,
        [0, 1, 0], [0, 0, -1], airframe, "large wing number");
    } else {
      drawing([-2.32, y - 0.063, z], [0.73, 0.73], emblem,
        [0, -1, 0], [0, 0, 1], airframe, "underwing roundel");
    }
  }

  wing(1.19, 6.65, 1.27, 0.14, false);
  wing(2.64, 7.18, 1.37, 0.39, true);

  for (const s of [-1, 1]) {
    const x = s * 2.42;
    const lowFront = [x, 1.23, 0.64], lowRear = [x, 1.23, -0.34];
    const highFront = [x, 2.58, 0.92], highRear = [x, 2.58, -0.14];
    for (const [a, c] of [
      [lowFront, highFront], [lowRear, highRear], [lowRear, highFront],
    ]) {
      b.frustumBox(a, c, [0.061, 0.08], [0.061, 0.08], {
        color: timber, bone: airframe, name: "varnished N strut",
      });
    }
    for (const p of [lowFront, lowRear, highFront, highRear]) {
      box(p, [0.12, 0.065, 0.14], C.teal);
      bolt([p[0] + s * 0.065, p[1], p[2]], [s, 0, 0]);
    }
    for (const z of [0.66, -0.30]) {
      tube([s * 0.50, 1.24, z], [s * 2.39, 2.58, z + 0.26], 0.008, C.wire);
      tube([s * 0.55, 2.58, z + 0.26], [s * 2.39, 1.25, z], 0.008, C.wire);
      tube([s * 0.57, 1.29, z + 0.01], [s * 0.74, 1.41, z + 0.033],
        0.017, C.metal, airframe, "wire turnbuckle");
    }
    for (const z of [0.18, 1.03]) {
      tube([s * 0.31, 1.96, z], [s * 0.72, 2.58, z + 0.04], 0.032, C.teal);
      cylinder([s * 0.72, 2.58, z + 0.04], 0.052, 0.025, C.brass);
    }
    tube([s * 2.72, 1.26, -0.40], [s * 2.72, 2.76, -0.20], 0.013, C.dark);
    b.slab([
      [s * 2.72, 2.69, -0.27], [s * 2.72, 2.80, -0.14],
      [s * 2.72, 2.68, -0.05],
    ], {
      thickness: 0.022, color: C.teal, bone: airframe,
      name: "aileron control horn",
    });
  }

  // Cockpit: padded oval well, upholstered backrest, harness and instruments.
  ellipsoid([0, 1.953, -0.50], [0.285, 0.063, 0.43],
    C.dark, airframe, "cockpit dark well");
  const rim = Array.from({ length: 24 }, (_, i) => {
    const a = i / 24 * Math.PI * 2;
    return [Math.cos(a) * 0.29, 1.973, -0.50 + Math.sin(a) * 0.435];
  });
  b.sweep(polyline(rim, { closed: true }), 0.034, {
    color: C.leather, bone: airframe, sides: 8, name: "padded cockpit coaming",
  });
  box([0, 1.988, -0.65], [0.35, 0.055, 0.27], C.leather);
  box([0, 2.075, -0.82], [0.36, 0.24, 0.075], C.leather,
    airframe, [-12, 0, 0], "pilot seat back");
  for (const s of [-1, 1]) {
    box([s * 0.075, 2.08, -0.778], [0.038, 0.22, 0.012],
      C.linen, airframe, [-12, 0, 0], "shoulder harness");
  }
  box([0.06, 2.006, -0.65], [0.26, 0.012, 0.036],
    C.linen, airframe, [0, 15, 0], "lap belt");
  box([0.02, 2.015, -0.63], [0.065, 0.018, 0.055], C.brass);
  tube([0, 1.96, -0.40], [0, 2.14, -0.36], 0.016, C.dark);
  ellipsoid([0, 2.14, -0.36], [0.035, 0.022, 0.025], C.leather);
  box([0, 2.018, -0.145], [0.43, 0.20, 0.045], timber,
    airframe, [0, 0, 0], "instrument panel");
  drawing([0, 2.02, -0.170], [0.41, 0.19], dashboardTexture,
    [0, 0, -1], [0, 1, 0]);

  const windscreen = [
    [-0.275, 2.005, -0.10], [-0.235, 2.235, -0.015],
    [0, 2.32, 0.045], [0.235, 2.235, -0.015], [0.275, 2.005, -0.10],
  ];
  b.slab(windscreen, {
    thickness: 0.014, color: "#aac7c4", bone: airframe, name: "blue windscreen",
  });
  b.sweep(windscreen, 0.015, {
    color: C.brass, bone: airframe, sides: 6, name: "windscreen frame",
  });
  tube([-0.275, 2.005, -0.10], [0.275, 2.005, -0.10], 0.016, C.brass);
  tube([-0.16, 2.10, -0.065], [-0.11, 2.22, -0.018], 0.008, C.pale);

  for (const s of [-1, 1]) {
    tube([s * 0.37, 1.57, -0.56], [s * 0.56, 1.41, -0.57], 0.022, C.teal);
    tube([s * 0.56, 1.41, -0.57], [s * 0.56, 1.41, -0.91], 0.022, C.teal);
  }

  // A flying scarf draped over the cockpit's left rim, not a floating ribbon.
  const scarfA = [
    [0.20, 2.015, -0.75], [0.33, 1.98, -0.80],
    [0.39, 1.81, -0.84], [0.39, 1.56, -0.92],
  ];
  const scarfB = [
    [0.20, 2.015, -0.92], [0.33, 1.98, -0.97],
    [0.39, 1.81, -1.01], [0.39, 1.56, -1.09],
  ];
  b.membrane(scarfA, scarfB, {
    thickness: 0.012, rows: 3, cols: 5, color: "#ce513e",
    bone: airframe, name: "draped flying scarf",
  });
  drawing([0.401, 1.70, -0.974], [0.15, 0.25], scarfTexture,
    [1, 0, 0], [0, 1, 0], airframe, "scarf embroidered star");
  for (let i = 0; i < 5; i++) {
    tube([0.39, 1.56, -0.925 - i * 0.032],
      [0.391, 1.50, -0.936 - i * 0.032], 0.007, C.ivory);
  }

  // Cowling overlaps its firewall: no daylight seam between engine and fuselage.
  cylinder([0, 1.64, 1.65], 0.457, 0.17, C.redDark,
    [0, 0, 1], airframe, 16, "firewall collar");
  cylinder([0, 1.64, 1.82], 0.45, 0.22, C.redDark, [0, 0, 1], airframe, 16);
  cylinder([0, 1.64, 1.94], 0.395, 0.08, C.dark, [0, 0, 1], airframe, 16);
  b.lathe([
    [0.435, 0], [0.49, 0], [0.525, 0.07], [0.525, 0.30],
    [0.49, 0.36], [0.445, 0.36], [0.465, 0.29], [0.465, 0.08],
  ], {
    at: [0, 1.64, 1.66], axis: [0, 0, 1], segments: 16,
    color: enamel, bone: airframe, name: "open scarlet engine cowling",
  });
  b.lathe([
    [0.445, 0], [0.49, 0], [0.50, 0.018], [0.49, 0.042], [0.445, 0.042],
  ], {
    at: [0, 1.64, 2.005], axis: [0, 0, 1], segments: 16,
    color: C.ivory, bone: airframe, name: "cream cowling lip",
  });

  for (let i = 0; i < 9; i++) {
    const a = i * Math.PI * 2 / 9;
    const d = [Math.sin(a), Math.cos(a), 0];
    const point = (r: number, z: number) => [d[0] * r, 1.64 + d[1] * r, z];
    tube(point(0.17, 1.985), point(0.40, 1.985), 0.066, C.dark);
    for (let j = 0; j < 5; j++) {
      cylinder(point(0.235 + j * 0.032, 1.99), 0.079, 0.012,
        j % 2 ? "#758386" : C.metal, d, airframe, 8, "radial cooling fin");
    }
    ellipsoid(point(0.414, 1.995), [0.05, 0.05, 0.057], C.dark);
    tube(point(0.17, 2.055), point(0.39, 2.055), 0.011,
      C.brass, airframe, "radial pushrod");
    const p = point(0.525, 1.76);
    bolt(p, d);
  }
  cylinder([0, 1.64, 2.065], 0.205, 0.16, C.metal,
    [0, 0, 1], airframe, 12, "crankcase");
  cylinder([0, 1.64, 2.16], 0.135, 0.09, C.dark, [0, 0, 1]);
  for (let i = 0; i < 6; i++) {
    const a = i * Math.PI / 3;
    bolt([Math.sin(a) * 0.155, 1.64 + Math.cos(a) * 0.155, 2.15]);
  }
  b.sweep(catmull([
    [-0.30, 1.35, 1.72], [-0.46, 1.25, 1.59],
    [-0.49, 1.21, 1.25], [-0.47, 1.18, 1.00],
  ]), 0.057, {
    color: "#86614b", bone: airframe, sides: 8, caps: "flat", name: "exhaust pipe",
  });
  cylinder([-0.47, 1.18, 0.993], 0.042, 0.008, C.dark, [0, 0, 1]);

  const blade = [
    [-0.055, 0.10], [-0.11, 0.32], [-0.15, 0.66], [-0.12, 0.98],
    [-0.05, 1.09], [0.055, 1.08], [0.105, 0.96], [0.105, 0.68],
    [0.075, 0.35], [0.055, 0.10],
  ];
  for (const s of [-1, 1]) {
    const x = [0.94 * s, -0.342 * s, 0];
    const y = [0.342 * s, 0.94 * s, 0];
    b.extrude(blade, {
      at: [0, 1.64, 2.255], x, y, thickness: 0.055, bevel: 0.012,
      color: propWood, bone: propeller, name: "laminated wooden propeller",
    });
    b.extrude([
      [-0.135, 0.88], [-0.12, 0.98], [-0.05, 1.09],
      [0.055, 1.08], [0.105, 0.96], [0.105, 0.88],
    ], {
      at: [0, 1.64, 2.258], x, y, thickness: 0.062, bevel: 0.008,
      color: C.ivory, bone: propeller, name: "ivory propeller tip",
    });
    b.extrude([
      [-0.143, 0.80], [0.105, 0.80], [0.105, 0.85], [-0.139, 0.85],
    ], {
      at: [0, 1.64, 2.26], x, y, thickness: 0.065,
      color: C.red, bone: propeller, name: "propeller safety stripe",
    });
    tube([s * 0.342 * 0.28, 1.64 + s * 0.94 * 0.28, 2.288],
      [s * 0.342 * 0.73, 1.64 + s * 0.94 * 0.73, 2.288],
      0.006, C.linen, propeller, "propeller inlay");
  }
  cylinder([0, 1.64, 2.292], 0.16, 0.065, C.brass,
    [0, 0, 1], propeller, 12, "propeller boss");
  ellipsoid([0, 1.64, 2.34], [0.106, 0.106, 0.094],
    C.red, propeller, "spinner cap");
  for (let i = 0; i < 6; i++) {
    const a = i * Math.PI / 3;
    bolt([Math.sin(a) * 0.128, 1.64 + Math.cos(a) * 0.128, 2.33],
      [0, 0, 1], propeller);
  }

  // Balloon tyres and triangulated, cord-sprung undercarriage.
  tube([-1.03, 0.52, 0.88], [1.03, 0.52, 0.88], 0.048, C.dark);
  for (const s of [-1, 1]) {
    const bone = s > 0 ? wheelL : wheelR;
    tube([s * 0.32, 1.31, 1.13], [s * 0.88, 0.52, 0.88], 0.050, C.teal);
    tube([s * 0.32, 1.30, -0.13], [s * 0.88, 0.52, 0.88], 0.045, C.teal);
    tube([s * 0.22, 1.27, 0.91], [s * 0.73, 0.60, 0.88], 0.010, C.wire);
    cylinder([s * 0.88, 0.52, 0.88], 0.39, 0.24, C.rubber,
      [1, 0, 0], bone, 24, "balloon tyre");
    for (const offset of [-0.112, 0.112]) {
      cylinder([s * 0.88 + offset, 0.52, 0.88], 0.355, 0.018,
        "#393d40", [1, 0, 0], bone, 24, "tyre shoulder");
    }
    cylinder([s * 1.014, 0.52, 0.88], 0.225, 0.025, C.ivory,
      [s, 0, 0], bone, 16, "cream wheel dish");
    cylinder([s * 1.032, 0.52, 0.88], 0.155, 0.028, C.red,
      [s, 0, 0], bone, 12, "red wheel hub");
    cylinder([s * 1.054, 0.52, 0.88], 0.067, 0.055, C.brass,
      [s, 0, 0], bone, 8, "axle cap");
    drawing([s * 1.024, 0.52, 0.88], [0.73, 0.73], tireMark,
      [s, 0, 0], [0, 1, 0], bone, "tyre sidewall lettering");
    for (let j = 0; j < 6; j++) {
      const a = j * Math.PI / 3;
      bolt([s * 1.052, 0.52 + Math.sin(a) * 0.119, 0.88 + Math.cos(a) * 0.119],
        [s, 0, 0], bone);
    }
    for (let j = 0; j < 5; j++) {
      cylinder([s * (0.65 + j * 0.025), 0.60, 0.88],
        0.065, 0.017, C.linen, [1, 0, 0], airframe, 8, "shock cord wrap");
    }
  }

  b.extrude([
    [-1.10, -0.18], [-0.97, -0.39], [-0.36, -0.47], [0.36, -0.47],
    [0.97, -0.39], [1.10, -0.18], [0.96, 0.17], [0.55, 0.31],
    [-0.55, 0.31], [-0.96, 0.17],
  ], {
    at: [0, 1.67, -2.21], x: [1, 0, 0], y: [0, 0, 1],
    thickness: 0.075, bevel: 0.016, color: fabric,
    bone: airframe, name: "horizontal stabilizer",
  });
  for (const s of [-1, 1]) {
    b.extrude([
      [0.76, -0.41], [0.97, -0.39], [1.10, -0.18],
      [0.96, 0.17], [0.76, 0.24],
    ], {
      at: [0, 1.67, -2.21], x: [s, 0, 0], y: [0, 0, 1],
      thickness: 0.082, bevel: 0.012, color: enamel,
      bone: airframe, name: "scarlet stabilizer tip",
    });
    tube([s * 0.11, 1.714, -2.49], [s * 0.93, 1.714, -2.49], 0.007, C.teal);
    tube([s * 0.08, 1.89, -2.30], [s * 0.82, 1.71, -2.18], 0.007, C.wire);
    tube([s * 0.07, 1.51, -2.06], [s * 0.85, 1.63, -2.22], 0.012, C.teal);
    tube([s * 0.35, 1.45, -0.83], [s * 0.14, 1.74, -2.55], 0.007, C.wire);
  }
  b.extrude([
    [0.35, 0], [0.22, 0.40], [-0.05, 0.89],
    [-0.25, 0.99], [-0.43, 0.87], [-0.43, 0],
  ], {
    at: [0, 1.70, -2.12], x: [0, 0, 1], y: [0, 1, 0],
    thickness: 0.083, bevel: 0.018, color: enamel,
    bone: airframe, name: "swept vertical fin",
  });
  b.extrude([
    [0, 0], [0, 0.89], [-0.21, 0.87], [-0.35, 0.64],
    [-0.36, 0.25], [-0.22, -0.08],
  ], {
    at: [0, 1.70, -2.55], x: [0, 0, 1], y: [0, 1, 0],
    thickness: 0.087, bevel: 0.015, color: C.ivory,
    bone: rudder, name: "ivory rudder",
  });
  for (const s of [-1, 1]) {
    drawing([s * 0.048, 2.22, -2.29], [0.36, 0.36], emblem,
      [s, 0, 0], [0, 1, 0], airframe, "tail roundel");
    tube([s * 0.051, 1.82, -2.57], [s * 0.051, 2.45, -2.57],
      0.007, C.teal, rudder);
  }
  for (const y of [1.86, 2.15, 2.43]) {
    cylinder([0, y, -2.55], 0.023, 0.13, C.brass,
      [1, 0, 0], airframe, 8, "rudder hinge");
  }

  // Design the contact shoe in the aircraft's pre-tilt coordinates.
  const pitch = 10 * Math.PI / 180;
  const shoeZ = -2.96;
  const shoeY = 0.52 + (0.170 - 0.52 - Math.sin(pitch) * (shoeZ - 0.88)) / Math.cos(pitch);
  b.sweep(catmull([
    [0, 1.55, -2.48], [0, 1.18, -2.58],
    [0, shoeY + 0.10, -2.78], [0, shoeY, shoeZ],
  ]), [0.040, 0.029], {
    color: timber, bone: airframe, sides: 6, name: "short sprung tail skid",
  });
  tube([0, shoeY + 0.015, -2.86], [0, shoeY - 0.015, -3.04],
    0.033, C.dark, airframe, "tail skid shoe");
  tube([0, 1.31, -2.40], [0, shoeY + 0.20, -2.71],
    0.018, C.teal, airframe, "tail skid spring brace");

  // Nose up, tail down: rotate around the wheel axle so the tyres stay planted.
  b.pose(airframe, {
    about: line([-1, 0.52, 0.88], [1, 0.52, 0.88]), deg: -10,
  });

  // All subsequent construction belongs to the stationary setting.
  activeBone = setting;
  b.part(new THREE.CylinderGeometry(4.05, 4.09, 0.12, 48), grass, {
    at: [0, 0.06, -0.1], scale: [1, 1, 0.78],
    bone: setting, name: "quiet grass airfield plinth",
  });
  b.part(new THREE.CylinderGeometry(3.02, 3.02, 0.010, 40), dirt, {
    at: [0, 0.125, -0.10], scale: [0.60, 1, 0.96],
    bone: setting, name: "worn oval grass landing strip",
  });

  for (const s of [-1, 1]) {
    b.extrude([
      [-0.13, 0], [0.13, 0], [0.04, 0.14], [-0.055, 0.14],
    ], {
      at: [s * 0.88, 0.132, 1.27], x: [0, 0, 1], y: [0, 1, 0],
      thickness: 0.36, color: timber, bone: setting, name: "wooden wheel chock",
    });
    box([s * 0.88, 0.220, 1.314], [0.27, 0.022, 0.035], C.red);
  }
  b.sweep(catmull([
    [-0.74, 0.15, 1.33], [-0.40, 0.141, 1.52],
    [0.23, 0.141, 1.59], [0.74, 0.15, 1.33],
  ]), 0.011, {
    color: C.linen, bone: setting, sides: 5, name: "wheel chock rope",
  });

  // Windsock remains a secondary vertical, behind and outside the wing.
  const poleX = -3.12, poleZ = -2.02;
  cylinder([poleX, 0.16, poleZ], 0.14, 0.08, C.teal);
  tube([poleX, 0.17, poleZ], [poleX, 2.15, poleZ], 0.026, C.ivory);
  for (let i = 0; i < 4; i++) {
    cylinder([poleX, 0.36 + i * 0.41, poleZ], 0.028, 0.15, C.red);
  }
  ellipsoid([poleX, 2.17, poleZ], [0.049, 0.049, 0.049], C.brass);
  tube([poleX, 2.13, poleZ], [poleX + 0.13, 2.14, poleZ], 0.023, C.teal);
  b.sweep(catmull([
    [poleX + 0.13, 2.14, poleZ], [poleX + 0.45, 2.12, poleZ],
    [poleX + 0.76, 2.02, poleZ + 0.03], [poleX + 1.05, 1.91, poleZ + 0.06],
  ]), [0.15, 0.055], {
    color: C.ivory, bone: setting, sides: 10, caps: "none",
    bands: [[0.2, C.red], [0.4, C.ivory], [0.6, C.red], [0.8, C.ivory], [1, C.red]],
    name: "striped windsock",
  });
  cylinder([poleX + 0.135, 2.14, poleZ], 0.125, 0.007, C.redDark,
    [1, 0, 0], setting, 12, "windsock dark mouth");
  b.part(new THREE.TorusGeometry(0.151, 0.011, 6, 16), C.brass, {
    at: [poleX + 0.125, 2.14, poleZ], rotation: [0, 90, 0],
    bone: setting, name: "windsock mouth hoop",
  });
  for (const s of [-1, 1]) {
    tube([poleX, 0.96, poleZ], [poleX + s * 0.34, 0.145, poleZ + 0.24], 0.007, C.wire);
    box([poleX + s * 0.34, 0.16, poleZ + 0.24], [0.033, 0.07, 0.033], C.dark);
  }

  // A small, grouped mechanic's kit, clear of the plane's outline.
  box([1.66, 0.345, -2.13], [0.29, 0.43, 0.22],
    C.teal, setting, [0, -12, 0], "aviation spirit tin");
  box([1.66, 0.57, -2.13], [0.28, 0.035, 0.21], C.brass);
  cylinder([1.58, 0.60, -2.13], 0.044, 0.04, C.red);
  tube([1.68, 0.59, -2.13], [1.68, 0.66, -2.13], 0.014, C.dark);
  tube([1.68, 0.66, -2.13], [1.77, 0.66, -2.13], 0.014, C.dark);
  tube([1.77, 0.66, -2.13], [1.77, 0.59, -2.13], 0.014, C.dark);
  drawing([1.635, 0.35, -2.017], [0.22, 0.27], fuelLabel, [-0.208, 0, 0.978]);
  box([2.05, 0.23, -2.28], [0.50, 0.20, 0.30],
    C.leather, setting, [0, 0, 0], "mechanic tool case");
  for (const x of [1.90, 2.20]) {
    box([x, 0.337, -2.28], [0.042, 0.014, 0.29], C.brass);
    box([x, 0.25, -2.123], [0.043, 0.06, 0.015], C.brass);
  }
  tube([1.98, 0.36, -2.28], [2.12, 0.36, -2.28], 0.021, C.dark);
  b.slab([
    [1.76, 0.133, -1.88], [2.17, 0.133, -1.93],
    [2.28, 0.133, -1.66], [1.86, 0.133, -1.61],
  ], {
    color: C.ivory, thickness: 0.008, bone: setting, name: "mechanic cloth",
  });
  tube([1.91, 0.147, -1.80], [2.10, 0.147, -1.75], 0.016, C.metal);
  cylinder([1.91, 0.15, -1.80], 0.035, 0.015, C.metal);
  cylinder([1.91, 0.159, -1.80], 0.020, 0.003, C.dark);

  // A few broad grass blades, not a noisy carpet of surface detail.
  for (let i = 0; i < 23; i++) {
    const a = random() * Math.PI * 2;
    const r = 3.47 + random() * 0.32;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r * 0.76 - 0.1;
    if (z > 2.25 && Math.abs(x) < 1.2) continue;
    const h = 0.07 + random() * 0.065;
    b.slab([
      [x - 0.052, 0.12, z], [x - 0.058, 0.12 + h, z],
      [x, 0.14 + h * 0.45, z], [x + 0.022, 0.15 + h, z],
      [x + 0.055, 0.12, z],
    ], {
      thickness: 0.006, color: i % 3 ? "#a5b47d" : "#c2bc86",
      bone: setting, name: "airfield grass tuft",
    });
  }

  box([0, 0.147, 2.68], [1.47, 0.04, 0.36],
    C.teal, setting, [0, 0, 0], "airfield title tile");
  drawing([0, 0.170, 2.68], [1.40, 0.315], plaqueTexture,
    [0, 1, 0], [0, 0, -1], setting, "barnstormer title plaque");

  return b.root;
}
```