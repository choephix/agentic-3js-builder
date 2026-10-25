The cause: the build code, including `return b.root;`, sat at module top level with no default-exported function around it, so `return` was illegal there. I wrapped it in `export default function build()`.

<<<<<<< SEARCH
const b = createBuilder({ name: "railgun_carrier", paintSize: 2048 });
=======
export default function build() {
const b = createBuilder({ name: "railgun_carrier", paintSize: 2048 });
>>>>>>> REPLACE

<<<<<<< SEARCH
return b.root;
=======
return b.root;
}
>>>>>>> REPLACE