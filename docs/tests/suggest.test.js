const { levenshtein, getSuggestions } = require('../js/suggest');

describe('levenshtein', () => {
  test('同一文字列は距離0', () => {
    expect(levenshtein('獺祭', '獺祭')).toBe(0);
  });

  test('空文字列と文字列の距離は文字列の長さ', () => {
    expect(levenshtein('', '獺祭')).toBe(2);
    expect(levenshtein('獺祭', '')).toBe(2);
  });

  test('1文字違いは距離1（置換）', () => {
    expect(levenshtein('abc', 'axc')).toBe(1);
  });

  test('1文字追加は距離1（挿入）', () => {
    expect(levenshtein('abc', 'abcd')).toBe(1);
  });

  test('1文字削除は距離1（削除）', () => {
    expect(levenshtein('abcd', 'abc')).toBe(1);
  });

  test('完全に異なる文字列', () => {
    expect(levenshtein('abc', 'xyz')).toBe(3);
  });

  test('実際の日本酒銘柄の類似度', () => {
    expect(levenshtein('獺祭', '獺祭二割三分')).toBe(4);
    expect(levenshtein('久保田', '久保田千寿')).toBe(2);
  });
});

describe('getSuggestions', () => {
  const brands = ['獺祭', '久保田', '八海山', '黒龍', '田酒', '久保田千寿'];

  test('2文字未満の入力では空配列を返す', () => {
    expect(getSuggestions('獺', brands)).toEqual([]);
    expect(getSuggestions('', brands)).toEqual([]);
  });

  test('完全一致の場合はisExactMatch: trueを返す', () => {
    const results = getSuggestions('獺祭', brands);
    const exact = results.find(r => r.brand === '獺祭');
    expect(exact).toBeDefined();
    expect(exact.isExactMatch).toBe(true);
  });

  test('距離≤2の候補を返す', () => {
    const results = getSuggestions('久保田', brands);
    expect(results.some(r => r.brand === '久保田')).toBe(true);
    expect(results.some(r => r.brand === '久保田千寿')).toBe(true);
  });

  test('最大3件まで返す', () => {
    const manyBrands = ['ab', 'ac', 'ad', 'ae', 'af'];
    const results = getSuggestions('ab', manyBrands);
    expect(results.length).toBeLessThanOrEqual(3);
  });

  test('候補なしの場合は空配列を返す', () => {
    const results = getSuggestions('zzz', brands);
    expect(results).toEqual([]);
  });

  test('距離が小さい順に並んでいる', () => {
    const results = getSuggestions('久保田', brands);
    for (let i = 1; i < results.length; i++) {
      expect(results[i].distance).toBeGreaterThanOrEqual(results[i - 1].distance);
    }
  });
});
