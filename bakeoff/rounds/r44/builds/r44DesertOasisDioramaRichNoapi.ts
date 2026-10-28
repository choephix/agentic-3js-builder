import * as THREE from "three";
import { createBuilder, frame, rng, svg } from "../../../../src/index";
import { catmull } from "../../../../src/index";
import { mottle, paint, stripes } from "../../../../src/index";

export const meta = {
  name: "Whimsy Oasis",
  description: "A low-poly desert oasis diorama: turquoise pond ringed by stones, tall palms, striped tents with rugs, and two camels in rest pose.",
};

type V = [number, number, number];
const SAND = mottle("#f1cf86", "#e3b86a", { size: 0.35, seed: 3 });
const SAND_DK = "#c99a52";
const WATER = "#37c6c9";
const TENT_A = "#e0533f";
const TENT_B = "#fff0d0";
const CAMEL = mottle("#c98f55", "#b27a44", { size: 0.2, seed: 5 });
const CAMEL_DK = "#7a4d2b";

export default function build() {
  const b = createBuilder({ name: "oasis", paintSize: 1024 });
  const base = b.joint("base", { at: [0, 0, 0] });
  const R = rng(7);
  const G = 0.12;

  const ball = (r: number, color: any, at: V, scale: V = [1, 1, 1], bone: any = base, rot: V = [0, 0, 0], seg = 8) =>
    b.part(new THREE.SphereGeometry(r, seg, 6), color, { bone, at, scale, rotation: rot });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: any, at: V, bone: any = base, rot: V = [0, 0, 0]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { bone, at, rotation: rot });
  const box = (w: number, h: number, d: number, color: any, at: V, bone: any = base, rot: V = [0, 0, 0]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, rotation: rot });

  // ---- textures
  const FROND = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 100"><path d="M20 100 C6 70 2 30 20 0 C38 30 34 70 20 100Z" fill="#3fa14a" stroke="#256b34" stroke-width="2"/><path d="M20 98 V6" stroke="#8fdc6a" stroke-width="3"/><path d="M20 80 L6 66 M20 62 L5 46 M20 44 L8 28 M20 80 L34 66 M20 62 L35 46 M20 44 L32 28" stroke="#256b34" stroke-width="2"/></svg>`,
    { size: 128 },
  );
  const RUG = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 80"><rect width="60" height="80" rx="4" fill="#7b2d58"/><rect x="5" y="5" width="50" height="70" fill="none" stroke="#ffd35a" stroke-width="3"/><path d="M30 14 L48 40 L30 66 L12 40Z" fill="#33b5b1" stroke="#ffd35a" stroke-width="2.5"/><circle cx="30" cy="40" r="6" fill="#ffd35a"/></svg>`,
    { size: 192 },
  );
  const GRASS = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M4 32 C6 18 6 10 3 3 C12 10 14 20 14 32Z" fill="#8fb04a"/><path d="M12 32 C14 18 18 8 20 0 C24 12 22 22 22 32Z" fill="#a9c85a"/><path d="M20 32 C22 22 26 14 30 8 C30 18 28 26 28 32Z" fill="#7ea03e"/></svg>`,
    { size: 96 },
  );
  const FLAGTEX = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 30"><path d="M0 0 H40 L30 15 L40 30 H0Z" fill="#ffd35a" stroke="#c9852a" stroke-width="2"/><circle cx="14" cy="15" r="5" fill="#e0533f"/></svg>`,
    { size: 96 },
  );

  // ---- ground
  const outline: [number, number][] = [];
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2;
    const r = 1.65 * (1 + 0.05 * Math.sin(a * 3) + 0.03 * Math.sin(a * 5 + 1));
    outline.push([Math.cos(a) * r, -Math.sin(a) * r]);
  }
  b.extrude(outline as any, { at: [0, G / 2, 0], x: [1, 0, 0], y: [0, 0, -1], thickness: G, bevel: 0.01, color: SAND, bone: base });
  b.extrude(outline.map(([x, z]) => [x * 0.96, z * 0.96]) as any, { at: [0, -0.0, 0], x: [1, 0, 0], y: [0, 0, -1], thickness: 0.02, color: SAND_DK, bone: base });
  // dunes
  for (const [x, z, r, h] of [[-0.9, -1.1, 0.7, 0.35], [0.5, -1.25, 0.8, 0.45], [1.25, -0.5, 0.5, 0.25], [-1.35, 0.1, 0.45, 0.22]] as number[][])
    ball(r, SAND, [x, G - 0.02, z], [1, h / r, 1.1], base, [0, x * 40, 0], 10);

  // ---- pond
  const px = -0.15, pz = 0.2;
  cyl(0.62, 0.64, 0.03, 12, WATER, [px, G + 0.012, pz]);
  cyl(0.4, 0.42, 0.01, 10, "#7fe3e0", [px + 0.05, G + 0.03, pz - 0.03]);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const s = 0.07 + R() * 0.05;
    b.part(new THREE.IcosahedronGeometry(s, 0), i % 2 ? "#a9a08e" : "#8c8576", {
      bone: base, at: [px + Math.cos(a) * 0.66, G + s * 0.3, pz + Math.sin(a) * 0.66], scale: [1.2, 0.8, 1],
    });
  }
  // lilies
  for (const [dx, dz] of [[0.2, 0.1], [-0.25, -0.15], [0.0, 0.3]])
    cyl(0.06, 0.06, 0.008, 8, "#59b85a", [px + dx, G + 0.034, pz + dz]);
  ball(0.03, "#ff8fb1", [px + 0.2, G + 0.05, pz + 0.1], [1, 0.8, 1], base, [0, 0, 0], 6);

  // ---- palms
  const palm = (x: number, z: number, h: number, lean: number, id: number) => {
    const top: V = [x + lean, G + h, z + lean * 0.3];
    const pts: V[] = [[x, G - 0.02, z], [x + lean * 0.2, G + h * 0.35, z + lean * 0.05], [x + lean * 0.6, G + h * 0.7, z + lean * 0.18], top];
    b.sweep(catmull(pts), [0.075, 0.045], {
      color: stripes("#9a6a3c", "#6e4626", { size: 0.07, axis: "y", width: 0.3, seed: id }),
      sides: 6, bone: base, caps: "round",
    });
    for (let k = 0; k < 3; k++) ball(0.05 - k * 0.003, "#4c8f45", [top[0], top[1] - 0.01 + 0.0, top[2]], [1, 0.6, 1], base);
    for (let k = 0; k < 4; k++) {
      const a = k * 1.7 + id;
      ball(0.04, "#6b4425", [top[0] + Math.cos(a) * 0.05, top[1] - 0.06, top[2] + Math.sin(a) * 0.05], [1, 1, 1], base, [0, 0, 0], 6);
    }
    const frames = Array.from({ length: 9 }, () => frame(top, [0, 1, 0]));
    b.cards(frames, FROND, {
      size: [0.2, 0.75], lean: 62, bend: 38,
      flow: (_f: any, i: number) => [Math.cos(i * 0.698 + id), 0, Math.sin(i * 0.698 + id)],
      cross: true, bone: base, sink: 0,
    });
  };
  palm(-0.75, 0.55, 1.6, 0.18, 1);
  palm(0.45, 0.55, 1.35, -0.22, 2);
  palm(-0.35, -0.45, 1.8, 0.1, 3);
  palm(0.2, 0.9, 1.0, -0.12, 4);

  // ---- tents
  const tent = (x: number, z: number, yaw: number, s: number, flagC: string) => {
    const tp = paint((p, n) => {
      const a = Math.atan2(p.z - z, p.x - x);
      return Math.floor(((a + Math.PI) / (Math.PI * 2)) * 12) % 2 ? TENT_B : TENT_A;
    });
    b.part(new THREE.ConeGeometry(0.45 * s, 0.6 * s, 6), tp, { bone: base, at: [x, G + 0.3 * s, z], rotation: [0, yaw, 0] });
    cyl(0.47 * s, 0.47 * s, 0.05 * s, 6, "#7b2d58", [x, G + 0.03, z], base, [0, yaw, 0]);
    b.sweep(catmull([[x, G + 0.6 * s, z], [x, G + 0.7 * s, z]]), 0.012, { color: "#6e4626", sides: 5, bone: base });
    ball(0.035, "#ffd35a", [x, G + 0.72 * s, z], [1, 1, 1], base, [0, 0, 0], 6);
    const q = yaw * Math.PI / 180;
    const fx = x + Math.sin(q) * 0.36 * s, fz = z + Math.cos(q) * 0.36 * s;
    b.part(new THREE.PlaneGeometry(0.22 * s, 0.3 * s), "#2a1a22", { bone: base, at: [fx, G + 0.14 * s, fz], dir: [Math.sin(q), 0.45, Math.cos(q)], axis: "z" });
    const rx = x + Math.sin(q) * 0.62 * s, rz = z + Math.cos(q) * 0.62 * s;
    b.part(new THREE.PlaneGeometry(0.3, 0.4), "#ffffff", { bone: base, at: [rx, G + 0.012, rz], dir: [0, 1, 0], axis: "z", texture: RUG, rotation: [0, 0, 0], up: [Math.sin(q), 0, Math.cos(q)] });
    b.cards([frame([x, G + 0.73 * s, z], [0, 1, 0])], FLAGTEX, { size: [0.14, 0.1], lean: 90, flow: [Math.cos(q), 0, -Math.sin(q)], color: flagC, bone: base, sink: 0 });
  };
  tent(0.85, -0.05, -50, 1.0, "#ffffff");
  tent(-1.05, -0.35, 40, 0.8, "#ffffff");

  // ---- camels
  const camel = (name: string, x: number, z: number, yaw: number, sc: number) => {
    const q = (yaw * Math.PI) / 180;
    const c = Math.cos(q), s = Math.sin(q);
    const P = (lx: number, ly: number, lz: number): V => [x + (lx * c + lz * s) * sc, G + ly * sc, z + (-lx * s + lz * c) * sc];
    const rot: V = [0, yaw, 0];
    const body = b.joint(name + "Body", { parent: base, at: P(0, 0.62, 0), dir: [Math.sin(q), 0, Math.cos(q)], role: "spine" });
    ball(0.26 * sc, CAMEL, P(0, 0.62, 0), [0.8, 0.8, 1.45], body, rot, 9);
    for (const hz of [-0.14, 0.14]) ball(0.13 * sc, CAMEL, P(0, 0.88, hz), [0.9, 1.1, 0.9], body, rot, 7);
    box(0.5 * sc, 0.03 * sc, 0.42 * sc, "#2c8f9a", P(0, 0.79, 0.0), body, rot);
    box(0.5 * sc, 0.03 * sc, 0.1 * sc, "#ffd35a", P(0, 0.795, 0.14), body, rot);
    // neck + head
    const nb = P(0, 0.7, 0.3), nt = P(0, 1.08, 0.5);
    const neck = b.joint(name + "Neck", { parent: body, at: nb, dir: [nt[0] - nb[0], nt[1] - nb[1], nt[2] - nb[2]], role: "neck" });
    b.sweep(catmull([nb, P(0, 0.9, 0.42), nt]), [0.1 * sc, 0.065 * sc], { color: CAMEL, sides: 6, bone: neck, caps: "round" });
    const head = b.joint(name + "Head", { parent: neck, at: nt, dir: [s, 0, c], role: "head" });
    ball(0.085 * sc, CAMEL, P(0, 1.1, 0.54), [1, 0.9, 1.2], head, rot, 7);
    box(0.1 * sc, 0.08 * sc, 0.16 * sc, "#d9ab74", P(0, 1.075, 0.65), head, rot);
    const jaw = b.joint(name + "Jaw", { parent: head, at: P(0, 1.05, 0.6), dir: [s, 0, c], role: "jaw" });
    box(0.085 * sc, 0.035 * sc, 0.15 * sc, "#c99a62", P(0, 1.03, 0.65), jaw, rot);
    for (const e of [1, -1]) {
      b.part(new THREE.ConeGeometry(0.03 * sc, 0.07 * sc, 4), CAMEL_DK, { bone: head, at: P(e * 0.07, 1.19, 0.5), rotation: [0, yaw, e * 20] });
      ball(0.017 * sc, "#1b1216", P(e * 0.075, 1.12, 0.6), [1, 1, 1], head, rot, 5);
      ball(0.006 * sc, "#ffffff", P(e * 0.078, 1.125, 0.612), [1, 1, 1], head, rot, 4);
    }
    // tail
    const tail = b.joint(name + "Tail1", { parent: body, at: P(0, 0.7, -0.36), dir: [-s, -0.5, -c], role: "tail" });
    b.rod(P(0, 0.7, -0.36), P(0, 0.5, -0.46), 0.018 * sc, { color: CAMEL_DK, sides: 5, bone: tail, caps: "round" });
    // legs
    for (const [lx, lz, nm] of [[0.13, 0.22, "FL"], [-0.13, 0.22, "FR"], [0.13, -0.22, "BL"], [-0.13, -0.22, "BR"]] as [number, number, string][]) {
      const hip = P(lx, 0.55, lz), knee = P(lx, 0.3, lz + 0.02), foot = P(lx, 0.0, lz);
      const leg = b.joint(name + "hip" + nm, { parent: body, at: hip, dir: [0, -1, 0], role: "leg" });
      b.rod(hip, knee, 0.045 * sc, { color: CAMEL, sides: 6, bone: leg, caps: "round" });
      b.rod(knee, foot, 0.032 * sc, { color: CAMEL, sides: 6, bone: leg });
      cyl(0.045 * sc, 0.05 * sc, 0.03 * sc, 6, CAMEL_DK, [foot[0], G + 0.015 * sc, foot[2]], leg);
    }
  };
  camel("camelA", 0.55, 0.15, -30, 0.95);
  camel("camelB", -1.0, 0.9, 130, 0.8);

  // ---- grass & rocks
  const gf: any[] = [];
  for (let i = 0; i < 40; i++) {
    const a = R() * Math.PI * 2;
    const r = 0.7 + R() * 0.15;
    gf.push(frame([px + Math.cos(a) * r * 1.0, G, pz + Math.sin(a) * r], [0, 1, 0]));
  }
  b.cards(gf, GRASS, { size: [0.1, 0.12], lean: 10, flow: [0, 0, 1], vary: 0.4, rng: R, cross: true, bone: base });
  for (let i = 0; i < 6; i++) {
    const a = R() * 6.28;
    const r = 1.2 + R() * 0.25;
    b.part(new THREE.IcosahedronGeometry(0.07 + R() * 0.05, 0), "#b59a78", { bone: base, at: [Math.cos(a) * r, G + 0.03, Math.sin(a) * r] });
  }

  return b.root;
}
