import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBeSyJY2pET002knu7KWKuqV-Nkhy7OEHQ",
  authDomain: "his-main.firebaseapp.com",
  projectId: "his-main",
  storageBucket: "his-main.firebasestorage.app",
  messagingSenderId: "311279275648",
  appId: "1:311279275648:web:3609db730ec2b0e77ea065"
};
const API_BASE = "https://asia-northeast3-his-main.cloudfunctions.net/studentFinderApi";
const DOMAIN = "his.sc.kr";
const DEFAULT_SOURCES = {
  timetable: "https://docs.google.com/spreadsheets/d/1yw-l67mV2t4ZynqjTgmQ1uTp0MPRc_dd2gPEL7QXVdg/edit?gid=1631354026#gid=1631354026",
  attendance: "https://docs.google.com/spreadsheets/d/1MfqOPPHc0BacimghJEGw8Ba1r_pN9Z4POTAEJu4ymM0/edit?gid=1507799363#gid=1507799363",
  health: "https://docs.google.com/spreadsheets/d/1Y1thlOAf9BGjXKbG3jL6CBLVkpuyeSiw9wS62Y6lYTE/edit?gid=974283698#gid=974283698"
};
const auth = getAuth(initializeApp(firebaseConfig));
const db = getFirestore();
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ hd: DOMAIN });
const settingsRef = doc(db, "adminSettings", "studentFinder");
const gate = document.querySelector("#gate");
const app = document.querySelector("#app");
const gateError = document.querySelector("#gate-error");
const status = document.querySelector("#action-status");

document.querySelector("#login-button").addEventListener("click", async (event) => {
  event.currentTarget.disabled = true;
  gateError.textContent = "�α��� ���Դϴ١�";
  try { await signInWithPopup(auth, provider); }
  catch (error) { console.error(error); gateError.textContent = "�α������� ���߽��ϴ�. �б� ������ Ȯ���� �ּ���."; }
  finally { event.currentTarget.disabled = false; }
});
document.querySelector("#logout-button").addEventListener("click", () => signOut(auth));

onAuthStateChanged(auth, async (user) => {
  app.hidden = true;
  if (!user) { gate.hidden = false; return; }
  if (!user.email || user.email.toLowerCase().split("@").pop() !== DOMAIN) {
    await signOut(auth);
    gateError.textContent = "@his.sc.kr �������� �α����� �ּ���.";
    return;
  }
  try {
    const staffSnapshot = await getDoc(doc(db, "staff", user.email));
    if (!staffSnapshot.exists() || staffSnapshot.data().role !== "admin") {
      await signOut(auth);
      gateError.textContent = "������ ������ ��ϵ� ������ ����� �� �ֽ��ϴ�.";
      return;
    }
    document.querySelector("#account-email").textContent = user.email;
    gate.hidden = true;
    app.hidden = false;
    await loadSettings();
  } catch (error) {
    console.error(error);
    await signOut(auth);
    gateError.textContent = "������ ������ Ȯ������ ���߽��ϴ�.";
  }
});

async function loadSettings() {
  const snapshot = await getDoc(settingsRef);
  const sources = snapshot.exists() ? snapshot.data().sources || {} : {};
  for (const key of ["timetable", "attendance", "health"]) {
    document.querySelector(`#${key}-url`).value = sources[key]?.url || DEFAULT_SOURCES[key];
    const last = sources[key]?.lastSyncedAt?.toDate?.();
    const label = key === "health" ? "��ȸ �� �ֽ� �ڷ� ���" : "������ ����: ";
    document.querySelector(`#${key}-meta`).textContent = key === "health"
      ? last ? `������ ���ΰ�ħ: ${formatDate(last)}` : label
      : last ? `������ ����: ${formatDate(last)}` : `${label}��� ����`;
  }
  document.querySelector("#admin-notice").textContent = "������ ������ Ȯ���߽��ϴ�. �ּҸ� ������ �� �ʿ��� �ڷḦ �����ϼ���.";
  document.querySelector("#admin-notice").dataset.kind = "success";
}

document.querySelector("#settings-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = event.submitter;
  button.disabled = true;
  setStatus("��Ʈ �ּҸ� �����ϰ� �ֽ��ϴ١�");
  try {
    const sources = {};
    for (const key of ["timetable", "attendance", "health"]) {
      sources[key] = { url: document.querySelector(`#${key}-url`).value.trim() };
    }
    await setDoc(settingsRef, { sources, updatedAt: serverTimestamp(), updatedBy: auth.currentUser.email }, { merge: true });
    setStatus("��Ʈ �ּҸ� �����߽��ϴ�.", "success");
  } catch (error) {
    console.error(error);
    setStatus("�������� ���߽��ϴ�. Firebase ������ ���Ѱ� ���� ��Ģ�� Ȯ���� �ּ���.", "error");
  } finally { button.disabled = false; }
});

document.querySelectorAll("[data-sync]").forEach((button) => button.addEventListener("click", async () => {
  const source = button.dataset.sync;
  button.disabled = true;
  setStatus("�ڷḦ �����ϰ� �ֽ��ϴ١�");
  try {
    const token = await auth.currentUser.getIdToken();
    const response = await fetch(`${API_BASE}/sync/${source}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      cache: "no-store"
    });
    if (!response.ok) throw new Error(response.status === 404 ? "���� ������ ���� �������� �ʾҽ��ϴ�." : `���� ���� (${response.status})`);
    const result = await response.json();
    setStatus(result.message || "������ �Ϸ��߽��ϴ�.", "success");
    await loadSettings();
  } catch (error) {
    console.error(error);
    setStatus(error.message || "���� ������ �������� ���߽��ϴ�.", "error");
  } finally { button.disabled = false; }
}));

function setStatus(message, kind = "") { status.textContent = message; status.className = `admin-status ${kind}`; }
function formatDate(date) { return new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", dateStyle: "medium", timeStyle: "short" }).format(date); }

