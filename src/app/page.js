'use client';

import HeroSection from './components/HeroSection';
import Navbar from './components/Navbar';
import HowItWorks from './components/HowItWorks';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import FeaturedEvents from './eventos/FeaturedEvents';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <HeroSection>
          
        </HeroSection>
        
        <section className="py-16 bg-gray-100">
            <FeaturedEvents/>
        </section>

        <section className="py-16 bg-white">
          <HowItWorks />
        </section>

        <Testimonials />
        
      </main>

      <Footer />
    </div>
  );
}