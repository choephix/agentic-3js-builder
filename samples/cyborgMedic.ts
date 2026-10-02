import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { Joint } from "../src/skeleton";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Suture — Field Response Cyborg",
  description: "An original polished support hero with ceramic rescue armor, articulated synthetic limbs, a telemetry backpack, and a forked healing staff.",
  style: "Overwatch",
  commit: "e503085",
};

export default function build() {
  const b = createBuilder({ name: "cyborgMedic" });
  type Bone = Joint;
  type Point = THREE.Vector3 | number[];
  const C = {
    white: "#e4ecee", edge: "#f8faf3", shade: "#a5b8c0", dark: "#192e3d",
    rubber: "#0b1924", metal: "#627f91", teal: "#159da5", aqua: "#57f6ec",
    light: "#c4ffef", screen: "#073747",
  };
  const p = (bone: Bone, x = 0, y = 0, z = 0) => bone.at.clone().add(new THREE.Vector3(x, y, z));
  const mix = (a: Point, c: Point, t: number) => {
    const v = a instanceof THREE.Vector3 ? a.clone() : new THREE.Vector3(a[0], a[1], a[2]);
    const target = c instanceof THREE.Vector3 ? c : new THREE.Vector3(c[0], c[1], c[2]);
    return v.lerp(target, t);
  };

  // Skeleton first. Each armored segment belongs to its anatomical pivot.
  const hips = b.joint("hips", { at: [0, 0.99, 0], dir: [0, 1, 0], role: "spine" });
  const spine = b.chain("spine", [[0, 0.99, 0], [0, 1.17, 0], [0, 1.43, 0]], {
    parent: hips, names: ["lumbar", "chest", "collar"], role: "spine",
  });
  const chest = spine.joints[1];
  const neck = b.joint("neck", { parent: spine.joints[2], at: [0, 1.56, 0], dir: [0, 1, 0], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.77, 0.015], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: p(head, 0, -0.075, 0.065), dir: [0, 0, 1], role: "jaw" });
  const limbs = [1, -1].map((s) => {
    const suffix = s === 1 ? "L" : "R";
    const arm = b.chain(`arm${suffix}`, [[s * 0.255, 1.455, 0], [s * 0.465, 1.235, 0.035], [s * 0.635, 1.03, 0.08]], {
      parent: chest, names: [`shoulder${suffix}`, `elbow${suffix}`, `wrist${suffix}`], role: "arm",
    });
    const hand = b.joint(`hand${suffix}`, { parent: arm.joints[2], at: [s * 0.681, 0.98, 0.09], dir: [s * 0.45, -1, 0], role: "arm" });
    const leg = b.chain(`leg${suffix}`, [[s * 0.142, 0.975, 0], [s * 0.18, 0.575, 0.015], [s * 0.21, 0.16, 0]], {
      parent: hips, names: [`hip${suffix}`, `knee${suffix}`, `ankle${suffix}`], role: "leg", contact: [s * 0.21, 0, 0.105],
    });
    const toe = b.joint(`toe${suffix}`, { parent: leg.joints[2], at: [s * 0.21, 0.075, 0.16], dir: [0, 0, 1], role: "digit" });
    const fingers = [0, 1, 2, 3, 4].map((f) => {
      const thumb = f === 4;
      const start = p(hand, s * (thumb ? -0.048 : (f - 1.5) * 0.027), thumb ? 0.01 : -0.045, thumb ? 0.05 : 0.025);
      const middle = start.clone().add(new THREE.Vector3(s * (thumb ? -0.012 : 0.018), thumb ? -0.035 : -0.048, s === 1 ? 0.038 : 0.004));
      const end = middle.clone().add(new THREE.Vector3(s * (thumb ? 0.009 : 0.012), -0.03, s === 1 ? -0.015 : 0.009));
      const chain = b.chain(`${thumb ? "thumb" : `finger${f + 1}`}${suffix}`, [start, middle, end], { parent: hand, role: "digit" });
      return { chain, start, middle, end };
    });
    return { s, suffix, arm, hand, leg, toe, fingers };
  });
  const staffHand = limbs[0].hand;
  const staff = b.joint("healingStaff", { parent: staffHand, at: p(staffHand, 0.015, -0.05, 0.092), dir: [0, 1, 0], role: "hinge" });

  const box = (name: string, bone: Bone, at: Point, size: number[], color: string) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { bone, at, name });
  const ball = (name: string, bone: Bone, at: Point, size: number[], color: string) =>
    b.part(new THREE.SphereGeometry(1, 10, 6), color, { bone, at, scale: size, name });
  const rod = (name: string, bone: Bone, a: Point, c: Point, radius: number | [number, number], color: string) =>
    b.rod(a, c, radius, { bone, color, sides: 8, name });
  const plate = (name: string, bone: Bone, at: Point, w: number, h: number, depth: number, color: string, chamfer = 0.02) => {
    const x = w / 2, y = h / 2, k = Math.min(chamfer, x * 0.6, y * 0.6);
    return b.extrude([[-x + k, -y], [x - k, -y], [x, -y + k], [x, y - k], [x - k, y], [-x + k, y], [-x, y - k], [-x, -y + k]], {
      bone, at, x: [1, 0, 0], y: [0, 1, 0], thickness: depth, bevel: Math.min(0.01, depth / 4), detail: 0.5, color, name,
    });
  };
  const disc = (name: string, bone: Bone, at: Point, r: number, depth: number, color: string, dir: number[] = [0, 0, 1]) =>
    b.part(new THREE.CylinderGeometry(r, r, depth, 12), color, { bone, at, dir, name });
  const bolt = (name: string, bone: Bone, at: Point) => disc(name, bone, at, 0.009, 0.008, C.metal);

  const telemetry = svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 100"><rect width="180" height="100" rx="10" fill="#073747"/><path d="M8 64h26l9-20 13 37 15-61 13 44h39" fill="none" stroke="#a8ffeb" stroke-width="5"/><g fill="#57f6ec"><rect x="132" y="24" width="33" height="7"/><rect x="132" y="40" width="21" height="7"/><rect x="132" y="56" width="29" height="7"/></g><text x="10" y="20" fill="#ddfff5" font-size="12" font-family="monospace">LINK / 07</text><path d="M10 90h160" stroke="#1aa4ad" stroke-width="3"/></svg>`, { size: 256 });
  const labeling = svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path d="M10 18h54M10 27h35" stroke="#627f91" stroke-width="5"/><text x="8" y="82" fill="#193743" font-size="45" font-weight="bold" font-family="sans-serif">07</text><path d="M10 97h108" stroke="#159da5" stroke-width="7"/><g stroke="#627f91" stroke-width="3"><path d="M14 110v10m7-10v10m8-10v10m11-10v10m5-10v10m12-10v10m9-10v10"/></g></svg>`, { size: 256 });
  const decal = (name: string, bone: Bone, at: Point, size: number[], texture: THREE.Texture, dir = [0, 0, 1]) => b.part(new THREE.PlaneGeometry(size[0], size[1]), "#ffffff", { at, bone, dir, axis: "z", texture, name });

  // Flexible undersuit between separate ceramic shells, with exposed rib segments.
  b.sweep(spine, [0.135, 0.17], { color: C.dark, sides: 8, caps: "flat", name: "flexibleTorso" });
  plate("pelvicShell", hips, p(hips, 0, -0.015, 0), 0.36, 0.175, 0.24, C.dark, 0.045);
  plate("pelvicFront", hips, p(hips, 0, -0.003, 0.133), 0.27, 0.135, 0.045, C.white, 0.04);
  plate("beltBuckle", hips, p(hips, 0, 0.055, 0.158), 0.092, 0.064, 0.035, C.teal);
  glow(box("beltLink", hips, p(hips, 0, 0.055, 0.178), [0.042, 0.012, 0.008], C.aqua));
  for (let i = 0; i < 3; i++) {
    plate(`abdominalPlate${i}`, spine.joints[0], [0, 1.072 + i * 0.056, 0.108], 0.205 + i * 0.025, 0.044, 0.045, i === 2 ? C.teal : C.shade, 0.014);
    for (const s of [-1, 1]) rod(`ribHose${i}${s}`, spine.joints[0], [s * 0.118, 1.06 + i * 0.045, -0.068], [s * 0.143, 1.07 + i * 0.045, 0.063], 0.015, C.metal);
  }
  b.loft([{ at: [0, 1.21, 0], w: 0.34, h: 0.22 }, { at: [0, 1.39, 0], w: 0.49, h: 0.285 }, { at: [0, 1.48, 0], w: 0.40, h: 0.23 }], { bone: chest, color: C.white, section: { ngon: 8 }, caps: "flat", name: "thoracicArmor" });
  for (const s of [-1, 1]) {
    b.extrude([[0.025, -0.07], [0.163, -0.11], [0.229, 0.063], [0.163, 0.11], [0.046, 0.078]], { at: [0, 1.365, 0.144], x: [s, 0, 0], y: [0, 1, 0], thickness: 0.035, bevel: 0.008, detail: 0.5, color: C.edge, bone: chest, name: `pectoralPlate${s}` });
    rod(`collarTrim${s}`, chest, [s * 0.035, 1.466, 0.111], [s * 0.176, 1.45, 0.11], 0.014, C.teal);
    bolt(`chestBolt${s}`, chest, [s * 0.187, 1.415, 0.17]);
  }
  disc("sternumSocket", chest, [0, 1.365, 0.166], 0.079, 0.029, C.dark);
  disc("sternumRim", chest, [0, 1.365, 0.185], 0.061, 0.018, C.teal);
  glow(disc("sternumCore", chest, [0, 1.365, 0.197], 0.044, 0.009, C.aqua), 1.3);
  box("sternumCoreDivider", chest, [0, 1.365, 0.204], [0.013, 0.065, 0.01], C.white);
  plate("chestMonitorHousing", chest, [0, 1.239, 0.15], 0.154, 0.081, 0.02, C.dark, 0.01);
  glow(decal("chestMonitor", chest, [0, 1.239, 0.161], [0.136, 0.07], telemetry), 0.65);

  rod("neckServo", neck, p(neck, 0, -0.065), p(neck, 0, 0.085), 0.065, C.metal);
  for (let i = 0; i < 3; i++) disc(`neckSeal${i}`, neck, p(neck, 0, -0.025 + i * 0.025), 0.075, 0.012, C.rubber, [0, 1, 0]);
  for (const s of [-1, 1]) plate(`collarFin${s}`, chest, [s * 0.115, 1.51, -0.027], 0.074, 0.105, 0.17, C.white);

  // Helmet: broad brow, inset segmented eyes, separate jaw, temple hardware.
  ball("helmetCore", head, head.at, [0.154, 0.191, 0.147], C.white);
  plate("helmetCrown", head, p(head, 0, 0.126, 0.003), 0.235, 0.12, 0.236, C.white, 0.038);
  plate("visorSurround", head, p(head, 0, 0.012, 0.126), 0.298, 0.133, 0.065, C.dark, 0.035);
  plate("visorGlass", head, p(head, 0, 0.019, 0.163), 0.255, 0.088, 0.014, C.screen, 0.027);
  for (const s of [-1, 1]) {
    glow(plate(`eyeLight${s}`, head, p(head, s * 0.062, 0.021, 0.174), 0.081, 0.022, 0.008, C.aqua, 0.007), 1.8);
    box(`eyeGlint${s}`, head, p(head, s * 0.085, 0.029, 0.18), [0.014, 0.007, 0.008], C.light);
    plate(`brow${s}`, head, p(head, s * 0.069, 0.082, 0.144), 0.142, 0.027, 0.04, C.edge, 0.008);
    disc(`templeSocket${s}`, head, p(head, s * 0.154, -0.014, -0.004), 0.075, 0.036, C.dark, [s, 0, 0]);
    disc(`templeCover${s}`, head, p(head, s * 0.177, -0.014, -0.004), 0.057, 0.018, C.white, [s, 0, 0]);
    glow(disc(`templeSensor${s}`, head, p(head, s * 0.19, -0.014, -0.004), 0.026, 0.009, C.teal, [s, 0, 0]));
    plate(`cheekPanel${s}`, head, p(head, s * 0.117, -0.08, 0.113), 0.059, 0.11, 0.05, C.shade, 0.02);
    rod(`cheekLight${s}`, head, p(head, s * 0.107, -0.096, 0.143), p(head, s * 0.123, -0.052, 0.145), 0.006, C.aqua);
  }
  plate("lowerJaw", jaw, p(jaw, 0, -0.04, 0.044), 0.185, 0.087, 0.105, C.white, 0.03);
  plate("mouthSeam", jaw, p(jaw, 0, -0.009, 0.104), 0.093, 0.016, 0.009, C.rubber, 0.005);
  for (const x of [-0.027, 0, 0.027]) box(`jawVent${x}`, jaw, p(jaw, x, -0.045, 0.104), [0.009, 0.022, 0.009], C.dark);
  plate("foreheadStripe", head, p(head, 0, 0.138, 0.128), 0.041, 0.083, 0.022, C.teal, 0.008);
  bolt("foreheadFastener", head, p(head, 0, 0.166, 0.142));
  rod("communicationsMast", head, p(head, -0.154, 0.05, -0.035), p(head, -0.174, 0.255, -0.035), 0.011, C.dark);
  glow(ball("mastTip", head, p(head, -0.174, 0.255, -0.035), [0.014, 0.018, 0.014], C.aqua));

  // Articulated limbs: dark hinge gaps remain readable in neutral and flexed poses.
  for (const { s, suffix, arm, hand, leg, toe, fingers } of limbs) {
    const [shoulder, elbow, wrist] = arm.joints;
    const [hip, knee, ankle] = leg.joints;
    b.sweep(arm, [0.071, 0.061, 0.047], { color: C.dark, sides: 8, name: `armUndersuit${suffix}` });
    ball(`shoulderJoint${suffix}`, shoulder, shoulder.at, [0.104, 0.106, 0.105], C.dark);
    ball(`pauldron${suffix}`, shoulder, p(shoulder, s * 0.016, 0.017, 0), [0.157, 0.121, 0.143], C.white);
    plate(`shoulderFacing${suffix}`, shoulder, p(shoulder, s * 0.034, 0.017, 0.112), 0.205, 0.12, 0.042, C.teal, 0.028);
    plate(`shoulderInsert${suffix}`, shoulder, p(shoulder, s * 0.034, 0.019, 0.137), 0.13, 0.074, 0.012, C.white, 0.018);
    if (s === -1) decal("unitNumber", shoulder, p(shoulder, s * 0.034, 0.019, 0.145), [0.105, 0.068], labeling);
    else {
      glow(box("rescueBarVertical", shoulder, p(shoulder, 0.034, 0.019, 0.148), [0.019, 0.052, 0.01], C.aqua));
      glow(box("rescueBarHorizontal", shoulder, p(shoulder, 0.034, 0.019, 0.148), [0.06, 0.019, 0.01], C.aqua));
    }
    rod(`upperArmShell${suffix}`, shoulder, mix(shoulder.at, elbow.at, 0.28), mix(shoulder.at, elbow.at, 0.79), [0.092, 0.077], C.shade);
    rod(`upperArmRail${suffix}`, shoulder, mix(p(shoulder, 0, 0, 0.079), p(elbow, 0, 0, 0.071), 0.3), mix(p(shoulder, 0, 0, 0.079), p(elbow, 0, 0, 0.071), 0.74), 0.023, C.white);
    disc(`elbowAxis${suffix}`, elbow, p(elbow, s * 0.049), 0.055, 0.055, C.metal, [s, 0, 0]);
    disc(`elbowCap${suffix}`, elbow, p(elbow, s * 0.08), 0.036, 0.014, C.teal, [s, 0, 0]);
    rod(`forearmShell${suffix}`, elbow, mix(elbow.at, wrist.at, 0.19), mix(elbow.at, wrist.at, 0.85), [0.099, 0.069], C.white);
    const fore = mix(elbow.at, wrist.at, 0.5);
    plate(`gauntletPanel${suffix}`, elbow, fore.clone().add(new THREE.Vector3(0, 0, 0.08)), 0.105, 0.123, 0.029, C.dark);
    if (s === -1) glow(decal("wristTelemetry", elbow, fore.clone().add(new THREE.Vector3(0, 0, 0.097)), [0.082, 0.059], telemetry), 0.65);
    else for (let i = 0; i < 3; i++) glow(box(`gauntletCharge${i}`, elbow, fore.clone().add(new THREE.Vector3(0, 0.032 - i * 0.031, 0.099)), [0.055, 0.01, 0.007], C.aqua));
    for (const d of [-1, 1]) bolt(`forearmFastener${suffix}${d}`, elbow, fore.clone().add(new THREE.Vector3(d * 0.033, 0.05, 0.102)));
    ball(`wristPivot${suffix}`, wrist, wrist.at, [0.05, 0.049, 0.052], C.metal);
    plate(`palm${suffix}`, hand, hand.at, 0.124, 0.126, 0.086, C.dark, 0.023);
    plate(`handDorsal${suffix}`, hand, p(hand, 0, 0.009, -0.052), 0.10, 0.09, 0.02, C.white);
    fingers.forEach(({ chain, start, middle, end }, i) => {
      b.sweep(chain, [0.014, 0.012], { color: C.metal, sides: 6, name: `fingerLink${suffix}${i}` });
      rod(`fingerArmorA${suffix}${i}`, chain.joints[0], mix(start, middle, 0.1), mix(start, middle, 0.7), 0.016, C.white);
      rod(`fingerArmorB${suffix}${i}`, chain.joints[1], mix(middle, end, 0.17), end, 0.014, C.dark);
    });

    b.sweep(leg, [0.105, 0.074, 0.06], { color: C.dark, sides: 8, caps: "flat", name: `legUndersuit${suffix}` });
    rod(`thighArmor${suffix}`, hip, mix(hip.at, knee.at, 0.13), mix(hip.at, knee.at, 0.8), [0.117, 0.087], C.white);
    plate(`thighPanel${suffix}`, hip, mix(p(hip, 0, 0, 0.099), p(knee, 0, 0, 0.088), 0.43), 0.133, 0.21, 0.043, C.shade, 0.033);
    plate(`thighStripe${suffix}`, hip, mix(p(hip, s * 0.048, 0, 0.131), p(knee, s * 0.035, 0, 0.106), 0.41), 0.025, 0.155, 0.015, C.teal, 0.008);
    disc(`kneePivot${suffix}`, knee, p(knee, s * 0.062), 0.066, 0.06, C.metal, [s, 0, 0]);
    plate(`kneePad${suffix}`, knee, p(knee, 0, 0.005, 0.069), 0.159, 0.135, 0.063, C.dark, 0.032);
    plate(`kneeCover${suffix}`, knee, p(knee, 0, 0.007, 0.11), 0.114, 0.08, 0.033, C.white);
    rod(`calfShell${suffix}`, knee, mix(knee.at, ankle.at, 0.22), mix(knee.at, ankle.at, 0.85), [0.103, 0.076], C.white);
    plate(`shinRail${suffix}`, knee, mix(p(knee, 0, 0, 0.093), p(ankle, 0, 0, 0.088), 0.56), 0.078, 0.222, 0.025, C.teal);
    glow(box(`shinIndicator${suffix}`, knee, mix(p(knee, 0, 0, 0.111), p(ankle, 0, 0, 0.106), 0.52), [0.014, 0.105, 0.009], C.aqua));
    for (const x of [-1, 1]) rod(`calfPiston${suffix}${x}`, knee, p(knee, x * 0.05, -0.09, -0.073), p(ankle, x * 0.041, 0.04, -0.069), 0.015, C.metal);
    ball(`ankleServo${suffix}`, ankle, ankle.at, [0.065, 0.055, 0.065], C.dark);
    plate(`bootHeel${suffix}`, ankle, p(ankle, 0, -0.08, 0.031), 0.189, 0.16, 0.263, C.dark, 0.024);
    plate(`bootInstep${suffix}`, ankle, p(ankle, 0, -0.025, 0.085), 0.174, 0.078, 0.244, C.white, 0.02);
    plate(`toeCap${suffix}`, toe, p(toe, 0, -0.006, 0.055), 0.204, 0.11, 0.188, C.white, 0.028);
    box(`toeSole${suffix}`, toe, p(toe, 0, -0.059, 0.055), [0.211, 0.032, 0.201], C.rubber);
    plate(`toeBumper${suffix}`, toe, p(toe, 0, -0.013, 0.151), 0.16, 0.058, 0.018, C.teal, 0.01);
    for (let i = 0; i < 3; i++) box(`bootTread${suffix}${i}`, toe, p(toe, -0.064 + i * 0.064, -0.06, 0.16), [0.027, 0.03, 0.012], C.metal);
    plate(`hipUtilityCase${suffix}`, hips, p(hips, s * 0.225, -0.035, 0.008), 0.12, 0.162, 0.13, C.teal);
    plate(`hipCaseLid${suffix}`, hips, p(hips, s * 0.225, 0.021, 0.02), 0.126, 0.044, 0.143, C.white);
    box(`hipCaseLatch${suffix}`, hips, p(hips, s * 0.225, -0.015, 0.078), [0.037, 0.04, 0.014], C.dark);
  }

  // Rear lifesupport module, replaceable serum cartridges, vents and insulated feed lines.
  plate("backpackHarness", chest, [0, 1.32, -0.155], 0.348, 0.38, 0.087, C.dark, 0.045);
  plate("backpackShell", chest, [0, 1.33, -0.222], 0.279, 0.313, 0.09, C.white, 0.038);
  plate("backpackCenter", chest, [0, 1.335, -0.281], 0.08, 0.24, 0.036, C.teal);
  for (const s of [-1, 1]) {
    const x = s * 0.184;
    rod(`serumCanister${s}`, chest, [x, 1.21, -0.207], [x, 1.445, -0.207], 0.048, C.shade);
    rod(`serumFluid${s}`, chest, [x, 1.255, -0.211], [x, 1.402, -0.211], 0.049, C.teal);
    for (const y of [1.239, 1.42]) rod(`canisterRing${s}${y}`, chest, [x, y - 0.013, -0.207], [x, y + 0.013, -0.207], 0.057, C.dark);
    for (let i = 0; i < 5; i++) box(`cartridgeTick${s}${i}`, chest, [x, 1.281 + i * 0.022, -0.261], [i % 2 ? 0.018 : 0.032, 0.005, 0.006], C.light);
    b.sweep([[x, 1.448, -0.211], [s * 0.225, 1.505, -0.16], [s * 0.20, 1.48, -0.061]], 0.016, { color: C.dark, bone: chest, sides: 8, name: `supplyTube${s}` });
  }
  for (let i = 0; i < 5; i++) for (const s of [-1, 1]) box(`backExhaust${s}${i}`, chest, [s * 0.077, 1.254 + i * 0.03, -0.272], [0.051, 0.012, 0.012], C.dark);
  glow(box("rearPowerStatus", chest, [0, 1.37, -0.306], [0.017, 0.135, 0.012], C.aqua));
  decal("rearServiceLabel", chest, [0, 1.207, -0.275], [0.105, 0.057], labeling, [0, 0, -1]);

  // Staff stays entirely on the gripping hand's attachment joint, including its emitter.
  const sp = (x: number, y: number, z = 0) => p(staff, x, y, z);
  rod("staffShaft", staff, sp(0, -0.86), sp(0, 0.87), 0.025, C.white);
  rod("staffLowerSleeve", staff, sp(0, -0.70), sp(0, -0.3), 0.03, C.dark);
  rod("staffGrip", staff, sp(0, -0.105), sp(0, 0.15), 0.034, C.rubber);
  for (let i = 0; i < 8; i++) disc(`staffGripRib${i}`, staff, sp(0, -0.09 + i * 0.031), 0.037, 0.009, C.metal, [0, 1, 0]);
  for (const y of [-0.72, -0.3, 0.17, 0.68, 0.855]) disc(`staffCollar${y}`, staff, sp(0, y), 0.044, 0.029, C.teal, [0, 1, 0]);
  plate("staffControl", staff, sp(0, 0.27, 0.022), 0.083, 0.158, 0.05, C.dark);
  glow(box("staffReadout", staff, sp(0, 0.29, 0.051), [0.019, 0.072, 0.01], C.aqua));
  bolt("staffTrigger", staff, sp(0, 0.222, 0.053));
  rod("staffLuminousSpine", staff, sp(0, 0.39, 0.027), sp(0, 0.7, 0.027), 0.009, C.teal);
  rod("staffHeel", staff, sp(0, -0.86), sp(0, -0.82), 0.041, C.dark);
  const crown = sp(0, 0.94);
  for (const s of [-1, 1]) {
    b.extrude([[0.005, -0.12], [0.088, -0.10], [0.171, 0.015], [0.146, 0.182], [0.103, 0.202], [0.108, 0.025], [0.04, -0.025]], { bone: staff, at: crown, x: [s, 0, 0], y: [0, 1, 0], color: C.white, thickness: 0.09, bevel: 0.013, detail: 0.5, name: `emitterFork${s}` });
    b.extrude([[0.077, -0.03], [0.127, 0.028], [0.12, 0.147], [0.104, 0.153], [0.105, 0.035], [0.064, -0.015]], { bone: staff, at: crown.clone().add(new THREE.Vector3(0, 0, 0.05)), x: [s, 0, 0], y: [0, 1, 0], color: C.teal, thickness: 0.012, name: `emitterTrack${s}` });
    disc(`emitterBolt${s}`, staff, crown.clone().add(new THREE.Vector3(s * 0.135, 0.013, 0.057)), 0.02, 0.012, C.metal);
    glow(ball(`emitterContact${s}`, staff, crown.clone().add(new THREE.Vector3(s * 0.104, 0.14, 0)), [0.019, 0.031, 0.03], C.aqua));
  }
  disc("staffEmitterSocket", staff, crown, 0.048, 0.106, C.dark);
  glow(ball("healingNucleus", staff, crown.clone().add(new THREE.Vector3(0, 0.10, 0)), [0.073, 0.093, 0.064], C.aqua), 1.8);
  glow(ball("healingNucleusInner", staff, crown.clone().add(new THREE.Vector3(0, 0.107, 0.05)), [0.035, 0.049, 0.024], C.light), 1.5);
  glow(box("staffCrossVertical", staff, crown.clone().add(new THREE.Vector3(0, 0.108, 0.082)), [0.018, 0.065, 0.012], C.light), 1.4);
  glow(box("staffCrossHorizontal", staff, crown.clone().add(new THREE.Vector3(0, 0.108, 0.082)), [0.065, 0.018, 0.012], C.light), 1.4);
  b.part(new THREE.TorusGeometry(0.094, 0.009, 5, 16), C.teal, { bone: staff, at: crown.clone().add(new THREE.Vector3(0, 0.095, 0)), rotation: [65, 0, 0], name: "nucleusContainmentRing" });
  return b.root;
}
