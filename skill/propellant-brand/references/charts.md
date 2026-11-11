# Charts

## Colors

Series colors come in this fixed order. In Office files they are the theme accents, so native
charts pick them up automatically; in HTML, set them in this order.

| Order | Name        | Hex       |
| ----- | ----------- | --------- |
| 1     | Teal        | `#065E6F` |
| 2     | Yellow      | `#FFC801` |
| 3     | Slate       | `#4B575B` |
| 4     | Bright teal | `#0FACBD` |
| 5     | Deep teal   | `#044451` |
| 6     | Gray 300    | `#848F92` |

- A single series is Teal. Most charts need only one series.
- The order follows the entity, not its rank: if a filter removes a series, the others keep their
  colors.
- Yellow, Bright teal and Gray 300 are light on White, so any chart with two or more series must show
  direct labels (series names or values on the chart) as well as a legend.
- Four series at most. Fold the rest into Other, or use small multiples.
- Never Magenta, Orange or Green for a series: they are reserved for status.
- This palette is the best available from today's brand colors; it does not meet every
  colorblind safety check on its own, which is why labels are required.

## Form

- Bar charts for comparing amounts, line charts for change over time. A single important number is
  a big number, not a chart.
- One value axis. Never two y axes: use two charts instead.
- No 3D, shadows, gradients or chart borders. Few, light gridlines in Gray 100 `#DBE1E3`.
- Pie charts only for two or three parts of a whole, with labels on the slices.
- Bars start at zero.

## Text

- Title states the takeaway: "Applications doubled since 2024", with the source below in Slate.
- Axis labels with units. Labels and values in Ink or Slate, never in the series color.
- Lato for all chart text.
- Alt text that states the takeaway and the key numbers, or a table of the data beside the chart.

## Interactive charts in HTML

Add a tooltip on hover for each mark, keep marks thin (2 px lines, bars with a 2 px gap), and put
any filters in one row above the chart.
