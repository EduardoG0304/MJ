// Reemplaza tu archivo resend.js con esta configuración depuradora
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.HOSTINGER_EMAIL, // Asegúrate que sea email COMPLETO (ej: info@tudominio.com)
    pass: process.env.HOSTINGER_EMAIL_PASSWORD // Contraseña ESPECÍFICA para SMTP
  },
  logger: true, // Habilita logs detallados
  debug: true   // Muestra información de depuración
});

export async function sendDownloadEmail(email, name, orderId, photos, total) {
  try {
    // Test de conexión SMTP primero
    await transporter.verify();
    console.log('✔ Conexión SMTP verificada');

    const mailOptions = {
      from: `"${name}" <${process.env.HOSTINGER_EMAIL}>`,
      to: email,
      subject: `📸 Descarga tus fotos (Pedido #${orderId})`,
      html: `<p>Prueba de envío exitosa</p>`
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('❌ Error SMTP completo:', {
      code: error.responseCode,
      response: error.response,
      stack: error.stack
    });
    return { success: false, error: error.message };
  }
}