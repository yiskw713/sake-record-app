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
  var seen = {};
  var records = [];

  sheets.forEach(function(sheet) {
    if (!/^\d{4}$/.test(sheet.getName())) return;
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) return;
    // B=銘柄名, C=酒蔵名, D=都道府県, E=市町村
    var values = sheet.getRange(2, 2, lastRow - 1, 4).getValues();
    values.forEach(function(row) {
      var brand = row[0], brewery = row[1], prefecture = row[2], city = row[3];
      if (!brand || !brewery) return;
      var key = brand + '|' + brewery;
      if (!seen[key]) {
        seen[key] = true;
        records.push({ brand: brand, brewery: brewery, prefecture: prefecture, city: city });
      }
    });
  });

  records.sort(function(a, b) {
    return a.brand < b.brand ? -1 : a.brand > b.brand ? 1 : 0;
  });

  return { status: 'success', records: records };
}
