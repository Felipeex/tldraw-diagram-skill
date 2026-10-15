// tldraw-diagram helpers — paste at the top of a Claude in Chrome
// `javascript_tool` call on a page with `window.editor` (tldraw.com).
// Each call is a fresh scope, so paste again in every call that uses them.
//
//   const h = tldrawHelpers('funil')          // id prefix for this diagram
//   h.ed.run(() => {
//     const a = h.box(0, 0, 'Início', { geo: 'ellipse' })
//     const b = h.box(0, 160, 'Paga PIX')
//     h.connect(a, b, { label: 'sim' })
//   })

function tldrawHelpers(prefix, defaults = {}) {
  const ed = window.editor
  if (!ed) throw new Error('window.editor not found — not a tldraw page or not loaded yet')

  const base = { color: 'black', dash: 'draw', font: 'draw', size: 'm', ...defaults }
  let n = 0
  const nextId = () => {
    let id
    do id = `shape:${prefix}-${++n}`
    while (ed.getShape(id))
    return id
  }

  // TipTap doc from a string or an array of lines ('' = empty line)
  const rt = (lines) => ({
    type: 'doc',
    content: [].concat(lines).map((l) => ({
      type: 'paragraph',
      content: l ? [{ type: 'text', text: String(l) }] : [],
    })),
  })

  // Geo shape with an inside label. opts: geo, w, h, color, fill, dash, size, font, align, verticalAlign, flipY…
  function box(x, y, label, opts = {}) {
    const { w = 200, h = 90, geo = 'rectangle', ...rest } = opts
    const id = nextId()
    ed.createShape({
      id, type: 'geo', x, y,
      props: {
        geo, w, h, fill: 'none',
        color: base.color, dash: base.dash, font: base.font, size: base.size,
        richText: rt(label ?? ''), ...rest,
      },
    })
    return id
  }

  // Free text. opts: color, size, font, textAlign, w (fixed width → wraps)
  function text(x, y, lines, opts = {}) {
    const { w, ...rest } = opts
    const id = nextId()
    ed.createShape({
      id, type: 'text', x, y,
      props: {
        color: base.color, font: base.font, size: base.size,
        richText: rt(lines),
        ...(w ? { autoSize: false, w } : {}),
        ...rest,
      },
    })
    return id
  }

  // Arrow bound to two shapes (follows them when moved). opts: label, bend, kind ('arc'|'elbow'), dash, color, arrowheadStart/End, fromAnchor/toAnchor {x,y} in 0..1
  function connect(fromId, toId, opts = {}) {
    const { label, fromAnchor = { x: 0.5, y: 0.5 }, toAnchor = { x: 0.5, y: 0.5 }, ...rest } = opts
    const a = ed.getShapePageBounds(fromId)
    const id = nextId()
    ed.createShape({
      id, type: 'arrow', x: a.midX, y: a.midY,
      props: {
        start: { x: 0, y: 0 }, end: { x: 1, y: 1 },
        color: base.color, dash: base.dash, font: base.font, size: 's',
        ...(label ? { richText: rt(label) } : {}),
        ...rest,
      },
    })
    const bind = (toShape, terminal, anchor) => ({
      type: 'arrow', fromId: id, toId: toShape,
      props: { terminal, normalizedAnchor: anchor, isExact: false, isPrecise: false },
    })
    ed.createBindings([bind(fromId, 'start', fromAnchor), bind(toId, 'end', toAnchor)])
    return id
  }

  // Unbound arrow between two page points
  function arrow(x1, y1, x2, y2, opts = {}) {
    const { label, ...rest } = opts
    const id = nextId()
    ed.createShape({
      id, type: 'arrow', x: x1, y: y1,
      props: {
        start: { x: 0, y: 0 }, end: { x: x2 - x1, y: y2 - y1 },
        color: base.color, dash: base.dash, font: base.font, size: 's',
        ...(label ? { richText: rt(label) } : {}),
        ...rest,
      },
    })
    return id
  }

  // Move shapes down so each starts at least `gap` below the previous one's real bottom.
  // Use after creating multi-line text blocks whose height you can't predict.
  function stack(ids, gap = 16) {
    let bottom = -Infinity
    for (const id of ids) {
      const s = ed.getShape(id)
      const b = ed.getShapePageBounds(id)
      const y = Math.max(s.y, bottom + gap)
      if (y !== s.y) ed.updateShape({ id, type: s.type, y })
      bottom = y + b.h
    }
  }

  const mine = () => ed.getCurrentPageShapes().filter((s) => s.id.startsWith(`shape:${prefix}-`))
  const bounds = () => ed.getShapesPageBounds(mine().map((s) => s.id))
  const clear = () => ed.deleteShapes(mine().map((s) => s.id))

  // Free spot to the right of everything already on the page
  function freeOrigin(margin = 120) {
    const all = ed.getCurrentPageShapes()
    if (!all.length) return { x: 0, y: 0 }
    const b = ed.getShapesPageBounds(all.map((s) => s.id))
    return { x: b.maxX + margin, y: b.y }
  }

  function show() {
    const b = bounds()
    if (b) ed.zoomToBounds(b.clone().expandBy(80), { animation: { duration: 300 } })
    ed.setCurrentTool('select')
    ed.selectNone()
  }

  return { ed, rt, box, text, connect, arrow, stack, mine, bounds, clear, freeOrigin, show }
}
