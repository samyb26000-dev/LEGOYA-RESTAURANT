"use client"
import { useState, useEffect } from "react"
import { supabase } from "../../../lib/supabase"

export default function FacturePage({ params }) {
  const [res, setRes] = useState(null)
  const [info, setInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from("reservations").select("*, paiements(*)").eq("id", params.id).single(),
      supabase.from("restaurant_info").select("*").single(),
    ]).then(([r, i]) => {
      if (r.data) setRes(r.data)
      if (i.data) setInfo(i.data)
      setLoading(false)
    })
  }, [params.id])

  if (loading) return (
    <div style={{minHeight:"100vh",background:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <p style={{color:"#666",fontSize:14}}>Chargement de la facture...</p>
    </div>
  )

  if (!res) return (
    <div style={{minHeight:"100vh",background:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <p style={{color:"#e74c3c",fontSize:14}}>Facture introuvable</p>
    </div>
  )

  const payment = res.paiements?.[0]
  const invoiceNum = `GYA-${new Date(res.created_at).getFullYear()}-${res.id.slice(-8).toUpperCase()}`
  const invoiceDate = new Date(res.created_at).toLocaleDateString("fr-FR", {day:"2-digit",month:"2-digit",year:"numeric"})
  const reservationDate = new Date(res.date).toLocaleDateString("fr-FR", {weekday:"long",day:"2-digit",month:"long",year:"numeric"})
  const montantHT = payment ? (payment.montant / 1.1).toFixed(2) : "0.00"
  const tva = payment ? (payment.montant - parseFloat(montantHT)).toFixed(2) : "0.00"
  const montantTTC = payment ? payment.montant.toFixed(2) : "0.00"

  return (
    <div style={{background:"#f5f5f5",minHeight:"100vh",padding:"40px 20px"}}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .facture-wrap { box-shadow: none !important; margin: 0 !important; }
        }
      `}</style>

      <div className="no-print" style={{textAlign:"center",marginBottom:24,display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
        <button onClick={() => window.print()} style={{padding:"12px 28px",background:"#C9A84C",border:"none",color:"#080604",fontSize:12,letterSpacing:2,textTransform:"uppercase",cursor:"pointer",fontFamily:"sans-serif",fontWeight:600}}>
          🖨️ Imprimer / Sauvegarder PDF
        </button>
        <button onClick={() => window.close()} style={{padding:"12px 28px",background:"transparent",border:"1px solid #999",color:"#666",fontSize:12,letterSpacing:2,textTransform:"uppercase",cursor:"pointer",fontFamily:"sans-serif"}}>
          Fermer
        </button>
      </div>

      <div className="facture-wrap" style={{maxWidth:780,margin:"0 auto",background:"#fff",boxShadow:"0 4px 40px rgba(0,0,0,0.12)",fontFamily:"Georgia, serif"}}>

        {/* HEADER */}
        <div style={{background:"#080604",padding:"40px 48px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:20}}>
          <div>
            <h1 style={{fontFamily:"sans-serif",fontSize:28,fontStyle:"italic",color:"#C9A84C",fontWeight:300,letterSpacing:4,marginBottom:4}}>Le Goya</h1>
            <p style={{fontSize:10,letterSpacing:4,color:"rgba(245,240,232,0.5)",textTransform:"uppercase",fontFamily:"sans-serif"}}>Restaurant Gastronomique</p>
          </div>
          <div style={{textAlign:"right"}}>
            <p style={{fontSize:24,fontWeight:600,color:"#C9A84C",fontFamily:"sans-serif",letterSpacing:2}}>FACTURE</p>
            <p style={{fontSize:13,color:"rgba(245,240,232,0.7)",marginTop:4,fontFamily:"sans-serif"}}>N° {invoiceNum}</p>
          </div>
        </div>

        {/* STATUS BAND */}
        {payment?.statut === "paye" && (
          <div style={{background:"#27ae60",padding:"8px 48px",display:"flex",alignItems:"center",gap:8}}>
            <span style={{color:"#fff",fontSize:11,fontFamily:"sans-serif",letterSpacing:2,textTransform:"uppercase",fontWeight:600}}>✓ PAYEE — Acompte recu</span>
          </div>
        )}
        {payment?.statut === "rembourse" && (
          <div style={{background:"#e74c3c",padding:"8px 48px"}}>
            <span style={{color:"#fff",fontSize:11,fontFamily:"sans-serif",letterSpacing:2,textTransform:"uppercase",fontWeight:600}}>↩ REMBOURSEE</span>
          </div>
        )}

        <div style={{padding:"40px 48px"}}>
          {/* INFO LIGNES */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:40,marginBottom:40,paddingBottom:40,borderBottom:"2px solid #f0f0f0"}}>
            <div>
              <p style={{fontSize:10,letterSpacing:3,color:"#C9A84C",textTransform:"uppercase",marginBottom:12,fontFamily:"sans-serif",fontWeight:600}}>Emetteur</p>
              <p style={{fontSize:15,fontWeight:600,marginBottom:4}}>{info?.name || "Le Goya"}</p>
              <p style={{fontSize:13,color:"#666",lineHeight:1.8}}>{info?.address || "[Adresse]"}<br/>{info?.city || "Paris"}<br/>{info?.phone || "+33 1 XX XX XX XX"}<br/>{info?.email || "contact@legoya.fr"}</p>
              <p style={{fontSize:11,color:"#999",marginTop:8}}>SIRET : [NUMERO SIRET]<br/>TVA : FR[NUMERO]</p>
            </div>
            <div>
              <p style={{fontSize:10,letterSpacing:3,color:"#C9A84C",textTransform:"uppercase",marginBottom:12,fontFamily:"sans-serif",fontWeight:600}}>Client</p>
              <p style={{fontSize:15,fontWeight:600,marginBottom:4}}>{res.prenom} {res.nom}</p>
              <p style={{fontSize:13,color:"#666",lineHeight:1.8}}>{res.email}<br/>{res.telephone}</p>
              <div style={{marginTop:12,padding:"8px 12px",background:"#fafafa",border:"1px solid #e0e0e0"}}>
                <p style={{fontSize:10,color:"#999",fontFamily:"sans-serif",letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>Date de facture</p>
                <p style={{fontSize:13,fontWeight:500}}>{invoiceDate}</p>
              </div>
            </div>
          </div>

          {/* TABLEAU RESERVATION */}
          <table style={{width:"100%",borderCollapse:"collapse",marginBottom:32}}>
            <thead>
              <tr style={{background:"#080604"}}>
                <th style={{padding:"12px 16px",textAlign:"left",color:"#C9A84C",fontSize:10,letterSpacing:2,textTransform:"uppercase",fontFamily:"sans-serif",fontWeight:500}}>Description</th>
                <th style={{padding:"12px 16px",textAlign:"center",color:"#C9A84C",fontSize:10,letterSpacing:2,textTransform:"uppercase",fontFamily:"sans-serif",fontWeight:500}}>Date</th>
                <th style={{padding:"12px 16px",textAlign:"center",color:"#C9A84C",fontSize:10,letterSpacing:2,textTransform:"uppercase",fontFamily:"sans-serif",fontWeight:500}}>Qty</th>
                <th style={{padding:"12px 16px",textAlign:"right",color:"#C9A84C",fontSize:10,letterSpacing:2,textTransform:"uppercase",fontFamily:"sans-serif",fontWeight:500}}>Montant</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{borderBottom:"1px solid #f0f0f0"}}>
                <td style={{padding:"16px 16px"}}>
                  <p style={{fontWeight:600,marginBottom:4,fontSize:14}}>Acompte de reservation — {res.menu_choisi}</p>
                  <p style={{fontSize:12,color:"#888"}}>{res.couverts} couvert{res.couverts > 1 ? "s" : ""} · {res.heure}</p>
                  {res.note_client && <p style={{fontSize:11,color:"#aaa",marginTop:4,fontStyle:"italic"}}>Note : {res.note_client}</p>}
                </td>
                <td style={{padding:"16px",textAlign:"center",fontSize:13,color:"#555"}}>{reservationDate}</td>
                <td style={{padding:"16px",textAlign:"center",fontSize:13}}>1</td>
                <td style={{padding:"16px",textAlign:"right",fontSize:15,fontWeight:600}}>{montantTTC} €</td>
              </tr>
            </tbody>
          </table>

          {/* TOTAUX */}
          <div style={{display:"flex",justifyContent:"flex-end",marginBottom:40}}>
            <div style={{width:280}}>
              {[["Sous-total HT", montantHT+"€"],["TVA 10%", tva+"€"]].map(([l,v])=>(
                <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #f0f0f0",fontSize:13,color:"#666"}}>
                  <span>{l}</span><span>{v}</span>
                </div>
              ))}
              <div style={{display:"flex",justifyContent:"space-between",padding:"14px 16px",background:"#080604",marginTop:8}}>
                <span style={{fontSize:14,fontWeight:600,color:"#C9A84C",fontFamily:"sans-serif",letterSpacing:1}}>TOTAL TTC</span>
                <span style={{fontSize:18,fontWeight:700,color:"#C9A84C",fontFamily:"sans-serif"}}>{montantTTC} €</span>
              </div>
              {payment && (
                <div style={{display:"flex",justifyContent:"space-between",padding:"10px 16px",background:"#f8fdf8",border:"1px solid #27ae60",marginTop:4}}>
                  <span style={{fontSize:12,color:"#27ae60",fontFamily:"sans-serif"}}>✓ Paiement recu</span>
                  <span style={{fontSize:12,fontWeight:600,color:"#27ae60"}}>{montantTTC} €</span>
                </div>
              )}
            </div>
          </div>

          {/* SOLDE RESTANT */}
          <div style={{padding:"16px 20px",background:"#fffbf0",border:"1px solid rgba(201,168,76,0.3)",marginBottom:40}}>
            <p style={{fontSize:12,color:"#8B6914",lineHeight:1.8,fontFamily:"sans-serif"}}>
              <strong>Solde restant a regler le jour de votre visite :</strong> Le montant de l acompte ({montantTTC}€) sera deduit de votre addition finale.<br/>
              <strong>Reservation confirmee le</strong> {reservationDate} a {res.heure} — {res.couverts} couvert{res.couverts > 1 ? "s" : ""}
            </p>
          </div>

          {/* MENTIONS LEGALES */}
          <div style={{borderTop:"2px solid #f0f0f0",paddingTop:24}}>
            <p style={{fontSize:10,color:"#bbb",lineHeight:1.9,fontFamily:"sans-serif"}}>
              {info?.name || "Le Goya"} — {info?.address || "[Adresse]"}, {info?.city || "Paris"} — SIRET : [NUMERO] — TVA : FR[NUMERO]<br/>
              Facture d acompte de reservation. Conformement aux CGV, tout acompte verse est non remboursable en cas de non-presentation ou d annulation moins de 48h avant la reservation.<br/>
              En cas de litige, les tribunaux de Paris sont competents. TVA acquittee sur les encaissements.
            </p>
            <p style={{fontSize:10,color:"#C9A84C",marginTop:8,fontFamily:"sans-serif",letterSpacing:1}}>Merci de votre confiance — Le Goya</p>
          </div>
        </div>
      </div>
    </div>
  )
}
