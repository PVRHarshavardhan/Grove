/* Grove — data layer.
 * Two interchangeable backends with the same interface:
 *   FirebaseDB  — Google sign-in + Cloud Firestore (sync across devices, groups)
 *   DemoDB      — everything in this browser (used when config.js has no Firebase keys)
 */
'use strict';
const FB_VER = '10.12.2';
const FB = `https://www.gstatic.com/firebasejs/${FB_VER}/`;

function lsGet(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
const rid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const newCode = () => Array.from({ length: 6 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('');
const cleanCode = c => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);

/* ---------------- Firebase backend ---------------- */
function FirebaseDB(cfg) {
  let app, auth, db, A, F, uid = null;
  const unsubs = {};
  const off = k => { if (unsubs[k]) { try { unsubs[k](); } catch (e) { } delete unsubs[k]; } };
  const api = {
    mode: 'firebase',
    async init(onUser) {
      const [appM, authM, fsM] = await Promise.all([import(FB + 'firebase-app.js'), import(FB + 'firebase-auth.js'), import(FB + 'firebase-firestore.js')]);
      A = authM; F = fsM;
      app = appM.initializeApp(cfg);
      auth = A.getAuth(app);
      try { db = F.initializeFirestore(app, { localCache: F.persistentLocalCache({ tabManager: F.persistentMultipleTabManager() }) }); }
      catch (e) { db = F.getFirestore(app); }
      try { await A.getRedirectResult(auth); } catch (e) { }
      A.onAuthStateChanged(auth, u => {
        uid = u ? u.uid : null;
        onUser(u ? { uid: u.uid, name: u.displayName || '', email: u.email || '', photo: u.photoURL || '' } : null);
      });
    },
    async signIn() {
      const p = new A.GoogleAuthProvider(); p.setCustomParameters({ prompt: 'select_account' });
      try { await A.signInWithPopup(auth, p); }
      catch (e) {
        if (e && (e.code === 'auth/popup-blocked' || e.code === 'auth/operation-not-supported-in-this-environment')) return A.signInWithRedirect(auth, p);
        throw e;
      }
    },
    async signOut() { Object.keys(unsubs).forEach(off); await A.signOut(auth); },
    /* profile + settings */
    watchProfile(cb) {
      off('profile');
      unsubs.profile = F.onSnapshot(F.doc(db, 'users', uid), s => cb(s.exists() ? s.data() : null), e => console.warn(e));
    },
    saveProfile(p) { return F.setDoc(F.doc(db, 'users', uid), p, { merge: true }); },
    /* simple per-user collections */
    watchList(name, cb) {
      off(name);
      unsubs[name] = F.onSnapshot(F.collection(db, 'users', uid, name), q => cb(q.docs.map(d => ({ ...d.data(), id: d.id }))), e => console.warn(e));
    },
    put(name, obj) { const { id, ...rest } = obj; return F.setDoc(F.doc(db, 'users', uid, name, id), rest); },
    del(name, id) { return F.deleteDoc(F.doc(db, 'users', uid, name, id)); },
    /* groups: the 6-character invite code is the group's document id */
    watchMyGroups(cb) {
      off('groups');
      const q = F.query(F.collection(db, 'groups'), F.where('members', 'array-contains', uid));
      unsubs.groups = F.onSnapshot(q, s => cb(s.docs.map(d => ({ ...d.data(), id: d.id }))), e => console.warn(e));
    },
    async createGroup(name, me, goalHrs) {
      for (let i = 0; i < 6; i++) {
        const code = newCode(), ref = F.doc(db, 'groups', code);
        const ex = await F.getDoc(ref).catch(() => null);
        if (ex && ex.exists()) continue;
        await F.setDoc(ref, { name, owner: uid, members: [uid], info: { [uid]: me }, goalHrs: goalHrs || 4, createdAt: Date.now() });
        return code;
      }
      throw new Error('Could not create a group code, try again');
    },
    async joinGroup(code, me) {
      code = cleanCode(code); const ref = F.doc(db, 'groups', code);
      const s = await F.getDoc(ref);
      if (!s.exists()) throw new Error('No group with code ' + code);
      const g = s.data();
      if ((g.members || []).includes(uid)) return code;
      if ((g.members || []).length >= 50) throw new Error('This group is full');
      await F.updateDoc(ref, { members: F.arrayUnion(uid), ['info.' + uid]: me });
      return code;
    },
    async leaveGroup(code) {
      const ref = F.doc(db, 'groups', code);
      await F.updateDoc(ref, { members: F.arrayRemove(uid), ['info.' + uid]: F.deleteField() });
    },
    updateGroup(code, patch) { return F.updateDoc(F.doc(db, 'groups', code), patch); },
    updateMyInfo(code, me) { return F.updateDoc(F.doc(db, 'groups', code), { ['info.' + uid]: me }); },
    deleteGroup(code) { return F.deleteDoc(F.doc(db, 'groups', code)); },
    watchGroupDays(code, since, cb) {
      off('gd_' + code);
      const q = F.query(F.collection(db, 'groups', code, 'days'), F.where('date', '>=', since));
      unsubs['gd_' + code] = F.onSnapshot(q, s => cb(s.docs.map(d => d.data())), e => console.warn(e));
    },
    unwatchGroupDays(code) { off('gd_' + code); },
    pushDay(code, date, t) {
      return F.setDoc(F.doc(db, 'groups', code, 'days', date + '_' + uid), { uid, date, mins: t.mins, trees: t.trees, withered: t.withered, updatedAt: Date.now() });
    },
    get uid() { return uid; }
  };
  return api;
}

/* ---------------- Demo backend (this device only) ---------------- */
function DemoDB() {
  const K = 'grove_demo_v1';
  let st = lsGet(K, null), uid = null, onUserCb = null;
  const watchers = {};
  const save = () => lsSet(K, st);
  const emit = n => { (watchers[n] || []).forEach(f => f()); };
  const fakeMembers = [['demo-ananya', 'Ananya', 4.2], ['demo-rahul', 'Rahul', 3.1]];
  function seedGroup(code, name) {
    const days = [];
    const t = new Date();
    for (let i = 0; i < 40; i++) {
      const d = new Date(t); d.setDate(d.getDate() - i);
      const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      fakeMembers.forEach(([u, , avg]) => {
        const m = Math.max(0, Math.round((avg + (Math.sin(i * 1.7 + u.length) * 1.8)) * 60 * (i === 0 ? 0.45 : 1)));
        days.push({ uid: u, date: ds, mins: m, trees: Math.floor(m / 30), withered: i % 6 === 0 ? 1 : 0 });
      });
    }
    st.groups[code] = { id: code, name, owner: uid, members: [uid].concat(fakeMembers.map(x => x[0])), goalHrs: 4, createdAt: Date.now(),
      info: Object.assign({ [uid]: st.me }, ...fakeMembers.map(([u, n]) => ({ [u]: { name: n, photo: '' } }))) };
    st.gdays[code] = days;
  }
  return {
    mode: 'demo',
    async init(onUser) { onUserCb = onUser; if (st && st.signedIn) { uid = 'demo-me'; onUser({ uid, name: st.me.name, email: 'demo@this-device', photo: '' }); } else onUser(null); },
    async signIn() {
      if (!st) st = { me: { name: 'You', photo: '' }, profile: null, tasks: {}, entries: {}, sessions: {}, groups: {}, gdays: {} };
      st.signedIn = true; uid = 'demo-me'; save();
      onUserCb({ uid, name: st.me.name, email: 'demo@this-device', photo: '' });
    },
    async signOut() { st.signedIn = false; save(); uid = null; onUserCb(null); },
    watchProfile(cb) { const f = () => cb(st.profile); (watchers.profile = [f]); setTimeout(f, 0); },
    async saveProfile(p) { st.profile = Object.assign({}, st.profile || {}, JSON.parse(JSON.stringify(p))); if (p.name) st.me.name = p.name; save(); emit('profile'); },
    watchList(n, cb) { const f = () => cb(Object.values(st[n] || {}).map(x => ({ ...x }))); watchers[n] = [f]; setTimeout(f, 0); },
    async put(n, o) { st[n] = st[n] || {}; st[n][o.id] = JSON.parse(JSON.stringify(o)); save(); emit(n); },
    async del(n, id) { delete st[n][id]; save(); emit(n); },
    watchMyGroups(cb) { const f = () => cb(Object.values(st.groups).filter(g => g.members.includes(uid)).map(g => JSON.parse(JSON.stringify(g)))); watchers.groups = [f]; setTimeout(f, 0); },
    async createGroup(name) { const c = newCode(); seedGroup(c, name); save(); emit('groups'); return c; },
    async joinGroup(code) { code = cleanCode(code); if (code.length < 6) throw new Error('Enter the 6-character code'); if (!st.groups[code]) seedGroup(code, 'Group ' + code); save(); emit('groups'); return code; },
    async leaveGroup(code) { delete st.groups[code]; delete st.gdays[code]; save(); emit('groups'); },
    async updateGroup(code, patch) { Object.assign(st.groups[code], patch); save(); emit('groups'); },
    async updateMyInfo(code, me) { st.groups[code].info[uid] = me; save(); emit('groups'); },
    async deleteGroup(code) { return this.leaveGroup(code); },
    watchGroupDays(code, since, cb) { const f = () => cb((st.gdays[code] || []).filter(d => d.date >= since)); watchers['gd_' + code] = [f]; setTimeout(f, 0); },
    unwatchGroupDays(code) { delete watchers['gd_' + code]; },
    async pushDay(code, date, t) { const a = st.gdays[code] = st.gdays[code] || []; const i = a.findIndex(d => d.uid === uid && d.date === date); const row = { uid, date, ...t }; if (i >= 0) a[i] = row; else a.push(row); save(); emit('gd_' + code); },
    get uid() { return uid; }
  };
}
