```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Unicorn Foal",
  description:
    "A newborn pearl-white unicorn foal with a soft lilac shimmer on wobbly long legs, a short fluffy pastel pink/mint/lavender mane and tail, a small gold spiralled horn, big dark lashed eyes, little silver hooves and a daisy chain around its neck.",
};

type V3 = THREE.Vector3;
const TAU = Math.PI * 2;
const V = (x: number, y: number, z: number): V3 => new THREE.Vector3(x, y, z);
const arr = (p: V3): number[] => [p.x, p.y, p.z];
const X_AXIS = V(1, 0, 0);

// ------------------------------------------------------------------ palette
const C = {
  coat: "#f8f4fc",
  coatShade: "#ebe2f8",
  tintLilac: "#f0e8fb",
  tintPink: "#fbeaf4",
  tintMint: "#eaf8f2",
  legLo: "#efe8fa",
  legLo2: "#e3d8f6",
  nose: "#f7cfe2",
  nostril: "#8b5a8a",
  earIn: "#f9bbd6",
  blush: "#ffc3da",
  shadow: "#d6c4f3",
  eye: "#2a1840",
  iris: "#5a3a8c",
  glow: "#9a7be0",
  pupil: "#120820",
  white: "#ffffff",
  lash: "#2a1634",
  hoof: "#cdd3e1",
  hoofBand: "#9da6bd",
  hoofShine: "#f2f5fb",
  gold: "#f1b52d",
  goldLt: "#ffe59c",
  goldDk: "#d6951c",
  pink: "#ffadd0",
  mint: "#9ee9cb",
  lav: "#c1abf2",
  pinkL: "#ffd2e6",
  mintL: "#c7f5e2",
  lavL: "#ded2fb",
  daisyC: "#ffd23f",
  daisyC2: "#f4a21f",
  stem: "#7ecb9b",
  leaf: "#5db482",
  starLilac: "#cbb7f3",
  starGold: "#ffdf84",
  starPink: "#ffbfdc",
};

// ------------------------------------------------------------------ small utils
function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function lerpTable(tab: number[], t: number): number {
  const f = Math.min(Math.max(t, 0), 1) * (tab.length - 1);
  const i = Math.min(Math.floor(f), tab.length - 2);
  const k = f - i;
  return tab[i] * (1 - k) + tab[i + 1] * k;
}

const spaced = (pts: V3[], n: number): V3[] =>
  new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.5).getSpacedPoints(n - 1);

// ------------------------------------------------------------------ geometry helpers (all flat shaded, non-indexed)
function flat(g: THREE.BufferGeometry): THREE.BufferGeometry {
  const n = g.index ? g.toNonIndexed() : g;
  for (const k of Object.keys(n.attributes)) {
    if (k !== "position" && k !== "uv" && k !== "normal") n.deleteAttribute(k);
  }
  if (!n.getAttribute("uv")) {
    n.setAttribute("uv", new THREE.Float32BufferAttribute(new Float32Array(n.getAttribute("position").count * 2), 2));
  }
  n.clearGroups();
  n.computeVertexNormals();
  return n;
}

function geoFromPositions(pos: number[]): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  return flat(g);
}

function mergeFlat(gs: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const pos: number[] = [];
  for (const g of gs) {
    const n = g.index ? g.toNonIndexed() : g;
    const a = n.getAttribute("position");
    for (let i = 0; i < a.count; i++) pos.push(a.getX(i), a.getY(i), a.getZ(i));
  }
  return geoFromPositions(pos);
}

/** rotation matrix taking +Y to dir (hint picks the roll) */
function basisY(dir: V3, hint: V3 = V(0, 0, 1)): THREE.Matrix4 {
  const y = dir.clone().normalize();
  let h = hint.clone();
  if (Math.abs(h.dot(y)) > 0.94) h = V(1, 0, 0);
  if (Math.abs(h.dot(y)) > 0.94) h = V(0, 1, 0);
  const z = h.sub(y.clone().multiplyScalar(h.dot(y))).normalize();
  const x = new THREE.Vector3().crossVectors(y, z);
  return new THREE.Matrix4().makeBasis(x, y, z);
}

function ell(rx: number, ry: number, rz: number, m?: THREE.Matrix4, seg = 8, rings = 6): THREE.BufferGeometry {
  const g = new THREE.SphereGeometry(1, seg, rings);
  g.scale(rx, ry, rz);
  if (m) g.applyMatrix4(m);
  return flat(g);
}

function frust(rTop: number, rBot: number, h: number, seg = 8, m?: THREE.Matrix4, sx = 1, sz = 1): THREE.BufferGeometry {
  const g = new THREE.C