import { Vector3 } from "three";
import { limb } from "../../../../src/ik";

function dump(name: string, points: Vector3[]) {
  console.log(name, JSON.stringify(points.map((p) => p.toArray().map((x) => Number(x.toFixed(9))))));
}
function run(name: string, root: Vector3, target: Vector3, lengths: number[], bends: readonly (readonly number[])[], options: { sole?: readonly number[] } = {}) {
  try { dump(name, limb(root, target, lengths, bends, options)); } catch (e) { console.log(name, String(e)); }
}
const leftRoot = new Vector3(0.5, 1, 0), leftTarget = new Vector3(0.8, 0, 1);
const rightRoot = leftRoot.clone().multiply(new Vector3(-1, 1, 1));
const rightTarget = leftTarget.clone().multiply(new Vector3(-1, 1, 1));
run("mirror-left", leftRoot, leftTarget, [1, .8, .7], [[0,0,1],[0,0,-1]]);
run("mirror-right", rightRoot, rightTarget, [1, .8, .7], [[0,0,1],[0,0,-1]]);
run("mirror-left-hx", leftRoot, leftTarget, [1, .8, .7], [[1,0,1],[-1,0,-1]]);
run("mirror-right-hx", rightRoot, rightTarget, [1, .8, .7], [[-1,0,1],[1,0,-1]]);
run("root-target-coincident-z", new Vector3(0,0,0), new Vector3(0,0,0), [1,1], [[0,0,1]]);
run("root-target-coincident-negz", new Vector3(0,0,0), new Vector3(0,0,0), [1,1], [[0,0,-1]]);
run("sole-valid-2", new Vector3(0,0,0), new Vector3(1,0,1), [1,Math.SQRT2], [[0,1,0]], {sole:[1,0,1]});
run("sole-invalid-zero", new Vector3(0,0,0), new Vector3(0,0,1), [1,1], [[0,1,0]], {sole:[0,0,0]});
run("sole-one", new Vector3(0,0,0), new Vector3(0,0,1), [1], [], {sole:[0,0,1]});
run("empty-hints", new Vector3(0,0,0), new Vector3(1,0,0), [1,1], []);
run("zero-hint-vector", new Vector3(0,0,0), new Vector3(1,0,0), [1,1], [[0,0,0]]);
run("nan-length", new Vector3(0,0,0), new Vector3(1,0,0), [NaN,1], [[0,0,1]]);
run("inf-length", new Vector3(0,0,0), new Vector3(1,0,0), [Infinity,1], [[0,0,1]]);
run("negative-length-2", new Vector3(0,0,0), new Vector3(0,2,0), [-1,3], [[0,0,1]]);
