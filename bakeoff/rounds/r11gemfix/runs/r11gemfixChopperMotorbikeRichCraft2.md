Geometry was created for the staged base before the skeleton root joint was defined, causing the builder's automatic bone-weight lookup to fail.

## Edits

<<<<<<< SEARCH
  // ---------------------------------------------------------------------------
  // Staged Base (Route 66 Desert Highway)
  // Height: y from 0 to 0.04m, so the bike tires rest firmly on y = 0.04m.
  // ---------------------------------------------------------------------------
  const BASE_TOP_Y = 0.04;

  const baseOutline: [number, number, "sharp"][] = [
    [-0.75, -1.45, "sharp"],
    [0.75, -1.45, "sharp"],
    [0.85, -1.30, "sharp"],
    [0.85, 1.85, "sharp"],
    [0.75, 1.98, "sharp"],
    [-0.75, 1.98, "sharp"],
    [-0.85, 1.85, "sharp"],
    [-0.85, -1.30, "sharp"],
  ];

  b.extrude(baseOutline, {
    at: [0, BASE_TOP_Y / 2, 0.25],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: BASE_TOP_Y,
    bevel: 0.008,
    color: ASPHALT_ROAD,
    group: "scenery",
  });

  // Center double solid yellow road stripes
  b.part(new THREE.BoxGeometry(0.035, 0.002, 3.25), ROAD_YELLOW, {
    at: [0.52, BASE_TOP_Y + 0.001, 0.26],
    group: "scenery",
  });
  b.part(new THREE.BoxGeometry(0.035, 0.002, 3.25), ROAD_YELLOW, {
    at: [0.58, BASE_TOP_Y + 0.001, 0.26],
    group: "scenery",
  });

  // Dashed white lane markers on opposite side
  b.part(new THREE.BoxGeometry(0.05, 0.002, 0.55), ROAD_WHITE, {
    at: [-0.55, BASE_TOP_Y + 0.001, -0.85],
    group: "scenery",
  });
  b.part(new THREE.BoxGeometry(0.05, 0.002, 0.55), ROAD_WHITE, {
    at: [-0.55, BASE_TOP_Y + 0.001, 0.25],
    group: "scenery",
  });
  b.part(new THREE.BoxGeometry(0.05, 0.002, 0.55), ROAD_WHITE, {
    at: [-0.55, BASE_TOP_Y + 0.001, 1.35],
    group: "scenery",
  });

  // Roadside red sandstone rocks
  b.part(new THREE.DodecahedronGeometry(0.12, 0), DESERT_ROCK, {
    at: [0.74, BASE_TOP_Y + 0.05, -0.55],
    scale: [1.3, 0.7, 1.0],
    rotation: [15, 25, -10],
    group: "scenery",
  });
  b.part(new THREE.DodecahedronGeometry(0.15, 0), DESERT_ROCK, {
    at: [0.73, BASE_TOP_Y + 0.07, 0.75],
    scale: [1.1, 0.8, 1.4],
    rotation: [-15, 40, 20],
    group: "scenery",
  });
  b.part(new THREE.DodecahedronGeometry(0.08, 0), DESERT_ROCK, {
    at: [0.68, BASE_TOP_Y + 0.03, 1.45],
    scale: [1.2, 0.5, 0.9],
    rotation: [20, -30, 10],
    group: "scenery",
  });

  // Route 66 Shield Signpost
  b.rod([0.72, BASE_TOP_Y, -1.05], [0.72, 0.65, -1.05], 0.014, DARK_CARBON, { group: "scenery" });
  b.part(new THREE.BoxGeometry(0.24, 0.24, 0.008), "#ffffff", {
    at: [0.72, 0.54, -1.04],
    dir: [0, 0, 1],
    axis: "z",
    texture: route66SignTex,
    group: "scenery",
  });

  // Spent brass shell casing on asphalt (Overwatch lore detail)
  b.rod([0.42, BASE_TOP_Y + 0.006, -0.3], [0.44, BASE_TOP_Y + 0.006, -0.26], 0.006, GOLD_BILLET, {
    group: "scenery",
  });

  // ---------------------------------------------------------------------------
  // Skeleton Rig
  // ---------------------------------------------------------------------------
  // Geometry parameters:
  // Rear wheel: radius 0.35m, center y = BASE_TOP_Y + 0.35 = 0.39m, z = -0.72m
  // Front wheel: radius 0.39m, center y = BASE_TOP_Y + 0.39 = 0.43m, z = +1.30m
  const REAR_AXLE: [number, number, number] = [0, BASE_TOP_Y + 0.35, -0.72];
  const FRONT_AXLE: [number, number, number] = [0, BASE_TOP_Y + 0.39, 1.30];
  const STEERING_HEAD: [number, number, number] = [0, 0.88, 0.58];

  // Fork rake direction vector (from steering head down-forward to front axle)
  const forkDir = new THREE.Vector3(...FRONT_AXLE).sub(new THREE.Vector3(...STEERING_HEAD)).normalize();

  // Root joint
  const root = b.joint("root", { at: [0, 0, 0] });

  // Chassis / frame backbone
  const chassis = b.joint("chassis", { parent: root, at: [0, 0.45, 0.0], role: "spine" });

  // Steering neck / triple tree assembly
  const steering = b.joint("steering", { parent: chassis, at: STEERING_HEAD, dir: forkDir, role: "neck" });

  // Wheels
  const frontWheel = b.joint("frontWheel", { parent: steering, at: FRONT_AXLE, dir: [1, 0, 0], role: "hinge" });
  const rearWheel = b.joint("rearWheel", { parent: chassis, at: REAR_AXLE, dir: [1, 0, 0], role: "hinge" });

  // Handlebars
  const handlebars = b.joint("handlebars", { parent: steering, at: [0, 1.08, 0.52], role: "fan" });

  // Kickstand on left (+X) side
  const KICKSTAND_PIVOT: [number, number, number] = [0.12, 0.22, -0.05];
  const KICKSTAND_TIP: [number, number, number] = [0.32, BASE_TOP_Y + 0.005, 0.06];
  const kickstandDir = new THREE.Vector3(...KICKSTAND_TIP).sub(new THREE.Vector3(...KICKSTAND_PIVOT)).normalize();
  const kickstand = b.joint("kickstand", { parent: chassis, at: KICKSTAND_PIVOT, dir: kickstandDir, role: "hinge" });
=======
  // ---------------------------------------------------------------------------
  // Skeleton Rig
  // ---------------------------------------------------------------------------
  const BASE_TOP_Y = 0.04;
  const REAR_AXLE: [number, number, number] = [0, BASE_TOP_Y + 0.35, -0.72];
  const FRONT_AXLE: [number, number, number] = [0, BASE_TOP_Y + 0.39, 1.30];
  const STEERING_HEAD: [number, number, number] = [0, 0.88, 0.58];

  // Fork rake direction vector (from steering head down-forward to front axle)
  const forkDir = new THREE.Vector3(...FRONT_AXLE).sub(new THREE.Vector3(...STEERING_HEAD)).normalize();

  // Root joint
  const root = b.joint("root", { at: [0, 0, 0] });

  // Chassis / frame backbone
  const chassis = b.joint("chassis", { parent: root, at: [0, 0.45, 0.0], role: "spine" });

  // Steering neck / triple tree assembly
  const steering = b.joint("steering", { parent: chassis, at: STEERING_HEAD, dir: forkDir, role: "neck" });

  // Wheels
  const frontWheel = b.joint("frontWheel", { parent: steering, at: FRONT_AXLE, dir: [1, 0, 0], role: "hinge" });
  const rearWheel = b.joint("rearWheel", { parent: chassis, at: REAR_AXLE, dir: [1, 0, 0], role: "hinge" });

  // Handlebars
  const handlebars = b.joint("handlebars", { parent: steering, at: [0, 1.08, 0.52], role: "fan" });

  // Kickstand on left (+X) side
  const KICKSTAND_PIVOT: [number, number, number] = [0.12, 0.22, -0.05];
  const KICKSTAND_TIP: [number, number, number] = [0.32, BASE_TOP_Y + 0.005, 0.06];
  const kickstandDir = new THREE.Vector3(...KICKSTAND_TIP).sub(new THREE.Vector3(...KICKSTAND_PIVOT)).normalize();
  const kickstand = b.joint("kickstand", { parent: chassis, at: KICKSTAND_PIVOT, dir: kickstandDir, role: "hinge" });

  // ---------------------------------------------------------------------------
  // Staged Base (Route 66 Desert Highway)
  // Height: y from 0 to 0.04m, so the bike tires rest firmly on y = 0.04m.
  // ---------------------------------------------------------------------------
  const baseOutline: [number, number, "sharp"][] = [
    [-0.75, -1.45, "sharp"],
    [0.75, -1.45, "sharp"],
    [0.85, -1.30, "sharp"],
    [0.85, 1.85, "sharp"],
    [0.75, 1.98, "sharp"],
    [-0.75, 1.98, "sharp"],
    [-0.85, 1.85, "sharp"],
    [-0.85, -1.30, "sharp"],
  ];

  b.extrude(baseOutline, {
    at: [0, BASE_TOP_Y / 2, 0.25],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: BASE_TOP_Y,
    bevel: 0.008,
    color: ASPHALT_ROAD,
    bone: root,
    group: "scenery",
  });

  // Center double solid yellow road stripes
  b.part(new THREE.BoxGeometry(0.035, 0.002, 3.25), ROAD_YELLOW, {
    bone: root,
    at: [0.52, BASE_TOP_Y + 0.001, 0.26],
    group: "scenery",
  });
  b.part(new THREE.BoxGeometry(0.035, 0.002, 3.25), ROAD_YELLOW, {
    bone: root,
    at: [0.58, BASE_TOP_Y + 0.001, 0.26],
    group: "scenery",
  });

  // Dashed white lane markers on opposite side
  b.part(new THREE.BoxGeometry(0.05, 0.002, 0.55), ROAD_WHITE, {
    bone: root,
    at: [-0.55, BASE_TOP_Y + 0.001, -0.85],
    group: "scenery",
  });
  b.part(new THREE.BoxGeometry(0.05, 0.002, 0.55), ROAD_WHITE, {
    bone: root,
    at: [-0.55, BASE_TOP_Y + 0.001, 0.25],
    group: "scenery",
  });
  b.part(new THREE.BoxGeometry(0.05, 0.002, 0.55), ROAD_WHITE, {
    bone: root,
    at: [-0.55, BASE_TOP_Y + 0.001, 1.35],
    group: "scenery",
  });

  // Roadside red sandstone rocks
  b.part(new THREE.DodecahedronGeometry(0.12, 0), DESERT_ROCK, {
    bone: root,
    at: [0.74, BASE_TOP_Y + 0.05, -0.55],
    scale: [1.3, 0.7, 1.0],
    rotation: [15, 25, -10],
    group: "scenery",
  });
  b.part(new THREE.DodecahedronGeometry(0.15, 0), DESERT_ROCK, {
    bone: root,
    at: [0.73, BASE_TOP_Y + 0.07, 0.75],
    scale: [1.1, 0.8, 1.4],
    rotation: [-15, 40, 20],
    group: "scenery",
  });
  b.part(new THREE.DodecahedronGeometry(0.08, 0), DESERT_ROCK, {
    bone: root,
    at: [0.68, BASE_TOP_Y + 0.03, 1.45],
    scale: [1.2, 0.5, 0.9],
    rotation: [20, -30, 10],
    group: "scenery",
  });

  // Route 66 Shield Signpost
  b.rod([0.72, BASE_TOP_Y, -1.05], [0.72, 0.65, -1.05], 0.014, DARK_CARBON, { bone: root, group: "scenery" });
  b.part(new THREE.BoxGeometry(0.24, 0.24, 0.008), "#ffffff", {
    bone: root,
    at: [0.72, 0.54, -1.04],
    dir: [0, 0, 1],
    axis: "z",
    texture: route66SignTex,
    group: "scenery",
  });

  // Spent brass shell casing on asphalt (Overwatch lore detail)
  b.rod([0.42, BASE_TOP_Y + 0.006, -0.3], [0.44, BASE_TOP_Y + 0.006, -0.26], 0.006, GOLD_BILLET, {
    bone: root,
    group: "scenery",
  });
>>>>>>> REPLACE
<<<<<<< SEARCH
  // Spent brass shell casing on asphalt (Overwatch lore detail)
  b.rod([0.42, BASE_TOP_Y + 0.006, -0.3], [0.44, BASE_TOP_Y + 0.006, -0.26], 0.006, GOLD_BILLET, {
    group: "scenery",
  });

  // ---------------------------------------------------------------------------
  // Skeleton Rig
  // ---------------------------------------------------------------------------
  // Geometry parameters:
  // Rear wheel: radius 0.35m, center y = BASE_TOP_Y + 0.35 = 0.39m, z = -0.72m
  // Front wheel: radius 0.39m, center y = BASE_TOP_Y + 0.39 = 0.43m, z = +1.30m
  const REAR_AXLE: [number, number, number] = [0, BASE_TOP_Y + 0.35, -0.72];
  const FRONT_AXLE: [number, number, number] = [0, BASE_TOP_Y + 0.39, 1.30];
  const STEERING_HEAD: [number, number, number] = [0, 0.88, 0.58];

  // Fork rake direction vector (from steering head down-forward to front axle)
  const forkDir = new THREE.Vector3(...FRONT_AXLE).sub(new THREE.Vector3(...STEERING_HEAD)).normalize();

  // Root joint
  const root = b.joint("root", { at: [0, 0, 0] });

  // Chassis / frame backbone
  const chassis = b.joint("chassis", { parent: root, at: [0, 0.45, 0.0], role: "spine" });

  // Steering neck / triple tree assembly
  const steering = b.joint("steering", { parent: chassis, at: STEERING_HEAD, dir: forkDir, role: "neck" });

  // Wheels
  const frontWheel = b.joint("frontWheel", { parent: steering, at: FRONT_AXLE, dir: [1, 0, 0], role: "hinge" });
  const rearWheel = b.joint("rearWheel", { parent: chassis, at: REAR_AXLE, dir: [1, 0, 0], role: "hinge" });

  // Handlebars
  const handlebars = b.joint("handlebars", { parent: steering, at: [0, 1.08, 0.52], role: "fan" });

  // Kickstand on left (+X) side
  const KICKSTAND_PIVOT: [number, number, number] = [0.12, 0.22, -0.05];
  const KICKSTAND_TIP: [number, number, number] = [0.32, BASE_TOP_Y + 0.005, 0.06];
  const kickstandDir = new THREE.Vector3(...KICKSTAND_TIP).sub(new THREE.Vector3(...KICKSTAND_PIVOT)).normalize();
  const kickstand = b.joint("kickstand", { parent: chassis, at: KICKSTAND_PIVOT, dir: kickstandDir, role: "hinge" });

  // ---------------------------------------------------------------------------
  // Frame & Chassis Construction
  // ---------------------------------------------------------------------------
=======
  // ---------------------------------------------------------------------------
  // Frame & Chassis Construction
  // ---------------------------------------------------------------------------
>>>>>>> REPLACE