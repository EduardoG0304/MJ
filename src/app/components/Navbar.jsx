'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { FiX, FiMenu } from 'react-icons/fi';

export default function Navbar({ isScrolled }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Inicio", href: "#" },
    { name: "Eventos", href: "#" },
    { name: "Galería", href: "#" },
    { name: "Contacto", href: "#" }
  ];

  return (
    <nav className={`fixed w-full z-50 py-4 transition-all duration-500 ${isScrolled ? 'bg-black shadow-lg backdrop-blur-sm bg-opacity-95' : 'bg-transparent'}`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo con efecto de revelado */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <Link href="/" className="flex items-center group">
            <motion.span 
              className="text-2xl font-bold text-white"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-white">MJ</span>
              <span className="text-gray-300">SPORT</span>
              <span className="text-white">PHOTOGRAPHY</span>
            </motion.span>
          </Link>
        </motion.div>
        
        {/* Menú principal - Desktop */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link, index) => (
            <motion.div
              key={link.name}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
            >
              <Link href={link.href} className="relative group">
                <span className="text-white font-medium tracking-wide text-sm uppercase">
                  {link.name}
                </span>
                <motion.span 
                  className="absolute bottom-0 left-0 w-full h-px bg-white"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  style={{ originX: 0 }}
                />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Menú móvil */}
        <div className="md:hidden flex items-center">
          {/* Botón del menú hamburguesa */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white focus:outline-none"
            aria-label="Menú móvil"
          >
            {isMobileMenuOpen ? (
              <FiX className="w-6 h-6" />
            ) : (
              <FiMenu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Menú móvil desplegable */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-black bg-opacity-95 backdrop-blur-sm overflow-hidden"
          >
            <div className="container mx-auto px-6 py-4">
              <div className="flex flex-col space-y-6">
                {navLinks.map((link) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link 
                      href={link.href} 
                      className="block text-white text-lg py-2 border-b border-gray-800"
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