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
    <section ref={ref} id="log" className="py-24 rule">
      <div className="max-w-6xl mx-auto px-6">
        <div className="reveal flex items-end justify-between mb-14">
          <div>
            <div className="micro-label mb-4">06 / STAY HONEST</div>
            <h2 className="font-serif-display text-[36px] sm:text-[44px] leading-[1.1]" style={{ color: 'var(--ink)' }}>
              From the measurement log.
            </h2>
          </div>
          <a href="https://github.com/areycruzer/substrate-friction/blob/main/docs/studies.md" className="pill-ghost hidden sm:inline-flex">View all studies</a>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {posts.map(p => (
            <a key={p.title} href={p.href} className="reveal lift group block rounded-xl p-4 -m-4">
              <div className="rule pt-5">
                <div className="flex items-center gap-3 mb-4">
                  <span className="micro-label" style={{ color: 'var(--accent)' }}>{p.tag}</span>
                  <span className="micro-label">{p.date}</span>
                </div>
                <h3 className="font-serif-display text-[24px] leading-[1.2] mb-3 group-hover:underline" style={{ color: 'var(--ink)' }}>
                  {p.title}
                </h3>
                <p className="text-[14px] leading-[1.7] mb-4" style={{ color: 'var(--ink-soft)' }}>{p.body}</p>
                <span className="micro-label">{p.read}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
