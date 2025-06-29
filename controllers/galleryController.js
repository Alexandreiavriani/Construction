// controllers/galleryController.js
// ---------------------------------
// В этом единственном файле собраны и публичные методы (для GET /gallery),
// и административные методы (upload, getItem, updateItem, deleteItem).

const fs = require('fs');
const path = require('path');
const Gallery = require('../models/galleryModel');
const autoTranslate = require('../utils/autoTranslate');
const GalleryTrans = require('../models/galleryTranslationsModel');

// ====================================================================
// 1) Публичный API: GET /gallery?type=photo&page=...&limit=...
// ====================================================================
// exports.getGallery = async (req, res) => {
//   try {
//     // Параметры запроса
//     const typeQuery = req.query.type === 'video' ? 'video' : 'photo';
//     const page = parseInt(req.query.page, 10) || 1;
//     const limit = parseInt(req.query.limit, 10) || 9;
//     const offset = (page - 1) * limit;

//     // Общее число записей нужного типа
//     const totalItems = await Gallery.countByType(typeQuery);
//     const totalPages = Math.ceil(totalItems / limit);

//     // Записи с учётом пагинации
//     const rows = await Gallery.findByTypeWithPagination(typeQuery, limit, offset);

//     // Формируем JSON-ответ
//     const items = rows.map(item => ({
//       id: item.id,
//       title: item.title,
//       filepath: item.filepath
//     }));

//     res.json({
//       items,
//       pagination: {
//         totalItems,
//         totalPages,
//         currentPage: page,
//         pageSize: limit
//       }
//     });
//   } catch (err) {
//     console.error('galleryController.getGallery:', err);
//     res.status(500).json({ message: 'Ошибка на сервере' });
//   }
// };



exports.getGallery = async (req, res) => {
  try {
    // 1) Параметры
    const typeQuery = req.query.type === 'video' ? 'video' : 'photo';
    const requestedLang = req.query.lang; // 'en' или 'ru'; если нет — undefined
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 9;
    const offset = (page - 1) * limit;

    // 2) Подсчёт и страницы
    const totalItems = await Gallery.countByType(typeQuery);
    const totalPages = Math.ceil(totalItems / limit);

    // 3) Выбираем базовые записи (они содержат оригинал на lang_original)
    const rows = await Gallery.findByTypeWithPagination(typeQuery, limit, offset);
    // rows: [{ id, filepath, title, lang_original }, ...]

    // 4) Для каждой записи выбираем нужный заголовок
    const items = await Promise.all(rows.map(async item => {
      let title = item.title;              // по умолчанию оригинал
      const origLang = item.lang_original; // 'ka'

      // если запрошенный язык есть и отличается от оригинала
      if (requestedLang && requestedLang !== origLang) {
        const translated = await GalleryTrans.findByGalleryIdAndLang(item.id, requestedLang);
        if (translated) {
          title = translated;
        }
      }

      return {
        id: item.id,
        title,
        filepath: item.filepath
      };
    }));

    // 5) Возвращаем ответ
    res.json({
      items,
      pagination: { totalItems, totalPages, currentPage: page, pageSize: limit }
    });
  } catch (err) {
    console.error('galleryController.getGallery:', err);
    res.status(500).json({ message: 'Ошибка на сервере' });
  }
};

// ====================================================================
// 2) Админ: Получить один элемент по ID (GET /admin/gallery/:id → JSON)
// ====================================================================
// exports.getItem = async (req, res) => {
//   try {
//     const id = parseInt(req.params.id, 10);
//     const record = await Gallery.findById(id);
//     if (record) {
//       // Возвращаем JSON для предзаполнения формы редактирования
//       return res.json({
//         id: record.id,
//         type: record.type,
//         title: record.title,
//         filepath: record.filepath
//       });
//     } else {
//       return res.status(404).json({ message: 'Элемент не найден' });
//     }
//   } catch (err) {
//     console.error('galleryController.getItem:', err);
//     res.status(500).json({ message: 'Ошибка на сервере при получении элемента' });
//   }
// };


exports.getItem = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const record = await Gallery.findById(id);
    if (!record) {
      return res.status(404).json({ message: 'Элемент не найден' });
    }

    // Ищем переводы
    const translations = await GalleryTrans.findAllByGalleryId(id); // массив с полями lang и title

    const response = {
      id: record.id,
      type: record.type,
      title: record.title,
      filepath: record.filepath,
      translations: {
        en: '',
        ru: ''
      }
    };

    translations.forEach(t => {
      if (t.lang === 'en') response.translations.en = t.title;
      if (t.lang === 'ru') response.translations.ru = t.title;
    });

    return res.json(response);
  } catch (err) {
    console.error('galleryController.getItem:', err);
    res.status(500).json({ message: 'Ошибка на сервере при получении элемента' });
  }
};

// ====================================================================
// 3) Админ: Загрузка нового элемента (POST /admin/gallery/upload)
// ====================================================================
// exports.uploadItem = async (req, res) => {
//   try {


//     const { type, title, videoUrl } = req.body;
//     let filepath = '';

//     if (type === 'photo') {
//       // Для фото обязательно req.file
//       if (!req.file) {
//         return res.status(400).send('Не найден файл изображения');
//       }
//       // filepath = '/' + req.file.path.replace(/\\/g, '/');
//       filepath = '/uploads/' + req.file.filename;
//     } else {
//       // video: либо URL, либо файл
//       if (videoUrl && videoUrl.trim() !== '') {
//         filepath = videoUrl.trim();
//       } else if (req.file) {
//         filepath = '/uploads/' + req.file.filename;
//       } else {
//         return res.status(400).send('Нужно указать YouTube URL или загрузить видеофайл');
//       }
//     }

//     // Создаём запись в БД
//     await Gallery.create({ type, filepath, title });

//     // Редирект или JSON — здесь редирект на список admin/galleria
//     //  res.redirect('/admin/gallery');
//     res.redirect(req.get('Referer') || '/admin/gallery');
    
//   } catch (err) {
//     console.error('galleryController.uploadItem:', err);
//     res.status(500).send('Ошибка сервера при загрузке галереи');
//   }
// };


// exports.uploadItem = async (req, res) => {
//   try {
//     const { type, title /* грузинский оригинал */, videoUrl } = req.body;
//     let filepath = '';

//     if (type === 'photo') {
//       if (!req.file) return res.status(400).send('Не найден файл изображения');
//       filepath = '/uploads/' + req.file.filename;
//     } else {
//       if (videoUrl && videoUrl.trim()) filepath = videoUrl.trim();
//       else if (req.file) filepath = '/uploads/' + req.file.filename;
//       else return res.status(400).send('Укажите YouTube URL или файл');
//     }

//     // 1) Сохраняем оригинал
//     const galleryId = await Gallery.create({
//       type,
//       filepath,
//       title,
//       lang_original: 'ka'
//     });

//     // 2) Делаем авто-перевод
//     const translations = await autoTranslate(title, 'ka', ['en','ru']);
//     console.log('translations:', translations);
//     //    { en: 'Construction ...', ru: 'Строительство ...' }

//     // 3) Сохраняем переводы
//     for (const [lang, text] of Object.entries(translations)) {
//       await GalleryTrans.create({
//         gallery_id: galleryId,
//         lang,
//         title: text
//       });
//     }

//     res.redirect(req.get('Referer') || '/admin/gallery');
//   } catch (err) {
//     console.error('galleryController.uploadItem:', err);
//     res.status(500).send('Ошибка сервера при загрузке галереи');
//   }
// };


exports.uploadItem = async (req, res) => {
  try {
    const { type, title /* грузинский оригинал */, videoUrl } = req.body;
    let filepath = '';

    if (type === 'photo') {
      if (!req.file) return res.status(400).send('Не найден файл изображения');
      filepath = '/uploads/' + req.file.filename;
    } else {
      if (videoUrl && videoUrl.trim()) filepath = videoUrl.trim();
      else if (req.file) filepath = '/uploads/' + req.file.filename;
      else return res.status(400).send('Укажите YouTube URL или файл');
    }

    // 1) Сохраняем оригинал
    const galleryId = await Gallery.create({
      type,
      filepath,
      title,
      lang_original: 'ka'
    });

    // 2) Делаем авто-перевод
    const translations = await autoTranslate(title, 'ka', ['en', 'ru']);
    console.log('translations:', translations);
    // { en: '...', ru: '...' }

    // 3) Сохраняем переводы параллельно
    const saveTasks = Object.entries(translations).map(([lang, text]) =>
      GalleryTrans.create({
        gallery_id: galleryId,
        lang,
        title: text || ''
      })
    );
    await Promise.all(saveTasks);

    res.redirect(req.get('Referer') || '/admin/gallery');
  } catch (err) {
    console.error('galleryController.uploadItem:', err);
    res.status(500).send('Ошибка сервера при загрузке галереи');
  }
};







// ====================================================================
// 4) Админ: Обновление существующего элемента (PUT /admin/gallery/:id)
// ====================================================================
// exports.updateItem = async (req, res) => {
//   try {
//     const id = parseInt(req.params.id, 10);

//     // Сначала найдём старую запись
//     const oldRecord = await Gallery.findById(id);
//     if (!oldRecord) {
//       return res.status(404).send('Элемент не найден');
//     }

//     const { type, title, videoUrl } = req.body;
//     let newFilepath = oldRecord.filepath;

//     if (type === 'photo') {
//       if (req.file) {
//         newFilepath = '/uploads/' + req.file.filename;
//       } else if (oldRecord.type === 'video') {
//         return res.status(400).send('Для смены типа на «photo» необходимо загрузить файл');
//       }
//     }else {
//       if (videoUrl && videoUrl.trim() !== '') {
//         newFilepath = videoUrl.trim();
//       } else if (req.file) {
//         newFilepath = '/uploads/' + req.file.filename;
//       } else if (oldRecord.type === 'photo') {
//         return res
//           .status(400)
//           .send('Для смены типа на «video» необходимо указать YouTube URL или загрузить видеофайл');
//       }
// }

//     // Если старый filepath был локальным и меняется на что-то другое — удаляем старый файл
//     if (
//       !oldRecord.filepath.startsWith('http') &&
//       oldRecord.filepath !== newFilepath
//     ) {
//       const oldFileOnDisk = path.join(__dirname, '..', oldRecord.filepath);
//       fs.unlink(oldFileOnDisk, (err) => {
//         if (err) console.warn('Не удалось удалить старый файл:', oldFileOnDisk, err);
//       });
//     }

//     // Обновляем запись в БД
//     await Gallery.updateById({
//       id,
//       type,
//       filepath: newFilepath,
//       title
//     });

//     // Возвращаем JSON-ответ об успешном обновлении
//     return res.json({ success: true });
//   } catch (err) {
//     console.error('galleryController.updateItem:', err);
//     return res.status(500).send('Ошибка сервера при обновлении элемента');
//   }
// };



// exports.updateItem = async (req, res) => {
//   try {
//     const id = parseInt(req.params.id, 10);
//     const { type, title, videoUrl } = req.body;
//     let newFilepath = (await Gallery.findById(id)).filepath;

//     // 1) Обновляем filepath, если нужно
//     if (type === 'photo') {
//       if (req.file) {
//         newFilepath = '/uploads/' + req.file.filename;
//       }
//     } else {
//       if (videoUrl && videoUrl.trim()) {
//         newFilepath = videoUrl.trim();
//       } else if (req.file) {
//         newFilepath = '/uploads/' + req.file.filename;
//       }
//     }

//     // 2) Обновляем основную запись (оригинал на ka)
//     await Gallery.updateById({
//       id,
//       type,
//       filepath: newFilepath,
//       title,            // грузинский оригинал
//       lang_original: 'ka'
//     });

//     // 3) Генерируем новые переводы
//     const translations = await autoTranslate(title, 'ka', ['en','ru']);
//     // translations = { en: '...', ru: '...' }

//     // 4) Удаляем старые переводы
//     await GalleryTrans.deleteByGalleryId(id);

//     // 5) Вставляем свежие
//     for (const [lang, text] of Object.entries(translations)) {
//       await GalleryTrans.create({
//         gallery_id: id,
//         lang,
//         title: text || ''    // пусть будет пустая строка, если вдруг null
//       });
//     }

//     return res.json({ success: true });
//   } catch (err) {
//     console.error('galleryController.updateItem:', err);
//     return res.status(500).send('Ошибка сервера при обновлении элемента');
//   }
// };



// exports.updateItem = async (req, res) => {
//   try {
//     const id = parseInt(req.params.id, 10);
//     const { type, title = '', videoUrl } = req.body;

//     // Получаем текущий элемент
//     const existingItem = await Gallery.findById(id);
//     if (!existingItem) return res.status(404).send('Элемент не найден');

//     let newFilepath = existingItem.filepath;
//     const newTitle = title.trim() || existingItem.title; // <-- ✅ если пусто, не перезаписываем

//     // Обновляем файл
//     if (type === 'photo' && req.file) {
//       newFilepath = '/uploads/' + req.file.filename;
//     } else if (type === 'video') {
//       if (videoUrl && videoUrl.trim()) {
//         newFilepath = videoUrl.trim();
//       } else if (req.file) {
//         newFilepath = '/uploads/' + req.file.filename;
//       }
//     }

//     // Обновляем основной элемент (ka)
//     await Gallery.updateById({
//       id,
//       type,
//       filepath: newFilepath,
//       title: newTitle,
//       lang_original: 'ka'
//     });

//     // Переводы: если заголовок изменился — только тогда обновляем переводы
//     if (newTitle !== existingItem.title) {
//       const translations = await autoTranslate(newTitle, 'ka', ['en', 'ru']);

//       await GalleryTrans.deleteByGalleryId(id);
//       for (const [lang, text] of Object.entries(translations)) {
//         await GalleryTrans.create({
//           gallery_id: id,
//           lang,
//           title: text || ''
//         });
//       }
//     }

//     return res.json({ success: true });
//   } catch (err) {
//     console.error('galleryController.updateItem:', err);
//     return res.status(500).send('Ошибка сервера при обновлении элемента');
//   }
// };




exports.updateItem = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { type, title, title_en, title_ru, videoUrl } = req.body;

    let newFilepath = (await Gallery.findById(id)).filepath;

    if (type === 'photo') {
      if (req.file) {
        newFilepath = '/uploads/' + req.file.filename;
      }
    } else {
      if (videoUrl && videoUrl.trim()) {
        newFilepath = videoUrl.trim();
      } else if (req.file) {
        newFilepath = '/uploads/' + req.file.filename;
      }
    }

    // 1) Обновляем основную запись
    await Gallery.updateById({
      id,
      type,
      filepath: newFilepath,
      title, // грузинский
      lang_original: 'ka'
    });

    // 2) Удаляем старые переводы
    await GalleryTrans.deleteByGalleryId(id);

    // 3) Вставляем вручную введённые переводы
    await GalleryTrans.create({ gallery_id: id, lang: 'en', title: title_en || '' });
    await GalleryTrans.create({ gallery_id: id, lang: 'ru', title: title_ru || '' });

    return res.json({ success: true });
  } catch (err) {
    console.error('galleryController.updateItem:', err);
    return res.status(500).send('Ошибка сервера при обновлении элемента');
  }
};

// ====================================================================
// 5) Админ: Удаление элемента (DELETE /admin/gallery/:id)
// ====================================================================
exports.deleteItem = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    // Находим запись, чтобы получить её filepath
    const record = await Gallery.findById(id);
    if (record) {
      const fp = record.filepath;
      // Если локальный файл (не начинается с http), удаляем с диска
      if (!fp.startsWith('http')) {
        const filePathOnDisk = path.join(__dirname, '..', fp);
        fs.unlink(filePathOnDisk, (err) => {
          if (err) console.warn('Не удалось удалить файл:', filePathOnDisk, err);
        });
      }
      // Удаляем запись из БД
      await Gallery.deleteById(id);
      return res.json({ success: true });
    } else {
      return res.status(404).json({ message: 'Элемент не найден' });
    }
  } catch (err) {
    console.error('galleryController.deleteItem:', err);
    res.status(500).json({ message: 'Ошибка при удалении элемента' });
  }
};


/**
 * Админ: вернуть все элементы галереи (без пагинации) в виде JSON-массива.
 * GET /gallery/all   или   GET /admin/gallery/all
 */
exports.getAllItems = async (req, res) => {
  try {
    // Предположим, что мы хотим вернуть сразу и фото, и видео,
    // отсортированные по created_at DESC.
    const rows = await Gallery.findAll(); // добавим этот метод в модель
    // Преобразуем в нужный формат:
    const items = rows.map(item => ({
      id: item.id,
      type: item.type,
      title: item.title,
      filepath: item.filepath
    }));
    res.json(items);
  } catch (err) {
    console.error('galleryController.getAllItems:', err);
    res.status(500).json({ message: 'Ошибка на сервере при получении всех элементов' });
  }
};