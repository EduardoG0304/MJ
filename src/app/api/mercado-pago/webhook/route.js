import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import mercadopago from 'mercadopago';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validar que es una notificación de pago
    if (body.type !== 'payment') {
      return NextResponse.json({ received: true });
    }

    // Obtener los detalles del pago
    const paymentId = body.data.id;
    const payment = await mercadopago.payment.get(paymentId);
    const paymentData = payment.body;
    
    // Actualizar la orden en Supabase
    const { data, error } = await supabase
      .from('orders')
      .update({
        payment_status: paymentData.status === 'approved' ? 'paid' : paymentData.status,
        status: paymentData.status === 'approved' ? 'completed' : 'pending',
        payment_data: paymentData,
        updated_at: new Date().toISOString()
      })
      .eq('order_id', paymentData.external_reference)
      .select();

    if (error) {
      console.error('Error al actualizar orden:', error);
      throw new Error('Error al actualizar la orden');
    }

    return NextResponse.json({ success: true, order: data[0] });

  } catch (error) {
    console.error('Error en el webhook:', error);
    return NextResponse.json(
      { error: error.message || 'Error al procesar el webhook' },
      { status: 500 }
    );
  }
}