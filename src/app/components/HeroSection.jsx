'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function HeroSection({ children }) {
  const [currentImage, setCurrentImage] = useState(0);
  const [isClient, setIsClient] = useState(false);

  // Imágenes de deportes de resistencia (triatlón, ciclismo, natación, correr)
  const backgroundImages = [
    'https://images.unsplash.com/photo-1530549387789-4c1017266635?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80', // Ciclismo
    'https://www.bplay.bet.ar/wp-content/uploads/2023/08/mujeres-ciclistas-profesionales.jpg', // Natación
    'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'  // Running
  ];

  // Cambio automático de imágenes de fondo
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Detectar cuando estamos en el cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="relative h-screen bg-black text-white overflow-hidden">
      {/* Fondo con slideshow de imágenes */}
      <div className="absolute inset-0">
        {backgroundImages.map((img, index) => (
          <motion.div
            key={index}
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${img})`,
              backgroundPosition: index === 1 ? 'top center' : 'center center',
              opacity: currentImage === index ? 1 : 0
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: currentImage === index ? 1 : 0 }}
            transition={{ duration: 1.5 }}
          />
        ))}
        
        {/* Overlays más sutiles para que se vean mejor las imágenes */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-black/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,0,0,0.1)_0%,_rgba(0,0,0,0.4)_100%)]" />

        {/* Efecto de partículas sutiles - Solo en cliente */}
        {isClient && (
          <div className="absolute inset-0">
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  opacity: [0, 0.2, 0],
                  scale: [0, 1.2, 0],
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  repeat: Infinity,
                  delay: Math.random() * 5,
                }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4">
        <div className="mb-8">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "80px" }}
            transition={{ duration: 1, delay: 0.5 }}
            className="h-1 bg-white mx-auto mb-6"
          />

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 tracking-tighter"
          >
            <span className="text-white font-extrabold drop-shadow-lg">CAPTURANDO LOS </span>
            <motion.span
              className="text-white inline-block drop-shadow-lg"
              animate={{
                textShadow: [
                  "0 0 8px rgba(255,255,255,0.6)",
                  "0 0 20px rgba(255,255,255,0.9)",
                  "0 0 8px rgba(255,255,255,0.6)"
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >MEJORES </motion.span>
            <span className="text-white block mt-2 drop-shadow-lg">MOMENTOS</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="w-24 h-1 bg-gradient-to-r from-transparent via-white to-transparent mx-auto my-6"
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-lg md:text-xl text-white mb-10 max-w-2xl font-medium tracking-wide mx-auto drop-shadow-lg"
          >
            Fotografía especializada en triatlón, ciclismo, natación y running que inmortaliza tu esfuerzo y dedicación
          </motion.p>
        </div>

        {children}
      </div>

      {/* Efecto de flash de cámara ocasional */}
      <motion.div
        className="absolute inset-0 bg-white pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.4, 0] }}
        transition={{
          times: [0, 0.1, 1],
          duration: 0.5,
          repeat: Infinity,
          repeatDelay: 15
        }}
      />
    </div>
  );
}