import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request) {
  try {
    const { nombre, email, telefono, mensaje, items, total, orderId } = await request.json();

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

    if (orderError) throw orderError;

    // 2. Obtener las URLs de descarga de las fotos compradas
    const photoIds = items.map(item => item.id);
    const { data: photosData, error: photosError } = await supabase
      .from('fotos')
      .select('id, url, nombre as nombre_archivo, precio')
      .in('id', photoIds);

    if (photosError) throw photosError;

    // 3. Enviar correo con los links de descarga
    const emailResponse = await sendDownloadEmail(email, nombre, orderId, photosData, items);

    if (!emailResponse.ok) {
      console.error('Error sending email:', await emailResponse.text());
    }

    return NextResponse.json({ 
      success: true, 
      orderId,
      emailSent: emailResponse.ok
    });

  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Error processing order' },
      { status: 500 }
    );
  }
}

async function sendDownloadEmail(email, name, orderId, photosData, items) {
  // Crear la lista de fotos con sus links
  const photoList = items.map(item => {
    const photo = photosData.find(p => p.id === item.id);
    return {
      name: photo?.nombre_archivo || `Foto ${item.id}`,
      price: photo?.precio || item.price,
      downloadLink: photo?.url || '#'
    };
  });

  // Enviar el correo
  return fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
    },
    body: JSON.stringify({
      from: 'fotos@tudominio.com',
      to: email,
      subject: `Tu orden #${orderId} - Links de descarga`,
      html: generateEmailHtml(name, orderId, photoList, total)
    })
  });
}

function generateEmailHtml(name, orderId, photos, total) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f8f8; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .photo-item { margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #eee; }
        .download-btn { 
          display: inline-block; 
          background-color: #000; 
          color: #fff; 
          padding: 10px 20px; 
          text-decoration: none; 
          border-radius: 5px; 
          margin-top: 10px;
        }
        .footer { margin-top: 30px; font-size: 12px; color: #777; text-align: center; }
        .total { font-weight: bold; margin-top: 20px; font-size: 18px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>¡Gracias por tu compra, ${name}!</h1>
          <p>Orden #${orderId}</p>
        </div>
        
        <div class="content">
          <p>Aquí están los links de descarga para tus fotos:</p>
          
          ${photos.map(photo => `
            <div class="photo-item">
              <h3>${photo.name}</h3>
              <p><strong>Precio:</strong> $${photo.price.toFixed(2)}</p>
              <a href="${photo.downloadLink}" class="download-btn" target="_blank">Descargar foto</a>
            </div>
          `).join('')}
          
          <div class="total">
            <p>Total pagado: $${total.toFixed(2)}</p>
          </div>
          
          <p>Si tienes algún problema con las descargas, por favor contáctanos respondiendo a este correo.</p>
        </div>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} Tu Empresa de Fotografía. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}