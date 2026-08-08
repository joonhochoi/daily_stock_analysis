<div align="center">

# 📈 AI 주식 분석 시스템

[![GitHub stars](https://img.shields.io/github/stars/joonhochoi/daily_stock_analysis?style=social)](https://github.com/joonhochoi/daily_stock_analysis/stargazers)
[![CI](https://github.com/joonhochoi/daily_stock_analysis/actions/workflows/ci.yml/badge.svg)](https://github.com/joonhochoi/daily_stock_analysis/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-Ready-2088FF?logo=github-actions&logoColor=white)](https://github.com/features/actions)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://hub.docker.com/r/zhulinsen/daily_stock_analysis)

<p align="center">
  <img src="https://trendshift.io/api/badge/trendshift/repositories/18527/daily?language=Python" alt="Trendshift 오늘의 Python 저장소 1위" width="250" height="55"/>&nbsp;<a href="https://hellogithub.com/repository/ZhuLinsen/daily_stock_analysis" target="_blank"><img src="https://api.hellogithub.com/v1/widgets/recommend.svg?rid=6daa16e405ce46ed97b4a57706aeb29f&claim_uid=pfiJMqhR9uvDGlT&theme=neutral" alt="HelloGitHub 추천 프로젝트" width="230" /></a>
</p>

> 🤖 AI 대규모 언어 모델을 이용해 중국 A주·홍콩주·미국주·일본주·한국주 관심 종목을 분석하고, 매일 “의사결정 대시보드”를 생성해 다양한 채널로 전송하는 주식 분석 시스템

[**제품 미리보기**](#-제품-미리보기) · [**주요 기능**](#-주요-기능) · [**빠른 시작**](#-빠른-시작) · [**프로젝트 구조**](#-프로젝트-구조) · [**한글화 현황**](#-한글화-현황과-개발-방향) · [**문서 센터**](docs/INDEX.md)

한국어 | [简体中文](README_CN.md) | [English](docs/README_EN.md) | [繁體中文](docs/README_CHT.md)

</div>

> [!IMPORTANT]
> 이 저장소는 한국어 문서화와 제품 한글화를 우선하는 포크입니다. Web UI와 보고서 출력 언어 계약은 중국어(`zh`)·영어(`en`)·한국어(`ko`)를 지원합니다. 현재 번역 범위와 남은 작업은 [한글화 현황](#-한글화-현황과-개발-방향)을 확인해 주세요.

## 💖 스폰서

<div align="center">
  <p align="center">
    <a href="https://open.anspire.cn/?share_code=QFBC0FYC" target="_blank"><img src="./docs/assets/anspire.png" alt="Anspire Open 통합 모델 및 검색 서비스" width="300" height="141" style="width: 300px; height: 141px; object-fit: contain;"></a>
    <a href="https://serpapi.com/baidu-search-api?utm_source=github_daily_stock_analysis" target="_blank"><img src="./docs/assets/serpapi_banner_zh.png" alt="실시간 금융 뉴스 검색 데이터 - SerpApi" width="300" height="141" style="width: 300px; height: 141px; object-fit: contain;"></a>
  </p>
</div>

## 🖥️ 제품 미리보기

<p align="center">
  <img src="docs/assets/readme_workspace_tour_20260510.gif" alt="DSA Web 워크스페이스 데모" width="720">
</p>

## ✨ 주요 기능

| 기능 | 현재 제공 범위 |
| --- | --- |
| AI 의사결정 보고서 | 핵심 결론, 점수, 추세, 매수·매도 구간, 위험 경보, 촉매 요인, 실행 체크리스트 |
| 다중 시장 데이터 집계 | A주·홍콩주·미국주·ETF의 시세, 일봉, 기술 지표, 자금 흐름, 매물대, 뉴스, 공시, 기본면. 일본주 `.T`와 한국주 `.KS`/`.KQ`는 YFinance 일봉·기본 시세·기술 지표 중심의 제한적 지원 |
| Web·데스크톱 워크스페이스 | 수동 분석, 작업 진행률, 분석 기록, 전체 Markdown, 백테스트, 포트폴리오, 설정, 라이트·다크 테마 |
| Agent 전략 질의 | Web/Bot/API에서 다회차 질문과 15개 내장 전략 지원. 이동평균, 추세, 파동, 이벤트, 성장성, 기대 재평가 등 |
| 지능형 가져오기·검색 | 이미지, CSV/Excel, 클립보드에서 종목을 가져오고 코드·이름·병음·별칭으로 자동 완성 |
| 포트폴리오·AI 제안·경보 | 보유 종목 관리, 위험 분석, 구조화된 DecisionSignal, 규칙 기반 경보와 후행 성과 확인 |
| 자동화·배포 | GitHub Actions, Docker, 로컬 스케줄러, FastAPI, Windows/macOS Electron 패키징 |
| 다채널 알림 | 기업 WeChat, Feishu/Lark, Telegram, Discord, Slack, 이메일, PushPlus, ntfy, Gotify, Pushover, Server酱3, 사용자 정의 Webhook 등 |
| 종목 선별·정보 소스 | AlphaSift 전략 선별, RSS/Atom 정보 소스, 뉴스 검색과 선택적 미국주 소셜 심리 데이터 |

일본·한국 시장은 실시간 시세, 자금 흐름, 용호방, 전체 시장 종목 목록, 완전한 기본면과 포트폴리오 환율을 보장하지 않습니다. 정확한 경계는 [시장 지원 범위](docs/market-support.md)를 참고하세요.

### 기술 스택과 데이터 소스

| 구분 | 구성 |
| --- | --- |
| 백엔드 | Python 3.10+, FastAPI, SQLAlchemy·SQLite, pandas, Jinja2, schedule |
| Web | React 19, TypeScript, Vite 7, Tailwind CSS, Zustand, Recharts, Vitest, Playwright |
| 데스크톱 | Electron 31, electron-builder, Windows NSIS·macOS DMG |
| AI 모델 | [Anspire](https://open.anspire.cn/?share_code=QFBC0FYC), [AIHubMix](https://aihubmix.com/?aff=CfMq), Gemini, OpenAI 호환 API, DeepSeek, Qwen, Claude, Ollama 등. LiteLLM 기반 다중 채널과 로컬 CLI backend 지원 |
| 시세·기본면 | [TickFlow](https://tickflow.org/auth/register?ref=WDSGSPS5XC), Efinance, AkShare, Tushare, Pytdx, Baostock, YFinance, Longbridge, Finnhub, Alpha Vantage |
| 뉴스 검색 | [Anspire](https://open.anspire.cn/?share_code=QFBC0FYC), [SerpAPI](https://serpapi.com/baidu-search-api?utm_source=github_daily_stock_analysis), [Tavily](https://tavily.com/), [Bocha](https://open.bocha.cn/), [Brave](https://brave.com/search/api/), MiniMax, SearXNG |
| 소셜 심리 | [Stock Sentiment API](https://api.adanos.org/docs)의 Reddit·X·Polymarket 데이터. 미국주 전용 선택 기능 |

데이터 소스의 실제 우선순위는 시장, 설정과 사용 가능한 API 키에 따라 달라지며 실패 시 다음 공급자로 전환됩니다. 세부 규칙은 [전체 설정·배포 가이드](docs/full-guide.md)의 데이터 소스 항목을 확인하세요.

## 🚀 빠른 시작

가장 간단한 사용 방법은 GitHub Actions입니다. Web UI 또는 데스크톱을 개발하려면 로컬 설치를 권장하고, 서버에 계속 실행하려면 Docker가 편리합니다.

### 방법 1: GitHub Actions

> 서버 없이 정해진 시간에 자동 분석하고 알림을 받는 방식입니다. API 제공자의 요금·무료 한도는 별도입니다.
>
> 원본 프로젝트의 [GitHub Actions 영상 튜토리얼](https://www.bilibili.com/video/BV11FEb66EXG/)도 참고할 수 있습니다.

#### 1. 저장소 Fork

[현재 한국어 포크](https://github.com/joonhochoi/daily_stock_analysis)를 Fork합니다. 원본 프로젝트는 [ZhuLinsen/daily_stock_analysis](https://github.com/ZhuLinsen/daily_stock_analysis)입니다.

#### 2. AI 모델 설정

`Settings → Secrets and variables → Actions`에서 API 키는 **Repository secrets**, 일반 옵션은 **Repository variables**에 두는 것을 권장합니다. 아래 중 사용할 모델 키 하나 이상을 설정하세요.

| 이름 | 설명 | 권장 저장 위치 |
| --- | --- | --- |
| `ANSPIRE_API_KEYS` | Anspire 모델과 검색 서비스 키 | Secret |
| `AIHUBMIX_KEY` | AIHubMix 통합 모델 키 | Secret |
| `GEMINI_API_KEY` | Google Gemini API 키 | Secret |
| `ANTHROPIC_API_KEY` | Anthropic Claude API 키 | Secret |
| `OPENAI_API_KEY` | OpenAI 또는 OpenAI 호환 서비스 키 | Secret |
| `OPENAI_BASE_URL`, `OPENAI_MODEL` | OpenAI 호환 endpoint와 모델 | Variable 또는 Secret |

다중 모델, fallback, 이미지 인식, Ollama 또는 로컬 CLI backend는 [LLM 설정 가이드](docs/LLM_CONFIG_GUIDE.md)를 참고하세요. GitHub Actions에서는 로컬 Ollama보다 외부 API 사용이 적합합니다.

#### 3. 관심 종목 설정

`STOCK_LIST`를 Repository variable로 추가합니다. 같은 이름의 Secret도 workflow가 읽지만, 비밀 정보가 아닌 종목 목록은 variable이 더 적절합니다.

```text
600519,HK00700,AAPL,7203.T,005930.KS
```

대표 코드 형식:

- 중국 A주: `600519`, `000001`
- 홍콩주: `HK00700` 또는 `1810.HK`
- 미국주: `AAPL`, `MSFT`
- 일본주: `7203.T`
- 한국 KOSPI: `005930.KS`
- 한국 KOSDAQ: `035720.KQ`

#### 4. 알림 채널 설정

알림을 받으려면 아래 중 한 채널 이상을 설정합니다.

| 이름 | 채널 |
| --- | --- |
| `WECHAT_WEBHOOK_URL` | 기업 WeChat 로봇 |
| `FEISHU_WEBHOOK_URL` | Feishu/Lark Webhook |
| `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` | Telegram |
| `DISCORD_WEBHOOK_URL` | Discord Webhook |
| `SLACK_BOT_TOKEN` + `SLACK_CHANNEL_ID` | Slack Bot |
| `EMAIL_SENDER` + `EMAIL_PASSWORD` | SMTP 이메일 |

PushPlus, ntfy, Gotify, Pushover, Server酱3, 사용자 정의 Webhook, 서명 검증, 이메일 그룹, Markdown 이미지 변환은 [알림 기능 문서](docs/notifications.md)와 [전체 가이드](docs/full-guide.md)를 참고하세요.

#### 5. 뉴스 검색 설정

뉴스와 여론·이벤트 분석 품질을 높이려면 검색 공급자 하나 이상을 설정하세요.

| 이름 | 용도 |
| --- | --- |
| `ANSPIRE_API_KEYS` | 중국어권 금융 뉴스와 AI 검색, 모델 키로도 재사용 가능 |
| `SERPAPI_API_KEYS` | 검색 엔진 기반 실시간 금융 뉴스 보강 |
| `TAVILY_API_KEYS` | 범용 뉴스 검색 |
| `BOCHA_API_KEYS` | 중국어 검색과 AI 요약 |
| `BRAVE_API_KEYS` | 프라이버시 중심 검색, 미국주 정보 보강 |
| `MINIMAX_API_KEYS` | 구조화 검색 결과 |
| `SEARXNG_BASE_URLS` | 자체 호스팅 SearXNG endpoint |

검색 키를 설정하지 않아도 가능한 데이터만으로 분석하지만 뉴스·촉매·여론 구역은 제한될 수 있습니다.

#### 6. Actions 활성화와 시험 실행

1. `Actions` 탭에서 workflow 사용을 허용합니다.
2. `每日股票分析` workflow를 선택합니다.
3. `Run workflow`에서 `full`, `market-only`, `stocks-only` 중 모드를 선택합니다.
4. 거래일 검사를 건너뛰어야 하는 시험 실행에만 `force_run`을 사용합니다.

기본 스케줄은 월요일~금요일 UTC 10:00, 즉 중국 표준시 18:00·한국 표준시 19:00입니다. A/H/US 휴장일에는 기본적으로 실행을 건너뛸 수 있으며, workflow 완료 후 `reports/`와 `logs/`가 30일 artifact로 업로드됩니다.

### 방법 2: 로컬 실행

원본 프로젝트의 [클라이언트 설정 영상 튜토리얼](https://www.bilibili.com/video/BV11FEb66Eyr/)도 함께 참고할 수 있습니다.

#### 요구 사항

- Python 3.10 이상
- Git
- Web UI를 빌드할 경우 Node.js 20.19 이상 27 미만과 npm 10 이상
- 일부 데이터·검색·LLM·알림 기능을 위한 인터넷 연결과 각 서비스 API 키

#### Windows PowerShell

```powershell
git clone https://github.com/joonhochoi/daily_stock_analysis.git
Set-Location daily_stock_analysis

python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

Copy-Item .env.example .env
notepad .env

python main.py
```

#### macOS·Linux·Git Bash

```bash
git clone https://github.com/joonhochoi/daily_stock_analysis.git
cd daily_stock_analysis

python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

cp .env.example .env
${EDITOR:-vi} .env

python main.py
```

최소한 `.env`에 관심 종목과 사용할 LLM 자격 증명을 설정합니다.

```dotenv
STOCK_LIST=005930.KS,AAPL,HK00700

# 아래는 예시입니다. 실제로 사용할 공급자 하나 이상을 설정하세요.
GEMINI_API_KEY=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
```

자주 쓰는 명령:

```bash
python main.py --debug
python main.py --dry-run
python main.py --stocks 005930.KS,AAPL
python main.py --no-notify
python main.py --check-notify
python main.py --market-review
python main.py --no-market-review
python main.py --backtest
python main.py --schedule
python main.py --force-run
python main.py --serve-only
```

`--dry-run`은 데이터 경로만 확인하고 AI 분석을 생략합니다. `--force-run`은 거래일 보호 장치를 우회하므로 의도적인 시험에서만 사용하세요.

### 방법 3: Web UI

Web 워크스페이스는 설정 관리, 작업 진행 상태, 수동 분석, 기록, 전체 Markdown 보고서, Agent 질의, 백테스트, 포트폴리오, AI 제안, 경보, 종목 선별과 LLM 사용량 화면을 제공합니다.

```bash
python main.py --webui-only
```

기본 주소는 [http://127.0.0.1:8000](http://127.0.0.1:8000)이고 API 문서는 [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)입니다. `WEBUI_AUTO_BUILD=true`이면 필요한 경우 Web frontend를 자동 빌드하므로 Node.js가 필요합니다.

개발 중 frontend만 실행할 때:

```bash
cd apps/dsa-web
npm ci
npm run dev
```

인증을 사용하려면 `ADMIN_AUTH_ENABLED=true`를 설정하고 첫 접속에서 관리자 비밀번호를 만듭니다. 외부 공개 시에는 `WEBUI_HOST=0.0.0.0`만 설정해 직접 노출하기보다 HTTPS reverse proxy, 인증, 방화벽과 신뢰 프록시 설정을 함께 검토하세요.

### 방법 4: Docker

`.env`를 만든 뒤 목적에 맞는 서비스를 시작합니다.

```bash
# Web/API 서버
docker compose -f docker/docker-compose.yml up -d server

# 스케줄 분석기
docker compose -f docker/docker-compose.yml up -d analyzer

# 둘 다 실행
docker compose -f docker/docker-compose.yml up -d analyzer server
```

`data/`, `logs/`, `reports/`, `strategies/`가 호스트에 연결됩니다. 전체 분석은 메모리 1GB 이상을 권장하며 512MB 환경에서는 단일 종목·낮은 동시성 등 제한된 구성이 적합합니다. 자세한 내용은 [배포 가이드](docs/DEPLOY.md)와 [전체 가이드](docs/full-guide.md)를 참고하세요.

## 🧭 분석 흐름

```text
CLI / GitHub Actions / Web / Bot
                │
                ▼
        설정 로드와 실행 진단
                │
                ▼
  시장 판별·거래일·시장 단계 확인
                │
                ▼
시세·일봉·기본면·뉴스·정보 소스 수집
        │ 공급자 실패 시 fallback
        ▼
기술 분석 + 시장 컨텍스트 + LLM 분석
                │
                ▼
구조화 결과·DecisionSignal·보고서 저장
                │
                ▼
 Web 기록 / Markdown / 알림 / 백테스트
```

SQLite 데이터베이스 기본 위치는 `data/stock_analysis.db`입니다. 로그와 보고서는 각각 `logs/`, `reports/`에 저장되며 이 경로는 Git에서 제외됩니다.

## 🗂️ 프로젝트 구조

```text
daily_stock_analysis/
├─ main.py                     # CLI, 분석, 스케줄, 서비스 실행 진입점
├─ server.py                   # FastAPI ASGI 진입점
├─ api/                        # /api/v1 REST API와 인증·오류 처리
├─ src/
│  ├─ core/                    # 파이프라인, 시장 복기, 거래일, 백테스트
│  ├─ services/                # 업무 서비스와 보고서·진단·작업 처리
│  ├─ repositories/            # SQLite 데이터 접근 계층
│  ├─ schemas/                 # 내부 데이터 계약
│  ├─ agent/                   # Agent, 도구, 전략 라우팅, 대화 메모리
│  └─ notification_sender/     # 채널별 알림 전송기
├─ data_provider/              # 시장별 데이터 공급자와 fallback
├─ bot/                        # Feishu, DingTalk, Discord Bot
├─ strategies/                 # 15개 내장 자연어 YAML 전략
├─ templates/                  # Jinja2 보고서 템플릿
├─ apps/
│  ├─ dsa-web/                 # React/Vite Web UI
│  └─ dsa-desktop/             # Electron 데스크톱
├─ tests/                      # pytest 테스트
├─ scripts/                    # CI gate, 빌드, 진단, 인덱스 생성
├─ docker/                     # Dockerfile과 Compose
├─ docs/                       # 설정·배포·기능 계약 문서
└─ .github/workflows/          # CI, 일일 분석, 릴리스 자동화
```

### 주요 API 영역

FastAPI는 `/api/v1` 아래에 인증, Agent, 분석, 기록, 종목, 백테스트, 시스템 설정, LLM 사용량, 포트폴리오, 경보, DecisionSignal, AlphaSift, 정보 소스와 상태 확인 endpoint를 제공합니다. 실제 요청·응답 계약은 실행 중인 `/docs`와 [OpenAPI 스펙](docs/architecture/api_spec.json)을 기준으로 확인하세요.

## 📱 보고서와 알림 예시

아래 형식은 `REPORT_LANGUAGE=ko`에서 사용하는 한국어 고정 레이블과 보고서 구조를 보여 줍니다. LLM이 작성하는 서술의 자연스러움과 종목명 번역 품질은 선택한 모델과 입력 데이터에 따라 달라질 수 있습니다.

### 종목 의사결정 대시보드

```text
🎯 2026-02-08 의사결정 대시보드
분석 종목 3개 | 🟢매수:0 🟡관망:2 🔴매도:1

📊 분석 결과 요약
⚪ 종목 A(000657): 관망 | 점수 65 | 강세
⚪ 종목 B(600105): 관망 | 점수 48 | 횡보
🟡 종목 C(300260): 매도 | 점수 35 | 약세

🚨 위험 경보
- 단기 매도 압력과 자금 이탈 여부 확인
- 매물 집중도와 상승 저항 점검
- 공시·규제·재편 관련 위험 추적

✨ 긍정적 촉매
- 산업 성장과 핵심 공급망 수혜 가능성
- 실적 성장과 현금 흐름 개선

생성 시각: 18:00
```

### 시장 복기

```text
🎯 2026-01-10 시장 복기

📊 주요 지수
- 상하이 종합: 3250.12 (🟢 +0.85%)
- 선전 성분: 10521.36 (🟢 +1.02%)
- 차이넥스트: 2156.78 (🟢 +1.35%)

📈 시장 개요
상승: 3920 | 하락: 1349 | 상한가: 155 | 하한가: 3

🔥 업종 흐름
강세: 인터넷 서비스, 미디어, 희소 금속
약세: 보험, 항공·공항, 태양광 장비
```

## ⚙️ 핵심 설정

`.env.example`이 실행 가능한 설정 목록의 기준입니다. 파일이 크므로 처음에는 필요한 최소 항목만 채우고, Web 설정 화면 또는 관련 문서를 통해 기능별 설정을 추가하세요.

| 영역 | 대표 설정 |
| --- | --- |
| 관심 종목 | `STOCK_LIST` |
| 모델·라우팅 | `LLM_CHANNELS`, `LITELLM_MODEL`, 공급자별 API 키, `GENERATION_BACKEND` |
| 보고서 | `REPORT_TYPE`, `REPORT_LANGUAGE`, `REPORT_SHOW_LLM_MODEL` |
| 검색 | `ANSPIRE_API_KEYS`, `SERPAPI_API_KEYS`, `TAVILY_API_KEYS`, `SEARXNG_BASE_URLS` |
| 데이터 | 공급자별 API 키와 `*_PRIORITY`, `REALTIME_SOURCE_PRIORITY` |
| 스케줄 | `SCHEDULE_ENABLED`, `SCHEDULE_TIME`, `SCHEDULE_TIMES`, `MARKET_REVIEW_ENABLED` |
| Web·인증 | `WEBUI_ENABLED`, `WEBUI_HOST`, `WEBUI_PORT`, `ADMIN_AUTH_ENABLED` |
| 저장 | `DATABASE_PATH`, `SQLITE_WAL_ENABLED`, `SAVE_CONTEXT_SNAPSHOT` |
| 알림 | 채널별 자격 증명, `NOTIFICATION_*_CHANNELS`, 중복 억제·조용한 시간 설정 |

구성 검사는 다음 명령으로 확인할 수 있습니다.

```bash
python scripts/check_env.py
python main.py --check-notify
```

비밀 값이 들어 있는 `.env`, 데이터베이스, 로그와 보고서는 커밋하지 마세요.

Web 화면 언어는 우측 언어 버튼으로 `zh → en → ko` 순서로 전환할 수 있으며 브라우저의 `dsa.uiLanguage`에 저장됩니다. 보고서 언어는 별도 설정인 `REPORT_LANGUAGE=zh|en|ko`로 지정합니다. 두 설정은 서로 덮어쓰지 않습니다.

## 🤖 Agent 전략 질의

사용 가능한 AI API 키를 설정하면 Web의 `/chat`에서 전략 기반 종목 질의를 사용할 수 있습니다. 필요하면 `AGENT_MODE=false`로 명시적으로 끌 수 있습니다.

- 이동평균 골든크로스, 추세, 박스권, 거래량 돌파, 파동, 이벤트, 성장성 등 15개 내장 전략
- 전략 선택기의 이름과 설명은 Web UI 언어(`zh` / `en` / `ko`)에 맞춰 표시됩니다. 내부 전략 ID와 YAML 원문 지시문은 호환성을 위해 유지됩니다.
- 실시간 시세, 일봉, 기술 지표, 뉴스, 포트폴리오와 위험 도구
- 다회차 질문, 세션 저장·내보내기, 알림 전송, 백그라운드 실행
- `strategies/*.yaml` 또는 `AGENT_SKILL_DIR`를 통한 사용자 전략
- 실험적 다중 Agent 오케스트레이션과 모델 사용량 추적

전략 파일은 제품 문서에서 “전략”이라고 부르지만 내부 API와 설정에서는 호환성을 위해 `skill`이라는 이름을 사용합니다.

## 🌐 한글화 현황과 개발 방향

### 현재 완료된 범위

- 루트 협업 규칙과 프로젝트 README를 한국어 기준 문서로 전환
- 전환 전 중국어 원문을 `AGENTS_CN.md`, `README_CN.md`에 보존
- 한국 KOSPI `.KS`, KOSDAQ `.KQ` 종목의 제한적 분석·검색 인덱스 경로 확인
- 한국어 작업에서 기존 중국어·영어 기능 계약을 깨뜨리지 않도록 저장소 규칙 정리
- Web UI 언어 계약에 `ko` 추가: 저장값, `ko-KR` 브라우저 감지, 3단계 토글, 문서 `lang`, 주요 화면·설정·백테스트·알림·포트폴리오 문구
- 보고서 언어 계약에 `ko` 추가: 환경 설정, API 요청 스키마, Prompt, 보고서 레이블, 시장 복기, 알림·기록 fallback, 장 구분·데이터 품질 가드레일
- 기존 `zh`·`en`을 유지하면서 Web 및 Python 한국어 회귀 테스트 추가

### 남은 한글화 범위

- 고급 실행 진단·DecisionSignal·설정 도움말의 드문 문구는 일부 영어 fallback을 사용하므로 순차 번역 필요
- 외부 LLM이 생성하는 한국어 종목명과 서술 품질의 모델별 실제 실행 검증
- 데스크톱 시작·업데이트·오류 메시지의 전체 한국어 번역
- FastAPI 문서, 설정 도움말, Bot 명령과 전체 `docs/`의 한국어판
- 한국 시장 전용 실시간 데이터, 자금 흐름, 시장 복기, 산업·공시 공급자 보강

### 기능 한글화 시 지켜야 할 순서

1. 번역 대상의 안정된 키와 스키마를 먼저 정의합니다.
2. Web의 `UiLanguage`, 저장 값, 브라우저 감지, 토글과 번역 사전을 함께 유지합니다.
3. 보고서의 언어 정규화, 설정 검증, Prompt, Jinja 렌더링, 알림과 fallback을 함께 유지합니다.
4. 기존 `zh`·`en` 동작을 유지하는 회귀 테스트와 `ko` 렌더링 테스트를 추가합니다.
5. UI·보고서 변경 PR에는 실제 화면 또는 보고서 스크린샷을 첨부합니다.

기능 개선은 한글화와 별개로 최소 단위로 진행하되, API/Schema·설정·Web·데스크톱·문서 사이의 계약을 한 번에 맞추는 것을 원칙으로 합니다.

## 🧪 개발과 검증

### 백엔드

```bash
python -m pip install -r requirements.txt
python -m pip install flake8 pytest
bash scripts/ci_gate.sh
```

`ci_gate.sh`는 Python 문법 검사, 치명적 flake8 규칙, 결정적 데이터 검사와 `network` marker를 제외한 pytest를 실행합니다.

### Web

```bash
cd apps/dsa-web
npm ci
npm run test
npm run lint
npm run build
```

필요한 변경에서는 `npm run test:smoke`로 Playwright E2E를 추가합니다.

### 데스크톱

```powershell
.\scripts\build-all.ps1
```

```bash
cd apps/dsa-desktop
npm test
```

기여 규칙, PR 절차와 검증 기준은 [AGENTS.md](AGENTS.md)와 [기여 가이드](docs/CONTRIBUTING.md)를 확인하세요.

## 📚 문서 안내

현재 세부 문서는 대부분 중국어 또는 영어이며, 실행 코드와 설정을 우선 기준으로 사용합니다.

| 목적 | 문서 |
| --- | --- |
| 전체 설정과 실행 방식 | [전체 가이드](docs/full-guide.md) |
| LLM 공급자와 다중 채널 | [LLM 설정 가이드](docs/LLM_CONFIG_GUIDE.md), [공급자 가이드](docs/llm-providers.md) |
| 알림 | [알림 기능](docs/notifications.md) |
| 배포 | [배포 가이드](docs/DEPLOY.md), [클라우드 WebUI](docs/deploy-webui-cloud.md) |
| 데스크톱 | [데스크톱 패키징](docs/desktop-package.md) |
| 시장별 지원 경계 | [시장 지원](docs/market-support.md) |
| AI 제안과 경보 | [DecisionSignal](docs/decision-signals.md), [경보 센터](docs/alerts.md) |
| API | [OpenAPI 스펙](docs/architecture/api_spec.json) |
| 문제 해결 | [FAQ](docs/FAQ.md), [변경 이력](docs/CHANGELOG.md) |
| 전체 문서 목록 | [문서 센터](docs/INDEX.md) |

## 🧩 관련 프로젝트

DSA는 일상 분석과 보고서에 집중합니다. 아래 프로젝트는 종목 선별과 전략 검증·진화를 보완하며 현재는 독립적으로 유지됩니다.

| 프로젝트 | 역할 |
| --- | --- |
| [AlphaSift](https://github.com/ZhuLinsen/alphasift) | 다중 요인 종목 선별과 전체 시장 스캔 |
| [AlphaEvo](https://github.com/ZhuLinsen/alphaevo) | 전략 백테스트, 규칙 검증과 반복적 파라미터 탐색 |

## 📬 문의와 협력

<table>
  <tr>
    <td width="92" valign="top"><strong>협력 이메일</strong></td>
    <td valign="top">
      <a href="mailto:zhuls345@gmail.com">zhuls345@gmail.com</a><br>
      원본 프로젝트 문의, 배포 지원과 기능 확장
    </td>
    <td align="center" rowspan="3" valign="middle" width="148">
      <a href="http://xhslink.com/m/tU520DWCKT" target="_blank"><img src="./docs/assets/xiaohongshu_tick.jpg" width="112" alt="Xiaohongshu QR 코드"></a><br>
      <sub>Xiaohongshu 팔로우</sub>
    </td>
  </tr>
  <tr>
    <td width="92" valign="top"><strong>원본 프로젝트</strong></td>
    <td valign="top"><a href="https://github.com/ZhuLinsen/daily_stock_analysis">ZhuLinsen/daily_stock_analysis</a></td>
  </tr>
  <tr>
    <td width="92" valign="top"><strong>문제 제보</strong></td>
    <td valign="top"><a href="https://github.com/joonhochoi/daily_stock_analysis/issues">현재 포크 Issue</a></td>
  </tr>
</table>

## 📄 라이선스

[MIT License](LICENSE) © 2026 ZhuLinsen

원본 프로젝트와 기여자의 저작권·라이선스를 존중합니다. 재배포하거나 2차 개발 결과를 공개할 때 저장소 출처를 밝혀 주세요.

## ⚠️ 면책 조항

이 프로젝트는 학습과 연구를 위한 도구이며 투자 자문을 제공하지 않습니다. 생성된 분석은 부정확하거나 지연될 수 있고, 모든 투자 판단과 결과의 책임은 사용자에게 있습니다.
