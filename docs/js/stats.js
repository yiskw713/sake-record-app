var monthlyChart = null;
var prefectureChart = null;
var breweryChart = null;

function loadStats(year) {
  var key = 'stats_session_' + (year || 'all');
  var cached = sessionStorage.getItem(key);
  if (cached) return Promise.resolve(JSON.parse(cached));

  var url = CONFIG.GAS_URL + '?action=getStats&token=' + encodeURIComponent(getToken());
  if (year) url += '&year=' + encodeURIComponent(year);

  return fetch(url)
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data.status === 'success') sessionStorage.setItem(key, JSON.stringify(data));
      return data;
    });
}

function renderSummary(data) {
  document.getElementById('stat-total').textContent = data.totalCount;
  document.getElementById('stat-brands').textContent = data.uniqueBrands;
  document.getElementById('stat-breweries').textContent = data.uniqueBreweries;
  document.getElementById('stat-weekly').textContent = data.weeklyAverage.toFixed(1);
  document.getElementById('stat-monthly').textContent = data.monthlyAverage.toFixed(1);
}

function renderMonthlyChart(monthlyBreakdown) {
  var labels = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
  var values = labels.map(function(_, i) { return monthlyBreakdown[i + 1] || 0; });

  if (monthlyChart) monthlyChart.destroy();

  var ctx = document.getElementById('monthly-chart').getContext('2d');
  monthlyChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: '杯数',
        data: values,
        backgroundColor: 'rgba(74, 124, 89, 0.7)',
        borderColor: 'rgba(74, 124, 89, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
    }
  });
}

function renderPrefectureChart(prefectureBreakdown) {
  var entries = Object.entries(prefectureBreakdown)
    .sort(function(a, b) { return b[1] - a[1]; })
    .slice(0, 10);

  var labels = entries.map(function(e) { return e[0]; });
  var values = entries.map(function(e) { return e[1]; });

  if (prefectureChart) prefectureChart.destroy();

  var ctx = document.getElementById('prefecture-chart').getContext('2d');
  prefectureChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: '杯数',
        data: values,
        backgroundColor: 'rgba(201, 168, 76, 0.7)',
        borderColor: 'rgba(201, 168, 76, 1)',
        borderWidth: 1
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } }
    }
  });
}

function renderBreweryChart(breweryBreakdown) {
  var entries = Object.entries(breweryBreakdown)
    .sort(function(a, b) { return b[1] - a[1]; })
    .slice(0, 10);

  var labels = entries.map(function(e) { return e[0]; });
  var values = entries.map(function(e) { return e[1]; });

  if (breweryChart) breweryChart.destroy();

  var ctx = document.getElementById('brewery-chart').getContext('2d');
  breweryChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: '杯数',
        data: values,
        backgroundColor: 'rgba(107, 155, 199, 0.7)',
        borderColor: 'rgba(107, 155, 199, 1)',
        borderWidth: 1
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } }
    }
  });
}

function updateStats(year) {
  document.getElementById('loading').classList.remove('hidden');

  loadStats(year || '')
    .then(function(data) {
      if (data.status !== 'success') throw new Error(data.message);
      renderSummary(data);
      renderMonthlyChart(data.monthlyBreakdown);
      renderPrefectureChart(data.prefectureBreakdown);
      renderBreweryChart(data.breweryBreakdown);
    })
    .catch(function(err) {
      alert('統計データの取得に失敗しました: ' + err.message);
    })
    .finally(function() {
      document.getElementById('loading').classList.add('hidden');
    });
}
