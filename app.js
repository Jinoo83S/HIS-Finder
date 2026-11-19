import { apiUrl } from './config.js';

const copy = {
  ko: {
    club: '동아리', chapel: '채플', clinicCurrent: '현재 보건실 입실', clinicToday: '오늘 보건실 방문',
    weeklyTimetable: '시간표', shortDays: ['월', '화', '수', '목', '금'],
    inClinic: '현재 입실 중', notInClinic: '현재 입실 기록 없음', noLessons: '표시할 교시가 없습니다.',
    previewPublic: '공개 시간표 미리보기', publishPublic: 'GitHub에 공개', published: '공개 시간표를 GitHub에 올렸습니다.',
    publicScope: '아래 학년·반·요일·교시·과목·교실이 GitHub Pages에 공개됩니다.',
    rules: 'his-main의 HIS Finder 전용 Firestore 규칙을 확인해 주세요.',
    githubToken: 'Apps Script의 GitHub 쓰기 토큰 설정이 필요합니다.',
    previewChanged: '시간표가 바뀌었습니다. 미리보기를 다시 확인해 주세요.',
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
    club: 'Club', chapel: 'Chapel', clinicCurrent: 'Currently in the health office', clinicToday: 'Health office visits today',
    weeklyTimetable: 'Timetable', shortDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    inClinic: 'Currently in the health office', notInClinic: 'No current entry', noLessons: 'No periods to display.',
    previewPublic: 'Preview public timetable', publishPublic: 'Publish to GitHub', published: 'Public timetable published to GitHub.',
    publicScope: 'The grades, classes, days, periods, courses and rooms below will be public on GitHub Pages.',
    rules: 'Check the HIS Finder Firestore rules in his-main.',
    githubToken: 'Add the GitHub write token in Apps Script settings.',
    previewChanged: 'The timetable changed. Preview it again.',
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
let db, firestore, publicPreview;
let displayedDay;
let overviewData, overviewPending = false, searchStarted = false;
let publicSlots = new Map();
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
    BAD_SHORT_DATES: 'badDates', TERM_REQUIRED: 'termRequired',
    FIRESTORE_RULES_REQUIRED: 'rules', 'permission-denied': 'rules',
    GITHUB_TOKEN_REQUIRED: 'githubToken', PUBLIC_PREVIEW_CHANGED: 'previewChanged'
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
      body: JSON.stringify({ action, token, ...values }), signal: AbortSignal.timeout(action === 'sync' ? 240000 : 65000)
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

function lessonAt(day, slot) {
  if (day === '수' && slot === '7') return { ko: 'SA', en: 'SA', room: t('chapel') };
  const lesson = details.lessons[day + ':' + slot];
  if (day === '수' && slot === '6' && (!lesson || lesson.unresolved ||
    /^(club|동아리)$/i.test(lesson.ko || ''))) return { ko: '동아리', en: 'Club' };
  return lesson;
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
  const dayIndex = displayedDay ?? Math.max(now.weekday, 0);
  drawDaySchedule(days, dayIndex, now.time);
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
        const item = lessonAt(day.key, slot);
        if (item?.unresolved) cell.append(node('span', t('unresolved'), 'warn'));
        else if (item) {
          const schedule = publicSlots.get(item.publicKey) || item;
          cell.append(node('strong', schedule[language], 'lesson'));
          if (schedule.room) cell.append(node('span', schedule.room, 'room'));
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

function drawDaySchedule(days, dayIndex, nowTime) {
  const controls = byId('day-controls');
  const hasFocus = controls.contains(document.activeElement);
  controls.replaceChildren(...days.map((day, index) => {
    const button = node('button', null, day.today ? 'day-today' : '');
    button.type = 'button';
    button.setAttribute('aria-pressed', String(index === dayIndex));
    button.setAttribute('aria-label', t('days')[index] + ' ' + day.date.slice(5));
    if (day.today) button.setAttribute('aria-current', 'date');
    button.append(node('strong', t('shortDays')[index]), node('small', day.date.slice(8)));
    button.addEventListener('click', () => {
      displayedDay = index;
      drawDaySchedule(days, index, nowTime);
    });
    return button;
  }));
  if (hasFocus) controls.children[dayIndex]?.focus({ preventScroll: true });
  const day = days[dayIndex];
  const rows = day.slots.map(({ time, slot }) => {
    const [start, end] = time.split('-');
    const active = day.today && start <= nowTime && nowTime < end;
    const row = node('li', null, active ? 'day-row current' : 'day-row');
    if (active) row.setAttribute('aria-current', 'time');
    const when = node('div', null, 'day-when');
    const slotLabel = /^\d$/.test(slot) && language === 'ko' ? slot + t('period') : label(slot);
    when.append(node('strong', slotLabel), node('small', time.replace('-', '–')));
    const item = lessonAt(day.key, slot);
    const subject = node('div', null, 'day-subject');
    if (item?.unresolved) subject.append(node('span', t('unresolved'), 'warn'));
    else if (item) {
      subject.append(node('strong', (publicSlots.get(item.publicKey) || item)[language]));
      if (item.teacher) subject.append(node('small', item.teacher));
    }
    if (day.today) for (const event of details.attendance?.events || []) {
      if (event.period === slot) subject.append(node('small', t(event.state), 'warn'));
    }
    row.append(when, subject);
    const room = item && (publicSlots.get(item.publicKey) || item).room;
    if (room) row.append(node('span', room, 'room day-room'));
    return row;
  });
  byId('day-schedule').replaceChildren(...(rows.length ? rows : [node('li', t('noLessons'), 'secondary')]));
}

function displayTime(iso) {
  return new Intl.DateTimeFormat(language === 'ko' ? 'ko-KR' : 'en-GB', {
    dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Seoul'
  }).format(new Date(iso));
}

function renderOverview() {
  const target = byId('overview');
  target.hidden = searchStarted || !session || !overviewData;
  if (target.hidden) return;
  target.replaceChildren(...['attendance', 'clinic'].map(type => {
    const status = overviewData[type];
    const section = node('section', null, 'panel overview-card');
    const heading = type === 'attendance' ? t('attendance') : t(status.current === false ? 'clinicToday' : 'clinicCurrent');
    section.append(node('h2', heading));
    if (status.error) section.append(node('p', errorText(new Error(status.error)), 'warn'));
    else if (!status.rows.length) section.append(node('p', t(type === 'attendance' ? 'noEvents' :
      status.current ? 'notInClinic' : 'noVisit'), 'secondary'));
    else {
      const list = node('ul', null, 'overview-list');
      for (const row of status.rows) {
        const item = node('li');
        item.append(node('span', [row.name, row.grade + row.group].filter(Boolean).join(' · ')));
        if (row.state) item.append(node('small', [t(row.state), row.period && label(row.period), row.time].filter(Boolean).join(' · ')));
        list.append(item);
      }
      section.append(list);
    }
    return section;
  }));
}

async function refreshOverview() {
  if (!session || searchStarted || document.hidden || overviewPending) return;
  const request = authGeneration;
  overviewPending = true;
  try {
    const result = await call('overview');
    if (authGeneration !== request) return;
    overviewData = result;
    renderOverview();
  } catch (error) {
    if (authGeneration !== request) return;
    overviewData = error.message === 'STAFF_REQUIRED' ? undefined :
      { attendance: { error: error.message }, clinic: { error: error.message } };
    renderOverview();
  } finally { overviewPending = false; }
}

function renderStudent() {
  if (!selected || !details) return;
  byId('student-heading').textContent = displayName(selected);
  byId('term').textContent = t('term') + ' ' + details.term + ' · ' + t('syncDate') + ' ' + displayTime(details.snapshotAt);
  const panels = ['attendance', 'clinic'].map(type => {
    const status = details[type];
    const panel = node('div', null, status?.error ? 'live-card live-error' : 'live-card');
    panel.append(node('strong', t(type)));
    if (!status) panel.append(node('span', t('loading')));
    else if (status.error) panel.append(node('span', errorText(new Error(status.error)), 'warn'));
    else {
      const events = status.events?.map(item => [t(item.state), item.period && label(item.period), item.time].filter(Boolean).join(' · '));
      const summary = type === 'clinic' ? t(status.visited ? (status.current ? 'inClinic' : 'visit') :
        status.ambiguous ? 'ambiguous' : (status.current ? 'notInClinic' : 'noVisit'))
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
    if (generation !== request) return;
    const { lessons, term, snapshotAt } = student;
    details = { lessons, term, snapshotAt };
    byId('student').hidden = false;
    renderStudent();
    notice('notice');
    void refresh(false, true);
  } catch (error) {
    if (generation === request) notice('notice', errorText(error));
  }
}

async function refresh(force = false, initial = false) {
  if (!details || !selected || (!force && !initial && document.hidden)) return;
  const request = generation;
  if (updating === request) return;
  updating = request;
  byId('refresh').disabled = true;
  try {
    const result = await call('live', { id: selected.id, force });
    if (generation !== request) return;
    details = { ...details, ...result };
    renderStudent();
    notice('notice');
  } catch (error) {
    if (generation === request) {
      details = { ...details, attendance: { error: error.message }, clinic: { error: error.message } };
      renderStudent();
      notice('notice', errorText(error));
    }
  } finally {
    if (updating === request) {
      updating = false;
      byId('refresh').disabled = false;
    }
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
  const controls = [byId('inspect'), byId('sync'), byId('preview-public'), byId('publish-public'),
    byId('settings-form').querySelector('button[type="submit"], button.primary'), button];
  controls.forEach(control => { if (control) control.disabled = true; });
  notice('settings-notice', t('loading'));
  try { await work(); } catch (error) { notice('settings-notice', errorText(error)); }
  finally { controls.forEach(control => { if (control) control.disabled = false; }); }
}

async function searchDirectory(value) {
  const term = value.normalize('NFKC').toLowerCase().replace(/\s/g, '');
  if (!term) return [];
  const current = await firestore.getDocFromServer(firestore.doc(db, 'finderConfig', 'current'));
  if (!current.exists()) throw new Error('SYNC_REQUIRED');
  const { version, term: semester, at } = current.data();
  const students = firestore.collection(db, 'finderSnapshots', version, 'students');
  const results = await firestore.getDocsFromServer(firestore.query(students,
    firestore.where('terms', 'array-contains', term), firestore.limit(40)));
  return results.docs.map(student => ({ ...student.data(), id: student.id, term: semester, snapshotAt: at }))
    .sort((a, b) => Number(a.grade) - Number(b.grade) || a.group.localeCompare(b.group) || Number(a.number) - Number(b.number));
}

async function loadPublicTimetable() {
  try {
    const response = await fetch(new URL('./timetable.json', document.baseURI), { cache: 'no-cache' });
    if (!response.ok) return;
    const data = await response.json();
    if (data.schema === 1 && Array.isArray(data.slots)) {
      publicSlots = new Map(data.slots.map(slot => [slot.key, slot]));
      renderTimetable();
    }
  } catch (_) {}
}

function clearPublicPreview() {
  publicPreview = undefined;
  byId('public-preview').hidden = byId('publish-public').hidden = true;
  byId('public-preview').replaceChildren();
}

function showPublicPreview(preview) {
  publicPreview = preview;
  const table = node('table');
  const body = node('tbody');
  const slots = [...preview.data.slots].sort((a, b) => Number(a.grade) - Number(b.grade) ||
    a.group.localeCompare(b.group) || dayKeys.indexOf(a.day) - dayKeys.indexOf(b.day) ||
    slotKeys.indexOf(a.period) - slotKeys.indexOf(b.period));
  for (const slot of slots) {
    const row = node('tr');
    const day = t('days')[dayKeys.indexOf(slot.day)];
    for (const value of [slot.grade + slot.group, day, label(slot.period), slot.ko, slot.en, slot.room]) row.append(node('td', value));
    body.append(row);
  }
  table.append(body);
  byId('public-preview').replaceChildren(node('p', t('publicScope') + ' · ' + preview.branch), table);
  byId('public-preview').hidden = byId('publish-public').hidden = false;
}

byId('language').addEventListener('click', () => {
  language = language === 'ko' ? 'en' : 'ko';
  localStorage.setItem('his-finder-language', language);
  translate();
  if (!apiUrl) notice('notice', t('setup'));
  renderStudent();
  renderOverview();
  if (publicPreview) showPublicPreview(publicPreview);
});
byId('query').addEventListener('input', event => {
  if (event.target.value.trim()) return;
  searchStarted = false;
  matches = [];
  drawMatches();
  resetStudent();
  notice('notice');
  renderOverview();
  void refreshOverview();
});
byId('search-form').addEventListener('submit', async event => {
  event.preventDefault();
  searchStarted = true;
  renderOverview();
  resetStudent();
  const request = generation;
  matches = [];
  drawMatches();
  notice('notice', t('loading'));
  try {
    const result = await searchDirectory(byId('query').value);
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
  clearPublicPreview();
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
    clearPublicPreview();
    renderSettings(settings);
    session = { ...session, profiles: settings.profiles, overrides: settings.overrides };
    renderStudent();
    notice('settings-notice', t('saved'));
  });
});
byId('preview-public').addEventListener('click', event => settingsAction(event.currentTarget, async () => {
  clearPublicPreview();
  showPublicPreview(await call('previewPublic'));
  notice('settings-notice');
}));
byId('publish-public').addEventListener('click', event => {
  if (!publicPreview || !window.confirm(t('publicScope'))) return;
  settingsAction(event.currentTarget, async () => {
    const result = await call('publishPublic', { revision: publicPreview.revision });
    clearPublicPreview();
    notice('settings-notice', t('published') + ' · ' + result.count);
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
    const [config, firebaseApp, auth, store] = await Promise.all([call('config'),
      import('https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js'),
      import('https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js')]);
    authSdk = auth;
    firestore = store;
    const app = firebaseApp.initializeApp(config);
    db = firestore.getFirestore(app);
    firebaseAuth = auth.getAuth(app);
    void loadPublicTimetable();
    await auth.setPersistence(firebaseAuth, auth.browserSessionPersistence);
    auth.onAuthStateChanged(firebaseAuth, async user => {
      const request = ++authGeneration;
      session = undefined;
      overviewData = undefined;
      searchStarted = false;
      byId('overview').replaceChildren();
      renderOverview();
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
        clearPublicPreview();
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
        void refreshOverview();
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
setInterval(() => { refresh(); refreshOverview(); }, 30000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) { refresh(); refreshOverview(); } });
start();
