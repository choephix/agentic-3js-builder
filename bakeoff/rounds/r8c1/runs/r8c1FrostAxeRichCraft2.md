1. **Floating shards under the ice-pick.** Two crystals started below the pick's lower edge and read as detached in the front view. I moved their bases onto the blade so they grow out of it.
2. **Fur collar.** It rendered as drab grey wisps. I brightened the tuft drawing and enlarged the cards so it reads as white Freljord fur.
3. **Blade colour.** The crescent was a dirty grey mottle. I pushed it to a saturated frost-blue gradient with cyan-tinted frost patches, so it reads as ice-forged steel.
4. **Gold trim.** League weapons carry ornate gold edging. I added a gold border on both faces of the dark plate, echoing the hub's trim and giving the blade a crisp inner outline.

<<<<<<< SEARCH
  const base = mix(mix("#33507f", "#6e92bd", noise(p, 0.12, 2)), "#dff4ff", t * 0.9);
  return mix(base, "#ffffff", frost * 0.45);
=======
  const base = mix(mix("#2a5fa8", "#4aa6dc", noise(p, 0.12, 2)), "#c8f4ff", t * 0.95);
  return mix(base, "#e8fcff", frost * 0.32);
>>>>>>> REPLACE

<<<<<<< SEARCH
    <path d="M2 64 Q4 30 12 6 Q16 28 18 64Z" fill="#dce9f6"/>
    <path d="M10 64 Q12 24 18 0 Q24 26 26 64Z" fill="#f4f9ff"/>
    <path d="M18 64 Q22 34 28 12 Q31 36 30 64Z" fill="#c4d8ee"/>
=======
    <path d="M2 64 Q4 30 12 6 Q16 28 18 64Z" fill="#f0f7ff"/>
    <path d="M10 64 Q12 24 18 0 Q24 26 26 64Z" fill="#ffffff"/>
    <path d="M18 64 Q22 34 28 12 Q31 36 30 64Z" fill="#d6e8fa"/>
>>>>>>> REPLACE

<<<<<<< SEARCH
      size: [0.065, 0.17],
=======
      size: [0.08, 0.2],
>>>>>>> REPLACE

<<<<<<< SEARCH
  // glowing cutting edge
=======
  // gold trim framing the dark plate on both faces
  const plateOutline = scaleOutline(MAIN, 0.72, 0.74, 0.03, 0);
  for (const zs of [1, -1]) {
    const trimPts = plateOutline.map((p) => [p[0], HC + p[1], zs * 0.026] as V);
    b.sweep(polyline(trimPts, { closed: true }), 0.0045, { sides: 5, color: GOLD, name: "plateTrim" });
  }

  // glowing cutting edge
>>>>>>> REPLACE

<<<<<<< SEARCH
  bladeShard(-1, 0.3, 0.06, 0.1, -1, 0, 0.2, 0.028, 3);
  bladeShard(-1, 0.1, -0.1, -0.1, -1, 0.1, 0.18, 0.028, 2);
=======
  bladeShard(-1, 0.3, 0.1, 0.1, -1, 0, 0.2, 0.028, 3);
  bladeShard(-1, 0.1, -0.04, -0.1, -1, 0.1, 0.18, 0.028, 2);
>>>>>>> REPLACE