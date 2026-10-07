```ts
import * as THREE from "three";
import { createBuilder, arc } from "agentic-3js-builder";

export const meta = {
  name: "Racing Green Typewriter",
  description:
    "1930s desk typewriter in glossy racing green with four staggered rows of round chrome-rimmed keys, a semicircle of type bars, a chrome carriage return lever, a black platen with a half-typed sheet and a brass maker's badge.",
};

export default function build() {
  const b = createBuilder({ name: "typewriter" });
  b.joint("root", { at: [0, 0, 0] });

  const GREEN = "#0b4a2b";
  const CHROME = "#d3d7db";
  const BLACK = "#0e0e0e";
  const BRASS = "#c9a43c";

  const green = b.material(GREEN);
  green.roughness = 0.18;
  green.metalness = 0.15;
  const chrome = b.material(CHROME);
  chrome.roughness = 0.22;
  chrome.metalness = 0.65;
  const black = b.material(BLACK);
  black.roughness = 0.3;
  const brass = b.material(BRASS);
  brass.roughness = 0.3;
  brass.metalness = 0.5;

  const add = (g: THREE.BufferGeometry, color: string, o: any = {}) => b.part(g, color, { bone: "root", ...o });

  // ---- body (side profile extruded across the width)
  b.extrude(
    [
      [0.2, 0.014],
      [0.2, 0.05],
      [0.04, 0.12],
      [-0.1, 0.14],
      [-0.2, 0.14],
      [-0.2, 0.014],
    ],
    { color: GREEN, at: [0, 0, 0], thickness: 0.34, bevel: 0.012, bone: "root", name: "body" },
  );

  // feet
  for (const sx of [-1, 1])
    for (const sz of [-1, 1])
      add(new THREE.CylinderGeometry(0.02, 0.024, 0.016, 10), BLACK, { at: [sx * 0.135, 0.008, sz * 0.15] });

  // ---- keys
  const letters = ["1234567890", "QWERTYUIOP", "ASDFGHJKL;", "ZXCVBNM,./"];
  let cells = "";
  letters.forEach((row, r) =>
    [...row].forEach((ch, c) => {
      cells += `<rect x="${c * 64}" y="${r * 64}" width="64" height="64" fill="#15150f"/>` +
        `<text x="${c * 64 + 32}" y="${r * 64 + 45}" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="40" fill="#f1e6c4">${ch}</text>`;
    }),
  );
  const keyTex = b.constructor && svgTex(`<svg viewBox="0 0 640 256" xmlns="http://www.w3.org/2000/svg">${cells}</svg>`, 1024);

  const n = new THREE.Vector3(0, 1, 0.4375).normalize();
  const deck = (z: number) => new THREE.Vector3(0, 0.05 + (0.2 - z) * 0.4375, z);
  const rowZ = [0.045, 0.08, 0.115, 0.15];
  const rowOff = [-0.012, -0.004, 0.004, 0.012];
  rowZ.forEach((z, r) => {
    for (let c = 0; c < 10; c++) {
      const x = (c - 4.5) * 0.032 + rowOff[r];
      const base = deck(z);
      base.x = x;
      add(new THREE.CylinderGeometry(0.0135, 0.0135, 0.01, 12), CHROME, {
        at: base.clone().addScaledVector(n, 0.004),
        dir: n,
        up: [0, 0, 1],
        name: `keyrim${r}_${c}`,
      });
      const g = new THREE.CircleGeometry(0.0105, 12).rotateX(-Math.PI / 2);
      const uv = g.attributes.uv as THREE.BufferAttribute;
      for (let i = 0; i < uv.count; i++)
        uv.setXY(i, (c + uv.getX(i)) / 10, 1 - (r + 1 - uv.getY(i)) / 4);
      add(g, "#ffffff", {
        at: base.clone().addScaledVector(n, 0.0102),
        dir: n,
        up: [0, 0, 1],
        texture: keyTex,
        name: `keycap${r}_${c}`,
      });
    }
  });
  // space bar
  {
    const p = deck(0.188).addScaledVector(n, 0.004);
    add(new THREE.BoxGeometry(0.17, 0.008, 0.014), CHROME, { at: p, dir: n, up: [0, 0, 1], name: "spacebar" });
  }

  // ---- type bars
  const R = 0.115;
  const cy = 0.15;
  const cz = -0.07;
  b.sweep(arc([0, cy, cz], [R * Math.sin((-80 * Math.PI) / 180), cy, cz + R * Math.cos((-80 * Math.PI) / 180)], [0, 1, 0], 160), {
    radius: 0.003,
    color: CHROME,
    sides: 5,
    bone: "root",
    name: "basket",
  });
  const tip = new THREE.Vector3(0, 0.205, -0.088);
  const BARS = 29;
  for (let i = 0; i < BARS; i++) {
    const phi = ((-78 + (156 * i) / (BARS - 1)) * Math.PI) / 180;
    const base = new THREE.Vector3(R * Math.sin(phi), cy, cz + R * Math.cos(phi));
    const t = tip.clone();
    b.rod(base, t, 0.0016, { color: CHROME, sides: 4, bone: "root", name: `bar${i}` });
    const dir = t.clone().sub(base);
    add(new THREE.BoxGeometry(0.006, 0.01, 0.004), CHROME, {
      at: base.clone().lerp(t, 0.93),
      dir,
      name: `slug${i}`,
    });
  }
  for (let i = 0; i < 9; i++) {
    const phi = ((-70 + 17.5 * i) * Math.PI) / 180;
    const x = R * Math.sin(phi);
    const z = cz + R * Math.cos(phi);
    add(new THREE.CylinderGeometry(0.003, 0.003, 0.04, 6), CHROME, { at: [x, 0.13, z], name: `post${i}` });
  }

  // ---- ribbon spools
  for (const sx of [-1, 1]) {
    add(new THREE.CylinderGeometry(0.032, 0.032, 0.012, 16), CHROME, { at: [sx * 0.115, 0.146, -0.165] });
    add(new THREE.CylinderGeometry(0.011, 0.011, 0.018, 10), BLACK, { at: [sx * 0.115, 0.149, -0.165] });
  }

  // ---- carriage
  const PY = 0.22;
  const PZ = -0.12;
  for (const sx of [-1, 1])
    add(new THREE.BoxGeometry(0.012, 0.09, 0.1), GREEN, { at: [sx * 0.162, 0.215, -0.12], name: "carriageEnd" });
  add(new THREE.BoxGeometry(0.33, 0.02, 0.012), GREEN, { at: [0, 0.18, -0.165], name: "carriageBrace" });
  add(new THREE.CylinderGeometry(0.032, 0.032, 0.3, 18).rotateZ(Math.PI / 2), BLACK, {
    at: [0, PY, PZ],
    name: "platen",
  });
  add(new THREE.CylinderGeometry(0.004, 0.004, 0.42, 6).rotateZ(Math.PI / 2), CHROME, { at: [0, PY, PZ], name: "platenShaft" });
  for (const sx of [-1, 1]) {
    add(new THREE.CylinderGeometry(0.022, 0.022, 0.022, 12).rotateZ(Math.PI / 2), BLACK, { at: [sx * 0.212, PY, PZ], name: "platenKnob" });
    add(new THREE.CylinderGeometry(0.009, 0.009, 0.006, 8).rotateZ(Math.PI / 2), CHROME, { at: [sx * 0.226, PY, PZ] });
  }
  // paper bail
  b.rod([-0.15, 0.245, -0.081], [0.15, 0.245, -0.081], 0.002, { color: CHROME, sides: 5, bone: "root", name: "bail" });

  // carriage return lever (left = +X)
  b.sweep(
    [
      [0.166, 0.258, -0.11],
      [0.2, 0.285, -0.1],
      [0.238, 0.298, -0.075],
      [0.262, 0.296, -0.045],
    ],
    { radius: 0.0042, color: CHROME, sides: 6, bone: "root", name: "returnLever" },
  );
  add(new THREE.SphereGeometry(0.011, 10, 8), BLACK, { at: [0.268, 0.295, -0.037], name: "leverBall" });

  // ---- paper
  const cyP = PY;
  const czP = PZ;
  const RP = 0.0345;
  const prof: Array<[number, number]> = [];
  for (let a = -50; a <= 20; a += 10) {
    const r = (a * Math.PI) / 180;
    prof.push([czP + RP * Math.cos(r), cyP + RP * Math.sin(r)]);
  }
  const last = prof[prof.length - 1];
  const ar = (20 * Math.PI) / 180;
  prof.push([last[0] - Math.sin(ar) * 0.15, last[1] + Math.cos(ar) * 0.15]);
  const cum = [0];
  for (let i = 1; i < prof.length; i++)
    cum.push(cum[i - 1] + Math.hypot(prof[i][0] - prof[i - 1][0], prof[i][1] - prof[i - 1][1]));
  const total = cum[cum.length - 1];
  const pos: number[] = [];
  const uvs: number[] = [];
  const idx: number[] = [];
  const W = 0.105;
  prof.forEach(([z, y], i) => {
    pos.push(-W, y, z + 0.0004, W, y, z + 0.0004);
    uvs.push(0, cum[i] / total, 1, cum[i] / total);
    if (i < prof.length - 1) {
      const k = i * 2;
      idx.push(k, k + 1, k + 3, k, k + 3, k + 2);
    }
  });
  const pg = new THREE.BufferGeometry();
  pg.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  pg.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  pg.setIndex(idx);
  pg.computeVertexNormals();
  const lines = [
    "Dear Mr. Hargrove,",
    "",
    "Thank you for your kind letter of",
    "the 12th. The shipment has arrived",
    "in good order and we are delighted",
    "with the quality of the goods.",
    "",
    "Yours faithfully,",
    "E. Whitcombe_",
  ];
  const paperSvg =
    `<svg viewBox="0 0 210 192" xmlns="http://www.w3.org/2000/svg"><rect width="210" height="192" fill="#f4efe0"/>` +
    lines
      .map((l, i) => `<text x="16" y="${22 + i * 12}" font-family="Courier New, monospace" font-size="8.5" fill="#2b2b2b">${l}</text>`)
      .join("") +
    `</svg>`;
  const paper = add(pg, "#ffffff", { texture: svgTex(paperSvg, 512), name: "paper" });
  (paper.mesh.material as THREE.MeshStandardMaterial).side = THREE.DoubleSide;

  // ---- badge
  const badgeRim = new THREE.CylinderGeometry(0.5, 0.5, 0.004, 24).rotateX(Math.PI / 2);
  add(badgeRim, BRASS, { at: [0, 0.03, 0.2], scale: [0.086, 0.036, 1], name: "badgeRim" });
  const badgeSvg =
    `<svg viewBox="0 0 152 60" xmlns="http://www.w3.org/2000/svg">` +
    `<ellipse cx="76" cy="30" rx="74" ry="28" fill="#d9b24c" stroke="#7a5a14" stroke-width="3"/>` +
    `<ellipse cx="76" cy="30" rx="66" ry="22" fill="none" stroke="#8a6a1a" stroke-width="1.5"/>` +
    `<text x="76" y="30" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="17" fill="#4e360a">WHITCOMBE</text>` +
    `<text x="76" y="44" text-anchor="middle" font-family="Georgia, serif" font-size="8" fill="#4e360a">STANDARD · No. 7</text></svg>`;
  add(new THREE.PlaneGeometry(0.08, 0.032), "#ffffff", {
    at: [0, 0.03, 0.2025],
    texture: svgTex(badgeSvg, 512),
    name: "badge",
  });

  return b.root;
}

import { svg } from "agentic-3js-builder";
function svgTex(markup: string, size: number) {
  return svg(markup, { size });
}
```