// GAS内テストランナー
// Apps Script IDEで runAllTests() を実行し、ログで結果を確認する。
// テスト用スプレッドシートは本番とは別のIDを使用する。
var TEST_SS_ID = 'REPLACE_WITH_TEST_SPREADSHEET_ID';

function runAllTests() {
  var results = [];
  var passed = 0;

  function test(name, fn) {
    try {
      fn();
      results.push({ name: name, status: 'PASS' });
      passed++;
    } catch (e) {
      results.push({ name: name, status: 'FAIL', error: e.message });
    }
  }

  function assertEqual(actual, expected, msg) {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(msg || ('Expected ' + JSON.stringify(expected) + ', got ' + JSON.stringify(actual)));
    }
  }

  function assertTrue(value, msg) {
    if (!value) throw new Error(msg || 'Expected truthy, got ' + value);
  }

  function assertContains(arr, item, msg) {
    if (arr.indexOf(item) === -1) {
      throw new Error(msg || ('Array does not contain ' + JSON.stringify(item)));
    }
  }

  // テスト用SSIDを一時的に上書き
  var originalId = SPREADSHEET_ID;
  SPREADSHEET_ID = TEST_SS_ID;

  try {
    testSheetService(test, assertEqual, assertTrue, assertContains);
    testStatsService(test, assertEqual, assertTrue);
    testQuizService(test, assertEqual, assertTrue, assertContains);
  } finally {
    SPREADSHEET_ID = originalId;
  }

  Logger.log('\n=== TEST RESULTS: ' + passed + '/' + results.length + ' passed ===');
  results.forEach(function(r) {
    Logger.log('[' + r.status + '] ' + r.name + (r.error ? ': ' + r.error : ''));
  });

  if (passed < results.length) {
    throw new Error('Some tests failed. See logs above.');
  }
}

function testSheetService(test, assertEqual, assertTrue, assertContains) {
  var testYear = '1900';

  test('getOrCreateSheet: 新規年のシートが作成される', function() {
    var ss = SpreadsheetApp.openById(TEST_SS_ID);
    var existing = ss.getSheetByName(testYear);
    if (existing) ss.deleteSheet(existing);

    var sheet = getOrCreateSheet(testYear);
    assertEqual(sheet.getName(), testYear);

    // ヘッダー確認
    var headers = sheet.getRange(1, 1, 1, 8).getValues()[0];
    assertEqual(headers[0], '記録ID');
    assertEqual(headers[1], '銘柄名');

    ss.deleteSheet(sheet);
  });

  test('getOrCreateSheet: 既存シートは再作成されない', function() {
    var ss = SpreadsheetApp.openById(TEST_SS_ID);
    var sheet1 = getOrCreateSheet(testYear);
    var sheetCount = ss.getSheets().length;
    getOrCreateSheet(testYear);
    assertEqual(ss.getSheets().length, sheetCount);
    ss.deleteSheet(sheet1);
  });

  test('addRecord: レコードが正常に追加される', function() {
    var ss = SpreadsheetApp.openById(TEST_SS_ID);
    var year = '1901';
    var existing = ss.getSheetByName(year);
    if (existing) ss.deleteSheet(existing);

    var data = {
      brand: 'テスト酒',
      brewery: 'テスト蔵',
      prefecture: '東京都',
      city: '渋谷区',
      drankAt: year + '-06-01T12:00:00',
      note: 'テスト感想'
    };
    var result = addRecord(data);
    assertEqual(result.status, 'success');
    assertTrue(result.recordId.length === 14, 'recordIdが14桁ではない: ' + result.recordId);

    var sheet = ss.getSheetByName(year);
    assertTrue(sheet !== null, '年シートが作成されていない');
    assertEqual(sheet.getLastRow(), 2);

    ss.deleteSheet(sheet);
  });

  test('getAllBrands: 追加した銘柄が一覧に含まれる', function() {
    var ss = SpreadsheetApp.openById(TEST_SS_ID);
    var year = '1902';
    var existing = ss.getSheetByName(year);
    if (existing) ss.deleteSheet(existing);

    addRecord({ brand: 'ブランドX', brewery: '蔵X', prefecture: '東京都', city: '港区', drankAt: year + '-01-01T00:00:00', note: '' });

    var result = getAllBrands();
    assertEqual(result.status, 'success');
    assertTrue(Array.isArray(result.brands));
    assertContains(result.brands, 'ブランドX');

    ss.deleteSheet(ss.getSheetByName(year));
  });
}

function testStatsService(test, assertEqual, assertTrue) {
  test('getStats: 存在しない年は totalCount=0 を返す', function() {
    var result = getStats('1800');
    assertEqual(result.status, 'success');
    assertEqual(result.totalCount, 0);
    assertEqual(result.weeklyAverage, 0);
    assertEqual(result.monthlyAverage, 0);
  });

  test('getStats: monthlyBreakdownが1〜12のキーを持つ', function() {
    var result = getStats('1800');
    for (var m = 1; m <= 12; m++) {
      if (!(String(m) in result.monthlyBreakdown)) {
        throw new Error('月' + m + 'のキーがない');
      }
    }
  });

  test('getStats: データ追加後にtotalCountが増える', function() {
    var ss = SpreadsheetApp.openById(TEST_SS_ID);
    var year = '1903';
    var existing = ss.getSheetByName(year);
    if (existing) ss.deleteSheet(existing);

    addRecord({ brand: '統計テスト酒', brewery: '統計蔵', prefecture: '大阪府', city: '大阪市', drankAt: year + '-03-15T12:00:00', note: '' });
    addRecord({ brand: '統計テスト酒2', brewery: '統計蔵2', prefecture: '京都府', city: '京都市', drankAt: year + '-05-20T18:00:00', note: '' });

    var result = getStats(year);
    assertEqual(result.totalCount, 2);
    assertEqual(result.uniqueBrands, 2);
    assertTrue(result.prefectureBreakdown['大阪府'] === 1);
    assertTrue(result.prefectureBreakdown['京都府'] === 1);

    ss.deleteSheet(ss.getSheetByName(year));
  });
}

function testQuizService(test, assertEqual, assertTrue, assertContains) {
  test('getQuizQuestion: データ不足時はinsufficient_dataを返す', function() {
    // TEST_SSに年シートがない、またはデータが少ない状態を想定
    // 既存のテストデータが少なければ自動でこのケースになる
    var ss = SpreadsheetApp.openById(TEST_SS_ID);
    var yearSheets = ss.getSheets().filter(function(s) { return /^\d{4}$/.test(s.getName()); });
    var totalRecords = 0;
    yearSheets.forEach(function(sheet) {
      totalRecords += Math.max(0, sheet.getLastRow() - 1);
    });
    if (totalRecords < 4) {
      var result = getQuizQuestion();
      assertEqual(result.status, 'insufficient_data');
    } else {
      Logger.log('[SKIP] データが4件以上あるためinsufficient_dataテストをスキップ');
    }
  });

  test('getQuizQuestion: データ十分時は正しい形式を返す', function() {
    var ss = SpreadsheetApp.openById(TEST_SS_ID);
    var year = '1904';
    var existing = ss.getSheetByName(year);
    if (existing) ss.deleteSheet(existing);

    var testData = [
      { brand: 'クイズ酒A', brewery: '蔵A', prefecture: '東京都', city: '渋谷区', drankAt: year + '-01-01T12:00:00', note: '' },
      { brand: 'クイズ酒B', brewery: '蔵B', prefecture: '大阪府', city: '大阪市', drankAt: year + '-02-01T12:00:00', note: '' },
      { brand: 'クイズ酒C', brewery: '蔵C', prefecture: '京都府', city: '京都市', drankAt: year + '-03-01T12:00:00', note: '' },
      { brand: 'クイズ酒D', brewery: '蔵D', prefecture: '新潟県', city: '新潟市', drankAt: year + '-04-01T12:00:00', note: '' }
    ];
    testData.forEach(function(d) { addRecord(d); });

    var result = getQuizQuestion();
    assertEqual(result.status, 'success');

    var q = result.question;
    assertTrue(q.type === 'brandToBrewery' || q.type === 'breweryToBrand', 'typeが不正: ' + q.type);
    assertTrue(typeof q.question === 'string' && q.question.length > 0, 'questionが空');
    assertTrue(typeof q.correct === 'string' && q.correct.length > 0, 'correctが空');
    assertEqual(q.choices.length, 4);
    assertContains(q.choices, q.correct);

    ss.deleteSheet(ss.getSheetByName(year));
  });
}
