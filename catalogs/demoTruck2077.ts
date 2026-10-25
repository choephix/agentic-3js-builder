// The placeholder for "futuristic militarized truck from 2077, low-poly 2077 aesthetic, extremely intricate": the
// pick list a builder's reply would open with, run through truck.ts assemble. An app shows this seconds after the
// picks arrive and swaps in the builder's own module when it lands.
import { assemble } from "./truck";
import type { Picks } from "./truck";

export const picks: Picks = {
  cab: "wedge",
  bed: "open",
  wheel: "beadlock",
  suspension: "lift",
  bumperFront: "ram",
  bumperRear: "spikes",
  headlight: "slit",
  grille: "slats",
  mirror: "camera",
  exhaust: "stack",
  armour: { skirt: "slatted", plate: "spaced", era: "hex", hatch: "cupola", smoke: "bank" },
  weapons: {
    roof: { turret: "remote", railgun: "rails" },
    bed: { turret: "ring", barrel: "minigun", pod: "box" },
    rifle: { rifle: "bullpup", rack: "clip" },
  },
  hull: { antenna: "whip", dome: "camera", vent: "louvre", panel: "greeble", lightBar: "dual", cable: "bundle" },
  style: { palette: "nightOps", body: "wornPanels", trim: "chevrons", neon: "flank", decal: "all", screen: "hud" },
};

export const meta = {
  name: "Truck 2077 demo",
  description: "Catalog placeholder for the 2077 militarized truck brief.",
};

export default () => assemble(picks);
