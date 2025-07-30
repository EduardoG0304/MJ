import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendDownloadEmail } from '@/lib/resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  try {
    const body = await request.json();
    const { nombre, email, telefono, mensaje, items, total, orderId } = body;

    // Validación básica
    if (!nombre || !email || !telefono || !items?.length || !total) {
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
        status: 'pending_payment',
        notes: mensaje,
        items: items
      }])
      .select();

    if (orderError) {
      console.error('Error al guardar orden:', orderError);
      throw new Error('Error al guardar la orden en la base de datos');
    }

    // 2. Preparar datos para el correo
    const photoList = items.map(item => ({
      id: item.id,
      name: item.photoName,
      price: item.price,
      downloadLink: item.url || '#'
    }));

    // 3. Enviar correo con los links
    const emailResult = await sendDownloadEmail(
      email,
      nombre,
      orderId,
      photoList,
      total
    );

    if (!emailResult.success) {
      console.error('Error al enviar correo:', emailResult.error);
      // Continuamos a pesar del error de correo
    }

    return NextResponse.json({ 
      success: true, 
      orderId,
      orderData: orderData[0],
      emailSent: emailResult.success
    });

  } catch (error) {
    console.error('Error en el checkout:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Error al procesar el pedido',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}