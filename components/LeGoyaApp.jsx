"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import { supabase } from "../lib/supabase"

// ─── VALIDATION ───────────────────────────────────────────────────────────────
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
    obs.observe(document.body, {childList:true,subtree:true})
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
    const t = setTimeout(() => { setDone(true); setTimeout(onDone, 800) }, 2200)
    return () => clearTimeout(t)
  }, [])
  return (
    <div className={`loading-screen${done?" done":""}`}>
      <div className="loading-logo"><img src="/logo.PNG" style={{width:100,height:100,objectFit:"contain"}} alt="Le Goya"/></div>
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
    window.addEventListener("resize", onResize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize) }
  }, [])
  return <canvas ref={ref} className="goya-canvas"/>
}

// ─── LOGO ─────────────────────────────────────────────────────────────────────
function Logo({ size }) {
  return (
    <div className="logo-wrap" style={{width:size,height:size}}>
      <img src="/logo.PNG" alt="Le Goya" className="logo-img" style={{width:size,height:size}}/>
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
  const onMove = useCallback(e => { setMx((e.clientX/window.innerWidth-.5)*18); setMy((e.clientY/window.innerHeight-.5)*18) }, [])
  useEffect(() => { window.addEventListener("mousemove", onMove); return () => window.removeEventListener("mousemove", onMove) }, [onMove])
  return (
    <section className="hero" onMouseMove={onMove}>
      <div className="hero-bg1"/>
      <div className="hero-bg2"/>
      <div className="hero-line" style={{transform:"translateY(-140px)"}}/>
      <div className="hero-line" style={{transform:"translateY(140px)"}}/>
      <div className="hero-content" style={{opacity:v?1:0,transform:`translate(${mx*.08}px,${my*.08}px)`,transition:"opacity 1.4s ease, transform 1.2s ease"}}>
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
  const moyenne = (avis.reduce((s,a) => s+a.note,0)/avis.length).toFixed(1)
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
              <p style={{fontSize:14,color:"rgba(245,240,232,0.72)",lineHeight:1.9,marginBottom:18,fontStyle:"italic",fontFamily:"Playfair Display,serif"}}>{a.comment
