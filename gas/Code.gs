var GITHUB_PAGES_ORIGIN = 'https://yiskw713.github.io';

var LOGIN_MAX_ATTEMPTS = 5;
var LOGIN_LOCKOUT_SECONDS = 900; // 15 minutes

function isAuthorized(token) {
  if (!token) return false;
  return CacheService.getScriptCache().get('session_' + token) === 'valid';
}

function getLoginAttemptInfo(username) {
  var raw = CacheService.getScriptCache().get('login_rl_' + username);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (e) { return null; }
}

function isLoginRateLimited(username) {
  var info = getLoginAttemptInfo(username);
  return info !== null && info.count >= LOGIN_MAX_ATTEMPTS && Date.now() < info.expiry;
}

function recordFailedLogin(username) {
  var cache = CacheService.getScriptCache();
  var key = 'login_rl_' + username;
  var info = getLoginAttemptInfo(username);
  var now = Date.now();

  if (!info || now >= info.expiry) {
    info = { count: 1, expiry: now + LOGIN_LOCKOUT_SECONDS * 1000 };
  } else {
    info.count += 1;
  }

  var ttl = Math.ceil((info.expiry - now) / 1000);
  cache.put(key, JSON.stringify(info), ttl);
}

function clearLoginAttempts(username) {
  CacheService.getScriptCache().remove('login_rl_' + username);
}

function doGet(e) {
  var action = e.parameter.action;

  // getStats is publicly accessible without authentication
  if (action === 'getStats') {
    return buildResponse(getStats(e.parameter.year || null));
  }

  if (!isAuthorized(e.parameter.token)) {
    return buildResponse({ status: 'error', message: 'unauthorized' });
  }

  var result;
  if (action === 'getBrands') {
    result = getAllBrands();
  } else if (action === 'getQuiz') {
    result = getQuizQuestion();
  } else {
    result = { status: 'error', message: 'unknown action: ' + action };
  }

  return buildResponse(result);
}

function doPost(e) {
  var data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return buildResponse({ status: 'error', message: 'invalid JSON' });
  }

  if (data.action === 'login') {
    var username = data.username || '';
    if (isLoginRateLimited(username)) {
      return buildResponse({ status: 'error', message: 'too_many_attempts' });
    }

    var props = PropertiesService.getScriptProperties();
    var expectedUser = props.getProperty('APP_USERNAME');
    var expectedPass = props.getProperty('APP_PASSWORD');
    if (username && data.password &&
        username === expectedUser && data.password === expectedPass) {
      clearLoginAttempts(username);
      var token = Utilities.getUuid();
      CacheService.getScriptCache().put('session_' + token, 'valid', 21600);
      return buildResponse({ status: 'success', token: token });
    }

    recordFailedLogin(username);
    return buildResponse({ status: 'error', message: 'invalid credentials' });
  }

  if (!isAuthorized(data.token)) {
    return buildResponse({ status: 'error', message: 'unauthorized' });
  }

  if (data.action === 'addRecord') {
    return buildResponse(addRecord(data));
  }

  return buildResponse({ status: 'error', message: 'unknown action: ' + data.action });
}

function buildResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
