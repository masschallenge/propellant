# Spreadsheets (Excel and Google Sheets)

## Start from the template

Open `assets/templates/propellant-workbook.xlsx`. It has the Propellant theme (Lato as the default
font and the brand chart colors), a **Start here** sheet with the logo and a title, and an
**Example data** sheet with a styled table and a chart. Keep the Start here sheet, update its title
and description, and replace the example data. Remove the "Example only" note once the data is
real.

## Rules

- **Start here sheet:** what the workbook answers, who it is for, where the data comes from and
  when it was last updated.
- **Sheet names** describe the contents, such as "Budget 2026", never "Sheet1".
- **One table per sheet**, starting near the top left, with the header in one row and no blank
  rows or columns inside it.
- **Sheet title:** Oswald SemiBold, 24 pt, Teal `#00708E`, typed in capitals, above the table.
- **Header row:** Lato Bold 11 pt, White on Navy `#10263F`, sentence case, with units, such as
  "Budget (USD)". Freeze it.
- **Cells:** Lato 11 pt, Black `#222222`. Warm White `#F8F8F5` stripes on alternate rows. Where
  Lato will not load, Aptos, never Arial.
- **Numbers:** right aligned, thousands separators, the same decimals down a column, real dates.
  Negative numbers with a minus sign, never red alone.
- **Status:** a word in its own column (On track, At risk, Late). The word carries the meaning.
  Never use Raspberry, Orange or Lime to show status: they are decorative brand accents. One
  highlight color at most, such as Yellow `#FFC801` with Black text.
- **No merged cells** in tables, no hidden data others depend on, gridlines off on summary sheets.
- **Formulas** others can follow: put inputs in labeled cells rather than typing numbers into
  formulas.
- **Charts:** native charts so they use the theme colors; follow [charts.md](charts.md).

Never fill a spreadsheet with made up numbers presented as real. If example values are needed,
label them clearly as examples.

## Google Sheets

Google Sheets opens the same `.xlsx` with the formatting intact. To set brand colors for new charts
there: **Format**, then **Theme**, then **Customize**: font Lato, text Black `#222222`, accents
in the order Teal `#00708E`, Yellow `#FFC801`, Navy `#10263F`, MC Blue `#0EABBC`, Deep Teal
`#004F73`, Gray `#848F92`, links Teal.
