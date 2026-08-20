import useReveal from '../useReveal'
import DitherGraph from './DitherGraph'

export default function Hero() {
  const ref = useReveal()
  return (
    <header ref={ref} className="relative pt-20 pb-20 overflow-hidden">
      {/* Dithered graph art — right side, fading into the paper */}
      <div className="absolute right-0 top-0 bottom-0 w-[55%] hidden md:block pointer-events-none"
        style={{ maskImage: 'linear-gradient(to right, transparent 0%, black 35%)', WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 35%)' }}>
        <DitherGraph className="w-full h-full" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6">
        <div className="max-w-xl">
          <div className="reveal flex items-center gap-2 mb-7">
            <span className="status-dot w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
            <span className="micro-label" style={{ color: 'var(--ink)' }}>AGENT TRIAGE, MEASURED</span>
          </div>

          <h1 className="reveal font-serif-display text-[44px] sm:text-[54px] lg:text-[62px] leading-[1.08]" style={{ color: 'var(--ink)' }}>
            Measure the map<br />before you trust it.
          </h1>
          <p className="reveal mt-6 text-base sm:text-[17px] max-w-md" style={{ color: 'var(--ink-soft)' }}>
            substrate—friction is the certification gate for agent test selection.
            Continuously measuring whether the graph under your coding agent can
            reach the tests that guard a change.
          </p>
          <div className="reveal mt-9 flex items-center gap-4 flex-wrap">
            <a href="https://github.com/areycruzer/substrate-friction#quickstart" className="pill-dark">Run the gate</a>
            <a href="https://github.com/areycruzer/substrate-friction/blob/main/docs/gate.md" className="pill-ghost">Explore the measurement</a>
          </div>

          {/* small caption under CTAs, like their timestamp */}
          <div className="reveal mt-8 micro-label">
            172 LABELLED BUG FIXES · 7 REPOSITORIES · ONE VERDICT
          </div>
        </div>

        {/* The verdict plate */}
        <div className="reveal mt-16 max-w-4xl rounded-2xl overflow-hidden text-left lift" style={{ background: 'var(--ink)', boxShadow: '0 30px 80px -20px rgba(26,22,20,0.45)' }}>
          <div className="px-6 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(244,244,231,0.12)' }}>
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#e0443e' }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#e0a53e' }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#57a55a' }} />
            <span className="ml-3 text-[11px]" style={{ fontFamily: "'Geist Mono', monospace", color: 'rgba(244,244,231,0.4)' }}>
              friction gate --arm arm_b · real capture
            </span>
          </div>
          <div className="p-7 grid sm:grid-cols-[1fr_auto] gap-8 items-center">
            <div style={{ fontFamily: "'Geist Mono', monospace" }}>
              <div className="text-[13px] mb-3" style={{ color: 'rgba(244,244,231,0.45)' }}>
                measured test→fix recall against 172 labelled bug fixes, 7 repositories
              </div>
              <div className="flex items-baseline gap-4 flex-wrap">
                <span className="text-5xl font-medium" style={{ color: 'var(--cream)' }}>0.419</span>
                <span className="text-sm" style={{ color: 'rgba(244,244,231,0.4)' }}>pooled · 72/172</span>
                <span className="text-sm" style={{ color: 'rgba(244,244,231,0.4)' }}>bar for skipping: 0.95</span>
              </div>
              <div className="mt-4 text-[13px] leading-relaxed" style={{ color: 'rgba(244,244,231,0.55)' }}>
                45–58% of tests known to guard their fix are unreachable in the graph.
                A skip would silently drop them.
              </div>
            </div>
            <div className="rounded-xl px-5 py-4 text-center" style={{ border: '1px solid rgba(255,87,26,0.4)', background: 'rgba(255,87,26,0.08)' }}>
              <div className="text-[10px] uppercase tracking-widest mb-1" style={{ fontFamily: "'Geist Mono', monospace", color: 'rgba(244,244,231,0.4)' }}>verdict</div>
              <div className="text-xl font-semibold" style={{ fontFamily: "'Geist Mono', monospace", color: 'var(--accent)' }}>RUN_FULL</div>
              <div className="text-[11px] mt-1" style={{ fontFamily: "'Geist Mono', monospace", color: 'rgba(244,244,231,0.4)' }}>exit 1 · fail-closed</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
