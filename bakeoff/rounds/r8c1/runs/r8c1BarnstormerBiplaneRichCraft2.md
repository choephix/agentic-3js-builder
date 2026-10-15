1. **Cowl.** The copper paint read as orange fuzz at this size. I swapped it for broad-drift copper with riveted panel seams, which fits the steampunk-whimsy look.
2. **Spinner.** The noisy gilt paint made it look like a lumpy blob. It is now a smooth cel-shaded brass nose cone.
3. **Setting.** The scene felt sparse on the front-left and front-right. I added a stack of three twine-tied hay bales front-left and a hand-painted "LOOP-DE-LOOPS" signpost front-right. Both sit clear of the wings and prop, so the plane stays the tallest and largest thing and the front views stay open.

<<<<<<< SEARCH
import { metal, coil } from "agentic-3js-builder/kits/clockwork";
=======
import { metal, coil, panelled } from "agentic-3js-builder/kits/clockwork";
>>>>>>> REPLACE

<<<<<<< SEARCH
  const COPPER = metal("copper", { polish: 0.5, verdigris: 0.15 });
=======
  const COPPER = panelled(metal("copper", { polish: 0.45, verdigris: 0.18, size: 0.35 }), { size: 0.24, aspect: 0.8, rivets: 0.055 });
>>>>>>> REPLACE

<<<<<<< SEARCH
    { at: [0, FY, 2.3], axis: [0, 0, 1], segments: 12, color: metal("gilt"), bone: prop },
=======
    { at: [0, FY, 2.3], axis: [0, 0, 1], segments: 12, color: cel("#f2c24c", "#d9922a"), bone: prop },
>>>>>>> REPLACE

<<<<<<< SEARCH
  return b.root;
=======
  // ---------- hay bales
  const HAY = mottle("#e3bd4c", "#c99a32", { size: 0.14, seed: 12 });
  const bale = (x: number, y: number, z: number) => {
    P(new THREE.CylinderGeometry(0.32, 0.32, 0.7, 12), HAY, [x, y, z], { dir: [0, 0, 1], flat: true });
    for (const dz of [-0.17, 0.17]) P(new THREE.TorusGeometry(0.325, 0.012, 4, 14), LEATHER_DK, [x, y, z + dz], { flat: true });
  };
  bale(-3.0, GROUND + 0.32, 2.0);
  bale(-3.65, GROUND + 0.32, 2.0);
  bale(-3.32, GROUND + 0.87, 2.0);

  // ---------- signpost
  const SIGN = svg(
    `<svg viewBox="0 0 200 80"><rect x="3" y="3" width="194" height="74" rx="10" fill="#ffd23c" stroke="#22112f" stroke-width="4"/><text x="100" y="38" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="24" fill="#c8372d" stroke="#22112f" stroke-width="0.8">LOOP-DE-LOOPS</text><text x="100" y="62" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="19" fill="#25a39b">5 cents a ride!</text></svg>`,
    { size: 512 },
  );
  const SX = 3.9;
  const SZ = 1.8;
  b.rod([SX, GROUND - 0.02, SZ], [SX, 1.25, SZ], 0.04, WOOD, { bone: body, sides: 6 });
  ball(0.055, BRASS, [SX, 1.27, SZ]);
  P(new THREE.BoxGeometry(0.9, 0.38, 0.05), WOOD_LT, [SX, 0.98, SZ], { rotation: [0, 14, 0] });
  P(new THREE.PlaneGeometry(0.86, 0.34), "#ffffff", [SX + 0.24 * 0.03, 0.98, SZ + 0.97 * 0.03], { dir: [0.24, 0, 0.97], axis: "z", texture: SIGN });

  return b.root;
>>>>>>> REPLACE