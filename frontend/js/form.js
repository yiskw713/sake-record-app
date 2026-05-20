function validateForm(data) {
  const errors = [];

  if (!data.brand) {
    errors.push('銘柄名は必須です');
  } else if (data.brand.length > 50) {
    errors.push('銘柄名は50文字以内で入力してください');
  }

  if (!data.brewery) {
    errors.push('酒蔵名は必須です');
  } else if (data.brewery.length > 50) {
    errors.push('酒蔵名は50文字以内で入力してください');
  }

  if (!data.prefecture) {
    errors.push('都道府県は必須です');
  }

  if (!data.city) {
    errors.push('市町村は必須です');
  } else if (data.city.length > 50) {
    errors.push('市町村は50文字以内で入力してください');
  }

  if (!data.drankAt) {
    errors.push('飲んだ日時は必須です');
  } else if (new Date(data.drankAt) > new Date()) {
    errors.push('飲んだ日時は現在より過去の日時を入力してください');
  }

  if (data.note && data.note.length > 500) {
    errors.push('感想は500文字以内で入力してください');
  }

  return errors;
}

function generateRecordId(date) {
  const d = date instanceof Date ? date : new Date(date);
  const pad = n => String(n).padStart(2, '0');
  return (
    String(d.getFullYear()) +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    pad(d.getSeconds())
  );
}

if (typeof module !== 'undefined') {
  module.exports = { validateForm, generateRecordId };
}
