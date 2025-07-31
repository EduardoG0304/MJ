import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export async function sendDownloadEmailNodemailer(email, customerName, orderId, photoList, total) {
  try {
    // Crear lista de fotos para el email
    const photoItems = photoList.map(photo => `
      <li style="margin-bottom: 10px;">
        <strong>${photo.name}</strong><br>
        Precio: $${photo.price.toFixed(2)}<br>
        <a href="${photo.downloadLink}" style="color: #2563eb; text-decoration: underline;">
          Descargar foto
        </a>
      </li>
    `).join('');

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_SERVER_USER}>`,
      to: email,
      subject: `Confirmación de pedido #${orderId} - MJ Sport Photography`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #111827;">¡Gracias por tu compra, ${customerName}!</h2>
          <p style="color: #374151;">Aquí tienes los detalles de tu pedido:</p>
          
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #111827; margin-top: 0;">Pedido #${orderId}</h3>
            <ul style="padding-left: 20px; list-style-type: none;">
              ${photoItems}
            </ul>
            <p style="font-weight: bold; color: #111827; margin-top: 15px;">
              Total: $${total.toFixed(2)}
            </p>
          </div>
          
          <p style="color: #374151;">
            Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos respondiendo a este correo.
          </p>
          
          <p style="color: #374151; margin-top: 30px;">
            Atentamente,<br>
            <strong>MJ Sport Photography</strong>
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error al enviar correo con Nodemailer:', error);
    return { success: false, error: error.message };
  }
}