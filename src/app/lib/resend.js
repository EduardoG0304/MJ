import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendDownloadEmail(email, name, orderId, photos, total) {
  try {
    // Validar datos de entrada
    if (!email || !name || !orderId || !photos?.length) {
      throw new Error('Datos incompletos para enviar el correo');
    }

    // Crear contenido del correo
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_EMAIL_FROM || 'fotos@tudominio.com',
      to: email,
      subject: `Descarga tus fotos - Orden #${orderId}`,
      html: generateEmailHtml(name, orderId, photos, total),
      text: generateTextEmail(name, orderId, photos, total)
    });

    if (error) {
      console.error('Error de Resend:', error);
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error al enviar correo:', error);
    return { 
      success: false, 
      error: error.message || 'Error al enviar el correo' 
    };
  }
}

function generateEmailHtml(name, orderId, photos, total) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .photo-item { margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #eee; }
        .download-btn { 
          display: inline-block; 
          background-color: #2563eb; 
          color: white; 
          padding: 10px 20px; 
          text-decoration: none; 
          border-radius: 5px; 
          margin-top: 10px; 
        }
        .footer { margin-top: 30px; font-size: 12px; color: #777; text-align: center; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>¡Gracias por tu compra, ${name}!</h1>
        <p>Orden #${orderId}</p>
      </div>
      
      <div>
        <p>Aquí están tus fotos disponibles para descargar:</p>
        
        ${photos.map(photo => `
          <div class="photo-item">
            <h3>${photo.photoName}</h3>
            <p><strong>Evento:</strong> ${photo.eventName}</p>
            <p><strong>Precio:</strong> $${photo.price.toFixed(2)}</p>
            <a href="${photo.url}" class="download-btn" target="_blank">Descargar foto</a>
          </div>
        `).join('')}
        
        <p style="font-weight: bold; margin-top: 20px;">
          Total pagado: $${total.toFixed(2)}
        </p>
      </div>
      
      <div class="footer">
        <p>© ${new Date().getFullYear()} Tu Empresa de Fotografía. Todos los derechos reservados.</p>
      </div>
    </body>
    </html>
  `;
}

function generateTextEmail(name, orderId, photos, total) {
  let text = `¡Gracias por tu compra, ${name}!\n\n`;
  text += `Orden #${orderId}\n\n`;
  text += `Tus fotos:\n\n`;
  
  photos.forEach(photo => {
    text += `${photo.photoName}\n`;
    text += `Evento: ${photo.eventName}\n`;
    text += `Precio: $${photo.price.toFixed(2)}\n`;
    text += `Descargar: ${photo.url}\n\n`;
  });
  
  text += `Total pagado: $${total.toFixed(2)}\n\n`;
  text += `© ${new Date().getFullYear()} Tu Empresa de Fotografía`;
  
  return text;
}