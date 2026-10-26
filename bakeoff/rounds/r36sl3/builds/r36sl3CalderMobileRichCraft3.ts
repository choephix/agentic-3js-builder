import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Calder Mobile",
  description:
    "A Calder-style hanging mobile: black wire arms in balance, with flat painted shapes in red, yellow, blue, white and black.",
};

const RED = "#d62a1f", YEL = "#f2c230", BLU = "#1f4fa8", WHT = "#f2efe6", BLK = "#151515", WIRE = "#26262a";

type Kind = "ellipse" | "leaf" | "crescent" | "blob" | "disc";
type Item =
  | { k: "s"; kind: Kind; size: number; color: string; yaw: number; drop: number; sq?: number }
  | { k: "a"; len: number; yaw: number; off: number; drop: number; tilt: number; l: Item; r: Item };

const S = (kind: Kind, size: number, color: string, yaw: number, drop: number, sq = 1): Item => ({
  k: "s", kind, size, color, yaw, drop, sq,
});
const A = (len: number, yaw: number, off: number, drop: number, tilt: number, l: Item, r: Item): Item => ({
  k: "a", len, yaw, off, drop, tilt, l, r,
});

function outline(kind: Kind, r: number, sq: number): [number, number][] {
  const p: [number, number][] = [];
  if (kind === "ellipse" || kind === "disc") {
    const n = kind === "disc" ? 16 : 14;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      p.push([Math.cos(a) * r, Math.sin(a) * r * (kind === "disc" ? 1 : 0.55 * sq)]);
    }
  } else if (kind === "leaf") {
    const n = 8;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      p.push([(t * 2 - 1) * r, Math.sin(Math.PI * t) * r * 0.38 * sq]);
    }
    for (let i = n - 1; i >= 1; i--) {
      const t = i / n;
      p.push([(t * 2 - 1) * r, -Math.sin(Math.PI * t) * r * 0.38 * sq]);
    }
  } else if (kind === "blob") {
    const n = 18;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const rr = r * (1 + 0.25 * Math.cos(3 * a));
      p.push([Math.cos(a) * rr * 0.9, Math.sin(a) * rr * 0.7 * sq]);
    }
  } else {
    for (let a = 90; a <= 270; a += 20) p.push([Math.cos((a * Math.PI) / 180) * r, Math.sin((a * Math.PI) / 180) * r]);
    for (let t = -115; t <= 115; t += 23)
      p.push([0.45 * r + 0.85 * r * Math.cos((t * Math.PI) / 180), 0.85 * r * Math.sin((t * Math.PI) / 180)]);
  }
  return p;
}

export default function build() {
  const b = createBuilder({ name: "mobile" });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const wire = (a: THREE.Vector3, c: THREE.Vector3, r = 0.003) => b.rod(a, c, r, WIRE, { sides: 6 });
  const bead = (p: THREE.Vector3, r = 0.012, c = BLK) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), c, { at: [p.x, p.y, p.z], bone: undefined as never });

  function place(item: Item, p: THREE.Vector3) {
    const yaw = (item.yaw * Math.PI) / 180;
    const d = V(Math.cos(yaw), 0, -Math.sin(yaw));
    if (item.k === "s") {
      const pts = outline(item.kind, item.size, item.sq ?? 1);
      const h = Math.max(...pts.map((q) => q[1]));
      b.extrude(pts, {
        at: [p.x, p.y - h - 0.004, p.z],
        x: [d.x, 0, d.z],
        thickness: 0.012,
        color: item.color,
        bevel: 0.002,
      });
      // hang loop on top
      bead(V(p.x, p.y - 0.002, p.z), 0.008, WIRE);
      return;
    }
    const e1 = p.clone().addScaledVector(d, -item.len * item.off).add(V(0, -item.tilt, 0));
    const e2 = p.clone().addScaledVector(d, item.len * (1 - item.off)).add(V(0, item.tilt, 0));
    b.rod(e1, e2, 0.005, BLK, { sides: 6 });
    bead(p, 0.014, BLK);
    for (const [e, c] of [[e1, item.l], [e2, item.r]] as const) {
      const q = e.clone().add(V(0, -c.drop, 0));
      bead(e, 0.01, BLK);
      wire(e, q);
      place(c, q);
    }
  }

  const tree = A(
    1.5, 20, 0.42, 0.45, 0.04,
    A(
      0.9, -35, 0.5, 0.4, 0.03,
      S("ellipse", 0.3, RED, 10, 0.5),
      A(0.5, 40, 0.5, 0.5, 0.02, S("leaf", 0.22, BLK, -20, 0.35, 1.2), S("disc", 0.1, YEL, 60, 0.25)),
    ),
    A(
      1.1, 70, 0.6, 0.35, -0.03,
      A(0.6, -10, 0.45, 0.45, 0.02, S("disc", 0.14, BLU, 30, 0.4), S("blob", 0.2, YEL, -50, 0.65)),
      A(
        0.7, 15, 0.4, 0.55, 0.03,
        S("crescent", 0.2, WHT, 80, 0.4),
        A(0.4, -60, 0.5, 0.4, 0.02, S("leaf", 0.18, RED, 0, 0.3, 1.3), S("ellipse", 0.12, BLK, 45, 0.55)),
      ),
    ),
  );

  const top = V(0, 2.4, 0);
  wire(V(0, 2.75, 0), top, 0.004);
  b.part(new THREE.TorusGeometry(0.04, 0.005, 6, 12), WIRE, { at: [0, 2.78, 0], rotation: [0, 0, 0] });
  place(tree, top);

  // keep the hanging height: lowest point about 0.3 m above the floor
  const box = new THREE.Box3().setFromObject(b.root, true);
  b.root.position.y -= box.min.y - 0.3;
  return b.root;
}
