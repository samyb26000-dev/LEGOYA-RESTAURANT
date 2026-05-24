// ─── SANITISATION ET VALIDATION ───────────────────────────────────────────────

// Supprimer les caractères dangereux HTML/XSS
export function sanitizeText(input) {
  if (!input || typeof input !== 'string') return ''
  return input
    .trim()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/\\/g, '&#x5C;')
    .replace(/`/g, '&#96;')
    .slice(0, 1000) // Limiter la longueur
}

// Sanitiser spécifiquement les emails
export function sanitizeEmail(email) {
  if (!email || typeof email !== 'string') return ''
  return email.trim().toLowerCase().slice(0, 254)
}

// Sanitiser les numéros de téléphone (garder seulement chiffres, +, espace, tiret)
export function sanitizePhone(phone) {
  if (!phone || typeof phone !== 'string') return ''
  return phone.trim().replace(/[^0-9+\s\-().]/g, '').slice(0, 20)
}

// Sanitiser les nombres
export function sanitizeNumber(num, min = 1, max = 9999) {
  const n = parseInt(num)
  if (isNaN(n)) return min
  return Math.min(Math.max(n, min), max)
}

// Sanitiser une date (format YYYY-MM-DD)
export function sanitizeDate(date) {
  if (!date || typeof date !== 'string') return null
  const clean = date.trim().replace(/[^0-9-]/g, '')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(clean)) return null
  const d = new Date(clean)
  if (isNaN(d.getTime())) return null
  // Pas de réservation dans le passé (plus d'1 jour)
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1)
  if (d < yesterday) return null
  // Pas plus de 2 ans dans le futur
  const maxDate = new Date(); maxDate.setFullYear(maxDate.getFullYear() + 2)
  if (d > maxDate) return null
  return clean
}

// Sanitiser les heures (format HH:MM)
export function sanitizeTime(time) {
  if (!time || typeof time !== 'string') return null
  const valid = ['12:00','12:30','13:00','19:00','19:30','20:00','20:30','21:00']
  return valid.includes(time) ? time : null
}

// Sanitiser le montant (nombre positif raisonnable)
export function sanitizeAmount(amount) {
  const n = parseFloat(amount)
  if (isNaN(n) || n <= 0 || n > 500) return null
  return Math.round(n * 100) / 100
}

// Valider un email
export function isValidEmail(email) {
  return /^[^\s@]{1,64}@[^\s@]{1,253}\.[^\s@]{2,}$/.test(email?.trim() || '')
}

// Valider un telephone français
export function isValidFrenchPhone(phone) {
  return /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/.test(phone?.trim() || '')
}

// Valider un UUID
export function isValidUUID(uuid) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid || '')
}

// Sanitiser un objet entier (sanitise toutes les valeurs string)
export function sanitizeObject(obj) {
  const clean = {}
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') clean[key] = sanitizeText(value)
    else if (typeof value === 'number') clean[key] = value
    else if (typeof value === 'boolean') clean[key] = value
    else if (value === null || value === undefined) clean[key] = value
    else clean[key] = sanitizeText(String(value))
  }
  return clean
}
