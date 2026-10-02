import { createBuilder } from "../../../../src/builder";
import type { Joint, Chain, Sweep, PartOptions, Fill, OutlinePoint } from "../../../../src/builder";

void createBuilder;
let j!: Joint;
let c!: Chain;
let s!: Sweep;
let p!: PartOptions;
let f!: Fill;
let o!: OutlinePoint;
console.log(Boolean(j && c && s && p && f && o));
