'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { FiImage, FiX, FiShoppingCart, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Modal from 'react-modal';

// Configuración del modal
if (typeof window !== 'undefined') {
  Modal.setAppElement('#root');
}

export default function FeaturedEvents() {
  const [events, setEvents] = useState([]);
  const [eventPhotos, setEventPhotos] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [cart, setCart] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const router = useRouter();
  
  const supabase = createClientComponentClient();

  // Cargar eventos con sus fotos
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data: eventosData, error: eventosError } = await supabase
          .from('eventos')
          .select(`
            id,
            nombre,
            fecha,
            descripcion,
            fotos: fotos(
              id,
              url,
              precio,
              nombre
            )
          `)
          .order('fecha', { ascending: false })
          .lte('fecha', new Date().toISOString());

        if (eventosError) throw eventosError;

        const processedEvents = eventosData.map(evento => {
          const formattedDate = new Date(evento.fecha).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });

          const primeraFotoUrl = evento.fotos?.[0]?.url || null;

          return {
            ...evento,
            formattedDate,
            primeraFotoUrl,
            totalFotos: evento.fotos?.length || 0
          };
        });

        setEvents(processedEvents);
        
        const fotosPorEvento = {};
        eventosData.forEach(evento => {
          fotosPorEvento[evento.id] = evento.fotos || [];
        });
        setEventPhotos(fotosPorEvento);

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

    loadEvents();
  }, [supabase]);

  // Persistir carrito en localStorage
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('photoCart', JSON.stringify(cart));
    } else {
      localStorage.removeItem('photoCart');
    }
  }, [cart]);

  const openEventModal = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
    setSelectedPhoto(null);
    setCurrentPhotoIndex(0);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPhoto(null);
    setCurrentPhotoIndex(0);
  };

  const openPhotoViewer = (photo, index) => {
    setSelectedPhoto(photo);
    setCurrentPhotoIndex(index);
  };

  const navigatePhotos = (direction) => {
    if (!selectedEvent) return;
    
    const photos = eventPhotos[selectedEvent.id] || [];
    let newIndex;
    
    if (direction === 'prev') {
      newIndex = currentPhotoIndex === 0 ? photos.length - 1 : currentPhotoIndex - 1;
    } else {
      newIndex = currentPhotoIndex === photos.length - 1 ? 0 : currentPhotoIndex + 1;
    }
    
    setSelectedPhoto(photos[newIndex]);
    setCurrentPhotoIndex(newIndex);
  };

  const toggleCartItem = (photo) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => item.id === photo.id);
      
      if (existingItemIndex >= 0) {
        return prevCart.filter(item => item.id !== photo.id);
      } else {
        return [...prevCart, {
          id: photo.id,
          url: photo.url,
          price: photo.precio || 0,
          eventName: selectedEvent?.nombre || 'Evento desconocido',
          photoName: photo.nombre || `Foto ${currentPhotoIndex + 1}`,
          eventId: selectedEvent?.id
        }];
      }
    });
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price || 0), 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    setIsModalOpen(false);

    const queryParams = new URLSearchParams();
    queryParams.append('items', JSON.stringify(cart));
    queryParams.append('total', calculateTotal().toFixed(2));

    router.push(`/checkout?${queryParams.toString()}`);
  };

  const getShortName = (name) => {
    if (!name) return 'Foto';
    if (name.length > 20) {
      const extension = name.split('.').pop();
      return `${name.substring(0, 15)}...${extension}`;
    }
    return name;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-24 min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-24 min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

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
      
      {cart.length > 0 && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-xl border border-gray-200 z-50"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold">Carrito ({cart.length})</h3>
            <span className="font-bold">${calculateTotal().toFixed(2)}</span>
          </div>
          <button 
            onClick={handleCheckout}
            className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Ir a pagar
          </button>
        </motion.div>
      )}
      
      {events.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">No hay eventos disponibles actualmente</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              viewport={{ once: true, margin: "-50px" }}
              whileHover={{ y: -10 }}
              className="group cursor-pointer"
            >
              <div 
                className="relative overflow-hidden rounded-xl border border-gray-200 shadow-lg h-full flex flex-col"
                onClick={() => openEventModal(event)}
              >
                <div className="h-64 bg-gray-900 flex items-center justify-center relative overflow-hidden flex-grow">
                  {event.primeraFotoUrl ? (
                    <img
                      src={`${event.primeraFotoUrl}?width=500&quality=80`}
                      alt={`Miniatura de ${event.nombre}`}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMxMTExMTEiLz48ZyBvcGFjaXR5PSIwLjAzIj48cGF0aCBkPSJNMCwwIEwxMDAsMTAwIE0xMDAsMCBMMCwxMDAiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9nPjwvc3ZnPg==';
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                      <FiImage className="text-white text-4xl opacity-50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                  <div className="relative z-20 text-center p-6">
                    <h3 className="text-2xl font-bold text-white mb-2">{event.nombre}</h3>
                    <p className="text-gray-300">{event.formattedDate}</p>
                    {event.descripcion && (
                      <p className="text-gray-300 text-sm mt-2 line-clamp-2">
                        {event.descripcion}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="p-6 bg-white">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-500 flex items-center gap-1">
                      <FiImage className="inline" /> {event.totalFotos.toLocaleString()} fotos
                    </span>
                    <span className="text-black font-medium">{event.formattedDate}</span>
                  </div>
                  <button 
                    className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1"
                  >
                    Ver fotos
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Fotos del evento"
        className="modal-content bg-white rounded-lg p-6 max-w-6xl w-full mx-4 my-12 outline-none max-h-[90vh] overflow-auto"
        overlayClassName="modal-overlay fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      >
        {selectedEvent && (
          <div className="relative">
            <button 
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-700 hover:text-black p-1"
            >
              <FiX size={24} />
            </button>
            
            <div className="mb-6">
              <h3 className="text-2xl font-bold">{selectedEvent.nombre}</h3>
              <p className="text-gray-600">{selectedEvent.formattedDate}</p>
              {selectedEvent.descripcion && (
                <p className="text-gray-600 mt-2">{selectedEvent.descripcion}</p>
              )}
            </div>
            
            {!selectedPhoto ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {eventPhotos[selectedEvent.id]?.map((photo, index) => (
                  <div key={photo.id} className="relative group">
                    <img
                      src={`${photo.url}?width=300&quality=80`}
                      alt={`Foto ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => openPhotoViewer(photo, index)}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                      <p className="text-white font-bold">${photo.precio?.toFixed(2) || '0.00'}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCartItem(photo);
                      }}
                      className={`absolute top-2 right-2 p-2 rounded-full ${
                        cart.some(item => item.id === photo.id) 
                          ? 'bg-green-500 text-white' 
                          : 'bg-white text-black hover:bg-gray-200'
                      }`}
                      title={cart.some(item => item.id === photo.id) ? 'Quitar del carrito' : 'Agregar al carrito'}
                    >
                      <FiShoppingCart />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="mb-4 flex items-center text-gray-700 hover:text-black"
                >
                  <FiChevronLeft className="mr-1" /> Volver a la galería
                </button>
                
                <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={`${selectedPhoto.url}?width=1000&quality=90`}
                    alt="Foto seleccionada"
                    className="w-full max-h-[70vh] object-contain mx-auto"
                  />
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigatePhotos('prev');
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-80"
                  >
                    <FiChevronLeft size={24} />
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigatePhotos('next');
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-80"
                  >
                    <FiChevronRight size={24} />
                  </button>
                  
                  <div className="absolute bottom-4 left-0 right-0 text-center">
                    <div className="inline-flex bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg">
                      <span>Foto {currentPhotoIndex + 1} de {eventPhotos[selectedEvent.id]?.length}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                  <div>
                    <p className="font-bold">${selectedPhoto.precio?.toFixed(2) || '0.00'}</p>
                    <p className="text-sm text-gray-600">{getShortName(selectedPhoto.nombre)}</p>
                  </div>
                  <button
                    onClick={() => toggleCartItem(selectedPhoto)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                      cart.some(item => item.id === selectedPhoto.id) 
                        ? 'bg-green-500 text-white' 
                        : 'bg-black text-white hover:bg-gray-800'
                    }`}
                  >
                    <FiShoppingCart />
                    {cart.some(item => item.id === selectedPhoto.id) ? 'En carrito' : 'Agregar al carrito'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}