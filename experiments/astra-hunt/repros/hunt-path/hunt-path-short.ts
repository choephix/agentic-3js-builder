import { arc, bezier, catmull, polyline } from "../../../../src/path";
for (const d of [1e-8, 1e-9, 1e-10, 1e-12]) {
  for (const [name, make] of [
    ["polyline", () => polyline([[0, 0, 0], [d, 0, 0]])],
    ["bezier", () => bezier([0, 0, 0], [d / 2, 0, 0], [d, 0, 0])],
    ["catmull", () => catmull([[0, 0, 0], [d, 0, 0], [2 * d, 0, 0]])],
    ["arc", () => arc([0, 0, 0], [d, 0, 0], [0, 1, 0], 90)],
  ] as const) {
    try {
      const p = make();
      console.log(name, d, "OK", p.length, p.at(.5).toArray());
    } catch (error) {
      console.log(name, d, "ERR", String(error));
    }
  }
}
