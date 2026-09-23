'use strict';

// ===================== 속성 =====================
const EL = [
  { id: 'fire',    name: '불',   emoji: '🔥', color: '#ff6b3d', adj: '화염',   noun: '살라맨더', face: '🦎' },
  { id: 'water',   name: '물',   emoji: '💧', color: '#3da5ff', adj: '물결',   noun: '거북',     face: '🐢' },
  { id: 'nature',  name: '자연', emoji: '🌿', color: '#4cd964', adj: '숲',     noun: '사슴',     face: '🦌' },
  { id: 'earth',   name: '땅',   emoji: '⛰️', color: '#b8864b', adj: '바위',   noun: '골렘',     face: '🗿' },
  { id: 'thunder', name: '번개', emoji: '⚡', color: '#ffd93d', adj: '번개',   noun: '매',       face: '🦅' },
  { id: 'ice',     name: '얼음', emoji: '❄️', color: '#9be7ff', adj: '서리',   noun: '펭귄',     face: '🐧' },
  { id: 'dark',    name: '어둠', emoji: '🌑', color: '#7b5cff', adj: '그림자', noun: '박쥐',     face: '🦇' },
  { id: 'light',   name: '빛',   emoji: '✨', color: '#ffe98a', adj: '광휘',   noun: '유니콘',   face: '🦄' },
  { id: 'metal',   name: '금속', emoji: '⚙️', color: '#a8b2c1', adj: '강철',   noun: '로봇',     face: '🤖' },
  { id: 'magic',   name: '마법', emoji: '🔮', color: '#ff5ce1', adj: '비전',   noun: '고블린',   face: '👺' },
];
const ELI = Object.fromEntries(EL.map((e, i) => [e.id, i]));
const BASE = ['fire', 'water', 'nature', 'earth'];

// 상성: 키 속성이 배열 속성에게 강하다
const BEATS = {
  fire: ['nature', 'ice', 'metal'],
  water: ['fire', 'earth'],
  nature: ['water', 'earth'],
  earth: ['thunder', 'fire'],
  thunder: ['water', 'metal'],
  ice: ['nature', 'earth'],
  dark: ['light', 'magic'],
  light: ['dark', 'magic'],
  metal: ['ice', 'magic'],
  magic: ['nature', 'thunder'],
};

// ===================== 등급 =====================
const RAR_ORDER = ['common', 'rare', 'epic', 'legendary', 'mythic'];
const RAR = {
  common:    { name: '커먼',     color: '#b4bccb', time: 5,   income: 1,   power: 10,  cost: 50 },
  rare:      { name: '레어',     color: '#5cb6ff', time: 15,  income: 3,   power: 25,  cost: 120 },
  epic:      { name: '에픽',     color: '#c28cff', time: 40,  income: 10,  power: 60,  cost: 300 },
  legendary: { name: '레전더리', color: '#ffb020', time: 90,  income: 40,  power: 150, cost: 800 },
  mythic:    { name: '신화',     color: '#ff4d6d', time: 180, income: 200, power: 400, cost: 2000 },
};

// ===================== 족보 =====================
// 기본 속성 두 개가 섞이면 확률로 상위 속성 몬스터(에픽)가 태어난다
const ADV_RECIPES = [
  { el: 'thunder', need: ['fire', 'water'] },
  { el: 'ice',     need: ['water', 'earth'] },
  { el: 'metal',   need: ['fire', 'earth'] },
  { el: 'light',   need: ['fire', 'nature'] },
  { el: 'dark',    need: ['earth', 'nature'] },
  { el: 'magic',   need: ['water', 'nature'] },
];
// 세 속성을 모두 품은 교배에서만 나오는 레전더리
const LEGENDS = [
  { id: 'L:phoenix', name: '피닉스 킹',     face: '🦚', els: ['fire', 'light', 'magic'] },
  { id: 'L:kraken',  name: '심해의 군주',   face: '🐙', els: ['water', 'ice', 'dark'] },
  { id: 'L:ent',     name: '세계수 수호자', face: '🌳', els: ['nature', 'earth', 'light'] },
  { id: 'L:titan',   name: '강철 타이탄',   face: '🦾', els: ['metal', 'thunder', 'earth'] },
  { id: 'L:dragon',  name: '그림자 용',     face: '🐉', els: ['dark', 'fire', 'magic'] },
  { id: 'L:yeti',    name: '서리 거인',     face: '🧊', els: ['ice', 'metal', 'water'] },
];
const MYTHIC = { id: 'M:arche', name: '태초의 신수 아르케', face: '🌌', els: ['magic', 'light', 'dark'] };

// ===================== 몬스터 카탈로그 =====================
const CAT = {};
const CAT_LIST = [];
function addMon(m) { CAT[m.id] = m; CAT_LIST.push(m); }

EL.forEach((e, i) => addMon({
  id: 'p:' + e.id, name: `${e.adj} ${e.noun}`, face: e.face, els: [e.id],
  rarity: i < 4 ? 'common' : 'epic',
}));
for (let i = 0; i < EL.length; i++) {
  for (let j = i + 1; j < EL.length; j++) {
    const a = EL[i], b = EL[j];
    addMon({
      id: `h:${a.id}+${b.id}`, name: `${a.adj} ${b.noun}`, face: b.face, els: [a.id, b.id],
      rarity: i < 4 && j < 4 ? 'rare' : 'epic',
    });
  }
}
LEGENDS.forEach(l => addMon({ ...l, rarity: 'legendary' }));
addMon({ ...MYTHIC, rarity: 'mythic' });
CAT_LIST.sort((a, b) => RAR_ORDER.indexOf(a.rarity) - RAR_ORDER.indexOf(b.rarity));

const hybridId = (x, y) => {
  const [a, b] = [x, y].sort((p, q) => ELI[p] - ELI[q]);
  return `h:${a}+${b}`;
};
const rIdx = (type) => RAR_ORDER.indexOf(CAT[type].rarity);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

function breedResult(ta, tb) {
  if (rIdx(ta) >= 3 && rIdx(tb) >= 3) {
    return Math.random() < 0.35 ? MYTHIC.id : pick([ta, tb]);
  }
  const pool = [...new Set([...CAT[ta].els, ...CAT[tb].els])];
  const has = (need) => need.every(e => pool.includes(e));
  for (const l of shuffle(LEGENDS)) if (has(l.els) && Math.random() < 0.25) return l.id;
  for (const r of shuffle(ADV_RECIPES)) if (has(r.need) && Math.random() < 0.3) return 'p:' + r.el;
  if (pool.length === 1 || Math.random() < 0.25) return 'p:' + pick(pool);
  const [x, y] = shuffle(pool);
  return hybridId(x, y);
}

// ===================== 상태 / 저장 =====================
const KEY = 'combining-save-v1';
const MAX_LV = 20;
const SECRET_CODE = '방탄유리';

function newState() {
  const s = {
    gold: 300, food: 50, infinite: false,
    monsters: [], nextUid: 1, dex: {},
    farmLv: 1, farmStore: 0,
    breed: null, stage: 1, team: [],
    last: Date.now(),
  };
  BASE.forEach(e => {
    s.monsters.push({ uid: s.nextUid++, type: 'p:' + e, lv: 1 });
    s.dex['p:' + e] = true;
  });
  return s;
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (!s || !Array.isArray(s.monsters)) return null;
    s.monsters = s.monsters.filter(m => CAT[m.type]);
    if (s.breed && !CAT[s.breed.type]) s.breed = null;
    return s;
  } catch (e) {
    return null;
  }
}

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* 저장 불가 환경 */ }
}

let S = load() || newState();

// ===================== 계산 =====================
const byUid = (uid) => S.monsters.find(m => m.uid === Number(uid));
const income = () => S.monsters.reduce((s, m) => s + RAR[CAT[m.type].rarity].income * m.lv, 0);
const power = (m) => Math.round(RAR[CAT[m.type].rarity].power * (1 + 0.35 * (m.lv - 1)));
const feedCost = (m) => m.lv * 10;
const sellPrice = (m) => RAR[CAT[m.type].rarity].income * m.lv * 25;
const farmRate = () => S.farmLv * 2;
const farmCap = () => S.farmLv * 150;
const farmUpCost = () => 150 * S.farmLv * S.farmLv;
const breedCost = (a, b) => RAR[RAR_ORDER[Math.max(rIdx(a.type), rIdx(b.type))]].cost;

function spend(cost) {
  if (S.infinite) return true;
  if (S.gold < cost) { toast('💰 골드가 부족해요'); return false; }
  S.gold -= cost;
  return true;
}
function earn(n) { if (!S.infinite) S.gold += n; }

function advantage(att, def) {
  let m = 1;
  if (att.some(a => def.some(d => BEATS[a].includes(d)))) m *= 1.5;
  if (def.some(d => att.some(a => BEATS[d].includes(a)))) m *= 0.7;
  return m;
}

// ===================== UI 도우미 =====================
const $ = (s) => document.querySelector(s);
const view = $('#view');
let tab = 'mons';
let sel = [];
let battle = null;
let breedDoneShown = false;

const fmt = (n) => Math.floor(n).toLocaleString('ko-KR');
const elBadges = (els) => els.map(e => EL[ELI[e]].emoji).join('');
function grad(c) {
  const cols = c.els.map(e => EL[ELI[e]].color);
  if (cols.length === 1) cols.push('#1a1a3d');
  return `linear-gradient(135deg, ${cols.join(', ')})`;
}
function mmss(sec) {
  sec = Math.max(0, Math.ceil(sec));
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function card(m, attrs = '', cls = '', extra = '') {
  const c = CAT[m.type], r = RAR[c.rarity];
  return `<div class="card r-${c.rarity} ${cls}" ${attrs}>
    ${extra}
    <div class="face" style="background:${grad(c)}">${c.face}</div>
    <div class="nm">${c.name}</div>
    <div class="meta"><span class="rar" style="color:${r.color}">${r.name}</span> · Lv.${m.lv}</div>
    <div class="els">${elBadges(c.els)}</div>
  </div>`;
}

function sortedMons() {
  return S.monsters.slice().sort((a, b) => rIdx(b.type) - rIdx(a.type) || b.lv - a.lv || a.uid - b.uid);
}

function showModal(html) {
  $('#modalBox').innerHTML = html;
  $('#modal').classList.remove('hidden');
}
function closeModal() {
  $('#modal').classList.add('hidden');
  $('#modalBox').innerHTML = '';
}

let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

// ===================== 화면: 내 몬스터 =====================
function renderMons() {
  view.innerHTML = `
    <div class="sec-head">
      <h2>내 몬스터 <small>${S.monsters.length}마리</small></h2>
      <p>몬스터는 가만히 있어도 골드를 벌어요. 누르면 먹이를 주거나 팔 수 있어요.</p>
    </div>
    <div class="grid">${sortedMons().map(m => card(m, `data-act="openMon" data-uid="${m.uid}"`)).join('')}</div>`;
}

function openMon(uid) {
  const m = byUid(uid);
  if (!m) return;
  const c = CAT[m.type], r = RAR[c.rarity];
  const max = m.lv >= MAX_LV;
  showModal(`
    <div class="face big" style="background:${grad(c)}">${c.face}</div>
    <h3>${c.name}</h3>
    <div class="rar" style="color:${r.color}">${r.name} · Lv.${m.lv}${max ? ' (MAX)' : ''}</div>
    <div class="els">${c.els.map(e => `${EL[ELI[e]].emoji} ${EL[ELI[e]].name}`).join(' · ')}</div>
    <div class="stats"><div>💰 초당 ${fmt(r.income * m.lv)}</div><div>⚔️ 전투력 ${fmt(power(m))}</div></div>
    <div class="row">
      <button class="btn" data-act="feed" data-uid="${m.uid}" ${max ? 'disabled' : ''}>🍅 먹이 주기 (${fmt(feedCost(m))})</button>
      <button class="btn ghost" data-act="sell" data-uid="${m.uid}">팔기 (+💰${fmt(sellPrice(m))})</button>
    </div>
    <button class="btn ghost small" data-act="close">닫기</button>`);
}

function feed(uid) {
  const m = byUid(uid);
  if (!m || m.lv >= MAX_LV) return;
  const cost = feedCost(m);
  if (S.food < cost) { toast('🍅 먹이가 부족해요. 농장에서 수확하세요!'); return; }
  S.food -= cost;
  m.lv++;
  save();
  openMon(uid);
  render();
}

function sell(uid) {
  const m = byUid(uid);
  if (!m) return;
  if (S.monsters.length <= 2) { toast('교배하려면 몬스터가 최소 2마리 필요해요'); return; }
  earn(sellPrice(m));
  S.monsters = S.monsters.filter(x => x.uid !== m.uid);
  S.team = S.team.filter(u => u !== m.uid);
  sel = sel.filter(u => u !== m.uid);
  save();
  closeModal();
  toast(`${CAT[m.type].name}을(를) 팔았어요`);
  render();
}

// ===================== 화면: 교배산 =====================
function breedHint(total) {
  if (total >= RAR.mythic.time) return '🌌 전설을 넘어선 무언가가 태어나려 해요!!!';
  if (total >= RAR.legendary.time) return '🌟 이렇게 긴 시간이라니… 레전더리 예감!!';
  if (total >= RAR.epic.time) return '⚡ 강한 기운이 느껴져요! 에픽급이에요!';
  if (total >= RAR.rare.time) return '오, 조금 특별한 기운이…';
  return '평범한 알 같아요';
}

function renderBreed() {
  if (S.breed) {
    const b = S.breed;
    const left = (b.end - Date.now()) / 1000;
    const done = left <= 0;
    breedDoneShown = done;
    const lv = rIdx(b.type) + 1;
    view.innerHTML = `
      <div class="sec-head"><h2>교배산</h2><p>타이머가 길게 뜰수록 높은 등급이에요. 두근두근!</p></div>
      <div class="mountain">
        <div class="egg ${done ? 'ready' : 'lv' + lv}">🥚</div>
        <div class="timer" id="breedTimer">${done ? '부화 준비 완료!' : mmss(left)}</div>
        <div class="hint">${breedHint(b.total)}</div>
        <div class="parents">${b.parents.join(' + ')}</div>
        <div class="bar"><div id="breedBar" style="width:${done ? 100 : (1 - left / b.total) * 100}%"></div></div>
        ${done
          ? `<button class="btn big green" data-act="hatch">🐣 알 부화하기</button>`
          : `<button class="btn" data-act="speed">⚡ 즉시 완성 (💰 <span id="speedCost">${fmt(Math.ceil(left) * 4)}</span>)</button>`}
      </div>`;
    return;
  }

  sel = sel.filter(u => byUid(u));
  const [a, b] = sel.map(byUid);
  const slot = (m) => m ? card(m, '', 'mini') : '?';
  view.innerHTML = `
    <div class="sec-head"><h2>교배산</h2><p>몬스터 두 마리를 골라 섞어 보세요. 특정 속성 조합에서만 태어나는 숨겨진 몬스터가 있어요!</p></div>
    <div class="mountain">
      <div class="slots">
        <div class="slot">${slot(a)}</div>
        <div class="plus">+</div>
        <div class="slot">${slot(b)}</div>
      </div>
      <button class="btn big" data-act="breed" ${a && b ? '' : 'disabled'}>⛰️ 교배산에 보내기${a && b ? ` (💰 ${fmt(breedCost(a, b))})` : ''}</button>
      <p class="tip">💡 족보 힌트는 도감에서 볼 수 있어요</p>
    </div>
    <div class="grid">${sortedMons().map(m => {
      const i = sel.indexOf(m.uid);
      return card(m, `data-act="pick" data-uid="${m.uid}"`, i >= 0 ? 'sel' : '', i >= 0 ? `<div class="check">${i + 1}</div>` : '');
    }).join('')}</div>`;
}

function pickBreed(uid) {
  uid = Number(uid);
  const i = sel.indexOf(uid);
  if (i >= 0) sel.splice(i, 1);
  else if (sel.length < 2) sel.push(uid);
  else sel[1] = uid;
  renderBreed();
}

function startBreed() {
  const [a, b] = sel.map(byUid);
  if (!a || !b || S.breed) return;
  if (!spend(breedCost(a, b))) return;
  const type = breedResult(a.type, b.type);
  const total = RAR[CAT[type].rarity].time;
  S.breed = { type, total, end: Date.now() + total * 1000, parents: [CAT[a.type].name, CAT[b.type].name] };
  sel = [];
  save();
  render();
}

function speedUp() {
  if (!S.breed) return;
  const left = Math.ceil((S.breed.end - Date.now()) / 1000);
  if (left <= 0) return;
  if (!spend(left * 4)) return;
  S.breed.end = Date.now();
  save();
  render();
}

function hatch() {
  const b = S.breed;
  if (!b || Date.now() < b.end) return;
  const isNew = !S.dex[b.type];
  const m = { uid: S.nextUid++, type: b.type, lv: 1 };
  S.monsters.push(m);
  S.dex[b.type] = true;
  S.breed = null;
  save();
  const c = CAT[m.type], r = RAR[c.rarity];
  showModal(`
    <div class="reveal">
      ${isNew ? '<div class="new-badge">NEW! 도감 등록</div>' : ''}
      <div class="face big" style="background:${grad(c)}">${c.face}</div>
      <h3>${c.name}</h3>
      <div class="rar" style="color:${r.color}; font-size:18px">${r.name}</div>
      <div class="els">${c.els.map(e => `${EL[ELI[e]].emoji} ${EL[ELI[e]].name}`).join(' · ')}</div>
      <div class="row"><button class="btn" data-act="close">좋아!</button></div>
    </div>`);
  render();
}

// ===================== 화면: 농장 =====================
function renderFarm() {
  view.innerHTML = `
    <div class="sec-head"><h2>농장</h2><p>토마토를 키워서 몬스터에게 먹이면 레벨이 올라가요.</p></div>
    <div class="farm-box">
      <div class="field">${'🍅'.repeat(Math.min(S.farmLv * 2, 24))}</div>
      <h3>농장 Lv.${S.farmLv}</h3>
      <p>초당 🍅 ${farmRate()}개 생산 · 창고 최대 ${fmt(farmCap())}개</p>
      <div class="bar green"><div id="farmBar" style="width:${S.farmStore / farmCap() * 100}%"></div></div>
      <div class="store" id="farmStore">${fmt(S.farmStore)} / ${fmt(farmCap())}</div>
      <div class="row">
        <button class="btn green" data-act="collect">🧺 수확하기</button>
        <button class="btn" data-act="upFarm">⬆️ 업그레이드 (💰 ${fmt(farmUpCost())})</button>
      </div>
    </div>
    <h3 class="sub">🏪 시장</h3>
    <div class="market">
      <button class="btn ghost" data-act="buyFood" data-n="100">🍅 100개 사기 (💰 150)</button>
      <button class="btn ghost" data-act="buyFood" data-n="1000">🍅 1,000개 사기 (💰 1,500)</button>
      <button class="btn ghost" data-act="buyFood" data-n="10000">🍅 10,000개 사기 (💰 15,000)</button>
    </div>`;
}

function collect() {
  const n = Math.floor(S.farmStore);
  if (n <= 0) { toast('아직 수확할 토마토가 없어요'); return; }
  S.food += n;
  S.farmStore -= n;
  toast(`🍅 ${fmt(n)}개 수확!`);
  save();
  renderFarm();
}

function upFarm() {
  if (!spend(farmUpCost())) return;
  S.farmLv++;
  toast(`🌾 농장 Lv.${S.farmLv}!`);
  save();
  renderFarm();
}

function buyFood(n) {
  n = Number(n);
  if (!spend(n * 1.5)) return;
  S.food += n;
  toast(`🍅 ${fmt(n)}개 구매!`);
  save();
}

// ===================== 화면: 전투 =====================
function enemyTeam(stage) {
  let seed = stage * 7919 + 13;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const tier = Math.min(4, Math.floor((stage - 1) / 4));
  const res = [];
  for (let i = 0; i < 3; i++) {
    const ri = Math.max(0, tier - (rnd() < 0.4 ? 1 : 0));
    const pool = CAT_LIST.filter(c => c.rarity === RAR_ORDER[ri]);
    const c = pool[Math.floor(rnd() * pool.length)];
    const lv = stage === 1 ? 1 : Math.min(MAX_LV, 1 + ((stage - 1) % 4) * 2 + Math.floor(rnd() * 2) + Math.max(0, stage - 20));
    res.push({ type: c.id, lv });
  }
  return res;
}

function renderBattle() {
  S.team = S.team.filter(u => byUid(u));
  const foes = enemyTeam(S.stage);
  const foeEls = [...new Set(foes.flatMap(f => CAT[f.type].els))];
  const weak = EL.filter(e => BEATS[e.id].some(x => foeEls.includes(x)));
  const team = S.team.map(byUid);
  const slots = [0, 1, 2].map(i => `<div class="slot">${team[i] ? card(team[i], '', 'mini') : '?'}</div>`).join('');
  view.innerHTML = `
    <div class="sec-head"><h2>전투 · 스테이지 ${S.stage}</h2><p>몬스터 3마리로 팀을 짜서 싸워요. 상대 속성을 이기는 몬스터를 고르세요!</p></div>
    <div class="stage-box">
      <h3>👹 상대 팀</h3>
      <div class="team-row">${foes.map(f => card(f, '', 'mini')).join('')}</div>
      <p class="weak">약점 속성: ${weak.map(e => `${e.emoji}${e.name}`).join(' ') || '없음'}</p>
    </div>
    <div class="stage-box" style="background:linear-gradient(180deg,#1f2a4a,#161d36);border-color:#2f4a7a">
      <h3>🛡️ 내 팀</h3>
      <div class="team-row">${slots}</div>
      <div class="row"><button class="btn big" data-act="fight" ${team.length ? '' : 'disabled'}>⚔️ 전투 시작</button></div>
    </div>
    <div class="grid">${sortedMons().map(m => {
      const i = S.team.indexOf(m.uid);
      return card(m, `data-act="team" data-uid="${m.uid}"`, i >= 0 ? 'sel' : '', i >= 0 ? `<div class="check">${i + 1}</div>` : '');
    }).join('')}</div>`;
}

function toggleTeam(uid) {
  uid = Number(uid);
  const i = S.team.indexOf(uid);
  if (i >= 0) S.team.splice(i, 1);
  else if (S.team.length < 3) S.team.push(uid);
  else { toast('팀은 최대 3마리예요'); return; }
  save();
  renderBattle();
}

function fight() {
  const team = S.team.map(byUid).filter(Boolean);
  if (!team.length || battle) return;
  const side = (list) => list.map(m => ({ c: CAT[m.type], p: power(m) }));
  const A = side(team), B = side(enemyTeam(S.stage));
  const hpA = A.reduce((s, x) => s + x.p, 0) * 3;
  const hpB = B.reduce((s, x) => s + x.p, 0) * 3;
  battle = { A, B, hpA, hpB, maxA: hpA, maxB: hpB, turn: 0, over: false };
  showModal(`
    <div class="fight-area">
      <h3>스테이지 ${S.stage}</h3>
      <div class="fight-sides">
        <div class="fight-side"><div class="label">내 팀</div><div class="faces">${A.map(x => x.c.face).join('')}</div><div class="hp"><div id="hpA" style="width:100%"></div></div></div>
        <div class="vs">VS</div>
        <div class="fight-side"><div class="label">상대 팀</div><div class="faces">${B.map(x => x.c.face).join('')}</div><div class="hp enemy"><div id="hpB" style="width:100%"></div></div></div>
      </div>
      <div class="log" id="blog"></div>
      <div id="bresult"></div>
      <div class="row" id="bbtns"><button class="btn ghost small" data-act="skip">⏩ 건너뛰기</button></div>
    </div>`);
  battle.timer = setInterval(battleStep, 280);
}

function battleStep() {
  const b = battle;
  if (!b || b.over) return;
  const mine = b.turn % 2 === 0;
  b.turn++;
  const att = pick(mine ? b.A : b.B), def = pick(mine ? b.B : b.A);
  const adv = advantage(att.c.els, def.c.els);
  const dmg = Math.max(1, Math.round(att.p * adv * (0.8 + Math.random() * 0.4)));
  if (mine) b.hpB = Math.max(0, b.hpB - dmg);
  else b.hpA = Math.max(0, b.hpA - dmg);

  const log = $('#blog');
  if (log) {
    const note = adv > 1 ? ' · 효과가 굉장했다!' : adv < 1 ? ' · 효과가 별로다…' : '';
    const line = document.createElement('div');
    line.className = mine ? 'me' : 'foe';
    line.textContent = `${att.c.face} ${att.c.name} → ${def.c.face} ${def.c.name}  -${fmt(dmg)}${note}`;
    log.appendChild(line);
    log.scrollTop = log.scrollHeight;
    $('#hpA').style.width = `${b.hpA / b.maxA * 100}%`;
    $('#hpB').style.width = `${b.hpB / b.maxB * 100}%`;
  }
  if (b.hpA <= 0 || b.hpB <= 0) endBattle(b.hpB <= 0);
}

function skipBattle() {
  while (battle && !battle.over) battleStep();
}

function endBattle(win) {
  const b = battle;
  b.over = true;
  clearInterval(b.timer);
  let msg;
  if (win) {
    const reward = Math.round(80 * Math.pow(1.35, S.stage - 1));
    earn(reward);
    msg = `<div class="result win">🏆 승리!</div><p>💰 ${fmt(reward)} 골드 획득 · 다음 스테이지 ${S.stage + 1}</p>`;
    S.stage++;
  } else {
    earn(10);
    msg = `<div class="result lose">💥 패배…</div><p>속성 상성을 다시 생각하거나 몬스터를 더 키워 보세요.</p>`;
  }
  save();
  $('#bresult').innerHTML = msg;
  $('#bbtns').innerHTML = `<button class="btn" data-act="closeBattle">확인</button>`;
}

function closeBattle() {
  battle = null;
  closeModal();
  render();
}

// ===================== 화면: 도감 =====================
function dexHint(c) {
  if (c.rarity === 'mythic') return '레전더리 + 레전더리';
  if (c.rarity === 'legendary') return `족보: ${elBadges(c.els)}`;
  const adv = ADV_RECIPES.find(r => 'p:' + r.el === c.id);
  if (adv) return `족보: ${elBadges(adv.need)}`;
  return '???';
}

function renderDex() {
  const found = CAT_LIST.filter(c => S.dex[c.id]).length;
  view.innerHTML = `
    <div class="sec-head">
      <h2>도감 <small>${found} / ${CAT_LIST.length}</small></h2>
      <p>아직 못 만난 몬스터는 ??? 로 보여요. 레전더리는 세 속성을 한 번에 섞어야 태어나요!</p>
    </div>
    <div class="grid">${CAT_LIST.map(c => {
      const r = RAR[c.rarity];
      if (S.dex[c.id]) return card({ type: c.id, lv: 1 }, '', 'mini');
      return `<div class="card unknown r-${c.rarity}">
        <div class="face">?</div>
        <div class="nm">${dexHint(c)}</div>
        <div class="meta"><span class="rar" style="color:${r.color}">${r.name}</span></div>
      </div>`;
    }).join('')}</div>
    <div class="footer-actions"><button class="btn ghost small" data-act="reset">🔄 처음부터 다시 하기</button></div>`;
}

// ===================== 비밀코드 =====================
function openCode() {
  showModal(`
    <h3>🔒 비밀코드</h3>
    <p style="color:var(--muted)">비밀코드를 입력하세요</p>
    <input id="codeInput" maxlength="20" autocomplete="off" placeholder="코드 입력">
    <div class="row">
      <button class="btn" data-act="codeOk">확인</button>
      <button class="btn ghost" data-act="close">취소</button>
    </div>`);
  const inp = $('#codeInput');
  inp.focus();
  inp.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.isComposing) submitCode();
  });
}

function submitCode() {
  const inp = $('#codeInput');
  if (!inp) return;
  const v = inp.value.replace(/\s/g, '');
  if (v === SECRET_CODE) {
    if (S.infinite) { toast('이미 돈 무한이에요 💰'); closeModal(); return; }
    S.infinite = true;
    save();
    closeModal();
    updateHud();
    toast('💰 돈 무한 활성화! 마음껏 쓰세요!');
    render();
  } else {
    toast('❌ 틀린 코드예요');
    inp.select();
  }
}

// ===================== 렌더 / 이벤트 =====================
function render() {
  document.querySelectorAll('.tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
  if (tab === 'mons') renderMons();
  else if (tab === 'breed') renderBreed();
  else if (tab === 'farm') renderFarm();
  else if (tab === 'battle') renderBattle();
  else if (tab === 'dex') renderDex();
  updateHud();
}

function updateHud() {
  const g = $('#gold');
  g.textContent = S.infinite ? '∞' : fmt(S.gold);
  g.classList.toggle('infinite', S.infinite);
  $('#income').textContent = S.infinite ? '무한' : `+${fmt(income())}/초`;
  $('#food').textContent = fmt(S.food);
}

function updateLive() {
  if (tab === 'breed' && S.breed) {
    const left = (S.breed.end - Date.now()) / 1000;
    if (left <= 0) {
      if (!breedDoneShown) renderBreed();
    } else {
      const t = $('#breedTimer'), bar = $('#breedBar'), sc = $('#speedCost');
      if (t) t.textContent = mmss(left);
      if (bar) bar.style.width = `${(1 - left / S.breed.total) * 100}%`;
      if (sc) sc.textContent = fmt(Math.ceil(left) * 4);
    }
  }
  if (tab === 'farm') {
    const bar = $('#farmBar'), st = $('#farmStore');
    if (bar) bar.style.width = `${S.farmStore / farmCap() * 100}%`;
    if (st) st.textContent = `${fmt(S.farmStore)} / ${fmt(farmCap())}`;
  }
}

function tick() {
  const now = Date.now();
  const dt = Math.min(8 * 3600, Math.max(0, (now - S.last) / 1000));
  S.last = now;
  earn(income() * dt);
  S.farmStore = Math.min(farmCap(), S.farmStore + farmRate() * dt);
  updateHud();
  updateLive();
}

document.addEventListener('click', (e) => {
  if (e.target.id === 'modal' && !battle) { closeModal(); return; }
  const t = e.target.closest('[data-act]');
  if (!t || t.disabled) return;
  const uid = t.dataset.uid;
  switch (t.dataset.act) {
    case 'tab': tab = t.dataset.tab; render(); window.scrollTo(0, 0); break;
    case 'openMon': openMon(uid); break;
    case 'feed': feed(uid); break;
    case 'sell': sell(uid); break;
    case 'close': closeModal(); break;
    case 'pick': pickBreed(uid); break;
    case 'breed': startBreed(); break;
    case 'speed': speedUp(); break;
    case 'hatch': hatch(); break;
    case 'collect': collect(); break;
    case 'upFarm': upFarm(); break;
    case 'buyFood': buyFood(t.dataset.n); break;
    case 'team': toggleTeam(uid); break;
    case 'fight': fight(); break;
    case 'skip': skipBattle(); break;
    case 'closeBattle': closeBattle(); break;
    case 'code': openCode(); break;
    case 'codeOk': submitCode(); break;
    case 'reset':
      if (confirm('정말 처음부터 다시 할까요? 모든 몬스터가 사라져요.')) {
        S = newState(); sel = []; save(); render();
      }
      break;
  }
});

tick();
render();
setInterval(tick, 250);
setInterval(save, 3000);
window.addEventListener('beforeunload', save);
