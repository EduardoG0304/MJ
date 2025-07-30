import { NextResponse } from 'next/server';
import { supabase } from '@/app/config/supabase';
import { sendDownloadEmail } from '@/lib/resend';

export async function POST(request) {
  try {
    const body = await request.json();
    const { nombre, email, telefono, mensaje, items, total, orderId } = body;

    // Validación mejorada
    if (!nombre || !email || !telefono || !items?.length || !total || !orderId) {
      return NextResponse.json(
        { error: 'Datos incompletos en la solicitud' },
        { status: 400 }
      );
    }

    // 1. Guardar la orden en Supabase
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([{
        order_id: orderId,
        customer_name: nombre,
        customer_email: email,
        customer_phone: telefono,
        total_amount: total,
        status: 'completed', // Asumimos pago completado
        payment_status: 'paid',
        notes: mensaje,
        items: items
      }])
      .select()
      .single();

    if (orderError) {
      console.error('Error al guardar orden:', orderError);
      throw new Error('Error al guardar la orden en la base de datos');
    }

    // 2. Enviar correo con los links de descarga
    const emailResult = await sendDownloadEmail(
      email,
      nombre,
      orderId,
      items, // items ya contienen eventName, photoName, price y url
      total
    );

    if (!emailResult.success) {
      console.error('Error enviando correo:', emailResult.error);
      // Registrar error pero no fallar la operación
    }

    return NextResponse.json({
      success: true,
      orderId,
      orderData,
      emailSent: emailResult.success
    });

  } catch (error) {
    console.error('Error en checkout:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Error en el servidor',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}