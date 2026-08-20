import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'
import useReveal from '../useReveal'

const faqs = [
  {
    q: 'Explain it like I\'m not an engineer.',
    a: 'AI coding assistants save time by skipping tests they think don\'t matter. They decide using a map of your code. We measured the map: it misses more than half the connections that matter, so skipping is gambling. This tool is the seatbelt — it blocks the skip until the map is proven good. Today that means: run everything.',
  },
  {
    q: 'Does 0.419 pooled contradict 0.545 on django?',
    a: 'No — same measurement, different scope: 0.545 is django alone (n=44), 0.419 is all 7 repos pooled (n=172). The per-repo spread — 1.00 down to 0.00 — is itself the finding: matplotlib and pytest sit at zero because their guarding tests live in a different graph component, invisible to both extractors.',
  },
  {
    q: 'Is RUN_FULL a failure?',
    a: 'It is the product working: a gate that refuses to license a skip below the measured bar. The exit code is 1 so CI fails closed. The autonomous path (SKIP_SAFE, exit 0) exists and is tested — it requires the recall\'s one-sided 95% lower bound to clear the bar, so no small-sample fluke can grant autonomy. No graph class has earned it yet.',
  },
  {
    q: 'Why not just use a better extractor?',
    a: 'Measured: upgrading name matching to full pyright type resolution moved paired recall by +0.071 (n=28, McNemar p=0.73). Precision and recall of a static analysis are separate concerns — ICSE 2020 reported the same separation for Java. And the ceiling has been flat for eight years of django, so waiting for the problem to fix itself is not a strategy.',
  },
  {
    q: 'What happened to predicting agent failure?',
    a: 'That was the founding bet — a triage gate routing hard tickets to humans. It died by its own pre-registered protocol (held-out AUC 0.483, at or below chance) and is published in full. The gate is that idea one level deeper: the verdict moved from a probabilistic guess about the agent to a measured fact about the graph, and "route to human" became RUN_FULL.',
  },
  {
    q: 'What was retracted?',
    a: 'Three figures, all still published with causes written down: two predictor AUCs (measurement defects) and one latency ratio (a cross-graph comparison). Retractions stay published on purpose — the discipline that caught them is the same discipline the product sells.',
  },
]

export default function Faq() {
  const ref = useReveal()
  const [openIdx, setOpenIdx] = useState(0)

  return (
    <section ref={ref} id="faq" className="py-24 rule">
      <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-[0.8fr_1.2fr] gap-16">
        <div className="reveal">
          <div className="micro-label mb-4">05 / FAQ</div>
          <h2 className="font-serif-display text-[36px] sm:text-[44px] leading-[1.1]" style={{ color: 'var(--ink)' }}>
            Questions a careful<br />reader asks.
          </h2>
          <p className="mt-5 text-[15px] max-w-sm" style={{ color: 'var(--ink-soft)' }}>
            What teams want to know before putting a refusal gate in their CI.
          </p>
        </div>

        <div className="reveal">
          {faqs.map((f, i) => (
            <div key={i} className="rule">
              <button
                className="w-full py-6 flex items-center justify-between gap-6 text-left"
                onClick={() => setOpenIdx(openIdx === i ? -1 : i)}
              >
                <span className="font-serif-display text-[20px]" style={{ color: 'var(--ink)' }}>{f.q}</span>
                {openIdx === i
                  ? <Minus size={18} style={{ color: 'var(--muted)', flexShrink: 0 }} />
                  : <Plus size={18} style={{ color: 'var(--muted)', flexShrink: 0 }} />}
              </button>
              {openIdx === i && (
                <p className="pb-7 text-[15px] leading-[1.75] max-w-xl" style={{ color: 'var(--ink-soft)' }}>
                  {f.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
