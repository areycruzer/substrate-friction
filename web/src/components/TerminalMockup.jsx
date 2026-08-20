import { useState, useEffect, useRef } from 'react'
import { Terminal as TerminalIcon, Play, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react'

const GATE_RUN = [
  { type: 'type', text: 'friction gate --arm arm_b --threshold 0.95' },
  { type: 'line', text: '[info] loading consensus database (consensus.json)...', delay: 500, color: 'text-muted' },
  { type: 'line', text: '[info] loaded 172 historical bug-fixes, 7 repositories', delay: 300, color: 'text-muted' },
  { type: 'line', text: '[triage] calculating blast radius for diff: HEAD~1..HEAD', delay: 700, color: 'text-cream/90' },
  { type: 'line', text: '[triage] mapping AST code symbols to guarding tests...', delay: 500, color: 'text-cream/90' },
  { type: 'line', text: '[engine] comparing arms: arm_a (name-match) vs arm_b (type-resolve)', delay: 600, color: 'text-cream/90' },
  { type: 'line', text: '[engine] diffing AST edges... 5,811 semantic relationships parsed', delay: 600, color: 'text-cream/90' },
  { type: 'line', text: '[engine] WARNING: 104 dynamic call sites missing in arm_a', delay: 400, color: 'text-accent' },
  { type: 'line', text: '[evaluate] evaluating test->fix recall constraint...', delay: 700, color: 'text-cream/90' },
  { type: 'line', text: '[evaluate] recall score: 0.419 (72/172 fixes reachable in graph)', delay: 500, color: 'text-accent font-semibold' },
  { type: 'line', text: '[evaluate] skip threshold: 0.95 (FAIL)', delay: 400, color: 'text-accent' },
  { type: 'line', text: '', delay: 100 },
  { type: 'verdict', text: 'VERDICT: FAIL_CLOSED (RUN_FULL)', delay: 700, badge: 'FAIL', color: 'text-accent font-bold' },
  { type: 'line', text: '[status] exit code 1 (gate refused skip command)', delay: 400, color: 'text-accent' },
]

const VALIDATE_RUN = [
  { type: 'type', text: 'friction validate --commits HEAD~20..HEAD' },
  { type: 'line', text: '[verify] scanning 20 commits for AST changes...', delay: 500, color: 'text-muted' },
  { type: 'line', text: '[verify] parsing python AST structure at each commit...', delay: 400, color: 'text-muted' },
  { type: 'line', text: '[verify] testing S5 (django longitudinal suite)...', delay: 600, color: 'text-cream/90' },
  { type: 'line', text: '[verify] resolved 12,482 function calls and import paths', delay: 500, color: 'text-cream/90' },
  { type: 'line', text: '[verify] Name-Matched recall: 0.419 (unsafe)', delay: 500, color: 'text-accent' },
  { type: 'line', text: '[verify] Type-Resolved recall: 1.000 (172/172 fixes reachable)', delay: 600, color: 'text-emerald-500 font-semibold' },
  { type: 'line', text: '[verify] consensus engine validation hash: sha256:d8b78a0a', delay: 400, color: 'text-muted' },
  { type: 'line', text: '', delay: 100 },
  { type: 'verdict', text: 'VERDICT: PASS_SKIP (GATE_PASS)', delay: 700, badge: 'PASS', color: 'text-emerald-500 font-bold' },
  { type: 'line', text: '[status] exit code 0 (skip request certified)', delay: 400, color: 'text-emerald-500' },
]

export default function TerminalMockup() {
  const [activeTab, setActiveTab] = useState('gate') // 'gate' or 'validate'
  const [lines, setLines] = useState([])
  const [currentTypeText, setCurrentTypeText] = useState('')
  const [typingIndex, setTypingIndex] = useState(0)
  const [timelineIndex, setTimelineIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const timerRef = useRef(null)

  const timeline = activeTab === 'gate' ? GATE_RUN : VALIDATE_RUN

  useEffect(() => {
    // Reset terminal when tab changes
    setLines([])
    setCurrentTypeText('')
    setTypingIndex(0)
    setTimelineIndex(0)
    setIsTyping(false)
    if (timerRef.current) clearTimeout(timerRef.current)

    // Trigger start of typing
    startTimelineStep(0)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [activeTab])

  const startTimelineStep = (index) => {
    if (index >= timeline.length) {
      // Loop after delay
      timerRef.current = setTimeout(() => {
        setLines([])
        setCurrentTypeText('')
        setTypingIndex(0)
        setTimelineIndex(0)
        startTimelineStep(0)
      }, 5000)
      return
    }

    setTimelineIndex(index)
    const step = timeline[index]

    if (step.type === 'type') {
      setIsTyping(true)
      setCurrentTypeText('')
      typeChar(step.text, 0, index)
    } else {
      setIsTyping(false)
      timerRef.current = setTimeout(() => {
        setLines(prev => [...prev, step])
        startTimelineStep(index + 1)
      }, step.delay || 400)
    }
  }

  const typeChar = (text, charIdx, stepIdx) => {
    if (charIdx <= text.length) {
      setCurrentTypeText(text.slice(0, charIdx))
      timerRef.current = setTimeout(() => {
        typeChar(text, charIdx + 1, stepIdx)
      }, 35 + Math.random() * 40) // Random typing speed
    } else {
      setIsTyping(false)
      timerRef.current = setTimeout(() => {
        setLines(prev => [...prev, { type: 'command', text }])
        setCurrentTypeText('')
        startTimelineStep(stepIdx + 1)
      }, 500)
    }
  }

  const restartSimulation = () => {
    setLines([])
    setCurrentTypeText('')
    setTypingIndex(0)
    setTimelineIndex(0)
    setIsTyping(false)
    if (timerRef.current) clearTimeout(timerRef.current)
    startTimelineStep(0)
  }

  return (
    <div className="relative group/term h-full min-h-[440px] rounded-xl overflow-hidden flex flex-col justify-between" style={{ background: '#161413', border: '1px solid rgba(22, 20, 19, 0.15)' }}>
      {/* Corner Brackets */}
      <span className="absolute top-[-3px] left-[-3px] w-3.5 h-3.5 border-t border-l border-cream/20 group-hover/term:border-accent transition-all duration-300 z-20" />
      <span className="absolute top-[-3px] right-[-3px] w-3.5 h-3.5 border-t border-r border-cream/20 group-hover/term:border-accent transition-all duration-300 z-20" />
      <span className="absolute bottom-[-3px] left-[-3px] w-3.5 h-3.5 border-b border-l border-cream/20 group-hover/term:border-accent transition-all duration-300 z-20" />
      <span className="absolute bottom-[-3px] right-[-3px] w-3.5 h-3.5 border-b border-r border-cream/20 group-hover/term:border-accent transition-all duration-300 z-20" />

      {/* Terminal Title Bar */}
      <div className="px-5 py-3 border-b border-cream/10 flex items-center justify-between select-none bg-black/30 z-10">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
          <span className="text-[10px] text-cream/40 font-mono ml-2 flex items-center gap-1">
            <TerminalIcon size={12} /> session · {activeTab === 'gate' ? 'gate.sh' : 'validate.sh'}
          </span>
        </div>

        {/* Tab Selector Buttons */}
        <div className="flex items-center gap-1 bg-cream/5 p-0.5 rounded-lg border border-cream/10">
          <button
            onClick={() => setActiveTab('gate')}
            className={`px-2.5 py-0.5 text-[9px] font-mono rounded transition-all ${
              activeTab === 'gate' 
                ? 'bg-cream text-ink font-semibold' 
                : 'text-cream/50 hover:text-cream hover:bg-cream/5'
            }`}
          >
            gate check
          </button>
          <button
            onClick={() => setActiveTab('validate')}
            className={`px-2.5 py-0.5 text-[9px] font-mono rounded transition-all ${
              activeTab === 'validate' 
                ? 'bg-cream text-ink font-semibold' 
                : 'text-cream/50 hover:text-cream hover:bg-cream/5'
            }`}
          >
            validate suite
          </button>
        </div>
      </div>

      {/* Terminal Terminal Screen */}
      <div className="flex-1 p-6 font-mono text-[12.5px] leading-relaxed overflow-y-auto overflow-x-hidden text-cream/80 select-all no-scrollbar max-h-[340px]">
        {lines.map((line, idx) => {
          if (line.type === 'command') {
            return (
              <div key={idx} className="mb-2">
                <span className="text-emerald-500 mr-2">visitor@friction:~$</span>
                <span className="text-cream font-medium">{line.text}</span>
              </div>
            )
          }

          if (line.type === 'verdict') {
            const isPass = line.badge === 'PASS'
            return (
              <div key={idx} className="my-3 p-3 rounded-lg border inline-flex items-center gap-2" style={{
                background: isPass ? 'rgba(16, 185, 129, 0.06)' : 'rgba(255, 87, 26, 0.06)',
                borderColor: isPass ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 87, 26, 0.3)',
              }}>
                {isPass ? <CheckCircle2 size={16} className="text-emerald-500 animate-pulse" /> : <AlertTriangle size={16} className="text-accent animate-pulse" />}
                <span className={line.color}>{line.text}</span>
              </div>
            )
          }

          return (
            <div key={idx} className={`mb-0.5 ${line.color || 'text-cream'}`}>
              {line.text}
            </div>
          )
        })}

        {/* Typing Line */}
        {isTyping && (
          <div>
            <span className="text-emerald-500 mr-2">visitor@friction:~$</span>
            <span className="text-cream font-medium">{currentTypeText}</span>
            <span className="animate-ping font-bold ml-0.5" style={{ animationDuration: '0.8s' }}>_</span>
          </div>
        )}

        {/* Blinking idle cursor */}
        {!isTyping && timelineIndex >= timeline.length && (
          <div className="mt-1">
            <span className="text-emerald-500 mr-2">visitor@friction:~$</span>
            <span className="inline-block w-1.5 h-3 bg-cream animate-pulse" style={{ animationDuration: '1s' }} />
          </div>
        )}
      </div>

      {/* Terminal Footer Panel */}
      <div className="px-5 py-3 border-t border-cream/10 flex items-center justify-between select-none bg-black/15 z-10 text-[10px] text-cream/40 font-mono">
        <span>Interval loop: 5s</span>
        <button 
          onClick={restartSimulation}
          className="flex items-center gap-1 px-2.5 py-1 rounded border border-cream/10 hover:border-cream/30 hover:text-cream bg-cream/5 transition-all active:scale-95"
        >
          <RefreshCw size={10} />
          Reset playback
        </button>
      </div>
    </div>
  )
}
