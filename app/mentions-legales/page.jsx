"use client"

export default function MentionsLegales() {
  const G = "#C9A84C"
  const T = "#F5F0E8"
  const M = "rgba(245,240,232,0.55)"

  const Section = ({ title, children }) => (
    <div style={{marginBottom:48}}>
      <h2 style={{fontFamily:"Playfair Display,serif",fontSize:22,fontStyle:"italic",color:G,marginBottom:16,paddingBottom:12,borderBottom:"1px solid rgba(201,168,76,0.15)"}}>{title}</h2>
      <div style={{fontSize:14,color:M,lineHeight:2}}>{children}</div>
    </div>
  )

  const P = ({ children }) => <p style={{marginBottom:12}}>{children}</p>
  const Li = ({ children }) => <li style={{marginBottom:8,paddingLeft:8}}>{children}</li>

  return (
    <div style={{background:"#080604",minHeight:"100vh",color:T,fontFamily:"Montserrat,sans-serif",fontWeight:300}}>
      <div style={{maxWidth:800,margin:"0 auto",padding:"100px 28px 80px"}}>
        <div style={{textAlign:"center",marginBottom:64}}>
          <p style={{fontSize:10,letterSpacing:5,color:G,textTransform:"uppercase",marginBottom:16}}>Informations legales</p>
          <h1 style={{fontFamily:"Playfair Display,serif",fontSize:48,fontStyle:"italic",fontWeight:300,color:T,marginBottom:20}}>Mentions Legales</h1>
          <div style={{display:"flex",alignItems:"center",gap:16,justifyContent:"center"}}>
            <div style={{flex:1,maxWidth:120,height:1,background:"rgba(201,168,76,0.3)"}}/>
            <span style={{color:G}}>✦</span>
            <div style={{flex:1,maxWidth:120,height:1,background:"rgba(201,168,76,0.3)"}}/>
          </div>
        </div>

        <Section title="1. Editeur du site">
          <P><strong style={{color:T}}>Le Goya</strong> — Restaurant Gastronomique</P>
          <P>Forme juridique : SARL</P>
          <P>Capital social : [MONTANT] €</P>
          <P>SIRET : [NUMERO SIRET]</P>
          <P>RCS : [VILLE] [NUMERO RCS]</P>
          <P>Adresse : [ADRESSE COMPLETE], Paris</P>
          <P>Telephone : +33 1 XX XX XX XX</P>
          <P>Email : contact@legoya.fr</P>
          <P>Directeur de la publication : [NOM DU GERANT]</P>
          <P>TVA intracommunautaire : FR[NUMERO]</P>
        </Section>

        <Section title="2. Hebergement">
          <P><strong style={{color:T}}>Vercel Inc.</strong></P>
          <P>340 Pine Street, Suite 701, San Francisco, CA 94104, USA</P>
          <P>Site web : vercel.com</P>
        </Section>

        <Section title="3. Base de donnees">
          <P><strong style={{color:T}}>Supabase Inc.</strong></P>
          <P>Serveurs localises dans l Union Europeenne (Irlande)</P>
          <P>Site web : supabase.com</P>
        </Section>

        <Section title="4. Propriete intellectuelle">
          <P>L ensemble des elements du site (textes, images, logos, graphismes) est la propriete exclusive de Le Goya ou fait l objet d une autorisation d utilisation.</P>
          <P>Toute reproduction sans autorisation prealable ecrite est strictement interdite et constitue une contrefacon sanctionnee par le Code de la Propriete Intellectuelle.</P>
        </Section>

        <Section title="5. Protection des donnees personnelles (RGPD)">
          <P><strong style={{color:T}}>Responsable du traitement :</strong> Le Goya — contact@legoya.fr</P>
          <P><strong style={{color:T}}>Donnees collectees :</strong> Nom, prenom, email, telephone, date de reservation, preferences alimentaires.</P>
          <P><strong style={{color:T}}>Finalites :</strong></P>
          <ul style={{paddingLeft:20,marginBottom:12}}>
            <Li>Gestion des reservations et confirmation</Li>
            <Li>Envoi de rappels SMS et emails</Li>
            <Li>Traitement des paiements via Stripe</Li>
            <Li>Amelioration de nos services</Li>
          </ul>
          <P><strong style={{color:T}}>Base legale :</strong> Execution du contrat et consentement pour les communications.</P>
          <P><strong style={{color:T}}>Duree de conservation :</strong> 3 ans apres le dernier contact, 10 ans pour les donnees comptables.</P>
          <P><strong style={{color:T}}>Vos droits :</strong> Acces, rectification, effacement, portabilite, opposition. Contact : contact@legoya.fr</P>
          <P><strong style={{color:T}}>Cookies :</strong> Uniquement des cookies techniques necessaires au fonctionnement. Aucun cookie publicitaire.</P>
          <P>En cas de reclamation non resolue, vous pouvez saisir la CNIL : cnil.fr</P>
        </Section>

        <Section title="6. Paiement securise">
          <P>Les paiements sont traites par <strong style={{color:T}}>Stripe Payments Europe Ltd</strong>, certifie PCI DSS niveau 1.</P>
          <P>Le Goya ne stocke aucune donnee bancaire. Toutes les transactions sont chiffrees SSL/TLS.</P>
        </Section>

        <Section title="7. Conditions Generales de Vente (CGV)">
          <h3 style={{color:T,fontSize:15,marginBottom:12,marginTop:20}}>7.1 Reservation et acompte</h3>
          <P>Toute reservation est confirmee apres versement d un acompte :</P>
          <ul style={{paddingLeft:20,marginBottom:12}}>
            <Li>Menu Classique : acompte de 25€</Li>
            <Li>Menu Prestige : acompte de 40€</Li>
            <Li>Menu Degustation : acompte de 55€</Li>
          </ul>
          <P>L acompte est deduit du montant total le jour de votre visite.</P>

          <h3 style={{color:T,fontSize:15,marginBottom:12,marginTop:20}}>7.2 Politique d annulation — ACOMPTE NON REMBOURSABLE</h3>
          <div style={{padding:"20px 24px",background:"rgba(201,168,76,0.06)",border:"1px solid rgba(201,168,76,0.3)",marginBottom:16}}>
            <p style={{color:G,fontSize:14,lineHeight:1.8,fontWeight:500}}>
              ⚠️ L acompte verse est definitif et non remboursable dans les cas suivants :
            </p>
            <ul style={{paddingLeft:20,marginTop:12}}>
              <Li style={{color:G}}>Non-presentation le jour de la reservation (no-show)</Li>
              <Li style={{color:G}}>Annulation moins de 48h avant la date de reservation</Li>
              <Li style={{color:G}}>Retard superieur a 30 minutes sans preavis</Li>
            </ul>
          </div>
          <P><strong style={{color:T}}>Annulation gratuite et remboursee :</strong> Plus de 48h avant la reservation. Remboursement sous 5 a 10 jours ouvrables.</P>
          <P>Pour annuler : contact@legoya.fr ou +33 1 XX XX XX XX</P>

          <h3 style={{color:T,fontSize:15,marginBottom:12,marginTop:20}}>7.3 Modifications</h3>
          <P>Modification de date ou d heure possible sous reserve de disponibilite, au moins 48h avant.</P>

          <h3 style={{color:T,fontSize:15,marginBottom:12,marginTop:20}}>7.4 Allergenes</h3>
          <P>Conformement au Reglement UE n°1169/2011, les 14 allergenes majeurs sont identifies sur notre carte.</P>
          <P>Les 14 allergenes : Gluten · Crustaces · Oeufs · Poissons · Arachides · Soja · Lait · Fruits a coque · Celeri · Moutarde · Sesame · Sulfites · Lupin · Mollusques.</P>
          <P>Malgre nos precautions, une contamination croisee ne peut etre totalement exclue. Merci de nous consulter en cas d allergie severe.</P>

          <h3 style={{color:T,fontSize:15,marginBottom:12,marginTop:20}}>7.5 Prix</h3>
          <P>Tous les prix sont en euros TTC. Le restaurant se reserve le droit de modifier ses tarifs sans que cela affecte les reservations confirmees.</P>

          <h3 style={{color:T,fontSize:15,marginBottom:12,marginTop:20}}>7.6 Droit applicable</h3>
          <P>CGV soumises au droit francais. En cas de litige, recherche d une solution amiable avant tout recours. A defaut, tribunaux de Paris competents.</P>
        </Section>

        <Section title="8. Securite informatique">
          <P>Le site est protege par des mesures de securite avancees : chiffrement HTTPS, headers de securite (CSP, HSTS), rate limiting, protection anti-injection. Toute tentative d intrusion est tracee et peut faire l objet de poursuites penales (articles 323-1 et suivants du Code penal).</P>
        </Section>

        <div style={{textAlign:"center",marginTop:48,paddingTop:32,borderTop:"1px solid rgba(201,168,76,0.1)"}}>
          <p style={{fontSize:11,color:"rgba(245,240,232,0.3)",letterSpacing:1}}>
            Derniere mise a jour : {new Date().toLocaleDateString("fr-FR")} — Le Goya, Paris
          </p>
          <a href="/" style={{display:"inline-block",marginTop:24,padding:"13px 32px",border:"1px solid rgba(201,168,76,0.35)",color:G,fontSize:10,letterSpacing:4,textTransform:"uppercase",textDecoration:"none"}}>
            Retour au site
          </a>
        </div>
      </div>
    </div>
  )
}
