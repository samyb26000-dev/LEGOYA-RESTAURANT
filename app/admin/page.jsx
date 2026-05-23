"use client"
import { useState, useEffect } from "react"
import { supabase } from "../../lib/supabase"

const G = "#C9A84C"
const BG = "#080604"
const CARD = "rgba(245,240,232,0.02)"
const BORDER = "rgba(201,168,76,0.15)"
const TEXT = "#F5F0E8"
const MUTED = "rgba(245,240,232,0.45)"

const S = {
  input: {width:"100%",padding:"11px 14px",background:"rgba(245,240,232,0.04)",border:`1px solid ${BORDER}`,color:TEXT,fontSize:13,outline:"none",fontFamily:"Montserrat,sans-serif",marginBottom:12},
  label: {fontSize:10,letterSpacing:3,color:G,textTransform:"uppercase",display:"block",marginBottom:7,fontFamily:"Montserrat,sans-serif"},
  btn: {padding:"12px 24px",background:G,border:"none",color:BG,fontSize:10,letterSpacing:3,textTransform:"uppercase",cursor:"pointer",fontWeight:500,fontFamily:"Montserrat,sans-serif"},
  btnOut: {padding:"10px 20px",background:"transparent",border:`1px solid ${BORDER}`,color:MUTED,fontSize:10,letterSpacing:2,textTransform:"uppercase",cursor:"pointer",fontFamily:"Montserrat,sans-serif"},
  btnRed: {padding:"10px 20px",background:"transparent",border:"1px solid #e74c3c",color:"#e74c3c",fontSize:10,letterSpacing:2,textTransform:"uppercase",cursor:"pointer",fontFamily:"Montserrat,sans-serif"},
}

function Login() {
  const [email, setEmail] = useState("")
  const [pwd, setPwd] = useState("")
  const [err, setErr] = useState("")
  const [loading, setLoading] = useState(false)
  const login = async () => {
    setLoading(true); setErr("")
    const {error} = await supabase.auth.signInWithPassword({email,password:pwd})
    if (error) { setErr("Identifiants incorrects"); setLoading(false) }
  }
  return (
    <div style={{minHeight:"100vh",background:BG,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{maxWidth:380,width:"100%",padding:"48px 36px",border:`1px solid ${BORDER}`,background:"rgba(15,13,10,0.9)"}}>
        <div style={{textAlign:"center",marginBottom:36}}>
          <img src="/logo.PNG" style={{width:70,height:70,objectFit:"contain",marginBottom:16}} alt="logo"/>
          <h1 style={{fontFamily:"Playfair Display,serif",fontSize:22,fontStyle:"italic",color:G}}>Panel Admin</h1>
          <p style={{fontSize:10,letterSpacing:3,color:MUTED,textTransform:"uppercase",marginTop:6}}>Le Goya</p>
        </div>
        <label style={S.label}>Email</label>
        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} style={S.input} placeholder="votre@email.com"/>
        <label style={S.label}>Mot de passe</label>
        <input type="password" value={pwd} onChange={e=>setPwd(e.target.value)} style={S.input} placeholder="mot de passe" onKeyDown={e=>e.key==="Enter"&&login()}/>
        {err&&<p style={{color:"#e74c3c",fontSize:12,marginBottom:12,textAlign:"center"}}>{err}</p>}
        <button onClick={login} disabled={loading} style={{...S.btn,width:"100%",padding:15,marginTop:4,background:loading?"rgba(201,168,76,0.5)":G}}>
          {loading?"Connexion...":"Se connecter"}
        </button>
      </div>
    </div>
  )
}

function Dashboard() {
  const [stats, setStats] = useState({res:0,attente:0,evt:0,avis:0})
  const [recents, setRecents] = useState([])
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0]
    Promise.all([
      supabase.from("reservations").select("id",{count:"exact",head:true}).eq("date",today),
      supabase.from("reservations").select("id",{count:"exact",head:true}).eq("statut","en_attente"),
      supabase.from("evenements").select("id",{count:"exact",head:true}).eq("statut","nouveau"),
      supabase.from("avis").select("id",{count:"exact",head:true}).eq("publie",false),
      supabase.from("reservations").select("*").order("created_at",{ascending:false}).limit(8),
    ]).then(([r1,r2,r3,r4,r5]) => {
      setStats({res:r1.count||0,attente:r2.count||0,evt:r3.count||0,avis:r4.count||0})
      setRecents(r5.data||[])
    })
  }, [])
  const SC = {confirme:G,annule:"#e74c3c",en_attente:MUTED}
  return (
    <div>
      <h2 style={{fontFamily:"Playfair Display,serif",fontSize:28,fontStyle:"italic",color:TEXT,marginBottom:32}}>Tableau de bord</h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:12,marginBottom:40}}>
        {[{l:"Reservations auj.",v:stats.res,i:"📅"},{l:"En attente",v:stats.attente,i:"⏳"},{l:"Demandes event.",v:stats.evt,i:"🎪"},{l:"Avis a moderer",v:stats.avis,i:"⭐"}].map((s,i)=>(
          <div key={i} style={{padding:"24px 18px",background:CARD,border:`1px solid ${BORDER}`}}>
            <div style={{fontSize:24,marginBottom:8}}>{s.i}</div>
            <div style={{fontFamily:"Playfair Display,serif",fontSize:40,color:G,fontStyle:"italic",lineHeight:1}}>{s.v}</div>
            <p style={{fontSize:10,color:MUTED,marginTop:6,letterSpacing:1,textTransform:"uppercase"}}>{s.l}</p>
          </div>
        ))}
      </div>
      <h3 style={{fontSize:11,letterSpacing:3,color:G,textTransform:"uppercase",marginBottom:16}}>Dernieres reservations</h3>
      <div style={{display:"flex",flexDirection:"column",gap:2}}>
        {recents.map(r=>(
          <div key={r.id} style={{padding:"14px 18px",background:CARD,border:`1px solid rgba(201,168,76,0.06)`,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
            <div>
              <p style={{fontFamily:"Playfair Display,serif",fontSize:15,fontStyle:"italic",color:TEXT}}>{r.prenom} {r.nom}</p>
              <p style={{fontSize:11,color:MUTED,marginTop:2}}>{r.date} · {r.heure} · {r.couverts} pers.</p>
            </div>
            <span style={{fontSize:9,letterSpacing:2,textTransform:"uppercase",color:SC[r.statut]||MUTED,border:`1px solid ${SC[r.statut]||BORDER}`,padding:"3px 10px"}}>{r.statut?.replace("_"," ")}</span>
          </div>
        ))}
        {recents.length===0&&<p style={{color:MUTED,fontSize:13,padding:"20px 0",textAlign:"center"}}>Aucune reservation</p>}
      </div>
    </div>
  )
}

function Reservations() {
  const [data, setData] = useState([])
  const [filter, setFilter] = useState("tous")
  const [sel, setSel] = useState(null)
  const [note, setNote] = useState("")
  const load = async () => {
    let q = supabase.from("reservations").select("*").order("date").order("heure")
    if (filter!=="tous") q = q.eq("statut",filter)
    const {data:d} = await q
    setData(d||[])
  }
  useEffect(()=>{load()},[filter])
  const update = async (id,fields) => { await supabase.from("reservations").update(fields).eq("id",id); load(); setSel(null) }
  const SC = {confirme:G,annule:"#e74c3c",en_attente:MUTED}
  return (
    <div>
      <h2 style={{fontFamily:"Playfair Display,serif",fontSize:28,fontStyle:"italic",color:TEXT,marginBottom:24}}>Reservations</h2>
      <div style={{display:"flex",gap:8,marginBottom:24,flexWrap:"wrap"}}>
        {["tous","en_attente","confirme","annule"].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{padding:"8px 16px",background:filter===f?G:"transparent",border:`1px solid ${filter===f?G:BORDER}`,color:filter===f?BG:MUTED,fontSize:10,letterSpacing:2,textTransform:"uppercase",cursor:"pointer"}}>{f.replace("_"," ")}</button>
        ))}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:2}}>
        {data.map(r=>(
          <div key={r.id} onClick={()=>{setSel(r);setNote(r.note_admin||"")}} style={{padding:"16px 18px",background:CARD,border:`1px solid rgba(201,168,76,0.08)`,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8,transition:"background .3s"}}
            onMouseEnter={e=>e.currentTarget.style.background="rgba(201,168,76,0.05)"}
            onMouseLeave={e=>e.currentTarget.style.background=CARD}>
            <div>
              <p style={{fontFamily:"Playfair Display,serif",fontSize:16,fontStyle:"italic",color:TEXT}}>{r.prenom} {r.nom}</p>
              <p style={{fontSize:11,color:MUTED,marginTop:3}}>{r.date} · {r.heure} · {r.couverts} pers. · {r.menu_choisi}</p>
              {r.note_client&&<p style={{fontSize:11,color:G,marginTop:3}}>Note : {r.note_client}</p>}
            </div>
            <span style={{fontSize:9,letterSpacing:2,textTransform:"uppercase",color:SC[r.statut]||MUTED,border:`1px solid ${SC[r.statut]||BORDER}`,padding:"4px 10px"}}>{r.statut?.replace("_"," ")}</span>
          </div>
        ))}
        {data.length===0&&<p style={{color:MUTED,fontSize:13,padding:"40px 0",textAlign:"center"}}>Aucune reservation</p>}
      </div>
      {sel&&(
        <div style={{position:"fixed",inset:0,background:"rgba(8,6,4,0.95)",backdropFilter:"blur(16px)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:20,overflowY:"auto"}} onClick={()=>setSel(null)}>
          <div style={{maxWidth:480,width:"100%",padding:"36px 28px",border:`1px solid ${BORDER}`,background:"#0F0D0A",maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
            <h3 style={{fontFamily:"Playfair Display,serif",fontSize:22,fontStyle:"italic",color:G,marginBottom:20}}>{sel.prenom} {sel.nom}</h3>
            {[["Date",sel.date],["Heure",sel.heure],["Couverts",sel.couverts+" pers."],["Menu",sel.menu_choisi],["Acompte",sel.acompte+"€"],["Email",sel.email],["Tel",sel.telephone]].map(([l,v])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",marginBottom:8,paddingBottom:8,borderBottom:"1px solid rgba(201,168,76,0.06)"}}>
                <span style={{fontSize:10,color:MUTED,textTransform:"uppercase",letterSpacing:1}}>{l}</span>
                <span style={{fontSize:13,color:TEXT}}>{v}</span>
              </div>
            ))}
            {sel.note_client&&(
              <div style={{padding:"10px 14px",background:"rgba(201,168,76,0.06)",border:`1px solid rgba(201,168,76,0.2)`,marginBottom:16,marginTop:4}}>
                <p style={{fontSize:9,letterSpacing:2,color:G,textTransform:"uppercase",marginBottom:4}}>Note du client</p>
                <p style={{fontSize:12,color:"rgba(245,240,232,0.7)"}}>{sel.note_client}</p>
              </div>
            )}
            <div style={{marginBottom:16}}>
              <label style={{...S.label,marginBottom:6}}>Note interne equipe</label>
              <textarea value={note} onChange={e=>setNote(e.target.value)} rows={2} style={{...S.input,marginBottom:8,resize:"vertical"}} placeholder="Visible uniquement par l equipe..."/>
              <button onClick={()=>update(sel.id,{note_admin:note})} style={{...S.btnOut,fontSize:10}}>Sauvegarder note</button>
            </div>
            <div style={{display:"flex",gap:10,marginBottom:10}}>
              <button onClick={()=>update(sel.id,{statut:"confirme"})} style={{...S.btn,flex:1}}>Confirmer</button>
              <button onClick={()=>update(sel.id,{statut:"annule"})} style={{...S.btnRed,flex:1}}>Annuler</button>
            </div>
            <button onClick={()=>setSel(null)} style={{...S.btnOut,width:"100%"}}>Fermer</button>
          </div>
        </div>
      )}
    </div>
  )
}

const ALL_ALG = ["Gluten","Crustaces","Oeufs","Poissons","Arachides","Soja","Lait","Fruits a coque","Celeri","Moutarde","Sesame","Anhydride sulfureux","Lupin","Mollusques"]

function Carte() {
  const [plats, setPlats] = useState([])
  const [cats, setCats] = useState([])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({nom:"",description:"",prix:"",categorie_id:"",allergenes:[],actif:true,photo_url:""})
  const up = (k,v) => setForm(f=>({...f,[k]:v}))
  const load = async () => {
    const {data:p} = await supabase.from("plats").select("*,categories(nom)").order("ordre")
    const {data:c} = await supabase.from("categories").select("*").order("ordre")
    setPlats(p||[]); setCats(c||[])
  }
  useEffect(()=>{load()},[])
  const openNew = () => { setForm({nom:"",description:"",prix:"",categorie_id:cats[0]?.id||"",allergenes:[],actif:true,photo_url:""}); setModal("new") }
  const openEdit = (p) => { setForm({...p,prix:p.prix?.toString()}); setModal("edit") }
  const save = async () => {
    const payload = {...form,prix:parseFloat(form.prix)||0}
    if (modal==="new") await supabase.from("plats").insert([payload])
    else await supabase.from("plats").update(payload).eq("id",form.id)
    load(); setModal(null)
  }
  const toggle = async (p) => { await supabase.from("plats").update({actif:!p.actif}).eq("id",p.id); load() }
  const del = async (id) => {
    if (!confirm("Supprimer ce plat ?")) return
    await supabase.from("plats").delete().eq("id",id); load(); setModal(null)
  }
  const toggleAlg = (a) => {
    const curr = form.allergenes||[]
    up("allergenes",curr.includes(a)?curr.filter(x=>x!==a):[...curr,a])
  }
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24,flexWrap:"wrap",gap:12}}>
        <h2 style={{fontFamily:"Playfair Display,serif",fontSize:28,fontStyle:"italic",color:TEXT}}>La Carte</h2>
        <button onClick={openNew} style={S.btn}>+ Ajouter un plat</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))",gap:12}}>
        {plats.map(p=>(
          <div key={p.id} style={{padding:"20px 18px",background:CARD,border:`1px solid ${p.actif?BORDER:"rgba(245,240,232,0.05)"}`,opacity:p.actif?1:.5}}>
            {p.photo_url&&<img src={p.photo_url} alt={p.nom} style={{width:"100%",height:120,objectFit:"cover",marginBottom:12}}/>}
            <p style={{fontSize:9,letterSpacing:3,color:G,textTransform:"uppercase",marginBottom:6}}>{p.categories?.nom}</p>
            <p style={{fontFamily:"Playfair Display,serif",fontSize:16,fontStyle:"italic",color:TEXT,marginBottom:4}}>{p.nom}</p>
            <p style={{fontSize:11,color:MUTED,marginBottom:8,lineHeight:1.5}}>{p.description}</p>
            {p.allergenes?.length>0&&<p style={{fontSize:10,color:"rgba(201,168,76,0.5)",marginBottom:8}}>⚠ {p.allergenes.join(", ")}</p>}
            <p style={{fontFamily:"Playfair Display,serif",fontSize:18,color:G,fontStyle:"italic",marginBottom:14}}>{p.prix}€</p>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>openEdit(p)} style={{...S.btnOut,flex:1,padding:"8px 12px",fontSize:10}}>Modifier</button>
              <button onClick={()=>toggle(p)} style={{...S.btnOut,padding:"8px 12px",fontSize:10,color:p.actif?"#e74c3c":G,borderColor:p.actif?"#e74c3c":G}}>{p.actif?"Cacher":"Afficher"}</button>
            </div>
          </div>
        ))}
      </div>
      {modal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(8,6,4,0.95)",backdropFilter:"blur(16px)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:20,overflowY:"auto"}} onClick={()=>setModal(null)}>
          <div style={{maxWidth:520,width:"100%",padding:"36px 28px",border:`1px solid ${BORDER}`,background:"#0F0D0A",maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
            <h3 style={{fontFamily:"Playfair Display,serif",fontSize:22,fontStyle:"italic",color:G,marginBottom:24}}>{modal==="new"?"Nouveau plat":"Modifier le plat"}</h3>
            <label style={S.label}>Nom du plat</label>
            <input value={form.nom} onChange={e=>up("nom",e.target.value)} style={S.input} placeholder="Nom"/>
            <label style={S.label}>Description</label>
            <textarea value={form.description} onChange={e=>up("description",e.target.value)} rows={3} style={{...S.input,resize:"vertical"}} placeholder="Description"/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div>
                <label style={S.label}>Prix (€)</label>
                <input type="number" value={form.prix} onChange={e=>up("prix",e.target.value)} style={S.input} placeholder="0.00"/>
              </div>
              <div>
                <label style={S.label}>Categorie</label>
                <select value={form.categorie_id} onChange={e=>up("categorie_id",e.target.value)} style={{...S.input,cursor:"pointer"}}>
                  {cats.map(c=><option key={c.id} value={c.id}>{c.nom}</option>)}
                </select>
              </div>
            </div>
            <label style={S.label}>URL Photo</label>
            <input value={form.photo_url||""} onChange={e=>up("photo_url",e.target.value)} style={S.input} placeholder="https://..."/>
            <label style={{...S.label,marginBottom:12}}>14 Allergenes obligatoires (EU)</label>
            <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:20}}>
              {ALL_ALG.map(a=>(
                <button key={a} onClick={()=>toggleAlg(a)} style={{padding:"5px 10px",background:(form.allergenes||[]).includes(a)?G:"transparent",border:`1px solid ${(form.allergenes||[]).includes(a)?G:BORDER}`,color:(form.allergenes||[]).includes(a)?BG:MUTED,fontSize:10,cursor:"pointer",transition:"all .2s"}}>{a}</button>
              ))}
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:24}}>
              <input type="checkbox" checked={form.actif} onChange={e=>up("actif",e.target.checked)} id="actif"/>
              <label htmlFor="actif" style={{...S.label,marginBottom:0}}>Plat visible sur le site</label>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={save} style={{...S.btn,flex:1}}>Sauvegarder</button>
              {modal==="edit"&&<button onClick={()=>del(form.id)} style={{...S.btnRed,padding:"12px 16px"}}>Supprimer</button>}
            </div>
            <button onClick={()=>setModal(null)} style={{...S.btnOut,width:"100%",marginTop:10}}>Annuler</button>
          </div>
        </div>
      )}
    </div>
  )
}

function Evenements() {
  const [data, setData] = useState([])
  const [sel, setSel] = useState(null)
  const load = async () => {
    const {data:d} = await supabase.from("evenements").select("*").order("created_at",{ascending:false})
    setData(d||[])
  }
  useEffect(()=>{load()},[])
  const update = async (id,statut) => { await supabase.from("evenements").update({statut}).eq("id",id); load(); setSel(null) }
  const SC = {nouveau:G,en_cours:"#3498db",traite:MUTED,refuse:"#e74c3c"}
  return (
    <div>
      <h2 style={{fontFamily:"Playfair Display,serif",fontSize:28,fontStyle:"italic",color:TEXT,marginBottom:24}}>Demandes Evenementielles</h2>
      <div style={{display:"flex",flexDirection:"column",gap:2}}>
        {data.map(e=>(
          <div key={e.id} onClick={()=>setSel(e)} style={{padding:"16px 18px",background:CARD,border:`1px solid rgba(201,168,76,0.08)`,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8,transition:"background .3s"}}
            onMouseEnter={ev=>ev.currentTarget.style.background="rgba(201,168,76,0.05)"}
            onMouseLeave={ev=>ev.currentTarget.style.background=CARD}>
            <div>
              <p style={{fontFamily:"Playfair Display,serif",fontSize:16,fontStyle:"italic",color:TEXT}}>{e.prenom} {e.nom}</p>
              <p style={{fontSize:11,color:MUTED,marginTop:3}}>{e.type_event} · {e.nombre_personnes} pers. · {e.budget}</p>
              <p style={{fontSize:11,color:MUTED,marginTop:2}}>{e.email} · {e.telephone}</p>
            </div>
            <span style={{fontSize:9,letterSpacing:2,textTransform:"uppercase",color:SC[e.statut]||MUTED,border:`1px solid ${SC[e.statut]||BORDER}`,padding:"4px 10px"}}>{e.statut}</span>
          </div>
        ))}
        {data.length===0&&<p style={{color:MUTED,fontSize:13,padding:"40px 0",textAlign:"center"}}>Aucune demande</p>}
      </div>
      {sel&&(
        <div style={{position:"fixed",inset:0,background:"rgba(8,6,4,0.95)",backdropFilter:"blur(16px)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:20,overflowY:"auto"}} onClick={()=>setSel(null)}>
          <div style={{maxWidth:480,width:"100%",padding:"36px 28px",border:`1px solid ${BORDER}`,background:"#0F0D0A",maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
            <h3 style={{fontFamily:"Playfair Display,serif",fontSize:22,fontStyle:"italic",color:G,marginBottom:20}}>{sel.prenom} {sel.nom}</h3>
            {[["Type",sel.type_event],["Date souhaitee",sel.date_souhaitee||"Non precise"],["Personnes",(sel.nombre_personnes||"?")+` pers.`],["Budget",sel.budget||"Non precise"],["Email",sel.email],["Tel",sel.telephone]].map(([l,v])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",marginBottom:8,paddingBottom:8,borderBottom:"1px solid rgba(201,168,76,0.06)"}}>
                <span style={{fontSize:10,color:MUTED,textTransform:"uppercase",letterSpacing:1}}>{l}</span>
                <span style={{fontSize:13,color:TEXT}}>{v}</span>
              </div>
            ))}
            {sel.message&&(
              <div style={{padding:"12px 14px",background:"rgba(201,168,76,0.05)",border:`1px solid rgba(201,168,76,0.15)`,marginBottom:20,marginTop:4}}>
                <p style={{fontSize:9,letterSpacing:2,color:G,textTransform:"uppercase",marginBottom:6}}>Message</p>
                <p style={{fontSize:12,color:"rgba(245,240,232,0.7)",lineHeight:1.8}}>{sel.message}</p>
              </div>
            )}
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
              {["nouveau","en_cours","traite","refuse"].map(s=>(
                <button key={s} onClick={()=>update(sel.id,s)} style={{padding:"8px 14px",background:sel.statut===s?G:"transparent",border:`1px solid ${sel.statut===s?G:BORDER}`,color:sel.statut===s?BG:MUTED,fontSize:9,letterSpacing:2,textTransform:"uppercase",cursor:"pointer"}}>{s}</button>
              ))}
            </div>
            <button onClick={()=>setSel(null)} style={{...S.btnOut,width:"100%"}}>Fermer</button>
          </div>
        </div>
      )}
    </div>
  )
}

function Avis() {
  const [data, setData] = useState([])
  const [filter, setFilter] = useState("tous")
  const load = async () => {
    let q = supabase.from("avis").select("*").order("created_at",{ascending:false})
    if (filter==="publies") q = q.eq("publie",true)
    if (filter==="attente") q = q.eq("publie",false)
    const {data:d} = await q
    setData(d||[])
  }
  useEffect(()=>{load()},[filter])
  const toggle = async (a) => { await supabase.from("avis").update({publie:!a.publie}).eq("id",a.id); load() }
  const del = async (id) => {
    if (!confirm("Supprimer ?")) return
    await supabase.from("avis").delete().eq("id",id); load()
  }
  return (
    <div>
      <h2 style={{fontFamily:"Playfair Display,serif",fontSize:28,fontStyle:"italic",color:TEXT,marginBottom:24}}>Avis Clients</h2>
      <div style={{display:"flex",gap:8,marginBottom:24}}>
        {["tous","attente","publies"].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{padding:"8px 16px",background:filter===f?G:"transparent",border:`1px solid ${filter===f?G:BORDER}`,color:filter===f?BG:MUTED,fontSize:10,letterSpacing:2,textTransform:"uppercase",cursor:"pointer"}}>{f}</button>
        ))}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {data.map(a=>(
          <div key={a.id} style={{padding:"20px 18px",background:CARD,border:`1px solid ${a.publie?BORDER:"rgba(245,240,232,0.05)"}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10,flexWrap:"wrap",gap:8}}>
              <div>
                <div style={{display:"flex",gap:3,marginBottom:4}}>
                  {[1,2,3,4,5].map(i=><span key={i} style={{color:i<=a.note?G:"rgba(201,168,76,0.2)",fontSize:14}}>★</span>)}
                </div>
                <p style={{fontFamily:"Playfair Display,serif",fontSize:15,fontStyle:"italic",color:TEXT}}>{a.prenom}</p>
                <p style={{fontSize:11,color:MUTED,marginTop:2}}>{new Date(a.created_at).toLocaleDateString("fr-FR")}</p>
              </div>
              <span style={{fontSize:9,letterSpacing:2,textTransform:"uppercase",color:a.publie?G:MUTED,border:`1px solid ${a.publie?G:BORDER}`,padding:"3px 10px"}}>{a.publie?"Publie":"En attente"}</span>
            </div>
            <p style={{fontSize:13,color:"rgba(245,240,232,0.7)",lineHeight:1.8,marginBottom:14,fontStyle:"italic"}}>{a.commentaire}</p>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>toggle(a)} style={{...S.btnOut,padding:"8px 16px",fontSize:10,color:a.publie?"#e74c3c":G,borderColor:a.publie?"#e74c3c":G}}>{a.publie?"Depublier":"Publier"}</button>
              <button onClick={()=>del(a.id)} style={{...S.btnRed,padding:"8px 14px",fontSize:10}}>Supprimer</button>
            </div>
          </div>
        ))}
        {data.length===0&&<p style={{color:MUTED,fontSize:13,padding:"40px 0",textAlign:"center"}}>Aucun avis</p>}
      </div>
    </div>
  )
}

function Infos() {
  const [info, setInfo] = useState({name:"",phone:"",email:"",address:"",city:"",description:"",instagram:"",facebook:""})
  const [horaires, setHoraires] = useState([])
  const [fermetures, setFermetures] = useState([])
  const [nf, setNf] = useState({date_debut:"",date_fin:"",motif:""})
  const [saved, setSaved] = useState(false)
  useEffect(()=>{
    supabase.from("restaurant_info").select("*").single().then(({data})=>{if(data)setInfo(data)})
    supabase.from("horaires").select("*").order("id").then(({data})=>{if(data)setHoraires(data)})
    supabase.from("fermetures").select("*").order("date_debut").then(({data})=>{if(data)setFermetures(data)})
  },[])
  const flash = () => { setSaved(true); setTimeout(()=>setSaved(false),2000) }
  const saveInfo = async () => { await supabase.from("restaurant_info").update(info).eq("id",info.id); flash() }
  const updateH = (id,k,v) => setHoraires(h=>h.map(x=>x.id===id?{...x,[k]:v}:x))
  const saveH = async () => { await Promise.all(horaires.map(h=>supabase.from("horaires").update(h).eq("id",h.id))); flash() }
  const addF = async () => {
    if (!nf.date_debut||!nf.date_fin) return
    await supabase.from("fermetures").insert([nf])
    const {data} = await supabase.from("fermetures").select("*").order("date_debut")
    setFermetures(data||[]); setNf({date_debut:"",date_fin:"",motif:""})
  }
  const delF = async (id) => { await supabase.from("fermetures").delete().eq("id",id); setFermetures(f=>f.filter(x=>x.id!==id)) }
  return (
    <div>
      <h2 style={{fontFamily:"Playfair Display,serif",fontSize:28,fontStyle:"italic",color:TEXT,marginBottom:32}}>Infos du Restaurant</h2>
      <div style={{marginBottom:40}}>
        <h3 style={{fontSize:11,letterSpacing:3,color:G,textTransform:"uppercase",marginBottom:20}}>Informations generales</h3>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {[["name","Nom"],["phone","Telephone"],["email","Email"],["address","Adresse"],["city","Ville"],["instagram","Instagram"],["facebook","Facebook"]].map(([k,l])=>(
            <div key={k}>
              <label style={S.label}>{l}</label>
              <input value={info[k]||""} onChange={e=>setInfo(i=>({...i,[k]:e.target.value}))} style={S.input} placeholder={l}/>
            </div>
          ))}
        </div>
        <label style={S.label}>Description</label>
        <textarea value={info.description||""} onChange={e=>setInfo(i=>({...i,description:e.target.value}))} rows={3} style={{...S.input,resize:"vertical"}} placeholder="Description..."/>
        <button onClick={saveInfo} style={S.btn}>{saved?"Sauvegarde !":"Sauvegarder"}</button>
      </div>
      <div style={{marginBottom:40}}>
        <h3 style={{fontSize:11,letterSpacing:3,color:G,textTransform:"uppercase",marginBottom:20}}>Horaires d ouverture</h3>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {horaires.map(h=>(
            <div key={h.id} style={{padding:"12px 16px",background:CARD,border:`1px solid ${BORDER}`,display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
              <span style={{fontSize:12,color:TEXT,minWidth:90,fontWeight:500}}>{h.jour}</span>
              <label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer"}}>
                <input type="checkbox" checked={h.ouvert} onChange={e=>updateH(h.id,"ouvert",e.target.checked)}/>
                <span style={{fontSize:11,color:MUTED}}>Ouvert</span>
              </label>
              {h.ouvert&&(
                <>
                  <input type="time" value={h.heure_ouverture||""} onChange={e=>updateH(h.id,"heure_ouverture",e.target.value)} style={{...S.input,width:"auto",marginBottom:0,padding:"6px 10px"}}/>
                  <span style={{color:MUTED}}>→</span>
                  <input type="time" value={h.heure_fermeture||""} onChange={e=>updateH(h.id,"heure_fermeture",e.target.value)} style={{...S.input,width:"auto",marginBottom:0,padding:"6px 10px"}}/>
                  <select value={h.service||""} onChange={e=>updateH(h.id,"service",e.target.value)} style={{...S.input,width:"auto",marginBottom:0,padding:"6px 10px",cursor:"pointer"}}>
                    <option value="dejeuner">Dejeuner</option>
                    <option value="diner">Diner</option>
                    <option value="continu">Continu</option>
                  </select>
                </>
              )}
            </div>
          ))}
        </div>
        <button onClick={saveH} style={{...S.btn,marginTop:16}}>{saved?"Sauvegarde !":"Sauvegarder horaires"}</button>
      </div>
      <div>
        <h3 style={{fontSize:11,letterSpacing:3,color:G,textTransform:"uppercase",marginBottom:20}}>Fermetures exceptionnelles</h3>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 2fr auto",gap:10,marginBottom:16,alignItems:"end"}}>
          <div>
            <label style={S.label}>Du</label>
            <input type="date" value={nf.date_debut} onChange={e=>setNf(f=>({...f,date_debut:e.target.value}))} style={{...S.input,marginBottom:0}}/>
          </div>
          <div>
            <label style={S.label}>Au</label>
            <input type="date" value={nf.date_fin} onChange={e=>setNf(f=>({...f,date_fin:e.target.value}))} style={{...S.input,marginBottom:0}}/>
          </div>
          <div>
            <label style={S.label}>Motif</label>
            <input value={nf.motif} onChange={e=>setNf(f=>({...f,motif:e.target.value}))} style={{...S.input,marginBottom:0}} placeholder="Conges annuels..."/>
          </div>
          <button onClick={addF} style={{...S.btn,padding:"11px 16px"}}>+</button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {fermetures.map(f=>(
            <div key={f.id} style={{padding:"12px 16px",background:CARD,border:`1px solid ${BORDER}`,display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}>
              <div>
                <p style={{fontSize:13,color:TEXT}}>{f.date_debut} → {f.date_fin}</p>
                {f.motif&&<p style={{fontSize:11,color:MUTED,marginTop:2}}>{f.motif}</p>}
              </div>
              <button onClick={()=>delF(f.id)} style={{...S.btnRed,padding:"6px 12px",fontSize:10}}>Supprimer</button>
            </div>
          ))}
          {fermetures.length===0&&<p style={{color:MUTED,fontSize:12,padding:"16px 0"}}>Aucune fermeture programmee</p>}
        </div>
      </div>
    </div>
  )
}

function Equipe() {
  const [data, setData] = useState([])
  const [form, setForm] = useState({email:"",nom:"",role:"sous_admin"})
  const [msg, setMsg] = useState("")
  const load = async () => {
    const {data:d} = await supabase.from("admins").select("*").order("created_at")
    setData(d||[])
  }
  useEffect(()=>{load()},[])
  const add = async () => {
    if (!form.email||!form.nom) return
    const {error} = await supabase.from("admins").insert([form])
    if (!error) { setMsg("Sous-admin ajoute. Creez son compte sur Supabase Dashboard → Authentication → Users"); setForm({email:"",nom:"",role:"sous_admin"}); load() }
    else setMsg("Erreur : "+error.message)
  }
  const toggle = async (a) => { await supabase.from("admins").update({actif:!a.actif}).eq("id",a.id); load() }
  return (
    <div>
      <h2 style={{fontFamily:"Playfair Display,serif",fontSize:28,fontStyle:"italic",color:TEXT,marginBottom:32}}>Equipe Admin</h2>
      <div style={{padding:"24px 20px",background:CARD,border:`1px solid ${BORDER}`,marginBottom:32}}>
        <h3 style={{fontSize:11,letterSpacing:3,color:G,textTransform:"uppercase",marginBottom:20}}>Ajouter un sous-admin</h3>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div><label style={S.label}>Nom</label><input value={form.nom} onChange={e=>setForm(f=>({...f,nom:e.target.value}))} style={S.input} placeholder="Prenom Nom"/></div>
          <div><label style={S.label}>Email</label><input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} style={S.input} placeholder="email@..."/></div>
          <div><label style={S.label}>Role</label>
            <select value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))} style={{...S.input,cursor:"pointer"}}>
              <option value="sous_admin">Sous-admin</option>
              <option value="manager">Manager</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
        </div>
        {msg&&<p style={{fontSize:12,color:G,marginBottom:12,lineHeight:1.6}}>{msg}</p>}
        <button onClick={add} style={S.btn}>Ajouter</button>
        <p style={{fontSize:11,color:MUTED,marginTop:12}}>Creez ensuite le compte auth sur Supabase Dashboard → Authentication → Users</p>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {data.map(a=>(
          <div key={a.id} style={{padding:"16px 18px",background:CARD,border:`1px solid ${a.actif?BORDER:"rgba(245,240,232,0.05)"}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8,opacity:a.actif?1:.5}}>
            <div>
              <p style={{fontFamily:"Playfair Display,serif",fontSize:16,fontStyle:"italic",color:TEXT}}>{a.nom||a.email}</p>
              <p style={{fontSize:11,color:MUTED,marginTop:2}}>{a.email} · {a.role}</p>
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <span style={{fontSize:9,letterSpacing:2,textTransform:"uppercase",color:a.role==="super_admin"?G:MUTED,border:`1px solid ${a.role==="super_admin"?G:BORDER}`,padding:"3px 10px"}}>{a.role}</span>
              {a.role!=="super_admin"&&<button onClick={()=>toggle(a)} style={{...S.btnOut,padding:"6px 12px",fontSize:9}}>{a.actif?"Desactiver":"Activer"}</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const SECTIONS = [
  {k:"dashboard",l:"Dashboard",i:"📊"},
  {k:"reservations",l:"Reservations",i:"📅"},
  {k:"carte",l:"La Carte",i:"🍽️"},
  {k:"evenements",l:"Evenements",i:"🎪"},
  {k:"avis",l:"Avis",i:"⭐"},
  {k:"infos",l:"Infos",i:"⚙️"},
  {k:"equipe",l:"Equipe",i:"👥"},
]

function AdminShell({ onLogout }) {
  const [section, setSection] = useState("dashboard")
  const [open, setOpen] = useState(false)
  const [mobile, setMobile] = useState(false)
  useEffect(()=>{
    const check = () => setMobile(window.innerWidth < 769)
    check()
    window.addEventListener("resize",check)
    return ()=>window.removeEventListener("resize",check)
  },[])
  const CONTENT = {dashboard:<Dashboard/>,reservations:<Reservations/>,carte:<Carte/>,evenements:<Evenements/>,avis:<Avis/>,infos:<Infos/>,equipe:<Equipe/>}
  return (
    <div style={{display:"flex",minHeight:"100vh",background:BG,color:TEXT}}>
      {(open||!mobile)&&(
        <aside style={{width:220,background:"rgba(15,13,10,0.98)",borderRight:`1px solid ${BORDER}`,display:"flex",flexDirection:"column",flexShrink:0,position:mobile?"fixed":"sticky",top:0,left:0,height:"100vh",zIndex:200,overflowY:"auto"}}>
          <div style={{padding:"20px 20px 16px",borderBottom:`1px solid rgba(201,168,76,0.1)`,marginBottom:8}}>
            <img src="/logo.PNG" style={{width:44,height:44,objectFit:"contain"}} alt="logo"/>
            <p style={{fontFamily:"Playfair Display,serif",fontSize:14,fontStyle:"italic",color:G,marginTop:8}}>Le Goya</p>
            <p style={{fontSize:9,letterSpacing:2,color:MUTED,textTransform:"uppercase",marginTop:2}}>Administration</p>
          </div>
          {SECTIONS.map(({k,l,i})=>(
            <button key={k} onClick={()=>{setSection(k);if(mobile)setOpen(false)}} style={{padding:"12px 20px",background:section===k?"rgba(201,168,76,0.1)":"transparent",border:"none",borderLeft:section===k?`2px solid ${G}`:"2px solid transparent",color:section===k?G:MUTED,fontSize:12,letterSpacing:1,textAlign:"left",cursor:"pointer",display:"flex",alignItems:"center",gap:10,transition:"all .2s",fontFamily:"Montserrat,sans-serif"}}>
              <span>{i}</span><span>{l}</span>
            </button>
          ))}
          <div style={{marginTop:"auto",padding:"16px 20px",borderTop:`1px solid rgba(201,168,76,0.1)`}}>
            <button onClick={onLogout} style={{...S.btnOut,width:"100%",padding:10,fontSize:10}}>Deconnexion</button>
          </div>
        </aside>
      )}
      {open&&mobile&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:199}} onClick={()=>setOpen(false)}/>}
      <div style={{flex:1,padding:"24px 20px",overflowY:"auto",minWidth:0}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28}}>
          {mobile&&<button onClick={()=>setOpen(true)} style={{background:"none",border:"none",color:G,fontSize:22,cursor:"pointer",padding:4}}>☰</button>}
          <p style={{fontSize:10,letterSpacing:2,color:MUTED,textTransform:"uppercase",marginLeft:"auto"}}>Panel Admin · Le Goya</p>
        </div>
        {CONTENT[section]||<Dashboard/>}
      </div>
    </div>
  )
}

export default function AdminPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{
      setUser(session?.user||null); setLoading(false)
    })
    const {data:{subscription}} = supabase.auth.onAuthStateChange((_,session)=>{
      setUser(session?.user||null)
    })
    return()=>subscription.unsubscribe()
  },[])
  if (loading) return <div style={{minHeight:"100vh",background:BG,display:"flex",alignItems:"center",justifyContent:"center"}}><p style={{color:G,fontFamily:"Playfair Display,serif",fontSize:20,fontStyle:"italic"}}>Chargement...</p></div>
  if (!user) return <Login/>
  return <AdminShell onLogout={()=>supabase.auth.signOut()}/>
}
