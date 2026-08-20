// Shared window chrome for every terminal / code mockup on the page.
// One look: ink background, soft traffic lights, mono title, rounded-2xl.
export default function ConsoleWindow({ title, right = null, footer = null, className = '', children }) {
  return (
    <div
      className={`rounded-2xl overflow-hidden flex flex-col shadow-2xl w-full min-w-0 ${className}`}
      style={{ background: '#161413', border: '1px solid rgba(22,20,19,0.25)', boxShadow: '0 24px 60px -18px rgba(22,20,19,0.4)' }}
    >
      {/* Title bar */}
      <div className="px-5 h-[46px] flex items-center justify-between select-none shrink-0" style={{ borderBottom: '1px solid rgba(250,249,246,0.08)', background: 'rgba(250,249,246,0.03)' }}>
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: '#d0564a' }} />
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: '#d4a13e' }} />
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: '#5d9e62' }} />
          <span className="ml-3 text-[11px] truncate" style={{ fontFamily: "'Geist Mono', monospace", color: 'rgba(250,249,246,0.45)' }}>
            {title}
          </span>
        </div>
        {right}
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 flex flex-col">{children}</div>

      {/* Optional footer bar */}
      {footer && (
        <div className="px-5 h-[42px] flex items-center justify-between select-none shrink-0 text-[11px]" style={{ borderTop: '1px solid rgba(250,249,246,0.08)', fontFamily: "'Geist Mono', monospace", color: 'rgba(250,249,246,0.4)' }}>
          {footer}
        </div>
      )}
    </div>
  )
}

// Small pill button for use inside dark console chrome — echoes the site's
// pill-ghost buttons so the mockups read as part of the same product.
export function ConsolePill({ onClick, children, active = false }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium transition-all active:scale-95"
      style={{
        fontFamily: "'Geist Mono', monospace",
        background: active ? 'var(--cream)' : 'rgba(250,249,246,0.06)',
        color: active ? '#161413' : 'rgba(250,249,246,0.65)',
        border: '1px solid rgba(250,249,246,0.14)',
      }}
    >
      {children}
    </button>
  )
}
