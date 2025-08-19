'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { FiX, FiMenu } from 'react-icons/fi';

export default function Navbar({ isScrolled }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Inicio", href: "#" },
    { name: "Eventos", href: "\eventos" },
    { name: "Sobre Mi", href: "\aboutme" },
    { name: "Contacto", href: "\contacto" }
  ];

  return (
    <nav className={`fixed w-full z-50 py-3 transition-all duration-500 ${isScrolled ? 'bg-black shadow-md backdrop-blur-md bg-opacity-90' : 'bg-transparent'}`}>
      <div className="container mx-auto px-5 flex justify-between items-center">
        {/* Logo con diseño más moderno */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex items-center"
        >
          <Link href="/" className="flex items-center group">
            <div className="flex flex-col">
              <motion.span 
                className="text-xl font-bold text-white tracking-tight"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <span className="text-white font-extrabold">MJ</span>
                <span className="text-gray-300 font-medium">SPORT</span>
              </motion.span>
              <span className="text-xs text-white tracking-widest mt-0.5">PHOTOGRAPHY</span>
            </div>
          </Link>
        </motion.div>
        
        {/* Menú principal - Desktop con diseño más limpio */}
        <div className="hidden md:flex items-center space-x-7">
          {navLinks.map((link, index) => (
            <motion.div
              key={link.name}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
            >
              <Link href={link.href} className="relative group py-1">
                <span className="text-white font-medium tracking-wide text-sm uppercase transition-colors duration-300 group-hover:text-gray-300">
                  {link.name}
                </span>
                <motion.span 
                  className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"
                  style={{ originX: 0 }}
                />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Menú móvil con icono más estilizado */}
        <div className="md:hidden flex items-center">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-all"
            aria-label="Menú móvil"
          >
            {isMobileMenuOpen ? (
              <FiX className="w-6 h-6 transform transition-transform duration-300 rotate-90" />
            ) : (
              <FiMenu className="w-6 h-6 transform transition-transform duration-300" />
            )}
          </button>
        </div>
      </div>

      {/* Menú móvil desplegable con diseño mejorado */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-black bg-opacity-95 backdrop-blur-lg overflow-hidden"
          >
            <div className="container mx-auto px-5 py-5">
              <div className="flex flex-col space-y-5">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.1 }}
                  >
                    <Link 
                      href={link.href} 
                      className="block text-white text-base py-3 border-b border-gray-800 transition-colors duration-300 hover:text-gray-300 hover:pl-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}