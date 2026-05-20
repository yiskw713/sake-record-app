var GITHUB_PAGES_ORIGIN = 'https://yiskw713.github.io';

function doGet(e) {
  var action = e.parameter.action;
  var result;

  if (action === 'getBrands') {
    result = getAllBrands();
  } else if (action === 'getStats') {
    result = getStats(e.parameter.year || null);
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
