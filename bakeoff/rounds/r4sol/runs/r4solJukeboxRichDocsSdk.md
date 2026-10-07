```ts
import * as THREE from "three";
import {
  createBuilder,
  polyline,
  svg,
  grain,
} from "agentic-3js-builder";

export const meta = {
  name: "Starlight 1956 Jukebox",
  description:
    "A chrome-trimmed diner jukebox with three luminous horseshoe tubes, a glazed record changer, fifteen titled selections, and an Art Deco starburst speaker.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "Starlight1956", detail: 1 });
  const cabinet = b.joint("cabinet", { at: [0, 0, 0] });

  const C = {
    wine: "#66282c",
    redEnamel: "#ac3d38",
    dark: "#192b30",
    recess: "#10191e",
    rubber: "#232526",
    chrome: "#c7d6da",
    chromeDark: "#71898f",
    chromeLight: "#edf4ef",
    gold: "#d6ab62",
    bronze: "#916b3e",
    cream: "#f3dfb7",
    tealEnamel: "#287b78",
    vinyl: "#161b22",
    groove: "#39434b",
    red: "#f45b48",
    amber: "#ffbf51",
    teal: "#35cfc3",
    redCore: "#ffd1b0",
    amberCore: "#fff1c2",
    tealCore: "#c6fff3",
    glass: "#b9e6eb",
    white: "#ffffff",
  };

  type P = number[] | THREE.Vector3;

  function box(
    name: string,
    size: number[],
    at: P,
    color: string,
    rotation?: number[],
  ) {
    return b.part(
      new THREE.BoxGeometry(size[0], size[1], size[2]),
      color,
      { at, bone: cabinet, name, rotation },
    );
  }

  function cylinder(
    name: string,
    radius: number,
    height: number,
    at: P,
    color: string,
    dir: P = [0, 1, 0],
    sides = 32,
  ) {
    return b.part(
      new THREE.CylinderGeometry(radius, radius, height, sides, 1),
      color,
      { at, bone: cabinet, dir, name },
    );
  }

  function torus(
    name: string,
    radius: number,
    tube: number,
    at: P,
    color: string,
    dir: P = [0, 0, 1],
    segments = 40,
  ) {
    return b.part(
      new THREE.TorusGeometry(radius, tube, 6, segments),
      color,
      { at, dir, axis: "z", bone: cabinet, name },
    );
  }

  function drawing(
    name: string,
    width: number,
    height: number,
    at: P,
    texture: ReturnType<typeof svg>,
    dir: P = [0, 0, 1],
    up: P = [0, 1, 0],
  ) {
    return b.part(new THREE.PlaneGeometry(width, height), C.white, {
      at, bone: cabinet, dir, up, axis: "z", texture, name,
    });
  }

  function archOutline(
    radius: number,
    bottom: number,
    spring: number,
    steps = 28,
  ): [number, number][] {
    const points: [number, number][] = [
      [-radius, bottom],
      [radius, bottom],
      [radius, spring],
    ];
    for (let i = 1; i <= steps; i++) {
      const a = (Math.PI * i) / steps;
      points.push([radius * Math.cos(a), spring + radius * Math.sin(a)]);
    }
    return points;
  }

  function archPath(radius: number, bottom: number, spring: number, z: number) {
    const points: number[][] = [
      [-radius, bottom, z],
      [-radius, spring, z],
    ];
    for (let i = 1; i <= 28; i++) {
      const a = Math.PI - (Math.PI * i) / 28;
      points.push([radius * Math.cos(a), spring + radius * Math.sin(a), z]);
    }
    points.push([radius, bottom, z]);
    return points;
  }

  function frontPlate(
    name: string,
    outline: [number, number][],
    z: number,
    thickness: number,
    color: string,
    bevel = 0,
  ) {
    return b.extrude(outline, {
      at: [0, 0, z],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness,
      bevel,
      color,
      bone: cabinet,
      name,
    });
  }

  function screw(x: number, y: number, z: number, name: string) {
    cylinder(name, 0.0047, 0.003, [x, y, z], C.chromeLight, [0, 0, 1], 10);
    box(`${name}_slot`, [0.0063, 0.0009, 0.0007], [x, y, z + 0.0018], C.chromeDark);
  }

  // The full-depth cabinet has an actual opening for the record mechanism.
  const outer = archOutline(0.535, 0.095, 1.12);
  const aperture = archOutline(0.323, 0.994, 1.118);
  const shellShape = new THREE.Shape();
  outer.forEach(([x, y], i) =>
    i === 0 ? shellShape.moveTo(x, y) : shellShape.lineTo(x, y),
  );
  shellShape.closePath();
  const windowHole = new THREE.Path();
  [...aperture].reverse().forEach(([x, y], i) =>
    i === 0 ? windowHole.moveTo(x, y) : windowHole.lineTo(x, y),
  );
  windowHole.closePath();
  shellShape.holes.push(windowHole);
  const shellGeometry = new THREE.ExtrudeGeometry(shellShape, {
    depth: 0.56,
    steps: 1,
    bevelEnabled: false,
    curveSegments: 1,
  });
  shellGeometry.translate(0, 0, -0.28);
  b.part(shellGeometry, C.wine, {
    at: [0, 0, 0], bone: cabinet, name: "lacqueredCabinet",
  });

  frontPlate("roundedBack", outer, -0.257, 0.054, C.wine, 0.006);
  frontPlate("recordChamberBack", aperture, -0.211, 0.012, C.recess);
  box("chamberFloor", [0.629, 0.024, 0.461], [0, 1.006, 0.023], C.dark);

  // Grounded rubber feet and the broad, layered chrome skirt.
  for (const side of [-1, 1]) {
    box(`rubberFoot${side}`, [0.20, 0.035, 0.53], [side * 0.37, 0.0175, -0.025], C.rubber);
  }
  const plinth: [number, number][] = [
    [-0.50, 0.031], [0.50, 0.031], [0.538, 0.059], [0.538, 0.132],
    [0.496, 0.169], [-0.496, 0.169], [-0.538, 0.132], [-0.538, 0.059],
  ];
  frontPlate("chromePlinth", plinth, 0, 0.646, C.chrome, 0.012);
  frontPlate("creamSkirtInset", [
    [-0.493, 0.056], [0.493, 0.056], [0.512, 0.073], [0.512, 0.126],
    [0.482, 0.145], [-0.482, 0.145], [-0.512, 0.126], [-0.512, 0.073],
  ], 0.333, 0.010, C.cream, 0.003);
  box("skirtTealStripe", [1.005, 0.012, 0.010], [0, 0.083, 0.347], C.tealEnamel);
  box("skirtChromeRail", [1.02, 0.010, 0.015], [0, 0.113, 0.348], C.chromeLight);

  const sideWood = grain("#6b2e28", "#a15b39", {
    size: 0.035, axis: "y", seed: 1956,
  });
  for (const s of [-1, 1]) {
    b.part(new THREE.BoxGeometry(0.016, 0.85, 0.43), sideWood, {
      at: [s * 0.537, 0.608, -0.035], bone: cabinet, name: `woodSide${s}`,
    });
    for (let i = 0; i < 6; i++) {
      box(`sideFlute${s}_${i}`, [0.012, 0.74, 0.012],
        [s * 0.549, 0.632, -0.207 + i * 0.069], C.redEnamel);
    }
    for (const y of [0.198, 0.994]) {
      box(`sideChromeRail${s}_${y}`, [0.025, 0.019, 0.466],
        [s * 0.543, y, -0.035], C.chrome);
    }
    for (let i = 0; i < 5; i++) {
      box(`sideVent${s}_${i}`, [0.006, 0.013, 0.177],
        [s * 0.558, 0.329 + i * 0.026, -0.079], C.recess);
    }
  }

  // Three unbroken luminous horseshoes, separated by narrow chrome reeds.
  const spring = 1.125;
  b.sweep(archPath(0.517, 0.165, spring, 0.317), 0.020, {
    color: C.chrome, bone: cabinet, sides: 12, caps: "flat", name: "outerChromeArch",
  });
  b.sweep(archPath(0.451, 0.174, spring, 0.334), 0.007, {
    color: C.chromeLight, bone: cabinet, sides: 8, name: "chromeReedOuter",
  });
  b.sweep(archPath(0.400, 0.174, spring, 0.339), 0.006, {
    color: C.chrome, bone: cabinet, sides: 8, name: "chromeReedInner",
  });
  b.sweep(archPath(0.345, 0.174, spring, 0.332), 0.011, {
    color: C.chrome, bone: cabinet, sides: 10, name: "innerChromeArch",
  });

  const tubes = [
    { name: "Ruby", r: 0.479, thickness: 0.026, color: C.red, core: C.redCore },
    { name: "Amber", r: 0.426, thickness: 0.024, color: C.amber, core: C.amberCore },
    { name: "Aqua", r: 0.375, thickness: 0.022, color: C.teal, core: C.tealCore },
  ];
  for (const t of tubes) {
    const points = archPath(t.r, 0.185, spring, 0.337);
    const tube = b.sweep(points, t.thickness, {
      color: t.color, bone: cabinet, sides: 12, caps: "round",
      name: `${t.name}LuminousTube`,
    });
    const glintRoute = points.map(([x, y, z]) => [x, y, z + 0.06]);
    b.sweep(b.surface(tube).drape(glintRoute, { lift: 0.0008 }), 0.0022, {
      color: t.core, bone: cabinet, sides: 6, name: `${t.name}TubeHighlight`,
    });

    for (const s of [-1, 1]) {
      for (const y of [0.255, 0.656, 1.092]) {
        cylinder(`${t.name}Ferrule${s}_${y}`, t.thickness + 0.0034, 0.014,
          [s * t.r, y, 0.337], C.chrome, [0, 1, 0], 12);
      }
      cylinder(`${t.name}Socket${s}`, t.thickness + 0.006, 0.045,
        [s * t.r, 0.196, 0.337], C.chrome, [0, 1, 0], 12);
    }
    const curve = polyline(points);
    for (const a of [Math.PI * 0.25, Math.PI * 0.75]) {
      const q = [t.r * Math.cos(a), spring + t.r * Math.sin(a), 0.337];
      const u = curve.closestT(q);
      cylinder(`${t.name}CrownClip${a}`, t.thickness + 0.003, 0.012,
        curve.at(u), C.chrome, curve.tangentAt(u), 12);
    }
  }

  // Visible changer: a real stack of vinyl, platter, raised disc and two arms.
  cylinder("turntablePedestal", 0.098, 0.039, [0, 1.043, 0.017], C.chromeDark);
  cylinder("turntableChromePlatter", 0.225, 0.021, [0, 1.065, 0.017], C.chrome);
  cylinder("turntableRedRim", 0.221, 0.006, [0, 1.078, 0.017], C.redEnamel);
  for (let i = 0; i < 8; i++) {
    const y = 1.086 + i * 0.009;
    cylinder(`stackRecord${i + 1}`, 0.211, 0.0065, [0, y, 0.017], C.vinyl, [0, 1, 0], 40);
    cylinder(`recordEdge${i + 1}`, 0.2115, 0.0012, [0, y + 0.002, 0.017],
      i % 3 === 0 ? C.groove : C.vinyl, [0, 1, 0], 40);
  }
  cylinder("stackTopLabel", 0.052, 0.002, [0, 1.1535, 0.017], C.gold);
  cylinder("changerSpindle", 0.007, 0.115, [0, 1.155, 0.017], C.chromeLight, [0, 1, 0], 12);

  const recordNormal = new THREE.Vector3(0, Math.cos(Math.PI / 6), 0.5);
  const pickedCenter = new THREE.Vector3(0.018, 1.270, 0.010);
  const onRecord = (d: number) => pickedCenter.clone().addScaledVector(recordNormal, d);
  cylinder("pickedRecord", 0.177, 0.006, pickedCenter, C.vinyl, recordNormal, 48);
  for (const r of [0.069, 0.082, 0.097, 0.114, 0.132, 0.149, 0.165, 0.173]) {
    torus(`vinylGroove${r}`, r, 0.00065, onRecord(0.0036), C.groove, recordNormal, 48);
  }
  cylinder("pickedRecordLabel", 0.054, 0.0015, onRecord(0.0045), C.redEnamel, recordNormal);
  const recordLabel = svg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <circle cx="100" cy="100" r="97" fill="#b83e37"/>
      <circle cx="100" cy="100" r="90" fill="none" stroke="#f7dba0" stroke-width="3"/>
      <text x="100" y="61" text-anchor="middle" fill="#ffebbb" font-family="Georgia,serif" font-weight="bold" font-size="19">STARLIGHT</text>
      <text x="100" y="80" text-anchor="middle" fill="#ffebbb" font-family="serif" font-size="11" letter-spacing="3">RECORDS</text>
      <text x="100" y="137" text-anchor="middle" fill="#ffebbb" font-family="serif" font-size="14">BLUE MOON</text>
      <text x="100" y="155" text-anchor="middle" fill="#ffebbb" font-family="sans-serif" font-size="10">45 RPM • HIGH FIDELITY</text>
      <circle cx="100" cy="103" r="12" fill="#171b20"/>
    </svg>`, { size: 256 });
  b.part(new THREE.CircleGeometry(0.052, 40), C.white, {
    at: onRecord(0.006), dir: recordNormal, axis: "z",
    up: [0, 0.5, -0.866], texture: recordLabel, bone: cabinet, name: "recordLabelArtwork",
  });

  cylinder("changerMotor", 0.036, 0.056, [-0.249, 1.086, 0.061], C.chromeDark, [0, 1, 0], 16);
  cylinder("changerMotorBand", 0.037, 0.020, [-0.249, 1.092, 0.061], C.redEnamel, [0, 1, 0], 16);
  b.rod([-0.249, 1.104, 0.061], [-0.249, 1.309, 0.061], 0.012, {
    color: C.chromeLight, bone: cabinet, sides: 10, name: "changerLiftColumn",
  });
  cylinder("pickupPivot", 0.024, 0.039, [-0.249, 1.308, 0.064],
    C.chrome, [0, 0, 1], 16);
  const gripper = onRecord(0.027);
  b.frustumBox([-0.244, 1.308, 0.064], gripper, [0.025, 0.021], [0.018, 0.016], {
    color: C.chrome, bone: cabinet, name: "recordPickingArm",
  });
  b.rod([-0.224, 1.313, 0.076], [0.001, 1.299, 0.032], 0.0035, {
    color: C.redEnamel, bone: cabinet, sides: 6, name: "pickupEnamelInlay",
  });
  cylinder("recordGripper", 0.017, 0.028, onRecord(0.014), C.chrome, recordNormal, 12);
  cylinder("gripperCenterPin", 0.006, 0.033, onRecord(0.022), C.chromeLight, recordNormal, 10);

  cylinder("tonearmBase", 0.029, 0.026, [0.252, 1.043, 0.143], C.gold, [0, 1, 0], 16);
  b.rod([0.252, 1.053, 0.143], [0.252, 1.221, 0.143], 0.010, {
    color: C.chrome, bone: cabinet, sides: 8, name: "tonearmPost",
  });
  b.sweep([
    [0.252, 1.221, 0.143], [0.194, 1.252, 0.159], [0.109, 1.211, 0.141],
  ], 0.009, {
    color: C.chromeLight, bone: cabinet, sides: 8, caps: "flat", name: "tonearm",
  });
  box("stylusCartridge", [0.025, 0.017, 0.024], [0.109, 1.207, 0.142], C.redEnamel, [0, 0, -18]);
  b.rod([0.106, 1.204, 0.141], [0.102, 1.198, 0.136], 0.0018, {
    color: C.chromeDark, bone: cabinet, sides: 6, name: "stylus",
  });
  for (const s of [-1, 1]) {
    b.rod([s * 0.282, 1.028, -0.125], [s * 0.282, 1.317, -0.125], 0.011, {
      color: C.gold, bone: cabinet, sides: 8, name: `changerRearRail${s}`,
    });
    cylinder(`chamberLamp${s}`, 0.010, 0.145,
      [s * 0.291, 1.160, -0.155], C.amberCore, [0, 1, 0], 8);
  }

  const hiFi = svg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 65">
      <path d="M12 32H68M232 32H288" stroke="#d6ab62" stroke-width="3"/>
      <text x="150" y="43" text-anchor="middle" fill="#f1dcb0" font-family="Georgia,serif" font-size="35" font-style="italic">Hi-Fi</text>
      <path d="M150 4l3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1z" fill="#d6ab62"/>
    </svg>`, { size: 384 });
  drawing("chamberHiFiSign", 0.244, 0.054, [0, 1.371, -0.197], hiFi);

  // A gently convex pane, rather than a flat opaque stand-in for glass.
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const rows = 22, columns = 24;
  const paneBottom = 0.996, paneTop = 1.439;
  for (let row = 0; row <= rows; row++) {
    const v = row / rows;
    const y = paneBottom + (paneTop - paneBottom) * v;
    const halfWidth = y <= 1.118
      ? 0.321
      : Math.sqrt(Math.max(0.000002, 0.321 ** 2 - (y - 1.118) ** 2));
    for (let col = 0; col <= columns; col++) {
      const u = col / columns;
      const nx = 2 * u - 1;
      positions.push(
        nx * halfWidth,
        y,
        0.324 + 0.027 * (1 - nx * nx) * Math.sin(Math.PI * v),
      );
      uvs.push(u, v);
      if (row < rows && col < columns) {
        const a = row * (columns + 1) + col;
        const c = a + columns + 1;
        indices.push(a, a + 1, c + 1, a, c + 1, c);
      }
    }
  }
  const glassGeometry = new THREE.BufferGeometry();
  glassGeometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  glassGeometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  glassGeometry.setIndex(indices);
  glassGeometry.computeVertexNormals();
  const glass = b.part(glassGeometry, C.glass, {
    at: [0, 0, 0], bone: cabinet, name: "domedGlassWindow",
  });
  b.sweep(polyline(aperture.map(([x, y]) => [x, y, 0.326]), { closed: true }), 0.009, {
    color: C.chromeLight, bone: cabinet, sides: 8, name: "windowChromeBeading",
  });
  const reflections = svg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 440">
      <path d="M72 304C62 192 89 102 164 54L180 60C116 119 90 203 94 294Z"
        fill="#e8ffff" opacity=".72"/>
      <path d="M108 290C104 190 125 127 175 84L182 88C143 139 127 204 126 283Z"
        fill="#e8ffff" opacity=".56"/>
      <path d="M514 89C554 126 573 177 576 230L566 234C559 178 543 138 508 104Z"
        fill="#e8ffff" opacity=".64"/>
    </svg>`, { size: 512 });
  b.decal(glass, reflections, {
    at: [0, 1.215, 0.35], dir: [0, 0, 1], size: [0.625, 0.430],
    lift: 0.001, segments: 18, bone: cabinet, name: "glassReflections",
  });

  // Selection console: individual paper inserts and proud chrome pushbuttons.
  frontPlate("selectionChromeBezel", [
    [-0.327, 0.695], [0.327, 0.695], [0.333, 0.706], [0.333, 0.972],
    [0.321, 0.984], [-0.321, 0.984], [-0.333, 0.972], [-0.333, 0.706],
  ], 0.315, 0.026, C.chrome, 0.006);
  box("selectionDarkInset", [0.635, 0.268, 0.009], [0, 0.839, 0.332], C.dark);

  const heading = svg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 50">
      <path d="M5 25H105M595 25H695" stroke="#d6ab62" stroke-width="3"/>
      <text x="350" y="34" text-anchor="middle" fill="#f5deb7" font-family="sans-serif"
        font-size="23" letter-spacing="5">HIGH FIDELITY · 45 RPM</text>
    </svg>`, { size: 512 });
  drawing("consoleHeading", 0.58, 0.022, [0, 0.957, 0.340], heading);

  const titles = [
    ["BLUE MOON", "The Velvet Tones"],
    ["ROCK AROUND", "The Comets"],
    ["EARTH ANGEL", "The Penguins"],
    ["ONLY YOU", "The Platters"],
    ["STARDUST", "Evening Orchestra"],
    ["BLUE SUEDE", "Carl & The Cats"],
    ["MISTY", "The Piano Trio"],
    ["SUGAR BABY", "The Honeybees"],
    ["PEGGY SUE", "Buddy & The Boys"],
    ["HOUND DOG", "The King"],
    ["MOONLIGHT", "The Serenaders"],
    ["COME ON HOME", "The Bell Notes"],
    ["HEARTBREAK", "The Bluebirds"],
    ["DREAM LOVER", "Bobby's Quartet"],
    ["GOODNIGHT", "The Skylarks"],
  ];

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 5; col++) {
      const i = row * 5 + col;
      const x = (col - 2) * 0.122;
      const y = 0.898 - row * 0.081;
      box(`selectionSocket${i}`, [0.117, 0.071, 0.008], [x, y, 0.340], C.recess);
      box(`titleChromeFrame${i}`, [0.110, 0.041, 0.007], [x, y + 0.011, 0.346], C.chrome);
      const titleTexture = svg(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 112">
          <rect width="360" height="112" fill="#f5e7c7"/>
          <rect x="0" y="0" width="360" height="9" fill="${row === 1 ? "#287b78" : "#ad3d38"}"/>
          <text x="15" y="44" fill="#ad3d38" font-family="serif" font-size="24" font-weight="bold">${String(i + 1).padStart(2, "0")}</text>
          <text x="205" y="46" text-anchor="middle" fill="#263438" font-family="sans-serif" font-size="22" font-weight="bold">${titles[i][0]}</text>
          <path d="M20 59H340" stroke="#bbad8e" stroke-width="2"/>
          <text x="180" y="87" text-anchor="middle" fill="#635a49" font-family="Georgia,serif" font-size="20">${titles[i][1]}</text>
        </svg>`, { size: 384 });
      drawing(`paperTitle${i}`, 0.104, 0.034, [x, y + 0.011, 0.350], titleTexture);
      box(`buttonBlackSocket${i}`, [0.092, 0.021, 0.008], [x, y - 0.025, 0.345], C.rubber);
      box(`chromeSelectionButton${i}`, [0.079, 0.016, 0.024], [x, y - 0.024, 0.358], C.chrome);
      box(`buttonGlint${i}`, [0.070, 0.003, 0.0015], [x, y - 0.019, 0.371], C.chromeLight);
      box(`buttonInsetLine${i}`, [0.024, 0.003, 0.001], [x, y - 0.026, 0.371], C.tealEnamel);
    }
  }
  for (const x of [-0.319, 0.319]) {
    for (const y of [0.711, 0.965]) screw(x, y, 0.331, `consoleScrew${x}_${y}`);
  }

  box("brandChromePlaque", [0.377, 0.051, 0.018], [0, 0.998, 0.351], C.chrome);
  box("brandEnamelPlaque", [0.359, 0.039, 0.006], [0, 0.998, 0.364], C.wine);
  const brand = svg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 72">
      <path d="M12 36H95M505 36H588" stroke="#e6c580" stroke-width="3"/>
      <path d="M53 18l5 11 12 2-9 8 2 12-10-6-11 6 3-12-9-8 12-2z
               M547 18l5 11 12 2-9 8 2 12-10-6-11 6 3-12-9-8 12-2z"
        fill="#e6c580"/>
      <text x="300" y="55" text-anchor="middle" fill="#ffe8b5"
        font-family="Georgia,serif" font-size="58" font-style="italic">Starlight</text>
    </svg>`, { size: 768 });
  drawing("StarlightName", 0.345, 0.037, [0, 0.998, 0.368], brand);

  // Coin hardware and the period price instruction plate.
  box("coinCrossbar", [0.642, 0.061, 0.026], [0, 0.655, 0.320], C.chrome);
  box("pricePlaque", [0.353, 0.045, 0.009], [-0.124, 0.655, 0.339], C.tealEnamel);
  const price = svg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 550 70">
      <text x="275" y="25" text-anchor="middle" fill="#f7e5bc" font-family="sans-serif"
        font-size="16" letter-spacing="3">MAKE YOUR SELECTION</text>
      <text x="275" y="56" text-anchor="middle" fill="#f7e5bc" font-family="Georgia,serif"
        font-size="28">1 PLAY 5¢  ·  3 PLAYS 10¢</text>
    </svg>`, { size: 512 });
  drawing("playPriceLettering", 0.340, 0.041, [-0.124, 0.655, 0.345], price);
  box("coinEscutcheon", [0.141, 0.046, 0.020], [0.221, 0.656, 0.347], C.chromeLight);
  box("coinSlotLip", [0.077, 0.014, 0.009], [0.221, 0.648, 0.361], C.chromeDark);
  box("coinSlot", [0.066, 0.006, 0.003], [0.221, 0.649, 0.366], C.recess);
  const insertCoin = svg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 35">
      <text x="120" y="26" text-anchor="middle" fill="#24393e" font-family="sans-serif"
        font-size="22" font-weight="bold" letter-spacing="2">INSERT COIN</text>
    </svg>`, { size: 256 });
  drawing("coinSlotLegend", 0.103, 0.013, [0.221, 0.669, 0.359], insertCoin);
  screw(0.163, 0.651, 0.359, "coinPlateScrewL");
  screw(0.280, 0.651, 0.359, "coinPlateScrewR");

  // Perforated grille fabric under a dimensional, tapered chrome sunburst.
  const grilleOutline: [number, number][] = [
    [-0.300, 0.614], [0.300, 0.614], [0.321, 0.593], [0.321, 0.268],
    [0.252, 0.178], [-0.252, 0.178], [-0.321, 0.268], [-0.321, 0.593],
  ];
  frontPlate("speakerChromeFrame", grilleOutline, 0.314, 0.030, C.chrome, 0.006);
  const innerGrille: [number, number][] = [
    [-0.294, 0.602], [0.294, 0.602], [0.309, 0.586], [0.309, 0.275],
    [0.246, 0.192], [-0.246, 0.192], [-0.309, 0.275], [-0.309, 0.586],
  ];
  frontPlate("speakerDarkBacking", innerGrille, 0.334, 0.008, C.recess);
  const meshTexture = svg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 440">
      <defs>
        <pattern id="mesh" width="16" height="14" patternUnits="userSpaceOnUse">
          <rect width="16" height="14" fill="#776044"/>
          <path d="M0 1H16M1 0V14" stroke="#aa8c5c" stroke-width="1.5"/>
          <rect x="4" y="4" width="9" height="6" rx="2" fill="#202a2b"/>
          <path d="M4 10H13" stroke="#c4a679" stroke-width="1"/>
        </pattern>
      </defs>
      <path d="M16 0H624L640 17V351L575 440H65L0 351V17Z" fill="url(#mesh)"/>
    </svg>`, { size: 1024 });
  drawing("wovenSpeakerGrille", 0.618, 0.410, [0, 0.397, 0.340], meshTexture);

  const burstCenter = new THREE.Vector3(0, 0.397, 0.350);
  for (let i = 0; i < 24; i++) {
    const a = (Math.PI * 2 * i) / 24;
    const dx = Math.sin(a), dy = Math.cos(a);
    const length = 1 / Math.sqrt((dx / 0.295) ** 2 + (dy / 0.194) ** 2);
    const r0 = 0.056;
    const w0 = 0.0026;
    const w1 = i % 2 === 0 ? 0.008 : 0.0042;
    const px = dy, py = -dx;
    const points: number[][] = [
      [burstCenter.x + dx * r0 + px * w0, burstCenter.y + dy * r0 + py * w0, 0.350],
      [burstCenter.x + dx * length + px * w1, burstCenter.y + dy * length + py * w1, 0.350],
      [burstCenter.x + dx * length - px * w1, burstCenter.y + dy * length - py * w1, 0.350],
      [burstCenter.x + dx * r0 - px * w0, burstCenter.y + dy * r0 - py * w0, 0.350],
    ];
    b.slab(points, {
      thickness: 0.007,
      color: i % 2 === 0 ? C.chromeLight : C.gold,
      bone: cabinet,
      name: `starburstRay${i}`,
    });
  }
  b.sweep(polyline(innerGrille.map(([x, y]) => [x, y, 0.350]), { closed: true }), 0.005, {
    color: C.gold, bone: cabinet, sides: 8, name: "speakerGoldBeading",
  });
  cylinder("speakerMedallion", 0.053, 0.016, [0, 0.397, 0.362],
    C.gold, [0, 0, 1], 32);
  torus("medallionChromeRim", 0.052, 0.006, [0, 0.397, 0.372], C.chromeLight);
  cylinder("medallionEnamel", 0.039, 0.009, [0, 0.397, 0.373],
    C.redEnamel, [0, 0, 1], 32);
  const star: [number, number][] = [];
  for (let i = 0; i < 10; i++) {
    const a = Math.PI / 2 + (i * Math.PI) / 5;
    const r = i % 2 === 0 ? 0.030 : 0.012;
    star.push([r * Math.cos(a), r * Math.sin(a)]);
  }
  b.extrude(star, {
    at: [0, 0.397, 0.382], x: [1, 0, 0], y: [0, 1, 0],
    thickness: 0.005, color: C.cream, bone: cabinet, name: "speakerStar",
  });
  for (const s of [-1, 1]) {
    screw(s * 0.302, 0.583, 0.333, `speakerScrewTop${s}`);
    screw(s * 0.248, 0.200, 0.333, `speakerScrewBottom${s}`);
  }

  box("coinReturnChromeCup", [0.067, 0.032, 0.031], [0.277, 0.208, 0.355], C.chrome);
  box("coinReturnDarkOpening", [0.051, 0.013, 0.003], [0.277, 0.214, 0.372], C.recess);
  box("coinReturnTrayLip", [0.059, 0.006, 0.018], [0.277, 0.197, 0.375], C.chromeLight);

  // Material finishes remain shared by colour, including the emissive tube glass.
  const root = b.root;
  const finish = new Map<string, {
    metalness: number;
    roughness: number;
    emissive?: number;
    glass?: boolean;
  }>();
  const register = (
    color: string,
    metalness: number,
    roughness: number,
    emissive?: number,
    glassFinish?: boolean,
  ) => finish.set(new THREE.Color(color).getHexString(), {
    metalness, roughness, emissive, glass: glassFinish,
  });

  register(C.chrome, 0.94, 0.19);
  register(C.chromeLight, 0.88, 0.16);
  register(C.chromeDark, 0.88, 0.28);
  register(C.gold, 0.76, 0.28);
  register(C.bronze, 0.75, 0.34);
  register(C.wine, 0.13, 0.28);
  register(C.redEnamel, 0.10, 0.25);
  register(C.tealEnamel, 0.12, 0.26);
  register(C.vinyl, 0.08, 0.28);
  register(C.groove, 0.16, 0.32);
  register(C.red, 0.03, 0.21, 0.70);
  register(C.amber, 0.03, 0.21, 0.72);
  register(C.teal, 0.03, 0.21, 0.65);
  register(C.redCore, 0.02, 0.18, 0.85);
  register(C.amberCore, 0.02, 0.18, 0.85);
  register(C.tealCore, 0.02, 0.18, 0.85);
  register(C.glass, 0.06, 0.09, undefined, true);

  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of materials) {
      if (!(material instanceof THREE.MeshStandardMaterial)) continue;
      const f = finish.get(material.color.getHexString());
      if (!f) continue;
      material.metalness = f.metalness;
      material.roughness = f.roughness;
      if (f.emissive !== undefined) {
        material.emissive.copy(material.color);
        material.emissiveIntensity = f.emissive;
      }
      if (f.glass) {
        material.transparent = true;
        material.opacity = 0.13;
        material.depthWrite = false;
        material.side = THREE.DoubleSide;
      }
      material.needsUpdate = true;
    }
  });

  return root;
}
```