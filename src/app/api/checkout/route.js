import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendDownloadEmail } from '@/app/lib/resend';

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

    // 1. Obtener las URLs originales de las fotos desde Supabase
    const photoIds = items.map(item => item.id);
    const { data: fotosData, error: fotosError } = await supabase
      .from('fotos')
      .select('id, ruta_original, nombre_archivo, url')
      .in('id', photoIds);

    if (fotosError) {
      console.error('Error al obtener fotos:', fotosError);
      throw new Error('Error al obtener información de las fotos');
    }

    // Crear URLs completas para las fotos originales
    const itemsWithDownloadLinks = items.map(item => {
      const fotoInfo = fotosData.find(foto => foto.id === item.id);
      const originalUrl = fotoInfo?.ruta_original 
        ? `https://gwunhrdthecrbmuhddpy.supabase.co/storage/v1/object/public/fotos_eventos/${fotoInfo.ruta_original}`
        : fotoInfo?.url || '#';
      
      return {
        ...item,
        url: originalUrl,
        photoName: fotoInfo?.nombre_archivo || item.photoName
      };
    });

    // 2. Guardar la orden en Supabase con los datos actualizados
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
        items: itemsWithDownloadLinks
      }])
      .select();

    if (orderError) {
      console.error('Error al guardar orden:', orderError);
      throw new Error('Error al guardar la orden en la base de datos');
    }

    // 3. Preparar datos para el correo
    const photoList = itemsWithDownloadLinks.map(item => ({
      id: item.id,
      name: item.photoName,
      price: item.price,
      downloadLink: item.url
    }));

    // 4. Enviar correo con los links de descarga
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