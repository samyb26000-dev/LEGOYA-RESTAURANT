import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// ─── RATE LIMITER ─────────────────────────────────────────────────────────────
const rateLimitStore = new Map()

function rateLimit(key, maxRequests, windowMs) {
  const now = Date.now()
  const requests = rateLimitStore.get(key) || []
  const recent = requests.filter(t => now - t < windowMs)
  if (recent.length >= maxRequests) return false
  recent.push(now)
  rateLimitStore.set(key, recent)
  // Cleanup old entries periodically
  if (rateLimitStore.size > 10000) {
    for (const [k, v] of rateLimitStore.entries()) {
      if (v.every(t => now - t > windowMs)) rateLimitStore.delete(k)
    }
  }
  return true
}

// ─── SECURITY HEADERS ─────────────────────────────────────────────────────────
const SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(self)',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-DNS-Prefetch-Control': 'off',
  'X-Download-Options': 'noopen',
  'X-Permitted-Cross-Domain-Policies': 'none',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://unpkg.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://api.resend.com",
    "frame-src https://js.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
}

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────
export async function middleware(request) {
  const { pathname } = request.nextUrl
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown'
  const ua = request.headers.get('user-agent') || ''

  // ── Bloquer bots malveillants connus ──────────────────────────────────────
  const badBots = ['sqlmap', 'nikto', 'nmap', 'masscan', 'zgrab', 'dirbuster', 'hydra']
  if (badBots.some(bot => ua.toLowerCase().includes(bot))) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  // ── Bloquer tentatives de path traversal ──────────────────────────────────
  if (pathname.includes('..') || pathname.includes('%2e%2e') || pathname.includes('%252e')) {
    return new NextResponse('Bad Request', { status: 400 })
  }

  // ── Bloquer tentatives d injection SQL communes ───────────────────────────
  const suspiciousPatterns = /(\bunion\b|\bselect\b|\bdrop\b|\binsert\b|\bdelete\b|\bupdate\b.*\bset\b|\bexec\b|\bxp_\b)/i
  const urlString = request.url
  if (suspiciousPatterns.test(decodeURIComponent(urlString))) {
    return new NextResponse('Bad Request', { status: 400 })
  }

  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  // ── Appliquer tous les headers de sécurité ────────────────────────────────
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // ── Rate limiting global ──────────────────────────────────────────────────
  if (!rateLimit(`global_${ip}`, 200, 60000)) {
    return new NextResponse(JSON.stringify({ error: 'Too many requests' }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': '60',
        ...SECURITY_HEADERS,
      },
    })
  }

  // ── Rate limiting strict sur API sensibles ────────────────────────────────
  if (pathname === '/api/checkout') {
    if (!rateLimit(`checkout_${ip}`, 5, 60000)) {
      return new NextResponse(JSON.stringify({ error: 'Trop de tentatives. Attendez 1 minute.' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json', 'Retry-After': '60' },
      })
    }
  }

  // ── Protection de la route /admin avec vérification session Supabase ──────
  if (pathname.startsWith('/admin')) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() { return request.cookies.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value)
              response.cookies.set(name, value, {
                ...options,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
              })
            })
          },
        },
      }
    )

    const { data: { session }, error } = await supabase.auth.getSession()

    // Si pas de session et pas déjà sur la page login admin
    if (!session && pathname !== '/admin') {
      const redirectUrl = new URL('/admin', request.url)
      redirectUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Si session existe, vérifier que l'email est bien dans la table admins
    if (session && pathname !== '/admin') {
      const { data: admin, error: adminError } = await supabase
        .from('admins')
        .select('id, role, actif')
        .eq('email', session.user.email)
        .eq('actif', true)
        .single()

      if (!admin || adminError) {
        // Utilisateur authentifié mais pas dans la table admins → déconnexion forcée
        await supabase.auth.signOut()
        return NextResponse.redirect(new URL('/admin', request.url))
      }

      // Ajouter le rôle dans les headers pour les composants serveur
      response.headers.set('x-admin-role', admin.role || 'sous_admin')
    }

    // Rate limiting très strict sur /admin
    if (!rateLimit(`admin_${ip}`, 50, 60000)) {
      return new NextResponse('Too Many Requests', { status: 429 })
    }
  }

  // ── Forcer HTTPS en production ────────────────────────────────────────────
  if (process.env.NODE_ENV === 'production' && request.headers.get('x-forwarded-proto') === 'http') {
    return NextResponse.redirect(`https://${request.headers.get('host')}${pathname}`, { status: 301 })
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logo.PNG|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.ico).*)',
  ],
}
