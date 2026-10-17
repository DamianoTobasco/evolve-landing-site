# Evolve Arena landing site

Static site for https://theevolve.app, deployed to GitHub Pages from `main`
(`.github/workflows/deploy.yml`).

## Homepage

`index.html` + `arena.css` + `arena.js`. Art lives in `assets/arena/` and is
exported from the app's asset catalog and the App Store artwork:

- `heroes/`, `skins/`, `worlds/`, `chests/`, `tabs/`, `fx/`: `Evolve/Assets.xcassets` (`hero_toy_*`, `arena_*`)
- `keyart-*.webp`, `og.jpg`: the approved App Store banner and bonus key art
- `panels/`: the nine App Store screenshot panels
- `shots/`: real in-app Arena captures

Hero names, roles, attacks and Supers in `arena.js` mirror `ArenaHeroes.swift`
and `ArenaPresentation.swift`; update both together when the roster changes.

## Local preview

Serve the folder with any static server, e.g. `python3 -m http.server 4173`.

## Other pages

- `/b/<code>`: Arena invite-link fallback (with `.well-known/apple-app-site-association`)
- `/creators/`: redirects to https://go.theevolve.app/creators/ (Cloudflare Pages)
- `/support/`, `/privacy.html`, `/terms.html`, and the Peptide Tracking legal pages
