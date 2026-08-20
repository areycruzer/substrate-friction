import useReveal from '../useReveal'

export default function Quote() {
  const ref = useReveal()
  return (
    <section ref={ref} className="py-24 rule">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <div className="reveal font-serif-display text-[64px] leading-none mb-2" style={{ color: 'var(--accent)' }}>“</div>
        <blockquote className="reveal font-serif-display text-[28px] sm:text-[34px] leading-[1.25]" style={{ color: 'var(--ink)' }}>
          Everyone is trying to make coding agents smarter.
          Nobody is asking the cheaper question.
        </blockquote>
        <div className="reveal mt-8">
          <div className="text-sm font-medium" style={{ color: 'var(--ink)' }}>The founding brief</div>
          <div className="micro-label mt-1">docs/origin · August 12, committed verbatim</div>
        </div>
      </div>
    </section>
  )
}
