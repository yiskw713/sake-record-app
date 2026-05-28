function checkAuth() {
  if (!sessionStorage.getItem('sake-token')) {
    sessionStorage.setItem('sake-redirect', location.pathname);
    location.replace('login.html');
    throw new Error('Not authenticated');
  }
}

function getToken() {
  return sessionStorage.getItem('sake-token') || '';
}

function logout() {
  sessionStorage.removeItem('sake-token');
  location.href = 'login.html';
}

function setupNavAuth() {
  var btn = document.querySelector('.btn-logout');
  if (!btn) return;
  if (!sessionStorage.getItem('sake-token')) {
    btn.textContent = 'ログイン';
    btn.onclick = function() { location.href = 'login.html'; };
  }
}
