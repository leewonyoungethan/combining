// tools/i18n-base.json + tools/i18n-extra.js → i18n.js  (node tools/build-i18n.js)
const fs = require('fs');
const T = __dirname + '/', dir = __dirname + '/../';
const dict = JSON.parse(fs.readFileSync(T + 'i18n-base.json', 'utf8'));
Object.assign(dict, require('./i18n-extra.js'));
const runtime = fs.readFileSync(T + 'i18n-runtime.js', 'utf8');
fs.writeFileSync(dir + 'i18n.js', runtime.replace('/*DICT*/{}', () => JSON.stringify(dict)));
console.log('i18n.js keys', Object.keys(dict).length, 'bytes', fs.statSync(dir + 'i18n.js').size);
