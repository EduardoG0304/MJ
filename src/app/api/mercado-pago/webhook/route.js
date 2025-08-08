import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import mercadopago from 'mercadopago';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
});

export async function POST(request) {
  try {
    const body = await request.json();
    
    if (body.type === 'payment') {
      const paymentId = body.data.id;
      
      // Obtener detalles del pago
      const paymentInfo = await mercadopago.payment.findById(paymentId);
      const payment = paymentInfo.body;
      
      // Actualizar la orden en Supabase
      const { data, error } = await supabase
        .from('orders')
        .update({
          status: payment.status === 'approved' ? 'completed' : payment.status,
          payment_status: payment.status === 'approved' ? 'paid' : payment.status,
          payment_id: payment.id,
          payment_method: payment.payment_type_id,
          updated_at: new Date().toISOString()
        })
        .eq('order_id', payment.external_reference)
        .select();
      
      if (error) {
        console.error('Error al actualizar orden:', error);
        throw new Error('Error al actualizar la orden');
      }
      
      // Opcional: Enviar email de confirmación
      if (payment.status === 'approved' && data?.[0]?.customer_email) {
        // Aquí puedes implementar el envío de email
      }
      
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ success: false, message: 'Tipo de notificación no manejado' });
    
  } catch (error) {
    console.error('Error en webhook:', error);
    return NextResponse.json(
      { error: error.message || 'Error al procesar webhook' },
      { status: 500 }
    );
  }
}