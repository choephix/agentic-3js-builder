The outline helpers returned `[number, number, string?][]`, which doesn't match the SDK's `OutlinePoint` type (`[x, y]` or `[x, y, "sharp"]`), so I typed them as `OutlinePoint[]`.

<<<<<<< SEARCH
function featherOutline(w: number, l: number): [number, number, string?][] {
=======
function featherOutline(w: number, l: number): OutlinePoint[] {
>>>>>>> REPLACE
<<<<<<< SEARCH
function tipOutline(w: number, l: number): [number, number, string?][] {
=======
function tipOutline(w: number, l: number): OutlinePoint[] {
>>>>>>> REPLACE
<<<<<<< SEARCH
import type { Builder } from "agentic-3js-builder";
=======
import type { Builder, OutlinePoint } from "agentic-3js-builder";
>>>>>>> REPLACE