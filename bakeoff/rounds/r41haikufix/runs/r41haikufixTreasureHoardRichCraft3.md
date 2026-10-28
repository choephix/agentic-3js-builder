The chest's keyhole uses `INK`, which the clockwork kit exports as an RGB triple, but `b.part` takes a colour string or a paint, so I replaced it with an equivalent hex string and dropped the unused import.

<<<<<<< SEARCH
import { INK, metal, panelled } from "agentic-3js-builder/kits/clockwork";
=======
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.part(new THREE.BoxGeometry(0.02, 0.05, 0.01), INK, { at: [0, 0.29, CHEST_D / 2 + 0.03] });
=======
  b.part(new THREE.BoxGeometry(0.02, 0.05, 0.01), "#22150b", { at: [0, 0.29, CHEST_D / 2 + 0.03] });
>>>>>>> REPLACE