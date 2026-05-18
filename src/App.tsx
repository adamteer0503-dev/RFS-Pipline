import React, { useState, useEffect, useCallback, useRef, Fragment } from 'react';
import { v4 as uuidv4 } from 'uuid';
import toast, { Toaster } from 'react-hot-toast';
import {
  Plus, Trash2, Download, Share2, Sparkles, Check, X,
  ChevronDown, Shield, Eye, ExternalLink, Building2, Mail,
  User, Columns, Search, RefreshCw, Users, Copy,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Stage = 'Contacted' | 'Scheduled' | 'In Progress' | 'Completed' | 'Follow-up' | 'Closed';
type Role  = 'admin' | 'editor';
type ColType = 'text' | 'url' | 'date' | 'number';

interface CustomCol { id: string; label: string; type: ColType; }

interface CEO {
  id: string;
  name: string;
  company: string;
  email: string;
  stage: Stage;
  linkedIn: string;
  title: string;
  press: string;
  birthdate: string;
  insights: string;
  enriched: boolean;
  enrichedAt: string;
  createdAt: string;
  [key: string]: unknown;
}

interface Collaborator { email: string; role: Role; addedAt: string; }

// ─── Constants ────────────────────────────────────────────────────────────────

const STAGES: Stage[] = ['Contacted', 'Scheduled', 'In Progress', 'Completed', 'Follow-up', 'Closed'];

const STAGE_STYLE: Record<Stage, string> = {
  'Contacted':   'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'Scheduled':   'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  'In Progress': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'Completed':   'bg-green-500/20 text-green-300 border-green-500/30',
  'Follow-up':   'bg-orange-500/20 text-orange-300 border-orange-500/30',
  'Closed':      'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

const LS = {
  records: 'rfs_records_v1',
  cols:    'rfs_cols_v1',
  role:    'rfs_role_v1',
  collabs: 'rfs_collabs_v1',
};

const SEED: CEO[] = [
  { id: uuidv4(), name: 'Sarah Chen',    company: 'NovaTech AI',  email: 'sarah@novatech.ai',      stage: 'Scheduled',   linkedIn: '', title: '', press: '', birthdate: '', insights: '', enriched: false, enrichedAt: '', createdAt: new Date().toISOString() },
  { id: uuidv4(), name: 'Marcus Rivera', company: 'GreenLoop',    email: 'm.rivera@greenloop.io',  stage: 'Contacted',   linkedIn: '', title: '', press: '', birthdate: '', insights: '', enriched: false, enrichedAt: '', createdAt: new Date().toISOString() },
  { id: uuidv4(), name: 'Priya Sharma',  company: 'HealthBridge', email: 'priya@healthbridge.com', stage: 'In Progress', linkedIn: '', title: '', press: '', birthdate: '', insights: '', enriched: false, enrichedAt: '', createdAt: new Date().toISOString() },
  { id: uuidv4(), name: "James O'Brien", company: 'FinFlow',      email: 'james@finflow.co',       stage: 'Follow-up',   linkedIn: '', title: '', press: '', birthdate: '', insights: '', enriched: false, enrichedAt: '', createdAt: new Date().toISOString() },
  { id: uuidv4(), name: 'Aiko Tanaka',   company: 'CloudSeed',    email: 'aiko@cloudseed.jp',      stage: 'Contacted',   linkedIn: '', title: '', press: '', birthdate: '', insights: '', enriched: false, enrichedAt: '', createdAt: new Date().toISOString() },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function lsGet<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v ? (JSON.parse(v) as T) : fallback; }
  catch { return fallback; }
}
const lsSet = (key: string, val: unknown) => localStorage.setItem(key, JSON.stringify(val));
const cx = (...c: (string | false | undefined | null)[]) => c.filter(Boolean).join(' ');

// ─── Mock AI Enrichment ───────────────────────────────────────────────────────
// TODO: Replace with real Perplexity API call:
//   POST https://api.perplexity.ai/chat/completions
//   Headers: { Authorization: `Bearer ${PERPLEXITY_API_KEY}`, 'Content-Type': 'application/json' }
//   Body: { model: 'llama-3.1-sonar-large-128k-online',
//           messages: [{ role: 'user', content: `Return JSON profile for CEO: ${name}, company: ${company}.
//                        Include: linkedInUrl, professionalTitle, topPressArticles, birthdate, keyInsights` }] }
//
// OR Google Knowledge Graph API for public figures:
//   GET https://kgsearch.googleapis.com/v1/entities:search?query=${encodeURIComponent(name)}&key=${GOOGLE_API_KEY}&types=Person
function mockEnrichProfile(name: string, company: string): Partial<CEO> {
  const slug    = name.toLowerCase().replace(/[^a-z]/g, '');
  const prior   = ['Google', 'Stripe', 'Sequoia Capital', 'McKinsey', 'Goldman Sachs', 'Amazon'][Math.floor(Math.random() * 6)];
  const vertical = ['SaaS', 'FinTech', 'HealthTech', 'CleanTech', 'AI/ML', 'Web3'][Math.floor(Math.random() * 6)];
  const year    = 2020 + Math.floor(Math.random() * 4);
  const funding = (Math.random() * 30 + 2).toFixed(1);
  const series  = ['A', 'B', 'C'][Math.floor(Math.random() * 3)];
  return {
    linkedIn:  `https://linkedin.com/in/${slug}`,
    title:     `CEO & Co-Founder @ ${company} · Prev. VP @ ${prior} · ${vertical} specialist`,
    press: [
      `TechCrunch (${year}): "${company} raises $${funding}M Series ${series} to accelerate growth"`,
      `Forbes 30 Under 30 — ${year} — Enterprise Technology`,
      `Bloomberg Op-Ed: "${name} on building in the age of ${vertical}"`,
    ].join('  ·  '),
    birthdate:  `${1975 + Math.floor(Math.random() * 20)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
    insights:  `Serial entrepreneur with ${2 + Math.floor(Math.random() * 4)} prior exits. Deep ${vertical} operator network. ` +
               `Strong board of advisors from ${prior}. Currently raising Series ${series}. ` +
               `Attended TechCrunch Disrupt ${year}. Recommended warm intro via portfolio network.`,
    enriched:   true,
    enrichedAt: new Date().toISOString(),
  };
}

// ─── Shared style tokens ──────────────────────────────────────────────────────
const INPUT = 'bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-indigo-500 w-full transition-colors';
const BTN_P = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed';
const BTN_S = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 text-xs transition-colors';

// ─── Sub-components ───────────────────────────────────────────────────────────

function Modal({ title, onClose, children, wide }: {
  title: string; onClose: () => void; children: React.ReactNode; wide?: boolean;
}) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className={cx('bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full', wide ? 'max-w-lg' : 'max-w-sm')}>
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-800">
          <h3 className="text-sm font-semibold text-gray-100">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 p-0.5 rounded transition-colors"><X size={15} /></button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      {children}
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  // ── Core state ──
  const [records,   setRecords]   = useState<CEO[]>(() => lsGet(LS.records, SEED));
  const [cols,      setCols]      = useState<CustomCol[]>(() => lsGet(LS.cols, []));
  const [role,      setRole]      = useState<Role>(() => lsGet(LS.role, 'admin'));
  const [collabs,   setCollabs]   = useState<Collaborator[]>(() => lsGet(LS.collabs, []));

  // ── UI state ──
  const [stageFilter, setStageFilter] = useState<Stage | 'All'>('All');
  const [query,       setQuery]       = useState('');
  const [selected,    setSelected]    = useState<Set<string>>(new Set());
  const [expanded,    setExpanded]    = useState<string | null>(null);
  const [enriching,   setEnriching]   = useState<string | null>(null);
  const [modal,       setModal]       = useState<'addRow' | 'addCol' | 'share' | null>(null);

  // ── Inline editing ──
  const [editCell, setEditCell] = useState<{ id: string; col: string } | null>(null);
  const [editVal,  setEditVal]  = useState('');
  const editRef = useRef<HTMLInputElement>(null);

  // ── Forms ──
  const [newRow,   setNewRow]   = useState({ name: '', company: '', email: '', stage: 'Contacted' as Stage });
  const [newCol,   setNewCol]   = useState({ label: '', type: 'text' as ColType });
  const [shareForm, setShareForm] = useState({ email: '', role: 'editor' as Role });

  // ── Persist ──
  useEffect(() => { lsSet(LS.records, records); }, [records]);
  useEffect(() => { lsSet(LS.cols,    cols);     }, [cols]);
  useEffect(() => { lsSet(LS.role,    role);     }, [role]);
  useEffect(() => { lsSet(LS.collabs, collabs);  }, [collabs]);

  useEffect(() => { if (editCell) editRef.current?.focus(); }, [editCell]);

  const isEditor = role === 'editor';

  // ── Derived ──
  const displayed = records.filter(r => {
    if (stageFilter !== 'All' && r.stage !== stageFilter) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return r.name.toLowerCase().includes(q) || r.company.toLowerCase().includes(q) || r.email.toLowerCase().includes(q);
  });

  const stageCounts = STAGES.reduce(
    (a, s) => ({ ...a, [s]: records.filter(r => r.stage === s).length }),
    {} as Record<Stage, number>,
  );

  // ── Cell editing ──
  const startEdit = (id: string, col: string, val: string) => {
    if (isEditor) return;
    setEditCell({ id, col });
    setEditVal(val);
  };

  const commitEdit = useCallback(() => {
    if (!editCell) return;
    setRecords(p => p.map(r => r.id === editCell.id ? { ...r, [editCell.col]: editVal } : r));
    setEditCell(null);
  }, [editCell, editVal]);

  const cancelEdit = () => setEditCell(null);

  // ── AI Enrichment ──
  const handleEnrich = async (ceo: CEO) => {
    setEnriching(ceo.id);
    // Simulated API latency — replace setTimeout with real fetch (see comments above mockEnrichProfile)
    await new Promise(r => setTimeout(r, 1400 + Math.random() * 900));
    setRecords(p => p.map(r => r.id === ceo.id ? { ...r, ...mockEnrichProfile(ceo.name, ceo.company) } : r));
    setExpanded(ceo.id);
    setEnriching(null);
    toast.success(`Enriched: ${ceo.name}`);
  };

  // ── CRUD ──
  const addRow = () => {
    if (!newRow.name.trim()) return;
    const rec: CEO = {
      id: uuidv4(), ...newRow,
      name: newRow.name.trim(), company: newRow.company.trim(), email: newRow.email.trim(),
      linkedIn: '', title: '', press: '', birthdate: '', insights: '',
      enriched: false, enrichedAt: '', createdAt: new Date().toISOString(),
    };
    cols.forEach(c => { rec[c.id] = ''; });
    setRecords(p => [...p, rec]);
    setNewRow({ name: '', company: '', email: '', stage: 'Contacted' });
    setModal(null);
    toast.success(`Added ${rec.name}`);
  };

  const deleteRow = (id: string) => {
    setRecords(p => p.filter(r => r.id !== id));
    setSelected(p => { const s = new Set(p); s.delete(id); return s; });
  };

  const deleteBulk = () => {
    const n = selected.size;
    setRecords(p => p.filter(r => !selected.has(r.id)));
    setSelected(new Set());
    toast.success(`Deleted ${n} record${n !== 1 ? 's' : ''}`);
  };

  const addColumn = () => {
    if (!newCol.label.trim()) return;
    const col: CustomCol = { id: `col_${uuidv4().slice(0, 8)}`, label: newCol.label.trim(), type: newCol.type };
    setCols(p => [...p, col]);
    setRecords(p => p.map(r => ({ ...r, [col.id]: '' })));
    setNewCol({ label: '', type: 'text' });
    setModal(null);
    toast.success(`Column "${col.label}" added`);
  };

  const deleteColumn = (colId: string) => {
    setCols(p => p.filter(c => c.id !== colId));
    setRecords(p => p.map(r => { const n = { ...r }; delete n[colId]; return n; }));
  };

  // ── Collaborators ──
  const grantAccess = () => {
    if (!shareForm.email.trim() || !shareForm.email.includes('@')) return;
    const c: Collaborator = { email: shareForm.email.trim(), role: shareForm.role, addedAt: new Date().toISOString() };
    setCollabs(p => [...p.filter(x => x.email !== c.email), c]);
    setShareForm(p => ({ ...p, email: '' }));
    toast.success(`Access granted to ${c.email}`);
  };

  // ── Selection ──
  const toggleRow   = (id: string) => setSelected(p => { const s = new Set(p); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const toggleAll   = () => setSelected(displayed.length > 0 && selected.size === displayed.length ? new Set() : new Set(displayed.map(r => r.id)));

  // ── Export ──
  const dl = (name: string, content: string, type: string) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], { type }));
    a.download = name;
    a.click();
  };

  const exportCSV = () => {
    const baseCols: (keyof CEO)[] = ['name', 'company', 'email', 'stage', 'linkedIn', 'title', 'birthdate', 'insights'];
    const baseHdrs = ['Name', 'Company', 'Email', 'Stage', 'LinkedIn', 'Title', 'Birthdate', 'Insights'];
    const allCols  = [...baseCols, ...cols.map(c => c.id as keyof CEO)];
    const allHdrs  = [...baseHdrs, ...cols.map(c => c.label)];
    const rows     = records.map(r => allCols.map(c => `"${String(r[c] ?? '').replace(/"/g, '""')}"`).join(','));
    dl('rfs-pipeline.csv', [allHdrs.join(','), ...rows].join('\n'), 'text/csv');
  };

  const exportJSON = () => dl('rfs-pipeline.json', JSON.stringify(records, null, 2), 'application/json');

  // ── Inline edit cell ──
  const EditCell = ({ id, col, value, className }: { id: string; col: string; value: string; className?: string }) => {
    const active = editCell?.id === id && editCell?.col === col;
    if (active) return (
      <div className="flex items-center gap-1 min-w-0">
        <input
          ref={editRef}
          value={editVal}
          onChange={e => setEditVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') cancelEdit(); }}
          className="flex-1 min-w-0 bg-gray-800 border border-indigo-500 rounded px-2 py-0.5 text-xs text-gray-100 focus:outline-none"
        />
        <button onClick={commitEdit} className="text-green-400 hover:text-green-300 flex-shrink-0"><Check size={12} /></button>
        <button onClick={cancelEdit} className="text-red-400   hover:text-red-300 flex-shrink-0"><X size={12} /></button>
      </div>
    );
    return (
      <span
        onClick={() => startEdit(id, col, value)}
        title={value}
        className={cx(
          'block truncate max-w-[160px]',
          !isEditor && 'cursor-pointer hover:text-indigo-300',
          'transition-colors',
          className,
        )}
      >
        {value || <span className="text-gray-700 italic text-xs">—</span>}
      </span>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Toaster
        position="top-right"
        toastOptions={{ className: '!bg-gray-800 !text-gray-100 !border !border-gray-700 !text-xs !shadow-xl !rounded-lg' }}
      />

      {/* ═══ HEADER ═══════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-30 border-b border-gray-800 bg-gray-950/95 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-3 px-4 h-14">

          {/* Brand */}
          <div className="flex items-center gap-2.5 mr-1">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-extrabold text-white leading-none tracking-tight">RFS</span>
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-gray-100 leading-none">Run For Startups</p>
              <p className="text-[10px] text-gray-500 mt-0.5">CEO Pipeline</p>
            </div>
          </div>

          <div className="w-px h-6 bg-gray-800" />

          {/* Role badge */}
          <div className={cx(
            'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
            isEditor
              ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
              : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
          )}>
            {isEditor ? <Eye size={11} /> : <Shield size={11} />}
            {isEditor ? 'Editor Mode' : 'Admin'}
          </div>

          <button
            onClick={() => setRole(r => r === 'admin' ? 'editor' : 'admin')}
            className="text-xs text-gray-600 hover:text-gray-300 border border-gray-800 hover:border-gray-700 rounded px-2 py-0.5 transition-colors"
          >
            → {isEditor ? 'Admin' : 'Editor'}
          </button>

          <div className="flex-1" />

          {/* Search */}
          <div className="relative hidden sm:block">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search CEOs…"
              className="bg-gray-900 border border-gray-800 focus:border-gray-600 rounded-lg pl-7 pr-3 py-1.5 text-xs text-gray-200 placeholder-gray-600 focus:outline-none w-44 transition-colors"
            />
          </div>

          {/* Export */}
          <div className="relative group">
            <button className={BTN_S}><Download size={12} /> Export</button>
            <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 w-32">
              <button onClick={exportCSV}  className="block w-full text-left px-3 py-2 text-xs text-gray-200 hover:bg-gray-700">Export CSV</button>
              <button onClick={exportJSON} className="block w-full text-left px-3 py-2 text-xs text-gray-200 hover:bg-gray-700">Export JSON</button>
            </div>
          </div>

          {!isEditor && (
            <button onClick={() => setModal('share')} className={BTN_P}>
              <Share2 size={12} /> Share
              {collabs.length > 0 && (
                <span className="bg-white/20 text-[10px] px-1.5 py-0.5 rounded-full leading-none">{collabs.length}</span>
              )}
            </button>
          )}
        </div>
      </header>

      {/* ═══ EDITOR BANNER ════════════════════════════════════════════════════ */}
      {isEditor && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 flex-shrink-0">
          <p className="text-xs text-amber-300 flex items-center gap-1.5">
            <Eye size={11} />
            Editor Mode — cell values and stages are editable. Schema changes (columns, rows) require Admin.
          </p>
        </div>
      )}

      {/* ═══ STAGE FILTER BAR ═════════════════════════════════════════════════ */}
      <div className="border-b border-gray-800 bg-gray-950 px-4 py-2 flex items-center gap-1.5 overflow-x-auto flex-shrink-0">
        <button
          onClick={() => setStageFilter('All')}
          className={cx(
            'px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
            stageFilter === 'All' ? 'bg-gray-700 text-gray-100' : 'text-gray-500 hover:text-gray-300',
          )}
        >
          All <span className="ml-1 text-[11px] opacity-50">{records.length}</span>
        </button>
        {STAGES.map(s => (
          <button
            key={s}
            onClick={() => setStageFilter(p => p === s ? 'All' : s)}
            className={cx(
              'px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors border',
              stageFilter === s ? STAGE_STYLE[s] : 'text-gray-600 border-transparent hover:text-gray-400',
            )}
          >
            {s} <span className="ml-1 text-[11px] opacity-60">{stageCounts[s]}</span>
          </button>
        ))}
      </div>

      {/* ═══ TABLE ════════════════════════════════════════════════════════════ */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs border-collapse min-w-[820px]">
          <thead className="sticky top-0 z-20 bg-gray-900 border-b border-gray-800">
            <tr>
              <th className="w-10 px-3 py-3">
                <input
                  type="checkbox"
                  checked={displayed.length > 0 && selected.size === displayed.length}
                  onChange={toggleAll}
                  className="rounded border-gray-600 accent-indigo-500 cursor-pointer"
                />
              </th>
              <th className="px-3 py-3 text-left text-gray-400 font-medium w-52">
                <span className="flex items-center gap-1.5"><User size={11} />Name</span>
              </th>
              <th className="px-3 py-3 text-left text-gray-400 font-medium w-36">
                <span className="flex items-center gap-1.5"><Building2 size={11} />Company</span>
              </th>
              <th className="px-3 py-3 text-left text-gray-400 font-medium w-44">
                <span className="flex items-center gap-1.5"><Mail size={11} />Email</span>
              </th>
              <th className="px-3 py-3 text-left text-gray-400 font-medium w-36">Stage</th>
              {cols.map(col => (
                <th key={col.id} className="px-3 py-3 text-left text-gray-400 font-medium group/col">
                  <span className="flex items-center gap-1.5">
                    {col.label}
                    {!isEditor && (
                      <button
                        onClick={() => deleteColumn(col.id)}
                        className="opacity-0 group-hover/col:opacity-100 text-gray-600 hover:text-red-400 transition-all"
                        title="Delete column"
                      >
                        <X size={10} />
                      </button>
                    )}
                  </span>
                </th>
              ))}
              <th className="px-3 py-3 w-20 text-gray-700">
                {!isEditor && (
                  <button
                    onClick={() => setModal('addCol')}
                    className="flex items-center gap-1 text-gray-600 hover:text-indigo-400 transition-colors"
                    title="Add column"
                  >
                    <Columns size={11} /> Col
                  </button>
                )}
              </th>
            </tr>
          </thead>

          <tbody>
            {displayed.map(ceo => (
              <Fragment key={ceo.id}>
                {/* ── Data row ── */}
                <tr className={cx(
                  'group/row border-b border-gray-800/50 hover:bg-gray-900/50 transition-colors',
                  selected.has(ceo.id) && 'bg-indigo-500/5',
                )}>
                  <td className="px-3 py-2.5 align-middle">
                    <input
                      type="checkbox"
                      checked={selected.has(ceo.id)}
                      onChange={() => toggleRow(ceo.id)}
                      className="rounded border-gray-600 accent-indigo-500 cursor-pointer"
                    />
                  </td>

                  {/* Name + AI Enrich */}
                  <td className="px-3 py-2.5 align-middle">
                    <div className="flex items-center gap-2">
                      {/* Avatar */}
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 select-none"
                        style={{ background: `hsl(${(ceo.name.charCodeAt(0) * 13 + (ceo.name.charCodeAt(1) || 0) * 7) % 360},55%,32%)` }}
                      >
                        {ceo.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <EditCell id={ceo.id} col="name" value={ceo.name} className="font-medium text-gray-100" />
                      </div>
                      {ceo.enriched && <span title="AI Enriched"><Sparkles size={10} className="text-indigo-400 flex-shrink-0" /></span>}
                      <button
                        onClick={() => handleEnrich(ceo)}
                        disabled={!!enriching}
                        title="Enrich with AI"
                        className="opacity-0 group-hover/row:opacity-100 flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/40 text-[10px] font-medium transition-all disabled:cursor-wait flex-shrink-0"
                      >
                        {enriching === ceo.id
                          ? <RefreshCw size={9} className="animate-spin" />
                          : <Sparkles size={9} />}
                        {enriching === ceo.id ? '…' : 'AI'}
                      </button>
                    </div>
                  </td>

                  <td className="px-3 py-2.5 align-middle text-gray-300">
                    <EditCell id={ceo.id} col="company" value={ceo.company} />
                  </td>

                  <td className="px-3 py-2.5 align-middle text-gray-400">
                    <EditCell id={ceo.id} col="email" value={ceo.email} />
                  </td>

                  {/* Stage select */}
                  <td className="px-3 py-2.5 align-middle">
                    <select
                      value={ceo.stage}
                      disabled={isEditor}
                      onChange={e => setRecords(p => p.map(r => r.id === ceo.id ? { ...r, stage: e.target.value as Stage } : r))}
                      className={cx(
                        'text-xs px-2 py-0.5 rounded-full border font-medium bg-transparent focus:outline-none appearance-none',
                        STAGE_STYLE[ceo.stage],
                        isEditor ? 'cursor-default' : 'cursor-pointer',
                      )}
                    >
                      {STAGES.map(s => <option key={s} value={s} className="bg-gray-900 text-gray-100">{s}</option>)}
                    </select>
                  </td>

                  {/* Custom columns */}
                  {cols.map(col => (
                    <td key={col.id} className="px-3 py-2.5 align-middle text-gray-400">
                      <EditCell id={ceo.id} col={col.id} value={String(ceo[col.id] ?? '')} />
                    </td>
                  ))}

                  {/* Row actions */}
                  <td className="px-3 py-2.5 align-middle">
                    <div className="flex items-center gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
                      {ceo.enriched && (
                        <button
                          onClick={() => setExpanded(p => p === ceo.id ? null : ceo.id)}
                          className="p-1 rounded hover:bg-gray-700 text-gray-500 hover:text-indigo-300 transition-colors"
                          title="Toggle AI data"
                        >
                          <ChevronDown size={12} className={cx('transition-transform', expanded === ceo.id && 'rotate-180')} />
                        </button>
                      )}
                      {!isEditor && (
                        <button
                          onClick={() => deleteRow(ceo.id)}
                          className="p-1 rounded hover:bg-gray-700 text-gray-600 hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>

                {/* ── AI Enrichment detail row ── */}
                {expanded === ceo.id && ceo.enriched && (
                  <tr className="bg-indigo-950/25 border-b border-indigo-900/30">
                    <td colSpan={5 + cols.length + 1} className="px-6 py-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-1.5">LinkedIn</p>
                          <a href={ceo.linkedIn} target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-xs">
                            <ExternalLink size={10} /> View Profile
                          </a>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-1.5">Professional Title</p>
                          <p className="text-gray-300 text-xs leading-relaxed">{ceo.title}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-1.5">Birthdate</p>
                          <p className="text-gray-300 text-xs">{ceo.birthdate}</p>
                        </div>
                        <div className="col-span-2 md:col-span-4">
                          <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-1.5">Top Press / Articles</p>
                          <p className="text-gray-300 text-xs leading-relaxed">{ceo.press}</p>
                        </div>
                        <div className="col-span-2 md:col-span-4">
                          <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-1.5">Key Insights</p>
                          <p className="text-gray-300 text-xs leading-relaxed">{ceo.insights}</p>
                        </div>
                      </div>
                      <p className="text-gray-700 text-[10px] border-t border-gray-800/60 pt-2 mt-1">
                        AI enriched · {new Date(ceo.enrichedAt).toLocaleString()} ·{' '}
                        <span className="text-gray-800">mock data — wire Perplexity / Google API for live results</span>
                      </p>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>

        {displayed.length === 0 && (
          <div className="text-center py-20 text-gray-700">
            <User size={36} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">No records match your current filters</p>
          </div>
        )}
      </div>

      {/* ═══ FOOTER TOOLBAR ═══════════════════════════════════════════════════ */}
      <footer className="sticky bottom-0 border-t border-gray-800 bg-gray-950/95 backdrop-blur-sm px-4 py-2.5 flex items-center gap-3 flex-shrink-0">
        <span className="text-xs text-gray-600">
          {displayed.length} of {records.length} CEO{records.length !== 1 ? 's' : ''}
          {stageFilter !== 'All' && <span className="ml-1 text-gray-700">· {stageFilter}</span>}
        </span>

        {selected.size > 0 && !isEditor && (
          <button
            onClick={deleteBulk}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 text-xs transition-colors"
          >
            <Trash2 size={11} /> Delete {selected.size} selected
          </button>
        )}

        <div className="flex-1" />

        {!isEditor && (
          <button onClick={() => setModal('addRow')} className={BTN_P}>
            <Plus size={13} /> Add CEO
          </button>
        )}
      </footer>

      {/* ═══════════════════════════════════════════════════════════════════════
          MODALS
      ═══════════════════════════════════════════════════════════════════════ */}

      {modal === 'addRow' && (
        <Modal title="Add New CEO" onClose={() => setModal(null)}>
          <div className="space-y-3">
            <Field label="Full Name *">
              <input autoFocus value={newRow.name} onChange={e => setNewRow(p => ({ ...p, name: e.target.value }))} onKeyDown={e => e.key === 'Enter' && addRow()} className={INPUT} placeholder="Sarah Chen" />
            </Field>
            <Field label="Company">
              <input value={newRow.company} onChange={e => setNewRow(p => ({ ...p, company: e.target.value }))} className={INPUT} placeholder="NovaTech AI" />
            </Field>
            <Field label="Email">
              <input value={newRow.email} onChange={e => setNewRow(p => ({ ...p, email: e.target.value }))} className={INPUT} placeholder="sarah@novatech.ai" type="email" />
            </Field>
            <Field label="Initial Stage">
              <select value={newRow.stage} onChange={e => setNewRow(p => ({ ...p, stage: e.target.value as Stage }))} className={INPUT}>
                {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <div className="flex justify-end gap-2 pt-1">
              <button onClick={() => setModal(null)} className={BTN_S}>Cancel</button>
              <button onClick={addRow} disabled={!newRow.name.trim()} className={BTN_P}><Plus size={12} /> Add CEO</button>
            </div>
          </div>
        </Modal>
      )}

      {modal === 'addCol' && (
        <Modal title="Add Custom Column" onClose={() => setModal(null)}>
          <div className="space-y-3">
            <Field label="Column Name *">
              <input autoFocus value={newCol.label} onChange={e => setNewCol(p => ({ ...p, label: e.target.value }))} onKeyDown={e => e.key === 'Enter' && addColumn()} className={INPUT} placeholder="e.g. Investor Intro, Deal Size" />
            </Field>
            <Field label="Data Type">
              <select value={newCol.type} onChange={e => setNewCol(p => ({ ...p, type: e.target.value as ColType }))} className={INPUT}>
                <option value="text">Text</option>
                <option value="url">URL</option>
                <option value="date">Date</option>
                <option value="number">Number</option>
              </select>
            </Field>
            <div className="flex justify-end gap-2 pt-1">
              <button onClick={() => setModal(null)} className={BTN_S}>Cancel</button>
              <button onClick={addColumn} disabled={!newCol.label.trim()} className={BTN_P}><Columns size={12} /> Add Column</button>
            </div>
          </div>
        </Modal>
      )}

      {modal === 'share' && (
        <Modal title="Share & Grant Access" onClose={() => setModal(null)} wide>
          <div className="space-y-4">
            {/* Grant form */}
            <div className="flex gap-2">
              <input
                autoFocus
                value={shareForm.email}
                onChange={e => setShareForm(p => ({ ...p, email: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && grantAccess()}
                className={cx(INPUT, 'flex-1')}
                placeholder="colleague@startup.com"
                type="email"
              />
              <select
                value={shareForm.role}
                onChange={e => setShareForm(p => ({ ...p, role: e.target.value as Role }))}
                className="bg-gray-800 border border-gray-700 rounded-lg px-2 text-sm text-gray-100 focus:outline-none focus:border-indigo-500 w-24 transition-colors"
              >
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
              <button onClick={grantAccess} className={BTN_P}><Users size={12} /> Grant</button>
            </div>

            {/* Collaborator list */}
            {collabs.length > 0 ? (
              <div className="border border-gray-800 rounded-lg overflow-hidden divide-y divide-gray-800">
                {collabs.map(c => (
                  <div key={c.email} className="flex items-center justify-between px-3 py-2.5 hover:bg-gray-800/50 transition-colors">
                    <div>
                      <p className="text-sm text-gray-200">{c.email}</p>
                      <p className="text-[10px] text-gray-600 mt-0.5">Added {new Date(c.addedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cx(
                        'text-xs px-2 py-0.5 rounded-full border',
                        c.role === 'admin'
                          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                          : 'bg-amber-500/10 text-amber-300 border-amber-500/30',
                      )}>
                        {c.role}
                      </span>
                      <button onClick={() => setCollabs(p => p.filter(x => x.email !== c.email))} className="text-gray-600 hover:text-red-400 transition-colors p-0.5">
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-700 border border-gray-800 rounded-lg">
                <Users size={24} className="mx-auto mb-2 opacity-30" />
                <p className="text-xs">No collaborators yet — grant access above</p>
              </div>
            )}

            {/* Copy invite link */}
            <div className="flex items-center gap-2 bg-gray-800/40 border border-gray-800 rounded-lg px-3 py-2">
              <span className="text-xs text-gray-500 flex-1 truncate">{window.location.origin}/invite/demo-link</span>
              <button
                onClick={() => { navigator.clipboard?.writeText(window.location.origin); toast.success('Link copied!'); }}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-200 flex-shrink-0 transition-colors"
              >
                <Copy size={11} /> Copy
              </button>
            </div>

            <div className="border-t border-gray-800 pt-3">
              <p className="text-[11px] text-gray-700 leading-relaxed">
                <span className="text-gray-500 font-medium">Admin</span> — full CRUD + schema + share &nbsp;·&nbsp;
                <span className="text-gray-500 font-medium">Editor</span> — edit cell values & stages only
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
