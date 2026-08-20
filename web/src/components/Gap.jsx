import useReveal from '../useReveal'

export default function Gap() {
  const ref = useReveal()
  return (
    <section ref={ref} className="py-24 rule">
      <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        {/* Diverging-lines chart: the program vs the graph */}
        <figure className="reveal">
          <svg viewBox="0 0 520 320" className="w-full h-auto" aria-label="Chart: edges the program actually has grows with complexity while the edges the graph records stays flat — the widening gap is the missing edges">
            {/* axes */}
            <line x1="50" y1="270" x2="490" y2="270" stroke="var(--line)" strokeWidth="1" />
            <line x1="50" y1="30" x2="50" y2="270" stroke="var(--line)" strokeWidth="1" />
            {/* gap fill */}
            <path d="M 50 250 C 200 235, 330 150, 480 55 L 480 195 C 330 215, 200 235, 50 252 Z"
              fill="rgba(255,87,26,0.08)" />
            {/* program line (rising) */}
            <path className="chart-line" d="M 50 250 C 200 235, 330 150, 480 55"
              fill="none" stroke="var(--ink)" strokeWidth="2" />
            {/* graph line (flat-ish) */}
            <path className="chart-line chart-line-2" d="M 50 252 C 200 235, 330 215, 480 195"
              fill="none" stroke="var(--accent)" strokeWidth="2" strokeDasharray="600" />
            {/* labels */}
            <text x="56" y="52" className="uppercase" style={{ font: "500 10px 'Geist Mono', monospace", letterSpacing: '0.1em', fill: 'var(--ink)' }}>
              EDGES THE PROGRAM HAS
            </text>
            <text x="300" y="245" style={{ font: "500 10px 'Geist Mono', monospace", letterSpacing: '0.1em', fill: 'var(--accent)' }}>
              EDGES THE GRAPH RECORDS
            </text>
            <text x="330" y="130" style={{ font: "italic 15px 'Instrument Serif', serif", fill: 'var(--muted)' }}>
              the missing edges
            </text>
            <text x="470" y="290" style={{ font: "500 10px 'Geist Mono', monospace", letterSpacing: '0.1em', fill: 'var(--muted)' }} textAnchor="end">
              CODEBASE COMPLEXITY →
            </text>
          </svg>
          <figcaption className="micro-label mt-3">
            The precision ceiling has sat flat at ~0.75 across eight years of django (study S5).
          </figcaption>
        </figure>

        {/* Editorial paragraph */}
        <div className="reveal">
          <p className="drop-cap text-[17px] leading-[1.75]" style={{ color: 'var(--ink-soft)' }}>
            Graph-based test selection, as practiced today, is unsafe in a way that is
            invisible from inside the tool. The agent walks its call graph backwards from a
            change, exhausts every edge the graph has, calls the walk complete — and skips
            the rest. But the walk can be provably complete with respect to the graph while
            the graph is missing the edge that mattered in the program. An extractor cannot
            fail-closed on an edge it never knew existed.
          </p>
          <p className="mt-5 text-[17px] leading-[1.75]" style={{ color: 'var(--ink-soft)' }}>
            substrate—friction is the thing that can: a gate between the agent and the skip.
          </p>
          <p className="mt-5 text-[17px] leading-[1.75] font-medium" style={{ color: 'var(--ink)' }}>
            It measures. It refuses. It certifies. It weighs the graph under every agent —
            and routes unproven maps to human verification.
          </p>
        </div>
      </div>
    </section>
  )
}
