# Vibe Hackathon Platform

Vue 3 + Vite 기반 해커톤 플랫폼 데모 애플리케이션입니다.  
해커톤 탐색, 상세 정보 확인, 팀 모집/지원, 제출 및 랭킹 확인 흐름을 한 번에 체험할 수 있도록 구성되어 있습니다.

## 주요 기능

- **홈 대시보드**: 진행 중/예정 대회, 모집 중 팀, 제출 현황 등 핵심 지표 제공
- **해커톤 목록 & 필터링**: 상태/검색어/태그/찜 필터 및 정렬 지원
- **해커톤 상세 페이지**: 개요, 평가 기준, 일정, 상금, 팀, 제출, 리더보드 정보 노출
- **팀 캠프**: 팀 생성, 포지션별 지원, 팀장 승인/거절, 모집 마감 처리
- **랭킹**: 전체 및 기간 기준(7일/30일) 리더보드 확인
- **인증/프로필**: 일반 사용자 회원가입/로그인, 운영자 로그인, 프로필 확인
- **로컬 스토리지 기반 상태 유지**: 인증 세션, 찜, 팀/제출/리더보드 변경사항 저장

## 기술 스택

- **Frontend**: Vue 3 (`<script setup>`)
- **State Management**: Pinia
- **Routing**: Vue Router
- **Build Tool**: Vite

## 프로젝트 구조

```bash
.
├─ public/
│  └─ data/                      # 목업 데이터(JSON)
├─ src/
│  ├─ components/                # 공통 UI 컴포넌트
│  ├─ views/                     # 페이지 단위 뷰
│  ├─ stores/                    # Pinia 스토어(auth, hackathon)
│  ├─ router/                    # 라우트 설정
│  └─ main.js                    # 앱 엔트리
├─ index.html
├─ package.json
└─ vite.config.js
```

## 시작하기

### 1) 설치

```bash
npm install
```

### 2) 개발 서버 실행

```bash
npm run dev
```

기본적으로 Vite 로컬 서버(예: `http://localhost:5173`)에서 확인할 수 있습니다.

### 3) 프로덕션 빌드

```bash
npm run build
```

### 4) 빌드 결과 미리보기

```bash
npm run preview
```

## 라우트

- `/` : 홈
- `/hackathons` : 해커톤 목록
- `/hackathons/:slug` : 해커톤 상세
- `/hackathons/:slug/leaderboard` : 특정 해커톤 리더보드
- `/rankings` : 전체 랭킹
- `/teams` : 팀 목록/모집
- `/teams/:teamCode` : 팀 상세(동일 페이지에서 코드 기준 노출)
- `/camp` : `/teams`로 리다이렉트
- `/auth` : 로그인/회원가입
- `/me` : 내 프로필

## 테스트/데이터 관련 참고

- 공개 데이터는 `public/data/*.json` 파일을 통해 로딩됩니다.
- 네트워크 API 없이도 로컬에서 주요 플로우를 확인할 수 있도록 설계되어 있습니다.
- 사용자 데이터(세션/찜)는 브라우저 `localStorage`에 저장됩니다.

## 운영자 계정 (데모)

- 아이디: `admin`
- 비밀번호: `admin1234`

> 위 계정은 데모용 하드코딩 계정이며, 실제 서비스에서는 서버 인증으로 대체해야 합니다.

## 라이선스

별도 라이선스가 지정되어 있지 않습니다. 필요 시 프로젝트 정책에 맞게 추가해 주세요.
