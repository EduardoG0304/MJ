'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { validatePhone, validateEmail } from '../lib/validations';

export default function CheckoutPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <CheckoutContent />
    </Suspense>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 border-4 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-lg font-medium text-gray-900">Cargando tu pedido...</p>
      </div>
    </div>
  );
}

function CheckoutContent() {
  const searchParams = useSearchParams();
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

  useEffect(() => {
    const itemsParam = searchParams.get('items');
    const totalParam = searchParams.get('total');
    
    if (itemsParam) {
      try {
        const parsedItems = JSON.parse(itemsParam);
        setItems(Array.isArray(parsedItems) ? parsedItems : []);
      } catch (e) {
        console.error('Error parsing items:', e);
        setItems([]);
      }
    }
    
    if (totalParam) {
      const parsedTotal = parseFloat(totalParam);
      setTotal(isNaN(parsedTotal) ? 0 : parsedTotal);
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
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Email no válido';
    }
    if (!formData.telefono.trim()) {
      errors.telefono = 'Teléfono es requerido';
    } else if (!validatePhone(formData.telefono)) {
      errors.telefono = 'Teléfono no válido';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          items,
          total,
          orderId: generateOrderId()
        })
      });
      
      if (!response.ok) throw new Error('Error en el pedido');
      
      setSubmitSuccess(true);
      localStorage.removeItem('photoCart');
    } catch (error) {
      console.error('Error al enviar:', error);
      alert('Hubo un error al procesar tu pedido. Por favor intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateOrderId = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  if (submitSuccess) {
    return <SuccessScreen orderId={generateOrderId()} />;
  }

  return (
    <div className="min-h-screen bg-white py-12 md:py-24">
      <div className="max-w-6xl mx-auto px-4">
        <header className="mb-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-black mb-3">Finalizar Compra</h1>
          <div className="w-20 h-1 bg-black mx-auto"></div>
          <p className="text-gray-700 mt-4 max-w-2xl mx-auto">
            Revisa tu pedido y completa tus datos para proceder con el pago
          </p>
        </header>
        
        <div className="grid lg:grid-cols-2 gap-10">
          <OrderSummary items={items} total={total} />
          
          <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-black mb-6">Información de contacto</h2>
            
            <ContactForm 
              formData={formData}
              formErrors={formErrors}
              isSubmitting={isSubmitting}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderSummary({ items, total }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8 shadow-sm">
      <h2 className="text-2xl font-bold text-black mb-6">Resumen del pedido</h2>
      
      {items.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-gray-600">No hay items en tu carrito</p>
        </div>
      ) : (
        <>
          <div className="divide-y divide-gray-200">
            {items.map((item, index) => (
              <div key={`${item.eventName}-${index}`} className="py-4 flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-semibold text-black">{item.eventName}</p>
                  <p className="text-sm text-gray-700 mt-1">{item.photoName}</p>
                </div>
                <p className="font-medium text-black ml-4">${item.price.toFixed(2)}</p>
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

function ContactForm({ formData, formErrors, isSubmitting, handleInputChange, handleSubmit }) {
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
          className={`w-full px-4 py-3 border ${formErrors.mensaje ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all`}
        ></textarea>
      </div>
      
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-black text-white py-3.5 px-6 rounded-lg hover:bg-gray-900 transition-colors duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center font-medium"
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Procesando...
          </>
        ) : 'Confirmar compra'}
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

function SuccessScreen({ orderId }) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center max-w-md w-full bg-white border border-gray-200 rounded-xl p-8 md:p-10 shadow-sm">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-black mb-4">¡Pedido confirmado!</h1>
        <p className="text-gray-700 mb-8">
          Hemos recibido tu pedido correctamente. Nos pondremos en contacto contigo a la brevedad para coordinar el pago y envío.
        </p>
        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 mb-8">
          <p className="text-sm text-gray-600 mb-1">Número de pedido</p>
          <p className="font-mono font-bold text-lg text-black">{orderId}</p>
        </div>
        <a 
          href="/" 
          className="inline-flex items-center text-black font-medium hover:text-gray-700 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al inicio
        </a>
      </div>
    </div>
  );
}