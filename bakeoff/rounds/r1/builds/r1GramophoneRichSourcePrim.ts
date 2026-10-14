import * as THREE from "three";
import { createBuilder, svg, paint, noise, smoothstep, mix, grain } from "../../../../src/index";

export const meta = {
  name: "Antique Gramophone",
  description:
    "Walnut cabinet with floral inlay, claw feet, a faceted morning-glory brass horn with green patina, a record with a red label, a silver tonearm and a side wind-up crank.",
};

function flower(cx: number, cy: number, s: number, n: number) {
  let out = "";
  for (let i = 0; i < n; i++)
    out += `<ellipse cx="${cx}" cy="${cy - 16 * s}" rx="${6.5 * s}" ry="${15 * s}" transform="rotate(${(i * 360) / n} ${cx} ${cy})"/>`;
  return out + `<circle cx="${cx}" cy="${cy}" r="${6 * s}" fill="#c9a35d"/>`;
}

export default function build() {
  const b = createBuilder({ name: "gramophone" });

  // ---- joints
  const A = new THREE.Vector3(0, 0.6, -0.12);
  const d = new THREE.Vector3(0, 0.5, 0.866).normalize();
  b.joint("root", { at: [0, 0, 0] });
  b.joint("turntable", { parent: "root", at: [0, 0.35, 0.03], dir: [0, 1, 0] });
  b.joint("tonearm", { parent: "root", at: [0.19, 0.402, -0.06], dir: [0, 1, 0] });
  b.joint("crank", { parent: "root", at: [0.236, 0.205, 0.13], dir: [1, 0, 0] });
  b.joint("horn", { parent: "root", at: A, dir: d });

  // ---- paints
  const walnut = grain("#5a321a", "#3a1d0d", { size: 0.012, axis: "x", seed: 2 });
  const walnutLight = grain("#8c5b33", "#6a4124", { size: 0.01, axis: "x", seed: 5 });
  const darkWood = "#2e1609";
  const brass = paint((p) => {
    const k = smoothstep(0.52, 0.78, noise(p, 0.08, 4));
    const wear = noise(p, 0.02, 9);
    const base = mix("#c3943a", "#9a6f26", wear);
    return mix(base, "#6f9d86", k * 0.75);
  });
  const bellPaint = paint((p, n, s) => {
    const a = (s[1] * Math.PI) / 180;
    const ray = smoothstep(0.75, 1, Math.cos(a * 5));
    const col = brass.at(p, n);
    return mix(col, "#e2b95a", ray * 0.3);
  });
  const C = new THREE.Vector2(0, 0.03);
  const recordPaint = paint((p) => {
    const r = Math.hypot(p.x - C.x, p.z - C.y);
    if (r < 0.006) return "#111111";
    if (r < 0.034) return Math.abs(r - 0.0295) < 0.0015 ? "#d8b04a" : "#b3201f";
    if (r < 0.042) return "#b3201f";
    if (r > 0.132) return "#050506";
    const g = 0.5 + 0.5 * Math.sin(r * 1000);
    return mix("#0a0a0c", "#1f1f25", g * (r < 0.052 ? 0.2 : 1));
  });

  const box = (w: number, h: number, dd: number, x: number, y: number, z: number, color: any, name?: string) =>
    b.part(new THREE.BoxGeometry(w, h, dd), color, { at: [x, y, z], bone: "root", name });
  const cyl = (rt: number, rb: number, h: number, seg: number, at: number[], color: any, bone = "root", dir?: number[]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at, bone, ...(dir ? { dir } : {}) });

  // ---- cabinet
  box(0.5, 0.03, 0.48, 0, 0.07, 0, walnut, "plinth");
  const body = box(0.46, 0.24, 0.44, 0, 0.205, 0, walnut, "body");
  box(0.51, 0.02, 0.49, 0, 0.335, 0, walnut, "cornice");
  box(0.53, 0.006, 0.51, 0, 0.347 - 0.0, 0, darkWood);
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      cyl(0.02, 0.02, 0.24, 8, [sx * 0.225, 0.205, sz * 0.215], darkWood);
      cyl(0.024, 0.024, 0.008, 8, [sx * 0.225, 0.325, sz * 0.215], brass);
      cyl(0.024, 0.024, 0.008, 8, [sx * 0.225, 0.09, sz * 0.215], brass);
      // claw foot
      const px = sx * 0.19;
      const pz = sz * 0.18;
      b.part(new THREE.SphereGeometry(0.03, 8, 6), darkWood, { at: [px, 0.04, pz], bone: "root" });
      const base = Math.atan2(sz, sx);
      for (const off of [-0.9, 0, 0.9]) {
        const ang = base + off;
        b.capsule([px, 0.032, pz], [px + Math.cos(ang) * 0.05, 0.007, pz + Math.sin(ang) * 0.05], [0.012, 0.006], {
          color: brass,
          bone: "root",
          sides: 5,
          name: "claw",
        });
      }
    }

  // front panel + trim
  const front = box(0.34, 0.17, 0.008, 0, 0.205, 0.222, walnutLight, "frontPanel");
  box(0.37, 0.014, 0.012, 0, 0.297, 0.225, darkWood);
  box(0.37, 0.014, 0.012, 0, 0.113, 0.225, darkWood);
  box(0.014, 0.19, 0.012, 0.177, 0.205, 0.225, darkWood);
  box(0.014, 0.19, 0.012, -0.177, 0.205, 0.225, darkWood);
  // side panels
  const panelL = box(0.008, 0.17, 0.24, 0.232, 0.205, -0.07, walnutLight, "sidePanelL");
  const panelR = box(0.008, 0.17, 0.24, -0.232, 0.205, -0.07, walnutLight, "sidePanelR");

  // floral inlay
  const markup = `<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
<g fill="#ecdcae" stroke="none">${flower(100, 50, 1.2, 8)}${flower(38, 50, 0.7, 6)}${flower(162, 50, 0.7, 6)}
<ellipse cx="68" cy="34" rx="9" ry="4" transform="rotate(-30 68 34)"/><ellipse cx="68" cy="66" rx="9" ry="4" transform="rotate(30 68 66)"/>
<ellipse cx="132" cy="34" rx="9" ry="4" transform="rotate(30 132 34)"/><ellipse cx="132" cy="66" rx="9" ry="4" transform="rotate(-30 132 66)"/>
<circle cx="16" cy="16" r="3"/><circle cx="184" cy="16" r="3"/><circle cx="16" cy="84" r="3"/><circle cx="184" cy="84" r="3"/></g>
<g fill="none" stroke="#ecdcae" stroke-width="2"><rect x="5" y="5" width="190" height="90" rx="8"/>
<path d="M54 50 C62 40 70 60 80 50"/><path d="M146 50 C138 40 130 60 120 50"/>
<path d="M22 50 C 20 30 30 20 40 14"/><path d="M178 50 C180 30 170 20 160 14"/>
<path d="M22 50 C 20 70 30 80 40 86"/><path d="M178 50 C180 70 170 80 160 86"/></g></svg>`;
  const inlay = svg(markup, { size: 512 });
  b.decal(front, inlay, { at: [0, 0.205, 0.226], dir: [0, 0, 1], size: [0.31, 0.155], bone: "root", segments: [4, 2] });
  b.decal(panelL, inlay, { at: [0.236, 0.205, -0.07], dir: [1, 0, 0], size: [0.22, 0.11], bone: "root", segments: [4, 2] });
  b.decal(panelR, inlay, { at: [-0.236, 0.205, -0.07], dir: [-1, 0, 0], size: [0.22, 0.11], bone: "root", segments: [4, 2] });

  // small brass knob on lid front
  b.part(new THREE.SphereGeometry(0.013, 8, 6), brass, { at: [-0.18, 0.352, 0.19], bone: "root" });

  // ---- turntable
  cyl(0.145, 0.145, 0.01, 24, [0, 0.35, 0.03], brass, "turntable");
  cyl(0.135, 0.135, 0.004, 32, [0, 0.357, 0.03], recordPaint, "turntable");
  cyl(0.004, 0.004, 0.024, 6, [0, 0.368, 0.03], "#d7dadd", "turntable");

  // ---- horn
  const neck = [
    [0, 0.35, -0.15],
    [0, 0.43, -0.168],
    [0, 0.52, -0.168],
    [0, 0.565, -0.152],
    [A.x, A.y, A.z],
  ];
  b.sweep(neck, (t) => 0.034 - 0.007 * t, { color: brass, bone: "root", caps: "round", sides: 8, name: "neck" });
  cyl(0.048, 0.055, 0.016, 10, [0, 0.354, -0.15], brass);
  b.part(new THREE.CylinderGeometry(0.042, 0.042, 0.02, 10), brass, { at: A, dir: d, bone: "horn" });

  const L = 0.6;
  const outer: number[][] = [];
  for (let i = 0; i <= 9; i++) {
    const y = (L * i) / 9;
    outer.push([0.028 + 0.272 * Math.pow(y / L, 3.1), y]);
  }
  const inner = outer
    .slice()
    .reverse()
    .map(([r, y]) => [Math.max(r - 0.006, 0.02), y]);
  b.lathe([...outer, ...inner], { color: bellPaint, at: A, axis: d, segments: 10, bone: "horn", name: "bell" });
  const M = A.clone().addScaledVector(d, L);
  b.part(new THREE.TorusGeometry(0.302, 0.009, 5, 20), brass, { at: M, dir: d, axis: "z", bone: "horn", name: "rim" });
  // mid bands on the bell
  for (const f of [0.35, 0.7]) {
    const y = L * f;
    const r = 0.028 + 0.272 * Math.pow(f, 3.1);
    b.part(new THREE.TorusGeometry(r + 0.002, 0.005, 4, 14), brass, {
      at: A.clone().addScaledVector(d, y),
      dir: d,
      axis: "z",
      bone: "horn",
    });
  }

  // ---- tonearm
  const silver = "#cfd3d6";
  cyl(0.028, 0.032, 0.03, 12, [0.19, 0.36, -0.06], "#b8bcc0", "root");
  cyl(0.012, 0.012, 0.035, 8, [0.19, 0.385, -0.06], silver, "tonearm");
  b.part(new THREE.SphereGeometry(0.015, 8, 6), silver, { at: [0.19, 0.402, -0.06], bone: "tonearm" });
  b.sweep(
    [
      [0.19, 0.402, -0.06],
      [0.125, 0.402, -0.05],
      [0.082, 0.398, -0.01],
      [0.074, 0.384, 0.018],
    ],
    0.005,
    { color: silver, bone: "tonearm", caps: "round", sides: 6, name: "arm" },
  );
  b.capsule([0.19, 0.402, -0.06], [0.222, 0.402, -0.07], 0.014, { color: "#2a2a2c", bone: "tonearm", sides: 8, name: "counterweight" });
  b.part(new THREE.BoxGeometry(0.018, 0.008, 0.032), "#9aa0a5", { at: [0.074, 0.377, 0.022], bone: "tonearm", name: "headshell" });
  b.part(new THREE.ConeGeometry(0.003, 0.012, 5), "#e8e8e8", { at: [0.074, 0.3655, 0.026], rotation: [180, 0, 0], bone: "tonearm", name: "needle" });

  // ---- crank
  cyl(0.032, 0.032, 0.006, 12, [0.236, 0.205, 0.13], brass, "root", [1, 0, 0]);
  b.rod([0.236, 0.205, 0.13], [0.3, 0.205, 0.13], 0.007, { color: "#cfd3d6", bone: "crank", sides: 6, name: "shaft" });
  b.part(new THREE.SphereGeometry(0.013, 8, 6), brass, { at: [0.3, 0.205, 0.13], bone: "crank" });
  b.capsule([0.3, 0.205, 0.13], [0.3, 0.145, 0.13], 0.007, { color: brass, bone: "crank", sides: 6, name: "crankArm" });
  b.capsule([0.3, 0.145, 0.13], [0.345, 0.145, 0.13], 0.011, { color: "#2b140a", bone: "crank", sides: 8, name: "handle" });
  b.part(new THREE.SphereGeometry(0.016, 8, 6), "#2b140a", { at: [0.35, 0.145, 0.13], bone: "crank" });

  void body;
  return b.root;
}
