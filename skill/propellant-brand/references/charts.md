# Charts

## Colors

Series colors come in this fixed order. In Office files they are the theme accents, so native
charts pick them up automatically; in HTML, set them in this order.

| Order | Name      | Hex       |
| ----- | --------- | --------- |
| 1     | Teal      | `#00708E` |
| 2     | Yellow    | `#FFC801` |
| 3     | Navy      | `#10263F` |
| 4     | MC Blue   | `#0EABBC` |
| 5     | Deep Teal | `#004F73` |
| 6     | Gray 300  | `#848F92` |

- A single series is Teal. Most charts need only one series.
- The order follows the entity, not its rank: if a filter removes a series, the others keep their
  colors.
- Yellow, MC Blue and Gray 300 are light on White, so any chart with two or more series must show
  direct labels (series names or values on the chart) as well as a legend.
- Four series at most. Fold the rest into Other, or use small multiples.
- Never Raspberry, Orange or Lime for a series, and never to show status. Status is a word.
- This order is how Propellant applies the brand palette to charts; it does not meet every
  colorblind safety check on its own, which is why labels are required.

## Form

- Bar charts for comparing amounts, line charts for change over time. A single important number is
  a big number, not a chart.
- One value axis. Never two y axes: use two charts instead.
- No 3D, shadows, gradients or chart borders. Few, light gridlines in Gray 100 `#DBE1E3`.
- Pie charts only for two or three parts of a whole, with labels on the slices.
- Bars start at zero.

## Text

- Title states the takeaway: "Applications doubled since 2024", with the source below in Black at a
  smaller size.
- Axis labels with units. Labels and values in Black, never in the series color.
- Lato for all chart text, or Aptos where Lato will not load. Never Arial.
- Alt text that states the takeaway and the key numbers, or a table of the data beside the chart.

## Interactive charts in HTML

Add a tooltip on hover for each mark, keep marks thin (2 px lines, bars with a 2 px gap), and put
any filters in one row above the chart.
