# 피그마 플러그인 구글 인증 통신 흐름 및 파일 구조

## _요구사항 : 개념_

피그마 플러그인 사용자가 선택한 UI 이미지를 OpenAI Assistant가 분석하여 구글 드라이브 내 유사 이미지를 찾고, 매칭되는 구글 시트의 데이터를 추출하여 제공한다.

## _개발 환경 : 융합_

✅ Figma Plugin

- 기본 예제 제거
- 샌드박스된 브라우저 환경(ES5 호환)
- 프로젝트 의존성 설치 완료
- node_modules 설치 완료
- TypeScript 설정 완료
- ESLint 설정 완료
- 컴파일러가 백그라운드에서 실행

✅ Vercel CLI 설치 완료

- GOOGLE_CLIENT_ID 환경 변수 등록

✅ 구글 인증

- 새 프로젝트 생성
- OAuth 2.0 클라이언트 ID 생성
- 승인된 리디렉션 URI에 위의 REDIRECT_URI 추가
- 필요한 API 활성화 (Google Drive API, Google Sheets API)

✅ 통신 사전 준비

- code.ts 디버그 로그 추가.
- 피그마 플러그인 구글 인증 시작 버튼

## _파일 구조_

```plaintext

├── src/                   # 소스 코드 디렉토리
│   ├── api/               # Vercel 서버리스 함수
│   │   └─── google-auth.js      # 구글 OAuth 인증 처리 Vercel 서버리스 함수:
│   │                            #- GET: 구글 OAuth 인증 URL 생성 및 반환
│   │                            #- POST: authorization code로 access token 교환
│   ├── code.js            # 컴파일된 코드
│   ├── code.ts            # 메인 프로세스 코드: 인증 요청 및 응답 처리
│   └── ui.html            # 플러그인 UI
│   └── oauth.html         # OAuth 콜백 처리
├── docs/ # 문서
│ └── WORKFLOW.md # 워크플로우 설명
├── manifest.json # 플러그인 메타데이터 (플러그인 이름, 아이콘, UI 크기 등)
├── webpack.config.js # 웹팩 빌드 설정
├── tsconfig.json # TypeScript 설정
├── package.json # 프로젝트 의존성
├── .env # 환경 변수 (개발용)
└── vercel.json # Vercel 배포 설정
                       # - POST: authorization code로 access token 교환
```

## _통신 흐름 요약_

### 피그마 플러그인에서 구글 인증

1. **[1] UI → Main:**

   - **설명:** 플러그인 UI에서 “구글 인증 시작” 요청을 메인 프로세스에 전달합니다.
   - **담당 파일:** `src/ui.tsx` (버튼 클릭 이벤트) → `src/code.ts`

2. **[2] Main → Vercel (HTTP GET):**

   - **설명:** 메인 프로세스가 Vercel 서버리스 함수에 구글 인증 URL 요청을 보냅니다.
   - **담당 파일:** `src/code.ts` (HTTP GET 요청) → `api/google-auth.ts`

3. **[3] Vercel ↔ OAuth (HTTP GET):**

   - **설명:** Vercel이 구글 OAuth 서버에 인증 URL 생성 요청을 보내고, 응답으로 인증 URL을 받습니다.
   - **담당 파일:** `api/google-auth.ts` (구글 OAuth 서버와의 통신)

4. **[4] Vercel → Main (HTTP 응답):**

   - **설명:** Vercel이 생성된 인증 URL을 메인 프로세스에 전달합니다.
   - **담당 파일:** `api/google-auth.ts` → `src/code.ts`

5. **[5] Main → UI (팝업 통신):**

   - **설명:** 메인 프로세스는 UI에 팝업 창을 열어 인증 페이지를 띄우도록 지시합니다.
   - **담당 파일:** `src/code.ts` → `src/ui.tsx` (팝업 호출)

6. **[6] UI ↔ OAuth (웹 브라우저 통신):**

   - **설명:** 팝업 창에서 사용자가 구글 로그인 후 인증을 완료하면, OAuth 서버가 authorization code를 포함하여 redirect합니다.
   - **담당 파일:** 외부 구글 OAuth 서버 (브라우저 팝업 내 통신)

7. **[7] UI → Main (팝업 통신):**

   - **설명:** UI가 팝업 창에서 받은 authorization code를 메인 프로세스로 전달합니다.
   - **담당 파일:** `src/ui.tsx` (팝업 통신 이벤트) → `src/code.ts`

8. **[8] Main → Vercel (HTTP POST):**

   - **설명:** 메인 프로세스가 authorization code를 포함하여 Vercel 서버리스 함수에 토큰 교환 요청을 보냅니다.
   - **담당 파일:** `src/code.ts` (HTTP POST 요청) → `api/google-auth.ts`

9. **[9] Vercel ↔ OAuth (HTTP POST):**

   - **설명:** Vercel이 구글 OAuth 서버에 authorization code를 전달해 access token을 요청하고, 응답으로 토큰을 받습니다.
   - **담당 파일:** `api/google-auth.ts` (토큰 교환 로직)

10. **[10] Vercel → Main (HTTP 응답):**

    - **설명:** Vercel이 받은 access token을 메인 프로세스에 전달합니다.
    - **담당 파일:** `api/google-auth.ts` → `src/code.ts`

11. **[11] Main → UI (이벤트 전달):**
    - **설명:** 최종적으로 메인 프로세스가 인증 완료 메시지와 함께 사용자 정보를 UI에 업데이트합니다.
    - **담당 파일:** `src/code.ts` → `src/ui.tsx` (UI 업데이트 이벤트)

## _배포 플로우_

- 용도 중복 파일 검토
- 피그마 컴파일 실행 후 배포
- Vercel 배포
- zip 파일 생략
