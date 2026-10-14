import * as THREE from "three";
import { createBuilder, rng, paint, patches, mottle, countershade, scales } from "../../../../src/index";

export const meta = {
  name: "Green Sea Turtle",
  description:
    "A green sea turtle with a heart-shaped olive and caramel scute shell, a pale yellow plastron, a cream-scaled head, long front flippers, short rear flippers and a remora riding underneath.",
};

export default function build() {
  const b = createBuilder({ name: "greenSeaTurtle" });
  const Y = 0.27; // body centre height
  const sphere = (r: number, s = 10, t = 8) => new THREE.SphereGeometry(r, s, t);

  // ---------- skeleton ----------
  b.joint("root", { at: [0, Y, 0] });
  b.chain("spine", [[0, Y, -0.3], [0, Y, 0], [0, Y, 0.3]], {
    parent: "root", names: ["spine1", "spine2"], role: "spine",
  });

  // ---------- shell ----------
  const olive = "#6b6a2c";
  const caramel = "#b98a3e";
  const carapace = patches(
    "#4a2f17",
    [
      mottle(olive, caramel, { size: 0.12, seed: 2 }),
      mottle("#8a7a30", "#a5702c", { size: 0.1, seed: 5 }),
      mottle("#5f6228", "#c19445", { size: 0.14, seed: 8 }),
      mottle("#7c6b2a", caramel, { size: 0.09, seed: 11 }),
    ],
    { size: 0.17, gap: 0.1, seed: 3 },
  );
  const plastron = patches("#b9a860", ["#f1e7a3", "#ead98c", "#f4ecb4"], { size: 0.2, gap: 0.05, seed: 4 });
  const shellPaint = paint((p, n) => (n.y < -0.25 ? plastron : carapace));

  const st: Array<[number, number, number]> = [
    [-0.52, 0.08, 0.08],
    [-0.4, 0.4, 0.22],
    [-0.2, 0.66, 0.3],
    [0.05, 0.8, 0.34],
    [0.25, 0.76, 0.3],
    [0.4, 0.56, 0.2],
    [0.47, 0.3, 0.12],
  ];
  const shell = b.loft(
    st.map(([z, w, h]) => ({ at: [0, Y, z], w, h })),
    { color: shellPaint, bone: "root", sides: 16, name: "shell" },
  );
  // vertebral keel ridge
  b.sweep(st.slice(1, 6).map(([z, , h]) => [0, Y + h / 2 + 0.004, z] as [number, number, number]), 0.02, {
    color: "#6a4a22", bone: "root", sides: 6, name: "keel",
  });
  // barnacles
  const spots = b.surface(shell).scatter(7, { rng: rng(5), minDist: 0.15, filter: (h) => h.n.y > 0.6 });
  spots.forEach((h) => b.stick(new THREE.ConeGeometry(0.02, 0.03, 6), "#e8e2d0", h, { embed: 0.3 }));

  // ---------- neck & head ----------
  const neck = b.chain("neck", [[0, Y, 0.4], [0, Y + 0.03, 0.55], [0, Y + 0.07, 0.68]], {
    parent: "root", names: ["neck1", "neck2", "head"], role: "neck",
  });
  const skinPaint = countershade(mottle("#6d6a2e", "#8a7a35", { size: 0.06, seed: 6 }), "#e9dca0", { soft: 0.5 });
  b.sweep(neck, (t) => 0.09 - 0.012 * t, { color: skinPaint, sides: 10 });
  const headPaint = scales(["#6d6a2e", "#7b7432", "#8c7a35"], "#efe4b4", { size: 0.04, width: 0.22, seed: 9 });
  b.part(sphere(1, 14, 10), headPaint, { at: [0, Y + 0.1, 0.79], scale: [0.1, 0.094, 0.126], bone: "head", name: "skull" });
  b.part(sphere(1, 12, 8), "#8f7a3c", { at: [0, Y + 0.075, 0.905], scale: [0.054, 0.036, 0.06], bone: "head", name: "upperBeak" });
  b.part(new THREE.ConeGeometry(0.016, 0.04, 5), "#7a6630", { at: [0, Y + 0.05, 0.955], dir: [0, -1, 0.35], bone: "head", name: "beakHook" });
  b.joint("jaw", { parent: "head", at: [0, Y + 0.05, 0.8], dir: [0, 0, 1], role: "jaw" });
  b.part(sphere(1, 12, 8), "#e9dca0", { at: [0, Y + 0.032, 0.88], scale: [0.046, 0.017, 0.07], bone: "jaw", name: "lowerBeak" });
  for (const s of [1, -1]) {
    const nm = s > 0 ? "L" : "R";
    b.part(sphere(0.03), "#15110d", { at: [s * 0.088, Y + 0.125, 0.84], bone: "head", name: "eye" + nm });
    b.part(sphere(0.009, 6, 5), "#ffffff", { at: [s * 0.108, Y + 0.134, 0.855], bone: "head", name: "glint" + nm });
    b.part(sphere(0.032, 8, 6), "#7a7230", { at: [s * 0.085, Y + 0.155, 0.82], scale: [1, 0.5, 1.5], bone: "head", name: "brow" + nm });
    b.part(sphere(0.008, 5, 4), "#1e1810", { at: [s * 0.018, Y + 0.088, 0.952], bone: "head", name: "nostril" + nm });
  }

  // ---------- flippers ----------
  const flipperSkin = countershade(mottle("#66652b", "#9a7a35", { size: 0.08, seed: 12 }), "#e8dca0", { soft: 0.5 });
  for (const s of [1, -1]) {
    const nm = s > 0 ? "L" : "R";
    const front = b.chain(
      "flipperF" + nm,
      [[s * 0.3, Y - 0.02, 0.22], [s * 0.55, Y - 0.04, 0.3], [s * 0.85, Y, 0.22], [s * 1.05, Y + 0.06, 0.08]],
      { parent: "root", up: [0, 1, 0], names: ["shoulder" + nm, "elbow" + nm, "wrist" + nm], role: "arm" },
    );
    b.sweep(front, (t) => [0.03 + 0.08 * Math.sin(Math.PI * Math.pow(t, 0.8)), 0.028 - 0.014 * t], {
      color: flipperSkin, sides: 8, name: "frontFlipper" + nm,
    });
    b.part({ geometry: new THREE.ConeGeometry(0.014, 0.05, 5), color: "#3d3523", frame: front.at(1), name: "claw" + nm });

    const rear = b.chain(
      "flipperB" + nm,
      [[s * 0.2, Y - 0.03, -0.35], [s * 0.34, Y - 0.05, -0.5], [s * 0.46, Y - 0.03, -0.64]],
      { parent: "root", up: [0, 1, 0], names: ["hip" + nm, "knee" + nm], role: "leg", contact: [s * 0.46, Y - 0.03, -0.64] },
    );
    b.sweep(rear, (t) => [0.025 + 0.05 * Math.sin(Math.PI * Math.pow(t, 0.8)), 0.02 - 0.008 * t], {
      color: flipperSkin, sides: 8, name: "rearFlipper" + nm,
    });
  }

  // ---------- tail ----------
  const tail = b.chain("tail", [[0, Y - 0.02, -0.48], [0, Y - 0.03, -0.58], [0, Y - 0.04, -0.67]], {
    parent: "root", names: ["tail1", "tail2"], role: "tail",
  });
  b.sweep(tail, [0.035, 0.008], { color: "#6d6a2e", sides: 6 });

  // ---------- remora ----------
  b.joint("remora", { parent: "root", at: [0, 0.035, 0] });
  const fishPaint = paint((p) =>
    Math.abs(p.y - 0.035) < 0.006 ? "#1c1c1c" : p.y > 0.035 ? "#4b4a46" : "#d9d3bd",
  );
  const rs: Array<[number, number, number]> = [
    [-0.2, 0.015, 0.025],
    [-0.12, 0.045, 0.055],
    [-0.02, 0.07, 0.08],
    [0.08, 0.065, 0.075],
    [0.15, 0.045, 0.05],
    [0.19, 0.025, 0.03],
  ];
  b.loft(rs.map(([z, w, h]) => ({ at: [0, 0.035, z], w, h })), { color: fishPaint, bone: "remora", sides: 8, name: "remoraBody" });
  b.extrude([[0, 0], [-0.07, 0.055], [-0.05, 0], [-0.07, -0.055]], {
    color: "#3e3d3a", at: [0, 0.035, -0.2], thickness: 0.008, bone: "remora", name: "remoraTail",
  });
  b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.012, 10), "#3a3a38", {
    at: [0, 0.082, 0.02], scale: [1, 1, 2.6], bone: "remora", name: "sucker",
  });
  [-0.05, 0, 0.05, 0.1].forEach((dz, i) =>
    b.part(new THREE.BoxGeometry(0.07, 0.004, 0.008), "#d8d2c0", { at: [0, 0.089, 0.02 + dz], bone: "remora", name: "suckerRidge" + i }),
  );
  for (const s of [1, -1]) {
    b.part(sphere(0.01, 6, 5), "#050505", { at: [s * 0.025, 0.045, 0.14], bone: "remora", name: "remoraEye" + (s > 0 ? "L" : "R") });
    b.part(sphere(0.035, 8, 6), "#4b4a46", {
      at: [s * 0.05, 0.03, 0.06], scale: [1, 0.15, 1.2], rotation: [0, 0, -s * 25], bone: "remora", name: "remoraFin" + (s > 0 ? "L" : "R"),
    });
  }

  return b.root;
}
