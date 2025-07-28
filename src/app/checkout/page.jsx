'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    mensaje: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    // Obtener items del query string
    const itemsParam = searchParams.get('items');
    const totalParam = searchParams.get('total');
    
    if (itemsParam) {
      try {
        setItems(JSON.parse(itemsParam));
      } catch (e) {
        console.error('Error parsing items:', e);
      }
    }
    
    if (totalParam) {
      setTotal(parseFloat(totalParam));
    }
  }, [searchParams]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Aquí podrías enviar los datos a tu backend o servicio de correo
      console.log('Datos enviados:', {
        ...formData,
        items,
        total
      });
      
      // Simular envío
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSubmitSuccess(true);
      
      // Limpiar carrito
      localStorage.removeItem('photoCart');
    } catch (error) {
      console.error('Error al enviar:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="container mx-auto px-4 py-24 min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold mb-4">¡Gracias por tu compra!</h1>
          <p className="text-lg mb-6">
            Hemos recibido tu pedido. Nos pondremos en contacto contigo a la brevedad para coordinar la entrega.
          </p>
          <p className="text-gray-600">
            Número de referencia: #{Math.random().toString(36).substring(2, 10).toUpperCase()}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-24 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Finalizar Compra</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Resumen de compra */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Tu pedido</h2>
            
            <div className="divide-y divide-gray-200">
              {items.map((item, index) => (
                <div key={index} className="py-4 flex justify-between">
                  <div>
                    <p className="font-medium">{item.eventName}</p>
                    <p className="text-sm text-gray-600">{item.photoName}</p>
                  </div>
                  <p className="font-medium">${item.price.toFixed(2)}</p>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          {/* Formulario de contacto */}
          <div>
            <h2 className="text-xl font-bold mb-4">Información de contacto</h2>
            <p className="text-gray-600 mb-6">
              Completa tus datos y nos pondremos en contacto contigo para coordinar la entrega.
            </p>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  required
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  required
                  value={formData.telefono}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="mensaje" className="block text-sm font-medium text-gray-700 mb-1">
                  Mensaje adicional (opcional)
                </label>
                <textarea
                  id="mensaje"
                  name="mensaje"
                  rows="3"
                  value={formData.mensaje}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                ></textarea>
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition-colors disabled:bg-gray-400"
              >
                {isSubmitting ? 'Enviando...' : 'Confirmar compra'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}