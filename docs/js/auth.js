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
