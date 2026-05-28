const NAME_KEYS = {
  az: ['nameAz', 'NameAz', 'name_az'],
  ru: ['nameRu', 'NameRu', 'name_ru'],
  en: ['nameEn', 'NameEn', 'name_en'],
};

const DESC_KEYS = {
  az: ['descriptionAz', 'DescriptionAz', 'description_az', 'cookingProcess', 'CookingProcess'],
  ru: ['descriptionRu', 'DescriptionRu', 'description_ru', 'cookingProcess', 'CookingProcess'],
  en: ['descriptionEn', 'DescriptionEn', 'description_en', 'cookingProcess', 'CookingProcess'],
};

function pickField(item, keys) {
  if (!item) return '';
  for (const key of keys) {
    const val = item[key];
    if (val != null && String(val).trim()) return String(val).trim();
  }
  return '';
}

export function qrCapitalizeFirstLetter(text) {
  const s = String(text || '').trim();
  if (!s) return '';
  return s.charAt(0).toLocaleUpperCase('az') + s.slice(1);
}

export function qrLocalizedName(item, lang = 'az') {
  const primary = pickField(item, NAME_KEYS[lang] || NAME_KEYS.az);
  if (primary) return primary;
  return (
    pickField(item, NAME_KEYS.az) ||
    pickField(item, NAME_KEYS.ru) ||
    pickField(item, NAME_KEYS.en) ||
    item?.name ||
    ''
  );
}

/** QR menyuda məhsul adı — bazada necə yazılıbsa, yalnız ilk hərf böyük. */
export function qrLocalizedProductName(product, lang = 'az') {
  return qrCapitalizeFirstLetter(qrLocalizedName(product, lang));
}

export function qrLocalizedDescription(item, lang = 'az') {
  const primary = pickField(item, DESC_KEYS[lang] || DESC_KEYS.az);
  if (primary) return primary;
  return (
    pickField(item, DESC_KEYS.az) ||
    pickField(item, DESC_KEYS.ru) ||
    pickField(item, DESC_KEYS.en) ||
    ''
  );
}

export function qrProductSearchHaystack(product) {
  const keys = [
    'nameAz',
    'nameRu',
    'nameEn',
    'NameAz',
    'NameRu',
    'NameEn',
    'name_az',
    'name_ru',
    'name_en',
  ];
  return keys
    .map((k) => product?.[k])
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export function qrCategorySearchHaystack(category) {
  const keys = [
    'nameAz',
    'nameRu',
    'nameEn',
    'NameAz',
    'NameRu',
    'NameEn',
    'name_az',
    'name_ru',
    'name_en',
  ];
  return keys
    .map((k) => category?.[k])
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}
