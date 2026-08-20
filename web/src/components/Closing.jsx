import DitherEffect from './DitherEffect'
import useReveal from '../useReveal'

export default function Closing() {
  const ref = useReveal()
  return (
    <section ref={ref} className="relative py-28 rule overflow-hidden">
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

      <div className="relative max-w-3xl mx-auto px-6 text-center z-10">
        <h2 className="reveal font-serif-display text-[40px] sm:text-[52px] leading-[1.08]" style={{ color: 'var(--ink)' }}>
          The certification gate<br />for agent test selection.
        </h2>
        <p className="reveal mt-6 text-[16px]" style={{ color: 'var(--ink-soft)' }}>
          One clean clone, 77 seconds to a working gate.<br className="hidden sm:block" />
          Every shipped figure re-derivable by one command.
        </p>
        <div className="reveal mt-9 flex items-center justify-center gap-6 flex-wrap">
          <a href="#quickstart" className="pill-dark">Run the gate</a>
          <a href="https://github.com/areycruzer/substrate-friction/blob/main/docs/studies.md" className="pill-dashed group">
            {/* Corner Brackets */}
            <span className="absolute top-[-3px] left-[-3px] w-2 h-2 border-t border-l border-ink/40 group-hover:border-accent group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
            <span className="absolute top-[-3px] right-[-3px] w-2 h-2 border-t border-r border-ink/40 group-hover:border-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
            <span className="absolute bottom-[-3px] left-[-3px] w-2 h-2 border-b border-l border-ink/40 group-hover:border-accent group-hover:-translate-x-0.5 group-hover:translate-y-0.5 transition-all duration-300" />
            <span className="absolute bottom-[-3px] right-[-3px] w-2 h-2 border-b border-r border-ink/40 group-hover:border-accent group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-all duration-300" />
            Read the studies
          </a>
        </div>

      </div>
    </section>
  )
}
