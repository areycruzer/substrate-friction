import { useState } from 'react'
import { Menu, X } from 'lucide-react'

const left = [
  { label: 'Walkthrough', href: 'walkthrough.html' },
  { label: 'Docs', href: 'https://github.com/areycruzer/substrate-friction/blob/main/docs/gate.md' },
  { label: 'Origin', href: 'https://github.com/areycruzer/substrate-friction/blob/main/docs/ORIGIN.md' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 px-4 pt-4 md:px-[30px] md:pt-[30px]">
      <div className="relative h-[46px]">
        {/* Left pill — links */}
        <div className="absolute left-0 top-0 hidden lg:block">
          <div className="glass-pill flex items-center gap-1 px-2 h-[46px]">
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

        {/* Right pill — CTAs */}
        <div className="absolute right-0 top-0 hidden lg:block">
          <div className="glass-pill flex items-center gap-1 pl-2 pr-1.5 h-[46px]">
            <a href="https://github.com/areycruzer/substrate-friction" className="nav-link px-3 py-1.5 relative z-10">
              GitHub
            </a>
            <a href="https://github.com/areycruzer/substrate-friction#quickstart" className="pill-dark !py-1.5 !px-4 relative z-10 text-[13px]">
              Run the gate
            </a>
          </div>
        </div>

        {/* Mobile toggle */}
        <div className="absolute right-0 top-0 lg:hidden">
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
          {[...left, { label: 'GitHub', href: 'https://github.com/areycruzer/substrate-friction' }].map(l => (
            <a key={l.label} href={l.href} className="text-sm font-medium relative z-10" style={{ color: 'var(--ink)' }} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
          <a href="https://github.com/areycruzer/substrate-friction#quickstart" className="pill-dark justify-center relative z-10">Run the gate</a>
        </div>
      )}
    </nav>
  )
}
