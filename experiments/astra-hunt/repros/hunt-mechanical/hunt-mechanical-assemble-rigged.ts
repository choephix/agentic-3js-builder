import { assemble } from "../../../../harness/assemble";
import build from "./hunt-mechanical-diorama";
const root = build();
try {
  const result = await assemble(root, true);
  console.log(JSON.stringify({ parts: result.parts.length, joints: result.joints, issues: result.issues }, null, 2));
} catch (error) {
  console.log(`ERROR ${error instanceof Error ? error.message : String(error)}`);
}
