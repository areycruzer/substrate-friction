import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Quote from './components/Quote'
import Gap from './components/Gap'
import Layers from './components/Layers'
import Surfaces from './components/Surfaces'
import Quickstart from './components/Quickstart'
import Faq from './components/Faq'
import ResearchLog from './components/ResearchLog'
import Closing from './components/Closing'
import Footer from './components/Footer'
import CommandMenu from './components/CommandMenu'

export default function App() {
  const [isCommandOpen, setIsCommandOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsCommandOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="min-h-screen">
      <Navbar onSearchClick={() => setIsCommandOpen(true)} />
      <Hero />
      <Quote />
      <Gap />
      <Layers />
      <Surfaces />
      <Quickstart />
      <Faq />
      <ResearchLog />
      <Closing />
      <Footer />
      <CommandMenu isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />
    </div>
  )
}

