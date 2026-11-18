const PROJECT = 'his-main';
const ZONE = 'Asia/Seoul';
const CACHE_SECONDS = 60;
const SOURCE_KEYS = ['courses', 'schedule', 'attendance', 'clinic'];

function doGet() {
  return json_({ service: 'HIS Finder', version: 2 });
}

function doPost(e) {
  try {
    const body = e && e.postData && e.postData.contents;
    if (!body || body.length > 18000) throw new Error('BAD_REQUEST');
    const request = JSON.parse(body);
    const props = PropertiesService.getScriptProperties();
    const apiKey = props.getProperty('FIREBASE_WEB_API_KEY');
    if (!apiKey) throw new Error('SETUP_REQUIRED');
    if (request.action === 'config') return json_({ data: {
      apiKey, authDomain: PROJECT + '.firebaseapp.com', projectId: PROJECT,
      appId: '1:311279275648:web:3609db730ec2b0e77ea065'
    } });
    const account = authenticate_(request.token, props.getProperty('FIREBASE_LOOKUP_API_KEY') || apiKey, props);
    return json_({ data: dispatch_(request, account, props) });
  } catch (error) {
    const message = String(error.message);
    if (!/^[A-Z][A-Z0-9_]{1,70}$/.test(message)) console.error(error.name);
    return json_({ error: /^[A-Z][A-Z0-9_]{1,70}$/.test(message) ? message : 'SERVER_ERROR' });
  }
}

function json_(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
}

function authenticate_(token, apiKey, props) {
  if (typeof token !== 'string' || token.length > 6000) throw new Error('AUTH_REQUIRED');
  const parts = token.split('.');
  let claims;
  try {
    claims = JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(parts[1])).getDataAsString());
  } catch (_) { throw new Error('AUTH_REQUIRED'); }
  if (claims.aud !== PROJECT || claims.iss !== 'https://securetoken.google.com/' + PROJECT ||
      claims.firebase?.sign_in_provider !== 'google.com' || !(claims.exp > Date.now() / 1000)) {
    throw new Error('AUTH_REQUIRED');
  }
  const response = UrlFetchApp.fetch('https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' + encodeURIComponent(apiKey), {
    method: 'post', contentType: 'application/json', payload: JSON.stringify({ idToken: token }),
    muteHttpExceptions: true
  });
  if (response.getResponseCode() === 429 || response.getResponseCode() >= 500) throw new Error('AUTH_UNAVAILABLE');
  if (response.getResponseCode() !== 200) throw new Error('AUTH_REQUIRED');
  const user = JSON.parse(response.getContentText()).users?.[0];
  const email = clean_(user?.email).toLowerCase();
  if (!user || user.localId !== claims.sub || user.disabled || !user.emailVerified ||
      clean_(claims.email).toLowerCase() !== email || !/^[^@\s]+@his\.sc\.kr$/.test(email)) {
    throw new Error('AUTH_REQUIRED');
  }
  return { admin: email === clean_(props.getProperty('ADMIN_EMAIL')).toLowerCase() };
}

function dispatch_(request, account, props) {
  const settings = settings_(props);
  switch (request.action) {
    case 'session':
      return { admin: account.admin, profiles: settings.profiles, overrides: settings.overrides };
    case 'search': {
      const query = clean_(request.query).toLowerCase().replace(/\s/g, '');
      if (query.length < 2 || query.length > 80) throw new Error('BAD_QUERY');
      return snapshot_(props).students.filter(student => student.names.some(name =>
        name.toLowerCase().replace(/\s/g, '').includes(query)
      )).slice(0, 40).map(({ id, name, grade, group, number }) => ({ id, name, grade, group, number }));
    }
    case 'student': {
      const snapshot = snapshot_(props);
      const student = snapshot.students.find(item => item.id === request.id);
      if (!student) throw new Error('STUDENT_NOT_FOUND');
      return { lessons: student.lessons, snapshotAt: snapshot.at, term: snapshot.term,
        ...live_(student, snapshot.students, settings, request.force === true) };
    }
    case 'live': {
      const snapshot = snapshot_(props);
      const student = snapshot.students.find(item => item.id === request.id);
      if (!student) throw new Error('STUDENT_NOT_FOUND');
      return live_(student, snapshot.students, settings, request.force === true);
    }
    default:
      if (!account.admin) throw new Error('ADMIN_REQUIRED');
      if (request.action === 'settings') return { ...settings, snapshot: snapshotInfo_(props) };
      if (request.action === 'save') return locked_(() => {
        const validated = validateSettings_(request.settings);
        props.setProperty('SETTINGS', JSON.stringify(validated));
        return { ...validated, snapshot: snapshotInfo_(props) };
      });
      if (request.action === 'sync') return locked_(() => sync_(props, settings_(props), request.token));
      if (request.action === 'previewPublic') return publicPreview_(settings, props);
      if (request.action === 'publishPublic') {
        return locked_(() => publishPublic_(settings_(props), props, request.revision));
      }
      if (request.action === 'inspect') return inspect_(validateSettings_(request.settings).sources);
      throw new Error('BAD_REQUEST');
  }
}

function clean_(value) { return String(value ?? '').normalize('NFKC').trim(); }

function dayKey_(value) {
  const text = clean_(value);
  const iso = text.match(/^(20\d{2})\s*[-./년]\s*(\d{1,2})\s*[-./월]\s*(\d{1,2})(?:\D|$)/);
  const us = text.match(/^(\d{1,2})\/(\d{1,2})\/(20\d{2})(?:\D|$)/);
  if (!iso && !us) return '';
  const [year, month, day] = iso ? iso.slice(1) : [us[3], us[1], us[2]];
  const date = new Date(Date.UTC(+year, +month - 1, +day));
  return date.getUTCMonth() === +month - 1 && date.getUTCDate() === +day
    ? date.toISOString().slice(0, 10) : '';
}

function defaultProfiles_() {
  const regular = ['08:30-08:50', '09:00-09:50', '10:00-10:50', '11:00-11:50',
    '12:00-12:50', '13:30-14:20', '14:30-15:20', '15:30-16:20', '12:50-13:30'];
  const high = [...regular];
  high[4] = '12:30-13:20';
  high[8] = '11:50-12:30';
  const friday = times => times.map((time, i) =>
    i === 6 ? '14:25-15:15' : i === 7 ? '15:20-16:10' : time);
  const short = ['08:30-08:45', '08:50-09:30', '09:40-10:20', '10:30-11:10',
    '11:20-12:00', '12:10-12:50', '13:30-14:10', '', '12:50-13:30'];
  const shortHigh = [...short];
  shortHigh[5] = '12:40-13:20';
  shortHigh[8] = '12:00-12:40';
  return {
    middleRegular: regular, highRegular: high, middleFriday: friday(regular), highFriday: friday(high),
    middleShort: short, highShort: shortHigh
  };
}

function settings_(props) {
  const saved = props.getProperty('SETTINGS');
  if (saved) return JSON.parse(saved);
  const urls = JSON.parse(props.getProperty('SOURCE_URLS') || '{}');
  const sources = Object.fromEntries(SOURCE_KEYS.map(key => [key, {
    url: urls[key] || '', tab: key === 'courses' ? 'Raw_Cou' : key === 'schedule' ? '시간표_Data' : '',
    header: 1, mode: 'rows', columns: ''
  }]));
  return { sources, term: '', profiles: defaultProfiles_(), overrides: '' };
}

function parseSourceUrl_(url) {
  const match = clean_(url).match(/^https:\/\/docs\.google\.com\/spreadsheets\/d\/([\w-]+)(?:[/?#][^\s]*)?$/);
  if (!match) throw new Error('BAD_SHEET_URL');
  return { id: match[1], gid: url.match(/[?#&]gid=(\d+)/)?.[1] };
}

function validateSettings_(input) {
  if (!input || typeof input !== 'object') throw new Error('BAD_SETTINGS');
  const term = clean_(input.term);
  if (term && !/^20\d{2}-[12]$/.test(term)) throw new Error('BAD_TERM');
  const sources = Object.fromEntries(SOURCE_KEYS.map(key => {
    const source = input.sources?.[key] || {};
    const url = clean_(source.url);
    if (url) parseSourceUrl_(url);
    const header = Number(source.header);
    const tab = clean_(source.tab);
    const columns = clean_(source.columns).toUpperCase();
    const allowed = ['name','grade','group','number','date','status','period','time'];
    if (!Number.isInteger(header) || header < 1 || header > 100 || tab.length > 100 ||
        columns.length > 140 || (columns && columns.split(',').some(part => {
          const match = part.trim().match(/^([A-Z]+)\s*=\s*([A-Z]{1,3})$/);
          return !match || !allowed.includes(match[1].toLowerCase());
        }))) throw new Error('BAD_SETTINGS');
    return [key, { url, tab, header, mode: key === 'attendance' && source.mode === 'grid' ? 'grid' : 'rows', columns }];
  }));
  const profiles = Object.fromEntries(Object.keys(defaultProfiles_()).map(key => {
    const slots = input.profiles?.[key];
    if (!Array.isArray(slots) || slots.length !== 9) throw new Error('BAD_PERIODS');
    const values = slots.map(clean_);
    const ranges = values.filter(Boolean).map(value => {
      if (!/^(?:[01]\d|2[0-3]):[0-5]\d-(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)) throw new Error('BAD_PERIODS');
      const [start, end] = value.split('-');
      if (start >= end) throw new Error('BAD_PERIODS');
      return [start, end];
    }).sort((a, b) => a[0].localeCompare(b[0]));
    if (ranges.some((range, i) => i > 0 && ranges[i - 1][1] > range[0])) throw new Error('OVERLAPPING_PERIODS');
    return [key, values];
  }));
  const overrides = clean_(input.overrides);
  const dates = overrides ? overrides.split(/[\s,]+/) : [];
  if (dates.length > 120 || dates.some(date => dayKey_(date) !== date)) throw new Error('BAD_SHORT_DATES');
  return { sources, term, profiles, overrides: [...new Set(dates)].join(', ') };
}

function sheet_(source, key) {
  const tag = key.toUpperCase();
  if (!source.url) throw new Error(tag + '_SOURCE_REQUIRED');
  const location = parseSourceUrl_(source.url);
  try {
    const book = SpreadsheetApp.openById(location.id);
    const sheet = source.tab ? book.getSheetByName(source.tab)
      : book.getSheets().find(tab => String(tab.getSheetId()) === location.gid);
    if (!sheet) throw new Error(tag + '_TAB_MISSING');
    return sheet;
  } catch (error) {
    if (error.message === tag + '_TAB_MISSING') throw error;
    throw new Error(tag + '_SOURCE_UNAVAILABLE');
  }
}

function inspect_(sources) {
  return Object.fromEntries(SOURCE_KEYS.map(key => {
    try {
      const source = sources[key];
      const loc = parseSourceUrl_(source.url);
      const book = SpreadsheetApp.openById(loc.id);
      const tabs = book.getSheets().map(tab => ({ name: tab.getName(), gid: tab.getSheetId() }));
      let sheet;
      try { sheet = sheet_(source, key); } catch (error) { return [key, { tabs, error: error.message }]; }
      const width = Math.min(sheet.getLastColumn(), 100);
      const headers = width ? sheet.getRange(source.header, 1, 1, width).getDisplayValues()[0] : [];
      return [key, { tabs, headers, layout: source.mode === 'grid' ? 'grid' : key === 'attendance' || key === 'clinic' ? 'rows' : 'fixed' }];
    } catch (_) { return [key, { error: key.toUpperCase() + '_SOURCE_UNAVAILABLE' }]; }
  }));
}

function locked_(work) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(15000)) throw new Error('BUSY');
  try { return work(); } finally { lock.releaseLock(); }
}

function table_(source, key) {
  const sheet = sheet_(source, key);
  const height = sheet.getLastRow() - source.header + 1;
  const width = sheet.getLastColumn();
  if (height < 1 || width < 1) throw new Error(key.toUpperCase() + '_LAYOUT_UNKNOWN');
  const [headers, ...rows] = sheet.getRange(source.header, 1, height, width).getDisplayValues();
  return { headers, rows };
}

function digest_(text) {
  return Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, text))
    .replace(/=+$/, '');
}

function norm_(value) { return clean_(value).toLowerCase().replace(/\s+/g, ''); }
function grade_(value) { return clean_(value).match(/^(?:G\s*)?(7|8|9|10|11|12)(?:학년|\s*grade)?$/i)?.[1] || ''; }
function group_(value) { return clean_(value).toUpperCase().replace(/\s/g, '').replace(/반$/, ''); }
function number_(value) { return clean_(value).replace(/번$/, '').replace(/^0+(?=\d)/, ''); }
function period_(value) {
  const text = norm_(value);
  if (['hr', 'homeroom', '조회', '홈룸'].includes(text)) return 'HR';
  if (['lunch', '점심', '점심시간', '중식'].includes(text)) return 'Lunch';
  return text.match(/^([1-7])(?:교시|p)?$/)?.[1] || '';
}

function weekday_(value) {
  const days = ['월','화','수','목','금'];
  const en = ['mon','tue','wed','thu','fri'];
  const text = norm_(value);
  const ko = days.indexOf(text.replace(/요일$/, ''));
  if (ko >= 0) return days[ko];
  const english = en.indexOf(text.slice(0, 3));
  return english >= 0 ? days[english] : '';
}

function buildStudents_(courseRows, scheduleRows, publicSlots = []) {
  const roster = new Map();
  const labels = new Map();
  for (const row of courseRows) {
    const name = clean_(row[0]);
    const grade = grade_(row[1]);
    const group = group_(row[2]);
    const number = number_(row[9]);
    if (!name || !grade || !group) continue;
    const key = JSON.stringify([grade, group, number, norm_(name)]);
    if (!roster.has(key)) roster.set(key, { id: digest_(key).slice(0, 22), name, names: [name],
      grade, group, number, courses: new Map(), lessons: {} });
    const code = clean_(row[16]);
    const subject = { ko: clean_(row[10]) || clean_(row[12]), en: clean_(row[11]) || clean_(row[13]) };
    if (code) {
      roster.get(key).courses.set(code, subject);
      if ((subject.ko || subject.en) && !labels.has(code)) labels.set(code, subject);
    }
  }
  const slots = new Map();
  const publicKeys = new Set();
  for (const row of scheduleRows) {
    const grade = grade_(row[0]);
    const group = group_(row[1]);
    const day = weekday_(row[2]);
    const period = period_(row[3]);
    const code = clean_(row[4]);
    if (!grade || !group || !day || !period || !code) continue;
    const groupKey = grade + ':' + group;
    if (!slots.has(groupKey)) slots.set(groupKey, new Map());
    const groupSlots = slots.get(groupKey);
    const key = day + ':' + period;
    if (!groupSlots.has(key)) groupSlots.set(key, []);
    const lessons = groupSlots.get(key);
    const room = [clean_(row[6]), clean_(row[8])].filter(Boolean);
    const lesson = { code, teacher: clean_(row[5]), room: [...new Set(room)].join(' / ') };
    const title = labels.get(code);
    if (title && /^[A-Z0-9]{1,4}$/.test(group)) {
      const ko = title.ko || title.en;
      const en = title.en || title.ko;
      if (ko.length <= 100 && en.length <= 100 && lesson.room.length <= 100) {
        const publicKey = digest_(JSON.stringify([grade, group, day, period, ko, en, lesson.room])).slice(0, 22);
        if (!publicKeys.has(publicKey)) {
          publicKeys.add(publicKey);
          publicSlots.push({ key: publicKey, grade, group, day, period, ko, en, room: lesson.room });
        }
        lesson.publicKey = publicKey;
      }
    }
    if (!lessons.some(item => item.code === code && item.room === lesson.room && item.teacher === lesson.teacher)) lessons.push(lesson);
  }
  if (!roster.size) throw new Error('COURSES_LAYOUT_UNKNOWN');
  if (!slots.size) throw new Error('SCHEDULE_LAYOUT_UNKNOWN');
  let populated = 0;
  const students = Array.from(roster.values(), ({ courses, ...student }) => {
    const groupSlots = slots.get(student.grade + ':' + student.group) || [];
    for (const [key, choices] of groupSlots) {
      const matches = choices.length === 1 ? choices : choices.filter(lesson => courses.has(lesson.code));
      if (matches.length !== 1) {
        student.lessons[key] = { unresolved: true };
        continue;
      }
      const lesson = matches[0];
      const names = courses.get(lesson.code) || {};
      student.lessons[key] = { ...lesson, ko: names.ko || names.en || lesson.code, en: names.en || names.ko || lesson.code };
      populated++;
    }
    return student;
  });
  if (!populated) throw new Error('NO_MATCHING_TIMETABLES');
  return students.sort((a, b) => a.grade - b.grade || a.group.localeCompare(b.group) ||
    Number(a.number) - Number(b.number) || a.name.localeCompare(b.name, 'ko'));
}

function snapshotInfo_(props) {
  return JSON.parse(props.getProperty('SNAPSHOT') || 'null');
}

function sync_(props, settings, token) {
  if (!settings.term) throw new Error('TERM_REQUIRED');
  const students = buildStudents_(table_(settings.sources.courses, 'courses').rows,
    table_(settings.sources.schedule, 'schedule').rows);
  const previous = snapshotInfo_(props);
  const oldStudents = previous ? snapshot_(props).students : [];
  let bookId = props.getProperty('SNAPSHOT_BOOK');
  if (!bookId) {
    bookId = SpreadsheetApp.create('HIS Finder · 비공개 시간표 캐시').getId();
    props.setProperty('SNAPSHOT_BOOK', bookId);
  }
  const book = SpreadsheetApp.openById(bookId);
  const tab = book.insertSheet('snapshot_' + Date.now());
  const at = new Date().toISOString();
  const payload = JSON.stringify({ at, term: settings.term, students });
  const zipped = Utilities.base64Encode(Utilities.gzip(Utilities.newBlob(payload)).getBytes());
  const chunks = zipped.match(/.{1,30000}/g).map(chunk => ['b:' + chunk]);
  const info = { tab: tab.getName(), term: settings.term, at, count: students.length };
  try {
    tab.getRange(1, 1, chunks.length, 1).setValues(chunks);
    SpreadsheetApp.flush();
    props.setProperty('SNAPSHOT', JSON.stringify(info));
    try {
      writeFinderDirectory_(info, students, token);
    } catch (error) {
      if (previous) props.setProperty('SNAPSHOT', JSON.stringify(previous));
      else props.deleteProperty('SNAPSHOT');
      try { deleteFinderDirectory_(info.tab, students, token); } catch (_) {}
      throw error;
    }
  } catch (error) {
    try { book.deleteSheet(tab); } catch (_) {}
    throw error;
  }
  // Keep the preceding snapshot available to readers that started just before this refresh.
  try {
    for (const old of book.getSheets()) {
      if (old.getName().startsWith('snapshot_') && old.getName() !== info.tab &&
          old.getName() !== previous?.tab) book.deleteSheet(old);
    }
  } catch (_) {}
  if (previous) {
    try { deleteFinderDirectory_(previous.tab, oldStudents, token); } catch (_) {}
  }
  return info;
}

function snapshot_(props) {
  const info = snapshotInfo_(props);
  if (!info) throw new Error('SYNC_REQUIRED');
  const cache = CacheService.getScriptCache();
  const key = 'timetable:' + info.tab;
  const hit = cache.get(key);
  const packed = hit || SpreadsheetApp.openById(props.getProperty('SNAPSHOT_BOOK')).getSheetByName(info.tab)
    .getDataRange().getDisplayValues().map(row => row[0].slice(2)).join('');
  if (!hit && packed.length < 95000) cache.put(key, packed, 600);
  return JSON.parse(Utilities.ungzip(Utilities.newBlob(Utilities.base64Decode(packed), 'application/gzip')).getDataAsString());
}

function searchTerms_(name) {
  const letters = [...norm_(name)].slice(0, 40);
  const terms = new Set();
  for (let start = 0; start < letters.length; start++) {
    for (let end = start + 2; end <= letters.length; end++) terms.add(letters.slice(start, end).join(''));
  }
  if (letters.length === 1) terms.add(letters[0]);
  return [...terms];
}

function firestoreValue_(value) {
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') return { integerValue: String(value) };
  if (typeof value === 'string') return { stringValue: value };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(firestoreValue_) } };
  return { mapValue: { fields: Object.fromEntries(Object.entries(value).map(([key, item]) => [key, firestoreValue_(item)])) } };
}

const FINDER_DOCUMENTS = 'projects/' + PROJECT + '/databases/(default)/documents';

function firestoreFetch_(path, token, writes) {
  const options = { headers: { Authorization: 'Bearer ' + token }, muteHttpExceptions: true };
  if (writes) Object.assign(options, { method: 'post', contentType: 'application/json', payload: JSON.stringify({ writes }) });
  const response = UrlFetchApp.fetch('https://firestore.googleapis.com/v1/' + FINDER_DOCUMENTS + path, options);
  if (response.getResponseCode() === 403) throw new Error('FIRESTORE_RULES_REQUIRED');
  if (response.getResponseCode() !== 200) throw new Error('FIRESTORE_SYNC_FAILED');
  return JSON.parse(response.getContentText());
}

function directoryPath_(version, id) {
  return '/finderSnapshots/' + version + '/students/' + id;
}

function firestoreUpdate_(path, record) {
  return { update: { name: FINDER_DOCUMENTS + path, fields: firestoreValue_(record).mapValue.fields } };
}

function commitFinderWrites_(writes, token) {
  for (let i = 0; i < writes.length; i += 50) firestoreFetch_(':commit', token, writes.slice(i, i + 50));
}

function writeFinderDirectory_(info, students, token) {
  const writes = students.map(({ id, name, grade, group, number, lessons }) =>
    firestoreUpdate_(directoryPath_(info.tab, id), { name, grade, group, number, lessons, terms: searchTerms_(name) }));
  commitFinderWrites_(writes, token);
  try {
    commitFinderWrites_([firestoreUpdate_('/finderConfig/current', { version: info.tab, term: info.term, at: info.at })], token);
  } catch (error) {
    // A lost response can follow a successful commit. Keep the new snapshot if the pointer already moved.
    let current;
    try { current = firestoreFetch_('/finderConfig/current', token); } catch (_) {}
    if (current?.fields?.version?.stringValue !== info.tab) throw error;
  }
}

function deleteFinderDirectory_(version, students, token) {
  commitFinderWrites_(students.map(({ id }) => ({ delete: FINDER_DOCUMENTS + directoryPath_(version, id) })), token);
}

function publicPreview_(settings, props) {
  if (!settings.term) throw new Error('TERM_REQUIRED');
  const slots = [];
  buildStudents_(table_(settings.sources.courses, 'courses').rows, table_(settings.sources.schedule, 'schedule').rows, slots);
  if (!slots.length) throw new Error('NO_PUBLIC_SLOTS');
  slots.sort((a, b) => a.key.localeCompare(b.key));
  const data = { schema: 1, term: settings.term, slots };
  const revision = digest_(JSON.stringify(data));
  return { data, revision, branch: props.getProperty('GITHUB_BRANCH') || 'main' };
}

function publishPublic_(settings, props, expectedRevision) {
  const token = props.getProperty('GITHUB_TIMETABLE_TOKEN');
  if (!token) throw new Error('GITHUB_TOKEN_REQUIRED');
  const preview = publicPreview_(settings, props);
  if (preview.revision !== expectedRevision) throw new Error('PUBLIC_PREVIEW_CHANGED');
  const branch = preview.branch;
  const url = 'https://api.github.com/repos/Jinoo83S/HIS-Finder/contents/timetable.json';
  const headers = { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json' };
  const get = UrlFetchApp.fetch(url + '?ref=' + encodeURIComponent(branch), { headers, muteHttpExceptions: true });
  const code = get.getResponseCode();
  if (code !== 200 && code !== 404) throw new Error('GITHUB_PUBLISH_FAILED');
  const content = Utilities.base64Encode(JSON.stringify(preview.data, null, 2) + '\n', Utilities.Charset.UTF_8);
  const existing = code === 200 ? JSON.parse(get.getContentText()) : null;
  if (existing?.content?.replace(/\s/g, '') === content) return { count: preview.data.slots.length, unchanged: true };
  const saved = UrlFetchApp.fetch(url, { method: 'put', contentType: 'application/json', headers, muteHttpExceptions: true,
    payload: JSON.stringify({ branch, content, sha: existing?.sha, message: 'Publish public class timetable ' + settings.term }) });
  if (![200, 201].includes(saved.getResponseCode())) throw new Error('GITHUB_PUBLISH_FAILED');
  return { count: preview.data.slots.length, branch };
}

const HEADERS = {
  name: ['성명','이름','학생명','학생이름','학생성명','한글이름','한글성명','name','studentname','koreanname','학생'],
  grade: ['학년','grade'], group: ['반','학급','class','section','homeroom'],
  number: ['번호','출석번호','number','studentnumber','no'],
  date: ['날짜','일자','일시','출결일','출결일자','방문일','방문일자','방문일시','기록일자','타임스탬프','date','timestamp','visitdate','attendancedate'],
  status: ['출결','출결상태','상태','출결구분','출결유형','종류','구분','status','attendance','type'],
  period: ['교시','해당교시','결과교시','period'],
  time: ['시간','시각','출결시간','time']
};

function columns_(headers, overrides) {
  const normalized = headers.map(header => norm_(header).replace(/[_.()-]/g, ''));
  const roles = Object.fromEntries(Object.entries(HEADERS).map(([key, list]) =>
    [key, normalized.findIndex(value => list.includes(value))]));
  if (overrides) for (const part of overrides.split(',')) {
    const [key, letters] = part.split('=').map(value => value.trim());
    roles[key.toLowerCase()] = [...letters].reduce((sum, letter) => sum * 26 + letter.charCodeAt(0) - 64, 0) - 1;
  }
  return roles;
}

function todayRecords_(key, source, date) {
  const { headers, rows } = table_(source, key);
  const c = columns_(headers, source.columns);
  const grid = key === 'attendance' && source.mode === 'grid';
  const statuses = grid ? headers.flatMap((header, index) => dayKey_(header) === date ? [index] : []) : [c.status];
  const exists = index => Number.isInteger(index) && index >= 0 && index < headers.length;
  if (!exists(c.name) || (!grid && (!exists(c.date) || (key === 'attendance' && !exists(c.status))))) {
    throw new Error(key.toUpperCase() + '_LAYOUT_UNKNOWN');
  }
  if (grid && !statuses.length) throw new Error('ATTENDANCE_DATE_NOT_FOUND');
  return rows.flatMap(row => {
    const name = norm_(row[c.name]);
    if (!name || (!grid && dayKey_(row[c.date]) !== date)) return [];
    const info = { name, grade: grade_(row[c.grade]), group: group_(row[c.group]), number: number_(row[c.number]) };
    if (key === 'clinic') return [info];
    return statuses.flatMap(column => {
      const state = attendanceStatus_(row[column]);
      return state ? [{ ...info, state, period: period_(row[c.period]) || period_(row[column]?.match(/([1-7])\s*교시/)?.[1]),
        time: clean_(row[c.time]).match(/(?:^|\s)([012]?\d:[0-5]\d)(?::[0-5]\d)?(?:$|\s)/)?.[1] || '' }] : [];
    });
  });
}

function attendanceStatus_(value) {
  const text = norm_(value);
  if (!text || /^(출석|정상|present|[.✓✔-])$/.test(text)) return '';
  if (/조퇴|earlydeparture/.test(text)) return 'early';
  if (/지각|late|tardy/.test(text)) return 'late';
  if (/결과|missedclass|periodabsence/.test(text)) return 'missed';
  if (/결석|absent|absence/.test(text)) return 'absent';
  return 'other';
}

function live_(student, students, settings, force) {
  const now = new Date();
  const date = Utilities.formatDate(now, ZONE, 'yyyy-MM-dd');
  const cache = CacheService.getScriptCache();
  const matches = (item, record) => item.names.some(name => norm_(name) === record.name) &&
    (!record.grade || record.grade === item.grade) && (!record.group || record.group === item.group) &&
    (!record.number || record.number === item.number);
  const lookup = key => {
    try {
      const source = settings.sources[key];
      const cacheKey = 'attendance:' + date + ':' + digest_(JSON.stringify(source));
      const value = key === 'attendance' && !force ? cache.get(cacheKey) : null;
      const batch = value ? JSON.parse(value) : { at: now.toISOString(), records: todayRecords_(key, source, date) };
      if (key === 'attendance' && !value) {
        const payload = JSON.stringify(batch);
        if (Utilities.newBlob(payload).getBytes().length < 95000) cache.put(cacheKey, payload, CACHE_SECONDS);
      }
      const candidates = batch.records.filter(record => matches(student, record));
      const eligible = candidates.filter(record => students.filter(item => matches(item, record)).length === 1);
      return { at: batch.at, ambiguous: eligible.length !== candidates.length,
        ...(key === 'attendance' ? { events: eligible.map(({ state, period, time }) => ({ state, period, time })) }
          : { visited: eligible.length > 0 }) };
    } catch (error) {
      const reason = /^[A-Z][A-Z0-9_]{1,70}$/.test(error.message) ? error.message : 'SOURCE_READ_FAILED';
      return { error: reason };
    }
  };
  return { date, attendance: lookup('attendance'), clinic: lookup('clinic') };
}
