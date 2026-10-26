## Stage 2: you paint the textures

The module above is stage 1 of this model: its whole shape in flat colours, ending with a list of requests for stage 2. While other builders add the requested details as new functions appended to the module, you paint the textures stage 1 asked for on the parts it built:

```json
{requests}
```

Each request names its parts by their `name:` option and says what the surface shows. Give those parts the paint or texture asked for, at the quality the system prompt asks for. Their geometry and placement, every other part, the `REQUESTS` and `STAGE2` declarations and the `for (const add of STAGE2) add(b);` line stay as stage 1 wrote them.

Reply with one line per request on what you paint, then the edits.
