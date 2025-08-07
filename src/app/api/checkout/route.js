import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendDownloadEmailNodemailer } from '@/app/lib/nodemailer';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    db: {
      schema: 'public'
    }
  }
);

const getDownloadUrl = (fotoInfo) => {
  if (fotoInfo?.ruta_original) {
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/fotos_eventos/${fotoInfo.ruta_original}`;
  }
  return fotoInfo?.url || '#';
};

const processCartItems = (items, fotosData) => {
  return items.map(item => {
    const fotoInfo = fotosData.find(foto => foto.id === item.id);
    return {
      ...item,
      url: getDownloadUrl(fotoInfo),
      photoName: fotoInfo?.nombre_archivo || item.photoName,
      ruta_original: fotoInfo?.ruta_original
    };
  });
};

const validateRequest = (data) => {
  const { nombre, email, telefono, items, total } = data;
  
  if (!nombre || !email || !telefono || !items?.length || !total) {
    return {
      error: 'Datos incompletos en la solicitud',
      status: 400
    };
  }
  
  return null;
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { nombre, email, telefono, mensaje, items, total, orderId } = body;

    const validationError = validateRequest(body);
    if (validationError) {
      return NextResponse.json(
        { error: validationError.error },
        { status: validationError.status }
      );
    }

    // Obtener información de las fotos
    const photoIds = items.map(item => item.id);
    const { data: fotosData, error: fotosError } = await supabase
      .from('fotos')
      .select('id, ruta_original, url, url_original, precio')
      .in('id', photoIds);

    if (fotosError) {
      console.error('Error al obtener fotos:', fotosError);
      throw new Error('Error al obtener información de las fotos');
    }

    const itemsWithDownloadLinks = processCartItems(items, fotosData);

    // Guardar la orden en Supabase
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([{
        order_id: orderId,
        customer_name: nombre,
        customer_email: email,
        customer_phone: telefono,
        total_amount: total,
        status: 'pending',
        payment_status: 'unpaid',
        notes: mensaje,
        items: itemsWithDownloadLinks,
        photo_ids: photoIds
      }])
      .select();

    if (orderError) {
      console.error('Error al guardar orden:', orderError);
      throw new Error('Error al guardar la orden en la base de datos');
    }

    // Enviar correo de confirmación
    const photoList = itemsWithDownloadLinks.map(item => ({
      id: item.id,
      name: item.photoName,
      price: item.price,
      downloadLink: item.url
    }));

    const emailResult = await sendDownloadEmailNodemailer(
      email,
      nombre,
      orderId,
      photoList,
      total,
      false
    );

    if (!emailResult.success) {
      console.error('Error al enviar correo:', emailResult.error);
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