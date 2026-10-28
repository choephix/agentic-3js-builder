The cause: `chain.tip` is `Joint | null`, but the bone options take `JointRef | undefined`, so I route every chain-tip bone through a `tipOf` helper that returns a non-null `Joint`.

<<<<<<< SEARCH
} from "agentic-3js-builder";
=======
} from "agentic-3js-builder";
import type { Joint } from "agentic-3js-builder";
>>>>>>> REPLACE

<<<<<<< SEARCH
const TAU = Math.PI * 2;
=======
const TAU = Math.PI * 2;

// A chain's hand or foot bone: its tip joint, or its last joint when the chain has no tip.
const tipOf = (c: { tip: Joint | null; joints: Joint[] }): Joint => {
  const j = c.tip ?? c.joints[c.joints.length - 1];
  if (!j) throw new Error("chain has no joints");
  return j;
};
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.part(new THREE.BoxGeometry(0.17, 0.19, 0.16), SKIN, { bone: arm.tip, at: [s * 0.42, 0.98, 0.45] });
    b.part(new THREE.BoxGeometry(0.19, 0.04, 0.05), SKIN, { bone: arm.tip, at: [s * 0.42, 1.08, 0.5] });
=======
    b.part(new THREE.BoxGeometry(0.17, 0.19, 0.16), SKIN, { bone: tipOf(arm), at: [s * 0.42, 0.98, 0.45] });
    b.part(new THREE.BoxGeometry(0.19, 0.04, 0.05), SKIN, { bone: tipOf(arm), at: [s * 0.42, 1.08, 0.5] });
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.part(new THREE.BoxGeometry(0.2, 0.12, 0.34), BELOW, { bone: leg.tip, at: [s * 0.22, 0.07, 0.14] });
=======
    b.part(new THREE.BoxGeometry(0.2, 0.12, 0.34), BELOW, { bone: tipOf(leg), at: [s * 0.22, 0.07, 0.14] });
>>>>>>> REPLACE

<<<<<<< SEARCH
      b.part(new THREE.SphereGeometry(0.046, 6, 4), SKIN, { bone: leg.tip, at: [tx, 0.05, 0.3] });
      b.spike([tx, 0.06, 0.32], [0, -0.3, 1], 0.06, 0.012, { color: TOENAIL, bone: leg.tip });
=======
      b.part(new THREE.SphereGeometry(0.046, 6, 4), SKIN, { bone: tipOf(leg), at: [tx, 0.05, 0.3] });
      b.spike([tx, 0.06, 0.32], [0, -0.3, 1], 0.06, 0.012, { color: TOENAIL, bone: tipOf(leg) });
>>>>>>> REPLACE