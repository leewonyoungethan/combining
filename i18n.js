'use strict';
// 🌐 언어 고르기 (한국어 · English · 中文 · 日本語 · Deutsch)
(function () {
  var KEY = 'combining-lang', OK = ['ko', 'en', 'zh', 'ja', 'de'], V = {"en":"3a272f28","zh":"5976ebed","ja":"18646471","de":"cc3de250"};
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
  if (lang !== 'ko') document.write('<script src="i18n-' + lang + '.js?v=' + V[lang] + '"><\/script>');
})();
