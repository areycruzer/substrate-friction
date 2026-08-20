import useReveal from '../useReveal'

const posts = [
  {
    tag: 'STUDY S1',
    date: '2026',
    title: 'The verdict: no graph class measured clears the bar',
    body: 'Pooled recall 0.419 across 172 labelled instances and 7 repos. The pre-registered hypothesis — that pooled recall would sit in the django band — came back wrong and ships as-written.',
    href: 'https://github.com/areycruzer/substrate-friction/blob/main/docs/gate.md',
    read: 'docs/gate.md',
  },
  {
    tag: 'NEGATIVE CONTROL',
    date: '2026',
    title: 'The instrument detects degradation, provably',
    body: 'Delete a seeded random fraction of edges and recall falls monotonically 0.545 → 0.455 → 0.295 → 0.068 → 0.000, reproducing the headline exactly at 0% deletion.',
    href: 'https://github.com/areycruzer/substrate-friction/blob/main/docs/negative-control.md',
    read: 'docs/negative-control.md',
  },
  {
    tag: 'STUDY S5',
    date: '2026',
    title: 'Eight years of django, one flat line',
    body: 'The registered hypothesis — that the precision ceiling declines as a codebase grows — is wrong, the third falsified pre-registration in this project. The ceiling sits flat at ~0.75 from django 1.11 to 5.0.',
    href: 'https://github.com/areycruzer/substrate-friction/blob/main/docs/longitudinal.md',
    read: 'docs/longitudinal.md',
  },
]

export default function ResearchLog() {
  const ref = useReveal()
  return (
    <section ref={ref} id="research-log" className="py-24 rule">
      <div className="max-w-6xl mx-auto px-6">
        <div className="reveal flex items-end justify-between mb-14">
          <div>
            <div className="micro-label mb-4">06 / STAY HONEST</div>
            <h2 className="font-serif-display text-[36px] sm:text-[44px] leading-[1.1]" style={{ color: 'var(--ink)' }}>
              From the measurement log.
            </h2>
          </div>
          <a 
            href="https://github.com/areycruzer/substrate-friction/blob/main/docs/studies.md" 
            className="pill-dashed hidden sm:inline-flex group"
          >
            {/* Corner Brackets */}
            <span className="absolute top-[-3px] left-[-3px] w-1.5 h-1.5 border-t border-l border-ink/40 group-hover:border-accent group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
            <span className="absolute top-[-3px] right-[-3px] w-1.5 h-1.5 border-t border-r border-ink/40 group-hover:border-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
            <span className="absolute bottom-[-3px] left-[-3px] w-1.5 h-1.5 border-b border-l border-ink/40 group-hover:border-accent group-hover:-translate-x-0.5 group-hover:translate-y-0.5 transition-all duration-300" />
            <span className="absolute bottom-[-3px] right-[-3px] w-1.5 h-1.5 border-b border-r border-ink/40 group-hover:border-accent group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-all duration-300" />
            View all studies
          </a>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {posts.map((p, idx) => (
            <a 
              key={p.title} 
              href={p.href} 
              className={`reveal group block border border-line rounded-xl overflow-hidden bg-paper-deep/60 hover:scale-[1.01] hover:bg-paper-deep transition-all duration-300 shadow-sm reveal-delay-${idx * 100}`}
            >
              <div className="p-6 flex flex-col justify-between h-full min-h-[300px]">
                <div>
                  <div className="flex items-center justify-between gap-3 mb-5 pb-3 border-b border-line/60">
                    <span className="micro-label" style={{ color: 'var(--accent)' }}>{p.tag}</span>
                    <span className="micro-label text-muted">{p.date}</span>
                  </div>
                  <h3 className="font-serif-display text-[24px] leading-[1.2] mb-4 group-hover:text-accent transition-colors duration-200" style={{ color: 'var(--ink)' }}>
                    {p.title}
                  </h3>
                  <p className="text-[14.5px] leading-[1.65] mb-6 text-ink-soft">
                    {p.body}
                  </p>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-line/40">
                  <span className="font-mono text-[10px] text-muted tracking-wider uppercase">{p.read}</span>
                  <span className="font-mono text-[10px] text-accent uppercase tracking-wider group-hover:translate-x-1 transition-transform duration-200">
                    Read study →
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>

      </div>
    </section>
  )
}
