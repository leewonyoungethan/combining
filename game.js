'use strict';

// ===================== 속성 =====================
// 앞의 8개는 기본 속성(처음부터 가진 몬스터), 뒤의 12개는 교배로 얻는 특수 속성
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
  // 새 특수 속성 9개 (모두 20개)
  { id: 'wind',    name: '바람', emoji: '🌪️', color: '#9ff5e1', adj: '질풍',   noun: '회오리새', face: '🕊️', sp: 12 },
  { id: 'sound',   name: '소리', emoji: '🎵', color: '#ff9ed8', adj: '메아리', noun: '노래새',   face: '🐦', sp: 7 },
  { id: 'space',   name: '우주', emoji: '🪐', color: '#6a5cff', adj: '성간',   noun: '우주고래', face: '🐋', sp: 3 },
  { id: 'time',    name: '시간', emoji: '⏳', color: '#d9b77e', adj: '영겁',   noun: '시계토끼', face: '🐇', sp: 10 },
  { id: 'dragon',  name: '용',   emoji: '🐲', color: '#ff4d4d', adj: '용린',   noun: '비룡',     face: '🐉', sp: 5 },
  { id: 'spirit',  name: '영혼', emoji: '👻', color: '#c8b6ff', adj: '혼불',   noun: '도깨비불', face: '👻', sp: 6 },
  { id: 'crystal', name: '수정', emoji: '💎', color: '#7ff0ff', adj: '결정',   noun: '보석거미', face: '🕷️', sp: -6 },
  { id: 'candy',   name: '사탕', emoji: '🍭', color: '#ff8fcf', adj: '달콤',   noun: '곰젤리',   face: '🧸', sp: 4 },
  { id: 'beast',   name: '야수', emoji: '🐾', color: '#c97b4a', adj: '야생',   noun: '늑대왕',   face: '🐺', sp: 9 },
];
// 처음 11개 속성으로 만든 몬스터 20000마리는 이름·등급이 바뀌지 않게 따로 만든다
const EL_OLD_N = 11;
const ELI = Object.fromEntries(EL.map((e, i) => [e.id, i]));
const BASE = ['fire', 'water', 'thunder', 'nature', 'earth', 'dark', 'light', 'poison'];

// 상성: 키 속성이 배열 속성에게 강하다
const BEATS = {
  fire: ['nature', 'ice', 'metal', 'candy'],
  water: ['fire', 'earth', 'crystal'],
  thunder: ['water', 'metal', 'wind'],
  nature: ['water', 'earth'],
  earth: ['thunder', 'fire', 'poison', 'sound'],
  dark: ['light', 'magic', 'time'],
  light: ['dark', 'poison', 'spirit'],
  poison: ['nature', 'water', 'beast'],
  ice: ['nature', 'earth', 'dragon'],
  metal: ['ice', 'magic', 'poison', 'crystal'],
  magic: ['nature', 'thunder', 'space'],
  wind: ['nature', 'poison'],
  sound: ['spirit', 'crystal'],
  space: ['time', 'light'],
  time: ['beast', 'metal'],
  dragon: ['fire', 'wind'],
  spirit: ['magic', 'beast'],
  crystal: ['thunder', 'dark'],
  candy: ['beast', 'spirit'],
  beast: ['nature', 'wind'],
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
  { el: 'wind',    need: ['nature', 'thunder'] },
  { el: 'sound',   need: ['thunder', 'magic'] },
  { el: 'space',   need: ['magic', 'ice'] },
  { el: 'time',    need: ['light', 'metal'] },
  { el: 'dragon',  need: ['fire', 'dark'] },
  { el: 'spirit',  need: ['dark', 'nature'] },
  { el: 'crystal', need: ['earth', 'ice'] },
  { el: 'candy',   need: ['nature', 'light'] },
  { el: 'beast',   need: ['water', 'earth'] },
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
  wind:    { atk: { n: '회오리', m: 0.9, aoe: true },   eff: { n: '순풍', type: 'buffTeam' } },
  sound:   { atk: { n: '음파', m: 1.6 },               eff: { n: '자장가', type: 'stun', m: 0.5 } },
  space:   { atk: { n: '유성 낙하', m: 0.9, aoe: true }, eff: { n: '중력장', type: 'curse', m: 0.6 } },
  time:    { atk: { n: '시간 베기', m: 1.7 },          eff: { n: '되감기', type: 'healSelf', v: 0.35 } },
  dragon:  { atk: { n: '용의 숨결', m: 1.8 },          eff: { n: '용의 불꽃', type: 'burn', m: 0.8 } },
  spirit:  { atk: { n: '영혼 흡수', m: 1.6 },          eff: { n: '영혼 보호', type: 'shield' } },
  crystal: { atk: { n: '수정 파편', m: 1.6 },          eff: { n: '수정 갑옷', type: 'shield' } },
  candy:   { atk: { n: '사탕 폭탄', m: 1.6 },          eff: { n: '달콤한 간식', type: 'healTeam', v: 0.2 } },
  beast:   { atk: { n: '야수의 발톱', m: 1.8 },        eff: { n: '포효', type: 'buffSelf' } },
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
// + 2차: 속성마다 15마리(165), 조합마다 33마리(1815), 전설 10, 신화 10 = 2000 더 → 모두 4000
// + 3차: 속성마다 40마리(440), 조합마다 100마리(5500), 전설 30, 신화 30 = 6000 더 → 모두 10000
// + 4차: 속성마다 57마리(627), 조합마다 170마리(9350), 전설 12, 신화 11 = 10000 더 → 모두 20000
// + 5차: 새 속성 9개 → 속성마다 41마리(369), 새 조합 135개마다 20마리(2700), 전설 10, 신화 5 = 3084 더 → 모두 23084
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
for (let x = 0; x < EL_OLD_N; x++) for (let y = x + 1; y < EL_OLD_N; y++) for (let z = y + 1; z < EL_OLD_N; z++) TRIPLES.push([EL[x].id, EL[y].id, EL[z].id]);
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
for (let i = 0; i < EL_OLD_N; i++) for (let j = i + 1; j < EL_OLD_N; j++) PAIRS.push([i, j]);
const EL_OLD = EL.slice(0, EL_OLD_N);
// 이름 붙은 전설/신화가 이름을 먼저 차지하고, 대표 몬스터 → 나머지 변종 순서로 만든다
LEGENDS.concat(MYTHICS).forEach(m => usedNames.add(m.name));
EL_OLD.forEach((e, i) => addPure(e, i, 0));
PAIRS.forEach(([i, j]) => addHybrid(i, j, 0));
EL_OLD.forEach((e, i) => { for (let k = 1; k < PURE_VARIANTS; k++) addPure(e, i, k); });
PAIRS.forEach(([i, j]) => { for (let v = 1; v < HYB_VARIANTS; v++) addHybrid(i, j, v); });
// ---- 2차 몬스터 2000마리 (기존 몬스터의 이름·등급이 바뀌지 않게 맨 뒤에서 만든다) ----
const PURE_EXTRA = 15, HYB_EXTRA = 33, LEGEND_EXTRA = 10, MYTHIC_EXTRA = 10;
function addPureX(e, n) {
  const group = 'p:' + e.id, k = PURE_VARIANTS + n, id = `${group}:${k}`;
  const adjs = ADJ[e.id];
  const look = freshCreature(adjs[(k * 5 + 3) % adjs.length], id, hashStr(group + '#2') + n * 11);
  addMon({ id, group, variant: k, ...look, els: [e.id], rarity: RAR_ORDER[rankOfVariant(n, PURE_EXTRA, frac(group + '#2'))], mod: variantMod(id) });
}
function addHybridX(i, j, n) {
  const a = EL[i], b = EL[j], group = `h:${a.id}+${b.id}`, v = HYB_VARIANTS + n, id = `${group}:${v}`;
  const adjs = n % 2 ? ADJ[b.id] : ADJ[a.id];
  const look = freshCreature(adjs[(v * 5 + 1) % adjs.length], id, hashStr(group + '#2') + n * 11);
  addMon({ id, group, variant: v, ...look, els: [a.id, b.id], rarity: RAR_ORDER[rankOfVariant(n, HYB_EXTRA, frac(group + '#2'))], mod: variantMod(id) });
}
EL_OLD.forEach(e => { for (let n = 0; n < PURE_EXTRA; n++) addPureX(e, n); });
PAIRS.forEach(([i, j]) => { for (let n = 0; n < HYB_EXTRA; n++) addHybridX(i, j, n); });
// 2차 전설·신화: 아직 안 쓴 세 속성 조합으로
function makeSpecialX(prefix, k, titles) {
  const els = nextTriple(k * 3 + (prefix === 'M' ? 211 : 97));
  const title = `${EL[ELI[els[2]]].adj}의 ${titles[(k + 3) % titles.length]}`;
  const look = freshCreature(title, `${prefix}:x${k}`, hashStr(prefix + 'x' + k) % CREATURES.length);
  usedNames.add(look.name);
  return { id: `${prefix}:x${k}`, ...look, els, ult: `${EL[ELI[els[0]]].adj} ${ULT_WORDS[(k + 5) % ULT_WORDS.length]}` };
}
for (let k = 0; k < LEGEND_EXTRA; k++) LEGENDS.push(makeSpecialX('L', k, LEG_TITLES));
for (let k = 0; k < MYTHIC_EXTRA; k++) MYTHICS.push(makeSpecialX('M', k, MYTH_TITLES));
// ---- 3차 몬스터 6000마리 (새 수식어 · 새 동물로 이름을 만들어서 이름이 모자라지 않게) ----
const PURE_EXTRA2 = 40, HYB_EXTRA2 = 100, LEGEND_EXTRA2 = 30, MYTHIC_EXTRA2 = 30;
const ADJ2 = {
  fire:    ['불멸', '작열', '홍염', '열화', '화룡', '붉은', '타오르는', '염화', '업화', '불씨'],
  water:   ['푸른', '깊은', '물안개', '해심', '조류', '샘물', '파랑', '해무', '여울', '해조'],
  thunder: ['벼락', '뇌광', '폭뢰', '전광', '번쩍', '뇌신', '천뢰', '뇌명', '질풍', '뇌격'],
  nature:  ['초록', '들꽃', '잎새', '버들', '뿌리', '열매', '꽃봉오리', '솔잎', '풀꽃', '녹음'],
  earth:   ['황무지', '돌산', '흙먼지', '사막', '절벽', '동굴', '자갈', '대륙', '산맥', '흑요석'],
  dark:    ['어둠', '밤안개', '검은', '흑염', '저주', '유령', '암야', '흑월', '명계', '침묵'],
  light:   ['빛나는', '황금', '순백', '성스러운', '태양빛', '별무리', '오로라', '광명', '백금', '천상'],
  poison:  ['독가시', '독구름', '녹색늪', '독이끼', '맹독꽃', '독방울', '독거품', '부패', '독장미', '독사'],
  ice:     ['얼어붙은', '빙설', '설빙', '한기', '빙정', '극지', '빙산', '동토', '서늘한', '얼음꽃'],
  metal:   ['쇠사슬', '녹슨', '금속', '은도금', '강화', '철인', '나사', '백동', '코발트', '니켈'],
  magic:   ['마법진', '수정구', '환영', '마도', '신비로운', '차원', '성운', '마술', '운명', '시간'],
};
const CREATURES2 = [
  ['🦄', '유니콘'], ['🐉', '드래곤'], ['🦅', '독수리'], ['🦆', '오리'], ['🐧', '펭귄'], ['🦇', '박쥐'],
  ['🐸', '개구리'], ['🦎', '도마뱀'], ['🐢', '거북'], ['🐋', '향유고래'], ['🦤', '도도새'], ['🦫', '비버'],
  ['🦨', '스컹크'], ['🦛', '하마'], ['🐅', '백호'], ['🐃', '물소'], ['🐏', '숫양'], ['🐥', '병아리'],
  ['🦪', '조개'], ['🐚', '소라'], ['🧛', '뱀파이어'], ['🧟', '좀비'], ['🧙', '마법사'], ['🗿', '석상'],
  ['🤖', '로봇'], ['👾', '외계인'], ['🦁', '사자'], ['🐹', '햄스터'], ['🐦', '참새'], ['🐜', '개미'],
  ['🦠', '미생물'], ['🧸', '곰인형'], ['🐂', '투우소'], ['🦣', '매머드'], ['🐪', '쌍봉낙타'], ['🦓', '얼룩말'],
  ['🪱', '지렁이'], ['🐩', '푸들'], ['🐔', '암탉'], ['🐤', '아기새'], ['🐟', '물고기'],
];
const ALL_CREATURES = CREATURES.concat(CREATURES2);
function freshCreature2(adj, seedKey, start) {
  let k = start % ALL_CREATURES.length;
  for (let tries = 0; tries < ALL_CREATURES.length; tries++, k = (k + 1) % ALL_CREATURES.length) {
    const [face, noun] = ALL_CREATURES[k];
    if (!usedNames.has(`${adj} ${noun}`)) return { face, name: `${adj} ${noun}` };
  }
  return { face: '❓', name: `${adj} 몬스터 ${seedKey}` };
}
function addPureY(e, n) {
  const group = 'p:' + e.id, k = PURE_VARIANTS + PURE_EXTRA + n, id = `${group}:${k}`;
  const adjs = ADJ2[e.id];
  const look = freshCreature2(adjs[n % adjs.length], id, hashStr(group + '#3') + n * 13);
  addMon({ id, group, variant: k, ...look, els: [e.id], rarity: RAR_ORDER[rankOfVariant(n, PURE_EXTRA2, frac(group + '#3'))], mod: variantMod(id) });
}
function addHybridY(i, j, n) {
  const a = EL[i], b = EL[j], group = `h:${a.id}+${b.id}`, v = HYB_VARIANTS + HYB_EXTRA + n, id = `${group}:${v}`;
  const adjs = n % 2 ? ADJ2[b.id] : ADJ2[a.id];
  const look = freshCreature2(adjs[Math.floor(n / 2) % adjs.length], id, hashStr(group + '#3') + n * 13);
  addMon({ id, group, variant: v, ...look, els: [a.id, b.id], rarity: RAR_ORDER[rankOfVariant(n, HYB_EXTRA2, frac(group + '#3'))], mod: variantMod(id) });
}
EL_OLD.forEach(e => { for (let n = 0; n < PURE_EXTRA2; n++) addPureY(e, n); });
PAIRS.forEach(([i, j]) => { for (let n = 0; n < HYB_EXTRA2; n++) addHybridY(i, j, n); });
function makeSpecialY(prefix, k, titles) {
  const els = nextTriple(k * 7 + (prefix === 'M' ? 331 : 157));
  const title = `${EL[ELI[els[1]]].adj}의 ${titles[(k + 7) % titles.length]}`;
  const look = freshCreature2(title, `${prefix}:y${k}`, hashStr(prefix + 'y' + k) % ALL_CREATURES.length);
  usedNames.add(look.name);
  return { id: `${prefix}:y${k}`, ...look, els, ult: `${EL[ELI[els[2]]].adj} ${ULT_WORDS[(k + 3) % ULT_WORDS.length]}` };
}
for (let k = 0; k < LEGEND_EXTRA2; k++) LEGENDS.push(makeSpecialY('L', k, LEG_TITLES));
for (let k = 0; k < MYTHIC_EXTRA2; k++) MYTHICS.push(makeSpecialY('M', k, MYTH_TITLES));
// ---- 4차 몬스터 10000마리 (또 새 수식어로) ----
const PURE_EXTRA3 = 57, HYB_EXTRA3 = 170, LEGEND_EXTRA3 = 12, MYTHIC_EXTRA3 = 11;
const ADJ3 = {
  fire:    ['불타는', '화염꽃', '불꽃놀이', '적룡', '화산재', '용광로', '모닥불', '봉황', '열기', '불덩이', '화톳불', '성화'],
  water:   ['은물결', '바다', '푸른물', '거품', '해파', '물방울', '강물', '수평선', '소나기', '빗줄기', '연못', '폭포'],
  thunder: ['번개구름', '천둥새', '뇌우', '전기', '찌릿', '뇌운석', '번갯불', '뇌정', '광전', '천둥소리', '뇌룡', '섬전'],
  nature:  ['새잎', '꽃향기', '덤불', '숲속', '나무', '풀숲', '꽃가루', '잔디', '개나리', '민들레', '단풍', '연꽃'],
  earth:   ['흙', '돌멩이', '산', '언덕', '모래폭풍', '화석', '광석', '골짜기', '지층', '사암', '황금모래', '석회'],
  dark:    ['밤', '암흑성', '먹구름', '그늘', '흑요', '밤하늘', '악령', '흑마', '어둠별', '그림자꽃', '흑룡', '심야'],
  light:   ['햇빛', '반짝이는', '별빛꽃', '은하', '성광꽃', '빛방울', '천사', '광선', '새벽별', '무지갯빛', '금빛', '해오름'],
  poison:  ['독풀', '독연기', '독나방', '독침꽃', '녹색독', '독웅덩이', '독뿔', '독가루', '독샘', '독진흙', '독이빨', '독덩굴'],
  ice:     ['눈송이', '고드름', '빙판', '눈사태', '얼음별', '설화', '빙룡', '한설', '빙벽', '서리꽃', '눈꽃송이', '빙하수'],
  metal:   ['은색', '쇠', '톱날', '강철별', '금속판', '철판', '태엽', '볼트', '쇳덩이', '합금별', '강철비', '무쇠팔'],
  magic:   ['마녀', '부적', '주문서', '요정빛', '마법봉', '룬문자', '신비별', '환상꽃', '마력석', '마법별', '꿈', '수수께끼'],
};
function addPureZ(e, n) {
  const group = 'p:' + e.id, k = PURE_VARIANTS + PURE_EXTRA + PURE_EXTRA2 + n, id = `${group}:${k}`;
  const adjs = ADJ3[e.id];
  const look = freshCreature2(adjs[n % adjs.length], id, hashStr(group + '#4') + n * 17);
  addMon({ id, group, variant: k, ...look, els: [e.id], rarity: RAR_ORDER[rankOfVariant(n, PURE_EXTRA3, frac(group + '#4'))], mod: variantMod(id) });
}
function addHybridZ(i, j, n) {
  const a = EL[i], b = EL[j], group = `h:${a.id}+${b.id}`, v = HYB_VARIANTS + HYB_EXTRA + HYB_EXTRA2 + n, id = `${group}:${v}`;
  const adjs = n % 2 ? ADJ3[b.id] : ADJ3[a.id];
  const look = freshCreature2(adjs[Math.floor(n / 2) % adjs.length], id, hashStr(group + '#4') + n * 17);
  addMon({ id, group, variant: v, ...look, els: [a.id, b.id], rarity: RAR_ORDER[rankOfVariant(n, HYB_EXTRA3, frac(group + '#4'))], mod: variantMod(id) });
}
EL_OLD.forEach(e => { for (let n = 0; n < PURE_EXTRA3; n++) addPureZ(e, n); });
PAIRS.forEach(([i, j]) => { for (let n = 0; n < HYB_EXTRA3; n++) addHybridZ(i, j, n); });
function makeSpecialZ(prefix, k, titles) {
  const els = nextTriple(k * 11 + (prefix === 'M' ? 419 : 263));
  const title = `${EL[ELI[els[2]]].adj}의 ${titles[(k + 1) % titles.length]}`;
  const look = freshCreature2(title, `${prefix}:z${k}`, hashStr(prefix + 'z' + k) % ALL_CREATURES.length);
  usedNames.add(look.name);
  return { id: `${prefix}:z${k}`, ...look, els, ult: `${EL[ELI[els[1]]].adj} ${ULT_WORDS[(k + 7) % ULT_WORDS.length]}` };
}
for (let k = 0; k < LEGEND_EXTRA3; k++) LEGENDS.push(makeSpecialZ('L', k, LEG_TITLES));
for (let k = 0; k < MYTHIC_EXTRA3; k++) MYTHICS.push(makeSpecialZ('M', k, MYTH_TITLES));
// ---- 5차: 새 속성 9개의 몬스터 ----
const PURE_NEW = 41, HYB_NEW = 20, LEGEND_NEW = 10, MYTHIC_NEW = 5;
const ADJ_NEW = {
  wind:    ['질풍', '회오리', '산들', '돌풍', '바람개비', '폭풍우', '미풍', '날개바람', '하늬', '바람결', '구름길', '흩날리는'],
  sound:   ['메아리', '노래', '울림', '멜로디', '박자', '합창', '휘파람', '북소리', '종소리', '하모니', '음표', '노래하는'],
  space:   ['성간', '별똥', '블랙홀', '혜성', '행성', '은하계', '초신성', '달빛', '성좌', '궤도', '운석', '무중력'],
  time:    ['영겁', '시계', '모래시계', '찰나', '과거', '미래', '태엽시계', '시간여행', '순간', '영원', '자정', '새벽녘'],
  dragon:  ['용린', '비룡', '용아', '용혼', '화룡왕', '용비늘', '드래곤', '용날개', '천룡', '용의눈', '용발톱', '용궁'],
  spirit:  ['혼불', '유령빛', '수호령', '정령', '망자', '넋', '영체', '귀혼', '혼백', '요괴', '떠도는', '영혼'],
  crystal: ['결정', '보석', '다이아', '루비', '사파이어', '에메랄드', '자수정', '진주', '호박', '수정꽃', '유리', '프리즘'],
  candy:   ['달콤', '사탕', '젤리', '초코', '마카롱', '솜사탕', '롤리팝', '쿠키', '케이크', '푸딩', '캐러멜', '꿀'],
  beast:   ['야생', '맹수', '포효', '사냥꾼', '발톱', '송곳니', '초원', '정글왕', '들짐승', '야수왕', '갈기', '으르렁'],
};
const adjsOf = (id) => ADJ_NEW[id] || ADJ3[id];
const NEW_PAIRS = [];
for (let i = 0; i < EL.length; i++) for (let j = Math.max(i + 1, EL_OLD_N); j < EL.length; j++) NEW_PAIRS.push([i, j]);
// 대표 몬스터 이름이 이미 있으면 새로 짓는다
function repLook(name, face, adj, id, seed) { return usedNames.has(name) ? freshCreature2(adj, id, seed) : { face, name }; }
function addPureN(e, k) {
  const group = 'p:' + e.id, id = k === 0 ? group : `${group}:${k}`, seed = hashStr(group + '#5') + k * 19;
  const look = k === 0 ? repLook(`${e.adj} ${e.noun}`, e.face, e.adj, id, seed) : freshCreature2(adjsOf(e.id)[k % 12], id, seed);
  addMon({ id, group, variant: k, ...look, els: [e.id], rarity: RAR_ORDER[k === 0 ? 0 : rankOfVariant(k, PURE_NEW, frac(group + '#5'))], mod: k === 0 ? null : variantMod(id) });
}
function addHybridN(i, j, v) {
  const a = EL[i], b = EL[j], group = `h:${a.id}+${b.id}`, id = v === 0 ? group : `${group}:${v}`, seed = hashStr(group + '#5') + v * 19;
  const look = v === 0 ? repLook(`${a.adj} ${b.noun}`, b.face, a.adj, id, seed) : freshCreature2(adjsOf(v % 2 ? a.id : b.id)[Math.floor(v / 2) % 12], id, seed);
  addMon({ id, group, variant: v, ...look, els: [a.id, b.id], rarity: RAR_ORDER[v === 0 ? 0 : rankOfVariant(v, HYB_NEW, frac(group + '#5'))], mod: v === 0 ? null : variantMod(id) });
}
EL.slice(EL_OLD_N).forEach(e => { for (let k = 0; k < PURE_NEW; k++) addPureN(e, k); });
NEW_PAIRS.forEach(([i, j]) => { for (let v = 0; v < HYB_NEW; v++) addHybridN(i, j, v); });
// 새 속성이 들어간 세 속성 조합으로 전설·신화
const NEW_TRIPLES = [];
for (let x = 0; x < EL.length; x++) for (let y = x + 1; y < EL.length; y++) for (let z = Math.max(y + 1, EL_OLD_N); z < EL.length; z++) NEW_TRIPLES.push([EL[x].id, EL[y].id, EL[z].id]);
function makeSpecialN(prefix, k, titles) {
  let els = null;
  for (let t = 0; t < NEW_TRIPLES.length && !els; t++) {
    const tr = NEW_TRIPLES[((k + (prefix === 'M' ? 500 : 0)) * 97 + t * 31) % NEW_TRIPLES.length];
    if (!usedTriples.has(tripleKey(tr))) { usedTriples.add(tripleKey(tr)); els = tr; }
  }
  els = els || NEW_TRIPLES[k % NEW_TRIPLES.length];
  const newEl = els.find(x => ELI[x] >= EL_OLD_N);
  const title = `${EL[ELI[newEl]].adj}의 ${titles[(k + 2) % titles.length]}`;
  const look = freshCreature2(title, `${prefix}:n${k}`, hashStr(prefix + 'n' + k) % ALL_CREATURES.length);
  usedNames.add(look.name);
  return { id: `${prefix}:n${k}`, ...look, els, ult: `${EL[ELI[newEl]].adj} ${ULT_WORDS[(k + 4) % ULT_WORDS.length]}` };
}
for (let k = 0; k < LEGEND_NEW; k++) LEGENDS.push(makeSpecialN('L', k, LEG_TITLES));
for (let k = 0; k < MYTHIC_NEW; k++) MYTHICS.push(makeSpecialN('M', k, MYTH_TITLES));
PAIRS.push(...NEW_PAIRS);
// ---- 6차: 40000마리까지 (꾸밈말 + 속성 이름) ----
const PURE_6 = 90, HYB_6 = 80;
const MOD6 = ['아기', '꼬마', '거대', '황금', '무지개', '왕관', '쌍둥이', '수상한', '졸린', '용감한', '장난꾸러기', '털복숭이', '통통한', '날쌘', '고대', '미래'];
const adj6 = (elId, n) => `${MOD6[n % MOD6.length]} ${EL[ELI[elId]].adj}`;
function addPure6(e, n) {
  const group = 'p:' + e.id, id = `${group}:w${n}`, seed = hashStr(group + '#6') + n * 23;
  const look = freshCreature2(adj6(e.id, n), id, seed);
  addMon({ id, group, variant: 1000 + n, ...look, els: [e.id], rarity: RAR_ORDER[rankOfVariant(n, PURE_6, frac(group + '#6'))], mod: variantMod(id) });
}
function addHybrid6(i, j, n) {
  const a = EL[i], b = EL[j], group = `h:${a.id}+${b.id}`, id = `${group}:w${n}`, seed = hashStr(group + '#6') + n * 23;
  const look = freshCreature2(adj6(n % 2 ? b.id : a.id, Math.floor(n / 2) + i * 3 + j), id, seed);
  addMon({ id, group, variant: 1000 + n, ...look, els: [a.id, b.id], rarity: RAR_ORDER[rankOfVariant(n, HYB_6, frac(group + '#6'))], mod: variantMod(id) });
}
EL.forEach(e => { for (let n = 0; n < PURE_6; n++) addPure6(e, n); });
PAIRS.forEach(([i, j]) => { for (let n = 0; n < HYB_6; n++) addHybrid6(i, j, n); });
LEGENDS.forEach(l => addMon({ ...l, rarity: 'legendary' }));
MYTHICS.forEach(m => addMon({ ...m, rarity: 'mythic' }));
SHOP_LEGENDS.forEach(l => addMon({ ...l, rarity: l.rank || 'divine', shop: true }));
// ---- 🔺 7차: 높은 등급 몬스터를 새로 만들어 피라미드 모양으로 ----
const PYR_TOP = { origin: 15, absolute: 22, holy: 33, divine: 50, legendary: 120 };
const PYR_TITLES = {
  legendary: LEG_TITLES,
  divine: ['수호신', '천신', '성령', '신수', '빛의 신'],
  holy: ['성자', '대천사', '성룡', '성왕', '천사왕'],
  absolute: ['절대자', '지배자', '패왕', '황제', '천하무적'],
  origin: ['창조신', '태초', '시원', '근원신', '만물의 왕'],
};
const ALL_TRIPLES = [];
for (let x = 0; x < EL.length; x++) for (let y = x + 1; y < EL.length; y++) for (let z = y + 1; z < EL.length; z++) ALL_TRIPLES.push([EL[x].id, EL[y].id, EL[z].id]);
Object.entries(PYR_TOP).forEach(([rk, want]) => {
  const have = CAT_LIST.filter(c => c.rarity === rk).length;
  for (let k = 0; k < want - have; k++) {
    let els = null;
    for (let t = 0; t < ALL_TRIPLES.length && !els; t++) {
      const tr = ALL_TRIPLES[((k + RANK[rk] * 131) * 211 + t * 37) % ALL_TRIPLES.length];
      if (!usedTriples.has(tripleKey(tr))) { usedTriples.add(tripleKey(tr)); els = tr; }
    }
    els = els || ALL_TRIPLES[(k * 7 + RANK[rk]) % ALL_TRIPLES.length];
    const titles = PYR_TITLES[rk], id = `P:${rk}:${k}`;
    const title = `${EL[ELI[els[k % 3]]].adj}의 ${titles[k % titles.length]}`;
    const look = freshCreature2(title, id, hashStr(id) % ALL_CREATURES.length);
    usedNames.add(look.name);
    addMon({ id, ...look, els, rarity: rk, ult: `${EL[ELI[els[(k + 1) % 3]]].adj} ${ULT_WORDS[k % ULT_WORDS.length]}` });
  }
});
// 서사 ~ 일반: 피라미드 (위로 갈수록 1.25배씩 줄어든다). 처음 몬스터(대표)는 그대로 일반
{
  const NORMAL = RAR_ORDER.slice(0, RANK.epic + 1);   // common ~ epic
  const pool = CAT_LIST.filter(c => !c.shop && RANK[c.rarity] <= RANK.epic);
  const keepCommon = (c) => c.variant === 0 || !c.group;
  const R = 1.25, N = NORMAL.length, unit = pool.length * (R - 1) / (Math.pow(R, N) - 1);
  // 높은 등급부터 몇 마리씩 (epic이 가장 적고, common이 가장 많다)
  const want = NORMAL.map((_, i) => Math.round(unit * Math.pow(R, N - 1 - i)));
  want[0] += pool.length - want.reduce((s, x) => s + x, 0);
  // 원래 높던 몬스터일수록 높은 등급을 받는다 (같으면 이름표 순서로 섞기)
  const order = pool.slice().sort((a, b) => (keepCommon(a) - keepCommon(b)) || (RANK[b.rarity] - RANK[a.rarity]) || (frac(a.id + '#pyr') - frac(b.id + '#pyr')));
  let at = 0;
  for (let i = N - 1; i >= 0; i--) for (let n = 0; n < want[i] && at < order.length; n++) order[at++].rarity = NORMAL[i];
  while (at < order.length) order[at++].rarity = 'common';
}
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
// 등급별로 더 낮추기: 근원은 위 확률의 1/10만 (15% → 1.5%, 8% → 0.8%, 2% → 0.2%)
const SHOP_BREED_MUL = { origin: 0.1 };
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
      const p = R >= lo ? (SHOP_BREED_CHANCE[R - lo] || 0) * (SHOP_BREED_MUL[key] || 1) : 0;   // 부모보다 낮은 등급은 안 나온다
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
const PLOTS = ISLAND_PLOTS * ISLANDS.length;   // 처음부터 있는 섬 18개
// 새로 살 수 있는 섬 (19번 ~ 100번). 저장된 S.plots 길이 = 가진 섬 수 × 25
const ISL_BASE = ISLANDS.length, ISL_MAX = 100;
{
  const NEW_ISL = [['🏰', '성'], ['🌊', '파도'], ['🎃', '호박'], ['🍦', '아이스크림'], ['🎪', '서커스'], ['🦖', '공룡'], ['🐉', '용'], ['🌺', '꽃'],
    ['⚡', '번개'], ['🧊', '빙하'], ['🌾', '들판'], ['🎵', '음악'], ['🤖', '로봇'], ['🧙', '마법'], ['🐼', '판다'], ['🦩', '홍학'], ['🍕', '피자'], ['🏯', '궁전'],
    ['🐝', '꿀벌'], ['🌵', '선인장'], ['🎮', '게임'], ['🪐', '행성'], ['🧸', '장난감'], ['🐳', '고래'], ['🦚', '공작'], ['🍉', '수박'], ['🗻', '설산'], ['🕸️', '거미'],
    ['🪸', '산호'], ['🌻', '해바라기'], ['🎄', '크리스마스'], ['🦁', '사바나']];
  const EXTRA_DECOR = ['✨', '🌟', '🌿', '🪨', '🌼', '🍄'];
  for (let k = ISL_BASE; k < ISL_MAX; k++) {
    const n = k - ISL_BASE, [e, nm] = NEW_ISL[n % NEW_ISL.length], round = Math.floor(n / NEW_ISL.length);
    const h = (n * 47) % 360;
    ISLANDS.push({ name: `${nm} 섬${round ? ' ' + (round + 1) : ''}`, emoji: e, grass: [`hsl(${h}, 60%, 62%)`, `hsl(${h}, 55%, 36%)`], sand: `hsl(${(h + 40) % 360}, 55%, 82%)`,
      decor: [e, e, ...EXTRA_DECOR.slice(n % 3, n % 3 + 4)] });
  }
}
const islCount = () => Math.max(ISL_BASE, Math.min(ISL_MAX, Math.floor(((typeof S !== 'undefined' && S && S.plots) ? S.plots.length : PLOTS) / ISLAND_PLOTS)));
const islPrice = () => Math.round(1e8 * Math.pow(5, islCount() - ISL_BASE));
const islandOf = (i) => Math.floor(i / ISLAND_PLOTS);
const islandRange = (k) => Array.from({ length: ISLAND_PLOTS }, (_, n) => k * ISLAND_PLOTS + n);
const islandLabel = (i) => ISLANDS[islandOf(i)].emoji + (islandOf(i) + 1);
const HATCH_CAP = 3;
const BREED_LV = 4;
const MAX_LV = 20;
const HAB_MAX_LV = 100;
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
// 🗽 랜드마크: 아주 비싼 대형 건물. 한 종류에 하나씩, 모든 섬의 골드를 올린다
DECOS.push(
  { id: 'w_statue',  name: '자유의 여신상', emoji: '🗽', cost: 1e7,  bonus: 0, wonder: true, global: 5 },
  { id: 'w_temple',  name: '황금 신전',     emoji: '🛕', cost: 1e8,  bonus: 0, wonder: true, global: 8 },
  { id: 'w_castle',  name: '천공의 성',     emoji: '🏯', cost: 1e9,  bonus: 0, wonder: true, global: 12 },
  { id: 'w_volcano', name: '용암 화산',     emoji: '🌋', cost: 5e9,  bonus: 0, wonder: true, global: 15 },
  { id: 'w_rocket',  name: '우주 로켓',     emoji: '🚀', cost: 2e10, bonus: 0, wonder: true, global: 20 },
  { id: 'w_bridge',  name: '무지개 다리',   emoji: '🌉', cost: 1e11, bonus: 0, wonder: true, global: 25 },
  { id: 'w_ufo',     name: '외계인 기지',   emoji: '🛸', cost: 1e12, bonus: 0, wonder: true, global: 35 },
  { id: 'w_galaxy',  name: '은하 관측소',   emoji: '🔭', cost: 1e13, bonus: 0, wonder: true, global: 50 },
);
const DECO_CAP = 30;
const decoById = (id) => DECOS.find(d => d.id === id);
const decoPrice = (d) => d.gems ? `💎 ${d.gems}` : `💰 ${fmt(d.cost)}`;
let DECO_MEMO = { t: -1e9, s: null, m: {} };
function decoPercent(k) {
  const now = performance.now();
  if (DECO_MEMO.s !== S || now - DECO_MEMO.t > 1000) DECO_MEMO = { t: now, s: S, m: {} };
  if (DECO_MEMO.m[k] == null) DECO_MEMO.m[k] = decoPercentRaw(k);
  return DECO_MEMO.m[k];
}
function decoPercentRaw(k) {
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
const habUpCost = (lv) => Math.round(400 * lv * lv * (lv > 10 ? Math.pow(1.15, lv - 10) : 1));

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
    // 예전 섬이 없으면 "처음 온 사람" → 켜자마자 계정을 꼭 만들게 한다 (auto 표시)
    list = [{ id, name, pin: null, created: Date.now(), ...(old ? {} : { auto: true }) }];
    saveAccounts(list);
    if (old) lsSet(accKey(id), old);
    lsSet(ACC_CUR, id);
  }
  ACC = list.find(a => a.id === lsGet(ACC_CUR)) || list[0];
})();
const SECRET_CODE = '방탄유리';
const CE_CODE = '우주부자';   // 💰 3Ce 선물 (계정마다 한 번)
// ----- 🔒 계정 잠금 (관리자): 정해진 시간까지 그 계정으로 못 들어간다. 시간이 지나면 저절로 풀린다 -----
// name: 계정 이름(대소문자 무시) · rid: 랭킹 id
const ACC_LOCKS = [
  { name: 'jiho0523', rid: 'e8th0emsajnf', until: 1790718290970 },   // 12시간 잠금 (한국 시간 2026-09-30 06:44까지)
];
function accLocked(a) {
  if (!a) return null;
  let rid = '', nick = '';
  try { const d = JSON.parse(readSave(a.id) || 'null'); if (d) { rid = d.rankId || ''; nick = String(d.nick || ''); } } catch (e) { /* 저장 없음 */ }
  const nm = String(a.name || '').trim().toLowerCase();
  return ACC_LOCKS.find(l => Date.now() < l.until && (nm === l.name || nick.trim().toLowerCase() === l.name || (rid && rid === l.rid))) || null;
}
function lockLeft(l) {
  const s = Math.max(0, Math.ceil((l.until - Date.now()) / 1000));
  return `${Math.floor(s / 3600)}시간 ${Math.floor(s % 3600 / 60)}분`;
}
function lockToast(a, l) { toast(`🔒 ${a.name} 계정은 잠겨 있어요. ${lockLeft(l)} 뒤에 풀려요`); }

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
    const raw = readSave(id);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (!s || !Array.isArray(s.monsters) || !Array.isArray(s.plots)) return null;
    while (s.plots.length < PLOTS) s.plots.push(null);
    if (s.plots.length % ISLAND_PLOTS) while (s.plots.length % ISLAND_PLOTS) s.plots.push(null);
    if ((s.isl || 0) * ISLAND_PLOTS >= s.plots.length) s.isl = 0;   // 예전(섬 1개) 저장도 이어 하기
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

// 🗜️ 저장 압축 (LZ 방식, 글자 하나에 15비트씩 담는다)
function lzPack(str) {
  const out = [];
  let val = 0, pos = 0;
  const put = (v, n) => { for (let i = 0; i < n; i++) { val = (val << 1) | (v & 1); v >>= 1; if (pos === 14) { out.push(String.fromCharCode(val + 32)); val = 0; pos = 0; } else pos++; } };
  // 사전을 나무(trie) 모양으로: 글자를 이어 붙이지 않아서 빠르다
  const root = new Map(), fresh = new Set();
  let enlarge = 2, size = 3, bits = 2;
  const bump = () => { if (--enlarge === 0) { enlarge = Math.pow(2, bits); bits++; } };
  const emit = (node) => {
    if (node.single !== undefined && fresh.has(node.single)) {
      const code = node.single;
      if (code < 256) { put(0, bits); put(code, 8); } else { put(1, bits); put(code, 16); }
      bump();
      fresh.delete(code);
    } else put(node.code, bits);
    bump();
  };
  let w = null;
  for (let k = 0; k < str.length; k++) {
    const c = str.charCodeAt(k);
    let one = root.get(c);
    if (!one) { one = { code: size++, kids: new Map(), single: c }; root.set(c, one); fresh.add(c); }
    if (w === null) { w = one; continue; }
    const nx = w.kids.get(c);
    if (nx) { w = nx; continue; }
    emit(w);
    w.kids.set(c, { code: size++, kids: new Map() });
    w = one;
  }
  if (w !== null) emit(w);
  put(2, bits);
  for (;;) { val <<= 1; if (pos === 14) { out.push(String.fromCharCode(val + 32)); break; } pos++; }
  return out.join('') + ' ';
}
function lzUnpack(s) {
  const len = s.length;
  let idx = 0, cur = s.charCodeAt(idx++) - 32, mask = 16384;
  const get = (n) => {
    let r = 0;
    for (let p = 0; p < n; p++) {
      const b = cur & mask;
      mask >>= 1;
      if (mask === 0) { mask = 16384; cur = s.charCodeAt(idx++) - 32; }
      if (b) r |= (1 << p);
    }
    return r;
  };
  const dict = [0, 1, 2];
  let enlarge = 4, size = 4, bits = 3;
  let t = get(2), c;
  if (t === 2) return '';
  c = String.fromCharCode(get(t === 0 ? 8 : 16));
  dict[3] = c;
  let w = c;
  const res = [c];
  for (;;) {
    if (idx > len) return null;
    let code = get(bits);
    if (code === 2) return res.join('');
    if (code === 0 || code === 1) { dict[size++] = String.fromCharCode(get(code === 0 ? 8 : 16)); code = size - 1; if (--enlarge === 0) { enlarge = Math.pow(2, bits); bits++; } }
    let entry;
    if (dict[code] !== undefined) entry = dict[code];
    else if (code === size) entry = w + w[0];
    else return null;
    res.push(entry);
    dict[size++] = w + entry[0];
    w = entry;
    if (--enlarge === 0) { enlarge = Math.pow(2, bits); bits++; }
  }
}
// 큰 저장은 압축해서 넣는다 ("Z1:" 표시). 작은 저장은 그대로 (빠르게)
const SAVE_ZIP_AT = 100000;
function readSave(id) {
  const raw = lsGet(accKey(id));
  if (!raw) return null;
  if (raw.startsWith('Z1:')) { try { return lzUnpack(raw.slice(3)); } catch (e) { return null; } }
  return raw;
}
// 다시 받을 수 있는 것(랭킹 보관함)부터 비워서 자리를 만든다
function freeStorage() {
  let n = 0;
  try { for (let k = localStorage.length - 1; k >= 0; k--) { const key = localStorage.key(k); if (key && key.startsWith('combining-rankstore-')) { localStorage.removeItem(key); n++; } } } catch (e) { /* 저장소 없음 */ }
  return n;
}
function writeSave(id, objOrJson) {
  const json = typeof objOrJson === 'string' ? objOrJson : JSON.stringify(objOrJson);
  const data = json.length > SAVE_ZIP_AT ? 'Z1:' + lzPack(json) : json;
  if (lsSet(accKey(id), data)) return data.length;
  freeStorage();
  return lsSet(accKey(id), data) ? data.length : 0;
}
// 다른 계정의 예전(압축 안 된) 큰 저장도 압축해서 자리를 아낀다
function compactAllSaves() {
  accounts().forEach(a => { const raw = lsGet(accKey(a.id)); if (raw && !raw.startsWith('Z1:') && raw.length > SAVE_ZIP_AT) writeSave(a.id, raw); });
}
// 저장은 1.5초 동안 모아서 한 번에 (압축이 오래 걸리지 않게). 창을 닫거나 숨길 때는 바로
let SAVE_T = null, SAVE_ACC = null, SAVE_S = null, lastSaved = {}, lastFullWarn = 0;
let SAVE_SEQ = 0, ZIP_W, ZIP_BUSY = false;
const savedSeq = {};
const fullWarn = () => { if (Date.now() - lastFullWarn > 60000) { lastFullWarn = Date.now(); toast('⚠️ 저장 공간이 부족해요! 안 쓰는 계정을 지우면 자리가 생겨요'); } };
function zipWorker() {
  if (ZIP_W === undefined) {
    try {
      const src = lzPack.toString() + ';onmessage=(e)=>{const d=e.data;postMessage({acc:d.acc,seq:d.seq,json:d.json,z:lzPack(d.json)});};';
      ZIP_W = new Worker(URL.createObjectURL(new Blob([src], { type: 'text/javascript' })));
      ZIP_W.onmessage = (e) => {
        ZIP_BUSY = false;
        const { acc, seq, json, z } = e.data;
        if ((savedSeq[acc] || 0) > seq) return;   // 그사이 더 새것이 저장됐으면 버린다
        let ok = lsSet(accKey(acc), 'Z1:' + z);
        if (!ok) { freeStorage(); ok = lsSet(accKey(acc), 'Z1:' + z); }
        if (ok) { savedSeq[acc] = seq; lastSaved[acc] = json; } else fullWarn();
      };
      ZIP_W.onerror = () => { ZIP_W = null; ZIP_BUSY = false; };
    } catch (e) { ZIP_W = null; }
  }
  return ZIP_W;
}
// urgent: 지금 바로 (창을 닫을 때 등). 아니면 큰 저장은 도우미에게 맡긴다
function flushSave(urgent = true) {
  clearTimeout(SAVE_T); SAVE_T = null;
  const acc = SAVE_ACC, s = SAVE_S;
  SAVE_ACC = SAVE_S = null;
  if (!acc || !s) return true;
  const json = JSON.stringify(s);
  if (lastSaved[acc] === json) return true;
  const seq = ++SAVE_SEQ;
  if (!urgent && json.length > SAVE_ZIP_AT) {
    const w = zipWorker();
    if (w && !ZIP_BUSY) { ZIP_BUSY = true; w.postMessage({ acc, seq, json }); return true; }
    if (w && ZIP_BUSY) { SAVE_ACC = acc; SAVE_S = s; SAVE_T = setTimeout(() => flushSave(false), 800); return true; }
  }
  const ok = writeSave(acc, json);
  if (ok) { lastSaved[acc] = json; savedSeq[acc] = seq; } else fullWarn();
  return !!ok;
}
function storageUsedKB() { let n = 0; try { for (let k = 0; k < localStorage.length; k++) { const key = localStorage.key(k); n += key.length + (localStorage.getItem(key) || '').length; } } catch (e) { /* 없음 */ } return Math.round(n * 2 / 1024); }

// 💾 지금 저장하기: 저장이 잘 됐는지 다시 읽어서 확인한다
function saveNow() {
  if (VISIT) { toast('👀 친구 섬 구경 중에는 저장하지 않아요'); return; }
  if (!ACC) { toast('계정에 들어간 다음에 저장할 수 있어요'); return; }
  S.last = Date.now();
  flushSave();
  const json = JSON.stringify(S), size = writeSave(ACC.id, json);
  const ok = size && readSave(ACC.id) === json;
  if (ok) { lastSaved[ACC.id] = json; savedSeq[ACC.id] = ++SAVE_SEQ; }
  const data = { length: size };
  if (!ok) { sfx('err'); toast('⚠️ 저장하지 못했어요! 저장 공간이 부족해요. 안 쓰는 계정을 지우면 자리가 생겨요'); return; }
  S.savedAt = Date.now();
  tutFlag('saveNow', true);
  sfx('coin');
  const t = new Date(), hh = String(t.getHours()).padStart(2, '0'), mm = String(t.getMinutes()).padStart(2, '0'), ss = String(t.getSeconds()).padStart(2, '0');
  toast(`💾 저장했어요! (${hh}:${mm}:${ss} · ${Math.ceil(data.length * 2 / 1024)}KB · 전체 ${fmt(storageUsedKB())}KB 사용)`);
  const b = document.getElementById('saveBtn');
  if (b) { b.classList.remove('saved'); void b.offsetWidth; b.classList.add('saved'); }
}
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && (e.key === 's' || e.key === 'S' || e.key === 'ㄴ')) { e.preventDefault(); saveNow(); }
});
function save() {
  if (VISIT) return;   // 친구 섬 구경 중에는 저장하지 않는다
  if (!ACC) return;
  // 다른 계정/섬으로 바뀌었으면 앞의 것부터 저장
  if (SAVE_ACC && (SAVE_ACC !== ACC.id || SAVE_S !== S)) flushSave();
  SAVE_ACC = ACC.id; SAVE_S = S;
  if (!SAVE_T) SAVE_T = setTimeout(() => flushSave(false), 1500);
}

let S = load() || newState();
['gold', 'gems', 'food'].forEach(k => { if (typeof S[k] === 'number' && !(S[k] < 1e305)) S[k] = 1e305; });
// 돌아왔을 때 "없는 동안 쌓인 골드"를 보여 주려고 켤 때의 상태를 기억
const AWAY = { sec: (Date.now() - (S.last || Date.now())) / 1000, gold0: S.plots.reduce((s, p) => s + (p && p.kind === 'hab' ? p.gold || 0 : 0), 0) };

// ===================== 계산 =====================
const byUid = (uid) => S.monsters.find(m => m.uid === Number(uid));
const monIncome = (m) => RAR[CAT[m.type].rarity].income * m.lv * (1 + 0.3 * (m.star || 0));
let HABIDX = null, HABIDX_REF = null, HABIDX_LEN = -1;
const habIdxDirty = () => { HABIDX = null; };
function habMons(i) {
  const ms = S.monsters;
  if (!HABIDX || HABIDX_REF !== ms || HABIDX_LEN !== ms.length) {
    HABIDX = new Map();
    for (const m of ms) { let a = HABIDX.get(m.hab); if (!a) HABIDX.set(m.hab, (a = [])); a.push(m); }
    HABIDX_REF = ms; HABIDX_LEN = ms.length;
  }
  const a = HABIDX.get(i);
  return a ? a.slice() : [];
}
// 서식지에 들어갈 수 있는 몬스터 수 = 레벨 (최소 2마리, Lv.100이면 100마리). 쌓이는 골드는 무제한
const habCap = (i) => Math.max(2, S.plots[i].lv);
const habLvBonus = (i) => (S.plots[i].lv - 1) * HAB_LV_BONUS;
const habIncome = (i) => habMons(i).reduce((s, m) => s + monIncome(m), 0) * (1 + (habLvBonus(i) + decoPercent(islandOf(i)) + guildPct() + petPct('gold') + kdLv('gold') * 10 + wonderPct()) / 100) * (boostOn() ? 2 : 1) * evtGoldMult(S.plots[i].el);
const habGoldCap = () => Infinity;
const feedCost = (m) => m.lv * 20;
const sellPrice = (m) => Math.round(RAR[CAT[m.type].rarity].cost * 0.5 * (1 + m.lv * 0.2));
const breedCost = (a, b) => Math.round(RAR[RAR_ORDER[Math.max(rIdx(a.type), rIdx(b.type))]].cost * (1 - Math.min(80, petPct('discount') + kdLv('lab') * 3) / 100));
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
    hp: Math.round(r.hp * md.hp * (1 + 0.12 * (m.lv - 1)) * (1 + rb.hp / 100) * (1 + 0.2 * (m.star || 0))),
    atk: Math.round(r.atk * md.atk * (1 + 0.1 * (m.lv - 1)) * (1 + rb.atk / 100) * (1 + 0.2 * (m.star || 0))),
    spd: Math.round((r.spd + sp) * md.spd * (1 + 0.01 * (m.lv - 1)) * (1 + rb.spd / 100)),
  };
}

function spend(cost, cur = 'gold') {
  if (S.infinite) return true;
  if (S[cur] < cost) { sfx('err'); toast(cur === 'gold' ? '💰 골드가 부족해요' : '💎 보석이 부족해요'); return false; }
  S[cur] -= cost;
  return true;
}
// 골드·보석이 너무 커져서 저장이 깨지지 않게 1e305에서 멈춘다 (3Ce = 3×10^303도 들어가게)
const MONEY_CAP = 1e305;
function earn(n, cur = 'gold') { if (!S.infinite) S[cur] = Math.min(MONEY_CAP, S[cur] + n); }
// 모험 골드: 50스테이지까지는 1.25배씩, 그 뒤로는 1.03배씩만 (예전엔 끝없이 1.25배라 숫자가 폭발했음)
const stageGold = (st) => st <= 50 ? 120 * Math.pow(1.25, st - 1) : 120 * Math.pow(1.25, 49) * Math.pow(st / 50, 2.5);

// ----- 효과음 -----
let AC = null;
// 🔇 무음 모드가 켜져 있으면 음악·효과음 모두 끈다
function muteOn() { return lsGet('combining-mute') === 'on'; }
const soundOn = () => !muteOn() && lsGet('combining-sound') !== 'off';
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
let lastFastSfx = 0;
function sfx(kind) {
  if (!soundOn() || !SFX[kind]) return;
  if (typeof B !== 'undefined' && B && LOOP && bSpeed() >= 25) { const n = performance.now(); if (n - lastFastSfx < 300) return; lastFastSfx = n; }
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
const musicOn = () => !muteOn() && lsGet('combining-music') !== 'off';
// 화음: [베이스, 위에 쌓는 음들]  (MIDI 번호. 60 = 가운데 도)
const CH = {
  Am: [33, 57, 60, 64], F: [29, 57, 60, 65], C: [36, 55, 60, 64], G: [31, 55, 59, 62], E: [28, 56, 59, 64],
  Dm: [26, 57, 62, 65], Bb: [34, 58, 62, 65], A: [33, 57, 61, 64], Gm: [31, 55, 58, 62],
  Fmaj7: [29, 57, 60, 64], Em7: [28, 55, 59, 62], Dm7: [26, 57, 60, 65], G7: [31, 53, 59, 62],
  Cmaj7: [36, 55, 59, 64], Am7: [33, 55, 60, 64], Em9: [28, 54, 59, 62], Bsus: [35, 54, 59, 64], B7: [35, 54, 59, 63],
  D: [26, 57, 62, 66],
};
// 곡의 2부(B): 다른 화음과 멜로디. form = 곡 순서 (도입 → A → B → A 변형 …) 라서 같은 부분만 계속 반복되지 않는다
//   noMel: 멜로디 없이 / oct: 멜로디 한 옥타브 올리기 / noDrums, noArp: 그 악기 빼기
const SONG_B = {
  island: {
    chords: ['F', 'G', 'Em7', 'Am', 'F', 'G', 'C', 'E'],
    melody: [[72, 4], [74, 4], [76, 4], [74, 2], [72, 2], [71, 6], [0, 2], [69, 8],
      [72, 2], [74, 2], [77, 4], [79, 4], [77, 2], [76, 2], [76, 4], [74, 2], [72, 2], [71, 8]],
    form: [{ p: 'A', noMel: 1 }, { p: 'A' }, { p: 'B' }, { p: 'A', oct: 12, noArp: 1 }, { p: 'B', noArp: 1 }, { p: 'A' }],
  },
  shop: {
    chords: ['Am7', 'Dm7', 'G7', 'Cmaj7', 'Fmaj7', 'Em7', 'Dm7', 'G7'],
    melody: [[76, 2], [74, 2], [72, 3], [0, 1], [77, 2], [76, 1], [74, 1], [72, 4], [71, 2], [74, 2], [77, 2], [76, 2], [76, 6], [0, 2],
      [72, 1], [74, 1], [76, 2], [77, 2], [79, 2], [79, 3], [77, 1], [76, 4], [74, 2], [72, 2], [71, 2], [69, 2], [71, 6], [0, 2]],
    form: [{ p: 'A', noMel: 1 }, { p: 'A' }, { p: 'B' }, { p: 'A', oct: 12 }, { p: 'B', noDrums: 1 }, { p: 'A' }],
  },
  dex: {
    chords: ['Cmaj7', 'D', 'Em9', 'Em9', 'Am7', 'D', 'Bsus', 'B7'],
    melody: [[74, 4], [76, 4], [78, 6], [0, 2], [79, 4], [78, 2], [76, 2], [71, 8],
      [72, 4], [74, 2], [76, 2], [78, 8], [76, 4], [74, 4], [71, 6], [0, 2]],
    form: [{ p: 'A', noMel: 1 }, { p: 'A' }, { p: 'B' }, { p: 'A', oct: 12 }, { p: 'B', noArp: 1 }, { p: 'A', noMel: 1 }],
  },
  battle: {
    chords: ['Gm', 'Dm', 'Bb', 'F', 'Gm', 'Bb', 'C', 'A'],
    melody: [[67, 3], [69, 1], [70, 4], [69, 4], [65, 4], [70, 2], [72, 2], [74, 4], [72, 6], [0, 2],
      [74, 2], [72, 2], [70, 2], [67, 2], [70, 4], [74, 4], [76, 3], [74, 1], [72, 4], [73, 8]],
    form: [{ p: 'A', noMel: 1 }, { p: 'A' }, { p: 'B' }, { p: 'A', oct: 12 }, { p: 'B' }, { p: 'A', noMel: 1, noArp: 1 }, { p: 'A', oct: 12 }],
  },
};
// 곡마다: 빠르기, 화음 8마디, 멜로디 [음, 8분음표 길이] (0 = 쉼표), 쓰는 악기
const SONGS = {
  // 🏝️ 섬: 잔잔한 판타지 (현악 패드 + 피아노 아르페지오 + 종소리 멜로디)
  island: {
    bpm: 78, vol: 1, echo: 0.28, lead: 'bell', pad: true, bass: 'long', arp: 'piano', drums: 'none',
    chords: ['Am', 'F', 'C', 'G', 'Am', 'F', 'G', 'Am'],
    melody: [[76, 3], [74, 1], [72, 4], [69, 4], [72, 2], [74, 2], [76, 6], [79, 2], [74, 8],
      [76, 3], [77, 1], [79, 4], [81, 4], [79, 2], [77, 2], [76, 3], [74, 1], [71, 4], [69, 8]],
  },
  // 🛒 상점: 느긋한 재즈 라운지 (일렉 피아노 + 걸어 다니는 베이스 + 브러시 드럼, 스윙)
  shop: {
    bpm: 96, vol: 1.3, echo: 0.15, lead: 'keys', comp: true, bass: 'walk', arp: 'none', drums: 'brush', swing: 0.3,
    chords: ['Fmaj7', 'Em7', 'Dm7', 'G7', 'Cmaj7', 'Am7', 'Dm7', 'G7'],
    melody: [[69, 2], [72, 2], [76, 3], [0, 1], [74, 2], [71, 1], [74, 1], [79, 4], [77, 2], [76, 2], [74, 2], [72, 2], [71, 6], [0, 2],
      [72, 2], [76, 2], [79, 3], [0, 1], [81, 2], [79, 1], [76, 1], [72, 4], [74, 2], [77, 2], [76, 2], [74, 2], [71, 4], [74, 2], [0, 2]],
  },
  // 📖 도감: 신비로운 앰비언트 (긴 패드 + 드문드문 종소리, 메아리 많이)
  dex: {
    bpm: 66, vol: 1, echo: 0.38, lead: 'bell', pad: true, bass: 'long', arp: 'sparse', drums: 'none',
    chords: ['Em9', 'Cmaj7', 'Am7', 'Bsus', 'Em9', 'Cmaj7', 'Am7', 'B7'],
    melody: [[71, 4], [0, 4], [67, 2], [71, 2], [74, 4], [72, 6], [0, 2], [71, 8],
      [78, 4], [76, 2], [74, 2], [71, 4], [0, 4], [72, 2], [76, 2], [79, 4], [78, 8]],
  },
  // ⚔️ 전투: 웅장한 오케스트라 (낮은 현악 반복 + 금관 멜로디 + 둥둥 큰북)
  battle: {
    bpm: 116, vol: 1.25, echo: 0.18, lead: 'brass', pad: true, bass: 'drive', arp: 'none', drums: 'taiko',
    chords: ['Dm', 'Bb', 'C', 'A', 'Dm', 'Bb', 'Gm', 'A'],
    melody: [[62, 2], [65, 2], [69, 4], [70, 3], [69, 1], [65, 4], [67, 2], [69, 2], [72, 4], [69, 6], [0, 2],
      [74, 3], [72, 1], [69, 2], [65, 2], [70, 4], [74, 4], [72, 2], [70, 2], [67, 2], [70, 2], [69, 4], [61, 4]],
  },
};
const MUS = { cur: null, gain: null, timer: null, next: 0, step: 0, started: false, noise: null, bus: null, wet: null };
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
function audioCtx() {
  try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
  return AC;
}
// 음악이 모이는 곳 + 메아리(에코)
function musicBus() {
  if (MUS.bus) return MUS.bus;
  const bus = AC.createGain(), delay = AC.createDelay(1), fb = AC.createGain(), damp = AC.createBiquadFilter(), wet = AC.createGain();
  delay.delayTime.value = 0.34; fb.gain.value = 0.32; damp.type = 'lowpass'; damp.frequency.value = 2600; wet.gain.value = 0.25;
  bus.connect(AC.destination);
  bus.connect(delay); delay.connect(damp); damp.connect(fb); fb.connect(delay); damp.connect(wet); wet.connect(AC.destination);
  MUS.bus = bus; MUS.wet = wet;
  return bus;
}
// 악기 하나: 발진기 여러 개 → 저역 필터 → 음량 곡선
function voice(dest, t, freq, dur, o) {
  const f = AC.createBiquadFilter(), g = AC.createGain();
  f.type = 'lowpass'; f.frequency.value = o.cutoff || 20000; f.Q.value = o.q || 0.7;
  const a = o.attack || 0.01, rel = o.release || 0.2, peak = o.vol;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(peak, t + a);
  if (o.decay) g.gain.exponentialRampToValueAtTime(Math.max(0.0001, peak * 0.02), t + a + o.decay);
  else { g.gain.setValueAtTime(peak, t + Math.max(a, dur - rel)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + rel); }
  f.connect(g); g.connect(dest);
  const stopAt = t + (o.decay ? a + o.decay : dur + rel) + 0.05;
  (o.oscs || [{ type: 'sine' }]).forEach(s => {
    const osc = AC.createOscillator();
    osc.type = s.type; osc.frequency.value = freq * (s.mul || 1); osc.detune.value = s.detune || 0;
    if (s.gain != null && s.gain !== 1) { const sg = AC.createGain(); sg.gain.value = s.gain; osc.connect(sg); sg.connect(f); } else osc.connect(f);
    osc.start(t); osc.stop(stopAt);
  });
}
const INST = {
  pad:    (d, t, m, dur, v) => voice(d, t, hz(m), dur, { vol: 0.02 * v, attack: 0.9, release: 1.2, cutoff: 1100, oscs: [{ type: 'sawtooth', detune: -8 }, { type: 'sawtooth', detune: 8 }] }),
  bell:   (d, t, m, dur, v) => voice(d, t, hz(m), dur, { vol: 0.075 * v, attack: 0.005, decay: Math.max(1.2, dur * 1.2), cutoff: 5000, oscs: [{ type: 'sine' }, { type: 'sine', mul: 2, gain: 0.25 }, { type: 'triangle', mul: 3, gain: 0.06 }] }),
  keys:   (d, t, m, dur, v) => voice(d, t, hz(m), dur, { vol: 0.07 * v, attack: 0.01, decay: 1.4, cutoff: 3200, oscs: [{ type: 'sine' }, { type: 'triangle', mul: 2, gain: 0.18 }] }),
  brass:  (d, t, m, dur, v) => voice(d, t, hz(m), dur, { vol: 0.05 * v, attack: 0.07, release: 0.18, cutoff: 1700, q: 1.2, oscs: [{ type: 'sawtooth', detune: -5 }, { type: 'sawtooth', detune: 5 }] }),
  piano:  (d, t, m, dur, v) => voice(d, t, hz(m), dur, { vol: 0.03 * v, attack: 0.004, decay: 0.9, cutoff: 2600, oscs: [{ type: 'triangle' }, { type: 'sine', mul: 2, gain: 0.2 }] }),
  comp:   (d, t, m, dur, v) => voice(d, t, hz(m), dur, { vol: 0.022 * v, attack: 0.01, decay: 0.5, cutoff: 2200, oscs: [{ type: 'sine' }, { type: 'triangle', mul: 2, gain: 0.15 }] }),
  bassL:  (d, t, m, dur, v) => voice(d, t, hz(m), dur, { vol: 0.12 * v, attack: 0.05, release: 0.4, cutoff: 420, oscs: [{ type: 'sine' }, { type: 'triangle', mul: 2, gain: 0.3 }] }),
  bassW:  (d, t, m, dur, v) => voice(d, t, hz(m), dur, { vol: 0.12 * v, attack: 0.01, decay: 0.55, cutoff: 700, oscs: [{ type: 'triangle' }, { type: 'sine', gain: 0.6 }] }),
  drive:  (d, t, m, dur, v) => voice(d, t, hz(m), dur, { vol: 0.045 * v, attack: 0.008, decay: 0.22, cutoff: 800, q: 2, oscs: [{ type: 'sawtooth' }, { type: 'sawtooth', mul: 0.5, gain: 0.6 }] }),
};
function mNoise(dest, t, dur, vol, freq, type = 'highpass') {
  if (!MUS.noise) {
    MUS.noise = AC.createBuffer(1, AC.sampleRate * 1.5, AC.sampleRate);
    const d = MUS.noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain();
  s.buffer = MUS.noise; f.type = type; f.frequency.value = freq;
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f); f.connect(g); g.connect(dest);
  s.start(t); s.stop(t + dur + 0.02);
}
// 큰북(타이코)·부드러운 킥: 음 높이가 뚝 떨어지는 사인파
function mDrum(dest, t, vol, from, to, len) {
  const o = AC.createOscillator(), g = AC.createGain();
  o.frequency.setValueAtTime(from, t); o.frequency.exponentialRampToValueAtTime(to, t + len * 0.6);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + len);
  o.connect(g); g.connect(dest); o.start(t); o.stop(t + len + 0.02);
}
// 곡을 8분음표 단위 사건 목록으로 풀어 둔다
function songEvents(song) {
  if (song.byAt) return song.byAt;
  const name = Object.keys(SONGS).find(k => SONGS[k] === song);
  const extra = SONG_B[name] || {};
  const parts = { A: { chords: song.chords, melody: song.melody }, B: extra.chords ? { chords: extra.chords, melody: extra.melody } : { chords: song.chords, melody: song.melody } };
  const form = extra.form || [{ p: 'A' }];
  const ev = [];
  let off = 0;
  form.forEach(sec => {
    const part = parts[sec.p];
    if (!sec.noMel) {
      let pos = 0;
      part.melody.forEach(([m, len]) => { if (m) ev.push({ at: off + pos, k: 'mel', m: m + (sec.oct || 0), len }); pos += len; });
    }
    part.chords.forEach((c, bar) => {
      const ch = CH[c], b0 = off + bar * 8, up = ch.slice(1);
      if (song.pad) up.forEach(m => ev.push({ at: b0, k: 'pad', m, len: 8 }));
      if (song.comp) [2, 6].forEach(st => up.forEach(m => ev.push({ at: b0 + st, k: 'comp', m })));
      // 베이스
      if (song.bass === 'long') ev.push({ at: b0, k: 'bassL', m: ch[0] + 12, len: 8 });
      if (song.bass === 'walk') [0, 2, 4, 6].forEach((st, n) => ev.push({ at: b0 + st, k: 'bassW', m: ch[0] + 12 + [0, 7, 12, 7][n] }));
      if (song.bass === 'drive') for (let st = 0; st < 8; st++) ev.push({ at: b0 + st, k: 'drive', m: ch[0] + 12 + (st % 4 === 3 ? 12 : 0) });
      // 아르페지오 (화음을 한 음씩)
      if (!sec.noArp) {
        if (song.arp === 'piano') for (let st = 0; st < 8; st++) ev.push({ at: b0 + st, k: 'piano', m: up[[0, 1, 2, 1][st % 4]] + (st >= 4 ? 12 : 0) });
        if (song.arp === 'sparse') [0, 3, 5].forEach((st, n) => ev.push({ at: b0 + st, k: 'piano', m: up[n] + 12 }));
      }
      // 드럼
      if (!sec.noDrums && song.drums === 'brush') {
        [0, 4].forEach(st => ev.push({ at: b0 + st, k: 'kickSoft' }));
        [2, 6].forEach(st => ev.push({ at: b0 + st, k: 'brush' }));
        for (let st = 0; st < 8; st++) ev.push({ at: b0 + st, k: 'ride' });
      }
      if (!sec.noDrums && song.drums === 'taiko') {
        [0, 3, 4, 6].forEach(st => ev.push({ at: b0 + st, k: 'taiko' }));
        ev.push({ at: b0 + 7, k: 'tom' });
        if (bar % 2 === 0) ev.push({ at: b0, k: 'cymbal' });
      }
    });
    off += part.chords.length * 8;
  });
  song.len = off;
  song.byAt = Array.from({ length: off }, () => []);
  ev.forEach(x => song.byAt[x.at].push(x));
  return song.byAt;
}
function musicTick() {
  if (!AC || !MUS.cur || AC.state !== 'running') return;
  const song = SONGS[MUS.cur], ev = songEvents(song), e8 = 60 / song.bpm / 2;
  // 멈춰 있다가 다시 켜지면 밀린 음을 한꺼번에 치지 않게
  if (MUS.next < AC.currentTime - 0.05) MUS.next = AC.currentTime + 0.05;
  while (MUS.next < AC.currentTime + 0.4) {
    const at = MUS.step % song.len, dest = MUS.gain, v = song.vol;
    const now = ev[at];
    // 스윙: 뒤쪽 8분음표를 조금 늦게
    const t = MUS.next + (song.swing && at % 2 === 1 ? e8 * song.swing : 0);
    now.forEach(x => {
      if (x.k === 'mel') INST[song.lead](dest, t, x.m, x.len * e8, v);
      else if (INST[x.k]) INST[x.k](dest, t, x.m, (x.len || 1) * e8, v);
      else if (x.k === 'kickSoft') mDrum(dest, t, 0.13 * v, 90, 42, 0.3);
      else if (x.k === 'brush') mNoise(dest, t, 0.16, 0.03 * v, 2600, 'bandpass');
      else if (x.k === 'ride') mNoise(dest, t, 0.08, 0.009 * v, 8000);
      else if (x.k === 'taiko') { mDrum(dest, t, 0.3 * v, 110, 48, 0.55); mNoise(dest, t, 0.12, 0.05 * v, 280, 'lowpass'); }
      else if (x.k === 'tom') mDrum(dest, t, 0.16 * v, 190, 90, 0.3);
      else if (x.k === 'cymbal') mNoise(dest, t, 1.4, 0.018 * v, 6000);
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
  MUS.gain.connect(musicBus());
  MUS.wet.gain.setTargetAtTime(SONGS[name].echo || 0.2, AC.currentTime, 0.3);
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
['pointerdown', 'keydown'].forEach(ev => document.addEventListener(ev, () => { if (AC && AC.state === 'suspended' && !document.hidden && !muteOn()) AC.resume(); }, true));
// 앱을 닫거나 · 다른 앱/창으로 가거나 · 화면이 꺼지면 소리를 완전히 멈춘다
let audioAway = false;
function audioSleep() {
  audioAway = true;
  if (!AC) return;
  if (MUS.gain) { try { MUS.gain.gain.cancelScheduledValues(AC.currentTime); MUS.gain.gain.setValueAtTime(0, AC.currentTime); } catch (e) { /* 이미 멈춤 */ } }
  if (AC.state === 'running') AC.suspend();
}
function audioWake() {
  if (!audioAway || document.hidden || !document.hasFocus()) return;
  audioAway = false;
  if (!AC || muteOn()) return;
  AC.resume();
  MUS.next = Math.max(MUS.next, AC.currentTime + 0.1);
  // 멈출 때 0으로 내린 음악 볼륨을 다시 올리기 (새 곡으로 다시 시작)
  const cur = MUS.cur; MUS.cur = null; setMusic(cur || wantSong());
}
document.addEventListener('visibilitychange', () => { if (document.hidden) audioSleep(); else audioWake(); });
window.addEventListener('pagehide', audioSleep);
window.addEventListener('blur', audioSleep);
document.addEventListener('freeze', audioSleep);
window.addEventListener('focus', audioWake);
window.addEventListener('pageshow', audioWake);
function toggleMute() {
  lsSet('combining-mute', muteOn() ? 'off' : 'on');
  if (muteOn()) {
    setMusic(null);
    if (AC && AC.state === 'running') setTimeout(() => { if (muteOn() && AC) AC.suspend(); }, 700);
    toast('🔇 무음 모드: 음악과 효과음을 모두 껐어요');
  } else {
    audioCtx();
    if (AC && AC.state === 'suspended' && !document.hidden) AC.resume();
    MUS.started = true;
    setMusic(wantSong());
    toast('🔊 무음 모드를 껐어요');
    sfx('coin');
  }
  updateMuteBtn();
  if ($('#modalBox .menu-sheet')) openMenu();
}
function updateMuteBtn() {
  const b = $('#muteBtn');
  if (!b) return;
  b.textContent = muteOn() ? '🔇' : '🔊';
  b.classList.toggle('on', muteOn());
  b.title = muteOn() ? '무음 모드 켜짐 (누르면 소리 켜기)' : '무음 모드 켜기';
}
function toggleMusic() {
  if (muteOn()) lsSet('combining-mute', 'off');
  lsSet('combining-music', musicOn() ? 'off' : 'on');
  if (musicOn()) { MUS.started = true; audioCtx(); if (AC && AC.state === 'suspended') AC.resume(); setMusic(wantSong()); } else setMusic(null);
  toast(musicOn() ? '🎵 배경음악을 켰어요' : '🎵 배경음악을 껐어요');
  openAccountMenu();
}

// ===================== 🏛️ 왕국 발전 (골드를 크게 쓰는 곳) =====================
// 끝없이 올릴 수 있고, 레벨마다 값이 몇 배씩 오른다
const KINGDOM = [
  { id: 'gold', e: '⛏️', name: '황금 광산',   desc: (lv) => `모든 골드 +${lv * 10}%`,        base: 1e6, mult: 2.5, max: 99 },
  { id: 'food', e: '🌾', name: '풍요의 밭',   desc: (lv) => `수확 먹이 +${lv * 15}%`,        base: 5e5, mult: 2.5, max: 99 },
  { id: 'army', e: '🏋️', name: '훈련장',      desc: (lv) => `전투 공격·체력 +${lv * 5}%`,    base: 2e6, mult: 2.6, max: 99 },
  { id: 'lab',  e: '🧪', name: '교배 연구소', desc: (lv) => `교배 비용 -${lv * 3}%`,          base: 1e6, mult: 2.4, max: 20 },
  { id: 'gem',  e: '💎', name: '보석 세공소', desc: (lv) => `매일 💎 ${lv * 5}개 받기`,       base: 5e6, mult: 3,   max: 50 },
];
const kdLv = (id) => (S.kd && S.kd[id]) || 0;
const kdCost = (k) => Math.round(k.base * Math.pow(k.mult, kdLv(k.id)));
function kdUp(id) {
  tutFlag('kingdom', true);
  const k = KINGDOM.find(x => x.id === id);
  if (!k || kdLv(id) >= k.max) return;
  if (!spend(kdCost(k))) return;
  S.kd = S.kd || {};
  S.kd[id] = kdLv(id) + 1;
  sfx('level'); save(); updateHud();
  toast(`${k.e} ${k.name} Lv.${S.kd[id]}! ${k.desc(S.kd[id])}`);
  render();
}
// ===================== 🌌 우주 발전 (엄청난 골드를 쓰는 곳) =====================
const COSMOS = [
  { id: 'war',  e: '⚔️', name: '은하 전투력', desc: (lv) => `전투 공격·체력 +${lv * 25}%` },
  { id: 'luck', e: '🍀', name: '우주의 행운', desc: (lv) => `교배할 때 ${Math.min(80, lv * 8)}% 확률로 더 좋은 결과` },
  { id: 'gem',  e: '💎', name: '별 보석 공장', desc: (lv) => `매일 💎 ${lv * 20}개 받기` },
  { id: 'pet',  e: '🐾', name: '펫 공명',     desc: (lv) => `펫 능력 +${lv * 20}%` },
];
const COS_BASE = 1e21, COS_MULT = 1000;
const cosLv = (id) => (S.cos && S.cos[id]) || 0;
const cosCost = (id) => COS_BASE * Math.pow(COS_MULT, cosLv(id));
const cosTotal = () => COSMOS.reduce((s, c) => s + cosLv(c.id), 0);
function cosUp(id) {
  const c = COSMOS.find(x => x.id === id);
  if (!c) return;
  tutFlag('cosmos', true);
  if (cosCost(id) >= MONEY_CAP) { toast('🌌 우주 끝까지 올렸어요!'); return; }
  if (!spend(cosCost(id))) return;
  S.cos = S.cos || {};
  S.cos[id] = cosLv(id) + 1;
  sfx('level'); save(); updateHud();
  toast(`🌌 ${c.e} ${c.name} Lv.${S.cos[id]}! ${c.desc(S.cos[id])}`);
  const p = $('#panel'), y = p ? p.scrollTop : 0; render(); if (p) $('#panel').scrollTop = y;
}
function cosmosShopHTML() {
  return `<h3 class="sub" id="shopCosmos">🌌 우주 발전 <small class="muted">엄청난 골드를 쓰는 곳 · 💰1Sx부터, 레벨마다 1000배 · 끝없음</small></h3>
    <div class="kd-list cosmos-list">${COSMOS.map(c => { const lv = cosLv(c.id), cost = cosCost(c.id); return `<div class="kd-row cos-row">
        <span class="kd-ico">${c.e}</span>
        <span class="kd-info"><b>${c.name} <small>Lv.${lv}</small></b><small>지금: ${lv ? c.desc(lv) : '없음'} → 다음: ${c.desc(lv + 1)}</small></span>
        <button class="btn small ${S.gold >= cost || S.infinite ? 'green' : ''}" data-act="cosUp" data-id="${c.id}">💰 ${shortNum(cost)}</button>
      </div>`; }).join('')}</div>`;
}
const dailyGemAmt = () => kdLv('gem') * 5 + cosLv('gem') * 20;
function kdGemClaim() {
  const n = dailyGemAmt();
  if (!n || S.kdGemDay === dayKey()) return;
  S.kdGemDay = dayKey();
  earn(n, 'gems'); sfx('coin'); save(); updateHud();
  toast(`💎 오늘의 보석 ${n}개를 받았어요!`);
  render();
}
// 랜드마크 보너스 (모든 섬)
let WONDER_MEMO = { t: -1e9, v: 0, s: null };
function wonderPct() {
  const now = performance.now();
  if (WONDER_MEMO.s === S && now - WONDER_MEMO.t < 1000) return WONDER_MEMO.v;
  WONDER_MEMO = { t: now, v: wonderPctRaw(), s: S };
  return WONDER_MEMO.v;
}
function wonderPctRaw() {
  const got = new Set(S.plots.filter(p => p && p.kind === 'deco').map(p => p.id));
  return DECOS.filter(d => d.wonder && got.has(d.id)).reduce((s, d) => s + d.global, 0);
}
// ⚡ 골드 부스터 (골드 2배)
const boostOn = () => (S.boostEnd || 0) > Date.now();
function buyBoost() {
  tutFlag('bigshop', true);
  if (!spend(40, 'gems')) return;
  S.boostEnd = Math.max(Date.now(), S.boostEnd || 0) + 3600 * 1000;
  sfx('yay'); save(); updateHud();
  toast(`⚡ 골드 2배! ${mmss(Math.round((S.boostEnd - Date.now()) / 1000))} 남았어요`);
  render();
}
// 🤖 자동 수집 로봇: 켜 있는 동안 1분마다 모든 서식지 골드를 걷는다
function buyRobot() {
  tutFlag('bigshop', true);
  if (S.robot) return;
  if (!spend(300, 'gems')) return;
  S.robot = true; sfx('yay'); save(); updateHud();
  toast('🤖 자동 수집 로봇이 일을 시작했어요! 1분마다 골드를 걷어요');
  render();
}
function robotCollect() {
  if (!S.robot || VISIT) return;
  let sum = 0;
  S.plots.forEach((p, i) => { if (p && p.kind === 'hab' && p.gold >= 1) { const n = Math.floor(p.gold); sum += n; p.gold -= n; if (islandOf(i) === (S.isl || 0)) floatAt(i, '🤖+' + shortNum(n)); } });
  if (sum) { earn(sum); statAdd('gold', sum); save(); refreshLive(); updateHud(); }
}
setInterval(robotCollect, 60000);
// 👑 전설 알 상자
function buyLegendBox() {
  tutFlag('bigshop', true);
  if (S.hatch.length >= hatchCap()) { toast('부화장이 가득 찼어요! 먼저 부화시켜 주세요'); return; }
  if (!spend(250, 'gems')) return;
  const pool = CAT_LIST.filter(c => c.rarity === 'legendary' && !c.shop);
  const c = pool[Math.floor(Math.random() * pool.length)];
  S.hatch.push(c.id);
  sfx('yay'); save(); updateHud();
  toast(`👑 ${c.face} ${c.name} 알이 나왔어요! 부화장에서 깨워 주세요`);
  render();
  openHatchery();
}
// ===================== 🛒 상점 더하기: 특가 · 물약 · 교환소 · 분류 버튼 =====================
// 날짜(+새로고침 횟수)로 정해지는 난수
function seeded(str) { let h = 2166136261; for (const ch of str) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0; return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0) / 4294967296); }
const DEAL_RANKS = ['rare', 'special', 'masterwork', 'hero', 'epic'];
const dealEggPrice = (t) => Math.round(2000 * Math.pow(3, RANK[CAT[t].rarity] - RANK.rare));
function dealsToday() {
  const day = dayKey();
  if (!S.deals || S.deals.day !== day) S.deals = { day, seed: 0, bought: [] };
  const rnd = seeded(day + '#' + S.deals.seed + '#' + (S.rankId || ''));
  const pool = [
    () => { const rk = DEAL_RANKS[Math.floor(rnd() * DEAL_RANKS.length)]; const list = CAT_LIST.filter(c => c.rarity === rk && !c.shop); const c = list[Math.floor(rnd() * list.length)];
      return { id: 'egg', icon: c.face, name: `${RAR[c.rarity].name} 알: ${c.name}`, sub: '도감에 없으면 새로 등록!', cost: dealEggPrice(c.id), cur: 'gold', type: c.id }; },
    () => ({ id: 'petegg', icon: '🥚', name: '펫 알 30% 할인', sub: '일반 72% · 희귀 23% · 서사 5%', cost: 14000, cur: 'gold', was: 20000 }),
    () => ({ id: 'petegg2', icon: '🌟', name: '고급 펫 알 20% 할인', sub: '전설 펫 10%!', cost: 80, cur: 'gems', was: 100 }),
    () => ({ id: 'legend', icon: '👑', name: '전설 알 상자 20% 할인', sub: '전설 몬스터 알 하나', cost: 200, cur: 'gems', was: 250 }),
    () => ({ id: 'food', icon: '🍖', name: '먹이 10,000개 묶음', sub: '보통 💰15,000', cost: 9000, cur: 'gold', was: 15000 }),
    () => ({ id: 'runes', icon: '🎁', name: '고급 룬 상자 ×3', sub: '★★ 60% · ★★★ 40%', cost: 45, cur: 'gems', was: 60 }),
    () => ({ id: 'goldbag', icon: '💰', name: '골드 보따리', sub: '지금 수입 30분치', cost: 15, cur: 'gems' }),
    () => ({ id: 'luck', icon: '🍀', name: '행운 물약 ×2', sub: '교배 결과를 두 번 뽑아 더 좋은 것', cost: 30, cur: 'gems', was: 50 }),
  ];
  const out = [], used = new Set();
  // 몬스터 알 특가는 늘 하나, 나머지 3개는 겹치지 않게
  out.push(pool[0]());
  while (out.length < 4) { const k = 1 + Math.floor(rnd() * (pool.length - 1)); if (used.has(k)) continue; used.add(k); out.push(pool[k]()); }
  return out.map((d, k) => ({ ...d, k }));
}
function buyDeal(k) {
  tutFlag('deals', true);
  k = Number(k);
  const deals = dealsToday(), d = deals[k];
  if (!d || S.deals.bought.includes(k)) return;
  if (d.id === 'egg' && S.hatch.length >= hatchCap()) { toast('부화장이 가득 찼어요! 먼저 부화시켜 주세요'); return; }
  if (d.id === 'legend' && S.hatch.length >= hatchCap()) { toast('부화장이 가득 찼어요! 먼저 부화시켜 주세요'); return; }
  if (!spend(d.cost, d.cur)) return;
  S.deals.bought.push(k);
  sfx('buy');
  if (d.id === 'egg') { S.hatch.push(d.type); toast(`🥚 ${CAT[d.type].name} 알! 부화장에서 깨워 주세요`); save(); render(); openHatchery(); return; }
  if (d.id === 'petegg') { save(); petEgg('normal', true); render(); return; }
  if (d.id === 'petegg2') { save(); petEgg('premium', true); render(); return; }
  if (d.id === 'legend') { const pool = CAT_LIST.filter(c => c.rarity === 'legendary' && !c.shop); const c = pool[Math.floor(Math.random() * pool.length)]; S.hatch.push(c.id); toast(`👑 ${c.face} ${c.name} 알!`); save(); render(); openHatchery(); return; }
  if (d.id === 'food') { S.food += 10000; toast('🍖 먹이 10,000개!'); }
  if (d.id === 'runes') { const got = [0, 1, 2].map(() => runeText(giveRune([0, 0.6, 0.4]))); toast('💠 ' + got.join(' · ')); }
  if (d.id === 'goldbag') { const g = Math.max(3000, Math.round(totalIncome() * 1800)); earn(g); toast(`💰 ${fmt(g)} 골드!`); }
  if (d.id === 'luck') { S.potLuck = (S.potLuck || 0) + 2; toast('🍀 행운 물약 2개! 다음 교배에 자동으로 써요'); }
  save(); updateHud(); render();
}
function refreshDeals() {
  if (!spend(10, 'gems')) return;
  dealsToday();
  S.deals.seed++; S.deals.bought = [];
  sfx('coin'); save(); updateHud(); render();
  toast('🔄 새 특가가 나왔어요!');
}
// ----- 🧪 물약 -----
const POTIONS = [
  { id: 'luck',  icon: '🍀', name: '행운 물약 ×3',   sub: '다음 교배 3번: 결과를 두 번 뽑아 더 좋은 등급으로', cost: 25, cur: 'gems' },
  { id: 'sand',  icon: '⏳', name: '시간 모래시계',  sub: '모든 교배산·농장 바로 완료', cost: 15, cur: 'gems' },
  { id: 'grow',  icon: '📈', name: '성장 물약',      sub: '모험 팀(없으면 센 3마리) 모두 +3레벨', cost: 0, cur: 'gold' },
  { id: 'fight', icon: '💪', name: '전투 물약 ×10',  sub: '다음 전투 10번: 공격 +30%', cost: 10, cur: 'gems' },
];
const growCost = () => Math.max(20000, Math.round(totalIncome() * 600));
function buyPotion(id) {
  tutFlag('potion', true);
  const p = POTIONS.find(x => x.id === id);
  if (!p) return;
  const cost = id === 'grow' ? growCost() : p.cost;
  if (id === 'grow') {
    let team = S.team.map(byUid).filter(Boolean);
    if (!team.length) team = S.monsters.slice().sort((a, b) => monPower(b) - monPower(a)).slice(0, 3);
    if (!team.length || team.every(m => m.lv >= MAX_LV)) { toast('올릴 수 있는 몬스터가 없어요 (최고 레벨)'); return; }
    if (!spend(cost, p.cur)) return;
    team.forEach(m => { m.lv = Math.min(MAX_LV, m.lv + 3); });
    toast(`📈 ${team.map(m => CAT[m.type].face + 'Lv.' + m.lv).join(' ')}`);
  } else if (id === 'sand') {
    const busy = S.plots.filter(pl => pl && ((pl.kind === 'mountain' && mtnSlots(pl).some(b => b && Date.now() < b.end)) || (pl.kind === 'farm' && pl.crop != null && Date.now() < pl.end)));
    if (!busy.length) { toast('기다리는 교배나 농장이 없어요'); return; }
    if (!spend(cost, p.cur)) return;
    busy.forEach(pl => { if (pl.kind === 'mountain') mtnSlots(pl).forEach(b => { if (b) b.end = Date.now(); }); else pl.end = Date.now(); });
    toast(`⏳ 교배산·농장 ${busy.length}곳이 바로 끝났어요!`);
  } else {
    if (!spend(cost, p.cur)) return;
    if (id === 'luck') { S.potLuck = (S.potLuck || 0) + 3; toast('🍀 행운 물약 3개! 다음 교배에 자동으로 써요'); }
    if (id === 'fight') { S.potBattle = (S.potBattle || 0) + 10; toast('💪 전투 물약 10개! 다음 전투부터 공격 +30%'); }
  }
  sfx('buy'); save(); updateHud(); refreshLive(); render();
}
// 전투를 시작할 때 전투 물약이 있으면 하나 쓴다
function potBattleStart() {
  S.potBattleOn = (S.potBattle || 0) > 0;
  if (S.potBattleOn) { S.potBattle--; save(); }
}
// ----- 💱 교환소: 골드 → 보석 (오늘 살 때마다 값이 2배) -----
const EXCH_GEMS = 10;
const exchCost = () => { const t = S.exch && S.exch.day === dayKey() ? S.exch.n : 0; return Math.round(1e6 * Math.pow(2, t)); };
function buyExchange() {
  tutFlag('potion', true);
  const cost = exchCost();
  if (!spend(cost)) return;
  if (!S.exch || S.exch.day !== dayKey()) S.exch = { day: dayKey(), n: 0 };
  S.exch.n++;
  earn(EXCH_GEMS, 'gems'); sfx('coin'); save(); updateHud(); render();
  toast(`💱 💰${shortNum(cost)} → 💎 ${EXCH_GEMS}`);
}
function shopMoreHTML() {
  const deals = dealsToday();
  const left = new Date(); left.setHours(24, 0, 0, 0);
  const secLeft = Math.round((left - Date.now()) / 1000);
  const priceTag = (d) => `${d.cur === 'gems' ? '💎' : '💰'} ${d.cur === 'gems' ? fmt(d.cost) : shortNum(d.cost)}${d.was ? ` <s>${d.cur === 'gems' ? fmt(d.was) : shortNum(d.was)}</s>` : ''}`;
  return `<h3 class="sub" id="shopDeals" data-act="shopJump" data-id="shopDeals">🔥 오늘의 특가 <small class="muted">하루에 하나씩만 · ${Math.floor(secLeft / 3600)}시간 ${Math.floor(secLeft % 3600 / 60)}분 뒤 새 특가</small></h3>
    <div class="deal-grid">${deals.map(d => { const got = S.deals.bought.includes(d.k); return `<button class="deal-card ${got ? 'got' : ''}" data-act="buyDeal" data-k="${d.k}" ${got ? 'disabled' : ''}>
        <span class="dl-ico">${d.icon}</span><b>${d.name}</b><small>${d.sub}</small><span class="dl-cost">${got ? '✅ 샀어요' : priceTag(d)}</span></button>`; }).join('')}</div>
    <div class="row"><button class="btn ghost small" data-act="refreshDeals">🔄 특가 새로고침 (💎 10)</button></div>
    <h3 class="sub" id="shopPotion" data-act="shopJump" data-id="shopPotion">🧪 물약 <small class="muted">${S.potLuck ? `🍀 ${S.potLuck}개 ` : ''}${S.potBattle ? `💪 ${S.potBattle}개 ` : ''}가지고 있어요</small></h3>
    <div class="shop">${POTIONS.map(p => `<button class="shop-item" data-act="buyPotion" data-id="${p.id}"><span class="si-ico">${p.icon}</span><span class="si-nm">${p.name}<small>${p.sub}</small></span><span class="si-cost">${p.id === 'grow' ? '💰 ' + shortNum(growCost()) : (p.cur === 'gems' ? '💎 ' : '💰 ') + fmt(p.cost)}</span></button>`).join('')}</div>
    <h3 class="sub" id="shopExch">💱 교환소 <small class="muted">골드를 보석으로 · 오늘 살 때마다 값이 2배 (자정에 다시 싸져요)</small></h3>
    <div class="shop"><button class="shop-item" data-act="buyExchange"><span class="si-ico">💱</span><span class="si-nm">보석 ${EXCH_GEMS}개<small>오늘 ${S.exch && S.exch.day === dayKey() ? S.exch.n : 0}번 바꿨어요</small></span><span class="si-cost">💰 ${shortNum(exchCost())}</span></button></div>`;
}
// ===================== 🧬 복제기 =====================
// 섬에 세우는 기계. 몬스터를 골라 레벨·별까지 똑같이 복제한다 (룬은 복제 안 됨)
const CLONER_COST = 1e19, CLONE_COST = 1e7;
const clonerIdx = () => S.plots.findIndex(p => p && p.kind === 'cloner');
function buyCloner() {
  if (clonerIdx() >= 0) { openCloner(); return; }
  const i = findFreePlot();
  if (i < 0) return;
  if (!spend(CLONER_COST)) return;
  S.plots[i] = { kind: 'cloner' };
  sfx('yay'); save(); updateHud();
  toast('🧬 복제기를 세웠어요! 섬에서 눌러서 몬스터를 복제해요');
  render();
}
function openCloner() {
  tutFlag('cloner', true);
  if (clonerIdx() < 0) { toast('먼저 상점에서 🧬 복제기를 사야 해요 (💰 ' + shortNum(CLONER_COST) + ')'); return; }
  const list = S.monsters.slice().sort((a, b) => rIdx(b.type) - rIdx(a.type) || (b.star || 0) - (a.star || 0) || b.lv - a.lv);
  showModal(`<div class="cloner-head"><span class="cl-ico">🧬</span><div><h3>복제기</h3>
      <div class="muted">몬스터를 누르면 <b>레벨·별까지 똑같은</b> 몬스터를 하나 더 만들어요 (룬은 빼고)</div>
      <div class="cl-cost">한 번에 💰 ${shortNum(CLONE_COST)} · 지금까지 ${fmt(stat('clone'))}번 복제</div></div></div>
    <div class="grid small cloner-grid">${list.length ? list.map(m => card(m, `data-act="cloneMon" data-uid="${m.uid}"`, 'mini', `<div class="price-tag">🧬 복제</div>`)).join('') : '<p class="muted">복제할 몬스터가 없어요</p>'}</div>
    <div class="row"><button class="btn ghost small" data-act="close">닫기</button></div>`);
}
function cloneMon(uid) {
  const m = byUid(uid);
  if (!m || clonerIdx() < 0) return;
  const home = habsFor(m.type)[0];
  if (!home) { toast(`🏠 복제한 몬스터가 살 곳이 없어요! ${isLegend(m.type) ? '전설의 서식지' : CAT[m.type].els.map(e => habName(e)).join(' 또는 ')}를 더 짓거나 올려 주세요`); return; }
  if (!spend(CLONE_COST)) return;
  S.monsters.push({ uid: S.nextUid++, type: m.type, lv: m.lv, star: m.star || 0, hab: home.i, runes: [null, null] });
  statAdd('clone', 1);
  sfx('hatch'); save(); updateHud(); render();
  toast(`🧬 ${CAT[m.type].face} ${CAT[m.type].name} Lv.${m.lv}${m.star ? ' ' + '★'.repeat(m.star) : ''} 복제 완료! → ${habName(S.plots[home.i].el)}`);
  const box = $('#modalBox'), y = box.scrollTop;
  openCloner(); box.scrollTop = y;
}
function clonerShopHTML() {
  const own = clonerIdx() >= 0;
  return `<h3 class="sub" id="shopCloner">🧬 복제기 <small class="muted">섬에 세우는 기계 · 몬스터를 레벨·별까지 똑같이 복제</small></h3>
    <div class="cloner-card ${own ? 'got' : ''}">
      <span class="cl-ico">🧬</span>
      <div class="cl-info"><b>복제기</b><small>한 번 복제에 💰 ${shortNum(CLONE_COST)}</small><small>${own ? '✅ 섬에 있어요' : '한 번 사면 계속 써요'}</small></div>
      <button class="btn ${own ? 'green' : ''}" data-act="${own ? 'cloner' : 'buyCloner'}">${own ? '🧬 복제하러 가기' : '💰 ' + shortNum(CLONER_COST)}</button>
    </div>`;
}

function shopNavHTML() {
  const items = [['shopHab', '🏠 서식지'], ['shopEgg', '🥚 알'], ['shopEgg2', '🧬 혼합 알'], ['shopBox', '🎲 알 상자'], ['shopDeals', '🔥 특가'], ['shopPotion', '🧪 물약'], ['shopKingdom', '🏛️ 왕국'], ['shopCosmos', '🌌 우주'], ['shopWonder', '🗽 랜드마크'], ['shopCloner', '🧬 복제기'], ['shopGem', '💎 보석'], ['shopExch', '💱 교환'], ['shopDeco', '🎨 장식']];
  return `<div class="shop-nav">${items.map(([id, t]) => `<button class="chip" data-act="shopJump" data-id="${id}">${t}</button>`).join('')}</div>`;
}

function kingdomShopHTML() {
  // 상점에서 이 칸이 화면에 보이면 "둘러봤다"로 친다
  setTimeout(() => {
    const el = document.getElementById('shopGem');
    if (!el || tutFlag('bigshop') || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((es) => { if (es.some(e => e.isIntersecting)) { tutFlag('bigshop', true); io.disconnect(); } });
    io.observe(el);
  }, 50);
  const wonders = DECOS.filter(d => d.wonder);
  const got = new Set(S.plots.filter(p => p && p.kind === 'deco').map(p => p.id));
  const gemToday = dailyGemAmt();
  return `<h3 class="sub" id="shopKingdom">🏛️ 왕국 발전 <small class="muted">골드로 영원히 강해져요. 레벨이 오를수록 비싸져요</small></h3>
    <div class="kd-list">${KINGDOM.map(k => { const lv = kdLv(k.id), max = lv >= k.max; return `<div class="kd-row">
        <span class="kd-ico">${k.e}</span>
        <span class="kd-info"><b>${k.name} <small>Lv.${lv}</small></b><small>지금: ${lv ? k.desc(lv) : '없음'}${max ? '' : ` → 다음: ${k.desc(lv + 1)}`}</small></span>
        <button class="btn small ${S.gold >= kdCost(k) || S.infinite ? 'green' : ''}" data-act="kdUp" data-id="${k.id}" ${max ? 'disabled' : ''}>${max ? '최고!' : '💰 ' + shortNum(kdCost(k))}</button>
      </div>`; }).join('')}</div>
    ${gemToday ? `<div class="row"><button class="btn ${S.kdGemDay === dayKey() ? 'ghost' : 'green'}" data-act="kdGem" ${S.kdGemDay === dayKey() ? 'disabled' : ''}>💎 오늘의 보석: ${gemToday}개 ${S.kdGemDay === dayKey() ? '받았어요 ✅' : '받기'}</button></div>` : ''}
    ${cosmosShopHTML()}
    <h3 class="sub" id="shopWonder" data-act="bigshopSeen">🗽 랜드마크 <small class="muted">섬에 세우는 거대 건물 · 모든 섬 골드가 올라요 (지금 +${wonderPct()}%)</small></h3>
    <div class="wonder-grid">${wonders.map(d => `<button class="wonder-card ${got.has(d.id) ? 'got' : ''}" data-act="buyDeco" data-id="${d.id}" ${got.has(d.id) ? 'disabled' : ''}>
        <span class="wd-ico">${d.emoji}</span><b>${d.name}</b><small>모든 섬 골드 +${d.global}%</small><span class="wd-cost">${got.has(d.id) ? '✅ 완성' : '💰 ' + shortNum(d.cost)}</span></button>`).join('')}</div>
    ${clonerShopHTML()}
    <h3 class="sub" id="shopGem" data-act="bigshopSeen">💎 보석 상점</h3>
    <div class="shop">
      <button class="shop-item" data-act="buyRobot" ${S.robot ? 'disabled' : ''}><span class="si-ico">🤖</span><span class="si-nm">자동 수집 로봇<small>${S.robot ? '✅ 일하는 중 (1분마다 모든 골드 걷기)' : '1분마다 모든 서식지 골드를 알아서 걷어요 (영구)'}</small></span><span class="si-cost">${S.robot ? '보유' : '💎 300'}</span></button>
      <button class="shop-item" data-act="buyBoost"><span class="si-ico">⚡</span><span class="si-nm">골드 부스터 1시간<small>${boostOn() ? `⚡ 지금 2배! ${mmss(Math.round((S.boostEnd - Date.now()) / 1000))} 남음 (사면 시간이 늘어요)` : '모든 골드 2배'}</small></span><span class="si-cost">💎 40</span></button>
      <button class="shop-item" data-act="buyLegendBox"><span class="si-ico">👑</span><span class="si-nm">전설 알 상자<small>전설 몬스터 알 하나가 무작위로!</small></span><span class="si-cost">💎 250</span></button>
      <button class="shop-item" data-act="pets"><span class="si-ico">🌟</span><span class="si-nm">고급 펫 알<small>🐾 펫 창에서 사요 (전설 펫 10%)</small></span><span class="si-cost">💎 100</span></button>
    </div>`;
}

// ===================== 🎉 이벤트 =====================
// 서버 없이 날짜로 정한다: 3일마다 다음 이벤트. 이벤트 토큰을 모아 패스 보상, 마지막은 한정 펫
const EVT_DAYS = 3;
const EVENTS = [
  { id: 'goldrush',  e: '💰', name: '골드 러시',     color: '#ffd24a', desc: '모든 골드 ×1.5', pet: 'ev_frog',   hot: ['collect'] },
  { id: 'harvest',   e: '🌾', name: '풍년 축제',     color: '#7dff8f', desc: '수확 먹이 ×2',   pet: 'ev_hedge',  hot: ['harvest', 'feed'] },
  { id: 'tourney',   e: '⚔️', name: '전투 대회',     color: '#ff6b6b', desc: '모험 전투 골드 ×2', pet: 'ev_lion', hot: ['win', 'gwar'] },
  { id: 'hatchfest', e: '🐣', name: '부화 페스티벌', color: '#ffb3e6', desc: '몬스터 알 반값',  pet: 'ev_chick',  hot: ['hatch', 'buyEgg'] },
  { id: 'breedrush', e: '🧬', name: '교배 러시',     color: '#5ce1e6', desc: '교배 시간 절반',  pet: 'ev_flamgo', hot: ['breed'] },
  { id: 'element',   e: '🌈', name: '속성 축제',     color: '#c28cff', desc: '', pet: 'ev_bfly', hot: ['collect', 'breed'] },
];
// 이벤트 토큰: 평소 하는 일로 모은다 (이벤트 주제 활동은 2배)
const EVT_TOKEN = { collect: 1, breed: 3, feed: 1, hatch: 2, harvest: 2, win: 3, buyEgg: 1, gwar: 4 };
const EVT_NAME = { collect: '💰 골드 걷기', breed: '🏔️ 교배', feed: '🍖 레벨 올리기', hatch: '🐣 부화', harvest: '🌾 수확', win: '⚔️ 전투 승리', buyEgg: '🥚 알 사기', gwar: '🛡️ 길드전' };
const EVT_PASS = [
  { need: 15,  text: '💎 10',            give: () => { earn(10, 'gems'); } },
  { need: 40,  text: '💰 골드 한 보따리', give: () => { const g = Math.max(5000, Math.round(totalIncome() * 900)); earn(g); return '💰 ' + fmt(g); } },
  { need: 80,  text: '🎁 고급 룬 상자',   give: () => runeText(giveRune([0, 0.6, 0.4])) },
  { need: 130, text: '💎 30',            give: () => { earn(30, 'gems'); } },
  { need: 200, text: '🥚 펫 알',          give: () => { setTimeout(() => petEgg('normal', true), 400); return '펫 알을 깨요!'; } },
  { need: 300, text: '💎 60',            give: () => { earn(60, 'gems'); } },
  { need: 420, text: '👑 전설 알',        give: () => { const pool = CAT_LIST.filter(c => c.rarity === 'legendary' && !c.shop); const c = pool[Math.floor(Math.random() * pool.length)]; if (S.hatch.length < hatchCap()) { S.hatch.push(c.id); return c.face + ' ' + c.name + ' 알 (부화장)'; } earn(250, 'gems'); return '부화장이 가득 차서 💎 250'; } },
  { need: 600, text: '🎉 한정 펫!',        give: () => { const p = petById(evtNow().pet); S.pets = S.pets || {}; S.pets[p.id] = Math.min(PET_MAX, (S.pets[p.id] || 0) + 1); return p.e + ' ' + p.name; } },
];
function evtGoldMult(el) {
  const ev = evtNow();
  const w = weatherMult(el);
  if (ev.id === 'goldrush') return 1.5 * w;
  if (ev.id === 'element' && ev.el === el) return 2 * w;
  return w;
}
// ===================== 🌦️ 날씨 · 🌙 낮과 밤 =====================
const WEATHERS = [
  { id: 'sun',     e: '☀️', en: 'Sunny', name: '맑음',     w: 38, desc: '화창한 날! 🎈 풍선이 자주 날아와요' },
  { id: 'rain',    e: '🌧️', en: 'Rain', name: '비',       w: 18, desc: '💧 물 · 🌿 자연 서식지 골드 ×2', els: ['water', 'nature'] },
  { id: 'snow',    e: '❄️', en: 'Snow', name: '눈',       w: 12, desc: '🧊 얼음 · 💎 수정 서식지 골드 ×2', els: ['ice', 'crystal'] },
  { id: 'storm',   e: '⛈️', en: 'Storm', name: '천둥번개', w: 12, desc: '⚡ 전기 · 🌪️ 바람 서식지 골드 ×2', els: ['thunder', 'wind'] },
  { id: 'heat',    e: '🥵', en: 'Heat wave', name: '폭염',     w: 10, desc: '🔥 불 · 🐉 용 서식지 골드 ×2', els: ['fire', 'dragon'] },
  { id: 'rainbow', e: '🌈', en: 'Rainbow', name: '무지개',   w: 6,  desc: '✨ 모든 서식지 골드 ×1.5!', all: 1.5 },
  { id: 'fog',     e: '🌫️', en: 'Fog', name: '안개',     w: 4,  desc: '👻 영혼 · 🌑 어둠 서식지 골드 ×2', els: ['spirit', 'dark'] },
];
const WX_SLOT = 3 * 3600 * 1000;
const wxName = (w) => (window.LANG === 'en' ? w.en : w.name);
const wxSlot = (t = Date.now()) => Math.floor(t / WX_SLOT);
function weatherAt(slot) {
  const tot = WEATHERS.reduce((s, w) => s + w.w, 0);
  let h = Math.imul((slot >>> 0) ^ 0x9e3779b9, 0x85ebca6b) >>> 0; h = (h ^ (h >>> 13)) >>> 0; h = Math.imul(h, 0xc2b2ae35) >>> 0; h = (h ^ (h >>> 16)) >>> 0;
  let r = (h / 4294967296) * tot;
  for (const w of WEATHERS) { r -= w.w; if (r < 0) return w; }
  return WEATHERS[0];
}
const weatherNow = () => weatherAt(wxSlot());
const isNight = (d = new Date()) => d.getHours() >= 19 || d.getHours() < 6;
function weatherMult(el) {
  if (typeof S === 'undefined' || !S || VISIT) return 1;
  const w = weatherNow();
  return w.all || (w.els && w.els.includes(el) ? 2 : 1);
}
const wxDay = () => (S.wx && S.wx.day === dayKey() ? S.wx : (S.wx = { day: dayKey(), star: 0, ball: 0 }));
const WX_CATCH_MAX = 10;
let wxShown = '';
function drawWeather() {
  const L = $('#wxLayer');
  if (!L) return;
  const on = tab === 'island' && !B;
  L.classList.toggle('hidden', !on);
  if (!on) return;
  const w = weatherNow(), night = isNight(), key = w.id + (night ? 'n' : 'd');
  if (key === wxShown) return;
  wxShown = key;
  L.className = `wx-layer wx-${w.id} ${night ? 'night' : 'day'}`;
  let parts = '';
  const n = w.id === 'rain' || w.id === 'storm' ? 70 : w.id === 'snow' ? 50 : 0;
  for (let k = 0; k < n; k++) {
    const x = (k * 37) % 100, dl = ((k * 53) % 100) / 50, du = w.id === 'snow' ? 5 + (k % 5) : 0.6 + (k % 4) * 0.15;
    parts += `<i class="${w.id === 'snow' ? 'flake' : 'drop'}" style="left:${x}%;animation-delay:-${dl}s;animation-duration:${du}s"></i>`;
  }
  if (night) for (let k = 0; k < 40; k++) parts += `<i class="star" style="left:${(k * 61) % 100}%;top:${(k * 29) % 45}%;animation-delay:-${(k % 7) * 0.5}s"></i>`;
  if (w.id === 'storm') parts += '<i class="flash"></i>';
  if (w.id === 'rainbow') parts += '<i class="bow"></i>';
  L.innerHTML = `<div class="wx-tint"></div>${parts}<div id="wxFly"></div>`;
}
// 🌠 별똥별 (밤) · 🎈 풍선 (낮): 날아갈 때 누르면 선물
function wxSpawn() {
  if (tab !== 'island' || B || VISIT || !$('#modal').classList.contains('hidden') || document.hidden) return;
  const fly = $('#wxFly');
  if (!fly || fly.children.length) return;
  const night = isNight(), d = wxDay();
  if ((night ? d.star : d.ball) >= WX_CATCH_MAX) return;
  const b = document.createElement('button');
  b.className = night ? 'wx-shoot' : 'wx-balloon';
  b.textContent = night ? '🌠' : ['🎈', '🎈', '🎁', '🪁'][Math.floor(Math.random() * 4)];
  b.dataset.act = 'wxCatch';
  b.style.setProperty('--y', (12 + Math.random() * 45) + '%');
  b.style.setProperty('--x', (10 + Math.random() * 75) + '%');
  fly.appendChild(b);
  setTimeout(() => b.remove(), night ? 3600 : 7600);
}
function wxCatch(el) {
  const night = isNight(), d = wxDay();
  if ((night ? d.star : d.ball) >= WX_CATCH_MAX) return;
  if (el) { el.disabled = true; el.classList.add('got'); setTimeout(() => el.remove(), 400); }
  if (night) { d.star++; earn(3, 'gems'); toast(`🌠 별똥별을 잡았어요! 💎 3 (오늘 ${d.star}/${WX_CATCH_MAX})`); }
  else { d.ball++; const g = Math.max(1000, Math.round(totalIncome() * 60)); earn(g); toast(`🎈 풍선을 잡았어요! 💰 ${shortNum(g)} (오늘 ${d.ball}/${WX_CATCH_MAX})`); }
  tutFlag('wx', true);
  sfx('coin'); save(); updateHud();
}
function openWeather() {
  tutFlag('wx', true);
  const now = wxSlot(), fmtH = (s) => { const t = new Date(s * WX_SLOT); return String(t.getHours()).padStart(2, '0') + ':00'; };
  const rows = [0, 1, 2, 3].map(k => { const w = weatherAt(now + k); return `<div class="wx-row ${k ? '' : 'now'}"><span class="wx-e">${w.e}</span><b translate="no">${k ? fmtH(now + k) + ' ~' : (window.LANG === 'en' ? 'Now' : '지금')}</b><span translate="no">${wxName(w)}</span><small>${w.desc}</small></div>`; }).join('');
  const d = wxDay(), night = isNight();
  showModal(`<div class="wx-box"><h3>🌦️ 날씨 예보</h3>
    <p class="muted">날씨는 3시간마다 바뀌어요. 날씨에 맞는 속성 서식지는 골드가 더 많이 나와요!</p>
    ${rows}
    <p class="muted">${night ? '🌙 지금은 밤이에요 (저녁 7시 ~ 아침 6시). 하늘을 지나가는 🌠 별똥별을 누르면 💎 3!' : '☀️ 지금은 낮이에요. 날아가는 🎈 풍선을 누르면 💰 골드!'}<br>오늘 잡은 것: 🌠 ${d.star}/${WX_CATCH_MAX} · 🎈 ${d.ball}/${WX_CATCH_MAX}</p>
    <div class="row"><button class="btn ghost small" data-act="close">닫기</button></div></div>`);
}
let wxLastSlot = null;
setInterval(() => {
  if (typeof S === 'undefined' || !S) return;
  const s = wxSlot();
  if (wxLastSlot != null && s !== wxLastSlot && tab === 'island') { const w = weatherNow(); toast(`${w.e} 날씨가 바뀌었어요: ${wxName(w)}! ${w.desc}`); renderIslandBar(); }
  wxLastSlot = s;
  drawWeather();
}, 5000);
setInterval(() => { if (Math.random() < 0.5) wxSpawn(); }, 9000);
const totalIncome = () => S.plots.reduce((s, p, i) => s + (p && p.kind === 'hab' ? habIncome(i) : 0), 0);
function evtCycle() {
  const d = new Date(), days = Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())) / 86400000);
  return Math.floor(days / EVT_DAYS);
}
function evtNow() {
  const c = evtCycle(), ev = { ...EVENTS[c % EVENTS.length] };
  if (ev.id === 'element') {
    const el = BASE[Math.floor(c / EVENTS.length) % BASE.length];
    ev.el = el;
    ev.desc = `${habEmoji(el)} ${habName(el)} 골드 ×2`;
  }
  ev.key = ev.id + '-' + c;
  // 끝나는 때 (다음 주기 시작 = 그날 자정)
  const d = new Date();
  const days = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
  const left = EVT_DAYS - (days % EVT_DAYS);
  const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + left);
  ev.end = end.getTime();
  return ev;
}
const evtOn = (id) => evtNow().id === id;
function evtState() {
  const ev = evtNow();
  if (!S.evt || S.evt.key !== ev.key) S.evt = { key: ev.key, tokens: 0, got: [] };
  return S.evt;
}
function evtToken(kind, n = 1) {
  if (!EVT_TOKEN[kind] || VISIT) return;
  const ev = evtNow(), st = evtState();
  const add = EVT_TOKEN[kind] * Math.min(5, n) * (ev.hot.includes(kind) ? 2 : 1);
  const before = st.tokens;
  st.tokens += add;
  // 새 보상이 열리면 알려 준다
  const opened = EVT_PASS.find(x => before < x.need && st.tokens >= x.need);
  if (opened) setTimeout(() => toast(`🎉 이벤트 보상이 열렸어요! (${opened.text}) 왼쪽 🎉 버튼에서 받기`), 700);
  updateEvtBtn(); updateQuestBtn();
}
function evtLeftText(ms) {
  const h = Math.max(0, Math.floor(ms / 3600000));
  return h >= 24 ? `${Math.floor(h / 24)}일 ${h % 24}시간` : h >= 1 ? `${h}시간` : `${Math.max(1, Math.ceil(ms / 60000))}분`;
}
function evtClaimable() {
  const st = evtState();
  return EVT_PASS.some((x, k) => st.tokens >= x.need && !st.got.includes(k));
}
function updateEvtBtnAll() { updateEvtBtn(); updateQuestBtn(); }
function updateEvtBtn() {
  const b = $('#evtBtn');
  if (!b) return;
  const ev = evtNow();
  b.classList.toggle('hidden', tab !== 'island' || !!VISIT);
  b.style.setProperty('--ec', ev.color);
  b.innerHTML = `${ev.e}<small>${evtLeftText(ev.end - Date.now())}</small>`;
  b.classList.toggle('ready', evtClaimable());
}
function openEvent() {
  tutFlag('event', true);
  const ev = evtNow(), st = evtState();
  S.evtSeen = ev.key;
  const pet = petById(ev.pet);
  const next = EVT_PASS.find(x => st.tokens < x.need);
  showModal(`<div class="evt-banner" style="--ec:${ev.color}">
      <div class="evt-emoji">${ev.e}</div>
      <div><h3>${ev.name}</h3><div class="evt-boost">🔥 ${ev.desc}</div><div class="muted">⏰ ${evtLeftText(ev.end - Date.now())} 남음 · 3일마다 새 이벤트</div></div>
    </div>
    <div class="evt-tokens">🎟️ 이벤트 토큰 <b>${fmt(st.tokens)}</b>${next ? ` <small>(다음 보상까지 ${next.need - st.tokens})</small>` : ' <small>(모두 열었어요!)</small>'}</div>
    <div class="bar evt-bar"><i style="width:${Math.min(100, st.tokens / EVT_PASS[EVT_PASS.length - 1].need * 100)}%"></i></div>
    <div class="evt-pass">${EVT_PASS.map((x, k) => { const got = st.got.includes(k), ok = st.tokens >= x.need, last = k === EVT_PASS.length - 1;
      return `<div class="evt-step ${got ? 'got' : ok ? 'ok' : ''} ${last ? 'last' : ''}">
        <span class="es-need">🎟️ ${x.need}</span>
        <span class="es-text">${last ? `${pet.e} <b>${pet.name}</b><br><small>한정 펫 · ${petBonusText(pet, 1)}</small>` : x.text}</span>
        ${got ? '<span class="es-done">✅</span>' : `<button class="btn small ${ok ? 'green' : ''}" data-act="evtClaim" data-k="${k}" ${ok ? '' : 'disabled'}>받기</button>`}
      </div>`; }).join('')}</div>
    <h3 class="sub">🎟️ 토큰 모으는 법 <small class="muted">🔥 표시는 이번 이벤트에서 2배!</small></h3>
    <div class="evt-how">${Object.entries(EVT_TOKEN).map(([k, v]) => `<span class="${ev.hot.includes(k) ? 'hot' : ''}">${EVT_NAME[k]} +${v * (ev.hot.includes(k) ? 2 : 1)}${ev.hot.includes(k) ? ' 🔥' : ''}</span>`).join('')}</div>
    <div class="row"><button class="btn ghost small" data-act="evtTrade" ${st.tokens >= 20 ? '' : 'disabled'}>🔄 토큰 20개 → 💎 5</button><button class="btn ghost small" data-act="close">닫기</button></div>`);
  updateEvtBtn(); updateQuestBtn();
}
function evtClaim(k) {
  k = Number(k);
  const st = evtState(), x = EVT_PASS[k];
  if (!x || st.got.includes(k) || st.tokens < x.need) return;
  st.got.push(k);
  const extra = x.give();
  save(); updateHud(); sfx('yay');
  toast(`🎉 ${typeof extra === 'string' ? extra : x.text} 받았어요!`);
  if (k === 4) return;   // 펫 알은 깨는 화면이 따로 나온다
  openEvent();
}
// 토큰 교환: 쓰고 남은 토큰으로 보석 (패스 진행에는 영향 없게 따로 센다)
function evtTrade() {
  const st = evtState();
  if (st.tokens < 20) return;
  st.tokens -= 20;
  earn(5, 'gems'); save(); updateHud(); sfx('coin');
  toast('💎 5 받았어요!');
  openEvent();
}

// ===================== 🐾 펫 =====================
// 펫 한 마리를 데리고 다니면 보너스! 간식으로 Lv.10까지 키운다. 같은 펫이 또 나오면 레벨 +1
const PET_RAR = {
  common:    { name: '일반', color: '#b4bccb', mult: 1 },
  rare:      { name: '희귀', color: '#5cb6ff', mult: 2 },
  epic:      { name: '서사', color: '#e45cff', mult: 4 },
  legendary: { name: '전설', color: '#ffb020', mult: 8 },
  fusion:    { name: '합성', color: '#ff5ce1', mult: 6 },
};
const PET_BONUS = { gold: '💰 골드', food: '🍖 수확 먹이', atk: '⚔️ 전투 공격', hp: '❤️ 전투 체력', discount: '🏷️ 교배 비용 할인' };
const PETS = [
  { id: 'dog',     name: '강아지 멍멍',   e: '🐶', r: 'common',    b: { gold: 2 } },
  { id: 'cat',     name: '고양이 야옹',   e: '🐱', r: 'common',    b: { food: 3 } },
  { id: 'bunny',   name: '토끼 깡총',     e: '🐰', r: 'common',    b: { atk: 2 } },
  { id: 'hamster', name: '햄스터 쪼꼬',   e: '🐹', r: 'common',    b: { hp: 2 } },
  { id: 'fox',     name: '여우 불꼬리',   e: '🦊', r: 'rare',      b: { gold: 3, atk: 1 } },
  { id: 'penguin', name: '펭귄 뒤뚱',     e: '🐧', r: 'rare',      b: { food: 4, hp: 1 } },
  { id: 'panda',   name: '판다 대나무',   e: '🐼', r: 'rare',      b: { discount: 2, hp: 2 } },
  { id: 'owl',     name: '부엉이 지혜',   e: '🦉', r: 'epic',      b: { gold: 3, food: 3, discount: 1 } },
  { id: 'unicorn', name: '유니콘 무지개', e: '🦄', r: 'epic',      b: { atk: 3, hp: 3 } },
  { id: 'bdragon', name: '아기용 크앙',   e: '🐲', r: 'epic',      b: { atk: 4, gold: 2 } },
  { id: 'peacock', name: '황금 공작',     e: '🦚', r: 'legendary', b: { gold: 5, food: 5, discount: 2 } },
  { id: 'skydrg',  name: '하늘 용',       e: '🐉', r: 'legendary', b: { atk: 5, hp: 5, gold: 2 } },
  // 🎉 이벤트 한정 (이벤트 패스 마지막 보상으로만)
  { id: 'ev_frog',   name: '황금 두꺼비',   e: '🐸', r: 'legendary', b: { gold: 6 }, event: true },
  { id: 'ev_hedge',  name: '고슴도치 농부', e: '🦔', r: 'legendary', b: { food: 8, gold: 1 }, event: true },
  { id: 'ev_lion',   name: '사자 챔피언',   e: '🦁', r: 'legendary', b: { atk: 5, hp: 4 }, event: true },
  { id: 'ev_chick',  name: '병아리 삐약',   e: '🐣', r: 'legendary', b: { discount: 4, gold: 2 }, event: true },
  { id: 'ev_flamgo', name: '플라밍고 댄서', e: '🦩', r: 'legendary', b: { gold: 3, food: 4 }, event: true },
  { id: 'ev_bfly',   name: '무지개 나비',   e: '🦋', r: 'legendary', b: { gold: 4, atk: 2 }, event: true },
  // 🧪 합성으로만 얻는 펫 (부모 두 마리를 합성)
  { id: 'fu_tiger',  name: '호랑이 대장', e: '🐯', r: 'fusion', b: { gold: 4, food: 4, atk: 2 }, fusion: ['dog', 'cat'] },
  { id: 'fu_roo',    name: '캥거루 복서', e: '🦘', r: 'fusion', b: { atk: 4, hp: 4 }, fusion: ['bunny', 'hamster'] },
  { id: 'fu_wolf',   name: '달빛 늑대',   e: '🐺', r: 'fusion', b: { gold: 5, atk: 3, discount: 1 }, fusion: ['fox', 'owl'] },
  { id: 'fu_koala',  name: '코알라 수호자', e: '🐨', r: 'fusion', b: { food: 6, hp: 4, discount: 2 }, fusion: ['penguin', 'panda'] },
  { id: 'fu_phoenix', name: '불사조',     e: '🦅', r: 'fusion', b: { atk: 6, hp: 5, gold: 2 }, fusion: ['unicorn', 'bdragon'] },
  { id: 'fu_seal',   name: '물범 요리사', e: '🦭', r: 'fusion', b: { food: 9, gold: 2 }, fusion: ['cat', 'penguin'] },
  { id: 'fu_otter',  name: '수달 장인',   e: '🦦', r: 'fusion', b: { discount: 5, gold: 3 }, fusion: ['hamster', 'panda'] },
  { id: 'fu_star',   name: '별의 신수',   e: '🌠', r: 'fusion', b: { gold: 8, atk: 6, hp: 6, food: 6 }, fusion: ['peacock', 'skydrg'] },
];
const PET_MAX = 10;
const PET_EGGS = [
  { id: 'normal',  name: '펫 알',      e: '🥚', cost: 20000, cur: 'gold', w: { common: 0.72, rare: 0.23, epic: 0.05, legendary: 0 } },
  { id: 'premium', name: '고급 펫 알', e: '🌟', cost: 100,   cur: 'gems', w: { common: 0, rare: 0.55, epic: 0.35, legendary: 0.10 } },
];
const petById = (id) => PETS.find(p => p.id === id);
const petLv = (id) => (S.pets && S.pets[id]) || 0;
// 지금 데리고 다니는 펫의 보너스 (%)
const petStar = (id) => (S.petStar && S.petStar[id]) || 0;
const petStarMul = (id) => 1 + 0.5 * petStar(id);
function petPct(kind) {
  const p = S.petOn && petById(S.petOn);
  return p && p.b[kind] ? p.b[kind] * petLv(p.id) * petStarMul(p.id) * (1 + cosLv('pet') * 0.2) : 0;
}
const petBonusText = (p, lv) => Object.entries(p.b).map(([k, v]) => `${PET_BONUS[k]} +${Math.round(v * Math.max(1, lv) * petStarMul(p.id) * 10) / 10}%`).join(' · ');
const petStars = (id) => (petStar(id) ? '<span class="pet-stars">' + '★'.repeat(petStar(id)) + '</span>' : '');
// ⭐ 펫 각성 (Lv.10 펫만): 보석으로 ★1~★3, 별마다 보너스 +50%
const PET_STAR_MAX = 3, PET_STAR_COST = [50, 100, 200];
function petAwaken() {
  const p = S.petOn && petById(S.petOn);
  if (!p || petLv(p.id) < PET_MAX || petStar(p.id) >= PET_STAR_MAX) return;
  if (!spend(PET_STAR_COST[petStar(p.id)], 'gems')) return;
  S.petStar = S.petStar || {};
  S.petStar[p.id] = petStar(p.id) + 1;
  save(); updateHud(); sfx('yay');
  toast(`⭐ ${p.name} 각성 ★${S.petStar[p.id]}! ${petBonusText(p, petLv(p.id))}`);
  openPets();
}
// 🧪 펫 합성: 부모 두 마리가 Lv.5 이상이면 합성 펫이 태어난다 (부모는 그대로). 이미 있으면 레벨 +1
const PET_FUSE_LV = 5, PET_FUSE_GEMS = 30;
const petFuseGold = (p) => 20000 * p.fusion.reduce((s, id) => s + PET_RAR[petById(id).r].mult, 0);
function petFuse(id) {
  const p = petById(id);
  if (!p || !p.fusion) return;
  if (p.fusion.some(x => petLv(x) < PET_FUSE_LV)) { toast(`부모 펫 두 마리가 모두 Lv.${PET_FUSE_LV} 이상이어야 해요`); return; }
  if (petLv(id) >= PET_MAX) { toast('이미 최고 레벨이에요!'); return; }
  const gold = petFuseGold(p);
  if (!S.infinite && (S.gold < gold || S.gems < PET_FUSE_GEMS)) { sfx('err'); toast(S.gold < gold ? '💰 골드가 부족해요' : '💎 보석이 부족해요'); return; }
  spend(gold); spend(PET_FUSE_GEMS, 'gems');
  S.pets = S.pets || {};
  const isNew = !S.pets[id];
  S.pets[id] = Math.min(PET_MAX, (S.pets[id] || 0) + 1);
  statAdd('petFuse', 1);
  save(); updateHud(); sfx(isNew ? 'yay' : 'hatch');
  petReveal(p, isNew, isNew ? '🧪 합성 성공! 새 펫' : '');
}
function petFuseHTML() {
  return `<h3 class="sub" id="petFuse" data-act="petFuseSeen">🧪 펫 합성 <small class="muted">부모 두 마리가 Lv.${PET_FUSE_LV} 이상이면 합성 펫이 태어나요 (부모는 그대로!)</small></h3>
    <div class="fuse-list">${PETS.filter(p => p.fusion).map(p => {
      const [a, b] = p.fusion.map(petById), ok = p.fusion.every(x => petLv(x) >= PET_FUSE_LV), have = petLv(p.id);
      const par = (x) => `<span class="fz-par ${petLv(x.id) >= PET_FUSE_LV ? 'ok' : ''}">${petLv(x.id) ? x.e : '❔'}<small>${petLv(x.id) ? 'Lv.' + petLv(x.id) : '없음'}</small></span>`;
      return `<div class="fuse-row ${have ? 'have' : ''}">
        ${par(a)}<b>+</b>${par(b)}<b>→</b>
        <span class="fz-res" style="--pc:${PET_RAR.fusion.color}">${p.e}<small>${p.name}${have ? ' Lv.' + have : ''}</small></span>
        <button class="btn small ${ok ? 'green' : ''}" data-act="petFuse" data-id="${p.id}" ${ok && have < PET_MAX ? '' : 'disabled'}>${have >= PET_MAX ? '최고!' : `🧪 ${have ? '레벨 +1' : '합성'}<br><small>💰${shortNum(petFuseGold(p))} 💎${PET_FUSE_GEMS}</small>`}</button>
      </div>`;
    }).join('')}</div>`;
}
const petTreatCost = (p) => Math.round(800 * Math.pow(petLv(p.id), 2) * PET_RAR[p.r].mult);
function openPets() {
  tutFlag('pet', true);
  S.pets = S.pets || {};
  // 처음 열면 🐶 강아지를 선물
  if (!Object.keys(S.pets).length) {
    S.pets.dog = 1; S.petOn = 'dog'; save(); sfx('yay');
    petReveal(petById('dog'), true, '🎁 첫 펫 선물! 섬을 같이 돌아다녀요');
    return;
  }
  const on = S.petOn && petById(S.petOn);
  const owned = PETS.filter(p => petLv(p.id)).length;
  showModal(`<h3>🐾 펫</h3>
    ${on ? `<div class="pet-main" style="--pc:${PET_RAR[on.r].color}">
      <div class="pm-face">${on.e}</div>
      <div class="pm-info"><b>${on.name}</b> <span class="pet-rar">${PET_RAR[on.r].name}</span>${petStars(on.id)}<div class="pm-lv">Lv.${petLv(on.id)} / ${PET_MAX}</div>
        <div class="pm-bonus">${petBonusText(on, petLv(on.id))}</div></div>
      ${petLv(on.id) < PET_MAX ? `<button class="btn green" data-act="petTreat">🍪 간식 주기<br><small>💰 ${fmt(petTreatCost(on))} → Lv.${petLv(on.id) + 1}</small></button>`
        : petStar(on.id) < PET_STAR_MAX ? `<button class="btn awaken-btn" data-act="petAwaken">⭐ 각성 ★${petStar(on.id) + 1}<br><small>💎 ${PET_STAR_COST[petStar(on.id)]} · 보너스 +50%</small></button>` : '<div class="pm-max">🌟 최고 각성 ★3!</div>'}
    </div>` : '<p class="muted">데리고 다닐 펫을 골라요!</p>'}
    <h3 class="sub">📚 펫 도감 <small class="muted">${owned} / ${PETS.length}</small></h3>
    <div class="pet-grid">${PETS.map(p => { const lv = petLv(p.id); return lv ? `<button class="pet-card ${S.petOn === p.id ? 'on' : ''}" data-act="petEquip" data-id="${p.id}" style="--pc:${PET_RAR[p.r].color}">
        <span class="pc-face">${p.e}</span><b>${p.name}</b>${petStars(p.id)}<small>Lv.${lv} · ${p.event ? '🎉 한정' : PET_RAR[p.r].name}</small><small class="pc-b">${petBonusText(p, lv)}</small><span class="pc-tag">${S.petOn === p.id ? '✅ 함께하는 중' : '데리고 다니기'}</span></button>`
      : `<div class="pet-card locked" style="--pc:${PET_RAR[p.r].color}"><span class="pc-face">${p.event || p.fusion ? p.e : '❔'}</span><b>${p.event || p.fusion ? p.name : '???'}</b><small>${p.event ? '🎉 이벤트 한정' : p.fusion ? '🧪 합성으로' : PET_RAR[p.r].name}</small></div>`; }).join('')}</div>
    ${petFuseHTML()}
    <h3 class="sub">🥚 펫 알 <small class="muted">같은 펫이 또 나오면 레벨 +1</small></h3>
    <div class="pet-eggs">${PET_EGGS.map(eg => `<button class="btn ${eg.cur === 'gems' ? '' : 'green'}" data-act="petEgg" data-id="${eg.id}">${eg.e} ${eg.name}<br><small>${eg.cur === 'gems' ? '💎' : '💰'} ${fmt(eg.cost)} · ${Object.entries(eg.w).filter(([, v]) => v).map(([r, v]) => PET_RAR[r].name + ' ' + Math.round(v * 100) + '%').join(' ')}</small></button>`).join('')}</div>
    <div class="row"><button class="btn ghost small" data-act="close">닫기</button></div>`);
}
function petReveal(p, isNew, title) {
  const lv = petLv(p.id);
  showModal(`<div class="pet-reveal" style="--pc:${PET_RAR[p.r].color}">
    ${title ? `<div class="new-badge">${title}</div>` : isNew ? '<div class="new-badge">NEW! 새 펫</div>' : ''}
    <div class="pr-face">${p.e}</div>
    <h3>${p.name}</h3>
    <div class="pet-rar big">${PET_RAR[p.r].name}</div>
    <p>${isNew ? '' : `이미 있는 펫이라 <b>Lv.${lv}</b>(으)로 올랐어요! `}${petBonusText(p, lv)}</p>
    <div class="row">${S.petOn === p.id ? '' : `<button class="btn green" data-act="petEquip" data-id="${p.id}">데리고 다니기</button>`}<button class="btn" data-act="pets">🐾 펫 목록</button></div>
  </div>`);
}
function petEgg(id, free) {
  const eg = PET_EGGS.find(x => x.id === id);
  if (!eg || (!free && !spend(eg.cost, eg.cur))) return;
  // 등급 뽑기 → 그 등급의 펫 중 하나
  let r = Math.random(), rar = 'common';
  for (const [k, v] of Object.entries(eg.w)) { if (r < v) { rar = k; break; } r -= v; }
  const pool = PETS.filter(p => p.r === rar && !p.event);
  const p = pool[Math.floor(Math.random() * pool.length)];
  S.pets = S.pets || {};
  const isNew = !S.pets[p.id];
  if (isNew) S.pets[p.id] = 1;
  else if (S.pets[p.id] < PET_MAX) S.pets[p.id]++;
  else { earn(eg.cur === 'gems' ? 30 : 8000, eg.cur); toast(`최고 레벨이라 ${eg.cur === 'gems' ? '💎 30' : '💰 8,000'}으로 돌려받았어요`); }
  if (!S.petOn) S.petOn = p.id;
  save(); updateHud(); sfx(isNew ? 'yay' : 'hatch');
  petReveal(p, isNew);
}
function petTreat() {
  const p = S.petOn && petById(S.petOn);
  if (!p || petLv(p.id) >= PET_MAX) return;
  if (!spend(petTreatCost(p))) return;
  S.pets[p.id]++;
  save(); updateHud(); sfx('level');
  toast(`🍪 ${p.name} Lv.${S.pets[p.id]}! ${petBonusText(p, S.pets[p.id])}`);
  openPets();
}
function petEquip(id) {
  if (!petLv(id)) return;
  S.petOn = id;
  save(); render();
  toast(`${petById(id).e} ${petById(id).name}와(과) 함께해요!`);
  openPets();
}
function updatePetBtn() {
  const b = $('#petBtn');
  if (!b) return;
  const p = S.petOn && petById(S.petOn);
  b.classList.toggle('hidden', tab !== 'island' || !!VISIT);
  b.innerHTML = p ? `${p.e}<small>Lv.${petLv(p.id)}</small>` : '🐾<small>펫</small>';
  updateFishBtn();
}
// ===================== 🎣 낚시 =====================
// 미끼를 던지고, 물고기가 물면 움직이는 바늘이 초록 칸에 왔을 때 눌러서 낚는다.
// 희귀한 물고기일수록 초록 칸이 좁고 바늘이 빨라요. 미끼는 20분마다 1개씩 (최대 5개)
const FISH_RAR = {
  junk:      { name: '잡동사니', color: '#9aa4b2', w: 8,  zone: 0.34, speed: 0.7 },
  common:    { name: '보통',     color: '#b4bccb', w: 55, zone: 0.28, speed: 0.85 },
  rare:      { name: '희귀',     color: '#5cb6ff', w: 25, zone: 0.2,  speed: 1.15 },
  epic:      { name: '서사',     color: '#e45cff', w: 9,  zone: 0.14, speed: 1.5 },
  legendary: { name: '전설',     color: '#ffb020', w: 3,  zone: 0.09, speed: 2.0 },
};
const FISHES = [
  { id: 'boot',   e: '👢', name: '낡은 장화',       r: 'junk',      cm: [25, 35],   say: '앗… 누가 버렸지?' },
  { id: 'can',    e: '🥫', name: '빈 깡통',         r: 'junk',      cm: [8, 12],    say: '바다를 깨끗하게! 🍖 먹이로 바꿔 줄게요' },
  { id: 'weed',   e: '🌿', name: '미역',            r: 'junk',      cm: [20, 80],   say: '미역국 끓여 먹을까?' },
  { id: 'crucian', e: '🐟', name: '붕어',           r: 'common',    cm: [15, 35] },
  { id: 'tropic', e: '🐠', name: '열대어',          r: 'common',    cm: [8, 20] },
  { id: 'shrimp', e: '🦐', name: '새우',            r: 'common',    cm: [5, 15] },
  { id: 'crab',   e: '🦀', name: '꽃게',            r: 'common',    cm: [10, 25] },
  { id: 'puffer', e: '🐡', name: '복어',            r: 'common',    cm: [15, 40],   say: '뿌우! 화났어요' },
  { id: 'squid',  e: '🦑', name: '오징어',          r: 'rare',      cm: [30, 60] },
  { id: 'octo',   e: '🐙', name: '문어',            r: 'rare',      cm: [40, 90] },
  { id: 'turtle', e: '🐢', name: '바다거북',        r: 'rare',      cm: [50, 120],  say: '천천히… 반가워요' },
  { id: 'lobster', e: '🦞', name: '랍스터',         r: 'rare',      cm: [25, 50] },
  { id: 'clam',   e: '🦪', name: '보석 조개',       r: 'rare',      cm: [10, 20],   say: '안에서 💎 보석이 나왔어요!' },
  { id: 'dolphin', e: '🐬', name: '돌고래',         r: 'epic',      cm: [150, 300], say: '끼익끼익! 신나요' },
  { id: 'shark',  e: '🦈', name: '상어',            r: 'epic',      cm: [200, 500] },
  { id: 'seal',   e: '🦭', name: '물범',            r: 'epic',      cm: [120, 200] },
  { id: 'egg',    e: '🥚', name: '신비한 바다 알',   r: 'epic',      cm: [20, 40],   say: '부화장에 넣었어요!' },
  { id: 'whale',  e: '🐋', name: '고래',            r: 'legendary', cm: [800, 2500] },
  { id: 'dragon', e: '🐉', name: '바다의 용',        r: 'legendary', cm: [1000, 3000], say: '전설 속의 용을 낚았어요!!' },
  { id: 'chest',  e: '🎁', name: '해적의 보물상자',  r: 'legendary', cm: [60, 100],  say: '보물이 가득!' },
];
const FISH_MAX_BAIT = 5, FISH_REGEN = 20 * 60 * 1000, FISH_BAIT_GEMS = 5;
function fishBait() {
  const f = S.fish = S.fish || { bait: FISH_MAX_BAIT, t: Date.now() };
  if (f.bait >= FISH_MAX_BAIT) { f.t = Date.now(); return f.bait; }
  const n = Math.floor((Date.now() - f.t) / FISH_REGEN);
  if (n > 0) { f.bait = Math.min(FISH_MAX_BAIT, f.bait + n); f.t += n * FISH_REGEN; if (f.bait >= FISH_MAX_BAIT) f.t = Date.now(); }
  return f.bait;
}
const fishNext = () => Math.max(0, Math.ceil((S.fish.t + FISH_REGEN - Date.now()) / 1000));
let FISH = null;   // { st: 'wait'|'reel'|'done', fish, zone, speed, pos, dir, t0, raf }
function fishPick() {
  const rars = Object.keys(FISH_RAR);
  let r = Math.random() * rars.reduce((s, k) => s + FISH_RAR[k].w, 0), rar = 'common';
  for (const k of rars) { r -= FISH_RAR[k].w; if (r <= 0) { rar = k; break; } }
  const pool = FISHES.filter(f => f.r === rar);
  return pool[Math.floor(Math.random() * pool.length)];
}
function openFishing() {
  tutFlag('fish', true);
  fishStop();
  const bait = fishBait(), dex = S.fishDex || {};
  const got = FISHES.filter(f => dex[f.id]).length;
  showModal(`<div class="fish-panel"><h3>🎣 낚시터</h3>
    <div class="fish-sea" id="fishSea"><span class="fish-bob" id="fishBob">🎣</span><span class="fish-msg" id="fishMsg">미끼를 던져 봐요!</span>
      <span class="fish-wave">🌊</span><span class="fish-wave w2">🌊</span><span class="fish-wave w3">🌊</span></div>
    <div class="fish-bar hidden" id="fishBar"><i class="fish-zone" id="fishZone"><b></b></i><span class="fish-hook" id="fishHook">🪝</span></div>
    <div class="fish-bait">🪱 미끼 <b>${bait}</b>/${FISH_MAX_BAIT} ${bait < FISH_MAX_BAIT ? `<small class="muted">다음 미끼 ${mmss(fishNext())}</small>` : ''}</div>
    <div class="row" id="fishBtns">
      ${bait ? '<button class="btn big green" data-act="fishCast">🎣 던지기</button>' : `<button class="btn big" data-act="fishBuy">🪱 미끼 ${FISH_MAX_BAIT}개 (💎 ${FISH_BAIT_GEMS})</button>`}
    </div>
    <details class="fish-dex"><summary>📖 물고기 도감 ${got}/${FISHES.length}</summary>
      <div class="fish-grid">${FISHES.map(f => dex[f.id] ? `<div class="fish-card" style="--fc:${FISH_RAR[f.r].color}"><span>${f.e}</span><b>${f.name}</b><small>${FISH_RAR[f.r].name} · ${dex[f.id].n}마리</small><small>최고 ${dex[f.id].cm}cm</small></div>`
        : `<div class="fish-card no"><span>❓</span><b>???</b><small>${FISH_RAR[f.r].name}</small></div>`).join('')}</div>
    </details>
    <p class="muted fish-help">던진 뒤 <b>❗</b>가 뜨면 움직이는 🪝가 <b style="color:#7dff8f">초록 칸</b>에 왔을 때 <b>낚아채기</b>! 가운데 노란 칸이면 <b>완벽!</b></p>
    <div class="row"><button class="btn ghost small" data-act="fishClose">닫기</button></div></div>`);
  updateFishBtn();
}
function fishStop() { if (FISH && FISH.raf) cancelAnimationFrame(FISH.raf); if (FISH && FISH.timer) clearTimeout(FISH.timer); FISH = null; }
function fishCast() {
  if (FISH) return;
  if (!fishBait()) { toast('🪱 미끼가 없어요'); return; }
  S.fish.bait--; save();
  { const bb = document.querySelector('#modalBox .fish-bait b'); if (bb) bb.textContent = S.fish.bait; }
  updateFishBtn();
  const fish = fishPick(), R = FISH_RAR[fish.r];
  FISH = { st: 'wait', fish, zone: R.zone, speed: R.speed, pos: 0, dir: 1 };
  const zs = 0.1 + Math.random() * (0.8 - R.zone);
  FISH.z0 = zs; FISH.z1 = zs + R.zone;
  $('#fishBtns').innerHTML = '<button class="btn big" data-act="fishHit">⏳ 기다리는 중…</button>';
  $('#fishMsg').textContent = '찌가 흔들흔들…';
  $('#fishBob').classList.add('cast');
  sfx('breed');
  FISH.timer = setTimeout(fishBite, 1200 + Math.random() * 2300);
}
function fishBite() {
  if (!FISH || !$('#fishBar')) { fishStop(); return; }
  FISH.st = 'reel';
  FISH.t0 = performance.now();
  $('#fishMsg').innerHTML = '<b class="fish-bang">❗ 물었다!</b>';
  $('#fishBob').classList.add('bite');
  const bar = $('#fishBar'), z = $('#fishZone');
  bar.classList.remove('hidden');
  z.style.left = (FISH.z0 * 100) + '%'; z.style.width = (FISH.zone * 100) + '%';
  $('#fishBtns').innerHTML = '<button class="btn big green fish-hit" data-act="fishHit">🎣 낚아채기!</button>';
  sfx('coin');
  let last = performance.now();
  const step = (now) => {
    if (!FISH || FISH.st !== 'reel') return;
    const hook = $('#fishHook');
    if (!hook) { fishStop(); return; }
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    FISH.pos += FISH.dir * FISH.speed * dt;
    if (FISH.pos >= 1) { FISH.pos = 1; FISH.dir = -1; }
    if (FISH.pos <= 0) { FISH.pos = 0; FISH.dir = 1; }
    hook.style.left = (FISH.pos * 100) + '%';
    // 8초 안에 안 누르면 도망
    if (now - FISH.t0 > 8000) { fishEnd(false, '물고기가 지쳐서 도망갔어요…'); return; }
    FISH.raf = requestAnimationFrame(step);
  };
  FISH.raf = requestAnimationFrame(step);
}
function fishHit() {
  if (!FISH) return;
  if (FISH.st === 'wait') { fishEnd(false, '너무 빨랐어요! 물고기가 놀라서 도망갔어요 💨'); return; }
  if (FISH.st !== 'reel') return;
  const p = FISH.pos, mid = (FISH.z0 + FISH.z1) / 2;
  if (p < FISH.z0 || p > FISH.z1) { fishEnd(false, `앗, 놓쳤어요! (놓친 물고기: ${FISH.fish.e} ${FISH.fish.name})`); return; }
  fishEnd(true, '', Math.abs(p - mid) <= FISH.zone * 0.15);
}
function fishEnd(ok, msg, perfect) {
  if (!FISH) return;
  const fish = FISH.fish;
  if (FISH.raf) cancelAnimationFrame(FISH.raf);
  if (FISH.timer) clearTimeout(FISH.timer);
  FISH.st = 'done';
  const btns = $('#fishBtns');
  if (!btns) { fishStop(); return; }
  $('#fishBob').classList.remove('cast', 'bite');
  if (!ok) {
    sfx('err');
    $('#fishMsg').textContent = msg;
  } else {
    const [a, b] = fish.cm;
    let cm = Math.round(a + Math.random() * (b - a));
    if (perfect) cm = Math.round(cm * 1.3);
    S.fishDex = S.fishDex || {};
    const d = S.fishDex[fish.id], isNew = !d, rec = d && cm > d.cm;
    S.fishDex[fish.id] = { n: (d ? d.n : 0) + 1, cm: Math.max(cm, d ? d.cm : 0) };
    statAdd('fish', 1);
    const inc = totalIncome(), mul = perfect ? 1.5 : 1;
    let gold = 0, gems = 0, food = 0, extra = '';
    if (fish.r === 'junk') food = fish.id === 'can' ? 200 : 60;
    if (fish.r === 'common') gold = Math.max(300, inc * 120);
    if (fish.r === 'rare') { gold = Math.max(1500, inc * 400); gems = fish.id === 'clam' ? 5 : 1; }
    if (fish.r === 'epic') { gold = Math.max(6000, inc * 1200); gems = 3; }
    if (fish.r === 'legendary') { gold = Math.max(30000, inc * 4000); gems = fish.id === 'chest' ? 25 : 10; }
    if (fish.id === 'egg') {
      if (S.hatch.length < hatchCap()) {
        const pool = CAT_LIST.filter(c => c.rarity === 'epic' && !c.shop), c = pool[Math.floor(Math.random() * pool.length)];
        S.hatch.push(c.id); extra = ` · 🥚 ${c.face} ${c.name} 알!`;
      } else { gems += 5; extra = ' · (부화장이 가득 차서 대신 💎5)'; }
    }
    gold = Math.round(gold * mul); gems = Math.round(gems * mul);
    if (gold) earn(gold);
    if (gems) earn(gems, 'gems');
    if (food) earn(food, 'food');
    sfx(fish.r === 'legendary' || fish.r === 'epic' ? 'win' : fish.r === 'junk' ? 'breed' : 'yay');
    updateHud();
    $('#fishMsg').innerHTML = `<span class="fish-catch" style="--fc:${FISH_RAR[fish.r].color}"><span class="fc-e">${fish.e}</span>
      <b>${perfect ? '✨ 완벽! ' : ''}${fish.name}${isNew ? ' <i class="fc-new">NEW</i>' : ''}</b>
      <small>${FISH_RAR[fish.r].name} · ${fmt(cm)}cm${rec ? ' 🏅 최고 기록!' : ''}</small>
      <small>${[gold ? '💰 ' + shortNum(gold) : '', gems ? '💎 ' + gems : '', food ? '🍖 ' + food : ''].filter(Boolean).join(' · ')}${extra}</small>
      ${fish.say ? `<small class="muted">${fish.say}</small>` : ''}</span>`;
  }
  $('#fishBar').classList.add('hidden');
  save();
  const bait = fishBait();
  btns.innerHTML = bait ? `<button class="btn big green" data-act="fishAgain">🎣 한 번 더 (🪱 ${bait})</button>`
    : `<button class="btn big" data-act="fishBuy">🪱 미끼 ${FISH_MAX_BAIT}개 (💎 ${FISH_BAIT_GEMS})</button>`;
  const bb = document.querySelector('#modalBox .fish-bait b'); if (bb) bb.textContent = bait;
  FISH = null;
  updateFishBtn();
}
function fishBuy() {
  if (!spend(FISH_BAIT_GEMS, 'gems')) return;
  fishBait();
  S.fish.bait = Math.max(S.fish.bait, 0) + FISH_MAX_BAIT;
  sfx('buy'); save(); updateHud();
  toast(`🪱 미끼 ${FISH_MAX_BAIT}개!`);
  openFishing();
}
function updateFishBtn() {
  // 🎮 미니게임 버튼 (낚시 · 경주 · 룰렛 · 짝 맞추기 + 새 게임 12개가 모두 여기에)
  updateTodoBtn();
  const gb = $('#gameBtn');
  if (gb) { gb.classList.toggle('hidden', tab !== 'island' || !!VISIT); gb.classList.toggle('ready', mgAnyReady()); }
  const b = $('#fishBtn');
  if (!b) return;
  b.classList.toggle('hidden', tab !== 'island' || !!VISIT);
  const n = fishBait();
  b.classList.toggle('ready', n > 0);
  b.innerHTML = `🎣<small>낚시 ${n}</small>`;
  const rb = $('#raceBtn');
  if (rb) { rb.classList.toggle('hidden', tab !== 'island' || !!VISIT); rb.classList.toggle('ready', raceFreeOk()); }
  const mb = $('#memBtn');
  if (mb) { mb.classList.toggle('hidden', tab !== 'island' || !!VISIT); mb.classList.toggle('ready', memDay().plays < MEM_FREE); }
  const wb = $('#wheelBtn');
  if (wb) { wb.classList.toggle('hidden', tab !== 'island' || !!VISIT); wb.classList.toggle('ready', !wheelDay().free); }
}
setInterval(() => { if (typeof S !== 'undefined' && S) updateFishBtn(); }, 30000);

// ===================== 🏁 몬스터 경주 =====================
// 몬스터 5마리가 달리기 시합! 1등을 맞히면 건 골드의 4.5배. 하루 1번은 🎟️ 무료 응원권 (맞히면 💎)
const RACE_N = 5, RACE_PAY = 4.5, RACE_FREE_GEMS = 15;
const RACE_EVENTS = [
  ['💨', '부스터 발동!', 1.9], ['🍌', '바나나 껍질에 미끄러졌어요!', 0.25], ['😴', '잠깐 낮잠…', 0.1],
  ['🔥', '불꽃 질주!', 1.6], ['🌪️', '회오리 바람을 탔어요!', 1.7], ['🪨', '돌에 걸려 넘어졌어요!', 0.3], ['🎵', '신나는 음악에 춤을 춰요~', 0.5],
];
let RACE = null;
function raceNew() {
  const pool = CAT_LIST.filter(c => !c.shop && RANK[c.rarity] <= RANK.mythic);
  const used = new Set(), runners = [];
  while (runners.length < RACE_N) {
    const c = pool[Math.floor(Math.random() * pool.length)];
    if (used.has(c.face)) continue;
    used.add(c.face);
    runners.push({ type: c.id, face: c.face, name: c.name, pos: 0, v: 0, fx: null, fxT: 0 });
  }
  RACE = { runners, pick: null, bet: null, st: 'pick' };
}
const raceFreeOk = () => S.raceFree !== dayKey();
function raceBets() {
  const g = S.infinite ? 1e6 : S.gold;
  return [
    { id: 'free', label: `🎟️ 무료 응원권`, sub: raceFreeOk() ? `맞히면 💎 ${RACE_FREE_GEMS}` : '내일 또 받아요', amt: 0, ok: raceFreeOk() },
    { id: 's', label: '💰 조금', amt: Math.max(100, Math.floor(g * 0.01)) },
    { id: 'm', label: '💰 보통', amt: Math.max(500, Math.floor(g * 0.05)) },
    { id: 'l', label: '💰 왕창', amt: Math.max(2000, Math.floor(g * 0.1)) },
  ].map(b => ({ ...b, ok: b.id === 'free' ? b.ok : (S.infinite || S.gold >= b.amt) }));
}
function openRace() {
  tutFlag('race', true);
  if (!RACE || RACE.st === 'done') raceNew();
  raceDraw();
}
function raceDraw() {
  const R = RACE;
  const lanes = R.runners.map((r, i) => `<div class="race-lane ${R.pick === i ? 'picked' : ''}" data-act="racePick" data-i="${i}">
      <span class="rl-no">${i + 1}</span>
      <div class="rl-track"><span class="rl-runner" id="rr${i}" style="left:${r.pos}%">${r.face}<i class="rl-fx" id="rf${i}"></i></span><span class="rl-goal">🏁</span></div>
    </div>
    <div class="rl-name">${R.pick === i ? '👉 ' : ''}${esc(r.name)} <small>${RAR[CAT[r.type].rarity].name}</small></div>`).join('');
  const bets = raceBets();
  showModal(`<div class="race-panel"><h3>🏁 몬스터 경주</h3>
    <div class="race-msg" id="raceMsg">${R.st === 'pick' ? '누가 1등 할까요? 응원할 몬스터를 눌러요!' : R.st === 'run' ? '달린다~!' : ''}</div>
    <div class="race-lanes">${lanes}</div>
    <div id="raceCtl">${R.st === 'pick' ? `<div class="race-bets">${bets.map(b => `<button class="race-bet ${R.bet === b.id ? 'on' : ''}" data-act="raceBet" data-b="${b.id}" ${b.ok ? '' : 'disabled'}><b>${b.label}</b><small>${b.id === 'free' ? b.sub : '💰 ' + shortNum(b.amt) + ' → ' + shortNum(b.amt * RACE_PAY)}</small></button>`).join('')}</div>
      <div class="row"><button class="btn big green" data-act="raceGo" ${R.pick != null && R.bet ? '' : 'disabled'}>🏁 출발!</button></div>
      <p class="muted race-help">1등을 맞히면 건 골드의 <b>${RACE_PAY}배</b>! 달리는 중에 💨부스터 · 🍌미끄러짐 같은 일이 생겨요.</p>` : ''}</div>
    <div class="row"><button class="btn ghost small" data-act="raceClose">닫기</button></div></div>`);
}
function raceGo() {
  const R = RACE;
  if (!R || R.st !== 'pick' || R.pick == null || !R.bet) return;
  const b = raceBets().find(x => x.id === R.bet);
  if (!b || !b.ok) { toast('그건 지금 걸 수 없어요'); return; }
  if (b.id === 'free') S.raceFree = dayKey();
  else if (!spend(b.amt)) return;
  R.amt = b.amt; R.st = 'run'; R.t0 = performance.now(); R.last = R.t0; R.nextEv = R.t0 + 900;
  save(); updateHud();
  raceDraw();
  sfx('breed');
  R.runners.forEach(r => { r.v = 13 + Math.random() * 4; });
  const step = () => {
    const now = performance.now();
    if (!RACE || RACE !== R || R.st !== 'run') return;
    if (!$('#rr0')) { R.st = 'done'; return; }   // 창을 닫으면 멈춤 (다시 열면 새 경주)
    const dt = Math.min(0.05, (now - R.last) / 1000); R.last = now;
    // 가끔 이벤트
    if (now > R.nextEv) {
      R.nextEv = now + 600 + Math.random() * 900;
      const r = R.runners[Math.floor(Math.random() * RACE_N)], ev = RACE_EVENTS[Math.floor(Math.random() * RACE_EVENTS.length)];
      r.fx = ev; r.fxT = now + 1100;
      const m = $('#raceMsg'); if (m) m.textContent = `${r.face} ${ev[0]} ${ev[1]}`;
    }
    let winner = null;
    R.runners.forEach((r, i) => {
      // 속도는 조금씩 흔들리고, 이벤트 중이면 배수
      r.v += (Math.random() - 0.5) * 6 * dt; r.v = Math.max(9, Math.min(20, r.v));
      const mult = r.fx && now < r.fxT ? r.fx[2] : 1;
      if (r.fx && now >= r.fxT) r.fx = null;
      r.pos = Math.min(100, r.pos + r.v * mult * dt);
      const el = $('#rr' + i); if (el) el.style.left = r.pos * 0.9 + '%';
      const fx = $('#rf' + i); if (fx) fx.textContent = r.fx ? r.fx[0] : '';
      if (r.pos >= 100 && winner == null) winner = i;
    });
    if (winner != null) { raceEnd(winner); return; }
    R.raf = setTimeout(step, 40);
  };
  R.raf = setTimeout(step, 40);
}
function raceEnd(w) {
  const R = RACE;
  R.st = 'done';
  const win = w === R.pick, r = R.runners[w];
  let msg;
  if (win) {
    statAdd('raceWin', 1);
    if (R.bet === 'free') { earn(RACE_FREE_GEMS, 'gems'); msg = `🎉 맞혔어요! ${r.face} ${r.name} 1등! 💎 ${RACE_FREE_GEMS}`; }
    else { const got = Math.round(R.amt * RACE_PAY); earn(got); msg = `🎉 맞혔어요! ${r.face} ${r.name} 1등! 💰 ${shortNum(got)}`; }
    sfx('win');
  } else {
    msg = `😢 아쉬워요… 1등은 ${r.face} ${r.name}! (내가 응원한 건 ${R.runners[R.pick].face})`;
    sfx('lose');
  }
  statAdd('race', 1);
  save(); updateHud();
  const m = $('#raceMsg'); if (m) { m.textContent = msg; m.classList.add(win ? 'win' : 'lose'); }
  const lane = document.querySelectorAll('#modalBox .race-lane')[w]; if (lane) lane.classList.add('winner');
  const c = $('#raceCtl'); if (c) c.innerHTML = '<div class="row"><button class="btn big green" data-act="raceAgain">🏁 한 번 더!</button></div>';
}

// ===================== 🎡 행운의 룰렛 =====================
// 하루 1번 무료로 돌리고, 💎10으로 5번까지 더 돌릴 수 있다. 8칸 중 하나가 나온다
const WHEEL_COST = 10, WHEEL_PAID_MAX = 5;
const WHEEL = [
  { e: '💰', name: '골드', color: '#ffd24a', w: 22 },
  { e: '💎', name: '보석 5', color: '#5cc8ff', w: 18 },
  { e: '🍖', name: '먹이', color: '#ff9f5c', w: 18 },
  { e: '📦', name: '룬 상자', color: '#a78bfa', w: 12 },
  { e: '🤑', name: '골드 대박', color: '#ffb020', w: 8 },
  { e: '🥚', name: '희귀 알', color: '#7dff8f', w: 10 },
  { e: '💠', name: '보석 20', color: '#3dffd8', w: 6 },
  { e: '🎰', name: '잭팟 💎100', color: '#ff4d6d', w: 2 },
];
const wheelDay = () => (S.wheel && S.wheel.day === dayKey() ? S.wheel : (S.wheel = { day: dayKey(), free: 0, paid: 0 }));
let WSPIN = null;   // 돌아가는 중이면 { idx }
let wheelRot = 0;
function openWheel() {
  tutFlag('wheel', true);
  const d = wheelDay();
  const n = WHEEL.length, slice = 360 / n;
  const grad = WHEEL.map((p, i) => `${p.color} ${i * slice}deg ${(i + 1) * slice}deg`).join(', ');
  const labels = WHEEL.map((p, i) => `<span class="wh-lab" style="transform: rotate(${i * slice + slice / 2}deg) translateY(calc(var(--wr) * -1))"><b>${p.e}</b></span>`).join('');
  const canFree = !d.free, canPaid = d.paid < WHEEL_PAID_MAX;
  showModal(`<div class="wheel-panel"><h3>🎡 행운의 룰렛</h3>
    <div class="wheel-wrap"><div class="wheel-pin">▼</div>
      <div class="wheel" id="wheel" style="background: conic-gradient(${grad}); transform: rotate(${wheelRot}deg)">${labels}<div class="wheel-hub">🎡</div></div>
    </div>
    <div class="wheel-msg" id="wheelMsg">${canFree ? '오늘의 무료 룰렛이 있어요! 돌려 봐요 🎉' : canPaid ? `💎 ${WHEEL_COST}로 더 돌릴 수 있어요 (오늘 ${WHEEL_PAID_MAX - d.paid}번 남음)` : '오늘은 다 돌렸어요. 내일 또 와요! 👋'}</div>
    <div class="row" id="wheelBtns">${canFree ? '<button class="btn big green" data-act="wheelSpin">🎡 무료로 돌리기!</button>'
      : canPaid ? `<button class="btn big" data-act="wheelSpin">🎡 돌리기 (💎 ${WHEEL_COST})</button>` : ''}</div>
    <div class="wheel-legend">${WHEEL.map(p => `<span>${p.e} ${p.name}</span>`).join('')}</div>
    <div class="row"><button class="btn ghost small" data-act="wheelClose">닫기</button></div></div>`);
}
function wheelSpin() {
  if (WSPIN) return;
  const d = wheelDay();
  if (!d.free) d.free = 1;
  else if (d.paid < WHEEL_PAID_MAX) { if (!spend(WHEEL_COST, 'gems')) return; d.paid++; }
  else { toast('오늘은 다 돌렸어요. 내일 또 와요!'); return; }
  save(); updateHud();
  // 무엇이 나올지 먼저 정하고, 그 칸이 바늘(위쪽)에 오도록 돌린다
  let r = Math.random() * WHEEL.reduce((s, p) => s + p.w, 0), idx = 0;
  for (let i = 0; i < WHEEL.length; i++) { r -= WHEEL[i].w; if (r <= 0) { idx = i; break; } }
  const slice = 360 / WHEEL.length;
  const target = 360 - (idx * slice + slice / 2) + (Math.random() - 0.5) * slice * 0.6;
  wheelRot = wheelRot - (wheelRot % 360) + 360 * 6 + target;
  WSPIN = { idx };
  const w = $('#wheel');
  if (w) { w.classList.add('spinning'); w.style.transform = `rotate(${wheelRot}deg)`; }
  const b = $('#wheelBtns'); if (b) b.innerHTML = '<button class="btn big" disabled>🎡 빙글빙글…</button>';
  const m = $('#wheelMsg'); if (m) m.textContent = '두근두근…';
  sfx('breed');
  setTimeout(() => wheelPrize(idx), 4200);
}
function wheelPrize(idx) {
  WSPIN = null;
  const p = WHEEL[idx], inc = totalIncome();
  let got = '';
  if (p.e === '💰') { const g = Math.max(2000, Math.round(inc * 600)); earn(g); got = `💰 ${shortNum(g)}`; }
  if (p.e === '🤑') { const g = Math.max(8000, Math.round(inc * 2400)); earn(g); got = `💰 ${shortNum(g)} 대박!`; }
  if (p.e === '💎') { earn(5, 'gems'); got = '💎 5'; }
  if (p.e === '💠') { earn(20, 'gems'); got = '💎 20'; }
  if (p.e === '🎰') { earn(100, 'gems'); got = '💎 100 잭팟!!'; }
  if (p.e === '🍖') { const f = Math.max(300, Math.round(inc * 60)); earn(f, 'food'); got = `🍖 ${shortNum(f)}`; }
  if (p.e === '📦') { got = '💠 ' + runeText(giveRune([0.6, 0.3, 0.1])); }
  if (p.e === '🥚') {
    if (S.hatch.length < hatchCap()) {
      const rk = ['rare', 'special', 'masterwork', 'hero', 'epic'][Math.floor(Math.random() * 5)];
      const pool = CAT_LIST.filter(c => c.rarity === rk && !c.shop), c = pool[Math.floor(Math.random() * pool.length)];
      S.hatch.push(c.id); got = `🥚 ${c.face} ${c.name} 알 (${RAR[rk].name})`;
    } else { earn(10, 'gems'); got = '💎 10 (부화장이 가득 차서)'; }
  }
  statAdd('wheel', 1);
  save(); updateHud();
  sfx(p.e === '🎰' || p.e === '🤑' ? 'win' : 'yay');
  toast(`🎡 ${got}`);
  if (!$('#wheel')) return;
  const w = $('#wheel'); w.classList.remove('spinning');
  const m = $('#wheelMsg'); if (m) { m.innerHTML = `<span class="wheel-got">${p.e} ${esc(got)}</span>`; }
  const d = wheelDay();
  const b = $('#wheelBtns');
  if (b) b.innerHTML = d.paid < WHEEL_PAID_MAX ? `<button class="btn big" data-act="wheelSpin">🎡 한 번 더 (💎 ${WHEEL_COST})</button>` : '<p class="muted">오늘은 다 돌렸어요. 내일 또 와요! 👋</p>';
  updateFishBtn();
}

// ===================== 🃏 몬스터 짝 맞추기 =====================
// 뒤집힌 카드 16장(8쌍)에서 같은 몬스터 두 장을 찾는다. 적게 뒤집을수록 ⭐이 많고 보상이 커진다.
// 하루 3판 무료, 그 뒤로는 💎 5
const MEM_FREE = 3, MEM_COST = 5, MEM_PAIRS = 8;
const memDay = () => (S.mem && S.mem.day === dayKey() ? S.mem : (S.mem = { day: dayKey(), plays: 0, best: (S.mem && S.mem.best) || null }));
let MEM = null;   // { cards:[{face, open, done}], first, lock, moves, t0, found }
function memStars(moves) { return moves <= 11 ? 3 : moves <= 15 ? 2 : 1; }
function openMemory() {
  tutFlag('memory', true);
  if (MEM && !MEM.over) { memDraw(); return; }
  const d = memDay(), free = d.plays < MEM_FREE;
  showModal(`<div class="mem-panel"><h3>🃏 몬스터 짝 맞추기</h3>
    <div class="mem-intro"><span>🃏🃏</span><p>카드를 두 장씩 뒤집어서 <b>같은 몬스터</b>를 찾아요!<br>적게 뒤집을수록 ⭐이 많아져요 (11번 이하 ⭐⭐⭐)</p></div>
    ${S.mem && S.mem.best ? `<p class="muted">🏅 최고 기록: ${S.mem.best.moves}번 · ${S.mem.best.sec}초</p>` : ''}
    <div class="row"><button class="btn big green" data-act="memStart">${free ? `🃏 시작! (무료 ${MEM_FREE - d.plays}판 남음)` : `🃏 시작 (💎 ${MEM_COST})`}</button></div>
    <div class="row"><button class="btn ghost small" data-act="memClose">닫기</button></div></div>`);
}
function memStart() {
  const d = memDay();
  if (d.plays >= MEM_FREE && !spend(MEM_COST, 'gems')) return;
  d.plays++; save(); updateHud();
  // 서로 다른 몬스터 8마리
  const faces = [], seen = new Set();
  while (faces.length < MEM_PAIRS) {
    const c = CAT_LIST[Math.floor(Math.random() * CAT_LIST.length)];
    if (seen.has(c.face)) continue;
    seen.add(c.face); faces.push({ face: c.face, name: c.name });
  }
  const cards = [...faces, ...faces].map((f, i) => ({ ...f, k: i, open: false, done: false }));
  for (let i = cards.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [cards[i], cards[j]] = [cards[j], cards[i]]; }
  MEM = { cards, first: null, lock: false, moves: 0, t0: Date.now(), found: 0, over: false };
  sfx('breed');
  memDraw();
}
function memDraw() {
  const M = MEM;
  showModal(`<div class="mem-panel"><h3>🃏 몬스터 짝 맞추기</h3>
    <div class="mem-stat"><span>🔄 <b id="memMoves">${M.moves}</b>번</span><span>✅ <b id="memFound">${M.found}</b>/${MEM_PAIRS}</span><span>⭐ <b id="memStars">${'⭐'.repeat(memStars(M.moves + 1 > M.moves ? M.moves : M.moves))}</b></span></div>
    <div class="mem-grid">${M.cards.map((c, i) => `<button class="mem-card ${c.open || c.done ? 'open' : ''} ${c.done ? 'done' : ''}" data-act="memFlip" data-i="${i}" id="mc${i}"><span class="mc-back">❓</span><span class="mc-front">${c.face}</span></button>`).join('')}</div>
    <div class="mem-msg" id="memMsg">같은 몬스터 두 장을 찾아요!</div>
    <div class="row"><button class="btn ghost small" data-act="memClose">닫기</button></div></div>`);
}
function memFlip(i) {
  const M = MEM;
  if (!M || M.over || M.lock) return;
  const c = M.cards[i];
  if (!c || c.open || c.done) return;
  c.open = true;
  const el = $('#mc' + i); if (el) el.classList.add('open');
  sfx('tap');
  if (M.first == null) { M.first = i; return; }
  const a = M.cards[M.first];
  M.moves++;
  const mv = $('#memMoves'); if (mv) mv.textContent = M.moves;
  const st = $('#memStars'); if (st) st.textContent = '⭐'.repeat(memStars(M.moves));
  if (a.face === c.face) {
    a.done = c.done = true; M.found++; M.first = null;
    [M.cards.indexOf(a), i].forEach(k => { const e = $('#mc' + k); if (e) e.classList.add('done'); });
    const f = $('#memFound'); if (f) f.textContent = M.found;
    const m = $('#memMsg'); if (m) m.textContent = `✨ ${c.face} ${c.name} 짝 찾기 성공!`;
    sfx('coin');
    if (M.found >= MEM_PAIRS) memWin();
  } else {
    M.lock = true;
    const ai = M.first; M.first = null;
    setTimeout(() => {
      a.open = c.open = false;
      [ai, i].forEach(k => { const e = $('#mc' + k); if (e) e.classList.remove('open'); });
      M.lock = false;
    }, 750);
  }
}
function memWin() {
  const M = MEM; M.over = true;
  const sec = Math.round((Date.now() - M.t0) / 1000), stars = memStars(M.moves);
  const gold = Math.max(1000, Math.round(totalIncome() * 300)) * stars, gems = stars * 2;
  earn(gold); earn(gems, 'gems');
  statAdd('memWin', 1);
  const d = memDay();
  const best = S.mem.best;
  const rec = !best || M.moves < best.moves || (M.moves === best.moves && sec < best.sec);
  if (rec) S.mem.best = { moves: M.moves, sec };
  save(); updateHud();
  sfx(stars === 3 ? 'win' : 'yay');
  const m = $('#memMsg');
  if (m) m.innerHTML = `<span class="mem-win">🎉 다 찾았어요! ${'⭐'.repeat(stars)}<br>${M.moves}번 · ${sec}초${rec ? ' · 🏅 최고 기록!' : ''}<br>💰 ${shortNum(gold)} + 💎 ${gems}</span>`;
  const row = document.querySelector('#modalBox .mem-panel .row');
  if (row) row.innerHTML = `<button class="btn green" data-act="memAgain">🃏 한 판 더${d.plays >= MEM_FREE ? ` (💎 ${MEM_COST})` : ` (무료 ${MEM_FREE - d.plays}판)`}</button><button class="btn ghost small" data-act="memClose">닫기</button>`;
}

// ===================== 🎮 미니게임 모음 (20가지) =====================
// 새 게임 12개는 게임마다 하루 3판 무료, 그다음엔 💎3. ⭐(0~3)만큼 💰골드와 💎를 받는다
const MG_FREE = 3, MG_COST = 3;
const MG_LIST = [
  { id: 'fish',    e: '🎣', name: '낚시',         sub: '바늘이 초록 칸에 올 때 낚아채기', old: true, open: () => openFishing() },
  { id: 'race',    e: '🏁', name: '몬스터 경주',   sub: '1등할 몬스터 맞히기',            old: true, open: () => openRace() },
  { id: 'wheel',   e: '🎡', name: '행운의 룰렛',   sub: '빙글빙글 돌려서 선물 받기',       old: true, open: () => openWheel() },
  { id: 'memory',  e: '🃏', name: '짝 맞추기',     sub: '같은 몬스터 카드 두 장 찾기',     old: true, open: () => openMemory() },
  { id: 'whack',   e: '🔨', name: '두더지 잡기',   sub: '튀어나온 몬스터를 콕! (💣은 조심)' },
  { id: 'react',   e: '⚡', name: '반응 속도',     sub: '초록불이 켜지면 바로 누르기' },
  { id: 'numbers', e: '🔢', name: '숫자 순서',     sub: '1부터 16까지 순서대로 빨리' },
  { id: 'color',   e: '🎨', name: '색깔 맞추기',   sub: '글자 말고 글자 색깔을 골라요' },
  { id: 'simon',   e: '🧠', name: '순서 기억',     sub: '빛난 순서를 그대로 따라 하기' },
  { id: 'math',    e: '➕', name: '빠른 계산',     sub: '20초 동안 계산 문제 풀기' },
  { id: 'balloon', e: '🎈', name: '풍선 터뜨리기', sub: '날아오르는 풍선을 콕콕' },
  { id: 'rps',     e: '✊', name: '가위바위보',    sub: '몬스터와 3판 먼저 이기기' },
  { id: 'odd',     e: '🔍', name: '다른 그림 찾기', sub: '하나만 다른 그림 찾기' },
  { id: 'hilo',    e: '🎲', name: '높을까 낮을까', sub: '다음 숫자가 높을지 낮을지' },
  { id: 'quiz',    e: '📘', name: '속성 퀴즈',     sub: '어느 속성이 더 강할까?' },
  { id: 'boxes',   e: '🎁', name: '보물 상자',     sub: '💣을 피해 상자 열기 (그만둘 수도!)' },
  { id: 'm2048',   e: '🧩', name: '몬스터 2048',   sub: '같은 몬스터를 밀어서 합치기' },
  { id: 'flappy',  e: '🐤', name: '날아라 몬스터', sub: '눌러서 날아 기둥 사이 통과' },
  { id: 'stack',   e: '🧱', name: '탑 쌓기',       sub: '딱 맞게 내려놓아 높이 쌓기' },
  { id: 'snake',   e: '🐍', name: '먹보 몬스터',   sub: '🍖을 먹으면 길어져요' },
];
const mgDef = (id) => MG_LIST.find(g => g.id === id);
const mgDay = () => (S.mg && S.mg.day === dayKey() ? S.mg : (S.mg = { day: dayKey(), n: {} }));
const mgFreeLeft = (id) => Math.max(0, MG_FREE - (mgDay().n[id] || 0));
// 예전 게임들도 "오늘 무료가 남았나" 표시
function mgOldReady(id) {
  if (id === 'fish') return fishBait() > 0;
  if (id === 'race') return raceFreeOk();
  if (id === 'wheel') return !wheelDay().free;
  if (id === 'memory') return memDay().plays < MEM_FREE;
  return false;
}
const mgReady = (g) => (g.old ? mgOldReady(g.id) : mgFreeLeft(g.id) > 0);
const mgAnyReady = () => MG_LIST.some(mgReady);
let MG = null;   // 지금 하는 게임 { id, timers: [], ... }
function mgStop() { if (MG) { (MG.timers || []).forEach(t => { clearInterval(t); clearTimeout(t); }); MG.over = true; } MG = null; }
const mgT = (fn, ms) => { const t = setTimeout(fn, ms); if (MG) MG.timers.push(t); return t; };
const mgI = (fn, ms) => { const t = setInterval(fn, ms); if (MG) MG.timers.push(t); return t; };
function openGames() {
  tutFlag('games', true);
  mgStop();
  showModal(`<div class="mg-hub"><h3>🎮 미니게임</h3>
    <p class="muted">20가지 미니게임! 새 게임은 하루 3판씩 무료예요. <span class="mg-dot-demo">●</span> = 오늘 무료로 할 수 있어요</p>
    <div class="mg-grid">${MG_LIST.map(g => `<button class="mg-card ${mgReady(g) ? 'ready' : ''}" data-act="mgOpen" data-id="${g.id}">
        <span class="mg-e">${g.e}</span><b>${g.name}</b><small>${g.sub}</small>
        ${g.old ? '' : `<i class="mg-free">${mgFreeLeft(g.id) ? `무료 ${mgFreeLeft(g.id)}` : `💎${MG_COST}`}</i>`}
        ${S.mgBest && S.mgBest[g.id] ? `<i class="mg-best">${'⭐'.repeat(S.mgBest[g.id].stars)}</i>` : ''}
      </button>`).join('')}</div>
    <div class="row"><button class="btn ghost small" data-act="close">닫기</button></div></div>`);
}
function mgOpen(id) {
  const g = mgDef(id);
  if (!g) return;
  mgStop();
  if (g.old) { g.open(); return; }
  const best = S.mgBest && S.mgBest[id];
  showModal(`<div class="mg-panel"><h3>${g.e} ${g.name}</h3>
    <div class="mg-intro"><span>${g.e}</span><p>${MG_HELP[id]}</p></div>
    ${best ? `<p class="muted">🏅 최고 기록: ${'⭐'.repeat(best.stars)} · ${best.text}</p>` : ''}
    <div class="row"><button class="btn big green" data-act="mgStart" data-id="${id}">${mgFreeLeft(id) ? `▶ 시작! (무료 ${mgFreeLeft(id)}판)` : S.mgTix ? `▶ 시작 (🎟️ 티켓 · ${S.mgTix}장)` : `▶ 시작 (💎 ${MG_COST})`}</button></div>
    <div class="row"><button class="btn ghost small" data-act="games">← 미니게임 목록</button></div></div>`);
}
const MG_HELP = {
  whack: '20초 동안 구멍에서 튀어나오는 <b>몬스터</b>를 눌러요! <b>💣</b>을 누르면 점수가 줄어요.<br>15점 이상 ⭐⭐⭐',
  react: '빨간불이 <b>초록불</b>로 바뀌면 바로 눌러요! 3번 해서 평균을 재요. 너무 빨리 누르면 벌점!<br>평균 0.35초 이하 ⭐⭐⭐',
  numbers: '1부터 16까지 <b>순서대로</b> 빨리 눌러요. 틀리면 1초 벌점!<br>15초 안에 끝내면 ⭐⭐⭐',
  color: '글자가 뜻하는 색이 아니라 <b>글자의 색깔</b>을 골라요! (예: 파란색으로 쓴 "빨강" → 파랑)<br>20초 동안 14점 이상 ⭐⭐⭐',
  simon: '속성 버튼이 빛나는 <b>순서</b>를 잘 보고 그대로 눌러요. 맞히면 하나씩 길어져요!<br>8개까지 성공하면 ⭐⭐⭐',
  math: '20초 동안 계산 문제를 풀어요. 답을 3개 중에서 골라요!<br>12문제 이상 ⭐⭐⭐',
  balloon: '20초 동안 날아오르는 <b>🎈 풍선</b>을 터뜨려요! <b>🎁</b>는 3점!<br>20점 이상 ⭐⭐⭐',
  rps: '몬스터와 <b>가위바위보</b>! 3판을 먼저 이기면 승리.<br>3:0으로 이기면 ⭐⭐⭐',
  odd: '똑같은 그림들 사이에서 <b>하나만 다른 그림</b>을 찾아요. 점점 많아져요! 25초 동안 도전.<br>12개 이상 ⭐⭐⭐',
  hilo: '다음 숫자가 지금보다 <b>높을지 낮을지</b> 맞혀요. 틀리면 끝!<br>7번 연속 맞히면 ⭐⭐⭐',
  quiz: '<b>속성 상성</b> 문제 8개! "이 속성은 무엇에게 강할까?"<br>7개 이상 맞히면 ⭐⭐⭐',
  m2048: '<b>⬆️⬇️⬅️➡️</b> (화살표 키 · 밀기 · 버튼)으로 판을 밀어요. 같은 몬스터끼리 부딪히면 <b>합쳐져서 진화</b>해요! 🥚→🐣→🐥→🐤→🐔→🦃→🦅→🐲…<br>🦅(128)까지 만들면 ⭐⭐⭐ · 언제든 🏁 끝내고 받기',
  flappy: '화면을 누르거나 <b>스페이스</b>를 누르면 몬스터가 날아올라요. 초록 기둥 사이를 지나가요! 부딪히면 끝.<br>15개 통과하면 ⭐⭐⭐',
  stack: '왔다 갔다 하는 블록을 <b>딱 맞게</b> 내려놓아요 (화면 · 스페이스). 삐져나온 부분은 잘려요! 완전히 빗나가면 끝.<br>15층 쌓으면 ⭐⭐⭐',
  snake: '<b>⬆️⬇️⬅️➡️</b> (화살표 키 · 밀기 · 버튼)으로 몬스터를 움직여 <b>🍖</b>을 먹어요. 먹을수록 길어지고 빨라져요! 벽이나 내 몸에 닿으면 끝.<br>🍖 15개 먹으면 ⭐⭐⭐',
  boxes: '상자 3개 중 하나에는 <b>💣</b>이 있어요. 보물을 찾을수록 보상이 커지지만, 💣을 열면 다 잃어요!<br>언제든 <b>그만</b>하고 받을 수 있어요. 5단계까지 가면 ⭐⭐⭐',
};
function mgStart(id) {
  const g = mgDef(id);
  if (!g || g.old) return;
  const d = mgDay();
  if (mgFreeLeft(id) <= 0) {
    if ((S.mgTix || 0) > 0) { S.mgTix--; toast(`🎟️ 티켓을 썼어요 (${S.mgTix}장 남음)`); }
    else if (!spend(MG_COST, 'gems')) return;
  }
  d.n[id] = (d.n[id] || 0) + 1;
  if (['m2048', 'flappy', 'stack', 'snake'].includes(id)) tutFlag('newMg', true);
  save(); updateHud();
  mgStop();
  MG = { id, timers: [], over: false, score: 0 };
  sfx('breed');
  MG_GAMES[id]();
}
// 공통 틀: 위쪽 정보줄 · 가운데 놀이판 · 아래 메시지
function mgShell(id, stat, body) {
  const g = mgDef(id);
  showModal(`<div class="mg-panel mg-${id}"><h3>${g.e} ${g.name}</h3>
    <div class="mg-stat" id="mgStat">${stat}</div>
    <div class="mg-body" id="mgBody">${body}</div>
    <div class="mg-msg" id="mgMsg"></div>
    <div class="row" id="mgBtns"><button class="btn ghost small" data-act="mgQuit">그만하기</button></div></div>`);
}
const mgSet = (sel, html) => { const e = $(sel); if (e) e.innerHTML = html; };
// 끝: ⭐ 수만큼 보상
function mgFinish(stars, text) {
  if (!MG || MG.over) return;
  const id = MG.id, g = mgDef(id);
  (MG.timers || []).forEach(t => { clearInterval(t); clearTimeout(t); });
  MG.over = true;
  const unit = Math.max(500, Math.round(totalIncome() * 150));
  const gold = stars ? unit * stars : Math.round(unit / 4), gems = stars;
  earn(gold); if (gems) earn(gems, 'gems');
  statAdd('mgPlay', 1);
  S.mgBest = S.mgBest || {};
  const best = S.mgBest[id];
  const rec = !best || stars > best.stars;
  if (rec) S.mgBest[id] = { stars, text };
  save(); updateHud();
  sfx(stars >= 3 ? 'win' : stars ? 'yay' : 'lose');
  mgSet('#mgMsg', `<span class="mg-result">${stars ? '🎉' : '😢'} ${text}<br>${stars ? '⭐'.repeat(stars) : '⭐ 0'}${rec && stars ? ' · 🏅 최고 기록!' : ''}<br>💰 ${shortNum(gold)}${gems ? ` + 💎 ${gems}` : ''}</span>`);
  mgSet('#mgBtns', `<button class="btn green" data-act="mgStart" data-id="${id}">${g.e} 한 판 더${mgFreeLeft(id) ? ` (무료 ${mgFreeLeft(id)})` : ` (💎 ${MG_COST})`}</button><button class="btn ghost small" data-act="games">← 목록</button>`);
}
const starsBy = (v, t3, t2, t1) => (v >= t3 ? 3 : v >= t2 ? 2 : v >= t1 ? 1 : 0);
const rndMonFace = () => CAT_LIST[Math.floor(Math.random() * CAT_LIST.length)].face;
// 남은 시간 막대
function mgTimer(sec, onEnd) {
  MG.left = sec;
  const draw = () => mgSet('#mgTime', `⏱️ ${MG.left}초`);
  draw();
  mgI(() => { if (!MG || MG.over) return; MG.left--; draw(); if (MG.left <= 0) onEnd(); }, 1000);
}

// 화살표 버튼 · 손가락으로 밀기
const mgPad = () => `<div class="mg-pad"><span></span><button class="btn small" data-act="mgHit" data-dir="up">⬆️</button><span></span><button class="btn small" data-act="mgHit" data-dir="left">⬅️</button><button class="btn small" data-act="mgHit" data-dir="down">⬇️</button><button class="btn small" data-act="mgHit" data-dir="right">➡️</button></div>`;
function mgSwipe(el, fn) {
  if (!el) return;
  let sx = 0, sy = 0;
  el.addEventListener('touchstart', (e) => { const t = e.touches[0]; sx = t.clientX; sy = t.clientY; }, { passive: true });
  el.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
  el.addEventListener('touchend', (e) => {
    const t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    fn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
  });
}
const MG_ARROW = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right' };
// 게임 중 키보드 (화살표 · 스페이스)
document.addEventListener('keydown', (e) => {
  if (!MG || MG.over || !MG.key || $('#modal').classList.contains('hidden') || e.isComposing) return;
  if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
  if (MG.key(e.key)) e.preventDefault();
});
const MG_GAMES = {
  // 🧩 몬스터 2048
  m2048() {
    const LV = ['', '🥚', '🐣', '🐥', '🐤', '🐔', '🦃', '🦅', '🐲', '🐉', '🌟', '👑'];
    const face = (v) => LV[Math.min(v, 11)];
    mgShell('m2048', `<span>🏅 <b id="mgBest"></b></span><span>점수 <b id="mgScore">0</b></span>`, `<div class="g48" id="g48"></div>${mgPad()}`);
    const M = MG;
    M.g = Array(16).fill(0);
    const add = () => { const f = M.g.map((v, i) => (v ? -1 : i)).filter(i => i >= 0); if (f.length) M.g[f[Math.floor(Math.random() * f.length)]] = Math.random() < 0.9 ? 1 : 2; };
    const draw = () => {
      mgSet('#g48', M.g.map(v => `<div class="g48-c l${Math.min(v, 11)}">${v ? `<span>${face(v)}</span><small>${Math.pow(2, v)}</small>` : ''}</div>`).join(''));
      mgSet('#mgScore', M.score); mgSet('#mgBest', face(Math.max(...M.g)));
    };
    const slide = (a0) => {
      const a = a0.filter(Boolean), out = [];
      for (let i = 0; i < a.length; i++) {
        if (a[i] === a[i + 1]) { out.push(a[i] + 1); M.score += Math.pow(2, a[i] + 1); i++; } else out.push(a[i]);
      }
      while (out.length < 4) out.push(0);
      return out;
    };
    const LINES = { left: k => [0, 1, 2, 3].map(c => k * 4 + c), right: k => [3, 2, 1, 0].map(c => k * 4 + c), up: k => [0, 1, 2, 3].map(r => r * 4 + k), down: k => [3, 2, 1, 0].map(r => r * 4 + k) };
    const canMove = () => M.g.some((v, i) => !v || (i % 4 < 3 && M.g[i + 1] === v) || (i < 12 && M.g[i + 4] === v));
    const end = () => { const top = Math.max(...M.g); mgFinish(starsBy(top, 7, 6, 5), `${face(top)} ${Math.pow(2, top)}까지 · ${M.score}점`); };
    M.move = (dir) => {
      if (M.over || !LINES[dir]) return;
      let moved = false;
      for (let k = 0; k < 4; k++) {
        const idx = LINES[dir](k), after = slide(idx.map(i => M.g[i]));
        idx.forEach((i, j) => { if (M.g[i] !== after[j]) moved = true; M.g[i] = after[j]; });
      }
      if (!moved) return;
      add(); draw(); sfx('tap');
      if (!canMove()) end();
    };
    M.hit = (d) => { if (d.end) end(); else M.move(d.dir); };
    M.key = (k) => { if (MG_ARROW[k]) { M.move(MG_ARROW[k]); return true; } };
    mgSwipe($('#g48'), M.move);
    add(); add(); draw();
    mgSet('#mgBtns', '<button class="btn green small" data-act="mgHit" data-end="1">🏁 끝내고 받기</button><button class="btn ghost small" data-act="mgQuit">그만하기</button>');
  },
  // 🐤 날아라 몬스터
  flappy() {
    mgShell('flappy', `<span>🚩 <b id="mgScore">0</b></span><span class="muted">화면 · 스페이스 = 날기</span>`, `<canvas id="fpC" class="mg-cv" width="300" height="400"></canvas>`);
    const M = MG, cv = $('#fpC'), c = cv.getContext('2d'), face = rndMonFace();
    Object.assign(M, { y: 200, v: 0, pipes: [], t: 70, started: false });
    const draw = () => {
      const g = c.createLinearGradient(0, 0, 0, 400); g.addColorStop(0, '#7ec8ff'); g.addColorStop(1, '#e3f6ff');
      c.fillStyle = g; c.fillRect(0, 0, 300, 400);
      M.pipes.forEach(p => {
        c.fillStyle = '#3cb371'; c.fillRect(p.x, 0, 50, p.top); c.fillRect(p.x, p.top + p.gap, 50, 400 - p.top - p.gap);
        c.fillStyle = '#2e8b57'; c.fillRect(p.x - 4, p.top - 14, 58, 14); c.fillRect(p.x - 4, p.top + p.gap, 58, 14);
      });
      c.font = '30px serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.save(); c.translate(60, M.y); c.rotate(Math.max(-0.5, Math.min(0.8, M.v / 10))); c.fillText(face, 0, 0); c.restore();
      if (!M.started) { c.fillStyle = '#123'; c.font = 'bold 18px sans-serif'; c.fillText('눌러서 시작!', 150, 300); }
    };
    const die = () => { draw(); mgFinish(starsBy(M.score, 15, 8, 3), `${M.score}개 통과`); };
    M.flap = () => { if (M.over) return; M.started = true; M.v = -6.2; };
    let last = performance.now();
    const step = (now) => {
      if (MG !== M || M.over || !document.body.contains(cv)) return;
      const dt = Math.min(2, (now - last) / 16.67); last = now;
      if (M.started) {
        M.v += 0.36 * dt; M.y += M.v * dt; M.t += dt;
        if (M.t > 95) { M.t = 0; const gap = Math.max(105, 140 - M.score * 2); M.pipes.push({ x: 300, top: 40 + Math.random() * (400 - gap - 80), gap, passed: false }); }
        for (const p of M.pipes) {
          p.x -= 2.3 * dt;
          if (!p.passed && p.x + 50 < 60) { p.passed = true; M.score++; mgSet('#mgScore', M.score); sfx('coin'); }
          if (p.x < 60 + 13 && p.x + 50 > 60 - 13 && (M.y - 12 < p.top || M.y + 12 > p.top + p.gap)) return die();
        }
        M.pipes = M.pipes.filter(p => p.x > -60);
        if (M.y > 400 - 12 || M.y < -20) return die();
      }
      draw();
      nextFrame(step);
    };
    cv.addEventListener('pointerdown', (e) => { e.preventDefault(); M.flap(); });
    M.key = (k) => { if (k === ' ' || k === 'ArrowUp' || k === 'Enter') { M.flap(); return true; } };
    draw(); nextFrame(step);
  },
  // 🧱 탑 쌓기
  stack() {
    mgShell('stack', `<span>🧱 <b id="mgScore">0</b></span><span class="muted">화면 · 스페이스 = 내려놓기</span>`, `<canvas id="stC" class="mg-cv" width="280" height="380"></canvas>`);
    const M = MG, cv = $('#stC'), c = cv.getContext('2d'), W = 280, H = 22, face = rndMonFace();
    M.blocks = [{ x: 70, w: 140 }];
    M.cur = { x: 0, w: 140, dir: 1 };
    M.speed = 2;
    const draw = () => {
      c.fillStyle = '#1b2240'; c.fillRect(0, 0, W, 380);
      const n = M.blocks.length + (M.cur ? 1 : 0), off = Math.max(0, n * H - 300);
      const yOf = (i) => 380 - (i + 1) * H + off;
      M.blocks.forEach((b, i) => { c.fillStyle = `hsl(${(i * 23) % 360} 70% 60%)`; c.fillRect(b.x, yOf(i), b.w, H - 2); });
      if (M.cur) {
        const i = M.blocks.length;
        c.fillStyle = `hsl(${(i * 23) % 360} 80% 65%)`; c.fillRect(M.cur.x, yOf(i), M.cur.w, H - 2);
        c.font = '18px serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(face, M.cur.x + M.cur.w / 2, yOf(i) + H / 2 - 1);
      }
    };
    M.drop = () => {
      if (M.over || !M.cur) return;
      const top = M.blocks[M.blocks.length - 1], cur = M.cur;
      const l = Math.max(top.x, cur.x), r = Math.min(top.x + top.w, cur.x + cur.w);
      if (r <= l) { M.cur = null; draw(); sfx('err'); mgFinish(starsBy(M.score, 15, 10, 5), `${M.score}층`); return; }
      const perfect = Math.abs(cur.x - top.x) < 5;
      const nb = perfect ? { x: top.x, w: top.w } : { x: l, w: r - l };
      M.blocks.push(nb);
      M.score++; mgSet('#mgScore', M.score); sfx(perfect ? 'yay' : 'coin');
      mgSet('#mgMsg', perfect ? '✨ 딱 맞았어요!' : '');
      M.speed = Math.min(6, 2 + M.score * 0.22);
      M.cur = { x: M.score % 2 ? W - nb.w : 0, w: nb.w, dir: M.score % 2 ? -1 : 1 };
    };
    let last = performance.now();
    const step = (now) => {
      if (MG !== M || M.over || !document.body.contains(cv)) return;
      const dt = Math.min(2, (now - last) / 16.67); last = now;
      const cur = M.cur;
      if (cur) {
        cur.x += cur.dir * M.speed * dt;
        if (cur.x <= 0) { cur.x = 0; cur.dir = 1; }
        if (cur.x + cur.w >= W) { cur.x = W - cur.w; cur.dir = -1; }
      }
      draw();
      nextFrame(step);
    };
    cv.addEventListener('pointerdown', (e) => { e.preventDefault(); M.drop(); });
    M.key = (k) => { if (k === ' ' || k === 'Enter' || k === 'ArrowDown') { M.drop(); return true; } };
    draw(); nextFrame(step);
  },
  // 🐍 먹보 몬스터
  snake() {
    const N = 12, CL = 24;
    mgShell('snake', `<span>먹은 🍖 <b id="mgScore">0</b></span>`, `<canvas id="snC" class="mg-cv" width="${N * CL}" height="${N * CL}"></canvas>${mgPad()}`);
    const M = MG, cv = $('#snC'), c = cv.getContext('2d'), face = rndMonFace();
    M.body = [{ x: 5, y: 6 }, { x: 4, y: 6 }, { x: 3, y: 6 }];
    M.dir = { x: 1, y: 0 }; M.nd = null;
    const newFood = () => { let f; do { f = { x: Math.floor(Math.random() * N), y: Math.floor(Math.random() * N) }; } while (M.body.some(b => b.x === f.x && b.y === f.y)); M.food = f; };
    newFood();
    const draw = () => {
      c.fillStyle = '#20402a'; c.fillRect(0, 0, N * CL, N * CL);
      c.fillStyle = '#25492f';
      for (let y = 0; y < N; y++) for (let x = (y % 2); x < N; x += 2) c.fillRect(x * CL, y * CL, CL, CL);
      c.font = '18px serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('🍖', M.food.x * CL + CL / 2, M.food.y * CL + CL / 2);
      M.body.forEach((b, i) => {
        if (i === 0) { c.font = '20px serif'; c.fillText(face, b.x * CL + CL / 2, b.y * CL + CL / 2); return; }
        c.fillStyle = `hsl(${100 + i * 6} 70% ${60 - Math.min(25, i)}%)`;
        c.beginPath(); c.arc(b.x * CL + CL / 2, b.y * CL + CL / 2, CL / 2 - 3, 0, Math.PI * 2); c.fill();
      });
    };
    const V = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
    M.turn = (d) => { const v = V[d]; if (!v || (v.x === -M.dir.x && v.y === -M.dir.y)) return; M.nd = v; };
    const tick = () => {
      if (MG !== M || M.over) return;
      if (M.nd) { M.dir = M.nd; M.nd = null; }
      const h = { x: M.body[0].x + M.dir.x, y: M.body[0].y + M.dir.y };
      const eat = h.x === M.food.x && h.y === M.food.y;
      const bodyHit = M.body.slice(0, eat ? M.body.length : M.body.length - 1).some(b => b.x === h.x && b.y === h.y);
      if (h.x < 0 || h.y < 0 || h.x >= N || h.y >= N || bodyHit) { sfx('err'); mgFinish(starsBy(M.score, 15, 10, 5), `🍖 ${M.score}개`); return; }
      M.body.unshift(h);
      if (eat) { M.score++; mgSet('#mgScore', M.score); sfx('coin'); newFood(); } else M.body.pop();
      draw();
      mgT(tick, Math.max(85, 190 - M.score * 6));
    };
    draw();
    mgSet('#mgMsg', '방향을 누르면 출발해요!');
    M.started = false;
    const go = () => { if (M.started) return; M.started = true; mgSet('#mgMsg', ''); mgT(tick, 300); };
    const t0 = M.turn; M.turn = (d) => { t0(d); go(); };
    M.hit = (d) => M.turn(d.dir);
    M.key = (k) => { if (MG_ARROW[k]) { M.turn(MG_ARROW[k]); return true; } };
    mgSwipe(cv, (d) => M.turn(d));
  },
  // 🔨 두더지 잡기
  whack() {
    mgShell('whack', `<span id="mgTime"></span><span>점수 <b id="mgScore">0</b></span>`,
      `<div class="wh-grid">${[...Array(9)].map((_, i) => `<button class="wh-hole" data-act="mgHit" data-i="${i}" id="wh${i}"></button>`).join('')}</div>`);
    MG.holes = Array(9).fill(null);
    const pop = () => {
      if (!MG || MG.over) return;
      const free = MG.holes.map((h, i) => (h ? -1 : i)).filter(i => i >= 0);
      if (!free.length) return;
      const i = free[Math.floor(Math.random() * free.length)];
      const bomb = Math.random() < 0.18;
      MG.holes[i] = { bomb, face: bomb ? '💣' : rndMonFace() };
      mgSet('#wh' + i, `<span class="wh-mon">${MG.holes[i].face}</span>`);
      mgT(() => { if (MG && MG.holes && MG.holes[i]) { MG.holes[i] = null; mgSet('#wh' + i, ''); } }, 800 + Math.random() * 400);
    };
    mgI(pop, 550);
    mgTimer(20, () => mgFinish(starsBy(MG.score, 15, 10, 5), `${MG.score}점`));
  },
  // ⚡ 반응 속도
  react() {
    mgShell('react', `<span>라운드 <b id="mgRound">1</b>/3</span><span id="mgAvg"></span>`, `<button class="rx-pad wait" id="rxPad" data-act="mgHit">준비…</button>`);
    MG.times = [];
    const round = () => {
      if (!MG || MG.over) return;
      MG.go = false; MG.goAt = 0;
      const p = $('#rxPad'); if (p) { p.className = 'rx-pad wait'; p.textContent = '🔴 기다려요…'; }
      mgT(() => { if (!MG || MG.over) return; MG.go = true; MG.goAt = performance.now(); const q = $('#rxPad'); if (q) { q.className = 'rx-pad go'; q.textContent = '🟢 지금!'; } }, 1000 + Math.random() * 2500);
    };
    MG.next = round;
    round();
  },
  // 🔢 숫자 순서
  numbers() {
    const nums = shuffle([...Array(16)].map((_, i) => i + 1));
    mgShell('numbers', `<span>다음: <b id="mgNext">1</b></span><span id="mgTime">⏱️ 0.0초</span>`,
      `<div class="nm-grid">${nums.map(n => `<button class="nm-cell" data-act="mgHit" data-n="${n}" id="nm${n}">${n}</button>`).join('')}</div>`);
    MG.need = 1; MG.t0 = performance.now(); MG.pen = 0;
    mgI(() => { if (MG && !MG.over) mgSet('#mgTime', `⏱️ ${((performance.now() - MG.t0) / 1000 + MG.pen).toFixed(1)}초`); }, 100);
  },
  // 🎨 색깔 맞추기
  color() {
    MG.cols = [['빨강', '#ff4d4d'], ['파랑', '#3da5ff'], ['초록', '#4cd964'], ['노랑', '#ffd93d']];
    mgShell('color', `<span id="mgTime"></span><span>점수 <b id="mgScore">0</b></span>`,
      `<div class="cl-word" id="clWord"></div><div class="cl-btns">${MG.cols.map((c, i) => `<button class="btn" data-act="mgHit" data-i="${i}" style="background:${c[1]};color:#111">${c[0]}</button>`).join('')}</div>`);
    MG.q = () => { MG.word = Math.floor(Math.random() * 4); do { MG.ink = Math.floor(Math.random() * 4); } while (MG.ink === MG.word && Math.random() < 0.8); mgSet('#clWord', `<span style="color:${MG.cols[MG.ink][1]}">${MG.cols[MG.word][0]}</span>`); };
    MG.q();
    mgTimer(20, () => mgFinish(starsBy(MG.score, 14, 9, 5), `${MG.score}점`));
  },
  // 🧠 순서 기억
  simon() {
    MG.keys = [['🔥', '#ff6b3d'], ['💧', '#3da5ff'], ['⚡', '#ffd93d'], ['🌿', '#4cd964']];
    mgShell('simon', `<span>길이 <b id="mgLen">3</b></span><span id="smState">잘 봐요!</span>`,
      `<div class="sm-grid">${MG.keys.map((k, i) => `<button class="sm-key" data-act="mgHit" data-i="${i}" id="sm${i}" style="--kc:${k[1]}">${k[0]}</button>`).join('')}</div>`);
    MG.seq = [0, 1, 2].map(() => Math.floor(Math.random() * 4));
    MG.best = 0;
    MG.show = () => {
      MG.input = false; MG.pos = 0;
      mgSet('#smState', '👀 잘 봐요!'); mgSet('#mgLen', MG.seq.length);
      MG.seq.forEach((k, n) => {
        mgT(() => { const e = $('#sm' + k); if (e) e.classList.add('lit'); sfx('tap'); }, 600 + n * 650);
        mgT(() => { const e = $('#sm' + k); if (e) e.classList.remove('lit'); }, 600 + n * 650 + 420);
      });
      mgT(() => { if (MG && !MG.over) { MG.input = true; mgSet('#smState', '👆 따라 눌러요!'); } }, 600 + MG.seq.length * 650);
    };
    MG.show();
  },
  // ➕ 빠른 계산
  math() {
    mgShell('math', `<span id="mgTime"></span><span>맞힘 <b id="mgScore">0</b></span>`, `<div class="mt-q" id="mtQ"></div><div class="mt-btns" id="mtBtns"></div>`);
    MG.q = () => {
      const op = ['+', '-', '×'][Math.floor(Math.random() * 3)];
      let a = 2 + Math.floor(Math.random() * 18), b = 2 + Math.floor(Math.random() * 12);
      if (op === '×') { a = 2 + Math.floor(Math.random() * 8); b = 2 + Math.floor(Math.random() * 8); }
      if (op === '-' && b > a) [a, b] = [b, a];
      MG.ans = op === '+' ? a + b : op === '-' ? a - b : a * b;
      const opts = new Set([MG.ans]);
      for (let k = 0; opts.size < 3 && k < 50; k++) { const v = MG.ans + (Math.floor(Math.random() * 9) - 4); if (v >= 0) opts.add(v); }
      while (opts.size < 3) opts.add(MG.ans + opts.size * 5);
      mgSet('#mtQ', `${a} ${op} ${b} = ?`);
      mgSet('#mtBtns', shuffle([...opts]).map(v => `<button class="btn" data-act="mgHit" data-v="${v}">${v}</button>`).join(''));
    };
    MG.q();
    mgTimer(20, () => mgFinish(starsBy(MG.score, 12, 8, 4), `${MG.score}문제`));
  },
  // 🎈 풍선 터뜨리기
  balloon() {
    mgShell('balloon', `<span id="mgTime"></span><span>점수 <b id="mgScore">0</b></span>`, `<div class="bl-sky" id="blSky"></div>`);
    MG.nb = 0;
    const spawn = () => {
      const sky = $('#blSky'); if (!sky || !MG || MG.over) return;
      const gift = Math.random() < 0.12, id = 'bl' + (MG.nb++);
      const b = document.createElement('button');
      b.className = 'bl-b'; b.id = id; b.dataset.act = 'mgHit'; b.dataset.g = gift ? '1' : '';
      b.textContent = gift ? '🎁' : '🎈';
      b.style.left = (5 + Math.random() * 80) + '%';
      b.style.animationDuration = (2.4 + Math.random() * 1.6) + 's';
      b.addEventListener('animationend', () => b.remove());
      sky.appendChild(b);
    };
    mgI(spawn, 450);
    mgTimer(20, () => mgFinish(starsBy(MG.score, 20, 13, 6), `${MG.score}점`));
  },
  // ✊ 가위바위보
  rps() {
    MG.foe = rndMonFace(); MG.me = 0; MG.them = 0;
    mgShell('rps', `<span>🙋 <b id="rpMe">0</b> : <b id="rpThem">0</b> ${MG.foe}</span>`,
      `<div class="rp-show" id="rpShow">${MG.foe} 덤벼라!</div><div class="rp-btns">${['✊', '✋', '✌️'].map((h, i) => `<button class="btn big" data-act="mgHit" data-i="${i}">${h}</button>`).join('')}</div>`);
  },
  // 🔍 다른 그림 찾기
  odd() {
    MG.pairs = [['🐶', '🐱'], ['🍎', '🍅'], ['😀', '😃'], ['🐟', '🐠'], ['🌕', '🌖'], ['🔵', '🟣'], ['🐸', '🐢'], ['🍩', '🍪'], ['⭐', '🌟'], ['🐻', '🐼'], ['🌲', '🌳'], ['🚗', '🚙']];
    mgShell('odd', `<span id="mgTime"></span><span>찾음 <b id="mgScore">0</b></span>`, `<div class="od-grid" id="odGrid"></div>`);
    MG.q = () => {
      const n = Math.min(7, 3 + Math.floor(MG.score / 2)), p = MG.pairs[Math.floor(Math.random() * MG.pairs.length)], sw = Math.random() < 0.5;
      const a = sw ? p[1] : p[0], b = sw ? p[0] : p[1];
      MG.odd = Math.floor(Math.random() * n * n);
      const g = $('#odGrid'); if (!g) return;
      g.style.gridTemplateColumns = `repeat(${n}, minmax(0, 1fr))`;
      g.innerHTML = [...Array(n * n)].map((_, i) => `<button class="od-c" data-act="mgHit" data-i="${i}">${i === MG.odd ? b : a}</button>`).join('');
    };
    MG.q();
    mgTimer(25, () => mgFinish(starsBy(MG.score, 12, 8, 4), `${MG.score}개 찾음`));
  },
  // 🎲 높을까 낮을까
  hilo() {
    MG.cur = 1 + Math.floor(Math.random() * 13); MG.streak = 0;
    mgShell('hilo', `<span>연속 <b id="mgScore">0</b>번</span>`,
      `<div class="hl-card" id="hlCard">${MG.cur}</div><div class="hl-btns"><button class="btn big" data-act="mgHit" data-h="1">⬆️ 높다</button><button class="btn big" data-act="mgHit" data-h="0">⬇️ 낮다</button></div>`);
    mgSet('#mgMsg', '1~13 중 하나가 나와요. 같은 숫자가 나오면 통과!');
  },
  // 📘 속성 퀴즈
  quiz() {
    MG.qn = 0; MG.score = 0;
    mgShell('quiz', `<span>문제 <b id="qzN">1</b>/8</span><span>맞힘 <b id="mgScore">0</b></span>`, `<div class="qz-q" id="qzQ"></div><div class="qz-btns" id="qzBtns"></div>`);
    MG.q = () => {
      const pool = EL.filter(e => BEATS[e.id] && BEATS[e.id].length);
      const e = pool[Math.floor(Math.random() * pool.length)];
      const right = BEATS[e.id][Math.floor(Math.random() * BEATS[e.id].length)];
      const wrong = shuffle(EL.filter(x => x.id !== e.id && !BEATS[e.id].includes(x.id))).slice(0, 2).map(x => x.id);
      MG.ans = right;
      mgSet('#qzN', MG.qn + 1);
      mgSet('#qzQ', `${e.emoji} <b>${e.name}</b> 속성은 누구에게 <b>강할까</b>?`);
      mgSet('#qzBtns', shuffle([right, ...wrong]).map(id => `<button class="btn" data-act="mgHit" data-e="${id}">${EL[ELI[id]].emoji} ${EL[ELI[id]].name}</button>`).join(''));
    };
    MG.q();
  },
  // 🎁 보물 상자
  boxes() {
    MG.lv = 0;
    mgShell('boxes', `<span>단계 <b id="bxLv">1</b>/5</span><span id="bxPot"></span>`, `<div class="bx-row" id="bxRow"></div>`);
    MG.q = () => {
      MG.bomb = Math.floor(Math.random() * 3);
      mgSet('#bxLv', MG.lv + 1); mgSet('#bxPot', MG.lv ? `모은 보물 ${'💰'.repeat(MG.lv)}` : '');
      mgSet('#bxRow', [0, 1, 2].map(i => `<button class="bx-box" data-act="mgHit" data-i="${i}">🎁</button>`).join(''));
      mgSet('#mgMsg', MG.lv ? '계속 열까요? 아니면 그만하고 받을까요?' : '💣이 없는 상자를 골라요!');
      if (MG.lv) mgSet('#mgBtns', '<button class="btn green" data-act="mgCash">💰 그만하고 받기</button>');
    };
    MG.q();
  },
};
// 눌렀을 때 (게임마다)
function mgHit(d, el) {
  const M = MG;
  if (!M || M.over) return;
  const id = M.id;
  if (M.hit) { M.hit(d, el); return; }
  if (id === 'whack') {
    const i = Number(d.i), h = M.holes[i];
    if (!h) return;
    M.holes[i] = null;
    M.score += h.bomb ? -2 : 1;
    M.score = Math.max(0, M.score);
    mgSet('#wh' + i, `<span class="wh-hit">${h.bomb ? '💥' : '✨'}</span>`);
    mgT(() => { if (MG && MG.holes && !MG.holes[i]) mgSet('#wh' + i, ''); }, 250);
    mgSet('#mgScore', M.score); sfx(h.bomb ? 'err' : 'coin');
  } else if (id === 'react') {
    const p = $('#rxPad');
    if (!M.go) {   // 너무 빨리
      M.times.push(1000);
      mgSet('#mgMsg', '😵 너무 빨랐어요! (1초 벌점)'); sfx('err');
    } else {
      const ms = Math.round(performance.now() - M.goAt);
      M.times.push(ms);
      mgSet('#mgMsg', `⚡ ${ms}ms!`); sfx('coin');
    }
    M.go = false;
    if (p) { p.className = 'rx-pad wait'; p.textContent = '…'; }
    (M.timers || []).forEach(t => clearTimeout(t)); M.timers = [];
    const avg = Math.round(M.times.reduce((s, x) => s + x, 0) / M.times.length);
    mgSet('#mgAvg', `평균 ${avg}ms`);
    if (M.times.length >= 3) { mgFinish(avg <= 350 ? 3 : avg <= 500 ? 2 : avg <= 800 ? 1 : 0, `평균 ${avg}ms`); return; }
    mgSet('#mgRound', M.times.length + 1);
    mgT(() => M.next(), 900);
  } else if (id === 'numbers') {
    const n = Number(d.n);
    if (n !== M.need) { M.pen += 1; mgSet('#mgMsg', '❌ 1초 벌점!'); sfx('err'); return; }
    const e = $('#nm' + n); if (e) e.classList.add('done');
    M.need++; mgSet('#mgNext', Math.min(16, M.need)); mgSet('#mgMsg', '');
    if (M.need > 16) { const sec = (performance.now() - M.t0) / 1000 + M.pen; mgFinish(sec <= 15 ? 3 : sec <= 25 ? 2 : 1, `${sec.toFixed(1)}초`); }
  } else if (id === 'color') {
    const ok = Number(d.i) === M.ink;
    M.score = Math.max(0, M.score + (ok ? 1 : -1));
    mgSet('#mgScore', M.score); mgSet('#mgMsg', ok ? '⭕' : '❌'); sfx(ok ? 'coin' : 'err');
    M.q();
  } else if (id === 'simon') {
    if (!M.input) return;
    const i = Number(d.i), e = $('#sm' + i);
    if (e) { e.classList.add('lit'); setTimeout(() => e.classList.remove('lit'), 180); }
    if (i !== M.seq[M.pos]) { mgFinish(starsBy(M.best, 8, 6, 4), `${M.best}개까지 성공`); return; }
    M.pos++; sfx('tap');
    if (M.pos >= M.seq.length) {
      M.best = M.seq.length; M.input = false;
      mgSet('#smState', '⭕ 성공!'); sfx('coin');
      if (M.seq.length >= 12) { mgFinish(3, `${M.best}개까지 성공`); return; }
      M.seq.push(Math.floor(Math.random() * 4));
      mgT(() => M.show(), 700);
    }
  } else if (id === 'math') {
    const ok = Number(d.v) === M.ans;
    if (ok) M.score++;
    mgSet('#mgScore', M.score); mgSet('#mgMsg', ok ? '⭕' : `❌ 답은 ${M.ans}`); sfx(ok ? 'coin' : 'err');
    M.q();
  } else if (id === 'balloon') {
    const b = el;
    if (!b || b.classList.contains('pop')) return;
    M.score += d.g ? 3 : 1;
    b.classList.add('pop'); b.textContent = '💥';
    setTimeout(() => b.remove(), 200);
    mgSet('#mgScore', M.score); sfx('coin');
  } else if (id === 'rps') {
    const me = Number(d.i), foe = Math.floor(Math.random() * 3), H = ['✊', '✋', '✌️'];
    const r = (me - foe + 3) % 3;   // 1 = 내가 이김, 2 = 짐
    if (r === 1) M.me++; else if (r === 2) M.them++;
    mgSet('#rpMe', M.me); mgSet('#rpThem', M.them);
    mgSet('#rpShow', `${H[me]} vs ${H[foe]} ${M.foe}<br>${r === 0 ? '🤝 비겼어요' : r === 1 ? '🎉 이겼어요!' : '😝 졌어요'}`);
    sfx(r === 1 ? 'coin' : r === 2 ? 'err' : 'tap');
    if (M.me >= 3) mgFinish(M.them === 0 ? 3 : M.them === 1 ? 2 : 1, `${M.me} : ${M.them} 승리!`);
    else if (M.them >= 3) mgFinish(0, `${M.me} : ${M.them} 패배…`);
  } else if (id === 'odd') {
    if (Number(d.i) === M.odd) { M.score++; mgSet('#mgScore', M.score); sfx('coin'); M.q(); }
    else { M.left = Math.max(0, M.left - 2); mgSet('#mgMsg', '❌ 2초 줄었어요!'); sfx('err'); }
  } else if (id === 'hilo') {
    const nx = 1 + Math.floor(Math.random() * 13), hi = d.h === '1';
    const ok = nx === M.cur || (hi ? nx > M.cur : nx < M.cur);
    mgSet('#hlCard', `<span class="hl-old">${M.cur}</span> → ${nx}`);
    M.cur = nx;
    if (!ok) { mgFinish(starsBy(M.streak, 7, 5, 3), `${M.streak}번 연속`); return; }
    M.streak++; mgSet('#mgScore', M.streak); sfx('coin');
    if (M.streak >= 10) { mgFinish(3, `${M.streak}번 연속!`); return; }
    mgT(() => mgSet('#hlCard', M.cur), 700);
  } else if (id === 'quiz') {
    const ok = d.e === M.ans;
    if (ok) M.score++;
    mgSet('#mgScore', M.score);
    mgSet('#mgMsg', ok ? '⭕ 정답!' : `❌ 정답은 ${EL[ELI[M.ans]].emoji} ${EL[ELI[M.ans]].name}`); sfx(ok ? 'coin' : 'err');
    M.qn++;
    if (M.qn >= 8) { mgFinish(starsBy(M.score, 7, 5, 3), `${M.score}/8 정답`); return; }
    M.q();
  } else if (id === 'boxes') {
    const i = Number(d.i);
    const row = document.querySelectorAll('#bxRow .bx-box');
    row.forEach((b, k) => { b.textContent = k === M.bomb ? '💣' : '💰'; b.disabled = true; if (k === i) b.classList.add('picked'); });
    if (i === M.bomb) { sfx('lose'); mgT(() => mgFinish(0, `💥 ${M.lv + 1}단계에서 💣을 열었어요`), 700); return; }
    M.lv++; sfx('coin');
    if (M.lv >= 5) { mgT(() => mgFinish(3, '5단계 모두 통과!'), 600); return; }
    mgT(() => M.q(), 800);
  }
}
function mgCash() {
  const M = MG;
  if (!M || M.over || M.id !== 'boxes' || !M.lv) return;
  mgFinish(M.lv >= 3 ? 2 : 1, `${M.lv}단계에서 그만!`);
}

// ===================== 📅 오늘 할 일 =====================
// 매일 받을 수 있는 것들이 여기저기 흩어져 있어서 한곳에 모았다. 다 하면 보너스 💎
const TODO_BONUS = 10;
function todoList() {
  const L = [];
  L.push({ id: 'daily', e: '🎁', name: '일일 보상 받기', done: !dailyReady(), go: () => openDaily() });
  const m = misToday();
  L.push({ id: 'mis', e: '📋', name: '오늘의 미션 3개', prog: `${Math.min(3, m.got.length)}/3`, done: m.got.length >= 3, go: () => openMissions() });
  L.push({ id: 'wheel', e: '🎡', name: '무료 룰렛 돌리기', done: !!wheelDay().free, go: () => openWheel() });
  L.push({ id: 'race', e: '🏁', name: '경주 무료 응원권 쓰기', done: !raceFreeOk(), go: () => openRace() });
  const played = Object.values(mgDay().n).reduce((s, x) => s + x, 0);
  L.push({ id: 'games', e: '🎮', name: '미니게임 3판 하기', prog: `${Math.min(3, played)}/3`, done: played >= 3, go: () => openGames() });
  if (S.monsters.length) {
    const r = raidToday();
    L.push({ id: 'raid', e: '🔥', name: '오늘의 레이드 도전', prog: r.hp <= 0 ? '🏆' : `${RAID_TRIES - r.tries}/${RAID_TRIES}`, done: r.tries <= 0 || r.hp <= 0, go: () => { closeModal(); tab = 'adventure'; render(); } });
  }
  if (S.guild) {
    const w = gwarToday();
    L.push({ id: 'gwar', e: '⚔️', name: '길드전 공격', prog: `${GWAR_ATTACKS - w.left}/${GWAR_ATTACKS}`, done: w.left <= 0, go: () => openGuild('war') });
  }
  if ((S.friends || []).length) {
    const need = Math.min(3, S.friends.length), sent = frGiftToday().sent.length;
    L.push({ id: 'hearts', e: '💌', name: `친구에게 하트 ${need}개 보내기`, prog: `${Math.min(need, sent)}/${need}`, done: sent >= need, go: () => openFriends(true) });
  }
  if (dailyGemAmt() > 0) L.push({ id: 'kdgem', e: '💎', name: '오늘의 보석 받기 (상점 🏛️ 왕국)', done: S.kdGemDay === dayKey(), go: () => { closeModal(); goShop('shopKingdom'); } });
  return L;
}
const todoLeft = () => { try { return todoList().filter(t => !t.done).length; } catch (e) { return 0; } };
function openTodo() {
  tutFlag('todo', true);
  const L = todoList(), left = L.filter(t => !t.done).length, got = S.todoBonus === dayKey();
  showModal(`<div class="todo-panel"><h3>📅 오늘 할 일</h3>
    <p class="muted">매일 받을 수 있는 것들을 모았어요. 다 하면 보너스 💎 ${TODO_BONUS}!</p>
    <div class="todo-list">${L.map(t => `<div class="todo-row ${t.done ? 'done' : ''}">
        <span class="td-e">${t.done ? '✅' : t.e}</span>
        <span class="td-name">${t.name}${t.prog ? ` <small>${t.prog}</small>` : ''}</span>
        ${t.done ? '<span class="td-ok">완료</span>' : `<button class="btn small green" data-act="todoGo" data-id="${t.id}">가기 →</button>`}
      </div>`).join('')}</div>
    <div class="todo-bonus">${got ? '🎉 오늘 보너스를 받았어요! 내일 또 만나요' : left ? `🎯 ${left}개 남았어요 · 다 하면 💎 ${TODO_BONUS}`
      : `<button class="btn big green" data-act="todoBonus">🎉 다 했어요! 💎 ${TODO_BONUS} 받기</button>`}</div>
    <div class="row"><button class="btn ghost small" data-act="close">닫기</button></div></div>`);
}
function todoGo(id) { const t = todoList().find(x => x.id === id); if (t) t.go(); }
function todoBonus() {
  if (S.todoBonus === dayKey() || todoLeft() > 0) return;
  S.todoBonus = dayKey();
  earn(TODO_BONUS, 'gems'); statAdd('todoAll', 1);
  sfx('win'); save(); updateHud();
  toast(`🎉 오늘 할 일 완료! 💎 ${TODO_BONUS}`);
  openTodo(); updateTodoBtn();
}
function updateTodoBtn() {
  const b = $('#todoBtn');
  if (!b) return;
  b.classList.toggle('hidden', tab !== 'island' || !!VISIT);
  const n = todoLeft(), bonus = !n && S.todoBonus !== dayKey();
  b.classList.toggle('ready', n > 0 || bonus);
  b.innerHTML = `📅<small>할 일</small>${n || bonus ? `<i class="todo-n">${bonus ? '🎁' : n}</i>` : ''}`;
}

// 섬 위를 돌아다니는 펫 (섬 가장자리를 천천히 한 바퀴)
function petWalkPos(t) {
  const a = t * 0.12;
  return { x: ISLAND.x + Math.cos(a) * 640, y: ISLAND.y + 20 + Math.sin(a) * 385, dir: -Math.sin(a) >= 0 ? -1 : 1 };
}

// ----- 💰💎🍖 재화 안내: 위쪽 숫자를 누르면 어디서 얻고 어디에 쓰는지 -----
const RES_INFO = {
  gold: { icon: '💰', name: '골드', get: ['🏠 서식지의 몬스터가 계속 벌어요 → 섬의 💰 말풍선을 누르거나 <b>모두 걷기</b>', '⚔️ 모험·길드전에서 이기기', '🎁 일일 보상, 📦 겹치는 몬스터 팔기'],
    use: ['🏠 서식지·🌾 농장·🏔️ 교배산 짓기, 🥚 알, 🏔️ 교배 비용', '⬆️ 서식지 업그레이드, 🐾 펫 알·간식', '🏛️ <b>왕국 발전</b> (끝없이 강해지기), 🗽 <b>랜드마크</b> (모든 섬 골드 UP)'],
    btns: '<button class="btn green" data-act="collectAll">💰 모두 걷기</button><button class="btn" data-act="shopGo" data-id="shopKingdom">🏛️ 왕국 발전</button>' },
  gems: { icon: '💎', name: '보석', get: ['📋 매일 미션, 🏆 도전 과제', '🎁 일일 보상, ⚔️ 모험 5스테이지마다', '🛡️ 길드전 상자, 🏆 티어 승급'],
    use: ['🤖 자동 수집 로봇, ⚡ 골드 2배 부스터, 👑 전설 알 상자', '🌟 고급 펫 알, 🎁 고급 룬 상자', '⏩ 교배·농장 시간 바로 끝내기'],
    btns: '<button class="btn green" data-act="shopGo" data-id="shopGem">💎 보석 상점</button><button class="btn" data-act="missions">📋 미션</button>' },
  food: { icon: '🍖', name: '먹이', get: ['🌾 농장에 작물을 심고 수확 (오래 걸리는 작물일수록 효율이 좋아요)', '🛒 상점에서 사기, 🎁 일일 보상'],
    use: ['⬆️ 몬스터 레벨 올리기 → <b>Lv.4가 되면 교배</b>할 수 있어요', '레벨이 높을수록 골드를 더 벌고 전투에서 더 세져요'],
    btns: '<button class="btn green" data-act="resGo" data-to="mons">🐾 몬스터 키우기</button>' },
};
function unitTableHTML() {
  const kr = window.LANG === 'en' ? '' : `<div class="ut-kr"><button class="btn small ${S.krUnits ? 'green' : 'ghost'}" data-act="krUnits">🇰🇷 한국 단위로 보기 ${S.krUnits ? '켜짐' : '꺼짐'}</button>
    <p class="muted">켜면 숫자를 만 · 억 · 조 · 경…으로 보여 줘요 (1만 배마다 바뀌어요)</p>
    <div class="ut-grid">${KR_UNITS.map(([u, s], i) => `<span><b>${s}</b><small>10<sup>${4 * (i + 1)}</sup></small></span>`).join('')}</div></div>`;
  return `<details class="unit-table" ${UT_OPEN ? 'open' : ''}><summary>${window.LANG === 'en' ? `📏 돈 단위 보기 (K → Ce, ${NUM_UNITS.length}가지)` : `📏 돈 단위 보기 (K → Ce ${NUM_UNITS.length}가지 + 만 → 무량대수 ${KR_UNITS.length}가지)`}</summary>${kr}
    <p class="muted">1000배마다 단위가 바뀌어요. 예) 1K = 1,000 · 1M = 1,000K</p>
    <div class="ut-grid">${NUM_UNITS.slice().reverse().map(([u, s], i) => `<span><b>${s}</b><small>10<sup>${3 * (i + 1)}</sup></small></span>`).join('')}</div></details>`;
}
let UT_OPEN = false;
document.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.isComposing && e.target && e.target.id === 'allShopQ') { ALL_SHOP.q = e.target.value.trim().slice(0, 20); ALL_SHOP.page = 0; allShopRedraw(); } });
document.addEventListener('toggle', (e) => { if (e.target.classList && e.target.classList.contains('unit-table') && e.target.open) tutFlag('unitTable', true); }, true);
function openResInfo(r) {
  tutFlag('res', true);
  const x = RES_INFO[r];
  if (!x) return;
  const now = r === 'gold' ? S.gold : r === 'gems' ? S.gems : S.food;
  showModal(`<div class="res-info"><div class="ri-ico">${x.icon}</div>
    <h3>${x.name} <small class="muted">${S.infinite ? '무한' : fmt(now)}</small></h3>
    <h4>✅ 얻는 법</h4><ul>${x.get.map(t => `<li>${t}</li>`).join('')}</ul>
    <h4>🛍️ 쓰는 곳</h4><ul>${x.use.map(t => `<li>${t}</li>`).join('')}</ul>
    ${r === 'gold' ? unitTableHTML() : ''}
    <div class="row">${x.btns}<button class="btn ghost" data-act="close">닫기</button></div></div>`);
}
// ----- 🎯 다음 목표: 튜토리얼이 끝나면 섬 위쪽에 가장 가까운 목표를 보여 준다 -----
// ===================== 📜 퀘스트 =====================
// 스토리: 마법사 루나가 한 번에 하나씩 퀘스트를 준다 (6장 30개). 주간: 월요일마다 4개
const QNPC = { face: '🧙‍♀️', name: '마법사 루나' };
const stat = (k) => (S.stat && S.stat[k]) || 0;
const maxRank = () => Math.max(-1, ...S.monsters.map(m => RANK[CAT[m.type].rarity]));
const habCount = () => S.plots.filter(p => p && p.kind === 'hab').length;
// 보상 주기
function qReward(r) {
  const out = [];
  if (r.gold) { earn(r.gold); out.push('💰 ' + fmt(r.gold)); }
  if (r.gems) { earn(r.gems, 'gems'); out.push('💎 ' + r.gems); }
  if (r.food) { S.food += r.food; out.push('🍖 ' + fmt(r.food)); }
  if (r.rune) out.push('💠 ' + runeText(giveRune(r.rune === 2 ? [0, 0.6, 0.4] : [0.6, 0.35, 0.05])));
  if (r.petEgg) { setTimeout(() => petEgg('normal', true), 500); out.push('🥚 펫 알'); }
  if (r.legend) {
    const pool = CAT_LIST.filter(c => c.rarity === 'legendary' && !c.shop), c = pool[Math.floor(Math.random() * pool.length)];
    if (S.hatch.length < hatchCap()) { S.hatch.push(c.id); out.push('👑 ' + c.face + ' ' + c.name + ' 알'); } else { earn(250, 'gems'); out.push('💎 250 (부화장이 가득)'); }
  }
  return out.join(' · ');
}
const rText = (r) => [r.gold && '💰' + shortNum(r.gold), r.gems && '💎' + r.gems, r.food && '🍖' + shortNum(r.food), r.rune && (r.rune === 2 ? '🎁 고급 룬' : '📦 룬'), r.petEgg && '🥚 펫 알', r.legend && '👑 전설 알'].filter(Boolean).join(' ');
// 목표: now() = 지금 값 (count는 퀘스트를 받은 뒤부터 센다)
const QUESTS = [
  { ch: '1장 · 새로운 섬' },
  { text: '서식지를 2개 지어요', say: '이 섬은 너무 조용하네요… 몬스터들이 살 집부터 지어 볼까요?', now: habCount, need: 2, r: { gold: 1000 } },
  { text: '몬스터 5마리를 모아요', say: '집이 생겼으니 친구들을 불러 와요! 상점의 알을 깨 봐요.', now: () => S.monsters.length, need: 5, r: { gems: 5 } },
  { text: '교배를 3번 해요', count: 'breed', need: 3, say: '두 몬스터를 교배산에 넣으면 새로운 몬스터가 태어나요. 신기하죠?', r: { food: 500 } },
  { text: '도감을 10마리 채워요', say: '세상에는 20,000마리가 넘는 몬스터가 있대요. 하나씩 기록해 봐요!', now: () => Object.keys(S.dex).length, need: 10, r: { gems: 10 } },
  { text: '모험 스테이지 3에 가요', say: '섬 밖에는 야생 몬스터가 있어요. 우리 팀의 힘을 보여 줘요!', now: () => S.stage, need: 3, r: { gold: 3000, rune: 1 } },
  { ch: '2장 · 커져 가는 왕국' },
  { text: '서식지 하나를 Lv.3으로 올려요', say: '몬스터가 많아지면 집이 좁아져요. 서식지를 넓혀 줘요!', now: () => Math.max(0, ...S.plots.filter(p => p && p.kind === 'hab').map(p => p.lv)), need: 3, r: { gold: 5000 } },
  { text: '농장을 3개 가져요', say: '배고픈 몬스터가 많아요! 농장을 늘려서 먹이를 넉넉히 키워요.', now: () => S.plots.filter(p => p && p.kind === 'farm').length, need: 3, r: { food: 2000 } },
  { text: '희귀 등급 몬스터를 얻어요', say: '교배를 계속하면 더 좋은 등급이 나와요. 희귀 몬스터를 만나 봐요!', now: () => (maxRank() >= RANK.rare ? 1 : 0), need: 1, r: { gems: 15 } },
  { text: '골드를 5번 걷어요', count: 'collect', need: 5, say: '몬스터들이 열심히 번 골드예요. 잊지 말고 걷어 줘요!', r: { gold: 5000 } },
  { text: '도감을 25마리 채워요', say: '벌써 이렇게 많이 모았어요? 조금만 더 힘내요!', now: () => Object.keys(S.dex).length, need: 25, r: { gems: 20 } },
  { ch: '3장 · 모험가의 길' },
  { text: '모험 스테이지 8에 가요', say: '더 먼 곳에 강한 적이 있다는 소문이 있어요.', now: () => S.stage, need: 8, r: { gems: 20 } },
  { text: '보스를 1명 이겨요', say: '👹 보스가 나타났어요! 모험 탭의 보스전에서 물리쳐 줘요!', now: () => Object.keys(S.bossCleared || {}).length, need: 1, r: { gold: 20000 } },
  { text: '몬스터에게 룬을 끼워요', say: '룬을 끼우면 몬스터가 훨씬 강해져요. 몬스터를 눌러 룬을 장착해 봐요.', now: () => (S.monsters.some(m => (m.runes || []).some(x => x != null)) ? 1 : 0), need: 1, r: { rune: 2 } },
  { text: '교배를 15번 해요', count: 'breed', need: 15, say: '교배를 많이 할수록 좋은 몬스터를 만날 확률이 올라가요!', r: { gems: 20 } },
  { text: '서사 등급 몬스터를 얻어요', say: '서사 몬스터는 정말 강해요. 도감의 추천 교배를 써 봐요!', now: () => (maxRank() >= RANK.epic ? 1 : 0), need: 1, r: { gems: 30 } },
  { ch: '4장 · 전설을 찾아서' },
  { text: '도감을 60마리 채워요', say: '옛날 책에 전설의 몬스터 이야기가 있었어요… 더 많이 모아 봐요.', now: () => Object.keys(S.dex).length, need: 60, r: { gems: 30 } },
  { text: '전설 몬스터를 얻어요', say: '드디어 전설을 만날 시간! 족보대로 세 속성을 섞어 봐요.', now: () => (maxRank() >= RANK.legendary ? 1 : 0), need: 1, r: { gems: 50 } },
  { text: '펫을 3마리 모아요', say: '혼자 다니면 심심하죠? 🐾 펫 친구를 모아 봐요!', now: () => PETS.filter(p => petLv(p.id)).length, need: 3, r: { petEgg: 1 } },
  { text: '⭐ 별 합성을 1번 해요', say: '같은 몬스터 3마리를 합치면 별이 생겨요. 더 반짝이게!', now: () => S.fuseCount || 0, need: 1, r: { gold: 50000 } },
  { text: '🔮 합성 제단을 3번 써요', say: '남는 몬스터 5마리를 바치면 더 높은 등급이 나와요!', now: () => S.altarCount || 0, need: 3, r: { gems: 40 } },
  { ch: '5장 · 함께하는 세상' },
  { text: '길드에 들어가거나 만들어요', say: '다른 조련사들과 힘을 합치면 더 강해져요!', now: () => (S.guild ? 1 : 0), need: 1, r: { gems: 30 } },
  { text: '길드전 공격을 1번 해요', count: 'gwar', need: 1, say: '길드전이 시작됐어요! 상대 길드의 방어 팀을 공격해요!', r: { gold: 100000 } },
  { text: '모험 스테이지 15에 가요', say: '우리 팀이 이렇게 강해지다니! 더 멀리 가 봐요.', now: () => S.stage, need: 15, r: { gems: 40 } },
  { text: '🏛️ 왕국 발전 합계 Lv.5', say: '섬이 왕국이 되었어요! 왕국을 발전시켜 봐요.', now: () => KINGDOM.reduce((s, k) => s + kdLv(k.id), 0), need: 5, r: { gems: 50 } },
  { text: '🗽 랜드마크를 1개 세워요', say: '모두가 보러 올 멋진 건물을 세워 봐요!', now: () => DECOS.filter(d => d.wonder && S.plots.some(p => p && p.kind === 'deco' && p.id === d.id)).length, need: 1, r: { legend: 1 } },
  { ch: '6장 · 신화의 섬' },
  { text: '신화 몬스터를 얻어요', say: '전설보다 더 높은 존재, 신화… 전설끼리 교배해 봐요!', now: () => (maxRank() >= RANK.mythic ? 1 : 0), need: 1, r: { gems: 100 } },
  { text: '도감을 200마리 채워요', say: '당신은 이제 최고의 몬스터 박사예요!', now: () => Object.keys(S.dex).length, need: 200, r: { gems: 100 } },
  { text: '모험 스테이지 30에 가요', say: '세상 끝까지 모험을 떠나요!', now: () => S.stage, need: 30, r: { gems: 100 } },
  { text: '★3 몬스터를 만들어요', say: '별 세 개의 몬스터라니, 눈이 부셔요!', now: () => Math.max(0, ...S.monsters.map(m => m.star || 0)), need: 3, r: { gems: 100 } },
  { text: '초월 몬스터를 얻어요', say: '마지막 시험이에요. 신들의 세계, 초월 등급에 닿아 봐요!', now: () => (maxRank() >= RANK.divine ? 1 : 0), need: 1, r: { gems: 300, legend: 1 } },
];
const QLIST = QUESTS.filter(q => !q.ch);
const qChapter = (k) => { let ch = '', idx = -1; for (const q of QUESTS) { if (q.ch) ch = q.ch; else { idx++; if (idx === k) return ch; } } return ch; };
function qState() {
  S.quest = S.quest || { k: 0, base: {} };
  const q = QLIST[S.quest.k];
  // 횟수 퀘스트는 받았을 때부터 센다
  if (q && q.count && S.quest.base[S.quest.k] == null) S.quest.base[S.quest.k] = stat(q.count);
  return S.quest;
}
function qProg(k) {
  const q = QLIST[k], st = qState();
  if (!q) return 0;
  const v = q.count ? stat(q.count) - (st.base[k] || 0) : q.now();
  return Math.max(0, Math.min(q.need, v));
}
const qReady = () => { const st = qState(), q = QLIST[st.k]; return !!q && qProg(st.k) >= q.need; };
function qClaim() {
  const st = qState(), q = QLIST[st.k];
  if (!q || qProg(st.k) < q.need) return;
  const got = qReward(q.r);
  st.k++;
  qState();
  save(); updateHud(); sfx('yay');
  toast(`📜 퀘스트 완료! ${got}`);
  if (!QLIST[st.k]) toast('🎉 루나: 모든 이야기를 끝냈어요! 당신은 최고의 조련사예요!');
  else if (qChapter(st.k) !== qChapter(st.k - 1)) setTimeout(() => toast(`📖 새 이야기: ${qChapter(st.k)}`), 1200);
  openQuests('story');
}
// ----- 📆 주간 퀘스트 (월요일마다 새로) -----
const WEEKLY = [
  { id: 'breed',   text: '🏔️ 교배', need: 40 },
  { id: 'win',     text: '⚔️ 전투 이기기', need: 20 },
  { id: 'collect', text: '💰 골드 걷기', need: 50 },
  { id: 'hatch',   text: '🐣 몬스터 태어나게 하기', need: 25 },
  { id: 'harvest', text: '🌾 작물 수확', need: 20 },
  { id: 'feed',    text: '🍖 레벨 올리기', need: 60 },
];
const WEEK_REWARD = { gems: 25 }, WEEK_BONUS = { gems: 60, petEgg: 1 };
function weekKey() { const d = new Date(), wd = (d.getDay() + 6) % 7, m = new Date(d.getFullYear(), d.getMonth(), d.getDate() - wd); return `${m.getFullYear()}-${m.getMonth() + 1}-${m.getDate()}`; }
function weekState() {
  const k = weekKey();
  if (!S.week || S.week.key !== k) {
    const rnd = seeded('week' + k);
    const ids = WEEKLY.map(w => w.id).sort(() => rnd() - 0.5).slice(0, 4);
    S.week = { key: k, ids, base: Object.fromEntries(ids.map(id => [id, stat(id)])), got: [], bonus: false };
  }
  return S.week;
}
const wProg = (id) => { const w = weekState(), def = WEEKLY.find(x => x.id === id); return Math.min(def.need, stat(id) - (w.base[id] || 0)); };
function weekClaim(id) {
  const w = weekState(), def = WEEKLY.find(x => x.id === id);
  if (!def || w.got.includes(id) || wProg(id) < def.need) return;
  w.got.push(id);
  const got = qReward(WEEK_REWARD);
  save(); updateHud(); sfx('coin'); toast('📆 주간 퀘스트 완료! ' + got);
  openQuests('week');
}
function weekBonus() {
  const w = weekState();
  if (w.bonus || w.got.length < w.ids.length) return;
  w.bonus = true;
  const got = qReward(WEEK_BONUS);
  save(); updateHud(); sfx('yay'); toast('🎉 이번 주 퀘스트 모두 완료! ' + got);
  openQuests('week');
}
const weekReady = () => { const w = weekState(); return w.ids.some(id => !w.got.includes(id) && wProg(id) >= WEEKLY.find(x => x.id === id).need) || (!w.bonus && w.got.length >= w.ids.length); };
function updateQuestBtn() {
  const b = $('#questBtn');
  if (!b) return;
  b.classList.toggle('hidden', tab !== 'island' || !!VISIT);
  b.classList.toggle('ready', qReady() || weekReady());
}
let questTab = 'story';
function openQuests(t) {
  tutFlag('quest', true);
  if (t) questTab = t;
  const st = qState(), q = QLIST[st.k];
  let body = '';
  if (questTab === 'story') {
    if (!q) body = `<div class="q-npc"><span class="q-face">${QNPC.face}</span><div class="q-say"><b>${QNPC.name}</b>모든 이야기를 끝냈어요! 당신은 이 세상 최고의 몬스터 조련사예요. 고마워요! 💖</div></div>`;
    else {
      const p = qProg(st.k), ok = p >= q.need;
      const chIdx = QUESTS.filter(x => x.ch).findIndex(x => x.ch === qChapter(st.k));
      const inCh = (() => { let n = -1, c = 0; for (const x of QUESTS) { if (x.ch) { n++; continue; } if (n === chIdx) c++; } return c; })();
      const before = (() => { let n = -1, idx = -1, c = 0; for (const x of QUESTS) { if (x.ch) { n++; continue; } idx++; if (n === chIdx && idx < st.k) c++; } return c; })();
      body = `<div class="q-ch">📖 ${qChapter(st.k)} <small>${before + 1} / ${inCh}</small></div>
        <div class="q-npc"><span class="q-face">${QNPC.face}</span><div class="q-say"><b>${QNPC.name}</b>${q.say}</div></div>
        <div class="q-goal ${ok ? 'ok' : ''}">
          <div><b>🎯 ${q.text}</b> <small>${fmt(p)} / ${fmt(q.need)}</small></div>
          <div class="bar"><i style="width:${p / q.need * 100}%"></i></div>
          <div class="q-rew">보상: ${rText(q.r)}</div>
          <button class="btn big ${ok ? 'green' : ''}" data-act="qClaim" ${ok ? '' : 'disabled'}>${ok ? '🎁 보상 받고 다음 이야기' : '진행 중…'}</button>
        </div>
        <div class="q-dots">${QLIST.map((_, k) => `<i class="${k < st.k ? 'done' : k === st.k ? 'now' : ''}"></i>`).join('')}</div>
        <p class="muted">스토리 퀘스트 ${st.k} / ${QLIST.length} 완료</p>`;
    }
  } else if (questTab === 'week') {
    const w = weekState();
    const end = new Date(); end.setDate(end.getDate() + (7 - ((end.getDay() + 6) % 7))); end.setHours(0, 0, 0, 0);
    const days = Math.max(0, Math.floor((end - Date.now()) / 86400000)), hours = Math.max(0, Math.floor((end - Date.now()) % 86400000 / 3600000));
    body = `<p class="muted">월요일마다 새 퀘스트 · ${days}일 ${hours}시간 남음 · 하나에 ${rText(WEEK_REWARD)}, 모두 깨면 ${rText(WEEK_BONUS)}</p>
      <div class="mis-list">${w.ids.map(id => { const def = WEEKLY.find(x => x.id === id), p = wProg(id), done = p >= def.need, taken = w.got.includes(id);
        return `<div class="mis-row ${taken ? 'taken' : done ? 'done' : ''}"><div class="mis-info"><b>${def.text} ${fmt(def.need)}번</b> <small>${fmt(p)}/${fmt(def.need)}</small><div class="bar"><i style="width:${p / def.need * 100}%"></i></div></div>
          ${taken ? '<span class="mis-ok">✅</span>' : `<button class="btn small ${done ? 'green' : ''}" data-act="weekClaim" data-id="${id}" ${done ? '' : 'disabled'}>${rText(WEEK_REWARD)}</button>`}</div>`; }).join('')}
      <div class="mis-row bonus ${w.bonus ? 'taken' : ''}"><div class="mis-info"><b>🎉 이번 주 모두 깨기</b> <small>${w.got.length}/${w.ids.length}</small></div>
        ${w.bonus ? '<span class="mis-ok">✅</span>' : `<button class="btn small ${w.got.length >= w.ids.length ? 'green' : ''}" data-act="weekBonus" ${w.got.length >= w.ids.length ? '' : 'disabled'}>${rText(WEEK_BONUS)}</button>`}</div></div>`;
  }
  showModal(`<h3>📜 퀘스트</h3>
    <div class="chips"><button class="chip ${questTab === 'story' ? 'on' : ''}" data-act="questTab" data-t="story">📜 스토리${qReady() ? ' 🔴' : ''}</button><button class="chip ${questTab === 'week' ? 'on' : ''}" data-act="questTab" data-t="week">📆 주간${weekReady() ? ' 🔴' : ''}</button><button class="chip" data-act="missions">📋 일일 미션</button><button class="chip" data-act="achOpen">🏆 업적${ACH.some(achReady) ? ' 🔴' : ''}</button></div>
    ${body}
    <div class="row"><button class="btn ghost small" data-act="close">닫기</button></div>`);
}

function nextGoal() {
  // 스토리 퀘스트가 있으면 그게 먼저
  const qs = qState(), qq = QLIST[qs.k];
  if (qq) return qProg(qs.k) >= qq.need ? { text: '📜 퀘스트 보상을 받을 수 있어요! 눌러서 받기', ready: true, quest: true } : { text: `📜 ${qq.text} <b>${fmt(qProg(qs.k))}/${fmt(qq.need)}</b> → ${rText(qq.r)}`, quest: true };
  const m = misToday();
  const misReady = m.ids.some(id => (m.prog[id] || 0) >= MISSIONS.find(x => x.id === id).need && !m.got.includes(id)) || (!m.bonus && m.got.length >= 3);
  const ach = ACH.filter(a => !(S.achGot || []).includes(a.id));
  if (ach.some(achReady) || misReady) return { text: '🎁 받을 보상이 있어요! 눌러서 받기', ready: true };
  const best = ach.map(a => ({ a, p: Math.min(1, a.now() / a.need) })).sort((x, y) => y.p - x.p)[0];
  if (!best) return null;
  return { text: `🎯 ${best.a.text} <b>${fmt(Math.min(best.a.need, best.a.now()))}/${fmt(best.a.need)}</b> → 💎${best.a.gems}` };
}
function updateGoal() {
  const c = $('#goalChip');
  if (!c) return;
  const g = $('#guide');
  // 튜토리얼이 길어져서: 처음 13단계를 끝냈거나, 지금 단계가 🎯 다음 목표 단계면 보여 준다
  const cur = TUT[tutStep()], goalStep = !!(cur && cur.text.startsWith('🎯'));
  const show = tab === 'island' && !B && !VISIT && !S.hideUI && (S.tutCoreDone || tutStep() >= 13) && (!g || g.classList.contains('hidden') || goalStep || (tutFocus != null && TUT[tutFocus] && TUT[tutFocus].text.startsWith('🎯')));
  const goal = show ? nextGoal() : null;
  c.classList.toggle('hidden', !goal);
  if (!goal) return;
  if (c.dataset.t !== goal.text) { c.innerHTML = goal.text; c.dataset.t = goal.text; }
  c.classList.toggle('ready', !!goal.ready);
}

function toggleSound() {
  if (muteOn()) lsSet('combining-mute', 'off');
  lsSet('combining-sound', soundOn() ? 'off' : 'on');
  updateMuteBtn();
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
// 짧은 숫자: 9,999까지는 그대로, 만 넘으면 12.5K · 3.4M · 1.2B · 5T (100 넘으면 소수점 없이: 125K)
// 1000배마다 새 단위: K M B T Qa Qi Sx Sp Oc No → Dc(10^33) · UDc · DDc … → Vg(10^63) → Tg(10^93) → Qag → Qig → Sxg → Spg → Ocg → Nog → Ce(10^303)
const NUM_UNITS = (() => {
  const first = ['K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No'];
  const ones = ['', 'U', 'D', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No'];
  const tens = ['', 'Dc', 'Vg', 'Tg', 'Qag', 'Qig', 'Sxg', 'Spg', 'Ocg', 'Nog'];
  const out = [];
  for (let n = 1; n <= 101; n++) {
    const s = n <= 10 ? first[n - 1] : n === 101 ? 'Ce' : ones[(n - 1) % 10] + tens[Math.floor((n - 1) / 10)];
    out.push([Math.pow(10, 3 * n), s]);
  }
  return out.reverse();
})();
const KR_UNITS = ['만', '억', '조', '경', '해', '자', '양', '구', '간', '정', '재', '극', '항하사', '아승기', '나유타', '불가사의', '무량대수'].map((s, i) => [Math.pow(10, 4 * (i + 1)), s]);
const krOn = () => S.krUnits && window.LANG !== 'en';
const shortNum = (n) => {
  n = Math.floor(n);
  if (Math.abs(n) < 1e4) return fmt(n);
  if (!isFinite(n)) return '∞';
  // 한국 단위: 무량대수(10^68)의 1만 배까지는 만 · 억 · 조 …로 (그보다 크면 영어 단위)
  if (krOn() && Math.abs(n) < 1e72) {
    for (let i = KR_UNITS.length - 1; i >= 0; i--) {
      const [u, s] = KR_UNITS[i];
      if (Math.abs(n) >= u) { const v = n / u * (1 + 1e-12), d = Math.abs(v) >= 100 ? 0 : 1, p = Math.pow(10, d); return (Math.floor(v * p) / p).toFixed(d).replace(/\.0$/, '') + s; }
    }
  }
  if (Math.abs(n) >= 1e306) { const e = Math.floor(Math.log10(Math.abs(n))); return (Math.floor(n / Math.pow(10, e) * 10) / 10) + 'e' + e; }
  for (const [u, s] of NUM_UNITS) {
    if (Math.abs(n) >= u) {
      const v = n / u * (1 + 1e-12);   // 3e303 / 1e303 = 2.999… 이 2.9로 보이지 않게
      // 버림으로 표시 (1.99M을 2M으로 올리지 않게)
      const d = Math.abs(v) >= 100 ? 0 : 1, p = Math.pow(10, d);
      return (Math.floor(v * p) / p).toFixed(d).replace(/\.0$/, '') + s;
    }
  }
  return fmt(n);
};
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
    ${m.star ? `<div class="stars">${'★'.repeat(m.star)}</div>` : ''}
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
  if (typeof FISH !== 'undefined' && FISH) fishStop();
  if (typeof MG !== 'undefined' && MG) mgStop();
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
  // 가로 폭이 바뀔 때(처음·회전)만 확대 배율을 다시 정한다. 주소창이 생겼다 사라지는 건 그대로 둔다
  if (W === lastZoomW) return;
  lastZoomW = W;
  const portrait = H > W * 1.2;
  cam.z = portrait ? clamp(W / 820, 0.3, 1.2) : clamp(Math.min(W / 1150, (H - 190) / 860), 0.26, 1.2);
}
let lastZoomW = -1;

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
const HAB_WALK_MAX = 8;
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
  if (p.kind === 'cloner') {
    block(x, y, hw, hh, '#3a4a6b', '#1f2a44');
    diamond(x, y, hw * 0.55, hh * 0.55);
    ctx.fillStyle = `rgba(92, 225, 230, ${0.25 + Math.sin(t * 3) * 0.12})`;
    ctx.fill();
    shadow(x, y + 8, 60);
    emoji('🧬', x, y - 44 + Math.sin(t * 2) * 4, 96, Math.sin(t * 1.5) * 0.12);
    if (!S.hideUI) { emoji('⚙️', x - 58, y - 12, 34, t); emoji('⚙️', x + 58, y - 18, 28, -t); }
    return;
  }
  if (p.kind === 'deco') {
    const d = decoById(p.id);
    diamond(x, y, hw, hh);
    ctx.fillStyle = 'rgba(255,255,255,.12)';
    ctx.fill();
    if (d && d.wonder) {
      diamond(x, y, hw, hh);
      ctx.fillStyle = 'rgba(255,210,74,.28)';
      ctx.fill();
      shadow(x, y + 12, 70);
      emoji(d.emoji, x, y - 46 + Math.sin(t * 1.2 + i) * 3, 132);
      if (!S.hideUI) { emoji('✨', x - 60, y - 90 + Math.sin(t * 3) * 6, 26); emoji('✨', x + 58, y - 60 + Math.cos(t * 3) * 6, 20); }
      return;
    }
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
    if (!S.hideUI) {
      if (p.lv <= 6) for (let k = 1; k < p.lv; k++) emoji('⭐', x - hw * 0.3 + (k - 1) * 22, y + hh * 0.72, 16);
      else label(`⭐${p.lv}`, x, y + hh * 0.72, 16);
    }
    const hm = habMons(i);
    if (hm.length > HAB_WALK_MAX) label(`+${hm.length - HAB_WALK_MAX}`, x + hw * 0.55, y - hh * 0.2, 15);
    hm.slice(0, HAB_WALK_MAX)
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
  if (p.kind === 'cloner') { label('🧬 복제기', x, y + TH / 2 + 10, 17); return; }
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
  // 폰처럼 작게 보일 때는 진행 중 표시는 빼고 "수확!·교배 완료" 같은 준비된 것만 (글자가 겹치지 않게)
  if (!ready && cam.z < 0.62) return;
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
    : p.kind === 'cloner' ? '🧬' : p.kind === 'deco' ? (decoById(p.id) || { emoji: '❓' }).emoji : habEmoji(p.el);
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
  // 화면 크기가 0이었다가 커졌는데 캔버스가 그대로면(숨겨진 채로 켜진 경우 등) 다시 맞춘다
  if (W !== window.innerWidth || H !== window.innerHeight || !cv.width) resize();
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
    const pet = S.petOn && petById(S.petOn);
    if (pet && !VISIT) {
      const pp = petWalkPos(t);
      items.push({ y: pp.y, fn: () => { shadow(pp.x, pp.y + 22, 26); emoji(pet.e, pp.x, pp.y + Math.abs(Math.sin(t * 6)) * -8, 58, 0, pp.dir); } });
    }
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
    habIdxDirty();
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
window.addEventListener('orientationchange', () => setTimeout(resize, 250));
window.addEventListener('pageshow', resize);
if (window.visualViewport) window.visualViewport.addEventListener('resize', resize);
resize();

function renderIslandBar() {
  const k = S.isl || 0, th = ISLANDS[k];
  const used = islandRange(k).filter(i => S.plots[i]).length;
  const bar = $('#islandBar');
  bar.innerHTML = '<button class="ib-arrow" data-act="isl" data-d="-1">◀</button>' +
    '<button class="ib-name" data-act="islList">' + th.emoji + ' ' + (k + 1) + '. ' + th.name + ' <small>' + used + '/' + ISLAND_PLOTS + '칸' + (decoPercent(k) ? ' · 🎨+' + decoPercent(k) + '%' : '') + ' · 🗺️</small></button>' +
    '<button class="ib-arrow" data-act="isl" data-d="1">▶</button>' +
    (VISIT ? '' : `<button class="wx-chip" data-act="wxInfo" title="날씨 예보">${weatherNow().e}${isNight() ? '🌙' : ''}</button>`);
  bar.classList.toggle('hidden', tab !== 'island');
  drawWeather();
  $('#zoomBtns').classList.toggle('hidden', tab !== 'island');
  const hb = $('#hideBtn');
  hb.classList.toggle('hidden', tab !== 'island');
  updatePetBtn();
  updateEvtBtn(); updateQuestBtn();
  hb.classList.toggle('on', !!S.hideUI);
  hb.innerHTML = S.hideUI ? '👁️<span> 보이기</span>' : '🙈<span> 숨기기</span>';
  document.body.classList.toggle('ui-hidden', !!S.hideUI && tab === 'island');
}
function goIsland(k) {
  S.isl = (Number(k) + islCount()) % islCount();
  save();
  closeModal();
  render();
}
// n개 사는 값 (모자라면 살 수 있는 만큼만)
function islBulkPlan(want) {
  let k = islCount(), cost = 0, n = 0;
  const gold = S.infinite ? Infinity : S.gold;
  while (n < want && k < ISL_MAX) { const c = Math.round(1e8 * Math.pow(5, k - ISL_BASE)); if (cost + c > gold) break; cost += c; k++; n++; }
  return { n, cost };
}
function openIslandBulk() {
  if (VISIT) return;
  tutFlag('bulkGrow', true);
  if (islCount() >= ISL_MAX) { toast(`🏝️ 섬은 ${ISL_MAX}개까지예요!`); return; }
  const opts = [1, 5, 10, 25, ISL_MAX].map(w => {
    const p = islBulkPlan(w), label = w === ISL_MAX ? '돈 되는 만큼 전부' : `${w}개`;
    return `<button class="build-opt" data-act="islBulk" data-n="${w}" ${p.n ? '' : 'disabled'}><span class="bo-ico">🏝️</span><span class="bo-nm">${label}<br><small>${p.n ? `${p.n}개 사요 (${islCount() + 1}번 ~ ${islCount() + p.n}번)` : '💰 골드가 모자라요'}</small></span><span class="bo-cost">💰 ${shortNum(p.cost)}</span></button>`;
  }).join('');
  showModal(`<h3>🏝️ 섬 여러 개 한 번에 사기</h3>
    <p class="muted">지금 섬 ${islCount()}개 / 최대 ${ISL_MAX}개 · 다음 섬 💰 ${shortNum(islPrice())}부터 5배씩 비싸져요</p>
    <label class="chk"><input type="checkbox" id="islBulkFill" checked> 🏠 산 섬마다 🌈 골고루 서식지를 꽉 채우기</label>
    <div class="build-list">${opts}</div>
    <div class="row"><button class="btn ghost small" data-act="islList">← 섬 지도</button><button class="btn ghost small" data-act="close">닫기</button></div>`);
}
function buyIslandsBulk(want) {
  const fill = !!($('#islBulkFill') || {}).checked;
  const p = islBulkPlan(Number(want) || 1);
  if (!p.n) { toast('💰 골드가 모자라요'); return; }
  if (!spend(p.cost)) return;
  const k0 = islCount();
  for (let n = 0; n < p.n * ISLAND_PLOTS; n++) S.plots.push(null);
  let built = 0, fillCost = 0;
  if (fill) {
    for (let k = k0; k < k0 + p.n; k++) {
      const free = islFree(k), els = fillEls('mix', free.length), c = els.reduce((s, e) => s + habBuildCost(e), 0);
      if (!S.infinite && S.gold < c) break;
      if (!S.infinite) S.gold -= c;
      fillCost += c;
      free.forEach((j, x) => { S.plots[j] = { kind: 'hab', el: els[x], lv: 1, gold: 0 }; });
      built += free.length;
    }
  }
  S.isl = k0;
  sfx('yay');
  save(); closeModal(); render(); updateHud();
  toast(`🏝️ 섬 ${p.n}개를 샀어요! (${k0 + 1}번 ~ ${k0 + p.n}번)${built ? ` · 🏠 서식지 ${built}개도 지었어요` : ''}`);
}
// ⏫ 모든 서식지를 돈 되는 만큼 (가장 낮은 레벨부터 골고루)
function upAllHabsMax() {
  tutFlag('bulkGrow', true);
  const habs = S.plots.map((p, i) => ({ p, i })).filter(({ p }) => p && p.kind === 'hab' && p.lv < HAB_MAX_LV);
  if (!habs.length) { toast('⏫ 모든 서식지가 이미 Lv.' + HAB_MAX_LV + '이에요!'); return; }
  let ups = 0;
  const lvSum0 = habs.reduce((s, h) => s + h.p.lv, 0);
  // 레벨별로 한 바퀴씩: 낮은 레벨부터 한 단계씩 올린다
  for (let guard = 0; guard < HAB_MAX_LV; guard++) {
    habs.sort((a, b) => a.p.lv - b.p.lv);
    let moved = false;
    for (const { p } of habs) {
      if (p.lv >= HAB_MAX_LV) continue;
      const c = habUpCost(p.lv);
      if (!S.infinite && S.gold < c) continue;
      if (!S.infinite) S.gold -= c;
      p.lv++; ups++; moved = true;
    }
    if (!moved) break;
  }
  if (!ups) { toast(`💰 골드가 모자라요 (${shortNum(habUpCost(habs.sort((a, b) => a.p.lv - b.p.lv)[0].p.lv))} 필요)`); return; }
  const maxed = S.plots.filter(p => p && p.kind === 'hab' && p.lv >= HAB_MAX_LV).length, all = S.plots.filter(p => p && p.kind === 'hab').length;
  sfx('level');
  save(); updateHud(); render();
  toast(`⏫ 서식지 ${habs.length}개를 ${ups}단계 올렸어요! (Lv.100: ${maxed}/${all}개)`);
  if (curHabOpen != null && S.plots[curHabOpen]) openHab(curHabOpen); else closeModal();
}
let curHabOpen = null;
function buyIsland() {
  if (VISIT) return;
  if (islCount() >= ISL_MAX) { toast(`🏝️ 섬은 ${ISL_MAX}개까지예요!`); return; }
  const k = islCount(), th = ISLANDS[k], cost = islPrice();
  if (!confirm(`🏝️ ${k + 1}번째 섬 "${th.emoji} ${th.name}"을 살까요?\n💰 ${shortNum(cost)}`)) return;
  if (!spend(cost)) return;
  for (let n = 0; n < ISLAND_PLOTS; n++) S.plots.push(null);
  S.isl = k;
  sfx('yay');
  save(); closeModal(); render(); updateHud();
  toast(`🏝️ 새 섬 ${th.emoji} ${th.name}이 생겼어요! 빈 땅 ${ISLAND_PLOTS}칸`);
}
function openIslandList() {
  curHabOpen = null;
  tutFlag('islBuy', true);
  const buy = (VISIT ? '' : islCount() < ISL_MAX
    ? `<button class="btn green isl-buy" data-act="islBuy">🏝️ 새 섬 사기 · ${ISLANDS[islCount()].emoji} ${islCount() + 1}. ${ISLANDS[islCount()].name} (💰 ${shortNum(islPrice())})</button>
       <button class="btn isl-buy" data-act="islBulkOpen">🏝️🏝️ 섬 여러 개 한 번에 사기</button>`
    : `<p class="muted">🏝️ 섬 ${ISL_MAX}개를 모두 가졌어요!</p>`) + (VISIT ? '' : `<button class="btn isl-buy" data-act="upAllHabsMax">⏫ 모든 서식지 돈 되는 만큼 올리기 (최대 Lv.${HAB_MAX_LV})</button>`);
  const rows = ISLANDS.slice(0, islCount()).map((th, k) => {
    const r = islandRange(k), used = r.filter(i => S.plots[i]).length;
    const habs = r.filter(i => S.plots[i] && S.plots[i].kind === 'hab').length;
    const mons = S.monsters.filter(m => islandOf(m.hab) === k).length;
    return '<button class="build-opt ' + (k === (S.isl || 0) ? 'on' : '') + '" data-act="islGo" data-k="' + k + '" style="--hc:' + th.grass[1] + '">' +
      '<span class="bo-ico">' + th.emoji + '</span>' +
      '<span class="bo-nm">' + (k + 1) + '. ' + th.name + '<br><small>서식지 ' + habs + ' · 몬스터 ' + mons + '</small></span>' +
      '<span class="bo-cost">' + used + '/' + ISLAND_PLOTS + '칸</span></button>';
  }).join('');
  showModal('<h3>🗺️ 섬 지도 <small class="muted">' + islCount() + '/' + ISL_MAX + '개</small></h3>' + buy + fillBtnHTML() + '<div class="build-list">' + rows + '</div>' +
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
  statAdd('gold', sum);
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
  if (p.kind === 'cloner') return openCloner();
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
    ${fillBtnHTML()}
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

const islFree = (k = S.isl || 0) => islandRange(k).filter(j => j < S.plots.length && !S.plots[j]);
const fillBtnHTML = () => { const n = islFree().length; return n && !VISIT ? `<button class="btn fill-isl" data-act="fillIslOpen">🏠 이 섬 빈 땅 전부에 서식지 짓기 (${n}칸)</button>` : ''; };
// 골고루: 모든 속성을 돌아가며
const MIX_ELS = () => [...EL.map(e => e.id), 'legend'];
const fillEls = (el, n) => { const mix = MIX_ELS(); return Array.from({ length: n }, (_, k) => (el === 'mix' ? mix[k % mix.length] : el)); };
function openFillIsland() {
  tutFlag('fillIsl', true);
  const free = islFree(), th = ISLANDS[S.isl || 0];
  if (!free.length) { toast('이 섬에는 빈 땅이 없어요'); return; }
  const opt = (el, ico, nm, color) => { const cost = fillEls(el, free.length).reduce((s, e) => s + habBuildCost(e), 0);
    return `<button class="build-opt" data-act="fillIsl" data-el="${el}" style="--hc:${color}"><span class="bo-ico">${ico}</span><span class="bo-nm">${nm}</span><span class="bo-cost">💰 ${shortNum(cost)}</span></button>`; };
  showModal(`<h3>🏠 섬 전체에 서식지 짓기</h3>
    <p class="muted">${th.emoji} ${th.name}의 빈 땅 <b>${free.length}칸</b>을 고른 서식지로 한 번에 채워요.</p>
    <div class="build-list">
      ${opt('mix', '🌈', '골고루 <small>(모든 속성 + 🏛️ 전설 서식지를 돌아가며)</small>', '#ff9ad5')}
      ${EL.map(e => opt(e.id, habEmoji(e.id), habName(e.id), habColor(e.id))).join('')}
      ${opt('legend', habEmoji('legend'), habName('legend'), habColor('legend'))}
    </div>
    <div class="row"><button class="btn ghost small" data-act="close">닫기</button></div>`);
}
function fillIsland(el) {
  const free = islFree();
  if (!free.length) { toast('이 섬에는 빈 땅이 없어요'); return; }
  const els = fillEls(el, free.length), cost = els.reduce((s, e) => s + habBuildCost(e), 0);
  if (!spend(cost)) return;
  free.forEach((j, k) => { S.plots[j] = { kind: 'hab', el: els[k], lv: 1, gold: 0 }; });
  sfx('yay');
  save(); closeModal(); render(); updateHud();
  toast(`🏠 서식지 ${free.length}개를 한 번에 지었어요!`);
}
function build(i, what) {
  i = Number(i);
  if (S.plots[i]) return;
  if (what.startsWith('deco:')) {
    const d = decoById(what.slice(5));
    if (d && d.wonder && S.plots.some(p => p && p.kind === 'deco' && p.id === d.id)) { toast('이미 지은 랜드마크예요'); return; }
    if (!d || !(d.gems ? spend(d.gems, 'gems') : spend(d.cost))) return;
    S.plots[i] = { kind: 'deco', id: d.id };
    if (d.wonder) { sfx('yay'); toast(`${d.emoji} ${d.name} 완성! 모든 섬 골드 +${d.global}%`); save(); closeModal(); render(); return; }
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
  curHabOpen = Number(i);
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
      <button class="btn ghost" data-act="upHab" data-i="${i}" ${maxed ? 'disabled' : ''}>⬆️ ${maxed ? '최대 레벨' : `업그레이드 (💰 ${shortNum(habUpCost(p.lv))})`}</button>
      ${maxed ? '' : `<button class="btn ghost" data-act="upHabMax" data-i="${i}">⏫ 돈 되는 만큼 올리기</button>`}
    </div>
    <p class="muted small-note">⬆️ Lv.${p.lv} / ${HAB_MAX_LV} · 레벨이 오를수록 몬스터가 더 많이 살고 골드도 더 많이 나와요</p>
    ${(() => {
      const ups = S.plots.filter(q => q && q.kind === 'hab' && q.lv < HAB_MAX_LV);
      const cost = ups.reduce((s, q) => s + habUpCost(q.lv), 0);
      return `<div class="all-box">
        <button class="btn small" data-act="upAllHabs" data-i="${i}" ${ups.length ? '' : 'disabled'}>⬆️ 모든 서식지 한 단계 업그레이드${ups.length ? ` (${ups.length}개 · 💰 ${shortNum(cost)})` : ' (모두 최대)'}</button>
        ${ups.length ? '<button class="btn small" data-act="upAllHabsMax">⏫ 모든 서식지 돈 되는 만큼 올리기</button>' : ''}
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
  if (p.kind === 'cloner') return Math.floor(CLONER_COST / 2);
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
  const name = p.kind === 'farm' ? '농장' : p.kind === 'mountain' ? '교배산' : p.kind === 'hatchery' ? '부화장' : p.kind === 'cloner' ? '복제기' : p.kind === 'deco' ? (decoById(p.id) || { name: '장식' }).name : habName(p.el);
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
  habIdxDirty();
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
  statAdd('gold', n);
  sfx('coin');
  mission('collect');
  floatAt(i, `+${fmt(n)}`);
  if (!quiet) toast(`💰 ${fmt(n)} 골드!`);
  save();
  refreshLive();
  updateHud();
}

function upHabMax(i) {
  i = Number(i);
  const p = S.plots[i];
  if (!p || p.lv >= HAB_MAX_LV) return;
  const lv0 = p.lv;
  while (p.lv < HAB_MAX_LV && (S.infinite || S.gold >= habUpCost(p.lv))) { if (!S.infinite) S.gold -= habUpCost(p.lv); p.lv++; }
  if (p.lv === lv0) { toast(`💰 골드가 모자라요 (${shortNum(habUpCost(p.lv))} 필요)`); return; }
  sfx('level');
  toast(`⏫ ${habName(p.el)} Lv.${lv0} → Lv.${p.lv}! 몬스터 ${habCap(i)}마리까지 · 골드 수입 +${habLvBonus(i)}%`);
  save(); updateHud();
  openHab(i);
  render();
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
    const got = Math.round(CROPS[p.crop].food * (1 + (petPct('food') + kdLv('food') * 15) / 100) * (evtOn('harvest') ? 2 : 1));
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
  const food = Math.round(CROPS[p.crop].food * (1 + (petPct('food') + kdLv('food') * 15) / 100) * (evtOn('harvest') ? 2 : 1));
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
  let type = breedResult(a.type, b.type);
  if ((S.potLuck || 0) > 0) {
    const t2 = breedResult(a.type, b.type);
    if (rIdx(t2) > rIdx(type)) type = t2;
    S.potLuck--;
    toast(`🍀 행운 물약을 썼어요! (${S.potLuck}개 남음)`);
  }
  if (cosLv('luck') && Math.random() * 100 < Math.min(80, cosLv('luck') * 8)) {
    const t3 = breedResult(a.type, b.type);
    if (rIdx(t3) > rIdx(type)) type = t3;
  }
  const base = RAR[CAT[type].rarity].time;
  const total = Math.max(1, Math.round(base * (evtOn('breedrush') ? 0.5 : 1)));
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
    ${S.hatch.length ? '<div class="all-box"><button class="btn" data-act="makeRoom">🏠 남은 알 살 곳 만들기 (빈 서식지 바꾸기 · 새로 짓기)</button></div>' : ''}
    ${S.hatch.length + leftover.length ? `<div class="all-box"><button class="btn ghost small danger" data-act="dumpEggs">🗑️ 알 모두 버리기 (${fmt(S.hatch.length + leftover.length)}개)</button></div>` : ''}
    <p class="muted small-note">부화장 ${n}개가 알을 같이 보관해요 (${hatcheries().map(k => (S.plots[k].cap || HATCH_CAP) + '칸').join(' + ')}${mtnPower() > 1 ? ` + 교배산 추가분 ${2 * (mtnPower() - 1)}칸` : ''})</p>
    <div class="row">
      ${(p.lv || 1) > 1 ? `<button class="btn ghost small" data-act="splitHatch" data-i="${i}">🔓 합치기 취소 (${p.lv}개로 나누기)</button>` : ''}
      ${n > 1 && !busy ? `<button class="btn ghost small danger" data-act="demolish" data-i="${i}">🗑️ 이 부화장 철거 (+💰 ${fmt(demolishRefund(p))})</button>` : ''}
      <button class="btn ghost small" data-act="close">닫기</button>
    </div>`);
}

function dumpEggs() {
  const left = allIncs().filter(x => x.b), n = S.hatch.length + left.length;
  if (!n) { toast('버릴 알이 없어요'); return; }
  if (!confirm(`🗑️ 부화장에 있는 알 ${n}개를 모두 버릴까요?\n버린 알은 되돌릴 수 없어요!`)) return;
  S.hatch = [];
  left.forEach(({ k, s }) => { hatchIncs(S.plots[k])[s] = null; });
  sfx('err');
  save(); render();
  toast(`🗑️ 알 ${n}개를 버렸어요`);
  openHatchery();
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
const eggNeed = (t) => (isLegend(t) ? 'legend' : CAT[t].els[0]);
const lvCost = (from, to) => { let c = 0; for (let l = from; l < to; l++) c += habUpCost(l); return c; };
function roomPlan() {
  // 서식지마다 남은 칸 (속성별)
  const slots = habSlots(), need = {};
  for (const t of S.hatch) {
    if (!CAT[t]) continue;
    if (slotTake(slots, t) < 0) { const k = eggNeed(t); need[k] = (need[k] || 0) + 1; }
  }
  // 빈 서식지(몬스터 0마리) 중에서 바꿀 수 있는 것 (레벨 높은 것부터)
  const neededEls = new Set(Object.keys(need));
  const empties = S.plots.map((p, i) => ({ p, i })).filter(({ p, i }) => p && p.kind === 'hab' && !habMons(i).length && !neededEls.has(p.el))
    .sort((a, b) => b.p.lv - a.p.lv);
  const free = S.plots.map((p, i) => i).filter(i => !S.plots[i]);
  const acts = [];
  let cost = 0, short = 0;
  for (const [el, n0] of Object.entries(need)) {
    let n = n0;
    while (n > 0 && empties.length) { const { p, i } = empties.shift(); acts.push({ i, el, lv: p.lv, conv: true }); cost += habBuildCost(el); n -= Math.max(2, p.lv); }
    while (n > 0 && free.length) { const i = free.shift(), lv = Math.min(HAB_MAX_LV, Math.max(2, n)); acts.push({ i, el, lv, conv: false }); cost += habBuildCost(el) + lvCost(1, lv); n -= lv; }
    if (n > 0) short += n;
  }
  return { need, acts, cost, short, eggs: Object.values(need).reduce((s, x) => s + x, 0) };
}
function makeRoom() {
  const plan = roomPlan();
  if (!plan.eggs) { toast('🎉 모든 알이 살 곳이 있어요! 🐣 모두 부화를 눌러요'); return; }
  if (!plan.acts.length) { toast('😢 바꿀 빈 서식지나 빈 땅이 없어요. 🗺️ 섬 지도에서 새 섬을 사 주세요'); return; }
  const conv = plan.acts.filter(a => a.conv).length, built = plan.acts.length - conv;
  const what = Object.entries(plan.need).map(([el, n]) => `${habEmoji(el)} ${habName(el)} ${n}마리`).join(', ');
  if (!confirm(`🏠 살 곳이 없는 알: ${what}\n\n빈 서식지 ${conv}개를 바꾸고, 빈 땅에 ${built}개를 새로 지을까요?\n💰 ${shortNum(plan.cost)}${plan.short ? `\n(그래도 ${plan.short}마리는 자리가 모자라요. 새 섬을 사 주세요)` : ''}`)) return;
  if (!spend(plan.cost)) return;
  for (const a of plan.acts) {
    if (a.conv) { S.plots[a.i].el = a.el; S.plots[a.i].gold = S.plots[a.i].gold || 0; }
    else S.plots[a.i] = { kind: 'hab', el: a.el, lv: a.lv, gold: 0 };
  }
  habIdxDirty();
  toast(`🏠 서식지 ${plan.acts.length}개를 준비했어요! 이제 부화시킬게요`);
  hatchAll();
}
// 속성별 빈칸 목록 (서식지 번호, 남은 칸)
function habSlots() {
  const slots = {};
  S.plots.forEach((p, i) => { if (p && p.kind === 'hab') { const f = habCap(i) - habMons(i).length; if (f > 0) (slots[p.el] = slots[p.el] || []).push([i, f]); } });
  return slots;
}
function slotTake(slots, type) {
  const els = isLegend(type) ? ['legend'] : CAT[type].els;
  for (const el of els) {
    const arr = slots[el];
    while (arr && arr.length && arr[0][1] <= 0) arr.shift();
    if (arr && arr.length) { arr[0][1]--; return arr[0][0]; }
  }
  return -1;
}
// 알 여러 개를 한꺼번에 서식지로 (못 들어간 알은 돌려준다)
function fastPlace(types) {
  const slots = habSlots(), born = [], stuck = [];
  let n = 0, news = 0;
  for (const type of types) {
    if (!CAT[type]) continue;
    const isNew = !S.dex[type];
    S.dex[type] = true;
    const h = slotTake(slots, type);
    if (h < 0) { stuck.push(type); continue; }
    S.monsters.push({ uid: S.nextUid++, type, lv: 1, hab: h, runes: [null, null] });
    n++; if (isNew) news++;
    if (born.length < 60) born.push({ type, isNew });
  }
  if (n) mission('hatch', n);
  habIdxDirty();
  return { born, stuck, n, news };
}
function oldHatchAll() {
  const eggs = S.hatch.slice();
  S.hatch = [];
  const r = fastPlace(eggs), born = r.born, stuck = r.stuck;
  S.hatch.push(...stuck);
  save();
  render();
  showModal(`
    <h3>🐣 모두 부화!</h3>
    ${born.length ? `<div class="grid small">${born.slice(0, 60).map(b => card({ type: b.type, lv: 1 }, '', 'mini',
      b.isNew ? '<div class="found-mark">🆕</div>' : '')).join('')}</div>${r.n > 60 ? `<p class="muted">… 외 ${fmt(r.n - 60)}마리</p>` : ''}
      <p class="muted">${fmt(r.n)}마리가 서식지로 이사했어요.${r.news ? ` (🆕 도감 ${fmt(r.news)}마리)` : ''}</p>` : ''}
    ${stuck.length ? `<p class="warn">${stuck.slice(0, 20).map(t => `${CAT[t].face} ${CAT[t].name}`).join(', ')}${stuck.length > 20 ? ` 외 ${fmt(stuck.length - 20)}마리` : ''}<br>살 수 있는 빈 서식지가 없어서 부화장에 남아 있어요.${stuck.some(isLegend) ? '<br>⭐ 전설 이상 몬스터는 🏛️ 전설의 서식지에서만 살아요!' : ''}</p>
      <div class="row"><button class="btn green" data-act="makeRoom">🏠 남은 알 살 곳 만들기</button></div>` : ''}
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
        : `<p class="warn">살 수 있는 빈 서식지가 없어요! 필요한 곳: ${need}${isLegend(type) ? '<br>⭐ 전설 이상 몬스터는 🏛️ 전설의 서식지에서만 살아요' : ''}</p>${roomOptions(idx, type)}
          <div class="row"><button class="btn green" data-act="makeRoom">🏠 빈 서식지를 바꿔서 살 곳 만들기</button></div>`}
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
    <div class="stars big">${'★'.repeat(m.star || 0)}<span class="dim">${'☆'.repeat(STAR_MAX - (m.star || 0))}</span></div>
    <div class="els">${elNames(c.els)}</div>
    <div class="statbox">
      <div>❤️ 체력<b>${fmt(st.hp)}</b></div>
      <div>⚔️ 공격<b>${fmt(st.atk)}</b></div>
      <div>👟 속도<b>${fmt(st.spd)}</b></div>
      <div>💰 초당<b>${fmt(monIncome(m))}</b></div>
    </div>
    ${starBoxHTML(m)}
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

// ===================== ⭐ 별 합성 · 🔮 합성 제단 =====================
// ⭐ 같은 몬스터 3마리 → 한 마리가 별 +1 (최대 ★5). 별마다 체력·공격 +20%, 골드 +30%
const STAR_MAX = 5;
const starCost = (m) => RAR[CAT[m.type].rarity].cost * 10 * ((m.star || 0) + 1);
// 재료로 쓸 같은 몬스터 (팀·높은 별·높은 레벨은 나중에)
function starMats(m) {
  return S.monsters.filter(x => x.uid !== m.uid && x.type === m.type)
    .sort((a, b) => (S.team.includes(a.uid) - S.team.includes(b.uid)) || (a.star || 0) - (b.star || 0) || a.lv - b.lv);
}
function starBoxHTML(m) {
  const star = m.star || 0;
  if (star >= STAR_MAX) return '<div class="star-box done">⭐ 최고 별 ★5! 체력·공격 +100%, 골드 +150%</div>';
  const mats = starMats(m);
  const ok = mats.length >= 2;
  return `<div class="star-box">
    <div><b>⭐ 별 합성</b> <small class="muted">같은 몬스터 2마리를 재료로 ★${star} → ★${star + 1}</small></div>
    <div class="muted">★${star + 1}: 체력·공격 +${(star + 1) * 20}%, 골드 +${(star + 1) * 30}% · 재료 ${mats.length}/2마리</div>
    <button class="btn small ${ok ? 'green' : ''}" data-act="starFuse" data-uid="${m.uid}" ${ok ? '' : 'disabled'}>⭐ 합성 (💰 ${shortNum(starCost(m))})</button>
  </div>`;
}
function removeMons(list) {
  const ids = new Set(list.map(x => x.uid));
  list.forEach(x => (x.runes || []).forEach(id => { const r = S.runes.find(q => q.id === id); if (r) r.on = null; }));
  S.monsters = S.monsters.filter(x => !ids.has(x.uid));
  S.team = S.team.filter(u => !ids.has(u));
  sel = sel.filter(u => !ids.has(u));
}
function starFuse(uid) {
  const m = byUid(uid);
  if (!m || (m.star || 0) >= STAR_MAX) return;
  const mats = starMats(m).slice(0, 2);
  if (mats.length < 2) { toast('같은 몬스터가 2마리 더 있어야 해요'); return; }
  if (mats.some(x => S.team.includes(x.uid)) && !confirm('재료 중에 모험 팀 몬스터가 있어요. 그래도 합칠까요?')) return;
  if (!spend(starCost(m))) return;
  removeMons(mats);
  m.star = (m.star || 0) + 1;
  S.fuseCount = (S.fuseCount || 0) + 1;
  mission('breed');
  sfx('yay'); save(); updateHud();
  toast(`⭐ ${CAT[m.type].name} ★${m.star}! 더 강해졌어요`);
  render();
  openMon(m.uid);
}
// 별 합성할 수 있는 종류들 (같은 몬스터 3마리 이상)
function starReady() {
  const by = {};
  S.monsters.forEach(m => { (by[m.type] = by[m.type] || []).push(m); });
  return Object.values(by).filter(l => l.length >= 3 && l.some(m => (m.star || 0) < STAR_MAX)).map(l => l.slice().sort((a, b) => (b.star || 0) - (a.star || 0) || b.lv - a.lv)[0]);
}
function openStarList() {
  tutFlag('star', true);
  const list = starReady();
  showModal(`<h3>⭐ 별 합성</h3>
    <p class="muted">같은 몬스터가 3마리 이상 있으면, 한 마리에 나머지 2마리를 합쳐 <b>별 ★</b>을 올려요.<br>별마다 체력·공격 +20%, 골드 +30% (최대 ★5)</p>
    ${list.length ? `<div class="grid small">${list.map(m => card(m, `data-act="openMon" data-uid="${m.uid}"`, 'mini', `<div class="price-tag">${S.monsters.filter(x => x.type === m.type).length}마리</div>`)).join('')}</div>`
      : '<p class="muted">지금은 같은 몬스터가 3마리 이상인 게 없어요. 교배로 모아 봐요!</p>'}
    <div class="row"><button class="btn ghost small" data-act="close">닫기</button></div>`);
  backTo(openStarList);
}

// 🔮 합성 제단: 같은 등급 5마리 → 한 단계 위 등급 1마리 (재료와 속성이 겹칠수록 잘 나온다)
const ALTAR_N = 5;
const ALTAR_RANKS = RAR_ORDER.slice(0, RANK.legendary + 1);   // 일반 ~ 전설 (→ 신화까지)
let altarRank = 'common', altarSel = [];
const altarNext = (rk) => RAR_ORDER[RANK[rk] + 1];
const altarCost = (rk) => RAR[altarNext(rk)].cost * 5;
function altarCands(rk) {
  return S.monsters.filter(m => CAT[m.type].rarity === rk)
    .sort((a, b) => (S.team.includes(a.uid) - S.team.includes(b.uid)) || (a.star || 0) - (b.star || 0) || a.lv - b.lv);
}
function openAltar(rk) {
  tutFlag('altar', true);
  if (rk && rk !== altarRank) { altarRank = rk; altarSel = []; }
  altarSel = altarSel.filter(u => byUid(u) && CAT[byUid(u).type].rarity === altarRank);
  const cands = altarCands(altarRank), next = altarNext(altarRank);
  const counts = Object.fromEntries(ALTAR_RANKS.map(r => [r, S.monsters.filter(m => CAT[m.type].rarity === r).length]));
  showModal(`<h3>🔮 합성 제단</h3>
    <p class="muted">같은 등급 몬스터 <b>${ALTAR_N}마리</b>를 바치면 <b>한 단계 위 등급</b> 몬스터 알이 나와요!<br>재료와 속성이 겹치는 몬스터가 더 잘 나와요.</p>
    <div class="chips">${ALTAR_RANKS.map(r => `<button class="chip ${r === altarRank ? 'on' : ''}" data-act="altarRank" data-r="${r}" style="--rc:${RAR[r].color}">${RAR[r].name} <small>${counts[r]}</small></button>`).join('')}</div>
    <div class="altar-flow"><span style="color:${RAR[altarRank].color}">${RAR[altarRank].name} ×${ALTAR_N}</span> ➜ <b style="color:${RAR[next].color}">${RAR[next].name} ×1</b></div>
    <div class="altar-slots">${Array.from({ length: ALTAR_N }, (_, k) => { const m = byUid(altarSel[k]); return `<div class="altar-slot ${m ? 'on' : ''}">${m ? CAT[m.type].face : '?'}</div>`; }).join('')}</div>
    <div class="row">
      <button class="btn small" data-act="altarAuto" ${cands.length >= ALTAR_N ? '' : 'disabled'}>✨ 자동 채우기 (약한 것부터)</button>
      <button class="btn small ghost" data-act="altarClear" ${altarSel.length ? '' : 'disabled'}>비우기</button>
    </div>
    <div class="grid small altar-grid">${cands.length ? cands.map(m => card(m, `data-act="altarPick" data-uid="${m.uid}"`, `mini ${altarSel.includes(m.uid) ? 'sel' : ''}`, S.team.includes(m.uid) ? '<div class="price-tag">⚔️ 팀</div>' : '')).join('') : `<p class="muted">${RAR[altarRank].name} 몬스터가 없어요</p>`}</div>
    <div class="row"><button class="btn big green" data-act="altarFuse" ${altarSel.length === ALTAR_N ? '' : 'disabled'}>🔮 합성하기 (💰 ${shortNum(altarCost(altarRank))})</button><button class="btn ghost small" data-act="close">닫기</button></div>`);
}
function altarPick(uid) {
  uid = Number(uid);
  if (altarSel.includes(uid)) altarSel = altarSel.filter(u => u !== uid);
  else if (altarSel.length < ALTAR_N) altarSel.push(uid);
  else { toast(`${ALTAR_N}마리까지만 넣을 수 있어요`); return; }
  const box = $('#modalBox'), y = box.scrollTop;
  openAltar(); box.scrollTop = y;
}
function altarAuto() {
  altarSel = altarCands(altarRank).filter(m => !S.team.includes(m.uid)).slice(0, ALTAR_N).map(m => m.uid);
  if (altarSel.length < ALTAR_N) altarSel = altarCands(altarRank).slice(0, ALTAR_N).map(m => m.uid);
  openAltar();
}
function altarFuse() {
  const mats = altarSel.map(byUid).filter(Boolean);
  if (mats.length !== ALTAR_N || mats.some(m => CAT[m.type].rarity !== altarRank)) return;
  if (S.hatch.length >= hatchCap()) { toast('부화장이 가득 찼어요! 먼저 부화시켜 주세요'); return; }
  if (mats.some(m => S.team.includes(m.uid)) && !confirm('재료 중에 모험 팀 몬스터가 있어요. 그래도 바칠까요?')) return;
  if (mats.some(m => (m.star || 0) > 0) && !confirm('재료 중에 별(★)이 있는 몬스터가 있어요. 그래도 바칠까요?')) return;
  if (!spend(altarCost(altarRank))) return;
  // 재료 속성과 겹칠수록 가중치 ↑
  const els = new Set(mats.flatMap(m => CAT[m.type].els));
  const pool = CAT_LIST.filter(c => c.rarity === altarNext(altarRank) && !c.shop);
  const w = pool.map(c => 1 + 3 * c.els.filter(e => els.has(e)).length);
  let r = Math.random() * w.reduce((a, b) => a + b, 0), pick = pool[0];
  for (let k = 0; k < pool.length; k++) { r -= w[k]; if (r <= 0) { pick = pool[k]; break; } }
  removeMons(mats);
  altarSel = [];
  S.altarCount = (S.altarCount || 0) + 1;
  S.hatch.push(pick.id);
  mission('breed');
  save(); updateHud(); render();
  sfx('yay');
  toast(`🔮 합성 성공! ${RAR[pick.rarity].name} 알이 나왔어요`);
  oldHatchReveal(S.hatch.length - 1);
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
      <span class="bo-ico">⬆️</span><span class="bo-nm">${habName(p.el)} Lv.${p.lv} → ${p.lv + 1} 올리고 넣기</span><span class="bo-cost">💰 ${shortNum(habUpCost(p.lv))}</span>
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
    <div class="fuse-bar">
      <button class="btn fuse-btn" data-act="altar"><span>🔮</span><b>합성 제단</b><small>같은 등급 ${ALTAR_N}마리 → 한 등급 위</small></button>
      <button class="btn fuse-btn star ${starReady().length ? 'ready' : ''}" data-act="starList"><span>⭐</span><b>별 합성</b><small>${starReady().length ? `지금 ${starReady().length}종류 가능!` : '같은 몬스터 3마리 → ★+1'}</small></button>
    </div>
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
// ===================== 🛒 상점 칸(탭) + 새 물건 =====================
const SHOP_TABS = [
  { id: 'build', name: '🏠 건물',      secs: ['shopHab', 'shopDeco'] },
  { id: 'egg',   name: '🥚 알',        secs: ['shopEgg', 'shopEgg2', 'shopAll', 'shopBox', 'shopLegend'] },
  { id: 'deal',  name: '🎁 특가·상자', secs: ['shopDeals', 'shopMystery'] },
  { id: 'item',  name: '🧪 아이템',    secs: ['shopPotion', 'shopExtra', 'shopItems', 'shopExch', 'shopRunes'] },
  { id: 'power', name: '🏛️ 강해지기',  secs: ['shopKingdom', 'shopWonder', 'shopCosmos', 'shopCloner'] },
  { id: 'gem',   name: '💎 보석',      secs: ['shopGem'] },
];
let shopTab = 'build';
const shopTabOf = (secId) => (SHOP_TABS.find(t => t.secs.includes(secId)) || SHOP_TABS[0]).id;
// 칸을 보면 "둘러봤다" (튜토리얼)
const SHOP_TAB_FLAGS = { deal: ['deals'], item: ['potion'], power: ['kingdom', 'cosmos', 'cloner'], gem: ['bigshop'] };
function shopTabsHTML() {
  return `<div class="shop-nav shop-tabs">${SHOP_TABS.map(t => `<button class="chip ${shopTab === t.id ? 'on' : ''}" data-act="shopJump" data-tab="${t.id}" data-id="${t.secs[0]}">${t.name}</button>`).join('')}</div>`;
}
// 다 그린 상점 화면에서 지금 칸에 속하지 않는 부분은 숨긴다
function shopApplyTab() {
  const t = SHOP_TABS.find(x => x.id === shopTab) || SHOP_TABS[0];
  let sec = null;
  [...view.children].forEach(el => {
    if (el.classList.contains('sec-head') || el.classList.contains('shop-nav')) return;
    if (el.tagName === 'H3' && el.id) sec = el.id;
    el.style.display = sec && !t.secs.includes(sec) ? 'none' : '';
  });
  (SHOP_TAB_FLAGS[t.id] || []).forEach(f => tutFlag(f, true));
}

// ----- 🎁 미스터리 상자 -----
const mysteryGoldCost = () => Math.max(5000, Math.round(totalIncome() * 600));
const MYSTERY_GEMS = 30;
function mysteryHTML() {
  return `<h3 class="sub" id="shopMystery">🎁 미스터리 상자 <small class="muted">무엇이 나올지 몰라요! 열어 봐요</small></h3>
    <div class="mystery-row">
      <button class="mystery-box" data-act="buyMystery" data-k="gold"><span>🎁</span><b>골드 상자</b><small>골드 · 먹이 · 룬 · 알 · 💎</small><i>💰 ${shortNum(mysteryGoldCost())}</i></button>
      <button class="mystery-box gem" data-act="buyMystery" data-k="gem"><span>💝</span><b>보석 상자</b><small>💎 많이 · 서사/전설 알 · ★★★ 룬 · 펫 알</small><i>💎 ${MYSTERY_GEMS}</i></button>
    </div>`;
}
function pickW(list) { let r = Math.random() * list.reduce((s, x) => s + x[0], 0); for (const x of list) { r -= x[0]; if (r <= 0) return x[1]; } return list[list.length - 1][1]; }
function mysteryEgg(ranks) {
  if (S.hatch.length >= hatchCap()) { earn(10, 'gems'); return '💎 10 (부화장이 가득 차서)'; }
  const rk = ranks[Math.floor(Math.random() * ranks.length)];
  const pool = CAT_LIST.filter(c => c.rarity === rk && !c.shop), c = pool[Math.floor(Math.random() * pool.length)];
  S.hatch.push(c.id);
  return `🥚 ${c.face} ${c.name} 알 (${RAR[rk].name})`;
}
function buyMystery(k) {
  let got = '';
  if (k === 'gold') {
    const cost = mysteryGoldCost();
    if (!spend(cost)) return;
    got = pickW([
      [40, () => { const g = Math.round(cost * (0.5 + Math.random() * 2.5)); earn(g); return `💰 ${shortNum(g)}`; }],
      [20, () => { const f = Math.max(500, Math.round(totalIncome() * 120)); earn(f, 'food'); return `🍖 ${shortNum(f)}`; }],
      [15, () => '💠 ' + runeText(giveRune([0.5, 0.4, 0.1]))],
      [15, () => mysteryEgg(['rare', 'special', 'masterwork', 'hero'])],
      [10, () => { const n = 5 + Math.floor(Math.random() * 16); earn(n, 'gems'); return `💎 ${n}`; }],
    ])();
  } else {
    if (!spend(MYSTERY_GEMS, 'gems')) return;
    got = pickW([
      [30, () => { const n = 10 + Math.floor(Math.random() * 71); earn(n, 'gems'); return `💎 ${n}`; }],
      [25, () => mysteryEgg(['epic'])],
      [10, () => mysteryEgg(['legendary'])],
      [20, () => '💠 ' + runeText(giveRune([0, 0, 1]))],
      [10, () => { const g = Math.max(20000, Math.round(totalIncome() * 3600)); earn(g); return `💰 ${shortNum(g)}`; }],
      [5, () => { setTimeout(() => petEgg('premium', true), 1200); return '🌟 고급 펫 알!'; }],
    ])();
  }
  statAdd('mystery', 1);
  sfx('yay'); save(); updateHud();
  showModal(`<div class="mystery-open"><div class="mo-box">${k === 'gem' ? '💝' : '🎁'}</div><h3>상자를 열었어요!</h3><p class="mo-got">${got}</p>
    <div class="row"><button class="btn green" data-act="buyMystery" data-k="${k}">한 번 더 (${k === 'gem' ? `💎 ${MYSTERY_GEMS}` : `💰 ${shortNum(mysteryGoldCost())}`})</button><button class="btn ghost small" data-act="close">닫기</button></div></div>`);
}

// ----- 🛒 더 많은 아이템 -----
const BUY_DAY_MAX = 3;
const buyDay = () => (S.buyDay && S.buyDay.day === dayKey() ? S.buyDay : (S.buyDay = { day: dayKey(), raid: 0, gwar: 0 }));
const baitCost = () => Math.max(2000, Math.round(totalIncome() * 60));
function shopExtraHTML() {
  const d = buyDay();
  const it = (act, k, ico, name, sub, cost, dis) => `<button class="shop-item" data-act="${act}" data-k="${k}" ${dis ? 'disabled' : ''}><span class="si-ico">${ico}</span><span class="si-nm">${name}<small>${sub}</small></span><span class="si-cost">${cost}</span></button>`;
  return `<h3 class="sub" id="shopExtra">🛒 더 많은 아이템</h3>
    <div class="shop">
      ${it('buyExtra', 'bait', '🪱', '낚시 미끼 ×10', `지금 미끼 ${fishBait()}개`, `💰 ${shortNum(baitCost())}`)}
      ${it('buyExtra', 'food10k', '🍖', '먹이 10,000개', '1,000개 10묶음보다 싸요', '💰 13,000')}
      ${it('buyExtra', 'tix', '🎟️', '미니게임 티켓 ×5', `무료 판을 다 쓰면 💎 대신 써요 (지금 ${S.mgTix || 0}장)`, '💎 10')}
      ${it('buyExtra', 'raid', '🔥', '레이드 도전권 +1', `오늘의 레이드 한 번 더 (오늘 ${d.raid}/${BUY_DAY_MAX})`, '💎 20', d.raid >= BUY_DAY_MAX || !S.monsters.length)}
      ${S.guild ? it('buyExtra', 'gwar', '⚔️', '길드전 공격권 +1', `길드전 한 번 더 (오늘 ${d.gwar}/${BUY_DAY_MAX})`, '💎 15', d.gwar >= BUY_DAY_MAX) : ''}
      ${it('buyExtra', 'runes10', '📦', '룬 상자 ×10', '룬 상자 10개 묶음 (10% 할인)', '💰 9,000')}
    </div>`;
}
function buyExtra(k) {
  const d = buyDay();
  if (k === 'bait') { if (!spend(baitCost())) return; fishBait(); S.fish.bait += 10; toast('🪱 미끼 10개!'); }
  else if (k === 'food10k') { if (!spend(13000)) return; earn(10000, 'food'); toast('🍖 먹이 10,000개!'); }
  else if (k === 'tix') { if (!spend(10, 'gems')) return; S.mgTix = (S.mgTix || 0) + 5; toast(`🎟️ 미니게임 티켓 5장! (모두 ${S.mgTix}장)`); }
  else if (k === 'raid') {
    if (d.raid >= BUY_DAY_MAX || !S.monsters.length) return;
    const r = raidToday();
    if (r.hp <= 0) { toast('오늘 레이드 보스는 이미 쓰러졌어요!'); return; }
    if (!spend(20, 'gems')) return;
    r.tries++; d.raid++; toast('🔥 레이드 도전 +1!');
  } else if (k === 'gwar') {
    if (!S.guild || d.gwar >= BUY_DAY_MAX) return;
    if (!spend(15, 'gems')) return;
    gwarToday().left++; d.gwar++; toast('⚔️ 길드전 공격 +1!');
  } else if (k === 'runes10') {
    if (!spend(9000)) return;
    const got = [...Array(10)].map(() => giveRune([0.7, 0.25, 0.05]));
    toast('📦 룬 10개! ' + got.filter(r => r.lv >= 2).map(runeText).join(' · '));
  }
  sfx('buy'); save(); updateHud();
  const p = $('#panel'), y = p ? p.scrollTop : 0; render(); if (p) $('#panel').scrollTop = y;
}

// 알 상점에서 "아직 없는 몬스터"와 "이미 있는 몬스터"를 나눠 보여 준다 (부화장에 있는 알도 "있음")
// 사는 값 (알 상점 · 혼합 알)
const buyAllPrice = (kind, t) => (kind === 'hyb' ? Math.round(HYB_EGG_PRICE * (evtOn('hatchfest') ? 0.5 : 1)) : eggPrice(t));
const buyAllList = (kind) => {
  const own = new Set([...S.monsters.map(m => m.type), ...S.hatch]);
  const types = kind === 'hyb' ? HYB_EGGS.filter(t => hybEggEl === 'all' || CAT[t].els.includes(hybEggEl)) : EGG_SHOP;
  return types.filter(t => !own.has(t));
};
function buyAllMons(kind) {
  tutFlag('buyAll', true);
  const list = buyAllList(kind);
  if (!list.length) { toast('🎉 이미 모두 가지고 있어요!'); return; }
  const cost = list.reduce((s, t) => s + buyAllPrice(kind, t), 0);
  if (!confirm(`🛒 없는 몬스터 ${list.length}마리를 모두 살까요?\n💰 ${shortNum(cost)}`)) return;
  if (!spend(cost)) return;
  S.hatch.push(...list);     // 한꺼번에 살 때는 부화장 칸 수를 넘어도 괜찮아요 → 바로 부화
  list.forEach(() => mission('buyEgg'));
  sfx('buy');
  toast(`🛒 ${list.length}마리를 샀어요! 바로 부화시킬게요`);
  hatchAll();
}
function ownSplitHTML(types, cardFn, kind) {
  const own = new Set([...S.monsters.map(m => m.type), ...S.hatch]);
  const no = types.filter(t => !own.has(t)), yes = types.filter(t => own.has(t));
  const allBtn = kind && no.length ? `<button class="btn green buy-all" data-act="buyAllMons" data-kind="${kind}">🛒 없는 몬스터 전부 사기 (${no.length}마리 · 💰 ${shortNum(no.reduce((s, t) => s + buyAllPrice(kind, t), 0))})</button>` : '';
  return (no.length ? `<h4 class="own-h new">🆕 아직 없는 몬스터 <small>${no.length}종</small></h4>${allBtn}<div class="grid small">${no.map(cardFn).join('')}</div>` : '<p class="muted own-all">🎉 여기 있는 몬스터는 모두 가지고 있어요!</p>')
    + (yes.length ? `<h4 class="own-h">✅ 이미 있는 몬스터 <small>${yes.length}종</small></h4><div class="grid small">${yes.map(cardFn).join('')}</div>` : '');
}
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
    <div class="sec-head"><h2>상점</h2><p>서식지와 알은 여기서! 특가·물약·왕국 발전·보석 상점도 있어요.</p></div>
    ${shopTabsHTML()}
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
    ${everyEggBtn()}
    ${ownSplitHTML(EGG_SHOP, t => card({ type: t, lv: 1 }, `data-act="buyMon" data-type="${t}"`, 'mini',
      `<div class="price-tag">💰 ${fmt(eggPrice(t))}</div>`), 'egg')}
    ${moreEggsHTML()}
    ${shopMoreHTML()}
    ${mysteryHTML()}
    ${shopExtraHTML()}
    ${kingdomShopHTML()}
    <h3 class="sub" id="shopItems">🛍️ 룬 · 먹이 · 골드</h3>
    <div class="shop">
      <button class="shop-item" data-act="buyRune" data-kind="gold"><span class="si-ico">📦</span><span class="si-nm">룬 상자<small>★ 70% · ★★ 25% · ★★★ 5%</small></span><span class="si-cost">💰 1,000</span></button>
      <button class="shop-item" data-act="buyRune" data-kind="gem"><span class="si-ico">🎁</span><span class="si-nm">고급 룬 상자<small>★★ 60% · ★★★ 40%</small></span><span class="si-cost">💎 20</span></button>
      <button class="shop-item" data-act="buyFood" data-n="100"><span class="si-ico">🍖</span><span class="si-nm">먹이 100개</span><span class="si-cost">💰 150</span></button>
      <button class="shop-item" data-act="buyFood" data-n="1000"><span class="si-ico">🍖</span><span class="si-nm">먹이 1,000개</span><span class="si-cost">💰 1,500</span></button>
      <button class="shop-item" data-act="buyGold" data-n="5"><span class="si-ico">💰</span><span class="si-nm">골드 500</span><span class="si-cost">💎 5</span></button>
      <button class="shop-item" data-act="buyGold" data-n="50"><span class="si-ico">💰</span><span class="si-nm">골드 6,000</span><span class="si-cost">💎 50</span></button>
    </div>
    <h3 class="sub" id="shopDeco">🎨 섬 꾸미기 <small class="muted">장식을 놓으면 그 섬 서식지 골드가 올라요 (섬마다 최대 +${DECO_CAP}%) · 지금 섬 +${decoPercent(S.isl || 0)}%</small></h3>
    <div class="grid small">${DECOS.filter(d => !d.wonder).map(d => `<div class="card mini hab-card" data-act="buyDeco" data-id="${d.id}">
        <div class="price-tag">${decoPrice(d)}</div>
        <div class="face" style="background:linear-gradient(135deg, #ff9ad5, #1a1a3d)">${d.emoji}</div>
        <div class="nm">${d.name}</div>
        <div class="meta">골드 +${d.bonus}%</div>
      </div>`).join('')}</div>
    <h3 class="sub" id="shopLegend">👑 전설 상점<small class="muted">골드로 살 수 있어요… 모을 수만 있다면요</small></h3>
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
    <h3 class="sub" id="shopRunes">💠 내 룬 <small class="muted">같은 룬 3개를 합성하면 한 단계 위 룬이 돼요</small>
      <button class="btn small" data-act="mergeAll" ${list.some(g => g.free >= 3 && g.lv < 3) ? '' : 'disabled'}>✨ 모두 합성</button></h3>
    <div class="rune-inv">${list.length ? list.map(g => `
      <div class="rune-row">
        <span>${runeText(g)}</span>
        <span class="muted">${g.total}개 (장착 ${g.total - g.free})</span>
        <button class="btn small" data-act="merge" data-t="${g.t}" data-lv="${g.lv}" ${g.free >= 3 && g.lv < 3 ? '' : 'disabled'}>합성</button>
      </div>`).join('') : '<p class="muted">아직 룬이 없어요.</p>'}</div>`;
  shopApplyTab();
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
    <div class="build-list">${DECOS.filter(d => !d.wonder).map(d => `
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
const SPECIAL_EGGS = ['p:ice', 'p:metal', 'p:magic', ...EL.slice(EL_OLD_N).map(e => 'p:' + e.id)];
const EGG_SHOP = [...BASE.map(e => 'p:' + e), ...SPECIAL_EGGS];
const eggPrice = () => Math.round(MON_PRICE * (evtOn('hatchfest') ? 0.5 : 1));
// 🧬 혼합 몬스터 알: 두 속성 조합마다 대표 몬스터 (55종)
const HYB_EGGS = PAIRS.map(([i, j]) => `h:${EL[i].id}+${EL[j].id}`);
const HYB_EGG_PRICE = 1500;
// 🎲 등급 알 상자: 고른 등급의 몬스터가 무작위로
const RANK_BOXES = [
  { r: 'rare', cost: 20000 }, { r: 'special', cost: 60000 }, { r: 'masterwork', cost: 180000 }, { r: 'hero', cost: 540000 },
  { r: 'epic', cost: 1.6e6 }, { r: 'legendary', cost: 5e7 }, { r: 'mythic', cost: 5e9 },
];
let hybEggEl = 'all';
function buyRankBox(r) {
  const box = RANK_BOXES.find(x => x.r === r);
  if (!box) return;
  if (S.hatch.length >= hatchCap()) { toast('부화장이 가득 찼어요! 먼저 부화시켜 주세요'); return; }
  if (!spend(Math.round(box.cost * (evtOn('hatchfest') ? 0.5 : 1)))) return;
  const pool = CAT_LIST.filter(c => c.rarity === r && !c.shop);
  const c = pool[Math.floor(Math.random() * pool.length)];
  S.hatch.push(c.id);
  sfx('buy'); mission('buyEgg'); save(); updateHud();
  toast(`🎲 ${RAR[r].name} 알: ${c.face} ${c.name}!${S.dex[c.id] ? '' : ' (도감에 없는 몬스터!)'}`);
  render();
  openHatchery();
}
// 📚 모든 몬스터 상점: 게임에 있는 몬스터 전부를 등급 · 속성 · 이름으로 찾아서 산다
const ALL_SHOP = { r: 'all', el: 'all', q: '', own: 'no', page: 0 };
const ALL_PER = 48, ALL_BULK = 1000;
const anyPrice = (t) => Math.round(300 * Math.pow(3, RANK[CAT[t].rarity]) * (evtOn('hatchfest') ? 0.5 : 1));
function allShopList() {
  const own = new Set([...S.monsters.map(m => m.type), ...S.hatch]), q = ALL_SHOP.q.trim();
  return CAT_LIST.filter(c => (ALL_SHOP.r === 'all' || c.rarity === ALL_SHOP.r) && (ALL_SHOP.el === 'all' || c.els.includes(ALL_SHOP.el))
    && (!q || c.name.includes(q)) && (ALL_SHOP.own === 'all' || (ALL_SHOP.own === 'yes') === own.has(c.id))).map(c => c.id);
}
const allShopMissing = () => { const own = new Set([...S.monsters.map(m => m.type), ...S.hatch]); return allShopList().filter(t => !own.has(t)); };
function allShopHTML() {
  const list = allShopList(), pages = Math.max(1, Math.ceil(list.length / ALL_PER));
  ALL_SHOP.page = Math.max(0, Math.min(ALL_SHOP.page, pages - 1));
  const show = list.slice(ALL_SHOP.page * ALL_PER, (ALL_SHOP.page + 1) * ALL_PER);
  const miss = ALL_SHOP.own === 'yes' ? [] : allShopMissing(), bulk = miss.slice(0, ALL_BULK);
  const chip = (k, v, label) => `<button class="chip ${ALL_SHOP[k] === v ? 'on' : ''}" data-act="allShopSet" data-k="${k}" data-v="${v}">${label}</button>`;
  return `<h3 class="sub" id="shopAll">📚 모든 몬스터 상점 <small class="muted">게임에 있는 몬스터 ${fmt(CAT_LIST.length)}마리를 전부 살 수 있어요</small></h3>
    <div class="all-shop">
      <div class="chips">${chip('own', 'no', '🆕 없는 몬스터')}${chip('own', 'yes', '✅ 있는 몬스터')}${chip('own', 'all', '📚 전체')}</div>
      <div class="chips">${chip('r', 'all', '모든 등급')}${RAR_ORDER.map(r => chip('r', r, RAR[r].name)).join('')}</div>
      <div class="chips">${chip('el', 'all', '모든 속성')}${EL.map(e => chip('el', e.id, e.emoji)).join('')}</div>
      <div class="row as-search"><input id="allShopQ" placeholder="이름으로 찾기 (예: 드래곤)" value="${esc(ALL_SHOP.q)}" autocomplete="off"><button class="btn small" data-act="allShopFind">🔍 찾기</button></div>
      <p class="muted">${fmt(list.length)}마리 · ${ALL_SHOP.page + 1} / ${pages}쪽</p>
      ${bulk.length ? `<button class="btn green buy-all" data-act="allShopBuyAll">🛒 이 목록의 없는 몬스터 전부 사기 (${fmt(bulk.length)}마리 · 💰 ${shortNum(bulk.reduce((s, t) => s + anyPrice(t), 0))})${miss.length > ALL_BULK ? ` · 한 번에 ${ALL_BULK}마리씩` : ''}</button>` : ''}
      ${show.length ? `<div class="grid small">${show.map(t => card({ type: t, lv: 1 }, `data-act="buyAny" data-type="${t}"`, 'mini', `<div class="price-tag">💰 ${shortNum(anyPrice(t))}</div>`)).join('')}</div>` : '<p class="muted">찾는 몬스터가 없어요</p>'}
      <div class="row as-pages"><button class="btn small ghost" data-act="allShopPage" data-d="-10">⏪</button><button class="btn small" data-act="allShopPage" data-d="-1">◀</button><b>${ALL_SHOP.page + 1} / ${pages}</b><button class="btn small" data-act="allShopPage" data-d="1">▶</button><button class="btn small ghost" data-act="allShopPage" data-d="10">⏩</button></div>
    </div>`;
}
// 상점을 다시 그려도 보던 자리 그대로
function allShopRedraw() {
  const p = $('#panel'), py = p ? p.scrollTop : 0, wy = window.scrollY;
  render();
  if (p) p.scrollTop = py; window.scrollTo(0, wy);
}
function buyAny(type) {
  tutFlag('allShop', true);
  if (!CAT[type]) return;
  if (S.hatch.length >= hatchCap()) { toast('부화장이 가득 찼어요! 먼저 부화시켜 주세요 (또는 🛒 전부 사기)'); return; }
  if (!spend(anyPrice(type))) return;
  S.hatch.push(type);
  sfx('buy'); mission('buyEgg'); save();
  toast(`🥚 ${CAT[type].name} 알을 샀어요! 부화장에 있어요`);
  allShopRedraw(); updateHud();
}
// 게임에 있는 몬스터 중 아직 없는 것을 전부 (1000마리 제한 없이)
function missingAll() {
  const own = new Set([...S.monsters.map(m => m.type), ...S.hatch]);
  return CAT_LIST.filter(c => !c.shop && !own.has(c.id)).map(c => c.id);
}
function buyEveryEgg() {
  tutFlag('allShop', true);
  const list = missingAll();
  if (!list.length) { toast('🎉 모든 몬스터를 이미 가지고 있어요!'); return; }
  const cost = list.reduce((s, t) => s + anyPrice(t), 0);
  if (!confirm(`🥚 아직 없는 몬스터 ${fmt(list.length)}마리의 알을 모두 살까요?\n💰 ${shortNum(cost)}\n\n산 알은 바로 부화해서 알맞은 서식지로 가요.`)) return;
  if (!spend(cost)) return;
  mission('buyEgg', list.length);
  const r = fastPlace(list);
  S.hatch.push(...r.stuck);
  sfx('yay');
  save(); render(); updateHud();
  showModal(`<h3>🥚 모든 알 사기 완료!</h3>
    <p>🐣 ${fmt(r.n)}마리가 서식지로 이사했어요! 🆕 도감 ${fmt(r.news)}마리</p>
    ${r.stuck.length ? `<p class="warn">🪺 ${fmt(r.stuck.length)}마리는 살 곳이 없어서 부화장에서 기다려요.</p>
      <div class="row"><button class="btn green" data-act="makeRoom">🏠 남은 알 살 곳 만들기</button></div>` : '<p class="muted">🎉 모든 몬스터가 살 곳을 찾았어요!</p>'}
    <div class="row"><button class="btn ghost" data-act="close">좋아!</button></div>`);
}
const everyEggBtn = () => { const n = missingAll().length; return n ? `<button class="btn green buy-all every-egg" data-act="buyEveryEgg">🥚 모든 알 사기 (없는 몬스터 ${fmt(n)}마리 전부 · 💰 ${shortNum(missingAll().reduce((s, t) => s + anyPrice(t), 0))})</button>` : ''; };
function allShopBuyAll() {
  tutFlag('allShop', true);
  tutFlag('buyAll', true);
  const list = allShopMissing().slice(0, ALL_BULK);
  if (!list.length) { toast('🎉 이미 모두 가지고 있어요!'); return; }
  const cost = list.reduce((s, t) => s + anyPrice(t), 0);
  if (!confirm(`🛒 없는 몬스터 ${list.length}마리를 모두 살까요?\n💰 ${shortNum(cost)}`)) return;
  if (!spend(cost)) return;
  S.hatch.push(...list);
  mission('buyEgg', list.length);
  sfx('buy');
  toast(`🛒 ${list.length}마리를 샀어요! 바로 부화시킬게요`);
  hatchAll();
}
function moreEggsHTML() {
  const disc = evtOn('hatchfest') ? 0.5 : 1;
  const list = HYB_EGGS.filter(t => hybEggEl === 'all' || CAT[t].els.includes(hybEggEl));
  return `<h3 class="sub" id="shopEgg2">🧬 혼합 몬스터 알 <small class="muted">두 속성 몬스터 ${HYB_EGGS.length}종 · 속성 서식지 둘 중 하나에 살아요</small></h3>
    <div class="chips">${[['all', '전체'], ...EL.map(e => [e.id, e.emoji])].map(([id, t]) => `<button class="chip ${hybEggEl === id ? 'on' : ''}" data-act="hybEggEl" data-e="${id}">${t}</button>`).join('')}</div>
    ${ownSplitHTML(list, t => card({ type: t, lv: 1 }, `data-act="buyMon" data-type="${t}"`, 'mini', `<div class="price-tag">💰 ${fmt(HYB_EGG_PRICE * disc)}</div>`), 'hyb')}
    ${allShopHTML()}
    <h3 class="sub" id="shopBox">🎲 등급 알 상자 <small class="muted">고른 등급의 몬스터가 무작위로! 도감 채우기에 딱</small></h3>
    <div class="rank-boxes">${RANK_BOXES.map(b => `<button class="rank-box" data-act="buyRankBox" data-r="${b.r}" style="--rc:${RAR[b.r].color}">
        <span>🎲</span><b>${RAR[b.r].name} 알</b><small>${CAT_LIST.filter(c => c.rarity === b.r && !c.shop).length}종 중 하나</small><span class="rb-cost">💰 ${shortNum(b.cost * disc)}</span></button>`).join('')}</div>`;
}
function buyMon(type) {
  if (CAT[type] && HYB_EGGS.includes(type)) {
    if (S.hatch.length >= hatchCap()) { toast('부화장이 가득 찼어요! 먼저 부화시켜 주세요'); return; }
    if (!spend(Math.round(HYB_EGG_PRICE * (evtOn('hatchfest') ? 0.5 : 1)))) return;
    S.hatch.push(type);
    sfx('buy'); mission('buyEgg'); save();
    toast(`🥚 ${CAT[type].name} 알을 샀어요!`);
    render(); openHatchery();
    return;
  }
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
const ENEMY_POOLS = { n: -1, p: {} };
function enemyTeam(stage) {
  let seed = stage * 7919 + 13;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const tier = Math.min(RANK.mythic, Math.floor((stage - 1) / 2));
  const res = [];
  const count = stage === 1 ? 1 : stage === 2 ? 2 : 3;
  for (let i = 0; i < count; i++) {
    const ri = Math.max(0, tier - (rnd() < 0.35 ? 1 : 0));
    if (ENEMY_POOLS.n !== CAT_LIST.length) { ENEMY_POOLS.n = CAT_LIST.length; ENEMY_POOLS.p = {}; }
    const pool = ENEMY_POOLS.p[ri] || (ENEMY_POOLS.p[ri] = CAT_LIST.filter(c => c.rarity === RAR_ORDER[ri]));
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
      <div class="row"><button class="btn green" data-act="teamAuto" ${S.monsters.length ? '' : 'disabled'}>⚡ 자동 편성</button><button class="btn big" data-act="fight" ${team.length ? '' : 'disabled'}>⚔️ 전투 시작</button></div>
      <div class="row"><button class="btn loop-btn" data-act="fightLoop" ${team.length ? '' : 'disabled'}>🔁 연속 전투<small>이기면 다음 스테이지로 자동으로 계속! (자동 전투)</small></button></div>
    </div>
    <div class="stage-box pvp-box">
      <h3>👥 대전 · 친구</h3>
      <p class="muted"><b>🌍 랜덤 대전</b>으로 모르는 사람과 바로 싸우거나, 친구와 방 코드로 싸우고 선물·섬 구경도 해요.</p>
      <div class="friend-grid">
        <button class="btn big-rnd" data-act="pvpRandom">🌍 랜덤 대전<small>모르는 사람과 바로 매칭! 이기면 🏆 +${TROPHY_WIN}</small></button>
        <button class="btn guild-btn" data-act="guildOpen">🛡️ 길드<small>${S.guild ? `${esc(S.guild.emblem)} ${esc(S.guild.name)} · 골드 +${guildPct()}%` : '길드원과 함께 골드 보너스!'}</small></button>
        <button class="btn rank-btn" data-act="ranking">🏆 랭킹<small>${tierOf(S.trophies).icon} ${tierOf(S.trophies).name} · 🏆 ${fmt(S.trophies || 0)}</small></button>
        <button class="btn fr-btn" data-act="friends">👫 친구<small>${(S.friends || []).length}명 · 💌 하트 · ⚔️ 초대</small><span class="fr-dot" style="${frNewCount() ? '' : 'display:none'}">${frNewCount()}</span></button>
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

// 가장 센 몬스터 3마리로 팀 짜기
function teamAuto() {
  S.team = S.monsters.slice().sort((a, b) => monPower(b) - monPower(a)).slice(0, 3).map(m => m.uid);
  save();
  toast(`⚡ 가장 센 ${S.team.length}마리로 팀을 짰어요!`);
  const p = $('#panel'), y = p.scrollTop;
  renderAdventure();
  p.scrollTop = y;
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
  // 내 몬스터는 함께하는 펫의 전투 보너스를 받는다
  if (side === 'me') { st.atk = Math.round(st.atk * (1 + (petPct('atk') + kdLv('army') * 5 + cosLv('war') * 25 + (S.potBattleOn ? 30 : 0)) / 100)); st.hp = Math.round(st.hp * (1 + (petPct('hp') + kdLv('army') * 5 + cosLv('war') * 25) / 100)); }
  return {
    id: side + idx, side, c, lv: m.lv,
    maxHp: st.hp, hp: st.hp, dispHp: st.hp, shownDead: false,
    atk: st.atk, spd: st.spd, sta: 2,
    fx: { burn: 0, burnDmg: 0, poison: 0, poisonDmg: 0, stun: 0, shield: 0, buff: 0, curse: 0 },
  };
}
const aliveOf = (side) => B.units.filter(u => u.side === side && u.hp > 0);
const unitById = (id) => B.units.find(u => u.id === id);

// ----- 🔁 연속 전투: 이기면 잠깐 뒤 다음 스테이지를 자동으로 시작. 지거나 멈추기를 누르면 끝 -----
let LOOP = null;   // { wins, start, gold }
function openLoopStart() {
  if (!S.team.map(byUid).filter(Boolean).length) { toast('먼저 팀을 짜 주세요 (⚡ 자동 편성)'); return; }
  const cur = S.bSpeed || 1;
  showModal(`<div class="loop-start"><h3>🔁 연속 전투</h3>
    <p class="muted">몇 배속으로 할까요? 이기면 다음 스테이지로 자동으로 계속 싸워요. (전투 중에도 ⏩ 버튼으로 바꿀 수 있어요 · <b>Esc</b> 키로 나가기)</p>
    <div class="ls-grid">${SPEEDS_LOOP.map(sp => `<button class="ls-sp ${sp === cur ? 'on' : ''} ${sp >= 1000 ? 'hot' : ''}" data-act="loopGo" data-sp="${sp}">⏩ ${fmt(sp)}배</button>`).join('')}</div>
    <div class="row"><button class="btn ghost small" data-act="close">취소</button></div></div>`);
}
function startLoop() {
  tutFlag('loop', true);
  if (!S.team.map(byUid).filter(Boolean).length) { toast('먼저 팀을 짜 주세요 (⚡ 자동 편성)'); return; }
  LOOP = { wins: 0, start: S.stage, gold: S.gold };
  toast(tutFlag('speed') ? '🔁 연속 전투 시작! 지거나 ⏹ 멈추기를 누르면 끝나요' : '🔁 연속 전투 시작! 위쪽 ⏩ 배속 버튼으로 최대 10000배까지 · Esc 키로 나가기');
  startBattle();
}
function stopLoop(reason) {
  if (!LOOP) return;
  const l = LOOP;
  LOOP = null;
  save(); updateHud();
  toast(`⏹ 연속 전투 끝! ${l.wins}연승 (스테이지 ${l.start} → ${S.stage})${reason ? ' · ' + reason : ''}`);
  if (B) drawBattle();
}
function loopNext() {
  if (!LOOP || !B || !B.over || B.pvp || B.gwar || B.raid || B.bossIdx != null) return;
  if (!B.result.win) { stopLoop('패배'); return; }
  LOOP.wins++;
  clearTimeout(B.timer);
  B = null;
  if (bSpeed() < 250) $('#battle').classList.add('hidden');
  startBattle();
}

function startBattle() {
  const team = S.team.map(byUid).filter(Boolean);
  if (!team.length || B) return;
  potBattleStart();
  const foes = enemyTeam(S.stage);
  B = {
    stage: S.stage,
    units: [...team.map((m, i) => mkUnit(m, 'me', i)), ...foes.map((m, i) => mkUnit(m, 'foe', i))],
    order: [], cur: null, target: 'foe0', log: [], round: 0,
    waiting: false, over: false, fast: !!S.fastBattle, auto: !!S.autoBattle || !!LOOP, timer: null, result: null, built: false,
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
// 배속: 보통 전투 1·2·4배, 🔁 연속 전투는 10·25·50·100배까지
const SPEEDS_LOOP = [1, 2, 4, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000], SPEEDS = [1, 2, 4];
// 250배속부터는 타이머(최소 4ms)를 기다리지 않고 바로 다음 차례로 (화면이 멈추지 않게 한 번씩 숨은 쉬면서)
const FAST_Q = [], FAST_CH = new MessageChannel();
// 한 번 몰아서 일하는 시간(ms)을 정하고, 그 시간이 지나면 화면이 한 번 그려질 때까지 쉰다
// (쉬지 않고 계속 돌리면 화면이 멈추고 휴대폰에서는 튕긴다)
// 다음 화면 그릴 때 (화면 그리기가 멈춰 있어도 0.034초 뒤에는 꼭 실행)
function nextFrame(fn) { let done = false; const go = () => { if (done) return; done = true; fn(performance.now()); }; requestAnimationFrame(go); setTimeout(go, 34); }
let fastSliceStart = 0;
function fastPump() {
  const sp = typeof B !== 'undefined' && B ? bSpeed() : 0;
  const slice = sp >= 10000 ? 9 : sp >= 5000 ? 6 : sp >= 2500 ? 4 : 10, many = sp >= 2500;
  if (!fastSliceStart) fastSliceStart = performance.now();
  do { const f = FAST_Q.shift(); if (!f) break; try { f(); } catch (e) { console.error(e); } } while (many && FAST_Q.length && performance.now() - fastSliceStart < slice);
  if (!FAST_Q.length) { fastSliceStart = 0; return; }
  if (performance.now() - fastSliceStart >= slice) {
    fastSliceStart = 0;
    if (document.hidden) setTimeout(fastPump, 0); else nextFrame(fastPump);
  } else FAST_CH.port2.postMessage(0);
}
FAST_CH.port1.onmessage = fastPump;
function soon(fn) { FAST_Q.push(fn); if (FAST_Q.length === 1 && !fastSliceStart) FAST_CH.port2.postMessage(0); }
// clearTimeout(B.timer)로 "바로 진행" 예약도 취소되게
const _clearTimeout = window.clearTimeout.bind(window);
window.clearTimeout = (t) => { if (t && typeof t === 'object' && 'dead' in t) t.dead = true; else _clearTimeout(t); };
function bSpeed() {
  const s = S.bSpeed || (S.fastBattle ? 4 : 1);
  return LOOP ? s : Math.min(4, s);
}
function later(fn, ms = 800) {
  const sp = bSpeed();
  if (sp >= 250) { const b = B, job = { dead: false }; B.timer = job; soon(() => { if (!job.dead && B === b) fn(); }); return; }
  B.timer = setTimeout(fn, ms / sp);
}

// ----- 애니메이션 도우미 -----
// 25배속부터는 움직이는 장면을 건너뛴다 (너무 빨라서 안 보이니까)
const dur = (ms) => (B ? (bSpeed() >= 25 ? 0 : ms / bSpeed()) : ms);
const wait = (ms) => new Promise(r => { const d = dur(ms); if (d <= 0 && bSpeed() >= 250) soon(r); else setTimeout(r, d); });
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
  if (!$('#fxLayer') || (B && bSpeed() >= 25)) return;   // 25배속부터는 효과 글자 생략
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
  if (B && bSpeed() >= 25) return;   // 25배속부터는 달려드는 움직임 생략 (화면 위치를 재느라 느려져서)
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
  if (!$('#fxLayer') || (B && bSpeed() >= 25)) return;   // 25배속부터는 날아가는 효과 생략
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
  if (B && bSpeed() >= 25) return;
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
    // 🔥 레이드는 10라운드까지만
    if (b.raid && b.round > RAID_ROUNDS) { logB(`⏰ ${RAID_ROUNDS}라운드가 끝났어요!`); endBattle(false); return; }
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
  // 😡 보스 분노: 체력이 절반 아래가 되면 공격 +40%
  if (u.boss && u.c.enrage && !u.enraged && u.hp < u.maxHp / 2) {
    u.enraged = true;
    u.atk = Math.round(u.atk * 1.4);
    logB(`😡 ${u.c.name}이(가) 분노했어요! 공격력이 올라가요!`);
    if (typeof floatText === 'function') floatText(u, '😡 분노!', 'status');
  }
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
  if (u.side === 'me' && u.remote) {
    askRemote(u);
  } else if (u.side === 'me' && (u.aiCtl || (b.auto && (!b.pvp || b.coop)))) {
    drawBattle();
    later(() => { if (B === b && !b.over) aiAct(u); }, 450);
  } else if (u.side === 'me') {
    const t = unitById(b.target);
    if (!t || t.hp <= 0) b.target = aliveOf('foe')[0].id;
    b.waiting = true;
    drawBattle();
  } else if (b.pvp && !b.coop) {
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
    netSend({ t: 'act', i: Number(i), target: gflip(B.target) });
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
  if (B.pvp && B.coop) {
    rewards.push(...coopRewards(win));
    if (B.pvp.role === 'host') netSend({ t: 'end', hostWin: win });
  } else if (B.pvp) {
    if (win) { earn(PVP_REWARD.gold); earn(PVP_REWARD.gems, 'gems'); rewards.push(`💰 ${fmt(PVP_REWARD.gold)}`, `💎 ${PVP_REWARD.gems}`); }
        if (B.pvp.random) rewards.push(...pvpTrophy(win));
    if (B.pvp.role === 'host') netSend({ t: 'end', hostWin: win });
  } else if (B.gwar) rewards.push(...gwarResult(win));
  else if (B.raid) rewards.push(...raidResult(win));
  else if (B.bossIdx != null) rewards.push(...bossRewards(win));
  else if (win) {
    const gold = Math.round(stageGold(B.stage) * (evtOn('tourney') ? 2 : 1));
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
  const fastLoop = LOOP && bSpeed() >= 100;
  if (!fastLoop || performance.now() - lastLoopSave > 2000) { lastLoopSave = performance.now(); save(); }
  if (LOOP && !B.pvp && !B.gwar && !B.raid && B.bossIdx == null) {
    if (win) { const b = B; const go = () => { if (B === b && LOOP) loopNext(); }; if (bSpeed() >= 250) soon(go); else setTimeout(go, Math.max(60, 1600 / bSpeed())); }
    else { LOOP.wins = LOOP.wins; setTimeout(() => stopLoop('패배'), 300); }
  }
  drawBattle();
  if (!fastLoop || performance.now() - lastLoopHud > 250) { lastLoopHud = performance.now(); updateHud(); }
}
let lastLoopSave = 0, lastLoopHud = 0;

// Esc 키: 열린 창이 있으면 닫고, 전투 중이면 나간다 (연속 전투는 바로 멈추고 나가기)
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape' || e.isComposing) return;
  if (B) {
    e.preventDefault();
    if (LOOP || B.over) { if (LOOP) stopLoop('Esc'); clearTimeout(B.timer); if (B && B.pvp) { netSend({ t: 'bye' }); netClose(); } B = null; $('#battle').classList.add('hidden'); render(); updateHud(); toast('⌨️ Esc: 전투에서 나왔어요'); }
    else quitBattle();
    return;
  }
  if (!$('#modal').classList.contains('hidden')) { e.preventDefault(); closeModal(); }
});
function quitBattle() {
  if (!B) return;
  // 연속 전투 중에 누르면: 연속만 멈추고 지금 전투는 계속 (끝나면 확인)
  if (LOOP && !B.over) { stopLoop(); return; }
  if (LOOP) stopLoop();
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
    ${u.ally ? '<div class="u-ally" title="친구 몬스터">🤝</div>' : ''}
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

let lastBDraw = 0;
function drawBattle() {
  if (!B) return;
  // 2500배속부터는 화면을 0.05초에 한 번만 다시 그린다 (끝났을 때는 꼭 그린다)
  if (LOOP && bSpeed() >= 250 && $('#arena') && performance.now() - lastBDraw < 60) return;
  lastBDraw = performance.now();
  if (!B.built || !$('#arena')) {
    const me = B.units.filter(u => u.side === 'me');
    const foes = B.units.filter(u => u.side === 'foe');
    $('#battle').innerHTML = `
      <div class="b-inner">
        <div class="b-top">
          <b>${B.raid ? `🔥 레이드 · ${raidDef().name}` : B.gwar ? `⚔️ 길드전 · ${esc(B.gwar.opp.emblem)} ${esc(B.gwar.def.n)}` : B.coop ? `🤝 협동 레이드 · ${B.units.find(u => u.boss) ? B.units.find(u => u.boss).c.name : ''}` : B.pvp ? `👥 친구 대전 · vs ${B.pvp.oppName}` : B.bossIdx != null ? `👹 보스전 · ${BOSSES[B.bossIdx].name}` : `스테이지 ${B.stage}`}</b><span class="muted" id="bRound"></span>${S.petOn && petById(S.petOn) && !(B.pvp && B.pvp.role === 'guest') ? `<span class="b-pet" title="${petBonusText(petById(S.petOn), petLv(S.petOn))}">${petById(S.petOn).e}</span>` : ''}
          <span class="spacer"></span>
          <button class="btn ghost small" data-act="typeChart">📘 상성표</button>
          ${B.pvp && !B.coop ? '' : '<button class="btn ghost small" data-act="bAuto" id="bAuto"></button>'}
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
  $('#bFast').textContent = `⏩ ${bSpeed()}배속`;
  $('#bFast').classList.toggle('on', bSpeed() > 1);
  if ($('#bAuto')) { $('#bAuto').textContent = B.auto ? '🤖 자동 켜짐' : '🤖 자동'; $('#bAuto').classList.toggle('on', !!B.auto); }
  $('#bQuitTop').style.display = B.over ? 'none' : '';
  $('#bQuitTop').textContent = LOOP ? '⏹ 연속 멈추기' : '🏳️ 포기';
  B.units.forEach(updateUnit);
  updateLog();

  let bottom = '';
  if (B.over) {
    const r = B.result;
    bottom = `<div class="b-result">
      <div class="result ${r.win ? 'win' : 'lose'}">${r.win ? '🏆 승리!' : '💥 패배…'}</div>
      <p>${r.win || B.gwar || B.raid ? `${B.raid ? '' : '보상: '}${r.rewards.join(' · ')}` : '속성 상성을 생각하거나 몬스터를 키우고 룬을 끼워 보세요!'}</p>
      ${LOOP && r.win && !B.pvp && !B.gwar && !B.raid && B.bossIdx == null
        ? `<p class="loop-note">🔁 연속 전투 ${LOOP.wins + 1}연승! 곧 다음 스테이지…</p><button class="btn big" data-act="loopStop">⏹ 멈추기</button>`
        : `<div class="row"><button class="btn big" data-act="bQuit">확인</button>${!B.pvp && !B.gwar && !B.raid && B.bossIdx == null ? `<button class="btn big green" data-act="${r.win ? 'nextStage' : 'fightLoop'}">${r.win ? '⏩ 다음 스테이지' : '🔁 다시 연속 전투'}</button>` : ''}</div>`}
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

// ----- 전 세계 랭킹 (ntfy.sh에 점수를 올리고 읽는다. 서버는 12시간만 보관하지만 기기 저장 + 다시 올리기로 최대 2년) -----
// 내 컴퓨터에서 시험할 때(localhost)는 진짜 랭킹을 건드리지 않게 따로 쓴다
const RANK_TOPIC = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname) ? 'monhap-rank-dev-q7x2k9' : 'monhap-rank-v1-q7x2k9';
// 랭킹에서 숨길 기록 (시험하다가 잘못 올라간 것)
const RANK_HIDE = new Set(['7d7sb06fon1l', 'ut7q8bq5onn3', 'i8pxkadifqn4']);
const RANK_URL = 'https://ntfy.sh/' + RANK_TOPIC;
// ntfy.sh는 인터넷 연결(IP)마다 하루 250개까지만 올릴 수 있다. 다 쓰면 429 → 잠시 쉬고,
// 자동으로 올리는 것(랭킹 점수 · 다시 올리기 · 읽음 표시)은 하루 120번까지만 쓴다 (채팅 · 친구 요청 몫을 남겨 두려고)
const NTFY_BG_DAY = 120;
const ntfyDay = () => { try { const d = JSON.parse(lsGet('combining-ntfy') || '{}'); return d.day === dayKey() ? d : { day: dayKey(), n: 0, until: d.until || 0 }; } catch (e) { return { day: dayKey(), n: 0, until: 0 }; } };
const ntfyBlocked = () => Date.now() < (ntfyDay().until || 0);
const ntfyBgOk = (n = 1) => !ntfyBlocked() && ntfyDay().n + n <= NTFY_BG_DAY;
let ntfyWarned = 0;
async function ntfyPost(url, obj, bg) {
  if (ntfyBlocked()) return false;
  if (bg && !ntfyBgOk()) return false;
  try {
    const r = await fetch(url, { method: 'POST', body: JSON.stringify(obj) });
    const d = ntfyDay();
    if (r.status === 429) {
      d.until = Date.now() + 30 * 60 * 1000;   // 30분 쉬기
      lsSet('combining-ntfy', JSON.stringify(d));
      if (Date.now() - ntfyWarned > 10 * 60 * 1000) { ntfyWarned = Date.now(); toast('🌐 온라인 서버를 오늘 너무 많이 썼어요. 잠시 뒤에 다시 돼요 (게임은 그대로 할 수 있어요)'); }
      return false;
    }
    if (bg) d.n++;
    lsSet('combining-ntfy', JSON.stringify(d));
    return r.ok;
  } catch (e) { return false; }
}
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
    n: safeName(String(S.nick || (ACC && ACC.name) || '플레이어').slice(0, 10)),
    f: top[0] ? CAT[top[0].type].face : '🥚',
    tr: S.trophies || 0, dex: Object.keys(S.dex).length, st: S.stage || 1, tt: titleIdx(),
    pw: top.reduce((s, m) => s + monPower(m), 0),
    ...(S.guild ? { g: S.guild.id, gn: safeName(S.guild.name, '길드'), ge: S.guild.emblem, gl: S.guild.leader ? 1 : 0, dt: defenseTeam() } : {}),
  };
}
// 길드전 방어 팀: 모험 팀, 없으면 가장 센 3마리
function defenseTeam() {
  let team = S.team.map(byUid).filter(Boolean).slice(0, 3);
  if (!team.length) team = S.monsters.slice().sort((a, b) => monPower(b) - monPower(a)).slice(0, 3);
  return team.map(m => { const st = stats(m); return { type: m.type, lv: m.lv, hp: st.hp, atk: st.atk, spd: st.spd }; });
}
let rankBusy = false;
// 점수가 바뀌었으면 올린다 (랭킹을 열 때는 3분, 평소엔 15분에 한 번까지 · 안 바뀌어도 6시간마다)
async function rankSubmit(force) {
  // 몬스터가 한 마리도 없는 빈 계정은 올리지 않는다
  if (VISIT || !ACC || rankBusy || !navigator.onLine || !S.monsters.length) return;
  const d = myRankData(), key = JSON.stringify([d.n, d.f, d.tr, d.dex, d.st, d.pw, d.tt, d.g || '', (d.dt || []).map(x => x.type + x.lv).join()]);
  const last = S.rankLast || {};
  const age = Date.now() - (last.t || 0);
  if (age < (force ? 3 : 15) * 60000) return;
  if (last.key === key && age < 6 * 3600 * 1000) return;
  rankBusy = true;
  if (await ntfyPost(RANK_URL, d, true)) { S.rankLast = { key, t: Date.now() }; save(); }
  rankBusy = false;
}
// 지운 계정: 같은 id로 "지웠어요" 기록을 올리면 읽는 쪽에서 뺀다
function rankDelete(id) {
  if (!id) return;
  if (rankCache) rankCache.list = rankCache.list.filter(p => p.id !== id);
  guildCache = null;
  ntfyPost(RANK_URL, { v: 1, id, del: 1, n: '' });
}
// 기록 하나를 안전한 모양으로
function rankNorm(d, t) {
  if (!d || d.v !== 1 || typeof d.id !== 'string' || RANK_HIDE.has(d.id)) return null;
  const num = (x, hi) => Math.max(0, Math.min(hi, Math.floor(Number(x) || 0)));
  return { id: d.id.slice(0, 20), n: safeName(String(d.n || '플레이어').slice(0, 10)), f: String(d.f || '🥚').slice(0, 4),
    tr: num(d.tr, 99999), dex: num(d.dex, CAT_LIST.length), st: num(d.st, 9999), pw: num(d.pw, 1e8), t: Number(t) || 0, tt: num(d.tt, TITLES.length - 1),
    g: typeof d.g === 'string' ? d.g.slice(0, 12) : '', gn: d.gn ? safeName(String(d.gn).slice(0, 12), '길드') : '', ge: String(d.ge || '🛡️').slice(0, 4), gl: d.gl ? 1 : 0,
    dt: Array.isArray(d.dt) ? d.dt.slice(0, 3).filter(x => x && CAT[x.type]) : [], del: d.del ? 1 : 0 };
}
const RANK_KEEP = 2 * 365 * 86400;          // 최대 2년
const RANK_STORE = 'combining-rankstore-' + RANK_TOPIC;
const RANK_RELAY_OLD = 10 * 3600;           // 서버에 올라간 지 10시간이 넘으면 다시 올린다
let rankRelayAt = 0;
// 다시 올릴 때의 모양 (서버에 올라온 시간 대신 원래 시간 t를 같이)
const rankPack = (p) => ({ v: 1, id: p.id, n: p.n, f: p.f, tr: p.tr, dex: p.dex, st: p.st, pw: p.pw, tt: p.tt, g: p.g, gn: p.gn, ge: p.ge, gl: p.gl, dt: p.dt, del: p.del, t: Math.floor(p.t) });
async function rankFetch() {
  const r = await fetch(RANK_URL + '/json?poll=1&since=12h');
  if (!r.ok) throw new Error('http ' + r.status);
  const txt = await r.text();
  const best = {}, carrier = {};
  const put = (p, at) => {
    if (!p) return;
    if (!best[p.id] || best[p.id].t <= p.t) best[p.id] = p;
    if (best[p.id] === p || best[p.id].t === p.t) carrier[p.id] = Math.max(carrier[p.id] || 0, at);
  };
  txt.split('\n').forEach(line => {
    if (!line.trim()) return;
    try {
      const ev = JSON.parse(line);
      if (ev.event !== 'message') return;
      const d = JSON.parse(ev.message);
      // 다시 올린 묶음
      if (d && d.v === 1 && Array.isArray(d.bundle)) { d.bundle.slice(0, 20).forEach(x => put(rankNorm(x, Math.min(Number(x && x.t) || 0, ev.time)), ev.time)); return; }
      put(rankNorm(d, ev.time), ev.time);
    } catch (e) { /* 잘못된 줄은 건너뛴다 */ }
  });
  // 기기에 저장된 기록과 합치기 (2년 넘은 기록은 버린다)
  const now = Date.now() / 1000;
  let store = {};
  try { store = JSON.parse(lsGet(RANK_STORE) || '{}') || {}; } catch (e) { store = {}; }
  Object.values(store).forEach(x => { const p = rankNorm({ ...x, v: 1 }, x.t); if (p && (!best[p.id] || best[p.id].t < p.t)) best[p.id] = p; });
  Object.keys(best).forEach(id => { if (best[id].t < now - RANK_KEEP) delete best[id]; });
  const all = Object.values(best).sort((a, b) => b.t - a.t).slice(0, 3000);
  const keep = {};
  all.forEach(p => { keep[p.id] = rankPack(p); });
  lsSet(RANK_STORE, JSON.stringify(keep));
  // 곧 지워질(또는 이미 지워진) 기록은 묶어서 다시 올린다 (다른 사람도 볼 수 있게)
  let relayAt = 0;
  try { relayAt = Number(lsGet('combining-rankrelay')) || 0; } catch (e) { relayAt = 0; }
  if (Date.now() - Math.max(rankRelayAt, relayAt) > 3 * 3600 * 1000 && Math.random() < 0.5 && ntfyBgOk(2)) {
    const need = all.filter(p => (carrier[p.id] || 0) < now - RANK_RELAY_OLD);
    if (need.length) {
      rankRelayAt = Date.now(); lsSet('combining-rankrelay', String(rankRelayAt));
      // 사람마다 조금씩 나눠서 올리도록 앞쪽 몇 묶음만 (섞어서)
      need.sort(() => Math.random() - 0.5);
      let pack = [], size = 0, posts = 0;
      const flush = () => { if (!pack.length) return; posts++; ntfyPost(RANK_URL, { v: 1, bundle: pack }, true); pack = []; size = 0; };
      for (const p of need) {
        if (posts >= 2) break;
        const j = rankPack(p), len = JSON.stringify(j).length;
        if (size + len > 3500) flush();
        if (posts >= 2) break;
        pack.push(j); size += len;
      }
      if (posts < 2) flush();
    }
  }
  return all.filter(p => !p.del);   // 지운 계정은 빼기
}
let rankCat = 'tr', rankCache = null;
let rankQuery = '';
const rankMatch = (p, q) => {
  const s = q.trim().toLowerCase().replace(/\s+/g, '');
  if (!s) return true;
  const nm = String(p.n || '').toLowerCase().replace(/\s+/g, ''), gn = String(p.gn || '').toLowerCase().replace(/\s+/g, '');
  return nm.includes(s) || gn.includes(s) || frCodeOf(p.id).toLowerCase() === s.slice(0, 6);
};
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
      <p class="muted">${c.desc} · 최근 2년 동안 게임을 한 플레이어 순위예요</p>
      <div class="rank-search"><input id="rankSearch" maxlength="12" placeholder="🔍 이름 · 길드 · 친구 코드로 찾기" value="${esc(rankQuery)}" autocomplete="off"><button class="btn small" data-act="rankSearch">찾기</button>${rankQuery ? '<button class="btn small ghost" data-act="rankSearchClear">✖</button>' : ''}</div>
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
  const row = (p, k) => `<div class="rank-row rk5 ${p.id === me.id ? 'me' : ''} ${k < 3 ? 'top' : ''}">
      <span class="rk-pos">${medal(k)}</span>
      <span class="rk-face">${esc(p.f)}</span>
      <span class="rk-name">${esc(p.n)}${p.id === me.id ? ' <small>(나)</small>' : ''}<br>${tierBadge(p.tr)} <small class="rk-title">${titleName(p.tt)}</small></span>
      <span class="rk-val">${fmt(p[rankCat])}<small>${c.unit}</small></span>
      ${p.id !== me.id ? (frById(p.id) ? '<span class="rk-fr" title="친구">👫</span>' : `<button class="rk-fr add" data-act="frAddRank" data-id="${esc(p.id)}" title="친구 추가">➕</button>`) : '<span class="rk-fr"></span>'}
    </div>`;
  if (rankQuery.trim()) {
    // 찾기: 순위와 함께 길드 · 마지막 접속 · 친구 코드까지 보여 준다
    const found = list.map((p, k) => ({ p, k })).filter(({ p }) => rankMatch(p, rankQuery)).slice(0, 50);
    const info = (p) => `<div class="rank-found">${p.gn ? `${esc(p.ge || '🛡️')} ${esc(p.gn)}${p.gl ? ' 👑' : ''} · ` : ''}🕒 ${p.id === me.id ? '지금' : frAgo(p.t) || '-'} · 🔑 ${frCodeOf(p.id)} · 📖 ${fmt(p.dex)} · ⚔️ ${fmt(p.st)}</div>`;
    draw(found.length
      ? `<p class="rank-mypos">🔍 "${esc(rankQuery)}" · ${found.length}명 찾았어요</p>${found.map(({ p, k }) => row(p, k) + info(p)).join('')}`
      : `<p class="muted">🔍 "${esc(rankQuery)}"(으)로 찾은 사람이 없어요.<br>최근 2년 동안 랭킹에 한 번이라도 올라간 사람만 찾을 수 있어요 (몬스터가 1마리 이상 있어야 올라가요).</p>`);
  } else {
    const shown = list.slice(0, 50);
    draw(`<p class="rank-mypos">내 순위: <b>${myPos}위</b> / ${list.length}명</p>${shown.map(row).join('')}${myPos > 50 ? '<div class="rank-gap">⋯</div>' + row(list[myPos - 1], myPos - 1) : ''}`);
  }
  const inp = $('#rankSearch');
  if (inp) inp.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); ACTIONS.rankSearch(); } });
}
// ===================== 👫 친구 =====================
// 친구 코드 = 랭킹 id 앞 6글자. 랭킹 기록(최근 2년)에서 찾아서 친구 목록(S.friends)에 넣는다.
// 사람마다 ntfy "우편함" 주제가 하나씩 있어서 친구 요청 · 💌 하트 선물 · ⚔️ 대전 초대를 보낸다.
const FR_MAX = 30, FR_GIFT_MAX = 10;
const FR_BOX = (id) => 'https://ntfy.sh/monhap-fr-' + (RANK_TOPIC.includes('-dev-') ? 'dev-' : 'v1-') + id;
const myFrCode = () => myRankData().id.slice(0, 6).toUpperCase();
const frCodeOf = (id) => String(id).slice(0, 6).toUpperCase();
const frById = (id) => (S.friends || []).find(f => f.id === id);
let frInviteTo = null, frBusy = false;
// 친구에게 보여 줄 내 정보 (짧게)
function frMe() { const d = myRankData(); return { id: d.id, n: d.n, f: d.f, tr: d.tr, dex: d.dex, st: d.st, pw: d.pw, tt: d.tt }; }
function frClean(p) {
  const num = (x, hi) => Math.max(0, Math.min(hi, Math.floor(Number(x) || 0)));
  return { id: String(p.id || '').slice(0, 20), n: safeName(String(p.n || '플레이어').slice(0, 10)), f: String(p.f || '🥚').slice(0, 4),
    tr: num(p.tr, 99999), dex: num(p.dex, CAT_LIST.length), st: num(p.st, 9999), pw: num(p.pw, 1e8), tt: num(p.tt, TITLES.length - 1), t: Number(p.t) || 0 };
}
function frPost(id, msg) {
  return ntfyPost(FR_BOX(id), { v: 1, ...msg, from: frMe() });
}
function frAdd(p, silent) {
  S.friends = S.friends || [];
  if (p.id === myRankData().id) { toast('자기 자신은 친구로 추가할 수 없어요 😅'); return false; }
  const old = frById(p.id);
  if (old) { Object.assign(old, frClean({ ...old, ...p })); return true; }
  if (S.friends.length >= FR_MAX) { toast(`친구는 ${FR_MAX}명까지예요`); return false; }
  S.friends.push({ ...frClean(p), mutual: 0, added: Date.now() });
  S.frReq = (S.frReq || []).filter(r => r.id !== p.id);
  frPost(p.id, { k: 'req' });
  if (!silent) { sfx('yay'); toast(`👫 ${safeName(p.n)}님을 친구로 추가했어요! 상대에게 친구 요청을 보냈어요`); }
  save();
  return true;
}
async function frAddByCode() {
  const el = $('#frCode');
  const code = (el ? el.value : '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (code.length < 6) { toast('친구 코드 6자리를 입력해 주세요'); return; }
  if (code.slice(0, 6) === myFrCode()) { toast('그건 내 친구 코드예요 😅'); return; }
  if (frBusy) return;
  frBusy = true;
  toast('🔍 친구를 찾는 중…');
  try {
    const list = await rankFetch();
    rankCache = { t: Date.now(), list };
    const p = list.find(x => frCodeOf(x.id) === code.slice(0, 6));
    if (!p) toast('😢 그 코드의 친구를 찾지 못했어요. 코드가 맞는지 확인해 주세요 (친구가 한 번은 랭킹을 열어야 해요)');
    else if (frAdd(p)) openFriends();
  } catch (e) { toast('인터넷 연결을 확인해 주세요'); }
  frBusy = false;
}
// 우편함 읽기: 친구 요청 · 수락 · 하트 · 초대
async function frPoll() {
  if (VISIT || !ACC || !navigator.onLine || !S.rankId) return;
  let txt;
  try { const r = await fetch(FR_BOX(S.rankId) + '/json?poll=1&since=12h'); if (!r.ok) return; txt = await r.text(); } catch (e) { return; }
  S.frSeen = S.frSeen || [];
  const seen = new Set(S.frSeen);
  let news = 0;
  txt.split('\n').forEach(line => {
    if (!line.trim()) return;
    try {
      const ev = JSON.parse(line);
      if (ev.event !== 'message' || seen.has(ev.id)) return;
      seen.add(ev.id); S.frSeen.push(ev.id);
      const d = JSON.parse(ev.message);
      if (!d || d.v !== 1 || !d.from || typeof d.from.id !== 'string') return;
      const from = frClean({ ...d.from, t: ev.time });
      if (from.id === S.rankId) return;
      const fr = frById(from.id);
      if (fr) Object.assign(fr, from);
      if (d.k === 'req') {
        if (fr) { if (!fr.mutual) { fr.mutual = 1; frPost(from.id, { k: 'ok' }); toast(`🤝 ${from.n}님과 서로 친구가 되었어요!`); } }
        else if (!(S.frReq || []).some(r => r.id === from.id)) { S.frReq = (S.frReq || []).concat([from]).slice(-20); news++; toast(`👫 ${from.n}님이 친구 요청을 보냈어요!`); }
      } else if (d.k === 'ok') {
        if (fr && !fr.mutual) { fr.mutual = 1; toast(`🤝 ${from.n}님이 친구 요청을 받아 줬어요!`); }
      } else if (d.k === 'gift') {
        if (fr) { S.frGifts = (S.frGifts || []).concat([{ id: from.id, n: from.n, f: from.f, t: ev.time }]).slice(-50); news++; }
      } else if (d.k === 'inv' && /^[A-Z0-9]{6}$/.test(String(d.code)) && Date.now() / 1000 - ev.time < 300) {
        S.frInv = { id: from.id, n: from.n, f: from.f, code: d.code, coop: d.coop ? 1 : 0, t: ev.time };
        news++;
        sfx('yay');
        toast(`${d.coop ? '🤝' : '⚔️'} ${from.n}님이 ${d.coop ? '보스 레이드' : '대전'}에 초대했어요! 👫 친구 창에서 들어가요`);
      }
    } catch (e) { /* 잘못된 편지는 건너뛴다 */ }
  });
  if (S.frSeen.length > 300) S.frSeen = S.frSeen.slice(-300);
  save();
  frDot();
  if (news && $('#modalBox .fr-panel')) openFriends();
}
setInterval(() => { if (!document.hidden) frPoll(); }, 45000);
setTimeout(frPoll, 8000);
const frInvOn = () => S.frInv && Date.now() / 1000 - S.frInv.t < 300;
const frNewCount = () => (S.frReq || []).length + (S.frGifts || []).length + (frInvOn() ? 1 : 0);
function frDot() {
  const b = document.querySelector('.pvp-box [data-act=friends] .fr-dot');
  const n = frNewCount();
  if (b) { b.textContent = n; b.style.display = n ? '' : 'none'; }
}
const frGiftToday = () => (S.frGiftDay && S.frGiftDay.day === dayKey() ? S.frGiftDay : (S.frGiftDay = { day: dayKey(), sent: [], got: 0 }));
function frSendGift(id) {
  const fr = frById(id);
  if (!fr) return;
  const g = frGiftToday();
  if (g.sent.includes(id)) { toast('오늘은 이미 보냈어요. 내일 또 보내요!'); return; }
  g.sent.push(id);
  frPost(id, { k: 'gift' });
  statAdd('friendGift', 1);
  sfx('coin'); save();
  toast(`💌 ${fr.n}님에게 하트를 보냈어요!`);
  openFriends();
}
const frGiftGold = () => Math.max(1000, Math.round(totalIncome() * 300));
function frClaimGifts() {
  const g = frGiftToday();
  const list = S.frGifts || [];
  const n = Math.min(list.length, FR_GIFT_MAX - g.got);
  if (!list.length) return;
  if (n <= 0) { toast(`하트는 하루에 ${FR_GIFT_MAX}개까지 받을 수 있어요. 내일 받아요!`); return; }
  S.frGifts = list.slice(n);
  g.got += n;
  const gold = frGiftGold() * n;
  earn(gold); earn(n * 2, 'gems');
  sfx('coin'); save(); updateHud();
  toast(`💌 하트 ${n}개! 💰 ${shortNum(gold)} + 💎 ${n * 2}`);
  openFriends();
}
function frAccept(id) {
  const r = (S.frReq || []).find(x => x.id === id);
  if (!r) return;
  if (frAdd(r, true)) { const fr = frById(id); fr.mutual = 1; frPost(id, { k: 'ok' }); sfx('yay'); toast(`🤝 ${r.n}님과 친구가 되었어요!`); }
  S.frReq = (S.frReq || []).filter(x => x.id !== id);
  save(); openFriends();
}
function frReject(id) { S.frReq = (S.frReq || []).filter(x => x.id !== id); save(); openFriends(); }
function frRemove(id) {
  const fr = frById(id);
  if (!fr) return;
  if (!confirm(`${fr.n}님을 친구에서 삭제할까요?`)) return;
  S.friends = S.friends.filter(f => f.id !== id);
  save(); openFriends();
}
function frInvite(id, coop) {
  const fr = frById(id);
  if (!fr) return;
  if (!window.Peer) { toast('대전 기능을 아직 불러오는 중이에요. 잠시 뒤에 다시 눌러 주세요'); return; }
  if (!S.team.map(byUid).filter(Boolean).length) { toast('먼저 모험 탭에서 팀을 짜 주세요!'); return; }
  frInviteTo = id;
  pvpHost(0, !!coop);
  toast(`${coop ? '🤝' : '⚔️'} ${fr.n}님에게 초대를 보내는 중… 친구가 들어오면 시작돼요`);
}
function frJoinInvite() {
  if (!frInvOn()) { toast('초대가 끝났어요 (5분이 지났어요)'); S.frInv = null; openFriends(); return; }
  if (!S.team.map(byUid).filter(Boolean).length) { toast('먼저 모험 탭에서 팀을 짜 주세요!'); return; }
  const inv = S.frInv;
  S.frInv = null; save();
  pvpJoin(!!inv.coop, inv.code);
}
function frAgo(t) {
  const s = Date.now() / 1000 - (t || 0);
  if (!t) return '';
  if (s < 600) return '<span class="fr-on">🟢 접속 중</span>';
  if (s < 3600) return `${Math.floor(s / 60)}분 전`;
  if (s < 86400) return `${Math.floor(s / 3600)}시간 전`;
  return `${Math.floor(s / 86400)}일 전`;
}
async function openFriends(refresh) {
  tutFlag('friendAdd', true);
  const g = frGiftToday();
  const fr = (S.friends || []).slice().sort((a, b) => (b.t || 0) - (a.t || 0));
  const req = S.frReq || [], gifts = S.frGifts || [];
  showModal(`<div class="fr-panel"><h3>👫 친구</h3>
    <div class="fr-me">내 친구 코드 <b class="fr-code">${myFrCode()}</b> <button class="btn small" data-act="frCopy">📋 복사</button>
      <small class="muted">친구에게 알려 주면 나를 추가할 수 있어요</small></div>
    <div class="fr-add"><input id="frCode" maxlength="12" placeholder="친구 코드 6자리 (예: K7QM2P)" style="text-transform:uppercase"><button class="btn green" data-act="frAdd">➕ 추가</button></div>
    <p class="muted fr-tip">🏆 랭킹에서 사람 옆의 ➕를 눌러도 친구가 돼요</p>
    ${frInvOn() ? `<div class="fr-inv">${S.frInv.coop ? '🤝' : '⚔️'} <b>${esc(S.frInv.f)} ${esc(S.frInv.n)}</b>님이 ${S.frInv.coop ? '보스 레이드' : '대전'}에 초대했어요!
      <button class="btn green" data-act="frJoin">🔑 들어가기</button></div>` : ''}
    ${req.length ? `<h4>📨 친구 요청 ${req.length}</h4>${req.map(r => `<div class="fr-row req"><span class="fr-face">${esc(r.f)}</span>
      <span class="fr-name"><b>${esc(r.n)}</b><br>${tierBadge(r.tr)} <small>📖 ${fmt(r.dex)} · ⚔️ ${fmt(r.st)}</small></span>
      <span class="fr-btns"><button class="btn small green" data-act="frAccept" data-id="${esc(r.id)}">✅ 수락</button><button class="btn small ghost" data-act="frReject" data-id="${esc(r.id)}">✖</button></span></div>`).join('')}` : ''}
    ${gifts.length ? `<div class="fr-gifts">💌 받은 하트 <b>${gifts.length}</b>개 <small class="muted">(하나에 💰 ${shortNum(frGiftGold())} + 💎 2 · 오늘 ${g.got}/${FR_GIFT_MAX})</small>
      <button class="btn green small" data-act="frClaim">받기</button></div>` : ''}
    <h4>👫 내 친구 ${fr.length}/${FR_MAX} <small class="muted">💌 하트는 친구마다 하루에 한 번</small></h4>
    <div class="fr-list">${fr.length ? fr.map(f => `<div class="fr-row">
        <span class="fr-face">${esc(f.f)}</span>
        <span class="fr-name"><b>${esc(f.n)}</b> ${f.mutual ? '<small title="서로 친구">🤝</small>' : '<small class="muted">요청 보냄</small>'}<br>
          ${tierBadge(f.tr)} <small>📖 ${fmt(f.dex)} · ⚔️ ${fmt(f.st)} · 💪 ${shortNum(f.pw)}</small><br><small class="muted">${frAgo(f.t)}</small></span>
        <span class="fr-btns">
          <button class="btn small ${g.sent.includes(f.id) ? 'ghost' : 'green'}" data-act="frGift" data-id="${esc(f.id)}" ${g.sent.includes(f.id) ? 'disabled' : ''}>💌${g.sent.includes(f.id) ? '✅' : ''}</button>
          <button class="btn small" data-act="frInvite" data-id="${esc(f.id)}" title="대전 초대">⚔️</button>
          <button class="btn small coop-btn" data-act="frInvite" data-id="${esc(f.id)}" data-coop="1" title="레이드 초대">🤝</button>
          <button class="btn small ghost" data-act="frRemove" data-id="${esc(f.id)}" title="삭제">🗑️</button>
        </span></div>`).join('') : '<p class="muted">아직 친구가 없어요. 친구 코드를 넣어 추가해 봐요!</p>'}</div>
    <div class="row"><button class="btn ghost small" data-act="frRefresh">🔄 새로고침</button><button class="btn ghost small" data-act="close">닫기</button></div></div>`);
  frDot();
  // 친구 정보(트로피·접속 시간)를 랭킹에서 새로 받아 온다
  if (refresh && fr.length && !frBusy) {
    frBusy = true;
    try {
      const list = await rankFetch();
      rankCache = { t: Date.now(), list };
      list.forEach(p => { const f = frById(p.id); if (f) Object.assign(f, frClean({ ...f, ...p })); });
      save();
    } catch (e) { /* 인터넷 없음 */ }
    frBusy = false;
    await frPoll();
    if ($('#modalBox .fr-panel')) openFriends();
  }
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
      <p class="muted">최근 2년 동안 게임을 한 길드원이 보여요</p>`;
  } else if (guildTab === 'chat') {
    body = `<div class="gchat" id="gChat"><p class="muted">⏳ 불러오는 중…</p></div>
      <div class="gchat-input"><input id="gChatText" maxlength="${GCHAT_MAX}" placeholder="메시지를 적어요 (${GCHAT_MAX}자까지)" autocomplete="off"><button class="btn green" data-act="gSend">보내기</button></div>
      <div class="gchat-send">${GUILD_CHAT.map((m, k) => `<button class="chip" data-act="gSay" data-k="${k}">${m}</button>`).join('')}</div>
      <p class="muted gchat-rule">🛡️ 전화번호 · 주소 · 링크 · 다른 앱 아이디는 못 보내요. 욕은 5번 물어봐요 😅 싫은 사람은 🙈를 누르면 안 보여요</p>`;
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
  if (guildTab === 'chat') {
    tutFlag('gchat', true);
    guildChatLoad();
    const inp = $('#gChatText');
    if (inp) inp.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); gSend(); } });
  }
}
function guildBrowse(guilds) {
  showModal(`<h3>🛡️ 길드</h3>
    <p class="muted">길드에 들어가면 길드원들과 함께 <b>길드 레벨</b>을 올려요. 레벨마다 <b>서식지 골드 +${GUILD_PCT}%</b>! 길드 채팅도 할 수 있어요.</p>
    <div class="row"><button class="btn big green" data-act="guildNew">✨ 길드 만들기 (💰 ${fmt(GUILD_COST)})</button></div>
    <h3 class="sub">🔎 길드 찾기 <small class="muted">최근 2년 동안 활동한 길드</small></h3>
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
  if (nameProblem(name)) { toast(nameProblem(name)); return; }
  if (!S.monsters.length) { toast('몬스터가 한 마리는 있어야 길드를 만들 수 있어요'); return; }
  if (!spend(GUILD_COST)) return;
  const id = Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
  S.guild = { id, name, emblem: guildEmblem, leader: true, lv: 1, joined: Date.now() };
  save(); updateHud(); sfx('yay');
  toast(`🛡️ ${name} 길드를 만들었어요!`);
  S.rankLast = null;
  guildSay(`🎉 ${safeName(S.nick || ACC.name)}님이 길드를 만들었어요!`, true);
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
  guildSay(`👋 ${safeName(S.nick || ACC.name)}님이 길드에 들어왔어요!`, true);
  guildCache = null; guildTab = 'home';
  openGuild();
}
function guildLeave() {
  if (!S.guild || !confirm(`${S.guild.name} 길드에서 나갈까요?${S.guild.leader ? ' (길드장이 나가도 길드원이 남아 있으면 길드는 계속돼요)' : ''}`)) return;
  guildSay(`🚪 ${safeName(S.nick || ACC.name)}님이 길드를 떠났어요`, true);
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
    .map(d => ({ g: d.g.slice(0, 12), gn: safeName(String(d.gn || '').slice(0, 12), '길드'), ge: String(d.ge || '🛡️').slice(0, 4), id: String(d.id || '').slice(0, 20), n: safeName(String(d.n || '').slice(0, 10)), st: Math.max(0, Math.min(3, Math.floor(Number(d.st) || 0))), tgt: String(d.tgt || '').slice(0, 20), vs: String(d.vs || '').slice(0, 12) }));
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
  potBattleStart();
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
  statAdd('gwarStars', stars);
  const gold = 200 + stars * 400, gems = stars * 2;
  earn(gold); if (gems) earn(gems, 'gems');
  if (stars && S.guild) {
    ntfyPost(GWAR_URL(), { v: 1, g: S.guild.id, gn: S.guild.name, ge: S.guild.emblem, id: S.rankId, n: String(S.nick || (ACC && ACC.name) || '').slice(0, 10), st: stars, tgt: B.gwar.def.id, vs: B.gwar.opp.id });
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
  if (!(await ntfyPost(GUILD_TOPIC(S.guild.id), d))) toast('메시지를 보내지 못했어요');
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
// ----- 자유 채팅: 모르는 사람과도 이야기하니까 보내기 전에, 받을 때도 한 번 더 검사한다 -----
const GCHAT_MAX = 60;
const CHAT_BLOCK = ['카톡', '카카오', '오픈채팅', '오픈톡', '디스코드', '디코', '인스타', '페북', '페이스북', '틱톡', '텔레그램', '라인아이디', '전화번호', '폰번호', '핸드폰번호',
  '주소', '사는곳', '어디살', '학교이름', '무슨학교', '몇학년몇반', '비밀번호', '비번', '만나자', '만날래', '실제로만나', 'kakao', 'discord', 'insta', 'telegram'];
function chatProblem(s) {
  const t = String(s || '').trim();
  if (!t) return '메시지를 적어 주세요';
  if (t.length > GCHAT_MAX) return `${GCHAT_MAX}자까지 보낼 수 있어요`;
  if ((t.match(/\d/g) || []).length >= 7) return '📵 전화번호 같은 개인정보는 보낼 수 없어요';
  if (/https?:|www\.|\.(com|net|kr|io|gg|me|ly)\b|@/i.test(t)) return '📵 링크나 이메일은 보낼 수 없어요';
  const core = nameCore(t);
  if (CHAT_BLOCK.some(w => core.includes(w))) return '📵 개인정보나 다른 앱 연락처는 보낼 수 없어요. 게임 안에서만 이야기해요!';
  if (/(.)\1{9,}/.test(t)) return '같은 글자를 너무 많이 반복했어요';
  return '';
}
// 욕이 들어 있으면 보내기 전에 5번 물어본다 (귀찮게!)
const SWEAR_ASK = ['😮 욕이 들어 있어요. 정말 보낼까요?', '🤔 진짜로요? 길드원들이 기분 나쁠 수도 있어요. 그래도 보낼까요?',
  '😟 한 번 더 생각해 봐요… 정말 괜찮으세요?', '😣 정말정말 괜찮으세요? 욕인데요…', '😵 마지막으로 물어볼게요. 진짜 진짜 보낼 거예요?'];
function swearOk(t) {
  if (!badName(t)) return true;
  for (const q of SWEAR_ASK) if (!confirm(q + '\n\n"' + t + '"')) { toast('😊 좋은 선택이에요! 안 보냈어요'); return false; }
  return true;
}
let gLastMsg = '';
async function gSend() {
  const inp = $('#gChatText');
  if (!inp || !S.guild) return;
  const t = inp.value.replace(/\s+/g, ' ').trim();
  const p = chatProblem(t);
  if (p) { toast(p); return; }
  if (!swearOk(t)) return;
  if (Date.now() - gSayAt < 3000) { toast('조금 천천히 보내 주세요 😊'); return; }
  if (t === gLastMsg && Date.now() - gSayAt < 30000) { toast('같은 말을 또 보냈어요'); return; }
  gSayAt = Date.now(); gLastMsg = t;
  tutFlag('gchat', true);
  inp.value = '';
  await guildSay(t);
  guildChatLoad();
  const i2 = $('#gChatText'); if (i2) i2.focus();
}
function gMute(id) {
  S.gMute = S.gMute || [];
  if (S.gMute.includes(id)) S.gMute = S.gMute.filter(x => x !== id);
  else { S.gMute.push(id); toast('🙈 이 사람의 메시지를 숨겼어요. 채팅 아래 🙉로 다시 볼 수 있어요'); }
  save(); guildChatLoad();
}
let gChatTimer = null, gReadAt = 0, gArcAt = 0;
const GLOG_MAX = 400, GARC_BATCH = 14, GARC_POSTS = 2, GARC_OLD = 10 * 3600;
const gLogKey = () => `combining-gchat:${ACC ? ACC.id : ''}:${S.guild ? S.guild.id : ''}`;
const gKey = (d) => d.id + '|' + d.t + '|' + d.m;
const gDay = (t) => new Date(t * 1000).toLocaleDateString(window.LANG === 'en' ? 'en-US' : 'ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });
async function guildChatLoad() {
  clearTimeout(gChatTimer);
  const box = $('#gChat');
  if (!box || !S.guild) return;
  try {
    const txt = await (await fetch(GUILD_TOPIC(S.guild.id) + '/json?poll=1&since=12h')).text();
    const evs = txt.split('\n').filter(Boolean).map(l => { try { const e = JSON.parse(l); const d = JSON.parse(e.message); return { ...d, t: e.time }; } catch (e) { return null; } })
      .filter(d => d && d.v === 1 && typeof d.id === 'string');
    const me = S.rankId;
    // 누가 어디까지 읽었나: 읽음 표시 + 자기가 보낸 메시지는 읽은 걸로
    const readTo = {};
    const seen = (id, t) => { if (id && t > (readTo[id] || 0)) readTo[id] = t; };
    evs.forEach(d => { if (d.rd) seen(d.id, Number(d.rd) || 0); else if (typeof d.m === 'string') seen(d.id, d.t); });
    // 서버에 있는 메시지 (그냥 메시지 + 다시 올린 묶음) · 언제 올라가 있는지(carrier)
    const nowS = Date.now() / 1000, carrier = {}, live = [];
    const keep = (a, at) => {
      if (!a || typeof a.id !== 'string' || typeof a.m !== 'string') return;
      const d = { id: a.id.slice(0, 20), n: String(a.n || '').slice(0, 10), f: String(a.f || '🥚').slice(0, 4), m: a.m.slice(0, 200), sys: a.sys ? 1 : 0, t: Math.min(Number(a.t) || at, at) };
      live.push(d); const k = gKey(d); carrier[k] = Math.max(carrier[k] || 0, at);
    };
    evs.forEach(e => { if (typeof e.m === 'string') keep(e, e.t); else if (Array.isArray(e.arc)) e.arc.slice(0, 30).forEach(a => keep(a, e.t)); });
    // 내 기기에 저장된 기록과 합치기
    let log = [];
    try { log = JSON.parse(lsGet(gLogKey()) || '[]'); } catch (e) { log = []; }
    const merged = new Map();
    [...log, ...live].forEach(d => merged.set(gKey(d), d));
    const chatMsgs = [...merged.values()].sort((a, b) => a.t - b.t).slice(-GLOG_MAX);
    lsSet(gLogKey(), JSON.stringify(chatMsgs));
    // 곧 지워지거나 이미 지워진 메시지는 묶어서 다시 올려 둔다 (다른 길드원도 볼 수 있게)
    if (Date.now() - gArcAt > 30 * 60000 && ntfyBgOk(2)) {
      const need = chatMsgs.filter(d => (carrier[gKey(d)] || 0) < nowS - GARC_OLD).slice(-GARC_BATCH * GARC_POSTS);
      if (need.length) {
        gArcAt = Date.now();
        for (let i = 0; i < need.length; i += GARC_BATCH) {
          const arc = need.slice(i, i + GARC_BATCH).map(d => ({ id: d.id, n: d.n, f: d.f, m: d.m, sys: d.sys, t: d.t }));
          ntfyPost(GUILD_TOPIC(S.guild.id), { v: 1, id: me, arc }, true);
        }
      }
    }
    const newest = chatMsgs.reduce((x, d) => Math.max(x, d.t), 0);
    seen(me, newest);   // 지금 보고 있으니 나는 다 읽었다
    // 길드원: 최근 3일 안에 접속한 길드원 + 채팅에 나온 사람
    const mine = guildCache && guildCache.guilds && guildCache.guilds.find(g => g.id === S.guild.id);
    const members = new Set([me, ...(mine ? mine.members.filter(p => p.t > Date.now() / 1000 - 3 * 86400).map(p => p.id) : []), ...Object.keys(readTo)]);
    const unread = (d) => { if (d.t < Date.now() / 1000 - 12 * 3600) return 0; let n = 0; members.forEach(id => { if (id !== d.id && (readTo[id] || 0) < d.t) n++; }); return n; };
    // 내 읽음 표시 올리기 (새 메시지가 있을 때만)
    if (newest > (S.gReadSent || 0) && Date.now() - gReadAt > 60000) {
      gReadAt = Date.now(); S.gReadSent = newest; save();
      ntfyPost(GUILD_TOPIC(S.guild.id), { v: 1, id: me, rd: newest }, true);
    }
    const msgs = chatMsgs
      // 정해진 말과 시스템 알림만 보여 준다 (다른 글은 무시)
      .filter(d => GUILD_CHAT.includes(d.m) || (d.sys && /^(🎉|👋|🚪) .{1,20}님이 (길드를 만들었어요!|길드에 들어왔어요!|길드를 떠났어요)$/.test(d.m) && !badName(d.m))
        || (!d.sys && d.m.length <= GCHAT_MAX))
      .map(d => (!d.sys && !GUILD_CHAT.includes(d.m) && chatProblem(d.m) ? { ...d, m: '🙊 (가려진 메시지)', hid: 1 } : d))
      .filter(d => !(S.gMute || []).includes(d.id))
      .slice(-150);
    let lastDay = '';
    const dayLine = (d) => { const dd = gDay(d.t); if (dd === lastDay) return ''; lastDay = dd; return `<div class="gc-day"><span>📅 ${dd}</span></div>`; };
    const b = $('#gChat');
    if (!b) return;
    b.innerHTML = msgs.length ? msgs.map(d => dayLine(d) + (d.sys
      ? `<div class="gc-sys">${esc(d.m)}</div>`
      : `<div class="gc-msg ${d.id === me ? 'mine' : ''}"><span class="gc-face">${esc(String(d.f || '🥚').slice(0, 4))}</span><div><b>${esc(safeName(String(d.n || '').slice(0, 10)))}${d.id !== me && typeof d.id === 'string' ? ` <button class="gc-mute" data-act="gMute" data-id="${esc(d.id)}" title="이 사람 숨기기">🙈</button>` : ''}</b><span${d.sys || GUILD_CHAT.includes(d.m) ? '' : ' translate="no"'}>${esc(d.m)}</span></div><small>${unread(d) ? `<i class="gc-unread">${unread(d)}</i>` : ''}${new Date(d.t * 1000).toLocaleTimeString(window.LANG === 'en' ? 'en-US' : 'ko-KR', { hour: '2-digit', minute: '2-digit' })}</small></div>`)).join('')
      : '<p class="muted">아직 메시지가 없어요. 첫 인사를 해 봐요! 👋</p>';
    if ((S.gMute || []).length) b.innerHTML += `<div class="gc-sys"><button class="chip" data-act="gUnmuteAll">🙉 숨긴 사람 ${S.gMute.length}명 다시 보기</button></div>`;
    b.scrollTop = b.scrollHeight;
  } catch (e) { box.innerHTML = '<p class="warn">채팅을 불러오지 못했어요</p>'; }
  // 채팅 창이 열려 있는 동안 8초마다 새 메시지 확인
  gChatTimer = setTimeout(() => { if ($('#gChat')) guildChatLoad(); }, 8000);
}

// 켜 있는 동안 가끔 점수 올리기
setInterval(() => rankSubmit(false), 120000);
let NET = null;   // { peer, conn, role, code, oppName, oppTeam, started }
// ----- 🙅 이름 검사: 욕설·부적절한 말·개인정보(전화번호·링크)는 이름으로 못 쓴다 -----
const BAD_WORDS = [
  '씨발', '시발', '씨빨', '씨바', '씹', '십새', '쌍년', '썅', 'ㅅㅂ', 'ㅆㅂ', 'ㅄ', '병신', '븅신', '빙신', 'ㅂㅅ', '좆', '조까', '좃', '존나', '졸라', 'ㅈㄴ',
  '지랄', 'ㅈㄹ', '개새', '개색', '개세끼', '개쉐', '새끼', '섀끼', 'ㅅㄲ', '애미', '애비', '느금', '니미', '엠창', '엿먹', '꺼져', '닥쳐', '미친', '또라이', '돌아이',
  '등신', '찐따', '한남', '김치녀', '보지', '자지', '섹스', '섹시', '야동', '야사', '성기', '강간', '자위', '죽어', '죽일', '자살', '살인', '마약', '대마', '틀딱',
  '급식충', '맘충', '히틀러', '나치', 'ㅆㅣㅂㅏㄹ', 'ㅅㅣㅂㅏㄹ',
  'fuck', 'fck', 'fuk', 'shit', 'bitch', 'btch', 'dick', 'pussy', 'sex', 'porn', 'nigg', 'cunt', 'asshole', 'bastard', 'whore', 'slut', 'rape', 'nazi', 'hitler',
];
// 숫자·기호·띄어쓰기로 끼워 넣어도 잡히게: 한글·영어만 남긴다 ("시1발", "씨 발", "ㅅ.ㅂ" → 시발/씨발/ㅅㅂ)
const nameCore = (s) => String(s || '').toLowerCase().replace(/[^a-z가-힣ㄱ-ㅎㅏ-ㅣ]/g, '');
const badName = (s) => { const c = nameCore(s); return BAD_WORDS.some(w => c.includes(w)); };
function nameProblem(s) {
  const t = String(s || '').trim();
  if (!t) return '이름을 적어 주세요';
  if (badName(t)) return '🙅 부적절한 말이 들어간 이름은 쓸 수 없어요';
  if ((t.match(/\d/g) || []).length >= 7) return '📵 전화번호 같은 개인정보는 이름에 쓸 수 없어요';
  if (/https?:|www\.|\.com|\.kr|@/i.test(t)) return '📵 링크나 이메일은 이름에 쓸 수 없어요';
  return '';
}
// 다른 사람 이름을 보여 줄 때: 부적절하면 가린다
const safeName = (s, fb = '플레이어') => { const t = String(s || '').trim(); if (!t) return fb; return nameProblem(t) ? '🙊 ***' : t; };
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
    </div>
    <div class="coop-box">
      <h4 data-act="coopSeen">🤝 친구와 함께 보스 레이드</h4>
      <p class="muted">친구와 팀을 합쳐 (최대 6마리) <b>엄청 센 보스</b>와 싸워요! 이기면 <b>둘 다</b> 💎60 · 골드 · ★★★ 룬 · 👑 전설 알</p>
      <div class="row"><button class="btn big coop-btn" data-act="coopHost" ${n ? '' : 'disabled'}>🏠 레이드 방 만들기</button></div>
      <input id="coopCode" maxlength="6" placeholder="친구의 레이드 방 코드" style="text-transform:uppercase">
      <div class="row"><button class="btn coop-btn" data-act="coopJoin" ${n ? '' : 'disabled'}>🔑 레이드 들어가기</button></div>
    </div>
    <div class="row"><button class="btn ghost" data-act="close">닫기</button></div>`);
}
function saveNick() {
  const el = $('#pvpName');
  if (el) {
    const v = el.value.trim().slice(0, 10);
    if (v && nameProblem(v)) { toast(nameProblem(v)); el.value = ''; return false; }
    S.nick = v || '플레이어';
  }
  if (!S.nick || nameProblem(S.nick)) S.nick = '플레이어';
  save();
  return true;
}
function pvpWaitModal(title, body) {
  showModal(`<h3>${title}</h3>${body}
    <div class="row"><button class="btn ghost" data-act="pvpCancel">취소</button></div>`);
}
function pvpHost(retry = 0, coop = false) {
  if (!saveNick()) return;
  netClose();
  const code = pvpCode();
  const peer = new Peer(PVP_PREFIX + code);
  NET = { peer, role: 'host', code, coop };
  pvpWaitModal(coop ? '🤝 레이드 방을 만드는 중…' : '🏠 방을 만드는 중…', '<p class="muted">잠깐만 기다려 주세요</p>');
  peer.on('open', () => {
    if (frInviteTo) { frPost(frInviteTo, { k: 'inv', code, coop: coop ? 1 : 0 }); frInviteTo = null; }
    pvpWaitModal(coop ? '🤝 레이드 방을 만들었어요!' : '🏠 방을 만들었어요!', `<p class="muted">이 코드를 친구에게 알려 주세요${coop ? ' (친구는 <b>🔑 레이드 들어가기</b>에 넣어요)' : ''}</p>
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
    if (e.type === 'unavailable-id' && retry < 3) { pvpHost(retry + 1, coop); return; }
    toast('연결 오류: ' + e.type);
  });
}
function pvpJoin(coop = false, codeIn) {
  if (!saveNick()) return;
  const code = (codeIn || ($(coop ? '#coopCode' : '#pvpCode') ? $(coop ? '#coopCode' : '#pvpCode').value : '')).trim().toUpperCase();
  if (!/^[A-Z0-9]{6}$/.test(code)) { toast('방 코드 6자리를 입력해 주세요'); return; }
  netClose();
  const peer = new Peer();
  NET = { peer, role: 'guest', code, coop };
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
  if (!window.Peer) { toast('대전 기능을 아직 불러오는 중이에요. 잠시 뒤에 다시 눌러 주세요'); return; }
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
    netSend({ t: 'hello', name: S.nick || '플레이어', team: myTeamData(), coop: !!(NET && NET.coop) });
    pvpWaitModal('🤝 연결됐어요!', `<p class="muted">${NET && NET.coop ? '레이드' : '대전'}을 준비하는 중…</p>`);
  });
  conn.on('data', onNet);
  conn.on('close', onNetClose);
  conn.on('error', () => onNetClose());
}
function onNetClose() {
  if (!NET) return;
  NET = null;
  if (B && B.coop && !B.over) {
    if (B.pvp.role === 'host') {
      B.units.forEach(u => { if (u.remote) { u.remote = false; u.aiCtl = true; } });
      if (B.remoteTurn) { const u = unitById(B.remoteTurn); B.remoteTurn = null; clearTimeout(B.remoteTimer); if (u && u.hp > 0) aiAct(u); }
      logB('🔌 친구가 나가서 컴퓨터가 친구 몬스터를 대신 조종해요');
      drawBattle();
    } else {
      B.over = true; B.waiting = false; clearTimeout(B.timer);
      B.result = { win: false, rewards: ['방장이 나가서 레이드가 끝났어요'] };
      drawBattle();
    }
    return;
  }
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
      NET.oppName = esc(safeName(String(msg.name || '친구').slice(0, 10), '친구'));
      NET.oppTeam = Array.isArray(msg.team) ? msg.team.slice(0, 3) : [];
      // 대전 방과 레이드 방이 섞이면 안내하고 끊기
      if (!!msg.coop !== !!NET.coop) { toast(NET.coop ? '친구가 대전으로 들어왔어요. 둘 다 🤝 레이드로 해 주세요' : '친구가 레이드로 들어왔어요. 둘 다 같은 방식으로 해 주세요'); netSend({ t: 'bye' }); netClose(); closeModal(); break; }
      if (NET.role === 'host' && !NET.started) { if (NET.coop) startCoopBattle(); else startPvpBattle(); }
      break;
    case 'start': if (NET.role === 'guest') { if (msg.coop) startCoopGuest(msg); else startPvpGuest(msg); } break;
    case 'state': if (NET.role === 'guest') applyPvpState(msg); break;
    case 'skill': if (NET.role === 'guest') playPvpSkill(msg); break;
    case 'act': if (NET.role === 'host') remoteAct(msg); break;
    case 'end':
      if (NET.role === 'guest' && B && B.pvp && !B.over && B.coop) {
        const win = !!msg.hostWin;
        B.over = true; B.waiting = false;
        B.result = { win, rewards: coopRewards(win) };
        save(); drawBattle(); updateHud();
      } else if (NET.role === 'guest' && B && B.pvp && !B.over) {
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
  S.potBattleOn = false;
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
  // 협동: 친구가 25초 동안 안 고르면 컴퓨터가 대신
  if (B.coop) { const b = B; clearTimeout(b.remoteTimer); b.remoteTimer = setTimeout(() => { if (B === b && !b.over && b.remoteTurn === u.id) { b.remoteTurn = null; logB('⏰ 친구 대신 컴퓨터가 골랐어요'); aiAct(u); } }, 25000); }
}
// ===================== 🤝 협동 레이드 =====================
const COOP_BOSSES = [
  { name: '멸망의 용왕',   face: '🐉', els: ['fire', 'dark', 'magic'], ult: '멸망의 불꽃' },
  { name: '태초의 크라켄', face: '🦑', els: ['water', 'dark', 'ice'], ult: '심해의 분노' },
  { name: '천공의 신조',   face: '🦅', els: ['thunder', 'light', 'nature'], ult: '하늘 가르기' },
  { name: '공허의 눈',     face: '👁️', els: ['magic', 'dark', 'poison'], ult: '공허의 시선' },
  { name: '대지의 거신',   face: '🗿', els: ['earth', 'metal', 'nature'], ult: '대지 붕괴' },
];
const gflip = (id) => (B && B.coop ? id : flipId(id));
function coopBossDef(k) {
  const base = COOP_BOSSES[Math.max(0, Math.min(COOP_BOSSES.length - 1, Number(k) || 0))], e = base.els;
  return { ...base, id: 'coop' + k, rarity: 'divine', enrage: 1,
    skills: [basicSkill(e[0]), atkSkill(e[0]), effSkill(e[1]), atkSkill(e[2]), { name: base.ult, el: e[0], type: 'dmg', mult: 1.35, aoe: true, cost: 6 }] };
}
function coopRewards(win) {
  const out = [];
  if (win) {
    const gold = Math.max(20000, Math.round(totalIncome() * 1800));
    earn(gold); earn(60, 'gems');
    out.push(`💰 ${fmt(gold)}`, '💎 60', runeText(giveRune([0, 0, 1])));
    const pool = CAT_LIST.filter(c => c.rarity === 'legendary' && !c.shop), c = pool[Math.floor(Math.random() * pool.length)];
    if (S.hatch.length < hatchCap()) { S.hatch.push(c.id); out.push(`👑 ${c.face} ${c.name} 알`); } else { earn(100, 'gems'); out.push('💎 100 (부화장이 가득)'); }
    statAdd('coopWin', 1);
    mission('win');
  } else {
    const gold = Math.max(2000, Math.round(totalIncome() * 300));
    earn(gold);
    out.push(`아쉬워요! 위로금 💰 ${fmt(gold)}`);
  }
  save();
  return out;
}
// 방장: 내 팀 + 친구 팀(최대 6마리) vs 보스 (두 팀 힘에 맞춰 아주 세게)
function startCoopBattle() {
  S.potBattleOn = false;
  const mine = S.team.map(byUid).filter(Boolean).slice(0, 3);
  const friend = NET.oppTeam.map((d, k) => netUnit(d, 'me', 3 + k)).filter(Boolean);
  if (!mine.length || !friend.length) { toast('둘 다 팀이 있어야 해요'); netSend({ t: 'bye' }); netClose(); closeModal(); return; }
  NET.started = true;
  closeModal();
  const myUnits = mine.map((m, k) => mkUnit(m, 'me', k));
  friend.forEach((u, k) => { u.id = 'me' + (3 + k); u.remote = true; u.ally = true; });
  const all = [...myUnits, ...friend];
  const sumAtk = all.reduce((s, u) => s + u.atk, 0), avgHp = all.reduce((s, u) => s + u.maxHp, 0) / all.length;
  const bk = Math.floor(Math.random() * COOP_BOSSES.length), def = coopBossDef(bk);
  const hp = Math.max(5000, Math.round(sumAtk * 12)), lv = Math.max(10, ...all.map(u => u.lv)) + 5;
  const boss = { id: 'foe0', side: 'foe', c: def, lv, boss: true, turns: 3, maxHp: hp, hp, dispHp: hp, shownDead: false,
    atk: Math.max(30, Math.round(avgHp * 0.07)), spd: 150, sta: 4, fx: newFx() };
  B = {
    stage: S.stage, coop: true, pvp: { role: 'host', oppName: NET.oppName, coop: true },
    units: [...all, boss],
    order: [], cur: null, target: 'foe0', log: [], round: 0, remoteTurn: null,
    waiting: false, over: false, fast: !!S.fastBattle, auto: !!S.autoBattle, timer: null, result: null, built: false,
  };
  $('#battle').classList.remove('hidden');
  updateGuide();
  logB(`🤝 ${NET.oppName}와(과) 함께 ${def.face} ${def.name} 레이드 시작! 체력이 절반 아래면 😡 분노해요`);
  netSend({ t: 'start', coop: true, name: S.nick || '플레이어', bk,
    units: B.units.map(u => ({ id: u.id, side: u.side, type: u.boss ? null : u.c.id, lv: u.lv, hp: u.maxHp, atk: u.atk, spd: u.spd, remote: !!u.remote, boss: !!u.boss, turns: u.turns || 1 })) });
  drawBattle();
  later(nextTurn, 1200);
}
// 친구 쪽: 같은 편으로 (뒤집지 않음). 내 몬스터 = 방장이 remote로 표시한 것
function startCoopGuest(msg) {
  if (!Array.isArray(msg.units)) return;
  NET.started = true;
  NET.oppName = esc(safeName(String(msg.name || '').slice(0, 10), NET.oppName || '친구'));
  closeModal();
  const def = coopBossDef(msg.bk);
  const num = (v, lo, hi) => Math.max(lo, Math.min(hi, Number(v) || lo));
  const units = msg.units.map(d => {
    if (d.boss) { const hp = num(d.hp, 1, 1e9); return { id: 'foe0', side: 'foe', c: def, lv: num(d.lv, 1, 99), boss: true, turns: num(d.turns, 1, 5), maxHp: hp, hp, dispHp: hp, shownDead: false, atk: num(d.atk, 1, 1e7), spd: num(d.spd, 1, 1e4), sta: 4, fx: newFx() }; }
    const u = netUnit(d, d.side === 'foe' ? 'foe' : 'me', 0);
    if (!u) return null;
    u.id = String(d.id).slice(0, 6);
    u.mine = !!d.remote;          // 방장이 remote로 보낸 게 내 몬스터
    u.ally = !d.remote;           // 나머지는 친구(방장) 몬스터
    return u;
  }).filter(Boolean);
  B = {
    stage: S.stage, coop: true, pvp: { role: 'guest', oppName: NET.oppName, coop: true }, anim: 0,
    units, order: [], cur: null, target: 'foe0', log: [`🤝 ${NET.oppName}와(과) 함께 ${def.face} ${def.name} 레이드 시작!`], round: 0,
    waiting: false, over: false, fast: !!S.fastBattle, auto: !!S.autoBattle, timer: null, result: null, built: false,
  };
  $('#battle').classList.remove('hidden');
  updateGuide();
  drawBattle();
}
// 친구 쪽 자동 전투: 쓸 수 있는 가장 센 스킬을 골라서 보낸다
function coopAutoPick() {
  if (!B || !B.coop || !B.waiting || !B.cur) return;
  const u = B.cur, low = aliveOf('me').some(a => a.hp < a.maxHp * 0.5);
  const opts = u.c.skills.map((s, i) => ({ s, i })).filter(({ s }) => s.cost <= u.sta);
  const heal = opts.find(({ s }) => (s.type === 'healTeam' || s.type === 'healSelf') && low);
  const best = heal || opts.sort((a, b) => (b.s.mult || 0) * (b.s.aoe ? 1.2 : 1) - (a.s.mult || 0) * (a.s.aoe ? 1.2 : 1))[0];
  if (best) playerSkill(best.i);
}
function remoteAct(msg) {
  if (!B || B.over || !B.remoteTurn) return;
  const u = unitById(B.remoteTurn);
  const sk = u && u.c.skills[Number(msg.i)];
  if (!u || !sk || sk.cost > u.sta) return;
  let tgt = unitById(msg.target);
  const enemySide = B.coop ? 'foe' : 'me';   // 협동이면 친구도 보스를 공격
  if (!tgt || tgt.side !== enemySide || tgt.hp <= 0) tgt = aliveOf(enemySide)[0];
  clearTimeout(B.remoteTimer);
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
  NET.oppName = esc(safeName(String(msg.name || '').slice(0, 10), NET.oppName || '친구'));
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
    const u = unitById(gflip(su.id));
    if (!u) return;
    u.hp = su.hp;
    u.sta = su.sta;
    u.fx = su.fx || newFx();
    if (!B.anim) u.dispHp = su.dispHp;
    if (su.shownDead) u.shownDead = true;
  });
  B.round = msg.round || 0;
  B.log = Array.isArray(msg.log) ? msg.log.map(String) : B.log;
  B.cur = unitById(gflip(msg.cur)) || null;
  B.waiting = !!msg.remote && !!B.cur && B.cur.id === gflip(msg.remote);
  if (B.waiting && B.coop && B.auto) setTimeout(coopAutoPick, 500);
  if (B.waiting) { const t = unitById(B.target); if (!t || t.hp <= 0) { const f = aliveOf('foe')[0]; if (f) B.target = f.id; } }
  drawBattle();
}
function playPvpSkill(msg) {
  if (!B || !B.pvp) return;
  const att = unitById(gflip(msg.att));
  const sk = att && att.c.skills[Number(msg.sk)];
  if (!att || !sk) return;
  const events = (msg.events || []).map(e => ({ ...e, t: unitById(gflip(e.t)) })).filter(e => e.t);
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
  codeBox('🏝️ 내 섬 코드', code, `아래 <b>4자리 숫자</b>를 친구에게 알려 주면, 친구가 👀 친구 섬 구경에 넣어서 내 섬 ${islCount()}개를 구경해요. 창을 열어 둔 동안 여러 친구가 받아 갈 수 있어요.`, { once: false });
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
  const vMax = Math.min(ISL_MAX * ISLAND_PLOTS, Math.max(PLOTS, ...d.plots.map(p => Math.ceil((Number(p[0]) + 1) / ISLAND_PLOTS) * ISLAND_PLOTS).filter(x => x > 0)));
  const plots = Array(vMax).fill(null);
  const n = (v, lo, hi) => Math.max(lo, Math.min(hi, Math.floor(Number(v)) || lo));
  d.plots.forEach(([i, k, a, b]) => {
    i = Number(i);
    if (!(i >= 0 && i < vMax)) return;
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
  S = { ...real, plots, monsters: mons, hatch: [], team: [], isl: n(d.isl, 0, plots.length / ISLAND_PLOTS - 1), tutOff: true, hideUI: false, breedLog: [], giftBox: [] };
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
    const d = JSON.parse(readSave(a.id));
    if (!d) return '새 섬';
    return `몬스터 ${fmt((d.monsters || []).length)} · 도감 ${fmt(Object.keys(d.dex || {}).length)} · 💰${d.infinite ? '∞' : fmt(d.gold || 0)}`;
  } catch (e) { return '새 섬'; }
}
function openLogin() {
  flushSave();
  const list = accounts();
  const el = $('#login');
  el.innerHTML = `<div class="login-box">
    <div class="login-logo"><img src="icon.svg" alt=""><br>몬스터 합치기</div>
    <p class="muted">어느 계정으로 들어갈까요?</p>
    <div class="acc-list">${list.map(a => `
      <div class="acc-row">
        <button class="acc-card ${ACC && a.id === ACC.id ? 'on' : ''}" data-act="accPick" data-id="${a.id}">
          <span class="acc-icon">👤</span>
          <span class="acc-nm">${esc(a.name)} ${a.pin ? '🔒' : ''}<small>${accLocked(a) ? `⛔ 잠김 · ${lockLeft(accLocked(a))} 뒤에 풀려요` : accSummary(a)}</small></span>
        </button>
        <button class="btn ghost small danger" data-act="accDel" data-id="${a.id}" title="계정 삭제">🗑️</button>
      </div>`).join('')}</div>
    <div class="row">
      <button class="btn" data-act="accNew">➕ 새 계정 만들기</button>
      <button class="btn ghost" data-act="accImport">📥 다른 기기에서 가져오기</button>
    </div>
    <div class="row"><button class="btn ghost small" data-act="lang" translate="no">🌐 ${window.LANG === 'en' ? '한국어' : 'English'}</button></div>
    <p class="muted small-note">계정은 이 기기(브라우저)에 저장돼요. 다른 기기로 옮기려면 게임 안 👤 메뉴의 📤 옮기기 코드를 쓰세요.</p>
  </div>`;
  el.classList.remove('hidden');
}
function closeLogin() { $('#login').classList.add('hidden'); updateGuide(); }
function accPick(id) {
  const a = accounts().find(x => x.id === id);
  if (!a) return;
  if (accLocked(a)) { lockToast(a, accLocked(a)); return; }
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
  if (accLocked(a)) { lockToast(a, accLocked(a)); openLogin(); return; }
  if (VISIT) visitExit();
  if (B) { clearTimeout(B.timer); if (B.pvp) { netSend({ t: 'bye' }); netClose(); } B = null; $('#battle').classList.add('hidden'); }
  if (ACC && S) { save(); flushSave(); }
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
  if (nameProblem(name)) { toast(nameProblem(name)); return; }
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
  // 온라인 기록(랭킹·길드)에서도 바로 빠지게
  try { const old = JSON.parse(readSave(id) || 'null'); if (old && old.rankId) rankDelete(old.rankId); } catch (e) { /* 저장이 없음 */ }
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
  if (!writeSave(a.id, d.save)) { toast('저장 공간이 부족해요! 안 쓰는 계정을 지우면 자리가 생겨요'); return; }
  const rest = list.filter(x => !x.auto);
  list.filter(x => x.auto).forEach(x => lsDel(accKey(x.id)));
  rest.push(a);
  saveAccounts(rest);
  closeLogin();
  enterAccount(a);
}
function openAccountMenu() {
  tutFlag('menuSeen', true);
  tutFlag('account', true);
  showModal(`<h3>👤 ${esc(ACC.name)}</h3><div class="ach-title small" data-act="achOpen">${titleName(titleIdx())} · 🏅 ${fmt(achPoints())}</div>
    <p class="muted">${accSummary(ACC)}</p>
    <div class="build-list">
      <button class="build-opt" data-act="guildOpen" style="--hc:#7dff8f"><span class="bo-ico">🛡️</span><span class="bo-nm">길드<br><small>${S.guild ? `${esc(S.guild.emblem)} ${esc(S.guild.name)}` : '길드에 들어가거나 만들기'}</small></span></button>
      <button class="build-opt" data-act="ranking" style="--hc:#ffd24a"><span class="bo-ico">🏆</span><span class="bo-nm">전 세계 랭킹<br><small>${tierOf(S.trophies).icon} ${tierOf(S.trophies).name} · 🏆 ${fmt(S.trophies || 0)}</small></span></button>
      <button class="build-opt" data-act="accSwitch" style="--hc:#6f8cff"><span class="bo-ico">🔄</span><span class="bo-nm">계정 바꾸기 / 새 계정</span></button>
      <button class="build-opt" data-act="accExport" style="--hc:#3fd6a4"><span class="bo-ico">📤</span><span class="bo-nm">이 계정 옮기기 코드<br><small>다른 기기에서 📥 가져오기에 붙여 넣으면 내 섬이 그대로 가요</small></span></button>
      <button class="build-opt" data-act="accRename" style="--hc:#ffb020"><span class="bo-ico">✏️</span><span class="bo-nm">이름 바꾸기</span></button>
      <button class="build-opt" data-act="accPinSet" style="--hc:#ff5ce1"><span class="bo-ico">🔒</span><span class="bo-nm">비밀번호 ${ACC.pin ? '바꾸기 / 없애기' : '만들기'}</span></button>
      ${isPhone() && !isStandalone() ? `<button class="build-opt" data-act="fullscreen" style="--hc:#ffb020"><span class="bo-ico">⛶</span><span class="bo-nm">전체화면 ${isFull() ? '끄기' : '켜기'}<br><small>주소창·상태바 없이 게임만 꽉 차게</small></span></button>` : ''}
      <button class="build-opt" data-act="lang" style="--hc:#5cc8ff" translate="no"><span class="bo-ico">🌐</span><span class="bo-nm">${window.LANG === 'en' ? '한국어로 바꾸기 (Korean)' : 'English (영어로 바꾸기)'}</span></button>
      <button class="build-opt" data-act="mute" style="--hc:#ff6b6b"><span class="bo-ico">${muteOn() ? '🔇' : '🔊'}</span><span class="bo-nm">무음 모드 ${muteOn() ? '켜짐 (누르면 소리 켜기)' : '꺼짐 (누르면 모든 소리 끄기)'}</span></button>
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
  if (nameProblem(name)) { toast(nameProblem(name)); return; }
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
function countLoginDay() {
  if (S.lastLoginDay === dayKey()) return;
  S.lastLoginDay = dayKey();
  S.loginDays = (S.loginDays || 0) + 1;
  save();
}
function openFirstAccount() {
  const el = $('#login');
  el.innerHTML = `<div class="login-box first-acc">
    <div class="login-logo"><img src="icon.svg" alt=""><br>몬스터 합치기</div>
    <h3>👋 처음 오셨네요! 계정을 만들어요</h3>
    <p class="muted">내 섬의 이름이에요. 랭킹 · 길드 · 친구에게도 보여요.</p>
    <input id="firstName" maxlength="10" placeholder="이름 (예: 진희)" autocomplete="off">
    <input id="firstPin" type="password" inputmode="numeric" maxlength="4" autocomplete="off" placeholder="비밀번호 4자리 (없어도 돼요)">
    <div class="row"><button class="btn big green" data-act="firstAccOk">✨ 계정 만들고 시작하기</button></div>
    <p class="muted small-note">🙅 욕설이나 전화번호 같은 개인정보는 이름에 쓸 수 없어요.</p>
    <div class="row"><button class="btn ghost small" data-act="accImport">📥 다른 기기에서 하던 섬 가져오기</button><button class="btn ghost small" data-act="lang" translate="no">🌐 ${window.LANG === 'en' ? '한국어' : 'English'}</button></div>
  </div>`;
  el.classList.remove('hidden');
  const inp = $('#firstName');
  if (inp) { inp.focus(); inp.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.isComposing) firstAccOk(); }); }
  updateGuide();
}
function firstAccOk() {
  const name = (($('#firstName') || {}).value || '').trim().slice(0, 10);
  const pin = (($('#firstPin') || {}).value || '').trim();
  if (!name) { toast('이름을 적어 주세요'); return; }
  if (nameProblem(name)) { toast(nameProblem(name)); return; }
  if (pin && !/^\d{4}$/.test(pin)) { toast('비밀번호는 숫자 4자리예요'); return; }
  const list = accounts(), a = list.find(x => x.id === ACC.id);
  if (!a) return;
  if (list.some(x => x.name === name && x.id !== a.id)) { toast('같은 이름의 계정이 이미 있어요'); return; }
  a.name = name; a.pin = pin ? pinHash(a.id, pin) : null; delete a.auto;
  saveAccounts(list);
  ACC = a; S.nick = name; save();
  closeLogin();
  sfx('yay');
  toast(`🎉 ${name}님의 섬이 만들어졌어요!`);
  setTimeout(afterEnter, 300);
}
function afterEnter() {
  countLoginDay();
  // 처음 온 사람은 계정부터 (자동으로 만든 계정이면)
  if (ACC && ACC.auto) { openFirstAccount(); return; }
  if (!$('#modal').classList.contains('hidden') || B || !$('#login').classList.contains('hidden')) return;
  if (!S.welcomed) { openWelcome(0, false); return; }
  if (AWAY.sec > 300 && openWelcomeBack()) return;
  // 튜토리얼 앞부분(첫 교배 전)에는 창을 띄우지 않고 🎁 빨간 점으로만 알려 준다
  if (dailyReady() && (S.tutOff || tutStep() >= 8)) { openDaily(); return; }
  const ev = evtNow();
  if ((S.tutCoreDone || tutStep() >= 13) && S.evtSeen !== ev.key) openEvent();
  else if (S.evtSeen !== ev.key) toast(`🎉 이벤트: ${ev.e} ${ev.name} (${ev.desc})`);
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
  // --- 새 보스: 체력이 절반 아래가 되면 분노해서 공격이 세진다 ---
  { name: '심해 크라켄',       face: '🐙', els: ['water', 'dark'],            lv: 28, hp: 40000,  atk: 300,  spd: 132, turns: 3, ult: '심연의 소용돌이', gold: 250000,    gems: 180, rune: [0, 0, 1], enrage: 1 },
  { name: '용암 거인',         face: '🌋', els: ['fire', 'earth'],            lv: 30, hp: 55000,  atk: 360,  spd: 120, turns: 3, ult: '화산 폭발',       gold: 500000,    gems: 200, rune: [0, 0, 1], enrage: 1 },
  { name: '폭풍의 신',         face: '⛈️', els: ['thunder', 'light'],        lv: 32, hp: 75000,  atk: 430,  spd: 150, turns: 3, ult: '천벌의 번개',     gold: 1000000,   gems: 250, rune: [0, 0, 1], enrage: 1 },
  { name: '흡혈 백작',         face: '🧛', els: ['dark', 'poison'],           lv: 34, hp: 100000, atk: 500,  spd: 145, turns: 3, ult: '피의 만찬',       gold: 2000000,   gems: 300, rune: [0, 0, 1], enrage: 1 },
  { name: '황금 전갈 황제',    face: '🦂', els: ['poison', 'metal'],          lv: 36, hp: 130000, atk: 580,  spd: 138, turns: 3, ult: '황금 독침',       gold: 4000000,   gems: 350, rune: [0, 0, 1], enrage: 1 },
  { name: '영원의 빙하 거신',  face: '🧊', els: ['ice', 'earth'],             lv: 38, hp: 170000, atk: 680,  spd: 125, turns: 4, ult: '절대 영도',       gold: 8000000,   gems: 400, rune: [0, 0, 1], enrage: 1 },
  { name: '기계신 오메가',     face: '🤖', els: ['metal', 'thunder', 'magic'], lv: 40, hp: 220000, atk: 800,  spd: 150, turns: 4, ult: '오메가 캐논',     gold: 16000000,  gems: 500, rune: [0, 0, 1], enrage: 1 },
  { name: '일식의 늑대 펜리르', face: '🐺', els: ['dark', 'ice', 'light'],    lv: 45, hp: 280000, atk: 950,  spd: 165, turns: 4, ult: '태양 삼키기',     gold: 32000000,  gems: 600, rune: [0, 0, 1], enrage: 1 },
  { name: '태양신 라',         face: '🌞', els: ['light', 'fire', 'magic'],   lv: 50, hp: 340000, atk: 1150, spd: 160, turns: 4, ult: '태양의 심판',     gold: 64000000,  gems: 800, rune: [0, 0, 1], enrage: 1 },
  { name: '창세의 용 오리진',   face: '🐲', els: ['magic', 'light', 'dark'],   lv: 60, hp: 420000, atk: 1400, spd: 175, turns: 5, ult: '창세의 숨결',     gold: 128000000, gems: 1000, rune: [0, 0, 1], enrage: 1 },
];
BOSSES.forEach((b, i) => {
  const e = b.els;
  b.id = 'boss' + i;
  b.rarity = 'legendary';
  b.skills = [basicSkill(e[0]), atkSkill(e[0]), effSkill(e[1]), atkSkill(e[1]),
    { name: b.ult, el: e[0], type: 'dmg', mult: 1.3, aoe: true, cost: 6 }];
});
const bossUnlocked = (i) => i === 0 || !!S.bossCleared[i - 1];

// ----- 🔥 오늘의 레이드: 매일 바뀌는 거대 보스. 하루 3번, 한 번에 10라운드. 준 피해가 쌓여서 보상 -----
const RAID_TRIES = 3, RAID_ROUNDS = 10;
const RAID_BOSSES = [
  { name: '화염 거신 이프리트',   face: '👹', els: ['fire', 'earth'], ult: '대지의 불꽃' },
  { name: '심연의 리바이어던',    face: '🐋', els: ['water', 'dark'], ult: '해일' },
  { name: '뇌신 토르',            face: '🌩️', els: ['thunder', 'metal'], ult: '묠니르 강타' },
  { name: '세계수의 수호자',      face: '🌳', els: ['nature', 'light'], ult: '생명의 폭풍' },
  { name: '그림자 군주',          face: '👤', els: ['dark', 'magic'], ult: '어둠의 장막' },
  { name: '서리 여왕',            face: '👸', els: ['ice', 'water'], ult: '영원한 겨울' },
  { name: '역병의 왕',            face: '☠️', els: ['poison', 'dark'], ult: '죽음의 역병' },
];
const RAID_TIERS = [
  { pct: 10,  r: { gems: 10 } },
  { pct: 30,  r: { gems: 20, rune: 1 } },
  { pct: 60,  r: { gems: 40, rune: 2 } },
  { pct: 100, r: { gems: 80, legend: 1 } },
];
// 오늘의 레이드 보스 (처음 볼 때 내 팀 힘에 맞춰 정하고, 그날은 그대로)
function raidToday() {
  const day = dayKey();
  if (S.raid && S.raid.day === day) return S.raid;
  let team = S.team.map(byUid).filter(Boolean);
  if (!team.length) team = S.monsters.slice().sort((a, b) => monPower(b) - monPower(a)).slice(0, 3);
  const units = team.map((m, k) => mkUnit(m, 'me', k));
  const sumAtk = units.reduce((s, u) => s + u.atk, 0) || 150, avgHp = units.length ? units.reduce((s, u) => s + u.maxHp, 0) / units.length : 400;
  const d = new Date(), idx = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000) % RAID_BOSSES.length;
  // 3번 모두 잘 싸우면 쓰러뜨릴 수 있게 (내 팀 공격력 × 20)
  const hp = Math.max(3500, Math.round(sumAtk * 20));
  S.raid = { day, idx, maxHp: hp, hp, atk: Math.max(25, Math.round(avgHp * 0.06)), spd: 130, lv: Math.max(5, ...team.map(m => m.lv)), tries: RAID_TRIES, got: [], best: 0 };
  return S.raid;
}
function raidDef() {
  const r = raidToday(), base = RAID_BOSSES[r.idx], e = base.els;
  return { ...base, id: 'raid', rarity: 'mythic', enrage: 1,
    skills: [basicSkill(e[0]), atkSkill(e[0]), effSkill(e[1]), atkSkill(e[1]), { name: base.ult, el: e[0], type: 'dmg', mult: 1.3, aoe: true, cost: 6 }] };
}
const raidPct = () => { const r = raidToday(); return Math.floor((1 - r.hp / r.maxHp) * 100); };
function raidCardHTML() {
  const r = raidToday(), d = raidDef(), pct = raidPct();
  const weak = EL.filter(e => BEATS[e.id].some(x => d.els.includes(x)));
  return `<div class="raid-card ${r.hp <= 0 ? 'cleared' : ''}">
    <div class="raid-top"><span class="raid-face">${d.face}</span>
      <div><div class="raid-nm">🔥 오늘의 레이드 · ${d.name}</div>
      <div class="muted">${elBadges(d.els)} · 약점 ${weak.map(e => e.emoji).join('')} · 하루 ${RAID_TRIES}번, 한 번에 ${RAID_ROUNDS}라운드 · 내일 새 보스</div></div></div>
    <div class="raid-hp"><i style="width:${Math.max(0, r.hp / r.maxHp * 100)}%"></i><b>❤️ ${shortNum(Math.max(0, r.hp))} / ${shortNum(r.maxHp)} · 준 피해 ${pct}%</b></div>
    <div class="raid-tiers">${RAID_TIERS.map((t, k) => { const ok = pct >= t.pct, got = r.got.includes(k);
      return `<button class="raid-tier ${got ? 'got' : ok ? 'ok' : ''}" data-act="raidClaim" data-k="${k}" ${ok && !got ? '' : 'disabled'}><b>${t.pct}%</b><small>${got ? '✅' : rText(t.r)}</small></button>`; }).join('')}</div>
    <button class="btn big ${r.hp > 0 && r.tries > 0 ? 'green' : ''}" data-act="raidFight" ${r.hp > 0 && r.tries > 0 && S.team.length ? '' : 'disabled'}>${r.hp <= 0 ? '🏆 오늘 레이드 성공!' : r.tries > 0 ? `⚔️ 레이드 도전 (남은 기회 ${r.tries}/${RAID_TRIES})` : '내일 다시 도전해요'}</button>
  </div>`;
}
function startRaid() {
  tutFlag('raid', true);
  const r = raidToday();
  const team = S.team.map(byUid).filter(Boolean);
  if (!team.length) { toast('먼저 팀을 짜 주세요 (⚡ 자동 편성)'); return; }
  if (B || r.hp <= 0 || r.tries <= 0) return;
  r.tries--;
  save();
  potBattleStart();
  const d = raidDef();
  const boss = { id: 'foe0', side: 'foe', c: d, lv: r.lv, boss: true, turns: 2, maxHp: r.maxHp, hp: r.hp, dispHp: r.hp, shownDead: false,
    atk: r.atk, spd: r.spd, sta: 4, fx: { burn: 0, burnDmg: 0, poison: 0, poisonDmg: 0, stun: 0, shield: 0, buff: 0, curse: 0 } };
  B = {
    stage: S.stage, raid: { startHp: r.hp },
    units: [...team.map((m, k) => mkUnit(m, 'me', k)), boss],
    order: [], cur: null, target: 'foe0', log: [], round: 0,
    waiting: false, over: false, fast: !!S.fastBattle, auto: !!S.autoBattle, timer: null, result: null, built: false,
  };
  $('#battle').classList.remove('hidden');
  updateGuide();
  logB(`🔥 레이드 보스 ${d.name} 등장! ${RAID_ROUNDS}라운드 동안 최대한 피해를 줘요!`);
  drawBattle();
  later(nextTurn, 700);
}
// 레이드가 끝나면: 준 피해만큼 보스 체력이 줄어든 채로 저장
function raidResult(win) {
  const r = raidToday(), boss = B.units.find(u => u.side === 'foe');
  const dmg = Math.max(0, B.raid.startHp - Math.max(0, boss.hp));
  r.hp = Math.max(0, boss.hp);
  r.best = Math.max(r.best || 0, dmg);
  statAdd('raidDmg', dmg);
  if (r.hp <= 0) statAdd('raidClear', 1);
  save();
  return [`🔥 준 피해 ${fmt(dmg)} (보스 ${raidPct()}%)`, r.hp <= 0 ? '🏆 레이드 보스 쓰러뜨림!' : `남은 기회 ${r.tries}번`];
}
function raidClaim(k) {
  k = Number(k);
  const r = raidToday(), t = RAID_TIERS[k];
  if (!t || r.got.includes(k) || raidPct() < t.pct) return;
  r.got.push(k);
  const got = qReward(t.r);
  save(); updateHud(); sfx('yay'); toast(`🔥 레이드 보상! ${got}`);
  render();
}

function renderBossList() {
  return `${raidCardHTML()}<div class="boss-list">${BOSSES.map((b, i) => {
    const open = bossUnlocked(i), cleared = !!S.bossCleared[i];
    const weak = EL.filter(e => BEATS[e.id].some(x => b.els.includes(x)));
    return `<div class="boss-card ${open ? '' : 'locked'} ${cleared ? 'cleared' : ''}">
      <div class="boss-face" style="background:${grad(b)}">${open ? b.face : '🔒'}</div>
      <div class="boss-info">
        <div class="boss-nm">${open ? b.name : '???'} ${cleared ? '✅' : ''}</div>
        <div class="muted">Lv.${b.lv} · ${elBadges(b.els)} · ❤️ ${fmt(b.hp)} · ${'⚡'.repeat(b.turns)} ${b.turns > 1 ? `한 턴에 ${b.turns}번 행동` : ''}</div>
        <div class="muted">약점: ${weak.map(e => e.emoji).join('')}${b.enrage ? ' · 😡 체력 절반에서 분노' : ''}</div>
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
  potBattleStart();
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
    // Math.imul: 큰 수를 곱해도 정확한 32비트 계산 (예전엔 숫자가 커서 같은 미션만 계속 나와 게임이 멈췄다)
    for (let guard = 0; ids.length < 3 && guard < 200; guard++) { const id = pool[n % pool.length]; n = (Math.imul(n, 1103515245) + 12345) >>> 0; if (!ids.includes(id)) ids.push(id); }
    // 그래도 모자라면 차례대로 채운다 (절대 멈추지 않게)
    for (const id of pool) { if (ids.length >= 3) break; if (!ids.includes(id)) ids.push(id); }
    S.mis = { day: k, ids, prog: {}, got: [], bonus: false };
  }
  return S.mis;
}
function mission(id, n = 1) {
  evtToken(id, n);
  S.stat = S.stat || {};
  S.stat[id] = (S.stat[id] || 0) + n;
  updateQuestBtn();
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
  ...[5, 10, 25, 50, 100, 200, 400, 700, 1000, 1500, 2000, 3000, 4000, 6000, 8000, 10000, 15000, 20000].map((n, k) => ({ id: 'dex' + n, text: `📖 도감 ${fmt(n)}마리 모으기`, now: () => Object.keys(S.dex).length, need: n, gems: [5, 10, 15, 25, 40, 60, 80, 100, 150, 200, 500, 800, 1500, 2500, 4000, 10000, 15000, 30000][k] })),
  ...[3, 5, 10, 15, 20, 30, 40, 50].map((n, k) => ({ id: 'stage' + n, text: `⚔️ 모험 스테이지 ${n} 도착`, now: () => S.stage, need: n, gems: [5, 10, 20, 30, 40, 60, 80, 100][k] })),
  ...['rare', 'epic', 'legendary', 'mythic', 'divine', 'holy', 'absolute', 'origin'].map((r, k) => ({ id: 'rank' + r, text: `✨ ${RAR[r].name} 등급 몬스터 얻기`, now: () => (S.monsters.some(m => RANK[CAT[m.type].rarity] >= RANK[r]) ? 1 : 0), need: 1, gems: [5, 10, 30, 60, 100, 150, 200, 300][k] })),
  ...[1, 4, 8, 12].map((n, k) => ({ id: 'pets' + n, text: `🐾 펫 ${n}마리 모으기`, now: () => PETS.filter(p => petLv(p.id)).length, need: n, gems: [5, 20, 50, 150][k] })),
  ...[1, 10, 30, 60].map((n, k) => ({ id: 'cos' + n, text: `🌌 우주 발전 합계 Lv.${n}`, now: () => cosTotal(), need: n, gems: [100, 300, 800, 2000][k] })),
  ...[5, 20, 50, 100].map((n, k) => ({ id: 'kd' + n, text: `🏛️ 왕국 발전 합계 Lv.${n}`, now: () => KINGDOM.reduce((s, x) => s + kdLv(x.id), 0), need: n, gems: [20, 50, 120, 300][k] })),
  ...[1, 4, 8].map((n, k) => ({ id: 'wonder' + n, text: `🗽 랜드마크 ${n}개 세우기`, now: () => DECOS.filter(d => d.wonder && S.plots.some(p => p && p.kind === 'deco' && p.id === d.id)).length, need: n, gems: [30, 100, 500][k] })),
  ...[1, 3, 6].map((n, k) => ({ id: 'evpet' + n, text: `🎉 이벤트 한정 펫 ${n}마리`, now: () => PETS.filter(p => p.event && petLv(p.id)).length, need: n, gems: [30, 100, 300][k] })),
  ...[1, 3, 5].map((n, k) => ({ id: 'star' + n, text: `⭐ ★${n} 몬스터 만들기`, now: () => Math.max(0, ...S.monsters.map(m => m.star || 0)), need: n, gems: [10, 40, 150][k] })),
  ...[1, 10, 50].map((n, k) => ({ id: 'altar' + n, text: `🔮 합성 제단 ${n}번 쓰기`, now: () => S.altarCount || 0, need: n, gems: [10, 40, 150][k] })),
  { id: 'guild1', text: '🛡️ 길드에 들어가거나 만들기', now: () => (S.guild ? 1 : 0), need: 1, gems: 20 },
  ...[200, 500, 900, 1400].map((n, k) => ({ id: 'troph' + n, text: `🏆 트로피 ${fmt(n)} 모으기`, now: () => S.trophies || 0, need: n, gems: [10, 20, 40, 60][k] })),
  ...[3, 6, 10, 20].map((n, k) => ({ id: 'habs' + n, text: `🏠 서식지 ${n}개 짓기`, now: () => S.plots.filter(p => p && p.kind === 'hab').length, need: n, gems: [5, 10, 20, 30][k] })),
];
function statAdd(k, n) { S.stat = S.stat || {}; S.stat[k] = (S.stat[k] || 0) + n; }
// 🏆 새 업적 (단계별로 쭉)
const ACH_MORE = [
  ['breed',    '🏔️ 교배', 'stat', [10, 50, 200, 1000, 5000], [5, 15, 40, 100, 300]],
  ['hatch',    '🐣 몬스터 탄생', 'stat', [10, 50, 200, 1000], [5, 15, 40, 120]],
  ['feed',     '🍖 레벨 올리기', 'stat', [50, 300, 1500, 5000], [5, 15, 40, 120]],
  ['win',      '⚔️ 전투 승리', 'stat', [10, 50, 200, 1000], [5, 20, 50, 150]],
  ['collect',  '💰 골드 걷기', 'stat', [20, 100, 500, 2000], [5, 15, 40, 100]],
  ['gold',     '💰 번 골드 합계', 'stat', [1e5, 1e7, 1e9, 1e11, 1e13], [5, 20, 50, 150, 400]],
  ['harvest',  '🌾 수확', 'stat', [10, 50, 200, 1000], [5, 15, 40, 100]],
  ['gwarStars', '🛡️ 길드전 별 모으기', 'stat', [10, 50, 200], [10, 40, 120]],
  ['quest',    '📜 스토리 퀘스트 깨기', () => (S.quest ? S.quest.k : 0), [5, 10, 20, 30], [10, 20, 50, 200]],
  ['login',    '📅 접속한 날', () => S.loginDays || 0, [3, 7, 30, 100, 365], [5, 15, 50, 150, 500]],
  ['boss',     '👹 보스 물리치기', () => Object.keys(S.bossCleared || {}).length, [1, 3, 6, 10, 16], [10, 30, 80, 200, 600]],
  ['raidClear', '🔥 레이드 보스 쓰러뜨리기', 'stat', [1, 5, 20, 50], [20, 60, 150, 400]],
  ['clone',    '🧬 몬스터 복제', 'stat', [1, 10, 100], [50, 150, 500]],
  ['fish',     '🎣 물고기 낚기', 'stat', [1, 10, 50, 200, 500], [10, 20, 50, 120, 300]],
  ['raceWin',  '🏁 경주 1등 맞히기', 'stat', [1, 10, 50, 200], [10, 30, 100, 300]],
  ['wheel',    '🎡 룰렛 돌리기', 'stat', [1, 10, 50, 200], [5, 20, 60, 200]],
  ['memWin',   '🃏 짝 맞추기 끝내기', 'stat', [1, 10, 50, 200], [10, 30, 80, 250]],
  ['mgPlay',   '🎮 미니게임 하기', 'stat', [1, 20, 100, 500], [10, 40, 120, 400]],
  ['mystery',  '🎁 미스터리 상자 열기', 'stat', [1, 10, 50, 200], [10, 30, 80, 200]],
  ['todoAll',  '📅 오늘 할 일 다 하기', 'stat', [1, 7, 30, 100], [10, 30, 100, 300]],
  ['friendGift', '💌 친구에게 하트 보내기', 'stat', [1, 10, 50, 200], [10, 30, 80, 200]],
  ['coopWin',  '🤝 협동 레이드 승리', 'stat', [1, 5, 20], [30, 80, 200]],
  ['fusepet',  '🧪 합성 펫 모으기', () => PETS.filter(p => p.fusion && petLv(p.id)).length, [1, 4, 8], [20, 80, 250]],
  ['petstar',  '⭐ 펫 각성 ★', () => Math.max(0, ...PETS.map(p => petStar(p.id))), [1, 3], [30, 150]],
  ['lv20',     '⬆️ Lv.20 몬스터', () => S.monsters.filter(m => m.lv >= MAX_LV).length, [1, 10, 50], [10, 40, 120]],
  ['myth',     '🌌 신화 이상 몬스터', () => S.monsters.filter(m => RANK[CAT[m.type].rarity] >= RANK.mythic).length, [1, 10, 50], [20, 80, 250]],
];
ACH_MORE.forEach(([key, name, src, needs, gems]) => needs.forEach((n, k) => ACH.push({
  id: key + 'T' + n, text: `${name} ${shortNum(n)}${key === 'gold' ? '' : key === 'login' ? '일' : key === 'quest' || key === 'boss' ? '개' : key === 'lv20' || key === 'myth' ? '마리' : '번'}`,
  now: src === 'stat' ? () => stat(key) : src, need: n, gems: gems[k],
})));
ACH.push(
  { id: 'allhab', text: '🌈 처음 11가지 속성 서식지 모두 짓기', now: () => EL_OLD.filter(e => S.plots.some(p => p && p.kind === 'hab' && p.el === e.id)).length, need: 11, gems: 50 },
  { id: 'allhab20', text: `🌈 ${EL.length}가지 속성 서식지 모두 짓기`, now: () => EL.filter(e => S.plots.some(p => p && p.kind === 'hab' && p.el === e.id)).length, need: EL.length, gems: 300 },
  { id: 'gems1k', text: '💎 보석 1,000개 모으기', now: () => (S.infinite ? 1000 : S.gems), need: 1000, gems: 50 },
  { id: 'allpets', text: '🐾 펫 18마리 모두 모으기', now: () => PETS.filter(p => petLv(p.id)).length, need: PETS.length, gems: 500 },
  { id: 'maxpet', text: '🐾 Lv.10 펫 만들기', now: () => Math.max(0, ...PETS.map(p => petLv(p.id))), need: 10, gems: 60 },
  { id: 'fivestars', text: '⭐ ★5 몬스터 3마리', now: () => S.monsters.filter(m => (m.star || 0) >= 5).length, need: 3, gems: 300 },
);
// 분류
const ACH_CATS = [['all', '전체'], ['collect', '📚 수집'], ['grow', '🧬 교배·성장'], ['battle', '⚔️ 전투'], ['kingdom', '🏰 왕국·경제'], ['social', '🤝 함께'], ['special', '✨ 특별']];
const achChain = (id) => (id.startsWith('rank') ? 'rank' : id.replace(/T?\d[\d.e+]*$/, ''));
function achCat(id) {
  const c = achChain(id);
  if (['allhab', 'gems1k', 'allpets', 'maxpet', 'fivestars', 'evpet'].includes(c)) return 'special';
  if (['dex', 'pets', 'evpet', 'allpets', 'maxpet'].includes(c)) return 'collect';
  if (['breed', 'hatch', 'feed', 'star', 'altar', 'rank', 'lv', 'myth', 'fivestars'].includes(c) || c.startsWith('lv')) return 'grow';
  if (['stage', 'win', 'troph', 'gwarStars', 'boss'].includes(c)) return 'battle';
  if (['habs', 'kd', 'wonder', 'gold', 'collect', 'harvest', 'gems1k', 'allhab'].includes(c) || c.startsWith('gems')) return 'kingdom';
  if (['guild', 'quest', 'login'].includes(c)) return 'social';
  return 'special';
}
// 업적 점수(받은 보석 합) → 칭호
const TITLES = [[0, '🌱 새싹 조련사'], [50, '🐣 견습 조련사'], [200, '🌿 숙련 조련사'], [500, '⚔️ 베테랑 조련사'], [1000, '💎 엘리트 조련사'], [2000, '👑 마스터 조련사'], [4000, '🏆 전설의 조련사'], [8000, '🌌 신화의 조련사']];
const achPoints = () => ACH.filter(a => (S.achGot || []).includes(a.id)).reduce((s, a) => s + a.gems, 0);
const titleIdx = (ap = achPoints()) => TITLES.filter(t => ap >= t[0]).length - 1;
const titleName = (i) => (TITLES[Math.max(0, Math.min(TITLES.length - 1, i || 0))] || TITLES[0])[1];
let achTab = 'all';
function openAch(t) {
  tutFlag('ach', true);
  if (t) achTab = t;
  const got = S.achGot || [], ap = achPoints(), ti = titleIdx(ap), nextT = TITLES[ti + 1];
  // 같은 줄(체인)끼리 묶어서: 지금 도전 중인 단계 하나 + 메달
  const chains = {};
  ACH.forEach(a => { const c = achChain(a.id); (chains[c] = chains[c] || []).push(a); });
  const rows = Object.entries(chains).map(([c, list]) => {
    const cur = list.find(a => !got.includes(a.id)) || list[list.length - 1];
    const doneN = list.filter(a => got.includes(a.id)).length;
    return { c, list, cur, doneN, all: doneN === list.length, ready: list.some(achReady), cat: achCat(cur.id) };
  }).filter(r => achTab === 'all' || r.cat === achTab)
    .sort((a, b) => b.ready - a.ready || a.all - b.all || (b.cur.now() / b.cur.need) - (a.cur.now() / a.cur.need));
  const readyN = ACH.filter(achReady).length;
  showModal(`<h3>🏆 업적</h3>
    <div class="ach-head">
      <div class="ach-title">${titleName(ti)}</div>
      <div>🏅 업적 점수 <b>${fmt(ap)}</b>${nextT ? ` <small class="muted">· 다음 칭호 ${nextT[1]}까지 ${fmt(nextT[0] - ap)}</small>` : ' <small class="muted">· 최고 칭호!</small>'}</div>
      <div class="bar"><i style="width:${nextT ? Math.min(100, (ap - TITLES[ti][0]) / (nextT[0] - TITLES[ti][0]) * 100) : 100}%"></i></div>
      <small class="muted">완료 ${got.filter(id => ACH.some(a => a.id === id)).length} / ${ACH.length} · 칭호는 랭킹에서 이름 옆에 보여요</small>
    </div>
    <div class="chips">${ACH_CATS.map(([id, nm]) => `<button class="chip ${achTab === id ? 'on' : ''}" data-act="achTab" data-t="${id}">${nm}</button>`).join('')}</div>
    ${readyN ? `<div class="row"><button class="btn green" data-act="achAll">🎁 받을 수 있는 업적 모두 받기 (${readyN}개)</button></div>` : ''}
    <div class="mis-list ach-list">${rows.map(r => {
      const a = r.cur, p = Math.min(a.need, a.now()), ok = achReady(a);
      return `<div class="mis-row ${r.all ? 'taken' : ok ? 'done' : ''}">
        <div class="mis-info"><b>${a.text}</b> <small>${r.all ? '모두 완료!' : `${shortNum(p)}/${shortNum(a.need)}`}</small>
          <div class="ach-medals">${r.list.map(x => `<i class="${got.includes(x.id) ? 'got' : ''}"></i>`).join('')}</div>
          ${r.all ? '' : `<div class="bar"><i style="width:${p / a.need * 100}%"></i></div>`}</div>
        ${r.all ? '<span class="mis-ok">🏆</span>' : `<button class="btn small ${ok ? 'green' : ''}" data-act="achClaim2" data-id="${a.id}" ${ok ? '' : 'disabled'}>💎 ${a.gems}</button>`}
      </div>`;
    }).join('') || '<p class="muted">이 분류에는 업적이 없어요</p>'}</div>
    <div class="row"><button class="btn ghost small" data-act="close">닫기</button></div>`);
}
function achClaimOne(id) {
  const a = ACH.find(x => x.id === id);
  if (!a || !achReady(a)) return 0;
  const t0 = titleIdx();
  S.achGot = [...(S.achGot || []), id];
  earn(a.gems, 'gems');
  const t1 = titleIdx();
  if (t1 > t0) setTimeout(() => { sfx('yay'); toast(`🎖️ 새 칭호: ${titleName(t1)}!`); }, 900);
  return a.gems;
}
function achClaim2(id) {
  const g = achClaimOne(id);
  if (!g) return;
  sfx('yay'); toast(`🏆 업적 달성! 💎 ${g}`);
  save(); updateHud(); S.rankLast = null; openAch();
}
function achAll() {
  let n = 0, gems = 0;
  // 한 번 받으면 다음 단계가 열릴 수 있으니 몇 번 돌린다
  for (let loop = 0; loop < 10; loop++) { const ready = ACH.filter(achReady); if (!ready.length) break; ready.forEach(a => { gems += achClaimOne(a.id); n++; }); }
  if (!n) return;
  sfx('yay'); toast(`🏆 업적 ${n}개 달성! 💎 ${gems}`);
  save(); updateHud(); S.rankLast = null; openAch();
}
// 새로 달성한 업적 알림 (한 번씩)
function achNotify() {
  if (!ACH || VISIT) return;
  S.achSeen = S.achSeen || [];
  const fresh = ACH.filter(a => achReady(a) && !S.achSeen.includes(a.id));
  if (!fresh.length) return;
  fresh.forEach(a => S.achSeen.push(a.id));
  if (S.achSeen.length > fresh.length || S.tutCoreDone) toast(`🏆 업적 달성! ${fresh[0].text}${fresh.length > 1 ? ` 외 ${fresh.length - 1}개` : ''} → 📜 퀘스트의 🏆 업적에서 받기`);
}
setInterval(achNotify, 5000);
const achReady = (a) => !(S.achGot || []).includes(a.id) && a.now() >= a.need;
function misClaimable() {
  const m = misToday();
  return m.ids.some(id => (m.prog[id] || 0) >= MISSIONS.find(x => x.id === id).need && !m.got.includes(id)) ||
    (!m.bonus && m.got.length >= 3) || ACH.some(achReady);
}
function updateMisDot() {
  const d = $('#misDot'); if (d) d.classList.toggle('on', misClaimable());
  const m = $('#menuDot');
  if (m) { let on = false; try { on = misClaimable() || qReady() || weekReady() || ACH.some(achReady); } catch (e) { /* 아직 준비 전 */ } m.classList.toggle('on', on); }
}
// ☰ 메뉴 (폰): 작은 버튼 대신 큰 글자 버튼으로
function openMenu() {
  tutFlag('menuSeen', true);
  const it = (act, ico, name, sub, extra = '') => `<button class="menu-item" data-act="${act}" ${extra}><span>${ico}</span><b>${name}</b>${sub ? `<small>${sub}</small>` : ''}</button>`;
  let dots = {};
  try { dots = { q: qReady() || weekReady(), m: misClaimable(), a: ACH.some(achReady) }; } catch (e) { /* 준비 전 */ }
  showModal(`<div class="menu-sheet"><h3>☰ 메뉴</h3>
    <div class="menu-grid">
      ${it('quests', '📜', '퀘스트' + (dots.q ? ' 🔴' : ''), '스토리 · 주간')}
      ${it('missions', '📋', '미션' + (dots.m ? ' 🔴' : ''), '매일 3개')}
      ${it('achOpen', '🏆', '업적' + (dots.a ? ' 🔴' : ''), titleName(titleIdx()))}
      ${it('ranking', '🥇', '랭킹', '전 세계 순위')}
      ${it('guildOpen', '🛡️', '길드', S.guild ? esc(S.guild.name) : '들어가기')}
      ${it('pets', '🐾', '펫', '')}
      ${it('event', '🎉', '이벤트', evtNow().name)}
      ${it('account', '👤', '계정', esc(ACC ? ACC.name : ''))}
      ${it('help', '🎓', '튜토리얼', '')}
      ${isPhone() && !isStandalone() ? it('fullscreen', '⛶', '전체화면', isFull() ? '끄기' : '켜기') : ''}
      ${it('lang', '🌐', window.LANG === 'en' ? '한국어' : 'English', window.LANG === 'en' ? '한국어로 바꾸기' : 'Switch to English', 'translate="no"')}
      ${it('mute', muteOn() ? '🔇' : '🔊', '무음 모드', muteOn() ? '켜짐 (소리 없음)' : '꺼짐')}
      ${it('music', musicOn() ? '🎵' : '🔈', '음악', musicOn() ? '켜짐' : '꺼짐')}
      ${it('sound', soundOn() ? '🔊' : '🔇', '효과음', soundOn() ? '켜짐' : '꺼짐')}
    </div>
    <div class="row"><button class="btn ghost small" data-act="close">닫기</button></div></div>`);
}
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
    <div class="row"><button class="btn big" data-act="achOpen">🏆 업적 전체 보기 (${titleName(titleIdx())})</button></div>
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

// 🌌 우주부자: 숫자와 단위를 적으면 그만큼 받는다 (예: 3Ce · 500만 · 1.5M · 12345)
let RICH_CUR = 'gold';
function parseAmount(txt) {
  const t = String(txt || '').replace(/[,\s]/g, '');
  const m = t.match(/^(\d+(?:\.\d+)?)(.*)$/);
  if (!m) return NaN;
  const num = Number(m[1]), unit = m[2];
  if (!unit) return num;
  const en = NUM_UNITS.find(([, s]) => s.toLowerCase() === unit.toLowerCase());
  if (en) return num * en[0];
  const kr = KR_UNITS.find(([, s]) => s === unit);
  if (kr) return num * kr[0];
  return NaN;
}
function openRichGift() {
  showModal(`<div class="rich-gift"><h3>🌌 우주부자</h3>
    <p class="muted">받고 싶은 만큼 적어요! 숫자 뒤에 단위를 붙여도 돼요.<br>예) <b>3Ce</b> · <b>500만</b> · <b>1.5M</b> · <b>12345</b> (최대 100Ce)</p>
    <div class="rg-cur">${[['gold', '💰 골드'], ['gems', '💎 보석'], ['food', '🍖 먹이']].map(([k, l]) => `<button class="btn small ${RICH_CUR === k ? 'green' : 'ghost'}" data-act="richCur" data-k="${k}">${l}</button>`).join('')}</div>
    <input id="richAmt" maxlength="24" autocomplete="off" placeholder="예: 3Ce">
    <p class="muted" id="richPrev">&nbsp;</p>
    <div class="rg-quick">${['1M', '1B', '1T', '1Dc', '1Vg', '1Ce', '3Ce', '100Ce'].map(q => `<button class="btn ghost small" data-act="richQuick" data-q="${q}">${q}</button>`).join('')}</div>
    <div class="row"><button class="btn big green" data-act="richGo">🎁 받기</button><button class="btn ghost" data-act="close">닫기</button></div></div>`);
  const inp = $('#richAmt');
  const prev = () => { const n = parseAmount(inp.value); mgSet('#richPrev', inp.value.trim() ? (isFinite(n) && n > 0 ? `= ${shortNum(Math.min(n, MONEY_CAP))}${n > MONEY_CAP ? ' (최대 100Ce까지만)' : ''}` : '❓ 숫자와 단위를 확인해 주세요') : '&nbsp;'); };
  inp.addEventListener('input', prev);
  inp.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.isComposing) richGo(); });
  inp.focus();
}
function richGo() {
  const inp = $('#richAmt');
  if (!inp) return;
  const n = parseAmount(inp.value);
  if (!isFinite(n) || n <= 0) { toast('❓ 숫자를 적어 주세요 (예: 3Ce · 500만)'); return; }
  const k = RICH_CUR, ico = k === 'gold' ? '💰' : k === 'gems' ? '💎' : '🍖';
  S[k] = Math.min(MONEY_CAP, (S[k] || 0) + Math.floor(Math.min(n, MONEY_CAP)));
  save(); updateHud(); render(); sfx('win');
  closeModal();
  toast(`🌌 ${ico} ${shortNum(Math.min(n, MONEY_CAP))} 들어왔어요! (지금 ${shortNum(S[k])})`);
}
function submitCode() {
  const inp = $('#codeInput');
  if (!inp) return;
  const v = inp.value.replace(/\s/g, '');
  if (v === CE_CODE) { openRichGift(); return; }
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
  shopTab = shopTabOf(id);
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
  { text: '🏠 상점에서 서식지를 지어요', done: () => S.plots.some(p => p && p.kind === 'hab'), go: () => goShop('shopHab') },
  { text: '🥚 같은 속성 알을 사요', done: () => S.monsters.length > 0 || S.hatch.length > 0 || allIncs().some(x => x.b), go: () => goShop('shopEgg') },
  { text: '🐣 알을 눌러 깨워요', done: () => S.monsters.length > 0, go: () => goPlot(hatcheries()[0]) },
  { text: '🥚 알을 하나 더 사서 깨워요 (교배는 2마리!)', done: () => S.monsters.length >= 2, go: () => (S.hatch.length || allIncs().some(x => x.b) ? goPlot(hatcheries()[0]) : goShop('shopEgg')) },
  { text: '🌾 농장을 지어요 (먹이 🍖를 키워요)', done: () => farmIdx().length > 0, go: () => goShop('shopHab') },
  { text: '🌱 농장을 눌러 작물을 심어요', done: () => farmIdx().some(k => S.plots[k].crop != null || S.plots[k].lastCrop != null), go: () => goPlot(farmIdx()[0]) },
  { text: `🍖 먹이를 줘서 두 마리를 Lv.${BREED_LV}로!`, done: () => S.monsters.filter(m => m.lv >= BREED_LV).length >= 2, go: () => { closeModal(); tab = 'mons'; render(); } },
  { text: '🏔️ 교배산에서 두 마리를 섞어요!', done: () => (S.breedLog || []).length > 0, go: () => goPlot(mountains().find(k => mtnFreeSlot(S.plots[k]) >= 0) ?? mountains()[0]) },
  { text: '⚔️ 모험에서 ⚡자동 편성 → 첫 전투!', done: () => S.stage > 1 || Object.keys(S.bossCleared || {}).length > 0, go: () => { closeModal(); tab = 'adventure'; render(); } },
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
  { text: '⚔️ 길드의 ⚔️ 길드전 탭에서 상대 길드원을 한 번 공격해 봐요 (이기면 ⭐!)', done: () => tutFlag('gwar') || (!S.guild && tutFlag('guild')),
    go: () => { closeModal(); openGuild(S.guild ? 'war' : undefined); } },
  { text: '🏆 모험 탭의 🏆 랭킹에서 전 세계 순위를 봐요 (랜덤 대전에서 이기면 트로피!)', done: () => tutFlag('ranking'),
    go: () => { closeModal(); tab = 'adventure'; render(); setTimeout(() => { const el = document.querySelector('.pvp-box'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 80); } },
);
TUT.push(
  { text: '🐾 섬 왼쪽 위 🐾 펫 버튼을 눌러 첫 펫을 받아요 (선물!)', done: () => tutFlag('pet'), go: () => { closeModal(); tab = 'island'; render(); } },
);
TUT.push(
  { text: '💰 위쪽 💰💎🍖 숫자를 눌러 재화를 얻고 쓰는 법을 봐요', done: () => tutFlag('res'), go: () => { closeModal(); openResInfo('gold'); } },
  { text: '🎯 섬 위쪽 🎯 다음 목표를 눌러 보상을 받아요', done: () => tutFlag('goal'), go: () => { closeModal(); tab = 'island'; render(); updateHud(); } },
);
TUT.push(
  { text: '🎉 왼쪽 🎉 버튼으로 지금 이벤트를 봐요 (한정 펫!)', done: () => tutFlag('event'), go: () => { closeModal(); openEvent(); } },
);
TUT.push(
  { text: '🔁 모험에서 🔁 연속 전투를 해 봐요 (이기면 다음 스테이지로 계속!)', done: () => tutFlag('loop'), go: () => { closeModal(); tab = 'adventure'; render(); } },
  { text: '🏛️ 상점의 🏛️ 왕국 발전을 한 번 올려 봐요 (골드로 영원히 강해져요)', done: () => KINGDOM.some(k => kdLv(k.id) > 0) || tutFlag('kingdom'), go: () => goShop('shopKingdom') },
  { text: '💎 상점의 🗽 랜드마크와 💎 보석 상점을 둘러봐요 (로봇·부스터·전설 알)', done: () => tutFlag('bigshop'), go: () => goShop('shopWonder') },
);
TUT.push(
  { text: '🔥 상점의 🔥 오늘의 특가를 봐요 (매일 바뀌는 할인!)', done: () => tutFlag('deals'), go: () => goShop('shopDeals') },
  { text: '🧪 상점의 🧪 물약과 💱 교환소를 봐요 (행운 물약·골드→보석)', done: () => tutFlag('potion'), go: () => goShop('shopPotion') },
);
TUT.push(
  { text: '🔮 몬스터 탭의 🔮 합성 제단을 봐요 (같은 등급 5마리 → 한 등급 위!)', done: () => tutFlag('altar') || (S.altarCount || 0) > 0, go: () => { closeModal(); tab = 'mons'; render(); } },
  { text: '⭐ 몬스터 탭의 ⭐ 별 합성을 봐요 (같은 몬스터 3마리 → ★+1)', done: () => tutFlag('star') || (S.fuseCount || 0) > 0, go: () => { closeModal(); tab = 'mons'; render(); } },
);
TUT.push(
  { text: '📜 왼쪽 📜 버튼에서 루나의 퀘스트를 받아요', done: () => tutFlag('quest'), go: () => { closeModal(); tab = 'island'; render(); } },
);
TUT.push(
  { text: '🏆 📜 퀘스트 창의 🏆 업적에서 첫 보상을 받아요 (칭호!)', done: () => tutFlag('ach'), go: () => { closeModal(); openQuests('story'); } },
);
TUT.push(
  { text: '🔥 모험 탭의 🔥 오늘의 레이드에 도전해요 (매일 바뀌는 거대 보스!)', done: () => tutFlag('raid'), go: () => { closeModal(); tab = 'adventure'; render(); setTimeout(() => { const el = document.querySelector('.raid-card'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 80); } },
);
TUT.push(
  { text: '🧬 상점의 🧬 복제기를 봐요 (💰10Qi · 복제 한 번 💰10M)', done: () => tutFlag('cloner') || clonerIdx() >= 0, go: () => goShop('shopCloner') },
);
TUT.push(
  { text: '🤝 친구 대전 창에서 친구와 함께 보스 레이드를 해 봐요 (둘 다 큰 보상!)', done: () => tutFlag('coop') || stat('coopWin') > 0, go: () => { closeModal(); tab = 'adventure'; render(); setTimeout(() => { const el = document.querySelector('.pvp-box'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 80); } },
);
TUT.push(
  { text: '🧪 펫 창의 🧪 펫 합성을 봐요 (두 펫을 합쳐 새 펫!)', done: () => tutFlag('petfuse') || PETS.some(p => p.fusion && petLv(p.id)), go: () => { closeModal(); openPets(); setTimeout(() => { const el = document.getElementById('petFuse'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 120); } },
);
TUT.push(
  { text: '🌌 상점의 🌌 우주 발전을 봐요 (엄청난 골드를 쓰는 곳!)', done: () => tutFlag('cosmos') || cosTotal() > 0, go: () => goShop('shopCosmos') },
);
TUT.push(
  { text: '👫 모험 탭의 👫 친구에서 친구 코드로 친구를 추가해 봐요 (💌 하트 · ⚔️ 초대!)', done: () => tutFlag('friendAdd') || (S.friends || []).length > 0,
    go: () => { closeModal(); tab = 'adventure'; render(); setTimeout(() => { const el = document.querySelector('.pvp-box'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 80); } },
);
TUT.push(
  { text: '🎣 섬 왼쪽 🎮 미니게임의 🎣 낚시에서 물고기를 한 마리 낚아 봐요!', done: () => tutFlag('fish') || stat('fish') > 0, go: () => { closeModal(); tab = 'island'; render(); openFishing(); } },
);
TUT.push(
  { text: '💬 길드의 💬 채팅에서 메시지를 보내 봐요 (노란 숫자 = 안 읽은 길드원 수 · 모든 날 저장!)', done: () => tutFlag('gchat') || (!S.guild && tutFlag('guild')),
    go: () => { closeModal(); if (S.guild) { guildTab = 'chat'; openGuild('chat'); } else { tab = 'adventure'; render(); openGuild(); } } },
  { text: '🌐 ☰ 메뉴의 🌐 English로 게임을 영어로 바꿀 수 있어요', done: () => tutFlag('lang') || tutFlag('menuSeen'), go: () => { closeModal(); openMenu(); } },
);
TUT.push(
  { text: '🏁 🎮 미니게임의 🏁 경주에서 1등할 몬스터를 맞혀 봐요 (하루 1번 무료!)', done: () => tutFlag('race') || stat('race') > 0, go: () => { closeModal(); tab = 'island'; render(); openRace(); } },
);
TUT.push(
  { text: '📦 🏆 랭킹을 한 번 열어 봐요. 랭킹 · 길드 기록이 내 기기에 저장돼서 2년 동안 남아요!', done: () => !!lsGet(RANK_STORE),
    go: () => { closeModal(); tab = 'adventure'; render(); openRanking(); } },
);
TUT.push(
  { text: '🔍 🏆 랭킹 위쪽 검색칸에서 이름 · 길드 · 친구 코드로 사람을 찾아봐요', done: () => tutFlag('rankSearch'),
    go: () => { closeModal(); tab = 'adventure'; render(); openRanking(); } },
);
TUT.push(
  { text: '🎡 🎮 미니게임의 🎡 룰렛을 돌려 선물을 받아요 (하루 1번 무료!)', done: () => tutFlag('wheel') || stat('wheel') > 0, go: () => { closeModal(); tab = 'island'; render(); openWheel(); } },
);
TUT.push(
  { text: '🃏 🎮 미니게임의 🃏 짝 맞추기에서 같은 몬스터 카드 두 장을 찾아봐요 (하루 3판 무료!)', done: () => tutFlag('memory') || stat('memWin') > 0, go: () => { closeModal(); tab = 'island'; render(); openMemory(); } },
);
TUT.push(
  { text: '🎮 섬 왼쪽의 🎮 미니게임에서 게임을 하나 해 봐요 (20가지 · 하루 3판씩 무료!)', done: () => stat('mgPlay') > 0, go: () => { closeModal(); tab = 'island'; render(); openGames(); } },
);
TUT.push(
  { text: '📅 섬 왼쪽의 📅 할 일에서 오늘 받을 수 있는 것들을 한눈에 봐요 (다 하면 💎10!)', done: () => tutFlag('todo'), go: () => { closeModal(); tab = 'island'; render(); openTodo(); } },
);
TUT.push(
  { text: '⏩ 🔁 연속 전투를 시작할 때 배속을 골라 봐요 (최대 10000배속! Esc 키로 나가기)', done: () => tutFlag('speed') || (S.bSpeed || 1) > 1,
    go: () => { closeModal(); tab = 'adventure'; render(); } },
);
TUT.push(
  { text: '🇰🇷 위쪽 💰를 눌러 📏 돈 단위 보기를 열고, 🇰🇷 한국 단위(만 · 억 · 조)를 켜 봐요', done: () => tutFlag('krunit') || !!S.krUnits || (window.LANG === 'en' && tutFlag('unitTable')),
    go: () => { closeModal(); UT_OPEN = true; openResInfo('gold'); UT_OPEN = false; } },
);
TUT.push(
  { text: '🧩 🎮 미니게임에 새로 생긴 🧩 몬스터 2048 · 🐤 날아라 몬스터 · 🧱 탑 쌓기 · 🐍 먹보 몬스터 중 하나를 해 봐요', done: () => tutFlag('newMg'),
    go: () => { closeModal(); tab = 'island'; render(); openGames(); } },
);
TUT.push(
  { text: '🛒 상점 🥚 알 칸의 🛒 없는 몬스터 전부 사기 버튼으로 없는 몬스터를 한꺼번에 사 봐요', done: () => tutFlag('buyAll') || !buyAllList('egg').length,
    go: () => { closeModal(); tab = 'shop'; shopTab = 'egg'; render(); } },
);
TUT.push(
  { text: '🏝️ 섬 이름(🗺️ 섬 지도)을 눌러 봐요. 💰 골드로 새 섬을 살 수 있어요 (최대 100개!)', done: () => tutFlag('islBuy'),
    go: () => { closeModal(); tab = 'island'; render(); openIslandList(); } },
);
TUT.push(
  { text: '🏠 섬 이름(🗺️ 섬 지도)에서 🏠 이 섬 빈 땅 전부에 서식지 짓기를 눌러 봐요 (한 번에 섬을 꽉 채워요!)', done: () => tutFlag('fillIsl') || !islFree().length,
    go: () => { closeModal(); tab = 'island'; render(); openFillIsland(); } },
);
TUT.push(
  { text: '📚 상점 🥚 알 칸의 📚 모든 몬스터 상점에서 ▶ 다음 쪽을 눌러 봐요 (몬스터 40000마리를 등급 · 속성 · 이름으로 찾고, 1000마리씩 한 번에 사요!)', done: () => tutFlag('allShop'),
    go: () => { closeModal(); tab = 'shop'; shopTab = 'egg'; render(); const h = $('#shopAll'); if (h) h.scrollIntoView({ block: 'start' }); } },
  { text: '💾 위쪽 💾 저장 버튼을 눌러 봐요 (컴퓨터는 Ctrl + S). "저장했어요!"가 나오면 안전해요', done: () => tutFlag('saveNow'),
    go: () => { closeModal(); saveNow(); } },
  { text: '⏫ 🗺️ 섬 지도에서 🏝️🏝️ 섬 여러 개 한 번에 사기나 ⏫ 모든 서식지 돈 되는 만큼 올리기를 눌러 봐요', done: () => tutFlag('bulkGrow'),
    go: () => { closeModal(); tab = 'island'; render(); openIslandList(); } },
);
TUT.push(
  { text: '🌦️ 섬 이름 옆 날씨 버튼을 눌러 날씨 예보를 봐요 (날씨에 맞는 서식지는 골드 ×2! 밤엔 🌠, 낮엔 🎈를 잡아요)', done: () => tutFlag('wx'),
    go: () => { closeModal(); tab = 'island'; render(); openWeather(); } },
);
// 🎉 이벤트는 기본 튜토리얼 10단계 (첫 전투 다음)
{ const ei = TUT.findIndex(t => t.text.startsWith('🎉')); if (ei > 9) TUT.splice(9, 0, TUT.splice(ei, 1)[0]); }
// 📜 퀘스트는 기본 튜토리얼 11단계 (이벤트 다음)
{ const qi = TUT.findIndex(t => t.text.startsWith('📜')); if (qi > 10) TUT.splice(10, 0, TUT.splice(qi, 1)[0]); }
// 🏆 업적은 기본 튜토리얼 12단계 (퀘스트 다음)
{ const ai = TUT.findIndex(t => t.text.startsWith('🏆 📜')); if (ai > 11) TUT.splice(11, 0, TUT.splice(ai, 1)[0]); }
// 🎣 낚시는 기본 튜토리얼 13단계 (업적 다음)
{ const fi = TUT.findIndex(t => t.text.startsWith('🎣')); if (fi > 12) TUT.splice(12, 0, TUT.splice(fi, 1)[0]); }
function tutFlag(k, set) {
  S.tutFlags = S.tutFlags || {};
  if (set && !S.tutFlags[k]) { S.tutFlags[k] = true; save(); }
  return !!S.tutFlags[k];
}
// ----- 튜토리얼 손가락: 단계마다 지금 화면에서 눌러야 할 곳을 가리킨다 -----
const modalOpen = () => !$('#modal').classList.contains('hidden') && !document.querySelector('#modalBox .menu-sheet');
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
      return need('shop') || ['[data-act=buyHab][data-el="fire"]', '.shop-nav [data-tab=build]'];
    case 1: case 3: { // 알 사기 (4단계는 알이 있으면 부화)
      if (k === 3 && (S.hatch.length || allIncs().some(x => x.b))) return tutPoint(2);
      if (inModal) return ['#modalBox [data-act=close]'];
      const el = firstHabEl();
      return need('shop') || [el ? `[data-act=buyMon][data-type="p:${el}"]` : '#shopEgg', '[data-act=buyMon]', '.shop-nav [data-tab=egg]'];
    }
    case 2: // 부화 → 살 곳 고르기 (살 곳이 없으면 "짓고 넣기")
      if (inModal) return ['#modalBox [data-act=place]', '#modalBox [data-act=buildPlace]', '#modalBox [data-act=upPlace]', '#modalBox [data-act=hatchAll]', '#modalBox [data-act=crack]', '#modalBox [data-act=incubate]', '#modalBox [data-act=close]'];
      return onIsland ? { plot: hatcheries()[0] } : [bottomBtn('island')];
    case 4: // 농장 짓기
      if (inModal) return ['#modalBox [data-act=build][data-what="farm"]', '#modalBox [data-act=close]'];
      return need('shop') || ['[data-act=buyHab][data-el="farm"]', '.shop-nav [data-tab=build]'];
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
      return S.team.length >= Math.min(3, S.monsters.length) ? ['[data-act=fight]'] : ['#view [data-act=teamAuto]'];
    case 13: // 일일 보상
      if (inModal) return ['#modalBox [data-act=claimDaily]', '#modalBox [data-act=close]'];
      return ['.hud [data-act=daily]'];
    case 14: // 도감 추천
      if (inModal) return ['#modalBox [data-act=goBreed]', '#modalBox [data-act=close]'];
      return need('dex') || ['#view [data-act=dexMon]'];
    case 15: // 섬 꾸미기
      if (inModal) return ['#modalBox [data-act=build][data-what^="deco:"]', '#modalBox [data-act=decoPick]', '#modalBox [data-act=close]'];
      return need('shop') || ['[data-act=buyDeco]:not(.wonder-card):not([disabled])', '.shop-nav [data-tab=build]'];
    case 16: // 보스전
      if (inModal) return ['#modalBox [data-act=close]'];
      if (tab !== 'adventure') return [bottomBtn('adventure')];
      return S.team.length ? ['[data-act=bossFight]:not([disabled])'] : ['#view [data-act=team]'];
    case 17: // 계정
      if (inModal) return ['#modalBox [data-act=accExport]', '#modalBox [data-act=close]'];
      return ['.hud [data-act=account]'];
    case 18: // 친구 · 랜덤 대전
      if (inModal) return ['#modalBox [data-act=pvpCancel]', '#modalBox [data-act=close]'];
      if (tab !== 'adventure') return [bottomBtn('adventure')];
      return ['.pvp-box [data-act=pvpRandom]', '.pvp-box [data-act=giftSend]'];
    case 19: // 미션
      if (inModal) return ['#modalBox [data-act=misClaim]:not([disabled])', '#modalBox [data-act=achClaim]:not([disabled])', '#modalBox [data-act=close]'];
      return ['.hud [data-act=missions]'];
    case 20: // 길드
      if (inModal) return ['#modalBox [data-act=guildJoin]:not([disabled])', '#modalBox [data-act=guildNew]', '#modalBox [data-act=close]'];
      if (tab !== 'adventure') return [bottomBtn('adventure')];
      return ['.pvp-box [data-act=guildOpen]'];
    case 21: // 길드전
      if (inModal) {
        if (!S.guild) return ['#modalBox [data-act=guildJoin]:not([disabled])', '#modalBox [data-act=guildNew]', '#modalBox [data-act=guildCreate]', '#modalBox [data-act=close]'];
        if (guildTab !== 'war') return ['#modalBox [data-act=guildTab][data-t=war]'];
        if (!S.team.length) return ['#modalBox [data-act=close]'];
        return ['#modalBox [data-act=gwarAttack]:not([disabled])', '#modalBox [data-act=close]'];
      }
      if (!S.team.length) return tab !== 'adventure' ? [bottomBtn('adventure')] : ['#view [data-act=team]'];
      if (tab !== 'adventure') return [bottomBtn('adventure')];
      return ['.pvp-box [data-act=guildOpen]'];
    case 22: // 랭킹
      if (inModal) return ['#modalBox [data-act=rankCat]', '#modalBox [data-act=close]'];
      if (tab !== 'adventure') return [bottomBtn('adventure')];
      return ['.pvp-box [data-act=ranking]'];
    case 23: // 펫
      if (inModal) return ['#modalBox [data-act=petEquip]', '#modalBox [data-act=close]'];
      if (tab !== 'island') return [bottomBtn('island')];
      return ['#petBtn'];
    case 24: // 재화 안내
      if (inModal) return ['#modalBox [data-act=close]'];
      return ['.hud [data-act=resInfo][data-r=gold]'];
    case 25: // 다음 목표
      if (inModal) return ['#modalBox [data-act=misClaim]:not([disabled])', '#modalBox [data-act=achClaim]:not([disabled])', '#modalBox [data-act=close]'];
      if (tab !== 'island') return [bottomBtn('island')];
      return ['#goalChip:not(.hidden)'];
    case 9: // 이벤트
      if (inModal) return ['#modalBox [data-act=evtClaim]:not([disabled])', '#modalBox [data-act=close]'];
      if (tab !== 'island') return [bottomBtn('island')];
      return ['#evtBtn'];
    case 26: // 연속 전투
      if (inModal) return ['#modalBox .ls-sp.on', '#modalBox [data-act=loopGo]', '#modalBox [data-act=close]'];
      if (tab !== 'adventure') return [bottomBtn('adventure')];
      return S.team.length ? ['#view [data-act=fightLoop]'] : ['#view [data-act=teamAuto]'];
    case 27: // 왕국 발전
      if (inModal) return ['#modalBox [data-act=close]'];
      return need('shop') || ['[data-act=kdUp]:not([disabled])', '.shop-nav [data-tab=power]'];
    case 28: // 랜드마크·보석 상점
      if (inModal) return ['#modalBox [data-act=close]'];
      return need('shop') || ['.shop-nav [data-tab=gem]'];
    case 29: // 오늘의 특가
      if (inModal) return ['#modalBox [data-act=close]'];
      return need('shop') || ['.shop-nav [data-tab=deal]'];
    case 30: // 물약·교환소
      if (inModal) return ['#modalBox [data-act=close]'];
      return need('shop') || ['.shop-nav [data-tab=item]'];
    case 31: // 합성 제단
      if (inModal) return ['#modalBox [data-act=altarFuse]:not([disabled])', '#modalBox [data-act=altarAuto]:not([disabled])', '#modalBox [data-act=close]'];
      return need('mons') || ['#view [data-act=altar]'];
    case 32: // 별 합성
      if (inModal) return ['#modalBox [data-act=close]'];
      return need('mons') || ['#view [data-act=starList]'];
    case 10: // 퀘스트
      if (inModal) return ['#modalBox [data-act=qClaim]:not([disabled])', '#modalBox [data-act=close]'];
      if (tab !== 'island') return [bottomBtn('island')];
      return ['#questBtn'];
    case 11: // 업적
      if (inModal) return ['#modalBox [data-act=achAll]', '#modalBox [data-act=achClaim2]:not([disabled])', '#modalBox .chips [data-act=achOpen]', '#modalBox [data-act=achOpen]', '#modalBox [data-act=close]'];
      if (tab !== 'island') return [bottomBtn('island')];
      return ['#questBtn'];
    case 33: // 레이드
      if (inModal) return ['#modalBox [data-act=close]'];
      if (tab !== 'adventure') return [bottomBtn('adventure')];
      return S.team.length ? ['#view [data-act=raidFight]:not([disabled])', '#view .raid-card'] : ['#view [data-act=teamAuto]'];
    case 34: // 복제기
      if (inModal) return ['#modalBox [data-act=close]'];
      return need('shop') || ['.shop-nav [data-tab=power]', '#shopCloner'];
    case 35: // 협동 레이드
      if (inModal) return ['#modalBox .coop-box h4', '#modalBox [data-act=pvpCancel]', '#modalBox [data-act=close]'];
      if (tab !== 'adventure') return [bottomBtn('adventure')];
      return ['.pvp-box [data-act=pvp]'];
    case 36: // 펫 합성
      if (inModal) return ['#modalBox [data-act=petFuse]:not([disabled])', '#modalBox #petFuse', '#modalBox [data-act=close]'];
      if (tab !== 'island') return [bottomBtn('island')];
      return ['#petBtn'];
    case 37: // 우주 발전
      if (inModal) return ['#modalBox [data-act=close]'];
      return need('shop') || ['.shop-nav [data-tab=power]', '#shopCosmos'];
    case 38: // 친구
      if (inModal) return ['#modalBox #frCode', '#modalBox [data-act=close]'];
      if (tab !== 'adventure') return [bottomBtn('adventure')];
      return ['.pvp-box [data-act=friends]'];
    case 12: // 낚시
      if (inModal) return ['#modalBox .mg-card[data-id=fish]', '#modalBox [data-act=fishCast]', '#modalBox [data-act=fishHit]', '#modalBox [data-act=fishClose]'];
      if (tab !== 'island') return [bottomBtn('island')];
      return ['#gameBtn'];
    case 39: // 길드 채팅
      if (inModal) {
        if (!S.guild) return ['#modalBox [data-act=guildJoin]:not([disabled])', '#modalBox [data-act=guildNew]', '#modalBox [data-act=close]'];
        return ['#modalBox #gChatText', '#modalBox [data-act=guildTab][data-t=chat]', '#modalBox [data-act=close]'];
      }
      if (tab !== 'adventure') return [bottomBtn('adventure')];
      return ['.pvp-box [data-act=guildOpen]'];
    case 40: // 영어 모드 (메뉴만 보면 완료 · 손가락이 언어 버튼을 누르게 하지 않는다)
      if (inModal) return ['#modalBox [data-act=close]'];
      return ['#menuBtn', '[data-act=account]'];
    case 41: // 몬스터 경주
      if (inModal && $('#modalBox .mg-hub')) return ['#modalBox .mg-card[data-id=race]'];
      if (inModal) return RACE && RACE.pick == null ? ['#modalBox .race-lane'] : RACE && !RACE.bet ? ['#modalBox [data-act=raceBet]:not([disabled])'] : ['#modalBox [data-act=raceGo]', '#modalBox [data-act=raceClose]'];
      if (tab !== 'island') return [bottomBtn('island')];
      return ['#gameBtn'];
    case 42: // 기록 2년 보관 (랭킹 열기)
      if (inModal) return ['#modalBox [data-act=rankCat]', '#modalBox [data-act=close]'];
      if (tab !== 'adventure') return [bottomBtn('adventure')];
      return ['.pvp-box [data-act=ranking]'];
    case 43: // 랭킹 사람 찾기
      if (inModal) return ['#modalBox [data-act=rankSearch]', '#modalBox [data-act=close]'];
      if (tab !== 'adventure') return [bottomBtn('adventure')];
      return ['.pvp-box [data-act=ranking]'];
    case 44: // 룰렛
      if (inModal) return ['#modalBox .mg-card[data-id=wheel]', '#modalBox [data-act=wheelSpin]', '#modalBox [data-act=wheelClose]'];
      if (tab !== 'island') return [bottomBtn('island')];
      return ['#gameBtn'];
    case 45: // 짝 맞추기
      if (inModal) return ['#modalBox .mg-card[data-id=memory]', '#modalBox [data-act=memStart]', '#modalBox .mem-card:not(.open)', '#modalBox [data-act=memClose]'];
      if (tab !== 'island') return [bottomBtn('island')];
      return ['#gameBtn'];
    case 46: // 미니게임 모음
      if (inModal) return ['#modalBox [data-act=mgStart]', '#modalBox .mg-card[data-id=whack]', '#modalBox [data-act=games]'];
      if (tab !== 'island') return [bottomBtn('island')];
      return ['#gameBtn'];
    case 47: // 오늘 할 일
      if (inModal) return ['#modalBox [data-act=todoGo]', '#modalBox [data-act=todoBonus]', '#modalBox [data-act=close]'];
      if (tab !== 'island') return [bottomBtn('island')];
      return ['#todoBtn'];
    case 48: // 전투 배속
      if (inModal) return ['#modalBox [data-act=loopGo][data-sp="10"]', '#modalBox [data-act=close]'];
      if (tab !== 'adventure') return [bottomBtn('adventure')];
      return S.team.length ? ['#view [data-act=fightLoop]'] : ['#view [data-act=teamAuto]'];
    case 49: { // 한국 돈 단위
      const ut = document.querySelector('#modalBox .unit-table');
      if (ut && !ut.open) return ['#modalBox .unit-table summary'];
      if (ut) return [window.LANG === 'en' ? '#modalBox [data-act=close]' : '#modalBox [data-act=krUnits]'];
      if (inModal) return ['#modalBox [data-act=close]'];
      return ['[data-act=resInfo][data-r=gold]'];
    }
    case 50: // 새 미니게임 4개
      if (inModal) return ['#modalBox [data-act=mgStart][data-id=m2048]', '#modalBox .mg-card[data-id=m2048]', '#modalBox [data-act=games]'];
      if (tab !== 'island') return [bottomBtn('island')];
      return ['#gameBtn'];
    case 51: // 없는 몬스터 전부 사기
      if (inModal) return ['#modalBox [data-act=close]'];
      if (tab !== 'shop') return [bottomBtn('shop')];
      if (shopTab !== 'egg') return ['#view [data-act=shopJump][data-tab=egg]'];
      return ['#view [data-act=buyAllMons]'];
    case 52: // 섬 사기
      if (inModal) return ['#modalBox [data-act=close]'];
      if (tab !== 'island') return [bottomBtn('island')];
      return ['#islandBar [data-act=islList]'];
    case 53: // 섬 전체에 서식지
      if (inModal) return ['#modalBox [data-act=fillIslOpen]', '#modalBox [data-act=close]'];
      if (tab !== 'island') return [bottomBtn('island')];
      return ['#islandBar [data-act=islList]'];
    case 54: // 모든 몬스터 상점
      if (inModal) return ['#modalBox [data-act=close]'];
      if (tab !== 'shop') return [bottomBtn('shop')];
      if (shopTab !== 'egg') return ['#view [data-act=shopJump][data-tab=egg]'];
      return ['#view [data-act=allShopPage][data-d="1"]'];
    case 55: // 저장 버튼
      if (inModal) return ['#modalBox [data-act=close]'];
      return ['#saveBtn'];
    case 56: // 한 번에 키우기
      if (inModal) return ['#modalBox [data-act=islBulkOpen]', '#modalBox [data-act=upAllHabsMax]', '#modalBox [data-act=close]'];
      if (tab !== 'island') return [bottomBtn('island')];
      return ['#islandBar [data-act=islList]'];
    case 57: // 날씨
      if (inModal) return ['#modalBox [data-act=close]'];
      if (tab !== 'island') return [bottomBtn('island')];
      return ['#islandBar [data-act=wxInfo]'];
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
// 아이들은 손가락 그림 자체를 누르는 경우가 많다 → 손가락을 누르면 가리키는 곳을 대신 눌러 준다
let fingerTarget = null;
function pressFinger(e) {
  e.preventDefault();
  e.stopPropagation();
  const t = fingerTarget;
  if (!t) return;
  if (t.el && document.body.contains(t.el)) { t.el.click(); return; }
  if (t.plot != null) {
    if (islandOf(t.plot) !== (S.isl || 0)) { S.isl = islandOf(t.plot); render(); updateFinger(); return; }
    openPlot(t.plot);
  }
}
document.addEventListener('DOMContentLoaded', () => {});
setTimeout(() => { const f = $('#finger'); if (f) f.addEventListener('click', pressFinger); }, 0);
function updateFinger() {
  const f = $('#finger');
  if (!f) return;
  const k = tutShown();
  // 튜토리얼 창·설명 슬라이드가 열려 있을 때는 손가락을 숨긴다
  const reading = !!document.querySelector('#modalBox .tut-list, #modalBox .welcome');
  const active = !B && !S.tutOff && (!$('#login') || $('#login').classList.contains('hidden')) && !S.hideUI && k < TUT.length && !reading && tutGuided(k);
  const target = active ? tutPoint(k) : null;
  let x = null, y = null, down = false, glow = null;
  fingerTarget = null;
  if (target && target.plot != null && target.plot >= 0) {
    fingerTarget = { plot: target.plot };
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
    // 폰에서 위쪽 버튼(.hud …)이 ☰ 메뉴로 들어갔으면: 메뉴 안의 같은 버튼 → 없으면 ☰ 버튼
    const expanded = [];
    target.forEach(sel => { expanded.push(sel); if (sel.startsWith('.hud ')) expanded.push('#modalBox .menu-sheet ' + sel.slice(5), '#menuBtn'); });
    for (const sel of expanded) {
      const el = [...document.querySelectorAll(sel)].find(e => e.getClientRects().length > 0);   // 화면에 보이는 것 (고정 위치 요소도 포함)
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
      fingerTarget = { el };
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
let tutFocusWasDone = false;
const tutShown = () => (tutFocus != null ? tutFocus : tutStep());

function openTutorial() {
  const cur = tutStep();
  showModal(`<h3>🎓 튜토리얼</h3>
    <p class="muted">단계를 골라 <b>👉 다시 보기</b>를 누르면 손가락이 어디를 누를지 알려 줘요.</p>
    <div class="row"><button class="btn" data-act="welcome" data-n="0" data-full="1">📖 게임 설명 보기</button></div>
    <h3 class="sub">📘 기본 튜토리얼 <small class="muted">${Math.min(cur, TUT_CORE)} / ${TUT_CORE}</small></h3>
    <div class="tut-list">${TUT.slice(0, TUT_CORE).map((t, k) => `<div class="tut-row ${k < cur ? 'done' : k === cur ? 'now' : ''}">
        <span class="tut-num">${k < cur ? '✅' : k === cur ? '👉' : k + 1}</span>
        <span class="tut-text">${t.text}</span>
        <button class="btn small ${k === cur ? 'green' : 'ghost'}" data-act="tutFocus" data-k="${k}">👉 ${k === cur ? '지금 하기' : '다시 보기'}</button>
      </div>`).join('')}</div>
    ${TUT.length > TUT_CORE ? '<h3 class="sub">💡 더 알아보기 <small class="muted">하고 싶을 때만 눌러요</small></h3>' : ''}
    <div class="tut-list">${TUT.slice(TUT_CORE).map((t, n) => { const k = n + TUT_CORE, done = t.done(); return `<div class="tut-row ${done ? 'done' : ''}">
        <span class="tut-num">${done ? '✅' : '💡'}</span>
        <span class="tut-text">${t.text}</span>
        <button class="btn small ghost" data-act="tutFocus" data-k="${k}">👉 보기</button>
      </div>`; }).join('')}</div>
    <div class="row">
      ${S.tutOff ? '<button class="btn ghost small" data-act="tutOn">💡 안내 말풍선 켜기</button>' : '<button class="btn ghost small" data-act="tutSkip">🔕 안내 말풍선 끄기</button>'}
      <button class="btn ghost small danger" data-act="reset">🔄 처음부터 다시 하기</button>
      <button class="btn ghost small" data-act="close">닫기</button>
    </div>`);
}
function focusTutorial(k) {
  k = Number(k);
  S.tutOff = false;
  tutFocus = k === tutStep() && k < TUT_CORE ? null : k;
  tutFocusWasDone = tutFocus != null && TUT[k].done();
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
// 모든 단계를 말풍선으로 안내한다 (예전엔 13단계만, 나머지는 "더 알아보기")
const TUT_CORE = TUT.length;
const tutGuided = (k) => tutFocus != null || k < TUT_CORE;
function updateGuide() {
  const g = $('#guide');
  const cur = tutStep();
  // "보기"로 연 단계를 방금 해냈으면 안내를 끝낸다
  if (tutFocus != null && !tutFocusWasDone && TUT[tutFocus] && TUT[tutFocus].done()) {
    tutFocus = null;
    g.dataset.k = '';
    toast('✅ 완료! 잘했어요');
  }
  const k = tutShown();
  if (cur >= TUT_CORE && !S.tutCoreDone) {
    S.tutCoreDone = true;
    earn(100, 'gems');
    save();
    updateHud();
    sfx('yay');
    toast('🎉 튜토리얼을 모두 끝냈어요! 선물로 💎 100. 이제 위쪽 🎯 다음 목표를 따라가 봐요 (💰💎🍖를 누르면 쓰는 법이 나와요)');
  }
  const show = !B && !S.tutOff && (!$('#login') || $('#login').classList.contains('hidden')) && !(S.hideUI && tab === 'island') && k < TUT.length && tutGuided(k);
  g.classList.toggle('hidden', !show);
  if (!show) return;
  const html = `<div class="g-step">${k >= TUT_CORE ? '💡 더 알아보기' : `${tutFocus != null ? '🎓 다시 보기' : '튜토리얼'} ${k + 1} / ${TUT_CORE}`}</div>
    <div class="g-text">${TUT[k].text}</div>
    <div class="g-go">👉 여기를 누르면 바로 가요</div>
    <button class="g-x" data-act="tutSkip" title="튜토리얼 끄기">✕</button>`;
  const key = k + (tutFocus != null ? 'f' : '');
  if (g.dataset.k !== key) { g.innerHTML = html; g.dataset.k = key; }
}
function tutGo() {
  const k = tutShown();
  if (k < TUT.length && tutGuided(k)) TUT[k].go();
}

// ----- 처음 온 사람을 위한 설명 슬라이드 -----
const WELCOME = [
  { icon: '🧬', title: '몬스터 합치기에 온 걸 환영해요!', text: `몬스터를 <b>모으고</b>, <b>섞고</b>, <b>키워서</b> 싸우는 게임이에요.<br>도감에는 <b>${fmt(CAT_LIST.length)}마리</b>의 몬스터가 기다리고 있어요!` },
  { icon: '🏠', title: '서식지와 알', text: '몬스터는 <b>같은 속성 서식지</b>에서 살아요. 🔥 불 몬스터 → 🔥 불 서식지<br>🛒 상점에서 서식지와 알(💰500)을 사고, 🪺 부화장에서 알을 누르면 <b>바로 깨어나요</b>.<br>서식지 레벨만큼 몬스터가 살고, 골드 💰가 계속 쌓여요.' },
  { icon: '🌾', title: '농장과 먹이', text: '농장에 작물을 심으면 먹이 🍖가 생겨요. 오래 걸리는 작물일수록 효율이 좋아요.<br>작물을 고를 때 <b>🌾 모든 농장에</b>를 누르면 한 번에 심어요.<br>몬스터에게 먹이를 주면 <b>레벨이 올라요</b>.' },
  { icon: '🏔️', title: '교배', text: '<b>Lv.4</b> 몬스터 두 마리를 교배산에 넣으면 <b>새 몬스터</b>가 태어나요!<br>등급은 <b>일반 → … → 서사 → 전설 → 신화</b>까지 15단계. 타이머가 길수록 좋은 등급이에요.<br>📖 도감에서 몬스터를 누르면 <b>추천 교배 조합</b>을 알려 줘요.' },
  { icon: '💰', title: '재화 3가지', text: '💰 <b>골드</b>: 서식지 몬스터가 벌어요 → 건물·알·교배·업그레이드<br>🍖 <b>먹이</b>: 농장에서 키워요 → 몬스터 레벨 업 (Lv.4면 교배!)<br>💎 <b>보석</b>: 미션·일일 보상·도전 과제 → 시간 단축·고급 룬<br>위쪽 <b>💰💎🍖 숫자를 누르면</b> 언제든 자세히 볼 수 있어요. 섬 위쪽 <b>🎯 다음 목표</b>도 따라가 봐요!' },
  { icon: '🧪', title: '펫 합성과 각성', text: '🐾 펫 창 아래쪽 <b>🧪 펫 합성</b>: 부모 펫 두 마리가 <b>Lv.5 이상</b>이면 새로운 <b>합성 펫</b>이 태어나요 (부모는 그대로!). 예) 🐶+🐱 → 🐯 호랑이 대장, 🦚+🐉 → 🌠 별의 신수<br><b>⭐ 각성</b>: Lv.10 펫을 💎로 ★3까지! 별마다 보너스 +50%' },
  { icon: '🐾', title: '펫', text: '섬 왼쪽 위 <b>🐾 펫 버튼</b>을 누르면 첫 펫 🐶을 선물로 받아요!<br>펫은 섬을 같이 돌아다니고, 💰골드·🍖먹이·⚔️공격·❤️체력·🏷️교배 할인 <b>보너스</b>를 줘요.<br>🍪 간식으로 Lv.10까지 키우고, 🥚 펫 알로 12마리를 모아 봐요.' },
  { icon: '🏝️', title: '섬 18개', text: '위쪽 <b>◀ ▶</b>로 섬을 옮겨 다녀요. 건물을 <b>꾹 눌러 끌면</b> 빈 땅으로 옮겨져요.<br>🎨 장식을 놓으면 그 섬 골드가 올라요.<br>두 손가락으로 <b>확대</b>, 🙈 숨기기로 이름표를 감출 수 있어요.' },
  { icon: '🤝', title: '협동 레이드', text: '모험 탭 → 👥 <b>친구 대전</b> 창 아래 <b>🤝 친구와 함께 보스 레이드</b>!<br>한 명이 <b>레이드 방</b>을 만들고, 친구가 코드로 들어오면 두 팀(최대 6마리)이 힘을 합쳐 <b>엄청 센 보스</b>와 싸워요.<br>각자 자기 몬스터 차례에 스킬을 골라요 (🤖 자동도 돼요). 이기면 <b>둘 다</b> 💎60 · 골드 · ★★★ 룬 · 👑 전설 알!' },
  { icon: '🔥', title: '보스전과 레이드', text: '모험 탭 아래쪽 <b>👹 보스전</b>: 16명의 보스를 차례로! 뒤쪽 보스는 체력이 절반 아래가 되면 <b>😡 분노</b>해서 더 세져요.<br><b>🔥 오늘의 레이드</b>: 매일 바뀌는 거대 보스 (내 팀 힘에 맞춰 나와요). 하루 3번, 한 번에 10라운드! 준 피해가 쌓여서 10%·30%·60%·100%마다 보상, 끝까지 쓰러뜨리면 👑 전설 알!' },
  { icon: '⚔️', title: '모험과 보스', text: '몬스터 3마리로 팀을 짜서 싸워요 (<b>⚡ 자동 편성</b>이면 가장 센 3마리!). 📘 상성표를 보고 <b>강한 속성</b>으로 공격하면 피해 1.5배!<br><b>🔁 연속 전투</b>를 누르면 이길 때마다 다음 스테이지로 자동으로 계속 싸워요.<br>👹 보스전에서는 에너지가 엄청 많은 보스와 싸워요.' },
  { icon: '🎉', title: '이벤트', text: '<b>3일마다</b> 새 이벤트가 열려요: 💰골드 러시, 🌾풍년 축제, ⚔️전투 대회, 🐣부화 페스티벌, 🧬교배 러시, 🌈속성 축제<br>평소처럼 놀면 <b>🎟️ 이벤트 토큰</b>이 모이고 (이벤트 주제 활동은 2배!), 패스 보상을 받아요.<br>마지막 보상은 <b>이벤트 한정 펫</b>! 섬 왼쪽 <b>🎉 버튼</b>에서 확인해요.' },
  { icon: '🏆', title: '업적과 칭호', text: '📜 퀘스트 창의 <b>🏆 업적</b>에서 수집·교배·전투·왕국·함께·특별 업적을 모아요. 단계마다 💎 보석!<br>받은 업적만큼 <b>🏅 업적 점수</b>가 쌓이고, 점수에 따라 <b>칭호</b>가 올라가요: 🌱 새싹 → 🐣 견습 → 🌿 숙련 → ⚔️ 베테랑 → 💎 엘리트 → 👑 마스터 → 🏆 전설 → 🌌 신화 조련사<br>칭호는 <b>랭킹에서 이름 옆</b>에 보여요!' },
  { icon: '📜', title: '퀘스트', text: '섬 왼쪽 <b>📜 버튼</b>에서 🧙‍♀️ 마법사 루나가 퀘스트를 줘요.<br><b>📜 스토리</b>: 6장 30개의 이야기를 하나씩 깨면 보상! (섬 위쪽 🎯에도 보여요)<br><b>📆 주간</b>: 월요일마다 새 퀘스트 4개, 모두 깨면 💎60 + 🥚 펫 알' },
  { icon: '🔮', title: '몬스터 합치기 더!', text: '🐾 몬스터 탭 위쪽에서:<br><b>🔮 합성 제단</b>: 같은 등급 5마리를 바치면 <b>한 등급 위</b> 몬스터 알! (속성이 겹치는 몬스터가 잘 나와요)<br><b>⭐ 별 합성</b>: 같은 몬스터 3마리를 합치면 한 마리가 <b>★+1</b> (최대 ★5, 별마다 체력·공격 +20%, 골드 +30%)' },
  { icon: '🛒', title: '상점 알뜰 사용법', text: '상점 위쪽 <b>분류 버튼</b>(🏠 🥚 🔥 🧪 🏛️ …)을 누르면 그 칸으로 바로 가요.<br><b>🔥 오늘의 특가</b>: 매일 4가지 할인, 하나씩만! (💎10으로 새로고침)<br><b>🧪 물약</b>: 🍀 행운(교배 두 번 뽑기) · ⏳ 모래시계(바로 완료) · 📈 성장(+3레벨) · 💪 전투(공격 +30%)<br><b>💱 교환소</b>: 골드로 보석 사기 (살수록 비싸지고 자정에 다시 싸져요)' },
  { icon: '🧬', title: '복제기', text: '상점의 <b>🧬 복제기</b>는 💰 10Qi(1해의 10배!)나 하는 최고급 기계예요.<br>섬에 세우고 누르면, 몬스터를 골라 <b>레벨·별까지 똑같은</b> 몬스터를 하나 더 만들어요. 한 번에 💰 10M!<br>(룬은 복제되지 않고, 알맞은 서식지에 빈자리가 있어야 해요)' },
  { icon: '🌦️', title: '날씨와 낮 · 밤', text: '섬의 날씨가 3시간마다 바뀌어요! 🌧️ 비엔 물·자연, ❄️ 눈엔 얼음·수정, ⛈️ 천둥번개엔 전기·바람 서식지 골드 ×2, 🌈 무지개엔 모두 ×1.5!<br>저녁 7시부터는 밤이 돼서 섬이 어두워지고 🌠 별똥별이 지나가요 (누르면 💎 3). 낮에는 🎈 풍선을 잡으면 💰!<br>섬 이름 옆 날씨 버튼을 누르면 앞으로의 날씨 예보도 볼 수 있어요.' },
  { icon: '🏝️', title: '한 번에 키우기', text: '🗺️ 섬 지도에서 🏝️🏝️ 섬 여러 개 한 번에 사기를 누르면 1 · 5 · 10 · 25개나 돈 되는 만큼 섬을 사고, 서식지까지 꽉 채워 줘요.<br>⏫ 모든 서식지 돈 되는 만큼 올리기를 누르면 낮은 레벨부터 골고루 Lv.100까지 올려요!' },
  { icon: '💾', title: '저장 버튼', text: '게임은 저절로 저장되지만, 위쪽 💾 버튼을 누르면 지금 바로 저장해요!<br>컴퓨터에서는 Ctrl + S 키로도 저장할 수 있어요.<br>저장이 잘 되면 시간과 크기를 알려 줘요.' },
  { icon: '⏫', title: '서식지 Lv.100', text: '서식지는 이제 Lv.100까지 올릴 수 있어요!<br>레벨만큼 몬스터가 살 수 있고 (Lv.100 = 100마리), 레벨마다 골드 수입 +25%.<br>서식지를 눌러 ⏫ 돈 되는 만큼 올리기를 누르면 한 번에 쭉 올라가요.' },
  { icon: '🏠', title: '섬 전체에 서식지', text: '섬 이름(🗺️ 섬 지도)이나 빈 땅의 🏗️ 건설하기에서 🏠 이 섬 빈 땅 전부에 서식지 짓기를 눌러요.<br>속성 하나를 고르거나 🌈 골고루를 고르면 섬의 빈 땅을 한 번에 꽉 채워요!' },
  { icon: '🗑️', title: '알 모두 버리기', text: '부화장에 알이 너무 많이 쌓였나요?<br>부화장 창 아래쪽 🗑️ 알 모두 버리기를 누르면 한 번에 비울 수 있어요.<br>버린 알은 되돌릴 수 없으니 조심!' },
  { icon: '🏝️', title: '새 섬 사기', text: '섬 이름(🗺️ 섬 지도)을 누르면 맨 위에 🏝️ 새 섬 사기 버튼이 있어요.<br>섬 18개는 처음부터 있고, 19번째부터는 💰 골드로 살 수 있어요 (최대 100개)!<br>섬 하나마다 빈 땅이 25칸씩 생기고, 살 때마다 값이 올라가요.' },
  { icon: '🛒', title: '몬스터 전부 사기', text: '상점 🥚 알 칸에서 🛒 없는 몬스터 전부 사기를 누르면<br>아직 없는 몬스터를 한 번에 모두 사서 바로 부화시켜요!<br>알맞은 서식지가 없으면 부화장에서 기다려요.' },
  { icon: '🧩', title: '새 미니게임 4가지', text: '🧩 몬스터 2048: 같은 몬스터를 밀어서 합치면 🥚→🐣→🐥→🐤→🐔→🦅로 진화!<br>🐤 날아라 몬스터: 눌러서 날아올라 기둥 사이를 통과!<br>🧱 탑 쌓기: 왔다 갔다 하는 블록을 딱 맞게 내려놓아 높이 쌓기!<br>🐍 먹보 몬스터: 🍖을 먹을수록 길어지고 빨라져요!' },
  { icon: '🇰🇷', title: '한국 돈 단위', text: '돈이 커지면 K · M · B · T 같은 단위로 줄여서 보여 줘요.<br>위쪽 💰를 누르고 📏 돈 단위 보기에서 🇰🇷 한국 단위를 켜면<br>만 · 억 · 조 · 경 · 해 … 무량대수까지 17가지 한국 단위로 보여요!' },
  { icon: '⏩', title: '전투 배속', text: '전투 화면 위쪽 <b>⏩ 배속</b> 버튼을 누를 때마다 빨라져요!<br>보통 전투는 <b>4배</b>까지, <b>🔁 연속 전투</b>는 시작할 때 배속을 골라요: 1 · 2 · 4 · 10 · 25 · 50 · 100 · 250 · 500 · 1000 · 2500 · 5000 · <b>10000배</b>!<br>25배부터는 움직이는 장면을 건너뛰고 결과만 빠르게 보여 줘요. 전투 중에 <b>Esc</b> 키를 누르면 바로 나가요.' },
  { icon: '🛒', title: '상점 칸', text: '상점이 <b>6칸</b>으로 나뉘었어요! 위쪽 버튼으로 바꿔요.<br>🏠 건물 · 🥚 알 · 🎁 특가·상자 · 🧪 아이템 · 🏛️ 강해지기 · 💎 보석<br>새로 생긴 것: <b>🎁 미스터리 상자</b>(골드/보석) · 🪱 미끼 ×10 · 🍖 먹이 10,000 · 🎟️ 미니게임 티켓 · 🔥 레이드 도전권 · ⚔️ 길드전 공격권 · 📦 룬 상자 ×10' },
  { icon: '📅', title: '오늘 할 일', text: '섬 왼쪽의 <b>📅 할 일</b>에 매일 받을 것들이 모여 있어요!<br>🎁 일일 보상 · 📋 미션 · 🎡 룰렛 · 🏁 경주 응원권 · 🎮 미니게임 · 🔥 레이드 · ⚔️ 길드전 · 💌 하트 …<br>남은 개수가 버튼에 숫자로 보이고, <b>가기 →</b>를 누르면 바로 가요. 다 하면 <b>💎 10</b> 보너스!' },
  { icon: '🎮', title: '미니게임 20가지', text: '섬 왼쪽의 <b>🎮 미니게임</b> 버튼에 게임이 20가지!<br>🎣 낚시 · 🏁 경주 · 🎡 룰렛 · 🃏 짝 맞추기 · 🔨 두더지 잡기 · ⚡ 반응 속도 · 🔢 숫자 순서 · 🎨 색깔 맞추기 · 🧠 순서 기억 · ➕ 빠른 계산 · 🎈 풍선 터뜨리기 · ✊ 가위바위보 · 🔍 다른 그림 찾기 · 🎲 높을까 낮을까 · 📘 속성 퀴즈 · 🎁 보물 상자 · 🧩 몬스터 2048 · 🐤 날아라 몬스터 · 🧱 탑 쌓기 · 🐍 먹보 몬스터<br>새 게임은 하루 3판씩 무료! 잘할수록 ⭐이 많고 💰💎 보상도 커져요.' },
  { icon: '🃏', title: '몬스터 짝 맞추기', text: '<b>🃏 짝 맞추기</b>(섬 왼쪽 버튼)에서 뒤집힌 카드 16장 중 <b>같은 몬스터 두 장</b>을 찾아요!<br>적게 뒤집을수록 ⭐이 많아요 (11번 이하면 ⭐⭐⭐). 보상은 ⭐만큼 💰골드와 💎!<br>하루 3판 무료, 그다음엔 💎5. 🏅 최고 기록에 도전해 봐요!' },
  { icon: '🎡', title: '행운의 룰렛', text: '<b>🎡 룰렛</b>(섬 왼쪽 버튼)을 하루 1번 <b>무료</b>로 돌려요! 💎10이면 5번 더.<br>💰 골드 · 🤑 골드 대박 · 💎 보석 · 🍖 먹이 · 📦 룬 · 🥚 희귀 알… 그리고 아주 가끔 <b>🎰 잭팟 💎100</b>!' },
  { icon: '🏁', title: '몬스터 경주', text: '<b>🏁 경주</b>(섬 왼쪽 버튼)에서 몬스터 5마리가 달리기 시합을 해요!<br>1등할 것 같은 몬스터를 응원하고 골드를 걸면, 맞혔을 때 <b>4.5배</b>!<br>하루 1번은 <b>🎟️ 무료 응원권</b> (맞히면 💎15). 💨부스터 · 🍌미끄러짐 · 😴낮잠… 끝까지 몰라요!' },
  { icon: '💬', title: '길드 채팅', text: '🛡️ 길드 창의 <b>💬 채팅</b>에서 길드원과 자유롭게 이야기해요.<br>메시지 옆 <b style="color:#ffe066">노란 숫자</b>는 아직 안 읽은 길드원 수 (읽을수록 줄어요, 카톡처럼!).<br>채팅은 <b>모든 날 저장</b>되고, 📅 날짜 줄로 나눠져 보여요.<br>전화번호·주소·링크는 막히고, 욕은 5번 물어봐요. 싫은 사람은 🙈' },
  { icon: '🌐', title: '영어 모드', text: '☰ 메뉴 · 👤 계정 메뉴 · 로그인 화면의 <b>🌐 English</b>를 누르면 게임이 <b>영어</b>로 바뀌어요.<br>몬스터 이름까지 모두 영어! 다시 누르면 한국어로 돌아와요.' },
  { icon: '🔇', title: '무음 모드', text: '위쪽 <b>🔊</b> 버튼을 누르면 <b>🔇 무음 모드</b>! 배경음악과 효과음이 한 번에 모두 꺼져요.<br>다시 누르면 소리가 돌아와요. (☰ 메뉴 · 👤 계정 메뉴에도 있어요)' },
  { icon: '🌈', title: '새 속성 9개', text: `속성이 <b>20개</b>가 되었어요! 새 특수 속성은 두 속성 몬스터를 교배하면 나와요 (상점 알로도 살 수 있어요).<br>${ADV_RECIPES.slice(3).map(r => `${EL[ELI[r.el]].emoji}<b>${EL[ELI[r.el]].name}</b> = ${r.need.map(x => EL[ELI[x]].emoji + EL[ELI[x]].name).join('+')}`).join(' · ')}` },
  { icon: '🎣', title: '낚시', text: '섬 왼쪽의 <b>🎣 낚시</b>에서 미끼를 던져요.<br><b>❗</b>가 뜨면 움직이는 🪝가 <b style="color:#7dff8f">초록 칸</b>에 올 때 <b>낚아채기</b>! 가운데 노란 칸이면 <b>✨ 완벽</b> (보상 1.5배).<br>물고기 20종 · 💰골드 · 💎보석 · 🥚알 · 🎁보물상자! 미끼는 20분마다 1개 (최대 5개).' },
  { icon: '👫', title: '친구', text: '모험 탭 <b>👫 친구</b>에서 내 <b>친구 코드</b>(6글자)를 친구에게 알려 주고, 친구 코드를 넣으면 친구가 돼요.<br>🏆 랭킹에서 ➕를 눌러도 추가돼요!<br>💌 <b>하트</b>를 매일 보내면 친구가 💰골드와 💎를 받아요. ⚔️ 누르면 바로 <b>대전 초대</b>, 🤝 누르면 <b>레이드 초대</b>!' },
  { icon: '🌌', title: '우주 발전', text: '골드가 <b>1Sx(1해의 1000배!)</b> 넘게 모였다면 상점의 <b>🌌 우주 발전</b>으로!<br>⚔️ 전투력 +25% · 🍀 교배 행운 · 💎 매일 보석 20개 · 🐾 펫 능력 +20% (레벨마다)<br>레벨마다 값이 <b>1000배</b>씩 오르고 끝이 없어요.<br>큰 숫자는 K·M·B·T·Qa·Qi·<b>Sx·Sp·Oc·No·Dc</b>… 순서로 커져요.' },
  { icon: '🏛️', title: '골드·보석 크게 쓰기', text: '상점의 <b>🏛️ 왕국 발전</b>: 골드로 끝없이 레벨 업 (골드·먹이·전투·교배 비용·매일 보석)<br><b>🗽 랜드마크</b>: 섬에 세우는 거대 건물, 모든 섬 골드 UP (최대 +170%)<br><b>💎 보석 상점</b>: 🤖 자동 수집 로봇, ⚡ 골드 2배 부스터, 👑 전설 알 상자' },
  { icon: '👥', title: '대전과 친구', text: '모험 탭 <b>👥 대전 · 친구</b> 칸에서<br>🌍 <b>랜덤 대전</b>으로 모르는 사람과 바로 싸우고, ⚔️ 방 코드로 <b>친구 대전</b>, 🎁 <b>선물</b>, 👀 <b>친구 섬 구경</b>도 해요.<br>선물·섬 코드는 <b>4자리 숫자</b>(예: 0427)예요.' },
  { icon: '🏆', title: '랭킹과 트로피', text: '🌍 랜덤 대전에서 이기면 <b>🏆 +30</b>, 지면 −15.<br>🥉브론즈 → 🥈실버 → 🥇골드 → 💠플래티넘 → 💎다이아 → 👑마스터 → 🏆챔피언!<br>모험 탭 <b>🏆 랭킹</b>에서 트로피·도감·모험·전투력 <b>전 세계 순위</b>를 봐요.' },
  { icon: '🔍', title: '사람 찾기', text: '🏆 랭킹을 열면 맨 위에 <b>🔍 검색칸</b>이 있어요. <b>이름 · 길드 이름 · 친구 코드</b>를 적고 찾기!<br>일부만 적어도 찾아요 (예: "방탄"). 찾은 사람의 🛡️ 길드 (👑 길드장) · 🕒 마지막 접속 · 🔑 친구 코드가 보여요.<br>옆의 ➕로 바로 친구 추가! 최근 2년 동안 랭킹에 올라간 사람을 찾을 수 있어요.' },
  { icon: '📦', title: '기록 2년 보관', text: '🏆 <b>랭킹</b> · 🛡️ <b>길드</b> · 👫 <b>친구 찾기</b> 기록이 12시간 동안 안 들어와도 <b>최대 2년</b> 동안 남아요.<br>랭킹이나 길드를 열면 모두의 기록이 내 기기에 저장되고, 곧 지워질 기록은 자동으로 다시 올려서 다른 사람도 볼 수 있어요.<br>💬 길드 채팅도 모든 날 저장! (2년 넘게 안 들어온 기록은 사라져요)' },
  { icon: '🛡️', title: '길드', text: '모험 탭 <b>🛡️ 길드</b>에서 길드에 들어가거나 직접 만들어요 (💰5,000).<br>길드원이 트로피·도감을 모을수록 <b>길드 레벨</b>이 올라가고, 레벨마다 <b>서식지 골드 +2%</b>!<br>💬 길드 채팅에서 자유롭게 이야기해요! 메시지 옆 <b style="color:#ffe066">노란 숫자</b>는 아직 안 읽은 길드원 수예요 (읽을수록 줄어요). (전화번호 · 주소 · 링크는 자동으로 막히고, 욕은 5번 물어봐요 · 🙈로 숨기기)' },
  { icon: '⚔️', title: '길드전', text: '매일 비슷한 길드와 짝이 돼요. 길드원마다 하루 <b>3번</b> 상대 길드원의 방어 팀을 공격해요.<br>이기면 ⭐1, 두 마리 살아남으면 ⭐2, 모두 살면 ⭐3!<br>길드 별이 ⭐10·25·50개가 되면 <b>🎁 길드전 상자</b>를 받아요. 내 모험 팀은 자동으로 <b>방어 팀</b>이 돼요.' },
  { icon: '📋', title: '미션과 도전 과제', text: '위쪽 <b>📋</b>에서 매일 <b>미션 3개</b>를 깨면 💎 보석! 셋 다 깨면 보너스 💎30.<br>🏆 <b>도전 과제</b>(도감·스테이지·등급·트로피)도 한 번씩 큰 보상을 줘요.<br>전투에서 <b>🤖 자동</b>을 켜면 알아서 싸워요.' },
  { icon: '👤', title: '계정과 오프라인', text: '오른쪽 위 <b>👤</b>에서 <b>계정</b>을 여러 개 만들 수 있어요. 계정마다 <b>자기 섬</b>이 따로 있고, 🔒 비밀번호도 걸 수 있어요.<br>다른 기기로는 <b>📤 옮기기 코드</b>로 섬을 옮겨요.<br>한 번 접속하면 <b>인터넷 없이도</b> 켜지고, 홈 화면에 앱처럼 설치할 수 있어요.<br>👤 메뉴에서 <b>🎵 음악 · 🔊 소리</b>를 켜고 끄고, 폰에서는 <b>⛶ 전체화면</b>도 돼요.<br>🙅 이름에는 욕설·나쁜 말·전화번호 같은 개인정보를 쓸 수 없어요 (다른 사람에게 보이니까요!).' },
  { icon: '🎁', title: '매일 들어오면', text: '오른쪽 위 <b>🎁</b>에서 매일 <b>일일 보상</b>을 받아요. 7일째엔 큰 보상!' },
  { icon: '💡', title: '모르겠으면?', text: '화면 아래 <b>노란 말풍선</b>을 누르면 다음에 할 곳으로 데려가 주고, <b>👆 손가락</b>이 누를 곳을 알려 줘요.<br>오른쪽 위 <b>🎓 튜토리얼</b> 버튼으로 언제든 다시 볼 수 있어요.' },
];
// 처음 온 사람에게는 짧게 3장만. 🎓 튜토리얼 창의 "게임 설명 보기"에서는 전부
const WELCOME_SHORT = [
  { icon: '🧬', title: '몬스터 합치기에 온 걸 환영해요!', text: `몬스터를 <b>모으고</b>, <b>섞고</b>, <b>키우는</b> 게임이에요.<br>${fmt(CAT_LIST.length)}마리 도감을 채워 봐요!` },
  { icon: '🔁', title: '이렇게 놀아요', text: '🏠 서식지 짓기 → 🥚 알 사기 → 🍖 먹이로 <b>Lv.4</b><br>→ 🏔️ 두 마리를 <b>교배</b> → ✨ 새 몬스터!<br>몬스터는 서식지에서 💰 골드를 벌어요.' },
  { icon: '💰', title: '재화 3가지', text: '💰 <b>골드</b>: 몬스터가 벌어요 → 건물·알 사기<br>🍖 <b>먹이</b>: 농장에서 키워요 → 몬스터 레벨 업<br>💎 <b>보석</b>: 미션·보상으로 받아요 → 시간 단축<br><small>위쪽 숫자를 누르면 언제든 자세히 볼 수 있어요</small>' },
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
  updateMuteBtn();
  const dot = $('#dailyDot');
  if (dot) dot.classList.toggle('on', dailyReady());
  updateMisDot();
  updateFullBtn();
  updateGoal();
  [['gold', S.gold], ['gems', S.gems]].forEach(([id, v]) => {
    const el = $('#' + id);
    el.textContent = S.infinite ? '∞' : shortNum(v) + (id === 'gold' && boostOn() ? '⚡' : '');
    el.parentElement.title = S.infinite ? '무한' : fmt(v);
    el.classList.toggle('infinite', S.infinite);
  });
  $('#food').textContent = shortNum(S.food);
  $('#food').parentElement.title = fmt(S.food);
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
  tab: (d) => { tab = d.tab; render(); $('#panel').scrollTop = 0; updateGoal(); },
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
  buyAllMons: (d) => buyAllMons(d.kind),
  buyAny: (d) => buyAny(d.type),
  buyEveryEgg: () => buyEveryEgg(),
  allShopBuyAll: () => allShopBuyAll(),
  allShopSet: (d) => { tutFlag('allShop', true); ALL_SHOP[d.k] = d.v; ALL_SHOP.page = 0; allShopRedraw(); },
  allShopFind: () => { tutFlag('allShop', true); ALL_SHOP.q = (($('#allShopQ') || {}).value || '').trim().slice(0, 20); ALL_SHOP.page = 0; allShopRedraw(); },
  allShopPage: (d) => { tutFlag('allShop', true); ALL_SHOP.page += Number(d.d) || 0; allShopRedraw(); },
  buyHab: (d) => buyHab(d.el),
  buyFood: (d) => buyFood(d.n),
  buyGold: (d) => buyGold(d.n),
  merge: (d) => merge(d.t, d.lv),
  mergeAll: () => mergeAll(),
  upAllHabs: (d) => upAllHabs(d.i),
  upHabMax: (d) => upHabMax(d.i),
  hatchAll: () => hatchAll(),
  dumpEggs: () => dumpEggs(),
  makeRoom: () => makeRoom(),
  feedAll: (d) => feedAll(d.mode),
  team: (d) => toggleTeam(d.uid),
  teamAuto: () => teamAuto(),
  fight: () => startBattle(),
  fightLoop: () => { if (B) { if (!B.over) return; B = null; $('#battle').classList.add('hidden'); } openLoopStart(); },
  loopGo: (d) => { S.bSpeed = Number(d.sp) || 1; S.fastBattle = S.bSpeed > 1; if (S.bSpeed > 1) tutFlag('speed', true); save(); closeModal(); startLoop(); },
  loopStop: () => { stopLoop(); },
  nextStage: () => { if (B) { clearTimeout(B.timer); B = null; $('#battle').classList.add('hidden'); } startBattle(); },
  bSkill: (d) => playerSkill(d.i),
  bTarget: (d) => setTarget(d.id),
  bFast: () => {
    tutFlag('speed', true);
    const list = LOOP ? SPEEDS_LOOP : SPEEDS, cur = bSpeed();
    const next = list[(list.indexOf(cur) + 1) % list.length] || 1;
    S.bSpeed = next; S.fastBattle = next > 1; B.fast = next > 1;
    if (!LOOP && next === 4) toast('⏩ 🔁 연속 전투에서는 100배속까지 빨라져요!');
    save(); drawBattle();
  },
  bAuto: () => {
    if (!B || (B.pvp && !B.coop)) return;
    B.auto = !B.auto; S.autoBattle = B.auto;
    // 내 차례를 기다리던 중이면 바로 자동으로 움직인다
    if (B.auto && B.waiting && B.cur && B.cur.side === 'me') { if (B.coop && B.pvp.role === 'guest') { coopAutoPick(); return; } B.waiting = false; aiAct(B.cur); } else drawBattle();
  },
  typeChart: () => openTypeChart(),
  applyUpdate: () => { if (B && !B.over) { toast('전투가 끝나면 적용할게요'); return; } save(); flushSave(); location.reload(); },
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
  coopHost: () => { tutFlag('coop', true); frInviteTo = null; pvpHost(0, true); },
  coopJoin: () => { tutFlag('coop', true); pvpJoin(true); },
  coopSeen: () => { if (!tutFlag('coop')) { tutFlag('coop', true); toast('🤝 한 명이 레이드 방을 만들고, 친구가 코드로 들어오면 시작해요!'); updateGuide(); } },
  ranking: () => openRanking(),
  gSend: () => gSend(),
  gMute: (d) => gMute(d.id),
  gUnmuteAll: () => { S.gMute = []; save(); guildChatLoad(); toast('🙉 숨긴 사람을 다시 보여요'); },
  fishing: () => openFishing(),
  race: () => openRace(),
  wheel: () => openWheel(),
  games: () => { mgStop(); openGames(); },
  todo: () => openTodo(),
  todoGo: (d) => todoGo(d.id),
  todoBonus: () => todoBonus(),
  mgOpen: (d) => mgOpen(d.id),
  mgStart: (d) => mgStart(d.id),
  mgHit: (d, el) => mgHit(d, el),
  mgCash: () => mgCash(),
  mgQuit: () => { if (MG && !MG.over) { mgStop(); toast('게임을 그만뒀어요'); } openGames(); },
  memory: () => openMemory(),
  memStart: () => memStart(),
  memAgain: () => { MEM = null; memStart(); },
  memFlip: (d) => memFlip(Number(d.i)),
  memClose: () => { closeModal(); updateFishBtn(); openGames(); },
  wheelSpin: () => wheelSpin(),
  wheelClose: () => { if (WSPIN) { toast('룰렛이 멈추면 선물을 받아요!'); return; } closeModal(); openGames(); },
  racePick: (d) => { if (RACE && RACE.st === 'pick') { RACE.pick = Number(d.i); raceDraw(); } },
  raceBet: (d) => { if (RACE && RACE.st === 'pick') { RACE.bet = d.b; raceDraw(); } },
  raceGo: () => raceGo(),
  raceAgain: () => { raceNew(); raceDraw(); },
  raceClose: () => { if (RACE && RACE.raf) clearTimeout(RACE.raf); if (RACE && RACE.st === 'run') { RACE.st = 'done'; toast('경주를 그만뒀어요 (건 것은 돌아오지 않아요)'); } closeModal(); openGames(); },
  fishCast: () => fishCast(),
  fishHit: () => fishHit(),
  fishAgain: () => { FISH = null; fishCast(); },
  fishBuy: () => fishBuy(),
  fishClose: () => { fishStop(); closeModal(); openGames(); },
  friends: () => openFriends(true),
  frAdd: () => frAddByCode(),
  frAddRank: (d) => { const p = rankCache && rankCache.list.find(x => x.id === d.id); if (p && frAdd(p)) openRanking(); },
  frCopy: () => { const c = myFrCode(); try { navigator.clipboard.writeText(c); toast('📋 친구 코드 ' + c + ' 복사했어요!'); } catch (e) { toast('내 친구 코드: ' + c); } },
  frAccept: (d) => frAccept(d.id),
  frReject: (d) => frReject(d.id),
  frRemove: (d) => frRemove(d.id),
  frGift: (d) => frSendGift(d.id),
  frClaim: () => frClaimGifts(),
  frInvite: (d) => frInvite(d.id, d.coop === '1'),
  frJoin: () => frJoinInvite(),
  frRefresh: () => openFriends(true),
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
  rankSearch: () => { tutFlag('rankSearch', true); rankQuery = (($('#rankSearch') || {}).value || '').trim().slice(0, 12); openRanking(); },
  rankSearchClear: () => { rankQuery = ''; openRanking(); },
  rankName: () => {
    const v = ($('#rankName') ? $('#rankName').value : '').trim().slice(0, 10);
    if (!v) { toast('이름을 적어 주세요'); return; }
    if (nameProblem(v)) { toast(nameProblem(v)); return; }
    S.nick = v; save(); toast('✏️ 이름을 바꿨어요'); rankSubmit(true).then(() => { rankCache = null; openRanking(); });
  },
  pvpRandom: () => { if ($('#pvpName') && !saveNick()) return; if (!S.nick) { openPvp(); toast('상대에게 보일 이름을 적고 🌍 랜덤 대전을 눌러요'); return; } tutFlag('friends', true); pvpRandom(); },
  pvpHost: () => { frInviteTo = null; pvpHost(0, false); },
  pvpJoin: () => pvpJoin(false),
  pvpCancel: () => { if (NET) clearInterval(NET.uiTimer); netClose(); closeModal(); toast('대전을 취소했어요'); },
  pvpCopy: (d) => { try { navigator.clipboard.writeText(d.code); toast('📋 코드를 복사했어요: ' + d.code); } catch (e) { toast('코드: ' + d.code); } },
  teamView: (d) => { const v = teamView(); v[d.k] = d.k === 'strong' ? d.v === 'true' : d.v; save(); const p = $('#panel'), y = p.scrollTop; renderAdventure(); p.scrollTop = y; },
  breedView: (d) => { const v = breedView(); v[d.k] = d.k === 'ready' ? d.v === 'true' : d.v; save(); const box = $('#modalBox'); const y = box.scrollTop; openBreed(curMtn); box.scrollTop = y; },
  sellDups: (d) => openSellDups(d.type),
  starFuse: (d) => starFuse(d.uid),
  starList: () => openStarList(),
  altar: () => openAltar(),
  altarRank: (d) => openAltar(d.r),
  altarPick: (d) => altarPick(d.uid),
  altarAuto: () => altarAuto(),
  altarClear: () => { altarSel = []; openAltar(); },
  altarFuse: () => altarFuse(),
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
  islBuy: () => buyIsland(),
  fillIslOpen: () => openFillIsland(),
  islBulkOpen: () => openIslandBulk(),
  wxInfo: () => openWeather(),
  wxCatch: (d, el) => wxCatch(el),
  islBulk: (d) => buyIslandsBulk(d.n),
  upAllHabsMax: () => upAllHabsMax(),
  fillIsl: (d) => fillIsland(d.el),
  islList: () => openIslandList(),
  bossFight: (d) => startBossBattle(d.i),
  daily: () => openDaily(),
  claimDaily: () => claimDaily(),
  missions: () => openMissions(),
  misClaim: (d) => misClaim(d.id),
  misBonus: () => misBonus(),
  achClaim: (d) => achClaim(d.id),
  sound: () => toggleSound(),
  pets: () => openPets(),
  buyRankBox: (d) => buyRankBox(d.r),
  hybEggEl: (d) => { hybEggEl = d.e; const p = $('#panel'), y = p.scrollTop; render(); p.scrollTop = y; },
  buyCloner: () => buyCloner(),
  cloner: () => openCloner(),
  cloneMon: (d) => cloneMon(d.uid),
  raidFight: () => startRaid(),
  raidClaim: (d) => raidClaim(d.k),
  menu: () => openMenu(),
  event: () => openEvent(),
  evtClaim: (d) => evtClaim(d.k),
  evtTrade: () => evtTrade(),
  kdUp: (d) => kdUp(d.id),
  cosUp: (d) => cosUp(d.id),
  buyDeal: (d) => buyDeal(d.k),
  refreshDeals: () => refreshDeals(),
  buyPotion: (d) => buyPotion(d.id),
  buyExchange: () => buyExchange(),
  shopJump: (d) => { shopTab = d.tab || shopTabOf(d.id); render(); const p = $('#panel'); if (p) p.scrollTop = 0; window.scrollTo && window.scrollTo(0, 0); updateGuide(); },
  buyMystery: (d) => buyMystery(d.k),
  buyExtra: (d) => buyExtra(d.k),
  bigshopSeen: () => { if (!tutFlag('bigshop')) { tutFlag('bigshop', true); toast('🗽 랜드마크는 모든 섬 골드를, 💎 보석 상점은 로봇·부스터·전설 알을 팔아요!'); updateGuide(); } },
  kdGem: () => kdGemClaim(),
  buyBoost: () => buyBoost(),
  buyRobot: () => buyRobot(),
  buyLegendBox: () => buyLegendBox(),
  petEgg: (d) => petEgg(d.id),
  petTreat: () => petTreat(),
  petEquip: (d) => petEquip(d.id),
  petFuse: (d) => { tutFlag('petfuse', true); petFuse(d.id); },
  petFuseSeen: () => { if (!tutFlag('petfuse')) { tutFlag('petfuse', true); toast('🧪 부모 펫 두 마리를 Lv.5까지 키우면 합성할 수 있어요!'); updateGuide(); } },
  petAwaken: () => petAwaken(),
  resInfo: (d) => openResInfo(d.r),
  resGo: (d) => { closeModal(); tab = d.to; render(); },
  shopGo: (d) => goShop(d.id),
  achOpen: () => openAch(),
  achTab: (d) => openAch(d.t),
  achClaim2: (d) => achClaim2(d.id),
  achAll: () => achAll(),
  goalGo: () => { tutFlag('goal', true); const g = nextGoal(); if (g && g.quest) openQuests('story'); else if (ACH.some(achReady)) openAch(); else openMissions(); },
  quests: () => openQuests(),
  questTab: (d) => openQuests(d.t),
  qClaim: () => qClaim(),
  weekClaim: (d) => weekClaim(d.id),
  weekBonus: () => weekBonus(),
  music: () => toggleMusic(),
  firstAccOk: () => firstAccOk(),
  krUnits: () => { S.krUnits = !S.krUnits; tutFlag('krunit', true); save(); UT_OPEN = true; openResInfo('gold'); UT_OPEN = false; render(); updateHud(); toast(S.krUnits ? '🇰🇷 이제 만 · 억 · 조 단위로 보여요' : '📏 K · M · B 단위로 돌아왔어요'); },
  richCur: (d) => { RICH_CUR = d.k; const v = ($('#richAmt') || {}).value || ''; openRichGift(); const i = $('#richAmt'); if (i) { i.value = v; i.dispatchEvent(new Event('input')); } },
  richQuick: (d) => { const i = $('#richAmt'); if (i) { i.value = d.q; i.dispatchEvent(new Event('input')); } },
  richGo: () => richGo(),
  lang: () => { tutFlag('lang', true); save(); window.setLang(window.LANG === 'en' ? 'ko' : 'en'); },
  saveNow: () => saveNow(),
  mute: () => { toggleMute(); if ($('#modalBox .build-opt[data-act=mute]')) openAccountMenu(); },
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
  if (fn) fn(t.dataset, t);
});

// ----- 🎬 오프닝 영상 -----
// 소리 있는 영상은 브라우저가 자동 재생을 막는다 → 막히면 "화면을 눌러 시작"을 보여 주고, 누르면 소리와 함께 재생
// ----- 🎬 오프닝 효과음: 영상의 타이핑 소리 대신 웅장한 소리 (영화 예고편처럼) -----
// 0초 "쿵" + 현악·금관이 서서히 커짐 → 1초(글자 완성) "쾅" 큰 화음 + 심벌 → 반짝이는 종소리 → 메아리로 사라짐
function playOpeningSting() {
  if (!audioCtx() || AC.state !== 'running') return false;
  const t0 = AC.currentTime + 0.05;
  const out = AC.createGain();
  out.gain.value = 0.9;
  out.connect(musicBus());
  if (MUS.wet) MUS.wet.gain.setTargetAtTime(0.4, AC.currentTime, 0.05);
  // 1) 첫 "쿵": 큰북 + 아주 낮은 소리
  mDrum(out, t0, 0.55, 90, 32, 1.6);
  mDrum(out, t0, 0.35, 150, 50, 0.6);
  mNoise(out, t0, 0.25, 0.12, 200, 'lowpass');
  // 2) 서서히 커지는 현악·금관 (필터가 열리면서 밝아진다) — D 단조 느낌
  const swell = AC.createBiquadFilter();
  swell.type = 'lowpass'; swell.Q.value = 1.5;
  swell.frequency.setValueAtTime(250, t0);
  swell.frequency.exponentialRampToValueAtTime(3200, t0 + 1.05);
  swell.connect(out);
  [38, 50, 57, 62, 65, 69].forEach(m => voice(swell, t0, hz(m), 1.05, { vol: 0.03, attack: 1.0, release: 0.12, oscs: [{ type: 'sawtooth', detune: -9 }, { type: 'sawtooth', detune: 9 }] }));
  // 올라가는 쉭 소리
  const riser = AC.createBufferSource(), rf = AC.createBiquadFilter(), rg = AC.createGain();
  if (!MUS.noise) mNoise(out, t0, 0.01, 0.0001, 1000);
  riser.buffer = MUS.noise; rf.type = 'bandpass'; rf.Q.value = 2;
  rf.frequency.setValueAtTime(400, t0); rf.frequency.exponentialRampToValueAtTime(6000, t0 + 1.0);
  rg.gain.setValueAtTime(0.0001, t0); rg.gain.exponentialRampToValueAtTime(0.08, t0 + 0.95); rg.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.05);
  riser.connect(rf); rf.connect(rg); rg.connect(out); riser.start(t0); riser.stop(t0 + 1.1);
  // 3) 1초: "쾅!" 큰 화음 (D 장조로 밝게 끝남) + 심벌 + 큰북
  const hit = t0 + 1.05;
  mDrum(out, hit, 0.6, 110, 35, 2.2);
  mDrum(out, hit, 0.3, 200, 70, 0.5);
  mNoise(out, hit, 2.6, 0.09, 4500);
  mNoise(out, hit, 0.3, 0.15, 300, 'lowpass');
  [26, 38, 50, 57, 62, 66, 69, 74].forEach((m, k) => voice(out, hit, hz(m), 1.9, { vol: k < 2 ? 0.07 : 0.035, attack: 0.02, release: 1.1, cutoff: k < 2 ? 500 : 2600, q: 1, oscs: [{ type: 'sawtooth', detune: -6 }, { type: 'sawtooth', detune: 6 }, { type: 'sine', mul: 0.5, gain: 0.5 }] }));
  // 합창 같은 긴 소리
  [62, 66, 69].forEach(m => voice(out, hit, hz(m), 2.0, { vol: 0.03, attack: 0.25, release: 1.2, cutoff: 1800, oscs: [{ type: 'sine' }, { type: 'sine', mul: 2, gain: 0.3 }, { type: 'triangle', detune: 7, gain: 0.5 }] }));
  // 4) 반짝이는 종소리 (D 장조 화음을 위로)
  [74, 78, 81, 86, 90].forEach((m, k) => INST.bell(out, hit + 0.18 + k * 0.11, m, 0.5, 0.9));
  // 끝나면 메아리 양을 원래대로
  setTimeout(() => { if (MUS.wet && AC) MUS.wet.gain.setTargetAtTime(MUS.cur && SONGS[MUS.cur] ? SONGS[MUS.cur].echo || 0.2 : 0.2, AC.currentTime, 0.5); }, 4000);
  return true;
}
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
  let hard = setTimeout(end, 7000);   // 영상이 멈추거나 못 불러와도 7초 뒤에는 무조건 다음으로
  v.addEventListener('ended', end);
  v.addEventListener('error', end);
  v.addEventListener('stalled', () => { clearTimeout(hard); hard = setTimeout(end, 2500); });
  $('#openingSkip').addEventListener('click', (e) => { e.stopPropagation(); end(); });
  // 영상은 소리 없이, 소리는 직접 만든 웅장한 효과음으로
  v.muted = true;
  const start = () => { v.currentTime = 0; const q = v.play(); if (q && q.catch) q.catch(end); };
  start();
  if (!soundOn()) return;
  const tryStart = () => {
    if (!audioCtx()) return;
    const go = () => { if (!done && AC.state === 'running' && playOpeningSting()) { start(); return true; } return false; };
    if (AC.state === 'running') { go(); return; }
    const r = AC.resume();
    // 브라우저가 소리를 막으면(누르기 전) "소리 켜기" 버튼: 누르면 영상도 처음부터 + 효과음
    setTimeout(() => {
      if (done || AC.state === 'running') { if (!done) go(); return; }
      const b = $('#openingTap');
      b.classList.remove('hidden');
      b.addEventListener('click', (ev) => {
        ev.stopPropagation();
        b.classList.add('hidden');
        AC.resume().then(() => { clearTimeout(hard); hard = setTimeout(end, 7000); go(); });
      }, { once: true });
    }, 250);
    if (r && r.then) r.then(() => { if (!done && !$('#openingTap').classList.contains('hidden')) { $('#openingTap').classList.add('hidden'); go(); } }).catch(() => {});
  };
  tryStart();
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
  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    clearTimeout(hardStop);
    if (box) { box.classList.add('fade'); setTimeout(() => box.remove(), 600); }
    resize();
    setTimeout(afterEnter, 350);
    startMusic();
    setTimeout(() => rankSubmit(false), 5000);
  };
  const hardStop = setTimeout(finish, 9000);
  if (!box) { finish(); return; }
  try {
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
  } catch (e) { /* 로딩 중 문제가 있어도 게임은 켠다 */ }
  finish();
}

window.__booted = true;
runOpening();

tick();
render();
requestAnimationFrame(drawWorld);
setInterval(tick, 250);
setInterval(updateHud, 30000);   // 자정이 지나면 🎁 점 다시 켜기
if (accounts().length > 1 || (ACC && ACC.pin) || accLocked(ACC)) openLogin();
if (accLocked(ACC)) setTimeout(() => lockToast(ACC, accLocked(ACC)), 500);
setInterval(() => {
  if (!ACC || !accLocked(ACC) || !$('#login').classList.contains('hidden')) return;
  save();
  if (B) { clearTimeout(B.timer); if (B.pvp) { netSend({ t: 'bye' }); netClose(); } B = null; $('#battle').classList.add('hidden'); }
  closeModal();
  openLogin();
  lockToast(ACC, accLocked(ACC));
}, 5000);
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
  save(); flushSave();
  try { const keys = await caches.keys(); await Promise.all(keys.map(k => caches.delete(k))); } catch (e) { /* 캐시 없음 */ }
  try { const regs = await navigator.serviceWorker.getRegistrations(); await Promise.all(regs.map(r => r.update())); } catch (e) { /* 없음 */ }
  location.reload();
}
window.addEventListener('offline', () => toast('📴 오프라인이에요. 실시간 친구 대전 말고는 그대로 할 수 있어요'));
window.addEventListener('online', () => toast('📶 다시 연결됐어요'));
setInterval(save, 10000);   // (큰 저장은 도우미가 압축해서 게임이 멈추지 않아요)   // 중요한 행동은 그때그때 저장하므로 자동 저장은 10초마다
document.addEventListener('visibilitychange', () => { if (document.hidden) { save(); flushSave(); } });
setInterval(updateFinger, 250);
window.addEventListener('beforeunload', () => { save(); flushSave(); });
window.addEventListener('pagehide', () => { save(); flushSave(); });
// 켤 때 한 번: 예전 큰 저장들을 압축해서 자리 만들기
setTimeout(() => { try { compactAllSaves(); } catch (e) { /* 없음 */ } }, 4000);
