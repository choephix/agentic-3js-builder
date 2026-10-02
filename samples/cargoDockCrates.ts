import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { Joint } from "../src/skeleton";
import { catmull, polyline } from "../src/path";
import { paint } from "../src/paint";
import type { Paint } from "../src/paint";
import { svg } from "../src/texture";

export const meta = {
  name: "Pier 07 — Cargo Transfer",
  description: "An armored dockside freight cluster with interlocking cargo cases, fluid drums, a compact loading jib and a working pallet jack.",
  style: "Overwatch",
  commit: "e503085",
};

const C = {
  dark: "#182938", frame: "#334b5d", steel: "#78939f", silver: "#b4c5cb",
  cream: "#dce1d8", white: "#f5f0df", orange: "#f47a30", light: "#ffb05b", teal: "#2fc6c0",
  rubber: "#111e28", recess: "#283c48", wood: "#997450", woodLight: "#b99b6e",
};
type Point = [number, number, number];
type Fill = string | Paint;

export default function build() {
  const b = createBuilder({ name: "cargoDockCrates", detail: 0.65, paintSize: 1024 });
  const root = b.joint("dock", { at: [0, 0, 0] });
  const jib = b.joint("jibSwivel", { parent: root, at: [-1.48, 2.65, -0.94], dir: [1, 0, 0], role: "hinge" });
  const hook = b.joint("hookSwivel", { parent: jib, at: [-1.42, 1.62, 0.42], dir: [1, 0, 0], role: "hinge" });
  const latch = b.joint("hookSafetyLatch", { parent: hook, at: [-1.39, 1.36, 0.42], dir: [0, 0, 1], role: "hinge" });
  const steering = b.joint("jackSteering", { parent: root, at: [0.78, 0.4, 1.15], dir: [1, 0, 0], role: "hinge" });
  const handle = b.joint("jackHandle", { parent: steering, at: [0.78, 0.51, 1.15], dir: [0, 0, 1], role: "hinge" });
  const rearWheel = b.joint("jackSteerWheels", { parent: steering, at: [0.78, 0.255, 1.15], dir: [0, 0, 1], role: "hinge" });
  const rollerL = b.joint("jackLoadRollerL", { parent: root, at: [0.54, 0.205, 0.04], dir: [0, 0, 1], role: "hinge" });
  const rollerR = b.joint("jackLoadRollerR", { parent: root, at: [1.02, 0.205, 0.04], dir: [0, 0, 1], role: "hinge" });
  let n = 0;
  const box = (label: string, at: Point, size: Point, color: Fill, bone = root, rotation?: Point) => b.part(new THREE.BoxGeometry(...size), color, { at, bone, rotation, name: `${label}${n++}` });
  const cyl = (label: string, at: Point, radius: number, height: number, color: Fill, bone = root, dir: Point = [0, 1, 0], segments = 12) => b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, { at, bone, dir, name: `${label}${n++}` });
  const tube = (label: string, a: Point, z: Point, radius: number, color: Fill, bone = root) => b.rod(a, z, radius, { color, bone, sides: 8, name: `${label}${n++}` });
  const shell = (label: string, at: Point, size: Point, color: Fill, bone = root, bevel = 0.022) => {
    const [w, h, d] = size;
    const k = Math.min(w, h) * 0.13;
    return b.extrude([[-w / 2 + k, -h / 2], [w / 2 - k, -h / 2], [w / 2, -h / 2 + k], [w / 2, h / 2 - k], [w / 2 - k, h / 2], [-w / 2 + k, h / 2], [-w / 2, h / 2 - k], [-w / 2, -h / 2 + k]], { at, x: [1, 0, 0], y: [0, 1, 0], thickness: d, bevel, detail: 0.35, bone, color, name: `${label}${n++}` });
  };
  const hazard = paint((p) => ((p.x + p.y + p.z) / 0.09 % 1 + 1) % 1 < 0.48 ? C.orange : C.dark);
  const shipping = svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 150"><rect width="320" height="150" rx="12" fill="#dce1d8"/><path d="M15 20H305M15 125H305" stroke="#334b5d" stroke-width="5"/><text x="20" y="62" font-family="sans-serif" font-size="35" font-weight="bold" fill="#182938">07 / FREIGHT</text><text x="20" y="90" font-family="monospace" font-size="17" fill="#334b5d">PORT TRANSFER / 420 KG</text><path d="M20 100v20m7-20v20m10-20v20m4-20v20m11-20v20m9-20v20m4-20v20m8-20v20m12-20v20m5-20v20m9-20v20m5-20v20m11-20v20m4-20v20m8-20v20m10-20v20" stroke="#182938" stroke-width="3"/><path d="M249 114V86m-10 10 10-10 10 10m19 18V86m-10 10 10-10 10 10" fill="none" stroke="#182938" stroke-width="6"/></svg>`, { size: 512 });
  const fluidLabel = svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 200"><rect x="3" y="3" width="174" height="194" rx="12" fill="#dce1d8"/><path d="m90 22 46 45-46 45-46-45Z" fill="#f47a30"/><path d="M90 44c-7 12-17 19-17 29a17 17 0 0 0 34 0c0-10-10-17-17-29Z" fill="#182938"/><text x="90" y="145" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="28" fill="#182938">H / 200</text><path d="M28 161H152M43 177H137" stroke="#334b5d" stroke-width="7"/></svg>`, { size: 256 });
  const sign = svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 120"><rect width="350" height="120" rx="15" fill="#182938"/><text x="20" y="75" fill="#f5f0df" font-family="sans-serif" font-size="60" font-weight="bold">PIER 07</text><path d="m276 35 36 26-36 26" fill="none" stroke="#f47a30" stroke-width="14"/></svg>`, { size: 512 });

  // Low modular quay pad: all objects have real contact with this surface.
  shell("dockPad", [0, 0.06, 0], [3.9, 0.12, 3.5], C.dark, root, 0.015);
  box("deck", [0, 0.13, 0], [3.76, 0.02, 3.35], C.frame);
  for (let i = 0; i < 6; i++) {
    const x = -1.55 + i * 0.62;
    box("deckExpansion", [x, 0.145, 0], [0.015, 0.009, 3.25], C.dark);
    for (const z of [-1.49, 1.49]) cyl("deckFastener", [x, 0.15, z], 0.021, 0.012, C.steel, root, [0, 1, 0], 6);
  }
  for (const x of [-1.8, 1.8]) box("edgeSafety", [x, 0.151, 0], [0.05, 0.008, 3.22], C.orange);
  for (const z of [-1.59, 1.59]) box("edgeSafety", [0, 0.151, z], [3.55, 0.008, 0.05], C.orange);
  b.part(new THREE.PlaneGeometry(0.67, 0.23), C.white, { at: [-0.3, 0.18, 1.753], dir: [0, 1, 0], axis: "z", bone: root, texture: sign, name: "pierPlaque" });
  for (let i = 0; i < 9; i++) box("drainSlot", [-1.32 + i * 0.072, 0.152, 1.38], [0.031, 0.007, 0.22], C.rubber);
  for (const x of [-1.73, 1.73]) for (const z of [-1.47, 1.47]) {
    box("tieDownSocket", [x, 0.162, z], [0.15, 0.022, 0.15], C.dark);
    b.part(new THREE.TorusGeometry(0.045, 0.012, 5, 10), C.silver, { at: [x, 0.18, z], bone: root, rotation: [65, 0, 0], name: `tieDown${n++}` });
  }

  const pallet = (x: number, z: number, w: number, d: number) => {
    for (const side of [-1, 0, 1]) {
      box("palletRunner", [x + side * w * 0.37, 0.2, z], [w * 0.15, 0.12, d], C.wood);
      for (const end of [-1, 1]) box("runnerEndCap", [x + side * w * 0.37, 0.2, z + end * d * 0.5], [w * 0.16, 0.12, 0.028], C.frame);
    }
    for (let i = 0; i < 6; i++) {
      const zz = z - d * 0.42 + i * d * 0.168;
      box("palletPlank", [x, 0.293, zz], [w, 0.066, d * 0.13], C.woodLight);
      for (const s of [-1, 1]) cyl("palletNail", [x + s * w * 0.4, 0.331, zz], 0.013, 0.008, C.dark, root, [0, 1, 0], 6);
    }
  };

  const crate = (id: string, x: number, bottom: number, z: number, w: number, h: number, d: number, orange = false) => {
    const y = bottom + h / 2;
    shell(`${id}Chassis`, [x, y, z], [w, h, d], C.dark);
    shell(`${id}Shell`, [x, y, z], [w - 0.05, h - 0.075, d + 0.008], orange ? C.orange : C.cream);
    for (const s of [-1, 1]) {
      const zz = z + s * (d / 2 + 0.018);
      shell(`${id}Inset`, [x, y, zz], [w * 0.79, h * 0.66, 0.035], C.frame, root, 0.009);
      shell(`${id}Panel`, [x, y + 0.018, zz + s * 0.021], [w * 0.69, h * 0.55, 0.018], orange ? C.light : C.cream, root, 0.004);
      box(`${id}OrangeBand`, [x, y + h * 0.225, zz + s * 0.034], [w * 0.68, 0.068, 0.015], C.orange);
      b.part(new THREE.PlaneGeometry(w * 0.38, h * 0.27), C.white, { at: [x, y - 0.014, zz + s * 0.042], dir: [0, 0, s], axis: "z", bone: root, texture: shipping, name: `${id}Manifest${s}` });
      for (const sx of [-1, 1]) {
        shell(`${id}Corner`, [x + sx * (w / 2 - 0.065), y, zz], [0.13, h, 0.085], C.frame, root, 0.012);
        for (const sy of [-1, 1]) cyl(`${id}HexBolt`, [x + sx * (w / 2 - 0.065), y + sy * h * 0.36, zz + s * 0.051], 0.023, 0.016, C.silver, root, [0, 0, s], 6);
        box(`${id}Latch`, [x + sx * w * 0.3, y - h * 0.17, zz + s * 0.041], [0.065, 0.115, 0.033], C.dark);
        box(`${id}LatchLever`, [x + sx * w * 0.3, y - h * 0.16, zz + s * 0.063], [0.035, 0.064, 0.018], C.silver);
      }
    }
    for (const sx of [-1, 1]) {
      const xx = x + sx * (w / 2 + 0.01);
      box(`${id}HandleRecess`, [xx, y + h * 0.1, z], [0.025, 0.13, d * 0.4], C.dark);
      tube(`${id}Handle`, [xx + sx * 0.018, y + h * 0.1, z - d * 0.14], [xx + sx * 0.018, y + h * 0.1, z + d * 0.14], 0.022, C.steel);
      for (const sz of [-1, 1]) box(`${id}SideRail`, [xx, y, z + sz * d * 0.36], [0.035, h * 0.65, 0.052], C.frame);
    }
    box(`${id}LidSeam`, [x, bottom + h - 0.027, z], [w * 0.75, 0.022, d * 0.78], C.dark);
    box(`${id}Lid`, [x, bottom + h - 0.008, z], [w * 0.67, 0.022, d * 0.69], C.cream);
    for (const s of [-1, 1]) box(`${id}StackingRail`, [x + s * w * 0.3, bottom + h + 0.017, z], [0.09, 0.035, d * 0.81], C.frame);
    for (let i = 0; i < 4; i++) box(`${id}CoolingGroove`, [x - w * 0.2 + i * w * 0.13, bottom + h + 0.007, z], [0.034, 0.008, d * 0.36], C.steel);
  };
  pallet(-0.4, -0.66, 1.28, 1.0);
  crate("baseCase", -0.4, 0.33, -0.66, 1.13, 0.71, 0.87);
  crate("upperCase", -0.4, 1.075, -0.66, 1.03, 0.61, 0.8);
  crate("smallCase", -0.5, 1.72, -0.66, 0.75, 0.43, 0.61, true);
  pallet(0.82, -0.22, 1.0, 0.94);
  crate("jackCase", 0.82, 0.33, -0.22, 0.9, 0.75, 0.8);

  // Steel fluid drums: faceted rolled shoulders, recessed lids, bungs and cargo labels.
  for (const [x, z] of [[1.4, -1.04], [1.5, 0.7]] as const) {
    const drum = b.lathe([[0, 0], [0.28, 0], [0.305, 0.035], [0.305, 0.075], [0.285, 0.105], [0.285, 0.76], [0.305, 0.79], [0.305, 0.85], [0.28, 0.875], [0, 0.875]], { at: [x, 0.14, z], color: C.orange, bone: root, segments: 16, name: `drum${n++}` });
    for (const y of [0.19, 0.43, 0.72, 0.96]) b.part(new THREE.TorusGeometry(0.289, 0.022, 5, 16), C.frame, { at: [x, y, z], bone: root, rotation: [90, 0, 0], name: `drumHoop${n++}` });
    cyl("drumLid", [x, 1.02, z], 0.263, 0.012, C.cream, root, [0, 1, 0], 16);
    for (const dx of [-0.15, 0.15]) {
      cyl("bungRecess", [x + dx, 1.032, z], 0.046, 0.016, C.dark);
      cyl("bung", [x + dx, 1.045, z], 0.03, 0.018, C.silver, root, [0, 1, 0], 6);
      box("bungSlot", [x + dx, 1.057, z], [0.04, 0.007, 0.008], C.dark);
    }
    b.decal(drum, fluidLabel, { at: [x, 0.61, z + 0.286], dir: [0, 0, 1], size: [0.2, 0.27], segments: 4, bone: root, name: `drumLabel${n++}` });
    box("lidHandle", [x, 1.044, z - 0.1], [0.13, 0.025, 0.025], C.frame);
  }

  // A compact dock jib puts the large forged hook in open negative space, not across the crates.
  shell("jibFoot", [-1.48, 0.23, -0.94], [0.55, 0.18, 0.54], C.dark);
  for (const x of [-1.68, -1.28]) for (const z of [-1.14, -0.74]) cyl("anchorBolt", [x, 0.335, z], 0.035, 0.025, C.silver, root, [0, 1, 0], 6);
  shell("jibMast", [-1.48, 1.42, -0.94], [0.24, 2.22, 0.28], C.cream);
  box("mastInset", [-1.48, 1.41, -0.788], [0.13, 1.77, 0.028], C.dark);
  box("mastOrange", [-1.48, 1.39, -0.766], [0.047, 1.5, 0.013], C.orange);
  for (const y of [0.49, 1.14, 1.79, 2.41]) shell("mastCollar", [-1.48, y, -0.94], [0.31, 0.13, 0.35], C.frame, root, 0.01);
  cyl("jibBearing", [-1.48, 2.58, -0.94], 0.19, 0.18, C.orange);
  shell("jibHead", [-1.48, 2.72, -0.94], [0.36, 0.23, 0.4], C.dark, jib);
  box("jibBeam", [-1.48, 2.72, -0.25], [0.22, 0.17, 1.55], C.cream, jib);
  box("jibBeamInset", [-1.358, 2.72, -0.25], [0.024, 0.085, 1.3], C.orange, jib);
  tube("jibTensionRod", [-1.48, 2.84, -0.9], [-1.48, 2.79, 0.45], 0.025, C.steel, jib);
  shell("pulleyHousing", [-1.48, 2.68, 0.48], [0.32, 0.31, 0.24], C.orange, jib);
  cyl("pulleyAxle", [-1.48, 2.67, 0.48], 0.085, 0.36, C.steel, jib, [1, 0, 0]);
  tube("hoistCableA", [-1.53, 2.61, 0.42], [-1.53, 1.69, 0.42], 0.015, C.dark, jib);
  tube("hoistCableB", [-1.36, 2.61, 0.42], [-1.36, 1.69, 0.42], 0.015, C.dark, jib);
  shell("hookBlock", [-1.445, 1.65, 0.42], [0.35, 0.3, 0.2], hazard, jib);
  cyl("hookBlockAxle", [-1.445, 1.65, 0.42], 0.075, 0.23, C.silver, jib, [0, 0, 1]);
  cyl("hookNeck", [-1.445, 1.43, 0.42], 0.066, 0.17, C.steel, hook);
  b.sweep(catmull([[-1.445, 1.41, 0.42], [-1.5, 1.24, 0.42], [-1.63, 1.08, 0.42], [-1.55, 0.96, 0.42], [-1.36, 0.98, 0.42], [-1.24, 1.14, 0.42]]), [0.075, 0.084, 0.095, 0.063, 0.02], { bone: hook, color: C.silver, sides: 8, caps: "flat", name: "forgedCargoHook" });
  tube("hookSafetyGate", [-1.39, 1.36, 0.42], [-1.24, 1.14, 0.42], 0.022, C.orange, latch);
  cyl("latchPin", [-1.39, 1.36, 0.42], 0.036, 0.16, C.dark, latch, [0, 0, 1], 8);
  // Side-mounted hand-winch and a connected control cable.
  cyl("winchDrum", [-1.67, 0.81, -0.94], 0.16, 0.22, C.frame, root, [1, 0, 0]);
  cyl("winchPlate", [-1.79, 0.81, -0.94], 0.19, 0.035, C.orange, root, [1, 0, 0]);
  tube("winchCrank", [-1.82, 0.81, -0.94], [-1.82, 0.66, -0.94], 0.024, C.silver);
  tube("winchGrip", [-1.82, 0.66, -0.94], [-1.91, 0.66, -0.94], 0.033, C.rubber);
  b.sweep(polyline([[-1.57, 0.85, -0.94], [-1.6, 2.56, -0.94], [-1.6, 2.75, 0.4]]), 0.014, { bone: root, color: C.dark, sides: 6, name: "winchCable" });

  // Pallet jack: widely spaced forks go into the pallet openings; rear control assembly stays clear.
  for (const x of [0.54, 1.02]) {
    shell("jackFork", [x, 0.285, 0.5], [0.17, 0.09, 1.13], C.orange, root, 0.009);
    box("forkWearPlate", [x, 0.335, 0.5], [0.11, 0.012, 0.98], C.silver);
  }
  shell("jackBridge", [0.78, 0.38, 0.95], [0.69, 0.25, 0.34], C.orange);
  shell("jackPumpHousing", [0.78, 0.51, 1.12], [0.31, 0.28, 0.31], C.dark);
  cyl("hydraulicRam", [0.78, 0.64, 1.06], 0.065, 0.25, C.silver);
  cyl("ramCollar", [0.78, 0.56, 1.06], 0.085, 0.08, C.frame);
  for (const x of [0.645, 0.915]) {
    cyl("steerTire", [x, 0.255, 1.15], 0.115, 0.09, C.rubber, rearWheel, [1, 0, 0]);
    cyl("steerHub", [x, 0.255, 1.15], 0.052, 0.098, C.steel, rearWheel, [1, 0, 0], 8);
  }
  for (const [x, bone] of [[0.54, rollerL], [1.02, rollerR]] as [number, Joint][]) {
    cyl("loadRoller", [x, 0.205, 0.04], 0.065, 0.12, C.rubber, bone, [1, 0, 0]);
    cyl("loadRollerAxle", [x, 0.205, 0.04], 0.025, 0.15, C.silver, bone, [1, 0, 0], 8);
  }
  tube("handleStem", [0.78, 0.51, 1.15], [0.78, 1.24, 1.47], 0.038, C.frame, handle);
  b.sweep(polyline([[0.78, 1.21, 1.455], [0.59, 1.37, 1.49], [0.59, 1.53, 1.54], [0.97, 1.53, 1.54], [0.97, 1.37, 1.49], [0.78, 1.21, 1.455]]), 0.033, { bone: handle, color: C.orange, sides: 8, caps: "round", name: "jackLoopHandle" });
  tube("handleGrip", [0.64, 1.53, 1.54], [0.92, 1.53, 1.54], 0.042, C.rubber, handle);
  tube("releaseLever", [0.79, 1.49, 1.55], [0.79, 1.39, 1.525], 0.019, C.silver, handle);
  box("jackCapacityPlate", [0.78, 0.45, 1.127], [0.24, 0.07, 0.015], C.cream);
  for (const x of [0.58, 0.98]) cyl("bridgeBolt", [x, 0.47, 1.128], 0.022, 0.02, C.silver, root, [0, 0, 1], 6);

  // Dock clutter kept disciplined: hose coil, chocks, and a compact document case.
  for (let i = 0; i < 3; i++) b.part(new THREE.TorusGeometry(0.195 - i * 0.032, 0.013, 5, 18), C.wood, { bone: root, at: [-0.85, 0.158 + i * 0.008, 0.78], rotation: [90, 0, 0], name: `mooringCoil${i}` });
  b.sweep(catmull([[-0.66, 0.17, 0.8], [-0.55, 0.17, 0.85], [-0.61, 0.17, 1.02], [-0.43, 0.17, 1.09]]), 0.013, { bone: root, color: C.wood, sides: 6, name: "ropeEnd" });
  for (const x of [-0.32, -0.04]) shell("wheelChock", [x, 0.19, 1.25], [0.18, 0.1, 0.25], hazard, root, 0.012);
  shell("documentsCase", [-0.36, 0.23, 0.61], [0.36, 0.18, 0.27], C.cream);
  box("caseLidSeam", [-0.36, 0.255, 0.752], [0.31, 0.016, 0.012], C.dark);
  for (const x of [-0.48, -0.24]) box("caseLatch", [x, 0.25, 0.77], [0.027, 0.063, 0.026], C.orange);
  tube("caseHandle", [-0.42, 0.34, 0.61], [-0.30, 0.34, 0.61], 0.017, C.frame);
  // Final pass: cool status bars and panel fasteners break up the broad case faces from the side views.
  for (const [x, y, z, w, d] of [
    [-0.4, 2.36, -0.66, 0.42, 0.56],
    [-0.4, 1.72, -0.66, 0.36, 0.43],
    [0.82, 1.06, -0.22, 0.44, 0.56],
  ] as [number, number, number, number, number][]) {
    box("caseStatusBar", [x, y, z - d * 0.52], [w, 0.035, 0.018], C.teal);
    box("caseStatusBar", [x, y + 0.065, z - d * 0.52], [w * 0.54, 0.018, 0.019], C.orange);
    for (const sx of [-1, 1]) cyl("caseStatusBolt", [x + sx * w * 0.55, y, z - d * 0.54], 0.018, 0.012, C.silver, root, [0, 0, 1], 6);
  }
  for (const [x, z] of [[1.4, -1.04], [1.5, 0.7]] as const) {
    box("drumStatus", [x + 0.292, 0.73, z], [0.018, 0.2, 0.09], C.teal);
    box("drumStatus", [x + 0.302, 0.73, z], [0.012, 0.09, 0.04], C.white);
  }
  box("jackStatus", [0.78, 0.52, 1.285], [0.11, 0.022, 0.026], C.teal);
  box("jackStatus", [0.78, 0.55, 1.285], [0.06, 0.012, 0.028], C.light);
  return b.root;
}
