'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { validateEmail, validatePhone } from '@/lib/validations'; // Asume que tienes estas funciones

export default function CheckoutPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <CheckoutContent />
    </Suspense>
  );
}

function LoadingScreen() {
  return (
    <div className="container mx-auto px-4 py-24 min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="spinner mb-4 mx-auto h-8 w-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
        <p className="text-lg">Cargando tu pedido...</p>
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
    
    // Clear error when user types
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
      // Simular llamada API
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
    <div className="container mx-auto px-4 py-12 md:py-24 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-900">Finalizar Compra</h1>
          <p className="text-gray-600 mt-2">Revisa tu pedido y completa tus datos</p>
        </header>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Resumen del Pedido */}
          <OrderSummary items={items} total={total} />
          
          {/* Formulario de Contacto */}
          <div>
            <h2 className="text-xl font-bold mb-4 text-gray-900">Información de contacto</h2>
            <p className="text-gray-600 mb-6">
              Completa tus datos y nos pondremos en contacto contigo para coordinar el pago.
            </p>
            
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
    <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-4 text-gray-900">Tu pedido</h2>
      
      {items.length === 0 ? (
        <p className="text-gray-500 py-4">No hay items en tu carrito</p>
      ) : (
        <>
          <div className="divide-y divide-gray-200">
            {items.map((item, index) => (
              <div key={`${item.eventName}-${index}`} className="py-4 flex justify-between">
                <div>
                  <p className="font-medium text-gray-900">{item.eventName}</p>
                  <p className="text-sm text-gray-600">{item.photoName}</p>
                </div>
                <p className="font-medium text-gray-900">${item.price.toFixed(2)}</p>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="flex justify-between font-bold text-lg text-gray-900">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ContactForm({ formData, formErrors, isSubmitting, handleInputChange, handleSubmit }) {
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
      
      <div className="mb-4">
        <label htmlFor="mensaje" className="block text-sm font-medium text-gray-700 mb-1">
          Mensaje adicional (opcional)
        </label>
        <textarea
          id="mensaje"
          name="mensaje"
          rows="3"
          value={formData.mensaje}
          onChange={handleInputChange}
          className={`w-full px-4 py-2 border ${formErrors.mensaje ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-black transition-colors`}
        ></textarea>
      </div>
      
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-black text-white py-3 px-4 rounded-md hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        id={id}
        name={name}
        required
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-black transition-colors`}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

function SuccessScreen({ orderId }) {
  return (
    <div className="container mx-auto px-4 py-24 min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md bg-white p-8 rounded-lg shadow-sm">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">¡Gracias por tu compra!</h1>
        <p className="text-gray-600 mb-6">
          Hemos recibido tu pedido correctamente. Nos pondremos en contacto contigo a la brevedad para coordinar el pago y envío.
        </p>
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-sm text-gray-500 mb-1">Número de pedido</p>
          <p className="font-mono font-medium text-gray-900">{orderId}</p>
        </div>
        <a 
          href="/" 
          className="mt-6 inline-block text-sm font-medium text-black hover:text-gray-700 transition-colors"
        >
          ← Volver al inicio
        </a>
      </div>
    </div>
  );
}