import { apiUrl } from './config.js';

const copy = {
  ko: {
    title: '학생 찾기', intro: '학교 Google 계정으로 로그인하여 학생 시간표와 오늘의 출결을 확인하세요.',
    signin: '학교 계정으로 로그인', logout: '로그아웃', settings: '관리자 설정', close: '닫기',
    studentName: '학생 이름', search: '검색', refresh: '지금 새로고침', empty: '일치하는 학생이 없습니다.',
    loading: '불러오는 중…', period: '교시', hr: '홈룸', lunch: '점심', unresolved: '수강 과목 확인 필요',
    attendance: '오늘의 출결', clinic: '보건실', noEvents: '등록된 출결 변경 사항 없음', visit: '오늘 방문 기록 있음',
    noVisit: '오늘 방문 기록 없음', early: '조퇴', late: '지각', missed: '결과', absent: '결석', other: '기타 출결 기록',
    updated: '조회 시각', ambiguous: '동명이인 확인이 필요한 기록이 있습니다.', warning: '자료를 확인할 수 없습니다.',
    term: '학기', bell: '교시별 시간', shortDates: '단축수업 날짜 (쉼표로 구분)', courses: '시간표 · 수강 명단',
    schedule: '시간표 · 수업 배정', url: 'Google Sheets 주소', sheet: '탭 이름 (비워두면 주소의 gid 사용)',
    header: '헤더 행 번호', columns: '열 지정 (예: NAME=B,DATE=A,STATUS=E)', mode: '출결 시트 구조',
    rows: '행마다 날짜·출결 상태', grid: '열마다 날짜', inspect: '시트 탭·헤더 확인', save: '설정 저장',
    sync: '시간표 연동', saved: '설정을 저장했습니다.', synced: '시간표를 연동했습니다.',
    noSync: '시간표 연동 전', syncDate: '시간표 연동', middleRegular: '중등 · 월–목', highRegular: '고등 · 월–목',
    middleFriday: '중등 · 금요일', highFriday: '고등 · 금요일', middleShort: '중등 · 단축', highShort: '고등 · 단축',
    setup: '새 HIS Finder 연동 서버 연결이 필요합니다.', network: '연동 서버에 연결할 수 없습니다.',
    auth: '@his.sc.kr Google 계정으로 로그인해 주세요.', loginError: '학교 계정에 로그인할 수 없습니다.',
    syncFirst: '관리자가 먼저 시간표를 연동해야 합니다.', badPeriods: '시간은 08:30-08:50 형식으로 입력해 주세요.',
    overlap: '같은 유형의 교시 시간이 겹칩니다.', badDates: '단축수업 날짜를 YYYY-MM-DD 형식으로 입력해 주세요.',
    termRequired: '학기를 입력한 뒤 설정을 저장해 주세요.', confirm: '저장된 설정으로 시간표를 연동하시겠습니까?',
    days: ['월요일','화요일','수요일','목요일','금요일']
  },
  en: {
    title: 'Find a student', intro: 'Sign in with your school Google account to see student timetables and today’s attendance.',
    signin: 'Sign in with school Google', logout: 'Sign out', settings: 'Admin settings', close: 'Close',
    studentName: 'Student name', search: 'Search', refresh: 'Refresh now', empty: 'No matching students.',
    loading: 'Loading…', period: 'Period', hr: 'Homeroom', lunch: 'Lunch', unresolved: 'Course needs verification',
    attendance: 'Today’s attendance', clinic: 'Health office', noEvents: 'No attendance changes recorded',
    visit: 'Visit recorded today', noVisit: 'No visit recorded today', early: 'Early departure',
    late: 'Late arrival', missed: 'Missed class', absent: 'Absent', other: 'Other attendance record',
    updated: 'Checked at', ambiguous: 'Some records require a name match to be verified.', warning: 'Source unavailable.',
    term: 'Term', bell: 'Period times', shortDates: 'Short-schedule dates (comma-separated)', courses: 'Timetable · Enrollment',
    schedule: 'Timetable · Class slots', url: 'Google Sheets URL', sheet: 'Tab name (or leave blank to use the URL gid)',
    header: 'Header row number', columns: 'Column mapping (e.g. NAME=B,DATE=A,STATUS=E)', mode: 'Attendance layout',
    rows: 'Date and status per row', grid: 'Date per column', inspect: 'Check tabs and headers', save: 'Save settings',
    sync: 'Sync timetable', saved: 'Settings saved.', synced: 'Timetable synced.', noSync: 'Timetable has not been synced.',
    syncDate: 'Timetable sync', middleRegular: 'Middle · Mon–Thu', highRegular: 'High · Mon–Thu',
    middleFriday: 'Middle · Friday', highFriday: 'High · Friday', middleShort: 'Middle · Short', highShort: 'High · Short',
    setup: 'Connect the new HIS Finder server to continue.', network: 'Unable to connect to the server.',
    auth: 'Sign in with an @his.sc.kr Google account.', loginError: 'Unable to sign in with your school account.',
    syncFirst: 'An administrator must sync the timetable first.', badPeriods: 'Use the time format 08:30-08:50.',
    overlap: 'Period times overlap in one schedule.', badDates: 'Use the date format YYYY-MM-DD for short-schedule dates.',
    termRequired: 'Enter a term and save settings first.', confirm: 'Sync the timetable using the saved settings?',
    days: ['Monday','Tuesday','Wednesday','Thursday','Friday']
  }
};

const byId = id => document.getElementById(id);
const dayKeys = ['월','화','수','목','금'];
const slotKeys = ['HR','1','2','3','4','5','6','7','Lunch'];
let language = localStorage.getItem('his-finder-language') === 'en' ? 'en' : 'ko';
let firebaseAuth, authSdk, session, selected, details, latestSettings;
let matches = [];
let generation = 0;
let authGeneration = 0;
let updating = false;

const t = key => copy[language][key] || key;
const label = slot => slot === 'HR' ? t('hr') : slot === 'Lunch' ? t('lunch') : slot;

function node(tag, value, className) {
  const element = document.createElement(tag);
  if (value != null) element.textContent = value;
  if (className) element.className = className;
  return element;
}

function notice(id, message = '') {
  byId(id).textContent = message;
  byId(id).hidden = !message;
}

function errorText(error) {
  const code = error.message;
  const messages = {
    SETUP_REQUIRED: 'setup', NETWORK: 'network', AUTH_REQUIRED: 'auth', AUTH_UNAVAILABLE: 'network',
    SYNC_REQUIRED: 'syncFirst', BAD_PERIODS: 'badPeriods', OVERLAPPING_PERIODS: 'overlap',
    BAD_SHORT_DATES: 'badDates', TERM_REQUIRED: 'termRequired'
  };
  return messages[code] ? t(messages[code]) : t('warning') + ' (' + code + ')';
}

function translate() {
  document.documentElement.lang = language;
  document.querySelectorAll('[data-text]').forEach(el => { el.textContent = t(el.dataset.text); });
  document.querySelectorAll('[data-placeholder]').forEach(el => { el.placeholder = t(el.dataset.placeholder); });
  byId('language').textContent = language === 'ko' ? 'English' : '한국어';
  byId('language').lang = language === 'ko' ? 'en' : 'ko';
}

async function call(action, values = {}) {
  if (!apiUrl || !/^https:\/\/script\.google\.com\/(?:a\/macros\/[^/]+\/s|macros\/s)\/[\w-]+\/exec$/.test(apiUrl)) {
    throw new Error('SETUP_REQUIRED');
  }
  const token = action === 'config' ? undefined : await firebaseAuth.currentUser?.getIdToken();
  if (action !== 'config' && !token) throw new Error('AUTH_REQUIRED');
  let body;
  try {
    const response = await fetch(apiUrl, {
      method: 'POST', credentials: 'omit', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, token, ...values }), signal: AbortSignal.timeout(65000)
    });
    if (!response.ok) throw new Error('NETWORK');
    body = await response.json();
  } catch (_) { throw new Error('NETWORK'); }
  if (body.error) throw new Error(body.error);
  return body.data;
}

function resetStudent() {
  generation++;
  details = selected = undefined;
  byId('student').hidden = true;
  byId('student-heading').textContent = '';
  byId('term').textContent = '';
  byId('timetable').replaceChildren();
  byId('live').replaceChildren();
}

function displayName(student) {
  return [student.name, [student.grade + student.group, student.number].filter(Boolean).join(' · ')].join('  ·  ');
}

function drawMatches() {
  byId('results').replaceChildren(...matches.map(student => {
    const item = node('li');
    const button = node('button', displayName(student));
    button.type = 'button';
    button.setAttribute('aria-pressed', String(selected?.id === student.id));
    button.addEventListener('click', () => openStudent(student));
    item.append(button);
    return item;
  }));
}

function schoolTime() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23', weekday: 'short'
  }).formatToParts(new Date());
  const value = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return { date: [value.year, value.month, value.day].join('-'), time: value.hour + ':' + value.minute,
    weekday: ['Mon','Tue','Wed','Thu','Fri'].indexOf(value.weekday) };
}

function profileFor(date, friday) {
  const section = Number(selected.grade) < 10 ? 'middle' : 'high';
  const short = session.overrides.split(/[,\s]+/).includes(date);
  return session.profiles[section + (short ? 'Short' : friday ? 'Friday' : 'Regular')];
}

function renderTimetable() {
  if (!details || !selected) return;
  const now = schoolTime();
  const monday = new Date(now.date + 'T00:00:00Z');
  monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7));
  const days = dayKeys.map((key, index) => {
    const day = new Date(monday.getTime() + index * 86400000).toISOString().slice(0, 10);
    const slots = profileFor(day, index === 4)
      .map((time, slot) => ({ time, slot: slotKeys[slot] })).filter(item => item.time)
      .sort((a, b) => a.time.localeCompare(b.time));
    return { key, date: day, slots, today: now.weekday === index };
  });
  const tables = [node('thead'), node('tbody')];
  const heading = node('tr');
  days.forEach((day, index) => {
    const cell = node('th', t('days')[index] + ' · ' + day.date.slice(5), day.today ? 'today' : '');
    cell.scope = 'col';
    heading.append(cell);
  });
  tables[0].append(heading);
  const rowCount = Math.max(...days.map(day => day.slots.length));
  for (let index = 0; index < rowCount; index++) {
    const row = node('tr');
    for (const day of days) {
      const { time, slot } = day.slots[index] || {};
      const [start, end] = time ? time.split('-') : [];
      const active = day.today && start <= now.time && now.time < end;
      const cell = node('td', null, active ? 'current' : day.today ? 'today' : '');
      if (active) cell.setAttribute('aria-current', 'time');
      if (time) {
        const slotLabel = /^\d$/.test(slot)
          ? (language === 'ko' ? slot + t('period') : t('period') + ' ' + slot) : label(slot);
        cell.append(node('div', slotLabel + ' · ' + time.replace('-', '–'), 'secondary slot-label'));
        const item = details.lessons[day.key + ':' + slot];
        if (item?.unresolved) cell.append(node('span', t('unresolved'), 'warn'));
        else if (item) {
          cell.append(node('strong', item[language], 'lesson'));
          if (item.room) cell.append(node('span', item.room, 'room'));
          if (item.teacher) cell.append(node('span', item.teacher, 'secondary'));
        }
        if (day.today) for (const event of details.attendance?.events || []) {
          if (event.period === slot) cell.append(node('div', t(event.state), 'warn'));
        }
      }
      row.append(cell);
    }
    tables[1].append(row);
  }
  byId('timetable').replaceChildren(...tables);
}

function displayTime(iso) {
  return new Intl.DateTimeFormat(language === 'ko' ? 'ko-KR' : 'en-GB', {
    dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Seoul'
  }).format(new Date(iso));
}

function renderStudent() {
  if (!selected || !details) return;
  byId('student-heading').textContent = displayName(selected);
  byId('term').textContent = t('term') + ' ' + details.term + ' · ' + t('syncDate') + ' ' + displayTime(details.snapshotAt);
  const panels = ['attendance', 'clinic'].map(type => {
    const status = details[type];
    const panel = node('div');
    panel.append(node('strong', t(type)));
    if (status.error) panel.append(node('span', errorText(new Error(status.error)), 'warn'));
    else {
      const events = status.events?.map(item => [t(item.state), item.period && label(item.period), item.time].filter(Boolean).join(' · '));
      const summary = type === 'clinic' ? t(status.visited ? 'visit' : status.ambiguous ? 'ambiguous' : 'noVisit')
        : events.length ? events.join(' / ') : t(status.ambiguous ? 'ambiguous' : 'noEvents');
      panel.append(node('span', summary));
      if (status.ambiguous && (status.visited || events?.length)) panel.append(node('small', t('ambiguous'), 'warn'));
      panel.append(node('small', t('updated') + ' ' + displayTime(status.at), 'secondary'));
    }
    return panel;
  });
  byId('live').replaceChildren(...panels);
  renderTimetable();
}

async function openStudent(student) {
  resetStudent();
  selected = student;
  const request = generation;
  drawMatches();
  notice('notice', t('loading'));
  try {
    const result = await call('student', { id: student.id });
    if (generation !== request) return;
    details = result;
    byId('student').hidden = false;
    renderStudent();
    notice('notice');
  } catch (error) {
    if (generation === request) notice('notice', errorText(error));
  }
}

async function refresh(force = false) {
  if (!details || !selected || updating || (!force && document.hidden)) return;
  const request = generation;
  updating = true;
  byId('refresh').disabled = true;
  try {
    const result = await call('live', { id: selected.id, force });
    if (generation !== request) return;
    details = { ...details, ...result };
    renderStudent();
    notice('notice');
  } catch (error) {
    if (generation === request) notice('notice', errorText(error));
  } finally {
    updating = false;
    byId('refresh').disabled = false;
  }
}

function field(title, input) {
  const wrapper = node('label');
  const text = node('span');
  text.dataset.text = title;
  wrapper.append(text, input);
  return wrapper;
}

function input(id, value, type = 'text') {
  const control = node('input');
  control.id = id;
  control.type = type;
  control.value = value;
  return control;
}

function renderSettings(settings) {
  latestSettings = settings;
  byId('settings-term').value = settings.term;
  byId('overrides').value = settings.overrides;
  byId('sources').replaceChildren(...Object.entries(settings.sources).map(([key, value]) => {
    const box = node('fieldset');
    const title = node('legend');
    title.dataset.text = key;
    const fields = node('div', null, 'source-fields');
    const url = field('url', input(key + '-url', value.url, 'url'));
    url.className = 'source-url';
    const header = input(key + '-header', value.header, 'number');
    header.min = '1';
    header.max = '100';
    header.required = true;
    fields.append(url, field('sheet', input(key + '-tab', value.tab)), field('header', header));
    if (key === 'attendance' || key === 'clinic') {
      fields.append(field('columns', input(key + '-columns', value.columns)));
    }
    if (key === 'attendance') {
      const select = node('select');
      select.id = key + '-mode';
      for (const optionKey of ['rows','grid']) {
        const option = node('option');
        option.value = optionKey;
        option.dataset.text = optionKey;
        select.append(option);
      }
      select.value = value.mode;
      fields.append(field('mode', select));
    }
    box.append(title, fields);
    return box;
  }));
  byId('profiles').replaceChildren(...Object.entries(settings.profiles).map(([key, slots]) => {
    const box = node('fieldset');
    const title = node('legend');
    title.dataset.text = key;
    box.append(title);
    slots.forEach((value, index) => {
      const control = input(key + '-' + index, value);
      control.placeholder = '08:30-08:50';
      control.pattern = '[0-9]{2}:[0-9]{2}-[0-9]{2}:[0-9]{2}';
      box.append(field(slotKeys[index] === 'HR' ? 'hr' : slotKeys[index] === 'Lunch' ? 'lunch' : slotKeys[index], control));
    });
    return box;
  }));
  translate();
}

function collectSettings() {
  const value = id => byId(id).value;
  const sources = Object.fromEntries(Object.keys(latestSettings.sources).map(key => [key, {
    url: value(key + '-url'), tab: value(key + '-tab'), header: +value(key + '-header'),
    mode: byId(key + '-mode')?.value || 'rows', columns: byId(key + '-columns')?.value || ''
  }]));
  const profiles = Object.fromEntries(Object.keys(latestSettings.profiles).map(key =>
    [key, slotKeys.map((_, index) => value(key + '-' + index))]));
  return { sources, profiles, term: value('settings-term'), overrides: value('overrides') };
}

function inspection(result) {
  byId('inspection').replaceChildren(...Object.entries(result).map(([key, value]) => {
    const block = node('details');
    block.append(node('summary', t(key)));
    if (value.error) block.append(node('p', errorText(new Error(value.error)), 'warn'));
    if (value.tabs) block.append(node('p', value.tabs.map(tab => tab.name + ' (gid=' + tab.gid + ')').join(' · ')));
    if (value.headers) {
      const letters = index => index < 26 ? String.fromCharCode(65 + index) :
        letters(Math.floor(index / 26) - 1) + letters(index % 26);
      block.append(node('p', value.headers.map((text, index) => text && letters(index) + '=' + text).filter(Boolean).join(' · ')));
    }
    return block;
  }));
}

async function settingsAction(button, work) {
  const controls = [byId('inspect'), byId('sync'), byId('settings-form').querySelector('button[type="submit"], button.primary'), button];
  controls.forEach(control => { if (control) control.disabled = true; });
  notice('settings-notice', t('loading'));
  try { await work(); } catch (error) { notice('settings-notice', errorText(error)); }
  finally { controls.forEach(control => { if (control) control.disabled = false; }); }
}

byId('language').addEventListener('click', () => {
  language = language === 'ko' ? 'en' : 'ko';
  localStorage.setItem('his-finder-language', language);
  translate();
  if (!apiUrl) notice('notice', t('setup'));
  renderStudent();
});
byId('search-form').addEventListener('submit', async event => {
  event.preventDefault();
  resetStudent();
  const request = generation;
  matches = [];
  drawMatches();
  notice('notice', t('loading'));
  try {
    const result = await call('search', { query: byId('query').value });
    if (generation !== request) return;
    matches = result;
    drawMatches();
    notice('notice', matches.length ? '' : t('empty'));
    if (matches.length === 1) await openStudent(matches[0]);
  } catch (error) {
    if (generation === request) notice('notice', errorText(error));
  }
});
byId('refresh').addEventListener('click', () => refresh(true));
byId('settings-button').addEventListener('click', event => settingsAction(event.currentTarget, async () => {
  byId('settings').showModal();
  byId('inspection').replaceChildren();
  const settings = await call('settings');
  renderSettings(settings);
  const state = settings.snapshot;
  notice('settings-notice', state ? t('syncDate') + ' · ' + state.term + ' · ' + displayTime(state.at) : t('noSync'));
}));
byId('close-settings').addEventListener('click', () => byId('settings').close());
byId('inspect').addEventListener('click', event => settingsAction(event.currentTarget, async () => {
  inspection(await call('inspect', { settings: collectSettings() }));
  notice('settings-notice');
}));
byId('settings-form').addEventListener('submit', event => {
  event.preventDefault();
  settingsAction(event.submitter, async () => {
    const settings = await call('save', { settings: collectSettings() });
    renderSettings(settings);
    session = { ...session, profiles: settings.profiles, overrides: settings.overrides };
    renderStudent();
    notice('settings-notice', t('saved'));
  });
});
byId('sync').addEventListener('click', event => {
  if (!window.confirm(t('confirm'))) return;
  settingsAction(event.currentTarget, async () => {
    const synced = await call('sync');
    notice('settings-notice', t('synced') + ' ' + synced.term + ' · ' + synced.count);
    matches = [];
    resetStudent();
    drawMatches();
  });
});

async function start() {
  translate();
  try {
    const [config, firebaseApp, auth] = await Promise.all([call('config'),
      import('https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js')]);
    authSdk = auth;
    firebaseAuth = auth.getAuth(firebaseApp.initializeApp(config));
    await auth.setPersistence(firebaseAuth, auth.browserSessionPersistence);
    auth.onAuthStateChanged(firebaseAuth, async user => {
      const request = ++authGeneration;
      session = undefined;
      matches = [];
      drawMatches();
      resetStudent();
      byId('finder').hidden = byId('settings-button').hidden = true;
      byId('signin-panel').hidden = Boolean(user);
      byId('logout').hidden = !user;
      if (!user) {
        const dialog = byId('settings');
        if (dialog.open) dialog.close();
        byId('inspection').replaceChildren();
        byId('sources').replaceChildren();
        byId('profiles').replaceChildren();
        latestSettings = undefined;
        return;
      }
      try {
        if (!user.emailVerified || !/^[^@\s]+@his\.sc\.kr$/i.test(user.email || '')) throw new Error('AUTH_REQUIRED');
        const value = await call('session');
        if (request !== authGeneration) return;
        session = value;
        byId('finder').hidden = false;
        byId('settings-button').hidden = !session.admin;
        notice('notice');
      } catch (error) {
        if (request !== authGeneration) return;
        if (error.message === 'AUTH_REQUIRED') await auth.signOut(firebaseAuth);
        notice('notice', errorText(error));
      }
    });
    byId('signin').disabled = false;
  } catch (error) { notice('notice', errorText(error)); }
}

byId('signin').addEventListener('click', async () => {
  const provider = new authSdk.GoogleAuthProvider();
  provider.setCustomParameters({ hd: 'his.sc.kr', prompt: 'select_account' });
  try { await authSdk.signInWithPopup(firebaseAuth, provider); }
  catch (error) { notice('notice', t('loginError') + ' (' + (error.code || 'AUTH') + ')'); }
});
byId('logout').addEventListener('click', () => authSdk.signOut(firebaseAuth));
setInterval(() => { refresh(); }, 30000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
start();
