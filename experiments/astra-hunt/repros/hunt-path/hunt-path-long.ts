import { arc, spiral } from "../../../../src/path";
for (const deg of [1e4, 1e5, 1e6]) {
  const started = performance.now();
  const p = arc([0, 0, 0], [1, 0, 0], [0, 1, 0], deg);
  console.log("arc", deg, "samples", p.knots.length, "ms", Math.round(performance.now() - started), "length", p.length);
}
for (const turns of [10, 100, 1000]) {
  const started = performance.now();
  const p = spiral([0, 0, 0], [1, 0, 0], [0, 1, 0], { turns });
  console.log("spiral", turns, "knots", p.knots.length, "ms", Math.round(performance.now() - started), "length", p.length);
}
