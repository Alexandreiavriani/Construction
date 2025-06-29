i18next
  .use(i18nextHttpBackend)
  .init({
    lng: localStorage.getItem('lang') || 'en',
    fallbackLng: 'en',
    debug: true,
    backend: { loadPath: 'locales/{{lng}}.json' }
  }, () => {
    // 1) Переводим статические тексты
    updateTexts();

    // 2) Стартовое состояние
    window.currentType = 'photo';

    // 3) Навешиваем единый обработчик Bootstrap
    $('#galleryTabs a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
      window.currentType = (e.target.id === 'photos-tab') ? 'photo' : 'video';
      loadGallery(window.currentType, i18next.language);
    });

    // 4) Триггерим “shown” на уже активном табе, чтобы загрузить фото ровно один раз
    $('#galleryTabs a.nav-link.active[data-toggle="tab"]')
      .trigger('shown.bs.tab');
  });

// Переключаем язык и перезагружаем галерею
window.changeLanguage = lang => {
  i18next.changeLanguage(lang, () => {
    localStorage.setItem('lang', lang);
    updateTexts();
    loadGallery(window.currentType, lang);
  });
};

function updateTexts() {
  document.querySelectorAll('[data-i18n-key]').forEach(el => {
    el.textContent = i18next.t(el.getAttribute('data-i18n-key'));
  });
}

// loadGallery остаётся без изменений
// async function loadGallery(type, lang) { ... }
