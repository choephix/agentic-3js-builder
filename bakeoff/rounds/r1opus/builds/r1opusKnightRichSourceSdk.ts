import * as THREE from "three";
import {
  createBuilder,
  rng,
  paint,
  mix,
  noise,
  cells,
  smoothstep,
  scales,
  svg,
  frame,
  catmull,
  polyline,
  arc,
  bezier,
} from "../../../../src/index";

export const meta = {
  name: "Battle-Worn Knight",
  description:
    "A fantasy knight in dented, scratched plate: great helm with eye slit and tall crimson plume, layered gold-etched pauldrons, deep-blue surcoat with a silver griffin, kite shield, broadsword and a torn crimson cape.",
};

const DEG = Math.PI / 180;

const GRIFFIN = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120">
<g fill="#e4e8ec" stroke="#6f7782" stroke-width="2" stroke-linejoin="round">
<path d="M70 88 Q98 92 90 112" fill="none" stroke-width="6"/>
<path d="M70 88 Q98 92 90 112" fill="none" stroke="#e4e8ec" stroke-width="3"/>
<circle cx="89" cy="112" r="4.5"/>
<polygon points="56,56 60,22 70,8 76,16 84,6 88,18 96,14 92,34 86,48 72,62"/>
<path d="M64 40 L82 18 M68 47 L91 26 M72 55 L90 39" fill="none"/>
<polygon points="58,84 52,102 44,108 46,113 58,111 66,90"/>
<polygon points="68,84 76,102 72,110 84,111 80,86"/>
<ellipse cx="57" cy="72" rx="15" ry="22" transform="rotate(-18 57 72)"/>
<polygon points="46,58 30,50 22,44 19,51 26,57 40,68"/>
<polygon points="46,70 30,72 23,67 22,76 32,79 48,80"/>
<polygon points="33,38 46,29 59,54 46,64"/>
<circle cx="39" cy="33" r="10"/>
<polygon points="31,29 16,36 31,41"/>
<polygon points="43,25 47,12 50,27"/>
</g>
<circle cx="37" cy="31" r="2.2" fill="#1b2340"/>
</svg>`;

export default function build() {
  const b = createBuilder({ name: "knight", paintSize: 1024 });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const add = (p: THREE.Vector3, x: number, y: number, z: number) => p.clone().add(V(x, y, z));
  const R = rng(7);

  // ---------------------------------------------------------------- paints
  const STEEL = paint((p, n) => {
    const m = noise(p, 0.14, 3);
    let c = mix("#68717c", "#b6bec8", 0.25 + 0.75 * m);
    c = mix(c, "#e6ebf0", 0.22 * smoothstep(0.2, 1, n.y));
    const d = cells(p, 0.1, 17);
    if (d.id < 0.25) {
      const t = d.d1 / 0.32;
      if (t < 1) {
        c = mix(c, "#3c424a", 0.55 * (1 - smoothstep(0, 0.8, t)));
        c = mix(c, "#eef2f5", 0.5 * smoothstep(0.72, 0.9, t) * (1 - smoothstep(0.9, 1, t)));
      }
    }
    const q = new THREE.Vector3(p.x * 2.5 + p.y, p.y * 0.5, p.z * 2.5 - p.y);
    if (Math.abs(noise(q, 0.09, 29) - 0.5) < 0.007) c = mix(c, "#f4f7fa", 0.85);
    if (Math.abs(noise(q, 0.06, 41) - 0.5) < 0.005) c = mix(c, "#2f343a", 0.6);
    return c;
  });
  const GOLD = paint((p, n) =>
    mix("#9c6e17", "#f6d873", 0.3 + 0.5 * noise(p, 0.04, 5) + 0.25 * smoothstep(0, 1, n.y)),
  );
  const ENGR = paint((p) => {
    const a = Math.abs(noise(p, 0.045, 77) - 0.5);
    const c = Math.abs(noise(p, 0.02, 78) - 0.5);
    if (a < 0.025 || (a < 0.09 && c < 0.02)) return mix("#a8781c", "#f5d46b", noise(p, 0.03, 5));
    return STEEL;
  });
  const BLUE = paint((p) => {
    let c = mix("#14245a", "#2b48a3", noise(p, 0.07, 9));
    c = mix(c, "#0b1330", 0.45 * smoothstep(0.35, 0.75, noise(p, 0.05, 12)) * smoothstep(1.2, 0.5, p.y));
    if (Math.abs(noise(p, 0.05, 14) - 0.5) < 0.006) c = mix(c, "#0a0f22", 0.7);
    return c;
  });
  const PANEL = paint((p, n, s) => {
    const [x, y] = s;
    const hw = 0.17 + -y * 0.1;
    if (y < -0.355 && y > -0.38) return GOLD;
    if (Math.abs(x) > hw - 0.024 && Math.abs(x) < hw - 0.01 && y < -0.02) return GOLD;
    return BLUE;
  });
  const CRIMSON = paint((p) => {
    const f = 0.5 + 0.5 * Math.sin(p.x * 60 + noise(p, 0.2, 4) * 6);
    let c = mix("#5a0912", "#c01f30", 0.35 + 0.55 * f);
    c = mix(c, "#2a0508", 0.5 * smoothstep(0.8, 0.3, p.y) * noise(p, 0.06, 8));
    return c;
  });
  const PLUME = paint((p) => {
    let c = mix("#8e0f1d", "#e5333f", noise(p, 0.03, 21));
    if (Math.abs(noise(p, 0.02, 22) - 0.5) < 0.02) c = mix(c, "#4a050c", 0.6);
    return c;
  });
  const SHIELD = paint((p) => {
    let c = mix("#152865", "#2b4ba8", noise(p, 0.09, 31));
    const q = new THREE.Vector3(p.x * 2 + p.y, p.y * 0.7, p.z);
    if (Math.abs(noise(q, 0.08, 51) - 0.5) < 0.006) c = mix(c, "#bfc7cf", 0.9);
    const ch = cells(p, 0.06, 61);
    if (ch.id < 0.12 && ch.d1 < 0.2) c = mix(c, "#9aa3ad", 0.85);
    return c;
  });
  const BLADE = paint((p, n, s) => {
    const [x, y] = s;
    let c = mix("#b9c3cd", "#f1f5f8", smoothstep(0.0, 0.016, 0.026 - Math.abs(y)) * 0.8 + 0.2 * noise(p, 0.05, 3));
    if (Math.abs(y) < 0.0045 && x > 0.04 && x < 0.6) c = mix(c, "#6f7984", 0.75);
    const q = new THREE.Vector3(p.x, p.y * 3, p.z * 0.4);
    if (Math.abs(noise(q, 0.05, 88) - 0.5) < 0.006) c = mix(c, "#59626c", 0.5);
    return c;
  });
  const MAIL = scales(["#8f969e", "#737b84"], "#363b42", { size: 0.02, width: 0.28 });
  const LEATHER = "#4a2c1a";
  const DARK = "#0b0d10";

  // ---------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: [0, 0.96, 0], dir: [0, 1, 0] });
  const spine = b.chain("spine", polyline([[0, 1.0, 0], [0, 1.16, 0], [0, 1.32, 0], [0, 1.47, 0]]), {
    parent: hips,
    names: ["spine1", "spine2", "chest"],
    role: "spine",
  });
  b.chain("neck", polyline([[0, 1.47, 0], [0, 1.57, 0.01], [0, 1.86, 0.01]]), {
    parent: "chest",
    names: ["neck", "head", "headTop"],
    role: "neck",
  });
  const legs = new Map<string, ReturnType<typeof b.chain>>();
  const arms = new Map<string, ReturnType<typeof b.chain>>();
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    legs.set(
      S,
      b.chain(
        "leg" + S,
        polyline([
          [0.11 * s, 0.93, 0],
          [0.125 * s, 0.51, 0.03],
          [0.135 * s, 0.1, 0],
          [0.14 * s, 0.03, 0.15],
        ]),
        { parent: hips, names: [`hip${S}`, `knee${S}`, `ankle${S}`, `toe${S}`], role: "leg", contact: [0.14 * s, 0, 0.06] },
      ),
    );
    arms.set(
      S,
      b.chain(
        "arm" + S,
        polyline([
          [0.19 * s, 1.42, 0],
          [0.47 * s, 1.38, 0],
          [0.73 * s, 1.34, 0.01],
          [0.84 * s, 1.33, 0.02],
        ]),
        { parent: "chest", names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `hand${S}`], role: "arm" },
      ),
    );
  }
  const cape = b.chain("cape", catmull([[0, 1.45, -0.17], [0, 1.12, -0.24], [0, 0.8, -0.28], [0, 0.45, -0.3]]), {
    parent: "chest",
    names: ["cape1", "cape2", "cape3"],
  });

  // ---------------------------------------------------------------- torso
  const torso = b.loft(
    [
      { at: [0, 0.97, 0], w: 0.3, h: 0.21 },
      { at: [0, 1.12, 0.005], w: 0.31, h: 0.22 },
      { at: [0, 1.3, 0.015], w: 0.38, h: 0.26 },
      { at: [0, 1.48, 0], w: 0.34, h: 0.21 },
    ],
    { color: STEEL, bone: [spine], caps: "flat", sides: 12, name: "breastplate" },
  );
  const surcoat = b.loft(
    [
      { at: [0, 0.99, 0], w: 0.33, h: 0.245 },
      { at: [0, 1.12, 0.005], w: 0.34, h: 0.255 },
      { at: [0, 1.3, 0.015], w: 0.41, h: 0.29 },
      { at: [0, 1.39, 0.012], w: 0.395, h: 0.27 },
    ],
    { color: BLUE, bone: [spine], caps: "none", sides: 12, name: "surcoat" },
  );
  const coatSurf = b.surface(surcoat);
  const griffinTex = svg(GRIFFIN, { size: 512 });
  b.decal(coatSurf, griffinTex, { at: [0, 1.24, 0.2], dir: [0, 0, 1], size: [0.19, 0.23], name: "chestGriffin" });

  const belt = coatSurf.loop([0, 1.03, 0], { lift: 0.003 });
  b.sweep(belt, (): [number, number] => [0.009, 0.03], { section: "box", up: [0, 1, 0], color: LEATHER, bone: "spine1", name: "belt" });
  const neckTrim = coatSurf.loop([0, 1.378, 0], { lift: 0.002 });
  b.sweep(neckTrim, 0.008, { color: GOLD, sides: 5, bone: "chest", name: "collarTrim" });
  const front = coatSurf.ray([0, 1.03, 1], [0, 0, -1]);
  const fz = front ? front.at.z : 0.135;
  b.part(new THREE.BoxGeometry(0.065, 0.07, 0.016), GOLD, { at: [0, 1.03, fz + 0.016], bone: "spine1", name: "buckle" });
  b.part(new THREE.BoxGeometry(0.035, 0.04, 0.01), LEATHER, { at: [0, 1.03, fz + 0.022], bone: "spine1" });

  // mail skirt + tabard panels
  b.loft(
    [
      { at: [0, 1.0, 0], w: 0.335, h: 0.25 },
      { at: [0, 0.86, 0], w: 0.4, h: 0.27 },
      { at: [0, 0.76, 0], w: 0.44, h: 0.28 },
    ],
    { color: MAIL, bone: "hips", caps: "none", sides: 12, name: "mailSkirt" },
  );
  const HEM: number[][] = [
    [-0.17, 0], [0.17, 0], [0.2, -0.3], [0.215, -0.44], [0.17, -0.41], [0.12, -0.47], [0.07, -0.42],
    [0.02, -0.49], [-0.03, -0.43], [-0.08, -0.46], [-0.12, -0.41], [-0.17, -0.45], [-0.215, -0.42], [-0.2, -0.3],
  ];
  b.extrude(HEM, { at: [0, 1.04, 0.135], x: [1, 0, 0], y: [0, 1, -0.15], thickness: 0.015, bevel: 0.004, color: PANEL, bone: "hips", name: "tabardFront" });
  b.extrude(HEM, { at: [0, 1.04, -0.135], x: [-1, 0, 0], y: [0, 1, 0.15], thickness: 0.015, bevel: 0.004, color: PANEL, bone: "hips", name: "tabardBack" });

  // tassets
  for (const s of [1, -1]) {
    for (let k = 0; k < 3; k++) {
      const top = V((0.205 + 0.012 * k) * s, 1.0 - 0.07 * k, 0);
      const bot = V((0.235 + 0.012 * k) * s, 0.86 - 0.07 * k, 0);
      b.frustumBox(top, bot, [0.016, 0.17], [0.016, 0.21], { color: ENGR, bone: hips });
      b.part(new THREE.IcosahedronGeometry(0.008, 0), GOLD, { at: add(top, 0.011 * s, -0.02, 0), bone: hips });
    }
  }

  // gorget
  b.lathe([[0.07, 0], [0.125, 0], [0.125, 0.02], [0.09, 0.12], [0.07, 0.12]], { at: [0, 1.43, 0], color: STEEL, bone: "neck", segments: 12, name: "gorget" });

  // brooches
  const torsoSurf = b.surface(torso);
  for (const s of [1, -1]) {
    const hit = torsoSurf.ray([0.105 * s, 1.415, 1], [0, 0, -1]);
    if (!hit) continue;
    b.stick(new THREE.CylinderGeometry(0.03, 0.03, 0.012, 8), GOLD, hit, { embed: 0.3, bone: "chest" });
    b.stick(new THREE.IcosahedronGeometry(0.014, 0), "#a0101e", hit.moved([0, 0.012, 0]), { embed: 0.3, bone: "chest", flat: true });
  }

  // ---------------------------------------------------------------- legs
  for (const s of [1, -1]) {
    const [hip, knee, ankle] = legs.get(s > 0 ? "L" : "R")!.joints;
    b.capsule(hip.at, knee.at, [0.085, 0.066], { color: STEEL, bone: hip, sides: 10 });
    b.part(new THREE.SphereGeometry(0.066, 10, 7), ENGR, { at: add(knee.at, 0, 0, 0.018), bone: knee, name: `poleyn${s > 0 ? "L" : "R"}` });
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.012, 10), ENGR, { at: add(knee.at, 0.064 * s, 0, 0), rotation: [0, 0, 90], bone: knee });
    b.capsule(knee.at, ankle.at, [0.066, 0.05], { color: STEEL, bone: knee, sides: 10 });
    const x = ankle.at.x;
    b.frustumBox([x, 0.055, -0.07], [x, 0.03, 0.19], [0.11, 0.11], [0.08, 0.06], { color: STEEL, bone: ankle, name: `sabaton${s > 0 ? "L" : "R"}` });
    for (const f of [0.35, 0.55, 0.75]) {
      const z = -0.07 + 0.26 * f;
      const yt = 0.11 + (0.06 - 0.11) * f;
      const w = 0.11 + (0.08 - 0.11) * f;
      b.part(new THREE.BoxGeometry(w + 0.01, 0.012, 0.022), ENGR, { at: [x, yt + 0.001, z], rotation: [11, 0, 0], bone: ankle });
    }
    b.frustumBox([x, 0.01, -0.078], [x, 0.01, 0.197], [0.116, 0.02], [0.086, 0.02], { color: LEATHER, bone: ankle });
  }

  // ---------------------------------------------------------------- arms & pauldrons
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const [sh, el, wr, hd] = arms.get(S)!.joints;
    b.capsule(sh.at, el.at, [0.058, 0.05], { color: STEEL, bone: sh, sides: 10 });
    b.part(new THREE.SphereGeometry(0.056, 10, 7), ENGR, { at: el.at, bone: el, name: `couter${S}` });
    b.part(new THREE.CylinderGeometry(0.048, 0.048, 0.012, 10), ENGR, { at: add(el.at, 0, 0, -0.056), rotation: [90, 0, 0], bone: el });
    b.capsule(el.at, wr.at, [0.05, 0.042], { color: STEEL, bone: el, sides: 10 });
    b.lathe([[0.042, -0.005], [0.05, -0.005], [0.07, 0.075], [0.062, 0.078]], {
      at: wr.at,
      axis: el.at.sub(wr.at),
      color: ENGR,
      bone: wr,
      segments: 10,
    });
    b.frustumBox(wr.at, hd.at, [0.08, 0.075], [0.075, 0.07], { color: STEEL, bone: wr, up: [0, 1, 0], name: `gauntlet${S}` });
    const fistTop = wr.at.lerp(hd.at, 0.6);
    b.part(new THREE.BoxGeometry(0.05, 0.012, 0.075), GOLD, { at: add(fistTop, 0, 0.04, 0), bone: wr });
    b.capsule(add(wr.at, 0.02 * s, 0.0, 0.035), add(fistTop, 0.01 * s, 0.01, 0.05), 0.016, { color: STEEL, bone: wr, sides: 6 });

    // layered lames over the upper arm
    const D = el.at.sub(sh.at).normalize();
    const fdir = V(0, -0.35, 0.94);
    fdir.addScaledVector(D, -fdir.dot(D)).normalize();
    for (let k = 0; k < 4; k++) {
      const ck = sh.at.addScaledVector(D, 0.1 + 0.045 * k).add(V(0, 0.005, 0));
      const Rk = 0.09 - 0.004 * k;
      const ang = s > 0 ? -220 : 220;
      b.sweep(arc(ck, ck.clone().addScaledVector(fdir, Rk), D, ang), (): [number, number] => [0.0075, 0.028], {
        section: "box",
        up: D,
        color: ENGR,
        bone: sh,
        caps: "flat",
        name: `pauldronLame${S}${k + 1}`,
      });
      const ce = ck.clone().addScaledVector(D, 0.028);
      b.sweep(arc(ce, ce.clone().addScaledVector(fdir, Rk + 0.004), D, ang), 0.0055, { color: GOLD, sides: 5, bone: sh });
    }
    // dome cap
    const A = V(0.35 * s, 1, 0).normalize();
    const c0 = add(sh.at, 0.04 * s, 0.035, 0);
    b.lathe(
      [[0, 0.09], [0.065, 0.08], [0.108, 0.05], [0.128, 0.005], [0.132, -0.015], [0.118, -0.015], [0.114, 0.0], [0.096, 0.04], [0.058, 0.068], [0, 0.076]],
      { at: c0, axis: A, color: ENGR, bone: sh, segments: 14, name: `pauldron${S}` },
    );
    b.part(new THREE.TorusGeometry(0.131, 0.006, 5, 20), GOLD, { at: c0.clone().addScaledVector(A, -0.012), dir: A, axis: "z", bone: sh });
    b.part(new THREE.IcosahedronGeometry(0.014, 0), GOLD, { at: c0.clone().addScaledVector(A, 0.09), bone: sh, flat: true });
  }

  // ---------------------------------------------------------------- sword (right hand)
  {
    const [, , wr, hd] = arms.get("R")!.joints;
    const hc = wr.at.lerp(hd.at, 0.55);
    b.rod(add(hc, 0, 0, -0.075), add(hc, 0, 0, 0.068), 0.017, { color: LEATHER, bone: wr, sides: 6, name: "swordGrip" });
    for (const dz of [-0.05, -0.02, 0.01, 0.04]) b.part(new THREE.TorusGeometry(0.017, 0.003, 4, 8), GOLD, { at: add(hc, 0, 0, dz), bone: wr });
    b.part(new THREE.IcosahedronGeometry(0.032, 0), GOLD, { at: add(hc, 0, 0, -0.1), bone: wr, flat: true, name: "pommel" });
    b.frustumBox(add(hc, 0, -0.13, 0.08), add(hc, 0, 0.13, 0.08), [0.024, 0.022], [0.024, 0.022], { color: GOLD, bone: wr, name: "crossguard" });
    for (const dy of [-0.135, 0.135]) b.part(new THREE.IcosahedronGeometry(0.02, 0), GOLD, { at: add(hc, 0, dy, 0.08), bone: wr, flat: true });
    b.part(new THREE.IcosahedronGeometry(0.016, 0), "#a0101e", { at: add(hc, 0, 0, 0.08), bone: wr, flat: true });
    b.extrude(
      [[0, -0.026], [0.3, -0.0245], [0.42, -0.0237], [0.445, -0.016], [0.465, -0.0235], [0.74, -0.022], [0.86, 0, "sharp"], [0.74, 0.022], [0.58, 0.0228], [0.6, 0.016], [0.615, 0.0226], [0, 0.026]],
      { at: add(hc, 0, 0, 0.085), x: [0, 0, 1], y: [0, 1, 0], thickness: 0.011, bevel: 0.004, color: BLADE, bone: wr, name: "swordBlade" },
    );
  }

  // ---------------------------------------------------------------- kite shield (left forearm)
  {
    const C = V(0.62, 1.2, 0.12);
    const KITE: number[][] = [
      [0, 0.42], [-0.13, 0.405], [-0.25, 0.36], [-0.245, 0.15], [-0.215, -0.05], [-0.16, -0.25], [-0.09, -0.42],
      [0, -0.58], [0.09, -0.42], [0.16, -0.25], [0.215, -0.05], [0.245, 0.15], [0.25, 0.36], [0.13, 0.405],
    ];
    const shield = b.extrude(KITE, { at: C, x: [1, 0, 0], y: [0, 1, 0], thickness: 0.035, bevel: 0.008, color: SHIELD, bone: "elbowL", name: "shield" });
    const rimPath = polyline(KITE.map(([u, v]) => [C.x + u, C.y + v, C.z]), { closed: true });
    b.sweep(rimPath, 0.016, { color: STEEL, sides: 6, bone: "elbowL", name: "shieldRim" });
    b.along(rimPath, 18, (pt) => {
      const p = pt.at;
      const inward = C.clone().sub(p).setZ(0).normalize();
      b.part(new THREE.IcosahedronGeometry(0.009, 0), GOLD, { at: p.addScaledVector(inward, 0.035).add(V(0, 0, 0.019)), bone: "elbowL", flat: true });
    });
    b.decal(shield, griffinTex, { at: [C.x, C.y + 0.03, C.z + 0.05], dir: [0, 0, 1], size: [0.34, 0.41], name: "shieldGriffin" });
    for (const x of [0.55, 0.68]) b.part(new THREE.BoxGeometry(0.03, 0.02, 0.11), LEATHER, { at: [x, 1.355, 0.05], bone: "elbowL" });
    // a broken arrow stuck in the shield
    const B0 = V(C.x - 0.07, C.y - 0.32, C.z + 0.0175);
    const dir = V(0.35, 0.3, 1).normalize();
    b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.004, 8), "#1a1410", { at: add(B0, 0, 0, 0.001), rotation: [90, 0, 0], bone: "elbowL" });
    const end = B0.clone().addScaledVector(dir, 0.2);
    b.rod(B0.clone().addScaledVector(dir, -0.02), end, 0.006, { color: "#6b4a2b", bone: "elbowL", sides: 5, name: "brokenArrow" });
    b.spike(end, V(0.5, 0.2, 1), 0.035, 0.005, { color: "#8a6a45", bone: "elbowL", sides: 4 });
  }

  // ---------------------------------------------------------------- great helm
  const HC = V(0, 1.57, 0.01);
  const helm = b.lathe([[0, -0.05], [0.128, -0.05], [0.133, 0.06], [0.129, 0.2], [0.112, 0.262], [0, 0.272]], {
    at: HC,
    color: STEEL,
    bone: "head",
    segments: 14,
    name: "greatHelm",
  });
  const torusArc = (r: number, tube: number, arcDeg: number) => {
    const g = new THREE.TorusGeometry(r, tube, 6, 18, arcDeg * DEG);
    g.rotateZ((90 - arcDeg / 2) * DEG);
    g.rotateX(Math.PI / 2);
    return g;
  };
  b.part(torusArc(0.127, 0.011, 120), DARK, { at: [0, HC.y + 0.11, HC.z], bone: "head", name: "eyeSlit" });
  b.part(torusArc(0.132, 0.008, 130), GOLD, { at: [0, HC.y + 0.132, HC.z], bone: "head", name: "browRidge" });
  b.part(torusArc(0.132, 0.007, 130), STEEL, { at: [0, HC.y + 0.088, HC.z], bone: "head" });
  b.frustumBox([0, HC.y + 0.142, HC.z + 0.134], [0, HC.y + 0.225, HC.z + 0.128], [0.026, 0.012], [0.022, 0.012], { color: GOLD, bone: "head" });
  b.frustumBox([0, HC.y - 0.04, HC.z + 0.134], [0, HC.y + 0.08, HC.z + 0.136], [0.03, 0.012], [0.026, 0.012], { color: GOLD, bone: "head" });
  b.ring(frame([0, HC.y - 0.03, HC.z], [0, 1, 0]), { count: 14, radius: 0.129 }, (item) => {
    b.stick(new THREE.IcosahedronGeometry(0.008, 0), GOLD, item, { bone: "head", embed: 0.5, flat: true });
  });
  b.ring(frame([0, HC.y + 0.235, HC.z], [0, 1, 0]), { count: 10, radius: 0.123 }, (item) => {
    b.stick(new THREE.IcosahedronGeometry(0.007, 0), GOLD, item, { bone: "head", embed: 0.5, flat: true });
  });
  const around = b.surface(helm).around(V(0, HC.y + 0.05, HC.z));
  for (const az of [-28, -38, -48]) {
    for (const el of [-10, -18, -26]) {
      const hit = around.at(az, el);
      if (hit) b.stick(new THREE.CylinderGeometry(0.0055, 0.0055, 0.01, 6), DARK, hit, { bone: "head", embed: 0.6 });
    }
  }
  // plume
  b.part(new THREE.CylinderGeometry(0.02, 0.028, 0.05, 8), GOLD, { at: [0, HC.y + 0.29, HC.z - 0.01], bone: "head", name: "plumeHolder" });
  for (let i = 0; i < 9; i++) {
    const a = (i - 4) / 4;
    const x = a * 0.022;
    const lift = (1 - Math.abs(a)) * 0.04 + R() * 0.02;
    const path = bezier(
      [x, HC.y + 0.305, HC.z - 0.01],
      [x * 1.5, HC.y + 0.6 + lift, HC.z + 0.02],
      [x * 2.6, HC.y + 0.62 + lift, HC.z - 0.22],
      [x * 3.2, HC.y + 0.4 + R() * 0.05, HC.z - 0.4 - R() * 0.05],
    );
    b.sweep(path, [0.012, 0.03, 0.026, 0.004], { color: PLUME, sides: 6, bone: "head", name: `plume${i + 1}` });
  }

  // ---------------------------------------------------------------- torn cape
  b.rod([-0.25, 1.465, -0.15], [0.25, 1.465, -0.15], 0.022, { color: CRIMSON, bone: "chest", sides: 8, caps: "round", name: "capeRoll" });
  const ends = [0.5, 0.36, 0.45, 0.31, 0.47, 0.38, 0.54];
  for (let i = 0; i < 7; i++) {
    const x0 = -0.24 + i * 0.08;
    const path = catmull([
      [x0, 1.46, -0.155],
      [x0 * 1.12, 1.15, -0.225],
      [x0 * 1.22, 0.82, -0.265],
      [x0 * 1.3, ends[i], -0.285 - 0.01 * R()],
    ]);
    b.sweep(path, (t): [number, number] => [0.047 - 0.01 * t, 0.006], {
      section: "box",
      up: [0, 0, 1],
      color: CRIMSON,
      bone: cape,
      caps: { start: "flat", end: "point" },
      name: `capeStrip${i + 1}`,
    });
  }

  return b.root;
}
