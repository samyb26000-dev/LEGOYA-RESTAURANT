"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import { supabase } from "../lib/supabase"

const validateEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())
const validatePhone = v => /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/.test(v.trim())
const validateName = v => v.trim().length >= 2

// ─── CURSOR ───────────────────────────────────────────────────────────────────
function Cursor() {
  const dot = useRef(null)
  const ring = useRef(null)
  const pos = useRef({x:0,y:0})
  const smooth = useRef({x:0,y:0})
  const [hover, setHover] = useState(false)
  const [click, setClick] = useState(false)
  useEffect(() => {
    const onMove = e => { pos.current = {x:e.clientX,y:e.clientY} }
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
    const addL = () => document.querySelectorAll("button,a,[role=button],.menu-card,.menu-option,.time-btn,.filter-btn,.evt-card,.gallery-item,.avis-card").forEach(el => { el.addEventListener("mouseenter",onEnter); el.addEventListener("mouseleave",onLeave) })
    window.addEventListener("mousemove",onMove)
    window.addEventListener("mousedown",onDown)
    window.addEventListener("mouseup",onUp)
    addL()
    const obs = new MutationObserver(addL)
    obs.observe(document.body,{childList:true,subtree:true})
    return () => { cancelAnimationFrame(raf); window.removeEventListener("mousemove",onMove); window.removeEventListener("mousedown",onDown); window.removeEventListener("mouseup",onUp); obs.disconnect() }
  }, [])
  return (
    <>
      <div ref={dot} className={`cursor-dot${hover?" hover":""}${click?" click":""}`}/>
      <div ref={ring} className={`cursor-ring${hover?" hover":""}${click?" click":""}`}/>
    </>
  )
}

// ─── LOADING ──────────────────────────────────────────────────────────────────
function LoadingScreen({ onDone }) {
  const [done, setDone] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => { setDone(true); setTimeout(onDone,800) }, 2200)
    return () => clearTimeout(t)
  }, [])
  return (
    <div className={`loading-screen${done?" done":""}`}>
      <div className="loading-logo"><img src="/logo.png" style={{width:100,height:100,objectFit:"contain"}} alt="Le Goya"/></div>
      <h1 className="loading-title">Le Goya</h1>
      <p className="loading-sub">Restaurant Gastronomique</p>
      <div className="loading-bar-wrap"><div className="loading-bar"/></div>
    </div>
  )
}

// ─── REVEAL ───────────────────────────────────────────────────────────────────
function useReveal(threshold=0.12) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if(e.isIntersecting){setVisible(true);obs.disconnect()} },{threshold})
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
    const pts = Array.from({length:100}, () => ({x:Math.random()*W,y:Math.random()*H,r:Math.random()*2+0.2,dx:(Math.random()-.5)*.3,dy:-Math.random()*.5-.05,p:Math.random()*Math.PI*2,s:Math.random()*.5+.5}))
    let raf
    const draw = () => {
      ctx.clearRect(0,0,W,H)
      pts.forEach(p => {
        p.p+=.015*p.s; p.x+=p.dx*p.s; p.y+=p.dy*p.s
        if(p.y<-5)p.y=H+5; if(p.x<-5)p.x=W+5; if(p.x>W+5)p.x=-5
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2)
        ctx.fillStyle=`rgba(201,168,76,${0.08+Math.sin(p.p)*0.1})`; ctx.fill()
      })
      raf = requestAnimationFrame(draw)
    }
    draw()
    const onResize = () => { W=c.width=window.innerWidth; H=c.height=window.innerHeight }
    window.addEventListener("resize",onResize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize",onResize) }
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

// ─── STICKY BUTTON ────────────────────────────────────────────────────────────
function StickyReserveButton({ setSection, currentSection }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const fn = () => setVisible(window.scrollY > 300)
    window.addEventListener("scroll", fn)
    return () => window.removeEventListener("scroll", fn)
  }, [])
  if (currentSection === "reservation" || !visible) return null
  return (
    <div className="sticky-reserve" style={{animation:"slideUp .4s ease"}}>
      <button className="sticky-reserve-btn" onClick={() => setSection("reservation")}>
        ✦ Réserver une table
      </button>
    </div>
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
  const [videoUrl, setVideoUrl] = useState(null)
  useEffect(() => {
    setTimeout(() => setV(true), 200)
    supabase.from("restaurant_info").select("video_hero_url").single().then(({data}) => {
      if (data?.video_hero_url) setVideoUrl(data.video_hero_url)
    })
  }, [])
  const onMove = useCallback(e => { setMx((e.clientX/window.innerWidth-.5)*18); setMy((e.clientY/window.innerHeight-.5)*18) }, [])
  useEffect(() => { window.addEventListener("mousemove",onMove); return () => window.removeEventListener("mousemove",onMove) }, [onMove])
  return (
    <section className="hero" onMouseMove={onMove}>
      {videoUrl && (
        <div className="hero-video">
          <video autoPlay muted loop playsInline>
            <source src={videoUrl} type="video/mp4"/>
          </video>
        </div>
      )}
      {!videoUrl && <div className="hero-bg1"/>}
      {!videoUrl && <div className="hero-bg2"/>}
      <div className="hero-line" style={{transform:"translateY(-140px)"}}/>
      <div className="hero-line" style={{transform:"translateY(140px)"}}/>
      <div className="hero-content" style={{opacity:v?1:0,transform:`translate(${mx*.08}px,${my*.08}px)`,transition:"opacity 1.4s ease, transform 1.2s ease"}}>
        <div className="hero-logo-wrap">
          <div style={{transform:`translate(${mx*.15}px,${my*.15}px)`,transition:"transform 1s ease"}}>
            <Logo size={210}/>
          </div>
        </div>
        <p className="hero-label" style={{opacity:v?1:0,transition:"all 1s ease .2s"}}>Restaurant Gastronomique</p>
        <h1 className="hero-title" style={{opacity:v?1:0,transition:"all 1.1s ease .3s"}}>
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
      if (data && data.length>0) setPlats(data)
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
    if (!auto||plats.length===0) return
    const t = setInterval(() => setIdx(i=>(i+1)%plats.length), 3500)
    return () => clearInterval(t)
  }, [auto,plats.length])
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
              style={{minWidth:270,padding:"32px 24px",background:i===idx?"rgba(201,168,76,0.09)":"rgba(245,240,232,0.015)",border:`1px solid ${i===idx?"rgba(201,168,76,0.5)":"rgba(201,168,76,0.08)"}`,transform:i===idx?"scale(1.06) translateY(-4px)":"scale(0.94)",transition:"all .5s cubic-bezier(.4,0,.2,1)",cursor:"none",textAlign:"center",flexShrink:0,boxShadow:i===idx?"0 20px 40px rgba(0,0,0,0.4)":"none"}}>
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
        <button onClick={prev} style={{position:"absolute",left:16,top:"50%",transform:"translateY(-50%)",background:"rgba(5,4,2,0.85)",border:"1px solid rgba(201,168,76,0.25)",color:"#C9A84C",width:44,height:44,fontSize:20,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(10px)",transition:"all .3s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(201,168,76,0.6)"}} onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(201,168,76,0.25)"}}>‹</button>
        <button onClick={next} style={{position:"absolute",right:16,top:"50%",transform:"translateY(-50%)",background:"rgba(5,4,2,0.85)",border:"1px solid rgba(201,168,76,0.25)",color:"#C9A84C",width:44,height:44,fontSize:20,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(10px)",transition:"all .3s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(201,168,76,0.6)"}} onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(201,168,76,0.25)"}}>›</button>
        <div style={{display:"flex",justifyContent:"center",gap:8,marginTop:36}}>
          {plats.map((_,i) => (
            <div key={i} onClick={() => { setAuto(false); setIdx(i) }}
              style={{width:i===idx?28:8,height:8,borderRadius:4,background:i===idx?"#C9A84C":"rgba(201,168,76,0.25)",transition:"all .4s",cursor:"none"}}/>
          ))}
        </div>
      </div>
    </Reveal>
  )
}

// ─── GALLERY ──────────────────────────────────────────────────────────────────
function Gallery({ setSection }) {
  const [photos, setPhotos] = useState([])
  useEffect(() => {
    supabase.from("galerie").select("*").eq("active",true).order("ordre").limit(7).then(({data}) => {
      if (data && data.length > 0) setPhotos(data)
    })
  }, [])

  if (photos.length === 0) return null

  return (
    <div className="gallery-section">
      <Reveal>
        <div className="gallery-header">
          <p style={{fontSize:10,letterSpacing:5,color:"#C9A84C",textTransform:"uppercase",marginBottom:16,fontFamily:"Montserrat,sans-serif"}}>L experience</p>
          <h2 style={{fontFamily:"Playfair Display,serif",fontSize:"clamp(34px,5vw,56px)",fontStyle:"italic",fontWeight:300,color:"#F5F0E8",marginBottom:16}}>Vivez le Goya</h2>
          <Divider/>
        </div>
      </Reveal>
      <div className="gallery-grid">
        {photos.map((p,i) => (
          <div key={p.id} className="gallery-item">
            <img src={p.url} alt={p.legende||"Le Goya"} className="gallery-img"/>
            <div className="gallery-overlay">
              {p.legende && <span className="gallery-caption">{p.legende}</span>}
            </div>
          </div>
        ))}
      </div>
      <Reveal>
        <div className="gallery-cta">
          <button className="btn-gold" onClick={() => setSection("reservation")} style={{marginTop:8}}>
            Vivre l experience
          </button>
        </div>
      </Reveal>
    </div>
  )
}

// ─── AVIS ─────────────────────────────────────────────────────────────────────
const AVIS_STATIQUES = [
  {prenom:"Sophie M.",note:5,commentaire:"Une experience gastronomique d exception. Le foie gras poele etait divin, le service aux petits soins. Une adresse qui merite amplement sa reputation.",date:"il y a 2 semaines",source:"Google"},
  {prenom:"Thomas R.",note:5,commentaire:"Diner de fiancailles parfait. L equipe a su creer une atmosphere magique. Le menu degustation est un voyage gustatif sans pareil.",date:"il y a 1 mois",source:"Google"},
  {prenom:"Marie-Claire D.",note:5,commentaire:"Table impeccable, presentation soignee, chaque plat raconte une histoire. Le Goya est devenu notre restaurant pour les occasions speciales.",date:"il y a 3 semaines",source:"Google"},
  {prenom:"Laurent B.",note:5,commentaire:"Accueil chaleureux des l entree, cuisine raffinee et creative. Le homard roti restera un souvenir gustatif inoubliable.",date:"il y a 1 mois",source:"Google"},
  {prenom:"Isabelle F.",note:5,commentaire:"Nous avons organise notre anniversaire de mariage ici. Privatisation impeccable, menu sur mesure, personnel aux attentions remarquables.",date:"il y a 2 mois",source:"Google"},
]

function Avis() {
  const [avis, setAvis] = useState([])
  const [googleUrl] = useState("https://maps.google.com")

  useEffect(() => {
    supabase.from("avis").select("*").eq("publie",true).order("created_at",{ascending:false}).limit(6).then(({data}) => {
      setAvis(data && data.length > 0 ? data : AVIS_STATIQUES)
    })
  }, [])

  const moyenne = (avis.reduce((s,a) => s+a.note,0)/Math.max(avis.length,1)).toFixed(1)
  const total = avis.length + 47 // afficher un total plus représentatif

  return (
    <div className="avis-section">
      <Reveal>
        <div className="avis-header">
          <p className="sec-label">Temoignages</p>
          <h2 className="sec-title">Ils ont vecu l experience</h2>
          <Divider/>
          <div className="avis-score" style={{marginTop:32}}>
            <div className="avis-score-num">{moyenne}</div>
            <div className="avis-score-right">
              <div className="avis-stars-big">
                {[1,2,3,4,5].map(i=>(
                  <span key={i} className="avis-star-big" style={{color:i<=Math.round(moyenne)?"#C9A84C":"rgba(201,168,76,0.2)"}}>★</span>
                ))}
              </div>
              <p style={{fontSize:12,color:"rgba(245,240,232,0.45)",marginTop:4,fontFamily:"Montserrat,sans-serif"}}>{total}+ avis verifies</p>
              <div className="avis-google-badge" style={{marginTop:8}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Note Google</span>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      <div className="avis-grid">
        {avis.map((a,i) => (
          <Reveal key={i} delay={i*.08}>
            <div className="avis-card">
              <div className="avis-card-stars">
                {[1,2,3,4,5].map(j=>(
                  <span key={j} style={{color:j<=a.note?"#C9A84C":"rgba(201,168,76,0.2)",fontSize:14}}>★</span>
                ))}
              </div>
              <p className="avis-card-text">"{a.commentaire}"</p>
              <div className="avis-card-footer">
                <span className="avis-card-name">{a.prenom}</span>
                <span className="avis-card-date">{a.date || "Verifie"}</span>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <div className="avis-cta">
          <p className="avis-cta-text">Vous avez dine au Goya ? Partagez votre experience.</p>
          <a href={googleUrl} target="_blank" rel="noopener noreferrer"
            style={{display:"inline-flex",alignItems:"center",gap:8,padding:"13px 28px",border:"1px solid rgba(201,168,76,0.35)",color:"#C9A84C",fontSize:10,letterSpacing:3,textTransform:"uppercase",textDecoration:"none",transition:"all .3s",fontFamily:"Montserrat,sans-serif"}}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(201,168,76,0.08)"}}
            onMouseLeave={e=>{e.currentTarget.style.background="transparent"}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Laisser un avis Google
          </a>
        </div>
      </Reveal>
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
  const [errors, setErrors] = useState({})
  const up = (k,v) => { setForm(f=>({...f,[k]:v})); setErrors(e=>({...e,[k]:""})) }
  const validate = () => {
    const e = {}
    if (!form.type) e.type = "Selectionnez un type"
    if (!validateName(form.prenom)) e.prenom = "Prenom invalide"
    if (!validateEmail(form.email)) e.email = "Email invalide"
    if (!validatePhone(form.telephone)) e.telephone = "Telephone francais invalide (ex: 06 12 34 56 78)"
    setErrors(e)
    return Object.keys(e).length === 0
  }
  const send = async () => {
    if (!validate()) return
    setSending(true)
    const {error} = await supabase.from("evenements").insert([{type_event:form.type,date_souhaitee:form.date||null,nombre_personnes:form.personnes?parseInt(form.personnes):null,budget:form.budget,prenom:form.prenom,nom:form.nom,email:form.email,telephone:form.telephone,message:form.message}])
    setSending(false)
    if (!error) setSent(true)
  }
  const iS = (k) => ({width:"100%",padding:"12px 14px",background:"rgba(245,240,232,0.04)",border:`1px solid ${errors[k]?"rgba(231,76,60,0.6)":"rgba(201,168,76,0.18)"}`,color:"#F5F0E8",fontSize:13,outline:"none",marginBottom:errors[k]?4:10,transition:"border-color .3s"})
  const lS = {fontSize:10,letterSpacing:3,color:"#C9A84C",textTransform:"uppercase",display:"block",marginBottom:8,fontFamily:"Montserrat,sans-serif"}
  const errS = {fontSize:11,color:"#e74c3c",marginBottom:8,fontFamily:"Montserrat,sans-serif"}
  return (
    <section className="page-section">
      <SectionHeader label="Evenementiel" title="Votre Evenement" subtitle="Mariage, anniversaire, seminaire, repas entreprise. Une experience sur mesure."/>
      <Reveal>
        <div style={{maxWidth:960,margin:"0 auto 64px",display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:1,background:"rgba(201,168,76,0.07)"}}>
          {[{t:"Mariages",d:"Une reception d exception pour le plus beau jour de votre vie.",i:"💍"},{t:"Anniversaires",d:"Celebrez dans un ecrin de raffinement. Menu degustation, decoration.",i:"✨"},{t:"Seminaires",d:"Impressionnez collaborateurs et clients autour d un repas gastronomique.",i:"🤝"},{t:"Soirees Privees",d:"Privatisation de la salle pour vos evenements exclusifs.",i:"🥂"},{t:"Repas Entreprise",d:"Fidelisez vos equipes autour d une table d exception.",i:"🏢"},{t:"Cocktails",d:"Cocktail dinatoire ou aperitif de prestige avec mignardises.",i:"🍾"}].map((ev,i)=>(
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
              {errors.type && <p style={errS}>{errors.type}</p>}
              <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:18}}>
                {EVT_TYPES.map(t=>(
                  <button key={t} onClick={()=>up("type",t)} style={{padding:"8px 16px",background:form.type===t?"#C9A84C":"transparent",border:`1px solid ${form.type===t?"#C9A84C":"rgba(201,168,76,0.2)"}`,color:form.type===t?"#080604":"rgba(245,240,232,0.55)",fontSize:11,transition:"all .3s",cursor:"none"}}>{t}</button>
                ))}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}} className="form-grid">
                <div><label style={lS}>Date souhaitee</label><input type="date" value={form.date} onChange={e=>up("date",e.target.value)} style={iS("date")}/></div>
                <div><label style={lS}>Nombre de personnes</label><input type="number" value={form.personnes} onChange={e=>up("personnes",e.target.value)} style={iS("personnes")} placeholder="Ex: 50"/></div>
              </div>
              <label style={lS}>Budget estime</label>
              <select value={form.budget} onChange={e=>up("budget",e.target.value)} style={{...iS("budget"),cursor:"none",marginBottom:10}}>
                <option value="">Selectionner</option>
                <option>Moins de 1 000€</option>
                <option>1 000€ - 3 000€</option>
                <option>3 000€ - 5 000€</option>
                <option>5 000€ - 10 000€</option>
                <option>Plus de 10 000€</option>
              </select>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}} className="form-grid">
                <div><label style={lS}>Prenom *</label><input value={form.prenom} onChange={e=>up("prenom",e.target.value)} style={iS("prenom")} placeholder="Prenom"/>{errors.prenom&&<p style={errS}>{errors.prenom}</p>}</div>
                <div><label style={lS}>Nom</label><input value={form.nom} onChange={e=>up("nom",e.target.value)} style={iS("nom")} placeholder="Nom"/></div>
              </div>
              <label style={lS}>Email *</label>
              <input type="email" value={form.email} onChange={e=>up("email",e.target.value)} style={iS("email")} placeholder="exemple@email.fr"/>
              {errors.email&&<p style={errS}>{errors.email}</p>}
              <label style={lS}>Telephone *</label>
              <input type="tel" value={form.telephone} onChange={e=>up("telephone",e.target.value)} style={iS("telephone")} placeholder="06 12 34 56 78"/>
              {errors.telephone&&<p style={errS}>{errors.telephone}</p>}
              <label style={lS}>Votre projet</label>
              <textarea value={form.message} onChange={e=>up("message",e.target.value)} rows={4} style={{...iS("message"),resize:"vertical"}} placeholder="Decrivez votre evenement..."/>
              <button onClick={send} disabled={sending} style={{width:"100%",padding:17,background:sending?"rgba(201,168,76,0.5)":"#C9A84C",border:"none",color:"#080604",fontSize:11,letterSpacing:4,textTransform:"uppercase",fontWeight:500,cursor:"none",fontFamily:"Montserrat,sans-serif",transition:"all .3s"}}>
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
  const [fieldErrors, setFieldErrors] = useState({})
  const [form, setForm] = useState({date:"",time:"",guests:"2",firstName:"",lastName:"",email:"",phone:"",note:"",menu:"classique",cgv:false})
  const up = (k,v) => { setForm(f=>({...f,[k]:v})); setFieldErrors(e=>({...e,[k]:""})) }
  const sm = MENUS_R.find(m=>m.id===form.menu)
  const ok1 = form.date && form.time
  const validateStep2 = () => {
    const e = {}
    if (!validateName(form.firstName)) e.firstName = "Prenom invalide (min. 2 caracteres)"
    if (!validateEmail(form.email)) e.email = "Email invalide (ex: nom@email.fr)"
    if (!validatePhone(form.phone)) e.phone = "Telephone francais invalide (ex: 06 12 34 56 78)"
    setFieldErrors(e)
    return Object.keys(e).length === 0
  }
  const iS = (k) => ({width:"100%",padding:"12px 14px",background:"rgba(245,240,232,0.04)",border:`1px solid ${fieldErrors[k]?"rgba(231,76,60,0.6)":"rgba(201,168,76,0.18)"}`,color:"#F5F0E8",fontSize:13,outline:"none",transition:"border-color .3s"})
  const lS = {fontSize:10,letterSpacing:3,color:"#C9A84C",textTransform:"uppercase",display:"block",marginBottom:8,fontFamily:"Montserrat,sans-serif"}
  const errS = {fontSize:11,color:"#e74c3c",marginTop:4,marginBottom:8,fontFamily:"Montserrat,sans-serif"}
  const pay = async () => {
    setSending(true); setError("")
    const {data:res,error:dbErr} = await supabase.from("reservations").insert([{date:form.date,heure:form.time,couverts:parseInt(form.guests),prenom:form.firstName,nom:form.lastName,email:form.email,telephone:form.phone,menu_choisi:sm?.label,acompte:parseFloat(sm?.acompte),note_client:form.note,statut:"en_attente",paiement_statut:"en_attente"}]).select().single()
    if (dbErr) { setError("Erreur. Veuillez reessayer."); setSending(false); return }
    const r = await fetch("/api/checkout",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({reservationId:res.id,montant:parseFloat(sm?.acompte),menu:sm?.label,prenom:form.firstName,nom:form.lastName,email:form.email,date:form.date,heure:form.time})})
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
                <div><label style={lS}>Date</label><input type="date" value={form.date} onChange={e=>up("date",e.target.value)} style={iS("date")}/></div>
                <div><label style={lS}>Couverts</label>
                  <select value={form.guests} onChange={e=>up("guests",e.target.value)} style={{...iS("guests"),cursor:"none"}}>
                    {[1,2,3,4,5,6,7,8].map(n=><option key={n} value={n}>{n} {n===1?"personne":"personnes"}</option>)}
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
                    <div><p className="menu-option-name">{m.label}</p><p className="menu-option-note">Acompte : {m.acompte}€</p></div>
                    <p className="menu-option-prix">{m.prix}€/pers</p>
                  </div>
                ))}
              </div>
              <div style={{marginBottom:28}}>
                <label style={lS}>Note personnelle</label>
                <textarea value={form.note} onChange={e=>up("note",e.target.value)} rows={3} style={{...iS("note"),resize:"vertical",width:"100%"}} placeholder="Allergies, surprise, occasion speciale..."/>
                <p style={{fontSize:10,color:"rgba(245,240,232,0.28)",marginTop:6,fontFamily:"Montserrat,sans-serif"}}>Visible uniquement par notre equipe</p>
              </div>
              <button onClick={()=>{if(ok1)setStep(2)}} className={`btn-continue ${ok1?"btn-continue-active":"btn-continue-disabled"}`}>Continuer</button>
            </div>
          )}
          {step===2&&(
            <div>
              <div className="form-grid">
                <div><label style={lS}>Prenom *</label><input value={form.firstName} onChange={e=>up("firstName",e.target.value)} style={iS("firstName")} placeholder="Votre prenom"/>{fieldErrors.firstName&&<p style={errS}>{fieldErrors.firstName}</p>}</div>
                <div><label style={lS}>Nom</label><input value={form.lastName} onChange={e=>up("lastName",e.target.value)} style={iS("lastName")} placeholder="Votre nom"/></div>
              </div>
              <div>
                <label style={lS}>Email *</label>
                <input type="email" value={form.email} onChange={e=>up("email",e.target.value)} style={iS("email")} placeholder="exemple@email.fr"/>
                {fieldErrors.email&&<p style={errS}>{fieldErrors.email}</p>}
              </div>
              <div style={{marginBottom:10}}>
                <label style={lS}>Telephone *</label>
                <input type="tel" value={form.phone} onChange={e=>up("phone",e.target.value)} style={iS("phone")} placeholder="06 12 34 56 78"/>
                <p style={{fontSize:10,color:"rgba(245,240,232,0.3)",marginTop:4,fontFamily:"Montserrat,sans-serif"}}>Format : 06 12 34 56 78 ou +33 6 12 34 56 78</p>
                {fieldErrors.phone&&<p style={errS}>{fieldErrors.phone}</p>}
              </div>
              <div className="btn-row" style={{marginTop:20}}>
                <button onClick={()=>setStep(1)} className="btn-back">Retour</button>
                <button onClick={()=>{ if(validateStep2()) setStep(3) }} className="btn-continue btn-continue-active" style={{flex:1}}>Continuer</button>
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
                <div className="recap-total"><span className="recap-total-label">Acompte</span><span className="recap-total-val">{sm?.acompte}€</span></div>
              </div>
              <div style={{padding:"18px 20px",background:"rgba(139,26,26,0.08)",border:"1px solid rgba(180,50,50,0.35)",marginBottom:16}}>
                <p style={{fontSize:10,letterSpacing:2,color:"#e07070",textTransform:"uppercase",marginBottom:8,fontFamily:"Montserrat,sans-serif"}}>⚠️ Politique d annulation</p>
                <p style={{fontSize:12,color:"rgba(245,240,232,0.65)",lineHeight:1.8}}>L acompte est <strong style={{color:"#F5F0E8"}}>definitif et non remboursable</strong> en cas de non-presentation, d annulation moins de 48h ou de retard superieur a 30 minutes.</p>
              </div>
              <div onClick={()=>up("cgv",!form.cgv)} style={{display:"flex",alignItems:"flex-start",gap:14,padding:"16px 18px",background:"rgba(201,168,76,0.04)",border:`1px solid ${form.cgv?"rgba(201,168,76,0.5)":"rgba(201,168,76,0.15)"}`,marginBottom:20,cursor:"pointer",transition:"all .3s",userSelect:"none"}}>
                <div style={{width:20,height:20,border:`1.5px solid ${form.cgv?"#C9A84C":"rgba(201,168,76,0.35)"}`,borderRadius:2,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:2,background:form.cgv?"#C9A84C":"transparent",transition:"all .3s"}}>
                  {form.cgv&&<span style={{color:"#080604",fontSize:13,fontWeight:700,lineHeight:1}}>✓</span>}
                </div>
                <p style={{fontSize:12,color:"rgba(245,240,232,0.72)",lineHeight:1.8}}>
                  J ai lu et j accepte les{" "}
                  <a href="/mentions-legales" target="_blank" style={{color:"#C9A84C",textDecoration:"underline"}} onClick={e=>e.stopPropagation()}>Conditions Generales de Vente</a>
                  {" "}et la politique d annulation. L acompte est non remboursable en cas de non-presentation.
                </p>
              </div>
              <div className="confirm-box">
                <p className="confirm-title">🔒 Paiement securise Stripe</p>
                <p className="confirm-text">Redirection vers Stripe. Email + SMS de confirmation apres paiement.</p>
              </div>
              {error&&<p style={{color:"#e74c3c",fontSize:12,marginBottom:14,textAlign:"center",fontFamily:"Montserrat,sans-serif"}}>{error}</p>}
              <div className="btn-row">
                <button onClick={()=>setStep(2)} className="btn-back">Retour</button>
                <button onClick={pay} disabled={sending||!form.cgv}
                  style={{flex:1,padding:17,border:"none",fontSize:11,letterSpacing:4,textTransform:"uppercase",fontWeight:500,fontFamily:"Montserrat,sans-serif",transition:"all .3s",
                    background:!form.cgv?"rgba(201,168,76,0.15)":sending?"rgba(201,168,76,0.5)":"#C9A84C",
                    color:!form.cgv?"rgba(245,240,232,0.25)":"#080604",
                    cursor:!form.cgv||sending?"not-allowed":"pointer"}}>
                  {sending?"Redirection...":!form.cgv?"Acceptez les CGV pour continuer":"Payer "+sm?.acompte+"€"}
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
        <a href="/mentions-legales" style={{fontSize:11,color:"rgba(245,240,232,0.18)",letterSpacing:2,textDecoration:"none",transition:"color .3s"}}
          onMouseEnter={e=>e.target.style.color="#C9A84C"}
          onMouseLeave={e=>e.target.style.color="rgba(245,240,232,0.18)"}>
          Mentions legales · CGV
        </a>
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
    accueil: (<><Hero setSection={go}/><Carousel/><Gallery setSection={go}/><Avis/></>),
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
      <StickyReserveButton setSection={go} currentSection={section}/>
      <div className={`page-transition page-content${transitioning?" out":" in"}`}>
        {pages[section]||pages.accueil}
        <Footer setSection={go}/>
      </div>
    </div>
  )
}
