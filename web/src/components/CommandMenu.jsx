import { useState, useEffect, useRef } from 'react'
import { Search, CornerDownLeft, X } from 'lucide-react'

const MENU_ITEMS = [
  { id: 'hero', label: '00 . Hero Section', subtitle: 'The certification gate for agent test selection', type: 'section' },
  { id: 'quote', label: '01 . Philosophy', subtitle: 'The founding brief and manifesto', type: 'section' },
  { id: 'where-it-sits', label: '02 . Architecture / Layers', subtitle: 'The gate under the coding agent', type: 'section' },
  { id: 'surfaces', label: '03 . Surfaces', subtitle: 'CI, MCP, Terminal, and evidence consensus', type: 'section' },
  { id: 'faq', label: '04 . FAQ Accordion', subtitle: 'Questions a careful reader asks', type: 'section' },
  { id: 'research-log', label: '05 . Research Log', subtitle: 'Stay up to date with historical studies', type: 'section' },
  { id: 'github', label: '06 . GitHub Codebase', subtitle: 'View the open-source repository', type: 'external', href: 'https://github.com/areycruzer/substrate-friction' },
]

export default function CommandMenu({ isOpen, onClose }) {
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setSearch('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Filter items
  const filtered = MENU_ITEMS.filter(item =>
    item.label.toLowerCase().includes(search.toLowerCase()) ||
    item.subtitle.toLowerCase().includes(search.toLowerCase())
  )

  // Handle arrow keys and enter
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % filtered.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + filtered.length) % filtered.length)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (filtered[selectedIndex]) {
          triggerAction(filtered[selectedIndex])
        }
      } else if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, filtered, selectedIndex])

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.children[selectedIndex]
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selectedIndex])

  const triggerAction = (item) => {
    onClose()
    if (item.type === 'external') {
      window.open(item.href, '_blank', 'noopener,noreferrer')
    } else {
      const el = document.getElementById(item.id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4">
      {/* Backdrop blur */}
      <div 
        className="absolute inset-0 bg-ink/40 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-xl border border-line bg-paper shadow-2xl transition-all duration-300 animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-line px-4 py-3">
          <Search size={18} className="text-muted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search sections or type a command..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setSelectedIndex(0)
            }}
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
          />
          <button 
            onClick={onClose}
            className="rounded p-1 text-muted hover:bg-line hover:text-ink transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Search Results List */}
        <div 
          ref={listRef} 
          className="max-h-[320px] overflow-y-auto p-2 no-scrollbar"
        >
          {filtered.length > 0 ? (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex
              return (
                <div
                  key={item.id}
                  onClick={() => triggerAction(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`group flex items-center justify-between rounded-lg px-4 py-3 cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? 'bg-ink text-paper' 
                      : 'hover:bg-line text-ink'
                  }`}
                >
                  <div>
                    <div className="font-mono text-[11px] uppercase tracking-wider opacity-60 mb-0.5">
                      {item.type === 'external' ? 'External Link' : 'Section'}
                    </div>
                    <div className={`font-serif-display text-lg leading-snug ${isSelected ? 'text-paper' : 'text-ink'}`}>
                      {item.label}
                    </div>
                    <div className={`text-xs opacity-75 mt-0.5 ${isSelected ? 'text-paper/80' : 'text-ink-soft'}`}>
                      {item.subtitle}
                    </div>
                  </div>

                  {/* indicator key */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`font-mono text-[9px] uppercase tracking-wider border rounded px-1.5 py-0.5 transition-colors ${
                      isSelected 
                        ? 'border-paper/30 text-paper/80' 
                        : 'border-line text-muted'
                    }`}>
                      {item.type === 'external' ? 'open' : 'jump'}
                    </span>
                    {isSelected && (
                      <CornerDownLeft size={12} className="opacity-60 animate-pulse" />
                    )}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="py-8 text-center text-sm text-muted">
              No matching sections or actions found.
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="flex items-center justify-between border-t border-line px-4 py-2 text-[10px] text-muted bg-paper-deep/60 font-mono">
          <div className="flex items-center gap-3">
            <span><span className="border border-line rounded px-1 py-0.5 bg-paper">↑↓</span> Navigate</span>
            <span><span className="border border-line rounded px-1 py-0.5 bg-paper">Enter</span> Select</span>
          </div>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  )
}
