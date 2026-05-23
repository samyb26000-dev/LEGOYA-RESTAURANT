"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import { supabase } from "../lib/supabase"

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

// ─── CAROUSEL ─────────────────────────────────────────────────────────────────
function Carousel() {
  const [plats, setPlats] = useState([])
  const [idx, setIdx] = useState(0)
  const [auto, setAuto] = useState(true)

  useEffect(() => {
    supabase.from("plats").select("*, categories(nom)").eq("actif", true).order("ordre").then(({data}) => {
      if (data && data.length > 0) setPlats(data)
      else setPlats([
        {id:1,nom:"Foie Gras Poele",description:"Chutney de figues, brioche toastee",prix:28,categories:{nom:"Entrees"},photo_url:null},
        {id:2,nom:"Homard Bleu Roti",description:"Beurre de corail, bisque legere",prix:72,categories:{nom:"Plats"},photo_url:null},
        {id:3,nom:"Filet de Boeuf Rossini",description:"Sauce Perigueux, legumes de saison",prix:58,categories:{nom:"Plats"},photo_url:null},
        {id:4,nom:"Souffle Grand Marnier",description:"Creme anglaise vanille Bourbon",prix:18,categories:{nom:"Desserts"},photo_url:null},
        {id:5,nom:"Tartare Saint-Jacques",description:"Agrumes, caviar de truite",prix:32,categories:{nom:"Entrees"},photo_url:null},
        {id:6,nom:"Mille-Feuille",description:"Caramel beurre sale, framboises",prix:15,categories:{nom:"Desserts"},photo_url:null},
      ])
    })
  }, [])

  useEffect(() => {
    if (!auto || plats.length === 0) return
    const t = setInterval(() => setIdx(i => (i+1) % plats.length), 3000)
    return () => clearInterval(t)
  }, [auto, plats.length])

  if (plats.length === 0) return null

  const prev = () => { setAuto(false); setIdx(i => (i-1+plats.length) % plats.length) }
  const next = () => { setAuto(false); setIdx(i => (i+1) % plats.length) }

  return (
    <div style={{position:"relative",width:"100%",overflow:"hidden",padding:"60px 0 80px"}}>
      <p style={{textAlign:"center",fontSize:10,letterSpacing:5,color:"#C9A84C",textTransform:"uppercase",marginBottom:40}}>Notre Selection</p>
      <div style={{display:"flex",transition:"transform .6s ease",transform:`translateX(calc(-${idx * 280}px + 50vw - 140px))`,gap:20,paddingLeft:20}}>
        {plats.map((p, i) => (
          <div key={p.id} onClick={() => { setAuto(false); setIdx(i) }}
            style={{
              minWidth:260, padding:"32px 24px",
              background: i===idx ? "rgba(201,168,76,0.1)" : "rgba(245,240,232,0.02)",
              border: `1px solid ${i===idx ? "rgba(201,168,76,0.5)" : "rgba(201,168,76,0.1)"}`,
              transform: i===idx ? "scale(1.05)" : "scale(0.95)",
              transition:"all .4s", cursor:"pointer",
              textAlign:"center", flexShrink:0,
            }}>
            {p.photo_url
              ? <img src={p.photo_url} alt={p.nom} style={{width:"100%",height:140,objectFit:"cover",marginBottom:16}} />
              : <div style={{width:"100%",height:140,background:"rgba(201,168,76,0.06)",marginBottom:16,display:"flex",alignItems:"center",justifyContent:"center",fontSize:40}}>🍽️</div>
            }
            <p style={{fontSize:9,letterSpacing:3,color:"#C9A84C",textTransform:"uppercase",marginBottom:8}}>{p.categories?.nom}</p>
            <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontStyle:"italic",color:"#F5F0E8",marginBottom:8}}>{p.nom}</h3>
            <p style={{fontSize:11,color:"rgba(245,240,232,0.45)",marginBottom:12,lineHeight:1.6}}>{p.description}</p>
            <p style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:"#C9A84C",fontStyle:"italic"}}>{p.prix}€</p>
          </div>
        ))}
      </div>
      <button onClick={prev} style={{position:"absolute",left:16,top:"50%",transform:"translateY(-50%)",background:"rgba(8,6,4,0.8)",border:"1px solid rgba(201,168,76,0.3)",color:"#C9A84C",width:40,height:40,fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
      <button onClick={next} style={{position:"absolute",right:16,top:"50%",transform:"translateY(-50%)",background:"rgba(8,6,4,0.8)",border:"1px solid rgba(201,168,76,0.3)",color:"#C9A84C",width:40,height:40,fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>›</button>
      <div style={{display:"flex",justifyContent:"center",gap:8,marginTop:32}}>
        {plats.map((_,i) => (
          <div key={i} onClick={() => { setAuto(false); setIdx(i) }}
            style={{width:i===idx?24:8,height:8,borderRadius:4,background:i===idx?"#C9A84C":"rgba(201,168,76,0.3)",transition:"all .3s",cursor:"pointer"}} />
        ))}
      </div>
    </div>
  )
}

// ─── AVIS ─────────────────────────────────────────────────────────────────────
function Avis() {
  const [avis, setAvis] = useState([])
  useEffect(() => {
    supabase.from("avis").select("*").eq("publie", true).order("created_at", {ascending:false}).limit(6).then(({data}) => {
      if (data) setAvis(data)
    })
  }, [])
  if (avis.length === 0) return null
  const moyenne = (avis.reduce((s,a) => s+a.note, 0) / avis.length).toFixed(1)
  return (
    <div style={{padding:"60px 20px",position:"relative",zIndex:2}}>
      <div style={{textAlign:"center",marginBottom:48}}>
        <p style={{fontSize:10,letterSpacing:5,color:"#C9A84C",textTransform:"uppercase",marginBottom:16}}>Ce qu ils disent</p>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:12,marginBottom:8}}>
          <span style={{fontFamily:"'Playfair Display',serif",fontSize:48,color:"#C9A84C",fontStyle:"italic"}}>{moyenne}</span>
          <div>
            <div style={{display:"flex",gap:4}}>
              {[1,2,3,4,5].map(i => <span key={i} style={{color:i<=Math.round(moyenne)?"#C9A84C":"rgba(201,168,76,0.3)",fontSize:20}}>★</span>)}
            </div>
            <p style={{fontSize:11,color:"rgba(245,240,232,0.4)",marginTop:4}}>{avis.length} avis</p>
          </div>
        </div>
        <Divider />
      </div>
      <div style={{maxWidth:960,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:2}}>
        {avis.map(a => (
          <div key={a.id} style={{padding:"28px 24px",background:"rgba(245,240,232,0.02)",border:"1px solid rgba(201,168,76,0.08)"}}>
            <div style={{display:"flex",gap:4,marginBottom:12}}>
              {[1,2,3,4,5].map(i => <span key={i} style={{color:i<=a.note?"#C9A84C":"rgba(201,168,76,0.3)",fontSize:14}}>★</span>)}
            </div>
            <p style={{fontSize:13,color:"rgba(245,240,232,0.7)",lineHeight:1.8,marginBottom:16,fontStyle:"italic"}}>{a.commentaire}</p>
            <p style={{fontSize:11,color:"#C9A84C",letterSpacing:1}}>{a.prenom}</p>
          </div>
        ))}
      </div>
    </div>
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

const ALLERGENES_LIST = ["Gluten","Crustaces","Oeufs","Poissons","Arachides","Soja","Lait","Fruits a coque","Celeri","Moutarde","Graines de sesame","Anhydride sulfureux","Lupin","Mollusques"]

function MenuPage() {
  const [cat, setCat] = useState("Tous")
  const [sel, setSel] = useState(null)
  const [plats, setPlats] = useState([])
  const [cats, setCats] = useState([])

  useEffect(() => {
    supabase.from("plats").select("*, categories(nom)").eq("actif", true).order("ordre").then(({data}) => {
      if (data && data.length > 0) setPlats(data)
      else setPlats([
        {id:1,nom:"Foie Gras Poele",description:"Chutney de figues, brioche toastee, reduction de Porto",prix:28,categories:{nom:"Entrees"},allergenes:["Gluten","Oeufs","Lait"]},
        {id:2,nom:"Tartare Saint-Jacques",description:"Agrumes, caviar de truite, huile de truffe blanche",prix:32,categories:{nom:"Entrees"},allergenes:["Mollusques","Poissons"]},
        {id:3,nom:"Filet de Boeuf Rossini",description:"Medaillon de foie gras, sauce Perigueux",prix:58,categories:{nom:"Plats"},allergenes:["Lait","Oeufs"]},
        {id:4,nom:"Homard Bleu Roti",description:"Beurre de corail, gnocchi, bisque legere",prix:72,categories:{nom:"Plats"},allergenes:["Crustaces","Gluten","Lait"]},
        {id:5,nom:"Souffle Grand Marnier",description:"Creme anglaise vanille Bourbon",prix:18,categories:{nom:"Desserts"},allergenes:["Oeufs","Lait","Gluten"]},
        {id:6,nom:"Mille-Feuille",description:"Caramel beurre sale, framboises",prix:15,categories:{nom:"Desserts"},allergenes:["Gluten","Lait","Oeufs"]},
      ])
    })
    supabase.from("categories").select("*").order("ordre").then(({data}) => {
      if (data) setCats(data.map(c => c.nom))
    })
  }, [])

  const allCats = ["Tous", ...new Set(plats.map(p => p.categories?.nom).filter(Boolean))]
  const filtered = cat === "Tous" ? plats : plats.filter(p => p.categories?.nom === cat)

  return (
    <section className="page-section">
      <SectionHeader label="Notre Carte" title="Le Menu" subtitle="Des produits exception, sublimes par le Chef." />
      <div className="filter-bar">
        {allCats.map(c => (
          <button key={c} onClick={() => setCat(c)} className={`filter-btn ${cat===c?"filter-active":"filter-inactive"}`}>{c}</button>
        ))}
      </div>
      <div className="menu-grid">
        {filtered.map((item,i) => (
          <div key={item.id||i} className="menu-card" onClick={() => setSel(item)}>
            {item.photo_url
              ? <img src={item.photo_url} alt={item.nom} style={{width:"100%",height:160,objectFit:"cover",marginBottom:16}} />
              : <div style={{width:"100%",height:120,background:"rgba(201,168,76,0.05)",marginBottom:16,display:"flex",alignItems:"center",justifyContent:"center",fontSize:36}}>🍽️</div>
            }
            <p className="menu-cat">{item.categories?.nom}</p>
            <h3 className="menu-name">{item.nom}</h3>
            <p className="menu-desc">{item.description}</p>
            {item.allergenes && item.allergenes.length > 0 && (
              <p style={{fontSize:10,color:"rgba(201,168,76,0.5)",marginBottom:10,letterSpacing:1}}>⚠ {item.allergenes.join(", ")}</p>
            )}
            <p className="menu-prix">{item.prix}€</p>
          </div>
        ))}
      </div>
      {sel && (
        <div className="modal-overlay" onClick={() => setSel(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            {sel.photo_url
              ? <img src={sel.photo_url} alt={sel.nom} style={{width:"100%",height:180,objectFit:"cover",marginBottom:18}} />
              : <div style={{fontSize:50,marginBottom:18}}>🍽️</div>
            }
            <p className="modal-cat">{sel.categories?.nom}</p>
            <h3 className="modal-name">{sel.nom}</h3>
            <Divider />
            <p className="modal-desc">{sel.description}</p>
            {sel.allergenes && sel.allergenes.length > 0 && (
              <div style={{marginTop:16,padding:"10px 14px",background:"rgba(201,168,76,0.06)",border:"1px solid rgba(201,168,76,0.2)"}}>
                <p style={{fontSize:9,letterSpacing:2,color:"#C9A84C",textTransform:"uppercase",marginBottom:6}}>Allergenes</p>
                <p style={{fontSize:12,color:"rgba(245,240,232,0.6)"}}>{sel.allergenes.join(" · ")}</p>
              </div>
            )}
            <p className="modal-prix">{sel.prix}€</p>
            <button className="btn-close" onClick={() => setSel(null)}>Fermer</button>
          </div>
        </div>
      )}
    </section>
  )
}

const EVT_TYPES = ["Mariage","Anniversaire","Seminaire","Soiree privee","Repas entreprise","Autre"]

function EventsPage() {
  const [form, setForm] = useState({type:"",date:"",personnes:"",budget:"",prenom:"",nom:"",email:"",telephone:"",message:""})
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const up = (k,v) => setForm(f => ({...f,[k]:v}))

  const send = async () => {
    if (!form.prenom || !form.email || !form.telephone || !form.type) return
    setSending(true)
    const {error} = await supabase.from("evenements").insert([{
      type_event: form.type,
      date_souhaitee: form.date || null,
      nombre_personnes: form.personnes ? parseInt(form.personnes) : null,
      budget: form.budget,
      prenom: form.prenom,
      nom: form.nom,
      email: form.email,
      telephone: form.telephone,
      message: form.message,
    }])
    setSending(false)
    if (!error) setSent(true)
  }

  const iS = {width:"100%",padding:"12px 14px",background:"rgba(245,240,232,0.04)",border:"1px solid rgba(201,168,76,0.2)",color:"#F5F0E8",fontSize:13,outline:"none",marginBottom:10}
  const lS = {fontSize:10,letterSpacing:3,color:"#C9A84C",textTransform:"uppercase",display:"block",marginBottom:8,fontFamily:"'Montserrat',sans-serif"}

  return (
    <section className="page-section">
      <SectionHeader label="Evenementiel" title="Votre Evenement" subtitle="Mariage, anniversaire, seminaire, repas entreprise. Nous creeons une experience sur mesure." />
      <div style={{maxWidth:920,margin:"0 auto 60px",display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:1,background:"rgba(201,168,76,0.08)"}}>
        {[
          {t:"Mariages",d:"Une reception d exception pour le plus beau jour de votre vie. Menu sur mesure, decoration, coordination complete.",i:"💍"},
          {t:"Anniversaires",d:"Celebrez vos moments precieux dans un ecrin de raffinement. Gateau, decoration, menu degustation.",i:"✨"},
          {t:"Seminaires",d:"Impressionnez vos collaborateurs et clients autour d un repas gastronomique d affaires.",i:"🤝"},
          {t:"Soirees Privees",d:"Privatisation de la salle entiere pour vos evenements exclusifs. Jusqu a 40 couverts.",i:"🥂"},
          {t:"Repas Entreprise",d:"Fidelisez vos equipes et partenaires autour d une table d exception.",i:"🏢"},
          {t:"Cocktails",d:"Cocktail dinatoire ou aperitif de prestige avec selection de mignardises gastronomiques.",i:"🍾"},
        ].map((ev,i) => (
          <div key={i} className="evt-card">
            <div className="evt-icon">{ev.i}</div>
            <h3 className="evt-title">{ev.t}</h3>
            <p className="evt-desc">{ev.d}</p>
          </div>
        ))}
      </div>

      <div style={{maxWidth:560,margin:"0 auto"}}>
        <SectionHeader label="Devis gratuit" title="Demande de Devis" />
        {sent ? (
          <div style={{textAlign:"center",padding:"40px 20px"}}>
            <div style={{fontSize:50,marginBottom:20}}>✦</div>
            <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:28,fontStyle:"italic",color:"#C9A84C",marginBottom:12}}>Demande envoyee</h3>
            <Divider />
            <p style={{marginTop:20,fontSize:13,lineHeight:2,color:"rgba(245,240,232,0.6)"}}>Nous vous recontactons sous 24h pour construire ensemble votre evenement ideal.</p>
          </div>
        ) : (
          <div>
            <div>
              <label style={lS}>Type d evenement *</label>
              <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:16}}>
                {EVT_TYPES.map(t => (
                  <button key={t} onClick={() => up("type",t)} style={{padding:"8px 14px",background:form.type===t?"#C9A84C":"transparent",border:`1px solid ${form.type===t?"#C9A84C":"rgba(201,168,76,0.25)"}`,color:form.type===t?"#080604":"rgba(245,240,232,0.6)",fontSize:11,letterSpacing:1,transition:"all .3s"}}>{t}</button>
                ))}
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:0}} className="form-grid">
              <div><label style={lS}>Date souhaitee</label><input type="date" value={form.date} onChange={e=>up("date",e.target.value)} style={iS} /></div>
              <div><label style={lS}>Nombre de personnes</label><input type="number" value={form.personnes} onChange={e=>up("personnes",e.target.value)} style={iS} placeholder="Ex: 50" /></div>
            </div>
            <div><label style={lS}>Budget estime</label>
              <select value={form.budget} onChange={e=>up("budget",e.target.value)} style={{...iS,cursor:"pointer"}}>
                <option value="">Selectionner</option>
                <option>Moins de 1 000€</option>
                <option>1 000€ - 3 000€</option>
                <option>3 000€ - 5 000€</option>
                <option>5 000€ - 10 000€</option>
                <option>Plus de 10 000€</option>
              </select>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}} className="form-grid">
              <div><label style={lS}>Prenom *</label><input value={form.prenom} onChange={e=>up("prenom",e.target.value)} style={iS} placeholder="Prenom" /></div>
              <div><label style={lS}>Nom</label><input value={form.nom} onChange={e=>up("nom",e.target.value)} style={iS} placeholder="Nom" /></div>
            </div>
            <div><label style={lS}>Email *</label><input type="email" value={form.email} onChange={e=>up("email",e.target.value)} style={iS} placeholder="Email" /></div>
            <div><label style={lS}>Telephone *</label><input type="tel" value={form.telephone} onChange={e=>up("telephone",e.target.value)} style={iS} placeholder="Telephone" /></div>
            <div><label style={lS}>Votre projet</label><textarea value={form.message} onChange={e=>up("message",e.target.value)} rows={4} style={{...iS,resize:"vertical"}} placeholder="Decrivez votre evenement, vos souhaits, contraintes particulieres..." /></div>
            <button onClick={send} disabled={sending} style={{width:"100%",padding:16,background:sending?"rgba(201,168,76,0.5)":"#C9A84C",border:"none",color:"#080604",fontSize:11,letterSpacing:4,textTransform:"uppercase",fontWeight:500,cursor:sending?"wait":"pointer",fontFamily:"'Montserrat',sans-serif"}}>
              {sending?"Envoi en cours...":"Envoyer ma demande"}
            </button>
          </div>
        )}
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
  const [form, setForm] = useState({date:"",time:"",guests:"2",firstName:"",lastName:"",email:"",phone:"",note:"",menu:"classique"})
  const up = (k,v) => setForm(f => ({...f,[k]:v}))
  const sm = MENUS_R.find(m => m.id === form.menu)
  const ok1 = form.date && form.time
  const ok2 = form.firstName && form.email && form.phone

  const pay = async () => {
    setSending(true)
    const {error} = await supabase.from("reservations").insert([{
      date: form.date,
      heure: form.time,
      couverts: parseInt(form.guests),
      prenom: form.firstName,
      nom: form.lastName,
      email: form.email,
      telephone: form.phone,
      menu_choisi: sm?.label,
      acompte: parseFloat(sm?.acompte),
      note_client: form.note,
      statut: "en_attente",
    }])
    setSending(false)
    if (!error) setPaid(true)
  }

  const iS = {width:"100%",padding:"12px 14px",background:"rgba(245,240,232,0.04)",border:"1px solid rgba(201,168,76,0.2)",color:"#F5F0E8",fontSize:13,outline:"none"}
  const lS = {fontSize:10,letterSpacing:3,color:"#C9A84C",textTransform:"uppercase",display:"block",marginBottom:8}

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
              <div><label style={lS}>Date</label><input type="date" value={form.date} onChange={e=>up("date",e.target.value)} style={iS} /></div>
              <div><label style={lS}>Couverts</label>
                <select value={form.guests} onChange={e=>up("guests",e.target.value)} style={{...iS,cursor:"pointer"}}>
                  {[1,2,3,4,5,6,7,8].map(n=><option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
            <div style={{marginBottom:20}}>
              <label style={lS}>Heure</label>
              <div className="time-grid">
                {TIMES_R.map(t=><button key={t} onClick={()=>up("time",t)} className={`time-btn ${form.time===t?"time-active":"time-inactive"}`}>{t}</button>)}
              </div>
            </div>
            <div style={{marginBottom:20}}>
              <label style={lS}>Menu</label>
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
            <div style={{marginBottom:26}}>
              <label style={lS}>Note personnelle</label>
              <textarea value={form.note} onChange={e=>up("note",e.target.value)} rows={3} style={{...iS,resize:"vertical",width:"100%"}} placeholder="Allergies, surprise, occasion speciale, demande particuliere..." />
              <p style={{fontSize:10,color:"rgba(245,240,232,0.3)",marginTop:6}}>Visible uniquement par notre equipe</p>
            </div>
            <button onClick={()=>{if(ok1)setStep(2)}} className={`btn-continue ${ok1?"btn-continue-active":"btn-continue-disabled"}`}>Continuer</button>
          </div>
        )}
        {step===2 && (
          <div>
            <div className="form-grid">
              {[["firstName","Prenom"],["lastName","Nom"]].map(([k,l])=>(
                <div key={k}><label style={lS}>{l}</label><input value={form[k]} onChange={e=>up(k,e.target.value)} style={iS} placeholder={l} /></div>
              ))}
            </div>
            {[["email","Email","email"],["phone","Telephone","tel"]].map(([k,l,t])=>(
              <div key={k} style={{marginBottom:10}}><label style={lS}>{l}</label><input type={t} value={form[k]} onChange={e=>up(k,e.target.value)} style={iS} placeholder={l} /></div>
            ))}
            <div className="btn-row" style={{marginTop:16}}>
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
              {form.note && (
                <div style={{marginTop:10,padding:"10px 12px",background:"rgba(201,168,76,0.05)",border:"1px solid rgba(201,168,76,0.15)"}}>
                  <p style={{fontSize:9,letterSpacing:2,color:"#C9A84C",textTransform:"uppercase",marginBottom:4}}>Note personnelle</p>
                  <p style={{fontSize:12,color:"rgba(245,240,232,0.6)"}}>{form.note}</p>
                </div>
              )}
              <div className="recap-total">
                <span className="recap-total-label">Acompte</span>
                <span className="recap-total-val">{sm?.acompte}€</span>
              </div>
            </div>
            <div className="payment-box">
              <p className="payment-title">Paiement securise</p>
              <input style={{...iS,marginBottom:9,width:"100%"}} placeholder="Numero de carte" maxLength={19} />
              <div className="payment-grid">
                <input style={iS} placeholder="MM / AA" maxLength={7} />
                <input style={iS} placeholder="CVV" maxLength={4} />
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
      <div style={{padding:"20px 0",borderTop:"1px solid rgba(201,168,76,0.08)",marginTop:8}}>
        <p style={{textAlign:"center",fontSize:10,color:"rgba(245,240,232,0.2)",letterSpacing:1,lineHeight:2}}>
          Le Goya — SARL au capital de XX XXX€ — SIRET XXX XXX XXX XXXXX<br/>
          Mentions legales · CGV · Politique de confidentialite · Gestion des cookies
        </p>
      </div>
    </footer>
  )
}

export default function LeGoyaApp() {
  const [section, setSection] = useState("accueil")
  const go = useCallback(s => { setSection(s); window.scrollTo({top:0,behavior:"smooth"}) }, [])
  const pages = {
    accueil: (
      <>
        <Hero setSection={go} />
        <Carousel />
        <Avis />
      </>
    ),
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
