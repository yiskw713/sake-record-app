var GITHUB_PAGES_ORIGIN = 'https://yiskw713.github.io';

function isAuthorized(token) {
  if (!token) return false;
  return CacheService.getScriptCache().get('session_' + token) === 'valid';
}

function doGet(e) {
  var action = e.parameter.action;
  var result;

  if (action === 'getStats') {
    result = getStats(e.parameter.year || null);
  } else if (action === 'getQuiz') {
    result = getQuizQuestion();
  } else if (action === 'getBrands') {
    if (!isAuthorized(e.parameter.token)) {
      return buildResponse({ status: 'error', message: 'unauthorized' });
    }
    result = getAllBrands();
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
    var props = PropertiesService.getScriptProperties();
    var expectedUser = props.getProperty('APP_USERNAME');
    var expectedPass = props.getProperty('APP_PASSWORD');
    if (data.username && data.password &&
        data.username === expectedUser && data.password === expectedPass) {
      var token = Utilities.getUuid();
      CacheService.getScriptCache().put('session_' + token, 'valid', 21600);
      return buildResponse({ status: 'success', token: token });
    }
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
