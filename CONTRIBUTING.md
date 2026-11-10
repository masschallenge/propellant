# Contributing

The MassChallenge team owns and maintains Propellant. Changes to this site come through pull
requests that a maintainer reviews and merges.

## Design comes first

Any new component or visual change starts as an approved design, made in a design tool such as
Figma or Claude Design, before any code is written. The pull request is desk checked against that
design, and the review by the MassChallenge design lead is the final check before it is merged.

## Where a change goes

- A page that belongs to the whole system: this repository, in `src/content/docs`.
- A page about one platform: that platform's repository. It appears here after its next release.

## Making a change

1. Create a branch.
2. Run `yarn install`.
3. Make the change. Logic in `scripts/` needs tests in `tests/`.
4. Run `yarn format`, `yarn test` and `yarn build`.
5. Open a pull request that explains why the change is needed.

## Code standards

- Arrow functions, descriptive names and no comments, as in the platform repositories.
- No em dashes or en dashes in code or text.
- Commit messages describe why, not just what.
