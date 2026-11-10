/* =========================================================
   CMS — admin paneldan boshqariladigan kontentni saytga chiqaradi
   (o'qituvchilar, rahbariyat)
   ========================================================= */
(function () {
  'use strict';

  var LOCAL_HOSTS = ['localhost', '127.0.0.1', ''];
  var API_URL = (LOCAL_HOSTS.indexOf(location.hostname) !== -1 || location.protocol === 'file:')
    ? 'http://localhost:3000'
    : 'https://parkent-maktab-sayti.onrender.com';

  var PLACEHOLDER = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="#0b2545"/><text x="200" y="215" font-family="Arial" font-size="120" fill="#ffb703" text-anchor="middle">?</text></svg>'
  );

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function imageSrc(src) {
    if (!src) return PLACEHOLDER;
    if (/^https?:\/\//i.test(src) || src.indexOf('data:') === 0) return src;
    if (src.charAt(0) === '/') return API_URL + src;
    return src; // sayt ichidagi statik rasm (masalan teachers/17.jpg)
  }

  function byOrder(a, b) {
    var oa = Number(a.order);
    var ob = Number(b.order);
    if (isNaN(oa)) oa = 9999;
    if (isNaN(ob)) ob = 9999;
    if (oa !== ob) return oa - ob;
    return String(a.name || '').localeCompare(String(b.name || ''), 'uz');
  }

  /* ---------------- O'qituvchilar ---------------- */

  function teacherCard(t) {
    var photo = imageSrc(t.photo);
    var details = '';

    if (t.category) {
      details += '<p><i class="fa-solid fa-award"></i> Toifasi: ' + esc(t.category) + '</p>';
    }
    if (t.specialty) {
      details += '<p><i class="fa-solid fa-book-open"></i> ' + esc(t.specialty) + '</p>';
    }
    if (t.education) {
      details += '<p><i class="fa-solid fa-graduation-cap"></i> ' + esc(t.education) + '</p>';
    }

    return '<div class="teacher-card-h">' +
      '<div class="teacher-card-h-img"><img src="' + esc(photo) + '" alt="' + esc(t.name) + '" loading="lazy"></div>' +
      '<div class="teacher-card-h-info">' +
      '<h4>' + esc(t.name) + '</h4>' +
      '<p class="teacher-card-h-subject">' + esc(t.subject || '') + '</p>' +
      (details ? '<div class="teacher-card-h-details">' + details + '</div>' : '') +
      '</div>' +
      '</div>';
  }

  function renderTeachersPage(teachers) {
    var groups = document.querySelectorAll('.subject-group[data-subject]');
    if (!groups.length) return;

    var grouped = {};
    teachers.forEach(function (t) {
      var key = t.group || 'boshqa';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(t);
    });

    groups.forEach(function (group) {
      var key = group.getAttribute('data-subject');
      var list = (grouped[key] || []).sort(byOrder);
      var grid = group.querySelector('.teachers-horizontal-grid');
      var counter = group.querySelector('.subject-group-count');
      var filterBtn = document.querySelector('.filter-btn[data-filter="' + key + '"]');

      if (!grid) return;

      if (!list.length) {
        group.style.display = 'none';
        if (filterBtn) filterBtn.style.display = 'none';
        return;
      }

      group.style.display = '';
      if (filterBtn) filterBtn.style.display = '';
      grid.innerHTML = list.map(teacherCard).join('');
      if (counter) counter.textContent = list.length + ' nafar';
    });
  }

  function renderHomeTeachers(teachers) {
    var grid = document.querySelector('#teachers .teachers-grid');
    if (!grid) return;

    var list = teachers.slice().sort(byOrder).slice(0, 3);
    if (!list.length) return;

    grid.innerHTML = list.map(function (t) {
      return '<div class="teacher-card">' +
        '<div class="teacher-image"><img src="' + esc(imageSrc(t.photo)) + '" alt="' + esc(t.name) + '" loading="lazy"></div>' +
        '<div class="teacher-info">' +
        '<h3>' + esc(t.name) + '</h3>' +
        '<p class="teacher-subject">' + esc(t.subject || '') + '</p>' +
        '</div>' +
        '</div>';
    }).join('');
  }

  /* ---------------- Rahbariyat ---------------- */

  function leadershipCard(person) {
    return '<div class="basic-card leader-card">' +
      '<div class="leader-avatar"><img src="' + esc(imageSrc(person.photo)) + '" alt="' + esc(person.name) + '" loading="lazy"></div>' +
      '<h4>' + esc(person.name) + '</h4>' +
      '<span class="leader-role">' + esc(person.role || '') + '</span>' +
      (person.bio ? '<p>' + esc(person.bio) + '</p>' : '') +
      '</div>';
  }

  function renderLeadership(items) {
    var grid = document.querySelector('.leadership-grid');
    if (!grid) return;

    var list = items.slice().sort(byOrder);
    if (!list.length) return;

    grid.innerHTML = list.map(leadershipCard).join('');
  }

  /* ---------------- Maktab haqida ---------------- */

  var STAT_ICONS = ['fa-graduation-cap', 'fa-person-chalkboard', 'fa-book', 'fa-building-columns'];

  function aboutParagraphs(text) {
    return String(text || '')
      .split(/\n{2,}/)
      .map(function (part) { return part.trim(); })
      .filter(Boolean);
  }

  function renderAbout(about) {
    if (!about) return;

    var section = document.getElementById('about');
    var isHomeAbout = section && section.classList.contains('about-section') && section.querySelector('.about-content');

    if (isHomeAbout) {
      var badge = section.querySelector('.section-badge');
      if (badge && about.badge) badge.textContent = about.badge;

      var title = section.querySelector('h2');
      if (title && about.title) title.textContent = about.title;

      var content = section.querySelector('.about-content');
      var underline = section.querySelector('.underline');

      if (content && underline) {
        Array.prototype.slice.call(content.children).forEach(function (el) {
          if (el.tagName === 'P') el.parentNode.removeChild(el);
        });

        var anchor = underline;
        aboutParagraphs(about.text).forEach(function (text) {
          var p = document.createElement('p');
          p.textContent = text;
          anchor.parentNode.insertBefore(p, anchor.nextSibling);
          anchor = p;
        });
      }

      var list = section.querySelector('.about-list');
      if (list && Array.isArray(about.list) && about.list.length) {
        list.innerHTML = about.list.map(function (item) {
          return '<li><i class="fa-solid fa-check"></i> ' + esc(item) + '</li>';
        }).join('');
      }

      var image = section.querySelector('.about-image img');
      if (image && about.image) image.src = imageSrc(about.image);
    }

    // Bosh sahifadagi statistika bloki
    var statsGrid = document.querySelector('.stats-section .stats-grid');
    if (statsGrid && Array.isArray(about.stats) && about.stats.length) {
      var statsTitle = document.querySelector('.stats-section .stats-title');
      if (statsTitle && about.statsTitle) statsTitle.textContent = about.statsTitle;

      statsGrid.innerHTML = about.stats.map(function (stat, index) {
        return '<div class="stat-card">' +
          '<div class="stat-icon"><i class="fa-solid ' + (STAT_ICONS[index] || 'fa-chart-simple') + '"></i></div>' +
          '<h3>' + esc(stat.value) + '</h3>' +
          '<p>' + esc(stat.label) + '</p>' +
          '</div>';
      }).join('');
    }

    // "Biz haqimizda" sahifasidagi matn va rasm
    var pageLeft = document.querySelector('.about-section#about .about-left');
    if (pageLeft) {
      var firstParagraph = pageLeft.querySelector('p');
      if (firstParagraph && about.text) {
        var fragment = document.createDocumentFragment();
        aboutParagraphs(about.text).forEach(function (text) {
          var p = document.createElement('p');
          p.textContent = text;
          fragment.appendChild(p);
        });
        firstParagraph.parentNode.replaceChild(fragment, firstParagraph);
      }

      var pageImage = document.querySelector('.about-section#about .about-right img');
      if (pageImage && typeof about.image === 'string' && about.image.charAt(0) === '/') {
        pageImage.src = imageSrc(about.image);
      }
    }
  }

  /* ---------------- Dars jadvali ---------------- */

  function renderSchedule(schedule) {
    if (!schedule || !Array.isArray(schedule.sections) || !schedule.sections.length) return;
    if (typeof window.setScheduleData === "function") {
      window.setScheduleData(schedule);
    }
  }

  /* ---------------- Yuklash ---------------- */

  function loadStaticSchedule() {
    if (!document.getElementById('schedule')) return;

    fetch('schedule.json', { cache: 'no-store' })
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (data) { if (data) renderSchedule(data); })
      .catch(function () { /* jadval bo'lmasa hech narsa qilmaymiz */ });
  }

  function load() {
    if (!window.fetch) return;

    fetch(API_URL + '/api/content')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        var teachers = Array.isArray(data.teachers) ? data.teachers : [];
        var leadership = Array.isArray(data.leadership) ? data.leadership : [];

        // Ma'lumot bo'lmasa statik (qo'lda yozilgan) kontent qoladi
        if (teachers.length) {
          renderTeachersPage(teachers);
          renderHomeTeachers(teachers);
        }
        if (leadership.length) {
          renderLeadership(leadership);
        }
        if (data.about) {
          renderAbout(data.about);
        }
        if (data.settings) {
          renderSettings(data.settings);
        }
        if (Array.isArray(data.staff) && data.staff.length) {
          renderStaff(data.staff);
        }
        if (Array.isArray(data.faq) && data.faq.length) {
          renderFaq(data.faq);
        }
        if (Array.isArray(data.features) && data.features.length) {
          renderFeatures(data.features);
        }
        if (data.admission) {
          renderAdmission(data.admission);
        }
        if (data.schedule) {
          renderSchedule(data.schedule);
        } else {
          loadStaticSchedule();
        }
      })
      .catch(function (err) {
        console.log('CMS: kontentni yuklab bo\'lmadi —', err.message);
        loadStaticSchedule();
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load);
  } else {
    load();
  }
})();
