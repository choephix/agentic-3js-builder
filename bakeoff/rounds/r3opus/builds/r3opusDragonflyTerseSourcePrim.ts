import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  paint,
  scales,
  limb,
  catmull,
  svg,
  mix,
  smoothstep,
} from "../../../../src/index";

export const meta = {
  name: "Azure Dragonfly",
  description:
    "A life-size dragonfly in a rest pose: four glassy veined wings spread flat, six spiny legs planted on the ground, a striped green thorax, a long segmented sky-blue abdomen and huge faceted turquoise eyes.",
};

const BLACK = "#121417";
const LEG = "#17191c";
const LEG_BROWN = "#4a3524";
const GREEN = "#6cc13a";
const PALE = "#d9e37c";

function wingSvg(hind: boolean) {
  const r = rng(hind ? 11 : 7);
  const outline = hind
    ? "M12,400 L7,70 Q8,8 38,7 Q82,14 92,95 Q99,250 97,335 Q93,392 62,400 Z"
    : "M12,400 L7,62 Q8,6 38,7 Q76,12 87,80 Q93,200 82,320 Q74,384 46,400 Z";
  const veins: string[] = [];
  const n = 7;
  for (let i = 0; i < n; i++) {
    const x0 = 12 + i * (hind ? 7 : 5);
    const x1 = 9 + i * (hind ? 14 : 12.5);
    const x2 = 9 + i * 7;
    veins.push(
      `<path d="M${x0},400 Q${x1},230 ${x2},14" fill="none" stroke="#3d5a6b" stroke-width="${i < 2 ? 2 : 1.2}"/>`,
    );
  }
  const cross: string[] = [];
  for (let y = 22; y < 398; y += 7) {
    const pts: string[] = [];
    for (let x = 4; x <= 100; x += 9 + r() * 5) pts.push(`${x.toFixed(1)},${(y + (r() - 0.5) * 4).toFixed(1)}`);
    cross.push(`<polyline points="${pts.join(" ")}" fill="none" stroke="#5f8090" stroke-width="0.7"/>`);
  }
  const markup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 400">
  <defs>
    <linearGradient id="g" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="#e2a64a"/>
      <stop offset="0.12" stop-color="#e9f2e6"/>
      <stop offset="0.6" stop-color="#d6eef8"/>
      <stop offset="1" stop-color="#c6e4f3"/>
    </linearGradient>
    <clipPath id="c"><path d="${outline}"/></clipPath>
  </defs>
  <path d="${outline}" fill="url(#g)"/>
  <g clip-path="url(#c)">
    ${cross.join("\n")}
    ${veins.join("\n")}
    <rect x="4" y="36" width="12" height="26" fill="#5a2a16" stroke="#2a140a" stroke-width="1.5"/>
    <circle cx="9" cy="210" r="3.5" fill="#22313a"/>
  </g>
  <path d="${outline}" fill="none" stroke="#24343e" stroke-width="2.6"/>
</svg>`;
  return svg(markup, { size: 512 });
}

export default function build() {
  const b = createBuilder({ name: "dragonfly", paintSize: 1024 });
  const up = new THREE.Vector3(0, 1, 0);

  // ---------- skeleton core ----------
  const thorax = b.joint("thorax", { at: [0, 0.0135, 0.012], dir: [0, 0, 1], role: "spine" });
  const head = b.joint("head", { parent: thorax, at: [0, 0.0158, 0.0185], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.0128, 0.0262], dir: [0, -0.4, 1], role: "jaw" });

  // ---------- thorax ----------
  const thoraxPaint = paint((p, n) => {
    if (n.y > 0.55 && Math.abs(p.x) < 0.0009) return BLACK;
    if (n.y < -0.5) return PALE;
    if (Math.abs(n.x) > 0.3) {
      const v = (p.z * 0.8 + p.y * 0.6) / 0.0028;
      const f = v - Math.floor(v);
      if (f < 0.26) return BLACK;
      if (f < 0.34) return "#c6e85a";
    }
    return mix(GREEN, "#8fd651", smoothstep(-0.2, 0.8, n.y));
  });
  b.part(new THREE.SphereGeometry(1, 12, 9), thoraxPaint, {
    at: [0, 0.0135, 0.012],
    scale: [0.0047, 0.0055, 0.0068],
    rotation: [-18, 0, 0],
    bone: thorax,
  });
  // prothorax collar
  b.part(new THREE.SphereGeometry(0.0019, 8, 6), GREEN, { at: [0, 0.0148, 0.0185], bone: thorax, scale: [1.2, 0.9, 0.8] });

  // ---------- head ----------
  const eyeBright = scales(["#38c9e8", "#2aa8d8", "#4fdcf0"], "#0f4f6b", { size: 0.0009, seed: 3 });
  const eyeDark = scales(["#1f7fa6", "#1a6c91"], "#0a3346", { size: 0.0009, seed: 3 });
  const eyePaint = paint((p, n) => (n.y < -0.4 ? eyeDark : eyeBright));
  for (const sx of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.0036, 14, 10), eyePaint, {
      at: [sx * 0.0026, 0.0168, 0.0222],
      scale: [0.95, 1, 1.05],
      bone: head,
    });
    // specular spark
    b.part(new THREE.SphereGeometry(0.00055, 6, 4), "#eafcff", { at: [sx * 0.0034, 0.0196, 0.0238], bone: head });
    // antennae
    b.rod([sx * 0.0008, 0.0172, 0.0252], [sx * 0.0019, 0.0192, 0.0288], [0.00016, 0.0001], { color: BLACK, bone: head });
  }
  // frons / face
  b.part(new THREE.SphereGeometry(1, 10, 7), "#c9de55", { at: [0, 0.0147, 0.0258], scale: [0.0026, 0.0019, 0.0016], bone: head });
  b.part(new THREE.BoxGeometry(0.0016, 0.0005, 0.0008), BLACK, { at: [0, 0.0162, 0.0268], bone: head });
  // ocelli
  for (const [x, z] of [[0, 0.0222], [0.0007, 0.0214], [-0.0007, 0.0214]]) {
    b.part(new THREE.SphereGeometry(0.00035, 6, 4), "#f4d35e", { at: [x, 0.0198, z], bone: head });
  }
  // upper jaw (labrum)
  b.part(new THREE.BoxGeometry(0.0028, 0.0011, 0.0012), "#d7e468", { at: [0, 0.0131, 0.0273], bone: head });
  // lower jaw (labium + mandibles)
  b.part(new THREE.BoxGeometry(0.003, 0.0009, 0.0018), "#b9c94f", { at: [0, 0.0119, 0.0266], bone: jaw });
  for (const sx of [1, -1]) {
    b.spike([sx * 0.0011, 0.0123, 0.0272], [-sx * 0.6, -0.2, 1], 0.0014, 0.00045, { color: "#3a2a12", bone: jaw });
  }

  // ---------- abdomen ----------
  const abdomen = b.chain(
    "abdomen",
    catmull([
      [0, 0.0128, 0.006],
      [0, 0.0131, -0.008],
      [0, 0.0131, -0.022],
      [0, 0.0128, -0.036],
      [0, 0.0123, -0.05],
    ]),
    { parent: thorax, count: 6, names: ["abdomen1", "abdomen2", "abdomen3", "abdomen4", "abdomen5", "abdomen6"], role: "tail" },
  );
  const abdPaint = paint((p, n, s) => {
    const t = s[0];
    const deg = s[1];
    const d = Math.min(deg, 360 - deg);
    if (t > 0.9) return BLACK;
    const seg = t * 9.5 + 0.15;
    const k = Math.floor(seg);
    const f = seg - k;
    if (f < 0.17 && t > 0.06) return BLACK;
    const stripe = 16 + 34 * t;
    if (d < stripe && t > 0.08) return BLACK;
    if (d > stripe && d < stripe + 24 && f > 0.3 && f < 0.6 && t > 0.08 && t < 0.8) return "#c4eeff";
    if (d > 145) return "#1c4f86";
    return mix("#2a86d6", "#5ec6ff", smoothstep(-0.4, 0.9, n.y));
  });
  b.sweep(abdomen, [0.0025, 0.0017, 0.0015, 0.00155, 0.0016, 0.0017, 0.0018, 0.0013], { color: abdPaint, sides: 10 });
  const tipJ = abdomen.joints[abdomen.joints.length - 1];
  for (const sx of [1, -1]) {
    b.spike([sx * 0.0005, 0.0124, -0.0505], [sx * 0.35, 0.1, -1], 0.0026, 0.00032, { color: BLACK, bone: tipJ });
  }

  // ---------- wings ----------
  const foreTex = wingSvg(false);
  const hindTex = wingSvg(true);
  const wings = [
    { id: "F", z: 0.0165, y: 0.0184, ang: 0.14, w: 0.0095, h: 0.041, tex: foreTex },
    { id: "H", z: 0.009, y: 0.0181, ang: -0.12, w: 0.0125, h: 0.039, tex: hindTex },
  ];
  for (const wg of wings) {
    for (const sx of [1, -1]) {
      const sideName = sx > 0 ? "L" : "R";
      const root = new THREE.Vector3(sx * 0.0024, wg.y, wg.z);
      const dir = new THREE.Vector3(sx, 0, wg.ang).normalize();
      const tip = root.clone().addScaledVector(dir, wg.h);
      const chain = b.chain(`wing${wg.id}${sideName}`, [root, tip], {
        parent: thorax,
        names: [`wing${wg.id}${sideName}1`, `wing${wg.id}${sideName}2`],
        role: "wing",
      });
      const bone = chain.joints[0];
      const side = up.clone().cross(dir).normalize();
      // hinge sits at a quarter chord from the leading edge
      const p = root.clone().addScaledVector(side, 0.25 * wg.w);
      b.cards([frame(p, [0, 1, 0])], wg.tex, {
        size: [wg.w, wg.h],
        lean: 90,
        flow: [dir.x, dir.y, dir.z],
        bone,
        sink: 0,
        mirror: sx < 0,
      });
      const planeY = p.y + 0.02 * wg.h;
      const at = (u: number, v: number, lift = 0) =>
        p.clone().addScaledVector(dir, v * wg.h).addScaledVector(side, (u - 0.5) * wg.w).setY(planeY + lift);
      // leading-edge costa, wing base knuckle, pterostigma
      b.rod(at(0.11, 0.0, 0.0001), at(0.075, 0.9, 0.0001), [0.0003, 0.00016], { color: "#1e2a33", bone });
      b.part(new THREE.SphereGeometry(0.0009, 6, 4), "#2c3d2a", { at: at(0.22, 0.01), scale: [1, 0.7, 1], bone });
      b.part(new THREE.BoxGeometry(0.0012, 0.0028, 0.00045), "#6b2f17", {
        at: at(0.1, 0.875, 0.0001),
        dir: [dir.x, dir.y, dir.z],
        up: [0, 1, 0],
        bone,
      });
    }
  }

  // ---------- legs ----------
  const legs = [
    { id: "F", rootZ: 0.0165, foot: [0.008, 0.023], sole: [0.4, 0.9], len: [0.006, 0.0068, 0.0028] },
    { id: "M", rootZ: 0.012, foot: [0.0115, 0.013], sole: [0.4, 0.2], len: [0.0065, 0.007, 0.003] },
    { id: "H", rootZ: 0.008, foot: [0.011, -0.004], sole: [0.4, -0.6], len: [0.008, 0.0088, 0.0032] },
  ];
  for (const lg of legs) {
    for (const sx of [1, -1]) {
      const s = sx > 0 ? "L" : "R";
      const root = new THREE.Vector3(sx * 0.0016, 0.009, lg.rootZ);
      const target = new THREE.Vector3(sx * lg.foot[0], 0.00026, lg.foot[1]);
      const sole = new THREE.Vector3(sx * lg.sole[0], 0, lg.sole[1]).normalize();
      const pts = limb(root, target, lg.len, [sx, 1, 0], { sole });
      const id = `${lg.id}${s}`;
      const chain = b.chain(`leg${id}`, pts, {
        parent: thorax,
        names: [`hip${id}`, `knee${id}`, `ankle${id}`, `foot${id}`],
        role: "leg",
      });
      b.sweep(chain, (t: number) => 0.00055 - 0.0003 * t, {
        color: (t: number) => (t < 0.36 ? LEG_BROWN : LEG),
        sides: 6,
      });
      b.part(new THREE.SphereGeometry(0.0008, 6, 4), GREEN, { at: root, bone: chain.joints[0] });
      // tibial spines
      for (const f of [0.25, 0.5, 0.75]) {
        const base = pts[1].clone().lerp(pts[2], f);
        b.spike(base, [-sx * 0.8, -0.5, 0.25], 0.0011, 0.00011, { color: BLACK, bone: chain.joints[1] });
      }
      // claws
      b.spike(pts[3], [sole.x, -0.4, sole.z], 0.0006, 0.00012, { color: "#5b4a2e", bone: chain.joints[2] });
    }
  }

  return b.root;
}
