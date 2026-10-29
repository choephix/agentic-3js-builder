import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Dwarf Blacksmith at the Anvil",
  "description": "A squat, barrel-chested Warcraft-style dwarf blacksmith with a braided orange beard, raised hammer and leather apron, working a glowing iron bar on an anvil set on a wooden stump."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  skin: "#c98d5f",
  skinShade: "#a0663e",
  beard: "#c05a1e",
  beardDark: "#8a3d10",
  leather: "#6b4423",
  leatherDark: "#452c15",
  clothRed: "#7a2f28",
  clothBlue: "#3e5a74",
  gold: "#e7b814",
  bronze: "#a97c3c",
  iron: "#565b64",
  ironDark: "#33373d",
  steel: "#9aa2ad",
  wood: "#7a5226",
  woodDark: "#54381c",
  coal: "#26262b",
  ember: "#ff7a2a",
  emberCore: "#ffd23e",
  eyeWhite: "#e8e4da",
  ink: "#1a1416",
};
const M = {
  hips: [-0.25, 0.52, 0] as [number, number, number],
  shoulderLine: [-0.25, 0.92, 0] as [number, number, number],
  neck: [-0.25, 1.04, 0.02] as [number, number, number],
  anvilWorkPoint: [0.4, 0.74, 0.28] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // legsBoots
  (() => {
function buildLegsBoots({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const R = rng(11);
  const put = (geo: THREE.BufferGeometry, color: string, at: [number, number, number], o: any = {}) =>
    b.part(geo, color, { bone, at, ...o });
  const box = (w: number, h: number, d: number, color: string, at: [number, number, number], o: any = {}) =>
    put(new THREE.BoxGeometry(w, h, d), color, at, o);
  const cyl = (rt: number, rb: number, h: number, seg: number, color: string, at: [number, number, number], o: any = {}) =>
    put(new THREE.CylinderGeometry(rt, rb, h, seg), color, at, { flat: true, ...o });
  const sph = (r: number, color: string, at: [number, number, number], scale: [number, number, number] = [1, 1, 1]) =>
    put(new THREE.SphereGeometry(r, 8, 6), color, at, { scale, flat: true });

  const LEATHER = P.leatherDark;
  const hipY = M.hips[1];

  for (const s of [-0.42, -0.08]) {
    const x = s;
    const side = s > -0.25 ? 1 : -1; // +1 = model left (+X)

    // Boot sole and body
    box(0.25, 0.03, 0.4, P.ink, [x, 0.015, 0.04]);
    box(0.22, 0.12, 0.36, LEATHER, [x, 0.09, 0.04]);
    // Boot toe: rounded front
    sph(0.11, LEATHER, [x, 0.1, 0.16], [1, 0.9, 1.1]);
    // Steel toe cap
    sph(0.105, P.steel, [x, 0.085, 0.2], [1, 0.75, 0.8]);
    box(0.21, 0.015, 0.05, P.ironDark, [x, 0.06, 0.225]);
    // Heel
    box(0.2, 0.05, 0.08, P.woodDark, [x, 0.025, -0.13]);

    // Boot shaft
    cyl(0.105, 0.115, 0.18, 8, LEATHER, [x, 0.19, 0.0]);
    // Laces / seam strip on front
    box(0.03, 0.17, 0.012, P.leather, [x, 0.2, 0.108]);
    for (let i = 0; i < 4; i++) {
      box(0.07, 0.01, 0.012, P.bronze, [x, 0.14 + i * 0.04, 0.114]);
    }
    // Folded-over cuff
    cyl(0.125, 0.125, 0.07, 8, P.leather, [x, 0.3, 0.0]);
    cyl(0.128, 0.128, 0.012, 8, P.leatherDark, [x, 0.265, 0.0]);
    cyl(0.128, 0.128, 0.012, 8, P.leatherDark, [x, 0.335, 0.0]);
    // cuff rivets
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.3;
      sph(0.01, P.gold, [x + Math.sin(a) * 0.127, 0.3, Math.cos(a) * 0.127]);
    }
    // Mud / scuffs at the foot
    box(0.2, 0.02, 0.1, P.woodDark, [x + 0.005, 0.03, 0.12]);
    for (let i = 0; i < 3; i++)
      sph(0.012 + R() * 0.01, P.coal, [x + (R() - 0.5) * 0.16, 0.05 + R() * 0.05, 0.19 + R() * 0.05]);

    // Trousers: calf to thigh
    cyl(0.1, 0.108, 0.14, 8, P.clothBlue, [x, 0.4, 0.0]);
    cyl(0.12, 0.1, 0.12, 8, P.clothBlue, [x, 0.5, 0.0]);
    // thigh fold bands
    cyl(0.108, 0.108, 0.012, 8, "#2f4659", [x, 0.44, 0.0]);

    // Shin strap with gold buckle
    cyl(0.108, 0.108, 0.035, 8, P.leather, [x, 0.4, 0.0]);
    box(0.045, 0.045, 0.02, P.gold, [x, 0.4, 0.108]);
    box(0.026, 0.026, 0.024, P.leatherDark, [x, 0.4, 0.11]);
    box(0.012, 0.05, 0.01, P.bronze, [x, 0.4, 0.118]);

    // Knee pad: iron dark rounded
    sph(0.085, P.ironDark, [x, 0.46, 0.085], [1, 0.9, 0.55]);
    sph(0.05, P.iron, [x, 0.465, 0.12], [1, 0.9, 0.4]);
    for (const dx of [-0.05, 0.05]) sph(0.01, P.steel, [x + dx, 0.5, 0.115]);
    for (const dx of [-0.05, 0.05]) sph(0.01, P.steel, [x + dx, 0.425, 0.115]);

    // Side seam stripe on trousers
    box(0.012, 0.12, 0.012, "#2f4659", [x + side * 0.115, 0.5, 0.0]);

    // Hip stub joining torso
    cyl(0.125, 0.125, 0.04, 8, P.clothBlue, [x, hipY - 0.03, 0.0]);
  }

  // Crotch / pelvis filler between legs
  box(0.2, 0.1, 0.22, P.clothBlue, [-0.25, 0.47, 0]);
  // Small belt-loop of cloth behind
  box(0.34, 0.03, 0.2, "#2f4659", [-0.25, 0.505, -0.02]);
}
    return buildLegsBoots;
  })(),
  // torso
  (() => {
function buildTorso({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const CX = -0.25;
  const R = rng(11);
  const RED = P.clothRed, LEA = P.leather, LD = P.leatherDark, GOLD = P.gold, BRZ = P.bronze;
  const BEARD = P.beard, BD = P.beardDark, BLUE = P.clothBlue;

  // Elliptical-section lathe-ish barrel: stacked frustum layers via lathe with scale on z
  const barrel = (pts: [number, number][], color: string, sz: number, y0: number, name: string) => {
    const part = b.lathe(pts as any, { at: [CX, y0, 0], segments: 14, color, bone, name });
    part.mesh.scale.z = sz;
    return part;
  };

  // Core tunic: belly widest low, shoulders slightly narrower
  barrel(
    [
      [0, 0], [0.27, 0], [0.30, 0.1], [0.29, 0.24], [0.27, 0.38], [0.26, 0.5], [0.2, 0.54], [0, 0.54],
    ],
    RED, 0.98, 0.52, "tunic",
  );
  // Shoulder yoke in blue-grey
  barrel([[0, 0], [0.27, 0], [0.28, 0.06], [0.2, 0.12], [0, 0.12]], BLUE, 0.9, 0.9, "yoke");

  // Shoulder caps (arm sockets)
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.1, 8, 6), BLUE, { bone, at: [CX + s * 0.265, 0.93, 0], name: "shoulderCap" });
    b.part(new THREE.TorusGeometry(0.1, 0.014, 5, 10), GOLD, {
      bone, at: [CX + s * 0.265, 0.93, 0], dir: [s, 0, 0], axis: "z", name: "shoulderTrim",
    });
  }

  // Leather apron: front panel slabs
  const apronZ = 0.265;
  b.part(new THREE.BoxGeometry(0.34, 0.5, 0.03), LEA, { bone, at: [CX, 0.78, apronZ + 0.02], rotation: [-3, 0, 0], name: "apron" });
  b.part(new THREE.BoxGeometry(0.2, 0.12, 0.03), LEA, { bone, at: [CX, 1.0, apronZ - 0.03], rotation: [-8, 0, 0], name: "apronBib" });
  // apron edge trim
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.02, 0.5, 0.036), LD, { bone, at: [CX + s * 0.17, 0.78, apronZ + 0.022], rotation: [-3, 0, 0], name: "apronEdge" });
  }
  b.part(new THREE.BoxGeometry(0.34, 0.025, 0.036), LD, { bone, at: [CX, 0.535, apronZ + 0.03], name: "apronHem" });
  // bib straps up to neck
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.035, 0.2, 0.02), LD, { bone, at: [CX + s * 0.09, 1.04, 0.2], rotation: [-30, 0, s * 8], name: "bibStrap" });
    b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.01, 6), GOLD, { bone, at: [CX + s * 0.09, 0.97, 0.262], dir: [0, 0, 1], name: "bibStud" });
  }
  // apron stitches
  for (let i = 0; i < 5; i++) {
    b.part(new THREE.BoxGeometry(0.012, 0.03, 0.006), LD, { bone, at: [CX - 0.12 + i * 0.06, 0.9, apronZ + 0.038], name: "stitch" });
  }
  // soot smudges
  for (let i = 0; i < 5; i++) {
    b.part(new THREE.BoxGeometry(0.04 + R() * 0.04, 0.03 + R() * 0.04, 0.004), P.coal, {
      bone, at: [CX + (R() - 0.5) * 0.24, 0.62 + R() * 0.3, apronZ + 0.038], name: "soot",
    });
  }

  // Belt
  const belt = b.lathe(
    [[0.275, 0], [0.305, 0], [0.305, 0.075], [0.275, 0.075]],
    { at: [CX, 0.58, 0], segments: 14, color: LD, bone, name: "belt" },
  );
  belt.mesh.scale.z = 0.98;
  b.part(new THREE.TorusGeometry(0.3, 0.007, 4, 20), GOLD, { bone, at: [CX, 0.655, 0], rotation: [90, 0, 0], scale: [1, 0.98, 1], name: "beltTrimTop" });
  b.part(new THREE.TorusGeometry(0.3, 0.007, 4, 20), GOLD, { bone, at: [CX, 0.585, 0], rotation: [90, 0, 0], scale: [1, 0.98, 1], name: "beltTrimBot" });
  // belt studs around front half
  for (let i = 0; i < 9; i++) {
    const a = ((i - 4) / 4) * 1.2 + 0 ;
    if (Math.abs(a) < 0.18) continue;
    b.part(new THREE.SphereGeometry(0.011, 5, 4), GOLD, {
      bone, at: [CX + Math.sin(a) * 0.31, 0.62, Math.cos(a) * 0.31 * 0.98], name: "beltStud",
    });
  }
  // Buckle
  const bz = 0.3;
  b.part(new THREE.CylinderGeometry(0.062, 0.062, 0.02, 14), GOLD, { bone, at: [CX, 0.62, bz], dir: [0, 0, 1], name: "buckle" });
  b.part(new THREE.TorusGeometry(0.045, 0.008, 5, 14), BRZ, { bone, at: [CX, 0.62, bz + 0.012], name: "buckleRing" });
  b.part(new THREE.CylinderGeometry(0.028, 0.028, 0.014, 10), BRZ, { bone, at: [CX, 0.62, bz + 0.013], dir: [0, 0, 1], name: "buckleCore" });
  b.part(new THREE.SphereGeometry(0.012, 5, 4), P.emberCore, { bone, at: [CX, 0.62, bz + 0.025], name: "buckleGem" });
  // Apron ties
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.025, 0.14, 0.012), LD, { bone, at: [CX + s * 0.05, 0.53, bz + 0.005], rotation: [0, 0, s * 8], name: "tie" });
    b.part(new THREE.SphereGeometry(0.016, 5, 4), LD, { bone, at: [CX + s * 0.058, 0.46, bz + 0.005], name: "tieKnot" });
  }
  // Chest straps (bandolier crossing)
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.035, 0.36, 0.02), LD, {
      bone, at: [CX + s * 0.04, 0.86, 0.255], rotation: [-5, 0, s * 38], name: "chestStrap",
    });
    for (let i = 0; i < 4; i++) {
      const t = (i - 1.5) * 0.085;
      b.part(new THREE.SphereGeometry(0.009, 5, 4), GOLD, {
        bone, at: [CX + s * 0.04 - s * t * Math.sin(0.66) * -1 * -1, 0.86 + t * Math.cos(0.66), 0.268], name: "strapStud",
      });
    }
  }
  // Chest strap crossing medallion
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.015, 10), GOLD, { bone, at: [CX, 0.86, 0.268], dir: [0, 0, 1], name: "strapMedal" });
  b.part(new THREE.CylinderGeometry(0.016, 0.016, 0.017, 8), BRZ, { bone, at: [CX, 0.86, 0.27], dir: [0, 0, 1], name: "strapMedalCore" });

  // Back: leather strap and tunic crease
  b.part(new THREE.BoxGeometry(0.4, 0.04, 0.02), LD, { bone, at: [CX, 0.9, -0.262], name: "backStrap" });
  b.part(new THREE.BoxGeometry(0.24, 0.3, 0.02), LD, { bone, at: [CX, 0.74, -0.285], name: "backApron" });

  // Fur collar ring of tufts
  const N = 18;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const rr = 0.17;
    const x = CX + Math.sin(a) * rr;
    const z = 0.02 + Math.cos(a) * rr * 0.9;
    const col = i % 2 ? BEARD : BD;
    b.spike([x, 1.0, z], [Math.sin(a) * 0.5, 1, Math.cos(a) * 0.5], 0.1, 0.04, { color: col, bone, sides: 5, name: "collarTuft" });
  }
  b.part(new THREE.TorusGeometry(0.16, 0.035, 6, 16), BEARD, { bone, at: [CX, 1.0, 0.02], rotation: [90, 0, 0], scale: [1, 0.9, 1], name: "collarRing" });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.2;
    b.spike([CX + Math.sin(a) * 0.2, 0.97, 0.02 + Math.cos(a) * 0.18], [Math.sin(a), 0.6, Math.cos(a)], 0.07, 0.03, { color: BEARD, bone, sides: 5, name: "collarOuter" });
  }
}
    return buildTorso;
  })(),
  // headBeard
  (() => {
function buildHeadBeard({ b, J, P, M }: Ctx) {
  const cx = -0.25;
  const head = J.head;
  const jaw = J.jaw;
  const R = rng(11);
  const LIGHT_BEARD = "#dc7a30";
  const BEARD_MID = "#b04e18";

  type Opt = { rot?: [number, number, number]; scale?: [number, number, number] };
  const put = (geo: THREE.BufferGeometry, color: string, at: [number, number, number], bone: any, o: Opt = {}) =>
    b.part(geo, color, { bone, at, rotation: o.rot, scale: o.scale, flat: true });
  const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);

  // ---- skull and face
  put(sph(1, 14, 10), P.skin, [cx, 1.17, 0.03], head, { scale: [0.15, 0.14, 0.14] });
  // cheeks
  for (const s of [1, -1]) {
    put(sph(0.04, 8, 6), "#d9776a", [cx + s * 0.085, 1.12, 0.14], head, { scale: [1, 0.8, 0.6] });
    // ears
    put(sph(0.05, 8, 6), P.skin, [cx + s * 0.155, 1.17, 0.0], head, { scale: [0.45, 1.2, 0.9] });
    put(sph(0.03, 6, 5), P.skinShade, [cx + s * 0.165, 1.17, 0.005], head, { scale: [0.4, 1.2, 0.8] });
    put(sph(0.016, 6, 5), P.skinShade, [cx + s * 0.172, 1.2, -0.01], head);
    // eyes
    put(sph(0.016, 8, 6), P.eyeWhite, [cx + s * 0.055, 1.19, 0.15], head, { scale: [1.2, 1, 0.6] });
    put(sph(0.011, 6, 5), P.ink, [cx + s * 0.055, 1.19, 0.158], head);
    put(sph(0.004, 4, 3), "#ffffff", [cx + s * 0.052, 1.195, 0.166], head);
    // brows (heavy bushy)
    put(new THREE.BoxGeometry(0.075, 0.03, 0.04), P.beardDark, [cx + s * 0.055, 1.225, 0.145], head, {
      rot: [0, 0, s * -14],
    });
    put(new THREE.BoxGeometry(0.04, 0.025, 0.035), P.beard, [cx + s * 0.085, 1.215, 0.14], head, {
      rot: [0, 0, s * -28],
    });
    // sideburn blocks
    put(new THREE.BoxGeometry(0.04, 0.1, 0.09), P.beard, [cx + s * 0.125, 1.08, 0.06], head, {
      rot: [0, 0, s * 6],
    });
  }
  // nose
  put(sph(0.04, 8, 6), "#d49467", [cx, 1.15, 0.175], head, { scale: [1.3, 0.95, 0.95] });
  put(sph(0.016, 6, 5), P.skinShade, [cx - 0.03, 1.135, 0.2], head);
  put(sph(0.016, 6, 5), P.skinShade, [cx + 0.03, 1.135, 0.2], head);
  // nose ring
  put(new THREE.TorusGeometry(0.013, 0.003, 5, 10), P.iron, [cx + 0.03, 1.125, 0.205], head, { rot: [20, 0, 0] });

  // ---- mouth: dark grin line with teeth, on the jaw
  put(new THREE.BoxGeometry(0.1, 0.014, 0.02), P.ink, [cx, 1.075, 0.145], jaw, { rot: [0, 0, 0] });
  put(new THREE.BoxGeometry(0.06, 0.008, 0.012), P.eyeWhite, [cx, 1.083, 0.153], jaw);
  put(new THREE.BoxGeometry(0.03, 0.012, 0.02), "#a8564a", [cx, 1.07, 0.148], jaw);
  for (const s of [1, -1]) {
    put(new THREE.BoxGeometry(0.02, 0.012, 0.02), P.ink, [cx + s * 0.058, 1.083, 0.14], jaw, { rot: [0, 0, s * 35] });
  }
  // chin
  put(sph(0.05, 8, 6), P.skin, [cx, 1.055, 0.1], jaw, { scale: [1.2, 0.8, 1] });

  // ---- moustache
  for (const s of [1, -1]) {
    put(new THREE.CapsuleGeometry(0.022, 0.07, 4, 8), P.beard, [cx + s * 0.05, 1.105, 0.175], head, {
      rot: [0, 0, s * 80],
    });
    put(sph(0.026, 7, 5), LIGHT_BEARD, [cx + s * 0.095, 1.09, 0.17], head);
    put(sph(0.018, 6, 4), LIGHT_BEARD, [cx + s * 0.115, 1.07, 0.165], head);
  }
  put(sph(0.03, 7, 5), P.beardDark, [cx, 1.1, 0.185], head, { scale: [1.5, 0.8, 0.8] });

  // ---- beard: core wedge + stacked tuft rows
  put(new THREE.ConeGeometry(0.16, 0.3, 5), P.beardDark, [cx, 0.93, 0.07], jaw, {
    rot: [180, 0, 0],
    scale: [1, 1, 0.8],
  });
  put(new THREE.ConeGeometry(0.13, 0.26, 5), BEARD_MID, [cx, 0.94, 0.11], jaw, {
    rot: [180, 0, 0],
    scale: [1, 1, 0.6],
  });
  const rows = 6;
  for (let i = 0; i < rows; i++) {
    const t = i / (rows - 1);
    const y = 1.045 - t * 0.2;
    const half = 0.115 - t * 0.085;
    const n = Math.max(1, 4 - Math.floor(i * 0.7));
    const z = 0.15 - t * 0.02;
    for (let k = 0; k < n; k++) {
      const u = n === 1 ? 0 : k / (n - 1) - 0.5;
      const x = cx + u * 2 * half;
      const col = i < 2 ? LIGHT_BEARD : (i + k) % 2 ? P.beard : P.beardDark;
      const h = 0.085 + (n === 1 ? 0.03 : 0) + R() * 0.015;
      put(new THREE.ConeGeometry(0.036 - t * 0.008, h, 5), col, [x, y - h * 0.3, z], jaw, {
        rot: [180 + 6, R() * 60, u * -30],
      });
    }
  }
  // tip tuft
  put(new THREE.ConeGeometry(0.03, 0.08, 5), P.beardDark, [cx, 0.8, 0.1], jaw, { rot: [180, 0, 0] });
  // wisps at jaw edges
  for (const s of [1, -1]) {
    put(new THREE.ConeGeometry(0.03, 0.09, 5), LIGHT_BEARD, [cx + s * 0.1, 1.0, 0.12], jaw, {
      rot: [180, 0, s * 12],
    });
  }

  // ---- braids
  for (const s of [1, -1]) {
    const bx = cx + s * 0.135;
    const bz = 0.13;
    const segs = 7;
    for (let c = 0; c < 3; c++) {
      for (let i = 0; i < segs; i++) {
        const t = i / (segs - 1);
        const y = 1.03 - i * 0.03;
        const sway = Math.sin((i + c * 2.1) * 1.05) * 0.014 * (1 - t * 0.5);
        const r = 0.019 - t * 0.008;
        put(sph(r, 6, 5), (i + c) % 2 ? P.beard : LIGHT_BEARD, [bx + sway, y, bz + Math.cos((i + c * 2.1) * 1.05) * 0.008], jaw, {
          scale: [1, 1.35, 1],
        });
      }
    }
    for (const ry of [0.97, 0.88]) {
      put(new THREE.TorusGeometry(0.026, 0.006, 5, 10), P.gold, [bx, ry, bz], jaw, { rot: [90, 0, 0] });
    }
    put(new THREE.ConeGeometry(0.02, 0.05, 5), P.beardDark, [bx, 0.8, bz], jaw, { rot: [180, 0, 0] });
  }

  // ---- helmet
  const hy = 1.255;
  put(new THREE.SphereGeometry(0.17, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), P.steel, [cx, hy, 0.03], head, {
    scale: [1, 1, 1],
  });
  put(new THREE.CylinderGeometry(0.17, 0.2, 0.03, 14), P.iron, [cx, hy - 0.005, 0.03], head);
  put(new THREE.TorusGeometry(0.19, 0.008, 5, 18), P.steel, [cx, hy - 0.02, 0.03], head, { rot: [90, 0, 0] });
  // gold band
  put(new THREE.CylinderGeometry(0.168, 0.173, 0.03, 14), P.gold, [cx, hy + 0.028, 0.03], head);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    put(sph(0.007, 5, 4), P.bronze, [cx + Math.sin(a) * 0.173, hy + 0.028, 0.03 + Math.cos(a) * 0.173], head);
  }
  // nose guard
  put(new THREE.BoxGeometry(0.02, 0.07, 0.014), P.gold, [cx, hy - 0.03, 0.205], head);
  put(new THREE.BoxGeometry(0.014, 0.05, 0.01), P.bronze, [cx, hy - 0.035, 0.213], head);
  // crown ridge and spike
  put(new THREE.BoxGeometry(0.02, 0.03, 0.3), P.iron, [cx, hy + 0.15, 0.03], head, { rot: [0, 0, 0] });
  put(new THREE.ConeGeometry(0.025, 0.07, 6), P.gold, [cx, hy + 0.2, 0.03], head);
  put(new THREE.CylinderGeometry(0.026, 0.026, 0.012, 8), P.gold, [cx, hy + 0.165, 0.03], head);
  // side plates
  for (const s of [1, -1]) {
    put(sph(0.016, 6, 5), P.gold, [cx + s * 0.185, hy - 0.01, 0.03], head);
  }
}
    return buildHeadBeard;
  })(),
  // armsTools
  (() => {
function buildArmsTools({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const SLEEVE = P.clothBlue, SOOT = "#2b2622", SOOT2 = "#3a332d";

  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (r0: number, r1: number, h: number, n = 8) => new THREE.CylinderGeometry(r0, r1, h, n);
  const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);

  // ring band around a limb segment at fraction t between points a,b
  const lerp = (a: number[], c: number[], t: number) => [a[0] + (c[0] - a[0]) * t, a[1] + (c[1] - a[1]) * t, a[2] + (c[2] - a[2]) * t];
  const band = (a: number[], c: number[], t: number, r: number, h: number, color: string, bone: any) =>
    b.part(cyl(r, r, h, 10), color, { bone, at: lerp(a, c, t), dir: [c[0] - a[0], c[1] - a[1], c[2] - a[2]] });

  const fist = (bone: any, at: number[], dir: number[], s: number) => {
    b.part(box(0.1 * s, 0.09 * s, 0.1 * s), SOOT, { bone, at, dir });
    // four finger blocks
    for (let i = 0; i < 4; i++) {
      const o = (i - 1.5) * 0.024 * s;
      b.part(box(0.022 * s, 0.03 * s, 0.05 * s), SOOT2, { bone, at: [at[0], at[1] + o, at[2] + 0.05 * s], rotation: [0, 0, 0] });
    }
    b.part(sph(0.03 * s), SOOT2, { bone, at: [at[0] + 0.03, at[1] - 0.04, at[2]] });
  };

  // ================= RIGHT ARM (raised) =================
  const sR = [-0.52, 0.92, 0], eR = [-0.62, 1.16, -0.02], hR = [-0.48, 1.42, 0.06];
  b.part(sph(0.1, 8, 6), SLEEVE, { bone: J.shoulderR, at: sR });
  b.frustumBox(sR, eR, [0.2, 0.2], [0.15, 0.15], { bone: J.shoulderR, color: SLEEVE });
  b.part(sph(0.085, 8, 6), SLEEVE, { bone: J.elbowR, at: eR });
  b.frustumBox(eR, hR, [0.15, 0.15], [0.12, 0.12], { bone: J.elbowR, color: SLEEVE });
  band(sR, eR, 0.5, 0.098, 0.02, P.leatherDark, J.shoulderR);
  // rolled cuff
  band(eR, hR, 0.78, 0.098, 0.05, P.clothRed, J.elbowR);
  band(eR, hR, 0.9, 0.1, 0.012, P.gold, J.elbowR);
  // vambrace
  band(eR, hR, 0.45, 0.092, 0.07, P.leather, J.elbowR);
  band(eR, hR, 0.35, 0.094, 0.01, P.gold, J.elbowR);
  band(eR, hR, 0.55, 0.094, 0.01, P.gold, J.elbowR);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.4;
    const c = lerp(eR, hR, 0.45);
    b.part(sph(0.009, 4, 3), P.gold, { bone: J.elbowR, at: [c[0] + Math.cos(a) * 0.095, c[1], c[2] + Math.sin(a) * 0.095] });
  }
  // fist with hammer
  fist(J.handR, [hR[0], hR[1] + 0.03, hR[2] + 0.02], [0, 1, 0], 1.25);
  const hx = hR[0], hz = hR[2] + 0.02;
  // shaft: vertical, passes through fist
  b.rod([hx, 1.24, hz], [hx, 1.62, hz], 0.022, P.wood, { bone: J.handR });
  b.part(cyl(0.026, 0.026, 0.06, 8), P.woodDark, { bone: J.handR, at: [hx, 1.28, hz] });
  // pommel ring
  b.part(new THREE.TorusGeometry(0.03, 0.01, 6, 10), P.bronze, { bone: J.handR, at: [hx, 1.22, hz], rotation: [90, 0, 0] });
  b.part(sph(0.026, 6, 4), P.bronze, { bone: J.handR, at: [hx, 1.2, hz] });
  // hammer head
  const hy = 1.64;
  b.part(box(0.2, 0.12, 0.12), P.steel, { bone: J.handR, at: [hx, hy, hz] });
  b.part(box(0.07, 0.125, 0.125), P.ironDark, { bone: J.handR, at: [hx - 0.065, hy, hz] });
  b.part(box(0.07, 0.125, 0.125), P.ironDark, { bone: J.handR, at: [hx + 0.065, hy, hz] });
  b.part(box(0.215, 0.025, 0.135), P.iron, { bone: J.handR, at: [hx, hy + 0.065, hz] });
  b.part(box(0.215, 0.025, 0.135), P.iron, { bone: J.handR, at: [hx, hy - 0.065, hz] });
  // bevelled faces
  b.part(cyl(0.05, 0.062, 0.03, 8), P.steel, { bone: J.handR, at: [hx - 0.115, hy, hz], dir: [-1, 0, 0] });
  b.part(cyl(0.05, 0.062, 0.03, 8), P.steel, { bone: J.handR, at: [hx + 0.115, hy, hz], dir: [1, 0, 0] });
  for (const s of [1, -1])
    for (const zz of [-1, 1])
      b.part(sph(0.01, 4, 3), P.gold, { bone: J.handR, at: [hx + s * 0.065, hy + 0.05, hz + zz * 0.064] });
  b.part(cyl(0.012, 0.012, 0.05, 6), P.bronze, { bone: J.handR, at: [hx, 1.675, hz] });

  // ================= LEFT ARM (forward to anvil) =================
  const sL = [0.02, 0.92, 0], eL = [0.1, 0.68, 0.22], hL = [0.3, 0.78, 0.34];
  b.part(sph(0.1, 8, 6), SLEEVE, { bone: J.shoulderL, at: sL });
  b.frustumBox(sL, eL, [0.2, 0.2], [0.15, 0.15], { bone: J.shoulderL, color: SLEEVE });
  b.part(sph(0.082, 8, 6), SLEEVE, { bone: J.elbowL, at: eL });
  b.frustumBox(eL, hL, [0.15, 0.15], [0.12, 0.12], { bone: J.elbowL, color: SLEEVE });
  band(sL, eL, 0.5, 0.098, 0.02, P.leatherDark, J.shoulderL);
  band(eL, hL, 0.82, 0.095, 0.045, P.clothRed, J.elbowL);
  band(eL, hL, 0.93, 0.097, 0.012, P.gold, J.elbowL);
  // iron wrist guard
  band(eL, hL, 0.55, 0.09, 0.035, P.iron, J.elbowL);
  band(eL, hL, 0.55, 0.093, 0.01, P.steel, J.elbowL);
  fist(J.handL, [hL[0] + 0.03, hL[1], hL[2] + 0.04], [0.5, 0.1, 0.85], 1.15);

  // tongs: two handles from fist to pivot, jaws to the bar
  const bar = M.anvilWorkPoint;
  const pivot = [0.38, 0.8, 0.44];
  for (const s of [1, -1]) {
    b.rod([hL[0] + 0.02, hL[1] + s * 0.02, hL[2] + 0.02], [pivot[0], pivot[1] + s * 0.015, pivot[2]], 0.011, P.iron, { bone: J.handL });
    b.rod([pivot[0], pivot[1] + s * 0.015, pivot[2]], [bar[0] + 0.02, bar[1] + 0.03 + s * 0.012, bar[2] + 0.08], 0.01, P.ironDark, { bone: J.handL });
    b.part(box(0.03, 0.02, 0.05), P.iron, { bone: J.handL, at: [bar[0] + 0.02, bar[1] + 0.03 + s * 0.016, bar[2] + 0.1] });
  }
  b.part(cyl(0.017, 0.017, 0.06, 8), P.steel, { bone: J.handL, at: pivot, dir: [0, 1, 0] });
  b.part(sph(0.012, 5, 4), P.bronze, { bone: J.handL, at: [pivot[0], pivot[1] + 0.032, pivot[2]] });
  // grip wraps on the handles
  for (const t of [0.2, 0.4])
    b.part(box(0.04, 0.05, 0.012), P.leatherDark, { bone: J.handL, at: [hL[0] + 0.09 + t * 0.1, hL[1] + 0.02, hL[2] + 0.1 + t * 0.15], rotation: [0, 30, 0] });
}
    return buildArmsTools;
  })(),
  // anvilForge
  (() => {
function buildAnvilForge({ b, J, P, M }: Ctx) {
  const r = rng(11);
  const CX = 0.45, CZ = 0.25;
  const WOOD = P.wood, WOODD = P.woodDark, IRON = P.iron, IROND = P.ironDark, STEEL = P.steel;
  const COAL = P.coal, EMBER = P.ember, CORE = P.emberCore;

  // Place helper: no joints, parts in model space.
  const put = (geo: THREE.BufferGeometry, color: string, at: [number, number, number], opt: any = {}) =>
    b.part(geo, color, { at, ...opt });
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (rt: number, rb: number, h: number, s = 12) => new THREE.CylinderGeometry(rt, rb, h, s);

  // ---- Stump ----
  put(cyl(0.19, 0.21, 0.35, 12), WOOD, [CX, 0.175, CZ], { flat: true });
  // bark ridges
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + r() * 0.2;
    const h = 0.2 + r() * 0.1;
    put(box(0.025, h, 0.02), WOODD, [CX + Math.sin(a) * 0.2, 0.17 + (r() - 0.5) * 0.04, CZ + Math.cos(a) * 0.2], {
      rotation: [0, (a * 180) / Math.PI, 0],
    });
  }
  // top face with chips
  put(cyl(0.185, 0.185, 0.012, 12), "#9a6a34", [CX, 0.352, CZ]);
  for (let i = 0; i < 5; i++) {
    const a = i * 1.3 + 0.4;
    put(box(0.04, 0.025, 0.03), WOODD, [CX + Math.sin(a) * 0.185, 0.345, CZ + Math.cos(a) * 0.185], {
      rotation: [0, (a * 180) / Math.PI, 0],
    });
  }
  // iron hoops
  for (const y of [0.06, 0.29]) {
    put(new THREE.TorusGeometry(0.2 - (y < 0.1 ? 0 : 0.012), 0.014, 5, 16), IRON, [CX, y, CZ], { rotation: [90, 0, 0], flat: true });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      put(new THREE.SphereGeometry(0.012, 5, 4), STEEL, [CX + Math.sin(a) * 0.212, y, CZ + Math.cos(a) * 0.212]);
    }
  }

  // ---- Anvil ----
  // feet
  put(box(0.3, 0.04, 0.2), IROND, [CX, 0.37, CZ]);
  // waist
  put(new THREE.CylinderGeometry(0.075, 0.1, 0.17, 6), IRON, [CX, 0.475, CZ], { flat: true });
  put(box(0.17, 0.05, 0.16), IROND, [CX, 0.405, CZ]);
  // body
  put(box(0.5, 0.14, 0.2), IRON, [CX, 0.6, CZ]);
  put(box(0.52, 0.03, 0.22), IROND, [CX, 0.525, CZ]);
  // heel (back)
  put(box(0.16, 0.12, 0.18), IRON, [CX, 0.6, CZ - 0.15], {});
  // horn pointing +Z
  b.spike([CX, 0.62, CZ + 0.08], [0, 0, 1], 0.3, 0.085, { color: IRON, sides: 8 });
  b.part(new THREE.CylinderGeometry(0.085, 0.1, 0.06, 8), IRON, { at: [CX, 0.62, CZ + 0.1], rotation: [90, 0, 0] });
  // step on the tail side
  put(box(0.16, 0.05, 0.2), IRON, [CX - 0.0, 0.69, CZ - 0.12]);
  // face plate
  put(box(0.5, 0.03, 0.2), STEEL, [CX - 0.0, 0.685, CZ - 0.0]);
  put(box(0.5, 0.008, 0.2), "#c3cad3", [CX, 0.703, CZ]);
  // hardy hole & pritchel
  put(box(0.035, 0.012, 0.035), IROND, [CX - 0.14, 0.704, CZ - 0.0]);
  put(cyl(0.012, 0.012, 0.012, 8), IROND, [CX - 0.08, 0.704, CZ - 0.05]);
  // wear highlights / rivets
  for (const sx of [-1, 1]) put(new THREE.SphereGeometry(0.01, 5, 4), STEEL, [CX + sx * 0.2, 0.6, CZ + 0.102]);

  // ---- Glowing bar across the face (at anvilWorkPoint ~ [0.4,0.74,0.28]) ----
  const bx = M.anvilWorkPoint[0], bz = M.anvilWorkPoint[2];
  glow(put(box(0.34, 0.03, 0.04), EMBER, [bx, 0.72, bz], { rotation: [0, 20, 0] }), 1.3);
  glow(put(box(0.3, 0.014, 0.022), CORE, [bx, 0.738, bz], { rotation: [0, 20, 0] }), 1.8);
  glow(put(box(0.07, 0.03, 0.04), "#c74a18", [bx - 0.2, 0.72, bz + 0.07], { rotation: [0, 20, 0] }), 1);
  // radiated glow on steel
  glow(put(cyl(0.11, 0.11, 0.004, 10), "#ff9a4a", [bx, 0.7075, bz], { scale: [1.6, 1, 0.7], rotation: [0, 20, 0] }), 0.8);

  // ---- Ember bucket ----
  const BX = CX - 0.28, BZ = CZ + 0.2;
  put(cyl(0.085, 0.065, 0.14, 10), IRON, [BX, 0.07, BZ], { flat: true });
  put(new THREE.TorusGeometry(0.085, 0.012, 5, 12), IROND, [BX, 0.135, BZ], { rotation: [90, 0, 0] });
  put(new THREE.TorusGeometry(0.075, 0.01, 5, 12), IROND, [BX, 0.03, BZ], { rotation: [90, 0, 0] });
  // handle
  put(new THREE.TorusGeometry(0.08, 0.008, 4, 10, Math.PI), IROND, [BX, 0.135, BZ], { rotation: [0, 0, 0] });
  // coal heap
  put(new THREE.SphereGeometry(0.08, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), COAL, [BX, 0.135, BZ], { scale: [1, 0.7, 1], flat: true });
  for (let i = 0; i < 6; i++) {
    const a = i * 1.1;
    put(new THREE.DodecahedronGeometry(0.02 + r() * 0.01, 0), i % 2 ? COAL : "#3a3a42", [BX + Math.sin(a) * 0.04, 0.17 + r() * 0.01, BZ + Math.cos(a) * 0.04]);
  }
  glow(put(new THREE.DodecahedronGeometry(0.022, 0), EMBER, [BX + 0.02, 0.19, BZ + 0.01]), 1.5);
  glow(put(new THREE.DodecahedronGeometry(0.016, 0), CORE, [BX - 0.03, 0.18, BZ - 0.02]), 1.8);
  glow(put(new THREE.DodecahedronGeometry(0.014, 0), EMBER, [BX - 0.01, 0.2, BZ + 0.04]), 1.5);

  // ---- Tools on the ground ----
  // mallet
  const MX = CX + 0.2, MZ = CZ + 0.28;
  put(cyl(0.012, 0.014, 0.22, 6), WOOD, [MX, 0.014, MZ], { rotation: [0, 0, 90], flat: true });
  put(box(0.07, 0.05, 0.05), IRON, [MX + 0.13, 0.028, MZ]);
  put(box(0.074, 0.012, 0.054), IROND, [MX + 0.13, 0.028, MZ - 0.0], { scale: [1, 3, 1.02] });
  put(cyl(0.016, 0.016, 0.01, 6), IRON, [MX - 0.12, 0.014, MZ], { rotation: [0, 0, 90] });
  // punch
  const PX = CX + 0.3, PZ = CZ + 0.12;
  put(cyl(0.01, 0.01, 0.17, 6), IRON, [PX, 0.01, PZ], { rotation: [0, 0, 90], flat: true });
  b.spike([PX + 0.085, 0.01, PZ], [1, 0, 0], 0.05, 0.01, { color: STEEL, sides: 6 });
  put(cyl(0.015, 0.012, 0.012, 6), IROND, [PX - 0.09, 0.01, PZ], { rotation: [0, 0, 90] });
}
    return buildAnvilForge;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "dwarfBlacksmith" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [-0.25,0.62,0], dir: [0,1,0], role: "spine" });
  J["head"] = b.joint("head", { parent: J["body"], at: [-0.25,1.04,0.02], dir: [0,1,0], role: "head" });
  J["jaw"] = b.joint("jaw", { parent: J["head"], at: [-0.25,0.98,0.09], dir: [0,-0.35,1], role: "jaw" });
  J["shoulderR"] = b.joint("shoulderR", { parent: J["body"], at: [-0.52,0.92,0], dir: [-0.3,1,0], role: "arm", group: "arms" });
  J["elbowR"] = b.joint("elbowR", { parent: J["shoulderR"], at: [-0.62,1.16,-0.02], dir: [0.35,1,0.2], role: "arm", group: "arms" });
  J["handR"] = b.joint("handR", { parent: J["elbowR"], at: [-0.48,1.42,0.06], dir: [0,0.6,0.8], role: "arm", group: "arms" });
  J["shoulderL"] = b.joint("shoulderL", { parent: J["body"], at: [0.02,0.92,0], dir: [0,-1,0.4], role: "arm", group: "arms" });
  J["elbowL"] = b.joint("elbowL", { parent: J["shoulderL"], at: [0.1,0.68,0.22], dir: [0.4,0.3,0.85], role: "arm", group: "arms" });
  J["handL"] = b.joint("handL", { parent: J["elbowL"], at: [0.3,0.78,0.34], dir: [0.5,0.1,0.85], role: "arm", group: "arms" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
