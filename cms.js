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

  var TIME_SLOTS = [
    '8:00 – 8:45',
    '8:55 – 9:40',
    '9:50 – 10:35',
    '10:45 – 11:30',
    '11:40 – 12:25',
    '13:10 – 13:55',
    '14:05 – 14:50'
  ];

  function buildClassIndex(schedule) {
    var index = {};

    schedule.sections.forEach(function (section) {
      (section.classes || []).forEach(function (name, classIndex) {
        var days = (section.days || []).map(function (day) {
          var lessons = (day.lessons || []).map(function (lesson) {
            var cell = lesson.cells && lesson.cells[classIndex] ? lesson.cells[classIndex] : {};
            return {
              no: Number(lesson.no),
              subject: String(cell.subject || '').trim(),
              room: String(cell.room || '').trim()
            };
          }).filter(function (lesson) {
            return lesson.subject;
          });

          lessons.sort(function (a, b) { return a.no - b.no; });
          return { name: day.name, lessons: lessons };
        });

        index[name] = days;
      });
    });

    return index;
  }

  function gradeOf(className) {
    var match = /^(\d{1,2})/.exec(className);
    return match ? match[1] : '';
  }

  function renderSchedule(schedule) {
    var host = document.getElementById('schedule');
    if (!host) return;
    if (!schedule || !Array.isArray(schedule.sections) || !schedule.sections.length) return;

    var container = host.querySelector('.container');
    if (!container) return;

    var subtitle = host.querySelector('.section-title p');
    if (subtitle && schedule.title) subtitle.textContent = schedule.title;

    var old = container.querySelector('.sch2');
    if (old) old.parentNode.removeChild(old);

    var classIndex = buildClassIndex(schedule);
    var classNames = Object.keys(classIndex);
    if (!classNames.length) return;

    var grades = [];
    classNames.forEach(function (name) {
      var grade = gradeOf(name);
      if (grade && grades.indexOf(grade) === -1) grades.push(grade);
    });
    grades.sort(function (a, b) { return Number(a) - Number(b); });

    var state = {
      grade: grades[0],
      className: classNames.filter(function (n) { return gradeOf(n) === grades[0]; })[0],
      day: null
    };

    function classesOfGrade(grade) {
      return classNames.filter(function (name) { return gradeOf(name) === grade; });
    }

    function daysOfClass(name) {
      return classIndex[name] || [];
    }

    function pickDay(name) {
      var days = daysOfClass(name);
      if (!days.length) return null;
      var exists = days.filter(function (day) { return day.name === state.day; })[0];
      return exists ? exists.name : days[0].name;
    }

    function draw() {
      var box = container.querySelector('.sch2');
      if (!box) {
        box = document.createElement('div');
        box.className = 'sch2';
        container.appendChild(box);
      }

      var days = daysOfClass(state.className);
      state.day = pickDay(state.className);

      var dayData = days.filter(function (day) { return day.name === state.day; })[0];
      var lessons = dayData ? dayData.lessons : [];

      var gradesHtml = grades.map(function (grade) {
        return '<button class="sch2-btn' + (grade === state.grade ? ' active' : '') + '" data-grade="' + grade + '">' +
          esc(grade) + '-sinf</button>';
      }).join('');

      var classesHtml = classesOfGrade(state.grade).map(function (name) {
        return '<button class="sch2-btn' + (name === state.className ? ' active' : '') + '" data-class="' + esc(name) + '">' +
          esc(name) + '</button>';
      }).join('');

      var daysHtml = days.map(function (day) {
        return '<button class="sch2-btn' + (day.name === state.day ? ' active' : '') + '" data-day="' + esc(day.name) + '">' +
          esc(day.name) + '</button>';
      }).join('');

      var realLessons = lessons.filter(function (lesson) {
        return lesson.subject.toUpperCase() !== 'TUSHLIK';
      });

      var rowsHtml = lessons.map(function (lesson) {
        var time = TIME_SLOTS[lesson.no - 1] || '';

        if (lesson.subject.toUpperCase() === 'TUSHLIK') {
          return '<tr class="sch2-lunch"><td class="num">' + lesson.no + '</td>' +
            '<td class="time">' + time + '</td>' +
            '<td colspan="2">Tushlik</td></tr>';
        }

        return '<tr><td class="num">' + lesson.no + '</td>' +
          '<td class="time">' + time + '</td>' +
          '<td class="subj">' + esc(lesson.subject) + '</td>' +
          '<td class="room">' + (lesson.room ? '<span>' + esc(lesson.room) + '</span>' : '—') + '</td></tr>';
      }).join('');

      box.innerHTML =
        '<div class="sch2-grades">' + gradesHtml + '</div>' +
        '<div class="sch2-classes">' + classesHtml + '</div>' +
        '<div class="sch2-days">' + daysHtml + '</div>' +
        '<div class="sch2-head">' +
        '<span class="sch2-pill">' + esc(state.className) + ' sinf</span>' +
        '<span class="sch2-pill gold">' + esc(state.day || '') + '</span>' +
        '<span class="sch2-count">' + realLessons.length + ' dars</span>' +
        '</div>' +
        '<table class="sch2-table"><thead><tr>' +
        '<th>#</th><th>Vaqt</th><th>Fan</th><th>Xona</th>' +
        '</tr></thead><tbody>' +
        (rowsHtml || '<tr><td colspan="4" style="text-align:center;color:#8a93a3;">Bu kunda dars yo\'q</td></tr>') +
        '</tbody></table>';

      box.querySelectorAll('[data-grade]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          state.grade = btn.getAttribute('data-grade');
          state.className = classesOfGrade(state.grade)[0];
          state.day = null;
          draw();
        });
      });

      box.querySelectorAll('[data-class]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          state.className = btn.getAttribute('data-class');
          state.day = null;
          draw();
        });
      });

      box.querySelectorAll('[data-day]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          state.day = btn.getAttribute('data-day');
          draw();
        });
      });
    }

    draw();
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
