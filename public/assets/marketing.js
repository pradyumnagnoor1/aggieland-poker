(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = days.indexOf(new Intl.DateTimeFormat('en-US', {timeZone:'America/Chicago', weekday:'short'}).format(new Date()));
  $('#yr').textContent = new Date().getFullYear();
  $('#opening-note').textContent = `Doors at ${today === 0 || today === 6 ? '2 PM' : '7 PM'} today · Open until 4 AM`;
  $$('.card[data-day]').forEach(card => card.classList.toggle('is-today', Number(card.dataset.day) === today));
  const bar = $('.bar');
  const onScroll = () => bar.classList.toggle('solid', window.scrollY > 40);
  addEventListener('scroll', onScroll, {passive:true}); onScroll();

  const menuButton = $('.menu-button'), menu = $('#mobile-menu');
  function closeMenu() { menu.hidden = true; menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label','Open navigation'); }
  menuButton.addEventListener('click', () => {
    const expanded = menuButton.getAttribute('aria-expanded') === 'true';
    menu.hidden = expanded;
    menuButton.setAttribute('aria-expanded', String(!expanded));
    menuButton.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  });
  menu.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { closeMenu(); menuButton.focus(); } });
  document.addEventListener('click', e => { if (!menu.hidden && !menu.contains(e.target) && !menuButton.contains(e.target)) closeMenu(); });
  addEventListener('resize', () => { if (innerWidth >= 900) closeMenu(); });

  const stage = $('.table-stage'), table = $('.table'), seats = $$('.seat'), cups = $$('.cup');
  function layoutTable() {
    const s = stage.getBoundingClientRect(), t = table.getBoundingClientRect();
    const cx = t.left - s.left + t.width / 2, cy = t.top - s.top + t.height / 2, rx = t.width / 2, ry = t.height / 2;
    seats.forEach((el, i) => {
      const a = Math.PI / 2 + (i + .5) * (2 * Math.PI * .86 / 9) + Math.PI * .07;
      const gap = seats[0].offsetWidth * .62 + 6;
      el.style.left = `${cx + Math.cos(a) * (rx + gap)}px`;
      el.style.top = `${cy + Math.sin(a) * (ry + gap)}px`;
    });
    cups.forEach((el, i) => { const a = (i + .5) * (2 * Math.PI / cups.length); el.style.left = `${rx + Math.cos(a) * rx * .95}px`; el.style.top = `${ry + Math.sin(a) * ry * .95}px`; });
  }
  layoutTable(); addEventListener('resize',layoutTable);
  const order = [0,4,7,2,6,1,8,3];
  if (reduced) { order.slice(0,6).forEach(i => seats[i].classList.add('on')); seats[5].classList.add('you'); }
  else {
    let step = 0;
    const animate = () => {
      if (step < order.length) { seats[order[step++]].classList.add('on'); setTimeout(animate,420); }
      else if (step === order.length) { seats[5].classList.add('you'); step++; setTimeout(animate,4200); }
      else { seats.forEach(el => el.classList.remove('on','you')); step = 0; setTimeout(animate,700); }
    };
    setTimeout(animate,600);
  }
  $$('.game-filters button').forEach(button => button.addEventListener('click', () => {
    $$('.game-filters button').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    $$('.game-card[data-type]').forEach(card => { card.hidden = button.dataset.filter !== 'all' && card.dataset.type !== button.dataset.filter; });
  }));

  const dial = $('#dial'), knob = $('#dial-knob'), fill = $('#dial-fill');
  let months = 5;
  function setMonths(value) {
    months = Math.max(1, Math.min(12,value));
    const angle = months / 12 * 2 * Math.PI, size = dial.getBoundingClientRect().width, radius = size * 88 / 220, circumference = 2 * Math.PI * 88;
    knob.style.left = `${size / 2 + Math.sin(angle) * radius}px`;
    knob.style.top = `${size / 2 - Math.cos(angle) * radius}px`;
    fill.style.strokeDasharray = `${months / 12 * circumference} ${circumference}`;
    $('#dial-num').textContent = months;
    $('#dial-unit').textContent = months === 1 ? 'month' : 'months';
    dial.setAttribute('aria-valuenow',months);
    dial.setAttribute('aria-valuetext',`${months} ${months === 1 ? 'month' : 'months'}`);
    $('#months-minus').disabled = months === 1;
    $('#months-plus').disabled = months === 12;
    const monthly = months * 5, best = Math.min(monthly,50);
    $('#member-total').textContent = `$${best}`;
    $('#member-choice').textContent = monthly < 50 ? 'Monthly is your best fit' : monthly === 50 ? 'Same price. Yearly gives you 12 months.' : 'Yearly is your best fit';
    $('#member-summary').textContent = (monthly < 50 ? `${months} ${months === 1 ? 'month' : 'months'} × $5.` : monthly === 50 ? '10 monthly payments cost $50. Annual membership covers 12 months for the same price.' : `Save $${monthly - 50} over ${months} monthly payments.`) + ' Membership only; seat rental is separate.';
  }
  $('#months-minus').addEventListener('click',() => setMonths(months - 1));
  $('#months-plus').addEventListener('click',() => setMonths(months + 1));
  dial.addEventListener('keydown',e => {
    const move = {ArrowUp:1,ArrowRight:1,ArrowDown:-1,ArrowLeft:-1}[e.key];
    if (move) { e.preventDefault(); setMonths(months + move); }
    else if (e.key === 'Home' || e.key === 'End') { e.preventDefault(); setMonths(e.key === 'Home' ? 1 : 12); }
  });
  let dragging = false;
  function fromPointer(e) {
    const b = dial.getBoundingClientRect(), x = e.clientX - b.left - b.width / 2, y = e.clientY - b.top - b.height / 2;
    let angle = Math.atan2(x,-y); if (angle < 0) angle += 2 * Math.PI;
    let value = Math.round(angle / (2 * Math.PI) * 12) || 12;
    if (dragging && months >= 10 && value <= 2) value = 12;
    else if (dragging && months <= 2 && value >= 10) value = 1;
    setMonths(value);
  }
  dial.addEventListener('pointerdown',e => { fromPointer(e); dragging = true; dial.setPointerCapture(e.pointerId); });
  dial.addEventListener('pointermove',e => { if (dragging) fromPointer(e); });
  dial.addEventListener('pointerup',() => { dragging = false; });
  dial.addEventListener('pointercancel',() => { dragging = false; });
  addEventListener('resize',() => setMonths(months)); setMonths(months);

  const dialog = $('#photo-dialog'), photo = $('#enlarged-photo');
  let photoOpener;
  $$('.photo').forEach(button => button.addEventListener('click',() => {
    photoOpener = button; photo.src = button.dataset.photo; photo.alt = button.querySelector('img').alt; dialog.showModal();
  }));
  $('.photo-close').addEventListener('click',() => dialog.close());
  dialog.addEventListener('click',e => { if (e.target === dialog) { const rect = dialog.getBoundingClientRect(); if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) dialog.close(); } });
  dialog.addEventListener('close',() => photoOpener?.focus());

  if (!reduced && 'IntersectionObserver' in window) {
    const targets = $$('.steps li,.game-card,.card,.tourney,.community-visual,.tier,.photo');
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('in'); observer.unobserve(entry.target); } }),{rootMargin:'0px 0px 0px 0px'});
    targets.forEach(el => { el.classList.add('rv'); observer.observe(el); });
  }
})();
