const ADMIN = 'jinwoosuk@his.sc.kr';
const TZ = 'Asia/Seoul';
const DEFAULTS = {
  timetable: 'https://docs.google.com/spreadsheets/d/1yw-l67mV2t4ZynqjTgmQ1uTp0MPRc_dd2gPEL7QXVdg/edit?gid=1631354026',
  attendance: 'https://docs.google.com/spreadsheets/d/1MfqOPPHc0BacimghJEGw8Ba1r_pN9Z4POTAEJu4ymM0/edit?gid=1507799363',
  health: 'https://docs.google.com/spreadsheets/d/1Y1thlOAf9BGjXKbG3jL6CBLVkpuyeSiw9wS62Y6lYTE/edit?gid=974283698'
};
const FIELDS = {
  id: ['학번', '학생ID', 'Student ID', 'SID'],
  name: ['이름', '학생명', '성명', 'Name', 'Student Name', '학생 이름'],
  grade: ['학년', 'Grade'], room: ['반', '학급', 'Class', 'Homeroom'],
  number: ['번호', '출석번호', 'Number', 'Student Number'],
  date: ['날짜', '일자', 'Date', 'Timestamp', '타임스탬프', '방문일', '출결일', '방문일시', '방문 날짜'],
  status: ['출결', '출결구분', '출결상태', '구분', 'Status', 'Attendance', 'Attendance Status'],
  day: ['요일', 'Day', 'Weekday'], period: ['교시', 'Period'],
  subject: ['과목', '교과', 'Subject', 'Course'], location: ['교실', '강의실', 'Room', 'Location']
};

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index').setTitle('HIS Finder')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function account() {
  const email = Session.getActiveUser().getEmail().trim().toLowerCase();
  if (!/^[^@]+@his\.sc\.kr$/.test(email)) throw new Error('SCHOOL_ACCOUNT_REQUIRED');
  return { email, admin: email === ADMIN };
}

function settings() {
  admin_();
  return Object.keys(DEFAULTS).map(key => ({ key, ...source_(key) }));
}

function saveSource(key, url) {
  admin_();
  return locked_(() => {
    parseUrl_(url);
    const source = source_(key);
    if (source.url !== url) {
      const store = PropertiesService.getScriptProperties();
      store.setProperty('url:' + key, url);
      store.deleteProperty('snapshot:' + key);
      discard_(source.tab);
    }
    return settings();
  });
}

function syncSource(key) {
  admin_();
  return locked_(() => {
    const rows = sync_(key);
    return { count: rows.length, sources: settings() };
  });
}

function installAttendanceTrigger() {
  admin_();
  return locked_(() => {
    if (!ScriptApp.getProjectTriggers().some(trigger => trigger.getHandlerFunction() === 'dailyAttendance_')) {
      ScriptApp.newTrigger('dailyAttendance_').timeBased().everyDays(1).atHour(7).inTimezone(TZ).create();
    }
    return true;
  });
}

function dailyAttendance_() {
  locked_(() => day_() === source_('attendance').day ? null : sync_('attendance'));
}

function searchStudents(query) {
  account();
  const q = norm_(String(query || '').slice(0, 80));
  if (!q) return { students: [], unavailable: [] };
  const unavailable = [];
  const datasets = {};
  for (const key of Object.keys(DEFAULTS)) {
    try {
      datasets[key] = key === 'health' ? readSource_(key) : locked_(() => {
        const source = source_(key);
        if (key === 'attendance' && source.day !== day_()) return sync_(key);
        if (!source.tab) throw new Error('SYNC_REQUIRED');
        const tab = cacheBook_().getSheetByName(source.tab);
        if (!tab) throw new Error('SYNC_REQUIRED');
        return tab.getLastRow() ? tab.getRange(1, 1, tab.getLastRow(), 1).getValues().map(row => JSON.parse(row[0])) : [];
      });
    } catch (_) {
      unavailable.push(key);
      datasets[key] = [];
    }
  }
  const roster = [...datasets.timetable, ...datasets.attendance, ...datasets.health];
  const idsByClassNumber = new Map();
  for (const row of roster) {
    if (!row.id || !row.classNumber) continue;
    if (!idsByClassNumber.has(row.classNumber)) idsByClassNumber.set(row.classNumber, new Set());
    idsByClassNumber.get(row.classNumber).add(row.id);
  }
  const groups = new Map();
  Object.keys(datasets).forEach(key => datasets[key].forEach(row => {
    const ids = idsByClassNumber.get(row.classNumber);
    const identity = row.id ? 'id:' + row.id : ids?.size === 1 ? 'id:' + [...ids][0]
      : row.classNumber && !ids ? 'class:' + row.classNumber : null;
    if (!identity) return;
    if (!groups.has(identity)) groups.set(identity, {
      name: row.name, grade: row.grade, class: row.room, number: row.number, id: row.id,
      timetable: [], attendance: [], health: []
    });
    const student = groups.get(identity);
    for (const [field, value] of Object.entries({ name: row.name, grade: row.grade, class: row.room, number: row.number, id: row.id })) {
      if (!student[field]) student[field] = value;
    }
    if (row.detail && !student[key].includes(row.detail)) student[key].push(row.detail);
  }));
  const students = [...groups.values()].filter(student => {
    const fields = [student.name, student.id, student.number, student.grade + '학년',
      'Grade ' + student.grade, student.grade + '-' + student.class, student.class + '반'];
    return fields.some(value => norm_(value).includes(q));
  }).slice(0, 50).map(({ id, ...student }) => student);
  return { students, unavailable };
}

function admin_() {
  if (!account().admin) throw new Error('ADMIN_REQUIRED');
}

function source_(key) {
  if (!Object.prototype.hasOwnProperty.call(DEFAULTS, key)) throw new Error('UNKNOWN_SOURCE');
  const props = PropertiesService.getScriptProperties();
  return { ...JSON.parse(props.getProperty('snapshot:' + key) || '{}'), url: props.getProperty('url:' + key) || DEFAULTS[key] };
}

function parseUrl_(url) {
  const match = /^https:\/\/docs\.google\.com\/spreadsheets\/d\/([\w-]+)(?:\/[^?#]*)?(?:[?#].*)?$/.exec(String(url));
  const tab = /[?#&]gid=(\d+)(?:[&#]|$)/.exec(String(url));
  if (!match || !tab) throw new Error('INVALID_SHEET_URL');
  return { id: match[1], gid: Number(tab[1]) };
}

function readSource_(key) {
  const { id, gid } = parseUrl_(source_(key).url);
  const tab = SpreadsheetApp.openById(id).getSheets().find(sheet => sheet.getSheetId() === gid);
  if (!tab) throw new Error('TAB_NOT_FOUND');
  const values = tab.getDataRange().getValues();
  const display = tab.getDataRange().getDisplayValues();
  const header = display.findIndex(row => hasField_(row, 'name') && (hasField_(row, 'id') ||
    ['grade', 'room', 'number'].every(field => hasField_(row, field))));
  if (header < 0) throw new Error('STUDENT_COLUMNS_NOT_FOUND');
  const columns = Object.fromEntries(Object.keys(FIELDS).map(field =>
    [field, display[header].findIndex(value => FIELDS[field].some(alias => norm_(alias) === norm_(value)))]));
  if (key === 'attendance' && columns.status < 0) throw new Error('ATTENDANCE_STATUS_COLUMN_REQUIRED');
  if (key === 'health' && columns.date < 0) throw new Error('HEALTH_DATE_COLUMN_REQUIRED');
  const rows = [];
  for (let i = header + 1; i < display.length; i++) {
    const row = display[i];
    const get = field => String(row[columns[field]] || '').trim();
    const [name, id, grade, room, number] = ['name', 'id', 'grade', 'room', 'number'].map(get);
    const classNumber = grade && room && number ? JSON.stringify([norm_(grade), norm_(room), norm_(number)]) : '';
    if (!name || (!id && !classNumber)) continue;
    if (key !== 'timetable' && columns.date >= 0 && dateKey_(values[i][columns.date]) !== day_()) continue;
    const detail = key === 'health' ? 'VISIT_TODAY' : key === 'attendance' ? get('status') :
      ['day', 'period', 'subject', 'location'].map(get).filter(Boolean).join(' · ');
    rows.push({ name, id: id.normalize('NFKC').toLowerCase(), grade, room, number, classNumber, detail });
  }
  return rows;
}

function sync_(key) {
  const current = source_(key);
  const rows = readSource_(key);
  const props = PropertiesService.getScriptProperties();
  const meta = { day: day_(), lastSync: new Date().toISOString() };
  if (key === 'health') {
    props.setProperty('snapshot:' + key, JSON.stringify(meta));
    return rows;
  }
  const book = cacheBook_();
  const tab = book.insertSheet(key + '_' + Utilities.getUuid());
  try {
    if (rows.length) tab.getRange(1, 1, rows.length, 1).setValues(rows.map(row => [JSON.stringify(row)]));
    SpreadsheetApp.flush();
    props.setProperty('snapshot:' + key, JSON.stringify({ ...meta, tab: tab.getName() }));
  } catch (error) {
    book.deleteSheet(tab);
    throw error;
  }
  discard_(current.tab);
  return rows;
}

function cacheBook_() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('cacheBook');
  if (id) return SpreadsheetApp.openById(id);
  const book = SpreadsheetApp.create('HIS Finder – Private cache');
  props.setProperty('cacheBook', book.getId());
  return book;
}

function discard_(name) {
  if (!name) return;
  try {
    const book = cacheBook_();
    const tab = book.getSheetByName(name);
    if (tab) book.deleteSheet(tab);
  } catch (_) { console.warn('Could not remove previous cache tab'); }
}

function locked_(run) {
  const lock = LockService.getScriptLock();
  lock.waitLock(25000);
  try { return run(); } finally { lock.releaseLock(); }
}

function norm_(value) {
  return String(value || '').normalize('NFKC').toLowerCase().replace(/[\s_.()\-]/g, '');
}

function hasField_(row, field) {
  return row.some(value => FIELDS[field].some(alias => norm_(alias) === norm_(value)));
}

function day_() {
  return Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd');
}

function dateKey_(value) {
  if (value instanceof Date) return Utilities.formatDate(value, TZ, 'yyyy-MM-dd');
  const match = /^(\d{4})\s*[-./년]\s*(\d{1,2})\s*[-./월]\s*(\d{1,2})(?!\d)/.exec(String(value).trim());
  return match ? [match[1], match[2].padStart(2, '0'), match[3].padStart(2, '0')].join('-') : '';
}
