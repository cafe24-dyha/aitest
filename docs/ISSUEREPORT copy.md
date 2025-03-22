## 이슈 관리 가이드

이슈는 ISSUEREPORT.md 확인 후, 이슈 처리와 업데이트를 판단한다. 이슈 분류 하위에 `**"이슈명 : 파일위치"** -` 대안 형식으로 대안을 작성한다.

## Manifest 이슈

1. **잘못된 플러그인 ID**
   `manifest.json`의 ID Figma Plugin 설정에서 올바른 Plugin ID로 수정.

2. **리디렉션 URI 불일치**
   Google Cloud Console에 등록된 URI로 수정.

3. **권한 설정 오류**
   필요한 API 권한을 정확히 설정, editorType을 "figma"로 수정

4. **네트워크 접근 권한 부족**
   필요한 도메인이 `allowedDomains`에 `https://accounts.google.com`, `https://www.googleapis.com` 등 추가.

## 플러그인 이슈

1. **배포 시 예제 코드**
   code.js 초기화 및 디버그 로그 추가

2. **Figma 타입 정의 누락**
   @figma/plugin-typings 패키지 설치

3. **ES6+ 문법으로 인한 오류**

- Figma Plugin API 1.0.0
- 샌드박스된 브라우저 환경(ES5 호환) 피그마 플러그인에 최적화된 코드
  - import/export 문 미지원
  - IIFE(즉시 실행 함수) 패턴으로 모듈을 래핑
  - 전역 변수로 모듈을 공유
  - 의존성을 수동으로 관리
  - 모듈 초기화 순서를 명시적으로 제어하는 방식으로 문제를 해결

4. **TypeScript 컴파일 설정 이슈**

   - 기본 JavaScript 문법으로 변경 및 TypeScript 코드 재 컴파일

5. **팝업 처리 이슈**

   - UI 환경에서 window.open 및 관련 DOM/화면 속성을 사용하여 OAuth 팝업을 올바르게 띄운 후, postMessage를 통해 인증 결과를 전달

6. https:// 스키마가

## Google OAuth 인증 이슈

1. **리디렉션 URI 설정 오류 : config.ts / auth.ts**

   - 현재 설정된 redirectUri("https://www.figma.com/oauth/callback")는 Figma 도메인이므로, 여러분이 소유하는 도메인(예: Vercel, GitHub Pages 등)에 호스팅된 oauth.html 파일의 URL(예: "https://yourdomain.com/oauth.html")로 변경
   - Google Cloud Console의 OAuth 클라이언트 설정에서 해당 redirectUri를 등록 및 업데이트

2. **메시지 타입 불일치 : auth.ts, ui.html**

   - OAuth 콜백 페이지(oauth.html)와 UI, auth.ts에서 사용하는 메시지 타입을 "oauth-callback" 및 "oauth-error" 등으로 통일
   - 모든 메시지 핸들러에서 동일한 타입을 인식하도록 코드 수정

3. **redirectUri 이슈**

   - OAuth 콜백 페이지에 소유하거나 제어하는 도메인에 호스팅, Vercel 계정 생성

4. **vercel 404: NOT_FOUND 이슈**

   - 파일 위치 이슈 : public 폴더에 oauth.html 파일 정확히 배치 public/oauth.html
   - 빌드 설정이 정적 파일 제공을 방해 빌드 설정 이슈 : vercel.json 설정 단순화
   - Vercel 배포 : npx vercel --prod 재배포
   - NOT_FOUND 이슈 : Vercel이 oauth.html 파일을 찾지 못함, public 폴더에 oauth.html 파일 정확히 배치
   - UI HTML 파일에서는 ES 모듈 import를 바로 사용할 수 없어서, 별도의 번들링 없이 필요한 설정(예: redirectUri)을 사용하지 못함:
     - `<script>` 태그 내에 전역 변수 `config`를 인라인으로 정의하여 필요한 설정 값을 포함.
     - 인증 URL 구성 시 인라인된 `config.redirectUri`를 활용하여 올바른 OAuth URL을 생성.
     - **결과:** 모듈 번들링 없이도 간단하게 필요한 설정을 전역 변수로 활용할 수 있음.
