import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, rng, paint, noise, mottle, grain, stripes, catmull, svg, frame } from "../../../../src/index";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Inazuma Roadside Shrine",
  description:
    "A cel-shaded roadside shrine in the Genshin Impact / Inazuma style: vermilion torii with shimenawa and shide, glowing stone and paper lanterns, kitsune guardians, a hip-roofed hokora with bell, offering box, sake barrels, ema rack, nobori banners, a temizuya basin and a sakura tree.",
};

type V = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "roadside_shrine" });
  const root = b.joint("root", { at: [0, 0, 0] });
  const R = rng(11);
  const D = Math.PI / 180;
  const G = 0.14; // ground top

  // ---------------------------------------------------------------- palette
  const INKC = "#2b2139";
  const VERM = cel("#e8472f", "#b02f45");
  const LACQ = cel("#3b2f4d", "#221a35");
  const CREAM = cel("#f4e8cd", "#d6bfb1");
  const GOLDC = cel("#f3c552", "#c7893c");
  const WOOD = cel(grain("#b5815a", "#9c6a48", { size: 0.05, axis: "y" }));
  const WOODX = cel(grain("#b5815a", "#9c6a48", { size: 0.05, axis: "x" }));
  const WOODZ = cel(grain("#b88a5e", "#9c6a48", { size: 0.05, axis: "z" }));
  const WOODL = cel("#dcab70", "#b97d5d");
  const STRAWG = cel(grain("#e6d193", "#c9ab68", { size: 0.03, axis: "y" }));
  const BARK = cel(grain("#76514d", "#5d4048", { size: 0.05, axis: "y" }));
  const PINK1 = cel("#ffb8cd", "#e88fb4");
  const PINK2 = cel("#ffd3df", "#f1a6c4");
  const PINK3 = cel("#ff9fbe", "#d67aa6");
  const BAMBOO = cel("#9cc65f", "#5f9a58");
  const STONEBASE = cel(mottle("#bbb8cb", "#a5a2b9", { size: 0.3, seed: 2 }));
  const MOSS = cel("#7aa650", "#4f8a5a");
  const STONE = paint((p, n) => {
    const m = noise(p, 0.26, 9) + (0.3 - Math.min(p.y, 0.3)) * 0.5 + (n.y > 0.5 ? 0.12 : 0);
    return m > 0.8 ? MOSS : STONEBASE;
  });
  const GRASS = cel(mottle("#88c262", "#6fae55", { size: 0.45, seed: 4 }));
  const EARTH = cel("#8d6c58", "#6c4f4f");
  const GROUND = paint((_p, n) => (n.y > 0.5 ? GRASS : EARTH));
  const BED = cel("#a39489", "#7f7584");
  const WALL = cel("#f1e3c3", "#d7bfb0");
  const TILE = cel(
    paint((p) => {
      const d = Math.abs(Math.abs(p.x) - Math.abs(p.z + 2.15));
      if (d < 0.04) return "#97a3d8";
      const f = p.y / 0.085 - Math.floor(p.y / 0.085);
      return f < 0.15 ? "#2e3252" : "#4d5b8a";
    }),
  );
  const ROPE_H = stripes("#ebdca8", "#b99a5e", { size: 0.07, axis: "x" });
  const ROPE_V = stripes("#d8402f", "#f6efe0", { size: 0.05, axis: "y" });

  // ---------------------------------------------------------------- helpers
  const part = (geo: THREE.BufferGeometry, color: any, at: V, o: any = {}) => b.part(geo, color, { bone: root, at, ...o });
  const box = (w: number, h: number, d: number, color: any, at: V, o: any = {}) =>
    part(new THREE.BoxGeometry(w, h, d), color, at, o);
  const cyl = (rt: number, rb: number, h: number, seg: number, color: any, at: V, o: any = {}) =>
    part(new THREE.CylinderGeometry(rt, rb, h, seg), color, at, { flat: true, ...o });
  const sph = (r: number, color: any, at: V, scale: V = [1, 1, 1], o: any = {}) =>
    part(new THREE.SphereGeometry(r, 8, 6), color, at, { scale, flat: true, ...o });
  const torus = (r: number, t: number, color: any, at: V, o: any = {}) =>
    part(new THREE.TorusGeometry(r, t, 4, 12), color, at, { rotation: [90, 0, 0], flat: true, ...o });

  const xf = (ox: number, oy: number, oz: number, yawDeg: number) => {
    const yq = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yawDeg * D);
    return {
      p: (x: number, y: number, z: number): V => {
        const v = new THREE.Vector3(x, y, z).applyQuaternion(yq);
        return [v.x + ox, v.y + oy, v.z + oz];
      },
      d: (x: number, y: number, z: number): V => {
        const v = new THREE.Vector3(x, y, z).applyQuaternion(yq);
        return [v.x, v.y, v.z];
      },
      q: (rx = 0, ry = 0, rz = 0) =>
        yq.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(rx * D, ry * D, rz * D))),
    };
  };

  const mergeAt = (geo: THREE.BufferGeometry, items: { p: V; r?: V; s?: number }[]) => {
    const arr = items.map((it) => {
      const g = geo.clone();
      const r = it.r ?? [0, 0, 0];
      const m = new THREE.Matrix4().compose(
        new THREE.Vector3(it.p[0], it.p[1], it.p[2]),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(r[0], r[1], r[2])),
        new THREE.Vector3(1, 1, 1).multiplyScalar(it.s ?? 1),
      );
      g.applyMatrix4(m);
      return g;
    });
    return mergeGeometries(arr)!;
  };

  // ---------------------------------------------------------------- textures
  const CREST = svg(
    `<svg viewBox="0 0 64 80" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="80" fill="#2a2038"/>
    <rect x="3" y="3" width="58" height="74" fill="none" stroke="#f0c050" stroke-width="3"/>
    <circle cx="32" cy="40" r="19" fill="none" stroke="#f0c050" stroke-width="3"/>
    <circle cx="32" cy="31" r="6" fill="#f0c050"/><circle cx="41" cy="46" r="6" fill="#f0c050"/><circle cx="23" cy="46" r="6" fill="#f0c050"/></svg>`,
    { size: 192 },
  );
  let lat = "";
  for (let i = 1; i < 5; i++) lat += `<rect x="${i * 9.2 - 1}" y="0" width="2.2" height="84" fill="#f0dcae"/>`;
  for (let j = 1; j < 9; j++) lat += `<rect x="0" y="${j * 9.3 - 1}" width="46" height="2.2" fill="#f0dcae"/>`;
  const LATTICE = svg(
    `<svg viewBox="0 0 46 84" xmlns="http://www.w3.org/2000/svg"><rect width="46" height="84" fill="#6b4538"/>${lat}
    <rect x="1.5" y="1.5" width="43" height="81" fill="none" stroke="#f3c552" stroke-width="3"/></svg>`,
    { size: 160 },
  );
  const SHIDE = svg(
    `<svg viewBox="0 0 40 100" xmlns="http://www.w3.org/2000/svg"><polygon points="14,2 30,2 34,16 12,32 36,48 10,66 32,82 22,98 8,98 20,82 0,66 26,48 4,32 24,16" fill="#fffdf5" stroke="#c4b8dc" stroke-width="2.5" stroke-linejoin="round"/></svg>`,
    { size: 160 },
  );
  const TUFT = svg(
    `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><polygon points="4,40 10,8 15,40" fill="#6aae52"/><polygon points="13,40 21,1 27,40" fill="#8fcb62"/><polygon points="24,40 32,10 37,40" fill="#5b9e4e"/></svg>`,
    { size: 128 },
  );
  const EMA_ART = [
    svg(
      `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><g fill="#ff8fb4"><circle cx="20" cy="9" r="8"/><circle cx="31" cy="17" r="8"/><circle cx="27" cy="30" r="8"/><circle cx="13" cy="30" r="8"/><circle cx="9" cy="17" r="8"/></g><circle cx="20" cy="21" r="5" fill="#f3c552"/></svg>`,
      { size: 96 },
    ),
    svg(
      `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><polygon points="24,2 8,22 19,22 13,38 32,16 21,16" fill="#a56af0" stroke="#e6d4ff" stroke-width="3" stroke-linejoin="round"/></svg>`,
      { size: 96 },
    ),
    svg(
      `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M26 4 A17 17 0 1 0 36 28 A13 13 0 1 1 26 4Z" fill="#f3c552"/><circle cx="31" cy="12" r="3.5" fill="#fff4c8"/></svg>`,
      { size: 96 },
    ),
  ];
  const LABEL = svg(
    `<svg viewBox="0 0 44 60" xmlns="http://www.w3.org/2000/svg"><rect width="44" height="60" fill="#cf3b33"/><rect x="3" y="3" width="38" height="54" fill="none" stroke="#fbf1dc" stroke-width="2.5"/>
    <circle cx="22" cy="19" r="9" fill="#fbf1dc"/><circle cx="22" cy="19" r="4" fill="#cf3b33"/>
    <rect x="12" y="34" width="4" height="18" fill="#2b2139"/><rect x="20" y="32" width="4" height="22" fill="#2b2139"/><rect x="28" y="35" width="4" height="16" fill="#2b2139"/></svg>`,
    { size: 128 },
  );
  const NOBORI = svg(
    `<svg viewBox="0 0 40 145" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="145" fill="#d8402d"/>
    <rect x="1.5" y="0" width="2.5" height="145" fill="#fbf1dc"/><rect x="36" y="0" width="2.5" height="145" fill="#fbf1dc"/>
    <circle cx="20" cy="29" r="12" fill="none" stroke="#fbf1dc" stroke-width="3"/>
    <circle cx="20" cy="23" r="3.6" fill="#fbf1dc"/><circle cx="26" cy="33" r="3.6" fill="#fbf1dc"/><circle cx="14" cy="33" r="3.6" fill="#fbf1dc"/>
    <rect x="9" y="54" width="5" height="52" fill="#fbf1dc"/><rect x="18" y="52" width="5" height="64" fill="#fbf1dc"/><rect x="27" y="56" width="5" height="46" fill="#fbf1dc"/>
    <path d="M0 128 Q10 118 20 128 T40 128" stroke="#fbf1dc" stroke-width="3" fill="none"/><path d="M0 138 Q10 128 20 138 T40 138" stroke="#fbf1dc" stroke-width="3" fill="none"/></svg>`,
    { size: 256 },
  );

  // ---------------------------------------------------------------- ground
  const ground = part(new THREE.CylinderGeometry(4.6, 4.8, G, 14), GROUND, [0, G / 2, 0], { flat: true });
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + 0.3;
    const r = 0.3 + R() * 0.2;
    part(new THREE.IcosahedronGeometry(r, 0), STONE, [Math.cos(a) * 4.45, G + r * 0.25, Math.sin(a) * 4.45], {
      scale: [1.2, 0.7, 1],
      rotation: [0, R() * 360, 0],
      flat: true,
    });
  }

  // path
  box(1.25, 0.03, 4.5, BED, [0, G + 0.012, 1.8]);
  for (let i = 0; i < 9; i++) {
    const z = 3.8 - i * 0.52;
    box(0.95 + R() * 0.14, 0.05, 0.47, STONE, [(R() - 0.5) * 0.08, G + 0.025, z], { rotation: [0, (R() - 0.5) * 6, 0] });
  }

  // ---------------------------------------------------------------- torii
  const z0 = 2.7;
  for (const s of [1, -1]) {
    cyl(0.22, 0.26, 0.45, 10, LACQ, [s * 1.4, G + 0.225, z0]);
    cyl(0.15, 0.19, 3.16 - (G + 0.45), 10, VERM, [s * 1.4, (G + 0.45 + 3.16) / 2, z0]);
    for (const t of [1, -1]) box(0.07, 0.32, 0.28, LACQ, [s * 1.4 + t * 0.21, 2.45, z0]);
    box(0.05, 0.19, 0.26, LACQ, [s * 1.775, 2.45, z0]);
    box(0.04, 0.24, 0.32, LACQ, [s * 2.27, 3.05, z0]);
  }
  box(3.5, 0.17, 0.24, VERM, [0, 2.45, z0]);
  box(4.5, 0.22, 0.3, VERM, [0, 3.05, z0]);
  const kasagi: any = [
    [-2.45, 0.2, "sharp"],
    [-1.4, 0.03],
    [0, 0],
    [1.4, 0.03],
    [2.45, 0.2, "sharp"],
    [2.4, 0.4, "sharp"],
    [1.3, 0.26],
    [0, 0.24],
    [-1.3, 0.26],
    [-2.4, 0.4, "sharp"],
  ];
  b.extrude(kasagi, { at: [0, 3.16, z0], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.48, color: LACQ, bone: root });
  // plaque
  box(0.36, 0.46, 0.1, GOLDC, [0, 2.71, z0]);
  part(new THREE.PlaneGeometry(0.3, 0.375), "#ffffff", [0, 2.71, z0 + 0.056], { dir: [0, 0, 1], axis: "z", texture: CREST });
  part(new THREE.PlaneGeometry(0.3, 0.375), "#ffffff", [0, 2.71, z0 - 0.056], { dir: [0, 0, -1], axis: "z", texture: CREST });

  // shimenawa and shide
  const ropePts: V[] = [
    [-1.36, 2.38, z0 + 0.19],
    [-1.1, 2.26, z0 + 0.27],
    [-0.55, 2.12, z0 + 0.28],
    [0, 2.08, z0 + 0.28],
    [0.55, 2.12, z0 + 0.28],
    [1.1, 2.26, z0 + 0.27],
    [1.36, 2.38, z0 + 0.19],
  ];
  const ropePath = catmull(ropePts);
  b.sweep(ropePath, 0.055, { color: ROPE_H, bone: root, sides: 6 });
  for (const s of [1, -1]) sph(0.075, STRAWG, [s * 1.34, 2.36, z0 + 0.2], [1, 1.3, 1]);
  const shideFrames = [0.17, 0.3, 0.42, 0.5, 0.58, 0.7, 0.83].map((t) => frame(ropePath.at(t), [0, 1, 0]));
  b.cards(shideFrames, SHIDE, { size: [0.14, 0.35], lean: 180, flow: [0, 0, 1], vary: 0.08, rng: R, bone: root });

  // paper lanterns (chochin)
  const CHO: number[][] = [
    [0, 0],
    [0.08, 0],
    [0.15, 0.04],
    [0.19, 0.14],
    [0.2, 0.22],
    [0.19, 0.3],
    [0.15, 0.4],
    [0.08, 0.44],
    [0, 0.44],
  ];
  const RIBS = [
    [0.04, 0.15],
    [0.14, 0.19],
    [0.22, 0.2],
    [0.3, 0.19],
    [0.4, 0.15],
  ];
  const chochin = (x: number, yTop: number, z: number, sc: number) => {
    const capTop = yTop - 0.12 * sc;
    b.rod([x, yTop, z], [x, capTop, z], 0.008, INKC, { bone: root });
    cyl(0.09 * sc, 0.1 * sc, 0.05 * sc, 8, LACQ, [x, capTop - 0.025 * sc, z]);
    const y0 = capTop - 0.05 * sc - 0.44 * sc;
    glow(
      b.lathe(CHO.map(([r, h]) => [r * sc, h * sc]) as any, {
        at: [x, y0, z],
        segments: 10,
        color: "#ff9a45",
        bone: root,
      }),
      1.3,
    );
    for (const [h, r] of RIBS) torus(r * sc + 0.004, 0.006 * sc + 0.002, INKC, [x, y0 + h * sc, z]);
    cyl(0.085 * sc, 0.085 * sc, 0.04 * sc, 8, LACQ, [x, y0 - 0.02 * sc, z]);
    b.rod([x, y0 - 0.04 * sc, z], [x, y0 - 0.22 * sc, z], [0.014 * sc, 0.006 * sc], "#f1e2b8", { bone: root });
  };
  for (const s of [1, -1]) chochin(s * 0.75, 2.365, z0, 1);

  // ---------------------------------------------------------------- stone lanterns
  const toro = (x: number, z: number) => {
    let y = G;
    const hexp = (rt: number, rb: number, h: number) => {
      cyl(rt, rb, h, 6, STONE, [x, y + h / 2, z]);
      y += h;
    };
    hexp(0.26, 0.3, 0.1);
    hexp(0.17, 0.2, 0.08);
    hexp(0.085, 0.1, 0.26);
    sph(0.13, STONE, [x, y + 0.07, z], [1, 0.7, 1]);
    y += 0.13;
    hexp(0.085, 0.085, 0.2);
    hexp(0.3, 0.17, 0.1);
    hexp(0.22, 0.22, 0.04);
    const yb = y;
    glow(cyl(0.15, 0.15, 0.28, 6, "#ffcf70", [x, yb + 0.14, z]), 1.7);
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      cyl(0.032, 0.032, 0.3, 6, STONE, [x + Math.sin(a) * 0.18, yb + 0.15, z + Math.cos(a) * 0.18]);
    }
    y += 0.3;
    hexp(0.24, 0.24, 0.04);
    b.lathe(
      [
        [0, 0],
        [0.34, 0],
        [0.5, 0.1, "sharp"],
        [0.47, 0.13],
        [0.2, 0.2],
        [0.12, 0.26],
        [0, 0.28],
      ] as any,
      { at: [x, y, z], segments: 6, color: STONE, bone: root },
    );
    y += 0.28;
    b.lathe(
      [
        [0, 0],
        [0.09, 0],
        [0.11, 0.04],
        [0.08, 0.09],
        [0.04, 0.15],
        [0, 0.2],
      ] as any,
      { at: [x, y, z], segments: 8, color: STONE, bone: root },
    );
  };
  for (const s of [1, -1]) toro(s * 1.1, 1.5);

  // ---------------------------------------------------------------- kitsune
  const fox = (x: number, z: number, side: number) => {
    const f = xf(x, 0, z, -side * 20);
    const T = G + 0.4;
    box(0.56, 0.1, 0.82, STONE, f.p(0, G + 0.05, -0.12), { quat: f.q() });
    box(0.44, 0.24, 0.7, STONE, f.p(0, G + 0.22, -0.12), { quat: f.q() });
    box(0.52, 0.06, 0.78, STONE, f.p(0, G + 0.37, -0.12), { quat: f.q() });
    box(0.3, 0.05, 0.02, VERM, f.p(0, G + 0.22, 0.24), { quat: f.q() });
    const S = (r: number, sc: V, at: V, c: any = STONE) => sph(r, c, f.p(...at), sc, { quat: f.q() });
    for (const s of [1, -1]) {
      S(1, [0.13, 0.17, 0.2], [s * 0.12, T + 0.17, -0.1]);
      b.rod(f.p(s * 0.08, T + 0.42, 0.08), f.p(s * 0.08, T + 0.03, 0.15), 0.048, STONE, { bone: root });
      box(0.11, 0.045, 0.14, STONE, f.p(s * 0.08, T + 0.022, 0.2), { quat: f.q() });
      part(new THREE.ConeGeometry(0.05, 0.13, 5), STONE, f.p(s * 0.14, T + 0.6, 0.05), {
        dir: f.d(s * 1, -0.2, -0.4),
        flat: true,
      });
      part(new THREE.ConeGeometry(0.06, 0.22, 4), STONE, f.p(s * 0.09, T + 0.82, 0.04), {
        dir: f.d(s * 0.3, 1, -0.15),
        scale: [1, 1, 0.55],
        flat: true,
      });
      part(new THREE.ConeGeometry(0.035, 0.15, 4), VERM, f.p(s * 0.09, T + 0.81, 0.062), {
        dir: f.d(s * 0.3, 1, -0.15),
        scale: [1, 1, 0.4],
        flat: true,
      });
      box(0.055, 0.015, 0.012, INKC, f.p(s * 0.07, T + 0.7, 0.2), { quat: f.q(0, 0, s * 20) });
      box(0.07, 0.012, 0.01, VERM, f.p(s * 0.115, T + 0.66, 0.16), { quat: f.q(0, s * 30, s * -12) });
    }
    b.capsule(f.p(0, T + 0.2, -0.14), f.p(0, T + 0.48, 0.02), [0.19, 0.13], STONE, { bone: root });
    S(1, [0.14, 0.17, 0.14], [0, T + 0.4, 0.06]);
    S(1, [0.15, 0.125, 0.14], [0, T + 0.66, 0.08]);
    part(new THREE.ConeGeometry(0.075, 0.24, 6), STONE, f.p(0, T + 0.62, 0.25), { dir: f.d(0, -0.1, 1), flat: true });
    S(0.026, [1, 1, 1], [0, T + 0.598, 0.365], INKC);
    part(new THREE.TorusGeometry(0.125, 0.028, 5, 10), VERM, f.p(0, T + 0.5, 0.075), { quat: f.q(80, 0, 0), flat: true });
    box(0.11, 0.12, 0.02, VERM, f.p(0, T + 0.44, 0.21), { quat: f.q() });
    S(0.04, [1, 1, 1], [0, T + 0.37, 0.235], GOLDC);
    b.sweep(
      catmull([
        f.p(0, T + 0.1, -0.22),
        f.p(0, T + 0.07, -0.45),
        f.p(side * 0.12, T + 0.22, -0.6),
        f.p(side * 0.16, T + 0.5, -0.5),
        f.p(side * 0.08, T + 0.72, -0.3),
      ]),
      [0.05, 0.1, 0.12, 0.09, 0.015],
      { color: STONE, bone: root, sides: 7 },
    );
    // aburaage offering
    cyl(0.17, 0.15, 0.02, 10, "#f6f1e6", f.p(0, G + 0.01, 0.65));
    for (const t of [-1, 1])
      cyl(0.075, 0.075, 0.035, 3, "#d8a23e", f.p(t * 0.06, G + 0.037, 0.65), { quat: f.q(0, t * 40 + 20, 0) });
  };
  fox(1.3, 0, 1);
  fox(-1.3, 0, -1);

  // ---------------------------------------------------------------- shrine hall
  const PT = G + 0.26;
  const yD = G + 0.34;
  box(3.1, 0.1, 2.7, STONE, [0, G + 0.05, -2.15]);
  box(2.9, 0.14, 2.5, STONE, [0, G + 0.17, -2.15]);
  box(3.0, 0.04, 2.6, STONE, [0, PT - 0.02, -2.15]);
  box(1.3, 0.18, 0.3, STONE, [0, G + 0.09, -0.75]);
  box(1.4, 0.09, 0.3, STONE, [0, G + 0.045, -0.45]);
  box(2.5, 0.08, 2.1, WOODZ, [0, PT + 0.04, -2.05]);

  const wallY = yD + 0.12;
  box(1.8, 0.12, 1.4, STONE, [0, yD + 0.06, -2.15]);
  box(1.7, 1.08, 1.3, WALL, [0, wallY + 0.54, -2.15]);
  for (const sx of [1, -1])
    for (const zz of [-1.5, -2.8]) box(0.11, 1.08, 0.11, VERM, [sx * 0.8, wallY + 0.54, zz]);
  box(1.8, 0.1, 0.14, VERM, [0, 1.56, -1.54]);
  box(1.8, 0.07, 0.1, VERM, [0, wallY + 0.12, -1.5]);
  for (const x of [-0.7, -0.35, 0, 0.35, 0.7]) box(0.14, 0.1, 0.22, GOLDC, [x, 1.63, -1.58]);
  // doors
  box(1.05, 0.96, 0.08, LACQ, [0, wallY + 0.5, -1.48]);
  for (const s of [1, -1]) {
    part(new THREE.PlaneGeometry(0.5, 0.88), "#ffffff", [s * 0.255, wallY + 0.5, -1.438], {
      dir: [0, 0, 1],
      axis: "z",
      texture: LATTICE,
    });
    sph(0.025, GOLDC, [s * 0.04, wallY + 0.5, -1.43]);
  }
  for (const s of [1, -1])
    part(new THREE.PlaneGeometry(0.5, 0.55), "#ffffff", [s * 0.853, wallY + 0.6, -2.15], {
      dir: [s, 0, 0],
      axis: "z",
      texture: LATTICE,
    });

  // roof
  const roofCz = -2.15;
  const tier = (rTop: number, rBot: number, h: number, yb: number, color: any) => {
    const g = new THREE.CylinderGeometry(rTop, rBot, h, 4, 1);
    g.rotateY(Math.PI / 4);
    part(g, color, [0, yb + h / 2, roofCz], { flat: true });
  };
  tier(1.5, 1.78, 0.12, 1.68, TILE);
  tier(1.0, 1.5, 0.2, 1.8, TILE);
  tier(0.5, 1.0, 0.26, 2.0, TILE);
  tier(0.1, 0.5, 0.3, 2.26, TILE);
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      b.spike([sx * 1.22, 1.72, roofCz + sz * 1.22], [sx * 0.7, 0.65, sz * 0.7], 0.34, 0.075, LACQ, { bone: root });
      sph(0.045, GOLDC, [sx * 1.43, 1.93, roofCz + sz * 1.43]);
    }
  b.lathe(
    [
      [0, 0],
      [0.1, 0],
      [0.12, 0.04],
      [0.09, 0.08],
      [0.1, 0.12],
      [0.06, 0.2],
      [0.02, 0.3],
      [0, 0.34],
    ] as any,
    { at: [0, 2.56, roofCz], segments: 8, color: GOLDC, bone: root },
  );

  // veranda rails
  for (const s of [1, -1]) {
    box(0.06, 0.06, 2.0, WOODZ, [s * 1.2, yD + 0.45, -2.05]);
    for (const z of [-1.1, -1.55, -2.0, -2.5, -3.0]) cyl(0.035, 0.035, 0.45, 6, WOOD, [s * 1.2, yD + 0.225, z]);
    box(0.65, 0.06, 0.06, WOODX, [s * 0.875, yD + 0.45, -1.02]);
    cyl(0.035, 0.035, 0.45, 6, WOOD, [s * 0.55, yD + 0.225, -1.02]);
    cyl(0.035, 0.035, 0.45, 6, WOOD, [s * 1.2, yD + 0.225, -1.02]);
    sph(0.05, GOLDC, [s * 1.2, yD + 0.5, -1.02]);
    sph(0.05, GOLDC, [s * 0.55, yD + 0.5, -1.02]);
  }

  // bell, rope, saisen box
  box(1.1, 0.08, 0.08, WOOD, [0, 1.64, -1.12]);
  b.rod([0, 1.64, -1.12], [0, 1.5, -1.12], 0.012, INKC, { bone: root });
  sph(0.1, GOLDC, [0, 1.4, -1.12]);
  torus(0.098, 0.014, GOLDC, [0, 1.4, -1.12]);
  box(0.12, 0.014, 0.014, INKC, [0, 1.33, -1.03]);
  b.rod([0, 1.3, -1.12], [0, 0.97, -1.12], 0.03, ROPE_V, { bone: root, sides: 6 });
  sph(0.045, VERM, [0, 0.95, -1.12], [1, 1.3, 1]);
  box(1.0, 0.34, 0.36, WOODX, [0, yD + 0.17, -1.22]);
  for (let i = 0; i < 7; i++) box(0.11, 0.03, 0.4, LACQ, [-0.45 + i * 0.15, yD + 0.355, -1.22]);
  box(1.04, 0.04, 0.04, GOLDC, [0, yD + 0.33, -1.03]);
  part(new THREE.PlaneGeometry(0.18, 0.225), "#ffffff", [0, yD + 0.17, -1.039], {
    dir: [0, 0, 1],
    axis: "z",
    texture: CREST,
  });
  const coinGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.007, 8);
  part(
    mergeAt(
      coinGeo,
      Array.from({ length: 9 }, () => ({
        p: [(R() - 0.5) * 0.85, yD + 0.375, -1.22 + (R() - 0.5) * 0.12] as V,
        r: [(R() - 0.5) * 0.4, 0, (R() - 0.5) * 0.4] as V,
      })),
    ),
    "#f0c050",
    [0, 0, 0],
    { flat: true },
  );

  // sanbo with mikan
  {
    const x = -0.95;
    const z = -1.25;
    box(0.2, 0.1, 0.2, WOODL, [x, yD + 0.05 + 0.08, z]);
    box(0.32, 0.025, 0.32, WOODL, [x, yD + 0.1 + 0.08 + 0.0125, z]);
    const y = yD + 0.21;
    for (const [dx, dz] of [
      [-0.06, -0.04],
      [0.06, -0.04],
      [0, 0.06],
    ])
      sph(0.058, "#ff9a2e", [x + dx, y + 0.055, z + dz]);
    sph(0.056, "#ff9a2e", [x, y + 0.14, z]);
    cyl(0.01, 0.025, 0.03, 5, "#5fae52", [x, y + 0.2, z]);
  }
  // sake tokkuri and cups
  {
    const x = 0.95;
    const z = -1.25;
    b.lathe(
      [
        [0, 0],
        [0.05, 0],
        [0.07, 0.05],
        [0.07, 0.12],
        [0.035, 0.18],
        [0.03, 0.25],
        [0.042, 0.28],
        [0, 0.28],
      ] as any,
      { at: [x, yD + 0.08, z], segments: 10, color: "#f4f0e6", bone: root },
    );
    torus(0.068, 0.008, "#5b78b8", [x, yD + 0.08 + 0.09, z]);
    for (const dx of [-0.2, -0.12]) {
      cyl(0.04, 0.03, 0.04, 8, VERM, [x + dx, yD + 0.1, z + 0.08]);
    }
  }
  // dango on the step
  {
    const x = 0.42;
    const z = -0.45;
    const yp = G + 0.09 + 0.02;
    cyl(0.12, 0.1, 0.02, 10, "#f6f1e6", [x, G + 0.09 + 0.01, z]);
    const cols = ["#ffb3c7", "#fffaf0", "#9ed36a"];
    for (let i = 0; i < 3; i++) {
      const a = i * 2.1;
      const bx = x + Math.sin(a) * 0.04;
      const bz = z + Math.cos(a) * 0.04;
      const tx = bx + Math.sin(a) * 0.06;
      const tz = bz + Math.cos(a) * 0.06;
      b.rod([bx, yp, bz], [tx, yp + 0.17, tz], 0.004, "#c9a56a", { bone: root });
      [0.04, 0.09, 0.14].forEach((t, j) => {
        const k = t / 0.17;
        sph(0.026, cols[j], [bx + (tx - bx) * k, yp + t, bz + (tz - bz) * k]);
      });
    }
  }

  // sake barrels
  const barrel = (x: number, y: number, z: number) => {
    cyl(0.25, 0.25, 0.46, 12, STRAWG, [x, y + 0.23, z]);
    for (const h of [0.1, 0.36]) torus(0.256, 0.014, "#c9a56a", [x, y + h, z]);
    cyl(0.23, 0.23, 0.02, 12, "#a8794d", [x, y + 0.47, z]);
    part(new THREE.PlaneGeometry(0.22, 0.3), "#ffffff", [x, y + 0.24, z + 0.254], { dir: [0, 0, 1], axis: "z", texture: LABEL });
  };
  barrel(-2.0, G, -0.6);
  barrel(-2.0, G + 0.46, -0.6);
  barrel(-2.0, G, -1.2);

  // ---------------------------------------------------------------- ema rack
  {
    const f = xf(2.85, 0, -0.4, -25);
    const EMA: any = [
      [-0.1, 0],
      [0.1, 0],
      [0.1, 0.15],
      [0, 0.24, "sharp"],
      [-0.1, 0.15],
    ];
    for (const s of [1, -1]) {
      cyl(0.05, 0.05, 1.79, 6, WOOD, f.p(s * 0.78, (G + 1.93) / 2, 0));
      box(0.16, 0.1, 0.16, STONE, f.p(s * 0.78, G + 0.05, 0), { quat: f.q() });
      box(0.95, 0.04, 0.62, TILE, f.p(s * 0.42, 2.127, 0), { quat: f.q(0, 0, -s * 28) });
    }
    box(0.1, 0.06, 0.6, LACQ, f.p(0, 2.36, 0), { quat: f.q() });
    [1.72, 1.25].forEach((beamY, row) => {
      box(1.6, 0.07, 0.1, WOODX, f.p(0, beamY, 0), { quat: f.q() });
      const xs = row === 0 ? [-0.54, -0.27, 0, 0.27, 0.54] : [-0.4, -0.13, 0.13, 0.4];
      xs.forEach((x, i) => {
        const peak = beamY - 0.11;
        b.rod(f.p(x, beamY, 0), f.p(x, peak, 0), 0.006, "#8a6a4a", { bone: root });
        b.extrude(EMA, {
          at: f.p(x, peak - 0.24, 0),
          x: f.d(1, 0, 0),
          y: [0, 1, 0],
          thickness: 0.018,
          color: WOODL,
          bone: root,
        });
        part(new THREE.PlaneGeometry(0.15, 0.15), "#ffffff", f.p(x, peak - 0.24 + 0.095, 0.012), {
          dir: f.d(0, 0, 1),
          axis: "z",
          texture: EMA_ART[(i + row) % 3],
        });
        sph(0.018, VERM, f.p(x, peak + 0.01, 0));
      });
    });
  }

  // ---------------------------------------------------------------- nobori banners
  for (const s of [1, -1]) {
    const x = s * 1.05;
    const z = 3.65;
    box(0.2, 0.12, 0.2, STONE, [x, G + 0.06, z]);
    cyl(0.03, 0.03, 2.1, 6, WOOD, [x, G + 1.1, z]);
    box(0.5, 0.03, 0.03, WOOD, [x, G + 1.95, z]);
    sph(0.04, GOLDC, [x, G + 2.18, z]);
    part(new THREE.BoxGeometry(0.42, 1.45, 0.015), "#ffffff", [x, G + 1.2, z + 0.03], { texture: NOBORI });
  }

  // ---------------------------------------------------------------- temizuya
  {
    const bx = -2.6;
    const bz = 1.5;
    cyl(0.2, 0.26, 0.4, 6, STONE, [bx, G + 0.2, bz]);
    cyl(0.5, 0.4, 0.24, 8, STONE, [bx, G + 0.52, bz]);
    torus(0.44, 0.05, STONE, [bx, G + 0.64, bz]);
    glow(cyl(0.4, 0.4, 0.02, 8, "#7fe0ee", [bx, G + 0.635, bz]), 0.6);
    b.rod([bx - 0.1, G, bz - 0.6], [bx - 0.1, G + 1.05, bz - 0.6], 0.03, WOOD, { bone: root });
    b.rod([bx - 0.1, G + 1.0, bz - 0.6], [bx - 0.04, G + 0.72, bz - 0.12], 0.035, BAMBOO, { bone: root });
    b.rod([bx, G + 0.67, bz + 0.05], [bx + 0.55, G + 0.72, bz + 0.25], 0.012, BAMBOO, { bone: root });
    cyl(0.05, 0.045, 0.07, 8, BAMBOO, [bx - 0.02, G + 0.68, bz + 0.04]);
  }

  // ---------------------------------------------------------------- sakura tree
  {
    b.sweep(
      catmull([
        [-3.45, G - 0.05, -2.0],
        [-3.4, 0.8, -2.05],
        [-3.2, 1.5, -2.25],
        [-3.05, 2.1, -2.4],
      ]),
      [0.26, 0.19, 0.13, 0.08],
      { color: BARK, bone: root, sides: 7 },
    );
    b.sweep(
      catmull([
        [-3.35, 1.1, -2.1],
        [-2.9, 1.5, -2.0],
        [-2.5, 1.85, -2.05],
      ]),
      [0.08, 0.045, 0.02],
      { color: BARK, bone: root, sides: 6 },
    );
    b.sweep(
      catmull([
        [-3.3, 1.4, -2.2],
        [-3.7, 1.7, -2.5],
        [-3.95, 2.0, -2.6],
      ]),
      [0.07, 0.04, 0.02],
      { color: BARK, bone: root, sides: 6 },
    );
    const C: V = [-3.0, 2.3, -2.45];
    const blobs: [number, number, number, number, any][] = [
      [0, 0.2, 0, 0.95, PINK1],
      [0.9, -0.1, 0.3, 0.7, PINK2],
      [-0.9, -0.1, -0.2, 0.75, PINK3],
      [0.2, 0.55, 0.7, 0.6, PINK2],
      [-0.3, 0.5, -0.6, 0.65, PINK1],
      [0.5, -0.45, -0.5, 0.6, PINK3],
      [-0.5, -0.4, 0.6, 0.6, PINK1],
      [1.3, -0.4, -0.2, 0.5, PINK1],
      [-1.35, -0.35, 0.2, 0.5, PINK2],
      [0.1, 0.75, -0.1, 0.55, PINK3],
    ];
    for (const [dx, dy, dz, r, c] of blobs)
      part(new THREE.IcosahedronGeometry(r, 1), c, [C[0] + dx, C[1] + dy, C[2] + dz], {
        scale: [1, 0.8, 1],
        rotation: [R() * 90, R() * 90, 0],
        flat: true,
      });
  }

  // ---------------------------------------------------------------- scatter: petals, flowers, grass
  {
    const petal = new THREE.CylinderGeometry(0.03, 0.03, 0.004, 5);
    const groundPetals: { p: V; r: V }[] = [];
    const airPetals: { p: V; r: V }[] = [];
    for (let i = 0; i < 70; i++) {
      const onPath = i % 2 === 0;
      const x = onPath ? (R() - 0.5) * 1.0 : -4 + R() * 2.4;
      const z = onPath ? -0.2 + R() * 4 : -3 + R() * 6;
      groundPetals.push({ p: [x, onPath ? G + 0.052 : G + 0.006, z], r: [0, R() * 6, 0] });
    }
    for (let i = 0; i < 28; i++)
      airPetals.push({
        p: [-4 + R() * 4.5, 0.5 + R() * 2.6, -3.2 + R() * 5.5],
        r: [R() * 3, R() * 3, R() * 3],
      });
    part(mergeAt(petal, groundPetals.slice(0, 35)), "#ffc2d4", [0, 0, 0], { flat: true });
    part(mergeAt(petal, groundPetals.slice(35)), "#ffa9c2", [0, 0, 0], { flat: true });
    part(mergeAt(petal, airPetals), "#ffb3cb", [0, 0, 0], { flat: true });

    const keep = (h: { at: THREE.Vector3; n: THREE.Vector3 }) => {
      const x = h.at.x;
      const z = h.at.z;
      if (h.n.y < 0.8) return false;
      if (Math.abs(x) < 0.9 && z > -0.5) return false;
      if (Math.abs(x) < 1.85 && z < -0.3 && z > -3.7) return false;
      if (Math.hypot(Math.abs(x) - 1.3, z) < 0.65) return false;
      if (Math.hypot(Math.abs(x) - 1.1, z - 1.5) < 0.5) return false;
      if (Math.hypot(Math.abs(x) - 1.4, z - 2.7) < 0.5) return false;
      if (Math.hypot(Math.abs(x) - 1.05, z - 3.65) < 0.4) return false;
      if (Math.hypot(x + 2.0, z + 0.9) < 0.6) return false;
      if (Math.hypot(x + 2.6, z - 1.5) < 0.85) return false;
      if (Math.hypot(x - 2.85, z + 0.4) < 0.9) return false;
      if (Math.hypot(x + 3.4, z + 2.0) < 0.5) return false;
      return true;
    };
    const skin = b.surface(ground);
    const hits = skin.scatter(130, { rng: rng(5), minDist: 0.28, filter: keep });
    b.cards(hits, TUFT, { size: [0.13, 0.15], lean: 12, vary: 0.3, cross: true, rng: rng(6), bone: root });
    const fl = skin.scatter(30, { rng: rng(8), minDist: 0.4, filter: keep });
    const fcols = ["#fff6ea", "#ffe27a", "#c9a8f5"];
    fcols.forEach((c, k) => {
      const mine = fl.filter((_h, i) => i % 3 === k);
      if (!mine.length) return;
      part(
        mergeAt(
          new THREE.IcosahedronGeometry(0.03, 0),
          mine.map((h) => ({ p: [h.at.x, G + 0.07, h.at.z] as V })),
        ),
        c,
        [0, 0, 0],
        { flat: true },
      );
    });
  }

  return b.root;
}
