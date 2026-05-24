import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(request) {
  try {
    const { reservationId, force } = await request.json()
    if (!reservationId) return NextResponse.json({ error: 'ID manquant' }, { status: 400 })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data: res } = await supabase
      .from('reservations')
      .select('*, paiements(*)')
      .eq('id', reservationId)
      .single()

    if (!res) return NextResponse.json({ error: 'Reservation introuvable' }, { status: 404 })

    // Vérification règle 48h (sauf si force=true pour override admin)
    if (!force) {
      const reservationDateTime = new Date(`${res.date}T${res.heure}:00`)
      const now = new Date()
      const heuresRestantes = (reservationDateTime - now) / (1000 * 60 * 60)
      if (heuresRestantes < 48) {
        return NextResponse.json({
          error: `Annulation trop tardive (${Math.round(heuresRestantes)}h avant). L acompte est non remboursable selon les CGV.`,
          heuresRestantes: Math.round(heuresRestantes),
          refundable: false,
        }, { status: 400 })
      }
    }

    const payment = res.paiements?.[0]
    if (!payment || payment.statut !== 'paye') {
      return NextResponse.json({ error: 'Aucun paiement a rembourser' }, { status: 400 })
    }

    if (!payment.stripe_payment_id) {
      return NextResponse.json({ error: 'ID paiement Stripe manquant' }, { status: 400 })
    }

    // Remboursement Stripe
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripe_payment_id,
      reason: 'requested_by_customer',
    })

    // Mise à jour DB
    await supabase.from('paiements')
      .update({ statut: 'rembourse' })
      .eq('id', payment.id)

    await supabase.from('reservations')
      .update({ statut: 'annule', paiement_statut: 'rembourse' })
      .eq('id', reservationId)

    await supabase.from('audit_logs').insert([{
      action: 'refund_processed',
      table_name: 'reservations',
      record_id: reservationId,
      details: { refund_id: refund.id, montant: payment.montant, force: !!force },
    }])

    return NextResponse.json({ success: true, montant: payment.montant, refund_id: refund.id })
  } catch (error) {
    console.error('Refund error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
