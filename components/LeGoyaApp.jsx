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
      <div style={{display:"flex",transition:"transform .6s ease",transform:`translateX(calc(-${idx*280}px + 50vw - 140px))`,gap:20,paddingLeft:20}}>
        {plats.map((p,i) => (
          <div key={p.id} onClick={() => { setAuto(false); setIdx(i) }}
            style={{minWidth:260,padding:"32px 24px",background:i===idx?"rgba(201,168,76,0.1)":"rgba(245,240,232,0.02)",border:`1px solid ${i===idx?"rgba(201,168,76,0.5)":"rgba(201,168,76,0.1)"}`,transform:i===idx?"scale(1.05)":"scale(0.95)",transition:"all .4s",cursor:"pointer",textAlign:"center",flexShrink:0}}>
            {p.photo_url
              ? <img src={p.photo_url} alt={p.nom} style={{width:"100%",height:140,objectFit:"cover",marginBottom:16}}/>
              : <div style={{width:"100%",height:140,background:"rgba(201,168,76,0.06)",marginBottom:16,display:"flex",alignItems:"center",justifyContent:"center",fontSize:40}}>🍽️</div>
            }
            <p style={{fontSize:9,letterSpacing:3,color:"#C9A84C",textTransform:"uppercase",marginBottom:8}}>{p.categories?.nom}</p>
            <h3 style={{fontFamily:"Playfair Display,serif",fontSize:18,fontStyle:"italic",color:"#F5F0E8",marginBottom:8}}>{p.nom}</h3>
            <p style={{fontSize:11,color:"rgba(245,240,232,0.45)",marginBottom:12,lineHeight:1.6}}>{p.description}</p>
            <p style={{fontFamily:"Playfair Display,serif",fontSize:20,color:"#C9A84C
