import { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, Cell
} from "recharts";

// ─── PALETTE ──────────────────────────────────────────────────────────────────
const C = {
  bg:         "#FBF7F4",
  white:      "#FFFFFF",
  sand:       "#F5EDE5",
  sandDark:   "#EDE0D5",
  coral:      "#D9715A",
  coralLight: "#E8957D",
  coralPale:  "#FAEEE9",
  coralDeep:  "#B85A44",
  sage:       "#7A9E8E",
  sagePale:   "#EAF2EE",
  sageDark:   "#547A6B",
  text:       "#2A2118",
  muted:      "#9A8C84",
  border:     "#EDE3DC",
  green:      "#68A888",
  greenPale:  "#E8F4EE",
  yellow:     "#C9934A",
  yellowPale: "#FBF0E2",
  red:        "#C0574F",
  redPale:    "#FBECEA",
};

const MONTHS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

// ─── DEFAULT SETTINGS ─────────────────────────────────────────────────────────
const defaultSettings = {
  nomActivite:     "Mon activité",
  metier:          "Freelance",
  objectifMensuel: 2500,
  tauxCharges:     22.1,
  typesPrestation: [
    { nom: "Prestation 1/2 journée", tarif: 400 },
    { nom: "Prestation journée",     tarif: 750 },
    { nom: "Prestation sur mesure",  tarif: 500 },
    { nom: "Forfait mensuel",        tarif: 1000 },
    { nom: "Consultation / Conseil", tarif: 150 },
    { nom: "Autre",                  tarif: 0 },
  ],
  regions: [
    "Île-de-France","Auvergne-Rhône-Alpes","Pays de la Loire","Bretagne",
    "Normandie","Nouvelle-Aquitaine","Occitanie","Grand Est",
    "Bourgogne-Franche-Comté","Centre-Val de Loire","Hauts-de-France",
    "Provence-Alpes-Côte d'Azur","Corse","Guadeloupe","Guyane",
    "Martinique","La Réunion","Mayotte",
  ],
};

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
const G = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; }
  body { background: ${C.bg}; font-family: 'DM Sans', sans-serif; color: ${C.text}; font-size: 14px; line-height: 1.5; }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${C.sandDark}; border-radius: 99px; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
  .anim { animation: fadeUp 0.3s ease both; }
  input, select, textarea {
    font-family: 'DM Sans', sans-serif; font-size: 14px;
    border: 1.5px solid ${C.border}; border-radius: 12px;
    padding: 10px 14px; background: ${C.white}; color: ${C.text};
    width: 100%; outline: none; transition: border-color .2s, box-shadow .2s;
    appearance: none; -webkit-appearance: none;
  }
  input:focus, select:focus, textarea:focus {
    border-color: ${C.coral}; box-shadow: 0 0 0 3px ${C.coralPale};
  }
  input::placeholder, textarea::placeholder { color: ${C.muted}; opacity: 0.7; }
  select {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath fill='none' stroke='%239A8C84' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' d='M1 1l4 4 4-4'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 14px center; padding-right: 36px;
  }
  button { font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all .18s; }
  table { border-collapse: collapse; width: 100%; }
  thead th {
    font-size: 11px; font-weight: 600; color: ${C.muted};
    text-transform: uppercase; letter-spacing: .07em;
    padding: 12px 18px; text-align: left;
    background: ${C.sand}; border-bottom: 1px solid ${C.border}; white-space: nowrap;
  }
  tbody td { padding: 14px 18px; border-bottom: 1px solid ${C.border}; vertical-align: middle; }
  tbody tr:last-child td { border-bottom: none; }
  tbody tr { transition: background .12s; }
  tbody tr:hover td { background: ${C.coralPale}; }
  .badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 10px; border-radius: 99px; font-size: 12px; font-weight: 500; white-space: nowrap;
  }
  .badge-green  { background: ${C.greenPale};  color: ${C.sageDark}; }
  .badge-yellow { background: ${C.yellowPale}; color: ${C.yellow}; }
  .badge-sage   { background: ${C.sagePale};   color: ${C.sageDark}; }
  .badge-coral  { background: ${C.coralPale};  color: ${C.coralDeep}; }
`;

// ─── ATOMS ────────────────────────────────────────────────────────────────────
const Btn = ({ onClick, children, variant = "primary", size = "md", style: s = {} }) => {
  const base = { border:"none", borderRadius:12, fontWeight:500, display:"inline-flex", alignItems:"center", gap:6, padding: size==="sm" ? "7px 14px" : "10px 22px", fontSize: size==="sm" ? 13 : 14 };
  const v = {
    primary: { background:C.coral,     color:"#fff" },
    ghost:   { background:"transparent", color:C.coral,     border:`1.5px solid ${C.coral}` },
    soft:    { background:C.coralPale,  color:C.coralDeep },
    danger:  { background:C.redPale,    color:C.red },
  };
  return <button onClick={onClick} style={{ ...base, ...v[variant], ...s }}>{children}</button>;
};

const Card = ({ children, style = {}, noPad }) => (
  <div style={{ background:C.white, borderRadius:20, border:`1px solid ${C.border}`, padding: noPad ? 0 : 28, overflow: noPad ? "hidden" : undefined, ...style }}>
    {children}
  </div>
);

const KPI = ({ label, value, sub, color = C.coral, icon }) => (
  <div style={{ background:C.white, borderRadius:18, border:`1px solid ${C.border}`, padding:"22px 26px" }}>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
      <span style={{ fontSize:11, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:".07em", lineHeight:1.4 }}>{label}</span>
      {icon && <span style={{ fontSize:18, opacity:.75 }}>{icon}</span>}
    </div>
    <div style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:32, fontWeight:600, color, lineHeight:1 }}>{value}</div>
    {sub && <div style={{ fontSize:12, color:C.muted, marginTop:6 }}>{sub}</div>}
  </div>
);

const PageTitle = ({ children, sub }) => (
  <div style={{ marginBottom:32 }}>
    <h1 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:34, fontWeight:600, color:C.text, letterSpacing:"-0.02em", lineHeight:1 }}>{children}</h1>
    {sub && <p style={{ fontSize:14, color:C.muted, marginTop:7 }}>{sub}</p>}
  </div>
);

const Field = ({ label, children, full, style: s = {} }) => (
  <div style={{ gridColumn: full ? "1 / -1" : undefined, ...s }}>
    <label style={{ display:"block", fontSize:11, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:".07em", marginBottom:6 }}>{label}</label>
    {children}
  </div>
);

const Hr = ({ label }) => (
  <div style={{ gridColumn:"1 / -1", display:"flex", alignItems:"center", gap:10, margin:"4px 0" }}>
    <div style={{ flex:1, height:1, background:C.border }} />
    {label && <span style={{ fontSize:11, color:C.muted, fontWeight:600, textTransform:"uppercase", letterSpacing:".07em", flexShrink:0 }}>{label}</span>}
    <div style={{ flex:1, height:1, background:C.border }} />
  </div>
);

const Modal = ({ open, onClose, title, subtitle, children }) => {
  if (!open) return null;
  return (
    <div style={{ position:"fixed", inset:0, zIndex:500, overflowY:"auto", display:"flex", padding:"20px" }}>
      <div onClick={onClose} style={{ position:"absolute", inset:0, background:"rgba(42,33,24,.42)", backdropFilter:"blur(6px)" }} />
      <div className="anim" style={{ position:"relative", background:C.white, borderRadius:24, padding:"36px 40px", width:"100%", maxWidth:540, maxHeight:"92vh", overflowY:"auto", boxShadow:"0 24px 80px rgba(0,0,0,.18)" }}>
        <button onClick={onClose} style={{ position:"absolute", top:18, right:18, background:C.sand, border:"none", borderRadius:99, width:32, height:32, fontSize:18, color:C.muted, display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
        <div style={{ marginBottom:28 }}>
          <h2 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:24, fontWeight:600 }}>{title}</h2>
          {subtitle && <p style={{ fontSize:13, color:C.muted, marginTop:4 }}>{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
};

const Empty = ({ icon, title, sub, action }) => (
  <div style={{ textAlign:"center", padding:"64px 40px" }}>
    <div style={{ fontSize:44, marginBottom:16, opacity:.35 }}>{icon}</div>
    <div style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:22, fontWeight:600, color:C.text, marginBottom:6 }}>{title}</div>
    <div style={{ fontSize:13, color:C.muted, marginBottom:26 }}>{sub}</div>
    {action}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:12, padding:"10px 16px", fontSize:13, boxShadow:"0 4px 20px rgba(0,0,0,.08)" }}>
      <div style={{ fontWeight:600, marginBottom:6, color:C.text }}>{label}</div>
      {payload.map((p,i) => (
        <div key={i} style={{ display:"flex", gap:10, alignItems:"center" }}>
          <div style={{ width:8, height:8, borderRadius:2, background:p.fill || p.color, flexShrink:0 }} />
          <span style={{ color:C.muted }}>{p.name}</span>
          <span style={{ fontWeight:600, color:C.text }}>{(p.value||0).toLocaleString("fr-FR")} €</span>
        </div>
      ))}
    </div>
  );
};

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
const Dashboard = ({ prestations, settings, onNewPrestation }) => {
  const taux = settings.tauxCharges / 100;
  const objectif = settings.objectifMensuel;
  const now = new Date();
  const currentMonth = now.getMonth();

  const monthlyData = useMemo(() => MONTHS.map((m, i) => {
    const ca = prestations.filter(s => s.mois === m).reduce((a,s) => a+s.tarif, 0);
    return { mois: m.slice(0,3), CA: Math.round(ca), Net: Math.round(ca*(1-taux)), Objectif: objectif, idx: i };
  }), [prestations, taux, objectif]);

  const totalCA  = prestations.reduce((a,s) => a+s.tarif, 0);
  const totalNet = totalCA * (1 - taux);
  const caMonth  = prestations.filter(s => s.mois === MONTHS[currentMonth]).reduce((a,s) => a+s.tarif, 0);
  const netMonth = caMonth * (1 - taux);
  const pct = objectif > 0 ? Math.min(100, Math.round((netMonth / objectif)*100)) : 0;

  const byType = useMemo(() => {
    const m = {};
    prestations.forEach(s => { m[s.type] = (m[s.type]||0)+1; });
    return Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,5);
  }, [prestations]);

  const [range, setRange] = useState("year");
  const chartData = range === "ytd" ? monthlyData.slice(0, currentMonth+1) : monthlyData;

  if (prestations.length === 0) return (
    <div className="anim">
      <PageTitle sub="Bienvenue 👋 Ajoutez vos premières prestations pour voir vos statistiques.">Tableau de bord</PageTitle>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px,1fr))", gap:16, marginBottom:24 }}>
        <KPI label="CA Total 2026" value="—" sub="Aucune prestation" icon="💰" />
        <KPI label="Salaire net" value="—" sub={`Après ${settings.tauxCharges}% charges`} icon="✨" color={C.sage} />
        <KPI label="Prestations" value="0" sub="Enregistrées" icon="📷" color={C.muted} />
        <KPI label="Objectif mensuel" value={`${objectif.toLocaleString("fr-FR")} €`} sub="Net / mois visé" icon="🎯" color={C.yellow} />
      </div>
      <Card>
        <Empty icon="📊" title="Vos statistiques apparaîtront ici"
          sub="Saisissez votre première prestation pour démarrer le suivi."
          action={<Btn onClick={onNewPrestation}>＋ Ajouter une prestation</Btn>} />
      </Card>
    </div>
  );

  return (
    <div className="anim">
      <PageTitle sub={`${settings.nomActivite} · ${prestations.length} prestation${prestations.length>1?"s":""} en 2026`}>
        Tableau de bord
      </PageTitle>

      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(190px,1fr))", gap:16, marginBottom:28 }}>
        <KPI label="CA Total 2026"     value={`${totalCA.toLocaleString("fr-FR",{minimumFractionDigits:2})} €`}  sub="Brut toutes prestations"           icon="💰" />
        <KPI label="Salaire net 2026"  value={`${totalNet.toLocaleString("fr-FR",{minimumFractionDigits:2})} €`} sub={`Après ${settings.tauxCharges}% charges`} icon="✨" color={C.sage} />
        <KPI label={MONTHS[currentMonth]} value={`${caMonth.toLocaleString("fr-FR",{minimumFractionDigits:2})} €`} sub="CA mois en cours"              icon="📅" color={C.coralLight} />
        <KPI label="Objectif mensuel"  value={`${objectif.toLocaleString("fr-FR")} €`}                           sub="Net / mois visé"                 icon="🎯" color={C.yellow} />
      </div>

      {/* Progress */}
      <Card style={{ marginBottom:28, padding:"20px 28px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:12 }}>
          <div>
            <span style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:17, fontWeight:600 }}>
              Progression de {MONTHS[currentMonth]}
            </span>
            <span style={{ fontSize:13, color:C.muted, marginLeft:10 }}>
              {netMonth.toLocaleString("fr-FR",{maximumFractionDigits:0})} € net · objectif {objectif.toLocaleString("fr-FR")} €
            </span>
          </div>
          <span style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:24, fontWeight:600, color: pct>=100 ? C.green : pct>=60 ? C.yellow : C.coral }}>
            {pct}%
          </span>
        </div>
        <div style={{ background:C.sand, borderRadius:99, height:8, overflow:"hidden" }}>
          <div style={{ height:"100%", borderRadius:99, background: pct>=100?C.green:pct>=60?C.yellow:C.coral, width:`${pct}%`, transition:"width 1.2s cubic-bezier(.4,0,.2,1)" }} />
        </div>
      </Card>

      {/* Charts */}
      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:20, marginBottom:20 }}>
        <Card>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
            <h3 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:19, fontWeight:600 }}>CA mensuel</h3>
            <div style={{ display:"flex", gap:6 }}>
              {[["year","Année entière"],["ytd","À ce jour"]].map(([r,l]) => (
                <button key={r} onClick={() => setRange(r)} style={{
                  padding:"5px 13px", borderRadius:8, border:"none", fontSize:12, fontFamily:"'DM Sans', sans-serif", fontWeight:500,
                  background: range===r ? C.coral : C.sand, color: range===r ? "white" : C.muted,
                }}>{l}</button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} barGap={3} barCategoryGap="38%">
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis dataKey="mois" tick={{ fontSize:12, fill:C.muted }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:12, fill:C.muted }} axisLine={false} tickLine={false} width={50} tickFormatter={v => v ? `${(v/1000).toFixed(0)}k` : "0"} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill:C.coralPale, radius:8 }} />
              <Bar dataKey="CA" radius={[6,6,0,0]} name="CA Brut">
                {chartData.map((entry, i) => <Cell key={i} fill={entry.idx===currentMonth ? C.coralDeep : C.coral} />)}
              </Bar>
              <Bar dataKey="Net" fill={C.sage} radius={[6,6,0,0]} name="CA Net" />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display:"flex", gap:20, justifyContent:"center", marginTop:14 }}>
            {[["CA Brut",C.coral],["CA Net",C.sage]].map(([l,c]) => (
              <div key={l} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:C.muted }}>
                <div style={{ width:12, height:12, borderRadius:3, background:c }} />{l}
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:19, fontWeight:600, marginBottom:22 }}>Types de prestations</h3>
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {byType.map(([type, count]) => {
              const p = Math.round((count/prestations.length)*100);
              return (
                <div key={type}>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:5 }}>
                    <span style={{ fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:"68%" }}>{type}</span>
                    <span style={{ color:C.muted, flexShrink:0 }}>{count} · {p}%</span>
                  </div>
                  <div style={{ background:C.sand, borderRadius:99, height:6 }}>
                    <div style={{ background:C.coral, width:`${p}%`, height:"100%", borderRadius:99, transition:"width 1s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Recent */}
      <Card noPad>
        <div style={{ padding:"18px 24px", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <h3 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:19, fontWeight:600 }}>Prestations récentes</h3>
          <span style={{ fontSize:12, color:C.muted }}>{prestations.length} au total</span>
        </div>
        <table>
          <thead><tr><th>Date</th><th>Client</th><th>Prestation</th><th>Tarif</th><th>Statut</th></tr></thead>
          <tbody>
            {[...prestations].sort((a,b) => new Date(b.date)-new Date(a.date)).slice(0,6).map(s => (
              <tr key={s.id}>
                <td style={{ color:C.muted, fontSize:13 }}>{s.date}</td>
                <td style={{ fontWeight:500 }}>{s.nom}</td>
                <td><span className="badge badge-sage">{s.type}</span></td>
                <td style={{ fontWeight:700, color:C.coral, whiteSpace:"nowrap" }}>{s.tarif.toLocaleString("fr-FR")} €</td>
                <td><span className={`badge ${s.declare==="Oui"?"badge-green":"badge-yellow"}`}>{s.declare==="Oui"?"✓ Déclaré":"⏳ En attente"}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

// ─── SESSIONS ─────────────────────────────────────────────────────────────────
const Prestations = ({ prestations, setPrestations, settings, openNew, triggerNew, setTriggerNew }) => {
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [filterMois, setFilterMois] = useState("");
  const [filterType, setFilterType] = useState("");
  const [sortDir, setSortDir] = useState("desc");

  const fresh = () => ({
    date:"", mois:"", nom:"", type:settings.typesPrestation[0]?.nom||"",
    mail:"", tel:"", tarif:"", declare:"Oui", paiement:"Virement",
    region:settings.regions[0]||"", commentaire:"",
  });
  const [form, setForm] = useState(fresh());

  if (triggerNew) { setEditId(null); setForm(fresh()); setModal(true); setTriggerNew(false); }

  const upd = (k, v) => setForm(prev => {
    const next = { ...prev, [k]: v };
    if (k==="date" && v) { const d = new Date(v); if (!isNaN(d)) next.mois = MONTHS[d.getMonth()]; }
    if (k==="type") { const t = settings.typesPrestation.find(t=>t.nom===v); if (t && t.tarif>0) next.tarif = t.tarif; }
    return next;
  });

  const openEdit = (s) => { setEditId(s.id); setForm({...s}); setModal(true); };
  const save = () => {
    if (!form.nom.trim() || !form.date) return;
    const entry = { ...form, tarif: parseFloat(form.tarif)||0 };
    setPrestations(prev => editId ? prev.map(s => s.id===editId ? {...entry,id:editId} : s) : [...prev, {...entry,id:Date.now()}]);
    setModal(false);
  };
  const del = (id) => setPrestations(prev => prev.filter(s => s.id!==id));

  const displayed = useMemo(() => {
    const q = search.toLowerCase();
    return prestations
      .filter(s => {
        if (q && !s.nom.toLowerCase().includes(q) && !s.type.toLowerCase().includes(q)) return false;
        if (filterMois && s.mois!==filterMois) return false;
        if (filterType && s.type!==filterType) return false;
        return true;
      })
      .sort((a,b) => {
        const da=new Date(a.date), db=new Date(b.date);
        return sortDir==="desc" ? db-da : da-db;
      });
  }, [prestations, search, filterMois, filterType, sortDir]);

  const totalDisplayed = displayed.reduce((a,s) => a+s.tarif, 0);
  const uniqueTypes = [...new Set(prestations.map(s=>s.type))];

  return (
    <div className="anim">
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12, marginBottom:24 }}>
        <PageTitle sub={`${prestations.length} prestation${prestations.length>1?"s":""}${displayed.length!==prestations.length?` · ${displayed.length} affichée${displayed.length>1?"s":""}`:""} · ${totalDisplayed.toLocaleString("fr-FR",{minimumFractionDigits:2})} €`}>
          Mes prestations
        </PageTitle>
        <Btn onClick={() => { setEditId(null); setForm(fresh()); setModal(true); }}>＋ Nouvelle prestation</Btn>
      </div>

      {/* Filters */}
      <div style={{ display:"flex", gap:10, marginBottom:20, flexWrap:"wrap" }}>
        <input placeholder="🔍  Rechercher…" value={search} onChange={e=>setSearch(e.target.value)} style={{ maxWidth:280 }} />
        <select value={filterMois} onChange={e=>setFilterMois(e.target.value)} style={{ maxWidth:160 }}>
          <option value="">Tous les mois</option>
          {MONTHS.map(m=><option key={m}>{m}</option>)}
        </select>
        {uniqueTypes.length > 1 && (
          <select value={filterType} onChange={e=>setFilterType(e.target.value)} style={{ maxWidth:220 }}>
            <option value="">Tous les types</option>
            {uniqueTypes.map(t=><option key={t}>{t}</option>)}
          </select>
        )}
        <button onClick={()=>setSortDir(d=>d==="desc"?"asc":"desc")} style={{ background:C.sand, border:"none", borderRadius:12, padding:"10px 16px", fontSize:13, color:C.muted, fontFamily:"'DM Sans', sans-serif" }}>
          {sortDir==="desc" ? "↓ Plus récent" : "↑ Plus ancien"}
        </button>
      </div>

      {prestations.length === 0 ? (
        <Card>
          <Empty icon="📷" title="Aucune prestation pour l'instant"
            sub="Ajoutez votre première prestation pour commencer le suivi de votre activité."
            action={<Btn onClick={() => { setEditId(null); setForm(fresh()); setModal(true); }}>＋ Ajouter une prestation</Btn>} />
        </Card>
      ) : (
        <Card noPad>
          <table>
            <thead><tr>
              <th>Date</th><th>Client</th><th>Prestation</th><th>Tarif</th>
              <th>Paiement</th><th>Déclaré</th><th>Région</th><th style={{width:72}}></th>
            </tr></thead>
            <tbody>
              {displayed.length === 0 && <tr><td colSpan={8} style={{ textAlign:"center", color:C.muted, padding:40 }}>Aucun résultat</td></tr>}
              {displayed.map(s => (
                <tr key={s.id} style={{ cursor:"pointer" }} onClick={()=>openEdit(s)}>
                  <td style={{ color:C.muted, fontSize:13, whiteSpace:"nowrap" }}>{s.date}</td>
                  <td>
                    <div style={{ fontWeight:500 }}>{s.nom}</div>
                    {s.commentaire && <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{s.commentaire}</div>}
                  </td>
                  <td><span className="badge badge-sage">{s.type}</span></td>
                  <td style={{ fontWeight:700, color:C.coral, whiteSpace:"nowrap" }}>{s.tarif.toLocaleString("fr-FR")} €</td>
                  <td style={{ color:C.muted, fontSize:13 }}>{s.paiement}</td>
                  <td><span className={`badge ${s.declare==="Oui"?"badge-green":"badge-yellow"}`}>{s.declare==="Oui"?"✓ Déclaré":"⏳ Attente"}</span></td>
                  <td style={{ color:C.muted, fontSize:13 }}>{s.region}</td>
                  <td onClick={e=>{e.stopPropagation(); del(s.id);}}>
                    <Btn variant="danger" size="sm">✕</Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Modal open={modal} onClose={()=>setModal(false)}
        title={editId ? "Modifier la prestation" : "Nouvelle prestation"}
        subtitle={editId ? "Modifiez les informations de cette prestation" : "Remplissez les informations de la prestation"}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <Field label="Date">
            <input type="date" value={form.date} onChange={e=>upd("date",e.target.value)} />
          </Field>
          <Field label="Mois (automatique)">
            <input value={form.mois} readOnly style={{ background:C.sand, color:C.muted }} />
          </Field>
          <Field label="Nom du client" full>
            <input placeholder="Prénom Nom" value={form.nom} onChange={e=>upd("nom",e.target.value)} />
          </Field>
          <Field label="Type de prestation">
            <select value={form.type} onChange={e=>upd("type",e.target.value)}>
              {settings.typesPrestation.map(t=><option key={t.nom}>{t.nom}</option>)}
            </select>
          </Field>
          <Field label="Tarif (€)">
            <input type="number" min={0} step={0.01} value={form.tarif} onChange={e=>upd("tarif",e.target.value)} placeholder="0" />
          </Field>
          <Hr label="Contact" />
          <Field label="Email">
            <input type="email" placeholder="client@email.fr" value={form.mail} onChange={e=>upd("mail",e.target.value)} />
          </Field>
          <Field label="Téléphone">
            <input placeholder="06 …" value={form.tel} onChange={e=>upd("tel",e.target.value)} />
          </Field>
          <Hr label="Facturation" />
          <Field label="CA Déclaré">
            <select value={form.declare} onChange={e=>upd("declare",e.target.value)}>
              <option>Oui</option><option>Non</option>
            </select>
          </Field>
          <Field label="Mode de paiement">
            <select value={form.paiement} onChange={e=>upd("paiement",e.target.value)}>
              {["Virement","Chèque","Espèces","Lydia","Sumeria","PayPal","Autre"].map(p=><option key={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Région" full>
            <select value={form.region} onChange={e=>upd("region",e.target.value)}>
              {settings.regions.map(r=><option key={r}>{r}</option>)}
            </select>
          </Field>
          <Field label="Commentaire" full>
            <textarea rows={2} value={form.commentaire} onChange={e=>upd("commentaire",e.target.value)} placeholder="Adresse, informations client, notes…" style={{ resize:"vertical" }} />
          </Field>
        </div>
        <div style={{ display:"flex", justifyContent:"flex-end", gap:10, marginTop:28 }}>
          <Btn variant="ghost" onClick={()=>setModal(false)}>Annuler</Btn>
          <Btn onClick={save}>{editId ? "Mettre à jour" : "Enregistrer"}</Btn>
        </div>
      </Modal>
    </div>
  );
};

// ─── PARAMÈTRES ───────────────────────────────────────────────────────────────
const Parametres = ({ settings, setSettings }) => {
  const upd = (k, v) => setSettings(p => ({...p,[k]:v}));
  const updType = (i, field, val) => setSettings(p => ({
    ...p, typesPrestation: p.typesPrestation.map((t,j) => j===i ? {...t,[field]:field==="tarif"?parseFloat(val)||0:val} : t)
  }));
  const addType = () => setSettings(p => ({...p, typesPrestation:[...p.typesPrestation,{nom:"",tarif:0}]}));
  const delType = (i) => setSettings(p => ({...p, typesPrestation:p.typesPrestation.filter((_,j)=>j!==i)}));
  const brut = settings.objectifMensuel / (1 - settings.tauxCharges/100);

  return (
    <div className="anim">
      <PageTitle sub="Personnalisez Clo' selon votre activité et votre métier">Paramètres</PageTitle>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
        <Card>
          <h3 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:20, fontWeight:600, marginBottom:22 }}>Informations générales</h3>
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <Field label="Nom de l'activité">
              <input value={settings.nomActivite} onChange={e=>upd("nomActivite",e.target.value)} />
            </Field>
            <Field label="Métier / Secteur">
              <input value={settings.metier} onChange={e=>upd("metier",e.target.value)} placeholder="Ex: Photographe, Graphiste, Illustratrice…" />
            </Field>
          </div>
        </Card>

        <Card>
          <h3 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:20, fontWeight:600, marginBottom:22 }}>Objectifs & charges</h3>
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <Field label="Objectif net mensuel (€)">
              <input type="number" value={settings.objectifMensuel} onChange={e=>upd("objectifMensuel",parseFloat(e.target.value)||0)} />
            </Field>
            <Field label="Taux de charges / URSSAF (%)">
              <input type="number" step={0.1} value={settings.tauxCharges} onChange={e=>upd("tauxCharges",parseFloat(e.target.value)||0)} />
            </Field>
            <div style={{ background:C.sand, borderRadius:14, padding:"14px 18px" }}>
              <div style={{ fontSize:11, color:C.muted, fontWeight:600, textTransform:"uppercase", letterSpacing:".07em", marginBottom:10 }}>Calcul</div>
              {[
                ["CA brut nécessaire / mois", `${brut.toLocaleString("fr-FR",{maximumFractionDigits:2})} €`],
                ["CA brut nécessaire / an",   `${(brut*12).toLocaleString("fr-FR",{maximumFractionDigits:2})} €`],
              ].map(([l,v]) => (
                <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:`1px solid ${C.border}` }}>
                  <span style={{ fontSize:13, color:C.muted }}>{l}</span>
                  <span style={{ fontWeight:600, color:C.coral }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
          <h3 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:20, fontWeight:600 }}>Types de prestations</h3>
          <Btn variant="soft" size="sm" onClick={addType}>＋ Ajouter</Btn>
        </div>
        <p style={{ fontSize:13, color:C.muted, marginBottom:20 }}>Ces types sont proposés lors de la saisie d'une prestation. Le tarif se pré-remplit automatiquement.</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(290px,1fr))", gap:10 }}>
          {settings.typesPrestation.map((t, i) => (
            <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr auto auto", gap:8, alignItems:"center", background:C.sand, borderRadius:12, padding:"10px 12px" }}>
              <input value={t.nom} onChange={e=>updType(i,"nom",e.target.value)} placeholder="Nom de la prestation" style={{ background:C.white, fontSize:13 }} />
              <div style={{ display:"flex", alignItems:"center", gap:6, background:C.white, borderRadius:10, padding:"8px 10px", border:`1.5px solid ${C.border}` }}>
                <input type="number" min={0} value={t.tarif} onChange={e=>updType(i,"tarif",e.target.value)} placeholder="0" style={{ border:"none", padding:0, width:70, fontSize:13, fontWeight:600 }} />
                <span style={{ fontSize:12, color:C.muted }}>€</span>
              </div>
              <button onClick={()=>delType(i)} style={{ background:"none", border:"none", color:C.muted, fontSize:20, lineHeight:1, padding:"2px 6px" }}>×</button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
const NAVS = [
  { id:"dashboard",   label:"Tableau de bord", icon:"◈" },
  { id:"prestations", label:"Prestations",     icon:"◉" },
  { id:"params",      label:"Paramètres",      icon:"◌" },
];

// ─── SAVE / LOAD MODAL ────────────────────────────────────────────────────────
const DataModal = ({ open, onClose, onSave, onLoad, hasPrestations }) => {
  const fileRef = useState(null);
  if (!open) return null;

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.prestations && data.settings) {
          onLoad(data);
          onClose();
        } else {
          alert("Fichier invalide — assurez-vous d'utiliser un fichier exporté depuis Clo'.");
        }
      } catch {
        alert("Impossible de lire le fichier. Vérifiez qu'il s'agit d'un fichier JSON valide.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:600, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div onClick={onClose} style={{ position:"absolute", inset:0, background:"rgba(42,33,24,.42)", backdropFilter:"blur(6px)" }} />
      <div className="anim" style={{
        position:"relative", background:C.white, borderRadius:24,
        padding:"36px 40px", width:"100%", maxWidth:460,
        boxShadow:"0 24px 80px rgba(0,0,0,.18)",
      }}>
        <button onClick={onClose} style={{ position:"absolute", top:18, right:18, background:C.sand, border:"none", borderRadius:99, width:32, height:32, fontSize:18, color:C.muted, display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>

        <h2 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:26, fontWeight:600, marginBottom:6 }}>Mes données</h2>
        <p style={{ fontSize:13, color:C.muted, marginBottom:28, lineHeight:1.6 }}>
          Vos données restent <strong>uniquement sur votre ordinateur</strong>. Sauvegardez-les sous forme de fichier avant de quitter, et rechargez-les à votre prochaine visite.
        </p>

        {/* Save */}
        <div style={{ background:C.sand, borderRadius:16, padding:"20px 22px", marginBottom:12 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
            <div>
              <div style={{ fontWeight:600, fontSize:15, marginBottom:3 }}>💾  Sauvegarder</div>
              <div style={{ fontSize:12, color:C.muted }}>Télécharge un fichier <code style={{ background:C.sandDark, padding:"1px 5px", borderRadius:4 }}>.json</code> avec toutes vos données et paramètres.</div>
            </div>
          </div>
          <Btn onClick={onSave} style={{ width:"100%", justifyContent:"center" }}
            variant={hasPrestations ? "primary" : "ghost"}>
            Télécharger mes données
          </Btn>
        </div>

        {/* Load */}
        <div style={{ background:C.sagePale, borderRadius:16, padding:"20px 22px" }}>
          <div style={{ fontWeight:600, fontSize:15, marginBottom:3 }}>📂  Charger</div>
          <div style={{ fontSize:12, color:C.muted, marginBottom:12 }}>
            Sélectionnez un fichier précédemment sauvegardé pour restaurer vos données.
            {hasPrestations && <span style={{ color:C.red }}> Attention : cela remplacera les données actuelles.</span>}
          </div>
          <label style={{
            display:"flex", alignItems:"center", justifyContent:"center", gap:8,
            padding:"10px 22px", borderRadius:12, border:`1.5px solid ${C.sage}`,
            background:C.white, color:C.sageDark, fontWeight:500, fontSize:14,
            cursor:"pointer", transition:"all .18s",
          }}>
            Choisir un fichier
            <input type="file" accept=".json" onChange={handleFile} style={{ display:"none" }} />
          </label>
        </div>
      </div>
    </div>
  );
};

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView]                   = useState("dashboard");
  const [settings, setSettings]           = useState(defaultSettings);
  const [prestations, setPrestations]     = useState([]);
  const [triggerNew, setTriggerNew]       = useState(false);
  const [dataModal, setDataModal]         = useState(false);
  const [savedFlash, setSavedFlash]       = useState(false);

  const totalCA  = prestations.reduce((a,s) => a+s.tarif, 0);
  const totalNet = totalCA * (1 - settings.tauxCharges/100);

  const goNewPrestation = () => { setView("prestations"); setTriggerNew(true); };

  // ── Export ──
  const handleSave = () => {
    const data = JSON.stringify({ version:1, exportedAt: new Date().toISOString(), settings, prestations }, null, 2);
    const blob = new Blob([data], { type:"application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    const date = new Date().toLocaleDateString("fr-FR").replace(/\//g,"-");
    a.href     = url;
    a.download = `clo-données-${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2500);
  };

  // ── Import ──
  const handleLoad = ({ prestations: p, settings: s }) => {
    setPrestations(p || []);
    setSettings(s || defaultSettings);
  };

  return (
    <>
      <style>{G}</style>
      <div style={{ display:"flex", minHeight:"100vh" }}>

        {/* ── Sidebar ── */}
        <aside style={{ width:218, background:C.white, borderRight:`1px solid ${C.border}`, display:"flex", flexDirection:"column", position:"sticky", top:0, height:"100vh", flexShrink:0 }}>

          {/* Brand */}
          <div style={{ padding:"28px 24px 24px", borderBottom:`1px solid ${C.border}` }}>
            <div style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:42, fontWeight:600, color:C.coral, lineHeight:1, letterSpacing:"-0.03em" }}>Clo'</div>
            <div style={{ fontSize:11, color:C.muted, marginTop:6, letterSpacing:".09em", textTransform:"uppercase" }}>{settings.metier}</div>
          </div>

          {/* Nav */}
          <nav style={{ flex:1, padding:"16px 12px", display:"flex", flexDirection:"column", gap:3 }}>
            {NAVS.map(n => {
              const active = view===n.id;
              return (
                <button key={n.id} onClick={()=>setView(n.id)} style={{
                  display:"flex", alignItems:"center", gap:10, padding:"10px 14px",
                  borderRadius:12, border:"none", width:"100%", textAlign:"left",
                  background: active ? C.coralPale : "transparent",
                  color: active ? C.coralDeep : C.muted,
                  fontFamily:"'DM Sans', sans-serif", fontWeight: active ? 600 : 400, fontSize:14,
                }}>
                  <span style={{ fontSize:14 }}>{n.icon}</span>{n.label}
                </button>
              );
            })}
          </nav>

          {/* Summary */}
          <div style={{ padding:"0 12px 12px" }}>
            {prestations.length > 0 ? (
              <div style={{ background:C.sand, borderRadius:14, padding:"14px 16px", marginBottom:8 }}>
                <div style={{ fontSize:10, color:C.muted, fontWeight:600, textTransform:"uppercase", letterSpacing:".08em", marginBottom:8 }}>
                  {new Date().getFullYear()}
                </div>
                <div style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:24, fontWeight:600, color:C.coral, lineHeight:1 }}>
                  {totalCA.toLocaleString("fr-FR",{maximumFractionDigits:0})} €
                </div>
                <div style={{ fontSize:12, color:C.muted, marginTop:5 }}>{totalNet.toLocaleString("fr-FR",{maximumFractionDigits:0})} € net</div>
                <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{prestations.length} prestation{prestations.length>1?"s":""}</div>
              </div>
            ) : null}

            {/* Data button */}
            <button onClick={() => setDataModal(true)} style={{
              width:"100%", padding:"11px 14px", borderRadius:12,
              border: `1.5px solid ${savedFlash ? C.green : C.border}`,
              background: savedFlash ? C.greenPale : C.white,
              color: savedFlash ? C.green : C.muted,
              fontSize:13, fontFamily:"'DM Sans', sans-serif", fontWeight:500,
              display:"flex", alignItems:"center", justifyContent:"center", gap:7,
              transition:"all .3s",
            }}>
              {savedFlash ? "✓ Sauvegardé !" : "💾  Données"}
            </button>

            {!prestations.length && (
              <button onClick={goNewPrestation} style={{
                width:"100%", marginTop:8, padding:"11px 16px", borderRadius:12,
                border:`1.5px dashed ${C.border}`, background:"transparent",
                color:C.muted, fontSize:13, fontFamily:"'DM Sans', sans-serif",
                display:"flex", alignItems:"center", justifyContent:"center", gap:6,
              }}>
                ＋ Première prestation
              </button>
            )}
          </div>

          {/* Bottom hint */}
          {!prestations.length && (
            <div style={{ padding:"0 16px 20px" }}>
              <div style={{ fontSize:11, color:C.border, textAlign:"center", lineHeight:1.5 }}>
                Chargez un fichier existant<br/>ou commencez directement.
              </div>
            </div>
          )}
        </aside>

        {/* ── Main ── */}
        <main style={{ flex:1, padding:"44px 52px", overflowY:"auto" }}>
          {view==="dashboard"   && <Dashboard   prestations={prestations} settings={settings} onNewPrestation={goNewPrestation} />}
          {view==="prestations" && <Prestations prestations={prestations} setPrestations={setPrestations} settings={settings} triggerNew={triggerNew} setTriggerNew={setTriggerNew} />}
          {view==="params"      && <Parametres  settings={settings} setSettings={setSettings} />}
        </main>
      </div>

      <DataModal
        open={dataModal}
        onClose={() => setDataModal(false)}
        onSave={handleSave}
        onLoad={handleLoad}
        hasPrestations={prestations.length > 0}
      />
    </>
  );
}
