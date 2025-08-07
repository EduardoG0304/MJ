import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendDownloadEmailNodemailer } from '@/app/lib/nodemailer';
import Stripe from 'stripe';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  const sig = request.headers.get('stripe-signature');
  const body = await request.text();

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    
    try {
      // 1. Actualizar la orden en Supabase
      const { data: order, error } = await supabase
        .from('orders')
        .update({
          status: 'paid',
          payment_status: 'succeeded',
          paid_at: new Date().toISOString()
        })
        .eq('order_id', paymentIntent.metadata.orderId)
        .select()
        .single();

      if (error) throw error;

      // 2. Enviar email con links de descarga
      if (order) {
        await sendDownloadEmailNodemailer(
          order.customer_email,
          order.customer_name,
          order.order_id,
          order.items,
          order.total_amount,
          true // Enviar con links de descarga
        );
      }

    } catch (error) {
      console.error('Error procesando webhook:', error);
      return NextResponse.json({ error: 'Error procesando webhook' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}