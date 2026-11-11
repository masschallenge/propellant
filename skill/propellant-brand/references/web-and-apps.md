# Web apps, pages and prototypes

## Contents

- Choose the setup
- Production React apps
- Prototypes, HTML artifacts and landing pages
- Web layout rules
- Uploaded images

## Choose the setup

| Building                                                                    | Use                                                                                            |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| A production React app or site in a repository                              | The `@masschallenge/propellant-web` package: components and tokens                             |
| A quick prototype, a single HTML file, a claude.ai artifact or a dashboard  | `assets/propellant-website.css` inlined in a `<style>` tag, plus the class names below         |
| A page in a website builder (WordPress, Squarespace, Webflow, Wix, HubSpot) | The builder's own style settings, following the website guides at propellant.masschallenge.org |

## Production React apps

Install from GitHub at the latest release tag (check the releases of
`masschallenge/propellant-web`; it was v1.1.1 when this skill was last updated):

```bash
npm install github:masschallenge/propellant-web#v1.1.1
```

In the global stylesheet:

```css
@import 'tailwindcss';
@import '@masschallenge/propellant-web/styles.scoped.css';
@import '@masschallenge/propellant-web/utilities.css';
@source '../node_modules/@masschallenge/propellant-web/src';
```

Render the app inside an element with the `data-propellant` attribute, and build from the
package's components before writing your own: `AppShell` with `Sidebar` and `Toolbar` for
signed in apps, `AuthLayout` for sign in pages, `PageContainer`, `Button`, `Card`, `Banner`,
`Menu`, `Sheet`, form controls, `ListSection` and `ListRow`, `EmptyState`, `Avatar` and `Logo`.

- Style with the scoped tokens, such as `var(--tint)`, `var(--label)`, `var(--bg)`,
  `var(--separator)` and `var(--corner-lg)`, never raw hex values.
- Use the named text styles (`text-large-title`, `text-title2`, `text-headline`, `text-body`,
  `text-callout`, `text-footnote`) rather than sizes by eye.
- Signed in apps never use Oswald. Use Lato (named Propellant Sans in the package) throughout.
- Teal means actionable: buttons, links, selected controls and focus.
- Follow the package's own README and docs for anything not covered here.

## Prototypes, HTML artifacts and landing pages

Inline the whole of `assets/propellant-website.css` in a `<style>` tag, keeping its start and end
comments. It loads Lato and Oswald from Google Fonts and defines the brand tokens and classes. Put
`class="propellant-text"` on `<body>` so the whole page gets the font and text color, give the page
a White background, then use these classes:

| Class                                                            | Use it for                                                        |
| ---------------------------------------------------------------- | ----------------------------------------------------------------- |
| `propellant-text`                                                | On `<body>`: Lato and Ink text for the whole page                 |
| `propellant-headline`                                            | The one big headline, Oswald in capitals                          |
| `propellant-title-1`, `propellant-title-2`, `propellant-title-3` | Section headings, Lato Bold                                       |
| `propellant-body`, `propellant-text`                             | Paragraphs                                                        |
| `propellant-caption`                                             | Captions and small print                                          |
| `propellant-link`                                                | Links                                                             |
| `propellant-button`                                              | The primary button, a Teal pill                                   |
| `propellant-button propellant-button-secondary`                  | A secondary button, a Pale teal pill (both classes)               |
| `propellant-brand-band`                                          | A Deep teal section with White text; buttons inside it turn White |

The tokens are CSS custom properties on `:root`, such as `--tint`, `--label`, `--bg`, so you can
style your own elements with them. A minimal page:

```html
<body class="propellant-text">
  <section class="propellant-brand-band">
    <h1 class="propellant-headline">Demo day is here</h1>
    <p class="propellant-body">Meet the founders of the spring cohort.</p>
    <a class="propellant-button" href="#">Register to attend</a>
  </section>
  <section>
    <h2 class="propellant-title-2">What to expect</h2>
    <a class="propellant-button propellant-button-secondary" href="#">See the agenda</a>
  </section>
</body>
```

Text style sizes on the web (desktop, with mobile in brackets):

| Style                        | Font             | Weight | Size          |
| ---------------------------- | ---------------- | ------ | ------------- |
| Heading 1 (the big headline) | Oswald, capitals | 500    | 64 px (40 px) |
| Heading 2                    | Lato             | 700    | 40 px (30 px) |
| Heading 3                    | Lato             | 700    | 30 px (24 px) |
| Heading 4                    | Lato             | 700    | 24 px (20 px) |
| Paragraph large              | Lato             | 400    | 20 px (18 px) |
| Paragraph                    | Lato             | 400    | 17 px (16 px) |
| Small                        | Lato             | 400    | 14 px         |
| Button                       | Lato             | 700    | 16 px         |

## Web layout rules

- White page background, with Mist `#F3FBFC` for alternate sections and Deep teal `#044451`
  bands for brand moments.
- Sections about 96 px of padding top and bottom on desktop, 64 px on mobile.
- Paragraphs at most about 720 px wide.
- Cards and images rounded 12 px. Buttons are pills, padded about 14 px by 28 px.
- Put the full color logo at the start of the header on white; the white logo on Deep teal.
- Work at phone width: 16 px side gutters and no horizontal scrolling.
- For dashboards and charts, follow [charts.md](charts.md).

## Uploaded images

Photos and logos that people upload are never cropped by the interface. Show them whole with
`object-fit: contain` on a quiet background such as `var(--bg-secondary)`, and let the person crop
once, at upload. Only images MassChallenge owns, such as illustrations and chosen stock, may use
`object-fit: cover`.
