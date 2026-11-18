import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// Uses the existing HIS Firebase project for staff sign-in and role verification.
const firebaseConfig = {
  apiKey: "AIzaSyBeSyJY2pET002knu7KWKuqV-Nkhy7OEHQ",
  authDomain: "his-main.firebaseapp.com",
  projectId: "his-main",
  storageBucket: "his-main.firebasestorage.app",
  messagingSenderId: "311279275648",
  appId: "1:311279275648:web:3609db730ec2b0e77ea065"
};
const API_BASE = "/api/student-finder";
const ALLOWED_DOMAIN = "his.sc.kr";

const auth = getAuth(initializeApp(firebaseConfig));
const db = getFirestore();
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
  gateMessage.textContent = "로그인 중입니다…";
  try { await signInWithPopup(auth, provider); }
  catch (error) { gateMessage.textContent = "로그인할 수 없습니다. 학교 계정을 확인해 주세요."; console.error(error); }
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
    gateMessage.textContent = "@his.sc.kr 학교 계정으로 로그인해 주세요.";
    return;
  }
  try {
    const staff = await getDoc(doc(db, "staff", user.email));
    const role = staff.exists() ? staff.data().role : null;
    if (!staff.exists() || !["teacher", "staff", "admin"].includes(role)) {
      await signOut(auth);
      gateMessage.textContent = "등록된 교직원 계정만 사용할 수 있습니다.";
      return;
    }
    gate.hidden = true;
    appShell.hidden = false;
    document.querySelector("#account-email").textContent = user.email;
    setNotice("교직원 인증을 마쳤습니다. 학생 검색 API를 연결하면 검색을 시작할 수 있습니다.", "info");
  } catch (error) {
    console.error(error);
    await signOut(auth);
    gateMessage.textContent = "계정 권한을 확인하지 못했습니다. 관리자에게 문의해 주세요.";
  }
});

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const query = searchInput.value.trim();
  if (!query) return;
  const user = auth.currentUser;
  if (!user) return;
  setNotice("학생 정보를 찾고 있습니다…", "info");
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
    setNotice(students.length ? `${students.length}명의 학생을 찾았습니다.` : "검색 결과가 없습니다.", students.length ? "success" : "info");
  } catch (error) {
    if (error.message === "연동 대기") setNotice("학생 데이터 API가 아직 연결되지 않았습니다. README의 서버 연동 항목을 먼저 완료해 주세요.", "info");
    else if (error.message === "권한 없음") setNotice("이 정보에 접근할 권한이 없습니다. 학교 관리자에게 문의해 주세요.", "error");
    else { console.error(error); setNotice("검색 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.", "error"); }
  }
});

function makeStudentCard(student) {
  const card = document.createElement("article");
  card.className = "student-card";
  const heading = document.createElement("div");
  heading.className = "student-heading";
  const identity = document.createElement("div");
  const name = document.createElement("h2");
  name.textContent = safeText(student.name, "이름 미등록");
  const sub = document.createElement("p");
  sub.className = "student-sub";
  sub.textContent = [student.grade && `${student.grade}학년`, student.class && `${student.class}반`].filter(Boolean).join(" · ") || "학년/반 정보 없음";
  identity.append(name, sub);
  const number = document.createElement("span");
  number.className = "student-id";
  number.textContent = student.studentNumber ? `번호 ${student.studentNumber}` : "";
  heading.append(identity, number);
  const grid = document.createElement("div");
  grid.className = "info-grid";
  grid.append(
    panel("시간표", student.timetable, "시간표 데이터 없음"),
    panel("오늘 출결", student.attendance, "오늘 출결 데이터 없음"),
    panel("보건실", student.health, "보건실 기록 없음")
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
