'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    mensaje: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');

  // Cargar items del carrito desde URL o localStorage
  useEffect(() => {
    const itemsParam = searchParams.get('items');
    const totalParam = searchParams.get('total');
    
    try {
      if (itemsParam) {
        const decodedItems = decodeURIComponent(itemsParam);
        const parsedItems = JSON.parse(decodedItems);
        setItems(Array.isArray(parsedItems) ? parsedItems : []);
      } else {
        const savedCart = localStorage.getItem('photoCart');
        if (savedCart) {
          const parsedItems = JSON.parse(savedCart);
          setItems(Array.isArray(parsedItems) ? parsedItems : []);
          
          const newTotal = parsedItems.reduce((sum, item) => sum + (item.price || 0), 0);
          const newParams = new URLSearchParams();
          newParams.set('items', JSON.stringify(parsedItems));
          newParams.set('total', newTotal.toFixed(2));
          router.replace(`/checkout?${newParams.toString()}`);
        }
      }
      
      if (totalParam) {
        const decodedTotal = decodeURIComponent(totalParam);
        const parsedTotal = parseFloat(decodedTotal);
        setTotal(isNaN(parsedTotal) ? 0 : parsedTotal);
      } else if (items.length > 0) {
        const calculatedTotal = items.reduce((sum, item) => sum + (item.price || 0), 0);
        setTotal(calculatedTotal);
      }
    } catch (e) {
      console.error('Error parsing URL params:', e);
      setItems([]);
      setTotal(0);
    }
  }, [searchParams]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.nombre.trim()) errors.nombre = 'Nombre es requerido';
    if (!formData.email.trim()) {
      errors.email = 'Email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email no válido';
    }
    if (!formData.telefono.trim()) {
      errors.telefono = 'Teléfono es requerido';
    } else if (!/^[0-9]{10,15}$/.test(formData.telefono)) {
      errors.telefono = 'Teléfono no válido';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const processOrder = async () => {
    const newOrderId = `ord_${Date.now().toString(36).toUpperCase()}`;
    setOrderId(newOrderId);
    
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          items: items.map(item => ({
            id: item.id,
            eventName: item.eventName,
            photoName: item.photoName,
            price: item.price
          })),
          total,
          orderId: newOrderId
        })
      });

      if (!response.ok) {
        throw new Error('Error al crear la orden');
      }

      const result = await response.json();
      
      if (result.success) {
        // Redirigir a Mercado Pago para el pago
        window.location.href = result.paymentUrl;
      } else {
        throw new Error(result.error || 'Error al procesar el pedido');
      }
      
    } catch (error) {
      console.error('Error:', error);
      alert(error.message);
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    await processOrder();
  };

  const removeItem = (indexToRemove) => {
    const newItems = items.filter((_, index) => index !== indexToRemove);
    setItems(newItems);
    
    const newTotal = newItems.reduce((sum, item) => sum + (item.price || 0), 0);
    setTotal(newTotal);
    
    const newParams = new URLSearchParams();
    newParams.set('items', JSON.stringify(newItems));
    newParams.set('total', newTotal.toFixed(2));
    router.replace(`/checkout?${newParams.toString()}`);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('photoCart', JSON.stringify(newItems));
    }
  };

  if (submitSuccess) {
    return <SuccessScreen orderId={orderId} email={formData.email} total={total} />;
  }

  return (
    <div className="min-h-screen bg-white py-12 md:py-24">
      <div className="max-w-6xl mx-auto px-4">
        <header className="mb-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-black mb-3">Finalizar Compra</h1>
          <div className="w-20 h-1 bg-black mx-auto"></div>
          <p className="text-gray-700 mt-4 max-w-2xl mx-auto">
            Revisa tu pedido y completa tus datos para proceder
          </p>
        </header>
        
        <div className="grid lg:grid-cols-2 gap-10">
          <OrderSummary items={items} total={total} removeItem={removeItem} />
          
          <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-black mb-6">Información de contacto</h2>
            <ContactForm 
              formData={formData}
              formErrors={formErrors}
              isSubmitting={isSubmitting}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
              items={items}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderSummary({ items, total, removeItem }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8 shadow-sm">
      <h2 className="text-2xl font-bold text-black mb-6">Resumen del pedido</h2>
      
      {items.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-gray-600">No hay items en tu carrito</p>
          <a 
            href="/" 
            className="mt-4 inline-flex items-center text-black font-medium hover:text-gray-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver a la tienda
          </a>
        </div>
      ) : (
        <>
          <div className="divide-y divide-gray-200">
            {items.map((item, index) => (
              <div key={`${item.id}-${index}`} className="py-4 flex justify-between items-start group relative">
                <div className="flex-1">
                  <p className="font-semibold text-black">{item.eventName}</p>
                  <p className="text-sm text-gray-700 mt-1">{item.photoName}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-medium text-black">${item.price.toFixed(2)}</p>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    aria-label="Eliminar producto"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-200 pt-6 mt-6">
            <div className="flex justify-between items-center">
              <span className="font-bold text-lg text-black">Total</span>
              <span className="font-bold text-xl text-black">${total.toFixed(2)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ContactForm({ 
  formData, 
  formErrors, 
  isSubmitting, 
  handleInputChange, 
  handleSubmit,
  items 
}) {
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormField
        label="Nombre completo *"
        id="nombre"
        name="nombre"
        type="text"
        value={formData.nombre}
        onChange={handleInputChange}
        error={formErrors.nombre}
      />
      
      <FormField
        label="Email *"
        id="email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleInputChange}
        error={formErrors.email}
      />
      
      <FormField
        label="Teléfono *"
        id="telefono"
        name="telefono"
        type="tel"
        value={formData.telefono}
        onChange={handleInputChange}
        error={formErrors.telefono}
      />
      
      <div>
        <label htmlFor="mensaje" className="block text-sm font-medium text-gray-900 mb-2">
          Mensaje adicional (opcional)
        </label>
        <textarea
          id="mensaje"
          name="mensaje"
          rows="4"
          value={formData.mensaje}
          onChange={handleInputChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
        ></textarea>
      </div>
      
      <button
        type="submit"
        disabled={isSubmitting || !items.length}
        className="w-full bg-[#009ee3] text-white py-3.5 px-6 rounded-lg hover:bg-[#0085c6] transition-colors duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center font-medium"
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Procesando...
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 9H9.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M15 9H15.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Pagar con Mercado Pago
          </>
        )}
      </button>
    </form>
  );
}

function FormField({ label, id, name, type, value, onChange, error }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-900 mb-2">
        {label}
      </label>
      <input
        type={type}
        id={id}
        name={name}
        required
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-3 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all`}
      />
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}

function SuccessScreen({ orderId, email, total }) {
  const searchParams = useSearchParams();
  const paymentStatus = searchParams.get('status');

  let statusMessage = '';
  let statusIcon = '';
  let statusColor = '';
  
  if (paymentStatus === 'approved') {
    statusMessage = '¡Pago aprobado! Tu pedido ha sido confirmado.';
    statusIcon = (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    );
    statusColor = 'text-green-600 bg-green-100';
  } else if (paymentStatus === 'pending') {
    statusMessage = 'Tu pago está pendiente de confirmación. Te notificaremos cuando sea aprobado.';
    statusIcon = (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    );
    statusColor = 'text-yellow-500 bg-yellow-100';
  } else if (paymentStatus === 'failure') {
    statusMessage = 'Hubo un problema con tu pago. Por favor, intenta nuevamente.';
    statusIcon = (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    );
    statusColor = 'text-red-500 bg-red-100';
  } else {
    statusMessage = '¡Pedido confirmado! Completa el pago para finalizar.';
    statusIcon = (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    );
    statusColor = 'text-blue-500 bg-blue-100';
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center max-w-md w-full bg-white border border-gray-200 rounded-xl p-8 md:p-10 shadow-sm">
        <div className={`w-20 h-20 ${statusColor} rounded-full flex items-center justify-center mx-auto mb-6`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {statusIcon}
          </svg>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-black mb-4">
          {paymentStatus === 'approved' ? '¡Pago aprobado!' : 
           paymentStatus === 'pending' ? 'Pago pendiente' : 
           paymentStatus === 'failure' ? 'Pago rechazado' : '¡Pedido confirmado!'}
        </h1>
        <p className="text-gray-700 mb-6">{statusMessage}</p>
        
        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 mb-8">
          <p className="text-sm text-gray-600 mb-1">Número de pedido</p>
          <p className="font-mono font-bold text-lg text-black">{orderId}</p>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Te contactaremos al correo:</p>
            <p className="font-medium text-black break-all">{email}</p>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Total del pedido</p>
            <p className="font-bold text-black">${total.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a 
            href="/" 
            className="px-6 py-2.5 border border-black text-black rounded-lg hover:bg-gray-100 transition-colors font-medium text-center"
          >
            Volver al inicio
          </a>
          {paymentStatus === 'failure' && (
            <a 
              href="/checkout" 
              className="px-6 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-center"
            >
              Reintentar pago
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}