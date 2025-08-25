document.addEventListener('DOMContentLoaded', () => {
    if (location.pathname !== '/login') return;
  
    const target =
      document.querySelector('.page-card .page-card-actions') ||
      document.querySelector('form#login_form') ||
      document.querySelector('.page-card');
  
    if (!target || document.getElementById('eduvia-login-btn')) return;
  
    const btn = document.createElement('a');
    btn.id = 'eduvia-login-btn';
    btn.href = '/eduvia/sso/start?return=' + encodeURIComponent(location.href);
    btn.className = 'btn btn-primary btn-block mt-3';
    btn.innerText = 'Se connecter avec Eduvia';
  
    if (target.tagName && target.tagName.toLowerCase() === 'form') {
      const div = document.createElement('div');
      div.className = 'mt-3';
      div.appendChild(btn);
      target.appendChild(div);
    } else {
      target.appendChild(btn);
    }
  });