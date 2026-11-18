# HIS Finder

학교 Google 계정으로 학생을 검색하는 Apps Script 웹 앱입니다. GitHub Pages는 웹 앱으로 들어가는 링크를 제공합니다. Firebase Functions와 Blaze 요금제 없이 운영합니다.

## 최초 배포

1. `jinwoosuk@his.sc.kr`로 [Apps Script](https://script.google.com/home)에 로그인하고 새 프로젝트를 만듭니다.
2. [Code.gs](apps-script/Code.gs)를 기본 스크립트 파일에 붙여넣고, HTML 파일 `Index`를 만들어 [Index.html](apps-script/Index.html)의 내용을 붙여넣습니다.
3. 프로젝트 설정에서 **편집기에 appsscript.json 매니페스트 파일 표시**를 켜고 [appsscript.json](apps-script/appsscript.json)의 내용을 붙여넣습니다.
4. **배포 → 새 배포 → 웹 앱**을 선택합니다. **실행 계정은 나**, **액세스 권한은 학교 Google Workspace 도메인 사용자**로 설정합니다. 배포 계정에 세 원본 시트의 읽기 권한이 있어야 합니다.
5. 배포 후 `/exec` 주소를 복사해 [index.html](index.html)의 `id="launch"` 링크 주소에 입력합니다. 현재 학교 배포 주소는 연결되어 있습니다.
6. 웹 앱을 열고 관리 메뉴에서 시간표를 한 번 연동합니다. 출결 자동 갱신을 켜면 Apps Script가 한국시간 오전 7시대에 갱신합니다. 첫 조회 때 당일 캐시가 없으면 즉시 갱신합니다. 관리자와 다른 학교 계정으로 각각 접속해 권한을 확인합니다.

Google Workspace 정책 때문에 로그인한 사용자의 이메일을 읽을 수 없으면 웹 앱은 접근을 거부합니다. 해당 경우 학교 Workspace의 Apps Script 및 계정 정책을 확인합니다.

## 데이터 형식

실제 원본 열 제목과 배치가 아직 확인되지 않았습니다. 코드는 학생명과 고유 학번 또는 학년·반·번호가 있는 표를 읽습니다. 시간표에 학생별 행이 없거나 출결 및 보건실 열 제목이 다르면 `Code.gs`의 매핑을 원본 형식에 맞춰 조정합니다. 보건실은 날짜 열로 오늘 기록을 식별해 방문 여부만 표시합니다. 시간표와 출결 캐시는 배포 계정의 비공개 스프레드시트에 생성됩니다.
