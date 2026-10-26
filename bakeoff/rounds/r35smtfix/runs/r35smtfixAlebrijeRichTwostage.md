Cause: the outline helpers return `[number, number, string?][]`, which isn't an `OutlinePoint[]`, and three `b.joint ? … : …` checks test a method that always exists.

## Edits

<<<<<<< SEARCH
function featherOutline(w: number, l: number): [number, number, string?][] {
  return [
=======
function featherOutline(w: number, l: number): OutlinePoint[] {
  return [
>>>>>>> REPLACE

<<<<<<< SEARCH
function tipOutline(w: number, l: number): [number, number, string?][] {
  return [
=======
function tipOutline(w: number, l: number): OutlinePoint[] {
  return [
>>>>>>> REPLACE

<<<<<<< SEARCH
import { type Builder, createBuilder, rng, bezier, catmull, limb, paint, svg, frame } from "agentic-3js-builder";
=======
import { type Builder, createBuilder, rng, bezier, catmull, limb, paint, svg, frame } from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";
>>>>>>> REPLACE

<<<<<<< SEARCH
    const wingBone = b.joint ? undefined : undefined;
    void wingBone;
=======
>>>>>>> REPLACE

<<<<<<< SEARCH
    const arm = b.root.getObjectByName ? null : null;
    void arm;
=======
>>>>>>> REPLACE

<<<<<<< SEARCH
  const head = b.joint ? null : null; // placeholder to keep types quiet
  void head;
  void R;
=======
  void R;
>>>>>>> REPLACE