const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Header ---------- */
const header = document.getElementById('header');
const majHeader = () => header.classList.toggle('plein', scrollY > 30);
addEventListener('scroll', majHeader, { passive: true });
majHeader();

/* ---------- Menu mobile ---------- */
const burger = document.querySelector('.burger');
const menu = document.getElementById('menu');
burger.addEventListener('click', () => burger.setAttribute('aria-expanded', menu.classList.toggle('ouvert')));

/* ---------- Lien actif ---------- */
const page = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('nav a.lien').forEach(a => {
  if (a.getAttribute('href') === page) a.classList.add('actif');
});

/* ---------- Transition entre pages ---------- */
document.querySelectorAll('a[href$=".html"], a[href*=".html?"]').forEach(a => {
  a.addEventListener('click', e => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
    if (reduit) return;
    e.preventDefault();
    menu.classList.remove('ouvert');
    document.body.classList.add('sortie');
    setTimeout(() => { location.href = a.href; }, 480);
  });
});
addEventListener('pageshow', e => { if (e.persisted) document.body.classList.remove('sortie'); });

/* ---------- Titres découpés en mots ---------- */
document.querySelectorAll('.masque').forEach(t => {
  const mots = t.textContent.trim().split(/\s+/);
  t.innerHTML = mots.map((m, i) => `<span class="mot"><span style="--i:${i}">${m}</span></span>`).join(' ');
});

/* ---------- Gros numéro chiffre par chiffre ---------- */
document.querySelectorAll('.gros-tel').forEach(gt => {
  [...gt.childNodes].forEach(n => {
    if (n.nodeType === 3 && n.textContent.trim()) {
      const s = document.createElement('span');
      s.innerHTML = [...n.textContent.trim()].map((c, i) => `<span class="ch" style="--i:${i}">${c}</span>`).join('');
      n.replaceWith(s);
    }
  });
});

/* ---------- Apparitions au scroll ---------- */
const obs = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('vu'); obs.unobserve(e.target); }
}), { threshold: .2, rootMargin: '0px 0px -60px 0px' });
document.querySelectorAll('.monte,.masque,.revele,.etapes,.gros-tel').forEach(el => {
  // cascade pour les éléments côte à côte
  if (el.classList.contains('monte')) {
    const freres = [...el.parentElement.children].filter(x => x.classList.contains('monte'));
    if (freres.length > 1 && getComputedStyle(el.parentElement).display.includes('grid')) {
      el.style.transitionDelay = (freres.indexOf(el) * .12) + 's';
    }
  }
  obs.observe(el);
});

/* ---------- Parallaxe ---------- */
const paras = [...document.querySelectorAll('.para')];
const fonds = [...document.querySelectorAll('.appel-fond')];
function parallaxe() {
  if (reduit) return;
  const h = innerHeight;
  paras.forEach(img => {
    const r = img.parentElement.getBoundingClientRect();
    if (r.bottom < 0 || r.top > h) return;
    img.style.transform = `translateY(${((r.top + r.height / 2 - h / 2) / h) * -40}px)`;
  });
  fonds.forEach(f => {
    const r = f.parentElement.getBoundingClientRect();
    if (r.bottom > 0 && r.top < h) f.style.transform = `translateY(${(r.top / h) * -80}px)`;
  });
}
addEventListener('scroll', () => requestAnimationFrame(parallaxe), { passive: true });
parallaxe();

/* ---------- Bandeau défilant (réagit au scroll) ---------- */
const piste = document.querySelector('.defile .piste');
if (piste) {
  let x = 0, dernierY = scrollY, vitesse = 0, sens = 1;
  (function boucle() {
    const y = scrollY, d = y - dernierY;
    dernierY = y;
    if (d !== 0) sens = d > 0 ? 1 : -1;
    vitesse += (Math.min(Math.abs(d), 60) * .25 - vitesse) * .1;
    if (!reduit) x -= (.6 + vitesse) * sens;
    const moitie = piste.scrollWidth / 2;
    if (x <= -moitie) x += moitie;
    if (x > 0) x -= moitie;
    piste.style.transform = `translateX(${x}px)`;
    requestAnimationFrame(boucle);
  })();
}

/* ---------- Visuel du hero qui suit la souris ---------- */
const hero = document.querySelector('.hero');
const cadreImgs = document.querySelectorAll('.cadre img');
const badge = document.querySelector('.badge');
if (hero && !reduit && matchMedia('(pointer:fine)').matches) {
  hero.addEventListener('mousemove', e => {
    const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
    cadreImgs.forEach(i => i.style.translate = `${x * -18}px ${y * -18}px`);
    if (badge) badge.style.translate = `${x * 14}px ${y * 14}px`;
  });
  hero.addEventListener('mouseleave', () => {
    cadreImgs.forEach(i => i.style.translate = '0 0');
    if (badge) badge.style.translate = '0 0';
  });
}

/* ---------- Sélecteur de services (accueil) ---------- */
const onglets = [...document.querySelectorAll('.onglet')];
if (onglets.length) {
  const textes = {
    verts:  { fin: 'propre toute l\'année.', badge: 'Espaces verts' },
    foret:  { fin: 'dégagé en sécurité.',     badge: 'Travaux forestiers' },
    guepes: { fin: 'sans guêpes ni frelons.', badge: 'Guêpes & frelons' },
    taupes: { fin: 'sans taupinières.',       badge: 'Taupes' }
  };
  const fin = document.getElementById('heroFin');
  const badgeTxt = document.getElementById('badgeTxt');
  let index = 0, auto = true, minuteur;

  function choisir(i, manuel) {
    index = i;
    const t = onglets[i].dataset.theme;
    document.body.dataset.theme = t;
    onglets.forEach((o, k) => {
      o.setAttribute('aria-pressed', k === i);
      const j = o.querySelector('.jauge');
      j.classList.remove('anime');
      if (k === i && auto) { void j.offsetWidth; j.classList.add('anime'); }
    });
    cadreImgs.forEach(img => img.classList.toggle('actif', img.dataset.theme === t));
    badgeTxt.textContent = textes[t].badge;
    if (!reduit) {
      fin.animate([{ transform: 'none' }, { transform: 'translateY(110%)' }], { duration: 300, easing: 'cubic-bezier(.7,0,.8,.3)', fill: 'forwards' })
        .onfinish = () => {
          fin.textContent = textes[t].fin;
          fin.animate([{ transform: 'translateY(-110%)' }, { transform: 'none' }], { duration: 500, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' });
        };
    } else fin.textContent = textes[t].fin;
    if (manuel) { auto = false; clearInterval(minuteur); onglets.forEach(o => o.querySelector('.jauge').classList.remove('anime')); }
  }

  onglets.forEach((o, i) => o.addEventListener('click', () => choisir(i, true)));
  if (!reduit) {
    setTimeout(() => {
      if (!auto) return;
      onglets[0].querySelector('.jauge').classList.add('anime');
      minuteur = setInterval(() => { if (auto) choisir((index + 1) % onglets.length); }, 5500);
    }, 1400);
  }
}

/* ---------- FAQ animée ---------- */
document.querySelectorAll('.faq details').forEach(d => {
  const rep = d.querySelector('.rep');
  d.querySelector('summary').addEventListener('click', e => {
    if (reduit) return;
    e.preventDefault();
    if (d.open) {
      const a = rep.animate([{ height: rep.offsetHeight + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 350, easing: 'ease' });
      a.onfinish = () => d.open = false;
    } else {
      d.open = true;
      rep.animate([{ height: '0px', opacity: 0 }, { height: rep.offsetHeight + 'px', opacity: 1 }], { duration: 400, easing: 'cubic-bezier(.2,.8,.2,1)' });
    }
  });
});

/* ---------- Formulaire (maquette) ---------- */
const form = document.getElementById('form');
if (form) {
  const service = new URLSearchParams(location.search).get('service');
  if (service) {
    const r = document.getElementById('s-' + service);
    if (r) r.checked = true;
  }
  form.addEventListener('submit', e => {
    e.preventDefault();
    document.getElementById('merci').style.display = 'block';
    form.reset();
  });
}

/* ---------- Année ---------- */
document.querySelectorAll('.annee').forEach(s => s.textContent = new Date().getFullYear());
