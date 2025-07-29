'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { FiImage, FiX, FiShoppingCart, FiChevronLeft, FiChevronRight, FiMaximize, FiMinimize } from 'react-icons/fi';
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
  const [isFullscreenView, setIsFullscreenView] = useState(false);
  const [showCartPreview, setShowCartPreview] = useState(false);
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
    setIsFullscreenView(false);
    setShowCartPreview(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPhoto(null);
    setCurrentPhotoIndex(0);
    setIsFullscreenView(false);
    setShowCartPreview(false);
  };

  const openPhotoViewer = (photo, index) => {
    setSelectedPhoto(photo);
    setCurrentPhotoIndex(index);
    setIsFullscreenView(false);
  };

  const openFullscreenView = () => {
    setIsFullscreenView(true);
  };

  const closeFullscreenView = () => {
    setIsFullscreenView(false);
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
    setShowCartPreview(false);

    const queryParams = new URLSearchParams();
    queryParams.append('items', JSON.stringify(cart));
    queryParams.append('total', calculateTotal().toFixed(2));

    router.push(`/checkout?${queryParams.toString()}`);
  };

  const toggleCartPreview = () => {
    setShowCartPreview(!showCartPreview);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-24 min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
          <p className="text-gray-600">Cargando eventos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-24 min-h-[60vh] flex items-center justify-center">
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
    <div className="container mx-auto px-4 py-16 md:py-24 relative">
      {/* Sección de título */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, margin: "-100px" }}
        className="text-center mb-12 md:mb-16"
      >
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-black font-serif tracking-tight">
          Eventos Destacados
        </h2>
        <div className="w-24 h-1 bg-gradient-to-r from-black to-gray-300 mx-auto"></div>
        <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
          Explora nuestros eventos pasados y descubre las mejores fotografías
        </p>
      </motion.div>
      
      {/* Botón del carrito en la esquina superior derecha */}
      <div className="fixed top-4 right-4 z-40">
        <button
          onClick={toggleCartPreview}
          className="relative bg-white p-3 rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          aria-label="Ver carrito"
        >
          <FiShoppingCart className="text-gray-800" size={20} />
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {cart.length}
            </span>
          )}
        </button>
      </div>
      
      {/* Vista previa del carrito */}
      <AnimatePresence>
        {showCartPreview && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="fixed top-20 right-4 z-40 bg-white rounded-xl shadow-2xl border border-gray-200 w-80 max-h-[70vh] overflow-hidden flex flex-col"
          >
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg text-gray-800">Tu Carrito</h3>
                <button 
                  onClick={toggleCartPreview}
                  className="text-gray-500 hover:text-black"
                >
                  <FiX size={20} />
                </button>
              </div>
            </div>
            
            <div className="overflow-y-auto flex-grow p-4">
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Tu carrito está vacío</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {cart.map((item, index) => (
                    <li key={index} className="flex items-start gap-3 pb-3 border-b border-gray-100">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                        <img 
                          src={`${item.url}?width=100&height=100`} 
                          alt={item.photoName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm line-clamp-1">{item.eventName}</p>
                        <p className="text-xs text-gray-500 line-clamp-1">{item.photoName}</p>
                        <p className="text-sm font-bold mt-1">${item.price.toFixed(2)}</p>
                      </div>
                      <button
                        onClick={() => {
                          setCart(prev => prev.filter((_, i) => i !== index));
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <FiX size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            {cart.length > 0 && (
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold">Total:</span>
                  <span className="font-bold text-lg">${calculateTotal().toFixed(2)}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full bg-black text-white py-2.5 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                  <FiShoppingCart size={16} />
                  Ir a pagar
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Lista de eventos */}
      {events.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <p className="text-lg text-gray-600">No hay eventos disponibles actualmente</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true, margin: "-50px" }}
              whileHover={{ y: -5 }}
              className="group cursor-pointer"
            >
              <div 
                className="relative overflow-hidden rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 h-full flex flex-col bg-white"
                onClick={() => openEventModal(event)}
              >
                {/* Imagen del evento */}
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
                  
                  {/* Información del evento */}
                  <div className="relative z-20 text-center p-6 w-full mt-auto">
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-2 line-clamp-2">{event.nombre}</h3>
                    <p className="text-gray-300 text-sm md:text-base">{event.formattedDate}</p>
                    {event.descripcion && (
                      <p className="text-gray-300 text-sm mt-3 line-clamp-3">
                        {event.descripcion}
                      </p>
                    )}
                  </div>
                  
                  {/* Badge de cantidad de fotos */}
                  <div className="absolute top-4 right-4 z-20 bg-black/70 text-white text-xs px-2.5 py-1 rounded-full">
                    {event.totalFotos} {event.totalFotos === 1 ? 'foto' : 'fotos'}
                  </div>
                </div>
                
                {/* Pie de tarjeta */}
                <div className="p-5 bg-white border-t border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-500 text-sm flex items-center gap-1.5">
                      <FiImage className="text-gray-400" /> 
                      <span>{event.totalFotos.toLocaleString()} {event.totalFotos === 1 ? 'foto' : 'fotos'}</span>
                    </span>
                    <span className="text-gray-700 font-medium text-sm">{event.formattedDate}</span>
                  </div>
                  <button 
                    className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-300 group-hover:shadow-md group-hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    <FiImage size={16} />
                    Ver fotos
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal de fotos */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Fotos del evento"
        className="modal-content bg-white rounded-xl p-0 max-w-6xl w-full mx-4 my-8 outline-none max-h-[90vh] overflow-hidden"
        overlayClassName="modal-overlay fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        closeTimeoutMS={300}
      >
        {selectedEvent && (
          <div className="relative">
            {/* Header del modal */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedEvent.nombre}</h3>
                <p className="text-gray-600 text-sm">{selectedEvent.formattedDate}</p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleCartPreview}
                  className="relative flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <FiShoppingCart size={18} />
                  {cart.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                      {cart.length}
                    </span>
                  )}
                </button>
                <button 
                  onClick={closeModal}
                  className="text-gray-500 hover:text-black p-1 transition-colors"
                >
                  <FiX size={24} />
                </button>
              </div>
            </div>
            
            {/* Contenido del modal */}
            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 73px)' }}>
              {selectedEvent.descripcion && (
                <p className="text-gray-600 mb-6 px-2">{selectedEvent.descripcion}</p>
              )}
              
              {!selectedPhoto ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {eventPhotos[selectedEvent.id]?.map((photo, index) => (
                    <motion.div 
                      key={photo.id} 
                      className="relative group"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <img
                        src={`${photo.url}?width=300&quality=80`}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-48 sm:h-56 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity shadow-sm"
                        onClick={() => openPhotoViewer(photo, index)}
                      />
                      <div className="absolute inset-0 rounded-lg group-hover:bg-black/10 transition-colors"></div>
                      
                      {/* Precio */}
                      <div className="absolute bottom-2 left-2 bg-black/80 text-white text-sm px-2 py-1 rounded">
                        ${photo.precio?.toFixed(2) || '0.00'}
                      </div>
                      
                      {/* Botón de carrito */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCartItem(photo);
                        }}
                        className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${
                          cart.some(item => item.id === photo.id) 
                            ? 'bg-green-500 text-white shadow-md' 
                            : 'bg-white/90 text-gray-800 hover:bg-gray-100 shadow-sm'
                        }`}
                        title={cart.some(item => item.id === photo.id) ? 'Quitar del carrito' : 'Agregar al carrito'}
                      >
                        <FiShoppingCart size={16} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="relative">
                  <div className="flex justify-between items-center mb-4">
                    <button
                      onClick={() => setSelectedPhoto(null)}
                      className="flex items-center text-gray-600 hover:text-black transition-colors px-2 py-1 rounded-lg hover:bg-gray-100"
                    >
                      <FiChevronLeft className="mr-1" /> Volver a la galería
                    </button>
                    <button
                      onClick={toggleCartPreview}
                      className="relative flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <FiShoppingCart size={18} />
                      {cart.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                          {cart.length}
                        </span>
                      )}
                    </button>
                  </div>
                  
                  {/* Visor de foto */}
                  <div className="relative bg-gray-50 rounded-xl overflow-hidden shadow-inner">
                    <img
                      src={`${selectedPhoto.url}?width=1000&quality=90`}
                      alt="Foto seleccionada"
                      className={`w-full ${isFullscreenView ? 'h-[80vh]' : 'max-h-[65vh]'} object-contain mx-auto`}
                    />
                    
                    {/* Navegación */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigatePhotos('prev');
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/70 text-white p-3 rounded-full hover:bg-black transition-colors shadow-lg"
                    >
                      <FiChevronLeft size={24} />
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigatePhotos('next');
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/70 text-white p-3 rounded-full hover:bg-black transition-colors shadow-lg"
                    >
                      <FiChevronRight size={24} />
                    </button>
                    
                    {/* Contador */}
                    <div className="absolute bottom-4 left-0 right-0 text-center">
                      <div className="inline-flex bg-black/70 text-white px-4 py-2 rounded-lg text-sm">
                        <span>Foto {currentPhotoIndex + 1} de {eventPhotos[selectedEvent.id]?.length}</span>
                      </div>
                    </div>
                    
                    {/* Botón de vista ampliada */}
                    <button
                      onClick={isFullscreenView ? closeFullscreenView : openFullscreenView}
                      className="absolute top-4 right-4 bg-black/70 text-white p-3 rounded-full hover:bg-black transition-colors shadow-lg"
                      title={isFullscreenView ? 'Salir de vista ampliada' : 'Ver en pantalla completa'}
                    >
                      {isFullscreenView ? <FiMinimize size={20} /> : <FiMaximize size={20} />}
                    </button>
                  </div>
                  
                  {/* Info y acciones de la foto */}
                  <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <p className="font-bold text-lg">${selectedPhoto.precio?.toFixed(2) || '0.00'}</p>
                      <p className="text-gray-600">{selectedPhoto.nombre || `Foto ${currentPhotoIndex + 1}`}</p>
                    </div>
                    <button
                      onClick={() => toggleCartItem(selectedPhoto)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-lg transition-colors ${
                        cart.some(item => item.id === selectedPhoto.id) 
                          ? 'bg-green-500 text-white shadow-md' 
                          : 'bg-black text-white hover:bg-gray-800 shadow-sm'
                      }`}
                    >
                      <FiShoppingCart />
                      {cart.some(item => item.id === selectedPhoto.id) ? 'En carrito' : 'Agregar al carrito'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}