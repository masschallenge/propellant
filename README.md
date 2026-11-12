# Propellant

The documentation site for Propellant, the MassChallenge design system, published at
[propellant.masschallenge.org](https://propellant.masschallenge.org).

Propellant has one brand and one set of guidelines, and a version for each platform we build on.
Each platform lives in its own repository. This site brings them together.

| Platform | Repository                                                                              |
| -------- | --------------------------------------------------------------------------------------- |
| Web      | [`masschallenge/propellant-web`](https://github.com/masschallenge/propellant-web)       |
| Office   | [`masschallenge/propellant-office`](https://github.com/masschallenge/propellant-office) |

## How the site is built

- Pages that belong to the whole system (home, platforms, contributing) live in
  `src/content/docs`.
- Platform pages come from each platform's repository at its latest release.
  `scripts/sync-platform-docs.mjs` copies them in before every build, turns links between guides
  into site links, and points everything else at GitHub. Synced pages are not committed.
- The site is built with [Astro Starlight](https://starlight.astro.build).

## The Propellant skill

`skill/propellant-brand` is a Claude skill that applies Propellant to anything people make with
Claude. Every build packages it with the latest templates, logos and web stylesheet and publishes
it at `/downloads/propellant-brand.zip`. The [Propellant in Claude](src/content/docs/claude.md)
page explains how to install it.

## Publishing

Every merge to `main` publishes the site. It also rebuilds every morning, so a new platform release
appears within a day without anyone touching this repository. To publish right away, run the
**Deploy site** workflow from the **Actions** tab.

The workflow publishes to the `gh-pages` branch with a `CNAME` file for
`propellant.masschallenge.org`, which is how GitHub Pages knows the address.

## Search engines and AI tools

The build publishes files that help search engines and AI assistants find and use Propellant:

- `robots.txt` lets every crawler in and points to the sitemap.
- `llms.txt` is a short guide for AI assistants: what Propellant is, that it is the source of
  truth for the brand, and a link to every page.
- `llms-full.txt` is one plain text file with the brand facts, the rules for making documents,
  decks, graphics and web pages on brand (from the Propellant skill), and every docs page. The
  visual brand guide, studio and signature pages are listed in `llms.txt` but are not text pages.

All three are built from the site's own content, so they stay current with every deploy. The
home and brand pages also carry canonical, social and structured data tags.

## Previews

Every pull request from a branch in this repository gets its own preview on Netlify, at
`https://pr-<number>--<netlify-site>.netlify.app`. The **Preview site** workflow builds the site
the same way as a real deploy, publishes it, and posts the link on the pull request. Each push
updates the same link. The live site stays on GitHub Pages. Previews tell search engines not to
index them, so only the live site shows up in search.

The workflow needs two repository secrets: `NETLIFY_AUTH_TOKEN`, a Netlify personal access token,
and `NETLIFY_SITE_ID`, the ID of the Netlify site that holds the previews. Without them it skips
the preview and leaves a warning.

## Working on the site

```bash
nvm use
yarn install
yarn dev     # http://localhost:4321
yarn test
yarn build
```

To build against a specific platform release instead of the latest one, set
`PROPELLANT_WEB_REF`, for example `PROPELLANT_WEB_REF=v1.0.0 yarn build`.

## Contributing and security

See [CONTRIBUTING.md](CONTRIBUTING.md) and [SECURITY.md](SECURITY.md).

## License

The code and text are MIT licensed. The MassChallenge and Propellant names and logos are not; see
[LICENSE](LICENSE).
