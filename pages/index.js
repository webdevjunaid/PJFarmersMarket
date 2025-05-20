import ShuffleHero from '@/components/ShuffleHero'
import Navbar from '@/components/Navbar'
import HorizontalScrollCarousel from '@/components/HorizontalScrollCarousel'
import VerticalAccordion from '@/components/VerticalAccordion'
import RevealBento from '@/components/RevealBento'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main>
      <Navbar />
      <div className="mt-20">
        <ShuffleHero />
      </div>
      <div className="mt-10">
        <HorizontalScrollCarousel />
      </div>
      <div className="mt-10">
        <RevealBento />
      </div>
      <div className="mt-10">
        <VerticalAccordion />
      </div>
      <div className="mt-10">
        <Footer />
      </div>
    </main>
  )
}
