import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { initLanguage } from "./i18n.js";

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
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ hd: DOMAIN });
const t = initLanguage("adminPageTitle");
const gate = document.querySelector("#gate");
const app = document.querySelector("#app");
const gateError = document.querySelector("#gate-error");
const status = document.querySelector("#action-status");
let savedSources = {};

document.querySelector("#login-button").addEventListener("click", async (event) => {
  event.currentTarget.disabled = true;
  gateError.textContent = t("adminSigningIn");
  try { await signInWithPopup(auth, provider); }
  catch (error) { console.error(error); gateError.textContent = t("adminLoginFailed"); }
  finally { event.currentTarget.disabled = false; }
});
document.querySelector("#logout-button").addEventListener("click", () => signOut(auth));

onAuthStateChanged(auth, async (user) => {
  app.hidden = true;
  if (!user) { gate.hidden = false; return; }
  if (!user.email || user.email.toLowerCase().split("@").pop() !== DOMAIN) {
    await signOut(auth);
    gateError.textContent = t("adminDomainOnly");
    return;
  }
  try {
    if (user.email.toLowerCase() !== "jinwoosuk@his.sc.kr") {
      await signOut(auth);
      gateError.textContent = t("adminOnly");
      return;
    }
    document.querySelector("#account-email").textContent = user.email;
    gate.hidden = true;
    app.hidden = false;
    try { await loadSettings(); }
    catch (error) {
      console.error(error);
      for (const key of ["timetable", "attendance", "health"]) document.querySelector(`#${key}-url`).value = DEFAULT_SOURCES[key];
      document.querySelector("#admin-notice").textContent = t("apiNotDeployed");
      document.querySelector("#admin-notice").dataset.kind = "error";
    }
  } catch (error) {
    console.error(error);
    await signOut(auth);
    gateError.textContent = t("adminCheckFailed");
  }
});

async function loadSettings() {
  const response = await fetch(`${API_BASE}/admin/settings`, { headers: { Authorization: `Bearer ${await auth.currentUser.getIdToken()}`, Accept: "application/json" }, cache: "no-store" });
  if (!response.ok) throw new Error(t("adminCheckFailed"));
  const payload = await response.json();
  const sources = payload.sources || {};
  savedSources = sources;
  for (const key of ["timetable", "attendance", "health"]) {
    document.querySelector(`#${key}-url`).value = sources[key]?.url || DEFAULT_SOURCES[key];
  }
  renderMeta();
  document.querySelector("#admin-notice").textContent = t("adminReady");
  document.querySelector("#admin-notice").dataset.kind = "success";
}

document.querySelector("#settings-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = event.submitter;
  button.disabled = true;
  setStatus(t("saving"));
  try {
    const sources = {};
    for (const key of ["timetable", "attendance", "health"]) {
      sources[key] = { ...(savedSources[key] || {}), url: document.querySelector(`#${key}-url`).value.trim() };
    }
    const response = await fetch(`${API_BASE}/admin/settings`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${await auth.currentUser.getIdToken()}`, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ sources })
    });
    if (!response.ok) throw new Error(t("saveFailed"));
    savedSources = sources;
    setStatus(t("saved"), "success");
  } catch (error) {
    console.error(error);
    setStatus(t("saveFailed"), "error");
  } finally { button.disabled = false; }
});

document.querySelectorAll("[data-sync]").forEach((button) => button.addEventListener("click", async () => {
  const source = button.dataset.sync;
  button.disabled = true;
  setStatus(t("syncing"));
  try {
    const token = await auth.currentUser.getIdToken();
    const response = await fetch(`${API_BASE}/sync/${source}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      cache: "no-store"
    });
    const result = await response.json();
    if (!response.ok) {
      if (response.status === 404 || response.status === 501) throw new Error(t("apiNotDeployed"));
      if (response.status === 409) throw new Error(t("alreadySynced"));
      if (response.status === 401 || response.status === 403) throw new Error(t("syncAccessDenied"));
      throw new Error(t("syncFailed"));
    }
    setStatus(source === "health" ? t("syncHealthDone", { count: result.rowCount }) : t("syncDone", { count: result.rowCount }), "success");
    await loadSettings();
  } catch (error) {
    console.error(error);
    setStatus(error.message || t("syncFailed"), "error");
  } finally { button.disabled = false; }
}));

function setStatus(message, kind = "") { status.textContent = message; status.className = `admin-status ${kind}`; }
function renderMeta() {
  for (const key of ["timetable", "attendance", "health"]) {
    const value = savedSources[key]?.lastSyncedAt;
    const last = value?.toDate?.() || (value ? new Date(value) : null);
    document.querySelector(`#${key}-meta`).textContent = key === "health"
      ? last ? t("lastRefresh", { date: formatDate(last) }) : t("healthLive")
      : last ? t("lastSync", { date: formatDate(last) }) : t("noSync");
  }
}
window.addEventListener("his-finder-language", renderMeta);
function formatDate(date) { const locale = document.documentElement.lang === "en" ? "en-US" : "ko-KR"; return new Intl.DateTimeFormat(locale, { timeZone: "Asia/Seoul", dateStyle: "medium", timeStyle: "short" }).format(date); }
