The chest body passes `woodPaint` (a Paint) as its colour together with `texture: PLANKS`, but a textured part only accepts a colour string as its tint. The fix is to give it the plain string `WOODR[3]` as the tint, so the PLANKS drawing shows in its own colours.

<<<<<<< SEARCH
  b.part(tileBox([0.8, 0.4, 0.5], PLANKS, TEXEL), woodPaint, { bone: root, at: [cx, 0.3, cz], texture: PLANKS });
=======
  b.part(tileBox([0.8, 0.4, 0.5], PLANKS, TEXEL), "#ffffff", { bone: root, at: [cx, 0.3, cz], texture: PLANKS });
>>>>>>> REPLACE