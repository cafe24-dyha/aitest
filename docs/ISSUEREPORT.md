## Manifest Issues

- **잘못된 플러그인 ID : manifest.json**
  - Plugin ID를 올바른 값으로 수정.
- **리디렉션 URI 불일치 : config.ts / auth.ts**
  - OAuth redirectUri를 실제 소유하는 도메인(예: Vercel에 호스팅된 oauth.html URL)로 업데이트.
- **권한 설정 오류**
  - 필요한 API 권한을 정확히 설정하고, editorType을 "figma"로 수정.
- **네트워크 접근 권한 부족**
  - allowedDomains에 `https://accounts.google.com`, `https://www.googleapis.com` 등 추가.

## 플러그인 Issues

- **배포 시 예제 코드**
  - code.js 예제 코드 삭제 및 디버그 로그 추가.
- **Figma 타입 정의**
  - @figma/plugin-typings 패키지 설치.
- **ES5 코드**
  - (예: IIFE, 전역 변수 사용, 수동 의존성 관리)로 수정.
  - 모듈 import 미지원 문제 : UI HTML에서는 인라인 `<script>`에 전역 변수 `config`를 정의해 필요한 설정(redirectUri 등)을 전달.
- **TypeScript 컴파일**
  - 기본 JavaScript 문법으로 변경 후 재 컴파일.
- '**html**' is not defined

## Google OAuth 인증

- **리디렉션 URI 설정 오류 : config.ts / auth.ts**
  - Figma 도메인 대신 소유하는 도메인(예: Vercel)에 배포된 oauth.html URL 사용.
- **메시지 타입 불일치 : auth.ts, ui.html**
  - OAuth 콜백 페이지와 UI에서 사용하는 메시지 타입을 "oauth-callback" 및 "oauth-error"로 통일.
- **redirectUri 이슈** : oauth.html을 소유하는 도메인에 배치하고, Vercel 계정을 통해 관리. 환경 변수 처리
- **Vercel 404: NOT_FOUND 이슈** : oauth.html 파일을 public 폴더에 정확히 배치하고, vercel.json 설정을 단순화하여 재배포(npx vercel --prod).
- **fetch 이슈** : oauth.html은 정적 파일로 배포되며, 사용자가 OAuth 인증 후 리디렉션을 통해 접근하도록 해야 합니다. Figma 플러그인에서는 fetch() 대신 팝업 창(window.open())을 통해 oauth.html에 접근합니다.

## npm 캐시 문제

- package.json을 직접 수정하여 의존성을 추가

## 배포시 미 반영

- 웹팩 설정 수정

## vercel 이슈

- vercel.json 파일 실제 생성된 Production 주소로 접근 시 404가 발생하지 않도록
- 404 에러가 발생하는 이유:
  vercel.json 파일이 없거나 잘못 설정됨
  API 라우트와 정적 페이지의 경로가 올바르게 설정되지 않음
  vercel.json 파일을 다시 수정하여 인증 없이 API 접근 가능하도록 설정
  CORS 설정 추가
  정적 파일 설정 추가
  curl https://aitest-ngvjid413-cafe24-dyhas-projects.vercel.app/api/google-auth
  vercel alias set <현재-배포-URL> <새로운-도메인>
