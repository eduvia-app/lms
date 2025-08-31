document.addEventListener('DOMContentLoaded', () => {
  // ajoute le bouton que sur la page de login - s'il n'y en a pas deja
  if (!location.pathname.includes('/login')) return;

  const target =
    document.querySelector('.page-card .page-card-actions') ||
    document.querySelector('form#login_form') ||
    document.querySelector('.page-card');

  if (!target || document.getElementById('eduvia-login-btn')) return;

  const btn = document.createElement('a');
  btn.id = 'eduvia-login-btn';
  btn.className = 'btn btn-primary btn-block mt-3';
  btn.innerText = 'Se connecter avec Eduvia';
  btn.href = '#';

  const insertIntoForm = (container) => {
    if (container && container.tagName && container.tagName.toLowerCase() === 'form') {
      const wrap = document.createElement('div');
      wrap.className = 'mt-3';
      wrap.appendChild(btn);
      container.appendChild(wrap);
    } else {
      target.appendChild(btn);
    }
  };

  insertIntoForm(target);

  btn.addEventListener(
    'click',
    async (e) => {
      e.preventDefault();
      if (btn.dataset.loading === '1') return;

      // Recupere user/pass depuis le formulaire s'ils existent -sinon prompt()
      const emailEl =
        document.querySelector('#login_email') ||
        document.querySelector('input[name="login_email"]') ||
        document.querySelector('input[type="email"]');

      const passEl =
        document.querySelector('#login_password') ||
        document.querySelector('input[name="login_password"]') ||
        document.querySelector('input[type="password"]');

      const user =
        (emailEl && emailEl.value && emailEl.value.trim()) ||
        (typeof prompt === 'function' ? prompt('Utilisateur Eduvia') : '');

      if (!user) return;

      const password =
        (passEl && passEl.value) ||
        (typeof prompt === 'function' ? prompt('Mot de passe Eduvia') : '');

      if (password == null) return;

      const form = new FormData();
      form.set('user', user);
      form.set('password', password);

      const originalText = btn.innerText;
      btn.dataset.loading = '1';
      btn.innerText = 'Connexion en cours...';
      btn.classList.add('disabled');

      try {
        const res = await fetch('/api/method/lms.lms.api.eduvia_proxy_login', {
          method: 'POST',
          body: form,
          credentials: 'include',
        });

        // Frappe renvoie { message: {...} }
        const payload = await res.json().catch(() => ({}));
        const msg = payload && (payload.message || payload);

        if (res.ok && msg && msg.success) {
          // Connecte: redirige vers la home (ou recharge)
          window.location.assign('/');
        } else {
          alert((msg && msg.error) || 'Login Eduvia échoué');
        }
      } catch (err) {
        alert('Erreur réseau');
      } finally {
        btn.dataset.loading = '';
        btn.innerText = originalText;
        btn.classList.remove('disabled');
      }
    },
    true
  );
});