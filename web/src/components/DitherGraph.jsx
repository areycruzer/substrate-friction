import { useEffect, useRef } from 'react'

// Halftone-dithered call graph, rendered as ink dots on paper.
// A brightness field (nodes + edges + a traveling pulse) is sampled on a
// coarse grid and thresholded through an 8x8 Bayer matrix — the classic
// ordered-dither look. One edge is missing: the pulse dies there.
const BAYER = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
].map(row => row.map(v => (v + 0.5) / 64))

// normalized graph layout — "your edit" bottom-left, guarding test top-right
const NODES = [
  { x: 0.14, y: 0.78, r: 0.055, hot: true },   // 0 the edit
  { x: 0.34, y: 0.55, r: 0.042 },              // 1
  { x: 0.30, y: 0.90, r: 0.038 },              // 2
  { x: 0.55, y: 0.68, r: 0.045 },              // 3
  { x: 0.58, y: 0.38, r: 0.040 },              // 4
  { x: 0.78, y: 0.55, r: 0.042 },              // 5
  { x: 0.50, y: 0.90, r: 0.034 },              // 6
  { x: 0.86, y: 0.20, r: 0.055, test: true },  // 7 the guarding test
]
const EDGES = [
  [0, 1], [0, 2], [1, 3], [1, 4], [2, 6], [3, 5], [4, 5], [6, 3],
]
// the missing edge: 5 -> 7 (drawn only as a faint ghost; pulse dies at 5)
const MISSING = [5, 7]
const PULSE_PATH = [0, 1, 3, 5] // node indices the pulse travels through

export default function DitherGraph({ className = '' }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animId, W = 0, H = 0
    const CELL = 5 // dither cell in css px

    const resize = () => {
      W = canvas.offsetWidth
      H = canvas.offsetHeight
      if (!W || !H) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = W * dpr
      canvas.height = H * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const distToSeg = (px, py, ax, ay, bx, by) => {
      const dx = bx - ax, dy = by - ay
      const L2 = dx * dx + dy * dy || 1
      let t = ((px - ax) * dx + (py - ay) * dy) / L2
      t = Math.max(0, Math.min(1, t))
      const qx = ax + t * dx, qy = ay + t * dy
      return Math.hypot(px - qx, py - qy)
    }

    let last = 0
    const draw = now => {
      animId = requestAnimationFrame(draw)
      if (now - last < 50) return // ~20fps is plenty for dither
      last = now
      if (!W || !H) return
      const t = now * 0.001

      ctx.clearRect(0, 0, W, H)

      // node positions with a slow organic drift
      const P = NODES.map((n, i) => ({
        x: (n.x + 0.012 * Math.sin(t * 0.5 + i * 1.7)) * W,
        y: (n.y + 0.012 * Math.cos(t * 0.4 + i * 2.3)) * H,
        r: n.r * Math.min(W, H) * (1 + (n.hot ? 0.15 * Math.sin(t * 2) : 0)),
        hot: n.hot, test: n.test,
      }))

      // traveling pulse position along PULSE_PATH (loops, dies at the end)
      const seg = (t * 0.45) % PULSE_PATH.length
      const si = Math.floor(seg)
      const frac = seg - si
      let pulse = null
      if (si < PULSE_PATH.length - 1) {
        const a = P[PULSE_PATH[si]], b = P[PULSE_PATH[si + 1]]
        pulse = { x: a.x + (b.x - a.x) * frac, y: a.y + (b.y - a.y) * frac }
      }

      const cols = Math.ceil(W / CELL), rows = Math.ceil(H / CELL)
      const ink = '#1a1614'
      const accent = '#ff571a'

      for (let gy = 0; gy < rows; gy++) {
        for (let gx = 0; gx < cols; gx++) {
          const x = gx * CELL + CELL / 2
          const y = gy * CELL + CELL / 2

          // brightness field
          let v = 0
          let isAccent = false

          for (const p of P) {
            const d = Math.hypot(x - p.x, y - p.y)
            if (d < p.r * 3.2) {
              const g = Math.exp(-(d * d) / (2 * p.r * p.r))
              v += g * (p.hot || p.test ? 1.15 : 0.95)
              if ((p.hot || p.test) && g > 0.25) isAccent = true
            }
          }
          for (const [a, b] of EDGES) {
            const d = distToSeg(x, y, P[a].x, P[a].y, P[b].x, P[b].y)
            if (d < 7) v += 0.34 * Math.exp(-(d * d) / 18)
          }
          // ghost of the missing edge — barely there
          {
            const d = distToSeg(x, y, P[MISSING[0]].x, P[MISSING[0]].y, P[MISSING[1]].x, P[MISSING[1]].y)
            if (d < 5) {
              const dash = Math.sin((x + y) * 0.35) > 0.4 ? 1 : 0
              if (dash) { v += 0.16 * Math.exp(-(d * d) / 10); if (d < 3) isAccent = true }
            }
          }
          // the pulse: bright accent blob
          if (pulse) {
            const d = Math.hypot(x - pulse.x, y - pulse.y)
            if (d < 26) { v += 0.9 * Math.exp(-(d * d) / 160); if (d < 16) isAccent = true }
          }

          if (v <= 0.02) continue
          const threshold = BAYER[gy % 8][gx % 8]
          if (v > threshold) {
            const rDot = Math.min(CELL * 0.42, CELL * 0.18 + v * CELL * 0.22)
            ctx.beginPath()
            ctx.arc(x, y, rDot, 0, Math.PI * 2)
            ctx.fillStyle = isAccent ? accent : ink
            ctx.fill()
          }
        }
      }
    }
    animId = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(animId); ro.disconnect() }
  }, [])

  return <canvas ref={canvasRef} className={className} aria-label="Dithered call graph: a pulse travels from the edit through the graph and dies before the guarding test — the edge to it is missing" />
}
