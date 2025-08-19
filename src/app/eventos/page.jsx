'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { FiImage, FiCalendar, FiCamera, FiShoppingCart, FiPercent, FiX, FiArrowRight, FiLoader, FiRefreshCw } from 'react-icons/fi';

const LINE_POSITIONS = [
  { width: 116, top: 76, left: 68, rotate: -24 },
  { width: 235, top: 13, left: 55, rotate: 12 },
  { width: 166, top: 31, left: 36, rotate: 4 },
  { width: 160, top: 92, left: 84, rotate: 20 },
  { width: 294, top: 90, left: 92, rotate: 17 },
  { width: 183, top: 30, left: 50, rotate: -0 }
];

// Animaciones predefinidas
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

export default function EventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [isClient, setIsClient] = useState(false);
  const [discounts, setDiscounts] = useState([]);
  const [discountApplied, setDiscountApplied] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const router = useRouter();

  const supabase = createClientComponentClient();

  useEffect(() => {
    loadEvents();
    const savedCart = localStorage.getItem('photoCart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
      setShowCart(true);
    }

    setIsClient(true);
  }, [supabase]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar eventos y descuentos en paralelo
      const [
        { data: eventosData, error: eventosError },
        { data: descuentosData }
      ] = await Promise.all([
        supabase
          .from('eventos')
          .select(`
            id,
            nombre,
            fecha,
            descripcion,
            portada_url,
            marca_agua_url,
            marca_agua_opacidad,
            marca_agua_posicion,
            fotos: fotos(
              id,
              url,
              precio,
              nombre,
              ruta_original,
              ruta_procesada
            )
          `)
          .order('fecha', { ascending: false })
          .lte('fecha', new Date().toISOString()),
        
        supabase
          .from('descuentos')
          .select('*')
          .order('cantidad_minima', { ascending: true })
      ]);

      if (eventosError) throw eventosError;

      const processedEvents = eventosData.map(evento => {
        const formattedDate = new Date(evento.fecha).toLocaleDateString('es-ES', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        });

        const primeraFotoUrl = evento.portada_url ||
          (evento.fotos?.find(f => f.ruta_procesada)?.url ||
            evento.fotos?.[0]?.url || null);

        return {
          ...evento,
          formattedDate,
          primeraFotoUrl,
          totalFotos: evento.fotos?.length || 0,
          hasWatermark: !!evento.marca_agua_url
        };
      });

      setEvents(processedEvents);
      setDiscounts(descuentosData || []);
    } catch (err) {
      console.error('Error al cargar eventos:', err);
      setError('No se pudieron cargar los eventos. Por favor intenta más tarde.');
    } finally {
      setLoading(false);
    }
  };

  // Persistencia del carrito
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('photoCart', JSON.stringify(cart));
      setShowCart(true);
    } else {
      localStorage.removeItem('photoCart');
      setShowCart(false);
    }
  }, [cart]);

  // Aplicar descuentos cuando cambia el carrito
  useEffect(() => {
    if (cart.length > 0 && discounts.length > 0) {
      // Ordenar descuentos de mayor a menor cantidad mínima
      const sortedDiscounts = [...discounts].sort((a, b) => b.cantidad_minima - a.cantidad_minima);
      
      // Encontrar el descuento aplicable
      const applicableDiscount = sortedDiscounts.find(d => cart.length >= d.cantidad_minima);
      
      setDiscountApplied(applicableDiscount || null);
    } else {
      setDiscountApplied(null);
    }
  }, [cart, discounts]);

  const openEventPhotos = (eventId) => {
    router.push(`/eventos/${eventId}/Fotos`);
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + (item.price || 0), 0);
  };

  const calculateDiscount = () => {
    if (!discountApplied) return 0;
    return calculateSubtotal() * (discountApplied.porcentaje / 100);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    return subtotal - discount;
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    const queryParams = new URLSearchParams();
    queryParams.append('items', JSON.stringify(cart));
    queryParams.append('total', calculateTotal().toFixed(2));
    queryParams.append('discount', calculateDiscount().toFixed(2));
    queryParams.append('subtotal', calculateSubtotal().toFixed(2));
    
    if (discountApplied) {
      queryParams.append('discount_id', discountApplied.id);
      queryParams.append('discount_name', `Descuento por ${discountApplied.cantidad_minima}+ fotos (${discountApplied.porcentaje}%)`);
    }

    router.push(`/checkout?${queryParams.toString()}`);
  };

  const removeFromCart = (itemId) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-6"
        >
          <motion.div
            animate={{ rotate: 360, scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-16 h-16 bg-gradient-to-r from-black to-gray-800 rounded-full flex items-center justify-center"
          >
            <FiCamera className="text-white text-2xl" />
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-600 text-lg font-medium"
          >
            Cargando eventos...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md p-8 bg-white rounded-2xl shadow-lg border border-gray-100"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiX className="text-red-500 text-2xl" />
          </div>
          <p className="text-xl text-red-500 mb-4 font-medium">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadEvents}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-300 flex items-center justify-center gap-2 mx-auto"
          >
            <FiRefreshCw size={16} />
            Reintentar
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white text-black py-16 md:py-24 relative overflow-hidden min-h-screen">
      {isClient && (
        <div className="absolute inset-0 overflow-hidden z-0">
          {LINE_POSITIONS.map((pos, i) => (
            <motion.div
              key={i}
              className="absolute h-[1px] bg-gradient-to-r from-transparent via-gray-300 to-transparent"
              style={{
                width: `${pos.width}px`,
                top: `${pos.top}%`,
                left: `${pos.left}%`,
                rotate: `${pos.rotate}deg`
              }}
              animate={{
                x: [0, i % 2 === 0 ? -30 : 30, 0],
                opacity: [0.2, 0.6, 0.2],
              }}
              transition={{
                duration: 6 + (i * 0.8),
                repeat: Infinity,
                repeatType: "reverse",
                delay: i * 0.5
              }}
            />
          ))}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-6 text-black tracking-tight"
          >
            EVENTOS <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-600 to-gray-400">DESTACADOS</span>
          </motion.h2>
          
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: 100 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="h-1 bg-gradient-to-r from-transparent via-black to-transparent mx-auto"
          ></motion.div>
          
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
            className="text-gray-600 mt-6 max-w-2xl mx-auto text-lg"
          >
            Explora mis coberturas de eventos deportivos y descubre momentos únicos capturados
          </motion.p>
        </motion.div>

        <AnimatePresence>
          {showCart && cart.length > 0 && (
            <motion.div
              initial={{ y: 100, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 100, opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="fixed bottom-6 right-6 bg-white p-5 rounded-2xl shadow-2xl border border-gray-200 z-50 min-w-[300px] backdrop-blur-sm bg-white/95"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-gray-800 text-lg">Carrito ({cart.length})</h3>
                <button 
                  onClick={() => setShowCart(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FiX size={18} />
                </button>
              </div>
              
              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal:</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
                
                {discountApplied && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex justify-between text-sm text-green-600"
                  >
                    <span className="flex items-center gap-1">
                      <FiPercent size={12} />
                      Descuento ({discountApplied.porcentaje}%):
                    </span>
                    <span>-${calculateDiscount().toFixed(2)}</span>
                  </motion.div>
                )}
                
                <div className="border-t border-gray-200 my-2"></div>
                
                <div className="flex justify-between font-bold text-black text-base">
                  <span>Total:</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
              
              {discounts.length > 0 && !discountApplied && (
                <div className="text-xs text-gray-500 mt-1 p-2 bg-gray-50 rounded-lg">
                  {discounts.map(d => (
                    <p key={d.id} className="mb-1 last:mb-0">
                      {d.cantidad_minima}+ fotos: {d.porcentaje}% de descuento
                    </p>
                  ))}
                </div>
              )}
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCheckout}
                className="w-full bg-gradient-to-r from-black to-gray-800 text-white py-3 rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 mt-4 font-medium"
              >
                <FiShoppingCart />
                Ir a pagar
                <FiArrowRight size={16} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {events.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiImage className="text-gray-400 text-3xl" />
            </div>
            <p className="text-lg text-gray-600 mb-2">No hay eventos disponibles</p>
            <p className="text-gray-500">Vuelve pronto para descubrir nuevas coberturas</p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                variants={itemVariants}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="group cursor-pointer"
                onClick={() => openEventPhotos(event.id)}
              >
                <div className="relative overflow-hidden rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col bg-white">
                  <div className="h-72 bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center relative overflow-hidden flex-grow">
                    {event.primeraFotoUrl ? (
                      <motion.img
                        src={`${event.primeraFotoUrl}?width=500&quality=80`}
                        alt={`Miniatura de ${event.nombre}`}
                        className="absolute inset-0 w-full h-full object-cover"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.4 }}
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMxMTExMTEiLz48ZyBvcGFjaXR5PSIwLjAzIj48cGF0aCBkPSJNMCwwIEwxMDAsMTAwIE0xMDAsMCBMMCwxMDAiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9nPjwvc3ZnPg==';
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
                        <FiImage className="text-white text-4xl opacity-30" />
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10"></div>

                    <div className="relative z-20 text-center p-6 w-full mt-auto">
                      <motion.h3 
                        className="text-xl md:text-2xl font-bold text-white mb-2 line-clamp-2"
                        whileHover={{ color: '#e5e5e5' }}
                        transition={{ duration: 0.2 }}
                      >
                        {event.nombre}
                      </motion.h3>
                      <p className="text-gray-300 text-sm md:text-base">{event.formattedDate}</p>
                      {event.descripcion && (
                        <p className="text-gray-300 text-sm mt-3 line-clamp-3">
                          {event.descripcion}
                        </p>
                      )}
                    </div>

                    <div className="absolute top-4 right-4 z-20 bg-black/80 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1 backdrop-blur-sm">
                      <FiCamera size={12} />
                      <span>{event.totalFotos} {event.totalFotos === 1 ? 'foto' : 'fotos'}</span>
                    </div>

                    {event.hasWatermark && (
                      <div className="absolute top-4 left-4 z-20 bg-blue-600/90 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1 backdrop-blur-sm">
                        <span>Marca de agua</span>
                      </div>
                    )}
                  </div>

                  <div className="p-5 bg-white border-t border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-500 text-sm flex items-center gap-1.5">
                        <FiImage className="text-gray-400" />
                        <span>{event.totalFotos.toLocaleString()} {event.totalFotos === 1 ? 'foto' : 'fotos'}</span>
                      </span>
                      <span className="text-gray-700 font-medium text-sm flex items-center gap-1">
                        <FiCalendar size={14} />
                        <span>{event.formattedDate}</span>
                      </span>
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-all duration-300 group-hover:shadow-md flex items-center justify-center gap-2 font-medium"
                    >
                      <FiImage size={16} />
                      Ver fotos
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Botón flotante para mostrar carrito */}
      <AnimatePresence>
        {cart.length > 0 && !showCart && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowCart(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-black text-white rounded-full flex items-center justify-center shadow-2xl z-40"
          >
            <FiShoppingCart size={20} />
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
            >
              {cart.length}
            </motion.span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}