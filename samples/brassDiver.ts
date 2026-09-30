// Brass Diver: a standard-dress deep-sea diver, flat low-poly. Copper bonnet with portholes, bolted corselet, canvas
// suit, lead-soled boots, chest and back weights, trailing air hose, belt knife and a lantern held in the left fist.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { rng } from "../src/math";
import { catmull, polyline } from "../src/path";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";
import type { PartOptions } from "../src/parts";
import type { Joint } from "../src/skeleton";

export const meta = {
  name: "Brass Diver",
  description:
    "Standard-dress deep-sea diver, about 1.9 m: verdigris-streaked copper bonnet with a hinged front port, bolted corselet, patched canvas suit, lead-soled boots, chest and back weights, belt knife, trailing air hose and lifeline, and a glowing lantern in the left fist.",
};

// --- palette -------------------------------------------------------------------------------------------------------
const COPPER = "#b9622c";
const BRASS = "#d2a235";
const BRASS_D = "#9c7424";
const LEAD = "#6f7b88";
const CANVAS = "#c9b98a";
const CANVAS_D = "#a89869";
const RUBBER = "#2e2925";
const LEATHER = "#5f3d27";
const LEATHER_L = "#8a5a36";
const SKIN = "#d6a07c";
const STEEL = "#b3bcc2";
const ROPE = "#bb9d63";
const ROPE_D = "#8f7443";
const HOSE = "#4d3b2f";
const HOSE_B = "#63493a";
const LIGHT = "#ffd27a";

const DEG = Math.PI / 180;
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const pt = (v: THREE.Vector3) => [v.x, v.y, v.z];
/** Piecewise-linear value over t in 0..1 through evenly spaced keys. */
const keyed = (k: number[]) => (t: number) => {
  const x = Math.min(Math.max(t, 0), 1) * (k.length - 1);
  const i = Math.min(Math.floor(x), k.length - 2);
  return k[i] + (k[i + 1] - k[i]) * (x - i);
};

// --- drawings ------------------------------------------------------------------------------------------------------
// Everything below is flat fills: no gradients, no emoji. Colours echo the palette.
const DRAW = {
  // Face seen through the front port: dim teal, a bearded diver, glare slashes on top.
  portFace: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" fill="#173f49"/>
    <polygon points="30,24 70,24 76,50 70,74 58,90 42,90 30,74 24,50" fill="#9a6b4f"/>
    <polygon points="24,50 30,74 42,90 58,90 70,74 76,50 70,58 62,62 38,62 30,58" fill="#7d7d76"/>
    <polygon points="30,22 70,22 72,34 28,34" fill="#6d6f6b"/>
    <polygon points="34,44 46,44 46,50 34,50" fill="#e6ebe0"/><polygon points="54,44 66,44 66,50 54,50" fill="#e6ebe0"/>
    <rect x="38" y="44" width="6" height="6" fill="#1b2a30"/><rect x="56" y="44" width="6" height="6" fill="#1b2a30"/>
    <polygon points="32,38 47,41 47,43 32,41" fill="#5b5c58"/><polygon points="68,38 53,41 53,43 68,41" fill="#5b5c58"/>
    <polygon points="40,62 60,62 56,68 44,68" fill="#5b5c58"/>
    <polygon points="8,30 26,8 38,8 14,38" fill="#7fc0c2"/><polygon points="18,50 40,18 46,18 24,56" fill="#5e9fa2"/>
    <polygon points="70,92 92,66 96,70 78,96" fill="#5e9fa2"/>
  </svg>`,
  sideGlass: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" fill="#17414b"/>
    <polygon points="6,34 34,4 50,4 14,48" fill="#7fc0c2"/><polygon points="26,62 66,14 74,14 32,70" fill="#5e9fa2"/>
  </svg>`,
  // Green streaks running down from the rivets.
  verdigris: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
    <polygon points="6,4 28,4 30,14 24,20 26,74 20,122 14,74 16,20 4,14" fill="#4f9b82"/>
    <polygon points="38,16 54,16 56,26 50,30 52,62 47,92 42,62 44,30 38,26" fill="#3f8069"/>
    <polygon points="62,0 86,0 88,12 79,16 82,84 75,124 68,84 71,16 60,12" fill="#4f9b82"/>
    <polygon points="94,20 110,20 112,30 105,34 107,70 101,100 96,70 99,34 93,30" fill="#3f8069"/>
    <polygon points="114,8 126,8 127,18 123,22 124,54 120,74 116,54 117,22 113,18" fill="#4f9b82"/>
  </svg>`,
  // Barnacle colony: pale cones with dark mouths and a few weed blades.
  barnacles: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
    <polygon points="20,70 32,50 46,50 54,70 46,82 28,82" fill="#d8d2bd"/><polygon points="32,60 40,60 42,68 34,68" fill="#3a3a36"/>
    <polygon points="54,84 62,72 74,72 80,84 74,94 60,94" fill="#c9c2aa"/><polygon points="62,80 70,80 71,86 63,86" fill="#3a3a36"/>
    <polygon points="70,54 78,44 90,44 96,54 90,62 76,62" fill="#d8d2bd"/><polygon points="78,50 86,50 87,56 79,56" fill="#3a3a36"/>
    <polygon points="38,86 46,78 56,78 60,88 54,98 42,98" fill="#b9b39b"/><polygon points="45,84 52,84 53,90 46,90" fill="#3a3a36"/>
    <polygon points="92,78 98,70 106,70 110,78 104,86 94,86" fill="#d8d2bd"/><polygon points="97,75 103,75 104,80 98,80" fill="#3a3a36"/>
    <polygon points="14,88 18,60 22,88" fill="#3c6a45"/><polygon points="24,94 30,62 34,94" fill="#2f5a3a"/>
    <polygon points="100,96 104,64 108,96" fill="#3c6a45"/>
  </svg>`,
  // Stamped lead weight: raised rim, weight mark, rivets, rust drips.
  leadFront: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 140">
    <polygon points="14,8 86,8 96,70 88,128 12,128 4,70" fill="none" stroke="#535d69" stroke-width="3" stroke-linejoin="round"/>
    <polygon points="22,18 78,18 86,70 80,118 20,118 14,70" fill="none" stroke="#8793a0" stroke-width="2"/>
    <text x="50" y="76" font-family="Georgia, serif" font-weight="bold" font-size="44" text-anchor="middle" fill="#46505a">40</text>
    <text x="50" y="98" font-family="Georgia, serif" font-weight="bold" font-size="17" text-anchor="middle" fill="#46505a">LBS</text>
    <polygon points="40,32 60,32 50,44" fill="#46505a"/>
    <rect x="18" y="14" width="6" height="6" fill="#8793a0"/><rect x="76" y="14" width="6" height="6" fill="#8793a0"/>
    <rect x="16" y="112" width="6" height="6" fill="#8793a0"/><rect x="78" y="112" width="6" height="6" fill="#8793a0"/>
    <polygon points="22,8 27,8 26,40 24,58 23,40" fill="#9a5a32"/><polygon points="70,8 76,8 74,30 72,44" fill="#9a5a32"/>
    <polygon points="56,128 62,128 60,104 58,90 57,104" fill="#9a5a32"/>
  </svg>`,
  leadBack: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 140">
    <polygon points="14,8 86,8 96,70 88,128 12,128 4,70" fill="none" stroke="#535d69" stroke-width="3" stroke-linejoin="round"/>
    <text x="50" y="70" font-family="Georgia, serif" font-weight="bold" font-size="34" text-anchor="middle" fill="#46505a">40</text>
    <text x="50" y="92" font-family="Georgia, serif" font-weight="bold" font-size="14" text-anchor="middle" fill="#46505a">LBS</text>
    <polygon points="30,104 70,104 50,118" fill="none" stroke="#46505a" stroke-width="2.5"/>
    <polygon points="34,12 40,12 38,50 36,80 35,50" fill="#9a5a32"/><polygon points="64,12 70,12 68,36 66,60" fill="#9a5a32"/>
    <polygon points="18,100 26,88 38,88 42,100 34,110 22,110" fill="#d8d2bd"/><polygon points="26,96 32,96 33,102 27,102" fill="#3a3a36"/>
    <polygon points="70,112 78,102 88,102 92,112 86,120 74,120" fill="#c9c2aa"/><polygon points="77,108 83,108 84,113 78,113" fill="#3a3a36"/>
  </svg>`,
  // Maker's plate on the back of the bonnet.
  plate: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 60">
    <polygon points="6,4 114,4 118,30 114,56 6,56 2,30" fill="#d2a235"/>
    <polygon points="10,8 110,8 113,30 110,52 10,52 7,30" fill="none" stroke="#9c7424" stroke-width="2"/>
    <text x="60" y="26" font-family="Georgia, serif" font-weight="bold" font-size="15" text-anchor="middle" fill="#6b4c16">HALLOWELL</text>
    <text x="60" y="44" font-family="Georgia, serif" font-weight="bold" font-size="13" text-anchor="middle" fill="#6b4c16">&amp; CO. No 7</text>
  </svg>`,
  // Knee and elbow creases, in darker canvas.
  creases: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 96">
    <polygon points="8,20 64,30 120,18 120,23 64,36 8,25" fill="#8d7d52"/>
    <polygon points="14,44 64,52 114,42 114,47 64,58 14,49" fill="#8d7d52"/>
    <polygon points="22,68 64,74 106,66 106,70 64,79 22,72" fill="#8d7d52"/>
    <polygon points="30,8 34,8 32,88 30,88" fill="#b3a274"/><polygon points="92,10 96,10 98,84 94,84" fill="#b3a274"/>
  </svg>`,
  // A stitched repair patch.
  patch: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
    <polygon points="8,10 88,6 92,84 12,90" fill="#8c7f52"/>
    <polygon points="14,16 82,12 86,78 18,84" fill="none" stroke="#e3d6a8" stroke-width="3" stroke-dasharray="7 5"/>
    <polygon points="14,16 40,80 44,78 18,14" fill="#7a6e46"/><polygon points="60,14 64,16 40,84 38,82" fill="#7a6e46"/>
  </svg>`,
  // Dark tide line and salt stain for the lower legs.
  tide: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
    <polygon points="0,128 0,70 18,62 34,74 52,60 70,72 88,58 108,70 128,62 128,128" fill="#8d8258"/>
    <polygon points="0,128 0,100 22,92 44,104 70,94 94,106 128,96 128,128" fill="#6e6444"/>
    <polygon points="14,74 22,74 20,82" fill="#e8e2c8"/><polygon points="80,68 90,68 86,78" fill="#e8e2c8"/>
  </svg>`,
  // Boot lacing.
  lace: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 96">
    <rect x="29" y="4" width="6" height="88" fill="#3d2718"/>
    <polygon points="8,12 56,24 56,30 8,18" fill="#d6c79a"/><polygon points="56,12 8,24 8,30 56,18" fill="#d6c79a"/>
    <polygon points="8,36 56,48 56,54 8,42" fill="#d6c79a"/><polygon points="56,36 8,48 8,54 56,42" fill="#d6c79a"/>
    <polygon points="8,60 56,72 56,78 8,66" fill="#d6c79a"/><polygon points="56,60 8,72 8,78 56,66" fill="#d6c79a"/>
    <rect x="4" y="10" width="8" height="8" fill="#d2a235"/><rect x="52" y="10" width="8" height="8" fill="#d2a235"/>
    <rect x="4" y="34" width="8" height="8" fill="#d2a235"/><rect x="52" y="34" width="8" height="8" fill="#d2a235"/>
    <rect x="4" y="58" width="8" height="8" fill="#d2a235"/><rect x="52" y="58" width="8" height="8" fill="#d2a235"/>
  </svg>`,
  // Knife grip wrap: diagonal cord turns.
  grip: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64">
    <rect width="32" height="64" fill="#5f3d27"/>
    <polygon points="0,6 32,0 32,6 0,12" fill="#b08a55"/><polygon points="0,20 32,14 32,20 0,26" fill="#b08a55"/>
    <polygon points="0,34 32,28 32,34 0,40" fill="#b08a55"/><polygon points="0,48 32,42 32,48 0,54" fill="#b08a55"/>
    <polygon points="0,62 32,56 32,64 0,64" fill="#b08a55"/>
  </svg>`,
  // Lantern glass: warm panes divided by dark lead lines, hot centre.
  lantern: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <rect width="64" height="64" fill="#ffbf47"/>
    <polygon points="8,20 56,20 56,44 8,44" fill="#ffd77d"/>
    <polygon points="20,26 44,26 44,38 20,38" fill="#fff0bf"/>
    <rect x="0" y="0" width="64" height="4" fill="#d98f33"/><rect x="0" y="60" width="64" height="4" fill="#d98f33"/>
  </svg>`,
  // Frayed rope end.
  fringe: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64">
    <polygon points="14,64 4,30 8,2 12,34" fill="#bb9d63"/><polygon points="16,64 16,22 20,0 20,34" fill="#d1b37a"/>
    <polygon points="18,64 26,28 30,8 24,40" fill="#bb9d63"/><polygon points="15,64 10,40 12,14 16,40" fill="#8f7443"/>
  </svg>`,
  // Bubble: ring with a glint.
  bubble: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <polygon points="32,4 48,10 58,24 58,42 48,56 32,60 16,56 6,42 6,24 16,10" fill="none" stroke="#dff4f2" stroke-width="5" stroke-linejoin="round"/>
    <polygon points="18,20 26,14 30,18 22,26" fill="#ffffff"/>
  </svg>`,
  // A puff of kicked-up silt.
  silt: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 48">
    <polygon points="0,48 4,30 18,22 30,26 38,10 56,6 68,18 82,20 92,32 96,48" fill="#a99a78"/>
    <polygon points="12,48 18,34 30,32 40,20 54,18 64,28 78,30 84,48" fill="#c2b490"/>
  </svg>`,
};

export default function build() {
  const b = createBuilder({ name: "brassDiver" });
  const rand = rng(11);

  const tex = (markup: string, size = 256) => svg(markup, { size });
  const T = {
    portFace: tex(DRAW.portFace, 256),
    sideGlass: tex(DRAW.sideGlass, 128),
    verdigris: tex(DRAW.verdigris, 256),
    barnacles: tex(DRAW.barnacles, 256),
    leadFront: tex(DRAW.leadFront, 256),
    leadBack: tex(DRAW.leadBack, 256),
    plate: tex(DRAW.plate, 256),
    creases: tex(DRAW.creases, 256),
    patch: tex(DRAW.patch, 256),
    tide: tex(DRAW.tide, 256),
    lace: tex(DRAW.lace, 256),
    grip: tex(DRAW.grip, 128),
    lantern: tex(DRAW.lantern, 128),
    fringe: tex(DRAW.fringe, 128),
    bubble: tex(DRAW.bubble, 128),
    silt: tex(DRAW.silt, 256),
    seam: tex(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 256">
        <rect x="5" y="0" width="3" height="256" fill="#b3a274"/><rect x="24" y="0" width="3" height="256" fill="#b3a274"/>
        <line x1="16" y1="0" x2="16" y2="256" stroke="#6f6440" stroke-width="5" stroke-dasharray="12 8"/>
      </svg>`,
      256,
    ),
  };

  // The bonnet is drawn about H0 and grown by HK about its new centre HC.
  const HK = 1.18;
  const H0 = V(0, 1.735, 0);
  const HC = V(0, 1.68, 0);
  const hp = (p: readonly number[]) => pt(HC.clone().add(V(p[0] - H0.x, p[1] - H0.y, p[2] - H0.z).multiplyScalar(HK)));
  const grow = <G extends THREE.BufferGeometry>(g: G) => g.scale(HK, HK, HK);

  // --- skeleton: hips, spine, neck and head ------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.98, 0], dir: [0, 1, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.98, 0],
      [0, 1.17, 0.01],
      [0, 1.38, 0.01],
      [0, 1.57, 0],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.joint("neck", { parent: chest, at: [0, 1.58, 0], dir: [0, 1, 0], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.66, 0], dir: [0, 1, 0], role: "head" });
  // The front port is hinged on its left edge; closed at rest.
  const portHinge = b.joint("portHinge", { parent: head, at: hp([0.105, 1.745, 0.185]), dir: [0, 1, 0], role: "hinge" });

  // --- the torso under everything ----------------------------------------------------------------------------------
  const torsoR = [keyed([0.18, 0.175, 0.185, 0.15]), keyed([0.125, 0.135, 0.15, 0.13])];
  const torso = b.sweep(spine, (t) => [torsoR[0](t), torsoR[1](t)], {
    color: CANVAS,
    sides: 8,
    smooth: false,
    caps: "round",
  });
  b.part(new THREE.SphereGeometry(0.15, 8, 6), CANVAS, {
    bone: hips,
    at: [0, 0.97, 0],
    scale: [1.22, 0.85, 0.92],
    flat: true,
  });

  // --- corselet, neck ring and bonnet ------------------------------------------------------------------------------
  const lathe = (pts: [number, number][], segments = 10) =>
    new THREE.LatheGeometry(
      pts.map(([r, h]) => new THREE.Vector2(r, h)),
      segments,
    );
  const corselet = b.part(
    lathe([
      [0.0, 0.0],
      [0.2, 0.0],
      [0.245, 0.085],
      [0.225, 0.17],
      [0.15, 0.235],
      [0.135, 0.265],
      [0.0, 0.265],
    ]),
    COPPER,
    { bone: chest, at: [0, 1.32, 0], scale: [1.12, 1, 0.8], flat: true, name: "corselet" },
  );
  // Flange round the corselet's lower edge.
  b.part(
    lathe([
      [0.19, -0.012],
      [0.218, -0.012],
      [0.228, 0.014],
      [0.212, 0.036],
      [0.19, 0.036],
    ]),
    BRASS,
    { bone: chest, at: [0, 1.32, 0], scale: [1.12, 1, 0.8], flat: true },
  );
  // A set of bolt heads or wing nuts seated radially around an ellipse.
  const nutGeos = (count: number, cy: number, a: number, c: number, r: number, len: number, phase = 0) => {
    const geos: THREE.BufferGeometry[] = [];
    for (let i = 0; i < count; i++) {
      const phi = phase + (i / count) * Math.PI * 2;
      const n = V(Math.sin(phi) / c, 0, Math.cos(phi) / a).normalize();
      const g = new THREE.CylinderGeometry(r, r, len, 5);
      g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), n));
      g.translate(a * Math.sin(phi), cy, c * Math.cos(phi));
      geos.push(g);
    }
    return geos;
  };
  const skirtBolts = mergeGeometries(nutGeos(12, 1.338, 0.222 * 1.12, 0.222 * 0.8, 0.014, 0.026, 0.2));
  if (skirtBolts) b.part(skirtBolts, BRASS_D, { bone: chest, at: [0, 0, 0], flat: true, name: "skirtBolts" });

  // Bonnet pieces are authored about the design centre H0 and grown by HK, so the head reads big.
  const hpart = (geo: THREE.BufferGeometry, color: string, o: PartOptions & { at: readonly number[] }) =>
    b.part(grow(geo), color, { ...o, at: hp(o.at), flat: true });
  const hmerge = (geos: THREE.BufferGeometry[]) => {
    const g = mergeGeometries(geos);
    return g ? g.translate(0, -H0.y, 0).scale(HK, HK, HK).translate(HC.x, HC.y, HC.z) : null;
  };

  // Neck ring where the bonnet locks on, with its bolt heads.
  hpart(
    lathe([
      [0.0, 0.0],
      [0.165, 0.0],
      [0.178, 0.014],
      [0.178, 0.032],
      [0.165, 0.045],
      [0.0, 0.045],
    ]),
    BRASS,
    { bone: head, at: [0, 1.605, 0], name: "neckRing" },
  );
  const neckBolts = hmerge(nutGeos(10, 1.628, 0.18, 0.18, 0.013, 0.024, 0.26));
  if (neckBolts) b.part(neckBolts, BRASS_D, { bone: head, at: [0, 0, 0], flat: true, name: "neckBolts" });

  // Bonnet: a faceted dome, open at the bottom and hidden by the neck ring.
  const dome = hpart(new THREE.SphereGeometry(0.175, 10, 7, 0, Math.PI * 2, 0, 2.3), COPPER, {
    bone: head,
    at: pt(H0),
    scale: [1, 0.94, 1],
    name: "bonnet",
  });
  // Seam band with a row of rivets.
  hpart(
    lathe([
      [0.15, -0.012],
      [0.172, -0.012],
      [0.172, 0.012],
      [0.15, 0.012],
    ]),
    BRASS,
    { bone: head, at: [0, 1.665, 0], name: "seamBand" },
  );
  const rivets = hmerge(
    Array.from({ length: 14 }, (_, i) => {
      const phi = (i / 14) * Math.PI * 2 + 0.17;
      return new THREE.OctahedronGeometry(0.0095).translate(0.171 * Math.sin(phi), 1.665, 0.171 * Math.cos(phi));
    }),
  );
  if (rivets) b.part(rivets, BRASS, { bone: head, at: [0, 0, 0], flat: true, name: "seamRivets" });
  // Finial on the crown.
  hpart(
    lathe(
      [
        [0.0, 0.0],
        [0.026, 0.0],
        [0.02, 0.02],
        [0.008, 0.032],
        [0.0, 0.034],
      ],
      8,
    ),
    BRASS,
    { bone: head, at: [0, 1.893, 0], name: "finial" },
  );

  // Front port: a fixed frame on the bonnet, and a hinged cover carrying the glass and guard bars.
  const PZ = 0.172;
  hpart(
    lathe([
      [0.088, -0.018],
      [0.122, -0.018],
      [0.128, 0.0],
      [0.122, 0.018],
      [0.088, 0.018],
    ]),
    BRASS_D,
    { bone: head, at: [0, 1.745, PZ], dir: [0, 0, 1], name: "portFrame" },
  );
  hpart(
    lathe([
      [0.062, -0.01],
      [0.098, -0.01],
      [0.104, 0.012],
      [0.096, 0.032],
      [0.062, 0.032],
    ]),
    BRASS,
    { bone: portHinge, at: [0, 1.745, PZ + 0.018], dir: [0, 0, 1], name: "portCover" },
  );
  b.part(grow(new THREE.CircleGeometry(0.066, 10)), "#ffffff", {
    bone: portHinge,
    at: hp([0, 1.745, PZ + 0.026]),
    dir: [0, 0, 1],
    axis: "z",
    texture: T.portFace,
    name: "portGlass",
  });
  for (const dy of [0.028, -0.028])
    hpart(new THREE.BoxGeometry(0.13, 0.007, 0.008), BRASS, { bone: portHinge, at: [0, 1.745 + dy, PZ + 0.046] });
  // Cover fastening: a lug and a wing nut on the right edge; hinge knuckles on the left.
  hpart(new THREE.BoxGeometry(0.03, 0.03, 0.018), BRASS, { bone: portHinge, at: [-0.105, 1.745, PZ + 0.03] });
  hpart(new THREE.CylinderGeometry(0.014, 0.014, 0.022, 6), BRASS_D, {
    bone: portHinge,
    at: [-0.105, 1.745, PZ + 0.046],
    dir: [0, 0, 1],
  });
  for (const dy of [0.04, 0, -0.04])
    hpart(new THREE.CylinderGeometry(0.0085, 0.0085, 0.028, 6), BRASS_D, {
      bone: head,
      at: [0.113, 1.745 + dy, PZ + 0.022],
    });

  // Side ports.
  for (const s of [1, -1]) {
    hpart(
      lathe(
        [
          [0.034, -0.012],
          [0.062, -0.012],
          [0.066, 0.008],
          [0.06, 0.024],
          [0.034, 0.024],
        ],
        8,
      ),
      BRASS,
      { bone: head, at: [s * 0.168, 1.745, 0.0], dir: [s, 0, 0], name: `sidePort${s > 0 ? "L" : "R"}` },
    );
    b.part(grow(new THREE.CircleGeometry(0.038, 8)), "#ffffff", {
      bone: head,
      at: hp([s * 0.189, 1.745, 0.0]),
      dir: [s, 0, 0],
      axis: "z",
      texture: T.sideGlass,
    });
  }

  // Weathering on the bonnet: verdigris under the seam and barnacle crusts low on the back.
  const domeSkin = b.surface(dome);
  for (const [az, size] of [
    [-150, 0.17],
    [150, 0.15],
    [-95, 0.15],
    [60, 0.13],
  ] as const)
    b.decal(domeSkin, T.verdigris, {
      at: hp(pt(H0.clone().add(V(Math.sin(az * DEG) * 0.17, 0, Math.cos(az * DEG) * 0.17)))),
      dir: pt(V(-Math.sin(az * DEG), 0, -Math.cos(az * DEG))),
      size: [size * HK, size * HK],
      lift: 0.002,
    });
  b.decal(domeSkin, T.barnacles, {
    at: hp([0.06, 1.66, -0.17]),
    dir: [-0.2, 0.0, 1],
    size: [0.12 * HK, 0.12 * HK],
    lift: 0.002,
  });
  b.decal(domeSkin, T.plate, {
    at: hp([0, 1.76, -0.172]),
    dir: [0, 0, 1],
    size: [0.1 * HK, 0.05 * HK],
    lift: 0.002,
  });

  // Air inlet valve at the back right of the bonnet, exhaust valve on the front left.
  const vdir = V(-0.62, 0.0, -0.78).normalize();
  const vBase = HC.clone().add(vdir.clone().multiplyScalar(0.15 * HK)).add(V(0, -0.035 * HK, 0));
  const along = (base: THREE.Vector3, dir: THREE.Vector3, d: number) =>
    pt(base.clone().add(dir.clone().multiplyScalar(d * HK)));
  const vTip = vBase.clone().add(vdir.clone().multiplyScalar(0.085 * HK));
  b.part(grow(new THREE.CylinderGeometry(0.03, 0.036, 0.04, 6)), BRASS_D, {
    bone: head,
    at: pt(vBase),
    dir: pt(vdir),
    flat: true,
    name: "inletBoss",
  });
  b.part(grow(new THREE.CylinderGeometry(0.026, 0.026, 0.06, 6)), BRASS, {
    bone: head,
    at: along(vBase, vdir, 0.045),
    dir: pt(vdir),
    flat: true,
    name: "inletValve",
  });
  b.part(grow(new THREE.CylinderGeometry(0.034, 0.034, 0.014, 6)), BRASS_D, {
    bone: head,
    at: along(vBase, vdir, 0.085),
    dir: pt(vdir),
    flat: true,
    name: "inletNut",
  });
  const exDir = V(0.8, 0.05, -0.6).normalize();
  const exBase = HC.clone().add(exDir.clone().multiplyScalar(0.165 * HK)).add(V(0, -0.03 * HK, 0));
  b.part(grow(new THREE.CylinderGeometry(0.02, 0.026, 0.05, 6)), BRASS_D, {
    bone: head,
    at: along(exBase, exDir, 0.012),
    dir: pt(exDir),
    flat: true,
    name: "exhaustValve",
  });
  b.part(grow(new THREE.CylinderGeometry(0.012, 0.012, 0.02, 6)), BRASS, {
    bone: head,
    at: along(exBase, exDir, 0.05),
    dir: pt(exDir),
    flat: true,
  });
  // A stream of bubbles rising from the exhaust valve, kept below the crown.
  const bubbleAt = exBase.clone().add(exDir.clone().multiplyScalar(0.07 * HK));
  b.cards(
    [
      frame(bubbleAt.clone().add(V(0.0, 0.0, 0.0)), [0, 1, 0]),
      frame(bubbleAt.clone().add(V(0.03, 0.06, -0.03)), [0, 1, 0]),
      frame(bubbleAt.clone().add(V(0.0, 0.12, -0.05)), [0, 1, 0]),
      frame(bubbleAt.clone().add(V(0.05, 0.17, -0.04)), [0, 1, 0]),
    ],
    T.bubble,
    { size: [0.04, 0.04], sink: 0, flow: [0, 0, 1], vary: 0.3, rng: rand, bone: head, cross: true },
  );

  // --- legs and boots ----------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const leg = b.chain(
      `leg${S}`,
      catmull([
        [s * 0.105, 0.95, 0],
        [s * 0.118, 0.53, 0.025],
        [s * 0.125, 0.19, 0],
      ]),
      { parent: hips, names: [`hip${S}`, `knee${S}`, `ankle${S}`], role: "leg", contact: [s * 0.125, 0, 0.05] },
    );
    const ankle = leg.tip ?? leg.joints[2];
    const toe = b.joint(`toe${S}`, {
      parent: ankle,
      at: [s * 0.125, 0.045, 0.075],
      aim: [s * 0.125, 0.04, 0.22],
      role: "digit",
    });

    const legR = keyed([0.098, 0.09, 0.068]);
    const leg3 = b.sweep(leg, (t) => legR(t), {
      color: (t) => (t > 0.9 ? CANVAS_D : CANVAS),
      sides: 6,
      smooth: false,
    });
    const legSkin = b.surface(leg3);
    // Crease lines over the knee, a patch on the left thigh, tide stains above the boot.
    b.decal(legSkin, T.creases, {
      at: [s * 0.118, 0.55, 0.11],
      dir: [0, 0, -1],
      size: [0.17, 0.13],
      lift: 0.002,
    });
    b.decal(legSkin, T.creases, {
      at: [s * 0.118, 0.56, -0.11],
      dir: [0, 0, 1],
      size: [0.17, 0.12],
      lift: 0.002,
      mirror: true,
    });
    b.decal(legSkin, T.tide, {
      at: [s * 0.124, 0.3, 0.1],
      dir: [0, 0, -1],
      size: [0.2, 0.24],
      lift: 0.002,
    });
    b.decal(legSkin, T.tide, {
      at: [s * 0.124, 0.3, -0.1],
      dir: [0, 0, 1],
      size: [0.2, 0.24],
      lift: 0.002,
      mirror: true,
    });
    if (s > 0)
      b.decal(legSkin, T.patch, { at: [0.12, 0.8, 0.1], dir: [0, 0, -1], size: [0.11, 0.11], lift: 0.002, roll: 8 });
    // Stitched outer seam, and a cord tying the trouser hem above the boot.
    b.decal(legSkin, T.seam, { at: [s * 0.2, 0.6, 0.0], dir: [-s, 0, 0], size: [0.045, 0.75], lift: 0.002 });
    const hem = legSkin.loop([s * 0.125, 0.235, 0], { lift: 0.008 });
    b.sweep(hem, 0.009, { color: ROPE, sides: 5, smooth: false });
    b.part(new THREE.SphereGeometry(0.017, 5, 4), ROPE_D, { bone: ankle, at: pt(hem.at(0)), flat: true });

    // Boot: side-view outlines drawn as (forward, up), pushed out sideways.
    const bx = s * 0.125;
    const side = [0, 0, 1] as const;
    const heel = b.extrude(
      [
        [-0.098, 0.04],
        [-0.098, 0.215],
        [0.05, 0.215],
        [0.078, 0.125],
        [0.078, 0.04],
      ],
      { at: [bx, 0, 0], x: side, thickness: 0.15, bevel: 0.012, color: LEATHER, bone: ankle, name: `bootHeel${S}` },
    );
    b.extrude(
      [
        [0.078, 0.04],
        [0.078, 0.125],
        [0.12, 0.112],
        [0.19, 0.09],
        [0.232, 0.06],
        [0.236, 0.04],
      ],
      { at: [bx, 0, 0], x: side, thickness: [0.15, 0.12], bevel: 0.01, color: LEATHER, bone: toe, name: `bootToe${S}` },
    );
    b.extrude(
      [
        [0.15, 0.04],
        [0.15, 0.118],
        [0.195, 0.1],
        [0.238, 0.07],
        [0.244, 0.04],
      ],
      { at: [bx, 0, 0], x: side, thickness: [0.158, 0.128], bevel: 0.008, color: BRASS, bone: toe, name: `toeCap${S}` },
    );
    // Lead soles, split at the ball of the foot so the toe can flex.
    b.extrude(
      [
        [-0.108, 0.0],
        [0.078, 0.0],
        [0.078, 0.042],
        [-0.108, 0.042],
      ],
      { at: [bx, 0, 0], x: side, thickness: 0.172, bevel: 0.006, color: LEAD, bone: ankle, name: `soleHeel${S}` },
    );
    b.extrude(
      [
        [0.078, 0.0],
        [0.25, 0.0],
        [0.258, 0.022],
        [0.252, 0.042],
        [0.078, 0.042],
      ],
      { at: [bx, 0, 0], x: side, thickness: 0.168, bevel: 0.006, color: LEAD, bone: toe, name: `soleToe${S}` },
    );
    // Lacing up the shaft front, barnacles on the outer heel.
    b.decal(heel, T.lace, {
      at: [bx, 0.17, 0.06],
      dir: [0, -0.3, -1],
      size: [0.085, 0.125],
      lift: 0.002,
    });
    b.decal(heel, T.barnacles, {
      at: [bx + s * 0.075, 0.1, -0.03],
      dir: [-s, 0, 0],
      size: [0.1, 0.1],
      lift: 0.002,
      mirror: s < 0,
    });
  }

  // --- belt, buckle and knife --------------------------------------------------------------------------------------
  const beltLoop = b.surface(torso).loop([0, 1.06, 0], { lift: 0.01 });
  b.sweep(beltLoop, () => [0.022, 0.011], { color: LEATHER_L, section: "box" });
  const buckleHit = b.surface(torso).ray([0, 1.06, 1], [0, 0, -1]);
  if (buckleHit) {
    b.stick(new THREE.BoxGeometry(0.06, 0.012, 0.045), BRASS, buckleHit, { embed: 0.3 });
    b.stick(new THREE.BoxGeometry(0.03, 0.014, 0.022), LEATHER, buckleHit, { embed: 0.05 });
  }
  // Belt knife on the right hip (model right is -X).
  const kx = -0.197;
  b.extrude(
    [
      [-0.026, 0.06],
      [0.026, 0.06],
      [0.028, -0.14],
      [0.0, -0.21],
      [-0.028, -0.14],
    ],
    { at: [kx, 1.0, 0.04], x: [0, 0, 1], thickness: 0.03, bevel: 0.006, color: LEATHER, bone: hips, name: "sheath" },
  );
  b.extrude(
    [
      [-0.01, -0.12],
      [0.01, -0.12],
      [0.005, -0.225],
      [-0.005, -0.225],
    ],
    { at: [kx, 1.0, 0.04], x: [0, 0, 1], thickness: 0.036, color: BRASS, bone: hips, name: "chape" },
  );
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.12, 6), "#ffffff", {
    bone: hips,
    at: [kx, 1.12, 0.04],
    texture: T.grip,
    flat: true,
    name: "knifeGrip",
  });
  b.part(new THREE.BoxGeometry(0.036, 0.014, 0.09), BRASS, { bone: hips, at: [kx, 1.064, 0.04], flat: true });
  b.part(new THREE.SphereGeometry(0.024, 6, 4), BRASS, { bone: hips, at: [kx, 1.188, 0.04], flat: true });
  b.part(new THREE.BoxGeometry(0.008, 0.03, 0.05), STEEL, { bone: hips, at: [kx, 1.05, 0.04], flat: true });

  // --- chest and back weights --------------------------------------------------------------------------------------
  const WS = 1.15;
  const weightOutline: [number, number][] = (
    [
      [-0.095, 0.145],
      [0.095, 0.145],
      [0.125, 0.0],
      [0.108, -0.14],
      [-0.108, -0.14],
      [-0.125, 0.0],
    ] as [number, number][]
  ).map(([x, y]) => [x * WS, y * WS]);
  const wTop = 1.36;
  const wMid = wTop - 0.145 * WS;
  const front = b.extrude(weightOutline, {
    at: [0, wMid, 0.205],
    x: [1, 0, 0],
    thickness: 0.05,
    bevel: 0.012,
    color: LEAD,
    bone: chest,
    name: "chestWeight",
  });
  const back = b.extrude(weightOutline, {
    at: [0, wMid, -0.205],
    x: [-1, 0, 0],
    thickness: 0.05,
    bevel: 0.012,
    color: LEAD,
    bone: chest,
    name: "backWeight",
  });
  b.decal(front, T.leadFront, {
    at: [0, wMid, 0.235],
    dir: [0, 0, -1],
    size: [0.23 * WS, 0.29 * WS],
    lift: 0.002,
  });
  b.decal(back, T.leadBack, {
    at: [0, wMid, -0.235],
    dir: [0, 0, 1],
    size: [0.23 * WS, 0.29 * WS],
    lift: 0.002,
    mirror: true,
  });
  b.decal(back, T.barnacles, {
    at: [0.06, wTop - 0.25, -0.232],
    dir: [0, 0, 1],
    size: [0.11, 0.11],
    lift: 0.004,
  });
  // Shoulder ropes: each runs from a weight's top eyelet over the corselet to its twin behind.
  const corSkin = b.surface(corselet);
  for (const s of [1, -1]) {
    for (const z of [0.21, -0.21])
      b.part(new THREE.SphereGeometry(0.017, 6, 4), BRASS, {
        bone: chest,
        at: [s * 0.085 * WS, wTop + 0.005, z],
        scale: [1, 1, 0.5],
        flat: true,
      });
    const rough = polyline([
      [s * 0.085 * WS, wTop + 0.005, 0.21],
      [s * 0.12, 1.47, 0.15],
      [s * 0.17, 1.545, 0.0],
      [s * 0.12, 1.47, -0.15],
      [s * 0.085 * WS, wTop + 0.005, -0.21],
    ]);
    b.sweep(corSkin.drape(rough, { lift: 0.012 }), 0.013, { color: ROPE, sides: 5, smooth: false });
  }

  // --- arms and hands ----------------------------------------------------------------------------------------------
  const hands: Record<string, Joint> = {};
  let barCentre = V(0, 0, 0);
  let barFw = V(0, 0, 1);
  let gripDown = V(0, -1, 0);
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const shoulder = V(s * 0.27, 1.47, 0);
    const elbow = V(s * 0.51, 1.295, 0);
    const wrist = V(s * 0.73, 1.145, 0.03);
    const arm = b.chain(`arm${S}`, catmull([pt(shoulder), pt(elbow), pt(wrist)]), {
      parent: chest,
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "arm",
    });
    const wristJ = arm.tip ?? arm.joints[2];
    hands[S] = wristJ;
    const armR = keyed([0.082, 0.075, 0.07, 0.052]);
    const sleeve = b.sweep(arm, (t) => armR(t), {
      color: (t) => (t > 0.88 ? RUBBER : CANVAS),
      sides: 6,
      smooth: false,
    });
    const armSkin = b.surface(sleeve);
    b.decal(armSkin, T.creases, {
      at: [s * 0.51, 1.335, 0.07],
      dir: [0, -0.2, -1],
      size: [0.13, 0.1],
      lift: 0.002,
    });
    if (s < 0)
      b.decal(armSkin, T.patch, { at: [-0.44, 1.36, 0.08], dir: [0, -0.1, -1], size: [0.1, 0.1], lift: 0.002, roll: -10 });
    b.decal(armSkin, T.seam, {
      at: [s * 0.5, 1.33, 0],
      dir: [0, -1, 0],
      up: [s * 0.8, -0.6, 0],
      size: [0.045, 0.5],
      lift: 0.002,
    });
    b.decal(b.surface(torso), T.creases, { at: [s * 0.2, 1.14, 0.0], dir: [-s, 0, 0], size: [0.18, 0.14], lift: 0.002 });
    const d = wrist.clone().sub(elbow).normalize();
    // Brass cuff ring at the wrist.
    b.part(
      lathe([
        [0.05, -0.022],
        [0.066, -0.022],
        [0.07, 0.0],
        [0.066, 0.022],
        [0.05, 0.022],
      ], 8),
      BRASS,
      { bone: wristJ, at: pt(wrist.clone().add(d.clone().multiplyScalar(-0.02))), dir: pt(d), flat: true, name: `cuff${S}` },
    );

    // Hand frame: d along the fingers, fw toward the thumb (forward), palmN out of the palm (down).
    const fw = V(0, 0, 1).sub(d.clone().multiplyScalar(d.z)).normalize();
    const down = V(0, -1, 0);
    const palmN = down.sub(d.clone().multiplyScalar(d.dot(down))).sub(fw.clone().multiplyScalar(fw.dot(down))).normalize();
    const knuckle = wrist.clone().add(d.clone().multiplyScalar(0.085));
    b.frustumBox(
      wrist.clone().add(d.clone().multiplyScalar(0.012)),
      knuckle,
      [0.06, 0.032],
      [0.085, 0.026],
      { bone: wristJ, color: SKIN, up: [0, 1, 0], name: `palm${S}` },
    );

    const gripper = s > 0; // the left hand holds the lantern bail
    const fingers: [string, number, number, number][] = [
      ["index", 0.032, 0.074, 0.12],
      ["middle", 0.011, 0.082, 0.03],
      ["ring", -0.011, 0.076, -0.05],
      ["pinky", -0.031, 0.06, -0.12],
    ];
    const bend = (dir: THREE.Vector3, a: number) =>
      dir.clone().multiplyScalar(Math.cos(a)).add(palmN.clone().multiplyScalar(Math.sin(a))).normalize();
    for (const [name, off, len, spread] of fingers) {
      const k0 = knuckle.clone().add(fw.clone().multiplyScalar(off));
      const dir0 = d.clone().add(fw.clone().multiplyScalar(spread)).normalize();
      const a1 = gripper ? 0.1 : 0.12;
      const a2 = gripper ? 1.45 : 0.45;
      const d1 = bend(dir0, a1);
      const k1 = k0.clone().add(d1.clone().multiplyScalar(len * 0.55));
      const d2 = bend(dir0, a2);
      const k2 = k1.clone().add(d2.clone().multiplyScalar(len * 0.45));
      const f = b.chain(`${name}${S}`, catmull([pt(k0), pt(k1), pt(k2)]), {
        parent: wristJ,
        names: [`${name}${S}1`, `${name}${S}2`, `${name}${S}3`],
        role: "digit",
      });
      b.sweep(f, [0.0125, 0.0095], { color: SKIN, sides: 4, smooth: false, caps: "flat" });
      if (gripper && name === "middle") {
        barCentre = k1.clone().add(palmN.clone().multiplyScalar(0.016)).sub(dir0.clone().multiplyScalar(0.012));
        barFw = fw.clone();
        gripDown = palmN.clone();
      }
    }
    const t0 = wrist.clone().add(d.clone().multiplyScalar(0.03)).add(fw.clone().multiplyScalar(0.036));
    const tdir = d.clone().multiplyScalar(0.75).add(fw.clone().multiplyScalar(0.65)).normalize();
    const t1 = t0.clone().add(bend(tdir, gripper ? 0.5 : 0.12).multiplyScalar(0.04));
    const t2 = t1.clone().add(bend(tdir, gripper ? 1.0 : 0.3).multiplyScalar(0.032));
    const thumb = b.chain(`thumb${S}`, catmull([pt(t0), pt(t1), pt(t2)]), {
      parent: wristJ,
      names: [`thumb${S}1`, `thumb${S}2`, `thumb${S}3`],
      role: "digit",
    });
    b.sweep(thumb, [0.0145, 0.011], { color: SKIN, sides: 4, smooth: false, caps: "flat" });
  }

  // --- lantern in the left fist ------------------------------------------------------------------------------------
  {
    const bar = barCentre.clone();
    const fwd = barFw.clone();
    const hand = hands.L;
    const capY = bar.y - 0.1;
    const cap = V(bar.x, capY, bar.z);
    // Bail: an upside-down U whose top bar sits in the fist.
    const half = 0.055;
    const bail = polyline([
      pt(cap.clone().add(fwd.clone().multiplyScalar(0.05))),
      pt(bar.clone().add(fwd.clone().multiplyScalar(half))),
      pt(bar.clone().sub(fwd.clone().multiplyScalar(half))),
      pt(cap.clone().sub(fwd.clone().multiplyScalar(0.05))),
    ]);
    b.sweep(bail, 0.0085, { color: BRASS_D, bone: hand, sides: 5, smooth: false });
    void gripDown;
    // Roof, rim, glass, posts and foot, all centred under the bail.
    b.part(
      lathe([
        [0.0, 0.0],
        [0.07, 0.0],
        [0.07, 0.012],
        [0.042, 0.03],
        [0.02, 0.048],
        [0.0, 0.052],
      ], 8),
      BRASS,
      { bone: hand, at: pt(cap.clone().add(V(0, -0.012, 0))), flat: true, name: "lanternRoof" },
    );
    b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.03, 6), BRASS_D, {
      bone: hand,
      at: pt(cap.clone().add(V(0, 0.048, 0))),
      flat: true,
    });
    const glassH = 0.15;
    const glassC = cap.clone().add(V(0, -0.012 - glassH / 2, 0));
    glow(
      b.part(new THREE.CylinderGeometry(0.058, 0.058, glassH, 8, 1, true), "#ffffff", {
        bone: hand,
        at: pt(glassC),
        texture: T.lantern,
        flat: true,
        name: "lanternGlass",
      }),
      1.4,
    );
    glow(
      b.part(new THREE.SphereGeometry(0.03, 6, 4), LIGHT, { bone: hand, at: pt(glassC), flat: true, name: "lanternFlame" }),
      2,
    );
    b.part(new THREE.CylinderGeometry(0.008, 0.008, glassH * 0.45, 5), BRASS_D, {
      bone: hand,
      at: pt(glassC.clone().add(V(0, -glassH * 0.3, 0))),
      flat: true,
      name: "lanternWick",
    });
    for (let i = 0; i < 4; i++) {
      const phi = (i / 4) * Math.PI * 2 + Math.PI / 4;
      b.part(new THREE.CylinderGeometry(0.0075, 0.0075, glassH + 0.01, 5), BRASS, {
        bone: hand,
        at: pt(glassC.clone().add(V(Math.sin(phi) * 0.064, 0, Math.cos(phi) * 0.064))),
        flat: true,
      });
    }
    b.part(
      lathe([
        [0.0, 0.0],
        [0.062, 0.0],
        [0.07, 0.014],
        [0.058, 0.03],
        [0.0, 0.03],
      ], 8),
      BRASS,
      { bone: hand, at: pt(cap.clone().add(V(0, -0.012 - glassH - 0.004, 0))), flat: true, name: "lanternFoot" },
    );
  }

  // --- air hose from the inlet valve, trailing behind --------------------------------------------------------------
  {
    const hosePath = catmull([
      pt(vTip),
      [-0.2, 1.54, -0.27],
      [-0.235, 1.44, -0.315],
      [-0.22, 1.2, -0.35],
      [-0.18, 0.85, -0.4],
      [-0.12, 0.45, -0.5],
      [-0.06, 0.12, -0.72],
      [0.04, 0.036, -0.98],
      [0.2, 0.036, -1.22],
      [0.12, 0.036, -1.45],
      [-0.1, 0.036, -1.62],
    ]);
    const hose = b.chain("hose", hosePath, { parent: head, count: 9, names: (i) => `hose${i + 1}`, role: "tentacle" });
    b.sweep(hose, 0.034, {
      color: (t) => (Math.floor(t * 46) % 2 ? HOSE : HOSE_B),
      sides: 6,
      smooth: false,
    });
    // Brass couplings.
    for (const t of [0.0, 0.3, 0.62, 0.97]) {
      const p = hosePath.at(Math.max(t, 0.012));
      const tan = hosePath.tangentAt(Math.max(t, 0.012));
      b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.04, 6), BRASS, {
        bone: hose.joints[Math.min(hose.joints.length - 1, Math.round(t * (hose.joints.length - 1)))],
        at: pt(p),
        dir: pt(tan),
        flat: true,
      });
    }
  }

  // --- lifeline rope tied on the belt, trailing to the left --------------------------------------------------------
  {
    const ropePath = catmull([
      [0.1, 1.04, -0.15],
      [0.21, 0.92, -0.24],
      [0.29, 0.62, -0.34],
      [0.33, 0.25, -0.46],
      [0.36, 0.022, -0.65],
      [0.48, 0.022, -0.92],
      [0.66, 0.022, -1.1],
      [0.84, 0.022, -1.06],
    ]);
    const line = b.chain("lifeline", ropePath, { parent: hips, count: 6, names: (i) => `line${i + 1}`, role: "tentacle" });
    b.sweep(line, 0.012, {
      color: (t) => (Math.floor(t * 70) % 2 ? ROPE : ROPE_D),
      sides: 5,
      smooth: false,
    });
    b.part(new THREE.TorusGeometry(0.03, 0.008, 4, 7), BRASS, {
      bone: hips,
      at: [0.1, 1.04, -0.15],
      rotation: [90, 0, 0],
      flat: true,
      name: "beltRing",
    });
    const end = ropePath.at(1);
    const endTan = ropePath.tangentAt(1);
    b.cards(
      b.ring(frame(pt(V(end.x, end.y, end.z)), pt(endTan)), { count: 4, radius: 0.004, tilt: 35 }).items,
      T.fringe,
      { size: [0.035, 0.07], lean: 70, flow: [0, 1, 0], vary: 0.25, rng: rand, cross: true, bone: line.joints[5] },
    );
  }

  // --- kicked-up silt round the boots ------------------------------------------------------------------------------
  b.cards(
    [
      frame([0.12, 0.004, -0.14], [0, 1, 0]),
      frame([-0.12, 0.004, -0.16], [0, 1, 0]),
      frame([0.26, 0.004, 0.05], [0, 1, 0]),
      frame([-0.27, 0.004, 0.04], [0, 1, 0]),
      frame([0.0, 0.004, 0.2], [0, 1, 0]),
    ],
    T.silt,
    {
      size: [0.3, 0.2],
      sink: 0,
      lean: 90,
      flow: (_f, i) => [Math.cos(i * 1.7), 0, Math.sin(i * 1.7)],
      mirror: true,
      vary: 0.25,
      rng: rand,
      bone: hips,
    },
  );

  return b.root;
}
