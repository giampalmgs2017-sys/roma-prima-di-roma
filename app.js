import { loadCorpus, renderDocument } from './canonical-reader.mjs';
const main = document.querySelector("#main-content");
const header = document.querySelector("#site-header");

const documents = [
  { category: "Archeologia", title: "Leggere il Foro Romano", description: "Orientamento stratigrafico e topografico per interpretare uno spazio trasformato per oltre un millennio.", meta: "Scheda scientifica · 8 min", file: "./docs/leggere-il-foro-romano.pdf" },
  { category: "Epigrafia", title: "Introduzione all'epigrafia latina", description: "Supporti, formule, abbreviazioni e metodo di schedatura delle iscrizioni latine.", meta: "Manuale breve · 10 min", file: "./docs/introduzione-epigrafia-latina.pdf" },
  { category: "Metodologia", title: "Dal contesto al reperto", description: "Principi essenziali di stratigrafia archeologica, documentazione e conservazione del dato.", meta: "Quaderno di metodo · 9 min", file: "./docs/dal-contesto-al-reperto.pdf" },
  { category: "Archeologia", title: "Abitare a Ostia", description: "Insulae, domus e spazi collettivi per comprendere la vita urbana nel porto di Roma.", meta: "Dossier · in preparazione", file: null },
  { category: "Epigrafia", title: "Nomi e identità nel CIL", description: "Una guida alla lettura di praenomen, nomen, cognomen e status nelle iscrizioni funerarie.", meta: "Scheda · in preparazione", file: null },
  { category: "Metodologia", title: "Fotogrammetria sul campo", description: "Dal rilievo fotografico al modello tridimensionale: una traccia operativa per piccoli contesti.", meta: "Protocollo · in preparazione", file: null }
];

const eras = [
  ["753–509 a.C.", "Età regia", "La città prende forma", "Tra memoria mitica e dati archeologici, Roma si consolida sui colli e attorno al Tevere. Spazi sacri, comunità e infrastrutture plasmano la prima città."],
  ["509–264 a.C.", "Prima Repubblica", "Conquista e cittadinanza", "Le istituzioni repubblicane si definiscono mentre Roma estende alleanze e controllo nella penisola italiana, integrando comunità diverse."],
  ["264–31 a.C.", "Repubblica mediterranea", "Roma oltre l'Italia", "Le guerre puniche e l'espansione nel Mediterraneo trasformano economia, società e paesaggio monumentale della capitale."],
  ["27 a.C.–180 d.C.", "Alto Impero", "Il tempo dei principi", "Da Augusto agli Antonini, il potere imperiale costruisce consenso attraverso amministrazione, esercito, culti e un linguaggio monumentale riconoscibile."],
  ["180–476 d.C.", "Tardo Impero", "Trasformazioni di un mondo", "Crisi, riforme e nuove forme religiose ridefiniscono l'Impero. Roma resta un centro simbolico mentre cambiano istituzioni e geografie del potere."]
];

function homePage() {
  return `
    <section class="hero">
      <div class="hero-content">
        <p class="eyebrow">Dalla fondazione all'Impero</p>
        <h1>Dalla lupa<br><em>al mondo.</em></h1>
        <p class="hero-copy">Duemila anni di storia raccontati attraverso le pietre, le iscrizioni e le voci di chi continua a interrogarle.</p>
        <div class="button-row"><a class="button light" href="#percorso">Esplora la storia <span class="arrow">→</span></a><a class="button ghost" href="#/biblioteca">Apri la biblioteca</a></div>
      </div>
      <div class="hero-facts" aria-label="Date chiave"><div><strong>753 a.C.</strong><span>Fondazione tradizionale</span></div><div><strong>509 a.C.</strong><span>Nascita della Repubblica</span></div><div><strong>27 a.C.</strong><span>Principato di Augusto</span></div></div>
    </section>

    <section class="section">
      <div class="section-header"><div><span class="section-number">I — ACTA</span><h2 class="section-title">Nel <em>portale</em></h2></div><p class="section-intro">Consulta i materiali disponibili e le informazioni sui servizi in preparazione.</p></div>
      <div class="feature-grid">
        <article class="feature-card"><div class="feature-meta"><span>Biblioteca</span><span>PDF disponibile</span></div><h3>Leggere il Foro Romano</h3><p>Una scheda di orientamento stratigrafico e topografico disponibile nella biblioteca.</p><a class="text-link" href="#/biblioteca">Apri la biblioteca <span>→</span></a></article>
        <article class="feature-card"><div class="feature-meta"><span>Epigrafia</span><span>PDF disponibile</span></div><h3>Introduzione all'epigrafia latina</h3><p>Un manuale breve su supporti, formule, abbreviazioni e metodo di schedatura.</p><a class="text-link" href="#/biblioteca">Apri la biblioteca <span>→</span></a></article>
        <article class="feature-card"><div class="feature-meta"><span>Newsletter</span><span>In preparazione</span></div><h3>Acta Diurna</h3><p>La newsletter editoriale non è ancora attiva. Nessuna iscrizione viene raccolta.</p><a class="text-link" href="#newsletter">Scopri di più <span>→</span></a></article>
      </div>
    </section>

    <section class="section dark-section" id="percorso">
      <div class="section-header"><div><span class="section-number">II — TEMPUS</span><h2 class="section-title">La lunga storia <em>di Roma</em></h2></div><p class="section-intro">Un percorso essenziale in cinque epoche. Seleziona un periodo per leggerne la trasformazione chiave.</p></div>
      <div class="timeline-shell"><div class="timeline">${eras.map((era, i) => `<button class="era-button ${i === 0 ? "active" : ""}" data-era="${i}"><span class="era-date">${era[0]}</span><h3>${era[1]}</h3><p>${era[2]}</p></button>`).join("")}</div></div>
      <div class="era-detail" id="era-detail"><strong>${eras[0][2]}</strong><p>${eras[0][3]}</p></div>
    </section>

    <section class="newsletter" id="newsletter">
      <div class="newsletter-copy"><p class="eyebrow">Newsletter editoriale · non attiva</p><h2>Acta<br><em>Diurna</em></h2><p>La newsletter è in preparazione. Al momento non raccogliamo indirizzi email e non inviamo messaggi.</p></div>
      <div class="newsletter-form"><h3>Iscrizioni non disponibili</h3><p>Quando il servizio sarà attivato, questa sezione indicherà come iscriversi. Non è possibile registrarsi ora.</p></div>
    </section>`;
}

function libraryPage() {
  return `
    <section class="page-hero"><div class="inner"><p class="eyebrow">Biblioteca scientifica</p><h1>Studiare le<br><em>tracce.</em></h1><p>Documenti introduttivi, quaderni di metodo e bibliografie per orientarsi nella ricerca archeologica ed epigrafica.</p></div></section>
    <section class="section">
      <div class="catalog-bar"><div class="catalog-stat"><span>Catalogo digitale</span><strong>Materiali ad accesso libero</strong></div><div class="catalog-stat"><span>Documenti</span><strong>06</strong></div><div class="catalog-stat"><span>Ambiti</span><strong>03</strong></div><div class="catalog-stat"><span>Aggiornamento</span><strong>2026</strong></div></div>
      <div class="library-tools"><div class="filter-list"><button class="filter-button active" data-filter="Tutti">Tutti</button><button class="filter-button" data-filter="Archeologia">Archeologia</button><button class="filter-button" data-filter="Epigrafia">Epigrafia</button><button class="filter-button" data-filter="Metodologia">Metodologia</button></div><label class="sr-only" for="library-search">Cerca nei documenti</label><input class="library-search" id="library-search" type="search" placeholder="Cerca per titolo o tema…" /></div>
      <div class="document-grid" id="document-grid">${renderDocuments(documents)}</div>
      <aside class="editorial-note"><h3>Nota editoriale</h3><p>I materiali sono pensati come strumenti di orientamento e non sostituiscono le pubblicazioni scientifiche citate nelle bibliografie. Ogni scheda esplicita ambito, metodo e livello di approfondimento.</p></aside>
    </section>`;
}

function renderDocuments(items) {
  if (!items.length) return `<div class="empty-state"><h2>Nessun documento trovato</h2><p>Prova con un termine o un filtro diverso.</p></div>`;
  return items.map(doc => `<article class="document-card"><div class="doc-top"><span class="doc-type">${doc.category}</span><span class="doc-icon">PDF</span></div><h2>${doc.title}</h2><p>${doc.description}</p><div class="doc-meta"><span>${doc.meta}</span>${doc.file ? `<a class="download-link" href="${doc.file}" download>Scarica ↓</a>` : `<span>Presto online</span>`}</div></article>`).join("");
}

function contributionPage() {
  return `
    <section class="page-hero"><div class="inner"><p class="eyebrow">Archivio partecipato · non attivo</p><h1>Condividi<br><em>la scoperta.</em></h1><p>La raccolta di contributi è in preparazione. Al momento non è possibile inviare file o informazioni e non esiste una coda di revisione attiva.</p></div></section>
    <section class="section">
      <div class="section-header"><div><span class="section-number">I — CRITERIA</span><h2 class="section-title">Criteri <em>previsti</em></h2></div><p class="section-intro">Quando il servizio sarà attivato, i materiali saranno valutati secondo criteri di pertinenza e tutela delle persone e del patrimonio. Nessun materiale viene raccolto ora.</p></div>
      <div class="policy-grid"><div class="policy-box"><h2>Accettiamo</h2><ul><li>Siti archeologici e paesaggi senza persone riconoscibili</li><li>Reperti, iscrizioni, mosaici e dettagli architettonici</li><li>Edifici storici di interesse archeologico</li><li>Video stabili, pertinenti e accompagnati da informazioni sul luogo</li></ul></div><div class="policy-box reject"><h2>Non accettiamo</h2><ul><li>Volti o persone riconoscibili, anche sullo sfondo</li><li>Immagini che mostrano comportamenti pericolosi o illeciti</li><li>Contenuti senza relazione con il patrimonio archeologico</li><li>Materiali di terzi senza autorizzazione o con watermark</li></ul></div></div>
    </section>
    <section class="section" style="padding-top:0"><div class="editorial-note"><h3>Invii non disponibili</h3><p>Non caricare foto, video o dati personali: il portale non dispone ancora di un sistema di ricezione o moderazione.</p></div></section>`;
}

function setActiveNav(route) {
  document.querySelectorAll("[data-route]").forEach(link => link.classList.toggle("active", link.dataset.route === route));
}

function bindHome() {
  document.querySelectorAll(".era-button").forEach(button => button.addEventListener("click", () => {
    const era = eras[Number(button.dataset.era)];
    document.querySelectorAll(".era-button").forEach(el => el.classList.remove("active"));
    button.classList.add("active");
    document.querySelector("#era-detail").innerHTML = `<strong>${era[2]}</strong><p>${era[3]}</p>`;
  }));
}

function bindLibrary() {
  let filter = "Tutti";
  let query = "";
  const update = () => {
    const filtered = documents.filter(doc => (filter === "Tutti" || doc.category === filter) && `${doc.title} ${doc.description} ${doc.category}`.toLowerCase().includes(query));
    document.querySelector("#document-grid").innerHTML = renderDocuments(filtered);
  };
  document.querySelectorAll(".filter-button").forEach(button => button.addEventListener("click", () => {
    filter = button.dataset.filter;
    document.querySelectorAll(".filter-button").forEach(el => el.classList.toggle("active", el === button));
    update();
  }));
  document.querySelector("#library-search")?.addEventListener("input", event => { query = event.target.value.trim().toLowerCase(); update(); });
}

function router() {
  const path = location.hash.replace(/^#/, "").split("?")[0] || "/";
  let route = "home";
  if (path.startsWith('/corpus')) { main.replaceChildren(); route='corpus'; void corpusPage(); }
  else if (path.startsWith("/biblioteca")) { main.innerHTML = libraryPage(); route = "biblioteca"; bindLibrary(); }
  else if (path.startsWith("/contributi")) { main.innerHTML = contributionPage(); route = "contributi"; }
  else { main.innerHTML = homePage(); bindHome(); }
  header.classList.toggle("inner", route !== "home"); setActiveNav(route);
  document.querySelector("#mobile-nav").classList.remove("open"); document.querySelector("#menu-button").setAttribute("aria-expanded", "false");
  window.scrollTo(0, 0);
}

async function corpusPage() {
  const requested=location.hash;
  const host=document.createElement('section');host.className='canonical-reader';
  const message=document.createElement('p');message.textContent='Apertura del corpus…';host.append(message);main.append(host);
  try {
    const corpus=await loadCorpus();if(location.hash!==requested)return;
    const [routePath, query='']=(requested.slice(1)||'/corpus').split('?');
    const id=decodeURIComponent(routePath.split('/')[2]||'');host.replaceChildren();
    if(!id){const title=document.createElement('h1');title.textContent='Corpus canonico';host.append(title);for(const {raw} of corpus){const p=document.createElement('p');const a=document.createElement('a');a.href='#/corpus/'+encodeURIComponent(raw.id);a.textContent=raw.id==='intro'?'Introduzione':raw.titleBlock[2];p.append(a);host.append(p);}return;}
    const entry=corpus.find(x=>x.raw.id===id);if(!entry)throw Error('Documento non trovato');
    const back=document.createElement('a');back.href='#/corpus';back.textContent='Tutti i capitoli';host.append(back);
    const index=document.createElement('nav');index.setAttribute('aria-label','Sezioni del capitolo');
    for(const section of entry.raw.sections){const link=document.createElement('a');link.textContent=section.title;link.href=`#/corpus/${encodeURIComponent(id)}?section=${encodeURIComponent(section.id)}`;index.append(link,document.createElement('br'));}host.append(index);
    const body=document.createElement('article');host.append(body);renderDocument(entry.document,body);
    const section=new URLSearchParams(query).get('section');if(section){const target=body.querySelector('#'+CSS.escape(section));if(!target)throw Error('Sezione non trovata');target.scrollIntoView();}
  } catch(error){if(location.hash!==requested)return;host.replaceChildren();const p=document.createElement('p');p.textContent=error.message;host.append(p);}
}

window.addEventListener("hashchange", router);
window.addEventListener("scroll", () => header.classList.toggle("scrolled", window.scrollY > 30));
document.querySelector("#menu-button").addEventListener("click", event => { const open = event.currentTarget.getAttribute("aria-expanded") !== "true"; event.currentTarget.setAttribute("aria-expanded", open); document.querySelector("#mobile-nav").classList.toggle("open", open); });
const searchDialog = document.querySelector("#search-dialog");
document.querySelector("#open-search").addEventListener("click", () => { searchDialog.showModal(); setTimeout(() => document.querySelector("#global-search").focus(), 50); });
document.querySelector("#global-search").addEventListener("input", event => {
  const q = event.target.value.trim().toLowerCase();
  const pages = [
    ["La storia di Roma", "Dalla fondazione al Tardo Impero", "#/"],
    ["Biblioteca scientifica", "Archeologia, epigrafia e metodo", "#/biblioteca"],
    ["Archivio partecipato", "Servizio di invio non ancora attivo", "#/contributi"]
  ];
  document.querySelector("#search-suggestions").innerHTML = q ? pages.filter(p => `${p[0]} ${p[1]}`.toLowerCase().includes(q)).map(p => `<a href="${p[2]}" onclick="document.querySelector('#search-dialog').close()"><strong>${p[0]}</strong><br><small>${p[1]}</small></a>`).join("") : "";
});

router();
