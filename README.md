# HIS Student Finder

학교 계정으로 로그인한 교직원이 학생을 이름, 학년, 반, 번호로 빠르게 찾는 웹 앱입니다.

## 데이터 원본과 갱신 주기

| 자료 | Google Sheet | 갱신 정책 |
|---|---|---|
| 시간표 | `1yw-l67mV2t4ZynqjTgmQ1uTp0MPRc_dd2gPEL7QXVdg` / gid `1631354026` | 학기 시작 때 동기화하고, 정규화된 검색 인덱스는 비공개 저장소에 보관 |
| 일일 출결 | `1MfqOPPHc0BacimghJEGw8Ba1r_pN9Z4POTAEJu4ymM0` / gid `1507799363` | 매일 1회 동기화하고 당일 자료를 캐시 |
| 보건실 | `1Y1thlOAf9BGjXKbG3jL6CBLVkpuyeSiw9wS62Y6lYTE` / gid `974283698` | 요청 시 최신 내용을 가져오거나 짧은 캐시 사용 |

## 보안 요구사항

- 이 앱은 HIS 계정(`@his.sc.kr`) 로그인 후 Firebase `staff` 문서의 `teacher`, `staff`, `admin` 역할을 확인합니다. 이 확인은 사용자 편의를 위한 1차 관문이며, 실제 데이터 접근 권한은 서버/API에서도 Firebase ID 토큰을 검증해 결정해야 합니다.
- 학생 시간표, 출결, 보건실 자료는 학생 개인정보입니다. 시트 내보내기 파일, 캐시 JSON, API 키/서비스 계정 키를 공개 GitHub 저장소나 GitHub Pages에 올리지 않습니다. 공개 Pages는 로그인 화면으로 가려도 공개 데이터가 보호되지 않습니다.
- 데이터 캐시는 Firebase/Cloud Run 등 접근 제어가 가능한 비공개 저장소를 사용합니다. API는 교직원 역할을 서버에서 재확인하고, 필요한 필드만 반환하며, 보건 정보 접근은 별도 권한으로 제한합니다.
- 시트 링크는 코드에 저장되어도 괜찮지만, Google Sheets API 키나 서비스 계정 자격증명은 브라우저 코드에 넣지 않습니다. OAuth/서비스 계정 권한은 서버 환경의 Secret Manager에서 관리합니다.

## 현재 상태

로그인 화면, 직원 권한 확인, 학생 검색 UI 및 API 호출 계약이 준비되어 있습니다. 백엔드 API와 시트 헤더 매핑은 아직 연결되지 않았습니다. 현재 API 기본 경로는 `/api/student-finder`입니다.

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

서버 측에서 다음도 구현해야 합니다.

1. Firebase ID 토큰과 직원 역할을 검증한 뒤 검색을 허용합니다.
2. 시간표 시트를 학기당 1회 가져와 비공개 저장소에 인덱싱합니다.
3. 출결 시트를 매일 한 번 동기화하고 날짜가 바뀌면 오래된 캐시를 폐기합니다.
4. 보건실은 검색할 학생의 현재 기록만 실시간에 가깝게 읽고, 조회 권한과 감사 로그를 적용합니다.
5. 원본 시트의 헤더와 학생 식별 키를 확인해 정규화 매핑을 확정합니다. 이름만으로 학생을 결합하지 말고 학번 등 안정적인 키를 사용합니다.

## 실행

정적 파일 서버나 Firebase Hosting의 별도 경로에서 제공합니다. 브라우저에서 파일을 직접 여는 `file://` 방식은 Firebase 로그인과 API 호출에 적합하지 않습니다. Firebase Hosting에 올릴 때는 직원 로그인 뒤에도 API/Firestore 보안 규칙이 모든 데이터 요청을 보호해야 합니다.
