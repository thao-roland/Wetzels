// Menu mobile
const burger = document.querySelector('.burger');
const menu = document.getElementById('menu');
burger.addEventListener('click', () => {
  burger.setAttribute('aria-expanded', menu.classList.toggle('ouvert'));
});

// Lien de la page en cours
const page = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('nav a').forEach(a => {
  if (a.getAttribute('href') === page) a.classList.add('actif');
});

// Formulaire (pas encore branché à un service d'envoi)
const form = document.getElementById('form');
if (form) {
  const service = new URLSearchParams(location.search).get('service');
  const r = service && document.getElementById('s-' + service);
  if (r) r.checked = true;
  form.addEventListener('submit', e => {
    e.preventDefault();
    document.getElementById('merci').style.display = 'block';
    form.reset();
  });
}

document.querySelectorAll('.annee').forEach(s => s.textContent = new Date().getFullYear());
