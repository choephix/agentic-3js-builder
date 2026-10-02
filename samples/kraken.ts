import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { catmull } from "../src/path";
import { paint, mix } from "../src/paint";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Hadal Sovereign",
  description: "A colossal rising kraken: eight spreading prehensile arms, ceramic mantle armor, cyan telemetry, and double rows of recessed suction cups.",
  style: "Overwatch",
  commit: "e503085",
};

export default function build() {
  const b = createBuilder({ name: "kraken", detail: 0.8, paintSize: 2048 });
  const navy = "#142e46", skin = "#28617a";
  const white = "#e1e8e5", silver = "#90a9b1", cyan = "#33eced", teal = "#147f94";
  const rubber = "#10212b", cup = "#78a8b1";
  const root = b.joint("core", { at: [0, 3.35, 0], role: "spine" });
  const spine = b.chain("mantle", catmull([[0, 3.35, 0], [0, 5.1, -0.12], [0, 7.4, -0.35], [0, 9.5, -0.65], [0, 11, -0.95]]), {
    parent: root, count: 4, role: "spine", names: ["mantleBase", "mantleMid", "mantleHigh", "mantleCrown", "mantleTip"],
  });
  const head = b.joint("head", { parent: spine.joints[1], at: [0, 5.7, 0.55], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 4.58, 1.12], dir: [0, -0.15, 1], role: "jaw" });
  const fins = [-1, 1].map(s => b.joint(`mantleFin${s < 0 ? "R" : "L"}`, {
    parent: spine.joints[2], at: [s * 1.65, 7.6, -0.4], dir: [s, 0.7, -0.2], role: "fan",
  }));
  const arms = Array.from({ length: 8 }, (_, i) => {
    const a = ((i + 0.5) / 8) * Math.PI * 2;
    const dx = Math.sin(a), dz = Math.cos(a);
    const tall = i === 1 || i === 6;
    const low = i === 0 || i === 7;
    const p = (r: number, y: number, bend = 0) => [dx * r + dz * bend, y, dz * r - dx * bend];
    const path = catmull([
      p(1.32, 3.8), p(2.45, 2.85), p(4.3, 1.6), p(6.4, low ? 0.58 : 1.9, 0.1),
      p(tall ? 8.4 : 7.6, low ? 0.23 : tall ? 3.5 : 2.65, 0.5),
      p(tall ? 9.2 : 8.5, low ? 0.38 : tall ? 5.25 : 3.4, 1.1),
      p(tall ? 8.55 : 8.65, low ? 0.98 : tall ? 6.1 : 4.15, 1.7),
      p(tall ? 7.8 : 8.1, low ? 1.45 : tall ? 6.1 : 4.45, 1.75),
    ]);
    return b.chain(`tentacle${i + 1}`, path, { parent: root, count: 9, role: "tentacle" });
  });

  const bodyPaint = paint((_p, n, s) => {
    const rim = Math.abs(((s[1] + 540) % 360) - 180);
    return rim < 12 ? teal : mix(navy, skin, Math.max(0, n.y) * 0.45 + 0.15);
  });
  const body = b.sweep(spine, t => [1.35 + 1.25 * Math.sin(Math.PI * t) - 1.03 * t, 1.27 + 0.68 * Math.sin(Math.PI * t) - 0.97 * t], {
    color: bodyPaint, sides: 12, caps: { start: "round", end: "point" }, name: "mantleSkin",
  });
  const mantleSurface = b.surface(body);
  const mark = svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path fill="#142e46" d="M8 12h112v104H8z"/><path fill="none" stroke="#90a9b1" stroke-width="4" d="M18 22h92v84H18zM26 91h76"/><path fill="#33eced" d="M30 33h15v38H30zm27 0h15v38H57zm27 0h15v38H84z"/><path fill="#e1e8e5" d="M25 98h19v4H25zm29 0h11v4H54zm21 0h27v4H75z"/></svg>`, { size: 128 });

  // Crisp ivory shell plates are separated by inset navy panel channels.
  for (let i = 0; i < 5; i++) {
    const t = 0.32 + i * 0.115;
    for (const side of [-1, 1]) {
      const hit = body.at(t, side * 43);
      const w = 0.72 - i * 0.09;
      const plate = b.stick(new THREE.SphereGeometry(1, 8, 6), i === 4 ? silver : white, hit, {
        scale: [w, 0.19, 0.77 - i * 0.055], embed: 0.25, flow: hit.tangent, name: `mantlePanel${i}_${side}`,
      });
      const panelSurface = b.surface(plate);
      const at = panelSurface.nearest(hit.at.clone().addScaledVector(hit.n, 0.25));
      b.stick(new THREE.BoxGeometry(w * 1.05, 0.025, 0.065), navy, at, { flow: hit.tangent, name: "panelChannel" });
      if (i % 2 === 0) glow(b.stick(new THREE.BoxGeometry(w * 0.64, 0.033, 0.035), cyan, at.moved([0, 0.022, 0]), { flow: hit.tangent, name: "panelTelemetry" }), 1.1);
    }
  }
  for (const az of [0, 90, 180, 270]) {
    const hit = mantleSurface.around([0, 6.45, -0.3]).at(az, 6);
    if (!hit) continue;
    b.decal(body, mark, { at: hit, size: [0.63, 0.63], segments: 4, lift: 0.014, name: `serviceStencil${az}` });
  }
  for (let i = 0; i < 7; i++) {
    const hit = body.at(0.26 + i * 0.077, 180);
    b.stick(new THREE.BoxGeometry(0.68 - i * 0.044, 0.075, 0.2), rubber, hit, { flow: hit.tangent, name: "dorsalVent" });
    glow(b.stick(new THREE.BoxGeometry(0.42 - i * 0.03, 0.033, 0.055), cyan, hit.moved([0, 0.045, 0]), { flow: hit.tangent, name: "dorsalVentLight" }), 0.8);
  }
  const rear = body.at(0.57, 180);
  const rearPlate = b.stick(new THREE.SphereGeometry(1, 8, 6), silver, rear, {
    scale: [0.83, 0.18, 0.68],
    embed: 0.2,
    flow: rear.tangent,
    name: "rearPowerPlate",
  });
  const rearFace = b.surface(rearPlate).nearest(rear.at.clone().addScaledVector(rear.n, 0.23));
  if (rearFace) {
    b.stick(new THREE.BoxGeometry(0.9, 0.035, 0.09), rubber, rearFace, { flow: rear.tangent, name: "rearPowerChannel" });
    glow(b.stick(new THREE.BoxGeometry(0.62, 0.042, 0.045), cyan, rearFace.moved([0, 0.025, 0]), { flow: rear.tangent, name: "rearPowerLight" }), 1.4);
  }

  for (let i = 0; i < 2; i++) {
    const s = i === 0 ? -1 : 1;
    const bone = fins[i];
    const fin = b.extrude([[0, -0.9], [1.35, -0.7], [2.3, 0.55, "sharp"], [1.25, 1.2], [0.2, 2.4, "sharp"], [-0.3, 0.5]], {
      bone, at: bone.at, x: [s, 0, -0.17], thickness: 0.25, bevel: 0.095, color: white, name: `mantleFinShell${i}`,
    });
    b.extrude([[0.1, -0.45], [1.1, -0.35], [1.82, 0.53, "sharp"], [0.94, 0.86], [0.24, 1.85, "sharp"]], {
      bone, at: fin.local([0, 0, s * 0.145]), x: [s, 0, -0.17], thickness: 0.035, bevel: 0.008, color: navy, name: "finInset",
    });
    b.rod(fin.local([0.28, -0.16, s * 0.18]), fin.local([1.49, 0.48, s * 0.18]), 0.045, { bone, color: cyan, sides: 6, name: "finLightRail" });
    for (let k = 0; k < 3; k++) b.part(new THREE.BoxGeometry(0.3, 0.07, 0.05), silver, { bone, at: fin.local([0.45 + k * 0.22, 0.36 + k * 0.15, s * 0.18]), rotation: [0, 0, s * 24], name: "finRib" });
  }

  const face = b.part(new THREE.SphereGeometry(1, 12, 8), skin, { bone: head, at: [0, 5.85, 0.97], scale: [1.8, 1.35, 1.2], name: "headShell" });
  const faceSurface = b.surface(face);
  for (const s of [-1, 1]) {
    const hit = faceSurface.around(face.at).at(s * 51, 13);
    if (!hit) continue;
    const socket = b.stick(new THREE.SphereGeometry(1, 12, 8), rubber, hit, { scale: [0.77, 0.27, 0.6], embed: 0.22, name: "eyeSocket" });
    const front = b.surface(socket).nearest(hit.at.clone().addScaledVector(hit.n, 0.42));
    if (!front) continue;
    const eye = glow(b.stick(new THREE.SphereGeometry(1, 12, 8), cyan, front, { scale: [0.53, 0.12, 0.37], embed: 0.18, name: "eyeLens" }), 1.1);
    const eyeFront = b.surface(eye).nearest(front.at.clone().addScaledVector(front.n, 0.3));
    if (!eyeFront) continue;
    b.stick(new THREE.BoxGeometry(0.31, 0.035, 0.063), rubber, eyeFront, { name: "horizontalPupil" });
    b.stick(new THREE.SphereGeometry(0.08, 6, 4), white, eyeFront.moved([0.2, 0.01, 0.11]), { name: "eyeGlint" });
    const brow = faceSurface.around(face.at).at(s * 52, 43);
    if (brow) b.stick(new THREE.BoxGeometry(1.05, 0.15, 0.24), white, brow, { spin: s * 14, name: "browArmor" });
    for (let k = 0; k < 3; k++) {
      const cheek = faceSurface.around(face.at).at(s * (57 + k * 8), -13 - k * 5);
      if (cheek) b.stick(new THREE.BoxGeometry(0.4, 0.055, 0.09), navy, cheek, { spin: s * 18, name: "cheekGill" });
    }
  }
  b.part(new THREE.SphereGeometry(1, 10, 6), rubber, { bone: head, at: [0, 4.95, 1.55], scale: [0.9, 0.73, 0.5], name: "mouthInterior" });
  b.extrude([[-0.65, 0.55], [0, 0.8, "sharp"], [0.65, 0.55], [0.36, -0.05], [0, -0.68, "sharp"], [-0.36, -0.05]], {
    bone: head, at: [0, 5.16, 1.88], x: [1, 0, 0], thickness: 0.58, bevel: 0.15, color: white, name: "upperHookedBeak",
  });
  b.extrude([[-0.59, -0.13], [0, -0.6, "sharp"], [0.59, -0.13], [0.4, 0.15], [0, 0.46, "sharp"], [-0.4, 0.15]], {
    bone: jaw, at: [0, 4.37, 1.79], x: [1, 0, 0], thickness: 0.5, bevel: 0.12, color: silver, name: "lowerBeak",
  });
  for (const s of [-1, 1]) {
    b.part(new THREE.CylinderGeometry(0.19, 0.19, 0.17, 8), white, { bone: jaw, at: [s * 0.65, 4.58, 1.48], dir: [s, 0, 0], name: "jawPivot" });
    glow(b.part(new THREE.CylinderGeometry(0.095, 0.095, 0.185, 8), cyan, { bone: jaw, at: [s * 0.65, 4.58, 1.48], dir: [s, 0, 0], name: "jawPivotLight" }), 1);
  }

  const armPaint = paint((_p, n, uv) => {
    const angle = Math.abs(((uv[1] + 540) % 360) - 180);
    const strip = angle < 66;
    if (strip) return mix(skin, cup, 0.3 + Math.max(n.y, 0) * 0.2);
    const band = Math.abs((uv[0] * 12) % 1 - 0.5);
    return band > 0.474 && uv[0] < 0.8 ? navy : mix(navy, skin, 0.25 + Math.max(n.y, 0) * 0.3);
  });
  for (let i = 0; i < arms.length; i++) {
    const chain = arms[i];
    const tube = b.sweep(chain, t => 0.82 * Math.pow(1 - t, 1.05) + 0.055, { color: armPaint, sides: 10, name: `arm${i + 1}Skin` });
    // Paired cup rows run on the exposed upper/inward surface; each has a real recessed throat.
    for (let k = 0; k < 13; k++) {
      const t = 0.1 + k * 0.064;
      const r = 0.275 * (1 - t) + 0.042;
      for (const side of [-1, 1]) {
        const hit = tube.at(t, side * 36);
        b.stick(new THREE.CylinderGeometry(r * 0.92, r * 0.66, 0.07, 8), cup, hit, {
          embed: 0.3,
          name: `cupRim${i}_${k}_${side}`,
        });
        b.part(new THREE.CylinderGeometry(r * 0.52, r * 0.52, 0.022, 8), rubber, { frame: hit.moved([0, r * 0.13, 0]), name: "suckerRecess" });
        if (k % 4 === 0) glow(b.part(new THREE.CylinderGeometry(r * 0.25, r * 0.25, 0.025, 6), cyan, { frame: hit.moved([0, r * 0.14, 0]), name: "suckerSensor" }), 0.9);
      }
    }
    // Armor saddles remain discrete, keeping the entire tentacle readable when flexed.
    for (let k = 0; k < 5; k++) {
      const t = 0.075 + k * 0.105;
      const hit = tube.at(t, 180);
      const w = 0.79 * (1 - t);
      const plate = b.stick(new THREE.SphereGeometry(1, 8, 6), k < 2 ? white : silver, hit, { scale: [w, 0.17, 0.48], embed: 0.18, flow: hit.tangent, name: "armArmorSaddle" });
      const outside = b.surface(plate).nearest(hit.at.clone().addScaledVector(hit.n, 0.22));
      b.stick(new THREE.BoxGeometry(w * 1.1, 0.027, 0.055), rubber, outside, { flow: hit.tangent, name: "saddlePanelLine" });
      glow(b.stick(new THREE.BoxGeometry(w * 0.5, 0.032, 0.033), cyan, outside.moved([0, 0.018, 0]), { flow: hit.tangent, name: "saddleIndicator" }), 1);
    }
    // Double thin edge ribbons inherit the arm's continuous skin weights.
    for (const angle of [-90, 90]) glow(b.sweep(tube.line(angle, 0.008).slice(0.06, 0.87), 0.028, {
      bone: chain, color: cyan, sides: 5, caps: "flat", name: "armEdgeLight",
    }), 0.8);
  }
  return b.root;
}
