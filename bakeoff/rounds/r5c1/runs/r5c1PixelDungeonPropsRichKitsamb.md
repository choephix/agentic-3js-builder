1. **Spikes vanish into the dark floor.** They were painted with the same dark iron as the trap, so they read as shadows. I gave them a lighter steel paint so the spike field reads at a glance.
2. **The impaled skull floated above its spike.** I lowered it onto the spike so the spike enters the jaw, and the blood-red tip now shows through it.
3. **The lying barrel crowded barrel A and the trap.** I moved it forward and right so all three read separately in the front and three-quarter views. The stray tap box sat inside the barrel and is harmless, so I left it.
4. **Black holes in the top row of the wall.** The skipped stones showed bare mortar and looked like missing geometry. I filled them with shorter stones.
5. **Light and setting.** The torches were the only light sources. I added dithered gold glow pools on the floor and wall around the chest, and a green pool around the slime barrel, so the hoard and the brew light their surroundings.
6. **A lit candle on barrel A.** A cream stub with a dripping wax lip and a small flame card gives the barrel a focal point and extra warm light.

<<<<<<< SEARCH
const BONEP = bonePaint;
=======
const BONEP = bonePaint;
const SPIKEP = cellPaint(
  TEXEL * 0.75,
  (c) => c.pick(IRON, 0.55 + 0.25 * c.n.y + 0.15 * (c.random(3) - 0.5)),
  { dither: true },
);
>>>>>>> REPLACE

<<<<<<< SEARCH
  const TRAP = pixelTexture(48, 48, (g) => {
=======
  const spillTex = (hi: string, lo: string) =>
    pixelTexture(48, 48, (g) =>
      g.fill((x, y) => {
        const v = 1 - Math.hypot(x - 23.5, y - 23.5) / 24;
        if (v <= 0 || v * 1.15 <= bayer(x, y) + 0.15) return "";
        return v > 0.55 ? hi : lo;
      }),
    );
  const GOLDSPILL = spillTex("#ffd85a", "#c8932a");
  const GREENSPILL = spillTex("#a8ff7a", "#3fa84a");

  const TRAP = pixelTexture(48, 48, (g) => {
>>>>>>> REPLACE

<<<<<<< SEARCH
      const skip = c === 4 && rw() < 0.3;
=======
      rw();
      const skip = false;
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.pose(lid, { axis: [1, 0, 0], deg: -100 });
=======
  b.pose(lid, { axis: [1, 0, 0], deg: -100 });

  // Gold light pools from the hoard
  glow(put(new THREE.PlaneGeometry(1.3, 1.3), "#ffffff", V(CX, bodyTop + 0.25, WALL_FRONT + 0.012), { texture: GOLDSPILL }), 0.35);
  glow(
    put(new THREE.PlaneGeometry(1.4, 1.4), "#ffffff", V(CX, 0.143, CZ + 0.55), { dir: [0, 1, 0], axis: "z", texture: GOLDSPILL }),
    0.3,
  );
  // Green light pools from the slime barrel
  glow(put(new THREE.PlaneGeometry(1.1, 1.1), "#ffffff", V(1.52, 0.9, WALL_FRONT + 0.012), { texture: GREENSPILL }), 0.3);
  glow(
    put(new THREE.PlaneGeometry(1.0, 1.0), "#ffffff", V(1.52, 0.143, -0.3), { dir: [0, 1, 0], axis: "z", texture: GREENSPILL }),
    0.25,
  );
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.decal(barrelA, MARK, { at: V(0.85, GROUND + 0.45, -0.62 + 0.33), dir: [0, 0, 1], size: [0.2, 0.2], segments: 6 });
=======
  b.decal(barrelA, MARK, { at: V(0.85, GROUND + 0.45, -0.62 + 0.33), dir: [0, 0, 1], size: [0.2, 0.2], segments: 6 });
  // Candle on barrel A
  box(0.055, 0.1, 0.055, "#efe3c2", V(0.95, 1.03, -0.56));
  box(0.07, 0.02, 0.07, "#cdbf9e", V(0.95, 0.985, -0.56));
  box(0.012, 0.05, 0.012, "#efe3c2", V(0.973, 1.0, -0.532));
  glow(
    b.cards([frame(V(0.95, 1.08, -0.56), [0, 1, 0])], FLAME, { size: [0.07, 0.1], cross: true, flow: [0, 0, 1], sink: 0, bone: root }),
    1,
  );
  glow(put(new THREE.PlaneGeometry(0.6, 0.6), "#ffffff", V(0.95, 1.0, -0.2), { texture: SPILL }), 0.15);
>>>>>>> REPLACE

<<<<<<< SEARCH
    const centre = V(1.38, GROUND + 0.315, 0.2);
=======
    const centre = V(1.5, GROUND + 0.325, 0.55);
>>>>>>> REPLACE

<<<<<<< SEARCH
      put(new THREE.ConeGeometry(0.04, h, 4), IRONP, V(x, base + h / 2, z), { bone: spikes, rotation: [0, 45, 0], flat: true });
=======
      put(new THREE.ConeGeometry(0.04, h, 4), SPIKEP, V(x, base + h / 2, z), { bone: spikes, rotation: [0, 45, 0], flat: true });
>>>>>>> REPLACE

<<<<<<< SEARCH
      if (impaled) skull(V(x, base + h + 0.01, z), qOf(-50, 200, 0), 22, true, "B");
=======
      if (impaled) skull(V(x, base + h - 0.035, z), qOf(-50, 200, 0), 22, true, "B");
>>>>>>> REPLACE