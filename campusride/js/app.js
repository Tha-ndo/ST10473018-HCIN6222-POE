/* CampusRide prototype behaviour. All data is sample data; nothing is sent anywhere. */
(function () {
  'use strict';

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---------- Mobile navigation ---------- */
  var toggle = $('.nav-toggle');
  var nav = $('#site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('open', !open);
    });
  }

  /* ---------- Form helpers ---------- */
  function showError(input, message) {
    var err = document.getElementById(input.id + '-error');
    if (err) { err.textContent = message; }
    input.setAttribute('aria-invalid', 'true');
  }
  function clearError(input) {
    var err = document.getElementById(input.id + '-error');
    if (err) { err.textContent = ''; }
    input.removeAttribute('aria-invalid');
  }
  function clearAll(form) {
    $$('input, select', form).forEach(clearError);
    var summary = $('.error-summary', form);
    if (summary) { summary.hidden = true; summary.querySelector('ul').innerHTML = ''; }
  }
  /* Shows an error summary with links to each problem field, then moves focus to it */
  function reportErrors(form, problems) {
    var summary = $('.error-summary', form);
    var list = summary.querySelector('ul');
    list.innerHTML = '';
    problems.forEach(function (p) {
      showError(p.input, p.message);
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = '#' + p.input.id;
      a.textContent = p.message;
      li.appendChild(a);
      list.appendChild(li);
    });
    summary.hidden = false;
    summary.focus();
  }
  function checkedCount(form, name) {
    return $$('input[name="' + name + '"]:checked', form).length;
  }

  /* ---------- Sign-up ---------- */
  var signup = $('#signup-form');
  if (signup) {
    signup.addEventListener('submit', function (e) {
      e.preventDefault();
      clearAll(signup);
      var problems = [];
      var name = $('#first-name'), email = $('#email'), pw = $('#password'), campus = $('#campus'), rules = $('#guidelines');
      if (!name.value.trim()) { problems.push({ input: name, message: 'Please enter your first name.' }); }
      if (!/^[^@\s]+@[^@\s]+\.ac\.za$/i.test(email.value.trim())) {
        problems.push({ input: email, message: 'That is not a university email address. Please use your student email, which ends in .ac.za.' });
      }
      if (pw.value.length < 8) { problems.push({ input: pw, message: 'Please choose a password with at least 8 characters.' }); }
      if (!campus.value) { problems.push({ input: campus, message: 'Please choose your campus.' }); }
      if (!rules.checked) { problems.push({ input: rules, message: 'Please agree to the community guidelines to continue.' }); }
      if (problems.length) { reportErrors(signup, problems); return; }
      $('#signup-name').textContent = name.value.trim();
      signup.hidden = true;
      var ok = $('#signup-success');
      ok.hidden = false;
      ok.focus();
    });
  }

  /* ---------- Search form ---------- */
  var search = $('#search-form');
  if (search) {
    search.addEventListener('submit', function (e) {
      clearAll(search);
      var problems = [];
      var from = $('#from'), time = $('#arrive');
      if (!from.value.trim()) { problems.push({ input: from, message: 'Please enter your area (suburb).' }); }
      if (checkedCount(search, 'days') === 0) { problems.push({ input: $('#day-mon'), message: 'Please choose at least one day.' }); }
      if (!time.value) { problems.push({ input: time, message: 'Please choose your travel time.' }); }
      if (problems.length) { e.preventDefault(); reportErrors(search, problems); }
    });
  }

  /* ---------- Results: read query, sort, filter ---------- */
  var list = $('#ride-list');
  if (list) {
    var params = new URLSearchParams(window.location.search);
    var dir = params.get('direction') === 'from' ? 'from' : 'to';
    var areaName = params.get('area') || 'Northside';
    var campusName = params.get('campus') || 'Main campus';
    $('#route-first').textContent = dir === 'from' ? campusName : areaName;
    $('#route-second').textContent = dir === 'from' ? areaName : campusName;
    /* Keep only the rides (and map list) that match the chosen direction */
    $$('.ride-card, details ol').forEach(function (el) {
      if ((el.dataset.direction || 'to') !== dir) { el.parentNode.removeChild(el); }
    });

    var sortSel = $('#sort'), priceSel = $('#maxprice'), count = $('#result-count'), empty = $('#empty-state');

    var applyView = function () {
      var cards = $$('.ride-card', list);
      var by = sortSel.value;
      cards.sort(function (a, b) {
        /* Full rides always go to the bottom so users see available seats first */
        var fullDiff = (a.dataset.full === 'true' ? 1 : 0) - (b.dataset.full === 'true' ? 1 : 0);
        if (fullDiff !== 0) { return fullDiff; }
        if (by === 'price') { return Number(a.dataset.price) - Number(b.dataset.price); }
        if (by === 'time') { return Number(a.dataset.time) - Number(b.dataset.time); }
        return Number(b.dataset.match) - Number(a.dataset.match);
      });
      var max = priceSel.value === 'any' ? Infinity : Number(priceSel.value);
      var visible = 0;
      cards.forEach(function (c) {
        var show = Number(c.dataset.price) <= max;
        c.hidden = !show;
        if (show) { visible += 1; }
        list.appendChild(c);
      });
      count.textContent = visible === 1 ? '1 ride matches your search.' : visible + ' rides match your search.';
      empty.hidden = visible !== 0;
      list.hidden = visible === 0;
    };
    sortSel.addEventListener('change', applyView);
    priceSel.addEventListener('change', applyView);
    applyView();

    var save = $('#save-search');
    if (save) {
      save.addEventListener('click', function () {
        var msg = $('#save-msg');
        msg.hidden = false;
        save.disabled = true;
        save.textContent = 'Search saved';
      });
    }
  }

  /* ---------- Ride details: send request ---------- */
  var req = $('#request-btn');
  if (req) {
    req.addEventListener('click', function () {
      req.disabled = true;
      req.textContent = 'Request sent';
      var msg = $('#request-msg');
      msg.hidden = false;
    });
  }

  /* ---------- Offer a ride ---------- */
  var seats = $('#seats');
  if (seats) {
    $$('.stepper button').forEach(function (b) {
      b.addEventListener('click', function () {
        var v = Number(seats.value) + Number(b.dataset.step);
        seats.value = Math.min(6, Math.max(1, v));
      });
    });
  }
  var offer = $('#offer-form');
  if (offer) {
    offer.addEventListener('submit', function (e) {
      e.preventDefault();
      clearAll(offer);
      var problems = [];
      var from = $('#o-from'), time = $('#depart'), pickup = $('#pickup'), cost = $('#cost');
      if (!from.value.trim()) { problems.push({ input: from, message: 'Please enter your area (suburb).' }); }
      if (checkedCount(offer, 'days') === 0) { problems.push({ input: $('#day-mon'), message: 'Please choose at least one day.' }); }
      if (!time.value) { problems.push({ input: time, message: 'Please choose your departure time.' }); }
      if (!pickup.value.trim()) { problems.push({ input: pickup, message: 'Please enter a public pickup point, such as a shopping centre or a campus gate.' }); }
      if (!cost.value || Number(cost.value) < 0) { problems.push({ input: cost, message: 'Please enter a contribution per trip in rand. Enter 0 if you do not want to charge.' }); }
      var ret = $('#return-trip'), retTime = $('#return-time');
      if (ret.checked && !retTime.value) { problems.push({ input: retTime, message: 'Please choose the departure time for the return trip.' }); }
      if (problems.length) { reportErrors(offer, problems); return; }
      offer.hidden = true;
      var ok = $('#offer-success');
      ok.hidden = false;
      ok.focus();
    });
  }

  /* ---------- My trips: cancel with confirmation and undo ---------- */
  var LABELS = {
    confirmed: '<span aria-hidden="true">✔</span> Confirmed',
    pending: '<span aria-hidden="true">⏳</span> Pending',
    cancelled: '<span aria-hidden="true">✖</span> Cancelled'
  };
  function setStatus(card, state) {
    var s = $('.status', card);
    s.className = 'status status-' + state;
    s.innerHTML = LABELS[state];
    card.dataset.state = state;
  }
  var dialog = $('#cancel-dialog');
  if (dialog) {
    var target = null, opener = null;
    $$('.cancel-btn').forEach(function (b) {
      b.addEventListener('click', function () {
        target = b.closest('.trip');
        opener = b;
        $('#cancel-what').textContent = target.dataset.title;
        dialog.showModal();
      });
    });
    $('#keep-btn').addEventListener('click', function () { dialog.close(); if (opener) { opener.focus(); } });
    $('#confirm-cancel').addEventListener('click', function () {
      target.dataset.prev = target.dataset.state;
      setStatus(target, 'cancelled');
      $('.cancel-btn', target).hidden = true;
      var undo = $('.undo-area', target);
      undo.hidden = false;
      dialog.close();
      $('.undo-btn', target).focus();
    });
    $$('.undo-btn').forEach(function (u) {
      u.addEventListener('click', function () {
        var card = u.closest('.trip');
        setStatus(card, card.dataset.prev || 'confirmed');
        $('.cancel-btn', card).hidden = false;
        $('.undo-area', card).hidden = true;
        $('.cancel-btn', card).focus();
      });
    });
  }
  /* ---------- Direction toggle (home to campus / campus to home) ---------- */
  /* Labels change and the From/To fields swap places IN THE PAGE ORDER (not just visually),
     so keyboard focus order always matches what the user sees (WCAG 2.4.3). */
  function initDirection(form) {
    var route = $('#route', form);
    var area = $('#area-field', form);
    var campus = $('#campus-field', form);
    if (!route || !area || !campus) { return; }
    function update() {
      var toCampus = $('input[name="direction"]:checked', form).value === 'to';
      route.appendChild(toCampus ? area : campus);
      route.appendChild(toCampus ? campus : area);
      $$('[data-to][data-from]', form).forEach(function (el) {
        el.textContent = el.getAttribute(toCampus ? 'data-to' : 'data-from');
      });
    }
    $$('input[name="direction"]', form).forEach(function (r) { r.addEventListener('change', update); });
    update();
  }
  [search, offer].forEach(function (form) { if (form) { initDirection(form); } });

  /* Return trip on the offer form */
  var returnBox = $('#return-trip');
  if (returnBox) {
    returnBox.addEventListener('change', function () {
      $('#return-wrap').hidden = !returnBox.checked;
    });
  }

  /* Ride details page: show the from-campus version when asked for */
  var rideRoute = $('#ride-route');
  if (rideRoute && new URLSearchParams(window.location.search).get('direction') === 'from') {
    rideRoute.textContent = 'Main campus to Northside';
    $('#ride-leaves').textContent = '16:30 (arrives about 17:15)';
    $('#ride-pickup').textContent = 'Main campus, main gate';
    $('#ride-seats').textContent = '2 of 4';
  }

  var rating = $('#rating-form');
  if (rating) {
    rating.addEventListener('submit', function (e) {
      e.preventDefault();
      rating.hidden = true;
      var ok = $('#rating-thanks');
      ok.hidden = false;
      ok.focus();
    });
  }
})();
