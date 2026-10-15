The spine chain was the first thing built, with no parent and no root joint yet, so the SDK had no bone to attach it to. I'm adding a root joint first and parenting the spine to it.

<<<<<<< SEARCH
  const spine = b.chain(
    "spine",
=======
  const root = b.joint("root", { at: [0, 2.42, -1.15], group: "body" });
  const spine = b.chain(
    "spine",
>>>>>>> REPLACE

<<<<<<< SEARCH
    { names: ["hips", "spine1", "spine2", "chest"], role: "spine", group: "body" },
=======
    { parent: root, names: ["hips", "spine1", "spine2", "chest"], role: "spine", group: "body" },
>>>>>>> REPLACE