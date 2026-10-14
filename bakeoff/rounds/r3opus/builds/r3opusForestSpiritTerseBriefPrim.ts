import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Forest Spirit",
  description:
    "A small mossy forest spirit with a carved bone-white mask, glowing eyes, blossoming antler branches, a layered leaf cloak, twig hands and root feet. It stands in a rest pose for rigging.",
};

type V = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "forestSpirit" });
  const rr: any = rng(1337);
  const rand: () => number = typeof rr === "function" ? rr : () => rr.next();

  // ---------- palette ----------
  const C = {
    bark: "#6b4a2f",
    barkDark: "#47301f",
    barkLight: "#8a6440",
    moss: "#4f7a32",
    mossLight: "#7aa83f",
    leafA: "#5f9a3a",
    leafB: "#86b84a",
    leafC: "#3f7a3a",
    leafAutumn: "#d98c2e",
    mask: "#efe6cf",
    maskShade: "#d8cba8",
    eyeDark: "#1b1714",
    glow: "#d4ff7a",
    paintRed: "#b8452e",
    paintGreen: "#3f8a4a",
    blossom: "#f3a6bf",
    blossomCore: "#ffe27a",
    mushCap: "#d6463a",
    mushSpot: "#fff3df",
    mushStem: "#f1e4c8",
    berry: "#ffd84a",
  };

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.5, 0], aim: [0, 0.62, 0] });
  const spine = b.joint("spine", { at: [0, 0.62, 0], parent: hips, aim: [0, 0.76, 0] } as any);
  const chest = b.joint("chest", { at: [0, 0.76, 0], parent: spine, aim: [0, 0.88, 0] } as any);
  const neck = b.joint("neck", { at: [0, 0.88, 0], parent: chest, aim: [0, 0.96, 0] } as any);
  const head = b.joint("head", { at: [0, 0.96, 0], parent: neck, aim: [0, 1.2, 0] } as any);
  const jaw = b.joint("jaw", { at: [0, 1.03, 0.05], parent: head, aim: [0, 1.0, 0.18] } as any);

  const tail1 = b.joint("tail1", { at: [0, 0.52, -0.1], parent: hips, aim: [0, 0.47, -0.24] } as any);
  const tail2 = b.joint("tail2", { at: [0, 0.47, -0.24], parent: tail1, aim: [0, 0.44, -0.37] } as any);
  const tail3 = b.joint("tail3", { at: [0, 0.44, -0.37], parent: tail2, aim: [0, 0.43, -0.48] } as any);

  const side = (s: number, L: string) => {
    const shoulder = b.joint("shoulder" + L, { at: [0.13 * s, 0.84, 0], parent: chest, aim: [0.33 * s, 0.84, 0] } as any);
    const elbow = b.joint("elbow" + L, { at: [0.33 * s, 0.84, 0], parent: shoulder, aim: [0.5 * s, 0.84, 0] } as any);
    const wrist = b.joint("wrist" + L, { at: [0.5 * s, 0.84, 0], parent: elbow, aim: [0.56 * s, 0.84, 0] } as any);
    const fingerTips: V[] = [
      [0.61 * s, 0.845, 0.045],
      [0.625 * s, 0.85, 0.0],
      [0.61 * s, 0.845, -0.045],
      [0.55 * s, 0.86, 0.06],
    ];
    const fingers = fingerTips.map((tip, i) =>
      b.joint("finger" + L + (i + 1), { at: [0.53 * s, 0.84, tip[2] * 0.4], parent: wrist, aim: tip } as any)
    );
    const hip = b.joint("hip" + L, { at: [0.08 * s, 0.48, 0], parent: hips, aim: [0.1 * s, 0.27, 0.02] } as any);
    const knee = b.joint("knee" + L, { at: [0.1 * s, 0.27, 0.02], parent: hip, aim: [0.11 * s, 0.07, 0] } as any);
    const ankle = b.joint("ankle" + L, { at: [0.11 * s, 0.07, 0], parent: knee, aim: [0.11 * s, 0.03, 0.1] } as any);
    const toe = b.joint("toe" + L, { at: [0.11 * s, 0.035, 0.06], parent: ankle, aim: [0.11 * s, 0.02, 0.14] } as any);
    return { shoulder, elbow, wrist, fingers, fingerTips, hip, knee, ankle, toe };
  };
  const Ls = side(1, "L");
  const Rs = side(-1, "R");

  // ---------- helpers ----------
  const sub = (a: V, c: V): V => [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
  const md = (a: V, c: V): V => [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2];
  const len = (d: V) => Math.hypot(d[0], d[1], d[2]);

  const rod = (a: V, c: V, r1: number, r2: number, color: string, bone: any, segs = 6) => {
    const d = sub(a, c);
    const geo = new THREE.CylinderGeometry(r2, r1, len(d), segs);
    b.part(geo, color, { at: md(a, c), dir: d, bone } as any);
  };
  const blob = (at: V, r: number, s: V, color: string, bone: any, w = 8, h = 6) => {
    const geo = new THREE.SphereGeometry(r, w, h);
    geo.scale(s[0], s[1], s[2]);
    b.part(geo, color, { at, bone } as any);
  };
  const gem = (at: V, r: number, s: V, color: string, bone: any) => {
    const geo = new THREE.IcosahedronGeometry(r, 0);
    geo.scale(s[0], s[1], s[2]);
    b.part(geo, color, { at, bone } as any);
  };
  const leaf = (at: V, dir: V, l: number, w: number, color: string, bone: any) => {
    const geo = new THREE.OctahedronGeometry(1, 0);
    geo.scale(w, l / 2, w * 0.35);
    geo.translate(0, l / 2, 0);
    b.part(geo, color, { at, dir, bone } as any);
  };
  const leafColors = [C.leafA, C.leafB, C.leafC, C.leafA, C.leafB];
  const pickLeaf = () => (rand() < 0.08 ? C.leafAutumn : leafColors[Math.floor(rand() * leafColors.length)]);
  const blossom = (at: V, bone: any, r = 0.016) => {
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      blob([at[0] + Math.cos(a) * r, at[1] + Math.sin(a) * r, at[2]], r * 0.75, [1, 1, 0.5], C.blossom, bone, 6, 4);
    }
    blob([at[0], at[1], at[2] + 0.004], r * 0.6, [1, 1, 0.7], C.blossomCore, bone, 6, 4);
  };
  const mushroom = (base: V, h: number, r: number, bone: any) => {
    rod(base, [base[0], base[1] + h, base[2]], r * 0.35, r * 0.3, C.mushStem, bone);
    const cap = new THREE.SphereGeometry(r, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2);
    cap.scale(1, 0.7, 1);
    b.part(cap, C.mushCap, { at: [base[0], base[1] + h * 0.9, base[2]], bone } as any);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + 0.4;
      blob(
        [base[0] + Math.cos(a) * r * 0.55, base[1] + h * 0.9 + r * 0.5, base[2] + Math.sin(a) * r * 0.55],
        r * 0.16, [1, 0.5, 1], C.mushSpot, bone, 5, 3
      );
    }
    blob([base[0], base[1] + h * 0.9 + r * 0.7, base[2]], r * 0.18, [1, 0.5, 1], C.mushSpot, bone, 5, 3);
  };

  // ---------- body ----------
  blob([0, 0.68, 0], 1, [0.15, 0.22, 0.12], C.moss, spine);
  blob([0, 0.66, 0.06], 1, [0.1, 0.13, 0.07], C.mossLight, spine);
  rod([0, 0.85, 0], [0, 0.99, 0], 0.05, 0.045, C.barkDark, neck);

  // leaf cloak: three tiers of overlapping leaves
  const tier = (y: number, r: number, count: number, l: number, out: number, bone: any, phase: number) => {
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + phase;
      const cx = Math.cos(a), cz = Math.sin(a);
      const ll = l * (0.85 + rand() * 0.3);
      leaf([cx * r, y, cz * r * 0.85], [cx * out, -1, cz * out], ll, ll * 0.32, pickLeaf(), bone);
    }
  };
  tier(0.89, 0.09, 9, 0.15, 0.9, chest, 0);
  tier(0.77, 0.13, 11, 0.17, 0.6, chest, 0.3);
  tier(0.62, 0.15, 13, 0.19, 0.5, hips, 0.1);
  // acorn-cap collar
  const collar = new THREE.TorusGeometry(0.075, 0.022, 5, 10);
  collar.rotateX(Math.PI / 2);
  b.part(collar, C.barkLight, { at: [0, 0.9, 0], bone: chest } as any);
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    gem([Math.cos(a) * 0.088, 0.905, Math.sin(a) * 0.088], 0.012, [1, 0.8, 1], C.barkDark, chest);
  }
  // shoulder mushroom & moss
  blob([-0.11, 0.86, 0], 1, [0.06, 0.03, 0.06], C.mossLight, chest);
  mushroom([-0.12, 0.87, 0], 0.05, 0.035, chest);
  mushroom([-0.08, 0.875, 0.03], 0.03, 0.02, chest);

  // ---------- head ----------
  const hg = new THREE.IcosahedronGeometry(0.17, 1);
  hg.scale(1, 0.95, 0.9);
  b.part(hg, C.moss, { at: [0, 1.1, 0], bone: head } as any);
  // mask
  blob([0, 1.1, 0.13], 1, [0.15, 0.15, 0.06], C.mask, head, 10, 8);
  blob([0, 1.1, 0.12], 1, [0.158, 0.158, 0.05], C.maskShade, head, 10, 8);
  for (const s of [1, -1]) {
    blob([0.055 * s, 1.13, 0.18], 1, [0.034, 0.046, 0.02], C.eyeDark, head);
    blob([0.055 * s, 1.135, 0.196], 0.014, [1, 1, 0.7], C.glow, head, 6, 4);
    blob([0.05 * s, 1.145, 0.203], 0.005, [1, 1, 1], C.mushSpot, head, 4, 3);
    // cheek paint streaks
    const st = new THREE.BoxGeometry(0.011, 0.045, 0.012);
    b.part(st, C.paintRed, { at: [0.045 * s, 1.07, 0.185], dir: [0.15 * s, 1, 0], bone: head } as any);
    b.part(new THREE.BoxGeometry(0.011, 0.035, 0.012), C.paintRed, { at: [0.068 * s, 1.075, 0.18], dir: [0.3 * s, 1, 0], bone: head } as any);
    // leaf ears
    leaf([0.15 * s, 1.12, 0], [s, 0.45, -0.1], 0.15, 0.05, C.leafB, head);
    leaf([0.15 * s, 1.1, -0.02], [s, 0.05, -0.3], 0.11, 0.04, C.leafC, head);
  }
  // forehead mark
  const mark = new THREE.OctahedronGeometry(1, 0);
  mark.scale(0.016, 0.028, 0.008);
  b.part(mark, C.paintGreen, { at: [0, 1.195, 0.177], bone: head } as any);
  blob([0, 1.165, 0.185], 0.006, [1, 1, 0.6], C.paintGreen, head, 5, 3);
  // jaw (lower mask)
  blob([0, 1.005, 0.12], 1, [0.1, 0.045, 0.05], C.mask, jaw);
  blob([0, 1.04, 0.172], 1, [0.04, 0.011, 0.018], C.eyeDark, jaw);
  for (const s of [1, -1]) blob([0.02 * s, 1.0, 0.163], 0.007, [1, 1, 0.6], C.paintRed, jaw, 5, 3);

  // moss crown + mushrooms
  blob([0, 1.24, -0.02], 1, [0.12, 0.045, 0.11], C.mossLight, head);
  for (let i = 0; i < 6; i++) {
    const a = rand() * Math.PI * 2;
    blob([Math.cos(a) * 0.08, 1.25, -0.02 + Math.sin(a) * 0.07], 0.022, [1, 0.7, 1], i % 2 ? C.moss : C.leafB, head, 6, 4);
  }
  mushroom([0.04, 1.27, -0.07], 0.06, 0.035, head);
  mushroom([0.075, 1.26, -0.04], 0.035, 0.02, head);

  // antlers
  for (const s of [1, -1]) {
    const base: V = [0.08 * s, 1.22, -0.01];
    const midP: V = [0.14 * s, 1.33, -0.02];
    const tip: V = [0.21 * s, 1.43, -0.02];
    rod(base, midP, 0.022, 0.017, C.barkLight, head);
    rod(midP, tip, 0.017, 0.012, C.barkLight, head);
    blob(midP, 0.018, [1, 1, 1], C.barkLight, head, 6, 4);
    const tineA: V = [0.09 * s, 1.47, 0.02];
    const tipB: V = [0.31 * s, 1.5, -0.03];
    const tipC: V = [0.23 * s, 1.56, 0.0];
    rod(midP, tineA, 0.013, 0.007, C.barkLight, head);
    rod(tip, tipB, 0.012, 0.006, C.barkLight, head);
    rod(tip, tipC, 0.011, 0.006, C.barkLight, head);
    rod([0.175 * s, 1.38, -0.02], [0.27 * s, 1.37, 0.02], 0.009, 0.005, C.barkLight, head);
    for (const t of [tineA, tipB, tipC]) {
      for (let k = 0; k < 3; k++) {
        const a = (k / 3) * Math.PI * 2 + rand();
        leaf(t, [Math.cos(a) * 0.8 + 0.3 * s, 0.7, Math.sin(a) * 0.8], 0.07 + rand() * 0.03, 0.025, pickLeaf(), head);
      }
    }
    blossom([0.25 * s, 1.47, 0.02], head, 0.016);
    blossom([0.12 * s, 1.4, 0.03], head, 0.012);
    // glowing berries hanging from the side tine
    blob([0.27 * s, 1.35, 0.025], 0.011, [1, 1, 1], C.berry, head, 6, 4);
    blob([0.255 * s, 1.345, 0.035], 0.009, [1, 1, 1], C.berry, head, 6, 4);
  }

  // ---------- arms & hands ----------
  for (const [s, J] of [[1, Ls], [-1, Rs]] as [number, ReturnType<typeof side>][]) {
    const sh: V = [0.13 * s, 0.84, 0], el: V = [0.33 * s, 0.84, 0], wr: V = [0.5 * s, 0.84, 0];
    blob(sh, 0.035, [1, 1, 1], C.bark, J.shoulder, 6, 5);
    rod(sh, el, 0.026, 0.021, C.bark, J.shoulder);
    blob(el, 0.026, [1, 1, 1], C.barkLight, J.elbow, 6, 4);
    rod(el, wr, 0.021, 0.017, C.bark, J.elbow);
    // bark rings & leaf bracer
    for (const t of [0.35, 0.65]) {
      const ring = new THREE.TorusGeometry(0.022, 0.006, 4, 8);
      ring.rotateY(Math.PI / 2);
      b.part(ring, C.barkDark, { at: [(0.33 + 0.17 * t) * s, 0.84, 0], bone: J.elbow } as any);
    }
    leaf([0.38 * s, 0.86, 0], [0.6 * s, 0.6, -0.3], 0.09, 0.03, C.leafB, J.elbow);
    leaf([0.42 * s, 0.86, 0.01], [0.6 * s, 0.4, 0.4], 0.08, 0.028, C.leafA, J.elbow);
    leaf([0.2 * s, 0.86, 0], [0.4 * s, 1, 0], 0.08, 0.028, C.leafC, J.shoulder);
    // palm
    blob([0.52 * s, 0.84, 0], 1, [0.03, 0.022, 0.035], C.barkLight, J.wrist, 6, 5);
    J.fingers.forEach((f: any, i: number) => {
      const start: V = [0.53 * s, 0.84, J.fingerTips[i][2] * 0.4];
      rod(start, J.fingerTips[i], 0.008, 0.004, C.bark, f, 5);
    });
    blob([0.6 * s, 0.85, 0.0], 0.0, [1, 1, 1], C.bark, J.wrist, 3, 2);
  }

  // ---------- legs & root feet ----------
  for (const [s, J] of [[1, Ls], [-1, Rs]] as [number, ReturnType<typeof side>][]) {
    const hp: V = [0.08 * s, 0.48, 0], kn: V = [0.1 * s, 0.27, 0.02], an: V = [0.11 * s, 0.07, 0];
    rod(hp, kn, 0.032, 0.026, C.bark, J.hip);
    blob(kn, 0.03, [1, 1, 1], C.barkLight, J.knee, 6, 4);
    blob([0.1 * s, 0.29, 0.03], 1, [0.035, 0.02, 0.03], C.mossLight, J.knee, 6, 4);
    rod(kn, an, 0.026, 0.022, C.bark, J.knee);
    blob(an, 0.028, [1, 0.9, 1], C.barkDark, J.ankle, 6, 4);
    // root toes splaying to the ground
    const toes: V[] = [
      [0.06 * s, 0.014, 0.13],
      [0.11 * s, 0.014, 0.15],
      [0.16 * s, 0.014, 0.12],
    ];
    for (const t of toes) rod([0.11 * s, 0.045, 0.03], t, 0.018, 0.012, C.bark, J.toe);
    for (const t of toes) blob(t, 0.013, [1, 0.9, 1], C.barkDark, J.toe, 5, 3);
    rod(an, [0.12 * s, 0.014, -0.08], 0.02, 0.012, C.bark, J.ankle);
    rod(an, [0.19 * s, 0.014, -0.02], 0.016, 0.01, C.barkDark, J.ankle);
    blob([0.11 * s, 0.08, 0.01], 1, [0.04, 0.018, 0.04], C.moss, J.ankle, 6, 4);
    blob([0.115 * s, 0.1, 0.025], 0.008, [1, 1, 1], C.berry, J.ankle, 5, 3);
  }

  // ---------- leafy tail ----------
  const tailPts: V[] = [[0, 0.52, -0.1], [0, 0.47, -0.24], [0, 0.44, -0.37], [0, 0.43, -0.48]];
  const tailBones = [tail1, tail2, tail3];
  for (let i = 0; i < 3; i++) {
    rod(tailPts[i], tailPts[i + 1], 0.03 - i * 0.007, 0.024 - i * 0.007, C.moss, tailBones[i]);
    const m = md(tailPts[i], tailPts[i + 1]);
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2 + i;
      leaf(m, [Math.cos(a) * 0.7, Math.sin(a) * 0.7 + 0.2, -1], 0.11 - i * 0.015, 0.035, pickLeaf(), tailBones[i]);
    }
  }
  leaf(tailPts[3], [0, 0.2, -1], 0.12, 0.05, C.leafB, tail3);
  leaf(tailPts[3], [0.5, 0.3, -1], 0.09, 0.035, C.leafAutumn, tail3);
  leaf(tailPts[3], [-0.5, 0.3, -1], 0.09, 0.035, C.leafA, tail3);
  blossom([0, 0.47, -0.44], tail3, 0.013);

  return b.root;
}
