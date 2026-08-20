import { useState } from 'react'
import { ShieldCheck, GitFork, BarChart3, Terminal, Check, Copy } from 'lucide-react'
import useReveal from '../useReveal'
import ConsoleWindow from './ConsoleWindow'

const blocks = [
  {
    label: 'THE QUESTION',
    title: 'Which graphs should\nthe robot not trust?',
    body: 'The founding brief asked which tickets to keep from the agent. The gate asks the question under that question. The answer lives in one measurable thing: what fraction of tests known to guard a fix does this graph let you reach?',
  },
  {
    label: 'THE MEASUREMENT',
    title: 'Two arms. One engine.\nOne verdict.',
    body: 'The same commit parsed twice — name-matched (what deployed agents build) and type-resolved (scip-python / pyright) — both resident in one HydraDB engine in disjoint id bands, diffed edge-for-edge at 2.0 ms per edge, parity enforced by exception.',
  },
  {
    label: 'THE GATE',
    title: 'Everyone else assists.\nThis one refuses.',
    body: 'Most tooling stops at recommendations, leaving the skip decision to the agent. friction gate is fail-closed by construction: below the 0.95 bar it exits 1 — RUN_FULL — and an unmeasured graph can never license a skip. The refusal is the product working.',
  },
]

// Real CLI commands only, with output taken from the committed captures
// (docs/captures/) — nothing invented.
const TABS = [
  {
    name: 'The Gate',
    icon: ShieldCheck,
    tag: 'friction gate',
    desc: 'Measures guarding-test recall against 172 labelled bug fixes and turns it into an exit code. Below the 0.95 bar it refuses — RUN_FULL, exit 1, fail-closed in CI.',
    cmd: `$ friction gate --arm arm_b
[FAIL]  RUN_FULL      arm=arm_b  k=6
  measured test->fix recall : 0.545  (24/44)
  bar for skipping          : 0.95
  45% of guarding tests are unreachable —
  a skip would silently drop them
[status] exit code 1 — the refusal is the product`,
    lang: 'capture · 01-gate-verdict',
  },
  {
    name: 'The Diff',
    icon: GitFork,
    tag: 'friction diff --live',
    desc: 'Diffs the name-matched arm against the type-resolved arm edge-for-edge, inside the engine — 5,873 queries at 2.0 ms each, parity with the offline join enforced by exception.',
    cmd: `$ friction diff --live
[engine] both arms resident, disjoint id bands
[engine] anti-join: 5,873 edges @ 2.0 ms each
[engine] confirmed by arm B     : 4,381
[engine] unconfirmed (arm A only): 1,492
[engine] offline join agrees exactly — parity
         enforced by exception`,
    lang: 'capture · engine-diff',
  },
  {
    name: 'The Audit',
    icon: BarChart3,
    tag: 'friction verify',
    desc: 'Re-derives every shipped figure from committed artifacts and asserts the README and the website quote them exactly. Nonzero exit on any drift — it caught a real one on its first run.',
    cmd: `$ friction verify
[verify] shipped graphs re-audited (24/44, 15/30)
[verify] corpus summary re-derived from
         per-instance rows
[verify] docs/README/site quote the artifact
VERIFY OK — exit 0`,
    lang: 'capture · 04-verify',
  },
]

export default function Layers() {
  const ref = useReveal()
  const [activeTab, setActiveTab] = useState(0)
  const [copied, setCopied] = useState(false)

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const active = TABS[activeTab]

  return (
    <section ref={ref} id="where-it-sits" className="py-24 rule">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="reveal mb-16 flex items-baseline gap-6">
          <span className="micro-label">02 / ARCHITECTURE</span>
          <h2 className="font-serif-display text-[36px] sm:text-[44px] leading-[1.1]" style={{ color: 'var(--ink)' }}>
            A gate under the agent.
          </h2>
        </div>
        <p className="reveal micro-label mb-14 max-w-md">
          SUBSTRATE—FRICTION IS THE CERTIFICATION LAYER BETWEEN YOUR CODING AGENT
          AND THE TESTS IT WANTS TO SKIP.
        </p>

        {/* Structured Bento Columns */}
        <div className="grid md:grid-cols-3 gap-8 mb-24">
          {blocks.map((b, idx) => {
            const isDark = idx === 1
            return (
              <div 
                key={b.label} 
                className={`reveal group ${isDark ? 'box-dark' : 'box-dashed'} ${
                  idx === 1 ? 'reveal-delay-100' : idx === 2 ? 'reveal-delay-200' : ''
                }`}
              >
                {!isDark && (
                  <>
                    {/* Corner Brackets */}
                    <span className="absolute top-[-3px] left-[-3px] w-3 h-3 border-t border-l border-ink/30 group-hover:border-accent transition-all duration-300" />
                    <span className="absolute top-[-3px] right-[-3px] w-3 h-3 border-t border-r border-ink/30 group-hover:border-accent transition-all duration-300" />
                    <span className="absolute bottom-[-3px] left-[-3px] w-3 h-3 border-b border-l border-ink/30 group-hover:border-accent transition-all duration-300" />
                    <span className="absolute bottom-[-3px] right-[-3px] w-3 h-3 border-b border-r border-ink/30 group-hover:border-accent transition-all duration-300" />
                  </>
                )}
                <div>
                  <div 
                    className="micro-label mb-5"
                    style={{ color: isDark ? 'rgba(250,249,246,0.5)' : 'var(--muted)' }}
                  >
                    {b.label}
                  </div>
                  <h3 
                    className="font-serif-display text-[28px] sm:text-[30px] leading-[1.15] whitespace-pre-line mb-4"
                    style={{ color: isDark ? 'var(--cream)' : 'var(--ink)' }}
                  >
                    {b.title}
                  </h3>
                  <p 
                    className="text-[14.5px] leading-[1.7]"
                    style={{ color: isDark ? 'rgba(250,249,246,0.75)' : 'var(--ink-soft)' }}
                  >
                    {b.body}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Interactive Mode Playbacks (Bento style tab area) */}
        <div className="reveal border border-line rounded-2xl overflow-hidden bg-paper-deep/40 grid lg:grid-cols-[0.8fr_1.2fr] gap-px">
          {/* Left panel: Tabs selector */}
          <div className="bg-paper p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-line">
            <div>
              <div className="micro-label mb-6">03 . INTERACTIVE PLAYBACKS</div>
              <h3 className="font-serif-display text-3xl mb-8 leading-tight">
                The three layers of friction certification.
              </h3>
              
              <div className="flex flex-col gap-3">
                {TABS.map((tab, idx) => {
                  const Icon = tab.icon
                  const isSelected = idx === activeTab
                  return (
                    <button
                      key={tab.name}
                      onClick={() => setActiveTab(idx)}
                      className={`flex items-center gap-4 w-full p-4 rounded-xl text-left transition-all duration-300 ${
                        isSelected 
                          ? 'bg-ink text-paper shadow-lg' 
                          : 'hover:bg-line/40 text-ink'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${isSelected ? 'bg-paper/10 text-paper' : 'bg-line/40 text-ink-soft'}`}>
                        <Icon size={18} />
                      </div>
                      <div>
                        <div className="font-serif-display text-lg">{tab.name}</div>
                        <div className={`text-[11px] font-mono opacity-80 ${isSelected ? 'text-paper/60' : 'text-muted'}`}>
                          {tab.tag}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="mt-12 pt-6 border-t border-line text-xs text-muted leading-relaxed">
              * Every output above is a committed capture, replayed. The engine is
              digest-pinned (hydradb@sha256:db78309a…) and <code className="font-mono">friction verify</code> re-derives
              every number on demand.
            </div>
          </div>

          {/* Right panel: Terminal Showcase */}
          <div className="bg-paper-deep p-8 flex flex-col gap-6 min-w-0">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs text-muted uppercase tracking-wider flex items-center gap-2">
                  <Terminal size={14} /> {active.tag}
                </span>
                <button
                  onClick={() => handleCopy(active.cmd)}
                  className="pill-ghost !py-1 !px-3 !text-[11px] font-mono uppercase tracking-wider"
                >
                  {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                  {copied ? 'copied' : 'copy'}
                </button>
              </div>
              <p className="text-[14px] text-ink-soft leading-relaxed max-w-lg">
                {active.desc}
              </p>
            </div>

            <ConsoleWindow title={active.lang} className="flex-1">
              <pre className="p-6 overflow-x-auto font-mono text-[12.5px] leading-[1.9] select-all no-scrollbar" style={{ color: 'rgba(250,249,246,0.85)' }}>
                <code>
                  {active.cmd.split('\n').map((line, i) => {
                    let color = 'rgba(250,249,246,0.8)'
                    if (line.startsWith('$')) color = '#faf9f6'
                    else if (line.includes('[FAIL]') || line.includes('exit code 1')) color = '#ff8a55'
                    else if (line.includes('VERIFY OK') || line.includes('exit 0')) color = '#7dc383'
                    else if (line.startsWith('[')) color = 'rgba(250,249,246,0.55)'
                    return (
                      <div key={i} style={{ color }}>
                        {line.startsWith('$') ? <><span style={{ color: '#7dc383' }}>$</span>{line.slice(1)}</> : (line || ' ')}
                      </div>
                    )
                  })}
                </code>
              </pre>
            </ConsoleWindow>
          </div>
        </div>
      </div>
    </section>
  )
}
