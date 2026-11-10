# Propellant

The documentation site for Propellant, the MassChallenge design system, published at
[propellant.masschallenge.org](https://propellant.masschallenge.org).

Propellant has one brand and one set of guidelines, and a version for each platform we build on.
Each platform lives in its own repository. This site brings them together.

| Platform             | Repository                                                                        |
| -------------------- | --------------------------------------------------------------------------------- |
| Web                  | [`masschallenge/propellant-web`](https://github.com/masschallenge/propellant-web) |
| iOS, Android, Office | Planned                                                                           |

## How the site is built

- Pages that belong to the whole system (home, platforms, contributing) live in
  `src/content/docs`.
- Platform pages come from each platform's repository at its latest release.
  `scripts/sync-platform-docs.mjs` copies them in before every build, turns links between guides
  into site links, and points everything else at GitHub. Synced pages are not committed.
- The site is built with [Astro Starlight](https://starlight.astro.build).

## Publishing

Every merge to `main` publishes the site. It also rebuilds every morning, so a new platform release
appears within a day without anyone touching this repository. To publish right away, run the
**Deploy site** workflow from the **Actions** tab.

The workflow publishes to the `gh-pages` branch with a `CNAME` file for
`propellant.masschallenge.org`, which is how GitHub Pages knows the address.

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
