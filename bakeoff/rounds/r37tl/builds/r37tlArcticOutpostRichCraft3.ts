import * as THREE from "three";
import { createBuilder, svg } from "../../../../src/index";
import { cel, INK } from "../../../../kits/toon";

export const meta = {
  name: "arctic research outpost",
  description: "A stylized Firewatch-color arctic research station with snow platform, cabin, antenna mast, solar panels, fuel drums, flags, and field equipment.",
};

export default function build() {
  const b = createBuilder({ name: "arctic-research-outpost", detail: 1 });

  const SNOW = cel("#f2f5f0", "#b9cbd2");
  const SNOW_DARK = cel("#d7e6ea", "#8da9b5");
  const ICE = cel("#a9d8df", "#6396aa");
  const WOOD = cel("#8e563d", "#4c3040");
  const WOOD_LIGHT = cel("#bd7951", "#70404b");
  const ROOF = cel("#263f59", "#16253c");
  const ROOF_LIGHT = cel("#3d6380", "#1f354d");
  const RED = cel("#d94c3d", "#7d2f3b");
  const ORANGE = cel("#f18c3e", "#a94d32");
  const YELLOW = cel("#f5c857", "#b57838");
  const METAL = cel("#718b96", "#354b5c");
  const DARK = "#182332";
  const GLASS = "#8ccbd4";
  const GREEN = cel("#5f8b78", "#345b59");
  const CABLE = "#293844";

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: any,
    rotation?: [number, number, number],
    name?: string,
  ) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      at,
      rotation,
      name,
      flat: true,
    });

  const cylinder = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: any,
    dir: [number, number, number] = [0, 1, 0],
    name?: string,
    radial = 8,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, radial), color, {
      at,
      dir,
      name,
      flat: true,
    });

  const sphere = (
    radius: number,
    at: [number, number, number],
    color: any,
    scale: [number, number, number],
    name?: string,
  ) =>
    b.part(new THREE.SphereGeometry(radius, 10, 6), color, {
      at,
      scale,
      name,
      flat: true,
    });

  const rod = (
    a: [number, number, number],
    z: [number, number, number],
    radius: number,
    color: any,
    name?: string,
  ) => b.rod(a, z, radius, { color, name, caps: "round", detail: 1 });

  const windowTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 96">
      <rect width="128" height="96" fill="#102638"/>
      <rect x="7" y="7" width="114" height="82" fill="#79c7d0" stroke="#d9f3ed" stroke-width="6"/>
      <path d="M64 8v80M8 48h112" stroke="#29455a" stroke-width="7"/>
      <path d="M12 15h45" stroke="#fff7c8" stroke-width="5" opacity=".8"/>
      <path d="M78 78h35" stroke="#f2c96d" stroke-width="5" opacity=".65"/>
    </svg>`,
    { size: 256 },
  );

  const doorTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 128">
      <rect width="64" height="128" fill="#6b3d38"/>
      <rect x="7" y="7" width="50" height="114" fill="#9b6047" stroke="#2b2531" stroke-width="5"/>
      <rect x="14" y="16" width="36" height="42" fill="#5e9fae" stroke="#253b4b" stroke-width="4"/>
      <circle cx="43" cy="76" r="4" fill="#f2c857"/>
      <path d="M12 67h40M12 94h40" stroke="#704038" stroke-width="4"/>
    </svg>`,
    { size: 256 },
  );

  const signTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 72">
      <rect x="3" y="3" width="234" height="66" rx="7" fill="#e6b94d" stroke="#2a2932" stroke-width="6"/>
      <text x="120" y="47" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="29" fill="#293342">NORTH-7</text>
    </svg>`,
    { size: 256 },
  );

  const solarTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 96">
      <rect width="128" height="96" fill="#172b44" stroke="#8db9c1" stroke-width="4"/>
      <path d="M32 0v96M64 0v96M96 0v96M0 24h128M0 48h128M0 72h128" stroke="#5d91a4" stroke-width="2"/>
      <path d="M4 8h42" stroke="#bce4df" stroke-width="4" opacity=".7"/>
    </svg>`,
    { size: 256 },
  );

  // Snowy plinth and angular drifts.
  box([4.15, 0.18, 3.2], [0, 0.09, 0], SNOW, undefined, "snowPlatform");
  box([3.72, 0.08, 2.75], [0, 0.22, 0], SNOW_DARK, undefined, "platformShadow");
  sphere(0.5, [-1.8, 0.16, -0.95], SNOW, [2.2, 0.35, 0.8], "snowdriftL");
  sphere(0.5, [1.76, 0.17, 1.02], SNOW, [2.3, 0.4, 0.75], "snowdriftR");
  sphere(0.42, [-1.3, 0.17, 1.16], SNOW_DARK, [1.5, 0.3, 0.55], "snowbank");

  // Cabin body, skirting, corner posts, and a broad dark roof.
  box([2.25, 1.35, 1.48], [0, 1.02, 0.05], WOOD, undefined, "researchCabin");
  box([2.34, 0.12, 1.56], [0, 0.36, 0.05], WOOD_LIGHT, undefined, "foundationBeam");
  for (const x of [-1.02, 1.02]) {
    box([0.13, 1.5, 0.16], [x, 1.02, 0.08], WOOD_LIGHT, undefined, "cornerPost");
    box([0.1, 1.36, 0.1], [x, 1.03, -0.67], WOOD_LIGHT, undefined, "rearPost");
  }
  // roof planes pitched in the front/back direction.
  box([1.42, 0.14, 1.78], [-0.57, 1.82, 0.05], ROOF, [0, 0, -27], "roofLeft");
  box([1.42, 0.14, 1.78], [0.57, 1.82, 0.05], ROOF_LIGHT, [0, 0, 27], "roofRight");
  box([2.48, 0.11, 0.17], [0, 1.95, 0.05], ROOF_LIGHT, undefined, "roofRidge");
  box([2.5, 0.08, 0.12], [0, 1.72, 0.79], SNOW, [0, 0, 0], "roofSnowLip");

  // Front windows and door, all deliberately oversized and graphic.
  box([0.63, 0.55, 0.025], [-0.62, 1.22, 0.805], GLASS, undefined, "frontWindowL");
  b.part(new THREE.PlaneGeometry(0.59, 0.49), "#ffffff", {
    at: [-0.62, 1.22, 0.823],
    dir: [0, 0, 1],
    axis: "z",
    texture: windowTexture,
    name: "frontWindowLGlass",
  });
  box([0.63, 0.55, 0.025], [0.62, 1.22, 0.805], GLASS, undefined, "frontWindowR");
  b.part(new THREE.PlaneGeometry(0.59, 0.49), "#ffffff", {
    at: [0.62, 1.22, 0.823],
    dir: [0, 0, 1],
    axis: "z",
    texture: windowTexture,
    name: "frontWindowRGlass",
  });
  box([0.56, 1.05, 0.035], [0, 0.91, 0.815], WOOD_LIGHT, undefined, "door");
  b.part(new THREE.PlaneGeometry(0.5, 1.0), "#ffffff", {
    at: [0, 0.91, 0.84],
    dir: [0, 0, 1],
    axis: "z",
    texture: doorTexture,
    name: "doorFace",
  });
  cylinder(0.035, 0.025, [0.2, 0.92, 0.874], YELLOW, [0, 0, 1], "doorHandle", 8);
  box([0.2, 0.09, 0.06], [0, 1.73, 0.84], YELLOW, undefined, "lintel");

  // Side window and warning placard.
  box([0.025, 0.48, 0.65], [1.14, 1.22, -0.15], GLASS, undefined, "sideWindow");
  b.part(new THREE.PlaneGeometry(0.58, 0.43), "#ffffff", {
    at: [1.158, 1.22, -0.15],
    dir: [1, 0, 0],
    axis: "z",
    texture: windowTexture,
    name: "sideWindowGlass",
  });
  b.part(new THREE.PlaneGeometry(0.72, 0.22), "#ffffff", {
    at: [0, 1.56, 0.86],
    dir: [0, 0, 1],
    axis: "z",
    texture: signTexture,
    name: "stationSign",
  });

  // Chimney with cap and a little exhaust plume.
  cylinder(0.11, 0.62, [-0.68, 2.18, -0.18], METAL, [0, 1, 0], "chimney", 8);
  cylinder(0.16, 0.07, [-0.68, 2.5, -0.18], DARK, [0, 1, 0], "chimneyCap", 8);
  sphere(0.12, [-0.68, 2.68, -0.18], SNOW_DARK, [1.2, 1.5, 1.0], "coldSmoke1");
  sphere(0.1, [-0.57, 2.82, -0.16], SNOW_DARK, [1.3, 1.4, 1.0], "coldSmoke2");

  // Elevated rear generator shed and fuel drums.
  box([0.9, 0.54, 0.72], [1.48, 0.62, -0.78], WOOD_LIGHT, undefined, "generatorShed");
  box([0.98, 0.1, 0.78], [1.48, 0.94, -0.78], ROOF, undefined, "generatorRoof");
  box([0.52, 0.38, 0.025], [1.48, 0.66, -1.155], DARK, undefined, "generatorVent");
  for (const x of [1.02, 1.36, 1.7]) {
    cylinder(0.14, 0.45, [x, 0.52, 0.74], ORANGE, [0, 1, 0], "fuelDrum", 10);
    cylinder(0.145, 0.025, [x, 0.75, 0.74], METAL, [0, 1, 0], "drumRim", 10);
    box([0.06, 0.25, 0.02], [x, 0.52, 0.888], YELLOW, undefined, "drumLabel");
  }

  // Radio mast, braces, beacon and triangular antenna.
  for (const x of [-0.2, 0.2]) rod([x, 0.22, -0.55], [x, 3.15, -0.55], 0.025, METAL, "mastLeg");
  rod([-0.2, 0.22, -0.55], [0.2, 3.15, -0.55], 0.018, METAL, "mastBrace");
  rod([0.2, 0.22, -0.55], [-0.2, 3.15, -0.55], 0.018, METAL, "mastBrace");
  for (const y of [0.75, 1.35, 1.95, 2.55]) {
    rod([-0.24, y, -0.55], [0.24, y, -0.55], 0.014, METAL, "mastCrossbar");
  }
  cylinder(0.13, 0.14, [0, 3.25, -0.55], RED, [0, 1, 0], "radioBeacon", 8);
  cylinder(0.04, 0.5, [0, 3.57, -0.55], METAL, [0, 1, 0], "mastTip", 8);
  rod([0, 2.65, -0.55], [0, 2.65, 0.22], 0.018, METAL, "antennaBoom");
  sphere(0.11, [0, 2.65, 0.28], METAL, [1, 0.45, 1], "dishHub");
  // stylized dish petals.
  b.extrude(
    [[0, 0], [0.28, 0.04], [0.2, 0.32], [0.05, 0.42], [0, 0.12]],
    { at: [0, 2.65, 0.27], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.035, color: METAL, name: "dish" },
  );

  // Solar panel rack to the left of the cabin.
  rod([-1.65, 0.25, -0.18], [-1.42, 1.17, -0.18], 0.035, METAL, "solarLeg");
  rod([-1.15, 0.25, -0.18], [-1.42, 1.17, -0.18], 0.035, METAL, "solarLeg");
  const panel = b.part(new THREE.BoxGeometry(1.2, 0.06, 0.78), ROOF, {
    at: [-1.42, 1.21, -0.18],
    rotation: [0, 0, -23],
    name: "solarPanel",
  });
  b.part(new THREE.PlaneGeometry(1.12, 0.71), "#ffffff", {
    at: [-1.42, 1.245, -0.18],
    rotation: [0, 0, -23],
    dir: [0, 1, 0],
    texture: solarTexture,
    name: "solarCells",
  });
  rod([-2.02, 0.33, -0.18], [-0.83, 0.33, -0.18], 0.025, CABLE, "solarCable");

  // Red emergency flag and two snow poles.
  rod([0.92, 0.3, 0.85], [0.92, 2.0, 0.85], 0.018, METAL, "flagPole");
  b.extrude(
    [[0, 0], [0.52, -0.04], [0.42, 0.22], [0, 0.3]],
    { at: [0.93, 1.88, 0.85], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.012, color: RED, name: "redFlag" },
  );
  for (const x of [-1.95, 1.95]) {
    rod([x, 0.25, 1.18], [x, 1.18, 1.18], 0.018, RED, "snowMarker");
    sphere(0.07, [x, 1.18, 1.18], YELLOW, [1, 0.7, 1], "markerCap");
  }

  // Field crates, ice sample box, and a tripod outside the front.
  box([0.48, 0.35, 0.42], [-1.35, 0.43, 0.55], WOOD_LIGHT, undefined, "crate");
  box([0.42, 0.08, 0.36], [-1.35, 0.64, 0.55], ROOF, undefined, "crateLid");
  for (const z of [0.38, 0.72]) rod([-1.6, 0.43, z], [-1.1, 0.43, z], 0.015, WOOD, "crateBand");
  box([0.55, 0.3, 0.45], [1.18, 0.42, 0.42], ICE, undefined, "sampleCooler");
  box([0.58, 0.06, 0.48], [1.18, 0.61, 0.42], SNOW_DARK, undefined, "coolerLid");
  cylinder(0.025, 0.4, [-0.45, 0.42, 1.08], METAL, [0, 1, 0], "tripodLeg");
  cylinder(0.025, 0.4, [-0.1, 0.42, 1.08], METAL, [0, 1, 0], "tripodLeg");
  cylinder(0.025, 0.4, [-0.28, 0.42, 0.78], METAL, [0, 1, 0], "tripodLeg");
  sphere(0.13, [-0.28, 0.78, 1.08], DARK, [1.3, 0.7, 1.3], "surveyInstrument");
  cylinder(0.055, 0.16, [-0.28, 0.91, 1.08], YELLOW, [0, 1, 0], "surveyAntenna");

  // A few graphic snow ridges around the station.
  box([1.1, 0.12, 0.22], [-1.3, 0.29, -1.3], SNOW_DARK, [0, 0, -12], "snowRidge");
  box([0.85, 0.1, 0.2], [1.48, 0.29, 1.27], SNOW_DARK, [0, 0, 15], "snowRidge");
  box([0.5, 0.08, 0.18], [0.2, 0.27, -1.34], SNOW, [0, 0, -8], "snowRidge");

  // Cable from roof radio equipment toward the mast.
  rod([0.18, 1.74, -0.48], [0.08, 2.55, -0.55], 0.009, CABLE, "radioCable");
  rod([0.08, 2.55, -0.55], [-0.52, 2.0, -0.55], 0.009, CABLE, "radioCable");

  return b.root;
}
