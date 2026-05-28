export const QR_LANGS = [
  { code: 'az', label: 'Azərbaycan', flag: '🇦🇿' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
];

const dict = {
  az: {
    enterMenu: 'Menuya daxil ol',
    enterMenuHint: 'Məhsullar və qiymətlər',
    wifiConnect: 'Wi-Fi qoşul',
    changeLang: 'Dili dəyiş',
    general: 'Ümumi',
    feedback: 'Geri bildirim',
    workingHours: 'İş saatları',
    colorMode: 'Rəng modu',
    dark: 'Tünd',
    light: 'İşıqlı',
    closedNow: 'Hazırda bağlıdır',
    openNow: 'Açıqdır',
    wifiTitle: 'Wi-Fi qoşul',
    wifiScanHint: 'QR kodu skan edin və ya şifrəni əl ilə kopyalayın',
    name: 'Ad',
    password: 'Şifrə',
    copied: 'Kopyalandı',
    languageTitle: 'Dili seçin',
    hoursTitle: 'İş saatları',
    navBusiness: 'Restoran',
    navMenu: 'Menyu',
    social: 'Sosial şəbəkə',
    call: 'Zəng et',
    whatsapp: 'WhatsApp',
    location: 'Ünvan',
    addressLoading: 'Ünvan yüklənir…',
    mapMissing: 'Xəritə əlavə edilməyib',
    notFound: 'Restoran tapılmadı',
    loading: 'Yüklənir…',
    serviceFeeLabel: 'Xidmət haqqı',
    search: 'Axtarış',
    searchPlaceholder: 'Məhsulun adını yazın...',
    searchHint: 'Axtarış üçün bir şey yazın',
    productNotFound: 'Məhsul tapılmadı',
    poweredBy: 'Powered by',
  },
  ru: {
    enterMenu: 'Меню Вход',
    enterMenuHint: 'Блюда и цены',
    wifiConnect: 'Подключить Wi-Fi',
    changeLang: 'Сменить язык',
    general: 'Общее',
    feedback: 'Обратная связь',
    workingHours: 'Часы работы',
    colorMode: 'Цветовая тема',
    dark: 'Тёмная',
    light: 'Светлая',
    closedNow: 'Сейчас закрыто',
    openNow: 'Открыто',
    wifiTitle: 'Подключение Wi-Fi',
    wifiScanHint: 'Отсканируйте QR или скопируйте пароль вручную',
    name: 'Имя',
    password: 'Пароль',
    copied: 'Скопировано',
    languageTitle: 'Выберите язык',
    hoursTitle: 'Часы работы',
    navBusiness: 'Ресторан',
    navMenu: 'Меню',
    social: 'Соцсети',
    call: 'Позвонить',
    whatsapp: 'WhatsApp',
    location: 'Адрес',
    addressLoading: 'Адрес загружается…',
    mapMissing: 'Карта не добавлена',
    notFound: 'Ресторан не найден',
    loading: 'Загрузка…',
    serviceFeeLabel: 'Сервисный сбор',
    search: 'Поиск',
    searchPlaceholder: 'Введите название блюда...',
    searchHint: 'Введите запрос для поиска',
    productNotFound: 'Блюдо не найдено',
    poweredBy: 'Powered by',
  },
  en: {
    enterMenu: 'Open Menu',
    enterMenuHint: 'Dishes & prices',
    wifiConnect: 'Connect Wi-Fi',
    changeLang: 'Change language',
    general: 'General',
    feedback: 'Feedback',
    workingHours: 'Working hours',
    colorMode: 'Color mode',
    dark: 'Dark',
    light: 'Light',
    closedNow: 'Currently closed',
    openNow: 'Open now',
    wifiTitle: 'Connect to Wi-Fi',
    wifiScanHint: 'Scan the QR code or copy the password manually',
    name: 'Name',
    password: 'Password',
    copied: 'Copied',
    languageTitle: 'Choose language',
    hoursTitle: 'Working hours',
    navBusiness: 'Restaurant',
    navMenu: 'Menu',
    social: 'Social',
    call: 'Call',
    whatsapp: 'WhatsApp',
    location: 'Location',
    addressLoading: 'Loading address…',
    mapMissing: 'Map not configured',
    notFound: 'Restaurant not found',
    loading: 'Loading…',
    serviceFeeLabel: 'Service charge',
    search: 'Search',
    searchPlaceholder: 'Type a product name...',
    searchHint: 'Type to search products',
    productNotFound: 'Product not found',
    poweredBy: 'Powered by',
  },
};

export function qrT(lang, key) {
  const code = dict[lang] ? lang : 'az';
  return dict[code][key] ?? dict.az[key] ?? key;
}

export function qrLangStorageKey(slug) {
  return `qr_lang_${slug || 'default'}`;
}

export function readQrLang(slug) {
  try {
    const v = localStorage.getItem(qrLangStorageKey(slug));
    if (v && dict[v]) return v;
  } catch {
    /* */
  }
  return 'az';
}

export function writeQrLang(slug, lang) {
  try {
    localStorage.setItem(qrLangStorageKey(slug), lang);
  } catch {
    /* */
  }
}

/** settings.workingHours → həftənin günləri */
export function parseWorkingHoursSchedule(raw) {
  const fallback = String(raw || '09:00 - 23:00').trim() || '09:00 - 23:00';
  const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  const dayLabels = {
    az: ['Bazar ertəsi', 'Çərşənbə axşamı', 'Çərşənbə', 'Cümə axşamı', 'Cümə', 'Şənbə', 'Bazar'],
    ru: ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'],
    en: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  };
  const jsDay = new Date().getDay();
  const todayIdx = jsDay === 0 ? 6 : jsDay - 1;

  return dayKeys.map((key, idx) => ({
    key,
    label: dayLabels,
    idx,
    hours: fallback,
    isToday: idx === todayIdx,
  }));
}

export function dayLabelForLang(lang, idx) {
  const labels = {
    az: ['Bazar ertəsi', 'Çərşənbə axşamı', 'Çərşənbə', 'Cümə axşamı', 'Cümə', 'Şənbə', 'Bazar'],
    ru: ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'],
    en: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  };
  const code = labels[lang] ? lang : 'az';
  return labels[code][idx] ?? labels.az[idx];
}

export function isLikelyOpenNow(hoursStr) {
  const s = String(hoursStr || '').trim();
  const m = s.match(/(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})/);
  if (!m) return true;
  const toMin = (t) => {
    const [h, min] = t.split(':').map(Number);
    return h * 60 + min;
  };
  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  const a = toMin(m[1]);
  const b = toMin(m[2]);
  if (a <= b) return cur >= a && cur <= b;
  return cur >= a || cur <= b;
}

export function wifiQrPayload(ssid, password) {
  const esc = (v) => String(v || '').replace(/([\\;,":])/g, '\\$1');
  return `WIFI:T:WPA;S:${esc(ssid)};P:${esc(password)};;`;
}
