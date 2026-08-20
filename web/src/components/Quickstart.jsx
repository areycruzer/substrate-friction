import { useState } from 'react'
import { Terminal, GitPullRequest, Copy, Check } from 'lucide-react'
import useReveal from '../useReveal'

export default function Quickstart() {
  const ref = useReveal()
  const [activeTab, setActiveTab] = useState('cli') // 'cli' or 'action'
  const [copied, setCopied] = useState(false)

  const cliCode = `# 1. Clone the repository
git clone https://github.com/areycruzer/substrate-friction
cd substrate-friction

# 2. Boot the engine and load the consensus graph
./setup.sh

# 3. Run the gate checks on a specific arm or instance
friction gate --arm arm_b
friction triage https://github.com/fastapi/fastapi/pull/16159`

  const actionCode = `# .github/workflows/triage.yml in your repo
name: Triage PR
on: pull_request
permissions:
  issues: write
  pull-requests: write
jobs:
  triage:
    runs-on: ubuntu-latest
    steps:
      - uses: areycruzer/substrate-friction@main
        with:
          github-token: \${{ secrets.GITHUB_TOKEN }}`

  const handleCopy = () => {
    const code = activeTab === 'cli' ? cliCode : actionCode
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section ref={ref} id="quickstart" className="py-24 rule">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-16 items-center">
          
          {/* Left Column — Text */}
          <div>
            <div className="reveal mb-4 micro-label">05 / QUICKSTART</div>
            <h2 className="reveal reveal-delay-100 font-serif-display text-[36px] sm:text-[44px] leading-[1.1] mb-6" style={{ color: 'var(--ink)' }}>
              Run it locally,<br />or lock it into your CI.
            </h2>
            <p className="reveal reveal-delay-200 text-[15px] leading-[1.7] mb-8 text-ink-soft">
              substrate—friction runs as a fast local CLI to verify changes and query 
              AST relationships on your machine, or integrates into any repository workflow 
              as a GitHub Action to automatically triage and label incoming pull requests.
            </p>
            <div className="reveal reveal-delay-300 flex items-center gap-4">
              <a 
                href="https://github.com/areycruzer/substrate-friction#quickstart" 
                className="pill-dark"
              >
                View setup details
              </a>
              <a 
                href="https://github.com/areycruzer/substrate-friction/blob/main/action.yml" 
                className="pill-ghost"
              >
                Explore GitHub Action
              </a>
            </div>
          </div>

          {/* Right Column — Tabbed Terminal Mockup */}
          <div className="reveal reveal-delay-200">
            <div className="w-full bg-black rounded-2xl border border-cream/15 overflow-hidden flex flex-col font-mono text-[13px] leading-relaxed text-cream shadow-2xl relative">
              
              {/* Terminal Title Bar */}
              <div className="px-5 py-4 border-b border-cream/10 flex items-center justify-between select-none bg-black/40 z-10">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-accent" />
                  <div className="w-2.5 h-2.5 rounded-full bg-muted/40" />
                  <div className="w-2.5 h-2.5 rounded-full bg-transparent border border-cream/20" />
                  <span className="text-[11px] text-cream/40 ml-3">Setup instructions</span>
                </div>
                
                {/* Copy button */}
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-cream/10 hover:border-cream/30 hover:text-cream bg-cream/5 text-[10px] transition-all active:scale-95 text-cream/60"
                  aria-label="Copy to Clipboard"
                >
                  {copied ? (
                    <>
                      <Check size={11} className="text-emerald-500" />
                      <span className="text-emerald-500">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={11} />
                      <span>Copy code</span>
                    </>
                  )}
                </button>
              </div>

              {/* Terminal Tabs */}
              <div className="flex bg-black/20 border-b border-cream/10 select-none z-10">
                <button
                  onClick={() => setActiveTab('cli')}
                  className={`flex items-center gap-2 px-5 py-3 border-r border-cream/10 text-[11px] font-semibold transition-all relative ${
                    activeTab === 'cli' ? 'text-cream bg-black' : 'text-cream/40 hover:text-cream/70 hover:bg-cream/5'
                  }`}
                >
                  <Terminal size={12} className={activeTab === 'cli' ? 'text-accent' : ''} />
                  <span>LOCAL CLI SETUP</span>
                  {activeTab === 'cli' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('action')}
                  className={`flex items-center gap-2 px-5 py-3 border-r border-cream/10 text-[11px] font-semibold transition-all relative ${
                    activeTab === 'action' ? 'text-cream bg-black' : 'text-cream/40 hover:text-cream/70 hover:bg-cream/5'
                  }`}
                >
                  <GitPullRequest size={12} className={activeTab === 'action' ? 'text-accent' : ''} />
                  <span>GITHUB ACTION CI</span>
                  {activeTab === 'action' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                  )}
                </button>
              </div>

              {/* Code Display Area */}
              <div className="p-6 bg-[#0c0c0d] overflow-x-auto min-h-[220px]">
                <pre className="text-cream/90 font-mono text-[12.5px] leading-relaxed selection:bg-accent/30 selection:text-white">
                  <code>{activeTab === 'cli' ? cliCode : actionCode}</code>
                </pre>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
