import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { PartOptions } from "../src/parts";
import type { Joint } from "../src/skeleton";

export const meta = {
  name: "Vesper GT — Wedge Supercar",
  description: "An original low-poly mid-engine supercar with a burnt-orange wedge, louvered engine cover, turbine wheels and a detailed two-seat cockpit.",
  style: "low-poly",
  commit: "e503085",
};

export default function build() {
  const b = createBuilder({ name: "wedgeSupercar" });
  const c = { body: "#e76524", light: "#fb8a3e", shadow: "#b53a1e", black: "#10191e", trim: "#28363c", glass: "#244c5c", reflection: "#6695a4", rubber: "#151619", alloy: "#bbc3c2", steel: "#5b727c", red: "#eb3e32", cream: "#f5edcd", amber: "#ffaf43", seat: "#493729" };
  const root = b.joint("chassis", { at: [0, 0.45, 0], role: "spine" });
  const wheels: { joint: Joint; s: number; z: number; label: string }[] = [];
  for (const s of [-1, 1]) for (const z of [-1.3, 1.3]) {
    const label = `${z > 0 ? "Front" : "Rear"}${s > 0 ? "L" : "R"}`;
    const suspension = b.joint(`suspension${label}`, { parent: root, at: [s * 0.82, 0.36, z], dir: [0, 0, 1], role: "hinge" });
    const steering = z > 0 ? b.joint(`steering${label}`, { parent: suspension, at: [s * 0.92, 0.36, z], dir: [0, 0, 1], role: "hinge" }) : suspension;
    wheels.push({ s, z, label, joint: b.joint(`wheel${label}`, { parent: steering, at: [s * 0.96, 0.36, z], dir: [0, 1, 0], role: "hinge" }) });
  }
  const doors = [-1, 1].map(s => b.joint(`door${s > 0 ? "L" : "R"}`, { parent: root, at: [s * 0.87, 0.65, 0.65], dir: [0, 0, 1], role: "hinge" }));
  const engineLid = b.joint("engineLid", { parent: root, at: [0, 0.83, -0.76], dir: [0, 1, 0], role: "hinge" });
  const steeringWheel = b.joint("steeringWheel", { parent: root, at: [0.39, 0.90, 0.37], dir: [0, 1, 0], role: "hinge" });
  const box = (name: string, at: number[], size: [number, number, number], color: string, opts: PartOptions = {}) => b.part(new THREE.BoxGeometry(...size), color, { bone: root, at, name, ...opts });
  const panel = (name: string, points: number[][], color: string, bone = root, thickness = 0.016) => b.slab(points, { name, color, bone, thickness });
  const rod = (name: string, a: number[], end: number[], r: number, color: string, bone = root) => b.rod(a, end, r, { name, bone, color, sides: 6, smooth: false });

  // A low faceted loft supplies the wedge volume; separate arch lips keep the wheel openings graphic.
  b.loft([
    { at: [0, 0.70, -2.20], w: 1.66, h: 0.56 },
    { at: [0, 0.74, -1.78], w: 1.92, h: 0.70 },
    { at: [0, 0.77, -1.00], w: 1.90, h: 0.76 },
    { at: [0, 0.80, -0.15], w: 1.72, h: 0.78 },
    { at: [0, 0.84, 0.65], w: 1.53, h: 0.68 },
    { at: [0, 0.78, 1.40], w: 1.66, h: 0.54 },
    { at: [0, 0.59, 2.20], w: 1.48, h: 0.34 },
  ], { bone: root, section: "box", caps: "flat", color: c.body, name: "wedgeShell" });
  box("undertray", [0,0.22,0], [1.58,0.09,4.22], c.black);
  // Planar hood overlays preserve a clean sharply tapered silhouette.
  panel("hood", [[-0.72,0.756,0.76],[0.72,0.756,0.76],[0.72,0.501,2.18],[-0.72,0.501,2.18]], c.light);
  for (const s of [-1,1]) {
    panel(`hoodCrease${s}`, [[s*0.66,0.759,0.77],[s*0.70,0.759,0.77],[s*0.63,0.505,2.16],[s*0.60,0.505,2.16]], c.shadow);
    rod(`hoodSeam${s}`, [s*0.55,0.775,0.76], [s*0.48,0.535,2.04], 0.006, c.trim);
    box(`sill${s}`, [s*0.92,0.29,0], [0.11,0.12,1.65], c.shadow);
    box(`sillBlack${s}`, [s*0.973,0.24,0], [0.10,0.055,1.77], c.black);
    // Angular arch lips and side intake mouths.
    for (const z of [-1.3,1.3]) {
      const arc = [[z-0.46,0.30],[z-0.44,0.57],[z-0.26,0.785],[z+0.26,0.785],[z+0.44,0.57],[z+0.46,0.30]];
      for (let i=0;i<arc.length-1;i++) rod(`arch${s}${z}${i}`, [s*0.929,arc[i][1],arc[i][0]], [s*0.929,arc[i+1][1],arc[i+1][0]], 0.025, c.shadow);
    }
    panel(`intake${s}`, [[s*0.932,0.73,-0.87],[s*0.932,0.65,-0.37],[s*0.932,0.37,-0.57],[s*0.932,0.41,-0.86]], c.black);
    for (let j=0;j<3;j++) box(`intakeVane${s}${j}`, [s*0.945,0.465+j*0.07,-0.71], [0.02,0.02,0.23], c.steel);
  }

  // Enclosed passenger glazing and an open driver's window reveal the cabin.
  panel("windshield", [[-0.73,0.775,0.73],[0.73,0.775,0.73],[0.59,1.18,0.05],[-0.59,1.18,0.05]], c.glass);
  panel("roof", [[-0.59,1.19,0.05],[0.59,1.19,0.05],[0.58,1.19,-0.56],[-0.58,1.19,-0.56]], c.body);
  panel("rearGlass", [[-0.58,1.17,-0.56],[0.58,1.17,-0.56],[0.73,0.84,-0.92],[-0.73,0.84,-0.92]], c.glass);
  panel("windshieldReflection", [[-0.62,0.83,0.65],[-0.48,0.83,0.65],[0.18,1.155,0.11],[0.035,1.155,0.11]], c.reflection, root, 0.005);
  // Raised glass canopy breaks cleanly above the body and makes the two-seat cabin readable from all angles.
  b.frustumBox([0,0.96,0.62],[0,1.10,-0.60],[1.40,0.23],[1.08,0.25], {
    bone: root, section: "box", caps: "flat", color: c.glass, name: "canopyVolume",
  });
  box("canopyRoof", [0,1.23,-0.01], [1.10,0.045,0.92], c.black);
  box("canopyCenterRib", [0,1.255,-0.01], [0.045,0.028,0.91], c.shadow);
  box("canopyFrontRim", [0,1.145,0.64], [1.34,0.045,0.055], c.shadow);
  box("canopyRearRim", [0,1.125,-0.62], [1.08,0.045,0.055], c.shadow);
  box("frontGlassFace", [0,1.08,0.71], [1.48,0.035,0.34], c.glass, { rotation: [-24,0,0] });
  box("rearGlassFace", [0,1.08,-0.68], [1.20,0.035,0.32], c.glass, { rotation: [26,0,0] });
  box("leftGlassSide", [0.86,1.11,0.01], [0.035,0.20,0.82], c.glass, { rotation: [0,8,0] });
  box("rightGlassSide", [-0.86,1.11,0.01], [0.035,0.20,0.82], c.glass, { rotation: [0,-8,0] });
  for (const s of [-1,1]) {
    const door = doors[s === -1 ? 0 : 1];
    panel(`doorPanel${s}`, [[s*0.935,0.72,0.69],[s*0.935,0.755,-0.31],[s*0.935,0.39,-0.38],[s*0.935,0.36,0.69]], c.body, door);
    if (s < 0) panel(`sideWindow${s}`, [[s*0.735,0.79,0.67],[s*0.598,1.16,0.045],[s*0.588,1.16,-0.53],[s*0.77,0.82,-0.65]], c.glass, door);
    for (const [name,a,end] of [
      ["aPillar",[s*0.74,0.77,0.73],[s*0.60,1.19,0.045]],
      ["roofRail",[s*0.60,1.19,0.045],[s*0.60,1.19,-0.57]],
      ["bPillar",[s*0.60,1.19,-0.57],[s*0.78,0.82,-0.70]],
      ["windowSill",[s*0.74,0.77,0.73],[s*0.78,0.82,-0.70]],
    ] as [string,number[],number[]][]) rod(`${name}${s}`, a, end, 0.028, c.shadow, name === "windowSill" ? door : root);
    box(`handleRecess${s}`, [s*0.975,0.68,-0.16], [0.018,0.045,0.17], c.black, { bone: door });
    box(`handle${s}`, [s*0.988,0.683,-0.16], [0.02,0.016,0.12], c.alloy, { bone: door });
    rod(`mirrorStalk${s}`, [s*0.80,0.79,0.61], [s*1.03,0.88,0.61], 0.024, c.black, door);
    b.extrude([[-0.12,-0.055],[0.10,-0.045],[0.15,0.025],[-0.06,0.07]], { at:[s*1.08,0.89,0.61],x:[0,0,1],thickness:0.13,color:c.body,bone:door,name:`mirrorHousing${s}` });
    box(`mirrorGlass${s}`, [s*1.08,0.896,0.493], [0.10,0.067,0.01], c.reflection,{bone:door});
    // Two bucket seats, stitched pads and harness slots.
    box(`seatBase${s}`, [s*0.38,0.61,-0.15], [0.37,0.12,0.46], c.seat);
    box(`seatBack${s}`, [s*0.38,0.79,-0.38], [0.36,0.44,0.12], c.seat, {rotation:[-12,0,0]});
    for(const dx of [-0.14,0.14]) box(`seatBolster${s}${dx}`, [s*0.38+dx,0.82,-0.31], [0.07,0.36,0.13], c.black,{rotation:[-12,0,0]});
    for(const dx of [-0.07,0.07]) box(`harnessSlot${s}${dx}`, [s*0.38+dx,0.95,-0.267], [0.08,0.026,0.016], c.black);
    box(`harness${s}`, [s*0.38,0.78,-0.255], [0.055,0.26,0.025], c.red,{rotation:[-12,0,0]});
  }
  box("dashboard", [0,0.78,0.43], [1.20,0.13,0.29], c.black);
  box("console", [0,0.64,0.02], [0.17,0.22,0.65], c.trim);
  rod("gearLever",[0,0.71,0.13],[0,0.82,0.10],0.018,c.alloy);
  box("gearKnob",[0,0.83,0.10],[0.06,0.045,0.06],c.black);
  b.part(new THREE.TorusGeometry(0.125,0.016,4,10),c.black,{at:[0.39,0.90,0.37],bone:steeringWheel,name:"steeringRim",rotation:[-24,0,0]});
  for(const dx of [-0.09,0.09]) rod(`steeringSpoke${dx}`,[0.39,0.90,0.37],[0.39+dx,0.92,0.38],0.017,c.alloy,steeringWheel);

  // Engine hatch louvers and twin visible cam covers beneath the vent channels.
  box("engineWell",[0,0.81,-1.42],[1.31,0.025,0.98],c.black);
  box("engineDeck", [0,1.06,-1.34], [1.34,0.045,0.88], c.black);
  box("engineDeckFrame", [0,1.095,-1.34], [1.40,0.03,0.94], c.shadow);
  for (const s of [-1,1]) {
    box(`engineWindow${s}`, [s*0.30,1.11,-1.34], [0.25,0.012,0.70], c.reflection);
    for (let i=0;i<5;i++) box(`engineMesh${s}${i}`, [s*(0.16+i*0.075),1.125,-1.34], [0.025,0.018,0.68], c.trim);
  }
  for(const s of [-1,1]) {
    box(`camCover${s}`,[s*0.24,0.849,-1.37],[0.30,0.04,0.78],c.red);
    for(let i=0;i<7;i++) box(`camRib${s}${i}`,[s*0.24,0.875,-1.66+i*0.095],[0.29,0.015,0.014],c.alloy);
  }
  for(let i=0;i<8;i++) box(`engineLouver${i}`,[0,0.90-i*0.012,-0.98-i*0.127],[1.37,0.035,0.084],c.trim,{bone:engineLid,rotation:[12,0,0]});
  for(const s of [-1,1]) {
    box(`hatchRail${s}`,[s*0.72,0.85,-1.43],[0.048,0.036,1.11],c.shadow,{bone:engineLid});
    box(`hatchLatch${s}`,[s*0.70,0.842,-1.93],[0.075,0.02,0.06],c.alloy,{bone:engineLid});
  }

  // The split front fascia contains individual rectangular optical lenses.
  box("splitter",[0,0.245,2.14],[2.0,0.045,0.42],c.black);
  box("splitterLeadingEdge",[0,0.258,2.345],[1.96,0.025,0.035],c.shadow);
  box("frontGrille",[0,0.37,2.232],[1.51,0.15,0.022],c.black);
  for(let i=0;i<11;i++) box(`grilleBlade${i}`,[-0.66+i*0.132,0.37,2.249],[0.016,0.12,0.027],c.steel);
  for(const s of [-1,1]) {
    box(`lampPocket${s}`,[s*0.61,0.539,2.04],[0.48,0.05,0.23],c.black,{rotation:[10,0,0]});
    for(let i=0;i<3;i++) box(`headlampLens${s}${i}`,[s*(0.46+i*0.15),0.571,2.055],[0.125,0.018,0.16],c.cream,{rotation:[10,0,0]});
    box(`indicator${s}`,[s*0.863,0.397,2.245],[0.11,0.051,0.02],c.amber);
    box(`frontTowEyeMount${s}`,[s*0.86,0.30,2.26],[0.035,0.05,0.15],c.trim);
  }
  // Thin nose badge is an original geometric diamond, not a marque emblem.
  panel("noseInlay",[[0,0.557,1.97],[-0.055,0.571,1.89],[0,0.586,1.81],[0.055,0.571,1.89]],c.black,root,0.003);

  // Faceted tires and split-spoke alloy rims, all attached to rolling joints.
  for(const {s,z,label,joint} of wheels) {
    b.part(new THREE.CylinderGeometry(0.36,0.36,0.27,12),c.rubber,{name:`tire${label}`,at:[s*0.99,0.36,z],rotation:[0,0,90],bone:joint,flat:true});
    b.part(new THREE.CylinderGeometry(0.267,0.267,0.018,12),c.steel,{name:`brakeDisc${label}`,at:[s*1.132,0.36,z],rotation:[0,0,90],bone:joint,flat:true});
    b.part(new THREE.TorusGeometry(0.264,0.024,4,12),c.alloy,{name:`rimLip${label}`,at:[s*1.148,0.36,z],rotation:[0,90,0],bone:joint,flat:true});
    b.part(new THREE.CylinderGeometry(0.074,0.074,0.03,8),c.trim,{name:`hub${label}`,at:[s*1.168,0.36,z],rotation:[0,0,90],bone:joint,flat:true});
    box(`caliper${label}`,[s*1.145,0.36,z-0.18],[0.016,0.17,0.075],c.red,{bone:joint});
    for(let k=0;k<5;k++) {
      const a=k*Math.PI*2/5;
      for(const da of [-0.095,0.095]) rod(`spoke${label}${k}${da}`,[s*1.169,0.36+Math.sin(a)*0.065,z+Math.cos(a)*0.065],[s*1.159,0.36+Math.sin(a+da)*0.25,z+Math.cos(a+da)*0.25],0.020,c.alloy,joint);
      b.part(new THREE.CylinderGeometry(0.009,0.009,0.012,5),c.cream,{name:`lug${label}${k}`,at:[s*1.19,0.36+Math.sin(a)*0.046,z+Math.cos(a)*0.046],rotation:[0,0,90],bone:joint});
    }
    for(let k=0;k<12;k++) {
      const a=k*Math.PI/6;
      box(`tread${label}${k}`,[s*0.99,0.36+Math.cos(a)*0.353,z+Math.sin(a)*0.353],[0.20,0.007,0.012],c.trim,{bone:joint,rotation:[a*180/Math.PI,0,0]});
    }
  }

  box("rearFascia",[0,0.60,-2.188],[1.75,0.26,0.035],c.black);
  for(const s of [-1,1]) {
    for(let i=0;i<4;i++) box(`tailLens${s}${i}`,[s*(0.34+i*0.135),0.662,-2.211],[0.11,0.08,0.02],i===3?c.amber:c.red);
    box(`rearVent${s}`,[s*0.59,0.53,-2.215],[0.56,0.07,0.02],c.steel);
    for(let i=0;i<7;i++) box(`rearVentSlit${s}${i}`,[s*(0.34+i*0.075),0.53,-2.23],[0.025,0.063,0.008],c.black);
    b.part(new THREE.CylinderGeometry(0.068,0.068,0.17,8),c.alloy,{name:`exhaust${s}`,at:[s*0.62,0.325,-2.23],rotation:[90,0,0],bone:root,flat:true});
    b.part(new THREE.CylinderGeometry(0.05,0.05,0.008,8),c.black,{name:`exhaustBore${s}`,at:[s*0.62,0.325,-2.32],rotation:[90,0,0],bone:root,flat:true});
  }
  box("licenseRecess",[0,0.595,-2.213],[0.37,0.12,0.018],c.shadow);
  box("rearDiffuser",[0,0.235,-2.11],[1.7,0.065,0.46],c.trim);
  for(let i=0;i<5;i++) box(`diffuserStrake${i}`,[-0.66+i*0.33,0.225,-2.14],[0.026,0.13,0.37],c.black);
  // A restrained ducktail rather than a tall racing wing keeps the wedge silhouette.
  panel("ducktail",[[-0.91,0.786,-1.98],[0.91,0.786,-1.98],[0.94,0.89,-2.21],[-0.94,0.89,-2.21]],c.body,root,0.034);
  box("ducktailLip",[0,0.90,-2.215],[1.9,0.03,0.048],c.black);
  return b.root;
}
