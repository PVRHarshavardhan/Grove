/* Grove — study goals, tasks, focus forest & study groups */
'use strict';
const APP_VERSION = '1.0.0';

/* ================= helpers ================= */
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = n => String(n).padStart(2, '0');
const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const today = () => ymd(new Date());
const parse = s => { const [y, m, d] = String(s).split('-').map(Number); return new Date(y, (m || 1) - 1, d || 1); };
const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return ymd(d); };
const diffDays = (a, b) => Math.round((parse(b) - parse(a)) / 864e5);
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const fmtD = s => { if (!s) return ''; const d = parse(s); return `${d.getDate()} ${MON[d.getMonth()]} ${d.getFullYear()}`; };
const fmtS = s => { const d = parse(s); return `${d.getDate()} ${MON[d.getMonth()]}`; };
const hm = m => { m = Math.max(0, Math.round(m || 0)); const h = Math.floor(m / 60), r = m % 60; return h ? (r ? `${h}h ${r}m` : `${h}h`) : `${r}m`; };
const hrs = m => { const v = (m || 0) / 60; return (Math.round(v * 10) / 10).toString(); };
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const initials = n => String(n || '?').trim().split(/\s+/).map(x => x[0]).slice(0, 2).join('').toUpperCase() || '?';
function* dates(a, b) { const d = parse(a), e = parse(b); while (d <= e) { yield ymd(d); d.setDate(d.getDate() + 1); } }
const clone = o => JSON.parse(JSON.stringify(o));
const pct = (a, b) => b > 0 ? Math.round(a / b * 100) : 0;

/* ================= icons (simple line set) ================= */
const IP = {
  home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
  tasks: '<path d="M9 11l3 3 8-8"/><path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9"/>',
  cal: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  tree: '<path d="M12 22v-5"/><path d="M8 17h8a4 4 0 0 0 1.2-7.8A5.2 5.2 0 0 0 7 8.6 4.2 4.2 0 0 0 8 17z"/><path d="M12 17l-2.5-2.5M12 15l2-2"/>',
  forest: '<path d="M7 22v-4M17 22v-4"/><path d="M7 18c-2.8 0-4.5-1.7-4.5-4.2A4.5 4.5 0 0 1 7 9.3a4.5 4.5 0 0 1 4.5 4.5C11.5 16.3 9.8 18 7 18z"/><path d="M17 18l-4-6h2.5L13 8h2l-2-4h8l-2 4h2l-2.5 4H21z"/>',
  group: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17.5" cy="9" r="2.5"/><path d="M16 14.5a5 5 0 0 1 6 5"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', x: '<path d="M18 6L6 18M6 6l12 12"/>', play: '<path d="M7 4l13 8-13 8z"/>', pause: '<path d="M8 5v14M16 5v14"/>',
  flag: '<path d="M4 22V4M4 4h13l-2 4 2 4H4"/>', clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', alert: '<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>',
  check: '<path d="M20 6L9 17l-5-5"/>', list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>', board: '<rect x="3" y="3" width="7" height="18" rx="1.5"/><rect x="14" y="3" width="7" height="11" rx="1.5"/>',
  left: '<path d="M15 18l-6-6 6-6"/>', right: '<path d="M9 18l6-6-6-6"/>', trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/>',
  fire: '<path d="M12 22c4 0 7-3 7-7 0-5-5-7-5-12-3 2-5 5-5 8-1-1-2-2-2-3-1 2-2 4-2 7 0 4 3 7 7 7z"/>', target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>', user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>', devices: '<rect x="2" y="4" width="14" height="10" rx="1.5"/><path d="M6 18h6"/><rect x="17" y="8" width="5" height="12" rx="1"/>',
  bolt: '<path d="M13 2L3 14h9l-1 8 10-12h-9z"/>', search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>', download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>', note: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>'
};
const ic = (n, c) => `<svg class="i ${c || ''}" viewBox="0 0 24 24" aria-hidden="true">${IP[n] || ''}</svg>`;

/* ================= domain constants ================= */
const PRIORITIES = [['Now', '🔥', 'r'], ['Very High', '🔴', 'r'], ['High', '🟠', 'y'], ['Medium', '🟡', 'y'], ['Low', '🟢', 'g']];
const STATUSES = [['Not Started', '💤', ''], ['In Progress', '💬', 'd'], ['Delegated', '🚧', 'y'], ['Completed', '✅', 'g'], ['Cancelled', '❌', '']];
const PRI = Object.fromEntries(PRIORITIES.map((p, i) => [p[0], { e: p[1], c: p[2], o: i }]));
const STA = Object.fromEntries(STATUSES.map((p, i) => [p[0], { e: p[1], c: p[2], o: i }]));
const SPECIES = [
  { id: 'oak', name: 'Oak', need: 0 }, { id: 'pine', name: 'Pine', need: 3 }, { id: 'cherry', name: 'Cherry', need: 10 },
  { id: 'maple', name: 'Maple', need: 25 }, { id: 'jacaranda', name: 'Jacaranda', need: 50 }, { id: 'bamboo', name: 'Bamboo', need: 100 }];
const MEMBER_COLORS = ['#7C46F1', '#E51837', '#1077DA', '#2E9E5B', '#F5B43C', '#001F53', '#D9622B', '#0F9BA8'];
const QUOTES = [
  ['The secret of getting ahead is getting started.', 'Mark Twain'], ['It always seems impossible until it is done.', 'Nelson Mandela'],
  ['Well begun is half done.', 'Aristotle'], ['Small daily improvements are the key to staggering long-term results.', 'Robin Sharma'],
  ['Arise, awake, and stop not till the goal is reached.', 'Swami Vivekananda'], ['Discipline is choosing between what you want now and what you want most.', 'Abraham Lincoln (attrib.)'],
  ['Focus on being productive instead of busy.', 'Tim Ferriss']];
const DEFAULT_SETTINGS = {
  name: '', weekStart: 1, weekHrs: [4, 4, 4, 4, 4, 4, 4],
  categories: ['Polity', 'History', 'Geography', 'Economy', 'Environment', 'Science & Tech', 'Internal Security', 'Disaster Management', 'Ethics', 'Current Affairs', 'Essay', 'Optional', 'CSAT', 'Revision'],
  delegates: ['Me'], hideStatuses: ['Completed', 'Cancelled'], pomo: { focus: 25, short: 5, long: 15, every: 4, auto: true }, tree: 'oak'
};

/* ================= state ================= */
const S = { user: null, settings: clone(DEFAULT_SETTINGS), profileLoaded: false, tasks: [], entries: [], sessions: [], groups: [], gdays: {} };
const UI = { page: 'home', taskView: 'list', tf: { q: '', status: 'open', pri: 'all', cat: 'all', who: 'all' }, cal: null, forest: { range: 'week', anchor: today() },
  group: null, gRange: 'week', homeList: 'today', booting: true, err: '' };
const PAGES = [['home', 'home', 'Home'], ['tasks', 'tasks', 'Tasks'], ['focus', 'tree', 'Focus'], ['calendar', 'cal', 'Calendar'], ['groups', 'group', 'Groups'], ['forest', 'forest', 'My Forest'], ['settings', 'gear', 'Settings']];
let DB = null;

/* ================= derived data ================= */
const goalMins = d => (+S.settings.weekHrs[parse(d).getDay()] || 0) * 60;
function dayTotals(d) { let mins = 0, trees = 0, withered = 0; for (const s of S.sessions) if (s.date === d) { mins += +s.mins || 0; if (s.tree) { if (s.ok) trees++; else withered++; } } return { mins: Math.round(mins), trees, withered }; }
const dayMins = d => dayTotals(d).mins;
function rangeMins(a, b) { let m = 0; for (const s of S.sessions) if (s.date >= a && s.date <= b) m += +s.mins || 0; return m; }
function rangeGoal(a, b) { let m = 0; for (const d of dates(a, b)) m += goalMins(d); return m; }
const treeCount = () => S.sessions.filter(s => s.tree && s.ok).length;
function streak() { let n = 0, d = dayMins(today()) >= goalMins(today()) && goalMins(today()) > 0 ? today() : addDays(today(), -1); for (let i = 0; i < 2000; i++) { const g = goalMins(d); if (g === 0) { d = addDays(d, -1); continue; } if (dayMins(d) >= g) { n++; d = addDays(d, -1); } else break; } return n; }
const isOverdue = t => !t.done && t.status !== 'Completed' && t.status !== 'Cancelled' && t.due && t.due < today();
const statusOf = t => isOverdue(t) ? 'Overdue' : t.status;
function weekStartOf(d) { const x = parse(d), ws = S.settings.weekStart; x.setDate(x.getDate() - ((x.getDay() - ws + 7) % 7)); return ymd(x); }
const greet = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; };
const firstName = () => (S.settings.name || (S.user && S.user.name) || '').split(' ')[0];

/* ================= tree art ================= */
function treeSVG(sp, p, withered, opt) {
  p = Math.max(0, Math.min(1, p));
  const W = withered;
  const C = {
    oak: ['#3BAA5C', '#2E8B4E', '#57C277'], pine: ['#1F7A44', '#2A9054', '#176238'], cherry: ['#F7A8C4', '#F28DB2', '#FBC9DB'],
    maple: ['#F08A3C', '#D9622B', '#F5A962'], jacaranda: ['#9B7BF7', '#7C46F1', '#B9A2FA'], bamboo: ['#5DBB63', '#3E9A47', '#7ED085']
  }[sp] || ['#3BAA5C', '#2E8B4E', '#57C277'];
  const col = W ? ['#A89577', '#8E7B5C', '#BBA98A'] : C;
  const trunk = W ? '#7A6650' : '#8A5A3B';
  let g = `<ellipse cx="50" cy="90" rx="30" ry="6" fill="${W ? '#9E8C70' : '#6BBF59'}"/><ellipse cx="50" cy="91" rx="22" ry="3.5" fill="${W ? '#7E6C53' : '#8A5A3B'}" opacity=".55"/>`;
  if (p < 0.12 && !opt?.full) return svgWrap(g + `<ellipse cx="50" cy="86" rx="4" ry="3" fill="#8A5A3B"/>`);
  if (p < 0.38 && !opt?.full) {
    const s = (p - 0.12) / 0.26, h = 6 + s * 12;
    g += `<path d="M50 88 V${88 - h}" stroke="${W ? trunk : '#3E9A47'}" stroke-width="2.5" stroke-linecap="round"/>`;
    g += `<ellipse cx="${50 - 5 * s - 2}" cy="${88 - h}" rx="${3 + 4 * s}" ry="${2 + 2 * s}" fill="${col[0]}" transform="rotate(-25 ${50 - 5 * s - 2} ${88 - h})"/><ellipse cx="${50 + 5 * s + 2}" cy="${88 - h - 2}" rx="${3 + 4 * s}" ry="${2 + 2 * s}" fill="${col[2]}" transform="rotate(25 ${50 + 5 * s + 2} ${88 - h - 2})"/>`;
    return svgWrap(g);
  }
  const s = opt?.full ? 1 : (p - 0.38) / 0.62, k = 0.45 + 0.55 * s;
  const tx = (x, y) => `translate(50 88) scale(${k}) translate(-50 -88) translate(${x} ${y})`;
  if (sp === 'bamboo') {
    [[-10, 0], [0, -6], [10, -2]].forEach(([dx, dy], i) => {
      const top = 22 + dy;
      g += `<g transform="${tx(0, 0)}"><rect x="${48 + dx}" y="${top}" width="4.5" height="${88 - top}" rx="2" fill="${col[i % 2]}"/>`;
      for (let y = top + 12; y < 86; y += 13) g += `<rect x="${47 + dx}" y="${y}" width="6.5" height="2" rx="1" fill="${col[1]}" opacity=".9"/>`;
      g += `<path d="M${52 + dx} ${top + 6} q9 -5 14 -2 q-8 3 -14 6z" fill="${col[2]}"/><path d="M${48 + dx} ${top + 14} q-9 -5 -14 -2 q8 3 14 6z" fill="${col[0]}"/></g>`;
    });
    return svgWrap(g);
  }
  g += `<g transform="${tx(0, 0)}"><path d="M47 88 L48.5 58 L51.5 58 L53 88 Z" fill="${trunk}"/>`;
  if (sp === 'pine') {
    g += `<path d="M50 14 L68 44 L32 44 Z" fill="${col[1]}"/><path d="M50 28 L74 62 L26 62 Z" fill="${col[0]}"/><path d="M50 44 L78 78 L22 78 Z" fill="${col[2]}"/>`;
  } else {
    const droop = W ? 6 : 0;
    g += `<circle cx="38" cy="${50 + droop}" r="16" fill="${col[1]}"/><circle cx="62" cy="${50 + droop}" r="16" fill="${col[1]}"/><circle cx="50" cy="${36 + droop}" r="20" fill="${col[0]}"/><circle cx="44" cy="${30 + droop}" r="8" fill="${col[2]}" opacity=".8"/>`;
    if ((sp === 'cherry' || sp === 'jacaranda') && !W && s > 0.85) g += [[36, 46], [60, 40], [50, 26], [66, 54], [42, 56]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.2" fill="#fff" opacity=".9"/>`).join('');
    if (sp === 'oak' && !W && s > 0.95) g += [[40, 44], [58, 36], [64, 52]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.4" fill="#E51837"/>`).join('');
  }
  g += '</g>';
  if (W) g += `<path d="M30 80 l6 -3 M68 79 l-5 -4" stroke="#7E6C53" stroke-width="2" stroke-linecap="round"/>`;
  return svgWrap(g);
}
const svgWrap = inner => `<svg viewBox="0 0 100 100" aria-hidden="true">${inner}</svg>`;

/* ================= backend wiring ================= */
function hasFirebase() { const c = (window.GROVE_CONFIG || {}).firebase || {}; return !!(c.apiKey && c.projectId && !String(c.apiKey).includes('PASTE')); }
async function bootData() {
  DB = hasFirebase() ? FirebaseDB(window.GROVE_CONFIG.firebase) : DemoDB();
  try {
    await DB.init(u => {
      S.user = u; UI.booting = false;
      if (u) {
        DB.watchProfile(p => {
          S.profileLoaded = true;
          S.settings = Object.assign(clone(DEFAULT_SETTINGS), p && p.settings ? p.settings : {});
          S.settings.pomo = Object.assign(clone(DEFAULT_SETTINGS.pomo), S.settings.pomo || {});
          if (!S.settings.name && u.name) S.settings.name = u.name;
          if (!p) { DB.saveProfile({ name: u.name || '', email: u.email || '', photo: u.photo || '', settings: S.settings, createdAt: Date.now() }).catch(() => { }); }
          render();
        });
        DB.watchList('tasks', a => { S.tasks = a; render(); });
        DB.watchList('entries', a => { S.entries = a; render(); });
        DB.watchList('sessions', a => { S.sessions = a; render(); });
        DB.watchMyGroups(a => {
          const had = new Set(S.groups.map(g => g.id));
          S.groups = a.sort((x, y) => (x.createdAt || 0) - (y.createdAt || 0));
          if (!UI.group || !S.groups.some(g => g.id === UI.group)) UI.group = S.groups[0] ? S.groups[0].id : null;
          S.groups.forEach(g => { if (!had.has(g.id)) watchGroup(g.id); });
          render();
          const j = pendingJoin(); if (j) joinFlow(j);
        });
      } else { S.tasks = []; S.entries = []; S.sessions = []; S.groups = []; S.profileLoaded = false; }
      render();
    });
  } catch (e) { UI.booting = false; UI.err = 'Could not start: ' + (e.message || e); render(); }
}
function watchGroup(code) { DB.watchGroupDays(code, addDays(today(), -60), a => { S.gdays[code] = a; if (UI.page === 'groups') render(); }); }
const meInfo = () => ({ name: S.settings.name || (S.user && S.user.name) || 'Member', photo: (S.user && S.user.photo) || '' });
function pushTotals(date) { const t = dayTotals(date); S.groups.forEach(g => DB.pushDay(g.id, date, t).catch(e => console.warn(e))); }
function backfill(code) { const since = addDays(today(), -30); const ds = new Set(S.sessions.filter(s => s.date >= since).map(s => s.date)); ds.add(today()); ds.forEach(d => DB.pushDay(code, d, dayTotals(d)).catch(() => { })); }
function saveSettings(patch) { S.settings = Object.assign({}, S.settings, patch); render(); return DB.saveProfile({ settings: S.settings, name: S.settings.name }).catch(e => toast('Not saved: ' + e.message)); }
function pendingJoin() { try { const u = new URL(location.href); const c = u.searchParams.get('join'); return c ? c.toUpperCase() : (sessionStorage.getItem('grove_join') || ''); } catch (e) { return ''; } }
function clearJoin() { try { sessionStorage.removeItem('grove_join'); const u = new URL(location.href); if (u.searchParams.has('join')) { u.searchParams.delete('join'); history.replaceState(null, '', u.pathname + u.search + u.hash); } } catch (e) { } }

/* ================= timer (focus + tree) ================= */
const TK = 'grove_timer_v1';
const T = { s: null, actx: null };
function tLoad() { try { T.s = JSON.parse(localStorage.getItem(TK) || 'null'); } catch (e) { } T.s = Object.assign({ phase: 'idle', mode: 'pomo', dur: 25, running: false, startedAt: 0, acc: 0, cycle: 0, cat: '', taskId: '', sessStart: 0 }, T.s || {}); }
function tSave() { try { localStorage.setItem(TK, JSON.stringify(T.s)); } catch (e) { } }
const tEl = () => T.s.acc + (T.s.running ? Date.now() - T.s.startedAt : 0);
function tLen() { const p = S.settings.pomo; if (T.s.phase === 'break') return ((T.s.cycle % p.every === 0) ? p.long : p.short) * 60000; return T.s.dur * 60000; }
function audio() { try { if (!T.actx) T.actx = new (window.AudioContext || window.webkitAudioContext)(); if (T.actx.state === 'suspended') T.actx.resume(); } catch (e) { } }
function chime(n) { const c = T.actx; if (!c) return; try { [523, 659, 784, 1047].slice(0, n).forEach((f, i) => { const o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.value = f; o.connect(g); g.connect(c.destination); const t = c.currentTime + i * .18; g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.25, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + .5); o.start(t); o.stop(t + .55); }); } catch (e) { } }
function notify(title, body) { try { if (document.hidden && 'Notification' in window && Notification.permission === 'granted') new Notification(title, { body, icon: 'icons/icon-192.png' }); } catch (e) { } }
function tStart() {
  audio(); try { if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission(); } catch (e) { }
  if (T.s.phase === 'idle') { T.s.phase = 'focus'; T.s.acc = 0; T.s.sessStart = Date.now(); T.s.tree = S.settings.tree; }
  if (!T.s.running) { T.s.running = true; T.s.startedAt = Date.now(); }
  tSave(); render();
}
function tPause() { if (!T.s.running) return; T.s.acc += Date.now() - T.s.startedAt; T.s.running = false; tSave(); render(); }
function tReset() { Object.assign(T.s, { phase: 'idle', running: false, acc: 0, startedAt: 0, sessStart: 0 }); tSave(); }
function saveSession(ms, ok, endAt) {
  const start = T.s.sessStart || (endAt - ms), mins = Math.round(ms / 60000 * 10) / 10;
  if (mins < 1) return null;
  const s = { id: 's' + uid(), date: ymd(new Date(start)), start: new Date(start).toISOString(), mins, category: T.s.cat || '', taskId: T.s.taskId || '', tree: T.s.tree || S.settings.tree, ok: !!ok, mode: T.s.mode };
  S.sessions = S.sessions.concat([s]);
  DB.put('sessions', s).catch(e => toast('Not saved: ' + e.message));
  pushTotals(s.date);
  if (s.taskId) { const t = S.tasks.find(x => x.id === s.taskId); if (t && t.status === 'Not Started') saveTask({ ...t, status: 'In Progress' }); }
  return s;
}
function tGiveUp() {
  const ms = tEl();
  const s = T.s.phase === 'focus' ? saveSession(ms, false, Date.now()) : null;
  tReset(); render();
  toast(s ? `Tree withered 🥀 — but ${hm(s.mins)} still counts as study time` : 'Focus cancelled');
}
function tick() {
  if (!T.s) return;
  if (T.s.running && T.s.phase !== 'idle') {
    const L = tLen();
    if (tEl() >= L) {
      const hit = T.s.startedAt + (L - T.s.acc);
      if (T.s.phase === 'focus') {
        const s = saveSession(L, true, hit);
        chime(4); notify('🌳 Tree planted!', `${hm(L / 60000)} of focus done. Take a break.`);
        T.s.cycle++;
        if (T.s.mode === 'pomo') { Object.assign(T.s, { phase: 'break', acc: 0, startedAt: hit, running: S.settings.pomo.auto !== false, sessStart: 0 }); }
        else tReset();
        tSave(); render();
        if (s) celebrate();
      } else {
        chime(2); notify('Break over', 'Ready to grow the next tree?');
        Object.assign(T.s, { phase: 'idle', acc: 0, running: false, startedAt: 0 }); tSave(); render();
        toast('Break over — plant your next tree 🌱');
      }
    }
  }
  paintTimer();
}
function paintTimer() {
  const active = T.s.phase !== 'idle';
  const L = active ? tLen() : T.s.dur * 60000, el = active ? tEl() : 0, left = Math.max(0, L - el), fr = L ? el / L : 0;
  const disp = `${pad(Math.floor(left / 60000))}:${pad(Math.floor(left % 60000 / 1000))}`;
  const d = $('#tdisp'); if (d) d.textContent = disp;
  const arc = $('#tarc'); if (arc) arc.style.strokeDashoffset = String(arc.dataset.c * (1 - fr));
  const tr = $('#ttree'); if (tr && T.s.phase === 'focus') { const stage = Math.floor(fr * 40); if (tr.dataset.st !== String(stage)) { tr.dataset.st = String(stage); tr.innerHTML = treeSVG(T.s.tree || S.settings.tree, fr, false); } }
  const chip = $('#tchip'); if (chip) { chip.classList.toggle('on', active && UI.page !== 'focus'); chip.innerHTML = `${ic(T.s.phase === 'break' ? 'clock' : 'tree')} ${disp}`; }
  document.title = active ? `${disp} · ${T.s.phase === 'break' ? 'Break' : 'Focus'} — Grove` : 'Grove';
}
function celebrate() { const el = $('#ttree'); if (el) { el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); } toast('🌳 Tree planted! Great focus.'); }

/* ================= writes ================= */
function saveTask(t) { t.updatedAt = Date.now(); const i = S.tasks.findIndex(x => x.id === t.id); if (i >= 0) S.tasks[i] = t; else S.tasks.push(t); render(); return DB.put('tasks', t).catch(e => toast('Not saved: ' + e.message)); }
function delTask(id) { S.tasks = S.tasks.filter(x => x.id !== id); render(); return DB.del('tasks', id).catch(() => { }); }
function saveEntry(e) { const i = S.entries.findIndex(x => x.id === e.id); if (i >= 0) S.entries[i] = e; else S.entries.push(e); render(); return DB.put('entries', e).catch(er => toast('Not saved: ' + er.message)); }
function delEntry(id) { S.entries = S.entries.filter(x => x.id !== id); render(); return DB.del('entries', id).catch(() => { }); }
function delSession(id) { const s = S.sessions.find(x => x.id === id); S.sessions = S.sessions.filter(x => x.id !== id); render(); DB.del('sessions', id).catch(() => { }); if (s) pushTotals(s.date); return s; }

/* ================= small UI parts ================= */
const avatar = (name, photo, cls) => `<span class="avatar ${cls || ''}">${photo ? `<img src="${esc(photo)}" alt="" referrerpolicy="no-referrer">` : esc(initials(name))}</span>`;
const priChip = p => { const x = PRI[p] || PRI.Medium; return `<span class="chip ${x.c}">${x.e} ${esc(p || 'Medium')}</span>`; };
const staChip = t => { const s = statusOf(t); if (s === 'Overdue') return `<span class="chip r">⏳ Overdue</span>`; const x = STA[s] || STA['Not Started']; return `<span class="chip ${x.c}">${x.e} ${esc(s)}</span>`; };
const empty = (icon, title, text, btn) => `<div class="empty"><div class="ei">${ic(icon)}</div><b>${title}</b>${text || ''}${btn || ''}</div>`;
const ph = (title, sub, right) => `<div class="ph"><div><h1>${title}</h1>${sub ? `<p>${sub}</p>` : ''}</div><span class="sp"></span>${right || ''}</div>`;
function ring(val, max, size, stroke, col, inner) {
  const r = (size - stroke) / 2, C = 2 * Math.PI * r, fr = max ? Math.min(1, val / max) : 0;
  return `<svg class="ring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="rgba(255,255,255,.15)" stroke-width="${stroke}"/>${fr > 0 ? `<circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${col}" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${C * fr} ${C}" transform="rotate(-90 ${size / 2} ${size / 2})"/>` : ''}${inner || ''}</svg>`;
}
function taskItem(t) {
  const done = t.done || t.status === 'Completed';
  return `<div class="it ${done ? 'done' : ''}"><button class="ck ${done ? 'on' : ''}" data-act="t-done" data-id="${esc(t.id)}" aria-label="Mark done">${done ? '✓' : ''}</button>
   <div class="b" data-act="t-edit" data-id="${esc(t.id)}"><div class="t">${esc(t.title)}</div>
   <div class="m">${priChip(t.priority)}${staChip(t)}${t.category ? `<span class="chip v">${esc(t.category)}</span>` : ''}${t.delegate && t.delegate !== 'Me' ? `<span class="chip">🚧 ${esc(t.delegate)}</span>` : ''}${t.due ? `<span class="chip ${isOverdue(t) ? 'r' : t.due === today() ? 'd' : ''}">${ic('flag')} ${fmtS(t.due)}</span>` : ''}</div></div></div>`;
}

/* ================= render ================= */
function render() {
  const a = document.activeElement, aid = a && a.id, sel = a && a.selectionStart;
  renderChrome();
  const v = $('#view');
  if (UI.err) v.innerHTML = `<div class="card">${esc(UI.err)}</div>`;
  else if (UI.booting) v.innerHTML = `<div class="loading">Starting Grove…</div>`;
  else if (!S.user) v.innerHTML = viewWelcome();
  else if (!S.profileLoaded) v.innerHTML = `<div class="loading">Loading your data…</div>`;
  else v.innerHTML = demoBanner() + ({ home: viewHome, tasks: viewTasks, focus: viewFocus, calendar: viewCalendar, groups: viewGroups, forest: viewForest, settings: viewSettings }[UI.page] || viewHome)();
  if (aid) { const n = document.getElementById(aid); if (n) { n.focus(); try { if (sel != null) n.setSelectionRange(sel, sel); } catch (e) { } } }
  paintTimer();
}
function demoBanner() { return DB && DB.mode === 'demo' ? `<div class="banner warn">${ic('alert')}<span style="flex:1"><b>Demo mode</b> — data stays on this device and group friends are sample people. Add your Firebase keys in <b>config.js</b> to sync accounts and compare with real friends.</span></div>` : ''; }
function renderChrome() {
  const signed = !!S.user;
  $('#side').innerHTML = `<div class="brand"><span class="mk">${ic('tree')}</span><div>Grove<small>Grow your focus, together</small></div></div>
   ${signed ? `<nav>${PAGES.map(([id, i, l]) => `<button class="${UI.page === id ? 'on' : ''}" data-act="go" data-id="${id}">${ic(i)} ${l}</button>`).join('')}</nav>
   <button class="cta" data-act="go" data-id="focus">${ic('play')} Start focus</button><div class="grow"></div>
   <div class="me" data-act="go" data-id="settings">${avatar(S.settings.name || S.user.name, S.user.photo)}<div><b>${esc(S.settings.name || S.user.name || 'You')}</b><small>${esc(S.user.email || '')}</small></div></div>` : ''}`;
  $('#top').innerHTML = `<div class="brand"><span class="mk">${ic('tree')}</span><div>Grove</div></div>
   ${signed ? `<div class="greet"><b>${greet()}${firstName() ? ', ' + esc(firstName()) : ''} 👋</b><small>${DOW[new Date().getDay()]}, ${fmtD(today())}</small></div>
   <span id="tchip" class="timer-chip" data-act="go" data-id="focus"></span>
   <button class="icon-btn m-only" data-act="go" data-id="forest" aria-label="My forest">${ic('forest')}</button>
   <span data-act="go" data-id="settings" title="Settings">${avatar(S.settings.name || S.user.name, S.user.photo)}</span>` : ''}`;
  const nav = [['home', 'home', 'Home'], ['tasks', 'tasks', 'Tasks'], ['focus', 'tree', 'Focus'], ['calendar', 'cal', 'Calendar'], ['groups', 'group', 'Groups']];
  $('#bnav').innerHTML = signed ? nav.map(([id, i, l]) => id === 'focus' ? `<button class="focus-btn ${UI.page === id ? 'on' : ''}" data-act="go" data-id="focus" aria-label="Focus"><span class="ring">${ic('tree')}</span>Focus</button>` : `<button class="${UI.page === id ? 'on' : ''}" data-act="go" data-id="${id}">${ic(i)}<span>${l}</span></button>`).join('') : '';
  $('#bnav').style.display = signed ? '' : 'none';
}

/* ---------- welcome ---------- */
function viewWelcome() {
  return `<div class="welcome"><div class="card wcard">
   <div class="wart"><div><div class="brand" style="color:#fff"><span class="mk">${ic('tree')}</span><div>Grove</div></div></div>
    <h1>Plan your goals.<br>Grow a <em>forest</em> of focus.<br>Study together.</h1>
    <div class="trees">${['oak', 'pine', 'cherry', 'jacaranda', 'maple'].map(s => treeSVG(s, 1, false, { full: true })).join('')}</div></div>
   <div class="wform"><h2 style="margin:0;font-size:22px">Welcome 👋</h2>
    <p class="ink2" style="margin:0">Tasks, calendar and dashboard for your study goals — plus a Pomodoro timer that grows a tree every time you focus, and groups to compare daily hours with friends.</p>
    <button class="gbtn" data-act="signin">${ic('user')} Continue with Google</button>
    ${UI.authErr ? `<div class="small" style="color:var(--bad);font-weight:700">${esc(UI.authErr)}</div>` : ''}
    <div class="feat"><div>${ic('devices')}<span>Same Google account on phone & laptop = same data, synced live.</span></div>
     <div>${ic('group')}<span>Make a group with friends and compare study hours every day.</span></div>
     <div>${ic('lock')}<span>Friends only see your daily hours and trees — never your tasks.</span></div></div>
    ${installHint()}</div></div></div>`;
}

/* ---------- home / dashboard ---------- */
function viewHome() {
  const t = today(), m = dayMins(t), g = goalMins(t), tm = dayTotals(t), st = streak();
  const ws = weekStartOf(t), we = addDays(ws, 6), wm = rangeMins(ws, we), wg = rangeGoal(ws, we);
  const open = S.tasks.filter(x => !(x.done || x.status === 'Completed' || x.status === 'Cancelled'));
  const todays = open.filter(x => x.due === t), tom = open.filter(x => x.due === addDays(t, 1)), od = S.tasks.filter(isOverdue).sort((a, b) => a.due < b.due ? -1 : 1);
  const done = S.tasks.filter(x => x.done || x.status === 'Completed').length;
  const weekBars = [...dates(ws, we)].map(d => { const mm = dayMins(d), gg = goalMins(d), h = gg ? Math.min(1, mm / gg) : (mm ? 1 : 0); const ok = gg > 0 && mm >= gg; return `<div data-tip="${fmtD(d)}: ${hm(mm)} of ${hm(gg)}"><span><i style="height:${h * 100}%;background:${ok ? '#3FBF74' : d <= t ? '#FF5A6E' : 'rgba(255,255,255,.25)'}"></i><em>${mm ? hrs(mm) : ''}</em></span>${DOW[parse(d).getDay()][0]}</div>`; }).join('');
  const by = (arr, key, list) => list.map(k => [k, arr.filter(x => key(x) === k).length]).filter(x => x[1] > 0);
  const bars = (rows, colorFn) => { const mx = Math.max(1, ...rows.map(r => r[1])); return rows.length ? `<div class="hb">${rows.map(([k, n], i) => `<span>${esc(k)}</span><div class="tr"><i style="width:${n / mx * 100}%;background:${colorFn(k, i)}"></i></div><span class="n">${n}</span>`).join('')}</div>` : `<div class="small muted">No tasks yet.</div>`; };
  const priRows = by(open, x => x.priority || 'Medium', PRIORITIES.map(p => p[0]));
  const staRows = by(S.tasks, statusOf, ['Overdue'].concat(STATUSES.map(s => s[0])));
  const catRows = by(open, x => x.category || 'Uncategorised', [...new Set(open.map(x => x.category || 'Uncategorised'))]).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const whoRows = by(open, x => x.delegate || 'Me', [...new Set(open.map(x => x.delegate || 'Me'))]);
  const priCol = k => ({ Now: '#E51837', 'Very High': '#C8102E', High: '#F08A3C', Medium: '#F5B43C', Low: '#2E9E5B' }[k] || '#7C46F1');
  const staCol = k => ({ Overdue: '#E51837', 'Not Started': '#8B8FA3', 'In Progress': '#1077DA', Delegated: '#F5B43C', Completed: '#2E9E5B', Cancelled: '#C9C4D6' }[k] || '#7C46F1');
  const list = UI.homeList === 'today' ? todays : tom;
  const q = QUOTES[new Date().getDate() % QUOTES.length];
  let gsnip = '';
  if (S.groups.length) {
    const gr = S.groups.find(x => x.id === UI.group) || S.groups[0], rows = groupBoard(gr, t, t);
    const myPos = rows.findIndex(r => r.uid === S.user.uid) + 1;
    gsnip = `<div class="card"><h3>${ic('trophy')} ${esc(gr.name)} · today<span class="sp"></span><button class="btn sm ghost" data-act="go" data-id="groups">Open ${ic('right')}</button></h3><div class="lb">${rows.slice(0, 3).map((r, i) => lbRow(r, i, gr, 'today')).join('')}</div>${myPos > 3 ? `<div class="small muted" style="margin-top:6px">You're #${myPos} today</div>` : ''}</div>`;
  } else gsnip = `<div class="card">${empty('group', 'Study with friends', 'Create a group and compare daily hours.', `<button class="btn pri sm" data-act="go" data-id="groups">${ic('plus')} Start a group</button>`)}</div>`;
  return `
  <div class="grid g21" style="margin-bottom:16px">
   <div class="card hero"><h3>${ic('target')} Today's focus goal<span class="sp"></span><span class="sub">${g ? hm(Math.max(0, g - m)) + ' to go' : 'Rest day'}</span></h3>
    <div class="hero-in">${ring(m, g || 1, 138, 12, m >= g && g ? '#3FBF74' : '#FF5A6E', `<text x="69" y="66" text-anchor="middle" font-size="22" font-weight="800">${hm(m)}</text><text x="69" y="86" text-anchor="middle" font-size="11.5" font-weight="600" fill="rgba(255,255,255,.75)">of ${hm(g)}</text>`)}
     <div style="flex:1;min-width:200px"><div class="stats"><div class="stat"><b>${tm.trees}</b><span>🌳 trees today</span></div><div class="stat"><b>${st}</b><span>🔥 day streak</span></div><div class="stat"><b>${hrs(wm)}h</b><span>this week / ${hrs(wg)}h</span></div></div>
      <div class="row" style="margin-top:14px"><button class="btn red" data-act="go" data-id="focus">${ic('play')} Start focus</button><button class="btn" data-act="log-time">${ic('plus')} Log time</button></div></div></div>
    <div class="week">${weekBars}</div></div>
   ${gsnip}
  </div>
  <div class="kpis">
   <div class="kpi k-violet"><div class="ki">${ic('list')}</div><div><b>${open.length}</b><span>Open tasks</span></div></div>
   <div class="kpi k-denim"><div class="ki">${ic('cal')}</div><div><b>${todays.length}</b><span>Due today</span></div></div>
   <div class="kpi k-red"><div class="ki">${ic('alert')}</div><div><b>${od.length}</b><span>Overdue</span></div></div>
   <div class="kpi k-leaf"><div class="ki">${ic('check')}</div><div><b>${done}</b><span>Completed</span></div></div>
  </div>
  <div class="grid g2" style="margin-bottom:16px">
   <div class="card"><h3>${ic('cal')} ${UI.homeList === 'today' ? "Today's" : "Tomorrow's"} tasks<span class="sp"></span><span class="seg"><button class="${UI.homeList === 'today' ? 'on' : ''}" data-act="home-list" data-id="today">Today</button><button class="${UI.homeList === 'tom' ? 'on' : ''}" data-act="home-list" data-id="tom">Tomorrow</button></span></h3>
    <div class="list">${list.length ? list.map(taskItem).join('') : empty('check', UI.homeList === 'today' ? 'Nothing due today 🎉' : 'Nothing due tomorrow', '', `<button class="btn sm" data-act="t-new">${ic('plus')} Add task</button>`)}</div></div>
   <div class="card"><h3>${ic('alert')} Overdue<span class="sp"></span><span class="sub">${od.length}</span></h3>
    <div class="list">${od.length ? od.slice(0, 6).map(taskItem).join('') + (od.length > 6 ? `<button class="btn sm ghost" data-act="go-overdue">See all ${od.length}</button>` : '') : empty('check', 'Nothing overdue', 'You are on top of things.')}</div></div>
  </div>
  <div class="grid g2" style="margin-bottom:16px">
   <div class="card"><h3>${ic('flag')} By priority <span class="sub">open tasks</span></h3>${bars(priRows, priCol)}</div>
   <div class="card"><h3>${ic('bolt')} By status</h3>${bars(staRows, staCol)}</div>
   <div class="card"><h3>${ic('note')} By category <span class="sub">open tasks</span></h3>${bars(catRows, (k, i) => MEMBER_COLORS[i % MEMBER_COLORS.length])}</div>
   <div class="card"><h3>${ic('user')} Delegated to <span class="sub">open tasks</span></h3>${bars(whoRows, () => '#1077DA')}</div>
  </div>
  <div class="card"><div class="quote">“${esc(q[0])}” — ${esc(q[1])}</div></div>`;
}

/* ---------- tasks ---------- */
function filterTasks() {
  const f = UI.tf;
  return S.tasks.filter(t => {
    const s = statusOf(t);
    if (f.status === 'open' && (t.done || t.status === 'Completed' || t.status === 'Cancelled')) return false;
    if (f.status !== 'open' && f.status !== 'all' && s !== f.status) return false;
    if (f.pri !== 'all' && (t.priority || 'Medium') !== f.pri) return false;
    if (f.cat !== 'all' && (t.category || '') !== f.cat) return false;
    if (f.who !== 'all' && (t.delegate || 'Me') !== f.who) return false;
    if (f.q && !(t.title + ' ' + (t.description || '')).toLowerCase().includes(f.q.toLowerCase())) return false;
    return true;
  }).sort((a, b) => ((a.done || a.status === 'Completed') - (b.done || b.status === 'Completed')) || ((PRI[a.priority] || PRI.Medium).o - (PRI[b.priority] || PRI.Medium).o) || ((a.due || '9999') < (b.due || '9999') ? -1 : 1));
}
function viewTasks() {
  const f = UI.tf, list = filterTasks(), s = S.settings;
  const filters = `<div class="toolbar">
   <input id="tq" data-in="tq" placeholder="Search tasks…" value="${esc(f.q)}" style="flex:2 1 180px">
   <select data-ch="tf-status"><option value="open" ${f.status === 'open' ? 'selected' : ''}>Open tasks</option><option value="all" ${f.status === 'all' ? 'selected' : ''}>All</option><option ${f.status === 'Overdue' ? 'selected' : ''}>Overdue</option>${STATUSES.map(x => `<option ${f.status === x[0] ? 'selected' : ''}>${x[0]}</option>`).join('')}</select>
   <select data-ch="tf-pri"><option value="all">All priorities</option>${PRIORITIES.map(p => `<option ${f.pri === p[0] ? 'selected' : ''}>${p[0]}</option>`).join('')}</select>
   <select data-ch="tf-cat"><option value="all">All categories</option>${s.categories.map(c => `<option ${f.cat === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select>
   <select data-ch="tf-who"><option value="all">Anyone</option>${s.delegates.map(c => `<option ${f.who === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select></div>`;
  let body;
  if (UI.taskView === 'board') {
    const cols = ['Overdue', 'Not Started', 'In Progress', 'Delegated', 'Completed'];
    const all = S.tasks.filter(t => (f.pri === 'all' || t.priority === f.pri) && (f.cat === 'all' || t.category === f.cat) && (f.who === 'all' || (t.delegate || 'Me') === f.who) && (!f.q || t.title.toLowerCase().includes(f.q.toLowerCase())));
    body = `<div class="board">${cols.map(c => { const items = all.filter(t => statusOf(t) === c || (c === 'Completed' && t.done && statusOf(t) !== 'Overdue')); return `<div class="col"><h4>${c === 'Overdue' ? '⏳' : STA[c].e} ${c}<span class="sp"></span><span class="chip">${items.length}</span></h4>${items.map(t => `<div class="tcard ${c === 'Overdue' ? 'od' : ''}" data-act="t-edit" data-id="${esc(t.id)}"><div class="t">${esc(t.title)}</div><div class="m">${priChip(t.priority)}${t.category ? `<span class="chip v">${esc(t.category)}</span>` : ''}${t.due ? `<span class="chip">${fmtS(t.due)}</span>` : ''}</div></div>`).join('') || '<div class="small muted" style="padding:6px">—</div>'}</div>`; }).join('')}</div>`;
  } else body = `<div class="card"><div class="list">${list.length ? list.map(taskItem).join('') : empty('tasks', S.tasks.length ? 'No tasks match' : 'Plan your first task', S.tasks.length ? 'Try clearing a filter.' : 'Example: “Internal Security PYQ answer writing” — due date, priority and category.', S.tasks.length ? '' : `<button class="btn pri" data-act="t-new">${ic('plus')} New task</button>`)}</div></div>`;
  return ph('Tasks', 'Your task tracker — tick the box when a task is done.', `<span class="seg"><button class="${UI.taskView === 'list' ? 'on' : ''}" data-act="t-view" data-id="list">${ic('list')} List</button><button class="${UI.taskView === 'board' ? 'on' : ''}" data-act="t-view" data-id="board">${ic('board')} Board</button></span><button class="btn pri" data-act="t-new">${ic('plus')} New task</button>`) + filters + body + `<button class="fab" data-act="t-new" aria-label="New task">${ic('plus')}</button>`;
}
function taskForm(t) {
  const s = S.settings, isNew = !t.id;
  openModal(`<h2>${isNew ? 'New task' : 'Edit task'}</h2>
  <label>Task<input id="f-title" value="${esc(t.title || '')}" placeholder="e.g. Internal Security Mains syllabus coverage"></label>
  <div class="fr"><label>Due date<input type="date" id="f-due" value="${esc(t.due || '')}"></label>
   <label>Priority<select id="f-pri">${PRIORITIES.map(p => `<option value="${p[0]}" ${(t.priority || 'Medium') === p[0] ? 'selected' : ''}>${p[1]} ${p[0]}</option>`).join('')}</select></label>
   <label>Status<select id="f-sta">${STATUSES.map(p => `<option value="${p[0]}" ${(t.status || 'Not Started') === p[0] ? 'selected' : ''}>${p[1]} ${p[0]}</option>`).join('')}</select></label>
   <label>Category<select id="f-cat"><option value="">—</option>${s.categories.map(c => `<option ${t.category === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select></label></div>
  <label>Delegate to<select id="f-who">${s.delegates.map(c => `<option ${(t.delegate || 'Me') === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select></label>
  <label>Description<textarea id="f-desc" placeholder="Optional details">${esc(t.description || '')}</textarea></label>
  <div class="row"><button class="btn pri" data-act="t-save" data-id="${esc(t.id || '')}">Save</button><button class="btn" data-act="close">Cancel</button><span class="sp"></span>${isNew ? '' : `<button class="btn danger" data-act="t-del" data-id="${esc(t.id)}">Delete</button>`}</div>`);
  setTimeout(() => { const e = $('#f-title'); if (e && isNew) e.focus(); }, 60);
}

/* ---------- calendar ---------- */
function viewCalendar() {
  if (!UI.cal) { const d = new Date(); UI.cal = { y: d.getFullYear(), m: d.getMonth() }; }
  const { y, m } = UI.cal, s = S.settings, ws = s.weekStart, t = today();
  const first = new Date(y, m, 1), lead = (first.getDay() - ws + 7) % 7, start = ymd(new Date(y, m, 1 - lead));
  const hide = new Set(s.hideStatuses || []);
  const vis = S.tasks.filter(x => x.due && !hide.has(x.done ? 'Completed' : x.status));
  const cells = [];
  for (let i = 0; i < 42; i++) {
    const d = addDays(start, i), dd = parse(d), out = dd.getMonth() !== m;
    if (i >= 35 && out && dd.getDate() > 7) break;
    const items = vis.filter(x => x.due === d).map(x => `<span class="ev ${isOverdue(x) ? 'od' : (x.done || x.status === 'Completed') ? 'dn' : ''}" title="${esc(x.title)}">${PRI[x.priority]?.e || ''} ${esc(x.title)}</span>`)
      .concat(S.entries.filter(e => e.date === d).map(e => `<span class="ev e" title="${esc(e.title)}">• ${esc(e.title)}</span>`));
    const fm = dayMins(d);
    cells.push(`<div class="d ${out ? 'out' : ''} ${d === t ? 'today' : ''}" data-act="cal-day" data-id="${d}"><div class="n">${dd.getDate()}</div>${items.slice(0, 3).join('')}${items.length > 3 ? `<span class="small muted">+${items.length - 3} more</span>` : ''}${fm ? `<div class="fm">🌳 ${hm(fm)}</div>` : ''}</div>`);
  }
  const hdr = [0, 1, 2, 3, 4, 5, 6].map(i => `<div class="h">${DOW[(i + ws) % 7]}</div>`).join('');
  const todayItems = S.tasks.filter(x => x.due === t && !(x.done || x.status === 'Completed')).concat(S.entries.filter(e => e.date === t));
  const monthEntries = S.entries.filter(e => e.date && e.date.slice(0, 7) === `${y}-${pad(m + 1)}`).sort((a, b) => a.date < b.date ? -1 : 1);
  return ph('Calendar', 'Tasks by due date and your other entries. Tap a day to add something.', `<button class="icon-btn" data-act="cal-nav" data-id="-1" aria-label="Previous month">${ic('left')}</button><b style="min-width:140px;text-align:center;font-size:16px">${MONTHS[m]} ${y}</b><button class="icon-btn" data-act="cal-nav" data-id="1" aria-label="Next month">${ic('right')}</button><button class="btn sm" data-act="cal-today">Today</button>`) + `
  <div class="grid g21">
   <div class="card" style="padding:12px"><div class="calgrid">${hdr}${cells.join('')}</div>
    <div class="row small" style="margin-top:10px;gap:14px"><span><span class="chip v">Task</span></span><span><span class="chip d">Entry</span></span><span><span class="chip r">Overdue</span></span><span class="muted">Hidden: ${esc([...hide].join(', ') || 'none')} · change in Settings</span></div></div>
   <div>
    <div class="card" style="margin-bottom:16px"><h3>${ic('target')} Today's summary</h3><div class="list">${todayItems.length ? todayItems.map(x => x.due ? taskItem(x) : `<div class="it"><button class="ck ${x.done ? 'on' : ''}" data-act="e-done" data-id="${esc(x.id)}">${x.done ? '✓' : ''}</button><div class="b" data-act="e-edit" data-id="${esc(x.id)}"><div class="t">${esc(x.title)}</div><div class="m"><span class="chip d">Entry</span></div></div></div>`).join('') : `<div class="small muted">Enjoy your day! Nothing scheduled.</div>`}</div></div>
    <div class="card"><h3>${ic('note')} Other entries · ${MON[m]}<span class="sp"></span><button class="btn sm" data-act="e-new">${ic('plus')} Add</button></h3>
     <div class="list">${monthEntries.length ? monthEntries.map(e => `<div class="it ${e.done ? 'done' : ''}"><button class="ck ${e.done ? 'on' : ''}" data-act="e-done" data-id="${esc(e.id)}">${e.done ? '✓' : ''}</button><div class="b" data-act="e-edit" data-id="${esc(e.id)}"><div class="t">${esc(e.title)}</div><div class="m"><span class="chip d">${fmtS(e.date)}</span></div></div></div>`).join('') : `<div class="small muted">Birthdays, test dates, reminders — anything that isn't a task.</div>`}</div></div>
   </div></div>`;
}
function entryForm(e) {
  openModal(`<h2>${e.id ? 'Edit entry' : 'New entry'}</h2><label>What<input id="e-title" value="${esc(e.title || '')}" placeholder="e.g. Prelims mock test"></label><label>Date<input type="date" id="e-date" value="${esc(e.date || today())}"></label>
  <div class="row"><button class="btn pri" data-act="e-save" data-id="${esc(e.id || '')}">Save</button><button class="btn" data-act="close">Cancel</button><span class="sp"></span>${e.id ? `<button class="btn danger" data-act="e-del" data-id="${esc(e.id)}">Delete</button>` : ''}</div>`);
}

/* ---------- focus ---------- */
function viewFocus() {
  const s = T.s, p = S.settings.pomo, active = s.phase !== 'idle', tc = treeCount();
  const L = active ? tLen() : s.dur * 60000, fr = active ? tEl() / L : 0;
  const R = 46, C = 2 * Math.PI * R;
  const open = S.tasks.filter(x => !(x.done || x.status === 'Completed' || x.status === 'Cancelled'));
  const sp = active ? s.tree : S.settings.tree;
  const phase = s.phase === 'focus' ? (s.running ? 'Growing your tree… stay focused' : 'Paused — your tree is waiting') : s.phase === 'break' ? (s.cycle % p.every === 0 ? 'Long break — stretch, hydrate' : 'Short break') : 'Pick a time and plant a tree';
  const todayTrees = S.sessions.filter(x => x.date === today() && x.tree).sort((a, b) => a.start < b.start ? -1 : 1);
  let btns;
  if (!active) btns = `<button class="btn red lg" data-act="f-start">${ic('play')} Plant & start</button>`;
  else if (s.phase === 'break') btns = `<button class="btn pri lg" data-act="f-skip">Skip break</button>`;
  else btns = `${s.running ? `<button class="btn lg" data-act="f-pause">${ic('pause')} Pause</button>` : `<button class="btn red lg" data-act="f-start">${ic('play')} Resume</button>`}<button class="btn lg danger" data-act="f-giveup">Give up</button>`;
  return `<div class="focus-wrap">
   <div class="seg" style="margin-bottom:8px"><button class="${s.mode === 'pomo' ? 'on' : ''}" data-act="f-mode" data-id="pomo" ${active ? 'disabled' : ''}>Pomodoro</button><button class="${s.mode === 'single' ? 'on' : ''}" data-act="f-mode" data-id="single" ${active ? 'disabled' : ''}>Single session</button></div>
   <div class="timer-ring"><svg class="rg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="${R}" fill="none" stroke="var(--line)" stroke-width="3.5"/><circle id="tarc" data-c="${C}" cx="50" cy="50" r="${R}" fill="none" stroke="${s.phase === 'break' ? 'var(--denim)' : 'var(--leaf)'}" stroke-width="4" stroke-linecap="round" stroke-dasharray="${C}" style="stroke-dashoffset:${C * (1 - fr)};transition:stroke-dashoffset .5s linear"/></svg>
    <div class="tree" id="ttree" data-st="-1">${s.phase === 'break' ? treeSVG(sp, 1, false, { full: true }) : treeSVG(sp, active ? fr : 0.5, false, active ? null : { full: true })}</div></div>
   <div class="tdisp" id="tdisp">--:--</div><div class="tphase">${phase}</div>
   ${active ? '' : `<div class="durs">${[15, 25, 45, 60, 90, 120].map(m => `<button class="${s.dur === m ? 'on' : ''}" data-act="f-dur" data-id="${m}">${m}m</button>`).join('')}</div>
    <div class="species">${SPECIES.map(x => `<button class="${S.settings.tree === x.id ? 'on' : ''}" data-act="f-tree" data-id="${x.id}" ${tc < x.need ? 'disabled' : ''} title="${tc < x.need ? 'Unlocks at ' + x.need + ' trees' : x.name}">${treeSVG(x.id, 1, false, { full: true })}${x.name}${tc < x.need ? `<small>🔒 ${x.need} trees</small>` : ''}</button>`).join('')}</div>`}
   <div class="fr" style="max-width:460px;margin:12px auto 0;text-align:left">
    <label>Category<select data-ch="f-cat" ${active ? 'disabled' : ''}><option value="">— Choose —</option>${S.settings.categories.map(c => `<option ${s.cat === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select></label>
    <label>Task (optional)<select data-ch="f-task" ${active ? 'disabled' : ''}><option value="">— None —</option>${open.map(t => `<option value="${esc(t.id)}" ${s.taskId === t.id ? 'selected' : ''}>${esc(t.title)}</option>`).join('')}</select></label></div>
   <div class="row" style="justify-content:center;margin:6px 0 18px">${btns}</div>
   <div class="card" style="text-align:left"><h3>${ic('forest')} Today's trees<span class="sp"></span><span class="sub">${todayTrees.filter(x => x.ok).length} grown · ${hm(dayMins(today()))} focused</span></h3>
    ${todayTrees.length ? `<div class="plot" style="min-height:0">${todayTrees.map(x => `<div class="tr" data-t="${hm(x.mins)}" data-tip="${esc((x.category || 'Focus') + ' · ' + hm(x.mins))}">${treeSVG(x.tree, 1, !x.ok, { full: true })}</div>`).join('')}</div>` : `<div class="small muted">Your first tree today is one focus session away.</div>`}
    <div class="small muted" style="margin-top:10px">Keep this screen open while focusing. “Give up” withers the tree but your minutes still count. ${p.focus !== s.dur ? '' : ''}</div></div>
  </div>`;
}

/* ---------- forest ---------- */
function forestRange() {
  const r = UI.forest.range, a = UI.forest.anchor;
  if (r === 'day') return [a, a, fmtD(a)];
  if (r === 'week') { const s = weekStartOf(a); return [s, addDays(s, 6), `${fmtS(s)} – ${fmtS(addDays(s, 6))}`]; }
  if (r === 'month') { const d = parse(a); return [ymd(new Date(d.getFullYear(), d.getMonth(), 1)), ymd(new Date(d.getFullYear(), d.getMonth() + 1, 0)), `${MONTHS[d.getMonth()]} ${d.getFullYear()}`]; }
  const y = a.slice(0, 4); return [`${y}-01-01`, `${y}-12-31`, y];
}
function viewForest() {
  const [a, b, label] = forestRange();
  const ss = S.sessions.filter(s => s.date >= a && s.date <= b).sort((x, y) => (x.start || x.date) < (y.start || y.date) ? -1 : 1);
  const trees = ss.filter(s => s.tree), ok = trees.filter(s => s.ok).length, wd = trees.length - ok, mins = ss.reduce((x, s) => x + (+s.mins || 0), 0);
  const byCat = {}; ss.forEach(s => { const k = s.category || 'Uncategorised'; byCat[k] = (byCat[k] || 0) + (+s.mins || 0); });
  const rows = Object.entries(byCat).sort((x, y) => y[1] - x[1]); const mx = rows.length ? rows[0][1] : 1;
  const total = treeCount(), next = SPECIES.find(x => x.need > total);
  return ph('My Forest', 'Every focus session grows a tree. Give up and it withers.', `<span class="seg">${['day', 'week', 'month', 'year'].map(r => `<button class="${UI.forest.range === r ? 'on' : ''}" data-act="fo-range" data-id="${r}">${r[0].toUpperCase() + r.slice(1)}</button>`).join('')}</span>`) + `
  <div class="row" style="margin-bottom:12px"><button class="icon-btn" data-act="fo-nav" data-id="-1" aria-label="Previous">${ic('left')}</button><b style="font-size:16px">${label}</b><button class="icon-btn" data-act="fo-nav" data-id="1" aria-label="Next">${ic('right')}</button></div>
  <div class="kpis">
   <div class="kpi k-leaf"><div class="ki">${ic('tree')}</div><div><b>${ok}</b><span>Trees grown</span></div></div>
   <div class="kpi k-gold"><div class="ki">🥀</div><div><b>${wd}</b><span>Withered</span></div></div>
   <div class="kpi k-violet"><div class="ki">${ic('clock')}</div><div><b>${hm(mins)}</b><span>Focus time</span></div></div>
   <div class="kpi k-denim"><div class="ki">${ic('forest')}</div><div><b>${total}</b><span>All-time trees</span></div></div>
  </div>
  <div class="card" style="margin-bottom:16px"><div class="plot">${trees.length ? trees.map(s => `<div class="tr" data-t="${fmtS(s.date)}" data-tip="${esc(fmtS(s.date) + ' · ' + (s.category || 'Focus') + ' · ' + hm(s.mins) + (s.ok ? '' : ' · withered'))}">${treeSVG(s.tree, 1, !s.ok, { full: true })}</div>`).join('') : `<div class="none">🌱 No trees here yet.<br><button class="btn red" style="margin-top:12px" data-act="go" data-id="focus">${ic('play')} Plant one now</button></div>`}</div>
   ${next ? `<div class="small muted" style="margin-top:10px">🔓 ${next.need - total} more tree${next.need - total === 1 ? '' : 's'} to unlock <b>${next.name}</b>.</div>` : ''}</div>
  <div class="card"><h3>${ic('note')} Focus by category</h3>${rows.length ? `<div class="hb">${rows.map(([k, v], i) => `<span>${esc(k)}</span><div class="tr"><i style="width:${v / mx * 100}%;background:${MEMBER_COLORS[i % MEMBER_COLORS.length]}"></i></div><span class="n">${hrs(v)}h</span>`).join('')}</div>` : '<div class="small muted">No focus time in this period.</div>'}</div>`;
}

/* ---------- groups ---------- */
function groupBoard(g, a, b) {
  const days = (S.gdays[g.id] || []).filter(d => d.date >= a && d.date <= b && (g.members || []).includes(d.uid));
  return (g.members || []).map(u => {
    const mine = days.filter(d => d.uid === u);
    let mins = mine.reduce((x, d) => x + (+d.mins || 0), 0), trees = mine.reduce((x, d) => x + (+d.trees || 0), 0);
    if (u === S.user.uid) { mins = rangeMins(a, b); trees = S.sessions.filter(s => s.date >= a && s.date <= b && s.tree && s.ok).length; }
    const info = (g.info || {})[u] || {};
    return { uid: u, name: info.name || 'Member', photo: info.photo || '', mins, trees };
  }).sort((x, y) => y.mins - x.mins);
}
function lbRow(r, i, g, range) {
  range = range || UI.gRange; const goal = (g.goalHrs || 4) * 60, me = r.uid === S.user.uid;
  return `<div class="r ${me ? 'me' : ''}"><span class="pos">${i + 1}</span>${avatar(r.name, r.photo)}<div class="nm"><b>${esc(r.name)}${me ? ' (you)' : ''}</b><small>🌳 ${r.trees} trees</small></div><div class="hrs">${hrs(r.mins)}h<small>${range === 'today' ? (r.mins >= goal ? '✓ goal met' : hm(goal - r.mins) + ' to goal') : 'studied'}</small></div></div>`;
}
function viewGroups() {
  if (!S.groups.length) return ph('Groups', 'Study with friends. Compare daily hours and keep each other going.') + `
   <div class="grid g2"><div class="card">${empty('group', 'Create a study group', 'You get an invite code to share with your friends.', `<button class="btn pri" data-act="g-create">${ic('plus')} Create group</button>`)}</div>
   <div class="card">${empty('share', 'Join a friend’s group', 'Ask them for their 6-character code.', `<button class="btn" data-act="g-join">Enter code</button>`)}</div></div>
   <div class="card" style="margin-top:16px"><div class="small ink2">${ic('lock')} Friends only see your <b>daily study hours and number of trees</b>. Your tasks, calendar and notes stay private.</div></div>`;
  const g = S.groups.find(x => x.id === UI.group) || S.groups[0], t = today();
  const R = UI.gRange, ws = weekStartOf(t);
  const [a, b] = R === 'today' ? [t, t] : R === 'week' ? [ws, addDays(ws, 6)] : [t.slice(0, 8) + '01', ymd(new Date(+t.slice(0, 4), +t.slice(5, 7), 0))];
  const rows = groupBoard(g, a, b), goal = (g.goalHrs || 4) * 60;
  const members = (g.members || []).map((u, i) => ({ uid: u, name: ((g.info || {})[u] || {}).name || 'Member', color: MEMBER_COLORS[i % MEMBER_COLORS.length] }));
  const last7 = [...dates(addDays(t, -6), t)];
  const val = (u, d) => u === S.user.uid ? dayMins(d) : ((S.gdays[g.id] || []).find(x => x.uid === u && x.date === d) || {}).mins || 0;
  const mx = Math.max(goal, ...last7.flatMap(d => members.map(m => val(m.uid, d))), 60);
  const step = mx > 480 ? 180 : mx > 240 ? 120 : 60, top = Math.ceil(mx / step) * step;
  const gl = []; for (let v = step; v <= top; v += step) gl.push(`<div class="gl" style="bottom:${v / top * 100}%"><b>${v / 60}h</b></div>`);
  const chart = `<div class="gchart">${gl.join('')}<div class="goal" style="bottom:${goal / top * 100}%"><b>goal ${goal / 60}h</b></div>${last7.map(d => `<div class="day">${members.map(m => { const v = val(m.uid, d); return `<i style="height:${v / top * 100}%;background:${m.color}" data-tip="${esc(m.name)} · ${fmtS(d)} · ${hm(v)}"></i>`; }).join('')}</div>`).join('')}</div>
   <div class="gx">${last7.map(d => `<span>${DOW[parse(d).getDay()].slice(0, 2)}<br>${parse(d).getDate()}</span>`).join('')}</div>
   <div class="legend">${members.map(m => `<span><i style="background:${m.color}"></i>${esc(m.name)}${m.uid === S.user.uid ? ' (you)' : ''}</span>`).join('')}</div>`;
  const tbl = `<div class="tw"><table><tr><th>Day</th>${members.map(m => `<th class="n">${esc(m.name.split(' ')[0])}</th>`).join('')}</tr>${last7.slice().reverse().map(d => { const vals = members.map(m => val(m.uid, d)), best = Math.max(...vals); return `<tr><td>${DOW[parse(d).getDay()]} ${fmtS(d)}</td>${vals.map(v => `<td class="n ${v >= goal ? 'hit' : d < t ? 'miss' : ''}">${v ? hrs(v) + 'h' : '–'}${v && v === best && best > 0 ? ' 👑' : ''}</td>`).join('')}</tr>`; }).join('')}</table></div>`;
  const owner = g.owner === S.user.uid;
  const totalTrees = rows.reduce((x, r) => x + r.trees, 0);
  return ph('Groups', 'Compare study hours with your friends.', `<button class="btn" data-act="g-join">Join</button><button class="btn pri" data-act="g-create">${ic('plus')} New group</button>`) + `
  <div class="gtabs">${S.groups.map(x => `<button class="gtab ${x.id === g.id ? 'on' : ''}" data-act="g-sel" data-id="${esc(x.id)}">${ic('group')} ${esc(x.name)} <span class="chip">${(x.members || []).length}</span></button>`).join('')}</div>
  <div class="grid g12" style="margin-bottom:16px">
   <div class="card"><h3>${ic('trophy')} Leaderboard<span class="sp"></span><span class="seg">${[['today', 'Today'], ['week', 'Week'], ['month', 'Month']].map(([k, l]) => `<button class="${R === k ? 'on' : ''}" data-act="g-range" data-id="${k}">${l}</button>`).join('')}</span></h3>
    <div class="lb">${rows.map((r, i) => lbRow(r, i, g)).join('')}</div>
    <div class="small muted" style="margin-top:10px">🌳 ${totalTrees} trees grown together ${R === 'today' ? 'today' : R === 'week' ? 'this week' : 'this month'}</div></div>
   <div class="card"><h3>${ic('bolt')} Daily hours — last 7 days</h3>${chart}</div>
  </div>
  <div class="grid g21">
   <div class="card"><h3>${ic('cal')} Day-by-day comparison<span class="sp"></span><span class="sub">green = met group goal</span></h3>${tbl}</div>
   <div class="card"><h3>${ic('share')} Invite friends</h3><div class="code">${esc(g.id)}</div>
    <div class="small ink2" style="margin:10px 0">Friends open the app, tap <b>Groups → Join</b> and enter this code — or send them the link.</div>
    <div class="row"><button class="btn pri block" data-act="g-share" data-id="${esc(g.id)}">${ic('share')} Share invite link</button></div>
    <hr style="border:0;border-top:1px solid var(--line);margin:16px 0">
    <div class="row"><span class="small ink2" style="flex:1">Daily group goal: <b>${g.goalHrs || 4}h</b></span>${owner ? `<button class="btn sm" data-act="g-edit" data-id="${esc(g.id)}">${ic('edit')} Edit</button>` : ''}</div>
    <div class="row" style="margin-top:12px">${owner ? `<button class="btn sm danger" data-act="g-delete" data-id="${esc(g.id)}">Delete group</button>` : `<button class="btn sm danger" data-act="g-leave" data-id="${esc(g.id)}">Leave group</button>`}</div></div>
  </div>`;
}

/* ---------- settings ---------- */
function viewSettings() {
  const s = S.settings;
  const WK = [1, 2, 3, 4, 5, 6, 0];
  return ph('Settings', 'Make Grove yours.', `<button class="btn pri" data-act="set-save">Save changes</button>`) + `
  <div class="grid g2">
   <div class="card"><h3>${ic('user')} Profile</h3>
    <div class="row" style="margin-bottom:14px">${avatar(s.name || S.user.name, S.user.photo, 'lg')}<div><b>${esc(S.user.email || '')}</b><div class="small muted">${DB.mode === 'demo' ? 'Demo mode — this device only' : 'Signed in with Google'}</div></div></div>
    <label>Display name (shown to your groups)<input id="s-name" value="${esc(s.name || '')}"></label>
    <label>Week starts on<select id="s-ws"><option value="1" ${s.weekStart === 1 ? 'selected' : ''}>Monday</option><option value="0" ${s.weekStart === 0 ? 'selected' : ''}>Sunday</option></select></label></div>
   <div class="card"><h3>${ic('target')} Daily study goal (hours)</h3>
    <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px">${WK.map(i => `<label style="margin:0;text-align:center">${DOW[i]}<input type="number" inputmode="decimal" min="0" max="16" step="0.5" class="s-wk" data-d="${i}" value="${+s.weekHrs[i] || 0}" style="text-align:center;padding:9px 2px;font-weight:800"></label>`).join('')}</div>
    <div class="row" style="margin-top:12px"><span class="small ink2">Same every day:</span><input type="number" id="s-same" min="0" max="16" step="0.5" style="width:90px" placeholder="hrs"><button class="btn sm" data-act="s-same">Apply</button></div>
    <div class="small muted" style="margin-top:8px">0 = rest day. Weekly goal: <b id="s-wsum">${s.weekHrs.reduce((a, b) => a + (+b || 0), 0)}h</b></div></div>
   <div class="card"><h3>${ic('note')} Categories / projects <span class="sub">one per line, up to 30</span></h3><textarea id="s-cats" rows="8">${esc(s.categories.join('\n'))}</textarea></div>
   <div class="card"><h3>${ic('user')} Delegate to <span class="sub">one per line</span></h3><textarea id="s-who" rows="4">${esc(s.delegates.join('\n'))}</textarea>
    <h3 style="margin-top:14px">${ic('cal')} Hide on calendar</h3><div class="row">${STATUSES.map(x => `<label style="margin:0;display:flex;gap:6px;align-items:center;font-weight:600"><input type="checkbox" class="s-hide" value="${x[0]}" ${(s.hideStatuses || []).includes(x[0]) ? 'checked' : ''} style="width:auto;min-height:0;margin:0">${x[1]} ${x[0]}</label>`).join('')}</div></div>
   <div class="card"><h3>${ic('clock')} Pomodoro</h3><div class="fr">
    <label>Focus (min)<input type="number" id="s-pf" min="5" max="180" value="${s.pomo.focus}"></label><label>Short break (min)<input type="number" id="s-ps" min="1" value="${s.pomo.short}"></label>
    <label>Long break (min)<input type="number" id="s-pl" min="1" value="${s.pomo.long}"></label><label>Long break every<input type="number" id="s-pe" min="1" value="${s.pomo.every}"></label></div>
    <label style="display:flex;gap:8px;align-items:center;font-weight:600"><input type="checkbox" id="s-pa" ${s.pomo.auto !== false ? 'checked' : ''} style="width:auto;min-height:0;margin:0"> Start breaks automatically</label></div>
   <div class="card"><h3>${ic('devices')} App</h3><div style="margin-bottom:12px">${installHint(true)}</div>
    <div class="small muted" style="margin-bottom:12px">Grove v${APP_VERSION} · ${DB.mode === 'demo' ? 'Demo mode' : 'Synced with your Google account'}</div>
    <button class="btn danger" data-act="signout">${ic('logout')} Sign out</button></div>
  </div>
  <div class="row" style="margin:16px 0 24px"><button class="btn pri lg" data-act="set-save">Save changes</button></div>`;
}

/* ---------- install ---------- */
let installEvt = null;
const standalone = () => { try { return matchMedia('(display-mode: standalone)').matches || navigator.standalone === true; } catch (e) { return false; } };
function installHint(card) {
  if (standalone()) return `<div class="small" style="color:var(--good);font-weight:700">✓ Installed on this device</div>`;
  if (installEvt) return `<button class="btn ${card ? '' : 'block'}" data-act="install">${ic('download')} Install app</button>`;
  if (/iphone|ipad|ipod/i.test(navigator.userAgent)) return `<div class="small muted">iPhone: Safari → Share → <b>Add to Home Screen</b></div>`;
  return `<div class="small muted">Install: browser menu ⋮ → <b>Install app</b> / <b>Add to Home screen</b></div>`;
}

/* ================= modals / toast / tooltip ================= */
function openModal(h) { $('#modal').innerHTML = `<div class="ov" data-act="ov"><div class="modal" role="dialog" aria-modal="true">${h}</div></div>`; }
function closeModal() { $('#modal').innerHTML = ''; }
function confirmBox(msg, yes) { return new Promise(res => { openModal(`<h2>${esc(msg)}</h2><div class="row"><button class="btn danger" id="cy">${esc(yes || 'Delete')}</button><button class="btn" id="cn">Cancel</button></div>`); $('#cy').onclick = () => { closeModal(); res(true); }; $('#cn').onclick = () => { closeModal(); res(false); }; }); }
let toastT; function toast(m, undo) { const t = $('#toast'); t.innerHTML = ''; const sp = document.createElement('span'); sp.textContent = m; t.appendChild(sp); if (undo) { const b = document.createElement('button'); b.textContent = 'Undo'; b.onclick = () => { t.style.display = 'none'; undo(); }; t.appendChild(b); } t.style.display = 'flex'; clearTimeout(toastT); toastT = setTimeout(() => t.style.display = 'none', undo ? 6000 : 3000); }
const tipEl = () => $('#tip');
document.addEventListener('pointerover', e => { const el = e.target.closest('[data-tip]'), t = tipEl(); if (!el) { t.style.display = 'none'; return; } t.textContent = el.dataset.tip; t.style.display = 'block'; posTip(e); });
document.addEventListener('pointermove', e => { const t = tipEl(); if (t.style.display === 'block') posTip(e); });
function posTip(e) { const t = tipEl(), w = t.offsetWidth, h = t.offsetHeight; let x = e.clientX + 12, y = e.clientY - h - 12; if (x + w > innerWidth - 6) x = e.clientX - w - 12; if (x < 6) x = 6; if (y < 6) y = e.clientY + 16; t.style.left = x + 'px'; t.style.top = y + 'px'; }

/* ================= group flows ================= */
async function joinFlow(code) {
  clearJoin();
  code = String(code).toUpperCase();
  if (S.groups.some(g => g.id === code)) { UI.group = code; UI.page = 'groups'; render(); return; }
  try { toast('Joining group…'); const c = await DB.joinGroup(code, meInfo()); UI.group = c; UI.page = 'groups'; render(); setTimeout(() => backfill(c), 800); toast('Joined! 🎉 Your daily hours now show in this group.'); }
  catch (e) { toast(e.message || 'Could not join'); }
}

/* ================= actions ================= */
const ACT = {
  go: (el, id) => { UI.page = id; closeModal(); try { history.replaceState(null, '', '#' + id); } catch (e) { } render(); scrollTo(0, 0); },
  ov: (el, id, e) => { if (e.target === el) closeModal(); }, close: () => closeModal(),
  signin: async () => { UI.authErr = ''; try { await DB.signIn(); } catch (e) { UI.authErr = (e && e.code === 'auth/unauthorized-domain') ? 'This website is not authorised in Firebase yet (Authentication → Settings → Authorized domains).' : (e && e.code === 'auth/popup-closed-by-user') ? 'Sign-in window closed. Try again.' : 'Sign-in failed: ' + ((e && (e.code || e.message)) || e); render(); } },
  signout: async () => { const ok = await confirmBox('Sign out of Grove on this device?', 'Sign out'); if (!ok) return; await DB.signOut(); UI.page = 'home'; render(); },
  install: async () => { if (!installEvt) return; installEvt.prompt(); try { await installEvt.userChoice; } catch (e) { } installEvt = null; render(); },
  'home-list': (el, id) => { UI.homeList = id; render(); },
  'go-overdue': () => { UI.tf.status = 'Overdue'; ACT.go(null, 'tasks'); },
  /* tasks */
  't-new': (el) => { const d = el && el.dataset.date; taskForm({ due: d || '', priority: 'Medium', status: 'Not Started', delegate: 'Me', category: UI.tf.cat !== 'all' ? UI.tf.cat : '' }); },
  't-edit': (el, id) => { const t = S.tasks.find(x => x.id === id); if (t) taskForm(clone(t)); },
  't-view': (el, id) => { UI.taskView = id; render(); },
  't-save': (el, id) => {
    const title = $('#f-title').value.trim(); if (!title) { toast('Give the task a name'); return; }
    const old = S.tasks.find(x => x.id === id), t = old ? clone(old) : { id: 't' + uid(), createdAt: Date.now() };
    Object.assign(t, { title, due: $('#f-due').value, priority: $('#f-pri').value, status: $('#f-sta').value, category: $('#f-cat').value, delegate: $('#f-who').value, description: $('#f-desc').value });
    t.done = t.status === 'Completed'; closeModal(); saveTask(t); toast(old ? 'Task updated' : 'Task added');
  },
  't-done': (el, id) => { const t = S.tasks.find(x => x.id === id); if (!t) return; const c = clone(t), was = c.done || c.status === 'Completed'; c.done = !was; c.status = was ? 'In Progress' : 'Completed'; c.completedAt = was ? '' : today(); saveTask(c); if (!was) toast('Done ✓ Nice work!'); },
  't-del': (el, id) => { const t = S.tasks.find(x => x.id === id); if (!t) return; closeModal(); delTask(id); toast('Task deleted', () => saveTask(t)); },
  /* calendar & entries */
  'cal-nav': (el, id) => { let { y, m } = UI.cal; m += +id; if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; } UI.cal = { y, m }; render(); },
  'cal-today': () => { const d = new Date(); UI.cal = { y: d.getFullYear(), m: d.getMonth() }; render(); },
  'cal-day': (el, id) => {
    const ts = S.tasks.filter(x => x.due === id), es = S.entries.filter(e => e.date === id), fm = dayMins(id);
    openModal(`<h2>${DOW[parse(id).getDay()]}, ${fmtD(id)}</h2>${fm ? `<div class="chip g" style="margin-bottom:10px">🌳 ${hm(fm)} focused</div>` : ''}<div class="list">${ts.map(taskItem).join('')}${es.map(e => `<div class="it"><button class="ck ${e.done ? 'on' : ''}" data-act="e-done" data-id="${esc(e.id)}">${e.done ? '✓' : ''}</button><div class="b" data-act="e-edit" data-id="${esc(e.id)}"><div class="t">${esc(e.title)}</div><div class="m"><span class="chip d">Entry</span></div></div></div>`).join('') || '<div class="small muted">Nothing on this day.</div>'}</div>
    <div class="row" style="margin-top:14px"><button class="btn pri" data-act="t-new" data-date="${id}">${ic('plus')} Task due this day</button><button class="btn" data-act="e-new" data-date="${id}">${ic('plus')} Entry</button></div>`);
  },
  'e-new': (el) => entryForm({ date: (el && el.dataset.date) || today() }),
  'e-edit': (el, id) => { const e = S.entries.find(x => x.id === id); if (e) entryForm(clone(e)); },
  'e-save': (el, id) => { const title = $('#e-title').value.trim(); if (!title) { toast('Add a title'); return; } const old = S.entries.find(x => x.id === id), e = old ? clone(old) : { id: 'e' + uid(), done: false }; e.title = title; e.date = $('#e-date').value || today(); closeModal(); saveEntry(e); },
  'e-done': (el, id) => { const e = S.entries.find(x => x.id === id); if (e) saveEntry({ ...e, done: !e.done }); },
  'e-del': (el, id) => { const e = S.entries.find(x => x.id === id); closeModal(); delEntry(id); if (e) toast('Entry deleted', () => saveEntry(e)); },
  /* focus */
  'f-start': () => tStart(),
  'f-pause': () => tPause(),
  'f-giveup': async () => { const ok = await confirmBox('Give up? Your tree will wither.', 'Give up'); if (ok) tGiveUp(); },
  'f-skip': () => { tReset(); render(); },
  'f-mode': (el, id) => { if (T.s.phase !== 'idle') return; T.s.mode = id; if (id === 'pomo') T.s.dur = S.settings.pomo.focus; tSave(); render(); },
  'f-dur': (el, id) => { if (T.s.phase !== 'idle') return; T.s.dur = +id; tSave(); render(); },
  'f-tree': (el, id) => { saveSettings({ tree: id }); },
  'log-time': () => openModal(`<h2>Log study time</h2><div class="small ink2" style="margin-bottom:12px">For study you did away from the timer. Logged time counts toward your goal and groups (no tree).</div>
    <div class="fr"><label>Date<input type="date" id="l-d" value="${today()}" max="${today()}"></label><label>Category<select id="l-c"><option value="">—</option>${S.settings.categories.map(c => `<option>${esc(c)}</option>`).join('')}</select></label>
    <label>Hours<input type="number" id="l-h" min="0" max="16" value="1"></label><label>Minutes<input type="number" id="l-m" min="0" max="59" step="5" value="0"></label></div>
    <div class="row"><button class="btn pri" data-act="log-save">Log time</button><button class="btn" data-act="close">Cancel</button></div>`),
  'log-save': () => { const mins = (+$('#l-h').value || 0) * 60 + (+$('#l-m').value || 0); if (mins <= 0) { toast('Enter some time'); return; } const s = { id: 's' + uid(), date: $('#l-d').value || today(), start: '', mins, category: $('#l-c').value, taskId: '', tree: '', ok: true, mode: 'manual' }; closeModal(); S.sessions = S.sessions.concat([s]); render(); DB.put('sessions', s).catch(e => toast('Not saved: ' + e.message)); pushTotals(s.date); toast(`Logged ${hm(mins)}`, () => delSession(s.id)); },
  /* forest */
  'fo-range': (el, id) => { UI.forest.range = id; render(); },
  'fo-nav': (el, id) => { const r = UI.forest.range, a = UI.forest.anchor, n = +id; let d = parse(a); if (r === 'day') d.setDate(d.getDate() + n); else if (r === 'week') d.setDate(d.getDate() + 7 * n); else if (r === 'month') d.setMonth(d.getMonth() + n); else d.setFullYear(d.getFullYear() + n); UI.forest.anchor = ymd(d); render(); },
  /* groups */
  'g-sel': (el, id) => { UI.group = id; render(); },
  'g-range': (el, id) => { UI.gRange = id; render(); },
  'g-create': () => openModal(`<h2>Create a study group</h2><label>Group name<input id="g-name" placeholder="e.g. UPSC 2028 Squad" maxlength="60"></label><label>Daily goal for everyone (hours)<input type="number" id="g-goal" min="1" max="16" step="0.5" value="4"></label><div class="row"><button class="btn pri" data-act="g-create-go">Create</button><button class="btn" data-act="close">Cancel</button></div>`),
  'g-create-go': async () => { const n = $('#g-name').value.trim(); if (!n) { toast('Name your group'); return; } const goal = Math.max(1, +$('#g-goal').value || 4); closeModal(); try { const c = await DB.createGroup(n, meInfo(), goal); UI.group = c; UI.page = 'groups'; render(); setTimeout(() => backfill(c), 800); openModal(`<h2>Group created 🎉</h2><p class="ink2">Share this code with your friends:</p><div class="code">${esc(c)}</div><div class="row" style="margin-top:14px"><button class="btn pri" data-act="g-share" data-id="${esc(c)}">${ic('share')} Share invite</button><button class="btn" data-act="close">Done</button></div>`); } catch (e) { toast(e.message || 'Could not create group'); } },
  'g-join': () => openModal(`<h2>Join a group</h2><label>Invite code<input id="g-code" maxlength="6" placeholder="ABC123" style="text-transform:uppercase;font-size:20px;font-weight:800;letter-spacing:4px;text-align:center"></label><div class="row"><button class="btn pri" data-act="g-join-go">Join</button><button class="btn" data-act="close">Cancel</button></div>`),
  'g-join-go': () => { const c = cleanCode($('#g-code').value); if (c.length !== 6) { toast('Enter the 6-character code'); return; } closeModal(); joinFlow(c); },
  'g-share': async (el, id) => { const g = S.groups.find(x => x.id === id); const url = location.origin + location.pathname + '?join=' + id; const text = `Join my study group "${g ? g.name : ''}" on Grove — code ${id}`; try { if (navigator.share) { await navigator.share({ title: 'Grove study group', text, url }); return; } } catch (e) { return; } try { await navigator.clipboard.writeText(text + '\n' + url); toast('Invite copied — paste it in WhatsApp'); } catch (e) { toast('Code: ' + id); } },
  'g-edit': (el, id) => { const g = S.groups.find(x => x.id === id); openModal(`<h2>Edit group</h2><label>Name<input id="ge-name" value="${esc(g.name)}" maxlength="60"></label><label>Daily goal (hours)<input type="number" id="ge-goal" min="1" max="16" step="0.5" value="${g.goalHrs || 4}"></label><div class="row"><button class="btn pri" data-act="g-edit-go" data-id="${esc(id)}">Save</button><button class="btn" data-act="close">Cancel</button></div>`); },
  'g-edit-go': (el, id) => { const name = $('#ge-name').value.trim() || 'Study group', goalHrs = Math.max(1, +$('#ge-goal').value || 4); closeModal(); DB.updateGroup(id, { name, goalHrs }).then(() => toast('Group updated')).catch(e => toast(e.message)); },
  'g-leave': async (el, id) => { const ok = await confirmBox('Leave this group? Your hours will no longer show there.', 'Leave'); if (!ok) return; try { await DB.leaveGroup(id); DB.unwatchGroupDays(id); toast('You left the group'); } catch (e) { toast(e.message); } },
  'g-delete': async (el, id) => { const ok = await confirmBox('Delete this group for everyone?', 'Delete group'); if (!ok) return; try { await DB.deleteGroup(id); DB.unwatchGroupDays(id); toast('Group deleted'); } catch (e) { toast(e.message); } },
  /* settings */
  's-same': () => { const v = $('#s-same').value; if (v === '') return; document.querySelectorAll('.s-wk').forEach(x => x.value = Math.max(0, +v || 0)); },
  'set-save': () => {
    const v = id => $('#' + id).value, lines = id => v(id).split('\n').map(x => x.trim()).filter(Boolean);
    const weekHrs = [0, 1, 2, 3, 4, 5, 6].map(i => { const el = document.querySelector(`.s-wk[data-d="${i}"]`); return Math.max(0, Math.min(16, +el.value || 0)); });
    const patch = { name: v('s-name').trim(), weekStart: +v('s-ws'), weekHrs, categories: lines('s-cats').slice(0, 30), delegates: lines('s-who').length ? lines('s-who') : ['Me'],
      hideStatuses: [...document.querySelectorAll('.s-hide:checked')].map(x => x.value), pomo: { focus: Math.max(5, +v('s-pf') || 25), short: Math.max(1, +v('s-ps') || 5), long: Math.max(1, +v('s-pl') || 15), every: Math.max(1, +v('s-pe') || 4), auto: $('#s-pa').checked } };
    const nameChanged = patch.name && patch.name !== S.settings.name;
    saveSettings(patch); if (T.s.phase === 'idle' && T.s.mode === 'pomo') { T.s.dur = patch.pomo.focus; tSave(); }
    if (nameChanged) S.groups.forEach(g => DB.updateMyInfo(g.id, meInfo()).catch(() => { }));
    toast('Settings saved ✓');
  }
};
const CH = {
  'tf-status': el => { UI.tf.status = el.value; render(); }, 'tf-pri': el => { UI.tf.pri = el.value; render(); }, 'tf-cat': el => { UI.tf.cat = el.value; render(); }, 'tf-who': el => { UI.tf.who = el.value; render(); },
  'f-cat': el => { T.s.cat = el.value; tSave(); }, 'f-task': el => { T.s.taskId = el.value; const t = S.tasks.find(x => x.id === el.value); if (t && t.category) T.s.cat = t.category; tSave(); render(); }
};
document.addEventListener('click', e => { const el = e.target.closest('[data-act]'); if (!el) return; if (el.disabled) return; const f = ACT[el.dataset.act]; if (f) { if (el.dataset.act !== 'ov') e.stopPropagation(); f(el, el.dataset.id, e); } });
document.addEventListener('change', e => { const el = e.target.closest('[data-ch]'); if (el && CH[el.dataset.ch]) CH[el.dataset.ch](el); });
let qT; document.addEventListener('input', e => { const el = e.target; if (el.dataset && el.dataset.in === 'tq') { clearTimeout(qT); qT = setTimeout(() => { UI.tf.q = el.value; render(); }, 200); } if (el.classList && el.classList.contains('s-wk')) { const s = [...document.querySelectorAll('.s-wk')].reduce((a, x) => a + (+x.value || 0), 0); const o = $('#s-wsum'); if (o) o.textContent = s + 'h'; } });
document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; render(); });
window.addEventListener('hashchange', () => { const h = location.hash.slice(1); if (PAGES.some(p => p[0] === h) && h !== UI.page) { UI.page = h; render(); } });

/* ================= boot ================= */
(function boot() {
  const h = location.hash.slice(1); if (PAGES.some(p => p[0] === h)) UI.page = h;
  try { const j = new URL(location.href).searchParams.get('join'); if (j) sessionStorage.setItem('grove_join', j.toUpperCase()); } catch (e) { }
  tLoad(); if (T.s.phase === 'idle' && !T.s.dur) T.s.dur = 25;
  render();
  setInterval(tick, 500);
  let lastDay = today(); setInterval(() => { if (today() !== lastDay) { lastDay = today(); render(); } }, 60000);
  bootData();
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').then(reg => {
      reg.addEventListener('updatefound', () => { const w = reg.installing; w && w.addEventListener('statechange', () => { if (w.state === 'installed' && navigator.serviceWorker.controller) toast('A new version is ready — reopen the app to update'); }); });
    }).catch(() => { });
  }
})();
