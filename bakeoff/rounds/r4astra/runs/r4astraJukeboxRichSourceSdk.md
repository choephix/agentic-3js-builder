```ts
import * as THREE from "three";
import {
  createBuilder,
  polyline,
  bezier,
  svg,
  rng,
} from "agentic-3js-builder";

export const meta = {
  name: "Starlite 1956 Jukebox",
  description:
    "A chrome-trimmed, three-colour illuminated diner jukebox, with a glazed record mechanism, individual song selections, and an atomic starburst speaker grille.",
};

export default function (): THREE.Object3D {
  const b = createBuilder({ name: "Starlite 1956", detail: 1 });
  const random = rng(1956);
  const root = b.joint("cabinet", { at: [0, 0, 0] });

  type V = [number, number, number];
  const C = {
    enamel: "#511c29",
    inset: "#2d1420",
    cherry: "#8a3540",
    chrome: "#c9dde0",
    silver: "#edf3ed",
    darkMetal: "#4e666d",
    brass: "#bb8b44",
    gold: "#f0c877",
    cream: "#f4e7bf",
    black: "#10181d",
    vinyl: "#151c23",
    groove: "#34424b",
    tealDark: "#153e43",
    grille: "#172c31",
    red: "#f44735",
    amber: "#ffb52d",
    teal: "#25cbbd",
    redCore: "#ffb596",
    amberCore: "#ffe6a0",
    tealCore: "#b4fff0",
    glass: "#9dd8d8",
    reflection: "#e6ffff",
    rubber: "#181d20",
  };

  for (const color of [C.chrome, C.silver, C.darkMetal]) {
    const m = b.material(color);
    m.metalness = color === C.darkMetal ? 0.72 : 0.83;
    m.roughness = color === C.silver ? 0.16 : 0.22;
  }
  for (const color of [C.gold, C.brass]) {
    b.material(color).metalness = 0.72;
    b.material(color).roughness = 0.27;
  }
  for (const color of [C.enamel, C.cherry, C.inset]) {
    b.material(color).metalness = 0.22;
    b.material(color).roughness = 0.29;
  }
  for (const color of [C.red, C.amber, C.teal]) {
    const m = b.material(color);
    m.emissive.set(color);
    m.emissiveIntensity = 0.7;
    m.roughness = 0.24;
    m.metalness = 0.12;
  }
  for (const color of [C.redCore, C.amberCore, C.tealCore]) {
    const m = b.material(color);
    m.emissive.set(color);
    m.emissiveIntensity = 0.6;
    m.roughness = 0.25;
  }
  b.material(C.vinyl).roughness = 0.26;
  b.material(C.vinyl).metalness = 0.2;
  b.material(C.groove).roughness = 0.3;
  b.material(C.groove).metalness = 0.35;

  function box(size: V, at: V, color: string, name: string) {
    return b.part(new THREE.BoxGeometry(...size), color, {
      at, bone: root, name,
    });
  }

  function rod(a: V, z: V, radius: number, color: string, name: string) {
    return b.rod(a, z, radius, {
      color, bone: root, sides: 8, smooth: false, name,
    });
  }

  function cylinder(
    at: V,
    radius: number,
    height: number,
    color: string,
    normal: V = [0, 1, 0],
    name = "turned fitting",
    segments = 24,
  ) {
    return b.part(
      new THREE.CylinderGeometry(radius, radius, height, segments),
      color,
      { at, dir: normal, bone: root, name },
    );
  }

  function torus(
    at: V,
    radius: number,
    tube: number,
    color: string,
    normal: V = [0, 0, 1],
    name = "chrome ring",
    segments = 40,
  ) {
    return b.part(
      new THREE.TorusGeometry(radius, tube, 6, segments),
      color,
      { at, dir: normal, axis: "z", bone: root, name },
    );
  }

  function screw(at: V, normal: V = [0, 0, 1], radius = 0.004) {
    cylinder(at, radius, 0.0025, C.silver, normal, "slotted screw", 8);
    const p = new THREE.Vector3(...at).addScaledVector(
      new THREE.Vector3(...normal), 0.0015,
    );
    b.part(new THREE.PlaneGeometry(radius * 1.35, radius * 0.23), C.darkMetal, {
      at: p, dir: normal, axis: "z", bone: root, name: "screw slot",
    });
  }

  function archOutline(radius: number, spring: number, bottom: number, steps = 28) {
    const p: number[][] = [[-radius, bottom]];
    for (let i = 0; i <= steps; i++) {
      const t = Math.PI - Math.PI * i / steps;
      p.push([radius * Math.cos(t), spring + radius * Math.sin(t)]);
    }
    p.push([radius, bottom]);
    return p;
  }

  function archBand(
    outer: number, inner: number, spring: number, bottom: number,
    z: number, depth: number, color: string, name: string,
  ) {
    const p = archOutline(outer, spring, bottom);
    p.push([inner, bottom]);
    for (let i = 0; i <= 28; i++) {
      const t = Math.PI * i / 28;
      p.push([inner * Math.cos(t), spring + inner * Math.sin(t)]);
    }
    p.push([-inner, bottom]);
    return b.extrude(p, {
      at: [0, 0, z], x: [1, 0, 0], y: [0, 1, 0],
      thickness: depth, bevel: 0.004, detail: 0.35,
      color, bone: root, name,
    });
  }

  function archPath(radius: number, bottom: number, z: number, spring = 1.125): V[] {
    const p: V[] = [[-radius, bottom, z]];
    for (let i = 0; i <= 32; i++) {
      const t = Math.PI - Math.PI * i / 32;
      p.push([radius * Math.cos(t), spring + radius * Math.sin(t), z]);
    }
    p.push([radius, bottom, z]);
    return p;
  }

  function textPlate(
    markup: string, width: number, height: number,
    at: V, name: string, normal: V = [0, 0, 1],
    resolution = 512,
  ) {
    return b.part(new THREE.PlaneGeometry(width, height), "#ffffff", {
      at, dir: normal, axis: "z", bone: root,
      texture: svg(markup, { size: resolution }), name,
    });
  }

  // A heavy cabinet, with a genuine open upper compartment rather than a
  // painted-on window. The deep U section forms both side walls and the crown.
  for (const x of [-0.36, 0.36]) {
    for (const z of [-0.22, 0.22]) {
      cylinder([x, 0.017, z], 0.046, 0.034, C.rubber, [0, 1, 0], "rubber foot", 12);
    }
  }

  const footOutline = [
    [-0.48, -0.342], [0.48, -0.342], [0.518, -0.304],
    [0.518, 0.298], [0.48, 0.336], [-0.48, 0.336],
    [-0.518, 0.298], [-0.518, -0.304],
  ];
  b.extrude(footOutline, {
    at: [0, 0.066, 0], x: [1, 0, 0], y: [0, 0, 1],
    thickness: 0.074, bevel: 0.011, detail: 0.35,
    color: C.darkMetal, bone: root, name: "chamfered plinth",
  });
  b.extrude(footOutline.map(([x, z]) => [x * 0.99, z * 0.99]), {
    at: [0, 0.107, 0], x: [1, 0, 0], y: [0, 0, 1],
    thickness: 0.023, bevel: 0.005, detail: 0.35,
    color: C.chrome, bone: root, name: "polished base moulding",
  });

  b.extrude(archOutline(0.492, 1.125, 0.117), {
    at: [0, 0, -0.28], x: [1, 0, 0], y: [0, 1, 0],
    thickness: 0.065, bevel: 0.008, detail: 0.35,
    color: C.enamel, bone: root, name: "arched rear cabinet",
  });
  archBand(0.492, 0.323, 1.125, 0.12, -0.026, 0.55, C.enamel, "deep crown and side walls");
  box([0.651, 0.866, 0.475], [0, 0.553, -0.005], C.enamel, "lower cabinet");
  archBand(0.482, 0.327, 1.125, 0.151, 0.263, 0.026, C.brass, "champagne lamp surround");

  // Chrome outlines repeat the cabinet arch at front and rear.
  for (const z of [0.285, -0.305]) {
    b.sweep(archPath(0.487, 0.132, z), 0.011, {
      color: C.chrome, sides: 8, bone: root, name: "continuous outer chrome arch",
    });
  }

  // Three luminous, full-height coloured horseshoes.
  const lamps = [
    { r: 0.452, color: C.red, core: C.redCore },
    { r: 0.411, color: C.amber, core: C.amberCore },
    { r: 0.370, color: C.teal, core: C.tealCore },
  ];
  lamps.forEach((lamp, i) => {
    b.sweep(archPath(lamp.r, 0.19, 0.296), 0.022, {
      color: lamp.color, sides: 10, bone: root,
      name: ["ruby light tube", "honey light tube", "seafoam light tube"][i],
    });
    b.sweep(archPath(lamp.r, 0.196, 0.318), 0.0034, {
      color: lamp.core, sides: 6, bone: root, name: "bright tube highlight",
    });
    for (const s of [-1, 1]) {
      cylinder([s * lamp.r, 0.184, 0.296], 0.026, 0.036, C.chrome, [0, 1, 0], "lamp end socket", 12);
    }
  });
  for (const r of [0.432, 0.391, 0.344]) {
    b.sweep(archPath(r, 0.175, 0.294), 0.0055, {
      color: C.silver, sides: 6, bone: root, name: "fine chrome separator",
    });
  }
  for (const s of [-1, 1]) {
    for (const y of [0.285, 0.604, 0.951, 1.124]) {
      box([0.146, 0.012, 0.025], [s * 0.412, y, 0.315], C.chrome, "lamp retaining bridge");
      screw([s * 0.346, y, 0.330], [0, 0, 1], 0.003);
      screw([s * 0.479, y, 0.330], [0, 0, 1], 0.003);
    }
  }

  // Side cheeks: inlaid panels, fluted vents, bright perimeter beading.
  for (const s of [-1, 1]) {
    box([0.008, 0.592, 0.354], [s * 0.493, 0.534, -0.033], C.inset, "side inset");
    const xx = s * 0.501;
    rod([xx, 0.233, -0.209], [xx, 0.835, -0.209], 0.005, C.chrome, "side rear beading");
    rod([xx, 0.233, 0.143], [xx, 0.835, 0.143], 0.005, C.chrome, "side front beading");
    rod([xx, 0.236, -0.209], [xx, 0.236, 0.143], 0.005, C.chrome, "side lower beading");
    rod([xx, 0.832, -0.209], [xx, 0.832, 0.143], 0.005, C.chrome, "side upper beading");
    for (let i = 0; i < 8; i++) {
      const y = 0.309 + i * 0.054;
      box([0.011, 0.023, 0.286], [s * 0.502, y, -0.033], C.black, "side ventilation recess");
      box([0.015, 0.008, 0.282], [s * 0.509, y + 0.011, -0.033], C.chrome, "side louver lip");
    }
    for (const y of [0.259, 0.808]) {
      for (const z of [-0.182, 0.115]) {
        screw([s * 0.508, y, z], [s, 0, 0]);
      }
    }
  }

  // Upper cavity, its softly lit perimeter and mechanical mounting bed.
  b.extrude(archOutline(0.316, 1.125, 0.98), {
    at: [0, 0, -0.232], x: [1, 0, 0], y: [0, 1, 0],
    thickness: 0.018, color: C.tealDark, bone: root, name: "record chamber lining",
  });
  box([0.615, 0.037, 0.447], [0, 1.001, -0.002], C.darkMetal, "mechanism floor");
  box([0.611, 0.013, 0.025], [0, 1.018, 0.224], C.gold, "chamber sill");
  for (let i = 0; i < 11; i++) {
    const a = Math.PI * (0.08 + 0.84 * i / 10);
    const x = 0.287 * Math.cos(a);
    const y = 1.125 + 0.287 * Math.sin(a);
    cylinder([x, y, -0.190], 0.014, 0.009, C.brass, [0, 0, 1], "chamber lamp socket", 12);
    b.part(new THREE.SphereGeometry(0.0095, 8, 6), C.amberCore, {
      at: [x, y, -0.181], scale: [1, 1, 0.65], bone: root, name: "warm chamber lamp",
    });
  }

  // Record magazine: eight actual annular discs, with visible separated edges.
  const stackX = -0.065;
  const stackZ = -0.020;
  cylinder([stackX, 1.034, stackZ], 0.154, 0.025, C.brass, [0, 1, 0], "magazine pedestal", 24);
  cylinder([stackX, 1.049, stackZ], 0.171, 0.012, C.darkMetal, [0, 1, 0], "record carrier", 32);

  for (let i = 0; i < 8; i++) {
    const y = 1.061 + i * 0.0118;
    const r = 0.183 + (random() - 0.5) * 0.002;
    b.lathe([
      [0.014, -0.0038], [r - 0.001, -0.0038],
      [r, -0.0018], [r, 0.0025],
      [r - 0.001, 0.0038], [0.014, 0.0038],
    ], {
      at: [stackX, y, stackZ], axis: [0, 1, 0],
      color: C.vinyl, segments: 40, bone: root, name: `magazine record ${i + 1}`,
    });
    torus([stackX, y + 0.0022, stackZ], r - 0.0008, 0.0007, C.groove, [0, 1, 0], "vinyl edge", 40);
  }
  const stackTop = 1.061 + 7 * 0.0118 + 0.0041;
  for (const r of [0.071, 0.097, 0.128, 0.154, 0.174]) {
    torus([stackX, stackTop, stackZ], r, 0.0006, C.groove, [0, 1, 0], "top record groove", 40);
  }
  cylinder([stackX, stackTop + 0.0008, stackZ], 0.055, 0.0014, C.cherry, [0, 1, 0], "magazine record label", 32);
  cylinder([stackX, 1.151, stackZ], 0.009, 0.092, C.chrome, [0, 1, 0], "magazine spindle", 12);
  cylinder([stackX, 1.196, stackZ], 0.013, 0.008, C.silver, [0, 1, 0], "spindle cap", 12);

  // One selected 45 is held above the magazine, presenting its face to the glass.
  const discCenter = new THREE.Vector3(-0.079, 1.286, -0.006);
  const discNormal = new THREE.Vector3(0, 0.15, 1).normalize();
  b.lathe([[0.012, -0.003], [0.128, -0.003], [0.128, 0.003], [0.012, 0.003]], {
    at: discCenter, axis: discNormal, segments: 48,
    color: C.vinyl, bone: root, name: "selected forty-five",
  });
  for (const r of [0.061, 0.074, 0.086, 0.098, 0.111, 0.122]) {
    const p = discCenter.clone().addScaledVector(discNormal, 0.0036);
    torus(p.toArray() as V, r, 0.00065, C.groove, discNormal.toArray() as V, "concentric vinyl groove", 48);
  }
  const recordLabel = svg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
      <circle cx="128" cy="128" r="126" fill="#f4e7bf"/>
      <circle cx="128" cy="128" r="116" fill="none" stroke="#9d3d42" stroke-width="4"/>
      <path d="M21 97H235V133H21Z" fill="#9d3d42"/>
      <text x="128" y="76" text-anchor="middle" font-family="Georgia,serif" font-weight="bold" font-size="24" fill="#26393b">STARLITE</text>
      <text x="128" y="121" text-anchor="middle" font-family="Arial,sans-serif" font-size="18" fill="#fff3cd">RECORDS</text>
      <text x="128" y="169" text-anchor="middle" font-family="Arial,sans-serif" font-weight="bold" font-size="17" fill="#26393b">MIDNIGHT SWING</text>
      <text x="128" y="191" text-anchor="middle" font-family="Arial,sans-serif" font-size="13" fill="#26393b">THE STARLIGHTERS</text>
      <text x="128" y="220" text-anchor="middle" font-family="Georgia,serif" font-size="22" fill="#9d3d42">45 RPM</text>
      <circle cx="128" cy="143" r="7" fill="#18272c"/>
    </svg>
  `, { size: 256 });
  b.part(new THREE.CircleGeometry(0.045, 40), "#ffffff", {
    at: discCenter.clone().addScaledVector(discNormal, 0.0043),
    dir: discNormal, axis: "z", texture: recordLabel,
    bone: root, name: "printed forty-five label",
  });
  cylinder(
    discCenter.clone().addScaledVector(discNormal, 0.005).toArray() as V,
    0.009, 0.008, C.chrome, discNormal.toArray() as V, "record centre adapter", 16,
  );

  // Articulated pick-up mechanism, with a substantial pivot and a little gripping fork.
  cylinder([0.188, 1.05, 0.064], 0.04, 0.042, C.brass, [0, 1, 0], "selector turntable", 16);
  cylinder([0.188, 1.141, 0.064], 0.018, 0.167, C.chrome, [0, 1, 0], "selector upright", 12);
  box([0.052, 0.071, 0.047], [0.188, 1.20, 0.064], C.darkMetal, "selector motor housing");
  b.frustumBox([0.188, 1.208, 0.080], [0.143, 1.332, 0.080], [0.028, 0.022], [0.021, 0.019], {
    up: [0, 0, 1], color: C.chrome, bone: root, name: "pickup lower arm",
  });
  b.frustumBox([0.143, 1.332, 0.080], [0.006, 1.390, 0.080], [0.023, 0.019], [0.017, 0.016], {
    up: [0, 0, 1], color: C.gold, bone: root, name: "pickup upper arm",
  });
  for (const p of [[0.188, 1.213, 0.096], [0.143, 1.332, 0.096], [0.006, 1.390, 0.092]] as V[]) {
    cylinder(p, 0.018, 0.012, C.chrome, [0, 0, 1], "arm pivot", 12);
    screw([p[0], p[1], p[2] + 0.007], [0, 0, 1], 0.006);
  }
  rod([0.006, 1.390, 0.08], [-0.006, 1.381, 0.026], 0.009, C.chrome, "gripper neck");
  for (const z of [0.012, 0.035]) {
    rod([-0.006, 1.384, z], [-0.009, 1.371, z], 0.0045, C.silver, "record gripping fork");
    box([0.013, 0.007, 0.006], [-0.009, 1.37, z], C.rubber, "gripper rubber pad");
  }
  b.sweep(bezier(
    [0.197, 1.069, 0.026], [0.265, 1.154, -0.018],
    [0.24, 1.267, 0.026], [0.157, 1.325, 0.058],
  ), 0.0035, {
    color: C.black, sides: 6, bone: root, name: "selector cable",
  });

  // Window gasket and its polished, arch-shaped bezel.
  const windowEdge = archPath(0.321, 0.984, 0.298);
  windowEdge.push([-0.321, 0.984, 0.298]);
  b.sweep(polyline(windowEdge, { closed: true }), 0.014, {
    color: C.black, sides: 8, bone: root, name: "window rubber gasket",
  });
  const chromeEdge = archPath(0.321, 0.985, 0.309);
  chromeEdge.push([-0.321, 0.985, 0.309]);
  b.sweep(polyline(chromeEdge, { closed: true }), 0.0075, {
    color: C.chrome, sides: 8, bone: root, name: "domed window bezel",
  });

  // A shallow convex glass sheet. Its arched upper boundary is real geometry.
  const gv: number[] = [];
  const gi: number[] = [];
  const cols = 28, rows = 12;
  for (let j = 0; j <= rows; j++) {
    const v = j / rows;
    for (let i = 0; i <= cols; i++) {
      const x = -0.313 + 0.626 * i / cols;
      const roof = 1.125 + Math.sqrt(Math.max(0, 0.313 ** 2 - x * x));
      const y = 0.994 + (roof - 0.994) * v;
      const z = 0.297 + 0.022 * (1 - (x / 0.313) ** 2) * Math.sin(Math.PI * v);
      gv.push(x, y, z);
    }
  }
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const a = j * (cols + 1) + i;
      gi.push(a, a + 1, a + cols + 2, a, a + cols + 2, a + cols + 1);
    }
  }
  const glassGeometry = new THREE.BufferGeometry();
  glassGeometry.setAttribute("position", new THREE.Float32BufferAttribute(gv, 3));
  glassGeometry.setIndex(gi);
  glassGeometry.computeVertexNormals();
  const glassMaterial = b.material(C.glass);
  glassMaterial.transparent = true;
  glassMaterial.opacity = 0.12;
  glassMaterial.roughness = 0.1;
  glassMaterial.metalness = 0.12;
  glassMaterial.depthWrite = false;
  glassMaterial.side = THREE.DoubleSide;
  const glass = b.part(glassGeometry, C.glass, {
    at: [0, 0, 0], bone: root, name: "convex domed glazing",
  });
  const reflectionMaterial = b.material(C.reflection);
  reflectionMaterial.transparent = true;
  reflectionMaterial.opacity = 0.34;
  reflectionMaterial.depthWrite = false;
  reflectionMaterial.roughness = 0.18;
  const glassSkin = b.surface(glass);
  for (const [points, radius] of [
    [[[-0.269, 1.157, 0.34], [-0.266, 1.286, 0.34], [-0.175, 1.365, 0.34]], 0.0038],
    [[[-0.25, 1.166, 0.34], [-0.249, 1.222, 0.34], [-0.225, 1.265, 0.34]], 0.0018],
  ] as [V[], number][]) {
    const curve = bezier(points[0], points[1], points[2]);
    b.sweep(glassSkin.drape(curve, { lift: 0.0016 }), radius, {
      color: C.reflection, sides: 6, bone: root, name: "glass reflection",
    });
  }

  // The maker's winged nameplate bridges the crown.
  b.extrude([
    [-0.151, 0], [-0.117, -0.023], [-0.092, -0.029],
    [0.092, -0.029], [0.117, -0.023], [0.151, 0],
    [0.115, 0.025], [-0.115, 0.025],
  ], {
    at: [0, 1.487, 0.342], x: [1, 0, 0], y: [0, 1, 0],
    thickness: 0.018, bevel: 0.004, detail: 0.35,
    color: C.chrome, bone: root, name: "winged crown badge",
  });
  textPlate(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 120">
      <rect x="0" y="0" width="600" height="120" rx="25" fill="#511c29"/>
      <path d="M42 12L48 45L73 58L48 67L42 106L35 68L13 58L35 47Z" fill="#f0c877"/>
      <text x="326" y="86" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-weight="bold" font-size="79" letter-spacing="3" fill="#f4e7bf">Starlite</text>
    </svg>
  `, 0.226, 0.043, [0, 1.487, 0.353], "Starlite crown lettering");
  for (const s of [-1, 1]) {
    screw([s * 0.132, 1.487, 0.354], [0, 0, 1], 0.003);
  }

  // Selection console: a machined surround, paper title inserts, and fifteen
  // separate rounded chrome pushbuttons.
  b.extrude([
    [-0.325, -0.13], [0.325, -0.13], [0.337, -0.111],
    [0.337, 0.11], [0.319, 0.131], [-0.319, 0.131],
    [-0.337, 0.11], [-0.337, -0.111],
  ], {
    at: [0, 0.834, 0.32], x: [1, 0, 0], y: [0, 1, 0],
    thickness: 0.062, bevel: 0.012, detail: 0.35,
    color: C.chrome, bone: root, name: "selection console surround",
  });
  box([0.622, 0.238, 0.01], [0, 0.833, 0.351], C.inset, "selection console enamel");
  for (const y of [0.708, 0.923, 0.962]) {
    rod([-0.314, y, 0.363], [0.314, y, 0.363], 0.004, C.silver, "console bright rail");
  }

  const songs = [
    ["MIDNIGHT SWING", "The Starlighters"],
    ["BLUE MOON", "The Velvet Trio"],
    ["SODA POP HOP", "Johnny & the Jets"],
    ["ONLY YOU", "The Serenaders"],
    ["ROUTE 66", "The Road Kings"],
    ["DREAM A LITTLE", "June Miller"],
    ["SHAKE, RATTLE!", "The House Band"],
    ["EARTH ANGEL", "The Moonbeams"],
    ["CHERRY SODA", "Betty & the Belles"],
    ["SUMMERTIME", "Ella Ray"],
    ["SATURDAY NIGHT", "The Comets"],
    ["SWEET SIXTEEN", "Bobby James"],
    ["IN THE MOOD", "The Starlite Band"],
    ["LOVE ME TRUE", "The Blue Notes"],
    ["LAST DANCE", "The Velvet Trio"],
  ];
  let titleMarkup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 300">`;
  songs.forEach(([title, artist], i) => {
    const x = (i % 5) * 200;
    const y = Math.floor(i / 5) * 100;
    const number = `${String.fromCharCode(65 + Math.floor(i / 5))}${i % 5 + 1}`;
    titleMarkup += `
      <g transform="translate(${x} ${y})">
        <rect width="200" height="100" fill="#f4e7bf"/>
        <rect x="5" y="5" width="190" height="90" fill="none" stroke="#bb8b44" stroke-width="2"/>
        <path d="M12 60H188" stroke="#b78a63" stroke-width="1"/>
        <text x="13" y="24" font-family="Arial,sans-serif" font-size="17" font-weight="bold" fill="#943c41">${number}</text>
        <text x="103" y="49" text-anchor="middle" font-family="Arial,sans-serif" font-weight="bold" font-size="17" fill="#20353a">${title}</text>
        <text x="100" y="81" text-anchor="middle" font-family="Georgia,serif" font-size="15" fill="#4e5145">${artist}</text>
      </g>`;
  });
  titleMarkup += "</svg>";
  const titles = svg(titleMarkup, { size: 1024 });

  for (let row = 0; row < 3; row++) {
    const y = 0.884 - row * 0.07;
    if (row < 2) {
      rod([-0.306, y - 0.047, 0.364], [0.306, y - 0.047, 0.364], 0.0024, C.brass, "row divider");
    }
    for (let col = 0; col < 5; col++) {
      const x = (col - 2) * 0.119;
      box([0.112, 0.035, 0.009], [x, y + 0.009, 0.362], C.brass, "title card bezel");
      const geometry = new THREE.PlaneGeometry(0.105, 0.029);
      const uv = geometry.getAttribute("uv") as THREE.BufferAttribute;
      for (let k = 0; k < uv.count; k++) {
        uv.setXY(k, (col + uv.getX(k)) / 5, (2 - row + uv.getY(k)) / 3);
      }
      b.part(geometry, "#ffffff", {
        at: [x, y + 0.009, 0.367], texture: titles, bone: root,
        name: `title card ${String.fromCharCode(65 + row)}${col + 1}`,
      });
      box([0.079, 0.022, 0.008], [x, y - 0.022, 0.363], C.black, "button recess");
      b.extrude([
        [-0.031, -0.008], [0.031, -0.008], [0.037, -0.003],
        [0.037, 0.003], [0.031, 0.008], [-0.031, 0.008],
        [-0.037, 0.003], [-0.037, -0.003],
      ], {
        at: [x, y - 0.022, 0.373], x: [1, 0, 0], y: [0, 1, 0],
        thickness: 0.015, bevel: 0.003, detail: 0.35,
        color: C.chrome, bone: root,
        name: `selection button ${String.fromCharCode(65 + row)}${col + 1}`,
      });
      box([0.027, 0.0016, 0.0007], [x, y - 0.021, 0.381], C.silver, "button glint");
    }
  }

  textPlate(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 80">
      <text x="380" y="34" text-anchor="middle" font-family="Arial,sans-serif" font-size="28" font-weight="bold" letter-spacing="7" fill="#f4e7bf">HIGH FIDELITY</text>
      <text x="380" y="66" text-anchor="middle" font-family="Arial,sans-serif" font-size="19" letter-spacing="3" fill="#f0c877">SELECT YOUR FAVOURITE</text>
    </svg>
  `, 0.361, 0.031, [-0.083, 0.943, 0.363], "console instructions");

  // Coin slide, worn bright at its edges; the inset remains visibly dark.
  box([0.099, 0.040, 0.014], [0.247, 0.943, 0.367], C.chrome, "coin acceptor escutcheon");
  box([0.061, 0.008, 0.003], [0.247, 0.949, 0.376], C.black, "coin slot");
  rod([0.217, 0.9437, 0.378], [0.277, 0.9437, 0.378], 0.0014, C.silver, "coin slide lower lip");
  textPlate(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 55">
      <text x="200" y="43" text-anchor="middle" font-family="Arial,sans-serif" font-weight="bold" font-size="39" fill="#20353a">25¢ · 3 PLAYS</text>
    </svg>
  `, 0.077, 0.010, [0.247, 0.931, 0.375], "coin price engraving", [0, 0, 1], 256);
  screw([0.203, 0.944, 0.377], [0, 0, 1], 0.0025);
  screw([0.291, 0.944, 0.377], [0, 0, 1], 0.0025);

  // The lower speaker grille is a layered object: dark acoustic mesh beneath
  // raised, tapered metal rays, all inside a shield-like chrome moulding.
  const speakerOutline = [
    [-0.282, -0.24], [0.282, -0.24], [0.317, -0.205],
    [0.317, 0.188], [0.282, 0.231], [-0.282, 0.231],
    [-0.317, 0.188], [-0.317, -0.205],
  ];
  b.extrude(speakerOutline, {
    at: [0, 0.443, 0.283], x: [1, 0, 0], y: [0, 1, 0],
    thickness: 0.056, bevel: 0.014, detail: 0.35,
    color: C.chrome, bone: root, name: "speaker shield frame",
  });
  b.extrude(speakerOutline.map(([x, y]) => [x * 0.946, y * 0.935]), {
    at: [0, 0.443, 0.313], x: [1, 0, 0], y: [0, 1, 0],
    thickness: 0.011, color: C.grille, bone: root, name: "speaker inset",
  });

  const grilleTexture = svg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 440">
      <defs>
        <pattern id="weave" width="12" height="12" patternUnits="userSpaceOnUse">
          <rect width="12" height="12" fill="#253b3c"/>
          <path d="M0 0L12 12M-6 6L6 18M6 -6L18 6" stroke="#7a7556" stroke-width="1.15"/>
          <path d="M12 0L0 12M6 -6L-6 6M18 6L6 18" stroke="#495955" stroke-width="1"/>
          <circle cx="6" cy="6" r="2.6" fill="#0c1a20"/>
          <circle cx="0" cy="0" r="2.5" fill="#0c1a20"/>
        </pattern>
      </defs>
      <rect width="600" height="440" fill="url(#weave)"/>
    </svg>
  `, { size: 1024 });
  b.part(new THREE.PlaneGeometry(0.583, 0.422), "#ffffff", {
    at: [0, 0.439, 0.320], texture: grilleTexture, bone: root, name: "woven acoustic grille",
  });

  const rayCenter = new THREE.Vector3(0, 0.442, 0.342);
  for (let i = 0; i < 24; i++) {
    const a = Math.PI * 2 * i / 24;
    const end = new THREE.Vector3(0.286 * Math.cos(a), 0.204 * Math.sin(a), 0);
    const direction = end.clone().normalize();
    const side = new THREE.Vector3(-direction.y, direction.x, 0);
    const reach = end.length() * (i % 2 === 0 ? 1 : 0.91);
    const base = rayCenter.clone().addScaledVector(direction, 0.041);
    const shoulder = rayCenter.clone().addScaledVector(direction, 0.081);
    const tip = rayCenter.clone().addScaledVector(direction, reach);
    const width = i % 2 === 0 ? 0.010 : 0.0055;
    b.slab([
      base.clone().addScaledVector(side, -width * 0.40),
      shoulder.clone().addScaledVector(side, -width),
      tip,
      shoulder.clone().addScaledVector(side, width),
      base.clone().addScaledVector(side, width * 0.40),
    ], {
      thickness: i % 2 === 0 ? 0.012 : 0.007,
      color: i % 2 === 0 ? C.chrome : C.gold,
      bone: root, name: "atomic starburst grille ray",
    });
  }
  cylinder([0, 0.442, 0.345], 0.057, 0.022, C.chrome, [0, 0, 1], "speaker medallion", 32);
  cylinder([0, 0.442, 0.359], 0.045, 0.009, C.enamel, [0, 0, 1], "speaker enamel centre", 32);
  torus([0, 0.442, 0.366], 0.045, 0.003, C.gold, [0, 0, 1], "medallion gold rim", 32);
  b.slab([
    [0, 0.477, 0.368], [0.006, 0.449, 0.368],
    [0.027, 0.442, 0.368], [0.006, 0.436, 0.368],
    [0, 0.407, 0.368], [-0.006, 0.436, 0.368],
    [-0.027, 0.442, 0.368], [-0.006, 0.449, 0.368],
  ], {
    thickness: 0.003, color: C.cream, bone: root, name: "four pointed speaker star",
  });
  for (const x of [-0.292, 0.292]) {
    for (const y of [0.234, 0.635]) screw([x, y, 0.322], [0, 0, 1], 0.0036);
  }

  // Small coin-return cup and the bottom kick rail.
  box([0.095, 0.029, 0.026], [0.245, 0.167, 0.293], C.chrome, "coin return cup");
  box([0.072, 0.014, 0.002], [0.245, 0.17, 0.307], C.black, "coin return opening");
  rod([0.202, 0.153, 0.316], [0.288, 0.153, 0.316], 0.004, C.silver, "coin return lip");
  rod([-0.459, 0.134, 0.313], [0.459, 0.134, 0.313], 0.014, C.chrome, "lower kick rail");
  textPlate(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 70">
      <text x="260" y="51" text-anchor="middle" font-family="Arial,sans-serif" font-size="35" letter-spacing="9" fill="#f4e7bf">STEREOPHONIC</text>
    </svg>
  `, 0.289, 0.022, [0, 0.17, 0.302], "stereophonic footer");

  // The back is finished too: removable service panel, vents, plate and screws.
  box([0.706, 0.711, 0.014], [0, 0.587, -0.318], C.inset, "rear service door");
  for (const x of [-0.355, 0.355]) {
    rod([x, 0.23, -0.328], [x, 0.944, -0.328], 0.004, C.brass, "service panel edge");
  }
  rod([-0.354, 0.23, -0.328], [0.354, 0.23, -0.328], 0.004, C.brass, "service panel bottom edge");
  rod([-0.354, 0.944, -0.328], [0.354, 0.944, -0.328], 0.004, C.brass, "service panel top edge");
  for (let i = 0; i < 9; i++) {
    const y = 0.625 + i * 0.028;
    box([0.504, 0.012, 0.005], [0, y, -0.328], C.black, "rear ventilation slot");
    box([0.506, 0.003, 0.007], [0, y + 0.007, -0.33], C.darkMetal, "rear vent lip");
  }
  box([0.225, 0.094, 0.005], [0, 0.399, -0.33], C.darkMetal, "manufacturer plate");
  textPlate(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 240">
      <rect width="640" height="240" fill="#c9dde0"/>
      <rect x="10" y="10" width="620" height="220" fill="none" stroke="#26393b" stroke-width="3"/>
      <text x="320" y="68" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-size="48" fill="#26393b">Starlite Music Co.</text>
      <text x="320" y="111" text-anchor="middle" font-family="Arial,sans-serif" font-size="27" fill="#26393b">MODEL 56 • HIGH FIDELITY</text>
      <text x="320" y="152" text-anchor="middle" font-family="Arial,sans-serif" font-size="24" fill="#26393b">SERIAL No. 1956–0045</text>
      <text x="320" y="195" text-anchor="middle" font-family="Arial,sans-serif" font-size="22" fill="#26393b">115 VOLTS AC · 60 CYCLES</text>
    </svg>
  `, 0.21, 0.078, [0, 0.399, -0.333], "rear identification plate", [0, 0, -1]);
  for (const x of [-0.328, 0.328]) {
    for (const y of [0.259, 0.912]) screw([x, y, -0.329], [0, 0, -1], 0.0045);
  }
  cylinder([0.259, 0.447, -0.334], 0.018, 0.007, C.chrome, [0, 0, -1], "service door lock", 16);
  box([0.003, 0.015, 0.001], [0.259, 0.447, -0.339], C.black, "lock keyway");

  return b.root;
}
```