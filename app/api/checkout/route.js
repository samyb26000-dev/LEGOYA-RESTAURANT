import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  sanitizeText, sanitizeEmail, sanitizePhone,
  sanitizeDate, sanitizeTime, sanitizeAmount,
  isValidEmail, isValidFrenchPhone, isValidUUID
} from '../../../lib/sanitize'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const VALID_MENUS = {
  'Menu Classique': 25,
  'Menu Prestige': 40,
  'Menu Degustation': 55,
}

export async function POST(request) {
  try {
    // ── Parse body ─────────────────────────────────────────────────────────
    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Corps de requete invalide' }, { status: 400 })
    }

    const { reservationId, montant, menu, prenom, nom, email, date, heure } = body

    // ── Validation stricte ─────────────────────────────────────────────────
    const errors = []

    if (!isValidUUID(reservationId)) errors.push('ID reservation invalide')
    if (!menu || !VALID_MENUS[menu]) errors.push('Menu invalide')
    if (!isValidEmail(email)) errors.push('Email invalide')
    if (!sanitizeDate(date)) errors.push('Date invalide')
    if (!sanitizeTime(heure)) errors.push('Heure invalide')
    if (!prenom || prenom.trim().length < 2) errors.push('Prenom invalide')

    // Vérifier que le montant correspond au menu (pas de manipulation côté client)
    const expectedMontant = VALID_MENUS[menu]
    if (!expectedMontant || Math.abs(montant - expectedMontant) > 0.01) {
      errors.push('Montant ne correspond pas au menu selectionne')
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join(', ') }, { status: 400 })
    }

    // ── Vérifier que la réservation existe en DB ───────────────────────────
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data: reservation, error: dbError } = await supabase
      .from('reservations')
      .select('id, statut, paiement_statut, email')
      .eq('id', sanitizeText(reservationId))
      .single()

    if (dbError || !reservation) {
      return NextResponse.json({ error: 'Reservation introuvable' }, { status: 404 })
    }

    // Empêcher le double paiement
    if (reservation.paiement_statut === 'paye') {
      return NextResponse.json({ error: 'Cette reservation a deja ete payee' }, { status: 400 })
    }

    // Vérifier que l'email correspond (anti-manipulation)
    if (reservation.email.toLowerCase() !== email.toLowerCase().trim()) {
      return NextResponse.json({ error: 'Donnees invalides' }, { status: 400 })
    }

    // ── Créer la session Stripe ────────────────────────────────────────────
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Acompte — ${sanitizeText(menu)}`,
            description: `Reservation Le Goya · ${sanitizeDate(date)} a ${sanitizeTime(heure)}`,
          },
          unit_amount: Math.round(expectedMontant * 100), // Utiliser le montant DB, pas celui du client
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?reservation_id=${encodeURIComponent(reservationId)}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}`,
      customer_email: sanitizeEmail(email),
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // Expire dans 30 min
      metadata: {
        reservation_id: sanitizeText(reservationId),
        prenom: sanitizeText(prenom),
        nom: sanitizeText(nom || ''),
      },
      payment_intent_data: {
        description: `Le Goya — Reservation ${sanitizeDate(date)} ${sanitizeTime(heure)}`,
        metadata: {
          reservation_id: reservationId,
        },
      },
    })

    // ── Log de l'action ────────────────────────────────────────────────────
    await supabase.from('audit_logs').insert([{
      action: 'checkout_created',
      table_name: 'reservations',
      record_id: reservationId,
      details: { menu, montant: expectedMontant, stripe_session: session.id },
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
    }])

    return NextResponse.json({ url: session.url })

  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
