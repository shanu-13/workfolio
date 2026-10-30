const body = document.body;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ============ MODE TOGGLE ============ */
const modeToggle = document.getElementById('modeToggle');

function setMode(mode) {
  body.classList.toggle('mode-recruiter', mode === 'recruiter');
  modeToggle.setAttribute('aria-pressed', mode === 'recruiter');
  modeToggle.title = mode === 'recruiter'
    ? 'Back to the fun version.'
    : 'Boss is watching? Switch to Recruiter mode.';
  try { localStorage.setItem('mode', mode); } catch (e) {}
}

let savedMode = 'race';
try { savedMode = localStorage.getItem('mode') || 'race'; } catch (e) {}
if (new URLSearchParams(location.search).has('recruiter')) savedMode = 'recruiter';
setMode(savedMode);

modeToggle.addEventListener('click', () => {
  const next = body.classList.contains('mode-recruiter') ? 'race' : 'recruiter';
  setMode(next);
  showToast(next === 'recruiter' ? '👔 Recruiter mode on. Very professional.' : '🏎️ Race mode on. Let\'s go!');
});

/* ============ LOADER ============ */
const loader = document.getElementById('loader');

function finishLoader() {
  loader.classList.add('done');
  body.classList.remove('loading');
}

let seenLights = false;
try { seenLights = !!sessionStorage.getItem('seenLights'); } catch (e) {}

if (reduceMotion || body.classList.contains('mode-recruiter') || seenLights) {
  finishLoader();
} else {
  body.classList.add('loading');
  const lines = ['Warming up the tyres…', 'Checking tyre pressure…', 'Clearing the gravel trap…', 'Five red lights…'];
  const text = document.getElementById('loaderText');
  const lights = loader.querySelectorAll('.lights span');
  lines.forEach((line, i) => setTimeout(() => { text.textContent = line; }, i * 450));
  lights.forEach((light, i) => setTimeout(() => light.classList.add('on'), 600 + i * 380));
  setTimeout(() => loader.classList.add('out'), 600 + 5 * 380 + 500);
  setTimeout(finishLoader, 600 + 5 * 380 + 1300);
  loader.addEventListener('click', finishLoader);
  try { sessionStorage.setItem('seenLights', '1'); } catch (e) {}
}

/* ============ MOBILE MENU ============ */
const menuBtn = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');
menuBtn.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', open);
});
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  navLinks.classList.remove('open');
  menuBtn.setAttribute('aria-expanded', 'false');
}));

/* ============ SCROLL: progress kart + hero frames ============ */
const trackFill = document.getElementById('trackFill');
const kart = document.getElementById('kart');
const hero = document.getElementById('start');
const frame1 = hero.querySelector('.frame-1');
const frame2 = hero.querySelector('.frame-2');

function onScroll() {
  const max = document.documentElement.scrollHeight - innerHeight;
  const p = max > 0 ? scrollY / max : 0;
  trackFill.style.width = (p * 100) + '%';
  kart.style.left = `clamp(12px, ${p * 100}%, calc(100% - 12px))`;

  // hero crossfade: frame 1 out, frame 2 in, over the first ~100vh of scroll
  const h = Math.min(Math.max(scrollY / innerHeight, 0), 1);
  frame1.style.opacity = 1 - Math.min(h * 2, 1);
  frame1.style.transform = `translateY(${-h * 40}px)`;
  frame2.style.opacity = Math.max(h * 2 - 1, 0);
  frame2.style.transform = `translateY(${(1 - h) * 40}px)`;
}
addEventListener('scroll', onScroll, { passive: true });
addEventListener('resize', onScroll);
onScroll();

/* ============ REVEAL + LAP COUNTER + ACTIVE NAV ============ */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

const lapNum = document.getElementById('lapNum');
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    lapNum.textContent = e.target.dataset.lap;
    navLinks.querySelectorAll('a').forEach(a =>
      a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
document.querySelectorAll('[data-lap]').forEach(s => sectionObserver.observe(s));

/* ============ COUNT-UP STATS ============ */
const countObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const target = +el.dataset.count;
    const start = performance.now();
    const tick = now => {
      const t = Math.min((now - start) / 1200, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    countObserver.unobserve(el);
  });
}, { threshold: 0.6 });
document.querySelectorAll('[data-count]').forEach(el => {
  if (reduceMotion) el.textContent = el.dataset.count;
  else countObserver.observe(el);
});

/* ============ TOAST + COPY EMAIL ============ */
const toast = document.getElementById('toast');
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}

document.getElementById('emailCopy').addEventListener('click', async e => {
  const email = e.currentTarget.dataset.email;
  try {
    await navigator.clipboard.writeText(email);
    showToast(body.classList.contains('mode-recruiter') ? 'Email copied ✔' : 'Copied! Radio check complete ✔');
  } catch (err) {
    location.href = 'mailto:' + email;
  }
});

/* ============ IDLE RADIO CHECK ============ */
let idleTimer;
function resetIdle() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    if (!body.classList.contains('mode-recruiter')) showToast('📻 Driver, are you still there?');
  }, 30000);
}
['scroll', 'mousemove', 'keydown', 'touchstart'].forEach(ev => addEventListener(ev, resetIdle, { passive: true }));
resetIdle();

/* ============ CONSOLE EASTER EGG ============ */
console.log(
  '%c🏎️  Oh, you\'re inspecting the engine? Respect.\n%cSay hi: shankari9514@gmail.com',
  'font: 600 16px sans-serif; color: #e10600;',
  'font: 13px monospace; color: #888;'
);
