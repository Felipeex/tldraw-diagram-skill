# tldraw shape props (verified on tldraw.com, Oct 2026)

All shapes: `{ id: 'shape:…', type, x, y, rotation?, opacity?, props }`.
Positions are page coordinates of the top-left corner.

## Shared enums

| Prop | Values |
|---|---|
| `color` | `black` `grey` `light-violet` `violet` `blue` `light-blue` `yellow` `orange` `green` `light-green` `light-red` `red` `white` |
| `fill` | `none` `semi` (light tint) `solid` (pastel) `pattern` `fill` (saturated) `lined-fill` |
| `dash` | `draw` (hand-drawn) `solid` `dashed` `dotted` `none` |
| `size` | `s` `m` `l` `xl` (stroke width + font size) |
| `font` | `draw` (handwriting) `sans` `serif` `mono` |

## `geo`

Props: `geo, w, h, color, labelColor, fill, dash, size, font, align,
verticalAlign, richText, growY, url, scale, flipX, flipY`.

`geo` values: `rectangle` `ellipse` `oval` `diamond` `triangle` `trapezoid`
`pentagon` `hexagon` `octagon` `star` `rhombus` `rhombus-2` `cloud`
`arrow-right` `arrow-left` `arrow-up` `arrow-down` `x-box` `check-box` `heart`.

- `align`: `start` `middle` `end`; `verticalAlign`: `start` `middle` `end`.
- `richText` is the label inside the shape; the shape grows (`growY`) if the
  label does not fit.
- `trapezoid` is narrow at the top; `flipY: true` makes it wide at the top.

## `text`

Props: `richText, color, size, font, textAlign (start|middle|end), w,
autoSize, scale`.

- `autoSize: true` (default) → width follows the text.
- `autoSize: false` + `w` → fixed width, wraps; use with `textAlign:'middle'`
  to center a label over something.

## `arrow`

Props: `kind (arc|elbow), start {x,y}, end {x,y}, bend, color, labelColor,
fill, dash, size, font, arrowheadStart, arrowheadEnd, richText (label),
labelPosition (0–1), elbowMidPoint, scale`.

- `start`/`end` are relative to the arrow's `x, y`.
- Arrowheads: `arrow` `triangle` `square` `dot` `pipe` `diamond` `inverted`
  `bar` `none`.
- `bend` (px) curves an `arc` arrow; sign flips the side.
- `kind:'elbow'` gives right-angle connectors (good for flowcharts/ER).

### Binding an arrow to shapes

```js
ed.createBindings([
  { type: 'arrow', fromId: arrowId, toId: shapeA,
    props: { terminal: 'start', normalizedAnchor: { x: .5, y: .5 }, isExact: false, isPrecise: false } },
  { type: 'arrow', fromId: arrowId, toId: shapeB,
    props: { terminal: 'end',   normalizedAnchor: { x: .5, y: .5 }, isExact: false, isPrecise: false } },
])
```

The arrow is then routed edge-to-edge and follows the shapes when moved.

## `note` (sticky note)

Props include `color, labelColor, size, font, align, verticalAlign, richText,
fontSizeAdjustment, growY, url, scale`. Fixed 200×200.

## `frame`

`{ type: 'frame', props: { w, h, name } }` — a titled container; shapes are
put inside with `ed.reparentShapes(ids, frameId)`.

## Useful editor calls

| Call | Use |
|---|---|
| `ed.getCurrentPageShapes()` | list shapes |
| `ed.getShapePageBounds(id)` | real size after text layout |
| `ed.getShapesPageBounds(ids)` | bounds of a group |
| `ed.createShapes([...])` / `ed.updateShapes([...])` / `ed.deleteShapes(ids)` | edit |
| `ed.run(() => {...})` | batch as one undo step |
| `ed.bringToFront(ids)` / `ed.sendToBack(ids)` / `ed.bringForward(ids)` | z-order |
| `ed.zoomToBounds(box, { animation: { duration: 300 } })` / `ed.zoomToFit()` | camera |
| `ed.selectNone()` | clear selection before screenshots |
| `ed.toImage(ids, { format: 'png', scale: 2, background: true })` | export blob |
