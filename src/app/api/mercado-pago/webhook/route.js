import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { sendDownloadEmailNodemailer } from '@/app/lib/nodemailer';

// Configuración de Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN
});

// Configuración de Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('Webhook recibido:', JSON.stringify(body, null, 2));

    // Verificar si es una notificación de pago
    if (body.type === 'payment') {
      const paymentId = body.data.id;
      const payment = new Payment(client);

      // Obtener detalles del pago desde Mercado Pago
      const paymentInfo = await payment.get({ id: paymentId });
      console.log('Información de pago:', JSON.stringify(paymentInfo, null, 2));

      // Validar datos esenciales
      if (!paymentInfo || !paymentInfo.external_reference) {
        throw new Error('Datos de pago incompletos');
      }

      // Actualizar la orden en Supabase
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('order_id', paymentInfo.external_reference)
        .single();

      if (orderError || !orderData) {
        throw new Error('Orden no encontrada');
      }

      // Determinar nuevos estados
      const newStatus = paymentInfo.status === 'approved' ? 'completed' : paymentInfo.status;
      const newPaymentStatus = paymentInfo.status === 'approved' ? 'paid' : paymentInfo.status;

      // Actualizar la orden
      const { data: updatedOrder, error: updateError } = await supabase
        .from('orders')
        .update({
          status: newStatus,
          payment_status: newPaymentStatus,
          payment_id: paymentInfo.id,
          payment_method: paymentInfo.payment_type_id,
          payment_details: paymentInfo,
          updated_at: new Date().toISOString()
        })
        .eq('order_id', paymentInfo.external_reference)
        .select();

      if (updateError) {
        throw new Error('Error al actualizar la orden');
      }

      // Enviar email de confirmación si el pago fue aprobado
      if (paymentInfo.status === 'approved') {
        try {
          const photoList = updatedOrder[0].items.map(item => ({
            id: item.id,
            name: item.photoName,
            price: item.price,
            downloadLink: item.url
          }));

          await sendDownloadEmailNodemailer(
            updatedOrder[0].customer_email,
            updatedOrder[0].customer_name,
            updatedOrder[0].order_id,
            photoList,
            updatedOrder[0].total_amount,
            true
          );
          console.log('Email de confirmación enviado');
        } catch (emailError) {
          console.error('Error al enviar email de confirmación:', emailError);
        }
      }

      return NextResponse.json({ 
        success: true,
        orderId: paymentInfo.external_reference,
        paymentStatus: paymentInfo.status
      });
    }

    return NextResponse.json(
      { success: false, message: 'Tipo de notificación no manejado' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error en webhook:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Error al procesar webhook',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';