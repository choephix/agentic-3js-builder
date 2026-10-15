```ts
import * as THREE from "three";
import {
  createBuilder, frame, catmull, bezier, polyline,
  paint, grain, mottle, mix, noise, rng, svg,
} from "agentic-3js-builder";
import type { Fill, Joint } from "agentic-3js-builder";

export const meta = {
  name: "Daydream No. 07 — Barnstormer",
  description:
    "A whimsical scarlet-and-buttermilk air-circus biplane, with linen wings, exposed radial engine, wooden propeller, wire bracing, an open cockpit and a little grass-strip setting.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "Daydream barnstormer", paintSize: 2048 });
  const random = rng(107);
  const C = {
    red: "#be423e",
    redLight: "#df6251",
    redDark: "#803333",
    ivory: "#f7e7bc",
    pale: "#fff5d8",
    linen: "#d6c49a",
    teal: "#24515a",
    dark: "#22343b",
    rubber: "#303238",
    brass: "#d8ad61",
    metal: "#a4afb0",
    wire: "#71828a",
    leather: "#80503a",
    soil: "#ac9570",
    grass: "#75865a",
  };

  // All moving assemblies are defined before their geometry.
  const airframe = b.joint("airframe", { at: [0, 1.6, 0] });
  const propeller = b.joint("propeller", {
    parent: airframe, at: [0, 1.64, 2.23], dir: [0, 0, 1], role: "hinge",
  });
  const wheelL = b.joint("wheelL", {
    parent: airframe, at: [0.88, 0.52, 0.88], dir: [1, 0, 0], role: "hinge",
  });
  const wheelR = b.joint("wheelR", {
    parent: airframe, at: [-0.88, 0.52, 0.88], dir: [-1, 0, 0], role: "hinge",
  });
  const rudder = b.joint("rudder", {
    parent: airframe, at: [0, 1.77, -2.54], dir: [0, 1, 0], role: "hinge",
  });

  const enamel = paint((p, n) => {
    const t = Math.max(0, n.y) * 0.3 + noise(p, 0.35, 5) * 0.12;
    return mix(C.red, C.redLight, t);
  });
  const wood = grain("#75462c", "#b98248", { size: 0.045, axis: "y", seed: 7 });
  const strutWood = grain("#9a643b", "#d2a267", { size: 0.035, axis: "y", seed: 8 });
  const fabric = paint((p, n) => {
    const tape = Math.abs((((p.x + 0.14) % 0.28) + 0.28) % 0.28 - 0.14);
    const base = tape < 0.012 ? "#ead8ac" : C.ivory;
    return mix(base, "#baa780", 0.08 * (1 - n.y) + noise(p, 0.035, 19) * 0.045);
  });
  const groundPaint = mottle("#64764e", "#91a16c", { size: 0.65, seed: 71 });
  const dirtPaint = mottle("#b9a47b", "#cbbc95", { size: 0.42, seed: 17 });

  const emblem = svg(`
    <svg viewBox="0 0 160 160">
      <circle cx="80" cy="80" r="75" fill="#24515a"/>
      <circle cx="80" cy="80" r="67" fill="#f7e7bc"/>
      <circle cx="80" cy="80" r="56" fill="#be423e"/>
      <path d="M80 28 L92 64 L131 65 L100 88 L111 126 L80 103
               L49 126 L60 88 L29 65 L68 64Z"
            fill="#fff5d8" stroke="#24515a" stroke-width="3"/>
      <circle cx="80" cy="80" r="10" fill="#d8ad61"/>
    </svg>`, { size: 384 });

  const number = svg(`
    <svg viewBox="0 0 180 120">
      <path d="M10 15 H170 M10 105 H170" stroke="#be423e" stroke-width="6"/>
      <text x="90" y="91" text-anchor="middle" font-family="Georgia,serif"
        font-style="italic" font-weight="bold" font-size="102" fill="#24515a">07</text>
      <path d="M14 23 H166 M14 97 H166" stroke="#d6c49a" stroke-width="3"/>
    </svg>`, { size: 384 });

  const title = svg(`
    <svg viewBox="0 0 420 150">
      <path d="M18 75 Q48 8 210 12 Q372 8 402 75 Q372 142 210 138
               Q48 142 18 75Z" fill="#f7e7bc" stroke="#24515a" stroke-width="7"/>
      <path d="M36 75 Q65 28 210 28 Q355 28 384 75" fill="none"
        stroke="#d8ad61" stroke-width="4"/>
      <text x="210" y="83" text-anchor="middle" font-family="Georgia,serif"
        font-style="italic" font-weight="bold" font-size="64" fill="#24515a">Daydream</text>
      <text x="210" y="113" text-anchor="middle" font-family="sans-serif"
        font-weight="bold" letter-spacing="7" font-size="20" fill="#a93d38">AIR CIRCUS</text>
      <path d="M45 92 H76 M344 92 H375" stroke="#be423e" stroke-width="4"/>
    </svg>`, { size: 768 });

  const tireMark = svg(`
    <svg viewBox="0 0 160 160">
      <circle cx="80" cy="80" r="71" fill="none" stroke="#72716b" stroke-width="2"/>
      <circle cx="80" cy="80" r="52" fill="none" stroke="#72716b" stroke-width="2"/>
      <path id="arc" d="M22 83 A58 58 0 0 1 138 83" fill="none"/>
      <text fill="#c5bc9e" font-size="13" font-family="sans-serif" font-weight="bold"
        letter-spacing="4"><textPath href="#arc" startOffset="50%" text-anchor="middle">SKY • BALLOON</textPath></text>
      <text x="80" y="137" text-anchor="middle" font-family="sans-serif"
        font-size="10" fill="#b5ad94">24 × 6</text>
    </svg>`, { size: 256 });

  const dashboardTexture = svg(`
    <svg viewBox="0 0 300 140">
      <rect width="300" height="140" rx="30" fill="#64412e"/>
      <path d="M10 28 Q150 -9 290 28" stroke="#bf9260" stroke-width="4" fill="none"/>
      ${[65, 150, 235].map((x, i) => `
        <circle cx="${x}" cy="67" r="${i === 1 ? 39 : 29}" fill="#d8ad61"/>
        <circle cx="${x}" cy="67" r="${i === 1 ? 33 : 24}" fill="#eee4c8"/>
        ${Array.from({ length: 10 }, (_, k) => {
          const a = k * Math.PI * 0.16 + Math.PI * 0.7;
          const r = i === 1 ? 29 : 20;
          return `<path d="M${x + Math.cos(a) * r} ${67 + Math.sin(a) * r}
            l${-Math.cos(a) * 5} ${-Math.sin(a) * 5}" stroke="#253c42" stroke-width="2"/>`;
        }).join("")}
        <path d="M${x} 67 l${i === 0 ? -12 : 13} -17"
          stroke="#b53c35" stroke-width="3"/>
        <circle cx="${x}" cy="67" r="3" fill="#253c42"/>
      `).join("")}
      <text x="150" y="127" text-anchor="middle" font-family="sans-serif"
        font-size="12" letter-spacing="3" fill="#ead7ad">KEEP DREAMING</text>
    </svg>`, { size: 512 });

  const fuelLabel = svg(`
    <svg viewBox="0 0 120 150">
      <rect x="3" y="3" width="114" height="144" rx="5" fill="#f4e3b9"
        stroke="#253c42" stroke-width="6"/>
      <path d="M60 20 L89 54 L60 88 L31 54Z" fill="#be423e"/>
      <path d="M59 34 Q76 56 62 69 Q45 63 53 49 Q53 58 60 54Z" fill="#fff1c8"/>
      <text x="60" y="110" text-anchor="middle" font-family="sans-serif"
        font-weight="bold" font-size="24" fill="#24515a">AVIATION</text>
      <text x="60" y="132" text-anchor="middle" font-family="sans-serif"
        font-weight="bold" font-size="17" fill="#24515a">SPIRIT</text>
    </svg>`, { size: 256 });

  const plaqueTexture = svg(`
    <svg viewBox="0 0 440 100">
      <rect x="3" y="3" width="434" height="94" rx="12" fill="#24515a"
        stroke="#d8ad61" stroke-width="5"/>
      <text x="220" y="46" text-anchor="middle" font-family="Georgia,serif"
        font-style="italic" font-size="35" fill="#fff0c6">The Flying Daydream</text>
      <text x="220" y="76" text-anchor="middle" font-family="sans-serif"
        letter-spacing="6" font-size="16" fill="#d8ad61">BARNSTORMER  •  No. 07</text>
    </svg>`, { size: 512 });

  function box(
    at: number[], size: number[], color: Fill,
    bone: Joint = airframe, rotation: number[] = [0, 0, 0], name = "fitting",
  ) {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at, bone, rotation, name,
    });
  }

  function ellipsoid(
    at: number[], scale: number[], color: Fill,
    bone: Joint = airframe, name = "rounded fitting",
  ) {
    return b.part(new THREE.SphereGeometry(1, 12, 8), color, {
      at, scale, bone, flat: true, name,
    });
  }

  function cylinder(
    at: number[], r: number, length: number, color: Fill,
    direction: number[] = [0, 1, 0], bone: Joint = airframe,
    segments = 12, name = "turned fitting",
  ) {
    return b.part(new THREE.CylinderGeometry(r, r, length, segments), color, {
      at, dir: direction, bone, name,
    });
  }

  function tube(
    a: number[], c: number[], r: number, color: Fill,
    bone: Joint = airframe, name = "tube",
  ) {
    return b.rod(a, c, r, { color, bone, sides: 6, name });
  }

  function drawing(
    at: number[], size: number[], texture: THREE.Texture,
    direction: number[] = [0, 0, 1], up: number[] = [0, 1, 0],
    bone: Joint = airframe, name = "painted marking",
  ) {
    return b.part(new THREE.PlaneGeometry(size[0], size[1]), "#ffffff", {
      at, dir: direction, up, axis: "z", texture, bone, name,
    });
  }

  function bolt(at: number[], dir: number[] = [0, 0, 1], bone = airframe) {
    return cylinder(at, 0.018, 0.014, C.brass, dir, bone, 6, "hex bolt");
  }

  // A low, oval piece of airfield: nothing competes with the aircraft silhouette.
  b.part(new THREE.CylinderGeometry(4.1, 4.14, 0.12, 48), groundPaint, {
    at: [0, 0.06, -0.1], scale: [1, 1, 0.79], bone: airframe, name: "grass airfield plinth",
  });
  b.part(new THREE.CylinderGeometry(3.02, 3.05, 0.012, 40), dirtPaint, {
    at: [0, 0.123, -0.1], scale: [0.66, 1, 0.98], bone: airframe, name: "worn grass landing strip",
  });

  // Tapered fuselage, deliberately built as one bold, faceted volume.
  const bodyPath = catmull([
    [0, 1.65, -2.72],
    [0, 1.60, -1.95],
    [0, 1.60, -0.95],
    [0, 1.62, 0.08],
    [0, 1.64, 1.18],
    [0, 1.64, 1.59],
  ]);
  const profile = [
    [0, 0.065, 0.09],
    [0.18, 0.18, 0.20],
    [0.42, 0.32, 0.32],
    [0.65, 0.43, 0.41],
    [0.89, 0.45, 0.43],
    [1, 0.44, 0.43],
  ];
  function bodyRadius(t: number): [number, number] {
    let i = 0;
    while (i < profile.length - 2 && t > profile[i + 1][0]) i++;
    const a = profile[i], c = profile[i + 1];
    const u = (t - a[0]) / (c[0] - a[0]);
    return [a[1] + (c[1] - a[1]) * u, a[2] + (c[2] - a[2]) * u];
  }
  const fuselage = b.sweep(bodyPath, bodyRadius, {
    color: enamel, bone: airframe, sides: 12, caps: "flat", name: "scarlet fabric fuselage",
  });
  const bodySurface = b.surface(fuselage);

  // Long coachlines follow the actual hull surface.
  for (const side of [-1, 1]) {
    const stripe = bodySurface.drape([
      [side * 0.08, 1.69, -2.5],
      [side * 0.22, 1.72, -1.7],
      [side * 0.35, 1.74, -0.8],
      [side * 0.44, 1.78, 0.25],
      [side * 0.45, 1.80, 1.4],
    ], { lift: 0.007 });
    b.sweep(stripe, 0.025, { color: C.ivory, bone: airframe, sides: 4, name: "cream coachline" });

    b.decal(fuselage, title, {
      at: [side * 0.42, 1.61, 0.56],
      dir: [side, 0, 0], size: [1.03, 0.37], up: [0, 1, 0],
      lift: 0.007, segments: 12, name: "Daydream fuselage sign",
    });
    b.decal(fuselage, number, {
      at: [side * 0.23, 1.62, -1.58],
      dir: [side, 0, 0], size: [0.43, 0.30],
      lift: 0.006, segments: 8, name: "tail registration",
    });

    for (let i = 0; i < 7; i++) {
      const z = -1.34 + i * 0.105;
      const hit = bodySurface.nearest([side * 0.36, 1.39, z]);
      b.stick(new THREE.BoxGeometry(0.035, 0.008, 0.009), C.ivory, hit, {
        spin: i % 2 ? 28 : -28, name: "fabric lacing",
      });
    }
  }

  // Wings: broad primitive slabs, gently chamfered, with rounded polygonal tips.
  function wing(y: number, span: number, chord: number, z: number, upper: boolean) {
    const h = span / 2;
    const q = chord / 2;
    const wingShape = [
      [-h + 0.18, -q], [h - 0.18, -q], [h, -q + 0.20],
      [h, q - 0.20], [h - 0.18, q], [-h + 0.18, q],
      [-h, q - 0.20], [-h, -q + 0.20],
    ];
    const slab = b.extrude(wingShape, {
      at: [0, y, z], x: [1, 0, 0], y: [0, 0, 1],
      thickness: 0.125, bevel: 0.028, color: fabric, bone: airframe,
      name: upper ? "upper linen wing" : "lower linen wing",
    });

    for (const s of [-1, 1]) {
      b.extrude([
        [h - 0.58, -q], [h - 0.18, -q], [h, -q + 0.2],
        [h, q - 0.2], [h - 0.18, q], [h - 0.58, q],
      ], {
        at: [0, y, z], x: [s, 0, 0], y: [0, 0, 1],
        thickness: 0.133, bevel: 0.026, color: enamel, bone: airframe,
        name: "scarlet wingtip",
      });
      box([s * (h - 0.61), y + 0.065, z], [0.045, 0.012, chord - 0.05], C.teal);
      box([s * (h - 0.68), y + 0.066, z], [0.021, 0.012, chord - 0.05], C.red);

      // Separate trailing-edge aileron and three small hinge fittings.
      box([s * 2.08, y - 0.005, z - q + 0.13], [1.44, 0.105, 0.24], C.red);
      tube([s * 1.37, y + 0.068, z - q + 0.255],
        [s * 2.80, y + 0.068, z - q + 0.255], 0.008, C.redDark);
      for (const x of [1.50, 2.08, 2.67]) {
        box([s * x, y + 0.072, z - q + 0.24], [0.065, 0.018, 0.072], C.brass);
      }

      for (let i = 0; i < 10; i++) {
        const x = s * (0.53 + i * 0.28);
        if (Math.abs(x) > h - 0.73) continue;
        b.sweep(bezier(
          [x, y + 0.059, z - q + 0.05],
          [x, y + 0.086, z + 0.04],
          [x, y + 0.054, z + q - 0.07],
        ), 0.009, { color: C.linen, bone: airframe, sides: 4, name: "raised linen rib tape" });
      }
      tube([s * 0.03, y + 0.01, z + q - 0.018],
        [s * (h - 0.2), y + 0.01, z + q - 0.018], 0.033, C.ivory);
    }

    if (upper) {
      drawing([-2.05, y + 0.087, z + 0.02], [0.93, 0.93], emblem,
        [0, 1, 0], [0, 0, -1], airframe, "upper wing star roundel");
      drawing([2.05, y + 0.087, z + 0.04], [1.00, 0.69], number,
        [0, 1, 0], [0, 0, -1], airframe, "large wing number");
    } else {
      // These remain readable on the lower wing beyond the top wing's shadows.
      drawing([-2.32, y - 0.071, z], [0.73, 0.73], emblem,
        [0, -1, 0], [0, 0, 1], airframe, "underwing roundel");
    }
    return slab;
  }

  wing(1.19, 6.65, 1.27, 0.14, false);
  wing(2.64, 7.18, 1.37, 0.39, true);

  // Interplane N-struts and crossed flying wires.
  for (const s of [-1, 1]) {
    const x = s * 2.42;
    const lowFront = [x, 1.23, 0.64];
    const lowRear = [x, 1.23, -0.34];
    const highFront = [x, 2.58, 0.92];
    const highRear = [x, 2.58, -0.14];
    for (const [a, c] of [
      [lowFront, highFront], [lowRear, highRear], [lowRear, highFront],
    ]) {
      b.frustumBox(a, c, [0.065, 0.085], [0.065, 0.085], {
        color: strutWood, bone: airframe, name: "varnished interplane strut",
      });
    }
    for (const p of [lowFront, lowRear, highFront, highRear]) {
      box(p, [0.13, 0.07, 0.15], C.teal);
      bolt([p[0] + s * 0.07, p[1], p[2]], [s, 0, 0]);
    }

    for (const z of [0.66, -0.30]) {
      const topZ = z + 0.26;
      tube([s * 0.50, 1.24, z], [s * 2.39, 2.58, topZ], 0.009, C.wire);
      tube([s * 0.55, 2.58, topZ], [s * 2.39, 1.25, z], 0.009, C.wire);
      tube([s * 0.57, 1.29, z + 0.01], [s * 0.74, 1.41, z + 0.033],
        0.019, C.metal, airframe, "flying wire turnbuckle");
    }

    // Four inner cabane supports leave the cockpit entrance open aft.
    for (const z of [0.18, 1.03]) {
      const a = [s * 0.31, 1.96, z];
      const c = [s * 0.72, 2.58, z + 0.04];
      tube(a, c, 0.034, C.teal);
      cylinder(c, 0.065, 0.035, C.brass);
    }

    // Exposed aileron linkage.
    tube([s * 2.72, 1.26, -0.40], [s * 2.72, 2.76, -0.20], 0.016, C.dark);
    b.slab([
      [s * 2.72, 2.71, -0.27],
      [s * 2.72, 2.82, -0.14],
      [s * 2.72, 2.68, -0.05],
    ], { thickness: 0.025, color: C.teal, bone: airframe, name: "aileron control horn" });
  }

  // Open cockpit: dark well, padded coaming, seat and small curved windscreen.
  ellipsoid([0, 1.953, -0.50], [0.285, 0.063, 0.43], C.dark, airframe, "cockpit opening");
  const cockpitRim = Array.from({ length: 24 }, (_, i) => {
    const a = i / 24 * Math.PI * 2;
    return [Math.cos(a) * 0.29, 1.973 + Math.cos(a) * 0.003, -0.5 + Math.sin(a) * 0.435];
  });
  b.sweep(polyline(cockpitRim, { closed: true }), 0.037, {
    color: C.leather, bone: airframe, sides: 8, name: "leather cockpit coaming",
  });
  box([0, 1.988, -0.65], [0.35, 0.055, 0.27], C.leather, airframe, [0, 0, 0], "seat cushion");
  box([0, 2.075, -0.82], [0.36, 0.24, 0.075], C.leather, airframe, [-12, 0, 0], "pilot seat back");
  box([0, 2.08, -0.779], [0.055, 0.22, 0.012], C.linen, airframe, [-12, 0, 0], "seat harness");
  box([0.08, 2.006, -0.65], [0.23, 0.012, 0.036], C.linen, airframe, [0, 20, 0], "lap belt");
  box([0.02, 2.015, -0.63], [0.065, 0.018, 0.055], C.brass, airframe, [0, 0, 0], "harness buckle");
  tube([0, 1.96, -0.40], [0, 2.14, -0.36], 0.017, C.dark);
  ellipsoid([0, 2.14, -0.36], [0.035, 0.022, 0.025], C.leather);

  box([0, 2.018, -0.145], [0.43, 0.20, 0.045], wood, airframe, [0, 0, 0], "instrument panel");
  drawing([0, 2.02, -0.170], [0.41, 0.19], dashboardTexture, [0, 0, -1], [0, 1, 0]);

  const windscreen = [
    [-0.275, 2.005, -0.10],
    [-0.235, 2.235, -0.015],
    [0, 2.32, 0.045],
    [0.235, 2.235, -0.015],
    [0.275, 2.005, -0.10],
  ];
  b.slab(windscreen, {
    thickness: 0.014, color: "#9bbfc0", bone: airframe, name: "pale blue windscreen",
  });
  b.sweep(windscreen, 0.017, { color: C.brass, bone: airframe, sides: 6, name: "windscreen frame" });
  tube([-0.275, 2.005, -0.10], [0.275, 2.005, -0.10], 0.018, C.brass);
  tube([-0.16, 2.10, -0.065], [-0.11, 2.22, -0.018], 0.009, C.pale);

  for (const s of [-1, 1]) {
    tube([s * 0.37, 1.57, -0.56], [s * 0.56, 1.41, -0.57], 0.024, C.teal);
    tube([s * 0.56, 1.41, -0.57], [s * 0.56, 1.41, -0.91], 0.024, C.teal);
  }

  // Radial engine in an open annular cowling.
  cylinder([0, 1.64, 1.78], 0.45, 0.22, C.redDark, [0, 0, 1], airframe, 16, "engine firewall");
  cylinder([0, 1.64, 1.94], 0.395, 0.08, C.dark, [0, 0, 1], airframe, 16, "engine recess");
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
        j % 2 ? "#758386" : C.metal, d, airframe, 8, "radial cylinder cooling fin");
    }
    ellipsoid(point(0.414, 1.995), [0.05, 0.05, 0.057], C.dark);
    tube(point(0.17, 2.055), point(0.39, 2.055), 0.011, C.brass, airframe, "pushrod");
    bolt(point(0.488, 1.77), [0, 0, 1]);
  }
  cylinder([0, 1.64, 2.065], 0.205, 0.16, C.metal, [0, 0, 1], airframe, 12, "crankcase");
  cylinder([0, 1.64, 2.16], 0.135, 0.09, C.dark, [0, 0, 1]);
  for (let i = 0; i < 6; i++) {
    const a = i * Math.PI / 3;
    bolt([Math.sin(a) * 0.155, 1.64 + Math.cos(a) * 0.155, 2.15]);
  }
  b.sweep(catmull([
    [-0.30, 1.35, 1.72], [-0.46, 1.25, 1.59], [-0.49, 1.21, 1.25], [-0.47, 1.18, 1.00],
  ]), 0.057, { color: "#805d47", bone: airframe, sides: 8, caps: "flat", name: "bent exhaust pipe" });
  cylinder([-0.47, 1.18, 0.993], 0.042, 0.008, C.dark, [0, 0, 1]);

  // Laminated two-blade wooden propeller with cream safety tips.
  const bladeOutline = [
    [-0.055, 0.10], [-0.11, 0.32], [-0.15, 0.66], [-0.12, 0.98],
    [-0.05, 1.09], [0.055, 1.08], [0.105, 0.96], [0.105, 0.68],
    [0.075, 0.35], [0.055, 0.10],
  ];
  for (const s of [-1, 1]) {
    const xAxis = [0.94 * s, -0.342 * s, 0];
    const yAxis = [0.342 * s, 0.94 * s, 0];
    b.extrude(bladeOutline, {
      at: [0, 1.64, 2.255], x: xAxis, y: yAxis, thickness: 0.055,
      bevel: 0.012, color: wood, bone: propeller, name: "wooden propeller blade",
    });
    b.extrude([
      [-0.135, 0.88], [-0.12, 0.98], [-0.05, 1.09],
      [0.055, 1.08], [0.105, 0.96], [0.105, 0.88],
    ], {
      at: [0, 1.64, 2.258], x: xAxis, y: yAxis, thickness: 0.062,
      bevel: 0.008, color: C.ivory, bone: propeller, name: "ivory propeller tip",
    });
    b.extrude([
      [-0.143, 0.80], [0.105, 0.80], [0.105, 0.85], [-0.139, 0.85],
    ], {
      at: [0, 1.64, 2.26], x: xAxis, y: yAxis, thickness: 0.065,
      color: C.red, bone: propeller, name: "propeller safety stripe",
    });
    tube([s * 0.342 * 0.28, 1.64 + s * 0.94 * 0.28, 2.288],
      [s * 0.342 * 0.73, 1.64 + s * 0.94 * 0.73, 2.288],
      0.008, C.linen, propeller, "propeller lamination");
  }
  cylinder([0, 1.64, 2.292], 0.16, 0.065, C.brass, [0, 0, 1], propeller, 12, "propeller boss");
  ellipsoid([0, 1.64, 2.34], [0.106, 0.106, 0.094], C.red, propeller, "red spinner cap");
  for (let i = 0; i < 6; i++) {
    const a = i * Math.PI / 3;
    bolt([Math.sin(a) * 0.128, 1.64 + Math.cos(a) * 0.128, 2.33], [0, 0, 1], propeller);
  }

  // Undercarriage: an axle, triangulated legs, large balloon tyres and painted hubs.
  tube([-1.03, 0.52, 0.88], [1.03, 0.52, 0.88], 0.048, C.dark);
  for (const s of [-1, 1]) {
    const bone = s > 0 ? wheelL : wheelR;
    tube([s * 0.32, 1.31, 1.13], [s * 0.88, 0.52, 0.88], 0.054, C.teal);
    tube([s * 0.32, 1.30, -0.13], [s * 0.88, 0.52, 0.88], 0.048, C.teal);
    tube([s * 0.22, 1.27, 0.91], [s * 0.73, 0.60, 0.88], 0.012, C.wire);
    cylinder([s * 0.88, 0.52, 0.88], 0.39, 0.24, C.rubber, [1, 0, 0], bone, 20, "balloon tyre");
    for (const sideOffset of [-0.112, 0.112]) {
      cylinder([s * 0.88 + sideOffset, 0.52, 0.88], 0.355, 0.018,
        "#383c40", [1, 0, 0], bone, 20, "tyre shoulder");
    }
    cylinder([s * 1.014, 0.52, 0.88], 0.225, 0.025, C.ivory, [s, 0, 0], bone, 16, "cream wheel dish");
    cylinder([s * 1.032, 0.52, 0.88], 0.155, 0.028, C.red, [s, 0, 0], bone, 12, "red wheel hub");
    cylinder([s * 1.054, 0.52, 0.88], 0.067, 0.055, C.brass, [s, 0, 0], bone, 8, "axle cap");
    drawing([s * 1.024, 0.52, 0.88], [0.73, 0.73], tireMark,
      [s, 0, 0], [0, 1, 0], bone, "tyre sidewall lettering");
    for (let j = 0; j < 6; j++) {
      const a = j * Math.PI / 3;
      bolt([s * 1.052, 0.52 + Math.sin(a) * 0.119, 0.88 + Math.cos(a) * 0.119], [s, 0, 0], bone);
    }
    for (let j = 0; j < 5; j++) {
      cylinder([s * (0.65 + j * 0.025), 0.60, 0.88], 0.065, 0.017,
        C.linen, [1, 0, 0], airframe, 8, "landing gear shock cord wrap");
    }
  }

  // Elliptical tailplane, upright fin and separate rudder.
  b.extrude([
    [-1.10, -0.18], [-0.97, -0.39], [-0.36, -0.47], [0.36, -0.47],
    [0.97, -0.39], [1.10, -0.18], [0.96, 0.17], [0.55, 0.31],
    [-0.55, 0.31], [-0.96, 0.17],
  ], {
    at: [0, 1.67, -2.21], x: [1, 0, 0], y: [0, 0, 1],
    thickness: 0.075, bevel: 0.016, color: fabric, bone: airframe, name: "cream horizontal stabilizer",
  });
  for (const s of [-1, 1]) {
    b.extrude([
      [0.76, -0.41], [0.97, -0.39], [1.10, -0.18],
      [0.96, 0.17], [0.76, 0.24],
    ], {
      at: [0, 1.67, -2.21], x: [s, 0, 0], y: [0, 0, 1],
      thickness: 0.082, bevel: 0.012, color: enamel, bone: airframe, name: "red stabilizer tip",
    });
    tube([s * 0.11, 1.716, -2.49], [s * 0.93, 1.716, -2.49], 0.009, C.teal);
    tube([s * 0.08, 1.89, -2.30], [s * 0.82, 1.71, -2.18], 0.008, C.wire);
    tube([s * 0.07, 1.51, -2.06], [s * 0.85, 1.63, -2.22], 0.013, C.teal);
    tube([s * 0.35, 1.45, -0.83], [s * 0.14, 1.74, -2.55], 0.008, C.wire);
  }

  b.extrude([
    [0.35, 0], [0.22, 0.40], [-0.05, 0.89], [-0.25, 0.99],
    [-0.43, 0.87], [-0.43, 0],
  ], {
    at: [0, 1.70, -2.12], x: [0, 0, 1], y: [0, 1, 0],
    thickness: 0.083, bevel: 0.018, color: enamel, bone: airframe, name: "swept vertical tail fin",
  });
  b.extrude([
    [0, 0], [0, 0.89], [-0.21, 0.87], [-0.35, 0.64],
    [-0.36, 0.25], [-0.22, -0.08],
  ], {
    at: [0, 1.70, -2.55], x: [0, 0, 1], y: [0, 1, 0],
    thickness: 0.087, bevel: 0.015, color: C.ivory, bone: rudder, name: "separate ivory rudder",
  });
  for (const s of [-1, 1]) {
    drawing([s * 0.048, 2.22, -2.29], [0.36, 0.36], emblem,
      [s, 0, 0], [0, 1, 0], airframe, "tail star badge");
    tube([s * 0.051, 1.82, -2.57], [s * 0.051, 2.45, -2.57], 0.008, C.teal, rudder);
  }
  for (const y of [1.86, 2.15, 2.43]) {
    cylinder([0, y, -2.55], 0.023, 0.13, C.brass, [1, 0, 0], airframe, 8, "rudder hinge");
  }

  b.sweep(catmull([
    [0, 1.56, -2.48], [0, 0.93, -2.62], [0, 0.24, -2.82], [0, 0.18, -3.02],
  ]), [0.045, 0.034], {
    color: strutWood, bone: airframe, sides: 6, caps: "round", name: "sprung wooden tail skid",
  });
  tube([0, 0.18, -2.87], [0, 0.18, -3.06], 0.045, C.dark, airframe, "tail skid shoe");
  tube([0, 1.26, -2.39], [0, 0.71, -2.68], 0.022, C.teal);

  // Two wooden wheel chocks and their connecting rope.
  for (const s of [-1, 1]) {
    b.extrude([[-0.13, 0], [0.13, 0], [0.04, 0.14], [-0.055, 0.14]], {
      at: [s * 0.88, 0.135, 1.27], x: [0, 0, 1], y: [0, 1, 0],
      thickness: 0.36, color: strutWood, bone: airframe, name: "wooden wheel chock",
    });
    box([s * 0.88, 0.222, 1.314], [0.27, 0.025, 0.035], C.red);
  }
  b.sweep(catmull([
    [-0.74, 0.16, 1.33], [-0.40, 0.145, 1.52],
    [0.23, 0.145, 1.59], [0.74, 0.16, 1.33],
  ]), 0.013, { color: C.linen, bone: airframe, sides: 5, name: "chock rope" });

  // A modest striped windsock, placed behind the wing rather than in front of it.
  const poleX = -3.12, poleZ = -2.09;
  cylinder([poleX, 0.17, poleZ], 0.15, 0.08, C.teal);
  tube([poleX, 0.17, poleZ], [poleX, 2.30, poleZ], 0.028, C.ivory);
  for (let i = 0; i < 4; i++) {
    cylinder([poleX, 0.38 + i * 0.43, poleZ], 0.03, 0.16, C.red);
  }
  ellipsoid([poleX, 2.32, poleZ], [0.055, 0.055, 0.055], C.brass);
  tube([poleX, 2.28, poleZ], [poleX + 0.13, 2.29, poleZ], 0.025, C.teal);
  const sockPath = catmull([
    [poleX + 0.13, 2.29, poleZ], [poleX + 0.45, 2.27, poleZ],
    [poleX + 0.76, 2.17, poleZ + 0.03], [poleX + 1.05, 2.06, poleZ + 0.06],
  ]);
  b.sweep(sockPath, [0.15, 0.055], {
    color: C.ivory, bone: airframe, sides: 10, caps: "none",
    bands: [[0.2, C.red], [0.4, C.ivory], [0.6, C.red], [0.8, C.ivory], [1, C.red]],
    name: "striped windsock",
  });
  cylinder([poleX + 0.135, 2.29, poleZ], 0.125, 0.007, C.redDark, [1, 0, 0], airframe, 12, "windsock dark mouth");
  b.part(new THREE.TorusGeometry(0.151, 0.012, 6, 16), C.brass, {
    at: [poleX + 0.125, 2.29, poleZ], rotation: [0, 90, 0], bone: airframe, name: "windsock mouth hoop",
  });
  for (const s of [-1, 1]) {
    tube([poleX, 1.02, poleZ], [poleX + s * 0.39, 0.15, poleZ + 0.27], 0.008, C.wire);
    box([poleX + s * 0.39, 0.16, poleZ + 0.27], [0.035, 0.08, 0.035], C.dark);
  }

  // Fuel tin, small tool case and a cloth beside the tail.
  box([1.66, 0.35, -2.13], [0.29, 0.43, 0.22], C.teal, airframe, [0, -12, 0], "aviation spirit tin");
  box([1.66, 0.57, -2.13], [0.28, 0.035, 0.21], C.brass);
  cylinder([1.58, 0.60, -2.13], 0.044, 0.04, C.red);
  tube([1.68, 0.59, -2.13], [1.68, 0.66, -2.13], 0.014, C.dark);
  tube([1.68, 0.66, -2.13], [1.77, 0.66, -2.13], 0.014, C.dark);
  tube([1.77, 0.66, -2.13], [1.77, 0.59, -2.13], 0.014, C.dark);
  drawing([1.681, 0.36, -2.008], [0.21, 0.27], fuelLabel, [0.208, 0, 0.978]);
  box([2.05, 0.235, -2.32], [0.50, 0.20, 0.30], C.leather, airframe, [0, 10, 0], "mechanic tool case");
  for (const x of [1.90, 2.20]) {
    box([x, 0.339, -2.32], [0.048, 0.014, 0.29], C.brass, airframe, [0, 10, 0]);
  }
  tube([1.98, 0.36, -2.31], [2.12, 0.36, -2.31], 0.024, C.dark);
  b.slab([
    [1.76, 0.142, -1.88], [2.17, 0.142, -1.93],
    [2.28, 0.142, -1.66], [1.86, 0.142, -1.61],
  ], { color: C.ivory, thickness: 0.008, bone: airframe, name: "mechanic cloth" });

  // Sparse, chunky grass tufts around the edge of the small stage.
  for (let i = 0; i < 25; i++) {
    const a = random() * Math.PI * 2;
    const r = 3.45 + random() * 0.38;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r * 0.78 - 0.1;
    if (z > 2.3 && Math.abs(x) < 1.1) continue;
    const h = 0.08 + random() * 0.08;
    const col = i % 3 ? "#91a36b" : "#b6b67d";
    b.slab([
      [x - 0.055, 0.12, z], [x - 0.06, 0.12 + h, z],
      [x, 0.14 + h * 0.5, z], [x + 0.025, 0.15 + h, z],
      [x + 0.06, 0.12, z],
    ], { thickness: 0.006, color: col, bone: airframe, name: "airfield grass tuft" });
  }

  // Museum-like title tile sunk into the front edge of the grass.
  box([0, 0.151, 2.72], [1.37, 0.04, 0.34], C.teal, airframe, [0, 0, 0], "airfield title tile");
  drawing([0, 0.174, 2.72], [1.30, 0.295], plaqueTexture,
    [0, 1, 0], [0, 0, -1], airframe, "barnstormer title plaque");

  return b.root;
}
```