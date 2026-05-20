function getQuizQuestion() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheets = ss.getSheets().filter(function(s) {
    return /^\d{4}$/.test(s.getName());
  });

  var records = [];
  sheets.forEach(function(sheet) {
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) return;
    var values = sheet.getRange(2, 2, lastRow - 1, 2).getValues();
    values.forEach(function(row) {
      if (row[0] && row[1]) {
        records.push({ brand: row[0], brewery: row[1] });
      }
    });
  });

  if (records.length < 4) {
    return { status: 'insufficient_data', message: '問題生成に必要なデータが不足しています（4件以上必要）' };
  }

  var type = Math.random() < 0.5 ? 'brandToBrewery' : 'breweryToBrand';
  var correctRecord = records[Math.floor(Math.random() * records.length)];
  var correctAnswer = type === 'brandToBrewery' ? correctRecord.brewery : correctRecord.brand;

  var pool = records.filter(function(r) {
    return type === 'brandToBrewery'
      ? r.brewery !== correctAnswer
      : r.brand !== correctAnswer;
  });

  var wrongChoices = [];
  var usedIndices = {};
  var maxAttempts = pool.length * 3;
  var attempts = 0;
  while (wrongChoices.length < 3 && wrongChoices.length < pool.length && attempts < maxAttempts) {
    var idx = Math.floor(Math.random() * pool.length);
    var candidate = type === 'brandToBrewery' ? pool[idx].brewery : pool[idx].brand;
    if (!usedIndices[idx] && candidate !== correctAnswer) {
      usedIndices[idx] = true;
      wrongChoices.push(candidate);
    }
    attempts++;
  }

  var questionText = type === 'brandToBrewery'
    ? '「' + correctRecord.brand + '」の酒蔵はどれ？'
    : '「' + correctRecord.brewery + '」の代表銘柄はどれ？';

  var choices = gasShuffleChoices([correctAnswer].concat(wrongChoices));

  return {
    status: 'success',
    question: {
      type: type,
      question: questionText,
      correct: correctAnswer,
      choices: choices
    }
  };
}

function gasShuffleChoices(arr) {
  var result = arr.slice();
  for (var i = result.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = result[i];
    result[i] = result[j];
    result[j] = tmp;
  }
  return result;
}
