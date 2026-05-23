"use client"
import { useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import { supabase } from "../../lib/supabase"

function SuccessContent() {
  const params = useSearchParams()
  const reservationId = params.get("reservation_id")
  const [res, setRes] = useState(null)

  useEffect(() => {
    if (reservationId) {
      supabase.from("reservations").select("*").eq("id", reservationId).single().then(({data}) => {
        if (data) setRes(data)
      })
    }
  }, [reservationId])

  return (
    <div style={{minHeight:"100vh",background:"#080604",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{maxWidth:480,width:"100%",padding:"48px 36px",border:"1px solid rgba(201,168,76,0.3)",background:"rgba(15,13,10,0.9)",textAlign:"center"}}>
        <div style={{fontSize:52,marginBottom:20}}>✦</div>
        <h1 style={{fontFamily:"Playfair Display,serif",fontSize:32,fontWeight:400,fontStyle:"italic",color:"#C9A84C",marginBottom:12}}>Reservation Confirmee</h1>
        <div style={{display:"flex",alignItems:"center",gap:16,margin:"0 auto 24px",maxWidth:200}}>
          <div style={{flex:1,height:1,background:"rgba(201,168,76,0.3)"}}/>
          <span style={{color:"#C9A84C"}}>✦</span>
          <div style={{flex:1,height:1,background:"rgba(201,168,76,0.3)"}}/>
        </div>
        {res ? (
          <p style={{fontSize:13,lineHeight:2,color:"rgba(245,240,232,0.65)"}}>
            Merci <strong style={{color:"#C9A84C"}}>{res.prenom}</strong> !<br/>
            Votre table est confirmee le <strong style={{color:"#C9A84C"}}>{res.date}</strong> a <strong style={{color:"#C9A84C"}}>{res.heure}</strong><br/>
            pour <strong style={{color:"#C9A84C"}}>{res.couverts} personne{res.couverts>1?"s":""}</strong><br/><br/>
            Un email de confirmation a ete envoye a<br/>
            <strong style={{color:"#C9A84C"}}>{res.email}</strong>
          </p>
        ) : (
          <p style={{fontSize:13,color:"rgba(245,240,232,0.5)"}}>Paiement recu. Merci !</p>
        )}
        <div style={{marginTop:32,padding:"16px",background:"rgba(201,168,76,0.05)",border:"1px solid rgba(201,168,76,0.15)"}}>
          <p style={{fontSize:11,color:"rgba(245,240,232,0.5)",lineHeight:1.8}}>
            Vous recevrez un rappel SMS 24h avant votre visite.<br/>
            En cas d imprevu : contact@legoya.fr
          </p>
        </div>
        <a href="/" style={{display:"inline-block",marginTop:28,padding:"14px 32px",border:"1px solid #C9A84C",color:"#C9A84C",fontSize:10,letterSpacing:4,textTransform:"uppercase",textDecoration:"none"}}>Retour au site</a>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return <Suspense fallback={<div style={{minHeight:"100vh",background:"#080604"}}/>}><SuccessContent/></Suspense>
}
