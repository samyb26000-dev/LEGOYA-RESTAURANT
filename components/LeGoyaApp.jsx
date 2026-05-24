"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import { supabase } from "../lib/supabase"

// ─── CURSOR ───────────────────────────────────────────────────────────────────
function Cursor() {
  const dot = useRef(null)
  const ring = useRef(null)
  const pos = useRef({x:0,y:0})
  const smooth = useRef({x:0,y:0})
  const [hover, setHover] = useState(false)
  const [click, setClick] = useState(false)

  useEffect(() => {
    const onMove = e => { pos.current = {x:e.clientX, y:e.clientY} }
    let raf
    const animate = () => {
      smooth.current.x += (pos.current.x - smooth.current.x) * 0.12
      smooth.current.y += (pos.current.y - smooth.current.y) * 0.12
      if (dot.current) { dot.current.style.left = pos.current.x+"px"; dot.current.style.top = pos.current.y+"px" }
      if (ring.current) { ring.current.style.left = smooth.current.x+"px"; ring.current.style.top = smooth.current.y+"px" }
      raf = requestAnimationFrame(animate)
    }
    animate()
    const onEnter = () => setHover(true)
    const onLeave = () => setHover(false)
    const onDown = () => setClick(true)
    const onUp = () => setClick(false)
    const addListeners = () => {
      document.querySelectorAll("button,a,[role=button],.menu-card,.menu-option,.time-btn,.filter-btn,.evt-card").forEach(el => {
        el.addEventListener("mouseenter", onEnter)
        el.addEventListener("mouseleave", onLeave)
      })
    }
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mousedown", onDown)
    window.addEventListener("mouseup", onUp)
    addListeners()
    const obs = new MutationObserver(addListeners)
    obs.observe(document.body, {childList:true, subtree:true})
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mousedown", onDown)
      window.removeEventListener("mouseup", onUp)
      obs.disconnect()
    }
  }, [])

  return (
    <>
      <div ref={dot} className={`cursor-dot${hover?" hover":""}${click?" click":""}`}/>
      <div ref={ring} className={`cursor-ring${hover?" hover":""}${click?" click":""}`}/>
    </>
  )
}

// ─── LOADING SCREEN ───────────────────────────────────────────────────────────
function LoadingScreen({ onDone }) {
  const [done, setDone] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => {
      setDone(true)
      setTimeout(onDone, 800)
    }, 2200)
    return () => clearTimeout(t)
  }, [])
  return (
    <div className={`loading-screen${done?" done":""}`}>
      <div className="loading-logo">
        <img src="/logo.png" style={{width:100,height:100,objectFit:"contain"}} alt="Le Goya"/>
      </div>
      <h1 className="loading-title">Le Goya</h1>
      <p className="loading-sub">Restaurant Gastronomique</p>
      <div className="loading-bar-wrap">
        <div className="loading-bar"/>
      </div>
    </div>
  )
}

// ─── SCROLL REVEAL ────────────────────────────────────────────────────────────
function useReveal(threshold=0.12) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if(e.isIntersecting){setVisible(true);obs.disconnect()} }, {threshold})
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return {ref, visible}
}

function Reveal({ children, delay=0, direction="" }) {
  const {ref, visible} = useReveal()
  const cls = direction==="left"?"reveal-left":direction==="right"?"reveal-right":"reveal"
  return (
    <div ref={ref} className={`${cls}${visible?" visible":""}`} style={{transitionDelay:`${delay}s`}}>
      {children}
    </div>
  )
}

// ─── PARTICLES ────────────────────────────────────────────────────────────────
function GoldParticles() {
  const ref = useRef(null)
  useEffect(() => {
    const c = ref.current, ctx = c.getContext("2d")
    let W = c.width = window.innerWidth, H = c.height = window.innerHeight
    const pts = Array.from({length:100}, () => ({
      x:Math.random()*W, y:Math.random()*H,
      r:Math.random()*2+0.2,
      dx:(Math.random()-.5)*.3,
      dy:-Math.random()*.5-.05,
      p:Math.random()*Math.PI*2,
      s:Math.random()*.5+.5,
    }))
    let raf
    const draw = () => {
      ctx.clearRect(0,0,W,H)
      pts.forEach(p => {
        p.p+=.015*p.s; p.x+=p.dx*p.s; p.y+=p.dy*p.s
        if(p.y<-5)p.y=H+5; if(p.x<-5)p.x=W+5; if(p.x>W+5)p.x=-5
        const a=0.08+Math.sin(p.p)*0.1
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2)
        ctx.fillStyle=`rgba(201,168,76,${a})`; ctx.fill()
      })
      raf = requestAnimationFrame(draw)
    }
    draw()
    const onResize = () => { W=c.width=window.innerWidth; H=c.height=window.innerHeight }
    window.addEventListener("resize", onResize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize) }
  }, [])
  return <canvas ref={ref} className="goya-canvas"/>
}

// ─── LOGO ─────────────────────────────────────────────────────────────────────
function Logo({ size }) {
  return (
    <div className="logo-wrap" style={{width:size,height:size}}>
      <img src="/logo.png" alt="Le Goya" className="logo-img" style={{width:size,height:size}}/>
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
    <Reveal>
      <div className="sec-header">
        <p className="sec-label">{label}</p>
        <h2 className="sec-title">{title}</h2>
        <Divider/>
        {subtitle && <p className="sec-sub">{subtitle}</p>}
      </div>
    </Reveal>
  )
}

// ─── NAV ──────────────────────────────────────────────────────────────────────
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
        <Logo size={40}/>
        <span>Le Goya</span>
      </button>
      <div className="nav-links">
        {NAV.map(({k,l}) => (
          <button key={k} onClick={() => setSection(k)} className={`nav-link ${section===k?"nav-link-active":"nav-link-inactive"}`}>{l}</button>
        ))}
      </div>
      <button className="nav-burger" onClick={() => setOpen(!open)}>
        {[0,1,2].map(i => (
          <span key={i} className="burger-line" style={{transform:open?(i===0?"rotate(45deg) translateY(6px)":i===1?"scaleX(0)":"rotate(-45deg) translateY(-6px)"):"none"}}/>
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

// ─── HERO ─────────────────────────────────────────────────────────────────────
function Hero({ setSection }) {
  const [v, setV] = useState(false)
  const [mx, setMx] = useState(0)
  const [my, setMy] = useState(0)
  useEffect(() => { setTimeout(() => setV(true), 200) }, [])
  const onMove = useCallback(e => {
    setMx((e.clientX/window.innerWidth-.5)*18)
    setMy((e.clientY/window.innerHeight-.5)*18)
  }, [])
  useEffect(() => {
    window.addEventListener("mousemove", onMove)
    return () => window.removeEventListener("mousemove", onMove)
  }, [onMove])
  return (
    <section className="hero" onMouseMove={onMove}>
      <div className="hero-bg1"/>
      <div className="hero-bg2"/>
      <div className="hero-line" style={{transform:"translateY(-140px)"}}/>
      <div className="hero-line" style={{transform:"translateY(140px)"}}/>
      <div className="hero-content" style={{
        opacity:v?1:0,
        transform:`translate(${mx*.08}px,${my*.08}px)`,
        transition:"opacity 1.4s ease, transform 1.2s ease",
      }}>
        <div className="hero-logo-wrap">
          <div style={{transform:`translate(${mx*.15}px,${my*.15}px)`,transition:"transform 1s ease"}}>
            <Logo size={210}/>
          </div>
        </div>
        <p className="hero-label" style={{opacity:v?1:0,transform:v?"translateY(0)":"translateY(20px)",transition:"all 1s ease .2s"}}>Restaurant Gastronomique</p>
        <h1 className="hero-title" style={{opacity:v?1:0,transform:v?"translateY(0)":"translateY(30px)",transition:"all 1.1s ease .3s"}}>
          <span className="le">Le </span>
          <span className="goya">Goya</span>
        </h1>
        <div className="hero-divider" style={{opacity:v?1:0,transition:"opacity 1s ease .5s"}}>
          <div className="hero-divider-line"/>
          <span style={{color:"#C9A84C"}}>✦</span>
          <div className="hero-divider-line" style={{transform:"scaleX(-1)"}}/>
        </div>
        <p className="hero-text" style={{opacity:v?1:0,transition:"opacity 1s ease .6s"}}>
          Une table d exception.<br/>Chaque plat, une signature.<br/>Chaque moment, un souvenir.
        </p>
        <div className="hero-btns" style={{opacity:v?1:0,transition:"opacity 1s ease .8s"}}>
          <button className="btn-gold" onClick={() => setSection("reservation")}>Reserver une table</button>
          <button className="btn-ghost" onClick={() => setSection("menu")}>Voir le menu</button>
        </div>
      </div>
    </section>
  )
}

// ─── CAROUSEL ─────────────────────────────────────────────────────────────────
function Carousel() {
  const [plats, setPlats] = useState([])
  const [idx, setIdx] = useState(0)
  const [auto, setAuto] = useState(true)
  useEffect(() => {
    supabase.from("plats").select("*,categories(nom)").eq("actif",true).order("ordre").then(({data}) => {
      if (data && data.length > 0) setPlats(data)
      else setPlats([
        {id:1,nom:"Foie Gras Poele",description:"Chutney de figues, brioche toastee",prix:28,categories:{nom:"Entrees"}},
        {id:2,nom:"Homard Bleu Roti",description:"Beurre de corail, bisque legere",prix:72,categories:{nom:"Plats"}},
        {id:3,nom:"Filet de Boeuf Rossini",description:"Sauce Perigueux, legumes de saison",prix:58,categories:{nom:"Plats"}},
        {id:4,nom:"Souffle Grand Marnier",description:"Creme anglaise vanille Bourbon",prix:18,categories:{nom:"Desserts"}},
        {id:5,nom:"Tartare Saint-Jacques",description:"Agrumes, caviar de truite",prix:32,categories:{nom:"Entrees"}},
        {id:6,nom:"Mille-Feuille",description:"Caramel beurre sale, framboises",prix:15,categories:{nom:"Desserts"}},
      ])
    })
  }, [])
  useEffect(() => {
    if (!auto || plats.length===0) return
    const t = setInterval(() => setIdx(i => (i+1)%plats.length), 3500)
    return () => clearInterval(t)
  }, [auto, plats.length])
  if (plats.length===0) return null
  const prev = () => { setAuto(false); setIdx(i=>(i-1+plats.length)%plats.length) }
  const next = () => { setAuto(false); setIdx(i=>(i+1)%plats.length) }
  return (
    <Reveal>
      <div style={{position:"relative",width:"100%",overflow:"hidden",padding:"70px 0 90px",background:"linear-gradient(180deg,transparent,rgba(201,168,76,0.02),transparent)"}}>
        <p style={{textAlign:"center",fontSize:10,letterSpacing:6,color:"#C9A84C",textTransform:"uppercase",marginBottom:44,fontFamily:"Montserrat,sans-serif"}}>Notre Selection</p>
        <div style={{display:"flex",transition:"transform .7s cubic-bezier(.4,0,.2,1)",transform:`translateX(calc(-${idx*290}px + 50vw - 145px))`,gap:20,paddingLeft:20}}>
          {plats.map((p,i) => (
            <div key={p.id} onClick={() => { setAuto(false); setIdx(i) }}
              style={{
                minWidth:270, padding:"32px 24px",
                background:i===idx?"rgba(201,168,76,0.09)":"rgba(245,240,232,0.015)",
                border:`1px solid ${i===idx?"rgba(201,168,76,0.5)":"rgba(201,168,76,0.08)"}`,
                transform:i===idx?"scale(1.06) translateY(-4px)":"scale(0.94)",
                transition:"all .5s cubic-bezier(.4,0,.2,1)",
                cursor:"none", textAlign:"center", flexShrink:0,
                boxShadow:i===idx?"0 20px 40px rgba(0,0,0,0.4),0 0 40px rgba(201,168,76,0.08)":"none",
              }}>
              {p.photo_url
                ? <img src={p.photo_url} alt={p.nom} style={{width:"100%",height:150,objectFit:"cover",marginBottom:18}}/>
                : <div style={{width:"100%",height:150,background:"rgba(201,168,76,0.05)",marginBottom:18,display:"flex",alignItems:"center",justifyContent:"center",fontSize:44}}>🍽️</div>
              }
              <p style={{fontSize:9,letterSpacing:3,color:"#C9A84C",textTransform:"uppercase",marginBottom:8,fontFamily:"Montserrat,sans-serif"}}>{p.categories?.nom}</p>
              <h3 style={{fontFamily:"Playfair Display,serif",fontSize:19,fontStyle:"italic",color:"#F5F0E8",marginBottom:8}}>{p.nom}</h3>
              <p style={{fontSize:11,color:"rgba(245,240,232,0.42)",marginBottom:14,lineHeight:1.6}}>{p.description}</p>
              <p style={{fontFamily:"Playfair Display,serif",fontSize:22,color:"#C9A84C",fontStyle:"italic"}}>{p.prix}€</p>
            </div>
          ))}
        </div>
        <button onClick={prev} style={{position:"absolute",left:16,top:"50%",transform:"translateY(-50%)",background:"rgba(5,4,2,0.85)",border:"1px solid rgba(201,168,76,0.25)",color:"#C9A84C",width:44,height:44,fontSize:20,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(10px)",transition:"all .3s"}}
          onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(201,168,76,0.6)";e.currentTarget.style.background="rgba(201,168,76,0.1)"}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(201,168,76,0.25)";e.currentTarget.style.background="rgba(5,4,2,0.85)"}}>‹</button>
        <button onClick={next} style={{position:"absolute",right:16,top:"50%",transform:"translateY(-50%)",background:"rgba(5,4,2,0.85)",border:"1px solid rgba(201,168,76,0.25)",color:"#C9A84C",width:44,height:44,fontSize:20,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(10px)",transition:"all .3s"}}
          onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(201,168,76,0.6)";e.currentTarget.style.background="rgba(201,168,76,0.1)"}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(201,168,76,0.25)";e.currentTarget.style.background="rgba(5,4,2,0.85)"}}>›</button>
        <div style={{display:"flex",justifyContent:"center",gap:8,marginTop:36}}>
          {plats.map((_,i) => (
            <div key={i} onClick={() => { setAuto(false); setIdx(i) }}
              style={{width:i===idx?28:8,height:8,borderRadius:4,background:i===idx?"#C9A84C":"rgba(201,168,76,0.25)",transition:"all .4s cubic-bezier(.4,0,.2,1)",cursor:"none"}}/>
          ))}
        </div>
      </div>
    </Reveal>
  )
}

// ─── AVIS ─────────────────────────────────────────────────────────────────────
function Avis() {
  const [avis, setAvis] = useState([])
  useEffect(() => {
    supabase.from("avis").select("*").eq("publie",true).order("created_at",{ascending:false}).limit(6).then(({data}) => {
      if (data) setAvis(data)
    })
  }, [])
  if (avis.length===0) return null
  const moyenne = (avis.reduce((s,a) => s+a.note, 0)/avis.length).toFixed(1)
  return (
    <div style={{padding:"70px 20px",position:"relative",zIndex:2}}>
      <Reveal>
        <div style={{textAlign:"center",marginBottom:52}}>
          <p style={{fontSize:10,letterSpacing:5,color:"#C9A84C",textTransform:"uppercase",marginBottom:20,fontFamily:"Montserrat,sans-serif"}}>Ce qu ils disent</p>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:16,marginBottom:10}}>
            <span style={{fontFamily:"Playfair Display,serif",fontSize:56,color:"#C9A84C",fontStyle:"italic"}}>{moyenne}</span>
            <div>
              <div style={{display:"flex",gap:4}}>
                {[1,2,3,4,5].map(i=><span key={i} style={{color:i<=Math.round(moyenne)?"#C9A84C":"rgba(201,168,76,0.2)",fontSize:22}}>★</span>)}
              </div>
              <p style={{fontSize:11,color:"rgba(245,240,232,0.38)",marginTop:4,fontFamily:"Montserrat,sans-serif"}}>{avis.length} avis verifies</p>
            </div>
          </div>
          <Divider/>
        </div>
      </Reveal>
      <div style={{maxWidth:1000,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:2}}>
        {avis.map((a,i) => (
          <Reveal key={a.id} delay={i*.1}>
            <div style={{padding:"30px 26px",background:"rgba(245,240,232,0.015)",border:"1px solid rgba(201,168,76,0.07)",transition:"all .4s",height:"100%"}}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(201,168,76,0.04)";e.currentTarget.style.borderColor="rgba(201,168,76,0.18)"}}
              onMouseLeave={e=>{e.currentTarget.style.background="rgba(245,240,232,0.015)";e.currentTarget.style.borderColor="rgba(201,168,76,0.07)"}}>
              <div style={{display:"flex",gap:3,marginBottom:14}}>
                {[1,2,3,4,5].map(i=><span key={i} style={{color:i<=a.note?"#C9A84C":"rgba(201,168,76,0.2)",fontSize:15}}>★</span>)}
              </div>
              <p style={{fontSize:14,color:"rgba(245,240,232,0.72)",lineHeight:1.9,marginBottom:18,fontStyle:"italic",fontFamily:"Playfair Display,serif"}}>{a.commentaire}</p>
              <p style={{fontSize:11,color:"#C9A84C",letterSpacing:1,fontFamily:"Montserrat,sans-serif"}}>{a.prenom}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  )
}

// ─── MENU ─────────────────────────────────────────────────────────────────────
const ITEMS_DEFAULT = [
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
  const [plats, setPlats] = useState([])
  useEffect(() => {
    supabase.from("plats").select("*,categories(nom)").eq("actif",true).order("ordre").then(({data}) => {
      if (data && data.length>0) setPlats(data.map(p=>({...p,cat:p.categories?.nom,name:p.nom,desc:p.description,prix:p.prix?.toString(),e:"🍽️"})))
      else setPlats(ITEMS_DEFAULT)
    })
  }, [])
  const allCats = ["Tous",...new Set(plats.map(p=>p.cat).filter(Boolean))]
  const filtered = cat==="Tous" ? plats : plats.filter(p=>p.cat===cat)
  return (
    <section className="page-section">
      <SectionHeader label="Notre Carte" title="Le Menu" subtitle="Des produits exception, sublimes par le Chef. Chaque assiette est une oeuvre ephemere."/>
      <Reveal>
        <div className="filter-bar">
          {allCats.map(c=>(
            <button key={c} onClick={()=>setCat(c)} className={`filter-btn ${cat===c?"filter-active":"filter-inactive"}`}>{c}</button>
          ))}
        </div>
      </Reveal>
      <div className="menu-grid">
        {filtered.map((item,i) => (
          <Reveal key={item.id||i} delay={i*.05}>
            <div className="menu-card" onClick={() => setSel(item)}>
              {item.photo_url
                ? <img src={item.photo_url} alt={item.name} style={{width:"100%",height:160,objectFit:"cover",marginBottom:16}}/>
                : <div style={{fontSize:30,marginBottom:14}}>{item.e||"🍽️"}</div>
              }
              <p className="menu-cat">{item.cat}</p>
              <h3 className="menu-name">{item.name}</h3>
              <p className="menu-desc">{item.desc}</p>
              {item.allergenes?.length>0&&<p style={{fontSize:10,color:"rgba(201,168,76,0.45)",marginBottom:8,fontFamily:"Montserrat,sans-serif"}}>⚠ {item.allergenes.join(", ")}</p>}
              <p className="menu-prix">{item.prix}€</p>
            </div>
          </Reveal>
        ))}
      </div>
      {sel && (
        <div className="modal-overlay" onClick={() => setSel(null)}>
          <div className="modal-box" onClick={e=>e.stopPropagation()}>
            {sel.photo_url
              ? <img src={sel.photo_url} alt={sel.name} style={{width:"100%",height:180,objectFit:"cover",marginBottom:20}}/>
              : <div style={{fontSize:52,marginBottom:20}}>{sel.e||"🍽️"}</div>
            }
            <p className="modal-cat">{sel.cat}</p>
            <h3 className="modal-name">{sel.name}</h3>
            <Divider/>
            <p className="modal-desc">{sel.desc}</p>
            {sel.allergenes?.length>0&&(
              <div style={{marginTop:18,padding:"11px 16px",background:"rgba(201,168,76,0.05)",border:"1px solid rgba(201,168,76,0.18)"}}>
                <p style={{fontSize:9,letterSpacing:2,color:"#C9A84C",textTransform:"uppercase",marginBottom:6,fontFamily:"Montserrat,sans-serif"}}>Allergenes</p>
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

// ─── EVENEMENTS ───────────────────────────────────────────────────────────────
const EVT_TYPES = ["Mariage","Anniversaire","Seminaire","Soiree privee","Repas entreprise","Autre"]

function EventsPage() {
  const [form, setForm] = useState({type:"",date:"",personnes:"",budget:"",prenom:"",nom:"",email:"",telephone:"",message:""})
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const up = (k,v) => setForm(f=>({...f,[k]:v}))
  const send = async () => {
    if (!form.prenom||!form.email||!form.telephone||!form.type) return
    setSending(true)
    const {error} = await supabase.from("evenements").insert([{
      type_event:form.type, date_souhaitee:form.date||null,
      nombre_personnes:form.personnes?parseInt(form.personnes):null,
      budget:form.budget, prenom:form.prenom, nom:form.nom,
      email:form.email, telephone:form.telephone, message:form.message,
    }])
    setSending(false)
    if (!error) setSent(true)
  }
  const iS = {width:"100%",padding:"12px 14px",background:"rgba(245,240,232,0.04)",border:"1px solid rgba(201,168,76,0.18)",color:"#F5F0E8",fontSize:13,outline:"none",marginBottom:10}
  const lS = {fontSize:10,letterSpacing:3,color:"#C9A84C",textTransform:"uppercase",display:"block",marginBottom:8,fontFamily:"Montserrat,sans-serif"}
  return (
    <section className="page-section">
      <SectionHeader label="Evenementiel" title="Votre Evenement" subtitle="Mariage, anniversaire, seminaire, repas entreprise. Une experience sur mesure."/>
      <Reveal>
        <div style={{maxWidth:960,margin:"0 auto 64px",display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:1,background:"rgba(201,168,76,0.07)"}}>
          {[
            {t:"Mariages",d:"Une reception d exception pour le plus beau jour de votre vie.",i:"💍"},
            {t:"Anniversaires",d:"Celebrez dans un ecrin de raffinement. Menu degustation, decoration.",i:"✨"},
            {t:"Seminaires",d:"Impressionnez collaborateurs et clients autour d un repas gastronomique.",i:"🤝"},
            {t:"Soirees Privees",d:"Privatisation de la salle pour vos evenements exclusifs. Jusqu a 40 couverts.",i:"🥂"},
            {t:"Repas Entreprise",d:"Fidelisez vos equipes autour d une table d exception.",i:"🏢"},
            {t:"Cocktails",d:"Cocktail dinatoire ou aperitif de prestige avec mignardises gastronomiques.",i:"🍾"},
          ].map((ev,i)=>(
            <div key={i} className="evt-card">
              <div className="evt-icon">{ev.i}</div>
              <h3 className="evt-title">{ev.t}</h3>
              <p className="evt-desc">{ev.d}</p>
            </div>
          ))}
        </div>
      </Reveal>
      <div style={{maxWidth:560,margin:"0 auto"}}>
        <SectionHeader label="Devis gratuit" title="Demande de Devis"/>
        {sent ? (
          <Reveal>
            <div style={{textAlign:"center",padding:"44px 20px"}}>
              <div style={{fontSize:52,marginBottom:22,animation:"float 3s ease-in-out infinite"}}>✦</div>
              <h3 style={{fontFamily:"Playfair Display,serif",fontSize:30,fontStyle:"italic",color:"#C9A84C",marginBottom:14}}>Demande envoyee</h3>
              <Divider/>
              <p style={{marginTop:22,fontSize:13,lineHeight:2,color:"rgba(245,240,232,0.6)"}}>Nous vous recontactons sous 24h.</p>
            </div>
          </Reveal>
        ) : (
          <Reveal>
            <div>
              <label style={lS}>Type d evenement *</label>
              <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:18}}>
                {EVT_TYPES.map(t=>(
                  <button key={t} onClick={()=>up("type",t)} style={{padding:"8px 16px",background:form.type===t?"#C9A84C":"transparent",border:`1px solid ${form.type===t?"#C9A84C":"rgba(201,168,76,0.2)"}`,color:form.type===t?"#080604":"rgba(245,240,232,0.55)",fontSize:11,transition:"all .3s",cursor:"none"}}>{t}</button>
                ))}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}} className="form-grid">
                <div><label style={lS}>Date souhaitee</label><input type="date" value={form.date} onChange={e=>up("date",e.target.value)} style={iS}/></div>
                <div><label style={lS}>Nombre de personnes</label><input type="number" value={form.personnes} onChange={e=>up("personnes",e.target.value)} style={iS} placeholder="Ex: 50"/></div>
              </div>
              <label style={lS}>Budget estime</label>
              <select value={form.budget} onChange={e=>up("budget",e.target.value)} style={{...iS,cursor:"none"}}>
                <option value="">Selectionner</option>
                <option>Moins de 1 000€</option>
                <option>1 000€ - 3 000€</option>
                <option>3 000€ - 5 000€</option>
                <option>5 000€ - 10 000€</option>
                <option>Plus de 10 000€</option>
              </select>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}} className="form-grid">
                <div><label style={lS}>Prenom *</label><input value={form.prenom} onChange={e=>up("prenom",e.target.value)} style={iS} placeholder="Prenom"/></div>
                <div><label style={lS}>Nom</label><input value={form.nom} onChange={e=>up("nom",e.target.value)} style={iS} placeholder="Nom"/></div>
              </div>
              <label style={lS}>Email *</label>
              <input type="email" value={form.email} onChange={e=>up("email",e.target.value)} style={iS} placeholder="Email"/>
              <label style={lS}>Telephone *</label>
              <input type="tel" value={form.telephone} onChange={e=>up("telephone",e.target.value)} style={iS} placeholder="Telephone"/>
              <label style={lS}>Votre projet</label>
              <textarea value={form.message} onChange={e=>up("message",e.target.value)} rows={4} style={{...iS,resize:"vertical"}} placeholder="Decrivez votre evenement..."/>
              <button onClick={send} disabled={sending} style={{width:"100%",padding:17,background:sending?"rgba(201,168,76,0.5)":"#C9A84C",border:"none",color:"#080604",fontSize:11,letterSpacing:4,textTransform:"uppercase",fontWeight:500,cursor:"none",fontFamily:"Montserrat,sans-serif",transition:"all .3s"}}
                onMouseEnter={e=>{if(!sending)e.currentTarget.style.boxShadow="0 8px 24px rgba(201,168,76,0.3)"}}
                onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}>
                {sending?"Envoi en cours...":"Envoyer ma demande"}
              </button>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  )
}

// ─── RESERVATION ──────────────────────────────────────────────────────────────
const MENUS_R = [
  {id:"classique",label:"Menu Classique",prix:"85",acompte:"25"},
  {id:"prestige",label:"Menu Prestige",prix:"135",acompte:"40"},
  {id:"degustation",label:"Menu Degustation",prix:"175",acompte:"55"},
]
const TIMES_R = ["12:00","12:30","13:00","19:00","19:30","20:00","20:30","21:00"]

function ReservationPage() {
  const [step, setStep] = useState(1)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({date:"",time:"",guests:"2",firstName:"",lastName:"",email:"",phone:"",note:"",menu:"classique"})
  const up = (k,v) => setForm(f=>({...f,[k]:v}))
  const sm = MENUS_R.find(m=>m.id===form.menu)
  const ok1 = form.date && form.time
  const ok2 = form.firstName && form.email && form.phone
  const iS = {width:"100%",padding:"12px 14px",background:"rgba(245,240,232,0.04)",border:"1px solid rgba(201,168,76,0.18)",color:"#F5F0E8",fontSize:13,outline:"none",transition:"border-color .3s"}
  const lS = {fontSize:10,letterSpacing:3,color:"#C9A84C",textTransform:"uppercase",display:"block",marginBottom:8,fontFamily:"Montserrat,sans-serif"}

  const pay = async () => {
    setSending(true); setError("")
    const {data:res, error:dbErr} = await supabase.from("reservations").insert([{
      date:form.date, heure:form.time, couverts:parseInt(form.guests),
      prenom:form.firstName, nom:form.lastName,
      email:form.email, telephone:form.phone,
      menu_choisi:sm?.label, acompte:parseFloat(sm?.acompte),
      note_client:form.note, statut:"en_attente", paiement_statut:"en_attente",
    }]).select().single()
    if (dbErr) { setError("Erreur. Veuillez reessayer."); setSending(false); return }
    const r = await fetch("/api/checkout", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({reservationId:res.id,montant:parseFloat(sm?.acompte),menu:sm?.label,prenom:form.firstName,nom:form.lastName,email:form.email,date:form.date,heure:form.time}),
    })
    const {url} = await r.json()
    if (url) window.location.href = url
    else { setError("Erreur paiement. Veuillez reessayer."); setSending(false) }
  }

  return (
    <section className="page-section">
      <SectionHeader label="Reservation" title="Votre Table"/>
      <Reveal>
        <div className="steps">
          {[1,2,3].map(s=>(
            <div key={s} className="step">
              <div className={`step-num ${step>=s?"step-active":"step-inactive"}`}>{s}</div>
              <p className={`step-label ${step>=s?"step-label-active":"step-label-inactive"}`}>{s===1?"Date":s===2?"Infos":"Paiement"}</p>
              {s<3&&<div className={`step-line ${step>s?"step-line-done":"step-line-todo"}`}/>}
            </div>
          ))}
        </div>
      </Reveal>
      <Reveal delay={.1}>
        <div className="form-wrap">
          {step===1&&(
            <div>
              <div className="form-grid">
                <div><label style={lS}>Date</label><input type="date" value={form.date} onChange={e=>up("date",e.target.value)} style={iS}/></div>
                <div><label style={lS}>Couverts</label>
                  <select value={form.guests} onChange={e=>up("guests",e.target.value)} style={{...iS,cursor:"none"}}>
                    {[1,2,3,4,5,6,7,8].map(n=><option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
              <div style={{marginBottom:22}}>
                <label style={lS}>Heure</label>
                <div className="time-grid">
                  {TIMES_R.map(t=><button key={t} onClick={()=>up("time",t)} className={`time-btn ${form.time===t?"time-active":"time-inactive"}`}>{t}</button>)}
                </div>
              </div>
              <div style={{marginBottom:22}}>
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
              <div style={{marginBottom:28}}>
                <label style={lS}>Note personnelle</label>
                <textarea value={form.note} onChange={e=>up("note",e.target.value)} rows={3} style={{...iS,resize:"vertical",width:"100%"}} placeholder="Allergies, surprise, occasion speciale..."/>
                <p style={{fontSize:10,color:"rgba(245,240,232,0.28)",marginTop:6,fontFamily:"Montserrat,sans-serif"}}>Visible uniquement par notre equipe</p>
              </div>
              <button onClick={()=>{if(ok1)setStep(2)}} className={`btn-continue ${ok1?"btn-continue-active":"btn-continue-disabled"}`}>Continuer</button>
            </div>
          )}
          {step===2&&(
            <div>
              <div className="form-grid">
                {[["firstName","Prenom"],["lastName","Nom"]].map(([k,l])=>(
                  <div key={k}><label style={lS}>{l}</label><input value={form[k]} onChange={e=>up(k,e.target.value)} style={iS} placeholder={l}/></div>
                ))}
              </div>
              {[["email","Email","email"],["phone","Telephone","tel"]].map(([k,l,t])=>(
                <div key={k} style={{marginBottom:10}}><label style={lS}>{l}</label><input type={t} value={form[k]} onChange={e=>up(k,e.target.value)} style={iS} placeholder={l}/></div>
              ))}
              <div className="btn-row" style={{marginTop:18}}>
                <button onClick={()=>setStep(1)} className="btn-back">Retour</button>
                <button onClick={()=>{if(ok2)setStep(3)}} className={`btn-continue ${ok2?"btn-continue-active":"btn-continue-disabled"}`} style={{flex:1}}>Continuer</button>
              </div>
            </div>
          )}
          {step===3&&(
            <div>
              <div className="recap">
                <p className="recap-title">Recapitulatif</p>
                {[["Date",form.date],["Heure",form.time],["Couverts",form.guests+" pers."],["Menu",sm?.label],["Nom",form.firstName+" "+form.lastName],["Email",form.email],["Tel",form.phone]].map(([l,v])=>(
                  <div key={l} className="recap-row"><span className="recap-key">{l}</span><span className="recap-val">{v}</span></div>
                ))}
                {form.note&&(
                  <div style={{marginTop:12,padding:"10px 14px",background:"rgba(201,168,76,0.05)",border:"1px solid rgba(201,168,76,0.12)"}}>
                    <p style={{fontSize:9,letterSpacing:2,color:"#C9A84C",textTransform:"uppercase",marginBottom:4,fontFamily:"Montserrat,sans-serif"}}>Note personnelle</p>
                    <p style={{fontSize:12,color:"rgba(245,240,232,0.6)"}}>{form.note}</p>
                  </div>
                )}
                <div className="recap-total">
                  <span className="recap-total-label">Acompte</span>
                  <span className="recap-total-val">{sm?.acompte}€</span>
                </div>
              </div>
              <div className="confirm-box">
                <p className="confirm-title">🔒 Paiement securise Stripe</p>
                <p className="confirm-text">Vous allez etre redirige vers Stripe. Email + SMS de confirmation apres paiement.</p>
              </div>
              {error&&<p style={{color:"#e74c3c",fontSize:12,marginBottom:14,textAlign:"center",fontFamily:"Montserrat,sans-serif"}}>{error}</p>}
              <div className="btn-row">
                <button onClick={()=>setStep(2)} className="btn-back">Retour</button>
                <button onClick={pay} disabled={sending} className="btn-pay" style={{background:sending?"rgba(201,168,76,0.5)":"#C9A84C",cursor:"none"}}>
                  {sending?"Redirection...":"Payer "+sm?.acompte+"€"}
                </button>
              </div>
            </div>
          )}
        </div>
      </Reveal>
    </section>
  )
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer({ setSection }) {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <div className="footer-brand"><Logo size={34}/><span className="footer-brand-name">Le Goya</span></div>
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
          <p className="footer-text">contact@legoya.fr<br/>+33 1 XX XX XX XX<br/>Paris, France</p>
        </div>
        <div>
          <p className="footer-heading">Horaires</p>
          <p className="footer-text">Mar — Sam<br/>12h — 14h<br/>19h — 22h30</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p className="footer-copy">2025 Le Goya — Tous droits reserves</p>
        <p className="footer-copy">Mentions legales · RGPD</p>
      </div>
    </footer>
  )
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function LeGoyaApp() {
  const [section, setSection] = useState("accueil")
  const [loaded, setLoaded] = useState(false)
  const [transitioning, setTransitioning] = useState(false)

  const go = useCallback(s => {
    setTransitioning(true)
    setTimeout(() => {
      setSection(s)
      window.scrollTo({top:0,behavior:"instant"})
      setTransitioning(false)
    }, 350)
  }, [])

  const pages = {
    accueil: (<><Hero setSection={go}/><Carousel/><Avis/></>),
    menu: <MenuPage/>,
    evenements: <EventsPage/>,
    reservation: <ReservationPage/>,
  }

  return (
    <div className="goya-wrap">
      {!loaded && <LoadingScreen onDone={() => setLoaded(true)}/>}
      <Cursor/>
      <GoldParticles/>
      <Nav section={section} setSection={go}/>
      <div className={`page-transition page-content${transitioning?" out":" in"}`}>
        {pages[section]||pages.accueil}
        <Footer setSection={go}/>
      </div>
    </div>
  )
}
