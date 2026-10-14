```ts
import * as THREE from "three";
import {
  createBuilder, frame, polyline, catmull, grain, svg, rng,
  type Fill, type Part
} from "agentic-3js-builder";

export const meta = {
  name: "Starlite Select-O-Matic",
  description: "A full-size 1950s jukebox in cherrywood, ribbed amber light, turquoise neon and champagne chrome, with a visible 45, song cards, ivory selectors and a sunburst speaker grille."
};

export default function (): THREE.Object3D {
  const b = createBuilder({ name: "Starlite jukebox", detail: 0.7, paintSize: 2048 });
  const root = b.joint("cabinet", { at: [0, 0, 0] });
  const random = rng(1957);
  const C = {
    dark: "#261c23",
    wine: "#75292b",
    red: "#bf3f32",
    amber: "#f4a23e",
    light: "#ffdb89",
    rib: "#b77736",
    neon: "#39d8c9",
    glass: "#102e39",
    glint: "#37666e",
    black: "#142027",
    cloth: "#23353b",
    gold: "#bf985d",
    chrome: "#c1d0ce",
    bright: "#f0efdc",
    steel: "#52636b",
    cream: "#f6e7bf",
    vinyl: "#10171d",
    groove: "#28353d"
  };
  const wood = grain("#462327", "#673830", { size: 0.021, axis: "y", seed: 9 });
  const sideWood = grain("#58282b", "#773c30", { size: 0.016, axis: "y", seed: 11 });

  for (const color of [C.chrome, C.bright, C.gold, C.steel]) {
    const m = b.material(color);
    m.metalness = 0.78;
    m.roughness = color === C.steel ? 0.4 : 0.27;
  }
  b.material(C.glass).roughness = 0.23;
  b.material(C.glass).metalness = 0.32;
  b.material(C.vinyl).roughness = 0.28;
  b.material(C.wine).roughness = 0.36;
  b.material(C.amber).emissive.set("#f48d23");
  b.material(C.amber).emissiveIntensity = 0.23;
  b.material(C.light).emissive.set("#ffc65c");
  b.material(C.light).emissiveIntensity = 0.5;
  b.material(C.neon).emissive.set("#28d7bf");
  b.material(C.neon).emissiveIntensity = 0.65;

  function box(
    name: string, at: number[], size: number[], color: Fill,
    rotation: number[] = [0, 0, 0]
  ) {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      name, at, rotation, bone: root
    });
  }
  function cylinder(
    name: string, at: number[], radius: number, depth: number,
    color: Fill, dir: number[] = [0, 0, 1], sides = 20
  ) {
    return b.part(new THREE.CylinderGeometry(radius, radius, depth, sides), color, {
      name, at, dir, bone: root, flat: true
    });
  }
  function rod(name: string, a: number[], z: number[], radius: number, color: Fill, sides = 6) {
    return b.rod(a, z, radius, { name, color, bone: root, sides, smooth: false });
  }
  function torus(name: string, at: number[], radius: number, tube: number, color: Fill) {
    return b.part(new THREE.TorusGeometry(radius, tube, 6, 40), color, {
      name, at, bone: root
    });
  }
  function drawing(name: string, markup: string, at: number[], size: number[], rear = false) {
    return b.part(new THREE.PlaneGeometry(size[0], size[1]), "#ffffff", {
      name, at, bone: root, texture: svg(markup, { size: 768 }),
      rotation: rear ? [0, 180, 0] : [0, 0, 0]
    });
  }
  function textPlate(
    name: string, text: string, at: number[], width: number, height: number,
    fg = C.cream, bg = C.glass, rear = false, sub = ""
  ) {
    const markup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 120">
      <rect width="600" height="120" rx="7" fill="${bg}"/>
      <rect x="6" y="6" width="588" height="108" rx="5" fill="none" stroke="${C.gold}" stroke-width="3"/>
      <text x="300" y="${sub ? 65 : 82}" text-anchor="middle" font-family="Georgia,serif"
        font-weight="bold" font-style="italic" font-size="${sub ? 61 : 66}" letter-spacing="8" fill="${fg}">${text}</text>
      ${sub ? `<text x="300" y="103" text-anchor="middle" font-family="sans-serif" font-size="20" letter-spacing="7" fill="${fg}">${sub}</text>` : ""}
    </svg>`;
    return drawing(name, markup, at, [width, height], rear);
  }

  const cy = 1.015;
  function archOutline(radius: number, bottom: number) {
    const pts: number[][] = [[-radius, bottom], [radius, bottom], [radius, cy]];
    for (let i = 1; i <= 28; i++) {
      const a = Math.PI * i / 28;
      pts.push([radius * Math.cos(a), cy + radius * Math.sin(a)]);
    }
    return pts;
  }
  function archPanel(name: string, radius: number, bottom: number, z: number, depth: number, color: Fill, bevel = 0) {
    return b.extrude(archOutline(radius, bottom), {
      name, at: [0, 0, z], x: [1, 0, 0], y: [0, 1, 0],
      thickness: depth, bevel, color, bone: root
    });
  }
  function archBand(
    name: string, outer: number, inner: number, bottom: number,
    z: number, depth: number, color: Fill, bevel = 0
  ) {
    const pts: number[][] = [[-outer, bottom], [-outer, cy]];
    for (let i = 1; i <= 28; i++) {
      const a = Math.PI - Math.PI * i / 28;
      pts.push([outer * Math.cos(a), cy + outer * Math.sin(a)]);
    }
    pts.push([outer, bottom], [inner, bottom], [inner, cy]);
    for (let i = 1; i <= 28; i++) {
      const a = Math.PI * i / 28;
      pts.push([inner * Math.cos(a), cy + inner * Math.sin(a)]);
    }
    pts.push([-inner, bottom]);
    return b.extrude(pts, {
      name, at: [0, 0, z], x: [1, 0, 0], y: [0, 1, 0],
      thickness: depth, bevel, color, bone: root
    });
  }
  function archLine(radius: number, bottom: number, z: number) {
    const pts: number[][] = [[-radius, bottom, z], [-radius, cy, z]];
    for (let i = 1; i <= 32; i++) {
      const a = Math.PI - Math.PI * i / 32;
      pts.push([radius * Math.cos(a), cy + radius * Math.sin(a), z]);
    }
    pts.push([radius, bottom, z]);
    return polyline(pts);
  }
  function chamferRect(w: number, low: number, high: number, cut: number) {
    return [
      [-w / 2 + cut, low], [w / 2 - cut, low], [w / 2, low + cut],
      [w / 2, high - cut], [w / 2 - cut, high], [-w / 2 + cut, high],
      [-w / 2, high - cut], [-w / 2, low + cut]
    ];
  }
  function frontShape(name: string, outline: number[][], z: number, depth: number, color: Fill, bevel = 0) {
    return b.extrude(outline, {
      name, at: [0, 0, z], x: [1, 0, 0], thickness: depth,
      color, bevel, bone: root
    });
  }
  function screwsOn(part: Part, xy: number[][], rear = false) {
    const surface = b.surface(part);
    for (const [x, y] of xy) {
      const hit = surface.ray([x, y, rear ? -2 : 2], [0, 0, rear ? 1 : -1]);
      if (!hit) continue;
      b.stick(new THREE.CylinderGeometry(0.0043, 0.0043, 0.0035, 8), C.bright, hit, {
        name: "Flush slotted screw", embed: 0.2
      });
      b.stick(new THREE.BoxGeometry(0.0053, 0.0005, 0.0009), C.steel, hit.moved([0, 0.0029, 0]), {
        name: "Screwdriver slot", embed: 0, spin: 20 + random() * 100
      });
    }
  }

  // The substantial wooden carcass sits on four rubber feet, not on a display stand.
  for (const x of [-0.354, 0.354]) for (const z of [-0.211, 0.211]) {
    box("Rubber cabinet foot", [x, 0.031, z], [0.13, 0.062, 0.115], C.black);
    box("Foot ferrule", [x, 0.06, z], [0.137, 0.02, 0.12], C.steel);
  }
  box("Dark floating plinth", [0, 0.105, -0.015], [1.015, 0.105, 0.645], C.dark);
  box("Plinth chrome toe rail", [0, 0.114, 0.31], [0.974, 0.022, 0.032], C.chrome);
  box("Plinth wine top", [0, 0.153, -0.015], [0.99, 0.027, 0.608], C.wine);
  archPanel("Cherrywood arched cabinet", 0.49, 0.133, -0.02, 0.58, wood, 0.019);
  archPanel("Front lacquered reveal", 0.477, 0.151, 0.285, 0.03, C.wine, 0.008);

  // Concentric cast trim and ribbed, illuminated amber glass.
  archBand("Outer rolled chrome arch", 0.472, 0.447, 0.22, 0.31, 0.052, C.chrome, 0.006);
  archBand("Vermilion outer pinstripe", 0.449, 0.436, 0.234, 0.34, 0.029, C.red, 0.003);
  archBand("Amber luminous horseshoe", 0.437, 0.357, 0.235, 0.341, 0.079, C.amber, 0.012);
  archBand("Inner red enamel piping", 0.358, 0.346, 0.232, 0.363, 0.037, C.red, 0.003);
  archBand("Inner polished arch", 0.346, 0.332, 0.233, 0.36, 0.035, C.chrome, 0.004);

  for (const r of [0.382, 0.414]) {
    b.sweep(archLine(r, 0.254, 0.379), 0.005, {
      name: "Warm filaments inside amber glass", color: C.light, sides: 6, bone: root, caps: "flat"
    });
  }
  b.sweep(archLine(0.325, 0.25, 0.37), 0.0055, {
    name: "Turquoise inner neon", color: C.neon, sides: 8, bone: root, caps: "round"
  });

  for (let i = 1; i < 30; i++) {
    const a = Math.PI * i / 30;
    rod("Radial amber glass flute",
      [0.363 * Math.cos(a), cy + 0.363 * Math.sin(a), 0.383],
      [0.431 * Math.cos(a), cy + 0.431 * Math.sin(a), 0.383],
      0.0021, C.rib, 4);
  }
  for (const s of [-1, 1]) {
    for (let i = 0; i < 22; i++) {
      const y = 0.278 + i * 0.033;
      rod("Horizontal glass flute", [s * 0.363, y, 0.383], [s * 0.431, y, 0.383], 0.0021, C.rib, 4);
    }
    box("Chrome light-column shoe", [s * 0.397, 0.231, 0.35], [0.103, 0.068, 0.107], C.chrome);
    box("Shoe dark inset", [s * 0.397, 0.224, 0.405], [0.077, 0.022, 0.007], C.steel);
    for (const y of [0.249, 0.264]) {
      box("Shoe polished ridge", [s * 0.397, y, 0.405], [0.096, 0.006, 0.008], C.bright);
    }
  }

  // Small winged star interrupting the light arch at its crown.
  const badge = [[-0.076, 0], [-0.05, -0.029], [0.05, -0.029], [0.076, 0], [0.05, 0.029], [-0.05, 0.029]];
  b.extrude(badge, {
    name: "Crown wing badge", at: [0, 1.415, 0.393], x: [1, 0, 0],
    color: C.chrome, thickness: 0.018, bevel: 0.003, bone: root
  });
  b.extrude(badge.map(([x, y]) => [x * 0.84, y * 0.76]), {
    name: "Crown turquoise enamel", at: [0, 1.415, 0.406], x: [1, 0, 0],
    color: C.glass, thickness: 0.009, bone: root
  });
  const star: number[][] = [];
  for (let i = 0; i < 16; i++) {
    const a = Math.PI / 2 + i * Math.PI / 8;
    const r = i % 2 ? 0.006 : (i % 4 === 0 ? 0.023 : 0.014);
    star.push([Math.cos(a) * r, Math.sin(a) * r]);
  }
  b.extrude(star, {
    name: "Eight-point Starlite star", at: [0, 1.415, 0.414], x: [1, 0, 0],
    color: C.light, thickness: 0.005, bone: root
  });
  for (const s of [-1, 1]) for (const y of [-0.007, 0.007]) {
    rod("Badge wing engraving", [s * 0.029, 1.415 + y, 0.414], [s * 0.055, 1.415 + y, 0.414], 0.0011, C.gold, 4);
  }

  // A recessed smoked-glass song display. Cards sit in individual metal pockets.
  archPanel("Smoked petrol-blue display", 0.316, 0.844, 0.324, 0.026, C.glass, 0.005);
  box("Display bottom chrome sill", [0, 0.854, 0.357], [0.604, 0.016, 0.038], C.chrome);
  for (const s of [-1, 1]) {
    b.slab([
      [s * 0.297, 0.963, 0.339], [s * 0.284, 0.979, 0.339],
      [s * 0.249, 1.158, 0.339], [s * 0.261, 1.14, 0.339]
    ], { name: "Angular glass reflection", color: C.glint, thickness: 0.001, bone: root });
  }
  textPlate("Selection count", "100 SELECTIONS", [0, 1.284, 0.346], 0.194, 0.03, C.gold);

  const titles = [
    ["BLUE MOON", "MIDNIGHT SPECIAL"], ["SILVER LINING", "THE LAST DANCE"],
    ["SUNDAY DRIVE", "SWEET SUMMER"], ["AFTER HOURS", "MOONLIGHT WALTZ"],
    ["HEART OF GOLD", "DREAM A LITTLE"], ["STARLIGHT SERENADE", "ON THE BOARDWALK"],
    ["COME FLY WITH ME", "SLOW BOAT HOME"], ["GOODNIGHT, LOVE", "ONE MORE SONG"]
  ];
  for (let row = 0; row < 4; row++) for (let col = 0; col < 2; col++) {
    const i = row * 2 + col;
    const x = col ? 0.108 : -0.108;
    const y = 1.046 + row * 0.0565;
    box("Chrome title-card pocket", [x, y, 0.349], [0.204, 0.048, 0.016], C.chrome);
    box("Ivory title card", [x, y, 0.359], [0.192, 0.039, 0.006], C.cream);
    drawing(`Song card ${i + 1}`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 100">
      <rect width="500" height="100" fill="${C.cream}"/>
      <rect x="6" y="7" width="56" height="86" rx="3" fill="${C.wine}"/>
      <text x="34" y="45" fill="${C.cream}" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="30">${String.fromCharCode(65 + i)}</text>
      <text x="34" y="78" fill="${C.cream}" text-anchor="middle" font-family="sans-serif" font-size="24">${i + 1}</text>
      <path d="M76 50H481" stroke="${C.gold}" stroke-width="2"/>
      <text x="83" y="36" fill="${C.dark}" font-family="serif" font-weight="bold" font-size="23">${titles[i][0]}</text>
      <text x="83" y="79" fill="${C.dark}" font-family="serif" font-size="23">${titles[i][1]}</text>
      </svg>`, [x, y, 0.363], [0.19, 0.037]);
  }

  // The exposed record, spindle, mechanism and separate bent tonearm.
  box("Record mechanism tray", [0, 0.874, 0.353], [0.445, 0.021, 0.032], C.steel);
  rod("Mechanism guide rail", [-0.236, 0.89, 0.355], [0.236, 0.89, 0.355], 0.005, C.chrome);
  for (const x of [-0.204, 0.204]) {
    box("Mechanism mounting pedestal", [x, 0.912, 0.35], [0.041, 0.065, 0.023], C.gold);
    cylinder("Pedestal pivot", [x, 0.934, 0.37], 0.012, 0.015, C.chrome);
  }
  cylinder("Turntable platter", [0, 0.93, 0.349], 0.093, 0.017, C.steel, [0, 0, 1], 40);
  cylinder("Black forty-five record", [0, 0.93, 0.36], 0.089, 0.005, C.vinyl, [0, 0, 1], 48);
  for (const r of [0.041, 0.049, 0.057, 0.065, 0.073, 0.081, 0.085]) {
    torus("Pressed vinyl groove", [0, 0.93, 0.363], r, 0.00055, C.groove);
  }
  cylinder("Turquoise record label", [0, 0.93, 0.364], 0.033, 0.003, C.neon, [0, 0, 1], 32);
  drawing("Record label lettering", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">
    <circle cx="90" cy="90" r="80" fill="none" stroke="${C.glass}" stroke-width="3"/>
    <text x="90" y="65" text-anchor="middle" font-family="serif" font-weight="bold" font-size="21" fill="${C.glass}">STARLITE</text>
    <text x="90" y="133" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="34" fill="${C.glass}">45</text>
    </svg>`, [0, 0.93, 0.366], [0.061, 0.061]);
  cylinder("Record adapter", [0, 0.93, 0.369], 0.0105, 0.008, C.gold, [0, 0, 1], 12);
  cylinder("Polished spindle", [0, 0.93, 0.378], 0.0036, 0.013, C.bright, [0, 0, 1], 8);
  b.sweep(polyline([[0.204, 0.934, 0.378], [0.182, 0.97, 0.38], [0.155, 0.97, 0.383], [0.075, 0.913, 0.391]]),
    0.006, { name: "Bent chrome tonearm", color: C.chrome, sides: 6, bone: root });
  box("Ivory pickup cartridge", [0.075, 0.91, 0.394], [0.026, 0.014, 0.016], C.cream, [0, 0, -35]);
  textPlate("Now playing indicator", "B3", [-0.234, 0.981, 0.35], 0.047, 0.026);
  textPlate("Record speed plaque", "45 RPM", [0.224, 0.988, 0.35], 0.083, 0.021, C.gold);

  // Projecting control console: a nameplate, knurled volume knob, coin slot and piano-like keys.
  const consolePanel = frontShape("Cast chrome control console",
    [[-0.327, 0.707], [0.327, 0.707], [0.337, 0.729], [0.317, 0.84],
      [0.29, 0.858], [-0.29, 0.858], [-0.317, 0.84], [-0.337, 0.729]],
    0.369, 0.102, C.chrome, 0.008);
  frontShape("Console wine enamel",
    [[-0.305, 0.773], [0.305, 0.773], [0.287, 0.843], [-0.287, 0.843]],
    0.423, 0.012, C.wine, 0.002);
  textPlate("Starlite maker's marquee", "STARLITE", [0, 0.808, 0.434], 0.363, 0.057,
    C.cream, C.wine, false, "SELECT-O-MATIC");

  b.lathe([[0, 0], [0.02, 0], [0.025, 0.005], [0.025, 0.016], [0.02, 0.022], [0, 0.022]], {
    name: "Volume knob", at: [-0.253, 0.812, 0.424], axis: [0, 0, 1],
    color: C.chrome, segments: 16, bone: root
  });
  b.ring(frame([-0.253, 0.812, 0.436], [0, 0, 1]), { count: 16, radius: 0.024 }, item => {
    b.stick(new THREE.BoxGeometry(0.0024, 0.0028, 0.013), C.steel, item, {
      name: "Knob knurl", flow: [0, 0, 1], embed: 0.2, bone: root
    });
  });
  cylinder("Volume knob dark face", [-0.253, 0.812, 0.448], 0.016, 0.002, C.glass);
  box("Volume pointer", [-0.253, 0.823, 0.45], [0.0024, 0.008, 0.002], C.cream);
  box("Coin escutcheon", [0.25, 0.81, 0.433], [0.075, 0.059, 0.012], C.gold);
  box("Coin slot shadow", [0.25, 0.825, 0.4405], [0.042, 0.006, 0.003], C.black);
  box("Coin slot bright lower lip", [0.25, 0.821, 0.442], [0.045, 0.0018, 0.003], C.bright);
  textPlate("Quarter price", "25¢", [0.25, 0.799, 0.441], 0.055, 0.025, C.dark, C.gold);
  box("Selector key recess", [0, 0.742, 0.423], [0.574, 0.045, 0.014], C.black);
  const legends = ["A", "B", "C", "D", "E", "1", "2", "3", "4", "5"];
  let keyText = "";
  for (let i = 0; i < 10; i++) {
    const x = (i - 4.5) * 0.056;
    box("Ivory selection key", [x, 0.745, 0.443], [0.046, 0.031, 0.033], C.cream, [-7, 0, 0]);
    box("Key lower bevel highlight", [x, 0.732, 0.462], [0.044, 0.004, 0.004], C.bright);
    keyText += `<text x="${(i + 0.5) * 100}" y="63" text-anchor="middle" font-family="sans-serif" font-size="55" font-weight="bold" fill="${C.wine}">${legends[i]}</text>`;
  }
  drawing("Selector key legends",
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 100">${keyText}</svg>`,
    [0, 0.746, 0.462], [0.56, 0.028]);
  screwsOn(consolePanel, [[-0.318, 0.734], [0.318, 0.734]]);

  // Recessed twin speakers, fine diamond wire mesh, and bold Art Deco fan bars.
  const grilleBezel = frontShape("Speaker chrome bezel", chamferRect(0.588, 0.205, 0.693, 0.031),
    0.352, 0.048, C.chrome, 0.006);
  frontShape("Speaker dark aperture", chamferRect(0.531, 0.235, 0.664, 0.02),
    0.375, 0.014, C.cloth, 0.002);
  for (const x of [-0.134, 0.134]) {
    cylinder("Speaker cone outer shadow", [x, 0.465, 0.386], 0.119, 0.006, C.black, [0, 0, 1], 24);
    torus("Speaker surround", [x, 0.465, 0.391], 0.104, 0.006, C.steel);
    cylinder("Speaker paper cone", [x, 0.465, 0.39], 0.087, 0.004, C.cloth, [0, 0, 1], 24);
    torus("Cone crease", [x, 0.465, 0.393], 0.065, 0.0014, C.black);
    cylinder("Speaker dust cap", [x, 0.465, 0.395], 0.038, 0.009, C.black, [0, 0, 1], 16);
  }

  // Clip both families of wire diagonals to the grille's rectangle.
  const xmin = -0.25, xmax = 0.25, ymin = 0.257, ymax = 0.639;
  for (const slope of [-1.28, 1.28]) {
    for (let k = -18; k <= 27; k++) {
      const intercept = k * 0.033;
      const candidates: number[][] = [];
      for (const x of [xmin, xmax]) {
        const y = slope * x + intercept;
        if (y >= ymin && y <= ymax) candidates.push([x, y, 0.398]);
      }
      for (const y of [ymin, ymax]) {
        const x = (y - intercept) / slope;
        if (x > xmin && x < xmax) candidates.push([x, y, 0.398]);
      }
      if (candidates.length === 2) rod("Diamond grille wire", candidates[0], candidates[1], 0.00125, C.gold, 4);
    }
  }
  for (let i = -5; i <= 5; i++) {
    const start = i * 0.032;
    const end = i * 0.048;
    b.sweep(catmull([
      [start, 0.253, 0.41], [start * 1.04, 0.35, 0.41],
      [end * 0.87, 0.48, 0.41], [end, 0.643, 0.41]
    ]), () => [0.004, 0.008], {
      name: "Champagne sunburst grille rib", color: i % 2 === 0 ? C.chrome : C.gold,
      section: "box", up: [0, 0, 1], caps: "flat", bone: root
    });
  }
  for (const y of [0.246, 0.65, 0.663]) {
    box("Grille horizontal bright rail", [0, y, 0.405], [0.509, 0.008, 0.016], C.chrome);
  }
  cylinder("Sunburst medallion outer", [0, 0.454, 0.421], 0.059, 0.013, C.gold, [0, 0, 1], 24);
  cylinder("Sunburst medallion enamel", [0, 0.454, 0.429], 0.049, 0.007, C.wine, [0, 0, 1], 24);
  drawing("Speaker medallion music emblem", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
    <circle cx="100" cy="100" r="89" fill="none" stroke="${C.cream}" stroke-width="3"/>
    <path d="M91 132V56L141 44V118 M91 72L141 60" fill="none" stroke="${C.cream}" stroke-width="10"/>
    <ellipse cx="78" cy="134" rx="20" ry="13" fill="${C.cream}" transform="rotate(-20 78 134)"/>
    <ellipse cx="128" cy="120" rx="20" ry="13" fill="${C.cream}" transform="rotate(-20 128 120)"/>
    <path d="M37 87L42 73L47 87L61 92L47 97L42 111L37 97L23 92Z" fill="${C.gold}"/>
    </svg>`, [0, 0.454, 0.4335], [0.088, 0.088]);
  textPlate("High fidelity grille badge", "HIGH FIDELITY", [0, 0.276, 0.424], 0.268, 0.035, C.cream);
  screwsOn(grilleBezel, [[-0.27, 0.662], [0.27, 0.662], [-0.268, 0.232], [0.268, 0.232]]);

  // Finished side cheeks, speed lines, carry handles and small enamel diamonds.
  for (const s of [-1, 1]) {
    const side = b.extrude(chamferRect(0.456, 0.273, 0.966, 0.025), {
      name: "Side-panel bronze edging", at: [s * 0.485, 0, -0.018],
      x: [0, 0, 1], thickness: 0.009, color: C.gold, bone: root
    });
    b.extrude(chamferRect(0.433, 0.286, 0.952, 0.023), {
      name: "Cherrywood side inset", at: [s * 0.491, 0, -0.018],
      x: [0, 0, 1], thickness: 0.006, color: sideWood, bone: root
    });
    for (let i = 0; i < 3; i++) {
      b.extrude([[-0.183, 0], [0.15, 0], [0.181, 0.007], [0.15, 0.014], [-0.183, 0.014]], {
        name: "Side chrome speed fin", at: [s * 0.498, 0.385 + i * 0.037, -0.018],
        x: [0, 0, 1], thickness: 0.008, color: C.chrome, bone: root
      });
    }
    b.extrude([[-0.098, 0], [0, -0.051], [0.098, 0], [0, 0.051]], {
      name: "Side diamond escutcheon", at: [s * 0.5, 0.722, -0.018],
      x: [0, 0, 1], thickness: 0.009, color: C.gold, bone: root
    });
    b.extrude([[-0.077, 0], [0, -0.034], [0.077, 0], [0, 0.034]], {
      name: "Side diamond enamel", at: [s * 0.506, 0.722, -0.018],
      x: [0, 0, 1], thickness: 0.006, color: C.glass, bone: root
    });
    cylinder("Side badge stud", [s * 0.512, 0.722, -0.018], 0.014, 0.008, C.chrome, [s, 0, 0], 8);
    box("Recessed carry handle shadow", [s * 0.498, 0.879, -0.02], [0.009, 0.05, 0.15], C.black);
    for (const z of [-0.096, 0.056]) {
      box("Handle end block", [s * 0.509, 0.879, z], [0.026, 0.037, 0.021], C.chrome);
    }
    rod("Side carry handle", [s * 0.522, 0.884, -0.095], [s * 0.522, 0.884, 0.055], 0.009, C.steel);
    const surf = b.surface(side);
    for (const y of [0.303, 0.934]) for (const z of [-0.197, 0.161]) {
      const hit = surf.ray([s * 2, y, z], [-s, 0, 0]);
      if (hit) b.stick(new THREE.CylinderGeometry(0.0036, 0.0036, 0.003, 8), C.chrome, hit, {
        name: "Side panel screw", embed: 0.1
      });
    }
  }

  // Rear service door: ventilation, hinges, lock, serial plate and tucked power lead.
  const back = archPanel("Rear service door", 0.43, 0.237, -0.316, 0.017, C.dark, 0.005);
  for (let i = -5; i <= 5; i++) {
    const x = i * 0.049;
    b.capsule([x, 0.927, -0.328], [x, 1.12, -0.328], 0.009, {
      name: "Rear ventilation slot", color: C.black, sides: 6, bone: root
    });
    rod("Vent lower metal edge", [x + 0.007, 0.935, -0.331], [x + 0.007, 1.113, -0.331], 0.001, C.steel, 4);
  }
  for (const y of [0.39, 0.81]) {
    box("Service-door hinge leaf", [-0.386, y, -0.333], [0.047, 0.072, 0.007], C.steel);
    rod("Service-door hinge pin", [-0.397, y - 0.037, -0.34], [-0.397, y + 0.037, -0.34], 0.006, C.chrome);
  }
  cylinder("Rear lock escutcheon", [0.358, 0.665, -0.332], 0.022, 0.01, C.chrome, [0, 0, -1], 16);
  box("Lock keyway", [0.358, 0.665, -0.339], [0.004, 0.013, 0.002], C.black);
  box("Rear manufacturer's plate", [0, 0.728, -0.329], [0.27, 0.13, 0.005], C.gold);
  drawing("Rear specification label", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 260">
    <rect width="540" height="260" fill="${C.gold}"/>
    <rect x="9" y="9" width="522" height="242" fill="none" stroke="${C.dark}" stroke-width="4"/>
    <text x="270" y="63" text-anchor="middle" font-family="serif" font-weight="bold" font-style="italic" font-size="46" fill="${C.dark}">STARLITE</text>
    <text x="270" y="104" text-anchor="middle" font-family="sans-serif" font-size="20" letter-spacing="4" fill="${C.dark}">AUTOMATIC PHONOGRAPH</text>
    <path d="M38 123H502" stroke="${C.dark}" stroke-width="2"/>
    <g font-family="monospace" font-size="22" fill="${C.dark}">
      <text x="40" y="163">MODEL 57-S   SERIAL 004518</text>
      <text x="40" y="200">115 VOLTS   60 CYCLES</text>
      <text x="40" y="232">SERVICE BY QUALIFIED PERSONNEL</text>
    </g></svg>`, [0, 0.728, -0.333], [0.262, 0.125], true);
  screwsOn(back, [[-0.364, 0.279], [0.364, 0.279], [-0.31, 1.219], [0.31, 1.219]], true);
  cylinder("Power-cable grommet", [0.244, 0.263, -0.332], 0.02, 0.01, C.black, [0, 0, -1], 12);
  b.sweep(catmull([
    [0.244, 0.263, -0.341], [0.255, 0.186, -0.363],
    [0.244, 0.075, -0.373], [0.17, 0.024, -0.373], [0.097, 0.024, -0.359]
  ]), 0.0065, { name: "Tucked power cord", color: C.black, sides: 6, bone: root });
  box("Power plug", [0.076, 0.025, -0.355], [0.04, 0.028, 0.024], C.black);
  for (const z of [-0.361, -0.349]) {
    box("Plug prong", [0.048, 0.025, z], [0.018, 0.004, 0.004], C.gold);
  }

  return b.root;
}
```