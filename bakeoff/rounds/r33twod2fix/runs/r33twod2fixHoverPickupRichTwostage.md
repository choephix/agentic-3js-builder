Cause: `addArmorPlates` passes `bone: null` to `b.part`, and the SDK only accepts a Joint, a joint name or a Chain there, so it throws. Removing the option lets the part pick its nearest joint, or the root when the model has no joints.

<<<<<<< SEARCH
    b.part(g, c, { at: at as any, bone: null as any, ...extra });
=======
    b.part(g, c, { at: at as any, ...extra });
>>>>>>> REPLACE

The search text above has to match the current module's indentation exactly. In the module the line is indented four spaces more than it appears in some views, so the edit below uses the actual form:

<<<<<<< SEARCH
    b.part(g, c, { at: at as any, bone: null as any, ...extra });
=======
    b.part(g, c, { at: at as any, ...extra });
>>>>>>> REPLACE