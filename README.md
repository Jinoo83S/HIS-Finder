# HIS Student Finder

`@his.sc.kr` Google 계정으로 로그인한 사용자가 학생을 이름, 학년, 반, 번호로 빠르게 찾는 웹 앱입니다. 관리자는 별도 화면에서 시트 주소를 저장하고 자료 동기화를 요청할 수 있습니다.

## 데이터 원본과 갱신 주기

| 자료 | Google Sheet | 갱신 정책 |
|---|---|---|
| 시간표 | `1yw-l67mV2t4ZynqjTgmQ1uTp0MPRc_dd2gPEL7QXVdg` / gid `1631354026` | 학기 시작 때 동기화하고, 정규화된 검색 인덱스는 비공개 저장소에 보관 |
| 일일 출결 | `1MfqOPPHc0BacimghJEGw8Ba1r_pN9Z4POTAEJu4ymM0` / gid `1507799363` | 매일 1회 동기화하고 당일 자료를 캐시 |
| 보건실 | `1Y1thlOAf9BGjXKbG3jL6CBLVkpuyeSiw9wS62Y6lYTE` / gid `974283698` | 요청 시 최신 내용을 가져오거나 짧은 캐시 사용 |

## 보안 요구사항

- 검색 화면은 HIS 계정(`@his.sc.kr`)으로 로그인하면 사용할 수 있습니다. 관리자 화면은 Firebase `staff/{email}` 문서의 `role: "admin"`을 확인합니다. 실제 데이터 접근 권한은 서버/API에서도 Firebase ID 토큰과 도메인을 재검증해야 합니다.
- 학생 시간표, 출결, 보건실 자료는 학생 개인정보입니다. 시트 내보내기 파일, 캐시 JSON, API 키/서비스 계정 키를 공개 GitHub 저장소나 GitHub Pages에 올리지 않습니다. 공개 Pages는 로그인 화면으로 가려도 공개 데이터가 보호되지 않습니다.
- 데이터 캐시는 Firebase/Cloud Run 등 접근 제어가 가능한 비공개 저장소를 사용합니다. API는 교직원 역할을 서버에서 재확인하고, 필요한 필드만 반환하며, 보건 정보 접근은 별도 권한으로 제한합니다.
- 시트 링크는 코드에 저장되어도 괜찮지만, Google Sheets API 키나 서비스 계정 자격증명은 브라우저 코드에 넣지 않습니다. OAuth/서비스 계정 권한은 서버 환경의 Secret Manager에서 관리합니다.

## 현재 상태

로그인 화면, 도메인 계정 확인, 학생 검색 UI, 관리자 설정 페이지, Firebase Functions API 소스가 준비되어 있습니다. 관리자는 Firebase `adminSettings/studentFinder` 문서에 시트 주소를 저장할 수 있습니다. 검색 API는 시간표와 출결 캐시를 조회하고 보건실 시트를 조회 시점에 읽습니다. 시간표는 학기당 1회 수동 연동, 출결은 매일 오전 7시(한국시간) 자동 갱신하도록 구성했습니다. 실제 이용을 시작하려면 아래 백엔드 배포와 Google Sheets 권한 설정을 마쳐야 합니다.

### API 계약 초안

`GET /api/student-finder/search?q=<검색어>` — `Authorization: Bearer <Firebase ID token>` 필요.

응답 예시(가상 필드만 사용):

```json
{
  "students": [
    {
      "id": "internal-id",
      "name": "학생 이름",
      "grade": "8",
      "class": "2",
      "studentNumber": "104",
      "timetable": "월요일 1교시 …",
      "attendance": "등교",
      "health": ""
    }
  ]
}
```

서버는 다음과 같이 동작합니다.

1. Firebase ID 토큰과 직원 역할을 검증한 뒤 검색을 허용합니다.
2. 시간표 시트를 학기당 1회 가져와 비공개 저장소에 인덱싱합니다.
3. 출결 시트를 매일 한 번 동기화합니다.
4. 보건실 시트는 검색할 때마다 Google Sheets에서 직접 읽습니다.
5. `학번/학생ID`, `이름/성명`, `학년`, `반`, `번호` 등의 한국어/영어 헤더를 자동으로 찾아 정규화합니다. 원본의 헤더가 이 범위와 다르면 `functions/index.js`의 별칭 목록을 조정해야 합니다.

관리자 화면은 기존 HIS Firebase 직원 권한 체계를 사용합니다. 관리자 계정은 Firebase `staff/{이메일}` 문서의 `role` 값을 `admin`으로 설정합니다. 검색 API는 `https://asia-northeast3-his-main.cloudfunctions.net/studentFinderApi`에 배포됩니다. Cloud Functions 런타임 서비스 계정에 세 시트의 뷰어 권한을 부여하고 Google Sheets API를 활성화해야 합니다. 함수의 ID 토큰 검증은 도메인을 서버에서 다시 확인합니다.

## 실행

정적 화면은 GitHub Pages에서 제공하고, 데이터는 Firebase Functions와 Firestore에서 관리합니다. 브라우저에서 파일을 직접 여는 `file://` 방식은 Firebase 로그인과 API 호출에 적합하지 않습니다.

### 최초 배포 절차

1. 이 폴더에서 `npm --prefix functions install`을 실행합니다.
2. Firebase CLI로 `his-main` 프로젝트에 로그인한 뒤 `firebase deploy --only functions --project his-main`을 실행합니다.
3. Google Cloud Console에서 Google Sheets API를 활성화하고, 함수 실행 서비스 계정에 세 Google 시트의 읽기 권한을 부여합니다.
4. Firebase Firestore의 `staff/{관리자 이메일}` 문서에서 `role: "admin"`을 확인합니다. 직원이 아닌 `@his.sc.kr` 계정도 검색 화면에 로그인할 수 있지만, 관리자 설정은 이 역할이 있는 계정만 사용할 수 있습니다.
5. GitHub Pages에서 `admin.html`을 열어 시트 주소를 저장하고 시간표/출결 연동을 실행합니다. 시간표와 출결은 최초 데이터 적재를 위해 관리자가 한 번씩 연동해야 합니다.

Firestore에 이미 적용된 `adminSettings` 관리자 규칙을 사용합니다. 이 프로젝트는 학생 자료를 공개 GitHub 파일에 저장하지 않습니다. 캐시 문서는 Admin SDK만 읽고 쓰며, 직원 검색 요청은 Cloud Function에서 HIS 도메인을 확인한 후 처리합니다.
