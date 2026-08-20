import useReveal from '../useReveal'
import TerminalMockup from './TerminalMockup'
import DitherEffect from './DitherEffect'

export default function Hero() {
  const ref = useReveal()
  return (
    <header ref={ref} id="hero" className="relative pt-36 pb-20 md:pt-40 overflow-hidden">
      {/* Faint Dither Shader Background */}
      <div className="absolute inset-0 pointer-events-none z-0" style={{ opacity: 0.5 }}>
        <DitherEffect 
          background="#d4d3cb" 
          colors={["#ebeae2", "#bebdb2", "#a8a79d"]} 
          density={60} 
          scale={25}
          size={30}
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 z-10">
        <div className="grid md:grid-cols-[0.95fr_1.05fr] gap-10 lg:gap-12 items-center">
          <div>
            <div className="reveal flex items-center gap-2 mb-7">
              <span className="status-dot w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
              <span className="micro-label" style={{ color: 'var(--ink)' }}>AGENT TRIAGE, MEASURED</span>
            </div>

            <h1 className="reveal reveal-delay-100 font-serif-display text-[44px] sm:text-[54px] lg:text-[62px] leading-[1.08]" style={{ color: 'var(--ink)' }}>
              Measure the map<br />before you trust it.
            </h1>
            <p className="reveal reveal-delay-200 mt-6 text-base sm:text-[17px] max-w-md" style={{ color: 'var(--ink-soft)' }}>
              substrate—friction is the certification gate for agent test selection.
              Continuously measuring whether the graph under your coding agent can
              reach the tests that guard a change.
            </p>
            <div className="reveal reveal-delay-300 mt-9 flex items-center gap-6 flex-wrap">
              <a href="#quickstart" className="pill-dark">Run the gate</a>
              <a href="https://github.com/areycruzer/substrate-friction/blob/main/docs/gate.md" className="pill-dashed group">
                {/* Corner Brackets */}
                <span className="absolute top-[-3px] left-[-3px] w-2 h-2 border-t border-l border-ink/40 group-hover:border-accent group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
                <span className="absolute top-[-3px] right-[-3px] w-2 h-2 border-t border-r border-ink/40 group-hover:border-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
                <span className="absolute bottom-[-3px] left-[-3px] w-2 h-2 border-b border-l border-ink/40 group-hover:border-accent group-hover:-translate-x-0.5 group-hover:translate-y-0.5 transition-all duration-300" />
                <span className="absolute bottom-[-3px] right-[-3px] w-2 h-2 border-b border-r border-ink/40 group-hover:border-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
                Explore the measurement
              </a>
            </div>

            {/* small caption under CTAs, like their timestamp */}
            <div className="reveal reveal-delay-400 mt-8 micro-label">
              172 LABELLED BUG FIXES · 7 REPOSITORIES · ONE VERDICT
            </div>
          </div>

          <div className="reveal reveal-delay-200 min-w-0">
            <TerminalMockup />
          </div>
        </div>
      </div>
    </header>
  )
}
