"use client"
import { useState, useEffect, useRef, useCallback } from "react"

function GoldParticles() {
  const ref = useRef(null)
  useEffect(() => {
    const c = ref.current, ctx = c.getContext("2d")
    let W = c.width = window.innerWidth, H = c.height = window.innerHeight
    const pts = Array.from({length:80}, () => ({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.5+0.3,dx:(Math.random()-.5)*.25,dy:-Math.random()*.4-.05,p:Math.random()*Math.PI*2}))
    let raf
    const draw = () => {
      ctx.clearRect(0,0,W,H)
      pts.forEach(p => {
        p.p+=.018; p.x+=p.dx; p.y+=p.dy
        if(p.y<-5)p.y=H+5; if(p.x<-5)p.x=W+5; if(p.x>W+5)p.x=-5
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2)
        ctx.fillStyle=`rgba(201,168,76,${.12+Math.sin(p.p)*.12})`; ctx.fill()
      })
      raf = requestAnimationFrame(draw)
    }
    draw()
    const resize = () => { W=c.width=window.innerWidth; H=c.height=window.innerHeight }
    window.addEventListener("resize", resize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize) }
  }, [])
  return <canvas ref={ref} className="goya-canvas" />
}

function Logo({ size }) {
  return (
    <div className="logo-wrap" style={{width:size,height:size}}>
      <img src="/logo.PNG" alt="Le Goya" className="logo-img" style={{width:size,height:size}} />
      <div className="logo-ring" style={{width:size*.22,height:size*.22}} />
    </div>
  )
}

function Divider() {
  return (
    <div className="divider">
      <div className="divider-line"/>
      <span className="divider-dot">✦</span>
      <div className="divider-line"/>
    </div>
  )
}

function SectionHeader({ label, title, subtitle }) {
  return (
    <div className="sec-header">
      <p className="sec-label">{label}</p>
      <h2 className="sec-title">{title}</h2>
      <Divider />
      {subtitle && <p className="sec-sub">{subtitle}</p>}
    </div>
  )
}

const NAV = [{k:"accueil",l:"Accueil"},{k:"menu",l:"Menu"},{k:"evenements",l:"Evenements"},{k:"reservation",l:"Reserver"}]

function Nav({ section, setSection }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", fn)
    return () => window.removeEventListener("scroll", fn)
  }, [])
  return (
    <nav className={`nav ${scrolled?"nav-scrolled":"nav-top"}`}>
      <button className="nav-brand" onClick={() => { setSection("accueil"); setOpen(false) }}>
        <Logo size={40} />
        <span>Le Goya</span>
      </button>
      <div className="nav-links">
        {NAV.map(({k,l}) => (
          <button key={k} onClick={() => setSection(k)} className={`nav-link ${section===k?"nav-link-active":"nav-link-inactive"}`}>{l}</button>
        ))}
      </div>
      <button className="nav-burger" onClick={() => setOpen(!open)}>
        {[0,1,2].map(i => (
          <span key={i} className="burger-line" style={{transform:open?(i===0?"rotate(45deg) translateY(6px)":i===1?"scaleX(0)":"rotate(-45deg) translateY(-6px)"):"none"}} />
        ))}
      </button>
      {open && (
        <div className="nav-mobile">
          {NAV.map(({k,l}) => (
            <button key={k} className="nav-mobile-link" onClick={() => { setSection(k); setOpen(false) }} style={{color:section===k?"#C9A84C":"#F5F0E8"}}>{l}</button>
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
    <section className="hero">
      <div className="hero-bg1" />
      <div className="hero-line" style={{transform:"translateY(-140px)"}} />
      <div className="hero-line" style={{transform:"translateY(140px)"}} />
      <div className="hero-content" style={{opacity:v?1:0}}>
        <div className="hero-logo-wrap"><Logo size={200} /></div>
        <p className="hero-label">Restaurant Gastronomique</p>
        <h1 className="hero-title">
          <span className="le">Le </span>
          <span className="goya">Goya</span>
        </h1>
        <div className="hero-divider">
          <div className="hero-divider-line"/>
          <span style={{color:"#C9A84C"}}>✦</span>
          <div className="hero-divider-line"/>
        </div>
        <p className="hero-text">
          Une table d exception.<br/>
          Chaque plat, une signature.<br/>
          Chaque moment, un souvenir.
        </p>
        <div className="hero-btns">
          <button className="btn-gold" onClick={() => setSection("reservation")}>Reserver une table</button>
          <button className="btn-ghost" onClick={() => setSection("menu")}>Voir le menu</button>
        </div>
      </div>
    </section>
  )
}

const ITEMS = [
  {cat:"Entrees",name:"Foie Gras Poele",desc:"Chutney de figues, brioche toastee, reduction de Porto",prix:"28",e:"🍞"},
  {cat:"Entrees",name:"Tartare de Saint-Jacques",desc:"Agrumes, caviar de truite, huile de truffe blanche",prix:"32",e:"🐚"},
  {cat:"Entrees",name:"Veloute de Champignons",desc:"Truffe noire, creme fouettee, huile de noisette",prix:"22",e:"🍄"},
  {cat:"Plats",name:"Filet de Boeuf Rossini",desc:"Medaillon de foie gras, sauce Perigueux",prix:"58",e:"🥩"},
  {cat:"Plats",name:"Homard Bleu Roti",desc:"Beurre de corail, gnocchi, bisque legere",prix:"72",e:"🦞"},
  {cat:"Plats",name:"Pigeon en Croute Herbes",desc:"Jus de gibier, puree de celeri, cepes",prix:"48",e:"🌿"},
  {cat:"Desserts",name:"Souffle Grand Marnier",desc:"Creme anglaise vanille Bourbon",prix:"18",e:"🍊"},
  {cat:"Desserts",name:"Tarte Chocolat",desc:"Caramel sale, glace praline, feuille or",prix:"16",e:"🍫"},
  {cat:"Desserts",name:"Mille-Feuille",desc:"Creme vanille, caramel beurre sale, framboises",prix:"15",e:"🍰"},
]

function MenuPage() {
  const [cat, setCat] = useState("Tous")
  const [sel, setSel] = useState(null)
  const filtered = cat === "Tous" ? ITEMS : ITEMS.filter(i => i.cat === cat)
  return (
    <section className="page-section">
      <SectionHeader label="Notre Carte" title="Le Menu" subtitle="Des produits exception, sublimes par le Chef." />
      <div className="filter-bar">
        {["Tous","Entrees","Plats","Desserts"].map(c => (
          <button key={c} onClick={() => setCat(c)} className={`filter-btn ${cat===c?"filter-active":"filter-inactive"}`}>{c}</button>
        ))}
      </div>
      <div className="menu-grid">
        {filtered.map((item,i) => (
          <div key={i} className="menu-card" onClick={() => setSel(item)}>
            <div className="menu-emoji">{item.e}</div>
            <p className="menu-cat">{item.cat}</p>
            <h3 className="menu-name">{item.name}</h3>
            <p className="menu-desc">{item.desc}</p>
            <p className="menu-prix">{item.prix}€</p>
          </div>
        ))}
      </div>
      {sel && (
        <div className="modal-overlay" onClick={() => setSel(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-emoji">{sel.e}</div>
            <p className="modal-cat">{sel.cat}</p>
            <h3 className="modal-name">{sel.name}</h3>
            <Divider />
            <p className="modal-desc">{sel.desc}</p>
            <p className="modal-prix">{sel.prix}€</p>
            <button className="btn-close" onClick={() => setSel(null)}>Fermer</button>
          </div>
        </div>
      )}
    </section>
  )
}

const EVT = [
  {t:"Soiree Privee",d:"Privatisez notre salle pour une occasion unique. Service dedie, menu sur mesure.",i:"🥂",s:"Jusqu a 40 couverts - Devis personnalise"},
  {t:"Mariage et Fiancailles",d:"Experience culinaire de vos noces avec une attention absolue.",i:"💍",s:"Buffet ou service a table"},
  {t:"Anniversaire Prestige",d:"Celebrez chaque etape dans un ecrin d excellence.",i:"✨",s:"A partir de 8 personnes"},
  {t:"Seminaire Business",d:"Impressionnez vos clients autour d un dejeuner gastronomique.",i:"🤝",s:"Salons privatifs - Audiovisuel"},
]

function EventsPage() {
  return (
    <section className="page-section">
      <SectionHeader label="Celebrations" title="Evenements Prives" subtitle="Votre evenement merite un cadre d exception." />
      <div className="evt-grid">
        {EVT.map((ev,i) => (
          <div key={i} className="evt-card">
            <div className="evt-icon">{ev.i}</div>
            <h3 className="evt-title">{ev.t}</h3>
            <p className="evt-desc">{ev.d}</p>
            <p className="evt-sub">{ev.s}</p>
          </div>
        ))}
      </div>
      <div className="evt-cta">
        <a href="mailto:contact@legoya.fr" className="btn-gold" style={{textDecoration:"none",display:"inline-block"}}>Nous contacter</a>
      </div>
    </section>
  )
}

const MENUS_R = [
  {id:"classique",label:"Menu Classique",prix:"85",acompte:"25"},
  {id:"prestige",label:"Menu Prestige",prix:"135",acompte:"40"},
  {id:"degustation",label:"Menu Degustation",prix:"175",acompte:"55"},
]
const TIMES_R = ["12:00","12:30","13:00","19:00","19:30","20:00","20:30","21:00"]

function ReservationPage() {
  const [step, setStep] = useState(1)
  const [paid, setPaid] = useState(false)
  const [sending, setSending] = useState(false)
  const [form, setForm] = useState({date:"",time:"",guests:"2",firstName:"",lastName:"",email:"",phone:"",notes:"",menu:"classique"})
  const up = (k,v) => setForm(f => ({...f,[k]:v}))
  const sm = MENUS_R.find(m => m.id === form.menu)
  const pay = async () => { setSending(true); await new Promise(r => setTimeout(r,1500)); setSending(false); setPaid(true) }
  const ok1 = form.date && form.time
  const ok2 = form.firstName && form.email && form.phone

  return (
    <section className="page-section">
      <SectionHeader label="Reservation" title="Votre Table" />
      <div className="steps">
        {[1,2,3].map(s => (
          <div key={s} className="step">
            <div className={`step-num ${step>=s?"step-active":"step-inactive"}`}>{s}</div>
            <p className={`step-label ${step>=s?"step-label-active":"step-label-inactive"}`}>{s===1?"Date":s===2?"Infos":"Paiement"}</p>
            {s<3 && <div className={`step-line ${step>s?"step-line-done":"step-line-todo"}`} />}
          </div>
        ))}
      </div>
      <div className="form-wrap">
        {step===1 && (
          <div>
            <div className="form-grid">
              <div><label className="form-label">Date</label><input type="date" value={form.date} onChange={e=>up("date",e.target.value)} /></div>
              <div><label className="form-label">Couverts</label>
                <select value={form.guests} onChange={e=>up("guests",e.target.value)}>
                  {[1,2,3,4,5,6,7,8].map(n=><option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
            <div style={{marginBottom:20}}>
              <label className="form-label">Heure</label>
              <div className="time-grid">
                {TIMES_R.map(t=><button key={t} onClick={()=>up("time",t)} className={`time-btn ${form.time===t?"time-active":"time-inactive"}`}>{t}</button>)}
              </div>
            </div>
            <div style={{marginBottom:26}}>
              <label className="form-label">Menu</label>
              {MENUS_R.map(m=>(
                <div key={m.id} onClick={()=>up("menu",m.id)} className={`menu-option ${form.menu===m.id?"menu-option-active":"menu-option-inactive"}`}>
                  <div>
                    <p className="menu-option-name">{m.label}</p>
                    <p className="menu-option-note">Acompte : {m.acompte}€</p>
                  </div>
                  <p className="menu-option-prix">{m.prix}€/pers</p>
                </div>
              ))}
            </div>
            <button onClick={()=>{if(ok1)setStep(2)}} className={`btn-continue ${ok1?"btn-continue-active":"btn-continue-disabled"}`}>Continuer</button>
          </div>
        )}
        {step===2 && (
          <div>
            <div className="form-grid">
              {[["firstName","Prenom"],["lastName","Nom"]].map(([k,l])=>(
                <div key={k}><label className="form-label">{l}</label><input value={form[k]} onChange={e=>up(k,e.target.value)} placeholder={l} /></div>
              ))}
            </div>
            {[["email","Email","email"],["phone","Telephone","tel"]].map(([k,l,t])=>(
              <div key={k} className="form-group"><label className="form-label">{l}</label><input type={t} value={form[k]} onChange={e=>up(k,e.target.value)} placeholder={l} /></div>
            ))}
            <div className="form-group"><label className="form-label">Allergies</label><textarea value={form.notes} onChange={e=>up("notes",e.target.value)} rows={3} placeholder="Allergies, occasion speciale..." style={{resize:"vertical"}} /></div>
            <div className="btn-row">
              <button onClick={()=>setStep(1)} className="btn-back">Retour</button>
              <button onClick={()=>{if(ok2)setStep(3)}} className={`btn-continue ${ok2?"btn-continue-active":"btn-continue-disabled"}`} style={{flex:1}}>Continuer</button>
            </div>
          </div>
        )}
        {step===3 && !paid && (
          <div>
            <div className="recap">
              <p className="recap-title">Recapitulatif</p>
              {[["Date",form.date],["Heure",form.time],["Couverts",form.guests],["Menu",sm?.label],["Nom",form.firstName+" "+form.lastName],["Email",form.email],["Tel",form.phone]].map(([l,v])=>(
                <div key={l} className="recap-row"><span className="recap-key">{l}</span><span className="recap-val">{v}</span></div>
              ))}
              <div className="recap-total">
                <span className="recap-total-label">Acompte</span>
                <span className="recap-total-val">{sm?.acompte}€</span>
              </div>
            </div>
            <div className="payment-box">
              <p className="payment-title">Paiement securise</p>
              <input style={{marginBottom:9}} placeholder="Numero de carte" maxLength={19} />
              <div className="payment-grid">
                <input placeholder="MM / AA" maxLength={7} />
                <input placeholder="CVV" maxLength={4} />
              </div>
              <p className="payment-note">Stripe - integration a venir</p>
            </div>
            <div className="confirm-box">
              <p className="confirm-title">Confirmation automatique</p>
              <p className="confirm-text">Email + SMS envoyes immediatement. Rappel SMS 24h avant.</p>
            </div>
            <div className="btn-row">
              <button onClick={()=>setStep(2)} className="btn-back">Retour</button>
              <button onClick={pay} disabled={sending} className="btn-pay" style={{background:sending?"rgba(201,168,76,0.5)":"#C9A84C",cursor:sending?"wait":"pointer"}}>
                {sending?"Traitement...":"Confirmer "+sm?.acompte+"€"}
              </button>
            </div>
          </div>
        )}
        {paid && (
          <div className="success">
            <div className="success-icon">✦</div>
            <h3 className="success-title">Reservation Confirmee</h3>
            <Divider />
            <p className="success-text">
              Merci {form.firstName} !<br/>
              Table le <span className="success-gold">{form.date}</span> a <span className="success-gold">{form.time}</span><br/><br/>
              Email : <span className="success-gold">{form.email}</span><br/>
              SMS : <span className="success-gold">{form.phone}</span>
            </p>
            <p className="success-sub">A tres bientot au Goya</p>
          </div>
        )}
      </div>
    </section>
  )
}

function Footer({ setSection }) {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <div className="footer-brand"><Logo size={32}/><span className="footer-brand-name">Le Goya</span></div>
          <p className="footer-tagline">Restaurant gastronomique.<br/>Une experience inoubliable.</p>
        </div>
        <div>
          <p className="footer-heading">Navigation</p>
          {["accueil","menu","evenements","reservation"].map(k=>(
            <button key={k} className="footer-link" onClick={()=>setSection(k)}>{k.charAt(0).toUpperCase()+k.slice(1)}</button>
          ))}
        </div>
        <div>
          <p className="footer-heading">Contact</p>
          <p className="footer-text">contact@legoya.fr<br/>Paris, France</p>
        </div>
        <div>
          <p className="footer-heading">Horaires</p>
          <p className="footer-text">Mar - Sam<br/>12h-14h / 19h-22h30</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p className="footer-copy">2025 Le Goya</p>
        <p className="footer-copy">Mentions legales</p>
      </div>
    </footer>
  )
}

export default function LeGoyaApp() {
  const [section, setSection] = useState("accueil")
  const go = useCallback(s => { setSection(s); window.scrollTo({top:0,behavior:"smooth"}) }, [])
  const pages = {
    accueil: <Hero setSection={go} />,
    menu: <MenuPage />,
    evenements: <EventsPage />,
    reservation: <ReservationPage />,
  }
  return (
    <div className="goya-wrap">
      <GoldParticles/>
      <Nav section={section} setSection={go}/>
      <div className="page-content">
        {pages[section]||pages.accueil}
        <Footer setSection={go}/>
      </div>
    </div>
  )
}
