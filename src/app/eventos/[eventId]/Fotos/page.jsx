'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FiCalendar, FiHome } from 'react-icons/fi';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { FiX, FiShoppingCart, FiChevronLeft, FiChevronRight, FiMaximize, FiMinimize, FiArrowUp } from 'react-icons/fi';

// Componente Thumbnail memoizado
const PhotoThumbnail = memo(({ photo, index, openPhotoViewer, cart, toggleCartItem, hasWatermark, getOptimizedImageUrl }) => (
  <motion.div
    className="relative group overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: index * 0.05 }}
    style={{ height: '224px' }}
  >
    <img
      src={getOptimizedImageUrl(photo.url, 300, 70)}
      alt={`Foto ${index + 1}`}
      className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
      onClick={() => openPhotoViewer(photo, index)}
      loading="lazy"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
      <h4 className="text-white font-medium text-sm truncate">{photo.nombre || `Foto ${index + 1}`}</h4>
      <p className="text-white font-bold">${photo.precio?.toFixed(2) || '0.00'}</p>
    </div>

    <button
      onClick={(e) => {
        e.stopPropagation();
        toggleCartItem(photo);
      }}
      className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-300 ${
        cart.some(item => item.id === photo.id)
          ? 'bg-green-500 text-white shadow-lg'
          : 'bg-white/90 text-gray-800 hover:bg-gray-100 shadow-sm'
      }`}
      title={cart.some(item => item.id === photo.id) ? 'Quitar del carrito' : 'Agregar al carrito'}
    >
      <FiShoppingCart size={16} />
    </button>

    {hasWatermark && (
      <div className="absolute top-3 left-3 bg-blue-600/90 text-white text-xs px-2 py-1 rounded-full shadow">
        Marca de agua
      </div>
    )}
  </motion.div>
));

// Componente LazyGrid para virtualización
const LazyPhotoGrid = memo(({ photos, openPhotoViewer, cart, toggleCartItem, hasWatermark, getOptimizedImageUrl }) => {
  const containerRef = useRef(null);
  const [visibleRange, setVisibleRange] = useState([0, 12]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || photos.length === 0) return;

    const handleScroll = () => {
      const { scrollTop, clientHeight } = container;
      const rowHeight = 224 + 24; // height + gap
      const rowsInView = Math.ceil(clientHeight / rowHeight);
      
      const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - 1);
      const endRow = startRow + rowsInView * 3; // Render 3x visible rows

      const itemsPerRow = Math.max(1, Math.floor(dimensions.width / (300 + 24))); // item width + gap
      const startIndex = Math.max(0, startRow * itemsPerRow);
      const endIndex = Math.min(photos.length, endRow * itemsPerRow);

      setVisibleRange([startIndex, endIndex]);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [photos.length, dimensions]);

  // Preload images just outside visible range
  useEffect(() => {
    const preloadStart = Math.max(0, visibleRange[0] - 4);
    const preloadEnd = Math.min(photos.length, visibleRange[1] + 4);
    
    for (let i = preloadStart; i < preloadEnd; i++) {
      if (i < visibleRange[0] || i >= visibleRange[1]) {
        const img = new Image();
        img.src = getOptimizedImageUrl(photos[i].url, 300, 70);
      }
    }
  }, [visibleRange, photos, getOptimizedImageUrl]);

  return (
    <div 
      ref={containerRef}
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 overflow-y-auto"
      style={{ height: '70vh' }}
    >
      {photos.slice(visibleRange[0], visibleRange[1]).map((photo, index) => (
        <PhotoThumbnail
          key={`${photo.id}-${visibleRange[0] + index}`}
          photo={photo}
          index={visibleRange[0] + index}
          openPhotoViewer={openPhotoViewer}
          cart={cart}
          toggleCartItem={toggleCartItem}
          hasWatermark={hasWatermark}
          getOptimizedImageUrl={getOptimizedImageUrl}
        />
      ))}
    </div>
  );
});

// Componente principal
export default function EventPhotos() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.eventId;
  const supabase = createClientComponentClient();

  const [event, setEvent] = useState(null);
  const [eventPhotos, setEventPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isFullscreenView, setIsFullscreenView] = useState(false);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const getOptimizedImageUrl = useCallback((url, width = 300, quality = 70) => {
    if (!url) return '';
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}width=${width}&quality=${quality}&format=webp`;
  }, []);

  useEffect(() => {
    const loadEventData = async () => {
      try {
        setLoading(true);
        
        const { data: eventoData, error: eventoError } = await supabase
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
          .eq('id', eventId)
          .single();

        if (eventoError) throw eventoError;

        const formattedDate = new Date(eventoData.fecha).toLocaleDateString('es-ES', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        });

        setEvent({
          ...eventoData,
          formattedDate,
          hasWatermark: !!eventoData.marca_agua_url
        });
        setEventPhotos(eventoData.fotos || []);
      } catch (err) {
        console.error('Error al cargar el evento:', err);
        router.push('/eventos');
      } finally {
        setLoading(false);
      }
    };

    const savedCart = localStorage.getItem('photoCart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    loadEventData();
  }, [eventId, supabase, router]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButton(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('photoCart', JSON.stringify(cart));
    } else {
      localStorage.removeItem('photoCart');
    }
  }, [cart]);

  const openPhotoViewer = useCallback((photo, index) => {
    setSelectedPhoto(photo);
    setCurrentPhotoIndex(index);
    setIsFullscreenView(false);
  }, []);

  const closePhotoViewer = useCallback(() => {
    setSelectedPhoto(null);
  }, []);

  const navigatePhotos = useCallback((direction) => {
    setCurrentPhotoIndex(prevIndex => {
      const newIndex = direction === 'prev' 
        ? (prevIndex === 0 ? eventPhotos.length - 1 : prevIndex - 1)
        : (prevIndex === eventPhotos.length - 1 ? 0 : prevIndex + 1);
      
      setSelectedPhoto(eventPhotos[newIndex]);
      return newIndex;
    });
  }, [eventPhotos]);

  const toggleFullscreenView = useCallback(() => {
    setIsFullscreenView(prev => !prev);
  }, []);

  const toggleCartItem = useCallback((photo) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => item.id === photo.id);

      if (existingItemIndex >= 0) {
        return prevCart.filter(item => item.id !== photo.id);
      } else {
        return [...prevCart, {
          id: photo.id,
          url: photo.url,
          price: photo.precio || 0,
          eventName: event?.nombre || 'Evento desconocido',
          photoName: photo.nombre || `Foto ${currentPhotoIndex + 1}`,
          eventId: event?.id,
          hasWatermark: event?.hasWatermark || false
        }];
      }
    });
  }, [event, currentPhotoIndex]);

  const calculateTotal = useCallback(() => {
    return cart.reduce((total, item) => total + (item.price || 0), 0);
  }, [cart]);

  const handleCheckout = useCallback(() => {
    if (cart.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    const queryParams = new URLSearchParams();
    queryParams.append('items', JSON.stringify(cart));
    queryParams.append('total', calculateTotal().toFixed(2));

    router.push(`/checkout?${queryParams.toString()}`);
  }, [cart, calculateTotal, router]);

  const closeModal = useCallback(() => {
    router.push('/eventos');
  }, [router]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  const goToHome = useCallback(() => {
    router.push('/');
  }, [router]);

  // Preload adjacent photos when viewing one
  useEffect(() => {
    if (selectedPhoto && eventPhotos.length > 0) {
      const preloadImage = (url) => {
        const img = new Image();
        img.src = getOptimizedImageUrl(url, 1000, 85);
      };

      const nextIndex = (currentPhotoIndex + 1) % eventPhotos.length;
      const prevIndex = (currentPhotoIndex - 1 + eventPhotos.length) % eventPhotos.length;
      
      preloadImage(eventPhotos[nextIndex].url);
      preloadImage(eventPhotos[prevIndex].url);
    }
  }, [currentPhotoIndex, selectedPhoto, eventPhotos, getOptimizedImageUrl]);

  if (loading || !event) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-black border-t-transparent rounded-full"
          />
          <p className="text-gray-600">Cargando fotos del evento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 overflow-y-auto p-4">
      <div className="relative bg-white rounded-xl max-w-6xl w-full mx-auto my-8 overflow-hidden border border-gray-200 shadow-2xl">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={goToHome}
              className="text-gray-500 hover:text-black p-2 transition-colors rounded-full hover:bg-gray-100"
              title="Ir al inicio"
            >
              <FiHome size={20} />
            </button>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{event.nombre}</h3>
              <p className="text-gray-600 text-sm flex items-center gap-1">
                <FiCalendar size={14} />
                <span>{event.formattedDate}</span>
              </p>
              {event.hasWatermark && (
                <span className="inline-block mt-1 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">
                  Fotos con marca de agua
                </span>
              )}
            </div>
          </div>
          <button
            onClick={closeModal}
            className="text-gray-500 hover:text-black p-2 transition-colors rounded-full hover:bg-gray-100"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 73px)' }}>
          {event.descripcion && (
            <p className="text-gray-600 mb-6 px-2 text-center max-w-3xl mx-auto">{event.descripcion}</p>
          )}

          {!selectedPhoto ? (
            <LazyPhotoGrid
              photos={eventPhotos}
              openPhotoViewer={openPhotoViewer}
              cart={cart}
              toggleCartItem={toggleCartItem}
              hasWatermark={event.hasWatermark}
              getOptimizedImageUrl={getOptimizedImageUrl}
            />
          ) : (
            <div className="relative">
              <button
                onClick={closePhotoViewer}
                className="mb-6 flex items-center gap-2 text-gray-600 hover:text-black transition-colors px-4 py-2 rounded-lg hover:bg-gray-100 border border-gray-200"
              >
                <FiChevronLeft className="mr-1" /> Volver a la galería
              </button>

              <div className="relative bg-gray-50 rounded-xl overflow-hidden shadow-lg">
                <img
                  src={getOptimizedImageUrl(selectedPhoto.url, 1000, 85)}
                  alt="Foto seleccionada"
                  className={`w-full ${isFullscreenView ? 'h-[80vh]' : 'max-h-[65vh]'} object-contain mx-auto`}
                />

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigatePhotos('prev');
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/70 text-white p-3 rounded-full hover:bg-black transition-all duration-300 shadow-lg hover:scale-110"
                >
                  <FiChevronLeft size={24} />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigatePhotos('next');
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/70 text-white p-3 rounded-full hover:bg-black transition-all duration-300 shadow-lg hover:scale-110"
                >
                  <FiChevronRight size={24} />
                </button>

                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <div className="inline-flex bg-black/70 text-white px-4 py-2 rounded-lg text-sm backdrop-blur-sm">
                    <span>Foto {currentPhotoIndex + 1} de {eventPhotos.length}</span>
                  </div>
                </div>

                <button
                  onClick={toggleFullscreenView}
                  className="absolute top-4 right-4 bg-black/70 text-white p-3 rounded-full hover:bg-black transition-all duration-300 shadow-lg hover:scale-110"
                  title={isFullscreenView ? 'Salir de vista ampliada' : 'Ver en pantalla completa'}
                >
                  {isFullscreenView ? <FiMinimize size={20} /> : <FiMaximize size={20} />}
                </button>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div>
                  <h4 className="font-bold text-xl text-gray-900 mb-1">{selectedPhoto.nombre || `Foto ${currentPhotoIndex + 1}`}</h4>
                  <p className="font-bold text-2xl text-black">${selectedPhoto.precio?.toFixed(2) || '0.00'}</p>
                  {event.hasWatermark && (
                    <p className="text-sm text-blue-600 mt-2 flex items-center gap-1">
                      <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                      Incluye marca de agua
                    </p>
                  )}
                </div>
                <button
                  onClick={() => toggleCartItem(selectedPhoto)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-300 ${
                    cart.some(item => item.id === selectedPhoto.id)
                      ? 'bg-green-600 text-white shadow-md hover:bg-green-700'
                      : 'bg-black text-white hover:bg-gray-800 shadow-sm hover:shadow-md'
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

      <AnimatePresence>
        {cart.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="fixed bottom-6 right-6 bg-white p-4 rounded-xl shadow-2xl border border-gray-200 z-50"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-800">Carrito ({cart.length})</h3>
              <span className="font-bold text-lg">${calculateTotal().toFixed(2)}</span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-md"
            >
              <FiShoppingCart />
              Ir a pagar
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {showScrollButton && (
        <motion.button
          onClick={scrollToTop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed bottom-24 right-6 bg-black text-white p-3 rounded-full shadow-xl hover:bg-gray-800 transition-colors duration-300 z-50"
          title="Volver arriba"
        >
          <FiArrowUp size={20} />
        </motion.button>
      )}
    </div>
  );
}