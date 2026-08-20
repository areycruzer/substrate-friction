const cols = [
  {
    heading: 'PRODUCT',
    links: [
      { label: 'Quickstart', href: 'https://github.com/areycruzer/substrate-friction#quickstart' },
      { label: 'Walkthrough', href: 'walkthrough.html' },
      { label: 'Interactive demo', href: 'demo.html' },
    ],
  },
  {
    heading: 'EVIDENCE',
    links: [
      { label: 'The gate report', href: 'https://github.com/areycruzer/substrate-friction/blob/main/docs/gate.md' },
      { label: 'Pre-registered studies', href: 'https://github.com/areycruzer/substrate-friction/blob/main/docs/studies.md' },
      { label: 'Related work', href: 'https://github.com/areycruzer/substrate-friction/blob/main/docs/related-work.md' },
      { label: 'Origin', href: 'https://github.com/areycruzer/substrate-friction/blob/main/docs/ORIGIN.md' },
    ],
  },
  {
    heading: 'UPSTREAM',
    links: [
      { label: 'hydradb #81', href: 'https://github.com/hydra-db/hydradb/issues/81' },
      { label: 'hydradb #82', href: 'https://github.com/hydra-db/hydradb/pull/82' },
      { label: 'hydradb #101', href: 'https://github.com/hydra-db/hydradb/issues/101' },
      { label: 'hydradb #102', href: 'https://github.com/hydra-db/hydradb/issues/102' },
    ],
  },
  {
    heading: 'LICENSE',
    links: [
      { label: 'MIT (this project)', href: 'https://github.com/areycruzer/substrate-friction/blob/main/LICENSE' },
      { label: 'AGPL-3.0 (engine, external)', href: 'https://github.com/hydra-db/hydradb' },
    ],
  },
]

const TICKER = 'MEASURE THE MAP BEFORE YOU TRUST IT · GUARDING-TEST RECALL 0.419 POOLED / 7 REPOS · VERDICT RUN_FULL · FAIL-CLOSED BY CONSTRUCTION · '

export default function Footer() {
  return (
    <footer className="rule" style={{ background: 'var(--paper-deep)' }}>
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-10">
        {/* Link columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
          {cols.map(col => (
            <div key={col.heading}>
              <div className="micro-label mb-5">{col.heading}</div>
              <ul className="flex flex-col gap-2.5">
                {col.links.map(l => (
                  <li key={l.label}>
                    <a href={l.href} className="text-sm hover:opacity-60 transition-opacity" style={{ color: 'var(--ink)' }}>
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Status row */}
        <div className="rule pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-2">
            <span className="status-dot w-2 h-2 rounded-full bg-accent" />
            <span className="micro-label" style={{ color: 'var(--ink)' }}>ALL GATES REFUSING · RUN_FULL</span>
          </div>
          <span className="micro-label">ENGINE DIGEST-PINNED · db78309a · COMMIT 02a40025</span>
          <span className="micro-label">BUILT ON HYDRADB</span>
        </div>
      </div>

      {/* Bottom ticker */}
      <div className="overflow-hidden py-3 rule">
        <div className="ticker-track flex whitespace-nowrap w-max">
          {[0, 1].map(n => (
            <span key={n} className="micro-label px-4" style={{ color: 'var(--muted)' }}>
              {TICKER.repeat(3)}
            </span>
          ))}
        </div>
      </div>
    </footer>
  )
}
