# Vibe Hackathon Platform

Vue 3 + Vite로 만든 **해커톤 운영/참가 데모 웹앱**입니다.  
대회 탐색 → 팀 결성/합류 → 제출 → 리더보드 확인까지, 실제 해커톤 사용자 흐름을 프론트엔드 중심으로 빠르게 검증할 수 있습니다.

## 배포 주소

- https://hackathon-app-kappa.vercel.app/

---

## 프로젝트 개요

이 프로젝트는 다음 목적에 맞춰 제작되었습니다.

- **실전형 UX 검증**: 참가자/팀장/운영자 관점의 핵심 플로우를 단일 앱에서 테스트
- **빠른 프로토타이핑**: 서버 없이도 `public/data` + `localStorage` 기반으로 상태 재현
- **핸드오버 시나리오 대응**: 문서/목업 데이터 중심으로 기능을 확장하기 쉬운 구조

특히 [월간 해커톤 : 긴급 인수인계 해커톤 - 문서만 남기고 사라졌다](https://daker.ai/public/hackathons/monthly-hackathon-emergency-handover-docs?section=leaderboard) 콘셉트처럼, 제한된 자료만으로 서비스 완성도를 높이는 흐름을 염두에 두고 구성했습니다.

---

## 주요 기능

### 1) 해커톤 탐색
- 홈 KPI(진행/예정 대회, 모집 중 팀, 등록 프로젝트)
- 목록 필터/정렬(상태, 검색어, 태그, 북마크)
- 상세 페이지에서 일정/평가/상금/FAQ 링크 확인
- `.ics` 캘린더 파일 다운로드 지원

### 2) 팀 모집/합류
- 팀 생성 시 포지션별 모집 인원 설정
- 팀 상세에서 모집 상태 및 마감 여부 확인
- 팀 합류 신청(포지션 + 메시지)
- 팀장의 신청 승인/거절 처리

### 3) 제출/리더보드
- 해커톤별 리더보드 + 글로벌 랭킹
- 기간별(전체/최근 7일/최근 30일) 랭킹 탭
- 검색/정렬 기반 제출 결과 탐색

### 4) 인증/권한
- 일반 사용자 회원가입/로그인
- 운영자(Admin) 분리 로그인
- 보호 라우트: `/me`, `/notifications`

### 5) 개인화 상태
- 북마크, 팀 신청 상태, 알림 읽음 여부 등 `localStorage` 저장
- 페이지 새로고침 이후에도 주요 상태 유지

---

## 기술 스택

- **Framework**: Vue 3 (`<script setup>`)
- **State**: Pinia
- **Router**: Vue Router
- **Build Tool**: Vite
- **Data Layer**: `public/data/*.json` + Browser `localStorage`

---

## 실행 방법

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

기본 주소: `http://localhost:5173`

### 3. 프로덕션 빌드

```bash
npm run build
```

### 4. 빌드 결과 미리보기

```bash
npm run preview
```

---

## 라우트 맵

- `/` : 홈
- `/hackathons` : 해커톤 목록
- `/hackathons/:slug` : 해커톤 상세
- `/hackathons/:slug/leaderboard` : 특정 해커톤 리더보드
- `/rankings` : 글로벌 랭킹
- `/teams` : 팀 목록/모집
- `/teams/:teamCode` : 팀 상세
- `/camp` : `/teams` 리다이렉트
- `/faq` : FAQ
- `/auth` : 로그인/회원가입
- `/me` : 내 프로필 (로그인 필요)
- `/notifications` : 알림 (로그인 필요)
- `/:pathMatch(.*)*` : 404

---

## 데모 계정

### 운영자 계정
- 아이디: `admin`
- 비밀번호: `admin1234`

> 운영자 계정은 데모 편의용 하드코딩 계정입니다. 실제 운영 환경에서는 서버 인증/권한 체계로 대체해야 합니다.

---

## 데이터 저장 방식

- 초기 공개 데이터: `public/data/*.json`
- 사용자/세션/북마크/팀 변경사항/알림 읽음 여부: `localStorage`

로컬 상태를 초기화하려면 브라우저 개발자 도구에서 해당 도메인의 스토리지를 삭제하세요.

---

## 디렉터리 구조

```bash
.
├─ public/
│  ├─ data/                      # 공개 목업 데이터(JSON)
│  └─ ...                        # 아이콘/브랜드/매니페스트 등 정적 파일
├─ src/
│  ├─ components/                # 공통 UI 컴포넌트
│  ├─ views/                     # 페이지 뷰
│  ├─ stores/                    # Pinia 스토어(auth, hackathon)
│  ├─ router/                    # 라우트 정의 + 로그인 가드
│  ├─ utils/                     # 날짜/시간 유틸
│  ├─ constants/                 # 포지션 옵션 등 상수
│  ├─ App.vue
│  └─ main.js
├─ index.html
├─ package.json
└─ vite.config.js
```

---

## 참고 사항

- 본 프로젝트는 데모/프로토타입 용도입니다.
- 보안, 검증, 권한, 데이터 무결성은 실제 서비스 기준으로 추가 강화가 필요합니다.
- 제출 링크/연락처 등 외부 URL 입력에는 별도 검증 로직을 권장합니다.

## 라이선스

현재 별도 라이선스 파일은 포함되어 있지 않습니다. 필요 시 정책에 맞춰 추가해 주세요.
