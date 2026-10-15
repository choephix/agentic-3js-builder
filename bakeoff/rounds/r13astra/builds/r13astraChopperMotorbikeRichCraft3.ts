import * as THREE from "three";
import {
  createBuilder,
  frame,
  catmull,
  bezier,
  polyline,
  paint,
  mix,
  noise,
  svg,
} from "../../../../src/index";
import type { Fill } from "../../../../src/index";
import {
  metal,
  coil,
  gearGeometry,
} from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "SUNSTREAK — Custom Chopper",
  description:
    "An oversized hero-shooter chopper with sunset-orange armor, ivory forged wheels, a finned V-twin, raked telescopic forks, twin slash exhausts, and an electric-blue ignition system.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "SUNSTREAK", paintSize: 2048 });

  const C = {
    orange: "#ee742b",
    orangeLight: "#ffad48",
    orangeDark: "#a83e25",
    cream: "#f4e7cc",
    creamShadow: "#c6bba5",
    ink: "#172832",
    blueBlack: "#233b46",
    rubber: "#20282d",
    tread: "#303b42",
    steel: "#a9bdc5",
    darkSteel: "#526b76",
    gold: "#dfaa52",
    cyan: "#5fe9ed",
    cyanWhite: "#d4ffff",
    red: "#ff574b",
  };

  const armor = paint((p, n) =>
    mix(
      "#c45127",
      "#ffa24a",
      Math.max(0, Math.min(1, 0.48 + n.y * 0.24 + n.z * 0.09 + (noise(p, 0.19, 8) - 0.5) * 0.12)),
    ),
  );
  const ivory = paint((_p, n) =>
    mix("#b9b5a7", "#fff0d3", 0.55 + n.y * 0.3),
  );
  const steel = metal("steel", { polish: 0.65, tarnish: 0.05, size: 0.12 });
  const satin = metal("iron", { polish: 0.28, tarnish: 0.08, size: 0.16 });
  const brass = metal("brass", { polish: 0.5, tarnish: 0.08 });

  // The vehicle has an actual steering hierarchy and independent wheel axles.
  const chassis = b.joint("chassis", { at: [0, 0.53, -0.12] });
  const steering = b.joint("steering", {
    parent: chassis,
    at: [0, 1.15, 0.43],
    dir: [0, 0.57, -0.82],
    role: "hinge",
  });
  const rearWheel = b.joint("rearWheel", {
    parent: chassis,
    at: [0, 0.46, -0.96],
    dir: [1, 0, 0],
    role: "hinge",
  });
  const frontWheel = b.joint("frontWheel", {
    parent: steering,
    at: [0, 0.52, 1.42],
    dir: [1, 0, 0],
    role: "hinge",
  });

  type Bone = typeof chassis;

  function box(
    at: number[],
    size: number[],
    color: Fill,
    bone: Bone = chassis,
    rotation: number[] = [0, 0, 0],
    name = "panel",
  ) {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      bone,
      rotation,
      name,
    });
  }

  function cylinder(
    at: number[],
    radius: number,
    depth: number,
    color: Fill,
    dir: number[] = [1, 0, 0],
    bone: Bone = chassis,
    segments = 12,
    name = "machinedBoss",
  ) {
    return b.part(new THREE.CylinderGeometry(radius, radius, depth, segments), color, {
      at,
      dir,
      bone,
      name,
    });
  }

  function ring(
    at: number[],
    radius: number,
    tube: number,
    color: Fill,
    dir: number[] = [1, 0, 0],
    bone: Bone = chassis,
    segments = 24,
    name = "rim",
  ) {
    return b.part(new THREE.TorusGeometry(radius, tube, 6, segments), color, {
      at,
      dir,
      axis: "z",
      bone,
      name,
    });
  }

  function rod(
    a: number[],
    z: number[],
    radius: number,
    color: Fill,
    bone: Bone = chassis,
    name = "frameTube",
  ) {
    return b.rod(a, z, radius, { color, bone, sides: 8, name });
  }

  function bolt(
    at: number[],
    dir: number[] = [1, 0, 0],
    bone: Bone = chassis,
    radius = 0.014,
  ) {
    return cylinder(at, radius, 0.013, steel, dir, bone, 6, "hexFastener");
  }

  function label(
    at: number[],
    size: number[],
    texture: THREE.Texture,
    dir: number[] = [0, 0, 1],
    bone: Bone = chassis,
    up: number[] = [0, 1, 0],
    name = "graphic",
  ) {
    return b.part(new THREE.PlaneGeometry(size[0], size[1]), "#ffffff", {
      at,
      dir,
      axis: "z",
      up,
      texture,
      bone,
      name,
    });
  }

  const tankGraphic = svg(`
    <svg viewBox="0 0 320 160">
      <path d="M18 103 L98 18 H176 L138 59 H258 L191 125 H111 L153 83 H85 L65 103Z"
        fill="#172832" stroke="#fff0d3" stroke-width="7" stroke-linejoin="round"/>
      <path d="M115 34 H146 L108 75 H181 L148 110 H132 L158 83 H83Z" fill="#ffbe55"/>
      <path d="M208 105 L264 49 L290 49 L237 105Z" fill="#fff0d3"/>
      <text x="161" y="151" text-anchor="middle" font-family="sans-serif"
        font-size="20" font-weight="900" letter-spacing="6" fill="#172832">SUNSTREAK</text>
    </svg>
  `, { size: 512 });

  const numberGraphic = svg(`
    <svg viewBox="0 0 180 110">
      <path d="M7 5 H174 V105 H7Z" fill="#172832"/>
      <path d="M8 5 H171 L154 18 H8Z" fill="#f4e7cc"/>
      <text x="92" y="83" text-anchor="middle" font-family="sans-serif"
        font-size="76" font-style="italic" font-weight="900" fill="#f4e7cc">07</text>
      <path d="M16 94 H111 L102 102 H16Z" fill="#ff9b39"/>
      <path d="M126 94 H166" stroke="#5fe9ed" stroke-width="5"/>
    </svg>
  `, { size: 256 });

  const cautionGraphic = svg(`
    <svg viewBox="0 0 256 80">
      <rect width="256" height="80" rx="7" fill="#172832"/>
      <path d="M0 0 H256 V15 H0Z" fill="#ffb44d"/>
      <g stroke="#172832" stroke-width="10">
        <path d="M8 0 L23 15 M38 0 L53 15 M68 0 L83 15 M98 0 L113 15
          M128 0 L143 15 M158 0 L173 15 M188 0 L203 15 M218 0 L233 15"/>
      </g>
      <path d="M22 61 L38 30 L55 61Z" fill="none" stroke="#ffb44d" stroke-width="4"/>
      <path d="M38 39 V49 M38 53 V56" stroke="#ffb44d" stroke-width="4"/>
      <text x="72" y="43" font-family="sans-serif" font-size="16"
        font-weight="bold" fill="#f4e7cc">HOT / KEEP CLEAR</text>
      <text x="72" y="65" font-family="monospace" font-size="13"
        fill="#8da5ae">EXHAUST · 1200°C</text>
    </svg>
  `, { size: 384 });

  const dialGraphic = svg(`
    <svg viewBox="0 0 160 160">
      <circle cx="80" cy="80" r="78" fill="#10262e" stroke="#c3d6d5" stroke-width="4"/>
      <path d="M36 119 A59 59 0 1 1 129 112" fill="none" stroke="#426470" stroke-width="10"/>
      <path d="M37 118 A58 58 0 1 1 137 66" fill="none" stroke="#67eef0" stroke-width="6"/>
      <path d="M136 65 A58 58 0 0 1 129 113" fill="none" stroke="#ff7647" stroke-width="6"/>
      <g stroke="#e2f8ef" stroke-width="3">
        <path d="M35 108 L42 104 M27 82 H36 M34 54 L42 59 M53 32 L58 41
          M80 23 V34 M108 32 L103 41 M129 54 L120 59 M137 82 H126"/>
      </g>
      <path d="M75 84 L112 44 L85 86Z" fill="#ffac45"/>
      <circle cx="80" cy="82" r="8" fill="#ebf5dd"/>
      <text x="80" y="118" text-anchor="middle" font-family="monospace"
        font-weight="bold" font-size="22" fill="#70f5ed">N  00</text>
      <text x="80" y="137" text-anchor="middle" font-family="sans-serif"
        font-size="10" letter-spacing="2" fill="#b5d2d5">RPM × 1000</text>
    </svg>
  `, { size: 256 });

  const technicalGraphic = svg(`
    <svg viewBox="0 0 240 130">
      <rect width="240" height="130" rx="10" fill="#203943"/>
      <path d="M13 20 H80 L92 32 H227 M13 105 H112 L125 93 H227"
        fill="none" stroke="#75939c" stroke-width="3"/>
      <text x="17" y="64" font-family="sans-serif" font-size="29"
        font-weight="900" fill="#f4e7cc">V // 1800</text>
      <text x="17" y="84" font-family="monospace" font-size="12"
        letter-spacing="2" fill="#6ff0e7">ION ASSISTED</text>
      <path d="M170 43 V76 M179 43 V76 M188 43 V76 M197 43 V76 M206 43 V76"
        stroke="#f1b35a" stroke-width="4"/>
    </svg>
  `, { size: 384 });

  const tireGraphic = svg(`
    <svg viewBox="0 0 256 64">
      <text x="128" y="31" text-anchor="middle" font-family="sans-serif"
        font-size="28" font-weight="900" font-style="italic" letter-spacing="3"
        fill="#9ba6a7">ROAD HOUND</text>
      <text x="128" y="53" text-anchor="middle" font-family="monospace"
        font-size="13" letter-spacing="4" fill="#657780">CUSTOM // 240</text>
    </svg>
  `, { size: 384 });

  const saddlePaint = paint((p, n) => {
    const weave = Math.sin(p.x * 580) * Math.sin(p.z * 580);
    return mix("#182c36", "#344b52", 0.3 + n.y * 0.2 + weave * 0.045);
  });

  // Wheels: real open spaces between the sculptural spokes, not painted discs.
  function wheel(
    centerY: number,
    centerZ: number,
    outer: number,
    tireTube: number,
    tireDepth: number,
    rimRadius: number,
    spokeCount: number,
    bone: Bone,
    front: boolean,
  ) {
    const major = outer - tireTube;
    b.part(new THREE.TorusGeometry(major, tireTube, 10, 40), C.rubber, {
      at: [0, centerY, centerZ],
      dir: [1, 0, 0],
      axis: "z",
      scale: [1, 1, tireDepth / (tireTube * 2)],
      bone,
      name: front ? "frontRubber" : "rearFatRubber",
    });

    // Squared individual tread bars retain the chunky toy-like silhouette.
    const treads = front ? 28 : 32;
    for (let i = 0; i < treads; i++) {
      const a = (i / treads) * Math.PI * 2;
      box(
        [0, centerY + (outer - 0.003) * Math.cos(a), centerZ + (outer - 0.003) * Math.sin(a)],
        [tireDepth * 0.64, 0.014, front ? 0.052 : 0.064],
        i % 4 === 0 ? C.tread : C.rubber,
        bone,
        [a * 180 / Math.PI, 0, 0],
        "treadBlock",
      );
    }

    for (const side of [-1, 1]) {
      const x = side * tireDepth * 0.38;
      ring([x, centerY, centerZ], rimRadius, 0.024, ivory, [1, 0, 0], bone, 32, "forgedRim");
      ring([x + side * 0.008, centerY, centerZ], rimRadius + 0.029, 0.009, armor, [1, 0, 0], bone, 32, "orangeRimStripe");
      ring([x, centerY, centerZ], rimRadius - 0.025, 0.009, steel, [1, 0, 0], bone, 32, "rimInnerLip");
      ring([side * tireDepth * 0.485, centerY, centerZ], major, 0.005, C.tread, [1, 0, 0], bone, 32, "sidewallBead");
    }

    cylinder([0, centerY, centerZ], 0.105, tireDepth * 0.95, satin, [1, 0, 0], bone);
    cylinder([0, centerY, centerZ], 0.064, tireDepth + 0.055, steel, [1, 0, 0], bone);
    for (let i = 0; i < spokeCount; i++) {
      const a = (i / spokeCount) * Math.PI * 2;
      const a2 = a + 0.22;
      const p0 = [0, centerY + 0.085 * Math.cos(a), centerZ + 0.085 * Math.sin(a)];
      const p1 = [0, centerY + rimRadius * Math.cos(a2), centerZ + rimRadius * Math.sin(a2)];
      b.frustumBox(p0, p1, [front ? 0.073 : 0.095, 0.052], [front ? 0.051 : 0.071, 0.035], {
        color: ivory,
        bone,
        name: "sweptForgedSpoke",
      });
    }

    const brakeX = front ? -0.117 : 0.181;
    const brakeRadius = front ? 0.23 : 0.19;
    const annulus = new THREE.RingGeometry(brakeRadius - 0.052, brakeRadius, 32);
    b.part(annulus, steel, {
      at: [brakeX, centerY, centerZ],
      dir: [Math.sign(brakeX), 0, 0],
      axis: "z",
      bone,
      name: "ventilatedBrakeDisc",
    });
    ring([brakeX, centerY, centerZ], brakeRadius - 0.004, 0.006, steel, [1, 0, 0], bone, 32);
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3;
      rod(
        [brakeX, centerY + 0.06 * Math.cos(a), centerZ + 0.06 * Math.sin(a)],
        [brakeX, centerY + (brakeRadius - 0.036) * Math.cos(a + 0.23), centerZ + (brakeRadius - 0.036) * Math.sin(a + 0.23)],
        0.016,
        C.darkSteel,
        bone,
        "discCarrier",
      );
    }
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      cylinder(
        [brakeX + Math.sign(brakeX) * 0.002, centerY + (brakeRadius - 0.024) * Math.cos(a), centerZ + (brakeRadius - 0.024) * Math.sin(a)],
        0.007,
        0.003,
        C.ink,
        [1, 0, 0],
        bone,
        6,
        "brakeDrilling",
      );
    }
    for (const side of [-1, 1]) {
      cylinder([side * (tireDepth / 2 + 0.032), centerY, centerZ], 0.035, 0.027, brass, [1, 0, 0], bone, 6, "axleNut");
    }
  }

  wheel(0.46, -0.96, 0.46, 0.112, 0.31, 0.313, 6, rearWheel, false);
  wheel(0.52, 1.42, 0.52, 0.079, 0.17, 0.413, 7, frontWheel, true);

  for (const s of [-1, 1]) {
    label([s * 0.159, 0.72, -0.96], [0.27, 0.067], tireGraphic, [s, 0, 0], rearWheel);
  }

  // Twin triangulated chassis rails and the visible low-slung cradle.
  for (const s of [-1, 1]) {
    const x = s * 0.155;
    b.sweep(
      polyline([
        [x, 0.48, -0.88],
        [x, 0.32, -0.49],
        [x, 0.32, 0.29],
        [s * 0.095, 1.10, 0.43],
      ]),
      0.041,
      { color: C.ink, bone: chassis, sides: 8, name: "lowerCradle" },
    );
    rod([x, 0.40, -0.64], [x, 0.94, -0.43], 0.038, armor);
    rod([x, 0.94, -0.43], [s * 0.095, 1.10, 0.43], 0.041, C.ink);
    rod([x, 0.94, -0.43], [s * 0.20, 0.52, -0.96], 0.035, C.ink);
    b.frustumBox(
      [s * 0.19, 0.40, -0.30],
      [s * 0.205, 0.46, -0.96],
      [0.07, 0.08],
      [0.06, 0.067],
      { color: C.blueBlack, bone: chassis, name: "swingArm" },
    );
    bolt([s * 0.232, 0.43, -0.32], [s, 0, 0], chassis, 0.024);
  }
  rod([-0.20, 0.33, 0.23], [0.20, 0.33, 0.23], 0.035, steel);
  rod([-0.20, 0.37, -0.46], [0.20, 0.37, -0.46], 0.035, satin);

  // Rear suspension, with big exposed warm-metal springs.
  for (const s of [-1, 1]) {
    const lower = [s * 0.225, 0.48, -0.86];
    const upper = [s * 0.225, 0.88, -0.57];
    rod(lower, upper, 0.024, steel, chassis, "shockShaft");
    b.sweep(coil(lower, upper, 0.045, 7), 0.009, {
      color: brass,
      bone: chassis,
      sides: 6,
      name: "rearCoilSpring",
    });
    cylinder(lower, 0.048, 0.05, C.ink);
    cylinder(upper, 0.048, 0.05, C.ink);
    bolt([s * 0.258, lower[1], lower[2]], [s, 0, 0]);
    bolt([s * 0.258, upper[1], upper[2]], [s, 0, 0]);
  }

  // A short, broad rear fender floating tightly over the fat tire.
  function fender(
    cy: number,
    cz: number,
    radius: number,
    start: number,
    end: number,
    width: number,
    bone: Bone,
    front: boolean,
  ) {
    const points: number[][] = [];
    for (let i = 0; i <= 9; i++) {
      const a = (start + (end - start) * i / 9) * Math.PI / 180;
      points.push([0, cy + radius * Math.cos(a), cz + radius * Math.sin(a)]);
    }
    const path = catmull(points);
    b.sweep(path, () => [width / 2, 0.025], {
      color: armor,
      section: "box",
      caps: "flat",
      bone,
      name: front ? "frontHugger" : "rearBobbedFender",
    });
    for (const s of [-1, 1]) {
      const edge = points.map(p => [s * width * 0.49, p[1], p[2]]);
      b.sweep(catmull(edge), 0.009, { color: C.cream, bone, sides: 6, name: "fenderPiping" });
    }
    const stripe = points.map(p => {
      const dy = p[1] - cy;
      const dz = p[2] - cz;
      return [0, p[1] + dy / radius * 0.027, p[2] + dz / radius * 0.027];
    });
    b.sweep(catmull(stripe), () => [front ? 0.025 : 0.032, 0.002], {
      color: C.ink,
      section: "box",
      caps: "flat",
      bone,
      name: "fenderRacingStripe",
    });
  }
  fender(0.46, -0.96, 0.514, -76, 61, 0.376, chassis, false);
  fender(0.52, 1.42, 0.566, -47, 57, 0.205, steering, true);

  // Front wheel brake caliper and fender stays.
  box([-0.144, 0.67, 1.28], [0.08, 0.17, 0.09], armor, steering, [24, 0, 0], "frontCaliper");
  box([-0.19, 0.67, 1.28], [0.017, 0.10, 0.048], ivory, steering, [24, 0, 0], "caliperInsert");
  bolt([-0.204, 0.715, 1.30], [-1, 0, 0], steering);
  bolt([-0.204, 0.632, 1.26], [-1, 0, 0], steering);
  for (const s of [-1, 1]) {
    rod([s * 0.13, 0.54, 1.42], [s * 0.13, 0.99, 1.19], 0.013, steel, steering, "fenderStay");
  }

  // Long raked, telescopic forks: heavy lower sliders, polished stanchions.
  const forkBottom = [0, 0.52, 1.42];
  const forkTop = [0, 1.23, 0.365];
  const forkDirection = new THREE.Vector3(0, forkTop[1] - forkBottom[1], forkTop[2] - forkBottom[2]).normalize();

  for (const s of [-1, 1]) {
    const x = s * 0.157;
    const bottom = [x, 0.52, 1.42];
    const mid = [x, 0.89, 0.870];
    const top = [x, 1.23, 0.365];
    rod(bottom, mid, 0.052, C.blueBlack, steering, "forkSlider");
    rod(mid, top, 0.032, steel, steering, "polishedStanchion");
    cylinder(bottom, 0.066, 0.10, ivory, [1, 0, 0], steering, 10, "forkAxleLug");
    cylinder(mid, 0.060, 0.042, brass, forkDirection.toArray(), steering, 10, "forkDustSeal");
    cylinder(top, 0.048, 0.026, steel, forkDirection.toArray(), steering, 10, "forkTopCap");

    b.frustumBox(
      [x, 0.61, 1.286],
      [x, 0.83, 0.959],
      [0.079, 0.071],
      [0.070, 0.059],
      { color: armor, bone: steering, name: "forkArmor" },
    );
    b.sweep(
      [[x, 0.64, 1.319], [x, 0.82, 1.052]],
      0.009,
      { color: C.cream, bone: steering, sides: 6, name: "forkHighlight" },
    );
    bolt([s * 0.218, 0.52, 1.42], [s, 0, 0], steering, 0.022);
  }
  box([0, 1.195, 0.415], [0.42, 0.063, 0.12], C.ink, steering, [34, 0, 0], "upperTripleClamp");
  box([0, 1.035, 0.65], [0.40, 0.067, 0.12], C.blueBlack, steering, [34, 0, 0], "lowerTripleClamp");
  rod([0, 0.99, 0.65], [0, 1.22, 0.36], 0.055, satin, steering, "steeringStem");

  // V-twin motor: chunky crankcase, separately stepped cooling fins and heads.
  cylinder([0, 0.51, -0.19], 0.201, 0.36, satin, [1, 0, 0], chassis, 12, "crankcase");
  for (const s of [-1, 1]) {
    cylinder([s * 0.204, 0.51, -0.19], 0.163, 0.056, steel, [1, 0, 0], chassis, 12, "crankCover");
    cylinder([s * 0.237, 0.51, -0.19], 0.119, 0.019, C.blueBlack, [1, 0, 0], chassis, 12, "crankCoverInset");
    ring([s * 0.251, 0.51, -0.19], 0.108, 0.008, brass);
    cylinder([s * 0.253, 0.51, -0.19], 0.055, 0.016, ivory, [1, 0, 0], chassis, 6, "crankEmblem");
    for (let i = 0; i < 5; i++) {
      const a = i * Math.PI * 2 / 5;
      bolt([s * 0.24, 0.51 + 0.139 * Math.cos(a), -0.19 + 0.139 * Math.sin(a)], [s, 0, 0], chassis, 0.011);
    }
  }

  const cylinders = [
    { base: [0, 0.60, -0.18], top: [0, 0.91, 0.105] },
    { base: [0, 0.60, -0.24], top: [0, 0.89, -0.485] },
  ];
  for (let k = 0; k < cylinders.length; k++) {
    const { base, top } = cylinders[k];
    const va = new THREE.Vector3(...base);
    const vb = new THREE.Vector3(...top);
    const axis = vb.clone().sub(va).normalize();
    const length = va.distanceTo(vb);
    rod(base, top, 0.113, C.ink, chassis, "cylinderBarrel");
    for (let j = 0; j < 7; j++) {
      const t = 0.19 + j * 0.092;
      const p = va.clone().lerp(vb, t);
      const radius = 0.128 + (j % 2) * 0.006;
      cylinder(p.toArray(), radius, 0.017, j % 2 ? steel : C.darkSteel, axis.toArray(), chassis, 10, "coolingFin");
    }
    const cap = vb.clone().addScaledVector(axis, -0.012);
    cylinder(cap.toArray(), 0.139, 0.094, steel, axis.toArray(), chassis, 8, "rockerHead");
    cylinder(vb.clone().addScaledVector(axis, 0.038).toArray(), 0.105, 0.024, C.blueBlack, axis.toArray(), chassis, 8, "rockerInset");
    for (const s of [-1, 1]) {
      const a = va.clone().add(new THREE.Vector3(s * 0.112, 0, 0));
      const z = va.clone().addScaledVector(axis, length * 0.92).add(new THREE.Vector3(s * 0.112, 0, 0));
      rod(a.toArray(), z.toArray(), 0.013, brass, chassis, "pushRod");
    }
  }

  // Air cleaner, intake throat, and the electric ignition cassette.
  cylinder([0.205, 0.76, -0.13], 0.115, 0.093, C.ink, [1, 0, 0], chassis, 12, "airCleaner");
  cylinder([0.261, 0.76, -0.13], 0.097, 0.032, armor, [1, 0, 0], chassis, 12, "airCleanerCover");
  for (let i = 0; i < 4; i++) {
    box([0.282, 0.708 + i * 0.033, -0.13], [0.008, 0.012, 0.122 - Math.abs(i - 1.5) * 0.017], C.ink, chassis, [0, 0, 0], "intakeSlot");
  }
  bolt([0.293, 0.76, -0.13], [1, 0, 0], chassis, 0.015);

  box([0, 0.58, 0.305], [0.245, 0.26, 0.105], C.ink, chassis, [-13, 0, 0], "ionIgnitionCassette");
  for (let i = 0; i < 4; i++) {
    box([0, 0.49 + i * 0.055, 0.372], [0.20, 0.021, 0.025], C.darkSteel, chassis, [-13, 0, 0], "cassetteGrille");
    glow(box([0, 0.49 + i * 0.055, 0.388], [0.142, 0.009, 0.008], C.cyan, chassis, [-13, 0, 0], "ionVent"), 1.15);
  }

  // Belt drive, deliberately on the opposite side to the exhausts.
  b.part(gearGeometry({ teeth: 36, radius: 0.194, thickness: 0.025, spokes: 6 }), steel, {
    at: [-0.209, 0.46, -0.96],
    dir: [1, 0, 0],
    bone: rearWheel,
    name: "rearDrivePulley",
  });
  b.part(gearGeometry({ teeth: 24, radius: 0.128, thickness: 0.029, holes: 6 }), satin, {
    at: [-0.233, 0.46, -0.22],
    dir: [1, 0, 0],
    bone: chassis,
    name: "frontDrivePulley",
  });

  const beltPoints: number[][] = [];
  for (let i = 0; i <= 10; i++) {
    const a = Math.PI * i / 10;
    beltPoints.push([-0.233, 0.46 + 0.193 * Math.cos(a), -0.96 - 0.193 * Math.sin(a)]);
  }
  for (let i = 0; i <= 10; i++) {
    const a = Math.PI + Math.PI * i / 10;
    beltPoints.push([-0.233, 0.46 + 0.128 * Math.cos(a), -0.22 - 0.128 * Math.sin(a)]);
  }
  const belt = catmull(beltPoints, { closed: true });
  b.sweep(belt, () => [0.024, 0.012], {
    color: C.rubber,
    section: "box",
    bone: chassis,
    name: "continuousDriveBelt",
  });
  b.along(belt, 31, at => {
    b.part(new THREE.BoxGeometry(0.046, 0.024, 0.016), C.darkSteel, {
      frame: at,
      bone: chassis,
      name: "beltTooth",
    });
  });
  box([-0.252, 0.674, -0.60], [0.07, 0.035, 0.65], C.blueBlack, chassis, [5, 0, 0], "upperBeltGuard");

  // Tank: one simple, broad, faceted teardrop volume with carefully placed graphics.
  const tank = b.loft([
    { at: [0, 1.065, -0.425], w: 0.17, h: 0.13 },
    { at: [0, 1.105, -0.245], w: 0.37, h: 0.255 },
    { at: [0, 1.15, 0.075], w: 0.47, h: 0.32 },
    { at: [0, 1.155, 0.32], w: 0.37, h: 0.275 },
    { at: [0, 1.145, 0.465], w: 0.19, h: 0.15 },
  ], {
    color: armor,
    bone: chassis,
    sides: 8,
    smooth: false,
    caps: "round",
    name: "sculptedFuelTank",
  });

  for (const s of [-1, 1]) {
    b.decal(tank, tankGraphic, {
      at: [s * 0.22, 1.145, 0.015],
      dir: [s, 0.10, 0],
      size: [0.49, 0.235],
      up: [0, 1, 0],
      lift: 0.002,
      segments: 10,
      bone: chassis,
      name: "tankSunboltGraphic",
    });
  }
  const tankSkin = b.surface(tank);
  const topStripe = tankSkin.drape([
    [0, 1.18, -0.34],
    [0, 1.28, -0.16],
    [0, 1.32, 0.07],
    [0, 1.30, 0.28],
    [0, 1.24, 0.43],
  ], { lift: 0.004 });
  b.sweep(topStripe, () => [0.032, 0.003], {
    color: C.cream,
    bone: chassis,
    section: "box",
    name: "tankCenterStripe",
  });
  const capHit = tankSkin.around([0, 1.15, 0.13]).at(0, 90);
  b.stick(new THREE.CylinderGeometry(0.055, 0.058, 0.022, 12), C.ink, capHit, {
    embed: 0.16,
    bone: chassis,
    name: "fuelCapBase",
  });
  b.stick(new THREE.CylinderGeometry(0.044, 0.044, 0.033, 10), steel, capHit, {
    embed: 0,
    bone: chassis,
    name: "fuelCap",
  });

  // Low, stepped leather saddle with an ivory seam around its rim.
  b.loft([
    { at: [0, 0.998, -0.96], w: 0.28, h: 0.075 },
    { at: [0, 0.999, -0.80], w: 0.35, h: 0.09 },
    { at: [0, 0.972, -0.60], w: 0.32, h: 0.075 },
    { at: [0, 1.005, -0.41], w: 0.15, h: 0.05 },
  ], {
    color: saddlePaint,
    bone: chassis,
    sides: 8,
    smooth: false,
    caps: "round",
    name: "soloLeatherSaddle",
  });
  for (const s of [-1, 1]) {
    b.sweep(catmull([
      [s * 0.135, 1.025, -0.95],
      [s * 0.172, 1.027, -0.81],
      [s * 0.151, 0.999, -0.62],
      [s * 0.065, 1.025, -0.40],
    ]), 0.005, { color: C.creamShadow, bone: chassis, sides: 5, name: "saddleWelt" });
  }
  for (let i = 0; i < 5; i++) {
    const z = -0.87 + i * 0.074;
    const y = i < 2 ? 1.043 - i * 0.008 : 1.022 - (i - 2) * 0.002;
    b.sweep(
      bezier([-0.12, y, z], [0, y + 0.009, z - 0.012], [0.12, y, z]),
      0.003,
      { color: C.darkSteel, bone: chassis, sides: 5, name: "saddleStitch" },
    );
  }

  // Inset side plates echo the big tank graphics.
  for (const s of [-1, 1]) {
    b.extrude([
      [-0.23, -0.075],
      [0.16, -0.06],
      [0.235, 0.075],
      [-0.18, 0.10],
    ], {
      at: [s * 0.189, 0.835, -0.57],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.035,
      bevel: 0.008,
      color: armor,
      bone: chassis,
      name: "numberPlateArmor",
    });
    label([s * 0.212, 0.844, -0.57], [0.25, 0.147], numberGraphic, [s, 0, 0]);
    bolt([s * 0.215, 0.89, -0.77], [s, 0, 0], chassis, 0.011);
    bolt([s * 0.215, 0.80, -0.42], [s, 0, 0], chassis, 0.011);
  }
  label([-0.268, 0.52, -0.19], [0.17, 0.092], technicalGraphic, [-1, 0, 0]);

  // Two sweeping headers and two short, heavy, rear-facing mufflers.
  const headers = [
    [
      [0.135, 0.89, 0.10],
      [0.29, 0.87, 0.17],
      [0.37, 0.63, 0.24],
      [0.37, 0.37, 0.06],
      [0.35, 0.365, -0.43],
    ],
    [
      [0.135, 0.86, -0.46],
      [0.31, 0.79, -0.49],
      [0.38, 0.63, -0.40],
      [0.39, 0.51, -0.49],
      [0.37, 0.51, -0.60],
    ],
  ];
  for (let k = 0; k < headers.length; k++) {
    b.sweep(catmull(headers[k]), 0.039, {
      color: steel,
      bone: chassis,
      sides: 10,
      caps: "flat",
      name: "sweptExhaustHeader",
    });
    const y = k === 0 ? 0.365 : 0.51;
    const x = k === 0 ? 0.35 : 0.37;
    const start = k === 0 ? -0.38 : -0.57;
    const end = k === 0 ? -1.18 : -1.30;
    b.rod([x, y, start], [x, y, end], [0.064, 0.077], {
      color: C.blueBlack,
      bone: chassis,
      sides: 10,
      name: "slashMuffler",
    });
    for (const z of [start - 0.08, end + 0.12]) {
      cylinder([x, y, z], 0.079, 0.035, steel, [0, 0, 1], chassis, 10, "exhaustBand");
      bolt([x + 0.079, y, z], [1, 0, 0], chassis, 0.011);
    }
    cylinder([x, y, end - 0.005], 0.068, 0.012, steel, [0, 0, 1], chassis, 10, "exhaustLip");
    cylinder([x, y, end - 0.014], 0.052, 0.009, C.ink, [0, 0, 1], chassis, 10, "exhaustBore");
    cylinder([x, y, end - 0.02], 0.031, 0.007, C.rubber, [0, 0, 1], chassis, 10, "exhaustInnerBaffle");
    box([x + 0.059, y + 0.019, (start + end) / 2], [0.026, 0.095, 0.45], armor, chassis, [0, 0, -12], "heatShield");
    label([x + 0.077, y + 0.019, (start + end) / 2], [0.33, 0.083], cautionGraphic, [1, 0, 0]);
  }

  // Forward controls and broad ribbed pegs.
  for (const s of [-1, 1]) {
    rod([s * 0.15, 0.34, 0.19], [s * 0.37, 0.34, 0.19], 0.025, steel, chassis, "pegBracket");
    cylinder([s * 0.37, 0.34, 0.19], 0.041, 0.19, C.rubber, [1, 0, 0], chassis, 8, "footPeg");
    for (let i = 0; i < 5; i++) {
      cylinder([s * (0.30 + i * 0.031), 0.34, 0.19], 0.044, 0.008, C.darkSteel, [1, 0, 0], chassis, 8, "pegRib");
    }
    rod([s * 0.28, 0.35, 0.13], [s * 0.28, 0.42, 0.36], 0.012, steel, chassis, "controlPedal");
    cylinder([s * 0.30, 0.42, 0.36], 0.023, 0.09, C.rubber);
  }

  // Retracted side stand: the tires, not a display base, support the model.
  rod([-0.18, 0.31, -0.34], [-0.28, 0.22, -0.78], 0.019, satin, chassis, "foldedSideStand");
  box([-0.28, 0.22, -0.78], [0.075, 0.022, 0.08], C.blueBlack, chassis, [0, 0, 0], "standFoot");

  // High-rise handlebars, compact controls, and visible slack cable routing.
  for (const s of [-1, 1]) {
    rod([s * 0.095, 1.22, 0.39], [s * 0.095, 1.34, 0.35], 0.028, steel, steering, "handlebarRiser");
  }
  b.sweep(polyline([
    [-0.52, 1.60, 0.28],
    [-0.35, 1.60, 0.31],
    [-0.29, 1.57, 0.34],
    [-0.22, 1.35, 0.35],
    [0.22, 1.35, 0.35],
    [0.29, 1.57, 0.34],
    [0.35, 1.60, 0.31],
    [0.52, 1.60, 0.28],
  ]), 0.024, {
    color: steel,
    bone: steering,
    sides: 8,
    name: "apeHangerHandlebar",
  });

  for (const s of [-1, 1]) {
    const gripA = [s * 0.37, 1.60, 0.305];
    const gripB = [s * 0.55, 1.60, 0.273];
    b.rod(gripA, gripB, 0.033, {
      color: C.rubber,
      bone: steering,
      sides: 10,
      name: "handleGrip",
    });
    for (let i = 0; i < 5; i++) {
      cylinder(
        [s * (0.389 + i * 0.031), 1.60, 0.301 - i * 0.0055],
        0.035,
        0.008,
        C.tread,
        [s, 0, -0.178],
        steering,
        10,
        "gripRing",
      );
    }
    cylinder([s * 0.56, 1.60, 0.271], 0.036, 0.02, brass, [1, 0, 0], steering, 8, "barEnd");
    box([s * 0.337, 1.603, 0.318], [0.062, 0.072, 0.075], C.ink, steering, [0, 0, 0], "switchHousing");
    glow(box([s * 0.338, 1.643, 0.323], [0.025, 0.012, 0.018], s === 1 ? C.red : C.cyan, steering, [0, 0, 0], "switchButton"), 0.65);
    b.sweep(catmull([
      [s * 0.326, 1.58, 0.36],
      [s * 0.40, 1.565, 0.40],
      [s * 0.51, 1.57, 0.36],
    ]), 0.011, { color: steel, bone: steering, sides: 6, name: "brakeLever" });

    rod([s * 0.325, 1.635, 0.32], [s * 0.345, 1.775, 0.34], 0.011, satin, steering, "mirrorStem");
    b.part(new THREE.BoxGeometry(0.137, 0.077, 0.033), C.ink, {
      at: [s * 0.37, 1.79, 0.34],
      rotation: [0, s * 13, s * -8],
      bone: steering,
      name: "angularMirrorHousing",
    });
    b.part(new THREE.BoxGeometry(0.111, 0.053, 0.006), steel, {
      at: [s * 0.37, 1.79, 0.319],
      rotation: [0, s * 13, s * -8],
      bone: steering,
      name: "mirrorGlass",
    });

    b.sweep(catmull([
      [s * 0.32, 1.57, 0.33],
      [s * 0.30, 1.43, 0.51],
      [s * 0.25, 1.20, 0.67],
      [s * 0.13, 1.02, 0.63],
      [s * 0.14, 0.81, 0.45],
    ]), 0.008, { color: C.rubber, bone: steering, sides: 6, name: "controlCable" });
  }

  // Instrument is tilted back toward the rider; a small blue screen is inset in it.
  const dialAt = [0, 1.34, 0.42];
  const dialNormal = [0, 0.78, -0.63];
  cylinder(dialAt, 0.079, 0.043, C.ink, dialNormal, steering, 16, "instrumentPod");
  const normal = new THREE.Vector3(...dialNormal).normalize();
  const screen = new THREE.Vector3(...dialAt).addScaledVector(normal, 0.025);
  glow(label(screen.toArray(), [0.137, 0.137], dialGraphic, dialNormal, steering, [0, 0.63, 0.78], "illuminatedTachometer"), 0.65);
  ring(screen.toArray(), 0.074, 0.006, steel, dialNormal, steering);

  // Hero headlamp: cream bezel, dark inset, and two distinctly separated light bars.
  rod([-0.13, 1.10, 0.55], [-0.11, 1.105, 0.72], 0.018, satin, steering, "lampMount");
  rod([0.13, 1.10, 0.55], [0.11, 1.105, 0.72], 0.018, satin, steering, "lampMount");
  cylinder([0, 1.105, 0.745], 0.137, 0.17, C.blueBlack, [0, 0, 1], steering, 12, "headlightBucket");
  cylinder([0, 1.105, 0.831], 0.143, 0.031, ivory, [0, 0, 1], steering, 12, "headlightBezel");
  cylinder([0, 1.105, 0.850], 0.113, 0.014, C.ink, [0, 0, 1], steering, 12, "headlightLens");
  for (const y of [1.073, 1.135]) {
    glow(box([0, y, 0.861], [0.166, 0.034, 0.012], C.cyanWhite, steering, [0, 0, 0], "headlightEmitter"), 1.6);
  }
  box([0, 1.105, 0.872], [0.191, 0.018, 0.025], C.blueBlack, steering, [0, 0, 0], "headlightBridge");
  for (const s of [-1, 1]) {
    rod([s * 0.135, 1.01, 0.65], [s * 0.255, 1.01, 0.65], 0.015, satin, steering, "indicatorStem");
    cylinder([s * 0.265, 1.01, 0.67], 0.038, 0.065, C.ink, [0, 0, 1], steering, 8, "frontIndicator");
    glow(cylinder([s * 0.265, 1.01, 0.707], 0.029, 0.013, C.orangeLight, [0, 0, 1], steering, 8, "amberIndicatorLens"), 1.1);
  }

  // Tail light and small plate bracket tucked into the bobbed fender.
  box([0, 0.735, -1.39], [0.225, 0.065, 0.069], C.ink, chassis, [-20, 0, 0], "tailLampHousing");
  glow(box([0, 0.737, -1.427], [0.17, 0.025, 0.012], C.red, chassis, [-20, 0, 0], "tailLamp"), 1.3);
  rod([-0.078, 0.71, -1.39], [-0.078, 0.61, -1.42], 0.012, satin, chassis, "plateBracket");
  rod([0.078, 0.71, -1.39], [0.078, 0.61, -1.42], 0.012, satin, chassis, "plateBracket");
  box([0, 0.606, -1.435], [0.205, 0.13, 0.018], ivory, chassis, [-12, 0, 0], "rearNumberPlate");
  label([0, 0.608, -1.447], [0.18, 0.109], numberGraphic, [0, -0.208, -0.978], chassis, [0, 0.978, -0.208], "rearRegistration");

  return b.root;
}
