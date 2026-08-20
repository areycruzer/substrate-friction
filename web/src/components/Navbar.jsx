import { useState, useEffect, useRef } from 'react'
import { Menu, X, Search } from 'lucide-react'

const left = [
  { label: 'Walkthrough', href: 'walkthrough.html' },
  { label: 'Docs', href: 'https://github.com/areycruzer/substrate-friction/blob/main/docs/gate.md' },
  { label: 'Origin', href: 'https://github.com/areycruzer/substrate-friction/blob/main/docs/ORIGIN.md' },
]

export default function Navbar({ onSearchClick }) {
  const [open, setOpen] = useState(false)
  const [split, setSplit] = useState(false)
  const shellRef = useRef(null)
  const mShellRef = useRef(null)

  // scroll → split
  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        setSplit(window.scrollY > 48)
        ticking = false
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // measure how far each side has to fly (offsetLeft ignores transforms,
  // so this is safe to run in either state)
  useEffect(() => {
    const measure = () => {
      for (const shell of [shellRef.current, mShellRef.current]) {
        if (!shell) continue
        const cluster = shell.querySelector('.nav-cluster')
        const lg = shell.querySelector('.nav-group-left')
        const rg = shell.querySelector('.nav-group-right')
        if (!cluster || !lg || !rg) continue
        const shiftL = cluster.offsetLeft + lg.offsetLeft
        const shiftR = shell.clientWidth - (cluster.offsetLeft + rg.offsetLeft + rg.offsetWidth)
        shell.style.setProperty('--shift-l', `${Math.max(0, shiftL)}px`)
        shell.style.setProperty('--shift-r', `${Math.max(0, shiftR)}px`)
      }
    }
    measure()
    window.addEventListener('resize', measure)
    if (document.fonts?.ready) document.fonts.ready.then(measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  return (
    <nav className="sticky top-0 z-50 px-4 pt-4 md:px-[30px] md:pt-[30px] mb-[-62px] md:mb-[-76px]">

      {/* Desktop: one centered pill at top → sides fly apart on scroll */}
      <div ref={shellRef} className={`nav-shell hidden lg:block ${split ? 'split' : ''}`}>
        <div className="nav-cluster">
          {/* Left group — status + links */}
          <div className="nav-group nav-group-left gap-1 px-3">
            <div className="flex items-center gap-1.5 mr-2 pr-2 border-r border-line/60 relative z-10">
              <span className="status-dot w-2 h-2 rounded-full bg-emerald-500 shrink-0" style={{ boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)' }} />
              <span className="font-mono text-[9px] tracking-wider text-emerald-600 font-semibold uppercase">GATE ACTIVE</span>
            </div>
            {left.map(l => (
              <a key={l.label} href={l.href} className="nav-link px-3 py-1.5 relative z-10">
                {l.label}
              </a>
            ))}
          </div>

          {/* Center — wordmark (stays put) */}
          <a href="#" className="nav-group px-6">
            <span className="font-serif-display text-[19px] tracking-tight relative z-10" style={{ color: 'var(--ink)' }}>
              substrate<span style={{ color: 'var(--accent)' }}>—</span>friction
            </span>
          </a>

          {/* Right group — search + CTAs */}
          <div className="nav-group nav-group-right gap-1 pl-2 pr-1.5">
            <button
              onClick={onSearchClick}
              className="nav-link flex items-center gap-1 px-3 py-1.5 relative z-10 hover:opacity-80 transition-opacity"
              aria-label="Search Command Menu"
            >
              <Search size={14} className="text-ink-soft mr-1" />
              <span className="font-mono text-[9px] rounded px-1.5 py-0.5" style={{ background: 'var(--paper-deep)', border: '1px solid var(--line)', color: 'var(--ink-soft)' }}>Ctrl K</span>
            </button>
            <a href="https://github.com/areycruzer/substrate-friction" className="nav-link px-3 py-1.5 relative z-10">
              GitHub
            </a>
            <a href="#quickstart" className="pill-dark !py-1.5 !px-4 relative z-10 text-[13px]">
              Run the gate
            </a>
          </div>
        </div>
      </div>

      {/* Mobile: same trick — one centered pill → wordmark flies left, menu flies right */}
      <div ref={mShellRef} className={`nav-shell lg:hidden ${split ? 'split' : ''}`}>
        <div className="nav-cluster">
          <a href="#" className="nav-group nav-group-left px-5">
            <span className="font-serif-display text-[17px] tracking-tight relative z-10" style={{ color: 'var(--ink)' }}>
              substrate<span style={{ color: 'var(--accent)' }}>—</span>friction
            </span>
          </a>
          <div className="nav-group nav-group-right px-1">
            <button
              className="w-[38px] h-[38px] flex items-center justify-center relative z-10"
              style={{ color: 'var(--ink)' }}
              onClick={() => setOpen(o => !o)}
              aria-label="Menu"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
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
          <button
            className="text-sm font-medium relative z-10 text-left flex items-center gap-2"
            style={{ color: 'var(--ink)' }}
            onClick={() => { setOpen(false); onSearchClick?.() }}
          >
            <Search size={14} /> Search
          </button>
          <a href="#quickstart" className="pill-dark justify-center relative z-10" onClick={() => setOpen(false)}>Run the gate</a>
        </div>
      )}
    </nav>
  )
}
