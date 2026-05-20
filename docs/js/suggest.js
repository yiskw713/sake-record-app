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

function getSuggestions(input, brands) {
  if (input.length < 2) return [];

  const candidates = brands
    .map(brand => ({ brand, distance: levenshtein(input, brand) }))
    .filter(({ distance }) => distance <= 2)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3)
    .map(item => ({ ...item, isExactMatch: item.distance === 0 }));

  return candidates;
}

if (typeof module !== 'undefined') {
  module.exports = { levenshtein, getSuggestions };
}
