import nodemailer from 'nodemailer';

// Configuración del transporter para Hostinger
const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.HOSTINGER_EMAIL,
    pass: process.env.HOSTINGER_EMAIL_PASSWORD
  }
});

export async function sendDownloadEmail(email, name, orderId, photos, total) {
  try {
    // Crear el contenido del correo basado en el número de fotos
    let photosContent;
    if (photos.length === 1) {
      // Si es solo una foto
      const photo = photos[0];
      photosContent = `
        <div style="margin-bottom: 20px; padding-bottom: 15px;">
          <h3 style="margin-top: 0;">${photo.name}</h3>
          <p style="margin: 5px 0;"><strong>Precio:</strong> $${photo.price.toFixed(2)}</p>
          <a href="${photo.downloadLink}" 
             style="display: inline-block; margin-top: 10px; padding: 10px 20px; 
                    background: #2563eb; color: #fff; text-decoration: none; 
                    border-radius: 4px; font-weight: bold;">
            Descargar foto
          </a>
          <p style="margin-top: 10px; color: #666; font-size: 14px;">
            Este enlace estará disponible por 30 días. Por favor descarga tu foto pronto.
          </p>
        </div>
      `;
    } else {
      // Si son múltiples fotos
      photosContent = photos.map(photo => `
        <div style="margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 15px;">
          <h3 style="margin-top: 0;">${photo.name}</h3>
          <p style="margin: 5px 0;"><strong>Precio:</strong> $${photo.price.toFixed(2)}</p>
          <a href="${photo.downloadLink}" 
             style="display: inline-block; margin-top: 10px; padding: 8px 15px; 
                    background: #2563eb; color: #fff; text-decoration: none; 
                    border-radius: 4px;">
            Descargar
          </a>
        </div>
      `).join('');
    }

    // Configuración del correo
    const mailOptions = {
      from: `"Tu Empresa de Fotografía" <${process.env.HOSTINGER_EMAIL}>`,
      to: email,
      subject: `📸 Descarga tus fotos - Pedido #${orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #111;">¡Hola ${name}!</h2>
          <p style="color: #555; line-height: 1.6;">
            Gracias por tu compra. Aquí tienes ${photos.length > 1 ? 'los enlaces para descargar tus fotos' : 'el enlace para descargar tu foto'}:
          </p>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #e2e8f0;">
            <h3 style="margin-top: 0; color: #111;">Pedido #${orderId}</h3>
            ${photosContent}
            
            <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
              <p style="font-weight: bold; font-size: 18px; margin: 0;">
                Total: $${total.toFixed(2)}
              </p>
            </div>
          </div>
          
          <p style="color: #555; line-height: 1.6;">
            Si tienes algún problema con la descarga, por favor responde a este correo y con gusto te ayudaremos.
          </p>
          
          <p style="color: #555; line-height: 1.6; margin-top: 30px;">
            ¡Gracias por elegirnos!<br>
            <strong>El equipo de Tu Empresa de Fotografía</strong>
          </p>
        </div>
      `
    };

    // Enviar el correo
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('Error al enviar correo:', error);
    return { success: false, error: error.message };
  }
}