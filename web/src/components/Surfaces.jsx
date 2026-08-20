import useReveal from '../useReveal'

const cards = [
  {
    tag: 'CI',
    name: 'Gate',
    body: 'A failed gate blocks the merge and ships the verdict as a SARIF code-scanning finding — "unsafe test skip" in the security tab. Ten lines of YAML, two minutes.',
    mono: 'uses: areycruzer/substrate-friction@main',
  },
  {
    tag: 'AGENT · MCP',
    name: 'Abstain',
    body: 'Over MCP the agent asks the gate before trusting its own map, and backs off on refusal. Three task-shaped tools: gate_check, gate_explain, graph_query.',
    mono: '"command": "friction-mcp"',
  },
  {
    tag: 'TERMINAL',
    name: 'Triage',
    body: 'Point it at any repo, PR, or issue. Blast radius, selected tests, prior and bound — a four-tier verdict in one command, ~1 s for out-of-scope changes.',
    mono: 'friction triage <pr-url>',
  },
  {
    tag: 'EVIDENCE',
    name: 'Certify',
    body: 'Every edge labelled confirmed or name_only with arm provenance, source commit and engine digest — a graph with receipts, queryable over MCP.',
    mono: 'data/shipped/consensus.json',
  },
]

export default function Surfaces() {
  const ref = useReveal()
  return (
    <section ref={ref} id="surfaces" className="py-24 rule">
      <div className="max-w-6xl mx-auto px-6">
        <div className="reveal mb-4 micro-label">04 / YOUR STACK IS OUR STACK</div>
        <h2 className="reveal font-serif-display text-[36px] sm:text-[44px] leading-[1.1] mb-4" style={{ color: 'var(--ink)' }}>
          One measurement.<br />Four surfaces.
        </h2>
        <p className="reveal text-[15px] max-w-md mb-16" style={{ color: 'var(--ink-soft)' }}>
          The same fail-closed verdict, delivered wherever the skip decision
          happens. Composable, digest-pinned, and fully re-derivable.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px rounded-2xl overflow-hidden" style={{ background: 'var(--line)' }}>
          {cards.map((c, ci) => (
            <div key={c.name} className="reveal lift p-7 flex flex-col gap-4" style={{ background: 'var(--paper)' }}>
              {/* dithered dot-grid glyph, one per card */}
              <svg viewBox="0 0 64 40" className="w-16 h-10" aria-hidden="true">
                {Array.from({ length: 8 }, (_, row) =>
                  Array.from({ length: 13 }, (_, col) => {
                    const cx = 4 + col * 4.6, cy = 4 + row * 4.6
                    // each card gets a different density falloff shape
                    const shapes = [
                      Math.hypot(cx - 10, cy - 20) / 30,            // Gate: left core
                      Math.abs(cy - 20) / 18,                       // Abstain: horizontal band
                      Math.hypot(cx - 32, cy - 20) / 26,            // Triage: center burst
                      (Math.abs(cx - 32) + Math.abs(cy - 20)) / 34, // Certify: diamond
                    ]
                    const d = shapes[ci]
                    const on = ((row * 13 + col * 7) % 9) / 9 > d
                    return on ? <circle key={`${row}-${col}`} cx={cx} cy={cy} r={1.4 - d} fill="var(--ink)" opacity={0.9 - d * 0.5} /> : null
                  })
                )}
              </svg>
              <div className="micro-label" style={{ color: 'var(--accent)' }}>{c.tag}</div>
              <h3 className="font-serif-display text-[28px]" style={{ color: 'var(--ink)' }}>{c.name}</h3>
              <p className="text-[14px] leading-[1.7] flex-1" style={{ color: 'var(--ink-soft)' }}>{c.body}</p>
              <code className="text-[11px] px-3 py-2 rounded-lg" style={{ fontFamily: "'Geist Mono', monospace", background: 'rgba(26,22,20,0.06)', color: 'var(--ink-soft)' }}>
                {c.mono}
              </code>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
