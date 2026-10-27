Cause: `neonRod` was called with identical start and end points for the joystick glow, producing a zero-length path.

<<<<<<< SEARCH
  sphere(0.055, RED, [0, 1.165, 0.205], 10, "joystickBall");
  neonRod([0, 1.17, 0.205], [0, 1.17, 0.205], 0.055, RED, "joystickGlow");
=======
  glow(sphere(0.055, RED, [0, 1.165, 0.205], 10, "joystickBall"), 2.2);
>>>>>>> REPLACE