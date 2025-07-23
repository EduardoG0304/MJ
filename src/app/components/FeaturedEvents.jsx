'use client';

import { motion } from 'framer-motion';

export default function FeaturedEvents() {
  const events = [
    { id: 1, title: "Maratón Internacional", date: "15/07/2023", photos: 1243 },
    { id: 2, title: "Torneo de Fútbol", date: "22/08/2023", photos: 876 },
    { id: 3, title: "Campeonato de Natación", date: "10/09/2023", photos: 532 }
  ];

  return (
    <div className="container mx-auto px-4 py-24">
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, margin: "-100px" }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-black">EVENTOS DESTACADOS</h2>
        <div className="w-24 h-1 bg-black mx-auto"></div>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {events.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.15 }}
            viewport={{ once: true, margin: "-50px" }}
            whileHover={{ y: -10 }}
            className="group"
          >
            <div className="relative overflow-hidden rounded-xl border border-gray-200 shadow-lg">
              <div className="h-64 bg-gray-900 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                <div className="relative z-20 text-center p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{event.title}</h3>
                  <p className="text-gray-300">{event.date}</p>
                </div>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMxMTExMTEiLz48ZyBvcGFjaXR5PSIwLjAzIj48cGF0aCBkPSJNMCwwIEwxMDAsMTAwIE0xMDAsMCBMMCwxMDAiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9nPjwvc3ZnPg==')] opacity-20"></div>
              </div>
              <div className="p-6 bg-white">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-500">{event.photos.toLocaleString()} fotos</span>
                  <span className="text-black font-medium">{event.date}</span>
                </div>
                <button className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1">
                  Ver fotos
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}