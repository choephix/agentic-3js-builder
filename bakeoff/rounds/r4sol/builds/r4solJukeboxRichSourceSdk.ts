import * as THREE from "three";
import {
  createBuilder, rng, paint, svg, polyline, frame
} from "../../../../src/index";

export const meta = {
  name: "Starlite ’57 Diner Jukebox",
  description: "A chrome-trimmed 1950s jukebox with illuminated red, amber and teal arches, a glazed record mechanism, twenty-four selections, and a starburst speaker."
};

export default function (): THREE.Object3D {
  const b = createBuilder({ name: "Starlite_57", detail: 0.8, paintSize: 1024 });
  b.joint("cabinet", { at: [0, 0, 0] });
  const bone = "cabinet";
  const random = rng(1957);

  const C = {
    wine: "#661e2c",
    redEnamel: "#a93239",
    dark: "#132d32",
    black: "#101519",
    rubber: "#242426",
    ivory: "#f2deb1",
    brass: "#c59b58",
    chrome: "#c6d4d8",
    bright: "#eef4f2",
    shadowChrome: "#687e85",
    red: "#ee4938",
    amber: "#f3ac31",
    teal: "#25b7a9",
    redCore: "#ffc0a1",
    amberCore: "#ffe6a6",
    tealCore: "#b0fff0",
    glass: "#a9d8d5",
    grooves: "#3d494f"
  };

  for (const c of [C.chrome, C.bright, C.shadowChrome]) {
    const m = b.material(c);
    m.metalness = c === C.bright ? 0.5 : 0.78;
    m.roughness = c === C.shadowChrome ? 0.32 : 0.21;
  }
  b.material(C.brass).metalness = 0.58;
  b.material(C.brass).roughness = 0.35;
  for (const c of [C.wine, C.redEnamel]) {
    b.material(c).roughness = 0.3;
    b.material(c).metalness = 0.22;
  }
  for (const c of [C.red, C.amber, C.teal, C.redCore, C.amberCore, C.tealCore]) {
    const m = b.material(c);
    m.emissive.set(c);
    m.emissiveIntensity = [C.redCore, C.amberCore, C.tealCore].includes(c) ? 1.05 : 0.65;
    m.roughness = 0.26;
    m.metalness = 0.08;
  }
  b.material(C.black).roughness = 0.38;
  b.material(C.black).metalness = 0.18;
  b.material(C.grooves).metalness = 0.3;
  b.material(C.grooves).roughness = 0.4;

  type P = readonly [number, number, number];
  const cy = 1.27;

  function box(
    name: string, at: P, size: P, color: string,
    rotation?: readonly number[]
  ) {
    return b.part(new THREE.BoxGeometry(...size), color, {
      name, at, bone, rotation
    });
  }

  function plate(
    name: string, outline: number[][], at: P,
    thickness: number, color: string, bevel = 0
  ) {
    return b.extrude(outline, {
      name, at, color, thickness, bevel, bone,
      x: [1, 0, 0], y: [0, 1, 0], detail: 0.5
    });
  }

  function chamferRect(w: number, h: number, c: number): number[][] {
    return [
      [-w / 2 + c, -h / 2], [w / 2 - c, -h / 2],
      [w / 2, -h / 2 + c], [w / 2, h / 2 - c],
      [w / 2 - c, h / 2], [-w / 2 + c, h / 2],
      [-w / 2, h / 2 - c], [-w / 2, -h / 2 + c]
    ];
  }

  function archOutline(r: number, bottom: number): number[][] {
    const p = [[-r, bottom], [r, bottom]];
    for (let i = 0; i <= 32; i++) {
      const a = Math.PI * i / 32;
      p.push([r * Math.cos(a), cy + r * Math.sin(a)]);
    }
    return p;
  }

  function uOutline(outer: number, inner: number, bottom: number): number[][] {
    const p = [[-outer, bottom]];
    for (let i = 0; i <= 32; i++) {
      const a = Math.PI - Math.PI * i / 32;
      p.push([outer * Math.cos(a), cy + outer * Math.sin(a)]);
    }
    p.push([outer, bottom], [inner, bottom]);
    for (let i = 0; i <= 32; i++) {
      const a = Math.PI * i / 32;
      p.push([inner * Math.cos(a), cy + inner * Math.sin(a)]);
    }
    p.push([-inner, bottom]);
    return p;
  }

  function archPoints(r: number, bottom: number, z: number): number[][] {
    const p = [[-r, bottom, z]];
    for (let i = 0; i <= 36; i++) {
      const a = Math.PI - Math.PI * i / 36;
      p.push([r * Math.cos(a), cy + r * Math.sin(a), z]);
    }
    p.push([r, bottom, z]);
    return p;
  }

  function archTube(
    name: string, radius: number, bottom: number,
    z: number, tube: number, color: string
  ) {
    return b.sweep(polyline(archPoints(radius, bottom, z)), tube, {
      name, color, bone, sides: 10, smooth: false, caps: "round"
    });
  }

  function disc(name: string, at: P, radius: number, depth: number, color: string, dir: P = [0, 0, 1]) {
    return b.part(new THREE.CylinderGeometry(radius, radius, depth, 32), color, {
      name, at, bone, dir, axis: "y"
    });
  }

  function torus(name: string, at: P, radius: number, tube: number, color: string, dir: P = [0, 0, 1]) {
    return b.part(new THREE.TorusGeometry(radius, tube, 5, 40), color, {
      name, at, bone, dir, axis: "z"
    });
  }

  function screw(at: P, radius = 0.004, back = false) {
    disc("Chrome screw head", at, radius, 0.004, C.bright, back ? [0, 0, -1] : [0, 0, 1]);
    box("Screwdriver slot", [at[0], at[1], at[2] + (back ? -0.0025 : 0.0025)],
      [radius * 1.35, 0.001, 0.001], C.shadowChrome);
  }

  function textPlate(name: string, markup: string, at: P, w: number, h: number, dir: P = [0, 0, 1]) {
    return b.part(new THREE.PlaneGeometry(w, h), "#ffffff", {
      name, at, bone, texture: svg(markup, { size: 512 }), dir, axis: "z"
    });
  }

  // The cabinet is genuinely hollow behind its window.
  plate("Rounded rear cabinet", archOutline(0.487, 0.115), [0, 0, -0.283], 0.045, C.wine, 0.008);
  plate("Deep arched cabinet shell", uOutline(0.49, 0.291, 0.112), [0, 0, -0.005], 0.525, C.wine, 0.012);
  plate("Ivory arch surround", uOutline(0.467, 0.294, 0.143), [0, 0, 0.265], 0.018, C.ivory, 0.005);
  box("Central lower cabinet", [0, 0.635, 0.255], [0.59, 1.0, 0.056], C.ivory);

  // Low, weighty chrome plinth and four rubber feet.
  for (const x of [-0.407, 0.407]) {
    for (const z of [-0.248, 0.218]) {
      box("Rubber foot", [x, 0.012, z], [0.115, 0.024, 0.105], C.rubber);
    }
  }
  plate("Chrome pedestal", [
    [-0.505, 0.024], [0.505, 0.024], [0.531, 0.05],
    [0.531, 0.108], [0.508, 0.132], [-0.508, 0.132],
    [-0.531, 0.108], [-0.531, 0.05]
  ], [0, 0, -0.017], 0.678, C.chrome, 0.009);
  plate("Burgundy kick strip", chamferRect(1.012, 0.056, 0.012), [0, 0.082, 0.329], 0.014, C.wine, 0.004);
  box("Pedestal bright lip", [0, 0.126, 0.332], [1.003, 0.009, 0.015], C.bright);
  for (let i = 0; i < 15; i++) {
    box("Kick strip flute", [(i - 7) * 0.058, 0.082, 0.338], [0.028, 0.003, 0.003], C.brass);
  }

  // Side panels, fluting, and wraparound trim make the object read from every angle.
  for (const s of [-1, 1]) {
    b.extrude(chamferRect(0.423, 0.976, 0.045), {
      name: "Inset red side enamel", at: [s * 0.493, 0.714, -0.017],
      x: [0, 0, 1], y: [0, 1, 0], thickness: 0.024,
      color: C.redEnamel, bevel: 0.008, bone, detail: 0.5
    });
    const sideLoop = [
      [s * 0.508, 0.266, -0.199], [s * 0.508, 1.158, -0.199],
      [s * 0.508, 1.186, -0.171], [s * 0.508, 1.186, 0.137],
      [s * 0.508, 1.158, 0.166], [s * 0.508, 0.266, 0.166]
    ];
    b.sweep(polyline(sideLoop, { closed: true }), 0.005, {
      name: "Side panel chrome piping", color: C.chrome, bone, sides: 6
    });
    for (let i = 0; i < 5; i++) {
      const z = -0.14 + i * 0.058;
      b.rod([s * 0.509, 0.315, z], [s * 0.509, 1.12, z], 0.0032, {
        name: "Side pinstripe", color: i % 2 ? C.brass : C.wine, bone, sides: 5
      });
    }
    for (const y of [0.249, 0.6, 1.14]) {
      b.rod([s * 0.514, y, -0.215], [s * 0.514, y, 0.21], 0.007, {
        name: "Wraparound chrome belt", color: C.chrome, bone, sides: 8
      });
    }
    for (let i = 0; i < 7; i++) {
      box("Side ventilation slot", [s * 0.512, 0.396 + i * 0.024, -0.059],
        [0.004, 0.007, 0.217], C.dark);
    }
  }

  // Three continuous illuminated arches, with dark channels and hot filaments.
  archTube("Outer chrome crown", 0.476, 0.151, 0.278, 0.012, C.chrome);
  archTube("Outer crown highlight", 0.476, 0.154, 0.289, 0.003, C.bright);

  const lamps = [
    { r: 0.434, bottom: 0.307, tube: 0.026, color: C.red, core: C.redCore },
    { r: 0.375, bottom: 0.336, tube: 0.023, color: C.amber, core: C.amberCore },
    { r: 0.320, bottom: 0.365, tube: 0.019, color: C.teal, core: C.tealCore }
  ];
  for (const lamp of lamps) {
    archTube("Chrome lamp channel", lamp.r, lamp.bottom, 0.287, lamp.tube + 0.007, C.shadowChrome);
    archTube("Luminous coloured tube", lamp.r, lamp.bottom, 0.313, lamp.tube, lamp.color);
    archTube("Bright tube filament", lamp.r - 0.006, lamp.bottom + 0.007, 0.335, 0.004, lamp.core);
    for (const s of [-1, 1]) {
      for (const y of [lamp.bottom + 0.023, 1.095]) {
        b.lathe([
          [0, -0.019], [lamp.tube + 0.005, -0.019],
          [lamp.tube + 0.008, -0.013], [lamp.tube + 0.008, 0.013],
          [lamp.tube + 0.005, 0.019], [0, 0.019]
        ], {
          name: "Polished tube collar", at: [s * lamp.r, y, 0.312],
          color: C.chrome, segments: 12, bone
        });
        box("Collar front glint", [s * lamp.r, y, 0.350],
          [lamp.tube * 1.55, 0.005, 0.004], C.bright);
      }
    }
  }
  archTube("Chrome separator red amber", 0.405, 0.315, 0.289, 0.004, C.brass);
  archTube("Chrome separator amber teal", 0.346, 0.343, 0.289, 0.004, C.chrome);

  for (const s of [-1, 1]) {
    const foot = [
      [s * 0.304, 0.145], [s * 0.472, 0.145],
      [s * 0.451, 0.303], [s * 0.327, 0.330]
    ];
    plate("Flared champagne lamp pedestal", foot, [0, 0, 0.298], 0.035, C.brass, 0.008);
    for (let k = 0; k < 3; k++) {
      b.rod([s * (0.334 + k * 0.035), 0.172, 0.320],
        [s * (0.348 + k * 0.035), 0.279, 0.320], 0.003, {
          name: "Pedestal chrome fluting", color: C.chrome, bone, sides: 6
        });
    }
  }

  // Recessed, illuminated record cabinet.
  plate("Window rear shadow", archOutline(0.282, 1.135), [0, 0, -0.233], 0.023, C.dark);
  plate("Warm mechanism reflector", archOutline(0.248, 1.164), [0, 0, -0.208], 0.009, "#bca77c");
  b.material("#bca77c").emissive.set("#9f7944");
  b.material("#bca77c").emissiveIntensity = 0.16;
  box("Record mechanism shelf", [0, 1.151, 0.014], [0.501, 0.025, 0.396], C.shadowChrome);
  box("Mechanism shelf bright edge", [0, 1.164, 0.216], [0.497, 0.01, 0.014], C.chrome);

  for (const x of [-0.221, 0.221]) {
    b.rod([x, 1.179, -0.09], [x, 1.37, -0.09], 0.006, {
      name: "Record changer guide rail", color: C.chrome, bone, sides: 8
    });
    for (const y of [1.194, 1.35]) {
      disc("Guide mounting screw", [x, y, -0.082], 0.008, 0.005, C.bright);
    }
  }

  b.lathe([
    [0, 0], [0.134, 0], [0.166, 0.009],
    [0.166, 0.022], [0.145, 0.032], [0, 0.032]
  ], {
    name: "Record stack platter", at: [-0.035, 1.173, 0.06],
    color: C.chrome, segments: 32, bone
  });
  for (let i = 0; i < 9; i++) {
    const y = 1.216 + i * 0.0117;
    const radius = 0.144 + random() * 0.005;
    disc("Stacked vinyl record", [-0.035, y, 0.06], radius, 0.006, C.black, [0, 1, 0]);
    torus("Fine vinyl edge", [-0.035, y + 0.001, 0.06], radius - 0.001, 0.0009, C.grooves, [0, 1, 0]);
    disc("Stack record paper label", [-0.035, y + 0.0034, 0.06],
      0.032, 0.001, i % 2 ? C.redEnamel : C.brass, [0, 1, 0]);
  }
  for (const r of [0.085, 0.11, 0.131]) {
    torus("Top record concentric groove", [-0.035, 1.3132, 0.06], r, 0.0008, C.grooves, [0, 1, 0]);
  }
  b.rod([-0.035, 1.189, 0.06], [-0.035, 1.355, 0.06], 0.006, {
    name: "Record stack spindle", color: C.bright, bone, sides: 8
  });

  // A lifted 45 and the articulated metal transfer arm.
  const recordAt: P = [-0.072, 1.416, 0.137];
  const recordDir: P = [0, 0.1, 1];
  disc("Lifted forty five", recordAt, 0.102, 0.007, C.black, recordDir);
  for (const r of [0.049, 0.064, 0.077, 0.088, 0.098]) {
    torus("Lifted record groove", [-0.072, 1.4164, 0.141], r, 0.00065, C.grooves, recordDir);
  }
  disc("Red record label", [-0.072, 1.4166, 0.142], 0.0355, 0.0015, C.redEnamel, recordDir);
  textPlate("Printed record label",
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <circle cx="100" cy="100" r="93" fill="none" stroke="#f2deb1" stroke-width="3"/>
      <path d="M100 19l5 12 13 1-10 8 3 13-11-7-11 7 3-13-10-8 13-1z" fill="#f2deb1"/>
      <text x="100" y="74" text-anchor="middle" font-family="Georgia,serif" font-size="25" font-weight="bold" fill="#f2deb1">STAR</text>
      <text x="100" y="94" text-anchor="middle" font-family="Arial,sans-serif" font-size="13" fill="#f2deb1">RECORDS</text>
      <text x="100" y="151" text-anchor="middle" font-family="Arial,sans-serif" font-size="34" font-weight="bold" fill="#f2deb1">45</text>
      <text x="100" y="172" text-anchor="middle" font-family="Arial,sans-serif" font-size="10" fill="#f2deb1">HIGH FIDELITY</text>
    </svg>`, [-0.072, 1.4168, 0.144], 0.065, 0.065, recordDir);
  disc("Record centre hole", [-0.072, 1.4169, 0.146], 0.0065, 0.002, C.black, recordDir);

  box("Changer motor housing", [0.174, 1.232, 0.048], [0.069, 0.075, 0.074], C.redEnamel);
  box("Changer motor cap", [0.174, 1.275, 0.049], [0.077, 0.012, 0.078], C.chrome);
  b.rod([0.174, 1.26, 0.063], [0.174, 1.399, 0.063], 0.012, {
    name: "Pickup arm column", color: C.chrome, bone, sides: 8
  });
  disc("Transfer arm pivot", [0.174, 1.399, 0.102], 0.023, 0.023, C.chrome);
  disc("Pivot red centre", [0.174, 1.399, 0.116], 0.010, 0.005, C.redEnamel);
  b.frustumBox([0.174, 1.399, 0.10], [0.063, 1.47, 0.124], [0.023, 0.016], [0.018, 0.014], {
    name: "Angled pickup arm", color: C.chrome, bone, up: [0, 0, 1]
  });
  b.frustumBox([0.063, 1.47, 0.124], [-0.047, 1.503, 0.143], [0.018, 0.014], [0.012, 0.013], {
    name: "Pickup arm upper linkage", color: C.bright, bone, up: [0, 0, 1]
  });
  disc("Upper linkage rivet", [0.063, 1.47, 0.137], 0.007, 0.005, C.brass);
  for (const z of [0.130, 0.153]) {
    b.sweep(polyline([
      [-0.047, 1.503, z], [-0.071, 1.518, z], [-0.087, 1.499, z]
    ]), 0.004, {
      name: "Record gripping fork", color: C.chrome, bone, sides: 6, caps: "round"
    });
  }

  const gearAt: P = [0.174, 1.304, 0.112];
  disc("Changer gear", gearAt, 0.026, 0.012, C.brass);
  b.ring(frame(gearAt, [0, 0, 1]), { count: 12, radius: 0.027 }, item => {
    b.stick(new THREE.BoxGeometry(0.007, 0.007, 0.012), C.brass, item, {
      name: "Gear tooth", bone, flow: [0, 0, 1], embed: 0.15
    });
  });
  disc("Gear axle", [0.174, 1.304, 0.121], 0.007, 0.007, C.bright);

  // Curved glass, seated inside a chrome arch and sill.
  const glassMat = b.material(C.glass);
  glassMat.transparent = true;
  glassMat.opacity = 0.16;
  glassMat.depthWrite = false;
  glassMat.roughness = 0.12;
  glassMat.metalness = 0.12;

  const glassPositions: number[] = [];
  const glassIndices: number[] = [];
  const cols = 16, rows = 12, gr = 0.273, bottom = 1.137;
  for (let j = 0; j <= rows; j++) {
    const v = j / rows;
    for (let i = 0; i <= cols; i++) {
      const u = -1 + 2 * i / cols;
      const x = gr * u;
      const top = cy + Math.sqrt(Math.max(0, gr * gr - x * x));
      const y = bottom + (top - bottom) * v;
      const z = 0.293 + 0.042 * (1 - u * u) * Math.sin(Math.PI * v);
      glassPositions.push(x, y, z);
    }
  }
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const a = j * (cols + 1) + i;
      glassIndices.push(a, a + 1, a + cols + 2, a, a + cols + 2, a + cols + 1);
    }
  }
  const glassGeo = new THREE.BufferGeometry();
  glassGeo.setAttribute("position", new THREE.Float32BufferAttribute(glassPositions, 3));
  glassGeo.setIndex(glassIndices);
  glassGeo.computeVertexNormals();
  const glass = b.part(glassGeo, C.glass, { name: "Domed glass window", at: [0, 0, 0], bone });

  const windowRim = archPoints(0.286, 1.125, 0.294);
  b.sweep(polyline(windowRim, { closed: true }), 0.012, {
    name: "Chrome window arch and sill", color: C.chrome, bone, sides: 8
  });
  box("Window sill reflection", [0, 1.126, 0.307], [0.543, 0.004, 0.005], C.bright);

  const reflectionTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 440">
      <path d="M81 365 L81 209 Q81 85 220 46" fill="none" stroke="#ffffff" stroke-width="13"/>
      <path d="M107 335 L107 216 Q107 111 213 75" fill="none" stroke="#ffffff" stroke-width="3"/>
      <path d="M496 249 Q493 126 419 87" fill="none" stroke="#ffffff" stroke-width="5"/>
    </svg>`, { size: 512 }
  );
  const reflections = b.decal(b.surface(glass), reflectionTexture, {
    name: "Soft curved glass reflections", at: [0, 1.345, 0.34],
    dir: [0, 0, 1], size: [0.521, 0.395],
    segments: [16, 12], lift: 0.0008, bone
  });
  const reflectionMat = reflections.mesh.material as THREE.MeshStandardMaterial;
  reflectionMat.transparent = true;
  reflectionMat.opacity = 0.24;
  reflectionMat.depthWrite = false;
  reflectionMat.alphaTest = 0.1;
  reflectionMat.roughness = 0.12;

  // Winged crown emblem.
  plate("Winged chrome marque", [
    [-0.135, -0.015], [-0.095, -0.027], [-0.067, -0.031],
    [0.067, -0.031], [0.095, -0.027], [0.135, -0.015],
    [0.113, 0.004], [0.080, 0.011], [0.064, 0.035],
    [-0.064, 0.035], [-0.080, 0.011], [-0.113, 0.004]
  ], [0, 1.682, 0.35], 0.022, C.chrome, 0.005);
  plate("Red crown enamel", chamferRect(0.169, 0.049, 0.013), [0, 1.684, 0.368], 0.012, C.wine, 0.003);
  textPlate("Starlite crown lettering",
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 120">
      <text x="220" y="73" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-weight="bold" font-size="77" fill="#f9e6b7">Starlite</text>
      <text x="220" y="108" text-anchor="middle" font-family="Arial,sans-serif" letter-spacing="5" font-size="18" fill="#e5bc73">AUTOMATIC 1957</text>
    </svg>`, [0, 1.685, 0.376], 0.153, 0.041);
  for (const s of [-1, 1]) {
    for (let k = 0; k < 2; k++) {
      b.rod([s * 0.088, 1.683 - k * 0.008, 0.366],
        [s * 0.118, 1.674 - k * 0.004, 0.366], 0.002, {
          name: "Crown wing engraving", color: C.brass, bone, sides: 5
        });
    }
  }
  b.slab([
    [0, 1.762, 0.301], [0.006, 1.747, 0.301], [0.022, 1.741, 0.301],
    [0.006, 1.735, 0.301], [0, 1.719, 0.301], [-0.006, 1.735, 0.301],
    [-0.022, 1.741, 0.301], [-0.006, 1.747, 0.301]
  ], { name: "Crown four point star", color: C.bright, thickness: 0.007, bone });

  // Selection console: raised chrome buttons and separately framed paper cards.
  plate("Selection console chrome casting", chamferRect(0.59, 0.28, 0.021),
    [0, 0.995, 0.316], 0.076, C.chrome, 0.012);
  plate("Selection console dark inset", chamferRect(0.556, 0.249, 0.009),
    [0, 0.996, 0.358], 0.013, C.dark, 0.003);

  const tunes = [
    ["MIDNIGHT", "SPECIAL"], ["CHERRY", "SODA"], ["BLUE MOON", "WALTZ"], ["SHAKE", "RATTLE"],
    ["SWEET", "SIXTEEN"], ["ROUTE 66", "BOOGIE"], ["DREAM", "A LITTLE"], ["LOVE ME", "TENDER"],
    ["TEENAGE", "HEART"], ["MOONLIGHT", "SERENADE"], ["SUGAR", "SHUFFLE"], ["ALL NIGHT", "LONG"],
    ["SUMMER", "KISSES"], ["ROCKIN'", "ROBIN"], ["HONEY", "HUSH"], ["STAR DUST", "MELODY"],
    ["DINER", "DARLING"], ["LITTLE", "SUZIE"], ["GOLDEN", "MEMORIES"], ["JUMP", "AND JIVE"],
    ["SLOW", "DANCIN'"], ["SATURDAY", "NIGHT"], ["ONLY", "YOU"], ["GOODNIGHT", "SWEETHEART"]
  ];
  let atlasMarkup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 210">`;
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 8; col++) {
      const x = col * 120, y = row * 70;
      const tune = tunes[row * 8 + col];
      atlasMarkup += `
        <rect x="${x}" y="${y}" width="120" height="70" fill="#fff3d5"/>
        <rect x="${x + 3}" y="${y + 3}" width="114" height="64" fill="none" stroke="#c4ab7c" stroke-width="2"/>
        <text x="${x + 8}" y="${y + 18}" font-family="Arial,sans-serif" font-size="13" font-weight="bold" fill="#a72d39">${"ABC"[row]}${col + 1}</text>
        <text x="${x + 64}" y="${y + 34}" text-anchor="middle" font-family="Arial,sans-serif" font-size="12" font-weight="bold" fill="#243a40">${tune[0]}</text>
        <text x="${x + 64}" y="${y + 51}" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" fill="#243a40">${tune[1]}</text>
        <path d="M${x + 29} ${y + 60}H${x + 98}" stroke="#c4ab7c" stroke-width="1"/>
      `;
    }
  }
  atlasMarkup += `</svg>`;
  const titleAtlas = svg(atlasMarkup, { size: 2048 });
  const rowY = [1.074, 0.997, 0.920];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 8; col++) {
      const x = (col - 3.5) * 0.067;
      const y = rowY[row] + 0.006;
      box("Chrome title card frame", [x, y, 0.374], [0.061, 0.035, 0.01], C.chrome);
      const geo = new THREE.PlaneGeometry(0.0555, 0.0285);
      const uv = geo.getAttribute("uv");
      for (let k = 0; k < uv.count; k++) {
        uv.setXY(k, (col + uv.getX(k)) / 8, (2 - row + uv.getY(k)) / 3);
      }
      b.part(geo, "#ffffff", {
        name: `Paper title ${"ABC"[row]}${col + 1}`,
        at: [x, y, 0.380], bone, texture: titleAtlas
      });
      plate(`Chrome selection button ${"ABC"[row]}${col + 1}`,
        chamferRect(0.05, 0.019, 0.005), [x, rowY[row] - 0.025, 0.381],
        0.026, C.bright, 0.004);
      box("Button inset indicator", [x, rowY[row] - 0.025, 0.395],
        [0.013, 0.0022, 0.001], C.shadowChrome);
    }
  }
  textPlate("Console header",
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 50">
      <text x="350" y="35" text-anchor="middle" font-family="Arial,sans-serif" font-size="26" letter-spacing="5" font-weight="bold" fill="#f2deb1">MAKE YOUR SELECTION • 45 RPM</text>
    </svg>`, [0, 1.116, 0.373], 0.43, 0.023);
  for (const x of [-0.278, 0.278]) {
    for (const y of [0.875, 1.116]) screw([x, y, 0.358], 0.004);
  }

  // Coin fascia: a dark, recessed slit with its polished funnel and return button.
  plate("Coin fascia chrome", chamferRect(0.582, 0.068, 0.01),
    [0, 0.805, 0.314], 0.05, C.chrome, 0.008);
  textPlate("Coin prices",
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 110">
      <text x="270" y="35" text-anchor="middle" font-family="Arial,sans-serif" font-size="23" letter-spacing="7" fill="#263c42">MUSIC FOR EVERY MOOD</text>
      <text x="270" y="88" text-anchor="middle" font-family="Georgia,serif" font-weight="bold" font-size="48" fill="#8d2934">5¢ · 10¢ · 25¢</text>
    </svg>`, [-0.08, 0.806, 0.341], 0.259, 0.052);
  plate("Coin slot raised surround", chamferRect(0.031, 0.052, 0.005),
    [0.152, 0.805, 0.344], 0.014, C.bright, 0.003);
  box("Coin slot darkness", [0.152, 0.805, 0.353], [0.007, 0.035, 0.003], C.black);
  box("Coin slot left bevel", [0.1475, 0.805, 0.355], [0.0015, 0.034, 0.0015], C.shadowChrome);
  disc("Coin return button rim", [0.229, 0.805, 0.344], 0.021, 0.008, C.shadowChrome);
  disc("Coin return button", [0.229, 0.805, 0.353], 0.015, 0.018, C.bright);
  box("Return button notch", [0.229, 0.805, 0.363], [0.013, 0.002, 0.001], C.dark);
  for (const x of [-0.276, 0.276]) screw([x, 0.805, 0.342], 0.0035);

  // Perforated champagne speaker cloth, under a sculptural metal starburst.
  const speakerOuter = [
    [-0.276, 0.739], [0.276, 0.739], [0.291, 0.637], [0.279, 0.331],
    [0.239, 0.209], [0.137, 0.157], [-0.137, 0.157],
    [-0.239, 0.209], [-0.279, 0.331], [-0.291, 0.637]
  ];
  const speakerInner = speakerOuter.map(([x, y]) => [x * 0.924, 0.448 + (y - 0.448) * 0.934]);
  plate("Speaker shield chrome bezel", speakerOuter, [0, 0, 0.303], 0.035, C.chrome, 0.009);

  const grillePaint = paint(p => {
    const spacing = 0.0093;
    const qy = p.y / spacing;
    const iy = Math.round(qy);
    const qx = p.x / spacing - (Math.abs(iy % 2) ? 0.5 : 0);
    const dx = qx - Math.round(qx);
    const dy = qy - iy;
    const d = dx * dx + dy * dy;
    if (d < 0.122) return "#182e32";
    if (d < 0.155 && dy < 0) return "#e4c48a";
    return "#b8945e";
  });
  b.extrude(speakerInner, {
    name: "Fine perforated speaker grille", at: [0, 0, 0.326],
    x: [1, 0, 0], y: [0, 1, 0], color: grillePaint,
    thickness: 0.011, bone
  });
  b.sweep(polyline(speakerInner.map(([x, y]) => [x, y, 0.336]), { closed: true }), 0.005, {
    name: "Inner speaker piping", color: C.bright, bone, sides: 6
  });

  const hubY = 0.45;
  function spokeEnd(angle: number): [number, number] {
    const dx = Math.cos(angle), dy = Math.sin(angle);
    let reach = Infinity;
    for (let i = 0; i < speakerInner.length; i++) {
      const a = speakerInner[i], q = speakerInner[(i + 1) % speakerInner.length];
      const ex = q[0] - a[0], ey = q[1] - a[1];
      const vx = a[0], vy = a[1] - hubY;
      const det = dx * ey - dy * ex;
      if (Math.abs(det) < 1e-9) continue;
      const t = (vx * ey - vy * ex) / det;
      const u = (vx * dy - vy * dx) / det;
      if (t > 0 && u >= 0 && u <= 1) reach = Math.min(reach, t);
    }
    return [dx * (reach - 0.012), hubY + dy * (reach - 0.012)];
  }

  for (let i = 0; i < 20; i++) {
    const a = Math.PI / 2 + i * Math.PI * 2 / 20;
    const dx = Math.cos(a), dy = Math.sin(a), px = -dy, py = dx;
    const end = spokeEnd(a);
    const sx = dx * 0.051, sy = hubY + dy * 0.051;
    const near = 0.0035, far = i % 2 ? 0.007 : 0.012;
    b.slab([
      [sx + px * near, sy + py * near, 0.348],
      [end[0] + px * far, end[1] + py * far, 0.348],
      [end[0] - px * far, end[1] - py * far, 0.348],
      [sx - px * near, sy - py * near, 0.348]
    ], {
      name: "Tapered starburst ray", color: i % 2 ? C.brass : C.chrome,
      thickness: 0.009, bone
    });
    const between = a + Math.PI / 20;
    const fineEnd = spokeEnd(between);
    b.rod([Math.cos(between) * 0.066, hubY + Math.sin(between) * 0.066, 0.342],
      [fineEnd[0], fineEnd[1], 0.342], 0.0018, {
        name: "Fine starburst filament", color: C.bright, bone, sides: 5
      });
  }

  disc("Starburst medallion base", [0, hubY, 0.356], 0.067, 0.021, C.chrome);
  torus("Medallion polished rim", [0, hubY, 0.372], 0.058, 0.005, C.bright);
  disc("Medallion red enamel", [0, hubY, 0.375], 0.052, 0.008, C.wine);
  const starPoints: number[][] = [];
  for (let i = 0; i < 10; i++) {
    const a = Math.PI / 2 + i * Math.PI / 5;
    const r = i % 2 ? 0.018 : 0.043;
    starPoints.push([Math.cos(a) * r, hubY + Math.sin(a) * r, 0.385]);
  }
  b.slab(starPoints, { name: "Chrome five point speaker star", color: C.bright, thickness: 0.006, bone });
  disc("Star centre gold pin", [0, hubY, 0.390], 0.004, 0.004, C.brass);

  plate("High fidelity badge surround", chamferRect(0.192, 0.029, 0.006),
    [0, 0.738, 0.345], 0.014, C.chrome, 0.003);
  textPlate("High fidelity badge",
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 80">
      <rect width="640" height="80" rx="12" fill="#16353b"/>
      <text x="320" y="54" text-anchor="middle" font-family="Arial,sans-serif" letter-spacing="7" font-size="35" fill="#f4dbac">HIGH FIDELITY</text>
    </svg>`, [0, 0.738, 0.353], 0.177, 0.022);

  // Finished rear: recessed service door, cooling vents, hinges and data badge.
  plate("Rear service door", chamferRect(0.563, 0.9, 0.032),
    [0, 0.698, -0.311], 0.018, C.redEnamel, 0.005);
  b.sweep(polyline([
    [-0.267, 0.273, -0.323], [0.267, 0.273, -0.323],
    [0.267, 1.12, -0.323], [-0.267, 1.12, -0.323]
  ], { closed: true }), 0.0035, {
    name: "Rear service door trim", color: C.shadowChrome, bone, sides: 6
  });
  for (let i = 0; i < 10; i++) {
    box("Rear cooling louvre", [0, 0.698 + i * 0.032, -0.324], [0.41, 0.011, 0.009], C.dark);
    box("Rear louvre lower lip", [0, 0.694 + i * 0.032, -0.329], [0.409, 0.002, 0.004], C.shadowChrome);
  }
  for (const y of [0.381, 1.063]) {
    box("Service door hinge", [-0.266, y, -0.328], [0.022, 0.068, 0.014], C.chrome);
    b.rod([-0.266, y - 0.031, -0.339], [-0.266, y + 0.031, -0.339], 0.005, {
      name: "Hinge pin", color: C.bright, bone, sides: 6
    });
  }
  for (const x of [-0.241, 0.241]) {
    for (const y of [0.298, 1.098]) screw([x, y, -0.325], 0.004, true);
  }
  disc("Rear service lock", [0.234, 0.535, -0.332], 0.013, 0.009, C.chrome, [0, 0, -1]);
  box("Rear lock keyhole", [0.234, 0.535, -0.338], [0.003, 0.011, 0.002], C.black);
  textPlate("Manufacturer rear badge",
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 240">
      <rect x="4" y="4" width="492" height="232" rx="8" fill="#d9c18b" stroke="#586870" stroke-width="8"/>
      <text x="250" y="66" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-weight="bold" font-size="53" fill="#702731">Starlite</text>
      <text x="250" y="111" text-anchor="middle" font-family="Arial,sans-serif" letter-spacing="5" font-size="22" fill="#283b40">AUTOMATIC PHONOGRAPH</text>
      <text x="250" y="157" text-anchor="middle" font-family="Arial,sans-serif" font-size="27" fill="#283b40">MODEL 57 • 115 V • 60 CYCLE</text>
      <text x="250" y="206" text-anchor="middle" font-family="Arial,sans-serif" letter-spacing="3" font-size="23" fill="#283b40">SERIAL Nº 1957-024</text>
    </svg>`, [0, 0.47, -0.323], 0.234, 0.112, [0, 0, -1]);

  return b.root;
}
