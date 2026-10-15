# Layout recipes

All recipes assume `const h = tldrawHelpers('<prefix>')` was pasted and run,
and `{ x: X, y: Y } = h.freeOrigin()` (or a spot under the user's title).
Spacing from excalidraw-diagram-generator: 200–300 px horizontal, 100–150 px
vertical between elements.

## Flowchart

Vertical, top to bottom. Start/end as `ellipse`, steps as `rectangle`,
decisions as `diamond` (wider: `w: 220, h: 120`). Branches go right.

```js
h.ed.run(() => {
  const steps = ['Início', 'Escolhe estilo', 'Envia foto', 'Paga PIX', 'Recebe por e-mail']
  let prev
  steps.forEach((label, i) => {
    const id = h.box(X, Y + i * 150, label, { geo: i === 0 || i === steps.length - 1 ? 'ellipse' : 'rectangle', w: 220, h: 80 })
    if (prev) h.connect(prev, id)
    prev = id
  })
  // decision branch example:
  // const d = h.box(X, y, 'Pagou?', { geo: 'diamond', w: 220, h: 120 })
  // h.connect(d, yesId, { label: 'sim' }); h.connect(d, noId, { label: 'não', kind: 'elbow' })
})
h.show()
```

## Funnel

Stacked `trapezoid`s with `flipY: true`, width shrinking linearly; stage name
inside; action + notes to the right, joined by dashed arrows; optional loop
arrow on the left (e.g. referral back to the top).

```js
const stages = [
  { name: 'DESCONHECIDOS', action: 'ATRAIR', notes: ['Anúncios no Meta', 'Pixel + CAPI'] },
  { name: 'VISITANTES', action: 'ENGAJAR', notes: ['Escolhe o estilo', 'Envia 1–3 fotos'] },
  { name: 'PIX GERADO', action: 'CONVERTER', notes: ['PIX + extras', 'Lembretes 1 h e 24 h'] },
  { name: 'CLIENTE', action: 'ENTREGAR', notes: ['Foto por e-mail'] },
  { name: 'DIVULGADOR', action: 'ENCANTAR', notes: ['Compartilha'] },
]
const TOP_W = 560, BOT_W = 220, BAND_H = 100, GAP = 10
const cx = X + TOP_W / 2, NOTE_X = X + TOP_W + 90
h.ed.run(() => {
  const notes = []
  stages.forEach((s, i) => {
    const wTop = TOP_W - (TOP_W - BOT_W) * (i / stages.length)
    const wBot = TOP_W - (TOP_W - BOT_W) * ((i + 1) / stages.length)
    const y = Y + i * (BAND_H + GAP)
    h.box(cx - wTop / 2, y, s.name, { geo: 'trapezoid', flipY: true, w: wTop, h: BAND_H })
    const title = h.text(NOTE_X, y - 4, s.action)
    const body = h.text(NOTE_X, y + 26, s.notes, { size: 's' })
    notes.push({ title, body, fromX: cx + (wTop + wBot) / 4 + 10, fromY: y + BAND_H / 2 })
  })
  // keep notes from overlapping, then point arrows at their final position
  h.stack(notes.flatMap((n) => [n.title, n.body]), 12)
  notes.forEach((n) => {
    const t = h.ed.getShapePageBounds(n.title)
    h.arrow(n.fromX, n.fromY, NOTE_X - 12, t.midY, { dash: 'dashed' })
  })
})
h.show()
```

For strong colors per band add `color` + `fill: 'fill'` to each trapezoid and
`labelColor: 'white'`.

## Mind map

Center `ellipse`, branches on a circle (radius 320), sub-topics on an outer
circle (radius 560) near their branch angle, `connect` center→branch→sub.

```js
const angle = (2 * Math.PI * i) / branches.length
const bx = CX + 320 * Math.cos(angle) - 100, by = CY + 320 * Math.sin(angle) - 40
```

## Architecture

Left-to-right layers (client → API → services → storage), each layer a column
300 px apart; group a layer with a `frame` when it has 3+ items. Storage as
`geo: 'oval'` or a `rectangle` labelled "(DB)". `connect` with labels for
protocols (HTTPS, webhook, cron).

## Swimlane

One `frame` (or tall `rectangle`, `dash:'dashed'`, `fill:'none'`) per actor,
side by side, 280 px wide, actor name as the frame name. Activities as
`rectangle` in their lane, top to bottom in time order; cross-lane handoffs
with `connect(..., { kind: 'elbow' })`.

## Sequence

Actors as `rectangle` along the top 260 px apart; lifelines as dashed unbound
`arrow`s straight down with `arrowheadEnd: 'none'`; messages as horizontal
unbound arrows 70 px apart in time order, `richText` label; replies with
`dash: 'dashed'`.

## ER

Each table a `rectangle`, `align: 'start'`, `verticalAlign: 'start'`, label =
`['TableName', '', 'id PK', 'theme_id FK', '…']`, `font: 'mono'`, `size: 's'`.
Relations with `connect(..., { kind: 'elbow', label: '1:N' })`.
