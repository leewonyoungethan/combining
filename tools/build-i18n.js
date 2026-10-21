// tools/i18n-*.json · i18n-extra.js · i18n-runtime.js → i18n.js (언어 고르기) + i18n-en.js · i18n-zh.js · i18n-ja.js · i18n-de.js
// (node tools/build-i18n.js)
const fs = require('fs');
const crypto = require('crypto');
const T = __dirname + '/', dir = __dirname + '/../';
const en = JSON.parse(fs.readFileSync(T + 'i18n-base.json', 'utf8'));
Object.assign(en, require('./i18n-extra.js'));
const runtime = fs.readFileSync(T + 'i18n-runtime.js', 'utf8');
// 숫자 뒤에 붙는 단위 (3마리 · 5시간 …)
const UNITS = {
  en: { '개': '', '마리': '', '곳': '', '칸': '', '명': '', '번': '×', '일': 'd', '시간': 'h', '분': 'm', '초': 's', '회': '×', '장': '', '배': '×', '종': ' kinds' },
  zh: { '개': '个', '마리': '只', '곳': '处', '칸': '格', '명': '人', '번': '次', '일': '天', '시간': '小时', '분': '分', '초': '秒', '회': '次', '장': '张', '배': '倍', '종': '种' },
  ja: { '개': '個', '마리': '匹', '곳': 'か所', '칸': '枠', '명': '人', '번': '回', '일': '日', '시간': '時間', '분': '分', '초': '秒', '회': '回', '장': '枚', '배': '倍', '종': '種類' },
  de: { '개': '', '마리': '', '곳': '', '칸': '', '명': '', '번': '×', '일': ' T.', '시간': ' Std.', '분': ' Min.', '초': ' s', '회': '×', '장': '', '배': '×', '종': ' Arten' },
};
const vers = {};
for (const lang of Object.keys(UNITS)) {
  let dict = en;
  if (lang !== 'en') {
    const tr = JSON.parse(fs.readFileSync(T + 'i18n-' + lang + '.json', 'utf8'));
    dict = {};
    // 아직 번역이 없는 말은 영어로 (한국어가 그대로 남지 않게)
    for (const k of Object.keys(en)) dict[k] = tr[k] != null ? tr[k] : en[k];
  }
  const out = runtime.replace('/*DICT*/{}', () => JSON.stringify(dict)).replace('/*UNIT*/{}', () => JSON.stringify(UNITS[lang]));
  fs.writeFileSync(dir + 'i18n-' + lang + '.js', out);
  vers[lang] = crypto.createHash('md5').update(out).digest('hex').slice(0, 8);
  console.log('i18n-' + lang + '.js keys', Object.keys(dict).length, 'bytes', out.length);
}
// 언어 고르기: 한국어면 아무것도 안 불러오고, 다른 말이면 그 말 파일을 바로 불러온다
const loader = `'use strict';
// 🌐 언어 고르기 (한국어 · English · 中文 · 日本語 · Deutsch)
(function () {
  var KEY = 'combining-lang', OK = ['ko', 'en', 'zh', 'ja', 'de'], V = ${JSON.stringify(vers)};
  var lang = null;
  try { lang = localStorage.getItem(KEY); } catch (e) { /* 저장 불가 */ }
  if (OK.indexOf(lang) < 0) {
    var n = String(navigator.language || 'ko').toLowerCase();
    lang = /^ko/.test(n) ? 'ko' : /^zh/.test(n) ? 'zh' : /^ja/.test(n) ? 'ja' : /^de/.test(n) ? 'de' : 'en';
  }
  window.LANG = lang;
  window.LANGS = [['ko', '🇰🇷 한국어'], ['en', '🇺🇸 English'], ['zh', '🇨🇳 中文'], ['ja', '🇯🇵 日本語'], ['de', '🇩🇪 Deutsch']];
  window.setLang = function (l) {
    try { localStorage.setItem(KEY, l); } catch (e) { /* 저장 불가 */ }
    location.reload();
  };
  window.tr = function (s) { return s; };
  if (lang !== 'ko') document.write('<script src="i18n-' + lang + '.js?v=' + V[lang] + '"><\\/script>');
})();
`;
fs.writeFileSync(dir + 'i18n.js', loader);
console.log('i18n.js (loader)', loader.length, vers);
