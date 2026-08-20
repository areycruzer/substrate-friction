import { useState } from 'react'
import { Menu, X, Search } from 'lucide-react'

const left = [
  { label: 'Walkthrough', href: 'walkthrough.html' },
  { label: 'Docs', href: 'https://github.com/areycruzer/substrate-friction/blob/main/docs/gate.md' },
  { label: 'Origin', href: 'https://github.com/areycruzer/substrate-friction/blob/main/docs/ORIGIN.md' },
]

export default function Navbar({ onSearchClick }) {
  const [open, setOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 px-4 pt-4 md:px-[30px] md:pt-[30px] mb-[-62px] md:mb-[-76px]">
      <div className="relative h-[46px]">
        {/* Left pill — links + status */}
        <div className="absolute left-0 top-0 hidden lg:block">
          <div className="glass-pill flex items-center gap-1 px-3 h-[46px]">
            <div className="flex items-center gap-1.5 mr-2 pr-2 border-r border-line/60">
              <span className="status-dot w-2 h-2 rounded-full bg-emerald-500 shrink-0" style={{ boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)' }} />
              <span className="font-mono text-[9px] tracking-wider text-emerald-600 font-semibold uppercase">GATE ACTIVE</span>
            </div>
            {left.map(l => (
              <a key={l.label} href={l.href} className="nav-link px-3 py-1.5 relative z-10">
                {l.label}
              </a>
            ))}
          </div>
        </div>

        {/* Center pill — wordmark */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0">
          <a href="#" className="glass-pill flex items-center h-[46px] px-6">
            <span className="font-serif-display text-[19px] tracking-tight relative z-10" style={{ color: 'var(--ink)' }}>
              substrate<span style={{ color: 'var(--accent)' }}>—</span>friction
            </span>
          </a>
        </div>

        {/* Right pill — CTAs + Search */}
        <div className="absolute right-0 top-0 hidden lg:block">
          <div className="glass-pill flex items-center gap-1 pl-2 pr-1.5 h-[46px]">
            <button 
              onClick={onSearchClick}
              className="nav-link flex items-center gap-1 px-3 py-1.5 relative z-10 hover:opacity-80 transition-opacity"
              aria-label="Search Command Menu"
            >
              <Search size={14} className="text-ink-soft mr-1" />
              <span className="font-mono text-[9px] bg-line/60 rounded px-1 py-0.5 text-ink-soft">Ctrl K</span>
            </button>
            <a href="https://github.com/areycruzer/substrate-friction" className="nav-link px-3 py-1.5 relative z-10">
              GitHub
            </a>
            <a href="#quickstart" className="pill-dark !py-1.5 !px-4 relative z-10 text-[13px]">
              Run the gate
            </a>
          </div>
        </div>

        {/* Mobile toggle & Search */}
        <div className="absolute right-0 top-0 lg:hidden flex gap-2">
          <button
            className="glass-pill w-[46px] h-[46px] flex items-center justify-center"
            style={{ color: 'var(--ink)' }}
            onClick={onSearchClick}
            aria-label="Search"
          >
            <Search size={18} className="relative z-10" />
          </button>
          <button
            className="glass-pill w-[46px] h-[46px] flex items-center justify-center"
            style={{ color: 'var(--ink)' }}
            onClick={() => setOpen(o => !o)}
            aria-label="Menu"
          >
            <span className="relative z-10">{open ? <X size={18} /> : <Menu size={18} />}</span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden mt-3 glass-pill !rounded-3xl px-6 py-5 flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-2 border-b border-line">
            <span className="status-dot w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="font-mono text-[10px] tracking-wider text-emerald-600 font-semibold uppercase">GATE ACTIVE</span>
          </div>
          {[...left, { label: 'GitHub', href: 'https://github.com/areycruzer/substrate-friction' }].map(l => (
            <a key={l.label} href={l.href} className="text-sm font-medium relative z-10" style={{ color: 'var(--ink)' }} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
          <a href="#quickstart" className="pill-dark justify-center relative z-10" onClick={() => setOpen(false)}>Run the gate</a>
        </div>
      )}
    </nav>
  )
}

