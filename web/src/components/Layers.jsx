import useReveal from '../useReveal'

const blocks = [
  {
    label: 'THE QUESTION',
    title: 'Which graphs should\nthe robot not trust?',
    body: 'The founding brief asked which tickets to keep from the agent. The gate asks the question under that question. The answer lives in one measurable thing: what fraction of tests known to guard a fix does this graph let you reach?',
  },
  {
    label: 'THE MEASUREMENT',
    title: 'Two arms. One engine.\nOne verdict.',
    body: 'The same commit parsed twice — name-matched (what deployed agents build) and type-resolved (scip-python / pyright) — both resident in one HydraDB engine in disjoint id bands, diffed edge-for-edge at 2.0 ms per edge, in-engine, parity enforced by exception.',
  },
  {
    label: 'THE GATE',
    title: 'Everyone else assists.\nThis one refuses.',
    body: 'Most tooling stops at recommendations, leaving the skip decision to the agent. friction gate is fail-closed by construction: below the 0.95 bar it exits 1 — RUN_FULL — and an unmeasured graph can never license a skip. The refusal is the product working.',
  },
]

export default function Layers() {
  const ref = useReveal()
  return (
    <section ref={ref} id="where-it-sits" className="py-24 rule">
      <div className="max-w-6xl mx-auto px-6">
        <div className="reveal mb-16 flex items-baseline gap-6">
          <span className="micro-label">02 / WHERE IT SITS</span>
          <h2 className="font-serif-display text-[36px] sm:text-[44px] leading-[1.1]" style={{ color: 'var(--ink)' }}>
            A gate under the agent.
          </h2>
        </div>
        <p className="reveal micro-label mb-14 max-w-md">
          SUBSTRATE—FRICTION IS THE CERTIFICATION LAYER BETWEEN YOUR CODING AGENT
          AND THE TESTS IT WANTS TO SKIP.
        </p>

        <div className="grid md:grid-cols-3 gap-12">
          {blocks.map(b => (
            <div key={b.label} className="reveal">
              <div className="micro-label mb-4">{b.label}</div>
              <h3 className="font-serif-display text-[26px] leading-[1.15] whitespace-pre-line mb-4" style={{ color: 'var(--ink)' }}>
                {b.title}
              </h3>
              <p className="text-[15px] leading-[1.7]" style={{ color: 'var(--ink-soft)' }}>{b.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
