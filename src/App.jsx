import { useState, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from "recharts";

// ─── PALETTE ──────────────────────────────────────────────────────────────────
const C = {
  bg:         "#FBF7F4", white:      "#FFFFFF",
  sand:       "#F5EDE5", sandDark:   "#EDE0D5",
  coral:      "#D9715A", coralLight: "#E8957D",
  coralPale:  "#FAEEE9", coralDeep:  "#B85A44",
  sage:       "#7A9E8E", sagePale:   "#EAF2EE", sageDark: "#547A6B",
  text:       "#2A2118", muted:      "#9A8C84", border: "#EDE3DC",
  green:      "#68A888", greenPale:  "#E8F4EE",
  yellow:     "#C9934A", yellowPale: "#FBF0E2",
  red:        "#C0574F", redPale:    "#FBECEA",
  blue:       "#5B8DB8", bluePale:   "#EBF2F8",
};

const MONTHS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

// ─── DEFAULT SETTINGS ─────────────────────────────────────────────────────────
const defaultSettings = {
  nomActivite: "Mon activité", metier: "Freelance",
  objectifMensuel: 2500, tauxCharges: 22.1,
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
  @media (max-width: 768px) {
    .mob-hidden { display: none !important; }
    .mob-show { display: flex !important; }
    .mob-topbar { display: flex !important; }
    .sidebar-mobile { position: fixed; top: 0; left: 0; height: 100vh; z-index: 400; transform: translateX(-100%); transition: transform .28s cubic-bezier(.4,0,.2,1); }
    .sidebar-mobile.open { transform: translateX(0); box-shadow: 4px 0 32px rgba(0,0,0,.14); }
    .mob-overlay { display: block !important; }
    .main-pad { padding: 20px 18px 40px !important; padding-top: 72px !important; }
  }
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
  input:focus, select:focus, textarea:focus { border-color: ${C.coral}; box-shadow: 0 0 0 3px ${C.coralPale}; }
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
  .badge { display:inline-flex; align-items:center; gap:4px; padding:3px 10px; border-radius:99px; font-size:12px; font-weight:500; white-space:nowrap; }
  .badge-green  { background:${C.greenPale};  color:${C.sageDark}; }
  .badge-yellow { background:${C.yellowPale}; color:${C.yellow}; }
  .badge-sage   { background:${C.sagePale};   color:${C.sageDark}; }
  .badge-coral  { background:${C.coralPale};  color:${C.coralDeep}; }
  .badge-red    { background:${C.redPale};    color:${C.red}; }
  .badge-blue   { background:${C.bluePale};   color:${C.blue}; }
`;

// ─── ATOMS ────────────────────────────────────────────────────────────────────
const Btn = ({ onClick, children, variant="primary", size="md", style:s={} }) => {
  const base = { border:"none", borderRadius:12, fontWeight:500, display:"inline-flex", alignItems:"center", gap:6, padding:size==="sm"?"7px 14px":"10px 22px", fontSize:size==="sm"?13:14 };
  const v = {
    primary: { background:C.coral,     color:"#fff" },
    ghost:   { background:"transparent", color:C.coral, border:`1.5px solid ${C.coral}` },
    soft:    { background:C.coralPale,  color:C.coralDeep },
    danger:  { background:C.redPale,    color:C.red },
    sage:    { background:C.sagePale,   color:C.sageDark },
  };
  return <button onClick={onClick} style={{...base,...v[variant],...s}}>{children}</button>;
};

const Card = ({ children, style={}, noPad }) => (
  <div style={{ background:C.white, borderRadius:20, border:`1px solid ${C.border}`, padding:noPad?0:28, overflow:noPad?"hidden":undefined, ...style }}>
    {children}
  </div>
);

const KPI = ({ label, value, sub, color=C.coral, icon }) => (
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

const Field = ({ label, children, full, style:s={} }) => (
  <div style={{ gridColumn:full?"1 / -1":undefined, ...s }}>
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

const ProgressBar = ({ label, value, objectif, sub }) => {
  const pct = objectif > 0 ? Math.min(100, Math.round((value/objectif)*100)) : 0;
  const color = pct>=100 ? C.green : pct>=60 ? C.yellow : C.coral;
  return (
    <Card style={{ padding:"20px 28px", marginBottom:28 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:12 }}>
        <div>
          <span style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:17, fontWeight:600 }}>{label}</span>
          <span style={{ fontSize:13, color:C.muted, marginLeft:10 }}>{value.toLocaleString("fr-FR",{maximumFractionDigits:0})} € · objectif {objectif.toLocaleString("fr-FR")} €</span>
        </div>
        <span style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:24, fontWeight:600, color }}>{pct}%</span>
      </div>
      <div style={{ background:C.sand, borderRadius:99, height:8, overflow:"hidden" }}>
        <div style={{ height:"100%", borderRadius:99, background:color, width:`${pct}%`, transition:"width 1.2s cubic-bezier(.4,0,.2,1)" }} />
      </div>
      {sub && <div style={{ fontSize:12, color:C.muted, marginTop:10 }}>{sub}</div>}
    </Card>
  );
};

const Modal = ({ open, onClose, title, subtitle, children }) => {
  if (!open) return null;
  return (
    <div style={{ position:"fixed", inset:0, zIndex:500, display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"24px 20px", overflowY:"auto" }}>
      <div onClick={onClose} style={{ position:"absolute", inset:0, background:"rgba(42,33,24,.42)", backdropFilter:"blur(6px)" }} />
      <div className="anim" style={{ position:"relative", background:C.white, borderRadius:24, padding:"44px 52px", width:"100%", maxWidth:820, maxHeight:"90vh", overflowY:"auto", boxShadow:"0 24px 80px rgba(0,0,0,.18)" }}>
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

// ─── CONFIRM DIALOG ──────────────────────────────────────────────────────────
const ConfirmDialog = ({ open, message, onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div style={{ position:"fixed", inset:0, zIndex:600, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div onClick={onCancel} style={{ position:"absolute", inset:0, background:"rgba(42,33,24,.42)", backdropFilter:"blur(4px)" }} />
      <div className="anim" style={{ position:"relative", background:C.white, borderRadius:20, padding:"32px 36px", width:"100%", maxWidth:380, boxShadow:"0 16px 60px rgba(0,0,0,.16)", textAlign:"center" }}>
        <div style={{ fontSize:36, marginBottom:12 }}>🗑️</div>
        <h3 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:22, fontWeight:600, marginBottom:8 }}>Confirmer la suppression</h3>
        <p style={{ fontSize:14, color:C.muted, marginBottom:24, lineHeight:1.6 }}>{message}</p>
        <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
          <Btn variant="ghost" onClick={onCancel}>Annuler</Btn>
          <Btn variant="danger" onClick={onConfirm}>Supprimer</Btn>
        </div>
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
      <div style={{ fontWeight:600, marginBottom:6 }}>{label}</div>
      {payload.map((p,i) => (
        <div key={i} style={{ display:"flex", gap:10, alignItems:"center" }}>
          <div style={{ width:8, height:8, borderRadius:2, background:p.fill||p.color, flexShrink:0 }} />
          <span style={{ color:C.muted }}>{p.name}</span>
          <span style={{ fontWeight:600 }}>{(p.value||0).toLocaleString("fr-FR")} €</span>
        </div>
      ))}
    </div>
  );
};

// ─── CSV EXPORT ───────────────────────────────────────────────────────────────
const exportCSV = (data, filename, columns) => {
  const header = columns.map(c => c.label).join(";");
  const rows = data.map(row => columns.map(c => {
    const v = typeof c.key === "function" ? c.key(row) : row[c.key];
    return `"${String(v||"").replace(/"/g,'""')}"`;
  }).join(";"));
  const csv = [header, ...rows].join("\n");
  const blob = new Blob(["\uFEFF"+csv], { type:"text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

// ─── ONBOARDING ───────────────────────────────────────────────────────────────
const Onboarding = ({ onClose, onGoParams }) => (
  <div style={{ position:"fixed", inset:0, zIndex:700, display:"flex", alignItems:"center", justifyContent:"center", padding:20, background:"rgba(42,33,24,.55)", backdropFilter:"blur(8px)" }}>
    <div className="anim" style={{ background:C.white, borderRadius:28, padding:"52px 56px", width:"100%", maxWidth:560, boxShadow:"0 32px 100px rgba(0,0,0,.2)", textAlign:"center" }}>
      <div style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:64, fontWeight:600, color:C.coral, lineHeight:1, marginBottom:8 }}>Clo'</div>
      <div style={{ fontSize:13, color:C.muted, letterSpacing:".1em", textTransform:"uppercase", marginBottom:32 }}>Votre tableau de bord freelance</div>
      <div style={{ display:"flex", flexDirection:"column", gap:16, marginBottom:36, textAlign:"left" }}>
        {[
          ["⚙️", "Configurez votre activité", "Définissez votre métier, votre objectif mensuel et vos types de prestations dans Paramètres."],
          ["📷", "Ajoutez vos prestations", "Saisissez chaque prestation réalisée pour suivre votre CA en temps réel."],
          ["💾", "Sauvegardez régulièrement", "Téléchargez votre fichier de données avant de quitter — il se recharge en un clic."],
        ].map(([icon, title, desc]) => (
          <div key={title} style={{ display:"flex", gap:16, alignItems:"flex-start", background:C.sand, borderRadius:16, padding:"16px 20px" }}>
            <span style={{ fontSize:24, flexShrink:0 }}>{icon}</span>
            <div>
              <div style={{ fontWeight:600, marginBottom:3 }}>{title}</div>
              <div style={{ fontSize:13, color:C.muted, lineHeight:1.5 }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
        <Btn variant="ghost" onClick={onClose}>Commencer directement</Btn>
        <Btn onClick={() => { onGoParams(); onClose(); }}>⚙️ Configurer d'abord</Btn>
      </div>
    </div>
  </div>
);


const RegionBlocks = ({ prestations }) => {
  const [hovered, setHovered] = useState(null);

  const byRegion = useMemo(() => {
    const m = {};
    prestations.forEach(p => { if (p.region) m[p.region] = (m[p.region]||0)+1; });
    return m;
  }, [prestations]);

  const maxCount = Math.max(1, ...Object.values(byRegion));
  const total = Object.values(byRegion).reduce((a,b)=>a+b,0);

  const ranked = Object.entries(byRegion).sort((a,b)=>b[1]-a[1]);

  // Interpolate from #FBF7F4 (bg) to coral #D9715A
  const regionColor = (region) => {
    const count = byRegion[region] || 0;
    if (count === 0) return C.sand;
    const t = count / maxCount;
    // Interpolate: light sand → coral
    const r = Math.round(245 + (217-245)*t);
    const g = Math.round(237 + (113-237)*t);
    const b = Math.round(229 + (90-229)*t);
    return `rgb(${r},${g},${b})`;
  };

  if (prestations.length === 0) return null;

  const hasRegions = Object.keys(byRegion).length > 0;
  if (!hasRegions) return null;

  return (
    <div style={{ marginTop:20 }}>
      <Card style={{ padding:"22px 24px" }}>
        <h3 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:19, fontWeight:600, marginBottom:4 }}>Classement par région</h3>
        <p style={{ fontSize:12, color:C.muted, marginBottom:18 }}>{Object.keys(byRegion).length} région{Object.keys(byRegion).length>1?"s":" représentée"} · {total} prestation{total>1?"s":""}</p>

        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {ranked.map(([region, count], i) => {
            const pct = Math.round((count/total)*100);
            const barPct = Math.round((count/maxCount)*100);
            return (
              <div key={region}
                onMouseEnter={()=>setHovered(region)}
                onMouseLeave={()=>setHovered(null)}
                style={{ cursor:"default", padding:"6px 10px", borderRadius:10, background:hovered===region?C.coralPale:"transparent", transition:"background .15s" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                  <span style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:18, fontWeight:600, color:C.muted, width:22, textAlign:"right", flexShrink:0 }}>{i+1}</span>
                  <span style={{ flex:1, fontWeight:500, fontSize:14, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{region}</span>
                  <span style={{ fontSize:13, fontWeight:600, color:C.coral, flexShrink:0 }}>{count}</span>
                  <span style={{ fontSize:12, color:C.muted, flexShrink:0, minWidth:32, textAlign:"right" }}>{pct}%</span>
                </div>
                <div style={{ marginLeft:32 }}>
                  <div style={{ background:C.sand, borderRadius:99, height:5 }}>
                    <div style={{ background:regionColor(region), width:`${barPct}%`, height:"100%", borderRadius:99, transition:"width 1s ease" }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
const Dashboard = ({ prestations, frais, settings, onNewPrestation, year }) => {
  const taux = settings.tauxCharges / 100;
  const objectif = settings.objectifMensuel;
  const now = new Date();
  const currentMonth = now.getMonth();

  const pYear = useMemo(() => prestations.filter(p => p.date?.startsWith(String(year))), [prestations, year]);
  const fYear = useMemo(() => frais.filter(f => f.date?.startsWith(String(year))), [frais, year]);

  const monthlyData = useMemo(() => MONTHS.map((m, i) => {
    const ca = pYear.filter(s => s.mois === m).reduce((a,s) => a+s.tarif, 0);
    const fr = fYear.filter(f => f.mois === m).reduce((a,f) => a+(parseFloat(f.montant)||0), 0);
    return { mois:m.slice(0,3), CA:Math.round(ca), Net:Math.round(ca*(1-taux)), Frais:Math.round(fr), Bénéfice:Math.round(ca*(1-taux)-fr), Objectif:objectif, idx:i };
  }), [pYear, fYear, taux, objectif]);

  const totalCA    = pYear.reduce((a,s) => a+s.tarif, 0);
  const totalNet   = totalCA * (1 - taux);
  const totalFrais = fYear.reduce((a,f) => a+(parseFloat(f.montant)||0), 0);
  const benefice   = totalNet - totalFrais;
  const caMonth    = pYear.filter(s => s.mois === MONTHS[currentMonth]).reduce((a,s) => a+s.tarif, 0);
  const netMonth   = caMonth * (1 - taux);

  const moisActifs = MONTHS.filter(m => pYear.some(p => p.mois === m));
  const netMoyenMensuel = moisActifs.length > 0 ? totalNet / moisActifs.length : 0;
  const pctMoyen = objectif > 0 ? Math.min(100, Math.round((netMoyenMensuel/objectif)*100)) : 0;

  const byType = useMemo(() => {
    const m = {};
    pYear.forEach(s => { m[s.type] = (m[s.type]||0)+1; });
    return Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,5);
  }, [pYear]);

  const [range, setRange] = useState("year");
  const chartData = range === "ytd" ? monthlyData.slice(0, currentMonth+1) : monthlyData;

  if (pYear.length === 0) return (
    <div className="anim">
      <PageTitle sub="Bienvenue 👋 Ajoutez vos premières prestations pour voir vos statistiques.">Tableau de bord</PageTitle>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px,1fr))", gap:16, marginBottom:24 }}>
        <KPI label={`CA Total ${year}`} value="—" sub="Aucune prestation" icon="💰" />
        <KPI label="Bénéfice réel" value="—" sub="Après charges et frais" icon="✨" color={C.sage} />
        <KPI label="Prestations" value="0" sub="Enregistrées" icon="📋" color={C.muted} />
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
      <PageTitle sub={`${settings.nomActivite} · ${pYear.length} prestation${pYear.length>1?"s":""} en ${year}`}>Tableau de bord</PageTitle>

      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(185px,1fr))", gap:16, marginBottom:28 }}>
        <KPI label={`CA Total ${year}`}    value={`${totalCA.toLocaleString("fr-FR",{minimumFractionDigits:2})} €`}  sub="Brut toutes prestations"              icon="💰" />
        <KPI label="Salaire net annuel"    value={`${totalNet.toLocaleString("fr-FR",{minimumFractionDigits:2})} €`}  sub={`Après ${settings.tauxCharges}% URSSAF`} icon="✨" color={C.sage} />
        <KPI label="Frais professionnels" value={`${totalFrais.toLocaleString("fr-FR",{minimumFractionDigits:2})} €`} sub="Dépenses de l'année"                   icon="🧾" color={C.yellow} />
        <KPI label="Bénéfice réel net"    value={`${benefice.toLocaleString("fr-FR",{minimumFractionDigits:2})} €`}  sub="Net − frais pro"                       icon="💎" color={benefice>=0?C.green:C.red} />
      </div>

      <ProgressBar
        label="Salaire net mensuel moyen"
        value={netMoyenMensuel}
        objectif={objectif}
        sub="Moyenne calculée sur les mois avec au moins une prestation" />

      {/* Charts */}
      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:20, marginBottom:20 }}>
        <Card>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
            <h3 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:19, fontWeight:600 }}>CA mensuel</h3>
            <div style={{ display:"flex", gap:6 }}>
              {[["year","Année entière"],["ytd","À ce jour"]].map(([r,l]) => (
                <button key={r} onClick={()=>setRange(r)} style={{ padding:"5px 13px", borderRadius:8, border:"none", fontSize:12, fontFamily:"'DM Sans', sans-serif", fontWeight:500, background:range===r?C.coral:C.sand, color:range===r?"white":C.muted }}>{l}</button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} barGap={3} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis dataKey="mois" tick={{ fontSize:12, fill:C.muted }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:12, fill:C.muted }} axisLine={false} tickLine={false} width={50} tickFormatter={v=>v?`${(v/1000).toFixed(0)}k`:"0"} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill:C.coralPale, radius:8 }} />
              <Bar dataKey="CA" radius={[6,6,0,0]} name="CA Brut">
                {chartData.map((e,i) => <Cell key={i} fill={e.idx===currentMonth?C.coralDeep:C.coral} />)}
              </Bar>
              <Bar dataKey="Net"    fill={C.sage}   radius={[6,6,0,0]} name="CA Net" />
              <Bar dataKey="Frais"  fill={C.yellow} radius={[6,6,0,0]} name="Frais" />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display:"flex", gap:20, justifyContent:"center", marginTop:14 }}>
            {[["CA Brut",C.coral],["CA Net",C.sage],["Frais",C.yellow]].map(([l,c]) => (
              <div key={l} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:C.muted }}>
                <div style={{ width:12, height:12, borderRadius:3, background:c }} />{l}
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:19, fontWeight:600, marginBottom:22 }}>Types de prestations</h3>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {byType.length === 0 ? <div style={{ color:C.muted, fontSize:13 }}>—</div> : byType.map(([type, count]) => {
              const p = Math.round((count/pYear.length)*100);
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
          <span style={{ fontSize:12, color:C.muted }}>{pYear.length} au total</span>
        </div>
        <table>
          <thead><tr><th>Date</th><th>Client</th><th>Prestation</th><th>Tarif</th><th>Statut</th></tr></thead>
          <tbody>
            {[...pYear].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,6).map(s => (
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

      {/* Région map + ranking */}
      <RegionBlocks prestations={pYear} />
    </div>
  );
};

// ─── PRESTATIONS ──────────────────────────────────────────────────────────────
const Prestations = ({ prestations, setPrestations, settings, triggerNew, setTriggerNew }) => {
  const [modal, setModal]         = useState(false);
  const [editId, setEditId]       = useState(null);
  const [search, setSearch]       = useState("");
  const [filterMois, setFilterMois] = useState("");
  const [filterType, setFilterType] = useState("");
  const [sortDir, setSortDir]     = useState("desc");
  const [confirmId, setConfirmId] = useState(null);

  const fresh = () => ({ date:"", mois:"", nom:"", type:"", mail:"", tel:"", tarif:"", declare:"Oui", paiement:"Virement", region:settings.regions[0]||"", commentaire:"" });
  const [form, setForm] = useState(fresh());

  if (triggerNew) { setEditId(null); setForm(fresh()); setModal(true); setTriggerNew(false); }

  const upd = (k,v) => setForm(prev => {
    const next = {...prev,[k]:v};
    if (k==="date" && v) { const d=new Date(v); if(!isNaN(d)) next.mois=MONTHS[d.getMonth()]; }
    if (k==="type") { const t=settings.typesPrestation.find(t=>t.nom===v); if(t&&t.tarif>0) next.tarif=t.tarif; }
    return next;
  });

  const openEdit = (s) => { setEditId(s.id); setForm({...s}); setModal(true); };
  const save = () => {
    if (!form.nom.trim()||!form.date) return;
    const entry = {...form, tarif:parseFloat(form.tarif)||0};
    setPrestations(prev => editId ? prev.map(s=>s.id===editId?{...entry,id:editId}:s) : [...prev,{...entry,id:Date.now()}]);
    setModal(false);
  };
  const confirmDel = (id) => setConfirmId(id);
  const doDelete   = () => { setPrestations(prev=>prev.filter(s=>s.id!==confirmId)); setConfirmId(null); };

  const displayed = useMemo(() => {
    const q = search.toLowerCase();
    return prestations.filter(s => {
      if (q && !s.nom.toLowerCase().includes(q) && !s.type.toLowerCase().includes(q)) return false;
      if (filterMois && s.mois!==filterMois) return false;
      if (filterType && s.type!==filterType) return false;
      return true;
    }).sort((a,b) => { const da=new Date(a.date),db=new Date(b.date); return sortDir==="desc"?db-da:da-db; });
  }, [prestations, search, filterMois, filterType, sortDir]);

  const totalDisplayed = displayed.reduce((a,s)=>a+s.tarif,0);
  const uniqueTypes = [...new Set(prestations.map(s=>s.type))];

  const handleCSV = () => exportCSV(displayed, `prestations-${new Date().toLocaleDateString("fr-FR").replace(/\//g,"-")}.csv`, [
    { label:"Date",        key:"date" },
    { label:"Client",      key:"nom" },
    { label:"Type",        key:"type" },
    { label:"Tarif (€)",   key:"tarif" },
    { label:"Déclaré",     key:"declare" },
    { label:"Paiement",    key:"paiement" },
    { label:"Région",      key:"region" },
    { label:"Mois",        key:"mois" },
    { label:"Email",       key:"mail" },
    { label:"Commentaire", key:"commentaire" },
  ]);

  return (
    <div className="anim">
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12, marginBottom:24 }}>
        <PageTitle sub={`${prestations.length} prestation${prestations.length>1?"s":""}${displayed.length!==prestations.length?` · ${displayed.length} affichée${displayed.length>1?"s":""}`:""} · ${totalDisplayed.toLocaleString("fr-FR",{minimumFractionDigits:2})} €`}>
          Mes prestations
        </PageTitle>
        <div style={{ display:"flex", gap:10 }}>
          {prestations.length > 0 && <Btn variant="sage" onClick={handleCSV}>⬇ CSV</Btn>}
          <Btn onClick={()=>{setEditId(null);setForm(fresh());setModal(true);}}>＋ Nouvelle prestation</Btn>
        </div>
      </div>

      <div style={{ display:"flex", gap:10, marginBottom:20, flexWrap:"wrap" }}>
        <input placeholder="🔍  Rechercher…" value={search} onChange={e=>setSearch(e.target.value)} style={{ maxWidth:280 }} />
        <select value={filterMois} onChange={e=>setFilterMois(e.target.value)} style={{ maxWidth:160 }}>
          <option value="">Tous les mois</option>
          {MONTHS.map(m=><option key={m}>{m}</option>)}
        </select>
        {uniqueTypes.length>1 && (
          <select value={filterType} onChange={e=>setFilterType(e.target.value)} style={{ maxWidth:220 }}>
            <option value="">Tous les types</option>
            {uniqueTypes.map(t=><option key={t}>{t}</option>)}
          </select>
        )}
        <button onClick={()=>setSortDir(d=>d==="desc"?"asc":"desc")} style={{ background:C.sand, border:"none", borderRadius:12, padding:"10px 16px", fontSize:13, color:C.muted, fontFamily:"'DM Sans', sans-serif" }}>
          {sortDir==="desc"?"↓ Plus récent":"↑ Plus ancien"}
        </button>
      </div>

      {prestations.length===0 ? (
        <Card><Empty icon="📋" title="Aucune prestation pour l'instant" sub="Ajoutez votre première prestation pour commencer le suivi." action={<Btn onClick={()=>{setEditId(null);setForm(fresh());setModal(true);}}>＋ Ajouter une prestation</Btn>} /></Card>
      ) : (
        <Card noPad>
          <table>
            <thead><tr><th>Date</th><th>Client</th><th>Prestation</th><th>Tarif</th><th>Paiement</th><th>Déclaré</th><th>Région</th><th style={{width:72}}></th></tr></thead>
            <tbody>
              {displayed.length===0 && <tr><td colSpan={8} style={{ textAlign:"center", color:C.muted, padding:40 }}>Aucun résultat</td></tr>}
              {displayed.map(s => (
                <tr key={s.id} style={{ cursor:"pointer" }} onClick={()=>openEdit(s)}>
                  <td style={{ color:C.muted, fontSize:13, whiteSpace:"nowrap" }}>{s.date}</td>
                  <td><div style={{ fontWeight:500 }}>{s.nom}</div>{s.commentaire&&<div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{s.commentaire}</div>}</td>
                  <td><span className="badge badge-sage">{s.type}</span></td>
                  <td style={{ fontWeight:700, color:C.coral, whiteSpace:"nowrap" }}>{s.tarif.toLocaleString("fr-FR")} €</td>
                  <td style={{ color:C.muted, fontSize:13 }}>{s.paiement}</td>
                  <td><span className={`badge ${s.declare==="Oui"?"badge-green":"badge-yellow"}`}>{s.declare==="Oui"?"✓ Déclaré":"⏳ Attente"}</span></td>
                  <td style={{ color:C.muted, fontSize:13 }}>{s.region}</td>
                  <td onClick={e=>{e.stopPropagation();confirmDel(s.id);}}>
                    <Btn variant="danger" size="sm">✕</Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Modal open={modal} onClose={()=>setModal(false)} title={editId?"Modifier la prestation":"Nouvelle prestation"} subtitle="Remplissez les informations de la prestation">
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }}>
          <Field label="Date"><input type="date" value={form.date} onChange={e=>upd("date",e.target.value)} /></Field>
          <Field label="Mois (automatique)"><input value={form.mois} readOnly style={{ background:C.sand, color:C.muted }} /></Field>
          <Field label="Nom du client"><input placeholder="Prénom Nom" value={form.nom} onChange={e=>upd("nom",e.target.value)} /></Field>
          <Field label="Type de prestation">
            <select value={form.type} onChange={e=>upd("type",e.target.value)}>
              <option value="" disabled>Sélectionner…</option>
              {settings.typesPrestation.map(t=><option key={t.nom}>{t.nom}</option>)}
            </select>
          </Field>
          <Field label="Tarif (€)"><input type="number" min={0} step={0.01} value={form.tarif} onChange={e=>upd("tarif",e.target.value)} placeholder="0" /></Field>
          <Field label="CA Déclaré">
            <select value={form.declare} onChange={e=>upd("declare",e.target.value)}><option>Oui</option><option>Non</option></select>
          </Field>
          <Field label="Email"><input type="email" placeholder="client@email.fr" value={form.mail} onChange={e=>upd("mail",e.target.value)} /></Field>
          <Field label="Téléphone"><input placeholder="06 …" value={form.tel} onChange={e=>upd("tel",e.target.value)} /></Field>
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
          <Btn onClick={save}>{editId?"Mettre à jour":"Enregistrer"}</Btn>
        </div>
      </Modal>

      <ConfirmDialog open={!!confirmId} message="Cette prestation sera supprimée définitivement. Cette action est irréversible." onConfirm={doDelete} onCancel={()=>setConfirmId(null)} />
    </div>
  );
};

// ─── FACTURIER ────────────────────────────────────────────────────────────────
const Facturier = ({ prestations, factures, setFactures }) => {
  const getFacture = (id) => factures[id] || { facture:"", acompte:"", total:"Attente", commentaire:"" };
  const upd = (id, field, value) => setFactures(prev => ({...prev,[id]:{...getFacture(id),[field]:value}}));

  const totalRegle   = prestations.filter(p=>getFacture(p.id).total==="Réglé").reduce((a,p)=>a+p.tarif,0);
  const totalAttente = prestations.filter(p=>getFacture(p.id).total==="Attente").reduce((a,p)=>a+p.tarif,0);
  const totalLitige  = prestations.filter(p=>getFacture(p.id).total==="Litige").reduce((a,p)=>a+p.tarif,0);

  const today = new Date();
  const isRelance = (p) => {
    const f = getFacture(p.id);
    if (f.total !== "Attente") return false;
    const d = new Date(p.date);
    return !isNaN(d) && (today - d) / (1000*60*60*24) > 30;
  };
  const relanceCount = prestations.filter(p=>isRelance(p)).length;

  if (prestations.length===0) return (
    <div className="anim">
      <PageTitle sub="Suivi de facturation de vos prestations">Facturier</PageTitle>
      <Card><Empty icon="🧾" title="Aucune prestation à facturer" sub="Ajoutez des prestations dans l'onglet Prestations pour les retrouver ici." /></Card>
    </div>
  );

  return (
    <div className="anim">
      <PageTitle sub={`${prestations.length} prestation${prestations.length>1?"s":""} · Suivi de facturation`}>Facturier</PageTitle>

      {relanceCount > 0 && (
        <div style={{ background:C.yellowPale, border:`1.5px solid ${C.yellow}`, borderRadius:14, padding:"14px 20px", marginBottom:20, display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:20 }}>⚠️</span>
          <div>
            <span style={{ fontWeight:600, color:C.yellow }}>{relanceCount} facture{relanceCount>1?"s":""} en attente depuis plus de 30 jours</span>
            <span style={{ fontSize:13, color:C.muted, marginLeft:8 }}>Ces lignes sont surlignées dans le tableau — pensez à relancer vos clients.</span>
          </div>
        </div>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(180px,1fr))", gap:16, marginBottom:28 }}>
        <KPI label="Réglé"   value={`${totalRegle.toLocaleString("fr-FR",{minimumFractionDigits:2})} €`}   color={C.green}  icon="✅" />
        <KPI label="Attente" value={`${totalAttente.toLocaleString("fr-FR",{minimumFractionDigits:2})} €`} color={C.yellow} icon="⏳" />
        <KPI label="Litige"  value={`${totalLitige.toLocaleString("fr-FR",{minimumFractionDigits:2})} €`}  color={C.red}    icon="⚠️" />
        <KPI label="Total"   value={`${prestations.reduce((a,p)=>a+p.tarif,0).toLocaleString("fr-FR",{minimumFractionDigits:2})} €`} color={C.coral} icon="💰" />
      </div>

      <Card noPad>
        <div style={{ overflowX:"auto" }}>
          <table style={{ minWidth:1000 }}>
            <thead><tr>
              <th>Date</th><th>Client</th><th>Tarif</th>
              <th style={{ color:C.coral }}>N° Facture</th>
              <th style={{ color:C.coral }}>Acompte</th>
              <th style={{ color:C.coral }}>Total</th>
              <th style={{ color:C.coral }}>Commentaire</th>
            </tr></thead>
            <tbody>
              {[...prestations].sort((a,b)=>new Date(b.date)-new Date(a.date)).map(p => {
                const f = getFacture(p.id);
                const relance = isRelance(p);
                return (
                  <tr key={p.id} style={ relance ? { background:C.yellowPale } : {} }>
                    <td style={{ color:C.muted, fontSize:13, whiteSpace:"nowrap" }}>
                      {p.date}
                      {relance && <span className="badge badge-yellow" style={{ marginLeft:8, fontSize:10 }}>Relance</span>}
                    </td>
                    <td style={{ fontWeight:500, color:C.muted }}>{p.nom}</td>
                    <td style={{ fontWeight:700, color:C.muted, whiteSpace:"nowrap" }}>{p.tarif.toLocaleString("fr-FR")} €</td>
                    <td style={{ minWidth:140 }}><input value={f.facture} onChange={e=>upd(p.id,"facture",e.target.value)} placeholder="F-2026-001" style={{ fontSize:13, padding:"7px 10px", borderRadius:8 }} /></td>
                    <td style={{ minWidth:130 }}><input value={f.acompte} onChange={e=>upd(p.id,"acompte",e.target.value)} placeholder="Ex: 150 €" style={{ fontSize:13, padding:"7px 10px", borderRadius:8 }} /></td>
                    <td style={{ minWidth:120 }}>
                      <select value={f.total} onChange={e=>upd(p.id,"total",e.target.value)} style={{ fontSize:13, padding:"7px 10px", borderRadius:8, background:f.total==="Réglé"?C.greenPale:f.total==="Litige"?C.redPale:C.yellowPale, color:f.total==="Réglé"?C.sageDark:f.total==="Litige"?C.red:C.yellow, border:`1.5px solid ${f.total==="Réglé"?C.green:f.total==="Litige"?C.red:C.yellow}`, fontWeight:600 }}>
                        <option value="Attente">Attente</option>
                        <option value="Réglé">Réglé</option>
                        <option value="Litige">Litige</option>
                      </select>
                    </td>
                    <td style={{ minWidth:180 }}><input value={f.commentaire} onChange={e=>upd(p.id,"commentaire",e.target.value)} placeholder="Notes…" style={{ fontSize:13, padding:"7px 10px", borderRadius:8 }} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// ─── FRAIS ────────────────────────────────────────────────────────────────────
const CATEGORIES_FRAIS = [
  { label:"Transport",  items:["Train / Carte abonnement","Navigo / Pass transport","Taxi / VTC","Essence & Péage","Autre transport"] },
  { label:"Équipement", items:["Matériel professionnel","Logiciels / Abonnements","Stockage en ligne / Cloud","Disque dur / Sauvegarde","Téléphone professionnel","Autre équipement"] },
  { label:"Locaux",     items:["Loyer bureau / Coworking","Électricité / Internet","Logement déplacement","Autre locaux"] },
  { label:"Assurances", items:["RC Professionnelle","Mutuelle","Prévoyance","Autre assurance"] },
  { label:"Commercial", items:["Site internet","Marketing / Publicité","Frais bancaires","Frais de bouche / Repas client","Autre commercial"] },
  { label:"Formation",  items:["Formation / Cours","Livres / Documentation","Conférence / Salon","Autre formation"] },
  { label:"Autre",      items:["Autre frais"] },
];

const defaultFraisEntry = () => ({ id:Date.now()+Math.random(), date:"", mois:"", categorie:"", libelle:"", montant:"", paiement:"Virement", commentaire:"" });

const Frais = ({ frais, setFrais }) => {
  const [modal, setModal]         = useState(false);
  const [editId, setEditId]       = useState(null);
  const [filterMois, setFilterMois] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [form, setForm]           = useState(defaultFraisEntry());
  const [confirmId, setConfirmId] = useState(null);
  const [bulkModal, setBulkModal] = useState(false);
  const [bulkForm, setBulkForm]   = useState({ categorie:"", libelle:"", montant:"", paiement:"Prélèvement", commentaire:"", jour:"1" });
  const [bulkMois, setBulkMois]   = useState(new Set(MONTHS));

  const upd = (k,v) => setForm(prev => { const next={...prev,[k]:v}; if(k==="date"&&v){const d=new Date(v);if(!isNaN(d))next.mois=MONTHS[d.getMonth()];}; return next; });
  const openNew  = () => { setEditId(null); setForm(defaultFraisEntry()); setModal(true); };
  const openEdit = (f) => { setEditId(f.id); setForm({...f}); setModal(true); };
  const save = () => {
    if (!form.libelle||!form.date) return;
    const entry = {...form, montant:parseFloat(form.montant)||0};
    setFrais(prev => editId ? prev.map(f=>f.id===editId?{...entry,id:editId}:f) : [...prev,{...entry,id:Date.now()}]);
    setModal(false);
  };
  const doDelete = () => { setFrais(prev=>prev.filter(f=>f.id!==confirmId)); setConfirmId(null); };

  const saveBulk = () => {
    if (!bulkForm.libelle || !bulkForm.montant) return;
    const yr = new Date().getFullYear();
    const jour = Math.max(1, Math.min(28, parseInt(bulkForm.jour)||1));
    const entries = [...bulkMois].map(m => {
      const mIdx = MONTHS.indexOf(m);
      const dateStr = `${yr}-${String(mIdx+1).padStart(2,"0")}-${String(jour).padStart(2,"0")}`;
      return { ...bulkForm, id:Date.now()+mIdx+Math.random(), date:dateStr, mois:m, montant:parseFloat(bulkForm.montant)||0 };
    });
    setFrais(prev => [...prev, ...entries]);
    setBulkModal(false);
    setBulkForm({ categorie:"", libelle:"", montant:"", paiement:"Prélèvement", commentaire:"", jour:"1" });
    setBulkMois(new Set(MONTHS));
  };

  const displayed = frais.filter(f=>{
    if (filterMois&&f.mois!==filterMois) return false;
    if (filterCat&&f.categorie!==filterCat) return false;
    return true;
  }).sort((a,b)=>new Date(b.date)-new Date(a.date));

  const totalDisplayed = displayed.reduce((a,f)=>a+(parseFloat(f.montant)||0),0);
  const totalAnnuel    = frais.reduce((a,f)=>a+(parseFloat(f.montant)||0),0);
  const currentMonthName = MONTHS[new Date().getMonth()];
  const totalMoisCourant = frais.filter(f=>f.mois===currentMonthName).reduce((a,f)=>a+(parseFloat(f.montant)||0),0);
  const byCategorie = CATEGORIES_FRAIS.map(c=>({ label:c.label, total:frais.filter(f=>c.items.includes(f.libelle)).reduce((a,f)=>a+(parseFloat(f.montant)||0),0) })).filter(c=>c.total>0).sort((a,b)=>b.total-a.total);

  const handleCSV = () => exportCSV(displayed, `frais-${new Date().toLocaleDateString("fr-FR").replace(/\//g,"-")}.csv`, [
    { label:"Date",        key:"date" },
    { label:"Catégorie",   key:"categorie" },
    { label:"Libellé",     key:"libelle" },
    { label:"Montant (€)", key:"montant" },
    { label:"Paiement",    key:"paiement" },
    { label:"Mois",        key:"mois" },
    { label:"Commentaire", key:"commentaire" },
  ]);

  return (
    <div className="anim">
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12, marginBottom:24 }}>
        <PageTitle sub={`${frais.length} dépense${frais.length>1?"s":""} · Total annuel : ${totalAnnuel.toLocaleString("fr-FR",{minimumFractionDigits:2})} €`}>Mes frais</PageTitle>
        <div style={{ display:"flex", gap:10 }}>
          {frais.length>0 && <Btn variant="sage" onClick={handleCSV}>⬇ CSV</Btn>}
          <Btn variant="soft" onClick={()=>setBulkModal(true)}>↺ Récurrents</Btn>
          <Btn onClick={openNew}>＋ Ajouter un frais</Btn>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(180px,1fr))", gap:16, marginBottom:28 }}>
        <KPI label="Total annuel"      value={`${totalAnnuel.toLocaleString("fr-FR",{minimumFractionDigits:2})} €`}     sub="Toutes dépenses"   icon="📋" />
        <KPI label={currentMonthName}  value={`${totalMoisCourant.toLocaleString("fr-FR",{minimumFractionDigits:2})} €`} sub="Mois en cours"     icon="📅" color={C.coralLight} />
        <KPI label="Dépenses"          value={frais.length}                                                               sub="Enregistrées"      icon="🧾" color={C.muted} />
        <KPI label="Moyenne mensuelle" value={`${(totalAnnuel/Math.max(1,new Set(frais.map(f=>f.mois)).size)).toLocaleString("fr-FR",{maximumFractionDigits:0})} €`} sub="Par mois actif" icon="📊" color={C.sage} />
      </div>

      {byCategorie.length>0 && (
        <Card style={{ marginBottom:24, padding:"22px 28px" }}>
          <h3 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:18, fontWeight:600, marginBottom:18 }}>Répartition par catégorie</h3>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px,1fr))", gap:14 }}>
            {byCategorie.map(c => {
              const pct = totalAnnuel>0?Math.round((c.total/totalAnnuel)*100):0;
              return (
                <div key={c.label}>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:5 }}>
                    <span style={{ fontWeight:500 }}>{c.label}</span>
                    <span style={{ color:C.muted }}>{c.total.toLocaleString("fr-FR")} € · {pct}%</span>
                  </div>
                  <div style={{ background:C.sand, borderRadius:99, height:6 }}>
                    <div style={{ background:C.coral, width:`${pct}%`, height:"100%", borderRadius:99, transition:"width 1s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap" }}>
        <select value={filterMois} onChange={e=>setFilterMois(e.target.value)} style={{ maxWidth:160 }}>
          <option value="">Tous les mois</option>
          {MONTHS.map(m=><option key={m}>{m}</option>)}
        </select>
        <select value={filterCat} onChange={e=>setFilterCat(e.target.value)} style={{ maxWidth:200 }}>
          <option value="">Toutes les catégories</option>
          {CATEGORIES_FRAIS.map(c=><option key={c.label}>{c.label}</option>)}
        </select>
        {(filterMois||filterCat) && <span style={{ fontSize:13, color:C.muted, alignSelf:"center" }}>{displayed.length} résultat{displayed.length>1?"s":""} · {totalDisplayed.toLocaleString("fr-FR",{minimumFractionDigits:2})} €</span>}
      </div>

      {frais.length===0 ? (
        <Card><Empty icon="🧾" title="Aucun frais enregistré" sub="Ajoutez vos dépenses professionnelles pour suivre leur évolution." action={<Btn onClick={openNew}>＋ Ajouter un frais</Btn>} /></Card>
      ) : (
        <Card noPad>
          <table>
            <thead><tr><th>Date</th><th>Libellé</th><th>Catégorie</th><th>Montant</th><th>Paiement</th><th>Commentaire</th><th style={{width:72}}></th></tr></thead>
            <tbody>
              {displayed.length===0 && <tr><td colSpan={7} style={{ textAlign:"center", color:C.muted, padding:40 }}>Aucun résultat</td></tr>}
              {displayed.map(f => (
                <tr key={f.id} style={{ cursor:"pointer" }} onClick={()=>openEdit(f)}>
                  <td style={{ color:C.muted, fontSize:13, whiteSpace:"nowrap" }}>{f.date}</td>
                  <td style={{ fontWeight:500 }}>{f.libelle}</td>
                  <td><span className="badge badge-sage">{f.categorie}</span></td>
                  <td style={{ fontWeight:700, color:C.red, whiteSpace:"nowrap" }}>−{parseFloat(f.montant||0).toLocaleString("fr-FR")} €</td>
                  <td style={{ color:C.muted, fontSize:13 }}>{f.paiement}</td>
                  <td style={{ color:C.muted, fontSize:12, maxWidth:160, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{f.commentaire}</td>
                  <td onClick={e=>{e.stopPropagation();setConfirmId(f.id);}}><Btn variant="danger" size="sm">✕</Btn></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Modal open={modal} onClose={()=>setModal(false)} title={editId?"Modifier le frais":"Nouveau frais"} subtitle="Renseignez les informations de la dépense">
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }}>
          <Field label="Date"><input type="date" value={form.date} onChange={e=>upd("date",e.target.value)} /></Field>
          <Field label="Mois (automatique)"><input value={form.mois} readOnly style={{ background:C.sand, color:C.muted }} /></Field>
          <Field label="Montant (€)"><input type="number" min={0} step={0.01} value={form.montant} onChange={e=>upd("montant",e.target.value)} placeholder="0" /></Field>
          <Field label="Type de frais">
            <select value={form.categorie} onChange={e=>setForm(prev=>({...prev,categorie:e.target.value,libelle:""}))}>
              <option value="" disabled>Sélectionner…</option>
              {CATEGORIES_FRAIS.map(c=><option key={c.label}>{c.label}</option>)}
            </select>
          </Field>
          <Field label="Libellé" style={{ opacity:form.categorie?1:0.5 }}>
            <select value={form.libelle} onChange={e=>upd("libelle",e.target.value)} disabled={!form.categorie}>
              <option value="" disabled>{form.categorie?"Sélectionner…":"Choisir un type d'abord"}</option>
              {form.categorie && CATEGORIES_FRAIS.find(c=>c.label===form.categorie)?.items.map(i=><option key={i}>{i}</option>)}
            </select>
          </Field>
          <Field label="Mode de paiement">
            <select value={form.paiement} onChange={e=>upd("paiement",e.target.value)}>
              {["Virement","Chèque","Espèces","Carte bancaire","Prélèvement","Autre"].map(p=><option key={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Commentaire" full>
            <textarea rows={2} value={form.commentaire} onChange={e=>upd("commentaire",e.target.value)} placeholder="Détails, fournisseur, numéro de facture…" style={{ resize:"vertical" }} />
          </Field>
        </div>
        <div style={{ display:"flex", justifyContent:"flex-end", gap:10, marginTop:28 }}>
          <Btn variant="ghost" onClick={()=>setModal(false)}>Annuler</Btn>
          <Btn onClick={save}>{editId?"Mettre à jour":"Enregistrer"}</Btn>
        </div>
      </Modal>

      <ConfirmDialog open={!!confirmId} message="Ce frais sera supprimé définitivement. Cette action est irréversible." onConfirm={doDelete} onCancel={()=>setConfirmId(null)} />

      {/* ── Bulk / récurrents modal ── */}
      <Modal open={bulkModal} onClose={()=>setBulkModal(false)} title="Frais récurrents" subtitle="Créez plusieurs entrées d'un coup — idéal pour les abonnements mensuels">
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16, marginBottom:24 }}>
          <Field label="Type de frais">
            <select value={bulkForm.categorie} onChange={e=>setBulkForm(p=>({...p,categorie:e.target.value,libelle:""}))}>
              <option value="" disabled>Sélectionner…</option>
              {CATEGORIES_FRAIS.map(c=><option key={c.label}>{c.label}</option>)}
            </select>
          </Field>
          <Field label="Libellé" style={{ opacity:bulkForm.categorie?1:0.5 }}>
            <select value={bulkForm.libelle} onChange={e=>setBulkForm(p=>({...p,libelle:e.target.value}))} disabled={!bulkForm.categorie}>
              <option value="" disabled>{bulkForm.categorie?"Sélectionner…":"Choisir un type d'abord"}</option>
              {bulkForm.categorie && CATEGORIES_FRAIS.find(c=>c.label===bulkForm.categorie)?.items.map(i=><option key={i}>{i}</option>)}
            </select>
          </Field>
          <Field label="Montant mensuel (€)">
            <input type="number" min={0} step={0.01} value={bulkForm.montant} onChange={e=>setBulkForm(p=>({...p,montant:e.target.value}))} placeholder="0" />
          </Field>
          <Field label="Mode de paiement">
            <select value={bulkForm.paiement} onChange={e=>setBulkForm(p=>({...p,paiement:e.target.value}))}>
              {["Prélèvement","Virement","Chèque","Espèces","Carte bancaire","Autre"].map(x=><option key={x}>{x}</option>)}
            </select>
          </Field>
          <Field label="Jour du mois">
            <input type="number" min={1} max={28} value={bulkForm.jour} onChange={e=>setBulkForm(p=>({...p,jour:e.target.value}))} placeholder="1" />
          </Field>
          <Field label="Commentaire">
            <input value={bulkForm.commentaire} onChange={e=>setBulkForm(p=>({...p,commentaire:e.target.value}))} placeholder="Ex: Netflix, Adobe…" />
          </Field>
        </div>

        {/* Month picker */}
        <div style={{ marginBottom:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
            <label style={{ fontSize:11, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:".07em" }}>Mois à créer</label>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={()=>setBulkMois(new Set(MONTHS))} style={{ fontSize:12, color:C.coral, background:"none", border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Tout sélectionner</button>
              <button onClick={()=>setBulkMois(new Set())} style={{ fontSize:12, color:C.muted, background:"none", border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Effacer</button>
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:8 }}>
            {MONTHS.map(m => {
              const on = bulkMois.has(m);
              return (
                <button key={m} onClick={()=>setBulkMois(prev=>{ const s=new Set(prev); on?s.delete(m):s.add(m); return s; })}
                  style={{ padding:"8px 4px", borderRadius:10, border:`1.5px solid ${on?C.coral:C.border}`, background:on?C.coralPale:"transparent", color:on?C.coralDeep:C.muted, fontSize:12, fontFamily:"'DM Sans',sans-serif", fontWeight:on?600:400, cursor:"pointer" }}>
                  {m.slice(0,3)}
                </button>
              );
            })}
          </div>
        </div>

        {bulkMois.size > 0 && bulkForm.montant && (
          <div style={{ background:C.sand, borderRadius:12, padding:"12px 16px", marginBottom:20, fontSize:13, color:C.muted }}>
            Cela créera <strong style={{ color:C.coral }}>{bulkMois.size} entrée{bulkMois.size>1?"s":""}</strong> de <strong>{parseFloat(bulkForm.montant||0).toLocaleString("fr-FR")} € chacune</strong> — total : <strong>{(bulkMois.size*(parseFloat(bulkForm.montant||0))).toLocaleString("fr-FR")} €</strong>
          </div>
        )}

        <div style={{ display:"flex", justifyContent:"flex-end", gap:10 }}>
          <Btn variant="ghost" onClick={()=>setBulkModal(false)}>Annuler</Btn>
          <Btn onClick={saveBulk} style={{ opacity:(!bulkForm.libelle||!bulkForm.montant||bulkMois.size===0)?0.5:1 }}>
            Créer {bulkMois.size} entrée{bulkMois.size>1?"s":""}
          </Btn>
        </div>
      </Modal>
    </div>
  );
};

// ─── BILAN ────────────────────────────────────────────────────────────────────
const Bilan = ({ prestations, frais, factures, settings, year }) => {
  const taux = settings.tauxCharges / 100;
  const pYear = prestations.filter(p => p.date?.startsWith(String(year)));
  const fYear = frais.filter(f => f.date?.startsWith(String(year)));

  const totalCA      = pYear.reduce((a,p)=>a+p.tarif,0);
  const totalURSSAF  = totalCA * taux;
  const totalNetURSSAF = totalCA - totalURSSAF;
  const totalFrais   = fYear.reduce((a,f)=>a+(parseFloat(f.montant)||0),0);
  const benefice     = totalNetURSSAF - totalFrais;

  const getFacture = (id) => factures[id] || { total:"Attente" };
  const totalRegle   = pYear.filter(p=>getFacture(p.id).total==="Réglé").reduce((a,p)=>a+p.tarif,0);
  const totalAttente = pYear.filter(p=>getFacture(p.id).total==="Attente").reduce((a,p)=>a+p.tarif,0);
  const totalLitige  = pYear.filter(p=>getFacture(p.id).total==="Litige").reduce((a,p)=>a+p.tarif,0);

  const moisActifs = MONTHS.filter(m=>pYear.some(p=>p.mois===m));
  const moyenneNet = moisActifs.length>0 ? totalNetURSSAF/moisActifs.length : 0;

  const fraisParCategorie = CATEGORIES_FRAIS.map(c=>({ label:c.label, total:fYear.filter(f=>c.items.includes(f.libelle)).reduce((a,f)=>a+(parseFloat(f.montant)||0),0) })).filter(c=>c.total>0).sort((a,b)=>b.total-a.total);

  const Row = ({ label, value, color=C.text, bold, indent, border }) => (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0", borderBottom:border?`1px solid ${C.border}`:undefined, borderTop:border==="top"?`2px solid ${C.border}`:undefined }}>
      <span style={{ fontSize:14, color:indent?C.muted:C.text, fontWeight:bold?600:400, paddingLeft:indent?16:0 }}>{label}</span>
      <span style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:bold?22:18, fontWeight:bold?600:400, color }}>{typeof value==="number"?`${value.toLocaleString("fr-FR",{minimumFractionDigits:2})} €`:value}</span>
    </div>
  );

  return (
    <div className="anim">
      <PageTitle sub={`Synthèse financière ${year} · Données exportables pour votre comptable`}>Bilan {year}</PageTitle>

      {/* Summary KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(185px,1fr))", gap:16, marginBottom:28 }}>
        <KPI label="CA Brut"          value={`${totalCA.toLocaleString("fr-FR",{minimumFractionDigits:2})} €`}          sub="Avant charges" icon="💰" />
        <KPI label="Charges URSSAF"   value={`${totalURSSAF.toLocaleString("fr-FR",{minimumFractionDigits:2})} €`}      sub={`${settings.tauxCharges}% du CA`} icon="🏛️" color={C.yellow} />
        <KPI label="Frais pro"        value={`${totalFrais.toLocaleString("fr-FR",{minimumFractionDigits:2})} €`}        sub="Dépenses déductibles" icon="🧾" color={C.muted} />
        <KPI label="Bénéfice réel net" value={`${benefice.toLocaleString("fr-FR",{minimumFractionDigits:2})} €`}        sub="Net après tout" icon="💎" color={benefice>=0?C.green:C.red} />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
        {/* Compte de résultat */}
        <Card>
          <h3 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:20, fontWeight:600, marginBottom:20 }}>Compte de résultat</h3>
          <Row label="Chiffre d'affaires brut"         value={totalCA}           bold border="bottom" />
          <Row label={`Charges URSSAF (${settings.tauxCharges}%)`} value={-totalURSSAF} color={C.red} indent border="bottom" />
          <Row label="Salaire net (avant frais)"        value={totalNetURSSAF}    color={C.sage} bold border="bottom" />
          <Row label="Frais professionnels"             value={-totalFrais}       color={C.red} indent border="bottom" />
          <div style={{ marginTop:8 }}>
            <Row label="🏆 Bénéfice réel net"           value={benefice}          color={benefice>=0?C.green:C.red} bold border="top" />
          </div>
          <div style={{ marginTop:16, padding:"12px 16px", background:C.sand, borderRadius:12 }}>
            <div style={{ fontSize:12, color:C.muted, marginBottom:4 }}>Moyenne mensuelle nette</div>
            <div style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:22, fontWeight:600, color:C.coral }}>
              {moyenneNet.toLocaleString("fr-FR",{maximumFractionDigits:2})} €
            </div>
            <div style={{ fontSize:11, color:C.muted }}>sur {moisActifs.length} mois actif{moisActifs.length>1?"s":""}</div>
          </div>
        </Card>

        {/* Facturation & Frais */}
        <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
          <Card>
            <h3 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:20, fontWeight:600, marginBottom:20 }}>État de facturation</h3>
            <Row label="✅ Factures réglées"  value={totalRegle}   color={C.green}  border="bottom" />
            <Row label="⏳ En attente"         value={totalAttente} color={C.yellow} border="bottom" />
            <Row label="⚠️ En litige"          value={totalLitige}  color={C.red}    border="bottom" />
            <Row label="Total facturé"         value={totalCA}      bold />
          </Card>

          {fraisParCategorie.length>0 && (
            <Card>
              <h3 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:20, fontWeight:600, marginBottom:20 }}>Frais par catégorie</h3>
              {fraisParCategorie.map(c => (
                <div key={c.label} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${C.border}` }}>
                  <span style={{ fontSize:13, color:C.muted }}>{c.label}</span>
                  <span style={{ fontWeight:600, fontSize:14 }}>{c.total.toLocaleString("fr-FR",{minimumFractionDigits:2})} €</span>
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>

      {/* Mensuel detail */}
      <Card noPad>
        <div style={{ padding:"18px 24px", borderBottom:`1px solid ${C.border}` }}>
          <h3 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:19, fontWeight:600 }}>Détail mensuel {year}</h3>
        </div>
        <table>
          <thead><tr><th>Mois</th><th>CA Brut</th><th>Charges URSSAF</th><th>Frais</th><th>Bénéfice net</th><th>Prestations</th></tr></thead>
          <tbody>
            {MONTHS.map(m => {
              const ca  = pYear.filter(p=>p.mois===m).reduce((a,p)=>a+p.tarif,0);
              const fr  = fYear.filter(f=>f.mois===m).reduce((a,f)=>a+(parseFloat(f.montant)||0),0);
              const net = ca*(1-taux)-fr;
              const nb  = pYear.filter(p=>p.mois===m).length;
              if (ca===0&&fr===0) return null;
              return (
                <tr key={m}>
                  <td style={{ fontWeight:500 }}>{m}</td>
                  <td style={{ fontWeight:600, color:C.coral }}>{ca.toLocaleString("fr-FR",{minimumFractionDigits:2})} €</td>
                  <td style={{ color:C.yellow }}>−{(ca*taux).toLocaleString("fr-FR",{minimumFractionDigits:2})} €</td>
                  <td style={{ color:C.red }}>{fr>0?`−${fr.toLocaleString("fr-FR",{minimumFractionDigits:2})} €`:"—"}</td>
                  <td style={{ fontWeight:700, color:net>=0?C.green:C.red }}>{net.toLocaleString("fr-FR",{minimumFractionDigits:2})} €</td>
                  <td style={{ color:C.muted }}>{nb} prestation{nb>1?"s":""}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

// ─── PARAMÈTRES ───────────────────────────────────────────────────────────────
const Parametres = ({ settings, setSettings }) => {
  const upd = (k,v) => setSettings(p=>({...p,[k]:v}));
  const updType = (i,field,val) => setSettings(p=>({...p,typesPrestation:p.typesPrestation.map((t,j)=>j===i?{...t,[field]:field==="tarif"?parseFloat(val)||0:val}:t)}));
  const addType = () => setSettings(p=>({...p,typesPrestation:[...p.typesPrestation,{nom:"",tarif:0}]}));
  const delType = (i) => setSettings(p=>({...p,typesPrestation:p.typesPrestation.filter((_,j)=>j!==i)}));
  const brut = settings.objectifMensuel/(1-settings.tauxCharges/100);

  return (
    <div className="anim">
      <PageTitle sub="Personnalisez Clo' selon votre activité et votre métier">Paramètres</PageTitle>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
        <Card>
          <h3 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:20, fontWeight:600, marginBottom:22 }}>Informations générales</h3>
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <Field label="Nom de l'activité"><input value={settings.nomActivite} onChange={e=>upd("nomActivite",e.target.value)} /></Field>
            <Field label="Métier / Secteur"><input value={settings.metier} onChange={e=>upd("metier",e.target.value)} placeholder="Ex: Photographe, Graphiste…" /></Field>
          </div>
        </Card>
        <Card>
          <h3 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:20, fontWeight:600, marginBottom:22 }}>Objectifs & charges</h3>
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <Field label="Objectif net mensuel (€)"><input type="number" value={settings.objectifMensuel} onChange={e=>upd("objectifMensuel",parseFloat(e.target.value)||0)} /></Field>
            <Field label="Taux de charges / URSSAF (%)"><input type="number" step={0.1} value={settings.tauxCharges} onChange={e=>upd("tauxCharges",parseFloat(e.target.value)||0)} /></Field>
            <div style={{ background:C.sand, borderRadius:14, padding:"14px 18px" }}>
              <div style={{ fontSize:11, color:C.muted, fontWeight:600, textTransform:"uppercase", letterSpacing:".07em", marginBottom:10 }}>Calcul automatique</div>
              {[["CA brut nécessaire / mois",`${brut.toLocaleString("fr-FR",{maximumFractionDigits:2})} €`],["CA brut nécessaire / an",`${(brut*12).toLocaleString("fr-FR",{maximumFractionDigits:2})} €`]].map(([l,v]) => (
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
          {settings.typesPrestation.map((t,i) => (
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

// ─── DATA MODAL ───────────────────────────────────────────────────────────────
const DataModal = ({ open, onClose, onSave, onLoad, hasData }) => {
  if (!open) return null;
  const handleFile = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.prestations && data.settings) { onLoad(data); onClose(); }
        else alert("Fichier invalide — assurez-vous d'utiliser un fichier exporté depuis Clo'.");
      } catch { alert("Impossible de lire le fichier. Vérifiez qu'il s'agit d'un fichier JSON valide."); }
    };
    reader.readAsText(file);
  };
  return (
    <div style={{ position:"fixed", inset:0, zIndex:600, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div onClick={onClose} style={{ position:"absolute", inset:0, background:"rgba(42,33,24,.42)", backdropFilter:"blur(6px)" }} />
      <div className="anim" style={{ position:"relative", background:C.white, borderRadius:24, padding:"36px 40px", width:"100%", maxWidth:460, boxShadow:"0 24px 80px rgba(0,0,0,.18)" }}>
        <button onClick={onClose} style={{ position:"absolute", top:18, right:18, background:C.sand, border:"none", borderRadius:99, width:32, height:32, fontSize:18, color:C.muted, display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
        <h2 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:26, fontWeight:600, marginBottom:6 }}>Mes données</h2>
        <p style={{ fontSize:13, color:C.muted, marginBottom:28, lineHeight:1.6 }}>Vos données restent <strong>uniquement sur votre ordinateur</strong>. Sauvegardez avant de quitter, rechargez à la prochaine visite.</p>
        <div style={{ background:C.sand, borderRadius:16, padding:"20px 22px", marginBottom:12 }}>
          <div style={{ fontWeight:600, fontSize:15, marginBottom:3 }}>💾  Sauvegarder</div>
          <div style={{ fontSize:12, color:C.muted, marginBottom:12 }}>Télécharge un fichier <code style={{ background:C.sandDark, padding:"1px 5px", borderRadius:4 }}>.json</code> avec toutes vos données.</div>
          <Btn onClick={onSave} style={{ width:"100%", justifyContent:"center" }} variant={hasData?"primary":"ghost"}>Télécharger mes données</Btn>
        </div>
        <div style={{ background:C.sagePale, borderRadius:16, padding:"20px 22px" }}>
          <div style={{ fontWeight:600, fontSize:15, marginBottom:3 }}>📂  Charger</div>
          <div style={{ fontSize:12, color:C.muted, marginBottom:12 }}>Sélectionnez un fichier précédemment sauvegardé.{hasData&&<span style={{ color:C.red }}> Attention : remplace les données actuelles.</span>}</div>
          <label style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"10px 22px", borderRadius:12, border:`1.5px solid ${C.sage}`, background:C.white, color:C.sageDark, fontWeight:500, fontSize:14, cursor:"pointer" }}>
            Choisir un fichier
            <input type="file" accept=".json" onChange={handleFile} style={{ display:"none" }} />
          </label>
        </div>
      </div>
    </div>
  );
};

// ─── NAV ──────────────────────────────────────────────────────────────────────
const NAVS = [
  { id:"dashboard",   label:"Tableau de bord", icon:"◈" },
  { id:"prestations", label:"Prestations",     icon:"◉" },
  { id:"facturier",   label:"Facturier",       icon:"◇" },
  { id:"frais",       label:"Frais",           icon:"◎" },
  { id:"bilan",       label:"Bilan",           icon:"◐" },
  { id:"params",      label:"Paramètres",      icon:"◌" },
];

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView]               = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settings, setSettings]       = useState(defaultSettings);
  const [prestations, setPrestations] = useState([]);
  const [factures, setFactures]       = useState({});
  const [frais, setFrais]             = useState([]);
  const [triggerNew, setTriggerNew]   = useState(false);
  const [dataModal, setDataModal]     = useState(false);
  const [savedFlash, setSavedFlash]   = useState(false);
  const [hasUnsaved, setHasUnsaved]   = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [globalSearch, setGlobalSearch]     = useState("");
  const [year, setYear]               = useState(new Date().getFullYear());

  const totalCA  = prestations.filter(p=>p.date?.startsWith(String(year))).reduce((a,s)=>a+s.tarif,0);
  const totalNet = totalCA * (1 - settings.tauxCharges/100);
  const totalFraisYear = frais.filter(f=>f.date?.startsWith(String(year))).reduce((a,f)=>a+(parseFloat(f.montant)||0),0);

  // Track unsaved changes
  useEffect(() => { setHasUnsaved(true); }, [prestations, frais, factures, settings]);

  // Available years from data
  const availableYears = useMemo(() => {
    const years = new Set([new Date().getFullYear()]);
    [...prestations, ...frais].forEach(x => { if (x.date) years.add(parseInt(x.date.slice(0,4))); });
    return [...years].sort((a,b)=>b-a);
  }, [prestations, frais]);

  // Global search results
  const searchResults = useMemo(() => {
    if (!globalSearch.trim()) return null;
    const q = globalSearch.toLowerCase();
    const p = prestations.filter(s => s.nom?.toLowerCase().includes(q)||s.type?.toLowerCase().includes(q)||s.commentaire?.toLowerCase().includes(q));
    const f = frais.filter(x => x.libelle?.toLowerCase().includes(q)||x.commentaire?.toLowerCase().includes(q)||x.categorie?.toLowerCase().includes(q));
    return { prestations:p, frais:f, total:p.length+f.length };
  }, [globalSearch, prestations, frais]);

  const goNewPrestation = () => { setView("prestations"); setTriggerNew(true); };

  const handleSave = () => {
    const data = JSON.stringify({ version:2, exportedAt:new Date().toISOString(), settings, prestations, factures, frais }, null, 2);
    const blob = new Blob([data], { type:"application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const date = new Date().toLocaleDateString("fr-FR").replace(/\//g,"-");
    a.href=url; a.download=`clo-données-${date}.json`; a.click();
    URL.revokeObjectURL(url);
    setSavedFlash(true); setHasUnsaved(false);
    setTimeout(()=>setSavedFlash(false),2500);
  };

  const handleLoad = ({ prestations:p, settings:s, factures:f, frais:fr }) => {
    setPrestations(p||[]); setSettings(s||defaultSettings);
    setFactures(f||{}); setFrais(fr||[]);
    setHasUnsaved(false);
  };

  return (
    <>
      <style>{G}</style>
      {showOnboarding && prestations.length===0 && (
        <Onboarding onClose={()=>setShowOnboarding(false)} onGoParams={()=>setView("params")} />
      )}
      {/* ── Mobile top bar ── */}
      <div className="mob-topbar" style={{ display:"none", position:"fixed", top:0, left:0, right:0, zIndex:300, background:C.white, borderBottom:`1px solid ${C.border}`, padding:"0 16px", height:52, alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:32, fontWeight:600, color:C.coral, lineHeight:1 }}>Clo'</div>
        <button onClick={()=>setSidebarOpen(true)} style={{ background:"none", border:"none", cursor:"pointer", padding:8, display:"flex", flexDirection:"column", gap:5 }}>
          <div style={{ width:22, height:2, background:C.text, borderRadius:2 }} />
          <div style={{ width:22, height:2, background:C.text, borderRadius:2 }} />
          <div style={{ width:16, height:2, background:C.text, borderRadius:2 }} />
        </button>
      </div>

      {/* ── Mobile overlay ── */}
      <div className="mob-overlay" onClick={()=>setSidebarOpen(false)} style={{ display:"none", position:"fixed", inset:0, background:"rgba(42,33,24,.35)", zIndex:390, backdropFilter:"blur(2px)" }} />

      <div style={{ display:"flex", minHeight:"100vh" }}>

        {/* ── Sidebar ── */}
        <aside className={`sidebar-mobile${sidebarOpen?" open":""}`} style={{ width:224, background:C.white, borderRight:`1px solid ${C.border}`, display:"flex", flexDirection:"column", position:"sticky", top:0, height:"100vh", flexShrink:0 }}>
          <button className="mob-show" onClick={()=>setSidebarOpen(false)} style={{ display:"none", position:"absolute", top:12, right:12, background:C.sand, border:"none", borderRadius:99, width:28, height:28, fontSize:16, color:C.muted, alignItems:"center", justifyContent:"center", cursor:"pointer", zIndex:10 }}>×</button>
          {/* Brand */}
          <div style={{ padding:"28px 24px 20px", borderBottom:`1px solid ${C.border}` }}>
            <div style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:42, fontWeight:600, color:C.coral, lineHeight:1, letterSpacing:"-0.03em" }}>Clo'</div>
            <div style={{ fontSize:11, color:C.muted, marginTop:6, letterSpacing:".09em", textTransform:"uppercase" }}>{settings.metier}</div>
          </div>

          {/* Global search */}
          <div style={{ padding:"12px 12px 0" }}>
            <div style={{ position:"relative" }}>
              <input
                placeholder="🔍  Rechercher…"
                value={globalSearch}
                onChange={e=>setGlobalSearch(e.target.value)}
                style={{ fontSize:13, padding:"8px 12px", borderRadius:10 }}
              />
              {globalSearch && (
                <button onClick={()=>setGlobalSearch("")} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:C.muted, fontSize:16 }}>×</button>
              )}
            </div>
            {searchResults && (
              <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:12, marginTop:6, overflow:"hidden", boxShadow:"0 4px 20px rgba(0,0,0,.08)", maxHeight:280, overflowY:"auto" }}>
                {searchResults.total===0 ? (
                  <div style={{ padding:"16px", fontSize:13, color:C.muted, textAlign:"center" }}>Aucun résultat</div>
                ) : (
                  <>
                    {searchResults.prestations.length>0 && (
                      <>
                        <div style={{ padding:"8px 14px", fontSize:11, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:".07em", background:C.sand }}>Prestations ({searchResults.prestations.length})</div>
                        {searchResults.prestations.slice(0,4).map(p=>(
                          <div key={p.id} onClick={()=>{setView("prestations");setGlobalSearch("");}} style={{ padding:"10px 14px", cursor:"pointer", borderBottom:`1px solid ${C.border}` }}
                            onMouseEnter={e=>e.currentTarget.style.background=C.coralPale} onMouseLeave={e=>e.currentTarget.style.background=""}>
                            <div style={{ fontWeight:500, fontSize:13 }}>{p.nom}</div>
                            <div style={{ fontSize:11, color:C.muted }}>{p.date} · {p.tarif.toLocaleString("fr-FR")} €</div>
                          </div>
                        ))}
                      </>
                    )}
                    {searchResults.frais.length>0 && (
                      <>
                        <div style={{ padding:"8px 14px", fontSize:11, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:".07em", background:C.sand }}>Frais ({searchResults.frais.length})</div>
                        {searchResults.frais.slice(0,3).map(f=>(
                          <div key={f.id} onClick={()=>{setView("frais");setGlobalSearch("");}} style={{ padding:"10px 14px", cursor:"pointer", borderBottom:`1px solid ${C.border}` }}
                            onMouseEnter={e=>e.currentTarget.style.background=C.coralPale} onMouseLeave={e=>e.currentTarget.style.background=""}>
                            <div style={{ fontWeight:500, fontSize:13 }}>{f.libelle}</div>
                            <div style={{ fontSize:11, color:C.muted }}>{f.date} · {parseFloat(f.montant||0).toLocaleString("fr-FR")} €</div>
                          </div>
                        ))}
                      </>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Year selector */}
          {availableYears.length>1 && (
            <div style={{ padding:"10px 12px 0" }}>
              <select value={year} onChange={e=>setYear(parseInt(e.target.value))} style={{ fontSize:12, padding:"6px 10px", borderRadius:8, color:C.muted }}>
                {availableYears.map(y=><option key={y}>{y}</option>)}
              </select>
            </div>
          )}

          {/* Nav */}
          <nav style={{ flex:1, padding:"12px 12px", display:"flex", flexDirection:"column", gap:3, overflowY:"auto" }}>
            {NAVS.map(n => {
              const active = view===n.id;
              return (
                <button key={n.id} onClick={()=>{setView(n.id);setSidebarOpen(false);}} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", borderRadius:12, border:"none", width:"100%", textAlign:"left", background:active?C.coralPale:"transparent", color:active?C.coralDeep:C.muted, fontFamily:"'DM Sans', sans-serif", fontWeight:active?600:400, fontSize:14 }}>
                  <span style={{ fontSize:14 }}>{n.icon}</span>{n.label}
                </button>
              );
            })}
          </nav>

          {/* Summary + save */}
          <div style={{ padding:"0 12px 16px" }}>
            {prestations.length>0 && (
              <div style={{ background:C.sand, borderRadius:14, padding:"12px 14px", marginBottom:8 }}>
                <div style={{ fontSize:10, color:C.muted, fontWeight:600, textTransform:"uppercase", letterSpacing:".08em", marginBottom:6 }}>{year}</div>
                <div style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:22, fontWeight:600, color:C.coral, lineHeight:1 }}>{totalCA.toLocaleString("fr-FR",{maximumFractionDigits:0})} €</div>
                <div style={{ fontSize:11, color:C.muted, marginTop:4 }}>{totalNet.toLocaleString("fr-FR",{maximumFractionDigits:0})} € net</div>
                {totalFraisYear>0 && <div style={{ fontSize:11, color:C.red, marginTop:2 }}>−{totalFraisYear.toLocaleString("fr-FR",{maximumFractionDigits:0})} € frais</div>}
                <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{prestations.filter(p=>p.date?.startsWith(String(year))).length} prestation{prestations.length>1?"s":""}</div>
              </div>
            )}

            <button onClick={()=>setDataModal(true)} style={{
              width:"100%", padding:"10px 14px", borderRadius:12, position:"relative",
              border:`1.5px solid ${savedFlash?C.green:hasUnsaved?C.coral:C.border}`,
              background:savedFlash?C.greenPale:hasUnsaved?C.coralPale:C.white,
              color:savedFlash?C.green:hasUnsaved?C.coralDeep:C.muted,
              fontSize:13, fontFamily:"'DM Sans', sans-serif", fontWeight:500,
              display:"flex", alignItems:"center", justifyContent:"center", gap:7, transition:"all .3s",
            }}>
              {savedFlash ? "✓ Sauvegardé !" : hasUnsaved&&prestations.length>0 ? "💾 Sauvegarder !" : "💾 Données"}
              {hasUnsaved && prestations.length>0 && !savedFlash && (
                <span style={{ width:7, height:7, borderRadius:"50%", background:C.coral, flexShrink:0 }} />
              )}
            </button>

            {!prestations.length && (
              <button onClick={goNewPrestation} style={{ width:"100%", marginTop:8, padding:"10px 16px", borderRadius:12, border:`1.5px dashed ${C.border}`, background:"transparent", color:C.muted, fontSize:13, fontFamily:"'DM Sans', sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                ＋ Première prestation
              </button>
            )}
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="main-pad" style={{ flex:1, padding:"44px 52px", overflowY:"auto", minHeight:"100vh" }}>
          {view==="dashboard"   && <Dashboard   prestations={prestations} frais={frais} settings={settings} onNewPrestation={goNewPrestation} year={year} />}
          {view==="prestations" && <Prestations prestations={prestations} setPrestations={setPrestations} settings={settings} triggerNew={triggerNew} setTriggerNew={setTriggerNew} />}
          {view==="facturier"   && <Facturier   prestations={prestations} factures={factures} setFactures={setFactures} />}
          {view==="frais"       && <Frais        frais={frais} setFrais={setFrais} />}
          {view==="bilan"       && <Bilan        prestations={prestations} frais={frais} factures={factures} settings={settings} year={year} />}
          {view==="params"      && <Parametres  settings={settings} setSettings={setSettings} />}
        </main>
      </div>

      <DataModal open={dataModal} onClose={()=>setDataModal(false)} onSave={handleSave} onLoad={handleLoad} hasData={prestations.length>0} />
    </>
  );
}
