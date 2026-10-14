import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame, line } from "../../../../src/frame";
import { aim, lerp, mid, offset, rng } from "../../../../src/math";
import { arc, bezier, catmull, polyline, spiral } from "../../../../src/path";
import { limb } from "../../../../src/ik";
import { countershade, paint, spots, stripes } from "../../../../src/paint";
import { svg } from "../../../../src/texture";

export default function build() {
  const b = createBuilder({ name: "wyvern" }); // { detail } scales tessellation, see "Detail and budget"
  const hips = b.joint("hips", { at: [0, 1, 0] });
  // ...
  return b.root;
}
