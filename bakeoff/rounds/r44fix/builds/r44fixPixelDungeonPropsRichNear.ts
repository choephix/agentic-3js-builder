import * as THREE from "three";
import { createBuilder } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { pixelArt, pixelTexture, tileBox, pick, bayer } from "../../../../kits/pixel";

export const meta = {
  name: "Dungeon Props",
  description: "Pixel-art dungeon props: iron-banded chest, wall torches, barrels, scattered bones and a spike trap.",
};

const TEXEL = 0.02;

export default function build() {
  const b = createBuilder({ name: "dungeonProps" });
  const root = b.joint("root", { at: [0, 0, 0] });

  const WOODS = ["#3a2314", "#5a3a20", "#7a5230", "#946a3e"];
  const STONES = ["#2a2c38", "#3e4254", "#585d72", "#7a8098"];
  const woodTile = pixelTexture(32, 24, (g) =>
    g.fill((x, y) => (y % 6 === 0 ? "#24140a" : pick(WOODS, 0.35 + 0.4 * ((Math.sin(x * 1.7 + y * 3.1) + 1) / 2), bayer(x, y)))),
  );
  const stoneTile = pixelTexture(32, 32, (g) =>
    g.fill((x, y) => {
      const brick = y % 8 === 0 || (x + (Math.floor(y / 8) % 2) * 8) % 16 === 0;
      return brick ? "#181a22" : pick(STONES, 0.3 + 0.5 * ((Math.sin(x * 2.3) * Math.cos(y * 1.9) + 1) / 2), bayer(x, y));
    }),
  );
  const boneTex = pixelArt(["wwww", "wwgw", "wwww"], { w: "#f0e8d0", g: "#c8bc9c" });

  const box = (size: [number, number, number], at: [number, number, number], tex: THREE.Texture, tint = "#ffffff", rot?: [number, number, number]) =>
    b.part(tileBox(size, tex as never, TEXEL), tint, { bone: root, at, texture: tex, rotation: rot });
  const flat = (size: [number, number, number], at: [number, number, number], c: string, rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(...size), c, { bone: root, at, rotation: rot });

  // floor slab
  box([3.2, 0.1, 2.2], [0, 0.05, 0], stoneTile);

  // chest
  const cx = -0.9, cz = -0.2;
  box([0.8, 0.4, 0.5], [cx, 0.3, cz], woodTile);
  const lid = b.joint("chestLid", { parent: root, at: [cx, 0.5, cz - 0.25], dir: [1, 0, 0], role: "hinge" });
  b.part(new THREE.CylinderGeometry(0.25, 0.25, 0.8, 8, 1, false, 0, Math.PI), "#7a5230", {
    bone: lid, at: [cx, 0.5, cz], rotation: [0, 0, 90], flat: true,
  });
  for (const x of [-0.28, 0.28]) {
    flat([0.06, 0.42, 0.52], [cx + x, 0.3, cz], "#2a2d3a");
    b.part(new THREE.CylinderGeometry(0.27, 0.27, 0.06, 8, 1, false, 0, Math.PI), "#2a2d3a", {
      bone: lid, at: [cx + x, 0.5, cz], rotation: [0, 0, 90], flat: true,
    });
  }
  flat([0.12, 0.14, 0.04], [cx, 0.46, cz + 0.27], "#e8b830");
  flat([0.04, 0.05, 0.05], [cx, 0.45, cz + 0.29], "#1a1208");
  glow(flat([0.5, 0.04, 0.3], [cx, 0.52, cz], "#ffd24a"), 1.2);
  b.pose(lid, { axis: [1, 0, 0], deg: -35 });

  // barrels
  const barrel = (x: number, z: number, h: number) => {
    b.part(new THREE.CylinderGeometry(0.28, 0.24, h, 8), "#ffffff", { bone: root, at: [x, 0.1 + h / 2, z], texture: woodTile, flat: true });
    for (const f of [0.2, 0.8])
      b.part(new THREE.CylinderGeometry(0.295, 0.275, 0.05, 8), "#2a2d3a", { bone: root, at: [x, 0.1 + h * f, z], flat: true });
    b.part(new THREE.CylinderGeometry(0.22, 0.22, 0.02, 8), "#2a1a0e", { bone: root, at: [x, 0.1 + h, z] });
  };
  barrel(0.1, -0.7, 0.6);
  barrel(0.65, -0.65, 0.6);
  barrel(0.38, -0.65, 0.6 + 0.0);
  b.part(new THREE.CylinderGeometry(0.26, 0.22, 0.5, 8), "#6a4426", { bone: root, at: [0.38, 0.95, -0.62], flat: true });
  b.part(new THREE.CylinderGeometry(0.27, 0.27, 0.05, 8), "#2a2d3a", { bone: root, at: [0.38, 0.9, -0.62] });

  // wall torches on brick posts
  for (const x of [-1.4, 1.4]) {
    box([0.2, 1.3, 0.2], [x, 0.75, -0.95], stoneTile);
    flat([0.06, 0.3, 0.06], [x, 1.5, -0.95], "#4a2c14");
    flat([0.14, 0.05, 0.14], [x, 1.66, -0.95], "#2a2d3a");
    glow(flat([0.1, 0.16, 0.1], [x, 1.76, -0.95], "#ff8a1e"), 1.6);
    glow(flat([0.06, 0.14, 0.06], [x, 1.84, -0.95], "#ffe060"), 1.8);
    glow(flat([0.03, 0.04, 0.03], [x + 0.04, 1.96, -0.95], "#ffd040"), 2);
  }

  // spike trap
  const sx = 0.9, sz = 0.45;
  flat([0.9, 0.04, 0.9], [sx, 0.12, sz], "#2a2c38");
  flat([0.8, 0.02, 0.8], [sx, 0.15, sz], "#14151c");
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 4; j++) {
      const h = 0.22 + ((i * 3 + j * 5) % 3) * 0.04;
      b.part(new THREE.ConeGeometry(0.05, h, 4), "#c8d0dc", { bone: root, at: [sx - 0.27 + i * 0.18, 0.15 + h / 2, sz - 0.27 + j * 0.18], flat: true });
    }
  flat([0.04, 0.012, 0.04], [sx + 0.2, 0.17, sz + 0.2], "#8a1e1e");

  // bones
  const bone = (x: number, z: number, len: number, rot: number) => {
    const p = b.part(new THREE.BoxGeometry(len, 0.05, 0.05), "#ffffff", { bone: root, at: [x, 0.125, z], rotation: [0, rot, 0], texture: boneTex });
    for (const s of [-1, 1])
      for (const k of [-1, 1]) {
        const a = rot * Math.PI / 180;
        b.part(new THREE.BoxGeometry(0.07, 0.06, 0.06), "#f0e8d0", {
          bone: root,
          at: [x + Math.cos(a) * s * len / 2 - Math.sin(a) * k * 0.0, 0.125, z - Math.sin(a) * s * len / 2],
        });
        break;
      }
    return p;
  };
  bone(-0.1, 0.6, 0.5, 20);
  bone(-0.3, 0.75, 0.4, -50);
  bone(0.2, 0.8, 0.45, 80);
  // skull
  b.part(new THREE.BoxGeometry(0.22, 0.2, 0.22), "#eee4c8", { bone: root, at: [-0.5, 0.2, 0.4], rotation: [0, 30, 0] });
  b.part(new THREE.BoxGeometry(0.16, 0.06, 0.12), "#d8cca8", { bone: root, at: [-0.5, 0.07 + 0.03, 0.4], rotation: [0, 30, 0] });
  for (const s of [-1, 1])
    b.part(new THREE.BoxGeometry(0.05, 0.05, 0.03), "#120a0a", { bone: root, at: [-0.5 + Math.cos(0.52) * s * 0.05 + 0.055, 0.22, 0.4 + 0.1 - s * 0.03], rotation: [0, 30, 0] });

  return b.root;
}
