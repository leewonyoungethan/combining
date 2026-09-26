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
// 15단계. 예전 등급 키(common/rare/epic/legendary/mythic/divine)는 저장 호환을 위해 그대로 쓰고 사이사이에 새 등급을 끼웠다
const RAR_TABLE = [
  // key          이름    색          부화(초) 초당골드 교배비  체력  공격 속도
  ['common',     '일반', '#b4bccb',   5,     1,     50,    300,  50,  100],
  ['refined',    '정제', '#d7dee6',   7,     1.5,   65,    330,  54,  102],
  ['uncommon',   '고급', '#7ddc7d',   9,     2,     80,    360,  58,  104],
  ['skilled',    '숙련', '#3fd6a4',   12,    2.5,   100,   390,  61,  106],
  ['rare',       '희귀', '#5cb6ff',   15,    3,     120,   420,  65,  108],
  ['special',    '특별', '#6f8cff',   20,    4.5,   160,   470,  71,  110],
  ['masterwork', '명품', '#9b7bff',   25,    6,     200,   520,  77,  112],
  ['hero',       '영웅', '#c28cff',   32,    8,     250,   560,  83,  114],
  ['epic',       '서사', '#e45cff',   40,    10,    300,   600,  90,  116],
  ['legendary',  '전설', '#ffb020',   90,    25,    800,   900,  130, 126],
  ['mythic',     '신화', '#ff4d6d',   180,   60,   2000,  1400, 190, 140],
  ['divine',     '초월', '#3dffd8',   300,   150,  5000,  2400, 320, 160],
  ['holy',       '신성', '#fff27a',   420,   300,  8000,  3200, 420, 168],
  ['absolute',   '절대', '#ffffff',   600,   600,  12000, 4200, 540, 176],
  ['origin',     '근원', '#ff8a3d',   900,   1200, 20000, 5500, 700, 185],
];
const RAR_ORDER = RAR_TABLE.map(r => r[0]);
const RAR = Object.fromEntries(RAR_TABLE.map(([key, name, color, time, income, cost, hp, atk, spd]) =>
  [key, { name, color, time, income, cost, hp, atk, spd }]));
const RANK = Object.fromEntries(RAR_ORDER.map((k, i) => [k, i]));   // 등급 키 → 순서 번호

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
  { id: 'L:swan',    name: '빛의 백조 오데트', face: '🦢', els: ['light', 'water', 'ice'],  ult: '백조의 호수' },
  { id: 'L:scorpion', name: '사막의 전갈왕',  face: '🦂', els: ['poison', 'earth', 'fire'], ult: '사막 폭풍' },
  { id: 'L:megalo',  name: '폭풍 메갈로돈',   face: '🦈', els: ['water', 'thunder', 'dark'], ult: '폭풍 해일' },
  { id: 'L:golem',   name: '고대 골렘 타이탄', face: '🗿', els: ['earth', 'metal', 'magic'],  ult: '고대의 진동' },
  { id: 'L:storm',   name: '폭풍의 신조',     face: '🦅', els: ['thunder', 'light', 'nature'], ult: '천둥 날개' },
  { id: 'L:lich',    name: '서리 리치 왕',    face: '💀', els: ['dark', 'ice', 'magic'],     ult: '죽음의 서리' },
  { id: 'L:sunlion', name: '태양 사자 솔',    face: '🦁', els: ['fire', 'light', 'earth'],   ult: '태양 폭발' },
  { id: 'L:hydra',   name: '늪의 히드라',     face: '🐲', els: ['poison', 'water', 'nature'], ult: '독 물결' },
];
const MYTHIC = { id: 'M:arche', name: '태초의 신수 아르케', face: '🌌', els: ['magic', 'light', 'dark'], ult: '태초의 빛' };
// 신화 10마리: 전설끼리 교배하면 부모와 속성이 많이 겹치는 신화일수록 잘 나온다
const MYTHICS = [
  MYTHIC,
  { id: 'M:leviathan', name: '심연의 레비아탄',   face: '🦑', els: ['water', 'dark', 'ice'],      ult: '심연 해일' },
  { id: 'M:bahamut',   name: '용신 바하무트',     face: '🐉', els: ['fire', 'metal', 'light'],    ult: '기가 플레어' },
  { id: 'M:yggdrasil', name: '세계수의 정령',     face: '🌲', els: ['nature', 'light', 'magic'],  ult: '생명의 노래' },
  { id: 'M:thor',      name: '천둥신 토르',       face: '⛈️', els: ['thunder', 'metal', 'earth'], ult: '묠니르' },
  { id: 'M:hades',     name: '명계의 왕 하데스',  face: '👻', els: ['dark', 'poison', 'fire'],    ult: '명계의 불꽃' },
  { id: 'M:gaia',      name: '대지모신 가이아',   face: '🌍', els: ['earth', 'nature', 'water'],  ult: '대지의 포옹' },
  { id: 'M:skadi',     name: '빙결 여왕 스카디',  face: '👸', els: ['ice', 'water', 'light'],     ult: '영원한 겨울' },
  { id: 'M:echidna',   name: '맹독 여제 에키드나', face: '🐍', els: ['poison', 'dark', 'magic'],   ult: '만독' },
  { id: 'M:astra',     name: '별의 수호자 아스트라', face: '🌟', els: ['light', 'magic', 'thunder'], ult: '유성우' },
];
// 전설 상점 전용: 골드로 살 수는 있지만… 절대 모을 수 없는 가격
const SHOP_LEGENDS = [
  { id: 'X:goldking', name: '황금 용왕 골드킹',     face: '🐲', els: ['fire', 'light', 'metal'],   ult: '황금 멸망포',  price: 9999999999 },
  { id: 'X:whale',    name: '은하 고래 코스모',     face: '🐋', els: ['water', 'magic', 'dark'],   ult: '은하 붕괴',    price: 77777777777, rank: 'holy' },
  { id: 'X:lion',     name: '천둥 사자왕 제우스',   face: '🦁', els: ['thunder', 'light', 'earth'], ult: '신의 번개',    price: 500000000000, rank: 'holy' },
  { id: 'X:owl',      name: '시간의 수호자 크로노', face: '🦉', els: ['magic', 'ice', 'light'],    ult: '시간 정지',    price: 12345678901234, rank: 'absolute' },
  { id: 'X:chaos',    name: '혼돈의 신 카오스',     face: '👁️', els: ['dark', 'fire', 'magic'],   ult: '혼돈의 눈',    price: 999999999999999, rank: 'origin' },
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
      { name: c.ult, el: e[0], type: 'dmg', mult: RANK[c.rarity] >= RANK.divine ? 2.2 + 0.2 * (RANK[c.rarity] - RANK.divine) : c.rarity === 'mythic' ? 1.8 : 1.4, aoe: true, cost: 7 }];
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

// ===================== 몬스터 카탈로그 (500마리) =====================
// 속성마다 31마리(순수 341), 두 속성 조합마다 29마리(혼합 1595) + 전설 34 + 신화 25 + 전설 상점 5 = 2000
const PURE_VARIANTS = 31;
const HYB_VARIANTS = 29;
const LEGEND_COUNT = 34;
const MYTHIC_COUNT = 25;
// 등급 피라미드: 일반 : 신화 ≈ 20 : 1, 한 등급 오를 때마다 같은 비율로 줄어든다
const RANK_RATIO = 20;
const RANK_Q = Math.pow(1 / RANK_RATIO, 1 / RANK.mythic);
const ADJ = {
  fire:    ['화염', '불꽃', '용암', '이글', '잿불', '태양', '폭염', '화산', '봉화', '홍련', '불사', '적염'],
  water:   ['물결', '파도', '심해', '이슬', '빗방울', '소용돌이', '산호', '해류', '호수', '해일', '청류', '물보라'],
  thunder: ['번개', '천둥', '전류', '섬광', '뇌운', '스파크', '폭풍', '전격', '뇌전', '낙뢰', '우레', '방전'],
  nature:  ['숲', '덩굴', '꽃잎', '이끼', '새싹', '고목', '들풀', '정글', '꽃밭', '풀잎', '수풀', '나뭇잎'],
  earth:   ['바위', '모래', '대지', '암석', '진흙', '협곡', '수정', '화강', '지진', '황토', '바위산', '단층'],
  dark:    ['그림자', '심연', '암흑', '한밤', '칠흑', '망령', '악몽', '그믐', '혼령', '어스름', '흑야', '공허'],
  light:   ['광휘', '빛살', '새벽', '찬란', '여명', '성광', '햇살', '무지개', '은빛', '광채', '서광', '백광'],
  poison:  ['맹독', '독침', '늪지', '산성', '독안개', '독버섯', '부식', '독니', '역병', '독꽃', '썩은', '독액'],
  ice:     ['서리', '빙하', '눈꽃', '얼음', '한파', '설원', '냉기', '빙결', '눈보라', '만년설', '북풍', '서릿발'],
  metal:   ['강철', '무쇠', '크롬', '기계', '톱니', '합금', '철갑', '황동', '티타늄', '강선', '철벽', '합성'],
  magic:   ['비전', '마력', '신비', '주문', '환상', '룬', '요술', '별빛', '마법', '마나', '비술', '주술'],
};
const CREATURES = [
  ['🐺', '늑대'], ['🦊', '여우'], ['🐻', '곰'], ['🐯', '호랑이'], ['🐗', '멧돼지'], ['🐍', '뱀'],
  ['🦂', '전갈'], ['🕷️', '거미'], ['🦋', '나비'], ['🐝', '벌'], ['🦉', '올빼미'], ['🦜', '앵무새'],
  ['🐬', '돌고래'], ['🦈', '상어'], ['🐙', '문어'], ['🦀', '게'], ['🐊', '악어'], ['🦖', '티라노'],
  ['🦕', '용각룡'], ['🐲', '드레이크'], ['🦏', '코뿔소'], ['🐘', '코끼리'], ['🦍', '고릴라'], ['🐒', '원숭이'],
  ['🐇', '토끼'], ['🦔', '고슴도치'], ['🦡', '오소리'], ['🐿️', '다람쥐'], ['🦥', '나무늘보'], ['🦦', '수달'],
  ['🐌', '달팽이'], ['🐛', '애벌레'], ['🦗', '귀뚜라미'], ['🦩', '플라밍고'], ['🦚', '공작'], ['🐓', '수탉'],
  ['🐑', '양'], ['🐐', '염소'], ['🦬', '들소'], ['🐫', '낙타'], ['🦒', '기린'], ['👻', '유령'],
  ['🧚', '요정'], ['🧞', '지니'], ['🧜', '인어'], ['👹', '도깨비'], ['💀', '해골'], ['🎃', '호박귀신'],
  ['🌵', '선인장'], ['🍄', '버섯'], ['🌻', '해바라기'], ['⛄', '눈사람'], ['🐡', '복어'], ['🦑', '오징어'],
  ['🐳', '고래'], ['🦭', '물범'], ['🐆', '표범'], ['🐎', '말'], ['🦘', '캥거루'], ['🐼', '판다'],
  ['🐨', '코알라'], ['🦝', '너구리'], ['🐁', '생쥐'], ['🐞', '무당벌레'], ['🦟', '모기'], ['🪲', '딱정벌레'],
  ['🦞', '가재'], ['🦐', '새우'], ['🐠', '열대어'], ['🦢', '백조'], ['🕊️', '비둘기'], ['🦃', '칠면조'],
  ['🐈', '고양이'], ['🐕', '강아지'], ['🐄', '황소'], ['🐖', '돼지'], ['🦙', '라마'], ['🦌', '엘크'],
];
const hashStr = (s) => { let h = 5381; for (const ch of s) h = ((h * 33) ^ ch.charCodeAt(0)) >>> 0; return h; };
const frac = (s) => (hashStr(s) % 1000) / 1000;
const vw = (t) => Math.max(0.5, 8 * Math.pow(0.75, RANK[CAT[t].rarity]));   // 같은 그룹 안에서 변종이 나올 가중치
const COMMON_SPECIAL = ['ice', 'metal', 'magic'];   // 서리 펭귄, 강철 로봇, 비전 고블린은 특수 속성이지만 커먼

const CAT = {};
const CAT_LIST = [];
const GROUPS = {};
const usedNames = new Set();
function addMon(m) {
  CAT[m.id] = m;
  CAT_LIST.push(m);
  usedNames.add(m.name);
  if (m.group) (GROUPS[m.group] = GROUPS[m.group] || []).push(m.id);
}
function variantMod(key) {
  return { hp: 0.88 + frac(key + 'h') * 0.24, atk: 0.88 + frac(key + 'a') * 0.24, spd: 0.93 + frac(key + 's') * 0.14 };
}
// start를 주면 그 번호부터 동물을 고른다 (같은 그룹 안에서 동물이 겹치지 않게)
function freshCreature(adj, seedKey, start) {
  let k = start != null ? start % CREATURES.length : hashStr(seedKey) % CREATURES.length;
  for (let tries = 0; tries < CREATURES.length; tries++, k = (k + 1) % CREATURES.length) {
    const [face, noun] = CREATURES[k];
    if (!usedNames.has(`${adj} ${noun}`)) return { face, name: `${adj} ${noun}` };
  }
  return { face: '❓', name: `${adj} 몬스터 ${seedKey}` };
}

// 2000마리를 같은 규칙으로 만든다. 대표 몬스터(변종 0번)만 원래 이름을 유지한다.
// 일반~서사 누적 비율표: 그룹 안에서 n번째 변종이 어느 등급인지 정한다 (0번은 항상 일반)
const REG_SHARE = (() => {
  const w = [];
  for (let r = 0; r <= RANK.epic; r++) w.push(Math.pow(RANK_Q, r));
  const sum = w.reduce((x, y) => x + y, 0);
  let acc = 0;
  return w.map(x => (acc += x / sum));
})();
// 그룹마다 반올림 위치(ofs)를 다르게 해서 전체 등급 수가 매끄러운 피라미드가 되게 한다
const rankOfVariant = (n, N, ofs = 0.5) => { const t = (n + ofs) / N; const r = REG_SHARE.findIndex(c => t <= c + 1e-9); return r < 0 ? RANK.epic : r; };

function addPure(e, i, k) {
  const group = 'p:' + e.id;
  const id = k === 0 ? group : `${group}:${k}`;
  const adjs = ADJ[e.id];
  const look = k === 0 ? { face: e.face, name: `${e.adj} ${e.noun}` } : freshCreature(adjs[k % adjs.length], id, hashStr(group) + k * 7);
  addMon({ id, group, variant: k, ...look, els: [e.id], rarity: RAR_ORDER[rankOfVariant(k, PURE_VARIANTS, frac(group))], mod: k === 0 ? null : variantMod(id) });
}
function addHybrid(i, j, v) {
  const a = EL[i], b = EL[j];
  const group = `h:${a.id}+${b.id}`;
  const id = v === 0 ? group : `${group}:${v}`;
  const adjs = v % 2 ? ADJ[a.id] : ADJ[b.id];
  const look = v === 0 ? { face: b.face, name: `${a.adj} ${b.noun}` } : freshCreature(adjs[v % adjs.length], id, hashStr(group) + v * 7);
  addMon({ id, group, variant: v, ...look, els: [a.id, b.id], rarity: RAR_ORDER[rankOfVariant(v, HYB_VARIANTS, frac(group))], mod: v === 0 ? null : variantMod(id) });
}

// 전설/신화 늘리기: 아직 안 쓴 세 속성 조합마다 이름을 붙여 만든다
const TRIPLES = [];
for (let x = 0; x < EL.length; x++) for (let y = x + 1; y < EL.length; y++) for (let z = y + 1; z < EL.length; z++) TRIPLES.push([EL[x].id, EL[y].id, EL[z].id]);
const tripleKey = (els) => els.slice().sort().join('+');
const usedTriples = new Set([...LEGENDS, ...MYTHICS].map(m => tripleKey(m.els)));
const LEG_TITLES = ['제왕', '군주', '수호신', '폭군', '현자', '기사', '여제', '대왕', '거인', '패왕'];
const MYTH_TITLES = ['신', '창조신', '파괴신', '천신', '마신'];
const ULT_WORDS = ['폭풍', '심판', '대폭발', '종말', '광풍', '붕괴', '찬가', '포효', '낙인', '파동'];
function nextTriple(seed) {
  for (let t = 0; t < TRIPLES.length; t++) {
    const tr = TRIPLES[(seed * 47 + t * 13) % TRIPLES.length];
    if (!usedTriples.has(tripleKey(tr))) { usedTriples.add(tripleKey(tr)); return tr; }
  }
  return TRIPLES[seed % TRIPLES.length];
}
function makeSpecial(prefix, k, titles) {
  const els = nextTriple(k + (prefix === 'M' ? 101 : 7));
  const title = `${EL[ELI[els[0]]].adj}의 ${titles[k % titles.length]}`;
  const look = freshCreature(title, `${prefix}:g${k}`, hashStr(prefix + k) % CREATURES.length);
  return { id: `${prefix}:g${k}`, ...look, els, ult: `${EL[ELI[els[1]]].adj} ${ULT_WORDS[k % ULT_WORDS.length]}` };
}
for (let k = 0; LEGENDS.length < LEGEND_COUNT; k++) LEGENDS.push(makeSpecial('L', k, LEG_TITLES));
for (let k = 0; MYTHICS.length < MYTHIC_COUNT; k++) MYTHICS.push(makeSpecial('M', k, MYTH_TITLES));

const PAIRS = [];
for (let i = 0; i < EL.length; i++) for (let j = i + 1; j < EL.length; j++) PAIRS.push([i, j]);
// 이름 붙은 전설/신화가 이름을 먼저 차지하고, 대표 몬스터 → 나머지 변종 순서로 만든다
LEGENDS.concat(MYTHICS).forEach(m => usedNames.add(m.name));
EL.forEach((e, i) => addPure(e, i, 0));
PAIRS.forEach(([i, j]) => addHybrid(i, j, 0));
EL.forEach((e, i) => { for (let k = 1; k < PURE_VARIANTS; k++) addPure(e, i, k); });
PAIRS.forEach(([i, j]) => { for (let v = 1; v < HYB_VARIANTS; v++) addHybrid(i, j, v); });
LEGENDS.forEach(l => addMon({ ...l, rarity: 'legendary' }));
MYTHICS.forEach(m => addMon({ ...m, rarity: 'mythic' }));
SHOP_LEGENDS.forEach(l => addMon({ ...l, rarity: l.rank || 'divine', shop: true }));
CAT_LIST.sort((a, b) => RAR_ORDER.indexOf(a.rarity) - RAR_ORDER.indexOf(b.rarity));
CAT_LIST.forEach(c => { c.skills = buildSkills(c); });

const hybridId = (x, y) => {
  const [a, b] = [x, y].sort((p, q) => ELI[p] - ELI[q]);
  return `h:${a}+${b}`;
};
const rIdx = (type) => RAR_ORDER.indexOf(CAT[type].rarity);
const eggLv = (t) => { const r = rIdx(t); return r >= RANK.mythic ? 'lv5' : r >= RANK.legendary ? 'lv4' : r >= RANK.masterwork ? 'lv3' : ''; };
const isLegend = (type) => rIdx(type) >= RANK.legendary;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const SHOP_BREED_CHANCE = [0.15, 0.08, 0.02];   // 전설 상점 몬스터: 약한 부모와 같은 등급 / 한 단계 위 / 두 단계 위
const LEGEND_RECIPE_CHANCE = 0.4;               // 족보를 맞췄을 때 레전더리 한 마리당 확률
const LUCKY_LEGEND = { rare: 0.04, epic: 0.1 }; // 두 부모가 모두 레어 이상 / 에픽 이상일 때 행운의 레전더리

// 두 부모로 교배했을 때 각 몬스터가 나올 확률 { type: 확률 }
function breedDist(ta, tb) {
  const d = {};
  const add = (t, p) => { if (p > 0) d[t] = (d[t] || 0) + p; };
  const addGroup = (g, p) => {
    const list = GROUPS[g];
    const tot = list.reduce((s, t) => s + vw(t), 0);
    list.forEach(t => add(t, p * vw(t) / tot));
  };
  if (isLegend(ta) && isLegend(tb)) {
    // 약한 쪽 부모 등급 기준: 같은 등급 15%, 한 단계 위 8%, 두 단계 위 2% (같은 등급 몬스터끼리는 나눠 갖는다)
    const lo = Math.min(rIdx(ta), rIdx(tb));
    let shopTotal = 0;
    RAR_ORDER.forEach((key, R) => {
      const list = SHOP_LEGENDS.filter(l => CAT[l.id].rarity === key);
      if (!list.length) return;
      const p = R >= lo ? (SHOP_BREED_CHANCE[R - lo] || 0) : 0;   // 부모보다 낮은 등급은 안 나온다
      list.forEach(l => add(l.id, p / list.length));
      shopTotal += p;
    });
    const rest = 1 - shopTotal;
    // 신화: 부모 속성과 겹치는 개수 + 1 만큼 가중치
    const parentEls = new Set([...CAT[ta].els, ...CAT[tb].els]);
    const mw = MYTHICS.map(m => 1 + m.els.filter(e => parentEls.has(e)).length * 2);
    const mwSum = mw.reduce((x, y) => x + y, 0);
    const addMythic = (p) => MYTHICS.forEach((m, k) => add(m.id, p * mw[k] / mwSum));
    addMythic(0.35 * rest);
    // 부모를 그대로 물려받는 몫: 상점 몬스터는 위 확률로만 나오게 하고 이 몫은 신화로
    [ta, tb].forEach(t => (CAT[t].shop ? addMythic(0.325 * rest) : add(t, 0.325 * rest)));
    return d;
  }
  const pool = [...new Set([...CAT[ta].els, ...CAT[tb].els])];
  const has = (need) => need.every(e => pool.includes(e));
  // 행운의 레전더리: 족보를 몰라도 부모 등급이 높으면 가끔 나온다 (부모 속성이 하나라도 겹치는 레전더리 중에서)
  const minR = Math.min(rIdx(ta), rIdx(tb));
  const luckyPool = LEGENDS.filter(l => l.els.some(e => pool.includes(e)));
  const pLucky = luckyPool.length ? (minR >= RANK.epic ? LUCKY_LEGEND.epic : minR >= RANK.rare ? LUCKY_LEGEND.rare : 0) : 0;
  luckyPool.forEach(l => add(l.id, pLucky / luckyPool.length));
  let rest = 1 - pLucky;
  // 족보(세 속성을 모두 섞기)를 맞추면 레전더리가 잘 나온다
  const legs = LEGENDS.filter(l => has(l.els));
  const pLeg = 1 - Math.pow(1 - LEGEND_RECIPE_CHANCE, legs.length);
  legs.forEach(l => add(l.id, rest * pLeg / legs.length));
  rest *= 1 - pLeg;
  const advs = ADV_RECIPES.filter(r => has(r.need));
  const pAdv = 1 - Math.pow(0.7, advs.length);
  advs.forEach(r => addGroup('p:' + r.el, rest * pAdv / advs.length));
  rest *= 1 - pAdv;
  const pPure = pool.length === 1 ? 1 : 0.25;
  pool.forEach(e => addGroup('p:' + e, rest * pPure / pool.length));
  if (pool.length > 1) {
    const pairs = [];
    for (let i = 0; i < pool.length; i++) for (let j = i + 1; j < pool.length; j++) pairs.push(hybridId(pool[i], pool[j]));
    pairs.forEach(g => addGroup(g, rest * (1 - pPure) / pairs.length));
  }
  return d;
}

function breedResult(ta, tb) {
  const d = breedDist(ta, tb);
  let r = Math.random();
  const entries = Object.entries(d);
  for (const [t, p] of entries) { r -= p; if (r <= 0) return t; }
  return entries[entries.length - 1][0];
}
// ===================== 건물 / 농장 / 룬 =====================
// 섬 8개 × 25칸. 모든 칸은 한 배열(S.plots)에 들어 있고, 섬 k는 k*25 ~ k*25+24번 칸
const ISLAND_PLOTS = 25;
const ISLANDS = [
  { name: '초원 섬', emoji: '🌳', grass: ['#6fd35e', '#3b9a3c'], sand: '#ecd592', decor: ['🌴', '🌳', '🌲', '🌼', '🍄', '🌷', '🪨'] },
  { name: '사막 섬', emoji: '🏜️', grass: ['#f0cf7a', '#c9953a'], sand: '#f6e6b0', decor: ['🌵', '🪨', '🐫', '🌵', '🦂', '🏺'] },
  { name: '눈의 섬', emoji: '❄️', grass: ['#f4f9ff', '#b9d3ea'], sand: '#dfe9f3', decor: ['⛄', '🌲', '❄️', '🐧', '🌲', '🧊'] },
  { name: '화산 섬', emoji: '🌋', grass: ['#6a453b', '#2e1d1a'], sand: '#4a3530', decor: ['🌋', '🔥', '🪨', '🔥', '🦎', '🪨'] },
  { name: '정글 섬', emoji: '🌴', grass: ['#33b457', '#146b2d'], sand: '#d8c27a', decor: ['🌴', '🌿', '🦜', '🌺', '🐒', '🍌'] },
  { name: '밤의 섬', emoji: '🌙', grass: ['#454a98', '#1e2050'], sand: '#5b5f9f', decor: ['🌙', '🍄', '✨', '🦉', '🕯️', '⭐'] },
  { name: '수정 섬', emoji: '💎', grass: ['#c9a6ff', '#7b5cff'], sand: '#eadcff', decor: ['💎', '🔮', '✨', '🦄', '💠', '🌸'] },
  { name: '구름 섬', emoji: '☁️', grass: ['#ffffff', '#cfe3ff'], sand: '#eef5ff', decor: ['☁️', '🌈', '🕊️', '⭐', '🎈', '🌟'] },
  { name: '벚꽃 섬', emoji: '🌸', grass: ['#ffc6dd', '#e98bb4'], sand: '#ffe6f0', decor: ['🌸', '🌷', '🦋', '🍡', '🌸', '🐇'] },
  { name: '가을 섬', emoji: '🍁', grass: ['#e8a05a', '#b5622a'], sand: '#f1d19a', decor: ['🍁', '🍂', '🦊', '🌰', '🍄', '🦔'] },
  { name: '해변 섬', emoji: '🏖️', grass: ['#9be0d0', '#4fb3a3'], sand: '#fbe8b0', decor: ['⛱️', '🐚', '🦀', '🌴', '🐢', '🏐'] },
  { name: '사탕 섬', emoji: '🍭', grass: ['#ffb3e6', '#c77dff'], sand: '#ffe0f7', decor: ['🍭', '🍬', '🧁', '🍩', '🍫', '🎂'] },
  { name: '버섯 섬', emoji: '🍄', grass: ['#8bc34a', '#4e7d2a'], sand: '#d7c69a', decor: ['🍄', '🍄', '🐌', '🌿', '🧚', '🐸'] },
  { name: '해적 섬', emoji: '⚓', grass: ['#7fb069', '#3d6b3a'], sand: '#e8d59a', decor: ['⚓', '💰', '🦜', '🗺️', '💎', '🍾'] },
  { name: '늪지 섬', emoji: '🐊', grass: ['#6b8e4e', '#34502a'], sand: '#8a8a5c', decor: ['🐊', '🌾', '🐸', '🦟', '🌿', '🍄'] },
  { name: '우주 섬', emoji: '🚀', grass: ['#2b2d6e', '#0b0c2a'], sand: '#4b4d8f', decor: ['🚀', '🪐', '⭐', '🌠', '👽', '🛸'] },
  { name: '황금 섬', emoji: '👑', grass: ['#ffe066', '#d4a017'], sand: '#fff3c4', decor: ['👑', '💰', '🏆', '💎', '✨', '🏆'] },
  { name: '무지개 섬', emoji: '🌈', grass: ['#a0e7ff', '#ff9ad5'], sand: '#fff5d6', decor: ['🌈', '🦄', '☁️', '🎠', '🎈', '⭐'] },
];
const PLOTS = ISLAND_PLOTS * ISLANDS.length;
const islandOf = (i) => Math.floor(i / ISLAND_PLOTS);
const islandRange = (k) => Array.from({ length: ISLAND_PLOTS }, (_, n) => k * ISLAND_PLOTS + n);
const islandLabel = (i) => ISLANDS[islandOf(i)].emoji + (islandOf(i) + 1);
const HATCH_CAP = 3;
const BREED_LV = 4;
const MAX_LV = 20;
const HAB_MAX_LV = 10;
const HAB_LV_BONUS = 25;   // 서식지 레벨마다 골드 +25%
const FARM_COST = 250;
// 순서는 저장 데이터와 맞추려고 그대로 두고, 화면에는 자라는 시간 순으로 보여 준다.
// 오래 걸리는 작물일수록 시간당 먹이가 조금씩 더 많다
const CROPS = [
  { name: '새싹 풀',     emoji: '🌱', food: 60,    time: 30,   cost: 40 },
  { name: '토마토',      emoji: '🍅', food: 400,   time: 120,  cost: 200 },
  { name: '황금 옥수수', emoji: '🌽', food: 2200,  time: 600,  cost: 800 },
  { name: '당근',        emoji: '🥕', food: 150,   time: 60,   cost: 90 },
  { name: '딸기',        emoji: '🍓', food: 250,   time: 90,   cost: 140 },
  { name: '감자',        emoji: '🥔', food: 1050,  time: 300,  cost: 400 },
  { name: '가지',        emoji: '🍆', food: 1500,  time: 420,  cost: 550 },
  { name: '호박',        emoji: '🎃', food: 4600,  time: 1200, cost: 1500 },
  { name: '수박',        emoji: '🍉', food: 7500,  time: 1800, cost: 2500 },
  { name: '파인애플',    emoji: '🍍', food: 16200, time: 3600, cost: 5000 },
  { name: '별빛 과일',   emoji: '🌟', food: 40000, time: 7200, cost: 12000 },
];
const CROP_ORDER = CROPS.map((c, ci) => ci).sort((a, b) => CROPS[a].time - CROPS[b].time);

// 섬 꾸미기 장식: 빈 땅에 놓으면 그 섬 서식지의 골드 수입이 조금 오른다 (섬마다 최대 +30%)
const DECOS = [
  { id: 'pot',      name: '화분',           emoji: '🪴', cost: 150,   bonus: 1 },
  { id: 'flower',   name: '꽃밭',           emoji: '🌷', cost: 200,   bonus: 1 },
  { id: 'tree',     name: '큰 나무',        emoji: '🌳', cost: 300,   bonus: 1 },
  { id: 'lamp',     name: '등불',           emoji: '🏮', cost: 400,   bonus: 1 },
  { id: 'cherry',   name: '벚꽃나무',       emoji: '🌸', cost: 500,   bonus: 2 },
  { id: 'tent',     name: '텐트',           emoji: '⛺', cost: 600,   bonus: 2 },
  { id: 'hut',      name: '오두막',         emoji: '🛖', cost: 1200,  bonus: 2 },
  { id: 'fountain', name: '분수',           emoji: '⛲', cost: 1500,  bonus: 3 },
  { id: 'statue',   name: '석상',           emoji: '🗿', cost: 2000,  bonus: 3 },
  { id: 'rainbow',  name: '무지개 아치',    emoji: '🌈', cost: 3000,  bonus: 3 },
  { id: 'carousel', name: '회전목마',       emoji: '🎠', cost: 4000,  bonus: 4 },
  { id: 'wheel',    name: '관람차',         emoji: '🎡', cost: 5000,  bonus: 4 },
  { id: 'circus',   name: '서커스 천막',    emoji: '🎪', cost: 6000,  bonus: 4 },
  { id: 'tower',    name: '탑',             emoji: '🗼', cost: 8000,  bonus: 5 },
  { id: 'castle',   name: '성',             emoji: '🏰', cost: 20000, bonus: 6 },
  { id: 'crown',    name: '황금 왕관 동상', emoji: '👑', gems: 50,    bonus: 8 },
];
const DECO_CAP = 30;
const decoById = (id) => DECOS.find(d => d.id === id);
const decoPrice = (d) => d.gems ? `💎 ${d.gems}` : `💰 ${fmt(d.cost)}`;
function decoPercent(k) {
  let sum = 0;
  for (let n = 0; n < ISLAND_PLOTS; n++) {
    const p = S.plots[k * ISLAND_PLOTS + n];
    if (p && p.kind === 'deco' && decoById(p.id)) sum += decoById(p.id).bonus;
  }
  return Math.min(DECO_CAP, sum);
}
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
const KEY = 'combining-save-v4';          // 예전(계정이 없던 때) 저장 위치. 계정별 저장은 KEY:계정id
// ----- 계정: 이 기기(브라우저) 안에 여러 계정을 만들고, 계정마다 자기 섬을 따로 저장한다 -----
const ACC_KEY = 'combining-accounts', ACC_CUR = 'combining-current';
const lsGet = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } };
const lsDel = (k) => { try { localStorage.removeItem(k); } catch (e) { /* 저장 불가 */ } };
const accKey = (id) => `${KEY}:${id}`;
function accounts() { try { return JSON.parse(lsGet(ACC_KEY)) || []; } catch (e) { return []; } }
function saveAccounts(list) { lsSet(ACC_KEY, JSON.stringify(list)); }
const newAccId = () => 'a' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
let ACC = null;
(function initAccounts() {
  let list = accounts();
  if (!list.length) {
    // 처음: 예전에 하던 섬이 있으면 첫 계정으로 옮긴다
    const id = newAccId(), old = lsGet(KEY);
    let name = '나의 섬';
    try { const o = JSON.parse(old); if (o && o.nick) name = String(o.nick).slice(0, 10); } catch (e) { /* 없음 */ }
    list = [{ id, name, pin: null, created: Date.now() }];
    saveAccounts(list);
    if (old) lsSet(accKey(id), old);
    lsSet(ACC_CUR, id);
  }
  ACC = list.find(a => a.id === lsGet(ACC_CUR)) || list[0];
})();
const SECRET_CODE = '방탄유리';

function newState() {
  const s = {
    gold: 2500, gems: 30, food: 300, infinite: false,
    plots: Array(PLOTS).fill(null),
    monsters: [], nextUid: 1, hatch: [], breed: null, dex: {},
    runes: [], nextRune: 1,
    stage: 1, team: [],
    daily: { last: null, streak: 0 }, bossCleared: {},
    last: Date.now(),
  };
  // 처음엔 교배산과 부화장만 있는 빈 땅. 서식지와 알은 직접 사야 한다
  s.plots[0] = { kind: 'mountain', breeds: [null] };
  s.plots[1] = { kind: 'hatchery' };
  return s;
}

function load(id = ACC && ACC.id) {
  try {
    const raw = lsGet(accKey(id));
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (!s || !Array.isArray(s.monsters) || !Array.isArray(s.plots)) return null;
    while (s.plots.length < PLOTS) s.plots.push(null);   // 예전(섬 1개) 저장도 이어 하기
    s.isl = s.isl || 0;
    // 예전 저장: 교배 상태가 하나(s.breed)였으면 첫 교배산으로 옮기기
    const firstMtn = s.plots.find(p => p && p.kind === 'mountain');
    if (s.breed && firstMtn && !firstMtn.breed && CAT[s.breed.type]) firstMtn.breed = s.breed;
    delete s.breed;
    s.monsters = s.monsters.filter(m => CAT[m.type]);
    s.hatch = (s.hatch || []).filter(t => CAT[t]);
    s.plots.forEach(p => { if (p && p.kind === 'hatchery' && Array.isArray(p.incs)) p.incs.forEach(b => { if (b) b.end = 0; }); });
    // 예전에 합친 부화장은 칸 수만 있고 레벨이 없다: 칸 수(3+3+1=7, 3개면 11 ...)로 합친 개수를 계산
    s.plots.forEach(p => {
      if (p && p.kind === 'hatchery' && !p.lv && (p.cap || HATCH_CAP) > HATCH_CAP) p.lv = Math.max(1, Math.round(((p.cap || HATCH_CAP) + 1) / (HATCH_CAP + 1)));
    });
    s.plots.forEach(p => {
      if (!p || p.kind !== 'mountain') return;
      // 예전 저장(칸 하나 = p.breed)을 칸 배열로 옮기고, 칸 수는 교배산 레벨만큼
      if (!Array.isArray(p.breeds)) p.breeds = [p.breed || null];
      delete p.breed;
      p.breeds = p.breeds.map(b => (b && CAT[b.type] ? b : null));
      while (p.breeds.length < (p.lv || 1)) p.breeds.push(null);
    });
    s.daily = s.daily || { last: null, streak: 0 };
    s.bossCleared = s.bossCleared || {};
    s.breedLog = (s.breedLog || []).filter(e => CAT[e.at] && CAT[e.bt] && CAT[e.rt]);
    return s;
  } catch (e) {
    return null;
  }
}

function save() {
  if (VISIT) return;   // 친구 섬 구경 중에는 저장하지 않는다
  if (!ACC) return;
  lsSet(accKey(ACC.id), JSON.stringify(S));
}

let S = load() || newState();
// 돌아왔을 때 "없는 동안 쌓인 골드"를 보여 주려고 켤 때의 상태를 기억
const AWAY = { sec: (Date.now() - (S.last || Date.now())) / 1000, gold0: S.plots.reduce((s, p) => s + (p && p.kind === 'hab' ? p.gold || 0 : 0), 0) };

// ===================== 계산 =====================
const byUid = (uid) => S.monsters.find(m => m.uid === Number(uid));
const monIncome = (m) => RAR[CAT[m.type].rarity].income * m.lv;
const habMons = (i) => S.monsters.filter(m => m.hab === i);
// 서식지에 들어갈 수 있는 몬스터 수 = 레벨 (최소 2마리, Lv.10이면 10마리). 쌓이는 골드는 무제한
const habCap = (i) => Math.max(2, S.plots[i].lv);
const habLvBonus = (i) => (S.plots[i].lv - 1) * HAB_LV_BONUS;
const habIncome = (i) => habMons(i).reduce((s, m) => s + monIncome(m), 0) * (1 + (habLvBonus(i) + decoPercent(islandOf(i)) + guildPct()) / 100);
const habGoldCap = () => Infinity;
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
  const md = c.mod || { hp: 1, atk: 1, spd: 1 };
  return {
    hp: Math.round(r.hp * md.hp * (1 + 0.12 * (m.lv - 1)) * (1 + rb.hp / 100)),
    atk: Math.round(r.atk * md.atk * (1 + 0.1 * (m.lv - 1)) * (1 + rb.atk / 100)),
    spd: Math.round((r.spd + sp) * md.spd * (1 + 0.01 * (m.lv - 1)) * (1 + rb.spd / 100)),
  };
}

function spend(cost, cur = 'gold') {
  if (S.infinite) return true;
  if (S[cur] < cost) { sfx('err'); toast(cur === 'gold' ? '💰 골드가 부족해요' : '💎 보석이 부족해요'); return false; }
  S[cur] -= cost;
  return true;
}
function earn(n, cur = 'gold') { if (!S.infinite) S[cur] += n; }

// ----- 효과음 -----
let AC = null;
const soundOn = () => lsGet('combining-sound') !== 'off';
const SFX = {
  tap:   [[660, 0.04, 'triangle', 0.05]],
  coin:  [[988, 0.07, 'square', 0.05], [1319, 0.12, 'square', 0.05, 0.07]],
  buy:   [[523, 0.07, 'triangle', 0.08], [784, 0.1, 'triangle', 0.08, 0.07]],
  level: [[523, 0.08, 'triangle', 0.08], [659, 0.08, 'triangle', 0.08, 0.08], [784, 0.14, 'triangle', 0.08, 0.16]],
  hatch: [[392, 0.1, 'triangle', 0.09], [523, 0.1, 'triangle', 0.09, 0.1], [659, 0.1, 'triangle', 0.09, 0.2], [1047, 0.25, 'triangle', 0.09, 0.3]],
  breed: [[330, 0.12, 'sine', 0.1], [494, 0.18, 'sine', 0.1, 0.1]],
  win:   [[523, 0.1, 'square', 0.06], [659, 0.1, 'square', 0.06, 0.1], [784, 0.1, 'square', 0.06, 0.2], [1047, 0.3, 'square', 0.06, 0.3]],
  lose:  [[392, 0.15, 'sawtooth', 0.05], [311, 0.15, 'sawtooth', 0.05, 0.15], [262, 0.3, 'sawtooth', 0.05, 0.3]],
  err:   [[180, 0.12, 'sawtooth', 0.05]],
  yay:   [[784, 0.08, 'triangle', 0.08], [988, 0.08, 'triangle', 0.08, 0.08], [1175, 0.08, 'triangle', 0.08, 0.16], [1568, 0.25, 'triangle', 0.08, 0.24]],
};
const MUSIC_VOL = 0.42, DUCK_VOL = 0.1;
// 효과음이 나는 동안 배경음악 줄이기
function duckMusic(sec) {
  if (typeof MUS === 'undefined' || !MUS.gain || !AC) return;
  const g = MUS.gain.gain, now = AC.currentTime;
  if (g.cancelAndHoldAtTime) g.cancelAndHoldAtTime(now);
  else { const v = g.value; g.cancelScheduledValues(now); g.setValueAtTime(v, now); }
  g.linearRampToValueAtTime(DUCK_VOL, now + 0.04);
  g.setValueAtTime(DUCK_VOL, now + sec + 0.05);
  g.linearRampToValueAtTime(MUSIC_VOL, now + sec + 0.6);
}
function sfx(kind) {
  if (!soundOn() || !SFX[kind]) return;
  try {
    if (!audioCtx()) return;
    if (AC.state === 'suspended') AC.resume();
    const t0 = AC.currentTime + 0.01;
    const len = Math.max(...SFX[kind].map(([, d, , , at = 0]) => at + d));
    duckMusic(len);
    SFX[kind].forEach(([f, d, type, vol, at = 0]) => {
      const o = AC.createOscillator(), g = AC.createGain();
      o.type = type; o.frequency.value = f;
      g.gain.setValueAtTime(vol, t0 + at);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + at + d);
      o.connect(g); g.connect(AC.destination);
      o.start(t0 + at); o.stop(t0 + at + d + 0.02);
    });
  } catch (e) { /* 소리를 못 내는 기기 */ }
}
// ----- ⛶ 전체화면 (휴대폰) -----
const isStandalone = () => matchMedia('(display-mode: fullscreen)').matches || matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const canFull = () => !!(document.fullscreenEnabled || document.webkitFullscreenEnabled);
const isFull = () => !!(document.fullscreenElement || document.webkitFullscreenElement);
const isPhone = () => matchMedia('(pointer: coarse)').matches;
function enterFull() {
  const el = document.documentElement;
  const req = el.requestFullscreen || el.webkitRequestFullscreen;
  if (!req) return Promise.reject();
  const r = req.call(el, { navigationUI: 'hide' });
  return r && r.then ? r : Promise.resolve();
}
function exitFull() {
  const ex = document.exitFullscreen || document.webkitExitFullscreen;
  if (ex) ex.call(document);
}
function toggleFullscreen() {
  if (isFull()) { exitFull(); lsSet('combining-full', 'off'); return; }
  if (!canFull()) {
    // 아이폰 사파리는 웹페이지 전체화면이 안 된다 → 홈 화면에 추가하면 주소창 없이 앱처럼 켜진다
    showModal(`<div class="welcome"><div class="w-icon">📱</div><h3>전체화면으로 하려면</h3>
      <p>아이폰·아이패드는 <b>홈 화면에 추가</b>하면 주소창 없이 <b>앱처럼 꽉 찬 화면</b>으로 켜져요!</p>
      <ol class="full-steps"><li>아래쪽 <b>공유 버튼</b> <span class="ios-share">⬆️</span> 누르기</li><li><b>홈 화면에 추가</b> 누르기</li><li>홈 화면의 <b>몬스터 합치기</b> 아이콘으로 켜기</li></ol>
      <div class="row"><button class="btn" data-act="close">알겠어요</button></div></div>`);
    return;
  }
  enterFull().then(() => lsSet('combining-full', 'on')).catch(() => toast('이 브라우저는 전체화면이 안 돼요'));
}
function updateFullBtn() {
  const b = $('#fullBtn');
  if (!b) return;
  b.classList.toggle('hidden', !isPhone() || isStandalone());
  b.textContent = isFull() ? '🗗' : '⛶';
  b.title = isFull() ? '전체화면 끄기' : '전체화면';
}
['fullscreenchange', 'webkitfullscreenchange'].forEach(ev => document.addEventListener(ev, () => { updateFullBtn(); setTimeout(resize, 150); }));
// 전에 전체화면으로 했으면, 다음에 켤 때 처음 화면을 누르는 순간 다시 전체화면으로
document.addEventListener('pointerup', function autoFull() {
  document.removeEventListener('pointerup', autoFull, true);
  if (isPhone() && canFull() && !isFull() && !isStandalone() && lsGet('combining-full') === 'on') enterFull().catch(() => {});
}, true);

// ----- 🎵 배경음악: 파일 없이 직접 연주한다 (섬 / 전투 두 곡) -----
const musicOn = () => lsGet('combining-music') !== 'off';
const CH = { C: [48, 60, 64, 67], G: [43, 59, 62, 67], Am: [45, 60, 64, 69], F: [41, 60, 65, 69], Em: [40, 59, 64, 67], E: [40, 56, 59, 64],
  Dm: [38, 62, 65, 69], Bb: [46, 62, 65, 70], Gm: [43, 62, 67, 70], A: [45, 61, 64, 69] };
// 멜로디는 [음 높이(MIDI), 8분음표 몇 개]  (0 = 쉼표)
const SONGS = {
  island: {
    bpm: 100, drums: 'soft', vol: 1,
    chords: ['C', 'G', 'Am', 'F', 'C', 'G', 'F', 'G'],
    melody: [
      [76, 2], [79, 2], [81, 1], [79, 1], [76, 2],
      [74, 2], [79, 2], [83, 2], [81, 2],
      [84, 3], [83, 1], [81, 2], [76, 2],
      [77, 2], [81, 2], [79, 4],
      [76, 1], [79, 1], [84, 2], [83, 1], [81, 1], [79, 2],
      [74, 2], [71, 2], [74, 2], [79, 2],
      [81, 2], [79, 1], [77, 1], [76, 2], [74, 2],
      [74, 2], [76, 2], [72, 4],
    ],
  },
  // 상점: 오르골처럼 톡톡 튀는 귀여운 곡 (F장조)
  shop: {
    bpm: 118, drums: 'shop', vol: 1, lead: 'sine', pluck: true,
    chords: ['F', 'Dm', 'Bb', 'C', 'F', 'Dm', 'Gm', 'C'],
    melody: [
      [81, 1], [84, 1], [81, 1], [77, 1], [79, 2], [81, 2],
      [77, 1], [74, 1], [77, 1], [81, 1], [86, 2], [84, 2],
      [86, 1], [84, 1], [82, 1], [81, 1], [82, 2], [77, 2],
      [79, 2], [76, 1], [79, 1], [84, 4],
      [84, 1], [81, 1], [77, 1], [81, 1], [84, 2], [89, 2],
      [88, 1], [86, 1], [84, 1], [81, 1], [86, 4],
      [82, 1], [81, 1], [79, 1], [77, 1], [79, 2], [82, 2],
      [81, 2], [79, 2], [77, 4],
    ],
  },
  // 📖 도감: 신비롭게 탐험하는 느낌 (D단조, 드럼 없이 부드러운 화음 + 방울 소리 멜로디)
  dex: {
    bpm: 90, drums: 'calm', vol: 1, lead: 'sine', pluck: true, pad: true,
    chords: ['Dm', 'Bb', 'F', 'C', 'Dm', 'Bb', 'C', 'A'],
    melody: [
      [81, 2], [86, 2], [84, 1], [81, 1], [77, 2],
      [77, 2], [82, 2], [81, 2], [77, 2],
      [84, 3], [81, 1], [77, 2], [81, 2],
      [79, 2], [76, 2], [79, 4],
      [86, 2], [89, 2], [88, 1], [86, 1], [81, 2],
      [82, 2], [86, 2], [84, 2], [82, 2],
      [81, 1], [79, 1], [76, 2], [79, 2], [84, 2],
      [85, 2], [88, 2], [81, 4],
    ],
  },
  battle: {
    bpm: 140, drums: 'hard', vol: 0.9,
    chords: ['Am', 'F', 'C', 'G', 'Am', 'F', 'G', 'E'],
    melody: [
      [69, 1], [72, 1], [76, 1], [81, 1], [79, 2], [76, 2],
      [77, 1], [76, 1], [74, 1], [72, 1], [69, 2], [72, 2],
      [76, 1], [79, 1], [84, 2], [83, 1], [79, 1], [76, 2],
      [74, 2], [79, 2], [83, 2], [86, 2],
      [81, 2], [79, 1], [76, 1], [81, 2], [84, 2],
      [81, 1], [79, 1], [77, 2], [76, 2], [72, 2],
      [74, 1], [76, 1], [79, 1], [83, 1], [86, 2], [83, 2],
      [80, 2], [83, 2], [88, 4],
    ],
  },
};
const MUS = { cur: null, gain: null, timer: null, next: 0, step: 0, started: false, noise: null };
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
function audioCtx() {
  try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
  return AC;
}
function mTone(dest, t, midi, dur, type, vol, attack = 0.01) {
  const o = AC.createOscillator(), g = AC.createGain();
  o.type = type; o.frequency.value = hz(midi);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(vol, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(dest);
  o.start(t); o.stop(t + dur + 0.05);
}
function mNoise(dest, t, dur, vol, freq) {
  if (!MUS.noise) {
    MUS.noise = AC.createBuffer(1, AC.sampleRate * 0.5, AC.sampleRate);
    const d = MUS.noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain();
  s.buffer = MUS.noise; f.type = 'highpass'; f.frequency.value = freq;
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f); f.connect(g); g.connect(dest);
  s.start(t); s.stop(t + dur + 0.02);
}
function mKick(dest, t, vol) {
  const o = AC.createOscillator(), g = AC.createGain();
  o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
  o.connect(g); g.connect(dest); o.start(t); o.stop(t + 0.2);
}
// 곡을 8분음표 단위 사건 목록으로 풀어 둔다
function songEvents(song) {
  if (song.ev) return song.ev;
  const ev = [];
  let pos = 0;
  song.melody.forEach(([m, len]) => { if (m) ev.push({ at: pos, k: 'mel', m, len }); pos += len; });
  song.chords.forEach((c, bar) => {
    const ch = CH[c], b0 = bar * 8;
    for (let s = 0; s < 8; s++) {
      ev.push({ at: b0 + s, k: 'arp', m: ch[1 + [0, 1, 2, 1][s % 4]] + (s >= 4 ? 12 : 0) });
      if (song.pad && s === 0) ch.slice(1).forEach(m => ev.push({ at: b0, k: 'pad', m, len: 8 }));
      if (song.drums === 'calm') {
        if (s === 0) ev.push({ at: b0, k: 'bass', m: ch[0], len: 8 });
      } else if (song.drums === 'shop') {
        // 걸어 다니는 베이스: 근음과 5도를 번갈아
        if (s % 2 === 0) ev.push({ at: b0 + s, k: 'bass', m: ch[0] + (s % 4 === 2 ? 7 : 0), len: 2 });
      } else if (song.drums === 'hard' ? true : s % 4 === 0) ev.push({ at: b0 + s, k: 'bass', m: ch[0] + (song.drums === 'hard' && s % 2 ? 12 : 0), len: song.drums === 'hard' ? 1 : 3 });
      if (song.drums !== 'calm' && (s % 4 === 0 || (song.drums === 'hard' && s % 2 === 0))) ev.push({ at: b0 + s, k: 'kick' });
      if ((song.drums === 'hard' || song.drums === 'shop') && s % 4 === 2) ev.push({ at: b0 + s, k: 'snare' });
      if (s % 2 === 1 || song.drums === 'hard') ev.push({ at: b0 + s, k: 'hat' });
    }
  });
  song.len = song.chords.length * 8;
  song.ev = ev;
  return ev;
}
function musicTick() {
  if (!AC || !MUS.cur || AC.state !== 'running') return;
  const song = SONGS[MUS.cur], ev = songEvents(song), e8 = 60 / song.bpm / 2;
  // 멈춰 있다가 다시 켜지면 밀린 음을 한꺼번에 치지 않게
  if (MUS.next < AC.currentTime - 0.05) MUS.next = AC.currentTime + 0.05;
  while (MUS.next < AC.currentTime + 0.35) {
    const at = MUS.step % song.len, t = MUS.next, dest = MUS.gain, v = song.vol;
    ev.forEach(x => {
      if (x.at !== at) return;
      if (x.k === 'mel' && song.pluck) {
        // 오르골 소리: 짧게 울리고 한 옥타브 위 방울 소리를 살짝
        mTone(dest, t, x.m, Math.min(x.len * e8, 0.5), song.lead, 0.11 * v, 0.005);
        mTone(dest, t, x.m + 12, 0.25, 'sine', 0.03 * v, 0.005);
      } else if (x.k === 'mel') mTone(dest, t, x.m, x.len * e8 * 0.95, song.lead || 'triangle', 0.09 * v, 0.02);
      else if (x.k === 'arp') mTone(dest, t, x.m, e8 * (song.drums === 'calm' ? 1.6 : 0.9), 'sine', (song.drums === 'calm' ? 0.022 : 0.035) * v);
      else if (x.k === 'pad') mTone(dest, t, x.m, x.len * e8, 'triangle', 0.022 * v, 0.6);
      else if (x.k === 'bass') mTone(dest, t, x.m, x.len * e8 * 0.9, 'triangle', 0.1 * v, 0.01);
      else if (x.k === 'kick') mKick(dest, t, (song.drums === 'hard' ? 0.22 : 0.14) * v);
      else if (x.k === 'snare') mNoise(dest, t, song.drums === 'shop' ? 0.06 : 0.14, (song.drums === 'shop' ? 0.05 : 0.09) * v, song.drums === 'shop' ? 3000 : 1500);
      else if (x.k === 'hat') mNoise(dest, t, 0.04, (song.drums === 'calm' ? 0.012 : 0.025) * v, 7000);
    });
    MUS.step++;
    MUS.next += e8;
  }
}
// 곡 바꾸기 (전 곡은 살짝 줄이면서 끄고 새 곡을 키운다)
function setMusic(name) {
  if (!MUS.started) return;
  if (!musicOn()) name = null;
  if (name === MUS.cur) return;
  if (!audioCtx()) return;
  const old = MUS.gain;
  if (old) {
    const now = AC.currentTime, g = old.gain;
    // 키우는 중이던 예약을 지우지 않으면 끄는 도중에 다시 커져서 두 곡이 겹쳐 들린다
    if (g.cancelAndHoldAtTime) g.cancelAndHoldAtTime(now);
    else { const v = g.value; g.cancelScheduledValues(now); g.setValueAtTime(v, now); }
    g.linearRampToValueAtTime(0.0001, now + 0.4);
    setTimeout(() => { try { old.disconnect(); } catch (e) { /* 이미 끊김 */ } }, 600);
  }
  MUS.cur = name;
  MUS.gain = null;
  if (!name) return;
  MUS.gain = AC.createGain();
  MUS.gain.gain.setValueAtTime(0.0001, AC.currentTime);
  MUS.gain.gain.linearRampToValueAtTime(MUSIC_VOL, AC.currentTime + 1.2);
  MUS.gain.connect(AC.destination);
  MUS.step = 0;
  MUS.next = AC.currentTime + 0.1;
  if (!MUS.timer) MUS.timer = setInterval(musicTick, 60);
}
function startMusic() {
  MUS.started = true;
  setMusic(wantSong());
}
// 전투 중이면 전투 곡, 아니면 섬 곡
const wantSong = () => (B ? 'battle' : tab === 'shop' ? 'shop' : tab === 'dex' ? 'dex' : 'island');
setInterval(() => { if (MUS.started) setMusic(wantSong()); }, 400);
// 소리가 막혀 있으면 화면을 처음 누를 때 켠다
['pointerdown', 'keydown'].forEach(ev => document.addEventListener(ev, () => { if (AC && AC.state === 'suspended' && !document.hidden) AC.resume(); }, true));
document.addEventListener('visibilitychange', () => {
  if (!AC) return;
  if (document.hidden) AC.suspend();
  else { AC.resume(); MUS.next = Math.max(MUS.next, AC.currentTime + 0.1); }
});
function toggleMusic() {
  lsSet('combining-music', musicOn() ? 'off' : 'on');
  if (musicOn()) { MUS.started = true; audioCtx(); if (AC && AC.state === 'suspended') AC.resume(); setMusic(wantSong()); } else setMusic(null);
  toast(musicOn() ? '🎵 배경음악을 켰어요' : '🎵 배경음악을 껐어요');
  openAccountMenu();
}

function toggleSound() {
  lsSet('combining-sound', soundOn() ? 'off' : 'on');
  toast(soundOn() ? '🔊 소리를 켰어요' : '🔇 소리를 껐어요');
  sfx('tap');
  openAccountMenu();
}

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
// 짧은 숫자: 12,345 → 1.2만, 3억 4천만 → 3.4억
const shortNum = (n) => { n = Math.floor(n); if (n >= 1e12) return (n / 1e12).toFixed(n >= 1e13 ? 0 : 1) + '조'; if (n >= 1e8) return (n / 1e8).toFixed(n >= 1e9 ? 0 : 1) + '억'; if (n >= 1e4) return (n / 1e4).toFixed(n >= 1e5 ? 0 : 1) + '만'; return fmt(n); };
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
  return `<div class="card r-${c.rarity} ${cls}" style="--rc:${r.color}" ${attrs}>
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
  if (typeof SHARE !== 'undefined' && SHARE) stopShare();
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
  if (p.kind === 'mountain') return mtnBusy(p).some(b => Date.now() >= b.end);
  if (p.kind === 'hatchery') return S.hatch.length > 0 || hatchIncs(p).some(Boolean);
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
      const busy = mtnBusy(p), n = mtnSlots(p).length;
      const cnt = n > 1 ? ` ${busy.length}/${n}` : '';
      if (!busy.length) return n > 1 ? `교배 가능 0/${n}` : '교배 가능';
      if (busy.some(b => now >= b.end)) return `🥚 완료!${cnt}`;
      return `⏳ ${mmss(Math.min(...busy.map(b => b.end - now)) / 1000)}${cnt}`;
    }
    if (p.kind === 'hatchery') {
      const incs = hatchIncs(p), busy = incs.filter(Boolean);
      if (busy.length) return `🐣 깨울 알 ${busy.length}`;
      return `🥚 ${S.hatch.length}/${hatchCap()}`;
    }
    if (p.kind === 'farm') {
      if (p.crop == null) return '비어 있음';
      return now >= p.end ? `${CROPS[p.crop].emoji} 수확!` : `⏳ ${mmss((p.end - now) / 1000)}`;
    }
    if (p.kind === 'hab') return `💰 ${fmt(p.gold)}`;
  }
  if (k === 'inc' || k === 'incGem') {
    const [pi, si] = arg.split('|').map(Number);
    const b = S.plots[pi] && S.plots[pi].kind === 'hatchery' ? hatchIncs(S.plots[pi])[si] : null;
    if (!b) return k === 'inc' ? '' : '0';
    if (k === 'incGem') return fmt(gemCost((b.end - now) / 1000, 10));
    return now >= b.end ? '완료!' : mmss((b.end - now) / 1000);
  }
  if (k === 'breed' || k === 'breedGem') {
    const [pi, si] = arg.split('|').map(Number);
    const b = S.plots[pi] && S.plots[pi].kind === 'mountain' ? mtnSlots(S.plots[pi])[si || 0] : null;
    if (!b) return k === 'breed' ? '' : '0';
    if (k === 'breedGem') return fmt(gemCost((b.end - now) / 1000, 10));
    return now >= b.end ? '완료!' : mmss((b.end - now) / 1000);
  }
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
    return `💰 ${fmt(S.plots[i].gold)}`;
  }
  return '';
}
function liveBar(key) {
  const [k, arg] = key.split(':');
  const now = Date.now();
  if (k === 'inc') { const [pi, si] = arg.split('|').map(Number); const b = S.plots[pi] && S.plots[pi].kind === 'hatchery' ? hatchIncs(S.plots[pi])[si] : null; if (b) return Math.min(1, 1 - (b.end - now) / 1000 / b.total); }
  if (k === 'breed') { const [pi, si] = arg.split('|').map(Number); const b = S.plots[pi] && S.plots[pi].kind === 'mountain' ? mtnSlots(S.plots[pi])[si || 0] : null; if (b) return Math.min(1, 1 - (b.end - now) / 1000 / b.total); }
  if (k === 'farm') {
    const p = S.plots[Number(arg)];
    if (p && p.crop != null) return Math.min(1, 1 - (p.end - now) / 1000 / CROPS[p.crop].time);
  }

  return 0;
}
function refreshLive() {
  document.querySelectorAll('[data-live]').forEach(el => { const s = liveText(el.dataset.live); if (el.textContent !== s) el.textContent = s; });
  document.querySelectorAll('[data-bar]').forEach(el => { const w = `${liveBar(el.dataset.bar) * 100}%`; if (el.style.width !== w) el.style.width = w; });
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
  const n = i % ISLAND_PLOTS;
  const gx = n % GRID, gy = Math.floor(n / GRID);
  return { x: (gx - gy) * TW / 2, y: (gx + gy) * TH / 2 };
};
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function resize() {
  // 작은 화면은 해상도를 조금 낮춰도 티가 안 나고 훨씬 가볍다
  DPR = Math.min(window.innerWidth < 760 ? 1.5 : 2, window.devicePixelRatio || 1);
  W = window.innerWidth;
  H = window.innerHeight;
  cv.width = Math.round(W * DPR);
  cv.height = Math.round(H * DPR);
  const portrait = H > W * 1.2;
  cam.z = portrait ? clamp(W / 820, 0.3, 1.2) : clamp(Math.min(W / 1150, (H - 190) / 860), 0.26, 1.2);
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

// 이모지 글자를 매번 그리면 휴대폰에서 아주 느리다 → 크기별로 한 번만 그려 두고 그림처럼 찍는다
const EMO_CACHE = new Map();
let drawScale = 1;   // 지금 화면 배율 (DPR × 확대)
function emojiSprite(e, px) {
  const key = e + '|' + px;
  let c = EMO_CACHE.get(key);
  if (!c) {
    if (EMO_CACHE.size > 700) EMO_CACHE.clear();
    const s = Math.ceil(px * 1.35);
    c = document.createElement('canvas');
    c.width = c.height = s;
    const g = c.getContext('2d');
    g.font = `${px}px ${EMOJI_FONT}`;
    g.fillStyle = '#fff';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(e, s / 2, s / 2);
    EMO_CACHE.set(key, c);
  }
  return c;
}
function emoji(e, x, y, size, rot = 0, flip = 1) {
  const want = size * drawScale;
  const px = Math.max(8, Math.min(320, want < 64 ? Math.ceil(want / 4) * 4 : Math.ceil(want / 16) * 16));
  const c = emojiSprite(e, px);
  const d = c.width * size / px;
  if (!rot && flip >= 0) { ctx.drawImage(c, x - d / 2, y - d / 2, d, d); return; }
  ctx.save();
  ctx.translate(x, y);
  if (rot) ctx.rotate(rot);
  if (flip < 0) ctx.scale(-1, 1);
  ctx.drawImage(c, -d / 2, -d / 2, d, d);
  ctx.restore();
}

function shadow(x, y, rx, ry = rx * 0.35) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,.22)';
  ctx.fill();
}

const MIN_TEXT_PX = 10;   // 화면에서 글씨가 이 크기(px)보다 작아지지 않게
const minSize = (size, px = MIN_TEXT_PX) => Math.max(size, px / cam.z);
function pill(text, x, y, bg, fg, size = 15) {
  size = minSize(size);
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
  size = minSize(size, 11);
  ctx.font = `800 ${size}px ${TEXT_FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = Math.max(4, 3 / cam.z);
  ctx.strokeStyle = 'rgba(0,0,0,.75)';
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
let seaGrad = null, seaH = 0;
function drawSea(t) {
  if (!seaGrad || seaH !== H) {
    seaGrad = ctx.createLinearGradient(0, 0, 0, H);
    seaGrad.addColorStop(0, '#2b8fe0');
    seaGrad.addColorStop(1, '#0b4f8a');
    seaH = H;
  }
  ctx.fillStyle = seaGrad;
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
  const th = ISLANDS[S.isl || 0];
  ctx.fillStyle = 'rgba(0,0,0,.18)';
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x, y, 770, 455, 0, 0, Math.PI * 2);
  ctx.fillStyle = th.sand;
  ctx.fill();
  const g = ctx.createRadialGradient(x, y - 60, 60, x, y, 760);
  g.addColorStop(0, th.grass[0]);
  g.addColorStop(1, th.grass[1]);
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
    if (!S.hideUI) ctx.fillText('+', x, y);
    return;
  }
  const ready = plotReady(i);
  if (p.kind === 'deco') {
    const d = decoById(p.id);
    diamond(x, y, hw, hh);
    ctx.fillStyle = 'rgba(255,255,255,.12)';
    ctx.fill();
    shadow(x, y + 10, 46);
    if (d) emoji(d.emoji, x, y - 22 + Math.sin(t * 1.5 + i) * 2, 78);
    return;
  }
  if (p.kind === 'mountain') {
    block(x, y, hw, hh, '#8d82d8', '#51479b');
    shadow(x, y + 8, 80);
    const lvUp = Math.min(40, ((p.lv || 1) - 1) * 12);
    emoji('🏔️', x, y - 42 - lvUp / 3, 118 + lvUp);
    if (!S.hideUI && (p.lv || 1) > 1) emoji('⭐', x + 52, y - 92, 24);
    // 교배 중인 칸마다 알을 하나씩 (최대 4개)
    mtnBusy(p).slice(0, 4).forEach((br, bi) => {
      const done = Date.now() >= br.end, kk = done ? Math.abs(Math.sin(t * 5 + bi)) * -10 : 0;
      emoji('🥚', x + 58 - bi * 30, y + 6 + bi * 12 + kk, 38, done ? 0 : Math.sin(t * (4 + rIdx(br.type) * 2) + bi) * 0.25);
    });
  } else if (p.kind === 'hatchery') {
    block(x, y, hw, hh, '#e2bd78', '#9e7434');
    shadow(x, y + 10, 60);
    const big = Math.min(40, ((p.cap || HATCH_CAP) - HATCH_CAP) * 4);
    emoji('🪺', x, y - 18 - big / 3, 86 + big);
    if (!S.hideUI && (p.cap || HATCH_CAP) > HATCH_CAP) emoji('⭐', x + 44, y - 58, 24);
    const hk = hatcheries().indexOf(i), per = Math.ceil(S.hatch.length / Math.max(1, hatcheries().length));
    hatchIncs(p).filter(Boolean).slice(0, 3).forEach((b, bi) => {
      const done = Date.now() >= b.end;
      emoji('🥚', x - 30 + bi * 30, y - 40 + (done ? Math.abs(Math.sin(t * 6 + bi)) * -10 : 0), 34, done ? 0 : Math.sin(t * 7 + bi) * 0.3);
    });
    S.hatch.slice(hk * per, hk * per + per).slice(0, 4).forEach((type, k) => emoji('🥚', x - 51 + k * 34, y + 26 + Math.sin(t * 6 + k) * 2, 30, Math.sin(t * 5 + k) * 0.2));
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
    if (!S.hideUI) for (let k = 1; k < p.lv; k++) emoji('⭐', x - hw * 0.3 + (k - 1) * 22, y + hh * 0.72, 16);
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
  if (!p || p.kind === 'deco') return;
  const ready = plotReady(i);
  const name = p.kind === 'mountain' ? ((p.lv || 1) > 1 ? `큰 교배산 Lv.${p.lv}` : '교배산') : p.kind === 'hatchery' ? ((p.cap || HATCH_CAP) > HATCH_CAP ? `큰 부화장 ${p.cap}칸` : '부화장') : p.kind === 'farm' ? '농장' : `${habName(p.el)} Lv.${p.lv}`;
  const ly = y + TH / 2 + 10;
  label(name, x, ly, 17);
  if (p.kind === 'hab') {
    const inc = habIncome(i);
    if (p.gold >= Math.max(1, inc * 10)) {
      const by = y - TH * 0.95 + Math.sin(t * 3 + i) * 5;
      const full = inc > 0 && p.gold >= inc * 600;   // 10분치 넘게 쌓이면 노랗게
      ctx.beginPath();
      const br = minSize(30, 16);
      ctx.arc(x, by, br, 0, Math.PI * 2);
      ctx.fillStyle = full ? '#ffe066' : 'rgba(255,255,255,.92)';
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x - 8, by + 26);
      ctx.lineTo(x, by + 40);
      ctx.lineTo(x + 8, by + 26);
      ctx.fill();
      emoji('💰', x, by - 2, br * 1.05);
      pill(shortNum(p.gold), x, by - br * 1.4, 'rgba(0,0,0,.6)', '#ffe066', 14);
      bubbles.push({ x, y: by, r: br + 6, i });
    }
    return;
  }
  const text = liveText(`plot:${i}`);
  const bounce = ready ? Math.abs(Math.sin(t * 4)) * -6 : 0;
  pill(text, x, ly + 26 + bounce, ready ? '#ffe066' : 'rgba(0,0,0,.55)', ready ? '#3a2a00' : '#fff', 14);
}

function drawCarry(t) {
  const p = S.plots[carry.from];
  if (!p) { carry = null; return; }
  // 놓을 칸 표시: 초록(가능) / 빨강(불가)
  if (carry.over >= 0 && carry.over !== carry.from) {
    const r = dropResult(carry.from, carry.over);
    const { x, y } = plotPos(carry.over);
    diamond(x, y, TW / 2 - 4, TH / 2 - 2);
    ctx.fillStyle = r.ok ? 'rgba(125,255,143,.35)' : 'rgba(255,77,109,.35)';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = r.ok ? '#7dff8f' : '#ff4d6d';
    ctx.stroke();
    if (r.text) pill(r.text, x, y - TH * 0.9, r.ok ? '#1f7a2e' : '#7a1f2e', '#fff', 15);
  }
  const src = plotPos(carry.from);
  diamond(src.x, src.y, TW / 2 - 8, TH / 2 - 5);
  ctx.fillStyle = 'rgba(0,0,0,.35)';
  ctx.fill();
  const w = toWorld(carry.sx, carry.sy);
  const icon = p.kind === 'mountain' ? '🏔️' : p.kind === 'hatchery' ? '🪺' : p.kind === 'farm' ? '🌾'
    : p.kind === 'deco' ? (decoById(p.id) || { emoji: '❓' }).emoji : habEmoji(p.el);
  ctx.globalAlpha = 0.9;
  shadow(w.x, w.y + 30, 40);
  emoji(icon, w.x, w.y - 20 + Math.sin(t * 8) * 3, 90);
  ctx.globalAlpha = 1;
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
  if (islandOf(i) !== (S.isl || 0)) return;   // 다른 섬 숫자는 띄우지 않기
  const { x, y } = plotPos(i);
  floaters.push({ x, y: y - TH * 0.8, text, t0: performance.now() / 1000 });
}

let lastFrame = 0, lastDraw = 0, lastInput = 0;
const LOW_POWER = matchMedia('(pointer: coarse)').matches || window.innerWidth < 760;
['pointerdown', 'pointermove', 'wheel', 'touchmove'].forEach(ev => window.addEventListener(ev, () => { lastInput = performance.now(); }, { passive: true }));
function drawWorld(now) {
  // 휴대폰: 가만히 있을 때는 1초에 30번만 그린다 (배터리·렉 줄이기)
  if (LOW_POWER && now - lastInput > 800 && !carry && now - lastDraw < 30) { requestAnimationFrame(drawWorld); return; }
  lastDraw = now;
  const t = now / 1000;
  const dt = Math.min(0.05, t - (lastFrame || t));
  lastFrame = t;
  if (tab === 'island' && !B) {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    drawSea(t);
    const z = cam.z;
    drawScale = DPR * z;
    ctx.setTransform(DPR * z, 0, 0, DPR * z, DPR * (W / 2 - cam.x * z), DPR * (H / 2 + 10 - cam.y * z));
    BOATS.forEach(b => {
      b.x += b.v * dt;
      if (b.x > 1300) b.x = -1300;
      if (b.x < -1300) b.x = 1300;
      emoji('⛵', b.x, b.y + Math.sin(t * 1.5 + b.y) * 4, 48, Math.sin(t * 1.2) * 0.06, b.v < 0 ? 1 : -1);
    });
    drawIsland(t);
    const decor = ISLANDS[S.isl || 0].decor;
    const items = DECOR.map((d, k) => ({ y: d.y, fn: () => { shadow(d.x, d.y + d.s * 0.4, d.s * 0.35); emoji(decor[k % decor.length], d.x, d.y, d.s); } }));
    const here = islandRange(S.isl || 0);
    here.forEach(i => {
      const p = S.plots[i], { x, y } = plotPos(i);
      items.push({ y, fn: () => drawPlot(p, i, x, y, t, dt) });
    });
    items.sort((a, b) => a.y - b.y).forEach(it => it.fn());
    bubbles = [];
    // 👁️ 숨기기: 이름표·타이머·💰 말풍선을 그리지 않는다
    if (!S.hideUI) here.forEach(i => { const { x, y } = plotPos(i); drawLabel(S.plots[i], i, x, y, t); });
    if (carry) drawCarry(t);
    drawFloaters(t);
  }
  requestAnimationFrame(drawWorld);
}

// ----- 입력 (탭 / 드래그 / 휠) -----
function toWorld(sx, sy) {
  return { x: (sx - W / 2) / cam.z + cam.x, y: (sy - H / 2 - 10) / cam.z + cam.y };
}
// 화면 좌표 아래에 있는 칸 번호 (없으면 -1)
function plotAt(sx, sy) {
  const w = toWorld(sx, sy);
  const order = islandRange(S.isl || 0).map(i => ({ i, ...plotPos(i) })).sort((p, q) => q.y - p.y);
  // 땅 칸을 먼저 본다: 앞 건물의 그림이 뒤 건물 칸을 가려도 뒤 건물이 잡히게
  for (const o of order) {
    if (Math.abs(w.x - o.x) / (TW / 2) + Math.abs(w.y - o.y) / (TH / 2) <= 1) return o.i;
  }
  // 칸 밖이면 건물 그림(위로 솟은 부분)을 눌렀는지 본다
  for (const o of order) {
    const dx = Math.abs(w.x - o.x), dy = w.y - o.y;
    if (S.plots[o.i] && dx < TW * 0.3 && dy < 0 && dy > -TH * 1.1) return o.i;
  }
  return -1;
}
function tapAt(sx, sy) {
  if (VISIT) { visitTap(plotAt(sx, sy)); return; }
  const w = toWorld(sx, sy);
  for (const bb of bubbles) {
    if (Math.hypot(w.x - bb.x, w.y - bb.y) < bb.r + 8) { collectHab(bb.i, true); return; }
  }
  const i = plotAt(sx, sy);
  if (i >= 0) openPlot(i);
}

// 건물 꾹 눌러 끌기: 빈 땅에 놓으면 그 자리로 옮긴다
const HOLD_MS = 320;
let drag = null;
let carry = null;   // { from, sx, sy, over }
function dropResult(from, to) {
  const p = S.plots[from], q = to >= 0 ? S.plots[to] : undefined;
  if (to < 0 || to === from) return { ok: false };
  if (!q) return { ok: true, kind: 'move', text: '🚚 여기로 옮기기' };
  // 건물 합치기는 없앴다: 빈 땅으로 옮기기만 된다
  return { ok: false, text: '빈 땅에만 옮길 수 있어요' };
}
function dropBuilding(from, to) {
  const r = dropResult(from, to);
  if (!r.ok) { if (r.text) toast(r.text); return; }
  const p = S.plots[from];
  if (r.kind === 'move') {
    S.plots[to] = p;
    S.plots[from] = null;
    S.monsters.forEach(m => { if (m.hab === from) { m.hab = to; delete walkers[m.uid]; } });
    toast('🚚 건물을 옮겼어요');
  } else if (p.kind === 'hatchery') {
    mergeHatch(to, from);
    closeModal();
  } else if (p.kind === 'mountain') {
    mergeMountain(to, from);
  }
  save();
  render();
}
// ----- 확대/축소: 두 손가락 벌리기(핀치), 마우스 휠, ＋/− 버튼 -----
const ZOOM_MIN = 0.28, ZOOM_MAX = 2.2;
// 화면의 (sx, sy) 지점을 기준으로 배율을 바꾼다 (그 지점 아래의 섬은 그대로 있게)
function zoomAt(z, sx = W / 2, sy = H / 2 + 10) {
  const before = toWorld(sx, sy);
  cam.z = clamp(z, ZOOM_MIN, ZOOM_MAX);
  cam.x = clamp(before.x - (sx - W / 2) / cam.z, -650, 650);
  cam.y = clamp(before.y - (sy - H / 2 - 10) / cam.z, -150, 680);
}
const ptrs = new Map();   // 화면에 닿아 있는 손가락들
let pinch = null;
const pinchInfo = () => {
  const [p, q] = [...ptrs.values()];
  return { d: Math.hypot(p.x - q.x, p.y - q.y), mx: (p.x + q.x) / 2, my: (p.y + q.y) / 2 };
};

cv.addEventListener('pointerdown', (e) => {
  ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
  try { cv.setPointerCapture(e.pointerId); } catch (err) { /* 캡처 불가 */ }
  if (ptrs.size >= 2) {
    // 두 번째 손가락: 끌기/탭을 멈추고 핀치 시작
    if (drag) clearTimeout(drag.hold);
    carry = null;
    drag = null;
    const info = pinchInfo();
    pinch = { d0: Math.max(10, info.d), z0: cam.z, mx: info.mx, my: info.my };
    return;
  }
  drag = { sx: e.clientX, sy: e.clientY, cx: cam.x, cy: cam.y, moved: false, hold: null };
  const i = plotAt(e.clientX, e.clientY);
  if (i >= 0 && S.plots[i] && !VISIT) {
    drag.hold = setTimeout(() => {
      if (!drag || drag.moved || pinch) return;
      carry = { from: i, sx: drag.sx, sy: drag.sy, over: i };
      if (navigator.vibrate) try { navigator.vibrate(25); } catch (err) { /* 진동 없음 */ }
      toast('끌어서 빈 땅에 놓으면 그 자리로 옮겨요');
    }, HOLD_MS);
  }
});
cv.addEventListener('pointermove', (e) => {
  if (ptrs.has(e.pointerId)) ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (pinch && ptrs.size >= 2) {
    const info = pinchInfo();
    // 손가락 사이 가운데를 기준으로 확대하고, 두 손가락을 같이 움직이면 화면도 따라 움직인다
    zoomAt(pinch.z0 * info.d / pinch.d0, info.mx, info.my);
    cam.x = clamp(cam.x - (info.mx - pinch.mx) / cam.z, -650, 650);
    cam.y = clamp(cam.y - (info.my - pinch.my) / cam.z, -150, 680);
    pinch.mx = info.mx;
    pinch.my = info.my;
    pinch.z0 = cam.z;
    pinch.d0 = Math.max(10, info.d);
    return;
  }
  if (!drag) return;
  if (carry) {
    carry.sx = e.clientX;
    carry.sy = e.clientY;
    carry.over = plotAt(e.clientX, e.clientY);
    return;
  }
  const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
  if (Math.hypot(dx, dy) > 8) { drag.moved = true; clearTimeout(drag.hold); }
  if (drag.moved) {
    cam.x = clamp(drag.cx - dx / cam.z, -650, 650);
    cam.y = clamp(drag.cy - dy / cam.z, -150, 680);
  }
});
function endPointer(e, cancel) {
  ptrs.delete(e.pointerId);
  if (pinch) {
    if (ptrs.size < 2) pinch = null;   // 핀치가 끝나도 남은 손가락으로 탭이 되지 않게
    drag = null;
    return;
  }
  if (drag) clearTimeout(drag.hold);
  if (!cancel && carry) {
    const c = carry;
    carry = null;
    if (c.over !== c.from) dropBuilding(c.from, plotAt(e.clientX, e.clientY));
  } else if (!cancel && drag && !drag.moved) tapAt(e.clientX, e.clientY);
  if (cancel) carry = null;
  drag = null;
}
cv.addEventListener('pointerup', (e) => endPointer(e, false));
cv.addEventListener('pointercancel', (e) => endPointer(e, true));
cv.addEventListener('wheel', (e) => {
  e.preventDefault();
  zoomAt(cam.z * Math.exp(-e.deltaY * 0.0012), e.clientX, e.clientY);
}, { passive: false });
window.addEventListener('resize', resize);
resize();

function renderIslandBar() {
  const k = S.isl || 0, th = ISLANDS[k];
  const used = islandRange(k).filter(i => S.plots[i]).length;
  const bar = $('#islandBar');
  bar.innerHTML = '<button class="ib-arrow" data-act="isl" data-d="-1">◀</button>' +
    '<button class="ib-name" data-act="islList">' + th.emoji + ' ' + (k + 1) + '. ' + th.name + ' <small>' + used + '/' + ISLAND_PLOTS + '칸' + (decoPercent(k) ? ' · 🎨+' + decoPercent(k) + '%' : '') + ' · 🗺️</small></button>' +
    '<button class="ib-arrow" data-act="isl" data-d="1">▶</button>';
  bar.classList.toggle('hidden', tab !== 'island');
  $('#zoomBtns').classList.toggle('hidden', tab !== 'island');
  const hb = $('#hideBtn');
  hb.classList.toggle('hidden', tab !== 'island');
  hb.classList.toggle('on', !!S.hideUI);
  hb.innerHTML = S.hideUI ? '👁️<span> 보이기</span>' : '🙈<span> 숨기기</span>';
  document.body.classList.toggle('ui-hidden', !!S.hideUI && tab === 'island');
}
function goIsland(k) {
  S.isl = (Number(k) + ISLANDS.length) % ISLANDS.length;
  save();
  closeModal();
  render();
}
function openIslandList() {
  const rows = ISLANDS.map((th, k) => {
    const r = islandRange(k), used = r.filter(i => S.plots[i]).length;
    const habs = r.filter(i => S.plots[i] && S.plots[i].kind === 'hab').length;
    const mons = S.monsters.filter(m => islandOf(m.hab) === k).length;
    return '<button class="build-opt ' + (k === (S.isl || 0) ? 'on' : '') + '" data-act="islGo" data-k="' + k + '" style="--hc:' + th.grass[1] + '">' +
      '<span class="bo-ico">' + th.emoji + '</span>' +
      '<span class="bo-nm">' + (k + 1) + '. ' + th.name + '<br><small>서식지 ' + habs + ' · 몬스터 ' + mons + '</small></span>' +
      '<span class="bo-cost">' + used + '/' + ISLAND_PLOTS + '칸</span></button>';
  }).join('');
  showModal('<h3>🗺️ 섬 지도</h3><div class="build-list">' + rows + '</div>' +
    '<div class="row"><button class="btn ghost small" data-act="close">닫기</button></div>');
}

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
  sfx('coin');
  mission('collect');
  if (tab !== 'island') toast(`💰 ${fmt(sum)} 골드를 걷었어요!`);
  save();
  refreshLive();
  updateHud();
}

function openPlot(i) {
  i = Number(i);
  const p = S.plots[i];
  if (!p) return openBuild(i);
  if (p.kind === 'mountain') return openBreed(i);
  if (p.kind === 'hatchery') return openHatchery(i);
  if (p.kind === 'deco') return openDeco(i);
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
      <button class="build-opt" data-act="decoPick" data-i="${i}" style="--hc:#ff5ce1">
        <span class="bo-ico">🎨</span><span class="bo-nm">섬 꾸미기 장식 <small>(골드 수입 보너스)</small></span><span class="bo-cost">▶</span>
      </button>
      <button class="build-opt" data-act="build" data-i="${i}" data-what="farm" style="--hc:#8b5a2b">
        <span class="bo-ico">🌾</span><span class="bo-nm">농장</span><span class="bo-cost">💰 ${fmt(FARM_COST)}</span>
      </button>
      <button class="build-opt" data-act="build" data-i="${i}" data-what="mountain" style="--hc:#6a5acd">
        <span class="bo-ico">🏔️</span><span class="bo-nm">교배산 <small>(${mountains().length}개 보유 · 동시에 교배)</small></span><span class="bo-cost">💰 ${fmt(MOUNTAIN_COST)}</span>
      </button>
      <button class="build-opt" data-act="build" data-i="${i}" data-what="hatchery" style="--hc:#c9953a">
        <span class="bo-ico">🪺</span><span class="bo-nm">부화장 <small>(${hatcheries().length}개 보유 · 알 ${HATCH_CAP}칸 더)</small></span><span class="bo-cost">💰 ${fmt(HATCHERY_COST)}</span>
      </button>
      ${EL.map(e => habBtn(e.id)).join('')}
      ${habBtn('legend')}
    </div>
    <div class="row"><button class="btn ghost small" data-act="close">닫기</button></div>`);
}

function build(i, what) {
  i = Number(i);
  if (S.plots[i]) return;
  if (what.startsWith('deco:')) {
    const d = decoById(what.slice(5));
    if (!d || !(d.gems ? spend(d.gems, 'gems') : spend(d.cost))) return;
    S.plots[i] = { kind: 'deco', id: d.id };
    toast(`${d.emoji} ${d.name}을(를) 놓았어요! 이 섬 골드 +${decoPercent(islandOf(i))}%`);
  } else if (what === 'hatchery') {
    if (!spend(HATCHERY_COST)) return;
    S.plots[i] = { kind: 'hatchery', cap: HATCH_CAP };
    toast(`🪺 부화장을 하나 더 지었어요! 알을 ${hatchCap()}개까지 둘 수 있어요`);
  } else if (what === 'mountain') {
    if (!spend(MOUNTAIN_COST)) return;
    S.plots[i] = { kind: 'mountain', breeds: [null] };
    toast('🏔️ 교배산을 하나 더 지었어요! 동시에 교배할 수 있어요');
  } else if (what === 'farm') {
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
    <p class="muted">몬스터 ${mons.length}/${habCap(i)}마리${mons.length >= habCap(i) ? " <b class=\"full\">가득</b>" : ""} · 초당 💰 ${fmt(habIncome(i))}${habLvBonus(i) ? ` · ⬆️ 레벨 보너스 +${habLvBonus(i)}%` : ''}${decoPercent(islandOf(i)) ? ` <span class="deco-bonus">🎨 +${decoPercent(islandOf(i))}%</span>` : ''}</p>
    <div class="store" data-live="hab:${i}"></div>
    <div class="row">
      <button class="btn" data-act="collectHab" data-i="${i}">💰 골드 걷기</button>
      <button class="btn ghost" data-act="upHab" data-i="${i}" ${maxed ? 'disabled' : ''}>⬆️ ${maxed ? '최대 레벨' : `업그레이드 (💰 ${fmt(habUpCost(p.lv))})`}</button>
    </div>
    ${(() => {
      const ups = S.plots.filter(q => q && q.kind === 'hab' && q.lv < HAB_MAX_LV);
      const cost = ups.reduce((s, q) => s + habUpCost(q.lv), 0);
      return `<div class="all-box">
        <button class="btn small" data-act="upAllHabs" data-i="${i}" ${ups.length ? '' : 'disabled'}>⬆️ 모든 서식지 한 단계 업그레이드${ups.length ? ` (${ups.length}개 · 💰 ${fmt(cost)})` : ' (모두 최대)'}</button>
      </div>`;
    })()}
    <div class="grid small">${mons.length
      ? sortMons(mons).map(m => card(m, `data-act="openMon" data-uid="${m.uid}"`)).join('')
      : '<p class="muted">아직 사는 몬스터가 없어요. 교배산에서 몬스터를 만들어 보세요!</p>'}</div>
    <div class="row">
      <button class="btn ghost small danger" data-act="demolish" data-i="${i}">🗑️ 철거 (+💰 ${fmt(demolishRefund(p))})</button>
      <button class="btn ghost small" data-act="close">닫기</button>
    </div>`);
}

// ----- 철거 -----
function demolishRefund(p) {
  if (p.kind === 'farm') return FARM_COST / 2;
  if (p.kind === 'mountain') return MOUNTAIN_COST / 2;
  if (p.kind === 'hatchery') return Math.floor(HATCHERY_COST / 2 * (p.cap || HATCH_CAP) / HATCH_CAP);
  if (p.kind === 'deco') { const d = decoById(p.id); return d && d.cost ? Math.floor(d.cost / 2) : 0; }
  let spent = habBuildCost(p.el);
  for (let lv = 1; lv < p.lv; lv++) spent += habUpCost(lv);
  return Math.floor(spent / 2);
}

function demolish(i) {
  i = Number(i);
  const p = S.plots[i];
  if (!p || !['hab', 'farm', 'mountain', 'hatchery', 'deco'].includes(p.kind)) return;
  if (p.kind === 'hatchery') {
    if (hatcheries().length <= 1) { toast('하나뿐인 부화장은 철거할 수 없어요'); return; }
    if (hatchIncs(p).some(Boolean)) { toast('부화 중인 알이 있는 부화장은 철거할 수 없어요'); return; }
    if (S.hatch.length > hatchCap() - (p.cap || HATCH_CAP)) { toast('알이 너무 많아서 철거할 수 없어요. 먼저 부화시켜 주세요'); return; }
  }
  if (p.kind === 'mountain' && (mtnBusy(p).length || mountains().length <= 1)) { toast('교배 중이거나 하나뿐인 교배산은 철거할 수 없어요'); return; }
  if (p.kind === 'hab' && habMons(i).length) {
    toast('안에 사는 몬스터를 먼저 다른 서식지로 이사시키거나 팔아 주세요');
    return;
  }
  const name = p.kind === 'farm' ? '농장' : p.kind === 'mountain' ? '교배산' : p.kind === 'hatchery' ? '부화장' : p.kind === 'deco' ? (decoById(p.id) || { name: '장식' }).name : habName(p.el);
  const lost = p.kind === 'farm' && p.crop != null ? '\n심어 둔 작물도 사라져요.' : '';
  if (!confirm(`${name}을(를) 철거할까요?\n지을 때 쓴 골드의 절반(💰${fmt(demolishRefund(p))})을 돌려받아요.${lost}`)) return;
  const refund = demolishRefund(p) + (p.kind === 'hab' ? Math.floor(p.gold) : 0);
  earn(refund);
  if (p.kind === 'deco' && decoById(p.id) && decoById(p.id).gems) earn(Math.floor(decoById(p.id).gems / 2), 'gems');
  S.plots[i] = null;
  save();
  closeModal();
  render();
  toast(`🗑️ ${name} 철거! 💰 ${fmt(refund)} 돌려받았어요`);
}

// ----- 이사 -----
function openMove(uid) {
  const m = byUid(uid);
  if (!m) return;
  const habs = habsFor(m.type).filter(h => h.i !== m.hab);
  showModal(`
    <h3>🏠 이사하기</h3>
    <p class="muted">${CAT[m.type].face} ${CAT[m.type].name}이(가) 옮겨 갈 서식지를 골라요.</p>
    ${habs.length
      ? `<div class="build-list">${habs.map(({ p, i }) => `
          <button class="build-opt" data-act="move" data-uid="${m.uid}" data-i="${i}" style="--hc:${habColor(p.el)}">
            <span class="bo-ico">${habEmoji(p.el)}</span>
            <span class="bo-nm">${habName(p.el)} Lv.${p.lv} <small>${islandLabel(i)}</small></span>
            <span class="bo-cost">${habMons(i).length}/${habCap(i)}</span>
          </button>`).join('')}</div>`
      : '<p class="warn">옮겨 갈 수 있는 빈 서식지가 없어요.<br>같은 속성 서식지를 하나 더 지어 보세요.</p>'}
    <div class="row"><button class="btn ghost small" data-act="openMon" data-uid="${m.uid}">← 뒤로</button></div>`);
}

function moveMon(uid, i) {
  const m = byUid(uid);
  i = Number(i);
  if (!m || !habsFor(m.type).some(h => h.i === i)) return;
  m.hab = i;
  delete walkers[m.uid];
  save();
  toast(`🏠 ${CAT[m.type].name}이(가) ${habName(S.plots[i].el)}으로 이사했어요!`);
  closeModal();
  render();
}

function collectHab(i, quiet = false) {
  i = Number(i);
  const p = S.plots[i];
  const n = Math.floor(p.gold);
  if (!n) { toast('아직 걷을 골드가 없어요'); return; }
  p.gold -= n;
  earn(n);
  sfx('coin');
  mission('collect');
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
  toast(`⬆️ ${habName(p.el)} Lv.${p.lv}! 몬스터 ${habCap(i)}마리까지 · 골드 수입 +${habLvBonus(i)}%`);
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
      <p class="muted">심을 작물을 골라요. <b>🌾 모든 농장에</b>를 누르면 비어 있는 농장 전부에 같은 작물을 심어요.</p>
      <div class="build-list">${CROP_ORDER.map(ci => [CROPS[ci], ci]).map(([c, ci]) => {
        const n = plantTargets().length;
        return `<div class="crop-row">
        <button class="build-opt" data-act="plant" data-i="${i}" data-c="${ci}" style="--hc:#4cd964">
          <span class="bo-ico">${c.emoji}</span>
          <span class="bo-nm">${c.name}<br><small>🍖 ${fmt(c.food)} · ${c.time >= 3600 ? `${c.time / 3600}시간` : mmss(c.time)} · 분당 🍖${fmt(c.food / c.time * 60)}</small></span>
          <span class="bo-cost">💰 ${fmt(c.cost)}</span>
        </button>
        ${n > 1 ? `<button class="btn small plant-all" data-act="plantAll" data-i="${i}" data-c="${ci}">🌾 모든 농장에<br><small>${n}곳 · 💰${fmt(c.cost * n)}</small></button>` : ''}
      </div>`;
      }).join('')}</div>
      ${farmAllHTML(i)}
      <div class="row">
        <button class="btn ghost small danger" data-act="demolish" data-i="${i}">🗑️ 철거 (+💰 ${fmt(demolishRefund(p))})</button>
        <button class="btn ghost small" data-act="close">닫기</button>
      </div>`);
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
    ${farmAllHTML(i)}
    <div class="row">
      <button class="btn ghost small danger" data-act="demolish" data-i="${i}">🗑️ 철거 (+💰 ${fmt(demolishRefund(p))})</button>
      <button class="btn ghost small" data-act="close">닫기</button>
    </div>`);
}

function plant(i, ci) {
  i = Number(i); ci = Number(ci);
  const p = S.plots[i];
  if (p.crop != null) return;
  if (!spend(CROPS[ci].cost)) return;
  p.crop = ci;
  p.lastCrop = ci;
  S.lastCrop = ci;
  p.end = Date.now() + CROPS[ci].time * 1000;
  save();
  openFarm(i);
  render();
}

// ----- 모든 농장 한 번에 -----
const farmIdx = () => S.plots.map((p, i) => (p && p.kind === 'farm' ? i : -1)).filter(i => i >= 0);
const farmReady = (p) => p.crop != null && Date.now() >= p.end;
const replantCrop = (p) => p.lastCrop ?? S.lastCrop ?? 0;

function farmAllHTML(i) {
  const all = farmIdx();
  if (all.length < 1) return '';
  const ready = all.filter(k => farmReady(S.plots[k])).length;
  const growing = all.filter(k => S.plots[k].crop != null && !farmReady(S.plots[k])).length;
  const toPlant = all.filter(k => S.plots[k].crop == null || farmReady(S.plots[k]));
  const cost = toPlant.reduce((s, k) => s + CROPS[replantCrop(S.plots[k])].cost, 0);
  return `<div class="farm-all">
    <h4>🌾 모든 농장 <small class="muted">${all.length}개 · 수확 가능 ${ready} · 자라는 중 ${growing}</small></h4>
    <div class="row">
      <button class="btn green" data-act="harvestAll" data-i="${i}" ${ready ? '' : 'disabled'}>🧺 모두 수확</button>
      <button class="btn" data-act="replantAll" data-i="${i}" ${toPlant.length ? '' : 'disabled'}>🔁 모두 다시 재배${toPlant.length ? ` (💰 ${fmt(cost)})` : ''}</button>
    </div>
    <p class="muted small-note">다시 재배는 다 자란 작물을 수확하고, 빈 농장 전부에 지난번 작물을 다시 심어요.</p>
  </div>`;
}

function harvestReady() {
  let food = 0, n = 0;
  farmIdx().forEach(k => {
    const p = S.plots[k];
    if (!farmReady(p)) return;
    const got = CROPS[p.crop].food;
    food += got;
    n++;
    p.lastCrop = p.crop;
    p.crop = null;
    floatAt(k, `+🍖${fmt(got)}`);
  });
  S.food += food;
  return { food, n };
}

function harvestAll(i) {
  const { food, n } = harvestReady();
  if (!n) { toast('아직 다 자란 작물이 없어요 🌱'); return; }
  toast(`🧺 농장 ${n}개 수확! 🍖 먹이 ${fmt(food)}개`);
  save();
  refreshFarm(i);
}

// 골라 둔 작물을 모든 농장에: 다 자란 건 먼저 수확하고, 빈 농장 전부에 같은 작물을 심는다
const plantTargets = () => farmIdx().filter(k => S.plots[k].crop == null || farmReady(S.plots[k]));

function plantAll(i, ci) {
  ci = Number(ci);
  const c = CROPS[ci];
  const { food, n } = harvestReady();
  let planted = 0, broke = false;
  farmIdx().forEach(k => {
    const p = S.plots[k];
    if (p.crop != null || broke) return;
    if (!spend(c.cost)) { broke = true; return; }
    p.crop = ci;
    p.lastCrop = ci;
    p.end = Date.now() + c.time * 1000;
    planted++;
  });
  S.lastCrop = ci;
  const parts = [];
  if (n) parts.push(`🧺 ${n}곳 수확 (🍖${fmt(food)})`);
  if (planted) parts.push(`${c.emoji} ${c.name} ${planted}곳에 심었어요!`);
  if (broke) parts.push('💰 골드가 모자라서 일부만 심었어요');
  toast(parts.join(' · ') || '심을 빈 농장이 없어요');
  save();
  refreshFarm(i);
}

function replantAll(i) {
  const { food, n } = harvestReady();
  let planted = 0, broke = false;
  farmIdx().forEach(k => {
    const p = S.plots[k];
    if (p.crop != null || broke) return;
    const ci = replantCrop(p);
    if (!spend(CROPS[ci].cost)) { broke = true; return; }
    p.crop = ci;
    p.lastCrop = ci;
    p.end = Date.now() + CROPS[ci].time * 1000;
    planted++;
  });
  const parts = [];
  if (n) parts.push(`🧺 ${n}개 수확 (🍖${fmt(food)})`);
  if (planted) parts.push(`🔁 ${planted}개 다시 심음`);
  if (broke) parts.push('💰 골드가 모자라서 일부만 심었어요');
  toast(parts.join(' · ') || '다시 심을 빈 농장이 없어요');
  save();
  refreshFarm(i);
}

function refreshFarm(i) {
  i = Number(i);
  if (S.plots[i] && S.plots[i].kind === 'farm') openFarm(i); else closeModal();
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
  sfx('coin');
  mission('harvest');
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
  if (total >= RAR.holy.time) return '✨ 신성한 빛이 새어 나와요!!!!';
  if (total >= RAR.mythic.time) return '🌌 전설을 넘어선 무언가가 태어나려 해요!!!';
  if (total >= RAR.legendary.time) return '🌟 이렇게 긴 시간이라니… 전설 예감!!';
  if (total >= RAR.epic.time) return '⚡ 강한 기운이 느껴져요! 서사급이에요!';
  if (total >= RAR.hero.time) return '🦸 영웅의 기운이 느껴져요!';
  if (total >= RAR.rare.time) return '오, 조금 특별한 기운이…';
  return '평범한 알 같아요';
}

let curMtn = 0;   // 지금 열어 둔 교배산 칸
const mountains = () => S.plots.map((p, i) => (p && p.kind === 'mountain' ? i : -1)).filter(i => i >= 0);
const MOUNTAIN_COST = 3000;
const HATCHERY_COST = 2000;
const hatcheries = () => S.plots.map((p, i) => (p && p.kind === 'hatchery' ? i : -1)).filter(i => i >= 0);
// 부화장 하나에 3칸, 교배산이 하나 늘 때마다 2칸 더
const mtnPower = () => mountains().reduce((s, k) => s + (S.plots[k].lv || 1), 0);   // 합친 교배산도 원래 개수만큼 센다
// 교배산 칸: 레벨만큼 동시에 교배할 수 있다 (2개 합치면 2쌍, 3개 합치면 3쌍)
const mtnSlots = (p) => { if (!Array.isArray(p.breeds)) p.breeds = [p.breed || null]; while (p.breeds.length < (p.lv || 1)) p.breeds.push(null); return p.breeds; };
const mtnBusy = (p) => mtnSlots(p).filter(Boolean);
const mtnFreeSlot = (p) => mtnSlots(p).findIndex(b => !b);
let curSlot = 0;
const hatchCap = () => Math.max(HATCH_CAP, hatcheries().reduce((s, k) => s + (S.plots[k].cap || HATCH_CAP), 0)) + 2 * Math.max(0, mtnPower() - 1);

function mountainFooter(i) {
  const n = mountains().length;
  const canDemolish = n > 1 && !mtnBusy(S.plots[i]).length;
  return `<div class="row">
    ${n > 1 ? `<span class="muted small-note">교배산 ${mountains().indexOf(i) + 1}/${n} ${islandLabel(i)}</span>` : ''}
    ${(S.plots[i].lv || 1) > 1 ? `<span class="muted small-note">⭐ 큰 교배산 Lv.${S.plots[i].lv} · 동시에 ${mtnSlots(S.plots[i]).length}쌍 교배</span>` : ''}
    ${(S.plots[i].lv || 1) > 1 ? `<button class="btn ghost small" data-act="splitMtn" data-i="${i}">🔓 합치기 취소 (${S.plots[i].lv}개로 나누기)</button>` : ''}
    ${canDemolish ? `<button class="btn ghost small danger" data-act="demolish" data-i="${i}">🗑️ 철거 (+💰 ${fmt(MOUNTAIN_COST / 2)})</button>` : ''}
    <button class="btn ghost small" data-act="close">닫기</button>
  </div>`;
}

// 칸 버튼 줄 (칸이 2개 이상일 때)
function slotBarHTML(i) {
  const slots = mtnSlots(S.plots[i]);
  if (slots.length < 2) return '';
  const now = Date.now();
  return `<div class="slot-bar">${slots.map((b, s) => {
    const st = !b ? '비어 있음' : now >= b.end ? '🥚 완료!' : `⏳ <span data-live="breed:${i}|${s}"></span>`;
    return `<button class="slot-btn ${s === curSlot ? 'on' : ''} ${b ? (now >= b.end ? 'done' : 'busy') : 'free'}" data-act="mtnSlot" data-s="${s}">칸 ${s + 1}<small>${st}</small></button>`;
  }).join('')}</div>`;
}
function openBreed(i = curMtn, slot) {
  i = Number(i);
  if (!S.plots[i] || S.plots[i].kind !== 'mountain') i = mountains()[0];
  if (i !== curMtn && slot == null) slot = Math.max(0, mtnFreeSlot(S.plots[i]));
  curMtn = i;
  const p = S.plots[i];
  const slots = mtnSlots(p);
  if (slot != null) curSlot = Number(slot);
  if (curSlot >= slots.length) curSlot = 0;
  const big = slots.length > 1 ? ` <small class="muted">큰 교배산 Lv.${p.lv} · 동시에 ${slots.length}쌍</small>` : '';
  const b = slots[curSlot];
  if (b) {
    const done = Date.now() >= b.end;
    const key = `${i}|${curSlot}`;
    showModal(`
      <h3>🏔️ 교배산${big}</h3>
      ${slotBarHTML(i)}
      <div class="egg ${done ? 'ready' : eggLv(b.type)}">🥚</div>
      <div class="timer" data-live="breed:${key}"></div>
      <div class="hint">${breedHint(b.base || b.total)}</div>
      <div class="parents">${b.parents.join(' + ')}</div>
      <div class="bar"><div data-bar="breed:${key}"></div></div>
      <div class="row">
        <button class="btn green" data-act="takeEgg" data-i="${i}" data-s="${curSlot}">🥚 알 가져가기</button>
        <button class="btn ghost" data-act="breedGem" data-i="${i}" data-s="${curSlot}">💎 <span data-live="breedGem:${key}"></span> 즉시 완성</button>
      </div>
      ${done ? '' : `<div class="row"><button class="btn ghost small danger" data-act="breedCancel" data-i="${i}" data-s="${curSlot}">❌ 교배 취소${b.cost ? ` (+💰 ${fmt(b.cost)} 돌려받기)` : ''}</button></div>`}
      ${mountainFooter(i)}`);
    return;
  }
  sel = sel.filter(u => byUid(u));
  const [ma, mb] = sel.map(byUid);
  const slotCard = (m) => m ? card(m, '', 'mini') : '?';
  showModal(`
    <h3>🏔️ 교배산${big}</h3>
    ${slotBarHTML(i)}
    <p class="muted">${slots.length > 1 ? `<b>칸 ${curSlot + 1}</b>에서 교배해요. ` : ''}Lv.${BREED_LV} 이상 몬스터 두 마리를 골라 섞어요. 타이머가 길게 뜰수록 높은 등급!</p>
    <div class="slots">
      <div class="slot">${slotCard(ma)}</div><div class="plus">+</div><div class="slot">${slotCard(mb)}</div>
    </div>
    <div class="row">
      <button class="btn big" data-act="breed" data-i="${i}" ${ma && mb ? '' : 'disabled'}>⛰️ 교배 시작${ma && mb ? ` (💰 ${fmt(breedCost(ma, mb))})` : ''}</button>
    </div>
    ${breedPickHTML()}
    ${breedLogHTML(i)}
    ${mountainFooter(i)}`);
}

// ----- 교배할 몬스터 고르기: 등급/속성별로 나눠 보기 -----
const breedView = () => (S.breedView = { group: 'rar', el: 'all', ready: false, ...(S.breedView || {}) });
function breedPickHTML() {
  const v = breedView();
  const chip = (key, val, label) =>
    `<button class="chip ${String(v[key]) === String(val) ? 'on' : ''}" data-act="breedView" data-k="${key}" data-v="${val}">${label}</button>`;
  const owned = new Set(S.monsters.flatMap(m => CAT[m.type].els));
  const list = S.monsters
    .filter(m => v.el === 'all' || CAT[m.type].els.includes(v.el))
    .filter(m => !v.ready || m.lv >= BREED_LV)
    .sort((a, b) => (b.lv >= BREED_LV) - (a.lv >= BREED_LV) || rIdx(b.type) - rIdx(a.type) || b.lv - a.lv || a.uid - b.uid);
  const cardOf = (m) => {
    const ok = m.lv >= BREED_LV;
    const k = sel.indexOf(m.uid);
    return card(m, ok ? `data-act="pick" data-uid="${m.uid}"` : '', `${k >= 0 ? 'sel' : ''} ${ok ? '' : 'locked'}`,
      k >= 0 ? `<div class="check">${k + 1}</div>` : ok ? '' : `<div class="lock">Lv.${BREED_LV} 필요</div>`);
  };
  const groups = new Map();
  list.forEach(m => {
    const c = CAT[m.type];
    let key, label, order;
    if (v.group === 'rar') { key = c.rarity; label = `<span style="color:${RAR[c.rarity].color}">⭐ ${RAR[c.rarity].name}</span>`; order = -rIdx(m.type); }
    else if (v.group === 'el') { key = c.els.join('+'); label = `${elBadges(c.els)} ${c.els.map(e => EL[ELI[e]].name).join(' + ')}`; order = c.els.length * 100 + ELI[c.els[0]] * 10 + (ELI[c.els[1]] || 0); }
    else { key = 'all'; label = '📋 전체'; order = 0; }
    if (!groups.has(key)) groups.set(key, { label, order, items: [] });
    groups.get(key).items.push(m);
  });
  const body = list.length
    ? [...groups.values()].sort((a, b) => a.order - b.order).map(g => `
        <div class="bp-group">
          <div class="bp-head">${g.label} <span class="muted">${g.items.length}마리 · 교배 가능 ${g.items.filter(m => m.lv >= BREED_LV).length}</span></div>
          <div class="grid small">${g.items.map(cardOf).join('')}</div>
        </div>`).join('')
    : '<p class="muted">조건에 맞는 몬스터가 없어요.</p>';
  return `<div class="breed-pick">
    <div class="chips"><span class="chip-label">묶어 보기</span>${chip('group', 'rar', '⭐ 등급')}${chip('group', 'el', '🔥 속성')}${chip('group', 'none', '📋 전체')}${chip('ready', !v.ready, v.ready ? '✅ 교배 가능만' : '☐ 교배 가능만')}</div>
    <div class="chips"><span class="chip-label">속성</span>${chip('el', 'all', '전체')}${EL.filter(e => owned.has(e.id)).map(e => chip('el', e.id, e.emoji + e.name)).join('')}</div>
    ${body}
  </div>`;
}

// ----- 교배 기록 -----
const BREED_LOG_MAX = 30;
// 기록된 부모를 지금 가진 몬스터에서 찾기: 같은 몬스터(uid)가 있으면 그대로, 팔았으면 같은 종류로
function logParents(e) {
  const pickOne = (uid, type, not) => {
    const same = byUid(uid);
    if (same && same.uid !== not) return same;
    return sortMons(S.monsters.filter(m => m.type === type && m.uid !== not))[0] || null;
  };
  const a = pickOne(e.a, e.at, null);
  const b = a ? pickOne(e.b, e.bt, a.uid) : null;
  return a && b ? [a, b] : null;
}

function breedLogHTML(i) {
  const log = S.breedLog || [];
  if (!log.length) return '';
  const pending = new Set(S.plots.filter(p => p && p.kind === 'mountain').flatMap(p => mtnBusy(p).map(b => b.logId)));
  return `<div class="breed-log">
    <h4>📜 교배 기록 <small class="muted">최근 ${log.length}번 · 🔁 누르면 같은 조합으로 바로 교배해요</small></h4>
    ${log.map(e => {
      const pr = logParents(e);
      const ready = pr && pr[0].lv >= BREED_LV && pr[1].lv >= BREED_LV;
      const res = pending.has(e.id) ? '<span class="bl-res">🥚 ???</span>'
        : `<span class="bl-res" style="color:${RAR[CAT[e.rt].rarity].color}">${CAT[e.rt].face} ${CAT[e.rt].name}</span>`;
      return `<div class="bl-row">
        <span class="bl-par">${CAT[e.at].face}${CAT[e.at].name} + ${CAT[e.bt].face}${CAT[e.bt].name}</span>
        <span class="bl-arrow">→</span>${res}
        <button class="btn small" data-act="rebreed" data-i="${i}" data-id="${e.id}" ${ready ? '' : 'disabled'}
          title="${pr ? (ready ? '' : `Lv.${BREED_LV} 필요`) : '부모 몬스터가 없어요'}">🔁 ${pr ? (ready ? `💰${fmt(breedCost(pr[0], pr[1]))}` : `Lv.${BREED_LV} 필요`) : '부모 없음'}</button>
      </div>`;
    }).join('')}
  </div>`;
}

function rebreed(i, id) {
  const e = (S.breedLog || []).find(x => x.id === Number(id));
  if (!e) return;
  const pr = logParents(e);
  if (!pr) { toast('기록의 부모 몬스터가 없어요'); return; }
  sel = [pr[0].uid, pr[1].uid];
  const fs0 = mtnFreeSlot(S.plots[Number(i)]);
  if (fs0 < 0) { toast('비어 있는 칸이 없어요'); return; }
  curSlot = fs0;
  startBreed(i);
}

function pickBreed(uid) {
  uid = Number(uid);
  const k = sel.indexOf(uid);
  if (k >= 0) sel.splice(k, 1);
  else if (sel.length < 2) sel.push(uid);
  else sel[1] = uid;
  const box = $('#modalBox'), y = box.scrollTop;
  openBreed(curMtn);
  box.scrollTop = y;
}

function startBreed(i = curMtn) {
  i = Number(i);
  const p = S.plots[i];
  const [a, b] = sel.map(byUid);
  if (!p || p.kind !== 'mountain' || !a || !b || mtnSlots(p)[curSlot]) return;
  if (a.lv < BREED_LV || b.lv < BREED_LV) { toast(`두 마리 모두 Lv.${BREED_LV} 이상이어야 해요`); return; }
  const paid = breedCost(a, b);
  if (!spend(paid)) return;
  const type = breedResult(a.type, b.type);
  const base = RAR[CAT[type].rarity].time;
  const total = base;
  const logId = S.nextLog = (S.nextLog || 0) + 1;
  mtnSlots(p)[curSlot] = { type, total, base, end: Date.now() + total * 1000, parents: [CAT[a.type].name, CAT[b.type].name], logId, cost: S.infinite ? 0 : paid };
  // 다음에 창을 열면 비어 있는 다음 칸으로
  const nextFree = mtnFreeSlot(p);
  S.breedLog = [{ id: logId, a: a.uid, b: b.uid, at: a.type, bt: b.type, rt: type, t: Date.now() }, ...(S.breedLog || [])].slice(0, BREED_LOG_MAX);
  sel = [];
  sfx('breed');
  mission('breed');
  save();
  openBreed(i, nextFree >= 0 && mtnSlots(p).length > 1 ? nextFree : curSlot);
  if (nextFree >= 0 && mtnSlots(p).length > 1) toast(`⛰️ 칸 ${curSlot + 1}에서 교배를 시작했어요! 비어 있는 칸이 더 있어요`);
  refreshLive();
  updateHud();
}

// 교배 취소: 알은 사라지고 교배 비용을 돌려받는다
function breedCancel(i, sl) {
  const p = S.plots[Number(i)];
  const slots = p && p.kind === 'mountain' ? mtnSlots(p) : null;
  const br = slots ? slots[Number(sl)] : null;
  if (!br || Date.now() >= br.end) return;
  if (!confirm('교배를 취소할까요? 태어날 알은 사라지고 교배 비용은 돌려받아요.')) return;
  slots[Number(sl)] = null;
  if (br.cost) earn(br.cost);
  S.breedLog = (S.breedLog || []).filter(e => e.id !== br.logId);
  save();
  toast(`❌ 교배를 취소했어요${br.cost ? ` (💰 ${fmt(br.cost)} 돌려받음)` : ''}`);
  updateHud();
  render();
  openBreed(Number(i), Number(sl));
}

function breedGem(i = curMtn, sl = curSlot) {
  const p = S.plots[Number(i)];
  const br = p && p.kind === 'mountain' ? mtnSlots(p)[Number(sl)] : null;
  if (!br) return;
  const left = (br.end - Date.now()) / 1000;
  if (left <= 0) return;
  if (!spend(gemCost(left, 10), 'gems')) return;
  br.end = Date.now();
  save();
  openBreed(i, sl);
  updateHud();
}

function takeEgg(i = curMtn, sl = curSlot) {
  const p = S.plots[Number(i)];
  const slots = p && p.kind === 'mountain' ? mtnSlots(p) : null;
  const br = slots ? slots[Number(sl)] : null;
  if (!br) return;
  if (Date.now() < br.end) { toast('아직 알이 준비되지 않았어요 ⏳'); return; }
  if (S.hatch.length >= hatchCap()) { toast('부화장이 가득 찼어요! 먼저 부화시켜 주세요'); return; }
  S.hatch.push(br.type);
  slots[Number(sl)] = null;
  save();
  render();
  oldHatchReveal(S.hatch.length - 1);
}

// ----- 부화장 -----
// ----- 부화: 대기 중인 알(S.hatch) → 부화 칸(p.incs)에 넣으면 시간이 흐르고, 다 되면 깨워서 서식지로 -----
// 큰 부화장은 합친 개수(레벨)만큼 동시에 부화한다
const hatchTime = (t) => Math.max(3, Math.round(RAR[CAT[t].rarity].time / 2));
const hatchIncs = (p) => { if (!Array.isArray(p.incs)) p.incs = []; while (p.incs.length < (p.lv || 1)) p.incs.push(null); return p.incs; };
const allIncs = () => hatcheries().flatMap(k => hatchIncs(S.plots[k]).map((b, s) => ({ k, s, b })));
let curHatch = null, curInc = 0;

function incSlotBarHTML(i) {
  const incs = hatchIncs(S.plots[i]);
  if (incs.length < 2) return '';
  const now = Date.now();
  return `<div class="slot-bar">${incs.map((b, s) => {
    const st = !b ? '비어 있음' : now >= b.end ? '🐣 완료!' : `⏳ <span data-live="inc:${i}|${s}"></span>`;
    return `<button class="slot-btn ${s === curInc ? 'on' : ''} ${b ? (now >= b.end ? 'done' : 'busy') : 'free'}" data-act="incSlot" data-s="${s}">칸 ${s + 1}<small>${st}</small></button>`;
  }).join('')}</div>`;
}

function openHatchery(i = curHatch, slot) {
  if (i == null || !S.plots[i] || S.plots[i].kind !== 'hatchery') {
    // 다 된 알이 있는 부화장 → 빈 칸이 있는 부화장 → 첫 부화장
    const ready = allIncs().find(x => x.b && Date.now() >= x.b.end);
    const free = allIncs().find(x => !x.b);
    i = ready ? ready.k : free ? free.k : hatcheries()[0];
    if (slot == null) slot = ready ? ready.s : free ? free.s : 0;
  }
  if (i !== curHatch && slot == null) { const f = hatchIncs(S.plots[i]).findIndex(x => !x); slot = f >= 0 ? f : 0; }
  curHatch = i;
  const p = S.plots[i], incs = hatchIncs(p);
  if (slot != null) curInc = Number(slot);
  if (curInc >= incs.length) curInc = 0;
  const n = hatcheries().length;
  const now = Date.now();
  const b = incs[curInc];
  const key = `${i}|${curInc}`;
  // 부화 시간은 없다: 알을 누르면 바로 깨어난다.
  // (예전에 부화 칸에 넣어 둔 알이 있으면 "깨울 알"로 보여 준다)
  const leftover = allIncs().filter(x => x.b);
  const busy = incs.filter(Boolean).length;
  showModal(`
    <h3>🪺 부화장${(p.lv || 1) > 1 ? ` <small class="muted">큰 부화장 Lv.${p.lv}</small>` : ''}</h3>
    <p class="muted">알을 누르면 바로 깨어나요. 살 서식지를 골라 주세요!</p>
    ${leftover.length ? `<h4 class="sub">🐣 깨울 알</h4>
      <div class="egg-row">${leftover.map(x => `<button class="egg-slot" data-act="crack" data-i="${x.k}" data-s="${x.s}"><span class="egg small ready">🥚</span><span>🐣 깨우기</span></button>`).join('')}</div>` : ''}
    <h4 class="sub">🥚 알 <small class="muted">${S.hatch.length}/${hatchCap()}</small></h4>
    <div class="egg-row">${S.hatch.length
      ? S.hatch.map((t, k) => `<button class="egg-slot" data-act="incubate" data-idx="${k}"><span class="egg small ${eggLv(t)}">🥚</span><span>🐣 부화!</span></button>`).join('')
      : '<p class="muted">알이 없어요. 교배산이나 상점에서 알을 가져오세요!</p>'}</div>
    ${S.hatch.length + leftover.length > 1 ? '<div class="all-box"><button class="btn green" data-act="hatchAll">🐣 모두 부화 (알맞은 서식지로 자동 이사)</button></div>' : ''}
    <p class="muted small-note">부화장 ${n}개가 알을 같이 보관해요 (${hatcheries().map(k => (S.plots[k].cap || HATCH_CAP) + '칸').join(' + ')}${mtnPower() > 1 ? ` + 교배산 추가분 ${2 * (mtnPower() - 1)}칸` : ''})</p>
    <div class="row">
      ${(p.lv || 1) > 1 ? `<button class="btn ghost small" data-act="splitHatch" data-i="${i}">🔓 합치기 취소 (${p.lv}개로 나누기)</button>` : ''}
      ${n > 1 && !busy ? `<button class="btn ghost small danger" data-act="demolish" data-i="${i}">🗑️ 이 부화장 철거 (+💰 ${fmt(demolishRefund(p))})</button>` : ''}
      <button class="btn ghost small" data-act="close">닫기</button>
    </div>`);
}

function startInc(k, s, type) {
  const total = hatchTime(type);
  hatchIncs(S.plots[k])[s] = { type, total, end: Date.now() + total * 1000 };
}
function incubate(idx, i = curHatch) {
  idx = Number(idx);
  if (i == null || !S.plots[i]) i = hatcheries()[0];
  const incs = hatchIncs(S.plots[i]);
  let s = incs[curInc] ? incs.findIndex(x => !x) : curInc;
  if (s < 0) {
    // 이 부화장이 꽉 찼으면 빈 칸이 있는 다른 부화장으로
    const other = allIncs().find(x => !x.b);
    if (!other) { toast('모든 부화 칸이 쓰이고 있어요. 다 된 알을 먼저 꺼내 주세요'); return; }
    i = other.k; s = other.s;
  }
  const type = S.hatch[idx];
  if (!type) return;
  S.hatch.splice(idx, 1);
  startInc(i, s, type);
  save();
  render();
  const next = hatchIncs(S.plots[i]).findIndex(x => !x);
  openHatchery(i, next >= 0 && S.hatch.length ? next : s);
}
function incubateAll() {
  let n = 0;
  allIncs().forEach(({ k, s, b }) => { if (!b && S.hatch.length) { startInc(k, s, S.hatch.shift()); n++; } });
  toast(n ? `🔥 알 ${n}개 부화를 시작했어요!` : '부화를 시작할 빈 칸이나 알이 없어요');
  save();
  render();
  openHatchery(curHatch);
}
function incGem(i, sl) {
  const b = hatchIncs(S.plots[Number(i)])[Number(sl)];
  if (!b) return;
  const left = (b.end - Date.now()) / 1000;
  if (left <= 0) return;
  if (!spend(gemCost(left, 10), 'gems')) return;
  b.end = Date.now();
  save();
  updateHud();
  openHatchery(Number(i), Number(sl));
}
// 부화 취소: 알을 대기 중인 알로 되돌린다
function incCancel(i, sl) {
  const incs = hatchIncs(S.plots[Number(i)]), b = incs[Number(sl)];
  if (!b) return;
  if (S.hatch.length >= hatchCap()) { toast('대기 칸이 가득 차서 되돌릴 수 없어요'); return; }
  incs[Number(sl)] = null;
  S.hatch.unshift(b.type);
  save();
  toast('❌ 부화를 취소했어요. 알은 대기 중인 알로 돌아갔어요');
  render();
  openHatchery(Number(i), Number(sl));
}

// 다 된 알 깨우기: 새 몬스터를 보여 주고 살 서식지를 고른다
function crack(i, sl) {
  i = Number(i); sl = Number(sl);
  const b = hatchIncs(S.plots[i])[sl];
  if (!b || Date.now() < b.end) return;
  const type = b.type;
  const isNew = !S.dex[type];
  S.dex[type] = true;
  sfx(isNew ? 'yay' : 'hatch');
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
        ? `<div class="build-list">${habs.map(({ p, i: h }) => `
            <button class="build-opt" data-act="placeInc" data-i="${i}" data-s="${sl}" data-h="${h}" style="--hc:${habColor(p.el)}">
              <span class="bo-ico">${habEmoji(p.el)}</span>
              <span class="bo-nm">${habName(p.el)} Lv.${p.lv} <small>${islandLabel(h)}</small></span>
              <span class="bo-cost">${habMons(h).length}/${habCap(h)}</span>
            </button>`).join('')}</div>`
        : `<p class="warn">살 수 있는 빈 서식지가 없어요!<br>필요한 곳: ${need}<br>서식지를 짓거나 업그레이드한 뒤 다시 깨워 주세요. (알은 칸에 그대로 있어요)</p>`}
      <div class="row">
        <button class="btn ghost small" data-act="sellInc" data-i="${i}" data-s="${sl}">팔기 (+💰 ${fmt(r.cost / 2)})</button>
        <button class="btn ghost small" data-act="openHatch">나중에</button>
      </div>
    </div>`);
}
function placeInc(i, sl, h) {
  i = Number(i); sl = Number(sl); h = Number(h);
  const incs = hatchIncs(S.plots[i]), b = incs[sl];
  if (!b || Date.now() < b.end || !habsFor(b.type).some(x => x.i === h)) return;
  incs[sl] = null;
  S.monsters.push({ uid: S.nextUid++, type: b.type, lv: 1, hab: h, runes: [null, null] });
  mission('hatch');
  toast(`${CAT[b.type].face} ${CAT[b.type].name}이(가) ${habName(S.plots[h].el)}으로 이사했어요!`);
  save();
  closeModal();
  render();
}
function sellInc(i, sl) {
  const incs = hatchIncs(S.plots[Number(i)]), b = incs[Number(sl)];
  if (!b) return;
  incs[Number(sl)] = null;
  earn(RAR[CAT[b.type].rarity].cost / 2);
  save();
  closeModal();
  render();
}
// 다 된 알을 모두 깨워서 빈자리가 있는 알맞은 서식지로 자동 이사
function crackAll() {
  const born = [], stuck = [];
  const now = Date.now();
  allIncs().forEach(({ k, s, b }) => {
    if (!b || now < b.end) return;
    const isNew = !S.dex[b.type];
    S.dex[b.type] = true;
    const h = habsFor(b.type)[0];
    if (h) {
      hatchIncs(S.plots[k])[s] = null;
      S.monsters.push({ uid: S.nextUid++, type: b.type, lv: 1, hab: h.i, runes: [null, null] });
      mission('hatch');
      born.push({ type: b.type, isNew });
    } else stuck.push(b.type);
  });
  save();
  render();
  showModal(`
    <h3>🐣 다 된 알 꺼내기</h3>
    ${born.length ? `<div class="grid small">${born.map(x => card({ type: x.type, lv: 1 }, '', 'mini', x.isNew ? '<div class="found-mark">🆕</div>' : '')).join('')}</div>
      <p class="muted">${born.length}마리가 서식지로 이사했어요.</p>` : ''}
    ${stuck.length ? `<p class="warn">${stuck.map(t => `${CAT[t].face} ${CAT[t].name}`).join(', ')}<br>살 수 있는 빈 서식지가 없어서 부화 칸에 남아 있어요.</p>` : ''}
    <div class="row"><button class="btn" data-act="openHatch">부화장으로</button><button class="btn ghost" data-act="close">닫기</button></div>`);
}

// ----- 합치기 취소: 큰 건물을 원래 개수로 다시 나눈다 -----
// 같은 섬에서 이 건물과 가까운 빈 땅 n칸
function freePlotsNear(i, n) {
  const k = islandOf(i), n0 = i % ISLAND_PLOTS;
  const d = (j) => { const m = j % ISLAND_PLOTS; return Math.abs(m % GRID - n0 % GRID) + Math.abs(Math.floor(m / GRID) - Math.floor(n0 / GRID)); };
  return islandRange(k).filter(j => !S.plots[j]).sort((a, b) => d(a) - d(b) || a - b).slice(0, n);
}
function splitMountain(i) {
  i = Number(i);
  const p = S.plots[i];
  const N = p && p.kind === 'mountain' ? (p.lv || 1) : 1;
  if (N < 2) return;
  const spots = freePlotsNear(i, N - 1);
  if (spots.length < N - 1) { toast(`나누려면 이 섬에 빈 땅이 ${N - 1}칸 필요해요`); return; }
  if (!confirm(`큰 교배산 Lv.${N}을 교배산 ${N}개로 나눌까요? 교배 중인 알은 칸마다 그대로 옮겨 가요.`)) return;
  const slots = mtnSlots(p).slice();
  p.lv = 1;
  p.breeds = [slots[0] || null];
  spots.forEach((j, k) => { S.plots[j] = { kind: 'mountain', lv: 1, breeds: [slots[k + 1] || null] }; });
  curSlot = 0;
  save();
  closeModal();
  render();
  toast(`🔓 교배산 ${N}개로 나눴어요`);
}
function splitHatchery(i) {
  i = Number(i);
  const p = S.plots[i];
  const N = p && p.kind === 'hatchery' ? (p.lv || 1) : 1;
  if (N < 2) return;
  const spots = freePlotsNear(i, N - 1);
  if (spots.length < N - 1) { toast(`나누려면 이 섬에 빈 땅이 ${N - 1}칸 필요해요`); return; }
  // 합칠 때 받은 보너스 칸(합친 횟수만큼)을 빼고 똑같이 나눈다
  const base = Math.max(N * HATCH_CAP, (p.cap || HATCH_CAP) - (N - 1));
  const each = Math.floor(base / N), extra = base - each * N;
  if (S.hatch.length > hatchCap() - ((p.cap || HATCH_CAP) - base)) { toast('대기 중인 알이 너무 많아서 나눌 수 없어요. 먼저 부화시켜 주세요'); return; }
  if (!confirm(`큰 부화장(Lv.${N})을 부화장 ${N}개로 나눌까요? 보관 중인 알은 그대로 있어요.`)) return;
  const incs = hatchIncs(p).slice();
  p.lv = 1;
  p.cap = each + extra;
  p.incs = [incs[0] || null];
  spots.forEach((j, k) => { S.plots[j] = { kind: 'hatchery', lv: 1, cap: each, incs: [incs[k + 1] || null] }; });
  curInc = 0;
  save();
  closeModal();
  render();
  toast(`🔓 부화장 ${N}개로 나눴어요`);
}

// 교배산 두 개를 합쳐 큰 교배산으로: 레벨이 합쳐지고 교배 시간이 빨라진다
function mergeMountain(i, k) {
  const a = S.plots[i], b = S.plots[k];
  if (!a || !b || a.kind !== 'mountain' || b.kind !== 'mountain' || i === k) return;
  // 칸을 이어 붙인다: 자라던 알도 그대로 옮겨 간다
  const merged = mtnSlots(a).concat(mtnSlots(b));
  a.lv = (a.lv || 1) + (b.lv || 1);
  a.breeds = merged;
  S.plots[k] = null;
  save();
  toast(`🔗 큰 교배산 Lv.${a.lv} 완성! 이제 동시에 ${a.lv}쌍을 교배할 수 있어요`);
}

// 부화장 두 개를 합쳐 큰 부화장 하나로: 칸은 모두 합치고 보너스 1칸, 땅 한 칸이 비워진다
function openMergePick(i) {
  i = Number(i);
  const others = hatcheries().filter(k => k !== i);
  showModal(`<h3>🔗 부화장 합치기</h3>
    <p class="muted">이 부화장(${S.plots[i].cap || HATCH_CAP}칸)에 합칠 부화장을 골라요. 합친 부화장은 사라지고 그 자리는 빈 땅이 돼요.</p>
    <div class="build-list">${others.map(k => `
      <button class="build-opt" data-act="mergeHatch" data-i="${i}" data-k="${k}" style="--hc:#c9953a">
        <span class="bo-ico">🪺</span>
        <span class="bo-nm">${(S.plots[k].cap || HATCH_CAP) > HATCH_CAP ? '큰 ' : ''}부화장 ${S.plots[k].cap || HATCH_CAP}칸 <small>${islandLabel(k)}</small></span>
        <span class="bo-cost">→ ${(S.plots[i].cap || HATCH_CAP) + (S.plots[k].cap || HATCH_CAP) + 1}칸</span>
      </button>`).join('')}</div>
    <div class="row"><button class="btn ghost small" data-act="openHatch">← 뒤로</button></div>`);
}
function mergeHatch(i, k) {
  i = Number(i); k = Number(k);
  const a = S.plots[i], b = S.plots[k];
  if (!a || !b || a.kind !== 'hatchery' || b.kind !== 'hatchery' || i === k) return;
  a.cap = (a.cap || HATCH_CAP) + (b.cap || HATCH_CAP) + 1;
  const incs = hatchIncs(a).concat(hatchIncs(b));   // 부화 중이던 알도 그대로
  a.lv = (a.lv || 1) + (b.lv || 1);
  a.incs = incs;
  S.plots[k] = null;
  save();
  toast(`🔗 큰 부화장 완성! 알 ${a.cap}칸을 보관해요 (보너스 +1칸)`);
  render();
  openHatchery(i);
}

// 모든 알을 부화시켜 빈자리가 있는 알맞은 서식지로 자동 이사
function hatchAll() {
  // 예전 부화 칸에 남은 알은 대기 알로 되돌린 뒤 한꺼번에 부화
  allIncs().forEach(({ k, s, b }) => { if (b) { S.hatch.push(b.type); hatchIncs(S.plots[k])[s] = null; } });
  return oldHatchAll();
}
function oldHatchAll() {
  const born = [], stuck = [];
  const eggs = S.hatch.slice();
  S.hatch = [];
  eggs.forEach(type => {
    const isNew = !S.dex[type];
    S.dex[type] = true;
    const h = habsFor(type)[0];
    if (h) {
      S.monsters.push({ uid: S.nextUid++, type, lv: 1, hab: h.i, runes: [null, null] });
      mission('hatch');
      born.push({ type, isNew, where: habName(S.plots[h.i].el) });
    } else {
      S.hatch.push(type);
      stuck.push(type);
    }
  });
  save();
  render();
  showModal(`
    <h3>🐣 모두 부화!</h3>
    ${born.length ? `<div class="grid small">${born.map(b => card({ type: b.type, lv: 1 }, '', 'mini',
      b.isNew ? '<div class="found-mark">🆕</div>' : '')).join('')}</div>
      <p class="muted">${born.length}마리가 서식지로 이사했어요.</p>` : ''}
    ${stuck.length ? `<p class="warn">${stuck.map(t => `${CAT[t].face} ${CAT[t].name}`).join(', ')}<br>살 수 있는 빈 서식지가 없어서 부화장에 남아 있어요.</p>` : ''}
    <div class="row"><button class="btn" data-act="close">좋아!</button></div>`);
}

function hatchOne(idx) {
  return oldHatchReveal(idx);
}
function oldHatchReveal(idx) {
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
              <span class="bo-nm">${habName(p.el)} Lv.${p.lv} <small>${islandLabel(i)}</small></span>
              <span class="bo-cost">${habMons(i).length}/${habCap(i)}</span>
            </button>`).join('')}</div>`
        : `<p class="warn">살 수 있는 빈 서식지가 없어요! 필요한 곳: ${need}</p>${roomOptions(idx, type)}`}
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
  mission('hatch');
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
      <button class="btn ghost" data-act="openMove" data-uid="${m.uid}">🏠 이사</button>
      ${S.monsters.filter(x => x.type === m.type).length > 1 ? `<button class="btn ghost" data-act="sellDups" data-type="${m.type}">💸 이 종류 겹치는 것 팔기 (${S.monsters.filter(x => x.type === m.type).length}마리)</button>` : ''}
    </div>
    <div class="row"><button class="btn ghost small" data-act="${back ? 'back' : 'close'}">${back ? '← 뒤로' : '닫기'}</button></div>`);
  modalStack = back;
}

// 살 곳이 없을 때 고를 수 있는 것: 새 서식지 짓기 / 가득 찬 서식지 업그레이드 (둘 다 바로 이사)
function roomOptions(idx, type) {
  const els = isLegend(type) ? ['legend'] : CAT[type].els;
  const ups = S.plots.map((p, i) => ({ p, i })).filter(({ p }) => p && p.kind === 'hab' && els.includes(p.el) && p.lv < HAB_MAX_LV)
    .sort((a, b) => a.p.lv - b.p.lv).slice(0, 2);
  return `<div class="build-list">${els.map(el => `
    <button class="build-opt" data-act="buildPlace" data-idx="${idx}" data-el="${el}" style="--hc:${habColor(el)}">
      <span class="bo-ico">${habEmoji(el)}</span><span class="bo-nm">${habName(el)} 새로 짓고 바로 넣기</span><span class="bo-cost">💰 ${fmt(habBuildCost(el))}</span>
    </button>`).join('')}${ups.map(({ p, i }) => `
    <button class="build-opt" data-act="upPlace" data-idx="${idx}" data-i="${i}" style="--hc:${habColor(p.el)}">
      <span class="bo-ico">⬆️</span><span class="bo-nm">${habName(p.el)} Lv.${p.lv} → ${p.lv + 1} 올리고 넣기</span><span class="bo-cost">💰 ${fmt(habUpCost(p.lv))}</span>
    </button>`).join('')}</div>`;
}
function buildPlace(idx, el) {
  const i = findFreePlot();
  if (i < 0 || !spend(habBuildCost(el))) return;
  S.plots[i] = { kind: 'hab', el, lv: 1, gold: 0 };
  place(idx, i);
}
function upPlace(idx, i) {
  i = Number(i);
  const p = S.plots[i];
  if (!p || p.lv >= HAB_MAX_LV || !spend(habUpCost(p.lv))) return;
  p.lv++;
  place(idx, i);
}

function feed(uid) {
  const m = byUid(uid);
  if (!m || m.lv >= MAX_LV) return;
  const cost = feedCost(m);
  if (S.food < cost) { toast('🍖 먹이가 부족해요. 농장에서 키워 보세요!'); return; }
  S.food -= cost;
  m.lv++;
  sfx('level');
  mission('feed');
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

// ----- 겹치는 몬스터 팔기: 종류마다 한 마리만 남긴다 -----
// 가장 좋은 한 마리(레벨 → 룬 → 먼저 얻은 순)는 남기고, 모험 팀에 있는 몬스터도 팔지 않는다
function dupPlan(onlyType) {
  const groups = {};
  S.monsters.forEach(m => { if (!onlyType || m.type === onlyType) (groups[m.type] = groups[m.type] || []).push(m); });
  const rows = [];
  let gold = 0;
  const sellList = [];
  Object.entries(groups).forEach(([type, list]) => {
    if (list.length < 2) return;
    const runes = (m) => m.runes.filter(x => x != null).length;
    const sorted = list.slice().sort((a, b) =>
      b.lv - a.lv || runes(b) - runes(a) || a.uid - b.uid);
    // 팀에 있는 몬스터는 여러 마리여도 팔지 않는다
    const keep = sorted.filter((m, k) => k === 0 || S.team.includes(m.uid));
    const sell = sorted.filter(m => !keep.includes(m));
    if (!sell.length) return;
    const g = sell.reduce((t, m) => t + sellPrice(m), 0);
    gold += g;
    sellList.push(...sell);
    rows.push({ type, total: list.length, keep: keep.length, sell: sell.length, gold: g, best: keep[0] });
  });
  rows.sort((a, b) => rIdx(b.type) - rIdx(a.type) || b.sell - a.sell);
  return { rows, gold, sellList };
}

function openSellDups(onlyType) {
  const plan = dupPlan(onlyType || null);
  if (!plan.sellList.length) { toast('겹치는 몬스터가 없어요'); return; }
  showModal(`<h3>💸 겹치는 몬스터 팔기</h3>
    <p class="muted">종류마다 <b>가장 레벨이 높은 한 마리</b>만 남기고 팔아요. 모험 팀에 있는 몬스터는 팔지 않아요.</p>
    <div class="dup-list">${plan.rows.map(r => {
      const c = CAT[r.type];
      return `<div class="dup-row">
        <span class="dup-face" style="background:${grad(c)}">${c.face}</span>
        <span class="dup-nm">${c.name} <small style="color:${RAR[c.rarity].color}">${RAR[c.rarity].name}</small><br>
          <small class="muted">${r.total}마리 → ${r.keep}마리 남김 (Lv.${r.best.lv})</small></span>
        <span class="dup-sell">-${r.sell}마리<br><b>+💰${fmt(r.gold)}</b></span>
      </div>`;
    }).join('')}</div>
    <p class="dup-total">모두 ${plan.sellList.length}마리 팔기 · <b>+💰${fmt(plan.gold)}</b></p>
    <div class="row">
      <button class="btn big" data-act="sellDupsOk" data-type="${onlyType || ''}">💸 팔기</button>
      <button class="btn ghost" data-act="close">취소</button>
    </div>`);
}

function sellDups(onlyType) {
  const plan = dupPlan(onlyType || null);
  if (!plan.sellList.length) { closeModal(); return; }
  const gone = new Set(plan.sellList.map(m => m.uid));
  plan.sellList.forEach(m => {
    m.runes.forEach(id => { const r = S.runes.find(x => x.id === id); if (r) r.on = null; });
    earn(sellPrice(m));
    delete walkers[m.uid];
  });
  S.monsters = S.monsters.filter(m => !gone.has(m.uid));
  S.team = S.team.filter(u => !gone.has(u));
  sel = sel.filter(u => !gone.has(u));
  save();
  closeModal();
  toast(`💸 겹치는 몬스터 ${gone.size}마리를 팔고 💰${fmt(plan.gold)}을 받았어요`);
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
    ${(() => {
      const once = S.monsters.filter(m => m.lv < MAX_LV).reduce((s, m) => s + feedCost(m), 0);
      let toBreed = 0;
      S.monsters.forEach(m => { for (let lv = m.lv; lv < BREED_LV; lv++) toBreed += lv * 20; });
      return `<div class="all-box row">
        <button class="btn small" data-act="feedAll" data-mode="once" ${once ? '' : 'disabled'}>🍖 모두 한 번씩 먹이 (🍖 ${fmt(once)})</button>
        <button class="btn small green" data-act="feedAll" data-mode="breed" ${toBreed ? '' : 'disabled'}>🧬 모두 Lv.${BREED_LV}까지 키우기${toBreed ? ` (🍖 ${fmt(toBreed)})` : ' (완료)'}</button>
      </div>`;
    })()}
    ${S.hatch.length ? `<div class="notice" data-act="openHatch">🪺 부화장에 알이 ${S.hatch.length}개 기다리고 있어요! →</div>` : ''}
    ${(() => {
      const plan = dupPlan();
      return plan.sellList.length
        ? `<div class="all-box row"><button class="btn small sell-dups" data-act="sellDups">💸 겹치는 몬스터 팔기 (${plan.sellList.length}마리 · +💰${fmt(plan.gold)})</button></div>`
        : '';
    })()}
    ${monSummaryHTML()}
    ${monControlsHTML()}
    ${monGroupsHTML()}`;
}

// ----- 내 몬스터 정리해서 보기 -----
const MON_VIEW_DEFAULT = { group: 'rar', sort: 'lv', el: 'all' };
const monView = () => (S.monView = { ...MON_VIEW_DEFAULT, ...(S.monView || {}) });

function monSummaryHTML() {
  const inc = S.monsters.reduce((s, m) => s + monIncome(m), 0);
  const byRar = RAR_ORDER.map(r => [r, S.monsters.filter(m => CAT[m.type].rarity === r).length]).filter(([, n]) => n);
  return `<div class="mon-summary">
    <div class="ms-big"><b>${S.monsters.length}</b><span>마리</span></div>
    <div class="ms-big"><b>💰${fmt(inc)}</b><span>초당 골드</span></div>
    <div class="ms-big"><b>${new Set(S.monsters.map(m => m.type)).size}</b><span>종류</span></div>
    <div class="ms-rar">${byRar.map(([r, n]) => `<span style="color:${RAR[r].color}">${RAR[r].name} ${n}</span>`).join('')}</div>
  </div>`;
}

function monControlsHTML() {
  const v = monView();
  const chip = (key, val, label) =>
    `<button class="chip ${v[key] === val ? 'on' : ''}" data-act="monView" data-k="${key}" data-v="${val}">${label}</button>`;
  const owned = new Set(S.monsters.flatMap(m => CAT[m.type].els));
  return `
    <div class="chips"><span class="chip-label">묶어 보기</span>${chip('group', 'rar', '⭐ 등급')}${chip('group', 'el', '🔥 속성')}${chip('group', 'isl', '🏝️ 섬')}${chip('group', 'hab', '🏠 서식지')}${chip('group', 'none', '📋 전체')}</div>
    <div class="chips"><span class="chip-label">정렬</span>${chip('sort', 'lv', '⬆️ 레벨')}${chip('sort', 'rar', '⭐ 등급')}${chip('sort', 'name', '가나다')}${chip('sort', 'new', '🆕 최근')}</div>
    <div class="chips"><span class="chip-label">속성</span>${chip('el', 'all', '전체')}${EL.filter(e => owned.has(e.id)).map(e => chip('el', e.id, e.emoji + e.name)).join('')}</div>`;
}

function monSorter(sort) {
  const byRar = (a, b) => rIdx(b.type) - rIdx(a.type);
  const byLv = (a, b) => b.lv - a.lv;
  const byName = (a, b) => CAT[a.type].name.localeCompare(CAT[b.type].name, 'ko');
  if (sort === 'rar') return (a, b) => byRar(a, b) || byLv(a, b) || byName(a, b);
  if (sort === 'name') return (a, b) => byName(a, b) || byLv(a, b);
  if (sort === 'new') return (a, b) => b.uid - a.uid;
  return (a, b) => byLv(a, b) || byRar(a, b) || byName(a, b);
}

function monGroupsHTML() {
  const v = monView();
  const list = S.monsters.filter(m => v.el === 'all' || CAT[m.type].els.includes(v.el)).sort(monSorter(v.sort));
  if (!list.length) return '<p class="muted empty-note">아직 몬스터가 없어요. 상점에서 알을 사 보세요! 🥚</p>';
  const groups = new Map();
  const add = (key, label, order, m) => {
    if (!groups.has(key)) groups.set(key, { label, order, items: [] });
    groups.get(key).items.push(m);
  };
  list.forEach(m => {
    const c = CAT[m.type];
    if (v.group === 'rar') add(c.rarity, `<span style="color:${RAR[c.rarity].color}">⭐ ${RAR[c.rarity].name}</span>`, -rIdx(m.type), m);
    else if (v.group === 'el') {
      const key = c.els.join('+');
      add(key, `${elBadges(c.els)} ${c.els.map(e => EL[ELI[e]].name).join(' + ')}`, c.els.length * 100 + ELI[c.els[0]] * 10 + (ELI[c.els[1]] || 0), m);
    } else if (v.group === 'isl') {
      const k = islandOf(m.hab);
      add(k, `${ISLANDS[k].emoji} ${k + 1}. ${ISLANDS[k].name}`, k, m);
    } else if (v.group === 'hab') {
      const p = S.plots[m.hab];
      add(m.hab, `${habEmoji(p.el)} ${habName(p.el)} Lv.${p.lv} <small class="muted">${islandLabel(m.hab)} · ${habMons(m.hab).length}/${habCap(m.hab)}마리</small>`, m.hab, m);
    } else add('all', '📋 전체', 0, m);
  });
  return [...groups.values()].sort((a, b) => a.order - b.order).map(g => {
    const inc = g.items.reduce((s, m) => s + monIncome(m), 0);
    return `<div class="mon-group">
      <h3 class="mg-head">${g.label} <span class="mg-count">${g.items.length}마리 · 초당 💰${fmt(inc)}</span></h3>
      <div class="grid">${g.items.map(m => card(m, `data-act="openMon" data-uid="${m.uid}"`)).join('')}</div>
    </div>`;
  }).join('');
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
    <div class="sec-head"><h2>상점</h2><p>서식지와 알은 여기서! 룬·먹이·장식도 팔아요.</p></div>
    <h3 class="sub" id="shopHab">🏠 서식지 상점 <small class="muted">사면 섬의 빈 땅에 바로 지어져요</small></h3>
    <div class="grid small">${[...EL.map(e => e.id), 'legend'].map(el => {
      const n = S.plots.filter(p => p && p.kind === 'hab' && p.el === el).length;
      return `<div class="card mini hab-card" data-act="buyHab" data-el="${el}" style="--hc:${habColor(el)}">
        <div class="price-tag">💰 ${fmt(habBuildCost(el))}</div>
        <div class="face" style="background:linear-gradient(135deg, ${habColor(el)}, #1a1a3d)">${habEmoji(el)}</div>
        <div class="nm">${habName(el)}</div>
        <div class="meta">${n ? `보유 ${n}개` : BASE.includes(el) || el === 'legend' ? '&nbsp;' : '특수 속성'}</div>
      </div>`;
    }).join('')}
      <div class="card mini hab-card" data-act="buyHab" data-el="farm">
        <div class="price-tag">💰 ${fmt(FARM_COST)}</div>
        <div class="face" style="background:linear-gradient(135deg, #8c5a2c, #1a1a3d)">🌾</div>
        <div class="nm">농장</div>
        <div class="meta">먹이 생산</div>
      </div>
      <div class="card mini hab-card" data-act="buyHab" data-el="hatchery">
        <div class="price-tag">💰 ${fmt(HATCHERY_COST)}</div>
        <div class="face" style="background:linear-gradient(135deg, #c9953a, #1a1a3d)">🪺</div>
        <div class="nm">부화장</div>
        <div class="meta">보유 ${hatcheries().length}개 · 알 ${hatchCap()}칸</div>
      </div>
      <div class="card mini hab-card" data-act="buyHab" data-el="mountain">
        <div class="price-tag">💰 ${fmt(MOUNTAIN_COST)}</div>
        <div class="face" style="background:linear-gradient(135deg, #6a5acd, #1a1a3d)">🏔️</div>
        <div class="nm">교배산</div>
        <div class="meta">보유 ${mountains().length}개</div>
      </div>
    </div>
    <h3 class="sub" id="shopEgg">🥚 몬스터 알 상점 <small class="muted">사면 부화장으로 가요. 알맞은 서식지가 있어야 키울 수 있어요</small></h3>
    <div class="grid small">${EGG_SHOP.map(t => card({ type: t, lv: 1 }, `data-act="buyMon" data-type="${t}"`, 'mini',
      `<div class="price-tag">💰 ${fmt(eggPrice(t))}</div>`)).join('')}</div>
    <h3 class="sub">🛍️ 룬 · 먹이 · 골드</h3>
    <div class="shop">
      <button class="shop-item" data-act="buyRune" data-kind="gold"><span class="si-ico">📦</span><span class="si-nm">룬 상자<small>★ 70% · ★★ 25% · ★★★ 5%</small></span><span class="si-cost">💰 1,000</span></button>
      <button class="shop-item" data-act="buyRune" data-kind="gem"><span class="si-ico">🎁</span><span class="si-nm">고급 룬 상자<small>★★ 60% · ★★★ 40%</small></span><span class="si-cost">💎 20</span></button>
      <button class="shop-item" data-act="buyFood" data-n="100"><span class="si-ico">🍖</span><span class="si-nm">먹이 100개</span><span class="si-cost">💰 150</span></button>
      <button class="shop-item" data-act="buyFood" data-n="1000"><span class="si-ico">🍖</span><span class="si-nm">먹이 1,000개</span><span class="si-cost">💰 1,500</span></button>
      <button class="shop-item" data-act="buyGold" data-n="5"><span class="si-ico">💰</span><span class="si-nm">골드 500</span><span class="si-cost">💎 5</span></button>
      <button class="shop-item" data-act="buyGold" data-n="50"><span class="si-ico">💰</span><span class="si-nm">골드 6,000</span><span class="si-cost">💎 50</span></button>
    </div>
    <h3 class="sub" id="shopDeco">🎨 섬 꾸미기 <small class="muted">장식을 놓으면 그 섬 서식지 골드가 올라요 (섬마다 최대 +${DECO_CAP}%) · 지금 섬 +${decoPercent(S.isl || 0)}%</small></h3>
    <div class="grid small">${DECOS.map(d => `<div class="card mini hab-card" data-act="buyDeco" data-id="${d.id}">
        <div class="price-tag">${decoPrice(d)}</div>
        <div class="face" style="background:linear-gradient(135deg, #ff9ad5, #1a1a3d)">${d.emoji}</div>
        <div class="nm">${d.name}</div>
        <div class="meta">골드 +${d.bonus}%</div>
      </div>`).join('')}</div>
    <h3 class="sub">👑 전설 상점<small class="muted">골드로 살 수 있어요… 모을 수만 있다면요</small></h3>
    <div class="legend-shop">${SHOP_LEGENDS.map(l => {
      const c = CAT[l.id];
      const owned = S.monsters.filter(m => m.type === l.id).length + S.hatch.filter(t => t === l.id).length;
      const can = S.infinite || S.gold >= l.price;
      return `<div class="legend-item">
        <div class="face" style="background:${grad(c)}">${c.face}</div>
        <div class="li-info">
          <div class="li-nm">${c.name}${owned ? ` <small class="muted">보유 ${owned}</small>` : ''}</div>
          <div class="li-els">${elNames(c.els)} · <span class="rar" style="color:${RAR[c.rarity].color}">${RAR[c.rarity].name}</span></div>
          <div class="li-price">💰 ${fmt(l.price)}</div>
          <div class="li-wait muted">${S.infinite ? '♾️ 돈 무한이라 바로 살 수 있어요!' : waitText(l.price)}</div>
        </div>
        <button class="btn" data-act="buyLegend" data-id="${l.id}" ${can ? '' : 'disabled'}>구매</button>
      </div>`;
    }).join('')}</div>
    <h3 class="sub">💠 내 룬 <small class="muted">같은 룬 3개를 합성하면 한 단계 위 룬이 돼요</small>
      <button class="btn small" data-act="mergeAll" ${list.some(g => g.free >= 3 && g.lv < 3) ? '' : 'disabled'}>✨ 모두 합성</button></h3>
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

// 서식지/농장을 사면 섬 가운데에 가까운 빈 땅부터 채운다
function findFreePlot() {
  const center = (GRID - 1) / 2;
  const cur = S.isl || 0;
  const dist = (i) => { const n = i % ISLAND_PLOTS; return Math.abs(n % GRID - center) + Math.abs(Math.floor(n / GRID) - center); };
  // 지금 보고 있는 섬 먼저, 가득 차면 다음 섬
  const free = S.plots.map((p, i) => i).filter(i => !S.plots[i])
    .sort((a, b) => (islandOf(a) !== cur) - (islandOf(b) !== cur) || islandOf(a) - islandOf(b) || dist(a) - dist(b) || a - b);
  if (!free.length) { toast('모든 섬에 빈 땅이 없어요!'); return -1; }
  if (islandOf(free[0]) !== cur) {
    const th = ISLANDS[islandOf(free[0])];
    setTimeout(() => toast('지금 섬이 가득 차서 ' + th.emoji + ' ' + th.name + '에 지었어요'), 50);
  }
  return free[0];
}
function buyHab(el) {
  const i = findFreePlot();
  if (i >= 0) build(i, ['farm', 'mountain', 'hatchery'].includes(el) ? el : `hab:${el}`);
}
function buyDeco(id) {
  const i = findFreePlot();
  if (i >= 0) build(i, 'deco:' + id);
}
function openDecoPick(i) {
  showModal(`<h3>🎨 섬 꾸미기</h3>
    <p class="muted">이 섬 서식지 골드 +${decoPercent(islandOf(i))}% (최대 +${DECO_CAP}%)</p>
    <div class="build-list">${DECOS.map(d => `
      <button class="build-opt" data-act="build" data-i="${i}" data-what="deco:${d.id}" style="--hc:#ff9ad5">
        <span class="bo-ico">${d.emoji}</span><span class="bo-nm">${d.name} <small>골드 +${d.bonus}%</small></span><span class="bo-cost">${decoPrice(d)}</span>
      </button>`).join('')}</div>
    <div class="row"><button class="btn ghost small" data-act="plot" data-i="${i}">← 뒤로</button></div>`);
}
function openDeco(i) {
  const p = S.plots[i], d = decoById(p.id) || { emoji: '❓', name: '장식', bonus: 0 };
  const k = islandOf(i);
  showModal(`<div class="egg-big">${d.emoji}</div>
    <h3>${d.name}</h3>
    <p class="muted">이 장식: 골드 +${d.bonus}% · ${ISLANDS[k].emoji} ${ISLANDS[k].name} 전체 <b class="deco-bonus">🎨 +${decoPercent(k)}%</b> (최대 +${DECO_CAP}%)</p>
    <div class="row">
      <button class="btn ghost small danger" data-act="demolish" data-i="${i}">🗑️ 치우기 (${d.gems ? `+💎 ${Math.floor(d.gems / 2)}` : `+💰 ${fmt(demolishRefund(p))}`})</button>
      <button class="btn ghost small" data-act="close">닫기</button>
    </div>`);
}

const MON_PRICE = 500;
// 기본 8속성 알 + 얼음/금속/마법 서식지 전용 알 (화염 살라맨더처럼 기본 한 마리씩, 모두 500)
const SPECIAL_EGGS = ['p:ice', 'p:metal', 'p:magic'];
const EGG_SHOP = [...BASE.map(e => 'p:' + e), ...SPECIAL_EGGS];
const eggPrice = () => MON_PRICE;
function buyMon(type) {
  if (!CAT[type] || !EGG_SHOP.includes(type)) return;
  if (S.hatch.length >= hatchCap()) { toast('부화장이 가득 찼어요! 먼저 부화시켜 주세요'); return; }
  if (!spend(eggPrice(type))) return;
  S.hatch.push(type);
  sfx('buy');
  mission('buyEgg');
  save();
  toast(`🥚 ${CAT[type].name} 알을 샀어요!`);
  render();
  openHatchery();
}

function buyLegend(id) {
  const l = SHOP_LEGENDS.find(x => x.id === id);
  if (!l) return;
  if (S.hatch.length >= hatchCap()) { toast('부화장이 가득 찼어요! 먼저 부화시켜 주세요'); return; }
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

// ----- 모두 한 번에 -----
function upAllHabs(i) {
  let n = 0, broke = false;
  S.plots.map((p, k) => ({ p, k }))
    .filter(({ p }) => p && p.kind === 'hab' && p.lv < HAB_MAX_LV)
    .sort((a, b) => a.p.lv - b.p.lv)
    .forEach(({ p }) => {
      if (broke) return;
      if (!spend(habUpCost(p.lv))) { broke = true; return; }
      p.lv++;
      n++;
    });
  toast(n ? `⬆️ 서식지 ${n}개 업그레이드!${broke ? ' (골드가 모자라서 일부만)' : ''}` : '업그레이드할 수 있는 서식지가 없어요');
  save();
  if (i != null && S.plots[Number(i)]) openHab(Number(i));
  render();
}

function feedAll(mode) {
  const list = S.monsters.slice().sort((a, b) => a.lv - b.lv);
  let ups = 0, food = 0, short = false;
  const step = (m) => {
    const c = feedCost(m);
    if (S.food < c) { short = true; return false; }
    S.food -= c; food += c; m.lv++; ups++;
    return true;
  };
  if (mode === 'breed') {
    list.forEach(m => { while (m.lv < BREED_LV && step(m)); });
  } else {
    list.forEach(m => { if (m.lv < MAX_LV) step(m); });
  }
  if (ups) { sfx('level'); mission('feed', ups); }
  toast(ups ? `🍖 먹이 ${fmt(food)}개로 레벨 ${ups}번 올렸어요!${short ? ' (먹이가 모자라서 일부만)' : ''}` : '🍖 먹이가 부족해요. 농장에서 키워 보세요!');
  save();
  render();
}

function mergeAll() {
  let n = 0;
  for (let lv = 1; lv < 3; lv++) {
    Object.keys(RUNE).forEach(t => {
      let free = S.runes.filter(r => r.t === t && r.lv === lv && r.on == null);
      while (free.length >= 3) {
        const ids = free.slice(0, 3).map(r => r.id);
        S.runes = S.runes.filter(r => !ids.includes(r.id));
        S.runes.push({ id: S.nextRune++, t, lv: lv + 1, on: null });
        n++;
        free = free.slice(3);
      }
    });
  }
  toast(n ? `✨ 룬 ${n}번 합성 성공!` : '합성할 수 있는 룬이 없어요');
  save();
  render();
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
  const tier = Math.min(RANK.mythic, Math.floor((stage - 1) / 2));
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
    <div class="stage-box pvp-box">
      <h3>👥 대전 · 친구</h3>
      <p class="muted"><b>🌍 랜덤 대전</b>으로 모르는 사람과 바로 싸우거나, 친구와 방 코드로 싸우고 선물·섬 구경도 해요.</p>
      <div class="friend-grid">
        <button class="btn big-rnd" data-act="pvpRandom">🌍 랜덤 대전<small>모르는 사람과 바로 매칭! 이기면 🏆 +${TROPHY_WIN}</small></button>
        <button class="btn guild-btn" data-act="guildOpen">🛡️ 길드<small>${S.guild ? `${esc(S.guild.emblem)} ${esc(S.guild.name)} · 골드 +${guildPct()}%` : '길드원과 함께 골드 보너스!'}</small></button>
        <button class="btn rank-btn" data-act="ranking">🏆 랭킹<small>${tierOf(S.trophies).icon} ${tierOf(S.trophies).name} · 🏆 ${fmt(S.trophies || 0)}</small></button>
        <button class="btn" data-act="pvp">⚔️ 친구 대전<small>이기면 💰${fmt(PVP_REWARD.gold)} + 💎${PVP_REWARD.gems}</small></button>
        <button class="btn" data-act="giftSend">🎁 선물 보내기<small>몬스터·골드·룬</small></button>
        <button class="btn green" data-act="giftRecv">📥 선물 받기${(S.giftBox || []).length ? `<small>📦 보관함 ${S.giftBox.length}</small>` : '<small>코드 붙여넣기</small>'}</button>
        <button class="btn" data-act="islandShare">🏝️ 내 섬 코드<small>친구에게 보여 주기</small></button>
        <button class="btn green" data-act="visitOpen">👀 친구 섬 구경<small>코드 붙여넣기</small></button>
      </div>
    </div>
    <h3 class="sub">👹 보스전 <small class="muted">위의 내 팀으로 싸워요. 보스를 이기면 다음 보스가 열려요</small></h3>
    ${renderBossList()}
    <details class="chart-box"><summary>📘 속성 상성표 보기 (무슨 속성이 무슨 속성에게 강할까?)</summary>${typeChartHTML()}</details>
    <h3 class="sub">몬스터를 눌러 팀에 넣거나 빼세요</h3>
    ${teamPickHTML(foeEls)}`;
}

// ----- 모험 팀 고르기: 등급/속성별로 나눠 보기 + 상대에게 강한 몬스터 표시 -----
const teamView = () => (S.teamView = { group: 'rar', el: 'all', sort: 'power', strong: false, ...(S.teamView || {}) });
function teamPickHTML(foeEls) {
  const v = teamView();
  const chip = (key, val, label) =>
    `<button class="chip ${String(v[key]) === String(val) ? 'on' : ''}" data-act="teamView" data-k="${key}" data-v="${val}">${label}</button>`;
  const owned = new Set(S.monsters.flatMap(m => CAT[m.type].els));
  // 이 몬스터의 속성 중 하나라도 상대 팀 속성에게 강하면 ▲
  const strongVs = (m) => CAT[m.type].els.some(e => BEATS[e].some(x => foeEls.includes(x)));
  const powerOf = (m) => { const st = stats(m); return Math.round(st.atk * 3 + st.hp / 4 + st.spd); };
  const sorter = v.sort === 'lv' ? (a, b) => b.lv - a.lv || rIdx(b.type) - rIdx(a.type)
    : v.sort === 'rar' ? (a, b) => rIdx(b.type) - rIdx(a.type) || b.lv - a.lv
    : (a, b) => powerOf(b) - powerOf(a);
  const list = S.monsters
    .filter(m => v.el === 'all' || CAT[m.type].els.includes(v.el))
    .filter(m => !v.strong || strongVs(m))
    .sort(sorter);
  const cardOf = (m) => {
    const i = S.team.indexOf(m.uid);
    const tag = `${i >= 0 ? `<div class="check">${i + 1}</div>` : ''}${strongVs(m) ? '<div class="strong-tag">▲ 강함</div>' : ''}<div class="power-tag">⚔️${fmt(powerOf(m))}</div>`;
    return card(m, `data-act="team" data-uid="${m.uid}"`, i >= 0 ? 'sel' : '', tag);
  };
  const groups = new Map();
  list.forEach(m => {
    const c = CAT[m.type];
    let key, label, order;
    if (v.group === 'rar') { key = c.rarity; label = `<span style="color:${RAR[c.rarity].color}">⭐ ${RAR[c.rarity].name}</span>`; order = -rIdx(m.type); }
    else if (v.group === 'el') { key = c.els.join('+'); label = `${elBadges(c.els)} ${c.els.map(e => EL[ELI[e]].name).join(' + ')}`; order = c.els.length * 100 + ELI[c.els[0]] * 10 + (ELI[c.els[1]] || 0); }
    else { key = 'all'; label = '📋 전체'; order = 0; }
    if (!groups.has(key)) groups.set(key, { label, order, items: [] });
    groups.get(key).items.push(m);
  });
  const body = list.length
    ? [...groups.values()].sort((a, b) => a.order - b.order).map(g => `
        <div class="bp-group">
          <div class="bp-head">${g.label} <span class="muted">${g.items.length}마리 · ▲ 강함 ${g.items.filter(strongVs).length}</span></div>
          <div class="grid">${g.items.map(cardOf).join('')}</div>
        </div>`).join('')
    : '<p class="muted">조건에 맞는 몬스터가 없어요.</p>';
  return `<div class="team-pick">
    <div class="chips"><span class="chip-label">묶어 보기</span>${chip('group', 'rar', '⭐ 등급')}${chip('group', 'el', '🔥 속성')}${chip('group', 'none', '📋 전체')}${chip('strong', !v.strong, v.strong ? '✅ ▲ 상대에게 강한 것만' : '☐ ▲ 상대에게 강한 것만')}</div>
    <div class="chips"><span class="chip-label">정렬</span>${chip('sort', 'power', '⚔️ 전투력')}${chip('sort', 'lv', '⬆️ 레벨')}${chip('sort', 'rar', '⭐ 등급')}</div>
    <div class="chips"><span class="chip-label">속성</span>${chip('el', 'all', '전체')}${EL.filter(e => owned.has(e.id)).map(e => chip('el', e.id, e.emoji + e.name)).join('')}</div>
    ${body}
  </div>`;
}

function toggleTeam(uid) {
  uid = Number(uid);
  const i = S.team.indexOf(uid);
  if (i >= 0) S.team.splice(i, 1);
  else if (S.team.length < 3) S.team.push(uid);
  else { toast('팀은 최대 3마리예요'); return; }
  save();
  const p = $('#panel'), y = p.scrollTop;
  renderAdventure();
  p.scrollTop = y;
}

// ===================== 턴제 전투 =====================
let B = null;

function mkUnit(m, side, idx) {
  const c = CAT[m.type], st = stats(m);
  return {
    id: side + idx, side, c, lv: m.lv,
    maxHp: st.hp, hp: st.hp, dispHp: st.hp, shownDead: false,
    atk: st.atk, spd: st.spd, sta: 2,
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
    waiting: false, over: false, fast: !!S.fastBattle, auto: !!S.autoBattle, timer: null, result: null, built: false,
  };
  $('#battle').classList.remove('hidden');
  updateGuide();
  logB(`⚔️ 스테이지 ${S.stage} 전투 시작!`);
  drawBattle();
  later(nextTurn, 600);
}

function logB(msg) {
  B.log.push(msg);
  if (B.log.length > 30) B.log.shift();
}
function later(fn, ms = 800) { B.timer = setTimeout(fn, B.fast ? ms * 0.25 : ms); }

// ----- 애니메이션 도우미 -----
const dur = (ms) => (B && B.fast ? ms * 0.35 : ms);
const wait = (ms) => new Promise(r => setTimeout(r, dur(ms)));
const unitEl = (u) => document.getElementById('u-' + u.id);
function centerOf(u) {
  const el = unitEl(u), arena = $('#arena');
  if (!el || !arena) return { x: 0, y: 0 };
  const r = el.querySelector('.u-face').getBoundingClientRect(), a = arena.getBoundingClientRect();
  return { x: r.left - a.left + r.width / 2, y: r.top - a.top + r.height / 2 };
}
function fxSpan(cls, html, x, y) {
  const s = document.createElement('div');
  s.className = cls;
  s.innerHTML = html;
  s.style.left = `${x}px`;
  s.style.top = `${y}px`;
  $('#fxLayer').appendChild(s);
  return s;
}
function floatText(u, html, kind) {
  if (!$('#fxLayer')) return;
  const { x, y } = centerOf(u);
  const s = fxSpan(`float-num ${kind}`, html, x, y - 20);
  s.animate([
    { transform: 'translate(-50%, -50%) scale(.6)', opacity: 0 },
    { transform: 'translate(-50%, -110%) scale(1.15)', opacity: 1, offset: 0.2 },
    { transform: 'translate(-50%, -260%) scale(1)', opacity: 0 },
  ], { duration: dur(1100), easing: 'ease-out' });
  setTimeout(() => s.remove(), dur(1100) + 50);
}
async function lunge(att, tgt) {
  const el = unitEl(att);
  if (!el) return;
  const p = centerOf(att), q = tgt ? centerOf(tgt) : { x: p.x, y: p.y + (att.side === 'me' ? -200 : 200) };
  const dx = (q.x - p.x) * 0.4, dy = (q.y - p.y) * 0.4;
  el.animate([
    { transform: 'translate(0, 0)' },
    { transform: 'translate(0, 0) scale(.95)', offset: 0.2 },
    { transform: `translate(${dx}px, ${dy}px) scale(1.12)`, offset: 0.55 },
    { transform: 'translate(0, 0)' },
  ], { duration: dur(520), easing: 'ease-in-out' });
  await wait(520);
}
async function projectile(from, to, icon, big) {
  if (!$('#fxLayer')) return;
  const p = centerOf(from), q = centerOf(to);
  const s = fxSpan(`proj ${big ? 'big' : ''}`, icon, p.x, p.y);
  s.animate([
    { transform: 'translate(-50%, -50%) scale(.5) rotate(0deg)', opacity: 0.6 },
    { transform: `translate(calc(-50% + ${q.x - p.x}px), calc(-50% + ${q.y - p.y}px)) scale(1.4) rotate(540deg)`, opacity: 1 },
  ], { duration: dur(380), easing: 'ease-in' });
  await wait(380);
  s.remove();
  const boom = fxSpan('proj boom', '💥', q.x, q.y);
  boom.animate([
    { transform: 'translate(-50%, -50%) scale(.4)', opacity: 1 },
    { transform: 'translate(-50%, -50%) scale(1.8)', opacity: 0 },
  ], { duration: dur(380), easing: 'ease-out' });
  setTimeout(() => boom.remove(), dur(380) + 50);
}
function shake(u, strong) {
  const el = unitEl(u);
  if (!el) return;
  const k = strong ? 14 : 8;
  el.animate([
    { transform: 'translateX(0)' }, { transform: `translateX(-${k}px) rotate(-3deg)` },
    { transform: `translateX(${k}px) rotate(3deg)` }, { transform: `translateX(-${k / 2}px)` },
    { transform: 'translateX(0)' },
  ], { duration: dur(360) });
  el.querySelector('.u-face').animate([
    { filter: 'none' }, { filter: 'brightness(2.2) sepia(1) hue-rotate(-40deg) saturate(4)' }, { filter: 'none' },
  ], { duration: dur(320) });
}
function glow(u, color) {
  const el = unitEl(u);
  if (!el) return Promise.resolve();
  el.querySelector('.u-face').animate([
    { boxShadow: '0 0 0 0 transparent', transform: 'scale(1)' },
    { boxShadow: `0 0 26px 10px ${color}`, transform: 'scale(1.12)' },
    { boxShadow: '0 0 0 0 transparent', transform: 'scale(1)' },
  ], { duration: dur(600) });
  return wait(600);
}
async function die(u) {
  const el = unitEl(u);
  floatText(u, '💀 쓰러졌다!', 'kill');
  if (el) {
    el.animate([
      { transform: 'none', opacity: 1, filter: 'none' },
      { transform: 'translateY(-12px) rotate(-10deg)', opacity: 1, filter: 'brightness(2)', offset: 0.25 },
      { transform: 'translateY(26px) rotate(80deg) scale(.7)', opacity: 0.15, filter: 'grayscale(1)' },
    ], { duration: dur(800), easing: 'ease-in' });
  }
  await wait(800);
  u.shownDead = true;
  updateUnit(u);
}
function damageHtml(d, adv, icon = '') {
  const note = adv > 1 ? '<small>효과가 굉장했다!</small>' : adv < 1 ? '<small>효과가 별로다…</small>' : '';
  return `${icon}-${fmt(d)}${note}`;
}

// ----- 턴 진행 -----
async function nextTurn() {
  const b = B;
  if (!b || b.over) return;
  if (checkEnd()) return;
  while (b.order.length && b.order[0].hp <= 0) b.order.shift();
  if (!b.order.length) {
    b.round++;
    b.order = b.units.filter(u => u.hp > 0).sort((x, y) => y.spd - x.spd || Math.random() - 0.5);
    // 보스는 한 라운드에 여러 번 움직인다: 순서 중간중간에 끼워 넣기
    b.order.filter(u => u.turns > 1).forEach(u => {
      const len = b.order.length;
      for (let t = 1; t < u.turns; t++) b.order.splice(Math.min(b.order.length, Math.round(len * t / u.turns) + t), 0, u);
    });
  }
  const u = b.order.shift();
  b.cur = u;
  u.sta = Math.min(MAX_STA, u.sta + 2);
  drawBattle();

  // 화상 / 중독: 자기 차례가 올 때마다 에너지가 깎인다
  for (const [k, label, icon] of [['burn', '화상', '🔥'], ['poison', '중독', '🧪']]) {
    if (u.fx[k] > 0 && u.hp > 0) {
      const d = u.fx[k + 'Dmg'];
      u.hp = Math.max(0, u.hp - d);
      u.dispHp = u.hp;
      u.fx[k]--;
      logB(`${icon} ${label} 피해! ${u.c.name} -${fmt(d)}${u.hp <= 0 ? ' 💀 쓰러졌다!' : ''}`);
      updateLog();
      updateUnit(u);
      shake(u);
      floatText(u, damageHtml(d, 1, icon), 'dmg');
      await wait(550);
      if (B !== b) return;
    }
  }
  if (u.hp <= 0) {
    await die(u);
    if (B !== b) return;
    later(nextTurn, 250);
    return;
  }
  if (u.fx.stun > 0) {
    u.fx.stun--;
    tickFx(u);
    logB(`💫 ${u.c.name}은(는) 기절해서 움직일 수 없다!`);
    floatText(u, '💫 기절!', 'status');
    drawBattle();
    later(nextTurn, 800);
    return;
  }
  if (u.side === 'me' && b.auto && !b.pvp) {
    drawBattle();
    later(() => { if (B === b && !b.over) aiAct(u); }, 450);
  } else if (u.side === 'me') {
    const t = unitById(b.target);
    if (!t || t.hp <= 0) b.target = aliveOf('foe')[0].id;
    b.waiting = true;
    drawBattle();
  } else if (b.pvp) {
    askRemote(u);
  } else {
    later(() => aiAct(u), 650);
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
  B.waiting = false;
  const foes = aliveOf(u.side === 'me' ? 'foe' : 'me');
  const allies = aliveOf(u.side);
  const events = [];
  let msg = `${u.c.face} ${u.c.name}의 ${sk.name}!`;
  const hit = (t, mult) => {
    const { d, adv } = calcDmg(u, t, sk, mult);
    t.hp = Math.max(0, t.hp - d);
    events.push({ kind: 'dmg', t, d, adv, hp: t.hp });
    msg += ` → ${t.c.name} -${fmt(d)}${adv > 1 ? ' (효과가 굉장했다!)' : adv < 1 ? ' (효과가 별로다…)' : ''}${t.hp <= 0 ? ' 💀' : ''}`;
    return t.hp > 0;
  };
  const status = (t, text) => events.push({ kind: 'status', t, text });
  const heal = (t, amount) => {
    t.hp = Math.min(t.maxHp, t.hp + amount);
    events.push({ kind: 'heal', t, amount, hp: t.hp });
  };
  switch (sk.type) {
    case 'dmg':
      if (sk.aoe) foes.forEach(t => hit(t, sk.mult)); else hit(tgt, sk.mult);
      break;
    case 'burn':
      if (hit(tgt, sk.mult)) { tgt.fx.burn = 3; tgt.fx.burnDmg = Math.round(u.atk * 0.3); msg += ' 🔥화상!'; status(tgt, '🔥 화상!'); }
      break;
    case 'poison':
      if (hit(tgt, sk.mult)) { tgt.fx.poison = 4; tgt.fx.poisonDmg = Math.round(u.atk * 0.25); msg += ' 🧪중독!'; status(tgt, '🧪 중독!'); }
      break;
    case 'stun':
      if (hit(tgt, sk.mult) && Math.random() < 0.6) { tgt.fx.stun = 1; msg += ' 💫기절!'; status(tgt, '💫 기절!'); }
      break;
    case 'curse':
      if (hit(tgt, sk.mult)) { tgt.fx.curse = 2; msg += ' 💀공격력 감소!'; status(tgt, '💀 공격력 ↓'); }
      break;
    case 'healTeam':
      allies.forEach(a => heal(a, Math.round(a.maxHp * sk.v)));
      msg += ' 💚 아군 전체 회복!';
      break;
    case 'healSelf':
      heal(u, Math.round(u.maxHp * sk.v));
      msg += ' 💚 체력 회복!';
      break;
    case 'shield':
      u.fx.shield = 2;
      msg += ' 🛡️ 받는 피해 절반!';
      status(u, '🛡️ 방패!');
      break;
    case 'buffSelf':
      u.fx.buff = 3;
      msg += ' 💪 공격력 증가!';
      status(u, '💪 공격력 ↑');
      break;
    case 'buffTeam':
      allies.forEach(a => { a.fx.buff = a === u ? 3 : 2; status(a, '💪 공격력 ↑'); });
      msg += ' 💪 아군 전체 공격력 증가!';
      break;
  }
  logB(msg);
  const b = B;
  if (b.pvp && b.pvp.role === 'host') netSend({ t: 'skill', att: u.id, sk: u.c.skills.indexOf(sk), events: events.map(e => ({ kind: e.kind, t: e.t.id, d: e.d, adv: e.adv, hp: e.hp, amount: e.amount, text: e.text })) });
  drawBattle();
  playSkill(u, sk, events).then(() => {
    if (B !== b) return;
    drawBattle();
    later(nextTurn, 300);
  });
}

// 공격 모습: 달려들기 → 속성 이모지가 날아감 → 맞은 쪽이 흔들리고 에너지가 줄어듦 → 에너지 0이면 쓰러짐
async function playSkill(u, sk, events) {
  const b = B;
  const dmgs = events.filter(e => e.kind === 'dmg');
  if (dmgs.length) {
    const icon = sk.cost === 0 ? '👊' : sk.aoe && sk.cost >= 7 ? '🌟' : EL[ELI[sk.el]].emoji;
    const lungeDone = lunge(u, dmgs.length === 1 ? dmgs[0].t : null);
    await wait(200);
    if (B !== b) return;
    await Promise.all(dmgs.map(e => projectile(u, e.t, icon, sk.cost >= 7)));
    if (B !== b) return;
    dmgs.forEach(e => {
      e.t.dispHp = e.hp;
      updateUnit(e.t);
      shake(e.t, e.adv > 1);
      floatText(e.t, damageHtml(e.d, e.adv), e.adv > 1 ? 'dmg crit' : 'dmg');
    });
    await lungeDone;
  } else {
    await glow(u, EL[ELI[sk.el]].color);
  }
  if (B !== b) return;
  events.filter(e => e.kind === 'heal').forEach(e => {
    e.t.dispHp = e.hp;
    updateUnit(e.t);
    glow(e.t, '#4cd964');
    floatText(e.t, `💚+${fmt(e.amount)}`, 'heal');
  });
  const st = events.filter(e => e.kind === 'status');
  if (st.length) {
    await wait(dmgs.length ? 250 : 0);
    st.forEach(e => floatText(e.t, e.text, 'status'));
  }
  await wait(450);
  if (B !== b) return;
  const dead = dmgs.filter(e => e.hp <= 0 && !e.t.shownDead);
  if (dead.length) await Promise.all(dead.map(e => die(e.t)));
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
  const foes = aliveOf(u.side === 'me' ? 'foe' : 'me');
  const tgt = foes.slice().sort((a, b) =>
    advantage([sk.el], b.c.els) - advantage([sk.el], a.c.els) || a.hp - b.hp)[0];
  useSkill(u, sk, tgt);
}

function playerSkill(i) {
  if (!B || !B.waiting) return;
  const u = B.cur, sk = u.c.skills[Number(i)];
  if (!sk || sk.cost > u.sta) return;
  if (B.pvp && B.pvp.role === 'guest') {
    // 친구 대전의 친구 쪽: 계산은 방장이 하니까 고른 스킬만 보낸다
    netSend({ t: 'act', i: Number(i), target: flipId(B.target) });
    B.waiting = false;
    drawBattle();
    return;
  }
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
  if (B.pvp) {
    if (win) { earn(PVP_REWARD.gold); earn(PVP_REWARD.gems, 'gems'); rewards.push(`💰 ${fmt(PVP_REWARD.gold)}`, `💎 ${PVP_REWARD.gems}`); }
        if (B.pvp.random) rewards.push(...pvpTrophy(win));
    if (B.pvp.role === 'host') netSend({ t: 'end', hostWin: win });
  } else if (B.gwar) rewards.push(...gwarResult(win));
  else if (B.bossIdx != null) rewards.push(...bossRewards(win));
  else if (win) {
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
  sfx(win ? 'win' : 'lose');
  if (win) mission('win');
  save();
  drawBattle();
  updateHud();
}

function quitBattle() {
  if (!B) return;
  if (!B.over && !confirm(B.pvp ? '친구 대전에서 나갈까요? (지는 걸로 처리돼요)' : '전투를 포기할까요?')) return;
  clearTimeout(B.timer);
  if (B.pvp) { netSend({ t: 'bye' }); netClose(); }
  const wasWar = !!B.gwar;
  B = null;
  $('#battle').classList.add('hidden');
  render();
  if (wasWar) { guildCache = null; setTimeout(() => openGuild('war'), 250); }
}

// ----- 전투 화면 그리기 -----
function unitHTML(u) {
  return `<div class="unit ${u.side} ${u.boss ? 'boss' : ''}" id="u-${u.id}" ${u.side === 'foe' ? `data-act="bTarget" data-id="${u.id}"` : ''}>
    <div class="tgt-mark">🎯</div>
    <div class="u-face" style="background:${grad(u.c)}"><span>${u.c.face}</span></div>
    <div class="u-nm">${u.c.name}</div>
    <div class="u-lv">Lv.${u.lv} ${elBadges(u.c.els)}</div>
    <div class="hp-label"><span>⚡ 에너지</span><span class="u-hp"></span></div>
    <div class="hp ${u.side === 'foe' ? 'enemy' : ''}"><div class="hp-fill"></div></div>
    <div class="u-sta" title="스태미나"></div>
    <div class="u-fx"></div>
    <div class="u-grave">🪦</div>
  </div>`;
}

function updateUnit(u) {
  const el = unitEl(u);
  if (!el) return;
  const isCur = B.cur === u && !B.over && !u.shownDead;
  el.classList.toggle('cur', isCur);
  el.classList.toggle('tgt', u.side === 'foe' && B.target === u.id && B.waiting && u.hp > 0);
  el.classList.toggle('dead', u.shownDead);
  const ratio = Math.max(0, u.dispHp / u.maxHp);
  const fill = el.querySelector('.hp-fill');
  fill.style.width = `${ratio * 100}%`;
  fill.classList.toggle('mid', ratio <= 0.6 && ratio > 0.3);
  fill.classList.toggle('low', ratio <= 0.3);
  el.querySelector('.u-hp').textContent = `${fmt(u.dispHp)} / ${fmt(u.maxHp)}`;
  el.querySelector('.u-sta').innerHTML = `${'<i class="on"></i>'.repeat(u.sta)}${'<i></i>'.repeat(MAX_STA - u.sta)}`;
  el.querySelector('.u-fx').textContent = u.shownDead ? '' : [
    u.fx.burn ? '🔥' : '', u.fx.poison ? '🧪' : '', u.fx.stun ? '💫' : '', u.fx.shield ? '🛡️' : '',
    u.fx.buff ? '💪' : '', u.fx.curse ? '💀' : '',
  ].join('');
}

function updateLog() {
  const log = $('#blog');
  if (!log) return;
  log.innerHTML = B.log.slice(-4).map((l, i, a) => `<div class="${i === a.length - 1 ? 'last' : ''}">${l}</div>`).join('');
}

function drawBattle() {
  if (!B) return;
  if (!B.built || !$('#arena')) {
    const me = B.units.filter(u => u.side === 'me');
    const foes = B.units.filter(u => u.side === 'foe');
    $('#battle').innerHTML = `
      <div class="b-inner">
        <div class="b-top">
          <b>${B.gwar ? `⚔️ 길드전 · ${esc(B.gwar.opp.emblem)} ${esc(B.gwar.def.n)}` : B.pvp ? `👥 친구 대전 · vs ${B.pvp.oppName}` : B.bossIdx != null ? `👹 보스전 · ${BOSSES[B.bossIdx].name}` : `스테이지 ${B.stage}`}</b><span class="muted" id="bRound"></span>
          <span class="spacer"></span>
          <button class="btn ghost small" data-act="typeChart">📘 상성표</button>
          ${B.pvp ? '' : '<button class="btn ghost small" data-act="bAuto" id="bAuto"></button>'}
          <button class="btn ghost small" data-act="bFast" id="bFast"></button>
          <button class="btn ghost small" data-act="bQuit" id="bQuitTop">🏳️ 포기</button>
        </div>
        <div class="b-arena" id="arena">
          <div class="b-side foe">${foes.map(unitHTML).join('')}</div>
          <div class="b-log" id="blog"></div>
          <div class="b-side me">${me.map(unitHTML).join('')}</div>
          <div class="fx-layer" id="fxLayer"></div>
        </div>
        <div id="bBottom"></div>
      </div>`;
    B.built = true;
  }
  $('#bRound').textContent = `라운드 ${B.round}`;
  $('#bFast').textContent = B.fast ? '▶️ 보통 속도' : '⏩ 빠르게';
  if ($('#bAuto')) { $('#bAuto').textContent = B.auto ? '🤖 자동 켜짐' : '🤖 자동'; $('#bAuto').classList.toggle('on', !!B.auto); }
  $('#bQuitTop').style.display = B.over ? 'none' : '';
  B.units.forEach(updateUnit);
  updateLog();

  let bottom = '';
  if (B.over) {
    const r = B.result;
    bottom = `<div class="b-result">
      <div class="result ${r.win ? 'win' : 'lose'}">${r.win ? '🏆 승리!' : '💥 패배…'}</div>
      <p>${r.win || B.gwar ? `보상: ${r.rewards.join(' · ')}` : '속성 상성을 생각하거나 몬스터를 키우고 룬을 끼워 보세요!'}</p>
      <button class="btn big" data-act="bQuit">확인</button>
    </div>`;
  } else if (B.waiting) {
    const u = B.cur, t = unitById(B.target);
    bottom = `<div class="b-turn">${u.c.face} <b>${u.c.name}</b>의 차례! 스킬을 고르세요 <span class="muted">(적을 눌러 타겟 변경)</span></div>
      <div class="skills">${u.c.skills.map((sk, i) => {
        const adv = needsTarget(sk) || sk.aoe ? advantage([sk.el], t.c.els) : 1;
        const tag = adv > 1 ? '<span class="adv up">▲ 강함</span>' : adv < 1 ? '<span class="adv down">▼ 약함</span>' : '';
        return `<button class="skill" data-act="bSkill" data-i="${i}" ${sk.cost > u.sta ? 'disabled' : ''} style="--sc:${EL[ELI[sk.el]].color}">
          <span class="sk-nm">${EL[ELI[sk.el]].emoji} ${sk.name} ${tag}</span>
          <span class="sk-desc">${skDesc(sk)}</span>
          <span class="sk-cost">⚡${sk.cost}</span>
        </button>`;
      }).join('')}</div>`;
  } else {
    bottom = `<div class="b-turn muted">${B.cur ? `${B.cur.c.face} ${B.cur.c.name}의 차례…` : '전투 준비!'}</div>`;
  }
  $('#bBottom').innerHTML = bottom;
  if (B.pvp && B.pvp.role === 'host') sendPvpState();
}

// ===================== 친구 대전 (방 코드, PeerJS) =====================
// 방장이 전투를 계산하고, 상태를 친구에게 보낸다. 친구는 자기 몬스터 차례에 스킬만 골라서 보낸다.
// 친구 화면에서는 편이 뒤집혀 보인다 (방장의 me0 = 친구 화면의 foe0)
const PVP_PREFIX = 'monhap-';
const PVP_REWARD = { gold: 300, gems: 5 };

// ===================== 🏆 트로피 · 티어 · 랭킹 =====================
const TIERS = [
  { min: 0,    name: '브론즈',   icon: '🥉', color: '#cd7f32', gems: 0 },
  { min: 200,  name: '실버',     icon: '🥈', color: '#c0c8d8', gems: 20 },
  { min: 500,  name: '골드',     icon: '🥇', color: '#ffd24a', gems: 40 },
  { min: 900,  name: '플래티넘', icon: '💠', color: '#5ce1e6', gems: 60 },
  { min: 1400, name: '다이아',   icon: '💎', color: '#7fb2ff', gems: 100 },
  { min: 2000, name: '마스터',   icon: '👑', color: '#ff7ad9', gems: 150 },
  { min: 3000, name: '챔피언',   icon: '🏆', color: '#ff5c5c', gems: 300 },
];
const TROPHY_WIN = 30, TROPHY_LOSE = 15;
const tierOf = (tr) => TIERS.filter(t => (tr || 0) >= t.min).pop();
const tierBadge = (tr) => { const t = tierOf(tr); return `<span class="tier" style="--tc:${t.color}">${t.icon} ${t.name}</span>`; };
function pvpTrophy(win) {
  const before = S.trophies || 0;
  S.trophies = Math.max(0, before + (win ? TROPHY_WIN : -TROPHY_LOSE));
  const out = [win ? `🏆 +${TROPHY_WIN}` : `🏆 -${Math.min(before, TROPHY_LOSE)}`];
  // 처음 올라간 티어는 보석 보상
  const t0 = tierOf(before), t1 = tierOf(S.trophies);
  S.tierBest = Math.max(S.tierBest || 0, 0);
  const idx = TIERS.indexOf(t1);
  if (t1 !== t0 && idx > (S.tierBest || 0)) {
    S.tierBest = idx;
    earn(t1.gems, 'gems');
    out.push(`${t1.icon} ${t1.name} 승급! 💎 ${t1.gems}`);
    setTimeout(() => sfx('yay'), 600);
  }
  save();
  setTimeout(() => rankSubmit(true), 1500);
  return out;
}

// ----- 전 세계 랭킹 (ntfy.sh에 점수를 올리고 읽는다. 12시간 동안 남아서 "최근 12시간 동안 접속한 사람" 순위) -----
// 내 컴퓨터에서 시험할 때(localhost)는 진짜 랭킹을 건드리지 않게 따로 쓴다
const RANK_TOPIC = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname) ? 'monhap-rank-dev-q7x2k9' : 'monhap-rank-v1-q7x2k9';
// 랭킹에서 숨길 기록 (시험하다가 잘못 올라간 것)
const RANK_HIDE = new Set(['7d7sb06fon1l', 'ut7q8bq5onn3']);
const RANK_URL = 'https://ntfy.sh/' + RANK_TOPIC;
const RANK_CATS = [
  { id: 'tr',  name: '🏆 트로피',  unit: '', desc: '🌍 랜덤 대전에서 이기면 올라가요' },
  { id: 'dex', name: '📖 도감',    unit: '마리', desc: '모은 몬스터 종류' },
  { id: 'st',  name: '⚔️ 모험',    unit: '스테이지', desc: '모험 스테이지' },
  { id: 'pw',  name: '💪 전투력',  unit: '', desc: '가장 센 몬스터 3마리의 힘' },
];
const monPower = (m) => { const s = stats(m); return Math.round(s.hp / 5 + s.atk * 2 + s.spd); };
function myRankData() {
  if (!S.rankId) { S.rankId = Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4); save(); }
  const top = S.monsters.slice().sort((a, b) => monPower(b) - monPower(a)).slice(0, 3);
  return {
    v: 1, id: S.rankId,
    n: String(S.nick || (ACC && ACC.name) || '플레이어').slice(0, 10),
    f: top[0] ? CAT[top[0].type].face : '🥚',
    tr: S.trophies || 0, dex: Object.keys(S.dex).length, st: S.stage || 1,
    pw: top.reduce((s, m) => s + monPower(m), 0),
    ...(S.guild ? { g: S.guild.id, gn: S.guild.name, ge: S.guild.emblem, gl: S.guild.leader ? 1 : 0, dt: defenseTeam() } : {}),
  };
}
// 길드전 방어 팀: 모험 팀, 없으면 가장 센 3마리
function defenseTeam() {
  let team = S.team.map(byUid).filter(Boolean).slice(0, 3);
  if (!team.length) team = S.monsters.slice().sort((a, b) => monPower(b) - monPower(a)).slice(0, 3);
  return team.map(m => { const st = stats(m); return { type: m.type, lv: m.lv, hp: st.hp, atk: st.atk, spd: st.spd }; });
}
let rankBusy = false;
// 점수가 바뀌었거나 3시간이 지났으면 올린다 (1분에 한 번까지)
async function rankSubmit(force) {
  // 몬스터가 한 마리도 없는 빈 계정은 올리지 않는다
  if (VISIT || !ACC || rankBusy || !navigator.onLine || !S.monsters.length) return;
  const d = myRankData(), key = JSON.stringify([d.n, d.f, d.tr, d.dex, d.st, d.pw, d.g || '', (d.dt || []).map(x => x.type + x.lv).join()]);
  const last = S.rankLast || {};
  const age = Date.now() - (last.t || 0);
  if (age < 60000) return;
  if (!force && last.key === key && age < 3 * 3600 * 1000) return;
  rankBusy = true;
  try {
    const r = await fetch(RANK_URL, { method: 'POST', body: JSON.stringify(d) });
    if (r.ok) { S.rankLast = { key, t: Date.now() }; save(); }
  } catch (e) { /* 인터넷 없음 */ }
  rankBusy = false;
}
async function rankFetch() {
  const r = await fetch(RANK_URL + '/json?poll=1&since=12h');
  if (!r.ok) throw new Error('http ' + r.status);
  const txt = await r.text();
  const best = {};
  txt.split('\n').forEach(line => {
    if (!line.trim()) return;
    try {
      const ev = JSON.parse(line);
      if (ev.event !== 'message') return;
      const d = JSON.parse(ev.message);
      if (!d || d.v !== 1 || typeof d.id !== 'string' || RANK_HIDE.has(d.id)) return;
      const num = (x, hi) => Math.max(0, Math.min(hi, Math.floor(Number(x) || 0)));
      const p = { id: d.id.slice(0, 20), n: String(d.n || '플레이어').slice(0, 10), f: String(d.f || '🥚').slice(0, 4),
        tr: num(d.tr, 99999), dex: num(d.dex, CAT_LIST.length), st: num(d.st, 9999), pw: num(d.pw, 1e8), t: ev.time,
        g: typeof d.g === 'string' ? d.g.slice(0, 12) : '', gn: String(d.gn || '').slice(0, 12), ge: String(d.ge || '🛡️').slice(0, 4), gl: d.gl ? 1 : 0,
        dt: Array.isArray(d.dt) ? d.dt.slice(0, 3).filter(x => x && CAT[x.type]) : [] };
      if (!best[p.id] || best[p.id].t <= p.t) best[p.id] = p;   // 한 사람은 가장 최근 기록만
    } catch (e) { /* 잘못된 줄은 건너뛴다 */ }
  });
  return Object.values(best);
}
let rankCat = 'tr', rankCache = null;
async function openRanking(cat) {
  tutFlag('ranking', true);
  if (cat) rankCat = cat;
  const draw = (body) => {
    const c = RANK_CATS.find(x => x.id === rankCat);
    showModal(`<h3>🏆 랭킹</h3>
      <div class="rank-me">
        <div class="rm-tier">${tierBadge(S.trophies)} <b>🏆 ${fmt(S.trophies || 0)}</b></div>
        <div class="rm-name">내 이름 <input id="rankName" maxlength="10" value="${esc(S.nick || (ACC && ACC.name) || '')}"><button class="btn small" data-act="rankName">저장</button></div>
      </div>
      <div class="chips">${RANK_CATS.map(x => `<button class="chip ${x.id === rankCat ? 'on' : ''}" data-act="rankCat" data-c="${x.id}">${x.name}</button>`).join('')}</div>
      <p class="muted">${c.desc} · 최근 12시간 동안 게임을 한 플레이어 순위예요</p>
      <div class="rank-list">${body}</div>
      <div class="row"><button class="btn ghost small" data-act="rankRefresh">🔄 새로고침</button><button class="btn ghost small" data-act="close">닫기</button></div>`);
  };
  if (!rankCache || Date.now() - rankCache.t > 30000) {
    draw('<p class="muted rank-loading">⏳ 전 세계 순위를 불러오는 중…</p>');
    await rankSubmit(true);
    try { rankCache = { t: Date.now(), list: await rankFetch() }; } catch (e) {
      draw('<p class="warn">순위를 불러오지 못했어요. 인터넷 연결을 확인해 주세요.</p>');
      return;
    }
  }
  // 내 기록은 항상 최신으로 넣어 둔다 (방금 올린 게 아직 안 보일 수 있어서)
  const me = myRankData();
  const list = rankCache.list.filter(p => p.id !== me.id).concat([{ ...me, t: Date.now() / 1000 }]);
  const c = RANK_CATS.find(x => x.id === rankCat);
  list.sort((a, b) => b[rankCat] - a[rankCat] || a.t - b.t);
  const myPos = list.findIndex(p => p.id === me.id) + 1;
  const medal = (k) => (k === 0 ? '🥇' : k === 1 ? '🥈' : k === 2 ? '🥉' : `<small>${k + 1}</small>`);
  const row = (p, k) => `<div class="rank-row ${p.id === me.id ? 'me' : ''} ${k < 3 ? 'top' : ''}">
      <span class="rk-pos">${medal(k)}</span>
      <span class="rk-face">${esc(p.f)}</span>
      <span class="rk-name">${esc(p.n)}${p.id === me.id ? ' <small>(나)</small>' : ''}<br>${tierBadge(p.tr)}</span>
      <span class="rk-val">${fmt(p[rankCat])}<small>${c.unit}</small></span>
    </div>`;
  const shown = list.slice(0, 50);
  draw(`<p class="rank-mypos">내 순위: <b>${myPos}위</b> / ${list.length}명</p>${shown.map(row).join('')}${myPos > 50 ? '<div class="rank-gap">⋯</div>' + row(list[myPos - 1], myPos - 1) : ''}`);
}
// ===================== 🛡️ 길드 =====================
// 서버가 없어서: 길드원 각자가 랭킹 기록에 "내 길드"를 같이 올리고, 모두의 기록을 모아서 길드를 만든다.
// 채팅은 길드마다 ntfy 주제 하나. 모르는 사람과도 대화하니까 정해진 말과 이모지만 보낼 수 있다.
const GUILD_COST = 5000, GUILD_MAX = 30, GUILD_PCT = 2;
const GUILD_EMBLEMS = ['🛡️', '⚔️', '🐉', '🦁', '🦅', '🐺', '🔥', '💧', '⚡', '🌿', '🌙', '☀️', '💎', '👑', '🌈', '🍀'];
const GUILD_LV = [0, 600, 1500, 3000, 5500, 9000, 14000, 21000, 30000, 45000];
const GUILD_CHAT = ['👋 안녕하세요!', '🤝 같이 해요!', '🙏 고마워요!', '👍 대단해요!', '🆘 도와주세요!', '🎉 축하해요!', '⚔️ 대전 한 판 해요!', '🐣 새 몬스터 얻었어요!', '🌙 잘 자요!', '😄', '😭', '🔥', '❤️', '👑'];
const GUILD_TOPIC = (id) => 'https://ntfy.sh/monhap-guild-v1-' + id;
const guildPts = (members) => members.reduce((s, p) => s + p.tr + p.dex * 2 + 100, 0);
const guildLvOf = (pts) => GUILD_LV.filter(x => pts >= x).length;
function guildPct() { return S.guild ? Math.min(10, S.guild.lv || 1) * GUILD_PCT : 0; }
// 랭킹 기록을 길드별로 묶기
function guildsFrom(list) {
  const map = {};
  list.forEach(p => {
    if (!p.g) return;
    const g = map[p.g] = map[p.g] || { id: p.g, members: [], name: '', emblem: '🛡️', t: 0 };
    g.members.push(p);
    // 이름·문양은 길드장 기록을 우선, 없으면 가장 최근 기록
    if (p.gl || (!g.leaderSeen && p.t >= g.t)) { g.name = p.gn || g.name; g.emblem = p.ge || g.emblem; g.t = p.t; if (p.gl) g.leaderSeen = true; }
  });
  return Object.values(map).map(g => ({ ...g, pts: guildPts(g.members), lv: guildLvOf(guildPts(g.members)) }))
    .sort((a, b) => b.pts - a.pts);
}
let guildTab = 'home', guildCache = null;
async function guildData(force) {
  if (force || !guildCache || Date.now() - guildCache.t > 30000) {
    await rankSubmit(true);
    const list = await rankFetch();
    const me = myRankData();
    const all = list.filter(p => p.id !== me.id).concat([{ ...me, t: Date.now() / 1000, g: me.g || '', gn: me.gn || '', ge: me.ge || '', gl: me.gl || 0 }]);
    guildCache = { t: Date.now(), guilds: guildsFrom(all) };
  }
  // 내 길드 레벨을 저장해 둔다 (골드 보너스용)
  if (S.guild) {
    const mine = guildCache.guilds.find(g => g.id === S.guild.id);
    if (mine && mine.lv !== S.guild.lv) { S.guild.lv = mine.lv; save(); }
  }
  return guildCache.guilds;
}
async function openGuild(t) {
  tutFlag('guild', true);
  if (t) guildTab = t;
  showModal('<h3>🛡️ 길드</h3><p class="muted rank-loading">⏳ 길드 정보를 불러오는 중…</p>');
  let guilds;
  try { guilds = await guildData(); } catch (e) {
    showModal('<h3>🛡️ 길드</h3><p class="warn">길드 정보를 불러오지 못했어요. 인터넷 연결을 확인해 주세요.</p><div class="row"><button class="btn ghost" data-act="close">닫기</button></div>');
    return;
  }
  if (!S.guild) return guildBrowse(guilds);
  const g = guilds.find(x => x.id === S.guild.id) || { id: S.guild.id, name: S.guild.name, emblem: S.guild.emblem, members: [], pts: 0, lv: 1 };
  const me = myRankData();
  const tabs = [['war', '⚔️ 길드전'], ['home', '👥 길드원'], ['chat', '💬 채팅'], ['rank', '🏆 길드 순위']];
  let body = '';
  if (guildTab === 'war') {
    body = await gwarBody(guilds);
  } else if (guildTab === 'home') {
    const mem = g.members.slice().sort((a, b) => b.gl - a.gl || b.tr - a.tr);
    body = `<div class="rank-list">${mem.map(p => `<div class="rank-row ${p.id === me.id ? 'me' : ''}">
        <span class="rk-pos">${p.gl ? '👑' : '🛡️'}</span><span class="rk-face">${esc(p.f)}</span>
        <span class="rk-name">${esc(p.n)}${p.id === me.id ? ' <small>(나)</small>' : ''}${p.gl ? ' <small>길드장</small>' : ''}<br>${tierBadge(p.tr)}</span>
        <span class="rk-val">🏆${fmt(p.tr)}<br><small>📖${fmt(p.dex)}</small></span></div>`).join('')}</div>
      <p class="muted">최근 12시간 동안 게임을 한 길드원만 보여요</p>`;
  } else if (guildTab === 'chat') {
    body = `<div class="gchat" id="gChat"><p class="muted">⏳ 불러오는 중…</p></div>
      <div class="gchat-send">${GUILD_CHAT.map((m, k) => `<button class="chip" data-act="gSay" data-k="${k}">${m}</button>`).join('')}</div>
      <p class="muted">모르는 사람과도 이야기하니까 정해진 말과 이모지만 보낼 수 있어요</p>`;
  } else {
    body = `<div class="rank-list">${guilds.slice(0, 50).map((x, k) => `<div class="rank-row ${x.id === g.id ? 'me' : ''} ${k < 3 ? 'top' : ''}">
        <span class="rk-pos">${k === 0 ? '🥇' : k === 1 ? '🥈' : k === 2 ? '🥉' : `<small>${k + 1}</small>`}</span><span class="rk-face">${esc(x.emblem)}</span>
        <span class="rk-name">${esc(x.name)}<br><small>Lv.${x.lv} · 👥 ${x.members.length}명</small></span>
        <span class="rk-val">${fmt(x.pts)}<small>점</small></span></div>`).join('')}</div>`;
  }
  const next = GUILD_LV[g.lv] ;
  showModal(`<div class="guild-head"><span class="gh-emb">${esc(g.emblem)}</span>
      <div><h3>${esc(g.name)} <small class="muted">Lv.${g.lv}</small></h3>
      <div class="muted">👥 ${g.members.length}/${GUILD_MAX}명 · 길드 점수 ${fmt(g.pts)}${next ? ` (다음 레벨 ${fmt(next)})` : ' (최고 레벨!)'}</div>
      <div class="guild-bonus">💰 길드 보너스: 서식지 골드 +${guildPct()}%</div></div></div>
    <div class="chips">${tabs.map(([id, nm]) => `<button class="chip ${guildTab === id ? 'on' : ''}" data-act="guildTab" data-t="${id}">${nm}</button>`).join('')}</div>
    ${body}
    <div class="row"><button class="btn ghost small" data-act="guildRefresh">🔄 새로고침</button><button class="btn ghost small danger" data-act="guildLeave">🚪 길드 나가기</button><button class="btn ghost small" data-act="close">닫기</button></div>`);
  if (guildTab === 'chat') guildChatLoad();
}
function guildBrowse(guilds) {
  showModal(`<h3>🛡️ 길드</h3>
    <p class="muted">길드에 들어가면 길드원들과 함께 <b>길드 레벨</b>을 올려요. 레벨마다 <b>서식지 골드 +${GUILD_PCT}%</b>! 길드 채팅도 할 수 있어요.</p>
    <div class="row"><button class="btn big green" data-act="guildNew">✨ 길드 만들기 (💰 ${fmt(GUILD_COST)})</button></div>
    <h3 class="sub">🔎 길드 찾기 <small class="muted">최근 12시간 동안 활동한 길드</small></h3>
    <div class="rank-list">${guilds.length ? guilds.slice(0, 50).map(g => `<div class="rank-row">
        <span class="rk-face">${esc(g.emblem)}</span>
        <span class="rk-name" style="grid-column: span 2">${esc(g.name)}<br><small>Lv.${g.lv} · 👥 ${g.members.length}/${GUILD_MAX}명 · ${fmt(g.pts)}점</small></span>
        <button class="btn small green" data-act="guildJoin" data-id="${g.id}" ${g.members.length >= GUILD_MAX ? 'disabled' : ''}>${g.members.length >= GUILD_MAX ? '가득' : '가입'}</button></div>`).join('')
      : '<p class="muted">아직 활동 중인 길드가 없어요. 첫 길드를 만들어 봐요!</p>'}</div>
    <div class="row"><button class="btn ghost small" data-act="guildRefresh">🔄 새로고침</button><button class="btn ghost small" data-act="close">닫기</button></div>`);
}
let guildEmblem = '🛡️';
function guildNew() {
  showModal(`<h3>✨ 길드 만들기</h3>
    <input id="guildName" maxlength="12" placeholder="길드 이름 (12자까지)">
    <p class="muted">문양 고르기</p>
    <div class="emblem-pick">${GUILD_EMBLEMS.map(e => `<button class="chip ${e === guildEmblem ? 'on' : ''}" data-act="guildEmb" data-e="${e}">${e}</button>`).join('')}</div>
    <div class="row"><button class="btn big green" data-act="guildCreate">만들기 (💰 ${fmt(GUILD_COST)})</button><button class="btn ghost" data-act="guildOpen">← 뒤로</button></div>`);
}
async function guildCreate() {
  const name = ($('#guildName') ? $('#guildName').value : '').trim().slice(0, 12);
  if (!name) { toast('길드 이름을 적어 주세요'); return; }
  if (!S.monsters.length) { toast('몬스터가 한 마리는 있어야 길드를 만들 수 있어요'); return; }
  if (!spend(GUILD_COST)) return;
  const id = Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
  S.guild = { id, name, emblem: guildEmblem, leader: true, lv: 1, joined: Date.now() };
  save(); updateHud(); sfx('yay');
  toast(`🛡️ ${name} 길드를 만들었어요!`);
  S.rankLast = null;
  guildSay(`🎉 ${S.nick || ACC.name}님이 길드를 만들었어요!`, true);
  guildCache = null; guildTab = 'home';
  openGuild();
}
async function guildJoin(id) {
  if (!S.monsters.length) { toast('몬스터가 한 마리는 있어야 길드에 들어갈 수 있어요'); return; }
  const g = (guildCache && guildCache.guilds || []).find(x => x.id === id);
  if (!g) return;
  if (g.members.length >= GUILD_MAX) { toast('길드가 가득 찼어요'); return; }
  S.guild = { id: g.id, name: g.name, emblem: g.emblem, leader: false, lv: g.lv, joined: Date.now() };
  save(); sfx('yay');
  toast(`🛡️ ${g.name} 길드에 들어갔어요!`);
  S.rankLast = null;
  guildSay(`👋 ${S.nick || ACC.name}님이 길드에 들어왔어요!`, true);
  guildCache = null; guildTab = 'home';
  openGuild();
}
function guildLeave() {
  if (!S.guild || !confirm(`${S.guild.name} 길드에서 나갈까요?${S.guild.leader ? ' (길드장이 나가도 길드원이 남아 있으면 길드는 계속돼요)' : ''}`)) return;
  guildSay(`🚪 ${S.nick || ACC.name}님이 길드를 떠났어요`, true);
  S.guild = null;
  S.rankLast = null;
  save(); guildCache = null;
  toast('길드에서 나왔어요');
  setTimeout(() => { rankSubmit(true); openGuild(); }, 300);
}
// ===================== ⚔️ 길드전 =====================
// 하루에 한 번 비슷한 길드와 짝이 된다. 길드원마다 하루 3번 상대 길드원의 방어 팀을 공격해서 ⭐을 모은다.
// 상대 길드가 없으면 🐺 야생 몬스터단(컴퓨터)과 싸운다.
const GWAR_ATTACKS = 3;
const GWAR_CHEST = [{ need: 10, gems: 10, gold: 3000 }, { need: 25, gems: 25, gold: 8000, rune: true }, { need: 50, gems: 50, gold: 20000, rune: true }];
const GWAR_URL = () => 'https://ntfy.sh/monhap-gwar-' + (RANK_TOPIC.includes('-dev-') ? 'dev-' : 'v1-') + dayKey();
function gwarToday() {
  const k = dayKey();
  if (!S.gwar || S.gwar.day !== k) S.gwar = { day: k, left: GWAR_ATTACKS, stars: 0, chest: [] };
  return S.gwar;
}
// 오늘의 상대: 길드 점수가 가장 비슷한 길드 (날짜로 섞어서 매일 조금씩 달라진다)
function gwarOpponent(guilds) {
  if (!S.guild) return null;
  const me = guilds.find(g => g.id === S.guild.id);
  const myPts = me ? me.pts : 0;
  const others = guilds.filter(g => g.id !== S.guild.id && g.members.some(p => p.dt && p.dt.length));
  if (others.length) {
    let seed = [...(dayKey() + S.guild.id)].reduce((s, ch) => (s * 31 + ch.charCodeAt(0)) >>> 0, 7);
    const sorted = others.slice().sort((a, b) => Math.abs(a.pts - myPts) - Math.abs(b.pts - myPts));
    const pool = sorted.slice(0, 3);
    return pool[seed % pool.length];
  }
  return wildGuild();
}
// 🐺 야생 몬스터단: 내 모험 스테이지에 맞춰 컴퓨터가 5명을 만든다
function wildGuild() {
  const base = Math.max(1, (S.stage || 1) - 1);
  const names = ['늑대 대장', '동굴 트롤', '숲의 요정', '바위 거인', '그림자 박쥐'];
  const faces = ['🐺', '🧌', '🧚', '🗿', '🦇'];
  const members = names.map((n, k) => {
    const team = enemyTeam(base + k).map(m => { const st = stats({ ...m, runes: [] }); return { type: m.type, lv: m.lv, hp: st.hp, atk: st.atk, spd: st.spd }; });
    return { id: 'wild' + k, n, f: faces[k], tr: 0, dex: 0, dt: team, g: 'wild', gl: k === 0 ? 1 : 0 };
  });
  return { id: 'wild', name: '야생 몬스터단', emblem: '🐺', members, pts: 0, lv: Math.min(10, 1 + Math.floor(base / 3)), wild: true };
}
async function gwarFetch() {
  const txt = await (await fetch(GWAR_URL() + '/json?poll=1&since=24h')).text();
  return txt.split('\n').filter(Boolean).map(l => { try { const e = JSON.parse(l); const d = JSON.parse(e.message); return d && d.v === 1 ? d : null; } catch (e) { return null; } })
    .filter(d => d && typeof d.g === 'string')
    .map(d => ({ g: d.g.slice(0, 12), gn: String(d.gn || '').slice(0, 12), ge: String(d.ge || '🛡️').slice(0, 4), id: String(d.id || '').slice(0, 20), n: String(d.n || '').slice(0, 10), st: Math.max(0, Math.min(3, Math.floor(Number(d.st) || 0))), tgt: String(d.tgt || '').slice(0, 20), vs: String(d.vs || '').slice(0, 12) }));
}
async function gwarBody(guilds) {
  const w = gwarToday();
  const opp = gwarOpponent(guilds);
  let log = [];
  try { log = await gwarFetch(); } catch (e) { /* 인터넷 문제면 빈 기록 */ }
  // 내가 방금 얻은 별이 아직 안 보일 수 있으니 내 기록 수를 맞춰 준다
  const myLogged = log.filter(x => x.id === S.rankId).reduce((s, x) => s + x.st, 0);
  if (w.stars > myLogged) log.push({ g: S.guild.id, gn: S.guild.name, ge: S.guild.emblem, id: S.rankId, n: S.nick || '', st: w.stars - myLogged, tgt: '', vs: '' });
  const starsOf = (gid) => log.filter(x => x.g === gid).reduce((s, x) => s + x.st, 0);
  const ours = starsOf(S.guild.id), theirs = opp && !opp.wild ? starsOf(opp.id) : 0;
  // 상대 길드원마다 우리 길드가 오늘 얻은 가장 높은 별
  const bestOn = (pid) => Math.max(0, ...log.filter(x => x.g === S.guild.id && x.tgt === pid).map(x => x.st));
  const team = S.team.map(byUid).filter(Boolean).length;
  const standings = {};
  log.forEach(x => { const s = standings[x.g] = standings[x.g] || { g: x.g, gn: x.gn, ge: x.ge, st: 0 }; s.st += x.st; });
  const top = Object.values(standings).sort((a, b) => b.st - a.st).slice(0, 10);
  gwarCache = { opp };
  return `<div class="gwar-vs">
      <div class="gw-side"><span class="gw-emb">${esc(S.guild.emblem)}</span><b>${esc(S.guild.name)}</b><div class="gw-stars">⭐ ${ours}</div></div>
      <div class="gw-mid">VS</div>
      <div class="gw-side"><span class="gw-emb">${esc(opp.emblem)}</span><b>${esc(opp.name)}</b><div class="gw-stars">${opp.wild ? '<small>컴퓨터</small>' : '⭐ ' + theirs}</div></div>
    </div>
    <p class="muted">오늘 남은 공격 <b>${w.left}/${GWAR_ATTACKS}</b>번 · 내가 모은 ⭐ ${w.stars} · 이기면 ⭐1, 2마리 살아남으면 ⭐2, 3마리 모두 살면 ⭐3</p>
    ${team ? '' : '<p class="warn">모험 탭에서 먼저 팀을 짜 주세요!</p>'}
    <div class="rank-list">${opp.members.filter(p => p.dt && p.dt.length).slice(0, 30).map(p => {
      const b = bestOn(p.id);
      const pw = p.dt.reduce((s, d) => s + Math.round(d.hp / 5 + d.atk * 2 + d.spd), 0);
      return `<div class="rank-row gw-def">
        <span class="rk-face">${esc(p.f)}</span>
        <span class="rk-name">${esc(p.n)}${p.gl ? ' <small>👑</small>' : ''}<br><small>${p.dt.map(d => CAT[d.type].face).join('')} · 💪 ${fmt(pw)}</small></span>
        <span class="gw-best">${'⭐'.repeat(b)}${'☆'.repeat(3 - b)}</span>
        <button class="btn small ${w.left && team ? '' : 'ghost'}" data-act="gwarAttack" data-id="${esc(p.id)}" ${w.left && team ? '' : 'disabled'}>⚔️ 공격</button>
      </div>`;
    }).join('')}</div>
    <h3 class="sub">🎁 길드전 상자 <small class="muted">우리 길드가 오늘 모은 ⭐로 열려요 (길드원 각자 받아요)</small></h3>
    <div class="gw-chests">${GWAR_CHEST.map((c, k) => {
      const got = w.chest.includes(k), ok = ours >= c.need;
      return `<button class="gw-chest ${got ? 'got' : ok ? 'ok' : ''}" data-act="gwarChest" data-k="${k}" ${got || !ok ? 'disabled' : ''}>
        <span>${got ? '✅' : ok ? '🎁' : '🔒'}</span><b>⭐ ${c.need}</b><small>💎${c.gems} · 💰${shortNum(c.gold)}${c.rune ? ' · 💠' : ''}</small></button>`;
    }).join('')}</div>
    <h3 class="sub">🏆 오늘의 길드전 순위</h3>
    <div class="rank-list">${top.length ? top.map((s, k) => `<div class="rank-row ${s.g === S.guild.id ? 'me' : ''}">
        <span class="rk-pos">${k === 0 ? '🥇' : k === 1 ? '🥈' : k === 2 ? '🥉' : `<small>${k + 1}</small>`}</span><span class="rk-face">${esc(s.ge)}</span>
        <span class="rk-name">${esc(s.gn)}</span><span class="rk-val">⭐ ${s.st}</span></div>`).join('') : '<p class="muted">아직 오늘 길드전 기록이 없어요. 첫 공격을 해 봐요!</p>'}</div>`;
}
let gwarCache = null;
function gwarAttack(pid) {
  tutFlag('gwar', true);
  const w = gwarToday();
  if (!w.left) { toast('오늘 공격을 다 썼어요. 내일 또 해요!'); return; }
  const opp = gwarCache && gwarCache.opp;
  const def = opp && opp.members.find(p => p.id === pid);
  const team = S.team.map(byUid).filter(Boolean).slice(0, 3);
  if (!def || !def.dt.length) return;
  if (!team.length) { toast('모험 탭에서 먼저 팀을 짜 주세요!'); return; }
  if (B) return;
  w.left--;   // 시작할 때 쓴다 (도중에 포기해도 1번 사용)
  save();
  closeModal();
  const foes = def.dt.map((d, k) => netUnit(d, 'foe', k)).filter(Boolean);
  B = {
    stage: S.stage, gwar: { opp: { id: opp.id, name: opp.name, emblem: opp.emblem, wild: !!opp.wild }, def: { id: def.id, n: def.n } },
    units: [...team.map((m, i) => mkUnit(m, 'me', i)), ...foes],
    order: [], cur: null, target: 'foe0', log: [], round: 0,
    waiting: false, over: false, fast: !!S.fastBattle, auto: !!S.autoBattle, timer: null, result: null, built: false,
  };
  $('#battle').classList.remove('hidden');
  updateGuide();
  logB(`⚔️ 길드전! ${opp.emblem} ${opp.name}의 ${def.n} 방어 팀과 싸워요`);
  drawBattle();
  later(nextTurn, 600);
}
function gwarResult(win) {
  const w = gwarToday();
  const alive = aliveOf('me').length;
  const stars = win ? 1 + (alive >= 2 ? 1 : 0) + (alive >= 3 ? 1 : 0) : 0;
  mission('gwar');
  w.stars += stars;
  const gold = 200 + stars * 400, gems = stars * 2;
  earn(gold); if (gems) earn(gems, 'gems');
  if (stars && S.guild) {
    fetch(GWAR_URL(), { method: 'POST', body: JSON.stringify({ v: 1, g: S.guild.id, gn: S.guild.name, ge: S.guild.emblem, id: S.rankId, n: String(S.nick || (ACC && ACC.name) || '').slice(0, 10), st: stars, tgt: B.gwar.def.id, vs: B.gwar.opp.id }) }).catch(() => {});
  }
  save();
  return [stars ? '⭐'.repeat(stars) + ' 길드전 별 ' + stars + '개!' : '⭐ 0개', `💰 ${fmt(gold)}`, ...(gems ? [`💎 ${gems}`] : [])];
}
async function gwarChest(k) {
  k = Number(k);
  const w = gwarToday(), c = GWAR_CHEST[k];
  if (!c || w.chest.includes(k)) return;
  // 길드 별을 다시 확인
  let ours = 0;
  try { ours = (await gwarFetch()).filter(x => x.g === S.guild.id).reduce((s, x) => s + x.st, 0); } catch (e) { toast('인터넷 연결을 확인해 주세요'); return; }
  ours = Math.max(ours, w.stars);
  if (ours < c.need) { toast(`길드 별이 ⭐ ${c.need}개 필요해요`); return; }
  w.chest.push(k);
  earn(c.gems, 'gems'); earn(c.gold);
  const extra = c.rune ? ' · ' + runeText(giveRune([0.2, 0.5, 0.3])) : '';
  save(); updateHud(); sfx('yay');
  toast(`🎁 길드전 상자! 💎 ${c.gems} · 💰 ${fmt(c.gold)}${extra}`);
  openGuild('war');
}

// ----- 길드 채팅 -----
async function guildSay(text, system) {
  if (!S.guild) return;
  const d = { v: 1, id: S.rankId, n: String(S.nick || (ACC && ACC.name) || '플레이어').slice(0, 10), f: myRankData().f, m: text, sys: system ? 1 : 0 };
  try { await fetch(GUILD_TOPIC(S.guild.id), { method: 'POST', body: JSON.stringify(d) }); } catch (e) { toast('메시지를 보내지 못했어요'); }
}
let gSayAt = 0;
async function gSay(k) {
  const m = GUILD_CHAT[Number(k)];
  if (!m) return;
  if (Date.now() - gSayAt < 3000) { toast('조금 천천히 보내 주세요 😊'); return; }
  gSayAt = Date.now();
  await guildSay(m);
  guildChatLoad();
}
let gChatTimer = null;
async function guildChatLoad() {
  clearTimeout(gChatTimer);
  const box = $('#gChat');
  if (!box || !S.guild) return;
  try {
    const txt = await (await fetch(GUILD_TOPIC(S.guild.id) + '/json?poll=1&since=12h')).text();
    const msgs = txt.split('\n').filter(Boolean).map(l => { try { const e = JSON.parse(l); const d = JSON.parse(e.message); return { ...d, t: e.time }; } catch (e) { return null; } })
      .filter(d => d && d.v === 1 && typeof d.m === 'string')
      // 정해진 말과 시스템 알림만 보여 준다 (다른 글은 무시)
      .filter(d => GUILD_CHAT.includes(d.m) || (d.sys && /^(🎉|👋|🚪) .{1,20}님이 (길드를 만들었어요!|길드에 들어왔어요!|길드를 떠났어요)$/.test(d.m)))
      .slice(-60);
    const b = $('#gChat');
    if (!b) return;
    const me = S.rankId;
    b.innerHTML = msgs.length ? msgs.map(d => d.sys
      ? `<div class="gc-sys">${esc(d.m)}</div>`
      : `<div class="gc-msg ${d.id === me ? 'mine' : ''}"><span class="gc-face">${esc(String(d.f || '🥚').slice(0, 4))}</span><div><b>${esc(String(d.n || '').slice(0, 10))}</b><span>${esc(d.m)}</span></div><small>${new Date(d.t * 1000).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</small></div>`).join('')
      : '<p class="muted">아직 메시지가 없어요. 첫 인사를 해 봐요! 👋</p>';
    b.scrollTop = b.scrollHeight;
  } catch (e) { box.innerHTML = '<p class="warn">채팅을 불러오지 못했어요</p>'; }
  // 채팅 창이 열려 있는 동안 8초마다 새 메시지 확인
  gChatTimer = setTimeout(() => { if ($('#gChat')) guildChatLoad(); }, 8000);
}

// 켜 있는 동안 가끔 점수 올리기
setInterval(() => rankSubmit(false), 120000);
let NET = null;   // { peer, conn, role, code, oppName, oppTeam, started }
const esc = (t) => String(t ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const flipId = (id) => (!id ? id : id.startsWith('me') ? 'foe' + id.slice(2) : 'me' + id.slice(3));
const newFx = () => ({ burn: 0, burnDmg: 0, poison: 0, poisonDmg: 0, stun: 0, shield: 0, buff: 0, curse: 0 });
function pvpCode() {
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let c = '';
  for (let k = 0; k < 6; k++) c += A[Math.floor(Math.random() * A.length)];
  return c;
}
function netSend(msg) { try { if (NET && NET.conn && NET.conn.open) NET.conn.send(msg); } catch (e) { /* 끊김 */ } }
function netClose() {
  const n = NET;
  NET = null;
  try { n && n.conn && n.conn.close(); } catch (e) { /* 이미 닫힘 */ }
  try { n && n.peer && n.peer.destroy(); } catch (e) { /* 이미 닫힘 */ }
}
function myTeamData() {
  return S.team.map(byUid).filter(Boolean).slice(0, 3).map(m => {
    const st = stats(m);
    return { type: m.type, lv: m.lv, hp: st.hp, atk: st.atk, spd: st.spd };
  });
}
function netUnit(d, side, idx) {
  if (!d || !CAT[d.type]) return null;
  const num = (v, lo, hi) => Math.max(lo, Math.min(hi, Number(v) || lo));
  const hp = num(d.hp, 1, 1e7);
  return { id: side + idx, side, c: CAT[d.type], lv: num(d.lv, 1, MAX_LV), maxHp: hp, hp, dispHp: hp, shownDead: false,
    atk: num(d.atk, 1, 1e6), spd: num(d.spd, 1, 1e4), sta: 2, fx: newFx() };
}

function openPvp() {
  tutFlag('friends', true);
  if (!window.Peer) { toast('친구 대전 기능을 불러오지 못했어요. 인터넷 연결을 확인해 주세요'); return; }
  if (NET) netClose();
  const n = S.team.map(byUid).filter(Boolean).length;
  showModal(`<h3>👥 친구 대전</h3>
    <p class="muted">방 코드로 친구와 연결해서 실시간으로 싸워요. 모험 탭의 <b>내 팀</b>(${n}마리)으로 싸워요.</p>
    ${n ? '' : '<p class="warn">먼저 모험 탭에서 팀을 짜 주세요!</p>'}
    <input id="pvpName" maxlength="10" value="${esc(S.nick || '')}" placeholder="내 이름 (상대에게 보여요)">
    <div class="row"><button class="btn big green" data-act="pvpRandom" ${n ? '' : 'disabled'}>🌍 모르는 사람과 랜덤 대전</button></div>
    <p class="muted">친구와 하려면 👇</p>
    <div class="row"><button class="btn big" data-act="pvpHost" ${n ? '' : 'disabled'}>🏠 방 만들기</button></div>
    <p class="muted">또는 친구가 알려 준 방 코드 입력</p>
    <input id="pvpCode" maxlength="6" placeholder="예: K7QM2P" style="text-transform:uppercase">
    <div class="row">
      <button class="btn green" data-act="pvpJoin" ${n ? '' : 'disabled'}>🔑 들어가기</button>
      <button class="btn ghost" data-act="close">닫기</button>
    </div>`);
}
function saveNick() {
  const el = $('#pvpName');
  if (el) S.nick = el.value.trim().slice(0, 10) || '플레이어';
  if (!S.nick) S.nick = '플레이어';
  save();
}
function pvpWaitModal(title, body) {
  showModal(`<h3>${title}</h3>${body}
    <div class="row"><button class="btn ghost" data-act="pvpCancel">취소</button></div>`);
}
function pvpHost(retry = 0) {
  saveNick();
  netClose();
  const code = pvpCode();
  const peer = new Peer(PVP_PREFIX + code);
  NET = { peer, role: 'host', code };
  pvpWaitModal('🏠 방을 만드는 중…', '<p class="muted">잠깐만 기다려 주세요</p>');
  peer.on('open', () => {
    pvpWaitModal('🏠 방을 만들었어요!', `<p class="muted">이 코드를 친구에게 알려 주세요</p>
      <div class="pvp-code">${code}</div>
      <div class="row"><button class="btn small" data-act="pvpCopy" data-code="${code}">📋 코드 복사</button></div>
      <p class="muted">친구가 들어오면 바로 대전이 시작돼요… ⏳</p>`);
  });
  peer.on('connection', (conn) => {
    if (NET && NET.conn) { conn.close(); return; }   // 한 명만
    NET.conn = conn;
    setupConn(conn);
  });
  peer.on('error', (e) => {
    if (e.type === 'unavailable-id' && retry < 3) { pvpHost(retry + 1); return; }
    toast('연결 오류: ' + e.type);
  });
}
function pvpJoin() {
  saveNick();
  const code = ($('#pvpCode') ? $('#pvpCode').value : '').trim().toUpperCase();
  if (!/^[A-Z0-9]{6}$/.test(code)) { toast('방 코드 6자리를 입력해 주세요'); return; }
  netClose();
  const peer = new Peer();
  NET = { peer, role: 'guest', code };
  pvpWaitModal('🔑 방에 들어가는 중…', `<p class="muted">코드 <b>${code}</b> 방을 찾고 있어요</p>`);
  peer.on('open', () => {
    const conn = peer.connect(PVP_PREFIX + code, { reliable: true });
    NET.conn = conn;
    setupConn(conn);
    setTimeout(() => { if (NET && NET.role === 'guest' && !NET.started && !(NET.conn && NET.conn.open)) { toast('방을 찾을 수 없어요. 코드를 확인해 주세요'); netClose(); openPvp(); } }, 12000);
  });
  peer.on('error', (e) => {
    toast(e.type === 'peer-unavailable' ? '방을 찾을 수 없어요. 코드를 확인해 주세요' : '연결 오류: ' + e.type);
    netClose();
  });
}
const RND_PREFIX = 'monhap-rnd1-', RND_SLOTS = 10, RND_HOST_WAIT = 30000, RND_MAX = 180000;
function pvpRandom() {
  saveNick();
  if (!S.team.map(byUid).filter(Boolean).length) { toast('먼저 모험 탭에서 팀을 짜 주세요!'); return; }
  netClose();
  NET = { random: true, role: null, t0: Date.now(), tries: 0 };
  rndWaitUI('상대를 찾는 중…');
  rndSearch();
}
function rndAlive(n) { return NET === n && !NET.started; }
function rndWaitUI(text) {
  const n = NET;
  if (!n || n.started) return;
  const sec = Math.floor((Date.now() - n.t0) / 1000);
  pvpWaitModal('🌍 랜덤 대전', `<div class="rnd-radar"><span>🔍</span></div>
    <p><b>${text}</b></p>
    <p class="muted" id="rndTime">${sec}초째 찾는 중 · 전 세계 몬스터 합치기 플레이어와 싸워요</p>`);
  clearInterval(n.uiTimer);
  n.uiTimer = setInterval(() => {
    if (NET !== n || n.started) { clearInterval(n.uiTimer); return; }
    const el = $('#rndTime');
    if (el) el.textContent = `${Math.floor((Date.now() - n.t0) / 1000)}초째 찾는 중 · 전 세계 몬스터 합치기 플레이어와 싸워요`;
    if (Date.now() - n.t0 > RND_MAX) { clearInterval(n.uiTimer); netClose(); closeModal(); toast('지금은 대전할 상대가 없어요. 조금 뒤에 다시 해 봐요!'); }
  }, 1000);
}
// 1단계: 기다리는 사람 찾기
function rndSearch() {
  const n = NET;
  if (!rndAlive(n)) return;
  try { n.peer && n.peer.destroy(); } catch (e) { /* 이미 닫힘 */ }
  n.role = 'guest';
  n.conn = null;
  n.empty = null;
  const peer = new Peer();
  n.peer = peer;
  let k = 0, timer = null;
  const next = () => {
    clearTimeout(timer);
    if (!rndAlive(n) || n.peer !== peer) return;
    try { n.conn && n.conn.close(); } catch (e) { /* 이미 닫힘 */ }
    n.conn = null;
    if (k >= RND_SLOTS) { rndHost(n.empty == null ? RND_SLOTS : n.empty); return; }   // 처음 본 빈 자리에서 기다리기
    const conn = peer.connect(RND_PREFIX + (k++), { reliable: true });
    n.conn = conn;
    timer = setTimeout(next, 9000);   // 대답이 없으면 다음 자리 (연결이 열리는 데 몇 초 걸릴 수 있다)
    conn.on('open', () => {
      if (!rndAlive(n) || n.conn !== conn) return;
      clearTimeout(timer);
      rndWaitUI('상대를 찾았어요! 연결하는 중…');
      netSend({ t: 'hello', name: S.nick || '플레이어', team: myTeamData() });
      timer = setTimeout(next, 8000);   // 상대가 대전을 시작하지 않으면(이미 다른 사람과 싸우는 중) 다음 자리
    });
    conn.on('data', (msg) => { if (n.conn === conn) { if (msg && msg.t === 'start') clearTimeout(timer); onNet(msg); } });
    conn.on('close', () => { if (n.conn !== conn) return; if (rndAlive(n)) next(); else onNetClose(); });
    conn.on('error', () => { if (n.conn === conn && rndAlive(n)) next(); });
  };
  peer.on('open', next);
  peer.on('error', (e) => {
    if (n.peer !== peer || !rndAlive(n)) return;
    if (e.type === 'peer-unavailable') { if (n.empty == null) n.empty = k - 1; next(); }   // 그 자리엔 아무도 없음
    else { toast('연결 오류: ' + e.type); netClose(); closeModal(); }
  });
}
// 2단계: 빈 자리를 맡아서 기다리기
function rndHost(k) {
  const n = NET;
  if (!rndAlive(n)) return;
  try { n.peer && n.peer.destroy(); } catch (e) { /* 이미 닫힘 */ }
  if (k >= RND_SLOTS) { setTimeout(rndSearch, 1500); return; }
  n.role = 'host';
  n.conn = null;
  const peer = new Peer(RND_PREFIX + k);
  n.peer = peer;
  peer.on('open', () => {
    if (n.peer !== peer || !rndAlive(n)) return;
    rndWaitUI('상대가 들어오기를 기다리는 중…');
    // 오래 기다려도 안 오면: 다른 자리에서 기다리는 사람이 있을 수 있으니 다시 찾기
    n.hostTimer = setTimeout(() => { if (n.peer === peer && rndAlive(n) && !n.conn) rndSearch(); }, RND_HOST_WAIT + Math.random() * 5000);
  });
  peer.on('connection', (conn) => {
    if (n.peer !== peer || !rndAlive(n) || n.conn) { conn.on('open', () => conn.close()); return; }   // 이미 상대가 있음
    clearTimeout(n.hostTimer);
    n.conn = conn;
    // 연결이 중간에 멈추면(12초 동안 안 열리면) 버리고 다시 기다린다
    setTimeout(() => { if (n.conn === conn && !conn.open && rndAlive(n)) { try { conn.close(); } catch (e) { /* 이미 닫힘 */ } n.conn = null; rndWaitUI('상대가 들어오기를 기다리는 중…'); } }, 12000);
    conn.on('open', () => { netSend({ t: 'hello', name: S.nick || '플레이어', team: myTeamData() }); });
    conn.on('data', onNet);
    conn.on('close', () => {
      if (n.conn !== conn) return;
      if (rndAlive(n)) { n.conn = null; rndWaitUI('상대가 나갔어요. 다시 기다리는 중…'); } else onNetClose();
    });
    conn.on('error', () => {});
  });
  peer.on('error', (e) => {
    if (n.peer !== peer || !rndAlive(n)) return;
    if (e.type === 'unavailable-id') {
      // 누가 먼저 이 자리를 맡았다 → 그 사람과 붙을 수 있게 다시 찾기
      setTimeout(rndSearch, 300 + Math.random() * 700);
    } else { toast('연결 오류: ' + e.type); netClose(); closeModal(); }
  });
}

function setupConn(conn) {
  conn.on('open', () => {
    netSend({ t: 'hello', name: S.nick || '플레이어', team: myTeamData() });
    pvpWaitModal('🤝 연결됐어요!', '<p class="muted">대전을 준비하는 중…</p>');
  });
  conn.on('data', onNet);
  conn.on('close', onNetClose);
  conn.on('error', () => onNetClose());
}
function onNetClose() {
  if (!NET) return;
  NET = null;
  if (B && B.pvp && !B.over) {
    B.over = true;
    B.waiting = false;
    clearTimeout(B.timer);
    B.result = { win: true, rewards: [B.pvp.random ? '상대가 나갔어요' : '친구가 나갔어요', ...(B.pvp.random ? pvpTrophy(true) : [])] };
    save();
    drawBattle();
  } else if (!B) {
    closeModal();
    toast('친구와 연결이 끊겼어요');
  }
}

function onNet(msg) {
  if (!msg || typeof msg !== 'object' || !NET) return;
  switch (msg.t) {
    case 'hello':
      NET.oppName = esc(String(msg.name || '친구').slice(0, 10));
      NET.oppTeam = Array.isArray(msg.team) ? msg.team.slice(0, 3) : [];
      if (NET.role === 'host' && !NET.started) startPvpBattle();
      break;
    case 'start': if (NET.role === 'guest') startPvpGuest(msg); break;
    case 'state': if (NET.role === 'guest') applyPvpState(msg); break;
    case 'skill': if (NET.role === 'guest') playPvpSkill(msg); break;
    case 'act': if (NET.role === 'host') remoteAct(msg); break;
    case 'end':
      if (NET.role === 'guest' && B && B.pvp && !B.over) {
        const win = !msg.hostWin;
        B.over = true;
        B.waiting = false;
        const rewards = [];
        if (win) { earn(PVP_REWARD.gold); earn(PVP_REWARD.gems, 'gems'); rewards.push(`💰 ${fmt(PVP_REWARD.gold)}`, `💎 ${PVP_REWARD.gems}`); }
        if (B.pvp.random) rewards.push(...pvpTrophy(win));
        B.result = { win, rewards };
        save();
        drawBattle();
        updateHud();
      }
      break;
    case 'bye': onNetClose(); break;
  }
}

// 방장: 전투 시작
function startPvpBattle() {
  const mine = S.team.map(byUid).filter(Boolean).slice(0, 3);
  const opp = NET.oppTeam.map((d, k) => netUnit(d, 'foe', k)).filter(Boolean);
  if (!mine.length || !opp.length) { toast('양쪽 모두 팀이 있어야 해요'); netSend({ t: 'bye' }); netClose(); closeModal(); return; }
  NET.started = true;
  clearInterval(NET.uiTimer);
  clearTimeout(NET.hostTimer);
  closeModal();
  B = {
    stage: S.stage, pvp: { role: 'host', oppName: NET.oppName, random: !!NET.random },
    units: [...mine.map((m, k) => mkUnit(m, 'me', k)), ...opp.map((u, k) => ({ ...u, id: 'foe' + k }))],
    order: [], cur: null, target: 'foe0', log: [], round: 0, remoteTurn: null,
    waiting: false, over: false, fast: false, timer: null, result: null, built: false,
  };
  $('#battle').classList.remove('hidden');
  updateGuide();
  logB(`👥 ${NET.oppName}와(과)의 대전 시작!`);
  netSend({ t: 'start', name: S.nick || '플레이어', units: B.units.map(u => ({ id: u.id, side: u.side, type: u.c.id, lv: u.lv, hp: u.maxHp, atk: u.atk, spd: u.spd })) });
  drawBattle();
  later(nextTurn, 1200);
}
function askRemote(u) {
  B.remoteTurn = u.id;
  B.waiting = false;
  drawBattle();
}
function remoteAct(msg) {
  if (!B || B.over || !B.remoteTurn) return;
  const u = unitById(B.remoteTurn);
  const sk = u && u.c.skills[Number(msg.i)];
  if (!u || !sk || sk.cost > u.sta) return;
  let tgt = unitById(msg.target);
  if (!tgt || tgt.side !== 'me' || tgt.hp <= 0) tgt = aliveOf('me')[0];
  B.remoteTurn = null;
  useSkill(u, sk, tgt);
}
function sendPvpState() {
  netSend({
    t: 'state', round: B.round, cur: B.cur && B.cur.id, remote: B.remoteTurn || null, log: B.log.slice(-4),
    units: B.units.map(u => ({ id: u.id, hp: u.hp, dispHp: u.dispHp, sta: u.sta, fx: u.fx, shownDead: u.shownDead })),
  });
}

// 친구: 방장이 보낸 정보로 전투 화면 만들기 (편을 뒤집어서)
function startPvpGuest(msg) {
  if (!Array.isArray(msg.units)) return;
  NET.started = true;
  clearInterval(NET.uiTimer);
  NET.oppName = esc(String(msg.name || NET.oppName || '친구').slice(0, 10));
  closeModal();
  B = {
    stage: S.stage, pvp: { role: 'guest', oppName: NET.oppName, random: !!NET.random }, anim: 0,
    units: msg.units.map((d, k) => { const side = d.side === 'me' ? 'foe' : 'me'; const u = netUnit(d, side, 0); if (u) u.id = flipId(d.id); return u; }).filter(Boolean),
    order: [], cur: null, target: 'foe0', log: [`👥 ${NET.oppName}와(과)의 대전 시작!`], round: 0,
    waiting: false, over: false, fast: false, timer: null, result: null, built: false,
  };
  $('#battle').classList.remove('hidden');
  updateGuide();
  drawBattle();
}
function applyPvpState(msg) {
  if (!B || !B.pvp || B.over) return;
  (msg.units || []).forEach(su => {
    const u = unitById(flipId(su.id));
    if (!u) return;
    u.hp = su.hp;
    u.sta = su.sta;
    u.fx = su.fx || newFx();
    if (!B.anim) u.dispHp = su.dispHp;
    if (su.shownDead) u.shownDead = true;
  });
  B.round = msg.round || 0;
  B.log = Array.isArray(msg.log) ? msg.log.map(String) : B.log;
  B.cur = unitById(flipId(msg.cur)) || null;
  B.waiting = !!msg.remote && B.cur && B.cur.side === 'me';
  if (B.waiting) { const t = unitById(B.target); if (!t || t.hp <= 0) { const f = aliveOf('foe')[0]; if (f) B.target = f.id; } }
  drawBattle();
}
function playPvpSkill(msg) {
  if (!B || !B.pvp) return;
  const att = unitById(flipId(msg.att));
  const sk = att && att.c.skills[Number(msg.sk)];
  if (!att || !sk) return;
  const events = (msg.events || []).map(e => ({ ...e, t: unitById(flipId(e.t)) })).filter(e => e.t);
  B.anim++;
  playSkill(att, sk, events).finally(() => { if (B) B.anim = Math.max(0, B.anim - 1); });
}

// ===================== 코드로 선물·섬 주고받기 =====================
// 코드 = 접두어 + 압축 여부(0/1) + base64url(내용) + '.' + 검사 값 (잘못 복사하면 알아챈다)
const GIFT_PREFIX = 'MHG1', ISLE_PREFIX = 'MHI1';
const b64u = (bytes) => { let bin = ''; for (let k = 0; k < bytes.length; k += 8192) bin += String.fromCharCode.apply(null, bytes.subarray(k, k + 8192)); return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
const unb64u = (t) => { const bin = atob(t.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((t.length + 3) % 4)); const out = new Uint8Array(bin.length); for (let k = 0; k < bin.length; k++) out[k] = bin.charCodeAt(k); return out; };
const codeSum = (json) => (hashStr(json) % 46656).toString(36);
async function packCode(prefix, obj) {
  const json = JSON.stringify(obj);
  let bytes = new TextEncoder().encode(json), z = '0';
  if (window.CompressionStream) {
    bytes = new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate-raw'))).arrayBuffer());
    z = '1';
  }
  return `${prefix}${z}${b64u(bytes)}.${codeSum(json)}`;
}
async function unpackCode(prefix, code) {
  code = String(code || '').replace(/\s+/g, '');
  if (!code.startsWith(prefix)) throw new Error('kind');
  const body = code.slice(prefix.length), z = body[0];
  const [data, sum] = body.slice(1).split('.');
  let bytes = unb64u(data || '');
  if (z === '1') bytes = new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer());
  const json = new TextDecoder().decode(bytes);
  if (codeSum(json) !== sum) throw new Error('sum');
  return JSON.parse(json);
}
function myPlayerId() {
  if (!S.playerId) { S.playerId = Math.random().toString(36).slice(2, 10) + Date.now().toString(36); save(); }
  return S.playerId;
}
// 짧은 코드: 보내는 쪽이 창을 열어 둔 동안 4자리 숫자로 친구가 인터넷을 통해 바로 받아 간다 (PeerJS)
const SHORT_PREFIX = 'monhap-x-';
let SHARE = null;   // { peer, code, long, once, done, undo }
function stopShare() {
  const sh = SHARE;
  SHARE = null;
  try { sh && sh.peer && sh.peer.destroy(); } catch (e) { /* 이미 닫힘 */ }
}
function setShareStatus(html) { const el = $('#shareStatus'); if (el) el.innerHTML = html; }
function startShare(long, once, retry = 0) {
  if (!window.Peer || !navigator.onLine) { setShareStatus('📴 지금은 인터넷이 안 돼서 짧은 코드를 쓸 수 없어요. 아래 긴 코드를 보내 주세요'); return; }
  const code = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  const peer = new Peer(SHORT_PREFIX + code);
  SHARE = { peer, code, long, once, done: false, undo: SHARE && SHARE.undo };
  const mine = SHARE;
  peer.on('open', () => {
    if (SHARE !== mine) return;
    const el = $('#shortCode');
    if (el) el.textContent = code;
    setShareStatus('📡 친구가 이 숫자를 넣을 때까지 <b>이 창을 열어 두세요</b>');
  });
  peer.on('connection', (conn) => {
    conn.on('open', () => {
      if (SHARE !== mine || mine.done) { conn.close(); return; }
      conn.send({ t: 'code', code: long });
      if (mine.once) {
        mine.done = true;
        setShareStatus('✅ 친구가 받아 갔어요!');
        const u = $('#giftUndo');
        if (u) u.remove();
        toast('✅ 친구가 받아 갔어요!');
        setTimeout(() => { if (SHARE === mine) stopShare(); }, 1500);
      } else {
        toast('👀 친구가 내 섬 코드를 받아 갔어요');
      }
    });
  });
  peer.on('error', (e) => {
    if (SHARE !== mine) return;
    if (e.type === 'unavailable-id' && retry < 5) { stopShare(); SHARE = { undo: mine.undo }; startShare(long, once, retry + 1); return; }
    setShareStatus('⚠️ 짧은 코드를 만들지 못했어요. 아래 긴 코드를 보내 주세요');
  });
}
// 받는 쪽: 4자리 숫자면 인터넷으로 긴 코드를 받아 오고, 긴 코드면 그대로
function resolveCode(input) {
  const t = String(input || '').trim();
  if (!/^\d{4}$/.test(t)) return Promise.resolve(t);
  if (!window.Peer || !navigator.onLine) return Promise.reject(new Error('offline'));
  toast('📡 코드를 받아 오는 중…');
  return new Promise((resolve, reject) => {
    const peer = new Peer();
    let finished = false;
    const end = (fn, v) => { if (finished) return; finished = true; try { peer.destroy(); } catch (e) { /* 닫힘 */ } fn(v); };
    setTimeout(() => end(reject, new Error('timeout')), 12000);
    peer.on('open', () => {
      const conn = peer.connect(SHORT_PREFIX + t, { reliable: true });
      conn.on('data', (d) => { if (d && d.t === 'code') end(resolve, String(d.code)); });
      conn.on('error', () => end(reject, new Error('conn')));
    });
    peer.on('error', (e) => end(reject, new Error(e.type || 'peer')));
  });
}
function shortCodeFail(e) {
  toast(e && e.message === 'offline' ? '📴 인터넷이 안 돼서 4자리 코드를 쓸 수 없어요. 긴 코드를 받아 주세요'
    : '❌ 그 숫자 코드를 찾을 수 없어요. 보내는 사람이 코드 창을 열어 두었는지 확인해 주세요');
}
function codeBox(title, code, note, opts = {}) {
  stopShare();
  showModal(`<h3>${title}</h3>
    <p class="muted">${note}</p>
    <div class="short-code" id="shortCode">····</div>
    <p class="muted small-note" id="shareStatus">📡 짧은 코드를 만드는 중…</p>
    ${opts.undo ? '<div class="row"><button class="btn ghost small" id="giftUndo" data-act="giftUndo">↩️ 선물 취소 (돌려받기)</button></div>' : ''}
    <details class="long-code">
      <summary>📄 긴 코드 (인터넷 없이 보낼 때)</summary>
      <textarea class="code-box" readonly>${esc(code)}</textarea>
      <div class="row"><button class="btn small" data-act="copyCode">📋 긴 코드 복사</button></div>
    </details>
    <div class="row"><button class="btn ghost" data-act="close">닫기</button></div>`);
  SHARE = { undo: opts.undo || null };
  startShare(code, opts.once !== false);
}

// ----- 선물 보내기 -----
let giftTab = 'mon';
function openGiftSend(kind = giftTab) {
  tutFlag('friends', true);
  giftTab = kind;
  const chip = (k, label) => `<button class="chip ${giftTab === k ? 'on' : ''}" data-act="giftSend" data-k="${k}">${label}</button>`;
  let body = '';
  if (kind === 'mon') {
    const list = sortMons(S.monsters.filter(m => !S.team.includes(m.uid)));
    body = list.length
      ? `<p class="muted">보낼 몬스터를 눌러요. (모험 팀 몬스터는 보낼 수 없어요)</p>
         <div class="grid small">${list.map(m => card(m, `data-act="giftMon" data-uid="${m.uid}"`)).join('')}</div>`
      : '<p class="muted">보낼 수 있는 몬스터가 없어요.</p>';
  } else if (kind === 'res') {
    body = `<p class="muted">보낼 양을 적어요. 보낸 만큼 내 쪽에서 빠져요.</p>
      <div class="gift-res">
        <label>💰 골드 <input id="gGold" type="number" min="0" placeholder="0"></label>
        <label>💎 보석 <input id="gGems" type="number" min="0" placeholder="0"></label>
        <label>🍖 먹이 <input id="gFood" type="number" min="0" placeholder="0"></label>
      </div>
      <div class="row"><button class="btn big" data-act="giftRes">🎁 선물 코드 만들기</button></div>`;
  } else {
    const free = S.runes.filter(r => r.on == null).sort((a, b) => b.lv - a.lv);
    body = free.length
      ? `<p class="muted">보낼 룬을 눌러요. (끼워 둔 룬은 보낼 수 없어요)</p>
         <div class="build-list">${free.map(r => `<button class="build-opt" data-act="giftRune" data-rid="${r.id}" style="--hc:#c28cff"><span class="bo-nm">${runeText(r)}</span></button>`).join('')}</div>`
      : '<p class="muted">보낼 수 있는 룬이 없어요.</p>';
  }
  showModal(`<h3>🎁 선물 보내기</h3>
    <div class="chips">${chip('mon', '🐾 몬스터')}${chip('res', '💰 골드·보석·먹이')}${chip('rune', '💠 룬')}</div>
    ${body}
    <div class="row"><button class="btn ghost small" data-act="close">닫기</button></div>`);
}
async function makeGift(kind, data, label, undo) {
  const payload = { v: 1, g: kind, d: data, from: S.nick || '친구', pid: myPlayerId(), id: Math.random().toString(36).slice(2) + Date.now().toString(36) };
  const code = await packCode(GIFT_PREFIX, payload);
  save();
  render();
  codeBox('🎁 선물 코드', code, `<b>${label}</b>을(를) 담았어요. 아래 <b>4자리 숫자</b>를 친구에게 알려 주면, 친구가 📥 선물 받기에 넣어서 받아요. (한 번만 받을 수 있어요)`,
    { once: true, undo: undo ? () => { undo(); S.usedGifts = S.usedGifts || []; S.usedGifts.push(payload.id); save(); render(); updateHud(); } : null });
}
function giftMon(uid) {
  const m = byUid(uid);
  if (!m || S.team.includes(m.uid)) return;
  if (!confirm(`${CAT[m.type].name} Lv.${m.lv}을(를) 선물로 보낼까요? 내 몬스터에서 빠져요.`)) return;
  m.runes.forEach(id => { const r = S.runes.find(x => x.id === id); if (r) r.on = null; });
  S.monsters = S.monsters.filter(x => x.uid !== m.uid);
  sel = sel.filter(u => u !== m.uid);
  delete walkers[m.uid];
  makeGift('mon', { type: m.type, lv: m.lv }, `${CAT[m.type].face} ${CAT[m.type].name} Lv.${m.lv}`,
    () => { if (habsFor(m.type).some(h => h.i === m.hab) || (S.plots[m.hab] && habMons(m.hab).length < habCap(m.hab))) S.monsters.push({ ...m, runes: [null, null] }); else (S.giftBox = S.giftBox || []).push({ type: m.type, lv: m.lv }); });
}
function giftRes() {
  const num = (id) => Math.max(0, Math.floor(Number(($(id) || {}).value) || 0));
  const gold = num('#gGold'), gems = num('#gGems'), food = num('#gFood');
  if (!gold && !gems && !food) { toast('보낼 양을 적어 주세요'); return; }
  if (!S.infinite && (gold > S.gold || gems > S.gems)) { toast('가진 것보다 많이 보낼 수 없어요'); return; }
  if (food > S.food) { toast('먹이가 부족해요'); return; }
  if (!S.infinite) { S.gold -= gold; S.gems -= gems; }
  S.food -= food;
  updateHud();
  makeGift('res', { gold, gems, food }, [gold && `💰${fmt(gold)}`, gems && `💎${fmt(gems)}`, food && `🍖${fmt(food)}`].filter(Boolean).join(' '),
    () => { earn(gold); earn(gems, 'gems'); S.food += food; });
}
function giftRune(rid) {
  const r = S.runes.find(x => x.id === Number(rid));
  if (!r || r.on != null) return;
  S.runes = S.runes.filter(x => x.id !== r.id);
  makeGift('rune', { t: r.t, lv: r.lv }, runeText(r), () => { S.runes.push({ ...r, on: null }); });
}

// ----- 선물 받기 -----
function giftBoxHTML() {
  const box = S.giftBox || [];
  if (!box.length) return '';
  return `<h4 class="sub">📦 선물 보관함 <small class="muted">서식지에 자리가 생기면 보내요</small></h4>
    <div class="grid small">${box.map((g, k) => card({ type: g.type, lv: g.lv }, `data-act="giftPlace" data-k="${k}"`, 'mini')).join('')}</div>`;
}
function openGiftRecv() {
  tutFlag('friends', true);
  showModal(`<h3>📥 선물 받기</h3>
    <p class="muted">친구가 알려 준 <b>4자리 숫자</b>(또는 긴 코드)를 넣어요.</p>
    <textarea id="giftCode" class="code-box" placeholder="4자리 숫자 (예: 0427) 또는 긴 코드"></textarea>
    <div class="row"><button class="btn big green" data-act="giftRecvOk">🎁 받기</button><button class="btn ghost" data-act="close">닫기</button></div>
    ${giftBoxHTML()}`);
}
function placeGiftMon(type, lv) {
  const h = habsFor(type)[0];
  S.dex[type] = true;
  if (!h) { (S.giftBox = S.giftBox || []).push({ type, lv }); return false; }
  S.monsters.push({ uid: S.nextUid++, type, lv, hab: h.i, runes: [null, null] });
  return true;
}
async function giftRecvOk() {
  let g;
  let raw;
  try { raw = await resolveCode($('#giftCode').value); } catch (e) { shortCodeFail(e); return; }
  try { g = await unpackCode(GIFT_PREFIX, raw); } catch (e) { toast('❌ 올바른 선물 코드가 아니에요. 전부 복사했는지 확인해 주세요'); return; }
  if (!g || g.v !== 1 || !g.id) { toast('❌ 올바른 선물 코드가 아니에요'); return; }
  if (g.pid === myPlayerId()) { toast('내가 만든 선물은 내가 받을 수 없어요'); return; }
  S.usedGifts = S.usedGifts || [];
  if (S.usedGifts.includes(g.id)) { toast('이미 받은 선물이에요'); return; }
  const from = esc(String(g.from || '친구').slice(0, 10));
  let got = '';
  if (g.g === 'mon' && g.d && CAT[g.d.type]) {
    const lv = Math.max(1, Math.min(MAX_LV, Math.floor(g.d.lv) || 1));
    const placed = placeGiftMon(g.d.type, lv);
    got = `${CAT[g.d.type].face} ${CAT[g.d.type].name} Lv.${lv}${placed ? '' : ' (서식지에 자리가 없어서 📦 보관함으로)'}`;
  } else if (g.g === 'res' && g.d) {
    const n = (v) => Math.max(0, Math.min(1e13, Math.floor(Number(v) || 0)));
    earn(n(g.d.gold)); earn(n(g.d.gems), 'gems'); S.food += n(g.d.food);
    got = [n(g.d.gold) && `💰${fmt(n(g.d.gold))}`, n(g.d.gems) && `💎${fmt(n(g.d.gems))}`, n(g.d.food) && `🍖${fmt(n(g.d.food))}`].filter(Boolean).join(' ');
  } else if (g.g === 'rune' && g.d && RUNE[g.d.t]) {
    const r = { id: S.nextRune++, t: g.d.t, lv: Math.max(1, Math.min(3, Math.floor(g.d.lv) || 1)), on: null };
    S.runes.push(r);
    got = runeText(r);
  } else { toast('❌ 알 수 없는 선물이에요'); return; }
  S.usedGifts.push(g.id);
  if (S.usedGifts.length > 500) S.usedGifts = S.usedGifts.slice(-500);
  save();
  updateHud();
  render();
  showModal(`<div class="reveal"><div class="egg-big">🎁</div><h3>${from}님의 선물!</h3><p>${got}</p>
    <div class="row"><button class="btn" data-act="close">고마워!</button></div></div>`);
}
function giftPlace(k) {
  const box = S.giftBox || [], g = box[Number(k)];
  if (!g) return;
  const h = habsFor(g.type)[0];
  if (!h) { toast('살 수 있는 빈 서식지가 없어요. 서식지를 짓거나 업그레이드해 주세요'); return; }
  box.splice(Number(k), 1);
  S.monsters.push({ uid: S.nextUid++, type: g.type, lv: g.lv, hab: h.i, runes: [null, null] });
  save();
  toast(`${CAT[g.type].face} ${CAT[g.type].name}이(가) ${habName(S.plots[h.i].el)}으로 이사했어요!`);
  render();
  openGiftRecv();
}

// ----- 섬 코드 / 친구 섬 구경 -----
async function openIslandShare() {
  tutFlag('friends', true);
  const plots = [];
  S.plots.forEach((p, i) => {
    if (!p) return;
    if (p.kind === 'hab') plots.push([i, 'h', p.el, p.lv]);
    else if (p.kind === 'farm') plots.push([i, 'f', p.crop ?? p.lastCrop ?? null]);
    else if (p.kind === 'mountain') plots.push([i, 'm', p.lv || 1]);
    else if (p.kind === 'hatchery') plots.push([i, 'c', p.cap || HATCH_CAP, p.lv || 1]);
    else if (p.kind === 'deco') plots.push([i, 'd', p.id]);
  });
  const payload = { v: 1, nick: S.nick || '친구', isl: S.isl || 0, plots, mons: S.monsters.map(m => [m.hab, m.type, m.lv]), dex: Object.keys(S.dex).length };
  const code = await packCode(ISLE_PREFIX, payload);
  codeBox('🏝️ 내 섬 코드', code, `아래 <b>4자리 숫자</b>를 친구에게 알려 주면, 친구가 👀 친구 섬 구경에 넣어서 내 섬 ${ISLANDS.length}개를 구경해요. 창을 열어 둔 동안 여러 친구가 받아 갈 수 있어요.`, { once: false });
}
function openVisit() {
  tutFlag('friends', true);
  showModal(`<h3>👀 친구 섬 구경</h3>
    <p class="muted">친구가 알려 준 <b>4자리 숫자</b>(또는 긴 코드)를 넣어요.</p>
    <textarea id="isleCode" class="code-box" placeholder="4자리 숫자 (예: 0427) 또는 긴 코드"></textarea>
    <div class="row"><button class="btn big green" data-act="visitOk">👀 구경하기</button><button class="btn ghost" data-act="close">닫기</button></div>`);
}
var VISIT = null;       // { nick, real: 내 저장 상태 } (var: 파일 앞쪽 save()에서도 읽을 수 있게)
const VISIT_OK = new Set(['isl', 'islList', 'islGo', 'visitExit', 'zoomIn', 'zoomOut', 'hideUI', 'close', 'copyCode']);
async function visitOk() {
  let d;
  let raw;
  try { raw = await resolveCode($('#isleCode').value); } catch (e) { shortCodeFail(e); return; }
  try { d = await unpackCode(ISLE_PREFIX, raw); } catch (e) { toast('❌ 올바른 섬 코드가 아니에요. 전부 복사했는지 확인해 주세요'); return; }
  if (!d || d.v !== 1 || !Array.isArray(d.plots)) { toast('❌ 올바른 섬 코드가 아니에요'); return; }
  const plots = Array(PLOTS).fill(null);
  const n = (v, lo, hi) => Math.max(lo, Math.min(hi, Math.floor(Number(v)) || lo));
  d.plots.forEach(([i, k, a, b]) => {
    i = Number(i);
    if (!(i >= 0 && i < PLOTS)) return;
    if (k === 'h' && (a === 'legend' || ELI[a] != null)) plots[i] = { kind: 'hab', el: a, lv: n(b, 1, HAB_MAX_LV), gold: 0 };
    else if (k === 'f') plots[i] = { kind: 'farm', crop: CROPS[a] ? Number(a) : null, lastCrop: null, end: 0 };
    else if (k === 'm') plots[i] = { kind: 'mountain', lv: n(a, 1, 50), breeds: [] };
    else if (k === 'c') plots[i] = { kind: 'hatchery', cap: n(a, 1, 999), lv: n(b, 1, 50), incs: [] };
    else if (k === 'd' && decoById(a)) plots[i] = { kind: 'deco', id: a };
  });
  let uid = 1e7;
  const mons = (d.mons || []).filter(([h, t]) => CAT[t] && plots[h] && plots[h].kind === 'hab')
    .map(([h, t, lv]) => ({ uid: uid++, type: t, lv: n(lv, 1, MAX_LV), hab: Number(h), runes: [null, null] }));
  const real = S;
  VISIT = { nick: esc(String(d.nick || '친구').slice(0, 10)), real, count: mons.length, dex: n(d.dex, 0, 1e5) };
  S = { ...real, plots, monsters: mons, hatch: [], team: [], isl: n(d.isl, 0, ISLANDS.length - 1), tutOff: true, hideUI: false, breedLog: [], giftBox: [] };
  Object.keys(walkers).forEach(k => delete walkers[k]);
  closeModal();
  tab = 'island';
  document.body.classList.add('visiting');
  render();
  renderVisitBar();
  toast(`👀 ${VISIT.nick}님의 섬에 놀러 왔어요!`);
}
function renderVisitBar() {
  const bar = $('#visitBar');
  if (!bar) return;
  bar.classList.toggle('hidden', !VISIT);
  if (VISIT) bar.innerHTML = `👀 <b>${VISIT.nick}</b>님의 섬 · 몬스터 ${fmt(VISIT.count)}마리 · 도감 ${fmt(VISIT.dex)} <button class="btn small" data-act="visitExit">🏠 내 섬으로</button>`;
}
function visitTap(i) {
  const p = i >= 0 ? S.plots[i] : null;
  if (!p) return;
  const name = p.kind === 'hab' ? `${habName(p.el)} Lv.${p.lv} · 몬스터 ${habMons(i).map(m => CAT[m.type].face).join('')}`
    : p.kind === 'mountain' ? '🏔️ 교배산' : p.kind === 'hatchery' ? '🪺 부화장' : p.kind === 'farm' ? '🌾 농장' : `${(decoById(p.id) || {}).emoji || ''} ${(decoById(p.id) || {}).name || '장식'}`;
  toast(name);
}
function visitExit() {
  if (!VISIT) return;
  S = VISIT.real;
  VISIT = null;
  Object.keys(walkers).forEach(k => delete walkers[k]);
  document.body.classList.remove('visiting');
  closeModal();
  render();
  renderVisitBar();
  toast('🏠 내 섬으로 돌아왔어요');
}

// ===================== 계정 =====================
const pinHash = (id, pin) => hashStr(`pin:${id}:${pin}`).toString(36);
function accSummary(a) {
  try {
    const d = JSON.parse(lsGet(accKey(a.id)));
    if (!d) return '새 섬';
    return `몬스터 ${fmt((d.monsters || []).length)} · 도감 ${fmt(Object.keys(d.dex || {}).length)} · 💰${d.infinite ? '∞' : fmt(d.gold || 0)}`;
  } catch (e) { return '새 섬'; }
}
function openLogin() {
  const list = accounts();
  const el = $('#login');
  el.innerHTML = `<div class="login-box">
    <div class="login-logo"><img src="icon.svg" alt=""><br>몬스터 합치기</div>
    <p class="muted">어느 계정으로 들어갈까요?</p>
    <div class="acc-list">${list.map(a => `
      <div class="acc-row">
        <button class="acc-card ${ACC && a.id === ACC.id ? 'on' : ''}" data-act="accPick" data-id="${a.id}">
          <span class="acc-icon">👤</span>
          <span class="acc-nm">${esc(a.name)} ${a.pin ? '🔒' : ''}<small>${accSummary(a)}</small></span>
        </button>
        <button class="btn ghost small danger" data-act="accDel" data-id="${a.id}" title="계정 삭제">🗑️</button>
      </div>`).join('')}</div>
    <div class="row">
      <button class="btn" data-act="accNew">➕ 새 계정 만들기</button>
      <button class="btn ghost" data-act="accImport">📥 다른 기기에서 가져오기</button>
    </div>
    <p class="muted small-note">계정은 이 기기(브라우저)에 저장돼요. 다른 기기로 옮기려면 게임 안 👤 메뉴의 📤 옮기기 코드를 쓰세요.</p>
  </div>`;
  el.classList.remove('hidden');
}
function closeLogin() { $('#login').classList.add('hidden'); }
function accPick(id) {
  const a = accounts().find(x => x.id === id);
  if (!a) return;
  if (!a.pin) { enterAccount(a); return; }
  showModal(`<h3>🔒 ${esc(a.name)}</h3>
    <p class="muted">비밀번호 4자리를 입력해요</p>
    <input id="accPin" type="password" inputmode="numeric" maxlength="4" autocomplete="off" placeholder="••••">
    <div class="row"><button class="btn" data-act="accPinOk" data-id="${a.id}">들어가기</button><button class="btn ghost" data-act="close">취소</button></div>`);
  const inp = $('#accPin');
  inp.focus();
  inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') accPinOk(a.id); });
}
function accPinOk(id) {
  const a = accounts().find(x => x.id === id);
  const pin = ($('#accPin') || {}).value || '';
  if (!a || pinHash(a.id, pin) !== a.pin) { toast('❌ 비밀번호가 달라요'); return; }
  closeModal();
  enterAccount(a);
}
// 계정으로 들어가기: 지금 섬을 저장하고, 그 계정의 섬을 불러온다
function enterAccount(a) {
  if (VISIT) visitExit();
  if (B) { clearTimeout(B.timer); if (B.pvp) { netSend({ t: 'bye' }); netClose(); } B = null; $('#battle').classList.add('hidden'); }
  if (ACC && S) save();
  ACC = a;
  lsSet(ACC_CUR, a.id);
  S = load() || newState();
  if (!S.nick) S.nick = a.name;
  sel = [];
  tab = 'island';
  Object.keys(walkers).forEach(k => delete walkers[k]);
  closeModal();
  closeLogin();
  render();
  save();
  toast(`👤 ${a.name}님, 어서 와요!`);
  setTimeout(afterEnter, 400);
}
function openAccNew() {
  showModal(`<h3>➕ 새 계정</h3>
    <p class="muted">새 계정은 빈 섬에서 시작해요.</p>
    <input id="accName" maxlength="10" placeholder="이름 (예: 진희)">
    <input id="accNewPin" type="password" inputmode="numeric" maxlength="4" autocomplete="off" placeholder="비밀번호 4자리 (없어도 돼요)">
    <div class="row"><button class="btn big" data-act="accNewOk">만들기</button><button class="btn ghost" data-act="close">취소</button></div>`);
  $('#accName').focus();
}
function accNewOk() {
  const name = ($('#accName').value || '').trim().slice(0, 10);
  const pin = ($('#accNewPin').value || '').trim();
  if (!name) { toast('이름을 적어 주세요'); return; }
  if (pin && !/^\d{4}$/.test(pin)) { toast('비밀번호는 숫자 4자리예요'); return; }
  const list = accounts();
  if (list.some(a => a.name === name)) { toast('같은 이름의 계정이 이미 있어요'); return; }
  const a = { id: newAccId(), name, pin: null, created: Date.now() };
  if (pin) a.pin = pinHash(a.id, pin);
  list.push(a);
  saveAccounts(list);
  enterAccount(a);
}
function accDel(id) {
  const list = accounts(), a = list.find(x => x.id === id);
  if (!a) return;
  if (list.length <= 1) { toast('계정이 하나뿐이라 지울 수 없어요'); return; }
  if (!confirm(`${a.name} 계정을 지울까요? 이 계정의 섬과 몬스터가 모두 사라져요.`)) return;
  if (!confirm('정말 지울까요? 되돌릴 수 없어요.')) return;
  lsDel(accKey(id));
  const rest = list.filter(x => x.id !== id);
  saveAccounts(rest);
  if (ACC && ACC.id === id) { ACC = rest[0]; lsSet(ACC_CUR, ACC.id); S = load() || newState(); render(); }
  toast(`🗑️ ${a.name} 계정을 지웠어요`);
  openLogin();
}
function openAccImport() {
  showModal(`<h3>📥 다른 기기에서 가져오기</h3>
    <p class="muted">다른 기기의 👤 메뉴 → 📤 옮기기 코드에 나온 <b>4자리 숫자</b>(또는 긴 코드)를 넣어요.</p>
    <textarea id="accCode" class="code-box" placeholder="4자리 숫자 (예: 0427) 또는 긴 코드"></textarea>
    <div class="row"><button class="btn big green" data-act="accImportOk">가져오기</button><button class="btn ghost" data-act="close">취소</button></div>`);
}
async function accImportOk() {
  let d;
  let raw;
  try { raw = await resolveCode($('#accCode').value); } catch (e) { shortCodeFail(e); return; }
  try { d = await unpackCode('MHS1', raw); } catch (e) { toast('❌ 올바른 옮기기 코드가 아니에요. 전부 복사했는지 확인해 주세요'); return; }
  if (!d || d.v !== 1 || !d.save || !Array.isArray(d.save.plots)) { toast('❌ 올바른 옮기기 코드가 아니에요'); return; }
  const list = accounts();
  let name = String(d.name || '가져온 섬').slice(0, 10);
  let n = 2;
  while (list.some(a => a.name === name)) name = `${String(d.name || '가져온 섬').slice(0, 7)} (${n++})`;
  const a = { id: newAccId(), name, pin: null, created: Date.now() };
  if (!lsSet(accKey(a.id), JSON.stringify(d.save))) { toast('저장 공간이 부족해요'); return; }
  list.push(a);
  saveAccounts(list);
  enterAccount(a);
}
function openAccountMenu() {
  tutFlag('account', true);
  showModal(`<h3>👤 ${esc(ACC.name)}</h3>
    <p class="muted">${accSummary(ACC)}</p>
    <div class="build-list">
      <button class="build-opt" data-act="guildOpen" style="--hc:#7dff8f"><span class="bo-ico">🛡️</span><span class="bo-nm">길드<br><small>${S.guild ? `${esc(S.guild.emblem)} ${esc(S.guild.name)}` : '길드에 들어가거나 만들기'}</small></span></button>
      <button class="build-opt" data-act="ranking" style="--hc:#ffd24a"><span class="bo-ico">🏆</span><span class="bo-nm">전 세계 랭킹<br><small>${tierOf(S.trophies).icon} ${tierOf(S.trophies).name} · 🏆 ${fmt(S.trophies || 0)}</small></span></button>
      <button class="build-opt" data-act="accSwitch" style="--hc:#6f8cff"><span class="bo-ico">🔄</span><span class="bo-nm">계정 바꾸기 / 새 계정</span></button>
      <button class="build-opt" data-act="accExport" style="--hc:#3fd6a4"><span class="bo-ico">📤</span><span class="bo-nm">이 계정 옮기기 코드<br><small>다른 기기에서 📥 가져오기에 붙여 넣으면 내 섬이 그대로 가요</small></span></button>
      <button class="build-opt" data-act="accRename" style="--hc:#ffb020"><span class="bo-ico">✏️</span><span class="bo-nm">이름 바꾸기</span></button>
      <button class="build-opt" data-act="accPinSet" style="--hc:#ff5ce1"><span class="bo-ico">🔒</span><span class="bo-nm">비밀번호 ${ACC.pin ? '바꾸기 / 없애기' : '만들기'}</span></button>
      ${isPhone() && !isStandalone() ? `<button class="build-opt" data-act="fullscreen" style="--hc:#ffb020"><span class="bo-ico">⛶</span><span class="bo-nm">전체화면 ${isFull() ? '끄기' : '켜기'}<br><small>주소창·상태바 없이 게임만 꽉 차게</small></span></button>` : ''}
      <button class="build-opt" data-act="music" style="--hc:#b388ff"><span class="bo-ico">${musicOn() ? '🎵' : '🔈'}</span><span class="bo-nm">배경음악 ${musicOn() ? '켜짐 (누르면 끄기)' : '꺼짐 (누르면 켜기)'}</span></button>
      <button class="build-opt" data-act="sound" style="--hc:#7dff8f"><span class="bo-ico">${soundOn() ? '🔊' : '🔇'}</span><span class="bo-nm">소리 ${soundOn() ? '켜짐 (누르면 끄기)' : '꺼짐 (누르면 켜기)'}</span></button>
      <button class="build-opt" data-act="code" style="--hc:#a8b2c1"><span class="bo-ico">🔑</span><span class="bo-nm">비밀코드 입력</span></button>
      <button class="build-opt" data-act="hardRefresh" style="--hc:#5cc8ff"><span class="bo-ico">🔄</span><span class="bo-nm">최신 버전으로 새로고침<br><small>앱이 옛날 모습이면 눌러 보세요 (섬은 그대로예요)</small></span></button>
    </div>
    <div class="row"><button class="btn ghost small" data-act="close">닫기</button></div>`);
}
async function accExport() {
  save();
  const code = await packCode('MHS1', { v: 1, name: ACC.name, save: S });
  codeBox('📤 계정 옮기기 코드', code, `다른 기기에서 게임을 열고 계정 화면의 <b>📥 다른 기기에서 가져오기</b>에 아래 <b>4자리 숫자</b>를 넣어요. 코드를 아는 사람은 누구나 이 섬을 가져갈 수 있으니 조심해요!`, { once: true });
}
function accRename() {
  showModal(`<h3>✏️ 이름 바꾸기</h3><input id="accNewName" maxlength="10" value="${esc(ACC.name)}">
    <div class="row"><button class="btn" data-act="accRenameOk">바꾸기</button><button class="btn ghost" data-act="close">취소</button></div>`);
}
function accRenameOk() {
  const name = ($('#accNewName').value || '').trim().slice(0, 10);
  if (!name) return;
  const list = accounts();
  if (list.some(a => a.name === name && a.id !== ACC.id)) { toast('같은 이름의 계정이 이미 있어요'); return; }
  const a = list.find(x => x.id === ACC.id);
  a.name = name;
  saveAccounts(list);
  ACC = a;
  S.nick = name;
  save();
  closeModal();
  toast(`✏️ 이름을 ${name}(으)로 바꿨어요`);
}
function accPinSet() {
  showModal(`<h3>🔒 비밀번호</h3>
    <p class="muted">숫자 4자리. 비워 두고 저장하면 비밀번호가 없어져요.</p>
    <input id="accPinNew" type="password" inputmode="numeric" maxlength="4" autocomplete="off" placeholder="••••">
    <div class="row"><button class="btn" data-act="accPinSetOk">저장</button><button class="btn ghost" data-act="close">취소</button></div>`);
}
function accPinSetOk() {
  const pin = ($('#accPinNew').value || '').trim();
  if (pin && !/^\d{4}$/.test(pin)) { toast('비밀번호는 숫자 4자리예요'); return; }
  const list = accounts(), a = list.find(x => x.id === ACC.id);
  a.pin = pin ? pinHash(a.id, pin) : null;
  saveAccounts(list);
  ACC = a;
  closeModal();
  toast(pin ? '🔒 비밀번호를 만들었어요' : '🔓 비밀번호를 없앴어요');
}
// 게임에 들어온 뒤: 처음이면 설명, 아니면 일일 보상
function afterEnter() {
  if (!$('#modal').classList.contains('hidden') || B || !$('#login').classList.contains('hidden')) return;
  if (!S.welcomed) { openWelcome(0, false); return; }
  if (AWAY.sec > 300 && openWelcomeBack()) return;
  // 튜토리얼 앞부분(첫 교배 전)에는 창을 띄우지 않고 🎁 빨간 점으로만 알려 준다
  if (dailyReady() && (S.tutOff || tutStep() >= 8)) openDaily();
}

// ===================== 속성 상성표 =====================
const weakTo = (e) => EL.filter(x => BEATS[x.id].includes(e)).map(x => x.id);
function typeChartHTML() {
  return `<div class="type-chart">
    <p class="muted">강한 속성 스킬로 공격하면 <b class="up">피해 1.5배</b>, 약한 속성이면 <b class="down">0.7배</b>예요.</p>
    <div class="tc-head"><span>속성</span><span>이 속성에게 강해요 ▲</span><span>이 속성에게 약해요 ▼</span></div>
    ${EL.map(e => `<div class="tc-row">
      <span class="tc-el" style="--ec:${e.color}">${e.emoji} ${e.name}${BASE.includes(e.id) ? '' : ' <small>특수</small>'}</span>
      <span class="tc-list up">${BEATS[e.id].map(x => `${EL[ELI[x]].emoji}${EL[ELI[x]].name}`).join(' ')}</span>
      <span class="tc-list down">${weakTo(e.id).map(x => `${EL[ELI[x]].emoji}${EL[ELI[x]].name}`).join(' ') || '-'}</span>
    </div>`).join('')}
  </div>`;
}
function openTypeChart() {
  showModal(`<h3>📘 속성 상성표</h3>${typeChartHTML()}
    <div class="row"><button class="btn ghost small" data-act="close">닫기</button></div>`);
}

// ===================== 보스전 =====================
const BOSSES = [
  { name: '킹크랩 대왕',   face: '🦀', els: ['water', 'earth'],          lv: 5,  hp: 1500,  atk: 55,  spd: 90,  turns: 1, ult: '대왕 집게 폭풍', gold: 2000,   gems: 20 },
  { name: '불꽃 마왕',     face: '👹', els: ['fire', 'dark'],            lv: 10, hp: 3500,  atk: 90,  spd: 105, turns: 1, ult: '지옥불',         gold: 5000,   gems: 30 },
  { name: '천둥 킹콩',     face: '🦍', els: ['thunder', 'earth'],        lv: 14, hp: 6000,  atk: 115, spd: 112, turns: 2, ult: '천둥 주먹',      gold: 10000,  gems: 40 },
  { name: '독안개 여왕',   face: '🕷️', els: ['poison', 'magic'],        lv: 17, hp: 10000, atk: 145, spd: 120, turns: 2, ult: '죽음의 거미줄',  gold: 20000,  gems: 60,  rune: [0, 0.5, 0.5] },
  { name: '얼음 용왕',     face: '🐉', els: ['ice', 'water', 'metal'],   lv: 20, hp: 16000, atk: 185, spd: 126, turns: 2, ult: '빙하기',         gold: 40000,  gems: 80,  rune: [0, 0.3, 0.7] },
  { name: '혼돈의 군주',   face: '👿', els: ['dark', 'magic', 'fire'],   lv: 25, hp: 30000, atk: 250, spd: 140, turns: 3, ult: '혼돈의 종말',    gold: 100000, gems: 150, rune: [0, 0, 1] },
];
BOSSES.forEach((b, i) => {
  const e = b.els;
  b.id = 'boss' + i;
  b.rarity = 'legendary';
  b.skills = [basicSkill(e[0]), atkSkill(e[0]), effSkill(e[1]), atkSkill(e[1]),
    { name: b.ult, el: e[0], type: 'dmg', mult: 1.3, aoe: true, cost: 6 }];
});
const bossUnlocked = (i) => i === 0 || !!S.bossCleared[i - 1];

function renderBossList() {
  return `<div class="boss-list">${BOSSES.map((b, i) => {
    const open = bossUnlocked(i), cleared = !!S.bossCleared[i];
    const weak = EL.filter(e => BEATS[e.id].some(x => b.els.includes(x)));
    return `<div class="boss-card ${open ? '' : 'locked'} ${cleared ? 'cleared' : ''}">
      <div class="boss-face" style="background:${grad(b)}">${open ? b.face : '🔒'}</div>
      <div class="boss-info">
        <div class="boss-nm">${open ? b.name : '???'} ${cleared ? '✅' : ''}</div>
        <div class="muted">Lv.${b.lv} · ${elBadges(b.els)} · ❤️ ${fmt(b.hp)} · ${'⚡'.repeat(b.turns)} ${b.turns > 1 ? `한 턴에 ${b.turns}번 행동` : ''}</div>
        <div class="muted">약점: ${weak.map(e => e.emoji).join('')}</div>
        <div class="boss-reward">${cleared ? '다시 이기면' : '첫 승리'}: 💰 ${fmt(cleared ? b.gold * 0.3 : b.gold)} · 💎 ${cleared ? 5 : b.gems}${!cleared && b.rune ? ' · 💠 룬' : ''}</div>
      </div>
      <button class="btn ${open ? '' : 'ghost'}" data-act="bossFight" data-i="${i}" ${open && S.team.length ? '' : 'disabled'}>${open ? '⚔️ 도전' : '🔒 잠김'}</button>
    </div>`;
  }).join('')}</div>`;
}

function mkBossUnit(b) {
  return {
    id: 'foe0', side: 'foe', c: b, lv: b.lv, boss: true, turns: b.turns,
    maxHp: b.hp, hp: b.hp, dispHp: b.hp, shownDead: false,
    atk: b.atk, spd: b.spd, sta: 4,
    fx: { burn: 0, burnDmg: 0, poison: 0, poisonDmg: 0, stun: 0, shield: 0, buff: 0, curse: 0 },
  };
}

function startBossBattle(i) {
  tutFlag('boss', true);
  i = Number(i);
  if (!bossUnlocked(i) || B) return;
  const team = S.team.map(byUid).filter(Boolean);
  if (!team.length) { toast('먼저 팀을 짜 주세요'); return; }
  const b = BOSSES[i];
  B = {
    stage: S.stage, bossIdx: i,
    units: [...team.map((m, k) => mkUnit(m, 'me', k)), mkBossUnit(b)],
    order: [], cur: null, target: 'foe0', log: [], round: 0,
    waiting: false, over: false, fast: false, timer: null, result: null, built: false,
  };
  $('#battle').classList.remove('hidden');
  updateGuide();
  logB(`👹 보스 ${b.name} 등장!${b.turns > 1 ? ` 한 턴에 ${b.turns}번 움직여요!` : ''}`);
  drawBattle();
  later(nextTurn, 700);
}

function bossRewards(win) {
  const b = BOSSES[B.bossIdx], rewards = [];
  if (!win) return rewards;
  const first = !S.bossCleared[B.bossIdx];
  const gold = first ? b.gold : Math.round(b.gold * 0.3);
  const gems = first ? b.gems : 5;
  earn(gold);
  earn(gems, 'gems');
  rewards.push(`💰 ${fmt(gold)}`, `💎 ${gems}`);
  if (first && b.rune) rewards.push(runeText(giveRune(b.rune)));
  if (first) rewards.push('🏅 보스 처치!');
  S.bossCleared[B.bossIdx] = true;
  return rewards;
}

// ===================== 일일 보상 =====================
const DAILY = [
  { icon: '💰', text: '골드 500',       give: () => { earn(500); } },
  { icon: '🍖', text: '먹이 500',       give: () => { S.food += 500; } },
  { icon: '💎', text: '보석 10',        give: () => { earn(10, 'gems'); } },
  { icon: '💰', text: '골드 1,500',     give: () => { earn(1500); } },
  { icon: '💠', text: '룬 상자',        give: () => runeText(giveRune([0.5, 0.4, 0.1])) },
  { icon: '🥚', text: '희귀 알',        give: () => {
    const t = pick(CAT_LIST.filter(c => c.rarity === 'rare' && c.els.length === 2 && !c.shop)).id;
    if (S.hatch.length >= hatchCap()) { earn(1000); return '부화장이 가득 차서 💰1,000으로 받았어요'; }
    S.hatch.push(t);
    return `${CAT[t].face} ${CAT[t].name} 알 (부화장으로)`;
  } },
  { icon: '🎁', text: '보석 50 + ★★★ 룬', give: () => { earn(50, 'gems'); return runeText(giveRune([0, 0, 1])); }, big: true },
];
// ----- 📋 미션: 매일 3개, 깨면 보석 -----
const MISSIONS = [
  { id: 'collect', text: '💰 골드 걷기', need: 5 },
  { id: 'breed',   text: '🏔️ 교배하기', need: 3 },
  { id: 'feed',    text: '🍖 레벨 올리기', need: 10 },
  { id: 'hatch',   text: '🐣 몬스터 태어나게 하기', need: 3 },
  { id: 'harvest', text: '🌾 작물 수확하기', need: 3 },
  { id: 'win',     text: '⚔️ 전투 이기기', need: 2 },
  { id: 'gwar',    text: '🛡️ 길드전 공격하기', need: 2 },
  { id: 'buyEgg',  text: '🥚 알 사기', need: 2 },
];
const MIS_GEMS = 10, MIS_BONUS = 30;
function misToday() {
  const k = dayKey();
  if (!S.mis || S.mis.day !== k) {
    // 날짜로 정해지는 3개 (첫날은 튜토리얼과 맞게: 걷기·교배·레벨)
    let n = [...k].reduce((s, ch) => s * 31 + ch.charCodeAt(0) >>> 0, 7);
    const pool = MISSIONS.filter(m => m.id !== 'gwar' || S.guild).map(m => m.id), ids = [];
    if (!S.mis) ids.push('collect', 'breed', 'feed');
    while (ids.length < 3) { const id = pool[n % pool.length]; n = (n * 1103515245 + 12345) >>> 0; if (!ids.includes(id)) ids.push(id); }
    S.mis = { day: k, ids, prog: {}, got: [], bonus: false };
  }
  return S.mis;
}
function mission(id, n = 1) {
  const m = misToday();
  if (!m.ids.includes(id)) return;
  const def = MISSIONS.find(x => x.id === id);
  const before = m.prog[id] || 0;
  m.prog[id] = Math.min(def.need, before + n);
  if (before < def.need && m.prog[id] >= def.need) {
    setTimeout(() => { sfx('yay'); toast(`📋 미션 완료! ${def.text} → 위쪽 📋에서 💎 받기`); }, 400);
  }
  updateMisDot();
}
// ----- 🏆 도전 과제: 한 번만 받는 큰 목표 -----
const ACH = [
  ...[5, 10, 25, 50, 100, 200, 400, 700, 1000, 1500, 2000].map((n, k) => ({ id: 'dex' + n, text: `📖 도감 ${fmt(n)}마리 모으기`, now: () => Object.keys(S.dex).length, need: n, gems: [5, 10, 15, 25, 40, 60, 80, 100, 150, 200, 500][k] })),
  ...[3, 5, 10, 15, 20, 30, 40, 50].map((n, k) => ({ id: 'stage' + n, text: `⚔️ 모험 스테이지 ${n} 도착`, now: () => S.stage, need: n, gems: [5, 10, 20, 30, 40, 60, 80, 100][k] })),
  ...['rare', 'epic', 'legendary', 'mythic', 'divine', 'holy', 'absolute', 'origin'].map((r, k) => ({ id: 'rank' + r, text: `✨ ${RAR[r].name} 등급 몬스터 얻기`, now: () => (S.monsters.some(m => RANK[CAT[m.type].rarity] >= RANK[r]) ? 1 : 0), need: 1, gems: [5, 10, 30, 60, 100, 150, 200, 300][k] })),
  { id: 'guild1', text: '🛡️ 길드에 들어가거나 만들기', now: () => (S.guild ? 1 : 0), need: 1, gems: 20 },
  ...[200, 500, 900, 1400].map((n, k) => ({ id: 'troph' + n, text: `🏆 트로피 ${fmt(n)} 모으기`, now: () => S.trophies || 0, need: n, gems: [10, 20, 40, 60][k] })),
  ...[3, 6, 10, 20].map((n, k) => ({ id: 'habs' + n, text: `🏠 서식지 ${n}개 짓기`, now: () => S.plots.filter(p => p && p.kind === 'hab').length, need: n, gems: [5, 10, 20, 30][k] })),
];
const achReady = (a) => !(S.achGot || []).includes(a.id) && a.now() >= a.need;
function misClaimable() {
  const m = misToday();
  return m.ids.some(id => (m.prog[id] || 0) >= MISSIONS.find(x => x.id === id).need && !m.got.includes(id)) ||
    (!m.bonus && m.got.length >= 3) || ACH.some(achReady);
}
function updateMisDot() { const d = $('#misDot'); if (d) d.classList.toggle('on', misClaimable()); }
function openMissions() {
  tutFlag('missions', true);
  const m = misToday();
  const got = S.achGot || [];
  // 도전 과제: 받을 수 있는 것 → 진행 중인 것(종류마다 다음 하나) 순서
  const seen = new Set();
  const achList = ACH.filter(a => !got.includes(a.id)).filter(a => { const kind = a.id.replace(/\d+|rank.*/, x => (x.startsWith('rank') ? 'rank' : '')); if (achReady(a)) return true; if (seen.has(kind)) return false; seen.add(kind); return true; });
  showModal(`<h3>📋 오늘의 미션</h3>
    <p class="muted">하나 깰 때마다 💎 ${MIS_GEMS}, 셋 다 깨면 보너스 💎 ${MIS_BONUS}! 내일은 새 미션이 나와요.</p>
    <div class="mis-list">${m.ids.map(id => {
      const def = MISSIONS.find(x => x.id === id), p = m.prog[id] || 0, done = p >= def.need, taken = m.got.includes(id);
      return `<div class="mis-row ${taken ? 'taken' : done ? 'done' : ''}">
        <div class="mis-info"><b>${def.text}</b> <small>${p}/${def.need}</small><div class="bar"><i style="width:${p / def.need * 100}%"></i></div></div>
        ${taken ? '<span class="mis-ok">✅</span>' : `<button class="btn small ${done ? 'green' : ''}" data-act="misClaim" data-id="${id}" ${done ? '' : 'disabled'}>💎 ${MIS_GEMS}</button>`}
      </div>`;
    }).join('')}
    <div class="mis-row bonus ${m.bonus ? 'taken' : ''}"><div class="mis-info"><b>🎉 셋 다 깨기 보너스</b> <small>${m.got.length}/3</small></div>
      ${m.bonus ? '<span class="mis-ok">✅</span>' : `<button class="btn small ${m.got.length >= 3 ? 'green' : ''}" data-act="misBonus" ${m.got.length >= 3 ? '' : 'disabled'}>💎 ${MIS_BONUS}</button>`}</div>
    </div>
    <h3 class="sub">🏆 도전 과제 <small class="muted">한 번씩 받는 큰 목표 · ${got.length}/${ACH.length} 완료</small></h3>
    <div class="mis-list">${achList.map(a => {
      const p = Math.min(a.need, a.now()), ok = achReady(a);
      return `<div class="mis-row ${ok ? 'done' : ''}">
        <div class="mis-info"><b>${a.text}</b> <small>${fmt(p)}/${fmt(a.need)}</small><div class="bar"><i style="width:${p / a.need * 100}%"></i></div></div>
        <button class="btn small ${ok ? 'green' : ''}" data-act="achClaim" data-id="${a.id}" ${ok ? '' : 'disabled'}>💎 ${a.gems}</button>
      </div>`;
    }).join('') || '<p class="muted">모든 도전 과제를 깼어요! 🏆</p>'}</div>
    <div class="row"><button class="btn ghost small" data-act="close">닫기</button></div>`);
}
function misClaim(id) {
  const m = misToday(), def = MISSIONS.find(x => x.id === id);
  if (!def || m.got.includes(id) || (m.prog[id] || 0) < def.need) return;
  m.got.push(id);
  earn(MIS_GEMS, 'gems');
  sfx('coin');
  toast(`💎 ${MIS_GEMS} 보석을 받았어요!`);
  save(); updateHud(); openMissions();
}
function misBonus() {
  const m = misToday();
  if (m.bonus || m.got.length < 3) return;
  m.bonus = true;
  earn(MIS_BONUS, 'gems');
  sfx('yay');
  toast(`🎉 오늘 미션 모두 완료! 💎 ${MIS_BONUS}`);
  save(); updateHud(); openMissions();
}
function achClaim(id) {
  const a = ACH.find(x => x.id === id);
  if (!a || !achReady(a)) return;
  S.achGot = [...(S.achGot || []), id];
  earn(a.gems, 'gems');
  sfx('yay');
  toast(`🏆 ${a.text} 달성! 💎 ${a.gems}`);
  save(); updateHud(); openMissions();
}

// ----- 👋 돌아왔을 때: 없는 동안 쌓인 것 알려 주기 -----
function openWelcomeBack() {
  const gold = Math.max(0, Math.floor(S.plots.reduce((s, p) => s + (p && p.kind === 'hab' ? p.gold || 0 : 0), 0) - AWAY.gold0));
  const eggs = S.plots.filter(p => p && p.kind === 'mountain').reduce((s, p) => s + mtnSlots(p).filter(b => b && Date.now() >= b.end).length, 0);
  const crops = S.plots.filter(p => p && p.kind === 'farm' && p.crop != null && Date.now() >= p.end).length;
  if (gold < 1 && !eggs && !crops) return false;
  const h = AWAY.sec >= 3600 ? `${Math.floor(AWAY.sec / 3600)}시간 ${Math.floor(AWAY.sec % 3600 / 60)}분` : `${Math.floor(AWAY.sec / 60)}분`;
  showModal(`<div class="welcome">
    <div class="w-icon">👋</div>
    <h3>다시 왔군요!</h3>
    <p>${h} 동안 섬에서 이런 일이 있었어요${AWAY.sec > 8 * 3600 ? ' <small class="muted">(골드는 최대 8시간까지 쌓여요)</small>' : ''}</p>
    <div class="wb-list">
      ${gold >= 1 ? `<div>💰 골드 <b>${fmt(gold)}</b> 쌓임</div>` : ''}
      ${eggs ? `<div>🥚 교배 끝난 알 <b>${eggs}개</b></div>` : ''}
      ${crops ? `<div>🌾 다 자란 농장 <b>${crops}곳</b></div>` : ''}
    </div>
    <div class="row">${gold >= 1 ? '<button class="btn big green" data-act="wbCollect">💰 모두 걷기</button>' : '<button class="btn big" data-act="wbClose">좋아요!</button>'}</div>
  </div>`);
  return true;
}

function dayKey(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}
const dailyReady = () => S.daily.last !== dayKey();
// 오늘 받을 차례인 날 (1~7). 어제 받았으면 이어지고, 하루라도 빠지면 1일차부터
function dailyNext() {
  if (S.daily.last === dayKey(-1)) return S.daily.streak % 7 + 1;
  return 1;
}

function openDaily() {
  const ready = dailyReady();
  const next = ready ? dailyNext() : S.daily.streak;
  const doneUpTo = ready ? next - 1 : S.daily.streak;
  showModal(`
    <h3>🎁 일일 보상</h3>
    <p class="muted">매일 접속해서 받아요. 하루라도 빠지면 1일차부터 다시 시작해요!</p>
    <div class="daily-grid">${DAILY.map((d, k) => {
      const day = k + 1;
      const state = day <= doneUpTo ? 'done' : ready && day === next ? 'today' : '';
      return `<div class="daily-day ${state} ${d.big ? 'big' : ''}">
        <div class="dd-day">${day}일차</div>
        <div class="dd-icon">${state === 'done' ? '✅' : d.icon}</div>
        <div class="dd-text">${d.text}</div>
      </div>`;
    }).join('')}</div>
    <div class="row">${ready
      ? `<button class="btn big green" data-act="claimDaily">🎁 ${next}일차 보상 받기</button>`
      : '<p class="muted">오늘 보상은 이미 받았어요. 내일 또 와요! 👋</p>'}</div>
    <div class="row"><button class="btn ghost small" data-act="close">닫기</button></div>`);
}

function claimDaily() {
  if (!dailyReady()) return;
  const day = dailyNext();
  const extra = DAILY[day - 1].give();
  S.daily = { last: dayKey(), streak: day };
  save();
  updateHud();
  openDaily();
  toast(`🎁 ${day}일차 보상: ${DAILY[day - 1].icon} ${DAILY[day - 1].text}${typeof extra === 'string' ? ` → ${extra}` : ''}`);
  if (tab !== 'island') render();
}

// ===================== 화면: 도감 =====================
let dexFilter = { el: 'all', rar: 'all', found: 'all' };

function dexHint(c) {
  if (c.shop) return `👑 전설 상점 💰${fmt(c.price)} 또는 전설 이상끼리 교배 (아주 드물게)`;
  if (c.rarity === 'mythic') return `전설 + 전설 (${elBadges(c.els)} 속성이 겹치는 전설일수록 잘 나와요)`;
  if (c.rarity === 'legendary') return `족보: ${elBadges(c.els)} 세 속성을 섞기 (서사끼리 교배해도 가끔 나와요)`;
  const adv = ADV_RECIPES.find(r => 'p:' + r.el === c.group);
  if (adv) return `족보: ${elBadges(adv.need)} 섞기`;
  if (c.els.length === 1) return `${elBadges(c.els)} + ${elBadges(c.els)}`;
  return `${elBadges([c.els[0]])} + ${elBadges([c.els[1]])}`;
}

function dexMatches(c) {
  if (dexFilter.el !== 'all') {
    if (dexFilter.el === 'legend' ? rIdx(c.id) < 3 : !c.els.includes(dexFilter.el)) return false;
  }
  if (dexFilter.rar !== 'all' && c.rarity !== dexFilter.rar) return false;
  if (dexFilter.found === 'yes' && !S.dex[c.id]) return false;
  if (dexFilter.found === 'no' && S.dex[c.id]) return false;
  return true;
}

let dexShow = 120;
function renderDex() {
  const found = CAT_LIST.filter(c => S.dex[c.id]).length;
  const all = CAT_LIST.filter(dexMatches);
  const list = all.slice(0, dexShow);
  const chip = (key, val, label) =>
    `<button class="chip ${dexFilter[key] === val ? 'on' : ''}" data-act="dexFilter" data-k="${key}" data-v="${val}">${label}</button>`;
  view.innerHTML = `
    <div class="sec-head">
      <h2>도감 <small>발견 ${found} / ${CAT_LIST.length}</small></h2>
      <p>몬스터를 누르면 정보와 <b>추천 교배 조합</b>을 볼 수 있어요. 추천 버튼을 누르면 바로 교배산으로 가요!</p>
    </div>
    <div class="chips">${chip('el', 'all', '전체')}${EL.map(e => chip('el', e.id, `${e.emoji}${e.name}`)).join('')}${chip('el', 'legend', '🏛️전설')}</div>
    <div class="chips">${chip('rar', 'all', '모든 등급')}${RAR_ORDER.map(r => chip('rar', r, RAR[r].name)).join('')}
      <span class="chip-gap"></span>${chip('found', 'all', '전부')}${chip('found', 'yes', '✅ 발견')}${chip('found', 'no', '❔ 미발견')}</div>
    <p class="muted dex-count">${all.length}마리</p>
    <div class="grid">${list.map(c => card({ type: c.id, lv: 1 }, `data-act="dexMon" data-type="${c.id}"`,
      `mini ${S.dex[c.id] ? '' : 'undiscovered'}`, S.dex[c.id] ? '<div class="found-mark">✅</div>' : '')).join('')}</div>
    ${all.length > list.length ? `<div class="footer-actions"><button class="btn big" data-act="dexMore">⬇️ 더 보기 (${all.length - list.length}마리 남음)</button></div>` : ''}
    <div class="footer-actions"><button class="btn ghost small" data-act="reset">🔄 처음부터 다시 하기</button></div>`;
}

// ----- 교배 추천 -----
// 가진 몬스터 중에서 target이 나올 확률이 가장 높은 두 마리
function bestOwnedPair(target, needLv) {
  const list = S.monsters.filter(m => !needLv || m.lv >= BREED_LV);
  let best = null;
  const cache = {};
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      const a = list[i], b = list[j];
      const key = [a.type, b.type].sort().join('|');
      const p = key in cache ? cache[key] : (cache[key] = breedDist(a.type, b.type)[target] || 0);
      if (p > 0 && (!best || p > best.p || (p === best.p && a.lv + b.lv > best.a.lv + best.b.lv))) best = { a, b, p };
    }
  }
  return best;
}

// 이론상 최고의 부모 (도감 기준)
function idealParents(target) {
  const c = CAT[target];
  if (c.shop) {
    // 한 단계 아래 등급 둘을 섞는 게 가장 좋다: 초월 ← 신화+신화, 신성 ← 초월+초월 ...
    const below = RAR_ORDER[rIdx(target) - 1];
    const par = below === 'mythic' ? MYTHIC.id : (SHOP_LEGENDS.find(l => CAT[l.id].rarity === below) || {}).id;
    if (!par) return null;
    return { pa: par, pb: par, p: breedDist(par, par)[target] || 0 };
  }
  let pa, pb;
  if (c.rarity === 'mythic') {
    // 전설 두 마리 중 이 신화가 가장 잘 나오는 조합
    let best = null;
    LEGENDS.forEach((x, i) => LEGENDS.forEach((y, j) => {
      if (j < i) return;
      const p = breedDist(x.id, y.id)[target] || 0;
      if (!best || p > best.p) best = { pa: x.id, pb: y.id, p };
    }));
    return best;
  }
  else if (c.rarity === 'legendary') { pa = hybridId(c.els[0], c.els[1]); pb = 'p:' + c.els[2]; }
  else if (c.els.length === 1) {
    const adv = ADV_RECIPES.find(r => r.el === c.els[0]);
    if (adv) { pa = 'p:' + adv.need[0]; pb = 'p:' + adv.need[1]; }
    else { pa = pb = 'p:' + c.els[0]; }
  } else { pa = 'p:' + c.els[0]; pb = 'p:' + c.els[1]; }
  return { pa, pb, p: breedDist(pa, pb)[target] || 0 };
}

const pctText = (p) => p >= 0.1 ? `${Math.round(p * 100)}%` : p >= 0.01 ? `${(p * 100).toFixed(1)}%` : `${(p * 100).toFixed(2)}%`;

function openDexMon(type) {
  tutFlag('dex', true);
  const c = CAT[type];
  if (!c) return;
  const r = RAR[c.rarity], st = stats({ type, lv: 1 });
  const found = S.dex[type];
  let how = '';
  if (c.shop) {
    how = `<div class="rec-box">
      <p><b>👑 전설 상점</b>에서 살 수 있어요. 전설 이상 몬스터끼리 교배해도 <b>아주 드물게</b> 태어나요!</p>
      <p class="li-price">💰 ${fmt(c.price)}</p>
      <div class="row"><button class="btn" data-act="tab" data-tab="shop">🛒 상점으로 가기</button></div>
    </div>`;
  }
  {
    const best = bestOwnedPair(type, true);
    const bestAny = best ? null : bestOwnedPair(type, false);
    const ideal = idealParents(type);
    const pairHTML = (a, b, p, note = '') => `
      <div class="pair">
        ${card(a, '', 'mini')}<div class="plus">+</div>${card(b, '', 'mini')}
      </div>
      <p class="rec-prob">나올 확률 <b>${pctText(p)}</b> · 교배 비용 💰${fmt(breedCost(a, b))}${note}</p>`;
    if (best) {
      how += `<div class="rec-box good">
        <h4>🧬 추천 교배 조합 <small class="muted">내 몬스터 중 최고</small></h4>
        ${pairHTML(best.a, best.b, best.p)}
        <div class="row"><button class="btn big" data-act="goBreed" data-a="${best.a.uid}" data-b="${best.b.uid}">⛰️ 이 조합으로 교배하러 가기</button></div>
      </div>`;
    } else if (bestAny) {
      how += `<div class="rec-box">
        <h4>🧬 추천 교배 조합</h4>
        ${pairHTML(bestAny.a, bestAny.b, bestAny.p)}
        <p class="warn">두 마리 모두 Lv.${BREED_LV} 이상이어야 교배할 수 있어요. 먹이를 줘서 키워 주세요!</p>
      </div>`;
    } else {
      how += `<div class="rec-box"><h4>🧬 추천 교배 조합</h4>
        <p class="warn">지금 가진 몬스터로는 만들 수 없어요. 아래 부모를 먼저 모아 보세요!</p></div>`;
    }
    if (ideal) {
      const shopHint = [ideal.pa, ideal.pb].some(t => CAT[t].variant === 0 && rIdx(t) === 0)
        ? '<p class="muted">💡 일반 부모는 상점의 🥚 몬스터 알 상점에서 살 수 있어요.</p>' : '';
      how += `<div class="rec-box">
        <h4>📖 최고의 부모 <small class="muted">도감 기준</small></h4>
        <div class="pair">${card({ type: ideal.pa, lv: 1 }, `data-act="dexMon" data-type="${ideal.pa}"`, 'mini')}<div class="plus">+</div>${card({ type: ideal.pb, lv: 1 }, `data-act="dexMon" data-type="${ideal.pb}"`, 'mini')}</div>
        <p class="rec-prob">나올 확률 <b>${pctText(ideal.p)}</b> · ${dexHint(c)}</p>
        ${shopHint}
      </div>`;
    }
  }
  showModal(`
    ${found ? '<div class="new-badge found">✅ 발견함</div>' : '<div class="new-badge unfound">❔ 아직 못 만났어요</div>'}
    <div class="face big" style="background:${grad(c)}">${c.face}</div>
    <h3>${c.name}</h3>
    <div class="rar" style="color:${r.color}">${r.name} · 부화 ${mmss(r.time)}</div>
    <div class="els">${elNames(c.els)}</div>
    <div class="statbox">
      <div>❤️ 체력<b>${fmt(st.hp)}</b></div>
      <div>⚔️ 공격<b>${fmt(st.atk)}</b></div>
      <div>👟 속도<b>${fmt(st.spd)}</b></div>
      <div>💰 초당<b>${fmt(r.income)}</b></div>
    </div>
    <h4 class="sub">스킬</h4>
    <div class="skill-list">${c.skills.map(sk => `
      <div class="skill-info"><span>${EL[ELI[sk.el]].emoji} <b>${sk.name}</b></span><span class="muted">${skDesc(sk)}</span><span class="sta">⚡${sk.cost}</span></div>`).join('')}</div>
    <h4 class="sub">얻는 방법</h4>
    ${how}
    <div class="row"><button class="btn ghost small" data-act="close">닫기</button></div>`);
}

function goBreed(a, b) {
  closeModal();
  tab = 'island';
  render();
  const free = mountains().find(k => mtnFreeSlot(S.plots[k]) >= 0);
  if (free == null) { toast('모든 교배산에서 알이 자라고 있어요! 먼저 알을 가져가거나 교배산을 더 지어 보세요'); openBreed(mountains()[0]); return; }
  if (islandOf(free) !== (S.isl || 0)) { S.isl = islandOf(free); render(); }
  sel = [Number(a), Number(b)];
  openBreed(free, mtnFreeSlot(S.plots[free]));
  toast('⛰️ 추천 조합을 골라 뒀어요. 교배 시작을 누르세요!');
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
  renderIslandBar();
  if (tab === 'island') view.innerHTML = '';
  else if (tab === 'adventure') renderAdventure();
  else if (tab === 'mons') renderMons();
  else if (tab === 'shop') renderShop();
  else if (tab === 'dex') renderDex();
  updateHud();
  refreshLive();
}

// ----- 튜토리얼: 할 일을 하나씩 알려 주고, 말풍선을 누르면 그곳으로 데려간다 -----
function goShop(id) {
  closeModal();
  tab = 'shop';
  render();
  setTimeout(() => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    el.classList.add('flash');
    setTimeout(() => el.classList.remove('flash'), 2400);
  }, 80);
}
function goPlot(i) {
  closeModal();
  if (islandOf(i) !== (S.isl || 0)) S.isl = islandOf(i);
  tab = 'island';
  render();
  openPlot(i);
}
const TUT = [
  { text: '🏠 서식지를 지어요! 몬스터가 사는 집이에요', done: () => S.plots.some(p => p && p.kind === 'hab'), go: () => goShop('shopHab') },
  { text: '🥚 몬스터 알을 사요 (지은 서식지와 같은 속성으로!)', done: () => S.monsters.length > 0 || S.hatch.length > 0 || allIncs().some(x => x.b), go: () => goShop('shopEgg') },
  { text: '🐣 부화장에서 알을 깨요', done: () => S.monsters.length > 0, go: () => goPlot(hatcheries()[0]) },
  { text: '🥚 몬스터를 한 마리 더 모아요 (교배하려면 2마리!)', done: () => S.monsters.length >= 2, go: () => (S.hatch.length || allIncs().some(x => x.b) ? goPlot(hatcheries()[0]) : goShop('shopEgg')) },
  { text: '🌾 농장을 지어요. 먹이 🍖를 키우는 곳이에요', done: () => farmIdx().length > 0, go: () => goShop('shopHab') },
  { text: '🌱 농장을 눌러 작물을 심어요', done: () => farmIdx().some(k => S.plots[k].crop != null || S.plots[k].lastCrop != null), go: () => goPlot(farmIdx()[0]) },
  { text: `🍖 먹이를 줘서 두 마리를 Lv.${BREED_LV}까지 키워요`, done: () => S.monsters.filter(m => m.lv >= BREED_LV).length >= 2, go: () => { closeModal(); tab = 'mons'; render(); } },
  { text: '🏔️ 교배산에서 두 마리를 섞어 새 몬스터를 만들어요!', done: () => (S.breedLog || []).length > 0, go: () => goPlot(mountains().find(k => mtnFreeSlot(S.plots[k]) >= 0) ?? mountains()[0]) },
  { text: '⚔️ 모험에서 팀을 짜고 첫 전투를 해 봐요', done: () => S.stage > 1 || Object.keys(S.bossCleared || {}).length > 0, go: () => { closeModal(); tab = 'adventure'; render(); } },
  // --- 새로 추가된 기능 둘러보기 ---
  { text: '🎁 오른쪽 위 🎁 버튼으로 일일 보상을 받아요', done: () => !!(S.daily && S.daily.last), go: () => { closeModal(); openDaily(); } },
  { text: '📖 도감에서 몬스터를 눌러 추천 교배 조합을 봐요', done: () => tutFlag('dex'), go: () => { closeModal(); tab = 'dex'; render(); } },
  { text: '🎨 섬 꾸미기 장식을 하나 놓아요 (섬 골드가 올라요!)', done: () => S.plots.some(p => p && p.kind === 'deco'), go: () => goShop('shopDeco') },
  { text: '👹 모험 탭의 보스전에 도전해 봐요', done: () => tutFlag('boss') || Object.keys(S.bossCleared || {}).length > 0, go: () => { closeModal(); tab = 'adventure'; render(); setTimeout(() => { const el = document.querySelector('.boss-list'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 80); } },
  { text: '👤 오른쪽 위 👤를 눌러 계정 메뉴를 봐요 (계정·옮기기·비밀번호)', done: () => tutFlag('account'), go: () => { closeModal(); openAccountMenu(); } },
  { text: '👥 모험 탭의 대전·친구 칸에서 🌍 랜덤 대전·선물·섬 구경을 둘러봐요', done: () => tutFlag('friends'), go: () => { closeModal(); tab = 'adventure'; render(); setTimeout(() => { const el = document.querySelector('.pvp-box'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 80); } },
];
// 한 번 해 본 기능 기록 (튜토리얼 단계 확인용)
TUT.push(
  { text: '📋 위쪽 📋 버튼에서 오늘의 미션을 보고 💎 보석을 받아요', done: () => tutFlag('missions'), go: () => { closeModal(); openMissions(); } },
  { text: '🛡️ 모험 탭의 🛡️ 길드에 들어가거나 만들어 봐요 (골드 보너스!)', done: () => tutFlag('guild') || !!S.guild,
    go: () => { closeModal(); tab = 'adventure'; render(); setTimeout(() => { const el = document.querySelector('.pvp-box'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 80); } },
  { text: '⚔️ 길드의 ⚔️ 길드전 탭에서 상대 길드원을 한 번 공격해 봐요 (이기면 ⭐!)', done: () => tutFlag('gwar'),
    go: () => { closeModal(); openGuild(S.guild ? 'war' : undefined); } },
  { text: '🏆 모험 탭의 🏆 랭킹에서 전 세계 순위를 봐요 (랜덤 대전에서 이기면 트로피!)', done: () => tutFlag('ranking'),
    go: () => { closeModal(); tab = 'adventure'; render(); setTimeout(() => { const el = document.querySelector('.pvp-box'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 80); } },
);
function tutFlag(k, set) {
  S.tutFlags = S.tutFlags || {};
  if (set && !S.tutFlags[k]) { S.tutFlags[k] = true; save(); }
  return !!S.tutFlags[k];
}
// ----- 튜토리얼 손가락: 단계마다 지금 화면에서 눌러야 할 곳을 가리킨다 -----
const modalOpen = () => !$('#modal').classList.contains('hidden');
const bottomBtn = (t) => `.bottom-bar [data-tab="${t}"]`;
const firstHabEl = () => (S.plots.find(p => p && p.kind === 'hab' && EGG_SHOP.includes('p:' + p.el)) || {}).el;
// 돌려주는 값: CSS 선택자 배열(앞에서부터 보이는 것) 또는 { plot: 칸 번호 }
function tutPoint(k) {
  const inModal = modalOpen();
  const onIsland = tab === 'island';
  const need = (t) => (tab === t ? null : [bottomBtn(t)]);
  switch (k) {
    case 0: // 서식지 짓기
      if (inModal) return ['#modalBox [data-act=build][data-what^="hab:"]', '#modalBox [data-act=close]'];
      return need('shop') || ['[data-act=buyHab][data-el="fire"]'];
    case 1: case 3: { // 알 사기 (4단계는 알이 있으면 부화)
      if (k === 3 && (S.hatch.length || allIncs().some(x => x.b))) return tutPoint(2);
      if (inModal) return ['#modalBox [data-act=close]'];
      const el = firstHabEl();
      return need('shop') || [el ? `[data-act=buyMon][data-type="p:${el}"]` : '#shopEgg', '[data-act=buyMon]'];
    }
    case 2: // 부화
      if (inModal) return ['#modalBox [data-act=placeInc]', '#modalBox [data-act=crack]', '#modalBox [data-act=incubate]', '#modalBox [data-act=incSlot].done', '#modalBox [data-act=close]'];
      return onIsland ? { plot: hatcheries()[0] } : [bottomBtn('island')];
    case 4: // 농장 짓기
      if (inModal) return ['#modalBox [data-act=build][data-what="farm"]', '#modalBox [data-act=close]'];
      return need('shop') || ['[data-act=buyHab][data-el="farm"]'];
    case 5: // 작물 심기
      if (inModal) return ['#modalBox [data-act=plant]', '#modalBox [data-act=close]'];
      return onIsland ? { plot: farmIdx()[0] } : [bottomBtn('island')];
    case 6: // Lv.4까지 키우기
      if (inModal) return ['#modalBox [data-act=feed]', '#modalBox [data-act=close]'];
      return need('mons') || ['[data-act=feedAll][data-mode="breed"]'];
    case 7: { // 교배
      if (inModal) {
        if (sel.length < 2) return ['#modalBox [data-act=pick]:not(.sel)', '#modalBox [data-act=close]'];
        return ['#modalBox [data-act=breed]'];
      }
      const m = mountains().find(i => mtnFreeSlot(S.plots[i]) >= 0) ?? mountains()[0];
      return onIsland ? { plot: m } : [bottomBtn('island')];
    }
    case 8: // 모험
      if (inModal) return ['#modalBox [data-act=close]'];
      if (tab !== 'adventure') return [bottomBtn('adventure')];
      return S.team.length ? ['[data-act=fight]'] : ['#view [data-act=team]'];
    case 9: // 일일 보상
      if (inModal) return ['#modalBox [data-act=claimDaily]', '#modalBox [data-act=close]'];
      return ['.hud [data-act=daily]'];
    case 10: // 도감 추천
      if (inModal) return ['#modalBox [data-act=goBreed]', '#modalBox [data-act=close]'];
      return need('dex') || ['#view [data-act=dexMon]'];
    case 11: // 섬 꾸미기
      if (inModal) return ['#modalBox [data-act=build][data-what^="deco:"]', '#modalBox [data-act=decoPick]', '#modalBox [data-act=close]'];
      return need('shop') || ['[data-act=buyDeco]'];
    case 12: // 보스전
      if (inModal) return ['#modalBox [data-act=close]'];
      if (tab !== 'adventure') return [bottomBtn('adventure')];
      return S.team.length ? ['[data-act=bossFight]:not([disabled])'] : ['#view [data-act=team]'];
    case 13: // 계정
      if (inModal) return ['#modalBox [data-act=accExport]', '#modalBox [data-act=close]'];
      return ['.hud [data-act=account]'];
    case 14: // 친구 · 랜덤 대전
      if (inModal) return ['#modalBox [data-act=pvpCancel]', '#modalBox [data-act=close]'];
      if (tab !== 'adventure') return [bottomBtn('adventure')];
      return ['.pvp-box [data-act=pvpRandom]', '.pvp-box [data-act=giftSend]'];
    case 15: // 미션
      if (inModal) return ['#modalBox [data-act=misClaim]:not([disabled])', '#modalBox [data-act=achClaim]:not([disabled])', '#modalBox [data-act=close]'];
      return ['.hud [data-act=missions]'];
    case 16: // 길드
      if (inModal) return ['#modalBox [data-act=guildJoin]:not([disabled])', '#modalBox [data-act=guildNew]', '#modalBox [data-act=close]'];
      if (tab !== 'adventure') return [bottomBtn('adventure')];
      return ['.pvp-box [data-act=guildOpen]'];
    case 17: // 길드전
      if (inModal) {
        if (!S.guild) return ['#modalBox [data-act=guildJoin]:not([disabled])', '#modalBox [data-act=guildNew]', '#modalBox [data-act=guildCreate]', '#modalBox [data-act=close]'];
        if (guildTab !== 'war') return ['#modalBox [data-act=guildTab][data-t=war]'];
        if (!S.team.length) return ['#modalBox [data-act=close]'];
        return ['#modalBox [data-act=gwarAttack]:not([disabled])', '#modalBox [data-act=close]'];
      }
      if (!S.team.length) return tab !== 'adventure' ? [bottomBtn('adventure')] : ['#view [data-act=team]'];
      if (tab !== 'adventure') return [bottomBtn('adventure')];
      return ['.pvp-box [data-act=guildOpen]'];
    case 18: // 랭킹
      if (inModal) return ['#modalBox [data-act=rankCat]', '#modalBox [data-act=close]'];
      if (tab !== 'adventure') return [bottomBtn('adventure')];
      return ['.pvp-box [data-act=ranking]'];
  }
  return null;
}

let fingerKey = '';
let fingerScrollAt = 0;
let glowEl = null;
function setGlow(el) {
  if (glowEl === el) return;
  if (glowEl) glowEl.classList.remove('tut-glow');
  glowEl = el;
  if (el) el.classList.add('tut-glow');
}
function updateFinger() {
  const f = $('#finger');
  if (!f) return;
  const k = tutShown();
  // 튜토리얼 창·설명 슬라이드가 열려 있을 때는 손가락을 숨긴다
  const reading = !!document.querySelector('#modalBox .tut-list, #modalBox .welcome');
  const active = !B && !S.tutOff && !S.hideUI && k < TUT.length && !reading;
  const target = active ? tutPoint(k) : null;
  let x = null, y = null, down = false, glow = null;
  if (target && target.plot != null && target.plot >= 0) {
    if (islandOf(target.plot) !== (S.isl || 0)) {
      const r = $('#islandBar .ib-name');
      if (r) { const b = r.getBoundingClientRect(); x = b.left + b.width / 2; y = b.bottom; }
    } else {
      const { x: wx, y: wy } = plotPos(target.plot);
      x = W / 2 + (wx - cam.x) * cam.z;
      y = H / 2 + 10 + (wy - cam.y) * cam.z;
      down = true;
      y -= 30 * cam.z;
    }
  } else if (Array.isArray(target)) {
    for (const sel of target) {
      const el = [...document.querySelectorAll(sel)].find(e => e.offsetParent !== null);
      if (!el) continue;
      let b = el.getBoundingClientRect();
      // 목록 아래쪽에 있어서 안 보이면 한 번만 스크롤해 준다
      const key = k + sel;
      // 목록 밖에 있으면 스크롤 (중간에 끊기면 1.5초 뒤 다시)
      if ((b.bottom > innerHeight - 90 || b.top < 60) && (fingerKey !== key || Date.now() - fingerScrollAt > 1500)) {
        el.scrollIntoView({ behavior: fingerKey === key ? 'auto' : 'smooth', block: 'center' });
        fingerKey = key;
        fingerScrollAt = Date.now();
      }
      b = el.getBoundingClientRect();
      glow = el;
      x = b.left + b.width / 2;
      // 손가락 끝이 버튼 안쪽을 누르도록: 화면 아래쪽 버튼은 위에서, 나머지는 아래에서 가리킨다
      down = b.bottom > innerHeight - 140;
      y = down ? b.top + Math.min(18, b.height * 0.4) : b.bottom - Math.min(18, b.height * 0.4);
      break;
    }
  }
  const show = x != null;
  setGlow(show ? glow : null);
  f.classList.toggle('hidden', !show);
  if (!show) return;
  f.classList.toggle('down', down);
  f.style.left = `${x}px`;
  f.style.top = `${y}px`;
}

let tutFocus = null;   // 🎓 튜토리얼 창에서 "다시 보기"를 누른 단계
const tutShown = () => (tutFocus != null ? tutFocus : tutStep());

function openTutorial() {
  const cur = tutStep();
  showModal(`<h3>🎓 튜토리얼</h3>
    <p class="muted">단계를 골라 <b>👉 다시 보기</b>를 누르면 손가락이 어디를 누를지 알려 줘요.</p>
    <div class="row"><button class="btn" data-act="welcome" data-n="0" data-full="1">📖 게임 설명 보기</button></div>
    <div class="tut-list">${TUT.map((t, k) => `<div class="tut-row ${k < cur ? 'done' : k === cur ? 'now' : ''}">
        <span class="tut-num">${k < cur ? '✅' : k === cur ? '👉' : k + 1}</span>
        <span class="tut-text">${t.text}</span>
        <button class="btn small ${k === cur ? 'green' : 'ghost'}" data-act="tutFocus" data-k="${k}">👉 ${k === cur ? '지금 하기' : '다시 보기'}</button>
      </div>`).join('')}</div>
    <div class="row">
      ${S.tutOff ? '<button class="btn ghost small" data-act="tutOn">💡 안내 말풍선 켜기</button>' : '<button class="btn ghost small" data-act="tutSkip">🔕 안내 말풍선 끄기</button>'}
      <button class="btn ghost small danger" data-act="reset">🔄 처음부터 다시 하기</button>
      <button class="btn ghost small" data-act="close">닫기</button>
    </div>`);
}
function focusTutorial(k) {
  k = Number(k);
  S.tutOff = false;
  tutFocus = k === tutStep() ? null : k;
  closeModal();
  const g = $('#guide');
  if (g) g.dataset.k = '';
  TUT[k].go();
  updateGuide();
}

// 한 번 끝낸 단계는 다시 돌아가지 않는다
function tutStep() {
  S.tutStep = S.tutStep || 0;
  while (S.tutStep < TUT.length && TUT[S.tutStep].done()) S.tutStep++;
  return S.tutStep;
}
function updateGuide() {
  const g = $('#guide');
  tutStep();
  const k = tutShown();
  if (k >= TUT.length && S.tutDoneN !== TUT.length) {
    S.tutDoneN = TUT.length;
    save();
    toast(`🎉 튜토리얼 완료! 이제 도감 ${fmt(CAT_LIST.length)}마리를 모두 모아 보세요!`);
  }
  const show = !B && !S.tutOff && !(S.hideUI && tab === 'island') && k < TUT.length;
  g.classList.toggle('hidden', !show);
  if (!show) return;
  const html = `<div class="g-step">${tutFocus != null ? '🎓 다시 보기' : '튜토리얼'} ${k + 1} / ${TUT.length}</div>
    <div class="g-text">${TUT[k].text}</div>
    <div class="g-go">👉 여기를 누르면 바로 가요</div>
    <button class="g-x" data-act="tutSkip" title="튜토리얼 끄기">✕</button>`;
  const key = k + (tutFocus != null ? 'f' : '');
  if (g.dataset.k !== key) { g.innerHTML = html; g.dataset.k = key; }
}
function tutGo() {
  const k = tutShown();
  if (k < TUT.length) TUT[k].go();
}

// ----- 처음 온 사람을 위한 설명 슬라이드 -----
const WELCOME = [
  { icon: '🧬', title: '몬스터 합치기에 온 걸 환영해요!', text: `몬스터를 <b>모으고</b>, <b>섞고</b>, <b>키워서</b> 싸우는 게임이에요.<br>도감에는 <b>${fmt(CAT_LIST.length)}마리</b>의 몬스터가 기다리고 있어요!` },
  { icon: '🏠', title: '서식지와 알', text: '몬스터는 <b>같은 속성 서식지</b>에서 살아요. 🔥 불 몬스터 → 🔥 불 서식지<br>🛒 상점에서 서식지와 알(💰500)을 사고, 🪺 부화장에서 알을 누르면 <b>바로 깨어나요</b>.<br>서식지 레벨만큼 몬스터가 살고, 골드 💰가 계속 쌓여요.' },
  { icon: '🌾', title: '농장과 먹이', text: '농장에 작물을 심으면 먹이 🍖가 생겨요. 오래 걸리는 작물일수록 효율이 좋아요.<br>작물을 고를 때 <b>🌾 모든 농장에</b>를 누르면 한 번에 심어요.<br>몬스터에게 먹이를 주면 <b>레벨이 올라요</b>.' },
  { icon: '🏔️', title: '교배', text: '<b>Lv.4</b> 몬스터 두 마리를 교배산에 넣으면 <b>새 몬스터</b>가 태어나요!<br>등급은 <b>일반 → … → 서사 → 전설 → 신화</b>까지 15단계. 타이머가 길수록 좋은 등급이에요.<br>📖 도감에서 몬스터를 누르면 <b>추천 교배 조합</b>을 알려 줘요.' },
  { icon: '🏝️', title: '섬 18개', text: '위쪽 <b>◀ ▶</b>로 섬을 옮겨 다녀요. 건물을 <b>꾹 눌러 끌면</b> 빈 땅으로 옮겨져요.<br>🎨 장식을 놓으면 그 섬 골드가 올라요.<br>두 손가락으로 <b>확대</b>, 🙈 숨기기로 이름표를 감출 수 있어요.' },
  { icon: '⚔️', title: '모험과 보스', text: '몬스터 3마리로 팀을 짜서 싸워요. 📘 상성표를 보고 <b>강한 속성</b>으로 공격하면 피해 1.5배!<br>👹 보스전에서는 에너지가 엄청 많은 보스와 싸워요.' },
  { icon: '👥', title: '대전과 친구', text: '모험 탭 <b>👥 대전 · 친구</b> 칸에서<br>🌍 <b>랜덤 대전</b>으로 모르는 사람과 바로 싸우고, ⚔️ 방 코드로 <b>친구 대전</b>, 🎁 <b>선물</b>, 👀 <b>친구 섬 구경</b>도 해요.<br>선물·섬 코드는 <b>4자리 숫자</b>(예: 0427)예요.' },
  { icon: '🏆', title: '랭킹과 트로피', text: '🌍 랜덤 대전에서 이기면 <b>🏆 +30</b>, 지면 −15.<br>🥉브론즈 → 🥈실버 → 🥇골드 → 💠플래티넘 → 💎다이아 → 👑마스터 → 🏆챔피언!<br>모험 탭 <b>🏆 랭킹</b>에서 트로피·도감·모험·전투력 <b>전 세계 순위</b>를 봐요.' },
  { icon: '🛡️', title: '길드', text: '모험 탭 <b>🛡️ 길드</b>에서 길드에 들어가거나 직접 만들어요 (💰5,000).<br>길드원이 트로피·도감을 모을수록 <b>길드 레벨</b>이 올라가고, 레벨마다 <b>서식지 골드 +2%</b>!<br>💬 길드 채팅은 정해진 말과 이모지로 안전하게 해요.' },
  { icon: '⚔️', title: '길드전', text: '매일 비슷한 길드와 짝이 돼요. 길드원마다 하루 <b>3번</b> 상대 길드원의 방어 팀을 공격해요.<br>이기면 ⭐1, 두 마리 살아남으면 ⭐2, 모두 살면 ⭐3!<br>길드 별이 ⭐10·25·50개가 되면 <b>🎁 길드전 상자</b>를 받아요. 내 모험 팀은 자동으로 <b>방어 팀</b>이 돼요.' },
  { icon: '📋', title: '미션과 도전 과제', text: '위쪽 <b>📋</b>에서 매일 <b>미션 3개</b>를 깨면 💎 보석! 셋 다 깨면 보너스 💎30.<br>🏆 <b>도전 과제</b>(도감·스테이지·등급·트로피)도 한 번씩 큰 보상을 줘요.<br>전투에서 <b>🤖 자동</b>을 켜면 알아서 싸워요.' },
  { icon: '👤', title: '계정과 오프라인', text: '오른쪽 위 <b>👤</b>에서 <b>계정</b>을 여러 개 만들 수 있어요. 계정마다 <b>자기 섬</b>이 따로 있고, 🔒 비밀번호도 걸 수 있어요.<br>다른 기기로는 <b>📤 옮기기 코드</b>로 섬을 옮겨요.<br>한 번 접속하면 <b>인터넷 없이도</b> 켜지고, 홈 화면에 앱처럼 설치할 수 있어요.<br>👤 메뉴에서 <b>🎵 음악 · 🔊 소리</b>를 켜고 끄고, 폰에서는 <b>⛶ 전체화면</b>도 돼요.' },
  { icon: '🎁', title: '매일 들어오면', text: '오른쪽 위 <b>🎁</b>에서 매일 <b>일일 보상</b>을 받아요. 7일째엔 큰 보상!' },
  { icon: '💡', title: '모르겠으면?', text: '화면 아래 <b>노란 말풍선</b>을 누르면 다음에 할 곳으로 데려가 주고, <b>👆 손가락</b>이 누를 곳을 알려 줘요.<br>오른쪽 위 <b>🎓 튜토리얼</b> 버튼으로 언제든 다시 볼 수 있어요.' },
];
// 처음 온 사람에게는 짧게 3장만. 🎓 튜토리얼 창의 "게임 설명 보기"에서는 전부
const WELCOME_SHORT = [
  { icon: '🧬', title: '몬스터 합치기에 온 걸 환영해요!', text: `몬스터를 <b>모으고</b>, <b>섞고</b>, <b>키우는</b> 게임이에요.<br>${fmt(CAT_LIST.length)}마리 도감을 채워 봐요!` },
  { icon: '🔁', title: '이렇게 놀아요', text: '🏠 서식지 짓기 → 🥚 알 사기 → 🍖 먹이로 <b>Lv.4</b><br>→ 🏔️ 두 마리를 <b>교배</b> → ✨ 새 몬스터!<br>몬스터는 서식지에서 💰 골드를 벌어요.' },
  { icon: '👆', title: '따라만 오세요', text: '<b>노란 말풍선</b>과 <b>👆 손가락</b>이 할 일을 알려 줘요.<br>위쪽 <b>📋</b>에서 미션을 깨면 💎 보석! 모르면 <b>🎓</b>' },
];
let welcomeFull = false;
function openWelcome(n = 0, full = welcomeFull) {
  welcomeFull = !!full;
  const list = welcomeFull ? WELCOME : WELCOME_SHORT;
  n = Math.max(0, Math.min(list.length - 1, Number(n)));
  const w = list[n], last = n === list.length - 1;
  showModal(`<div class="welcome">
    <div class="w-icon">${w.icon}</div>
    <h3>${w.title}</h3>
    <p>${w.text}</p>
    <div class="w-dots">${list.map((_, k) => `<i class="${k === n ? 'on' : ''}"></i>`).join('')}</div>
    <div class="row">
      ${n > 0 ? `<button class="btn ghost" data-act="welcome" data-n="${n - 1}">← 이전</button>` : ''}
      ${last ? '<button class="btn big green" data-act="welcomeDone">시작하기! 🚀</button>' : `<button class="btn" data-act="welcome" data-n="${n + 1}">다음 →</button>`}
    </div>
    ${last ? '' : '<button class="btn ghost small" data-act="welcomeDone">건너뛰기</button>'}
    ${S.tutOff ? '<div class="row"><button class="btn ghost small" data-act="welcomeDone">💡 튜토리얼 다시 켜기</button></div>' : ''}
  </div>`);
}
function welcomeDone() {
  S.welcomed = true;
  S.tutOff = false;
  save();
  closeModal();
  updateGuide();
}

function updateHud() {
  updateGuide();
  const dot = $('#dailyDot');
  if (dot) dot.classList.toggle('on', dailyReady());
  updateMisDot();
  updateFullBtn();
  [['gold', S.gold], ['gems', S.gems]].forEach(([id, v]) => {
    const el = $('#' + id);
    el.textContent = S.infinite ? '∞' : (innerWidth < 560 ? shortNum(v) : fmt(v));
    el.classList.toggle('infinite', S.infinite);
  });
  $('#food').textContent = innerWidth < 560 ? shortNum(S.food) : fmt(S.food);
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
  demolish: (d) => demolish(d.i),
  openMove: (d) => openMove(d.uid),
  move: (d) => moveMon(d.uid, d.i),
  plant: (d) => plant(d.i, d.c),
  harvest: (d) => harvest(d.i),
  harvestAll: (d) => harvestAll(d.i),
  plantAll: (d) => plantAll(d.i, d.c),
  replantAll: (d) => replantAll(d.i),
  farmGem: (d) => farmGem(d.i),
  pick: (d) => pickBreed(d.uid),
  breed: (d) => startBreed(d.i),
  breedGem: (d) => breedGem(d.i, d.s),
  takeEgg: (d) => takeEgg(d.i, d.s),
  mtnSlot: (d) => { const box = $('#modalBox'), y = box.scrollTop; openBreed(curMtn, Number(d.s)); box.scrollTop = y; },
  openHatch: () => openHatchery(),
  hatchOne: (d) => oldHatchReveal(d.idx),
  incubate: (d) => oldHatchReveal(d.idx),
  incubateAll: () => hatchAll(),
  incGem: (d) => incGem(d.i, d.s),
  crack: (d) => crack(d.i, d.s),
  placeInc: (d) => placeInc(d.i, d.s, d.h),
  sellInc: (d) => sellInc(d.i, d.s),
  crackAll: () => crackAll(),
  incCancel: (d) => incCancel(d.i, d.s),
  splitMtn: (d) => splitMountain(d.i),
  splitHatch: (d) => splitHatchery(d.i),
  breedCancel: (d) => breedCancel(d.i, d.s),
  incSlot: (d) => { const box = $('#modalBox'), y = box.scrollTop; openHatchery(curHatch, Number(d.s)); box.scrollTop = y; },
  place: (d) => place(d.idx, d.i),
  buildPlace: (d) => buildPlace(d.idx, d.el),
  upPlace: (d) => upPlace(d.idx, d.i),
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
  buyHab: (d) => buyHab(d.el),
  buyFood: (d) => buyFood(d.n),
  buyGold: (d) => buyGold(d.n),
  merge: (d) => merge(d.t, d.lv),
  mergeAll: () => mergeAll(),
  upAllHabs: (d) => upAllHabs(d.i),
  hatchAll: () => hatchAll(),
  feedAll: (d) => feedAll(d.mode),
  team: (d) => toggleTeam(d.uid),
  fight: () => startBattle(),
  bSkill: (d) => playerSkill(d.i),
  bTarget: (d) => setTarget(d.id),
  bFast: () => { B.fast = !B.fast; S.fastBattle = B.fast; drawBattle(); },
  bAuto: () => {
    if (!B || B.pvp) return;
    B.auto = !B.auto; S.autoBattle = B.auto;
    // 내 차례를 기다리던 중이면 바로 자동으로 움직인다
    if (B.auto && B.waiting && B.cur && B.cur.side === 'me') { B.waiting = false; aiAct(B.cur); } else drawBattle();
  },
  typeChart: () => openTypeChart(),
  applyUpdate: () => { if (B && !B.over) { toast('전투가 끝나면 적용할게요'); return; } save(); location.reload(); },
  hardRefresh: () => { toast('🔄 최신 버전을 받는 중…'); hardRefresh(); },
  account: () => openAccountMenu(),
  accSwitch: () => { closeModal(); save(); openLogin(); },
  accPick: (d) => accPick(d.id),
  accPinOk: (d) => accPinOk(d.id),
  accNew: () => openAccNew(),
  accNewOk: () => accNewOk(),
  accDel: (d) => accDel(d.id),
  accImport: () => openAccImport(),
  accImportOk: () => accImportOk(),
  accExport: () => accExport(),
  accRename: () => accRename(),
  accRenameOk: () => accRenameOk(),
  accPinSet: () => accPinSet(),
  accPinSetOk: () => accPinSetOk(),
  giftSend: (d) => openGiftSend(d.k || giftTab),
  giftMon: (d) => giftMon(d.uid),
  giftRes: () => giftRes(),
  giftRune: (d) => giftRune(d.rid),
  giftRecv: () => openGiftRecv(),
  giftRecvOk: () => giftRecvOk(),
  giftPlace: (d) => giftPlace(d.k),
  islandShare: () => openIslandShare(),
  visitOpen: () => openVisit(),
  visitOk: () => visitOk(),
  visitExit: () => visitExit(),
  giftUndo: () => { if (!SHARE || !SHARE.undo || SHARE.done) return; const u = SHARE.undo; SHARE.undo = null; stopShare(); u(); closeModal(); toast('↩️ 선물을 취소하고 돌려받았어요'); },
  copyCode: () => { const ta = $('#modalBox .code-box'); if (!ta) return; ta.select(); try { navigator.clipboard.writeText(ta.value).then(() => toast('📋 코드를 복사했어요! 친구에게 붙여 넣어 보내 주세요'), () => { document.execCommand('copy'); toast('📋 복사했어요'); }); } catch (e) { document.execCommand('copy'); toast('📋 복사했어요'); } },
  pvp: () => openPvp(),
  ranking: () => openRanking(),
  guildOpen: () => openGuild(),
  guildTab: (d) => openGuild(d.t),
  guildRefresh: () => { guildCache = null; openGuild(); },
  guildNew: () => guildNew(),
  guildEmb: (d) => { guildEmblem = d.e; const nm = $('#guildName') ? $('#guildName').value : ''; guildNew(); $('#guildName').value = nm; },
  guildCreate: () => guildCreate(),
  guildJoin: (d) => guildJoin(d.id),
  guildLeave: () => guildLeave(),
  gSay: (d) => gSay(d.k),
  gwarAttack: (d) => gwarAttack(d.id),
  gwarChest: (d) => gwarChest(d.k),
  rankCat: (d) => openRanking(d.c),
  rankRefresh: () => { rankCache = null; openRanking(); },
  rankName: () => {
    const v = ($('#rankName') ? $('#rankName').value : '').trim().slice(0, 10);
    if (!v) { toast('이름을 적어 주세요'); return; }
    S.nick = v; save(); toast('✏️ 이름을 바꿨어요'); rankSubmit(true).then(() => { rankCache = null; openRanking(); });
  },
  pvpRandom: () => { if ($('#pvpName')) saveNick(); if (!S.nick) { openPvp(); toast('상대에게 보일 이름을 적고 🌍 랜덤 대전을 눌러요'); return; } tutFlag('friends', true); pvpRandom(); },
  pvpHost: () => pvpHost(),
  pvpJoin: () => pvpJoin(),
  pvpCancel: () => { if (NET) clearInterval(NET.uiTimer); netClose(); closeModal(); toast('대전을 취소했어요'); },
  pvpCopy: (d) => { try { navigator.clipboard.writeText(d.code); toast('📋 코드를 복사했어요: ' + d.code); } catch (e) { toast('코드: ' + d.code); } },
  teamView: (d) => { const v = teamView(); v[d.k] = d.k === 'strong' ? d.v === 'true' : d.v; save(); const p = $('#panel'), y = p.scrollTop; renderAdventure(); p.scrollTop = y; },
  breedView: (d) => { const v = breedView(); v[d.k] = d.k === 'ready' ? d.v === 'true' : d.v; save(); const box = $('#modalBox'); const y = box.scrollTop; openBreed(curMtn); box.scrollTop = y; },
  sellDups: (d) => openSellDups(d.type),
  sellDupsOk: (d) => sellDups(d.type),
  zoomIn: () => zoomAt(cam.z * 1.3),
  zoomOut: () => zoomAt(cam.z / 1.3),
  hideUI: () => { S.hideUI = !S.hideUI; save(); renderIslandBar(); updateGuide(); updateFinger(); toast(S.hideUI ? '🙈 이름표와 안내를 숨겼어요. 👁️ 보이기로 다시 켜요' : '👁️ 다시 보여요'); },
  decoPick: (d) => openDecoPick(Number(d.i)),
  buyDeco: (d) => buyDeco(d.id),
  mergePick: (d) => openMergePick(d.i),
  mergeHatch: (d) => mergeHatch(d.i, d.k),
  tutGo: () => tutGo(),
  tutFocus: (d) => focusTutorial(d.k),
  tutOn: () => { S.tutOff = false; tutFocus = null; save(); closeModal(); updateGuide(); toast('💡 안내 말풍선을 켰어요'); },
  tutSkip: () => { if (tutFocus != null) { tutFocus = null; $('#guide').dataset.k = ''; updateGuide(); toast('다시 보기를 끝냈어요'); return; } S.tutOff = true; save(); updateGuide(); toast('튜토리얼을 껐어요. ❓ 버튼으로 다시 켤 수 있어요'); },
  welcome: (d) => openWelcome(d.n, d.full ? true : undefined),
  welcomeDone: () => welcomeDone(),
  help: () => openTutorial(),
  rebreed: (d) => rebreed(d.i, d.id),
  monView: (d) => { monView()[d.k] = d.v; save(); renderMons(); },
  isl: (d) => goIsland((S.isl || 0) + Number(d.d)),
  islGo: (d) => goIsland(d.k),
  islList: () => openIslandList(),
  bossFight: (d) => startBossBattle(d.i),
  daily: () => openDaily(),
  claimDaily: () => claimDaily(),
  missions: () => openMissions(),
  misClaim: (d) => misClaim(d.id),
  misBonus: () => misBonus(),
  achClaim: (d) => achClaim(d.id),
  sound: () => toggleSound(),
  music: () => toggleMusic(),
  fullscreen: () => toggleFullscreen(),
  wbCollect: () => { collectAll(); closeModal(); if (dailyReady() && tutStep() >= 8) setTimeout(openDaily, 300); },
  wbClose: () => { closeModal(); if (dailyReady() && tutStep() >= 8) setTimeout(openDaily, 300); },
  dexMon: (d) => openDexMon(d.type),
  dexFilter: (d) => { dexFilter[d.k] = d.v; dexShow = 120; renderDex(); },
  dexMore: () => { const y = $('#panel').scrollTop; dexShow += 240; renderDex(); $('#panel').scrollTop = y; },
  goBreed: (d) => goBreed(d.a, d.b),
  bQuit: () => quitBattle(),
  back: () => { const fn = modalStack; modalStack = null; if (fn) fn(); else closeModal(); },
  close: () => closeModal(),
  code: () => openCode(),
  codeOk: () => submitCode(),
  reset: () => {
    if (!confirm('정말 처음부터 다시 할까요?\n모든 몬스터, 골드, 건물이 사라지고 돈 무한도 꺼져요.')) return;
    if (B) { clearTimeout(B.timer); B = null; $('#battle').classList.add('hidden'); }
    Object.keys(walkers).forEach(k => delete walkers[k]);
    S = newState(); sel = []; tab = 'island';
    save();
    closeModal();
    render();
    toast('🔄 처음부터 다시 시작해요!');
  },
};

document.addEventListener('click', (e) => {
  if (e.target.id === 'modal') { closeModal(); return; }
  const t = e.target.closest('[data-act]') || (e.target.closest('#guide') ? { dataset: { act: 'tutGo' }, disabled: false } : null);
  if (!t || t.disabled) return;
  if (VISIT && !VISIT_OK.has(t.dataset.act)) { toast('👀 구경 중이에요. 🏠 내 섬으로 돌아간 뒤에 해 주세요'); return; }
  const fn = ACTIONS[t.dataset.act];
  if (fn) fn(t.dataset);
});

// ----- 🎬 오프닝 영상 -----
// 소리 있는 영상은 브라우저가 자동 재생을 막는다 → 막히면 "화면을 눌러 시작"을 보여 주고, 누르면 소리와 함께 재생
function runOpening() {
  const box = $('#opening'), v = $('#openingVideo');
  if (!box || !v) { startLoading(); return; }
  let done = false;
  const end = () => {
    if (done) return;
    done = true;
    try { v.pause(); } catch (e) { /* 이미 멈춤 */ }
    box.classList.add('fade');
    setTimeout(() => box.remove(), 500);
    startLoading();
  };
  const safety = (ms) => setTimeout(end, ms);
  v.addEventListener('ended', end);
  v.addEventListener('error', end);
  $('#openingSkip').addEventListener('click', (e) => { e.stopPropagation(); end(); });
  const tapToStart = () => {
    $('#openingTap').classList.remove('hidden');
    box.addEventListener('click', function go() {
      box.removeEventListener('click', go);
      $('#openingTap').classList.add('hidden');
      v.muted = false;
      v.currentTime = 0;
      v.play().then(() => safety(8000)).catch(() => { v.muted = true; v.play().catch(end); safety(8000); });
    });
  };
  if (!soundOn()) {
    v.muted = true;
    v.play().then(() => safety(8000)).catch(end);
    return;
  }
  v.muted = false;
  const p = v.play();
  if (p && p.then) p.then(() => safety(8000)).catch(tapToStart);
  else safety(8000);
}
// ----- ⏳ 로딩 화면: 글꼴 준비, 지금 섬 몬스터 그림 미리 그리기, 친구 대전 준비 -----
const LOAD_TIPS = [
  '💡 같은 속성 몬스터 두 마리를 섞으면 그 속성의 새 몬스터가 나와요',
  '💡 서식지 레벨이 오를수록 몬스터 자리와 골드가 늘어나요',
  '💡 📖 도감에서 몬스터를 누르면 가장 잘 나오는 교배 조합을 알려 줘요',
  '💡 강한 속성으로 공격하면 피해가 1.5배! 📘 상성표를 확인해요',
  '💡 📋 미션을 깨면 매일 💎 보석을 받을 수 있어요',
  '💡 🎨 장식을 놓으면 그 섬 서식지 골드가 올라요',
  '💡 🤖 자동 전투를 켜면 몬스터가 알아서 싸워요',
  '💡 오래 자라는 작물일수록 먹이 효율이 좋아요',
  '💡 👥 친구와 4자리 코드로 선물을 주고받을 수 있어요',
  '💡 건물을 꾹 눌러 끌면 다른 빈 땅으로 옮길 수 있어요',
];
let loadingStarted = false;
async function startLoading() {
  if (loadingStarted) return;
  loadingStarted = true;
  const box = $('#loader');
  if (!box) { setTimeout(afterEnter, 200); startMusic(); return; }
  $('#ldTip').textContent = pick(LOAD_TIPS);
  let shown = 0, target = 0;
  const bar = setInterval(() => {
    shown += Math.max(0.4, (target - shown) * 0.18);
    if (shown > target) shown = target;
    $('#ldFill').style.width = shown + '%';
    $('#ldPct').textContent = Math.floor(shown) + '%';
  }, 30);
  const stage = (pct, text) => { target = pct; $('#ldStatus').textContent = text; };
  const pause = (ms) => new Promise(r => setTimeout(r, ms));
  const t0 = Date.now();
  stage(20, '🏝️ 섬을 불러오는 중…');
  try { if (document.fonts && document.fonts.ready) await Promise.race([document.fonts.ready, pause(1500)]); } catch (e) { /* 글꼴 없음 */ }
  await pause(350);
  stage(55, '🐣 몬스터를 깨우는 중…');
  // 지금 섬에 나오는 그림(몬스터·건물·장식)을 미리 그려 두면 첫 화면이 부드럽다
  try {
    const sc = DPR * cam.z, want = new Set(['💰', '⛵', ...ISLANDS[S.isl || 0].decor]);
    islandRange(S.isl || 0).forEach(i => { const p = S.plots[i]; if (p && p.kind === 'hab') { want.add(habEmoji(p.el)); habMons(i).forEach(m => want.add(CAT[m.type].face)); } });
    const list = [...want];
    for (let k = 0; k < list.length; k++) {
      [44, 48, 80].forEach(size => { const w = size * sc; emojiSprite(list[k], Math.max(8, Math.min(320, w < 64 ? Math.ceil(w / 4) * 4 : Math.ceil(w / 16) * 16))); });
      if (k % 6 === 5) await pause(0);
    }
  } catch (e) { /* 미리 그리기는 못 해도 괜찮다 */ }
  await pause(350);
  stage(85, '⚔️ 모험을 준비하는 중…');
  await pause(400);
  stage(100, '✨ 준비 완료!');
  await pause(Math.max(450, 2200 - (Date.now() - t0)));
  clearInterval(bar);
  $('#ldFill').style.width = '100%';
  $('#ldPct').textContent = '100%';
  box.classList.add('fade');
  setTimeout(() => box.remove(), 600);
  setTimeout(afterEnter, 350);
  startMusic();
  setTimeout(() => rankSubmit(false), 5000);
}

runOpening();

tick();
render();
requestAnimationFrame(drawWorld);
setInterval(tick, 250);
setInterval(updateHud, 30000);   // 자정이 지나면 🎁 점 다시 켜기
if (accounts().length > 1 || (ACC && ACC.pin)) openLogin();
// 환영/일일 보상 창은 로딩 화면이 끝난 뒤에 (startLoading에서)
// 오프라인에서도 켜지도록 (한 번 접속하면 파일을 저장해 둔다)
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  // 새 버전 확인: 켤 때 + 30분마다. 새 파일이 준비되면 알려 주고, 누르면 저장한 뒤 새로 켠다
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.register('sw.js').then(reg => {
    reg.update().catch(() => {});
    setInterval(() => reg.update().catch(() => {}), 30 * 60 * 1000);
  }).catch(() => { /* 오프라인 저장 불가 */ });
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController) return;   // 처음 설치될 때는 알리지 않는다
    showUpdateBanner();
  });
}
function showUpdateBanner() {
  if ($('#updateBanner')) return;
  const b = document.createElement('button');
  b.id = 'updateBanner';
  b.className = 'update-banner';
  b.dataset.act = 'applyUpdate';
  b.innerHTML = '✨ 새 버전이 나왔어요! <b>눌러서 적용</b>';
  document.body.appendChild(b);
}
// 옛 파일을 지우고 최신 버전으로 다시 켜기 (저장은 그대로)
async function hardRefresh() {
  save();
  try { const keys = await caches.keys(); await Promise.all(keys.map(k => caches.delete(k))); } catch (e) { /* 캐시 없음 */ }
  try { const regs = await navigator.serviceWorker.getRegistrations(); await Promise.all(regs.map(r => r.update())); } catch (e) { /* 없음 */ }
  location.reload();
}
window.addEventListener('offline', () => toast('📴 오프라인이에요. 실시간 친구 대전 말고는 그대로 할 수 있어요'));
window.addEventListener('online', () => toast('📶 다시 연결됐어요'));
setInterval(save, 10000);   // 중요한 행동은 그때그때 저장하므로 자동 저장은 10초마다
document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
setInterval(updateFinger, 250);
window.addEventListener('beforeunload', save);
