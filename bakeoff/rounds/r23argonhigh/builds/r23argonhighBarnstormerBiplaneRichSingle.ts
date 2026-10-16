import * as THREE from "three";
import { glow } from "../../../../kits/glow";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { aim, DEG, offset, rng } from "../../../../src/math";
import { grain, mix, mottle, noise, paint, smoothstep } from "../../../../src/paint";
import { bezier, catmull } from "../../../../src/path";
import { svg } from "../../../../src/texture";

export const meta = {
  name: "Barnstormer Biplane",
  description:
    "Whimsical 1920s flying-circus stunt biplane with a 9-cylinder radial engine, sunburst-and-checkerboard doped linen wings, open cockpit with vintage gauges and silk aviator scarf, wheel spats, and articulated control surfaces.",
  style: "whimsical",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------------
// Palette & Surface Paints
// ---------------------------------------------------------------------------------------------------------------------

const CRIMSON = "#d62828";
const CRIMSON_DARK = "#9e1919";
const CREAM = "#fff3d6";
const CREAM_SHADE = "#ead4ad";
const GOLD = "#f5b73b";
const BRASS = "#d89e32";
const BRASS_DARK = "#9b6b19";
const COPPER = "#c86d3b";
const STEEL = "#8c96a6";
const IRON = "#353b48";
const SOOT = "#20232a";
const RUBBER = "#262830";
const WHITEWALL = "#f7eed7";
const LEATHER_LIGHT = "#8a4b24";
const CYAN_GLASS = "#7fe7f5";
const RUBY_GLOW = "#ff3333";
const EMERALD_GLOW = "#2ecc71";
const AMBER_GLOW = "#ffbe44";
const HEADLAMP_GLOW = "#ffe89e";

// Hand-crafted wood grain for the laminated propeller, dashboard, and cockpit coaming
const MAHOGANY = grain("#7d3216", "#4b1a09", { size: 0.07, axis: "z", seed: 14 });
const WALNUT_TRIM = grain("#632912", "#3b1407", { size: 0.05, axis: "x", seed: 19 });

// Warm mottled leather for seat, headrest, and straps
const LEATHER = mottle("#6e391b", "#47210c", { size: 0.08, contrast: 1.2, seed: 31 });

// Plump fuselage livery: cherry-crimson nose & turtledeck, warm doped-linen belly, gold-and-navy circus scallop stripe
const FUSELAGE_PAINT = paint((p, n) => {
  const wave = 0.045 * Math.sin(p.z * 4.2);
  const splitY = 0.96 + 0.14 * p.z + wave;
  const dy = p.y - splitY;

  // Nose metal cowl behind the lathe ring (z > 1.15)
  if (p.z > 1.15) {
    const checkerAng = Math.floor(((Math.atan2(p.x, p.y - 1.12) / Math.PI + 1) * 8) % 2);
    const checkerZ = Math.floor(((p.z - 1.15) / 0.14) % 2);
    if (p.z > 1.32 && p.z < 1.6) {
      return (checkerAng ^ checkerZ) === 0 ? CRIMSON : GOLD;
    }
    return CRIMSON;
  }

  // Gold & navy cheatline band along the flank
  if (Math.abs(dy) < 0.028) return GOLD;
  if (Math.abs(dy) < 0.042) return IRON;

  // Subtle fabric rib-stitching shade along the aft fuselage
  const rib = p.z < 0.1 ? smoothstep(0.018, 0.0, Math.abs(((p.z * 1000) % 220 + 220) % 220 - 110) / 1000) : 0;
  const cloud = noise(p, 0.35, 7);

  if (dy >= 0) {
    const base = mix(CRIMSON, CRIMSON_DARK, (1 - Math.max(0, n.y)) * 0.45 + (cloud - 0.5) * 0.18);
    return mix(base, CRIMSON_DARK, rib * 0.35);
  }
  const belly = mix(CREAM, CREAM_SHADE, (1 - Math.max(0, n.y)) * 0.4 + (cloud - 0.5) * 0.2);
  return mix(belly, CREAM_SHADE, rib * 0.4);
});

// Doped linen wing paint: crimson leading edge, radial sunburst rays on top, checkerboard tips underneath, and rib tapes
const WING_PAINT = paint((p, n) => {
  const absX = Math.abs(p.x);
  // Rib tape lines every 0.24 m along the span
  const ribDist = Math.abs((((absX + 0.06) % 0.24) - 0.12));
  const onRib = ribDist < 0.011;

  // Leading edge crimson cap (local z near front of wing)
  const localFront = p.y > 1.25 ? 0.78 - p.z : 0.54 - p.z;
  if (localFront < 0.14) {
    return onRib ? GOLD : CRIMSON;
  }

  // Wingtip gold & crimson trim band
  const tipStart = p.y > 1.25 ? 2.02 : 1.82;
  if (absX > tipStart) {
    if (absX < tipStart + 0.045) return GOLD;
    // Checkerboard on the wingtips
    const cx = Math.floor((absX - tipStart) / 0.11);
    const cz = Math.floor((p.z + 2.0) / 0.11);
    return (cx + cz) % 2 === 0 ? CRIMSON : CREAM;
  }

  // Upper surface sunburst rays fanning from wing center
  if (n.y >= 0) {
    const zOrigin = p.y > 1.25 ? 0.82 : 0.58;
    const dx = absX * 0.85;
    const dz = Math.max(0.05, zOrigin - p.z);
    const angle = Math.atan2(dx, dz); // 0 to ~PI/2
    const rayIndex = Math.floor((angle / (Math.PI / 2)) * 9);
    if (onRib) return GOLD;
    return rayIndex % 2 === 0 ? CRIMSON : CREAM;
  }

  // Underside warm cream linen with crimson rib tapes
  if (onRib) return CRIMSON;
  return mix(CREAM, CREAM_SHADE, 0.25 * noise(p, 0.3, 19));
});

// Striped carnival control surfaces (ailerons, elevators, rudder)
const CONTROL_STRIPE_PAINT = paint((p) => {
  const stripe = Math.floor((Math.abs(p.x) + Math.abs(p.y) * 0.8) / 0.095);
  return stripe % 2 === 0 ? CRIMSON : GOLD;
});

// Tail fin sunburst paint
const FIN_PAINT = paint((p) => {
  const dy = Math.max(0.02, p.y - 0.68);
  const dz = Math.max(0.02, -1.35 - p.z);
  const ang = Math.atan2(dy, dz);
  const band = Math.floor((ang / (Math.PI * 0.6)) * 7);
  return band % 2 === 0 ? CRIMSON : CREAM;
});

// Whitewall balloon tire paint for lathe wheels (s = [height along axle, angle around axle])
const MAIN_TIRE_PAINT = paint((p, _n, s) => {
  const r = Math.hypot(p.y - 0.36, p.z - 0.88);
  if (r < 0.145) return BRASS;
  if (r < 0.165) return CRIMSON;
  if (r < 0.255 && Math.abs(s[0]) > 0.065) return WHITEWALL;
  const tread = Math.floor(((s[1] + 360) % 360) / 15) % 2 === 0 && r > 0.33;
  return tread ? "#1b1d24" : RUBBER;
});

const TAIL_TIRE_PAINT = paint((p, _n, s) => {
  const r = Math.hypot(p.y - 0.14, p.z + 1.96);
  if (r < 0.065) return BRASS;
  if (r < 0.102 && Math.abs(s[0]) > 0.03) return WHITEWALL;
  return RUBBER;
});

// Streamlined wheel spat paint with golden speed-bolt
const SPAT_PAINT = paint((p) => {
  const stripeY = 0.44 + 0.06 * (p.z - 0.88);
  if (Math.abs(p.y - stripeY) < 0.026) return GOLD;
  if (Math.abs(p.y - stripeY) < 0.036) return CREAM;
  return CRIMSON;
});

// Polka-dot & fringed silk aviator scarf paint
const SCARF_PAINT = paint((_p, _n, s) => {
  if (s[0] > 0.88) return GOLD;
  const u = (s[0] * 9) % 1;
  const v = ((s[1] % 90) + 90) % 90 / 90;
  const d = Math.hypot(u - 0.5, v - 0.5);
  return d < 0.24 ? CREAM : CRIMSON;
});

// Pennant streamer paint
const PENNANT_PAINT = paint((_p, _n, s) => {
  if (s[0] < 0.18 || (s[0] > 0.45 && s[0] < 0.58)) return GOLD;
  return CRIMSON;
});

// ---------------------------------------------------------------------------------------------------------------------
// SVG Textures (Emblems, Cockpit Gauges, and Lacing Cards)
// ---------------------------------------------------------------------------------------------------------------------

function makeCircusEmblem() {
  return svg(
    `<svg viewBox="0 0 256 256">
      <circle cx="128" cy="128" r="118" fill="#1e2436" stroke="#f5b73b" stroke-width="12"/>
      <circle cx="128" cy="128" r="98" fill="#d62828" stroke="#fff3d6" stroke-width="8"/>
      <circle cx="128" cy="128" r="72" fill="#fff3d6" stroke="#1e2436" stroke-width="6"/>
      <polygon points="128,24 152,92 224,92 166,134 188,204 128,162 68,204 90,134 32,92 104,92"
        fill="#f5b73b" stroke="#1e2436" stroke-width="6" stroke-linejoin="round"/>
      <circle cx="128" cy="130" r="36" fill="#1e2436" stroke="#fff3d6" stroke-width="5"/>
      <path d="M108 110 H148 L122 156" fill="none" stroke="#fff3d6" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    { size: 512 },
  );
}

function makeGaugeDial(needleDeg: number, accentColor: string) {
  const rad = (needleDeg * Math.PI) / 180;
  const nx = 64 + Math.sin(rad) * 38;
  const ny = 64 - Math.cos(rad) * 38;
  return svg(
    `<svg viewBox="0 0 128 128">
      <circle cx="64" cy="64" r="60" fill="#1c212b" stroke="#d89e32" stroke-width="7"/>
      <circle cx="64" cy="64" r="50" fill="#fff6e0" stroke="#353b48" stroke-width="4"/>
      <path d="M 26 84 A 44 44 0 1 1 102 84" fill="none" stroke="${accentColor}" stroke-width="7" stroke-linecap="round"/>
      <line x1="64" y1="18" x2="64" y2="28" stroke="#1c212b" stroke-width="4"/>
      <line x1="18" y1="64" x2="28" y2="64" stroke="#1c212b" stroke-width="4"/>
      <line x1="110" y1="64" x2="100" y2="64" stroke="#1c212b" stroke-width="4"/>
      <line x1="32" y1="32" x2="40" y2="40" stroke="#1c212b" stroke-width="4"/>
      <line x1="96" y1="32" x2="88" y2="40" stroke="#1c212b" stroke-width="4"/>
      <line x1="64" y1="64" x2="${nx.toFixed(1)}" y2="${ny.toFixed(1)}" stroke="#d62828" stroke-width="6" stroke-linecap="round"/>
      <circle cx="64" cy="64" r="8" fill="#d89e32" stroke="#1c212b" stroke-width="3"/>
    </svg>`,
    { size: 256 },
  );
}

function makeStitchCard() {
  return svg(
    `<svg viewBox="0 0 64 64">
      <path d="M8 58 L32 10 L56 58 Z" fill="#f5b73b" stroke="#9e1919" stroke-width="6" stroke-linejoin="round"/>
      <circle cx="32" cy="24" r="7" fill="#fff3d6"/>
    </svg>`,
    { size: 128 },
  );
}

// ---------------------------------------------------------------------------------------------------------------------
// Main Builder
// ---------------------------------------------------------------------------------------------------------------------

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "barnstormerBiplane", detail: 0.75, paintSize: 2048 });
  const rand = rng(77);

  const EMBLEM_TEX = makeCircusEmblem();
  const GAUGE_A_TEX = makeGaugeDial(-42, CRIMSON);
  const GAUGE_B_TEX = makeGaugeDial(28, "#2ecc71");
  const GAUGE_C_TEX = makeGaugeDial(68, GOLD);
  const STITCH_TEX = makeStitchCard();

  // -------------------------------------------------------------------------------------------------------------------
  // 1. Skeleton Hierarchy (All moving vehicle parts have role: "hinge")
  // -------------------------------------------------------------------------------------------------------------------

  const fuselage = b.joint("fuselage", {
    at: [0, 1.02, 0.15],
    dir: [0, 0.15, 1],
    group: "fuselage",
    role: "spine",
  });

  const engineMount = b.joint("engineMount", {
    parent: fuselage,
    at: [0, 1.15, 1.52],
    dir: [0, 0.15, 1],
    group: "engine",
  });

  const propeller = b.joint("propeller", {
    parent: engineMount,
    at: [0, 1.21, 1.94],
    dir: [0, 0.15, 1],
    group: "propeller",
    role: "hinge",
  });

  const cockpit = b.joint("cockpit", {
    parent: fuselage,
    at: [0, 1.04, -0.22],
    dir: [0, 0.15, 1],
    group: "cockpit",
  });

  const controlStick = b.joint("controlStick", {
    parent: cockpit,
    at: [0, 0.85, -0.05],
    dir: [0, 1, 0.12],
    group: "cockpit",
    role: "hinge",
  });

  const throttleLever = b.joint("throttleLever", {
    parent: cockpit,
    at: [0.36, 1.08, 0.04],
    dir: [0, 1, 0.25],
    group: "cockpit",
    role: "hinge",
  });

  const cockpitDoorL = b.joint("cockpitDoorL", {
    parent: cockpit,
    at: [0.43, 1.04, -0.22],
    dir: [0, 1, 0],
    group: "cockpit",
    role: "hinge",
  });

  const cockpitDoorR = b.joint("cockpitDoorR", {
    parent: cockpit,
    at: [-0.43, 1.04, -0.22],
    dir: [0, 1, 0],
    group: "cockpit",
    role: "hinge",
  });

  const scarfChain = b.chain(
    "scarf",
    catmull([
      [0.05, 1.38, -0.46],
      [0.14, 1.42, -0.74],
      [0.06, 1.36, -1.04],
      [0.16, 1.39, -1.32],
    ]),
    {
      parent: cockpit,
      names: ["scarf1", "scarf2", "scarf3"],
      role: "tail",
      group: "cockpit",
    },
  );

  const wingCenterUpper = b.joint("wingCenterUpper", {
    parent: fuselage,
    at: [0, 1.72, 0.42],
    dir: [0, 0, 1],
    group: "wingUpper",
  });

  const wingUpperL = b.joint("wingUpperL", {
    parent: wingCenterUpper,
    at: [0.42, 1.72, 0.42],
    dir: [1, 0.04, 0],
    group: "wingUpper",
    role: "wing",
  });

  const wingUpperR = b.joint("wingUpperR", {
    parent: wingCenterUpper,
    at: [-0.42, 1.72, 0.42],
    dir: [-1, 0.04, 0],
    group: "wingUpper",
    role: "wing",
  });

  const aileronUpperL = b.joint("aileronUpperL", {
    parent: wingUpperL,
    at: [1.56, 1.74, 0.14],
    dir: [0, 0, -1],
    group: "wingUpper",
    role: "hinge",
  });

  const aileronUpperR = b.joint("aileronUpperR", {
    parent: wingUpperR,
    at: [-1.56, 1.74, 0.14],
    dir: [0, 0, -1],
    group: "wingUpper",
    role: "hinge",
  });

  const anemometer = b.joint("anemometer", {
    parent: wingUpperL,
    at: [1.46, 1.36, 0.56],
    dir: [0, 1, 0],
    group: "wingUpper",
    role: "hinge",
  });

  const wingLowerL = b.joint("wingLowerL", {
    parent: fuselage,
    at: [0.42, 0.82, 0.18],
    dir: [1, 0.04, 0],
    group: "wingLower",
    role: "wing",
  });

  const wingLowerR = b.joint("wingLowerR", {
    parent: fuselage,
    at: [-0.42, 0.82, 0.18],
    dir: [-1, 0.04, 0],
    group: "wingLower",
    role: "wing",
  });

  const aileronLowerL = b.joint("aileronLowerL", {
    parent: wingLowerL,
    at: [1.44, 0.84, -0.08],
    dir: [0, 0, -1],
    group: "wingLower",
    role: "hinge",
  });

  const aileronLowerR = b.joint("aileronLowerR", {
    parent: wingLowerR,
    at: [-1.44, 0.84, -0.08],
    dir: [0, 0, -1],
    group: "wingLower",
    role: "hinge",
  });

  const pennantL = b.chain(
    "pennantL",
    catmull([
      [1.46, 1.44, 0.08],
      [1.52, 1.42, -0.22],
      [1.47, 1.38, -0.52],
    ]),
    {
      parent: wingUpperL,
      names: ["pennantL1", "pennantL2"],
      role: "tail",
      group: "wingUpper",
    },
  );

  const pennantR = b.chain(
    "pennantR",
    catmull([
      [-1.46, 1.44, 0.08],
      [-1.52, 1.42, -0.22],
      [-1.47, 1.38, -0.52],
    ]),
    {
      parent: wingUpperR,
      names: ["pennantR1", "pennantR2"],
      role: "tail",
      group: "wingUpper",
    },
  );

  const gearLegL = b.joint("gearLegL", {
    parent: fuselage,
    at: [0.36, 0.82, 0.68],
    aim: [0.78, 0.36, 0.88],
    group: "landingGear",
    role: "hinge",
  });

  const gearLegR = b.joint("gearLegR", {
    parent: fuselage,
    at: [-0.36, 0.82, 0.68],
    aim: [-0.78, 0.36, 0.88],
    group: "landingGear",
    role: "hinge",
  });

  const wheelL = b.joint("wheelL", {
    parent: gearLegL,
    at: [0.78, 0.36, 0.88],
    dir: [1, 0, 0],
    group: "landingGear",
    role: "hinge",
  });

  const wheelR = b.joint("wheelR", {
    parent: gearLegR,
    at: [-0.78, 0.36, 0.88],
    dir: [-1, 0, 0],
    group: "landingGear",
    role: "hinge",
  });

  const tailSection = b.joint("tailSection", {
    parent: fuselage,
    at: [0, 0.72, -1.55],
    dir: [0, -0.15, -1],
    group: "tail",
  });

  const rudder = b.joint("rudder", {
    parent: tailSection,
    at: [0, 0.96, -1.88],
    dir: [0, 1, -0.08],
    group: "tail",
    role: "hinge",
  });

  const elevatorL = b.joint("elevatorL", {
    parent: tailSection,
    at: [0.42, 0.74, -1.82],
    dir: [0, 0, -1],
    group: "tail",
    role: "hinge",
  });

  const elevatorR = b.joint("elevatorR", {
    parent: tailSection,
    at: [-0.42, 0.74, -1.82],
    dir: [0, 0, -1],
    group: "tail",
    role: "hinge",
  });

  const tailGearFork = b.joint("tailGearFork", {
    parent: tailSection,
    at: [0, 0.52, -1.78],
    aim: [0, 0.14, -1.96],
    group: "landingGear",
    role: "hinge",
  });

  const tailWheel = b.joint("tailWheel", {
    parent: tailGearFork,
    at: [0, 0.14, -1.96],
    dir: [1, 0, 0],
    group: "landingGear",
    role: "hinge",
  });

  // -------------------------------------------------------------------------------------------------------------------
  // 2. Plump Fuselage, Turtledeck, Cowling & Exterior Details
  // -------------------------------------------------------------------------------------------------------------------

  const fuselageLoft = b.loft(
    [
      { at: [0, 0.64, -1.92], w: 0.16, h: 0.38 },
      { at: [0, 0.71, -1.52], w: 0.42, h: 0.54 },
      { at: [0, 0.82, -1.02], w: 0.68, h: 0.72 },
      { at: [0, 0.94, -0.48], w: 0.86, h: 0.88 },
      { at: [0, 1.02, 0.08], w: 0.92, h: 0.96 },
      { at: [0, 1.09, 0.68], w: 0.94, h: 0.98 },
      { at: [0, 1.14, 1.22], w: 0.88, h: 0.92 },
      { at: [0, 1.17, 1.56], w: 0.78, h: 0.82 },
    ],
    {
      bone: fuselage,
      color: FUSELAGE_PAINT,
      sides: 12,
      caps: { start: "round", end: "flat" },
      name: "fuselageBody",
      group: "fuselage",
    },
  );

  // Dorsal rounded turtledeck fairing behind cockpit
  b.sweep(
    catmull([
      [0, 1.38, -0.42],
      [0, 1.22, -0.92],
      [0, 1.02, -1.42],
      [0, 0.84, -1.82],
    ]),
    [0.24, 0.19, 0.12, 0.05],
    {
      bone: fuselage,
      color: CRIMSON,
      sides: 8,
      name: "turtledeck",
      group: "fuselage",
    },
  );

  // Dorsal stitch-lacing cards along the turtledeck spine
  const stitchFrames = [0, 1, 2, 3, 4, 5, 6].map((i) => {
    const z = -0.58 - i * 0.18;
    const y = 1.32 - i * 0.068 + (rand() - 0.5) * 0.004;
    return frame([0, y, z], [0, 1, 0]);
  });
  b.cards(stitchFrames, STITCH_TEX, {
    size: [0.05, 0.06],
    lean: 55,
    flow: [0, 0, -1],
    bone: fuselage,
    name: "turtledeckStitches",
    group: "fuselage",
  });

  // Circus Star No. 7 decals on both sides of the fuselage
  const fuselageSurface = b.surface(fuselageLoft);
  for (const s of [1, -1] as const) {
    b.decal(fuselageSurface, EMBLEM_TEX, {
      at: [s * 0.41, 0.92, -0.78],
      dir: [s, 0, 0],
      up: [0, 1, 0],
      size: [0.46, 0.46],
      bone: fuselage,
      mirror: s < 0,
      name: `fuselageEmblem_${s > 0 ? "L" : "R"}`,
      group: "fuselage",
    });
  }

  // Buckled leather straps wrapping the forward fuselage cowling
  for (const zStrap of [0.88, 1.26]) {
    const strapLoop = fuselageSurface.loop(frame([0, 1.12, zStrap], [0, 0, 1]), { lift: 0.008 });
    b.sweep(strapLoop, 0.016, {
      bone: fuselage,
      color: LEATHER,
      sides: 6,
      name: `cowlStrap_${zStrap > 1 ? "front" : "rear"}`,
      group: "fuselage",
    });
    // Brass buckle clasps on each side
    for (const s of [1, -1] as const) {
      b.part(new THREE.BoxGeometry(0.025, 0.065, 0.048), BRASS, {
        bone: fuselage,
        at: [s * 0.45, 1.08, zStrap],
        name: `cowlBuckle_${zStrap > 1 ? "F" : "R"}_${s > 0 ? "L" : "R"}`,
        group: "fuselage",
      });
    }
  }

  // Side brass inspection plates, rivets & boarding steps
  for (const s of [1, -1] as const) {
    const sideTag = s > 0 ? "L" : "R";
    // Circular brass inspection hatch on forward flank
    b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.02, 10), BRASS, {
      bone: fuselage,
      at: [s * 0.45, 0.98, 0.52],
      dir: [s, 0, 0],
      name: `inspectionHatch_${sideTag}`,
      group: "fuselage",
    });

    // Lower fuselage stringer rub-rail
    b.sweep(
      catmull([
        [s * 0.44, 0.86, 0.72],
        [s * 0.41, 0.81, -0.25],
        [s * 0.31, 0.74, -1.15],
        [s * 0.14, 0.66, -1.78],
      ]),
      [0.016, 0.01],
      {
        bone: fuselage,
        color: GOLD,
        sides: 6,
        name: `flankRail_${sideTag}`,
        group: "fuselage",
      },
    );
  }

  // Left-side spring boarding step stirrup & grab handle for the pilot
  b.rod([0.41, 0.78, -0.32], [0.52, 0.64, -0.32], 0.014, BRASS, {
    bone: fuselage,
    sides: 6,
    name: "boardingStepStrut",
    group: "fuselage",
  });
  b.part(new THREE.BoxGeometry(0.08, 0.02, 0.11), BRASS_DARK, {
    bone: fuselage,
    at: [0.53, 0.63, -0.32],
    name: "boardingStepPad",
    group: "fuselage",
  });
  b.capsule([0.42, 1.12, -0.45], [0.42, 1.12, -0.58], 0.014, BRASS, {
    bone: fuselage,
    sides: 6,
    name: "pilotGrabHandle",
    group: "fuselage",
  });

  // Whimsical brass stunt klaxon air-horn mounted on the right cockpit flank
  b.lathe(
    [
      [0, 0],
      [0.028, 0],
      [0.024, 0.12],
      [0.042, 0.24],
      [0.085, 0.32],
      [0.068, 0.32],
      [0.02, 0.14],
      [0, 0.14],
    ],
    {
      bone: fuselage,
      at: [-0.47, 1.16, 0.05],
      axis: [0, 0.12, 1],
      segments: 10,
      color: BRASS,
      name: "stuntKlaxonHorn",
      group: "fuselage",
    },
  );
  b.part(new THREE.SphereGeometry(0.048, 8, 6), RUBBER, {
    bone: fuselage,
    at: [-0.47, 1.15, 0.01],
    name: "klaxonBulb",
    group: "fuselage",
  });

  // -------------------------------------------------------------------------------------------------------------------
  // 3. Nose Cowling, 9-Cylinder Radial Engine, Exhaust Megaphones & Propeller
  // -------------------------------------------------------------------------------------------------------------------

  // Spun brass-and-crimson radial cowling ring
  b.lathe(
    [
      [0.26, 0],
      [0.41, 0],
      [0.44, 0.08],
      [0.43, 0.24],
      [0.37, 0.34],
      [0.27, 0.36],
      [0.24, 0.31],
      [0.33, 0.22],
      [0.34, 0.04],
      [0.26, 0.02],
    ],
    {
      bone: engineMount,
      at: [0, 1.16, 1.48],
      axis: [0, 0.15, 1],
      segments: 16,
      color: BRASS,
      name: "noseCowlRing",
      group: "engine",
    },
  );

  // Radial engine crankcase dome & gear housing
  b.lathe(
    [
      [0, 0],
      [0.25, 0],
      [0.26, 0.18],
      [0.21, 0.32],
      [0.11, 0.42],
      [0, 0.44],
    ],
    {
      bone: engineMount,
      at: [0, 1.16, 1.5],
      axis: [0, 0.15, 1],
      segments: 12,
      color: IRON,
      name: "engineCrankcase",
      group: "engine",
    },
  );

  // 9 radial engine cylinders with finned barrels, rocker boxes & copper pushrods
  const engineLine = frame([0, 1.18, 1.66], [0, 0.15, 1]);
  b.ring(engineLine, { count: 9, radius: 0.21, group: "engine" }, (cyl) => {
    const barrelTip = offset(cyl, cyl.outward, 0.19);
    const headTip = offset(cyl, cyl.outward, 0.26);
    // Finned cylinder barrel
    b.rod(cyl, barrelTip, [0.068, 0.074], IRON, {
      bone: engineMount,
      sides: 8,
      name: `cylBarrel_${cyl.i}`,
      group: "engine",
    });
    // Silver aluminum cooling fin collar
    b.rod(offset(cyl, cyl.outward, 0.06), offset(cyl, cyl.outward, 0.17), 0.082, STEEL, {
      bone: engineMount,
      sides: 8,
      name: `cylFins_${cyl.i}`,
      group: "engine",
    });
    // Cylinder head & twin rocker boxes
    b.capsule(barrelTip, headTip, 0.068, COPPER, {
      bone: engineMount,
      sides: 8,
      name: `cylHead_${cyl.i}`,
      group: "engine",
    });
    // Chrome pushrod tube from crankcase front to cylinder head
    b.rod([0, 1.19, 1.78], headTip, 0.011, BRASS, {
      bone: engineMount,
      sides: 5,
      name: `pushrod_${cyl.i}`,
      group: "engine",
    });
  });

  // Copper exhaust collector ring behind the cylinders
  const collectorRing = b.ring(frame([0, 1.16, 1.54], [0, 0.15, 1]), { count: 10, radius: 0.31 });
  b.sweep(catmull(collectorRing.items, { closed: true }), 0.032, {
    bone: engineMount,
    color: COPPER,
    sides: 6,
    name: "exhaustCollectorRing",
    group: "engine",
  });

  // Under-nose brass carburetor scoop & oil cooler drum
  b.frustumBox([0, 0.72, 1.18], [0, 0.76, 1.48], [0.22, 0.14], [0.26, 0.18], {
    bone: engineMount,
    color: BRASS,
    name: "carburetorScoop",
    group: "engine",
  });
  b.part(new THREE.CylinderGeometry(0.065, 0.065, 0.04, 8), SOOT, {
    bone: engineMount,
    at: [0, 0.75, 1.49],
    dir: [0, 0, 1],
    name: "carbIntakeMouth",
    group: "engine",
  });

  // Twin swept-back copper & soot exhaust megaphone pipes along lower nose flanks
  for (const s of [1, -1] as const) {
    const sideTag = s > 0 ? "L" : "R";
    const exhaustPath = catmull([
      [s * 0.31, 1.02, 1.52],
      [s * 0.48, 0.94, 1.24],
      [s * 0.51, 0.89, 0.78],
      [s * 0.53, 0.85, 0.28],
    ]);
    b.sweep(exhaustPath, [0.034, 0.038, 0.044, 0.064], {
      bone: fuselage,
      bands: [
        [0.82, COPPER],
        [1, SOOT],
      ],
      caps: { start: "round", end: "flat" },
      sides: 8,
      name: `exhaustPipe_${sideTag}`,
      group: "engine",
    });
    // Exhaust pipe mounting brackets to fuselage
    for (const zBrk of [1.05, 0.52]) {
      b.rod([s * 0.42, 0.91, zBrk], [s * 0.5, 0.88, zBrk], 0.012, BRASS_DARK, {
        bone: fuselage,
        sides: 5,
        name: `exhaustBracket_${sideTag}_${zBrk > 0.8 ? "F" : "R"}`,
        group: "engine",
      });
    }
  }

  // Propeller assembly on the `propeller` hinge joint
  // 1. Polished brass spinner cone
  b.lathe(
    [
      [0, 0],
      [0.14, 0],
      [0.135, 0.08],
      [0.095, 0.19],
      [0.038, 0.27],
      [0, 0.3],
    ],
    {
      bone: propeller,
      at: [0, 1.21, 1.9],
      axis: [0, 0.15, 1],
      segments: 12,
      color: BRASS,
      name: "propSpinnerCone",
      group: "propeller",
    },
  );

  // 2. Central laminated wood & brass hub barrel
  b.part(new THREE.CylinderGeometry(0.11, 0.11, 0.12, 10), BRASS_DARK, {
    bone: propeller,
    at: [0, 1.21, 1.92],
    dir: [0, 0.15, 1],
    name: "propHubBarrel",
    group: "propeller",
  });

  // 3. Wide paddle propeller blades (2 opposite blades + brass tip sheathing)
  const bladeOutline: OutlinePoint[] = [
    [0.06, -0.045, "sharp"],
    [0.32, -0.095],
    [0.64, -0.115],
    [0.86, -0.085],
    [0.92, 0.0],
    [0.85, 0.085],
    [0.58, 0.105],
    [0.28, 0.075],
    [0.06, 0.045, "sharp"],
  ];
  const tipOutline: OutlinePoint[] = [
    [0.68, -0.105, "sharp"],
    [0.86, -0.085],
    [0.925, 0.0],
    [0.85, 0.085],
    [0.68, 0.095, "sharp"],
  ];

  for (const s of [1, -1] as const) {
    const sideTag = s > 0 ? "L" : "R";
    b.extrude(bladeOutline, {
      bone: propeller,
      at: [0, 1.21, 1.94],
      x: [s * 0.96, s * 0.28, 0],
      y: [-0.28, 0.96, 0.28 * s],
      thickness: [0.036, 0.014],
      bevel: 0.006,
      smoothing: 1,
      color: MAHOGANY,
      name: `propBlade_${sideTag}`,
      group: "propeller",
    });
    // Gleaming brass leading-edge & tip sheathing
    b.extrude(tipOutline, {
      bone: propeller,
      at: [0, 1.21, 1.942],
      x: [s * 0.96, s * 0.28, 0],
      y: [-0.28, 0.96, 0.28 * s],
      thickness: 0.038,
      bevel: 0.005,
      smoothing: 1,
      color: BRASS,
      name: `propBladeTip_${sideTag}`,
      group: "propeller",
    });
  }

  // 8 brass hub bolts around the spinner flange
  b.ring(frame([0, 1.21, 1.98], [0, 0.15, 1]), { count: 8, radius: 0.085, group: "propeller" }, (bolt) => {
    b.part(new THREE.SphereGeometry(0.014, 6, 4), STEEL, {
      bone: propeller,
      at: bolt.at,
      name: `propBolt_${bolt.i}`,
      group: "propeller",
    });
  });

  // -------------------------------------------------------------------------------------------------------------------
  // 4. Open Cockpit Interior, Gauges, Controls, Aviator Goggles & Silk Scarf
  // -------------------------------------------------------------------------------------------------------------------

  // Dark recessed cockpit well floor & interior wall lining
  b.part(new THREE.CylinderGeometry(0.36, 0.34, 0.28, 12), SOOT, {
    bone: cockpit,
    at: [0, 1.18, -0.18],
    rotation: [8, 0, 0],
    name: "cockpitWell",
    group: "cockpit",
  });

  // Thick padded leather & mahogany cockpit coaming ring around the rim
  const coamingPts = b.ring(frame([0, 1.32, -0.18], [0, 1, 0.15]), { count: 12, radius: 0.38 });
  b.sweep(catmull(coamingPts.items, { closed: true }), 0.052, {
    bone: cockpit,
    color: LEATHER,
    sides: 8,
    name: "cockpitCoaming",
    group: "cockpit",
  });

  // Quilted leather pilot bucket seat
  b.part(new THREE.BoxGeometry(0.42, 0.08, 0.36), LEATHER, {
    bone: cockpit,
    at: [0, 0.94, -0.28],
    rotation: [8, 0, 0],
    name: "pilotSeatCushion",
    group: "cockpit",
  });
  b.frustumBox([0, 0.96, -0.42], [0, 1.36, -0.48], [0.42, 0.08], [0.34, 0.07], {
    bone: cockpit,
    color: LEATHER,
    name: "pilotSeatBackrest",
    group: "cockpit",
  });

  // Twin tan canvas shoulder harness straps with brass center buckle
  for (const s of [1, -1] as const) {
    b.sweep(
      catmull([
        [s * 0.11, 1.35, -0.44],
        [s * 0.12, 1.16, -0.39],
        [s * 0.06, 0.99, -0.32],
      ]),
      0.018,
      {
        bone: cockpit,
        color: CREAM_SHADE,
        sides: 6,
        name: `seatHarness_${s > 0 ? "L" : "R"}`,
        group: "cockpit",
      },
    );
  }
  b.part(new THREE.CylinderGeometry(0.032, 0.032, 0.02, 8), BRASS, {
    bone: cockpit,
    at: [0, 1.02, -0.34],
    dir: [0, 0.4, 1],
    name: "harnessCenterBuckle",
    group: "cockpit",
  });

  // Padded leather headrest & vintage brass aviator goggles perched on the headrest
  const headrest = b.part(new THREE.SphereGeometry(0.14, 10, 8), LEATHER, {
    bone: cockpit,
    at: [0, 1.42, -0.46],
    scale: [1.15, 0.95, 1.1],
    name: "cockpitHeadrest",
    group: "cockpit",
  });

  // Goggles strap around headrest
  b.sweep(
    catmull(
      [
        [0.15, 1.44, -0.42],
        [0, 1.43, -0.58],
        [-0.15, 1.44, -0.42],
        [0, 1.45, -0.33],
      ],
      { closed: true },
    ),
    0.016,
    {
      bone: cockpit,
      color: LEATHER_LIGHT,
      sides: 6,
      name: "goggleStrap",
      group: "cockpit",
    },
  );
  // Twin brass goggle barrels & cyan glass lenses on forehead of headrest
  for (const s of [1, -1] as const) {
    const sideTag = s > 0 ? "L" : "R";
    b.part(new THREE.CylinderGeometry(0.052, 0.048, 0.036, 10), BRASS, {
      bone: cockpit,
      at: [s * 0.062, 1.45, -0.34],
      dir: [s * 0.15, 0.15, 1],
      name: `goggleRim_${sideTag}`,
      group: "cockpit",
    });
    b.part(new THREE.CylinderGeometry(0.042, 0.042, 0.038, 10), CYAN_GLASS, {
      bone: cockpit,
      at: [s * 0.062, 1.45, -0.338],
      dir: [s * 0.15, 0.15, 1],
      name: `goggleLens_${sideTag}`,
      group: "cockpit",
    });
  }
  b.rod([0.025, 1.45, -0.33], [-0.025, 1.45, -0.33], 0.01, BRASS, {
    bone: cockpit,
    sides: 5,
    name: "goggleBridge",
    group: "cockpit",
  });

  // Billowing polka-dot silk aviator scarf on `scarfChain`
  b.sweep(
    scarfChain,
    (t) => [0.068 * (1 - 0.35 * t), 0.016],
    {
      color: SCARF_PAINT,
      sides: 8,
      caps: { start: "round", end: "flat" },
      name: "aviatorScarf",
      group: "cockpit",
    },
  );
  // Scarf knot at the headrest neck
  b.part(new THREE.SphereGeometry(0.055, 8, 6), CRIMSON, {
    bone: headrest.bone ?? cockpit,
    at: [0.06, 1.38, -0.45],
    scale: [1.2, 0.85, 1],
    name: "scarfKnot",
    group: "cockpit",
  });

  // Laminated mahogany instrument panel arch & 6 SVG dial gauges
  b.part(new THREE.BoxGeometry(0.62, 0.22, 0.045), MAHOGANY, {
    bone: cockpit,
    at: [0, 1.26, 0.08],
    rotation: [-12, 0, 0],
    name: "instrumentDashboard",
    group: "cockpit",
  });

  const gaugeLayout = [
    { x: -0.2, y: 1.29, r: 0.054, tex: GAUGE_A_TEX, name: "gaugeAirspeed" },
    { x: -0.07, y: 1.31, r: 0.062, tex: GAUGE_B_TEX, name: "gaugeAltimeter" },
    { x: 0.07, y: 1.31, r: 0.062, tex: GAUGE_C_TEX, name: "gaugeTachometer" },
    { x: 0.2, y: 1.29, r: 0.054, tex: GAUGE_A_TEX, name: "gaugeOilPress" },
    { x: -0.14, y: 1.19, r: 0.044, tex: GAUGE_C_TEX, name: "gaugeFuel" },
    { x: 0.14, y: 1.19, r: 0.044, tex: GAUGE_B_TEX, name: "gaugeTemp" },
  ];
  for (const g of gaugeLayout) {
    // Brass bezel ring
    b.part(new THREE.CylinderGeometry(g.r * 1.12, g.r * 1.12, 0.024, 10), BRASS, {
      bone: cockpit,
      at: [g.x, g.y, 0.058],
      dir: [0, 0.2, -1],
      name: `${g.name}Bezel`,
      group: "cockpit",
    });
    // Textured dial face facing the pilot (-Z)
    b.part(new THREE.CircleGeometry(g.r, 12), "#ffffff", {
      bone: cockpit,
      at: [g.x, g.y, 0.043],
      dir: [0, 0.2, -1],
      axis: "z",
      texture: g.tex,
      name: `${g.name}Face`,
      group: "cockpit",
    });
  }

  // Central glowing amber cockpit map lamp above dashboard
  b.part(new THREE.CylinderGeometry(0.026, 0.032, 0.04, 8), BRASS, {
    bone: cockpit,
    at: [0, 1.38, 0.06],
    dir: [0, -0.5, -1],
    name: "cockpitLampHood",
    group: "cockpit",
  });
  glow(
    b.part(new THREE.SphereGeometry(0.022, 8, 6), AMBER_GLOW, {
      bone: cockpit,
      at: [0, 1.365, 0.045],
      name: "cockpitLampBulb",
      group: "cockpit",
    }),
    1.5,
  );

  // Multi-pane brass-framed windscreen in front of cockpit
  for (const [ang, xOff, wPane] of [
    [0, 0, 0.24],
    [34, 0.19, 0.18],
    [-34, -0.19, 0.18],
  ] as const) {
    const tag = ang === 0 ? "C" : ang > 0 ? "L" : "R";
    b.part(new THREE.BoxGeometry(wPane, 0.19, 0.014), CYAN_GLASS, {
      bone: cockpit,
      at: [xOff, 1.44, 0.08 - Math.abs(xOff) * 0.35],
      rotation: [-28, ang, 0],
      name: `windscreenGlass_${tag}`,
      group: "cockpit",
    });
    b.part(new THREE.BoxGeometry(wPane + 0.024, 0.022, 0.024), BRASS, {
      bone: cockpit,
      at: [xOff, 1.52, 0.12 - Math.abs(xOff) * 0.35],
      rotation: [-28, ang, 0],
      name: `windscreenTopBar_${tag}`,
      group: "cockpit",
    });
  }

  // Articulated Control Stick (`controlStick` hinge joint)
  b.part(new THREE.ConeGeometry(0.065, 0.09, 8), LEATHER, {
    bone: controlStick,
    at: [0, 0.89, -0.05],
    name: "stickBoot",
    group: "cockpit",
  });
  b.rod([0, 0.88, -0.05], [0, 1.15, -0.02], 0.016, BRASS, {
    bone: controlStick,
    sides: 6,
    name: "stickShaft",
    group: "cockpit",
  });
  b.capsule([0, 1.14, -0.02], [0, 1.24, -0.01], 0.024, MAHOGANY, {
    bone: controlStick,
    sides: 8,
    name: "stickGrip",
    group: "cockpit",
  });
  b.part(new THREE.SphereGeometry(0.022, 6, 4), CRIMSON, {
    bone: controlStick,
    at: [0, 1.25, -0.01],
    name: "stickTriggerButton",
    group: "cockpit",
  });

  // Articulated Throttle Lever (`throttleLever` hinge joint)
  b.part(new THREE.CylinderGeometry(0.055, 0.055, 0.022, 8), BRASS, {
    bone: cockpit,
    at: [0.36, 1.08, 0.04],
    dir: [1, 0, 0],
    name: "throttleQuadrant",
    group: "cockpit",
  });
  b.rod([0.36, 1.08, 0.04], [0.35, 1.2, 0.08], 0.01, STEEL, {
    bone: throttleLever,
    sides: 5,
    name: "throttleArm",
    group: "cockpit",
  });
  b.part(new THREE.SphereGeometry(0.026, 8, 6), CRIMSON, {
    bone: throttleLever,
    at: [0.35, 1.21, 0.08],
    name: "throttleBallKnob",
    group: "cockpit",
  });

  // Hinged fold-down cockpit side doors (`cockpitDoorL`, `cockpitDoorR`)
  for (const [s, doorJoint] of [
    [1, cockpitDoorL],
    [-1, cockpitDoorR],
  ] as const) {
    const sideTag = s > 0 ? "L" : "R";
    b.part(new THREE.BoxGeometry(0.032, 0.18, 0.34), CRIMSON, {
      bone: doorJoint,
      at: [s * 0.43, 1.13, -0.2],
      name: `cockpitSideDoor_${sideTag}`,
      group: "cockpit",
    });
    b.part(new THREE.BoxGeometry(0.042, 0.035, 0.08), BRASS, {
      bone: doorJoint,
      at: [s * 0.44, 1.19, -0.2],
      name: `cockpitDoorLatch_${sideTag}`,
      group: "cockpit",
    });
  }

  // -------------------------------------------------------------------------------------------------------------------
  // 5. Upper & Lower Biplane Wings, Ailerons, Cabane Tank, Struts, Wires & Pennants
  // -------------------------------------------------------------------------------------------------------------------

  // Upper wing center cabane section (`wingCenterUpper`) with brass gravity fuel tank built in
  const centerWingOutline: OutlinePoint[] = [
    [-0.46, -0.28],
    [-0.22, -0.16],
    [0.0, -0.12],
    [0.22, -0.16],
    [0.46, -0.28],
    [0.46, 0.38],
    [-0.46, 0.38],
  ];
  b.extrude(centerWingOutline, {
    bone: wingCenterUpper,
    at: [0, 1.72, 0.42],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.11,
    bevel: 0.02,
    smoothing: 1,
    color: WING_PAINT,
    name: "upperWingCenterPanel",
    group: "wingUpper",
  });

  // Streamlined brass & copper gravity fuel tank recessed in upper wing center
  b.capsule([0, 1.75, 0.24], [0, 1.75, 0.68], [0.14, 0.16], {
    bone: wingCenterUpper,
    color: BRASS,
    sides: 10,
    name: "cabaneFuelTank",
    group: "wingUpper",
  });
  b.part(new THREE.CylinderGeometry(0.038, 0.038, 0.05, 8), COPPER, {
    bone: wingCenterUpper,
    at: [0, 1.88, 0.52],
    name: "fuelTankFillerCap",
    group: "wingUpper",
  });
  // Copper fuel line running down to fuselage
  b.rod([0.08, 1.68, 0.48], [0.16, 1.34, 0.42], 0.012, COPPER, {
    bone: wingCenterUpper,
    sides: 5,
    name: "gravityFuelPipe",
    group: "wingUpper",
  });

  // Outer Upper Wing Panels (`wingUpperL`, `wingUpperR`) + Hinged Upper Ailerons (`aileronUpperL`, `aileronUpperR`)
  const upperWingAirfoil: OutlinePoint[] = [
    [-0.36, -0.015, "sharp"],
    [-0.08, -0.042],
    [0.24, -0.038],
    [0.38, 0.0],
    [0.34, 0.058],
    [0.08, 0.072],
    [-0.2, 0.045],
  ];

  const aileronAirfoil: OutlinePoint[] = [
    [-0.18, 0.0, "sharp"],
    [0.02, -0.028],
    [0.05, 0.0],
    [0.02, 0.032],
  ];

  for (const [s, wingBone, ailBone] of [
    [1, wingUpperL, aileronUpperL],
    [-1, wingUpperR, aileronUpperR],
  ] as const) {
    const sideTag = s > 0 ? "L" : "R";

    // Main outer upper wing panel extruded outward along dihedral
    b.extrude(upperWingAirfoil, {
      bone: wingBone,
      at: [s * 0.42, 1.72, 0.42],
      x: [0, 0, 1],
      y: [-s * 0.035, 1, 0],
      thickness: 1.78,
      bevel: 0.012,
      smoothing: 1,
      color: WING_PAINT,
      name: `upperWingPanel_${sideTag}`,
      group: "wingUpper",
    });

    // Rounded wingtip cap fairing
    b.part(new THREE.SphereGeometry(0.36, 10, 8), CRIMSON, {
      bone: wingBone,
      at: [s * 2.28, 1.785, 0.43],
      scale: [0.35, 0.16, 1.02],
      name: `upperWingtipCap_${sideTag}`,
      group: "wingUpper",
    });

    // Stunt wing-walker brass handrails on top of upper wing
    for (const xRail of [0.82, 1.38]) {
      const yBase = 1.76 + (xRail - 0.42) * 0.035;
      b.sweep(
        catmull([
          [s * xRail, yBase, 0.24],
          [s * xRail, yBase + 0.11, 0.34],
          [s * xRail, yBase + 0.11, 0.54],
          [s * xRail, yBase, 0.64],
        ]),
        0.013,
        {
          bone: wingBone,
          color: BRASS,
          sides: 6,
          name: `wingWalkerGrabRail_${sideTag}_${xRail > 1 ? "outer" : "inner"}`,
          group: "wingUpper",
        },
      );
    }

    // Upper wing roundel decal on top surface
    b.part(new THREE.CircleGeometry(0.28, 14), "#ffffff", {
      bone: wingBone,
      at: [s * 1.72, 1.835, 0.44],
      dir: [-s * 0.035, 1, 0],
      up: [0, 0, 1],
      axis: "z",
      texture: EMBLEM_TEX,
      name: `upperWingRoundel_${sideTag}`,
      group: "wingUpper",
    });

    // Glowing wingtip navigation light (Ruby on port +X, Emerald on starboard -X)
    b.capsule([s * 2.34, 1.79, 0.36], [s * 2.34, 1.79, 0.54], 0.032, BRASS, {
      bone: wingBone,
      sides: 6,
      name: `navLightHousing_${sideTag}`,
      group: "wingUpper",
    });
    glow(
      b.part(new THREE.SphereGeometry(0.034, 8, 6), s > 0 ? RUBY_GLOW : EMERALD_GLOW, {
        bone: wingBone,
        at: [s * 2.36, 1.79, 0.55],
        name: `navLightBulb_${sideTag}`,
        group: "wingUpper",
      }),
      1.7,
    );

    // Hinged Upper Aileron (`aileronUpperL` / `aileronUpperR`)
    b.extrude(aileronAirfoil, {
      bone: ailBone,
      at: [s * 1.56, 1.76, 0.12],
      x: [0, 0, 1],
      y: [-s * 0.035, 1, 0],
      thickness: 0.72,
      bevel: 0.006,
      smoothing: 1,
      color: CONTROL_STRIPE_PAINT,
      name: `upperAileron_${sideTag}`,
      group: "wingUpper",
    });
    // Brass aileron actuator horn
    b.spike([s * 1.56, 1.78, 0.08], [0, 1, -0.4], 0.075, 0.018, BRASS, {
      bone: ailBone,
      sides: 5,
      name: `upperAileronHorn_${sideTag}`,
      group: "wingUpper",
    });
  }

  // Lower Wing Panels (`wingLowerL`, `wingLowerR`) + Hinged Lower Ailerons (`aileronLowerL`, `aileronLowerR`)
  const lowerWingAirfoil: OutlinePoint[] = [
    [-0.33, -0.015, "sharp"],
    [-0.06, -0.038],
    [0.22, -0.034],
    [0.35, 0.0],
    [0.31, 0.052],
    [0.06, 0.066],
    [-0.18, 0.04],
  ];

  for (const [s, wingBone, ailBone] of [
    [1, wingLowerL, aileronLowerL],
    [-1, wingLowerR, aileronLowerR],
  ] as const) {
    const sideTag = s > 0 ? "L" : "R";

    b.extrude(lowerWingAirfoil, {
      bone: wingBone,
      at: [s * 0.42, 0.82, 0.18],
      x: [0, 0, 1],
      y: [-s * 0.035, 1, 0],
      thickness: 1.56,
      bevel: 0.012,
      smoothing: 1,
      color: WING_PAINT,
      name: `lowerWingPanel_${sideTag}`,
      group: "wingLower",
    });

    // Rounded lower wingtip cap
    b.part(new THREE.SphereGeometry(0.33, 10, 8), CRIMSON, {
      bone: wingBone,
      at: [s * 2.04, 0.878, 0.19],
      scale: [0.34, 0.15, 1.0],
      name: `lowerWingtipCap_${sideTag}`,
      group: "wingLower",
    });

    // Slatted mahogany wing-walk tread pad at the wing root next to cockpit
    b.part(new THREE.BoxGeometry(0.32, 0.022, 0.48), WALNUT_TRIM, {
      bone: wingBone,
      at: [s * 0.58, 0.885, 0.16],
      name: `wingWalkPad_${sideTag}`,
      group: "wingLower",
    });

    // Brass leading-edge landing headlamp on each lower wing
    b.part(new THREE.CylinderGeometry(0.052, 0.042, 0.075, 10), BRASS, {
      bone: wingBone,
      at: [s * 1.12, 0.84, 0.54],
      dir: [0, 0, 1],
      name: `landingLampHousing_${sideTag}`,
      group: "wingLower",
    });
    glow(
      b.part(new THREE.SphereGeometry(0.044, 8, 6), HEADLAMP_GLOW, {
        bone: wingBone,
        at: [s * 1.12, 0.84, 0.57],
        scale: [1, 1, 0.5],
        name: `landingLampLens_${sideTag}`,
        group: "wingLower",
      }),
      1.8,
    );

    // Hinged Lower Aileron (`aileronLowerL` / `aileronLowerR`)
    b.extrude(aileronAirfoil, {
      bone: ailBone,
      at: [s * 1.44, 0.855, -0.08],
      x: [0, 0, 1],
      y: [-s * 0.035, 1, 0],
      thickness: 0.64,
      bevel: 0.006,
      smoothing: 1,
      color: CONTROL_STRIPE_PAINT,
      name: `lowerAileron_${sideTag}`,
      group: "wingLower",
    });

    // Vertical slave pushrod linking upper & lower ailerons
    b.rod([s * 1.5, 0.87, -0.14], [s * 1.56, 1.74, 0.04], 0.011, BRASS, {
      bone: wingBone,
      sides: 5,
      name: `aileronLinkRod_${sideTag}`,
      group: "wingLower",
    });
  }

  // Strapped leather barnstormer tool-roll bag on the right lower wing root
  b.capsule([-0.68, 0.94, 0.24], [-0.48, 0.94, 0.24], 0.058, LEATHER, {
    bone: wingLowerR,
    sides: 8,
    name: "wingRootToolRoll",
    group: "wingLower",
  });
  for (const xTool of [-0.63, -0.53]) {
    b.part(new THREE.CylinderGeometry(0.063, 0.063, 0.022, 8), BRASS, {
      bone: wingLowerR,
      at: [xTool, 0.94, 0.24],
      dir: [1, 0, 0],
      name: `toolRollStrap_${xTool < -0.58 ? "outer" : "inner"}`,
      group: "wingLower",
    });
  }

  // Cabane struts (fuselage to upper center wing) & Outer Interplane N-Struts + Cross-Rigging Wires
  for (const s of [1, -1] as const) {
    const sideTag = s > 0 ? "L" : "R";
    const upperBone = s > 0 ? wingUpperL : wingUpperR;

    // Inner Cabane Struts (front, rear, diagonal)
    b.rod([s * 0.34, 1.28, 0.62], [s * 0.38, 1.72, 0.68], [0.022, 0.02], BRASS, {
      bone: fuselage,
      sides: 6,
      name: `cabaneStrutFront_${sideTag}`,
      group: "wingUpper",
    });
    b.rod([s * 0.34, 1.32, 0.14], [s * 0.38, 1.72, 0.22], [0.022, 0.02], BRASS, {
      bone: fuselage,
      sides: 6,
      name: `cabaneStrutRear_${sideTag}`,
      group: "wingUpper",
    });
    b.rod([s * 0.34, 1.28, 0.62], [s * 0.38, 1.72, 0.22], 0.015, BRASS_DARK, {
      bone: fuselage,
      sides: 5,
      name: `cabaneStrutDiag_${sideTag}`,
      group: "wingUpper",
    });

    // Outer Interplane N-Struts at x = ±1.46
    const pLowFront: [number, number, number] = [s * 1.44, 0.86, 0.38];
    const pLowRear: [number, number, number] = [s * 1.44, 0.86, 0.02];
    const pHighFront: [number, number, number] = [s * 1.46, 1.75, 0.62];
    const pHighRear: [number, number, number] = [s * 1.46, 1.75, 0.22];

    b.rod(pLowFront, pHighFront, 0.024, CREAM, {
      bone: upperBone,
      sides: 6,
      name: `interplaneStrutFront_${sideTag}`,
      group: "wingUpper",
    });
    b.rod(pLowRear, pHighRear, 0.024, CREAM, {
      bone: upperBone,
      sides: 6,
      name: `interplaneStrutRear_${sideTag}`,
      group: "wingUpper",
    });
    b.rod(pLowRear, pHighFront, 0.02, BRASS, {
      bone: upperBone,
      sides: 6,
      name: `interplaneStrutDiag_${sideTag}`,
      group: "wingUpper",
    });

    // Brass strut cuff fittings at top & bottom of N-struts
    for (const [idx, pt] of [pLowFront, pLowRear, pHighFront, pHighRear].entries()) {
      b.part(new THREE.SphereGeometry(0.034, 6, 4), BRASS, {
        bone: upperBone,
        at: pt,
        name: `strutCuff_${sideTag}_${idx}`,
        group: "wingUpper",
      });
    }

    // Crossed steel flying & landing rigging wires between root & outer N-struts
    b.rod([s * 0.44, 0.86, 0.34], pHighFront, 0.006, STEEL, {
      bone: upperBone,
      sides: 4,
      name: `flyingWireFront_${sideTag}`,
      group: "wingUpper",
    });
    b.rod([s * 0.38, 1.71, 0.64], pLowFront, 0.006, STEEL, {
      bone: upperBone,
      sides: 4,
      name: `landingWireFront_${sideTag}`,
      group: "wingUpper",
    });
    b.rod([s * 0.44, 0.86, 0.04], pHighRear, 0.006, STEEL, {
      bone: upperBone,
      sides: 4,
      name: `flyingWireRear_${sideTag}`,
      group: "wingUpper",
    });
    b.rod([s * 0.38, 1.71, 0.22], pLowRear, 0.006, STEEL, {
      bone: upperBone,
      sides: 4,
      name: `landingWireRear_${sideTag}`,
      group: "wingUpper",
    });
  }

  // Whimsical Spinning Cup Anemometer on the left forward N-strut (`anemometer` hinge joint)
  b.rod([1.45, 1.36, 0.51], [1.46, 1.36, 0.62], 0.012, BRASS, {
    bone: wingUpperL,
    sides: 5,
    name: "anemometerBracket",
    group: "wingUpper",
  });
  b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.06, 8), BRASS, {
    bone: anemometer,
    at: [1.46, 1.38, 0.61],
    name: "anemometerHub",
    group: "wingUpper",
  });
  b.ring(frame([1.46, 1.39, 0.61], [0, 1, 0]), { count: 3, radius: 0.075, group: "wingUpper" }, (cup) => {
    b.rod([1.46, 1.39, 0.61], cup.at, 0.007, BRASS, {
      bone: anemometer,
      sides: 4,
      name: `anemometerArm_${cup.i}`,
      group: "wingUpper",
    });
    b.part(new THREE.SphereGeometry(0.026, 6, 4), COPPER, {
      bone: anemometer,
      at: cup.at,
      name: `anemometerCup_${cup.i}`,
      group: "wingUpper",
    });
  });

  // Brass Pitot tube on the right forward N-strut
  b.rod([-1.45, 1.36, 0.51], [-1.45, 1.36, 0.78], [0.014, 0.007], BRASS, {
    bone: wingUpperR,
    sides: 6,
    name: "pitotTube",
    group: "wingUpper",
  });

  // Fluttering Stunt Pennants (`pennantL`, `pennantR` chains)
  for (const [s, pChain] of [
    [1, pennantL],
    [-1, pennantR],
  ] as const) {
    b.sweep(
      pChain,
      (t) => [0.008, 0.048 * (1 - 0.85 * t) + 0.005],
      {
        color: PENNANT_PAINT,
        sides: 6,
        caps: { start: "round", end: "point" },
        name: `strutPennant_${s > 0 ? "L" : "R"}`,
        group: "wingUpper",
      },
    );
  }

  // -------------------------------------------------------------------------------------------------------------------
  // 6. Empennage / Tail Fin, Rudder & Elevators (`tailSection`, `rudder`, `elevatorL/R`)
  // -------------------------------------------------------------------------------------------------------------------

  // Fixed Vertical Stabilizer Fin
  const finOutline: OutlinePoint[] = [
    [-1.88, 0.74, "sharp"],
    [-1.22, 0.78, "sharp"],
    [-1.48, 1.02],
    [-1.72, 1.36],
    [-1.88, 1.42, "sharp"],
  ];
  b.extrude(finOutline, {
    bone: tailSection,
    at: [0, 0, 0],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: [0.075, 0.032],
    bevel: 0.012,
    smoothing: 1,
    color: FIN_PAINT,
    name: "verticalStabilizer",
    group: "tail",
  });

  // Articulated Rudder (`rudder` hinge joint)
  const rudderOutline: OutlinePoint[] = [
    [0.0, -0.34, "sharp"],
    [0.0, 0.46, "sharp"],
    [-0.18, 0.48],
    [-0.38, 0.24],
    [-0.42, -0.06],
    [-0.28, -0.32],
  ];
  b.extrude(rudderOutline, {
    bone: rudder,
    at: [0, 0.96, -1.88],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.042,
    bevel: 0.008,
    smoothing: 1,
    color: CONTROL_STRIPE_PAINT,
    name: "rudderBlade",
    group: "tail",
  });

  // Glowing white tail navigation light on trailing edge of rudder
  b.part(new THREE.CylinderGeometry(0.018, 0.022, 0.035, 8), BRASS, {
    bone: rudder,
    at: [0, 1.12, -2.26],
    dir: [0, 0, -1],
    name: "tailLightSocket",
    group: "tail",
  });
  glow(
    b.part(new THREE.SphereGeometry(0.022, 8, 6), HEADLAMP_GLOW, {
      bone: rudder,
      at: [0, 1.12, -2.28],
      name: "tailLightBulb",
      group: "tail",
    }),
    1.5,
  );

  // Horizontal Stabilizers (`tailSection`) & Articulated Elevators (`elevatorL`, `elevatorR`)
  const hStabOutline: OutlinePoint[] = [
    [0.06, -1.82, "sharp"],
    [0.82, -1.82, "sharp"],
    [0.88, -1.68],
    [0.72, -1.48],
    [0.06, -1.36, "sharp"],
  ];
  const elevatorOutline: OutlinePoint[] = [
    [-0.36, 0.0, "sharp"],
    [0.38, 0.0, "sharp"],
    [0.34, -0.24],
    [0.04, -0.31],
    [-0.32, -0.22],
  ];

  for (const [s, elevBone] of [
    [1, elevatorL],
    [-1, elevatorR],
  ] as const) {
    const sideTag = s > 0 ? "L" : "R";

    // Fixed Horizontal Stabilizer
    b.extrude(hStabOutline, {
      bone: tailSection,
      at: [0, 0.74, 0],
      x: [s, 0, 0],
      y: [0, 0, 1],
      thickness: 0.052,
      bevel: 0.01,
      smoothing: 1,
      color: WING_PAINT,
      name: `horizontalStabilizer_${sideTag}`,
      group: "tail",
    });

    // Under-stabilizer brass bracing strut to lower tailcone
    b.rod([s * 0.08, 0.56, -1.68], [s * 0.58, 0.72, -1.68], 0.014, BRASS, {
      bone: tailSection,
      sides: 5,
      name: `tailBraceStrut_${sideTag}`,
      group: "tail",
    });

    // Hinged Elevator Flap
    b.extrude(elevatorOutline, {
      bone: elevBone,
      at: [s * 0.44, 0.74, -1.82],
      x: [s, 0, 0],
      y: [0, 0, 1],
      thickness: 0.038,
      bevel: 0.007,
      smoothing: 1,
      color: CONTROL_STRIPE_PAINT,
      name: `elevatorFlap_${sideTag}`,
      group: "tail",
    });

    // Elevator control horn & cable to fuselage
    b.spike([s * 0.24, 0.76, -1.86], [0, 1, 0.2], 0.065, 0.014, BRASS, {
      bone: elevBone,
      sides: 5,
      name: `elevatorHorn_${sideTag}`,
      group: "tail",
    });
  }

  // -------------------------------------------------------------------------------------------------------------------
  // 7. Main Landing Gear, Wheel Spats, Balloon Tires & Tailwheel (Floor Contact at y = 0.000)
  // -------------------------------------------------------------------------------------------------------------------

  // Cross-axle spreader bar between the two main gear legs
  b.rod([0.66, 0.42, 0.88], [-0.66, 0.42, 0.88], 0.022, BRASS, {
    bone: fuselage,
    sides: 6,
    name: "gearAxleSpreaderBar",
    group: "landingGear",
  });

  for (const [s, legBone, wheelBone] of [
    [1, gearLegL, wheelL],
    [-1, gearLegR, wheelR],
  ] as const) {
    const sideTag = s > 0 ? "L" : "R";

    // Forward & Rear V-struts on `gearLegL/R`
    b.rod([s * 0.36, 0.82, 0.86], [s * 0.7, 0.4, 0.88], [0.032, 0.024], CRIMSON, {
      bone: legBone,
      sides: 6,
      name: `gearStrutFront_${sideTag}`,
      group: "landingGear",
    });
    b.rod([s * 0.36, 0.82, 0.44], [s * 0.7, 0.4, 0.88], [0.028, 0.022], CRIMSON, {
      bone: legBone,
      sides: 6,
      name: `gearStrutRear_${sideTag}`,
      group: "landingGear",
    });

    // Central brass oleo shock-absorber cylinder & coil spring sleeve
    b.rod([s * 0.22, 0.76, 0.72], [s * 0.68, 0.4, 0.88], 0.022, BRASS, {
      bone: legBone,
      sides: 6,
      name: `oleoStrut_${sideTag}`,
      group: "landingGear",
    });
    b.rod([s * 0.38, 0.63, 0.78], [s * 0.56, 0.49, 0.84], 0.036, GOLD, {
      bone: legBone,
      sides: 8,
      name: `oleoSpring_${sideTag}`,
      group: "landingGear",
    });

    // Streamlined teardrop wheel spat fender over the top half of the wheel (y stays >= 0.34, well above y = 0)
    b.loft(
      [
        { at: [s * 0.78, 0.42, 0.36], w: 0.08, h: 0.14 },
        { at: [s * 0.78, 0.48, 0.64], w: 0.24, h: 0.34 },
        { at: [s * 0.78, 0.53, 0.92], w: 0.32, h: 0.44 },
        { at: [s * 0.78, 0.49, 1.18], w: 0.28, h: 0.36 },
        { at: [s * 0.78, 0.42, 1.32], w: 0.14, h: 0.18 },
      ],
      {
        bone: legBone,
        color: SPAT_PAINT,
        sides: 10,
        caps: "round",
        name: `wheelSpat_${sideTag}`,
        group: "landingGear",
      },
    );

    // Main Balloon Tire (`wheelL` / `wheelR` hinge joint)
    // Center at y = 0.36, outer radius = 0.36 -> lowest vertex rests exactly on y = 0.000!
    b.lathe(
      [
        [0.0, -0.11],
        [0.16, -0.11],
        [0.24, -0.125],
        [0.33, -0.095],
        [0.36, -0.04],
        [0.36, 0.04],
        [0.33, 0.095],
        [0.24, 0.125],
        [0.16, 0.11],
        [0.0, 0.11],
      ],
      {
        bone: wheelBone,
        at: [s * 0.78, 0.36, 0.88],
        axis: [1, 0, 0],
        segments: 24,
        color: MAIN_TIRE_PAINT,
        name: `mainTire_${sideTag}`,
        group: "landingGear",
      },
    );

    // Outer knocked-off brass axle hub spinner nut
    b.spike([s * 0.89, 0.36, 0.88], [s, 0, 0], 0.055, 0.048, BRASS, {
      bone: wheelBone,
      sides: 6,
      name: `wheelKnockoffNut_${sideTag}`,
      group: "landingGear",
    });
  }

  // Tailwheel Assembly (`tailGearFork` & `tailWheel` hinge joints)
  // Coiled brass shock strut & twin fork arms
  b.rod([0, 0.64, -1.78], [0, 0.3, -1.9], [0.026, 0.02], BRASS, {
    bone: tailGearFork,
    sides: 6,
    name: "tailGearShockStrut",
    group: "landingGear",
  });
  for (const s of [1, -1] as const) {
    b. sweep(
      bezier(
        [0, 0.32, -1.89],
        [s * 0.075, 0.24, -1.93],
        [s * 0.065, 0.14, -1.96],
      ),
      0.015,
      {
        bone: tailGearFork,
        color: CRIMSON,
        sides: 6,
        name: `tailForkArm_${s > 0 ? "L" : "R"}`,
        group: "landingGear",
      },
    );
  }

  // Tailwheel Balloon Tire (`tailWheel` hinge joint)
  // Center at y = 0.14, outer radius = 0.14 -> lowest vertex rests exactly on y = 0.000!
  b.lathe(
    [
      [0.0, -0.048],
      [0.07, -0.048],
      [0.12, -0.052],
      [0.14, -0.022],
      [0.14, 0.022],
      [0.12, 0.052],
      [0.07, 0.048],
      [0.0, 0.048],
    ],
    {
      bone: tailWheel,
      at: [0, 0.14, -1.96],
      axis: [1, 0, 0],
      segments: 16,
      color: TAIL_TIRE_PAINT,
      name: "tailWheelTire",
      group: "landingGear",
    },
  );

  return b.root;
}
