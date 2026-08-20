import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import useReveal from '../useReveal'
import ConsoleWindow, { ConsolePill } from './ConsoleWindow'

// Real commands only — from the repo README quickstart and action.yml.
const CLI_LINES = [
  { t: '# clone and boot — one command to a working gate (~77 s cold)', c: 'comment' },
  { t: 'git clone https://github.com/areycruzer/substrate-friction', c: 'cmd' },
  { t: 'cd substrate-friction && ./setup.sh', c: 'cmd' },
  { t: '', c: 'blank' },
  { t: '# the verdict (exit 1: RUN_FULL)', c: 'comment' },
  { t: 'friction gate --arm arm_b', c: 'cmd' },
  { t: '', c: 'blank' },
  { t: '# triage any PR — blast radius, tier, evidence', c: 'comment' },
  { t: 'friction triage https://github.com/fastapi/fastapi/pull/16159', c: 'cmd' },
]

const ACTION_LINES = [
  { t: '# .github/workflows/triage.yml — in YOUR repo', c: 'comment' },
  { t: 'name: Triage', c: 'key' },
  { t: 'on: pull_request', c: 'key' },
  { t: 'permissions:', c: 'key' },
  { t: '  issues: write', c: 'plain' },
  { t: '  pull-requests: write', c: 'plain' },
  { t: 'jobs:', c: 'key' },
  { t: '  triage:', c: 'plain' },
  { t: '    runs-on: ubuntu-latest', c: 'plain' },
  { t: '    steps:', c: 'plain' },
  { t: '      - uses: areycruzer/substrate-friction@main', c: 'accent' },
]

const LINE_COLORS = {
  comment: 'rgba(250,249,246,0.38)',
  cmd: '#faf9f6',
  key: '#e8c47a',
  plain: 'rgba(250,249,246,0.75)',
  accent: '#ff8a55',
  blank: 'transparent',
}

export default function Quickstart() {
  const ref = useReveal()
  const [activeTab, setActiveTab] = useState('cli')
  const [copied, setCopied] = useState(false)

  const lines = activeTab === 'cli' ? CLI_LINES : ACTION_LINES

  const handleCopy = () => {
    navigator.clipboard.writeText(lines.map(l => l.t).join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section ref={ref} id="quickstart" className="py-24 rule">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-16 items-center">

          {/* Left — text */}
          <div>
            <div className="reveal mb-4 micro-label">05 / QUICKSTART</div>
            <h2 className="reveal reveal-delay-100 font-serif-display text-[36px] sm:text-[44px] leading-[1.1] mb-6" style={{ color: 'var(--ink)' }}>
              Run it locally,<br />or lock it into your CI.
            </h2>
            <p className="reveal reveal-delay-200 text-[15px] leading-[1.7] mb-8 text-ink-soft">
              One clean clone and <code className="font-mono text-[13px]">./setup.sh</code> boots
              the digest-pinned engine and loads the shipped working set — about 77 seconds
              to a working gate. Or install the GitHub Action: every PR gets a triage label
              and a verdict comment with the evidence.
            </p>
            <div className="reveal reveal-delay-300 flex items-center gap-4">
              <a href="https://github.com/areycruzer/substrate-friction#quickstart" className="pill-dark">
                View setup details
              </a>
              <a href="https://github.com/areycruzer/substrate-friction/blob/main/action.yml" className="pill-dashed group">
                Explore GitHub Action
              </a>
            </div>
          </div>

          {/* Right — console */}
          <div className="reveal reveal-delay-200 min-w-0">
            <ConsoleWindow
              title={activeTab === 'cli' ? 'setup — local CLI' : 'triage.yml — GitHub Action'}
              right={
                <div className="flex items-center gap-2">
                  <ConsolePill active={activeTab === 'cli'} onClick={() => setActiveTab('cli')}>
                    local cli
                  </ConsolePill>
                  <ConsolePill active={activeTab === 'action'} onClick={() => setActiveTab('action')}>
                    github action
                  </ConsolePill>
                  <ConsolePill onClick={handleCopy}>
                    {copied
                      ? <><Check size={11} style={{ color: '#7dc383' }} /><span style={{ color: '#7dc383' }}>copied</span></>
                      : <><Copy size={11} /> copy</>}
                  </ConsolePill>
                </div>
              }
            >
              <div className="p-6 font-mono text-[12.5px] leading-[1.9] overflow-x-auto min-h-[280px]">
                {lines.map((l, i) => (
                  <div key={`${activeTab}-${i}`} className="whitespace-pre" style={{ color: LINE_COLORS[l.c] }}>
                    {l.c === 'cmd' && <span style={{ color: '#7dc383' }}>$ </span>}
                    {l.t || ' '}
                  </div>
                ))}
              </div>
            </ConsoleWindow>
          </div>

        </div>
      </div>
    </section>
  )
}
