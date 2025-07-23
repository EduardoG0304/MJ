'use client';

import { motion } from 'framer-motion';

export default function Testimonials() {
  const testimonials = [
    {
      id: 1,
      quote: "Las mejores fotos de mi carrera deportiva. Calidad excepcional!",
      author: "Carlos Martínez",
      role: "Atleta profesional"
    },
    {
      id: 2,
      quote: "Encontré todas mis fotos fácilmente con el buscador por número.",
      author: "Ana Rodríguez",
      role: "Participante maratón"
    },
    {
      id: 3,
      quote: "El servicio de búsqueda por rostro funcionó perfectamente.",
      author: "David López",
      role: "Entrenador"
    }
  ];

  return (
    <section className="relative py-24 bg-black text-white overflow-hidden">
      {/* Fondo con efecto de grano fotográfico */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMwMDAiLz48ZyBvcGFjaXR5PSIwLjAzIj48cGF0aCBkPSJNMCwwIEwxMDAsMTAwIE0xMDAsMCBMMCwxMDAiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9nPjwvc3ZnPg==')] opacity-10" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">TESTIMONIOS</h2>
          <div className="w-24 h-1 bg-white mx-auto"></div>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              viewport={{ once: true, margin: "-50px" }}
              whileHover={{ scale: 1.03 }}
              className="bg-gray-900 p-8 rounded-xl border border-gray-800 shadow-lg"
            >
              <div className="mb-6">
                <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.571-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z" />
                </svg>
              </div>
              <blockquote className="text-gray-300 text-lg italic mb-6">
                "{testimonial.quote}"
              </blockquote>
              <div className="border-t border-gray-800 pt-4">
                <p className="font-bold text-white">{testimonial.author}</p>
                <p className="text-gray-400">{testimonial.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}