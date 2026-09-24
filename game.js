'use strict';

// ===================== 속성 =====================
// 앞의 8개는 기본 속성(처음부터 가진 몬스터), 뒤의 3개는 교배로만 얻는 특수 속성
const EL = [
  { id: 'fire',    name: '불',   emoji: '🔥', color: '#ff6b3d', adj: '화염',   noun: '살라맨더', face: '🦎', sp: 8 },
  { id: 'water',   name: '물',   emoji: '💧', color: '#3da5ff', adj: '물결',   noun: '거북',     face: '🐢', sp: 0 },
  { id: 'thunder', name: '전기', emoji: '⚡', color: '#ffd93d', adj: '번개',   noun: '매',       face: '🦅', sp: 15 },
  { id: 'nature',  name: '풀',   emoji: '🌿', color: '#4cd964', adj: '숲',     noun: '사슴',     face: '🦌', sp: -2 },
  { id: 'earth',   name: '땅',   emoji: '⛰️', color: '#b8864b', adj: '바위',   noun: '골렘',     face: '🗿', sp: -10 },
  { id: 'dark',    name: '어둠', emoji: '🌑', color: '#7b5cff', adj: '그림자', noun: '박쥐',     face: '🦇', sp: 6 },
  { id: 'light',   name: '빛',   emoji: '✨', color: '#ffe98a', adj: '광휘',   noun: '유니콘',   face: '🦄', sp: 4 },
  { id: 'poison',  name: '독',   emoji: '🧪', color: '#a3e635', adj: '맹독',   noun: '두꺼비',   face: '🐸', sp: 3 },
  { id: 'ice',     name: '얼음', emoji: '❄️', color: '#9be7ff', adj: '서리',   noun: '펭귄',     face: '🐧', sp: 2 },
  { id: 'metal',   name: '금속', emoji: '⚙️', color: '#a8b2c1', adj: '강철',   noun: '로봇',     face: '🤖', sp: -8 },
  { id: 'magic',   name: '마법', emoji: '🔮', color: '#ff5ce1', adj: '비전',   noun: '고블린',   face: '👺', sp: 5 },
];
const ELI = Object.fromEntries(EL.map((e, i) => [e.id, i]));
const BASE = ['fire', 'water', 'thunder', 'nature', 'earth', 'dark', 'light', 'poison'];

// 상성: 키 속성이 배열 속성에게 강하다
const BEATS = {
  fire: ['nature', 'ice', 'metal'],
  water: ['fire', 'earth'],
  thunder: ['water', 'metal'],
  nature: ['water', 'earth'],
  earth: ['thunder', 'fire', 'poison'],
  dark: ['light', 'magic'],
  light: ['dark', 'poison'],
  poison: ['nature', 'water'],
  ice: ['nature', 'earth'],
  metal: ['ice', 'magic', 'poison'],
  magic: ['nature', 'thunder'],
};

// ===================== 등급 =====================
const RAR_ORDER = ['common', 'rare', 'epic', 'legendary', 'mythic', 'divine'];
const RAR = {
  common:    { name: '커먼',     color: '#b4bccb', time: 5,   income: 1,   cost: 50,   hp: 300,  atk: 50,  spd: 100 },
  rare:      { name: '레어',     color: '#5cb6ff', time: 15,  income: 3,   cost: 120,  hp: 420,  atk: 65,  spd: 108 },
  epic:      { name: '에픽',     color: '#c28cff', time: 40,  income: 10,  cost: 300,  hp: 600,  atk: 90,  spd: 116 },
  legendary: { name: '레전더리', color: '#ffb020', time: 90,  income: 40,  cost: 800,  hp: 900,  atk: 130, spd: 126 },
  mythic:    { name: '신화',     color: '#ff4d6d', time: 180, income: 200, cost: 2000, hp: 1400, atk: 190, spd: 140 },
  divine:    { name: '초월',     color: '#3dffd8', time: 300, income: 1000, cost: 5000, hp: 2400, atk: 320, spd: 160 },
};

// ===================== 족보 =====================
const ADV_RECIPES = [
  { el: 'ice',   need: ['water', 'thunder'] },
  { el: 'metal', need: ['fire', 'earth'] },
  { el: 'magic', need: ['light', 'dark'] },
];
const LEGENDS = [
  { id: 'L:phoenix', name: '피닉스 킹',     face: '🦚', els: ['fire', 'light', 'magic'],  ult: '불사조의 비상' },
  { id: 'L:kraken',  name: '심해의 군주',   face: '🐙', els: ['water', 'ice', 'dark'],    ult: '심해 소용돌이' },
  { id: 'L:ent',     name: '세계수 수호자', face: '🌳', els: ['nature', 'earth', 'light'], ult: '세계수의 분노' },
  { id: 'L:titan',   name: '강철 타이탄',   face: '🦾', els: ['metal', 'thunder', 'earth'], ult: '타이탄 강타' },
  { id: 'L:dragon',  name: '그림자 용',     face: '🐉', els: ['dark', 'fire', 'magic'],   ult: '암흑 브레스' },
  { id: 'L:yeti',    name: '서리 거인',     face: '🧊', els: ['ice', 'metal', 'water'],   ult: '절대 영도' },
  { id: 'L:basil',   name: '독룡 바실리스크', face: '🐍', els: ['poison', 'dark', 'nature'], ult: '맹독 폭풍' },
];
const MYTHIC = { id: 'M:arche', name: '태초의 신수 아르케', face: '🌌', els: ['magic', 'light', 'dark'], ult: '태초의 빛' };
// 전설 상점 전용: 골드로 살 수는 있지만… 절대 모을 수 없는 가격
const SHOP_LEGENDS = [
  { id: 'X:goldking', name: '황금 용왕 골드킹',     face: '🐲', els: ['fire', 'light', 'metal'],   ult: '황금 멸망포',  price: 9999999999 },
  { id: 'X:whale',    name: '은하 고래 코스모',     face: '🐋', els: ['water', 'magic', 'dark'],   ult: '은하 붕괴',    price: 77777777777 },
  { id: 'X:lion',     name: '천둥 사자왕 제우스',   face: '🦁', els: ['thunder', 'light', 'earth'], ult: '신의 번개',    price: 500000000000 },
  { id: 'X:owl',      name: '시간의 수호자 크로노', face: '🦉', els: ['magic', 'ice', 'light'],    ult: '시간 정지',    price: 12345678901234 },
  { id: 'X:chaos',    name: '혼돈의 신 카오스',     face: '👁️', els: ['dark', 'fire', 'magic'],   ult: '혼돈의 눈',    price: 999999999999999 },
];

// ===================== 스킬 =====================
const SK = {
  fire:    { atk: { n: '파이어볼', m: 1.6 },           eff: { n: '불태우기', type: 'burn', m: 0.8 } },
  water:   { atk: { n: '물대포', m: 1.6 },             eff: { n: '치유의 물', type: 'healTeam', v: 0.2 } },
  nature:  { atk: { n: '덩굴 채찍', m: 1.6 },          eff: { n: '광합성', type: 'healSelf', v: 0.35 } },
  earth:   { atk: { n: '바위 던지기', m: 1.6 },        eff: { n: '대지의 방패', type: 'shield' } },
  thunder: { atk: { n: '번개 일격', m: 1.8 },          eff: { n: '마비 전격', type: 'stun', m: 0.6 } },
  ice:     { atk: { n: '얼음 창', m: 1.6 },            eff: { n: '빙결', type: 'stun', m: 0.5 } },
  dark:    { atk: { n: '그림자 발톱', m: 1.7 },        eff: { n: '저주', type: 'curse', m: 0.6 } },
  light:   { atk: { n: '빛의 창', m: 1.6 },            eff: { n: '축복', type: 'healTeam', v: 0.2 } },
  metal:   { atk: { n: '강철 주먹', m: 1.7 },          eff: { n: '강화', type: 'buffSelf' } },
  magic:   { atk: { n: '비전 폭발', m: 0.9, aoe: true }, eff: { n: '마력 증폭', type: 'buffTeam' } },
  poison:  { atk: { n: '독침', m: 1.6 },               eff: { n: '맹독 안개', type: 'poison', m: 0.6 } },
};
const EFF_COST = { burn: 4, poison: 4, healTeam: 5, healSelf: 4, shield: 3, stun: 5, curse: 4, buffSelf: 3, buffTeam: 5 };
const MAX_STA = 10;

const basicSkill = (e) => ({ name: '할퀴기', el: e, type: 'dmg', mult: 1, cost: 0 });
function atkSkill(e) {
  const s = SK[e].atk;
  return { name: s.n, el: e, type: 'dmg', mult: s.m, aoe: !!s.aoe, cost: s.aoe ? 4 : 3 };
}
function effSkill(e) {
  const s = SK[e].eff;
  return { name: s.n, el: e, type: s.type, mult: s.m || 0, v: s.v || 0, cost: EFF_COST[s.type] };
}
function buildSkills(c) {
  const e = c.els;
  if (c.ult) {
    return [basicSkill(e[0]), atkSkill(e[0]), effSkill(e[1]), atkSkill(e[2]),
      { name: c.ult, el: e[0], type: 'dmg', mult: c.rarity === 'divine' ? 2.2 : c.rarity === 'mythic' ? 1.8 : 1.4, aoe: true, cost: 7 }];
  }
  const s = [basicSkill(e[0]), atkSkill(e[0]), effSkill(e[0])];
  if (e[1]) s.push(atkSkill(e[1]), effSkill(e[1]));
  return s;
}
const pct = (x) => `${Math.round(x * 100)}%`;
function skDesc(sk) {
  switch (sk.type) {
    case 'dmg': return sk.aoe ? `적 전체에게 ${pct(sk.mult)} 피해` : `${pct(sk.mult)} 피해`;
    case 'burn': return `${pct(sk.mult)} 피해 + 3턴 화상`;
    case 'poison': return `${pct(sk.mult)} 피해 + 4턴 중독`;
    case 'stun': return `${pct(sk.mult)} 피해 + 60% 확률 기절`;
    case 'curse': return `${pct(sk.mult)} 피해 + 공격력 30% 감소`;
    case 'healTeam': return `아군 전체 체력 ${pct(sk.v)} 회복`;
    case 'healSelf': return `자신의 체력 ${pct(sk.v)} 회복`;
    case 'shield': return '받는 피해 절반 (2턴)';
    case 'buffSelf': return '자신의 공격력 40% 증가';
    case 'buffTeam': return '아군 전체 공격력 40% 증가';
  }
  return '';
}
const needsTarget = (sk) => ['dmg', 'burn', 'poison', 'stun', 'curse'].includes(sk.type) && !sk.aoe;

// ===================== 몬스터 카탈로그 =====================
const CAT = {};
const CAT_LIST = [];
function addMon(m) { CAT[m.id] = m; CAT_LIST.push(m); }

EL.forEach((e, i) => addMon({
  id: 'p:' + e.id, name: `${e.adj} ${e.noun}`, face: e.face, els: [e.id],
  rarity: i < BASE.length ? 'common' : 'epic',
}));
for (let i = 0; i < EL.length; i++) {
  for (let j = i + 1; j < EL.length; j++) {
    const a = EL[i], b = EL[j];
    addMon({
      id: `h:${a.id}+${b.id}`, name: `${a.adj} ${b.noun}`, face: b.face, els: [a.id, b.id],
      rarity: i < BASE.length && j < BASE.length ? 'rare' : 'epic',
    });
  }
}
LEGENDS.forEach(l => addMon({ ...l, rarity: 'legendary' }));
addMon({ ...MYTHIC, rarity: 'mythic' });
SHOP_LEGENDS.forEach(l => addMon({ ...l, rarity: 'divine', shop: true }));
CAT_LIST.sort((a, b) => RAR_ORDER.indexOf(a.rarity) - RAR_ORDER.indexOf(b.rarity));
CAT_LIST.forEach(c => { c.skills = buildSkills(c); });

const hybridId = (x, y) => {
  const [a, b] = [x, y].sort((p, q) => ELI[p] - ELI[q]);
  return `h:${a}+${b}`;
};
const rIdx = (type) => RAR_ORDER.indexOf(CAT[type].rarity);
const isLegend = (type) => rIdx(type) >= 3;
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
  if (isLegend(ta) && isLegend(tb)) {
    if (Math.random() < 0.35) return MYTHIC.id;
    const r = pick([ta, tb]);
    return CAT[r].shop ? MYTHIC.id : r;   // 상점 전용 몬스터는 교배로 복제할 수 없다
  }
  const pool = [...new Set([...CAT[ta].els, ...CAT[tb].els])];
  const has = (need) => need.every(e => pool.includes(e));
  for (const l of shuffle(LEGENDS)) if (has(l.els) && Math.random() < 0.25) return l.id;
  for (const r of shuffle(ADV_RECIPES)) if (has(r.need) && Math.random() < 0.3) return 'p:' + r.el;
  if (pool.length === 1 || Math.random() < 0.25) return 'p:' + pick(pool);
  const [x, y] = shuffle(pool);
  return hybridId(x, y);
}

// ===================== 건물 / 농장 / 룬 =====================
const PLOTS = 25;
const HATCH_CAP = 3;
const BREED_LV = 4;
const MAX_LV = 20;
const HAB_MAX_LV = 3;
const FARM_COST = 250;
const CROPS = [
  { name: '새싹 풀',    emoji: '🌱', food: 60,   time: 30,  cost: 40 },
  { name: '토마토',     emoji: '🍅', food: 400,  time: 120, cost: 200 },
  { name: '황금 옥수수', emoji: '🌽', food: 2000, time: 600, cost: 800 },
];
const habName = (el) => el === 'legend' ? '전설의 서식지' : `${EL[ELI[el]].name} 서식지`;
const habEmoji = (el) => el === 'legend' ? '🏛️' : EL[ELI[el]].emoji;
const habColor = (el) => el === 'legend' ? '#ffb020' : EL[ELI[el]].color;
const habBuildCost = (el) => el === 'legend' ? 5000 : BASE.includes(el) ? 300 : 1000;
const habUpCost = (lv) => 400 * lv * lv;

const RUNE = {
  hp:  { name: '체력', emoji: '❤️', vals: [10, 20, 35] },
  atk: { name: '공격', emoji: '⚔️', vals: [10, 20, 35] },
  spd: { name: '속도', emoji: '👟', vals: [8, 15, 25] },
};
const runeText = (r) => `${RUNE[r.t].emoji} ${RUNE[r.t].name} +${RUNE[r.t].vals[r.lv - 1]}% ${'★'.repeat(r.lv)}`;

// ===================== 상태 / 저장 =====================
const KEY = 'combining-save-v3';
const SECRET_CODE = '방탄유리';

function newState() {
  const s = {
    gold: 500, gems: 30, food: 300, infinite: false,
    plots: Array(PLOTS).fill(null),
    monsters: [], nextUid: 1, hatch: [], breed: null, dex: {},
    runes: [], nextRune: 1,
    stage: 1, team: [],
    last: Date.now(),
  };
  s.plots[0] = { kind: 'mountain' };
  s.plots[1] = { kind: 'hatchery' };
  s.plots[5] = { kind: 'farm', crop: null, end: 0 };
  const HOME = [6, 7, 8, 11, 12, 13, 16, 17];   // 기본 서식지 8개 자리
  BASE.forEach((e, i) => {
    s.plots[HOME[i]] = { kind: 'hab', el: e, lv: 1, gold: 0 };
    s.monsters.push({ uid: s.nextUid++, type: 'p:' + e, lv: 1, hab: HOME[i], runes: [null, null] });
    s.dex['p:' + e] = true;
  });
  return s;
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (!s || !Array.isArray(s.monsters) || !Array.isArray(s.plots) || s.plots.length !== PLOTS) return null;
    s.monsters = s.monsters.filter(m => CAT[m.type]);
    s.hatch = (s.hatch || []).filter(t => CAT[t]);
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
const monIncome = (m) => RAR[CAT[m.type].rarity].income * m.lv;
const habMons = (i) => S.monsters.filter(m => m.hab === i);
const habCap = (i) => S.plots[i].lv + 1;
const habIncome = (i) => habMons(i).reduce((s, m) => s + monIncome(m), 0);
const habGoldCap = (i) => Math.max(300, habIncome(i) * 240 * S.plots[i].lv);
const feedCost = (m) => m.lv * 20;
const sellPrice = (m) => Math.round(RAR[CAT[m.type].rarity].cost * 0.5 * (1 + m.lv * 0.2));
const breedCost = (a, b) => RAR[RAR_ORDER[Math.max(rIdx(a.type), rIdx(b.type))]].cost;
const gemCost = (secLeft, per) => Math.max(1, Math.ceil(secLeft / per));

function habsFor(type) {
  const c = CAT[type];
  return S.plots.map((p, i) => ({ p, i })).filter(({ p, i }) =>
    p && p.kind === 'hab' &&
    (isLegend(type) ? p.el === 'legend' : c.els.includes(p.el)) &&
    habMons(i).length < habCap(i));
}

function runeBonus(m) {
  const b = { hp: 0, atk: 0, spd: 0 };
  (m.runes || []).forEach(id => {
    const r = id != null && S.runes.find(x => x.id === id);
    if (r) b[r.t] += RUNE[r.t].vals[r.lv - 1];
  });
  return b;
}
function stats(m) {
  const c = CAT[m.type], r = RAR[c.rarity], rb = runeBonus(m);
  const sp = c.els.reduce((s, e) => s + EL[ELI[e]].sp, 0) / c.els.length;
  return {
    hp: Math.round(r.hp * (1 + 0.12 * (m.lv - 1)) * (1 + rb.hp / 100)),
    atk: Math.round(r.atk * (1 + 0.1 * (m.lv - 1)) * (1 + rb.atk / 100)),
    spd: Math.round((r.spd + sp) * (1 + 0.01 * (m.lv - 1)) * (1 + rb.spd / 100)),
  };
}

function spend(cost, cur = 'gold') {
  if (S.infinite) return true;
  if (S[cur] < cost) { toast(cur === 'gold' ? '💰 골드가 부족해요' : '💎 보석이 부족해요'); return false; }
  S[cur] -= cost;
  return true;
}
function earn(n, cur = 'gold') { if (!S.infinite) S[cur] += n; }

function advantage(att, def) {
  let m = 1;
  if (att.some(a => def.some(d => BEATS[a].includes(d)))) m *= 1.5;
  if (def.some(d => att.some(a => BEATS[d].includes(a)))) m *= 0.7;
  return m;
}

// ===================== UI 도우미 =====================
const $ = (s) => document.querySelector(s);
const view = $('#view');
let tab = 'island';
let sel = [];

const fmt = (n) => Math.floor(n).toLocaleString('ko-KR');
const elBadges = (els) => els.map(e => EL[ELI[e]].emoji).join('');
const elNames = (els) => els.map(e => `${EL[ELI[e]].emoji} ${EL[ELI[e]].name}`).join(' · ');
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
const sortMons = (list) => list.slice().sort((a, b) => rIdx(b.type) - rIdx(a.type) || b.lv - a.lv || a.uid - b.uid);

let modalStack = null;
function showModal(html) {
  $('#modalBox').innerHTML = html;
  $('#modal').classList.remove('hidden');
  refreshLive();
}
function closeModal() {
  $('#modal').classList.add('hidden');
  $('#modalBox').innerHTML = '';
  modalStack = null;
}
// 모달 안에서 다른 모달로 갔다가 "뒤로" 돌아가기 위한 함수
function backTo(fn) { modalStack = fn; }

let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

// ===================== 라이브 텍스트 (타이머 등) =====================
function plotReady(i) {
  const p = S.plots[i];
  if (!p) return false;
  if (p.kind === 'mountain') return !!S.breed && Date.now() >= S.breed.end;
  if (p.kind === 'hatchery') return S.hatch.length > 0;
  if (p.kind === 'farm') return p.crop != null && Date.now() >= p.end;
  if (p.kind === 'hab') return p.gold >= 1;
  return false;
}
function liveText(key) {
  const [k, arg] = key.split(':');
  const now = Date.now();
  if (k === 'plot') {
    const i = Number(arg), p = S.plots[i];
    if (!p) return '';
    if (p.kind === 'mountain') {
      if (!S.breed) return '교배 가능';
      return now >= S.breed.end ? '🥚 완료!' : `⏳ ${mmss((S.breed.end - now) / 1000)}`;
    }
    if (p.kind === 'hatchery') return `🥚 ${S.hatch.length}/${HATCH_CAP}`;
    if (p.kind === 'farm') {
      if (p.crop == null) return '비어 있음';
      return now >= p.end ? `${CROPS[p.crop].emoji} 수확!` : `⏳ ${mmss((p.end - now) / 1000)}`;
    }
    if (p.kind === 'hab') return `💰 ${fmt(p.gold)}`;
  }
  if (k === 'breed') return !S.breed ? '' : now >= S.breed.end ? '완료!' : mmss((S.breed.end - now) / 1000);
  if (k === 'breedGem') return S.breed ? fmt(gemCost((S.breed.end - now) / 1000, 10)) : '0';
  if (k === 'farm') {
    const p = S.plots[Number(arg)];
    if (!p || p.crop == null) return '';
    return now >= p.end ? '다 자랐어요!' : mmss((p.end - now) / 1000);
  }
  if (k === 'farmGem') {
    const p = S.plots[Number(arg)];
    return p && p.crop != null ? fmt(gemCost((p.end - now) / 1000, 20)) : '0';
  }
  if (k === 'hab') {
    const i = Number(arg);
    return `${fmt(S.plots[i].gold)} / ${fmt(habGoldCap(i))}`;
  }
  return '';
}
function liveBar(key) {
  const [k, arg] = key.split(':');
  const now = Date.now();
  if (k === 'breed' && S.breed) return Math.min(1, 1 - (S.breed.end - now) / 1000 / S.breed.total);
  if (k === 'farm') {
    const p = S.plots[Number(arg)];
    if (p && p.crop != null) return Math.min(1, 1 - (p.end - now) / 1000 / CROPS[p.crop].time);
  }
  if (k === 'hab') { const i = Number(arg); return S.plots[i].gold / habGoldCap(i); }
  return 0;
}
function refreshLive() {
  document.querySelectorAll('[data-live]').forEach(el => { el.textContent = liveText(el.dataset.live); });
  document.querySelectorAll('[data-bar]').forEach(el => { el.style.width = `${liveBar(el.dataset.bar) * 100}%`; });
  document.querySelectorAll('[data-plot]').forEach(el => el.classList.toggle('ready', plotReady(Number(el.dataset.plot))));
}

// ===================== 섬 장면 (캔버스) =====================
const cv = $('#world');
const ctx = cv.getContext('2d');
const TW = 230, TH = 130, GRID = 5;       // 아이소메트릭 타일 크기
const ISLAND = { x: 0, y: TH * 2 };      // 섬 중심 (월드 좌표)
const cam = { x: ISLAND.x, y: ISLAND.y + 30, z: 1 };
const EMOJI_FONT = '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';
const TEXT_FONT = '"Segoe UI", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif';
const DECOR = [
  { x: -690, y: 260, e: '🌴', s: 80 }, { x: 690, y: 260, e: '🌴', s: 80 },
  { x: -420, y: 40, e: '🌳', s: 56 },  { x: 420, y: 40, e: '🌳', s: 56 },
  { x: -420, y: 500, e: '🌳', s: 54 }, { x: 420, y: 500, e: '🌲', s: 56 },
  { x: 0, y: -140, e: '🌲', s: 52 },   { x: -250, y: 640, e: '🪨', s: 36 },
  { x: 250, y: 640, e: '🌼', s: 30 },  { x: -600, y: 390, e: '🌼', s: 28 },
  { x: 600, y: 130, e: '🍄', s: 28 },  { x: 0, y: 670, e: '🌷', s: 30 },
  { x: -570, y: 130, e: '🌲', s: 44 }, { x: 570, y: 400, e: '🌳', s: 46 },
];
const BOATS = [{ x: -900, y: -40, v: 18 }, { x: 600, y: 760, v: -12 }];
let W = 0, H = 0, DPR = 1;
const walkers = {};
const floaters = [];
let bubbles = [];

const plotPos = (i) => {
  const gx = i % GRID, gy = Math.floor(i / GRID);
  return { x: (gx - gy) * TW / 2, y: (gx + gy) * TH / 2 };
};
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function resize() {
  DPR = Math.min(2, window.devicePixelRatio || 1);
  W = window.innerWidth;
  H = window.innerHeight;
  cv.width = Math.round(W * DPR);
  cv.height = Math.round(H * DPR);
  cam.z = clamp(Math.min(W / 1150, (H - 190) / 860), 0.26, 1.2);
}

function diamond(x, y, hw, hh) {
  ctx.beginPath();
  ctx.moveTo(x, y - hh);
  ctx.lineTo(x + hw, y);
  ctx.lineTo(x, y + hh);
  ctx.lineTo(x - hw, y);
  ctx.closePath();
}

function block(x, y, hw, hh, top, side, depth = 14) {
  diamond(x, y + depth, hw, hh);
  ctx.fillStyle = side;
  ctx.fill();
  ctx.fillRect(x - hw, y, hw * 2, depth);
  diamond(x, y, hw, hh);
  ctx.fillStyle = top;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.18)';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function emoji(e, x, y, size, rot = 0, flip = 1) {
  ctx.save();
  ctx.translate(x, y);
  if (rot) ctx.rotate(rot);
  if (flip < 0) ctx.scale(-1, 1);
  ctx.font = `${size}px ${EMOJI_FONT}`;
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(e, 0, 0);
  ctx.restore();
}

function shadow(x, y, rx, ry = rx * 0.35) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,.22)';
  ctx.fill();
}

function pill(text, x, y, bg, fg, size = 15) {
  ctx.font = `800 ${size}px ${TEXT_FONT}`;
  const w = ctx.measureText(text).width + 18, h = size + 10;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x - w / 2, y - h / 2, w, h, h / 2);
  else ctx.rect(x - w / 2, y - h / 2, w, h);
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.fillStyle = fg;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y + 1);
}

function label(text, x, y, size = 16) {
  ctx.font = `800 ${size}px ${TEXT_FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(0,0,0,.7)';
  ctx.strokeText(text, x, y);
  ctx.fillStyle = '#fff';
  ctx.fillText(text, x, y);
}

// ----- 몬스터 산책 -----
function newTarget(w) {
  let a, b;
  do { a = Math.random() * 2 - 1; b = Math.random() * 2 - 1; } while (Math.abs(a) + Math.abs(b) > 1);
  w.tx = a * TW * 0.3;
  w.ty = b * TH * 0.3;
}
function walkerFor(m, i) {
  let w = walkers[m.uid];
  if (!w || w.hab !== i) {
    w = walkers[m.uid] = { hab: i, ox: 0, oy: 0, tx: 0, ty: 0, wait: Math.random() * 2, dir: 1, moving: false };
    newTarget(w);
    w.ox = w.tx; w.oy = w.ty;
    newTarget(w);
  }
  return w;
}
function stepWalker(w, dt) {
  if (w.wait > 0) { w.wait -= dt; w.moving = false; return; }
  const dx = w.tx - w.ox, dy = w.ty - w.oy, d = Math.hypot(dx, dy);
  if (d < 2) { w.wait = 1 + Math.random() * 2.5; newTarget(w); w.moving = false; return; }
  const step = Math.min(d, 38 * dt);
  w.ox += dx / d * step;
  w.oy += dy / d * step;
  if (Math.abs(dx) > 1) w.dir = dx < 0 ? -1 : 1;
  w.moving = true;
}

// ----- 그리기 -----
function drawSea(t) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#2b8fe0');
  g.addColorStop(1, '#0b4f8a');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(255,255,255,.13)';
  ctx.lineWidth = 2;
  for (let y = 20, r = 0; y < H + 20; y += 44, r++) {
    ctx.beginPath();
    for (let x = -20; x <= W + 20; x += 18) {
      const yy = y + Math.sin(x / 38 + t * 1.4 + r * 1.7) * 4;
      if (x < 0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }
}

function drawIsland(t) {
  const { x, y } = ISLAND;
  const foam = 0.5 + Math.sin(t * 2) * 0.5;
  ctx.beginPath();
  ctx.ellipse(x, y + 16, 800 + foam * 8, 482 + foam * 6, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,.25)';
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x, y + 14, 780, 468, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#c9a85a';
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x, y, 770, 455, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#ecd592';
  ctx.fill();
  const g = ctx.createRadialGradient(x, y - 60, 60, x, y, 760);
  g.addColorStop(0, '#6fd35e');
  g.addColorStop(1, '#3b9a3c');
  ctx.beginPath();
  ctx.ellipse(x, y - 6, 735, 428, 0, 0, Math.PI * 2);
  ctx.fillStyle = g;
  ctx.fill();
}

function drawPlot(p, i, x, y, t, dt) {
  const hw = TW / 2 - 8, hh = TH / 2 - 5;
  if (!p) {
    diamond(x, y, hw, hh);
    ctx.fillStyle = 'rgba(40,110,40,.45)';
    ctx.fill();
    ctx.setLineDash([10, 8]);
    ctx.strokeStyle = 'rgba(255,255,255,.35)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = `700 34px ${TEXT_FONT}`;
    ctx.fillStyle = 'rgba(255,255,255,.4)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('+', x, y);
    return;
  }
  const ready = plotReady(i);
  if (p.kind === 'mountain') {
    block(x, y, hw, hh, '#8d82d8', '#51479b');
    shadow(x, y + 8, 80);
    emoji('🏔️', x, y - 42, 118);
    if (S.breed) {
      const k = ready ? Math.abs(Math.sin(t * 5)) * -10 : 0;
      emoji('🥚', x + 58, y + 6 + k, 42, ready ? 0 : Math.sin(t * (4 + rIdx(S.breed.type) * 2)) * 0.25);
    }
  } else if (p.kind === 'hatchery') {
    block(x, y, hw, hh, '#e2bd78', '#9e7434');
    shadow(x, y + 10, 60);
    emoji('🪺', x, y - 18, 86);
    S.hatch.forEach((type, k) => emoji('🥚', x - 34 + k * 34, y + 26 + Math.sin(t * 6 + k) * 2, 30, Math.sin(t * 5 + k) * 0.2));
  } else if (p.kind === 'farm') {
    block(x, y, hw, hh, '#8c5a2c', '#56361a');
    ctx.strokeStyle = 'rgba(0,0,0,.25)';
    ctx.lineWidth = 3;
    for (let r = -2; r <= 2; r++) {
      ctx.beginPath();
      ctx.moveTo(x - hw * 0.55 + r * 22, y - hh * 0.45 + r * 12 + 12);
      ctx.lineTo(x + hw * 0.45 + r * 22, y + hh * 0.1 + r * 12 + 12 - 22);
      ctx.stroke();
    }
    if (p.crop != null) {
      const prog = clamp(1 - (p.end - Date.now()) / 1000 / CROPS[p.crop].time, 0, 1);
      const size = 16 + prog * 26;
      [[-50, -8], [-10, -26], [30, -44], [-30, 14], [10, -4], [50, -22], [-10, 36], [30, 18]].forEach(([dx, dy], k) =>
        emoji(prog < 0.35 ? '🌱' : CROPS[p.crop].emoji, x + dx, y + dy + Math.sin(t * 2 + k) * 1.5, size));
    }
  } else if (p.kind === 'hab') {
    const c = habColor(p.el);
    block(x, y, hw, hh, c, '#1d1d3a');
    diamond(x, y, hw, hh);
    ctx.fillStyle = 'rgba(0,0,0,.22)';
    ctx.fill();
    diamond(x, y, hw * 0.78, hh * 0.78);
    ctx.fillStyle = 'rgba(255,255,255,.12)';
    ctx.fill();
    if (p.el === 'legend') emoji('🏛️', x, y - 34, 62);
    else {
      emoji(habEmoji(p.el), x - hw * 0.62, y - 8, 30);
      emoji(habEmoji(p.el), x + hw * 0.62, y - 8, 30);
      emoji(habEmoji(p.el), x, y - hh * 0.72, 28);
    }
    for (let k = 1; k < p.lv; k++) emoji('⭐', x - hw * 0.3 + (k - 1) * 22, y + hh * 0.72, 16);
    habMons(i)
      .map(m => ({ m, w: walkerFor(m, i) }))
      .sort((a, b) => a.w.oy - b.w.oy)
      .forEach(({ m, w }) => {
        stepWalker(w, dt);
        const mx = x + w.ox, my = y + w.oy;
        const bob = w.moving ? Math.abs(Math.sin(t * 9 + m.uid)) * -6 : Math.sin(t * 2 + m.uid) * 1.5;
        shadow(mx, my + 16, 18);
        emoji(CAT[m.type].face, mx, my + bob - 6, 44, 0, w.dir);
      });
  }
}

function drawLabel(p, i, x, y, t) {
  if (!p) return;
  const ready = plotReady(i);
  const name = p.kind === 'mountain' ? '교배산' : p.kind === 'hatchery' ? '부화장' : p.kind === 'farm' ? '농장' : `${habName(p.el)} Lv.${p.lv}`;
  const ly = y + TH / 2 + 10;
  label(name, x, ly, 17);
  if (p.kind === 'hab') {
    const cap = habGoldCap(i);
    if (p.gold >= Math.max(1, cap * 0.04)) {
      const by = y - TH * 0.95 + Math.sin(t * 3 + i) * 5;
      const full = p.gold >= cap - 0.5;
      ctx.beginPath();
      ctx.arc(x, by, 30, 0, Math.PI * 2);
      ctx.fillStyle = full ? '#ffe066' : 'rgba(255,255,255,.92)';
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x - 8, by + 26);
      ctx.lineTo(x, by + 40);
      ctx.lineTo(x + 8, by + 26);
      ctx.fill();
      emoji('💰', x, by - 2, 32);
      pill(fmt(p.gold), x, by - 42, 'rgba(0,0,0,.6)', '#ffe066', 14);
      bubbles.push({ x, y: by, r: 36, i });
    }
    return;
  }
  const text = liveText(`plot:${i}`);
  const bounce = ready ? Math.abs(Math.sin(t * 4)) * -6 : 0;
  pill(text, x, ly + 26 + bounce, ready ? '#ffe066' : 'rgba(0,0,0,.55)', ready ? '#3a2a00' : '#fff', 14);
}

function drawFloaters(t) {
  for (let k = floaters.length - 1; k >= 0; k--) {
    const f = floaters[k];
    const age = t - f.t0;
    if (age > 1.4) { floaters.splice(k, 1); continue; }
    ctx.globalAlpha = 1 - age / 1.4;
    ctx.font = `900 28px ${TEXT_FONT}`;
    ctx.textAlign = 'center';
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'rgba(0,0,0,.7)';
    ctx.strokeText(f.text, f.x, f.y - age * 70);
    ctx.fillStyle = '#ffe066';
    ctx.fillText(f.text, f.x, f.y - age * 70);
    ctx.globalAlpha = 1;
  }
}
function floatAt(i, text) {
  const { x, y } = plotPos(i);
  floaters.push({ x, y: y - TH * 0.8, text, t0: performance.now() / 1000 });
}

let lastFrame = 0;
function drawWorld(now) {
  const t = now / 1000;
  const dt = Math.min(0.05, t - (lastFrame || t));
  lastFrame = t;
  if (tab === 'island' && !B) {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    drawSea(t);
    const z = cam.z;
    ctx.setTransform(DPR * z, 0, 0, DPR * z, DPR * (W / 2 - cam.x * z), DPR * (H / 2 + 10 - cam.y * z));
    BOATS.forEach(b => {
      b.x += b.v * dt;
      if (b.x > 1300) b.x = -1300;
      if (b.x < -1300) b.x = 1300;
      emoji('⛵', b.x, b.y + Math.sin(t * 1.5 + b.y) * 4, 48, Math.sin(t * 1.2) * 0.06, b.v < 0 ? 1 : -1);
    });
    drawIsland(t);
    const items = DECOR.map(d => ({ y: d.y, fn: () => { shadow(d.x, d.y + d.s * 0.4, d.s * 0.35); emoji(d.e, d.x, d.y, d.s); } }));
    S.plots.forEach((p, i) => {
      const { x, y } = plotPos(i);
      items.push({ y, fn: () => drawPlot(p, i, x, y, t, dt) });
    });
    items.sort((a, b) => a.y - b.y).forEach(it => it.fn());
    bubbles = [];
    S.plots.forEach((p, i) => { const { x, y } = plotPos(i); drawLabel(p, i, x, y, t); });
    drawFloaters(t);
  }
  requestAnimationFrame(drawWorld);
}

// ----- 입력 (탭 / 드래그 / 휠) -----
function toWorld(sx, sy) {
  return { x: (sx - W / 2) / cam.z + cam.x, y: (sy - H / 2 - 10) / cam.z + cam.y };
}
function tapAt(sx, sy) {
  const w = toWorld(sx, sy);
  for (const b of bubbles) {
    if (Math.hypot(w.x - b.x, w.y - b.y) < b.r + 8) { collectHab(b.i, true); return; }
  }
  const order = S.plots.map((p, i) => ({ i, ...plotPos(i) })).sort((a, b) => b.y - a.y);
  for (const o of order) {
    const dx = Math.abs(w.x - o.x), dy = w.y - o.y;
    const inTile = dx / (TW / 2) + Math.abs(dy) / (TH / 2) <= 1;
    const inSprite = S.plots[o.i] && dx < TW * 0.3 && dy < 0 && dy > -TH * 1.1;
    if (inTile || inSprite) { openPlot(o.i); return; }
  }
}
let drag = null;
cv.addEventListener('pointerdown', (e) => {
  drag = { sx: e.clientX, sy: e.clientY, cx: cam.x, cy: cam.y, moved: false };
  cv.setPointerCapture(e.pointerId);
});
cv.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
  if (Math.hypot(dx, dy) > 8) drag.moved = true;
  if (drag.moved) {
    cam.x = clamp(drag.cx - dx / cam.z, -650, 650);
    cam.y = clamp(drag.cy - dy / cam.z, -150, 680);
  }
});
cv.addEventListener('pointerup', (e) => {
  if (drag && !drag.moved) tapAt(e.clientX, e.clientY);
  drag = null;
});
cv.addEventListener('pointercancel', () => { drag = null; });
cv.addEventListener('wheel', (e) => {
  e.preventDefault();
  cam.z = clamp(cam.z * Math.exp(-e.deltaY * 0.0012), 0.28, 1.6);
}, { passive: false });
window.addEventListener('resize', resize);
resize();

function collectAll() {
  let sum = 0;
  S.plots.forEach((p, i) => {
    if (p && p.kind === 'hab' && p.gold >= 1) {
      const n = Math.floor(p.gold);
      sum += n;
      p.gold -= n;
      floatAt(i, `+${fmt(n)}`);
    }
  });
  if (!sum) { toast('아직 걷을 골드가 없어요'); return; }
  earn(sum);
  if (tab !== 'island') toast(`💰 ${fmt(sum)} 골드를 걷었어요!`);
  save();
  refreshLive();
  updateHud();
}

function openPlot(i) {
  i = Number(i);
  const p = S.plots[i];
  if (!p) return openBuild(i);
  if (p.kind === 'mountain') return openBreed();
  if (p.kind === 'hatchery') return openHatchery();
  if (p.kind === 'farm') return openFarm(i);
  if (p.kind === 'hab') return openHab(i);
}

// ----- 건설 -----
function openBuild(i) {
  const owned = new Set(S.plots.filter(p => p && p.kind === 'hab').map(p => p.el));
  const habBtn = (el) => `
    <button class="build-opt" data-act="build" data-i="${i}" data-what="hab:${el}" style="--hc:${habColor(el)}">
      <span class="bo-ico">${habEmoji(el)}</span>
      <span class="bo-nm">${habName(el)}${owned.has(el) ? ' <small>(보유)</small>' : ''}</span>
      <span class="bo-cost">💰 ${fmt(habBuildCost(el))}</span>
    </button>`;
  showModal(`
    <h3>🏗️ 건설하기</h3>
    <p class="muted">몬스터는 자기 속성과 같은 서식지에서만 살 수 있어요.</p>
    <div class="build-list">
      <button class="build-opt" data-act="build" data-i="${i}" data-what="farm" style="--hc:#8b5a2b">
        <span class="bo-ico">🌾</span><span class="bo-nm">농장</span><span class="bo-cost">💰 ${fmt(FARM_COST)}</span>
      </button>
      ${EL.map(e => habBtn(e.id)).join('')}
      ${habBtn('legend')}
    </div>
    <div class="row"><button class="btn ghost small" data-act="close">닫기</button></div>`);
}

function build(i, what) {
  i = Number(i);
  if (S.plots[i]) return;
  if (what === 'farm') {
    if (!spend(FARM_COST)) return;
    S.plots[i] = { kind: 'farm', crop: null, end: 0 };
    toast('🌾 농장을 지었어요!');
  } else {
    const el = what.split(':')[1];
    if (!spend(habBuildCost(el))) return;
    S.plots[i] = { kind: 'hab', el, lv: 1, gold: 0 };
    toast(`${habEmoji(el)} ${habName(el)}을(를) 지었어요!`);
  }
  save();
  closeModal();
  render();
}

// ----- 서식지 -----
function openHab(i) {
  const p = S.plots[i];
  const mons = habMons(i);
  const maxed = p.lv >= HAB_MAX_LV;
  backTo(() => openHab(i));
  showModal(`
    <div class="hab-head" style="--hc:${habColor(p.el)}">${habEmoji(p.el)}</div>
    <h3>${habName(p.el)} <small class="muted">Lv.${p.lv}</small></h3>
    <p class="muted">몬스터 ${mons.length}/${habCap(i)} · 초당 💰 ${fmt(habIncome(i))}</p>
    <div class="bar gold"><div data-bar="hab:${i}"></div></div>
    <div class="store" data-live="hab:${i}"></div>
    <div class="row">
      <button class="btn" data-act="collectHab" data-i="${i}">💰 골드 걷기</button>
      <button class="btn ghost" data-act="upHab" data-i="${i}" ${maxed ? 'disabled' : ''}>⬆️ ${maxed ? '최대 레벨' : `업그레이드 (💰 ${fmt(habUpCost(p.lv))})`}</button>
    </div>
    <div class="grid small">${mons.length
      ? sortMons(mons).map(m => card(m, `data-act="openMon" data-uid="${m.uid}"`)).join('')
      : '<p class="muted">아직 사는 몬스터가 없어요. 교배산에서 몬스터를 만들어 보세요!</p>'}</div>
    <div class="row"><button class="btn ghost small" data-act="close">닫기</button></div>`);
}

function collectHab(i, quiet = false) {
  i = Number(i);
  const p = S.plots[i];
  const n = Math.floor(p.gold);
  if (!n) { toast('아직 걷을 골드가 없어요'); return; }
  p.gold -= n;
  earn(n);
  floatAt(i, `+${fmt(n)}`);
  if (!quiet) toast(`💰 ${fmt(n)} 골드!`);
  save();
  refreshLive();
  updateHud();
}

function upHab(i) {
  i = Number(i);
  const p = S.plots[i];
  if (p.lv >= HAB_MAX_LV) return;
  if (!spend(habUpCost(p.lv))) return;
  p.lv++;
  toast(`⬆️ ${habName(p.el)} Lv.${p.lv}! 이제 ${habCap(i)}마리까지 살 수 있어요`);
  save();
  openHab(i);
  render();
}

// ----- 농장 -----
function openFarm(i) {
  const p = S.plots[i];
  if (p.crop == null) {
    showModal(`
      <h3>🌾 농장</h3>
      <p class="muted">심을 작물을 골라요. 다 자라면 수확해서 먹이 🍖로 바꿔요.</p>
      <div class="build-list">${CROPS.map((c, ci) => `
        <button class="build-opt" data-act="plant" data-i="${i}" data-c="${ci}" style="--hc:#4cd964">
          <span class="bo-ico">${c.emoji}</span>
          <span class="bo-nm">${c.name}<br><small>🍖 ${fmt(c.food)} · ${mmss(c.time)}</small></span>
          <span class="bo-cost">💰 ${fmt(c.cost)}</span>
        </button>`).join('')}</div>
      <div class="row"><button class="btn ghost small" data-act="close">닫기</button></div>`);
    return;
  }
  const c = CROPS[p.crop];
  showModal(`
    <div class="egg-big">${c.emoji}</div>
    <h3>${c.name}</h3>
    <p class="muted">수확하면 🍖 ${fmt(c.food)}</p>
    <div class="timer" data-live="farm:${i}"></div>
    <div class="bar green"><div data-bar="farm:${i}"></div></div>
    <div class="row">
      <button class="btn green" data-act="harvest" data-i="${i}">🧺 수확하기</button>
      <button class="btn ghost" data-act="farmGem" data-i="${i}">💎 <span data-live="farmGem:${i}"></span> 즉시 완성</button>
    </div>
    <div class="row"><button class="btn ghost small" data-act="close">닫기</button></div>`);
}

function plant(i, ci) {
  i = Number(i); ci = Number(ci);
  const p = S.plots[i];
  if (p.crop != null) return;
  if (!spend(CROPS[ci].cost)) return;
  p.crop = ci;
  p.end = Date.now() + CROPS[ci].time * 1000;
  save();
  openFarm(i);
  render();
}

function harvest(i) {
  i = Number(i);
  const p = S.plots[i];
  if (p.crop == null) return;
  if (Date.now() < p.end) { toast('아직 자라는 중이에요 🌱'); return; }
  const food = CROPS[p.crop].food;
  S.food += food;
  p.crop = null;
  toast(`🍖 먹이 ${fmt(food)}개 수확!`);
  save();
  closeModal();
  render();
}

function farmGem(i) {
  const p = S.plots[Number(i)];
  const left = (p.end - Date.now()) / 1000;
  if (p.crop == null || left <= 0) return;
  if (!spend(gemCost(left, 20), 'gems')) return;
  p.end = Date.now();
  save();
  refreshLive();
  updateHud();
}

// ----- 교배산 -----
function breedHint(total) {
  if (total >= RAR.mythic.time) return '🌌 전설을 넘어선 무언가가 태어나려 해요!!!';
  if (total >= RAR.legendary.time) return '🌟 이렇게 긴 시간이라니… 레전더리 예감!!';
  if (total >= RAR.epic.time) return '⚡ 강한 기운이 느껴져요! 에픽급이에요!';
  if (total >= RAR.rare.time) return '오, 조금 특별한 기운이…';
  return '평범한 알 같아요';
}

function openBreed() {
  if (S.breed) {
    const b = S.breed;
    const done = Date.now() >= b.end;
    showModal(`
      <h3>🏔️ 교배산</h3>
      <div class="egg ${done ? 'ready' : 'lv' + (rIdx(b.type) + 1)}">🥚</div>
      <div class="timer" data-live="breed"></div>
      <div class="hint">${breedHint(b.total)}</div>
      <div class="parents">${b.parents.join(' + ')}</div>
      <div class="bar"><div data-bar="breed"></div></div>
      <div class="row">
        <button class="btn green" data-act="takeEgg">🥚 알 가져가기</button>
        <button class="btn ghost" data-act="breedGem">💎 <span data-live="breedGem"></span> 즉시 완성</button>
      </div>
      <div class="row"><button class="btn ghost small" data-act="close">닫기</button></div>`);
    return;
  }
  sel = sel.filter(u => byUid(u));
  const [a, b] = sel.map(byUid);
  const slot = (m) => m ? card(m, '', 'mini') : '?';
  showModal(`
    <h3>🏔️ 교배산</h3>
    <p class="muted">Lv.${BREED_LV} 이상 몬스터 두 마리를 골라 섞어요. 타이머가 길게 뜰수록 높은 등급!</p>
    <div class="slots">
      <div class="slot">${slot(a)}</div><div class="plus">+</div><div class="slot">${slot(b)}</div>
    </div>
    <div class="row">
      <button class="btn big" data-act="breed" ${a && b ? '' : 'disabled'}>⛰️ 교배 시작${a && b ? ` (💰 ${fmt(breedCost(a, b))})` : ''}</button>
    </div>
    <div class="grid small">${sortMons(S.monsters).map(m => {
      const ok = m.lv >= BREED_LV;
      const i = sel.indexOf(m.uid);
      return card(m, ok ? `data-act="pick" data-uid="${m.uid}"` : '', `${i >= 0 ? 'sel' : ''} ${ok ? '' : 'locked'}`,
        i >= 0 ? `<div class="check">${i + 1}</div>` : ok ? '' : `<div class="lock">Lv.${BREED_LV} 필요</div>`);
    }).join('')}</div>
    <div class="row"><button class="btn ghost small" data-act="close">닫기</button></div>`);
}

function pickBreed(uid) {
  uid = Number(uid);
  const i = sel.indexOf(uid);
  if (i >= 0) sel.splice(i, 1);
  else if (sel.length < 2) sel.push(uid);
  else sel[1] = uid;
  openBreed();
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
  openBreed();
  refreshLive();
  updateHud();
}

function breedGem() {
  if (!S.breed) return;
  const left = (S.breed.end - Date.now()) / 1000;
  if (left <= 0) return;
  if (!spend(gemCost(left, 10), 'gems')) return;
  S.breed.end = Date.now();
  save();
  openBreed();
  updateHud();
}

function takeEgg() {
  if (!S.breed) return;
  if (Date.now() < S.breed.end) { toast('아직 알이 준비되지 않았어요 ⏳'); return; }
  if (S.hatch.length >= HATCH_CAP) { toast('부화장이 가득 찼어요! 먼저 부화시켜 주세요'); return; }
  S.hatch.push(S.breed.type);
  S.breed = null;
  save();
  render();
  openHatchery();
}

// ----- 부화장 -----
function openHatchery() {
  showModal(`
    <h3>🪺 부화장 <small class="muted">${S.hatch.length}/${HATCH_CAP}</small></h3>
    <p class="muted">알을 부화시켜 알맞은 서식지로 보내 주세요.</p>
    <div class="egg-row">${S.hatch.length
      ? S.hatch.map((t, i) => `<button class="egg-slot" data-act="hatchOne" data-idx="${i}"><span class="egg small lv${rIdx(t) + 1}">🥚</span><span>부화!</span></button>`).join('')
      : '<p class="muted">부화장이 비어 있어요. 교배산에서 알을 가져오세요!</p>'}</div>
    <div class="row"><button class="btn ghost small" data-act="close">닫기</button></div>`);
}

function hatchOne(idx) {
  idx = Number(idx);
  const type = S.hatch[idx];
  if (!type) return;
  const isNew = !S.dex[type];
  S.dex[type] = true;
  save();
  const c = CAT[type], r = RAR[c.rarity];
  const habs = habsFor(type);
  const need = isLegend(type) ? `${habEmoji('legend')} 전설의 서식지` : c.els.map(e => `${habEmoji(e)} ${habName(e)}`).join(' 또는 ');
  showModal(`
    <div class="reveal">
      ${isNew ? '<div class="new-badge">NEW! 도감 등록</div>' : ''}
      <div class="face big" style="background:${grad(c)}">${c.face}</div>
      <h3>${c.name}</h3>
      <div class="rar" style="color:${r.color}; font-size:18px">${r.name}</div>
      <div class="els">${elNames(c.els)}</div>
      <h4 class="sub">어디서 살까요?</h4>
      ${habs.length
        ? `<div class="build-list">${habs.map(({ p, i }) => `
            <button class="build-opt" data-act="place" data-idx="${idx}" data-i="${i}" style="--hc:${habColor(p.el)}">
              <span class="bo-ico">${habEmoji(p.el)}</span>
              <span class="bo-nm">${habName(p.el)} Lv.${p.lv}</span>
              <span class="bo-cost">${habMons(i).length}/${habCap(i)}</span>
            </button>`).join('')}</div>`
        : `<p class="warn">살 수 있는 빈 서식지가 없어요!<br>필요한 곳: ${need}<br>섬에 서식지를 짓거나 업그레이드한 뒤 다시 부화시켜 주세요.</p>`}
      <div class="row">
        <button class="btn ghost small" data-act="sellEgg" data-idx="${idx}">팔기 (+💰 ${fmt(RAR[c.rarity].cost / 2)})</button>
        <button class="btn ghost small" data-act="close">나중에</button>
      </div>
    </div>`);
}

function place(idx, i) {
  idx = Number(idx); i = Number(i);
  const type = S.hatch[idx];
  if (!type || !habsFor(type).some(h => h.i === i)) return;
  S.hatch.splice(idx, 1);
  S.monsters.push({ uid: S.nextUid++, type, lv: 1, hab: i, runes: [null, null] });
  toast(`${CAT[type].face} ${CAT[type].name}이(가) ${habName(S.plots[i].el)}으로 이사했어요!`);
  save();
  closeModal();
  render();
}

function sellEgg(idx) {
  idx = Number(idx);
  const type = S.hatch[idx];
  if (!type) return;
  S.hatch.splice(idx, 1);
  earn(RAR[CAT[type].rarity].cost / 2);
  save();
  closeModal();
  render();
}

// ===================== 몬스터 상세 / 룬 =====================
function openMon(uid) {
  const m = byUid(uid);
  if (!m) return;
  const c = CAT[m.type], r = RAR[c.rarity], st = stats(m);
  const max = m.lv >= MAX_LV;
  const back = modalStack;
  const runeSlot = (slot) => {
    const rid = m.runes[slot];
    const rune = rid != null && S.runes.find(x => x.id === rid);
    return rune
      ? `<button class="rune-slot on" data-act="unequip" data-uid="${m.uid}" data-slot="${slot}">${runeText(rune)}<small>눌러서 빼기</small></button>`
      : `<button class="rune-slot" data-act="runePick" data-uid="${m.uid}" data-slot="${slot}">＋ 룬 장착</button>`;
  };
  showModal(`
    <div class="face big" style="background:${grad(c)}">${c.face}</div>
    <h3>${c.name}</h3>
    <div class="rar" style="color:${r.color}">${r.name} · Lv.${m.lv}${max ? ' (MAX)' : ''}</div>
    <div class="els">${elNames(c.els)}</div>
    <div class="statbox">
      <div>❤️ 체력<b>${fmt(st.hp)}</b></div>
      <div>⚔️ 공격<b>${fmt(st.atk)}</b></div>
      <div>👟 속도<b>${fmt(st.spd)}</b></div>
      <div>💰 초당<b>${fmt(monIncome(m))}</b></div>
    </div>
    <h4 class="sub">스킬</h4>
    <div class="skill-list">${c.skills.map(sk => `
      <div class="skill-info"><span>${EL[ELI[sk.el]].emoji} <b>${sk.name}</b></span><span class="muted">${skDesc(sk)}</span><span class="sta">⚡${sk.cost}</span></div>`).join('')}</div>
    <h4 class="sub">룬</h4>
    <div class="rune-slots">${runeSlot(0)}${runeSlot(1)}</div>
    <div class="row">
      <button class="btn" data-act="feed" data-uid="${m.uid}" ${max ? 'disabled' : ''}>🍖 먹이 주기 (${fmt(feedCost(m))})</button>
      <button class="btn ghost" data-act="sell" data-uid="${m.uid}">팔기 (+💰 ${fmt(sellPrice(m))})</button>
    </div>
    <div class="row"><button class="btn ghost small" data-act="${back ? 'back' : 'close'}">${back ? '← 뒤로' : '닫기'}</button></div>`);
  modalStack = back;
}

function feed(uid) {
  const m = byUid(uid);
  if (!m || m.lv >= MAX_LV) return;
  const cost = feedCost(m);
  if (S.food < cost) { toast('🍖 먹이가 부족해요. 농장에서 키워 보세요!'); return; }
  S.food -= cost;
  m.lv++;
  if (m.lv === BREED_LV) toast(`🎉 Lv.${BREED_LV}! 이제 교배할 수 있어요`);
  save();
  openMon(uid);
  updateHud();
  if (tab !== 'island') render();
}

function sell(uid) {
  const m = byUid(uid);
  if (!m) return;
  if (S.monsters.length <= 2) { toast('교배하려면 몬스터가 최소 2마리 필요해요'); return; }
  if (!confirm(`${CAT[m.type].name}을(를) 팔까요?`)) return;
  m.runes.forEach(id => { const r = S.runes.find(x => x.id === id); if (r) r.on = null; });
  earn(sellPrice(m));
  S.monsters = S.monsters.filter(x => x.uid !== m.uid);
  S.team = S.team.filter(u => u !== m.uid);
  sel = sel.filter(u => u !== m.uid);
  save();
  closeModal();
  toast(`${CAT[m.type].name}을(를) 팔았어요`);
  render();
}

function runePick(uid, slot) {
  const free = S.runes.filter(r => r.on == null).sort((a, b) => b.lv - a.lv || a.t.localeCompare(b.t));
  showModal(`
    <h3>💠 룬 고르기</h3>
    <div class="build-list">${free.length
      ? free.map(r => `<button class="build-opt" data-act="equip" data-uid="${uid}" data-slot="${slot}" data-rid="${r.id}" style="--hc:#c28cff"><span class="bo-nm">${runeText(r)}</span></button>`).join('')
      : '<p class="muted">가진 룬이 없어요. 상점이나 모험에서 얻을 수 있어요!</p>'}</div>
    <div class="row"><button class="btn ghost small" data-act="openMon" data-uid="${uid}">← 뒤로</button></div>`);
}

function equip(uid, slot, rid) {
  const m = byUid(uid), r = S.runes.find(x => x.id === Number(rid));
  if (!m || !r || r.on != null) return;
  const old = m.runes[slot];
  if (old != null) { const o = S.runes.find(x => x.id === old); if (o) o.on = null; }
  m.runes[Number(slot)] = r.id;
  r.on = m.uid;
  save();
  openMon(uid);
}

function unequip(uid, slot) {
  const m = byUid(uid);
  if (!m) return;
  const r = S.runes.find(x => x.id === m.runes[slot]);
  if (r) r.on = null;
  m.runes[Number(slot)] = null;
  save();
  openMon(uid);
}

function giveRune(lvWeights) {
  const roll = Math.random();
  let acc = 0, lv = 1;
  for (let i = 0; i < lvWeights.length; i++) { acc += lvWeights[i]; if (roll < acc) { lv = i + 1; break; } }
  const r = { id: S.nextRune++, t: pick(Object.keys(RUNE)), lv, on: null };
  S.runes.push(r);
  return r;
}

// ===================== 화면: 몬스터 =====================
function renderMons() {
  view.innerHTML = `
    <div class="sec-head">
      <h2>내 몬스터 <small>${S.monsters.length}마리</small></h2>
      <p>누르면 능력치, 스킬, 룬을 볼 수 있고 먹이를 줄 수 있어요.</p>
    </div>
    ${S.hatch.length ? `<div class="notice" data-act="openHatch">🪺 부화장에 알이 ${S.hatch.length}개 기다리고 있어요! →</div>` : ''}
    <div class="grid">${sortMons(S.monsters).map(m => card(m, `data-act="openMon" data-uid="${m.uid}"`)).join('')}</div>`;
}

// ===================== 화면: 상점 =====================
function renderShop() {
  const groups = {};
  S.runes.forEach(r => {
    const k = `${r.t}:${r.lv}`;
    groups[k] = groups[k] || { t: r.t, lv: r.lv, total: 0, free: 0 };
    groups[k].total++;
    if (r.on == null) groups[k].free++;
  });
  const list = Object.values(groups).sort((a, b) => b.lv - a.lv || a.t.localeCompare(b.t));
  view.innerHTML = `
    <div class="sec-head"><h2>상점</h2><p>룬을 뽑아 몬스터를 강하게 만들고, 먹이와 골드를 살 수 있어요.</p></div>
    <div class="shop">
      <button class="shop-item" data-act="buyRune" data-kind="gold"><span class="si-ico">📦</span><span class="si-nm">룬 상자<small>★ 70% · ★★ 25% · ★★★ 5%</small></span><span class="si-cost">💰 1,000</span></button>
      <button class="shop-item" data-act="buyRune" data-kind="gem"><span class="si-ico">🎁</span><span class="si-nm">고급 룬 상자<small>★★ 60% · ★★★ 40%</small></span><span class="si-cost">💎 20</span></button>
      <button class="shop-item" data-act="buyFood" data-n="100"><span class="si-ico">🍖</span><span class="si-nm">먹이 100개</span><span class="si-cost">💰 150</span></button>
      <button class="shop-item" data-act="buyFood" data-n="1000"><span class="si-ico">🍖</span><span class="si-nm">먹이 1,000개</span><span class="si-cost">💰 1,500</span></button>
      <button class="shop-item" data-act="buyGold" data-n="5"><span class="si-ico">💰</span><span class="si-nm">골드 500</span><span class="si-cost">💎 5</span></button>
      <button class="shop-item" data-act="buyGold" data-n="50"><span class="si-ico">💰</span><span class="si-nm">골드 6,000</span><span class="si-cost">💎 50</span></button>
    </div>
    <h3 class="sub">🥚 몬스터 상점 <small class="muted">기본 몬스터 알을 살 수 있어요 (부화장으로 가요)</small></h3>
    <div class="grid small">${BASE.map(e => card({ type: 'p:' + e, lv: 1 }, `data-act="buyMon" data-type="p:${e}"`, 'mini',
      `<div class="price-tag">💰 ${fmt(MON_PRICE)}</div>`)).join('')}</div>
    <h3 class="sub">👑 전설 상점<small class="muted">골드로 살 수 있어요… 모을 수만 있다면요</small></h3>
    <div class="legend-shop">${SHOP_LEGENDS.map(l => {
      const c = CAT[l.id];
      const owned = S.monsters.filter(m => m.type === l.id).length + S.hatch.filter(t => t === l.id).length;
      const can = S.infinite || S.gold >= l.price;
      return `<div class="legend-item">
        <div class="face" style="background:${grad(c)}">${c.face}</div>
        <div class="li-info">
          <div class="li-nm">${c.name}${owned ? ` <small class="muted">보유 ${owned}</small>` : ''}</div>
          <div class="li-els">${elNames(c.els)} · <span class="rar" style="color:${RAR.divine.color}">초월</span></div>
          <div class="li-price">💰 ${fmt(l.price)}</div>
          <div class="li-wait muted">${S.infinite ? '♾️ 돈 무한이라 바로 살 수 있어요!' : waitText(l.price)}</div>
        </div>
        <button class="btn" data-act="buyLegend" data-id="${l.id}" ${can ? '' : 'disabled'}>구매</button>
      </div>`;
    }).join('')}</div>
    <h3 class="sub">💠 내 룬 <small class="muted">같은 룬 3개를 합성하면 한 단계 위 룬이 돼요</small></h3>
    <div class="rune-inv">${list.length ? list.map(g => `
      <div class="rune-row">
        <span>${runeText(g)}</span>
        <span class="muted">${g.total}개 (장착 ${g.total - g.free})</span>
        <button class="btn small" data-act="merge" data-t="${g.t}" data-lv="${g.lv}" ${g.free >= 3 && g.lv < 3 ? '' : 'disabled'}>합성</button>
      </div>`).join('') : '<p class="muted">아직 룬이 없어요.</p>'}</div>`;
}

// 지금 수입으로 모으려면 얼마나 걸리는지 (절망 표시기)
function waitText(price) {
  const inc = S.plots.reduce((s, p, i) => s + (p && p.kind === 'hab' ? habIncome(i) : 0), 0);
  const left = price - S.gold;
  if (left <= 0) return '살 수 있어요!';
  if (inc <= 0) return '지금 수입으로는 영원히 못 모아요';
  const years = left / inc / 31536000;
  if (years < 1) return `지금 수입으로 약 ${fmt(left / inc / 86400)}일`;
  return `지금 수입으로 약 ${fmt(years)}년 😱`;
}

const MON_PRICE = 500;
function buyMon(type) {
  if (!CAT[type]) return;
  if (S.hatch.length >= HATCH_CAP) { toast('부화장이 가득 찼어요! 먼저 부화시켜 주세요'); return; }
  if (!spend(MON_PRICE)) return;
  S.hatch.push(type);
  save();
  toast(`🥚 ${CAT[type].name} 알을 샀어요!`);
  render();
  openHatchery();
}

function buyLegend(id) {
  const l = SHOP_LEGENDS.find(x => x.id === id);
  if (!l) return;
  if (S.hatch.length >= HATCH_CAP) { toast('부화장이 가득 찼어요! 먼저 부화시켜 주세요'); return; }
  if (!spend(l.price)) return;
  S.hatch.push(l.id);
  save();
  toast(`👑 ${CAT[l.id].name} 구매! 부화장에서 부화시켜 주세요`);
  render();
  openHatchery();
}

function buyRune(kind) {
  if (kind === 'gold' ? !spend(1000) : !spend(20, 'gems')) return;
  const r = giveRune(kind === 'gold' ? [0.7, 0.25, 0.05] : [0, 0.6, 0.4]);
  toast(`💠 ${runeText(r)} 획득!`);
  save();
  render();
}

function buyFood(n) {
  n = Number(n);
  if (!spend(n * 1.5)) return;
  S.food += n;
  toast(`🍖 먹이 ${fmt(n)}개 구매!`);
  save();
  updateHud();
}

function buyGold(n) {
  n = Number(n);
  if (!spend(n, 'gems')) return;
  const g = n === 5 ? 500 : 6000;
  earn(g);
  toast(`💰 ${fmt(g)} 골드 구매!`);
  save();
  updateHud();
}

function merge(t, lv) {
  lv = Number(lv);
  const free = S.runes.filter(r => r.t === t && r.lv === lv && r.on == null);
  if (free.length < 3 || lv >= 3) return;
  const ids = free.slice(0, 3).map(r => r.id);
  S.runes = S.runes.filter(r => !ids.includes(r.id));
  const r = { id: S.nextRune++, t, lv: lv + 1, on: null };
  S.runes.push(r);
  toast(`✨ ${runeText(r)} 합성 성공!`);
  save();
  render();
}

// ===================== 화면: 모험 =====================
function enemyTeam(stage) {
  let seed = stage * 7919 + 13;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const tier = Math.min(4, Math.floor((stage - 1) / 5));
  const res = [];
  for (let i = 0; i < 3; i++) {
    const ri = Math.max(0, tier - (rnd() < 0.35 ? 1 : 0));
    const pool = CAT_LIST.filter(c => c.rarity === RAR_ORDER[ri]);
    const c = pool[Math.floor(rnd() * pool.length)];
    const lv = Math.min(MAX_LV, stage + Math.floor(rnd() * 2));
    res.push({ type: c.id, lv });
  }
  return res;
}

function renderAdventure() {
  S.team = S.team.filter(u => byUid(u));
  const foes = enemyTeam(S.stage);
  const foeEls = [...new Set(foes.flatMap(f => CAT[f.type].els))];
  const weak = EL.filter(e => BEATS[e.id].some(x => foeEls.includes(x)));
  const team = S.team.map(byUid);
  const slots = [0, 1, 2].map(i => `<div class="slot">${team[i] ? card(team[i], `data-act="team" data-uid="${team[i].uid}"`, 'mini') : '?'}</div>`).join('');
  view.innerHTML = `
    <div class="sec-head"><h2>모험 · 스테이지 ${S.stage}</h2><p>몬스터 3마리로 팀을 짜요. 속도가 빠른 몬스터가 먼저 움직이고, 스킬은 스태미나(⚡)를 써요.</p></div>
    <div class="stage-box">
      <h3>👹 상대 팀</h3>
      <div class="team-row">${foes.map(f => card(f, '', 'mini')).join('')}</div>
      <p class="weak">약점 속성: ${weak.map(e => `${e.emoji}${e.name}`).join(' ') || '없음'}</p>
    </div>
    <div class="stage-box mine">
      <h3>🛡️ 내 팀</h3>
      <div class="team-row">${slots}</div>
      <div class="row"><button class="btn big" data-act="fight" ${team.length ? '' : 'disabled'}>⚔️ 전투 시작</button></div>
    </div>
    <h3 class="sub">몬스터를 눌러 팀에 넣거나 빼세요</h3>
    <div class="grid">${sortMons(S.monsters).map(m => {
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
  renderAdventure();
}

// ===================== 턴제 전투 =====================
let B = null;

function mkUnit(m, side, idx) {
  const c = CAT[m.type], st = stats(m);
  return {
    id: side + idx, side, c, lv: m.lv,
    maxHp: st.hp, hp: st.hp, atk: st.atk, spd: st.spd, sta: 2,
    fx: { burn: 0, burnDmg: 0, poison: 0, poisonDmg: 0, stun: 0, shield: 0, buff: 0, curse: 0 },
  };
}
const aliveOf = (side) => B.units.filter(u => u.side === side && u.hp > 0);
const unitById = (id) => B.units.find(u => u.id === id);

function startBattle() {
  const team = S.team.map(byUid).filter(Boolean);
  if (!team.length || B) return;
  const foes = enemyTeam(S.stage);
  B = {
    stage: S.stage,
    units: [...team.map((m, i) => mkUnit(m, 'me', i)), ...foes.map((m, i) => mkUnit(m, 'foe', i))],
    order: [], cur: null, target: 'foe0', log: [], round: 0,
    waiting: false, over: false, fast: false, timer: null, result: null,
  };
  $('#battle').classList.remove('hidden');

  logB(`⚔️ 스테이지 ${S.stage} 전투 시작!`);
  nextTurn();
}

function logB(msg) {
  B.log.push(msg);
  if (B.log.length > 30) B.log.shift();
}
function later(fn, ms = 800) { B.timer = setTimeout(fn, B.fast ? 150 : ms); }

function nextTurn() {
  if (!B || B.over) return;
  if (checkEnd()) return;
  while (B.order.length && B.order[0].hp <= 0) B.order.shift();
  if (!B.order.length) {
    B.round++;
    B.order = B.units.filter(u => u.hp > 0).sort((a, b) => b.spd - a.spd || Math.random() - 0.5);
  }
  const u = B.order.shift();
  B.cur = u;
  u.sta = Math.min(MAX_STA, u.sta + 2);

  for (const [k, label] of [['burn', '🔥 화상'], ['poison', '🧪 중독']]) {
    if (u.fx[k] > 0 && u.hp > 0) {
      u.hp = Math.max(0, u.hp - u.fx[k + 'Dmg']);
      u.fx[k]--;
      logB(`${label} 피해! ${u.c.name} -${fmt(u.fx[k + 'Dmg'])}${u.hp <= 0 ? ' 💀 쓰러졌다!' : ''}`);
    }
  }
  if (u.hp <= 0) { drawBattle(); later(nextTurn); return; }
  if (u.fx.stun > 0) {
    u.fx.stun--;
    tickFx(u);
    logB(`💫 ${u.c.name}은(는) 기절해서 움직일 수 없다!`);
    drawBattle();
    later(nextTurn);
    return;
  }
  if (u.side === 'me') {
    const t = unitById(B.target);
    if (!t || t.hp <= 0) B.target = aliveOf('foe')[0].id;
    B.waiting = true;
    drawBattle();
  } else {
    drawBattle();
    later(() => aiAct(u), 700);
  }
}

// 자기 턴이 올 때마다 지속 효과가 1씩 줄어든다
function tickFx(u) {
  ['shield', 'buff', 'curse'].forEach(k => { if (u.fx[k] > 0) u.fx[k]--; });
}

function calcDmg(u, t, sk, mult) {
  const adv = advantage([sk.el], t.c.els);
  const atk = u.atk * (u.fx.buff > 0 ? 1.4 : 1) * (u.fx.curse > 0 ? 0.7 : 1);
  const d = atk * mult * adv * (0.9 + Math.random() * 0.2) * (t.fx.shield > 0 ? 0.5 : 1);
  return { d: Math.max(1, Math.round(d)), adv };
}

function useSkill(u, sk, tgt) {
  tickFx(u);
  u.sta -= sk.cost;
  const foes = aliveOf(u.side === 'me' ? 'foe' : 'me');
  const allies = aliveOf(u.side);
  let msg = `${u.c.face} ${u.c.name}의 ${sk.name}!`;
  const hit = (t, mult) => {
    const { d, adv } = calcDmg(u, t, sk, mult);
    t.hp = Math.max(0, t.hp - d);
    t.flash = true;
    msg += ` → ${t.c.name} -${fmt(d)}${adv > 1 ? ' (효과가 굉장했다!)' : adv < 1 ? ' (효과가 별로다…)' : ''}${t.hp <= 0 ? ' 💀' : ''}`;
    return t.hp > 0;
  };
  switch (sk.type) {
    case 'dmg':
      if (sk.aoe) foes.forEach(t => hit(t, sk.mult)); else hit(tgt, sk.mult);
      break;
    case 'burn':
      if (hit(tgt, sk.mult)) { tgt.fx.burn = 3; tgt.fx.burnDmg = Math.round(u.atk * 0.3); msg += ' 🔥화상!'; }
      break;
    case 'poison':
      if (hit(tgt, sk.mult)) { tgt.fx.poison = 4; tgt.fx.poisonDmg = Math.round(u.atk * 0.25); msg += ' 🧪중독!'; }
      break;
    case 'stun':
      if (hit(tgt, sk.mult) && Math.random() < 0.6) { tgt.fx.stun = 1; msg += ' 💫기절!'; }
      break;
    case 'curse':
      if (hit(tgt, sk.mult)) { tgt.fx.curse = 2; msg += ' 💀공격력 감소!'; }
      break;
    case 'healTeam':
      allies.forEach(a => { a.hp = Math.min(a.maxHp, a.hp + Math.round(a.maxHp * sk.v)); });
      msg += ' 💚 아군 전체 회복!';
      break;
    case 'healSelf':
      u.hp = Math.min(u.maxHp, u.hp + Math.round(u.maxHp * sk.v));
      msg += ' 💚 체력 회복!';
      break;
    case 'shield':
      u.fx.shield = 2;
      msg += ' 🛡️ 받는 피해 절반!';
      break;
    case 'buffSelf':
      u.fx.buff = 3;
      msg += ' 💪 공격력 증가!';
      break;
    case 'buffTeam':
      allies.forEach(a => { a.fx.buff = a === u ? 3 : 2; });
      msg += ' 💪 아군 전체 공격력 증가!';
      break;
  }
  logB(msg);
  B.waiting = false;
  drawBattle();
  B.units.forEach(x => { x.flash = false; });
  later(nextTurn);
}

function aiAct(u) {
  if (!B || B.over) return;
  const allies = aliveOf(u.side);
  const opts = u.c.skills.filter(s => s.cost <= u.sta).filter(s => {
    if (s.type === 'healTeam' || s.type === 'healSelf') return allies.some(a => a.hp < a.maxHp * 0.6);
    if (s.type === 'shield') return !u.fx.shield;
    if (s.type === 'buffSelf' || s.type === 'buffTeam') return !u.fx.buff;
    return true;
  });
  const strong = opts.filter(s => s.cost > 0);
  const sk = strong.length && Math.random() < 0.75 ? pick(strong) : opts[0];
  const foes = aliveOf('me');
  const tgt = foes.slice().sort((a, b) =>
    advantage([sk.el], b.c.els) - advantage([sk.el], a.c.els) || a.hp - b.hp)[0];
  useSkill(u, sk, tgt);
}

function playerSkill(i) {
  if (!B || !B.waiting) return;
  const u = B.cur, sk = u.c.skills[Number(i)];
  if (!sk || sk.cost > u.sta) return;
  let tgt = unitById(B.target);
  if (!tgt || tgt.hp <= 0) tgt = aliveOf('foe')[0];
  useSkill(u, sk, tgt);
}

function setTarget(id) {
  const u = unitById(id);
  if (!u || u.side !== 'foe' || u.hp <= 0) return;
  B.target = id;
  drawBattle();
}

function checkEnd() {
  const winA = !aliveOf('foe').length, loseA = !aliveOf('me').length;
  if (!winA && !loseA) return false;
  endBattle(winA);
  return true;
}

function endBattle(win) {
  B.over = true;
  B.waiting = false;
  clearTimeout(B.timer);
  const rewards = [];
  if (win) {
    const gold = Math.round(120 * Math.pow(1.25, B.stage - 1));
    earn(gold);
    rewards.push(`💰 ${fmt(gold)}`);
    const gems = B.stage % 5 === 0 ? 20 : 5;
    earn(gems, 'gems');
    rewards.push(`💎 ${gems}`);
    if (Math.random() < 0.35) {
      const r = giveRune(B.stage >= 10 ? [0.5, 0.4, 0.1] : [0.8, 0.18, 0.02]);
      rewards.push(runeText(r));
    }
    S.stage++;
  }
  B.result = { win, rewards };
  save();
  drawBattle();
  updateHud();
}

function quitBattle() {
  if (!B) return;
  if (!B.over && !confirm('전투를 포기할까요?')) return;
  clearTimeout(B.timer);
  B = null;
  $('#battle').classList.add('hidden');

  render();
}

function unitHTML(u) {
  const isCur = B.cur === u && !B.over;
  const isTgt = u.side === 'foe' && B.target === u.id && B.waiting;
  const fx = [
    u.fx.burn ? '🔥' : '', u.fx.poison ? '🧪' : '', u.fx.stun ? '💫' : '', u.fx.shield ? '🛡️' : '',
    u.fx.buff ? '💪' : '', u.fx.curse ? '💀' : '',
  ].join('');
  return `<div class="unit ${u.side} ${isCur ? 'cur' : ''} ${isTgt ? 'tgt' : ''} ${u.hp <= 0 ? 'dead' : ''} ${u.flash ? 'hit' : ''}"
      ${u.side === 'foe' ? `data-act="bTarget" data-id="${u.id}"` : ''}>
    ${isTgt ? '<div class="tgt-mark">🎯</div>' : ''}
    <div class="u-face" style="background:${grad(u.c)}">${u.c.face}</div>
    <div class="u-nm">${u.c.name}</div>
    <div class="u-lv">Lv.${u.lv} ${elBadges(u.c.els)}</div>
    <div class="hp ${u.side === 'foe' ? 'enemy' : ''}"><div style="width:${u.hp / u.maxHp * 100}%"></div></div>
    <div class="u-hp">${fmt(u.hp)} / ${fmt(u.maxHp)}</div>
    <div class="u-sta">${'<i class="on"></i>'.repeat(u.sta)}${'<i></i>'.repeat(MAX_STA - u.sta)}</div>
    <div class="u-fx">${fx}</div>
  </div>`;
}

function drawBattle() {
  if (!B) return;
  const me = B.units.filter(u => u.side === 'me');
  const foes = B.units.filter(u => u.side === 'foe');
  let bottom = '';
  if (B.over) {
    const r = B.result;
    bottom = `<div class="b-result">
      <div class="result ${r.win ? 'win' : 'lose'}">${r.win ? '🏆 승리!' : '💥 패배…'}</div>
      <p>${r.win ? `보상: ${r.rewards.join(' · ')}` : '속성 상성을 생각하거나 몬스터를 키우고 룬을 끼워 보세요!'}</p>
      <button class="btn big" data-act="bQuit">확인</button>
    </div>`;
  } else if (B.waiting) {
    const u = B.cur;
    bottom = `<div class="b-turn">${u.c.face} <b>${u.c.name}</b>의 차례! 스킬을 고르세요 <span class="muted">(적을 눌러 타겟 변경)</span></div>
      <div class="skills">${u.c.skills.map((sk, i) => `
        <button class="skill" data-act="bSkill" data-i="${i}" ${sk.cost > u.sta ? 'disabled' : ''} style="--sc:${EL[ELI[sk.el]].color}">
          <span class="sk-nm">${EL[ELI[sk.el]].emoji} ${sk.name}</span>
          <span class="sk-desc">${skDesc(sk)}</span>
          <span class="sk-cost">⚡${sk.cost}</span>
        </button>`).join('')}</div>`;
  } else {
    bottom = `<div class="b-turn muted">${B.cur ? `${B.cur.c.face} ${B.cur.c.name}의 차례…` : ''}</div>`;
  }
  $('#battle').innerHTML = `
    <div class="b-inner">
      <div class="b-top">
        <b>스테이지 ${B.stage}</b><span class="muted">라운드 ${B.round}</span>
        <span class="spacer"></span>
        <button class="btn ghost small" data-act="bFast">${B.fast ? '▶️ 보통 속도' : '⏩ 빠르게'}</button>
        ${B.over ? '' : '<button class="btn ghost small" data-act="bQuit">🏳️ 포기</button>'}
      </div>
      <div class="b-side foe">${foes.map(unitHTML).join('')}</div>
      <div class="b-log">${B.log.slice(-4).map((l, i, a) => `<div class="${i === a.length - 1 ? 'last' : ''}">${l}</div>`).join('')}</div>
      <div class="b-side me">${me.map(unitHTML).join('')}</div>
      ${bottom}
    </div>`;
}

// ===================== 화면: 도감 =====================
function dexHint(c) {
  if (c.shop) return `전설 상점 💰${fmt(c.price)}`;
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
    <p class="muted">비밀코드를 입력하세요</p>
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
    closeModal();
    if (S.infinite) { toast('이미 돈 무한이에요 💰'); return; }
    S.infinite = true;
    save();
    updateHud();
    toast('💰💎 돈 무한 활성화! 마음껏 쓰세요!');
    render();
  } else {
    toast('❌ 틀린 코드예요');
    inp.select();
  }
}

// ===================== 렌더 / 이벤트 =====================
function render() {
  document.querySelectorAll('.bottom-bar [data-tab]').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
  $('#panel').classList.toggle('hidden', tab === 'island');
  if (tab === 'island') view.innerHTML = '';
  else if (tab === 'adventure') renderAdventure();
  else if (tab === 'mons') renderMons();
  else if (tab === 'shop') renderShop();
  else if (tab === 'dex') renderDex();
  updateHud();
  refreshLive();
}

function updateHud() {
  [['gold', S.gold], ['gems', S.gems]].forEach(([id, v]) => {
    const el = $('#' + id);
    el.textContent = S.infinite ? '∞' : fmt(v);
    el.classList.toggle('infinite', S.infinite);
  });
  $('#food').textContent = fmt(S.food);
}

function tick() {
  const now = Date.now();
  const dt = Math.min(8 * 3600, Math.max(0, (now - S.last) / 1000));
  S.last = now;
  S.plots.forEach((p, i) => {
    if (p && p.kind === 'hab') p.gold = Math.min(habGoldCap(i), p.gold + habIncome(i) * dt);
  });
  refreshLive();
}

const ACTIONS = {
  tab: (d) => { tab = d.tab; render(); $('#panel').scrollTop = 0; },
  plot: (d) => openPlot(d.i),
  collectAll: () => collectAll(),
  build: (d) => build(d.i, d.what),
  collectHab: (d) => collectHab(d.i),
  upHab: (d) => upHab(d.i),
  plant: (d) => plant(d.i, d.c),
  harvest: (d) => harvest(d.i),
  farmGem: (d) => farmGem(d.i),
  pick: (d) => pickBreed(d.uid),
  breed: () => startBreed(),
  breedGem: () => breedGem(),
  takeEgg: () => takeEgg(),
  openHatch: () => openHatchery(),
  hatchOne: (d) => hatchOne(d.idx),
  place: (d) => place(d.idx, d.i),
  sellEgg: (d) => sellEgg(d.idx),
  openMon: (d) => openMon(d.uid),
  feed: (d) => feed(d.uid),
  sell: (d) => sell(d.uid),
  runePick: (d) => runePick(d.uid, Number(d.slot)),
  equip: (d) => equip(d.uid, Number(d.slot), d.rid),
  unequip: (d) => unequip(d.uid, Number(d.slot)),
  buyRune: (d) => buyRune(d.kind),
  buyLegend: (d) => buyLegend(d.id),
  buyMon: (d) => buyMon(d.type),
  buyFood: (d) => buyFood(d.n),
  buyGold: (d) => buyGold(d.n),
  merge: (d) => merge(d.t, d.lv),
  team: (d) => toggleTeam(d.uid),
  fight: () => startBattle(),
  bSkill: (d) => playerSkill(d.i),
  bTarget: (d) => setTarget(d.id),
  bFast: () => { B.fast = !B.fast; drawBattle(); },
  bQuit: () => quitBattle(),
  back: () => { const fn = modalStack; modalStack = null; if (fn) fn(); else closeModal(); },
  close: () => closeModal(),
  code: () => openCode(),
  codeOk: () => submitCode(),
  reset: () => {
    if (confirm('정말 처음부터 다시 할까요? 모든 몬스터가 사라져요.')) {
      S = newState(); sel = []; save(); render();
    }
  },
};

document.addEventListener('click', (e) => {
  if (e.target.id === 'modal') { closeModal(); return; }
  const t = e.target.closest('[data-act]');
  if (!t || t.disabled) return;
  const fn = ACTIONS[t.dataset.act];
  if (fn) fn(t.dataset);
});

tick();
render();
requestAnimationFrame(drawWorld);
setInterval(tick, 250);
setInterval(save, 3000);
window.addEventListener('beforeunload', save);
