# AGENTS.md

이 문서는 이 저장소에서 사람과 AI 에이전트가 함께 작업할 때 따를 기본 개발 규칙의 단일 기준이다. 목적은 반복 설명과 재작업을 줄이고, 변경 사항이 실제 프로젝트 구조와 계약을 벗어나지 않게 하는 데 있다.

이 문서와 실행 가능한 코드, 설정, 스크립트 또는 워크플로가 서로 다르면 실제 실행 결과를 우선한다. 관련 작업 안에서 확인된 문서 불일치는 함께 바로잡아 규칙이 계속 낡지 않도록 한다.

## 1. 핵심 원칙

- 기존 디렉터리 경계를 지킨다.
  - Python 백엔드와 도메인 로직: `src/`, `data_provider/`, `api/`, `bot/`
  - React Web: `apps/dsa-web/`
  - Electron 데스크톱: `apps/dsa-desktop/`
  - 배포·빌드·CI: `scripts/`, `.github/workflows/`, `docker/`
- 사용자의 명시적 승인이 없으면 `git commit`, `git tag`, `git push`를 실행하지 않는다.
- 커밋 메시지는 영어로 작성하고 `Co-Authored-By`를 추가하지 않는다.
- 비밀 키, 계정, 절대 경로, 모델명, 포트 또는 환경별 분기 로직을 코드에 하드코딩하지 않는다.
- 기존 모듈, 설정 진입점, 스크립트와 테스트를 우선 재사용하고 같은 역할의 병렬 구현을 만들지 않는다.
- 안정성을 우선한다. 현재 요청에 필요하지 않은 리팩터링, 추상화 또는 인프라 이전을 끼워 넣지 않는다.
- 새 설정 항목을 추가하면 `.env.example`, 설정 레지스트리, 관련 문서를 함께 갱신한다.
- 사용자에게 보이는 기능, CLI/API 계약, 배포 방식, 알림 방식 또는 보고서 구조를 바꾸면 관련 문서와 `docs/CHANGELOG.md`를 함께 갱신한다.
- 보고서 형식·렌더링 또는 Web UI를 바꾸면 PR 설명에 영향을 받은 보고서나 페이지의 스크린샷을 첨부한다. 전후 차이가 있으면 비교 이미지를 우선하며, 스크린샷이 불가능하면 이유와 대체 시각 증거를 설명한다.
- Issue/PR 진행 화면, 리뷰 화면, 일회성 검수 이미지 같은 임시 증거는 저장소 파일로 커밋하지 않는다. PR 본문·댓글, GitHub 첨부, Actions artifact 또는 외부 증거 링크를 사용한다.
- `docs/CHANGELOG.md`의 `[Unreleased]`는 한 줄당 한 항목인 평면 형식을 유지한다. 현재 허용 표기는 `- [新功能] 설명`, `- [改进] 설명`, `- [修复] 설명`, `- [文档] 설명`, `- [测试] 설명`, `- [chore] 설명`이며, 이 구역 안에 `###` 분류 제목을 만들지 않는다. 이 표기 계약 자체를 한글화하려면 changelog 생성·릴리스 워크플로까지 함께 변경한다.
- 루트 `README.md`는 프로젝트 소개, 핵심 기능, 빠른 시작, 주요 진입점, 후원·협력처럼 첫 화면에 필요한 정보만 담는다. 세부 동작, 필드 계약, 장애 대응, 설정 전체 목록과 경계 조건은 적절한 `docs/*.md`에 둔다.
- 주석, docstring, 로그 문구는 파일의 기존 언어 맥락을 따르되 의미가 명확해야 한다. 공개 API 필드명과 안정된 설정 키는 번역하지 않는다.

### 1.1 PR 제목

- `<type>: <변경 요약>` 형식을 권장한다. 예: `fix: 시장 분석 기록 누락 수정`
- 우선 사용하는 type은 `fix`, `feat`, `refactor`, `docs`, `chore`, `test`, `ci`다.
- 제목에 `[codex]`, `codex`, `autocode`, `copilot` 등 도구나 에이전트 출처를 붙이지 않는다.
- 이 형식은 협업 가독성을 위한 권장 사항이며, 제목 형식만으로 리뷰를 차단하지 않는다.

### 1.2 기여 품질 기준

- 코드량, 파일 수 또는 큰 diff가 아니라 명확한 문제 해결, 최소 영향 범위, 기존 계약 일관성, 실제 위험 경로 검증으로 품질을 판단한다.
- 저장소를 저비용 실험장이나 contribution farming 대상으로 사용하지 않는다. 모든 PR은 작성자가 현재 시스템 계약을 이해하고 자가 검토·통합·검증을 마쳤음을 보여야 한다.
- AI 보조 개발은 허용하지만, 생성된 결과를 의미 단위로 검토하지 않았거나 검증·수렴하지 않은 상태로 제출하지 않는다.
- 리뷰 지적을 받은 한 줄에만 패치를 덧붙이지 않는다. 같은 업무 의미가 걸린 런타임, API/Web, CLI, 설정, 진단, 워크플로, 문서와 테스트를 다시 확인한다.
- 여러 차례 리뷰 뒤에도 같은 계약 불일치, 중복 fallback, 위험 계층을 우회한 테스트, PR 본문과 diff의 불일치가 반복되면 PR을 닫고 다시 설계할 수 있다.

## 2. 한국어 우선 개발과 다국어 정책

이 저장소는 한국어 문서와 사용자 경험을 우선적으로 확장한다. 다만 현재 제품 코드의 Web UI 및 보고서 출력 언어는 `zh`와 `en`만 지원한다. 문서가 한국어라고 해서 제품의 한국어 UI 또는 한국어 보고서가 구현된 것으로 간주하지 않는다.

- 루트 `AGENTS.md`와 `README.md`는 한국어 기준 문서다.
- `AGENTS_CN.md`와 `README_CN.md`는 한국어 전환 시점의 중국어 원본 백업이다. 자동 동기화 대상이나 새 규칙의 기준 문서로 사용하지 않는다.
- `docs/README_EN.md`, `docs/README_CHT.md` 및 기존 중국어/영어 문서는 상위 프로젝트의 다국어 자료다. 사용자 기능을 바꿀 때 영향을 평가하고, 이번 변경에서 동기화하지 않았다면 인계 설명에 이유를 남긴다.
- 한국어 번역은 UTF-8로 저장하고 명령어, 환경 변수, API 경로, JSON 필드, 클래스·함수명과 종목 코드는 원문 그대로 유지한다.
- Web UI에 한국어를 추가할 때:
  - `apps/dsa-web/src/i18n/uiText.ts`의 `UiLanguage` 계약과 번역 키를 확장한다.
  - `UiLanguageContext`, `utils/uiLanguage.ts`, 언어 토글, 저장 값, 브라우저 언어 감지, 테스트를 함께 갱신한다.
  - 페이지 컴포넌트에 한국어 문자열을 직접 하드코딩하지 않고 기존 `t(key)` 경로를 사용한다.
  - 기존 `zh`/`en` 키 누락이나 fallback 회귀가 없도록 키 집합과 렌더링 테스트를 보강한다.
- 보고서에 한국어를 추가할 때:
  - `src/report_language.py`, `src/config.py`, `src/core/config_registry.py`, 템플릿과 보고서 테스트를 한 계약으로 수정한다.
  - `REPORT_LANGUAGE=ko`를 문서화하기 전에 정규화, 프롬프트, 레이블, 알림 렌더링, Web 표시와 설정 검증까지 실제로 지원해야 한다.
  - LLM 자유 텍스트뿐 아니라 고정 레이블, fallback 문구, 요약, 대시보드와 알림 채널도 함께 검증한다.
- 한국 종목 지원과 한국어 지원을 구분한다. `.KS`/`.KQ` 종목은 현재 YFinance 기반의 제한적 분석 경로이며, 한국어 UI·보고서 지원을 의미하지 않는다.

## 3. AI 협업 자산 관리

- `AGENTS.md`가 저장소 AI 협업 규칙의 유일한 기준이다.
- `CLAUDE.md`는 Git에서 `AGENTS.md`를 가리키는 심볼릭 링크로 유지한다.
- `.github/copilot-instructions.md`와 `.github/instructions/*.instructions.md`는 GitHub Copilot/Coding Agent용 요약 또는 경로별 보충 규칙이다. 충돌하면 `AGENTS.md`를 따른다.
- 저장소 협업 skill은 `.claude/skills/`, 로컬 분석 산출물은 `.claude/reviews/`에 둔다. 전자는 버전 관리할 수 있지만 후자는 기본적으로 로컬 산출물이다.
- 루트 `SKILL.md`와 `docs/openclaw-skill-integration.md`는 제품 또는 외부 연동 설명이며 저장소 협업 규칙의 기준이 아니다.
- 새 agent 전용 디렉터리를 만들기 전에 단일 기준을 정하고 스크립트나 생성 방식으로 동기화한다. 같은 규칙을 여러 곳에서 수동 관리하지 않는다.
- AI 협업 자산을 수정하면 다음을 실행한다.

```bash
python scripts/check_ai_assets.py
```

Windows에서 심볼릭 링크가 일반 텍스트 파일처럼 체크아웃된 경우 이 로컬 검사는 실패할 수 있다. 이때 `git ls-files -s CLAUDE.md`의 mode가 `120000`이고 내용이 `AGENTS.md`인지 확인하고, Linux CI의 `ai-governance` 결과를 최종 기준으로 사용한다.

## 4. 저장소 구조와 실행 흐름

### 4.1 제품 범위

- A주, 홍콩주, 미국주와 ETF를 중심으로 시세·기술 지표·뉴스·공시·기본면을 수집한다.
- 일본주 `.T`, 한국 KOSPI `.KS`, KOSDAQ `.KQ`는 YFinance 일봉과 기본 시세 중심의 제한적 경로를 지원한다.
- 기본 흐름은 데이터 수집 → 시장/기술/뉴스 분석 → LLM 분석 → 구조화 결과·보고서 저장 → 알림 전송이다.
- Web/API, Electron 데스크톱, Bot 명령, GitHub Actions와 Docker 실행 경로가 같은 설정·저장소·분석 서비스를 공유한다.

### 4.2 주요 진입점

- `main.py`: CLI, 단일 실행, 시장 복기, 스케줄러, Web/API 동시 실행
- `server.py`: FastAPI ASGI 애플리케이션 진입점
- `webui.py`: Web 서비스 전용 호환 진입점
- `api/app.py`, `api/v1/`: 인증, 분석, 기록, 종목, 백테스트, 포트폴리오, 알림, AI 제안, Agent, AlphaSift, 시스템 설정, 사용량 API
- `apps/dsa-web/`: React 19, TypeScript, Vite 기반 Web UI
- `apps/dsa-desktop/`: Web UI와 패키징된 Python 백엔드를 실행하는 Electron 앱
- `.github/workflows/`: CI, 일일 분석, 네트워크 관측, 태그·릴리스, Docker·데스크톱 배포

### 4.3 핵심 모듈

- `src/core/`: 분석 파이프라인, 시장 복기, 거래일·시장 단계, 런타임 스케줄링, 백테스트
- `src/services/`: 분석·기록·포트폴리오·알림·AI 제안·진단·보고서 렌더링 등 업무 서비스
- `src/repositories/`: SQLite 데이터 접근 계층
- `src/schemas/`, `api/v1/schemas/`: 내부 및 API 데이터 계약
- `src/agent/`, `strategies/`: Agent 도구·오케스트레이션과 15개 내장 YAML 전략
- `src/report_language.py`, `src/services/report_renderer.py`, `templates/`: 보고서 언어·렌더링·Jinja 템플릿
- `data_provider/`: Efinance, AkShare, Tushare, Pytdx, Baostock, YFinance, Longbridge, TickFlow 등 공급자와 fallback
- `src/notification.py`, `src/notification_sender/`: 알림 계약, 라우팅과 채널별 전송기
- `bot/`: Feishu, DingTalk, Discord Bot과 명령 디스패치
- `tests/`: pytest 기반 백엔드 단위·통합·네트워크 테스트
- `docs/`: 설정, 배포, 기능 계약, 운영·문제 해결 문서

## 5. 자주 쓰는 명령

### 5.1 설치와 실행

```bash
python -m pip install -r requirements.txt
python main.py
python main.py --debug
python main.py --dry-run
python main.py --stocks 600519,HK00700,AAPL,005930.KS
python main.py --market-review
python main.py --schedule
python main.py --serve
python main.py --serve-only
uvicorn server:app --reload --host 127.0.0.1 --port 8000
```

CLI 동작을 바꾸기 전에 `main.py::parse_arguments`의 실제 옵션을 확인한다. `--webui`와 `--webui-only`는 각각 `--serve`와 `--serve-only`의 호환 별칭이다.

### 5.2 백엔드 검증

```bash
python -m pip install flake8 pytest
bash scripts/ci_gate.sh
python -m pytest -m "not network"
python -m py_compile <변경한_python_파일>
```

### 5.3 Web

```bash
cd apps/dsa-web
npm ci
npm run test
npm run lint
npm run build
```

Web은 Node `>=20.19.0 <27`, npm `>=10`을 요구한다. 브라우저 E2E가 필요한 변경은 `npm run test:smoke`를 추가한다.

### 5.4 데스크톱

```powershell
.\scripts\build-all.ps1
```

```bash
cd apps/dsa-desktop
npm install
npm test
npm run build
```

데스크톱 변경은 Web을 먼저 빌드하고, 플랫폼 제약으로 설치 패키지를 만들지 못하면 Web 산출물·Electron 테스트·릴리스 워크플로 중 어디까지 검증했는지 명시한다.

### 5.5 PR과 CI 증거

```bash
gh pr view <pr_number>
gh pr checks <pr_number>
gh run view <run_id> --log-failed
```

## 6. 기본 작업 절차

1. 작업 유형을 `fix / feat / refactor / docs / chore / test / review` 중 하나로 분류한다.
2. 구현, 설정, 테스트, 스크립트, 워크플로와 관련 문서를 먼저 읽는다.
3. 변경 경계를 Backend / API / Web / Desktop / Workflow / Docs / AI 자산으로 나눈다.
4. 설정 의미, API/Schema, 공급자 fallback, 보고서 구조, 인증, 스케줄, 릴리스, 데스크톱 시작 체인처럼 위험도가 높은 계약인지 판단한다.
5. 현재 작업에 직접 필요한 최소 변경만 한다.
6. 문서와 실행 상태가 다르면 실행 가능한 코드와 워크플로를 우선하고 관련 문서를 교정한다.
7. 같은 업무 의미가 여러 진입점에 걸리면 모든 소비 경로와 테스트를 확인한다.
8. 변경 면에 맞는 검증을 실행하고 실제 출력에서 성공 여부를 확인한다.
9. 최종 인계에는 변경 내용, 이유, 검증 결과, 미검증 항목, 위험, 롤백 방법을 적는다.

## 7. 검증 기준

### 7.1 CI 구성

| 검사 | 워크플로 | 내용 | 차단 여부 |
| --- | --- | --- | --- |
| `ai-governance` | `.github/workflows/ci.yml` | AI 협업 자산 관계 검사 | 차단 |
| `backend-gate` | `.github/workflows/ci.yml` | 문법, 치명적 flake8, 결정적 검사, 비네트워크 pytest | 차단 |
| `docker-build` | `.github/workflows/ci.yml` | 이미지 빌드와 핵심 모듈 import smoke | 차단 |
| `web-gate` | `.github/workflows/ci.yml` | Web 경로 변경 시 lint와 build | 차단 |
| `network-smoke` | `.github/workflows/network-smoke.yml` | 외부 네트워크 의존 경로 관측 | 비차단 |
| `pr-review` | `.github/workflows/pr-review.yml` | PR 정적 검사·AI 보조 리뷰·라벨 | 보조 |

PR에 이미 같은 범위의 CI 증거가 있으면 이를 인용할 수 있다. CI가 변경 면을 다루지 않거나 로컬과 환경 차이가 크면 추가 검증과 남은 공백을 설명한다.

### 7.2 변경 면별 최소 검증

- Python 백엔드
  - 범위: `main.py`, `src/`, `data_provider/`, `api/`, `bot/`, `tests/`
  - 우선: `bash scripts/ci_gate.sh`
  - 최소: 변경 Python 파일의 `py_compile`과 가장 가까운 결정적 테스트
  - API, 파이프라인, 보고서, 알림, fallback, 인증 또는 스케줄에 영향이 있으면 해당 경로의 검증 여부를 따로 적는다.
- Web
  - `npm ci && npm run test && npm run lint && npm run build`
  - API 연동, 라우팅, 상태 관리, Markdown/차트, 인증 또는 i18n이면 관련 테스트와 미검증 브라우저 위험을 적는다.
- 데스크톱
  - Web 빌드 후 Electron 테스트와 빌드를 실행한다.
  - `scripts/run-desktop.ps1`, 빌드 스크립트, 패키지 자원, 자동 업데이트와 Release workflow를 함께 평가한다.
- API/Schema/인증 연동
  - 백엔드 검증과 영향을 받는 Web/데스크톱 검증을 함께 수행한다.
  - 로그인, Cookie, 세션, 폴링 상태, 필드 또는 enum을 바꾸면 호환성 영향을 명시한다.
- 문서·거버넌스
  - 코드 테스트는 필수가 아니지만 명령, 설정 키, 파일명, 링크, workflow 이름을 실제 저장소와 대조한다.
  - AI 자산 변경에는 `python scripts/check_ai_assets.py`를 실행한다.
- Workflow·스크립트·Docker
  - 가장 가까운 로컬 검증을 실행하고 영향을 받는 파이프라인·배포·릴리스 경로를 적는다.
  - Docker 또는 GitHub Actions를 실행하지 못했으면 이유와 잠재 위험을 명시한다.
- 네트워크·외부 서비스
  - 오프라인·결정적 검사를 먼저 실행한다.
  - timeout, retry, fallback, 오류 문구와 degraded path를 확인한다.
  - 온라인 검증을 하지 않았다면 그 이유를 적는다.

## 8. 안정성 보호 규칙

- 설정과 실행 진입점
  - `.env` 의미, 기본값, CLI, 서비스 시작 또는 스케줄을 바꾸면 로컬, Docker, GitHub Actions, API, Web과 데스크톱 영향을 함께 본다.
  - 새 설정은 가능하면 미설정 상태에서도 기존 기능이 동작하고, 설정했을 때만 기능이 확장되게 한다.
- 데이터 공급자와 fallback
  - `data_provider/` 변경은 우선순위, 실패 전환, 필드 표준화, 캐시, timeout과 회로 차단을 함께 본다.
  - 요구 사항이 fail-fast를 명시하지 않는 한 한 공급자 실패가 전체 분석을 중단시키지 않게 한다.
  - 일본·한국 종목에는 A주 전용 자금 흐름, 용호방, 섹터 데이터를 억지로 적용하지 않는다.
- API, Web, 데스크톱
  - API/Schema/인증/보고서 payload 변경은 모든 클라이언트 호환성을 확인한다.
  - 기본적으로 필드를 추가하고 이전 필드를 유지하거나 호환 계층을 제공한다.
- 보고서, Prompt와 알림
  - 보고서 구조, Prompt, 추출기, 템플릿, Bot 변경은 상류 입력과 하류 소비자를 함께 확인한다.
  - 한 알림 채널 실패가 분석 전체를 중단시키지 않게 한다.
  - `src/services/image_stock_extractor.py`의 `EXTRACT_PROMPT`를 바꾸면 PR 설명에 전체 최신 prompt를 첨부한다.
- 저장소와 작업 큐
  - SQLite 스키마, repository, 서비스의 트랜잭션 경계를 함께 확인한다.
  - 장기 실행 작업의 상태, 결과 저장, 재시도와 중복 요청 처리 계약을 테스트한다.
- 배포, 릴리스와 패키징
  - 자동 태그, Release, Docker, 일일 분석 또는 데스크톱 패키징 변경은 트리거, 권한, 산출물 경로와 롤백을 검토한다.
  - 자동 태그는 커밋 제목에 `#patch`, `#minor`, `#major`가 있을 때만 동작하는 opt-in 정책을 유지한다.

## 9. Issue, PR과 저장소 Skill

- 저장소에 다음 협업 skill이 있다.
  - `.claude/skills/analyze-issue/SKILL.md`
  - `.claude/skills/analyze-pr/SKILL.md`
  - `.claude/skills/fix-issue/SKILL.md`
- issue 분석, PR 리뷰 또는 issue 수정 작업은 해당 skill을 우선 사용하고 결과를 `.claude/reviews/`에 둔다.
- PR 생성·갱신, PR 리뷰 또는 issue 분석 전에는 작업 트리를 확인하고 `git fetch --all --prune`을 실행한다. 작업 트리가 깨끗하고 현재 분기가 fast-forward 가능할 때만 `git pull --ff-only`를 실행한다.
- 로컬 변경, 충돌, 추적되지 않은 위험 파일 또는 non-fast-forward 상태가 있으면 강제로 분기 전환, stash, reset 또는 덮어쓰기를 하지 않는다. 리뷰·분석은 fetch한 원격 ref를 사용할 수 있으며, 사용한 로컬 HEAD와 원격 기준을 결과에 기록한다.
- 안전한 fast-forward 동기화를 제외한 `git pull`, `git push`, `git tag`, `gh pr create` 등 원격이나 현재 분기를 바꾸는 작업에는 사용자 승인이 필요하다.
- PR 리뷰 순서는 필요성 → 관련성 → 제목 → 템플릿 대비 설명 완결성 → 검증 증거 → 구현 정확성 → 병합 판단이다.
- `fix` PR은 원래 문제, 근본 원인, 수정 지점과 회귀 위험을 설명해야 한다.
- 다음은 병합 차단 조건이다.
  - 정확성 또는 보안 문제
  - 차단 CI 실패
  - PR 설명과 실제 diff의 실질적 모순
  - 롤백 방법 누락
  - 수렴하지 않은 계약 불일치, 패치 누적 또는 잘못된 검증 증거의 반복

### 9.1 리뷰 피드백 처리

1. 리뷰어가 지적한 원래 문제를 항목별로 정리한다.
2. 단순히 변경한 줄이 아니라 근본 원인을 설명한다.
3. 같은 의미가 영향을 주는 런타임, API/Web, CLI, 설정, 진단, workflow, 문서와 테스트를 찾는다.
4. 실패 테스트나 댓글 한 줄이 아니라 전체 계약을 수정한다.
5. 리뷰 반례를 재현하는 회귀 테스트 또는 최종 진입점 검증을 추가한다. 불가능하면 이유를 적는다.
6. PR 본문을 현재 head의 범위, 검증, 호환성, 위험과 롤백 방법에 맞게 갱신한다.

광범위한 fallback, 조용한 `False/None/[]` 반환, 실제 위험 계층을 mock으로 가린 테스트, CI 통과만으로 반례가 해결됐다고 주장하는 행위, PR 본문과 diff의 불일치, 같은 업무 의미의 런타임·클라이언트·문서 간 불일치를 허용하지 않는다.

## 10. 인계와 릴리스

- 기본 인계 구조:
  - 변경한 내용
  - 변경 이유
  - 검증 결과
  - 미검증 항목
  - 위험 요소
  - 롤백 방법
- 문서 전용 작업은 `Docs only, tests not run`이라고 적을 수 있지만 명령, 파일명과 링크를 대조한 결과는 남긴다.
- 수동 태그는 annotated tag로 만든다.
- 사용자에게 보이는 변경은 PR로 병합하고 적절한 label과 검증 설명을 갖추는 방식을 우선한다.
