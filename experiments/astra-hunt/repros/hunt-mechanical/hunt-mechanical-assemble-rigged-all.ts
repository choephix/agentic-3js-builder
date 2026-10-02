import { assemble } from "../../../../harness/assemble";
import buildRobot from "./hunt-mechanical-robot";
import buildCart from "./hunt-mechanical-cart";
for (const [name, build] of [["robot", buildRobot], ["cart", buildCart]] as const) {
  const result = await assemble(build(), true);
  console.log(JSON.stringify({ name, parts: result.parts.length, joints: result.joints.length, triangles: result.triangles, issues: result.issues, bounds: result.bounds }, null, 2));
}
