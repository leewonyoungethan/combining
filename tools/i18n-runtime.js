'use strict';
// ===================== 🌐 영어 모드 =====================
// 게임 코드는 한국어로 그대로 두고, 화면에 나오는 글자를 영어 사전으로 바꿔 준다.
// (화면 글자 · 버튼 설명 · 입력칸 안내 · 캔버스 이름표 · 확인 창)
(function () {
  const LANG_KEY = 'combining-lang';
  let lang = null;
  try { lang = localStorage.getItem(LANG_KEY); } catch (e) { /* 저장 불가 */ }
  // 처음이면 브라우저 언어로 정한다 (한국어가 아니면 영어)
  if (lang !== 'ko' && lang !== 'en') lang = /^ko/i.test(navigator.language || 'ko') ? 'ko' : 'en';
  window.LANG = lang;
  window.setLang = function (l) {
    try { localStorage.setItem(LANG_KEY, l); } catch (e) { /* 저장 불가 */ }
    location.reload();
  };
  window.tr = (s) => s;
  if (lang !== 'en') return;

  document.documentElement.lang = 'en';
  const DICT = /*DICT*/{};
  const KO = /[가-힣ㄱ-ㅎㅏ-ㅣ]/;
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // "{}"가 들어간 문장은 틀(패턴)로: 가장 긴 한국어 조각(anchor)이 들어 있을 때만 맞춰 본다
  const PATS = [];
  for (const k of Object.keys(DICT)) {
    if (!k.includes('{}')) continue;
    const parts = k.split('{}');
    const stat = parts.join('');
    const koLen = (stat.match(/[가-힣]/g) || []).length;
    if (koLen < 2) continue;   // "{}의 {}" 같은 너무 짧은 틀은 엉뚱하게 맞으니 뺀다
    const anchor = parts.map(p => p.trim()).sort((a, b) => b.length - a.length)[0];
    // 한국어가 짧은 틀("{}시간", "{}마리")은 숫자에만 맞춘다 ("⏳시간"이 "⏳h"가 되지 않게)
    PATS.push({ re: new RegExp('^' + parts.map(p => esc(p).replace(/\s+/g, '\\s*')).join('([\\s\\S]+?)') + '$'), en: DICT[k], anchor, len: stat.length, numOnly: koLen <= 3 && /\{\}[가-힣]|[가-힣]\{\}/.test(k) });
  }
  const NUMISH = /^[\s\d.,:+\-×%/A-Za-z]*\d[\s\d.,:+\-×%/A-Za-z]*$/;
  // 여러 낱말로 된 말(띄어쓰기 있는 사전 말)을 먼저 찾기 위해
  const PHRASE = {};
  for (const k of Object.keys(DICT)) if (!k.includes('{}') && /\s/.test(k) && DICT[k]) PHRASE[k] = DICT[k];
  PATS.sort((a, b) => b.len - a.len);
  // 단어 사전: 몬스터 이름처럼 낱말을 이어 붙인 글자를 낱말마다 바꾼다
  const WORD = {};
  for (const k of Object.keys(DICT)) if (!k.includes('{}') && !/\s/.test(k) && DICT[k]) WORD[k] = DICT[k];
  const UNIT = { '개': '', '마리': '', '곳': '', '칸': '', '명': '', '번': '×', '일': 'd', '시간': 'h', '분': 'm', '초': 's', '회': '×', '장': '', '배': '×', '종': ' kinds' };
  const PARTICLES = ['에서', '으로', '에게', '까지', '부터', '의', '을', '를', '이', '가', '은', '는', '에', '로', '와', '과', '도', '만', '님'];
  function fill(en, caps) {
    let seq = 0;
    return en.replace(/\{(\d*)\}/g, (m, d) => {
      const v = caps[d === '' ? seq++ : Number(d)];
      return v == null ? '' : tr(v);
    });
  }
  function word(tok) {
    if (!KO.test(tok)) return tok;
    if (WORD[tok] != null) return WORD[tok];
    // 이모지·기호가 붙은 낱말: "🔥불" → "🔥" + "Fire"
    const g = tok.match(/^([^가-힣ㄱ-ㅎ]+)([가-힣]+)([^가-힣ㄱ-ㅎ]*)$/) || tok.match(/^([^가-힣ㄱ-ㅎ]*)([가-힣]+)([^가-힣ㄱ-ㅎ]+)$/);
    if (g && !/\d$/.test(g[1])) { const w = word(g[2]); if (w !== g[2]) return g[1] + w + g[3]; }
    const m = tok.match(/^([\d.,]+[A-Za-z]{0,4})(개|마리|곳|칸|명|번|일|시간|분|초|회|장|배|종)$/);
    if (m) return m[1] + UNIT[m[2]];
    for (const p of PARTICLES) {
      if (tok.length > p.length && tok.endsWith(p)) {
        const stem = tok.slice(0, -p.length);
        if (WORD[stem] != null) return WORD[stem];
        const u = stem.match(/^([\d.,]+[A-Za-z]{0,4})(개|마리|곳|칸|명|번)$/);
        if (u) return u[1] + UNIT[u[2]];
      }
    }
    return tok;
  }
  // 낱말마다 바꾸되, 이어진 낱말이 사전의 말("첫 승리")이면 통째로
  function words(s) {
    const toks = s.split(/(\s+|[()·,/:!?~…\[\]])/);
    const out = [];
    for (let i = 0; i < toks.length; i++) {
      const t = toks[i];
      if (KO.test(t)) {
        // 뒤로 최대 4낱말까지 붙여 보며 가장 긴 사전 말 찾기
        let best = null, bestJ = i;
        let phrase = t;
        for (let j = i + 2; j < Math.min(toks.length, i + 9); j += 2) {
          if (!/^\s+$/.test(toks[j - 1]) || !KO.test(toks[j])) break;
          phrase += ' ' + toks[j];
          if (PHRASE[phrase] != null) { best = PHRASE[phrase]; bestJ = j; }
        }
        if (best != null) { out.push(best); i = bestJ; continue; }
      }
      out.push(word(t));
    }
    return out.join('').replace(/ {2,}/g, ' ');
  }
  const SPLITS = [' · ', '\n', ' → ', ': ', ' | '];
  const CACHE = new Map();
  function tr(s) {
    if (s == null) return s;
    s = String(s);
    if (!KO.test(s)) return s;
    const hit = CACHE.get(s);
    if (hit != null) return hit;
    const lead = s.match(/^\s*/)[0], trail = s.match(/\s*$/)[0];
    const core = s.trim().replace(/\s+/g, ' ');
    let out = DICT[core];
    if (out == null) {
      for (const p of PATS) {
        if (p.anchor && !core.includes(p.anchor)) continue;
        const m = core.match(p.re);
        if (m && (!p.numOnly || m.slice(1).every(c => NUMISH.test(c)))) { out = fill(p.en, m.slice(1)); break; }
      }
    }
    // 긴 줄은 " · " 같은 구분자로 나눠서 조각마다 번역
    if (out == null) {
      for (const sp of SPLITS) {
        if (core.includes(sp)) { out = core.split(sp).map(x => tr(x)).join(sp); break; }
      }
    }
    // 사전의 말 + 뒤에 붙은 값: "📅 접속한 날 3일" → "📅 Days logged in" + " 3d"
    // 앞에 붙은 값 + 사전의 말: "💎40 🎁 고급 룬" → "💎40 " + "🎁 Premium Rune"
    if (out == null) {
      const toks = core.split(' ');
      for (let j = toks.length - 1; j >= 1 && out == null; j--) {
        const head = toks.slice(0, j).join(' ');
        if (DICT[head] != null && KO.test(head)) out = DICT[head] + ' ' + tr(toks.slice(j).join(' '));
      }
      for (let j = 1; j < toks.length && out == null; j++) {
        const tail = toks.slice(j).join(' ');
        if (DICT[tail] != null && KO.test(tail)) out = tr(toks.slice(0, j).join(' ')) + ' ' + DICT[tail];
      }
    }
    // 앞에 이모지·기호가 붙은 문장: "⚡⚡ 한 턴에 2번 행동" → "⚡⚡ " + 번역
    if (out == null) {
      const pre = core.match(/^[^가-힣ㄱ-ㅎ\d{]+/);
      if (pre && pre[0].length < core.length) { const inner = tr(core.slice(pre[0].length)); if (!KO.test(inner)) out = pre[0] + inner; }
    }
    if (out == null) out = words(core);
    out = lead + out + trail;
    if (CACHE.size > 20000) CACHE.clear();
    CACHE.set(s, out);
    return out;
  }
  window.tr = tr;

  // ----- 화면 글자 바꾸기 -----
  const SKIP = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT']);
  const skipEl = (el) => { for (let e = el; e; e = e.parentElement) { if (SKIP.has(e.tagName) || e.getAttribute && e.getAttribute('translate') === 'no') return true; } return false; };
  const sibText = (n) => (n ? (n.nodeType === 3 ? n.data : n.textContent || '') : null);
  function doText(node) {
    const v = node.data;
    if (!KO.test(v) || skipEl(node.parentElement)) return;
    let t = tr(v);
    // 한국어는 조사가 붙어 띄어쓰기가 없던 자리 ("<b>랜덤 대전</b>으로") → 영어 낱말끼리 붙지 않게 한 칸 띄운다
    if (t && !/^\s/.test(v) && /^[A-Za-z0-9(]/.test(t)) { const p = sibText(node.previousSibling); if (p && /[^\s(\[#+\-]$/.test(p)) t = ' ' + t; }
    if (t && !/\s$/.test(v) && /[A-Za-z0-9,!?)]$/.test(t)) { const nx = sibText(node.nextSibling); if (nx && /^[A-Za-z0-9(]/.test(nx)) t = t + ' '; }
    if (t !== v) node.data = t;
  }
  const ATTRS = ['placeholder', 'title', 'aria-label', 'alt'];
  function doAttrs(el) {
    for (const a of ATTRS) {
      const v = el.getAttribute(a);
      if (v && KO.test(v)) { const t = tr(v); if (t !== v) el.setAttribute(a, t); }
    }
  }
  function walk(root) {
    if (root.nodeType === 3) { doText(root); return; }
    if (root.nodeType !== 1 || skipEl(root)) return;
    doAttrs(root);
    const it = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    let n;
    while ((n = it.nextNode())) {
      if (n.nodeType === 3) doText(n);
      else if (n.getAttribute('translate') === 'no') { /* 건너뛰기: 자식은 walker가 계속 돌지만 doText에서 막힌다 */ }
      else doAttrs(n);
    }
  }
  const mo = new MutationObserver((list) => {
    for (const m of list) {
      if (m.type === 'characterData') doText(m.target);
      else if (m.type === 'attributes') doAttrs(m.target);
      else m.addedNodes.forEach(walk);
    }
  });
  function start() {
    walk(document.body);
    mo.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
    if (KO.test(document.title)) document.title = tr(document.title);
  }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);

  // ----- 캔버스 글자 (섬의 이름표 등) -----
  const P = CanvasRenderingContext2D.prototype;
  const fillText = P.fillText, strokeText = P.strokeText, measureText = P.measureText;
  P.fillText = function (t, ...a) { return fillText.call(this, tr(t), ...a); };
  P.strokeText = function (t, ...a) { return strokeText.call(this, tr(t), ...a); };
  P.measureText = function (t) { return measureText.call(this, tr(t)); };

  // ----- 확인 · 알림 · 입력 창 -----
  const conf = window.confirm, al = window.alert, pr = window.prompt;
  window.confirm = (m) => conf.call(window, tr(m));
  window.alert = (m) => al.call(window, tr(m));
  window.prompt = (m, d) => pr.call(window, tr(m), d);
})();
