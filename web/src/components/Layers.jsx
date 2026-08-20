import { useState } from 'react'
import { ShieldCheck, GitFork, BarChart3, Terminal, Check, Copy } from 'lucide-react'
import useReveal from '../useReveal'

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

const TABS = [
  {
    name: 'Gate Mode',
    icon: ShieldCheck,
    tag: 'friction gate',
    desc: 'Fail-closed CI gate blocking code merges when unmeasured/untrusted skips are detected. Asserts security for the test selection pipeline.',
    cmd: `name: Run friction gate
on: [push, pull_request]
jobs:
  triage:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Verify skip map
        run: |
          uv run friction gate \\
            --threshold 0.95 \\
            --db data/consensus.json`,
    lang: 'yaml',
  },
  {
    name: 'Map Gen',
    icon: GitFork,
    tag: 'friction map',
    desc: 'Compiles the AST-level codebase call graph, mapping test files directly to code symbols and functions using scip-python/pyright.',
    cmd: `$ friction map --src src/ --output data/deps.json
[info] parsing python files...
[info] resolved 5,811 semantic node relationships
[info] compiled dependency graph in 0.81 s
[info] verification hash: sha256:d8b78a0a`,
    lang: 'bash',
  },
  {
    name: 'Recall Scorer',
    icon: BarChart3,
    tag: 'friction validate',
    desc: 'Evaluates your codebase map against historical commits and bug-fixes. Automatically generates a mathematical proof of test Selection Recall.',
    cmd: `$ friction validate --commits HEAD~20..HEAD
[verify] testing S5 (django django-44)
[verify] recall: 0.419 (72 / 172 fixes reachable)
[verdict] FAIL_CLOSED (lower bound 0.38 < threshold 0.95)
[status] exit code 1`,
    lang: 'bash',
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
              * Verification uses SHA256 consensus hashing running on an embedded SQLite engine.
            </div>
          </div>

          {/* Right panel: Terminal Showcase */}
          <div className="bg-paper-deep p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs text-muted uppercase tracking-wider flex items-center gap-2">
                  <Terminal size={14} /> {active.tag} playback
                </span>
                <button
                  onClick={() => handleCopy(active.cmd)}
                  className="flex items-center gap-1.5 font-mono text-[10px] uppercase text-muted hover:text-ink border border-line bg-paper px-2 py-1 rounded transition-colors"
                >
                  {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                  {copied ? 'copied' : 'copy'}
                </button>
              </div>

              <p className="text-[14px] text-ink-soft mb-6 leading-relaxed">
                {active.desc}
              </p>
            </div>

            {/* Terminal Window */}
            <div className="rounded-xl overflow-hidden shadow-xl border border-line bg-ink text-paper text-[13px] font-mono">
              <div className="px-4 py-2 border-b border-paper/10 flex items-center gap-1.5 select-none bg-ink-soft/40">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                <span className="text-[10px] text-paper/40 ml-2">console · {active.lang}</span>
              </div>
              <pre className="p-5 overflow-x-auto leading-relaxed select-all no-scrollbar max-h-[220px]">
                <code>{active.cmd}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
