import { Vector3 } from "three";
import { limb } from "../../../../src/ik";

const v = (x: number, y: number, z: number) => new Vector3(x, y, z);
const fmt = (p: Vector3) => p.toArray().map((x) => Number(x.toFixed(9)));
const dist = (a: Vector3, b: Vector3) => a.distanceTo(b);
function show(name: string, root: Vector3, target: Vector3, lengths: number[], bends: any, options: any = {}) {
  try {
    const pts = limb(root, target, lengths, bends, options);
    const segs = pts.slice(1).map((p, i) => Number(p.distanceTo(pts[i]).toFixed(9)));
    console.log(JSON.stringify({ name, count: pts.length, points: pts.map(fmt), segs, endError: Number(dist(pts.at(-1)!, target).toFixed(9)), types: pts.map((p) => p.constructor.name) }));
  } catch (e) {
    console.log(JSON.stringify({ name, throw: String(e) }));
  }
}
const root = v(0, 0, 0);
show("2-full", root, v(0, 2, 0), [1, 1], [0, 0, 1]);
show("2-out", root, v(0, 3, 0), [1, 1], [0, 0, 1]);
show("2-root-equal", root, v(0, 0, 0), [1, 1], [0, 0, 1]);
show("2-root-unequal", root, v(0, 0, 0), [2, 1], [0, 0, 1]);
show("3-full", root, v(0, 3, 0), [1, 1, 1], [[0,0,1],[0,0,-1]]);
show("3-short", root, v(0, 1, 0), [1, 1, 1], [[0,0,1],[0,0,-1]]);
show("3-out", root, v(0, 4, 0), [1, 1, 1], [[0,0,1],[0,0,-1]]);
show("4-full", root, v(0, 4, 0), [1, 1, 1, 1], [[0,0,1],[0,0,-1],[0,0,1]]);
show("4-short", root, v(0, 2, 0), [1, 1, 1, 1], [[0,0,1],[0,0,-1],[0,0,1]]);
show("4-out", root, v(0, 5, 0), [1, 1, 1, 1], [[0,0,1],[0,0,-1],[0,0,1]]);
show("parallel-hint", root, v(0, 2.4, 0), [1, .8, .7], [[0,1,0],[0,0,1]]);
show("target-diag", root, v(1, 1, 0), [1, 1], [0,0,1]);
show("mir-left", v(1,1,0), v(1,0,1), [1,.8,.7], [[0,0,1],[0,0,-1]]);
show("mir-right", v(-1,1,0), v(-1,0,1), [1,.8,.7], [[0,0,1],[0,0,-1]]);
show("sole-example", root, v(0, 0, 1), [1,1,1], [[0,0,1]], {sole:[0,0,1]});
show("sole-expected-doc", root, v(0, 0, 1), [1,1,1], [[0,0,1],[0,0,-1]], {sole:[0,0,1]});
show("one", root, v(0, .5, 0), [.5], [0,0,1]);
show("one-short", root, v(0, .2, 0), [1], [0,0,1]);
show("zero-length-array", root, root, [], [0,0,1]);
show("zero-segment", root, root, [0], [0,0,1]);
show("negative-segment", root, v(0,1,0), [-1], [0,0,1]);
show("zero-target-zero-hint", root, root, [1,1], [0,0,0]);
show("parallel-target-hint", root, v(0,1.2,0), [1,1], [0,1,0]);
show("parallel-target-hint2", root, v(0,1.2,0), [1,1], [0,-1,0]);
show("too-few-no-sole", root, v(0,1,0), [1,1,1], [[0,0,1]]);
show("too-few-sole", root, v(0,1,0), [1,1,1], [], {sole:[0,0,1]});
show("too-many-sole", root, v(0,1,0), [1,1,1], [[0,0,1],[0,0,-1]], {sole:[0,0,1]});
