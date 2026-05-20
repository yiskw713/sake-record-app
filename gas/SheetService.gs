var SPREADSHEET_ID = '1Fdid2kiPRfNKnl7JmcsVMC2iE9yI2vxjtAFTbyK27FQ';

function getOrCreateSheet(year) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(year);
  if (!sheet) {
    sheet = ss.insertSheet(year);
    sheet.appendRow(['記録ID', '銘柄名', '酒蔵名', '都道府県', '市町村', '飲んだ日時', '感想', '登録日時']);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function addRecord(data) {
  var drankAt = new Date(data.drankAt);
  var year = String(drankAt.getFullYear());
  var sheet = getOrCreateSheet(year);

  var now = new Date();
  var recordId = Utilities.formatDate(now, 'Asia/Tokyo', 'yyyyMMddHHmmss');

  sheet.appendRow([
    recordId,
    data.brand,
    data.brewery,
    data.prefecture,
    data.city,
    data.drankAt,
    data.note || '',
    now.toISOString()
  ]);

  return { status: 'success', recordId: recordId };
}

function getAllBrands() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheets = ss.getSheets();
  var brands = {};

  sheets.forEach(function(sheet) {
    if (!/^\d{4}$/.test(sheet.getName())) return;
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) return;
    var values = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
    values.forEach(function(row) {
      if (row[0]) brands[row[0]] = true;
    });
  });

  return { status: 'success', brands: Object.keys(brands).sort() };
}
