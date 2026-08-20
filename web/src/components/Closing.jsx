import useReveal from '../useReveal'

export default function Closing() {
  const ref = useReveal()
  return (
    <section ref={ref} className="py-28 rule">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="reveal font-serif-display text-[40px] sm:text-[52px] leading-[1.08]" style={{ color: 'var(--ink)' }}>
          The certification gate<br />for agent test selection.
        </h2>
        <p className="reveal mt-6 text-[16px]" style={{ color: 'var(--ink-soft)' }}>
          One clean clone, 77 seconds to a working gate.<br className="hidden sm:block" />
          Every shipped figure re-derivable by one command.
        </p>
        <div className="reveal mt-9 flex items-center justify-center gap-4 flex-wrap">
          <a href="https://github.com/areycruzer/substrate-friction#quickstart" className="pill-dark">Run the gate</a>
          <a href="https://github.com/areycruzer/substrate-friction/blob/main/docs/studies.md" className="pill-ghost">Read the studies</a>
        </div>
      </div>
    </section>
  )
}
