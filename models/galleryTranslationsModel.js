const db = require('../db');

const GalleryTrans = {
  create: async ({ gallery_id, lang, title }) => {
    await db.execute(
      'INSERT INTO gallery_translations (gallery_id, lang, title) VALUES (?, ?, ?)',
      [gallery_id, lang, title]
    );
  },

  findByGalleryIdAndLang: async (gallery_id, lang) => {
    const [rows] = await db.execute(
      'SELECT title FROM gallery_translations WHERE gallery_id = ? AND lang = ?',
      [gallery_id, lang]
    );
    return rows[0]?.title || null;
  },

  // Добавь этот метод
  deleteByGalleryId: async (gallery_id) => {
    await db.execute(
      'DELETE FROM gallery_translations WHERE gallery_id = ?',
      [gallery_id]
    );
  },

  findAllByGalleryId: async (galleryId) => {
  const [rows] = await db.execute(
    'SELECT lang, title FROM gallery_translations WHERE gallery_id = ?',
    [galleryId]
  );
  return rows;
},
};





module.exports = GalleryTrans;