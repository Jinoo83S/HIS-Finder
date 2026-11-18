const translations = {
  ko: {
    pageTitle: "학생 빠른 찾기 | HIS", appName: "학생 빠른 찾기", gateInfo: "학교 계정으로 로그인해 주세요. @his.sc.kr 계정만 사용할 수 있습니다.",
    login: "Google 계정으로 로그인", admin: "관리자", logout: "로그아웃", headline: "학생 정보를 한 번에 찾으세요",
    intro: "이름, 학년, 반 또는 번호로 검색합니다. @his.sc.kr 계정으로 로그인한 사용자가 이용할 수 있습니다.",
    searchLabel: "학생 검색", searchPlaceholder: "예: 홍길동, 8학년, 8-2, 104", searchButton: "검색",
    searchHint: "검색어를 입력하면 학생 목록과 관련 정보를 확인할 수 있습니다.", checkingLogin: "로그인 상태를 확인하고 있습니다.",
    schoolName: "Handong International School", privacyNote: "학생 정보는 학교 업무 목적으로만 사용해 주세요.", language: "English",
    signingIn: "로그인 중입니다…", loginFailed: "로그인할 수 없습니다. 학교 계정을 확인해 주세요.", domainOnly: "@his.sc.kr 학교 계정으로 로그인해 주세요.",
    checkingPermissions: "계정 권한을 확인하고 있습니다.", permissionFailed: "계정 권한을 확인하지 못했습니다. 관리자에게 문의해 주세요.",
    ready: "학교 계정으로 로그인했습니다. 학생 검색 API가 연결되면 검색할 수 있습니다.", searching: "학생 정보를 찾고 있습니다…",
    noResults: "검색 결과가 없습니다.", found: "{count}명의 학생을 찾았습니다.", apiPending: "학생 데이터 서버가 아직 배포되지 않았습니다. 관리자에게 문의해 주세요.",
    forbidden: "이 정보에 접근할 권한이 없습니다. 학교 관리자에게 문의해 주세요.", serverOffline: "검색 서버에 연결할 수 없습니다. 서버 배포 상태를 확인해 주세요.",
    searchError: "검색 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.", timetable: "시간표", attendance: "오늘 출결", health: "보건실",
    noTimetable: "시간표 데이터 없음", noAttendance: "오늘 출결 데이터 없음", noHealth: "보건실 기록 없음", unnamed: "이름 미등록",
    grade: "학년", class: "반", number: "번호", gradeClassMissing: "학년/반 정보 없음",
    adminPageTitle: "관리자 설정 | HIS 학생 빠른 찾기", adminGateInfo: "관리자 화면입니다. HIS 계정으로 로그인해 주세요.",
    adminBrand: "학생 빠른 찾기 · 관리자", backToSearch: "학생 검색", settingsTitle: "시트 주소와 동기화 관리",
    settingsIntro: "시트 주소를 변경하고 자료별 동기화를 실행합니다. 주소와 동기화 기록은 관리자 전용 Firebase 설정에 저장됩니다.",
    checkingAdmin: "설정 권한을 확인하고 있습니다.", timetableDesc: "학기당 한 번 동기화해 검색용 캐시로 사용합니다.",
    attendanceSource: "일일 출결", attendanceDesc: "당일 자료를 하루 한 번 갱신합니다.", healthDesc: "학생을 조회할 때 최신 자료를 가져옵니다.",
    sheetUrl: "Google Sheets 주소", urlPlaceholder: "https://docs.google.com/spreadsheets/d/...", noSync: "마지막 연동: 기록 없음",
    healthLive: "조회 시 최신 자료 사용", saveUrl: "주소 저장", syncTimetable: "시간표 지금 연동", syncAttendance: "출결 지금 연동",
    refreshHealth: "보건실 자료 새로고침", adminNote: "동기화 API 배포 후 주소 저장과 자료 연동 기능을 사용할 수 있습니다. 학생 자료는 GitHub 파일에 저장하지 않고, 권한이 적용되는 Firebase 저장소를 사용합니다.",
    adminAudit: "관리자 설정 변경은 기록됩니다.", adminSigningIn: "로그인 중입니다…", adminLoginFailed: "로그인할 수 없습니다. 학교 계정을 확인해 주세요.",
    adminDomainOnly: "@his.sc.kr 학교 계정으로 로그인해 주세요.", adminOnly: "관리자 권한이 등록된 계정만 사용할 수 있습니다.",
    adminCheckFailed: "관리자 권한을 확인하지 못했습니다.", adminReady: "관리자 권한을 확인했습니다. 주소를 저장하거나 자료를 연동할 수 있습니다.",
    saving: "시트 주소를 저장하고 있습니다…", saved: "시트 주소를 저장했습니다.", saveFailed: "저장하지 못했습니다. 관리자 권한과 Firebase 보안 규칙을 확인해 주세요.",
    syncing: "자료를 연동하고 있습니다…", syncFailed: "자료를 연동하지 못했습니다. 시트 주소와 권한을 확인해 주세요.",
    syncDone: "{count}행을 연동했습니다.", alreadySynced: "이번 학기 시간표는 이미 연동되었습니다.", apiNotDeployed: "연동 서버가 아직 배포되지 않았습니다.",
    syncAccessDenied: "연동 권한이 없습니다. 관리자 계정을 확인해 주세요.", syncHealthDone: "보건실 시트 최신 자료 {count}행을 확인했습니다.",
    lastSync: "마지막 연동: {date}", lastRefresh: "마지막 새로고침: {date}"
  },
  en: {
    pageTitle: "Student Quick Lookup | HIS", appName: "Student Quick Lookup", gateInfo: "Sign in with your school account. Only @his.sc.kr accounts are allowed.",
    login: "Sign in with Google", admin: "Admin", logout: "Sign out", headline: "Find student information in one place",
    intro: "Search by name, grade, class, or number. Available to users signed in with an @his.sc.kr account.",
    searchLabel: "Find a student", searchPlaceholder: "e.g. Jane Doe, Grade 8, 8-2, 104", searchButton: "Search",
    searchHint: "Enter a search term to find students and related information.", checkingLogin: "Checking your sign-in…",
    schoolName: "Handong International School", privacyNote: "Use student information only for school purposes.", language: "한국어",
    signingIn: "Signing in…", loginFailed: "Could not sign in. Please check your school account.", domainOnly: "Please sign in with your @his.sc.kr school account.",
    checkingPermissions: "Checking account access…", permissionFailed: "Could not verify your account. Please contact an administrator.",
    ready: "Signed in with your school account. Search will be available when the student data service is deployed.", searching: "Searching for students…",
    noResults: "No students found.", found: "Found {count} student(s).", apiPending: "The student data service has not been deployed yet. Please contact an administrator.",
    forbidden: "You do not have access to this information. Please contact a school administrator.", serverOffline: "Could not connect to the search service. Please check its deployment status.",
    searchError: "Something went wrong while searching. Please try again.", timetable: "Timetable", attendance: "Today's attendance", health: "Nurse's office",
    noTimetable: "No timetable data", noAttendance: "No attendance data for today", noHealth: "No nurse's office record", unnamed: "Name unavailable",
    grade: "Grade", class: "Class", number: "No.", gradeClassMissing: "Grade/class unavailable",
    adminPageTitle: "Admin Settings | HIS Student Quick Lookup", adminGateInfo: "Admin access. Sign in with your HIS account.",
    adminBrand: "Student Quick Lookup · Admin", backToSearch: "Student search", settingsTitle: "Manage sheet links and sync",
    settingsIntro: "Update sheet links and run data syncs. Links and sync records are stored in Firebase admin settings.",
    checkingAdmin: "Checking administrator access…", timetableDesc: "Sync once per semester for fast lookup.",
    attendanceSource: "Daily attendance", attendanceDesc: "Refresh the current day's data once daily.", healthDesc: "Fetch the latest data whenever a student is looked up.",
    sheetUrl: "Google Sheets URL", urlPlaceholder: "https://docs.google.com/spreadsheets/d/...", noSync: "Last sync: No record",
    healthLive: "Latest data is fetched on lookup", saveUrl: "Save URL", syncTimetable: "Sync timetable now", syncAttendance: "Sync attendance now",
    refreshHealth: "Refresh nurse's office data", adminNote: "After the sync API is deployed, you can save sheet URLs and sync data. Student records stay in access-controlled Firebase storage, not GitHub files.",
    adminAudit: "Administrator changes are logged.", adminSigningIn: "Signing in…", adminLoginFailed: "Could not sign in. Please check your school account.",
    adminDomainOnly: "Please sign in with your @his.sc.kr school account.", adminOnly: "Only accounts with administrator access can use this page.",
    adminCheckFailed: "Could not verify administrator access.", adminReady: "Administrator access verified. You can save links or sync data.",
    saving: "Saving sheet URLs…", saved: "Sheet URLs saved.", saveFailed: "Could not save. Check administrator access and Firebase security rules.",
    syncing: "Syncing data…", syncFailed: "Could not sync data. Check the sheet URL and access permissions.",
    syncDone: "Synced {count} rows.", alreadySynced: "The timetable has already been synced this semester.", apiNotDeployed: "The sync service has not been deployed yet.",
    syncAccessDenied: "You do not have permission to sync. Check the administrator account.", syncHealthDone: "Checked {count} current rows in the nurse's office sheet.",
    lastSync: "Last sync: {date}", lastRefresh: "Last refresh: {date}"
  }
};

export function initLanguage(titleKey = "pageTitle") {
  let current = localStorage.getItem("hisFinderLanguage") === "en" ? "en" : "ko";
  const button = document.querySelector("#language-toggle");
  const apply = () => {
    document.documentElement.lang = current;
    document.title = translations[current][titleKey] || translations[current].pageTitle;
    document.querySelectorAll("[data-i18n]").forEach(element => {
      const value = translations[current][element.dataset.i18n];
      if (value) element.textContent = value;
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(element => {
      const value = translations[current][element.dataset.i18nPlaceholder];
      if (value) element.placeholder = value;
    });
    if (button) button.textContent = translations[current].language;
    window.dispatchEvent(new CustomEvent("his-finder-language", { detail: current }));
  };
  button?.addEventListener("click", () => {
    current = current === "ko" ? "en" : "ko";
    localStorage.setItem("hisFinderLanguage", current);
    apply();
  });
  apply();
  return (key, values = {}) => Object.entries(values).reduce((text, [name, value]) => text.replaceAll(`{${name}}`, String(value)), translations[current][key] || key);
}
