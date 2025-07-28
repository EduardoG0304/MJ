'use client';

import HeroSection from './components/HeroSection';
import Navbar from './components/Navbar';
import HeroSearch from './components/HeroSearch';
import HowItWorks from './components/HowItWorks';
import Testimonials from './components/Testimonials';
import Newsletter from './components/Newsletter';
import Footer from './components/Footer';
import FeaturedEvents from './eventos/FeaturedEvents';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <HeroSection>
          <HeroSearch />
        </HeroSection>
        
        <section className="py-16 bg-gray-100">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
              Eventos Destacados
            </h2>
            <FeaturedEvents/>
          </div>
        </section>

        <section className="py-16 bg-white">
          <HowItWorks />
        </section>

        <Testimonials />
        
        <Newsletter />
      </main>

      <Footer />
    </div>
  );
}