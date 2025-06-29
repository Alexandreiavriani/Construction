// // File: middlewares/adminAuth.js
// function adminAuth(req, res, next) {
//   if (
//     req.path.endsWith('.css') ||
//     req.path.endsWith('.js') ||
//     req.path.endsWith('.html') ||
//     ['/admin/login', '/login.html', '/login'].includes(req.path)
//   ) return next();
  
//   if (req.session && req.session.isAdmin) return next();
//   res.redirect('/admin/login.html');
// }

// module.exports = adminAuth;

// File: middlewares/adminAuth.js
module.exports = function adminAuth(req, res, next) {
  const url = req.originalUrl;  // полный URL, включая /admin
  
  // Разрешаем всегда посмотреть страницу логина и отправить форму
  if (
    (req.method === 'GET'  && url === '/admin/login') ||
    (req.method === 'POST' && url === '/admin/login')
  ) {
    return next();
  }

   if (req.method === 'GET' && url.startsWith('/admin/') &&
      (url.includes('/plugins/') || url.includes('/dist/'))
  ) {
    return next();
  }


  // Всё, что начинается на /admin, дальше только сессия
  if (url.startsWith('/admin')) {
    if (req.session && req.session.isAdmin) {
      return next();
    }
    return res.redirect('/admin/login');
  }
  
  // Не /admin — пропускаем
  next();
};