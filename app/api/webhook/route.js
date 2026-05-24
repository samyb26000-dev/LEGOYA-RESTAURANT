import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isValidUUID } from '../../../lib/sanitize'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Signature manquante' }, { status: 400 })
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature error:', err.message)
    return NextResponse.json({ error: 'Signature invalide' }, { status: 400 })
  }

  // Vérifier que c'est bien un événement qu'on attend
  const allowedEvents = ['checkout.session.completed', 'checkout.session.expired', 'payment_intent.payment_failed']
  if (!allowedEvents.includes(event.type)) {
    return NextResponse.json({ received: true })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const reservationId = session.metadata?.reservation_id

    if (!reservationId || !isValidUUID(reservationId)) {
      console.error('Invalid reservation_id in webhook:', reservationId)
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 })
    }

    // Vérifier que la réservation existe avant de modifier
    const { data: existing } = await supabase
      .from('reservations')
      .select('id, paiement_statut')
      .eq('id', reservationId)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Reservation introuvable' }, { status: 404 })
    }

    // Idempotence : ne pas traiter si déjà payé
    if (existing.paiement_statut === 'paye') {
      return NextResponse.json({ received: true, already_processed: true })
    }

    const { error: updateError } = await supabase
      .from('reservations')
      .update({
        statut: 'confirme',
        paiement_statut: 'paye',
        stripe_session_id: session.id,
      })
      .eq('id', reservationId)

    if (updateError) {
      console.error('DB update error:', updateError)
      return NextResponse.json({ error: 'Erreur DB' }, { status: 500 })
    }

    const { error: payError } = await supabase
      .from('paiements')
      .insert([{
        reservation_id: reservationId,
        stripe_payment_id: session.payment_intent,
        montant: session.amount_total / 100,
        statut: 'paye',
        type: 'acompte',
      }])

    if (payError) console.error('Paiement insert error:', payError)

    // Log de l'action
    await supabase.from('audit_logs').insert([{
      action: 'payment_completed',
      table_name: 'reservations',
      record_id: reservationId,
      details: {
        stripe_session: session.id,
        montant: session.amount_total / 100,
        payment_intent: session.payment_intent,
      },
    }])
  }

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object
    const reservationId = session.metadata?.reservation_id
    if (reservationId && isValidUUID(reservationId)) {
      await supabase
        .from('reservations')
        .update({ paiement_statut: 'expire' })
        .eq('id', reservationId)
        .eq('paiement_statut', 'en_attente')
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const pi = event.data.object
    const reservationId = pi.metadata?.reservation_id
    if (reservationId && isValidUUID(reservationId)) {
      await supabase
        .from('reservations')
        .update({ paiement_statut: 'echec' })
        .eq('id', reservationId)
        .eq('paiement_statut', 'en_attente')

      await supabase.from('audit_logs').insert([{
        action: 'payment_failed',
        table_name: 'reservations',
        record_id: reservationId,
        details: { reason: pi.last_payment_error?.message },
      }])
    }
  }

  return NextResponse.json({ received: true })
}
