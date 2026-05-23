"use client"
import { useState, useEffect, useRef, useCallback } from "react"

function GoldParticles() {
  const ref = useRef(null)
  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext("2d")
    let W = (canvas.width = window.innerWidth)
    let H = (canvas.height = window.innerHeight)
    const pts = Array.from({ length: 80 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.5 + 0.3,
      dx: (Math.random() - 0.5) * 0.25,
      dy: -Math.random() * 0.4 - 0.05,
      pulse: Math.random() * Math.PI * 2,
    }))
    let raf
    function draw() {
      ctx.clearRect(0, 0, W, H)
      pts.forEach(p => {
        p.pulse += 0.018; p.x += p.dx; p.y += p.dy
        if (p.y < -5) p.y = H + 5
        if (p.x < -5) p.x = W + 5
        if (p.x > W + 5) p.x = -5
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(201,168,76,${0.12 + Math.sin(p.pulse) * 0.12})`
        ctx.fill()
      })
      raf = requestAnimationFrame(draw)
    }
    draw()
    const r = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight }
    window.addEventListener("resize", r)
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", r) }
  }, [])
  return <canvas ref={ref} style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none", opacity:0.65 }} />
}

function Logo({ size = 60 }) {
  return (
    <div style={{ position:"relative", width:size, height:size, display:"inline-flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      <img src="/logo.png" alt="Le Goya"
        style={{ width:size, height:size, objectFit:"contain", position:"absolute", top:0, left:0 }} />
      <div style={{
        position:"absolute", top:"42%", left:"50%",
        width:size*0.22, height:size*0.22,
        borderRadius:"50%",
        border:"1.5px solid rgba(201,168,76,0.65)",
        animation:"spinO 3s linear infinite",
        pointerEvents:"none",
      }} />
    </div>
  )
}

function Divider() {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:16, margin:"0 auto", maxWidth:240, padding:"8px 0" }}>
      <div style={{ flex:1, height:1, background:"rgba(201,168,76,0.3)" }} />
      <span style={{ color:"#C9A84C", fontSize:14 }}>✦</span>
      <div style={{ flex:1, height:1, background:"rgba(201,168,76,0.3)" }} />
    </div>
  )
}

function SectionHeader({ label, title, subtitle }) {
  return (
    <div style={{ textAlign:"center", marginBottom:60 }}>
      <p style={{ fontSize:10, letterSpacing:5, color:"#C9A84C", textTransform:"uppercase", marginBottom:20 }}>{label}</p>
      <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(34px,5vw,58px)", fontWeight:300, color:"#F5F0E8", marginBottom:20, lineHeight:1.1 }}>{title}</h2>
      <Divider />
      {subtitle && <p style={{ marginTop:24, fontSize:13, color:"rgba(245,240,232,0.5)", maxWidth:480, margin:"24px auto 0", lineHeight:1.9 }}>{subtitle}</p>}
    </div>
  )
}

const NAV = [
  { k:"accueil", l:"Accueil" },
  { k:"menu", l:"Menu" },
  { k:"evenements", l:"Événements" },
  { k:"reservation", l:"Réserver" },
]

function Nav({ section, setSection }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", fn)
    return () => window.removeEventListener("scroll", fn)
  }, [])
  return (
    <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:100,
      padding: scrolled ? "10px 28px" : "18px 28px",
      background: scrolled ? "rgba(8,6,4,0.95)" : "transparent",
      backdropFilter: scrolled ? "blur(14px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(201,168,76,0.15)" : "none",
      display:"flex", alignItems:"center", justifyContent:"space-between",
      transition:"all .4s" }}>
      <button onClick={() => { setSection("accueil"); setOpen(false) }}
        style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:10 }}>
        <Logo size={40} />
        <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:17, fontWeight:300, letterSpacing:5, color:"#C9A84C", textTransform:"uppercase" }}>Le Goya</span>
      </button>
      <div className="nav-desktop" style={{ gap:28 }}>
        {NAV.map(({ k, l }) => (
          <button key={k} onClick={() => setSection(k)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:10, letterSpacing:3, color: section===k ? "#C9A84C" : "rgba(245,240,232,0.65)", textTransform:"uppercase", borderBottom: section===k ? "1px solid #C9A84C" : "1px solid transparent", paddingBottom:3, transition:"all .3s" }}>{l}</button>
        ))}
      </div>
      <button className="nav-burger" onClick={() => setOpen(!open)}
        style={{ background:"none", border:"none", cursor:"pointer", flexDirection:"column", gap:5, padding:4 }}>
        {[0,1,2].map(i => (
          <span key={i} style={{ display:"block", width:24, height:1, background:"#C9A84C",
            transform: open ? (i===0?"rotate(45deg) translateY(6px)":i===1?"scaleX(0)":"rotate(-45deg) translateY(-6px)") : "none",
            transition:"all .3s" }} />
        ))}
      </button>
      {open && (
        <div style={{ position:"absolute", top:"100%", left:0, right:0, background:"rgba(8,6,4,0.98)", backdropFilter:"blur(20px)", borderBottom:"1px solid rgba(201,168,76,0.2)", display:"flex", flexDirection:"column", padding:"24px 28px 32px", gap:18 }}>
          {NAV.map(({ k, l }) => (
            <button key={k} onClick={() => { setSection(k); setOpen(false) }}
              style={{ background:"none", border:"none", cursor:"pointer", textAlign:"left", fontFamily:"'Cormorant Garamond',serif", fontSize:28, fontWeight:300, letterSpacing:2, color: section===k ? "#C9A84C" : "#F5F0E8" }}>{l}</button>
          ))}
        </div>
      )}
    </nav>
  )
}

function Hero({ setSection }) {
  const [v, setV] = useState(false)
  useEffect(() => { setTimeout(() => setV(true), 100) }, [])
  return (
    <section style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden", padding:"0 24px" }}>
      <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 80% 60% at 50% 50%,rgba(139,26,26,0.15) 0%,transparent 70%)" }} />
      <div style={{ position:"absolute", top:"50%", left:"8%", right:"8%", height:1, background:"linear-gradient(90deg,transparent,rgba(201,168,76,0.25),transparent)", transform:"translateY(-140px)" }} />
      <div style={{ position:"absolute", top:"50%", left:"8%", right:"8%", height:1, background:"linear-gradient(90deg,transparent,rgba(201,168,76,0.25),transparent)", transform:"translateY(140px)" }} />
      <div style={{ textAlign:"center", position:"relative", zIndex:2, opacity: v?1:0, transition:"opacity 1.2s ease" }}>
        <div style={{ marginBottom:28, display:"flex", justifyContent:"center", animation:"float 4s ease-in-out infinite" }}>
          <Logo size={120} />
        </div>
        <p style={{ fontSize:10, letterSpacing:6, color:"#C9A84C", textTransform:"uppercase", marginBottom:16 }}>Restaurant Gastronomique</p>
        <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(52px,10vw,108px)", fontWeight:300, lineHeight:1, color:"#F5F0E8", letterSpacing:8, marginBottom:36 }}>Le Goya</h1>
        <div style={{ display:"flex", alignItems:"center", gap:16, justifyContent:"center", marginBottom:36 }}>
          <div style={{ flex:1, maxWidth:100, height:1, background:"rgba(201,168,76,0.3)" }} />
          <span style={{ color:"#C9A84C" }}>✦</span>
          <div style={{ flex:1, maxWidth:100, height:1, background:"rgba(201,168,76,0.3)" }} />
        </div>
        <p style={{ fontSize:13, color:"rgba(245,240,232,0.55)", lineHeight:1.9, maxWidth:360, margin:"0 auto 44px" }}>
          Une table d'exception.<br />Chaque plat, une signature.<br />Chaque moment, un souvenir.
        </p>
        <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
          <button onClick={() => setSection("reservation")}
            style={{ padding:"14px 34px", background:"transparent", border:"1px solid #C9A84C", color:"#C9A84C", fontSize:10, letterSpacing:4, textTransform:"uppercase", transition:"all .4s" }}
            onMouseEnter={e => { e.currentTarget.style.background="#C9A84C"; e.currentTarget.style.color="#080604" }}
            onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#C9A84C" }}>
            Réserver une table
          </button>
          <button onClick={() => setSection("menu")}
            style={{ padding:"14px 34px", background:"transparent", border:"1px solid rgba(245,240,232,0.2)", color:"rgba(245,240,232,0.6)", fontSize:10, letterSpacing:4, textTransform:"uppercase", transition:"all .4s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor="rgba(245,240,232,0.55)"; e.currentTarget.style.color="#F5F0E8" }}
            onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(245,240,232,0.2)"; e.currentTarget.style.color="rgba(245,240,232,0.6)" }}>
            Voir le menu
          </button>
        </div>
      </div>
    </section>
  )
}

const ITEMS = [
  { cat:"Entrées", name:"Foie Gras Poêlé", desc:"Chutney de figues, brioche toastée, réduction de Porto", prix:"28€", e:"🍞" },
  { cat:"Entrées", name:"Tartare de Saint-Jacques", desc:"Agrumes, caviar de truite, huile de truffe blanche", prix:"32€", e:"🐚" },
  { cat:"Entrées", name:"Velouté de Champignons", desc:"Truffe noire, crème fouettée, huile de noisette", prix:"22€", e:"🍄" },
  { cat:"Plats", name:"Filet de Bœuf Rossini", desc:"Médaillon de foie gras, sauce Périgueux, légumes de saison", prix:"58€", e:"🥩" },
  { cat:"Plats", name:"Homard Bleu Rôti", desc:"Beurre de corail, gnocchi de pomme de terre, bisque légère", prix:"72€", e:"🦞" },
  { cat:"Plats", name:"Pigeon en Croûte d'Herbes", desc:"Jus de gibier, purée de céleri, cèpes sautés", prix:"48€", e:"🌿" },
  { cat:"Desserts", name:"Soufflé au Grand Marnier", desc:"Crème anglaise à la vanille Bourbon", prix:"18€", e:"🍊" },
  { cat:"Desserts", name:"Tarte Fine au Chocolat", desc:"Caramel salé, glace praliné, feuille d'or", prix:"16€", e:"🍫" },
  { cat:"Desserts", name:"Mille-Feuille Revisité", desc:"Crème légère vanille, caramel beurre salé, framboises", prix:"15€", e:"🍰" },
]

function MenuPage() {
  const [cat, setCat] = useState("Tous")
  const [sel, setSel] = useState(null)
  const filtered = cat === "Tous" ? ITEMS : ITEMS.filter(i => i.cat === cat)
  return (
    <section style={{ minHeight:"100vh", padding:"100px 20px 80px", position:"relative", zIndex:2 }}>
      <SectionHeader label="Notre Carte" title="Le Menu" subtitle="Des produits d'exception, sublimés par le Chef." />
      <div style={{ display:"flex", justifyContent:"center", gap:8, marginBottom:44, flexWrap:"wrap" }}>
        {["Tous","Entrées","Plats","Desserts"].map(c => (
          <button key={c} onClick={() => setCat(c)} style={{ padding:"9px 18px", background: cat===c?"#C9A84C":"transparent", border:"1px solid", borderColor: cat===c?"#C9A84C":"rgba(201,168,76,0.3)", color: cat===c?"#080604":"rgba(245,240,232,0.6)", fontSize:10, letterSpacing:3, textTransform:"uppercase", transition:"all .3s" }}>{c}</button>
        ))}
      </div>
      <div style={{ maxWidth:960, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))", gap:2 }}>
        {filtered.map((item, i) => (
          <div key={i} onClick={() => setSel(item)}
            style={{ padding:"32px 26px", cursor:"pointer", background:"rgba(245,240,232,0.02)", border:"1px solid rgba(201,168,76,0.08)", transition:"all .4s" }}
            onMouseEnter={e => { e.currentTarget.style.background="rgba(201,168,76,0.06)"; e.currentTarget.style.borderColor="rgba(201,168,76,0.25)" }}
            onMouseLeave={e => { e.currentTarget.style.background="rgba(245,240,232,0.02)"; e.currentTarget.style.borderColor="rgba(201,168,76,0.08)" }}>
            <div style={{ fontSize:28, marginBottom:12 }}>{item.e}</div>
            <p style={{ fontSize:9, letterSpacing:3, color:"#C9A84C", textTransform:"uppercase", marginBottom:8 }}>{item.cat}</p>
            <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, fontWeight:400, color:"#F5F0E8", marginBottom:10 }}>{item.name}</h3>
            <p style={{ fontSize:12, lineHeight:1.7, color:"rgba(245,240,232,0.45)", marginBottom:14 }}>{item.desc}</p>
            <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:19, color:"#C9A84C", fontStyle:"italic" }}>{item.prix}</p>
          </div>
        ))}
      </div>
      {sel && (
        <div onClick={() => setSel(null)} style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(8,6,4,0.93)", backdropFilter:"blur(16px)", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
          <div onClick={e => e.stopPropagation()} style={{ maxWidth:420, width:"100%", padding:"44px 36px", border:"1px solid rgba(201,168,76,0.3)", background:"rgba(12,10,8,0.97)", textAlign:"center" }}>
            <div style={{ fontSize:50, marginBottom:18 }}>{sel.e}</div>
            <p style={{ fontSize:9, letterSpacing:4, color:"#C9A84C", textTransform:"uppercase", marginBottom:12 }}>{sel.cat}</p>
            <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:30, fontWeight:300, color:"#F5F0E8", marginBottom:16 }}>{sel.name}</h3>
            <Divider />
            <p style={{ marginTop:18, fontSize:14, lineHeight:1.9, color:"rgba(245,240,232,0.6)" }}>{sel.desc}</p>
            <p style={{ marginTop:22, fontFamily:"'Cormorant Garamond',serif", fontSize:26, color:"#C9A84C", fontStyle:"italic" }}>{sel.prix}</p>
            <button onClick={() => setSel(null)} style={{ marginTop:26, padding:"11px 26px", background:"transparent", border:"1px solid rgba(201,168,76,0.35)", color:"rgba(245,240,232,0.5)", fontSize:10, letterSpacing:3, textTransform:"uppercase" }}>Fermer</button>
          </div>
        </div>
      )}
    </section>
  )
}

const EVT = [
  { t:"Soirée Privée", d:"Privatisez notre salle pour une occasion unique. Service dédié, menu sur mesure.", i:"🥂", s:"Jusqu'à 40 couverts · Devis personnalisé" },
  { t:"Mariage & Fiançailles", d:"Nous concevons l'expérience culinaire de vos noces avec une attention absolue.", i:"💍", s:"Buffet ou service à table · Coordination complète" },
  { t:"Anniversaire Prestige", d:"Célébrez chaque étape dans un écrin d'excellence. Menu dégustation exclusif.", i:"✨", s:"À partir de 8 personnes · Gâteau inclus" },
  { t:"Séminaire & Business", d:"Impressionnez vos clients autour d'un déjeuner gastronomique d'affaires.", i:"🤝", s:"Salons privatifs · Audiovisuel disponible" },
]

function EventsPage() {
  return (
    <section style={{ minHeight:"100vh", padding:"100px 20px 80px", position:"relative", zIndex:2 }}>
      <SectionHeader label="Célébrations" title="Événements Privés" subtitle="Votre événement mérite un cadre d'exception." />
      <div style={{ maxWidth:920, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))", gap:1, background:"rgba(201,168,76,0.08)" }}>
        {EVT.map((ev, i) => (
          <div key={i} style={{ padding:"40px 32px", background:"#080604", transition:"background .4s" }}
            onMouseEnter={e => e.currentTarget.style.background="rgba(201,168,76,0.04)"}
            onMouseLeave={e => e.currentTarget.style.background="#080604"}>
            <div style={{ fontSize:36, marginBottom:20 }}>{ev.i}</div>
            <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:24, fontWeight:400, color:"#F5F0E8", marginBottom:12 }}>{ev.t}</h3>
            <p style={{ fontSize:13, lineHeight:1.8, color:"rgba(245,240,232,0.5)", marginBottom:18 }}>{ev.d}</p>
            <p style={{ fontSize:10, letterSpacing:2, color:"#C9A84C", textTransform:"uppercase" }}>{ev.s}</p>
          </div>
        ))}
      </div>
      <div style={{ textAlign:"center", marginTop:52 }}>
        <a href="mailto:contact@legoya.fr" style={{ display:"inline-block", padding:"14px 40px", border:"1px solid #C9A84C", color:"#C9A84C", fontSize:10, letterSpacing:4, textTransform:"uppercase", textDecoration:"none" }}>Nous contacter</a>
      </div>
    </section>
  )
}

const MENUS_R = [
  { id:"classique", label:"Menu Classique", prix:"85€ / pers", acompte:"25€" },
  { id:"prestige",  label:"Menu Prestige",  prix:"135€ / pers", acompte:"40€" },
  { id:"degustation", label:"Menu Dégustation", prix:"175€ / pers", acompte:"55€" },
]
const TIMES_R = ["12:00","12:30","13:00","19:00","19:30","20:00","20:30","21:00"]

function ReservationPage() {
  const [step, setStep]   = useState(1)
  const [paid, setPaid]   = useState(false)
  const [sending, setSending] = useState(false)
  const [form, setForm]   = useState({ date:"", time:"", guests:"2", firstName:"", lastName:"", email:"", phone:"", notes:"", menu:"classique" })
  const up  = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const sm  = MENUS_R.find(m => m.id === form.menu)
  const iS  = { width:"100%", padding:"12px 14px", background:"rgba(245,240,232,0.04)", border:"1px solid rgba(201,168,76,0.2)", color:"#F5F0E8", fontSize:13, outline:"none" }
  const lS  = { fontSize:10, letterSpacing:3, color:"#C9A84C", textTransform:"uppercase", display:"block", marginBottom:8 }
  const pay = async () => { setSending(true); await new Promise(r => setTimeout(r,1500)); setSending(false); setPaid(true) }

  return (
    <section style={{ minHeight:"100vh", padding:"100px 20px 80px", position:"relative", zIndex:2 }}>
      <SectionHeader label="Réservation" title="Votre Table" />
      <div style={{ display:"flex", justifyContent:"center", maxWidth:520, margin:"0 auto 44px" }}>
        {[1,2,3].map(s => (
          <div key={s} style={{ flex:1, display:"flex", alignItems:"center", flexDirection:"column", position:"relative" }}>
            <div style={{ width:32, height:32, borderRadius:"50%", background: step>=s?"#C9A84C":"transparent", border:`1px solid ${step>=s?"#C9A84C":"rgba(201,168,76,0.3)"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, color: step>=s?"#080604":"rgba(201,168,76,0.5)", fontWeight:500, zIndex:1, position:"relative" }}>{s}</div>
            <p style={{ marginTop:7, fontSize:9, letterSpacing:2, color: step>=s?"#C9A84C":"rgba(201,168,76,0.3)", textTransform:"uppercase", textAlign:"center" }}>{s===1?"Date & Menu":s===2?"Vos Infos":"Acompte"}</p>
            {s<3 && <div style={{ position:"absolute", top:16, left:"50%", right:"-50%", height:1, background: step>s?"#C9A84C":"rgba(201,168,76,0.2)", zIndex:0 }} />}
          </div>
        ))}
      </div>
      <div style={{ maxWidth:520, margin:"0 auto" }}>
        {step===1 && (
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }} className="grid2">
              <div><label style={lS}>Date *</label><input type="date" value={form.date} onChange={e=>up("date",e.target.value)} style={iS}/></div>
              <div><label style={lS}>Couverts *</label>
                <select value={form.guests} onChange={e=>up("guests",e.target.value)} style={{...iS,cursor:"pointer"}}>
                  {[1,2,3,4,5,6,7,8].map(n=><option key={n} value={n}>{n} {n===1?"personne":"personnes"}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom:20 }}>
              <label style={lS}>Heure *</label>
              <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                {TIMES_R.map(t=><button key={t} onClick={()=>up("time",t)} style={{ padding:"8px 13px", background:form.time===t?"#C9A84C":"transparent", border:`1px solid ${form.time===t?"#C9A84C":"rgba(201,168,76,0.25)"}`, color:form.time===t?"#080604":"rgba(245,240,232,0.6)", fontSize:12, transition:"all .3s" }}>{t}</button>)}
              </div>
            </div>
            <div style={{ marginBottom:26 }}>
              <label style={lS}>Menu</label>
              {MENUS_R.map(m=>(
                <div key={m.id} onClick={()=>up("menu",m.id)} style={{ padding:"14px 18px", cursor:"pointer", marginBottom:7, background:form.menu===m.id?"rgba(201,168,76,0.08)":"rgba(245,240,232,0.02)", border:`1px solid ${form.menu===m.id?"rgba(201,168,76,0.5)":"rgba(201,168,76,0.1)"}`, display:"flex", justifyContent:"space-between", alignItems:"center", transition:"all .3s" }}>
                  <div>
                    <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:17, color:"#F5F0E8" }}>{m.label}</p>
                    <p style={{ fontSize:11, color:"rgba(245,240,232,0.4)", marginTop:3 }}>Acompte : {m.acompte}</p>
                  </div>
                  <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:17, color:"#C
