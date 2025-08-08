'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('external_reference');
  const paymentId = searchParams.get('payment_id');

  useEffect(() => {
    // Aquí puedes registrar la visita de éxito si es necesario
  }, []);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center max-w-md w-full bg-white border border-gray-200 rounded-xl p-8 md:p-10 shadow-sm">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-black mb-4">¡Pago exitoso!</h1>
        <p className="text-gray-700 mb-6">
          Tu pago ha sido procesado correctamente. En breve recibirás un correo con los detalles de tu compra.
        </p>
        
        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 mb-8">
          <p className="text-sm text-gray-600 mb-1">Número de pedido</p>
          <p className="font-mono font-bold text-lg text-black">{orderId || 'N/A'}</p>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-1">ID de transacción</p>
            <p className="font-mono text-sm text-black break-all">{paymentId || 'N/A'}</p>
          </div>
        </div>
        
        <Link 
          href="/" 
          className="inline-flex items-center text-black font-medium hover:text-gray-700 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}