1. **Books clipping the side panel.** The leaning books on shelves 2 and 3 pushed into the right side wall, so I moved them in and dropped one upright book on shelf 2 to make room.
2. **Interior too dark.** The starry back panel was almost black and the cel shadow on the wood was nearly black. I brightened the sky gradient, made the back panel gently self-lit so the shelves read as magical, and lifted the wood shadow tones so the pillars and side panels keep their grain.
3. **Flat rug.** The pentagram had no glow, so I added a glowing cyan ring over it with floating mana motes at the five points and a few sparkles above. This ties the floor to the glowing orbs and crystals on the shelves.

<<<<<<< SEARCH
  const woodV = cel(grain("#5a3322", "#7d4b2d", { size: 0.035, axis: "y" }), "#3b2118");
  const woodH = cel(grain("#5a3322", "#7d4b2d", { size: 0.035, axis: "x" }), "#3b2118");
=======
  const woodV = cel(grain("#5a3322", "#7d4b2d", { size: 0.035, axis: "y" }), "#5c3626");
  const woodH = cel(grain("#5a3322", "#7d4b2d", { size: 0.035, axis: "x" }), "#5c3626");
>>>>>>> REPLACE

<<<<<<< SEARCH
    `<svg viewBox="0 0 134 156" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b1858"/><stop offset="1" stop-color="#3a1f6b"/></linearGradient></defs>
=======
    `<svg viewBox="0 0 134 156" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2a88"/><stop offset="1" stop-color="#5a2f9a"/></linearGradient></defs>
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.part(new THREE.PlaneGeometry(1.34, 1.56), "#ffffff", { at: [0, Y0 + 1.42, -0.1788], texture: SKY });
=======
  glow(b.part(new THREE.PlaneGeometry(1.34, 1.56), "#ffffff", { at: [0, Y0 + 1.42, -0.1788], texture: SKY }), 0.45);
>>>>>>> REPLACE

<<<<<<< SEARCH
    const e = row(0.39, t, rb(3));
=======
    const e = row(0.39, t, rb(2));
>>>>>>> REPLACE

<<<<<<< SEARCH
    lean(0.67 - ls.h * Math.sin(14 * DEG), t, ls, 14);
=======
    lean(0.63 - ls.h * Math.sin(14 * DEG), t, ls, 14);
>>>>>>> REPLACE

<<<<<<< SEARCH
    lean(0.67 - ls.h * Math.sin(12 * DEG), t, ls, 12);
=======
    lean(0.64 - ls.h * Math.sin(12 * DEG), t, ls, 12);
>>>>>>> REPLACE

<<<<<<< SEARCH
  spark(0.0, 0.9, 0.55, 0.05, "#ffe9a0");
=======
  spark(0.0, 0.9, 0.55, 0.05, "#ffe9a0");
  // glowing summoning ring over the rug's pentagram
  glow(b.part(new THREE.TorusGeometry(0.2, 0.004, 4, 32), "#7cf0ff", { at: [0, 0.079, 0.37], rotation: [90, 0, 0] }), 1.4);
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i * TAU) / 5;
    const mx = Math.cos(a) * 0.2;
    const mz = 0.37 + Math.sin(a) * 0.2;
    glow(ball(0.012, i % 2 ? "#ffd86a" : "#b8f6ff", mx, 0.11 + (i % 2) * 0.04, mz), 1.6);
    spark(mx + 0.02, 0.16 + (i % 2) * 0.04, mz, 0.04, i % 2 ? "#ffe9a0" : "#c6f6ff");
  }
  spark(0.0, 0.3, 0.37, 0.07, "#c6f6ff");
>>>>>>> REPLACE