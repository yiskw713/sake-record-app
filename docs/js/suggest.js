function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

// records: [{brand, brewery, prefecture, city}, ...]
// breweryFilter: 酒蔵名で絞り込む（省略可）
function getSuggestions(input, records, breweryFilter) {
  if (input.length < 2) return [];

  const pool = (breweryFilter && breweryFilter.trim())
    ? records.filter(r => r.brewery === breweryFilter.trim())
    : records;

  const inputTrimmed = input.trim();
  const inputTokens = inputTrimmed.split(/\s+/).filter(Boolean);
  const inputSet = new Set(inputTokens);

  return pool
    .map(r => {
      const brand = r.brand;
      const brandTokens = brand.split(/\s+/).filter(Boolean);
      const brandSet = new Set(brandTokens);

      // Levenshtein（文字列全体）
      const dist = levenshtein(inputTrimmed, brand);

      // トークン完全一致スコア（順序不問）
      const exactMatches = [...inputSet].filter(t => brandSet.has(t)).length;
      const unionSize = new Set([...inputSet, ...brandSet]).size;
      const tokenScore = unionSize > 0 ? exactMatches / unionSize : 0;

      // サブストリング一致（入力トークンが銘柄トークンに含まれるか）
      const hasSubstringMatch = inputTokens.some(it =>
        it.length >= 2 && brandTokens.some(bt => bt.includes(it))
      );

      const show = dist <= 2 || tokenScore > 0 || hasSubstringMatch;
      const isExactMatch = dist === 0;

      return {
        brand,
        brewery: r.brewery,
        prefecture: r.prefecture,
        city: r.city,
        distance: dist,
        tokenScore,
        isExactMatch,
        show,
      };
    })
    .filter(item => item.show)
    .sort((a, b) => {
      // 完全一致を最優先
      if (b.isExactMatch !== a.isExactMatch) return a.isExactMatch ? -1 : 1;
      // トークンスコアが高い順
      if (b.tokenScore !== a.tokenScore) return b.tokenScore - a.tokenScore;
      // Levenshtein距離が小さい順
      return a.distance - b.distance;
    })
    .slice(0, 3);
}

if (typeof module !== 'undefined') {
  module.exports = { levenshtein, getSuggestions };
}
