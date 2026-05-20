const { validateForm, generateRecordId } = require('../js/form');

const validData = {
  brand: '獺祭',
  brewery: '旭酒造',
  prefecture: '山口県',
  city: '岩国市',
  drankAt: '2026-01-01T12:00:00',
  note: 'フルーティで飲みやすい',
};

describe('validateForm', () => {
  test('全必須フィールドが正常値ならエラーなし', () => {
    expect(validateForm(validData)).toEqual([]);
  });

  test('銘柄名が空ならエラー', () => {
    const errors = validateForm({ ...validData, brand: '' });
    expect(errors).toContain('銘柄名は必須です');
  });

  test('銘柄名が51文字以上ならエラー', () => {
    const errors = validateForm({ ...validData, brand: 'あ'.repeat(51) });
    expect(errors).toContain('銘柄名は50文字以内で入力してください');
  });

  test('銘柄名が50文字はOK', () => {
    const errors = validateForm({ ...validData, brand: 'あ'.repeat(50) });
    expect(errors).not.toContain('銘柄名は50文字以内で入力してください');
  });

  test('酒蔵名が空ならエラー', () => {
    const errors = validateForm({ ...validData, brewery: '' });
    expect(errors).toContain('酒蔵名は必須です');
  });

  test('酒蔵名が51文字以上ならエラー', () => {
    const errors = validateForm({ ...validData, brewery: 'あ'.repeat(51) });
    expect(errors).toContain('酒蔵名は50文字以内で入力してください');
  });

  test('都道府県が未選択ならエラー', () => {
    const errors = validateForm({ ...validData, prefecture: '' });
    expect(errors).toContain('都道府県は必須です');
  });

  test('市町村が空ならエラー', () => {
    const errors = validateForm({ ...validData, city: '' });
    expect(errors).toContain('市町村は必須です');
  });

  test('市町村が51文字以上ならエラー', () => {
    const errors = validateForm({ ...validData, city: 'あ'.repeat(51) });
    expect(errors).toContain('市町村は50文字以内で入力してください');
  });

  test('飲んだ日時が空ならエラー', () => {
    const errors = validateForm({ ...validData, drankAt: '' });
    expect(errors).toContain('飲んだ日時は必須です');
  });

  test('飲んだ日時が未来ならエラー', () => {
    const future = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const errors = validateForm({ ...validData, drankAt: future });
    expect(errors).toContain('飲んだ日時は現在より過去の日時を入力してください');
  });

  test('感想が501文字以上ならエラー', () => {
    const errors = validateForm({ ...validData, note: 'あ'.repeat(501) });
    expect(errors).toContain('感想は500文字以内で入力してください');
  });

  test('感想が500文字はOK', () => {
    const errors = validateForm({ ...validData, note: 'あ'.repeat(500) });
    expect(errors).not.toContain('感想は500文字以内で入力してください');
  });

  test('感想が空（任意）はOK', () => {
    const errors = validateForm({ ...validData, note: '' });
    expect(errors).toEqual([]);
  });

  test('複数エラーを同時に返す', () => {
    const errors = validateForm({ brand: '', brewery: '', prefecture: '', city: '', drankAt: '', note: '' });
    expect(errors.length).toBeGreaterThan(1);
  });
});

describe('generateRecordId', () => {
  test('14桁の文字列を返す', () => {
    const id = generateRecordId(new Date('2026-05-19T14:30:22+09:00'));
    expect(id).toHaveLength(14);
  });

  test('数字のみで構成される', () => {
    const id = generateRecordId(new Date());
    expect(/^\d{14}$/.test(id)).toBe(true);
  });

  test('YYYYMMDDHHmmss形式になっている', () => {
    const date = new Date('2026-05-19T14:30:22.000Z');
    const id = generateRecordId(date);
    expect(id).toMatch(/^\d{4}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{6}$/);
  });
});
