import Stripe from 'stripe'
import { NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(request) {
  try {
    const body = await request.json()
    const { reservationId, montant, menu, prenom, nom, email, date, heure } = body

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Acompte — ${menu}`,
            description: `Reservation Le Goya · ${date} a ${heure}`,
          },
          unit_amount: Math.round(montant * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?reservation_id=${reservationId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}`,
      customer_email: email,
      metadata: { reservation_id: reservationId, prenom, nom },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
