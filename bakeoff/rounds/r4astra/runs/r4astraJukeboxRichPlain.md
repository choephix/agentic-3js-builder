```ts
import * as THREE from "three";

export const meta = {
  name: "Starlite Select-O-Matic",
  description:
    "A jewel-toned 1950s diner jukebox with illuminated triple arches, a glazed record-changing mechanism, individually titled selections, and a chrome starburst speaker grille."
};

export default function (): THREE.Object3D {
  const root = new THREE.Group();
  root.name = "STARLITE — 1950s diner jukebox";

  const material = (
    color: string,
    metalness = 0,
    roughness = 0.45,
    extra: Partial<THREE.MeshStandardMaterialParameters> = {}
  ) => new THREE.MeshStandardMaterial({ color, metalness, roughness, ...extra });

  const wine = material("#571d2b", 0.3, 0.29, { side: THREE.DoubleSide });
  const wineLight = material("#812d37", 0.28, 0.31);
  const black = material("#121b20", 0.1, 0.57);
  const rubber = material("#17171b", 0, 0.85);
  const tealDark = material("#173e40", 0.25, 0.35, { side: THREE.DoubleSide });
  const chrome = material("#c7d5d9", 0.78, 0.21);
  const chromeBright = material("#edf3eb", 0.65, 0.19);
  const chromeDark = material("#63747b", 0.75, 0.3);
  const gold = material("#d8ad66", 0.65, 0.28);
  const grilleGold = material("#a38c60", 0.5, 0.44);
  const cream = material("#f4dfad", 0.12, 0.35);
  const vinyl = material("#141b22", 0.25, 0.32);
  const vinylEdge = material("#39424b", 0.3, 0.33);
  const red = material("#f14629", 0.12, 0.24, {
    emissive: "#f33013",
    emissiveIntensity: 0.7
  });
  const amber = material("#ffca60", 0.08, 0.25, {
    emissive: "#ffaf2d",
    emissiveIntensity: 0.72
  });
  const teal = material("#46ddc5", 0.1, 0.24, {
    emissive: "#15c9ae",
    emissiveIntensity: 0.62
  });
  const glass = material("#bee9e1", 0.03, 0.12, {
    transparent: true,
    opacity: 0.13,
    depthWrite: false,
    side: THREE.DoubleSide
  });
  const glassShine = material("#effff6", 0, 0.2, {
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
    emissive: "#bee6de",
    emissiveIntensity: 0.25
  });

  function mesh(
    geometry: THREE.BufferGeometry,
    mat: THREE.Material,
    x = 0,
    y = 0,
    z = 0,
    parent: THREE.Object3D = root
  ) {
    const m = new THREE.Mesh(geometry, mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }

  function box(
    w: number, h: number, d: number,
    x: number, y: number, z: number,
    mat: THREE.Material,
    parent: THREE.Object3D = root
  ) {
    return mesh(new THREE.BoxGeometry(w, h, d), mat, x, y, z, parent);
  }

  function cylinder(
    r: number, h: number,
    x: number, y: number, z: number,
    mat: THREE.Material,
    segments = 16,
    parent: THREE.Object3D = root
  ) {
    return mesh(new THREE.CylinderGeometry(r, r, h, segments), mat, x, y, z, parent);
  }

  function disc(
    r: number, depth: number,
    x: number, y: number, z: number,
    mat: THREE.Material,
    segments = 24
  ) {
    const m = cylinder(r, depth, x, y, z, mat, segments);
    m.rotation.x = Math.PI / 2;
    return m;
  }

  function rod(
    a: THREE.Vector3, b: THREE.Vector3,
    radius: number, mat: THREE.Material,
    segments = 8
  ) {
    const direction = b.clone().sub(a);
    const m = mesh(
      new THREE.CylinderGeometry(radius, radius, direction.length(), segments),
      mat
    );
    m.position.copy(a).add(b).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0), direction.normalize()
    );
    return m;
  }

  function line(
    ax: number, ay: number, az: number,
    bx: number, by: number, bz: number,
    radius: number, mat: THREE.Material,
    segments = 8
  ) {
    return rod(
      new THREE.Vector3(ax, ay, az),
      new THREE.Vector3(bx, by, bz),
      radius, mat, segments
    );
  }

  function torus(
    radius: number, tube: number,
    x: number, y: number, z: number,
    mat: THREE.Material,
    arc = Math.PI * 2,
    segments = 40
  ) {
    return mesh(
      new THREE.TorusGeometry(radius, tube, 6, segments, arc),
      mat, x, y, z
    );
  }

  function archTube(
    radius: number, tube: number, spring: number, bottom: number,
    z: number, mat: THREE.Material
  ) {
    torus(radius, tube, 0, spring, z, mat, Math.PI, 40);
    for (const s of [-1, 1]) {
      cylinder(tube, spring - bottom, s * radius, (spring + bottom) / 2, z, mat, 10);
    }
  }

  function archPanel(
    radius: number, spring: number, bottom: number,
    depth: number, z: number, mat: THREE.Material
  ) {
    box(radius * 2, spring - bottom, depth, 0, (spring + bottom) / 2, z, mat);
    const cap = mesh(
      new THREE.CylinderGeometry(
        radius, radius, depth, 40, 1, false, Math.PI / 2, Math.PI
      ),
      mat, 0, spring, z
    );
    cap.rotation.x = Math.PI / 2;
  }

  function screw(x: number, y: number, z: number, radius = 0.004) {
    disc(radius, 0.0025, x, y, z, chromeBright, 10);
    const slot = box(radius * 1.25, radius * 0.2, 0.001, x, y, z + 0.0018, chromeDark);
    slot.rotation.z = Math.PI / 5;
  }

  // A single printed-paper atlas supplies all the readable original lettering.
  const titles = [
    ["A1", "BLUE MOON", "THE STARLIGHTS"],
    ["A2", "SWEET SIXTEEN", "EDDIE & THE ACES"],
    ["A3", "MIDNIGHT SPECIAL", "THE NIGHT OWLS"],
    ["A4", "ONLY YOU", "THE VELVET TONES"],
    ["B1", "ROCK-A-BILLY BABY", "BILLY DALE"],
    ["B2", "DREAM LOVER", "THE MOONBEAMS"],
    ["B3", "TENNESSEE WALTZ", "MARGIE LEE"],
    ["B4", "SHAKE, RATTLE & ROLL", "THE ROAD KINGS"],
    ["C1", "EARTH ANGEL", "THE BLUEBIRDS"],
    ["C2", "SATURDAY NIGHT", "JIMMY JAMES"],
    ["C3", "STARDUST", "THE SILVER STRINGS"],
    ["C4", "LITTLE DARLIN'", "THE SWEETHEARTS"],
    ["D1", "COME GO WITH ME", "THE FOUR BELLS"],
    ["D2", "CHERRY SODA", "BETTY & THE BOYS"],
    ["D3", "SLOW DANCE", "THE ROYAL FIVE"],
    ["D4", "GOODNIGHT, SWEETHEART", "THE STARLIGHTS"]
  ];

  let atlas: THREE.Texture;
  if (typeof document !== "undefined") {
    const canvas = document.createElement("canvas");
    canvas.width = 2048;
    canvas.height = 2048;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#f4e6c4";
    ctx.fillRect(0, 0, 2048, 2048);

    titles.forEach((title, i) => {
      const x = (i % 4) * 512;
      const y = Math.floor(i / 4) * 128;
      ctx.fillStyle = "#f5e7c7";
      ctx.fillRect(x, y, 512, 128);
      ctx.fillStyle = "#a53b32";
      ctx.fillRect(x + 12, y + 12, 62, 104);
      ctx.fillStyle = "#fff1d1";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "bold 36px Georgia";
      ctx.fillText(title[0], x + 43, y + 65);
      ctx.fillStyle = "#243a3a";
      ctx.font = "bold 27px Arial";
      ctx.fillText(title[1], x + 290, y + 47, 400);
      ctx.fillStyle = "#7e5148";
      ctx.font = "19px Arial";
      ctx.fillText(title[2], x + 290, y + 88, 395);
      ctx.strokeStyle = "#c6a982";
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 3, y + 3, 506, 122);
    });

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillStyle = "#173e40";
    ctx.fillRect(0, 600, 1024, 160);
    ctx.fillStyle = "#f5dfad";
    ctx.font = "italic bold 123px Georgia";
    ctx.fillText("Starlite", 512, 675);

    ctx.fillStyle = "#e5c88d";
    ctx.fillRect(0, 820, 768, 128);
    ctx.fillStyle = "#253d40";
    ctx.font = "bold 53px Georgia";
    ctx.fillText("HIGH FIDELITY", 384, 881);

    ctx.fillStyle = "#f3e4bc";
    ctx.fillRect(800, 820, 256, 128);
    ctx.fillStyle = "#6f2930";
    ctx.font = "bold 83px Georgia";
    ctx.fillText("25¢", 928, 883);

    ctx.fillStyle = "#173e40";
    ctx.fillRect(0, 1000, 1024, 128);
    ctx.fillStyle = "#dfbc79";
    ctx.font = "bold 53px Georgia";
    ctx.fillText("200  •  SELECT-O-MATIC", 512, 1064);

    ctx.fillStyle = "#173e40";
    ctx.fillRect(1100, 820, 384, 192);
    ctx.fillStyle = "#ebd29a";
    ctx.font = "bold 97px Georgia";
    ctx.fillText("45", 1292, 885);
    ctx.font = "27px Arial";
    ctx.fillText("R E V O L U T I O N S", 1292, 961);

    atlas = new THREE.CanvasTexture(canvas);
  } else {
    atlas = new THREE.DataTexture(new Uint8Array([244, 230, 196, 255]), 1, 1);
    atlas.needsUpdate = true;
  }
  atlas.colorSpace = THREE.SRGBColorSpace;
  atlas.anisotropy = 4;
  const printedPaper = material("#ffffff", 0, 0.65, { map: atlas });

  function label(
    w: number, h: number, x: number, y: number, z: number,
    px: number, py: number, pw: number, ph: number
  ) {
    const geometry = new THREE.PlaneGeometry(w, h);
    const uv = geometry.getAttribute("uv");
    for (let i = 0; i < uv.count; i++) {
      uv.setXY(
        i,
        (px + uv.getX(i) * pw) / 2048,
        1 - (py + (1 - uv.getY(i)) * ph) / 2048
      );
    }
    uv.needsUpdate = true;
    return mesh(geometry, printedPaper, x, y, z);
  }

  // Heavy stepped plinth and four rubber isolation feet.
  for (const x of [-0.392, 0.392]) {
    for (const z of [-0.23, 0.23]) {
      cylinder(0.058, 0.032, x, 0.016, z, rubber, 12);
    }
  }
  box(1.016, 0.071, 0.658, 0, 0.064, -0.01, rubber);
  box(1.038, 0.046, 0.681, 0, 0.11, -0.005, chromeDark);
  box(1.021, 0.029, 0.671, 0, 0.133, -0.005, chrome);
  box(0.964, 0.053, 0.588, 0, 0.173, -0.012, wine);
  box(0.987, 0.012, 0.027, 0, 0.126, 0.336, chromeBright);
  box(0.95, 0.018, 0.021, 0, 0.162, 0.297, gold);

  // A hollow upper shell: the records really sit inside the window.
  archPanel(0.481, 1.18, 0.143, 0.067, -0.2835, wine);
  box(0.962, 0.932, 0.545, 0, 0.609, -0.01, wine);
  for (const s of [-1, 1]) {
    box(0.074, 1.037, 0.545, s * 0.444, 0.6615, -0.01, wine);
    box(0.195, 0.107, 0.045, s * 0.3835, 1.1265, 0.24, wine);
  }

  const roof = mesh(
    new THREE.CylinderGeometry(0.481, 0.481, 0.55, 40, 1, true, Math.PI / 2, Math.PI),
    wine, 0, 1.18, -0.009
  );
  roof.rotation.x = Math.PI / 2;
  mesh(new THREE.RingGeometry(0.284, 0.481, 40, 1, 0, Math.PI), wine, 0, 1.18, 0.267);

  const innerRoof = mesh(
    new THREE.CylinderGeometry(0.284, 0.284, 0.31, 32, 1, true, Math.PI / 2, Math.PI),
    tealDark, 0, 1.18, 0.108
  );
  innerRoof.rotation.x = Math.PI / 2;

  archTube(0.48, 0.009, 1.18, 0.175, -0.312, chromeDark);
  archTube(0.491, 0.013, 1.18, 0.189, 0.28, chrome);
  box(0.608, 0.874, 0.023, 0, 0.637, 0.28, tealDark);

  // Side panels, their inset borders, and restrained Streamline Moderne ribs.
  for (const s of [-1, 1]) {
    box(0.01, 0.874, 0.411, s * 0.486, 0.69, -0.028, chromeDark);
    box(0.012, 0.85, 0.39, s * 0.493, 0.69, -0.028, wineLight);
    for (const z of [-0.213, 0.157]) {
      box(0.008, 0.818, 0.007, s * 0.501, 0.69, z, gold);
    }
    for (let i = 0; i < 5; i++) {
      box(0.013, 0.008, 0.287, s * 0.505, 0.383 + i * 0.033, -0.025, chrome);
    }
    const diamond = mesh(new THREE.OctahedronGeometry(1), gold, s * 0.507, 0.831, -0.031);
    diamond.scale.set(0.009, 0.151, 0.064);
    const inset = mesh(new THREE.OctahedronGeometry(1), wine, s * 0.514, 0.831, -0.031);
    inset.scale.set(0.004, 0.116, 0.043);
    for (let i = 0; i < 4; i++) {
      box(0.012, 0.014, 0.122, s * 0.5, 1.02 + i * 0.028, -0.032, black);
    }
  }

  // Deep chrome channels, three uninterrupted luminous horseshoes.
  const tubes = [
    { radius: 0.449, thickness: 0.028, mat: red },
    { radius: 0.386, thickness: 0.025, mat: amber },
    { radius: 0.33, thickness: 0.022, mat: teal }
  ];
  for (const t of tubes) {
    archTube(t.radius, t.thickness + 0.007, 1.18, 0.235, 0.299, chromeDark);
    archTube(t.radius, t.thickness, 1.18, 0.235, 0.324, t.mat);
    for (const s of [-1, 1]) {
      for (const y of [0.273, 1.139]) {
        cylinder(t.thickness + 0.003, 0.013, s * t.radius, y, 0.324, chrome, 12);
      }
      cylinder(t.thickness + 0.004, 0.052, s * t.radius, 0.234, 0.324, chrome, 12);
      cylinder(t.thickness + 0.0045, 0.006, s * t.radius, 0.257, 0.324, gold, 12);
    }
    for (const angle of [Math.PI / 6, Math.PI / 2, Math.PI * 5 / 6]) {
      const clamp = torus(
        t.radius, t.thickness + 0.002, 0, 1.18, 0.324,
        chrome, 0.018, 2
      );
      clamp.rotation.z = angle - 0.009;
    }
  }
  archTube(0.483, 0.008, 1.18, 0.21, 0.328, chromeBright);
  archTube(0.415, 0.008, 1.18, 0.235, 0.331, chromeBright);
  archTube(0.3565, 0.0065, 1.18, 0.235, 0.337, chromeBright);
  archTube(0.3, 0.007, 1.18, 0.213, 0.341, gold);

  for (const s of [-1, 1]) {
    box(0.204, 0.082, 0.071, s * 0.402, 0.198, 0.308, chrome);
    box(0.19, 0.012, 0.079, s * 0.402, 0.239, 0.308, chromeBright);
    for (let i = 0; i < 5; i++) {
      box(0.009, 0.051, 0.004, s * (0.332 + i * 0.035), 0.197, 0.346, chromeDark);
    }
  }

  // Recessed record theatre.
  archPanel(0.282, 1.18, 1.076, 0.016, 0.142, tealDark);
  archTube(0.272, 0.004, 1.18, 1.097, 0.166, gold);
  label(0.098, 0.049, 0, 1.414, 0.169, 1100, 820, 384, 192);

  for (const s of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      box(0.019, 0.003, 0.004, s * (0.085 + i * 0.03), 1.407 - i * 0.012, 0.168, gold);
    }
  }

  box(0.433, 0.027, 0.23, 0, 1.092, 0.272, chromeDark);
  box(0.433, 0.008, 0.019, 0, 1.105, 0.391, chrome);
  for (const x of [-0.191, 0.191]) {
    screw(x, 1.093, 0.403);
  }

  const recordX = -0.057;
  const recordZ = 0.281;
  cylinder(0.091, 0.018, recordX, 1.116, recordZ, chromeDark, 24);
  for (let i = 0; i < 9; i++) {
    const y = 1.13 + i * 0.013;
    cylinder(0.137, 0.0085, recordX, y, recordZ, vinyl, 40);
    const edge = torus(0.1355, 0.00115, recordX, y + 0.0044, recordZ, vinylEdge, Math.PI * 2, 40);
    edge.rotation.x = Math.PI / 2;
  }
  cylinder(0.007, 0.223, recordX, 1.22, recordZ, chromeBright, 12);
  cylinder(0.012, 0.01, recordX, 1.33, recordZ, chrome, 12);

  // A separated record, just lifted by the changing arm.
  const playingY = 1.281;
  cylinder(0.137, 0.009, recordX, playingY, recordZ, vinyl, 40);
  for (const radius of [0.059, 0.075, 0.096, 0.116, 0.131]) {
    const groove = torus(radius, 0.00075, recordX, playingY + 0.005, recordZ, vinylEdge, Math.PI * 2, 40);
    groove.rotation.x = Math.PI / 2;
  }
  cylinder(0.041, 0.0015, recordX, playingY + 0.0057, recordZ, gold, 24);
  cylinder(0.027, 0.0017, recordX, playingY + 0.0067, recordZ, wineLight, 24);
  cylinder(0.0085, 0.002, recordX, playingY + 0.008, recordZ, cream, 12);
  for (let i = 0; i < 4; i++) {
    box(0.018 - i * 0.002, 0.0008, 0.002, recordX, playingY + 0.008, recordZ + 0.014 + i * 0.003, gold);
  }

  // Mechanical columns, pivot, counterweight, and dog-legged record-picker.
  box(0.025, 0.209, 0.037, -0.224, 1.219, 0.237, chromeDark);
  box(0.012, 0.203, 0.008, -0.224, 1.219, 0.26, chrome);
  for (const y of [1.132, 1.218, 1.303]) screw(-0.224, y, 0.267, 0.0045);
  box(0.047, 0.172, 0.051, 0.177, 1.195, 0.254, black);
  cylinder(0.026, 0.178, 0.171, 1.208, 0.297, chromeDark, 16);
  cylinder(0.034, 0.049, 0.171, 1.293, 0.297, gold, 16);
  cylinder(0.026, 0.02, 0.171, 1.326, 0.297, chrome, 16);
  cylinder(0.015, 0.008, 0.171, 1.341, 0.297, chromeBright, 12);
  line(0.171, 1.334, 0.297, 0.116, 1.351, 0.354, 0.012, chromeBright);
  line(0.116, 1.351, 0.354, -0.008, 1.317, 0.378, 0.011, cream);
  line(0.117, 1.34, 0.354, -0.009, 1.305, 0.378, 0.004, chromeDark);
  box(0.035, 0.024, 0.024, -0.014, 1.306, 0.378, chrome);
  box(0.024, 0.008, 0.02, -0.014, 1.29, 0.378, black);
  line(0.172, 1.335, 0.297, 0.219, 1.336, 0.265, 0.01, chrome);
  box(0.037, 0.028, 0.031, 0.223, 1.336, 0.263, chromeDark);

  for (let i = 0; i < 3; i++) {
    box(0.013, 0.04, 0.013, 0.106 + i * 0.027, 1.127, 0.373, gold);
  }

  // Bowed, arch-topped glass, with a gently projecting cylindrical lower section.
  archTube(0.286, 0.009, 1.18, 1.073, 0.365, chromeBright);
  const dome = mesh(
    new THREE.SphereGeometry(1, 32, 14, 0, Math.PI, 0, Math.PI / 2),
    glass, 0, 1.18, 0.365
  );
  dome.scale.set(0.281, 0.281, 0.085);
  dome.renderOrder = 10;
  dome.castShadow = false;

  const lowerGlass = mesh(
    new THREE.CylinderGeometry(0.281, 0.281, 0.107, 32, 1, true, -Math.PI / 2, Math.PI),
    glass, 0, 1.1265, 0.365
  );
  lowerGlass.scale.z = 0.085 / 0.281;
  lowerGlass.renderOrder = 10;
  lowerGlass.castShadow = false;

  const curvedSill = torus(0.281, 0.007, 0, 1.073, 0.365, chromeBright, Math.PI, 32);
  curvedSill.scale.y = 0.085 / 0.281;
  curvedSill.rotation.x = Math.PI / 2;
  box(0.58, 0.017, 0.035, 0, 1.061, 0.362, chrome);

  for (const phi of [0.63, 0.77]) {
    let previous: THREE.Vector3 | undefined;
    for (let i = 0; i <= 8; i++) {
      const theta = 0.37 + i * 0.069;
      const p = new THREE.Vector3(
        -0.282 * Math.cos(phi) * Math.sin(theta),
        1.18 + 0.282 * Math.cos(theta),
        0.365 + 0.086 * Math.sin(phi) * Math.sin(theta)
      );
      if (previous) {
        const glint = rod(previous, p, phi < 0.7 ? 0.0017 : 0.0007, glassShine, 5);
        glint.renderOrder = 11;
        glint.castShadow = false;
      }
      previous = p;
    }
  }

  // Chrome selection console with sixteen separate paper title windows.
  box(0.596, 0.327, 0.037, 0, 0.888, 0.306, chromeDark);
  box(0.586, 0.317, 0.022, 0, 0.888, 0.33, chrome);
  box(0.565, 0.297, 0.008, 0, 0.887, 0.345, tealDark);
  label(0.291, 0.045, 0, 1.027, 0.353, 0, 600, 1024, 160);
  for (const s of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      box(0.081 - i * 0.014, 0.0024, 0.005, s * 0.218, 1.018 + i * 0.009, 0.354, gold);
    }
  }

  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const i = row * 4 + col;
      const x = (col - 1.5) * 0.135;
      const y = 0.972 - row * 0.063;
      box(0.126, 0.041, 0.009, x, y, 0.354, chromeDark);
      box(0.122, 0.038, 0.007, x, y + 0.001, 0.36, chromeBright);
      label(0.113, 0.031, x, y + 0.002, 0.3641, col * 512, row * 128, 512, 128);

      box(0.09, 0.017, 0.007, x, y - 0.03, 0.351, black);
      box(0.082, 0.013, 0.022, x, y - 0.0285, 0.366, chrome);
      box(0.07, 0.004, 0.002, x, y - 0.0255, 0.378, chromeBright);
      box(0.063, 0.0016, 0.002, x, y - 0.032, 0.378, chromeDark);
    }
  }
  for (const x of [-0.282, 0.282]) {
    for (const y of [0.736, 1.039]) screw(x, y, 0.348, 0.0035);
  }

  // Coin escutcheon and the gold High Fidelity badge.
  box(0.584, 0.014, 0.027, 0, 0.718, 0.335, chromeBright);
  box(0.355, 0.048, 0.014, -0.105, 0.688, 0.327, chromeDark);
  box(0.341, 0.04, 0.012, -0.105, 0.688, 0.339, gold);
  label(0.296, 0.03, -0.105, 0.688, 0.3455, 0, 820, 768, 128);
  screw(-0.265, 0.688, 0.348, 0.003);
  screw(0.055, 0.688, 0.348, 0.003);

  box(0.128, 0.071, 0.019, 0.211, 0.684, 0.339, chromeDark);
  box(0.119, 0.063, 0.015, 0.211, 0.687, 0.353, chrome);
  label(0.055, 0.029, 0.186, 0.69, 0.361, 800, 820, 256, 128);
  box(0.021, 0.046, 0.005, 0.239, 0.688, 0.363, chromeBright);
  box(0.008, 0.035, 0.006, 0.239, 0.688, 0.367, black);
  box(0.0015, 0.031, 0.002, 0.236, 0.688, 0.371, chromeDark);
  screw(0.163, 0.665, 0.363, 0.003);
  screw(0.259, 0.71, 0.363, 0.003);

  // The speaker cloth and its diamond-wire grille.
  const grilleY = 0.453;
  box(0.58, 0.422, 0.018, 0, grilleY, 0.311, chromeDark);
  box(0.552, 0.398, 0.012, 0, grilleY, 0.324, black);
  disc(0.19, 0.006, 0, grilleY, 0.333, vinyl, 40);
  torus(0.177, 0.006, 0, grilleY, 0.337, vinylEdge);
  torus(0.13, 0.005, 0, grilleY, 0.338, vinylEdge);

  const halfW = 0.267;
  const halfH = 0.192;
  for (const slope of [-0.85, 0.85]) {
    for (let b = -0.43; b <= 0.43; b += 0.019) {
      const points: THREE.Vector2[] = [];
      const add = (x: number, y: number) => {
        if (x >= -halfW - 0.00001 && x <= halfW + 0.00001 &&
            y >= -halfH - 0.00001 && y <= halfH + 0.00001) {
          if (!points.some(p => Math.abs(p.x - x) + Math.abs(p.y - y) < 0.00001)) {
            points.push(new THREE.Vector2(x, y));
          }
        }
      };
      add(-halfW, slope * -halfW + b);
      add(halfW, slope * halfW + b);
      add((-halfH - b) / slope, -halfH);
      add((halfH - b) / slope, halfH);
      if (points.length >= 2) {
        line(
          points[0].x, grilleY + points[0].y, 0.347,
          points[1].x, grilleY + points[1].y, 0.347,
          0.001, grilleGold, 4
        );
      }
    }
  }

  for (const x of [-0.278, 0.278]) {
    box(0.009, 0.411, 0.014, x, grilleY, 0.35, chromeBright);
    box(0.003, 0.391, 0.008, x - Math.sign(x) * 0.008, grilleY, 0.353, gold);
  }
  for (const y of [grilleY - 0.204, grilleY + 0.204]) {
    box(0.563, 0.009, 0.014, 0, y, 0.35, chromeBright);
  }

  // Sixteen faceted tapered rays sit proud of the finer grille.
  for (let i = 0; i < 16; i++) {
    const angle = i * Math.PI / 8;
    const dx = Math.sin(angle);
    const dy = Math.cos(angle);
    const reach = Math.min(
      0.262 / Math.max(Math.abs(dx), 0.0001),
      0.185 / Math.max(Math.abs(dy), 0.0001)
    );
    const start = 0.043;
    const length = reach - start;
    const ray = mesh(
      new THREE.ConeGeometry(i % 2 === 0 ? 0.015 : 0.009, length, 4),
      i % 2 === 0 ? chromeBright : gold,
      dx * (start + length / 2),
      grilleY + dy * (start + length / 2),
      0.362
    );
    ray.scale.z = 0.31;
    ray.rotation.z = -angle;
  }
  disc(0.049, 0.015, 0, grilleY, 0.371, chrome, 24);
  torus(0.044, 0.0045, 0, grilleY, 0.38, gold, Math.PI * 2, 24);
  disc(0.038, 0.01, 0, grilleY, 0.384, wineLight, 24);
  const starV = mesh(new THREE.OctahedronGeometry(1), cream, 0, grilleY, 0.394);
  starV.scale.set(0.012, 0.031, 0.006);
  const starH = mesh(new THREE.OctahedronGeometry(1), cream, 0, grilleY, 0.395);
  starH.scale.set(0.028, 0.011, 0.006);
  disc(0.006, 0.004, 0, grilleY, 0.402, gold, 12);

  // Lower kick strip and a small, recessed coin-return cup.
  box(0.593, 0.045, 0.022, 0, 0.215, 0.317, chromeDark);
  box(0.58, 0.035, 0.012, 0, 0.217, 0.334, chrome);
  label(0.305, 0.024, -0.034, 0.217, 0.341, 0, 1000, 1024, 128);
  box(0.083, 0.039, 0.019, 0.219, 0.218, 0.34, chromeBright);
  box(0.067, 0.025, 0.004, 0.219, 0.22, 0.351, black);
  box(0.067, 0.006, 0.026, 0.219, 0.205, 0.358, chrome);
  box(0.006, 0.023, 0.018, 0.183, 0.216, 0.358, chrome);
  box(0.006, 0.023, 0.018, 0.255, 0.216, 0.358, chrome);
  screw(-0.274, 0.218, 0.344, 0.0035);

  // A finished rear, rather than an open modelling shell.
  box(0.649, 0.729, 0.009, 0, 0.675, -0.321, black);
  box(0.629, 0.709, 0.006, 0, 0.675, -0.328, wineLight);
  for (let i = 0; i < 9; i++) {
    box(0.365, 0.014, 0.005, 0, 0.8 + i * 0.022, -0.333, black);
  }
  for (const x of [-0.286, 0.286]) {
    for (const y of [0.353, 0.999]) {
      disc(0.006, 0.004, x, y, -0.334, chromeDark, 10);
    }
  }
  box(0.126, 0.075, 0.005, 0, 0.451, -0.334, chromeDark);
  for (let i = 0; i < 4; i++) {
    box(0.089 - i * 0.009, 0.003, 0.002, 0, 0.473 - i * 0.012, -0.338, gold);
  }

  return root;
}
```