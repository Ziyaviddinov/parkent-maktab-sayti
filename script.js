// Mobil menyu
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navMenu.classList.toggle('active');
  document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
});

// Mega-menu dropdown'larni mobil rejimda ochish/yopish
document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
  toggle.addEventListener('click', (e) => {
    if (window.innerWidth <= 1440) {
      e.preventDefault();
      const megaMenu = toggle.nextElementSibling;
      megaMenu.classList.toggle('open');
      const icon = toggle.querySelector('i');
      if (icon) icon.style.transform = megaMenu.classList.contains('open') ? 'rotate(180deg)' : 'rotate(0deg)';
    }
  });
});

// Faqat haqiqiy sahifa/anchor havolalari bosilganda mobil menyu yopiladi
// (dropdown-toggle va mega-menu ichidagi bo'sh "#" havolalar bundan mustasno)
navMenu.querySelectorAll('a').forEach(link => {
  if (link.classList.contains('dropdown-toggle')) return;
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
    document.body.style.overflow = '';
    document.querySelectorAll('.mega-menu.open').forEach(m => m.classList.remove('open'));
  });
});

// Scroll qilinganda aktiv linkni yangilash
const sections = document.querySelectorAll('section[id]');
const homeLink = document.querySelector('.nav-menu a[href="#"]');

function updateActiveLink() {
  const scrollY = window.pageYOffset;
  if (scrollY < 300 && homeLink) {
    document.querySelectorAll('.nav-menu a:not(.btn-yellow)').forEach(a => a.classList.remove('active'));
    homeLink.classList.add('active');
    return;
  }
  sections.forEach(section => {
    const sectionHeight = section.offsetHeight;
    const sectionTop = section.offsetTop - 100;
    const sectionId = section.getAttribute('id');
    const link = document.querySelector(`.nav-menu a[href="#${sectionId}"]`);
    if (link && !link.classList.contains('btn-yellow') && scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
      document.querySelectorAll('.nav-menu a:not(.btn-yellow)').forEach(a => a.classList.remove('active'));
      link.classList.add('active');
    }
  });
}
window.addEventListener('scroll', updateActiveLink);

// =============================================
// DARS JADVALI — Excel dan olingan ma'lumotlar
// II chorak 2025-2026 o'quv yili
// =============================================

let SCHEDULE = {
  "5-A": {
    "dushanba": [["Ona tili", "2-12."], ["Matematika", "1-05. 3-12."], ["Matematika", "1-05. 3-12."], ["Ingliz tili", "3-01. 3-04."], ["San'at", "2-18."], ["Adabiyot", "2-12."]],
    "seshanba": [["Ingliz tili", "3-01. 3-02."], ["Informatika", "2-02. 2-03."], ["Matematika", "1-05. 3-12."], ["Rus tili", "1-1-02. 1-1-04."], ["Jismoniy tarbiya", "sport zali"], ["Science", "1-10."]],
    "chorshanba": [["Matematika", "1-05. 3-12."], ["Adabiyot", "2-12."], ["Jaxon tarixi", "2-17."], ["Ingliz tili", "3-01. 3-02."], ["San'at", "2-18."], ["Science", "1-10."]],
    "payshanba": [["Jismoniy tarbiya", "sport zali"], ["Matematika", "1-05. 3-12."], ["Ona tili", "2-12."], ["Jaxon tarixi", "2-17."], ["Ingliz tili", "3-01. 3-02."], ["Tarbiya", "1-11."]],
    "juma": [["Matematika", "1-05. 3-12."], ["Ingliz tili", "3-01. 3-02."], ["Rus tili", "1-1-02. 1-1-04."], ["Informatika", "2-02. 2-03."], ["Matematika", "1-05. 3-12."]]
  },
  "5-B": {
    "dushanba": [["San'at", "2-18."], ["Tarbiya", "1-11."], ["Ona tili", "2-13."], ["Science", "1-10."], ["Matematika", "1-05. 3 -11."], ["Ingliz tili", "3-02. 3-06"]],
    "seshanba": [["Matematika", "1-05. 3 -11."], ["Jismoniy tarbiya", "sport zali"], ["Ingliz tili", "3-02. 3-06"], ["Ona tili", "2-13."], ["Science", "1-10."], ["Adabiyot", "2-13."]],
    "chorshanba": [["Jaxon tarixi", "2-09."], ["Adabiyot", "2-13."], ["Ingliz tili", "3-02. 3-06"], ["Matematika", "1-05. 3 -11."], ["Matematika", "1-05. 3 -11."], ["Rus tili", "1-1-01. 1-12."]],
    "payshanba": [["Matematika", "1-05. 3 -11."], ["Informatika", "2-02. 2-03."], ["Jaxon tarixi", "2-09."], ["Ingliz tili", "3-02. 3-06"], ["Matematika", "1-05. 3 -11."]],
    "juma": [["San'at", "2-18."], ["Matematika", "1-05. 3 -11."], ["Informatika", "2-02. 2-03."], ["Rus tili", "1-1-01. 1-12."], ["Jismoniy tarbiya", "sport zali"], ["Ingliz tili", "3-02. 3-06"]]
  },
  "6-A": {
    "dushanba": [["Matematika", "3-09. 3-14.."], ["Ona tili", "2-13."], ["Jismoniy tarbiya", "sport zali"], ["Rus tili", "1-1-02. 1-1-04."], ["Ingliz tili", "3-01. 3-02."], ["Science", "1-10."]],
    "seshanba": [["San'at", "2-18."], ["Matematika", "3-09. 3-14.."], ["Matematika", "3-09. 3-14.."], ["Jaxon tarixi", "2-16."], ["Ingliz tili", "3-01. 3-02."], ["Jismoniy tarbiya", "sport zali"]],
    "chorshanba": [["San'at", "2-18."], ["Matematika", "3-09. 3-14.."], ["Rus tili", "1-1-02. 1-1-04."], ["Informatika", "2-01. 2-02."], ["Ingliz tili", "3-01. 3-02."], ["Tarbiya", "1-11."]],
    "payshanba": [["Informatika", "2-01. 2-02."], ["Adabiyot", "2-13."], ["Matematika", "3-09. 3-14.."], ["Matematika", "3-09. 3-14.."], ["Ingliz tili", "3-01. 3-02."], ["Science", "1-10."]],
    "juma": [["Jaxon tarixi", "2-16."], ["Matematika", "3-09. 3-14.."], ["Ona tili", "2-13."], ["Ingliz tili", "3-01. 3-02."], ["Adabiyot", "2-13."], ["Science", "1-10."]]
  },
  "6-B": {
    "dushanba": [["Matematika", "1-04. 1-05."], ["Informatika", "2-01. 2-03."], ["Science", "1-10."], ["Matematika", "1-04. 1-05."], ["Adabiyot", "2-12."], ["Ingliz tili", "3-01. 3-06."]],
    "seshanba": [["Rus tili", "1-1-01. 1-12."], ["Matematika", "1-02. 1 -04."], ["San'at", "2-16."], ["Ingliz tili", "3-01. 3-06."], ["Matematika", "1-04. 1-05."], ["Jaxon tarixi", "2-16."]],
    "chorshanba": [["Science", "1-10."], ["Matematika", "1-04. 1-05."], ["Jaxon tarixi", "2-16."], ["Ingliz tili", "3-01. 3-06."], ["Jismoniy tarbiya", "sport zali"], ["Ona tili", "2-12."]],
    "payshanba": [["Ona tili", "2-12."], ["Ingliz tili", "3-01. 3-06."], ["Matematika", "1-04. 1-05."], ["Adabiyot", "2-12."], ["Jismoniy tarbiya", "sport zali"], ["Informatika", "2-01. 2-03."]],
    "juma": [["Science", "1-10."], ["Ingliz tili", "3-01. 3-06."], ["Matematika", "1-04. 1-05."], ["San'at", "2-18."], ["Tarbiya", "1-11."], ["Rus tili", "1-1-01. 1-12."]]
  },
  "7-A": {
    "dushanba": [["Ingliz tili", "3-04. 3-06."], ["San'at", "2-18."], ["Adabiyot", "2-12."], ["Fizika", "2-04. 2-05."], ["Kimyo", "1-03."], ["Rus tili", "1-1-01. 1-12."], ["Jaxon tarixi", "2-09."]],
    "seshanba": [["O'zbekiston tarixi", "2-09."], ["Biologiya", "1-06."], ["Algebra", "2-14. 3-13."], ["Geometriya", "2-14. 3-13."], ["Ona tili", "2-12."], ["Rus tili", "1-1-01. 1-12."], ["Robototexnika", "1-02."]],
    "chorshanba": [["Ona tili", "2-12."], ["Informatika", "2-01. 2-03."], ["San'at", "2-18."], ["Algebra", "2-14. 3-13."], ["Kimyo", "1-03."], ["Ingliz tili", "3-04. 3-06."], ["Jismoniy tarbiya", "sport zali"]],
    "payshanba": [["Fizika", "2-04. 2-05."], ["Geografiya", "1-1-03."], ["Algebra", "2-14. 3-13."], ["Geometriya", "2-14. 3-13."], ["Ingliz tili", "3-04. 3-06."], ["O'zbekiston tarixi", "2-09."], ["Adabiyot", "2-12."]],
    "juma": [["Fizika", "2-04. 2-05."], ["Algebra", "2-14. 3-13."], ["Ingliz tili", "3-04. 3-06."], ["Biologiya", "1-06."], ["Tarbiya", "1-11."], ["Geometriya", "2-14. 3-13."], ["Informatika", "2-01. 2-03."]]
  },
  "7-B": {
    "dushanba": [["Ingliz tili", "3-01. 3-07."], ["Biologiya", "1-06."], ["Algebra", "1-04. 3-14."], ["Informatika", "2-01. 2-03."], ["Geografiya", "1-1-03."], ["Kimyo", "1-02."], ["Jismoniy tarbiya", "sport zali"]],
    "seshanba": [["Ona tili", "2-12."], ["Ingliz tili", "3-01. 3-07."], ["Robototexnika", "1-02."], ["Fizika", "2-05. 2-06."], ["Geometriya", "2-08. 2-14."], ["Biologiya", "1-06."], ["Adabiyot", "2-12."]],
    "chorshanba": [["Algebra", "1-04. 3-14."], ["Rus tili", "1-1-02. 1-1-04."], ["Ona tili", "2-12."], ["Tarbiya", "1-11."], ["San'at", "2-18."], ["Geometriya", "1-04. 3-14."], ["Fizika", "2-05. 2-06."]],
    "payshanba": [["Algebra", "1-04. 3-14."], ["Kimyo", "1-02."], ["Ingliz tili", "3-01. 3-07."], ["Geometriya", "1-04. 3-14."], ["Informatika", "2-01. 2-03."], ["Jaxon tarixi", "2-17."], ["O'zbekiston tarixi", "2-17."]],
    "juma": [["Adabiyot", "2-12."], ["Ingliz tili", "3-01. 3-07."], ["San'at", "2-18."], ["O'zbekiston tarixi", "2-17."], ["Algebra", "1-04. 3-14."], ["Fizika", "2-05. 2-06."], ["Rus tili", "1-1-02. 1-1-04."]]
  },
  "8-A": {
    "dushanba": [["Geografiya", "1-1-03."], ["Ingliz tili", "3-01.3-07."], ["Informatika", "2-02. 2-03"], ["Rus tili", "1-1-01. 1-12."], ["Algebra", "3-10. 3-13."], ["Kimyo", "1-01."], ["Adabiyot", "2-13 ."]],
    "seshanba": [["Informatika", "2-02. 2-03"], ["O'zbekiston tarixi", "2-17."], ["Geografiya", "1-1-03."], ["Ingliz tili", "3-01.3-07."], ["Fizika", "2-04.2-05."], ["Robototexnika", "1-02."], ["Rus tili", "1-1-01. 1-12."]],
    "chorshanba": [["Ingliz tili", "3-01.3-07."], ["San'at", "2-18."], ["Algebra", "3-10. 3-13."], ["Biologiya", "1-10."], ["Geometriya", "3-10. 3-13."], ["Kimyo", "1-01."], ["Ona tili", "2-13."]],
    "payshanba": [["Algebra", "3-10. 3-13."], ["O'zbekiston tarixi", "2-17."], ["Jaxon tarixi", "2-17."], ["Ingliz tili", "3-01.3-07."], ["Biologiya", "1-10."], ["Geometriya", "3-10. 3-13."], ["Fizika", "2-04.2-05."]],
    "juma": [["Tarbiya", "1-11."], ["Ona tili", "2-13."], ["Algebra", "3-10. 3-13."], ["Jismoniy tarbiya", "sport zali"], ["Geometriya", "3-10. 3-13."], ["Adabiyot", "2-13."], ["Fizika", "2-04.2-05."]]
  },
  "8-B": {
    "dushanba": [["Adabiyot", "2-15."], ["Jaxon tarixi", "2-09."], ["Algebra", "2-08. 2-14."], ["Kimyo", "1-02."], ["Geometriya", "2-08. 2-14."], ["Jismoniy tarbiya", "sport zali"], ["Fizika", "2-06. 2-07."]],
    "seshanba": [["Ingliz tili", "3-03. 3-05."], ["Robototexnika", "1-02."], ["Ona tili", "2-15."], ["San'at", "2-18."], ["Fizika", "2-06. 2-07."], ["Biologiya", "1-10."], ["Rus tili", "1-1-02. 1-1-04."]],
    "chorshanba": [["Ingliz tili", "3-03. 3-05."], ["Tarbiya", "1-11."], ["O'zbekiston tarixi", "2-09."], ["Adabiyot", "2-15."], ["Algebra", "2-08. 2-14."], ["Geometriya", "2-08. 2-14."], ["Informatika", "2-02.2-03."]],
    "payshanba": [["Kimyo", "1-02."], ["Algebra", "2-08. 2-14."], ["Rus tili", "1-1-02. 1-1-04."], ["Geografiya", "1-1-03."], ["Biologiya", "1-10."], ["Ingliz tili", "3-03. 3-05."], ["Ona tili", "2-15."]],
    "juma": [["Algebra", "2-08. 2-14."], ["O'zbekiston tarixi", "2-09."], ["Geometriya", "2-08. 2-14."], ["Ingliz tili", "3-03. 3-05."], ["Geografiya", "1-1-03."], ["Informatika", "2-02.2-03."], ["Fizika", "2-06. 2-07."]]
  },
  "8-D": {
    "dushanba": [["Fizika", "2-04. 2-07."], ["Rus tili", "1-1-02. 1-1-04."], ["Ingliz tili", "3-04. 3-06."], ["Algebra", "2-14. 3-12."], ["Biologiya", "1-06."], ["Geometriya", "2-14. 3-12."], ["O'zbekiston tarixi", "2-16."]],
    "seshanba": [["Jismoniy tarbiya", "sport zali"], ["Tarbiya", "1-11."], ["Ingliz tili", "3-04. 3-06."], ["Fizika", "2-04. 2-07."], ["Robototexnika", "1-02."], ["Geometriya", "2-14. 3-12."], ["San'at", "2-18."]],
    "chorshanba": [["Informatika", "2-01.2-02."], ["Geografiya", "1-1-03."], ["Algebra", "2-14. 3-12."], ["Kimyo", "1-03."], ["Ona tili", "2-13."], ["Rus tili", "1-1-02. 1-1-04."], ["Fizika", "2-04. 2-07."]],
    "payshanba": [["Algebra", "2-14. 3-12."], ["Kimyo", "1-03."], ["Ingliz tili", "3-04. 3-06."], ["Informatika", "2-01.2-02."], ["Ona tili", "2-13."], ["Geometriya", "2-14. 3-12."], ["Adabiyot", "2-13."]],
    "juma": [["Adabiyot", "2-13."], ["O'zbekiston tarixi", "2-16."], ["Biologiya", "1-06."], ["Geografiya", "1-1-03."], ["Algebra", "2-14. 3-12."], ["Ingliz tili", "3-04. 3-06."], ["Jaxon tarixi", "2-16."]]
  },
  "9-A": {
    "dushanba": [["Jismoniy Tarbiya", "sport zali"], ["Fizika", "2-04. 2-05."], ["Kimyo", "1-02."], ["Algebra", "2-08. 3-10."], ["Informatika", "2-02. 2-03."], ["Geometriya", "2-08.  3-10."], ["Ona tili", "2-15."]],
    "seshanba": [["Ingliz tili", "3-01. 3-07."], ["Jaxon tarixi", "2-09."], ["O`zbekiston tarixi", "2-09."], ["Algebra", "2-08. 3-10."], ["Biologiya", "1-06."], ["Geometriya", "2-08. 3-10"], ["Tarbiya", "1-11."]],
    "chorshanba": [["Fizika", "2-04. 2-05."], ["Algebra", "2-08. 3-10."], ["Adabiyot", "2-15."], ["Ingliz tili", "3-01. 3-07."], ["Geografiya", "1-1-03."], ["O`zbekiston tarixi", "2-09."], ["Rus tili", "1-1-02. 1-1-04."]],
    "payshanba": [["Ingliz tili", "3-01. 3-07."], ["Adabiyot", "2-15."], ["Fizika", "2-04. 2-05."], ["Geometriya", "2-08. 3-10"], ["Ona tili", "2-15."], ["Kimyo", "1-02."], ["Rus tili", "1-1-02. 1-1-04."]],
    "juma": [["Ingliz tili", "3-01. 3-07."], ["Algebra", "2-08. 3-10."], ["Geografiya", "1-1-03."], ["Informatika", "2-02. 2-03."], ["Biologiya", "1-06."], ["San'at", "2-18."], ["Sun'iy intellekt", "3-07."]]
  },
  "9-B": {
    "dushanba": [["Tarbiya", "1-11."], ["Ingliz tili", "3-03. 3-06."], ["O'zbekiston tarixi", "2-16."], ["Algebra", "3-09. 3-13"], ["Kimyo", "1-02."], ["Geometriya", "3-09. 3-08"], ["Informatika", "2-02. 2-03."]],
    "seshanba": [["Ona tili", "2-15."], ["Algebra", "3-09. 3-13"], ["Biologiya", "1-06."], ["Geografiya", "1-1-03."], ["Informatika", "2-02. 2-03."], ["Ingliz tili", "3-03. 3-06."], ["Adabiyot", "2-15."]],
    "chorshanba": [["Algebra", "3-09. 3-13"], ["Rus tili", "1-1-01. 1-12."], ["Ingliz tili", "3-03. 3-06."], ["Fizika", "2-06. 2-07."], ["Sun'iy intellekt", "3-07."], ["Geometriya", "3-09. 3-08"], ["San'at", "2-18."]],
    "payshanba": [["Ona tili", "2-15."], ["Fizika", "2-06. 2-07."], ["Jismoniy Tarbiya", "sport zali"], ["Kimyo", "1-02."], ["O'zbekiston tarixi", "2-16."], ["Geometriya", "3-09. 3-08"], ["Rus tili", "1-1-01. 1-12."]],
    "juma": [["Biologiya", "1-06."], ["Geografiya", "1-1-03."], ["Fizika", "2-06. 2-07."], ["Algebra", "3-09. 3-13"], ["Ingliz tili", "3-03. 3-06."], ["Jaxon tarixi", "2-16."], ["Adabiyot", "2-15."]]
  },
  "9-D": {
    "dushanba": [["Geometriya", "3-09. 3-12."], ["Kimyo", "1-02."], ["Ingliz tili", "3-01. 3-07."], ["Fizika", "2-06. 2-07."], ["San'at", "2-18."], ["Biologiya", "1-06."], ["Jaxon tarixi", "2-17."]],
    "seshanba": [["Ona tili", "2-10."], ["Geografiya", "1-1-03."], ["Ingliz tili", "3-01. 3-07."], ["Algebra", "3-09. 3-12."], ["Geometriya", "3-09. 3-12."], ["Rus tili", "1-1-02. 1-1-04."], ["O'zbekiston tarixi", "2-17."]],
    "chorshanba": [["Sun'iy intellekt", "2-01."], ["Algebra", "3-09. 3-12."], ["Ingliz tili", "3-01. 3-07."], ["Geografiya", "1-1-03."], ["Adabiyot", "2-10."], ["Biologiya", "1-06."], ["Informatika", "2-01. 2-20."]],
    "payshanba": [["O'zbekiston tarixi", "2-17."], ["Jismoniy Tarbiya", "sport zali"], ["Kimyo", "1-02."], ["Algebra", "3-09. 3-12."], ["Geometriya", "3-09. 3-12."], ["Rus tili", "1-1-02. 1-1-04."], ["Fizika", "2-06. 2-07."]],
    "juma": [["Fizika", "2-06. 2-07."], ["Algebra", "3-09. 3-12."], ["Ona tili", "2-10."], ["Ingliz tili", "3-01. 3-07."], ["Adabiyot", "2-10."], ["Informatika", "2-01. 2-20."], ["Tarbiya", "1-11."]]
  },
  "9-E": {
    "dushanba": [["Biologiya", "1-06. 1-08."], ["Kimyo", "1-01. 1-03."], ["Fizika", "2-07."], ["Algebra", "1-05."], ["Ingliz tili", "3-02. 3-05."], ["O'zbekiston tarixi", "2-17."], ["San'at", "2-18."]],
    "seshanba": [["Kimyo", "1-01. 1-03."], ["Ona tili", "2-13."], ["Fizika", "2-07."], ["Geometriya", "1-05."], ["Ingliz tili", "3-02. 3-05."], ["O'zbekiston tarixi", "2-17."], ["Sun'iy intellekt", "2-01."]],
    "chorshanba": [["Ona tili", "2-13."], ["Informatika", "2-01. 2-20."], ["Rus tili", "1-1-01. 1-12."], ["Algebra", "1-05."], ["Biologiya", "1-06. 1-08."], ["Adabiyot", "2-13."], ["Jaxon tarixi", "2-17."]],
    "payshanba": [["Tarbiya", "1-11."], ["Biologiya", "1-06. 1-08."], ["Geografiya", "1-1-03."], ["Rus tili", "1-1-01. 1-12."], ["Geometriya", "1-05."], ["Kimyo", "1-01. 1-03."], ["Ingliz tili", "3-02. 3-05."]],
    "juma": [["Geografiya", "1-1-03."], ["Jismoniy Tarbiya", "sport zali"], ["Ingliz tili", "3-02. 3-05."], ["Kimyo", "1-01. 1-03."], ["Adabiyot", "2-13."], ["Biologiya", "1-06. 1-08."], ["Algebra", "1-05."]]
  },
  "10-A": {
    "dushanba": [["Algebra", "2-08. 3-10"], ["Ingliz tili", "3-04. 3-05."], ["Tarbiya", "1-11."], ["Ona tili", "2-15."], ["Jaxon tarixi", "2-16."], ["Informatika", "2-01. 2-03."], ["Fizika", "2-04. 2-05."]],
    "seshanba": [["Geometriya", "2-08. 3-09."], ["Fizika", "2-04. 2-05."], ["Algebra", "2-08. 3-10"], ["O'zbekiston tarixi", "2-09."], ["Adabiyot", "2-15."], ["CHYOT", "2-11."]],
    "chorshanba": [["Jismoniy Tarbiya", "sport zali"], ["Ingliz tili", "3-04. 3-05."], ["Geometriya", "2-08. 3-09."], ["Fizika", "2-04. 2-05."], ["O'zbekiston tarixi", "2-09."], ["Adabiyot", "2-15."]],
    "payshanba": [["Geometriya", "2-08. 3-09."], ["Fizika", "2-04. 2-05."], ["Algebra", "2-08. 3-10"], ["Ingliz tili", "3-04. 3-05."], ["Rus tili", "1-1-01. 1-12."], ["Ona tili", "2-15."], ["CHYOT", "2-11."]],
    "juma": [["Informatika", "2-01. 2-03."], ["Rus tili", "1-1-01. 1-12."], ["Fizika", "2-04. 2-05."], ["Algebra", "2-08. 3-10"], ["Ingliz tili", "3-04. 3-05."]]
  },
  "10-B": {
    "dushanba": [["Informatika", "2-02.2-03."], ["CHYOT", "2-11."], ["Geometriya", "3-09. 3-11."], ["Ona tili", "2-10."], ["Algebra", "3-09. 3-11."], ["Fizika", "2-04. 2-06"], ["Ingliz tili", "3-03. 3-05."]],
    "seshanba": [["Fizika", "2-04. 2-06"], ["Adabiyot", "2-10."], ["Algebra", "3-09. 3-11."], ["Ingliz tili", "3-03. 3-05."], ["Ona tili", "2-10."], ["Geometriya", "3-09. 3-11."]],
    "chorshanba": [["CHYOT", "2-11."], ["O'zbekiston tarixi", "2-09."], ["Adabiyot", "2-10."], ["Informatika", "2-02.2-03."], ["Fizika", "2-04. 2-06"], ["Ingliz tili", "3-03. 3-05."]],
    "payshanba": [["Rus tili", "1-1-01. 1-12."], ["O'zbekiston tarixi", "2-09."], ["Algebra", "3-09. 3-11."], ["Jismoniy Tarbiya", "sport zali"], ["Fizika", "2-04. 2-06"]],
    "juma": [["Geometriya", "3-09. 3-11."], ["Tarbiya", "1-11."], ["Algebra", "3-09. 3-11."], ["Fizika", "2-05."], ["Jaxon tarixi", "2-16."], ["Rus tili", "1-1-01. 1-12."], ["Ingliz tili", "3-03. 3-05."]]
  },
  "10-D": {
    "dushanba": [["Rus tili", "1-12. 1-1-01."], ["Algebra", "1-04. 3-08."], ["Fizika", "2-05. 2-07."], ["Ingliz tili", "3-04. 3-06."], ["Ona tili", "2-15."]],
    "seshanba": [["Geometriya", "1-04. 3-08."], ["Fizika", "2-05. 2-07."], ["Ingliz tili", "3-04. 3-06."], ["Algebra", "1-04. 3-08."], ["CHYOT", "2-11."], ["Adabiyot", "2-15."], ["Informatika", "2-02.2-03."]],
    "chorshanba": [["Ingliz tili", "3-04. 3-06."], ["Ona tili", "2-15."], ["Algebra", "1-04. 3-08."], ["Jismoniy Tarbiya", "sport zali"], ["Geometriya", "1-04. 3-08."], ["Fizika", "2-05. 2-07."], ["Jaxon tarixi", "2-16."]],
    "payshanba": [["Ingliz tili", "3-04. 3-06."], ["Algebra", "1-04. 3-08."], ["Informatika", "2-02.2-03."], ["Fizika", "2-05. 2-07."], ["CHYOT", "2-11."], ["Tarbiya", "1-11."], ["O'zbekiston tarixi", "2-09."]],
    "juma": [["Geometriya", "1-04. 3-08."], ["Fizika", "2-05. 2-07."], ["O'zbekiston tarixi", "2-09."], ["Rus tili", "1-12. 1-1-01."], ["Adabiyot", "2-15."]]
  },
  "10-E": {
    "dushanba": [["Kimyo", "1-01. 1-03."], ["Algebra", "3-14."], ["Ona tili", "2-10."], ["Ingliz tili", "3-03. 3-07."], ["Tarbiya", "1-11."], ["Biologiya", "1-06. 1-08."], ["CHYOT", "2-11."]],
    "seshanba": [["Algebra", "3-14."], ["Kimyo", "1-01. 1-03."], ["Jismoniy Tarbiya", "sport zali"], ["Geometriya", "3-14."], ["Biologiya", "1-06. 1-08."], ["Informatika", "2-01. 2-03."], ["CHYOT", "2-11."]],
    "chorshanba": [["Kimyo", "1-01. 1-03."], ["Ingliz tili", "3-03. 3-07."], ["Biologiya", "1-06. 1-08."], ["Algebra", "3-14."], ["O'zbekiston tarixi", "2-16."], ["Jaxon tarixi", "2-16."], ["Adabiyot", "2-10."]],
    "payshanba": [["Rus tili", "1-1-02. 1-1-04."], ["Ingliz tili", "3-03. 3-07."], ["Kimyo", "1-01. 1-03."], ["Biologiya", "1-06. 1-08."], ["Kimyo", "1-01. 1-03."], ["Informatika", "2-01. 2-03."], ["O'zbekiston tarixi", "2-16."]],
    "juma": [["Geometriya", "3-14."], ["Adabiyot", "2-10."], ["Ingliz tili", "3-03. 3-07."], ["Biologiya", "1-06. 1-08."], ["Rus tili", "1-1-02. 1-1-04."], ["Kimyo", "1-01. 1-03."], ["Ona tili", "2-10."]]
  },
  "10-F": {
    "dushanba": [["Ingliz tili", "3-05."], ["Adabiyot", "2-13."], ["Kimyo", "1-01."], ["Biologiya", "1-10."], ["Ona tili", "2-13."], ["Rus tili", "1-1-04."], ["Informatika", "2-01."]],
    "seshanba": [["Informatika", "2-01."], ["O'zbekiston tarixi", "2-16."], ["Biologiya", "1-10."], ["Kimyo", "1-01."], ["Jismoniy Tarbiya", "sport zali"], ["Adabiyot", "2-13."], ["Ingliz tili", "3-05."]],
    "chorshanba": [["Jaxon tarixi", "2-16."], ["O'zbekiston tarixi", "2-16."], ["Ingliz tili", "3-05."], ["CHYOT", "2-11."], ["Kimyo", "1-01."], ["Biologiya", "1-10."], ["Algebra", "1-04."]],
    "payshanba": [["Kimyo", "1-01."], ["Ona tili", "2-13."], ["Biologiya", "1-10."], ["Tarbiya", "1-11."], ["Algebra", "1-04."], ["CHYOT", "2-11."], ["Geometriya", "1-04."]],
    "juma": [["Ingliz tili", "3-05."], ["Biologiya", "1-10."], ["Kimyo", "1-01."], ["Rus tili", "1-1-04."], ["Kimyo", "1-01."], ["Algebra", "1-04."], ["Geometriya", "1-04."]]
  },
  "11-A": {
    "dushanba": [["O'zbekiston tarixi", "2-16."], ["Algebra", "3-10. 3-13."], ["Geometriya", "3-10. 3-13."], ["CHYOT", "2-11."], ["Fizika", "2-05. 2-06"], ["Ingliz tili", "3-04. 3-06."], ["Rus tili", "1-1-02. 1-1-04."]],
    "seshanba": [["Algebra", "3-10. 3-13."], ["Adabiyot", "2-15."], ["O'zbekiston tarixi", "2-16."], ["Ingliz tili", "3-04. 3-06."], ["Geometriya", "3-10. 3-13."], ["Tarbiya", "1-11."], ["Fizika", "2-05. 2-06"]],
    "chorshanba": [["Rus tili", "1-1-02. 1-1-04."], ["Fizika", "2-05. 2-06"], ["Informatika", "2-01 2-20."], ["Ingliz tili", "3-04. 3-06."], ["Ona tili", "2-15."], ["Geometriya", "3-10. 3-13."]],
    "payshanba": [["CHYOT", "2-11."], ["Algebra", "3-10. 3-13."], ["Jaxon tarixi", "2-16."], ["Ona tili", "2-15."], ["Jismoniy Tarbiya", "sport zali"], ["Fizika", "2-05. 2-06"]],
    "juma": [["Algebra", "3-10. 3-13."], ["Informatika", "2-01 2-20."], ["Adabiyot", "2-15."], ["Ingliz tili", "3-04. 3-06."], ["Fizika", "2-05. 2-06"]]
  },
  "11-B": {
    "dushanba": [["O'zbekiston tarixi", "2-17."], ["Ingliz tili", "3-01."], ["Algebra", "3-08."], ["Geometriya", "3-08."], ["Fizika", "2-07."], ["Adabiyot", "2-15."], ["Rus tili", "1-12."]],
    "seshanba": [["Fizika", "2-07."], ["Ingliz tili", "3-01."], ["CHYOT", "2-11."], ["Informatika", "2-03."], ["Jaxon tarixi", "2-17."], ["Geometriya", "3-08."]],
    "chorshanba": [["Ona tili", "2-15."], ["CHYOT", "2-11."], ["Informatika", "2-03."], ["Algebra", "3-08."], ["Jismoniy Tarbiya", "sport zali"], ["Fizika", "2-07."]],
    "payshanba": [["Fizika", "2-07."], ["Tarbiya", "1-11."], ["Rus tili", "1-12."], ["Algebra", "3-08."], ["Ingliz tili", "3-01."]],
    "juma": [["Ona tili", "2-15."], ["Adabiyot", "2-15."], ["Algebra", "3-08."], ["Geometriya", "3-08."], ["Fizika", "2-07."], ["O'zbekiston tarixi", "2-17."], ["Ingliz tili", "3-01."]]
  },
  "11-D": {
    "dushanba": [["Adabiyot", "2-13."], ["Algebra", "2-08. 3-11."], ["Ingliz tili", "3-02. 3-03."], ["Jismoniy Tarbiya", "sport zali"], ["CHYOT", "2-11."], ["Fizika", "2-05. 2-07."]],
    "seshanba": [["CHYOT", "2-11."], ["Rus tili", "1-12. 1-1-01."], ["Jaxon tarixi", "2-17."], ["O'zbekiston tarixi", "2-17."], ["Algebra", "2-08. 3-11."], ["Fizika", "2-05. 2-07."]],
    "chorshanba": [["Algebra", "2-08. 3-11."], ["O'zbekiston tarixi", "2-17."], ["Geometriya", "3-11. 3-14."], ["Ingliz tili", "3-02. 3-03."], ["Fizika", "2-05. 2-07."], ["Informatika", "2-01 2-20."]],
    "payshanba": [["Ingliz tili", "3-02. 3-03."], ["Geometriya", "3-11. 3-14."], ["Adabiyot", "2-13."], ["Fizika", "2-05. 2-07."], ["Algebra", "2-08. 3-11."], ["Ona tili", "2-13."]],
    "juma": [["Ingliz tili", "3-02. 3-03."], ["Fizika", "2-05. 2-07."], ["Rus tili", "1-12. 1-1-01."], ["Tarbiya", "1-11."], ["Informatika", "2-01 2-20."], ["Geometriya", "3-11. 3-14."], ["Ona tili", "2-13."]]
  },
  "11-E": {
    "dushanba": [["Algebra", "3-11."], ["Jismoniy Tarbiya", "sport zali"], ["Biologiya", "1-06. 1-08."], ["Kimyo", "1-01. 1-03."], ["Ingliz tili", "3-01. 3-03."], ["O'zbekiston tarixi", "2-09."], ["Tarbiya", "1-11."]],
    "seshanba": [["Biologiya", "1-06. 1-08."], ["Algebra", "3-11."], ["Kimyo", "1-01. 1-03."], ["CHYOT", "2-11."], ["Kimyo", "1-01. 1-03."], ["Ona tili", "2-12."], ["Geometriya", "3-11."]],
    "chorshanba": [["Biologiya", "1-06. 1-08."], ["Geometriya", "3-11."], ["Kimyo", "1-01. 1-03."], ["Informatika", "2-01 2-20."], ["Rus tili", "1-1-02. 1-1-03."], ["Adabiyot", "2-12."], ["Ingliz tili", "3-01. 3-03."]],
    "payshanba": [["Biologiya", "1-06. 1-08."], ["Rus tili", "1-1-02. 1-1-03."], ["CHYOT", "2-11."], ["Kimyo", "1-01. 1-03."], ["O'zbekiston tarixi", "2-09."], ["Ona tili", "2-12."], ["Ingliz tili", "3-01. 3-03."]],
    "juma": [["Kimyo", "1-01. 1-03."], ["Biologiya", "1-06. 1-08."], ["Informatika", "2-01 2-20."], ["Jaxon tarixi", "2-16."], ["Algebra", "3-11."], ["Ingliz tili", "3-01. 3-03."], ["Adabiyot", "2-12."]]
  },
  "11-F": {
    "dushanba": [["CHYOT", "2-11."], ["Biologiya", "1-08."], ["Kimyo", "1-03."], ["Ingliz tili", "3-05."], ["O'zbekiston tarixi", "2-17."], ["Kimyo", "1-03."], ["Adabiyot", "2-10."]],
    "seshanba": [["Algebra", "3-12."], ["Geometriya", "3-12."], ["Biologiya", "1-08."], ["Kimyo", "1-03."], ["Rus tili", "1-1-01."], ["Ona tili", "2-10."], ["Adabiyot", "2-10."]],
    "chorshanba": [["Jaxon tarixi", "2-17."], ["Kimyo", "1-03."], ["Informatika", "2-01."], ["Algebra", "3-12."], ["Geometriya", "3-12."], ["Biologiya", "1-08."], ["Ingliz tili", "3-05."]],
    "payshanba": [["Kimyo", "1-03."], ["CHYOT", "2-11."], ["Tarbiya", "1-11."], ["O'zbekiston tarixi", "2-17."], ["Ingliz tili", "3-05."], ["Biologiya", "1-08."], ["Jismoniy Tarbiya", "sport zali"]],
    "juma": [["Rus tili", "1-1-01."], ["Ingliz tili", "3-05."], ["Kimyo", "1-03."], ["Algebra", "3-12."], ["Biologiya", "1-08."], ["Ona tili", "2-10."], ["Informatika", "2-01."]]
  }
};

// Dars vaqtlari
// 5-6 sinflar: 3-darsdan keyin 45 daqiqalik tushlik
const TIMES_PRIMARY = [
  '8:30 – 9:15',
  '9:20 – 10:05',
  '10:10 – 10:55',
  '10:55 – 11:40',   // Tushlik (45 daqiqa)
  '11:40 – 12:25',
  '12:30 – 13:15',
  '13:20 – 14:05'
];

// 7-11 sinflar: 3-darsdan keyin 20 daqiqa, 4-darsdan keyin 25 daqiqa tanaffus
const TIMES_SENIOR = [
  '8:30 – 9:15',
  '9:20 – 10:05',
  '10:10 – 10:55',
  '11:15 – 12:00',
  '12:25 – 13:10',
  '13:15 – 14:00',
  '14:05 – 14:50'
];

function getTimes(className) {
  const grade = parseInt(String(className || '').split('-')[0], 10);
  return grade >= 5 && grade <= 6 ? TIMES_PRIMARY : TIMES_SENIOR;
}

// Sinflarni guruhlash
let CLASS_GROUPS = {};

const DAYS = ['dushanba', 'seshanba', 'chorshanba', 'payshanba', 'juma'];
const DAY_LABELS = { dushanba: 'Dushanba', seshanba: 'Seshanba', chorshanba: 'Chorshanba', payshanba: 'Payshanba', juma: 'Juma' };

let activeGrade = '5';
let activeClass = '5-A';
let activeDay = 'dushanba';

function buildScheduleUI() {
  const section = document.getElementById('schedule');
  if (!section) return;

  const container = section.querySelector('.container');
  if (!container) return;

  const existing = container.querySelector('.schedule-ui');
  if (existing) existing.remove();

  const ui = document.createElement('div');
  ui.className = 'schedule-ui';

  const gradeRow = document.createElement('div');
  gradeRow.className = 'schedule-tabs schedule-tabs-class';
  Object.keys(CLASS_GROUPS).forEach(grade => {
    const btn = document.createElement('button');
    btn.className = 'schedule-tab' + (grade === activeGrade ? ' active' : '');
    btn.dataset.grade = grade;
    btn.textContent = grade + '-sinf';
    btn.addEventListener('click', () => {
      activeGrade = grade;
      activeClass = CLASS_GROUPS[grade][0];
      gradeRow.querySelectorAll('.schedule-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderClassTabs();
      renderTable();
    });
    gradeRow.appendChild(btn);
  });
  ui.appendChild(gradeRow);

  const classRow = document.createElement('div');
  classRow.className = 'schedule-tabs schedule-tabs-letter';
  ui.appendChild(classRow);

  const dayRow = document.createElement('div');
  dayRow.className = 'schedule-tabs schedule-tabs-day';
  DAYS.forEach(day => {
    const btn = document.createElement('button');
    btn.className = 'schedule-day-tab' + (day === activeDay ? ' active' : '');
    btn.dataset.day = day;
    btn.textContent = DAY_LABELS[day];
    btn.addEventListener('click', () => {
      activeDay = day;
      dayRow.querySelectorAll('.schedule-day-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderTable();
    });
    dayRow.appendChild(btn);
  });
  ui.appendChild(dayRow);

  const tableWrap = document.createElement('div');
  tableWrap.className = 'schedule-content';
  tableWrap.id = 'schedule-content';
  ui.appendChild(tableWrap);

  container.appendChild(ui);

  function renderClassTabs() {
    classRow.innerHTML = '';
    const classes = CLASS_GROUPS[activeGrade];
    if (classes.length <= 1) {
      classRow.style.display = 'none';
      return;
    }
    classRow.style.display = '';
    classes.forEach(cls => {
      const btn = document.createElement('button');
      btn.className = 'schedule-tab' + (cls === activeClass ? ' active' : '');
      btn.textContent = cls;
      btn.addEventListener('click', () => {
        activeClass = cls;
        classRow.querySelectorAll('.schedule-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderTable();
      });
      classRow.appendChild(btn);
    });
  }

  function renderTable() {
    const lessons = SCHEDULE[activeClass]?.[activeDay] || [];
    const times = getTimes(activeClass);
    let rows = '';
    let lessonCount = 0;
    lessons.forEach((lesson, i) => {
      const fan = lesson[0] || '—';
      const xona = lesson[1] || '—';
      if (String(fan).toUpperCase() === 'TUSHLIK') {
        rows += `<tr class="schedule-lunch-row">
          <td class="td-num">${i + 1}</td>
          <td class="td-time">${times[i] || '—'}</td>
          <td class="td-subject" colspan="2">Tushlik (45 daqiqa)</td>
        </tr>`;
        return;
      }
      lessonCount += 1;
      rows += `<tr>
        <td class="td-num">${i + 1}</td>
        <td class="td-time">${times[i] || '—'}</td>
        <td class="td-subject">${fan}</td>
        <td class="td-room"><span class="room-badge">${xona}</span></td>
      </tr>`;
    });
    if (!rows) rows = `<tr><td colspan="4" style="text-align:center;padding:20px;color:#999;">Ma'lumot yo'q</td></tr>`;
    tableWrap.innerHTML = `
      <div class="schedule-header-info">
        <span class="sched-class-label">${activeClass} sinf</span>
        <span class="sched-day-label">${DAY_LABELS[activeDay]}</span>
        <span class="sched-count">${lessonCount} dars</span>
      </div>
      <table class="schedule-table-main">
        <thead><tr><th>#</th><th>Vaqt</th><th>Fan</th><th>Xona</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
  }

  renderClassTabs();
  renderTable();
}

// Jadval CMS ma'lumotlari kelganda buildScheduleUI() orqali chiziladi


// ===== CMS DAN JADVAL MA'LUMOTINI QABUL QILISH =====
window.setScheduleData = function (schedule) {
  if (!schedule || !Array.isArray(schedule.sections)) return;

  const map = {};
  const groups = {};

  schedule.sections.forEach(section => {
    (section.classes || []).forEach((name, classIndex) => {
      const days = {};

      (section.days || []).forEach(day => {
        const key = String(day.name || '').toLowerCase();
        const list = (day.lessons || [])
          .slice()
          .sort((a, b) => Number(a.no) - Number(b.no))
          .map(lesson => {
            const cell = lesson.cells && lesson.cells[classIndex] ? lesson.cells[classIndex] : {};
            return [String(cell.subject || '').trim(), String(cell.room || '').trim()];
          })
          .filter(pair => pair[0]);

        days[key] = list;
      });

      map[name] = days;
      const grade = name.split('-')[0];
      if (!groups[grade]) groups[grade] = [];
      if (groups[grade].indexOf(name) === -1) groups[grade].push(name);
    });
  });

  SCHEDULE = map;
  CLASS_GROUPS = groups;

  const grades = Object.keys(groups).sort((a, b) => Number(a) - Number(b));
  if (!grades.length) return;

  activeGrade = grades[0];
  activeClass = groups[activeGrade][0];
  activeDay = 'dushanba';

  buildScheduleUI();
};

// ===== YANGILIKLAR FILTRLASH =====
document.addEventListener('DOMContentLoaded', function () {
  const filterBtns = document.querySelectorAll('.news-filter-btn');
  const featuredCard = document.querySelector('.news-featured-card');
  const sideCards = document.querySelectorAll('.news-side-card');
  const bottomCards = document.querySelectorAll('.news-card-new');
  const allCards = [...(featuredCard ? [featuredCard] : []), ...sideCards, ...bottomCards];

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      allCards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.classList.remove('news-hidden');
        } else {
          card.classList.add('news-hidden');
        }
      });
    });
  });
});

function openVideoModal(type, src, title) {
    const modal   = document.getElementById('videoModal');
    const video   = document.getElementById('modalVideo');
    const youtube = document.getElementById('modalYoutube');
    const titleEl = document.getElementById('videoModalTitle');

    titleEl.textContent = title;

    if (type === 'youtube') {
        youtube.src          = src + '?autoplay=1';
        youtube.style.display = 'block';
        // Shorts uchun balandroq, oddiy video uchun 400px
        youtube.style.height  = src.includes('shorts') ? '560px' : '400px';
        video.style.display   = 'none';
    } else {
        video.src             = src;
        video.style.display   = 'block';
        youtube.style.display = 'none';
        video.play();
    }

    modal.style.display        = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeVideoModal(event) {
    if (event) {
        const modal = document.getElementById('videoModal');
        const clickedClose = event.target.closest('.video-modal-close');
        const clickedBackdrop = event.target === modal;
        if (!clickedClose && !clickedBackdrop) return;
    }

    const modal   = document.getElementById('videoModal');
    const video   = document.getElementById('modalVideo');
    const youtube = document.getElementById('modalYoutube');

    video.pause();
    video.src             = '';
    youtube.src           = '';
    youtube.style.display = 'none';
    video.style.display   = 'none';
    modal.style.display   = 'none';
    document.body.style.overflow = '';
}

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closeVideoModal({ target: document.getElementById('videoModal') });
});

document.querySelectorAll('.vid-thumb-preview').forEach(function (vid) {
  vid.addEventListener('loadedmetadata', function () {
    vid.currentTime = 0.5;
  });
});

// ===== BOG'LANISH FORMASI =====
document.addEventListener('DOMContentLoaded', function () {

  // Backend server manzili - ishlab chiqarishga qo'yganda haqiqiy domenga o'zgartiring
  const BACKEND_API_URL = 'https://parkent-maktab-sayti.onrender.com';

  async function sendToTelegram(name, phone, email, message) {
    const res = await fetch(`${BACKEND_API_URL}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, email, message })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Yuborishda xatolik');
    }
  }

  const contactFormEl = document.getElementById('contact-form');
  if (!contactFormEl) return;
  contactFormEl.addEventListener('submit', async function (e) {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    const btn = document.getElementById('submit-btn');
    btn.textContent = 'Yuborilmoqda...';
    btn.disabled = true;

    try {
      await sendToTelegram(name, phone, email, message);
      btn.textContent = '✅ Yuborildi!';
      btn.style.background = '#28a745';
      this.reset();
    } catch (err) {
      btn.textContent = '❌ Xatolik! Qayta urining';
      btn.style.background = '#dc3545';
    }

    setTimeout(() => {
      btn.textContent = 'Yuborish';
      btn.style.background = '';
      btn.disabled = false;
    }, 3000);
  });

});
