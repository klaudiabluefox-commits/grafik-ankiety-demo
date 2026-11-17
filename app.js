
/* GRAFIK — ANKIETA 2.4 */
const $ = id => document.getElementById(id);

const STATUSES = {
  etat: [
    ['morning', '🌅 Praca rano'],
    ['afternoon', '🌇 Praca po południu'],
    ['work12h', '🕒 Praca cały dzień (12 h)'],
    ['unavailable', '🚫 Nie mogę'],
    ['preferred', '📅 Sobota'],
    ['dayoff', '🏖️ Dzień wolny'],
    ['leave', '🌴 Urlop']
  ],
  zlecenie: [
    ['available', 'Dostępny/a'],
    ['limited', 'Ograniczone godziny'],
    ['preferred', 'Preferowana sobota'],
    ['unavailable', 'Nie mogę'],
    ['leave', 'Urlop']
  ]
};

const LABELS = {
  morning: 'Rano',
  afternoon: 'Po południu',
  work12h: '12 h',
  unavailable: 'Nie mogę',
  preferred: 'Sobota',
  dayoff: 'Dzień wolny',
  leave: 'Urlop',
  available: 'Dostępność',
  limited: 'Godziny'
};

const WEEKDAYS = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];
const HOUR_STATUSES = ['available', 'limited', 'preferred'];

let view = new Date();
view.setDate(1);
view.setMonth(view.getMonth() + 1);

let chosen = new Set();
let editingDate = null;
const saved = {};

const employment = () => $('employment').value;
const isEtat = () => employment() === 'etat';
const monthKey = () =>
  `${view.getFullYear()}-${String(view.getMonth() + 1).padStart(2, '0')}`;
const dateFor = day =>
  `${monthKey()}-${String(day).padStart(2, '0')}`;
const daysInMonth = () =>
  new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();

function easterSunday(year) {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100;
  const d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k + 7) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = (h + l - 7 * m + 114) % 31 + 1;
  return new Date(year, month - 1, day, 12);
}

function holidayName(iso) {
  const [year, month, day] = iso.split('-').map(Number);
  const md = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const fixed = {
    '01-01': 'Nowy Rok',
    '01-06': 'Trzech Króli',
    '05-01': 'Święto Pracy',
    '05-03': 'Święto Konstytucji',
    '08-15': 'Wniebowzięcie NMP',
    '11-01': 'Wszystkich Świętych',
    '11-11': 'Święto Niepodległości',
    '12-25': 'Boże Narodzenie',
    '12-26': 'Drugi dzień świąt'
  };

  if (year >= 2025) fixed['12-24'] = 'Wigilia';
  if (fixed[md]) return fixed[md];

  const easter = easterSunday(year);
  const date = new Date(year, month - 1, day, 12);
  const offset = Math.round((date - easter) / 86400000);

  return ({
    0: 'Wielkanoc',
    1: 'Poniedziałek Wielkanocny',
    49: 'Zielone Świątki',
    60: 'Boże Ciało'
  })[offset] || '';
}

const isHoliday = date => Boolean(holidayName(date));
const isSaturday = date => new Date(date + 'T12:00:00').getDay() === 6;

function allowedStatuses() {
  return STATUSES[employment()].map(x => x[0]);
}

function updateEmployment() {
  const etat = isEtat();
  $('etatFields').classList.toggle('hidden', !etat);
  $('zlecenieFields').classList.toggle('hidden', etat);
  $('shiftPreferenceHint').classList.toggle('hidden', !etat);
  $('dayOffInfo').classList.add('hidden');

  $('employmentHelp').textContent = etat
    ? 'Wskaż preferowane zmiany, soboty, dni wolne i urlopy. Godziny ustala koordynator.'
    : 'Wskaż dostępne dni i godziny pracy.';

  const previous = $('statusV2').value;
  $('statusV2').replaceChildren();

  for (const [value, label] of STATUSES[employment()]) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    $('statusV2').append(option);
  }

  if (allowedStatuses().includes(previous)) {
    $('statusV2').value = previous;
  }

  for (const date of Object.keys(saved)) {
    if (!allowedStatuses().includes(saved[date].status)) {
      delete saved[date];
    } else if (etat) {
      saved[date].start = '';
      saved[date].end = '';
    }
  }

  editingDate = null;
  syncHours();
  render();
}

function syncHours() {
  const st = $('statusV2').value;
  const show = !isEtat() && HOUR_STATUSES.includes(st);
  $('hoursFieldsV2').classList.toggle('hidden', !show);
  document.querySelector('.selection')?.classList.toggle('hidden', isEtat());
  $('dayEditor').classList.add('hidden');
}

function render() {
  $('monthTitle').textContent = view.toLocaleDateString('pl-PL', {
    month: 'long',
    year: 'numeric'
  });

  const cal = $('calendar');
  cal.replaceChildren();

  for (const name of WEEKDAYS) {
    const el = document.createElement('div');
    el.className = 'dayname';
    el.textContent = name;
    cal.append(el);
  }

  const first = new Date(view.getFullYear(), view.getMonth(), 1);
  for (let i = 0; i < (first.getDay() + 6) % 7; i++) {
    const blank = document.createElement('div');
    blank.className = 'blank';
    cal.append(blank);
  }

  for (let n = 1; n <= daysInMonth(); n++) {
    const date = dateFor(n);
    const holiday = holidayName(date);
    const entry = holiday ? null : saved[date];

    const tile = document.createElement('div');
    tile.className = 'day-tile';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'day'
      + (holiday ? ' holiday' : '')
      + (entry ? ' ' + entry.status : '')
      + (chosen.has(date) ? ' marked' : '');

    btn.setAttribute('aria-label', date + (holiday ? ' — ' + holiday : ''));

    const number = document.createElement('span');
    number.textContent = n;
    btn.append(number);

    if (holiday) {
      btn.disabled = true;
      btn.title = holiday;
      const small = document.createElement('small');
      small.textContent = 'ŚWIĘTO';
      btn.append(small);
    }

    if (entry) {
      const small = document.createElement('small');
      small.textContent = LABELS[entry.status] || entry.status;
      btn.append(small);

      if (entry.start && entry.end) {
        const hours = document.createElement('span');
        hours.className = 'day-hours';
        hours.textContent = entry.start + '–' + entry.end;
        btn.append(hours);
      }
    }

    btn.onclick = () => {
      if (holiday) return;
      chosen.has(date) ? chosen.delete(date) : chosen.add(date);
      render();
    };

    tile.append(btn);

    if (entry && !isEtat() && HOUR_STATUSES.includes(entry.status)) {
      const edit = document.createElement('button');
      edit.type = 'button';
      edit.className = 'day-edit';
      edit.textContent = '✎';
      edit.title = 'Zmień godziny';
      edit.onclick = () => {
        editingDate = date;
        renderDayEditor();
      };
      tile.append(edit);
    }

    cal.append(tile);
  }

  $('selectionTitle').textContent = `Wybrano ${chosen.size} dni`;
  renderDayEditor();
  updateSummary();
}

function renderDayEditor() {
  const entry = editingDate && saved[editingDate];
  const visible = !isEtat() && entry
    && editingDate.startsWith(monthKey())
    && HOUR_STATUSES.includes(entry.status);

  $('dayEditor').classList.toggle('hidden', !visible);
  if (!visible) return;

  $('editingDate').textContent = editingDate;
  $('editStart').value = entry.start || '07:00';
  $('editEnd').value = entry.end || '15:00';
}

function updateSummary() {
  const rows = Object.entries(saved).filter(([date, entry]) =>
    date.startsWith(monthKey()) &&
    !isHoliday(date) &&
    entry.start && entry.end && entry.end > entry.start
  );

  let minutes = 0;
  for (const [, entry] of rows) {
    const [sh, sm] = entry.start.split(':').map(Number);
    const [eh, em] = entry.end.split(':').map(Number);
    minutes += eh * 60 + em - sh * 60 - sm;
  }

  const format = m => `${(m / 60).toLocaleString('pl-PL', {
    maximumFractionDigits: 2
  })} h`;

  $('summaryDays').textContent = rows.length;
  $('summaryHours').textContent = format(minutes);
  $('summaryAvg').textContent = format(rows.length ? minutes / rows.length : 0);

  $('summaryInfo').textContent = isEtat()
    ? 'Etat: oznaczenia są preferencjami. Nie stanowią zatwierdzonego grafiku.'
    : 'Podsumowanie dotyczy zadeklarowanych godzin, nie zatwierdzonego grafiku.';
}

function selectAll(filter) {
  chosen = new Set(
    Array.from({ length: daysInMonth() }, (_, i) => dateFor(i + 1))
      .filter(date => !isHoliday(date) && filter(date))
  );
  render();
}

function applySelected() {
  if (!chosen.size) {
    alert('Najpierw zaznacz dni w kalendarzu.');
    return;
  }

  const st = $('statusV2').value;

  if (!allowedStatuses().includes(st)) {
    alert('Nieprawidłowy status dla rodzaju zatrudnienia.');
    return;
  }

  if (st === 'preferred' && [...chosen].some(date => !isSaturday(date))) {
    alert('Status Sobota można przypisać wyłącznie sobotom.');
    return;
  }

  const hasHours = !isEtat() && HOUR_STATUSES.includes(st);
  const start = hasHours ? $('startV2').value : '';
  const end = hasHours ? $('endV2').value : '';

  if (hasHours && (!start || !end || start >= end)) {
    alert('Sprawdź godziny rozpoczęcia i zakończenia.');
    return;
  }

  for (const date of chosen) {
    if (isHoliday(date)) continue;
    saved[date] = { status: st, start, end };
  }

  chosen.clear();
  editingDate = null;
  render();
}

function clearMonth() {
  if (!confirm('Wyczyścić wszystkie oznaczenia bieżącego miesiąca?')) return;

  for (const date of Object.keys(saved)) {
    if (date.startsWith(monthKey())) delete saved[date];
  }

  chosen.clear();
  editingDate = null;
  render();
}

function copyPrevious() {
  const prev = new Date(view.getFullYear(), view.getMonth() - 1, 1);
  const prefix = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`;
  let copied = 0;

  for (let n = 1; n <= daysInMonth(); n++) {
    const date = dateFor(n);
    const oldDate = `${prefix}-${String(n).padStart(2, '0')}`;
    const entry = saved[oldDate];

    if (!entry || isHoliday(date)) continue;
    if (!allowedStatuses().includes(entry.status)) continue;
    if (entry.status === 'preferred' && !isSaturday(date)) continue;

    saved[date] = { ...entry };
    copied++;
  }

  $('message').textContent = copied
    ? `Skopiowano ${copied} dni. Sprawdź oznaczenia i weekendy.`
    : 'Brak danych poprzedniego miesiąca w bieżącej sesji.';

  chosen.clear();
  render();
}

function applyLegacyHours() {
  if (isEtat()) return;
  if (!chosen.size) return alert('Najpierw zaznacz dni.');

  const start = $('start').value;
  const end = $('end').value;

  if (!start || !end || start >= end) return alert('Sprawdź godziny.');

  for (const date of chosen) {
    if (isHoliday(date)) continue;
    saved[date] = { status: 'limited', start, end };
  }

  chosen.clear();
  render();
}

function sendSurvey() {
  const employee = $('employee').value.trim().replace(/\s+/g, ' ');
  const role = $('role').value;
  const days = Object.entries(saved)
    .filter(([date]) => date.startsWith(monthKey()) && !isHoliday(date))
    .sort((a, b) => a[0].localeCompare(b[0]));

  const message = text => { $('message').textContent = text; };

  if (employee.length < 3 || employee.length > 100) {
    return message('Podaj imię i nazwisko (3–100 znaków).');
  }
  if (!role) {
    $('role').focus();
    return message('Wybierz stanowisko.');
  }
  if (!days.length) return message('Zaznacz przynajmniej jeden dzień.');

  if (days.some(([, entry]) => !allowedStatuses().includes(entry.status))) {
    return message('Niektóre oznaczenia nie pasują do rodzaju zatrudnienia.');
  }

  if (!window.GRAFIK_APPS_SCRIPT_URL ||
      !/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/.test(window.GRAFIK_APPS_SCRIPT_URL)) {
    return message('Nieprawidłowy adres Apps Script w config.js.');
  }

  const payload = {
    employee,
    role,
    employment: employment(),
    month: monthKey(),
    note: $('note').value,
    days: days.map(([date, entry]) => ({
      date,
      status: entry.status,
      start: entry.start || '',
      end: entry.end || ''
    }))
  };

  $('uploadForm').action = window.GRAFIK_APPS_SCRIPT_URL;
  $('uploadPayload').value = JSON.stringify(payload);

  const button = $('send');
  const frame = $('uploadFrame');
  button.disabled = true;
  message('Wysyłanie ankiety…');

  let finished = false;
  let timeout;

  const onLoad = () => {
    if (finished) return;
    finished = true;
    clearTimeout(timeout);
    frame.removeEventListener('load', onLoad);
    button.disabled = false;
    message('Żądanie wysłano. Sprawdź nowy plik CSV w odpowiednim folderze Google Drive. Samo załadowanie odpowiedzi nie potwierdza zapisu.');
  };

  frame.addEventListener('load', onLoad);
  $('uploadForm').submit();

  timeout = setTimeout(() => {
    if (finished) return;
    finished = true;
    frame.removeEventListener('load', onLoad);
    button.disabled = false;
    message('Nie udało się potwierdzić wysyłki. Sprawdź Google Drive i dziennik Apps Script przed ponowną próbą.');
  }, 15000);
}

/* Przyciski kalendarza */
$('prev').onclick = () => {
  view.setMonth(view.getMonth() - 1);
  chosen.clear();
  editingDate = null;
  render();
};

$('next').onclick = () => {
  view.setMonth(view.getMonth() + 1);
  chosen.clear();
  editingDate = null;
  render();
};

$('weekdays').onclick = () =>
  selectAll(date => {
    const day = new Date(date + 'T12:00:00').getDay();
    return day >= 1 && day <= 5;
  });

$('all').onclick = () => selectAll(() => true);
$('unselect').onclick = () => { chosen.clear(); render(); };

$('applyV2').onclick = applySelected;
$('statusV2').onchange = syncHours;
$('employment').onchange = updateEmployment;

$('weekdaysV2').onclick = () => $('weekdays').click();
$('allV2').onclick = () => $('all').click();
$('unselectV2').onclick = () => $('unselect').click();

$('clear').onclick = clearMonth;
$('clearV2').onclick = clearMonth;
$('copyPrev').onclick = copyPrevious;
$('copyPrevV2').onclick = copyPrevious;

$('applyHours').onclick = applyLegacyHours;
$('applyStatus').onclick = applySelected;

$('saveDayHours').onclick = () => {
  if (!editingDate || !saved[editingDate]) return;
  const start = $('editStart').value;
  const end = $('editEnd').value;
  if (!start || !end || start >= end) return alert('Sprawdź godziny.');
  saved[editingDate].start = start;
  saved[editingDate].end = end;
  editingDate = null;
  render();
};

$('closeDayEditor').onclick = () => {
  editingDate = null;
  render();
};

$('load').onclick = () => {
  $('message').textContent =
    'Wczytywanie wcześniejszych zgłoszeń wymaga osobnego mechanizmu serwerowego.';
};

$('copyToken').onclick = () => {};
$('send').onclick = sendSurvey;

updateEmployment();
