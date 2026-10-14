```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "1930s racing green typewriter",
  description:
    "Glossy racing green portable typewriter: chrome-rimmed keys with cream letters in four staggered rows, a semicircular fan of typebars, a chrome carriage return lever, a black platen with a half-typed sheet, and a brass maker's badge.",
};

type V = [number, number, number];

const GREEN = "#0b4a2d";
const GREEN_DEEP = "#052b1a";
const BLACK = "#151515";
const CREAM = "#eee3c4";
const CHROME = "#cfd5da";
const STEEL = "#a4abb2";
const BRASS = "#c9a04e";
const PAPER = "#f6f3ea";
const INK = "#2b2722";

// Keyboard slab: its top falls TAN metres per metre toward the front.
const TAN = 0.35;
const PHI = Math.atan(TAN);
const COS = Math.cos(PHI);
const SIN = Math.sin(PHI);
const deckY = (z: number) => 0.1 + (0.14 - z) * TAN;
const TILT = 0.14; // sheet leans toward the operator

const LINES = [
  "DEAR SIR, WITH REFERENCE TO YOUR LETTER OF",
  "THE 4TH INST. WE ARE PLEASED TO CONFIRM THAT",
  "THE CONSIGNMENT OF 120 CRATES WILL LEAVE",
  "OUR WORKS ON MONDAY AND REACH YOUR DEPOT",
  "BY THE 12TH. PLEASE ADVISE IF THE REVISED",
  "SCHEDULE SUITS YOUR SITE - MR. HALLOWAY",
  "HAS ASKED THAT WE COPY HIM ON ALL CORR-",
  "ESPONDENCE UNTIL THE MATTER IS SETTLED.",
];

//