The chassis loop calls `lit(undefined, 0)`, a leftover placeholder line, and `glow` throws on an `undefined` target. The underglow strips are already built correctly in the next loop, so the placeholder line can go.

<<<<<<< SEARCH
    lit(b.root.children.length ? (undefined as any) : (undefined as any), 0) as any;
=======
>>>>>>> REPLACE