'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { FiImage, FiCalendar, FiCamera, FiShoppingCart, FiPercent } from 'react-icons/fi';

const LINE_POSITIONS = [
  { width: 116, top: 76, left: 68, rotate: -24 },
  { width: 235, top: 13, left: 55, rotate: 12 },
  { width: 166, top: 31, left: 36, rotate: 4 },
  { width: 160, top: 92, left: 84, rotate: 20 },
  { width: 294, top: 90, left: 92, rotate: 17 },
  { width: 183, top: 30, left: 50, rotate: -0 }
];

export default function EventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [isClient, setIsClient] = useState(false);
  const [discounts, setDiscounts] = useState([]);
  const [discountApplied, setDiscountApplied] = useState(null);
  const router = useRouter();

  const supabase = createClientComponentClient();

  useEffect(() => {
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

    const savedCart = localStorage.getItem('photoCart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    setIsClient(true);
    loadEvents();
  }, [supabase]);

  // Persistencia del carrito
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('photoCart', JSON.stringify(cart));
    } else {
      localStorage.removeItem('photoCart');
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

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-black border-t-transparent rounded-full"
          />
          <p className="text-gray-600">Cargando eventos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-xl text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-300"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white text-black py-16 md:py-24 relative overflow-hidden">
      {isClient && (
        <div className="absolute inset-0 overflow-hidden z-0">
          {LINE_POSITIONS.map((pos, i) => (
            <motion.div
              key={i}
              className="absolute h-[1px] bg-gray-200"
              style={{
                width: `${pos.width}px`,
                top: `${pos.top}%`,
                left: `${pos.left}%`,
                rotate: `${pos.rotate}deg`
              }}
              animate={{
                x: [0, i % 2 === 0 ? -50 : 50],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 4 + (i * 0.5),
                repeat: Infinity,
                repeatType: "reverse",
                delay: i * 0.3
              }}
            />
          ))}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-black tracking-tight">
            EVENTOS <span className="text-gray-600">DESTACADOS</span>
          </h2>
          <div className="flex justify-center">
            <div className="w-24 h-1 bg-black"></div>
          </div>
          <p className="text-gray-600 mt-6 max-w-2xl mx-auto text-lg">
            Explora mis coberturas de eventos deportivos y descubre momentos únicos capturados
          </p>
        </motion.div>

        {cart.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="fixed bottom-6 right-6 bg-white p-4 rounded-xl shadow-2xl border border-gray-200 z-50 min-w-[280px]"
          >
            <div className="mb-3">
              <h3 className="font-bold text-gray-800 mb-2">Carrito ({cart.length})</h3>
              
              <div className="space-y-1 mb-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal:</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
                
                {discountApplied && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span className="flex items-center gap-1">
                      <FiPercent size={12} />
                      Descuento ({discountApplied.porcentaje}%):
                    </span>
                    <span>-${calculateDiscount().toFixed(2)}</span>
                  </div>
                )}
                
                <div className="border-t border-gray-200 my-1"></div>
                
                <div className="flex justify-between font-bold text-black">
                  <span>Total:</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
              
              {discounts.length > 0 && !discountApplied && (
                <div className="text-xs text-gray-500 mt-1">
                  {discounts.map(d => (
                    <p key={d.id}>
                      {d.cantidad_minima}+ fotos: {d.porcentaje}% de descuento
                    </p>
                  ))}
                </div>
              )}
            </div>
            
            <button
              onClick={handleCheckout}
              className="w-full bg-black text-white py-2.5 rounded-lg hover:bg-gray-800 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <FiShoppingCart />
              Ir a pagar
            </button>
          </motion.div>
        )}

        {events.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <p className="text-lg text-gray-600">No hay eventos disponibles actualmente</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-50px" }}
                whileHover={{ y: -5 }}
                className="group cursor-pointer"
                onClick={() => openEventPhotos(event.id)}
              >
                <div className="relative overflow-hidden rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col bg-white">
                  <div className="h-64 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative overflow-hidden flex-grow">
                    {event.primeraFotoUrl ? (
                      <img
                        src={`${event.primeraFotoUrl}?width=500&quality=80`}
                        alt={`Miniatura de ${event.nombre}`}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMxMTExMTEiLz48ZyBvcGFjaXR5PSIwLjAzIj48cGF0aCBkPSJNMCwwIEwxMDAsMTAwIE0xMDAsMCBMMCwxMDAiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9nPjwvc3ZnPg==';
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                        <FiImage className="text-white text-4xl opacity-30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10"></div>

                    <div className="relative z-20 text-center p-6 w-full mt-auto">
                      <h3 className="text-xl md:text-2xl font-bold text-white mb-2 line-clamp-2">{event.nombre}</h3>
                      <p className="text-gray-300 text-sm md:text-base">{event.formattedDate}</p>
                      {event.descripcion && (
                        <p className="text-gray-300 text-sm mt-3 line-clamp-3">
                          {event.descripcion}
                        </p>
                      )}
                    </div>

                    <div className="absolute top-4 right-4 z-20 bg-black/70 text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                      <FiCamera size={12} />
                      <span>{event.totalFotos} {event.totalFotos === 1 ? 'foto' : 'fotos'}</span>
                    </div>

                    {event.hasWatermark && (
                      <div className="absolute top-4 left-4 z-20 bg-blue-600/80 text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
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
                    <button className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-300 group-hover:shadow-md group-hover:-translate-y-0.5 flex items-center justify-center gap-2">
                      <FiImage size={16} />
                      Ver fotos
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}