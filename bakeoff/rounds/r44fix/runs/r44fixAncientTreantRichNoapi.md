The crash is in the test harness, not the module. Playwright asserted on a Chrome extension's service worker target (`chrome-extension://…/thunk.js`) attached to the browser, so the module never got far enough to fail on its own. No edit to the model can change that, and I found no code-level fault in it. I did spot one real risk and fixed it: `ringPts` is a hoisted function declaration, so it was safe, but its `{ closed: true } as any` call sites pass `catmull` an option cast that could be fragile. The edit below removes the cast and leaves the model unchanged. The real fix is to rerun with extensions disabled (for example a clean browser profile, or launching Chromium without `--load-extension`).

<<<<<<< SEARCH
  b.sweep(catmull(ringPts(V(0, 2.0, 0), 0.62, 12), { closed: true } as any), 0.1, { bone: hips, color: ROOTP, sides: 6 });
=======
  b.sweep(catmull(ringPts(V(0, 2.0, 0), 0.62, 12), { closed: true }), 0.1, { bone: hips, color: ROOTP, sides: 6 });
>>>>>>> REPLACE