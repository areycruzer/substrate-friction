import { useState, useEffect, useRef } from 'react'
import { RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react'
import ConsoleWindow, { ConsolePill } from './ConsoleWindow'

// Both playbacks mirror committed captures (docs/captures/) — the gate
// refuses (that IS the product), and verify passes because the shipped
// artifacts are consistent. Nothing invented.
const BANNER_TOP = `███████╗██╗   ██╗██████╗ ███████╗████████╗██████╗  █████╗ ████████╗███████╗
██╔════╝██║   ██║██╔══██╗██╔════╝╚══██╔══╝██╔══██╗██╔══██╗╚══██╔══╝██╔════╝
███████╗██║   ██║██████╔╝███████╗   ██║   ██████╔╝███████║   ██║   █████╗
╚════██║██║   ██║██╔══██╗╚════██║   ██║   ██╔══██╗██╔══██║   ██║   ██╔══╝
███████║╚██████╔╝██████╔╝███████║   ██║   ██║  ██║██║  ██║   ██║   ███████║
╚══════╝ ╚═════╝ ╚═════╝ ╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ╚══════╝`

const BANNER_BOTTOM = `   ███████╗██████╗ ██╗ ██████╗████████╗██╗ ██████╗ ███╗   ██╗
   ██╔════╝██╔══██╗██║██╔════╝╚══██╔══╝██║██╔═══██╗████╗  ██║
───█████╗  ██████╔╝██║██║        ██║   ██║██║   ██║██╔██╗ ██║
───██╔══╝  ██╔══██╗██║██║        ██║   ██║██║   ██║██║╚██╗██║
   ██║     ██║  ██║██║╚██████╗   ██║   ██║╚██████╔╝██║ ╚████║
   ╚═╝     ╚═╝  ╚═╝╚═╝ ╚═════╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝`

const SEP = '────────────────────────────────────────────────────'

// Mirrors docs/captures/10-hero-session.txt — the README hero terminal.
const GATE_RUN = [
  { type: 'type', text: 'friction gate --arm arm_b' },
  { type: 'banner', delay: 250 },
  { type: 'line', text: 'measure the map before you trust it', delay: 350, color: 'dim' },
  { type: 'line', text: SEP, delay: 300, color: 'dim' },
  { type: 'fail', text: '[FAIL]  RUN_FULL      arm=arm_b  k=6', delay: 500 },
  { type: 'line', text: SEP, delay: 250, color: 'dim' },
  { type: 'line', text: '  measured test->fix recall : 0.545  (24/44 labelled instances)', delay: 500, color: 'plain' },
  { type: 'line', text: '  bar for skipping          : 0.95', delay: 400, color: 'plain' },
  { type: 'line', text: '', delay: 150 },
  { type: 'line', text: '  45% of tests known to guard their fix are not reachable', delay: 450, color: 'warn' },
  { type: 'line', text: '  in this graph — a skip would silently drop them', delay: 250, color: 'warn' },
  { type: 'line', text: '', delay: 150 },
  { type: 'line', text: '  per repo:', delay: 300, color: 'plain' },
  { type: 'bar', text: '    django          24/44   0.55  ', delay: 400 },
  { type: 'line', text: SEP, delay: 300, color: 'dim' },
  { type: 'line', text: '', delay: 200 },
  { type: 'type', text: 'friction gate --instance django__django-11551 --live' },
  { type: 'fail', text: '  django__django-11551   LIVE — executed in the engine', delay: 450 },
  { type: 'line', text: '  loaded : 28,353 nodes, 61,536 edges in 10421 ms', delay: 500, color: 'plain' },
  { type: 'line', text: '  query  : MATCH (s {id:…})-[:CALLED_BY*1..6]->(n)', delay: 450, color: 'dim' },
  { type: 'line', text: '           engine 3.2 ms, 2 nodes reached', delay: 350, color: 'plain' },
  { type: 'line', text: '  engine selected 0 of 1 guarding tests; parity=True', delay: 500, color: 'plain' },
  { type: 'fail', text: '  DROPPED: 1 guarding test — the engine itself proves the miss.', delay: 500 },
  { type: 'line', text: '', delay: 150 },
  { type: 'verdict', text: 'RUN_FULL — route to human verification · exit 1', badge: 'FAIL', delay: 600 },
]

const VERIFY_RUN = [
  { type: 'type', text: 'friction verify' },
  { type: 'line', text: '[verify] re-auditing shipped graphs… (24/44, 15/30)', delay: 600, color: 'dim' },
  { type: 'line', text: '[verify] re-deriving corpus summary from per-instance rows', delay: 500, color: 'plain' },
  { type: 'line', text: '[verify] asserting README + site quote the artifact exactly', delay: 500, color: 'plain' },
  { type: 'line', text: '[verify] engine digest-pinned: hydradb@sha256:db78309a…', delay: 400, color: 'dim' },
  { type: 'line', text: '', delay: 150 },
  { type: 'verdict', text: 'VERIFY OK — every shipped figure re-derived', badge: 'PASS', delay: 700 },
  { type: 'line', text: '[status] exit code 0 · nonzero on any drift', delay: 400, color: 'ok' },
]

const COLORS = {
  dim: 'rgba(250,249,246,0.4)',
  plain: 'rgba(250,249,246,0.78)',
  warn: '#ff8a55',
  ok: '#7dc383',
}

export default function TerminalMockup() {
  const [activeTab, setActiveTab] = useState('gate')
  const [lines, setLines] = useState([])
  const [typing, setTyping] = useState(null) // string while typing
  const [done, setDone] = useState(false)
  const timerRef = useRef(null)
  const scrollRef = useRef(null)

  const timeline = activeTab === 'gate' ? GATE_RUN : VERIFY_RUN

  const clear = () => { if (timerRef.current) clearTimeout(timerRef.current) }

  const runStep = (index) => {
    if (index >= timeline.length) {
      setDone(true)
      timerRef.current = setTimeout(() => {
        setLines([]); setDone(false); runStep(0)
      }, 6000)
      return
    }
    const step = timeline[index]
    if (step.type === 'type') {
      const typeChar = (n) => {
        if (n <= step.text.length) {
          setTyping(step.text.slice(0, n))
          timerRef.current = setTimeout(() => typeChar(n + 1), 28 + Math.random() * 30)
        } else {
          timerRef.current = setTimeout(() => {
            setTyping(null)
            setLines(prev => [...prev, { type: 'command', text: step.text }])
            runStep(index + 1)
          }, 400)
        }
      }
      typeChar(0)
    } else {
      timerRef.current = setTimeout(() => {
        setLines(prev => [...prev, step])
        runStep(index + 1)
      }, step.delay || 400)
    }
  }

  useEffect(() => {
    clear(); setLines([]); setTyping(null); setDone(false)
    runStep(0)
    return clear
  }, [activeTab])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    }
  }, [lines, typing])

  const restart = () => { clear(); setLines([]); setTyping(null); setDone(false); runStep(0) }

  return (
    <ConsoleWindow
      title={`substrate—friction · recorded session · ${activeTab === 'gate' ? 'gate' : 'verify'}`}
      className="h-[440px]"
      right={
        <div className="flex items-center gap-2">
          <ConsolePill active={activeTab === 'gate'} onClick={() => setActiveTab('gate')}>gate</ConsolePill>
          <ConsolePill active={activeTab === 'verify'} onClick={() => setActiveTab('verify')}>verify</ConsolePill>
        </div>
      }
      footer={
        <>
          <span>replayed from docs/captures/ · loops every 6 s</span>
          <ConsolePill onClick={restart}><RefreshCw size={10} /> replay</ConsolePill>
        </>
      }
    >
      <div ref={scrollRef} className="flex-1 p-6 font-mono text-[12.5px] leading-[1.85] overflow-y-auto overflow-x-hidden no-scrollbar">
        {lines.map((line, idx) => {
          if (line.type === 'command') {
            return (
              <div key={idx} className="mb-1.5">
                <span style={{ color: '#7dc383' }}>$ </span>
                <span style={{ color: '#faf9f6', fontWeight: 500 }}>{line.text}</span>
              </div>
            )
          }
          if (line.type === 'banner') {
            return (
              <div key={idx} className="my-3" style={{ fontSize: 'clamp(5px, 1.4vw, 8px)', lineHeight: 1.02, letterSpacing: 0, fontWeight: 700 }}>
                <pre style={{ color: 'var(--accent)', fontFamily: 'inherit', textShadow: '0 0 6px rgba(255,87,26,0.35)' }}>{BANNER_TOP}</pre>
                <pre style={{ color: '#faf9f6', fontFamily: 'inherit', marginTop: 2, textShadow: '0 0 5px rgba(250,249,246,0.25)' }}>{BANNER_BOTTOM}</pre>
              </div>
            )
          }
          if (line.type === 'fail') {
            return (
              <div key={idx} className="whitespace-pre font-semibold" style={{ color: 'var(--accent)' }}>
                {line.text}
              </div>
            )
          }
          if (line.type === 'bar') {
            return (
              <div key={idx} className="whitespace-pre" style={{ color: 'rgba(250,249,246,0.78)' }}>
                {line.text}
                <span style={{ color: 'var(--accent)' }}>{'█'.repeat(10)}</span>
                <span style={{ color: 'rgba(250,249,246,0.25)' }}>{'·'.repeat(8)}</span>
              </div>
            )
          }
          if (line.type === 'verdict') {
            const isPass = line.badge === 'PASS'
            return (
              <div key={idx} className="my-3 px-4 py-2.5 rounded-full inline-flex items-center gap-2.5 text-[12px] font-semibold"
                style={{
                  background: isPass ? 'rgba(125,195,131,0.1)' : 'rgba(255,87,26,0.1)',
                  border: `1px solid ${isPass ? 'rgba(125,195,131,0.35)' : 'rgba(255,87,26,0.35)'}`,
                  color: isPass ? '#7dc383' : '#ff8a55',
                }}>
                {isPass ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                {line.text}
              </div>
            )
          }
          return (
            <div key={idx} className="whitespace-pre" style={{ color: COLORS[line.color] || COLORS.plain }}>
              {line.text || ' '}
            </div>
          )
        })}

        {typing !== null && (
          <div>
            <span style={{ color: '#7dc383' }}>$ </span>
            <span style={{ color: '#faf9f6', fontWeight: 500 }}>{typing}</span>
            <span className="inline-block w-[7px] h-[13px] ml-px align-middle animate-pulse" style={{ background: 'var(--accent)' }} />
          </div>
        )}
        {typing === null && done && (
          <div className="mt-1">
            <span style={{ color: '#7dc383' }}>$ </span>
            <span className="inline-block w-[7px] h-[13px] align-middle animate-pulse" style={{ background: 'rgba(250,249,246,0.7)' }} />
          </div>
        )}
      </div>
    </ConsoleWindow>
  )
}
