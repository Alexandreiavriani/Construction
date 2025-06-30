// const db = require('../db');

// const GalleryTrans = {
//   create: async ({ gallery_id, lang, title }) => {
//     await db.query(
//       'INSERT INTO gallery_translations (gallery_id, lang, title) VALUES (?, ?, ?)',
//       [gallery_id, lang, title]
//     );
//   },

//   findByGalleryIdAndLang: async (gallery_id, lang) => {
//     const [rows] = await db.query(
//       'SELECT title FROM gallery_translations WHERE gallery_id = ? AND lang = ?',
//       [gallery_id, lang]
//     );
//     return rows[0]?.title || null;
//   },

//   // Добавь этот метод
//   deleteByGalleryId: async (gallery_id) => {
//     await db.query(
//       'DELETE FROM gallery_translations WHERE gallery_id = ?',
//       [gallery_id]
//     );
//   },

//   findAllByGalleryId: async (galleryId) => {
//   const [rows] = await db.query(
//     'SELECT lang, title FROM gallery_translations WHERE gallery_id = ?',
//     [galleryId]
//   );
//   return rows;
// },
// };





// module.exports = GalleryTrans;


const db = require('../db');

const GalleryTrans = {
  create: async ({ gallery_id, lang, title }) => {
    await db.query(
      'INSERT INTO gallery_translations (gallery_id, lang, title) VALUES ($1, $2, $3)',
      [gallery_id, lang, title]
    );
  },

  findByGalleryIdAndLang: async (gallery_id, lang) => {
    const { rows } = await db.query(
      'SELECT title FROM gallery_translations WHERE gallery_id = $1 AND lang = $2',
      [gallery_id, lang]
    );
    return rows[0]?.title || null;
  },

  deleteByGalleryId: async (gallery_id) => {
    await db.query(
      'DELETE FROM gallery_translations WHERE gallery_id = $1',
      [gallery_id]
    );
  },

  findAllByGalleryId: async (gallery_id) => {
    const { rows } = await db.query(
      'SELECT lang, title FROM gallery_translations WHERE gallery_id = $1',
      [gallery_id]
    );
    return rows;
  }
};

module.exports = GalleryTrans;
