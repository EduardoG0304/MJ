'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PendingPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('external_reference');
  const paymentId = searchParams.get('payment_id');

  useEffect(() => {
    // Puedes registrar el estado pendiente aquí si es necesario
    console.log('Pago pendiente', { orderId, paymentId });
  }, [orderId, paymentId]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center max-w-md w-full bg-white border border-gray-200 rounded-xl p-8 md:p-10 shadow-sm">
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-black mb-4">Pago pendiente</h1>
        <p className="text-gray-700 mb-6">
          Tu pago está siendo procesado. Te notificaremos por correo electrónico cuando se complete.
        </p>
        
        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 mb-8">
          <p className="text-sm text-gray-600 mb-1">Número de pedido</p>
          <p className="font-mono font-bold text-lg text-black">{orderId || 'N/A'}</p>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-1">ID de transacción</p>
            <p className="font-mono text-sm text-black break-all">{paymentId || 'N/A'}</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-left">
            <h3 className="text-sm font-medium text-blue-800 mb-2">¿Qué significa esto?</h3>
            <p className="text-sm text-blue-700">
              Algunos métodos de pago pueden tardar hasta 72 horas en ser confirmados. Revisa tu correo electrónico para actualizaciones.
            </p>
          </div>
          
          <Link 
            href="/"
            className="inline-flex items-center justify-center w-full px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}