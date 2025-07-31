// app/api/test-smtp/route.js
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function GET() {
  const testEmail = 'renegarciagarcia11@gmail.com'; // Email de prueba
  const testId = 'TEST-' + Math.random().toString(36).substring(2, 6).toUpperCase();

  // Validar configuración
  if (!process.env.HOSTINGER_EMAIL || !process.env.HOSTINGER_EMAIL_PASSWORD) {
    return NextResponse.json({
      status: 'error',
      message: 'Configuración SMTP no definida en variables de entorno',
      requiredVars: ['HOSTINGER_EMAIL', 'HOSTINGER_EMAIL_PASSWORD']
    }, { status: 500 });
  }

  try {
    // Crear transporter de nodemailer
    const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com',
  port: 465,
  secure: true, // SSL
  auth: {
    user: process.env.HOSTINGER_EMAIL,
    pass: process.env.HOSTINGER_EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false // Solo para testing, quitar en producción
  }
});

    // Enviar email de prueba
    const info = await transporter.sendMail({
      from: `"Test SMTP" <${process.env.HOSTINGER_EMAIL}>`,
      to: testEmail,
      subject: 'Prueba SMTP - ' + testId,
      text: `Este es un email de prueba (${testId})`,
      html: `<p>Este es un <strong>email de prueba</strong> (${testId})</p>`
    });

    return NextResponse.json({
      status: 'success',
      messageId: info.messageId,
      debug: {
        smtpServer: 'smtp.hostinger.com:465',
        authUser: process.env.HOSTINGER_EMAIL,
        // No exponer información sensible en producción
        configSet: !!process.env.HOSTINGER_EMAIL && !!process.env.HOSTINGER_EMAIL_PASSWORD
      }
    });

  } catch (error) {
    return NextResponse.json({
      status: 'smtp_error',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      debug: {
        smtpServer: 'smtp.hostinger.com:465',
        authUser: process.env.HOSTINGER_EMAIL
      }
    }, { status: 500 });
  }
}