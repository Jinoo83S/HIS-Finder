"use strict";

const { onRequest } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const { google } = require("googleapis");

initializeApp();
const db = getFirestore();
const REGION = "asia-northeast3";
const DOMAIN = "his.sc.kr";
const ADMIN_EMAIL = "jinwoosuk@his.sc.kr";
const CONFIG_REF = db.doc("adminSettings/studentFinder");
const DATA_ROOT = db.collection("studentFinderData");
const SOURCES = {
  timetable: "https://docs.google.com/spreadsheets/d/1yw-l67mV2t4ZynqjTgmQ1uTp0MPRc_dd2gPEL7QXVdg/edit?gid=1631354026#gid=1631354026",
  attendance: "https://docs.google.com/spreadsheets/d/1MfqOPPHc0BacimghJEGw8Ba1r_pN9Z4POTAEJu4ymM0/edit?gid=1507799363#gid=1507799363",
  health: "https://docs.google.com/spreadsheets/d/1Y1thlOAf9BGjXKbG3jL6CBLVkpuyeSiw9wS62Y6lYTE/edit?gid=974283698#gid=974283698"
};

exports.studentFinderApi = onRequest({
  region: REGION,
  cors: ["https://jinoo83s.github.io"],
  maxInstances: 10,
  timeoutSeconds: 120
}, async (req, res) => {
  res.set("Cache-Control", "no-store");
  try {
    const user = await requireUser(req);
    const route = req.path.replace(/^\/+|\/+$/g, "");
    if (req.method === "GET" && route === "search") {
      const q = String(req.query.q || "").trim();
      if (!q) return res.status(400).json({ error: "Search query is required." });
      return res.json({ students: await searchStudents(q) });
    }
    if (route === "admin/settings" && req.method === "GET") {
      await requireAdmin(user);
      return res.json({ sources: await getAdminSources() });
    }
    if (route === "admin/settings" && req.method === "PUT") {
      await requireAdmin(user);
      return res.json({ sources: await saveAdminSources(req.body?.sources, user.email) });
    }
    const syncMatch = route.match(/^sync\/(timetable|attendance|health)$/);
    if (req.method === "POST" && syncMatch) {
      await requireAdmin(user);
      const source = syncMatch[1];
      const result = await syncSource(source);
      return res.json({ ok: true, message: result.message, rowCount: result.rowCount });
    }
    return res.status(404).json({ error: "Not found." });
  } catch (error) {
    console.error("Student Finder API error:", error.message);
    const status = error.status || 500;
    return res.status(status).json({ error: status >= 500 ? "Student data service is unavailable." : error.message });
  }
});

exports.refreshStudentAttendanceDaily = onSchedule({
  schedule: "0 7 * * *",
  timeZone: "Asia/Seoul",
  region: REGION,
  maxInstances: 1,
  timeoutSeconds: 300
}, async () => {
  await syncSource("attendance");
});

async function requireUser(req) {
  const header = req.get("authorization") || "";
  const token = header.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) throw httpError(401, "Sign-in required.");
  let decoded;
  try { decoded = await getAuth().verifyIdToken(token); }
  catch { throw httpError(401, "Invalid sign-in token."); }
  const email = String(decoded.email || "").toLowerCase();
  if (!decoded.email_verified || !email.endsWith(`@${DOMAIN}`)) throw httpError(403, "Use a verified HIS account.");
  return decoded;
}

async function requireAdmin(user) {
  const email = String(user.email || "").toLowerCase();
  if (email !== ADMIN_EMAIL) throw httpError(403, "Admin access required.");
}

async function getSources() {
  const snapshot = await CONFIG_REF.get();
  const configured = snapshot.exists ? snapshot.data().sources || {} : {};
  const sources = {};
  for (const name of Object.keys(SOURCES)) sources[name] = configured[name]?.url || SOURCES[name];
  return sources;
}

async function getAdminSources() {
  const snapshot = await CONFIG_REF.get();
  const configured = snapshot.exists ? snapshot.data().sources || {} : {};
  const result = {};
  for (const name of Object.keys(SOURCES)) {
    const saved = configured[name] || {};
    const timestamp = saved.lastSyncedAt;
    result[name] = {
      url: saved.url || SOURCES[name],
      lastSyncedAt: timestamp?.toDate ? timestamp.toDate().toISOString() : timestamp || null
    };
  }
  return result;
}

async function saveAdminSources(input, email) {
  if (!input || typeof input !== "object") throw httpError(400, "Source URLs are required.");
  const snapshot = await CONFIG_REF.get();
  const configured = snapshot.exists ? snapshot.data().sources || {} : {};
  for (const name of Object.keys(SOURCES)) {
    const url = String(input[name]?.url || "").trim();
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || parsed.hostname !== "docs.google.com") throw httpError(400, "Use a Google Sheets URL.");
    parseSheetUrl(url);
    configured[name] = { ...(configured[name] || {}), url };
  }
  await CONFIG_REF.set({ sources: configured, updatedAt: Timestamp.now(), updatedBy: String(email).toLowerCase() }, { merge: true });
  return getAdminSources();
}

async function sheetsClient() {
  const auth = new google.auth.GoogleAuth({ scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"] });
  return google.sheets({ version: "v4", auth: await auth.getClient() });
}

function parseSheetUrl(url) {
  const id = String(url || "").match(/\/spreadsheets\/d\/([\w-]+)/)?.[1];
  const gid = Number(String(url || "").match(/[?#&]gid=(\d+)/)?.[1]);
  if (!id || !Number.isFinite(gid)) throw httpError(400, "A valid Google Sheets URL with gid is required.");
  return { id, gid };
}

async function readSheet(url) {
  const { id, gid } = parseSheetUrl(url);
  const sheets = await sheetsClient();
  const metadata = await sheets.spreadsheets.get({ spreadsheetId: id, fields: "sheets.properties(sheetId,title)" });
  const tab = (metadata.data.sheets || []).map(item => item.properties).find(properties => properties.sheetId === gid);
  if (!tab) throw httpError(400, `The sheet tab gid=${gid} was not found.`);
  const range = `'${tab.title.replace(/'/g, "''")}'!A:ZZ`;
  const response = await sheets.spreadsheets.values.get({ spreadsheetId: id, range, valueRenderOption: "FORMATTED_VALUE" });
  const matrix = response.data.values || [];
  if (!matrix.length) return [];
  const headers = matrix[0].map((value, i) => String(value || "").trim() || `Column ${i + 1}`);
  return matrix.slice(1).filter(row => row.some(value => String(value || "").trim())).map((row, rowIndex) => {
    const fields = {};
    headers.forEach((header, index) => { fields[header] = String(row[index] ?? "").trim(); });
    return normalizeRow(fields, rowIndex + 2);
  });
}

function normalizeHeader(value) { return String(value || "").toLowerCase().replace(/[\s_\-()（）.]/g, ""); }
function pick(fields, aliases) {
  const entries = Object.entries(fields);
  const normalizedAliases = aliases.map(normalizeHeader);
  const found = entries.find(([key, value]) => normalizedAliases.includes(normalizeHeader(key)) && value !== "");
  return found ? found[1] : "";
}
function normalizeRow(fields, rowNumber) {
  const id = pick(fields, ["학생id", "학생id번호", "학번", "studentid", "student id", "sid"]);
  const name = pick(fields, ["학생명", "이름", "성명", "name", "studentname", "student name"]);
  const grade = pick(fields, ["학년", "grade", "yearlevel"]);
  const classroom = pick(fields, ["반", "학급", "class", "homeroom"]);
  const number = pick(fields, ["번호", "출석번호", "학생번호", "number", "studentnumber", "rollno"]);
  const identity = id || [grade, classroom, number].filter(Boolean).join("-") || name;
  return { rowNumber, identity: normalizeHeader(identity), id, name, grade, classroom, number, fields };
}

async function syncSource(source) {
  const sources = await getSources();
  const rows = await readSheet(sources[source]);
  await recordSync(source, sources[source]);
  if (source === "health") {
    // Health data is fetched directly on each student search so the app never serves a stale snapshot.
    return { rowCount: rows.length, message: `보건실 시트를 새로 확인했습니다. (${rows.length}행)` };
  }
  if (source === "timetable") {
    const current = await DATA_ROOT.doc(source).get();
    const term = getKoreanSemester(new Date());
    if (current.exists && current.data().semester === term) throw httpError(409, `${term} 시간표는 이미 연동되었습니다.`);
  }
  const rowCount = await replaceGeneration(source, rows);
  const metadata = {
    activeGeneration: String(Date.now()),
    rowCount,
    syncedAt: Timestamp.now(),
    semester: source === "timetable" ? getKoreanSemester(new Date()) : null
  };
  // replaceGeneration returns generation ID alongside count.
  metadata.activeGeneration = rowCount.generation;
  metadata.rowCount = rowCount.count;
  await DATA_ROOT.doc(source).set(metadata, { merge: true });
  return { rowCount: rowCount.count, message: `${rowCount.count}행을 연동했습니다.` };
}

async function replaceGeneration(source, rows) {
  const generation = `${Date.now()}`;
  const writer = db.bulkWriter();
  rows.forEach((row, index) => {
    const id = String(index).padStart(7, "0");
    writer.set(DATA_ROOT.doc(source).collection(generation).doc(id), row);
  });
  await writer.close();
  return { generation, count: rows.length };
}

async function recordSync(source, url) {
  const snapshot = await CONFIG_REF.get();
  const sources = snapshot.exists ? snapshot.data().sources || {} : {};
  sources[source] = { ...(sources[source] || {}), url, lastSyncedAt: Timestamp.now() };
  await CONFIG_REF.set({ sources, updatedAt: Timestamp.now() }, { merge: true });
}

async function activeRows(source) {
  const metadata = await DATA_ROOT.doc(source).get();
  if (!metadata.exists || !metadata.data().activeGeneration) return [];
  const snapshot = await DATA_ROOT.doc(source).collection(metadata.data().activeGeneration).get();
  return snapshot.docs.map(doc => doc.data());
}

async function searchStudents(query) {
  const sources = await getSources();
  const [timetable, attendance, health] = await Promise.all([
    activeRows("timetable"), activeRows("attendance"), readSheet(sources.health)
  ]);
  const q = normalizeHeader(query);
  const grouped = new Map();
  for (const [source, rows] of [["timetable", timetable], ["attendance", attendance], ["health", health]]) {
    for (const row of rows) {
      const searchable = normalizeHeader([row.name, row.id, row.grade, row.classroom, row.number, ...Object.values(row.fields || {})].join(" "));
      if (!searchable.includes(q)) continue;
      const key = row.identity || normalizeHeader(row.name || `row-${row.rowNumber}`);
      if (!grouped.has(key)) grouped.set(key, { id: row.id || key, name: row.name, grade: row.grade, class: row.classroom, studentNumber: row.number, timetable: "", attendance: "", health: "" });
      const item = grouped.get(key);
      if (!item.name && row.name) item.name = row.name;
      if (!item.grade && row.grade) item.grade = row.grade;
      if (!item.class && row.classroom) item.class = row.classroom;
      if (!item.studentNumber && row.number) item.studentNumber = row.number;
      item[source] = formatFields(row.fields || {});
    }
  }
  return [...grouped.values()].slice(0, 50);
}

function formatFields(fields) {
  return Object.entries(fields).filter(([, value]) => value !== "").map(([key, value]) => `${key}: ${value}`).join(" · ");
}
function getKoreanSemester(date) {
  const month = Number(new Intl.DateTimeFormat("en", { timeZone: "Asia/Seoul", month: "numeric" }).format(date));
  const year = new Intl.DateTimeFormat("en", { timeZone: "Asia/Seoul", year: "numeric" }).format(date);
  return `${year}-${month < 8 ? "1" : "2"}`;
}
function httpError(status, message) { const error = new Error(message); error.status = status; return error; }
