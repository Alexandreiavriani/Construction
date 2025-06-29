console.log('main.js загружен');





 // Include-функция для header и footer
    function loadInclude(id, url) {
      fetch(url)
        .then(res => res.ok ? res.text() : Promise.reject(`Include ${url} failed`))
        .then(html => {
          document.getElementById(id).innerHTML = html;
          if (id === 'site-header' && typeof initNavbar === 'function') initNavbar();
        })
        .catch(err => console.error('Include error:', err));
    }
    // Подгружаем header и footer
    loadInclude('site-header', 'header.html');
    loadInclude('site-footer', 'footer.html');


function initNavbar() {
  // гамбургер
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.querySelector('.nav-links');

   hamburger.addEventListener('click', (e) => {
    e.stopPropagation(); // чтобы клик по гамбургеру не «просочился» дальше
    if (!navLinks.classList.contains('active')) {
      navLinks.classList.add('active');
    }
    // Если меню уже активно, повторный клик по гамбургеру не закрывает его.
  });

    document.addEventListener('click', (e) => {
    // Если меню открыто и клик произошёл не внутри меню (.nav-links):
    if (navLinks.classList.contains('active') && !navLinks.contains(e.target)) {
      navLinks.classList.remove('active');
    }
  });


  
   

  // показ телефона
  const phoneLink = document.getElementById("phone-link");
  const phoneSymbol = document.getElementById("phone-symbol");
  const phoneNumber = document.getElementById("phone-number");
  if (phoneLink && phoneSymbol && phoneNumber) {
    phoneLink.addEventListener("click", () => {
      phoneSymbol.style.display = "none";
      phoneNumber.style.display = "inline";
    });
  }

  // Выборка элементов для логина
  const loginLink = document.getElementById('loginLink');
  const signupLink = document.getElementById('signupLink');
  const userDropdownContainer = document.getElementById('userDropdownContainer');
  const userEmailSpan = document.getElementById('userEmail');

  // Получаем e-mail текущего пользователя
  fetch('/api/user-info', { credentials: 'include' })
    .then(res => res.ok ? res.json() : Promise.reject())
    .then(data => {
      if (loginLink && userDropdownContainer && userEmailSpan) {
        loginLink.style.display = 'none';
        userEmailSpan.textContent = data.email;
        userDropdownContainer.style.display = 'inline-block';
      }
      if(signupLink && userDropdownContainer && userEmailSpan){
        signupLink.style.display = 'none';
      }
    })
    .catch(() => {
      // Гость — ничего не меняем
    });

  // dropdown-меню пользователя
  const toggle = document.getElementById('userToggle');
  const menu = document.getElementById('userMenu');
  if (toggle && menu) {
    toggle.addEventListener('click', e => {
      e.preventDefault();
      menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
    });
    document.addEventListener('click', e => {
      if (!toggle.contains(e.target) && !menu.contains(e.target)) {
        menu.style.display = 'none';
      }
    });
  }
    
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.classList.add('shrink');
      } else {
        navbar.classList.remove('shrink');
      }
    });
  

   // Include-функция для header
}



 // Функция прокрутки к якорю, если он есть в URL
  function scrollToHashTarget() {
    const hash = window.location.hash;
    if (hash) {
      // Дождись рендера
      setTimeout(() => {
        const target = document.querySelector(hash);
        if (target) {
          target.scrollIntoView({ behavior: "smooth" });
        }
      }, 100); // Задержка, чтобы успел прогрузиться include
    }
  }

  // Ждём, пока загрузятся include (например, header), а потом скроллим
  document.addEventListener("DOMContentLoaded", () => {
    // Вызываем после загрузки страницы
    scrollToHashTarget();
  });



// swiper image
var swiper = new Swiper(".myswaper", {
  
  
    slidesPerView: 3.75,
    spaceBetween: -50,
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    pagination: {
      el: ".swiper-pagination",
    },
    keyboard: true,
  
  
  });


  
  
  
  if (matchMedia('only screen and (max-width: 1456px)').matches) {
  
    var swiper = new Swiper(".myswaper", {
    
    
      slidesPerView: 2.5,
      spaceBetween: 25,
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
      pagination: {
        el: ".swiper-pagination",
      },
      keyboard: true,
    
    
    });
   
  }

