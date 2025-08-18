'use client';

import { useState, useEffect, useRef, useCallback, memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { FiCalendar, FiHome, FiPercent } from 'react-icons/fi';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { FiX, FiShoppingCart, FiChevronLeft, FiChevronRight, FiMaximize, FiMinimize, FiArrowUp } from 'react-icons/fi';

// Componente Thumbnail optimizado con animaciones CSS nativas
const PhotoThumbnail = memo(({ photo, index, openPhotoViewer, cart, toggleCartItem, hasWatermark, getOptimizedImageUrl }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const cartButtonRef = useRef(null);
  
  // Optimización: Manejar el hover con CSS puro cuando sea posible
  const isInCart = cart.some(item => item.id === photo.id);

  return (
    <div
      className="relative group overflow-hidden rounded-xl shadow-md hover:shadow-lg bg-gray-100"
      style={{ 
        height: '224px',
        aspectRatio: '3/2',
        viewTransitionName: `photo-${photo.id}` // Para futuras transiciones
      }}
    >
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse"></div>
      )}
      
      {/* Imagen con transform CSS nativo para mejor rendimiento */}
      <img
        src={getOptimizedImageUrl(photo.url, 300, 70)}
        alt={`Foto ${index + 1}`}
        className={`w-full h-full object-cover cursor-pointer transition-transform duration-300 ease-out ${
          isLoaded ? 'opacity-100 group-hover:scale-105' : 'opacity-0'
        }`}
        onClick={() => openPhotoViewer(photo, index)}
        loading="lazy"
        decoding="async"
        onLoad={() => {
          setIsLoaded(true);
          // Precarga la imagen de alta resolución
          new Image().src = getOptimizedImageUrl(photo.url, 1200, 85);
        }}
      />
      
      {/* Overlay con transiciones CSS */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3">
        <h4 className="text-white font-medium text-sm truncate transform translate-y-2 group-hover:translate-y-0 transition-transform duration-200">
          {photo.nombre || `Foto ${index + 1}`}
        </h4>
        <p className="text-white font-bold text-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-200 delay-75">
          ${photo.precio?.toFixed(2) || '0.00'}
        </p>
      </div>

      {/* Botón de carrito optimizado con transform CSS */}
      <button
        ref={cartButtonRef}
        onClick={(e) => {
          e.stopPropagation();
          toggleCartItem(photo);
        }}
        className={`absolute top-3 left-3 p-2 rounded-full transition-all duration-200 ease-out ${
          isInCart 
            ? 'bg-green-500 text-white shadow-lg scale-100' 
            : 'bg-white/90 text-gray-800 shadow-sm scale-90 group-hover:scale-100'
        }`}
        aria-label={isInCart ? 'Quitar del carrito' : 'Agregar al carrito'}
      >
        <FiShoppingCart size={16} />
      </button>

      {hasWatermark && (
        <div className="absolute top-3 right-3 bg-blue-600/90 text-white text-xs px-2 py-1 rounded-full shadow transition-opacity duration-200 opacity-0 group-hover:opacity-100">
          Marca de agua
        </div>
      )}
    </div>
  );
});

// Componente LazyGrid con Intersection Observer optimizado
const LazyPhotoGrid = memo(({ photos, openPhotoViewer, cart, toggleCartItem, hasWatermark, getOptimizedImageUrl }) => {
  const containerRef = useRef(null);
  const observerRef = useRef(null);
  
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const options = {
      root: containerRef.current,
      rootMargin: '300px',
      threshold: 0.01
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target.querySelector('img');
          if (img && !img.src) {
            const photoId = entry.target.dataset.id;
            const photo = photos.find(p => p.id === photoId);
            if (photo) {
              img.src = getOptimizedImageUrl(photo.url, 300, 70);
            }
          }
        }
      });
    }, options);

    const items = containerRef.current.querySelectorAll('[data-id]');
    items.forEach(item => observerRef.current.observe(item));

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [photos, getOptimizedImageUrl]);

  return (
    <div 
      ref={containerRef}
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 overflow-y-auto"
      style={{ height: '70vh', contentVisibility: 'auto' }} // Optimización crítica
    >
      {photos.map((photo) => (
        <div 
          key={photo.id}
          data-id={photo.id}
          className="min-h-[224px]"
        >
          <PhotoThumbnail
            photo={photo}
            index={0} // No necesario para el renderizado
            openPhotoViewer={openPhotoViewer}
            cart={cart}
            toggleCartItem={toggleCartItem}
            hasWatermark={hasWatermark}
            getOptimizedImageUrl={getOptimizedImageUrl}
          />
        </div>
      ))}
    </div>
  );
});

// Componente Lightbox optimizado
const PhotoLightbox = memo(({ 
  photo, 
  index, 
  totalPhotos,
  onClose,
  onNavigate,
  isFullscreen,
  toggleFullscreen,
  cart,
  toggleCartItem,
  hasWatermark,
  getOptimizedImageUrl 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const controlsTimeout = useRef(null);
  
  // Limpieza de timeout al desmontar
  useEffect(() => {
    return () => {
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    controlsTimeout.current = setTimeout(() => {
      setIsHovered(false);
    }, 1000);
  };

  return (
    <div className="relative">
      <button
        onClick={onClose}
        className="mb-6 flex items-center gap-2 text-gray-600 hover:text-black transition-colors px-4 py-2 rounded-lg hover:bg-gray-100 border border-gray-200"
      >
        <FiChevronLeft className="mr-1" /> Volver a la galería
      </button>

      <div 
        className="relative bg-gray-50 rounded-xl overflow-hidden shadow-lg"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <img
          src={getOptimizedImageUrl(photo.url, 1200, 85)}
          alt="Foto seleccionada"
          className={`w-full ${isFullscreen ? 'h-[80vh]' : 'max-h-[65vh]'} object-contain mx-auto cursor-zoom-out`}
          onClick={onClose}
          loading="eager"
          decoding="sync"
        />

        {/* Controles de navegación optimizados */}
        <div className={`absolute inset-0 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate('prev');
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/70 text-white p-3 rounded-full hover:bg-black transition-all duration-200 shadow-lg"
            aria-label="Foto anterior"
          >
            <FiChevronLeft size={24} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate('next');
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/70 text-white p-3 rounded-full hover:bg-black transition-all duration-200 shadow-lg"
            aria-label="Foto siguiente"
          >
            <FiChevronRight size={24} />
          </button>
        </div>

        {/* Indicador de posición */}
        <div className="absolute bottom-4 left-0 right-0 text-center">
          <div className="inline-flex bg-black/70 text-white px-4 py-2 rounded-lg text-sm backdrop-blur-sm">
            <span>Foto {index + 1} de {totalPhotos}</span>
          </div>
        </div>

        {/* Botón de pantalla completa */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFullscreen();
          }}
          className={`absolute top-4 right-4 bg-black/70 text-white p-3 rounded-full hover:bg-black transition-all duration-200 shadow-lg ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
          aria-label={isFullscreen ? 'Salir de vista ampliada' : 'Ver en pantalla completa'}
        >
          {isFullscreen ? <FiMinimize size={20} /> : <FiMaximize size={20} />}
        </button>
      </div>

      {/* Panel de información optimizado */}
      <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
        <div>
          <h4 className="font-bold text-xl text-gray-900 mb-1">{photo.nombre || `Foto ${index + 1}`}</h4>
          <p className="font-bold text-2xl text-black">${photo.precio?.toFixed(2) || '0.00'}</p>
          {hasWatermark && (
            <p className="text-sm text-blue-600 mt-2 flex items-center gap-1">
              <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
              Incluye marca de agua
            </p>
          )}
        </div>
        <button
          onClick={() => toggleCartItem(photo)}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 ${
            cart.some(item => item.id === photo.id)
              ? 'bg-green-600 text-white shadow-md'
              : 'bg-black text-white hover:bg-gray-800 shadow-sm'
          }`}
        >
          <FiShoppingCart />
          {cart.some(item => item.id === photo.id) ? 'En carrito' : 'Agregar al carrito'}
        </button>
      </div>
    </div>
  );
});

// Componente principal optimizado
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
  const [discounts, setDiscounts] = useState([]);
  const [discountApplied, setDiscountApplied] = useState(null);

  // Memoizar la función de URL con useMemo
  const getOptimizedImageUrl = useMemo(() => {
    return (url, width = 300, quality = 70) => {
      if (!url) return '';
      try {
        const urlObj = new URL(url);
        urlObj.searchParams.set('width', width);
        urlObj.searchParams.set('quality', quality);
        urlObj.searchParams.set('format', 'webp');
        return urlObj.toString();
      } catch {
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}width=${width}&quality=${quality}&format=webp`;
      }
    };
  }, []);

  // Carga optimizada de datos
  useEffect(() => {
    let isMounted = true;
    const loadEventData = async () => {
      try {
        setLoading(true);
        
        // Carga en dos pasos para mejor percepción de rendimiento
        const { data: eventoData } = await supabase
          .from('eventos')
          .select('id, nombre, fecha, descripcion, portada_url, marca_agua_url')
          .eq('id', eventId)
          .single();

        if (isMounted && eventoData) {
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

          // Carga las fotos y descuentos después de mostrar la info básica
          const { data: fotosData } = await supabase
            .from('fotos')
            .select('id, url, precio, nombre, ruta_original, ruta_procesada')
            .eq('evento_id', eventId)
            .order('created_at', { ascending: true });

          const { data: descuentosData } = await supabase
            .from('descuentos')
            .select('*')
            .eq('evento_id', eventId)
            .order('cantidad_minima', { ascending: true });

          if (isMounted) {
            setEventPhotos(fotosData || []);
            setDiscounts(descuentosData || []);
          }
        }
      } catch (err) {
        console.error('Error al cargar el evento:', err);
        if (isMounted) {
          router.push('/eventos');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Cargar carrito desde localStorage
    try {
      const savedCart = localStorage.getItem('photoCart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (e) {
      console.error('Error parsing cart data', e);
    }

    loadEventData();

    return () => {
      isMounted = false;
    };
  }, [eventId, supabase, router]);

  // Efectos de scroll optimizados con debounce
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };

    const debouncedScroll = debounce(handleScroll, 50);
    window.addEventListener('scroll', debouncedScroll);
    return () => window.removeEventListener('scroll', debouncedScroll);
  }, []);

  // Persistencia del carrito optimizada
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

  // Funciones memoizadas
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

  const calculateSubtotal = useCallback(() => {
    return cart.reduce((total, item) => total + (item.price || 0), 0);
  }, [cart]);

  const calculateDiscount = useCallback(() => {
    if (!discountApplied) return 0;
    return calculateSubtotal() * (discountApplied.porcentaje / 100);
  }, [discountApplied, calculateSubtotal]);

  const calculateTotal = useCallback(() => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    return subtotal - discount;
  }, [calculateSubtotal, calculateDiscount]);

  const handleCheckout = useCallback(() => {
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
  }, [cart, calculateTotal, calculateDiscount, calculateSubtotal, discountApplied, router]);

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

  // Precarga de imágenes adyacentes optimizada
  useEffect(() => {
    if (selectedPhoto && eventPhotos.length > 0) {
      const preloadImage = (url) => {
        const img = new Image();
        img.src = getOptimizedImageUrl(url, 1200, 85);
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
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Cargando fotos del evento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 overflow-y-auto p-4">
      <div className="relative bg-white rounded-xl max-w-6xl w-full mx-auto my-8 overflow-hidden border border-gray-200 shadow-2xl">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-4 flex justify-between items-center backdrop-blur-sm bg-white/95">
          <div className="flex items-center gap-4">
            <button
              onClick={goToHome}
              className="text-gray-500 hover:text-black p-2 transition-colors rounded-full hover:bg-gray-100"
              aria-label="Ir al inicio"
            >
              <FiHome size={20} />
            </button>
            <div className="max-w-[70%]">
              <h3 className="text-xl font-bold text-gray-900 truncate">{event.nombre}</h3>
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
            aria-label="Cerrar"
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
            <PhotoLightbox
              photo={selectedPhoto}
              index={currentPhotoIndex}
              totalPhotos={eventPhotos.length}
              onClose={closePhotoViewer}
              onNavigate={navigatePhotos}
              isFullscreen={isFullscreenView}
              toggleFullscreen={toggleFullscreenView}
              cart={cart}
              toggleCartItem={toggleCartItem}
              hasWatermark={event.hasWatermark}
              getOptimizedImageUrl={getOptimizedImageUrl}
            />
          )}
        </div>
      </div>

      <AnimatePresence>
        {cart.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="fixed bottom-6 right-6 bg-gray-800 p-4 rounded-xl shadow-2xl border border-gray-700 z-50 min-w-[280px]"
          >
            <div className="mb-3">
              <h3 className="font-bold text-white mb-2">Carrito ({cart.length})</h3>
              
              <div className="space-y-1 mb-2">
                <div className="flex justify-between text-sm text-gray-300">
                  <span>Subtotal:</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
                
                {discountApplied && (
                  <div className="flex justify-between text-sm text-green-400">
                    <span className="flex items-center gap-1">
                      <FiPercent size={12} />
                      Descuento ({discountApplied.porcentaje}%):
                    </span>
                    <span>-${calculateDiscount().toFixed(2)}</span>
                  </div>
                )}
                
                <div className="border-t border-gray-600 my-1"></div>
                
                <div className="flex justify-between font-bold text-white">
                  <span>Total:</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
              
              {discounts.length > 0 && !discountApplied && (
                <div className="text-xs text-gray-400 mt-1">
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
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              <FiShoppingCart />
              Ir a pagar
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {showScrollButton && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 right-6 bg-black text-white p-3 rounded-full shadow-xl hover:bg-gray-800 transition-colors duration-200 z-50"
          aria-label="Volver arriba"
        >
          <FiArrowUp size={20} />
        </button>
      )}
    </div>
  );
}

// Helper para debounce
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}