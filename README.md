# tldraw-diagram skill

An agent skill (Claude Code and other [agent skills](https://skills.sh/)
compatible agents) that **draws diagrams live on a tldraw board**. Instead of
generating a file, the agent opens your [tldraw.com](https://www.tldraw.com)
board through the **Claude in Chrome** extension and drives the page's
`window.editor` (the tldraw `Editor` API), so you watch the diagram appear
and can keep editing it by hand.

## Why

File generators (Excalidraw JSON, Mermaid, SVG…) make you download, import and
re-layout. This skill writes straight into the board you already use:

- shapes land next to what is already there, without touching your content;
- arrows are **bound** to shapes, so they follow when you move boxes;
- the whole diagram is one undo step (`Cmd/Ctrl+Z`);
- the agent screenshots the result and fixes overlaps using real text sizes.

## Requirements

- An agent that supports skills (e.g. [Claude Code](https://claude.com/claude-code)).
- The **Claude in Chrome** extension connected to the agent.
- A tldraw board you can edit (your own `tldraw.com/f/...` file, or one shared
  with edit access). Without a URL the agent opens a new local board.

## Install

```bash
npx skills add Felipeex/tldraw-diagram-skill
```

Or copy manually:

```bash
git clone https://github.com/Felipeex/tldraw-diagram-skill
cp -R tldraw-diagram-skill/skills/tldraw-diagram ~/.claude/skills/      # all projects
# or: cp -R tldraw-diagram-skill/skills/tldraw-diagram .claude/skills/  # this project only
```

## Usage

Just ask, with the board link:

- "Draw a sales funnel on this tldraw board: https://www.tldraw.com/f/…"
- "Make a flowchart of our checkout on my tldraw board, hand-drawn, all black"
- "Add an ER diagram of the `users`, `orders` and `payments` tables to this board"
- "Redo the diagram with strong colors" / "remove the background"

## Supported diagrams

| Type | Use for |
|---|---|
| Flowchart | steps, decisions |
| Funnel | marketing / sales stages, with side notes and a referral loop |
| Mind map | concept hierarchies |
| Architecture / data flow | components and connections |
| Swimlane | who does what |
| Sequence | messages over time |
| ER | tables and relations |

Layout recipes for each are in [`skills/tldraw-diagram/references/recipes.md`](skills/tldraw-diagram/references/recipes.md).

## Helpers API

[`scripts/tldraw-helpers.js`](skills/tldraw-diagram/scripts/tldraw-helpers.js)
is pasted into the page by the agent. `const h = tldrawHelpers('prefix')` gives:

| Helper | What it does |
|---|---|
| `box(x, y, label, opts)` | geo shape (rectangle, ellipse, diamond, trapezoid…) with the label inside |
| `text(x, y, lines, opts)` | free text, one or many lines; `w` for a fixed, wrapping width |
| `connect(fromId, toId, opts)` | arrow bound to two shapes (`label`, `kind: 'elbow'`, `bend`, `dash`…) |
| `arrow(x1, y1, x2, y2, opts)` | unbound arrow between two points |
| `stack(ids, gap)` | pushes shapes down so none overlaps, using measured sizes |
| `mine()` | shapes created with this prefix |
| `bounds()` | bounding box of those shapes |
| `clear()` | deletes only those shapes |
| `freeOrigin(margin)` | free spot to the right of everything on the page |
| `show()` | zooms to the diagram, selects the select tool, clears selection |

Every shape gets an id `shape:<prefix>-<n>`, so later edits and cleanup never
touch your own shapes. Valid prop values are listed in
[`references/tldraw-shapes.md`](skills/tldraw-diagram/references/tldraw-shapes.md).

## Style tips

- Default look is hand-drawn: `dash: 'draw'`, `font: 'draw'`, black.
- Strong colors: `fill: 'fill'`. `fill: 'solid'` is pastel — and black +
  `solid` renders light grey, so real black needs `fill: 'fill'`.
- Light tint: `fill: 'semi'`.
- Funnels: `trapezoid` with `flipY: true` (wide on top, label stays upright).

## Limitations

- Needs the live tldraw editor exposed as `window.editor` (true on
  tldraw.com). Verified on tldraw.com in October 2026; it uses the editor's
  API from the page, which tldraw may change.
- Works only where the agent can drive your browser (Claude in Chrome).
- Best for up to ~20 main elements per diagram; split bigger ones.

## Credits

Adapted from the
[`excalidraw-diagram-generator`](https://github.com/github/awesome-copilot/tree/main/skills/excalidraw-diagram-generator)
skill in [github/awesome-copilot](https://github.com/github/awesome-copilot)
(MIT License): diagram types, extraction steps and layout rules come from it;
the output step was rewritten to draw on a live tldraw board.
tldraw is a product of tldraw, Inc.; this project is not affiliated with it.

## License

[MIT](LICENSE)
