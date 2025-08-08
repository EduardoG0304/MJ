import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendDownloadEmailNodemailer } from '@/app/lib/nodemailer';
import mercadopago from 'mercadopago';

// Configura Mercado Pago
mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
});

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
      .select('id, ruta_original, url, url_original, precio, nombre_archivo')
      .in('id', photoIds);

    if (fotosError) {
      console.error('Error al obtener fotos:', fotosError);
      throw new Error('Error al obtener información de las fotos');
    }

    const itemsWithDownloadLinks = processCartItems(items, fotosData);

    // Crear preferencia de pago en Mercado Pago
    const preference = {
      items: items.map(item => ({
        title: item.photoName,
        description: `Foto de ${item.eventName}`,
        quantity: 1,
        unit_price: item.price,
      })),
      payer: {
        name: nombre,
        email: email,
        phone: {
          area_code: "",
          number: telefono
        }
      },
      external_reference: orderId,
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success`,
        failure: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/failure`,
        pending: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/pending`
      },
      auto_return: 'approved',
      notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/mercado-pago/webhook`,
    };

    const mpResponse = await mercadopago.preferences.create(preference);
    const initPoint = mpResponse.body.init_point;
    const preferenceId = mpResponse.body.id;

    // Guardar la orden en Supabase
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([{
        order_id: orderId,
        customer_name: nombre,
        customer_email: email,
        customer_phone: telefono,
        total_amount: total,
        status: 'pending_payment',
        payment_status: 'unpaid',
        payment_method: 'mercadopago',
        payment_preference_id: preferenceId,
        payment_url: initPoint,
        notes: mensaje,
        items: itemsWithDownloadLinks,
        photo_ids: photoIds
      }])
      .select();

    if (orderError) {
      console.error('Error al guardar orden:', orderError);
      throw new Error('Error al guardar la orden en la base de datos');
    }

    return NextResponse.json({ 
      success: true, 
      orderId,
      paymentUrl: initPoint,
      preferenceId,
      orderData: orderData[0]
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