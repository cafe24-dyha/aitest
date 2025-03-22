# **프로젝트 개요**

## _요구사항_

피그마 플러그인 사용자가 선택한 UI 이미지를 OpenAI Assistant가 분석하여 구글 드라이브 내 유사 이미지를 찾고, 매칭되는 구글 시트의 데이터를 추출하여 제공한다.

## _개발 환경_

- Figma Plugin API 1.0.0
- 샌드박스된 브라우저 환경(ES5 호환)
  ✅ Node.js 설치 확인 (v20.11.1)
  ✅ 프로젝트 의존성 설치 완료
  ✅ TypeScript 컴파일 성공
  ✅ 실시간 컴파일 모드 실행 중

## _기능 요구사항_

## _Main Process_

1. 피그마 플러그인 시스템

   - ✅ 기본 구조
     - 개발 환경 구성
     - 디버깅 시스템
   - ✅ 개발자 배포
     - 계정 연동
     - 플러그인 등록
     - 테스트 진행

2. 구글 서비스 시스템

   - ✅ Cloud 설정
     - OAuth 2.0 인증
     - API 연동
   - ✅ 권한 및 데이터 처리
     - API 스코프 정의
     - 최소 권한 원칙 적용
   - ❌ 핵심 기능 구현
     - OAuth 인증 시스템
     - Drive API 클라이언트
     - 데이터 처리 로직
   - ❌ 시스템 안정화
     - 예외 처리 보강
     - 모니터링 구축
     - 성능 최적화

3. OpenAI 시스템
   - ❌ 이미지 분석
     - API 연동
     - 특성 분석
     - 키워드 추출
   - ❌ 이미지 매칭
     - 검색 처리
     - 유사도 분석
     - 데이터 연동
   - ❌ 결과 처리
     - 정렬 기능
     - 필터 기능
     - 내보내기

# **프로젝트 구조 및 용도**

```
/src # ✅ 소스 코드 구성 완료
    /google # 구글 서비스 관련
        auth.ts # ✅ Google OAuth 2.0 인증 및 토큰 관리
        drive.ts # ❌ 파일 처리
        sheets.ts # ❌ 시트 처리
        extractor.ts # ❌ 데이터 처리
    /ui # 사용자 인터페이스
        auth-ui.ts # ✅ 인증 버튼 및 상태 표시 UI
        picker.ts # ❌ 파일 선택
        data.ts # ❌ 데이터 표시
        result.ts # ❌ 결과 표시
    /openai # AI 처리 관련
        image.ts # ❌ 이미지 처리
        matcher.ts # ❌ 매칭 처리
    /types # 타입 정의
        google.d.ts # ✅ Google OAuth, Drive API 타입 정의
        openai.d.ts # ❌ AI 타입
    /utils # 유틸리티
        logger.ts # ✅ 디버그 로그 및 에러 추적
        parser.ts # ❌ 데이터 변환
    config.ts # ✅ 클라이언트 ID, API 스코프 설정
manifest.json # ✅ 플러그인 설정 완료
code.ts # ✅ 컴파일된 메인 코드 생성됨
ui.html # ✅ UI 구현 완료
    /public
        OAuth.html # ✅ OAuth 리다이렉트 URI 설정

```

# **통신 흐름**

## _1. 이미지 선택_

```
[DEBUG: image-selection]
UI -> 이미지 선택 -> 데이터 추출
```

## _2. AI 분석_

```
[DEBUG: image-analysis]
이미지 -> OpenAI -> 특성 추출
```

## _3. 구글 드라이브 이미지 검색_

```
[DEBUG: drive-search-start]
매칭 키워드 -> drive.ts -> Google Drive API
                       <- 유사 이미지 목록
[DEBUG: drive-search-complete]
```

## _4. 구글 시트 데이터 매칭_

```
[DEBUG: sheet-matching-start]
이미지 정보 -> sheets.ts -> Google Sheets API
                        <- 매칭된 데이터
[DEBUG: sheet-matching-complete]
```
