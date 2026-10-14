import * as THREE from "three";

export const meta = {
  name: "Starlite 1954 Jukebox",
  description:
    "A chrome-laden diner jukebox with three luminous colored arches, a domed record-changer window, illustrated song cards, and a silver-and-brass starburst speaker grille.",
};

export default function buildJukebox(): THREE.Object3D {
  const root = new THREE.Group();
  root.name = "STARLITE • 1954";

  let seed = 19540917;
  function random() {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  }

  function material(
    color: string,
    roughness = 0.45,
    metalness = 0,
    extra: THREE.MeshStandardMaterialParameters = {}
  ) {
    return new THREE.MeshStandardMaterial({
      color,
      roughness,
      metalness,
      flatShading: true,
      ...extra,
    });
  }

  const chrome = material("#d7e2e5", 0.19, 0.8);
  const darkChrome = material("#58676e", 0.29, 0.74);
  const brass = material("#d6ad63", 0.27, 0.72);
  const burgundy = material("#64202d", 0.3, 0.22, { side: THREE.DoubleSide });
  const cherry = material("#963543", 0.31, 0.17);
  const walnut = material("#613a32", 0.55);
  const teal = material("#163e43", 0.36, 0.22);
  const black = material("#10171c", 0.54);
  const vinyl = material("#171b24", 0.34, 0.23);
  const groove = material("#424750", 0.38, 0.36);
  const cream = material("#f3e0b6", 0.52);
  const paperRed = material("#cb5146", 0.48);
  const rubber = material("#22242a", 0.88);

  const redTube = material("#ef413b", 0.24, 0.12, {
    emissive: "#f32724",
    emissiveIntensity: 0.85,
  });
  const amberTube = material("#ffb333", 0.25, 0.1, {
    emissive: "#ff8c18",
    emissiveIntensity: 0.8,
  });
  const tealTube = material("#30d4c5", 0.24, 0.1, {
    emissive: "#17bcae",
    emissiveIntensity: 0.85,
  });
  const redCore = material("#ffad91", 0.3, 0, {
    emissive: "#ff8971",
    emissiveIntensity: 1.3,
  });
  const amberCore = material("#fff0a6", 0.3, 0, {
    emissive: "#ffd982",
    emissiveIntensity: 1.2,
  });
  const tealCore = material("#b9fff0", 0.3, 0, {
    emissive: "#8af5e1",
    emissiveIntensity: 1.1,
  });
  const glass = material("#c8e8ec", 0.13, 0.04, {
    transparent: true,
    opacity: 0.14,
    depthWrite: false,
    side: THREE.DoubleSide,
    flatShading: false,
  });
  const reflection = material("#f0ffff", 0.24, 0, {
    transparent: true,
    opacity: 0.54,
    depthWrite: false,
    emissive: "#c8ffff",
    emissiveIntensity: 0.18,
  });

  type Parent = THREE.Object3D;

  function mesh(
    geometry: THREE.BufferGeometry,
    mat: THREE.Material,
    x = 0,
    y = 0,
    z = 0,
    parent: Parent = root
  ) {
    const object = new THREE.Mesh(geometry, mat);
    object.position.set(x, y, z);
    object.castShadow = mat !== glass && mat !== reflection;
    object.receiveShadow = mat !== glass && mat !== reflection;
    parent.add(object);
    return object;
  }

  function box(
    w: number, h: number, d: number,
    x: number, y: number, z: number,
    mat: THREE.Material, parent: Parent = root
  ) {
    return mesh(new THREE.BoxGeometry(w, h, d), mat, x, y, z, parent);
  }

  function cylinder(
    r: number, h: number,
    x: number, y: number, z: number,
    mat: THREE.Material, parent: Parent = root, segments = 16
  ) {
    return mesh(new THREE.CylinderGeometry(r, r, h, segments), mat, x, y, z, parent);
  }

  function cylinderZ(
    r: number, depth: number,
    x: number, y: number, z: number,
    mat: THREE.Material, parent: Parent = root, segments = 16
  ) {
    const object = cylinder(r, depth, x, y, z, mat, parent, segments);
    object.rotation.x = Math.PI / 2;
    return object;
  }

  function sphere(
    radius: number,
    x: number, y: number, z: number,
    mat: THREE.Material, parent: Parent = root
  ) {
    return mesh(new THREE.SphereGeometry(radius, 12, 8), mat, x, y, z, parent);
  }

  function rod(
    a: THREE.Vector3,
    b: THREE.Vector3,
    radius: number,
    mat: THREE.Material,
    parent: Parent = root,
    endRadius = radius,
    segments = 8
  ) {
    const direction = b.clone().sub(a);
    const object = mesh(
      new THREE.CylinderGeometry(endRadius, radius, direction.length(), segments),
      mat, 0, 0, 0, parent
    );
    object.position.copy(a).add(b).multiplyScalar(0.5);
    object.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      direction.normalize()
    );
    return object;
  }

  function torus(
    radius: number, tube: number,
    x: number, y: number, z: number,
    mat: THREE.Material,
    parent: Parent = root,
    arc = Math.PI * 2,
    segments = 48,
    radial = 8
  ) {
    return mesh(
      new THREE.TorusGeometry(radius, tube, radial, segments, arc),
      mat, x, y, z, parent
    );
  }

  function arch(
    radius: number, bottom: number, centerY: number, z: number,
    tube: number, mat: THREE.Material,
    parent: Parent = root
  ) {
    torus(radius, tube, 0, centerY, z, mat, parent, Math.PI, 40);
    for (const side of [-1, 1]) {
      cylinder(
        tube, centerY - bottom,
        side * radius, (centerY + bottom) / 2, z,
        mat, parent, 8
      );
    }
  }

  function halfDrum(
    radius: number, depth: number, centerY: number, z: number,
    mat: THREE.Material, openEnded = false, parent: Parent = root
  ) {
    const object = mesh(
      new THREE.CylinderGeometry(
        radius, radius, depth, 40, 1, openEnded,
        Math.PI / 2, Math.PI
      ),
      mat, 0, centerY, z, parent
    );
    object.rotation.x = Math.PI / 2;
    return object;
  }

  function archedPanel(
    radius: number, bottom: number, centerY: number,
    depth: number, z: number, mat: THREE.Material
  ) {
    box(radius * 2, centerY - bottom, depth, 0, (centerY + bottom) / 2, z, mat);
    halfDrum(radius, depth, centerY, z, mat);
  }

  function screw(x: number, y: number, z: number, parent: Parent = root, r = 0.004) {
    cylinderZ(r, 0.0035, x, y, z, chrome, parent, 8);
    const slot = box(r * 1.35, r * 0.24, 0.0009, x, y, z + 0.002, black, parent);
    slot.rotation.z = random() * Math.PI;
  }

  // One shared illustrated atlas for all lettering and song-title cards.
  type Rect = { x: number; y: number; w: number; h: number };
  const regions: Record<string, Rect> = {};
  let lettering: THREE.MeshStandardMaterial = cream;
  const doc = (globalThis as any).document;

  if (doc) {
    const canvas = doc.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#f3e0b6";
      ctx.fillRect(0, 0, 1024, 1024);

      function region(key: string, x: number, y: number, w: number, h: number, bg: string) {
        regions[key] = { x, y, w, h };
        ctx.fillStyle = bg;
        ctx.fillRect(x, y, w, h);
      }
      function text(
        str: string, x: number, y: number,
        font: string, color: string, align = "center"
      ) {
        ctx.font = font;
        ctx.fillStyle = color;
        ctx.textAlign = align;
        ctx.textBaseline = "middle";
        ctx.fillText(str, x, y);
      }

      region("logo", 0, 0, 760, 145, "#732331");
      ctx.strokeStyle = "#d6ad63";
      ctx.lineWidth = 5;
      ctx.strokeRect(10, 10, 740, 125);
      text("STARLITE", 380, 69, "italic bold 91px Georgia", "#fff0c6");
      text("★", 47, 72, "38px Georgia", "#d6ad63");
      text("★", 711, 72, "38px Georgia", "#d6ad63");
      text("AUTOMATIC MUSIC", 380, 122, "bold 18px sans-serif", "#e7b974");

      region("coin", 780, 0, 220, 145, "#163e43");
      text("10¢", 890, 63, "bold 82px Georgia", "#f3e0b6");
      text("ONE PLAY", 890, 122, "bold 24px sans-serif", "#f3e0b6");

      region("header", 0, 162, 1000, 67, "#f3e0b6");
      text(
        "POPULAR FAVORITES  •  10¢ ONE PLAY  •  25¢ THREE PLAYS",
        500, 197, "bold 28px sans-serif", "#752a34"
      );

      region("automatic", 0, 246, 740, 62, "#163e43");
      text("AUTOMATIC RECORD CHANGER", 370, 277, "bold 30px sans-serif", "#f3e0b6");

      const songs = [
        ["A1", "BLUE MOON", "THE MARCELS"],
        ["A2", "SHAKE, RATTLE & ROLL", "BILL HALEY & HIS COMETS"],
        ["A3", "EARTH ANGEL", "THE PENGUINS"],
        ["A4", "AT THE HOP", "DANNY & THE JUNIORS"],
        ["A5", "ONLY YOU", "THE PLATTERS"],
        ["B1", "ROCK AROUND THE CLOCK", "BILL HALEY & HIS COMETS"],
        ["B2", "DREAM LOVER", "BOBBY DARIN"],
        ["B3", "LOLLIPOP", "THE CHORDETTES"],
        ["B4", "LOVE ME TENDER", "ELVIS PRESLEY"],
        ["B5", "COME GO WITH ME", "THE DEL-VIKINGS"],
      ];
      songs.forEach((song, i) => {
        const x = i < 5 ? 0 : 512;
        const y = 330 + (i % 5) * 87;
        region(`song${i}`, x, y, 495, 78, i % 2 ? "#f3e7c9" : "#fff0d0");
        ctx.strokeStyle = "#b4a181";
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 3, y + 3, 489, 72);
        ctx.fillStyle = "#872d38";
        ctx.fillRect(x + 8, y + 8, 57, 62);
        text(song[0], x + 36, y + 39, "bold 27px sans-serif", "#fff0d0");
        text(song[1], x + 78, y + 28, "bold 23px Georgia", "#29282b", "left");
        text(song[2], x + 78, y + 56, "18px sans-serif", "#66554b", "left");
      });

      region("hifi", 0, 795, 740, 108, "#163e43");
      text("HI-FI  •  STEREOPHONIC", 370, 43 + 795, "bold 50px Georgia", "#f3e0b6");
      text("THE SOUND OF A NEW GENERATION", 370, 82 + 795, "21px sans-serif", "#d6ad63");

      region("star", 774, 790, 136, 136, "#732331");
      text("S", 842, 858, "italic bold 100px Georgia", "#f5dd9d");

      region("year", 0, 929, 600, 65, "#732331");
      text("★  STARLITE  •  1954  ★", 300, 962, "bold 34px Georgia", "#f3e0b6");

      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 4;
      lettering = material("#ffffff", 0.58, 0.02, { map: texture });
    }
  }

  function label(
    key: string, w: number, h: number,
    x: number, y: number, z: number,
    parent: Parent = root
  ) {
    const geometry = new THREE.PlaneGeometry(w, h);
    const rect = regions[key];
    if (rect) {
      const uv = geometry.attributes.uv;
      for (let i = 0; i < uv.count; i++) {
        uv.setXY(
          i,
          (rect.x + uv.getX(i) * rect.w) / 1024,
          1 - (rect.y + (1 - uv.getY(i)) * rect.h) / 1024
        );
      }
      uv.needsUpdate = true;
    }
    const object = mesh(geometry, lettering, x, y, z, parent);
    object.castShadow = false;
    return object;
  }

  // Cast base, recessed feet, and layered bumper trim.
  for (const x of [-0.385, 0.385]) {
    for (const z of [-0.235, 0.27]) {
      box(0.115, 0.05, 0.1, x, 0.025, z, rubber);
    }
  }
  box(1.048, 0.092, 0.728, 0, 0.094, 0.034, burgundy);
  box(1.056, 0.027, 0.738, 0, 0.07, 0.034, chrome);
  box(1.025, 0.014, 0.711, 0, 0.143, 0.033, darkChrome);
  box(0.929, 0.022, 0.019, 0, 0.159, 0.398, chrome);
  box(0.874, 0.006, 0.014, 0, 0.18, 0.39, brass);
  label("year", 0.21, 0.022, 0, 0.101, 0.405);

  // The solid rear cabinet ends behind the working display.
  const shoulderY = 1.11;
  box(1, 1.003, 0.5, 0, 0.6085, -0.08, burgundy);
  halfDrum(0.5, 0.5, shoulderY, -0.08, burgundy);

  // Front cabinet shell, leaving an actual open recess for the glass window.
  box(1, 0.847, 0.19, 0, 0.5305, 0.265, cherry);
  for (const side of [-1, 1]) {
    box(0.166, 0.156, 0.19, side * 0.417, 1.032, 0.265, burgundy);
  }
  mesh(
    new THREE.RingGeometry(0.334, 0.5, 40, 1, 0, Math.PI),
    burgundy, 0, shoulderY, 0.36
  );
  halfDrum(0.5, 0.19, shoulderY, 0.265, burgundy, true);
  halfDrum(0.334, 0.19, shoulderY, 0.265, burgundy, true);

  // Chrome surrounds, including a full rear edging visible from the sides.
  arch(0.5, 0.15, shoulderY, 0.365, 0.02, chrome);
  arch(0.496, 0.145, shoulderY, -0.335, 0.012, chrome);
  rod(
    new THREE.Vector3(-0.5, 0.152, 0.365),
    new THREE.Vector3(0.5, 0.152, 0.365),
    0.014, chrome
  );

  // The three nested, luminous horseshoes have a fine bright core and collars.
  const tubes = [
    { r: 0.465, t: 0.026, z: 0.385, mat: redTube, core: redCore, ct: 0.006 },
    { r: 0.421, t: 0.021, z: 0.392, mat: amberTube, core: amberCore, ct: 0.005 },
    { r: 0.382, t: 0.017, z: 0.398, mat: tealTube, core: tealCore, ct: 0.004 },
  ];
  tubes.forEach((t, index) => {
    arch(t.r, 0.202, shoulderY, t.z - 0.019, t.t + 0.006, chrome);
    arch(t.r, 0.205, shoulderY, t.z, t.t, t.mat);
    arch(t.r, 0.213, shoulderY, t.z + t.t * 0.88, t.ct, t.core);
    for (const side of [-1, 1]) {
      for (const y of [0.228, 0.764, 1.083]) {
        cylinder(t.t + 0.004, 0.022, side * t.r, y, t.z, chrome, root, 10);
        screw(side * t.r, y, t.z + t.t + 0.006, root, 0.003);
      }
    }
    if (index === 0) {
      for (const angle of [Math.PI / 4, 3 * Math.PI / 4]) {
        const point = new THREE.Vector3(
          t.r * Math.cos(angle), shoulderY + t.r * Math.sin(angle), t.z
        );
        const tangent = new THREE.Vector3(-Math.sin(angle), Math.cos(angle), 0);
        rod(
          point.clone().addScaledVector(tangent, -0.012),
          point.clone().addScaledVector(tangent, 0.012),
          t.t + 0.004, chrome, root, t.t + 0.004, 10
        );
      }
    }
  });

  // Walnut side doors: visible construction, louvres, and Art Deco ornaments.
  for (const side of [-1, 1]) {
    box(0.02, 0.864, 0.546, side * 0.505, 0.606, -0.018, walnut);
    for (const z of [-0.294, 0.258]) {
      box(0.012, 0.878, 0.012, side * 0.52, 0.606, z, chrome);
    }
    for (const y of [0.17, 1.044]) {
      box(0.012, 0.012, 0.561, side * 0.52, y, -0.018, darkChrome);
    }
    box(0.014, 0.178, 0.315, side * 0.52, 0.437, -0.028, black);
    for (let i = 0; i < 6; i++) {
      box(0.017, 0.006, 0.294, side * 0.531, 0.365 + i * 0.028, -0.028, darkChrome);
      box(0.006, 0.002, 0.29, side * 0.541, 0.368 + i * 0.028, -0.028, chrome);
    }
    const jewel = mesh(new THREE.OctahedronGeometry(1), brass, side * 0.532, 0.825, -0.024);
    jewel.scale.set(0.012, 0.071, 0.043);
    box(0.013, 0.009, 0.257, side * 0.53, 0.887, -0.024, chrome);
    box(0.013, 0.006, 0.193, side * 0.53, 0.903, -0.024, chrome);
    cylinderZ(0.008, 0.012, side * 0.446, 0.329, -0.347, darkChrome);
  }

  // A modest back service panel and cooling slots complete the cabinet.
  box(0.807, 0.775, 0.017, 0, 0.618, -0.34, walnut);
  for (let i = 0; i < 8; i++) {
    box(0.481, 0.009, 0.005, 0, 0.777 + i * 0.021, -0.351, black);
  }

  // Dark central apron, below the record-viewing cavity.
  box(0.707, 0.771, 0.023, 0, 0.5685, 0.367, teal);

  // Oval perforated speaker cloth.
  let grilleMat: THREE.MeshStandardMaterial = teal;
  if (doc) {
    const fabric = doc.createElement("canvas");
    fabric.width = fabric.height = 256;
    const ctx = fabric.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#526260";
      ctx.fillRect(0, 0, 256, 256);
      for (let y = -12; y < 268; y += 12) {
        for (let x = -12; x < 268; x += 12) {
          const xx = x + ((Math.round(y / 12) & 1) ? 6 : 0);
          ctx.fillStyle = "#15292d";
          ctx.beginPath();
          ctx.ellipse(xx, y, 3.9, 4.3, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#8b9381";
          ctx.fillRect(xx - 2, y - 5, 4, 1);
        }
      }
      const texture = new THREE.CanvasTexture(fabric);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(2, 2);
      texture.anisotropy = 4;
      grilleMat = material("#ffffff", 0.71, 0.19, { map: texture });
    }
  }

  const speakerY = 0.431;
  const cloth = mesh(new THREE.CircleGeometry(1, 48), grilleMat, 0, speakerY, 0.387);
  cloth.scale.set(0.299, 0.212, 1);
  const outerRim = torus(1, 0.035, 0, speakerY, 0.394, chrome);
  outerRim.scale.set(0.308, 0.218, 0.23);
  const innerRim = torus(1, 0.012, 0, speakerY, 0.401, brass);
  innerRim.scale.set(0.293, 0.207, 0.44);

  // Tapered metallic rays rise off the grille, terminating on an ellipse.
  for (let i = 0; i < 24; i++) {
    const angle = (i / 24) * Math.PI * 2;
    const ux = Math.cos(angle);
    const uy = Math.sin(angle);
    const length = 1 / Math.sqrt((ux / 0.283) ** 2 + (uy / 0.197) ** 2);
    rod(
      new THREE.Vector3(ux * 0.032, speakerY + uy * 0.032, 0.409),
      new THREE.Vector3(ux * length, speakerY + uy * length, 0.409),
      i % 3 === 0 ? 0.009 : 0.006,
      i % 3 === 0 ? brass : chrome,
      root, 0.0028, 6
    );
  }

  // Eight pointed, faceted central star and a ruby-colored monogram hub.
  for (let i = 0; i < 8; i++) {
    const angle = i * Math.PI / 4;
    const diamond = mesh(
      new THREE.OctahedronGeometry(1),
      i % 2 ? chrome : brass,
      Math.sin(angle) * 0.022,
      speakerY + Math.cos(angle) * 0.022,
      0.422
    );
    diamond.scale.set(0.018, i % 2 ? 0.052 : 0.066, 0.01);
    diamond.rotation.z = -angle;
  }
  cylinderZ(0.033, 0.013, 0, speakerY, 0.433, brass, root, 12);
  cylinderZ(0.0255, 0.013, 0, speakerY, 0.444, burgundy, root, 12);
  label("star", 0.035, 0.035, 0, speakerY, 0.451);

  // Chrome selector console, gently sloping up toward the display.
  const selector = new THREE.Group();
  selector.name = "Song selector";
  selector.position.set(0, 0.825, 0.375);
  selector.rotation.x = -0.07;
  root.add(selector);
  box(0.66, 0.265, 0.049, 0, 0, 0, chrome, selector);
  box(0.642, 0.245, 0.01, 0, 0, 0.029, cream, selector);
  box(0.647, 0.008, 0.009, 0, -0.119, 0.039, brass, selector);
  label("header", 0.596, 0.0185, 0, 0.105, 0.036, selector);

  for (let bank = 0; bank < 2; bank++) {
    const bx = bank === 0 ? -0.157 : 0.157;
    box(0.297, 0.199, 0.01, bx, -0.016, 0.037, darkChrome, selector);
    for (let row = 0; row < 5; row++) {
      const y = 0.059 - row * 0.038;
      box(0.228, 0.031, 0.006, bx - 0.027, y, 0.044, chrome, selector);
      label(`song${bank * 5 + row}`, 0.22, 0.0265, bx - 0.027, y, 0.048, selector);
      box(0.034, 0.03, 0.016, bx + 0.118, y, 0.048, black, selector);
      box(0.0305, 0.026, 0.014, bx + 0.118, y, 0.056, chrome, selector);
      box(0.021, 0.004, 0.002, bx + 0.118, y + 0.005, 0.064, cream, selector);
      box(0.008, 0.003, 0.002, bx + 0.118, y - 0.006, 0.064, paperRed, selector);
    }
  }
  for (const x of [-0.311, 0.311]) {
    for (const y of [-0.112, 0.112]) screw(x, y, 0.038, selector, 0.0032);
  }

  // Small badge and separate coin mechanism immediately under the keyboard.
  box(0.379, 0.049, 0.014, -0.041, 0.67, 0.405, brass);
  box(0.365, 0.038, 0.008, -0.041, 0.67, 0.416, chrome);
  label("hifi", 0.353, 0.033, -0.041, 0.67, 0.421);
  box(0.054, 0.008, 0.012, -0.262, 0.676, 0.412, chrome);
  box(0.039, 0.006, 0.012, -0.255, 0.663, 0.412, chrome);

  const coin = new THREE.Group();
  coin.name = "Coin slot and return";
  coin.position.set(0.263, 0.662, 0.428);
  root.add(coin);
  box(0.111, 0.064, 0.018, 0, 0, 0, chrome, coin);
  box(0.093, 0.049, 0.009, 0, 0, 0.012, teal, coin);
  box(0.014, 0.039, 0.007, -0.024, 0.005, 0.019, chrome, coin);
  box(0.005, 0.032, 0.002, -0.024, 0.005, 0.023, black, coin);
  label("coin", 0.039, 0.025, 0.017, 0.01, 0.019, coin);
  cylinderZ(0.009, 0.008, 0.018, -0.017, 0.022, chrome, coin, 12);
  cylinderZ(0.0045, 0.002, 0.018, -0.017, 0.027, darkChrome, coin, 10);
  sphere(0.0035, 0.044, 0.022, 0.02, redTube, coin);
  screw(-0.047, -0.023, 0.012, coin, 0.0025);
  screw(0.047, -0.023, 0.012, coin, 0.0025);

  // Ivory interior makes the record changer easy to see through the lens.
  archedPanel(0.328, 0.954, shoulderY, 0.012, 0.18, cream);
  box(0.625, 0.024, 0.181, 0, 0.965, 0.277, darkChrome);
  box(0.593, 0.009, 0.162, 0, 0.982, 0.284, brass);

  // Guide pillars, platform, and nine individual vinyl records.
  for (const x of [-0.236, 0.076]) {
    cylinder(0.006, 0.212, x, 1.08, 0.23, brass, root, 8);
    sphere(0.009, x, 1.191, 0.23, chrome);
  }
  cylinder(0.147, 0.012, -0.08, 1.001, 0.326, brass, root, 32);
  cylinder(0.012, 0.232, -0.08, 1.107, 0.326, chrome, root, 10);

  for (let i = 0; i < 9; i++) {
    const y = 1.016 + i * 0.016;
    cylinder(0.137, 0.008, -0.08, y, 0.326, vinyl, root, 32);
    const rim = torus(0.132, 0.0011, -0.08, y + 0.0044, 0.326, groove, root, Math.PI * 2, 32, 4);
    rim.rotation.x = Math.PI / 2;
    cylinder(0.036, 0.0015, -0.08, y + 0.0048, 0.326, i % 3 ? cream : paperRed, root, 24);
    if (i === 8) {
      for (const r of [0.058, 0.071, 0.085, 0.102, 0.119]) {
        const ring = torus(r, 0.0008, -0.08, y + 0.0049, 0.326, groove, root, Math.PI * 2, 32, 4);
        ring.rotation.x = Math.PI / 2;
      }
    }
  }

  // One lifted record is tipped toward the viewer beneath the pickup hand.
  const liftedRecord = new THREE.Group();
  liftedRecord.position.set(-0.067, 1.239, 0.32);
  liftedRecord.rotation.x = 0.3;
  root.add(liftedRecord);
  cylinder(0.129, 0.006, 0, 0, 0, vinyl, liftedRecord, 32);
  cylinder(0.037, 0.0018, 0, 0.004, 0, paperRed, liftedRecord, 24);
  cylinder(0.010, 0.002, 0, 0.0054, 0, brass, liftedRecord, 12);
  for (const r of [0.052, 0.069, 0.087, 0.107, 0.124]) {
    const ring = torus(r, 0.0009, 0, 0.004, 0, groove, liftedRecord, Math.PI * 2, 32, 4);
    ring.rotation.x = Math.PI / 2;
  }

  // Visible motor, spindle and two-jointed automatic selection arm.
  cylinder(0.038, 0.065, 0.192, 1.022, 0.292, black, root, 12);
  cylinder(0.04, 0.009, 0.192, 1.059, 0.292, brass, root, 12);
  cylinder(0.017, 0.211, 0.192, 1.161, 0.292, chrome, root, 12);
  cylinder(0.025, 0.018, 0.192, 1.115, 0.292, darkChrome, root, 12);
  cylinderZ(0.031, 0.024, 0.192, 1.055, 0.335, brass, root, 12);
  cylinderZ(0.021, 0.026, 0.192, 1.055, 0.35, chrome, root, 12);
  cylinderZ(0.008, 0.029, 0.192, 1.055, 0.366, burgundy, root, 10);

  const jointA = new THREE.Vector3(0.192, 1.276, 0.292);
  const jointB = new THREE.Vector3(0.068, 1.322, 0.315);
  const jointC = new THREE.Vector3(-0.043, 1.272, 0.36);
  rod(jointA, jointB, 0.014, chrome, root, 0.012, 8);
  rod(jointB, jointC, 0.011, chrome, root, 0.009, 8);
  rod(
    jointA.clone().add(new THREE.Vector3(0, -0.017, 0.017)),
    jointB.clone().add(new THREE.Vector3(0, -0.017, 0.017)),
    0.004, brass
  );
  sphere(0.023, jointA.x, jointA.y, jointA.z, brass);
  sphere(0.019, jointB.x, jointB.y, jointB.z, darkChrome);
  cylinderZ(0.010, 0.019, jointB.x, jointB.y, jointB.z + 0.015, chrome, root, 10);
  box(0.043, 0.026, 0.036, jointC.x, 1.26, jointC.z, cream);
  box(0.026, 0.009, 0.027, jointC.x, 1.243, jointC.z, darkChrome);
  sphere(0.004, jointC.x + 0.012, 1.266, jointC.z + 0.019, paperRed);

  // Window sill and the little changer identification plate.
  rod(
    new THREE.Vector3(-0.313, 0.954, 0.372),
    new THREE.Vector3(0.313, 0.954, 0.372),
    0.012, chrome
  );
  box(0.29, 0.023, 0.008, -0.048, 0.977, 0.386, chrome);
  label("automatic", 0.272, 0.015, -0.048, 0.977, 0.391);

  // Upper badge floats inside the dome, above the moving arm.
  box(0.258, 0.052, 0.012, 0, 1.376, 0.382, brass);
  box(0.246, 0.043, 0.009, 0, 1.376, 0.391, chrome);
  label("logo", 0.236, 0.039, 0, 1.376, 0.396);
  for (const side of [-1, 1]) {
    rod(
      new THREE.Vector3(side * 0.14, 1.376, 0.377),
      new THREE.Vector3(side * 0.198, 1.365, 0.365),
      0.004, chrome
    );
    rod(
      new THREE.Vector3(side * 0.138, 1.364, 0.377),
      new THREE.Vector3(side * 0.183, 1.354, 0.365),
      0.003, brass
    );
  }

  // Cream gasket and polished window edging.
  mesh(
    new THREE.RingGeometry(0.326, 0.346, 40, 1, 0, Math.PI),
    cream, 0, shoulderY, 0.367
  );
  for (const side of [-1, 1]) {
    box(0.019, 0.156, 0.008, side * 0.337, 1.032, 0.367, cream);
  }
  arch(0.332, 0.954, shoulderY, 0.373, 0.011, chrome);

  // A real convex lens: quarter-ellipsoid dome over a curved lower pane.
  const dome = mesh(
    new THREE.SphereGeometry(1, 24, 12, 0, Math.PI, 0, Math.PI / 2),
    glass, 0, shoulderY, 0.366
  );
  dome.scale.set(0.326, 0.326, 0.115);
  dome.name = "Domed glass";
  const lowerGlass = mesh(
    new THREE.CylinderGeometry(1, 1, 0.156, 32, 1, true, -Math.PI / 2, Math.PI),
    glass, 0, 1.032, 0.366
  );
  lowerGlass.scale.set(0.326, 1, 0.115);

  // Short curved glints emphasize the lens without hiding the mechanism.
  function glassPoint(x: number, y: number) {
    const q = Math.max(0, 1 - (x / 0.326) ** 2 - ((y - shoulderY) / 0.326) ** 2);
    return new THREE.Vector3(x, y, 0.368 + 0.115 * Math.sqrt(q));
  }
  for (let i = 0; i < 6; i++) {
    const t0 = i / 6;
    const t1 = (i + 1) / 6;
    rod(
      glassPoint(-0.224 + 0.071 * t0, 1.254 + 0.075 * t0),
      glassPoint(-0.224 + 0.071 * t1, 1.254 + 0.075 * t1),
      0.0027, reflection, root, 0.0027, 6
    );
  }
  for (let i = 0; i < 3; i++) {
    rod(
      glassPoint(-0.258 + i * 0.005, 1.153 + i * 0.014),
      glassPoint(-0.258 + (i + 1) * 0.005, 1.153 + (i + 1) * 0.014),
      0.0016, reflection, root, 0.0016, 6
    );
  }

  return root;
}
