import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Quote from './components/Quote'
import Gap from './components/Gap'
import Layers from './components/Layers'
import Surfaces from './components/Surfaces'
import Faq from './components/Faq'
import ResearchLog from './components/ResearchLog'
import Closing from './components/Closing'
import Footer from './components/Footer'

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Quote />
      <Gap />
      <Layers />
      <Surfaces />
      <Faq />
      <ResearchLog />
      <Closing />
      <Footer />
    </div>
  )
}
