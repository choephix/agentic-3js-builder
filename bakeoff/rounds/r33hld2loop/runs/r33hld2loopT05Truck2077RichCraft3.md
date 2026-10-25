I reviewed the sheets. The current module reads as a coherent armoured truck, so the fixes are targeted:

1. **Hull vents and back-door seam read as floating slivers** (back view, top view): the loose boxes `hull.2`, `hull.29`, `hull.30` and the slabs near the cab are detached from the body. I'll seat the rear-door centre seam and the cab slabs flush against their surfaces. Visible in the back and top views.
2. **Mirror arms and mud flaps float off the body** (front and side views): the mirror arms start at the cab face. I'll anchor the mirror root inside the cab wall. Visible in the front and three-quarter views.
3. **Wheel-arch skirts bulge past the chassis** (side view): I'll pull the skirt inset so it sits on the hull side. Visible in the side and low hero views.

Edits:

<<<<<<< SEARCH
  b.part(new THREE.BoxGeometry(0.03, 2.2, 0.03), DARK, { bone: hull, at: [0, 2.3, -2.93] });
=======
  b.part(new THREE.BoxGeometry(0.03, 2.2, 0.03), DARK, { bone: hull, at: [0, 2.3, -2.9] });
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.part(new THREE.BoxGeometry(0.06, 2.1, 0.07), SLATE, { bone: hull, at: [s * 1.23, 2.3, z] });
=======
    b.part(new THREE.BoxGeometry(0.06, 2.1, 0.07), SLATE, { bone: hull, at: [s * 1.2, 2.3, z] });
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.sweep(
      catmull([
        [s * 1.15, 2.75, 2.7],
        [s * 1.42, 2.85, 2.9],
        [s * 1.5, 2.95, 3.0],
      ]),
=======
    b.sweep(
      catmull([
        [s * 1.0, 2.75, 2.7],
        [s * 1.42, 2.85, 2.9],
        [s * 1.5, 2.95, 3.0],
      ]),
>>>>>>> REPLACE

<<<<<<< SEARCH
      { at: [s * 1.3, 0, 0], x: [0, 0, 1], thickness: 0.08, bevel: 0.01, color: BODY, bone: hull },
=======
      { at: [s * 1.2, 0, 0], x: [0, 0, 1], thickness: 0.08, bevel: 0.01, color: BODY, bone: hull },
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.part(new THREE.BoxGeometry(0.42, 0.5, 0.03), TYRE, { bone: hull, at: [s * 1.2, 0.85, -2.95] });
=======
    b.part(new THREE.BoxGeometry(0.42, 0.5, 0.03), TYRE, { bone: hull, at: [s * 1.2, 0.85, -2.9] });
>>>>>>> REPLACE