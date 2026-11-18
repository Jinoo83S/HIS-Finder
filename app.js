import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { initLanguage } from "./i18n.js";

// Uses the existing HIS Firebase project for school-domain sign-in.
const firebaseConfig = {
  apiKey: "AIzaSyBeSyJY2pET002knu7KWKuqV-Nkhy7OEHQ",
  authDomain: "his-main.firebaseapp.com",
  projectId: "his-main",
  storageBucket: "his-main.firebasestorage.app",
  messagingSenderId: "311279275648",
  appId: "1:311279275648:web:3609db730ec2b0e77ea065"
};
const API_BASE = "https://asia-northeast3-his-main.cloudfunctions.net/studentFinderApi";
const ALLOWED_DOMAIN = "his.sc.kr";
const ADMIN_EMAIL = "jinwoosuk@his.sc.kr";

const auth = getAuth(initializeApp(firebaseConfig));
const t = initLanguage();
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ hd: ALLOWED_DOMAIN });

const gate = document.querySelector("#gate");
const appShell = document.querySelector("#app");
const gateMessage = document.querySelector("#gate-message");
const notice = document.querySelector("#notice");
const results = document.querySelector("#results");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");

document.querySelector("#login-button").addEventListener("click", async (event) => {
  event.currentTarget.disabled = true;
  gateMessage.textContent = t("signingIn");
  try { await signInWithPopup(auth, provider); }
  catch (error) { gateMessage.textContent = t("loginFailed"); console.error(error); }
  finally { event.currentTarget.disabled = false; }
});
document.querySelector("#logout-button").addEventListener("click", () => signOut(auth));

onAuthStateChanged(auth, async (user) => {
  results.replaceChildren();
  if (!user) {
    appShell.hidden = true;
    gate.hidden = false;
    return;
  }
  if (!user.email || user.email.toLowerCase().split("@").pop() !== ALLOWED_DOMAIN) {
    await signOut(auth);
    gateMessage.textContent = t("domainOnly");
    return;
  }
  try {
    // All verified HIS-domain accounts may use student lookup. The API enforces
    // the administrator allowlist server-side before accepting admin requests.
    gate.hidden = true;
    appShell.hidden = false;
    document.querySelector("#account-email").textContent = user.email;
    document.querySelector("#admin-link").hidden = user.email.toLowerCase() !== ADMIN_EMAIL;
    setNotice(t("ready"), "info");
  } catch (error) {
    console.error(error);
    await signOut(auth);
    gateMessage.textContent = t("permissionFailed");
  }
});

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const query = searchInput.value.trim();
  if (!query) return;
  const user = auth.currentUser;
  if (!user) return;
  setNotice(t("searching"), "info");
  results.replaceChildren();
  try {
    const token = await user.getIdToken();
    const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      cache: "no-store"
    });
    if (!response.ok) {
      if (response.status === 404 || response.status === 501) throw new Error("연동 대기");
      if (response.status === 401 || response.status === 403) throw new Error("권한 없음");
      throw new Error("검색 오류");
    }
    const payload = await response.json();
    const students = Array.isArray(payload.students) ? payload.students : [];
    students.forEach((student) => results.append(makeStudentCard(student)));
    setNotice(students.length ? t("found", { count: students.length }) : t("noResults"), students.length ? "success" : "info");
  } catch (error) {
    if (error.message === "연동 대기") setNotice(t("apiPending"), "info");
    else if (error.message === "권한 없음") setNotice(t("forbidden"), "error");
    else if (error instanceof TypeError) setNotice(t("serverOffline"), "error");
    else { console.error(error); setNotice(t("searchError"), "error"); }
  }
});

function makeStudentCard(student) {
  const card = document.createElement("article");
  card.className = "student-card";
  const heading = document.createElement("div");
  heading.className = "student-heading";
  const identity = document.createElement("div");
  const name = document.createElement("h2");
  name.textContent = safeText(student.name, t("unnamed"));
  const sub = document.createElement("p");
  sub.className = "student-sub";
  sub.textContent = [student.grade && `${student.grade} ${t("grade")}`, student.class && `${student.class} ${t("class")}`].filter(Boolean).join(" · ") || t("gradeClassMissing");
  identity.append(name, sub);
  const number = document.createElement("span");
  number.className = "student-id";
  number.textContent = student.studentNumber ? `${t("number")} ${student.studentNumber}` : "";
  heading.append(identity, number);
  const grid = document.createElement("div");
  grid.className = "info-grid";
  grid.append(
    panel(t("timetable"), student.timetable, t("noTimetable")),
    panel(t("attendance"), student.attendance, t("noAttendance")),
    panel(t("health"), student.health, t("noHealth"))
  );
  card.append(heading, grid);
  return card;
}
function panel(title, value, emptyText) {
  const box = document.createElement("section");
  box.className = "info-panel";
  const heading = document.createElement("h3"); heading.textContent = title;
  const text = document.createElement("p");
  text.textContent = value == null || value === "" ? emptyText : typeof value === "string" ? value : JSON.stringify(value);
  box.append(heading, text);
  return box;
}
function safeText(value, fallback) { return typeof value === "string" && value.trim() ? value.trim() : fallback; }
function setNotice(message, kind) { notice.textContent = message; notice.dataset.kind = kind; }
