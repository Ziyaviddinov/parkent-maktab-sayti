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

  /* ---------------- Yuklash ---------------- */

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
      })
      .catch(function (err) {
        console.log('CMS: kontentni yuklab bo\'lmadi —', err.message);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load);
  } else {
    load();
  }
})();
