function getStats(year) {
  var cacheKey = 'stats_cache_' + (year || 'all');
  var tsKey    = 'stats_ts_'    + (year || 'all');
  var props    = PropertiesService.getScriptProperties();

  var cached = props.getProperty(cacheKey);
  var ts     = props.getProperty(tsKey);
  if (cached && ts && (Date.now() - parseInt(ts, 10)) < 86400000) {
    return JSON.parse(cached);
  }

  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var allSheets = ss.getSheets().filter(function(s) {
    return /^\d{4}$/.test(s.getName());
  });

  var targetSheets = year
    ? allSheets.filter(function(s) { return s.getName() === year; })
    : allSheets;

  var records = [];
  targetSheets.forEach(function(sheet) {
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) return;
    var values = sheet.getRange(2, 1, lastRow - 1, 8).getValues();
    values.forEach(function(row) {
      records.push({
        brand: row[1],
        brewery: row[2],
        prefecture: row[3],
        drankAt: row[5]
      });
    });
  });

  var totalCount = records.length;
  var uniqueBrands = Object.keys(records.reduce(function(acc, r) {
    if (r.brand) acc[r.brand] = true;
    return acc;
  }, {})).length;
  var uniqueBreweries = Object.keys(records.reduce(function(acc, r) {
    if (r.brewery) acc[r.brewery] = true;
    return acc;
  }, {})).length;

  var monthlyBreakdown = {};
  for (var m = 1; m <= 12; m++) monthlyBreakdown[m] = 0;

  var prefectureBreakdown = {};
  var breweryBreakdown = {};

  records.forEach(function(r) {
    var d = new Date(r.drankAt);
    if (!isNaN(d)) {
      var month = d.getMonth() + 1;
      monthlyBreakdown[month] = (monthlyBreakdown[month] || 0) + 1;
    }
    if (r.prefecture) {
      prefectureBreakdown[r.prefecture] = (prefectureBreakdown[r.prefecture] || 0) + 1;
    }
    if (r.brewery) {
      breweryBreakdown[r.brewery] = (breweryBreakdown[r.brewery] || 0) + 1;
    }
  });

  var now = new Date();
  var weeklyAverage = 0;
  var monthlyAverage = 0;
  var yearlyProjection = null;

  if (totalCount > 0) {
    var startYear = year
      ? parseInt(year)
      : Math.min.apply(null, allSheets.map(function(s) { return parseInt(s.getName()); }));
    var startDate = new Date(startYear + '-01-01');
    var weeksElapsed = Math.max(1, Math.ceil((now - startDate) / (7 * 24 * 60 * 60 * 1000)));
    var monthsElapsed = year
      ? (parseInt(year) < now.getFullYear() ? 12 : now.getMonth() + 1)
      : (now.getMonth() + 1);

    weeklyAverage = Math.round((totalCount / weeksElapsed) * 10) / 10;
    monthlyAverage = Math.round((totalCount / monthsElapsed) * 10) / 10;
  }

  var currentYear = now.getFullYear();
  var dayOfYear = Math.floor((now - new Date(currentYear + '-01-01')) / (24 * 60 * 60 * 1000)) + 1;

  if (!year) {
    // 全期間: 今年の実績ペースから年末を予測
    var currentYearCount = records.filter(function(r) {
      return new Date(r.drankAt).getFullYear() === currentYear;
    }).length;
    if (currentYearCount > 0) {
      yearlyProjection = Math.round(currentYearCount / dayOfYear * 365);
    }
  } else if (parseInt(year) === currentYear) {
    // 今年を選択中: そのまま予測
    if (totalCount > 0) {
      yearlyProjection = Math.round(totalCount / dayOfYear * 365);
    }
  }

  var result = {
    status: 'success',
    year: year || 'all',
    totalCount: totalCount,
    uniqueBrands: uniqueBrands,
    uniqueBreweries: uniqueBreweries,
    weeklyAverage: weeklyAverage,
    monthlyAverage: monthlyAverage,
    yearlyProjection: yearlyProjection,
    prefectureBreakdown: prefectureBreakdown,
    breweryBreakdown: breweryBreakdown,
    monthlyBreakdown: monthlyBreakdown
  };

  try {
    props.setProperty(cacheKey, JSON.stringify(result));
    props.setProperty(tsKey, String(Date.now()));
  } catch (e) {}

  return result;
}
