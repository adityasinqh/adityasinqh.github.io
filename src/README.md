# Site source

`index.html` in the repo root is generated. Edit here, then rebuild.

- `index.src.html`: the readable page (text, layout, page CSS, scripts).
- `assets/`: the design system's CSS and JS and the tool icons it links.
- `build.mjs`: inlines everything in `assets/` into one file.

To rebuild (needs Node 18+), from the repo root:

```sh
node src/build.mjs
```

Then commit both `src/` and `index.html`.
