'use client';

import { motion } from 'framer-motion';

export default function HowItWorks() {
  const steps = [
    {
      title: "Busca tus fotos",
      desc: "Encuentra tus fotos por número de participante o subiendo una foto de tu rostro"
    },
    {
      title: "Selecciona tus favoritas",
      desc: "Elige las fotografías que quieras comprar"
    },
    {
      title: "Descarga o recíbelas",
      desc: "Obtén tus fotos digitales o impresas en alta calidad"
    }
  ];

  return (
    <div className="relative bg-black text-white overflow-hidden">
      {/* Fondo con efecto de grano fotográfico */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMwMDAiLz48ZyBvcGFjaXR5PSIwLjAzIj48cGF0aCBkPSJNMCwwIEwxMDAsMTAwIE0xMDAsMCBMMCwxMDAiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9nPjwvc3ZnPg==')] opacity-10" />
      
      <div className="container mx-auto px-4 py-24 relative z-10">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">¿CÓMO FUNCIONA?</h2>
          <div className="w-24 h-1 bg-white mx-auto"></div>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              viewport={{ once: true, margin: "-50px" }}
              whileHover={{ y: -10 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black rounded-xl opacity-80 group-hover:opacity-100 transition-all duration-300"></div>
              <div className="relative z-10 p-8 h-full">
                <div className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center text-2xl font-bold mb-6 mx-auto transition-all duration-300 group-hover:scale-110">
                  {index + 1}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-center">{step.title}</h3>
                <p className="text-gray-300 text-center">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}