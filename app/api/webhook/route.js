import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const reservationId = session.metadata?.reservation_id

    if (reservationId) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      )

      await supabase.from('reservations').update({
        statut: 'confirme',
        paiement_statut: 'paye',
        stripe_session_id: session.id,
      }).eq('id', reservationId)

      await supabase.from('paiements').insert([{
        reservation_id: reservationId,
        stripe_payment_id: session.payment_intent,
        montant: session.amount_total / 100,
        statut: 'paye',
        type: 'acompte',
      }])
    }
  }

  return NextResponse.json({ received: true })
}
