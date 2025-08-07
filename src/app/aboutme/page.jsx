'use client'

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useAnimation, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const PhotographerPresentation = () => {
  const [activeImage, setActiveImage] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });
  const controls = useAnimation();
  
  // Reemplaza con imágenes reales de triatlón
  const imageGallery = [
    '/foto1.jpg',
    '/foto2.jpg',
    '/foto3.jpg',
  ];

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
      const interval = setInterval(() => {
        setActiveImage((prev) => (prev + 1) % imageGallery.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isInView, controls]);

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const title = "HOLA, SOY MJ.".split("");
  const subtitle = "FOTÓGRAFA DEPORTIVA".split("");

  return (
    <div className="min-h-screen bg-white text-black relative overflow-hidden">
      {/* Elementos de fondo deportivos */}
      <motion.div 
        className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.05 }}
        transition={{ delay: 1, duration: 2 }}
      >
        <div className="absolute top-20 left-10 w-64 h-64 border border-gray-300 rounded-full"></div>
        <div className="absolute bottom-10 right-20 w-80 h-80 border border-gray-300 rotate-45"></div>
        <div className="absolute top-1/3 right-1/4 w-32 h-32 border border-gray-300 rotate-12"></div>
        <div className="absolute bottom-1/4 left-1/3 w-40 h-40 border border-gray-300 rounded-full"></div>
      </motion.div>

      {/* Líneas de movimiento */}
      <div className="absolute inset-0 overflow-hidden z-0">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-[1px] bg-gray-200"
            style={{
              width: `${Math.random() * 200 + 100}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              rotate: `${Math.random() * 60 - 30}deg`
            }}
            animate={{
              x: [0, (Math.random() - 0.5) * 200],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              repeatType: "reverse",
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto py-28 px-4 sm:px-8 md:px-12 lg:px-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
        {/* Contenido de texto */}
        <motion.div
          ref={ref}
          initial="hidden"
          animate={controls}
          variants={textVariants}
          className="space-y-10"
        >
          <div className="overflow-hidden">
            <motion.h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-2">
              {title.map((letter, i) => (
                <motion.span
                  key={i}
                  className="inline-block"
                  variants={letterVariants}
                >
                  {letter === " " ? "\u00A0" : letter}
                </motion.span>
              ))}
            </motion.h1>
            <motion.h2 className="text-3xl md:text-4xl font-light tracking-tight text-gray-600 mb-8">
              {subtitle.map((letter, i) => (
                <motion.span
                  key={i}
                  className="inline-block"
                  variants={letterVariants}
                >
                  {letter === " " ? "\u00A0" : letter}
                </motion.span>
              ))}
            </motion.h2>
          </div>

          <motion.div 
            className="flex space-x-4 items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <div className="w-16 h-1 bg-black"></div>
            <div className="text-sm uppercase tracking-widest text-gray-500">Especialista en Triatlón</div>
          </motion.div>

          <motion.div
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
          >
            <p className="text-lg leading-relaxed text-gray-700">
              Soy fotógrafa deportiva especializada en triatlón. Me apasiona contar historias a través de mi cámara, capturando la <span className="font-semibold">intensidad</span>, <span className="font-semibold">emoción</span> y <span className="font-semibold">belleza</span> de cada momento en competencia.
            </p>
            <p className="text-lg leading-relaxed text-gray-700">
              Desde hace <span className="font-semibold">6 años</span> asisto a competencias nacionales e internacionales, para capturar las emociones que se viven en el deporte. Actualmente trabajo independiente ofreciendo cobertura de eventos deportivos.
            </p>
            <p className="text-lg leading-relaxed text-gray-700 italic">
              Gracias por visitar mi sitio. Si compartes esta pasión por el deporte y la fotografía, será un gusto trabajar contigo.
            </p>
          </motion.div>

          <motion.div
            className="flex flex-wrap gap-4 pt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
          >
            <button className="px-8 py-3 bg-black text-white font-medium hover:bg-gray-800 transition-all duration-300 flex items-center group">
              VER PORTAFOLIO
              <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
            </button>
            <button className="px-8 py-3 border-2 border-black text-black font-medium hover:bg-black hover:text-white transition-all duration-300 flex items-center">
              CONTACTAR
              <span className="ml-2 text-sm">📩</span>
            </button>
          </motion.div>

          {/* Estadísticas deportivas */}
          <motion.div 
            className="grid grid-cols-3 gap-4 pt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
          >
            {[
              { number: "6+", label: "Años de experiencia" },
              { number: "50+", label: "Eventos cubiertos" }
            ].map((stat, index) => (
              <div key={index} className="text-center p-4 border border-gray-200 hover:border-black transition-colors duration-300">
                <div className="text-3xl font-bold">{stat.number}</div>
                <div className="text-sm text-gray-600 mt-2 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Galería de imágenes deportivas */}
        <div className="relative h-[600px] w-full">
          <AnimatePresence mode="wait">
            {imageGallery.map((img, idx) => (
              activeImage === idx && (
                <motion.div
                  key={idx}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1,
                    transition: { duration: 0.8 }
                  }}
                  exit={{ 
                    opacity: 0, 
                    scale: 1.05,
                    transition: { duration: 0.6 }
                  }}
                >
                  <div className="absolute inset-0 bg-gray-100 overflow-hidden shadow-xl">
                    <div className="relative h-full w-full">
                      <Image
                        src={img}
                        alt={`Fotografía ${idx + 1}`}
                        fill
                        className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                        priority
                      />
                    </div>
                  </div>
                  <div className="absolute -bottom-6 -right-6 bg-white p-3 w-24 h-24 border-2 border-black rotate-12 flex items-center justify-center shadow-md">
                    <span className="text-xs font-bold rotate-[-12deg]">MJ-0{idx + 1}</span>
                  </div>
                </motion.div>
              )
            ))}
          </AnimatePresence>

          {/* Navegación */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
            {imageGallery.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${activeImage === idx ? 'bg-black w-6' : 'bg-gray-300'}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Firma y redes */}
      <motion.div
        className="fixed bottom-8 right-8 flex items-center space-x-6 bg-white bg-opacity-80 px-4 py-2 rounded-full shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2 }}
      >
        <div className="text-xl font-bold italic tracking-widest">
          @mjfotografia__
        </div>
        <div className="flex space-x-3">
          {['ig'].map((social, idx) => (
            <a 
              key={idx} 
              href="#" 
              className="w-8 h-8 border border-black rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-colors duration-300 text-xs font-bold"
            >
              {social}
            </a>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default PhotographerPresentation;