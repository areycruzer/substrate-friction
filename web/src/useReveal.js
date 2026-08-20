import { useEffect, useRef } from 'react'

// Adds .in to .reveal elements (or the ref root itself) when scrolled into view.
export default function useReveal() {
  const ref = useRef(null)
  useEffect(() => {
    const root = ref.current
    if (!root) return
    const targets = root.classList.contains('reveal') ? [root] : [...root.querySelectorAll('.reveal')]
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }),
      { threshold: 0.15 }
    )
    targets.forEach(t => io.observe(t))
    return () => io.disconnect()
  }, [])
  return ref
}
