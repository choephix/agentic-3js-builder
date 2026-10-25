## Edits

Edits are SEARCH/REPLACE blocks against the current module:

<<<<<<< SEARCH
exact lines from the current module
=======
the lines that replace them
>>>>>>> REPLACE

Each SEARCH copies whole lines of the current module exactly, indentation included, and matches one place only; a few lines around the change are enough. Blocks apply in order, each to the module as the blocks before it left it. To add code, replace a nearby line with itself plus the new lines. When the changes touch most of the module, reply with the whole new module in one ```ts block instead.
