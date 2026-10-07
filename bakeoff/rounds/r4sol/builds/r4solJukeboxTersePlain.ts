import * as THREE from "three";

export const meta = {
  name: "Starlight ’57 Jukebox",
  description:
    "A freestanding, mid-century jukebox with a ribbed amber horseshoe, turquoise illumination, printed song cards, a visible record mechanism, and a brass sunburst speaker grille.",
};

export default function createModel(): THREE.Object3D {
  const root = new THREE.Group();
  root.name = "Starlight 57";

  const PI = Math.PI;
  const up = new THREE.Vector3(0, 1, 0);
  const normal = new THREE.Vector3(0, 0, 1);

  let seed = 5701015;
  function random(): number {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  }

  function material(
    color: string,
    roughness = 0.55,
    metalness = 0,
    extra: THREE.MeshStandardMaterialParameters = {}
  ): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color,
      roughness,
      metalness,
      flatShading: true,
      ...extra,
    });
  }

  const walnut = material("#613326", 0.62);
  const darkWood = material("#342321", 0.64);
  const woodInlay = material("#b26b3d", 0.52);
  const ivory = material("#eadbb9", 0.4);
  const pale = material("#fff2d0", 0.35);
  const teal = material("#247e7d", 0.43, 0.12);
  const deepTeal = material("#16474b", 0.53);
  const midnight = material("#10252f", 0.37);
  const rubber = material("#191d21", 0.9);
  const brass = material("#d4a456", 0.32, 0.65);
  const bronze = material("#846443", 0.6, 0.4);
  const chrome = material("#bfd5d1", 0.23, 0.78);
  const vinyl = material("#111820", 0.29, 0.12);
  const groove = material("#354149", 0.36, 0.15);
  const coral = material("#cf5543", 0.5);
  const cloth = material("#202e2b", 0.95);
  const thread = material("#615d46", 0.88);
  const amber = material("#f2aa44", 0.3, 0.05, {
    emissive: "#e57e1e",
    emissiveIntensity: 0.42,
  });
  const amberCore = material("#ffe6a0", 0.29, 0, {
    emissive: "#ffcf70",
    emissiveIntensity: 0.65,
  });
  const aqua = material("#77e3d8", 0.3, 0.05, {
    emissive: "#35a99e",
    emissiveIntensity: 0.5,
  });
  const glass = material("#b5ece4", 0.16, 0.05, {
    transparent: true,
    opacity: 0.085,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const reflection = material("#e6fff4", 0.25, 0, {
    transparent: true,
    opacity: 0.24,
    depthWrite: false,
  });

  function add(
    geometry: THREE.BufferGeometry,
    mat: THREE.Material,
    x = 0,
    y = 0,
    z = 0
  ): THREE.Mesh {
    const mesh = new THREE.Mesh(geometry, mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    root.add(mesh);
    return mesh;
  }

  function box(
    w: number,
    h: number,
    d: number,
    x: number,
    y: number,
    z: number,
    mat: THREE.Material
  ): THREE.Mesh {
    return add(new THREE.BoxGeometry(w, h, d), mat, x, y, z);
  }

  function cylinder(
    r: number,
    h: number,
    x: number,
    y: number,
    z: number,
    mat: THREE.Material,
    segments = 12
  ): THREE.Mesh {
    return add(
      new THREE.CylinderGeometry(r, r, h, segments, 1),
      mat,
      x,
      y,
      z
    );
  }

  function disc(
    r: number,
    depth: number,
    x: number,
    y: number,
    z: number,
    mat: THREE.Material,
    segments = 24
  ): THREE.Mesh {
    const mesh = cylinder(r, depth, x, y, z, mat, segments);
    mesh.rotation.x = PI / 2;
    return mesh;
  }

  function rod(
    a: THREE.Vector3,
    b: THREE.Vector3,
    radius: number,
    mat: THREE.Material,
    segments = 8
  ): THREE.Mesh {
    const delta = b.clone().sub(a);
    const mid = a.clone().add(b).multiplyScalar(0.5);
    const mesh = cylinder(
      radius,
      delta.length(),
      mid.x,
      mid.y,
      mid.z,
      mat,
      segments
    );
    mesh.quaternion.setFromUnitVectors(up, delta.normalize());
    return mesh;
  }

  function line(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    z: number,
    radius: number,
    mat: THREE.Material
  ): THREE.Mesh {
    return rod(
      new THREE.Vector3(x1, y1, z),
      new THREE.Vector3(x2, y2, z),
      radius,
      mat
    );
  }

  function torus(
    r: number,
    tube: number,
    x: number,
    y: number,
    z: number,
    mat: THREE.Material,
    arc = PI * 2,
    radialSegments = 6,
    tubularSegments = 32
  ): THREE.Mesh {
    return add(
      new THREE.TorusGeometry(r, tube, radialSegments, tubularSegments, arc),
      mat,
      x,
      y,
      z
    );
  }

  // A rectangular lower cabinet and a faceted half-cylinder dome.
  function archPlate(
    radius: number,
    spring: number,
    bottom: number,
    depth: number,
    z: number,
    mat: THREE.Material
  ): void {
    box(
      radius * 2,
      spring - bottom,
      depth,
      0,
      (spring + bottom) / 2,
      z,
      mat
    );
    const dome = add(
      new THREE.CylinderGeometry(
        radius,
        radius,
        depth,
        32,
        1,
        false,
        PI / 2,
        PI
      ),
      mat,
      0,
      spring,
      z
    );
    dome.rotation.x = PI / 2;
  }

  function archRail(
    radius: number,
    spring: number,
    bottom: number,
    z: number,
    tube: number,
    mat: THREE.Material
  ): void {
    torus(radius, tube, 0, spring, z, mat, PI, 8, 40);
    for (const side of [-1, 1]) {
      cylinder(
        tube,
        spring - bottom,
        side * radius,
        (spring + bottom) / 2,
        z,
        mat,
        8
      );
    }
  }

  function sparkle(
    x: number,
    y: number,
    z: number,
    size: number,
    mat: THREE.Material
  ): void {
    const vertical = add(new THREE.OctahedronGeometry(1, 0), mat, x, y, z);
    vertical.scale.set(size * 0.3, size, size * 0.17);
    const horizontal = add(new THREE.OctahedronGeometry(1, 0), mat, x, y, z);
    horizontal.scale.set(size * 0.83, size * 0.25, size * 0.17);
  }

  function screw(x: number, y: number, z: number): void {
    disc(0.0055, 0.003, x, y, z, chrome, 10);
    const slot = box(0.0065, 0.0012, 0.001, x, y, z + 0.002, darkWood);
    slot.rotation.z = -0.35;
  }

  // One shared lettering atlas: typography is printed on the primitive plates.
  type AtlasEntry = { y: number; height: number };
  const entries: Record<string, AtlasEntry> = {};
  let lettering: THREE.MeshStandardMaterial | null = null;
  const global = globalThis as any;
  const canvas: any = global.document
    ? global.document.createElement("canvas")
    : global.OffscreenCanvas
      ? new global.OffscreenCanvas(1024, 2048)
      : null;

  if (canvas) {
    canvas.width = 1024;
    canvas.height = 2048;
    const ctx: any = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, 1024, 2048);
      let cursor = 4;
      function entry(
        name: string,
        height: number,
        draw: (ctx: any) => void
      ): void {
        entries[name] = { y: cursor, height };
        ctx.save();
        ctx.translate(0, cursor);
        draw(ctx);
        ctx.restore();
        cursor += height + 6;
      }

      entry("title", 220, (c) => {
        c.textAlign = "center";
        c.fillStyle = "#f8eac0";
        c.font = "bold 147px Georgia, serif";
        c.fillText("STARLIGHT", 512, 145, 970);
        c.fillStyle = "#88d6cb";
        c.font = "35px Arial, sans-serif";
        c.fillText("S E L E C T  ·  P L A Y  ·  D A N C E", 512, 202, 910);
      });

      const songs = [
        ["A1", "BLUE MOON", "THE MIDNIGHTERS"],
        ["A2", "SATURDAY SWING", "THE STARLIGHT ORCHESTRA"],
        ["A3", "ONLY YOU", "THE VELVET VOICES"],
        ["A4", "MYSTERY TRAIN", "THE SUNSET TRIO"],
        ["B1", "SHAKE, RATTLE & ROLL", "THE RHYTHM KINGS"],
        ["B2", "EARTH ANGEL", "THE NIGHTINGALES"],
        ["B3", "JUKEBOX JIVE", "BILLY & THE COMETS"],
        ["B4", "DREAM A LITTLE DREAM", "ELLA & LOUIS"],
      ];
      songs.forEach((song, i) => {
        entry(`song${i}`, 120, (c) => {
          c.fillStyle = "#204d4c";
          c.textAlign = "center";
          c.font = "bold 66px Arial, sans-serif";
          c.fillText(song[0], 83, 83);
          c.fillRect(154, 20, 3, 80);
          c.textAlign = "left";
          c.font = "bold 46px Arial, sans-serif";
          c.fillText(song[1], 185, 53, 796);
          c.font = "28px Arial, sans-serif";
          c.fillText(song[2], 185, 94, 796);
        });
      });
      entry("coin", 100, (c) => {
        c.textAlign = "center";
        c.fillStyle = "#204d4c";
        c.font = "bold 51px Arial, sans-serif";
        c.fillText("2 PLAYS  •  25¢", 512, 72);
      });
      entry("keys", 80, (c) => {
        c.textAlign = "center";
        c.fillStyle = "#203e42";
        c.font = "bold 53px Arial, sans-serif";
        ["A1", "A2", "A3", "A4", "B1", "B2", "B3", "B4"].forEach(
          (s, i) => c.fillText(s, 64 + i * 128, 59)
        );
      });
      entry("badge", 140, (c) => {
        c.textAlign = "center";
        c.fillStyle = "#f3dfaf";
        c.font = "bold 75px Georgia, serif";
        c.fillText("HIGH FIDELITY", 512, 82, 960);
        c.font = "27px Arial, sans-serif";
        c.fillText("S T E R E O P H O N I C   S O U N D", 512, 125, 925);
      });
      entry("lip", 80, (c) => {
        c.textAlign = "center";
        c.fillStyle = "#e7d3a0";
        c.font = "43px Arial, sans-serif";
        c.fillText("45 RPM  ·  AUTOMATIC SELECTOR", 512, 57, 975);
      });
      entry("rear", 200, (c) => {
        c.textAlign = "center";
        c.fillStyle = "#eed7a2";
        c.font = "bold 70px Georgia, serif";
        c.fillText("STARLIGHT", 512, 76);
        c.font = "34px Arial, sans-serif";
        c.fillText("JUKEBOX COMPANY", 512, 130);
        c.font = "26px Arial, sans-serif";
        c.fillText("MODEL 57  •  SERIAL 0019  •  115 VOLTS", 512, 176);
      });

      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 8;
      lettering = material("#ffffff", 0.68, 0, {
        map: texture,
        transparent: true,
        alphaTest: 0.025,
        depthWrite: false,
      });
    }
  }

  function label(
    name: string,
    w: number,
    h: number,
    x: number,
    y: number,
    z: number,
    rotationY = 0
  ): void {
    if (!lettering || !entries[name]) return;
    const e = entries[name];
    const geometry = new THREE.PlaneGeometry(w, h);
    const uv = geometry.getAttribute("uv") as THREE.BufferAttribute;
    for (let i = 0; i < uv.count; i++) {
      uv.setXY(
        i,
        uv.getX(i),
        1 - (e.y + e.height) / 2048 + uv.getY(i) * e.height / 2048
      );
    }
    const mesh = add(geometry, lettering, x, y, z);
    mesh.rotation.y = rotationY;
    mesh.castShadow = false;
    mesh.renderOrder = 2;
  }

  // Low rubber feet and a broad, stepped plinth keep the cabinet grounded.
  for (const x of [-0.37, 0.37]) {
    for (const z of [-0.265, 0.265]) {
      box(0.115, 0.032, 0.12, x, 0.016, z, rubber);
    }
  }
  box(1.096, 0.094, 0.79, 0, 0.071, -0.005, darkWood);
  box(1.067, 0.022, 0.765, 0, 0.128, -0.005, brass);
  box(1.042, 0.032, 0.744, 0, 0.151, -0.005, walnut);
  box(1.065, 0.061, 0.037, 0, 0.086, 0.397, woodInlay);
  box(1.04, 0.009, 0.014, 0, 0.059, 0.418, chrome);
  box(0.984, 0.005, 0.01, 0, 0.111, 0.42, brass);
  box(0.238, 0.042, 0.014, 0, 0.109, 0.427, deepTeal);
  label("badge", 0.222, 0.032, 0, 0.109, 0.435);

  archPlate(0.5, 1.12, 0.139, 0.62, -0.046, walnut);
  archPlate(0.49, 1.12, 0.163, 0.036, 0.282, ivory);
  archPlate(0.398, 1.12, 0.181, 0.023, 0.31, deepTeal);
  archRail(0.501, 1.12, 0.165, 0.303, 0.012, chrome);
  archRail(0.475, 1.12, 0.19, 0.316, 0.009, brass);

  // The characteristic luminous horseshoe, including its ribbed sleeves.
  archRail(0.445, 1.12, 0.211, 0.336, 0.034, amber);
  archRail(0.445, 1.12, 0.212, 0.362, 0.0075, amberCore);
  archRail(0.393, 1.12, 0.201, 0.343, 0.0105, aqua);
  archRail(0.373, 1.12, 0.195, 0.335, 0.008, brass);

  function tubeBand(
    x: number,
    y: number,
    tangent: THREE.Vector3,
    mat: THREE.Material
  ): void {
    const band = torus(0.0355, 0.0031, x, y, 0.336, mat, 2 * PI, 4, 12);
    band.quaternion.setFromUnitVectors(normal, tangent.normalize());
  }

  for (const side of [-1, 1]) {
    cylinder(0.044, 0.064, side * 0.445, 0.2, 0.336, brass, 12);
    cylinder(0.04, 0.016, side * 0.445, 0.237, 0.336, ivory, 12);
    for (let i = 0; i < 9; i++) {
      tubeBand(side * 0.445, 0.292 + i * 0.094, up.clone(), bronze);
    }
    for (let i = 0; i < 9; i++) {
      const bubble = add(
        new THREE.IcosahedronGeometry(0.006 + random() * 0.003, 0),
        amberCore,
        side * 0.445 + (random() - 0.5) * 0.024,
        0.285 + i * 0.088 + random() * 0.025,
        0.365
      );
      bubble.scale.y = 1.35;
    }
  }

  for (let i = 0; i <= 18; i++) {
    const angle = (i / 18) * PI;
    tubeBand(
      0.445 * Math.cos(angle),
      1.12 + 0.445 * Math.sin(angle),
      new THREE.Vector3(-Math.sin(angle), Math.cos(angle), 0),
      i % 3 === 0 ? brass : bronze
    );
  }

  // Small crown clamp, interrupting the arch like a piece of jewelry.
  box(0.085, 0.047, 0.024, 0, 1.573, 0.365, brass);
  box(0.056, 0.033, 0.01, 0, 1.574, 0.383, deepTeal);
  sparkle(0, 1.575, 0.393, 0.013, pale);

  // Upper program window.
  archPlate(0.349, 1.12, 0.88, 0.032, 0.351, midnight);
  archRail(0.351, 1.12, 0.883, 0.416, 0.013, chrome);
  archRail(0.333, 1.12, 0.891, 0.429, 0.0065, brass);
  box(0.7, 0.027, 0.067, 0, 0.883, 0.394, chrome);
  box(0.666, 0.018, 0.012, 0, 0.886, 0.432, deepTeal);
  label("lip", 0.39, 0.014, 0, 0.886, 0.44);
  label("title", 0.387, 0.078, 0, 1.368, 0.404);
  sparkle(-0.239, 1.323, 0.406, 0.011, brass);
  sparkle(0.239, 1.323, 0.406, 0.011, brass);

  for (let col = 0; col < 2; col++) {
    for (let row = 0; row < 4; row++) {
      const x = col === 0 ? -0.15 : 0.15;
      const y = 1.262 - row * 0.047;
      box(0.279, 0.040, 0.014, x, y, 0.38, brass);
      box(0.269, 0.032, 0.009, x, y, 0.394, ivory);
      label(`song${col * 4 + row}`, 0.263, 0.0305, x, y, 0.4);
    }
  }

  // Visible record mechanism, behind the lower part of the glass.
  box(0.57, 0.023, 0.092, 0, 0.916, 0.37, bronze);
  box(0.55, 0.006, 0.014, 0, 0.929, 0.419, chrome);
  box(0.21, 0.084, 0.027, -0.035, 0.963, 0.361, darkWood);
  disc(0.086, 0.012, -0.018, 0.991, 0.394, vinyl, 32);
  for (const radius of [0.037, 0.046, 0.057, 0.068, 0.078]) {
    torus(radius, 0.00085, -0.018, 0.991, 0.401, groove, 2 * PI, 3, 32);
  }
  disc(0.029, 0.004, -0.018, 0.991, 0.404, coral, 24);
  torus(0.022, 0.0013, -0.018, 0.991, 0.407, ivory, 2 * PI, 4, 24);
  disc(0.008, 0.012, -0.018, 0.991, 0.414, brass, 10);
  disc(0.003, 0.012, -0.018, 0.991, 0.422, chrome, 8);

  // Tonearm with a hinged base and a cream pickup head.
  disc(0.021, 0.016, -0.208, 0.959, 0.396, brass, 12);
  disc(0.012, 0.02, -0.208, 0.959, 0.408, chrome, 12);
  line(-0.208, 0.959, -0.181, 1.044, 0.416, 0.006, chrome);
  line(-0.181, 1.044, -0.083, 1.042, 0.416, 0.006, chrome);
  const pickup = box(0.031, 0.016, 0.021, -0.075, 1.033, 0.417, ivory);
  pickup.rotation.z = -0.32;
  box(0.009, 0.008, 0.012, -0.064, 1.022, 0.42, vinyl);

  // A small rack of spare 45s, with alternating pale separator plates.
  box(0.132, 0.034, 0.103, 0.224, 0.933, 0.371, teal);
  for (let i = 0; i < 5; i++) {
    cylinder(0.057, 0.005, 0.224, 0.955 + i * 0.014, 0.367, vinyl, 20);
    cylinder(0.018, 0.0015, 0.224, 0.958 + i * 0.014, 0.367, coral, 16);
    box(0.12, 0.003, 0.01, 0.224, 0.951 + i * 0.014, 0.421, brass);
  }
  cylinder(0.004, 0.095, 0.224, 0.989, 0.367, chrome, 8);
  box(0.046, 0.043, 0.024, 0.127, 0.956, 0.386, chrome);
  disc(0.013, 0.006, 0.127, 0.962, 0.402, darkWood, 12);
  disc(0.005, 0.01, 0.127, 0.962, 0.41, brass, 8);

  // A single thin glass sheet, split into its rectangular and semicircular parts.
  const lowerGlass = add(
    new THREE.PlaneGeometry(0.657, 0.222),
    glass,
    0,
    1.009,
    0.434
  );
  lowerGlass.renderOrder = 3;
  lowerGlass.castShadow = false;
  const upperGlass = add(
    new THREE.CircleGeometry(0.3285, 32, 0, PI),
    glass,
    0,
    1.12,
    0.434
  );
  upperGlass.renderOrder = 3;
  upperGlass.castShadow = false;

  for (const [x, y, height] of [
    [-0.293, 1.27, 0.085],
    [-0.273, 1.287, 0.053],
    [0.298, 0.971, 0.102],
  ]) {
    const glint = add(
      new THREE.PlaneGeometry(0.006, height),
      reflection,
      x,
      y,
      0.437
    );
    glint.rotation.z = -0.28;
    glint.renderOrder = 4;
    glint.castShadow = false;
  }

  // Ivory selector deck with individually raised, eight-key buttons.
  box(0.724, 0.136, 0.071, 0, 0.814, 0.394, chrome);
  box(0.698, 0.118, 0.012, 0, 0.816, 0.433, ivory);
  box(0.696, 0.005, 0.014, 0, 0.873, 0.444, brass);
  box(0.696, 0.006, 0.014, 0, 0.757, 0.444, brass);
  label("coin", 0.265, 0.026, -0.093, 0.847, 0.441);

  disc(0.008, 0.006, -0.305, 0.848, 0.445, chrome, 12);
  disc(0.0048, 0.005, -0.305, 0.848, 0.45, aqua, 10);
  box(0.093, 0.036, 0.018, 0.257, 0.848, 0.446, chrome);
  box(0.064, 0.009, 0.003, 0.257, 0.85, 0.457, rubber);
  box(0.058, 0.0016, 0.003, 0.257, 0.845, 0.459, brass);
  line(0.218, 0.861, 0.226, 0.855, 0.459, 0.0015, deepTeal);
  line(0.226, 0.855, 0.234, 0.861, 0.459, 0.0015, deepTeal);

  for (let i = 0; i < 8; i++) {
    const x = -0.266 + i * 0.076;
    box(0.066, 0.053, 0.023, x, 0.792, 0.44, darkWood);
    box(0.060, 0.045, 0.027, x, 0.796, 0.452, pale);
    box(0.053, 0.004, 0.005, x, 0.816, 0.468, chrome);
  }
  label("keys", 0.608, 0.025, 0, 0.795, 0.468);

  for (const x of [-0.334, 0.334]) {
    screw(x, 0.765, 0.444);
    screw(x, 0.867, 0.444);
  }

  // Arched speaker cloth and a fine, visibly woven geometric grille.
  const speakerRadius = 0.332;
  const speakerSpring = 0.397;
  const speakerBottom = 0.207;
  archPlate(speakerRadius, speakerSpring, speakerBottom, 0.029, 0.355, cloth);
  archRail(0.342, speakerSpring, speakerBottom, 0.393, 0.011, brass);
  archRail(0.323, speakerSpring, speakerBottom + 0.004, 0.389, 0.005, bronze);
  box(0.678, 0.018, 0.041, 0, speakerBottom, 0.375, brass);

  const weaveRadius = 0.32;
  for (let x = -0.307; x <= 0.31; x += 0.015) {
    const top =
      speakerSpring + Math.sqrt(weaveRadius * weaveRadius - x * x) - 0.004;
    const bottom = speakerBottom + 0.012;
    box(0.0015, top - bottom, 0.002, x, (top + bottom) / 2, 0.374, thread);
  }
  for (let y = speakerBottom + 0.017; y < speakerSpring + 0.32; y += 0.015) {
    const halfWidth =
      y <= speakerSpring
        ? weaveRadius
        : Math.sqrt(
            Math.max(
              0,
              weaveRadius * weaveRadius - (y - speakerSpring) ** 2
            )
          );
    if (halfWidth > 0.012) {
      box(halfWidth * 2 - 0.008, 0.0015, 0.002, 0, y, 0.376, thread);
    }
  }

  // Brass sunburst: heavy ribs sit proud of the much finer woven background.
  for (let i = 1; i < 16; i++) {
    const angle = (i / 16) * PI;
    const endX = 0.314 * Math.cos(angle);
    const endY = speakerSpring + 0.314 * Math.sin(angle);
    line(0, 0.253, endX, endY, 0.4, i === 8 ? 0.008 : 0.0055, brass);
    if (i % 2 === 0) {
      line(0, 0.268, endX, endY - 0.008, 0.406, 0.002, pale);
    }
  }

  disc(0.043, 0.014, 0, 0.256, 0.417, chrome, 16);
  disc(0.032, 0.008, 0, 0.256, 0.43, brass, 16);
  disc(0.024, 0.006, 0, 0.256, 0.438, teal, 16);
  sparkle(0, 0.257, 0.445, 0.015, pale);

  const grilleJewel = add(
    new THREE.OctahedronGeometry(1, 0),
    chrome,
    0,
    0.534,
    0.42
  );
  grilleJewel.scale.set(0.036, 0.073, 0.014);
  const jewelInset = add(
    new THREE.OctahedronGeometry(1, 0),
    teal,
    0,
    0.534,
    0.434
  );
  jewelInset.scale.set(0.021, 0.047, 0.008);
  line(-0.087, 0.59, 0, 0.502, 0.421, 0.005, chrome);
  line(0.087, 0.59, 0, 0.502, 0.421, 0.005, chrome);
  sparkle(0, 0.535, 0.444, 0.012, pale);

  for (const side of [-1, 1]) {
    box(0.036, 0.071, 0.022, side * 0.364, 0.212, 0.34, ivory);
    box(0.043, 0.012, 0.027, side * 0.364, 0.18, 0.344, brass);
    screw(side * 0.362, 0.236, 0.355);
  }

  // The sides are substantial wooden cabinets, not a thin front facade.
  for (const side of [-1, 1]) {
    box(0.025, 0.948, 0.514, side * 0.507, 0.641, -0.058, darkWood);
    box(0.013, 0.907, 0.476, side * 0.525, 0.644, -0.058, walnut);

    // Inlaid edging along the side panel.
    box(0.007, 0.899, 0.009, side * 0.534, 0.644, -0.286, woodInlay);
    box(0.007, 0.899, 0.009, side * 0.534, 0.644, 0.171, woodInlay);
    box(0.007, 0.009, 0.456, side * 0.534, 0.203, -0.058, woodInlay);
    box(0.007, 0.009, 0.456, side * 0.534, 1.085, -0.058, woodInlay);

    box(0.008, 0.469, 0.326, side * 0.535, 0.662, -0.059, darkWood);
    for (let i = 0; i < 7; i++) {
      box(
        0.012,
        0.425,
        0.017,
        side * 0.542,
        0.662,
        -0.207 + i * 0.049,
        woodInlay
      );
    }

    box(0.009, 0.119, 0.297, side * 0.536, 0.995, -0.055, teal);
    for (const z of [-0.185, 0.075]) {
      box(0.02, 0.035, 0.027, side * 0.547, 0.991, z, brass);
    }
    rod(
      new THREE.Vector3(side * 0.566, 0.991, -0.183),
      new THREE.Vector3(side * 0.566, 0.991, 0.073),
      0.009,
      chrome,
      8
    );
    for (let i = 0; i < 3; i++) {
      box(
        0.009,
        0.005,
        0.405,
        side * 0.535,
        0.26 + i * 0.027,
        -0.058,
        brass
      );
    }
  }

  // Rear access door, vents, hinges, and a small factory plate.
  box(0.807, 0.888, 0.015, 0, 0.662, -0.364, darkWood);
  box(0.755, 0.831, 0.01, 0, 0.662, -0.377, walnut);
  for (let i = 0; i < 11; i++) {
    box(0.473, 0.012, 0.003, 0, 0.756 + i * 0.023, -0.385, rubber);
  }
  for (const x of [-0.383, 0.383]) {
    for (const y of [0.368, 0.959]) {
      box(0.028, 0.064, 0.016, x, y, -0.389, bronze);
      cylinder(0.007, 0.073, x, y, -0.4, brass, 8);
    }
  }
  box(0.235, 0.083, 0.008, 0, 0.548, -0.389, bronze);
  box(0.219, 0.069, 0.004, 0, 0.548, -0.396, darkWood);
  label("rear", 0.205, 0.061, 0, 0.548, -0.399, PI);
  disc(0.014, 0.009, 0.287, 0.545, -0.39, brass, 12);
  box(0.003, 0.011, 0.003, 0.287, 0.545, -0.397, rubber);
  box(0.288, 0.036, 0.007, 0, 0.256, -0.387, darkWood);

  return root;
}
