'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { FiShoppingCart, FiX, FiMenu } from 'react-icons/fi';

export default function Navbar({ isScrolled }) {
  const [cartItems, setCartItems] = useState(3);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const cartProducts = [
    { id: 1, name: "Foto Maratón #1234", price: 15.99, quantity: 1 },
    { id: 2, name: "Foto Torneo Fútbol #567", price: 12.99, quantity: 2 }
  ];

  const total = cartProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0);

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

          {/* Carrito de compras */}
          <motion.div 
            className="relative ml-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <button 
              onClick={() => setIsCartOpen(!isCartOpen)}
              className="p-2 text-white hover:text-gray-300 transition-all relative"
              aria-label="Carrito de compras"
            >
              <FiShoppingCart className="w-5 h-5" />
              {cartItems > 0 && (
                <motion.span 
                  className="absolute -top-1 -right-1 bg-white text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  {cartItems}
                </motion.span>
              )}
            </button>

            {/* Dropdown del carrito */}
            <AnimatePresence>
              {isCartOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl z-50 border border-gray-200 overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-5">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-gray-900">Tu Carrito</h3>
                      <button 
                        onClick={() => setIsCartOpen(false)}
                        className="text-gray-500 hover:text-gray-700"
                        aria-label="Cerrar carrito"
                      >
                        <FiX className="w-5 h-5" />
                      </button>
                    </div>
                    
                    {cartProducts.length > 0 ? (
                      <>
                        <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                          {cartProducts.map(item => (
                            <motion.div 
                              key={item.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.2 }}
                              className="flex justify-between items-center pb-3 border-b border-gray-100"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-gray-800 font-medium truncate">{item.name}</p>
                                <p className="text-gray-500 text-sm">{item.quantity} × ${item.price.toFixed(2)}</p>
                              </div>
                              <p className="text-gray-900 font-bold whitespace-nowrap ml-4">
                                ${(item.price * item.quantity).toFixed(2)}
                              </p>
                            </motion.div>
                          ))}
                        </div>
                        
                        <div className="mt-5 pt-4 border-t border-gray-200">
                          <div className="flex justify-between items-center mb-5">
                            <span className="text-gray-700 font-medium">Total:</span>
                            <span className="text-gray-900 font-bold text-lg">${total.toFixed(2)}</span>
                          </div>
                          <motion.button 
                            className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            Ver carrito
                          </motion.button>
                        </div>
                      </>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="py-8 text-center"
                      >
                        <p className="text-gray-500">Tu carrito está vacío</p>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Menú móvil */}
        <div className="md:hidden flex items-center">
          {/* Botón del carrito para móvil */}
          <button 
            onClick={() => setIsCartOpen(!isCartOpen)}
            className="p-2 text-white mr-4 relative"
            aria-label="Carrito de compras"
          >
            <FiShoppingCart className="w-5 h-5" />
            {cartItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-white text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartItems}
              </span>
            )}
          </button>

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