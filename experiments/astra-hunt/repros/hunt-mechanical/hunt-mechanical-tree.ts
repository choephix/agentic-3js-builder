import build from "./hunt-mechanical-robot";
import { Object3D } from "three";
const root = build();
function visit(node: Object3D, depth = 0) {
  console.log(`${" ".repeat(depth)}${node.type}:${node.name} children=${node.children.length}`);
  for (const child of node.children) visit(child, depth + 1);
}
visit(root);
