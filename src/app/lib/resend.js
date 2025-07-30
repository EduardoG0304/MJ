import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendDownloadEmail(email, name, orderId, photos, total) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Fotos <fotos@tudominio.com>',
      to: email,
      subject: `Tu orden #${orderId} - Links de descarga`,
      html: generateEmailHtml(name, orderId, photos, total),
    });

    if (error) {
      console.error('Error al enviar correo:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Excepción al enviar correo:', err);
    return { success: false, error: err };
  }
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