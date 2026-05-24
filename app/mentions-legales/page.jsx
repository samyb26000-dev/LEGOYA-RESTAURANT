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
          <P>L ensemble des elements du site legoya-restaurant.vercel.app (textes, images, logos, graphismes, structure) est la propriete exclusive de Le Goya ou fait l objet d une autorisation d utilisation.</P>
          <P>Toute reproduction, representation, modification ou exploitation totale ou partielle des contenus du site, par quelque procede que ce soit, sans autorisation prealable ecrite de Le Goya, est strictement interdite et constitue une contrefacon sanctionnee par les articles L.335-2 et suivants du Code de la Propriete Intellectuelle.</P>
        </Section>

        <Section title="5. Protection des donnees personnelles (RGPD)">
          <P><strong style={{color:T}}>Responsable du traitement :</strong> Le Goya — contact@legoya.fr</P>
          <P><strong style={{color:T}}>Donnees collectees :</strong> Nom, prenom, email, telephone, date de reservation, preferences alimentaires, historique de reservations.</P>
          <P><strong style={{color:T}}>Finalites du traitement :</strong></P>
          <ul style={{paddingLeft:20,marginBottom:12}}>
            <Li>Gestion des reservations et confirmation</Li>
            <Li>Envoi de rappels SMS et emails</Li>
            <Li>Traitement des paiements via Stripe</Li>
            <Li>Amélioration de nos services</Li>
          </ul>
          <P><strong style={{color:T}}>Base legale :</strong> Execution du contrat (reservation) et consentement pour les communications marketing.</P>
          <P><strong style={{color:T}}>Duree de conservation :</strong> 3 ans a compter du dernier contact, 10 ans pour les donnees comptables.</P>
          <P><strong style={{color:T}}>Vos droits :</strong> Conformement au RGPD (Reglement UE 2016/679) et a la loi Informatique et Libertes, vous disposez des droits d acces, de rectification, d effacement, de portabilite et d opposition. Pour exercer ces droits : contact@legoya.fr</P>
          <P><strong style={{color:T}}>Cookies :</strong> Ce site utilise uniquement des cookies techniques necessaires au fonctionnement. Aucun cookie publicitaire ou de tracking n est utilise sans votre consentement.</P>
          <P>En cas de reclamation non resolue, vous pouvez saisir la CNIL : cnil.fr</P>
        </Section>

        <Section title="6. Paiement securise">
          <P>Les paiements en ligne sont traites par <strong style={{color:T}}>Stripe Payments Europe Ltd</strong>, etablissement de monnaie electronique agree par la Banque Centrale d Irlande.</P>
          <P>Le Goya ne stocke aucune donnee bancaire. Toutes les transactions sont chiffrees via le protocole SSL/TLS.</P>
          <P>Stripe est certifie PCI DSS niveau 1, le plus haut niveau de securite pour les paiements en ligne.</P>
        </Section>

        <Section title="7. Conditions Generales de Vente (CGV)">
          <h3 style={{color:T,fontSize:15,marginBottom:12,marginTop:20}}>7.1 Objet</h3>
          <P>Les presentes CGV s appliquent a toutes les reservations effectuees sur le site legoya-restaurant.vercel.app pour le restaurant Le Goya.</P>

          <h3 style={{color:T,fontSize:15,marginBottom:12,marginTop:20}}>7.2 Reservation et acompte</h3>
          <P>Toute reservation est definitivement confirmee apres le versement d un acompte selon le menu choisi :</P>
          <ul style={{paddingLeft:20,marginBottom:12}}>
            <Li>Menu Classique : acompte de 25€ par reservation</Li>
            <Li>Menu Prestige : acompte de 40€ par reservation</Li>
            <Li>Menu Degustation : acompte de 55€ par reservation</Li>
          </ul>
          <P>L acompte est deduit du montant total de votre repas le jour de votre visite.</P>

          <h3 style={{color:T,fontSize:15,marginBottom:12,marginTop:20}}>7.3 Politique d annulation — ACOMPTE NON REMBOURSABLE</h3>
          <div style={{padding:"20px 24px",background:"rgba(201,168,76,0.06)",border:"1px solid rgba(201,168,76,0.3)",marginBottom:16}}>
            <p style={{color:G,fontSize:14,lineHeight:1.8,fontWeight:500}}>
              ⚠️ L acompte verse lors de la reservation est definitif et non remboursable dans les cas suivants :
            </p>
            <ul style={{paddingLeft:20,marginTop:12}}>
              <Li style={{color:G}}>Non-presentation le jour de la reservation (no-show)</Li>
              <Li style={{color:G}}>Annulation moins de 48h avant la date de reservation</Li>
              <Li style={{color:G}}>Retard superieur a 30 minutes sans preavis</Li>
            </ul>
          </div>
          <P><strong style={{color:T}}>Annulation possible et remboursee :</strong> Plus de 48h avant la date de reservation, l annulation est gratuite et l acompte est integlement rembourse sur le moyen de paiement utilise, sous 5 a 10 jours ouvrables.</P>
          <P>Pour annuler votre reservation : contact@legoya.fr ou +33 1 XX XX XX XX</P>

          <h3 style={{color:T,fontSize:15,marginBottom:12,marginTop:20}}>7.4 Modifications de reservation</h3>
          <P>Toute modification de date ou d heure est soumise a disponibilite et doit etre effectuee au moins 48h avant la reservation initiale. Aucun frais supplementaire n est applique en cas de modification acceptee.</P>

          <h3 style={{color:T,fontSize:15,marginBottom:12,marginTop:20}}>7.5 Allergenes et regimes alimentaires</h3>
          <P>Conformement au Reglement UE n°1169/2011, les 14 allergenes majeurs sont identifies sur notre carte. En cas d allergie ou d intolerance alimentaire, merci de le preciser lors de votre reservation ou d en informer votre serveur a l arrivee.</P>
          <P>Les 14 allergenes obligatoires : Gluten, Crustaces, Oeufs, Poissons, Arachides, Soja, Lait, Fruits a coque, Celeri, Moutarde, Graines de sesame, Anhydride sulfureux et sulfites, Lupin, Mollusques.</P>
          <P>Malgre toutes les precautions prises, une contamination croisee ne peut etre totalement exclue. Merci de nous consulter en cas d allergie severe.</P>

          <h3 style={{color:T,fontSize:15,marginBottom:12,marginTop:20}}>7.6 Prix</h3>
          <P>Tous les prix sont indiques en euros TTC (TVA au taux applicable). Le restaurant se reserve le droit de modifier ses tarifs a tout moment, sans que cela n affecte les reservations deja confirmees.</P>

          <h3 style={{color:T,fontSize:15,marginBottom:12,marginTop:20}}>7.7 Droit applicable</h3>
          <P>Les presentes CGV sont soumises au droit francais. En cas de litige, les parties s engagent a rechercher une solution amiable avant tout recours judiciaire. A defaut, les tribunaux competents de Paris seront seuls habilites.</P>
          <P>Conformement a l article L.612-1 du Code de la Consommation, vous pouvez recourir gratuitement a la mediation de la consommation.</P>
        </Section>

        <Section title="8. Informations sur les etablissements">
          <P>Le Goya est autorise a exercer l activite de restaurant conformement aux reglementations sanitaires en vigueur (normes HACCP). Permis d exploitation et licence de debits de boissons en cours de validite.</P>
        </Section>

        <div style={{textAlign:"center",marginTop:48,paddingTop:32,borderTop:"1px solid rgba(201,168,76,0.1)"}}>
          <p style={{fontSize:11,color:"rgba(245,240,232,0.3)",letterSpacing:1}}>Derniere mise a jour : {new Date().toLocaleDateString("fr-FR")} — Le Goya, Paris</p>
          <a href="/" style={{display:"inline-block",marginTop:24,padding:"13px 32px",border:"1px solid rgba(201,168,76,0.35)",color:G,fontSize:10,letterSpacing:4,textTransform:"uppercase",textDecoration:"none",transition:"all .3s"}}
            onMouseEnter={e=>{e.currentTarget.style.background="#C9A84C";e.currentTarget.style.color="#080604"}}
            onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="#C9A84C"}}>
            Retour au site
          </a>
        </div>
      </div>
    </div>
  )
}
