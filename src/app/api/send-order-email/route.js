// app/api/send-order-email/route.js
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: process.env.EMAIL_SERVER_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export async function POST(request) {
  try {
    const { email, customerName, items, orderId, total } = await request.json();

    // Validación del email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: 'Email no válido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Obtener fotos de Supabase
    const photoIds = items.map(item => item.id);
    const { data: photos, error } = await supabase
      .from('romitor')
      .select('ruts_original, eventName, photoName')
      .in('romitor_id', photoIds);

    if (error) throw error;

    // Crear contenido del email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">¡Hola ${customerName || 'cliente'}!</h1>
        <p>Tu pedido <strong>#${orderId}</strong> ha sido procesado.</p>
        ${photos.map(photo => `
          <div style="margin-bottom: 20px;">
            <h3>${photo.eventName} - ${photo.photoName}</h3>
            <a href="${photo.ruts_original}" style="color: #2563eb;">Descargar</a>
          </div>
        `).join('')}
      </div>
    `;

    // Enviar email
    await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: `Descarga de fotos - Pedido #${orderId}`,
      html: emailHtml,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Opcional: Manejar métodos no permitidos
export async function GET() {
  return new Response(JSON.stringify({ error: 'Método no permitido' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' },
  });
}