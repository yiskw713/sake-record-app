const { levenshtein, getSuggestions, getBrewerySuggestions } = require('../js/suggest');

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
});

const records = [
  { brand: '獺祭',           brewery: '旭酒造',  prefecture: '山口県', city: '岩国市' },
  { brand: '獺祭 純米大吟醸', brewery: '旭酒造',  prefecture: '山口県', city: '岩国市' },
  { brand: '純米大吟醸 獺祭', brewery: '旭酒造',  prefecture: '山口県', city: '岩国市' },
  { brand: '久保田',          brewery: '朝日酒造', prefecture: '新潟県', city: '長岡市' },
  { brand: '久保田 千寿',     brewery: '朝日酒造', prefecture: '新潟県', city: '長岡市' },
  { brand: '八海山',          brewery: '八海醸造', prefecture: '新潟県', city: '南魚沼市' },
];

describe('getSuggestions', () => {
  test('2文字未満の入力では空配列を返す', () => {
    expect(getSuggestions('獺', records)).toEqual([]);
    expect(getSuggestions('', records)).toEqual([]);
  });

  test('完全一致の場合はisExactMatch: trueを返す', () => {
    const results = getSuggestions('獺祭', records);
    const exact = results.find(r => r.brand === '獺祭');
    expect(exact).toBeDefined();
    expect(exact.isExactMatch).toBe(true);
  });

  test('トークンの順序が逆でも一致する（純米大吟醸 獺祭 ↔ 獺祭 純米大吟醸）', () => {
    const results = getSuggestions('純米大吟醸 獺祭', records);
    const brands = results.map(r => r.brand);
    expect(brands).toContain('獺祭 純米大吟醸');
    expect(brands).toContain('純米大吟醸 獺祭');
  });

  test('入力トークンが銘柄トークンに部分一致する場合も候補に出る', () => {
    const results = getSuggestions('獺祭', records);
    const brands = results.map(r => r.brand);
    expect(brands).toContain('獺祭');
    expect(brands).toContain('獺祭 純米大吟醸');
  });

  test('候補なしの場合は空配列を返す', () => {
    expect(getSuggestions('zzzzz', records)).toEqual([]);
  });

  test('最大3件まで返す', () => {
    const results = getSuggestions('獺祭', records);
    expect(results.length).toBeLessThanOrEqual(3);
  });

  test('結果にprefectureとcityが含まれる', () => {
    const results = getSuggestions('獺祭', records);
    expect(results[0]).toHaveProperty('prefecture');
    expect(results[0]).toHaveProperty('city');
  });
});

describe('getBrewerySuggestions', () => {
  test('2文字未満の入力では空配列を返す', () => {
    expect(getBrewerySuggestions('旭', records)).toEqual([]);
    expect(getBrewerySuggestions('', records)).toEqual([]);
  });

  test('類似する酒蔵名を返す', () => {
    const results = getBrewerySuggestions('旭酒造株式会社', records);
    expect(results.some(r => r.brewery === '旭酒造')).toBe(true);
  });

  test('完全一致は候補に含まれない（確認不要なため）', () => {
    const results = getBrewerySuggestions('旭酒造', records);
    expect(results.every(r => r.brewery !== '旭酒造')).toBe(true);
  });

  test('結果にprefectureとcityが含まれる', () => {
    const results = getBrewerySuggestions('旭酒造株式会社', records);
    if (results.length > 0) {
      expect(results[0]).toHaveProperty('prefecture');
      expect(results[0]).toHaveProperty('city');
    }
  });

  test('重複する酒蔵名はまとめられる', () => {
    const results = getBrewerySuggestions('旭酒造株式会社', records);
    const breweryNames = results.map(r => r.brewery);
    const unique = new Set(breweryNames);
    expect(breweryNames.length).toBe(unique.size);
  });

  test('最大3件まで返す', () => {
    const results = getBrewerySuggestions('酒造', records);
    expect(results.length).toBeLessThanOrEqual(3);
  });

  test('候補なしの場合は空配列を返す', () => {
    expect(getBrewerySuggestions('zzzzz', records)).toEqual([]);
  });
});
