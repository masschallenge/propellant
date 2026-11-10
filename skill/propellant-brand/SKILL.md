---
name: propellant-brand
description: Applies Propellant, the MassChallenge design system, to anything made for or about MassChallenge, so it is on brand without the person asking. Use it whenever creating or editing a web app, prototype, web page, HTML artifact, dashboard, slide deck or presentation, Word or Google document, memo, report, one pager, spreadsheet, chart, email or social graphic for MassChallenge, or when someone asks for MassChallenge branding, colors, fonts, logo, photography or voice. Covers React apps, plain HTML, PowerPoint, Word, Excel and Google Slides, Docs and Sheets.
---

# Propellant brand

Propellant is how MassChallenge looks, sounds and works. When this skill is active, make the output
follow it automatically. Do not ask the person to choose colors or fonts, and do not offer
"unbranded" options: Propellant is the default for everything made for MassChallenge.

## Step 1: pick the reference for what you are making

| Making                                                | Read                                                       | Start from                                                                                     |
| ----------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| A React app or production web page                    | [references/web-and-apps.md](references/web-and-apps.md)   | The `@masschallenge/propellant-web` package                                                    |
| A prototype, HTML artifact, dashboard or landing page | [references/web-and-apps.md](references/web-and-apps.md)   | [assets/propellant-website.css](assets/propellant-website.css)                                 |
| A slide deck (PowerPoint or Google Slides)            | [references/presentations.md](references/presentations.md) | [assets/templates/propellant-presentation.pptx](assets/templates/propellant-presentation.pptx) |
| A document (Word or Google Docs)                      | [references/documents.md](references/documents.md)         | [assets/templates/propellant-document.docx](assets/templates/propellant-document.docx)         |
| A spreadsheet (Excel or Google Sheets)                | [references/spreadsheets.md](references/spreadsheets.md)   | [assets/templates/propellant-workbook.xlsx](assets/templates/propellant-workbook.xlsx)         |
| Anything with a chart                                 | [references/charts.md](references/charts.md)               |                                                                                                |
| Anything with photos or video                         | [references/photography.md](references/photography.md)     |                                                                                                |

For Office files, use the built-in document skills (docx, pptx, xlsx) for the file mechanics, but
always open the Propellant template from `assets/templates` instead of creating a blank file. The
template already has the theme colors, fonts, styles, layouts and logo. Then follow the matching
reference.

## Step 2: apply the brand essentials

These hold for every output.

### Color

| Name        | Hex       | Use it for                                                         |
| ----------- | --------- | ------------------------------------------------------------------ |
| Ink         | `#1E282B` | Body text and headings                                             |
| Slate       | `#4B575B` | Secondary text, captions                                           |
| White       | `#FFFFFF` | Page and slide backgrounds                                         |
| Mist        | `#F3F6F7` | Alternate sections and table rows                                  |
| Line        | `#DBE1E3` | Dividers and borders                                               |
| Teal        | `#065E6F` | Links, buttons and the first chart series. Never headings.         |
| Deep teal   | `#044451` | Brand surfaces: title slides, covers, dark sections, table headers |
| Bright teal | `#0FACBD` | Accents on Deep teal only, at 18 pt or larger                      |
| Pale teal   | `#D9F6FA` | Callouts, secondary buttons, tinted sections                       |
| Yellow      | `#FFC801` | Highlights, always with Ink text                                   |
| Magenta     | `#A30253` | Errors and things that are wrong. Never decorative.                |

- Mostly White with Ink text. Deep teal is for a few big moments, not every surface.
- On Deep teal: White text, White buttons with Deep teal text, Bright teal accents. Never Teal on
  Deep teal.
- Never show meaning by color alone: pair status colors with a word.
- Use no other colors. No gradients, except the photo duotone in the photography reference.

### Type

| Font   | Use it for                                                                                |
| ------ | ----------------------------------------------------------------------------------------- |
| Lato   | Everything: body, headings, labels, tables, buttons                                       |
| Oswald | Only the one big headline: a page hero, a document title, a slide title. Always capitals. |

- Only Oswald headlines are in capitals. Everything else, buttons and headings included, is in
  sentence case.
- Never use Oswald for paragraphs, bullets, tables or anything inside a signed in application.
- Bold Lato for headings, regular Lato for text. No other fonts. If Lato or Oswald cannot load,
  fall back to `system-ui, sans-serif`, never to a decorative font.

### Logo

- Use only the files in [assets/logos](assets/logos): `masschallenge-logo-horizontal-color.png`
  on white or light backgrounds, `-white.png` on Deep teal, dark surfaces and dark photos,
  `-black.png` for one color printing. The `monogram` files are for small spaces only.
- Place it once, in a corner, with clear space of half its height all around.
- Never recolor, stretch, crop, outline, add effects to, redraw or retype it. Never put the full
  color logo on Deep teal.
- Do not use the Propellant mark in place of the MassChallenge logo: it stands for the design
  system only.

### Shape and space

- Buttons are pills (fully rounded ends), with no borders, shadows or capitals.
- Round cards and photos by 12 px (about 3 mm in documents). Logos and charts stay square.
- Generous space: sections of about 96 px top and bottom on the web, wide margins in documents.
- Lines of running text stay near 68 characters.

### Voice

MassChallenge sounds bold and human: direct, plain spoken and on the side of the founders and
community we serve. Read [references/voice.md](references/voice.md) before writing more than a few
lines. The essentials:

- Lead with the point. Short sentences and everyday words.
- "We" for MassChallenge, "you" for the reader.
- No buzzwords (leverage, seamless, robust, synergy, unlock), no hype, no exclamation marks.
- Buttons and links say what happens: "Submit application", not "Click here".
- Use commas, colons and periods. **Never use em dashes or en dashes.**

### Accessibility

- Text contrast at least 4.5:1, control edges at least 3:1. The color pairings above pass when used
  as described.
- Real structure: headings, lists and slide titles from styles and layouts, not formatting.
- Alt text on every meaningful image and chart. Captions on every video.
- Keyboard access and visible focus in anything interactive.

## Step 3: check before you deliver

For Office files and HTML, run the checker and fix what it reports:

```bash
python3 scripts/check_brand.py path/to/output.pptx
```

It flags colors outside the palette, fonts other than Lato and Oswald, and em or en dashes. Then
look at the result (render slides or pages to images where you can) and confirm:

- [ ] Started from the Propellant template or stylesheet, not from scratch.
- [ ] Only palette colors, Lato and Oswald, with Oswald only on the big headline.
- [ ] The right logo file for the background, once, unaltered.
- [ ] Sentence case everywhere except Oswald headlines.
- [ ] The writing leads with the point and has no em or en dashes.
- [ ] Alt text, real headings and readable contrast.

## When the person asks for something off brand

If someone asks for a different look for a MassChallenge piece, such as other colors or fonts,
explain briefly that Propellant is the MassChallenge standard and offer the closest on brand
option. If they still want it, do it, and say it is outside the brand guidelines. Co-branded work
with a partner keeps the MassChallenge logo and rules for our part.

For work that is not for MassChallenge at all, this skill does not apply.

## More detail

The full, human guides are at [propellant.masschallenge.org](https://propellant.masschallenge.org).
