---
name: propellant-brand
description: Makes everything created at MassChallenge follow Propellant, the MassChallenge design system, automatically. Use it whenever someone at MassChallenge creates or edits a web application, React or Next.js app, front end component or page, prototype, HTML artifact, dashboard, slide deck or PowerPoint, Word or Google document, memo, report, one pager, spreadsheet or Excel workbook, chart, social graphic or email, even when they do not mention the brand. Also use it for questions about MassChallenge colors, fonts, logo, photography, voice, messaging or approved figures. Covers React with the propellant-web package, plain HTML, PowerPoint, Word, Excel and Google Slides, Docs and Sheets.
---

# Propellant brand

Propellant is how MassChallenge looks, sounds and works. It applies the MassChallenge brand guide,
which MassChallenge Marketing owns and which sets the standard. When this skill is active, make the
output follow it automatically. Do not ask the person to choose colors or fonts, and do not offer
"unbranded" options: the brand is the default for everything made for MassChallenge.

Treat anything you make for someone at MassChallenge as MassChallenge work unless they say it is
for another organization or for themselves. Inherit the brand without being asked.

## Where the brand lives

Propellant is the source of truth for the MassChallenge brand. This copy of the skill was built
from propellant-web {{propellant-web}} and propellant-office {{propellant-office}}.

- If you can reach the web, [llms-full.txt](https://propellant.masschallenge.org/llms-full.txt)
  has the newest rules in plain text. When it differs from this skill, follow it.
- The figures in Propellant are always current. Quote them without an "as of" date.
- For facts about MassChallenge itself, such as programs, events, dates, people and offices, use
  [masschallenge.org](https://masschallenge.org/). Never invent them.

## Step 1: pick the reference for what you are making

| Making                                                                            | Read                                                       | Start from                                                                                     |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| A React app or production web page                                                | [references/web-and-apps.md](references/web-and-apps.md)   | The `@masschallenge/propellant-web` package                                                    |
| A change to an existing MassChallenge app or repository                           | [references/web-and-apps.md](references/web-and-apps.md)   | The Propellant components and tokens already in the code                                       |
| A prototype, HTML artifact, dashboard or landing page                             | [references/web-and-apps.md](references/web-and-apps.md)   | [assets/propellant-website.css](assets/propellant-website.css)                                 |
| A slide deck (PowerPoint or Google Slides)                                        | [references/presentations.md](references/presentations.md) | [assets/templates/propellant-presentation.pptx](assets/templates/propellant-presentation.pptx) |
| A document (Word or Google Docs)                                                  | [references/documents.md](references/documents.md)         | [assets/templates/propellant-document.docx](assets/templates/propellant-document.docx)         |
| A spreadsheet (Excel or Google Sheets)                                            | [references/spreadsheets.md](references/spreadsheets.md)   | [assets/templates/propellant-workbook.xlsx](assets/templates/propellant-workbook.xlsx)         |
| Anything with a chart                                                             | [references/charts.md](references/charts.md)               |                                                                                                |
| Anything with photos or video                                                     | [references/photography.md](references/photography.md)     |                                                                                                |
| Copy about MassChallenge: lines, boilerplate, figures, contact details, addresses | [references/messaging.md](references/messaging.md)         |                                                                                                |
| Graphics (pattern, overlay, lockups, stats, timelines, icons) or anything printed | [references/graphics.md](references/graphics.md)           |                                                                                                |
| A social post or graphic someone will make themselves                             | [references/graphics.md](references/graphics.md)           | The [content studio](https://propellant.masschallenge.org/studio/)                             |
| An email signature                                                                |                                                            | The [signature builder](https://propellant.masschallenge.org/studio/signature/)                |

For Office files, use the built-in document skills (docx, pptx, xlsx) for the file mechanics, but
always open the Propellant template from `assets/templates` instead of creating a blank file. The
template already has the theme colors, fonts, styles, layouts and logo. Then follow the matching
reference.

## Step 2: apply the brand essentials

These hold for every output.

### Color

| Name       | Hex       | Use it for                                                                      |
| ---------- | --------- | ------------------------------------------------------------------------------- |
| Navy       | `#10263F` | Dark sections, title slides, covers, table headers, gradients                   |
| Black      | `#222222` | Body text, and dark sections                                                    |
| Warm White | `#F8F8F5` | Light sections, alternate rows                                                  |
| White      | `#FFFFFF` | Page and slide backgrounds, text on dark                                        |
| Deep Teal  | `#004F73` | Dark sections                                                                   |
| Teal       | `#00708E` | Headings and links on light. Colored text on a light background is always Teal. |
| Cyan       | `#54EEFF` | Text and accents on Navy, Black or Deep Teal only                               |
| MC Blue    | `#0EABBC` | The logo and graphic shapes. Never text.                                        |
| MC Gray    | `#808285` | The logo only                                                                   |
| Ocean      | `#037AA6` | A gradient stop only: the MC Gradient runs from Navy to Ocean at any angle      |
| Yellow     | `#FFC801` | Warm accent: tags, rules, stats, with dark text on it                           |
| Orange     | `#FF6B35` | Warm accent, with dark text on it, never white                                  |
| Raspberry  | `#D14170` | Warm accent: shapes and rules on dark only                                      |
| Lime       | `#C6F135` | Warm accent: accents on dark                                                    |
| Gray 100   | `#DBE1E3` | Dividers, rules and table lines                                                 |

- Navy, Black and the blues carry most of every layout, with White and Warm White for light
  sections. Use one warm accent per piece, in small doses (a word, a tag, a rule, a stat), never as
  a large background.
- On light backgrounds colored text is Teal. On dark: White text, with Cyan or Lime for accents.
  Never Teal on Navy, White on MC Blue or White on Orange.
- Raspberry, Orange and Lime are decoration, never status. Show status with a word, and never by
  color alone.
- No other colors and no other gradients: only the MC Gradient and the hero overlay in the
  photography reference. The teal duotone is retired.
- For print, use the CMYK values and print substitutes in
  [references/graphics.md](references/graphics.md). They are approximate, so confirm with a printer
  proof. Never suggest or quote Pantone colors.

### Type

| Font   | Use it for                                                                                               |
| ------ | -------------------------------------------------------------------------------------------------------- |
| Oswald | Headlines in SemiBold, always capitals, line height 1.0. Eyebrows and subheads. Bold only for big stats. |
| Lato   | Reading text, line height 1.5, with Lato Bold for emphasis                                               |

- Eyebrows and tags: Oswald Regular, capitals, tracked +300 (0.3em). Subheads: Oswald SemiBold
  capitals, smaller than the headline.
- A two-tone headline sets the lead phrase in Black or White and the payoff in Teal on light or
  Cyan on dark.
- Never body copy in Oswald or in capitals. Never Oswald inside a signed in application: there,
  Lato does everything in sentence case.
- Where Oswald or Lato will not load, such as Office and email, use Aptos Narrow Bold in capitals
  for headers and Aptos for text. Never Arial. Gotham, Bebas, Arial, Montserrat and Open Sans are
  retired.

### Logo

- Use only the files in [assets/logos](assets/logos): the horizontal logo and the MC mark
  (`monogram`). The vertical logo is the default for most layouts, and local logos are for work
  tied to one site; both come from MassChallenge Marketing. Never draw or assemble them.
- The horizontal logo is for headers, footers, sponsor slides and banners. The MC mark is for
  places where the audience knows us, such as favicons, avatars and compact navigation.
- Full color only on White or Warm White. White on Navy, Black, Deep Teal, Teal, MC Blue or a photo
  with enough contrast, never on Cyan, Yellow or Lime. Black for one color print and light
  backgrounds the full color logo does not suit. On a busy photo, add the hero overlay or a solid
  block behind it.
- Clear space on every side equals the height of the M in the MASSCHALLENGE wordmark. At least
  160px wide on screen (30mm in print) for the horizontal logo, and 16px tall (8mm) for the MC mark.
- Never recolor, stretch, rotate, outline, add effects to, flip, crop, rearrange, rebuild or retype
  it, and never type a location next to it. Only MassChallenge Marketing makes lockups.
- Do not use the Propellant mark in place of the MassChallenge logo: it stands for the design
  system only.

### Shape and space

- On websites and public pages: buttons are fully rounded pills in Oswald capitals; cards and
  photos have square corners; sections alternate dark and light. See
  [references/web-and-apps.md](references/web-and-apps.md).
- In signed in applications: buttons are pills in Lato, sentence case, and cards keep their
  rounded corners, from the Propellant package.
- Generous space: when in doubt, add white space. Lines of running text stay near 68 characters.

### Voice

MassChallenge sounds bold and ambitious, founder first, and about outcomes and access. Read
[references/voice.md](references/voice.md) before writing more than a few lines, and
[references/messaging.md](references/messaging.md) before writing about MassChallenge itself. The
essentials:

- The primary line is "We back the rare humans with the grit to solve the toughest challenges."
  "It takes a community to raise a startup." is a founder testimonial, never a tagline.
- Use only the approved figures and the boilerplate as written.

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

It flags colors outside the palette (naming the retired Propellant colors and what replaces
them), fonts other than Lato, Oswald and the Aptos fallback, more than one warm accent, and em or en
dashes. Then look at the result (render slides or pages to images where you can) and confirm:

- [ ] Started from the Propellant template or stylesheet, not from scratch.
- [ ] Only palette colors, with Navy, Black and the blues carrying the layout and one warm accent.
- [ ] Oswald capitals for headlines, Lato for reading text.
- [ ] The right logo file for the background, once, unaltered, with its clear space.
- [ ] Sentence case for reading text and for everything in a signed in application.
- [ ] The writing leads with the point and has no em or en dashes.
- [ ] Alt text, real headings and readable contrast.

## When the person asks for something off brand

If someone asks for a different look for a MassChallenge piece, such as other colors or fonts,
explain briefly that the brand guide is the MassChallenge standard and offer the closest on brand
option. If they still want it, do it, and say it is outside the brand guidelines. Work with a
partner follows the partner lockup rules in [references/graphics.md](references/graphics.md);
only MassChallenge Marketing makes the lockup itself.

For work that is not for MassChallenge at all, this skill does not apply.

## More detail

- The full, human guides: [propellant.masschallenge.org](https://propellant.masschallenge.org)
- A short index for AI assistants: [llms.txt](https://propellant.masschallenge.org/llms.txt)
- The web package, with its components and tokens:
  [masschallenge/propellant-web](https://github.com/masschallenge/propellant-web)
