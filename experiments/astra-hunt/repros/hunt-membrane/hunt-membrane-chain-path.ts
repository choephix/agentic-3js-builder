import { createBuilder } from "../../../../src/builder";
const b = createBuilder({ name: "chain-path" }); const root = b.joint("root", { at: [0, 0, 0] }); const chain = b.chain("arm", [[0, 0, 0], [0, 1, 0], [0, 2, 0], [0, 3, 0]], { parent: root });
const mesh = b.membrane(chain, [[1, 0, 0], [1, 1, 0], [1, 2, 0], [1, 3, 0]], { thickness: 0.02, color: "#fff", rows: 2, cols: 8 })[0];
console.log({ bones: mesh.userData.skinBones, hasSkin: Boolean(mesh.geometry.getAttribute("skinWeight")), owner: b.ctx.owner.get(mesh)?.name });
