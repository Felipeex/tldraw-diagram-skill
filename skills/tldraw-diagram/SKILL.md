---
name: tldraw-diagram
description: 'Draw diagrams directly on a tldraw.com board (or any page running the tldraw editor) from a natural-language description, by driving the live editor through Claude in Chrome. Use when asked to "desenhar no tldraw", "draw in tldraw", or to create a flowchart, funnel, mind map, architecture, swimlane, sequence or ER diagram on a tldraw board / tldraw.com link. Adapted from excalidraw-diagram-generator (same diagram types and layout rules) but writes shapes into the open board instead of generating a file.'
---

# tldraw Diagram

Draws diagrams straight onto a tldraw board the user has open (usually a
`https://www.tldraw.com/f/<id>` link). Instead of producing a file, it runs
JavaScript against the page's `window.editor` (the tldraw `Editor`) through the
Claude in Chrome `javascript_tool`. The user watches the board fill in and can
edit everything by hand afterwards.

Diagram-type choice, extraction and layout rules come from the
`excalidraw-diagram-generator` skill; this skill replaces its output step.

## Prerequisites

- Claude in Chrome connected (load the `chrome-browser` skill first, then the
  tools in one ToolSearch: `tabs_context_mcp, tabs_create_mcp, navigate,
  computer, javascript_tool`).
- A tldraw board URL from the user. If they have none, open
  `https://www.tldraw.com` (a new local board) and tell them it is not saved to
  their account until they sign in / save it.
- The user must be able to edit the board (their own file, or shared with edit).

## Workflow

### 1. Understand the request

Same as excalidraw-diagram-generator: pick the diagram type, extract the
elements and relationships, keep it under ~20 main elements (split otherwise).

| Intent | Type | Recipe |
|---|---|---|
| Steps, process, decisions | Flowchart | `references/recipes.md#flowchart` |
| Marketing / sales stages | Funnel | `references/recipes.md#funnel` |
| Concept hierarchy | Mind map | `references/recipes.md#mind-map` |
| Components, data flow | Architecture / DFD | `references/recipes.md#architecture` |
| Who does what | Swimlane | `references/recipes.md#swimlane` |
| Messages over time | Sequence | `references/recipes.md#sequence` |
| Tables and relations | ER | `references/recipes.md#er` |

### 2. Open the board and inspect it

1. `tabs_context_mcp` → `tabs_create_mcp` (new tab) → `navigate` to the URL.
2. Check the editor exists and see what is already there:

```js
const ed = window.editor;
JSON.stringify(ed.getCurrentPageShapes().map(s => ({
  id: s.id, type: s.type, x: Math.round(s.x), y: Math.round(s.y),
  w: s.props.w, h: s.props.h,
  text: s.props.richText?.content?.map(p => p.content?.map(c => c.text).join('')).join(' / ')
})))
```

If `window.editor` is undefined, the page is not a tldraw editor (or not loaded
yet) — wait/screenshot once, then stop and ask.

3. Take a screenshot. **Never delete or move shapes you did not create.** Place
   the new diagram in free space (right of / below existing content, or under a
   title the user already wrote) and reuse any reference the user put on the
   board (e.g. an example image) as the model for structure and wording.

### 3. Draw

Paste `scripts/tldraw-helpers.js` at the top of the same `javascript_tool`
call (each call is a fresh scope), then build the diagram with it. Wrap the
whole creation in `ed.run(() => { ... })` so it is a single undo step.

- Give every shape an id with a common prefix
  (`shape:<diagram>-<n>`, the helpers do this) so later edits and cleanup can
  target only your shapes.
- Prefer labels **inside** geo shapes (`richText` on the geo) over separate
  text shapes; use separate text only for side notes and titles.
- Bind arrows to shapes (`helpers.connect`) so they follow when the user
  moves boxes.
- Default look = hand-drawn tldraw: `dash: 'draw'`, `font: 'draw'`. Switch to
  `dash: 'solid'`, `font: 'sans'` only when the user asks for a clean look.

### 4. Verify and fix

1. `ed.zoomToBounds(<diagram bounds>, { animation: { duration: 300 } })`, then a
   screenshot (`zoom` action on the diagram region to read small text).
2. Check overlaps with real sizes, not guesses: text height depends on font and
   size, so stack blocks with `ed.getShapePageBounds(id)` (`helpers.stack`).
3. Fix with `ed.updateShapes` on your ids; recreate only if the layout is wrong
   overall (delete by prefix with `helpers.clear(prefix)`).
4. `ed.selectNone()` before finishing so no selection handles show.

### 5. Report

Tell the user what was drawn (type, stages/elements), where on the board, and
offer adjustments (colors, style, extra data). Leave the tab open — it is the
user's board. Everything is saved by tldraw automatically; Ctrl/Cmd+Z undoes
the whole diagram in one step.

## Style changes users commonly ask for

| Request | Update |
|---|---|
| "estilo desenho", hand-drawn | `dash:'draw'`, text/geo `font:'draw'` |
| "tudo preto" / monochrome | every shape `color:'black'`, geo `fill:'none'` |
| strong colors | geo `fill:'fill'` (saturated) — `'solid'` is pastel |
| light tint | geo `fill:'semi'` |
| dark background panel | a `rectangle` with `color:'black', fill:'fill'`, sent behind your shapes only (`ed.sendToBack` then check z-order of pre-existing text) and all text `color:'white'` |
| no background | delete the background rectangle |

Apply style changes to your prefixed shapes only, with one `updateShapes` call.

## Gotchas (learned the hard way)

- `fill:'solid'` with `color:'black'` renders light grey in the light theme;
  use `fill:'fill'` for real black.
- Shapes created later are on top. A background rectangle sent to back can
  still cover older user shapes (e.g. a title) — bring those to front after.
- Trapezoids are narrow at the top. For a funnel use `flipY: true` (keeps the
  label upright) instead of rotating.
- `size:'s'` text is ~22px per line in `draw`/`sans`; multi-line notes next to
  short bands will overlap unless stacked by measured bounds.
- Shape ids must start with `shape:`; reuse of an existing id throws.
- `richText` is a TipTap doc, not a string — use `helpers.rt(lines)`.
- Don't trigger browser dialogs; don't touch menus/sharing; don't navigate away
  from the user's board.

## References

- `references/tldraw-shapes.md` — valid prop values (verified on tldraw.com)
- `references/recipes.md` — layout recipes per diagram type, including the funnel
- `scripts/tldraw-helpers.js` — helper functions to paste into `javascript_tool`
