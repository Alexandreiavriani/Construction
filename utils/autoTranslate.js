const translate = require('translate-google');

async function autoTranslate(text, from = 'ka', targets = ['en', 'ru']) {
  const entries = await Promise.all(
    targets.map(async (to) => {
      try {
        const translated = await translate(text, { from, to });
        return [to, translated];
      } catch (e) {
        console.error(`Ошибка перевода ${from} → ${to}:`, e);
        return [to, null];
      }
    })
  );
  return Object.fromEntries(entries);
}

module.exports = autoTranslate;