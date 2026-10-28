import * as THREE from "three";
import { createBuilder, rng, catmull, polyline, limb, svg, paint, mix, noise, smoothstep, mottle } from "../../../../src/index";
import { cel, furEdge, animeEye, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Red Panda on Mossy Stone",
  description:
    "A cel-shaded, anime-styled red panda standing on a mossy boulder: rust coat with dark belly and legs, cream cheek ruffs and ringed tail, big shiny eyes, rigged with jaw, ears, legs and a jointed tail.",
};

const ST = 0.2; // top of the stone
const HC = new THREE.Vector3(0, ST + 0.235, 0.34); // head centre

const RUST = cel("#e0652b");
const CREAM = cel("#fff1d6", "#f0cfa6");
const DARK = cel("#3b1d1a", "#24101a");
const TAILB = cel("#b84a1e");
const TAILA = cel("#e8793a");
const PINK = cel("#e98a95");

const coat = cel(furEdge("#e0652b", "#4a2620", { level: -0.15, teeth: 0.25, period: 0.03 }));

const headPaint = paint((p, n) => {
  const x = Math.abs(p.x - HC.x);
  const dy = p.y - HC.y;
  const dz = p.z - HC.z;
  // dark tear streak under each eye
  if (Math.abs(x - 0.048) < 0.005 && dy < -0.005 && dy > -0.05 && dz > 0.0 && n.z > 0.2) return DARK;
  // cream cheeks and muzzle
  if (dz > 0.06 && dy < 0.02) return CREAM;
  if (x > 0.05 && dy < 0.015 && dz > -0.03) return CREAM;
  if (n.y < -0.5) return CREAM;
  return RUST;
});

const tailPaint = paint((_p, _n, s) => {
  if (s[0] > 0.93) return DARK;
  return Math.floor(s[0] * 9) % 2 ? TAILB : TAILA;
});

const stonePaint = paint((p, n) => {
  const base = mix("#6f7482", "#4d5160", noise(p, 0.12, 3));
  const m = smoothstep(0.35, 0.75, n.y + (noise(p, 0.09, 7) - 0.5) * 0.7);
  const moss = mix("#4f8a2e", "#8cc33f", noise(p, 0.05, 9));
  return mix(base, moss, m);
});

const TUFT = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64">
  <polygon points="2,64 10,64 5,6" fill="#c8c8c8"/><polygon points="9,64 22,64 16,0" fill="#ffffff"/><polygon points="20,64 30,64 28,10" fill="#dcdcdc"/></svg>`,
  { size: 96 },
);
const MOSS = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
  <circle cx="14" cy="34" r="12" fill="#4f8a2e"/><circle cx="32" cy="30" r="14" fill="#6fae38"/><circle cx="24" cy="18" r="11" fill="#9bd046"/><circle cx="20" cy="14" r="3" fill="#d6f27a"/></svg>`,
  { size: 96 },
);
const EYE = animeEye({ iris: "#e8a020", blush: "#ff8a8a" });

export default function build() {
  const b = createBuilder({ name: "redPanda", paintSize: 1024 });

  // skeleton
  const hips = b.joint("hips", { at: [0, ST + 0.17, -0.17], dir: [0, 0.05, 1], role: "spine" });
  const spine = b.chain("spine", catmull([[0, ST + 0.17, -0.17], [0, ST + 0.19, 0.0], [0, ST + 0.2, 0.17]]), {
    parent: hips,
    names: ["spine1", "chest"],
    role: "spine",
  });
  const chest = spine.joints[1];
  const neck = b.chain("neck", polyline([[0, ST + 0.2, 0.17], [0, ST + 0.22, 0.26]]), {
    parent: chest,
    names: ["neck1"],
    role: "neck",
  });
  const head = b.joint("head", { parent: neck.joints[0], at: [0, ST + 0.22, 0.26], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, HC.y - 0.04, HC.z + 0.02], aim: [0, HC.y - 0.045, HC.z + 0.12], role: "jaw" });

  // body
  b.loft(
    [
      { at: [0, ST + 0.17, -0.28], w: 0.14, h: 0.14 },
      { at: [0, ST + 0.17, -0.17], w: 0.17, h: 0.16 },
      { at: [0, ST + 0.19, 0.0], w: 0.19, h: 0.17 },
      { at: [0, ST + 0.2, 0.17], w: 0.17, h: 0.16 },
      { at: [0, ST + 0.22, 0.26], w: 0.12, h: 0.12 },
    ],
    { bone: [hips, spine, neck], color: coat, sides: 10, name: "body" },
  );
  const bodySkin = b.surface(b.root);

  // tail
  const tailPath = catmull([
    [0, ST + 0.2, -0.28],
    [0, ST + 0.22, -0.45],
    [0, ST + 0.21, -0.62],
    [0, ST + 0.17, -0.78],
    [0, ST + 0.11, -0.9],
  ]);
  const tail = b.chain("tail", tailPath, { parent: hips, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" });
  b.sweep(tail, [0.05, 0.07, 0.068, 0.05, 0.025], { color: tailPaint, sides: 9, name: "tail" });

  // head
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), headPaint, {
    bone: head,
    at: HC.toArray(),
    scale: [0.098, 0.082, 0.088],
    name: "skull",
  });
  const skin = b.surface(skull);
  b.part(new THREE.SphereGeometry(1, 8, 6), CREAM, { bone: head, at: [0, HC.y - 0.022, HC.z + 0.085], scale: [0.04, 0.032, 0.045], name: "muzzle" });
  b.part(new THREE.SphereGeometry(0.014, 6, 5), INK, { bone: head, at: [0, HC.y - 0.006, HC.z + 0.127], scale: [1.2, 0.8, 0.8], name: "nose" });
  // lower jaw
  b.part(new THREE.SphereGeometry(1, 8, 6), CREAM, { bone: jaw, at: [0, HC.y - 0.05, HC.z + 0.075], scale: [0.032, 0.014, 0.05], name: "lowerJaw" });
  b.part(new THREE.SphereGeometry(1, 6, 4), PINK, { bone: jaw, at: [0, HC.y - 0.04, HC.z + 0.075], scale: [0.02, 0.006, 0.035], name: "tongue" });

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // eyes
    const hit = skin.around(HC.toArray()).at(s * 38, 4);
    if (hit) b.decal(skin, EYE, { at: hit, size: [0.05, 0.068], mirror: s > 0, segments: 8 });
    // brow spot
    const brow = skin.around(HC.toArray()).at(s * 30, 34);
    if (brow) b.stick(new THREE.SphereGeometry(0.012, 6, 4), CREAM, brow, { embed: 0.3, bone: head, name: "browSpot" });
    // ears
    const earJ = b.joint(`ear${side}`, { parent: head, at: [s * 0.062, HC.y + 0.06, HC.z - 0.02], dir: [s * 0.5, 1, 0.1], role: "hinge" });
    b.part(new THREE.SphereGeometry(1, 8, 6), RUST, {
      bone: earJ, at: [s * 0.068, HC.y + 0.075, HC.z - 0.03], scale: [0.045, 0.05, 0.022], rotation: [0, 0, -s * 22], name: "earBack",
    });
    b.part(new THREE.SphereGeometry(1, 8, 6), CREAM, {
      bone: earJ, at: [s * 0.068, HC.y + 0.075, HC.z - 0.016], scale: [0.04, 0.045, 0.016], rotation: [0, 0, -s * 22], name: "earInner",
    });
    // cheek ruffs
    for (let i = 0; i < 4; i++) {
      b.spike(
        [s * 0.075, HC.y - 0.015 - 0.012 * i, HC.z + 0.005 + 0.012 * i],
        [s * 1, -0.15 - 0.12 * i, -0.35 + 0.1 * i],
        0.05 - 0.004 * i,
        0.02,
        { bone: head, color: CREAM, sides: 5, name: "ruff" },
      );
    }
  }

  // legs
  const mkLeg = (s: number, front: boolean) => {
    const side = s > 0 ? "L" : "R";
    const x = s * 0.075;
    const z = front ? 0.2 : -0.2;
    const root: [number, number, number] = [x, ST + 0.16, z - (front ? 0 : 0.0)];
    const pts = limb(root, [x, ST + 0.03, z + 0.01], [0.09, 0.09], [[0, 0, front ? -1 : 1]]);
    const names = front ? [`shoulder${side}`, `elbow${side}`, `hand${side}`] : [`hip${side}`, `knee${side}`, `foot${side}`];
    const chain = b.chain(`leg${front ? "F" : "H"}${side}`, pts, {
      parent: front ? chest : hips,
      names,
      role: "leg",
      contact: [x, ST, z],
    });
    b.sweep(chain, [0.042, 0.034, 0.03], { color: DARK, sides: 8, name: `leg${side}` });
    const tip = chain.tip!;
    b.part(new THREE.SphereGeometry(1, 8, 6), DARK, { bone: tip, at: [x, ST + 0.022, z + 0.025], scale: [0.04, 0.024, 0.052], name: "paw" });
    for (const k of [-1, 0, 1]) {
      b.spike([x + k * 0.016, ST + 0.012, z + 0.07], [0, -0.2, 1], 0.016, 0.006, { bone: tip, color: CREAM, sides: 4, name: "claw" });
    }
  };
  for (const s of [1, -1]) {
    mkLeg(s, true);
    mkLeg(s, false);
  }

  // fur tufts
  const tufts = bodySkin.scatter(120, {
    rng: rng(4),
    minDist: 0.035,
    filter: (h) => h.n.y > -0.2 && h.at.y > ST + 0.1 && h.at.z < 0.25 && h.at.z > -0.3,
  });
  b.cards(tufts, TUFT, { size: [0.03, 0.055], lean: 62, bend: 18, vary: 0.3, rng: rng(5), color: "#f08a45", flow: [0, -0.3, -1] });
  // tail fluff
  const tailSkin = b.surface(b.root);
  b.cards(
    tailSkin.scatter(50, { rng: rng(6), minDist: 0.03, filter: (h) => h.at.z < -0.32 && h.at.y > ST + 0.05 }),
    TUFT,
    { size: [0.035, 0.07], lean: 60, bend: 20, vary: 0.3, rng: rng(7), color: "#e8793a", flow: [0, -0.2, -1] },
  );

  // mossy stone
  const stone = b.lathe(
    [
      [0, 0],
      [0.36, 0],
      [0.4, 0.06],
      [0.37, 0.14],
      [0.31, ST],
      [0, ST],
    ],
    { at: [0, 0, 0.0], segments: 8, bone: hips, color: stonePaint, name: "stone" },
  );
  const stoneSkin = b.surface(stone);
  b.cards(
    stoneSkin.scatter(40, { rng: rng(8), minDist: 0.06, filter: (h) => h.n.y > 0.3 && Math.hypot(h.at.x, h.at.z) > 0.22 }),
    MOSS,
    { size: [0.07, 0.06], lean: 25, vary: 0.3, rng: rng(9), flow: [0, -0.2, -1], cross: true },
  );
  // a glowing little dendro bud on the rim
  glow(b.part(new THREE.SphereGeometry(0.014, 6, 4), "#b6f06a", { bone: hips, at: [0.2, ST + 0.012, 0.14], name: "bud" }), 1.4);

  return b.root;
}
