import { createBuilder } from "../../../../src/builder";
import { mix } from "../../../../src/paint";

const b = createBuilder();
b.joint("root", { at: [0, 0, 0] });
const rgb = mix("#000000", "#ffffff", 0.5);
b.sweep([[0,0,0], [0,1,0]], 0.1, { color: rgb });
