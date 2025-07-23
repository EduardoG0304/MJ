// HeroSearch.jsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function HeroSearch() {
  const [activeTab, setActiveTab] = useState('number');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    console.log(`Buscando: ${searchQuery} por ${activeTab}`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.6 }}
      className="w-full max-w-3xl bg-black bg-opacity-80 backdrop-blur-sm rounded-lg p-6 shadow-xl border border-gray-700"
    >
      <div className="flex border-b border-gray-700 mb-6">
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'number' ? 'text-white border-b-2 border-white' : 'text-gray-400'}`}
          onClick={() => setActiveTab('number')}
        >
          Buscar por número
        </button>
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'face' ? 'text-white border-b-2 border-white' : 'text-gray-400'}`}
          onClick={() => setActiveTab('face')}
        >
          Buscar por rostro
        </button>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
        <input
          type={activeTab === 'number' ? 'number' : 'text'}
          placeholder={activeTab === 'number' ? 'Ingresa tu número de participante' : 'Sube una foto para buscar por rostro'}
          className="flex-grow px-4 py-3 rounded bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-600"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {activeTab === 'face' && (
          <label className="px-4 py-3 rounded bg-gray-900 text-white cursor-pointer flex items-center justify-center hover:bg-gray-800 transition">
            <span>Subir foto</span>
            <input type="file" className="hidden" accept="image/*" />
          </label>
        )}
        <button 
          type="submit" 
          className="px-6 py-3 bg-white text-black font-bold rounded hover:bg-gray-200 transition"
        >
          Buscar
        </button>
      </form>
    </motion.div>
  );
}