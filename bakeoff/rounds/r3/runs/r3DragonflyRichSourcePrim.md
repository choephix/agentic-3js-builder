```ts
import * as THREE from "three";
import { createBuilder, paint, patches, scales, stripes, gradient } from "agentic-3js-builder";

export const meta = {
  name: "Emperor Dragonfly Over a Pond",
  description:
    "An emperor dragonfly hovering above a small pond: electric-blue abdomen with black markings, apple-green thorax, wraparound turquoise eyes, four veined golden-glass wings held flat, six legs tucked under.",
};

export default function build() {
  const b = createBuilder({ name: "emperorDragonfly" });
  const H = 0.22; // hover height of the thorax
  const root = b.joint("thorax", { at: [0, H, 0], dir: [0, 0, 1] });

  const add = (geo: THREE.BufferGeometry, color: any, at: number[], bone: string, o: any = {}) =>
    b.part(geo, color, { at, bone, ...o });
  const sphere = (w = 10, h = 8) => new THREE.SphereGeometry(1, w, h);
  const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);

  // ---------- Thorax ----------
  const thoraxPaint = stripes("#8fd630", "#2f6a1c", { size: 0.006, axis: "z", width: 0.14, wobble: 0.25, seed: 3 });
  add(sphere(12, 9), thoraxPaint, [0, H, 0], "thorax", { scale: [0.0088, 0.0098, 0.0128], name: "thoraxBody" });
  add(box(0.009, 0.003, 0.016), "#3b2a14", [0, H - 0.0085, 0], "thorax", { name: "sternum" });
  add(box(0.008, 0.002, 0.012), "#26331a", [0, H + 0.0092, -0.001], "thorax", { name: "notum" });

  // ---------- Head ----------
  const head = b.joint("head", { parent: "thorax", at: [0, H + 0.002, 0.014], dir: [0, 0, 1], role: "head" });
  const eyePaint = scales(["#27d3c9", "#1fc2c8", "#38e0cf"], "#13808c", { size: 0.0022, width: 0.2, seed: 5 });
  for (const sx of [1, -1]) {
    add(sphere(12, 9), eyePaint, [sx * 0.0072, H + 0.004, 0.0275], "head", {
      scale: [0.0088, 0.0098, 0.0098],
      name: sx > 0 ? "eyeL" : "eyeR",
    });
  }
  add(sphere(8, 6), "#9ed43a", [0, H + 0.0005, 0.0345], "head", { scale: [0.0062, 0.0058, 0.0048], name: "frons" });
  add(box(0.0085, 0.0013, 0.0035), "#14140c", [0, H + 0.0042, 0.0345], "head", { name: "tMark" });
  add(box(0.0016, 0.0035, 0.0022), "#14140c", [0, H + 0.0028, 0.0352], "head", { name: "tStem" });
  add(box(0.007, 0.0028, 0.003), "#e0ea72", [0, H - 0.0032, 0.0378], "head", { name: "labrum" });
  add(sphere(6, 5), "#2a8a58", [0, H + 0.0095, 0.0245], "head", { scale: [0.0035, 0.0018, 0.003], name: "vertex" });
  for (const sx of [1, -1]) {
    b.rod([sx * 0.0025, H + 0.0072, 0.0375], [sx * 0.0035, H + 0.0095, 0.0415], 0.0002, {
      color: "#1a1a10",
      bone: "head",
      sides: 4,
    });
  }

  const jaw = b.joint("jaw", { parent: "head", at: [0, H - 0.0045, 0.0345], dir: [0, 0, 1], role: "jaw" });
  add(box(0.0075, 0.0022, 0.0045), "#b99a2a", [0, H - 0.0058, 0.0378], "jaw", { name: "labium" });
  for (const sx of [1, -1]) {
    add(box(0.0022, 0.0022, 0.0035), "#2a1c10", [sx * 0.0042, H - 0.0042, 0.0355], "jaw", { name: "mandible" });
  }

  // ---------- Abdomen ----------
  const tailPath = [
    [0, H - 0.0005, -0.009],
    [0, H + 0.0006, -0.03],
    [0, H - 0.0006, -0.057],
  ];
  const tail = b.chain("tail", tailPath, { parent: "thorax", count: 8, role: "tail", up: [0, 1, 0] });
  const abdPaint = paint((p, n, s) => {
    const t = s[0];
    const d = Math.min(s[1], 360 - s[1]);
    if (t < 0.13) return n.y < -0.4 ? "#5fae3a" : "#7fd04a";
    const f = (t * 9) % 1;
    const ring = f < 0.06 || f > 0.94;
    const tri = f < 0.55 && d < 18 + 60 * (0.55 - f);
    if (ring || d < 15 || (tri && d < 55)) return "#0a0a14";
    if (n.y < -0.5) return "#2a58cf";
    return "#1c6dff";
  });
  b.sweep(
    tail,
    [0.0058, 0.0071, 0.006, 0.0042, 0.0039, 0.0037, 0.0036, 0.0036, 0.0035, 0.0034, 0.0032, 0.0029, 0.0025],
    { color: abdPaint, sides: 8, caps: "round", name: "abdomen" },
  );
  const tailEnd = tail.joints[tail.joints.length - 1];
  for (const sx of [1, -1]) {
    b.rod([sx * 0.0012, H - 0.0006, -0.0575], [sx * 0.0022, H - 0.0006, -0.0635], [0.0006, 0.0002], {
      color: "#10101a",
      bone: tailEnd,
      sides: 4,
    });
  }

  // ---------- Wings ----------
  const wingDefs = [
    { id: "FL", sx: 1, z: 0.004, fore: true },
    { id: "FR", sx: -1, z: 0.004, fore: true },
    { id: "HL", sx: 1, z: -0.006, fore: false },
    { id: "HR", sx: -1, z: -0.006, fore: false },
  ];
  const foreOutline: [number, number][] = [
    [0, 0.0035], [0.01, 0.0043], [0.03, 0.0048], [0.045, 0.0034], [0.0525, 0], [0.046, -0.0045],
    [0.03, -0.0082], [0.012, -0.0092], [0, -0.0065],
  ];
  const hindOutline: [number, number][] = [
    [0, 0.003], [0.015, 0.004], [0.035, 0.0036], [0.0505, 0], [0.0455, -0.006],
    [0.03, -0.011], [0.012, -0.0138], [0, -0.0115],
  ];
  wingDefs.forEach((w, i) => {
    const root0 = [w.sx * 0.006, H + 0.0075, w.z];
    const name = "wing" + w.id;
    b.joint(name, { parent: "thorax", at: root0, dir: [w.sx, 0.04, 0], role: "wing" });
    const tint = gradient(w.fore ? "#ecd37f" : "#e3b95c", "#e4eee8", root0, [w.sx * 0.056, H + 0.0075, w.z]);
    const wp = patches("#2a2216", [tint, "#eaeddc", "#efe9c2"], { size: 0.0042, gap: 0.1, seed: 11 + i });
    b.extrude(w.fore ? foreOutline : hindOutline, {
      color: wp,
      at: root0,
      x: [w.sx, 0.05, 0],
      y: [0, 0, 1],
      thickness: 0.0005,
      smoothing: 1,
      bone: name,
      name: "membrane" + w.id,
    });
    const front = w.fore ? 0.0042 : 0.0036;
    b.rod([w.sx * 0.006, H + 0.0078, w.z + 0.0032], [w.sx * 0.052, H + 0.0095, w.z + front * 0.8], 0.00035, {
      color: "#2a2216",
      bone: name,
      sides: 4,
      name: "costa" + w.id,
    });
    add(box(0.003, 0.0007, 0.0012), "#3a2a14", [w.sx * 0.046, H + 0.0092, w.z + front - 0.0008], name, {
      name: "pterostigma" + w.id,
    });
    add(box(0.0035, 0.0018, 0.004), "#26331a", [w.sx * 0.006, H + 0.0085, w.z], name, { name: "wingBase" + w.id });
  });

  // ---------- Legs ----------
  const legZ = [0.011, 0.001, -0.009];
  for (const [sx, side] of [[1, "L"], [-1, "R"]] as const) {
    legZ.forEach((z, k) => {
      const reach = k === 0 ? 1 : k === 1 ? 0.6 : 0.2;
      const pts = [
        [sx * 0.004, H - 0.0065, z],
        [sx * 0.0085, H - 0.0105, z + 0.008 * reach + 0.002],
        [sx * 0.0075, H - 0.0185, z + 0.001],
        [sx * 0.0058, H - 0.0205, z - 0.0035 - 0.002 * (1 - reach)],
      ];
      const nm = (s: string) => `${s}${side}${k + 1}`;
      const ch = b.chain(`leg${side}${k + 1}`, pts, {
        parent: "thorax",
        names: [nm("hip"), nm("knee"), nm("ankle")],
        role: "leg",
      });
      b.sweep(ch, [0.0011, 0.0008, 0.0006, 0.0004], {
        color: k === 0 ? "#2b2418" : "#33271a",
        sides: 5,
        caps: "round",
        name: `leg${side}${k + 1}`,
      });
    });
  }

  // ---------- Pond ----------
  b.joint("pond", { parent: "thorax", at: [0, 0, 0], dir: [0, 1, 0] });
  const pondGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.012, 28);
  add(pondGeo, "#1b4d5a", [0, 0.006, 0], "pond", { name: "water" });
  const bank = new THREE.TorusGeometry(0.14, 0.007, 5, 28);
  bank.rotateX(Math.PI / 2);
  add(bank, "#5b6a3a", [0, 0.008, 0], "pond", { name: "bank" });
  for (const r of [0.025, 0.05, 0.08]) {
    const t = new THREE.TorusGeometry(r, 0.0005, 3, 32);
    t.rotateX(Math.PI / 2);
    add(t, "#a9d3d0", [0, 0.0125, 0], "pond", { name: "ripple" });
  }
  add(new THREE.CylinderGeometry(0.026, 0.026, 0.002, 12), "#3f8f3a", [-0.07, 0.013, -0.05], "pond", { name: "lilyPad" });
  add(new THREE.ConeGeometry(0.006, 0.01, 6), "#f08ab0", [-0.07, 0.019, -0.05], "pond", { name: "lilyFlower" });
  const reeds: [number, number, number][] = [[0.11, -0.05, 0.19], [0.118, -0.035, 0.15], [0.1, -0.07, 0.17]];
  reeds.forEach(([x, z, h], i) => {
    b.rod([x, 0.005, z], [x + 0.004 * (i - 1), h, z + 0.002], [0.0018, 0.0008], {
      color: "#4f7a2c",
      bone: "pond",
      sides: 5,
    });
  });
  b.capsule([0.1145, 0.13, -0.0485], [0.1155, 0.162, -0.0485], 0.0055, { color: "#5a3a1c", bone: "pond", sides: 6 });
  b.rod([0.118, 0.01, -0.03], [0.14, 0.09, -0.02], [0.002, 0.0004], { color: "#5b8a34", bone: "pond", sides: 4 });
  b.rod([0.1, 0.01, -0.08], [0.085, 0.1, -0.1], [0.002, 0.0004], { color: "#5b8a34", bone: "pond", sides: 4 });

  return b.root;
}
```