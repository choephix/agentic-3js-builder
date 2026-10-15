The cause is that `makeLeg` names the tip joint `hoof${tag}` for both the fore and hind leg, so the second leg on each side collides on `hoofL` / `hoofR`. The fix gives the tip joints distinct names, `hoofF${tag}` and `hoofH${tag}`.

<<<<<<< SEARCH
      ? [`shoulder${tag}`, `elbow${tag}`, `knee${tag}`, `hoof${tag}`]
      : [`hip${tag}`, `stifle${tag}`, `hock${tag}`, `hoof${tag}`];
=======
      ? [`shoulder${tag}`, `elbow${tag}`, `knee${tag}`, `hoofF${tag}`]
      : [`hip${tag}`, `stifle${tag}`, `hock${tag}`, `hoofH${tag}`];
>>>>>>> REPLACE