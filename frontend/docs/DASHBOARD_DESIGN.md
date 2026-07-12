# Dashboard Design System

## Colors
- `--bg`: `#F7F7F8`
- Primary accent: `#FF5A3C`
- Secondary accent: `#8B7FE8`
- Black: `#111111`
- White: `#FFFFFF`
- Neutral gray: `#C9CCD3`
- Border gray: `#E5E7EB`

## Typography
- Page title: `38px-40px`, `font-black`, black
- Section headings: `14px-16px`, `font-black`, uppercase, wide tracking
- Card labels: `14px`, medium weight
- Stat values: `34px`, `font-black`
- Meta text: `10px-12px`, muted gray

## Card Styles
- Radius: `24px`
- Surface: white fill
- Shadow: soft ambient shadow, no heavy outline-only treatment
- Filled stat cards: solid orange-red, solid purple, white, or black depending on metric
- Icon treatment: small rounded square or soft icon tile inside the card

## Charts
- Bar chart: solid black bars, one highlighted orange bar for current day
- Bar corners: rounded top corners
- Highlight callout: small orange tooltip above current bar
- Donut chart: thick ring with gray, purple, orange segments
- Legend: colored dots with text labels below the chart

## Spacing and Grid
- Main layout: existing 12-column grid preserved
- Card gaps: `24px`-ish rhythm using `gap-6` to `gap-8`
- Dashboard sections stack in left sidebar and center content blocks without changing the overall structure

## Components
- Profile card
- Navigation card
- Focus card
- Layer Selector
- Value Threshold
- Operations Status
- Stat cards
- Daily Activity bar chart
- Asset Mix donut chart
- Platform Quick Actions
- Logistics Feed
- Operational Summary bar
- Verified Asset Architectures row