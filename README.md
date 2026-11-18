# HIS Finder

`@his.sc.kr` 계정으로 학생을 검색하는 GitHub Pages 앱입니다. 화면 우측 상단에서 한국어와 영어를 전환할 수 있습니다.

## 관리자

`jinwoosuk@his.sc.kr`가 기본 관리자입니다. 서버에서 Firebase ID 토큰의 인증된 이메일을 확인하며, 해당 계정만 시트 주소를 변경하거나 동기화를 요청할 수 있습니다. 관리자는 `admin.html`에서 세 Google Sheets 링크를 변경합니다. 직원 명부의 `role` 설정은 필요하지 않습니다.

## 데이터 연동

| 자료 | 시트 ID / gid | 방법 |
|---|---|---|
| 시간표 | `1yw-l67mV2t4ZynqjTgmQ1uTp0MPRc_dd2gPEL7QXVdg` / `1631354026` | 관리자가 학기당 한 번 연동하여 Firestore에 캐시 |
| 일일 출결 | `1MfqOPPHc0BacimghJEGw8Ba1r_pN9Z4POTAEJu4ymM0` / `1507799363` | 매일 오전 7시(한국시간) 자동 갱신, 관리자 수동 갱신 가능 |
| 보건실 | `1Y1thlOAf9BGjXKbG3jL6CBLVkpuyeSiw9wS62Y6lYTE` / `974283698` | 검색 요청 시 최신 자료 읽기 |

학생 데이터는 GitHub Pages나 Git 저장소에 저장하지 않습니다. Firebase Functions가 계정 도메인을 확인한 뒤 데이터에 접근합니다. 관리자 설정은 `adminSettings/studentFinder`, 캐시는 `studentFinderData`에 저장됩니다. 원본 시트의 헤더가 `학번/학생ID`, `이름/성명`, `학년`, `반`, `번호`와 다르면 `functions/index.js`의 별칭을 조정해야 합니다. 같은 학생을 결합할 수 있는 고유 식별 열도 확인해야 합니다.

## 백엔드 배포

GitHub Pages에는 정적 파일만 올라갑니다. 검색 및 관리자 설정 기능을 실제로 사용하려면 `his-main` Firebase 프로젝트에 Functions를 배포해야 합니다.

1. `npm --prefix functions install`로 의존성을 설치합니다.
2. `firebase deploy --only functions --project his-main`을 실행합니다.
3. Google Cloud Console에서 Google Sheets API를 활성화하고, Functions 실행 서비스 계정에 세 시트의 읽기 권한을 부여합니다.
4. 관리자 페이지에서 시트 URL을 확인하고 시간표와 출결을 최초 동기화합니다.

Firebase 웹 API 키는 클라이언트 설정에 포함됩니다. 사용 범위가 Firebase 관련 API로 제한되어 있는지 Google Cloud Console에서 확인하세요. 데이터 접근은 키를 숨기는 방식이 아니라 인증, 서버 검사, Firestore 보안 규칙으로 보호합니다.
